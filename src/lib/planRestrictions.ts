import { PlanType, PlanLimits, PLAN_LIMITS } from '@/types/plans';

export function getPlanRestrictions(planType: PlanType): PlanLimits {
    return PLAN_LIMITS[planType] || PLAN_LIMITS.free;
}

export function isInTrialPeriod(planStartDate: Date): boolean {
    const trialPeriod = 15 * 24 * 60 * 60 * 1000; // 15 días en milisegundos
    const currentDate = new Date();
    return currentDate.getTime() - planStartDate.getTime() < trialPeriod;
}

interface UserPlanInfo {
    id: string;
    planType: PlanType;
    planStartDate: Date;
}

export function getUserPlanRestrictions(user: UserPlanInfo): PlanLimits {
    // Validar que el plan existe
    if (user.planType in PLAN_LIMITS) {
        return PLAN_LIMITS[user.planType];
    }
    
    // Si el plan no existe, devolver el plan gratuito
    return PLAN_LIMITS.free;
}
