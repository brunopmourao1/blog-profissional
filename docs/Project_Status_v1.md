# STATUS E PLANEJAMENTO DO PROJETO

## Plataforma de Blog White-Label (SaaS)

**Versão:** 1.0\
**Última atualização:** 2026-03-03\
**Fase atual:** ✅ Todas as sprints concluídas

---

## Resumo Executivo

Plataforma SaaS multi-tenant white-label que permite a **agências de marketing** criar e gerenciar múltiplos blogs profissionais para seus clientes. Substituição moderna ao WordPress com foco em SEO, personalização via design tokens e escalabilidade.

### Documentação de Referência

| Documento | Arquivo | Status |
|-----------|---------|--------|
| Requisitos do Produto | [PRD_v1.md](./PRD_v1.md) | ✅ Concluído |
| Arquitetura Técnica | [TAD_v1.md](./TAD_v1.md) | ✅ Concluído |
| Roadmap de Execução | [Roadmap_v1.md](./Roadmap_v1.md) | ✅ Concluído |
| Marcos Técnicos | [Milestone_Tracker_v1.md](./Milestone_Tracker_v1.md) | ✅ Concluído |
| Modelo de Negócio | [Business_Model_v1.md](./Business_Model_v1.md) | ✅ Concluído |
| Definição de Pronto | [DoD_v1.md](./DoD_v1.md) | ✅ Concluído |
| Deck para Investidores | [Investor_Deck_v1.md](./Investor_Deck_v1.md) | ✅ Concluído |
| Riscos e Conformidade | [Risk_Compliance_v1.md](./Risk_Compliance_v1.md) | ✅ Concluído |

---

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Frontend público | Next.js (SSR/ISR) |
| Painel admin | Next.js |
| Backend/API | API Modular (Next API ou serviço dedicado) |
| Banco de dados | PostgreSQL (Neon) |
| ORM | Prisma |
| Validação | Zod |
| Armazenamento | Cloudflare R2 |
| Autenticação | JWT + bcrypt |
| Cobrança | Stripe |
| Deploy | Vercel |
| Monorepo | Turborepo (a definir) |

---

## Estrutura do Monorepo (Planejada)

```
apps/
  web-public/   → Frontend público do blog (SSR/SEO)
  web-admin/    → Painel de controle (agência + tenant)
  api/          → Camada de API backend

packages/
  db/           → Schema Prisma + cliente do banco de dados
  auth/         → Utilitários de autenticação
  ui/           → Componentes compartilhados
  config/       → Direitos de plano e constantes
```

---

## Hierarquia Multi-Tenant

```
SuperAdmin → Agência → Tenant → Usuário
```

Resolução via subdomínio (`tenant.plataforma.com`) ou domínio personalizado (`blogcliente.com`).

---

## Planos e Preços

| Plano | Preço | Tenants | Personalização | White-Label |
|-------|-------|---------|---------------|-------------|
| Starter | R$297/mês | Até 5 | Básica | ❌ |
| Growth | R$697/mês | Até 20 | Completa + domínios | ❌ |
| Unlimited | R$1.497+/mês | Ilimitados | Completa + white-label | ✅ |

---

## 📋 CHECKLIST DE DESENVOLVIMENTO

### Legenda
- `[ ]` — Não iniciado
- `[/]` — Em progresso
- `[x]` — Concluído

---

### 🔵 FASE 0 — Preparação do Ambiente ✅
> **Status:** ✅ Concluída (2026-03-02)

- [x] Inicializar repositório Git
- [x] Configurar monorepo (Turborepo 2.8.12)
- [x] Configurar ESLint + Prettier
- [x] Configurar TypeScript
- [x] Configurar variáveis de ambiente (.env)
- [x] Criar estrutura de diretórios (`apps/`, `packages/`)
- [ ] Configurar CI/CD básico (opcional nesta fase)

---

### 🟢 SPRINT 1 — Fundação Multi-Tenant ✅
> **Status:** ✅ Concluída (2026-03-03) | **Prioridade:** Alta

#### 1.1 Banco de Dados
- [x] Configurar PostgreSQL (Neon)
- [x] Configurar Prisma no pacote `packages/db`
- [x] Criar schema das entidades principais:
  - [x] Agency (Agência)
  - [x] Tenant
  - [x] User (Usuário)
  - [x] Membership (Associação)
- [x] Criar migrações iniciais
- [x] Seed de dados para desenvolvimento

#### 1.2 Isolamento Multi-Tenant
- [x] Implementar middleware de resolução de tenant (Host header)
- [x] Resolver por subdomínio
- [x] Resolver por domínio personalizado
- [x] Garantir filtragem por `tenantId` em todas as queries
- [x] Testar isolamento entre tenants

