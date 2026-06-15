# Auditoria de sociedades y propuesta dim_company - Sprint 06

## Objetivo

Auditar las sociedades/empresas presentes en DW V2 y en el dataset generado del dashboard para disenar una dimension corporativa de companias (`dim_company`) que permita homologar codigos operacionales con nombres legales, nombres cortos y atributos corporativos.

El objetivo de esta auditoria es preparar la normalizacion de companias sin implementar cambios todavia.

## Fuentes analizadas

DW V2:

- `data/datawarehouse/v2/dimensions/dim_sociedad.csv`
- `data/datawarehouse/v2/facts/fact_remuneraciones_mensual.csv`
- `data/datawarehouse/v2/facts/fact_dotacion_mensual.csv`
- `data/datawarehouse/v2/dimensions/dim_centro_negocio.csv`
- `data/datawarehouse/v2/metadata/dw_v2_schema.json`
- `data/datawarehouse/v2/metadata/data_lineage.csv`

Dataset dashboard:

- `frontend/src/data/generated/maintenanceCostData.dw_v2.json`

Fuente procesada revisada:

- `data/processed/dim_sociedad.csv`

## Inventario de sociedades

`dim_sociedad.csv` contiene 5 sociedades:

| sociedad_id | sociedad |
| --- | --- |
| `SOC_LCM` | `LCM` |
| `SOC_LTDA` | `LTDA` |
| `SOC_SPA` | `SPA` |
| `SOC_SPA_CC` | `SPA_CC` |
| `SOC_SPA_MC` | `SPA_MC` |

Hallazgo principal: la dimension actual solo contiene codigo de sociedad. No contiene:

- RUT sociedad.
- Nombre legal.
- Nombre corto ejecutivo.
- Razon social homologada.
- Grupo o linea de negocio.
- Estado de vigencia.

## Metricas por sociedad

Metricas calculadas desde `fact_remuneraciones_mensual.csv`:

| Sociedad | Filas remuneraciones | Trabajadores unicos | Centros de negocio | Total haberes | Total costo | Periodos |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| `LCM` | 5 | 1 | 1 | 4861795 | 5122668 | 2026-01 a 2026-05 |
| `LTDA` | 970 | 221 | 38 | 1460009111 | 1526838834 | 2026-01 a 2026-05 |
| `SPA` | 631 | 144 | 26 | 931830733 | 977366629 | 2026-01 a 2026-05 |
| `SPA_CC` | 101 | 27 | 2 | 63469088 | 68560190 | 2026-01 a 2026-05 |
| `SPA_MC` | 28 | 6 | 1 | 40402752 | 42481254 | 2026-01 a 2026-05 |

Metricas calculadas desde `fact_dotacion_mensual.csv`:

| Sociedad | Filas dotacion | Trabajadores unicos dotacion | Centros dotacion | Periodos |
| --- | ---: | ---: | ---: | --- |
| `LCM` | 5 | 1 | 1 | 2026-01 a 2026-05 |
| `LTDA` | 970 | 221 | 38 | 2026-01 a 2026-05 |
| `SPA` | 631 | 144 | 26 | 2026-01 a 2026-05 |
| `SPA_CC` | 105 | 28 | 2 | 2026-01 a 2026-05 |
| `SPA_MC` | 28 | 6 | 1 | 2026-01 a 2026-05 |

Observacion: `SPA_CC` tiene 105 filas de dotacion y 101 filas de remuneraciones. Esta diferencia coincide con auditorias previas donde se detectaron 4 filas de dotacion sin remuneracion equivalente.

## Centros de negocio por sociedad

| Sociedad | Cantidad centros | Centros |
| --- | ---: | --- |
| `LCM` | 1 | ASEO |
| `LTDA` | 38 | ACCIONA; ACERCAMIENTOS SPL/ACF; ACF; ADMINISTRACION; ADQUISICION; ADUANA; ALGORTA; ARAMARK; ASEO; BAILAC; BESALCO MINERIA S.A; CMDIC; DGAC; ENEL; ENEX; FAMAE; GERENCIA; HINTEK; HIT SOLEDAD; LATAM; LUAGHER; MANTENCION; MDP; MICHILLA; MINERA HMC S.A.; MOR; OPERACIONES; PERSONAL ADMINISTRATIVO; PERSONAL MANTENCION; PODIUM; R Y Q INGENIERIA S A; REL. FINIQUITO; SERVEO; SKY; SPL; TRANSPORTE; VECCHIOLA; WESTFIRE |
| `SPA` | 26 | ACF; ADMINISTRACION; ADQUISICIONES; ALGORTA; APOYO MICHILLA; AXINNTUS; COLLARTE MICHILLA; ENAEX MICHILLA; ENEL ADMINISTRATIVO; ENEL OPERACIONES; EQUANS; EQUANS BIO BIO; EQUANS CENTINELLA; EQUANS ENEL; EQUANS ENGIE; EQUANS GENER; EQUANS LOMAS BAYAS; FAMAE; MANTENCION; MAXAM; MICHILLA; OPERACIONES; RIMO MICHILLA; TGN; TMA MICHILLA; TRANSPORTE |
| `SPA_CC` | 2 | ASEO; MANTENCION |
| `SPA_MC` | 1 | MICHILLA |

## Dataset generado del dashboard

En `frontend/src/data/generated/maintenanceCostData.dw_v2.json`, el campo `Nombre_Sociedad` conserva los codigos de sociedad:

