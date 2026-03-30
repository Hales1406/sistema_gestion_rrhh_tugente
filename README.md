
# 🏢 TuGente - Sistema de Gestión de Recursos Humanos

Sistema completo de gestión de recursos humanos desarrollado con Next.js, TypeScript y PostgreSQL.

## ✨ Características Principales

### 👥 Gestión de Empleados
- Alta, baja y modificación de empleados
- Visualización de empleados activos e inactivos
- Información detallada de cada empleado
- Control de fechas de alta y baja
- Regeneración de contraseñas de acceso

### 🏛️ Gestión de Departamentos
- Creación y administración de departamentos
- Asignación de empleados a departamentos
- Visualización de estructura organizacional

### ⏰ Control de Tiempo
- Registro de entrada y salida
- Contador de tiempo de trabajo en tiempo real
- Historial de registros con filtros avanzados
- Visualización por empleado, fecha y departamento

### 💰 Gestión de Nóminas
- Sistema de pre-nómina mensual
- Cálculo automático de salarios base
- Gestión de bonos y deducciones
- Historial de nóminas por mes y año
- Exportación de datos

### 📰 Noticias Internas
- Publicación de noticias de la empresa
- Sistema de anuncios para empleados
- Gestión de comunicaciones internas

### 🔐 Permisos y Solicitudes
- Solicitud de permisos por empleados
- Aprobación/rechazo por administradores
- Historial de permisos
- Estados: Pendiente, Aprobado, Rechazado

### ⚙️ Configuración de Empresa
- Información de la empresa
- Configuración de horarios laborales
- Políticas de vacaciones
- Personalización de tema (claro/oscuro)

### 🔒 Autenticación y Seguridad
- Login con email y password
- Cambio de contraseña obligatorio en primer acceso
- Roles: Administrador y Empleado
- Sesiones seguras con NextAuth.js
- Contraseñas hasheadas con bcrypt

## 🚀 Inicio Rápido

Para instrucciones detalladas de instalación y configuración, consulta el archivo:

**📄 [INSTRUCCIONES_INSTALACION_LOCAL.md](./INSTRUCCIONES_INSTALACION_LOCAL.md)**

### Resumen Rápido

```bash
# 1. Instalar dependencias
cd nextjs_space
yarn install

# 2. Configurar .env (ver .env.example)
cp .env.example .env
# Edita .env con tus credenciales de base de datos

# 3. Configurar base de datos
yarn prisma generate
yarn prisma migrate dev
yarn prisma db seed

# 4. Iniciar servidor de desarrollo
yarn dev
```

## 🔑 Credenciales Iniciales

**Administrador:**
- Email: `admin@tugente.com`
- Contraseña: `Admin123!`

## 🛠️ Stack Tecnológico

- **Frontend:** Next.js 14, React 18, TypeScript
- **Styling:** Tailwind CSS, shadcn/ui
- **Backend:** Next.js API Routes
- **Base de Datos:** PostgreSQL + Prisma ORM
- **Autenticación:** NextAuth.js
- **Validación:** Zod, React Hook Form
- **UI Components:** Radix UI, Lucide Icons

## 📱 Características de UX

- 🎨 Modo claro y oscuro
- 📱 Diseño responsive para móviles y tablets
- ⚡ Navegación rápida con SPA
- 🔔 Notificaciones toast
- ⌨️ Formularios validados en tiempo real
- 🎯 Interfaz intuitiva y moderna

## 📊 Roles y Permisos

### Administrador
- Acceso completo al sistema
- Gestión de empleados y departamentos
- Aprobación de permisos
- Gestión de nóminas
- Configuración del sistema
- Publicación de noticias

### Empleado
- Ver información de la empresa
- Registrar tiempo de trabajo
- Solicitar permisos
- Ver noticias internas
- Ver información de compañeros
- Editar perfil personal

## 📁 Estructura del Proyecto

```
tugente/
└── nextjs_space/
    ├── app/                    # App Router de Next.js
    │   ├── admin/             # Páginas de administrador
    │   ├── api/               # API endpoints
    │   ├── auth/              # Páginas de autenticación
    │   ├── personal/          # Páginas de empleados
    │   ├── dashboard/         # Dashboard principal
    │   ├── layout.tsx         # Layout principal
    │   └── page.tsx           # Página de inicio
    ├── components/            # Componentes React
    │   ├── layout/           # Componentes de layout
    │   └── ui/               # Componentes UI (shadcn)
    ├── lib/                   # Utilidades
    │   ├── auth.ts           # Configuración NextAuth
    │   ├── db.ts             # Cliente Prisma
    │   └── types.ts          # Tipos TypeScript
    ├── prisma/               # Configuración Prisma
    │   └── schema.prisma     # Esquema de base de datos
    ├── scripts/              # Scripts de utilidad
    │   └── seed.ts           # Datos iniciales
    └── public/               # Archivos estáticos
```

## 🔄 Flujos Principales

### Onboarding de Empleado
1. Admin crea empleado con opción de cuenta de acceso
2. Sistema genera contraseña temporal
3. Empleado recibe credenciales
4. Primer login obliga a cambiar contraseña
5. Acceso completo al sistema

### Gestión de Tiempo
1. Empleado marca entrada
2. Contador en tiempo real muestra tiempo trabajado
3. Empleado marca salida
4. Sistema registra jornada completa
5. Admin puede ver todos los registros con filtros

### Proceso de Nómina
1. Admin selecciona mes/año
2. Sistema carga empleados activos con salarios base
3. Admin ajusta bonos y deducciones
4. Sistema calcula nómina final
5. Se guarda histórico de nóminas

## 🧪 Testing

```bash
# Verificar tipos TypeScript
yarn tsc --noEmit

# Ejecutar linter
yarn lint

# Ver base de datos con Prisma Studio
yarn prisma studio
```

## 📦 Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `yarn dev` | Servidor de desarrollo (puerto 3000) |
| `yarn build` | Compilar para producción |
| `yarn start` | Iniciar en modo producción |
| `yarn lint` | Ejecutar ESLint |
| `yarn prisma studio` | Abrir Prisma Studio |
| `yarn prisma migrate dev` | Crear nueva migración |
| `yarn prisma generate` | Generar cliente Prisma |
| `yarn prisma db seed` | Poblar base de datos |

## 🔐 Seguridad

- ✅ Contraseñas hasheadas con bcrypt
- ✅ Sesiones JWT seguras
- ✅ Middleware de autenticación
- ✅ Protección de rutas por roles
- ✅ Validación de datos en servidor
- ✅ Sanitización de inputs

## 📄 Licencia

Este proyecto es privado y confidencial.

## 👨‍💻 Desarrollo

Desarrollado con ❤️ usando Next.js y TypeScript

---

**Versión:** 1.0.0  
**Última actualización:** Noviembre 2025
