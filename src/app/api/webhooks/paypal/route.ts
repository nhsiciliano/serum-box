import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';
import { PAYPAL_PLANS, PayPalPlanType } from '@/config/paypalPlans';

interface PayPalWebhookEvent {
    event_type: string;
    resource: {
        id?: string;
        billing_agreement_id?: string;
        plan_id?: string;
        billing_info?: {
            next_billing_time?: string;
        };
        status?: string;
        status_update_time?: string;
    };
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
            'Content-Type': 'application/x-www-form-urlencoded'
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

async function verifyWebhookSignature(payload: string) {
    try {
        const accessToken = await getAccessToken();
        
        const verifyResponse = await fetch(`${PAYPAL_API}/v1/notifications/verify-webhook-signature`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                transmission_id: headers().get('Paypal-Transmission-Id'),
                transmission_time: headers().get('Paypal-Transmission-Time'),
                cert_url: headers().get('Paypal-Cert-Url'),
                auth_algo: headers().get('Paypal-Auth-Algo'),
                transmission_sig: headers().get('Paypal-Transmission-Sig'),
                webhook_id: process.env.PAYPAL_WEBHOOK_ID,
                webhook_event: JSON.parse(payload)
            })
        });

        const verificationResult = await verifyResponse.json();
        return verificationResult.verification_status === 'SUCCESS';
    } catch (error) {
        console.error('Webhook signature verification error:', error);
        return false;
    }
}

export async function POST(req: Request) {
    try {
        // Leer el cuerpo de la solicitud como texto
        const payload = await req.text();
        
        // Verificar la firma del webhook
        const isSignatureValid = await verifyWebhookSignature(payload);

        if (!isSignatureValid) {
            console.error('Invalid webhook signature');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
        }

        // Parsear el payload
        const webhookEvent: PayPalWebhookEvent = JSON.parse(payload);
        console.log('PayPal Webhook Event:', webhookEvent);

        // Manejar diferentes tipos de eventos
        switch (webhookEvent.event_type) {
            case 'PAYMENT.SALE.COMPLETED':
                await handlePaymentCompleted(webhookEvent);
                break;
            
            case 'BILLING.SUBSCRIPTION.CANCELLED':
                await handleSubscriptionCancelled(webhookEvent);
                break;
            
            case 'BILLING.SUBSCRIPTION.SUSPENDED':
                await handleSubscriptionSuspended(webhookEvent);
                break;
            
            case 'BILLING.SUBSCRIPTION.EXPIRED':
                await handleSubscriptionExpired(webhookEvent);
                break;
            
            default:
                console.log('Unhandled event type:', webhookEvent.event_type);
        }

        return NextResponse.json({ received: true }, { status: 200 });
    } catch (error) {
        console.error('PayPal Webhook Error:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}

async function handlePaymentCompleted(event: PayPalWebhookEvent) {
    try {
        const subscriptionId = event.resource.billing_agreement_id || '';
        const planId = event.resource.plan_id || '';
        const planType = getPlanTypeFromPlanId(planId);

        if (!planType) {
            console.error('Plan type not found for plan ID:', planId);
            return;
        }

        // Determinar límites del plan
        const planLimits = {
            standard: { maxGrids: 5, maxTubes: 1000, isUnlimited: false },
            premium: { maxGrids: 999999, maxTubes: 999999, isUnlimited: true }
        };

        const limits = planLimits[planType];

        // Actualizar estado de suscripción en la base de datos
        await prisma.user.updateMany({
            where: { paypalSubscriptionId: subscriptionId },
            data: { 
                planType,
                planStartDate: new Date(),
                planEndDate: event.resource.billing_info?.next_billing_time 
                    ? new Date(event.resource.billing_info.next_billing_time) 
                    : new Date(),
                maxGrids: limits.maxGrids,
                maxTubes: limits.maxTubes,
                isUnlimited: limits.isUnlimited
            }
        });

        console.log('Payment completed for subscription:', subscriptionId);
    } catch (error) {
        console.error('Error handling payment completed:', error);
    }
}

async function handleSubscriptionCancelled(event: PayPalWebhookEvent) {
    try {
        const subscriptionId = event.resource.id || '';
        
        // Actualizar estado de suscripción en la base de datos
        await prisma.user.updateMany({
            where: { paypalSubscriptionId: subscriptionId },
            data: { 
                planType: 'free',
                planEndDate: new Date(),
                maxGrids: 2,
                maxTubes: 162,
                isUnlimited: false
            }
        });

        console.log('Subscription cancelled:', subscriptionId);
    } catch (error) {
        console.error('Error handling subscription cancelled:', error);
    }
}

async function handleSubscriptionSuspended(event: PayPalWebhookEvent) {
    try {
        const subscriptionId = event.resource.id || '';
        
        // Actualizar estado de suscripción en la base de datos
        await prisma.user.updateMany({
            where: { paypalSubscriptionId: subscriptionId },
            data: { 
                planType: 'free',
                maxGrids: 2,
                maxTubes: 162,
                isUnlimited: false
            }
        });

        console.log('Subscription suspended:', subscriptionId);
    } catch (error) {
        console.error('Error handling subscription suspended:', error);
    }
}

async function handleSubscriptionExpired(event: PayPalWebhookEvent) {
    try {
        const subscriptionId = event.resource.id || '';
        
        // Actualizar estado de suscripción en la base de datos
        await prisma.user.updateMany({
            where: { paypalSubscriptionId: subscriptionId },
            data: { 
                planType: 'free',
                planEndDate: new Date(),
                maxGrids: 2,
                maxTubes: 162,
                isUnlimited: false
            }
        });

        console.log('Subscription expired:', subscriptionId);
    } catch (error) {
        console.error('Error handling subscription expired:', error);
    }
} 