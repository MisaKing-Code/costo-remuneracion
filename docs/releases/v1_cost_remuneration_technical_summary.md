# Resumen tecnico V1 - Dashboard de Costo Remuneracional Corporativo

## Arquitectura actual

La arquitectura V1 mantiene una separacion simple:

- DW V2 vive en `data/datawarehouse/v2`.
- Un adapter Python genera un JSON compatible con el contrato legacy del dashboard.
- El frontend React/Vite consume el JSON generado desde la capa de servicio legacy.
- La UI mantiene hooks y componentes existentes con mejoras acotadas de usabilidad.

No se introdujeron nuevas dimensiones grandes, no se modifico la estructura DW V2 y no se cambio la homologacion legal de sociedades.

## Flujo de datos

```text
data/datawarehouse/v2
  -> backend/scripts/generate_dw_v2_legacy_dashboard_data.py
  -> frontend/src/data/generated/maintenanceCostData.dw_v2.json
  -> frontend/src/services/legacy/maintenanceCostService.js
  -> frontend/src/hooks/useCostDashboard.js
  -> Dashboard React
```

## Archivos clave

Frontend:

- `frontend/src/pages/ExecutiveDashboard.jsx`
- `frontend/src/components/Header.jsx`
- `frontend/src/components/FilterBar.jsx`
- `frontend/src/components/KpiGrid.jsx`
- `frontend/src/components/CompanyDonut.jsx`
- `frontend/src/components/CostBreakdown.jsx`
- `frontend/src/components/RankingBars.jsx`
- `frontend/src/components/WorkerTable.jsx`
- `frontend/src/components/Login.jsx`
- `frontend/src/hooks/useCostDashboard.js`
- `frontend/src/utils/analytics.js`
- `frontend/src/services/legacy/maintenanceCostService.js`
- `frontend/src/data/generated/maintenanceCostData.dw_v2.json`

Backend y datos:

- `backend/scripts/generate_dw_v2_legacy_dashboard_data.py`
- `backend/scripts/audit_company_dimension.py`
- `backend/scripts/audit_dashboard_period_scope.py`
- `data/datawarehouse/v2/facts/fact_remuneraciones_mensual.csv`
- `data/datawarehouse/v2/facts/fact_dotacion_mensual.csv`
- `data/datawarehouse/v2/dimensions/dim_company.csv`

Reportes de calidad:

- `data/quality/dw_v2_legacy_dashboard_data_report.txt`
- `data/quality/company_dimension_audit_report.txt`
- `data/quality/dashboard_period_scope_audit_report.txt`

## Scripts de generacion y auditoria

Generar JSON del dashboard desde DW V2:

```bash
python -m backend.scripts.generate_dw_v2_legacy_dashboard_data
```

Auditar dimension corporativa de companias:

```bash
python -m backend.scripts.audit_company_dimension
```

Auditar alcance inicial por periodo:

```bash
python -m backend.scripts.audit_dashboard_period_scope
```

## Como regenerar datos

Desde la raiz del repositorio:

```bash
python -m backend.scripts.generate_dw_v2_legacy_dashboard_data
```

Salida principal:

```text
frontend/src/data/generated/maintenanceCostData.dw_v2.json
```

Reporte:

```text
data/quality/dw_v2_legacy_dashboard_data_report.txt
```

## Como levantar frontend

Desde `frontend`:

```bash
npm install
npm.cmd run dev
```

El servidor Vite informara la URL local disponible.

## Como hacer build

Desde `frontend`:

```bash
npm run build
```

Resultado esperado para V1:

- Build exitoso.
- Advertencia conocida por chunk JavaScript mayor a 500 kB.

## Notas tecnicas

- El dashboard consume el JSON DW V2 generado, no el JSON legacy original.
- La compatibilidad se mantiene a traves del servicio `maintenanceCostService.js`.
- `useCostDashboard.js` centraliza filtros, busqueda normalizada, scope activo y calculo de analytics.
- El filtro inicial usa el ultimo periodo disponible para evitar abrir con el acumulado completo.
- La homologacion legal de sociedades permanece pendiente y debe completarse en una fase posterior.
