# DOCUMENTO DE REQUISITOS DO PRODUTO

## Plataforma de Blog White-Label (SaaS)

**Versão:** 1.0\
**Status:** Planejamento Estratégico\
**Data:** 2026-02-26

------------------------------------------------------------------------

# 1. Visão do Produto

## 1.1 Objetivo

Desenvolver uma plataforma SaaS white-label que permita às agências criar e
gerenciar múltiplos blogs profissionais para seus clientes, com total autonomia
de personalização visual, base sólida de SEO e arquitetura escalável.

## 1.2 Proposta de Valor

-   Arquitetura moderna, leve e escalável\
-   SEO técnico integrado\
-   Personalização visual via design tokens controlados\
-   Estrutura multi-tenant com isolamento seguro\
-   Capacidade total de white-label para agências

## 1.3 Posicionamento

Infraestrutura editorial invisível para agências que querem oferecer
blogs modernos sem depender do WordPress.

------------------------------------------------------------------------

# 2. Declaração do Problema

As agências enfrentam: - Ecossistemas WordPress complexos e vulneráveis\
- Construtores de sites limitados\
- Plataformas sem controle total

Existe a necessidade de: - Gestão multi-cliente\
- Personalização visual com controle\
- Performance e escalabilidade

------------------------------------------------------------------------

# 3. Público-Alvo

## 3.1 Cliente Direto

Agências de marketing, branding e publicidade.

## 3.2 Usuários Finais

Clientes das agências: - Profissionais - Academias - Escritores - Especialistas
técnicos - Criadores de conteúdo

------------------------------------------------------------------------

# 4. Escopo do MVP (v1)

## 4.1 Funcionalidades do Site Público

-   Homepage dinâmica (seções configuráveis)
-   Página individual de post
-   Listagem por categoria e tag
-   Sitemap dinâmico
-   Feed RSS
-   SEO editável por post
-   Metadados OpenGraph
-   Marcação Schema.org Article

## 4.2 Funcionalidades do Painel

### Gestão de Conteúdo

-   Criar, editar, excluir posts
-   Agendar publicações
-   Gerenciar categorias e tags
-   Upload de mídia

### Motor de Temas

-   Alterar logotipo
-   Editar cores primária e de destaque
-   Editar cores de fundo e texto
-   Alterar fontes de título e corpo
-   Ajustar escala tipográfica
-   Ajustar configurações de layout (largura do container, bordas arredondadas)

### Construtor de Homepage

-   Adicionar/remover seções
-   Reordenar seções
-   Definir quantidade de posts por seção
-   Filtrar por categoria
-   Escolher tipo de layout

## 4.3 Funcionalidades White-Label

-   Branding personalizado do painel
-   Domínio personalizado do painel
-   Remover referências à plataforma

------------------------------------------------------------------------

# 5. Arquitetura Técnica

## 5.1 Modelo

Arquitetura multi-tenant com banco de dados compartilhado usando isolamento
de tenant via tenantId.

Hierarquia: SuperAdmin → Agência → Tenant → Usuário

## 5.2 Stack

Frontend: Next.js\
Backend: API Modular (Next API ou serviço dedicado)\
Banco de Dados: PostgreSQL\
Armazenamento: Cloudflare R2\
Cobrança: Stripe

------------------------------------------------------------------------

# 6. Entidades Principais

-   Agência
-   Tenant
-   Usuário
-   Associação (Membership)
-   Post
-   Categoria
-   Tag
-   Mídia
-   ThemeRevision (Revisão de Tema)
-   HomeRevision (Revisão da Homepage)
-   SeoConfig (Configuração SEO)
-   Assinatura (Subscription)

------------------------------------------------------------------------

# 7. Motor de Temas

-   Baseado em design tokens estruturados (JSON)
-   Tokens convertidos em variáveis CSS dinamicamente
-   Personalização controlada (CSS customizado não permitido)

------------------------------------------------------------------------

# 8. Construtor de Homepage

Configuração baseada em seções: - hero - últimos posts - categoria - newsletter -
destaques

Armazenado como configuração JSON versionada.

------------------------------------------------------------------------

# 9. Planos e Direitos

## Gratuito

-   Apenas subdomínio
-   Limite de 20 posts
-   3 seções na homepage
-   Personalização limitada

## Pro

-   Domínio personalizado
-   Posts ilimitados
-   Até 6 seções na homepage
-   Personalização completa de tokens

## Agência

-   Múltiplos tenants
-   Seções ilimitadas na homepage
-   Painel white-label
-   Gestão multi-usuário

Aplicação obrigatória no backend.

------------------------------------------------------------------------

# 10. Requisitos de Segurança

-   Hash de senha (bcrypt)
-   Validação de entrada (Zod)
-   Sanitização de HTML
-   Limitação de requisições (Rate limiting)
-   Proteção contra XSS
-   Verificação de domínio
-   Controle de acesso baseado em papéis (RBAC)

------------------------------------------------------------------------

# 11. Métricas de Sucesso

-   Agências ativas
-   Tenants ativos
-   Receita recorrente mensal (MRR)
-   Taxa de cancelamento (churn)
-   Crescimento de tráfego orgânico por tenant
-   Performance Lighthouse > 90

------------------------------------------------------------------------

# 12. Roadmap

## Fase 1

Core multi-tenant + motor de publicação + SEO

## Fase 2

Motor de Temas + preview

## Fase 3

Construtor de Homepage

## Fase 4

Cobrança + aplicação de planos

## Fase 5

Camada completa de white-label para agências

------------------------------------------------------------------------

# 13. Fora do Escopo (v1)

-   Edição de CSS customizado
-   Marketplace de plugins
-   E-commerce
-   Sistema de comunidade integrado
-   Sistema de comentários nativo

------------------------------------------------------------------------

# 14. Decisões Estratégicas

Modelo de personalização: - Design tokens controlados - Construtor de homepage
baseado em seções - Sem acesso irrestrito a CSS

------------------------------------------------------------------------
