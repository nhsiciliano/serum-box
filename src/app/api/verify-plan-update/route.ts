import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { db } = await connectToDatabase();
        const user = await db.collection('User').findOne({
            _id: new ObjectId(session.user.id)
        });

        return NextResponse.json({
            success: true,
            planType: user?.planType,
            limits: {
                maxGrids: user?.maxGrids,
                maxTubes: user?.maxTubes,
                isUnlimited: user?.isUnlimited
            },
            subscription: {
                active: !!user?.stripeSubscriptionId,
                endDate: user?.planEndDate
            }
        });
    } catch (error) {
        console.error('Error verificando actualización:', error);
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}
