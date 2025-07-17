import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { name, description, unit, lowStockAlert } = body;

        if (!name || !unit) {
            return NextResponse.json({ error: 'Name and unit are required' }, { status: 400 });
        }

        const reagent = await prisma.reagent.findFirst({
            where: {
                id: params.id,
                userId: session.user.id
            }
        });

        if (!reagent) {
            return NextResponse.json({ error: 'Reagent not found' }, { status: 404 });
        }

        const updatedReagent = await prisma.reagent.update({
            where: { id: params.id },
            data: {
                name,
                description,
                unit,
                lowStockAlert
            }
        });

        return NextResponse.json(updatedReagent);
    } catch (error) {
        console.error('Error updating reagent:', error);
        return NextResponse.json({ error: 'Error updating reagent' }, { status: 500 });
    }
}



export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    try {
        // Verificar si el reactivo existe y pertenece al usuario
        const reagent = await prisma.reagent.findFirst({
            where: {
                id: params.id,
                userId: session.user.id
            }
        });

        if (!reagent) {
            return NextResponse.json({ error: 'Reagent not found' }, { status: 404 });
        }

        // Primero eliminar todos los registros de stock asociados
        await prisma.stock.deleteMany({
            where: { reagentId: params.id }
        });

        // Luego eliminar el reactivo
        await prisma.reagent.delete({
            where: { id: params.id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting reagent:', error);
        return NextResponse.json({ error: 'Error deleting reagent' }, { status: 500 });
    }
} 