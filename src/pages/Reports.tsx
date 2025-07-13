import React, { useState, useRef } from 'react';
import { 
  Tabs, TabsList, TabsTrigger, TabsContent 
} from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  Table, TableHeader, TableRow, TableHead, 
  TableBody, TableCell 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, PieChart, FileText, Download, Car, Users, Calendar, 
  CreditCard, Filter, ChevronDown, Printer, Wrench, FileOutput
} from 'lucide-react';
import { 
  clients, formatCurrency, formatDate,
  revenueData
} from '@/data/mockData';
import { useVehicleReport } from '@/hooks/useVehicleReport';
// Função para formatar datas igual à listagem de reservas
function formatDateTimeReservation(date: unknown): string {
  if (Array.isArray(date)) {
    // [year, month, day, hour, minute, second]
    const [year, month, day, hour = 0, minute = 0, second = 0] = date;
    const d = new Date(year, month - 1, day, hour, minute, second);
    if (isNaN(d.getTime())) return 'Data inválida';
    return d.toLocaleDateString('pt-BR');
  }
  if (typeof date === 'string') {
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Data inválida';
    return d.toLocaleDateString('pt-BR');
  }
  return 'Data inválida';
}
// Helper para exibir período corretamente
function getPeriodString(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const isValidStart = !isNaN(start.getTime());
  const isValidEnd = !isNaN(end.getTime());
  if (!isValidStart && !isValidEnd) return '-';
  if (!isValidStart) return `- até ${formatDate(endDate)}`;
  if (!isValidEnd) return `${formatDate(startDate)} até -`;
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}
import { useReservationReport } from '@/hooks/useReservationReport';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, PieChart as RechartPieChart, Pie
} from 'recharts';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

const exportToPDF = (elementId: string, reportTitle: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    toast.error("Elemento não encontrado para exportação");
    return;
  }

  toast.loading("Gerando PDF...");

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  const pageWidth = pdf.internal.pageSize.getWidth();
  
  pdf.setFontSize(18);
  pdf.setTextColor(40, 40, 40);
  pdf.text(reportTitle, pageWidth / 2, 20, { align: 'center' });
  
  pdf.setFontSize(11);
  pdf.setTextColor(100, 100, 100);
  const formattedDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  pdf.text(`Gerado em: ${formattedDate}`, pageWidth / 2, 27, { align: 'center' });
  
  setTimeout(() => {
    html2canvas(element, { scale: 2, logging: false }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      
      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pageWidth - 40;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 20, 35, imgWidth, imgHeight);
      
      pdf.save(`${reportTitle.toLowerCase().replace(/\s+/g, '_')}.pdf`);
      
      toast.dismiss();
      toast.success("PDF gerado com sucesso");
    }).catch(err => {
      console.error("Erro ao gerar PDF:", err);
      toast.dismiss();
      toast.error("Erro ao gerar o PDF");
    });
  }, 500);
};

const exportTableToPDF = (tableData: any[], columns: string[], title: string) => {
  toast.loading("Gerando PDF...");
  
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  const pageWidth = pdf.internal.pageSize.getWidth();
  
  pdf.setFontSize(18);
  pdf.setTextColor(40, 40, 40);
  pdf.text(title, pageWidth / 2, 20, { align: 'center' });
  
  pdf.setFontSize(11);
  pdf.setTextColor(100, 100, 100);
  const formattedDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  pdf.text(`Gerado em: ${formattedDate}`, pageWidth / 2, 27, { align: 'center' });
  
  autoTable(pdf, {
    startY: 35,
    head: [columns],
    body: tableData,
    theme: 'striped',
    headStyles: { 
      fillColor: [59, 130, 246],
      textColor: 255
    },
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
  });
  
  pdf.save(`${title.toLowerCase().replace(/\s+/g, '_')}.pdf`);
  
  toast.dismiss();
  toast.success("PDF gerado com sucesso");
};

