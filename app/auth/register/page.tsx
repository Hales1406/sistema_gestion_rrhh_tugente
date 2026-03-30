
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir a login después de 3 segundos
    const timeout = setTimeout(() => {
      router.push('/auth/login');
    }, 3000);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center">
              <Building2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">TuGente</CardTitle>
          <CardDescription className="text-base">
            Sistema de Gestión de Recursos Humanos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-full bg-amber-100 flex items-center justify-center">
              <Shield className="h-10 w-10 text-amber-600" />
            </div>
          </div>
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold text-gray-900">
              Registro Restringido
            </h3>
            <p className="text-gray-600 leading-relaxed">
              El registro público no está disponible. Solo los administradores pueden crear nuevas cuentas de empleados.
            </p>
            <p className="text-sm text-gray-500">
              Si eres un empleado, contacta con el departamento de RRHH para obtener tus credenciales de acceso.
            </p>
          </div>
          <div className="space-y-3">
            <Button
              onClick={() => router.push('/auth/login')}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Ir a Inicio de Sesión
            </Button>
            <p className="text-center text-xs text-gray-500">
              Serás redirigido automáticamente en unos segundos...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
