
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
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const employeeName = searchParams.get('employeeName');
    const employeeIdFilter = searchParams.get('employeeId');

    let whereClause: any = {};

    // Si no es admin y tiene un employeeId específico, filtrar por ese empleado
    if (!isAdmin && employeeId) {
      whereClause.employeeId = employeeId;
    } else if (!isAdmin) {
      return NextResponse.json([]);
    }

    // Filtros de fecha
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      whereClause.date = { ...whereClause.date, gte: start };
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      whereClause.date = { ...whereClause.date, lte: end };
    }

    // Filtros por nombre o ID del empleado
    if (employeeName || employeeIdFilter) {
      whereClause.employee = {};
      if (employeeName) {
        whereClause.employee.OR = [
          { firstName: { contains: employeeName, mode: 'insensitive' } },
          { lastName: { contains: employeeName, mode: 'insensitive' } }
        ];
      }
      if (employeeIdFilter) {
        whereClause.employee.employeeId = { contains: employeeIdFilter, mode: 'insensitive' };
      }
    }

    const timeRecords = await prisma.timeRecord.findMany({
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
      orderBy: {
        date: 'desc'
      },
      take: 500
    });

    return NextResponse.json(timeRecords);

  } catch (error) {
    console.error('Error al obtener registros:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { employeeId, type } = await req.json();

    if (!employeeId || !type) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Buscar registro de hoy
    let timeRecord = await prisma.timeRecord.findUnique({
      where: {
        employeeId_date: {
          employeeId,
          date: today
        }
      }
    });

    const now = new Date();

    if (type === 'checkIn') {
      if (timeRecord?.checkIn) {
        return NextResponse.json(
          { error: 'Ya has registrado entrada hoy' },
          { status: 400 }
        );
      }

      if (timeRecord) {
        timeRecord = await prisma.timeRecord.update({
          where: { id: timeRecord.id },
          data: { checkIn: now },
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
      } else {
        timeRecord = await prisma.timeRecord.create({
          data: {
            employeeId,
            date: today,
            checkIn: now,
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
      }
    } else if (type === 'checkOut') {
      if (!timeRecord?.checkIn) {
        return NextResponse.json(
          { error: 'Debes registrar entrada primero' },
          { status: 400 }
        );
      }

      if (timeRecord.checkOut) {
        return NextResponse.json(
          { error: 'Ya has registrado salida hoy' },
          { status: 400 }
        );
      }

      const hoursWorked = (now.getTime() - timeRecord.checkIn.getTime()) / (1000 * 60 * 60);

      timeRecord = await prisma.timeRecord.update({
        where: { id: timeRecord.id },
        data: {
          checkOut: now,
          hoursWorked: Math.round(hoursWorked * 100) / 100
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
    }

    return NextResponse.json(timeRecord);

  } catch (error) {
    console.error('Error al crear registro:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
