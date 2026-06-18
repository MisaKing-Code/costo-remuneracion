import { Network } from "lucide-react";
import SectionCard from "./SectionCard";
import { formatCompactCurrency, formatPercent } from "../utils/formatters";

const podiumTone = [
  {
    badge: "border-flame-300/60 bg-flame-300/15 text-flame-100 shadow-[0_0_22px_rgba(255,189,143,.18)]",
    panel: "border-flame-300/35 bg-flame-500/[0.11]",
    value: "text-flame-200",
    line: "from-flame-300 via-flame-400 to-flame-500",
  },
  {
    badge: "border-stone-200/35 bg-stone-200/10 text-stone-100",
    panel: "border-stone-200/18 bg-white/[0.055]",
    value: "text-stone-100",
    line: "from-stone-200 via-stone-400 to-stone-600",
  },
  {
    badge: "border-orange-300/35 bg-orange-400/10 text-orange-100",
    panel: "border-orange-300/24 bg-orange-400/[0.075]",
    value: "text-orange-200",
    line: "from-orange-300 via-flame-400 to-orange-700",
  },
];

function PodiumItem({ item, rank, featured = false }) {
  const tone = podiumTone[rank - 1] || podiumTone[0];

  if (!item) {
    return null;
  }

  return (
    <article
      className={[
        "relative min-w-0 overflow-hidden rounded-lg border px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,.06)]",
        "transition duration-300 hover:border-flame-300/45",
        featured ? "md:-translate-y-2 md:px-3.5 md:py-3.5 hover:md:-translate-y-2.5" : "md:translate-y-2 hover:md:translate-y-1.5",
        tone.panel,
      ].join(" ")}
    >
      <div className={`absolute inset-x-4 top-0 h-px bg-gradient-to-r ${tone.line}`} />
      <div className="flex items-start gap-2.5">
        <span
          className={[
            "grid h-7 w-7 shrink-0 place-items-center rounded-full border text-[10px] font-black",
            featured ? "md:h-9 md:w-9 md:text-xs" : "",
            tone.badge,
          ].join(" ")}
        >
          #{rank}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className={`line-clamp-2 text-xs font-black leading-4 text-stone-50 ${featured ? "md:text-sm md:leading-5" : ""}`}>
            {item.name}
          </h3>
          <div className="mt-2 flex items-end justify-between gap-2">
            <p className={`text-xl font-black leading-none ${featured ? "md:text-2xl" : "md:text-xl"} ${tone.value}`}>
              {formatCompactCurrency(item.value)}
            </p>
            <p className="shrink-0 text-[11px] font-black text-stone-300">{formatPercent(item.percent)}</p>
          </div>
        </div>
      </div>
      {featured ? (
        <div className="mx-auto mt-3 hidden h-1 w-20 rounded-full bg-gradient-to-r from-transparent via-flame-300/70 to-transparent md:block" />
      ) : null}
    </article>
  );
}

function ExecutiveRankingRow({ item, rank }) {
  return (
    <div className="grid grid-cols-[26px_minmax(0,1fr)_76px_48px] items-center gap-2 border-t border-white/[0.06] py-1.5 transition hover:bg-white/[0.035] xl:grid-cols-[28px_minmax(0,1fr)_86px_54px]">
      <span className="text-[10px] font-black tabular-nums text-stone-500">
        {rank}
      </span>
      <p className="truncate text-xs font-extrabold text-stone-100">{item.name}</p>
      <p className="text-right text-[11px] font-black tabular-nums text-stone-100">{formatCompactCurrency(item.value)}</p>
      <p className="text-right text-[11px] font-black tabular-nums text-flame-300">{formatPercent(item.percent)}</p>
    </div>
  );
}

export default function BusinessCenterPodiumRanking({ title, data, icon = Network }) {
  const topThree = data.slice(0, 3);
  const remaining = data.slice(3, 10);

  return (
    <SectionCard title={title} subtitle="Vista General - % del costo total" icon={icon}>
      <div className="grid gap-4 md:grid-cols-[7fr_5fr] md:items-stretch">
        <div className="flex min-w-0 flex-col justify-center rounded-lg border border-white/[0.06] bg-black/[0.10] px-3 py-3">
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.08em] text-stone-500">Top 3 Ejecutivo</p>
          <div className="mx-auto grid w-full max-w-[640px] gap-2 md:grid-cols-[0.92fr_1.12fr_0.92fr] md:items-end">
            <PodiumItem item={topThree[1]} rank={2} />
            <PodiumItem item={topThree[0]} rank={1} featured />
            <PodiumItem item={topThree[2]} rank={3} />
          </div>
        </div>

        <div className="min-w-0 rounded-lg border border-white/[0.06] bg-white/[0.025] px-3 py-3 md:border-l-flame-300/15">
          <div className="mb-2 grid grid-cols-[26px_minmax(0,1fr)_76px_48px] items-center gap-2 text-[9px] font-black uppercase tracking-[0.08em] text-stone-500 xl:grid-cols-[28px_minmax(0,1fr)_86px_54px]">
            <span>#</span>
            <span>Centro</span>
            <span className="text-right">Costo</span>
            <span className="text-right">%</span>
          </div>
          {remaining.map((item, index) => (
            <ExecutiveRankingRow key={item.name} item={item} rank={index + 4} />
          ))}
        </div>
      </div>

      <p className="mt-2 border-t border-white/[0.06] pt-2 text-[10px] font-bold text-stone-500">
        Participaci&oacute;n sobre costo total
      </p>
    </SectionCard>
  );
}
