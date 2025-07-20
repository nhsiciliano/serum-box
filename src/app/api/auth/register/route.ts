import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import prisma from '@/lib/prisma';
import { PLAN_LIMITS } from '@/types/plans';

export async function POST(req: Request) {
    try {
        const { email, password, name } = await req.json();
        
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ message: 'El usuario ya existe' }, { status: 400 });
        }

        const hashedPassword = await hash(password, 10);

        const trialEndsAt = new Date();
        trialEndsAt.setDate(trialEndsAt.getDate() + 30);

        // Crear usuario con período de prueba de 30 días del plan Premium
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                planType: 'premium', // Asignar plan premium durante el trial
                planStartDate: new Date(),
                trialEndsAt: trialEndsAt, // Establecer la fecha de fin del trial
                isMainUser: true,
                ...PLAN_LIMITS.premium // Aplicar los límites del plan premium
            }
        });

        return NextResponse.json({ 
            message: 'Usuario registrado exitosamente', 
            user 
        }, { status: 201 });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        return NextResponse.json({ message: 'Error al registrar usuario' }, { status: 500 });
    }
}
