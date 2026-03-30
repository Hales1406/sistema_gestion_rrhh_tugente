
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET - Obtener todas las prenóminas
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const payrolls = await prisma.payroll.findMany({
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
      },
      orderBy: [
        { year: 'desc' },
        { month: 'desc' }
      ]
    });

    return NextResponse.json(payrolls);
  } catch (error) {
    console.error('Error al obtener prenóminas:', error);
    return NextResponse.json(
      { error: 'Error al obtener prenóminas' },
      { status: 500 }
    );
  }
}

// POST - Crear nueva prenómina mensual
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { month, year } = await request.json();

    // Verificar si ya existe una prenómina para ese mes/año
    const existing = await prisma.payroll.findUnique({
      where: {
        month_year: {
          month: parseInt(month),
          year: parseInt(year)
        }
      }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Ya existe una prenómina para este período' },
        { status: 400 }
      );
    }

    // Obtener todos los empleados activos
    const employees = await prisma.employee.findMany({
      where: {
        status: 'ACTIVE'
      },
      include: {
        timeRecords: {
          where: {
            date: {
              gte: new Date(parseInt(year), parseInt(month) - 1, 1),
              lt: new Date(parseInt(year), parseInt(month), 1)
            }
          }
        }
      }
    });

    // Calcular horas trabajadas para cada empleado
    const items = employees.map((emp: any) => {
      const hoursWorked = emp.timeRecords.reduce((total: number, record: any) => {
        if (record.checkOut && record.checkIn) {
          const hours = (new Date(record.checkOut).getTime() - new Date(record.checkIn).getTime()) / (1000 * 60 * 60);
          return total + hours;
        }
        return total;
      }, 0);

      return {
        employeeId: emp.id,
        baseSalary: emp.baseSalary,
        bonus: 0,
        deductions: 0,
        hoursWorked: Math.round(hoursWorked * 100) / 100,
        totalSalary: emp.baseSalary,
        notes: null
      };
    });

    const totalAmount = items.reduce((sum: number, item: any) => sum + item.totalSalary, 0);

    // Crear prenómina con sus items
    const payroll = await prisma.payroll.create({
      data: {
        month: parseInt(month),
        year: parseInt(year),
        status: 'DRAFT',
        totalAmount,
        items: {
          create: items
        }
      },
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
    console.error('Error al crear prenómina:', error);
    return NextResponse.json(
      { error: 'Error al crear prenómina' },
      { status: 500 }
    );
  }
}
