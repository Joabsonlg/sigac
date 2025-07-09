# API Integration Guide

Este documento descreve como integrar o sistema SIGAC com uma API REST.

## Configuração Inicial

1. Configure as variáveis de ambiente no arquivo `.env.local`:
```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=SIGAC
VITE_DEBUG=true
```

2. O sistema está configurado para usar axios como cliente HTTP com interceptors automáticos para:
   - Adicionar token de autenticação em todas as requisições
   - Tratamento global de erros (401, 403, 500, etc.)
   - Redirecionamento automático para login em caso de token expirado

## Endpoints Esperados pela API

### Autenticação

#### POST /auth/login
**Request:**
```json
{
  "email": "admin@sigac.com",
  "password": "123456"
}
```

**Response:**
```json
{
  "user": {
    "id": "1",
    "name": "Administrador",
    "email": "admin@sigac.com",
    "role": "admin",
    "cpf": "123.456.789-00"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "optional_refresh_token"
}
```

#### POST /auth/register
**Request:**
```json
{
  "name": "Novo Usuário",
  "email": "novo@sigac.com",
  "password": "123456",
  "phone": "11999999999"
}
```

#### POST /auth/logout
**Headers:** `Authorization: Bearer <token>`

#### POST /auth/password-reset
**Request:**
```json
{
  "email": "user@sigac.com"
}
```

#### GET /auth/verify
**Headers:** `Authorization: Bearer <token>`
**Response:** 200 OK se token válido, 401 se inválido

### Usuários

#### GET /users
**Headers:** `Authorization: Bearer <token>`
**Query Params:** `page`, `limit`, `search`, `role`

#### POST /users
**Headers:** `Authorization: Bearer <token>`
**Request:**
```json
{
  "name": "Novo Usuário",
  "email": "user@sigac.com",
  "cpf": "123.456.789-00",
  "phone": "11999999999",
  "address": "Rua X, 123",
  "role": "admin",
  "password": "123456"
}
```

#### PUT /users/:id
#### DELETE /users/:id

### Veículos

#### GET /vehicles
**Query Params:** `page`, `limit`, `search`, `status`

#### POST /vehicles
**Request:**
```json
{
  "model": "Corolla",
  "brand": "Toyota",
  "year": 2023,
  "plate": "ABC-1234",
  "status": "available",
  "image_url": "http://example.com/image.jpg"
}
```

### Reservas

#### GET /reservations
**Query Params:** `page`, `limit`, `search`, `status`, `customer_cpf`, `vehicle_plate`

#### POST /reservations
**Request:**
```json
{
  "customer_cpf": "123.456.789-00",
  "vehicle_plate": "ABC-1234",
  "start_date": "2023-12-01",
  "end_date": "2023-12-05",
  "amount": 500.00,
  "promotion_code": "SUMMER10"
}
```

### Clientes

#### GET /customers
#### POST /customers
#### PUT /customers/:cpf
#### DELETE /customers/:cpf

### Manutenção

#### GET /maintenance
#### POST /maintenance
#### PUT /maintenance/:id
#### DELETE /maintenance/:id

### Relatórios

#### GET /reports/revenue
**Query Params:** `start_date`, `end_date`

#### GET /reports/vehicles
#### GET /reports/reservations

## Estrutura de Resposta

### Sucesso
```json
{
  "success": true,
  "data": {...},
  "message": "Operação realizada com sucesso"
}
```

### Erro
```json
{
  "success": false,
  "error": "Erro específico",
  "message": "Mensagem de erro para o usuário",
  "code": "ERROR_CODE"
}
```

### Paginação
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

## Implementação no Frontend

### Usando o AuthContext
```tsx
import { useAuth } from '@/contexts/AuthContext';

const MyComponent = () => {
  const { user, login, logout, isAuthenticated, isLoading } = useAuth();
  
  const handleLogin = async () => {
    try {
      await login({ email: 'user@example.com', password: '123456' });
      // Login success - user será atualizado automaticamente
    } catch (error) {
      // Error handling é feito automaticamente
    }
  };
};
```

### Usando hooks personalizados
```tsx
import { useApi, useMutation } from '@/hooks/useApi';
import { api } from '@/services/api';

const VehiclesPage = () => {
  // GET request com loading automático
  const { data: vehicles, loading, error, refetch } = useApi(
    () => api.get('/vehicles').then(res => res.data),
    [], // dependencies
    { immediate: true }
  );
  
  // Mutation para criar veículo
  const { mutate: createVehicle, loading: creating } = useMutation(
    (vehicleData) => api.post('/vehicles', vehicleData),
    {
      onSuccess: () => {
        refetch(); // Atualiza a lista
      },
      showSuccessToast: 'Veículo criado com sucesso!'
    }
  );
};
```

## Fallback para Dados Mock

O sistema está configurado para usar dados mock quando a API não estiver disponível. Os dados mock estão em:
- `src/data/mockData.ts`
- `src/data/usersData.ts`

## Tratamento de Erros

O sistema inclui tratamento automático de erros:
- **401 Unauthorized**: Logout automático e redirecionamento para login
- **403 Forbidden**: Toast de erro "Acesso negado"
- **500+ Server Error**: Toast de erro genérico
- **Network Error**: Toast de erro de conexão

## Tokens de Autenticação

- Tokens são salvos automaticamente no localStorage como `authToken`
- Refresh tokens (opcional) são salvos como `refreshToken`
- Tokens são incluídos automaticamente em todas as requisições
- Implementação de refresh automático de tokens disponível

## Próximos Passos

1. Implementar os endpoints da API seguindo a estrutura documentada
2. Testar a integração usando as ferramentas de desenvolvimento
3. Configurar as variáveis de ambiente de produção
4. Implementar validações adicionais conforme necessário
