import { Building2, CalendarDays, Database, LogOut, MapPinned, Rows3, UsersRound } from "lucide-react";

function ScopePill({ icon: Icon, label, value, accent = false }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ${
        accent ? "border border-flame-400/35 bg-flame-500/[0.13] text-flame-200" : "bg-white/[0.06] text-stone-300"
      }`}
    >
      <Icon size={13} className={accent ? "text-flame-300" : "text-flame-400"} />
      <span className="text-stone-500">{label}</span>
      <strong className="font-black text-stone-100">{value}</strong>
    </span>
  );
}

export default function Header({ stats, metadata, scope, onLogout }) {
  const activePeriod = scope?.activePeriod || "Todos";
  const range = scope?.availablePeriodRange || metadata.period || "Sin rango";
  const filteredRecords = scope?.filteredRecords ?? 0;
  const totalRecords = scope?.totalRecords ?? metadata.recordCount ?? 0;
  const workers = scope?.workers ?? stats.workers;
  const companies = scope?.companies ?? stats.companies;
  const businessCenters = scope?.businessCenters ?? 0;

  return (
    <header className="panel overflow-hidden p-4 sm:p-5">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-flame-400/30 bg-flame-500/[0.12] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-flame-300">
            <span className="h-1.5 w-1.5 rounded-full bg-flame-400 shadow-[0_0_16px_rgba(255,123,85,.95)]" />
            Corporativo
          </div>
          <h1 className="max-w-3xl text-2xl font-black leading-tight tracking-normal text-stone-50 sm:text-3xl">
            Dashboard Corporativo de Remuneraciones
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold">
            <ScopePill icon={CalendarDays} label="Periodo activo" value={activePeriod} accent />
            <ScopePill icon={Rows3} label="Registros" value={`${filteredRecords} de ${totalRecords}`} />
            <ScopePill icon={UsersRound} label="Trabajadores" value={workers} />
            <ScopePill icon={Building2} label="Empresas" value={companies} />
            <ScopePill icon={MapPinned} label="Centros" value={businessCenters} />
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
          <div className="grid min-w-[250px] grid-cols-2 gap-2 rounded-lg border border-white/10 bg-black/[0.18] p-2">
            <div className="rounded-lg bg-white/[0.05] p-3">
              <p className="tiny-label">Rango disponible</p>
              <p className="mt-1 truncate text-sm font-bold text-stone-100">{range}</p>
            </div>
            <div className="rounded-lg bg-white/[0.05] p-3">
              <p className="tiny-label">Fuente</p>
              <p className="mt-1 inline-flex items-center gap-1.5 truncate text-sm font-bold text-stone-100">
                <Database size={13} className="shrink-0 text-flame-400" />
                {metadata.sheet || "DW V2"}
              </p>
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
