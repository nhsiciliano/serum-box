import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function POST(req: Request) {
    try {
        const { email, verificationCode } = await req.json();

        // Buscar el usuario por email
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
        }

        // Verificar si el código de verificación coincide
        if (user.verificationCode !== verificationCode) {
            return NextResponse.json({ message: 'Código de verificación inválido' }, { status: 400 });
        }

        // Si el código es correcto, actualizar el usuario como verificado
        await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: true,
                verificationCode: null, // Opcional: limpiar el código de verificación después de usarlo
            },
        });

        return NextResponse.json({ message: 'Correo electrónico verificado exitosamente' }, { status: 200 });
    } catch (error) {
        console.error('Error al verificar el correo electrónico:', error);
        return NextResponse.json({ message: 'Error al verificar el correo electrónico' }, { status: 500 });
    }
}
