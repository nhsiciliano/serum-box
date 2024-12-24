import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PAYPAL_PLANS, PayPalPlanType } from '@/config/paypalPlans';

interface PayPalLink {
    href: string;
    rel: string;
    method?: string;
}

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

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'No autorizado o email no disponible' },
                { status: 401 }
            );
        }

        const { planType, duration } = await req.json();
        
        console.log('PayPal Subscription Request:', { planType, duration });
        
        if (!planType || !duration) {
            return NextResponse.json(
                { error: 'Tipo de plan y duración son requeridos' },
                { status: 400 }
            );
        }

        const selectedPlan = PAYPAL_PLANS[planType as PayPalPlanType];
        if (!selectedPlan) {
            return NextResponse.json(
                { error: `Plan no válido: ${planType}` },
                { status: 400 }
            );
        }

        const planId = selectedPlan.plans[duration as 1 | 12]?.planId;
        if (!planId) {
            return NextResponse.json(
                { error: `Duración no válida: ${duration}` },
                { status: 400 }
            );
        }

        console.log('Selected PayPal Plan:', { planId, planType, duration });

        const accessToken = await getAccessToken();
        
        const subscription = await fetch(`${PAYPAL_API}/v1/billing/subscriptions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                plan_id: planId,
                subscriber: {
                    name: {
                        given_name: session.user.name || session.user.email,
                    },
                    email_address: session.user.email,
                },
                application_context: {
                    brand_name: "Serum Box",
                    shipping_preference: "NO_SHIPPING",
                    user_action: "SUBSCRIBE_NOW",
                    payment_method_preference: "IMMEDIATE_PAYMENT_REQUIRED",
                    payment_method_selected: "DEBIT_OR_CREDIT_CARD",
                    return_url: `${process.env.NEXTAUTH_URL}/dashboard/success`,
                    cancel_url: `${process.env.NEXTAUTH_URL}/dashboard/cancel`,
                },
            }),
        });

        const subscriptionData = await subscription.json();
        console.log('PayPal Response:', subscriptionData);

        if (!subscription.ok) {
            throw new Error(`PayPal API Error: ${subscriptionData.message || JSON.stringify(subscriptionData)}`);
        }
        
        if (subscriptionData.status === 'APPROVAL_PENDING') {
            const approveLink = subscriptionData.links.find((link: PayPalLink) => link.rel === 'approve');
            if (!approveLink) {
                throw new Error('Not found approval link');
            }

            return NextResponse.json({
                subscriptionId: subscriptionData.id,
                approvalUrl: approveLink.href
            });
        } else {
            throw new Error(`Unexpected subscription status: ${subscriptionData.status}`);
        }
    } catch (error) {
        console.error('Error creating PayPal subscription:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Error creating PayPal subscription' },
            { status: 500 }
        );
    }
} 