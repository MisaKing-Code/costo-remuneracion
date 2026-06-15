import { useMemo, useState } from "react";
import { getMaintenanceCostDataset } from "../services/legacy/maintenanceCostService";
import { costBreakdown, getDashboardStats, groupByCost, uniqueValues } from "../utils/analytics";

const defaultFilters = {
  company: "Todas",
  businessCenter: "Todos",
  workerType: "Todos",
  contract: "Todos",
};

export function useCostDashboard() {
  const [filters, setFilters] = useState(defaultFilters);
  const dataset = getMaintenanceCostDataset();
  const {
    isDatasetValid = false,
    datasetError = "Dataset de costos inválido.",
    records: datasetRecords = [],
    metadata: datasetMetadata = {},
  } = dataset || {};
  const records = Array.isArray(datasetRecords) ? datasetRecords : [];
  const metadata = datasetMetadata && typeof datasetMetadata === "object" && !Array.isArray(datasetMetadata) ? datasetMetadata : {};

  const options = useMemo(
    () => ({
      companies: uniqueValues(records, "Nombre_Sociedad"),
      businessCenters: uniqueValues(records, "Centro_de_Negocio"),
      workerTypes: uniqueValues(records, "Tipo_Trabajador"),
      contracts: uniqueValues(records, "Contrato_Trabajador"),
    }),
    [records],
  );

  const filteredRecords = useMemo(() => {
    return records.filter((item) => {
      const byCompany = filters.company === "Todas" || item.Nombre_Sociedad === filters.company;
      const byBusinessCenter = filters.businessCenter === "Todos" || item.Centro_de_Negocio === filters.businessCenter;
      const byType = filters.workerType === "Todos" || item.Tipo_Trabajador === filters.workerType;
      const byContract = filters.contract === "Todos" || item.Contrato_Trabajador === filters.contract;
      return byCompany && byBusinessCenter && byType && byContract;
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
  };
}
