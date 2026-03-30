
'use client';

import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loading } from '@/components/ui/loading';
import { StatusBadge } from '@/components/ui/status-badge';
import { FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { PermissionRequestData } from '@/lib/types';
import { motion } from 'framer-motion';
import { Label } from '@/components/ui/label';

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<PermissionRequestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPermission, setSelectedPermission] = useState<PermissionRequestData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      const response = await fetch('/api/permissions');
      const data = await response.json();
      setPermissions(data || []);
    } catch (error) {
      console.error('Error al cargar permisos:', error);
      toast.error('Error al cargar permisos');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string, adminNotes?: string) => {
    try {
      const response = await fetch(`/api/permissions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminNotes }),
      });

      if (!response.ok) throw new Error('Error al actualizar');

      toast.success(`Solicitud ${status === 'APPROVED' ? 'aprobada' : 'rechazada'}`);
      setIsDialogOpen(false);
      setSelectedPermission(null);
      fetchPermissions();
    } catch (error) {
      toast.error('Error al actualizar solicitud');
    }
  };

  const handleSubmitReview = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPermission) return;

    const formData = new FormData(e.currentTarget);
    const status = formData.get('status') as string;
    const adminNotes = formData.get('adminNotes') as string;

    handleUpdateStatus(selectedPermission.id, status, adminNotes);
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
        <Loading text="Cargando solicitudes..." />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Gestión de Permisos
          </h1>
          <p className="text-gray-500 mt-1">
            Revisa y gestiona las solicitudes de permisos de los empleados
          </p>
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

        {/* Pending Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              Solicitudes Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pending?.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No hay solicitudes pendientes
              </p>
            ) : (
              <div className="space-y-4">
                {pending?.map((permission) => (
                  <motion.div
                    key={permission?.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 bg-orange-50 rounded-lg border border-orange-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                            {permission?.employee?.firstName} {permission?.employee?.lastName}
                          </h3>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            ({permission?.employee?.employeeId})
                          </span>
                          <StatusBadge status={permission?.type || ''} />
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
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <span className="font-medium">Motivo:</span> {permission?.reason}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleUpdateStatus(permission?.id || '', 'APPROVED')}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Aprobar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedPermission(permission);
                            setIsDialogOpen(true);
                          }}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Rechazar
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Approved & Rejected */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-5 w-5" />
                Aprobadas Recientemente
              </CardTitle>
            </CardHeader>
            <CardContent>
              {approved?.slice(0, 5)?.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No hay solicitudes aprobadas
                </p>
              ) : (
                <div className="space-y-3">
                  {approved?.slice(0, 5)?.map((permission) => (
                    <div key={permission?.id} className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {permission?.employee?.firstName} {permission?.employee?.lastName}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(permission?.startDate)?.toLocaleDateString('es-ES')} -{' '}
                            {new Date(permission?.endDate)?.toLocaleDateString('es-ES')}
                          </p>
                        </div>
                        <StatusBadge status={permission?.type || ''} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <XCircle className="h-5 w-5" />
                Rechazadas Recientemente
              </CardTitle>
            </CardHeader>
            <CardContent>
              {rejected?.slice(0, 5)?.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No hay solicitudes rechazadas
                </p>
              ) : (
                <div className="space-y-3">
                  {rejected?.slice(0, 5)?.map((permission) => (
                    <div key={permission?.id} className="p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {permission?.employee?.firstName} {permission?.employee?.lastName}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(permission?.startDate)?.toLocaleDateString('es-ES')} -{' '}
                            {new Date(permission?.endDate)?.toLocaleDateString('es-ES')}
                          </p>
                        </div>
                        <StatusBadge status={permission?.type || ''} />
                      </div>
                      {permission?.adminNotes && (
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Nota: {permission.adminNotes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Reject Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rechazar Solicitud</DialogTitle>
              <DialogDescription>
                Proporciona una nota explicando el motivo del rechazo
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <input type="hidden" name="status" value="REJECTED" />
              <div className="space-y-2">
                <Label htmlFor="adminNotes">Nota para el empleado</Label>
                <Textarea
                  id="adminNotes"
                  name="adminNotes"
                  placeholder="Explica el motivo del rechazo..."
                  rows={4}
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setSelectedPermission(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="destructive">
                  Rechazar Solicitud
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
