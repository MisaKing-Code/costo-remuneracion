import {
  BarChart3,
  Building2,
  CalendarDays,
  ChevronRight,
  DollarSign,
  Factory,
  Layers3,
  LogOut,
  Trophy,
  Users,
} from "lucide-react";
import { Line, LineChart, ResponsiveContainer } from "recharts";
import { formatCompactCurrency, formatPercent, shortName } from "../utils/formatters";

function ExecutiveButton({ active, icon: Icon, title, subtitle, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`group relative grid w-full grid-cols-[34px_1fr_auto] items-center gap-3 overflow-hidden rounded-lg border py-3 pl-3 pr-3 text-left transition duration-200 ${
        active
          ? "border-flame-400/45 bg-white/[0.075] text-stone-50 shadow-[0_0_22px_rgba(255,123,85,.16)]"
          : "border-white/[0.07] bg-white/[0.035] text-stone-300 hover:border-flame-400/28 hover:bg-white/[0.06]"
      }`}
    >
      <span className={`absolute inset-y-2 left-0 w-1 rounded-r-full transition ${active ? "bg-flame-500" : "bg-transparent"}`} />
      <span
        className={`grid h-8 w-8 place-items-center rounded-lg border ${
          active ? "border-flame-300/40 bg-flame-500/20 text-flame-200" : "border-white/10 bg-black/20 text-flame-400"
        }`}
      >
        <Icon size={16} strokeWidth={2.4} />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-xs font-black">{title}</span>
        <span className="mt-0.5 block truncate text-[10px] font-semibold text-stone-500">{subtitle}</span>
      </span>
      <ChevronRight size={14} className={active ? "text-flame-300" : "text-stone-500"} />
    </button>
  );
}

function Badge({ label }) {
  if (!label) {
    return null;
  }

  const isLeader = label === "Mayor costo";

  return (
    <span
      className={`inline-flex max-w-[112px] items-center gap-1 truncate rounded-md border px-1.5 py-1 text-[9px] font-black ${
        isLeader
          ? "border-flame-300/30 bg-flame-500/12 text-flame-200"
          : "border-white/10 bg-white/[0.045] text-stone-400"
      }`}
    >
      {isLeader ? <Trophy size={10} strokeWidth={2.5} /> : null}
      <span className="truncate">{label}</span>
    </span>
  );
}

