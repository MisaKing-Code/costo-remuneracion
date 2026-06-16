# Diseño sincronizacion homologacion de companias - Sprint 07

## Objetivo

Disenar el flujo futuro para sincronizar `data/governance/company_homologation_template.csv` hacia `data/datawarehouse/v2/dimensions/dim_company.csv` de forma controlada, auditable y reversible.

Este documento no implementa scripts ni modifica datos. Define las reglas que deberia seguir un futuro `sync_company_homologation.py`.

## Arquitectura del flujo

```text
data/governance/company_homologation_template.csv
            |
            v
backend/scripts/sync_company_homologation.py
            |
            v
data/datawarehouse/v2/dimensions/dim_company.csv
            |
            v
backend/scripts/generate_dw_v2_legacy_dashboard_data.py
            |
            v
frontend/src/data/generated/maintenanceCostData.dw_v2.json
            |
            v
Dashboard
```

Roles de cada capa:

| Capa | Responsabilidad |
| --- | --- |
| `company_homologation_template.csv` | Insumo gobernado por negocio para completar RUT, razon social y nombres aprobados |
| `sync_company_homologation.py` | Validar, aplicar reglas, actualizar `dim_company` y generar evidencia |
| `dim_company.csv` | Dimension corporativa consumida por procesos tecnicos |
| `generate_dw_v2_legacy_dashboard_data.py` | Poblar `RUT_Sociedad`, `Nombre_Sociedad` y `Empresa_Corta` desde `dim_company` |
| Dashboard | Mostrar filtros, rankings y tabla usando etiquetas homologadas |

## Contratos actuales

### Template de homologacion

Columnas actuales:

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

### dim_company

Columnas actuales:

- `company_id`
- `sociedad_id`
- `source_sociedad_code`
- `rut_sociedad`
- `legal_name`
- `display_name`
- `short_name`
- `business_group`
- `is_active`
- `homologation_status`
- `created_at`
- `updated_at`

Diferencias relevantes:

- El template contiene campos de aprobacion (`approval_owner`, `approval_date`, `notes`) que `dim_company` todavia no contiene.
- `dim_company` contiene campos operacionales (`is_active`, `created_at`, `updated_at`) que el template no debe controlar directamente.

## Reglas de sincronizacion

### Clave primaria de sincronizacion

La clave primaria debe ser:

```text
company_id
```

Reglas:

- `company_id` no debe cambiar.
- `sociedad_id` no debe cambiar salvo proceso de correccion excepcional.
- `source_sociedad_code` no debe cambiar salvo proceso de correccion excepcional.
- Si un `company_id` existe en template y no existe en `dim_company`, el script debe bloquear o pedir modo explicito de alta.
- Si un `company_id` existe en `dim_company` y no existe en template, el script debe bloquear o reportar conflicto.

### Campos sincronizables desde template

Campos que el script puede copiar desde template hacia `dim_company`:

- `rut_sociedad`
- `legal_name`
- `display_name`
- `short_name`
- `business_group`
- `homologation_status`

Campos que no debe sobrescribir desde template:

- `company_id`
- `sociedad_id`
- `source_sociedad_code`
- `created_at`

Campos que debe administrar el script:

- `updated_at`
- eventualmente `is_active`, si se agrega al template o se define una regla externa.

### Reglas por estado

`pending`:

- Permite campos incompletos.
- No exige `approval_owner` ni `approval_date`.
- No debe considerarse homologacion final.

`approved`:

- Exige `rut_sociedad`.
- Exige `legal_name`.
- Exige `display_name`.
- Exige `short_name`.
- Exige `approval_owner`.
- Exige `approval_date`.
- Debe pasar auditoria antes de actualizar `dim_company`.

`rejected`:

- Exige `notes`.
- No debe alimentar nombres definitivos al dashboard sin decision explicita.

## Validaciones

Validaciones bloqueantes:

- Existe `company_homologation_template.csv`.
- Existe `dim_company.csv`.
- Columnas obligatorias presentes en ambos archivos.
- `company_id` unico en ambos archivos.
- `sociedad_id` unico en ambos archivos.
- `source_sociedad_code` unico en ambos archivos.
- Todo `company_id` de `dim_company` existe en template.
- Todo `company_id` de template existe en `dim_company`.
- `homologation_status` pertenece a `pending`, `approved`, `rejected`.
- Si `homologation_status = approved`, no puede haber campos obligatorios vacios.
- `approval_date`, si existe, debe tener formato valido recomendado `YYYY-MM-DD`.
- No se permiten cambios accidentales de `sociedad_id` o `source_sociedad_code`.

Validaciones de advertencia:

- `rut_sociedad` vacio en estado `pending`.
- `legal_name` vacio en estado `pending`.
- `display_name` igual a `source_sociedad_code`, porque puede indicar etiqueta provisoria.
- `short_name` igual a `source_sociedad_code`, porque puede indicar etiqueta provisoria.
- `notes` vacio en registros ambiguos como `LTDA` o `SPA`.

