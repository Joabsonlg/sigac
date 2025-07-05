import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { reservations, formatCurrency, clients, vehicles, formatDate } from '@/data/mockData';
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
  FileText, DollarSign, Plus, Edit, Trash2, 
  Check, X, Search, Filter, Percent
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

type PromotionCode = {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  description: string;
  applicableVehicleIds?: string[];
};

// Mock promotion codes
const initialPromotionCodes: PromotionCode[] = [
  {
    id: 'promo1',
    code: 'VERAO2023',
    discountType: 'percentage',
    discountValue: 10,
    startDate: '2023-12-01',
    endDate: '2024-03-31',
    isActive: true,
    description: 'Promoção de verão - 10% de desconto'
  },
  {
    id: 'promo2',
    code: 'BEMVINDO50',
    discountType: 'fixed',
    discountValue: 50,
    startDate: '2023-06-01',
    endDate: '2023-12-31',
    isActive: true,
    description: 'Boas-vindas - R$50 de desconto'
  },
  {
    id: 'promo3',
    code: 'FIDELIDADE',
    discountType: 'percentage',
    discountValue: 15,
    startDate: '2023-01-01',
    endDate: '2023-12-31',
    isActive: true,
    description: 'Cliente fidelidade - 15% de desconto'
  }
];

