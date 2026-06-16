# Auditoria de homologacion funcional de sociedades - Sprint 07

## Objetivo

Auditar el estado actual de `dim_company` y preparar la homologacion funcional de sociedades para que el dashboard pueda mostrar nombres corporativos aprobados, RUT sociedad y nombres cortos confiables.

Esta auditoria no implementa cambios. Su objetivo es documentar el estado actual, el impacto en el dashboard y los datos que deben ser provistos o aprobados por negocio.

## Alcance

Archivos revisados:

- `data/datawarehouse/v2/dimensions/dim_company.csv`
- `data/datawarehouse/v2/dimensions/dim_sociedad.csv`
- `frontend/src/data/generated/maintenanceCostData.dw_v2.json`
- `docs/sprints/sprint-06-company-normalization/company_audit.md`
- `docs/sprints/sprint-06-company-normalization/dim_company_design.md`

Fuera de alcance:

- Modificar `dim_company`.
- Modificar el adapter.
- Modificar frontend.
- Aprobar nombres legales sin validacion de negocio.
- Hacer commit.

## Estado actual de dim_company

`dim_company` contiene cinco registros, todos con `homologation_status = pending`.

| company_id | sociedad_id | source_sociedad_code | rut_sociedad actual | legal_name actual | display_name actual | short_name actual | homologation_status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `COMP_001` | `SOC_LCM` | `LCM` | Vacio | Vacio | `LCM` | `LCM` | `pending` |
| `COMP_002` | `SOC_LTDA` | `LTDA` | Vacio | Vacio | `LTDA` | `LTDA` | `pending` |
| `COMP_003` | `SOC_SPA` | `SPA` | Vacio | Vacio | `SPA` | `SPA` | `pending` |
| `COMP_004` | `SOC_SPA_CC` | `SPA_CC` | Vacio | Vacio | `SPA_CC` | `SPA_CC` | `pending` |
| `COMP_005` | `SOC_SPA_MC` | `SPA_MC` | Vacio | Vacio | `SPA_MC` | `SPA_MC` | `pending` |

Campos completos:

- `company_id`
- `sociedad_id`
- `source_sociedad_code`
- `display_name`
- `short_name`
- `business_group`
- `is_active`
- `homologation_status`
- `created_at`
- `updated_at`

Campos pendientes:

- `rut_sociedad`
- `legal_name`

Campos con valor provisional:

- `display_name`
- `short_name`

## Sociedades pendientes

Todas las sociedades estan pendientes de homologacion funcional.

| Sociedad | Registros dashboard | Trabajadores unicos | Costo total asociado | Pendiente principal |
| --- | ---: | ---: | ---: | --- |
| `LCM` | 5 | 1 | 5122668 | RUT sociedad, razon social, nombre ejecutivo |
| `LTDA` | 970 | 221 | 1526838834 | RUT sociedad, razon social, nombre ejecutivo |
| `SPA` | 631 | 144 | 977366629 | RUT sociedad, razon social, nombre ejecutivo |
| `SPA_CC` | 101 | 27 | 68560190 | RUT sociedad, razon social, nombre ejecutivo |
| `SPA_MC` | 28 | 6 | 42481254 | RUT sociedad, razon social, nombre ejecutivo |

## Campos faltantes

### `rut_sociedad`

Estado: vacio en 5 de 5 sociedades.

Impacto:

- El adapter mantiene `RUT_Sociedad = "Sin dato"` en el JSON del dashboard.
- No es posible hacer trazabilidad legal por sociedad.
- No se puede validar consistencia contra fuentes legales/corporativas.

### `legal_name`

Estado: vacio en 5 de 5 sociedades.

Impacto:

- No existe razon social oficial.
- El dashboard no puede mostrar nombres legales confiables.
- `LTDA` y `SPA` quedan como codigos ambiguos, no como entidades ejecutivas.

### `display_name`

Estado: poblado, pero provisional.

Valor actual:

- Codigo fuente (`LCM`, `LTDA`, `SPA`, `SPA_CC`, `SPA_MC`).

Impacto:

