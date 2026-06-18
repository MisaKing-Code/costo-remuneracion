import { BarChart3 } from "lucide-react";
import SectionCard from "./SectionCard";
import { formatCompactCurrency, formatPercent, shortName } from "../utils/formatters";

function formatPointGap(value) {
  return `${value > 0 ? "+" : ""}${(value || 0).toFixed(1).replace(".", ",")} pts porcentuales`;
}

export default function RankingBars({
  title,
  subtitle,
  data,
  icon = BarChart3,
  compactCompany = false,
  executiveContrast = false,
  metricsData = [],
  showSecondaryMetric = false,
  secondaryMetricType = "costPerWorker",
  showLeaderGap = false,
  showRankingInsight = false,
}) {
  const max = Math.max(...data.map((item) => item.value), 1);
  const metricsByName = new Map(metricsData.map((item) => [item.name, item]));
  const leaderGap = data.length > 1 ? data[0].percent - data[1].percent : null;
  const topTwoPercent = data.length > 1 ? data[0].percent + data[1].percent : null;
  const executiveSubtitle =
    showRankingInsight && topTwoPercent
      ? `Las dos principales sociedades concentran ${formatPercent(topTwoPercent)} del costo filtrado.`
      : subtitle;

  return (
    <SectionCard title={title} subtitle={executiveSubtitle} icon={icon}>
      <div className={executiveContrast ? "space-y-2" : "space-y-3"}>
        {data.map((item, index) => {
          const ratio = item.value / max;
          const width = executiveContrast ? Math.max(7, Math.pow(ratio, 1.5) * 86) : ratio * 100;
          const isLeader = executiveContrast && index === 0;
          const metrics = metricsByName.get(item.name);
          const workers = Number(metrics?.workers || 0);
          const costPerWorker =
            showSecondaryMetric && secondaryMetricType === "costPerWorker" && workers > 0 ? item.value / workers : null;
          const secondaryMetric =
            showSecondaryMetric && secondaryMetricType === "costPerWorker"
              ? costPerWorker
                ? `${formatCompactCurrency(costPerWorker)} por trabajador`
                : null
              : null;

          return (
            <div
              key={item.name}
              className={`grid grid-cols-[26px_1fr] items-center gap-2 rounded-lg transition ${
                executiveContrast
                  ? isLeader
                    ? "border border-flame-400/25 bg-flame-500/[0.07] px-2.5 py-2 shadow-[0_0_20px_rgba(255,123,85,.1)] duration-300 hover:-translate-y-0.5 hover:border-flame-300/35 hover:bg-flame-500/[0.10] hover:shadow-[0_0_26px_rgba(255,123,85,.14)]"
                    : "border border-white/0 px-2 py-1 duration-300 hover:-translate-y-0.5 hover:border-white/[0.06] hover:bg-white/[0.035] hover:shadow-[0_0_18px_rgba(255,255,255,.045)]"
                  : "py-1"
              }`}
            >
              <span
                className={`grid h-6 w-6 place-items-center text-[11px] font-black ${
                  isLeader
                    ? "rounded-full border border-flame-300/35 bg-flame-500/15 text-flame-200"
                    : "text-stone-500"
                }`}
              >
                {index + 1}
              </span>
              <div className="min-w-0">
                <div className="mb-1 flex items-center justify-between gap-3">
                  <p className="truncate text-xs font-extrabold text-stone-100">
                    {compactCompany ? shortName(item.name) : item.name}
                  </p>
                  <span className="shrink-0 text-[11px] font-black text-stone-100">
                    {formatCompactCurrency(item.value)}
                  </span>
                </div>
                <div className={`${executiveContrast ? "h-1.5" : "h-2"} overflow-hidden rounded-full bg-black/35`}>
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-flame-500 to-flame-300"
                    style={{ width: `${width}%` }}
                  />
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] font-semibold">
                  <span className={executiveContrast ? "text-stone-400" : "text-stone-500"}>
                    {formatPercent(item.percent)} del costo total
                  </span>
                  {secondaryMetric ? (
                    <>
                      <span className="text-stone-600">|</span>
                      <span className="text-stone-400">{secondaryMetric}</span>
                    </>
                  ) : null}
                  {showLeaderGap && isLeader && leaderGap > 0 ? (
                    <span className="basis-full text-flame-200/80">Lidera por {formatPointGap(leaderGap)}</span>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
