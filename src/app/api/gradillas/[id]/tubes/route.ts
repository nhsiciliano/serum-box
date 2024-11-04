import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    try {
        // Primero, verificamos si la gradilla pertenece al usuario actual
        const gradilla = await prisma.gradilla.findFirst({
            where: {
                id: params.id,
                userId: session.user.id
            }
        });

        if (!gradilla) {
            return NextResponse.json({ error: 'Gradilla no encontrada o no autorizada' }, { status: 404 });
        }

        // Obtenemos todos los tubos de la gradilla
        const tubes = await prisma.tube.findMany({
            where: {
                gradillaId: params.id
            }
        });

        return NextResponse.json(tubes);
    } catch (error) {
        console.error('Error al obtener los tubos:', error);
        return NextResponse.json({ error: 'Error al obtener los tubos' }, { status: 500 });
    }
}

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { position, data } = await req.json();

    try {
        // Verificamos si la gradilla pertenece al usuario actual
        const gradilla = await prisma.gradilla.findFirst({
            where: {
                id: params.id,
                userId: session.user.id
            }
        });

        if (!gradilla) {
            return NextResponse.json({ error: 'Gradilla no encontrada o no autorizada' }, { status: 404 });
        }

        const tube = await prisma.tube.create({
            data: {
                position,
                data,
                gradilla: { connect: { id: params.id } }
            }
        });

        return NextResponse.json(tube);
    } catch (error) {
        console.error('Error al añadir el tubo:', error);
        return NextResponse.json({ error: 'Error al añadir el tubo' }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    try {
        // Verificamos si la gradilla pertenece al usuario actual
        const gradilla = await prisma.gradilla.findFirst({
            where: {
                id: params.id,
                userId: session.user.id
            }
        });

        if (!gradilla) {
            return NextResponse.json({ error: 'Gradilla no encontrada o no autorizada' }, { status: 404 });
        }

        // Eliminamos todos los tubos de la gradilla
        await prisma.tube.deleteMany({
            where: {
                gradillaId: params.id
            }
        });

        return NextResponse.json({ message: 'Todos los tubos han sido eliminados de la gradilla' });
    } catch (error) {
        console.error('Error al vaciar la gradilla:', error);
        return NextResponse.json({ error: 'Error al vaciar la gradilla' }, { status: 500 });
    }
}

