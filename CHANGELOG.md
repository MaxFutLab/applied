# Applied — Histórico de Alterações

## 2026-03-12
### Implementado
- criação inicial do projeto com React + Vite
- configuração do ambiente local
- integração com Supabase
- criação da tabela `attendance`
- criação da tela de check-in
- captura de geolocalização
- captura de horário
- salvamento offline com IndexedDB
- sincronização automática com Supabase
- deploy inicial na Vercel

### Arquivos/áreas impactadas
- frontend React
- integração com Supabase
- lógica de IndexedDB
- páginas de check-in e atendimentos

### Banco de dados
- tabela `attendance` criada

## 2026-03-12 - correcao de tela branca em Atendimentos
### Implementado
- tratamento defensivo na pagina `Atendimentos` para evitar quebra ao ler dados remotos e locais incompletos
- tratamento defensivo no `Admin` para registros remotos inconsistentes
- error boundary global para impedir tela branca total na SPA
- revisao do React Router e confirmacao do rewrite SPA na Vercel

### Arquivos/areas impactadas
- roteamento React
- pagina de atendimentos
- pagina administrativa
- camada de tratamento de erro da interface

### Banco de dados
- sem alteracoes no schema

## 2026-03-13 - login simples com Supabase Auth
### Implementado
- pagina `LoginPage` com email, senha, loading e tratamento de erro
- `AuthProvider` reutilizavel com sessao, usuario autenticado e logout
- protecao das rotas privadas com redirecionamento para `/login`
- redirecionamento automatico de usuario autenticado ao acessar `/login`
- logout funcional no `AppShell`
- base preparada para futura evolucao de multi equipes via contexto de autenticacao

### Arquivos/areas impactadas
- autenticacao frontend
- roteamento React
- shell principal da aplicacao
- documentacao do projeto

### Banco de dados
- sem alteracoes no schema
