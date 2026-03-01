import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        const supabase = createSupabaseServerClient();
        await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.NEXT_PUBLIC_URL || process.env.NEXTAUTH_URL}/reset-password`,
        });

        return NextResponse.json({
            message: 'If this email exists, you will receive recovery instructions.'
        });

    } catch (error) {
        console.error('Error in password recovery:', error);
        return NextResponse.json(
            { error: 'Error processing password recovery request' },
            { status: 500 }
        );
    }
} 
