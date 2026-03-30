'use client';

import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { DollarSign, Plus, TrendingUp, Calendar, Users, Eye, Check, Trash2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

interface PayrollItem {
  id: string;
  employeeId: string;
  baseSalary: number;
  bonus: number;
  deductions: number;
  hoursWorked: number;
  totalSalary: number;
  notes: string | null;
  employee: {
    firstName: string;
    lastName: string;
    employeeId: string;
    position: string;
    department: {
      name: string;
    };
  };
}

interface Payroll {
  id: string;
  month: number;
  year: number;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: PayrollItem[];
}

export default function SalariesPage() {
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editedItems, setEditedItems] = useState<{ [key: string]: Partial<PayrollItem> }>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPayrolls();
  }, []);

  const fetchPayrolls = async () => {
    try {
      const response = await fetch('/api/payrolls');
      const data = await response.json();
      setPayrolls(data || []);
    } catch (error) {
      console.error('Error al cargar prenóminas:', error);
      toast.error('Error al cargar prenóminas');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePayroll = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data = {
      month: formData.get('month'),
      year: formData.get('year'),
    };

    try {
      const response = await fetch('/api/payrolls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear prenómina');
      }

      toast.success('Prenómina creada exitosamente');
      setIsCreateDialogOpen(false);
      fetchPayrolls();
    } catch (error: any) {
      toast.error(error?.message || 'Error al crear prenómina');
    }
  };

  const handleViewPayroll = async (payroll: Payroll) => {
    try {
      const response = await fetch(`/api/payrolls/${payroll.id}`);
      const data = await response.json();
      setSelectedPayroll(data);
      setEditedItems({});
      setIsViewDialogOpen(true);
    } catch (error) {
      toast.error('Error al cargar detalles de la prenómina');
    }
  };

  const handleItemChange = (itemId: string, field: string, value: any) => {
    setEditedItems(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value
      }
    }));
  };

  const handleSaveChanges = async () => {
    if (!selectedPayroll) return;

    setSaving(true);
    try {
      // Preparar los items actualizados
      const updatedItems = selectedPayroll.items.map(item => {
        const edited = editedItems[item.id] || {};
        const baseSalary = edited.baseSalary !== undefined ? edited.baseSalary : item.baseSalary;
        const bonus = edited.bonus !== undefined ? edited.bonus : item.bonus;
        const deductions = edited.deductions !== undefined ? edited.deductions : item.deductions;
        const notes = edited.notes !== undefined ? edited.notes : item.notes;

        return {
          id: item.id,
          baseSalary,
          bonus,
          deductions,
          notes
        };
      });

      const response = await fetch(`/api/payrolls/${selectedPayroll.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: updatedItems }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar prenómina');
      }

      const updatedPayroll = await response.json();
      setSelectedPayroll(updatedPayroll);
      setEditedItems({});
      toast.success('Cambios guardados exitosamente');
      fetchPayrolls();
    } catch (error) {
      toast.error('Error al guardar cambios');
    } finally {
      setSaving(false);
    }
  };

  const handleCompletePayroll = async (payrollId: string) => {
    try {
      const response = await fetch(`/api/payrolls/${payrollId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' }),
      });

      if (!response.ok) {
        throw new Error('Error al completar prenómina');
      }

      toast.success('Prenómina completada');
      setIsViewDialogOpen(false);
      fetchPayrolls();
    } catch (error) {
      toast.error('Error al completar prenómina');
    }
  };

  const handleDeletePayroll = async (payrollId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta prenómina?')) return;

    try {
      const response = await fetch(`/api/payrolls/${payrollId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar prenómina');
      }

      toast.success('Prenómina eliminada');
      setIsViewDialogOpen(false);
      fetchPayrolls();
    } catch (error) {
      toast.error('Error al eliminar prenómina');
    }
  };

  const getItemValue = (item: PayrollItem, field: keyof PayrollItem) => {
    const edited = editedItems[item.id];
    if (edited && edited[field] !== undefined) {
      return edited[field];
    }
    return item[field];
  };

  const calculateItemTotal = (item: PayrollItem) => {
    const baseSalary = parseFloat(getItemValue(item, 'baseSalary') as any) || 0;
    const bonus = parseFloat(getItemValue(item, 'bonus') as any) || 0;
    const deductions = parseFloat(getItemValue(item, 'deductions') as any) || 0;
    return baseSalary + bonus - deductions;
  };

  const totalPayrolls = payrolls.reduce((sum, p) => sum + p.totalAmount, 0);
  const totalBonus = payrolls.reduce((sum, p) => 
    sum + p.items.reduce((itemSum, item) => itemSum + item.bonus, 0), 0
  );

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { label: string; color: string } } = {
      DRAFT: { label: 'Borrador', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
      COMPLETED: { label: 'Completada', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
      PAID: { label: 'Pagada', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' }
    };
    const statusInfo = statusMap[status] || statusMap.DRAFT;
    return (
      <Badge className={statusInfo.color}>
        {statusInfo.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <MainLayout>
        <Loading text="Cargando prenóminas..." />
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
              <DollarSign className="h-8 w-8" />
              Gestión de Prenóminas
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Administra las prenóminas mensuales por período
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Prenómina
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Prenómina Mensual</DialogTitle>
                <DialogDescription>
                  Selecciona el mes y año para generar una prenómina con todos los empleados activos
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreatePayroll} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="month">Mes *</Label>
                    <Select name="month" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar mes" />
                      </SelectTrigger>
                      <SelectContent>
                        {MONTHS.map((month, index) => (
                          <SelectItem key={month} value={`${index + 1}`}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Año *</Label>
                    <Input
                      id="year"
                      name="year"
                      type="number"
                      defaultValue={new Date().getFullYear()}
                      required
                    />
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm">
                  <p className="text-blue-900 dark:text-blue-100">
                    Se creará una prenómina con todos los empleados activos. Las horas trabajadas se calcularán automáticamente basándose en los registros de tiempo del mes seleccionado.
                  </p>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Crear Prenómina
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Pagos</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    ${(totalPayrolls || 0).toLocaleString('es-ES', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Bonos</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    ${(totalBonus || 0).toLocaleString('es-ES', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Prenóminas</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{payrolls.length}</p>
                </div>
                <FileText className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payrolls List */}
        <Card>
          <CardHeader>
            <CardTitle className="dark:text-gray-100">Prenóminas Mensuales</CardTitle>
          </CardHeader>
          <CardContent>
            {payrolls.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No hay prenóminas creadas. Crea una nueva prenómina para comenzar.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {payrolls.map((payroll) => (
                  <motion.div
                    key={payroll.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                          <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                              {MONTHS[payroll.month - 1]} {payroll.year}
                            </h3>
                            {getStatusBadge(payroll.status)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {payroll.items.length} empleados
                            </span>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">
                              Total: ${payroll.totalAmount.toLocaleString('es-ES', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleViewPayroll(payroll)}
                        variant="outline"
                        size="sm"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalle
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* View/Edit Payroll Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
            {selectedPayroll && (
              <>
                <DialogHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <DialogTitle className="text-2xl">
                        Prenómina {MONTHS[selectedPayroll.month - 1]} {selectedPayroll.year}
                      </DialogTitle>
                      <DialogDescription>
                        {selectedPayroll.items.length} empleados • Total: ${selectedPayroll.totalAmount.toLocaleString('es-ES', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </DialogDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(selectedPayroll.status)}
                    </div>
                  </div>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b dark:border-gray-700">
                          <th className="text-left p-3 font-semibold text-gray-900 dark:text-gray-100">Empleado</th>
                          <th className="text-left p-3 font-semibold text-gray-900 dark:text-gray-100">Puesto</th>
                          <th className="text-right p-3 font-semibold text-gray-900 dark:text-gray-100">Salario Base</th>
                          <th className="text-right p-3 font-semibold text-gray-900 dark:text-gray-100">Bonos</th>
                          <th className="text-right p-3 font-semibold text-gray-900 dark:text-gray-100">Deducciones</th>
                          <th className="text-right p-3 font-semibold text-gray-900 dark:text-gray-100">Horas</th>
                          <th className="text-right p-3 font-semibold text-gray-900 dark:text-gray-100">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedPayroll.items.map((item) => {
                          const isEdited = !!editedItems[item.id];
                          const totalSalary = calculateItemTotal(item);
                          
                          return (
                            <tr key={item.id} className={`border-b dark:border-gray-700 ${isEdited ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                              <td className="p-3">
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-gray-100">
                                    {item.employee.firstName} {item.employee.lastName}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {item.employee.employeeId}
                                  </p>
                                </div>
                              </td>
                              <td className="p-3 text-gray-700 dark:text-gray-300 text-sm">
                                {item.employee.position}
                              </td>
                              <td className="p-3 text-right">
                                {selectedPayroll.status === 'DRAFT' ? (
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={String(getItemValue(item, 'baseSalary') || 0)}
                                    onChange={(e) => handleItemChange(item.id, 'baseSalary', parseFloat(e.target.value) || 0)}
                                    className="w-32 text-right"
                                  />
                                ) : (
                                  <span className="text-gray-900 dark:text-gray-100">
                                    ${item.baseSalary.toLocaleString('es-ES')}
                                  </span>
                                )}
                              </td>
                              <td className="p-3 text-right">
                                {selectedPayroll.status === 'DRAFT' ? (
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={String(getItemValue(item, 'bonus') || 0)}
                                    onChange={(e) => handleItemChange(item.id, 'bonus', parseFloat(e.target.value) || 0)}
                                    className="w-32 text-right"
                                  />
                                ) : (
                                  <span className="text-green-600 dark:text-green-400">
                                    +${item.bonus.toLocaleString('es-ES')}
                                  </span>
                                )}
                              </td>
                              <td className="p-3 text-right">
                                {selectedPayroll.status === 'DRAFT' ? (
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={String(getItemValue(item, 'deductions') || 0)}
                                    onChange={(e) => handleItemChange(item.id, 'deductions', parseFloat(e.target.value) || 0)}
                                    className="w-32 text-right"
                                  />
                                ) : (
                                  <span className="text-red-600 dark:text-red-400">
                                    -${item.deductions.toLocaleString('es-ES')}
                                  </span>
                                )}
                              </td>
                              <td className="p-3 text-right text-gray-700 dark:text-gray-300">
                                {item.hoursWorked.toFixed(1)}h
                              </td>
                              <td className="p-3 text-right font-bold text-gray-900 dark:text-gray-100">
                                ${totalSalary.toLocaleString('es-ES', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2
                                })}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-between items-center gap-2 pt-4 border-t dark:border-gray-700">
                    <div className="flex gap-2">
                      {selectedPayroll.status === 'DRAFT' && (
                        <Button
                          onClick={() => handleDeletePayroll(selectedPayroll.id)}
                          variant="outline"
                          className="text-red-600 hover:text-red-700 dark:text-red-400"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </Button>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsViewDialogOpen(false)}
                      >
                        Cerrar
                      </Button>
                      {selectedPayroll.status === 'DRAFT' && (
                        <>
                          <Button
                            onClick={handleSaveChanges}
                            disabled={saving || Object.keys(editedItems).length === 0}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            {saving ? 'Guardando...' : 'Guardar Cambios'}
                          </Button>
                          <Button
                            onClick={() => handleCompletePayroll(selectedPayroll.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Completar
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
