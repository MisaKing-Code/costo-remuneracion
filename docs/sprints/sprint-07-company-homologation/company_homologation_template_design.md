# Diseño plantilla homologacion de sociedades - Sprint 07

## Objetivo

Crear una plantilla de trabajo para que negocio complete y apruebe los datos oficiales de sociedades usados por `dim_company`.

La plantilla permite separar el levantamiento funcional de datos oficiales de la dimension productiva. En esta etapa no se modifica `dim_company`, el adapter ni el frontend.

## Archivo generado

```text
data/governance/company_homologation_template.csv
```

Fuente:

```text
data/datawarehouse/v2/dimensions/dim_company.csv
```

## Uso esperado de la plantilla

La plantilla debe ser completada por el owner funcional o administrativo responsable de sociedades.

Uso previsto:

1. Data entrega la plantilla con codigos actuales.
2. Negocio completa RUT, razon social, nombres visibles y aprobador.
3. Data valida estructura y consistencia.
4. Negocio confirma aprobacion.
5. En una etapa posterior, un proceso controlado actualiza `dim_company`.

## Columnas

| Columna | Descripcion | Responsable |
| --- | --- | --- |
| `company_id` | Identificador interno de compania | Data |
| `sociedad_id` | Clave tecnica DW V2 | Data |
| `source_sociedad_code` | Codigo fuente detectado | Data |
| `rut_sociedad` | RUT oficial de la sociedad | Negocio |
| `legal_name` | Razon social oficial | Negocio |
| `display_name` | Nombre visible en dashboard | Negocio/Data |
| `short_name` | Nombre corto para tablas y graficos | Negocio/Data |
| `business_group` | Grupo corporativo | Negocio/Data |
| `homologation_status` | Estado de homologacion | Negocio/Data |
| `approval_owner` | Responsable que aprueba | Negocio |
| `approval_date` | Fecha de aprobacion | Negocio/Data |
| `notes` | Observaciones o excepciones | Negocio/Data |

## Reglas de llenado

- `company_id`, `sociedad_id` y `source_sociedad_code` no deben modificarse manualmente.
- `rut_sociedad` debe completarse solo con dato oficial.
- `legal_name` debe completarse con razon social oficial.
- `display_name` puede partir como codigo, pero debe reemplazarse por una etiqueta aprobada si negocio lo requiere.
- `short_name` debe ser una version breve y ejecutiva, apta para graficos y tablas.
- `business_group` parte como `Pullman`.
- `homologation_status` parte como `pending`.
- Valores validos de `homologation_status`: `pending`, `approved`, `rejected`.
- `approval_owner` debe indicar persona, area o rol responsable.
- `approval_date` debe registrarse cuando el estado pase a `approved`.
- `notes` debe usarse para excepciones, codigos ambiguos o decisiones de nomenclatura.
- No se deben inventar RUT ni razones sociales.

## Flujo de aprobacion

1. Mantener todos los registros en `pending` durante el levantamiento.
2. Completar `rut_sociedad`, `legal_name`, `display_name` y `short_name`.
3. Revisar que no existan RUT duplicados ni nombres ambiguos.
4. Confirmar que cada `source_sociedad_code` corresponde a una sociedad legal o codigo interno definido.
5. Registrar `approval_owner` y `approval_date`.
6. Cambiar `homologation_status` a `approved` solo con aprobacion funcional.
7. Ejecutar una auditoria antes de actualizar `dim_company`.

## Integracion posterior con dim_company

En un sprint posterior se debe crear un proceso controlado que:

1. Lea `data/governance/company_homologation_template.csv`.
2. Valide columnas obligatorias y estados.
3. Actualice `dim_company.csv` sin perder `company_id`.
4. Preserve trazabilidad con `source_sociedad_code`.
5. Ejecute `python -m backend.scripts.audit_company_dimension`.
6. Regenerate `frontend/src/data/generated/maintenanceCostData.dw_v2.json`.
7. Valide que el dashboard muestre nombres homologados.

## Estado inicial

La plantilla contiene 5 registros:

- `LCM`
- `LTDA`
- `SPA`
- `SPA_CC`
- `SPA_MC`

Todos inician con:

- `homologation_status = pending`
- `rut_sociedad` vacio
- `legal_name` vacio
- `approval_owner` vacio
- `approval_date` vacio
- `notes` vacio
