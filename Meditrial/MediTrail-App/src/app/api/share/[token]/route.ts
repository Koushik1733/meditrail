import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-client';

export async function GET(req: Request, { params }: { params: { token: string } }) {
  try {
    const token = params.token;
    
    if (!token) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    // 1. Fetch and validate the token
    const { data: session, error: sessionError } = await supabase
      .from('sharing_sessions')
      .select('*, patient_profiles(full_name, date_of_birth)')
      .eq('sharing_token', token)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found or invalid' }, { status: 404 });
    }

    // 2. Security Check: Expiration and Revocation
    if (session.is_revoked) {
      return NextResponse.json({ error: 'This sharing link has been revoked by the patient.' }, { status: 403 });
    }

    if (new Date(session.expires_at) < new Date()) {
      return NextResponse.json({ error: 'This sharing link has expired.' }, { status: 403 });
    }

    // 3. Fetch ONLY the authorized records based on session.permissions
    let records = [];
    if (session.permissions.timeline) {
      const { data } = await supabase
        .from('medical_records')
        .select('*')
        .eq('patient_id', session.patient_id)
        .eq('is_verified', true)
        .order('record_date', { ascending: false });
      records = data || [];
    }

    // 4. Audit Log (Fire and forget)
    await supabase.from('access_audit_logs').insert({
      session_id: session.id,
      patient_id: session.patient_id,
      action: 'VIEW_RECORDS',
      success: true
    });

    return NextResponse.json({
      success: true,
      patient: session.patient_profiles,
      expiresAt: session.expires_at,
      records
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
