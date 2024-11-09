import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Asegúrate de que la clave secreta de Stripe esté definida
if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('La clave secreta de Stripe no está definida');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-10-28.acacia',
});

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'No autorizado o email no disponible' },
                { status: 401 }
            );
        }

        const { priceId, planType, duration, userId } = await req.json();

        // Log para debugging
        console.log('Creando sesión de checkout:', {
            userId,
            email: session.user.email,
            planType,
            duration
        });

        // Crear o recuperar el cliente de Stripe
        let customer: Stripe.Customer;
        const existingCustomers = await stripe.customers.list({
            email: session.user.email,
            limit: 1
        });

        if (existingCustomers.data.length > 0) {
            customer = existingCustomers.data[0];
            // Actualizar metadata del cliente existente
            await stripe.customers.update(customer.id, {
                metadata: {
                    userId: userId
                }
            });
        } else {
            customer = await stripe.customers.create({
                email: session.user.email,
                metadata: {
                    userId: userId
                }
            });
        }

        // Definir los parámetros de la sesión con tipos correctos
        const params: Stripe.Checkout.SessionCreateParams = {
            customer: customer.id,
            client_reference_id: userId,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [{
                price: priceId,
                quantity: 1
            }],
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/cancel`,
            metadata: {
                userId: userId,
                planType: planType,
                duration: duration.toString()
            },
            subscription_data: {
                metadata: {
                    userId: userId,
                    planType: planType,
                    duration: duration.toString()
                }
            }
        };

        // Agregar log antes de crear la sesión
        console.log('Parámetros de la sesión:', params);

        // Crear la sesión de checkout
        const checkoutSession = await stripe.checkout.sessions.create(params);

        // Log para debugging
        console.log('Sesión de checkout creada:', {
            sessionId: checkoutSession.id,
            customerId: customer.id,
            clientReferenceId: userId,
            metadata: checkoutSession.metadata
        });

        // Después de crear la sesión
        console.log('Sesión de checkout creada (datos completos):', {
            session: checkoutSession,
            customer: {
                id: customer.id,
                email: customer.email,
                metadata: customer.metadata
            },
            params: params
        });

        return NextResponse.json({
            sessionId: checkoutSession.id,
            customerId: customer.id
        });

    } catch (error) {
        console.error('Error creando sesión de checkout:', error);
        return NextResponse.json(
            { error: 'Error creating checkout session' },
            { status: 500 }
        );
    }
}
