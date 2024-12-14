import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

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