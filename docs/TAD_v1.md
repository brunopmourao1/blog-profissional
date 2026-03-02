# DOCUMENTO DE ARQUITETURA TÉCNICA (TAD)

## Plataforma de Blog White-Label (SaaS)

**Versão:** 1.0\
**Status:** Definição de Arquitetura\
**Data:** 2026-02-26

------------------------------------------------------------------------

# 1. Visão Geral da Arquitetura

## 1.1 Estilo Arquitetural

SaaS multi-tenant com banco de dados PostgreSQL compartilhado usando isolamento
de tenant via tenantId.

Hierarquia: SuperAdmin → Agência → Tenant → Usuário

## 1.2 Princípios Fundamentais

-   Escalabilidade em primeiro lugar
-   Isolamento de tenant
-   Estratégia de renderização SEO-first
-   Personalização controlada (apenas design tokens)
-   Aplicação de limites de plano no backend
-   Estrutura modular e extensível

------------------------------------------------------------------------

# 2. Componentes do Sistema

## 2.1 Aplicações

apps/
- web-public → Frontend público do blog (SSR/otimizado para SEO)
- web-admin → Painel de controle (agência + tenant)
- api → Camada de API backend

packages/
- db → Schema Prisma + cliente do banco de dados
- auth → Utilitários de autenticação
- ui → Componentes compartilhados
- config → Direitos de plano e constantes

------------------------------------------------------------------------

# 3. Estratégia Multi-Tenant

## 3.1 Resolução de Tenant

Resolução via:
- Subdomínio (tenant.plataforma.com)
- Domínio personalizado (blogcliente.com)

Fluxo:
1. Middleware lê o header Host
2. Consulta Tenant por subdomínio ou customDomain
3. Cache da configuração do tenant
4. Carrega ThemeRevision + HomeRevision ativos

## 3.2 Isolamento de Dados

Todas as tabelas de conteúdo incluem tenantId. Toda consulta deve filtrar
por tenantId. Consultas entre tenants não são permitidas.

------------------------------------------------------------------------

# 4. Estratégia de Renderização

## 4.1 Site Público

Modo de Renderização:
- SSR para rotas dinâmicas
- ISR opcional para tenants com alto tráfego

Funcionalidades de SEO:
- Meta tags por post
- Sitemap.xml dinâmico
- Feed RSS
- Metadados OpenGraph
- Marcação Schema.org Article

------------------------------------------------------------------------

# 5. Arquitetura do Motor de Temas

## 5.1 Armazenamento de Tokens

ThemeRevision.tokens armazenados como JSON:
- cores
- fontes
- tipografia
- layout

## 5.2 Injeção em Tempo de Execução

1.  Carregar ThemeRevision ativo
2.  Converter tokens em variáveis CSS
3.  Injetar no :root
4.  Aplicar em todos os componentes da UI

Validação via schema (Zod) para prevenir estruturas inválidas.

------------------------------------------------------------------------

# 6. Arquitetura do Construtor de Homepage

## 6.1 Modelo Baseado em Seções

HomeRevision.config armazenado como array JSON de seções:
- hero
- últimos posts
- categoria
- newsletter
- destaques

## 6.2 Fluxo de Renderização

1.  Carregar HomeRevision ativo
2.  Iterar pelas seções
3.  Buscar conteúdo conforme regra da seção
4.  Renderizar componente UI mapeado

Aplicação de limites de plano feita antes de salvar a configuração.

------------------------------------------------------------------------

# 7. Arquitetura de Segurança

-   Hash de senha com bcrypt
-   Autenticação baseada em JWT
-   Controle de acesso baseado em papéis (RBAC)
-   Limitação de requisições em endpoints de autenticação e conteúdo
-   Sanitização de HTML antes da renderização
-   Verificação de domínio (checagem DNS antes da ativação)
-   Validação de entrada via Zod
-   Aplicação de plano no nível da API

------------------------------------------------------------------------

# 8. Arquitetura de Cobrança

Integração com Stripe:
- Stripe Customer por Agência
- Stripe Subscription vinculado à Agência
- Webhooks para atualizar status da Assinatura
- PlanTier atualizado automaticamente

Verificação de plano feita em cada ação privilegiada.

------------------------------------------------------------------------

# 9. Infraestrutura

Frontend:
- Deploy na Vercel

Banco de Dados:
- PostgreSQL (Neon)

Armazenamento de Objetos:
- Cloudflare R2

Gestão de Ambientes:
- Ambientes separados (dev / staging / produção)

------------------------------------------------------------------------

# 10. Observabilidade

-   Logging estruturado
-   Rastreamento de erros (Sentry recomendado)
-   Monitoramento de performance
-   Monitoramento de consultas ao banco
-   Logs de auditoria para ações críticas

------------------------------------------------------------------------

# 11. Estratégia de Backup

-   Backups automatizados do PostgreSQL
-   Redundância no armazenamento R2
-   Plano de rollback de migrações
-   Revisões versionadas de Tema e Homepage

------------------------------------------------------------------------

# 12. Plano de Escalabilidade

Fase 1:
- Multi-tenant com banco compartilhado

Fase 2:
- Réplicas de leitura para tenants pesados

Fase 3:
- Sharding opcional de banco por Agência

Cache CDN para conteúdo público.

------------------------------------------------------------------------

# 13. Riscos e Mitigação

Risco: Vazamento de dados entre tenants\
Mitigação: Filtragem rigorosa por tenantId + guard no middleware

Risco: Degradação de performance com tenants grandes\
Mitigação: Indexação + paginação + cache

Risco: Personalização excessiva quebrando consistência da UI\
Mitigação: Whitelist de tokens + restrições de template

------------------------------------------------------------------------

# 14. Extensões Futuras da Arquitetura

-   API headless para aplicativos móveis
-   Sistema de plugins (controlado)
-   Microserviço de comentários
-   Suporte multi-idioma
-   Camada de cache na edge

------------------------------------------------------------------------

# 15. Aprovação da Arquitetura

Este documento define a fundação técnica para a Plataforma de Blog
White-Label v1.

Todo desenvolvimento deve aderir a esta arquitetura, a menos que
formalmente revisado.
