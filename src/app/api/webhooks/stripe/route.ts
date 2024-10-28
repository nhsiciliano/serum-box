import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';


if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('La variable de entorno STRIPE_SECRET_KEY no está definida');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-09-30.acacia',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
    const payload = await req.text();
    const sig = req.headers.get('stripe-signature');

    if (!sig || !endpointSecret) {
        return NextResponse.json(
            { error: 'Falta stripe-signature o webhook secret' },
            { status: 400 }
        );
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    } catch (error) {
        console.error('Error al verificar webhook:', error instanceof Error ? error.message : 'Error desconocido');
        return NextResponse.json(
            { error: 'Error al verificar webhook' },
            { status: 400 }
        );
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;

                if (!session.client_reference_id) {
                    throw new Error('No se encontró client_reference_id en la sesión');
                }

                const updateData: Prisma.UserUpdateInput = {
                    planType: session.metadata?.planType as 'free' | 'standard' | 'premium' || 'standard',
                    planStartDate: new Date(),
                    planEndDate: session.metadata?.planEndDate 
                        ? new Date(session.metadata.planEndDate) 
                        : null,
                    stripeCustomerId: typeof session.customer === 'string' 
                        ? session.customer 
                        : session.customer?.toString()
                };

                await prisma.user.update({
                    where: { id: session.client_reference_id },
                    data: updateData
                });
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                if (subscription.customer) {
                    const customerId = typeof subscription.customer === 'string' 
                        ? subscription.customer 
                        : subscription.customer.id;
                    
                    const user = await prisma.user.findFirst({
                        where: { stripeCustomerId: customerId }
                    });

                    if (user) {
                        // Implementar lógica de actualización si es necesario
                        console.log('Subscription updated for user:', user.id);
                    }
                }
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                const customerId = typeof subscription.customer === 'string' 
                    ? subscription.customer 
                    : subscription.customer.id;

                await prisma.user.updateMany({
                    where: { stripeCustomerId: customerId },
                    data: {
                        planType: 'free',
                        planEndDate: new Date()
                    }
                });
                break;
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Error procesando webhook:', error instanceof Error ? error.message : 'Error desconocido');
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
