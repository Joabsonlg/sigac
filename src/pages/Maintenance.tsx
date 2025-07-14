import React, {useCallback, useEffect, useState} from 'react';
import Layout from '@/components/layout/Layout';
import {MaintenanceRecord, Vehicle} from '@/types';
import {maintenanceRecords, vehicles, formatDate, formatCurrency} from '@/data/mockData';
import {
    Table, TableHeader, TableRow, TableHead,
    TableBody, TableCell
} from '@/components/ui/table';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Card, CardHeader, CardTitle, CardContent} from '@/components/ui/card';
import {
    Wrench, Plus, Edit, Trash2, Check, X, Search, Calendar, AlertTriangle,
    Car, CircleDollarSign
} from 'lucide-react';
import {Label} from '@/components/ui/label';
import {Badge} from '@/components/ui/badge';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import {
    Tabs, TabsContent, TabsList, TabsTrigger
} from '@/components/ui/tabs';
import {MaintenanceService} from '@/services/maintenanceService';
import FilterableSelect from "@/components/ui/filterable-select.tsx";
import useSelectWithFilter from "@/hooks/useSelectWithFilter.ts";
import {toast} from "sonner";

export type MaintenanceForm = {
    vehiclePlate: string;
    description: string;
    scheduledDate: string;
    completedDate?: string;
    cost?: number;
    type: 'preventive' | 'corrective';
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    employeeUserCpf?: string;
};

export type MaintenanceBackendDTO = {
    vehiclePlate: string;
    description: string;
    scheduledDate: string;
    performedDate?: string | null;
    cost?: string;
    type: 'PREVENTIVA' | 'CORRETIVA';
    status: 'AGENDADA' | 'EM_ANDAMENTO' | 'CONCLUIDA' | 'CANCELADA';
    employeeUserCpf: string;
};

