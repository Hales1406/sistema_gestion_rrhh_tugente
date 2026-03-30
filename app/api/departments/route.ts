
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const departments = await prisma.department.findMany({
      include: {
        _count: {
          select: { employees: true }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Transform data to include employee count
    const departmentsWithCount = departments?.map(dept => ({
      ...dept,
      employeeCount: dept?._count?.employees || 0
    }));

    return NextResponse.json(departmentsWithCount);

  } catch (error) {
    console.error('Error al obtener departamentos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { name, manager, location, budget } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: 'El nombre es requerido' },
        { status: 400 }
      );
    }

    // Verificar si el departamento ya existe
    const existingDepartment = await prisma.department.findUnique({
      where: { name }
    });

    if (existingDepartment) {
      return NextResponse.json(
        { error: 'El departamento ya existe' },
        { status: 409 }
      );
    }

    const department = await prisma.department.create({
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
    console.error('Error al crear departamento:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
