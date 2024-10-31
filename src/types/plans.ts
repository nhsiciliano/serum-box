export type PlanType = 'free' | 'standard' | 'premium';

export interface PlanLimits {
    maxGrids: number;
    maxTubes: number;
    isUnlimited: boolean;
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
    free: { maxGrids: 2, maxTubes: 162, isUnlimited: false },
    standard: { maxGrids: 5, maxTubes: 1000, isUnlimited: false },
    premium: { maxGrids: 999999, maxTubes: 999999, isUnlimited: true }
};

export interface PlanPricing {
    3: { price: number; priceId: string };
    6: { price: number; priceId: string };
    12: { price: number; priceId: string };
}

export interface Plan {
    name: PlanType;
    description: string;
    prices?: PlanPricing;
    price?: string;
    priceId?: string;
}
