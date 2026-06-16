import { Table2 } from "lucide-react";
import SectionCard from "./SectionCard";
import { formatCurrency, shortName } from "../utils/formatters";

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

export default function WorkerTable({ rows, consolidated = false }) {
  return (
    <SectionCard
      title="Detalle por Trabajador - Top 15 por Costo"
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
      <div className="scrollbar-dark max-h-[520px] overflow-auto rounded-lg border border-white/10">
        <table className="w-full min-w-[980px] border-collapse bg-ink-900 text-left">
          <thead className="sticky top-0 z-10 bg-ink-800/95 backdrop-blur">
            <tr className="border-b border-white/10">
              {["Trabajador", "Empresa", "Cargo", "Tipo", "Contrato", "Total Haberes", "Costo Total"].map((head) => (
                <th key={head} className="px-3 py-3 text-[10px] font-black uppercase tracking-[0.08em] text-stone-400">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 15).map((row) => (
              <tr key={row.RUT_Trabajador} className="border-b border-white/[0.06] transition hover:bg-flame-500/[0.07]">
                <td className="px-3 py-2.5">
                  <p className="text-xs font-black text-stone-100">{row.Nombre_Trabajador}</p>
                  <p className="mt-0.5 text-[10px] font-semibold text-stone-500">{row.RUT_Trabajador}</p>
                </td>
                <td className="px-3 py-2.5 text-xs font-bold text-stone-300">{shortName(row.Nombre_Sociedad)}</td>
                <td className="max-w-[190px] px-3 py-2.5 text-xs font-bold text-stone-300">
                  <span className="line-clamp-2">{row.Cargo}</span>
                </td>
                <td className="px-3 py-2.5">
                  <StatusBadge value={row.Tipo_Trabajador} />
                </td>
                <td className="px-3 py-2.5">
                  <ContractBadge value={row.Contrato_Trabajador} />
                </td>
                <td className="px-3 py-2.5 text-right text-xs font-black text-stone-100">{formatCurrency(row.Total_Haberes)}</td>
                <td className="px-3 py-2.5 text-right text-xs font-black text-flame-400">{formatCurrency(row.Total_Costo)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
