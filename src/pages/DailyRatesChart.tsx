import React, { useState } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip
} from 'recharts';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type DailyRate = {
    id: number;
    dateTime: string;  // ISO string da data/hora
    amount: number;
    vehiclePlate: string;
};

interface Props {
    dailyRates: DailyRate[];
}

const DailyRatesChart: React.FC<Props> = ({ dailyRates }) => {
    const [timeFrame, setTimeFrame] = useState<'month' | 'year'>('month');

    const processedData = dailyRates
        .slice() // copiar para não alterar original
        .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
        .map(rate => ({
            date: new Date(rate.dateTime).toLocaleDateString('pt-BR'),
            amount: rate.amount,
        }));

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={processedData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            style={{ fontSize: '12px' }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            style={{ fontSize: '12px' }}
                            tickFormatter={(value) => `R$ ${value.toFixed(2)}`}
                        />
                        <Tooltip
                            formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Valor']}
                            labelFormatter={(label) => `Data: ${label}`}
                        />
                        <Line
                            type="monotone"
                            dataKey="amount"
                            stroke="#22c55e"
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

export default DailyRatesChart;
