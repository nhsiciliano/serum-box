import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    try {
        const reagents = await prisma.reagent.findMany({
            where: { userId: session.user.id },
            orderBy: { name: 'asc' }
        });

        return NextResponse.json(reagents);
    } catch (error) {
        console.error('Error fetching reagents:', error);
        return NextResponse.json({ error: 'Error fetching reagents' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    try {
        const { name, description, unit } = await req.json();
        
        const reagent = await prisma.reagent.create({
            data: {
                name,
                description,
                unit,
                userId: session.user.id
            }
        });

        return NextResponse.json(reagent);
    } catch (error) {
        console.error('Error creating reagent:', error);
        return NextResponse.json({ error: 'Error creating reagent' }, { status: 500 });
    }
} 