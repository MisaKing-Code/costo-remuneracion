# Cierre tecnico Sprint 06 - Normalizacion de companias

## Objetivo del sprint

Crear la primera version de una dimension corporativa de companias para DW V2 e integrarla con el adapter del dashboard legacy-compatible, sin modificar el frontend.

El sprint busco reemplazar el uso directo de codigos tecnicos de sociedad por una fuente semantica centralizada (`dim_company`), dejando preparada la homologacion futura de RUT, razon social y nombres ejecutivos.

## Rama utilizada

```text
sprint-06-company-normalization
```

## Resumen de cambios

Se auditaron las sociedades existentes en DW V2 y se identificaron cinco codigos de sociedad:

```text
LCM, LTDA, SPA, SPA_CC, SPA_MC
```

Luego se creo `dim_company.csv` a partir de `dim_sociedad.csv`, con estructura corporativa inicial y estado de homologacion pendiente. El adapter DW V2 -> dashboard fue actualizado para leer `dim_company` y poblar:

- `RUT_Sociedad` desde `rut_sociedad`
- `Nombre_Sociedad` desde `display_name`
- `Empresa_Corta` desde `short_name`

Tambien se agrego una auditoria automatica para validar la dimension y su integracion con el dataset generado del dashboard.

## dim_company creada

Archivo:

```text
data/datawarehouse/v2/dimensions/dim_company.csv
```

Columnas:

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

Registros generados:

| company_id | sociedad_id | source_sociedad_code | display_name | short_name | homologation_status |
| --- | --- | --- | --- | --- | --- |
| `COMP_001` | `SOC_LCM` | `LCM` | `LCM` | `LCM` | `pending` |
| `COMP_002` | `SOC_LTDA` | `LTDA` | `LTDA` | `LTDA` | `pending` |
| `COMP_003` | `SOC_SPA` | `SPA` | `SPA` | `SPA` | `pending` |
| `COMP_004` | `SOC_SPA_CC` | `SPA_CC` | `SPA_CC` | `SPA_CC` | `pending` |
| `COMP_005` | `SOC_SPA_MC` | `SPA_MC` | `SPA_MC` | `SPA_MC` | `pending` |

## Integracion de dim_company con adapter

Archivo actualizado:

```text
backend/scripts/generate_dw_v2_legacy_dashboard_data.py
```

El adapter ahora:

- Lee `data/datawarehouse/v2/dimensions/dim_company.csv`.
- Relaciona registros por `sociedad_id`.
- Usa `display_name` para `Nombre_Sociedad`.
- Usa `short_name` para `Empresa_Corta`.
- Usa `rut_sociedad` para `RUT_Sociedad`.
- Mantiene fallback `RUT_Sociedad = "Sin dato"` cuando `rut_sociedad` esta vacio.

Resultado de generacion final:

- Registros generados: `1735`
- Registros con match en `dim_company`: `1735`
- Registros sin match en `dim_company`: `0`
- Sociedades mapeadas: `LCM`, `LTDA`, `SPA`, `SPA_CC`, `SPA_MC`

Fallbacks aplicados:

- `RUT_Sociedad`: `1735`
- `Nombre_Sociedad`: `0`
- `Empresa_Corta`: `0`
- `Cargo`: `0`
- `Tipo_Trabajador`: `0`
- `Contrato_Trabajador`: `0`

## Resultado de auditoria company dimension

Validacion ejecutada:

```bash
python -m backend.scripts.audit_company_dimension
```

Reporte:

```text
data/quality/company_dimension_audit_report.txt
```

Resultado:

- Estado de auditoria: `OK`
- Registros `dim_company`: `5`
- Registros `dim_sociedad`: `5`
- Registros dashboard: `1735`
- Sociedades dashboard: `LCM`, `LTDA`, `SPA`, `SPA_CC`, `SPA_MC`
- Errores criticos: sin errores criticos

Advertencias:

- `rut_sociedad` pendiente en `5` registros.
- `legal_name` pendiente en `5` registros.
- `homologation_status` pendiente en `5` registros.

Recomendacion de auditoria:

```text
dim_company es apta tecnicamente como fuente de etiquetas actuales del dashboard.
```

## Estado de homologacion

Estado actual:

```text
homologation_status = pending
```

Esto significa que la dimension es tecnicamente valida, pero aun no esta aprobada como fuente corporativa final.

Campos pendientes de completar con fuente oficial:

- `rut_sociedad`
- `legal_name`
- `display_name` definitivo
- `short_name` definitivo

## Riesgos aceptados

- `RUT_Sociedad` sigue saliendo como `"Sin dato"` en los `1735` registros porque `rut_sociedad` esta vacio.
- `display_name` y `short_name` siguen usando el codigo original hasta que negocio entregue homologacion.
- Los codigos `LTDA` y `SPA` pueden no ser suficientemente descriptivos para reporting ejecutivo.
- La dimension esta integrada tecnicamente, pero no debe considerarse homologada ni aprobada para reporting legal.
- Se mantiene la advertencia historica de `4` filas de dotacion sin remuneracion equivalente.

## Validaciones ejecutadas

```bash
npm run build
python -m backend.scripts.generate_dw_v2_legacy_dashboard_data
python -m backend.scripts.audit_company_dimension
```

## Resultado del build

Resultado: exitoso.

```text
vite v6.4.2 building for production...
2212 modules transformed.
built in 5.75s
```

Observacion:

- Se mantiene warning no bloqueante de Vite por chunk mayor a 500 kB.

## Resultado de generacion del dataset dashboard

Resultado: exitoso.

- JSON generado: `frontend/src/data/generated/maintenanceCostData.dw_v2.json`
- Registros: `1735`
- Trabajadores unicos: `398`
- Empresas unicas: `5`
- Periodo: `2026-01 a 2026-05`
- Total costo: `2620369575`
- Errores: sin errores

Advertencias:

- `4` filas de dotacion no tienen remuneracion equivalente.
- `RUT_Sociedad='Sin dato'` aplicado a `1735` registros.

## Recomendacion final para merge

Decision tecnica: **apto para merge**.

Justificacion:

- Build frontend exitoso.
- `dim_company` creada con estructura corporativa inicial.
- Adapter integrado con `dim_company`.
- Dataset dashboard regenerado sin perdida de registros.
- Auditoria de dimension sin errores criticos.
- Reporte de calidad generado.

Condicion funcional:

- El merge es apto como avance tecnico de normalizacion, no como homologacion final de companias. La aprobacion de RUT, razon social y nombres ejecutivos debe quedar para Sprint 07.

## Proximos pasos sugeridos para Sprint 07

1. Completar `rut_sociedad` desde fuente corporativa oficial.
2. Completar `legal_name` para cada sociedad.
3. Definir `display_name` y `short_name` aprobados por negocio.
4. Cambiar `homologation_status` de `pending` a `approved` solo tras validacion.
5. Actualizar auditoria para fallar si una sociedad aprobada pierde RUT o razon social.
6. Evaluar mostrar nombre ejecutivo en filtros y mantener codigo como metadata/trazabilidad.
7. Documentar owner funcional de la dimension corporativa de companias.
