import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Wallet, Users, Car, CheckCircle, AlertTriangle
} from "lucide-react";
import { formatCurrency } from '@/data/mockData';

const Index: React.FC = () => {
  const totalRevenue = 75000;
  const newClients = 45;
  const availableCars = 20;
  const reservationsCompleted = 120;
  const maintenanceAlerts = 5;

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-green-500" />
              Receita Total
            </CardTitle>
            <CardDescription>Rendimento total da empresa</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              Novos Clientes
            </CardTitle>
            <CardDescription>Clientes que se juntaram este mês</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newClients}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-4 w-4 text-yellow-500" />
              Carros Disponíveis
            </CardTitle>
            <CardDescription>Veículos prontos para alugar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableCars}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Reservas Concluídas
            </CardTitle>
            <CardDescription>Reservas finalizadas com sucesso</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reservationsCompleted}</div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Alertas de Manutenção
            </CardTitle>
            <CardDescription>Veículos necessitando atenção</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg">
              Existem <span className="font-semibold">{maintenanceAlerts} veículos</span> que precisam de manutenção.
              Verifique a seção de manutenção para mais detalhes.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
