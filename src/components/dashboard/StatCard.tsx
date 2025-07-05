
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type StatCardProps = {
  title: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'yellow' | 'red';
};

const StatCard: React.FC<StatCardProps> = ({ title, value, change, isPositive, icon: Icon, color }) => {
  const colorStyles = {
    blue: {
      bg: 'bg-blue-100',
      text: 'text-blue-600',
      border: 'border-blue-200',
    },
    green: {
      bg: 'bg-green-100',
      text: 'text-green-600',
      border: 'border-green-200',
    },
    yellow: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-600',
      border: 'border-yellow-200',
    },
    red: {
      bg: 'bg-red-100',
      text: 'text-red-600',
      border: 'border-red-200',
    },
  };
  
  const style = colorStyles[color];
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h4 className="mt-2 text-2xl font-semibold text-gray-900">{value}</h4>
          
          {change && (
            <p className={cn(
              'mt-1 text-sm',
              isPositive ? 'text-green-600' : 'text-red-600'
            )}>
              {isPositive ? '+' : ''}{change}
            </p>
          )}
        </div>
        
        <div className={cn('p-3 rounded-full', style.bg)}>
          <Icon className={style.text} size={20} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
