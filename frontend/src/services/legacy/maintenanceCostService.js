import dataset from "../../data/generated/maintenanceCostData.dw_v2.json";

function invalidDataset(datasetError) {
  return {
    isDatasetValid: false,
    datasetError,
    records: [],
    metadata: {},
  };
}

// Centraliza el acceso al dataset para que futuras fuentes de datos no obliguen a tocar la UI.
export function getMaintenanceCostDataset() {
  if (!dataset) {
    return invalidDataset("Dataset de costos no disponible.");
  }

  if (!Array.isArray(dataset.records)) {
    return invalidDataset("Dataset de costos inválido: records debe ser un array.");
  }

  if (!dataset.metadata || Array.isArray(dataset.metadata) || typeof dataset.metadata !== "object") {
    return invalidDataset("Dataset de costos inválido: metadata debe ser un objeto.");
  }

  return {
    isDatasetValid: true,
    datasetError: null,
    records: dataset.records,
    metadata: dataset.metadata,
  };
}
