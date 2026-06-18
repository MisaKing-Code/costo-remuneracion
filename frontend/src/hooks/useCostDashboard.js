import { useEffect, useMemo, useState } from "react";
import { getMaintenanceCostDataset } from "../services/legacy/maintenanceCostService";
import {
  costBreakdown,
  getDashboardStats,
  getPeriodComparison,
  getSocietyMetrics,
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

function getWorkerPeriodMetric(records, selectedPeriod) {
  const totalTrabajadoresPeriodo = new Set(records.map((item) => item.RUT_Trabajador).filter(Boolean)).size;
  const workersByPeriod = records.reduce((acc, item) => {
    const period = item.Periodo || "Sin periodo";

    if (!acc[period]) {
      acc[period] = new Set();
    }

    if (item.RUT_Trabajador) {
      acc[period].add(item.RUT_Trabajador);
    }

    return acc;
  }, {});
  const periodWorkerCounts = Object.values(workersByPeriod).map((workers) => workers.size);
  const promedioTrabajadoresPorPeriodo = periodWorkerCounts.length
    ? Math.round(periodWorkerCounts.reduce((total, workers) => total + workers, 0) / periodWorkerCounts.length)
    : 0;
  const isAllPeriods = selectedPeriod === "Todos";
  const labelTrabajadores = isAllPeriods ? "Prom. trabajadores" : "Trabajadores";
  const subtitleTrabajadores = isAllPeriods ? "Promedio por periodo" : "Unicos filtrados";

  return {
    totalTrabajadoresPeriodo,
    promedioTrabajadoresPorPeriodo,
    labelTrabajadores,
    subtitleTrabajadores,
    value: isAllPeriods ? promedioTrabajadoresPorPeriodo : totalTrabajadoresPeriodo,
  };
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
  const effectiveCompany = activeCompany === "Todas" ? filters.company : activeCompany;

  const businessCenterOptions = useMemo(() => {
    const recordsForCenterOptions = scopeRecords.filter((item) => {
      const byPeriod = filters.period === "Todos" || item.Periodo === filters.period;
      const byCompany = effectiveCompany === "Todas" || item.Nombre_Sociedad === effectiveCompany;
      const byType = filters.workerType === "Todos" || item.Tipo_Trabajador === filters.workerType;
      const byContract = filters.contract === "Todos" || item.Contrato_Trabajador === filters.contract;

      return byPeriod && byCompany && byType && byContract;
    });

    return uniqueValues(recordsForCenterOptions, "Centro_de_Negocio");
  }, [effectiveCompany, filters.contract, filters.period, filters.workerType, scopeRecords]);

  useEffect(() => {
    if (filters.businessCenter === "Todos" || businessCenterOptions.includes(filters.businessCenter)) {
      return;
    }

    setFilters((current) => {
      if (current.businessCenter === "Todos" || businessCenterOptions.includes(current.businessCenter)) {
        return current;
      }

      return {
        ...current,
        businessCenter: "Todos",
      };
    });
  }, [businessCenterOptions, filters.businessCenter]);

  const options = useMemo(
    () => ({
      periods: periodOptions,
      companies: uniqueValues(records, "Nombre_Sociedad"),
      businessCenters: businessCenterOptions,
      workerTypes: uniqueValues(scopeRecords, "Tipo_Trabajador"),
      contracts: uniqueValues(scopeRecords, "Contrato_Trabajador"),
    }),
    [businessCenterOptions, periodOptions, records, scopeRecords],
  );

  const filteredRecords = useMemo(() => {
    const searchTerm = normalizeSearchText(filters.searchTerm);
    const searchRut = normalizeRut(filters.searchTerm);

    return scopeRecords.filter((item) => {
      const byPeriod = filters.period === "Todos" || item.Periodo === filters.period;
      const byCompany = effectiveCompany === "Todas" || item.Nombre_Sociedad === effectiveCompany;
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
  }, [effectiveCompany, filters, scopeRecords]);

  const sidebarRecords = useMemo(() => {
    const searchTerm = normalizeSearchText(filters.searchTerm);
    const searchRut = normalizeRut(filters.searchTerm);

    return records.filter((item) => {
      const byPeriod = filters.period === "Todos" || item.Periodo === filters.period;
      const byBusinessCenter = filters.businessCenter === "Todos" || item.Centro_de_Negocio === filters.businessCenter;
      const byType = filters.workerType === "Todos" || item.Tipo_Trabajador === filters.workerType;
      const byContract = filters.contract === "Todos" || item.Contrato_Trabajador === filters.contract;
      const bySearch =
        !searchTerm ||
        normalizeSearchText(item.Nombre_Trabajador).includes(searchTerm) ||
        normalizeSearchText(item.Cargo).includes(searchTerm) ||
        (searchRut && normalizeRut(item.RUT_Trabajador).includes(searchRut));

      return byPeriod && byBusinessCenter && byType && byContract && bySearch;
    });
  }, [filters, records]);

  const societies = useMemo(() => getSocietyMetrics(sidebarRecords), [sidebarRecords]);
  const sidebarWorkerMetric = useMemo(() => getWorkerPeriodMetric(sidebarRecords, filters.period), [filters.period, sidebarRecords]);
  const sidebarSocietyWorkerMetrics = useMemo(() => {
    const grouped = sidebarRecords.reduce((acc, item) => {
      const society = item.Nombre_Sociedad;

      if (!society) {
        return acc;
      }

      if (!acc[society]) {
        acc[society] = [];
      }

      acc[society].push(item);
      return acc;
    }, {});

    return Object.fromEntries(
      Object.entries(grouped).map(([society, societyRecords]) => [
        society,
        getWorkerPeriodMetric(societyRecords, filters.period),
      ]),
    );
  }, [filters.period, sidebarRecords]);

  const workerMetric = useMemo(() => getWorkerPeriodMetric(filteredRecords, filters.period), [filteredRecords, filters.period]);

  const comparisonRecords = useMemo(() => {
    const searchTerm = normalizeSearchText(filters.searchTerm);
    const searchRut = normalizeRut(filters.searchTerm);

    return scopeRecords.filter((item) => {
      const byCompany = effectiveCompany === "Todas" || item.Nombre_Sociedad === effectiveCompany;
      const byBusinessCenter = filters.businessCenter === "Todos" || item.Centro_de_Negocio === filters.businessCenter;
      const byType = filters.workerType === "Todos" || item.Tipo_Trabajador === filters.workerType;
      const byContract = filters.contract === "Todos" || item.Contrato_Trabajador === filters.contract;
      const bySearch =
        !searchTerm ||
        normalizeSearchText(item.Nombre_Trabajador).includes(searchTerm) ||
        normalizeSearchText(item.Cargo).includes(searchTerm) ||
        (searchRut && normalizeRut(item.RUT_Trabajador).includes(searchRut));

      return byCompany && byBusinessCenter && byType && byContract && bySearch;
    });
  }, [effectiveCompany, filters, scopeRecords]);

  const analytics = useMemo(() => {
    const companyCosts = groupByCost(filteredRecords, "Nombre_Sociedad");
    const companyMetrics = getSocietyMetrics(filteredRecords);
    const businessCenterCosts = groupByCost(filteredRecords, "Centro_de_Negocio").slice(0, 10);
    const contractCosts = groupByCost(filteredRecords, "Contrato_Trabajador");
    const isAllPeriods = filters.period === "Todos";
    const tableRows = getTopWorkersByCost(filteredRecords, { consolidateByWorker: isAllPeriods });

    return {
      stats: {
        ...getDashboardStats(filteredRecords),
        workerMetric,
      },
      companyCosts,
      companyMetrics,
      societyComparison: getSocietyMetrics(comparisonRecords),
      businessCenterCosts,
      contractCosts,
      breakdown: costBreakdown(filteredRecords),
      monthlyTrend: monthlyCostTrend(filteredRecords),
      periodComparison: getPeriodComparison(comparisonRecords, filters.period),
      tableRows,
      isWorkerTableConsolidated: isAllPeriods,
    };
  }, [comparisonRecords, filteredRecords, filters.period, workerMetric]);

  const scope = useMemo(
    () => ({
      activePeriod: filters.period,
      availablePeriodRange: metadata.period || "Sin rango disponible",
      filteredRecords: filteredRecords.length,
      totalRecords: scopeRecords.length,
      workers: new Set(filteredRecords.map((item) => item.RUT_Trabajador).filter(Boolean)).size,
      workerMetric,
      companies: new Set(filteredRecords.map((item) => item.Nombre_Sociedad).filter(Boolean)).size,
      businessCenters: new Set(filteredRecords.map((item) => item.Centro_de_Negocio).filter(Boolean)).size,
    }),
    [filteredRecords, filters.period, metadata.period, scopeRecords.length, workerMetric],
  );

  return {
    isDatasetValid,
    datasetError,
    records,
    metadata,
    activeCompany,
    societies,
    sidebarWorkerMetric,
    sidebarSocietyWorkerMetrics,
    sidebarPeriodLabel: filters.period === "Todos" ? metadata.period || "Todos" : filters.period,
    filters,
    setFilters,
    options,
    filteredRecords,
    analytics,
    scope,
  };
}
