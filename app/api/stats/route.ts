
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

    // Obtener estadísticas
    const totalEmployees = await prisma.employee.count();
    const activeEmployees = await prisma.employee.count({
      where: { status: 'ACTIVE' }
    });
    const totalDepartments = await prisma.department.count();
    const pendingPermissions = await prisma.permissionRequest.count({
      where: { status: 'PENDING' }
    });

    // Obtener registros de tiempo de hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayCheckedIn = await prisma.timeRecord.count({
      where: {
        date: {
          gte: today,
          lt: tomorrow
        },
        checkIn: {
          not: null
        }
      }
    });

    return NextResponse.json({
      totalEmployees,
      activeEmployees,
      totalDepartments,
      pendingPermissions,
      todayCheckedIn,
    });

  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