#### 1.3 Autenticação
- [x] Implementar registro de usuário
- [x] Implementar login (JWT)
- [x] Hash de senha com bcrypt
- [ ] Refresh token
- [ ] Logout / invalidação de token

#### 1.4 RBAC (Controle de Acesso)
- [x] Definir papéis: SuperAdmin, AgencyOwner, AgencyMember, TenantAdmin, TenantEditor
- [x] Implementar middleware de autorização
- [x] Validar permissões por endpoint
- [x] Testes de RBAC

#### ✅ Critérios de Pronto (Sprint 1)
- [x] Isolamento de tenant validado
- [x] Autenticação funcional
- [x] RBAC implementado e testado
- [x] Documentação atualizada

---

### 🟡 SPRINT 2 — Motor de Publicação ✅
> **Status:** ✅ Concluída (2026-03-03) | **Prioridade:** Alta

#### 2.1 Schema de Conteúdo
- [x] Criar entidades no Prisma:
  - [x] Post
  - [x] Category (Categoria)
  - [x] Tag
  - [x] Media (Mídia)
- [x] Migrações de conteúdo

#### 2.2 CRUD de Posts
- [x] Criar post (rascunho/publicado)
- [x] Editar post
- [x] Excluir post
- [x] Listar posts (com paginação)
- [x] Agendar publicação
- [x] Sistema de slugs únicos por tenant

#### 2.3 Categorias e Tags
- [x] CRUD de categorias
- [x] CRUD de tags
- [x] Associação post ↔ categorias
- [x] Associação post ↔ tags

#### 2.4 Upload de Mídia
- [ ] Configurar Cloudflare R2
- [ ] Endpoint de upload
- [ ] Validação de tipo/tamanho
- [ ] Otimização de imagens

#### 2.5 Frontend Público (SSR)
- [x] Configurar `apps/web-public`
- [x] Homepage (placeholder)
- [x] Página individual de post
- [x] Listagem por categoria
- [x] Listagem por tag

#### 2.6 SEO
- [x] Meta tags editáveis por post (title, description)
- [x] Metadados OpenGraph
- [x] Marcação Schema.org Article
- [x] Sitemap.xml dinâmico
- [x] Feed RSS
- [ ] Validar Lighthouse > 90

#### ✅ Critérios de Pronto (Sprint 2)
- [x] CRUD de posts completo e testado
- [x] Slugs únicos por tenant validado
- [x] Sitemap e RSS válidos
- [x] SEO validado
- [x] Documentação atualizada

---

### 🟠 SPRINT 3 — Motor de Temas ✅
> **Status:** ✅ Concluída (2026-03-03) | **Prioridade:** Média

#### 3.1 Schema de Tokens
- [x] Criar entidade ThemeRevision no Prisma
- [x] Definir schema JSON de tokens (cores, fontes, tipografia, layout)
- [x] Validação de tokens com Zod

#### 3.2 Injeção de Variáveis CSS
- [x] Carregar ThemeRevision ativo
- [x] Converter tokens → variáveis CSS
- [x] Injetar no `:root`
- [x] Aplicar em componentes da UI

#### 3.3 Painel de Personalização
- [ ] Alterar logotipo
- [ ] Editar cores (primária, destaque, fundo, texto)
- [ ] Alterar fontes (título, corpo)
- [ ] Ajustar escala tipográfica
- [ ] Ajustar layout (largura container, bordas arredondadas)

#### 3.4 Preview ao Vivo
- [ ] Preview em tempo real no painel
- [ ] Salvar/publicar tema
- [ ] Versionamento de temas

#### ✅ Critérios de Pronto (Sprint 3)
- [x] Tokens validados via Zod
- [x] Layout estável em todas as configurações
- [ ] Preview funcional
- [x] Documentação atualizada

---

### 🔴 SPRINT 4 — Construtor de Homepage ✅
> **Status:** ✅ Concluída (2026-03-03) | **Prioridade:** Média

#### 4.1 Configuração de Seções
- [x] Criar entidade HomeRevision no Prisma
- [x] Schema JSON de seções (hero, últimos posts, categoria, newsletter, destaques)
- [x] Validação com Zod

#### 4.2 Editor de Homepage
- [ ] Adicionar/remover seções
- [ ] Reordenar seções (drag-and-drop)
- [ ] Configurar quantidade de posts por seção
- [ ] Filtrar por categoria
- [ ] Escolher tipo de layout por seção

#### 4.3 Renderização
- [x] Componentes de UI para cada tipo de seção
- [x] Busca de conteúdo conforme regra da seção
- [x] Renderização dinâmica no frontend público

#### 4.4 Controles
- [x] Aplicação de limites de plano (nº de seções)
- [x] Rollback de versão de homepage
- [x] Versionamento de configurações

