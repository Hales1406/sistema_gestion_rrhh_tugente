
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Limpiar datos existentes
  console.log('🗑️  Limpiando datos existentes...');
  await prisma.salaryRecord.deleteMany();
  await prisma.permissionRequest.deleteMany();
  await prisma.timeRecord.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.department.deleteMany();
  await prisma.news.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  // Crear usuario de prueba (john@doe.com / johndoe123)
  console.log('👤 Creando usuarios...');
  const testUserPassword = await hash('johndoe123', 12);
  const adminPassword = await hash('admin123', 12);
  
  const testUser = await prisma.user.create({
    data: {
      email: 'john@doe.com',
      password: testUserPassword,
      name: 'John Doe',
      role: 'ADMIN',
    }
  });

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@tugente.com',
      password: adminPassword,
      name: 'María García',
      role: 'ADMIN',
    }
  });

  const personalUser1 = await prisma.user.create({
    data: {
      email: 'carlos@tugente.com',
      password: await hash('carlos123', 12),
      name: 'Carlos López',
      role: 'PERSONAL',
    }
  });

  const personalUser2 = await prisma.user.create({
    data: {
      email: 'ana@tugente.com',
      password: await hash('ana123', 12),
      name: 'Ana Martínez',
      role: 'PERSONAL',
    }
  });

  // Crear departamentos
  console.log('🏢 Creando departamentos...');
  const departments = await Promise.all([
    prisma.department.create({
      data: {
        name: 'Recursos Humanos',
        manager: 'María García',
        location: 'Piso 1, Oficina 101',
        budget: 150000,
      }
    }),
    prisma.department.create({
      data: {
        name: 'Tecnología',
        manager: 'Pedro Sánchez',
        location: 'Piso 3, Oficina 301',
        budget: 300000,
      }
    }),
    prisma.department.create({
      data: {
        name: 'Ventas',
        manager: 'Laura Fernández',
        location: 'Piso 2, Oficina 201',
        budget: 250000,
      }
    }),
    prisma.department.create({
      data: {
        name: 'Marketing',
        manager: 'Jorge Ramírez',
        location: 'Piso 2, Oficina 205',
        budget: 180000,
      }
    }),
    prisma.department.create({
      data: {
        name: 'Finanzas',
        manager: 'Carmen Ortiz',
        location: 'Piso 1, Oficina 105',
        budget: 200000,
      }
    }),
  ]);

  // Crear empleados
  console.log('👥 Creando empleados...');
  const employees = await Promise.all([
    // Admin employee
    prisma.employee.create({
      data: {
        userId: testUser.id,
        employeeId: 'EMP001',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@doe.com',
        phone: '+34 600 000 001',
        position: 'Director General',
        departmentId: departments[0].id,
        hireDate: new Date('2020-01-15'),
        baseSalary: 65000,
        status: 'ACTIVE',
      }
    }),
    prisma.employee.create({
      data: {
        userId: adminUser.id,
        employeeId: 'EMP002',
        firstName: 'María',
        lastName: 'García',
        email: 'admin@tugente.com',
        phone: '+34 600 000 002',
        position: 'Directora de RRHH',
        departmentId: departments[0].id,
        hireDate: new Date('2020-03-01'),
        baseSalary: 55000,
        status: 'ACTIVE',
      }
    }),
    // Personal employees
    prisma.employee.create({
      data: {
        userId: personalUser1.id,
        employeeId: 'EMP003',
        firstName: 'Carlos',
        lastName: 'López',
        email: 'carlos@tugente.com',
        phone: '+34 600 000 003',
        position: 'Desarrollador Senior',
        departmentId: departments[1].id,
        hireDate: new Date('2021-06-15'),
        baseSalary: 45000,
        status: 'ACTIVE',
      }
    }),
    prisma.employee.create({
      data: {
        userId: personalUser2.id,
        employeeId: 'EMP004',
        firstName: 'Ana',
        lastName: 'Martínez',
        email: 'ana@tugente.com',
        phone: '+34 600 000 004',
        position: 'Gerente de Ventas',
        departmentId: departments[2].id,
        hireDate: new Date('2021-09-01'),
        baseSalary: 48000,
        status: 'ACTIVE',
      }
    }),
    // Additional employees without users
    prisma.employee.create({
      data: {
        employeeId: 'EMP005',
        firstName: 'Pedro',
        lastName: 'Sánchez',
        email: 'pedro@tugente.com',
        phone: '+34 600 000 005',
        position: 'CTO',
        departmentId: departments[1].id,
        hireDate: new Date('2019-11-01'),
        baseSalary: 60000,
        status: 'ACTIVE',
      }
    }),
    prisma.employee.create({
      data: {
        employeeId: 'EMP006',
        firstName: 'Laura',
        lastName: 'Fernández',
        email: 'laura@tugente.com',
        phone: '+34 600 000 006',
        position: 'Directora de Ventas',
        departmentId: departments[2].id,
        hireDate: new Date('2020-05-15'),
        baseSalary: 52000,
        status: 'ACTIVE',
      }
    }),
    prisma.employee.create({
      data: {
        employeeId: 'EMP007',
        firstName: 'Jorge',
        lastName: 'Ramírez',
        email: 'jorge@tugente.com',
        phone: '+34 600 000 007',
        position: 'Director de Marketing',
        departmentId: departments[3].id,
        hireDate: new Date('2020-08-01'),
        baseSalary: 50000,
        status: 'ACTIVE',
      }
    }),
    prisma.employee.create({
      data: {
        employeeId: 'EMP008',
        firstName: 'Carmen',
        lastName: 'Ortiz',
        email: 'carmen@tugente.com',
        phone: '+34 600 000 008',
        position: 'CFO',
        departmentId: departments[4].id,
        hireDate: new Date('2019-07-01'),
        baseSalary: 58000,
        status: 'ACTIVE',
      }
    }),
    prisma.employee.create({
      data: {
        employeeId: 'EMP009',
        firstName: 'David',
        lastName: 'González',
        email: 'david@tugente.com',
        phone: '+34 600 000 009',
        position: 'Desarrollador Junior',
        departmentId: departments[1].id,
        hireDate: new Date('2022-02-01'),
        baseSalary: 32000,
        status: 'ACTIVE',
      }
    }),
    prisma.employee.create({
      data: {
        employeeId: 'EMP010',
        firstName: 'Elena',
        lastName: 'Ruiz',
        email: 'elena@tugente.com',
        phone: '+34 600 000 010',
        position: 'Diseñadora UX/UI',
        departmentId: departments[3].id,
        hireDate: new Date('2022-04-15'),
        baseSalary: 38000,
        status: 'ACTIVE',
      }
    }),
  ]);

  // Crear registros de tiempo
  console.log('⏰ Creando registros de tiempo...');
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  await Promise.all([
    // Registros de hoy
    prisma.timeRecord.create({
      data: {
        employeeId: employees[2].id,
        date: today,
        checkIn: new Date(today.setHours(9, 0, 0, 0)),
        checkOut: new Date(today.setHours(17, 30, 0, 0)),
        hoursWorked: 8.5,
      }
    }),
    // Registros de ayer
    prisma.timeRecord.create({
      data: {
        employeeId: employees[2].id,
        date: yesterday,
        checkIn: new Date(yesterday.setHours(8, 45, 0, 0)),
        checkOut: new Date(yesterday.setHours(17, 15, 0, 0)),
        hoursWorked: 8.5,
      }
    }),
    prisma.timeRecord.create({
      data: {
        employeeId: employees[3].id,
        date: yesterday,
        checkIn: new Date(yesterday.setHours(9, 10, 0, 0)),
        checkOut: new Date(yesterday.setHours(18, 0, 0, 0)),
        hoursWorked: 8.83,
      }
    }),
    // Registros de hace 2 días
    prisma.timeRecord.create({
      data: {
        employeeId: employees[2].id,
        date: twoDaysAgo,
        checkIn: new Date(twoDaysAgo.setHours(9, 5, 0, 0)),
        checkOut: new Date(twoDaysAgo.setHours(17, 40, 0, 0)),
        hoursWorked: 8.58,
      }
    }),
  ]);

  // Crear solicitudes de permisos
  console.log('📝 Creando solicitudes de permisos...');
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextWeekEnd = new Date(nextWeek);
  nextWeekEnd.setDate(nextWeekEnd.getDate() + 4);

  await Promise.all([
    prisma.permissionRequest.create({
      data: {
        employeeId: employees[2].id,
        type: 'VACATION',
        startDate: nextWeek,
        endDate: nextWeekEnd,
        days: 5,
        reason: 'Vacaciones familiares planeadas',
        status: 'PENDING',
      }
    }),
    prisma.permissionRequest.create({
      data: {
        employeeId: employees[3].id,
        type: 'PERSONAL',
        startDate: new Date(today.setDate(today.getDate() + 3)),
        endDate: new Date(today.setDate(today.getDate() + 3)),
        days: 1,
        reason: 'Asuntos personales',
        status: 'APPROVED',
        adminNotes: 'Aprobado sin problemas',
      }
    }),
    prisma.permissionRequest.create({
      data: {
        employeeId: employees[8].id,
        type: 'MEDICAL',
        startDate: new Date(today.setDate(today.getDate() - 2)),
        endDate: new Date(today.setDate(today.getDate() - 2)),
        days: 1,
        reason: 'Cita médica especializada',
        status: 'APPROVED',
        adminNotes: 'Aprobado',
      }
    }),
  ]);

  // Crear registros salariales
  console.log('💰 Creando registros salariales...');
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  await Promise.all([
    prisma.salaryRecord.create({
      data: {
        employeeId: employees[2].id,
        month: currentMonth - 1 || 12,
        year: currentMonth === 1 ? currentYear - 1 : currentYear,
        baseSalary: employees[2].baseSalary,
        bonus: 500,
        deductions: 200,
        hoursWorked: 168,
        totalSalary: employees[2].baseSalary + 500 - 200,
        isPaid: true,
      }
    }),
    prisma.salaryRecord.create({
      data: {
        employeeId: employees[3].id,
        month: currentMonth - 1 || 12,
        year: currentMonth === 1 ? currentYear - 1 : currentYear,
        baseSalary: employees[3].baseSalary,
        bonus: 1000,
        deductions: 150,
        hoursWorked: 176,
        totalSalary: employees[3].baseSalary + 1000 - 150,
        isPaid: true,
      }
    }),
  ]);

  // Crear noticias
  console.log('📰 Creando noticias...');
  await Promise.all([
    prisma.news.create({
      data: {
        title: '¡Bienvenidos a TuGente!',
        content: 'Estamos encantados de presentar nuestro nuevo sistema de gestión de recursos humanos. Aquí podrás gestionar toda tu información laboral de manera fácil y eficiente.',
        priority: 'HIGH',
        isActive: true,
      }
    }),
    prisma.news.create({
      data: {
        title: 'Nuevas Políticas de Teletrabajo',
        content: 'A partir del próximo mes, todos los empleados podrán trabajar desde casa hasta 2 días a la semana. Consulta con tu jefe de departamento para coordinar los horarios.',
        priority: 'NORMAL',
        isActive: true,
      }
    }),
    prisma.news.create({
      data: {
        title: 'Reunión General de Empresa',
        content: 'Se convoca a todos los empleados a la reunión general que se celebrará el próximo viernes a las 10:00 en el salón de actos. Asistencia obligatoria.',
        priority: 'URGENT',
        isActive: true,
      }
    }),
    prisma.news.create({
      data: {
        title: 'Programa de Beneficios 2025',
        content: 'Hemos actualizado nuestro programa de beneficios para empleados. Ahora incluye seguro médico dental, gimnasio gratuito y descuentos en formación continua.',
        priority: 'HIGH',
        isActive: true,
      }
    }),
  ]);

  // Crear configuración de la empresa
  console.log('⚙️  Creando configuración de empresa...');
  await prisma.companySettings.create({
    data: {
      name: 'TuGente',
      description: 'Sistema integral de gestión de recursos humanos',
      address: 'Calle Mayor 123, 28013 Madrid, España',
      phone: '+34 910 123 456',
      email: 'info@tugente.com',
      website: 'https://tugente.com',
      workingHoursStart: '09:00',
      workingHoursEnd: '17:00',
      vacationDaysYear: 22,
    }
  });

  console.log('✅ Seed completado con éxito!');
  console.log('\n📊 Resumen:');
  console.log(`- ${await prisma.user.count()} usuarios creados`);
  console.log(`- ${await prisma.department.count()} departamentos creados`);
  console.log(`- ${await prisma.employee.count()} empleados creados`);
  console.log(`- ${await prisma.timeRecord.count()} registros de tiempo creados`);
  console.log(`- ${await prisma.permissionRequest.count()} solicitudes de permisos creadas`);
  console.log(`- ${await prisma.salaryRecord.count()} registros salariales creados`);
  console.log(`- ${await prisma.news.count()} noticias creadas`);
  console.log('\n🔑 Credenciales de prueba:');
  console.log('Admin: john@doe.com / johndoe123');
  console.log('Admin: admin@tugente.com / admin123');
  console.log('Personal: carlos@tugente.com / carlos123');
  console.log('Personal: ana@tugente.com / ana123');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
