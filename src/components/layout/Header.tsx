
import React, { useEffect, useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User } from '@/types';
import { useLocation } from 'react-router-dom';
import { EmployeeRole } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

const Header: React.FC = () => {
  const { user } = useAuth(); // 🎉 Use AuthContext instead of localStorage
  const location = useLocation();
  const [pageTitle, setPageTitle] = useState("Dashboard");
  
  useEffect(() => {
    // 🎉 No need to get user from localStorage, AuthContext handles it via cookies!
    
    // Definir título da página com base na rota
    const path = location.pathname;
    let title = "Dashboard";
    
    if (path === "/") title = "Dashboard";
    else if (path === "/veiculos") title = "Veículos";
    else if (path === "/diarias") title = "Diarias";
    else if (path === "/reservas") title = "Reservas";
    else if (path === "/clientes") title = "Clientes";
    else if (path === "/usuarios") title = "Usuários";
    else if (path === "/manutencao") title = "Manutenção";
    else if (path === "/financeiro") title = "Financeiro";
    else if (path === "/relatorios") title = "Relatórios";
    else if (path === "/configuracoes") title = "Configurações";
    
    setPageTitle(title);
  }, [location]);
  
  // Função para obter as iniciais do usuário para o avatar
  const getUserInitials = (name: string): string => {
    if (!name) return "U";
    const nameParts = name.split(" ");
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };
  
  // Function to get employee role or "client" for customers
  const getUserRole = (user: User): EmployeeRole | 'CLIENT' => {
    return user.role as EmployeeRole | 'CLIENT';
  };
  
  // Função para obter a cor de fundo do avatar com base no papel
  const getAvatarClass = (user: User | null): string => {
    if (!user) return 'bg-sigac-blue';
    
    const role = getUserRole(user);
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-500';
      case 'EMPLOYEE':
        return 'bg-blue-500';
      case 'CLIENT':
        return 'bg-green-500';
      default:
        return 'bg-sigac-blue';
    }
  };

  return (
    <header className="h-16 bg-white flex items-center px-6 justify-between">
      <h1 className="text-xl font-semibold text-gray-800">{pageTitle}</h1>
      
      <div className="flex items-center gap-3">
        <Avatar className={`h-8 w-8 text-white text-sm font-semibold ${getAvatarClass(user)}`}>
          <AvatarFallback className={`${getAvatarClass(user)} text-white`}>
            {user ? getUserInitials(user.name) : "U"}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium">{user?.name || "Usuário"}</span>
      </div>
    </header>
  );
};

export default Header;