function SocietySparkline({ data = [] }) {
  if (!data.length) {
    return <div className="h-7 w-[76px] rounded-md border border-white/[0.05] bg-black/15" />;
  }

  return (
    <div className="h-7 w-[76px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 2, bottom: 3, left: 2 }}>
          <Line type="monotone" dataKey="totalCost" stroke="#ff9a6d" strokeWidth={1.7} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function SocietyCard({ society, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`group relative w-full overflow-hidden rounded-lg border py-3 pl-3 pr-2 text-left transition duration-200 ${
        active
          ? "border-flame-400/45 bg-white/[0.075] shadow-[0_0_24px_rgba(255,123,85,.18)]"
          : "border-white/[0.07] bg-white/[0.032] hover:border-flame-400/30 hover:bg-white/[0.055]"
      }`}
    >
      <span className={`absolute inset-y-2 left-0 w-1 rounded-r-full transition ${active ? "bg-flame-500" : "bg-transparent"}`} />
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2">
          <span
            className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg border ${
              active ? "border-flame-300/35 bg-flame-500/16 text-flame-200" : "border-white/10 bg-black/20 text-flame-400"
            }`}
          >
            <Building2 size={14} strokeWidth={2.4} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-black leading-5 text-stone-100">{shortName(society.name)}</p>
            <p className="mt-0.5 text-[14px] font-black leading-none text-flame-300">{formatCompactCurrency(society.value)}</p>
          </div>
        </div>
        <Badge label={society.badge} />
      </div>

      <div className="mt-2 grid grid-cols-[1fr_auto] items-end gap-2 pl-9">
        <div className="min-w-0">
          <p className="flex items-center gap-1 text-[10px] font-bold text-stone-400">
            <Users size={11} className="text-stone-500" />
            {society.workers} trabajadores
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-flame-500 to-flame-300"
              style={{ width: `${Math.max(2, Math.min(100, society.percent || 0))}%` }}
            />
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <p className="text-[11px] font-black text-flame-300">{formatPercent(society.percent)}</p>
          <SocietySparkline data={society.trend} />
        </div>
      </div>
    </button>
  );
}

function SummaryMetric({ icon: Icon, value, label }) {
  return (
    <div className="min-w-0 text-center">
      <div className="mx-auto grid h-7 w-7 place-items-center rounded-lg border border-flame-400/20 bg-flame-500/10 text-flame-300">
        <Icon size={13} strokeWidth={2.4} />
      </div>
      <p className="mt-1 truncate text-[13px] font-black leading-none text-stone-50">{value}</p>
      <p className="mt-1 truncate text-[9px] font-semibold text-stone-500">{label}</p>
    </div>
  );
}

function CorporateSummary({ activeCompany, societies, workerMetric, societyWorkerMetrics = {} }) {
  const activeSociety = societies.find((item) => item.name === activeCompany);
  const totalCost = societies.reduce((total, item) => total + item.value, 0);
  const isCorporate = activeCompany === "Todas" || !activeSociety;
  const activeSocietyWorkerMetric = activeSociety ? societyWorkerMetrics[activeSociety.name] : null;
  const totalWorkers = workerMetric?.value ?? societies.reduce((total, item) => total + item.workers, 0);
  const totalWorkerLabel = workerMetric?.labelTrabajadores ?? "Trabajadores";
  const societyWorkers = activeSocietyWorkerMetric?.value ?? activeSociety?.workers ?? 0;
  const societyWorkerLabel = activeSocietyWorkerMetric?.labelTrabajadores ?? "Trabajadores";

  return (
    <div className="mb-3 rounded-lg border border-white/[0.08] bg-black/20 p-3">
      <p className="tiny-label mb-3 text-stone-300">{isCorporate ? "Resumen corporativo" : "Resumen sociedad"}</p>
      <div className="grid grid-cols-3 gap-2">
        {isCorporate ? (
          <>
            <SummaryMetric icon={Factory} value={societies.length} label="Sociedades" />
            <SummaryMetric icon={DollarSign} value={formatCompactCurrency(totalCost)} label="Costo total" />
            <SummaryMetric icon={Users} value={totalWorkers} label={totalWorkerLabel} />
          </>
        ) : (
          <>
            <SummaryMetric icon={BarChart3} value={formatPercent(activeSociety.percent)} label="Participacion" />
            <SummaryMetric icon={Users} value={societyWorkers} label={societyWorkerLabel} />
            <SummaryMetric icon={Factory} value={activeSociety.businessCenters} label="Centros" />
          </>
        )}
      </div>
    </div>
  );
}

export default function Sidebar({
  activeCompany,
  activePeriodLabel = "Todos",
  societies = [],
  workerMetric,
  societyWorkerMetrics,
  onSelectCompany,
  onLogout,
}) {
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

        <div className="mt-4 rounded-lg border border-white/[0.08] bg-black/20 p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CalendarDays size={13} className="text-flame-400" strokeWidth={2.4} />
              <p className="tiny-label text-stone-300">Periodo activo</p>
            </div>
            <span className="rounded-md border border-flame-300/25 bg-flame-500/12 px-2 py-1 text-[10px] font-black text-flame-200">
              {activePeriodLabel}
            </span>
          </div>
        </div>
      </div>

      <div className="scrollbar-dark flex-1 space-y-5 overflow-y-auto p-3">
        <div>
          <p className="tiny-label mb-2 px-1">Vista</p>
          <ExecutiveButton
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
              <SocietyCard
                key={society.name}
                society={society}
                active={activeCompany === society.name}
                onClick={() => onSelectCompany(society.name)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 p-3">
        <CorporateSummary
          activeCompany={activeCompany}
          societies={societies}
          workerMetric={workerMetric}
          societyWorkerMetrics={societyWorkerMetrics}
        />
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
