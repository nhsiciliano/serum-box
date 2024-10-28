export function getRemainingDays(startDate: Date): number {
    const trialPeriod = 15 * 24 * 60 * 60 * 1000; // 15 días en milisegundos
    const currentDate = new Date();
    const elapsed = currentDate.getTime() - startDate.getTime();
    const remaining = Math.ceil((trialPeriod - elapsed) / (1000 * 60 * 60 * 24));
    return Math.max(0, remaining);
}

export function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(date);
}

export function isTrialExpired(startDate: Date): boolean {
    const trialPeriod = 15 * 24 * 60 * 60 * 1000; // 15 días en milisegundos
    const currentDate = new Date();
    return currentDate.getTime() - startDate.getTime() > trialPeriod;
}
