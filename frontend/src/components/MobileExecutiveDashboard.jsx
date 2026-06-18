import {
  BarChart3,
  BriefcaseBusiness,
  Building2,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  Filter,
  Home,
  LineChart as LineChartIcon,
  MapPinned,
  Search,
  Sparkles,
  Table2,
  UsersRound,
  X,
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useEffect, useMemo, useState } from "react";
import MobileBusinessCentersView from "./MobileBusinessCentersView";
import { formatCompactCurrency, formatCurrency, formatPercent, shortName } from "../utils/formatters";

const tabs = [
  { id: "home", label: "Inicio", icon: Home },
  { id: "societies", label: "Sociedades", icon: Building2 },
  { id: "centers", label: "Centros", icon: MapPinned },
  { id: "trend", label: "Tendencia", icon: LineChartIcon },
  { id: "people", label: "Personas", icon: UsersRound },
];

function safeNumber(value) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatSafePercent(value) {
  return formatPercent(Number.isFinite(value) ? value : 0);
}

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
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-flame-400/30 bg-flame-500/12 text-flame-200 shadow-[0_0_18px_rgba(255,123,85,.13)] transition-all duration-200 active:scale-[0.96] active:bg-flame-500/20"
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
    <article className="rounded-xl border border-white/10 bg-ink-900/95 p-3 shadow-[0_12px_28px_rgba(0,0,0,.24)] transition-all duration-200 active:scale-[0.98]">
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

function SkeletonBlock({ className = "" }) {
  return <div className={`animate-pulse rounded-lg bg-white/[0.07] ${className}`} />;
}

