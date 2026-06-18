import { BadgeCheck } from "lucide-react";
import SectionCard from "./SectionCard";
import { formatCompactCurrency, formatPercent } from "../utils/formatters";

const segmentTones = [
  "bg-gradient-to-r from-flame-500 to-flame-300",
  "bg-gradient-to-r from-stone-300 to-stone-500",
  "bg-white/20",
];

function getPercent(value, total) {
  return total ? (Number(value || 0) / total) * 100 : 0;
}

function buildComposition(data) {
  const sorted = data.filter((item) => Number(item.value || 0) > 0).sort((a, b) => Number(b.value || 0) - Number(a.value || 0));
  const total = sorted.reduce((sum, item) => sum + Number(item.value || 0), 0);

  if (!sorted.length || !total) {
    return { total, items: [], displayItems: [], reading: "No hay contratos para los filtros actuales." };
  }

  const normalized = sorted.map((item) => ({
    ...item,
    percent: getPercent(item.value, total),
  }));
  const topTwo = normalized.slice(0, 2);
  const rest = normalized.slice(2);
  const other =
    rest.length > 0
      ? {
          name: "Otros",
          value: rest.reduce((sum, item) => sum + Number(item.value || 0), 0),
          percent: rest.reduce((sum, item) => sum + Number(item.percent || 0), 0),
        }
      : null;
  const displayItems = other ? [...topTwo, other] : topTwo;
  const main = normalized[0];

  if (normalized.length === 1) {
    return {
      total,
      items: normalized,
      displayItems,
      reading: `Todo el costo filtrado corresponde a ${main.name}.`,
    };
  }

  return {
    total,
    items: normalized,
    displayItems,
    reading: `El costo se concentra principalmente en contratos ${String(main.name || "").toLowerCase()}.`,
  };
}

function ContractMetric({ item, index }) {
  return (
    <article className="rounded-lg border border-white/[0.07] bg-white/[0.035] p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-stone-50">{item.name}</p>
          <p className="mt-1 text-[11px] font-bold text-stone-500">{index === 0 ? "Categoria principal" : "Categoria secundaria"}</p>
        </div>
        <span className="rounded-md border border-flame-400/25 bg-flame-500/[0.10] px-2 py-1 text-[11px] font-black tabular-nums text-flame-300">
          {formatPercent(item.percent)}
        </span>
      </div>
      <p className="mt-4 text-2xl font-black leading-none text-stone-50">{formatCompactCurrency(item.value)}</p>
    </article>
  );
}

export default function ContractCompositionCard({ title = "Costo por Tipo de Contrato", data = [] }) {
  const composition = buildComposition(data);
  const metricGridClass = composition.items.length > 1 ? "grid gap-3 lg:grid-cols-2" : "grid gap-3";

  return (
    <SectionCard title={title} subtitle="Composicion del costo filtrado" icon={BadgeCheck}>
      {composition.items.length ? (
        <div className="space-y-3">
          <div className={metricGridClass}>
            {composition.items.slice(0, 2).map((item, index) => (
              <ContractMetric key={item.name} item={item} index={index} />
            ))}
          </div>

          <div className="rounded-lg border border-white/[0.06] bg-black/20 p-3">
            <div className="flex h-3 overflow-hidden rounded-full bg-white/[0.06]">
              {composition.displayItems.map((item, index) => (
                <div
                  key={item.name}
                  className={`${segmentTones[index] || "bg-white/20"} min-w-[3px]`}
                  style={{ width: `${Math.max(item.percent, 0)}%` }}
                  title={`${item.name}: ${formatPercent(item.percent)}`}
                />
              ))}
            </div>
            <div className="mt-3 grid gap-2">
              {composition.displayItems.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between gap-3 text-[11px] font-bold">
                  <span className="flex min-w-0 items-center gap-2 text-stone-400">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${segmentTones[index] || "bg-white/20"}`} />
                    <span className="truncate">{item.name}</span>
                  </span>
                  <span className="shrink-0 text-stone-100">
                    {formatCompactCurrency(item.value)} | {formatPercent(item.percent)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-flame-400/20 bg-flame-500/[0.08] p-3">
            <p className="tiny-label text-flame-300">Lectura ejecutiva</p>
            <p className="mt-2 text-sm font-bold leading-6 text-stone-200">{composition.reading}</p>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-4 py-7 text-center">
          <p className="tiny-label text-stone-500">Sin datos</p>
          <p className="mt-2 text-sm font-bold text-stone-300">No hay tipos de contrato para los filtros actuales.</p>
        </div>
      )}
    </SectionCard>
  );
}