- Los filtros y graficos muestran codigos internos.
- Usuarios ejecutivos pueden interpretar codigos genericos como nombres de empresa.

### `short_name`

Estado: poblado, pero provisional.

Valor actual:

- Codigo fuente.

Impacto:

- `Empresa_Corta` no aporta semantica adicional.
- Rankings y tablas siguen mostrando codigos operacionales.

## Impacto en dashboard

El dataset generado `frontend/src/data/generated/maintenanceCostData.dw_v2.json` usa actualmente:

- `Nombre_Sociedad` desde `dim_company.display_name`
- `Empresa_Corta` desde `dim_company.short_name`
- `RUT_Sociedad` desde `dim_company.rut_sociedad`, con fallback `"Sin dato"`

Como `display_name` y `short_name` siguen siendo codigos, el dashboard mantiene visualmente:

- `LCM`
- `LTDA`
- `SPA`
- `SPA_CC`
- `SPA_MC`

Impactos concretos:

- Filtro Empresa muestra codigos, no nombres homologados.
- Ranking "Costo Total por Empresa" agrupa correctamente, pero con etiquetas provisorias.
- Tabla de trabajadores muestra codigos como empresa.
- Exportaciones o reportes derivados aun no son aptos como reporting legal de sociedades.

## Propuesta de datos requeridos desde negocio

Para cada `source_sociedad_code`, negocio debe entregar o aprobar:

| Campo requerido | Descripcion | Obligatorio para aprobar |
| --- | --- | --- |
| `rut_sociedad` | RUT legal de la sociedad | Si |
| `legal_name` | Razon social oficial | Si |
| `display_name` | Nombre visible en dashboard ejecutivo | Si |
| `short_name` | Nombre corto para tablas/graficos | Si |
| `business_group` | Grupo corporativo o holding | Recomendado |
| `is_active` | Vigencia de la sociedad | Si |
| `homologation_status` | Estado aprobado/rechazado/pendiente | Si |
| `approval_owner` | Responsable funcional de aprobacion | Recomendado |
| `approval_date` | Fecha de aprobacion funcional | Recomendado |
| `notes` | Observaciones o excepciones | Recomendado |

Formato recomendado de insumo:

```text
source_sociedad_code,rut_sociedad,legal_name,display_name,short_name,business_group,is_active,approval_owner,approval_date,notes
```

## Recomendacion de flujo de aprobacion

1. Data/BI entrega inventario actual de codigos (`LCM`, `LTDA`, `SPA`, `SPA_CC`, `SPA_MC`).
2. Negocio o administracion corporativa completa RUT y razon social oficial.
3. Negocio define `display_name` y `short_name` para uso ejecutivo.
4. Data valida unicidad de RUT, nombres y codigos.
5. Se actualiza `dim_company` mediante script o proceso controlado, no edicion manual directa.
6. Se ejecuta `audit_company_dimension`.
7. Si no hay errores y negocio aprueba, se cambia `homologation_status` a `approved`.
8. Se regenera `maintenanceCostData.dw_v2.json`.
9. Se valida visualmente el dashboard y se adjunta reporte de calidad.

## Proximos pasos

1. Crear plantilla de homologacion para negocio con los cinco codigos actuales.
2. Definir owner funcional de sociedades.
3. Agregar columnas de aprobacion a `dim_company` si se decide formalizar workflow (`approval_owner`, `approval_date`, `notes`).
4. Crear script de actualizacion controlada de `dim_company` desde archivo homologado.
5. Actualizar auditoria para exigir `rut_sociedad` y `legal_name` cuando `homologation_status = approved`.
6. Regenerar dataset dashboard usando nombres homologados.
7. Revisar con usuarios ejecutivos el impacto visual de nombres largos vs nombres cortos.

## Conclusiones

`dim_company` esta tecnicamente integrada, pero funcionalmente pendiente. Todas las sociedades tienen estructura base, IDs estables y codigos trazables, pero ninguna cuenta aun con RUT ni razon social oficial.

La prioridad de Sprint 07 debe ser obtener y aprobar los datos corporativos faltantes antes de cambiar el dashboard a nombres ejecutivos definitivos.
