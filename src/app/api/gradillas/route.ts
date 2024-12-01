import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { getActiveUserForAudit } from '@/lib/utils/audit';

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { name, rows, columns, fields, description, storagePlace, temperature } = await req.json();

    try {
        const activeUser = await getActiveUserForAudit(req, session.user.id);
        if (!activeUser) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }

        const gradilla = await prisma.gradilla.create({
            data: {
                name,
                description,
                storagePlace,
                temperature,
                rows: rows as string[],
                columns: columns as number[],
                fields: fields as string[],
                userId: activeUser.id,
            },
        });

        await prisma.auditLog.create({
            data: {
                action: 'CREATE_GRID',
                entityType: 'GRID',
                entityId: gradilla.id,
                details: {
                    name,
                    description,
                    storagePlace,
                    temperature,
                    rowCount: rows.length,
                    columnCount: columns.length,
                    activeUser
                },
                userId: activeUser?.id || session.user.id
            }
        });

        return NextResponse.json(gradilla);
    } catch (error) {
        console.error('Error al crear la gradilla:', error);
        return NextResponse.json({ error: 'Error al crear la gradilla' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    try {
        const includeSecondary = req.headers.get('x-include-secondary') === 'true';
        
        if (!session.user.id || session.user.id.length !== 24) {
            return NextResponse.json({ error: 'ID de usuario inválido' }, { status: 400 });
        }

        const userIds = [session.user.id];

        if (includeSecondary) {
            const secondaryUsers = await prisma.user.findMany({
                where: {
                    AND: [
                        { mainUserId: session.user.id },
                        { id: { not: undefined } },
                        { isMainUser: false }
                    ]
                },
                select: { id: true }
            });

            const validSecondaryIds = secondaryUsers
                .map(user => user.id)
                .filter(id => id && typeof id === 'string' && id.length === 24);
            
            userIds.push(...validSecondaryIds);
        }

        if (userIds.length === 0) {
            return NextResponse.json({ error: 'No hay usuarios válidos' }, { status: 400 });
        }

        const gradillas = await prisma.gradilla.findMany({
            where: {
                AND: [
                    { userId: { in: userIds } },
                    { userId: { not: undefined } }
                ]
            },
            include: { 
                tubes: true,
                user: {
                    select: {
                        name: true,
                        email: true,
                        isMainUser: true
                    }
                }
            },
        });

        return NextResponse.json(gradillas);
    } catch (error) {
        console.error('Error al obtener las gradillas:', error);
        return NextResponse.json({ error: 'Error al obtener las gradillas' }, { status: 500 });
    }
}
