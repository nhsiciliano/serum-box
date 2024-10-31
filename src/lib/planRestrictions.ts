import { PlanType, PlanLimits, PLAN_LIMITS } from '@/types/plans';

export function getPlanRestrictions(planType: PlanType): PlanLimits {
    return PLAN_LIMITS[planType] || PLAN_LIMITS.free;
}

export function isInTrialPeriod(planStartDate: Date): boolean {
    const trialPeriod = 15 * 24 * 60 * 60 * 1000; // 15 días en milisegundos
    const currentDate = new Date();
    return currentDate.getTime() - planStartDate.getTime() < trialPeriod;
}

interface User {
    id: string;
    planType: PlanType;
    planStartDate: Date;
}

export function getUserPlanRestrictions(user: User): PlanLimits {
    if (!user || !user.planStartDate) {
        return PLAN_LIMITS.free;
    }

    if (isInTrialPeriod(user.planStartDate)) {
        return PLAN_LIMITS.premium;
    }
    
    return PLAN_LIMITS[user.planType] || PLAN_LIMITS.free;
}
