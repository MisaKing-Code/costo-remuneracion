import {
  BarChart3,
  BriefcaseBusiness,
  Building2,
  ChevronRight,
  CircleDollarSign,
  Filter,
  Home,
  LineChart as LineChartIcon,
  Search,
  Table2,
  UsersRound,
  X,
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useMemo, useState } from "react";
import { formatCompactCurrency, formatCurrency, formatPercent, shortName } from "../utils/formatters";

const tabs = [
  { id: "home", label: "Inicio", icon: Home },
  { id: "societies", label: "Sociedades", icon: Building2 },
  { id: "trend", label: "Tendencia", icon: LineChartIcon },
  { id: "ranking", label: "Ranking", icon: BarChart3 },
  { id: "people", label: "Personas", icon: UsersRound },
];

function MobileSelect({ label, value, onChange, options = [], allLabel, disabled = false }) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="tiny-label">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="h-11 min-w-0 rounded-lg border border-white/10 bg-ink-800 px-3 text-sm font-bold text-stone-100 outline-none focus:border-flame-400 disabled:cursor-not-allowed disabled:border-flame-400/20 disabled:bg-flame-500/[0.08] disabled:text-flame-200"
      >
        {disabled && value !== allLabel ? <option value={value}>{value}</option> : null}
        <option value={allLabel}>{allLabel}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function FilterChip({ label, value }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1 rounded-full border border-flame-400/25 bg-flame-500/[0.10] px-2.5 py-1 text-[11px] font-bold text-stone-200">
      <span className="shrink-0 text-flame-300">{label}:</span>
      <span className="truncate">{value}</span>
    </span>
  );
}

function MobileTopBar({ activeCompany, periodLabel, activeChips, onOpenFilters }) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-ink-950/88 px-3 py-3 shadow-[0_16px_36px_rgba(0,0,0,.35)] backdrop-blur-xl md:hidden">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-flame-300">Pullman Analytics</p>
          <h1 className="mt-0.5 truncate text-base font-black leading-tight text-stone-50">
            {activeCompany === "Todas" ? "Vista General" : shortName(activeCompany)}
          </h1>
          <p className="mt-0.5 truncate text-[11px] font-bold text-stone-500">Periodo {periodLabel}</p>
        </div>
        <button
          type="button"
          onClick={onOpenFilters}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-flame-400/30 bg-flame-500/12 text-flame-200 shadow-[0_0_18px_rgba(255,123,85,.13)]"
          aria-label="Abrir filtros"
        >
          <Filter size={18} strokeWidth={2.4} />
        </button>
      </div>
      {activeChips.length ? (
        <div className="scrollbar-dark mt-3 flex gap-2 overflow-x-auto pb-1">
          {activeChips.map((chip) => (
            <FilterChip key={`${chip.label}-${chip.value}`} label={chip.label} value={chip.value} />
          ))}
        </div>
      ) : null}
    </header>
  );
}

function MobileKpiCard({ icon: Icon, label, value, detail }) {
  return (
    <article className="rounded-xl border border-white/10 bg-ink-900/95 p-3 shadow-[0_12px_28px_rgba(0,0,0,.24)]">
      <div className="flex items-start justify-between gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-lg border border-flame-400/20 bg-flame-500/12 text-flame-300">
          <Icon size={16} strokeWidth={2.4} />
        </div>
      </div>
      <p className="tiny-label mt-3 text-stone-500">{label}</p>
      <p className="mt-1 text-[21px] font-black leading-none text-stone-50">{value}</p>
      <p className="mt-1 min-h-[28px] text-[11px] font-semibold leading-4 text-stone-400">{detail}</p>
    </article>
  );
}

function MobileKpiGrid({ stats, delta }) {
  return (
    <section className="grid grid-cols-2 gap-3">
      <MobileKpiCard icon={CircleDollarSign} label="Costo total" value={formatCompactCurrency(stats.totalCost)} detail="Costo filtrado" />
      <MobileKpiCard
        icon={LineChartIcon}
        label="Variacion"
        value={delta.label}
        detail={delta.detail}
      />
      <MobileKpiCard icon={UsersRound} label="Trabajadores" value={stats.workers} detail="Dotacion filtrada" />
      <MobileKpiCard icon={BriefcaseBusiness} label="Promedio" value={formatCompactCurrency(stats.averageCost)} detail="Costo por trabajador" />
    </section>
  );
}

