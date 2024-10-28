export interface PlanRestrictions {
    maxGrids: number;
    maxTubes: number;
    isUnlimited: boolean;
}

export function getPlanRestrictions(planType: string): PlanRestrictions {
    switch (planType) {
        case 'free':
            return {
                maxGrids: 2,
                maxTubes: 162,
                isUnlimited: false
            };
        case 'standard':
            return {
                maxGrids: 5,
                maxTubes: 1000,
                isUnlimited: false
            };
        case 'premium':
            return {
                maxGrids: Infinity,
                maxTubes: Infinity,
                isUnlimited: true
            };
        default:
            return {
                maxGrids: 2,
                maxTubes: 162,
                isUnlimited: false
            };
    }
}

export function isInTrialPeriod(planStartDate: Date): boolean {
    const trialPeriod = 15 * 24 * 60 * 60 * 1000; // 15 días en milisegundos
    const currentDate = new Date();
    return currentDate.getTime() - planStartDate.getTime() < trialPeriod;
}

interface User {
    id: string;
    planType: string;
    planStartDate: Date;
}

export function getUserPlanRestrictions(user: User): PlanRestrictions {
    if (!user || !user.planStartDate) {
        return getPlanRestrictions('free');
    }

    if (isInTrialPeriod(user.planStartDate)) {
        return getPlanRestrictions('premium');
    }
    
    return getPlanRestrictions(user.planType);
}