| Nombre_Sociedad | Filas | Trabajadores unicos | Centros | Total costo | Periodos |
| --- | ---: | ---: | ---: | ---: | --- |
| `LCM` | 5 | 1 | 1 | 5122668 | 2026-01 a 2026-05 |
| `LTDA` | 970 | 221 | 38 | 1526838834 | 2026-01 a 2026-05 |
| `SPA` | 631 | 144 | 26 | 977366629 | 2026-01 a 2026-05 |
| `SPA_CC` | 101 | 27 | 2 | 68560190 | 2026-01 a 2026-05 |
| `SPA_MC` | 28 | 6 | 1 | 42481254 | 2026-01 a 2026-05 |

Esto confirma que el adapter actual no tiene una fuente corporativa para convertir codigos a nombres legales o nombres ejecutivos.

## Problemas detectados

### Nulos

No se detectaron nulos en:

- `fact_remuneraciones_mensual.sociedad`
- `fact_remuneraciones_mensual.sociedad_id`
- `fact_dotacion_mensual.sociedad`
- `fact_dotacion_mensual.sociedad_id`

### Duplicados tecnicos

No se detectaron duplicados de mapeo `sociedad_id -> sociedad` en las facts revisadas.

`dim_sociedad.csv` contiene una fila por codigo de sociedad.

### Inconsistencias entre remuneraciones y dotacion

La principal diferencia esta en `SPA_CC`:

- Remuneraciones: 101 filas, 27 trabajadores.
- Dotacion: 105 filas, 28 trabajadores.

Interpretacion: existen 4 filas de dotacion sin remuneracion equivalente. Esto no invalida la dimension de companias, pero debe quedar auditado porque puede afectar metricas de headcount si se cruzan facts distintas.

### Diferencias de nomenclatura

Las sociedades se presentan como codigos operacionales:

- `LCM`
- `LTDA`
- `SPA`
- `SPA_CC`
- `SPA_MC`

No existe hoy una nomenclatura ejecutiva unificada para mostrar en el dashboard.

Riesgos:

- `LTDA` y `SPA` son tipos societarios genericos, no nombres de empresa por si solos.
- `SPA_CC` y `SPA_MC` mezclan tipo societario con sufijos operacionales.
- `Nombre_Sociedad` en el dashboard no representa realmente un nombre de sociedad; representa codigo fuente.
- `Empresa_Corta` se deriva actualmente desde el mismo codigo, por lo que no aporta normalizacion real.
- `RUT_Sociedad` no existe en DW V2 y se emite como fallback `"Sin dato"`.

## Propuesta de dim_company

Crear una dimension corporativa nueva, por ejemplo:

```text
data/datawarehouse/v2/dimensions/dim_company.csv
```

O bien evolucionar `dim_sociedad.csv` hacia una version enriquecida si se decide mantener un solo concepto.

Columnas recomendadas:

| Campo | Descripcion |
| --- | --- |
| `company_id` | Clave estable corporativa, por ejemplo `COMP_LCM` |
| `sociedad_id` | Clave existente DW V2, por ejemplo `SOC_LCM` |
| `source_sociedad_code` | Codigo original: `LCM`, `LTDA`, `SPA`, `SPA_CC`, `SPA_MC` |
| `rut_sociedad` | RUT legal de la sociedad |
| `legal_name` | Razon social oficial |
| `display_name` | Nombre visible recomendado para dashboard |
| `short_name` | Nombre corto ejecutivo |
| `business_group` | Grupo o unidad corporativa si aplica |
| `company_type` | Tipo legal u operacional si aplica |
| `is_active` | Indicador de vigencia |
| `homologation_status` | `approved`, `pending`, `inferred`, etc. |
| `notes` | Observaciones de homologacion |

Ejemplo de estructura inicial pendiente de completar:

| company_id | sociedad_id | source_sociedad_code | rut_sociedad | legal_name | display_name | short_name | homologation_status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `COMP_LCM` | `SOC_LCM` | `LCM` | Pendiente | Pendiente | LCM | LCM | pending |
| `COMP_LTDA` | `SOC_LTDA` | `LTDA` | Pendiente | Pendiente | LTDA | LTDA | pending |
| `COMP_SPA` | `SOC_SPA` | `SPA` | Pendiente | Pendiente | SPA | SPA | pending |
| `COMP_SPA_CC` | `SOC_SPA_CC` | `SPA_CC` | Pendiente | Pendiente | SPA CC | SPA CC | pending |
| `COMP_SPA_MC` | `SOC_SPA_MC` | `SPA_MC` | Pendiente | Pendiente | SPA MC | SPA MC | pending |

## Recomendaciones de homologacion

1. Crear una tabla maestra de sociedades aprobada por negocio antes de cambiar labels del dashboard.
2. No inferir nombres legales desde codigos como `LTDA` o `SPA`; esos codigos no son suficientemente expresivos.
3. Mantener trazabilidad entre `sociedad_id` actual y `company_id` corporativo.
4. Reemplazar en el adapter:
   - `RUT_Sociedad`
   - `Nombre_Sociedad`
   - `Empresa_Corta`
   usando `dim_company`.
5. Mantener `source_sociedad_code` disponible para auditoria aunque no se muestre como label principal.
6. Definir si `LCM`, `LTDA`, `SPA`, `SPA_CC` y `SPA_MC` son sociedades legales, razones sociales abreviadas o codigos internos.
7. Agregar validacion automatica: todo codigo de sociedad presente en facts debe existir en `dim_company`.
8. Documentar excepciones como `SPA_CC` con dotacion sin remuneracion equivalente.

## Conclusiones

DW V2 contiene una dimension tecnica de sociedad consistente a nivel de codigo, sin nulos ni duplicados tecnicos. Sin embargo, todavia no existe una dimension corporativa de companias apta para reporting ejecutivo.

La normalizacion de Sprint 06 debe enfocarse en crear una `dim_company` homologada y aprobada, porque el dashboard hoy presenta codigos como si fueran nombres de empresa. Esta brecha afecta lectura ejecutiva, filtros, rankings y reportes.
