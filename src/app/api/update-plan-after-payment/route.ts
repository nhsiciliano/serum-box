import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { PLAN_LIMITS } from '@/types/plans';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { planType, stripeSubscriptionId, customerId } = await req.json();

        // Obtener los límites del plan seleccionado
        const planLimits = PLAN_LIMITS[planType as keyof typeof PLAN_LIMITS];

        // Actualizar el usuario con el nuevo plan y sus límites
        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                planType,
                stripeSubscriptionId,
                stripeCustomerId: customerId,
                planStartDate: new Date(),
                ...planLimits
            }
        });

        // Registrar en audit log
        await prisma.auditLog.create({
            data: {
                action: 'PLAN_UPGRADE',
                entityType: 'USER',
                entityId: session.user.id,
                details: {
                    previousPlan: 'free',
                    newPlan: planType,
                    userId: session.user.id
                },
                userId: session.user.id
            }
        });

        return NextResponse.json({
            success: true,
            user: updatedUser
        });
    } catch (error) {
        console.error('Error updating plan:', error);
        return NextResponse.json({ error: 'Error updating plan' }, { status: 500 });
    }
} 