
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

    // Obtener la configuración de la empresa
    let settings = await prisma.companySettings.findFirst();

    // Si no existe, crear una por defecto
    if (!settings) {
      settings = await prisma.companySettings.create({
        data: {
          name: 'TuGente',
          description: 'Sistema integral de gestión de recursos humanos',
          workingHoursStart: '09:00',
          workingHoursEnd: '17:00',
          vacationDaysYear: 22,
        }
      });
    }

    return NextResponse.json(settings);

  } catch (error) {
    console.error('Error al obtener configuración:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const data = await req.json();

    // Obtener el primer registro de configuración
    const existingSettings = await prisma.companySettings.findFirst();

    let settings;
    if (existingSettings) {
      // Actualizar el existente
      settings = await prisma.companySettings.update({
        where: { id: existingSettings.id },
        data: {
          name: data.name,
          description: data.description,
          address: data.address,
          phone: data.phone,
          email: data.email,
          website: data.website,
          workingHoursStart: data.workingHoursStart,
          workingHoursEnd: data.workingHoursEnd,
          vacationDaysYear: parseInt(data.vacationDaysYear),
        }
      });
    } else {
      // Crear uno nuevo si no existe
      settings = await prisma.companySettings.create({
        data: {
          name: data.name,
          description: data.description,
          address: data.address,
          phone: data.phone,
          email: data.email,
          website: data.website,
          workingHoursStart: data.workingHoursStart,
          workingHoursEnd: data.workingHoursEnd,
          vacationDaysYear: parseInt(data.vacationDaysYear),
        }
      });
    }

    return NextResponse.json(settings);

  } catch (error) {
    console.error('Error al actualizar configuración:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
