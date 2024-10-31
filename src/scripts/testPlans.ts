import { connectToDatabase } from '../lib/mongodb';
import { ObjectId } from 'mongodb';
import { isTrialExpired } from '../lib/dateUtils';
import { PLAN_LIMITS, PlanType } from '../types/plans';

interface UserPlan {
    _id: ObjectId;
    email: string;
    planType: PlanType;
    planStartDate: Date;
    planEndDate?: Date;
    maxGrids: number;
    maxTubes: number;
    isUnlimited: boolean;
    stripeCustomerId?: string;
}

async function testPlanSystem() {
    try {
        const { db } = await connectToDatabase();
        console.log('🔄 Iniciando pruebas del sistema de planes...\n');

        // 1. Estadísticas generales
        const stats = {
            totalUsers: await db.collection('User').countDocuments(),
            trialUsers: 0,
            expiredTrials: 0,
            paidUsers: 0,
            freeUsers: 0
        };

        // 2. Usuarios en período de prueba
        const trialUsers = await db.collection('User').find({
            planType: 'premium',
            stripeCustomerId: null
        }).toArray() as UserPlan[];

        stats.trialUsers = trialUsers.length;
        console.log('👥 Usuarios en período de prueba:');
        
        for (const user of trialUsers) {
            const hasExpired = isTrialExpired(new Date(user.planStartDate));
            if (hasExpired) stats.expiredTrials++;
            
            console.log(`
    📧 Email: ${user.email}
    📅 Inicio de prueba: ${new Date(user.planStartDate).toLocaleDateString()}
    ⏰ ¿Expirado?: ${hasExpired ? '✓ Sí' : '✗ No'}
    📊 Límites: ${user.maxGrids} gradillas, ${user.maxTubes} tubos
    ${hasExpired ? '⚠️ REQUIERE ACTUALIZACIÓN A PLAN FREE' : ''}
    -------------------`);
        }

        // 3. Usuarios con suscripciones activas
        const paidUsers = await db.collection('User').find({
            stripeCustomerId: { $ne: null }
        }).toArray() as UserPlan[];

        stats.paidUsers = paidUsers.length;
        console.log('\n💳 Usuarios con suscripción activa:');
        
        for (const user of paidUsers) {
            const planLimits = PLAN_LIMITS[user.planType];
            const limitsMatch = 
                user.maxGrids === planLimits.maxGrids && 
                user.maxTubes === planLimits.maxTubes &&
                user.isUnlimited === planLimits.isUnlimited;

            console.log(`
    📧 Email: ${user.email}
    🎯 Plan: ${user.planType}
    💰 ID Stripe: ${user.stripeCustomerId}
    ✓ Límites correctos: ${limitsMatch ? 'Sí' : 'No ⚠️'}
    -------------------`);
        }

        // 4. Usuarios en plan gratuito
        const freeUsers = await db.collection('User').find({
            planType: 'free'
        }).toArray() as UserPlan[];

        stats.freeUsers = freeUsers.length;

        // 5. Resumen final
        console.log('\n📊 Resumen del sistema:');
        console.log(`
    Total usuarios: ${stats.totalUsers}
    En prueba: ${stats.trialUsers} (${stats.expiredTrials} expirados)
    Con suscripción: ${stats.paidUsers}
    Plan gratuito: ${stats.freeUsers}
    -------------------`);

        // 6. Alertas y recomendaciones
        if (stats.expiredTrials > 0) {
            console.log(`⚠️ Hay ${stats.expiredTrials} usuarios con pruebas expiradas que requieren actualización`);
        }

        const inconsistentUsers = paidUsers.filter(user => {
            const planLimits = PLAN_LIMITS[user.planType];
            return user.maxGrids !== planLimits.maxGrids || 
                   user.maxTubes !== planLimits.maxTubes ||
                   user.isUnlimited !== planLimits.isUnlimited;
        });

        if (inconsistentUsers.length > 0) {
            console.log(`⚠️ Hay ${inconsistentUsers.length} usuarios con límites inconsistentes`);
        }

    } catch (error) {
        console.error('❌ Error durante las pruebas:', error);
    }
}

// Ejecutar las pruebas
console.log('🚀 Iniciando script de prueba...\n');
testPlanSystem()
    .then(() => console.log('\n✅ Pruebas completadas'))
    .catch(error => console.error('\n❌ Error en las pruebas:', error))
    .finally(() => process.exit());