const Maintenance: React.FC = () => {
    const [maintenanceList, setMaintenanceList] = useState<MaintenanceRecord[]>(maintenanceRecords);
    const [showForm, setShowForm] = useState(false);
    const [editingMaintenance, setEditingMaintenance] = useState<MaintenanceRecord | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [selectedMaintenance, setSelectedMaintenance] = useState<MaintenanceRecord | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [maintenanceCost, setMaintenanceCost] = useState<number | ''>('');

    const {
        employeeOptions,
        vehicleOptions,
        loadingEmployees,
        loadingVehicles
    } = useSelectWithFilter();

    // New maintenance form state
    const [formData, setFormData] = useState<Omit<MaintenanceRecord, 'id'>>({
        vehiclePlate: '',
        type: 'preventive',
        description: '',
        scheduledDate: new Date().toISOString().split('T')[0],
        completedDate: '',
        cost: 0,
        status: 'scheduled',
        employeeUserCpf: 'string'
    });

    const resetForm = () => {
        setFormData({
            vehiclePlate: '',
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
        const {name, value} = e.target;
        console.log(`handleInputChange: name=${name}, value=${value}`);


        setFormData(prev => ({
            ...prev,
            [name]: name === 'cost' ? Number(value) : value
        }));
    };

    const fetchMaintenances = useCallback(async () => {
        try {
            setLoading(true);
            const response = await MaintenanceService.getMaintenances();
            const data = response?.data || [];

            const mappedData: MaintenanceRecord[] = (Array.isArray(data) ? data : data.content || []).map((item: any) => ({
                id: item.id.toString(),
                vehiclePlate: item.vehiclePlate,
                type: item.type?.toLowerCase() || 'preventive',
                description: item.description || '',
                scheduledDate: item.scheduledDate,
                completedDate: item.performedDate || '',
                cost: parseFloat(item.cost || 0),
                status: mapStatus(item.status),
                employeeUserCpf: item.employeeUserCpf || '',
            }));

            setMaintenanceList(mappedData);
        } catch (err) {
            console.error('Erro ao carregar manutenções:', err);
            setMaintenanceList([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingMaintenance) {
                const updated = await MaintenanceService.updateMaintenance(
                    editingMaintenance.id,
                    formData
                );
                setMaintenanceList(prev =>
                    prev.map(item => (item.id === updated.id ? updated : item))
                );
                toast.success('Manutenção editada com sucesso!');
            } else {
                const created = await MaintenanceService.createMaintenance(formData);
                setMaintenanceList(prev => [...prev, created]);
                toast.success('Manutenção cadastrada com sucesso!');
            }

            await fetchMaintenances();
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
                toast.error('Erro inesperado ao salvar manutenção.');
            }

            console.error('Erro ao salvar veículo:', error);
        }
    };


    const handleEdit = (maintenance: MaintenanceRecord) => {
        setEditingMaintenance(maintenance);
        setFormData({
            vehiclePlate: maintenance.vehiclePlate,
            type: maintenance.type,
            description: maintenance.description,
            scheduledDate: maintenance.scheduledDate,
            completedDate: maintenance.completedDate || '',
            cost: maintenance.cost || 0,
            status: maintenance.status,
            employeeUserCpf: maintenance.employeeUserCpf || '',
        });
        setShowForm(true);
    };

    const handleViewDetails = (maintenance: MaintenanceRecord) => {
        setSelectedMaintenance(maintenance);
        setIsDialogOpen(true);
    };

    const getVehicleById = (id: string): Vehicle | undefined => {
        return vehicles.find(vehicle => vehicle.plate === id);
    };

    const getStatusBadge = (status: MaintenanceRecord['status']) => {
        switch (status) {
            case 'scheduled':
                return <Badge className="bg-blue-500">Agendada</Badge>;
            case 'in_progress':
                return <Badge className="bg-yellow-500">Em Andamento</Badge>;
            case 'completed':
                return <Badge className="bg-green-500">Concluída</Badge>;
            case 'cancelled':
                return <Badge className="bg-red-500">Cancelada</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const filteredMaintenanceList = maintenanceList.filter((maintenance) => {
        const plate = maintenance?.vehiclePlate?.toLowerCase?.() || '';
        const searchLower = searchTerm.toLowerCase();

        const matchesSearch = plate.includes(searchLower);

        if (activeTab === 'all') {
            return matchesSearch;
        } else {
            return matchesSearch && maintenance.status === activeTab;
        }
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await MaintenanceService.getMaintenances();
                const page = response?.data;

                const data = Array.isArray(page) ? page : page.content || [];

                const mappedData: MaintenanceRecord[] = data.map((item: any) => ({
                    id: item.id.toString(),
                    vehiclePlate: item.vehiclePlate,
                    type: item.type?.toLowerCase() || 'preventive',
                    description: item.description || '',
                    scheduledDate: item.scheduledDate,
                    completedDate: item.performedDate || '',
                    cost: parseFloat(item.cost || 0),
                    status: mapStatus(item.status),
                    employeeUserCpf: item.employeeUserCpf || '',
                }));

                setMaintenanceList(mappedData);
            } catch (error) {
                console.error('Erro ao carregar manutenções:', error);
                setMaintenanceList([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const mapStatus = (status: string): MaintenanceRecord['status'] => {
        switch (status.toUpperCase()) {
            case 'AGENDADA':
                return 'scheduled';
            case 'CONCLUIDA':
                return 'completed';
            case 'EM_ANDAMENTO':
                return 'in_progress';
            case 'CANCELADA':
                return 'cancelled';
            default:
                return 'scheduled';
        }
    };


    const [maintenanceToCancel, setMaintenanceToCancel] = useState<MaintenanceRecord | null>(null);

    const confirmCancel = (maintenance: MaintenanceRecord) => {
        setMaintenanceToCancel(maintenance);
    };

    const cancelCancel = () => {
        setMaintenanceToCancel(null);
    };

    const handleConfirmCancel = async () => {
        if (!maintenanceToCancel) return;

        try {
            await MaintenanceService.deleteMaintenance(maintenanceToCancel.id);

            await fetchMaintenances();

            toast.success(`Manutenção do veículo ${maintenanceToCancel.vehiclePlate} cancelada com sucesso!`);
        } catch (err) {
            console.error('Erro ao cancelar manutenção:', err);
            toast.error('Erro ao cancelar manutenção.');
        } finally {
            setMaintenanceToCancel(null);
        }
    };

    const handleUpdateStatus = async (
        id: string,
        newStatus: 'AGENDADA' | 'EM_ANDAMENTO' | 'CONCLUIDA' | 'CANCELADA',
        cost?: number
    ) => {
        try {
            const updated = await MaintenanceService.updateMaintenanceStatus(id, newStatus, cost);
            await fetchMaintenances();

            const statusMessageMap = {
                AGENDADA: 'agendada',
                EM_ANDAMENTO: 'iniciada',
                CONCLUIDA: 'concluída',
                CANCELADA: 'cancelada',
            };

            toast.success(`Manutenção do veículo ${statusMessageMap[newStatus]} com sucesso!`);
            setMaintenanceList(prev => prev.map(item => (item.id === updated.id ? updated : item)));
            setIsDialogOpen(false);
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Gerenciamento de Manutenção</h1>
                <Button onClick={() => {
                    resetForm();
                    setShowForm(!showForm);
                }}>
                    <Plus className="mr-2 h-4 w-4"/> Nova Manutenção
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
                                    <FilterableSelect
                                        options={vehicleOptions}
                                        value={formData.vehiclePlate}
                                        onChange={(value) => handleSelectChange('vehiclePlate', value)}
                                        placeholder="Selecione um veículo..."
                                        loading={loadingVehicles}
                                        emptyMessage="Nenhum veículo disponível."
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="vehicleId">Funcionário</Label>
                                    <FilterableSelect
                                        options={employeeOptions}
                                        value={formData.employeeUserCpf}
                                        onChange={(value) => handleSelectChange('employeeUserCpf', value)}
                                        placeholder="Selecione um funcionário..."
                                        loading={loadingEmployees}
                                        emptyMessage="Nenhum funcionário encontrado."
                                    />
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
                                    <X className="mr-2 h-4 w-4"/> Cancelar
                                </Button>
                                <Button type="submit">
                                    <Check className="mr-2 h-4 w-4"/> {editingMaintenance ? 'Atualizar' : 'Salvar'}
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
                            <Wrench className="mr-2 text-sigac-blue"/>
                            <CardTitle>Registro de Manutenções</CardTitle>
                        </div>
                        <div className="flex gap-2 w-full md:w-64">
                            <div className="relative w-full">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500"/>
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
                                        const vehicle = getVehicleById(maintenance.vehiclePlate);
                                        return (
                                            <TableRow key={maintenance.id}>
                                                <TableCell>
                                                    <div className="font-medium">
                                                        {(maintenance.vehiclePlate)}
                                                    </div>
                                                    <div className="text-gray-500 text-xs">{vehicle?.plate}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        {maintenance?.type?.toUpperCase().trim() === 'PREVENTIVA'
                                                            ? 'Preventiva'
                                                            : maintenance?.type?.toUpperCase().trim() === 'CORRETIVA'
                                                                ? 'Corretiva'
                                                                : 'Tipo desconhecido'}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center">
                                                        <Calendar className="mr-1 h-3 w-3 text-gray-500"/>
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
                                                            <Search className="h-4 w-4"/>
                                                        </Button>
                                                        {maintenance.status === 'scheduled' && (
                                                            <>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleEdit(maintenance)}
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="text-red-500 border-red-200 hover:bg-red-50"
                                                                    onClick={() => confirmCancel(maintenance)}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </>
                                                        )}
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
                            {/* Seu conteúdo detalhado aqui... */}
                            <div className="flex items-center space-x-2">
                                <Car className="h-5 w-5 text-sigac-blue"/>
                                <div>
                                    <div className="font-medium">Veículo</div>
                                    <div>{selectedMaintenance.vehiclePlate ? `${selectedMaintenance.vehiclePlate}` : 'Veículo não encontrado'}</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="font-medium">Tipo</div>
                                    <div>
                                        {selectedMaintenance?.type?.toUpperCase().trim() === 'PREVENTIVA'
                                            ? 'Preventiva'
                                            : selectedMaintenance?.type?.toUpperCase().trim() === 'CORRETIVA'
                                                ? 'Corretiva'
                                                : 'Tipo desconhecido'}
                                    </div>
                                </div>

                                <div>
                                    <div className="font-medium">Status</div>
                                    <div>{getStatusBadge(selectedMaintenance.status)}</div>
                                </div>

                                <div>
                                    <div className="font-medium">Data Agendada</div>
                                    <div className="flex items-center">
                                        <Calendar className="mr-1 h-3 w-3 text-gray-500"/>
                                        {formatDate(selectedMaintenance.scheduledDate)}
                                    </div>
                                </div>

                                {selectedMaintenance.completedDate && (
                                    <div>
                                        <div className="font-medium">Data Concluída</div>
                                        <div className="flex items-center">
                                            <Calendar className="mr-1 h-3 w-3 text-gray-500"/>
                                            {formatDate(selectedMaintenance.completedDate)}
                                        </div>
                                    </div>
                                )}

                                {selectedMaintenance.status === 'completed' && selectedMaintenance.cost && (
                                    <div>
                                        <div className="font-medium">Custo</div>
                                        <div className="flex items-center">
                                            <CircleDollarSign className="mr-1 h-3 w-3 text-gray-500"/>
                                            {formatCurrency(selectedMaintenance.cost)}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* ... mais dados */}

                            {(selectedMaintenance.status === 'scheduled' || selectedMaintenance.status === 'in_progress') && (
                                <div className="mb-4">
                                    <label htmlFor="maintenanceCost" className="block font-medium mb-1">
                                        Custo (R$)
                                    </label>
                                    <input
                                        id="maintenanceCost"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={maintenanceCost}
                                        onChange={(e) =>
                                            setMaintenanceCost(e.target.value === '' ? '' : Number(e.target.value))
                                        }
                                        className="w-full p-2 border rounded-md"
                                        placeholder="Digite o custo da manutenção"
                                    />
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            {selectedMaintenance.status !== 'completed' && (
                                <div className="flex items-center space-x-2">
                                    {selectedMaintenance.status === 'scheduled' && (
                                        <Button
                                            onClick={() =>
                                                handleUpdateStatus(
                                                    selectedMaintenance.id,
                                                    'EM_ANDAMENTO',
                                                    maintenanceCost === '' ? 0 : maintenanceCost
                                                )
                                            }
                                            className="bg-yellow-500 hover:bg-yellow-600"
                                            disabled={maintenanceCost === '' || maintenanceCost < 0}
                                        >
                                            Iniciar Manutenção
                                        </Button>
                                    )}

                                    {selectedMaintenance.status === 'in_progress' && (
                                        <Button
                                            onClick={() =>
                                                handleUpdateStatus(
                                                    selectedMaintenance.id,
                                                    'CONCLUIDA',
                                                    maintenanceCost === '' ? 0 : maintenanceCost
                                                )
                                            }
                                            className="bg-green-500 hover:bg-green-600"
                                            disabled={maintenanceCost === '' || maintenanceCost < 0}
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
            {maintenanceToCancel && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    onClick={cancelCancel}
                >
                    <div
                        className="bg-white rounded p-6 w-80"
                        onClick={e => e.stopPropagation()}
                    >
                        <h2 className="text-lg font-semibold mb-4">Confirmar Cancelamento</h2>
                        <p className="mb-6">
                            Tem certeza que deseja cancelar a manutenção do
                            veículo <strong>{maintenanceToCancel.vehiclePlate}</strong>?
                        </p>
                        <div className="flex justify-end gap-4">
                            <Button variant="outline" onClick={cancelCancel}>Cancelar</Button>
                            <Button variant="destructive" onClick={handleConfirmCancel}>Cancelar Manutenção</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Maintenance;
