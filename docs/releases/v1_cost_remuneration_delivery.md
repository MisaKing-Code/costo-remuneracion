# Entregable V1 - Dashboard de Costo Remuneracional Corporativo

## Objetivo del entregable

Preparar una version entregable V1 del Dashboard de Costo Remuneracional Corporativo, priorizando rapidez, estabilidad y presentacion ejecutiva sobre ampliaciones estructurales del Data Warehouse.

El entregable mantiene el dashboard conectado al JSON generado desde DW V2 y no modifica dimensiones corporativas, homologacion legal ni arquitectura base.

## Alcance funcional

La V1 permite revisar el costo remuneracional corporativo desde una vista ejecutiva con:

- Resumen de KPIs del universo filtrado.
- Filtro inicial por ultimo periodo disponible.
- Filtros por empresa, centro de negocio, tipo trabajador y contrato.
- Busqueda de trabajador por nombre, RUT o cargo.
- Chips de filtros activos.
- Estado vacio cuando una combinacion de filtros no devuelve registros.
- Rankings por empresa y centro de negocio.
- Desglose de componentes de costo.
- Tabla de trabajadores top 15 por costo.

## Datos disponibles

Fuente actual:

- `frontend/src/data/generated/maintenanceCostData.dw_v2.json`

Origen del JSON:

- `data/datawarehouse/v2/facts/fact_remuneraciones_mensual.csv`
- `data/datawarehouse/v2/facts/fact_dotacion_mensual.csv`
- Dimensiones DW V2 de trabajador, sociedad, centro de negocio, cargo, contrato, estado laboral y company.

Cobertura validada:

- Registros acumulados: 1735.
- Trabajadores unicos acumulados: 398.
- Empresas: 5.
- Periodos: `2026-01` a `2026-05`.
- Ultimo periodo detectado: `2026-05`.
- Registros en ultimo periodo: 343.
- Trabajadores unicos en ultimo periodo: 343.
- Centros en ultimo periodo: 51.
- Costo total acumulado: 2620369575.
- Costo total ultimo periodo: 522714867.
- Total haberes ultimo periodo: 498667090.
- Aportes empresa ultimo periodo: 24654863.

## Filtros disponibles

- Periodo.
- Empresa.
- Centro de Negocio.
- Tipo trabajador.
- Tipo Contrato.
- Busqueda de trabajador por nombre, RUT o cargo.

Comportamiento inicial:

- El dashboard inicia en el ultimo periodo disponible (`2026-05`) para evitar cargar el acumulado completo por defecto.
- El usuario puede seleccionar `Todos` en periodo para revisar el acumulado.
- El boton `Restablecer` limpia busqueda y vuelve al ultimo periodo disponible.

## KPIs disponibles

La vista ejecutiva V1 muestra:

- Costo Remuneracional.
- Total Haberes.
- Aportes Empresa.
- Trabajadores unicos.
- Empresas.
- Centros de negocio.
- Periodo activo y universo filtrado en el encabezado.

## Limitaciones conocidas

- La homologacion legal de sociedades no esta aprobada; `rut_sociedad` y `legal_name` siguen pendientes en `dim_company`.
- `RUT_Sociedad` usa fallback `Sin dato` en el JSON generado.
- La tabla muestra Top 15 por costo y no tiene paginacion.
- En modo acumulado (`Periodo = Todos`), la tabla no muestra columna de periodo.
- Los chips de filtros activos son informativos y no permiten limpiar filtros individualmente.
- El buscador es por substring normalizado, no fuzzy search.
- El JSON se importa estaticamente en el bundle del frontend.
- El build mantiene advertencia de chunk JavaScript mayor a 500 kB.

## Riesgos aceptados

- Se acepta entregar V1 con homologacion corporativa pendiente, porque la dimension `dim_company` es apta tecnicamente como fuente de etiquetas actuales del dashboard.
- Se acepta fallback de `RUT_Sociedad = "Sin dato"` hasta completar datos oficiales de negocio.
- Se acepta que la tabla sea una vista ejecutiva de Top 15 y no una herramienta completa de exploracion masiva.
- Se acepta la advertencia de bundle grande para esta version, dado el foco en rapidez y estabilidad.
- Se acepta que algunas etiquetas de negocio sigan dependiendo del contrato legacy, mientras no se rompa compatibilidad del dashboard.

## Validaciones ejecutadas

### Build frontend

Comando:

```bash
npm run build
```

Resultado:

- Estado: exitoso.
- Modulos transformados: 2212.
- Advertencia no bloqueante: chunk JavaScript mayor a 500 kB.

### Generacion JSON DW V2

Comando:

```bash
python -m backend.scripts.generate_dw_v2_legacy_dashboard_data
```

Resultado:

- Registros generados: 1735.
- Sociedades mapeadas: `LCM`, `LTDA`, `SPA`, `SPA_CC`, `SPA_MC`.
- Registros con match en `dim_company`: 1735.
- Registros sin match en `dim_company`: 0.
- Advertencias: 4 filas de dotacion sin remuneracion equivalente; `RUT_Sociedad` con fallback en 1735 registros.

### Auditoria dim_company

Comando:

```bash
python -m backend.scripts.audit_company_dimension
```

Resultado:

- Estado: OK.
- Errores criticos: 0.
- Advertencias: `rut_sociedad`, `legal_name` y `homologation_status` pendientes en 5 registros.

### Auditoria alcance por periodo

Comando:

```bash
python -m backend.scripts.audit_dashboard_period_scope
```

Resultado:

- Estado: APTO.
- Ultimo periodo: `2026-05`.
- Registros acumulados: 1735.
- Registros ultimo periodo: 343.
- Recomendacion: el filtro inicial por ultimo periodo reduce el universo frente al acumulado completo.

## Estado tecnico

Estado tecnico del entregable: apto para presentacion V1 con observaciones.

La aplicacion mantiene el contrato legacy consumido por el dashboard, pero la fuente efectiva es el JSON generado desde DW V2. Las mejoras aplicadas son de presentacion y usabilidad, sin cambios estructurales en DW V2.

## Recomendacion de uso

Usar esta V1 para presentacion ejecutiva, revision funcional y validacion de alcance corporativo de remuneraciones.

No usar aun como fuente legal definitiva de sociedades o RUT corporativos hasta completar y aprobar la homologacion de `dim_company`.
