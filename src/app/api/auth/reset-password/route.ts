import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const { token, newPassword } = await req.json();

        // Hash del token recibido para comparar con el almacenado
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // Buscar usuario con token válido y no expirado
        const user = await prisma.user.findFirst({
            where: {
                resetToken: hashedToken,
                resetTokenExpiry: {
                    gt: new Date()
                }
            }
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid or expired reset token' },
                { status: 400 }
            );
        }

        // Hash de la nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Actualizar usuario con nueva contraseña y limpiar tokens
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null
            }
        });

        return NextResponse.json({
            message: 'Password successfully reset'
        });

    } catch (error) {
        console.error('Error resetting password:', error);
        return NextResponse.json(
            { error: 'Error resetting password' },
            { status: 500 }
        );
    }
} 