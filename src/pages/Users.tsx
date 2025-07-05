import React, { useState, useEffect } from 'react';
import { User, UserRole, Employee, EmployeeRole } from '@/types';
import { UsersService } from '@/services/usersService';
import { 
  Table, TableHeader, TableRow, TableHead, 
  TableBody, TableCell 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  Users as UsersIcon, Plus, Trash2, Search, X, Check
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const Users: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [usersList, setUsersList] = useState<Employee[]>([]); // Changed to Employee[]
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 0, // API uses 0-based pagination
    limit: 10,
    total: 0,
    totalPages: 0
  });

  // New user form state
  const [formData, setFormData] = useState<User>({
    cpf: '',
    name: '',
    email: '',
    password: '',
    address: '',
    phone: '',
    role: 'ATENDENTE', // Use API role format
    id: '',
    createdAt: new Date().toISOString(),
    isActive: true
  });

  // Load employees from API
  const loadUsers = async (page: number = 0, search?: string) => {
    // Don't make API calls if not authenticated
    if (!isAuthenticated || authLoading) {
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await UsersService.getEmployees(page, pagination.limit);
      
      // API returns: { timestamp, message, data: { content: [...], page, size, ... } }
      // Cast to any to handle the actual API response structure
      const apiResponse = response as any;
      const paginatedData = apiResponse.data || response; // Handle both wrapped and unwrapped responses
      const employeesList = paginatedData.content || [];
      
      setUsersList(employeesList);
      
      setPagination({
        page: (paginatedData.page || 0) + 1, // Convert from 0-based to 1-based
        limit: paginatedData.size || 10,
        total: paginatedData.totalElements || 0,
        totalPages: paginatedData.totalPages || 0
      });
    } catch (error: any) {
      console.error('Error loading employees:', error);
      toast.error('Erro ao carregar funcionários: ' + (error.message || 'Erro desconhecido'));
      // Fallback to empty list on error
      setUsersList([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load users on component mount
  useEffect(() => {
    // Only load users once when component mounts and user is authenticated
    if (isAuthenticated && !authLoading) {
      loadUsers();
    } else {
      // Ensure usersList is always an array
      setUsersList([]);
    }
  }, [isAuthenticated]); // Only run when authentication status changes

  // Search with debounce - only when there's actually a search term
  useEffect(() => {
    if (isAuthenticated && !authLoading && searchTerm.trim()) {
      const timer = setTimeout(() => {
        loadUsers(0); // Reset to first page when searching
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [searchTerm]);

  const resetForm = () => {
    setFormData({
      cpf: '',
      name: '',
      email: '',
      password: '',
      address: '',
      phone: '',
      role: 'ATENDENTE', // Use API role format
      id: '',
      createdAt: new Date().toISOString(),
      isActive: true
    });
    setEditingUser(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'role') {
      const roleValue = value as UserRole;
      setFormData(prev => ({
        ...prev,
        [name]: roleValue
      }));
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingUser) {
        // For editing, we'll need to use specific employee update functions
        toast.info('Funcionalidade de edição em desenvolvimento. Use as ações da tabela.');
        return;
      } else {
        // Create new employee directly (users are created through employee creation)
        await UsersService.createEmployee({
          name: formData.name,
          email: formData.email,
          cpf: formData.cpf,
          phone: formData.phone,
          address: formData.address,
          role: formData.role || 'ATENDENTE',
          password: formData.password || 'senha123456'
        });
        toast.success('Funcionário criado com sucesso!');
      }
      
      // Reload users list from the first page (0-based)
      await loadUsers(0);
      setShowForm(false);
      resetForm();
    } catch (error: any) {
      console.error('Error saving user:', error);
      toast.error('Erro ao salvar funcionário: ' + (error.message || 'Erro desconhecido'));
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      ...user,
      // Ensure password is included, even if it's empty (for form validation)
      password: user.password || ''
    });
    setShowForm(true);
  };

  const handleToggleStatus = async (cpf: string) => {
    try {
      toast.info('Use as opções "Remover do Cargo" ou "Alterar Cargo" para gerenciar funcionários');
    } catch (error: any) {
      console.error('Error toggling employee status:', error);
      toast.error('Erro ao atualizar status: ' + (error.message || 'Erro desconhecido'));
    }
  };

  const handleDelete = async (cpf: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este funcionário?')) {
      return;
    }

    try {
      await UsersService.deleteUser(cpf);
      toast.success('Funcionário excluído com sucesso!');
      // Reload users list from current page but converted to 0-based
      await loadUsers(pagination.page - 1);
    } catch (error: any) {
      console.error('Error deleting employee:', error);
      toast.error('Erro ao excluir funcionário: ' + (error.message || 'Erro desconhecido'));
    }
  };

  const filteredUsers = (usersList || []).filter(user => {
    if (!searchTerm) return true; // Show all users if no search term
    
    const searchLower = searchTerm.toLowerCase();
    return (
      user.name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      (user.role && user.role.toLowerCase().includes(searchLower)) ||
      user.cpf?.includes(searchTerm)
    );
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Badge className="bg-purple-500">Administrador</Badge>;
      case 'ATENDENTE':
        return <Badge className="bg-blue-500">Atendente</Badge>;
      case 'GERENTE':
        return <Badge className="bg-green-500">Gerente</Badge>;
      // Legacy roles for backward compatibility
      case 'admin':
        return <Badge className="bg-purple-500">Administrador</Badge>;
      case 'attendant':
        return <Badge className="bg-blue-500">Atendente</Badge>;
      case 'manager':
        return <Badge className="bg-green-500">Gerente</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
  };

  // Early return if not authenticated to prevent unnecessary rendering
  if (!isAuthenticated) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p>Você precisa estar logado para acessar esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciamento de Funcionários</h1>
        <Button onClick={() => { resetForm(); setShowForm(!showForm); }}>
          <Plus className="mr-2 h-4 w-4" /> Novo Funcionário
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingUser ? 'Editar Funcionário' : 'Novo Funcionário'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="name">
                    Nome
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="email">
                    E-mail
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="cpf">
                    CPF
                  </label>
                  <Input
                    id="cpf"
                    name="cpf"
                    value={formData.cpf}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="phone">
                    Telefone
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="address">
                    Endereço
                  </label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="role">
                    Perfil
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role as string}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="ADMIN">Administrador</option>
                    <option value="ATENDENTE">Atendente</option>
                    <option value="GERENTE">Gerente</option>
                  </select>
                </div>
                {!editingUser && (
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="password">
                      Senha
                    </label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required={!editingUser}
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                >
                  <X className="mr-2 h-4 w-4" /> Cancelar
                </Button>
                <Button type="submit">
                  <Check className="mr-2 h-4 w-4" /> {editingUser ? 'Atualizar' : 'Salvar'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}        <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex items-center">
              <UsersIcon className="mr-2 text-sigac-blue" />
              <CardTitle>Funcionários do Sistema</CardTitle>
            </div>
            <div className="flex gap-2 w-full md:w-64">
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Buscar funcionários..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.cpf}>
                      <TableCell>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500">CPF: {user.cpf}</div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role && getRoleBadge(user.role)}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-500">
                          Ativo
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-500 border-red-200 hover:bg-red-50"
                            onClick={() => handleDelete(user.cpf)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                      Nenhum funcionário encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Users;
