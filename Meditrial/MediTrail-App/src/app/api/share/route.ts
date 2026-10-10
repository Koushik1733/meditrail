import { NextResponse } from 'next/server';
import { supabase, getSession } from '@/lib/supabase-client';
import crypto from 'crypto';

export async function POST(req: Request) {
    try {
        const user = await getSession(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { doctorEmail, expiryHours, permissions } = await req.json();

        // Security Audit Fix: Generate cryptographically secure token
        const rawToken = crypto.randomBytes(32).toString('hex');
        
        // Calculate expiration
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + expiryHours);

        const { data, error } = await supabase
            .from('sharing_sessions')
            .insert({
                patient_id: user.id,
                doctor_email: doctorEmail,
                sharing_token: rawToken, // In a production app, store a hash of this token
                expires_at: expiresAt.toISOString(),
                is_revoked: false,
                permissions: permissions
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ 
            success: true, 
            shareUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/shared/${rawToken}`,
            expiresAt: expiresAt 
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
