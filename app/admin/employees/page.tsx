
'use client';

import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Loading } from '@/components/ui/loading';
import { StatusBadge } from '@/components/ui/status-badge';
import { Plus, Search, Edit, Trash2, Eye, Users, Copy, CheckCircle2, Key, UserX } from 'lucide-react';
import { toast } from 'sonner';
import { EmployeeData, DepartmentData } from '@/lib/types';
import { motion } from 'framer-motion';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [departments, setDepartments] = useState<DepartmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeData | null>(null);
  const [createUserAccount, setCreateUserAccount] = useState(true);
  const [userRole, setUserRole] = useState('PERSONAL');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);
  const [createdEmployeeEmail, setCreatedEmployeeEmail] = useState('');
  const [resettingPassword, setResettingPassword] = useState(false);
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false);
  const [resetPasswordEmail, setResetPasswordEmail] = useState('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [employeesRes, departmentsRes] = await Promise.all([
        fetch('/api/employees?showInactive=true'), // Cargar todos los empleados
        fetch('/api/departments')
      ]);
      
      const employeesData = await employeesRes.json();
      const departmentsData = await departmentsRes.json();
      
      setEmployees(employeesData || []);
      setDepartments(departmentsData || []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar empleados');
    } finally {
      setLoading(false);
    }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let password = 'TuGente';
    for (let i = 0; i < 6; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const copyToClipboard = async () => {
    try {
      if (!generatedPassword) {
        toast.error('No hay contraseña para copiar');
        return;
      }
      
      // Método moderno con fallback
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(generatedPassword);
      } else {
        // Fallback para navegadores que no soportan clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = generatedPassword;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          document.execCommand('copy');
          textArea.remove();
        } catch (err) {
          textArea.remove();
          throw err;
        }
      }
      
      setPasswordCopied(true);
      toast.success('Contraseña copiada al portapapeles');
      setTimeout(() => setPasswordCopied(false), 2000);
    } catch (error) {
      console.error('Error al copiar:', error);
      toast.error('Error al copiar la contraseña. Por favor, cópiala manualmente.');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const tempPassword = generatePassword();
    setGeneratedPassword(tempPassword);
    
    const data: any = {
      employeeId: formData.get('employeeId'),
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      position: formData.get('position'),
      departmentId: selectedDepartmentId, // Usar el estado en lugar de FormData
      hireDate: formData.get('hireDate'),
      baseSalary: formData.get('baseSalary'),
    };

    // Solo agregar campos de usuario si se está creando y no es edición
    if (createUserAccount && !selectedEmployee) {
      data.createUser = true;
      data.userPassword = tempPassword;
      data.userRole = userRole;
    }

    try {
      const url = selectedEmployee 
        ? `/api/employees/${selectedEmployee.id}`
        : '/api/employees';
      
      const method = selectedEmployee ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar');
      }

      if (selectedEmployee) {
        toast.success('Empleado actualizado');
      } else {
        toast.success('Empleado creado exitosamente');
        if (createUserAccount) {
          setCreatedEmployeeEmail(data.email as string);
          setShowPasswordDialog(true);
        }
      }
      
      setIsDialogOpen(false);
      setSelectedEmployee(null);
      setCreateUserAccount(true);
      setUserRole('PERSONAL');
      setSelectedDepartmentId('');
      fetchData();
    } catch (error: any) {
      toast.error(error?.message || 'Error al guardar empleado');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de desactivar este empleado? El empleado será movido a la sección de inactivos.')) return;

    try {
      const response = await fetch(`/api/employees/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al desactivar');
      }

      if (data.deactivated) {
        toast.success('Empleado desactivado exitosamente');
      } else {
        toast.success('Empleado eliminado');
      }
      
      fetchData();
    } catch (error: any) {
      toast.error(error?.message || 'Error al desactivar empleado');
    }
  };

  const handleResetPassword = async (employee: EmployeeData) => {
    if (!employee?.user?.id) {
      toast.error('Este empleado no tiene cuenta de usuario');
      return;
    }

    if (!confirm(`¿Estás seguro de regenerar la contraseña para ${employee.firstName} ${employee.lastName}?`)) {
      return;
    }

    setResettingPassword(true);

    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: employee.user.id })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al regenerar contraseña');
      }

      setGeneratedPassword(data.tempPassword);
      setResetPasswordEmail(employee.email);
      setShowResetPasswordDialog(true);
      toast.success('Contraseña regenerada exitosamente');
    } catch (error: any) {
      toast.error(error?.message || 'Error al regenerar contraseña');
    } finally {
      setResettingPassword(false);
    }
  };

  const filteredActiveEmployees = employees
    ?.filter(emp => emp?.status === 'ACTIVE')
    ?.filter(emp =>
      `${emp?.firstName} ${emp?.lastName} ${emp?.email} ${emp?.employeeId}`
        ?.toLowerCase()
        ?.includes(searchTerm?.toLowerCase() || '')
    );

  const filteredInactiveEmployees = employees
    ?.filter(emp => emp?.status === 'INACTIVE')
    ?.filter(emp =>
      `${emp?.firstName} ${emp?.lastName} ${emp?.email} ${emp?.employeeId}`
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Users className="h-8 w-8" />
              Gestión de Personal
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Administra la información de todos los empleados
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  setSelectedEmployee(null);
                  setSelectedDepartmentId('');
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Empleado
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {selectedEmployee ? 'Editar Empleado' : 'Crear Nuevo Empleado'}
                </DialogTitle>
                <DialogDescription>
                  Completa la información del empleado
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="employeeId">ID de Empleado *</Label>
                    <Input
                      id="employeeId"
                      name="employeeId"
                      defaultValue={selectedEmployee?.employeeId || ''}
                      required
                      placeholder="EMP001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      defaultValue={selectedEmployee?.email || ''}
                      required
                      placeholder="empleado@empresa.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nombre *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      defaultValue={selectedEmployee?.firstName || ''}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Apellido *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      defaultValue={selectedEmployee?.lastName || ''}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      name="phone"
                      defaultValue={selectedEmployee?.phone || ''}
                      placeholder="+34 600 000 000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">Puesto *</Label>
                    <Input
                      id="position"
                      name="position"
                      defaultValue={selectedEmployee?.position || ''}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="departmentId">Departamento *</Label>
                    <Select
                      value={selectedDepartmentId || selectedEmployee?.departmentId || ''}
                      onValueChange={setSelectedDepartmentId}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar departamento" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments?.map((dept) => (
                          <SelectItem key={dept?.id} value={dept?.id || ''}>
                            {dept?.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hireDate">Fecha de Ingreso *</Label>
                    <Input
                      id="hireDate"
                      name="hireDate"
                      type="date"
                      defaultValue={
                        selectedEmployee?.hireDate
                          ? new Date(selectedEmployee.hireDate)?.toISOString()?.split('T')[0]
                          : ''
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="baseSalary">Salario Base ($) *</Label>
                    <Input
                      id="baseSalary"
                      name="baseSalary"
                      type="number"
                      step="0.01"
                      defaultValue={selectedEmployee?.baseSalary || ''}
                      required
                      placeholder="35000"
                    />
                  </div>
                </div>

                {/* Sección de Cuenta de Usuario - Solo para crear nuevo empleado */}
                {!selectedEmployee && (
                  <div className="border-t pt-4 space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="createUser" 
                        checked={createUserAccount}
                        onCheckedChange={(checked) => setCreateUserAccount(checked as boolean)}
                      />
                      <Label 
                        htmlFor="createUser" 
                        className="text-sm font-medium flex items-center gap-2"
                      >
                        <Key className="h-4 w-4" />
                        Crear cuenta de acceso al sistema
                      </Label>
                    </div>
                    
                    {createUserAccount && (
                      <div className="pl-6 space-y-3 bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          Se generará automáticamente una contraseña temporal que deberás comunicar al empleado.
                          El empleado deberá cambiar esta contraseña en su primer inicio de sesión.
                        </p>
                        
                        <div className="space-y-2">
                          <Label htmlFor="userRole">Rol de Usuario *</Label>
                          <Select
                            value={userRole}
                            onValueChange={setUserRole}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar rol" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PERSONAL">Personal (Empleado)</SelectItem>
                              <SelectItem value="ADMIN">Administrador</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            <strong>Personal:</strong> Puede ver su información y solicitar permisos<br/>
                            <strong>Administrador:</strong> Puede gestionar empleados, departamentos y toda la configuración
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      setSelectedEmployee(null);
                      setCreateUserAccount(true);
                      setUserRole('PERSONAL');
                      setSelectedDepartmentId('');
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    {selectedEmployee ? 'Actualizar' : 'Crear Empleado'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar empleado por nombre, email o ID..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e?.target?.value || '')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Active/Inactive Employees */}
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="active" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Empleados Activos ({filteredActiveEmployees?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="inactive" className="flex items-center gap-2">
              <UserX className="h-4 w-4" />
              Empleados Inactivos ({filteredInactiveEmployees?.length || 0})
            </TabsTrigger>
          </TabsList>

          {/* Active Employees Tab */}
          <TabsContent value="active">
            <Card>
              <CardHeader>
                <CardTitle>
                  Empleados Activos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredActiveEmployees?.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No se encontraron empleados activos
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
                          <th className="text-left p-3 font-semibold text-gray-900 dark:text-gray-100">Estado</th>
                          <th className="text-left p-3 font-semibold text-gray-900 dark:text-gray-100">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredActiveEmployees?.map((employee) => (
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
                            <td className="p-3">
                              <StatusBadge status={employee?.status || 'ACTIVE'} />
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setSelectedEmployee(employee);
                                    setSelectedDepartmentId(employee?.departmentId || '');
                                    setIsDialogOpen(true);
                                  }}
                                  title="Editar empleado"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                {employee?.user && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-blue-600 hover:text-blue-700"
                                    onClick={() => handleResetPassword(employee)}
                                    disabled={resettingPassword}
                                    title="Regenerar contraseña"
                                  >
                                    <Key className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => handleDelete(employee?.id || '')}
                                  title="Desactivar empleado"
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
          </TabsContent>

          {/* Inactive Employees Tab */}
          <TabsContent value="inactive">
            <Card>
              <CardHeader>
                <CardTitle>
                  Empleados Inactivos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredInactiveEmployees?.length === 0 ? (
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
                        {filteredInactiveEmployees?.map((employee) => (
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
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog de Contraseña Generada */}
      <AlertDialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              ¡Empleado Creado Exitosamente!
            </AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-4 pt-4">
                <p className="text-gray-700 dark:text-gray-300">
                  Se ha creado la cuenta de acceso para <strong>{createdEmployeeEmail}</strong>
                </p>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <Key className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 mb-2">
                        Contraseña Temporal
                      </p>
                      <div className="bg-white border-2 border-yellow-300 rounded p-3 font-mono text-lg text-center tracking-wider break-all">
                        {generatedPassword}
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    onClick={copyToClipboard}
                    variant="outline"
                    className="w-full"
                  >
                    {passwordCopied ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                        ¡Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar Contraseña
                      </>
                    )}
                  </Button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                  <p className="font-semibold text-blue-900 mb-1">
                    ⚠️ Importante:
                  </p>
                  <ul className="list-disc list-inside text-blue-800 space-y-1">
                    <li>Comunica esta contraseña al empleado de forma segura</li>
                    <li>El empleado DEBE cambiarla en su primer inicio de sesión</li>
                    <li>Esta contraseña NO se volverá a mostrar</li>
                  </ul>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button 
              onClick={() => {
                setShowPasswordDialog(false);
                setPasswordCopied(false);
              }}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Entendido
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de Contraseña Regenerada */}
      <AlertDialog open={showResetPasswordDialog} onOpenChange={setShowResetPasswordDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              ¡Contraseña Regenerada!
            </AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-4 pt-4">
                <p className="text-gray-700 dark:text-gray-300">
                  Se ha regenerado la contraseña para <strong>{resetPasswordEmail}</strong>
                </p>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <Key className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 mb-2">
                        Nueva Contraseña Temporal
                      </p>
                      <div className="bg-white border-2 border-yellow-300 rounded p-3 font-mono text-lg text-center tracking-wider break-all">
                        {generatedPassword}
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    onClick={copyToClipboard}
                    variant="outline"
                    className="w-full"
                  >
                    {passwordCopied ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                        ¡Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar Contraseña
                      </>
                    )}
                  </Button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                  <p className="font-semibold text-blue-900 mb-1">
                    ⚠️ Importante:
                  </p>
                  <ul className="list-disc list-inside text-blue-800 space-y-1">
                    <li>Comunica esta contraseña al empleado de forma segura</li>
                    <li>El empleado DEBE cambiarla en su próximo inicio de sesión</li>
                    <li>La contraseña anterior ya no es válida</li>
                    <li>Esta contraseña NO se volverá a mostrar</li>
                  </ul>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button 
              onClick={() => {
                setShowResetPasswordDialog(false);
                setPasswordCopied(false);
              }}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Entendido
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
