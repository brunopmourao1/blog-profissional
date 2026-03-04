"use client";

import { useState } from "react";
import { saveTheme } from "../../../actions";

interface ThemeEditorProps {
    tenantId: string;
    initialTokens: Record<string, unknown>;
}

const inputStyle = {
    padding: "0.5rem",
    borderRadius: 6,
    border: "1px solid #d1d5db",
    fontSize: "0.875rem",
    width: "100%",
} as const;

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
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
            {/* Left: Controls */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <fieldset style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "1.25rem" }}>
                    <legend style={{ fontWeight: 700, padding: "0 0.5rem" }}>🎨 Cores</legend>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "0.5rem" }}>
                        <ColorInput label="Primary" value={primary} onChange={setPrimary} />
                        <ColorInput label="Accent" value={accent} onChange={setAccent} />
                        <ColorInput label="Background" value={background} onChange={setBackground} />
                        <ColorInput label="Text" value={text} onChange={setText} />
                        <ColorInput label="Muted" value={muted} onChange={setMuted} />
                    </div>
                </fieldset>

                <fieldset style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "1.25rem" }}>
                    <legend style={{ fontWeight: 700, padding: "0 0.5rem" }}>🔤 Fontes</legend>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.5rem" }}>
                        <div>
                            <label style={{ fontSize: "0.75rem", color: "#6b7280" }}>Heading</label>
                            <select value={fontHeading} onChange={(e) => setFontHeading(e.target.value)} style={inputStyle}>
                                <option value="Inter">Inter</option>
                                <option value="Outfit">Outfit</option>
                                <option value="Roboto">Roboto</option>
                                <option value="Poppins">Poppins</option>
                                <option value="Playfair Display">Playfair Display</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: "0.75rem", color: "#6b7280" }}>Body</label>
                            <select value={fontBody} onChange={(e) => setFontBody(e.target.value)} style={inputStyle}>
                                <option value="Inter">Inter</option>
                                <option value="Outfit">Outfit</option>
                                <option value="Roboto">Roboto</option>
                                <option value="Lato">Lato</option>
                                <option value="Open Sans">Open Sans</option>
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "1.25rem" }}>
                    <legend style={{ fontWeight: 700, padding: "0 0.5rem" }}>📐 Layout</legend>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginTop: "0.5rem" }}>
                        <div>
                            <label style={{ fontSize: "0.75rem", color: "#6b7280" }}>Font Size</label>
                            <input value={baseSize} onChange={(e) => setBaseSize(e.target.value)} style={inputStyle} />
                        </div>
                        <div>
                            <label style={{ fontSize: "0.75rem", color: "#6b7280" }}>Line Height</label>
                            <input value={lineHeight} onChange={(e) => setLineHeight(e.target.value)} style={inputStyle} />
                        </div>
                        <div>
                            <label style={{ fontSize: "0.75rem", color: "#6b7280" }}>Max Width</label>
                            <input value={maxWidth} onChange={(e) => setMaxWidth(e.target.value)} style={inputStyle} />
                        </div>
                        <div>
                            <label style={{ fontSize: "0.75rem", color: "#6b7280" }}>Border Radius</label>
                            <input value={borderRadius} onChange={(e) => setBorderRadius(e.target.value)} style={inputStyle} />
                        </div>
                        <div>
                            <label style={{ fontSize: "0.75rem", color: "#6b7280" }}>Spacing</label>
                            <input value={spacing} onChange={(e) => setSpacing(e.target.value)} style={inputStyle} />
                        </div>
                    </div>
                </fieldset>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                        padding: "0.75rem 1.5rem",
                        backgroundColor: saved ? "#10b981" : "#6366f1",
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        fontSize: "1rem",
                        fontWeight: 600,
                        cursor: saving ? "wait" : "pointer",
                    }}
                >
                    {saving ? "Salvando..." : saved ? "✅ Salvo!" : "Salvar Tema"}
                </button>
            </div>

            {/* Right: Preview */}
            <div
                style={{
                    backgroundColor: background,
                    color: text,
                    borderRadius: borderRadius,
                    padding: "2rem",
                    border: "1px solid #e5e7eb",
                    fontFamily: fontBody,
                    fontSize: baseSize,
                    lineHeight: parseFloat(lineHeight),
                    position: "sticky",
                    top: "2rem",
                    maxHeight: "80vh",
                    overflow: "auto",
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
        <div>
            <label style={{ fontSize: "0.75rem", color: "#6b7280", display: "block", marginBottom: "0.25rem" }}>{label}</label>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <input
                    type="color"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    style={{ width: 36, height: 36, border: "none", cursor: "pointer", borderRadius: 4 }}
                />
                <input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    style={{ ...inputStyle, fontFamily: "monospace", fontSize: "0.75rem" }}
                />
            </div>
        </div>
    );
}
