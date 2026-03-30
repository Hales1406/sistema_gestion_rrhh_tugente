
'use client';

import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { Clock, TrendingUp, Filter, X } from 'lucide-react';
import { toast } from 'sonner';
import { TimeRecordData } from '@/lib/types';
import { motion } from 'framer-motion';

export default function TimeRecordsPage() {
  const [timeRecords, setTimeRecords] = useState<TimeRecordData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    employeeName: '',
    employeeId: ''
  });

  useEffect(() => {
    fetchTimeRecords();
  }, []);

  const fetchTimeRecords = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.employeeName) params.append('employeeName', filters.employeeName);
      if (filters.employeeId) params.append('employeeId', filters.employeeId);

      const response = await fetch(`/api/time-records?${params.toString()}`);
      const data = await response.json();
      setTimeRecords(data || []);
    } catch (error) {
      console.error('Error al cargar registros:', error);
      toast.error('Error al cargar registros de tiempo');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    setLoading(true);
    fetchTimeRecords();
  };

  const handleClearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      employeeName: '',
      employeeId: ''
    });
    setLoading(true);
    setTimeout(() => fetchTimeRecords(), 100);
  };

  const formatTime = (date: Date | string) => {
    if (!date) return '-';
    return new Date(date).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalHours = timeRecords?.reduce((acc, record) => acc + (record?.hoursWorked || 0), 0);

  if (loading) {
    return (
      <MainLayout>
        <Loading text="Cargando registros..." />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Clock className="h-8 w-8" />
            Registros de Tiempo
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Historial de check-in y check-out de todos los empleados
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros de Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Fecha Inicio
                </label>
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Fecha Fin
                </label>
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Nombre Empleado
                </label>
                <Input
                  type="text"
                  placeholder="Buscar por nombre..."
                  value={filters.employeeName}
                  onChange={(e) => setFilters({ ...filters, employeeName: e.target.value })}
                  className="dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  ID Empleado
                </label>
                <Input
                  type="text"
                  placeholder="Buscar por ID..."
                  value={filters.employeeId}
                  onChange={(e) => setFilters({ ...filters, employeeId: e.target.value })}
                  className="dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <Button onClick={handleApplyFilters} className="bg-blue-600 hover:bg-blue-700">
                <Filter className="h-4 w-4 mr-2" />
                Aplicar Filtros
              </Button>
              <Button onClick={handleClearFilters} variant="outline">
                <X className="h-4 w-4 mr-2" />
                Limpiar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Registros</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{timeRecords?.length || 0}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Horas Totales</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {Math.round((totalHours || 0) * 10) / 10}h
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Promedio Horas/Día</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {timeRecords?.length > 0 
                      ? Math.round(((totalHours || 0) / timeRecords.length) * 10) / 10
                      : 0}h
                  </p>
                </div>
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Records Table */}
        <Card>
          <CardHeader>
            <CardTitle>Historial de Registros</CardTitle>
          </CardHeader>
          <CardContent>
            {timeRecords?.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No hay registros de tiempo
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b dark:border-gray-700">
                      <th className="text-left p-3 font-semibold">Fecha</th>
                      <th className="text-left p-3 font-semibold">Empleado</th>
                      <th className="text-left p-3 font-semibold">ID Empleado</th>
                      <th className="text-left p-3 font-semibold">Check-in</th>
                      <th className="text-left p-3 font-semibold">Check-out</th>
                      <th className="text-left p-3 font-semibold">Horas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timeRecords?.map((record) => (
                      <motion.tr
                        key={record?.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <td className="p-3 font-medium">
                          {new Date(record?.date)?.toLocaleDateString('es-ES', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="p-3">
                          {record?.employee?.firstName} {record?.employee?.lastName}
                        </td>
                        <td className="p-3 text-gray-600 dark:text-gray-400">{record?.employee?.employeeId}</td>
                        <td className="p-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {formatTime(record?.checkIn || '')}
                          </span>
                        </td>
                        <td className="p-3">
                          {record?.checkOut ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {formatTime(record?.checkOut || '')}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">En progreso</span>
                          )}
                        </td>
                        <td className="p-3 font-semibold">
                          {record?.hoursWorked 
                            ? `${Math.round((record.hoursWorked || 0) * 10) / 10}h`
                            : '-'}
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
