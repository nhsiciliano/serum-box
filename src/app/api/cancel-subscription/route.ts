import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const PAYPAL_API = process.env.PAYPAL_ENV === 'production' 
    ? 'https://api-m.paypal.com' 
    : 'https://api-m.sandbox.paypal.com';

async function getAccessToken() {
    const auth = Buffer.from(
        `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET_KEY}`
    ).toString('base64');

    const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
        method: 'POST',
        body: 'grant_type=client_credentials',
        headers: {
            Authorization: `Basic ${auth}`,
        },
    });

    const data = await response.json();
    return data.access_token;
}

export async function POST() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { db } = await connectToDatabase();

        // Buscar el usuario y su suscripción actual
        const user = await db.collection('User').findOne({
            _id: new ObjectId(session.user.id)
        });

        if (!user) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }

        if (!user.paypalSubscriptionId) {
            return NextResponse.json({ error: 'No hay suscripción activa' }, { status: 400 });
        }

        // Obtener token de acceso de PayPal
        const accessToken = await getAccessToken();

        // Cancelar la suscripción en PayPal
        const cancelResponse = await fetch(
            `${PAYPAL_API}/v1/billing/subscriptions/${user.paypalSubscriptionId}/cancel`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    reason: 'User requested cancellation'
                }),
            }
        );

        if (!cancelResponse.ok) {
            const errorData = await cancelResponse.json();
            console.error('PayPal cancellation error:', errorData);
            throw new Error('Error al cancelar la suscripción en PayPal');
        }

        // Registrar la cancelación en la base de datos
        await db.collection('User').updateOne(
            { _id: new ObjectId(session.user.id) },
            {
                $set: {
                    subscriptionStatus: 'cancelled',
                    subscriptionCancelDate: new Date()
                }
            }
        );

        // Registrar en el historial de transacciones
        await db.collection('Transactions').insertOne({
            userId: new ObjectId(session.user.id),
            type: 'subscription_cancellation',
            status: 'completed',
            date: new Date(),
            paypalSubscriptionId: user.paypalSubscriptionId,
            details: {
                planType: user.planType,
                cancelDate: new Date(),
                effectiveEndDate: user.planEndDate
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Subscription cancelled successfully',
            effectiveEndDate: user.planEndDate
        });
    } catch (error) {
        console.error('Error cancelling subscription:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Error cancelling subscription' },
            { status: 500 }
        );
    }
} 