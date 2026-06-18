import { Building2, MapPinned, UsersRound } from "lucide-react";
import { formatCompactCurrency, formatPercent, shortName } from "../utils/formatters";

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

function formatPeriodLabel(period) {
  return period === "Todos" ? "Todos los periodos" : period;
}

function buildExecutiveHeadline({ activePeriod, activeCompany, stats, leader, periodComparison }) {
  const periodLabel = formatPeriodLabel(activePeriod);
  const periodContext = activePeriod === "Todos" ? "acumulado" : "periodo activo";
  const costText = formatCompactCurrency(stats.totalCost);
  const leaderText = leader?.name
    ? `Sociedad lider: ${shortName(leader.name)}${leader.percent ? ` (${formatPercent(leader.percent)})` : ""}.`
    : activeCompany !== "Todas"
      ? `Sociedad seleccionada: ${shortName(activeCompany)}.`
      : "Sin sociedad lider disponible.";
  const hasComparison = periodComparison?.previousPeriod && periodComparison.deltaVsPreviousPct !== null;
  const variationText = hasComparison
    ? `Variacion vs ${periodComparison.previousPeriod}: ${periodComparison.deltaVsPrevious >= 0 ? "+" : ""}${formatPercent(periodComparison.deltaVsPreviousPct)}.`
    : "Sin comparacion contra periodo anterior disponible.";

  return `${periodLabel} (${periodContext}): costo total ${costText}. ${leaderText} ${variationText}`;
}

export default function Header({ stats, metadata, scope, activeCompany = "Todas", leader, periodComparison }) {
  const activePeriod = scope?.activePeriod || "Todos";
  const range = scope?.availablePeriodRange || metadata.period || "Sin rango";
  const filteredRecords = scope?.filteredRecords ?? 0;
  const workerMetric = scope?.workerMetric ?? stats.workerMetric;
  const workers = workerMetric?.value ?? scope?.workers ?? stats.workers;
  const workerLabel = workerMetric?.labelTrabajadores ?? "Trabajadores";
  const companies = scope?.companies ?? stats.companies;
  const businessCenters = scope?.businessCenters ?? 0;

  const isCorporate = activeCompany === "Todas";
  const title = isCorporate ? "Dashboard Corporativo de Remuneraciones" : `Dashboard Remuneracional · ${activeCompany}`;
  const executiveHeadline = buildExecutiveHeadline({ activePeriod, activeCompany, stats, leader, periodComparison });

  return (
    <header className="panel overflow-hidden p-4 sm:p-5">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-flame-400/30 bg-flame-500/[0.12] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-flame-300">
            <span className="h-1.5 w-1.5 rounded-full bg-flame-400 shadow-[0_0_16px_rgba(255,123,85,.95)]" />
            {isCorporate ? "Corporativo" : "Panel por sociedad"}
          </div>
          <h1 className="max-w-3xl text-2xl font-black leading-tight tracking-normal text-stone-50 sm:text-3xl">
            {title}
          </h1>
          <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-stone-400">
            Periodo disponible {range}. {filteredRecords} registros en el alcance actual.
          </p>
          <p className="mt-2 max-w-3xl text-sm font-bold leading-6 text-stone-200">
            {executiveHeadline}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold">
            <ScopePill icon={UsersRound} label={workerLabel} value={workers} />
            <ScopePill icon={Building2} label="Empresas" value={companies} />
            <ScopePill icon={MapPinned} label="Centros" value={businessCenters} />
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
          <div className="grid min-w-[250px] gap-2 rounded-lg border border-white/10 bg-black/[0.18] p-2">
            <div className="rounded-lg bg-white/[0.05] p-3">
              <p className="tiny-label">Rango disponible</p>
              <p className="mt-1 truncate text-sm font-bold text-stone-100">{range}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
