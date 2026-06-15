# Cierre tecnico Sprint 04 - Dashboard DW V2

## Objetivo del sprint

Conectar el dashboard corporativo al dataset generado desde Data Warehouse V2 manteniendo estable el contrato legacy consumido por el frontend actual.

El sprint busco avanzar sin modificar componentes React, preservando `useCostDashboard.js`, `analytics.js` y los componentes existentes como consumidores del mismo contrato de datos.

## Rama utilizada

```text
sprint-04-dashboard-dw-v2
```

## Resumen de implementacion

Se implemento un adapter Python que lee `data/datawarehouse/v2`, cruza facts y dimensiones, y genera un JSON compatible con el contrato legacy del dashboard.

El dashboard se conecto al nuevo dataset desde la capa de servicio, manteniendo `frontend/src/services/legacy/maintenanceCostService.js` como punto unico de entrada. No se modificaron componentes React ni hooks.

Tambien se agrego una auditoria comparativa entre el JSON legacy original y el JSON generado desde DW V2 para documentar diferencias de metricas antes del merge.

## Archivos creados/modificados

Archivos de backend y calidad:

- `backend/scripts/generate_dw_v2_legacy_dashboard_data.py`
- `backend/scripts/audit_dashboard_dw_v2_comparison.py`
- `data/quality/dw_v2_legacy_dashboard_data_report.txt`
- `data/quality/dashboard_dw_v2_comparison_report.txt`

Archivos frontend/data:

- `frontend/src/data/generated/maintenanceCostData.dw_v2.json`
- `frontend/src/services/legacy/maintenanceCostService.js`

Documentacion de sprint:

- `docs/sprints/sprint-04-dashboard-dw-v2/frontend_legacy_dependency_audit.md`
- `docs/sprints/sprint-04-dashboard-dw-v2/dw_v2_to_legacy_adapter_design.md`
- `docs/sprints/sprint-04-dashboard-dw-v2/sprint_04_closure_report.md`

## Validaciones ejecutadas

```bash
npm run build
python -m backend.scripts.generate_dw_v2_legacy_dashboard_data
python -m backend.scripts.audit_dashboard_dw_v2_comparison
```

## Resultado del build

Resultado: exitoso.

```text
vite v6.4.2 building for production...
2212 modules transformed.
built in 6.86s
```

Observacion: Vite reporto warning de chunk mayor a 500 kB.

```text
Some chunks are larger than 500 kB after minification.
```

Este warning no bloquea el build y no esta relacionado directamente con el cambio de dataset.

## Resultado de generacion DW V2

El comando `python -m backend.scripts.generate_dw_v2_legacy_dashboard_data` finalizo correctamente.

Resultado:

- Registros generados: `1735`
- Trabajadores unicos: `398`
- Empresas unicas: `5`
- Periodo: `2026-01 a 2026-05`
- Total costo: `2620369575`

Fallbacks aplicados:

- `RUT_Sociedad`: `1735`
- `Nombre_Sociedad`: `1735`
- `Empresa_Corta`: `1735`
- `Cargo`: `0`
- `Tipo_Trabajador`: `0`
- `Contrato_Trabajador`: `0`

Advertencias:

- `4` filas de dotacion no tienen remuneracion equivalente.
- `RUT_Sociedad` queda como `"Sin dato"` por falta de equivalente directo en DW V2.
- `Nombre_Sociedad` usa codigo de sociedad DW V2.
- `Empresa_Corta` se deriva desde `Nombre_Sociedad`.

Errores: sin errores.

## Resultado de auditoria comparativa

El comando `python -m backend.scripts.audit_dashboard_dw_v2_comparison` finalizo correctamente.

Resumen:

| Metrica | Legacy | DW V2 | Diferencia |
| --- | ---: | ---: | ---: |
| Cantidad de registros | 31 | 1735 | 1704 |
| Trabajadores unicos | 31 | 398 | 367 |
| Empresas unicas | 3 | 5 | 2 |
| Centros de negocio unicos | 1 | 56 | 55 |
| Total haberes | 54442062 | 2500573479 | 2446131417 |
| Total costo | 57106410 | 2620369575 | 2563263165 |

Contrato:

- Campos presentes en ambos datasets: `18`.
- Campos solo en legacy: `0`.
- Campos solo en DW V2: `0`.
- Nulos en campos criticos: `0` en ambos datasets.
- Tipos de datos criticos: compatibles entre legacy y DW V2.

Diferencias criticas documentadas:

- El universo cambia de `31` registros legacy a `1735` registros DW V2.
- Los centros de negocio cambian de `1` a `56`.
- El total costo cambia de `57106410` a `2620369575`.

## Riesgos aceptados

Riesgos tecnicos:

- El servicio legacy ahora apunta al JSON generado desde DW V2, aunque el nombre del servicio conserva la convencion legacy.
- El contrato de campos se mantiene, pero parte de los valores viene con fallbacks.
- `RUT_Sociedad` no existe en DW V2 y se emite como `"Sin dato"`.
- `Nombre_Sociedad` y `Empresa_Corta` dependen de codigos o derivaciones hasta que exista homologacion corporativa.

Riesgos funcionales:

- El dashboard deja de representar el universo legacy acotado a mantencion y pasa a representar el universo DW V2 completo.
- El aumento de registros, empresas, centros de negocio y costos es esperado por el cambio de fuente, pero requiere aprobacion funcional.
- El periodo visible pasa de `"Periodo vigente"` a `2026-01 a 2026-05`.

## Observaciones funcionales

El contrato tecnico esta estable para el frontend actual: no faltan campos, no hay nulos en campos criticos y los tipos numericos/texto son compatibles.

La diferencia principal no es tecnica sino funcional: el alcance del dataset DW V2 es mucho mas amplio que el JSON legacy original. Esta diferencia debe quedar aceptada por negocio antes del merge si el objetivo es publicar el dashboard con el universo DW V2 completo.

## Decision tecnica

Decision: **apto con observaciones para merge**.

Justificacion:

- Build frontend exitoso.
- Generacion del JSON DW V2 exitosa.
- Auditoria comparativa exitosa.
- Contrato legacy preservado.
- Sin cambios en componentes React ni hooks.
- Sin errores en reportes de generacion/auditoria.

Condicion para merge:

- Aprobacion explicita del cambio funcional de universo: legacy mantencion acotado vs DW V2 completo.

Si esa aprobacion funcional no existe, la recomendacion cambia a **no apto para merge funcional**, aunque el estado tecnico sea correcto.

## Proximos pasos sugeridos para Sprint 05

1. Definir homologacion oficial de sociedades con `RUT_Sociedad`, `Nombre_Sociedad` y `Empresa_Corta`.
2. Definir si el dashboard debe mostrar universo DW V2 completo o un subset equivalente a mantencion.
3. Incorporar selector o estrategia oficial de periodo.
4. Agregar pruebas automatizadas de contrato para el JSON generado.
5. Evaluar desacoplar el frontend de nombres legacy de Excel hacia un contrato frontend propio.
6. Revisar optimizacion de bundle si el warning de chunk grande se vuelve relevante para despliegue.
