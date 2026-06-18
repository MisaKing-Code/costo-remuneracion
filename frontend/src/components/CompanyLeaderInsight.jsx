import { Crown } from "lucide-react";
import SectionCard from "./SectionCard";
import { formatCompactCurrency, formatPercent, shortName } from "../utils/formatters";

function safeNumber(value) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getVariation(society, selectedPeriod) {
  const trend = Array.isArray(society?.trend) ? society.trend.filter((item) => item?.period) : [];
  const isAllPeriods = !selectedPeriod || selectedPeriod === "Todos";

  if (trend.length < 2) {
    return {
      hasComparison: false,
      label: "Sin comparacion disponible",
      value: 0,
      percent: null,
      detail: "",
      isAllPeriods,
    };
  }

  const currentIndex = isAllPeriods ? trend.length - 1 : trend.findIndex((item) => item.period === selectedPeriod);

  if (currentIndex <= 0) {
    return {
      hasComparison: false,
      label: "Sin comparacion disponible",
      value: 0,
      percent: null,
      detail: "",
      isAllPeriods,
    };
  }

  const current = trend[currentIndex];
  const previous = trend[currentIndex - 1];
  const previousCost = safeNumber(previous.totalCost);

  if (!previousCost) {
    return {
      hasComparison: false,
      label: "Sin comparacion disponible",
      value: 0,
      percent: null,
      detail: "",
      isAllPeriods,
      currentPeriod: current.period,
      previousPeriod: previous.period,
    };
  }

  const value = safeNumber(current.totalCost) - previousCost;
  const percent = (value / previousCost) * 100;

  return {
    hasComparison: true,
    label: `${value > 0 ? "+" : ""}${formatPercent(percent)}`,
    value,
    percent,
    detail: isAllPeriods ? `${current.period} vs ${previous.period}` : `vs ${previous.period}`,
    isAllPeriods,
    currentPeriod: current.period,
    previousPeriod: previous.period,
  };
}

function getVariationState(variation) {
  if (!variation.hasComparison || variation.percent === null) {
    return { label: "Sin comparacion", className: "border-white/[0.08] bg-white/[0.04] text-stone-400" };
  }

  if (variation.percent > 10) {
    return { label: "Crecimiento fuerte", className: "border-flame-300/30 bg-flame-500/15 text-flame-200" };
  }

  if (variation.percent > 3) {
    return { label: "Crecimiento moderado", className: "border-flame-300/25 bg-flame-500/10 text-flame-200" };
  }

  if (variation.percent >= -3) {
    return { label: "Estable", className: "border-stone-300/20 bg-white/[0.045] text-stone-300" };
  }

  if (variation.percent < -10) {
    return { label: "Contraccion fuerte", className: "border-emerald-300/30 bg-emerald-500/12 text-emerald-200" };
  }

  return { label: "Contraccion moderada", className: "border-emerald-300/25 bg-emerald-500/10 text-emerald-200" };
}

function buildInsight(leader, variation) {
  const name = shortName(leader.name);
  const percent = formatPercent(leader.percent);
  const roleText =
    leader.percent > 50
      ? "continua siendo la principal fuente de costo corporativo"
      : leader.percent >= 30
        ? "representa una porcion relevante del costo corporativo"
        : "mantiene una participacion distribuida frente al resto de sociedades";

  if (!variation.hasComparison) {
    return `${name} ${roleText}, concentrando el ${percent} del total filtrado. No existe comparacion disponible para el periodo.`;
  }

  const movement =
    variation.percent > 3
      ? "un crecimiento"
      : variation.percent < -3
        ? "una contraccion"
        : "estabilidad";

  const context = variation.isAllPeriods ? "En el ultimo periodo visible" : "Durante el periodo";

  return `${name} ${roleText}, concentrando el ${percent} del total filtrado. ${context} registro ${movement} de ${formatPercent(Math.abs(variation.percent))} respecto al periodo anterior.`;
}

function DetailItem({ label, value, hint, accent = false }) {
  return (
    <div className="rounded-lg border border-white/[0.08] bg-white/[0.035] p-3">
      <p className="tiny-label text-stone-400">{label}</p>
      <p className={`mt-2 text-lg font-black leading-none ${accent ? "text-flame-200" : "text-stone-50"}`}>{value}</p>
      {hint ? <p className="mt-1 text-[11px] font-bold text-stone-300">{hint}</p> : null}
    </div>
  );
}

