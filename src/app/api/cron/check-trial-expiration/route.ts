import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { isTrialExpired } from '@/lib/dateUtils';
import { PLAN_LIMITS } from '@/types/plans';
import { headers } from 'next/headers';

export async function GET() {
    // Verificar autenticación
    const headersList = headers();
    const authHeader = headersList.get('authorization');

    if (!isValidCronRequest(authHeader)) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    try {
        const { db } = await connectToDatabase();
        
        const results = {
            processed: 0,
            updated: 0,
            errors: 0,
            timestamp: new Date().toISOString()
        };

        // Buscar usuarios en período de prueba
        const users = await db.collection('User').find({
            planType: 'premium',
            stripeCustomerId: null // Solo usuarios en prueba gratuita
        }).toArray();

        results.processed = users.length;

        for (const user of users) {
            try {
                if (isTrialExpired(new Date(user.planStartDate))) {
                    await db.collection('User').updateOne(
                        { _id: user._id },
                        {
                            $set: {
                                planType: 'free',
                                planEndDate: new Date(),
                                ...PLAN_LIMITS.free
                            }
                        }
                    );
                    results.updated++;
                }
            } catch (error) {
                console.error(`Error processing user ${user._id}:`, error);
                results.errors++;
            }
        }

        // Agregar logging
        console.log('Cron job completed:', results);

        return NextResponse.json({
            message: 'Trial expiration check completed',
            results
        });
    } catch (error) {
        console.error('Error checking trial expiration:', error);
        return NextResponse.json({ 
            error: 'Internal Server Error',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}

function isValidCronRequest(authHeader: string | null): boolean {
    if (!authHeader) return false;
    
    // Verificar el token de autorización
    const token = authHeader.split(' ')[1];
    return token === process.env.CRON_SECRET;
}

