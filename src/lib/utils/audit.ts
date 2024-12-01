import prisma from '@/lib/prisma';

export async function getActiveUserForAudit(req: Request, sessionUserId: string) {
    const activeUserId = req.headers.get('x-active-user-id');
    console.log('Active User ID from header:', activeUserId);
    
    const userId = activeUserId || sessionUserId;
    
    if (!userId) {
        console.error('No user ID available for audit');
        return null;
    }

    try {
        const activeUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { 
                id: true,
                name: true, 
                email: true,
                isMainUser: true,
                mainUserId: true
            }
        });
        console.log('Active User found:', activeUser);
        return activeUser;
    } catch (error) {
        console.error('Error finding active user:', error);
        return null;
    }
}