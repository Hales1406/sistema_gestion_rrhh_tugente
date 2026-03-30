
'use client';

import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loading } from '@/components/ui/loading';
import { StatusBadge } from '@/components/ui/status-badge';
import { Users, Search, Mail, Phone, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { EmployeeData } from '@/lib/types';
import { motion } from 'framer-motion';

export default function PersonalEmployeesPage() {
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees');
      const data = await response.json();
      setEmployees(data || []);
    } catch (error) {
      console.error('Error al cargar empleados:', error);
      toast.error('Error al cargar empleados');
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees?.filter(emp =>
    `${emp?.firstName} ${emp?.lastName} ${emp?.email} ${emp?.position}`
      ?.toLowerCase()
      ?.includes(searchTerm?.toLowerCase() || '')
  );

  if (loading) {
    return (
      <MainLayout>
        <Loading text="Cargando empleados..." />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-8 w-8" />
            Directorio de Personal
          </h1>
          <p className="text-gray-500 mt-1">
            Explora el directorio de empleados de la empresa
          </p>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, email o puesto..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e?.target?.value || '')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Employees Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees?.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No se encontraron empleados</p>
            </div>
          ) : (
            filteredEmployees?.map((employee) => (
              <motion.div
                key={employee?.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                className="transition-transform duration-200"
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-xl font-bold text-blue-600">
                          {employee?.firstName?.charAt(0)}{employee?.lastName?.charAt(0)}
                        </span>
                      </div>
                      <StatusBadge status={employee?.status || 'ACTIVE'} />
                    </div>
                    <CardTitle className="text-lg">
                      {employee?.firstName} {employee?.lastName}
                    </CardTitle>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{employee?.employeeId}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Briefcase className="h-4 w-4" />
                      <span>{employee?.position}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Users className="h-4 w-4" />
                      <span>{employee?.department?.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Mail className="h-4 w-4" />
                      <a 
                        href={`mailto:${employee?.email}`}
                        className="hover:text-blue-600 transition-colors truncate"
                      >
                        {employee?.email}
                      </a>
                    </div>
                    {employee?.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Phone className="h-4 w-4" />
                        <a 
                          href={`tel:${employee?.phone}`}
                          className="hover:text-blue-600 transition-colors"
                        >
                          {employee.phone}
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
}
