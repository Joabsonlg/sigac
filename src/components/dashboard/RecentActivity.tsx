
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Car, Calendar, Wrench, DollarSign } from 'lucide-react';
import SectionTitle from '../common/SectionTitle';
import { Button } from '@/components/ui/button';
import { activityEvents } from '@/data/mockData';

type ActivityEventType = 'vehicle' | 'reservation' | 'maintenance' | 'payment';

type ActivityEvent = {
  id: string;
  type: ActivityEventType;
  title: string;
  description: string;
  timestamp: string;
};

const ActivityIcon: React.FC<{ type: ActivityEventType }> = ({ type }) => {
  switch (type) {
    case 'vehicle':
      return (
        <div className="bg-blue-100 p-2 rounded-full">
          <Car size={16} className="text-blue-600" />
        </div>
      );
    case 'reservation':
      return (
        <div className="bg-green-100 p-2 rounded-full">
          <Calendar size={16} className="text-green-600" />
        </div>
      );
    case 'maintenance':
      return (
        <div className="bg-yellow-100 p-2 rounded-full">
          <Wrench size={16} className="text-yellow-600" />
        </div>
      );
    case 'payment':
      return (
        <div className="bg-purple-100 p-2 rounded-full">
          <DollarSign size={16} className="text-purple-600" />
        </div>
      );
    default:
      return null;
  }
};

const formatTimeAgo = (timestamp: string): string => {
  try {
    return formatDistanceToNow(new Date(timestamp), {
      addSuffix: true,
      locale: ptBR,
    });
  } catch (error) {
    return 'Invalid date';
  }
};

const RecentActivity: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <SectionTitle title="Atividade Recente" />
      <div className="space-y-4">
        {activityEvents.map((event) => (
          <div key={event.id} className="flex items-start gap-4">
            <ActivityIcon type={event.type} />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 truncate">{event.title}</h4>
              <p className="text-sm text-gray-500">{event.description}</p>
              <p className="text-xs text-gray-400 mt-1">
                {formatTimeAgo(event.timestamp)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
