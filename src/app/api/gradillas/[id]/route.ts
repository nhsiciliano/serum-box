import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { getActiveUserForAudit } from '@/lib/utils/audit';

export async function GET(
	req: Request,
	{ params }: { params: { id: string } }
) {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) {
		return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
	}

	try {
		// Buscar la gradilla considerando usuario principal y secundarios
		const gradilla = await prisma.gradilla.findFirst({
			where: {
				id: params.id,
				OR: [
					{ userId: session.user.id },
					{ user: { mainUserId: session.user.id } }
				]
			},
			include: { 
				tubes: true,
				user: {
					select: {
						name: true,
						email: true,
						isMainUser: true
					}
				}
			},
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

	const activeUser = await getActiveUserForAudit(req, session.user.id);

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

		// Registrar en el log de auditoría
		await prisma.auditLog.create({
			data: {
				action: 'UPDATE_GRID',
				entityType: 'GRID',
				entityId: params.id,
				details: {
					name,
					description,
					storagePlace,
					temperature,
					rowCount: rows.length,
					columnCount: columns.length,
					activeUser
				},
				userId: activeUser?.id || session.user.id
			}
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
	if (!session?.user?.id) {
		return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
	}

	try {
		const activeUser = await getActiveUserForAudit(req, session.user.id);
		if (!activeUser) {
			return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
		}

		// Verificar acceso a la gradilla
		const gradilla = await prisma.gradilla.findFirst({
			where: {
				id: params.id,
				OR: [
					{ userId: session.user.id },
					{ user: { mainUserId: session.user.id } }
				]
			}
		});

		if (!gradilla) {
			return NextResponse.json({ error: 'Gradilla no encontrada o no autorizada' }, { status: 404 });
		}

		// Primero, eliminamos todos los tubos asociados
		await prisma.tube.deleteMany({
			where: { gradillaId: params.id }
		});

		// Luego, eliminamos la gradilla
		await prisma.gradilla.delete({
			where: { id: params.id }
		});

		// Registrar en audit log
		await prisma.auditLog.create({
			data: {
				action: 'DELETE_GRID',
				entityType: 'GRID',
				entityId: params.id,
				details: {
					gridId: params.id,
					activeUser: {
						id: activeUser.id,
						name: activeUser.name,
						email: activeUser.email,
						isMainUser: activeUser.isMainUser
					}
				},
				userId: activeUser.id
			}
		});

		return NextResponse.json({ message: 'Gradilla eliminada con éxito' });
	} catch (error) {
		console.error('Error al eliminar la gradilla:', error);
		return NextResponse.json({ error: 'Error al eliminar la gradilla' }, { status: 500 });
	}
}
