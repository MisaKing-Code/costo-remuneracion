# Diseño inicial dim_company - Sprint 06

## Objetivo

Crear la primera version de una dimension corporativa de companias para DW V2, usando como base las sociedades tecnicas detectadas en `dim_sociedad.csv`.

Esta version inicial no homologa aun razon social ni RUT. Su objetivo es crear una estructura estable para evolucionar hacia nombres corporativos aprobados.

## Fuente

Archivo base:

```text
data/datawarehouse/v2/dimensions/dim_sociedad.csv
```

Archivo generado:

```text
data/datawarehouse/v2/dimensions/dim_company.csv
```

## Estructura generada

Columnas:

| Campo | Descripcion |
| --- | --- |
| `company_id` | Identificador incremental estable de compania |
| `sociedad_id` | Clave tecnica existente en DW V2 |
| `source_sociedad_code` | Codigo de sociedad original desde `dim_sociedad.sociedad` |
| `rut_sociedad` | RUT legal, pendiente de homologacion |
| `legal_name` | Razon social legal, pendiente de homologacion |
| `display_name` | Nombre visible inicial para dashboard |
| `short_name` | Nombre corto inicial |
| `business_group` | Grupo corporativo inicial |
| `is_active` | Indicador de vigencia |
| `homologation_status` | Estado de homologacion |
| `created_at` | Timestamp de creacion del registro |
| `updated_at` | Timestamp de ultima actualizacion |

## Reglas aplicadas

| Campo | Regla inicial |
| --- | --- |
| `company_id` | Incremental estable `COMP_001`, `COMP_002`, etc. segun orden de `dim_sociedad.csv` |
| `sociedad_id` | Copiado desde `dim_sociedad.sociedad_id` |
| `source_sociedad_code` | Copiado desde `dim_sociedad.sociedad` |
| `rut_sociedad` | Vacio |
| `legal_name` | Vacio |
| `display_name` | Codigo original de sociedad |
| `short_name` | Codigo original de sociedad |
| `business_group` | `Pullman` |
| `is_active` | `True` |
| `homologation_status` | `pending` |
| `created_at` | Timestamp de generacion |
| `updated_at` | Timestamp de generacion |

## Registros generados

| company_id | sociedad_id | source_sociedad_code | display_name | homologation_status |
| --- | --- | --- | --- | --- |
| `COMP_001` | `SOC_LCM` | `LCM` | `LCM` | `pending` |
| `COMP_002` | `SOC_LTDA` | `LTDA` | `LTDA` | `pending` |
| `COMP_003` | `SOC_SPA` | `SPA` | `SPA` | `pending` |
| `COMP_004` | `SOC_SPA_CC` | `SPA_CC` | `SPA_CC` | `pending` |
| `COMP_005` | `SOC_SPA_MC` | `SPA_MC` | `SPA_MC` | `pending` |

## Pendientes de homologacion

Campos que deben ser completados con una fuente corporativa oficial:

- `rut_sociedad`
- `legal_name`
- `display_name`
- `short_name`

Decision pendiente:

- Confirmar si los codigos `LCM`, `LTDA`, `SPA`, `SPA_CC` y `SPA_MC` representan sociedades legales, codigos internos, unidades operativas o abreviaturas mixtas.

## Recomendaciones

1. Usar `dim_company` como fuente futura para poblar `RUT_Sociedad`, `Nombre_Sociedad` y `Empresa_Corta` en el adapter del dashboard.
2. Mantener `source_sociedad_code` para trazabilidad con los archivos fuente.
3. No reemplazar `dim_sociedad` todavia; usar `dim_company` como dimension enriquecida paralela.
4. Agregar validacion automatica: toda sociedad presente en facts debe existir en `dim_company`.
5. Cambiar `homologation_status` a `approved` solo cuando RUT y razon social sean validados por negocio.
