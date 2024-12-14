import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    try {
        const stock = await prisma.stock.findFirst({
            where: { 
                id: params.id,
                userId: session.user.id
            }
        });

        if (!stock) {
            return NextResponse.json({ error: 'Stock not found' }, { status: 404 });
        }

        const disposalDate = new Date();
        const durationDays = Math.floor(
            (disposalDate.getTime() - stock.entryDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        const updatedStock = await prisma.stock.update({
            where: { id: params.id },
            data: {
                isActive: false,
                disposalDate,
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