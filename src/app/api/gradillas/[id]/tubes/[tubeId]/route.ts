import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function DELETE(
    req: Request,
    { params }: { params: { id: string; tubeId: string } }
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

        // Luego, eliminamos el tubo
        const deletedTube = await prisma.tube.delete({
            where: {
                id: params.tubeId,
                gradillaId: params.id
            }
        });

        if (!deletedTube) {
            return NextResponse.json({ error: 'Tubo no encontrado' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Tubo eliminado con éxito' });
    } catch (error) {
        console.error('Error al eliminar el tubo:', error);
        return NextResponse.json({ error: 'Error al eliminar el tubo' }, { status: 500 });
    }
}
