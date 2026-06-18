import { Gauge } from "lucide-react";
import SectionCard from "./SectionCard";
import { formatPercent } from "../utils/formatters";

function concentrationLevel(topTwoPercent) {
  if (topTwoPercent >= 80) {
    return { label: "ALTO", className: "border-flame-400/35 bg-flame-500/[0.12] text-flame-200" };
  }

  if (topTwoPercent >= 60) {
    return { label: "MEDIO", className: "border-amber-300/25 bg-amber-300/[0.10] text-amber-100" };
  }

  return { label: "BAJO", className: "border-stone-200/15 bg-white/[0.055] text-stone-200" };
}

function MetricBox({ label, value, featured = false }) {
  return (
    <article
      className={`rounded-lg border p-3 ${
        featured
          ? "border-flame-400/30 bg-flame-500/[0.10] shadow-[0_0_22px_rgba(255,123,85,.10)]"
          : "border-white/[0.08] bg-white/[0.035]"
      }`}
    >
      <p className="tiny-label text-stone-500">{label}</p>
      <p className={`mt-2 font-black leading-none ${featured ? "text-3xl text-flame-200" : "text-2xl text-stone-50"}`}>{value}</p>
    </article>
  );
}

export default function CompanyConcentrationAnalysis({ data = [] }) {
  const activeCompanies = data.filter((item) => Number(item.value || 0) > 0);
  const sorted = [...activeCompanies].sort((a, b) => Number(b.value || 0) - Number(a.value || 0));
  const topOne = sorted[0]?.percent || 0;
  const topTwo = sorted.slice(0, 2).reduce((total, item) => total + Number(item.percent || 0), 0);
  const topThree = sorted.slice(0, 3).reduce((total, item) => total + Number(item.percent || 0), 0);
  const level = concentrationLevel(topTwo);

  return (
    <SectionCard title="Analisis de concentracion" subtitle="Participacion acumulada por sociedades" icon={Gauge}>
      {sorted.length ? (
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <MetricBox label="Sociedades activas" value={activeCompanies.length} />
            <MetricBox label="Top 1" value={formatPercent(topOne)} />
          </div>

          <MetricBox label="Top 2 acumulado" value={formatPercent(topTwo)} featured />

          <div className="grid grid-cols-2 gap-3">
            <MetricBox label="Top 3 acumulado" value={formatPercent(topThree)} />
            <article className={`rounded-lg border p-3 ${level.className}`}>
              <p className="tiny-label text-stone-500">Nivel de concentracion</p>
              <p className="mt-2 text-2xl font-black leading-none">{level.label}</p>
            </article>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-white/[0.08] bg-white/[0.035] p-5 text-center">
          <p className="tiny-label text-flame-300">Analisis no disponible</p>
          <p className="mt-2 text-sm font-bold text-stone-300">Sin datos suficientes.</p>
        </div>
      )}
    </SectionCard>
  );
}
