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

        const totalTubes = await prisma.tube.count({
            where: { userId },
        });

        // Placeholder for low inventory and expiring soon logic
        const lowInventory = 0; // Replace with actual logic
        const expiringSoon = 0; // Replace with actual logic

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
