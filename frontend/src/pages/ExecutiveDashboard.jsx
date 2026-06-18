import { Network, SearchX } from "lucide-react";
import { useState } from "react";
import BusinessCenterPodiumRanking from "../components/BusinessCenterPodiumRanking";
import CompanyLeaderInsight from "../components/CompanyLeaderInsight";
import CostBreakdown from "../components/CostBreakdown";
import FilterBar from "../components/FilterBar";
import Header from "../components/Header";
import KpiGrid from "../components/KpiGrid";
import MobileExecutiveDashboard from "../components/MobileExecutiveDashboard";
import PeriodComparisonPanel from "../components/PeriodComparisonPanel";
import RankingBars from "../components/RankingBars";
import Sidebar from "../components/Sidebar";
import TrendChart from "../components/TrendChart";
import WorkerTable from "../components/WorkerTable";
import DashboardShell from "../layouts/DashboardShell";
import { useCostDashboard } from "../hooks/useCostDashboard";

function EmptyResultsState() {
  return (
    <section className="panel flex flex-col items-center justify-center px-5 py-12 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-lg border border-flame-400/25 bg-flame-500/10 text-flame-300">
        <SearchX size={22} strokeWidth={2.4} />
      </div>
      <p className="tiny-label mt-4 text-flame-300">Sin resultados</p>
      <h2 className="mt-2 text-2xl font-black text-stone-50">No hay registros para los filtros actuales.</h2>
      <p className="mt-3 max-w-xl text-sm font-semibold leading-6 text-stone-300">
        Ajusta el periodo, empresa, centro, contrato o busqueda de trabajador. Tambien puedes usar Restablecer para volver al
        ultimo periodo disponible y limpiar la busqueda.
      </p>
    </section>
  );
}

export default function ExecutiveDashboard({ onLogout }) {
  const [activeCompany, setActiveCompany] = useState("Todas");
  const { isDatasetValid, datasetError, metadata, filters, setFilters, options, analytics, scope, societies, sidebarPeriodLabel } =
    useCostDashboard(activeCompany);
  const hasNoResults = scope.filteredRecords === 0;
  const isCorporate = activeCompany === "Todas";
  const isAllPeriods = filters.period === "Todos";

  const handleSelectCompany = (company) => {
    setActiveCompany(company);
    setFilters((current) => ({
      ...current,
      company,
      businessCenter: "Todos",
      workerType: "Todos",
      contract: "Todos",
      searchTerm: "",
    }));
  };

  if (!isDatasetValid) {
    return (
      <DashboardShell>
        <section className="panel p-5">
          <p className="tiny-label text-flame-300">Error de datos</p>
          <h1 className="mt-2 text-2xl font-black text-stone-50">El dataset no cumple los requisitos minimos.</h1>
          <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-stone-300">
            El dashboard no puede procesar la informacion porque el archivo JSON generado no tiene una estructura valida.
          </p>
          <div className="mt-4 rounded-lg border border-red-300/20 bg-red-500/10 p-3 text-sm font-bold text-red-100">
            Detalle: {datasetError || "Error de dataset no especificado."}
          </div>
        </section>
      </DashboardShell>
    );
  }

  const desktopSidebar = (
    <Sidebar
      activeCompany={activeCompany}
      activePeriodLabel={sidebarPeriodLabel}
      societies={societies}
      onSelectCompany={handleSelectCompany}
      onLogout={onLogout}
    />
  );

  const mobileDashboard = hasNoResults ? (
    <div className="px-3 py-3">
      <EmptyResultsState />
    </div>
  ) : (
    <MobileExecutiveDashboard
      activeCompany={activeCompany}
      sidebarPeriodLabel={sidebarPeriodLabel}
      societies={societies}
      filters={filters}
      setFilters={setFilters}
      options={options}
      analytics={analytics}
      scope={scope}
      isCorporate={isCorporate}
      isAllPeriods={isAllPeriods}
      onSelectCompany={handleSelectCompany}
    />
  );

  return (
    <>
      <div className="block md:hidden">
        <DashboardShell>{mobileDashboard}</DashboardShell>
      </div>

      <div className="hidden md:block">
        <DashboardShell sidebar={desktopSidebar}>
          <div className="flex min-w-0 flex-col gap-4">
        <Header stats={analytics.stats} metadata={metadata} scope={scope} activeCompany={activeCompany} />
        <FilterBar filters={filters} setFilters={setFilters} options={options} lockedCompany={activeCompany} />
        {hasNoResults ? (
          <EmptyResultsState />
        ) : (
          <>
            <KpiGrid stats={analytics.stats} />

            <section className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
              {isAllPeriods ? (
                <TrendChart data={analytics.monthlyTrend} />
              ) : (
                <PeriodComparisonPanel data={analytics.periodComparison} selectedPeriod={filters.period} />
              )}
              <CostBreakdown data={analytics.breakdown} totalCost={analytics.stats.totalCost} />
            </section>

            <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              {isCorporate ? (
                <>
                  <RankingBars
                    title="Costo Remuneracional por Sociedad"
                    subtitle="Participacion del costo filtrado por sociedad"
                    data={analytics.companyCosts}
                    metricsData={analytics.companyMetrics}
                    compactCompany
                    executiveContrast
                  />
                  <CompanyLeaderInsight
                    data={analytics.companyMetrics}
                    comparisonData={analytics.societyComparison}
                    selectedPeriod={filters.period}
                  />
                </>
              ) : (
                <>
                  <RankingBars title="Top Centros de Negocio de la Sociedad" icon={Network} data={analytics.businessCenterCosts} />
                  <RankingBars title="Costo por Tipo de Contrato" data={analytics.contractCosts} />
                </>
              )}
            </section>

            {isCorporate ? (
              <BusinessCenterPodiumRanking title="Top 10 Centros de Negocio por Costo" icon={Network} data={analytics.businessCenterCosts} />
            ) : null}

            <WorkerTable rows={analytics.tableRows} consolidated={analytics.isWorkerTableConsolidated} />
          </>
        )}
      </div>
        </DashboardShell>
      </div>
    </>
  );
}
