import { ReceiptText } from "lucide-react";
import SectionCard from "./SectionCard";
import { formatCompactCurrency, formatPercent } from "../utils/formatters";

export default function CostBreakdown({ data, totalCost }) {
  return (
    <SectionCard title="Desglose de Costos" icon={ReceiptText}>
      <div className="mb-3">
        <p className="tiny-label">Total seleccionado</p>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-3xl font-black text-stone-50">{formatCompactCurrency(totalCost)}</span>
          <span className="text-xs font-black text-flame-400">100%</span>
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {data.map((item) => (
          <div key={item.key} className="rounded-lg border border-white/10 bg-black/18 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-[11px] font-bold text-stone-300">{item.name}</p>
              <p className="text-[10px] font-black text-flame-400">{formatPercent(item.percent)}</p>
            </div>
            <p className="mt-1 text-lg font-black text-stone-50">{formatCompactCurrency(item.value)}</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <div className="h-full rounded-full bg-flame-500" style={{ width: `${Math.min(item.percent, 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
