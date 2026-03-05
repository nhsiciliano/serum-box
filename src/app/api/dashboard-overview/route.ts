import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const EXPIRING_THRESHOLD_DAYS = 60;

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

        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const thresholdDate = new Date(startOfToday);
        thresholdDate.setDate(startOfToday.getDate() + EXPIRING_THRESHOLD_DAYS);
        thresholdDate.setHours(23, 59, 59, 999);

        const expiringSoon = await prisma.stock.count({
            where: {
                userId,
                isActive: true,
                expirationDate: {
                    gte: startOfToday,
                    lte: thresholdDate,
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
