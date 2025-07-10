import React, {useEffect, useState} from 'react';
import {DailyRate} from '@/types';
import {
    Table, TableHeader, TableRow, TableHead,
    TableBody, TableCell
} from '@/components/ui/table';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Card, CardHeader, CardTitle, CardContent} from '@/components/ui/card';
import {Plus, Search} from 'lucide-react';
import {toast} from "sonner";
import {DailyRatesService} from '@/services/dailyRatesService';

const DailyRates: React.FC = () => {
    const [dailyRates, setDailyRates] = useState<DailyRate[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        vehiclePlate: '',
        dateTime: new Date().toISOString().slice(0, 10),
        amount: 0,
    });

    useEffect(() => {
        loadDailyRates();
    }, []);

    const loadDailyRates = async () => {
        try {
            const response = await DailyRatesService.getDailyRates();
            setDailyRates(response.data ?? []);
        } catch (err) {
            console.error('Erro ao buscar diárias:', err);
            toast.error('Erro ao buscar diárias.');
        }
    };

    const filteredRates = dailyRates.filter(rate =>
        rate.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'amount' ? Number(value) : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const now = new Date();
        const pad = (num: number) => num.toString().padStart(2, '0');

        const dateTimeNow = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

        const payload = {
            ...formData,
            dateTime: dateTimeNow,
        };

        try {
            await DailyRatesService.createDailyRate(payload);
            toast.success('Diária cadastrada com sucesso!');
            setShowForm(false);
            setFormData({
                vehiclePlate: '',
                dateTime: new Date().toISOString().slice(0, 16),
                amount: 0,
            });
            loadDailyRates();
        }catch (err: any) {
            console.error('Erro ao salvar diária:', err);

            const errorMessage =
                err?.response?.data?.message ||
                err?.message ||
                'Erro ao salvar diária.';

            toast.error(errorMessage);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Gerenciamento de Diárias</h1>
                <Button onClick={() => setShowForm(true)}>
                    <Plus className="mr-2 h-4 w-4"/> Nova Diária
                </Button>
            </div>

            {showForm && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Nova Diária</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="vehiclePlate" className="block mb-1 font-medium">
                                        Placa do Veículo <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        id="vehiclePlate"
                                        name="vehiclePlate"
                                        value={formData.vehiclePlate}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="amount" className="block mb-1 font-medium">
                                        Valor (R$) <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        id="amount"
                                        name="amount"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.amount}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowForm(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit">Salvar</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex items-center">
                            <CardTitle>Histórico de Diárias</CardTitle>
                        </div>
                        <div className="flex gap-2 w-full md:w-64">
                            <div className="relative w-full">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500"/>
                                <Input
                                    placeholder="Buscar por placa..."
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
                                    <TableHead>Data</TableHead>
                                    <TableHead>Placa</TableHead>
                                    <TableHead>Valor</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredRates.length > 0 ? (
                                    filteredRates.map((rate) => (
                                        <TableRow key={rate.id}>
                                            <TableCell>
                                                {new Date(rate.dateTime).toLocaleString('pt-BR', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    second: '2-digit',
                                                    hour12: false
                                                })}
                                            </TableCell>
                                            <TableCell>{rate.vehiclePlate}</TableCell>
                                            <TableCell>R$ {rate.amount.toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-4 text-gray-500">
                                            Nenhuma diária encontrada
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

export default DailyRates;
