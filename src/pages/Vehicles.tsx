import React, {useEffect, useState} from 'react';
import {DailyRate, Vehicle} from '@/types';
import {
    Table, TableHeader, TableRow, TableHead,
    TableBody, TableCell
} from '@/components/ui/table';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Card, CardHeader, CardTitle, CardContent} from '@/components/ui/card';
import {
    Car, Plus, Edit, Trash2, Check, X, Search,
    Clock, CheckCircle
} from 'lucide-react';
import {Badge} from '@/components/ui/badge';
import {CreateVehicleRequest, VehiclesService, VehicleStatus} from '@/services/vehiclesService';
import {toast} from "sonner";
import {DailyRatesService} from "@/services/dailyRatesService.ts";
import DailyRatesChart from "@/pages/DailyRatesChart.tsx";

const Vehicles: React.FC = () => {
    const [vehiclesList, setVehiclesList] = useState<Vehicle[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);
    const [dailyRatesModalOpen, setDailyRatesModalOpen] = useState(false);
    const [dailyRates, setDailyRates] = useState<DailyRate[]>([]);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);


    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                const response = await VehiclesService.getVehicles();
                setVehiclesList(response.data.content);
            } catch (err) {
                console.error('Erro ao buscar veículos:', err);
            }
        };

        fetchVehicles();
    }, []);

    const [formData, setFormData] = useState<Vehicle>({
        plate: '',
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        status: 'DISPONIVEL',
        imageUrl: '',
        dailyRate: 0,
    });

    const resetForm = () => {
        setFormData({
            plate: '',
            brand: '',
            model: '',
            year: new Date().getFullYear(),
            status: 'DISPONIVEL',
            imageUrl: '',
            dailyRate: 0,
        });
        setEditingVehicle(null);
    };

    const openDailyRateHistory = async (vehicle: Vehicle) => {
        try {
            const response = await DailyRatesService.getDailyRatesByVehiclePlate(vehicle.plate);
            setDailyRates(response.data);
            setSelectedVehicle(vehicle);
            setDailyRatesModalOpen(true);
        } catch (err) {
            toast.error('Erro ao buscar histórico de diárias.');
            console.error(err);
        }
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const {name, value} = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: name === 'year' || name === 'dailyRate' ? (name === 'year' ? value : Number(value)) : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const dataToSend: CreateVehicleRequest = {
            plate: formData.plate,
            year: Number(formData.year),
            model: formData.model,
            brand: formData.brand,
            status: VehicleStatus[formData.status as keyof typeof VehicleStatus],
            imageUrl: formData.imageUrl,
            dailyRate: formData.dailyRate,
        };

        try {
            if (editingVehicle) {
                await VehiclesService.updateVehicle(dataToSend.plate, dataToSend);
                toast.success('Veículo atualizado com success!');
            } else {
                await VehiclesService.createVehicle(dataToSend);
                toast.success('Veículo cadastrado com sucesso!');
            }

            const updated = await VehiclesService.getVehicles();
            setVehiclesList(updated.data.content);

            setShowForm(false);
            resetForm();
        } catch (error: unknown) {
            if (
                typeof error === 'object' &&
                error !== null &&
                'response' in error &&
                typeof (error as { response: unknown }).response === 'object' &&
                (error as { response: { data: unknown } }).response.data &&
                typeof (error as { response: { data: { message: unknown } } }).response.data.message === 'string'
            ) {
                const message = (error as {
                    response: { data: { message: string } }
                }).response.data.message;

                toast.error(message);
            } else {
                toast.error('Erro inesperado ao salvar veículo.');
            }

            console.error('Erro ao salvar veículo:', error);
        }

    };

    const latestRateId = dailyRates.reduce((latest, current) =>
            new Date(current.dateTime) > new Date(latest.dateTime) ? current : latest
        , dailyRates[0])?.id;

    const handleEdit = (vehicle: Vehicle) => {
        setEditingVehicle(vehicle);
        setFormData({
            plate: vehicle.plate,
            brand: vehicle.brand,
            model: vehicle.model,
            year: vehicle.year,
            status: vehicle.status,
            imageUrl: vehicle.imageUrl,
            dailyRate: vehicle.dailyRate || 0,
        });
        setShowForm(true);
    };

    const confirmDelete = (vehicle: Vehicle) => {
        setVehicleToDelete(vehicle);
    };

    const cancelDelete = () => {
        setVehicleToDelete(null);
    };

    const handleConfirmDelete = async () => {
        if (!vehicleToDelete) return;

        try {
            await VehiclesService.deleteVehicle(vehicleToDelete.plate);
            const updated = await VehiclesService.getVehicles();
            const vehicles = Array.isArray(updated.data) ? updated.data : updated.data.content;
            setVehiclesList(vehicles);
            toast.success(`Veículo ${vehicleToDelete.plate} deletado com sucesso!`);
        } catch (err) {
            console.error('Erro ao deletar veículo:', err);
            toast.error('Erro ao deletar veículo.');
        } finally {
            setVehicleToDelete(null);
        }
    };

    const filteredVehicles = vehiclesList.filter(vehicle => {
        const searchLower = searchTerm.toLowerCase();
        return (
            vehicle.model.toLowerCase().includes(searchLower) ||
            vehicle.brand.toLowerCase().includes(searchLower) ||
            vehicle.plate.toLowerCase().includes(searchLower)
        );
    });

    const getStatusBadge = (status: Vehicle['status']) => {
        switch (status) {
            case 'DISPONIVEL':
                return <Badge className="bg-green-500">Disponível</Badge>;
            case 'ALUGADO':
                return <Badge className="bg-red-500">Alugado</Badge>;
            case 'MANUTENCAO':
                return <Badge className="bg-yellow-500">Manutenção</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Gerenciamento de Veículos</h1>
                <Button onClick={() => {
                    resetForm();
                    setShowForm(!showForm);
                }}>
                    <Plus className="mr-2 h-4 w-4"/> Novo Veículo
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
                                        Marca <span className="text-red-500">*</span>
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
                                        Modelo <span className="text-red-500">*</span>
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
                                        type="text"
                                        maxLength={10}
                                        value={formData.year}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1" htmlFor="plate">
                                        Placa <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        id="plate"
                                        name="plate"
                                        value={formData.plate}
                                        onChange={handleInputChange}
                                        maxLength={20}
                                        required
                                        disabled={!!editingVehicle}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1" htmlFor="dailyRate">
                                        Diária (R$) <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        id="dailyRate"
                                        name="dailyRate"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.dailyRate || 0}
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
                                        <option value="DISPONIVEL">Disponível</option>
                                        <option value="ALUGADO">Alugado</option>
                                        <option value="MANUTENCAO">Manutenção</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1" htmlFor="imageUrl">
                                        URL da Imagem (opcional)
                                    </label>
                                    <Input
                                        id="imageUrl"
                                        name="imageUrl"
                                        value={formData.imageUrl}
                                        onChange={handleInputChange}
                                        maxLength={255}
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
                                    <X className="mr-2 h-4 w-4"/> Cancelar
                                </Button>
                                <Button type="submit">
                                    <Check className="mr-2 h-4 w-4"/> {editingVehicle ? 'Atualizar' : 'Salvar'}
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
                            <Car className="mr-2 text-sigac-blue"/>
                            <CardTitle>Frota de Veículos</CardTitle>
                        </div>
                        <div className="flex gap-2 w-full md:w-64">
                            <div className="relative w-full">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500"/>
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
                                        <TableRow key={vehicle.plate}>
                                            <TableCell>
                                                <div className="font-medium">{vehicle.brand} {vehicle.model}</div>
                                            </TableCell>
                                            <TableCell>{vehicle.plate}</TableCell>
                                            <TableCell>{vehicle.year}</TableCell>
                                            <TableCell>
                                                {new Intl.NumberFormat('pt-BR', {
                                                    style: 'currency',
                                                    currency: 'BRL'
                                                }).format(vehicle.dailyRate ?? 100)}
                                            </TableCell>
                                            <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" size="sm"
                                                            onClick={() => handleEdit(vehicle)}>
                                                        <Edit className="h-4 w-4"/>
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-red-500 border-red-200 hover:bg-red-50"
                                                        onClick={() => confirmDelete(vehicle)}
                                                    >
                                                        <Trash2 className="h-4 w-4"/>
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openDailyRateHistory(vehicle)}
                                                    >
                                                        <Clock className="h-4 w-4"/>
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
            {/* Modal simples de confirmação */}
            {vehicleToDelete && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    onClick={cancelDelete} // fecha modal clicando fora
                >
                    <div
                        className="bg-white rounded p-6 w-80"
                        onClick={e => e.stopPropagation()} // impede fechar ao clicar dentro do modal
                    >
                        <h2 className="text-lg font-semibold mb-4">Confirmar Exclusão</h2>
                        <p className="mb-6">
                            Tem certeza que deseja excluir o veículo <strong>{vehicleToDelete.plate}</strong>?
                        </p>
                        <div className="flex justify-end gap-4">
                            <Button variant="outline" onClick={cancelDelete}>Cancelar</Button>
                            <Button variant="destructive" onClick={handleConfirmDelete}>Excluir</Button>
                        </div>
                    </div>
                </div>
            )}

            {dailyRatesModalOpen && selectedVehicle && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    onClick={() => setDailyRatesModalOpen(false)}
                >
                    <div
                        className="bg-white rounded-lg p-6 w-[90%] max-w-2xl shadow-lg max-h-[90vh] overflow-y-auto"
                        onClick={e => e.stopPropagation()}
                    >
                        <h2 className="text-xl font-semibold mb-4">
                            Histórico de Diárias - {selectedVehicle.plate}
                        </h2>

                        <DailyRatesChart dailyRates={dailyRates} />

                        {dailyRates.length > 0 ? (
                            <ul className="space-y-2">
                                {dailyRates.map((rate) => (
                                    <li
                                        key={rate.id}
                                        className="border rounded p-3 flex justify-between items-center"
                                    >
                                        <div className="flex items-center gap-2">
          <span>{new Date(rate.dateTime).toLocaleString('pt-BR', {
              day: '2-digit', month: '2-digit', year: 'numeric',
              hour: '2-digit', minute: '2-digit', second: '2-digit',
              hour12: false
          })}</span>

                                            {rate.id === latestRateId && (
                                                <CheckCircle
                                                    className="text-green-600"
                                                    size={18}
                                                />
                                            )}
                                        </div>
                                        <span className="font-medium text-green-600">
          R$ {(rate.amount ?? 0).toFixed(2)}
        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500">Nenhuma diária encontrada para este veículo.</p>
                        )}


                        <div className="mt-6 text-right">
                            <Button variant="outline" onClick={() => setDailyRatesModalOpen(false)}>
                                Fechar
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Vehicles;
