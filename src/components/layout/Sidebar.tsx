
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Car, 
  Calendar, 
  Users, 
  Wrench, 
  BarChart2, 
  FileText, 
  Settings, 
  LogOut, 
  LayoutDashboard, 
  UserCog
} from 'lucide-react';
import { User } from '@/types';
import { EmployeeRole } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';

// Interface para definir os itens de navegação com informações de permissão
interface NavMenuItem {
  icon: React.ElementType;
  label: string;
  to: string;
  allowedRoles: Array<EmployeeRole | 'client'>;
}

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const { user: currentUser, logout } = useAuth();
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      navigate('/login');
    }
  };

  // Function to get employee role or "client" for customers
  const getUserRole = (user: User | null): EmployeeRole | 'client' => {
    if (!user) return 'client';
    
    // Get the role from the user object
    const userRole = 'role' in user ? (user as any).role : 'client';
    // Convert API role format to internal format
    if (typeof userRole === 'string') {
      const normalizedRole = userRole.toLowerCase();
      
      // Map API roles to internal roles
      switch (normalizedRole) {
        case 'admin':
        case 'administrador':
          console.log('Mapped to admin role');
          return 'admin';
        case 'attendant':
        case 'atendente':
          console.log('Mapped to attendant role');
          return 'attendant';
        case 'maintenance':
        case 'manutencao':
          console.log('Mapped to maintenance role');
          return 'maintenance';
        case 'financial':
        case 'financeiro':
          console.log('Mapped to financial role');
          return 'financial';
        case 'client':
        case 'cliente':
          console.log('Mapped to client role');
          return 'client';
        default:
          console.log(`Unknown role "${normalizedRole}", defaulting to client`);
          return 'client';
      }
    }
    
    console.log('Role is not a string, defaulting to client');
    return 'client';
  };

  // Definição dos itens do menu com controle de permissão
  const allNavItems: NavMenuItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', to: '/', allowedRoles: ['admin', 'attendant', 'client', 'financial', 'maintenance'] },
    { icon: Car, label: 'Veículos', to: '/veiculos', allowedRoles: ['admin', 'attendant', 'client'] },
    { icon: Calendar, label: 'Reservas', to: '/reservas', allowedRoles: ['admin', 'attendant', 'client', 'financial'] },
    { icon: Users, label: 'Clientes', to: '/clientes', allowedRoles: ['admin', 'attendant'] },
    { icon: UserCog, label: 'Usuários', to: '/usuarios', allowedRoles: ['admin'] },
    { icon: Wrench, label: 'Manutenção', to: '/manutencao', allowedRoles: ['admin', 'attendant', 'maintenance'] },
    { icon: FileText, label: 'Financeiro', to: '/financeiro', allowedRoles: ['admin', 'financial'] },
    { icon: BarChart2, label: 'Relatórios', to: '/relatorios', allowedRoles: ['admin', 'financial'] },
  ];

  // Filtrar itens de navegação com base no papel do usuário
  const filteredNavItems = allNavItems.filter(item => {
    if (!currentUser) return false;
    const userRole = getUserRole(currentUser);
    const hasPermission = item.allowedRoles.includes(userRole);
    
    // Debug log to help troubleshoot
    console.log(`User role: ${userRole}, Item: ${item.label}, Allowed roles: ${item.allowedRoles.join(', ')}, Has permission: ${hasPermission}`);
    
    return hasPermission;
  });

  const userRole = getUserRole(currentUser);
  
  // Customizar a saudação baseada no papel do usuário
  const getRoleTitle = (role: EmployeeRole | 'client'): string => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'attendant':
        return 'Atendente';
      case 'maintenance':
        return 'Manutenção';
      case 'financial':
        return 'Financeiro';
      case 'client':
        return 'Cliente';
      default:
        return 'Usuário';
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-3 px-3 py-3">
          <Car className="text-sigac-blue flex-shrink-0" size={32} />
          <span className="font-bold text-xl text-sigac-blue group-data-[collapsible=icon]:hidden">SIGAC</span>
        </div>
        
        {currentUser && (
          <div className="px-3 py-3 group-data-[collapsible=icon]:hidden">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Bem-vindo,</p>
              <p className="font-medium text-base">{currentUser.name}</p>
              <p className="text-sm text-sigac-blue">{getRoleTitle(userRole)}</p>
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 py-2 text-sm font-medium">Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredNavItems.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton 
                    asChild 
                    size="lg"
                    isActive={
                      (item.to === '/' && currentPath === '/') || 
                      (item.to !== '/' && currentPath.startsWith(item.to))
                    }
                    className="h-12 px-3"
                    tooltip={item.label}
                  >
                    <Link to={item.to} className="flex items-center gap-3">
                      <item.icon size={20} className="flex-shrink-0" />
                      <span className="text-base group-data-[collapsible=icon]:sr-only">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t px-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              size="lg"
              isActive={currentPath === '/configuracoes'}
              className="h-12 px-3"
              tooltip="Configurações"
            >
              <Link to="/configuracoes" className="flex items-center gap-3">
                <Settings size={20} className="flex-shrink-0" />
                <span className="text-base group-data-[collapsible=icon]:sr-only">Configurações</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleLogout}
              size="lg"
              className="h-12 px-3"
              tooltip="Sair"
            >
              <LogOut size={20} className="flex-shrink-0" />
              <span className="text-base group-data-[collapsible=icon]:sr-only">Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
