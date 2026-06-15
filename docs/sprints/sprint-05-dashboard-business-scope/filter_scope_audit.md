# Auditoria de filtros y alcance de negocio - Sprint 05

## Objetivo

Auditar como el dashboard controla actualmente el universo de datos despues de conectarse al JSON generado desde DW V2, e identificar mejoras necesarias para que el alcance de negocio sea explicito, comprensible y seguro para usuarios ejecutivos.

El foco es detectar si los filtros actuales son suficientes para trabajar con el universo ampliado de DW V2 sin cambiar todavia codigo productivo.

## Alcance

Archivos revisados:

- `frontend/src/services/legacy/maintenanceCostService.js`
- `frontend/src/hooks/useCostDashboard.js`
- `frontend/src/pages/ExecutiveDashboard.jsx`
- `frontend/src/components/FilterBar.jsx`
- `frontend/src/components/Header.jsx`
- `frontend/src/components/KpiGrid.jsx`
- `frontend/src/components/RankingBars.jsx`
- `frontend/src/components/CompanyDonut.jsx`
- `frontend/src/components/CostBreakdown.jsx`
- `frontend/src/components/WorkerTable.jsx`
- `frontend/src/components/SectionCard.jsx`
- `frontend/src/components/Login.jsx`
- `frontend/src/utils/analytics.js`
- `frontend/src/utils/formatters.js`
- `frontend/src/data/generated/maintenanceCostData.dw_v2.json`

Fuera de alcance:

- Implementar filtros nuevos.
- Modificar React, hooks, servicios o JSON.
- Cambiar imports.
- Ejecutar merge o commit.

## Filtros existentes

Los filtros actuales se definen en `frontend/src/hooks/useCostDashboard.js`:

```js
const defaultFilters = {
  company: "Todas",
  businessCenter: "Todos",
  workerType: "Todos",
  contract: "Todos",
};
```

### Empresa

Estado: existe.

Origen:

- Opciones: `uniqueValues(records, "Nombre_Sociedad")`
- Filtro: `item.Nombre_Sociedad === filters.company`
- UI: `FilterBar.jsx`, select "Empresa"

Observacion: con DW V2, `Nombre_Sociedad` viene como codigo de sociedad por fallback (`LCM`, `LTDA`, `SPA`, `SPA_CC`, `SPA_MC`), no como nombre legal largo ni sociedad homologada.

### Centro de negocio

Estado: existe.

Origen:

- Opciones: `uniqueValues(records, "Centro_de_Negocio")`
- Filtro: `item.Centro_de_Negocio === filters.businessCenter`
- UI: `FilterBar.jsx`, select "Centro de Negocio"

Observacion: DW V2 expone 56 centros de negocio. El dashboard inicia en "Todos", por lo que los KPIs iniciales cubren todo el universo corporativo disponible.

### Tipo trabajador

Estado: existe.

Origen:

- Opciones: `uniqueValues(records, "Tipo_Trabajador")`
- Filtro: `item.Tipo_Trabajador === filters.workerType`
- UI: `FilterBar.jsx`, select "Tipo trabajador"

Observacion: filtra estado/tipo laboral, pero no define alcance de negocio.

### Contrato

Estado: existe.

Origen:

- Opciones: `uniqueValues(records, "Contrato_Trabajador")`
- Filtro: `item.Contrato_Trabajador === filters.contract`
- UI: `FilterBar.jsx`, select "Tipo Contrato"

Observacion: filtra tipo de contratacion, pero no define alcance de negocio.

### Periodo

Estado: no existe.

Hallazgos:

- `useCostDashboard.js` no define filtro de periodo.
- `FilterBar.jsx` no renderiza selector de periodo.
- `frontend/src/data/generated/maintenanceCostData.dw_v2.json` contiene `metadata.period = "2026-01 a 2026-05"`.
- Los registros del JSON generado no incluyen campo `Periodo`, `periodo`, `Mes`, `Año` ni equivalente por fila.

