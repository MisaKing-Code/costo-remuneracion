# Cierre tecnico Sprint 07 - Homologacion de companias

## Objetivo del sprint

Preparar la homologacion funcional de sociedades para el Data Warehouse V2, dejando un flujo gobernado para completar datos oficiales de companias sin modificar aun la logica del dashboard ni aplicar cambios manuales sobre `dim_company`.

## Rama utilizada

`sprint-07-company-homologation`

## Resumen de cambios

- Se audito el estado actual de `dim_company` y su impacto sobre el dataset generado del dashboard.
- Se creo una plantilla de gobierno para que negocio complete datos oficiales de sociedades.
- Se diseno el flujo futuro de sincronizacion entre plantilla de homologacion, `dim_company`, adapter DW V2 y dashboard.
- Se implemento `backend/scripts/sync_company_homologation.py` con modo seguro `--dry-run` y modo controlado `--apply`.
- Se genero reporte automatico de sincronizacion en `data/quality/company_homologation_sync_report.txt`.
- No se modifico React, no se cambio el adapter durante este cierre y no se ejecuto `--apply`.

## Auditoria de homologacion

La auditoria del Sprint 07 reviso la dimension corporativa actual, la dimension fuente de sociedades y el dataset consumido por el dashboard:

- `data/datawarehouse/v2/dimensions/dim_company.csv`
- `data/datawarehouse/v2/dimensions/dim_sociedad.csv`
- `frontend/src/data/generated/maintenanceCostData.dw_v2.json`
- `docs/sprints/sprint-06-company-normalization/company_audit.md`
- `docs/sprints/sprint-06-company-normalization/dim_company_design.md`

Estado observado:

- Sociedades corporativas registradas: 5.
- Registros del dashboard validados contra `dim_company`: 1735.
- Sociedades mapeadas en el dataset del dashboard: `LCM`, `LTDA`, `SPA`, `SPA_CC`, `SPA_MC`.
- Estado de homologacion: todas las sociedades permanecen en `pending`.
- Campos oficiales pendientes: `rut_sociedad` y `legal_name` en las 5 sociedades.

## Plantilla de gobierno creada

Se creo la plantilla:

`data/governance/company_homologation_template.csv`

La plantilla fue poblada desde `dim_company` y contiene 5 registros con las columnas requeridas:

- `company_id`
- `sociedad_id`
- `source_sociedad_code`
- `rut_sociedad`
- `legal_name`
- `display_name`
- `short_name`
- `business_group`
- `homologation_status`
- `approval_owner`
- `approval_date`
- `notes`

Los campos oficiales `rut_sociedad` y `legal_name` se mantienen vacios cuando no existe dato aprobado por negocio. `homologation_status` queda en `pending` para todas las sociedades.

## Diseno del flujo de sincronizacion

El flujo disenado para homologacion futura es:

```text
data/governance/company_homologation_template.csv
    -> backend/scripts/sync_company_homologation.py
    -> data/datawarehouse/v2/dimensions/dim_company.csv
    -> backend/scripts/generate_dw_v2_legacy_dashboard_data.py
    -> frontend/src/data/generated/maintenanceCostData.dw_v2.json
    -> Dashboard
```

El diseno contempla:

- Validacion previa con `--dry-run`.
- Aplicacion controlada con `--apply`.
- Snapshot automatico antes de modificar `dim_company` durante `--apply`.
- Rechazo de sociedades nuevas en esta version.
- Validacion de claves estables: `company_id`, `sociedad_id` y `source_sociedad_code`.
- Reglas estrictas para aprobar sociedades solo con datos oficiales completos.

## Script sync_company_homologation.py

Se implemento:

`backend/scripts/sync_company_homologation.py`

Capacidades principales:

- Lee `data/governance/company_homologation_template.csv`.
- Lee `data/datawarehouse/v2/dimensions/dim_company.csv`.
- Valida columnas obligatorias.
- Valida unicidad de `company_id`, `sociedad_id` y `source_sociedad_code`.
- Valida que no se creen ni eliminen sociedades.
- Valida coincidencia de `sociedad_id` y `source_sociedad_code`.
- Valida `homologation_status` permitido: `pending`, `approved`, `rejected`.
- Exige datos oficiales y aprobacion cuando `homologation_status = approved`.
- Genera `data/quality/company_homologation_sync_report.txt`.
- Crea snapshot en `data/datawarehouse/v2/snapshots/` solo cuando se ejecuta `--apply`.

## Resultado dry-run

Comando ejecutado:

```bash
python -m backend.scripts.sync_company_homologation --dry-run
```

