import { Building2, CalendarDays, LogOut, UsersRound } from "lucide-react";

export default function Header({ stats, metadata, onLogout }) {
  return (
    <header className="panel overflow-hidden p-4 sm:p-5">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-flame-400/30 bg-flame-500/[0.12] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-flame-300">
            <span className="h-1.5 w-1.5 rounded-full bg-flame-400 shadow-[0_0_16px_rgba(255,123,85,.95)]" />
            Mantención
          </div>
          <h1 className="max-w-3xl text-2xl font-black leading-tight tracking-normal text-stone-50 sm:text-3xl">
            Dashboard de Costo del Área de Mantención
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-stone-400">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-2.5 py-1">
              <UsersRound size={13} className="text-flame-400" />
              {stats.workers} trabajadores
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-2.5 py-1">
              <Building2 size={13} className="text-flame-400" />
              {stats.companies} empresas
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-2.5 py-1">
              <CalendarDays size={13} className="text-flame-400" />
              {metadata.period}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
          <div className="grid min-w-[250px] grid-cols-2 gap-2 rounded-lg border border-white/10 bg-black/[0.18] p-2">
            <div className="rounded-lg bg-white/[0.05] p-3">
              <p className="tiny-label">Hoja</p>
              <p className="mt-1 truncate text-sm font-bold text-stone-100">{metadata.sheet}</p>
            </div>
            <div className="rounded-lg bg-white/[0.05] p-3">
              <p className="tiny-label">Registros</p>
              <p className="mt-1 text-sm font-bold text-stone-100">{metadata.workerCount}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="inline-flex min-h-[64px] items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.05] px-4 text-xs font-black uppercase tracking-[0.08em] text-stone-200 transition hover:border-flame-400/35 hover:bg-flame-500/10 hover:text-flame-200"
          >
            <LogOut size={15} />
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>
  );
}
