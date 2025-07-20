import { useSession } from 'next-auth/react';
import { getUserPlanRestrictions } from '@/lib/planRestrictions';
import type { PlanLimits, PlanType } from '@/types/plans';

export function usePlanRestrictions() {
    const { data: session } = useSession();
    
    const getPlanRestrictions = (): PlanLimits => {
        if (!session?.user) {
            return getUserPlanRestrictions({
                planType: 'free' as PlanType,
                trialEndsAt: null,
                paypalSubscriptionId: null
            });
        }

        const planType = (session.user.planType || 'free') as PlanType;
        const validPlanTypes: PlanType[] = ['free', 'standard', 'premium'];
        
        return getUserPlanRestrictions({
            planType: validPlanTypes.includes(planType as PlanType) ? planType : 'free',
            trialEndsAt: session.user.trialEndsAt ? new Date(session.user.trialEndsAt) : null,
            paypalSubscriptionId: session.user.paypalSubscriptionId || null
        });
    };

    const canCreateGrid = (currentGridCount: number): boolean => {
        const restrictions = getPlanRestrictions();
        return currentGridCount < restrictions.maxGrids;
    };

    const canAddTubes = (currentTubeCount: number): boolean => {
        const restrictions = getPlanRestrictions();
        return currentTubeCount < restrictions.maxTubes;
    };

    return {
        restrictions: getPlanRestrictions(),
        canCreateGrid,
        canAddTubes
    };
}
