## **Documento de Visão do Produto - SIGAC (Sistema de Gestão de Aluguel de Carros)**

### 1. Descrição da Visão do Produto

**Objetivo:** O SIGAC visa oferecer uma solução integrada para o gerenciamento de empresas de aluguel de veículos, promovendo a digitalização de processos, automatização de tarefas operacionais e melhoria da experiência do cliente. 

**Motivação:** Atualmente, muitas locadoras utilizam planilhas ou sistemas fragmentados para gerir frota, reservas e pagamentos. Isso leva a erros manuais, dificuldade de controle de manutenção e baixa escalabilidade.

**Melhorias esperadas:** Redução de falhas operacionais, melhoria no controle financeiro, manutenção preventiva mais eficaz, maior satisfação do cliente.

**Processo Atual (AS-IS):**
- Reserva manual via telefone ou presencial;
- Controle de manutenção em planilhas;
- Contratos gerados manualmente;
- Falta de visão integrada da frota e do financeiro.

**Processo Proposto (TO-BE):**
- Plataforma centralizada com reservas online;
- Emissão automática de contratos;
- Monitoramento e alerta de manutenções;
- Rastreamento de veículos em tempo real;
- Geração de relatórios financeiros automatizados.

**Modelagem de Processo de Negócio:** A modelagem BPM está em desenvolvimento utilizando a ferramenta Bizagi. Os principais atores envolvidos são: cliente, atendente, técnico de manutenção, administrador e gestor financeiro.

---

### 2. Atores Envolvidos e Usuários Finais

**Envolvidos (não usuários):**
- **Detran:** Fornece dados de multas.
  - Responsabilidade: notificário oficial das infrações.
- **Sistemas de GPS e Seguros:** Integração via API.
  - Responsabilidade: fornecer localização e ativação de cobertura.
- **Serviço de E-mail/SMS:** Notificação automática de eventos aos clientes.

**Usuários Finais:**
- **Cliente:** Realiza reservas, pagamentos, solicita suporte e rastreia veículos.
  - Representado pelo Atendente.
- **Atendente:** Gera contratos, gerencia reservas e suporte.
  - Representado pelo Administrador.
- **Administrador:** Gerencia usuários, auditorias e configurações do sistema.
  - Representa a diretoria.
- **Técnico de Manutenção:** Agendamento e registro de manutenção, multas.
  - Representado pelo Administrador.
- **Gestor Financeiro:** Gera relatórios e controla pagamentos.
  - Representado pelo Administrador.

---

### 3. Ambiente do Usuário

- **Número de pessoas:** Varia conforme o porte da empresa, entre 5 a 50.
- **Ciclo de tarefas:** Em média, de 15 a 30 minutos por atendimento.
- **Plataformas utilizadas:** Navegadores web (Chrome, Firefox), sistemas de GPS e ERPs financeiros externos.
- **Interações necessárias:** Sistemas de e-mail/SMS e APIs de rastreamento e seguros.

---

### 4. Necessidades dos Usuários e Envolvidos

| Problema | Causa | Solução Atual | Solução Proposta | Prioridade |
|---------|-------|----------------|------------------|-----------|
| Reservas duplicadas | Falta de controle em tempo real | Planilhas | Sistema online | Alta |
| Manutenção esquecida | Falta de alerta | Manual | Notificação automática | Alta |
| Controle financeiro difuso | Sistemas não integrados | Excel | Módulo financeiro | Alta |
| Geração de contratos demorada | Manual | Word | Geração automática | Média |
| Ausência de rastreamento | Falta de GPS integrado | Não possui | Integração com API | Média |

---

### 5. Alternativas e Concorrência

| Alternativa | Pontos Fortes | Pontos Fracos |
|-------------|---------------|----------------|
| Aluguel via planilha | Baixo custo | Falta de controle, alto erro manual |
| Sistemas genéricos (ex: Totvs) | Ampla gama de módulos | Alto custo, não especializado |
| SIGAC | Especializado, acessível, responsivo | Em desenvolvimento, necessidade de adoção |

---

### 6. Visão Geral do Produto

**Perspectiva do Produto:** Produto autônomo que pode ser integrado com APIs externas (rastreamento, seguros). Opera em nuvem e é acessível via web e dispositivos móveis.

**Suposições e Dependências:**
- Integração com APIs de terceiros funcionará conforme esperado;
- Infraestrutura de servidores estável para hospedar aplicação;
- Usuários possuem acesso à internet.

---

### 7. Recursos do Produto

- Reservas online com consulta de disponibilidade.
- Geração automática de contratos.
- Módulo de manutenção preventiva e corretiva.
- Rastreamento de veículos.
- Integração com sistemas de seguros e GPS.
- Geração de relatórios em PDF/Excel.
- Emissão de boletos e registro de pagamentos.
- Sistema de notificações para manutenção e devolução.
- Cadastro de motoristas adicionais.
- Aplicar e gerenciar descontos e promoções.
- Registro e gestão de multas.
- Solicitação e acompanhamento de suporte.

---

### 8. Outros Requisitos do Sistema

- **Desempenho:** Resposta em até 2s por requisição; 1000 usuários simultâneos.
- **Segurança:** Criptografia de dados e controle de acesso por perfil.
- **Usabilidade:** Design responsivo e acessível.
- **Confiabilidade:** 99,9% de disponibilidade, backups diários.
- **Compatibilidade:** Suporte a navegadores modernos e dispositivos móveis.
- **Documentação:** Manual do usuário e ajuda online.

---

### 9. Cronograma do Projeto

**Período de Execução:** De 01/05/2025 a 16/07/2025

**Fases:**
1. Levantamento de Requisitos (01/05 a 15/05)
2. Modelagem ER e Relacional (16/05 a 31/05)
3. Desenvolvimento do Sistema (01/06 a 30/06)
4. Testes e Ajustes (01/07 a 10/07)
5. Apresentação Final e Entrega (15/07 a 16/07)

**Entregáveis:** Documento de Visão, Modelo ER, Modelo Relacional, Sistema Implementado, Relatório Final

---

**Referências:**
- Lei da Inovação (Lei 13.243/2016)
