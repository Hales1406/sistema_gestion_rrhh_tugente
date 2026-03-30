
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { status, adminNotes } = await req.json();

    if (!status) {
      return NextResponse.json(
        { error: 'El estado es requerido' },
        { status: 400 }
      );
    }

    const permission = await prisma.permissionRequest.update({
      where: { id: params.id },
      data: {
        status,
        adminNotes,
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeId: true,
          }
        }
      }
    });

    return NextResponse.json(permission);

  } catch (error) {
    console.error('Error al actualizar permiso:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Solo admin o el mismo empleado puede eliminar
    const permission = await prisma.permissionRequest.findUnique({
      where: { id: params.id }
    });

    if (!permission) {
      return NextResponse.json({ error: 'Permiso no encontrado' }, { status: 404 });
    }

    await prisma.permissionRequest.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Solicitud eliminada' });

  } catch (error) {
    console.error('Error al eliminar permiso:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