export default function CompanyLeaderInsight({ data = [], comparisonData = [], selectedPeriod = "Todos" }) {
  const currentLeader = [...data].filter((item) => safeNumber(item.value) > 0).sort((a, b) => safeNumber(b.value) - safeNumber(a.value))[0];
  const comparisonLeader = comparisonData.find((item) => item.name === currentLeader?.name);
  const variation = getVariation(comparisonLeader, selectedPeriod);
  const variationState = getVariationState(variation);
  const workers = safeNumber(currentLeader?.workers);
  const costPerWorker = workers ? safeNumber(currentLeader.value) / workers : 0;
  const visibleWithWorkers = data.filter((item) => safeNumber(item.value) > 0 && safeNumber(item.workers) > 0);
  const totalVisibleCost = visibleWithWorkers.reduce((total, item) => total + safeNumber(item.value), 0);
  const totalVisibleWorkers = visibleWithWorkers.reduce((total, item) => total + safeNumber(item.workers), 0);
  const averageCostPerWorker = totalVisibleWorkers ? totalVisibleCost / totalVisibleWorkers : 0;
  const efficiencyDelta = averageCostPerWorker && costPerWorker ? ((costPerWorker - averageCostPerWorker) / averageCostPerWorker) * 100 : null;
  const efficiencyLabel =
    efficiencyDelta === null
      ? "Sin benchmark"
      : `${efficiencyDelta >= 0 ? "+" : ""}${formatPercent(efficiencyDelta)} ${
          efficiencyDelta >= 0 ? "sobre promedio sociedades" : "bajo promedio sociedades"
        }`;

  if (!currentLeader) {
    return (
      <SectionCard title="Sociedad lider" subtitle="Contexto ejecutivo" icon={Crown}>
        <div className="rounded-lg border border-white/[0.08] bg-white/[0.035] p-5 text-center">
          <p className="tiny-label text-flame-300">Analisis no disponible</p>
          <p className="mt-2 text-sm font-bold text-stone-300">Sin datos suficientes.</p>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="Sociedad lider"
      subtitle="Principal foco del costo filtrado"
      icon={Crown}
      className="transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(255,123,85,.08)]"
    >
      <div className="grid gap-3">
        <div className="rounded-lg border border-flame-400/25 bg-flame-500/[0.10] p-3 shadow-[0_0_22px_rgba(255,123,85,.10)] transition duration-300 hover:border-flame-300/35 hover:bg-flame-500/[0.12] hover:shadow-[0_0_30px_rgba(255,123,85,.14)]">
          <p className="tiny-label text-flame-300">Sociedad lider</p>
          <h3 className="mt-2 line-clamp-2 text-lg font-black leading-6 text-stone-50">{shortName(currentLeader.name)}</h3>
          <div className="mt-4 flex items-end justify-between gap-3">
            <p className="text-3xl font-black leading-none text-flame-200">{formatCompactCurrency(currentLeader.value)}</p>
            <p className="text-right text-sm font-black text-stone-100">{formatPercent(currentLeader.percent)} del costo total</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <DetailItem label="Trabajadores" value={workers || "Sin dotacion"} />
          <DetailItem
            label="Costo/trabajador"
            value={workers ? formatCompactCurrency(costPerWorker) : "Sin dotacion"}
            hint={workers ? efficiencyLabel : null}
            accent
          />
        </div>

        <div className="rounded-lg border border-white/[0.08] bg-white/[0.035] p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="tiny-label text-stone-400">{variation.isAllPeriods ? "Variacion ultimo periodo" : "Variacion"}</p>
            <span className={`rounded-full border px-2 py-1 text-[10px] font-black uppercase tracking-[0.08em] ${variationState.className}`}>
              {variationState.label}
            </span>
          </div>
          <p className={`mt-2 text-lg font-black leading-none ${variation.value < 0 ? "text-emerald-300" : "text-flame-200"}`}>
            {variation.label}
          </p>
          {variation.detail ? <p className="mt-1 text-[11px] font-bold text-stone-400">{variation.detail}</p> : null}
        </div>

        <div className="rounded-lg border border-flame-400/20 bg-black/20 p-3">
          <p className="tiny-label text-flame-300">Lectura ejecutiva</p>
          <p className="mt-2 text-sm font-bold leading-7 text-stone-200">{buildInsight(currentLeader, variation)}</p>
        </div>
      </div>
    </SectionCard>
  );
}
