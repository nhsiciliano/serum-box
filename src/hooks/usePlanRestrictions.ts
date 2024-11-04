import { useSession } from 'next-auth/react';
import { getUserPlanRestrictions } from '@/lib/planRestrictions';
import type { PlanLimits, PlanType } from '@/types/plans';

export function usePlanRestrictions() {
    const { data: session } = useSession();
    
    const getPlanRestrictions = (): PlanLimits => {
        if (!session?.user) {
            return getUserPlanRestrictions({
                id: '',
                planType: 'free' as PlanType,
                planStartDate: new Date()
            });
        }

        const planType = (session.user.planType || 'free') as PlanType;
        const validPlanTypes: PlanType[] = ['free', 'standard', 'premium'];
        
        return getUserPlanRestrictions({
            id: session.user.id,
            planType: validPlanTypes.includes(planType as PlanType) ? planType : 'free',
            planStartDate: new Date(session.user.planStartDate || Date.now())
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

