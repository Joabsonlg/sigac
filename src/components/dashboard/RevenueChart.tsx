
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { revenueData } from '@/data/mockData';
import SectionTitle from '../common/SectionTitle';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const RevenueChart: React.FC = () => {
  const [timeFrame, setTimeFrame] = useState<'month' | 'year'>('month');

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
      <SectionTitle 
        title="Faturamento Mensal" 
        action={
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant={timeFrame === 'month' ? 'default' : 'outline'}
              className={cn(
                'text-xs',
                timeFrame === 'month' ? 'bg-sigac-blue' : ''
              )}
              onClick={() => setTimeFrame('month')}
            >
              Mês
            </Button>
            <Button 
              size="sm" 
              variant={timeFrame === 'year' ? 'default' : 'outline'}
              className={cn(
                'text-xs',
                timeFrame === 'year' ? 'bg-sigac-blue' : ''
              )}
              onClick={() => setTimeFrame('year')}
            >
              Ano
            </Button>
          </div>
        }
      />
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={revenueData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => `R$ ${value.toLocaleString()}`}
            />
            <Tooltip 
              formatter={(value) => [`R$ ${Number(value).toLocaleString()}`, 'Faturamento']}
              labelFormatter={(label) => `${label}`}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#1a56db"
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart;
