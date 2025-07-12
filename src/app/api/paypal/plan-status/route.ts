import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

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

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { db } = await connectToDatabase();
        const user = await db.collection('User').findOne({ _id: new ObjectId(session.user.id) });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (!user.paypalSubscriptionId) {
            return NextResponse.json({ planType: 'free', planEndDate: null, status: 'inactive' });
        }

        const accessToken = await getAccessToken();
        const response = await fetch(`${PAYPAL_API}/v1/billing/subscriptions/${user.paypalSubscriptionId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            // If subscription not found in PayPal, assume it's inactive
            if (response.status === 404) {
                return NextResponse.json({ planType: 'free', planEndDate: null, status: 'inactive' });
            }
            throw new Error('Failed to fetch subscription from PayPal');
        }

        const subscription = await response.json();
        
        const planEndDate = subscription.billing_info?.next_billing_time ? new Date(subscription.billing_info.next_billing_time) : null;

        return NextResponse.json({
            planType: user.planType,
            planEndDate: planEndDate,
            status: subscription.status.toLowerCase(),
        });

    } catch (error) {
        console.error('Error fetching PayPal plan status:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
