import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { name, rows, columns, fields } = await req.json();

    try {
        const gradilla = await prisma.gradilla.create({
            data: {
                name,
                rows: rows as string[],
                columns: columns as number[],
                fields: fields as string[],
                userId: session.user.id,
            },
        });
        return NextResponse.json(gradilla);
    } catch (error) {
        console.error('Error al crear la gradilla:', error);
        return NextResponse.json({ error: 'Error al crear la gradilla' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    try {
        if (id) {
            const gradilla = await prisma.gradilla.findUnique({
                where: { 
                    id: id,
                    userId: session.user.id 
                },
                include: { tubes: true },
            });
            if (!gradilla) {
                return NextResponse.json({ error: 'Gradilla no encontrada' }, { status: 404 });
            }
            return NextResponse.json(gradilla);
        } else {
            const gradillas = await prisma.gradilla.findMany({
                where: { userId: session.user.id },
                include: { tubes: true },
            });
            return NextResponse.json(gradillas);
        }
    } catch (error) {
        console.error('Error al obtener las gradillas:', error);
        return NextResponse.json({ error: 'Error al obtener las gradillas' }, { status: 500 });
    }
}
