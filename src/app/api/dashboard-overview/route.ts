import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const userId = session.user.id;

        const totalGrids = await prisma.gradilla.count({
            where: { userId },
        });

        const grids = await prisma.gradilla.findMany({
            where: { userId },
            include: {
                tubes: {
                    select: { id: true }
                }
            }
        });

        const totalTubes = grids.reduce((sum, grid) => sum + grid.tubes.length, 0);

        const reagentsWithStock = await prisma.reagent.findMany({
            where: { userId },
            include: {
                stocks: {
                    where: { isActive: true },
                    select: { quantity: true },
                },
            },
        });

        const lowInventory = reagentsWithStock.filter(reagent => {
            const totalStock = reagent.stocks.reduce((sum, stock) => sum + stock.quantity, 0);
            return reagent.lowStockAlert && reagent.lowStockAlert > 0 && totalStock <= reagent.lowStockAlert;
        }).length;

        const today = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(today.getDate() + 30);

        const expiringSoon = await prisma.stock.count({
            where: {
                userId,
                isActive: true,
                expirationDate: {
                    gte: today,
                    lte: thirtyDaysFromNow,
                },
            },
        });

        return NextResponse.json({
            totalGrids,
            totalTubes,
            lowInventory,
            expiringSoon,
        });

    } catch (error) {
        console.error('[DASHBOARD_OVERVIEW_API]', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
