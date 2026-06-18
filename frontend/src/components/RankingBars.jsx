import { BarChart3 } from "lucide-react";
import SectionCard from "./SectionCard";
import { formatCompactCurrency, formatPercent, shortName } from "../utils/formatters";

export default function RankingBars({ title, data, icon = BarChart3, compactCompany = false, executiveContrast = false }) {
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <SectionCard title={title} icon={icon}>
      <div className="space-y-3">
        {data.map((item, index) => {
          const ratio = item.value / max;
          const width = executiveContrast ? Math.max(8, Math.pow(ratio, 1.35) * 88) : ratio * 100;
          const isLeader = executiveContrast && index === 0;

          return (
          <div
            key={item.name}
            className={`grid grid-cols-[24px_1fr_auto] items-center gap-2 rounded-lg transition ${
              isLeader ? "border border-flame-400/20 bg-flame-500/[0.055] px-2 py-2 shadow-[0_0_18px_rgba(255,123,85,.08)]" : ""
            }`}
          >
            <span className={`text-[11px] font-black ${isLeader ? "text-flame-300" : "text-stone-500"}`}>{index + 1}</span>
            <div className="min-w-0">
              <div className="mb-1 flex items-center justify-between gap-2">
                <p className="truncate text-xs font-extrabold text-stone-100">
                  {compactCompany ? shortName(item.name) : item.name}
                </p>
                <span className="shrink-0 text-[11px] font-black text-stone-100">{formatCompactCurrency(item.value)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-black/30">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-flame-500 to-flame-300"
                  style={{ width: `${width}%` }}
                />
              </div>
              <p className="mt-1 text-[10px] font-semibold text-stone-500">{formatPercent(item.percent)} del costo total</p>
            </div>
          </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
