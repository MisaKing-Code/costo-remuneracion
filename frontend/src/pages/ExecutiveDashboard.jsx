import { Network } from "lucide-react";
import CompanyDonut from "../components/CompanyDonut";
import CostBreakdown from "../components/CostBreakdown";
import FilterBar from "../components/FilterBar";
import Header from "../components/Header";
import KpiGrid from "../components/KpiGrid";
import RankingBars from "../components/RankingBars";
import WorkerTable from "../components/WorkerTable";
import DashboardShell from "../layouts/DashboardShell";
import { useCostDashboard } from "../hooks/useCostDashboard";

export default function ExecutiveDashboard({ onLogout }) {
  const { isDatasetValid, datasetError, metadata, filters, setFilters, options, analytics, scope } = useCostDashboard();

  if (!isDatasetValid) {
    return (
      <DashboardShell>
        <section className="panel p-5">
          <p className="tiny-label text-flame-300">Error de datos</p>
          <h1 className="mt-2 text-2xl font-black text-stone-50">El dataset no cumple los requisitos mínimos.</h1>
          <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-stone-300">
            El dashboard no puede procesar la información porque el archivo JSON generado no tiene una estructura válida.
          </p>
          <div className="mt-4 rounded-lg border border-red-300/20 bg-red-500/10 p-3 text-sm font-bold text-red-100">
            Detalle: {datasetError || "Error de dataset no especificado."}
          </div>
        </section>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <Header stats={analytics.stats} metadata={metadata} scope={scope} onLogout={onLogout} />
      <FilterBar filters={filters} setFilters={setFilters} options={options} />
      <KpiGrid stats={analytics.stats} />

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <RankingBars title="Costo Total por Empresa" data={analytics.companyCosts} compactCompany />
        <CompanyDonut data={analytics.companyCosts} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <RankingBars title="Top 10 Centros de Negocio por Costo" icon={Network} data={analytics.businessCenterCosts} />
        <CostBreakdown data={analytics.breakdown} totalCost={analytics.stats.totalCost} />
      </section>

      <WorkerTable rows={analytics.tableRows} />
    </DashboardShell>
  );
}
