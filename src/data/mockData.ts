
import { Vehicle, Customer, Employee, Reservation, Maintenance, Payment, Promotion, DailyRate, EmployeeRole, User } from '../types';

// Mock Vehicles
export const vehicles: Vehicle[] = [
  {
    license_plate: 'ABC-1234',
    model: 'Corolla',
    brand: 'Toyota',
    year: 2023,
    status: 'available',
    image_url: '/cars/corolla.jpg',
  },
  {
    license_plate: 'DEF-5678',
    model: 'Renegade',
    brand: 'Jeep',
    year: 2022,
    status: 'rented',
    image_url: '/cars/renegade.jpg',
  },
  {
    license_plate: 'GHI-9012',
    model: 'HB20',
    brand: 'Hyundai',
    year: 2021,
    status: 'maintenance',
    image_url: '/cars/hb20.jpg',
  },
  {
    license_plate: 'JKL-3456',
    model: 'Toro',
    brand: 'Fiat',
    year: 2022,
    status: 'available',
    image_url: '/cars/toro.jpg',
  },
];

// Mock Daily Rates
export const dailyRates: DailyRate[] = [
  {
    id: 1,
    datetime: '2023-06-01T00:00:00Z',
    amount: 150,
    vehicle_plate: 'ABC-1234'
  },
  {
    id: 2,
    datetime: '2023-06-01T00:00:00Z',
    amount: 180,
    vehicle_plate: 'DEF-5678'
  },
  {
    id: 3,
    datetime: '2023-06-01T00:00:00Z',
    amount: 120,
    vehicle_plate: 'GHI-9012'
  },
  {
    id: 4,
    datetime: '2023-06-01T00:00:00Z',
    amount: 200,
    vehicle_plate: 'JKL-3456'
  }
];

// Mock Customers and Employees (Users)
export const customers: Customer[] = [
  {
    cpf: '123.456.789-00',
    name: 'Maria Souza',
    email: 'maria@email.com',
    phone: '(11) 99999-1111',
    address: 'Rua das Flores, 123',
    password: 'senha123',
  },
  {
    cpf: '987.654.321-00',
    name: 'Carlos Mendes',
    email: 'carlos@email.com',
    phone: '(11) 99999-2222',
    address: 'Av. Principal, 456',
    password: 'senha123',
  },
  {
    cpf: '456.789.123-00',
    name: 'Ana Paula',
    email: 'ana@email.com',
    phone: '(11) 99999-3333',
    address: 'Rua das Palmeiras, 789',
    password: 'senha123',
  },
  {
    cpf: '321.654.987-00',
    name: 'Roberto Alves',
    email: 'roberto@email.com',
    phone: '(11) 99999-4444',
    address: 'Av. Central, 101',
    password: 'senha123',
  },
  {
    cpf: '654.321.987-00',
    name: 'João Silva',
    email: 'joao@email.com',
    phone: '(11) 99999-5555',
    address: 'Rua dos Pinheiros, 222',
    password: 'senha123',
  },
];

export const employees: Employee[] = [
  {
    cpf: '111.222.333-44',
    name: 'Admin Silva',
    email: 'admin@sigac.com',
    phone: '(11) 98888-1111',
    address: 'Av. Administração, 100',
    password: 'admin123',
    role: 'admin',
  },
  {
    cpf: '222.333.444-55',
    name: 'Atendente Santos',
    email: 'atendente@sigac.com',
    phone: '(11) 98888-2222',
    address: 'Rua do Atendimento, 200',
    password: 'atendente123',
    role: 'attendant',
  },
  {
    cpf: '333.444.555-66',
    name: 'Mecânico Pereira',
    email: 'mecanico@sigac.com',
    phone: '(11) 98888-3333',
    address: 'Av. da Manutenção, 300',
    password: 'mecanico123',
    role: 'maintenance',
  },
  {
    cpf: '444.555.666-77',
    name: 'Financeiro Costa',
    email: 'financeiro@sigac.com',
    phone: '(11) 98888-4444',
    address: 'Rua do Dinheiro, 400',
    password: 'financeiro123',
    role: 'financial',
  },
];

