# STATUS E PLANEJAMENTO DO PROJETO

## Plataforma de Blog White-Label (SaaS)

**Versão:** 1.0\
**Última atualização:** 2026-03-02\
**Fase atual:** 🔴 Pré-desenvolvimento (Planejamento Estratégico concluído)

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

### 🔵 FASE 0 — Preparação do Ambiente
> **Status:** ❌ Não iniciada

- [ ] Inicializar repositório Git
- [ ] Configurar monorepo (Turborepo ou similar)
- [ ] Configurar ESLint + Prettier
- [ ] Configurar TypeScript
- [ ] Configurar variáveis de ambiente (.env)
- [ ] Criar estrutura de diretórios (`apps/`, `packages/`)
- [ ] Configurar CI/CD básico (opcional nesta fase)

---

### 🟢 SPRINT 1 — Fundação Multi-Tenant
> **Status:** ❌ Não iniciada | **Prioridade:** Alta

#### 1.1 Banco de Dados
- [ ] Configurar PostgreSQL (Neon)
- [ ] Configurar Prisma no pacote `packages/db`
- [ ] Criar schema das entidades principais:
  - [ ] Agency (Agência)
  - [ ] Tenant
  - [ ] User (Usuário)
  - [ ] Membership (Associação)
- [ ] Criar migrações iniciais
- [ ] Seed de dados para desenvolvimento

#### 1.2 Isolamento Multi-Tenant
- [ ] Implementar middleware de resolução de tenant (Host header)
- [ ] Resolver por subdomínio
- [ ] Resolver por domínio personalizado
- [ ] Garantir filtragem por `tenantId` em todas as queries
- [ ] Testar isolamento entre tenants

#### 1.3 Autenticação
- [ ] Implementar registro de usuário
- [ ] Implementar login (JWT)
- [ ] Hash de senha com bcrypt
- [ ] Refresh token
- [ ] Logout / invalidação de token

#### 1.4 RBAC (Controle de Acesso)
- [ ] Definir papéis: SuperAdmin, AgencyOwner, AgencyMember, TenantAdmin, TenantEditor
- [ ] Implementar middleware de autorização
- [ ] Validar permissões por endpoint
- [ ] Testes de RBAC

#### ✅ Critérios de Pronto (Sprint 1)
- [ ] Isolamento de tenant validado
- [ ] Autenticação funcional
- [ ] RBAC implementado e testado
- [ ] Documentação atualizada

---

### 🟡 SPRINT 2 — Motor de Publicação
> **Status:** ❌ Não iniciada | **Prioridade:** Alta

#### 2.1 Schema de Conteúdo
- [ ] Criar entidades no Prisma:
  - [ ] Post
  - [ ] Category (Categoria)
  - [ ] Tag
  - [ ] Media (Mídia)
- [ ] Migrações de conteúdo

#### 2.2 CRUD de Posts
- [ ] Criar post (rascunho/publicado)
- [ ] Editar post
- [ ] Excluir post
- [ ] Listar posts (com paginação)
- [ ] Agendar publicação
- [ ] Sistema de slugs únicos por tenant

#### 2.3 Categorias e Tags
- [ ] CRUD de categorias
- [ ] CRUD de tags
- [ ] Associação post ↔ categorias
- [ ] Associação post ↔ tags

#### 2.4 Upload de Mídia
- [ ] Configurar Cloudflare R2
- [ ] Endpoint de upload
- [ ] Validação de tipo/tamanho
- [ ] Otimização de imagens

#### 2.5 Frontend Público (SSR)
- [ ] Configurar `apps/web-public`
- [ ] Homepage (placeholder)
- [ ] Página individual de post
- [ ] Listagem por categoria
- [ ] Listagem por tag

#### 2.6 SEO
- [ ] Meta tags editáveis por post (title, description)
- [ ] Metadados OpenGraph
- [ ] Marcação Schema.org Article
- [ ] Sitemap.xml dinâmico
- [ ] Feed RSS
- [ ] Validar Lighthouse > 90

#### ✅ Critérios de Pronto (Sprint 2)
- [ ] CRUD de posts completo e testado
- [ ] Slugs únicos por tenant validado
- [ ] Sitemap e RSS válidos
- [ ] SEO validado
- [ ] Documentação atualizada

---

### 🟠 SPRINT 3 — Motor de Temas
> **Status:** ❌ Não iniciada | **Prioridade:** Média

#### 3.1 Schema de Tokens
- [ ] Criar entidade ThemeRevision no Prisma
- [ ] Definir schema JSON de tokens (cores, fontes, tipografia, layout)
- [ ] Validação de tokens com Zod

#### 3.2 Injeção de Variáveis CSS
- [ ] Carregar ThemeRevision ativo
- [ ] Converter tokens → variáveis CSS
- [ ] Injetar no `:root`
- [ ] Aplicar em componentes da UI

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
- [ ] Tokens validados via Zod
- [ ] Layout estável em todas as configurações
- [ ] Preview funcional
- [ ] Documentação atualizada