Resultado:

- Filas leidas desde plantilla: 5.
- Filas leidas desde `dim_company`: 5.
- Cambios detectados: 0.
- Cambios aplicados: no.
- Errores criticos: 0.
- Advertencias: 5 sociedades en estado `pending` con `rut_sociedad` y `legal_name` incompletos.
- Reporte generado: `data/quality/company_homologation_sync_report.txt`.

## Por que no se ejecuto --apply

No se ejecuto `--apply` por tres razones:

- La tarea de cierre solicito explicitamente no ejecutar `--apply`.
- La plantilla aun no contiene datos oficiales aprobados por negocio para `rut_sociedad` y `legal_name`.
- Todas las sociedades permanecen en estado `pending`, por lo que aplicar no aportaria homologacion funcional final y podria generar una falsa senal de aprobacion.

## Riesgos aceptados

- `rut_sociedad` sigue pendiente en las 5 sociedades; el adapter mantiene fallback `RUT_Sociedad = "Sin dato"`.
- `legal_name` sigue pendiente en las 5 sociedades.
- `display_name` y `short_name` siguen basados en codigos fuente como propuesta inicial.
- La homologacion queda tecnicamente preparada, pero no funcionalmente aprobada.
- El adapter reporta 4 filas de dotacion sin equivalente directo en remuneraciones.
- El build del frontend emite advertencia de chunk JavaScript mayor a 500 kB, sin bloquear el build.

## Validaciones ejecutadas

### Frontend build

Comando:

```bash
npm run build
```

Resultado:

- Estado: exitoso.
- Modulos transformados: 2212.
- Tiempo de build: 6.98s.
- Advertencia: bundle principal mayor a 500 kB.

### Sincronizacion de homologacion en dry-run

Comando:

```bash
python -m backend.scripts.sync_company_homologation --dry-run
```

Resultado:

- Estado: exitoso.
- Cambios detectados: 0.
- Errores: 0.
- Advertencias: campos oficiales incompletos en sociedades pendientes.

### Auditoria de dimension compania

Comando:

```bash
python -m backend.scripts.audit_company_dimension
```

Resultado:

- Estado: OK.
- Registros `dim_company`: 5.
- Registros `dim_sociedad`: 5.
- Registros dashboard: 1735.
- Errores criticos: 0.
- Advertencias: `rut_sociedad`, `legal_name` y `homologation_status` pendientes en 5 registros.

### Generacion dataset dashboard DW V2

Comando:

```bash
python -m backend.scripts.generate_dw_v2_legacy_dashboard_data
```

Resultado:

- Estado: exitoso.
- Registros generados: 1735.
- Trabajadores unicos: 398.
- Sociedades: 5.
- Periodo cubierto: 2026-01 a 2026-05.
- Costo total generado: 2620369575.
- Sociedades mapeadas: `LCM`, `LTDA`, `SPA`, `SPA_CC`, `SPA_MC`.
- Registros con match en `dim_company`: 1735.
- Registros sin match en `dim_company`: 0.
- Fallbacks aplicados:
  - `RUT_Sociedad`: 1735.
  - `Nombre_Sociedad`: 0.
  - `Empresa_Corta`: 0.
  - `Cargo`: 0.
  - `Tipo_Trabajador`: 0.
  - `Contrato_Trabajador`: 0.

## Resultado del build

El build del frontend queda aprobado para cierre tecnico del sprint. La advertencia de chunk grande debe considerarse deuda tecnica de optimizacion, no bloqueo funcional para el merge.

## Recomendacion final para merge

Sprint 07 queda apto para merge tecnico con observaciones.

La recomendacion es mergear solo como preparacion de homologacion y gobierno de datos, dejando claro que la homologacion oficial de sociedades aun no esta aprobada por negocio. No se recomienda ejecutar `--apply` hasta que la plantilla tenga RUT, razon social, nombres oficiales, responsable de aprobacion y fecha de aprobacion.

## Proximos pasos sugeridos para Sprint 08

- Completar `company_homologation_template.csv` con datos oficiales de negocio.
- Validar RUT, razon social, nombres de visualizacion y nombres cortos.
- Ejecutar nuevamente `sync_company_homologation.py --dry-run`.
- Revisar el reporte de sincronizacion con negocio o data owner.
- Ejecutar `--apply` solo cuando no existan errores y las sociedades aprobadas tengan campos obligatorios completos.
- Reejecutar auditoria de dimension compania.
- Regenerar dataset del dashboard.
- Validar visualmente KPIs, filtros y etiquetas de empresa en el dashboard.