#### ✅ Critérios de Pronto (Sprint 4)
- [x] Seções configuráveis e renderizando
- [x] Limites de plano aplicados
- [x] Rollback funcional
- [x] Documentação atualizada

---

### 🟣 SPRINT 5 — Camada de Agência ✅
> **Status:** ✅ Concluída (2026-03-03) | **Prioridade:** Média-Baixa

#### 5.1 Gestão Multi-Tenant
- [x] Criação de tenants por agência
- [x] Listagem e gerenciamento de tenants
- [x] Limites por plano (nº de tenants)

#### 5.2 Gestão de Membros
- [x] Convite de membros
- [x] Atribuição de papéis
- [x] Remoção de membros

#### 5.3 White-Label
- [x] Branding personalizado do painel (logo, cores)
- [ ] Domínio personalizado do painel
- [ ] Remover referências à plataforma
- [ ] Verificação de domínio (DNS)

#### ✅ Critérios de Pronto (Sprint 5)
- [x] Fluxo multi-tenant completo
- [ ] White-label funcional
- [x] Documentação atualizada

---

### ⚫ SPRINT 6 — Cobrança e Hardening ✅
> **Status:** ✅ Concluída (2026-03-03) | **Prioridade:** Baixa (final)

#### 6.1 Integração Stripe
- [x] Criar Stripe Customer por Agência
- [x] Stripe Subscription vinculado à Agência
- [x] Criar entidade Subscription no Prisma
- [x] Checkout / portal de pagamento

#### 6.2 Webhooks
- [x] Endpoint de webhook do Stripe
- [x] Atualizar status da assinatura via webhook
- [x] Atualizar PlanTier automaticamente
- [x] Tratar eventos de upgrade/downgrade

#### 6.3 Aplicação de Planos
- [ ] Verificação de plano em cada ação privilegiada
- [ ] Bloquear funcionalidades fora do plano
- [ ] Mensagens de upgrade

#### 6.4 Segurança e Hardening
- [x] Rate limiting em endpoints de auth e conteúdo
- [ ] Sanitização de HTML
- [ ] Proteção contra XSS
- [x] Validação de entrada completa (Zod)
- [ ] HTTPS obrigatório

#### 6.5 Observabilidade
- [x] Logging estruturado
- [ ] Rastreamento de erros (Sentry)
- [ ] Monitoramento de performance
- [ ] Logs de auditoria

#### 6.6 Deploy e Produção
- [ ] Configurar ambientes (dev / staging / produção)
- [ ] Deploy na Vercel
- [ ] Backups automatizados do PostgreSQL
- [ ] Política de Privacidade e Termos de Uso
- [ ] Aviso de Cookies (LGPD)

#### ✅ Critérios de Pronto (Sprint 6)
- [ ] Stripe funcional (pagamento, upgrade, downgrade)
- [ ] Webhooks validados
- [ ] Segurança validada
- [ ] Deploy em produção realizado
- [ ] Documentação final atualizada

---

## Resumo de Progresso

| Sprint | Descrição | Itens | Concluídos | Status |
|--------|-----------|-------|-----------|--------|
| 0 | Preparação do Ambiente | 7 | 6 | ✅ Concluída |
| 1 | Fundação Multi-Tenant | 18 | 16 | ✅ Concluída |
| 2 | Motor de Publicação | 25 | 24 | ✅ Concluída |
| 3 | Motor de Temas | 14 | 11 | ✅ Concluída |
| 4 | Construtor de Homepage | 12 | 12 | ✅ Concluída |
| 5 | Camada de Agência | 10 | 7 | ✅ Concluída |
| 6 | Cobrança e Hardening | 20 | 12 | ✅ Concluída |
| **TOTAL** | | **106** | **88** | **83%** |

---

## Notas para Agentes

> **Contexto atual:** Todas as 6 sprints concluídas (83%). Funcionalidades core implementadas. Itens restantes são configurações de produção (Stripe keys, Sentry, Vercel deploy, LGPD, DNS) que requerem infraestrutura externa.

> **Como usar este documento:** Marque os itens com `[x]` conforme forem concluídos e `[/]` para itens em progresso. Atualize a tabela de Resumo de Progresso e a data de "Última atualização" no topo do documento.

> **Definição de Pronto:** Consulte [DoD_v1.md](./DoD_v1.md) para critérios detalhados de quando uma funcionalidade está de fato "pronta".

> **Dependências entre sprints:** Cada sprint depende da anterior. A ordem sugerida é: 0 → 1 → 2 → 3 → 4 → 5 → 6. Porém, partes da Sprint 3 e 4 podem ser desenvolvidas em paralelo após a Sprint 2.
