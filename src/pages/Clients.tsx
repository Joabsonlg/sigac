
import React, { useState, useEffect } from 'react';
import { Customer } from '@/types';
import ClientsService, { CreateClientRequest, UpdateClientRequest } from '@/services/clientsService';
import { 
  Table, TableHeader, TableRow, TableHead, 
  TableBody, TableCell 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  Users, Plus, Edit, Trash2, Check, X, Search, Mail, Phone, User, Loader2
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const Clients: React.FC = () => {
  const [clientsList, setClientsList] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  // New client form state
  const [formData, setFormData] = useState<CreateClientRequest>({
    cpf: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    password: ''
  });

  // Load clients on component mount
  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const response = await ClientsService.getAllClients();
      
      // Extract clients from API response structure
      const clients = response.data?.content || response.data || [];
      setClientsList(Array.isArray(clients) ? clients : []);
    } catch (error) {
      console.error('Error loading clients:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar clientes',
        variant: 'destructive',
      });
      setClientsList([]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      cpf: '',
      name: '',
      email: '',
      phone: '',
      address: '',
      password: ''
    });
    setEditingClient(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateCPF = (cpf: string): boolean => {
    // Remove non-numeric characters
    const numbers = cpf.replace(/\D/g, '');
    
    // Check if it has 11 digits
    if (numbers.length !== 11) return false;
    
    // Check if all digits are the same
    if (/^(\d)\1{10}$/.test(numbers)) return false;
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    if (!editingClient && !validateCPF(formData.cpf)) {
      toast({
        title: 'Erro',
        description: 'CPF inválido',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);
      
      if (editingClient) {
        // Update existing client
        const updateData: UpdateClientRequest = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address
        };
        
        await ClientsService.updateClient(editingClient.cpf, updateData);
        toast({
          title: 'Sucesso',
          description: 'Cliente atualizado com sucesso',
        });
      } else {
        // Create new client
        await ClientsService.createClient(formData);
        toast({
          title: 'Sucesso',
          description: 'Cliente criado com sucesso',
        });
      }
      
      setShowForm(false);
      resetForm();
      loadClients(); // Reload the list
    } catch (error) {
      console.error('Error submitting client:', error);
      toast({
        title: 'Erro',
        description: editingClient ? 'Erro ao atualizar cliente' : 'Erro ao criar cliente',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (client: Customer) => {
    setEditingClient(client);
    setFormData({
      cpf: client.cpf,
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address || '',
      password: client.password || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (cpf: string) => {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) {
      return;
    }

    try {
      await ClientsService.deleteClient(cpf);
      toast({
        title: 'Sucesso',
        description: 'Cliente excluído com sucesso',
      });
      loadClients(); // Reload the list
    } catch (error) {
      console.error('Error deleting client:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao excluir cliente',
        variant: 'destructive',
      });
    }
  };

  const filteredClients = clientsList.filter(client => {
    const searchLower = searchTerm.toLowerCase();
    return (
      client.name.toLowerCase().includes(searchLower) ||
      client.email.toLowerCase().includes(searchLower) ||
      client.cpf.toLowerCase().includes(searchLower) ||
      client.phone.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciamento de Clientes</h1>
        <Button 
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          disabled={loading}
        >
          <Plus className="mr-2 h-4 w-4" /> Novo Cliente
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingClient ? 'Editar Cliente' : 'Novo Cliente'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {!editingClient && (
                  <div>
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      name="cpf"
                      value={formData.cpf}
                      onChange={handleInputChange}
                      placeholder="000.000.000-00"
                      required
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
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
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                {!editingClient && (
                  <div>
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                )}
                <div className={editingClient ? "md:col-span-2" : ""}>
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  disabled={submitting}
                >
                  <X className="mr-2 h-4 w-4" /> Cancelar
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  {submitting 
                    ? (editingClient ? 'Atualizando...' : 'Criando...')
                    : (editingClient ? 'Atualizar' : 'Salvar')
                  }
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex items-center">
              <Users className="mr-2 text-sigac-blue" />
              <CardTitle>Lista de Clientes</CardTitle>
            </div>
            <div className="flex gap-2 w-full md:w-64">
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Buscar clientes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Carregando clientes...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>Endereço</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.length > 0 ? (
                    filteredClients.map((client) => (
                      <TableRow key={client.cpf}>
                        <TableCell>
                          <div className="font-medium flex items-center">
                            <User className="mr-2 h-4 w-4 text-sigac-blue" />
                            {client.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="flex items-center">
                              <Mail className="mr-1 h-3 w-3 text-gray-500" /> {client.email}
                            </span>
                            <span className="flex items-center mt-1">
                              <Phone className="mr-1 h-3 w-3 text-gray-500" /> {client.phone}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{client.cpf}</TableCell>
                        <TableCell>{client.address || '-'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(client)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-500 border-red-200 hover:bg-red-50"
                              onClick={() => handleDelete(client.cpf)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                        {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Clients;
