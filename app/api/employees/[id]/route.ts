
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

    const employee = await prisma.employee.findUnique({
      where: { id: params.id },
      include: {
        department: true,
        timeRecords: {
          orderBy: { date: 'desc' },
          take: 10
        },
        permissionRequests: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        salaryRecords: {
          orderBy: [
            { year: 'desc' },
            { month: 'desc' }
          ],
          take: 12
        }
      }
    });

    if (!employee) {
      return NextResponse.json({ error: 'Empleado no encontrado' }, { status: 404 });
    }

    return NextResponse.json(employee);

  } catch (error) {
    console.error('Error al obtener empleado:', error);
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

    const data = await req.json();

    const employee = await prisma.employee.update({
      where: { id: params.id },
      data: {
        ...data,
        hireDate: data.hireDate ? new Date(data.hireDate) : undefined,
        baseSalary: data.baseSalary ? parseFloat(data.baseSalary) : undefined,
      },
      include: {
        department: true
      }
    });

    return NextResponse.json(employee);

  } catch (error) {
    console.error('Error al actualizar empleado:', error);
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

    // Obtener el empleado actual para verificar su estado
    const employee = await prisma.employee.findUnique({
      where: { id: params.id }
    });

    if (!employee) {
      return NextResponse.json({ error: 'Empleado no encontrado' }, { status: 404 });
    }

    // Si está ACTIVE, desactivarlo
    if (employee.status === 'ACTIVE') {
      const updatedEmployee = await prisma.employee.update({
        where: { id: params.id },
        data: { 
          status: 'INACTIVE',
          deactivatedAt: new Date()
        }
      });

      return NextResponse.json({ 
        message: 'Empleado desactivado exitosamente',
        deactivated: true,
        employee: updatedEmployee
      });
    }

    // Si ya está INACTIVE, eliminarlo completamente
    try {
      await prisma.employee.delete({
        where: { id: params.id }
      });

      return NextResponse.json({ 
        message: 'Empleado eliminado completamente del sistema',
        deleted: true
      });
    } catch (deleteError: any) {
      // Si hay error de foreign key, notificar al usuario
      if (deleteError.code === 'P2003' || deleteError.message?.includes('Foreign key constraint')) {
        return NextResponse.json({ 
          error: 'No se puede eliminar el empleado porque tiene registros asociados (prenóminas, registros de tiempo, etc.)'
        }, { status: 400 });
      }
      
      throw deleteError;
    }

  } catch (error) {
    console.error('Error al eliminar/desactivar empleado:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
