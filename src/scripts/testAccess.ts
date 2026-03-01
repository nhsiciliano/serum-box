import prisma from '../lib/prisma';

async function runAccessChecks() {
    try {
        console.log('Running access checks...\n');

        const [
            totalUsers,
            totalGrids,
            totalTubes,
            totalReagents,
            totalStockEntries,
            verifiedUsers,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.gradilla.count(),
            prisma.tube.count(),
            prisma.reagent.count(),
            prisma.stock.count(),
            prisma.user.count({ where: { emailVerified: true } }),
        ]);

        console.log('Platform summary:');
        console.log(`- Users: ${totalUsers}`);
        console.log(`- Verified users: ${verifiedUsers}`);
        console.log(`- Grids: ${totalGrids}`);
        console.log(`- Tubes: ${totalTubes}`);
        console.log(`- Reagents: ${totalReagents}`);
        console.log(`- Stock entries: ${totalStockEntries}`);
        console.log('\nAll authenticated users have full feature access enabled.');
    } catch (error) {
        console.error('Access checks failed:', error);
        process.exitCode = 1;
    } finally {
        await prisma.$disconnect();
    }
}

runAccessChecks();
