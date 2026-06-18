import { Table2 } from "lucide-react";
import SectionCard from "./SectionCard";
import { formatCompactCurrency, formatCurrency, formatPercent, shortName } from "../utils/formatters";

function StatusBadge({ value }) {
  const active = String(value).toLowerCase() === "activo";
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-black ${
        active ? "bg-lime-300 text-ink-950" : "bg-stone-600 text-stone-100"
      }`}
    >
      {value}
    </span>
  );
}

function ContractBadge({ value }) {
  const fixed = String(value).toLowerCase() === "fijo";
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${
        fixed ? "border-flame-400/35 text-flame-300" : "border-white/10 text-stone-300"
      }`}
    >
      {value}
    </span>
  );
}

function SummaryCard({ label, value, detail, accent = false }) {
  return (
    <article
      className={`rounded-lg border p-3 ${
        accent
          ? "border-flame-400/25 bg-flame-500/[0.09] shadow-[0_0_24px_rgba(255,123,85,.10)]"
          : "border-white/[0.07] bg-white/[0.035]"
      }`}
    >
      <p className={accent ? "tiny-label text-flame-300" : "tiny-label text-stone-500"}>{label}</p>
      {value ? (
        <p className={`mt-2 truncate text-2xl font-black leading-none ${accent ? "text-flame-200" : "text-stone-50"}`}>{value}</p>
      ) : null}
      {detail ? <p className={`${value ? "mt-2" : "mt-3"} line-clamp-3 text-[11px] font-bold leading-5 text-stone-400`}>{detail}</p> : null}
    </article>
  );
}

function RankingBadge({ rank }) {
  const topThree = rank <= 3;

  return (
    <span
      className={`grid h-7 w-7 place-items-center rounded-md text-[11px] font-black tabular-nums ${
        topThree
          ? "border border-flame-300/30 bg-flame-500/[0.12] text-flame-200"
          : "border border-white/[0.07] bg-white/[0.035] text-stone-400"
      }`}
    >
      {rank}
    </span>
  );
}

function EmptyWorkerState() {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-4 py-8 text-center">
      <p className="tiny-label text-stone-500">Sin datos</p>
      <p className="mt-2 text-sm font-bold text-stone-300">No hay trabajadores para los filtros actuales.</p>
    </div>
  );
}

export default function WorkerTable({ rows, consolidated = false, totalCost = 0, showPeriod = false }) {
  const topRows = [...rows].sort((a, b) => Number(b.Total_Costo || 0) - Number(a.Total_Costo || 0)).slice(0, 15);
  const topTotal = topRows.reduce((total, row) => total + Number(row.Total_Costo || 0), 0);
  const topShare = totalCost ? (topTotal / totalCost) * 100 : 0;
  const topAverage = topRows.length ? topTotal / topRows.length : 0;
  const leader = topRows[0];
  const leaderName = leader?.Nombre_Trabajador || "Sin datos";

  return (
    <SectionCard
      title="Detalle por Trabajador - Top 15 por Costo"
      subtitle="Analisis de los trabajadores con mayor costo remuneracional del periodo filtrado."
      icon={Table2}
      action={
        <div className="flex items-center gap-2">
          {consolidated ? (
            <span className="rounded-full border border-flame-400/25 bg-flame-500/[0.10] px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.08em] text-flame-300">
              Consolidado por trabajador
            </span>
          ) : null}
          <span className="text-[11px] font-bold text-stone-500">
            {rows.length} {consolidated ? "trabajadores" : "registros"}
          </span>
        </div>
      }
    >
      {topRows.length ? (
        <div className="space-y-3">
          <div className="grid gap-3 xl:grid-cols-[1fr_0.9fr_0.9fr_1.25fr]">
            <SummaryCard
              label="Mayor costo individual"
              value={formatCompactCurrency(leader?.Total_Costo)}
              detail={leaderName}
              accent
            />
            <SummaryCard label="Top 15 concentra" value={formatPercent(topShare)} detail="del costo total filtrado" />
            <SummaryCard label="Promedio Top 15" value={formatCompactCurrency(topAverage)} detail="costo promedio por trabajador" />
            <SummaryCard
              label="Lectura Ejecutiva"
              detail={`El Top 15 de trabajadores concentra ${formatPercent(topShare)} del costo total filtrado. El mayor costo individual corresponde a ${leaderName}.`}
            />
          </div>

          <div className="scrollbar-dark max-h-[500px] overflow-auto rounded-lg border border-white/10 bg-ink-900/90 shadow-[inset_0_1px_0_rgba(255,255,255,.035)]">
            <table className={`w-full ${showPeriod ? "min-w-[1120px]" : "min-w-[1040px]"} border-collapse text-left`}>
              <thead className="sticky top-0 z-10 bg-ink-800/95 backdrop-blur">
                <tr className="border-b border-white/10">
                  {[
                    "#",
                    "Trabajador",
                    "Empresa / Cargo",
                    ...(showPeriod ? ["Periodo"] : []),
                    "Tipo",
                    "Contrato",
                    "Total Haberes",
                    "Costo Total",
                  ].map((head) => (
                    <th
                      key={head}
                      className={`px-3 py-3 text-[10px] font-black uppercase tracking-[0.08em] text-stone-400 ${
                        head.includes("Total") ? "text-right" : ""
                      }`}
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topRows.map((row, index) => (
                  <tr
                    key={`${row.RUT_Trabajador || row.Nombre_Trabajador}-${index}`}
                    className="group border-b border-white/[0.055] transition duration-300 hover:-translate-y-px hover:bg-flame-500/[0.07] hover:shadow-[0_10px_26px_rgba(0,0,0,.18)]"
                  >
                    <td className="px-3 py-2.5">
                      <RankingBadge rank={index + 1} />
                    </td>
                    <td className="px-3 py-2.5">
                      <p className="text-xs font-black text-stone-100">{row.Nombre_Trabajador}</p>
                      <p className="mt-0.5 text-[10px] font-semibold text-stone-500">{row.RUT_Trabajador}</p>
                    </td>
                    <td className="max-w-[260px] px-3 py-2.5">
                      <p className="truncate text-xs font-black text-stone-200">{shortName(row.Nombre_Sociedad)}</p>
                      <p className="mt-0.5 line-clamp-2 text-[11px] font-semibold leading-4 text-stone-500">{row.Cargo}</p>
                    </td>
                    {showPeriod ? (
                      <td className="px-3 py-2.5 text-xs font-black tabular-nums text-stone-200">
                        {row.Periodo || "Sin periodo"}
                      </td>
                    ) : null}
                    <td className="px-3 py-2.5">
                      <StatusBadge value={row.Tipo_Trabajador} />
                    </td>
                    <td className="px-3 py-2.5">
                      <ContractBadge value={row.Contrato_Trabajador} />
                    </td>
                    <td className="px-3 py-2.5 text-right text-xs font-black tabular-nums text-stone-100">
                      {formatCurrency(row.Total_Haberes)}
                    </td>
                    <td className="px-3 py-2.5 text-right text-sm font-black tabular-nums text-flame-300">
                      {formatCurrency(row.Total_Costo)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyWorkerState />
      )}
    </SectionCard>
  );
}