function MobileSkeletonDashboard() {
  return (
    <main className="space-y-4 px-3 pb-24 pt-3">
      <section className="grid grid-cols-2 gap-3">
        {[0, 1, 2, 3].map((item) => (
          <article key={item} className="rounded-xl border border-white/10 bg-ink-900/95 p-3">
            <SkeletonBlock className="h-8 w-8" />
            <SkeletonBlock className="mt-4 h-3 w-20" />
            <SkeletonBlock className="mt-3 h-6 w-24" />
            <SkeletonBlock className="mt-3 h-3 w-full" />
          </article>
        ))}
      </section>
      <section className="rounded-xl border border-white/10 bg-ink-900/95 p-3">
        <SkeletonBlock className="h-4 w-32" />
        <SkeletonBlock className="mt-4 h-[210px] w-full" />
      </section>
      <section className="space-y-3">
        {[0, 1, 2].map((item) => (
          <SkeletonBlock key={item} className="h-20 w-full" />
        ))}
      </section>
    </main>
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

function SocietyQuickChips({ societies = [], activeCompany, onSelectCompany }) {
  return (
    <section className="scrollbar-dark -mx-3 flex gap-2 overflow-x-auto px-3 pb-1">
      <button
        type="button"
        onClick={() => onSelectCompany("Todas")}
        aria-pressed={activeCompany === "Todas"}
        className={`min-h-11 shrink-0 rounded-xl border px-3 text-left transition-all duration-200 active:scale-[0.98] ${
          activeCompany === "Todas"
            ? "border-flame-400/45 bg-flame-500/14 text-flame-100 shadow-[0_0_18px_rgba(255,123,85,.14)]"
            : "border-white/10 bg-ink-900/95 text-stone-300"
        }`}
      >
        <span className="block text-xs font-black">Todas</span>
        <span className="mt-0.5 block text-[10px] font-bold text-stone-500">Vista general</span>
      </button>
      {societies.map((society) => {
        const active = activeCompany === society.name;
        return (
          <button
            key={society.name}
            type="button"
            onClick={() => onSelectCompany(society.name)}
            aria-pressed={active}
            className={`min-h-11 w-[148px] shrink-0 rounded-xl border px-3 text-left transition-all duration-200 active:scale-[0.98] ${
              active
                ? "border-flame-400/45 bg-flame-500/14 text-flame-100 shadow-[0_0_18px_rgba(255,123,85,.14)]"
                : "border-white/10 bg-ink-900/95 text-stone-300"
            }`}
          >
            <span className="block truncate text-xs font-black">{shortName(society.name)}</span>
            <span className="mt-0.5 block text-[10px] font-bold text-stone-500">{formatSafePercent(society.percent)}</span>
          </button>
        );
      })}
    </section>
  );
}

function ExecutiveBrief({ analytics, societies = [], activeCompany, isCorporate, delta }) {
  const leader = societies[0];
  const mainCenter = analytics.businessCenterCosts?.[0];
  const hasCost = safeNumber(analytics.stats?.totalCost) > 0;
  const leaderText = isCorporate
    ? leader
      ? `${shortName(leader.name)} concentra ${formatSafePercent(leader.percent)}`
      : "Sin sociedad lider disponible"
    : mainCenter
      ? `${mainCenter.name} lidera los centros de costo`
      : "Sin centro principal disponible";
  const variationText =
    delta.direction === "up"
      ? `Aumento ${delta.label} ${delta.detail}`
      : delta.direction === "down"
        ? `Disminucion ${delta.label} ${delta.detail}`
        : "Sin comparacion disponible";
  const insight =
    !isCorporate
      ? `La vista actual corresponde a ${shortName(activeCompany)}; el analisis se enfoca en centros, contratos y trabajadores de esa sociedad.`
      : leader && leader.percent > 50
        ? `La sociedad lider concentra el ${formatSafePercent(leader.percent)} del costo total del periodo.`
        : leader
          ? `La distribucion corporativa no presenta una concentracion dominante sobre 50%.`
          : "No hay ranking disponible para generar una lectura de concentracion.";
  const movement =
    delta.direction === "up"
      ? "El costo remuneracional muestra un aumento respecto al periodo anterior."
      : delta.direction === "down"
        ? "El costo remuneracional muestra una disminucion respecto al periodo anterior."
        : "La lectura actual es descriptiva porque no hay comparacion disponible.";
  const items = [
    { icon: CircleDollarSign, label: "Costo del periodo", value: hasCost ? formatCompactCurrency(analytics.stats.totalCost) : "Sin datos" },
    { icon: Building2, label: isCorporate ? "Sociedad lider" : "Centro principal", value: leaderText },
    { icon: UsersRound, label: "Dotacion analizada", value: `${safeNumber(analytics.stats?.workers)} trabajadores` },
    { icon: MapPinned, label: "Senal del periodo", value: variationText },
  ];

  return (
    <section className="space-y-3">
      <div className="rounded-xl border border-flame-400/20 bg-flame-500/[0.08] p-3 shadow-[0_14px_34px_rgba(0,0,0,.24)]">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl border border-flame-300/25 bg-flame-500/12 text-flame-200">
            <Sparkles size={17} strokeWidth={2.4} />
          </div>
          <div>
            <p className="tiny-label text-flame-300">Insight ejecutivo</p>
            <h2 className="text-lg font-black text-stone-50">Resumen Ejecutivo</h2>
          </div>
        </div>
        <p className="mt-3 text-sm font-bold leading-6 text-stone-200">{insight}</p>
        <p className="mt-2 text-xs font-semibold leading-5 text-stone-400">{movement}</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.label} className="rounded-xl border border-white/10 bg-ink-900/95 p-2.5 transition-all duration-200 active:scale-[0.98]">
              <div className="flex items-start gap-2">
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-flame-400/20 bg-flame-500/12 text-flame-300">
                  <Icon size={15} strokeWidth={2.4} />
                </div>
                <div className="min-w-0">
                  <p className="tiny-label text-stone-500">{item.label}</p>
                  <p className="mt-1 line-clamp-2 text-xs font-black leading-4 text-stone-100">{item.value}</p>
                </div>
              </div>
            </article>
          );
        })}
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
            className={`relative w-full overflow-hidden rounded-xl border p-3 text-left transition-all duration-200 active:scale-[0.98] ${
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

function MobileWorkerCards({ rows = [], totalCost = 0 }) {
  const [expanded, setExpanded] = useState(null);

  return (
    <section className="space-y-3">
      {rows.slice(0, 12).map((row) => {
        const key = `${row.RUT_Trabajador || row.Nombre_Trabajador}-${row.Periodo || "periodo"}`;
        const isOpen = expanded === key;
        const share = totalCost ? (safeNumber(row.Total_Costo) / totalCost) * 100 : null;

        return (
          <article
            key={key}
            className="rounded-xl border border-white/10 bg-ink-900/95 p-3 shadow-[0_12px_28px_rgba(0,0,0,.22)] transition-all duration-200 active:scale-[0.98]"
          >
            <button type="button" onClick={() => setExpanded(isOpen ? null : key)} className="w-full text-left">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-stone-100">{row.Nombre_Trabajador}</p>
                  <p className="mt-1 truncate text-[11px] font-bold text-stone-500">
                    {shortName(row.Nombre_Sociedad)} · {row.Periodo || "Sin periodo"}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-black text-flame-300">{formatCurrency(row.Total_Costo)}</p>
              </div>
              <p className="mt-2 line-clamp-2 text-xs font-bold leading-5 text-stone-300">{row.Cargo}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {row.Tipo_Trabajador ? (
                  <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] font-bold text-stone-300">
                    {row.Tipo_Trabajador}
                  </span>
                ) : null}
                {row.Contrato_Trabajador ? (
                  <span className="rounded-full border border-flame-400/25 px-2 py-1 text-[10px] font-bold text-flame-300">
                    {row.Contrato_Trabajador}
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2 py-1 text-[10px] font-bold text-stone-400">
                  Ver detalle
                  <ChevronDown size={12} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                </span>
              </div>
            </button>
            {isOpen ? (
              <div className="mt-3 grid gap-2 rounded-lg border border-white/[0.07] bg-black/20 p-3 text-[11px] font-bold text-stone-300">
                {row.Centro_de_Negocio ? (
                  <div className="flex justify-between gap-3">
                    <span className="text-stone-500">Centro</span>
                    <span className="text-right text-stone-100">{row.Centro_de_Negocio}</span>
                  </div>
                ) : null}
                {row.Contrato_Trabajador ? (
                  <div className="flex justify-between gap-3">
                    <span className="text-stone-500">Contrato</span>
                    <span className="text-right text-stone-100">{row.Contrato_Trabajador}</span>
                  </div>
                ) : null}
                <div className="flex justify-between gap-3">
                  <span className="text-stone-500">Total haberes</span>
                  <span className="text-right text-stone-100">{formatCurrency(row.Total_Haberes)}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-stone-500">Costo remuneracional</span>
                  <span className="text-right text-flame-300">{formatCurrency(row.Total_Costo)}</span>
                </div>
                {share !== null ? (
                  <div className="flex justify-between gap-3">
                    <span className="text-stone-500">Participacion</span>
                    <span className="text-right text-stone-100">{formatSafePercent(share)}</span>
                  </div>
                ) : null}
                {row.RUT_Trabajador ? (
                  <div className="flex justify-between gap-3">
                    <span className="text-stone-500">RUT</span>
                    <span className="text-right text-stone-100">{row.RUT_Trabajador}</span>
                  </div>
                ) : null}
              </div>
            ) : null}
          </article>
        );
      })}
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
          <button type="button" onClick={reset} className="h-11 rounded-xl border border-white/10 bg-white/[0.05] text-xs font-black uppercase tracking-[0.08em] text-stone-200 transition-all duration-200 active:scale-[0.98]">
            Restablecer
          </button>
          <button type="button" onClick={onClose} className="h-11 rounded-xl border border-flame-400/35 bg-flame-500/15 text-xs font-black uppercase tracking-[0.08em] text-flame-200 transition-all duration-200 active:scale-[0.98]">
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
              className={`flex h-12 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-black transition-all duration-200 active:scale-[0.94] ${
                active ? "bg-flame-500/16 text-flame-200 shadow-[0_0_14px_rgba(255,123,85,.12)]" : "text-stone-500"
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
  const [isHydrating, setIsHydrating] = useState(true);
  const searchTerm = String(filters.searchTerm || "").trim();

  useEffect(() => {
    const timer = window.setTimeout(() => setIsHydrating(false), 320);

    return () => window.clearTimeout(timer);
  }, []);
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
      return { label: "N/D", detail: "Sin periodo anterior", direction: "neutral", value: 0, percent: null };
    }

    const value = current.totalCost - current.previousCost;
    const percent = (value / current.previousCost) * 100;
    return {
      label: `${value > 0 ? "+" : ""}${formatPercent(percent)}`,
      detail: `vs ${current.previousPeriod}`,
      direction: value > 0 ? "up" : value < 0 ? "down" : "flat",
      value,
      percent,
    };
  }, [analytics.periodComparison, isAllPeriods, trendData]);

  return (
    <div className="min-h-screen bg-ink-950 text-stone-100 md:hidden">
      <MobileTopBar
        activeCompany={activeCompany}
        periodLabel={sidebarPeriodLabel}
        activeChips={activeChips}
        onOpenFilters={() => setFiltersOpen(true)}
      />

      {isHydrating ? (
        <MobileSkeletonDashboard />
      ) : (
      <main className="space-y-4 px-3 pb-24 pt-3">
        {activeTab === "home" ? (
          <>
            <SocietyQuickChips societies={societies} activeCompany={activeCompany} onSelectCompany={onSelectCompany} />
            <MobileKpiGrid stats={analytics.stats} delta={delta} />
            <ExecutiveBrief
              analytics={analytics}
              societies={societies}
              activeCompany={activeCompany}
              isCorporate={isCorporate}
              delta={delta}
            />
            <MobileTrendCard data={trendData} />
            {isCorporate ? <MobileRankingList title="Top sociedades" data={analytics.companyCosts} compactCompany /> : null}
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
            <SocietyQuickChips societies={societies} activeCompany={activeCompany} onSelectCompany={onSelectCompany} />
            <MobileSocietyList societies={societies} activeCompany={activeCompany} onSelectCompany={onSelectCompany} />
          </>
        ) : null}

        {activeTab === "centers" ? (
          <MobileBusinessCentersView data={analytics.businessCenterCosts} visibleCenters={scope.businessCenters} />
        ) : null}

        {activeTab === "trend" ? (
          <>
            <MobileTrendCard data={trendData} title={isAllPeriods ? "Tendencia mensual" : `Contexto ${filters.period}`} />
          </>
        ) : null}

        {activeTab === "people" ? (
          <>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="tiny-label text-stone-500">Personas</p>
                <h2 className="text-lg font-black text-stone-50">Top trabajadores</h2>
              </div>
              <Table2 size={18} className="text-flame-400" />
            </div>
            <MobileWorkerCards rows={analytics.tableRows} totalCost={analytics.stats.totalCost} />
          </>
        ) : null}
      </main>
      )}

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
