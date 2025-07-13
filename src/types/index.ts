
// Entity Types based on ER Diagram

export type User = {
  cpf: string;
  name: string;
  email: string;
  password?: string; // Optional for responses (security)
  address: string;
  phone: string;
  
  // Legacy compatibility properties
  id?: string;
  createdAt?: string;
  isActive?: boolean;
  role?: string; // For compatibility with old code
};

export type Customer = User & {
  // Customer specific fields can be added here
};

export type Employee = {
  cpf: string;
  name: string;
  email: string;
  address: string;
  phone: string;
  role: string; // Required for employees
  
  // Optional fields for compatibility
  id?: string;
  password?: string;
  createdAt?: string;
  isActive?: boolean;
};

// API Response types
export type ApiResponse<T> = {
  timestamp: string;
  message: string;
  data: T;
};

export type PaginatedResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

// Employee roles according to API documentation
export type EmployeeRole = 'ADMIN' | 'MANAGER' | 'ATTENDANT';

export type Promotion = {
  code: number;
  discountPercentage: number;
  status: 'SCHEDULED' | 'ACTIVE' | 'INACTIVE';
  startDate: number[]; // API returns date as array [year, month, day, hour, minute, second]
  endDate: number[]; // API returns date as array [year, month, day, hour, minute, second]
};

export type PromotionCreateData = {
  discountPercentage: number;
  startDate: string;
  endDate: string;
};

export type PromotionUpdateData = {
  discountPercentage?: number;
  status?: 'SCHEDULED' | 'ACTIVE' | 'INACTIVE';
  startDate?: string;
  endDate?: string;
};

export type Reservation = {
  id: number | string; // Allow both number and string types for compatibility
  reservation_date: string;
  start_date: string;
  end_date: string;
  status: string;
  amount: number;
  customer_cpf: string;  // Reference to Customer
  vehicle_plate: string; // Reference to Vehicle
  promotion_code?: string; // Optional reference to Promotion
  
  // Legacy compatibility properties
  clientId?: string;
  vehiclePlate?: string;
  startDate?: string;
  endDate?: string;
  totalAmount?: number;
  discount?: number;
  promoCode?: string;
};

// New reservation type following API structure
export type ReservationData = {
  id: number;
  startDate: number[]; // API returns date as array [year, month, day, hour, minute, second]
  endDate: number[]; // API returns date as array [year, month, day, hour, minute, second]
  reservationDate: number[]; // API returns date as array [year, month, day, hour, minute, second]
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  promotionCode?: number;
  clientUserCpf: string;
  clientName: string;
  employeeUserCpf: string;
  employeeName: string;
  vehiclePlate: string;
  vehicleModel: string;
  vehicleBrand: string;
};

export type Payment = {
  id: number;
  payment_method: string;
  payment_date: string;
  status: string;
  amount: number;
  reservation_id: number; // Reference to Reservation
};

export interface Vehicle {
  plate: string;
  brand: string;
  model: string;
  year: number;
  status: 'DISPONIVEL' | 'ALUGADO' | 'MANUTENCAO' | 'INDISPONIVEL';
  imageUrl: string;
  dailyRate?: number;
}

export interface VehiclePage {
  content: Vehicle[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface MaintenancePage {
  content: Vehicle[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export type Maintenance = {
  id: number;
  description: string;
  scheduled_date: string;
  completed_date?: string;
  cost: number;
  type: 'PREVENTIVA' | 'CORRETIVA' | 'PREDITIVA';
  status: 'AGENDADA' | 'CONCLUIDA' | 'CANCELADA' | 'EM_ANDAMENTO';
  vehicle_plate: string;
  employee_cpf: string;
};

export type DailyRate = {
  id: number;
  dateTime: string;
  amount: number;
  vehiclePlate: string; // Reference to Vehicle
};

// Legacy role type for Employee (keeping for backward compatibility)
export type LegacyEmployeeRole = 'admin' | 'attendant' | 'maintenance' | 'financial';

// For backward compatibility with existing components
export type UserRole = 'admin' | 'client' | 'attendant' | 'maintenance' | 'financial';

// Import compatibility types for legacy components
import type {
  LegacyClient as Client,
  LegacyVehicle as LegacyVehicleType,
  LegacyReservation as LegacyReservationType,
  LegacyMaintenanceRecord as MaintenanceRecord
} from '../utils/dataAdapters';

// Re-export with appropriate type modifiers
export type { Client, LegacyVehicleType, LegacyReservationType, MaintenanceRecord };
