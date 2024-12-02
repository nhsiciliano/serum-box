import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendPasswordRecoveryEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        // Verificar si el usuario existe
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return NextResponse.json(
                { message: 'If this email exists, you will receive recovery instructions.' },
                { status: 200 }
            );
        }

        // Generar token de recuperación
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora

        // Guardar el token hasheado en la base de datos
        const hashedToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        await prisma.user.update({
            where: { email },
            data: {
                resetToken: hashedToken,
                resetTokenExpiry
            }
        });

        // Enviar email con el token
        await sendPasswordRecoveryEmail(email, resetToken);

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