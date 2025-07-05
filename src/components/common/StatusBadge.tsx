
import React from 'react';
import { cn } from '@/lib/utils';

type StatusBadgeProps = {
  status: 'available' | 'rented' | 'maintenance' | 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'scheduled' | 'in_progress' | 'resolved' | 'closed' | 'open';
  className?: string;
};

const statusConfig = {
  // Vehicle statuses
  available: {
    label: 'Disponível',
    color: 'bg-green-100 text-green-800',
  },
  rented: {
    label: 'Alugado',
    color: 'bg-red-100 text-red-800',
  },
  maintenance: {
    label: 'Manutenção',
    color: 'bg-yellow-100 text-yellow-800',
  },
  
  // Reservation statuses
  pending: {
    label: 'Pendente',
    color: 'bg-yellow-100 text-yellow-800',
  },
  confirmed: {
    label: 'Confirmada',
    color: 'bg-green-100 text-green-800',
  },
  cancelled: {
    label: 'Cancelada',
    color: 'bg-red-100 text-red-800',
  },
  completed: {
    label: 'Concluída',
    color: 'bg-blue-100 text-blue-800',
  },
  
  // Maintenance statuses
  scheduled: {
    label: 'Agendada',
    color: 'bg-blue-100 text-blue-800',
  },
  in_progress: {
    label: 'Em Andamento',
    color: 'bg-yellow-100 text-yellow-800',
  },
  
  // Support ticket statuses
  open: {
    label: 'Aberto',
    color: 'bg-red-100 text-red-800',
  },
  resolved: {
    label: 'Resolvido',
    color: 'bg-green-100 text-green-800',
  },
  closed: {
    label: 'Fechado',
    color: 'bg-gray-100 text-gray-800',
  },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const config = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
  
  return (
    <span
      className={cn(
        'px-2.5 py-0.5 text-xs font-medium rounded-full',
        config.color,
        className
      )}
    >
      {config.label}
    </span>
  );
};

export default StatusBadge;
