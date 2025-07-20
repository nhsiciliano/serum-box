import { PlanType, PlanLimits, PLAN_LIMITS } from '@/types/plans';

export function getPlanRestrictions(planType: PlanType): PlanLimits {
    return PLAN_LIMITS[planType] || PLAN_LIMITS.free;
}

interface UserPlanInfo {
    planType: PlanType;
    trialEndsAt?: Date | null;
    paypalSubscriptionId?: string | null;
}

export function getUserPlanRestrictions(user: UserPlanInfo): PlanLimits {
    const now = new Date();

    // Si el usuario tiene una suscripción activa, se aplican las reglas de su plan.
    if (user.paypalSubscriptionId) {
        return PLAN_LIMITS[user.planType] || PLAN_LIMITS.free;
    }

    // Si el usuario está en período de prueba (y no tiene suscripción), se aplican las reglas de su plan de prueba.
    if (user.trialEndsAt && user.trialEndsAt > now) {
        return PLAN_LIMITS[user.planType] || PLAN_LIMITS.free;
    }

    // Si la prueba ha terminado y no hay suscripción, se aplican las reglas del plan gratuito.
    return PLAN_LIMITS.free;
}
