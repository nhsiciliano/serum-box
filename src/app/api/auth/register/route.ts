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

        // Crear usuario con plan Premium de prueba
        const user = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                planType: 'premium',
                planStartDate: new Date(),
                ...PLAN_LIMITS.premium
            }
        });

        return NextResponse.json({ 
            message: 'Usuario registrado exitosamente con período de prueba Premium', 
            user 
        }, { status: 201 });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        return NextResponse.json({ message: 'Error al registrar usuario' }, { status: 500 });
    }
}
