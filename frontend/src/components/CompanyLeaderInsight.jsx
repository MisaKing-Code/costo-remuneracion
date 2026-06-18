import { Crown } from "lucide-react";
import SectionCard from "./SectionCard";
import { formatCompactCurrency, formatPercent, shortName } from "../utils/formatters";

function safeNumber(value) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getVariation(society, selectedPeriod) {
  const trend = Array.isArray(society?.trend) ? society.trend.filter((item) => item?.period) : [];

  if (trend.length < 2) {
    return { hasComparison: false, label: "Sin comparacion disponible", value: 0, percent: null, detail: "" };
  }

  const currentIndex =
    selectedPeriod && selectedPeriod !== "Todos" ? trend.findIndex((item) => item.period === selectedPeriod) : trend.length - 1;

  if (currentIndex <= 0) {
    return { hasComparison: false, label: "Sin comparacion disponible", value: 0, percent: null, detail: "" };
  }

  const current = trend[currentIndex];
  const previous = trend[currentIndex - 1];
  const previousCost = safeNumber(previous.totalCost);

  if (!previousCost) {
    return { hasComparison: false, label: "Sin comparacion disponible", value: 0, percent: null, detail: "" };
  }

  const value = safeNumber(current.totalCost) - previousCost;
  const percent = (value / previousCost) * 100;

  return {
    hasComparison: true,
    label: `${value > 0 ? "+" : ""}${formatPercent(percent)}`,
    value,
    percent,
    detail: `vs ${previous.period}`,
  };
}

function buildInsight(percent, variation) {
  const participationText =
    percent > 50
      ? "Concentra mas de la mitad del costo total."
      : percent >= 30
        ? "Representa una porcion relevante del costo corporativo."
        : "Participacion distribuida respecto al resto de sociedades.";
  const variationText = variation.hasComparison
    ? variation.value > 0
      ? "Presenta crecimiento respecto al periodo anterior."
      : variation.value < 0
        ? "Presenta reduccion respecto al periodo anterior."
        : "Se mantiene estable respecto al periodo anterior."
    : "";

  return [participationText, variationText].filter(Boolean).join(" ");
}

function DetailItem({ label, value, accent = false }) {
  return (
    <div className="rounded-lg border border-white/[0.08] bg-white/[0.035] p-3">
      <p className="tiny-label text-stone-500">{label}</p>
      <p className={`mt-2 text-lg font-black leading-none ${accent ? "text-flame-200" : "text-stone-50"}`}>{value}</p>
    </div>
  );
}

export default function CompanyLeaderInsight({ data = [], comparisonData = [], selectedPeriod = "Todos" }) {
  const currentLeader = [...data].filter((item) => safeNumber(item.value) > 0).sort((a, b) => safeNumber(b.value) - safeNumber(a.value))[0];
  const comparisonLeader = comparisonData.find((item) => item.name === currentLeader?.name);
  const variation = getVariation(comparisonLeader, selectedPeriod);
  const workers = safeNumber(currentLeader?.workers);
  const costPerWorker = workers ? safeNumber(currentLeader.value) / workers : 0;

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
    <SectionCard title="Sociedad lider" subtitle="Principal foco del costo filtrado" icon={Crown}>
      <div className="grid gap-3">
        <div className="rounded-lg border border-flame-400/25 bg-flame-500/[0.10] p-3 shadow-[0_0_22px_rgba(255,123,85,.10)]">
          <p className="tiny-label text-flame-300">Sociedad lider</p>
          <h3 className="mt-2 line-clamp-2 text-lg font-black leading-6 text-stone-50">{shortName(currentLeader.name)}</h3>
          <div className="mt-4 flex items-end justify-between gap-3">
            <p className="text-3xl font-black leading-none text-flame-200">{formatCompactCurrency(currentLeader.value)}</p>
            <p className="text-right text-sm font-black text-stone-100">{formatPercent(currentLeader.percent)} del costo total</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <DetailItem label="Trabajadores" value={workers || "Sin dotacion"} />
          <DetailItem label="Costo/trabajador" value={workers ? formatCompactCurrency(costPerWorker) : "Sin dotacion"} accent />
        </div>

        <div className="rounded-lg border border-white/[0.08] bg-white/[0.035] p-3">
          <p className="tiny-label text-stone-500">Variacion</p>
          <p className={`mt-2 text-lg font-black leading-none ${variation.value < 0 ? "text-emerald-300" : "text-flame-200"}`}>
            {variation.label}
          </p>
          {variation.detail ? <p className="mt-1 text-[11px] font-bold text-stone-500">{variation.detail}</p> : null}
        </div>

        <div className="rounded-lg border border-flame-400/20 bg-black/20 p-3">
          <p className="tiny-label text-flame-300">Lectura ejecutiva</p>
          <p className="mt-2 text-sm font-bold leading-6 text-stone-200">{buildInsight(currentLeader.percent, variation)}</p>
        </div>
      </div>
    </SectionCard>
  );
}
