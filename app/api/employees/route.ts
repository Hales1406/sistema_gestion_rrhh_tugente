
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { hash } from 'bcryptjs';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const showInactive = searchParams.get('showInactive') === 'true';

    // Por defecto, solo mostrar empleados activos
    const whereClause: any = showInactive ? {} : { status: 'ACTIVE' };

    const employees = await prisma.employee.findMany({
      where: whereClause,
      include: {
        department: true,
        user: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(employees);

  } catch (error) {
    console.error('Error al obtener empleados:', error);
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

    const {
      employeeId,
      firstName,
      lastName,
      email,
      phone,
      position,
      departmentId,
      hireDate,
      baseSalary,
      createUser,
      userPassword,
      userRole
    } = await req.json();

    if (!employeeId || !firstName || !lastName || !email || !position || !departmentId || !hireDate || !baseSalary) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Verificar si el ID de empleado ya existe
    const existingEmployee = await prisma.employee.findUnique({
      where: { employeeId }
    });

    if (existingEmployee) {
      return NextResponse.json(
        { error: 'El ID de empleado ya existe' },
        { status: 409 }
      );
    }

    // Verificar si el email ya existe
    const existingEmailEmployee = await prisma.employee.findUnique({
      where: { email }
    });

    if (existingEmailEmployee) {
      return NextResponse.json(
        { error: 'El email ya está registrado en otro empleado' },
        { status: 409 }
      );
    }

    // Si se debe crear un usuario, verificar que no exista
    let userId = null;
    if (createUser) {
      if (!userPassword) {
        return NextResponse.json(
          { error: 'Se requiere una contraseña para crear el usuario' },
          { status: 400 }
        );
      }

      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Ya existe un usuario con este email' },
          { status: 409 }
        );
      }

      // Crear el usuario
      const hashedPassword = await hash(userPassword, 12);
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: `${firstName} ${lastName}`,
          role: userRole || 'PERSONAL',
          mustChangePassword: true,
        }
      });
      userId = user.id;
    }

    const employee = await prisma.employee.create({
      data: {
        employeeId,
        firstName,
        lastName,
        email,
        phone,
        position,
        departmentId,
        hireDate: new Date(hireDate),
        baseSalary: parseFloat(baseSalary),
        status: 'ACTIVE',
        userId: userId,
      },
      include: {
        department: true,
        user: true,
      }
    });

    return NextResponse.json(employee);

  } catch (error) {
    console.error('Error al crear empleado:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
