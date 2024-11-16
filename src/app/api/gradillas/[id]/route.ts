import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET(
	req: Request,
	{ params }: { params: { id: string } }
) {
	const session = await getServerSession(authOptions);
	if (!session || !session.user?.id) {
		return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
	}

	try {
		const gradilla = await prisma.gradilla.findUnique({
			where: { 
				id: params.id,
				userId: session.user.id 
			},
			include: { tubes: true },
		});
		if (!gradilla) {
			return NextResponse.json({ error: 'Gradilla no encontrada' }, { status: 404 });
		}
		return NextResponse.json(gradilla);
	} catch (error) {
		console.error('Error al obtener la gradilla:', error);
		return NextResponse.json({ error: 'Error al obtener la gradilla' }, { status: 500 });
	}
}

export async function PUT(
	req: Request,
	{ params }: { params: { id: string } }
) {
	const session = await getServerSession(authOptions);
	if (!session || !session.user?.id) {
		return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
	}

	const { name, rows, columns, fields, description, storagePlace, temperature } = await req.json();

	try {
		const updatedGradilla = await prisma.gradilla.update({
			where: { 
				id: params.id,
				userId: session.user.id 
			},
			data: {
				name,
				description,
				storagePlace,
				temperature,
				rows: rows as string[],
				columns: columns as number[],
				fields: fields as string[]
			},
		});
		return NextResponse.json(updatedGradilla);
	} catch (error) {
		console.error('Error al actualizar la gradilla:', error);
		return NextResponse.json({ error: 'Error al actualizar la gradilla' }, { status: 500 });
	}
}

export async function DELETE(
	req: Request,
	{ params }: { params: { id: string } }
) {
	const session = await getServerSession(authOptions);
	if (!session || !session.user?.id) {
		return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
	}

	try {
		// Primero, eliminamos todos los tubos asociados a esta gradilla
		await prisma.tube.deleteMany({
			where: { gradillaId: params.id }
		});

		// Luego, eliminamos la gradilla
		await prisma.gradilla.delete({
			where: { 
				id: params.id,
				userId: session.user.id 
			},
		});
		return NextResponse.json({ message: 'Gradilla eliminada con éxito' });
	} catch (error) {
		console.error('Error al eliminar la gradilla:', error);
		return NextResponse.json({ error: 'Error al eliminar la gradilla' }, { status: 500 });
	}
}
