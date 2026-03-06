import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

type UsageHistoryItem = {
  id: string;
  reagentId: string;
  reagentName: string;
  lotNumber: string;
  usageStartedAt: string;
  usageEndedAt: string;
  disposedUnits: number;
  performanceDays: number;
};

type TotalsByReagentItem = {
  reagentId: string;
  reagentName: string;
  disposedUnits: number;
};

const getMonthRange = (monthValue?: string) => {
  if (!monthValue || !/^\d{4}-\d{2}$/.test(monthValue)) {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return { start, end };
  }

  const [yearString, monthString] = monthValue.split('-');
  const year = Number(yearString);
  const month = Number(monthString) - 1;

  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999);

  return { start, end };
};

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const month = request.nextUrl.searchParams.get('month') ?? undefined;
    const { start, end } = getMonthRange(month);

    const disposedStocks = await prisma.stock.findMany({
      where: {
        userId: session.user.id,
        isActive: false,
        disposalDate: {
          gte: start,
          lte: end,
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
        disposalDate: 'desc',
      },
    });

    const totalsByReagentMap = new Map<string, TotalsByReagentItem>();

    const items: UsageHistoryItem[] = disposedStocks
      .filter((stock) => Boolean(stock.disposalDate))
      .map((stock) => {
        const usageStartedAt = stock.entryDate;
        const usageEndedAt = stock.disposalDate || stock.entryDate;
        const performanceDays = Math.max(
          0,
          Math.floor((usageEndedAt.getTime() - usageStartedAt.getTime()) / (1000 * 60 * 60 * 24))
        );

        const currentTotal = totalsByReagentMap.get(stock.reagentId);
        if (!currentTotal) {
          totalsByReagentMap.set(stock.reagentId, {
            reagentId: stock.reagent.id,
            reagentName: stock.reagent.name,
            disposedUnits: stock.quantity,
          });
        } else {
          totalsByReagentMap.set(stock.reagentId, {
            ...currentTotal,
            disposedUnits: currentTotal.disposedUnits + stock.quantity,
          });
        }

        return {
          id: stock.id,
          reagentId: stock.reagent.id,
          reagentName: stock.reagent.name,
          lotNumber: stock.lotNumber,
          usageStartedAt: usageStartedAt.toISOString(),
          usageEndedAt: usageEndedAt.toISOString(),
          disposedUnits: stock.quantity,
          performanceDays,
        };
      });

    const totalsByReagent = Array.from(totalsByReagentMap.values()).sort((a, b) =>
      a.reagentName.localeCompare(b.reagentName)
    );

    return NextResponse.json({
      month: month ?? start.toISOString().slice(0, 7),
      items,
      totalsByReagent,
    });
  } catch (error) {
    console.error('[STOCK_USAGE_HISTORY_API]', error);
    return NextResponse.json(
      { error: 'No se pudo obtener el historial de uso mensual' },
      { status: 500 }
    );
  }
}
