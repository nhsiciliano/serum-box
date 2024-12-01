import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { getActiveUserForAudit } from '@/lib/utils/audit';

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    try {
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
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    try {
        // Log headers para debugging
        console.log('Headers in tube creation:', Object.fromEntries(req.headers.entries()));
        
        const activeUser = await getActiveUserForAudit(req, session.user.id);
        if (!activeUser) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }

        // Verificar acceso a la gradilla
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

        const { position, data } = await req.json();

        // Asegurarnos de que data tenga todos los campos necesarios
        const tube = await prisma.tube.create({
            data: {
                position,
                data: data || {},
                gradillaId: params.id,
                userId: activeUser.id
            }
        });

        await prisma.auditLog.create({
            data: {
                action: 'CREATE_TUBE',
                entityType: 'TUBE',
                entityId: tube.id,
                details: {
                    position,
                    data,
                    gradillaId: params.id,
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
            message: 'Tube successfully created',
            tube: {
                id: tube.id,
                position: tube.position,
                data: tube.data || {},
                gradillaId: tube.gradillaId
            }
        });
    } catch (error) {
        console.error('Error creating tube:', error);
        return NextResponse.json({ error: 'Error creating tube' }, { status: 500 });
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
        const activeUser = await getActiveUserForAudit(req, session.user.id);
        if (!activeUser) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }

        // Verificar acceso a la gradilla
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

        // Eliminar todos los tubos
        await prisma.tube.deleteMany({
            where: { gradillaId: params.id }
        });

        // Registrar en audit log con el usuario activo
        await prisma.auditLog.create({
            data: {
                action: 'EMPTY_GRID',
                entityType: 'GRID',
                entityId: params.id,
                details: {
                    action: 'Removed all tubes',
                    activeUser: {
                        id: activeUser.id,
                        name: activeUser.name,
                        email: activeUser.email,
                        isMainUser: activeUser.isMainUser
                    }
                },
                userId: activeUser.id  // Usar el ID del usuario activo
            }
        });

        return NextResponse.json({ message: 'Todos los tubos han sido eliminados de la gradilla' });
    } catch (error) {
        console.error('Error al vaciar la gradilla:', error);
        return NextResponse.json({ error: 'Error al vaciar la gradilla' }, { status: 500 });
    }
}

