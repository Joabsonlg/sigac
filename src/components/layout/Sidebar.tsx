import React from 'react';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import {
    BarChart2,
    Calendar,
    Car,
    Clock,
    FileText,
    LayoutDashboard,
    LogOut,
    Settings,
    UserCog,
    Users,
    Wrench
} from 'lucide-react';
import {EmployeeRole, User} from '@/types';
import {useAuth} from '@/contexts/AuthContext';
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
    const {user: currentUser, logout} = useAuth();

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

    const getUserRole = (user: User | null): EmployeeRole | 'client' => {
        if (!user) return 'client';

        if (user.role === 'ADMIN') return 'ADMIN';
        if (user.role === 'MANAGER') return 'MANAGER';
        if (user.role === 'ATTENDANT') return 'ATTENDANT';
        return 'client';
    };

    const allNavItems: NavMenuItem[] = [
        {
            icon: LayoutDashboard,
            label: 'Dashboard',
            to: '/',
            allowedRoles: ['ADMIN', 'ATTENDANT', 'MANAGER']
        },
        {
            icon: Calendar,
            label: 'Reservas',
            to: '/reservas',
            allowedRoles: ['ADMIN', 'ATTENDANT', 'client', 'MANAGER']
        },
        {icon: Car, label: 'Veículos', to: '/veiculos', allowedRoles: ['ADMIN', 'ATTENDANT', 'client']},
        {icon: Clock, label: 'Diárias', to: '/diarias', allowedRoles: ['ADMIN', 'MANAGER']},
        {icon: Users, label: 'Clientes', to: '/clientes', allowedRoles: ['ADMIN', 'ATTENDANT']},
        {icon: UserCog, label: 'Usuários', to: '/usuarios', allowedRoles: ['ADMIN']},
        {icon: Wrench, label: 'Manutenção', to: '/manutencao', allowedRoles: ['ADMIN', 'ATTENDANT']},
        {icon: FileText, label: 'Financeiro', to: '/financeiro', allowedRoles: ['ADMIN', 'MANAGER']},
        {icon: BarChart2, label: 'Relatórios', to: '/relatorios', allowedRoles: ['ADMIN', 'MANAGER']},
    ];

    const filteredNavItems = allNavItems.filter(item => {
        if (!currentUser) return false;
        const userRole = getUserRole(currentUser);
        return item.allowedRoles.includes(userRole);
    });

    const userRole = getUserRole(currentUser);

    const getRoleTitle = (role: EmployeeRole | 'client'): string => {
        switch (role) {
            case 'ADMIN':
                return 'Administrador';
            case 'ATTENDANT':
                return 'Atendente';
            case 'MANAGER':
                return 'Gerente';
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
                    <Car className="text-sigac-blue flex-shrink-0" size={32}/>
                    <span
                        className="font-bold text-xl text-sigac-blue group-data-[collapsible=icon]:hidden">SIGAC</span>
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
                                            <item.icon size={20} className="flex-shrink-0"/>
                                            <span
                                                className="text-base group-data-[collapsible=icon]:sr-only">{item.label}</span>
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
                                <Settings size={20} className="flex-shrink-0"/>
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
                            <LogOut size={20} className="flex-shrink-0"/>
                            <span className="text-base group-data-[collapsible=icon]:sr-only">Sair</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
