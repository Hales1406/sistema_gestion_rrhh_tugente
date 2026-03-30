
'use client';

import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loading } from '@/components/ui/loading';
import { StatusBadge } from '@/components/ui/status-badge';
import { Search, Trash2, UserX } from 'lucide-react';
import { toast } from 'sonner';
import { EmployeeData } from '@/lib/types';
import { motion } from 'framer-motion';

export default function InactiveEmployeesPage() {
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/employees');
      const data = await response.json();
      
      setEmployees(data || []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar empleados inactivos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar PERMANENTEMENTE este empleado? Esta acción no se puede deshacer.')) return;

    try {
      const response = await fetch(`/api/employees/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al eliminar');
      }

      if (data.deleted) {
        toast.success('Empleado eliminado permanentemente del sistema');
      }
      
      fetchData();
    } catch (error: any) {
      toast.error(error?.message || 'Error al eliminar empleado');
    }
  };

  const filteredEmployees = employees
    ?.filter(emp => emp?.status === 'INACTIVE')
    ?.filter(emp =>
      `${emp?.firstName} ${emp?.lastName} ${emp?.email} ${emp?.employeeId}`
        ?.toLowerCase()
        ?.includes(searchTerm?.toLowerCase() || '')
    );

  if (loading) {
    return (
      <MainLayout>
        <Loading text="Cargando empleados inactivos..." />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <UserX className="h-8 w-8" />
              Empleados Inactivos
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Empleados desactivados del sistema
            </p>
          </div>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar empleado inactivo por nombre, email o ID..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e?.target?.value || '')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Inactive Employees List */}
        <Card>
          <CardHeader>
            <CardTitle>
              Empleados Inactivos ({filteredEmployees?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredEmployees?.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No se encontraron empleados inactivos
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b dark:border-gray-700">
                      <th className="text-left p-3 font-semibold text-gray-900 dark:text-gray-100">ID</th>
                      <th className="text-left p-3 font-semibold text-gray-900 dark:text-gray-100">Nombre</th>
                      <th className="text-left p-3 font-semibold text-gray-900 dark:text-gray-100">Email</th>
                      <th className="text-left p-3 font-semibold text-gray-900 dark:text-gray-100">Puesto</th>
                      <th className="text-left p-3 font-semibold text-gray-900 dark:text-gray-100">Departamento</th>
                      <th className="text-left p-3 font-semibold text-gray-900 dark:text-gray-100">Fecha de Alta</th>
                      <th className="text-left p-3 font-semibold text-gray-900 dark:text-gray-100">Fecha de Baja</th>
                      <th className="text-left p-3 font-semibold text-gray-900 dark:text-gray-100">Estado</th>
                      <th className="text-left p-3 font-semibold text-gray-900 dark:text-gray-100">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees?.map((employee) => (
                      <motion.tr
                        key={employee?.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <td className="p-3 font-medium text-gray-900 dark:text-gray-100">{employee?.employeeId}</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">
                          {employee?.firstName} {employee?.lastName}
                        </td>
                        <td className="p-3 text-gray-600 dark:text-gray-400">{employee?.email}</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">{employee?.position}</td>
                        <td className="p-3 text-gray-900 dark:text-gray-100">{employee?.department?.name}</td>
                        <td className="p-3 text-gray-600 dark:text-gray-400">
                          {employee?.hireDate ? new Date(employee.hireDate).toLocaleDateString('es-ES') : '-'}
                        </td>
                        <td className="p-3 text-gray-600 dark:text-gray-400">
                          {employee?.deactivatedAt ? new Date(employee.deactivatedAt).toLocaleDateString('es-ES') : '-'}
                        </td>
                        <td className="p-3">
                          <StatusBadge status={employee?.status || 'INACTIVE'} />
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDelete(employee?.id || '')}
                              title="Eliminar permanentemente"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
