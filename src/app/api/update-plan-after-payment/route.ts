import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { PLAN_LIMITS, PlanType } from '@/types/plans';
import { ObjectId } from 'mongodb';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { planType, paypalSubscriptionId, startTime, nextBillingTime } = await req.json();

        // Validar que planType sea un tipo válido
        if (!['free', 'standard', 'premium'].includes(planType)) {
            return NextResponse.json(
                { error: `Invalid plan type: ${planType}` },
                { status: 400 }
            );
        }

        console.log('Updating plan with data:', {
            userId: session.user.id,
            planType,
            paypalSubscriptionId,
            startTime,
            nextBillingTime
        });

        // Obtener los límites del plan seleccionado
        const planLimits = PLAN_LIMITS[planType as PlanType];
        if (!planLimits) {
            return NextResponse.json(
                { error: `Plan type not valid: ${planType}` },
                { status: 400 }
            );
        }

        const { db } = await connectToDatabase();

        try {
            // Verificar si el usuario existe
            const user = await db.collection('User').findOne({
                _id: new ObjectId(session.user.id)
            });

            if (!user) {
                console.error('User not found:', session.user.id);
                return NextResponse.json(
                    { error: 'User not found' },
                    { status: 404 }
                );
            }

            // Actualizar el usuario con el nuevo plan y sus límites
            const result = await db.collection('User').updateOne(
                { _id: new ObjectId(session.user.id) },
                {
                    $set: {
                        planType,
                        paypalSubscriptionId,
                        planStartDate: new Date(startTime),
                        planEndDate: new Date(nextBillingTime),
                        lastPaymentFailed: false,
                        maxGrids: planLimits.maxGrids,
                        maxTubes: planLimits.maxTubes,
                        isUnlimited: planLimits.isUnlimited
                    }
                }
            );

            console.log('Update result:', result);

            if (result.matchedCount === 0) {
                throw new Error(`No user found with ID: ${session.user.id}`);
            }

            if (result.modifiedCount === 0) {
                console.warn('Document matched but no changes made');
            }

            // Registrar la transacción
            await db.collection('Transactions').insertOne({
                userId: new ObjectId(session.user.id),
                planType,
                status: 'completed',
                date: new Date(),
                paypalSubscriptionId,
                startTime: new Date(startTime),
                nextBillingTime: new Date(nextBillingTime)
            });

            console.log('Plan updated successfully');

            return NextResponse.json({
                success: true,
                planType,
                planStartDate: startTime,
                planEndDate: nextBillingTime
            });
        } catch (dbError) {
            console.error('Database error:', dbError);
            throw new Error(`Database operation failed: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error updating plan:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Error updating plan' },
            { status: 500 }
        );
    }
} 