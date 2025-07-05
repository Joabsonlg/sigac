
import { 
  Vehicle, 
  Customer, 
  Reservation, 
  Employee, 
  Maintenance,
  User
} from '@/types';
import { getCustomerByCpf, getVehicleByPlate } from '@/data/mockData';

// Legacy types for backward compatibility
export interface LegacyVehicle {
  id: string;
  model: string;
  brand: string;
  year: number;
  licensePlate: string;
  status: 'available' | 'rented' | 'maintenance';
  dailyRate: number;
  imageUrl?: string;
}

export interface LegacyClient {
  id: string;
  name: string;
  email: string;
  phone: string;
  document: string;
  address?: string;
}

export interface LegacyReservation {
  id: string;
  vehicleId: string;
  clientId: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  totalAmount: number;
  discount?: number;
  promoCode?: string;
}

export interface LegacyMaintenanceRecord {
  id: string;
  vehicleId: string;
  type: 'preventive' | 'corrective';
  description: string;
  scheduledDate: string;
  completedDate?: string;
  cost?: number;
  status: 'scheduled' | 'in_progress' | 'completed';
}

export interface LegacyUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'client' | 'attendant' | 'financial' | 'maintenance';
  avatar?: string;
  createdAt: string;
  isActive: boolean;
}

// Get daily rate for a vehicle
const getDailyRateForVehicle = (plate: string): number => {
  // This would ideally come from the DailyRate table
  // For now, we'll just use a random number between 100-200
  return Math.floor(Math.random() * 100) + 100;
};

// Convert Vehicle to LegacyVehicle
export const vehicleToLegacy = (vehicle: Vehicle): LegacyVehicle => {
  return {
    id: vehicle.license_plate,
    model: vehicle.model,
    brand: vehicle.brand,
    year: vehicle.year,
    licensePlate: vehicle.license_plate,
    status: vehicle.status as 'available' | 'rented' | 'maintenance',
    dailyRate: getDailyRateForVehicle(vehicle.license_plate),
    imageUrl: vehicle.image_url
  };
};

// Convert Customer to LegacyClient
export const customerToLegacyClient = (customer: Customer): LegacyClient => {
  return {
    id: customer.cpf,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    document: customer.cpf,
    address: customer.address
  };
};

// Convert Reservation to LegacyReservation
export const reservationToLegacy = (reservation: Reservation): LegacyReservation => {
  const discountAmount = reservation.promotion_code ? reservation.amount * 0.1 : 0; // Simplified discount calculation
  
  return {
    id: reservation.id.toString(),
    vehicleId: reservation.vehicle_plate,
    clientId: reservation.customer_cpf,
    startDate: reservation.start_date,
    endDate: reservation.end_date,
    status: reservation.status as 'pending' | 'confirmed' | 'cancelled' | 'completed',
    totalAmount: reservation.amount,
    discount: discountAmount,
    promoCode: reservation.promotion_code
  };
};

// Convert Legacy Reservation to new format
export const adaptLegacyReservationToNew = (legacyReservation: LegacyReservation): Reservation => {
  return {
    id: legacyReservation.id,
    reservation_date: new Date().toISOString().split('T')[0], // Default to today
    start_date: legacyReservation.startDate,
    end_date: legacyReservation.endDate,
    status: legacyReservation.status,
    amount: legacyReservation.totalAmount,
    customer_cpf: legacyReservation.clientId,
    vehicle_plate: legacyReservation.vehicleId,
    promotion_code: legacyReservation.promoCode,
    
    // Keep legacy fields for compatibility
    clientId: legacyReservation.clientId,
    vehicleId: legacyReservation.vehicleId,
    startDate: legacyReservation.startDate,
    endDate: legacyReservation.endDate,
    totalAmount: legacyReservation.totalAmount,
    discount: legacyReservation.discount,
    promoCode: legacyReservation.promoCode
  };
};

// These are the adapter function aliases needed for compatibility.ts
export const adaptVehicleToLegacy = vehicleToLegacy;
export const adaptReservationToLegacy = reservationToLegacy;
export const adaptCustomerToClient = customerToLegacyClient;

// Convert Employee to LegacyUser
export const employeeToLegacyUser = (employee: Employee): LegacyUser => {
  return {
    id: employee.cpf,
    name: employee.name,
    email: employee.email,
    role: employee.role as 'admin' | 'attendant' | 'financial' | 'maintenance',
    createdAt: new Date().toISOString(),
    isActive: true
  };
};

// Convert Customer to LegacyUser
export const customerToLegacyUser = (customer: Customer): LegacyUser => {
  return {
    id: customer.cpf,
    name: customer.name,
    email: customer.email,
    role: 'client',
    createdAt: new Date().toISOString(),
    isActive: true
  };
};

// Convert User to LegacyUser
export const userToLegacyUser = (user: User): LegacyUser => {
  if ('role' in user) {
    return employeeToLegacyUser(user as Employee);
  } else {
    return customerToLegacyUser(user as Customer);
  }
};

// Convert Maintenance to LegacyMaintenanceRecord
export const maintenanceToLegacy = (maintenance: Maintenance): LegacyMaintenanceRecord => {
  return {
    id: maintenance.id.toString(),
    vehicleId: maintenance.vehicle_plate,
    type: maintenance.type as 'preventive' | 'corrective',
    description: maintenance.description,
    scheduledDate: maintenance.scheduled_date,
    completedDate: maintenance.completed_date,
    cost: maintenance.cost,
    status: maintenance.status as 'scheduled' | 'in_progress' | 'completed'
  };
};

// Batch conversions
export const convertVehiclesToLegacy = (vehicles: Vehicle[]): LegacyVehicle[] => {
  return vehicles.map(vehicle => vehicleToLegacy(vehicle));
};

export const convertCustomersToLegacyClients = (customers: Customer[]): LegacyClient[] => {
  return customers.map(customer => customerToLegacyClient(customer));
};

export const convertUsersToLegacy = (users: User[]): LegacyUser[] => {
  return users.map(user => userToLegacyUser(user));
};

export const convertReservationsToLegacy = (reservations: Reservation[]): LegacyReservation[] => {
  return reservations.map(reservation => reservationToLegacy(reservation));
};

export const convertMaintenanceToLegacy = (maintenances: Maintenance[]): LegacyMaintenanceRecord[] => {
  return maintenances.map(maintenance => maintenanceToLegacy(maintenance));
};
