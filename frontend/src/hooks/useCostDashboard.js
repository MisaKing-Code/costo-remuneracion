import { useMemo, useState } from "react";
import { getMaintenanceCostDataset } from "../services/legacy/maintenanceCostService";
import { costBreakdown, getDashboardStats, groupByCost, uniqueValues } from "../utils/analytics";

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

export function useCostDashboard() {
  const dataset = getMaintenanceCostDataset();
  const {
    isDatasetValid = false,
    datasetError = "Dataset de costos inválido.",
    records: datasetRecords = [],
    metadata: datasetMetadata = {},
  } = dataset || {};
  const records = Array.isArray(datasetRecords) ? datasetRecords : [];
  const metadata = datasetMetadata && typeof datasetMetadata === "object" && !Array.isArray(datasetMetadata) ? datasetMetadata : {};

  const periodOptions = useMemo(
    () => uniqueValues(records, "Periodo").sort((a, b) => String(b).localeCompare(String(a), "es")),
    [records],
  );
  const [filters, setFilters] = useState(() => defaultFilters(periodOptions[0] || "Todos"));

  const options = useMemo(
    () => ({
      periods: periodOptions,
      companies: uniqueValues(records, "Nombre_Sociedad"),
      businessCenters: uniqueValues(records, "Centro_de_Negocio"),
      workerTypes: uniqueValues(records, "Tipo_Trabajador"),
      contracts: uniqueValues(records, "Contrato_Trabajador"),
    }),
    [periodOptions, records],
  );

  const filteredRecords = useMemo(() => {
    const searchTerm = normalizeSearchText(filters.searchTerm);
    const searchRut = normalizeRut(filters.searchTerm);

    return records.filter((item) => {
      const byPeriod = filters.period === "Todos" || item.Periodo === filters.period;
      const byCompany = filters.company === "Todas" || item.Nombre_Sociedad === filters.company;
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
  }, [filters, records]);

  const analytics = useMemo(() => {
    const companyCosts = groupByCost(filteredRecords, "Nombre_Sociedad");
    const businessCenterCosts = groupByCost(filteredRecords, "Centro_de_Negocio").slice(0, 10);
    const contractCosts = groupByCost(filteredRecords, "Contrato_Trabajador");

    return {
      stats: getDashboardStats(filteredRecords),
      companyCosts,
      businessCenterCosts,
      contractCosts,
      breakdown: costBreakdown(filteredRecords),
      tableRows: [...filteredRecords].sort((a, b) => b.Total_Costo - a.Total_Costo),
    };
  }, [filteredRecords]);

  const scope = useMemo(
    () => ({
      activePeriod: filters.period,
      availablePeriodRange: metadata.period || "Sin rango disponible",
      filteredRecords: filteredRecords.length,
      totalRecords: records.length,
      workers: new Set(filteredRecords.map((item) => item.RUT_Trabajador).filter(Boolean)).size,
      companies: new Set(filteredRecords.map((item) => item.Nombre_Sociedad).filter(Boolean)).size,
      businessCenters: new Set(filteredRecords.map((item) => item.Centro_de_Negocio).filter(Boolean)).size,
    }),
    [filteredRecords, filters.period, metadata.period, records.length],
  );

  return {
    isDatasetValid,
    datasetError,
    records,
    metadata,
    filters,
    setFilters,
    options,
    filteredRecords,
    analytics,
    scope,
  };
}
