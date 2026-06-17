import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CalendarRange } from "lucide-react";
import SectionCard from "./SectionCard";
import { formatCompactCurrency, formatPercent } from "../utils/formatters";

function formatSignedCurrency(value) {
  if (!value) {
    return formatCompactCurrency(0);
  }

  return `${value > 0 ? "+" : "-"}${formatCompactCurrency(Math.abs(value))}`;
}

function formatSignedPercent(value) {
  if (value === null || value === undefined) {
    return "Sin comparable";
  }

  return `${value > 0 ? "+" : ""}${formatPercent(value)}`;
}

function averageTone(value) {
  if (!value) {
    return "en promedio";
  }

  return value > 0 ? "sobre promedio" : "bajo promedio";
}

function MetricTile({ label, value, detail, emphasis = false }) {
  return (
    <div className="panel-soft min-h-[104px] p-3">
      <p className="tiny-label text-stone-500">{label}</p>
      <p className={emphasis ? "mt-3 text-3xl font-black leading-none text-stone-50" : "mt-3 text-2xl font-black text-stone-50"}>
        {value}
      </p>
      {detail ? <p className="mt-2 text-[11px] font-bold leading-5 text-stone-400">{detail}</p> : null}
    </div>
  );
}

export default function PeriodComparisonPanel({ data, selectedPeriod }) {
  const hasMonthlyContext = data?.monthlySeries?.length > 1;

  if (!data || !hasMonthlyContext || !data.selectedCost) {
    return (
      <SectionCard title={`Comparativo del Periodo - ${selectedPeriod}`} icon={CalendarRange} className="min-h-[320px]">
        <div className="flex h-[260px] flex-col justify-center rounded-lg border border-white/10 bg-white/[0.03] px-5">
          <p className="tiny-label text-flame-300">Historial insuficiente</p>
          <h3 className="mt-2 text-2xl font-black text-stone-50">No hay historial suficiente para comparar este periodo.</h3>
          <p className="mt-3 max-w-xl text-sm font-semibold leading-6 text-stone-400">
            El panel necesita al menos dos meses disponibles bajo los filtros activos para calcular variaciones y contexto.
          </p>
        </div>
      </SectionCard>
    );
  }

  const previousDetail = data.previousPeriod
    ? `${formatSignedPercent(data.deltaVsPreviousPct)} vs ${data.previousPeriod} (${formatSignedCurrency(data.deltaVsPrevious)})`
    : "Sin mes anterior comparable.";
  const averageDetail = `${formatSignedPercent(data.deltaVsAveragePct)} ${averageTone(data.deltaVsAverage)} (${formatSignedCurrency(
    data.deltaVsAverage,
  )})`;
  const rankDetail = data.rank ? `${data.rank} de ${data.totalPeriods} meses por costo` : "Sin ranking disponible";

  return (
    <SectionCard title={`Comparativo del Periodo - ${data.selectedPeriod}`} icon={CalendarRange} className="min-h-[320px]">
      <div className="grid gap-3 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <MetricTile label="Costo del periodo" value={formatCompactCurrency(data.selectedCost)} detail={rankDetail} emphasis />
          <MetricTile
            label="Promedio mensual"
            value={formatCompactCurrency(data.averageCost)}
            detail={`${data.totalPeriods} meses comparables`}
          />
          <MetricTile label="Variacion vs mes anterior" value={formatSignedCurrency(data.deltaVsPrevious)} detail={previousDetail} />
          <MetricTile label="Variacion vs promedio" value={formatSignedCurrency(data.deltaVsAverage)} detail={averageDetail} />
        </div>

        <div className="panel-soft min-h-[248px] p-3">
          <div className="mb-2 flex items-start justify-between gap-3">
            <div>
              <p className="tiny-label text-stone-500">Serie mensual contextual</p>
              <p className="mt-1 text-xs font-bold text-stone-400">Mes seleccionado resaltado en flame.</p>
            </div>
            <div className="text-right text-[11px] font-bold text-stone-400">
              <p>Max {data.maxPeriod}: {formatCompactCurrency(data.maxCost)}</p>
              <p>Min {data.minPeriod}: {formatCompactCurrency(data.minCost)}</p>
            </div>
          </div>
          <div className="h-[190px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthlySeries} margin={{ top: 12, right: 4, left: 0, bottom: 0 }}>
                <XAxis dataKey="period" tick={{ fill: "#a8a29e", fontSize: 10, fontWeight: 800 }} tickLine={false} axisLine={false} />
                <YAxis hide domain={[0, "dataMax"]} />
                <Tooltip
                  formatter={(value) => [formatCompactCurrency(value), "Costo total"]}
                  labelStyle={{ color: "#f8f5ee", fontWeight: 800 }}
                  contentStyle={{ background: "#22231f", border: "1px solid rgba(255,255,255,.12)", borderRadius: 8 }}
                  cursor={{ fill: "rgba(255,255,255,.05)" }}
                />
                <Bar dataKey="totalCost" radius={[5, 5, 0, 0]}>
                  {data.monthlySeries.map((item) => (
                    <Cell key={item.period} fill={item.period === data.selectedPeriod ? "#ff9a6d" : "rgba(168, 162, 158, 0.46)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
