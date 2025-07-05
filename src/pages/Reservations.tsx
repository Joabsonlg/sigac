import React, { useState } from 'react';
import { Reservation, Client, Vehicle } from '@/types';
import { reservations, clients, vehicles, formatCurrency, formatDate } from '@/data/mockData';
import { 
  Table, TableHeader, TableRow, TableHead, 
  TableBody, TableCell 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, CardHeader, CardTitle, CardDescription, 
  CardContent, CardFooter 
} from '@/components/ui/card';
import { 
  Calendar, Plus, Edit, Trash2, Check, X, Search, 
  ChevronLeft, ChevronRight, CalendarCheck
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const Reservations: React.FC = () => {
  const [reservationsList, setReservationsList] = useState<Reservation[]>(reservations);
  const [showForm, setShowForm] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const itemsPerPage = 5;

  // New reservation form state with both legacy and new properties
  const [formData, setFormData] = useState<Omit<Reservation, "id">>({
    reservation_date: new Date().toISOString().split('T')[0],
    start_date: '',
    end_date: '',
    status: 'pending',
    amount: 0,
    customer_cpf: '',
    vehicle_plate: '',
    
    // Legacy compatibility properties
    clientId: '',
    vehicleId: '',
    startDate: '',
    endDate: '',
    totalAmount: 0,
    discount: 0,
    promoCode: ''
  });

  const resetForm = () => {
    setFormData({
      reservation_date: new Date().toISOString().split('T')[0],
      start_date: '',
      end_date: '',
      status: 'pending',
      amount: 0,
      customer_cpf: '',
      vehicle_plate: '',
      
      // Legacy compatibility properties
      clientId: '',
      vehicleId: '',
      startDate: '',
      endDate: '',
      totalAmount: 0,
      discount: 0,
      promoCode: ''
    });
    setEditingReservation(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'vehicleId' && value) {
      const selectedVehicle = vehicles.find(v => v.id === value);
      if (selectedVehicle && formData.startDate && formData.endDate) {
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
        const dailyRate = selectedVehicle.dailyRate || 100;
        const totalAmount = dailyRate * (days > 0 ? days : 1);
        
        setFormData(prev => ({
          ...prev,
          vehicleId: value,
          vehicle_plate: value, // Also update the new model field
          totalAmount: totalAmount - (prev.discount || 0),
          amount: totalAmount - (prev.discount || 0)
        }));
        return;
      }
    }
    
    if ((name === 'startDate' || name === 'endDate') && formData.vehicleId) {
      const selectedVehicle = vehicles.find(v => v.id === formData.vehicleId);
      const start = new Date(name === 'startDate' ? value : formData.startDate);
      const end = new Date(name === 'endDate' ? value : formData.endDate);
      
      if (selectedVehicle && !isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
        const dailyRate = selectedVehicle.dailyRate || 100;
        const totalAmount = dailyRate * (days > 0 ? days : 1);
        
        setFormData(prev => {
          const updatedData = {
            ...prev,
            [name]: value,
            // Update corresponding new model field
            ...(name === 'startDate' ? { start_date: value } : {}),
            ...(name === 'endDate' ? { end_date: value } : {}),
            totalAmount: totalAmount - (prev.discount || 0),
            amount: totalAmount - (prev.discount || 0)
          };
          return updatedData;
        });
        return;
      }
    }
    
    if (name === 'clientId' && value) {
      setFormData(prev => ({
        ...prev,
        clientId: value,
        customer_cpf: value // Also update the new model field
      }));
      return;
    }
    
    if (name === 'discount') {
      const discountValue = Number(value) || 0;
      const currentTotal = formData.totalAmount + (formData.discount || 0);
      
      setFormData(prev => ({
        ...prev,
        discount: discountValue,
        totalAmount: currentTotal - discountValue,
        amount: currentTotal - discountValue
      }));
      return;
    }
    
    if (name === 'promoCode') {
      setFormData(prev => ({
        ...prev,
        promoCode: value,
        promotion_code: value
      }));
      return;
    }
    
    // For all other fields, update normally, mapping between legacy and new properties
    setFormData(prev => {
      const updates: any = {
        ...prev,
        [name]: name === 'totalAmount' || name === 'discount' ? Number(value) : value,
      };
      
      // Map legacy to new model fields
      if (name === 'status') updates.status = value;
      
      return updates;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure all fields are set correctly
    const completeFormData = {
      ...formData,
      // Ensure new model fields are set from legacy fields if needed
      customer_cpf: formData.customer_cpf || formData.clientId,
      vehicle_plate: formData.vehicle_plate || formData.vehicleId,
      start_date: formData.start_date || formData.startDate,
      end_date: formData.end_date || formData.endDate,
      amount: formData.amount || formData.totalAmount,
      promotion_code: formData.promotion_code || formData.promoCode,
      
      // Ensure legacy fields are set from new model fields if needed
      clientId: formData.clientId || formData.customer_cpf,
      vehicleId: formData.vehicleId || formData.vehicle_plate,
      startDate: formData.startDate || formData.start_date,
      endDate: formData.endDate || formData.end_date,
      totalAmount: formData.totalAmount || formData.amount,
      promoCode: formData.promoCode || formData.promotion_code,
    };
    
    if (editingReservation) {
      // Update existing reservation
      const updatedReservations = reservationsList.map(reservation => 
        reservation.id === editingReservation.id 
          ? { ...completeFormData, id: editingReservation.id } 
          : reservation
      );
      setReservationsList(updatedReservations);
    } else {
      // Add new reservation with String id
      const newId = `r${Date.now()}`;
      const newReservation = {
        ...completeFormData,
        id: newId,
      } as Reservation;
      setReservationsList([...reservationsList, newReservation]);
    }
    
    setShowForm(false);
    resetForm();
  };

  const handleEdit = (reservation: Reservation) => {
    setEditingReservation(reservation);
    setFormData({
      reservation_date: reservation.reservation_date,
      start_date: reservation.start_date,
      end_date: reservation.end_date,
      status: reservation.status,
      amount: reservation.amount,
      customer_cpf: reservation.customer_cpf,
      vehicle_plate: reservation.vehicle_plate,
      promotion_code: reservation.promotion_code,
      
      // Legacy compatibility fields
      vehicleId: reservation.vehicleId || reservation.vehicle_plate,
      clientId: reservation.clientId || reservation.customer_cpf,
      startDate: reservation.startDate || reservation.start_date,
      endDate: reservation.endDate || reservation.end_date,
      totalAmount: reservation.totalAmount || reservation.amount,
      discount: reservation.discount || 0,
      promoCode: reservation.promoCode || reservation.promotion_code || ''
    });
    setShowForm(true);
  };

  const handleDelete = (id: string | number) => {
    setReservationsList(reservationsList.filter(reservation => reservation.id !== id));
  };

  const filteredReservations = reservationsList
    .filter(reservation => {
      // Status filter
      if (statusFilter !== 'all' && reservation.status !== statusFilter) {
        return false;
      }
      
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const client = clients.find(c => c.id === (reservation.clientId || reservation.customer_cpf));
      const vehicle = vehicles.find(v => v.id === (reservation.vehicleId || reservation.vehicle_plate));
      const reservationId = typeof reservation.id === 'number' ? 
        reservation.id.toString().toLowerCase() : 
        reservation.id.toLowerCase();
      
      return (
        client?.name.toLowerCase().includes(searchLower) ||
        vehicle?.brand.toLowerCase().includes(searchLower) ||
        vehicle?.model.toLowerCase().includes(searchLower) ||
        reservationId.includes(searchLower)
      );
    });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredReservations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);

  const getStatusBadge = (status: Reservation['status']) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500">Pendente</Badge>;
      case 'confirmed':
        return <Badge className="bg-green-500">Confirmada</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500">Cancelada</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500">Concluída</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'Cliente não encontrado';
  };

  const getVehicleName = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Veículo não encontrado';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciamento de Reservas</h1>
        <Button onClick={() => { resetForm(); setShowForm(!showForm); }}>
          <Plus className="mr-2 h-4 w-4" /> Nova Reserva
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {editingReservation ? 'Editar Reserva' : 'Nova Reserva'}
            </CardTitle>
            <CardDescription>
              Preencha os dados para {editingReservation ? 'atualizar a' : 'criar uma nova'} reserva
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="clientId">
                    Cliente
                  </label>
                  <select
                    id="clientId"
                    name="clientId"
                    value={formData.clientId || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="">Selecione um cliente</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="vehicleId">
                    Veículo
                  </label>
                  <select
                    id="vehicleId"
                    name="vehicleId"
                    value={formData.vehicleId || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="">Selecione um veículo</option>
                    {getAvailableVehicles().map(vehicle => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.brand} {vehicle.model} - {vehicle.licensePlate || vehicle.license_plate}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="startDate">
                    Data de Início
                  </label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={formData.startDate || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="endDate">
                    Data de Término
                  </label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={formData.endDate || ''}
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
                    <option value="pending">Pendente</option>
                    <option value="confirmed">Confirmada</option>
                    <option value="cancelled">Cancelada</option>
                    <option value="completed">Concluída</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="discount">
                    Desconto (R$)
                  </label>
                  <Input
                    id="discount"
                    name="discount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.discount || 0}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="promoCode">
                    Código Promocional
                  </label>
                  <Input
                    id="promoCode"
                    name="promoCode"
                    value={formData.promoCode || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="totalAmount">
                    Valor Total (R$)
                  </label>
                  <Input
                    id="totalAmount"
                    name="totalAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.totalAmount || 0}
                    onChange={handleInputChange}
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
                  <Check className="mr-2 h-4 w-4" /> {editingReservation ? 'Atualizar' : 'Salvar'}
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
              <CalendarCheck className="mr-2 text-sigac-blue" />
              <CardTitle>Reservas</CardTitle>
            </div>
            <div className="flex flex-col md:flex-row gap-2">
              <div className="w-full md:w-40">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="all">Todos os status</option>
                  <option value="pending">Pendentes</option>
                  <option value="confirmed">Confirmadas</option>
                  <option value="cancelled">Canceladas</option>
                  <option value="completed">Concluídas</option>
                </select>
              </div>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Buscar reservas..."
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
                  <TableHead>Cliente</TableHead>
                  <TableHead>Veículo</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.length > 0 ? (
                  currentItems.map((reservation) => (
                    <TableRow key={reservation.id}>
                      <TableCell>
                        <div className="font-medium">
                          {getClientName(reservation.clientId || reservation.customer_cpf)}
                        </div>
                      </TableCell>
                      <TableCell>{getVehicleName(reservation.vehicleId || reservation.vehicle_plate)}</TableCell>
                      <TableCell>
                        {formatDate(reservation.startDate || reservation.start_date)} - {formatDate(reservation.endDate || reservation.end_date)}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(reservation.totalAmount || reservation.amount)}
                        {reservation.discount ? (
                          <span className="text-xs text-green-600 block">
                            Desc: {formatCurrency(reservation.discount)}
                          </span>
                        ) : null}
                      </TableCell>
                      <TableCell>{getStatusBadge(reservation.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEdit(reservation)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-500 border-red-200 hover:bg-red-50"
                            onClick={() => handleDelete(reservation.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                      Nenhuma reserva encontrada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-gray-500">
            Mostrando {Math.min(filteredReservations.length, indexOfFirstItem + 1)} 
            - {Math.min(indexOfLastItem, filteredReservations.length)} 
            de {filteredReservations.length} reservas
          </div>
          
          {filteredReservations.length > itemsPerPage && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink 
                        onClick={() => setCurrentPage(pageNum)}
                        isActive={pageNum === currentPage}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink 
                        onClick={() => setCurrentPage(totalPages)}
                        isActive={totalPages === currentPage}
                      >
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  </>
                )}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </CardFooter>
      </Card>
    </div>
  );
  
  function getAvailableVehicles(): Vehicle[] {
    return vehicles.filter(vehicle => 
      vehicle.status === 'available' || 
      (editingReservation && (vehicle.id === editingReservation.vehicleId || vehicle.license_plate === editingReservation.vehicle_plate))
    );
  }
};

export default Reservations;
