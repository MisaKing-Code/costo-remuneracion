const moneyFields = [
  "Total_Haberes",
  "AFC_Empresa",
  "Mutual",
  "SIS",
  "Seguro_Social",
  "Expectativa_de_Vida",
  "Asignación_Familiar",
];

const employerContributionFields = moneyFields.filter((field) => field !== "Total_Haberes");
const workerTableMoneyFields = [...moneyFields, "Haberes_Imponibles", "Total_Costo"];

export function uniqueValues(records, field) {
  return [...new Set(records.map((item) => item[field]).filter(Boolean))].sort((a, b) =>
    String(a).localeCompare(String(b), "es"),
  );
}

export function sumBy(records, field) {
  return records.reduce((total, item) => total + Number(item[field] || 0), 0);
}

export function groupByCost(records, field) {
  const total = sumBy(records, "Total_Costo");
  const grouped = records.reduce((acc, item) => {
    const key = item[field] || "Sin dato";
    acc[key] = (acc[key] || 0) + Number(item.Total_Costo || 0);
    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([name, value]) => ({
      name,
      value,
      percent: total ? (value / total) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);
}

export function monthlyCostTrend(records) {
  const grouped = records.reduce((acc, item) => {
    const period = item.Periodo || "Sin periodo";

    if (!acc[period]) {
      acc[period] = {
        period,
        totalCost: 0,
        totalHaberes: 0,
        employerContributions: 0,
      };
    }

    acc[period].totalCost += Number(item.Total_Costo || 0);
    acc[period].totalHaberes += Number(item.Total_Haberes || 0);
    acc[period].employerContributions += employerContributionFields.reduce(
      (total, field) => total + Number(item[field] || 0),
      0,
    );

    return acc;
  }, {});

  return Object.values(grouped).sort((a, b) => String(a.period).localeCompare(String(b.period), "es"));
}

export function getPeriodComparison(records, selectedPeriod) {
  if (!selectedPeriod || selectedPeriod === "Todos") {
    return null;
  }

  const monthlySeries = monthlyCostTrend(records);
  const selectedIndex = monthlySeries.findIndex((item) => item.period === selectedPeriod);

  if (selectedIndex === -1) {
    return {
      selectedPeriod,
      selectedCost: 0,
      previousPeriod: null,
      previousCost: 0,
      averageCost: 0,
      deltaVsPrevious: 0,
      deltaVsPreviousPct: null,
      deltaVsAverage: 0,
      deltaVsAveragePct: null,
      maxPeriod: null,
      maxCost: 0,
      minPeriod: null,
      minCost: 0,
      rank: null,
      totalPeriods: monthlySeries.length,
      monthlySeries,
    };
  }

  const selected = monthlySeries[selectedIndex];
  const selectedCost = selected.totalCost;
  const previous = selectedIndex > 0 ? monthlySeries[selectedIndex - 1] : null;
  const totalCost = monthlySeries.reduce((total, item) => total + item.totalCost, 0);
  const averageCost = monthlySeries.length ? totalCost / monthlySeries.length : 0;
  const sortedByCost = [...monthlySeries].sort((a, b) => b.totalCost - a.totalCost);
  const max = sortedByCost[0] || null;
  const min = sortedByCost[sortedByCost.length - 1] || null;
  const rank = sortedByCost.findIndex((item) => item.period === selectedPeriod) + 1;
  const deltaVsPrevious = previous ? selectedCost - previous.totalCost : 0;
  const deltaVsAverage = selectedCost - averageCost;

  return {
    selectedPeriod,
    selectedCost,
    previousPeriod: previous?.period || null,
    previousCost: previous?.totalCost || 0,
    averageCost,
    deltaVsPrevious,
    deltaVsPreviousPct: previous && previous.totalCost ? (deltaVsPrevious / previous.totalCost) * 100 : null,
    deltaVsAverage,
    deltaVsAveragePct: averageCost ? (deltaVsAverage / averageCost) * 100 : null,
    maxPeriod: max?.period || null,
    maxCost: max?.totalCost || 0,
    minPeriod: min?.period || null,
    minCost: min?.totalCost || 0,
    rank: rank || null,
    totalPeriods: monthlySeries.length,
    monthlySeries,
  };
}

export function costBreakdown(records) {
  const total = sumBy(records, "Total_Costo");

  return moneyFields
    .map((field) => {
      const value = sumBy(records, field);
      return {
        key: field,
        name: field.replaceAll("_", " "),
        value,
        percent: total ? (value / total) * 100 : 0,
      };
    })
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);
}

function comparePeriods(a, b) {
  return String(a.Periodo || "").localeCompare(String(b.Periodo || ""), "es");
}

export function getTopWorkersByCost(records, { consolidateByWorker = false } = {}) {
  if (!consolidateByWorker) {
    return [...records].sort((a, b) => Number(b.Total_Costo || 0) - Number(a.Total_Costo || 0));
  }

  const grouped = records.reduce((acc, item) => {
    const key = item.RUT_Trabajador || item.Nombre_Trabajador || "Sin trabajador";
    const current = acc[key];

    if (!current) {
      acc[key] = { ...item };
    } else {
      workerTableMoneyFields.forEach((field) => {
        current[field] = Number(current[field] || 0) + Number(item[field] || 0);
      });

      if (comparePeriods(item, current) >= 0) {
        current.Nombre_Sociedad = item.Nombre_Sociedad;
        current.Empresa_Corta = item.Empresa_Corta;
        current.Centro_de_Negocio = item.Centro_de_Negocio;
        current.Cargo = item.Cargo;
        current.Tipo_Trabajador = item.Tipo_Trabajador;
        current.Contrato_Trabajador = item.Contrato_Trabajador;
        current.Periodo = item.Periodo;
      }
    }

    return acc;
  }, {});

  return Object.values(grouped).sort((a, b) => Number(b.Total_Costo || 0) - Number(a.Total_Costo || 0));
}

export function getDashboardStats(records) {
  const totalCost = sumBy(records, "Total_Costo");
  const totalHaberes = sumBy(records, "Total_Haberes");
  const employerContributions = employerContributionFields.reduce((total, field) => total + sumBy(records, field), 0);
  const workers = new Set(records.map((item) => item.RUT_Trabajador)).size;
  const companies = new Set(records.map((item) => item.Nombre_Sociedad)).size;
  const businessCenters = new Set(records.map((item) => item.Centro_de_Negocio).filter(Boolean)).size;
  const maxCost = Math.max(...records.map((item) => Number(item.Total_Costo || 0)), 0);

  return {
    totalCost,
    totalHaberes,
    employerContributions,
    workers,
    companies,
    businessCenters,
    averageCost: workers ? totalCost / workers : 0,
    maxCost,
  };
}
