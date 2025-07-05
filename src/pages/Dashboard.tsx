
import React from 'react';
import RevenueChart from '@/components/dashboard/RevenueChart';
import RecentActivity from '@/components/dashboard/RecentActivity';
import RecentReservations from '@/components/dashboard/RecentReservations';
import VehicleStatus from '@/components/dashboard/VehicleStatus';
import StatCard from '@/components/dashboard/StatCard';
import { Car, Calendar, Users, DollarSign } from 'lucide-react';

const Dashboard: React.FC = () => {
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Total de Veículos"
          value="12"
          change="2 novos"
          isPositive={true}
          icon={Car}
          color="blue"
        />
        <StatCard
          title="Reservas Ativas"
          value="28"
          change="12% ↑"
          isPositive={true}
          icon={Calendar}
          color="green"
        />
        <StatCard
          title="Clientes"
          value="836"
          change="5 novos"
          isPositive={true}
          icon={Users}
          color="yellow"
        />
        <StatCard
          title="Receita Mensal"
          value="R$ 45.250"
          change="8% ↑"
          isPositive={true}
          icon={DollarSign}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <RevenueChart />
          <RecentReservations />
        </div>
        
        <div className="space-y-6">
          <RecentActivity />
          <div className="h-6" />
          <VehicleStatus />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
