import {useLocation} from 'react-router-dom';
import React, {useEffect, useState} from 'react';
import {ReservationData} from '@/types';
import ReservationsService, {
    CreateReservationRequest,
    ReservationStatus,
    UpdateReservationRequest
} from '@/services/reservationsService';
import useSelectWithFilter from '@/hooks/useSelectWithFilter';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Ban, CalendarCheck, Check, CreditCard, Edit, Loader2, Plus, Search, Trash2, X} from 'lucide-react';
import {Label} from '@/components/ui/label';
import {Badge} from '@/components/ui/badge';
import {useToast} from '@/hooks/use-toast';
import {useAuth} from '@/contexts/AuthContext';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import FilterableSelect from '@/components/ui/filterable-select';

const Reservations: React.FC = () => {
    // Estado para modal de pagamento
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState<ReservationData | null>(null);
    // Utilitário para formatar valores em reais
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(value);
    };
    // Estado para valor calculado
    const [calculatedAmount, setCalculatedAmount] = useState<number | null>(null);
    const [calculatingAmount, setCalculatingAmount] = useState(false);
    const {user} = useAuth();
    const role = user?.role?.toLowerCase();
    const isClient = role === 'client' || role === 'cliente';
    const isAttendant = role === 'attendant' || role === 'atendente';
    const location = useLocation();

    const searchParams = new URLSearchParams(location.search);
    const openFormParam = searchParams.get('openForm');
    const vehicleParam = searchParams.get('vehicle');
    const [reservationsList, setReservationsList] = useState<ReservationData[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(openFormParam === 'true');
    const [editingReservation, setEditingReservation] = useState<ReservationData | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<ReservationStatus | 'all'>('all');
    const [submitting, setSubmitting] = useState(false);
    const [searching, setSearching] = useState(false);
    const {toast} = useToast();

    // Hook for select options
    const {
        clientOptions,
        employeeOptions,
        vehicleOptions,
        loadingClients,
        loadingEmployees,
        loadingVehicles
    } = useSelectWithFilter();

    // New reservation form state
    const [formData, setFormData] = useState<CreateReservationRequest>({
        startDate: '',
        endDate: '',
        clientUserCpf: isClient ? user?.cpf || '' : '',
        employeeUserCpf: isAttendant ? user?.cpf || '' : '',
        vehiclePlate: vehicleParam || '',
        promotionCode: undefined
    });

    // Load reservations and handle query params
    useEffect(() => {
        if (openFormParam === 'true') {
            setShowForm(true);
        }
        if (vehicleParam) {
            setFormData(prev => ({...prev, vehiclePlate: vehicleParam}));
        }
        if (isClient && user?.cpf) {
            setFormData(prev => ({...prev, clientUserCpf: user.cpf}));
        }
        if (isAttendant && user?.cpf) {
            setFormData(prev => ({...prev, employeeUserCpf: user.cpf}));
        }
        loadReservations();
    }, [openFormParam, vehicleParam, isClient, isAttendant, user]);

    // Reload reservations when filters change (with debounce for search)
    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            loadReservations();
        }, searchTerm ? 500 : 0); // 500ms debounce for search, immediate for other filters

        return () => clearTimeout(debounceTimer);
    }, [searchTerm, statusFilter]);

    const loadReservations = async () => {
        try {
            // Set different loading states
            if (searchTerm || statusFilter !== 'all') {
                setSearching(true);
            } else {
                setLoading(true);
            }

            // Use the service method with filters
            const response = await ReservationsService.getReservations(
                0, // page
                100, // size - load more items to avoid pagination issues for now
                statusFilter !== 'all' ? statusFilter : undefined,
                searchTerm || undefined
            );

            // Extract reservations from API response structure
            const reservations = response.data?.content || response.data || [];
            setReservationsList(Array.isArray(reservations) ? reservations : []);
        } catch (error) {
            console.error('Error loading reservations:', error);
            toast({
                title: "Erro",
                description: "Não foi possível carregar as reservas.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
            setSearching(false);
        }
    };

    const resetForm = () => {
        setFormData({
            startDate: '',
            endDate: '',
            clientUserCpf: '',
            employeeUserCpf: '',
            vehiclePlate: '',
            promotionCode: undefined
        });
        setEditingReservation(null);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'promotionCode'
                ? (value === '' ? undefined : Number(value))
                : value
        }));
        // Dispara cálculo se campos relevantes mudarem
        if (["startDate", "endDate", "vehiclePlate", "promotionCode"].includes(name)) {
            triggerAmountCalculation({
                ...formData,
                [name]: name === 'promotionCode' ? (value ? Number(value) : undefined) : value
            });
        }
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Dispara cálculo se campos relevantes mudarem
        if (["startDate", "endDate", "vehiclePlate", "promotionCode"].includes(name)) {
            triggerAmountCalculation({...formData, [name]: value});
        }
    };

    // Função para calcular valor da reserva
    const triggerAmountCalculation = async (data: Partial<CreateReservationRequest>) => {
        const {startDate, endDate, vehiclePlate, promotionCode} = data;
        if (startDate && endDate && vehiclePlate) {
            setCalculatingAmount(true);
            try {
                const payload: { startDate: string; endDate: string; vehiclePlate: string; promotionCode?: number } = {
                    startDate,
                    endDate,
                    vehiclePlate
                };
                if (
                    typeof promotionCode === 'number' &&
                    !isNaN(promotionCode)
                ) {
                    payload.promotionCode = promotionCode;
                }
                const amount = await ReservationsService.calculateAmount(payload);
                setCalculatedAmount(amount);
            } catch (err) {
                setCalculatedAmount(null);
            } finally {
                setCalculatingAmount(false);
            }
        } else {
            setCalculatedAmount(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Corrige clientUserCpf para clientes
        let cpfToUse = formData.clientUserCpf;
        if (isClient && user?.cpf) {
            cpfToUse = user.cpf;
        }
        // Validate required fields
        if (!formData.startDate || !formData.endDate || !cpfToUse ||
            (!isClient && !formData.employeeUserCpf) || !formData.vehiclePlate) {
            console.log('O(s) campo(s) obrigatório(s) não preenchido(s):')
            console.log('Start Date:', formData.startDate);
            console.log('End Date:', formData.endDate);
            console.log('Client User CPF:', cpfToUse);
            console.log('Employee User CPF:', formData.employeeUserCpf);
            console.log('Vehicle Plate:', formData.vehiclePlate);

            toast({
                title: "Erro",
                description: "Por favor, preencha todos os campos obrigatórios.",
                variant: "destructive"
            });
            return;
        }

        try {
            setSubmitting(true);

            if (editingReservation) {
                // Update existing reservation
                const updateData: UpdateReservationRequest = {
                    startDate: formData.startDate,
                    endDate: formData.endDate,
                    employeeUserCpf: formData.employeeUserCpf,
                    vehiclePlate: formData.vehiclePlate,
                    promotionCode: formData.promotionCode
                };

                await ReservationsService.updateReservation(editingReservation.id, updateData);

                toast({
                    title: "Sucesso",
                    description: "Reserva atualizada com sucesso!",
                    variant: "default"
                });
            } else {
                // Create new reservation
                await ReservationsService.createReservation({
                    ...formData,
                    clientUserCpf: cpfToUse
                });

                toast({
                    title: "Sucesso",
                    description: "Reserva criada com sucesso!",
                    variant: "default"
                });
            }

            // Reset form and reload data
            resetForm();
            setShowForm(false);
            loadReservations();

        } catch (error: any) {
            console.error('Error saving reservation:', error);
            toast({
                title: "Erro",
                description: error.response?.data?.message || "Erro ao salvar reserva.",
                variant: "destructive"
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (reservation: ReservationData) => {
        setEditingReservation(reservation);

        // Convert date array to datetime-local format
        const convertArrayToDatetimeLocal = (dateArray: number[]) => {
            if (!dateArray || !Array.isArray(dateArray) || dateArray.length < 3) {
                return '';
            }
            try {
                const [year, month, day, hour = 0, minute = 0] = dateArray;
                // Create date object (month is 1-based in array but 0-based in Date constructor)
                const date = new Date(year, month - 1, day, hour, minute);
                if (isNaN(date.getTime())) return '';
                return date.toISOString().slice(0, 16);
            } catch {
                return '';
            }
        };

        setFormData({
            startDate: convertArrayToDatetimeLocal(reservation.startDate),
            endDate: convertArrayToDatetimeLocal(reservation.endDate),
            clientUserCpf: reservation.clientUserCpf,
            employeeUserCpf: reservation.employeeUserCpf,
            vehiclePlate: reservation.vehiclePlate,
            promotionCode: reservation.promotionCode
        });
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Tem certeza que deseja excluir esta reserva?')) {
            return;
        }

        try {
            await ReservationsService.deleteReservation(id);

            toast({
                title: "Sucesso",
                description: "Reserva excluída com sucesso!",
                variant: "default"
            });

            loadReservations();
        } catch (error: any) {
            console.error('Error deleting reservation:', error);
            toast({
                title: "Erro",
                description: error.response?.data?.message || "Erro ao excluir reserva.",
                variant: "destructive"
            });
        }
    };

    const handleStatusChange = async (reservation: ReservationData, newStatus: ReservationStatus) => {
        if (!ReservationsService.canUpdateStatus(reservation.status, newStatus)) {
            toast({
                title: "Erro",
                description: "Transição de status não permitida.",
                variant: "destructive"
            });
            return;
        }

        try {
            await ReservationsService.updateReservationStatus(reservation.id, newStatus);

            toast({
                title: "Sucesso",
                description: "Status da reserva atualizado com sucesso!",
                variant: "default"
            });

            loadReservations();
        } catch (error: any) {
            console.error('Error updating reservation status:', error);
            toast({
                title: "Erro",
                description: error.response?.data?.message || "Erro ao atualizar status.",
                variant: "destructive"
            });
        }
    };

    const handleCancelForm = () => {
        resetForm();
        setShowForm(false);
    };

    const formatDate = (dateArray: number[]) => {
        if (!dateArray || !Array.isArray(dateArray) || dateArray.length < 3) {
            return 'Data inválida';
        }

        try {
            // dateArray format: [year, month, day, hour, minute, second]
            // Note: month is 1-based in the array but Date constructor expects 0-based
            const [year, month, day, hour = 0, minute = 0, second = 0] = dateArray;
            const date = new Date(year, month - 1, day, hour, minute, second);

            if (isNaN(date.getTime())) {
                return 'Data inválida';
            }

            return date.toLocaleDateString('pt-BR');
        } catch (error) {
            return 'Data inválida';
        }
    };

    const formatDateTime = (dateArray: number[]) => {
        if (!dateArray || !Array.isArray(dateArray) || dateArray.length < 3) {
            return 'Data inválida';
        }

        try {
            // dateArray format: [year, month, day, hour, minute, second]
            // Note: month is 1-based in the array but Date constructor expects 0-based
            const [year, month, day, hour = 0, minute = 0, second = 0] = dateArray;
            const date = new Date(year, month - 1, day, hour, minute, second);

            if (isNaN(date.getTime())) {
                return 'Data inválida';
            }

            return date.toLocaleString('pt-BR');
        } catch (error) {
            return 'Data inválida';
        }
    };

    const handleCancelReservation = async (id: number) => {
        if (!window.confirm('Tem certeza que deseja cancelar esta reserva?')) return;
        try {
            await ReservationsService.updateReservationStatus(id, 'CANCELLED');
            toast({
                title: 'Sucesso',
                description: 'Reserva cancelada com sucesso!',
                variant: 'default'
            });
            loadReservations();
        } catch (error: any) {
            toast({
                title: 'Erro',
                description: error.response?.data?.message || 'Erro ao cancelar reserva.',
                variant: 'destructive'
            });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin"/>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Gerenciamento de Reservas</h1>
                <Button
                    onClick={() => {
                        resetForm();
                        setShowForm(!showForm);
                    }}
                    disabled={loading}
                >
                    <Plus className="mr-2 h-4 w-4"/> Nova Reserva
                </Button>
            </div>

            {showForm && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>{editingReservation ? 'Editar Reserva' : 'Nova Reserva'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="startDate">Data de Início</Label>
                                    <Input
                                        id="startDate"
                                        name="startDate"
                                        type="datetime-local"
                                        value={formData.startDate}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="endDate">Data de Fim</Label>
                                    <Input
                                        id="endDate"
                                        name="endDate"
                                        type="datetime-local"
                                        value={formData.endDate}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="clientUserCpf">Cliente</Label>
                                    {isClient ? (
                                        <Input
                                            id="clientUserCpf"
                                            name="clientUserCpf"
                                            value={user?.name ? `${user.name} - ${user.cpf}` : user?.cpf || ''}
                                            readOnly
                                            disabled
                                        />
                                    ) : (
                                        <FilterableSelect
                                            options={clientOptions}
                                            value={formData.clientUserCpf}
                                            onChange={(value) => handleSelectChange('clientUserCpf', value)}
                                            placeholder="Selecione um cliente..."
                                            loading={loadingClients}
                                            disabled={!!editingReservation}
                                            emptyMessage="Nenhum cliente encontrado."
                                        />
                                    )}
                                </div>
                                {isAttendant ? (
                                    <div>
                                        <Label htmlFor="employeeUserCpf">Funcionário</Label>
                                        <Input
                                            id="employeeUserCpf"
                                            name="employeeUserCpf"
                                            value={user?.name ? `${user.name} - ${user.cpf}` : user?.cpf || ''}
                                            readOnly
                                            disabled
                                        />
                                    </div>
                                ) : (!isClient && (
                                    <div>
                                        <Label htmlFor="employeeUserCpf">Funcionário</Label>
                                        <FilterableSelect
                                            options={employeeOptions}
                                            value={formData.employeeUserCpf}
                                            onChange={(value) => handleSelectChange('employeeUserCpf', value)}
                                            placeholder="Selecione um funcionário..."
                                            loading={loadingEmployees}
                                            emptyMessage="Nenhum funcionário encontrado."
                                        />
                                    </div>
                                ))}
                                <div>
                                    <Label htmlFor="vehiclePlate">Veículo</Label>
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
                                    <Label htmlFor="promotionCode">Código de Promoção</Label>
                                    <Input
                                        id="promotionCode"
                                        name="promotionCode"
                                        type="number"
                                        value={formData.promotionCode || ''}
                                        onChange={handleInputChange}
                                        placeholder="Opcional"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <Label>Valor a Pagar</Label>
                                    <div className="mt-1">
                                        {calculatingAmount ? (
                                            <span className="text-gray-500">Calculando...</span>
                                        ) : calculatedAmount !== null ? (
                                            <span
                                                className="font-bold text-green-700">{formatCurrency(calculatedAmount)}</span>
                                        ) : (
                                            <span className="text-gray-400">Informe datas e veículo para calcular</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCancelForm}
                                    disabled={submitting}
                                >
                                    <X className="mr-2 h-4 w-4"/> Cancelar
                                </Button>
                                <Button type="submit" disabled={submitting}>
                                    {submitting ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                    ) : (
                                        <Check className="mr-2 h-4 w-4"/>
                                    )}
                                    {submitting
                                        ? (editingReservation ? 'Atualizando...' : 'Criando...')
                                        : (editingReservation ? 'Atualizar' : 'Salvar')
                                    }
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
                            <CalendarCheck className="mr-2 text-sigac-blue"/>
                            <CardTitle>Lista de Reservas</CardTitle>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <div className="relative flex-1 md:w-64">
                                {searching ? (
                                    <Loader2 className="absolute left-2.5 top-2.5 h-4 w-4 animate-spin text-gray-500"/>
                                ) : (
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500"/>
                                )}
                                <Input
                                    placeholder="Buscar reservas..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9"
                                    disabled={loading}
                                />
                            </div>
                            <Select value={statusFilter}
                                    onValueChange={(value) => setStatusFilter(value as ReservationStatus | 'all')}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filtrar por status"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos os Status</SelectItem>
                                    <SelectItem value="PENDING">Pendente</SelectItem>
                                    <SelectItem value="CONFIRMED">Confirmada</SelectItem>
                                    <SelectItem value="IN_PROGRESS">Em Andamento</SelectItem>
                                    <SelectItem value="COMPLETED">Finalizada</SelectItem>
                                    <SelectItem value="CANCELLED">Cancelada</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center items-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin mr-2"/>
                            <span>Carregando reservas...</span>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Cliente</TableHead>
                                        <TableHead>Veículo</TableHead>
                                        {!isClient && <TableHead>Funcionário</TableHead>}
                                        <TableHead>Data Início</TableHead>
                                        <TableHead>Data Fim</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Valor</TableHead>
                                        <TableHead>Promoção</TableHead>
                                        <TableHead>Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {reservationsList.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={isClient ? 7 : 8} className="text-center text-gray-500">
                                                Nenhuma reserva encontrada.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        reservationsList.map((reservation) => (
                                            <TableRow key={reservation.id}>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{reservation.clientName}</div>
                                                        <div
                                                            className="text-sm text-gray-500">{reservation.clientUserCpf}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div
                                                            className="font-medium">{reservation.vehicleBrand} {reservation.vehicleModel}</div>
                                                        <div
                                                            className="text-sm text-gray-500">{reservation.vehiclePlate}</div>
                                                    </div>
                                                </TableCell>
                                                {!isClient && (
                                                    <TableCell>
                                                        <div>
                                                            <div
                                                                className="font-medium">{reservation.employeeName}</div>
                                                            <div
                                                                className="text-sm text-gray-500">{reservation.employeeUserCpf}</div>
                                                        </div>
                                                    </TableCell>
                                                )}
                                                <TableCell>{formatDateTime(reservation.startDate)}</TableCell>
                                                <TableCell>{formatDateTime(reservation.endDate)}</TableCell>
                                                <TableCell>
                                                    {isClient ? (
                                                        <Badge
                                                            className={ReservationsService.getStatusColor(reservation.status)}>
                                                            {ReservationsService.getStatusText(reservation.status)}
                                                        </Badge>
                                                    ) : (
                                                        <Select
                                                            value={reservation.status}
                                                            onValueChange={(value) => handleStatusChange(reservation, value as ReservationStatus)}
                                                        >
                                                            <SelectTrigger className="w-[130px]">
                                                                <Badge
                                                                    className={ReservationsService.getStatusColor(reservation.status)}>
                                                                    {ReservationsService.getStatusText(reservation.status)}
                                                                </Badge>
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="PENDING">Pendente</SelectItem>
                                                                <SelectItem value="CONFIRMED">Confirmada</SelectItem>
                                                                <SelectItem value="IN_PROGRESS">Em
                                                                    Andamento</SelectItem>
                                                                <SelectItem value="COMPLETED">Finalizada</SelectItem>
                                                                <SelectItem value="CANCELLED">Cancelada</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {reservation.amount !== undefined && reservation.amount !== null
                                                        ? formatCurrency(Number(reservation.amount))
                                                        : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {reservation.promotionCode || '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex space-x-2">
                                                        {isClient ? (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    className={`p-2 rounded ${['PENDING', 'CONFIRMED'].includes(reservation.status) ? 'hover:bg-red-100 text-red-600' : 'text-gray-400 cursor-not-allowed'}`}
                                                                    title="Cancelar Reserva"
                                                                    onClick={() => handleCancelReservation(reservation.id)}
                                                                    disabled={!['PENDING', 'CONFIRMED'].includes(reservation.status)}
                                                                >
                                                                    <Ban className="h-5 w-5"/>
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className={`p-2 rounded ${reservation.status === 'PENDING' ? 'hover:bg-blue-100 text-blue-600' : 'text-gray-400 cursor-not-allowed'}`}
                                                                    title="Pagamento"
                                                                    onClick={() => {
                                                                        setSelectedReservation(reservation);
                                                                        setShowPaymentModal(true);
                                                                    }}
                                                                    disabled={reservation.status !== 'PENDING'}
                                                                >
                                                                    <CreditCard className="h-5 w-5"/>
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleEdit(reservation)}
                                                                >
                                                                    <Edit className="h-4 w-4"/>
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleDelete(reservation.id)}
                                                                    className="text-red-600 hover:text-red-700"
                                                                >
                                                                    <Trash2 className="h-4 w-4"/>
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                    {/* Modal de Pagamento */}
                                                    {showPaymentModal && selectedReservation && (
                                                        <div
                                                            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                                                            <div
                                                                className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
                                                                <button
                                                                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                                                                    onClick={() => setShowPaymentModal(false)}
                                                                >
                                                                    <X className="h-5 w-5"/>
                                                                </button>
                                                                <h2 className="text-xl font-bold mb-4">Pagamento da
                                                                    Reserva</h2>
                                                                <div className="mb-4 flex flex-col items-center">
                                                                    {/* QRCode placeholder - substitua por componente real se necessário */}
                                                                    <div
                                                                        className="bg-gray-100 p-4 rounded mb-2 flex items-center justify-center">
                                                                        <img src="/qr-code.png" alt="QR Code"
                                                                             className="h-32 w-32"/>
                                                                    </div>
                                                                    <span
                                                                        className="font-semibold text-green-700 text-lg mb-2">{formatCurrency(Number(selectedReservation.amount))}</span>
                                                                    <span className="text-sm text-gray-600">Escaneie o QR Code para realizar o pagamento.</span>
                                                                </div>
                                                                <div className="mt-4">
                                                                    <h3 className="font-semibold mb-1">Contato do
                                                                        Financeiro</h3>
                                                                    <div className="text-sm text-gray-700">
                                                                        WhatsApp: <a href="https://wa.me/5599999999999"
                                                                                     target="_blank"
                                                                                     rel="noopener noreferrer"
                                                                                     className="text-blue-600 underline">(99)
                                                                        99999-9999</a><br/>
                                                                        E-mail: <a href="mailto:financeiro@empresa.com"
                                                                                   className="text-blue-600 underline">financeiro@empresa.com</a>
                                                                    </div>
                                                                    <div className="text-xs text-gray-500 mt-2">Envie o
                                                                        comprovante de pagamento para agilizar a
                                                                        liberação da reserva.
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default Reservations; 