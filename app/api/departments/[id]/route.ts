
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const department = await prisma.department.findUnique({
      where: { id: params.id },
      include: {
        employees: {
          orderBy: {
            firstName: 'asc'
          }
        },
        _count: {
          select: { employees: true }
        }
      }
    });

    if (!department) {
      return NextResponse.json({ error: 'Departamento no encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      ...department,
      employeeCount: department?._count?.employees || 0
    });

  } catch (error) {
    console.error('Error al obtener departamento:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { name, manager, location, budget } = await req.json();

    const department = await prisma.department.update({
      where: { id: params.id },
      data: {
        name,
        manager,
        location,
        budget: budget ? parseFloat(budget) : undefined,
      },
      include: {
        _count: {
          select: { employees: true }
        }
      }
    });

    return NextResponse.json({
      ...department,
      employeeCount: department?._count?.employees || 0
    });

  } catch (error) {
    console.error('Error al actualizar departamento:', error);
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

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    // Verificar si hay empleados en el departamento
    const employeeCount = await prisma.employee.count({
      where: { departmentId: params.id }
    });

    if (employeeCount > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar un departamento con empleados' },
        { status: 400 }
      );
    }

    await prisma.department.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Departamento eliminado' });

  } catch (error) {
    console.error('Error al eliminar departamento:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
