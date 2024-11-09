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
        const isProd = process.env.NODE_ENV === 'production';
        
        if (!isProd) {
            console.log('Webhook recibido en desarrollo:', {
                signature: signature?.substring(0, 20) + '...',
                bodyPreview: body.substring(0, 100) + '...'
            });
        }

        event = stripe.webhooks.constructEvent(
            body,
            signature!,
            process.env.STRIPE_WEBHOOK_SECRET!
        );

        // Solo log básico en producción
        if (isProd) {
            console.log('Webhook recibido:', {
                type: event.type,
                id: event.id
            });
        }

        const { db } = await connectToDatabase();

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                
                console.log('Webhook recibido - Datos de la sesión:', {
                    id: session.id,
                    metadata: session.metadata,
                    customer: session.customer,
                    clientReferenceId: session.client_reference_id,
                    customerEmail: session.customer_details?.email
                });

                // Intentar obtener el userId de múltiples fuentes
                let userId: string | undefined;

                // 1. Intentar desde metadata
                if (session.metadata?.userId) {
                    userId = session.metadata.userId;
                }

                // 2. Intentar desde client_reference_id
                if (!userId && session.client_reference_id) {
                    userId = session.client_reference_id;
                }

                // 3. Intentar desde el customer
                if (!userId && session.customer) {
                    try {
                        const customer = await stripe.customers.retrieve(
                            typeof session.customer === 'string' 
                                ? session.customer 
                                : session.customer.id
                        );
                        
                        if (!('deleted' in customer) && customer.metadata?.userId) {
                            userId = customer.metadata.userId;
                        }
                    } catch (error) {
                        console.error('Error al recuperar cliente:', error);
                    }
                }

                // 4. Intentar desde el email del cliente
                if (!userId && session.customer_details?.email) {
                    const { db } = await connectToDatabase();
                    const user = await db.collection('User').findOne({
                        email: session.customer_details.email
                    });
                    
                    if (user) {
                        userId = user._id.toString();
                    }
                }

                if (!userId) {
                    console.error('No se pudo determinar el userId:', {
                        sessionId: session.id,
                        metadata: session.metadata,
                        customerDetails: session.customer_details,
                        customer: session.customer
                    });
                    throw new Error('No se pudo determinar el ID del usuario');
                }

                const planType = session.metadata?.planType as PlanType;
                if (!planType) {
                    throw new Error('No se encontró el tipo de plan en metadata');
                }

                const limits = PLAN_LIMITS[planType];
                const duration = parseInt(session.metadata?.duration || '3');

                const planEndDate = new Date();
                planEndDate.setMonth(planEndDate.getMonth() + duration);

                const updateResult = await db.collection('User').updateOne(
                    { _id: new ObjectId(userId) },
                    {
                        $set: {
                            planType,
                            planStartDate: new Date(),
                            planEndDate,
                            stripeCustomerId: typeof session.customer === 'string' 
                                ? session.customer 
                                : session.customer?.id,
                            stripeSubscriptionId: session.subscription,
                            lastPaymentFailed: false,
                            ...limits
                        }
                    }
                );

                if (updateResult.modifiedCount === 0) {
                    throw new Error('No se pudo actualizar el usuario');
                }

                await db.collection('Transactions').insertOne({
                    userId: new ObjectId(userId),
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
                            ...PLAN_LIMITS.free
                        }
                    }
                );
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice;
                const customerId = typeof invoice.customer === 'string' 
                    ? invoice.customer 
                    : invoice.customer?.id;

                if (customerId) {
                    const user = await db.collection('User').findOne({
                        stripeCustomerId: customerId
                    });

                    if (user) {
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
                }
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                const customerId = typeof subscription.customer === 'string'
                    ? subscription.customer 
                    : subscription.customer.id;

                if (subscription.metadata?.planType) {
                    const planType = subscription.metadata.planType as PlanType;
                    const limits = PLAN_LIMITS[planType];

                    await db.collection('User').updateOne(
                        { stripeCustomerId: customerId },
                        {
                            $set: {
                                planType,
                                ...limits,
                                lastPaymentFailed: false
                            }
                        }
                    );
                }
                break;
            }
        }

        return NextResponse.json({ received: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error('Error procesando webhook:', {
            error,
            signature,
            webhookSecret: process.env.STRIPE_WEBHOOK_SECRET?.substring(0, 10) + '...',
            bodyPreview: body.substring(0, 100) + '...'
        });
        return NextResponse.json(
            { error: 'Error procesando webhook' },
            { status: 400 }
        );
    }
}

