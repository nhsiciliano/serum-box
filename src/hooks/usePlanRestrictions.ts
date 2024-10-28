import { useSession } from 'next-auth/react';
import { getUserPlanRestrictions, PlanRestrictions } from '@/lib/planRestrictions';

export function usePlanRestrictions() {
    const { data: session } = useSession();
    
    const getPlanRestrictions = (): PlanRestrictions => {
        if (!session?.user) {
            return getUserPlanRestrictions({
                id: '',
                planType: 'free',
                planStartDate: new Date()
            });
        }

        return getUserPlanRestrictions({
            id: session.user.id,
            planType: session.user.planType || 'free',
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

