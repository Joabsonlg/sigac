import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { User, Lock, Save } from 'lucide-react';

// Componente para Perfil de Usuário
const ProfileSettings = () => {
  const formSchema = z.object({
    name: z.string().min(2, {
      message: 'Nome deve ter pelo menos 2 caracteres.',
    }),
    email: z.string().email({
      message: 'Email inválido.',
    }),
    phone: z.string().min(10, {
      message: 'Telefone deve ter pelo menos 10 dígitos.',
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: 'Administrador',
      email: 'admin@sigac.com',
      phone: '(11) 98765-4321',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    toast.success('Perfil atualizado com sucesso!');
    console.log(values);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Perfil de Usuário</h2>
        <p className="text-gray-500">Gerencie suas informações pessoais</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome completo</FormLabel>
                <FormControl>
                  <Input placeholder="Nome completo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="seu.email@exemplo.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl>
                  <Input placeholder="(00) 00000-0000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="mt-4 gap-2">
            <Save size={16} /> Salvar alterações
          </Button>
        </form>
      </Form>
    </div>
  );
};

// Componente para Segurança
const SecuritySettings = () => {
  const passwordSchema = z.object({
    currentPassword: z.string().min(6, {
      message: 'A senha atual deve ter pelo menos 6 caracteres.',
    }),
    newPassword: z.string().min(6, {
      message: 'A nova senha deve ter pelo menos 6 caracteres.',
    }),
    confirmPassword: z.string().min(6, {
      message: 'A confirmação de senha deve ter pelo menos 6 caracteres.',
    }),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas não conferem.',
    path: ['confirmPassword'],
  });

  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  function onPasswordSubmit(values: z.infer<typeof passwordSchema>) {
    toast.success('Senha alterada com sucesso!');
    form.reset();
    console.log(values);
  }

  // Form para controle da autenticação de dois fatores
  const twoFactorForm = useForm({
    defaultValues: {
      twoFactorEnabled: false
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Segurança</h2>
        <p className="text-gray-500">Gerencie sua senha e configurações de segurança</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alteração de senha</CardTitle>
          <CardDescription>Atualize sua senha regularmente para maior segurança</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha atual</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Digite sua senha atual" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nova senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Digite a nova senha" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar nova senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Confirme a nova senha" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="mt-2">Alterar senha</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Autenticação de dois fatores</CardTitle>
          <CardDescription>Adicione uma camada extra de segurança à sua conta</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...twoFactorForm}>
            <form className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <FormField
                    control={twoFactorForm.control}
                    name="twoFactorEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Ativar autenticação de dois fatores</FormLabel>
                          <FormDescription>
                            Receba um código de segurança por SMS ou email a cada login
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

// Componente principal de Configurações
const Settings: React.FC = () => {
  return (
    <div className="p-6">
      <div className="flex flex-col gap-4 mb-6">
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-gray-500">
          Gerencie as configurações do sistema e da sua conta.
        </p>
      </div>
      
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="mb-4">
          <TabsTrigger value="profile" className="gap-2">
            <User size={16} /> Perfil
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Lock size={16} /> Segurança
          </TabsTrigger>
        </TabsList>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <TabsContent value="profile" className="mt-0">
            <ProfileSettings />
          </TabsContent>
          
          <TabsContent value="security" className="mt-0">
            <SecuritySettings />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default Settings;
