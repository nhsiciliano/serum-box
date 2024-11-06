import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { connectToDatabase } from '@/lib/mongodb';
import Stripe from 'stripe';
import { ObjectId } from 'mongodb';
import { PLAN_LIMITS, PlanType } from '@/types/plans';

// Configuración del segmento de ruta usando la nueva sintaxis
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const preferredRegion = 'auto';

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY no está definida');
}

if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error('STRIPE_WEBHOOK_SECRET no está definida');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-10-28.acacia',
});

export async function POST(req: Request) {
    const body = await req.text();
    const headersList = headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
        console.error('No se encontró la firma del webhook');
        return NextResponse.json(
            { error: 'No stripe signature found' },
            { status: 400 }
        );
    }

    let event: Stripe.Event;

    try {
        // Verifica la firma del webhook
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );

        // Log del evento recibido
        console.log('Webhook recibido:', {
            type: event.type,
            id: event.id,
            signature: signature.substring(0, 20) + '...' // Log parcial por seguridad
        });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        console.error('Error al verificar webhook:', {
            error: err.message,
            signature: signature.substring(0, 20) + '...',
            bodyPreview: body.substring(0, 100) + '...'
        });
        return NextResponse.json(
            { error: `Webhook Error: ${err.message}` },
            { status: 400 }
        );
    }

    const { db } = await connectToDatabase();

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                console.log('Procesando checkout.session.completed:', {
                    sessionId: session.id,
                    customerId: session.customer,
                    clientReferenceId: session.client_reference_id
                });

                if (!session.client_reference_id) {
                    throw new Error('No se encontró client_reference_id');
                }

                const planType = session.metadata?.planType as PlanType;
                if (!planType) {
                    throw new Error('No se encontró el tipo de plan en metadata');
                }

                const limits = PLAN_LIMITS[planType];
                const duration = parseInt(session.metadata?.duration || '3');

                // Calcular fecha de fin del plan
                const planEndDate = new Date();
                planEndDate.setMonth(planEndDate.getMonth() + duration);

                const updateResult = await db.collection('User').updateOne(
                    { _id: new ObjectId(session.client_reference_id) },
                    {
                        $set: {
                            planType,
                            planStartDate: new Date(),
                            planEndDate,
                            stripeCustomerId: session.customer,
                            stripeSubscriptionId: session.subscription,
                            lastPaymentFailed: false,
                            ...limits
                        }
                    }
                );

                if (updateResult.modifiedCount === 0) {
                    console.error('No se pudo actualizar el usuario:', session.client_reference_id);
                    throw new Error('No se pudo actualizar el usuario');
                }

                // Registrar la transacción
                await db.collection('Transactions').insertOne({
                    userId: new ObjectId(session.client_reference_id),
                    planType,
                    amount: session.amount_total ? session.amount_total / 100 : 0,
                    currency: session.currency,
                    status: 'completed',
                    date: new Date(),
                    stripeSessionId: session.id,
                    metadata: session.metadata
                });

                break;
            }

            case 'customer.subscription.deleted': {
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
                const customerId = invoice.customer ? typeof invoice.customer === 'string' ? invoice.customer : invoice.customer.id : null;

                const user = await db.collection('User').findOne({
                    stripeCustomerId: customerId
                });

                if (user) {
                    console.log('Payment failed for user:', user._id);
                    
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

                const planType = (subscription.metadata?.planType as PlanType) || 'standard';
                const limits = PLAN_LIMITS[planType];

                await db.collection('User').updateOne(
                    { stripeCustomerId: customerId },
                    {
                        $set: {
                            planType: planType,
                            ...limits,
                            lastPaymentFailed: false
                        }
                    }
                );
                break;
            }
        }

        return NextResponse.json({ received: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error('Error procesando webhook:', {
            type: event.type,
            error: error.message,
            stack: error.stack
        });
        return NextResponse.json(
            { error: 'Error procesando webhook' },
            { status: 500 }
        );
    }
}