---

### 🔴 SPRINT 4 — Construtor de Homepage
> **Status:** ❌ Não iniciada | **Prioridade:** Média

#### 4.1 Configuração de Seções
- [ ] Criar entidade HomeRevision no Prisma
- [ ] Schema JSON de seções (hero, últimos posts, categoria, newsletter, destaques)
- [ ] Validação com Zod

#### 4.2 Editor de Homepage
- [ ] Adicionar/remover seções
- [ ] Reordenar seções (drag-and-drop)
- [ ] Configurar quantidade de posts por seção
- [ ] Filtrar por categoria
- [ ] Escolher tipo de layout por seção

#### 4.3 Renderização
- [ ] Componentes de UI para cada tipo de seção
- [ ] Busca de conteúdo conforme regra da seção
- [ ] Renderização dinâmica no frontend público

#### 4.4 Controles
- [ ] Aplicação de limites de plano (nº de seções)
- [ ] Rollback de versão de homepage
- [ ] Versionamento de configurações

#### ✅ Critérios de Pronto (Sprint 4)
- [ ] Seções configuráveis e renderizando
- [ ] Limites de plano aplicados
- [ ] Rollback funcional
- [ ] Documentação atualizada

---

### 🟣 SPRINT 5 — Camada de Agência
> **Status:** ❌ Não iniciada | **Prioridade:** Média-Baixa

#### 5.1 Gestão Multi-Tenant
- [ ] Criação de tenants por agência
- [ ] Listagem e gerenciamento de tenants
- [ ] Limites por plano (nº de tenants)

#### 5.2 Gestão de Membros
- [ ] Convite de membros
- [ ] Atribuição de papéis
- [ ] Remoção de membros

#### 5.3 White-Label
- [ ] Branding personalizado do painel (logo, cores)
- [ ] Domínio personalizado do painel
- [ ] Remover referências à plataforma
- [ ] Verificação de domínio (DNS)

#### ✅ Critérios de Pronto (Sprint 5)
- [ ] Fluxo multi-tenant completo
- [ ] White-label funcional
- [ ] Documentação atualizada

---

### ⚫ SPRINT 6 — Cobrança e Hardening
> **Status:** ❌ Não iniciada | **Prioridade:** Baixa (final)

#### 6.1 Integração Stripe
- [ ] Criar Stripe Customer por Agência
- [ ] Stripe Subscription vinculado à Agência
- [ ] Criar entidade Subscription no Prisma
- [ ] Checkout / portal de pagamento

#### 6.2 Webhooks
- [ ] Endpoint de webhook do Stripe
- [ ] Atualizar status da assinatura via webhook
- [ ] Atualizar PlanTier automaticamente
- [ ] Tratar eventos de upgrade/downgrade

#### 6.3 Aplicação de Planos
- [ ] Verificação de plano em cada ação privilegiada
- [ ] Bloquear funcionalidades fora do plano
- [ ] Mensagens de upgrade

#### 6.4 Segurança e Hardening
- [ ] Rate limiting em endpoints de auth e conteúdo
- [ ] Sanitização de HTML
- [ ] Proteção contra XSS
- [ ] Validação de entrada completa (Zod)
- [ ] HTTPS obrigatório

#### 6.5 Observabilidade
- [ ] Logging estruturado
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
| 0 | Preparação do Ambiente | 7 | 0 | ❌ Não iniciada |
| 1 | Fundação Multi-Tenant | 18 | 0 | ❌ Não iniciada |
| 2 | Motor de Publicação | 25 | 0 | ❌ Não iniciada |
| 3 | Motor de Temas | 14 | 0 | ❌ Não iniciada |
| 4 | Construtor de Homepage | 12 | 0 | ❌ Não iniciada |
| 5 | Camada de Agência | 10 | 0 | ❌ Não iniciada |
| 6 | Cobrança e Hardening | 20 | 0 | ❌ Não iniciada |
| **TOTAL** | | **106** | **0** | **0%** |

---

## Notas para Agentes

> **Contexto atual:** O projeto está na fase de **pré-desenvolvimento**. Toda a documentação estratégica, de produto, técnica e de negócio está concluída. Nenhum código foi escrito ainda. O próximo passo é iniciar a **Fase 0 (Preparação do Ambiente)** seguida pela **Sprint 1 (Fundação Multi-Tenant)**.

> **Como usar este documento:** Marque os itens com `[x]` conforme forem concluídos e `[/]` para itens em progresso. Atualize a tabela de Resumo de Progresso e a data de "Última atualização" no topo do documento.

> **Definição de Pronto:** Consulte [DoD_v1.md](./DoD_v1.md) para critérios detalhados de quando uma funcionalidade está de fato "pronta".

> **Dependências entre sprints:** Cada sprint depende da anterior. A ordem sugerida é: 0 → 1 → 2 → 3 → 4 → 5 → 6. Porém, partes da Sprint 3 e 4 podem ser desenvolvidas em paralelo após a Sprint 2.
