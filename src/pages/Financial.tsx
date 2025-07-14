import React, {useEffect, useState} from 'react';
import {Promotion, PromotionCreateData, PromotionUpdateData} from '@/types';
import {Payment, PaymentsService} from '@/services/paymentsService';
import {PromotionsService} from '@/services/promotionsService';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Label} from '@/components/ui/label';
import {Badge} from '@/components/ui/badge';
import {useToast} from '@/hooks/use-toast';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Tabs, TabsContent, TabsList, TabsTrigger,} from "@/components/ui/tabs";
import {Check, Edit, Loader2, Pause, Percent, Play, Plus, Search, Trash2, X} from 'lucide-react';

const Financial: React.FC = () => {
    const [promotionsList, setPromotionsList] = useState<Promotion[]>([]);
    const [paymentsList, setPaymentsList] = useState<Payment[]>([]);
    const [loadingPayments, setLoadingPayments] = useState(true);
    // Carrega pagamentos ao abrir a aba
    useEffect(() => {
        PaymentsService.getPayments(0, 20)
            .then(data => {
                // Suporta diferentes formatos de resposta
                let payments: Payment[] = [];
                if (Array.isArray(data)) {
                    payments = data;
                } else if (data?.content && Array.isArray(data.content)) {
                    payments = data.content;
                } else if (data?.data && Array.isArray(data.data)) {
                    payments = data.data;
                } else if (data?.data?.content && Array.isArray(data.data.content)) {
                    payments = data.data.content;
                }
                setPaymentsList(payments);
                setLoadingPayments(false);
            })
            .catch(() => setLoadingPayments(false));
    }, []);
    // Utilitários para exibir status e método
    const [updatingPaymentId, setUpdatingPaymentId] = useState<number | null>(null);

    // Atualiza status do pagamento
    const handlePaymentStatusChange = async (payment: Payment, newStatus: Payment['status']) => {
        if (payment.status === newStatus) return;
        setUpdatingPaymentId(payment.id);
        try {
            await PaymentsService.updatePaymentStatus(payment.id, newStatus);
            toast({
                title: 'Sucesso',
                description: 'Status do pagamento atualizado!',
                variant: 'default'
            });
            // Atualiza lista
            PaymentsService.getPayments(0, 20).then(data => {
                let payments: Payment[] = [];
                if (Array.isArray(data)) {
                    payments = data;
                } else if (data?.content && Array.isArray(data.content)) {
                    payments = data.content;
                } else if (data?.data && Array.isArray(data.data)) {
                    payments = data.data;
                } else if (data?.data?.content && Array.isArray(data.data.content)) {
                    payments = data.data.content;
                }
                setPaymentsList(payments);
            });
        } catch (error: any) {
            toast({
                title: 'Erro',
                description: error?.response?.data?.message || 'Erro ao atualizar status do pagamento.',
                variant: 'destructive'
            });
        } finally {
            setUpdatingPaymentId(null);
        }
    };
    // Formata data/hora igual ao Reservations (array ou string)
    const formatDateTime = (date: any) => {
        if (!date) return '-';
        // Se vier array [ano, mes, dia, hora, min, seg, nanossegundos]
        if (Array.isArray(date) && date.length >= 3) {
            try {
                const [year, month, day, hour = 0, minute = 0, second = 0, nanos = 0] = date;
                // nanossegundos para milissegundos
                const ms = Math.floor(nanos / 1_000_000);
                const d = new Date(year, month - 1, day, hour, minute, second, ms);
                if (isNaN(d.getTime())) return 'Data inválida';
                return d.toLocaleString('pt-BR', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
                });
            } catch {
                return 'Data inválida';
            }
        }
        // Se vier string
        if (typeof date === 'string') {
            try {
                const d = new Date(date);
                if (isNaN(d.getTime())) return 'Data inválida';
                return d.toLocaleString('pt-BR', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
                });
            } catch {
                return 'Data inválida';
            }
        }
        return 'Data inválida';
    };

    const getPaymentStatusBadge = (status: Payment['status']) => {
        switch (status) {
            case 'PAID':
                return <Badge className="bg-green-100 text-green-800 border-green-200">Pago</Badge>;
            case 'PENDING':
                return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pendente</Badge>;
            case 'CANCELED':
                return <Badge className="bg-red-100 text-red-800 border-red-200">Cancelado</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const getPaymentMethodLabel = (method: Payment['paymentMethod']) => {
        switch (method) {
            case 'CREDIT_CARD':
                return 'Cartão de Crédito';
            case 'DEBIT_CARD':
                return 'Cartão de Débito';
            case 'PIX':
                return 'Pix';
            case 'BANK_TRANSFER':
                return 'Transferência Bancária';
            default:
                return method;
        }
    };
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ACTIVE' | 'INACTIVE' | 'SCHEDULED' | 'all'>('all');
    const [submitting, setSubmitting] = useState(false);
    const [searching, setSearching] = useState(false);
    const {toast} = useToast();

    // Form state for new/edit promotion
    const [formData, setFormData] = useState<PromotionCreateData>({
        discountPercentage: 0,
        startDate: '',
        endDate: '',
    });

    // Load promotions on component mount
    useEffect(() => {
        loadPromotions();
    }, []);

    // Reload promotions when filters change (with debounce for search)
    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            loadPromotions();
        }, searchTerm ? 500 : 0); // 500ms debounce for search, immediate for other filters

        return () => clearTimeout(debounceTimer);
    }, [searchTerm, statusFilter]);

    const loadPromotions = async () => {
        try {
            // Set different loading states
            if (searchTerm || statusFilter !== 'all') {
                setSearching(true);
            } else {
                setLoading(true);
            }

            // Use the service method with filters
            const response = await PromotionsService.getPromotions(
                0, // page
                100, // size - load more items to avoid pagination issues for now
                statusFilter !== 'all' ? statusFilter : undefined
            );

            // Extract promotions from API response structure
            let promotions = [];

            if (Array.isArray(response)) {
                promotions = response;
            } else if (response && typeof response === 'object') {
                if (response.content && Array.isArray(response.content)) {
                    promotions = response.content;
                } else if (response.data && Array.isArray(response.data)) {
                    promotions = response.data;
                } else if (response.data && response.data.content && Array.isArray(response.data.content)) {
                    promotions = response.data.content;
                }
            }

            setPromotionsList(Array.isArray(promotions) ? promotions : []);
        } catch (error) {
            console.error('Error loading promotions:', error);
            toast({
                title: "Erro",
                description: "Não foi possível carregar as promoções.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
            setSearching(false);
        }
    };

    const resetForm = () => {
        setFormData({
            discountPercentage: 0,
            startDate: '',
            endDate: '',
        });
        setEditingPromotion(null);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'discountPercentage' ? Number(value) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate required fields
        if (!formData.startDate || !formData.endDate || formData.discountPercentage <= 0) {
            toast({
                title: "Erro",
                description: "Por favor, preencha todos os campos obrigatórios.",
                variant: "destructive"
            });
            return;
        }

        // Validate date range
        const startDate = new Date(formData.startDate);
        const endDate = new Date(formData.endDate);

        if (startDate >= endDate) {
            toast({
                title: "Erro",
                description: "A data de término deve ser posterior à data de início.",
                variant: "destructive"
            });
            return;
        }

        // Validate discount percentage
        if (formData.discountPercentage < 1 || formData.discountPercentage > 100) {
            toast({
                title: "Erro",
                description: "O percentual de desconto deve estar entre 1% e 100%.",
                variant: "destructive"
            });
            return;
        }

        try {
            setSubmitting(true);

            if (editingPromotion) {
                // Update existing promotion
                const updateData: PromotionUpdateData = {
                    discountPercentage: formData.discountPercentage,
                    startDate: formData.startDate,
                    endDate: formData.endDate,
                };

                await PromotionsService.updatePromotion(editingPromotion.code, updateData);

                toast({
                    title: "Sucesso",
                    description: "Promoção atualizada com sucesso!",
                    variant: "default"
                });
            } else {
                // Create new promotion
                await PromotionsService.createPromotion(formData);

                toast({
                    title: "Sucesso",
                    description: "Promoção criada com sucesso!",
                    variant: "default"
                });
            }

            // Reset form and reload data
            resetForm();
            setShowForm(false);
            loadPromotions();

        } catch (error: any) {
            console.error('Error saving promotion:', error);
            toast({
                title: "Erro",
                description: error.response?.data?.message || "Erro ao salvar promoção.",
                variant: "destructive"
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (promotion: Promotion) => {
        setEditingPromotion(promotion);

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
            discountPercentage: promotion.discountPercentage,
            startDate: convertArrayToDatetimeLocal(promotion.startDate),
            endDate: convertArrayToDatetimeLocal(promotion.endDate),
        });
        setShowForm(true);
    };

    const handleDelete = async (code: number) => {
        if (!window.confirm('Tem certeza que deseja excluir esta promoção?')) {
            return;
        }

        try {
            await PromotionsService.deletePromotion(code);

            toast({
                title: "Sucesso",
                description: "Promoção excluída com sucesso!",
                variant: "default"
            });

            loadPromotions();
        } catch (error: any) {
            console.error('Error deleting promotion:', error);
            toast({
                title: "Erro",
                description: error.response?.data?.message || "Erro ao excluir promoção.",
                variant: "destructive"
            });
        }
    };

    const handleStatusChange = async (promotion: Promotion, newStatus: 'ACTIVE' | 'INACTIVE') => {
        try {
            if (newStatus === 'ACTIVE') {
                await PromotionsService.activatePromotion(promotion.code);
            } else {
                await PromotionsService.deactivatePromotion(promotion.code);
            }

            toast({
                title: "Sucesso",
                description: "Status da promoção atualizado com sucesso!",
                variant: "default"
            });

            loadPromotions();
        } catch (error: any) {
            console.error('Error updating promotion status:', error);
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

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'INACTIVE':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'SCHEDULED':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'Ativo';
            case 'INACTIVE':
                return 'Inativo';
            case 'SCHEDULED':
                return 'Agendado';
            default:
                return 'Desconhecido';
        }
    };

    // Filter promotions based on search term (local filtering since API doesn't have search)
    const filteredPromotions = promotionsList.filter(promo => {
        if (searchTerm === '') return true;

        const searchLower = searchTerm.toLowerCase();
        const startDateFormatted = formatDate(promo.startDate).toLowerCase();
        const endDateFormatted = formatDate(promo.endDate).toLowerCase();

        return (
            promo.code.toString().includes(searchTerm) ||
            promo.discountPercentage.toString().includes(searchTerm) ||
            startDateFormatted.includes(searchLower) ||
            endDateFormatted.includes(searchLower) ||
            getStatusLabel(promo.status).toLowerCase().includes(searchLower)
        );
    });

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
                <h1 className="text-2xl font-bold">Módulo Financeiro</h1>
            </div>

            <Tabs defaultValue="payments">
                <TabsList className="mb-4">
                    <TabsTrigger value="payments">Pagamentos</TabsTrigger>
                    <TabsTrigger value="promos">Promoções e Descontos</TabsTrigger>
                </TabsList>

                <TabsContent value="payments">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold">Pagamentos</h2>
                    </div>
                    <Card>
                        <CardHeader>
                            <div className="flex items-center">
                                <CardTitle>Lista de Pagamentos</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>ID</TableHead>
                                            <TableHead>Reserva</TableHead>
                                            <TableHead>Data</TableHead>
                                            <TableHead>Método</TableHead>
                                            <TableHead>Valor</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loadingPayments ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-8">
                                                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2"/>
                                                    <p>Carregando pagamentos...</p>
                                                </TableCell>
                                            </TableRow>
                                        ) : paymentsList.length > 0 ? (
                                            paymentsList.map(payment => (
                                                <TableRow key={payment.id}>
                                                    <TableCell>#{payment.id}</TableCell>
                                                    <TableCell>{payment.reservationId}</TableCell>
                                                    <TableCell>{formatDateTime(payment.paymentDate)}</TableCell>
                                                    <TableCell>{getPaymentMethodLabel(payment.paymentMethod)}</TableCell>
                                                    <TableCell>{new Intl.NumberFormat('pt-BR', {
                                                        style: 'currency',
                                                        currency: 'BRL'
                                                    }).format(payment.amount)}</TableCell>
                                                    <TableCell>
                                                        <Select
                                                            value={payment.status}
                                                            onValueChange={(value) => handlePaymentStatusChange(payment, value as Payment['status'])}
                                                            disabled={updatingPaymentId === payment.id}
                                                        >
                                                            <SelectTrigger className="w-[130px]">
                                                                {getPaymentStatusBadge(payment.status)}
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="PENDING">Pendente</SelectItem>
                                                                <SelectItem value="PAID">Pago</SelectItem>
                                                                <SelectItem value="CANCELED">Cancelado</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                                    <p>Nenhum pagamento encontrado.</p>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="promos">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold">Gerenciamento de Promoções</h2>
                        <Button
                            onClick={() => {
                                resetForm();
                                setShowForm(!showForm);
                            }}
                            disabled={loading}
                        >
                            <Plus className="mr-2 h-4 w-4"/> Nova Promoção
                        </Button>
                    </div>

                    {showForm && (
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>{editingPromotion ? 'Editar Promoção' : 'Nova Promoção'}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="discountPercentage">Percentual de Desconto (%)</Label>
                                            <div className="relative">
                                                <Input
                                                    id="discountPercentage"
                                                    name="discountPercentage"
                                                    type="number"
                                                    min="1"
                                                    max="100"
                                                    step="1"
                                                    value={formData.discountPercentage}
                                                    onChange={handleInputChange}
                                                    required
                                                    placeholder="Ex: 15"
                                                    className="pr-8"
                                                />
                                                <Percent className="absolute right-2 top-2.5 h-4 w-4 text-gray-500"/>
                                            </div>
                                        </div>
                                        <div></div>
                                        <div>
                                            <Label htmlFor="startDate">Data de Início</Label>
                                            <Input
                                                id="startDate"
                                                name="startDate"
                                                type="datetime-local"
                                                value={formData.startDate}
                                                onChange={handleInputChange}
                                                min={new Date().toISOString().slice(0, 16)}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="endDate">Data de Término</Label>
                                            <Input
                                                id="endDate"
                                                name="endDate"
                                                type="datetime-local"
                                                value={formData.endDate}
                                                onChange={handleInputChange}
                                                min={formData.startDate || new Date().toISOString().slice(0, 16)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-2 pt-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleCancelForm}
                                        >
                                            <X className="mr-2 h-4 w-4"/>
                                            Cancelar
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={submitting}
                                        >
                                            {submitting ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                            ) : (
                                                <Check className="mr-2 h-4 w-4"/>
                                            )}
                                            {editingPromotion ? 'Atualizar' : 'Salvar'}
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
                                    <Percent className="mr-2 text-blue-600"/>
                                    <CardTitle>Promoções</CardTitle>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Código</TableHead>
                                            <TableHead>Desconto</TableHead>
                                            <TableHead>Período</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {searching ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-8">
                                                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2"/>
                                                    <p>Buscando promoções...</p>
                                                </TableCell>
                                            </TableRow>
                                        ) : filteredPromotions.length > 0 ? (
                                            filteredPromotions.map((promotion) => (
                                                <TableRow key={promotion.code}>
                                                    <TableCell>
                                                        <div className="font-medium">#{promotion.code}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span
                                                            className="font-medium">{promotion.discountPercentage}%</span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-sm space-y-1">
                                                            <div className="font-medium text-gray-700">
                                                                {formatDate(promotion.startDate)}
                                                            </div>
                                                            <div className="text-gray-500">
                                                                até {formatDate(promotion.endDate)}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant="outline"
                                                            className={getStatusBadgeColor(promotion.status)}
                                                        >
                                                            {getStatusLabel(promotion.status)}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            {promotion.status === 'ACTIVE' ? (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                                                                    onClick={() => handleStatusChange(promotion, 'INACTIVE')}
                                                                    title="Desativar promoção"
                                                                >
                                                                    <Pause className="h-4 w-4"/>
                                                                </Button>
                                                            ) : (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="text-green-600 border-green-200 hover:bg-green-50"
                                                                    onClick={() => handleStatusChange(promotion, 'ACTIVE')}
                                                                    title="Ativar promoção"
                                                                >
                                                                    <Play className="h-4 w-4"/>
                                                                </Button>
                                                            )}
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleEdit(promotion)}
                                                                title="Editar promoção"
                                                            >
                                                                <Edit className="h-4 w-4"/>
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="text-red-500 border-red-200 hover:bg-red-50"
                                                                onClick={() => handleDelete(promotion.code)}
                                                                title="Excluir promoção"
                                                            >
                                                                <Trash2 className="h-4 w-4"/>
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                                    <div className="flex flex-col items-center">
                                                        <Percent className="h-8 w-8 text-gray-400 mb-2"/>
                                                        <p className="text-sm">
                                                            {searchTerm || statusFilter !== 'all'
                                                                ? 'Nenhuma promoção encontrada com os filtros aplicados'
                                                                : 'Nenhuma promoção cadastrada'}
                                                        </p>
                                                        {(searchTerm || statusFilter !== 'all') && (
                                                            <p className="text-xs text-gray-400 mt-1">
                                                                Tente ajustar os filtros ou criar uma nova promoção
                                                            </p>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Financial;
