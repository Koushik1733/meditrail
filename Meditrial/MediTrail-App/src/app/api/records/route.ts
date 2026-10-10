import { NextResponse } from 'next/server';
import { supabase, getSession } from '@/lib/supabase-client';

export async function POST(req: Request) {
    try {
        const user = await getSession(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { documentId, recordType, date, provider, results } = body;

        // Security Audit Fix: Explicitly bind the patient_id to the authenticated user's ID
        // This prevents users from passing arbitrary patient IDs in the request body
        const { data: record, error: recordError } = await supabase
            .from('medical_records')
            .insert({
                patient_id: user.id,
                document_id: documentId,
                record_type: recordType,
                record_date: date,
                provider_name: provider,
                is_verified: true // Patient explicitly confirmed
            })
            .select()
            .single();

        if (recordError) throw recordError;

        // Insert extracted results (e.g., Lab tests or medications)
        if (results && results.length > 0) {
            // ... insert logic for child tables
        }

        return NextResponse.json({ success: true, record }, { status: 201 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
