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
        const stocks = await prisma.stock.findMany({
            where: { userId: session.user.id },
            include: {
                reagent: {
                    select: {
                        name: true,
                        unit: true
                    }
                }
            },
            orderBy: { entryDate: 'desc' }
        });

        return NextResponse.json(stocks);
    } catch (error) {
        console.error('Error fetching stocks:', error);
        return NextResponse.json({ error: 'Error fetching stocks' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    try {
        const { reagentId, quantity, lotNumber, expirationDate, notes } = await req.json();
        const stocks = [];

        // Crear múltiples entradas de stock basadas en la cantidad
        for (let i = 0; i < quantity; i++) {
            const stock = await prisma.stock.create({
                data: {
                    reagentId,
                    quantity: 1, // Cada entrada individual tiene cantidad 1
                    lotNumber,
                    expirationDate: new Date(expirationDate),
                    notes,
                    userId: session.user.id
                },
                include: {
                    reagent: {
                        select: {
                            name: true,
                            unit: true
                        }
                    }
                }
            });
            stocks.push(stock);
        }

        return NextResponse.json(stocks);
    } catch (error) {
        console.error('Error creating stock:', error);
        return NextResponse.json({ error: 'Error creating stock' }, { status: 500 });
    }
} 