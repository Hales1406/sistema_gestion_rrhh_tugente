
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { Clock, LogIn, LogOut, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { TimeRecordData } from '@/lib/types';
import { motion } from 'framer-motion';

export default function PersonalTimePage() {
  const { data: session } = useSession() || {};
  const [timeRecords, setTimeRecords] = useState<TimeRecordData[]>([]);
  const [currentEmployee, setCurrentEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [todayRecord, setTodayRecord] = useState<TimeRecordData | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  // Contador de tiempo en vivo
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (todayRecord?.checkIn && !todayRecord?.checkOut) {
      // Calcular tiempo transcurrido inicial
      const checkInTime = new Date(todayRecord.checkIn).getTime();
      const updateElapsed = () => {
        const now = Date.now();
        const elapsed = Math.floor((now - checkInTime) / 1000); // segundos
        setElapsedTime(elapsed);
      };
      
      updateElapsed(); // Actualizar inmediatamente
      interval = setInterval(updateElapsed, 1000); // Actualizar cada segundo
    } else {
      setElapsedTime(0);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [todayRecord]);

  const fetchData = async () => {
    try {
      // Obtener el empleado actual
      const meRes = await fetch('/api/me');
      const meData = await meRes.json();
      setCurrentEmployee(meData?.employee);

      if (meData?.employee?.id) {
        // Obtener registros de tiempo
        const timeRes = await fetch(`/api/time-records?employeeId=${meData.employee.id}`);
        const timeData = await timeRes.json();
        setTimeRecords(timeData || []);

        // Buscar registro de hoy
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayRec = timeData?.find((r: any) => {
          const recordDate = new Date(r.date);
          recordDate.setHours(0, 0, 0, 0);
          return recordDate.getTime() === today.getTime();
        });
        setTodayRecord(todayRec || null);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!currentEmployee?.id) {
      toast.error('No se pudo identificar el empleado');
      return;
    }

    try {
      const response = await fetch('/api/time-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: currentEmployee.id,
          type: 'checkIn',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al registrar entrada');
      }

      const newRecord = await response.json();
      
      toast.success('¡Entrada registrada exitosamente!');
      
      // Actualizar el registro de hoy inmediatamente
      setTodayRecord(newRecord);
      
      // Agregar el nuevo registro al historial
      setTimeRecords(prev => [newRecord, ...(prev || [])]);
    } catch (error: any) {
      toast.error(error?.message || 'Error al registrar entrada');
    }
  };

  const handleCheckOut = async () => {
    if (!currentEmployee?.id) {
      toast.error('No se pudo identificar el empleado');
      return;
    }

    try {
      const response = await fetch('/api/time-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: currentEmployee.id,
          type: 'checkOut',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al registrar salida');
      }

      const updatedRecord = await response.json();
      
      toast.success('¡Salida registrada exitosamente!');
      
      // Actualizar el registro de hoy inmediatamente
      setTodayRecord(updatedRecord);
      
      // Actualizar el registro en el historial
      setTimeRecords(prev => 
        (prev || []).map(record => 
          record?.id === updatedRecord?.id ? updatedRecord : record
        )
      );
    } catch (error: any) {
      toast.error(error?.message || 'Error al registrar salida');
    }
  };

  const formatTime = (date: Date | string) => {
    if (!date) return '-';
    return new Date(date).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatElapsedTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalHours = timeRecords?.reduce((acc, record) => acc + (record?.hoursWorked || 0), 0);

  if (loading) {
    return (
      <MainLayout>
        <Loading text="Cargando..." />
      </MainLayout>
    );
  }

  if (!currentEmployee) {
    return (
      <MainLayout>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No tienes un perfil de empleado asociado. Contacta con RRHH.
            </p>
          </CardContent>
        </Card>
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
            Control de Tiempo
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Registra tu jornada laboral diaria
          </p>
        </div>

        {/* Check-in/out Card */}
        <Card className="border-2 border-blue-200 dark:border-blue-900 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950 dark:to-gray-900">
          <CardHeader>
            <CardTitle>Registro de Hoy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">Estado</p>
                {todayRecord?.checkIn && !todayRecord?.checkOut ? (
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">En jornada laboral</p>
                ) : todayRecord?.checkOut ? (
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400">Jornada finalizada</p>
                ) : (
                  <p className="text-xl font-bold text-gray-600 dark:text-gray-400">Sin registrar</p>
                )}
              </div>
              {todayRecord?.checkIn && !todayRecord?.checkOut && (
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Tiempo transcurrido</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400 font-mono">
                    {formatElapsedTime(elapsedTime)}
                  </p>
                </div>
              )}
              {todayRecord?.checkIn && todayRecord?.checkOut && (
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Horas trabajadas</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {Math.round((todayRecord?.hoursWorked || 0) * 10) / 10}h
                  </p>
                </div>
              )}
            </div>

            {todayRecord && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Entrada</p>
                  <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                    {formatTime(todayRecord?.checkIn || '')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Salida</p>
                  <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                    {todayRecord?.checkOut ? formatTime(todayRecord.checkOut) : 'Pendiente'}
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <Button
                onClick={handleCheckIn}
                disabled={!!todayRecord?.checkIn}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300"
                size="lg"
              >
                <LogIn className="h-5 w-5 mr-2" />
                Registrar Entrada
              </Button>
              <Button
                onClick={handleCheckOut}
                disabled={!todayRecord?.checkIn || !!todayRecord?.checkOut}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
                size="lg"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Registrar Salida
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Registros</p>
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Promedio/Día</p>
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

        {/* History */}
        <Card>
          <CardHeader>
            <CardTitle>Historial de Registros</CardTitle>
          </CardHeader>
          <CardContent>
            {timeRecords?.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No tienes registros de tiempo
              </p>
            ) : (
              <div className="space-y-3">
                {timeRecords?.slice(0, 10)?.map((record) => (
                  <motion.div
                    key={record?.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {new Date(record?.date)?.toLocaleDateString('es-ES', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Entrada: <span className="font-medium">{formatTime(record?.checkIn || '')}</span>
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Salida: <span className="font-medium">{formatTime(record?.checkOut || '')}</span>
                          </span>
                        </div>
                      </div>
                      {record?.hoursWorked && (
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {Math.round((record.hoursWorked || 0) * 10) / 10}h
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
