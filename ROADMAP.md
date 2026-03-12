# Applied - Roadmap

## Prioridade Alta (Essencial para operacao)

### Autenticacao

* Implementar tela de login via email
* Implementar recuperacao de senha
* Implementar logout seguro
* Proteger rotas privadas (usuario precisa estar autenticado)

### Sistema Offline

* Validar sincronizacao offline em producao
* Melhorar deteccao de retorno de internet
* Garantir que registros `pending` sincronizem corretamente
* Mostrar status de sincronizacao mais claro para o usuario:

  * `pending` -> aguardando sincronizacao
  * `syncing` -> sincronizando
  * `synced` -> sincronizado
  * `error` -> erro ao sincronizar

### Estrutura Multiempresa

* Implementar suporte a multiplas empresas
* Cada empresa pode ter varios pacientes
* Cada empresa pode ter varios profissionais
* Garantir isolamento de dados entre empresas

---

# Prioridade Media (Estrutura do sistema)

### Sistema de Permissoes

#### Admin

* Gerencia empresas
* Gerencia usuarios
* Acesso total

#### Profissional N1 (Responsavel)

* Pode cadastrar pacientes
* Pode gerenciar profissionais N2
* Pode visualizar todos os atendimentos da equipe

#### Profissional N2 (Executante / AT)

* Registra atendimentos
* Visualiza apenas seus atendimentos

---

### Estrutura de Equipes

* Permitir que profissionais N1 tenham varios profissionais N2
* Permitir que profissionais N2 participem de multiplas equipes
* Garantir que cada equipe veja apenas os dados de seus pacientes

---

### Estrutura de Atendimentos

Implementar modelo real de atendimento:

* Check-in
* Check-out
* Calculo da duracao do atendimento

Tambem implementar:

* Rotina de atendimentos programados
* Registro completo do historico de atendimentos

---

### Cadastros

* Criar cadastro real de pacientes
* Criar cadastro real de profissionais (ATs)
* Vincular pacientes a equipes

---

### Historico e Consulta

Permitir filtros por:

* Paciente
* Profissional
* Data
* Empresa

Tambem implementar:

* Botao de sincronizacao manual
* Painel administrativo

---

# Prioridade Baixa (Melhorias e escalabilidade)

### Experiencia do Usuario

* Transformar aplicacao em PWA instalavel
* Melhorar layout visual
* Otimizar experiencia mobile

---

### Seguranca e Validacao

* Validar distancia do local esperado do atendimento
* Melhorar precisao da geolocalizacao
* Marcar registros suspeitos (possivel fraude)

---

### Analise e Gestao

* Criar relatorios de atendimentos
* Criar metricas de produtividade
* Exportar dados

---

# Futuro (Evolucao do produto)

* Aplicativo mobile nativo
* Notificacoes de atendimentos
* Agenda integrada
* Integracao com sistemas externos
* Dashboard de gestao para clinicas

---

# Atualizacao de Status

## Concluido em 2026-03-12

* Botao de sincronizacao manual implementado
* Painel administrativo inicial implementado
* Status visuais de sincronizacao (`pending`, `syncing`, `synced`, `error`) implementados
* Protecao contra tela branca total adicionada na navegacao

## Ainda pendente

* Validar sincronizacao offline em producao
* Melhorar deteccao de retorno de internet
* Garantir consistencia do fluxo de check-out no modelo de dados remoto
* Implementar autenticacao, multiempresa e cadastros reais
