# Dashboard Ejecutivo de Costo de Mantencion

Dashboard ejecutivo para visualizar costos del area de mantencion de Pullman San Luis.

La version oficial actual del proyecto es la app React/Vite ubicada en `frontend/`. La version antigua en Streamlit fue retirada del repositorio principal para reducir ruido tecnico y evitar confusion sobre cual es la aplicacion vigente. Existe un respaldo externo de esa version historica, pero ya no forma parte del arbol principal.

## Stack oficial

- React
- Vite
- Tailwind CSS
- Recharts
- Python para procesamiento de datos

## Flujo de datos

```text
Excel -> backend/scripts/export_maintenance_cost_data.py -> frontend/src/data/maintenanceCostData.json -> React
```

El archivo Excel oficial es `data/Base_Maestra_Mantencion.xlsx` y no debe modificarse manualmente desde la app. El JSON usado por React debe regenerarse desde el script Python cuando cambie la fuente de datos.

## Estructura principal

```text
Costo_Mantencion/
├── backend/
│   └── scripts/
│       └── export_maintenance_cost_data.py
├── data/
│   └── Base_Maestra_Mantencion.xlsx
├── docs/
│   ├── audit/
│   ├── decisions/
│   ├── roadmap/
│   ├── architecture/
│   └── deployment/
├── frontend/
│   ├── public/
│   └── src/
├── references/
├── agents.md
├── handoff.md
├── readme.md
└── requirements.txt
```

## Frontend React

Instalar dependencias:

```bash
cd frontend
npm install
```

Ejecutar en desarrollo:

```bash
cd frontend
npm.cmd run dev
```

Generar build:

```bash
cd frontend
npm.cmd run build
```

## Procesamiento de datos

Regenerar el JSON desde el Excel:

```bash
python backend/scripts/export_maintenance_cost_data.py
```

## Nota historica

La app Streamlit antigua fue retirada del repositorio principal. Si fuera necesario recuperarla, debe hacerse desde el respaldo externo del proyecto o desde el historial Git anterior a la decision documentada en `docs/decisions/ADR-001-retirar-streamlit-app.md`.
