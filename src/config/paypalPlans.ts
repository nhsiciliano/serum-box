export type PayPalPlanType = 'standard' | 'premium';

export const PAYPAL_PLANS: Record<PayPalPlanType, {
    productId: string;
    plans: Record<1 | 12, { planId: string }>;
}> = {
    standard: {
        productId: process.env.STANDARD_PRODUCT_ID || '',
        plans: {
            1: { planId: process.env.STANDARD_PLAN_ID_1 || '' },
            12: { planId: process.env.STANDARD_PLAN_ID_12 || '' }
        }
    },
    premium: {
        productId: process.env.PREMIUM_PRODUCT_ID || '',
        plans: {
            1: { planId: process.env.PREMIUM_PLAN_ID_1 || '' },
            12: { planId: process.env.PREMIUM_PLAN_ID_12 || '' }
        }
    }
}; 