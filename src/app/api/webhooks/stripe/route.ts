import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Stripe from 'stripe';
import { ObjectId } from 'mongodb';
import { PLAN_LIMITS, PlanType } from '@/types/plans';

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY no está definida');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-09-30.acacia',
});

export async function POST(req: Request) {
    const payload = await req.text();
    const sig = req.headers.get('stripe-signature')!;
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            payload,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err) {
        console.error('Error al verificar webhook:', err);
        return NextResponse.json({ error: 'Webhook error' }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                
                if (!session.client_reference_id) {
                    throw new Error('No se encontró client_reference_id');
                }

                const planType = (session.metadata?.planType as PlanType) || 'standard';
                const limits = PLAN_LIMITS[planType];

                await db.collection('User').updateOne(
                    { _id: new ObjectId(session.client_reference_id) },
                    {
                        $set: {
                            planType: planType,
                            planStartDate: new Date(),
                            planEndDate: session.metadata?.planEndDate 
                                ? new Date(session.metadata.planEndDate) 
                                : null,
                            stripeCustomerId: session.customer,
                            stripeSubscriptionId: session.subscription,
                            ...limits
                        }
                    }
                );
                break;
            }

            case 'customer.subscription.deleted':
            case 'customer.subscription.expired': {
                const subscription = event.data.object as Stripe.Subscription;
                const customerId = typeof subscription.customer === 'string' 
                    ? subscription.customer 
                    : subscription.customer.id;

                await db.collection('User').updateMany(
                    { stripeCustomerId: customerId },
                    {
                        $set: {
                            planType: 'free',
                            planEndDate: new Date(),
                            stripeSubscriptionId: null,
                            maxGrids: 2,
                            maxTubes: 162,
                            isUnlimited: false
                        }
                    }
                );
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice;
                const customerId = typeof invoice.customer === 'string'
                    ? invoice.customer
                    : invoice.customer.id;

                // Obtener el usuario
                const user = await db.collection('users').findOne({
                    stripeCustomerId: customerId
                });

                if (user) {
                    // Aquí podrías implementar la lógica de notificación
                    console.log('Payment failed for user:', user._id);
                    
                    // Opcional: Actualizar el estado del usuario o agregar una marca de pago fallido
                    await db.collection('User').updateOne(
                        { _id: user._id },
                        {
                            $set: {
                                lastPaymentFailed: true,
                                lastPaymentFailedDate: new Date()
                            }
                        }
                    );
                }
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                const customerId = typeof subscription.customer === 'string'
                    ? subscription.customer
                    : subscription.customer.id;

                // Obtener el plan actual del metadata de la suscripción
                const planType = (subscription.metadata?.planType as PlanType) || 'standard';
                const limits = PLAN_LIMITS[planType];

                await db.collection('User').updateOne(
                    { stripeCustomerId: customerId },
                    {
                        $set: {
                            planType: planType,
                            ...limits,
                            lastPaymentFailed: false // Limpiar la marca de pago fallido si existe
                        }
                    }
                );
                break;
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Error procesando webhook:', error);
        return NextResponse.json(
            { error: 'Error procesando webhook' },
            { status: 500 }
        );
    }
}