Impacto: no es posible filtrar por periodo desde el frontend actual sin ampliar el contrato generado o cambiar la estrategia de generacion.

### Busqueda de trabajador

Estado: no existe.

Hallazgos:

- No hay estado `search`, `query` o equivalente en `useCostDashboard.js`.
- `WorkerTable.jsx` muestra los primeros 15 registros ordenados por `Total_Costo`, pero no permite buscar por `Nombre_Trabajador` ni `RUT_Trabajador`.

Impacto: en universo DW V2 amplio, encontrar un trabajador especifico requiere manipular filtros indirectos o revisar el top 15 solamente.

### Filtros adicionales

No se encontraron filtros adicionales en componentes, paginas o utilidades.

Los graficos (`RankingBars`, `CompanyDonut`, `CostBreakdown`) no filtran por si mismos. Solo renderizan los agregados que entrega `useCostDashboard`.

## Filtros faltantes

Filtros minimos ausentes para controlar DW V2:

- Periodo.
- Alcance de negocio inicial, por ejemplo centro "Mantencion" o grupo de centros aprobado.
- Sociedad/empresa homologada con nombre real y RUT.
- Busqueda por trabajador, RUT o cargo.
- Selector de universo: "Corporativo completo" vs "Mantencion" vs "Sociedad seleccionada".
- Filtro por cargo.

Campos requeridos que el JSON actual no provee de forma suficiente:

- Periodo por registro.
- Sociedad legal homologada.
- RUT sociedad real.
- Empresa corta oficial.

## Riesgos funcionales actuales

### El dashboard carga todo DW V2 por defecto

El estado inicial usa:

- `company: "Todas"`
- `businessCenter: "Todos"`
- `workerType: "Todos"`
- `contract: "Todos"`

Con el JSON DW V2 actual, esto significa:

- `1735` registros.
- `398` trabajadores unicos.
- `5` sociedades/codigos.
- `56` centros de negocio.
- Periodo metadata: `2026-01 a 2026-05`.

Riesgo: los KPIs iniciales se leen como "dashboard corporativo", pero pueden ser interpretados como continuidad del dashboard anterior de mantencion si no hay contexto visual suficiente.

### Los KPIs se calculan sobre el universo filtrado sin contexto fuerte

`getDashboardStats(filteredRecords)` calcula:

- `totalCost`
- `workers`
- `companies`
- `averageCost`
- `maxCost`

Si no hay filtros activos, `filteredRecords` equivale a todo `records`.

Riesgo: el usuario ve costos agregados del universo completo sin una declaracion clara de alcance, periodo o fuente funcional.

### No existe filtro por periodo

El dashboard muestra `metadata.period`, pero no permite elegir mes o rango.

Riesgo: si DW V2 contiene varios meses, las cifras pueden parecer mensuales aunque sean acumuladas o rango completo.

### Empresa no equivale a sociedad legal real

El campo `Nombre_Sociedad` actualmente contiene codigos DW V2 por fallback.

Riesgo: la UI usa la etiqueta "Empresa", pero las opciones pueden ser codigos no suficientemente claros para usuarios ejecutivos.

### No existe busqueda de trabajador

La tabla muestra top 15 por costo y no tiene busqueda.

Riesgo: con 1735 registros, la tabla pierde utilidad operativa para auditoria puntual.

### Reset vuelve al universo completo

El boton `Reset` en `FilterBar.jsx` vuelve a:

```js
{
  company: "Todas",
  businessCenter: "Todos",
  workerType: "Todos",
  contract: "Todos",
}
```

Riesgo: incluso si un usuario reduce el alcance, un reset regresa al universo total sin confirmacion ni contexto.

## Recomendacion de filtros minimos para DW V2

### 1. Periodo

Prioridad: alta.

Recomendacion:

