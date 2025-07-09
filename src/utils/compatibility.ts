
import { 
  vehicles, 
  customers, 
  reservations, 
  maintenances, 
  clients,
  maintenanceRecords 
} from '@/data/mockData';

import { 
  Vehicle, 
  Customer, 
  Reservation, 
  Maintenance, 
  Client, 
  MaintenanceRecord 
} from '@/types';

import {
  vehicleToLegacy,
  reservationToLegacy,
  adaptLegacyReservationToNew,
  customerToLegacyClient
} from './dataAdapters';

// Convert between old and new models
export const getVehicleLegacyId = (vehicle: Vehicle): string => {
  return vehicle.plate;
};

export const getClientLegacyId = (customer: Customer): string => {
  return customer.cpf;
};

export const findVehicleById = (id: string): Vehicle | undefined => {
  return vehicles.find(v => v.plate);
};

export const findClientById = (id: string): Client | undefined => {
  return clients.find(c => c.id === id);
};

export const findReservationById = (id: string | number): Reservation | undefined => {
  if (typeof id === 'string') {
    return reservations.find(r => r.id.toString() === id);
  }
  return reservations.find(r => r.id === id);
};

export const findMaintenanceById = (id: string): MaintenanceRecord | undefined => {
  return maintenanceRecords.find(m => m.id === id);
};

// Convert clientId to customer_cpf
export const clientIdToCustomerCpf = (clientId: string): string => {
  return clientId; // In our implementation, clientId is the CPF
};

// Convert vehicleId to vehicle_plate
export const vehicleIdToVehiclePlate = (vehicleId: string): string => {
  return vehicleId; // In our implementation, vehicleId is the license plate
};

// New helper functions for data model mapping
export const ensureCompatibilityFields = () => {
  // Add compatibility fields to vehicles
  for (const vehicle of vehicles) {
    if (!vehicle.plate) vehicle.plate = vehicle.plate;
    if (!vehicle.dailyRate) vehicle.dailyRate = 100; // Default value
    if (!vehicle.imageUrl) vehicle.imageUrl = vehicle.imageUrl;
  }
  
  // Add compatibility fields to reservations
  for (const reservation of reservations) {
    if (!reservation.clientId) reservation.clientId = reservation.customer_cpf;
    if (!reservation.vehicleId) reservation.vehicleId = reservation.vehicle_plate;
    if (!reservation.startDate) reservation.startDate = reservation.start_date;
    if (!reservation.endDate) reservation.endDate = reservation.end_date;
    if (!reservation.totalAmount) reservation.totalAmount = reservation.amount;
    if (!reservation.promoCode) reservation.promoCode = reservation.promotion_code;
    // Default value for discount if not present
    if (reservation.discount === undefined) reservation.discount = 0;
    
    // Ensure that id is available as both string and number
    if (typeof reservation.id === 'number') {
      const idStr = reservation.id.toString();
      reservation.id = idStr;
    }
  }
};

// Call this function to ensure compatibility fields are set
ensureCompatibilityFields();
