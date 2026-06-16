# Cierre tecnico Sprint 10 - MVP Polish

## Objetivo del sprint

Completar el pulido MVP del dashboard corporativo dejando aplicada la homologacion oficial de sociedades en DW V2, regenerando el JSON consumido por el dashboard y validando que el build productivo siga funcionando sin cambios en React.

## Rama utilizada

`sprint-10-mvp-polish`

## Resumen ejecutivo

Sprint 10 queda cerrado tecnicamente con la homologacion oficial de las 5 sociedades del grupo Pullman aplicada en la capa gobernada de companias.

El flujo ejecutado fue:

```text
data/governance/company_homologation_template.csv
    -> backend/scripts/sync_company_homologation.py --dry-run
    -> backend/scripts/sync_company_homologation.py --apply
    -> data/datawarehouse/v2/dimensions/dim_company.csv
    -> backend/scripts/audit_company_dimension.py
    -> backend/scripts/generate_dw_v2_legacy_dashboard_data.py
    -> frontend/src/data/generated/maintenanceCostData.dw_v2.json
    -> npm run build
```

No se modifico React y no se modifico el adapter.

## Homologacion oficial aplicada

Se actualizaron los datos oficiales de sociedades en:

- `data/governance/company_homologation_template.csv`
- `data/datawarehouse/v2/dimensions/dim_company.csv`

Sociedades homologadas:

| Codigo | RUT | Nombre legal | Nombre corto |
| --- | --- | --- | --- |
| `LTDA` | `77.702.160-5` | Empresa de Transporte Pullman San Luis LTDA. | Pullman San Luis LTDA. |
| `SPA` | `76.922.263-4` | Sociedad de Transporte San Luis SPA. | Transporte San Luis SPA. |
| `SPA_MC` | `77.420.253-6` | Sociedad de Servicios San Luis SPA. | Servicios San Luis SPA. |
| `SPA_CC` | `77.229.512-K` | Servicios de Transporte San Luis SPA. | Servicios Transporte SPA. |
| `LCM` | `7.959.425-3` | Luis Cordero Martini | LCM |

Campos gobernados:

- `business_group`: `Pullman`
- `homologation_status`: `approved`
- `approval_owner`: `negocio`
- `approval_date`: `2026-06-16`
- `notes`: `Homologacion oficial entregada por negocio`

## Sincronizacion de homologacion

Comandos ejecutados:

```bash
python -m backend.scripts.sync_company_homologation --dry-run
python -m backend.scripts.sync_company_homologation --apply
```

Resultado del reporte `data/quality/company_homologation_sync_report.txt`:

- Modo final: `apply`.
- Registros template: 5.
- Registros `dim_company`: 5.
- Cambios detectados: 24.
- Cambios aplicados: si.
- Errores: sin errores.
- Advertencias: sin advertencias.
- Resultado: `OK: sincronizacion validada`.

## Snapshot creado

Antes de actualizar `dim_company`, el sincronizador creo el snapshot:

`data/datawarehouse/v2/snapshots/dim_company_20260616_123000.csv`

Este archivo conserva el estado anterior de `dim_company` y permite trazabilidad o rollback manual si negocio solicita revisar la homologacion aplicada.

## Auditoria de companias

Comando ejecutado:

```bash
python -m backend.scripts.audit_company_dimension
```

Resultado del reporte `data/quality/company_dimension_audit_report.txt`:

- Estado de auditoria: `OK`.
- Registros `dim_company`: 5.
- Registros `dim_sociedad`: 5.
- Registros dashboard: 1735.
- Sociedades dashboard: `LCM`, `LTDA`, `SPA`, `SPA_CC`, `SPA_MC`.
- Errores criticos: sin errores criticos.
- Advertencias: sin advertencias.
- Recomendacion: `dim_company es apta tecnicamente como fuente de etiquetas actuales del dashboard`.

## JSON regenerado para dashboard

Comando ejecutado:

```bash
python -m backend.scripts.generate_dw_v2_legacy_dashboard_data
```

Resultado del reporte `data/quality/dw_v2_legacy_dashboard_data_report.txt`:

- Archivo generado: `frontend/src/data/generated/maintenanceCostData.dw_v2.json`.
- Registros: 1735.
- Trabajadores unicos: 398.
- Empresas unicas: 5.
- Periodo cubierto: `2026-01` a `2026-05`.
- Total costo: `2620369575`.
- Registros con match en `dim_company`: 1735.
- Registros sin match en `dim_company`: 0.
- Fallbacks aplicados:
  - `RUT_Sociedad`: 0.
  - `Nombre_Sociedad`: 0.
  - `Empresa_Corta`: 0.
  - `Cargo`: 0.
  - `Tipo_Trabajador`: 0.
  - `Contrato_Trabajador`: 0.
- Errores: sin errores.

Sociedades mapeadas en el JSON:

- Empresa de Transporte Pullman San Luis LTDA.
- Luis Cordero Martini.
- Servicios de Transporte San Luis SPA.
- Sociedad de Servicios San Luis SPA.
- Sociedad de Transporte San Luis SPA.

## Resultado del build

Comando ejecutado:

```bash
npm run build
```

Resultado:

- Estado: exitoso.
- Vite: `v6.4.2`.
- Modulos transformados: 2212.
- Tiempo de build: 6.26s.
- CSS generado: `assets/index-BPMFC14g.css`.
- JS generado: `assets/index-DGLl0mxT.js`.
- Gzip JS: 234.45 kB.

Advertencia conocida:

```text
Some chunks are larger than 500 kB after minification.
```

Esta advertencia no bloquea el cierre tecnico del sprint. El bundle principal sigue superando el umbral recomendado por Vite, probablemente por la carga estatica del dataset JSON generado y dependencias de visualizacion.

## Archivos impactados

- `data/governance/company_homologation_template.csv`
- `data/datawarehouse/v2/dimensions/dim_company.csv`
- `data/datawarehouse/v2/snapshots/dim_company_20260616_123000.csv`
- `data/quality/company_homologation_sync_report.txt`
- `data/quality/company_dimension_audit_report.txt`
- `data/quality/dw_v2_legacy_dashboard_data_report.txt`
- `frontend/src/data/generated/maintenanceCostData.dw_v2.json`
- `docs/sprints/sprint-10-mvp-polish/sprint_10_closure_report.md`

## Riesgos pendientes

- Persisten 4 filas de dotacion sin remuneracion equivalente en el proceso de generacion del JSON DW V2. No bloquea el dashboard porque el JSON se genera correctamente, pero debe mantenerse visible como brecha de conciliacion entre dotacion y remuneraciones.
- El bundle productivo mantiene advertencia por chunk JavaScript mayor a 500 kB. No bloquea el build, pero conviene evaluar carga diferida o estrategia de datos si crece el volumen.
- La homologacion oficial queda aplicada para las 5 sociedades actuales; el flujo todavia rechaza altas/bajas de sociedades nuevas y requeriria extension controlada si cambia el universo corporativo.
- El reporte depende del snapshot y reportes generados el 2026-06-16; ante nuevos cambios de negocio se debe repetir `dry-run`, `apply`, auditoria, generacion JSON y build.

## Recomendacion final

Sprint 10 queda apto para cierre tecnico MVP Polish.

La homologacion oficial fue aplicada mediante flujo gobernado, el snapshot fue creado, la auditoria de companias queda en estado `OK`, el JSON del dashboard fue regenerado sin fallbacks de sociedades y el build productivo finalizo correctamente.

No se realizo merge ni commit durante este cierre.