## Auditoria requerida

Despues de sincronizar, el flujo futuro debe ejecutar:

```bash
python -m backend.scripts.audit_company_dimension
python -m backend.scripts.generate_dw_v2_legacy_dashboard_data
```

Y luego validar:

- Registros con match en `dim_company`: debe ser igual al total de registros dashboard.
- Registros sin match: `0`.
- Fallback `Nombre_Sociedad`: `0`.
- Fallback `Empresa_Corta`: `0`.
- Fallback `RUT_Sociedad`: aceptable solo si quedan sociedades `pending`; no aceptable si todas estan `approved`.

Reporte sugerido para el sync:

```text
data/quality/company_homologation_sync_report.txt
```

Contenido minimo:

- Timestamp.
- Archivo fuente.
- Archivo destino.
- Registros leidos.
- Registros actualizados.
- Campos modificados.
- Estados por sociedad.
- Errores.
- Advertencias.
- Recomendacion final.

## Manejo de conflictos

Conflictos bloqueantes:

- `company_id` duplicado.
- Cambio de `sociedad_id` para un `company_id` existente.
- Cambio de `source_sociedad_code` para un `company_id` existente.
- Registro `approved` sin RUT o razon social.
- `approval_date` invalido.
- Sociedad usada por dashboard sin fila en `dim_company`.

Conflictos no bloqueantes, pero con advertencia:

- `display_name` duplicado entre sociedades distintas.
- `short_name` duplicado entre sociedades distintas.
- `business_group` vacio.
- `notes` vacio en sociedades ambiguas.

Estrategia recomendada:

- Por defecto, el sync debe correr en modo estricto.
- Cualquier conflicto bloqueante debe impedir escritura de `dim_company`.
- Debe existir una opcion futura `--dry-run` para auditar sin escribir.
- Debe existir una opcion futura `--apply` para aplicar cambios de forma explicita.

## Versionado de homologaciones

Recomendacion:

- Versionar `company_homologation_template.csv` en Git como insumo gobernado.
- Versionar `dim_company.csv` en Git como salida controlada.
- Generar snapshot previo antes de sobrescribir `dim_company`.

Ruta sugerida para snapshots:

```text
data/governance/archive/company_homologation_YYYYMMDD_HHMMSS.csv
data/datawarehouse/v2/dimensions/archive/dim_company_YYYYMMDD_HHMMSS.csv
```

Campos recomendados para evolucion futura:

- `approval_owner`
- `approval_date`
- `notes`
- `homologation_version`
- `source_reference`

Decision pendiente:

- Definir si estos campos deben vivir solo en governance o tambien dentro de `dim_company`.

## Rollback

Estrategia recomendada:

1. Antes de sincronizar, copiar `dim_company.csv` a un archivo de archive timestamped.
2. Ejecutar sync en modo dry-run.
3. Ejecutar sync en modo apply solo si no hay errores.
4. Si una auditoria posterior falla, restaurar el snapshot anterior de `dim_company`.
5. Regenerar el JSON del dashboard con el `dim_company` restaurado.
6. Ejecutar auditorias nuevamente.

Comandos futuros esperados:

```bash
python -m backend.scripts.sync_company_homologation --dry-run
python -m backend.scripts.sync_company_homologation --apply
python -m backend.scripts.audit_company_dimension
python -m backend.scripts.generate_dw_v2_legacy_dashboard_data
```

## Integracion con dashboard

El adapter ya consume `dim_company`.

Campos impactados:

- `RUT_Sociedad` desde `rut_sociedad`.
- `Nombre_Sociedad` desde `display_name`.
- `Empresa_Corta` desde `short_name`.

Impacto esperado tras homologar:

- Filtro Empresa mostrara nombres aprobados.
- Ranking por empresa usara etiquetas ejecutivas.
- Tabla de trabajadores mostrara sociedad homologada.
- Fallback de `RUT_Sociedad` debe disminuir o desaparecer.

Riesgo principal:

- Cambiar `display_name` puede cambiar etiquetas visibles y agrupaciones si se generan duplicados. Por eso `display_name` y `short_name` deben validarse antes de regenerar el dataset del dashboard.

## Riesgos detectados

- El template permite completar datos manualmente; puede introducir typos o duplicados.
- `LTDA` y `SPA` son codigos ambiguos si negocio no define razon social exacta.
- `approval_owner` y `approval_date` no existen aun en `dim_company`.
- No hay todavia script de sync ni dry-run.
- No hay snapshot automatico para rollback.
- `homologation_status = approved` debe tener reglas mas estrictas que el estado actual `pending`.

## Recomendacion

Implementar `sync_company_homologation.py` en Sprint 07 o Sprint 08 con dos modos:

- `--dry-run`: valida y genera reporte sin escribir.
- `--apply`: escribe `dim_company` solo si las validaciones bloqueantes pasan.

El primer uso debe mantener todos los registros en `pending` hasta que negocio entregue RUT, razon social y aprobacion formal.
