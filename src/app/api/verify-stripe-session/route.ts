import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-10-28.acacia'
});

export async function GET(req: Request) {
    const url = new URL(req.url);
    const sessionId = url.searchParams.get('session_id');

    if (!sessionId) {
        return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['subscription']
        });

        const subscription = session.subscription as Stripe.Subscription;

        return NextResponse.json({
            planType: session.metadata?.planType,
            subscriptionId: subscription?.id,
            customerId: session.customer
        });
    } catch (error) {
        console.error('Error verifying Stripe session:', error);
        return NextResponse.json({ error: 'Error verifying payment' }, { status: 500 });
    }
} 