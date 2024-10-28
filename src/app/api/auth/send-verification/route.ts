import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateVerificationCode } from '@/lib/utils';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();
        const verificationCode = generateVerificationCode();

        // Actualizar usuario con el código de verificación
        await prisma.user.update({
            where: { email },
            data: { 
                verificationCode,
                emailVerified: false
            }
        });

        // Enviar email con el código
        await sendVerificationEmail(email, verificationCode);

        return NextResponse.json({ 
            message: 'Código de verificación enviado' 
        });
    } catch (error) {
        console.error('Error al enviar código de verificación:', error);
        return NextResponse.json(
            { error: 'Error al enviar código de verificación' },
            { status: 500 }
        );
    }
}
