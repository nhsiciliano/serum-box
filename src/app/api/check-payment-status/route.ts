import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
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

        if (!user) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }

        return NextResponse.json({
            planType: user.planType,
            isActive: !user.lastPaymentFailed,
            subscription: {
                status: user.stripeSubscriptionId ? 'active' : 'none',
                endDate: user.planEndDate
            }
        });
    } catch (error) {
        console.error('Error al verificar estado del pago:', error);
        return NextResponse.json(
            { error: 'Error al verificar estado del pago' },
            { status: 500 }
        );
    }
}
