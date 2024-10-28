import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Asegúrate de que la clave secreta de Stripe esté definida
if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('La clave secreta de Stripe no está definida');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-09-30.acacia',
});

export async function POST(req: Request) {
    try {
        const { priceId } = await req.json();

        if (!priceId) {
            return NextResponse.json({ error: 'priceId es requerido' }, { status: 400 });
        }

        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${process.env.NEXT_PUBLIC_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_URL}/cancel`,
        });

        return NextResponse.json({ sessionId: session.id });
    } catch (err) {
        console.error('Error al crear la sesión de checkout:', err);
        return NextResponse.json({ error: 'Error al crear la sesión de checkout' }, { status: 500 });
    }
}
