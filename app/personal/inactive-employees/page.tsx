
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import { StatusBadge } from '@/components/ui/status-badge';
import { UserX, Mail, Phone, Briefcase, Building2, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function InactiveEmployeesPage() {
  const { data: session } = useSession() || {};
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees?showInactive=true');
      if (response.ok) {
        const data = await response.json();
        // Filtrar solo los empleados con status INACTIVE
        const inactiveEmployees = data?.filter((emp: any) => emp?.status === 'INACTIVE') || [];
        setEmployees(inactiveEmployees);
      } else {
        toast.error('Error al cargar empleados desactivados');
      }
    } catch (error) {
      console.error('Error al cargar empleados:', error);
      toast.error('Error al cargar empleados desactivados');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <Loading text="Cargando empleados desactivados..." />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <UserX className="h-8 w-8" />
            Trabajadores Desactivados
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Listado de empleados que ya no están activos en la empresa
          </p>
        </div>

        {/* Stats */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Empleados Desactivados</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{employees?.length || 0}</p>
              </div>
              <UserX className="h-10 w-10 text-red-600" />
            </div>
          </CardContent>
        </Card>

        {/* Employees List */}
        {employees?.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <UserX className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                No hay empleados desactivados
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {employees?.map((employee, index) => (
              <motion.div
                key={employee?.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow border-2 border-red-200 dark:border-red-800">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">
                          {employee?.firstName} {employee?.lastName}
                        </CardTitle>
                        <StatusBadge status={employee?.status || 'INACTIVE'} />
                      </div>
                      <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                        <span className="text-lg font-bold text-red-600 dark:text-red-300">
                          {employee?.firstName?.charAt(0)}{employee?.lastName?.charAt(0)}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Briefcase className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">ID: {employee?.employeeId}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Briefcase className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">{employee?.position}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">{employee?.department?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-gray-600 dark:text-gray-400 break-all">{employee?.email}</p>
                      </div>
                    </div>
                    {employee?.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">{employee.phone}</p>
                        </div>
                      </div>
                    )}
                    <div className="pt-3 border-t dark:border-gray-700">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">
                            Ingreso: {new Date(employee?.hireDate)?.toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
