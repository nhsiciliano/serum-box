import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createSupabaseServerClient } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const { email, password, name } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ message: 'Email y password son requeridos' }, { status: 400 });
        }
        
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ message: 'El usuario ya existe' }, { status: 400 });
        }

        const supabase = createSupabaseServerClient();
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${process.env.NEXT_PUBLIC_URL || process.env.NEXTAUTH_URL}/login`,
                data: {
                    name,
                },
            },
        });

        if (error) {
            const normalizedMessage = error.message.toLowerCase();
            if (normalizedMessage.includes('already registered') || normalizedMessage.includes('already exists')) {
                return NextResponse.json({ message: 'El usuario ya existe' }, { status: 400 });
            }
            return NextResponse.json({ message: error.message }, { status: 400 });
        }

        const supabaseUser = data.user;

        if (!supabaseUser || !supabaseUser.email) {
            return NextResponse.json({ message: 'No se pudo crear el usuario en Supabase' }, { status: 500 });
        }

        const user = await prisma.user.create({
            data: {
                email: supabaseUser.email,
                supabaseAuthId: supabaseUser.id,
                name,
                isMainUser: true,
                maxGrids: 999999,
                maxTubes: 999999,
                isUnlimited: true,
                emailVerified: false,
            }
        });

        return NextResponse.json({ 
            message: 'Registro exitoso. Revisa tu correo para confirmar tu cuenta.',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            }
        }, { status: 201 });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        return NextResponse.json({ message: 'Error al registrar usuario' }, { status: 500 });
    }
}
