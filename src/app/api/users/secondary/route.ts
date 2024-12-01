/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { getActiveUserForAudit } from '@/lib/utils/audit';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    try {
        const mainUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { secondaryUsers: true }
        });

        if (!mainUser?.isMainUser) {
            console.log('Not main user:', mainUser);
            return NextResponse.json({ 
                error: 'Only main users can view secondary users',
                details: 'The current user is not a main user'
            }, { status: 403 });
        }

        return NextResponse.json(mainUser.secondaryUsers);
    } catch (error) {
        console.error('Error to get secondary users:', error);
        return NextResponse.json({ error: 'Error to get secondary users' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { email, name } = await req.json();

    try {
        const mainUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { secondaryUsers: true }
        });

        if (!mainUser?.isMainUser) {
            console.log('Not main user:', mainUser);
            return NextResponse.json({ 
                error: 'Only main users can create secondary users',
                details: 'The current user is not a main user'
            }, { status: 403 });
        }

        if (mainUser.secondaryUsers.length >= 4) {
            return NextResponse.json({ error: 'Secondary users limit reached' }, { status: 400 });
        }

        const newUser = await prisma.user.create({
            data: {
                email,
                name,
                mainUserId: session.user.id,
                isMainUser: false
            }
        });

        // Aquí iría la lógica para enviar el email de invitación

        // Registrar en el log de auditoría
        const activeUser = await getActiveUserForAudit(req, session.user.id);

        await prisma.auditLog.create({
            data: {
                action: 'CREATE_SECONDARY_USER',
                entityType: 'USER',
                entityId: newUser.id,
                details: { 
                    email, 
                    name,
                    activeUser
                },
                userId: session.user.id
            }
        });

        return NextResponse.json(newUser);
    } catch (error) {
        console.error('Error to create secondary user:', error);
        return NextResponse.json({ error: 'Error to create secondary user' }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const mainUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { secondaryUsers: true }
        });

        if (!mainUser?.isMainUser) {
            console.log('Usuario no es principal:', mainUser);
            return NextResponse.json({ 
                error: 'Only main users can delete secondary users',
                details: 'The current user is not a main user'
            }, { status: 403 });
        }

        const secondaryUser = mainUser.secondaryUsers.find(user => user.id === params.id);
        if (!secondaryUser) {
            return NextResponse.json({ error: 'Secondary user not found' }, { status: 404 });
        }

        await prisma.user.delete({
            where: { id: params.id }
        });

        // Registrar en el log de auditoría
        const activeUser = await getActiveUserForAudit(req, session.user.id);

        await prisma.auditLog.create({
            data: {
                action: 'DELETE_SECONDARY_USER',
                entityType: 'USER',
                entityId: params.id,
                details: { 
                    email: secondaryUser.email, 
                    name: secondaryUser.name,
                    activeUser
                },
                userId: session.user.id
            }
        });

        return NextResponse.json({ message: 'Secondary user deleted successfully' });
    } catch (error) {
        console.error('Error to delete secondary user:', error);
        return NextResponse.json({ error: 'Error to delete secondary user' }, { status: 500 });
    }
}