const moneyFields = [
  "Total_Haberes",
  "AFC_Empresa",
  "Mutual",
  "SIS",
  "Seguro_Social",
  "Expectativa_de_Vida",
  "Asignación_Familiar",
];

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
  const workers = new Set(records.map((item) => item.RUT_Trabajador)).size;
  const companies = new Set(records.map((item) => item.Nombre_Sociedad)).size;
  const maxCost = Math.max(...records.map((item) => Number(item.Total_Costo || 0)), 0);

  return {
    totalCost,
    workers,
    companies,
    averageCost: workers ? totalCost / workers : 0,
    maxCost,
  };
}
