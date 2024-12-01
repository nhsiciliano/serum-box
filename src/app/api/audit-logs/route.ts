import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { Prisma } from '@prisma/client';

interface AuditDetails {
    activeUser?: {
        name: string;
        email: string;
        isMainUser: boolean;
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    try {
        const searchParams = new URL(req.url).searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const entityType = searchParams.get('entityType');

        // Obtener todos los usuarios secundarios asociados al usuario principal
        const associatedUsers = await prisma.user.findMany({
            where: {
                OR: [
                    { id: session.user.id },
                    { mainUserId: session.user.id }
                ]
            },
            select: { id: true }
        });

        const userIds = associatedUsers.map(user => user.id);

        const where: Prisma.AuditLogWhereInput = {
            userId: { in: userIds },
            ...(entityType ? { entityType } : {})
        };

        const [logs, total] = await Promise.all([
            prisma.auditLog.findMany({
                where,
                include: {
                    user: {
                        select: { 
                            name: true, 
                            email: true,
                            isMainUser: true,
                            mainUserId: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            }) as any as (Prisma.AuditLogGetPayload<{ include: { user: true } }> & { details: AuditDetails })[],
            prisma.auditLog.count({ where })
        ]);

        // Formatear los logs para incluir información clara del usuario que realizó la acción
        const formattedLogs = logs.map(log => ({
            ...log,
            appliedBy: log.details?.activeUser?.name || log.user.name,
            isSecondaryUser: !log.user.isMainUser,
            mainUserId: log.user.mainUserId
        }));

        return NextResponse.json({
            logs: formattedLogs,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: page,
                limit
            }
        });
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        return NextResponse.json({ error: 'Error fetching audit logs' }, { status: 500 });
    }
}
