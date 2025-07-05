import React, { useState } from 'react';
import { Vehicle } from '@/types';
import { vehicles } from '@/data/mockData';
import { 
  Table, TableHeader, TableRow, TableHead, 
  TableBody, TableCell 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  Car, Plus, Edit, Trash2, Check, X, Search
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const Vehicles: React.FC = () => {
  const [vehiclesList, setVehiclesList] = useState<Vehicle[]>(vehicles);
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // New vehicle form state with both new and legacy properties
  const [formData, setFormData] = useState<Omit<Vehicle, 'id'>>({
    model: '',
    brand: '',
    year: new Date().getFullYear(),
    license_plate: '',
    status: 'available',
    image_url: '',
    // Legacy compatibility properties
    licensePlate: '',
    dailyRate: 0,
    imageUrl: ''
  });

  const resetForm = () => {
    setFormData({
      model: '',
      brand: '',
      year: new Date().getFullYear(),
      license_plate: '',
      status: 'available',
      image_url: '',
      // Legacy compatibility properties
      licensePlate: '',
      dailyRate: 0,
      imageUrl: ''
    });
    setEditingVehicle(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'licensePlate') {
      setFormData(prev => ({
        ...prev,
        licensePlate: value,
        license_plate: value
      }));
      return;
    }
    
    if (name === 'imageUrl') {
      setFormData(prev => ({
        ...prev,
        imageUrl: value,
        image_url: value
      }));
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' || name === 'dailyRate' ? Number(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure all fields are set correctly with both new and legacy properties
    const completeFormData = {
      ...formData,
      license_plate: formData.license_plate || formData.licensePlate,
      licensePlate: formData.licensePlate || formData.license_plate,
      image_url: formData.image_url || formData.imageUrl,
      imageUrl: formData.imageUrl || formData.image_url
    };
    
    if (editingVehicle) {
      // Update existing vehicle
      const updatedVehicles = vehiclesList.map(vehicle => 
        vehicle.id === editingVehicle.id 
          ? { ...completeFormData, id: editingVehicle.id } 
          : vehicle
      );
      setVehiclesList(updatedVehicles);
    } else {
      // Add new vehicle
      const newVehicle = {
        ...completeFormData,
        id: `v${Date.now()}`,
      };
      setVehiclesList([...vehiclesList, newVehicle]);
    }
    
    setShowForm(false);
    resetForm();
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      model: vehicle.model,
      brand: vehicle.brand,
      year: vehicle.year,
      license_plate: vehicle.license_plate,
      licensePlate: vehicle.licensePlate || vehicle.license_plate,
      status: vehicle.status,
      dailyRate: vehicle.dailyRate || 0,
      image_url: vehicle.image_url,
      imageUrl: vehicle.imageUrl || vehicle.image_url
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setVehiclesList(vehiclesList.filter(vehicle => vehicle.id !== id));
  };

  const filteredVehicles = vehiclesList.filter(vehicle => {
    const searchLower = searchTerm.toLowerCase();
    return (
      vehicle.model.toLowerCase().includes(searchLower) ||
      vehicle.brand.toLowerCase().includes(searchLower) ||
      (vehicle.licensePlate || vehicle.license_plate).toLowerCase().includes(searchLower)
    );
  });

  const getStatusBadge = (status: Vehicle['status']) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-green-500">Disponível</Badge>;
      case 'rented':
        return <Badge className="bg-red-500">Alugado</Badge>;
      case 'maintenance':
        return <Badge className="bg-yellow-500">Manutenção</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciamento de Veículos</h1>
        <Button onClick={() => { resetForm(); setShowForm(!showForm); }}>
          <Plus className="mr-2 h-4 w-4" /> Novo Veículo
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingVehicle ? 'Editar Veículo' : 'Novo Veículo'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="brand">
                    Marca
                  </label>
                  <Input
                    id="brand"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="model">
                    Modelo
                  </label>
                  <Input
                    id="model"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="year">
                    Ano
                  </label>
                  <Input
                    id="year"
                    name="year"
                    type="number"
                    min="1990"
                    max={new Date().getFullYear() + 1}
                    value={formData.year}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="licensePlate">
                    Placa
                  </label>
                  <Input
                    id="licensePlate"
                    name="licensePlate"
                    value={formData.licensePlate || formData.license_plate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="dailyRate">
                    Diária (R$)
                  </label>
                  <Input
                    id="dailyRate"
                    name="dailyRate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.dailyRate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="status">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="available">Disponível</option>
                    <option value="rented">Alugado</option>
                    <option value="maintenance">Manutenção</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="imageUrl">
                    URL da Imagem (opcional)
                  </label>
                  <Input
                    id="imageUrl"
                    name="imageUrl"
                    value={formData.imageUrl || formData.image_url || ''}
                    onChange={handleInputChange}
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
                  <Check className="mr-2 h-4 w-4" /> {editingVehicle ? 'Atualizar' : 'Salvar'}
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
              <Car className="mr-2 text-sigac-blue" />
              <CardTitle>Frota de Veículos</CardTitle>
            </div>
            <div className="flex gap-2 w-full md:w-64">
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Buscar veículos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Marca/Modelo</TableHead>
                  <TableHead>Placa</TableHead>
                  <TableHead>Ano</TableHead>
                  <TableHead>Diária</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.length > 0 ? (
                  filteredVehicles.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell>
                        <div className="font-medium">{vehicle.brand} {vehicle.model}</div>
                      </TableCell>
                      <TableCell>{vehicle.licensePlate || vehicle.license_plate}</TableCell>
                      <TableCell>{vehicle.year}</TableCell>
                      <TableCell>
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(vehicle.dailyRate || 100)}
                      </TableCell>
                      <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(vehicle)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-500 border-red-200 hover:bg-red-50"
                            onClick={() => handleDelete(vehicle.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                      Nenhum veículo encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Vehicles;
