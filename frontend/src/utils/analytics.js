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
