
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

    const isAdmin = session.user.role === 'ADMIN';
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get('employeeId');

    let whereClause: any = {};

    if (!isAdmin && employeeId) {
      whereClause.employeeId = employeeId;
    } else if (!isAdmin) {
      return NextResponse.json([]);
    }

    const salaries = await prisma.salaryRecord.findMany({
      where: whereClause,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeId: true,
          }
        }
      },
      orderBy: [
        { year: 'desc' },
        { month: 'desc' }
      ]
    });

    return NextResponse.json(salaries);

  } catch (error) {
    console.error('Error al obtener salarios:', error);
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

    const { employeeId, month, year, bonus, deductions } = await req.json();

    if (!employeeId || !month || !year) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Obtener empleado para el salario base
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId }
    });

    if (!employee) {
      return NextResponse.json({ error: 'Empleado no encontrado' }, { status: 404 });
    }

    // Calcular horas trabajadas en el mes
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const timeRecords = await prisma.timeRecord.findMany({
      where: {
        employeeId,
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    const hoursWorked = timeRecords?.reduce((acc, record) => acc + (record?.hoursWorked || 0), 0);

    // Calcular salario total
    const baseSalary = employee.baseSalary;
    const bonusAmount = parseFloat(bonus || '0');
    const deductionsAmount = parseFloat(deductions || '0');
    const totalSalary = baseSalary + bonusAmount - deductionsAmount;

    const salary = await prisma.salaryRecord.create({
      data: {
        employeeId,
        month: parseInt(month),
        year: parseInt(year),
        baseSalary,
        bonus: bonusAmount,
        deductions: deductionsAmount,
        hoursWorked,
        totalSalary,
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

    return NextResponse.json(salary);

  } catch (error) {
    console.error('Error al crear registro salarial:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