function MobileTrendCard({ data = [], title = "Tendencia mensual" }) {
  return (
    <section className="rounded-xl border border-white/10 bg-ink-900/95 p-3 shadow-[0_12px_28px_rgba(0,0,0,.24)]">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <p className="tiny-label text-stone-500">{title}</p>
          <p className="mt-1 text-xs font-bold text-stone-300">{data.length} periodos visibles</p>
        </div>
        <LineChartIcon size={17} className="text-flame-400" />
      </div>
      <div className="h-[210px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 12, right: 6, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="mobileCostTrend" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="#ff7b55" stopOpacity={0.42} />
                <stop offset="95%" stopColor="#ff7b55" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,.07)" vertical={false} />
            <XAxis dataKey="period" tick={{ fill: "#a8a29e", fontSize: 10, fontWeight: 800 }} tickLine={false} axisLine={false} />
            <YAxis width={42} tickFormatter={formatCompactCurrency} tick={{ fill: "#78716c", fontSize: 9, fontWeight: 800 }} tickLine={false} axisLine={false} />
            <Tooltip
              formatter={(value) => [formatCompactCurrency(value), "Costo total"]}
              labelStyle={{ color: "#f8f5ee", fontWeight: 800 }}
              contentStyle={{ background: "#22231f", border: "1px solid rgba(255,255,255,.12)", borderRadius: 8 }}
            />
            <Area type="monotone" dataKey="totalCost" stroke="#ff9a6d" strokeWidth={2.6} fill="url(#mobileCostTrend)" activeDot={{ r: 4, fill: "#ffbd8f", stroke: "#151513", strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function MobileRankingList({ title, data = [], compactCompany = false }) {
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <section className="rounded-xl border border-white/10 bg-ink-900/95 p-3 shadow-[0_12px_28px_rgba(0,0,0,.24)]">
      <p className="tiny-label mb-3 text-stone-500">{title}</p>
      <div className="space-y-3">
        {data.slice(0, 6).map((item, index) => (
          <article key={item.name} className="rounded-lg border border-white/[0.07] bg-white/[0.035] p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-black text-flame-300">#{index + 1}</p>
                <p className="mt-1 truncate text-sm font-black text-stone-100">{compactCompany ? shortName(item.name) : item.name}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-stone-50">{formatCompactCurrency(item.value)}</p>
                <p className="mt-1 text-[11px] font-bold text-stone-500">{formatPercent(item.percent)}</p>
              </div>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/30">
              <div className="h-full rounded-full bg-gradient-to-r from-flame-500 to-flame-300" style={{ width: `${(item.value / max) * 100}%` }} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function MobileSocietyList({ societies = [], activeCompany, onSelectCompany }) {
  return (
    <section className="space-y-3">
      {societies.map((society) => {
        const active = activeCompany === society.name;
        return (
          <button
            key={society.name}
            type="button"
            onClick={() => onSelectCompany(society.name)}
            aria-pressed={active}
            className={`relative w-full overflow-hidden rounded-xl border p-3 text-left transition ${
              active
                ? "border-flame-400/45 bg-white/[0.075] shadow-[0_0_22px_rgba(255,123,85,.16)]"
                : "border-white/10 bg-ink-900/95"
            }`}
          >
            <span className={`absolute inset-y-3 left-0 w-1 rounded-r-full ${active ? "bg-flame-500" : "bg-transparent"}`} />
            <div className="flex items-start justify-between gap-3 pl-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-stone-100">{shortName(society.name)}</p>
                <p className="mt-1 text-lg font-black text-flame-300">{formatCompactCurrency(society.value)}</p>
                <p className="mt-1 text-[11px] font-bold text-stone-400">{society.workers} trabajadores</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-stone-50">{formatPercent(society.percent)}</p>
                <ChevronRight size={16} className="mt-4 text-stone-500" />
              </div>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
              <div className="h-full rounded-full bg-gradient-to-r from-flame-500 to-flame-300" style={{ width: `${Math.max(2, Math.min(100, society.percent || 0))}%` }} />
            </div>
          </button>
        );
      })}
    </section>
  );
}

function MobileWorkerCards({ rows = [] }) {
  return (
    <section className="space-y-3">
      {rows.slice(0, 12).map((row) => (
        <article key={`${row.RUT_Trabajador}-${row.Periodo}`} className="rounded-xl border border-white/10 bg-ink-900/95 p-3 shadow-[0_12px_28px_rgba(0,0,0,.22)]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-stone-100">{row.Nombre_Trabajador}</p>
              <p className="mt-1 truncate text-[11px] font-bold text-stone-500">{shortName(row.Nombre_Sociedad)} · {row.Periodo}</p>
            </div>
            <p className="shrink-0 text-sm font-black text-flame-300">{formatCurrency(row.Total_Costo)}</p>
          </div>
          <p className="mt-2 line-clamp-2 text-xs font-bold leading-5 text-stone-300">{row.Cargo}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] font-bold text-stone-300">{row.Tipo_Trabajador}</span>
            <span className="rounded-full border border-flame-400/25 px-2 py-1 text-[10px] font-bold text-flame-300">{row.Contrato_Trabajador}</span>
          </div>
        </article>
      ))}
    </section>
  );
}

function MobileFilterSheet({ open, onClose, filters, setFilters, options, lockedCompany }) {
  const update = (key, value) => setFilters((current) => ({ ...current, [key]: value }));
  const defaultPeriod = options.periods?.[0] || "Todos";
  const isCompanyLocked = lockedCompany !== "Todas";
  const reset = () =>
    setFilters({
      period: defaultPeriod,
      company: isCompanyLocked ? lockedCompany : "Todas",
      businessCenter: "Todos",
      workerType: "Todos",
      contract: "Todos",
      searchTerm: "",
    });

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden">
      <button type="button" aria-label="Cerrar filtros" className="absolute inset-0 h-full w-full cursor-default" onClick={onClose} />
      <section className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-2xl border border-white/10 bg-ink-900 p-4 shadow-[0_-24px_60px_rgba(0,0,0,.45)]">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="tiny-label text-flame-300">Filtros</p>
            <h2 className="mt-1 text-lg font-black text-stone-50">Ajustar vista</h2>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.05] text-stone-200">
            <X size={18} />
          </button>
        </div>
        <div className="grid gap-3">
          <MobileSelect label="Periodo" value={filters.period} onChange={(value) => update("period", value)} options={options.periods} allLabel="Todos" />
          <MobileSelect
            label={isCompanyLocked ? "Sociedad seleccionada" : "Empresa"}
            value={isCompanyLocked ? lockedCompany : filters.company}
            onChange={(value) => update("company", value)}
            options={isCompanyLocked ? [] : options.companies}
            allLabel="Todas"
            disabled={isCompanyLocked}
          />
          <MobileSelect label="Centro de Negocio" value={filters.businessCenter} onChange={(value) => update("businessCenter", value)} options={options.businessCenters} allLabel="Todos" />
          <MobileSelect label="Tipo trabajador" value={filters.workerType} onChange={(value) => update("workerType", value)} options={options.workerTypes} allLabel="Todos" />
          <MobileSelect label="Tipo Contrato" value={filters.contract} onChange={(value) => update("contract", value)} options={options.contracts} allLabel="Todos" />
          <label className="flex min-w-0 flex-col gap-1.5">
            <span className="tiny-label">Buscar trabajador</span>
            <span className="flex h-11 min-w-0 items-center gap-2 rounded-lg border border-white/10 bg-ink-800 px-3 focus-within:border-flame-400">
              <Search size={15} className="shrink-0 text-flame-400" />
              <input
                type="search"
                value={filters.searchTerm || ""}
                onChange={(event) => update("searchTerm", event.target.value)}
                placeholder="Nombre, RUT o cargo"
                className="h-full min-w-0 flex-1 bg-transparent text-sm font-bold text-stone-100 outline-none placeholder:text-stone-500"
              />
            </span>
          </label>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button type="button" onClick={reset} className="h-11 rounded-xl border border-white/10 bg-white/[0.05] text-xs font-black uppercase tracking-[0.08em] text-stone-200">
            Restablecer
          </button>
          <button type="button" onClick={onClose} className="h-11 rounded-xl border border-flame-400/35 bg-flame-500/15 text-xs font-black uppercase tracking-[0.08em] text-flame-200">
            Aplicar
          </button>
        </div>
      </section>
    </div>
  );
}

function MobileBottomNav({ activeTab, onChange }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink-950/92 px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-18px_42px_rgba(0,0,0,.38)] backdrop-blur-xl md:hidden">
      <div className="grid grid-cols-5 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`flex h-12 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-black transition ${
                active ? "bg-flame-500/14 text-flame-200" : "text-stone-500"
              }`}
            >
              <Icon size={17} strokeWidth={2.4} />
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default function MobileExecutiveDashboard({
  activeCompany,
  sidebarPeriodLabel,
  societies,
  filters,
  setFilters,
  options,
  analytics,
  scope,
  isCorporate,
  isAllPeriods,
  onSelectCompany,
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const searchTerm = String(filters.searchTerm || "").trim();
  const activeChips = [
    filters.period !== "Todos" ? { label: "Periodo", value: filters.period } : null,
    activeCompany !== "Todas" ? { label: "Sociedad", value: shortName(activeCompany) } : filters.company !== "Todas" ? { label: "Empresa", value: shortName(filters.company) } : null,
    filters.businessCenter !== "Todos" ? { label: "Centro", value: filters.businessCenter } : null,
    filters.workerType !== "Todos" ? { label: "Tipo", value: filters.workerType } : null,
    filters.contract !== "Todos" ? { label: "Contrato", value: filters.contract } : null,
    searchTerm ? { label: "Buscar", value: searchTerm } : null,
  ].filter(Boolean);

  const trendData = isAllPeriods ? analytics.monthlyTrend : analytics.periodComparison?.monthlySeries || analytics.monthlyTrend;
  const delta = useMemo(() => {
    const series = trendData || [];
    const current =
      !isAllPeriods && analytics.periodComparison
        ? {
            period: analytics.periodComparison.selectedPeriod,
            totalCost: analytics.periodComparison.selectedCost,
            previousPeriod: analytics.periodComparison.previousPeriod,
            previousCost: analytics.periodComparison.previousCost,
          }
        : series.length > 1
          ? {
              period: series[series.length - 1].period,
              totalCost: series[series.length - 1].totalCost,
              previousPeriod: series[series.length - 2].period,
              previousCost: series[series.length - 2].totalCost,
            }
          : null;

    if (!current?.previousCost) {
      return { label: "N/D", detail: "Sin periodo anterior" };
    }

    const value = current.totalCost - current.previousCost;
    const percent = (value / current.previousCost) * 100;
    return {
      label: `${value > 0 ? "+" : ""}${formatPercent(percent)}`,
      detail: `vs ${current.previousPeriod}`,
    };
  }, [analytics.periodComparison, isAllPeriods, trendData]);

  const rankingData = isCorporate ? analytics.companyCosts : analytics.businessCenterCosts;
  const rankingTitle = isCorporate ? "Ranking sociedades" : "Ranking centros";

  return (
    <div className="min-h-screen bg-ink-950 text-stone-100 md:hidden">
      <MobileTopBar
        activeCompany={activeCompany}
        periodLabel={sidebarPeriodLabel}
        activeChips={activeChips}
        onOpenFilters={() => setFiltersOpen(true)}
      />

      <main className="space-y-4 px-3 pb-24 pt-3">
        {activeTab === "home" ? (
          <>
            <MobileKpiGrid stats={analytics.stats} delta={delta} />
            <section className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
              <p className="tiny-label text-flame-300">Resumen ejecutivo</p>
              <p className="mt-2 text-sm font-bold leading-6 text-stone-200">
                {formatCompactCurrency(analytics.stats.totalCost)} en {scope.workers} trabajadores y {scope.businessCenters} centros activos.
              </p>
            </section>
            <MobileTrendCard data={trendData} />
            <MobileRankingList title={rankingTitle} data={rankingData} compactCompany={isCorporate} />
            <button
              type="button"
              onClick={() => setActiveTab("people")}
              className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-ink-900/95 p-4 text-left"
            >
              <span>
                <span className="tiny-label block text-stone-500">Personas</span>
                <span className="mt-1 block text-sm font-black text-stone-100">Ver trabajadores principales</span>
              </span>
              <ChevronRight className="text-flame-300" size={18} />
            </button>
          </>
        ) : null}

        {activeTab === "societies" ? (
          <>
            <MobileSocietyList societies={societies} activeCompany={activeCompany} onSelectCompany={onSelectCompany} />
          </>
        ) : null}

        {activeTab === "trend" ? (
          <>
            <MobileTrendCard data={trendData} title={isAllPeriods ? "Tendencia mensual" : `Contexto ${filters.period}`} />
          </>
        ) : null}

        {activeTab === "ranking" ? <MobileRankingList title={rankingTitle} data={rankingData} compactCompany={isCorporate} /> : null}

        {activeTab === "people" ? (
          <>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="tiny-label text-stone-500">Personas</p>
                <h2 className="text-lg font-black text-stone-50">Top trabajadores</h2>
              </div>
              <Table2 size={18} className="text-flame-400" />
            </div>
            <MobileWorkerCards rows={analytics.tableRows} />
          </>
        ) : null}
      </main>

      <MobileFilterSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        setFilters={setFilters}
        options={options}
        lockedCompany={activeCompany}
      />
      <MobileBottomNav activeTab={activeTab} onChange={setActiveTab} />
    </div>
  );
}
