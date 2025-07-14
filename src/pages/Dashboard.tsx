import React, { useEffect, useState } from 'react';
import RecentMaintenance from '@/components/dashboard/RecentMaintenance.tsx';
import RecentReservations from '@/components/dashboard/RecentReservations';
import VehicleStatus from '@/components/dashboard/VehicleStatus';
import StatCard from '@/components/dashboard/StatCard';
import { Car, Calendar, Users, DollarSign } from 'lucide-react';
import { fetchDashboardSummary, DashboardSummaryDTO } from '@/services/dashboardService';
import ReservationsChart from "@/components/dashboard/ReservationsChart.tsx";

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardSummaryDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardSummary()
        .then(data => {
          setDashboardData(data);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
  }, []);

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
      <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
          <StatCard
              title="Total de Veículos"
              value={dashboardData?.totalVeiculos.toString() || '0'}
              change={`${dashboardData?.veiculosRecentes.length || 0} novos`}
              isPositive={true}
              icon={Car}
              color="blue"
          />
          <StatCard
              title="Total de reservas"
              value={dashboardData?.totalReservas.toString() || '0'}
              isPositive={true}
              icon={Calendar}
              color="green"
          />
          <StatCard
              title="Clientes"
              value={dashboardData?.totalClientes.toString() || '0'}
              isPositive={true}
              icon={Users}
              color="yellow"
          />
          <StatCard
              title="Receita Bruta"
              value={
                typeof dashboardData?.receitaBruta === 'number'
                  ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dashboardData.receitaBruta)
                  : 'R$ 0,00'
              }
              isPositive={true}
              icon={DollarSign}
              color="yellow"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ReservationsChart/>
            <RecentReservations reservas={dashboardData?.reservasRecentes || []} />
          </div>

          <div className="space-y-6">
            <RecentMaintenance manutencoesRecentes={dashboardData?.manutencoesRecentes || []}/>
            <div className="h-6" />
            <VehicleStatus veiculos={dashboardData?.veiculosRecentes || []} />
          </div>
        </div>
      </div>
  );
};

export default Dashboard;
