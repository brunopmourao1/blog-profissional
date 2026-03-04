"use client";

import { toggleTenant } from "../actions";

export function ToggleButton({ tenantId, active }: { tenantId: string; active: boolean }) {
    return (
        <button
            className={`btn btn-sm ${active ? "btn-outline" : "btn-primary"}`}
            onClick={async () => { await toggleTenant(tenantId); }}
        >
            {active ? "Desativar" : "Ativar"}
        </button>
    );
}
