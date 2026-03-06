import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    try {
        const body = await req.json().catch(() => ({}));

        const stock = await prisma.stock.findFirst({
            where: { 
                id: params.id,
                userId: session.user.id
            }
        });

        if (!stock) {
            return NextResponse.json({ error: 'Stock not found' }, { status: 404 });
        }

        const usageStartedAt = body?.usageStartedAt ? new Date(body.usageStartedAt) : stock.entryDate;
        const usageEndedAt = body?.usageEndedAt ? new Date(body.usageEndedAt) : new Date();

        if (Number.isNaN(usageStartedAt.getTime()) || Number.isNaN(usageEndedAt.getTime())) {
            return NextResponse.json({ error: 'Fechas inválidas' }, { status: 400 });
        }

        if (usageStartedAt > usageEndedAt) {
            return NextResponse.json({ error: 'La fecha de inicio no puede ser posterior a la fecha final' }, { status: 400 });
        }

        const durationDays = Math.floor(
            (usageEndedAt.getTime() - usageStartedAt.getTime()) / (1000 * 60 * 60 * 24)
        );

        const updatedStock = await prisma.stock.update({
            where: { id: params.id },
            data: {
                isActive: false,
                entryDate: usageStartedAt,
                disposalDate: usageEndedAt,
                durationDays
            }
        });

        return NextResponse.json({ 
            success: true,
            stock: updatedStock 
        });
    } catch (error) {
        console.error('Error disposing stock:', error);
        return NextResponse.json({ 
            success: false,
            error: 'Error disposing stock' 
        }, { status: 500 });
    }
} 
