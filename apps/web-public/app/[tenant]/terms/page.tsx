import type { Metadata } from "next";

interface TermsProps {
    params: Promise<{ tenant: string }>;
}

export async function generateMetadata({ params }: TermsProps): Promise<Metadata> {
    const { tenant } = await params;
    return {
        title: `Termos de Uso — ${tenant}`,
        description: "Termos e condições de uso do site",
    };
}

export default async function TermsPage({ params }: TermsProps) {
    const { tenant } = await params;

    return (
        <div style={{ maxWidth: "var(--layout-max-width, 800px)", margin: "0 auto", padding: "2rem 1rem" }}>
            <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "1.5rem" }}>
                Termos de Uso
            </h1>

            <div style={{ lineHeight: 1.8, color: "var(--color-text, #111827)" }}>
                <p style={{ marginBottom: "1rem" }}>
                    <strong>Última atualização:</strong> {new Date().toLocaleDateString("pt-BR")}
                </p>

                <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginTop: "2rem", marginBottom: "0.75rem" }}>
                    1. Aceitação dos Termos
                </h2>
                <p style={{ marginBottom: "1rem" }}>
                    Ao acessar e utilizar este site, você concorda com os presentes Termos de Uso.
                    Caso não concorde, por favor, não utilize o site.
                </p>

                <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginTop: "2rem", marginBottom: "0.75rem" }}>
                    2. Propriedade Intelectual
                </h2>
                <p style={{ marginBottom: "1rem" }}>
                    Todo o conteúdo publicado neste site (textos, imagens, layout) é protegido por
                    direitos autorais. A reprodução sem autorização é proibida.
                </p>

                <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginTop: "2rem", marginBottom: "0.75rem" }}>
                    3. Uso Aceitável
                </h2>
                <p style={{ marginBottom: "1rem" }}>
                    Você concorda em não utilizar o site para atividades ilegais, não tentar acessar
                    áreas restritas, e não distribuir conteúdo malicioso.
                </p>

                <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginTop: "2rem", marginBottom: "0.75rem" }}>
                    4. Limitação de Responsabilidade
                </h2>
                <p style={{ marginBottom: "1rem" }}>
                    O conteúdo é fornecido &ldquo;como está&rdquo;, sem garantias. Não nos responsabilizamos
                    por decisões tomadas com base no conteúdo publicado.
                </p>

                <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginTop: "2rem", marginBottom: "0.75rem" }}>
                    5. Alterações
                </h2>
                <p style={{ marginBottom: "1rem" }}>
                    Estes termos podem ser atualizados a qualquer momento. Recomendamos que consulte
                    esta página periodicamente.
                </p>

                <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginTop: "2rem", marginBottom: "0.75rem" }}>
                    6. Legislação Aplicável
                </h2>
                <p style={{ marginBottom: "1rem" }}>
                    Estes termos são regidos pelas leis da República Federativa do Brasil.
                </p>
            </div>
        </div>
    );
}
