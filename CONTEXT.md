# CONTEXT.md

## 1. Visao geral do projeto
Applied e uma aplicacao web para registro de atendimentos de ATs. O projeto usa React com Vite no frontend, Supabase como backend remoto, IndexedDB para persistencia local e Vercel como ambiente de deploy.

## 2. Objetivo do sistema
Registrar check-in e check-out com horario e geolocalizacao, permitir uso offline, manter fila local de sincronizacao e enviar os dados para a tabela `attendance` quando houver conectividade.

## 3. Tecnologias utilizadas
- React 19
- Vite 8
- TypeScript
- React Router DOM
- Supabase JS
- IndexedDB via `idb`
- UUID
- Vite PWA
- Vercel

## 4. Estrutura de pastas do projeto
- `src/components`: layout e componentes reutilizaveis
- `src/pages`: paginas principais do sistema
- `src/hooks`: hooks de geolocalizacao e sincronizacao automatica
- `src/lib/supabase`: cliente Supabase
- `src/lib/db`: persistencia local com IndexedDB
- `src/lib/sync`: sincronizacao da fila offline
- `src/services`: regras de atendimento e acesso a dados
- `src/types`: tipos de dominio
- `public`: icones e assets publicos

## 5. Fluxo principal do sistema (check-in, offline, sincronizacao)
1. Usuario entra em `CheckInPage` ou `CheckOutPage`.
2. `AttendanceForm` inicia captura automatica da geolocalizacao.
3. Ao confirmar, o app monta um registro local com `localId`.
4. O registro e salvo primeiro no IndexedDB.
5. Se houver internet e Supabase configurado, o status muda para `syncing` e o app faz `upsert` na tabela `attendance`.
6. Em sucesso, o registro local vira `synced`.
7. Em falha temporaria, o registro volta para `pending`.
8. Em falha nao recuperavel, o registro vira `error`.
9. A fila pode ser sincronizada automaticamente no inicio do app, no evento `online` e manualmente pela tela de atendimentos.

## 6. Integracao com Supabase (tabelas e campos utilizados)
Tabela padrao atual:
- `attendance`

Campos usados no envio e na leitura:
- `id`
- `patient_name`
- `observation`
- `check_time`
- `latitude`
- `longitude`
- `accuracy`
- `created_at`

Arquivos principais da integracao:
- `src/lib/supabase/client.ts`
- `src/services/attendanceService.ts`
- `src/lib/sync/attendanceSync.ts`

## 7. Funcionalidades ja implementadas
- roteamento com `BrowserRouter`
- boundary global de erro para evitar tela branca total em falha de rota ou renderizacao
- autenticacao com Supabase Auth por email e senha
- logout funcional
- protecao de rotas privadas com redirecionamento para `/login`
- provider de autenticacao reutilizavel, preparado para futura evolucao de multi equipes
- Home com navegacao para as telas principais
- check-in com geolocalizacao automatica e obrigatoria
- check-out com a mesma base de formulario
- cliente Supabase por variaveis de ambiente
- salvamento local com IndexedDB
- fila de sincronizacao offline
- sincronizacao automatica e manual
- lista de atendimentos remotos e locais
- painel administrativo inicial
- configuracao PWA basica
- deploy configurado para Vercel

## 8. Sistema offline e estados de sincronizacao
Persistencia local:
- banco `applied-attendance-db`
- store `attendance-records`

Estados:
- `pending`
- `syncing`
- `synced`
- `error`

Comportamento atual:
- salva local mesmo sem internet
- tenta sincronizar no carregamento do app
- tenta sincronizar quando o navegador volta a ficar online
- permite sincronizacao manual com botao
- usa `upsert` por `id` para reduzir duplicidade no Supabase

## 9. Deploy e ambiente de producao
- deploy na Vercel
- `vercel.json` com rewrite global para `/index.html`
- `main.tsx` usa `BrowserRouter`
- `/login` funciona como rota publica e as demais rotas principais sao privadas
- `vite.config.ts` ativa PWA com `vite-plugin-pwa`
- variaveis esperadas:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

## 10. Limitacoes atuais do sistema
- pacientes e profissionais ainda usam dados mockados
- nao ha autenticacao, autorizacao ou protecao de rotas
- a tabela `attendance` nao diferencia explicitamente o tipo remoto de registro entre check-in e check-out
- ainda nao ha estrutura real de equipes, perfis ou selecao de contexto organizacional apos o login
- nao ha filtros, busca ou paginacao no historico
- painel administrativo ainda e inicial
- sincronizacao offline ainda precisa de validacao mais forte em producao
- telas que exibem historico dependem de renderizacao defensiva para lidar com dados antigos ou incompletos
- nao ha estrutura multiempresa, equipes ou perfis de permissao
- validacao de distancia, antifraude e melhoria de GPS ainda nao existem
- PWA esta configurada, mas a estrategia completa de instalacao e cache ainda precisa evoluir
