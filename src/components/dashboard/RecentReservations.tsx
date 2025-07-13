import React, { useEffect, useState } from 'react';
import { Reservation } from "@/types";
import StatusBadge from '../common/StatusBadge';
import ClientsService from "@/services/clientsService.ts";

type ValidStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'maintenance' |
    'open' | 'available' | 'rented' | 'scheduled' | 'in_progress' | 'resolved' | 'closed';

interface RecentReservationsProps {
    reservas?: Reservation[];
}

const RecentReservations: React.FC<RecentReservationsProps> = ({ reservas = [] }) => {
    const [clientNames, setClientNames] = useState<Record<string, string>>({});

    useEffect(() => {
        const fetchClientNames = async () => {
            for (const res of reservas) {
                const rawCpf = res.clientUserCpf;
                const cpf = rawCpf.replace(/\D/g, '');

                // Evita chamadas duplicadas
                if (cpf && !(cpf in clientNames)) {
                    try {
                        const response = await ClientsService.getClientByCpf(cpf);
                        const clientName = response.data?.name ?? 'Nome não disponível';

                        // ATUALIZA SEM PERDER OS VALORES JÁ EXISTENTES
                        setClientNames(prev => ({
                            ...prev,
                            [cpf]: clientName,
                        }));
                    } catch (error) {
                        console.error(`Erro ao buscar cliente ${cpf}:`, error);
                        setClientNames(prev => ({
                            ...prev,
                            [cpf]: 'Erro ao carregar',
                        }));
                    }
                }
            }
        };

        if (reservas.length > 0) {
            fetchClientNames();
        }
    }, [reservas, clientNames]);

    function formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    }

    const recentReservations = reservas.slice(0, 4);

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                <tr>
                    <th className="px-4 py-3">Cliente</th>
                    <th className="px-4 py-3">Veículo</th>
                    <th className="px-4 py-3">Período</th>
                    <th className="px-4 py-3 text-center">Status</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                {recentReservations.map((reservation) => {
                    const cpf = reservation.clientUserCpf.replace(/\D/g, '');
                    const customerName = clientNames[cpf] ?? 'Carregando...';
                    const vehicle = reservation.vehiclePlate;
                    const startDateFormatted = formatDate(reservation.startDate);
                    const endDateFormatted = formatDate(reservation.endDate);

                    return (
                        <tr key={reservation.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4 font-medium text-gray-900">{customerName}</td>
                            <td className="px-4 py-4 text-gray-700">{vehicle}</td>
                            <td className="px-4 py-4 text-gray-700">{startDateFormatted} - {endDateFormatted}</td>
                            <td className="px-4 py-4 text-center">
                                <StatusBadge status={reservation.status as ValidStatus} />
                            </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
        </div>
    );
};

export default RecentReservations;
