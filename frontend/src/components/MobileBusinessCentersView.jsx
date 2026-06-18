import { MapPinned } from "lucide-react";
import { formatCompactCurrency, formatPercent } from "../utils/formatters";

const podiumTone = [
  {
    badge: "border-flame-300/55 bg-flame-300/15 text-flame-100",
    card: "border-flame-300/35 bg-flame-500/[0.11] shadow-[0_0_24px_rgba(255,123,85,.12)]",
    value: "text-flame-200",
  },
  {
    badge: "border-stone-200/30 bg-stone-200/10 text-stone-100",
    card: "border-stone-200/16 bg-white/[0.055]",
    value: "text-stone-100",
  },
  {
    badge: "border-orange-300/30 bg-orange-400/10 text-orange-100",
    card: "border-orange-300/20 bg-orange-400/[0.075]",
    value: "text-orange-200",
  },
];

function CenterPodiumCard({ item, rank, featured = false }) {
  const tone = podiumTone[rank - 1] || podiumTone[0];

  if (!item) {
    return null;
  }

  return (
    <article className={`rounded-xl border p-3 ${tone.card}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className={`inline-grid h-8 w-8 place-items-center rounded-full border text-[10px] font-black ${tone.badge}`}>
            #{rank}
          </span>
          <h3 className={`mt-2 line-clamp-2 font-black leading-5 text-stone-50 ${featured ? "text-base" : "text-sm"}`}>
            {item.name}
          </h3>
        </div>
        <p className="shrink-0 rounded-full border border-white/10 bg-black/20 px-2 py-1 text-[10px] font-black text-stone-300">
          {formatPercent(item.percent)}
        </p>
      </div>
      <p className={`mt-3 font-black leading-none ${featured ? "text-3xl" : "text-xl"} ${tone.value}`}>
        {formatCompactCurrency(item.value)}
      </p>
    </article>
  );
}

function CenterRankingRow({ item, rank }) {
  return (
    <article className="grid grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-3 border-t border-white/[0.06] py-2.5 transition active:scale-[0.99]">
      <span className="text-[11px] font-black tabular-nums text-stone-500">{rank}</span>
      <div className="min-w-0">
        <p className="truncate text-sm font-black text-stone-100">{item.name}</p>
        <p className="mt-0.5 text-[11px] font-bold text-stone-500">{formatPercent(item.percent)} del total</p>
      </div>
      <p className="shrink-0 text-right text-sm font-black tabular-nums text-flame-300">{formatCompactCurrency(item.value)}</p>
    </article>
  );
}

export default function MobileBusinessCentersView({ data = [], visibleCenters = 0 }) {
  const topThree = data.slice(0, 3);
  const remaining = data.slice(3, 10);

  if (!data.length) {
    return (
      <section className="rounded-xl border border-white/10 bg-ink-900/95 p-4 text-center shadow-[0_12px_28px_rgba(0,0,0,.24)]">
        <div className="mx-auto grid h-11 w-11 place-items-center rounded-xl border border-flame-400/25 bg-flame-500/[0.10] text-flame-300">
          <MapPinned size={18} strokeWidth={2.4} />
        </div>
        <h2 className="mt-3 text-lg font-black text-stone-50">Centros de Negocio</h2>
        <p className="mt-2 text-sm font-bold leading-6 text-stone-400">
          No hay centros de negocio disponibles para los filtros seleccionados.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="tiny-label text-flame-300">Centros de Negocio</p>
          <h2 className="mt-1 text-lg font-black text-stone-50">Ranking por costo remuneracional</h2>
        </div>
        <div className="shrink-0 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-right">
          <p className="text-lg font-black leading-none text-stone-50">{visibleCenters || data.length}</p>
          <p className="mt-0.5 text-[10px] font-bold text-stone-500">visibles</p>
        </div>
      </div>

      <div className="space-y-2">
        <CenterPodiumCard item={topThree[0]} rank={1} featured />
        <div className="grid grid-cols-2 gap-2">
          <CenterPodiumCard item={topThree[1]} rank={2} />
          <CenterPodiumCard item={topThree[2]} rank={3} />
        </div>
      </div>

      {remaining.length ? (
        <div className="rounded-xl border border-white/10 bg-ink-900/95 px-3 py-2 shadow-[0_12px_28px_rgba(0,0,0,.22)]">
          <div className="grid grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-3 pb-2 text-[10px] font-black uppercase tracking-[0.08em] text-stone-500">
            <span>#</span>
            <span>Centro</span>
            <span className="text-right">Costo</span>
          </div>
          {remaining.map((item, index) => (
            <CenterRankingRow key={item.name} item={item} rank={index + 4} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
