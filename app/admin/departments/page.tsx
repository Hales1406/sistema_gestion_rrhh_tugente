
'use client';

import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Loading } from '@/components/ui/loading';
import { Building2, Plus, Search, Edit, Trash2, Users, MapPin, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { DepartmentData } from '@/lib/types';
import { motion } from 'framer-motion';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<DepartmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentData | null>(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments');
      const data = await response.json();
      setDepartments(data || []);
    } catch (error) {
      console.error('Error al cargar departamentos:', error);
      toast.error('Error al cargar departamentos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data = {
      name: formData.get('name'),
      manager: formData.get('manager'),
      location: formData.get('location'),
      budget: formData.get('budget'),
    };

    try {
      const url = selectedDepartment 
        ? `/api/departments/${selectedDepartment.id}`
        : '/api/departments';
      
      const method = selectedDepartment ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar');
      }

      toast.success(selectedDepartment ? 'Departamento actualizado' : 'Departamento creado');
      setIsDialogOpen(false);
      setSelectedDepartment(null);
      fetchDepartments();
    } catch (error: any) {
      toast.error(error?.message || 'Error al guardar departamento');
    }
  };

  const handleDelete = async (id: string, hasEmployees: boolean) => {
    if (hasEmployees) {
      toast.error('No se puede eliminar un departamento con empleados');
      return;
    }

    if (!confirm('¿Estás seguro de eliminar este departamento?')) return;

    try {
      const response = await fetch(`/api/departments/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Error al eliminar');

      toast.success('Departamento eliminado');
      fetchDepartments();
    } catch (error) {
      toast.error('Error al eliminar departamento');
    }
  };

  const filteredDepartments = departments?.filter(dept =>
    `${dept?.name} ${dept?.manager || ''} ${dept?.location || ''}`
      ?.toLowerCase()
      ?.includes(searchTerm?.toLowerCase() || '')
  );

  if (loading) {
    return (
      <MainLayout>
        <Loading text="Cargando departamentos..." />
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
              <Building2 className="h-8 w-8" />
              Gestión de Departamentos
            </h1>
            <p className="text-gray-500 mt-1">
              Organiza y administra los departamentos de la empresa
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => setSelectedDepartment(null)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Departamento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {selectedDepartment ? 'Editar Departamento' : 'Crear Nuevo Departamento'}
                </DialogTitle>
                <DialogDescription>
                  Completa la información del departamento
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del Departamento *</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={selectedDepartment?.name || ''}
                    required
                    placeholder="Recursos Humanos"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manager">Jefe de Departamento</Label>
                  <Input
                    id="manager"
                    name="manager"
                    defaultValue={selectedDepartment?.manager || ''}
                    placeholder="María González"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Ubicación</Label>
                  <Input
                    id="location"
                    name="location"
                    defaultValue={selectedDepartment?.location || ''}
                    placeholder="Piso 2, Oficina A"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget">Presupuesto ($)</Label>
                  <Input
                    id="budget"
                    name="budget"
                    type="number"
                    step="0.01"
                    defaultValue={selectedDepartment?.budget || ''}
                    placeholder="50000"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      setSelectedDepartment(null);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    {selectedDepartment ? 'Actualizar' : 'Crear'}
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
                placeholder="Buscar departamento por nombre, jefe o ubicación..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e?.target?.value || '')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Departments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDepartments?.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No se encontraron departamentos</p>
            </div>
          ) : (
            filteredDepartments?.map((department) => (
              <motion.div
                key={department?.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                className="transition-transform duration-200"
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-blue-600" />
                        {department?.name}
                      </CardTitle>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedDepartment(department);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(department?.id || '', (department?.employeeCount || 0) > 0)}
                          disabled={(department?.employeeCount || 0) > 0}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Users className="h-4 w-4" />
                      <span>{department?.employeeCount || 0} empleados</span>
                    </div>
                    {department?.manager && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Jefe:</span>
                        <span>{department.manager}</span>
                      </div>
                    )}
                    {department?.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="h-4 w-4" />
                        <span>{department.location}</span>
                      </div>
                    )}
                    {department?.budget && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <DollarSign className="h-4 w-4" />
                        <span>{department.budget.toLocaleString('es-ES')} $</span>
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
