export function formatCurrency(value) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function formatCompactCurrency(value) {
  const amount = Math.abs(value || 0);

  if (amount >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1).replace(".", ",")}M`;
  }

  if (amount >= 1_000) {
    return `$${Math.round(value / 1_000)}K`;
  }

  return formatCurrency(value);
}

export function formatPercent(value) {
  return `${(value || 0).toFixed(1).replace(".", ",")}%`;
}

export function shortName(name) {
  return String(name || "")
    .replace("Empresa de Transportes ", "")
    .replace("Sociedad de transportes ", "")
    .replace("Pullman San Luis", "Pullman SL")
    .replace(/\s+LTDA|\s+SPA/gi, "")
    .trim();
}
