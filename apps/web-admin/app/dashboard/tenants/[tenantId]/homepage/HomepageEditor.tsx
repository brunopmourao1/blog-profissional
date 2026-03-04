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
            <div className="stack stack-md" style={{ marginBottom: "1.5rem" }}>
                {sections.map((section, index) => (
                    <div key={index} className="card">
                        <div className="row row-between" style={{ marginBottom: "1rem" }}>
                            <div className="row gap-sm">
                                <span className="badge badge-success" style={{ fontFamily: "var(--font-mono)" }}>
                                    #{index + 1}
                                </span>
                                <select
                                    value={section.type}
                                    onChange={(e) => updateSection(index, "type", e.target.value)}
                                    className="form-select"
                                    style={{ width: "auto" }}
                                >
                                    {SECTION_TYPES.map((t) => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="row gap-sm">
                                <button onClick={() => moveSection(index, -1)} disabled={index === 0} className="btn btn-ghost btn-sm">↑</button>
                                <button onClick={() => moveSection(index, 1)} disabled={index === sections.length - 1} className="btn btn-ghost btn-sm">↓</button>
                                <button onClick={() => removeSection(index)} className="btn btn-danger btn-sm">✕</button>
                            </div>
                        </div>

                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">Título</label>
                                <input
                                    value={(section.config.title as string) || ""}
                                    onChange={(e) => updateSection(index, "title", e.target.value)}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Subtítulo</label>
                                <input
                                    value={(section.config.subtitle as string) || ""}
                                    onChange={(e) => updateSection(index, "subtitle", e.target.value)}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Limite de itens</label>
                                <input
                                    type="number"
                                    value={(section.config.limit as number) || 6}
                                    onChange={(e) => updateSection(index, "limit", parseInt(e.target.value))}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Layout</label>
                                <select
                                    value={(section.config.layout as string) || "grid"}
                                    onChange={(e) => updateSection(index, "layout", e.target.value)}
                                    className="form-select"
                                >
                                    <option value="grid">Grid</option>
                                    <option value="list">Lista</option>
                                </select>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="row gap-sm">
                <button onClick={addSection} className="btn btn-outline">+ Adicionar Seção</button>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`btn ${saved ? "btn-success" : "btn-primary"}`}
                >
                    {saving ? "Salvando..." : saved ? "✅ Salvo!" : "Salvar Homepage"}
                </button>
            </div>
        </div>
    );
}
