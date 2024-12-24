import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PAYPAL_PLANS, PayPalPlanType } from '@/config/paypalPlans';

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

function getPlanTypeFromPlanId(planId: string): PayPalPlanType | null {
    for (const [planType, planData] of Object.entries(PAYPAL_PLANS)) {
        for (const duration of [1, 12] as const) {
            if (planData.plans[duration].planId === planId) {
                return planType as PayPalPlanType;
            }
        }
    }
    return null;
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'No autorizado o email no disponible' },
                { status: 401 }
            );
        }

        const url = new URL(req.url);
        const subscriptionId = url.searchParams.get('subscription_id');

        if (!subscriptionId) {
            return NextResponse.json(
                { error: 'ID de suscripción requerido' },
                { status: 400 }
            );
        }

        const accessToken = await getAccessToken();
        
        const response = await fetch(`${PAYPAL_API}/v1/billing/subscriptions/${subscriptionId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const subscriptionData = await response.json();
        console.log('PayPal Subscription Data:', subscriptionData);

        if (subscriptionData.status === 'ACTIVE') {
            const planType = getPlanTypeFromPlanId(subscriptionData.plan_id);
            
            if (!planType) {
                throw new Error(`Plan type not found for plan ID: ${subscriptionData.plan_id}`);
            }

            return NextResponse.json({
                status: 'active',
                planType,
                subscriptionId: subscriptionData.id,
                startTime: subscriptionData.start_time,
                nextBillingTime: subscriptionData.billing_info.next_billing_time
            });
        } else {
            return NextResponse.json({
                status: subscriptionData.status.toLowerCase(),
                error: 'Subscription is not active'
            });
        }
    } catch (error) {
        console.error('Error verifying PayPal subscription:', error);
        return NextResponse.json(
            { error: 'Error verifying subscription' },
            { status: 500 }
        );
    }
} 