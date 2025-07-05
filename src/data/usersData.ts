
import { User, Employee, Customer } from '../types';
import { employees, customers } from './mockData';

// Combined list of users (employees + customers)
const allUsers: User[] = [...employees, ...customers];

// Get a user by CPF for authentication
export const getUserByCpf = (cpf: string): User | undefined => {
  console.log(`Looking for user with CPF: ${cpf}`);
  const user = allUsers.find(user => user.cpf === cpf);
  console.log(`Found user:`, user ? user.name : 'Not found');
  return user;
};

// Authenticate a user with CPF and password
export const authenticateUser = (cpf: string, password: string): User | null => {
  const user = getUserByCpf(cpf);
  if (user && user.password === password) {
    // Return user without password
    const { password: _, ...secureUser } = user;
    return secureUser as User;
  }
  return null;
};

// Find user by email and password (for Login.tsx compatibility)
export const findUserByCredentials = (email: string, password: string): User | null => {
  console.log(`Attempting login with email: ${email}`);
  console.log(`Available users:`, allUsers.map(u => ({ email: u.email, name: u.name })));
  
  const user = allUsers.find(user => {
    console.log(`Checking user: ${user.email} === ${email} && password match`);
    return user.email === email && user.password === password;
  });
  
  if (user) {
    console.log(`User found: ${user.name}, role: ${user.role}`);
    // Return user without password
    const { password: _, ...secureUser } = user;
    return secureUser as User;
  }
  
  console.log('No matching user found');
  return null;
};

// Get all employees
export const getAllEmployees = (): Employee[] => {
  return employees;
};

// Get all customers
export const getAllCustomers = (): Customer[] => {
  return customers;
};

// Get all users (for admin use)
export const getAllUsers = (): User[] => {
  return allUsers.map(({ password: _, ...user }) => user as User);
};

// Check if user is employee
export const isEmployee = (cpf: string): boolean => {
  return employees.some(emp => emp.cpf === cpf);
};

// Check if user is customer
export const isCustomer = (cpf: string): boolean => {
  return customers.some(cust => cust.cpf === cpf);
};

// Helper function to get role of a user
export const getUserRole = (user: User): string => {
  if ('role' in user) {
    return (user as Employee).role;
  }
  return 'client';
};
