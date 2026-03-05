import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const DAYS_THRESHOLD = 60;

type ExpiringItem = {
  reagentId: string;
  reagentName: string;
  nearestExpirationDate: string;
  daysRemaining: number;
  lotNumber: string;
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const thresholdDate = new Date(startOfToday);
    thresholdDate.setDate(startOfToday.getDate() + DAYS_THRESHOLD);
    thresholdDate.setHours(23, 59, 59, 999);

    const expiringStocks = await prisma.stock.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
        expirationDate: {
          gte: startOfToday,
          lte: thresholdDate,
        },
      },
      include: {
        reagent: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        expirationDate: 'asc',
      },
    });

    const uniqueByReagent = new Map<string, ExpiringItem>();

    for (const stock of expiringStocks) {
      if (!uniqueByReagent.has(stock.reagentId)) {
        const msPerDay = 1000 * 60 * 60 * 24;
        const daysRemaining = Math.ceil(
          (stock.expirationDate.getTime() - startOfToday.getTime()) / msPerDay
        );

        uniqueByReagent.set(stock.reagentId, {
          reagentId: stock.reagent.id,
          reagentName: stock.reagent.name,
          nearestExpirationDate: stock.expirationDate.toISOString(),
          daysRemaining,
          lotNumber: stock.lotNumber,
        });
      }
    }

    const items = Array.from(uniqueByReagent.values());
    const count = items.length;
    const signature =
      count === 0
        ? 'none'
        : items
            .map((item) => `${item.reagentId}:${item.nearestExpirationDate}:${item.lotNumber}`)
            .join('|');

    const message =
      count === 0
        ? 'No tenés reactivos próximos a vencer.'
        : count === 1
          ? 'Tenés 1 reactivo próximo a vencer.'
          : `Tenés ${count} reactivos próximos a vencer.`;

    return NextResponse.json({
      count,
      thresholdDays: DAYS_THRESHOLD,
      message,
      signature,
      items,
    });
  } catch (error) {
    console.error('[EXPIRING_REAGENTS_NOTIFICATION_API]', error);
    return NextResponse.json(
      { error: 'No se pudieron obtener las notificaciones de vencimiento' },
      { status: 500 }
    );
  }
}
