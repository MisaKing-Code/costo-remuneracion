import { Activity, Banknote, Building2, CircleDollarSign, TrendingUp, UsersRound } from "lucide-react";
import { formatCompactCurrency, formatCurrency } from "../utils/formatters";

const indicatorClass = "mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.07]";

function KpiCard({ icon: Icon, label, value, secondary, indicator = 70 }) {
  return (
    <article className="panel-soft group p-4 transition duration-300 hover:-translate-y-0.5 hover:border-flame-400/35">
      <div className="flex items-start justify-between gap-3">
        <div className="rounded-lg border border-flame-400/20 bg-flame-500/12 p-2 text-flame-300">
          <Icon size={17} strokeWidth={2.4} />
        </div>
        <Activity size={14} className="text-flame-400/80" />
      </div>
      <p className="tiny-label mt-4">{label}</p>
      <p className="metric-value mt-1">{value}</p>
      <p className="mt-1 text-[11px] font-semibold text-stone-400">{secondary}</p>
      <div className={indicatorClass}>
        <div
          className="h-full rounded-full bg-gradient-to-r from-flame-500 to-flame-300 transition-all duration-500"
          style={{ width: `${indicator}%` }}
        />
      </div>
    </article>
  );
}

export default function KpiGrid({ stats }) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      <KpiCard
        icon={CircleDollarSign}
        label="Costo Total"
        value={formatCompactCurrency(stats.totalCost)}
        secondary="Costo laboral corporativo"
        indicator={96}
      />
      <KpiCard icon={UsersRound} label="Dotación" value={stats.workers} secondary="Trabajadores filtrados" indicator={78} />
      <KpiCard icon={Building2} label="Empresas" value={stats.companies} secondary="Sociedades filtradas" indicator={70} />
      <KpiCard
        icon={Banknote}
        label="Costo Promedio por Trabajador"
        value={formatCompactCurrency(stats.averageCost)}
        secondary="Por trabajador"
        indicator={62}
      />
      <KpiCard
        icon={TrendingUp}
        label="Costo Máximo Individual"
        value={formatCompactCurrency(stats.maxCost)}
        secondary={formatCurrency(stats.maxCost)}
        indicator={86}
      />
    </section>
  );
}