// Combine customers and employees for a complete user list
export const users: User[] = [...customers, ...employees];

// Mock Promotions
export const promotions: Promotion[] = [
  {
    code: 'SUMMER10',
    discount_percentage: 10,
    start_date: '2023-06-01',
    end_date: '2023-08-31',
    status: 'active',
  },
  {
    code: 'WELCOME20',
    discount_percentage: 20,
    start_date: '2023-01-01',
    end_date: '2023-12-31',
    status: 'active',
  },
  {
    code: 'HOLIDAY15',
    discount_percentage: 15,
    start_date: '2023-12-01',
    end_date: '2024-01-15',
    status: 'upcoming',
  },
];

// Mock Reservations
export const reservations: Reservation[] = [
  {
    id: 1,
    reservation_date: '2023-06-10',
    start_date: '2023-06-15',
    end_date: '2023-06-20',
    status: 'confirmed',
    amount: 750,
    customer_cpf: '123.456.789-00',
    vehicle_plate: 'ABC-1234',
  },
  {
    id: 2,
    reservation_date: '2023-06-05',
    start_date: '2023-06-12',
    end_date: '2023-06-18',
    status: 'confirmed',
    amount: 1080,
    customer_cpf: '987.654.321-00',
    vehicle_plate: 'DEF-5678',
  },
  {
    id: 3,
    reservation_date: '2023-06-01',
    start_date: '2023-06-10',
    end_date: '2023-06-15',
    status: 'completed',
    amount: 600,
    customer_cpf: '456.789.123-00',
    vehicle_plate: 'GHI-9012',
  },
  {
    id: 4,
    reservation_date: '2023-06-01',
    start_date: '2023-06-05',
    end_date: '2023-06-12',
    status: 'confirmed',
    amount: 1400,
    customer_cpf: '321.654.987-00',
    vehicle_plate: 'JKL-3456',
  },
  {
    id: 5,
    reservation_date: '2023-06-15',
    start_date: '2023-06-22',
    end_date: '2023-06-25',
    status: 'pending',
    amount: 450,
    customer_cpf: '654.321.987-00',
    vehicle_plate: 'ABC-1234',
    promotion_code: 'SUMMER10',
  },
];

// Mock Payments
export const payments: Payment[] = [
  {
    id: 1,
    payment_method: 'credit_card',
    payment_date: '2023-06-10',
    status: 'approved',
    amount: 750,
    reservation_id: 1,
  },
  {
    id: 2,
    payment_method: 'debit_card',
    payment_date: '2023-06-05',
    status: 'approved',
    amount: 1080,
    reservation_id: 2,
  },
  {
    id: 3,
    payment_method: 'cash',
    payment_date: '2023-06-16',
    status: 'approved',
    amount: 600,
    reservation_id: 3,
  },
  {
    id: 4,
    payment_method: 'pix',
    payment_date: '2023-06-05',
    status: 'approved',
    amount: 1400,
    reservation_id: 4,
  }
];

// Mock Maintenance Records
export const maintenances: Maintenance[] = [
  {
    id: 1,
    vehicle_plate: 'GHI-9012',
    type: 'preventive',
    description: 'Troca de óleo',
    scheduled_date: '2023-06-14',
    status: 'scheduled',
    cost: 0,
    employee_cpf: '333.444.555-66',
  },
  {
    id: 2,
    vehicle_plate: 'ABC-1234',
    type: 'preventive',
    description: 'Revisão de 10.000km',
    scheduled_date: '2023-06-25',
    status: 'scheduled',
    cost: 0,
    employee_cpf: '333.444.555-66',
  },
  {
    id: 3,
    vehicle_plate: 'JKL-3456',
    type: 'corrective',
    description: 'Substituição de bateria',
    scheduled_date: '2023-06-10',
    completed_date: '2023-06-10',
    status: 'completed',
    cost: 350,
    employee_cpf: '333.444.555-66',
  },
];

