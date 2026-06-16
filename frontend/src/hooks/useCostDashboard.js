import { useMemo, useState } from "react";
import { getMaintenanceCostDataset } from "../services/legacy/maintenanceCostService";
import {
  costBreakdown,
  getDashboardStats,
  getTopWorkersByCost,
  groupByCost,
  monthlyCostTrend,
  uniqueValues,
} from "../utils/analytics";

function defaultFilters(period = "Todos") {
  return {
    period,
    company: "Todas",
    businessCenter: "Todos",
    workerType: "Todos",
    contract: "Todos",
    searchTerm: "",
  };
}

function normalizeSearchText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function normalizeRut(value) {
  return normalizeSearchText(value).replace(/[^0-9k]/g, "");
}

export function useCostDashboard(activeCompany = "Todas") {
  const dataset = getMaintenanceCostDataset();
  const {
    isDatasetValid = false,
    datasetError = "Dataset de costos inválido.",
    records: datasetRecords = [],
    metadata: datasetMetadata = {},
  } = dataset || {};
  const records = Array.isArray(datasetRecords) ? datasetRecords : [];
  const metadata = datasetMetadata && typeof datasetMetadata === "object" && !Array.isArray(datasetMetadata) ? datasetMetadata : {};

  const scopeRecords = useMemo(
    () => (activeCompany === "Todas" ? records : records.filter((item) => item.Nombre_Sociedad === activeCompany)),
    [activeCompany, records],
  );
  const periodOptions = useMemo(
    () => uniqueValues(scopeRecords, "Periodo").sort((a, b) => String(b).localeCompare(String(a), "es")),
    [scopeRecords],
  );
  const [filters, setFilters] = useState(() => defaultFilters(periodOptions[0] || "Todos"));

  const options = useMemo(
    () => ({
      periods: periodOptions,
      companies: uniqueValues(records, "Nombre_Sociedad"),
      businessCenters: uniqueValues(scopeRecords, "Centro_de_Negocio"),
      workerTypes: uniqueValues(scopeRecords, "Tipo_Trabajador"),
      contracts: uniqueValues(scopeRecords, "Contrato_Trabajador"),
    }),
    [periodOptions, records, scopeRecords],
  );

  const societies = useMemo(() => groupByCost(records, "Nombre_Sociedad"), [records]);

  const filteredRecords = useMemo(() => {
    const searchTerm = normalizeSearchText(filters.searchTerm);
    const searchRut = normalizeRut(filters.searchTerm);
    const companyFilter = activeCompany === "Todas" ? filters.company : activeCompany;

    return scopeRecords.filter((item) => {
      const byPeriod = filters.period === "Todos" || item.Periodo === filters.period;
      const byCompany = companyFilter === "Todas" || item.Nombre_Sociedad === companyFilter;
      const byBusinessCenter = filters.businessCenter === "Todos" || item.Centro_de_Negocio === filters.businessCenter;
      const byType = filters.workerType === "Todos" || item.Tipo_Trabajador === filters.workerType;
      const byContract = filters.contract === "Todos" || item.Contrato_Trabajador === filters.contract;
      const bySearch =
        !searchTerm ||
        normalizeSearchText(item.Nombre_Trabajador).includes(searchTerm) ||
        normalizeSearchText(item.Cargo).includes(searchTerm) ||
        (searchRut && normalizeRut(item.RUT_Trabajador).includes(searchRut));

      return byPeriod && byCompany && byBusinessCenter && byType && byContract && bySearch;
    });
  }, [activeCompany, filters, scopeRecords]);

  const analytics = useMemo(() => {
    const companyCosts = groupByCost(filteredRecords, "Nombre_Sociedad");
    const businessCenterCosts = groupByCost(filteredRecords, "Centro_de_Negocio").slice(0, 10);
    const contractCosts = groupByCost(filteredRecords, "Contrato_Trabajador");
    const isAllPeriods = filters.period === "Todos";
    const tableRows = getTopWorkersByCost(filteredRecords, { consolidateByWorker: isAllPeriods });

    return {
      stats: getDashboardStats(filteredRecords),
      companyCosts,
      businessCenterCosts,
      contractCosts,
      breakdown: costBreakdown(filteredRecords),
      monthlyTrend: monthlyCostTrend(filteredRecords),
      tableRows,
      isWorkerTableConsolidated: isAllPeriods,
    };
  }, [filteredRecords, filters.period]);

  const scope = useMemo(
    () => ({
      activePeriod: filters.period,
      availablePeriodRange: metadata.period || "Sin rango disponible",
      filteredRecords: filteredRecords.length,
      totalRecords: scopeRecords.length,
      workers: new Set(filteredRecords.map((item) => item.RUT_Trabajador).filter(Boolean)).size,
      companies: new Set(filteredRecords.map((item) => item.Nombre_Sociedad).filter(Boolean)).size,
      businessCenters: new Set(filteredRecords.map((item) => item.Centro_de_Negocio).filter(Boolean)).size,
    }),
    [filteredRecords, filters.period, metadata.period, scopeRecords.length],
  );

  return {
    isDatasetValid,
    datasetError,
    records,
    metadata,
    activeCompany,
    societies,
    filters,
    setFilters,
    options,
    filteredRecords,
    analytics,
    scope,
  };
}
