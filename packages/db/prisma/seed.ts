import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding database...\n");

    // =========================================================
    // 1. Agency
    // =========================================================
    const agency = await prisma.agency.upsert({
        where: { slug: "agencia-demo" },
        update: {},
        create: {
            name: "Agência Demo",
            slug: "agencia-demo",
            planTier: "GROWTH",
        },
    });
    console.log(`✅ Agency: ${agency.name} (${agency.id})`);

    // =========================================================
    // 2. User
    // =========================================================
    const user = await prisma.user.upsert({
        where: { email: "admin@demo.com" },
        update: {},
        create: {
            name: "Admin Demo",
            email: "admin@demo.com",
            passwordHash: "$2b$10$placeholder-hash-for-demo-only",
        },
    });
    console.log(`✅ User: ${user.name} (${user.email})`);

    // =========================================================
    // 3. Membership (AGENCY_OWNER)
    // =========================================================
    const membership = await prisma.membership.upsert({
        where: {
            userId_agencyId: { userId: user.id, agencyId: agency.id },
        },
        update: {},
        create: {
            userId: user.id,
            agencyId: agency.id,
            role: "AGENCY_OWNER",
        },
    });
    console.log(`✅ Membership: ${membership.role}`);

    // =========================================================
    // 4. Tenants
    // =========================================================
    const tenant1 = await prisma.tenant.upsert({
        where: { slug: "tech-insights" },
        update: {},
        create: {
            name: "Tech Insights",
            slug: "tech-insights",
            agencyId: agency.id,
            active: true,
        },
    });

    const tenant2 = await prisma.tenant.upsert({
        where: { slug: "vida-saudavel" },
        update: {},
        create: {
            name: "Vida Saudável",
            slug: "vida-saudavel",
            agencyId: agency.id,
            active: true,
        },
    });
    console.log(`✅ Tenants: ${tenant1.name}, ${tenant2.name}`);

    // =========================================================
    // 5. Categories
    // =========================================================
    const categories = await Promise.all([
        prisma.category.upsert({
            where: { tenantId_slug: { tenantId: tenant1.id, slug: "programacao" } },
            update: {},
            create: { name: "Programação", slug: "programacao", tenantId: tenant1.id },
        }),
        prisma.category.upsert({
            where: { tenantId_slug: { tenantId: tenant1.id, slug: "inteligencia-artificial" } },
            update: {},
            create: { name: "Inteligência Artificial", slug: "inteligencia-artificial", tenantId: tenant1.id },
        }),
        prisma.category.upsert({
            where: { tenantId_slug: { tenantId: tenant1.id, slug: "devops" } },
            update: {},
            create: { name: "DevOps", slug: "devops", tenantId: tenant1.id },
        }),
        prisma.category.upsert({
            where: { tenantId_slug: { tenantId: tenant2.id, slug: "nutricao" } },
            update: {},
            create: { name: "Nutrição", slug: "nutricao", tenantId: tenant2.id },
        }),
        prisma.category.upsert({
            where: { tenantId_slug: { tenantId: tenant2.id, slug: "exercicios" } },
            update: {},
            create: { name: "Exercícios", slug: "exercicios", tenantId: tenant2.id },
        }),
    ]);
    console.log(`✅ Categories: ${categories.length} created`);

    // =========================================================
    // 6. Tags
    // =========================================================
    const tags = await Promise.all([
        prisma.tag.upsert({
            where: { tenantId_slug: { tenantId: tenant1.id, slug: "typescript" } },
            update: {},
            create: { name: "TypeScript", slug: "typescript", tenantId: tenant1.id },
        }),
        prisma.tag.upsert({
            where: { tenantId_slug: { tenantId: tenant1.id, slug: "react" } },
            update: {},
            create: { name: "React", slug: "react", tenantId: tenant1.id },
        }),
        prisma.tag.upsert({
            where: { tenantId_slug: { tenantId: tenant1.id, slug: "nextjs" } },
            update: {},
            create: { name: "Next.js", slug: "nextjs", tenantId: tenant1.id },
        }),
        prisma.tag.upsert({
            where: { tenantId_slug: { tenantId: tenant1.id, slug: "prisma" } },
            update: {},
            create: { name: "Prisma", slug: "prisma", tenantId: tenant1.id },
        }),
        prisma.tag.upsert({
            where: { tenantId_slug: { tenantId: tenant2.id, slug: "dieta" } },
            update: {},
            create: { name: "Dieta", slug: "dieta", tenantId: tenant2.id },
        }),
        prisma.tag.upsert({
            where: { tenantId_slug: { tenantId: tenant2.id, slug: "bem-estar" } },
            update: {},
            create: { name: "Bem-estar", slug: "bem-estar", tenantId: tenant2.id },
        }),
    ]);
    console.log(`✅ Tags: ${tags.length} created`);

    // =========================================================
    // 7. Posts — Tech Insights
    // =========================================================
    const techPosts = [
        {
            title: "TypeScript 6.0: O que mudou e como migrar",
            slug: "typescript-6-o-que-mudou",
            excerpt: "Um guia completo sobre as novidades do TypeScript 6.0, incluindo os novos tipos utilitários e melhorias de performance.",
            content: `<h2>Introdução</h2><p>O TypeScript 6.0 trouxe mudanças significativas que impactam diretamente a forma como escrevemos código. Neste artigo, vamos explorar as principais novidades.</p><h2>Novos Tipos Utilitários</h2><p>A versão 6.0 introduziu <code>Awaited&lt;T&gt;</code> melhorado, <code>NoInfer&lt;T&gt;</code>, e inferência de tipos mais inteligente para generics.</p><h2>Performance</h2><p>O compilador agora é até 40% mais rápido em projetos grandes, graças ao novo engine de type-checking incremental.</p><h2>Como migrar</h2><p>A migração é simples: atualize o <code>tsconfig.json</code>, rode <code>tsc --strict</code>, e corrija os erros apontados. A maioria dos projetos não terá breaking changes.</p>`,
            categoryIndex: 0,
            tagIndices: [0, 2],
        },
        {
            title: "Construindo APIs REST com Next.js 16 e Prisma",
            slug: "apis-rest-nextjs-16-prisma",
            excerpt: "Aprenda a criar APIs robustas usando Next.js 16 Route Handlers e Prisma ORM com PostgreSQL.",
            content: `<h2>Stack moderna</h2><p>A combinação de Next.js 16 com Prisma oferece uma experiência de desenvolvimento excepcional para APIs REST.</p><h2>Setup do Prisma</h2><p>Configure o Prisma com PostgreSQL, defina seus modelos, e rode as migrations. O Prisma gera automaticamente um client type-safe.</p><h2>Route Handlers</h2><p>Os Route Handlers do Next.js 16 permitem criar endpoints diretamente na sua aplicação, sem necessidade de um servidor separado.</p><h2>Validação com Zod</h2><p>Use Zod para validar inputs e garantir que os dados estejam corretos antes de chegar ao banco de dados.</p>`,
            categoryIndex: 0,
            tagIndices: [2, 3],
        },
        {
            title: "IA Generativa na prática: integrando LLMs no seu app",
            slug: "ia-generativa-integrando-llms",
            excerpt: "Como integrar modelos de linguagem como GPT e Gemini em aplicações web com exemplos práticos.",
            content: `<h2>O boom da IA Generativa</h2><p>A IA generativa transformou a forma como desenvolvemos software. Neste artigo, vamos explorar como integrar LLMs em aplicações reais.</p><h2>APIs de LLMs</h2><p>Tanto o OpenAI API quanto o Gemini API oferecem endpoints simples para geração de texto, resumos, e conversação.</p><h2>Exemplo Prático</h2><p>Vamos construir um assistente de blog que sugere títulos, gera metadescriptions, e revisa conteúdo automaticamente.</p><h2>Custos e Otimização</h2><p>Dicas para manter os custos baixos: use caching, limite tokens, e escolha o modelo adequado para cada tarefa.</p>`,
            categoryIndex: 1,
            tagIndices: [0, 1],
        },
        {
            title: "Docker para devs: do básico ao Kubernetes",
            slug: "docker-basico-ao-kubernetes",
            excerpt: "Um guia progressivo sobre containerização, desde o primeiro Dockerfile até orquestração com Kubernetes.",
            content: `<h2>Por que Docker?</h2><p>Containers resolvem o problema de "funciona na minha máquina". Neste guia, vamos do zero ao deploy com Kubernetes.</p><h2>Primeiro Dockerfile</h2><p>Crie uma imagem Node.js otimizada com multi-stage builds, rodando com usuário non-root.</p><h2>Docker Compose</h2><p>Use Docker Compose para orquestrar múltiplos serviços localmente: API, banco de dados, cache Redis.</p><h2>Kubernetes</h2><p>Quando seu app precisa de escalabilidade, o Kubernetes permite auto-scaling, rolling updates, e alta disponibilidade.</p>`,
            categoryIndex: 2,
            tagIndices: [0],
        },
        {
            title: "React Server Components: guia definitivo",
            slug: "react-server-components-guia",
            excerpt: "Entenda como Server Components funcionam, quando usar, e como otimizar sua aplicação Next.js.",
            content: `<h2>A revolução dos RSC</h2><p>React Server Components permitem renderizar componentes no servidor, reduzindo o JavaScript enviado ao cliente.</p><h2>Server vs Client</h2><p>Nem tudo precisa ser um Server Component. Use Client Components para interatividade, formulários, e animações.</p><h2>Streaming e Suspense</h2><p>Combine RSC com Suspense para carregar partes da página progressivamente, melhorando o Time to First Byte.</p><h2>Padrões e Boas Práticas</h2><p>Mantenha data fetching nos Server Components, passe dados para Client Components via props, e evite waterfalls.</p>`,
            categoryIndex: 0,
            tagIndices: [1, 2],
        },
    ];

    for (let i = 0; i < techPosts.length; i++) {
        const p = techPosts[i]!;
        const publishedAt = new Date();
        publishedAt.setDate(publishedAt.getDate() - (techPosts.length - i) * 3);

        await prisma.post.upsert({
            where: { tenantId_slug: { tenantId: tenant1.id, slug: p.slug } },
            update: {},
            create: {
                title: p.title,
                slug: p.slug,
                excerpt: p.excerpt,
                content: p.content,
                status: "PUBLISHED",
                publishedAt,
                tenantId: tenant1.id,
                authorId: user.id,
                categories: { connect: [{ id: categories[p.categoryIndex]!.id }] },
                tags: { connect: p.tagIndices.map((ti) => ({ id: tags[ti]!.id })) },
            },
        });
    }
    console.log(`✅ Posts (Tech Insights): ${techPosts.length} created`);

    // =========================================================
    // 8. Posts — Vida Saudável
    // =========================================================
    const healthPosts = [
        {
            title: "10 alimentos que turbinam sua imunidade",
            slug: "10-alimentos-imunidade",
            excerpt: "Descubra quais alimentos naturais fortalecem seu sistema imunológico e como incluí-los na dieta.",
            content: `<h2>Alimentação e Imunidade</h2><p>A alimentação é um dos pilares da saúde imunológica. Veja 10 alimentos comprovados pela ciência.</p><h2>Top 10</h2><p>1. Gengibre 2. Cúrcuma 3. Alho 4. Frutas cítricas 5. Brócolis 6. Espinafre 7. Iogurte natural 8. Amêndoas 9. Chá verde 10. Pimentão vermelho.</p><h2>Como incluir na rotina</h2><p>Prepare smoothies matinais com gengibre e frutas, adicione cúrcuma ao arroz, e substitua snacks por amêndoas.</p>`,
            categoryIndex: 3,
            tagIndices: [4],
        },
        {
            title: "Treino HIIT: resultados em 20 minutos",
            slug: "treino-hiit-20-minutos",
            excerpt: "Como treinos de alta intensidade podem transformar seu corpo com sessões curtas e eficientes.",
            content: `<h2>O que é HIIT?</h2><p>High-Intensity Interval Training alterna entre períodos de esforço máximo e descanso ativo.</p><h2>Benefícios</h2><p>Queima mais calorias que cardio tradicional, melhora o condicionamento cardiovascular, e pode ser feito em casa.</p><h2>Rotina de 20 minutos</h2><p>4 rounds de: 30s burpees, 30s descanso, 30s mountain climbers, 30s descanso, 30s jump squats, 30s descanso.</p>`,
            categoryIndex: 4,
            tagIndices: [5],
        },
        {
            title: "Mindfulness: como meditar mesmo sendo iniciante",
            slug: "mindfulness-meditacao-iniciante",
            excerpt: "Um guia prático e sem misticismo para começar a meditar e reduzir o estresse no dia a dia.",
            content: `<h2>Meditação simplificada</h2><p>Meditar não exige horas de prática ou conhecimento especial. Comece com 5 minutos por dia.</p><h2>Técnica básica</h2><p>Sente-se confortavelmente, feche os olhos, e foque na respiração. Quando a mente divagar, volte suavemente à respiração.</p><h2>Benefícios comprovados</h2><p>Redução de cortisol, melhora no sono, aumento do foco, e menor ansiedade — confirmados por estudos científicos.</p>`,
            categoryIndex: 4,
            tagIndices: [5],
        },
    ];

    for (let i = 0; i < healthPosts.length; i++) {
        const p = healthPosts[i]!;
        const publishedAt = new Date();
        publishedAt.setDate(publishedAt.getDate() - (healthPosts.length - i) * 4);

        await prisma.post.upsert({
            where: { tenantId_slug: { tenantId: tenant2.id, slug: p.slug } },
            update: {},
            create: {
                title: p.title,
                slug: p.slug,
                excerpt: p.excerpt,
                content: p.content,
                status: "PUBLISHED",
                publishedAt,
                tenantId: tenant2.id,
                authorId: user.id,
                categories: { connect: [{ id: categories[p.categoryIndex]!.id }] },
                tags: { connect: p.tagIndices.map((ti) => ({ id: tags[ti]!.id })) },
            },
        });
    }
    console.log(`✅ Posts (Vida Saudável): ${healthPosts.length} created`);

    // =========================================================
    // 9. Theme Revisions
    // =========================================================
    await prisma.themeRevision.upsert({
        where: { tenantId_version: { tenantId: tenant1.id, version: 1 } },
        update: {},
        create: {
            tenantId: tenant1.id,
            version: 1,
            active: true,
            tokens: {
                colors: { primary: "#3b82f6", accent: "#f59e0b", background: "#0f172a", text: "#f1f5f9", muted: "#64748b" },
                fonts: { heading: "Inter", body: "Inter" },
                typography: { baseSize: "16px", scaleRatio: 1.25, lineHeight: 1.7 },
                layout: { maxWidth: "800px", borderRadius: "12px", spacing: "1.25rem" },
            },
        },
    });

    await prisma.themeRevision.upsert({
        where: { tenantId_version: { tenantId: tenant2.id, version: 1 } },
        update: {},
        create: {
            tenantId: tenant2.id,
            version: 1,
            active: true,
            tokens: {
                colors: { primary: "#10b981", accent: "#f97316", background: "#ffffff", text: "#1e293b", muted: "#94a3b8" },
                fonts: { heading: "Outfit", body: "Inter" },
                typography: { baseSize: "17px", scaleRatio: 1.2, lineHeight: 1.65 },
                layout: { maxWidth: "780px", borderRadius: "16px", spacing: "1rem" },
            },
        },
    });
    console.log("✅ Themes: 2 created (dark tech + light health)");

    // =========================================================
    // 10. Home Revisions
    // =========================================================
    await prisma.homeRevision.upsert({
        where: { tenantId_version: { tenantId: tenant1.id, version: 1 } },
        update: {},
        create: {
            tenantId: tenant1.id,
            version: 1,
            active: true,
            sections: [
                { type: "hero", order: 0, config: { title: "Tech Insights", subtitle: "Artigos sobre programação, IA e DevOps", limit: 6, layout: "grid" } },
                { type: "latest-posts", order: 1, config: { title: "Últimos artigos", limit: 6, layout: "grid" } },
                { type: "newsletter", order: 2, config: { title: "Newsletter", subtitle: "Receba os melhores artigos no seu e-mail", limit: 6, layout: "grid" } },
            ],
        },
    });

    await prisma.homeRevision.upsert({
        where: { tenantId_version: { tenantId: tenant2.id, version: 1 } },
        update: {},
        create: {
            tenantId: tenant2.id,
            version: 1,
            active: true,
            sections: [
                { type: "hero", order: 0, config: { title: "Vida Saudável", subtitle: "Dicas de nutrição, exercícios e bem-estar", ctaText: "Ver todos", ctaUrl: "/vida-saudavel", limit: 6, layout: "grid" } },
                { type: "latest-posts", order: 1, config: { title: "Últimas publicações", limit: 4, layout: "list" } },
            ],
        },
    });
    console.log("✅ Homepages: 2 created");

    // =========================================================
    // Done!
    // =========================================================
    console.log("\n🎉 Seed completo!");
    console.log("  → Blog Tech:   http://localhost:3001/tech-insights");
    console.log("  → Blog Saúde:  http://localhost:3001/vida-saudavel");
    console.log("  → Admin:       http://localhost:3000/dashboard");
}

main()
    .catch((e) => {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
