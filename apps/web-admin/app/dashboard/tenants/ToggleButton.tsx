"use client";

import { toggleTenant } from "../actions";

export function ToggleButton({ tenantId, active }: { tenantId: string; active: boolean }) {
    return (
        <button
            onClick={async () => {
                await toggleTenant(tenantId);
            }}
            style={{
                padding: "0.25rem 0.75rem",
                borderRadius: 6,
                border: "1px solid #d1d5db",
                backgroundColor: "#fff",
                cursor: "pointer",
                fontSize: "0.75rem",
            }}
        >
            {active ? "Desativar" : "Ativar"}
        </button>
    );
}
