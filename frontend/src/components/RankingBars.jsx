import { BarChart3 } from "lucide-react";
import SectionCard from "./SectionCard";
import { formatCompactCurrency, formatPercent, shortName } from "../utils/formatters";

export default function RankingBars({ title, data, icon = BarChart3, compactCompany = false }) {
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <SectionCard title={title} icon={icon}>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={item.name} className="grid grid-cols-[24px_1fr_auto] items-center gap-2">
            <span className="text-[11px] font-black text-stone-500">{index + 1}</span>
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
                  style={{ width: `${(item.value / max) * 100}%` }}
                />
              </div>
              <p className="mt-1 text-[10px] font-semibold text-stone-500">{formatPercent(item.percent)} del costo total</p>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
