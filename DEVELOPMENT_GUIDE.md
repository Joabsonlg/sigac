
# SIGAC - Guia de Desenvolvimento

Este guia tem como objetivo facilitar a adição de novos módulos ao sistema SIGAC (Sistema Integrado de Gestão de Aluguel de Carros). Ele fornece um passo a passo detalhado e as melhores práticas para manter a consistência e padronização do projeto.

## Estrutura do Projeto

O SIGAC segue uma estrutura organizada:

```
src/
├── components/       # Componentes reutilizáveis
│   ├── common/       # Componentes comuns (botões, badges, etc.)
│   ├── layout/       # Componentes de layout (sidebar, header)
│   ├── ui/           # Componentes de UI shadcn
│   └── [módulo]/     # Componentes específicos de um módulo
├── hooks/            # Hooks personalizados
├── lib/              # Funções utilitárias
├── pages/            # Páginas da aplicação
│   ├── auth/         # Páginas de autenticação
│   └── [módulo]/     # Páginas específicas de um módulo
├── types/            # Definições de tipos TypeScript
└── data/             # Dados mockados para desenvolvimento
```

## Adicionando um Novo Módulo

Para adicionar um novo módulo (por exemplo, gestão de pneus), siga os passos abaixo:

### 1. Defina os Tipos

Primeiro, adicione os tipos necessários em `src/types/index.ts`:

```typescript
export type Tire = {
  id: string;
    vehiclePlate: string;
  brand: string;
  model: string;
  size: string;
  installationDate: string;
  currentKm: number;
  status: 'new' | 'used' | 'worn';
  position: 'front-left' | 'front-right' | 'rear-left' | 'rear-right' | 'spare';
};
```

### 2. Crie a Página Principal

Crie o arquivo da página principal em `src/pages/TireManagement.tsx`:

```tsx
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SectionTitle from '@/components/common/SectionTitle';
import TireList from '@/components/tire/TireList';
import TireHistory from '@/components/tire/TireHistory';

const TireManagement: React.FC = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <SectionTitle 
          title="Gestão de Pneus" 
          description="Gerencie o inventário e manutenção de pneus da frota" 
        />
        
        <Tabs defaultValue="inventory" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="inventory">Inventário</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
          </TabsList>
          
          <TabsContent value="inventory">
            <TireList />
          </TabsContent>
          
          <TabsContent value="history">
            <TireHistory />
          </TabsContent>
          
          <TabsContent value="reports">
            {/* Componente de relatórios */}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default TireManagement;
```

### 3. Crie os Componentes do Módulo

Crie uma pasta `src/components/tire/` para os componentes específicos do módulo:

#### TireList.tsx
```tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import StatusBadge from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
// Componentes adicionais, como modais para adicionar/editar pneus

const TireList: React.FC = () => {
  // Implementação do componente
  // ...
};

export default TireList;
```

#### TireHistory.tsx
```tsx
// Implementação similar
```

### 4. Adicione a Rota no App.tsx

Adicione a nova rota no arquivo `src/App.tsx`:

```tsx
import TireManagement from './pages/TireManagement';

// Dentro do componente de rotas
<Route path="/pneus" element={<TireManagement />} />
```

### 5. Adicione o Item no Menu Lateral

Adicione o novo item no sidebar, em `src/components/layout/Sidebar.tsx`:

```tsx
// Importe o ícone necessário
import { Circle } from 'lucide-react';

// Adicione ao array de navItems
const navItems = [
  // ... itens existentes
  { icon: Circle, label: 'Gestão de Pneus', to: '/pneus' },
];
```

## Integração com APIs

O SIGAC está preparado para integração com APIs através do React Query. Para um novo módulo:

### 1. Crie os Hooks de API

Crie um arquivo para os hooks de API do seu módulo, por exemplo, `src/hooks/useTiresApi.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tire } from '@/types';

// URL base da API (substituir quando estiver em produção)
const API_BASE_URL = 'https://api.sigac.com/api';

// Funções para buscar dados
export const useTires = () => {
  return useQuery({
    queryKey: ['tires'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/tires`);
      if (!response.ok) throw new Error('Erro ao buscar pneus');
      return response.json();
    },
  });
};

// Função para adicionar um pneu
export const useAddTire = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newTire: Omit<Tire, 'id'>) => {
      const response = await fetch(`${API_BASE_URL}/tires`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTire),
      });
      
      if (!response.ok) throw new Error('Erro ao adicionar pneu');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tires'] });
    }
  });
};

// Adicione outras funções como atualizar, excluir, etc.
```

### 2. Use os Hooks em Seus Componentes

```tsx
import { useTires, useAddTire } from '@/hooks/useTiresApi';

const TireList: React.FC = () => {
  const { data: tires, isLoading, error } = useTires();
  
  // Exibir loading, error ou os dados
  if (isLoading) return <div>Carregando...</div>;
  if (error) return <div>Erro ao carregar dados</div>;
  
  return (
    // Renderize os pneus
  );
};
```

## Validação de Formulários

O SIGAC utiliza React Hook Form com Zod para validação de formulários:

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Defina o schema de validação
const tireSchema = z.object({
  brand: z.string().min(2, "Marca deve ter pelo menos 2 caracteres"),
  model: z.string().min(2, "Modelo deve ter pelo menos 2 caracteres"),
  size: z.string().min(2, "Tamanho é obrigatório"),
  // ...outros campos
});

// No componente
const TireForm = () => {
  const form = useForm({
    resolver: zodResolver(tireSchema),
    defaultValues: {
      brand: '',
      model: '',
      size: '',
      // ...
    },
  });
  
  // Implementação do formulário
};
```

## Padrões de Estado e Feedback

- Use o componente `toast` para notificar os usuários sobre ações realizadas
- Utilize o estado `isLoading` para indicar carregamento
- Implemente tratamento de erros consistente

```tsx
import { toast } from 'sonner';

// Exemplo de uso
const handleSave = async () => {
  try {
    await saveTire(tireData);
    toast.success('Pneu salvo com sucesso!');
  } catch (error) {
    toast.error('Erro ao salvar pneu');
  }
};
```

## Melhores Práticas

1. **Componentização**: Divida a UI em componentes reutilizáveis
2. **Tipos**: Defina tipos TypeScript para todos os dados
3. **Responsividade**: Utilize classes Tailwind para garantir responsividade
4. **Padronização**: Siga os padrões de código existentes
5. **Organização**: Mantenha arquivos organizados por módulo
6. **Testes**: Adicione testes para componentes e lógica
7. **Estados Visuais**: Considere todos os estados (loading, error, empty, success)

Seguindo este guia, você poderá adicionar novos módulos ao SIGAC mantendo a consistência e a qualidade do código.
