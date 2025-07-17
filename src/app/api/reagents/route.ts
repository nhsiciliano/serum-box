import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    try {
        const reagents = await prisma.reagent.findMany({
            where: { userId: session.user.id },
            include: {
                stocks: {
                    where: { isActive: true }
                } 
            },
            orderBy: { name: 'asc' }
        });

        const reagentsWithStock = reagents.map(reagent => {
            const totalStock = reagent.stocks.reduce((sum, stock) => sum + stock.quantity, 0);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { stocks, ...reagentData } = reagent; 
            return {
                ...reagentData,
                totalStock
            };
        });

        return NextResponse.json(reagentsWithStock);
    } catch (error) {
        console.error('Error fetching reagents:', error);
        return NextResponse.json({ error: 'Error fetching reagents' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    try {
        const { name, description, unit, lowStockAlert } = await req.json();
        
        const reagent = await prisma.reagent.create({
            data: {
                name,
                description,
                unit,
                lowStockAlert: lowStockAlert ? parseInt(String(lowStockAlert), 10) : 0,
                userId: session.user.id
            }
        });

        return NextResponse.json(reagent);
    } catch (error) {
        console.error('Error creating reagent:', error);
        return NextResponse.json({ error: 'Error creating reagent' }, { status: 500 });
    }
} 