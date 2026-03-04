import type { Metadata } from "next";

interface PrivacyProps {
    params: Promise<{ tenant: string }>;
}

export async function generateMetadata({ params }: PrivacyProps): Promise<Metadata> {
    const { tenant } = await params;
    return {
        title: `Política de Privacidade — ${tenant}`,
        description: "Política de Privacidade e proteção de dados pessoais",
    };
}

export default async function PrivacyPage({ params }: PrivacyProps) {
    const { tenant } = await params;

    return (
        <div style={{ maxWidth: "var(--layout-max-width, 800px)", margin: "0 auto", padding: "2rem 1rem" }}>
            <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "1.5rem" }}>
                Política de Privacidade
            </h1>

            <div style={{ lineHeight: 1.8, color: "var(--color-text, #111827)" }}>
                <p style={{ marginBottom: "1rem" }}>
                    <strong>Última atualização:</strong> {new Date().toLocaleDateString("pt-BR")}
                </p>

                <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginTop: "2rem", marginBottom: "0.75rem" }}>
                    1. Informações Coletadas
                </h2>
                <p style={{ marginBottom: "1rem" }}>
                    Coletamos informações que você fornece diretamente, como nome e e-mail ao se inscrever
                    na newsletter, e dados de navegação coletados automaticamente (cookies, endereço IP,
                    tipo de navegador).
                </p>

                <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginTop: "2rem", marginBottom: "0.75rem" }}>
                    2. Uso das Informações
                </h2>
                <p style={{ marginBottom: "1rem" }}>
                    Utilizamos seus dados para: enviar newsletters e atualizações de conteúdo,
                    melhorar a experiência de navegação, e análises estatísticas anônimas.
                </p>

                <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginTop: "2rem", marginBottom: "0.75rem" }}>
                    3. Compartilhamento de Dados
                </h2>
                <p style={{ marginBottom: "1rem" }}>
                    Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros,
                    exceto quando necessário para prestação de serviços (ex: provedor de e-mail) ou
                    por determinação legal.
                </p>

                <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginTop: "2rem", marginBottom: "0.75rem" }}>
                    4. Cookies
                </h2>
                <p style={{ marginBottom: "1rem" }}>
                    Utilizamos cookies essenciais para o funcionamento do site e cookies analíticos
                    para entender como você interage com nosso conteúdo. Você pode desativar cookies
                    nas configurações do seu navegador.
                </p>

                <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginTop: "2rem", marginBottom: "0.75rem" }}>
                    5. Seus Direitos (LGPD)
                </h2>
                <p style={{ marginBottom: "1rem" }}>
                    Conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você tem direito a:
                    acessar seus dados, corrigir informações, solicitar exclusão, e revogar consentimento.
                </p>

                <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginTop: "2rem", marginBottom: "0.75rem" }}>
                    6. Contato
                </h2>
                <p style={{ marginBottom: "1rem" }}>
                    Para exercer seus direitos ou tirar dúvidas sobre esta política, entre em contato
                    pelo canal de atendimento disponível no site.
                </p>
            </div>
        </div>
    );
}