const Financial: React.FC = () => {
  const [promotions, setPromotions] = useState<PromotionCode[]>(initialPromotionCodes);
  const [showForm, setShowForm] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<PromotionCode | null>(null);
  const [activeTab, setActiveTab] = useState("promos");
  const [searchTerm, setSearchTerm] = useState('');

  // Form state for new/edit promotion
  const [formData, setFormData] = useState<Omit<PromotionCode, 'id'>>({
    code: '',
    discountType: 'percentage',
    discountValue: 0,
    startDate: '',
    endDate: '',
    isActive: true,
    description: '',
  });

  const resetForm = () => {
    setFormData({
      code: '',
      discountType: 'percentage',
      discountValue: 0,
      startDate: '',
      endDate: '',
      isActive: true,
      description: '',
      applicableVehicleIds: []
    });
    setEditingPromotion(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'discountValue' ? Number(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingPromotion) {
      // Update existing promotion
      const updatedPromotions = promotions.map(promo => 
        promo.id === editingPromotion.id 
          ? { ...formData, id: editingPromotion.id } 
          : promo
      );
      setPromotions(updatedPromotions);
    } else {
      // Add new promotion
      const newPromotion = {
        ...formData,
        id: `promo${Date.now()}`
      };
      setPromotions([...promotions, newPromotion]);
    }
    
    setShowForm(false);
    resetForm();
  };

  const handleEdit = (promotion: PromotionCode) => {
    setEditingPromotion(promotion);
    setFormData({
      code: promotion.code,
      discountType: promotion.discountType,
      discountValue: promotion.discountValue,
      startDate: promotion.startDate,
      endDate: promotion.endDate,
      isActive: promotion.isActive,
      description: promotion.description,
      applicableVehicleIds: promotion.applicableVehicleIds || []
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setPromotions(promotions.filter(promo => promo.id !== id));
  };

  const togglePromotionStatus = (id: string) => {
    setPromotions(promotions.map(promo => 
      promo.id === id ? { ...promo, isActive: !promo.isActive } : promo
    ));
  };

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'Cliente não encontrado';
  };

  const getVehicleName = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Veículo não encontrado';
  };

  // Filter promotions based on search term
  const filteredPromotions = promotions.filter(promo => 
    promo.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    promo.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter reservations with discounts
  const reservationsWithDiscounts = reservations.filter(res => 
    (res.discount && res.discount > 0) || res.promoCode
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Módulo Financeiro</h1>
      </div>

      <Tabs defaultValue="promos" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="promos">Promoções e Descontos</TabsTrigger>
          <TabsTrigger value="transactions">Transações com Desconto</TabsTrigger>
        </TabsList>
        
        <TabsContent value="promos">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Códigos Promocionais</h2>
            <Button onClick={() => { resetForm(); setShowForm(!showForm); }}>
              <Plus className="mr-2 h-4 w-4" /> Nova Promoção
            </Button>
          </div>

          {showForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{editingPromotion ? 'Editar Promoção' : 'Nova Promoção'}</CardTitle>
                <CardDescription>
                  Preencha os dados para {editingPromotion ? 'atualizar a' : 'criar uma nova'} promoção
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1" htmlFor="code">
                        Código Promocional
                      </label>
                      <Input
                        id="code"
                        name="code"
                        value={formData.code}
                        onChange={handleInputChange}
                        required
                        placeholder="Ex: VERAO2024"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" htmlFor="description">
                        Descrição
                      </label>
                      <Input
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                        placeholder="Descrição da promoção"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" htmlFor="discountType">
                        Tipo de Desconto
                      </label>
                      <select
                        id="discountType"
                        name="discountType"
                        value={formData.discountType}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md"
                        required
                      >
                        <option value="percentage">Percentual (%)</option>
                        <option value="fixed">Valor Fixo (R$)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" htmlFor="discountValue">
                        {formData.discountType === 'percentage' ? 'Percentual (%)' : 'Valor (R$)'}
                      </label>
                      <Input
                        id="discountValue"
                        name="discountValue"
                        type="number"
                        min="0"
                        step={formData.discountType === 'percentage' ? '1' : '0.01'}
                        max={formData.discountType === 'percentage' ? '100' : undefined}
                        value={formData.discountValue}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" htmlFor="startDate">
                        Data de Início
                      </label>
                      <Input
                        id="startDate"
                        name="startDate"
                        type="date"
                        value={formData.startDate}
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
                        value={formData.endDate}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="flex items-center">
                      <Input
                        id="isActive"
                        name="isActive"
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className="w-4 h-4 mr-2"
                      />
                      <label className="text-sm font-medium" htmlFor="isActive">
                        Ativo
                      </label>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
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
                      <Check className="mr-2 h-4 w-4" /> {editingPromotion ? 'Atualizar' : 'Salvar'}
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
                  <Percent className="mr-2 text-sigac-blue" />
                  <CardTitle>Promoções Ativas</CardTitle>
                </div>
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Buscar promoções..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Desconto</TableHead>
                      <TableHead>Período</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPromotions.length > 0 ? (
                      filteredPromotions.map((promotion) => (
                        <TableRow key={promotion.id}>
                          <TableCell>
                            <div className="font-medium">{promotion.code}</div>
                          </TableCell>
                          <TableCell>{promotion.description}</TableCell>
                          <TableCell>
                            {promotion.discountType === 'percentage' 
                              ? `${promotion.discountValue}%` 
                              : formatCurrency(promotion.discountValue)}
                          </TableCell>
                          <TableCell>
                            {formatDate(promotion.startDate)} - {formatDate(promotion.endDate)}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              className={promotion.isActive 
                                ? "bg-green-500" 
                                : "bg-gray-400"
                              }
                            >
                              {promotion.isActive ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className={promotion.isActive 
                                  ? "text-yellow-600 border-yellow-200 hover:bg-yellow-50" 
                                  : "text-green-600 border-green-200 hover:bg-green-50"
                                }
                                onClick={() => togglePromotionStatus(promotion.id)}
                              >
                                {promotion.isActive ? 'Desativar' : 'Ativar'}
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleEdit(promotion)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-red-500 border-red-200 hover:bg-red-50"
                                onClick={() => handleDelete(promotion.id)}
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
                          Nenhuma promoção encontrada
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <DollarSign className="mr-2 text-sigac-blue" />
                <CardTitle>Reservas com Descontos</CardTitle>
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
                      <TableHead>Código</TableHead>
                      <TableHead>Desconto</TableHead>
                      <TableHead>Valor Final</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reservationsWithDiscounts.length > 0 ? (
                      reservationsWithDiscounts.map((reservation) => (
                        <TableRow key={reservation.id}>
                          <TableCell>
                            <div className="font-medium">
                              {getClientName(reservation.clientId)}
                            </div>
                          </TableCell>
                          <TableCell>{getVehicleName(reservation.vehicleId)}</TableCell>
                          <TableCell>
                            {formatDate(reservation.startDate)} - {formatDate(reservation.endDate)}
                          </TableCell>
                          <TableCell>
                            {reservation.promoCode || '-'}
                          </TableCell>
                          <TableCell>
                            {reservation.discount 
                              ? formatCurrency(reservation.discount)
                              : '-'
                            }
                          </TableCell>
                          <TableCell>
                            {formatCurrency(reservation.totalAmount)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                          Nenhuma reserva com desconto encontrada
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resumo Financeiro</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Total de Descontos</p>
                    <p className="text-xl font-bold text-red-600">
                      {formatCurrency(
                        reservationsWithDiscounts.reduce(
                          (acc, res) => acc + (res.discount || 0), 
                          0
                        )
                      )}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Valor Bruto</p>
                    <p className="text-xl font-bold">
                      {formatCurrency(
                        reservationsWithDiscounts.reduce(
                          (acc, res) => acc + res.totalAmount + (res.discount || 0), 
                          0
                        )
                      )}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Valor Líquido</p>
                    <p className="text-xl font-bold text-green-600">
                      {formatCurrency(
                        reservationsWithDiscounts.reduce(
                          (acc, res) => acc + res.totalAmount, 
                          0
                        )
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Financial;
