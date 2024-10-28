import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';  // Asegúrate de que la ruta sea correcta

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.id) {
            console.log('Sesión no encontrada:', session); // Para debugging
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        // Obtener el conteo de gradillas
        const gridCount = await prisma.gradilla.count({
            where: {
                userId: session.user.id
            }
        });

        // Obtener el conteo total de tubos sumando todos los tubos de todas las gradillas
        const tubeCount = await prisma.tube.count({
            where: {
                gradilla: {
                    userId: session.user.id
                }
            }
        });

        return NextResponse.json({
            gridCount,
            tubeCount
        });
    } catch (error) {
        console.error('Error completo:', error); // Para debugging
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
