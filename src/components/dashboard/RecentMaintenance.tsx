import React from 'react';
import {formatDistanceToNow} from 'date-fns';
import {ptBR} from 'date-fns/locale';
import {Car, Calendar, Wrench, DollarSign} from 'lucide-react';
import SectionTitle from '../common/SectionTitle';
import {Button} from '@/components/ui/button';
import {activityEvents} from '@/data/mockData';
import {Maintenance} from "@/types";

type ActivityEventType = 'vehicle' | 'reservation' | 'maintenance' | 'payment';

interface RecentMaintenanceProps {
    manutencoesRecentes?: Maintenance[]
}

const RecentMaintenance: React.FC<RecentMaintenanceProps> = ({ manutencoesRecentes = [] }) => {
  return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <SectionTitle title="Manutenções Recentes" />
        <div className="space-y-4">
          {manutencoesRecentes.length === 0 && (
              <p className="text-gray-500">Nenhuma manutenção recente encontrada.</p>
          )}
          {manutencoesRecentes.map((manutencao) => (
              <div key={manutencao.id} className="flex items-start gap-4">
                <div className="bg-yellow-100 p-2 rounded-full">
                  <Wrench size={16} className="text-yellow-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">
                    {manutencao.type} - {manutencao.vehicle_plate}
                  </h4>
                  <p className="text-sm text-gray-500">{manutencao.description}</p>
                  <p className="text-xs text-gray-400 mt-1">Status: {manutencao.status}</p>
                  {manutencao.cost && (
                      <p className="text-xs text-gray-400 mt-1">Custo: R$ {manutencao.cost}</p>
                  )}
                </div>
              </div>
          ))}
        </div>
      </div>
  );
};

export default RecentMaintenance;
