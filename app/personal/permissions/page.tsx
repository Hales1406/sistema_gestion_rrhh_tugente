
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loading } from '@/components/ui/loading';
import { StatusBadge } from '@/components/ui/status-badge';
import { Calendar, Plus, Clock, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { PermissionRequestData } from '@/lib/types';
import { motion } from 'framer-motion';

const PERMISSION_TYPES = [
  { value: 'VACATION', label: 'Vacaciones' },
  { value: 'PERSONAL', label: 'Personal' },
  { value: 'MEDICAL', label: 'Médico' },
  { value: 'MATERNITY', label: 'Maternidad' },
  { value: 'PATERNITY', label: 'Paternidad' },
];

export default function PersonalPermissionsPage() {
  const { data: session } = useSession() || {};
  const [permissions, setPermissions] = useState<PermissionRequestData[]>([]);
  const [currentEmployee, setCurrentEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Obtener el empleado actual
      const meRes = await fetch('/api/me');
      const meData = await meRes.json();
      setCurrentEmployee(meData?.employee);

      if (meData?.employee?.id) {
        // Obtener mis permisos
        const permissionsRes = await fetch(`/api/permissions?employeeId=${meData.employee.id}`);
        const permissionsData = await permissionsRes.json();
        setPermissions(permissionsData || []);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!currentEmployee?.id) {
      toast.error('No se pudo identificar el empleado');
      return;
    }

    const formData = new FormData(e.currentTarget);
    
    const data = {
      employeeId: currentEmployee.id,
      type: formData.get('type'),
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate'),
      reason: formData.get('reason'),
    };

    try {
      const response = await fetch('/api/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear solicitud');
      }

      toast.success('Solicitud de permiso enviada');
      setIsDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error?.message || 'Error al crear solicitud');
    }
  };

  const filterByStatus = (status: string) => {
    return permissions?.filter(p => p?.status === status) || [];
  };

  const pending = filterByStatus('PENDING');
  const approved = filterByStatus('APPROVED');
  const rejected = filterByStatus('REJECTED');

  if (loading) {
    return (
      <MainLayout>
        <Loading text="Cargando permisos..." />
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="h-8 w-8" />
              Mis Permisos
            </h1>
            <p className="text-gray-500 mt-1">
              Solicita y gestiona tus permisos laborales
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Solicitud
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nueva Solicitud de Permiso</DialogTitle>
                <DialogDescription>
                  Completa los detalles de tu solicitud
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de Permiso *</Label>
                  <Select name="type" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {PERMISSION_TYPES?.map((type) => (
                        <SelectItem key={type?.value} value={type?.value || ''}>
                          {type?.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Fecha de Inicio *</Label>
                    <Input
                      id="startDate"
                      name="startDate"
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Fecha de Fin *</Label>
                    <Input
                      id="endDate"
                      name="endDate"
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Motivo *</Label>
                  <Textarea
                    id="reason"
                    name="reason"
                    placeholder="Explica el motivo de tu solicitud..."
                    rows={3}
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Enviar Solicitud
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pendientes</p>
                  <p className="text-3xl font-bold text-orange-600">{pending?.length || 0}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Aprobadas</p>
                  <p className="text-3xl font-bold text-green-600">{approved?.length || 0}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rechazadas</p>
                  <p className="text-3xl font-bold text-red-600">{rejected?.length || 0}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Permissions List */}
        <Card>
          <CardHeader>
            <CardTitle>Mis Solicitudes</CardTitle>
          </CardHeader>
          <CardContent>
            {permissions?.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No tienes solicitudes de permisos</p>
                <Button
                  className="mt-4 bg-blue-600 hover:bg-blue-700"
                  onClick={() => setIsDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primera Solicitud
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {permissions?.map((permission) => (
                  <motion.div
                    key={permission?.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-4 rounded-lg border ${
                      permission?.status === 'PENDING'
                        ? 'bg-orange-50 border-orange-200'
                        : permission?.status === 'APPROVED'
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <StatusBadge status={permission?.type || ''} />
                          <StatusBadge status={permission?.status || ''} />
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Inicio:</span>{' '}
                            <span className="font-medium">
                              {new Date(permission?.startDate)?.toLocaleDateString('es-ES')}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Fin:</span>{' '}
                            <span className="font-medium">
                              {new Date(permission?.endDate)?.toLocaleDateString('es-ES')}
                            </span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-600 dark:text-gray-400">Días:</span>{' '}
                            <span className="font-medium">{permission?.days}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">
                          <span className="font-medium">Motivo:</span> {permission?.reason}
                        </p>
                        {permission?.adminNotes && (
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            <span className="font-medium">Nota del administrador:</span> {permission.adminNotes}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Solicitado el {new Date(permission?.createdAt)?.toLocaleDateString('es-ES')}
                        </p>
                      </div>
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
