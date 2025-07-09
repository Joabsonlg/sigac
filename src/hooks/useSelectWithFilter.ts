import { useState, useEffect, useMemo } from 'react';
import { Customer, Employee, Vehicle } from '@/types';
import ClientsService from '@/services/clientsService';
import UsersService from '@/services/usersService';
import { VehiclesService } from '@/services/vehiclesService';

export interface SelectOption {
  value: string;
  label: string;
  cpf: string;
  name: string;
}

export const useSelectWithFilter = () => {
  const [clients, setClients] = useState<Customer[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingVehicles, setLoadingVehicles] = useState(false);

  // Load clients
  const loadClients = async () => {
    try {
      setLoadingClients(true);
      const response = await ClientsService.getAllClients();
      const clientsData = response.data?.content || response.data || [];
      setClients(Array.isArray(clientsData) ? clientsData : []);
    } catch (error) {
      console.error('Error loading clients:', error);
      setClients([]);
    } finally {
      setLoadingClients(false);
    }
  };

  // Load employees
  const loadEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const response = await UsersService.getEmployees();
      const employeesData = response.data?.content || response.data || [];
      setEmployees(Array.isArray(employeesData) ? employeesData : []);
    } catch (error) {
      console.error('Error loading employees:', error);
      setEmployees([]);
    } finally {
      setLoadingEmployees(false);
    }
  };

  // Load vehicles
  const loadVehicles = async () => {
    try {
      setLoadingVehicles(true);
      const response = await VehiclesService.getVehicles();
      const vehiclesData = response.data?.content || response.data || [];
      // Only load available vehicles for reservation
      const availableVehicles = Array.isArray(vehiclesData) 
        ? vehiclesData.filter(vehicle => vehicle.status === 'DISPONIVEL')
        : [];
      setVehicles(availableVehicles);
    } catch (error) {
      console.error('Error loading vehicles:', error);
      setVehicles([]);
    } finally {
      setLoadingVehicles(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadClients();
    loadEmployees();
    loadVehicles();
  }, []);

  // Convert clients to select options
  const clientOptions = useMemo(() => {
    return clients.map(client => ({
      value: client.cpf,
      label: `${client.name} - ${client.cpf}`,
      cpf: client.cpf,
      name: client.name
    }));
  }, [clients]);

  // Convert employees to select options
  const employeeOptions = useMemo(() => {
    return employees.map(employee => ({
      value: employee.cpf,
      label: `${employee.name} - ${employee.cpf}`,
      cpf: employee.cpf,
      name: employee.name
    }));
  }, [employees]);

  // Convert vehicles to select options
  const vehicleOptions = useMemo(() => {
    return vehicles.map(vehicle => ({
      value: vehicle.plate,
      label: `${vehicle.brand} ${vehicle.model} - ${vehicle.plate}`,
      cpf: vehicle.plate, // Using plate as identifier
      name: `${vehicle.brand} ${vehicle.model} (${vehicle.year})`
    }));
  }, [vehicles]);

  return {
    clientOptions,
    employeeOptions,
    vehicleOptions,
    loadingClients,
    loadingEmployees,
    loadingVehicles,
    reloadClients: loadClients,
    reloadEmployees: loadEmployees,
    reloadVehicles: loadVehicles
  };
};

export default useSelectWithFilter;
