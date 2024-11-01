import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

// Asegúrate de que la clave secreta de Stripe esté definida
if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('La clave secreta de Stripe no está definida');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-09-30.acacia',
});

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const { priceId, planType, duration } = await req.json();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        // Calcular fecha de fin del plan
        const planEndDate = new Date();
        planEndDate.setMonth(planEndDate.getMonth() + duration);

        const checkoutSession = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard/admin-cuenta?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_URL}/dashboard/admin-cuenta?canceled=true`,
            client_reference_id: session.user.id,
            metadata: {
                planType,
                duration: duration.toString(),
                planEndDate: planEndDate.toISOString()
            }
        });

        return NextResponse.json({ sessionId: checkoutSession.id });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json(
            { error: 'Error al crear la sesión de checkout' }, 
            { status: 500 }
        );
    }
}
