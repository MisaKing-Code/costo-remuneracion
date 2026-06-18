import { Network } from "lucide-react";
import SectionCard from "./SectionCard";
import { formatCompactCurrency, formatPercent } from "../utils/formatters";

function buildConcentrationInsight(data) {
  if (!data.length) {
    return null;
  }

  if (data.length < 3) {
    return `El principal centro concentra ${formatPercent(data[0]?.percent || 0)} del costo filtrado.`;
  }

  const topThreeShare = data.slice(0, 3).reduce((total, item) => total + Number(item.percent || 0), 0);
  return `Los 3 principales centros concentran ${formatPercent(topThreeShare)} del costo filtrado.`;
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-4 py-7 text-center">
      <p className="tiny-label text-stone-500">Sin datos</p>
      <p className="mt-2 text-sm font-bold text-stone-300">No hay centros de negocio para los filtros actuales.</p>
    </div>
  );
}

export default function BusinessCenterCompactRanking({
  title = "Top Centros de Negocio de la Sociedad",
  icon = Network,
  data = [],
}) {
  const visibleData = data.filter((item) => Number(item.value || 0) > 0);
  const max = Math.max(...visibleData.map((item) => Number(item.value || 0)), 1);
  const insight = buildConcentrationInsight(visibleData);

  return (
    <SectionCard title={title} subtitle={insight} icon={icon} className="h-full">
      {visibleData.length ? (
        <div className="space-y-2">
          {visibleData.map((item, index) => {
            const rank = index + 1;
            const isLeader = rank === 1;
            const isTopThree = rank <= 3;
            const width = Math.max(6, (Number(item.value || 0) / max) * 100);

            return (
              <div
                key={item.name}
                className={`grid grid-cols-[30px_minmax(0,1fr)_88px] items-center gap-3 rounded-lg border px-2.5 py-2 transition duration-300 hover:-translate-y-0.5 xl:grid-cols-[32px_minmax(0,1fr)_96px] ${
                  isLeader
                    ? "border-flame-300/24 bg-flame-500/[0.08] shadow-[0_0_22px_rgba(255,123,85,.10)]"
                    : isTopThree
                      ? "border-white/[0.08] bg-white/[0.04]"
                      : "border-white/[0.045] bg-black/10"
                }`}
              >
                <span
                  className={`grid h-7 w-7 place-items-center rounded-md text-[11px] font-black tabular-nums ${
                    isLeader
                      ? "border border-flame-300/35 bg-flame-500/15 text-flame-200"
                      : isTopThree
                        ? "border border-white/10 bg-white/[0.055] text-stone-200"
                        : "text-stone-500"
                  }`}
                >
                  {rank}
                </span>

                <div className="min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-xs font-black leading-5 text-stone-100">{item.name}</p>
                    <p className="shrink-0 text-[11px] font-black tabular-nums text-flame-300">{formatPercent(item.percent)}</p>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-black/35">
                    <div
                      className={`h-full rounded-full ${
                        isLeader ? "bg-gradient-to-r from-flame-500 to-flame-300" : "bg-gradient-to-r from-stone-500 to-stone-300"
                      }`}
                      style={{ width: `${Math.min(width, 100)}%` }}
                    />
                  </div>
                </div>

                <p className="text-right text-xs font-black tabular-nums text-stone-50">{formatCompactCurrency(item.value)}</p>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState />
      )}
    </SectionCard>
  );
}
