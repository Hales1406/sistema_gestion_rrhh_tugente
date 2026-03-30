
import { Badge } from './badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
}

export function StatusBadge({ status, variant = 'default', className }: StatusBadgeProps) {
  const getStatusVariant = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
      case 'APPROVED':
        return 'default';
      case 'PENDING':
        return 'secondary';
      case 'INACTIVE':
      case 'REJECTED':
        return 'destructive';
      case 'TERMINATED':
        return 'outline';
      default:
        return variant;
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'ACTIVE': 'Activo',
      'INACTIVE': 'Inactivo',
      'TERMINATED': 'Terminado',
      'PENDING': 'Pendiente',
      'APPROVED': 'Aprobado',
      'REJECTED': 'Rechazado',
      'VACATION': 'Vacaciones',
      'PERSONAL': 'Personal',
      'MEDICAL': 'Médico',
      'MATERNITY': 'Maternidad',
      'PATERNITY': 'Paternidad',
      'LOW': 'Baja',
      'NORMAL': 'Normal',
      'HIGH': 'Alta',
      'URGENT': 'Urgente',
    };
    return statusMap[status.toUpperCase()] || status;
  };

  return (
    <Badge variant={getStatusVariant(status)} className={cn(className)}>
      {getStatusText(status)}
    </Badge>
  );
}