// Types for ActivityEvent and RevenueData (added for backward compatibility)
export type ActivityEvent = {
  id: string;
  type: 'vehicle' | 'reservation' | 'maintenance' | 'payment';
  title: string;
  description: string;
  timestamp: string;
};

export type RevenueData = {
  month: string;
  revenue: number;
};

export type SupportTicket = {
  id: string;
  customer_cpf: string;
  subject: string;
  description: string;
  createdAt: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
};

// Recent Activity Events
export const activityEvents: ActivityEvent[] = [
  {
    id: '1',
    type: 'vehicle',
    title: 'Novo veículo adicionado',
    description: 'Toyota Corolla 2023',
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
  },
  {
    id: '2',
    type: 'reservation',
    title: 'Nova reserva confirmada',
    description: 'Cliente: João Silva',
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
  },
  {
    id: '3',
    type: 'maintenance',
    title: 'Manutenção agendada',
    description: 'HB20 - Troca de óleo',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
  },
  {
    id: '4',
    type: 'payment',
    title: 'Pagamento recebido',
    description: 'R$ 1.250,00 - Reserva #4521',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24 hours ago
  },
];

// Monthly Revenue Data
export const revenueData: RevenueData[] = [
  { month: 'Jan', revenue: 32000 },
  { month: 'Fev', revenue: 28000 },
  { month: 'Mar', revenue: 35000 },
  { month: 'Abr', revenue: 38000 },
  { month: 'Mai', revenue: 40000 },
  { month: 'Jun', revenue: 42000 },
  { month: 'Jul', revenue: 45000 },
  { month: 'Ago', revenue: 42000 },
  { month: 'Set', revenue: 38000 },
  { month: 'Out', revenue: 41000 },
  { month: 'Nov', revenue: 45000 },
  { month: 'Dez', revenue: 48000 },
];

// Helper functions

// Helper function to get customer by CPF
export const getCustomerByCpf = (cpf: string): Customer | undefined => {
  return customers.find(customer => customer.cpf === cpf);
};

// Helper function to get vehicle by license plate
export const getVehicleByPlate = (plate: string): Vehicle | undefined => {
  return vehicles.find(vehicle => vehicle.license_plate === plate);
};

// Helper function to get employee by CPF
export const getEmployeeByCpf = (cpf: string): Employee | undefined => {
  return employees.find(employee => employee.cpf === cpf);
};

// Helper function to get user (customer or employee) by CPF
export const getUserByCpf = (cpf: string): User | undefined => {
  return users.find(user => user.cpf === cpf);
};

// Helper function to get reservation details
export const getReservationDetails = (reservationId: number) => {
  const reservation = reservations.find(r => r.id === reservationId);
  if (!reservation) return null;
  
  const vehicle = getVehicleByPlate(reservation.vehicle_plate);
  const customer = getCustomerByCpf(reservation.customer_cpf);
  
  return { reservation, vehicle, customer };
};

// Helper function to get daily rate for a vehicle
export const getDailyRateForVehicle = (plate: string): number => {
  const rate = dailyRates.find(rate => rate.vehicle_plate === plate);
  return rate ? rate.amount : 0;
};

// Helper function to format currency
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// Helper function to format date
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

// For backward compatibility - aliases
import { 
  convertCustomersToLegacyClients, 
  convertVehiclesToLegacy, 
  convertReservationsToLegacy,
  convertMaintenanceToLegacy,
  LegacyClient,
  LegacyVehicle,
  LegacyReservation,
  LegacyMaintenanceRecord
} from '../utils/dataAdapters';

// Export aliases for backward compatibility
export const clients = convertCustomersToLegacyClients(customers);
export const maintenanceRecords = convertMaintenanceToLegacy(maintenances);

// Export legacy types as types to fix TypeScript errors
export type { LegacyClient as Client };
export type { LegacyVehicle as Vehicle };
export type { LegacyReservation as Reservation };
export type { LegacyMaintenanceRecord as MaintenanceRecord };
