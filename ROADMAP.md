# Applied — Roadmap

## 🚀 Prioridade Alta (Essencial para operação)

### 🔐 Autenticação

* Implementar tela de login via email
* Implementar recuperação de senha
* Implementar logout seguro
* Proteger rotas privadas (usuário precisa estar autenticado)

### 📡 Sistema Offline

* Validar sincronização offline em produção
* Melhorar detecção de retorno de internet
* Garantir que registros `pending` sincronizem corretamente
* Mostrar status de sincronização mais claro para o usuário:

  * `pending` → aguardando sincronização
  * `syncing` → sincronizando
  * `synced` → sincronizado
  * `error` → erro ao sincronizar

### 🏢 Estrutura Multiempresa

* Implementar suporte a múltiplas empresas
* Cada empresa pode ter vários pacientes
* Cada empresa pode ter vários profissionais
* Garantir isolamento de dados entre empresas

---

# 🧩 Prioridade Média (Estrutura do sistema)

### 👥 Sistema de Permissões

#### Admin

* Gerencia empresas
* Gerencia usuários
* Acesso total

#### Profissional N1 (Responsável)

* Pode cadastrar pacientes
* Pode gerenciar profissionais N2
* Pode visualizar todos os atendimentos da equipe

#### Profissional N2 (Executante / AT)

* Registra atendimentos
* Visualiza apenas seus atendimentos

---

### 👨‍👩‍👧 Estrutura de Equipes

* Permitir que profissionais N1 tenham vários profissionais N2
* Permitir que profissionais N2 participem de múltiplas equipes
* Garantir que cada equipe veja apenas os dados de seus pacientes

---

### 📅 Estrutura de Atendimentos

Implementar modelo real de atendimento:

* Check-in
* Check-out
* Cálculo da duração do atendimento

Também implementar:

* Rotina de atendimentos programados
* Registro completo do histórico de atendimentos

---

### 🧾 Cadastros

* Criar cadastro real de pacientes
* Criar cadastro real de profissionais (ATs)
* Vincular pacientes a equipes

---

### 🔎 Histórico e Consulta

Permitir filtros por:

* Paciente
* Profissional
* Data
* Empresa

Também implementar:

* Botão de **sincronização manual**
* **Painel administrativo**

---

# 📈 Prioridade Baixa (Melhorias e escalabilidade)

### 🎨 Experiência do Usuário

* Transformar aplicação em **PWA instalável**
* Melhorar layout visual
* Otimizar experiência mobile

---

### 🔐 Segurança e Validação

* Validar distância do local esperado do atendimento
* Melhorar precisão da geolocalização
* Marcar registros suspeitos (possível fraude)

---

### 📊 Análise e Gestão

* Criar relatórios de atendimentos
* Criar métricas de produtividade
* Exportar dados

---

# 🌱 Futuro (Evolução do produto)

* Aplicativo mobile nativo
* Notificações de atendimentos
* Agenda integrada
* Integração com sistemas externos
* Dashboard de gestão para clínicas
