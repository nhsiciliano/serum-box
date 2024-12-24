import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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

        const { planType, duration, amount } = await req.json();
        
        console.log('PayPal Order Details:', {
            planType,
            duration,
            amount,
            calculatedTotal: amount
        });

        const accessToken = await getAccessToken();
        
        const order = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                intent: "CAPTURE",
                purchase_units: [
                    {
                        amount: {
                            currency_code: "USD",
                            value: amount.toString(),
                        },
                        description: `${planType} plan - ${duration} months`,
                    },
                ],
                application_context: {
                    brand_name: "Serum Box",
                    landing_page: "NO_PREFERENCE",
                    user_action: "PAY_NOW",
                    return_url: `${process.env.NEXTAUTH_URL}/dashboard/success`,
                    cancel_url: `${process.env.NEXTAUTH_URL}/dashboard/cancel`,
                },
            }),
        });

        const orderData = await order.json();
        console.log('PayPal Response:', orderData);

        return NextResponse.json(orderData);
    } catch (error) {
        console.error('Error creating PayPal order:', error);
        return NextResponse.json(
            { error: 'Error creating PayPal order' },
            { status: 500 }
        );
    }
} 