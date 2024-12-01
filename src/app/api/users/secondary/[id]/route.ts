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
        // Verificar que el usuario a eliminar es secundario y pertenece al usuario principal
        const userToDelete = await prisma.user.findFirst({
            where: {
                id: params.id,
                mainUserId: session.user.id,
                isMainUser: false
            }
        });

        if (!userToDelete) {
            return NextResponse.json({ error: 'Usuario no encontrado o no autorizado' }, { status: 404 });
        }

        // Eliminar el usuario secundario
        await prisma.user.delete({
            where: {
                id: params.id
            }
        });

        // Registrar en audit log
        await prisma.auditLog.create({
            data: {
                action: 'DELETE_SECONDARY_USER',
                entityType: 'USER',
                entityId: params.id,
                details: {
                    deletedUser: {
                        id: userToDelete.id,
                        email: userToDelete.email,
                        name: userToDelete.name
                    }
                },
                userId: session.user.id
            }
        });

        return NextResponse.json({ 
            success: true,
            message: 'Secondary user successfully deleted'
        });
    } catch (error) {
        console.error('Error deleting secondary user:', error);
        return NextResponse.json({ error: 'Error deleting secondary user' }, { status: 500 });
    }
} 