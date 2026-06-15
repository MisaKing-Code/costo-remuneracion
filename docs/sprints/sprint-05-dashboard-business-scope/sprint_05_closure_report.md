# Cierre tecnico Sprint 05 - Alcance de negocio del dashboard

## Objetivo del sprint

Controlar el alcance inicial de negocio del dashboard conectado a DW V2, evitando que los KPIs carguen por defecto el universo acumulado completo.

El foco del sprint fue incorporar `Periodo` al dataset generado y usarlo como filtro inicial del dashboard, manteniendo el contrato legacy-compatible y sin redisenar todavia el modelo completo de filtros de negocio.

## Rama utilizada

```text
sprint-05-dashboard-business-scope
```

## Resumen de cambios

Se audito la capa de filtros actual del dashboard y se confirmo que solo existian filtros por empresa, centro de negocio, tipo trabajador y contrato. No existia filtro por periodo ni busqueda de trabajador.

Luego se actualizo el adapter DW V2 para emitir `Periodo` por cada registro del JSON generado. Con ese campo disponible, se agrego soporte frontend para filtrar por periodo desde `useCostDashboard.js` y `FilterBar.jsx`.

El comportamiento inicial del dashboard quedo configurado para seleccionar automaticamente el ultimo periodo disponible, en vez de iniciar en `Todos`. Esto reduce el universo inicial frente al acumulado completo de DW V2.

## Archivos creados/modificados

Backend y datos:

- `backend/scripts/generate_dw_v2_legacy_dashboard_data.py`
- `backend/scripts/audit_dashboard_period_scope.py`
- `data/quality/dw_v2_legacy_dashboard_data_report.txt`
- `data/quality/dashboard_period_scope_audit_report.txt`
- `frontend/src/data/generated/maintenanceCostData.dw_v2.json`

Frontend:

- `frontend/src/hooks/useCostDashboard.js`
- `frontend/src/components/FilterBar.jsx`

Documentacion:

- `docs/sprints/sprint-05-dashboard-business-scope/filter_scope_audit.md`
- `docs/sprints/sprint-05-dashboard-business-scope/sprint_05_closure_report.md`

## Filtro Periodo implementado

El dashboard ahora:

- Obtiene periodos unicos desde `records`.
- Ordena periodos en forma descendente.
- Expone opcion `Todos`.
- Filtra registros por `item.Periodo` cuando el filtro no es `Todos`.
- Mantiene los filtros existentes de empresa, centro de negocio, tipo trabajador y contrato.

## Comportamiento inicial

Comportamiento inicial implementado:

```text
Periodo inicial: ultimo periodo disponible
```

Periodo detectado en la validacion final:

```text
2026-05
```

Esto evita iniciar con el acumulado completo `2026-01 a 2026-05`.

## Comparacion acumulado vs ultimo periodo

Resultado de la auditoria `python -m backend.scripts.audit_dashboard_period_scope`:

| Metrica | Total acumulado | Ultimo periodo | Participacion ultimo periodo |
| --- | ---: | ---: | ---: |
| Registros | 1735 | 343 | 19.8% |
| Trabajadores unicos | 398 | 343 | 86.2% |
| Total costo | 2620369575 | 522714867 | 19.9% |
| Centros de negocio | 56 | 51 | 91.1% |
| Empresas | 5 | 5 | 100.0% |

Periodos disponibles:

```text
2026-01, 2026-02, 2026-03, 2026-04, 2026-05
```

## Resultado del build

Validacion ejecutada:

```bash
npm run build
```

Resultado: exitoso.

```text
vite v6.4.2 building for production...
2212 modules transformed.
built in 5.59s
```

Observacion: se mantiene warning no bloqueante de Vite por chunk mayor a 500 kB.

## Resultado de auditorias

### Generacion DW V2 legacy-compatible

Validacion ejecutada:

```bash
python -m backend.scripts.generate_dw_v2_legacy_dashboard_data
```

Resultado:

- Registros generados: `1735`
- Trabajadores unicos: `398`
- Empresas unicas: `5`
- Periodo metadata: `2026-01 a 2026-05`
- Total costo: `2620369575`
- Campo `Periodo` incluido en los campos generados.
- Errores: sin errores.

Advertencias:

- `4` filas de dotacion no tienen remuneracion equivalente.
- `RUT_Sociedad` usa fallback `"Sin dato"` en `1735` registros.
- `Nombre_Sociedad` usa codigo de sociedad DW V2 en `1735` registros.
- `Empresa_Corta` se deriva desde `Nombre_Sociedad` en `1735` registros.

### Auditoria de alcance por periodo

Validacion ejecutada:

```bash
python -m backend.scripts.audit_dashboard_period_scope
```

Resultado:

- Todos los registros tienen `Periodo`.
- El ultimo periodo existe.
- El ultimo periodo tiene registros.
- El ultimo periodo no supera el total acumulado.
- El formato de `Periodo` cumple `YYYY-MM`.
- Advertencias: sin advertencias.

Recomendacion de auditoria:

```text
APTO: el filtro inicial por ultimo periodo reduce el universo frente al acumulado completo.
```

## Riesgos aceptados

- La opcion `Todos` sigue disponible, por lo que el usuario puede seleccionar manualmente el acumulado completo.
- La homologacion de sociedades sigue pendiente: `Nombre_Sociedad` y `Empresa_Corta` aun dependen de codigos/fallbacks DW V2.
- `RUT_Sociedad` sigue sin equivalente directo y se mantiene como `"Sin dato"`.
- El filtro por periodo reduce el acumulado, pero no resuelve por si solo el alcance funcional de negocio, como mantencion vs corporativo completo.
- El warning de bundle grande de Vite sigue pendiente de optimizacion, aunque no bloquea el build.

## Recomendacion final para merge

Decision tecnica: **apto para merge**.

Justificacion:

- Build frontend exitoso.
- JSON DW V2 regenerado correctamente.
- `Periodo` existe por registro.
- Filtro inicial usa el ultimo periodo disponible.
- Auditoria confirma reduccion del universo inicial de `1735` a `343` registros.
- No hay errores en la auditoria de periodo.

Condicion funcional recomendada:

- Comunicar que Sprint 05 reduce el acumulado por periodo, pero aun no define un alcance de negocio final como mantencion, sociedad homologada o corporativo completo gobernado por seleccion explicita.

## Proximos pasos sugeridos para Sprint 06

1. Implementar homologacion oficial de sociedades (`RUT_Sociedad`, `Nombre_Sociedad`, `Empresa_Corta`).
2. Definir filtro de alcance de negocio: mantencion, corporativo completo, sociedad u otros grupos oficiales.
3. Agregar busqueda por trabajador, RUT y cargo.
4. Evaluar filtro por cargo o familia de cargo.
5. Ajustar opciones dependientes entre periodo, empresa y centro de negocio para reducir ruido operacional.
6. Agregar tests automatizados de contrato para `Periodo` y campos criticos.
7. Revisar estrategia de optimizacion de bundle si el warning de Vite se vuelve relevante para despliegue.
