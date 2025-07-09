import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { MaintenanceRecord, Vehicle } from '@/types';
import { maintenanceRecords, vehicles, formatDate, formatCurrency } from '@/data/mockData';
import { 
  Table, TableHeader, TableRow, TableHead, 
  TableBody, TableCell 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  Wrench, Plus, Edit, Trash2, Check, X, Search, Calendar, AlertTriangle,
  Car, CircleDollarSign
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from '@/components/ui/dialog';
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from '@/components/ui/tabs';

const Maintenance: React.FC = () => {
  const [maintenanceList, setMaintenanceList] = useState<MaintenanceRecord[]>(maintenanceRecords);
  const [showForm, setShowForm] = useState(false);
  const [editingMaintenance, setEditingMaintenance] = useState<MaintenanceRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedMaintenance, setSelectedMaintenance] = useState<MaintenanceRecord | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // New maintenance form state
  const [formData, setFormData] = useState<Omit<MaintenanceRecord, 'id'>>({
    vehicleId: '',
    type: 'preventive',
    description: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    completedDate: '',
    cost: 0,
    status: 'scheduled'
  });

  const resetForm = () => {
    setFormData({
      vehicleId: '',
      type: 'preventive',
      description: '',
      scheduledDate: new Date().toISOString().split('T')[0],
      completedDate: '',
      cost: 0,
      status: 'scheduled'
    });
    setEditingMaintenance(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'cost' ? Number(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingMaintenance) {
      // Update existing maintenance
      const updatedMaintenanceList = maintenanceList.map(maintenance => 
        maintenance.id === editingMaintenance.id 
          ? { ...formData, id: editingMaintenance.id } 
          : maintenance
      );
      setMaintenanceList(updatedMaintenanceList);
    } else {
      // Add new maintenance
      const newMaintenance = {
        ...formData,
        id: `m${Date.now()}`
      };
      setMaintenanceList([...maintenanceList, newMaintenance]);
    }
    
    setShowForm(false);
    resetForm();
  };

  const handleEdit = (maintenance: MaintenanceRecord) => {
    setEditingMaintenance(maintenance);
    setFormData({
      vehicleId: maintenance.vehicleId,
      type: maintenance.type,
      description: maintenance.description,
      scheduledDate: maintenance.scheduledDate,
      completedDate: maintenance.completedDate || '',
      cost: maintenance.cost || 0,
      status: maintenance.status
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setMaintenanceList(maintenanceList.filter(maintenance => maintenance.id !== id));
  };

  const handleViewDetails = (maintenance: MaintenanceRecord) => {
    setSelectedMaintenance(maintenance);
    setIsDialogOpen(true);
  };

  const handleUpdateStatus = (id: string, newStatus: MaintenanceRecord['status']) => {
    const updatedMaintenanceList = maintenanceList.map(maintenance => 
      maintenance.id === id 
        ? { 
            ...maintenance, 
            status: newStatus,
            completedDate: newStatus === 'completed' ? new Date().toISOString().split('T')[0] : maintenance.completedDate
          } 
        : maintenance
    );
    setMaintenanceList(updatedMaintenanceList);
    setIsDialogOpen(false);
  };

  const getVehicleById = (id: string): Vehicle | undefined => {
    return vehicles.find(vehicle => vehicle.id === id);
  };

  const getStatusBadge = (status: MaintenanceRecord['status']) => {
    switch (status) {
      case 'scheduled':
        return <Badge className="bg-blue-500">Agendada</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-500">Em Andamento</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">Concluída</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const filteredMaintenanceList = maintenanceList.filter(maintenance => {
    // Filter by search term
    const vehicle = getVehicleById(maintenance.vehicleId);
    const vehicleInfo = vehicle 
      ? `${vehicle.brand} ${vehicle.model} ${vehicle.plate}`
      : '';
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      vehicleInfo.toLowerCase().includes(searchLower) ||
      maintenance.description.toLowerCase().includes(searchLower)
    );

    // Filter by tab
    if (activeTab === 'all') {
      return matchesSearch;
    } else {
      return matchesSearch && maintenance.status === activeTab;
    }
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciamento de Manutenção</h1>
        <Button onClick={() => { resetForm(); setShowForm(!showForm); }}>
          <Plus className="mr-2 h-4 w-4" /> Nova Manutenção
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingMaintenance ? 'Editar Manutenção' : 'Nova Manutenção'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vehicleId">Veículo</Label>
                  <select
                    id="vehicleId"
                    name="vehicleId"
                    value={formData.vehicleId}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="">Selecione um veículo</option>
                    {vehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.brand} {vehicle.model} - {vehicle.plate}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="type">Tipo de Manutenção</Label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="preventive">Preventiva</option>
                    <option value="corrective">Corretiva</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="scheduledDate">Data Agendada</Label>
                  <Input
                    id="scheduledDate"
                    name="scheduledDate"
                    type="date"
                    value={formData.scheduledDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="scheduled">Agendada</option>
                    <option value="in_progress">Em Andamento</option>
                    <option value="completed">Concluída</option>
                  </select>
                </div>
                {formData.status === 'completed' && (
                  <>
                    <div>
                      <Label htmlFor="completedDate">Data de Conclusão</Label>
                      <Input
                        id="completedDate"
                        name="completedDate"
                        type="date"
                        value={formData.completedDate}
                        onChange={handleInputChange}
                        required={formData.status === 'completed'}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cost">Custo (R$)</Label>
                      <Input
                        id="cost"
                        name="cost"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.cost}
                        onChange={handleInputChange}
                        required={formData.status === 'completed'}
                      />
                    </div>
                  </>
                )}
                <div className="md:col-span-2">
                  <Label htmlFor="description">Descrição</Label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    rows={3}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                >
                  <X className="mr-2 h-4 w-4" /> Cancelar
                </Button>
                <Button type="submit">
                  <Check className="mr-2 h-4 w-4" /> {editingMaintenance ? 'Atualizar' : 'Salvar'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex items-center">
              <Wrench className="mr-2 text-sigac-blue" />
              <CardTitle>Registro de Manutenções</CardTitle>
            </div>
            <div className="flex gap-2 w-full md:w-64">
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Buscar manutenções..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          <Tabs defaultValue="all" className="mt-4" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 md:w-[400px]">
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="scheduled">Agendadas</TabsTrigger>
              <TabsTrigger value="in_progress">Em Andamento</TabsTrigger>
              <TabsTrigger value="completed">Concluídas</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Veículo</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMaintenanceList.length > 0 ? (
                  filteredMaintenanceList.map((maintenance) => {
                    const vehicle = getVehicleById(maintenance.vehicleId);
                    return (
                      <TableRow key={maintenance.id}>
                        <TableCell>
                          <div className="font-medium">
                            {vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Veículo não encontrado'}
                          </div>
                          <div className="text-gray-500 text-xs">{vehicle?.plate}</div>
                        </TableCell>
                        <TableCell>
                          {maintenance.type === 'preventive' ? 'Preventiva' : 'Corretiva'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="mr-1 h-3 w-3 text-gray-500" /> 
                            {formatDate(maintenance.scheduledDate)}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(maintenance.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewDetails(maintenance)}>
                              <Search className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleEdit(maintenance)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-500 border-red-200 hover:bg-red-50"
                              onClick={() => handleDelete(maintenance.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                      Nenhuma manutenção encontrada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {selectedMaintenance && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Detalhes da Manutenção</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {(() => {
                const vehicle = getVehicleById(selectedMaintenance.vehicleId);
                return (
                  <>
                    <div className="flex items-center space-x-2">
                      <Car className="h-5 w-5 text-sigac-blue" />
                      <div>
                        <div className="font-medium">Veículo</div>
                        <div>{vehicle ? `${vehicle.brand} ${vehicle.model} - ${vehicle.plate}` : 'Veículo não encontrado'}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="font-medium">Tipo</div>
                        <div>{selectedMaintenance.type === 'preventive' ? 'Preventiva' : 'Corretiva'}</div>
                      </div>
                      
                      <div>
                        <div className="font-medium">Status</div>
                        <div>{getStatusBadge(selectedMaintenance.status)}</div>
                      </div>
                      
                      <div>
                        <div className="font-medium">Data Agendada</div>
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-3 w-3 text-gray-500" />
                          {formatDate(selectedMaintenance.scheduledDate)}
                        </div>
                      </div>
                      
                      {selectedMaintenance.completedDate && (
                        <div>
                          <div className="font-medium">Data Concluída</div>
                          <div className="flex items-center">
                            <Calendar className="mr-1 h-3 w-3 text-gray-500" />
                            {formatDate(selectedMaintenance.completedDate)}
                          </div>
                        </div>
                      )}
                      
                      {selectedMaintenance.status === 'completed' && selectedMaintenance.cost && (
                        <div>
                          <div className="font-medium">Custo</div>
                          <div className="flex items-center">
                            <CircleDollarSign className="mr-1 h-3 w-3 text-gray-500" />
                            {formatCurrency(selectedMaintenance.cost)}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <div className="font-medium">Descrição</div>
                      <div className="text-gray-700 mt-1">
                        {selectedMaintenance.description}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
            
            <DialogFooter>
              {selectedMaintenance.status !== 'completed' && (
                <div className="flex items-center space-x-2">
                  {selectedMaintenance.status === 'scheduled' && (
                    <Button 
                      onClick={() => handleUpdateStatus(selectedMaintenance.id, 'in_progress')}
                      className="bg-yellow-500 hover:bg-yellow-600"
                    >
                      Iniciar Manutenção
                    </Button>
                  )}
                  
                  {selectedMaintenance.status === 'in_progress' && (
                    <Button 
                      onClick={() => {
                        setEditingMaintenance(selectedMaintenance);
                        setFormData({
                          ...selectedMaintenance,
                          completedDate: new Date().toISOString().split('T')[0],
                          status: 'completed'
                        });
                        setIsDialogOpen(false);
                        setShowForm(true);
                      }}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      Concluir Manutenção
                    </Button>
                  )}
                </div>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Maintenance;