const RevenueReport = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('year');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const reportRef = useRef<HTMLDivElement>(null);
  
  const filteredData = revenueData.map((item) => ({
    name: item.month,
    valor: item.revenue,
  }));
  
  const barColors = ['#3B82F6', '#4BADE8', '#63C5DA', '#7BCDCF', '#94D5C4'];
  
  const totalRevenue = filteredData.reduce((sum, item) => sum + item.valor, 0);
  const averageRevenue = totalRevenue / filteredData.length;
  const maxRevenue = Math.max(...filteredData.map((item) => item.valor));
  const minRevenue = Math.min(...filteredData.map((item) => item.valor));
  
  const handleExportRevenueToPDF = () => {
    exportToPDF('revenue-report', 'Relatório de Receitas');
  };
  
  const handleExportRevenueTableToPDF = () => {
    const tableData = filteredData.map((item) => [
      item.name,
      formatCurrency(item.valor)
    ]);
    
    tableData.push(['Total', formatCurrency(totalRevenue)]);
    
    exportTableToPDF(tableData, ['Mês', 'Receita'], 'Relatório de Receitas - Tabela');
  };
  
  return (
    <div className="space-y-6" id="revenue-report">
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold">Relatório de Receitas</h2>
          <p className="text-gray-500">Análise de receitas por período</p>
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="month">Mês atual</option>
            <option value="quarter">Trimestre</option>
            <option value="year">Ano</option>
          </select>
          
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="2023">2023</option>
            <option value="2024">2024</option>
          </select>
          
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={handleExportRevenueToPDF}>
              <FileOutput size={16} /> Exportar PDF
            </Button>
            <Button variant="outline" className="gap-2" onClick={handleExportRevenueTableToPDF}>
              <FileText size={16} /> Exportar Tabela
            </Button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">Receita Total</div>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <div className="text-sm text-green-500">+12% vs último ano</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">Média Mensal</div>
            <div className="text-2xl font-bold">{formatCurrency(averageRevenue)}</div>
            <div className="text-sm text-green-500">+5% vs último ano</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">Mês Mais Alto</div>
            <div className="text-2xl font-bold">{formatCurrency(maxRevenue)}</div>
            <div className="text-sm">Dezembro</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">Mês Mais Baixo</div>
            <div className="text-2xl font-bold">{formatCurrency(minRevenue)}</div>
            <div className="text-sm">Fevereiro</div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Receita por Mês</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis 
                  tickFormatter={(value) => 
                    new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                      maximumFractionDigits: 0
                    }).format(value)
                  } 
                />
                <Tooltip 
                  formatter={(value) => [
                    formatCurrency(Number(value)), 
                    "Receita"
                  ]} 
                />
                <Bar dataKey="valor" fill="#3B82F6">
                  {filteredData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={barColors[index % barColors.length]} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const FleetReport = () => {
  const { data, isLoading, error } = useVehicleReport();
  const COLORS = ['#22c55e', '#ef4444', '#eab308'];

  const handleExportFleetToPDF = () => {
    exportToPDF('fleet-report', 'Relatório de Frota');
  };

  const handleExportMaintenanceTableToPDF = () => {
    if (!data) return;
    const tableData = data.latestMaintenances.map((record) => [
      `${record.vehicleBrand} ${record.vehicleModel}`,
      record.type === 'PREVENTIVA' ? 'Preventiva' : 'Corretiva',
      formatDate(record.scheduledDate),
      record.status === 'CONCLUIDA' ? 'Concluída' :
        record.status === 'EM_ANDAMENTO' ? 'Em Andamento' : 'Agendada'
    ]);
    exportTableToPDF(tableData, ['Veículo', 'Tipo', 'Data', 'Status'], 'Relatório de Manutenções');
  };

  if (isLoading) {
    return <div className="p-6">Carregando relatório de frota...</div>;
  }
  if (error) {
    return <div className="p-6 text-red-500">Erro ao carregar relatório de frota</div>;
  }
  if (!data) {
    return <div className="p-6">Nenhum dado disponível</div>;
  }

  const statusData = [
    { name: 'Disponíveis', value: data.availableVehicles },
    { name: 'Alugados', value: data.inUseVehicles },
    { name: 'Manutenção', value: data.inMaintenanceVehicles },
  ];
  const totalVehicles = data.totalVehicles;
  const availableVehicles = data.availableVehicles;
  const rentedVehicles = data.inUseVehicles;
  const maintenanceVehicles = data.inMaintenanceVehicles;
  const availabilityRate = totalVehicles > 0 ? (availableVehicles / totalVehicles) * 100 : 0;

  return (
    <div className="space-y-6" id="fleet-report">
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold">Relatório de Frota</h2>
          <p className="text-gray-500">Situação atual da frota de veículos</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={handleExportFleetToPDF}>
            <FileOutput size={16} /> Exportar PDF
          </Button>
          <Button variant="outline" className="gap-2" onClick={handleExportMaintenanceTableToPDF}>
            <Wrench size={16} /> Exportar Manutenções
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">Total de Veículos</div>
            <div className="text-2xl font-bold">{totalVehicles}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">Veículos Disponíveis</div>
            <div className="text-2xl font-bold text-green-500">{availableVehicles}</div>
            <div className="text-sm">Taxa de disponibilidade: {availabilityRate.toFixed(1)}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">Veículos Alugados</div>
            <div className="text-2xl font-bold text-red-500">{rentedVehicles}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">Veículos em Manutenção</div>
            <div className="text-2xl font-bold text-yellow-500">{maintenanceVehicles}</div>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Status da Frota</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RechartPieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} veículos`, ""]} />
                </RechartPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Manutenções Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Veículo</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.latestMaintenances.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{`${record.vehicleBrand} ${record.vehicleModel}`}</TableCell>
                    <TableCell>{record.type === 'PREVENTIVA' ? 'Preventiva' : 'Corretiva'}</TableCell>
                    <TableCell>{formatDate(record.scheduledDate)}</TableCell>
                    <TableCell>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                        ${record.status === 'CONCLUIDA' ? 'bg-green-100 text-green-800' :
                          record.status === 'EM_ANDAMENTO' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'}
                      `}>
                        {record.status === 'CONCLUIDA' ? 'Concluída' :
                         record.status === 'EM_ANDAMENTO' ? 'Em Andamento' : 'Agendada'}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const ReservationReport = () => {
  const [dateFilter, setDateFilter] = useState('all');
  const { data, isLoading, error } = useReservationReport();
  const COLORS = ['#3B82F6', '#22c55e', '#ef4444', '#eab308'];

  const handleExportReservationsToPDF = () => {
    exportToPDF('reservations-report', 'Relatório de Reservas');
  };

  const handleExportReservationsTableToPDF = () => {
    if (!data) return;
    const tableData = data.latestReservations.map((reservation) => [
      reservation.clientName,
      `${reservation.vehicleBrand} ${reservation.vehicleModel}`,
      `${formatDate(reservation.startDate)} - ${formatDate(reservation.endDate)}`,
      formatCurrency(reservation.amount),
      reservation.status === 'CONFIRMED' ? 'Confirmada' :
      reservation.status === 'COMPLETED' ? 'Concluída' :
      reservation.status === 'CANCELLED' ? 'Cancelada' : 'Pendente'
    ]);
    exportTableToPDF(
      tableData,
      ['Cliente', 'Veículo', 'Período', 'Valor', 'Status'],
      'Relatório de Reservas'
    );
  };

  if (isLoading) {
    return <div className="p-6">Carregando relatório de reservas...</div>;
  }
  if (error) {
    return <div className="p-6 text-red-500">Erro ao carregar relatório de reservas</div>;
  }
  if (!data) {
    return <div className="p-6">Nenhum dado disponível</div>;
  }

  const statusData = [
    { name: 'Confirmadas', value: data.confirmedReservations },
    { name: 'Concluídas', value: data.completedReservations },
    { name: 'Canceladas', value: data.cancelledReservations },
    { name: 'Pendentes', value: data.totalReservations - (data.confirmedReservations + data.completedReservations + data.cancelledReservations) },
  ];

  return (
    <div className="space-y-6" id="reservations-report">
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold">Relatório de Reservas</h2>
          <p className="text-gray-500">Visão geral das reservas realizadas</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={handleExportReservationsToPDF}>
              <FileOutput size={16} /> Exportar PDF
            </Button>
            <Button variant="outline" className="gap-2" onClick={handleExportReservationsTableToPDF}>
              <FileText size={16} /> Exportar Tabela
            </Button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">Total de Reservas</div>
            <div className="text-2xl font-bold">{data.totalReservations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">Confirmadas</div>
            <div className="text-2xl font-bold text-blue-500">{data.confirmedReservations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">Concluídas</div>
            <div className="text-2xl font-bold text-green-500">{data.completedReservations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">Canceladas</div>
            <div className="text-2xl font-bold text-red-500">{data.cancelledReservations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">Receita Total</div>
            <div className="text-2xl font-bold">{formatCurrency(data.totalRevenue)}</div>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Status das Reservas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RechartPieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} reservas`, ""]} />
                </RechartPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Últimas Reservas</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Veículo</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.latestReservations.slice(0, 5).map((reservation) => (
                  <TableRow key={reservation.id}>
                    <TableCell>{reservation.clientName}</TableCell>
                    <TableCell>{`${reservation.vehicleBrand} ${reservation.vehicleModel}`}</TableCell>
                    <TableCell>{`${formatDateTimeReservation(reservation.startDate)} - ${formatDateTimeReservation(reservation.endDate)}`}</TableCell>
                    <TableCell>{formatCurrency(reservation.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const Reports: React.FC = () => {
  return (
    <div className="p-6">
      <div className="flex flex-col gap-4 mb-6">
        <h1 className="text-2xl font-bold">Relatórios</h1>
        <p className="text-gray-500">
          Visualização e geração de relatórios para análise de dados.
        </p>
      </div>
      
      <Tabs defaultValue="fleet" className="space-y-6">
        <TabsList className="w-full flex justify-start mb-6">
          <TabsTrigger value="fleet" className="gap-2">
            <Car size={16} /> Frota
          </TabsTrigger>
          <TabsTrigger value="reservations" className="gap-2">
            <Calendar size={16} /> Reservas
          </TabsTrigger>
        </TabsList>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">    
          <TabsContent value="fleet" className="mt-0">
            <FleetReport />
          </TabsContent>
          
          <TabsContent value="reservations" className="mt-0">
            <ReservationReport />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default Reports;
