import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { getActiveUserForAudit } from '@/lib/utils/audit';

export async function DELETE(
    req: Request,
    { params }: { params: { id: string; tubeId: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    try {
        const activeUser = await getActiveUserForAudit(req, session.user.id);
        if (!activeUser) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }

        // Verificar acceso a la gradilla para usuario principal y secundarios
        const gradilla = await prisma.gradilla.findFirst({
            where: {
                id: params.id,
                OR: [
                    { userId: session.user.id },
                    { user: { mainUserId: session.user.id } }
                ]
            }
        });

        if (!gradilla) {
            return NextResponse.json({ error: 'Gradilla no encontrada o no autorizada' }, { status: 404 });
        }

        // Verificar que el tubo existe y pertenece a la gradilla
        const tube = await prisma.tube.findFirst({
            where: {
                id: params.tubeId,
                gradillaId: params.id
            }
        });

        if (!tube) {
            return NextResponse.json({ error: 'Tubo no encontrado' }, { status: 404 });
        }

        // Eliminar el tubo
        await prisma.tube.delete({
            where: {
                id: params.tubeId
            }
        });

        // Registrar en audit log con más detalles
        await prisma.auditLog.create({
            data: {
                action: 'DELETE_TUBE',
                entityType: 'TUBE',
                entityId: params.tubeId,
                details: {
                    gridId: params.id,
                    tubeId: params.tubeId,
                    position: tube.position,
                    tubeData: tube.data,
                    activeUser: {
                        id: activeUser.id,
                        name: activeUser.name,
                        email: activeUser.email,
                        isMainUser: activeUser.isMainUser
                    }
                },
                userId: activeUser.id
            }
        });

        return NextResponse.json({ 
            success: true,
            message: 'Tube successfully removed',
            tubeId: params.tubeId
        });
    } catch (error) {
        console.error('Error al eliminar el tubo:', error);
        return NextResponse.json({ error: 'Error al eliminar el tubo' }, { status: 500 });
    }
}
