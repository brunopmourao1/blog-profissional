"use client";

import { useState } from "react";
import { saveTheme } from "../../../actions";

interface ThemeEditorProps {
    tenantId: string;
    initialTokens: Record<string, unknown>;
}

export function ThemeEditor({ tenantId, initialTokens }: ThemeEditorProps) {
    const colors = (initialTokens.colors || {}) as Record<string, string>;
    const fonts = (initialTokens.fonts || {}) as Record<string, string>;
    const typography = (initialTokens.typography || {}) as Record<string, string | number>;
    const layout = (initialTokens.layout || {}) as Record<string, string>;

    const [primary, setPrimary] = useState(colors.primary || "#6366f1");
    const [accent, setAccent] = useState(colors.accent || "#f59e0b");
    const [background, setBackground] = useState(colors.background || "#ffffff");
    const [text, setText] = useState(colors.text || "#111827");
    const [muted, setMuted] = useState(colors.muted || "#6b7280");
    const [fontHeading, setFontHeading] = useState(fonts.heading || "Inter");
    const [fontBody, setFontBody] = useState(fonts.body || "Inter");
    const [baseSize, setBaseSize] = useState(String(typography.baseSize || "16px"));
    const [lineHeight, setLineHeight] = useState(String(typography.lineHeight || 1.6));
    const [maxWidth, setMaxWidth] = useState(layout.maxWidth || "800px");
    const [borderRadius, setBorderRadius] = useState(layout.borderRadius || "8px");
    const [spacing, setSpacing] = useState(layout.spacing || "1rem");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        const tokens = {
            colors: { primary, accent, background, text, muted },
            fonts: { heading: fontHeading, body: fontBody },
            typography: { baseSize, scaleRatio: 1.25, lineHeight: parseFloat(lineHeight) },
            layout: { maxWidth, borderRadius, spacing },
        };
        await saveTheme(tenantId, JSON.stringify(tokens));
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="grid-2" style={{ alignItems: "start" }}>
            <div className="stack stack-lg">
                <fieldset className="fieldset">
                    <legend>🎨 Cores</legend>
                    <div className="grid-2" style={{ marginTop: "0.5rem" }}>
                        <ColorInput label="Primary" value={primary} onChange={setPrimary} />
                        <ColorInput label="Accent" value={accent} onChange={setAccent} />
                        <ColorInput label="Background" value={background} onChange={setBackground} />
                        <ColorInput label="Text" value={text} onChange={setText} />
                        <ColorInput label="Muted" value={muted} onChange={setMuted} />
                    </div>
                </fieldset>

                <fieldset className="fieldset">
                    <legend>🔤 Fontes</legend>
                    <div className="stack stack-md" style={{ marginTop: "0.5rem" }}>
                        <div className="form-group">
                            <label className="form-label">Heading</label>
                            <select value={fontHeading} onChange={(e) => setFontHeading(e.target.value)} className="form-select">
                                <option value="Inter">Inter</option>
                                <option value="Outfit">Outfit</option>
                                <option value="Roboto">Roboto</option>
                                <option value="Poppins">Poppins</option>
                                <option value="Playfair Display">Playfair Display</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Body</label>
                            <select value={fontBody} onChange={(e) => setFontBody(e.target.value)} className="form-select">
                                <option value="Inter">Inter</option>
                                <option value="Outfit">Outfit</option>
                                <option value="Roboto">Roboto</option>
                                <option value="Lato">Lato</option>
                                <option value="Open Sans">Open Sans</option>
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset className="fieldset">
                    <legend>📐 Layout</legend>
                    <div className="grid-2" style={{ marginTop: "0.5rem" }}>
                        <div className="form-group">
                            <label className="form-label">Font Size</label>
                            <input value={baseSize} onChange={(e) => setBaseSize(e.target.value)} className="form-input" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Line Height</label>
                            <input value={lineHeight} onChange={(e) => setLineHeight(e.target.value)} className="form-input" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Max Width</label>
                            <input value={maxWidth} onChange={(e) => setMaxWidth(e.target.value)} className="form-input" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Border Radius</label>
                            <input value={borderRadius} onChange={(e) => setBorderRadius(e.target.value)} className="form-input" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Spacing</label>
                            <input value={spacing} onChange={(e) => setSpacing(e.target.value)} className="form-input" />
                        </div>
                    </div>
                </fieldset>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`btn ${saved ? "btn-success" : "btn-primary"}`}
                >
                    {saving ? "Salvando..." : saved ? "✅ Salvo!" : "Salvar Tema"}
                </button>
            </div>

            {/* Preview */}
            <div
                className="card"
                style={{
                    backgroundColor: background,
                    color: text,
                    borderRadius: borderRadius,
                    fontFamily: fontBody,
                    fontSize: baseSize,
                    lineHeight: parseFloat(lineHeight),
                    position: "sticky",
                    top: "5rem",
                }}
            >
                <h2 style={{ fontFamily: fontHeading, color: primary, marginBottom: "1rem" }}>Preview do Tema</h2>
                <p style={{ marginBottom: "1rem" }}>
                    Este é um exemplo de como o texto vai aparecer no blog com as configurações atuais.
                </p>
                <p style={{ color: muted, marginBottom: "1rem", fontSize: "0.875rem" }}>
                    Texto em cor muted · Admin Demo · 01/03/2026
                </p>
                <a href="#" onClick={(e) => e.preventDefault()} style={{ color: primary }}>
                    Link de exemplo
                </a>
                <div style={{ marginTop: "1rem" }}>
                    <button
                        style={{
                            padding: "0.5rem 1rem",
                            backgroundColor: accent,
                            color: "#fff",
                            border: "none",
                            borderRadius: borderRadius,
                            fontWeight: 600,
                        }}
                    >
                        Botão Accent
                    </button>
                </div>
            </div>
        </div>
    );
}

function ColorInput({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
}) {
    return (
        <div className="form-group">
            <label className="form-label">{label}</label>
            <div className="row gap-sm">
                <input
                    type="color"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    style={{ width: 36, height: 36, border: "none", cursor: "pointer", borderRadius: "var(--radius-sm)" }}
                />
                <input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="form-input mono"
                    style={{ fontSize: "0.75rem" }}
                />
            </div>
        </div>
    );
}
