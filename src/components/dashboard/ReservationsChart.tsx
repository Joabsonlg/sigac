import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip
} from 'recharts';
import SectionTitle from '../common/SectionTitle';
import { format } from 'date-fns';
import ReservationsService from "@/services/reservationsService.ts";

type ReservationFromAPI = {
  id: number;
  reservationDate: number[]; // ex: [2025, 7, 13, 14, 50, 59, 164493000]
  // ... outros campos omitidos
};

type ChartData = {
  date: string;
  total: number;
};

const ReservationsChart: React.FC = () => {
  const [data, setData] = useState<ChartData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await ReservationsService.getAllReservations();
      const reservations: ReservationFromAPI[] = response.data?.content || [];

      const countPerDay: Record<string, number> = {};

      reservations.forEach((reservation) => {
        const dateArray = reservation.reservationDate;
        if (!Array.isArray(dateArray)) return;

        const jsDate = new Date(
            dateArray[0],                   // year
            dateArray[1] - 1,               // month (0-based in JS)
            dateArray[2],                   // day
            dateArray[3] || 0,              // hour
            dateArray[4] || 0,              // minute
            dateArray[5] || 0,              // second
            Math.floor((dateArray[6] || 0) / 1_000_000) // nanos to millis
        );

        const dateStr = format(jsDate, 'yyyy-MM-dd');
        countPerDay[dateStr] = (countPerDay[dateStr] || 0) + 1;
      });

      const chartData: ChartData[] = Object.entries(countPerDay)
          .map(([date, total]) => ({ date, total }))
          .sort((a, b) => a.date.localeCompare(b.date));

      setData(chartData);
    };

    fetchData();
  }, []);

  return (
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <SectionTitle title="Reservas Criadas por Dia" />
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                  dataKey="date"
                  tickFormatter={(str) => format(new Date(str), 'dd/MM')}
                  style={{ fontSize: '12px' }}
              />
              <YAxis
                  allowDecimals={false}
                  style={{ fontSize: '12px' }}
              />
              <Tooltip
                  formatter={(value: number) => [`${value}`, 'Reservas']}
                  labelFormatter={(label) => `Dia: ${format(new Date(label), 'dd/MM/yyyy')}`}
              />
              <Line
                  type="monotone"
                  dataKey="total"
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

export default ReservationsChart;
