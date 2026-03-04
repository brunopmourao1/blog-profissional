"use client";

import { useState } from "react";
import { saveHomepage } from "../../../actions";

interface Section {
    type: string;
    order: number;
    config: Record<string, unknown>;
}

interface HomepageEditorProps {
    tenantId: string;
    initialSections: Array<Record<string, unknown>>;
}

const SECTION_TYPES = [
    { value: "hero", label: "🏠 Hero" },
    { value: "latest-posts", label: "📄 Últimos Posts" },
    { value: "newsletter", label: "📧 Newsletter" },
    { value: "featured-category", label: "⭐ Categoria em Destaque" },
];

const inputStyle = {
    padding: "0.5rem",
    borderRadius: 6,
    border: "1px solid #d1d5db",
    fontSize: "0.875rem",
    width: "100%",
} as const;

export function HomepageEditor({ tenantId, initialSections }: HomepageEditorProps) {
    const [sections, setSections] = useState<Section[]>(
        initialSections.map((s, i) => ({
            type: (s.type as string) || "hero",
            order: i,
            config: (s.config as Record<string, unknown>) || {},
        }))
    );
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const addSection = () => {
        setSections([
            ...sections,
            {
                type: "latest-posts",
                order: sections.length,
                config: { title: "Nova Seção", limit: 6, layout: "grid" },
            },
        ]);
    };

    const removeSection = (index: number) => {
        setSections(sections.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i })));
    };

    const moveSection = (index: number, direction: -1 | 1) => {
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= sections.length) return;
        const updated = [...sections];
        [updated[index]!, updated[newIndex]!] = [updated[newIndex]!, updated[index]!];
        setSections(updated.map((s, i) => ({ ...s, order: i })));
    };

    const updateSection = (index: number, field: string, value: unknown) => {
        const updated = [...sections];
        if (field === "type") {
            updated[index] = { ...updated[index]!, type: value as string };
        } else {
            updated[index] = {
                ...updated[index]!,
                config: { ...updated[index]!.config, [field]: value },
            };
        }
        setSections(updated);
    };

    const handleSave = async () => {
        setSaving(true);
        await saveHomepage(tenantId, JSON.stringify(sections));
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
                {sections.map((section, index) => (
                    <div
                        key={index}
                        style={{
                            border: "1px solid #e5e7eb",
                            borderRadius: 8,
                            padding: "1.25rem",
                            backgroundColor: "#fafafa",
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                <span style={{ fontWeight: 700, color: "#6b7280" }}>#{index + 1}</span>
                                <select
                                    value={section.type}
                                    onChange={(e) => updateSection(index, "type", e.target.value)}
                                    style={{ ...inputStyle, width: "auto" }}
                                >
                                    {SECTION_TYPES.map((t) => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                <button onClick={() => moveSection(index, -1)} disabled={index === 0}
                                    style={{ padding: "0.25rem 0.5rem", border: "1px solid #d1d5db", borderRadius: 4, cursor: "pointer", backgroundColor: "#fff" }}>
                                    ↑
                                </button>
                                <button onClick={() => moveSection(index, 1)} disabled={index === sections.length - 1}
                                    style={{ padding: "0.25rem 0.5rem", border: "1px solid #d1d5db", borderRadius: 4, cursor: "pointer", backgroundColor: "#fff" }}>
                                    ↓
                                </button>
                                <button onClick={() => removeSection(index)}
                                    style={{ padding: "0.25rem 0.5rem", border: "1px solid #fca5a5", borderRadius: 4, cursor: "pointer", backgroundColor: "#fef2f2", color: "#dc2626" }}>
                                    ✕
                                </button>
                            </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                            <div>
                                <label style={{ fontSize: "0.75rem", color: "#6b7280" }}>Título</label>
                                <input
                                    value={(section.config.title as string) || ""}
                                    onChange={(e) => updateSection(index, "title", e.target.value)}
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: "0.75rem", color: "#6b7280" }}>Subtítulo</label>
                                <input
                                    value={(section.config.subtitle as string) || ""}
                                    onChange={(e) => updateSection(index, "subtitle", e.target.value)}
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: "0.75rem", color: "#6b7280" }}>Limite de itens</label>
                                <input
                                    type="number"
                                    value={(section.config.limit as number) || 6}
                                    onChange={(e) => updateSection(index, "limit", parseInt(e.target.value))}
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: "0.75rem", color: "#6b7280" }}>Layout</label>
                                <select
                                    value={(section.config.layout as string) || "grid"}
                                    onChange={(e) => updateSection(index, "layout", e.target.value)}
                                    style={inputStyle}
                                >
                                    <option value="grid">Grid</option>
                                    <option value="list">Lista</option>
                                </select>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
                <button
                    onClick={addSection}
                    style={{
                        padding: "0.75rem 1.5rem",
                        backgroundColor: "#f3f4f6",
                        color: "#374151",
                        border: "1px solid #d1d5db",
                        borderRadius: 8,
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        cursor: "pointer",
                    }}
                >
                    + Adicionar Seção
                </button>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                        padding: "0.75rem 1.5rem",
                        backgroundColor: saved ? "#10b981" : "#6366f1",
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        cursor: saving ? "wait" : "pointer",
                    }}
                >
                    {saving ? "Salvando..." : saved ? "✅ Salvo!" : "Salvar Homepage"}
                </button>
            </div>
        </div>
    );
}
