import prisma from '@/lib/prisma';
import { isTrialExpired } from '@/lib/dateUtils';

export async function GET() {
    try {
        // Buscar usuarios en período de prueba
        const users = await prisma.user.findMany({
            where: {
                planType: 'premium',
                stripeCustomerId: null // Solo usuarios en prueba gratuita
            }
        });

        for (const user of users) {
            if (isTrialExpired(user.planStartDate)) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { planType: 'free' }
                });
            }
        }

        return new Response('Trial check completed', { status: 200 });
    } catch (error) {
        console.error('Error checking trial expiration:', error);
        return new Response('Error checking trials', { status: 500 });
    }
}

