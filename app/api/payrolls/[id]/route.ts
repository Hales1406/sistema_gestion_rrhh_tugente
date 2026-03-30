
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET - Obtener prenómina específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const payroll = await prisma.payroll.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: {
            employee: {
              select: {
                firstName: true,
                lastName: true,
                employeeId: true,
                position: true,
                department: {
                  select: {
                    name: true
                  }
                }
              }
            }
          },
          orderBy: {
            employee: {
              lastName: 'asc'
            }
          }
        }
      }
    });

    if (!payroll) {
      return NextResponse.json(
        { error: 'Prenómina no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(payroll);
  } catch (error) {
    console.error('Error al obtener prenómina:', error);
    return NextResponse.json(
      { error: 'Error al obtener prenómina' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar prenómina (status o items)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { status, items } = await request.json();

    // Si se actualizan items, recalcular el total
    if (items && Array.isArray(items)) {
      // Actualizar cada item
      await Promise.all(
        items.map(async (item: any) => {
          const totalSalary = item.baseSalary + item.bonus - item.deductions;
          return prisma.payrollItem.update({
            where: { id: item.id },
            data: {
              baseSalary: parseFloat(item.baseSalary),
              bonus: parseFloat(item.bonus || 0),
              deductions: parseFloat(item.deductions || 0),
              totalSalary,
              notes: item.notes || null
            }
          });
        })
      );

      // Recalcular total de la prenómina
      const updatedItems = await prisma.payrollItem.findMany({
        where: { payrollId: params.id }
      });
      const totalAmount = updatedItems.reduce(
        (sum: number, item: any) => sum + item.totalSalary,
        0
      );

      await prisma.payroll.update({
        where: { id: params.id },
        data: { totalAmount }
      });
    }

    // Si se actualiza el status
    if (status) {
      await prisma.payroll.update({
        where: { id: params.id },
        data: { status }
      });
    }

    // Retornar prenómina actualizada
    const payroll = await prisma.payroll.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: {
            employee: {
              select: {
                firstName: true,
                lastName: true,
                employeeId: true,
                position: true,
                department: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    });

    return NextResponse.json(payroll);
  } catch (error) {
    console.error('Error al actualizar prenómina:', error);
    return NextResponse.json(
      { error: 'Error al actualizar prenómina' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar prenómina
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await prisma.payroll.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Prenómina eliminada' });
  } catch (error) {
    console.error('Error al eliminar prenómina:', error);
    return NextResponse.json(
      { error: 'Error al eliminar prenómina' },
      { status: 500 }
    );
  }
}
