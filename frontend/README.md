# Frontend Dashboard Costo Mantención

Aplicación React + Vite + Tailwind CSS orientada a dashboard ejecutivo de costo de mantención.

## Ejecutar

```bash
cd frontend
npm install
npm run dev
```

Vite publicará la aplicación normalmente en `http://127.0.0.1:5173`.

## Compilar

```bash
npm run build
```

## Actualizar datos desde Excel

Desde la raíz del proyecto:

```bash
python backend/scripts/export_maintenance_cost_data.py
```

El script lee `data/Base_Maestra_Mantención.xlsx`, detecta el encabezado real de la hoja `Costo_Mantención`, excluye filas vacías y la fila de total, y actualiza `frontend/src/data/maintenanceCostData.json`.