- Agregar `Periodo` al contrato generado por registro.
- Exponer selector de periodo en `FilterBar`.
- Comportamiento inicial recomendado: ultimo periodo disponible.

Motivo: evita que el dashboard mezcle varios meses por defecto y permite lectura ejecutiva comparable.

### 2. Alcance de negocio

Prioridad: alta.

Recomendacion:

- Definir un filtro principal de alcance con opciones aprobadas:
  - `Mantencion`
  - `Corporativo completo`
  - `Sociedad`
  - otros grupos de negocio oficiales

Motivo: DW V2 es corporativo y requiere una decision explicita de universo antes de mostrar KPIs.

### 3. Centro de negocio

Prioridad: alta.

Estado actual: existe.

Mejora recomendada:

- Mantener filtro, pero permitir que dependa del alcance seleccionado.
- Evitar iniciar en "Todos" si el dashboard pretende representar mantencion.

### 4. Sociedad homologada

Prioridad: alta.

Recomendacion:

- Reemplazar codigos por nombres oficiales via tabla de homologacion.
- Mantener internamente `sociedad_id` o codigo para trazabilidad.

Motivo: "Empresa" debe ser entendible y consistente con reporting ejecutivo.

### 5. Busqueda de trabajador

Prioridad: media.

Recomendacion:

- Agregar busqueda por `Nombre_Trabajador`, `RUT_Trabajador` y opcionalmente `Cargo`.

Motivo: vuelve util la tabla cuando el universo excede el top 15.

### 6. Cargo

Prioridad: media.

Recomendacion:

- Agregar filtro de cargo o familia de cargo cuando exista homologacion.

Motivo: aporta control de alcance operativo y explicacion de costos.

## Propuesta de comportamiento inicial del dashboard

### Opcion recomendada para Sprint 05

Iniciar el dashboard con un alcance explicito y acotado:

```text
Periodo: ultimo periodo disponible
Alcance: Mantencion o alcance aprobado por negocio
Empresa: Todas dentro del alcance
Centro de negocio: Todos dentro del alcance
Tipo trabajador: Todos
Contrato: Todos
```

Ventaja:

- Reduce el riesgo de mostrar cifras acumuladas o corporativas como si fueran el dashboard historico de mantencion.
- Mantiene un relato ejecutivo claro.
- Permite ampliar a "Corporativo completo" como accion consciente del usuario.

### Alternativa aceptable

Iniciar en "Corporativo completo", pero solo si la UI muestra claramente:

- Fuente: DW V2.
- Periodo/rango activo.
- Cantidad de registros filtrados.
- Alcance: Corporativo completo.
- Advertencia o etiqueta de que no corresponde al universo legacy de mantencion.

## Proximos pasos

1. Definir con negocio el alcance inicial oficial del dashboard DW V2.
2. Ampliar el adapter para emitir periodo por registro.
3. Crear homologacion de sociedades (`sociedad`, `RUT_Sociedad`, `Nombre_Sociedad`, `Empresa_Corta`).
4. Diseñar un modelo de filtros con `period`, `scope`, `company`, `businessCenter`, `workerType`, `contract`, `workerSearch`.
5. Implementar filtros en `useCostDashboard.js` manteniendo componentes reutilizables.
6. Actualizar `FilterBar.jsx` para soportar periodo, alcance y busqueda.
7. Agregar auditoria o prueba de contrato que valide presencia de periodo y campos de sociedad homologados.

## Conclusiones

El dashboard tiene una base de filtros simple y funcional para el contrato legacy original, pero insuficiente para controlar el alcance de negocio de DW V2.

La brecha principal es que los KPIs cargan todo el universo DW V2 por defecto y no existe filtro por periodo. Para Sprint 05, la prioridad tecnica debe ser incorporar periodo por registro y un filtro de alcance inicial que haga explicito si el usuario esta viendo mantencion, una sociedad, o el corporativo completo.
