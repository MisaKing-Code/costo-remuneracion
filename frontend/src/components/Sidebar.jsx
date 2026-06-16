import { BarChart3, Building2, ChevronRight, Factory, Layers3, LogOut } from "lucide-react";
import { formatCompactCurrency, formatPercent, shortName } from "../utils/formatters";

function NavButton({ active, icon: Icon, title, subtitle, value, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group grid w-full grid-cols-[34px_1fr_auto] items-center gap-3 rounded-lg border px-3 py-3 text-left transition ${
        active
          ? "border-flame-400/40 bg-flame-500/[0.14] text-stone-50 shadow-[0_14px_30px_rgba(0,0,0,.22)]"
          : "border-white/[0.07] bg-white/[0.035] text-stone-300 hover:border-flame-400/28 hover:bg-white/[0.06]"
      }`}
    >
      <span
        className={`grid h-8 w-8 place-items-center rounded-lg border ${
          active ? "border-flame-300/35 bg-flame-500/20 text-flame-200" : "border-white/10 bg-black/20 text-flame-400"
        }`}
      >
        <Icon size={16} strokeWidth={2.4} />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-xs font-black">{title}</span>
        <span className="mt-0.5 block truncate text-[10px] font-semibold text-stone-500">{subtitle}</span>
      </span>
      {value ? <span className="text-[10px] font-black text-flame-300">{value}</span> : <ChevronRight size={14} />}
    </button>
  );
}

export default function Sidebar({ activeCompany, societies = [], onSelectCompany, onLogout }) {
  return (
    <aside className="panel flex h-full min-h-0 flex-col overflow-hidden border-white/[0.08] bg-ink-900/98">
      <div className="border-b border-white/10 p-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg border border-flame-400/35 bg-flame-500/15 text-flame-200">
            <Layers3 size={20} strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black leading-tight text-stone-50">Pullman San Luis</p>
            <p className="tiny-label mt-1 truncate">Corporativo</p>
          </div>
        </div>
      </div>

      <div className="scrollbar-dark flex-1 space-y-5 overflow-y-auto p-3">
        <div>
          <p className="tiny-label mb-2 px-1">Vista</p>
          <NavButton
            active={activeCompany === "Todas"}
            icon={BarChart3}
            title="Vista General"
            subtitle="Todas las sociedades"
            onClick={() => onSelectCompany("Todas")}
          />
        </div>

        <div>
          <p className="tiny-label mb-2 px-1">Sociedades</p>
          <div className="space-y-2">
            {societies.map((society) => (
              <NavButton
                key={society.name}
                active={activeCompany === society.name}
                icon={Building2}
                title={shortName(society.name)}
                subtitle={society.name}
                value={formatPercent(society.percent)}
                onClick={() => onSelectCompany(society.name)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 p-3">
        <div className="mb-3 rounded-lg border border-white/[0.07] bg-black/20 p-3">
          <div className="flex items-center gap-2">
            <Factory size={14} className="text-flame-400" />
            <p className="tiny-label text-stone-300">{societies.length} sociedades</p>
          </div>
          <p className="mt-1 text-xs font-black text-stone-100">
            {formatCompactCurrency(societies.reduce((total, item) => total + item.value, 0))}
          </p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-xs font-black uppercase tracking-[0.08em] text-stone-200 transition hover:border-flame-400/35 hover:bg-flame-500/10 hover:text-flame-200"
        >
          <LogOut size={14} />
          Cerrar sesion
        </button>
      </div>
    </aside>
  );
}
