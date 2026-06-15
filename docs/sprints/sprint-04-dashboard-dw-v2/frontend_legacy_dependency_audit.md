# Auditoria de dependencias frontend del JSON legacy

## Objetivo

Identificar las dependencias directas e indirectas del frontend sobre el contrato legacy publicado en `frontend/src/data/legacy/maintenanceCostData.json`, antes de evaluar una migracion hacia Data Warehouse V2.

El foco de esta auditoria es documentar que partes del dashboard dependen de:

- El archivo JSON legacy.
- El servicio `maintenanceCostService.js`.
- El hook `useCostDashboard.js`.
- Campos legacy usados para filtros, KPIs, graficos, tablas y calculos derivados.

No se implementaron cambios de logica, imports ni componentes durante esta auditoria.

## Alcance

Alcance incluido:

- Busqueda de referencias en `frontend/src`.
- Revision del contrato actual de `frontend/src/data/legacy/maintenanceCostData.json`.
- Revision del servicio de acceso a datos legacy.
- Revision del hook que filtra y deriva analytics.
- Revision de componentes React que consumen datos derivados o registros legacy.
- Revision puntual del modelo DW V2 documentado y sus archivos CSV para orientar la recomendacion tecnica.

Fuera de alcance:

- Modificar el frontend.
- Cambiar imports.
- Eliminar o mover archivos legacy.
- Regenerar datasets.
- Implementar el adapter DW V2.
- Hacer commit.

## Archivos auditados

Frontend:

- `frontend/src/data/legacy/maintenanceCostData.json`
- `frontend/src/services/legacy/maintenanceCostService.js`
- `frontend/src/hooks/useCostDashboard.js`
- `frontend/src/utils/analytics.js`
- `frontend/src/utils/formatters.js`
- `frontend/src/pages/ExecutiveDashboard.jsx`
- `frontend/src/components/FilterBar.jsx`
- `frontend/src/components/Header.jsx`
- `frontend/src/components/KpiGrid.jsx`
- `frontend/src/components/RankingBars.jsx`
- `frontend/src/components/CompanyDonut.jsx`
- `frontend/src/components/CostBreakdown.jsx`
- `frontend/src/components/WorkerTable.jsx`

Contexto DW V2 revisado:

- `docs/remuneraciones/data_model/11_modelo_dimensional_data_warehouse_v2.md`
- `data/datawarehouse/v2/facts/fact_remuneraciones_mensual.csv`
- `data/datawarehouse/v2/facts/fact_dotacion_mensual.csv`
- `data/datawarehouse/v2/dimensions/dim_trabajador.csv`
- `data/datawarehouse/v2/dimensions/dim_sociedad.csv`
- `data/datawarehouse/v2/dimensions/dim_centro_negocio.csv`
- `data/datawarehouse/v2/dimensions/dim_cargo.csv`
- `data/datawarehouse/v2/dimensions/dim_contrato.csv`
- `data/datawarehouse/v2/dimensions/dim_estado_laboral.csv`

## Dependencias encontradas

### Dependencia directa al JSON legacy

`frontend/src/services/legacy/maintenanceCostService.js` importa directamente:

```js
import dataset from "../../data/legacy/maintenanceCostData.json";
```

Este servicio valida solo la forma minima del contrato:

- Existe `dataset`.
- `dataset.records` es array.
- `dataset.metadata` es objeto.

Luego retorna:

- `isDatasetValid`
- `datasetError`
- `records`
- `metadata`

Conclusion: el punto de entrada al JSON esta centralizado, lo cual facilita introducir un adapter sin tocar todos los componentes.

### Dependencia del hook `useCostDashboard`

`frontend/src/hooks/useCostDashboard.js` depende del servicio legacy y asume que cada fila de `records` tiene campos con nombres legacy.

Dependencias por opciones de filtros:

- `Nombre_Sociedad`
- `Centro_de_Negocio`
- `Tipo_Trabajador`
- `Contrato_Trabajador`

Dependencias por aplicacion de filtros:

- `item.Nombre_Sociedad`
- `item.Centro_de_Negocio`
- `item.Tipo_Trabajador`
- `item.Contrato_Trabajador`

Dependencias por agregaciones:

- `groupByCost(filteredRecords, "Nombre_Sociedad")`
- `groupByCost(filteredRecords, "Centro_de_Negocio")`
- `groupByCost(filteredRecords, "Contrato_Trabajador")`
- `getDashboardStats(filteredRecords)`
- `costBreakdown(filteredRecords)`
- Ordenamiento de tabla por `Total_Costo`

El hook entrega a la pagina:

- `metadata`
- `filters`
- `setFilters`
- `options`
- `analytics`
- `filteredRecords`
- `records`

Conclusion: `useCostDashboard.js` es el principal acoplamiento funcional al contrato legacy.

### Dependencia de utilidades analytics

`frontend/src/utils/analytics.js` contiene calculos derivados sobre campos legacy.

Campos monetarios usados por `costBreakdown`:

- `Total_Haberes`
- `AFC_Empresa`
- `Mutual`
- `SIS`
- `Seguro_Social`
- `Expectativa_de_Vida`
- `Asignación_Familiar`

Campos usados por agregaciones y KPIs:

- `Total_Costo`
- `RUT_Trabajador`
- `Nombre_Sociedad`

Funciones afectadas:

- `uniqueValues(records, field)`
- `sumBy(records, field)`
- `groupByCost(records, field)`
- `costBreakdown(records)`
- `getDashboardStats(records)`

KPIs derivados:

- Costo total: suma de `Total_Costo`.
- Dotacion: cantidad unica de `RUT_Trabajador`.
- Empresas: cantidad unica de `Nombre_Sociedad`.
- Costo promedio por trabajador: `Total_Costo / trabajadores`.
- Costo maximo individual: maximo de `Total_Costo`.

Conclusion: aunque las funciones reciben `field` como string, sus llamados actuales y algunos calculos internos siguen amarrados a nombres legacy.

### Dependencia en pagina principal

`frontend/src/pages/ExecutiveDashboard.jsx` importa `useCostDashboard` y distribuye sus resultados.

Componentes conectados:

- `Header`: recibe `analytics.stats` y `metadata`.
- `FilterBar`: recibe `filters`, `setFilters`, `options`.
- `KpiGrid`: recibe `analytics.stats`.
- `RankingBars`: recibe `analytics.companyCosts` y `analytics.businessCenterCosts`.
- `CompanyDonut`: recibe `analytics.companyCosts`.
- `CostBreakdown`: recibe `analytics.breakdown` y `analytics.stats.totalCost`.
- `WorkerTable`: recibe `analytics.tableRows`.

Conclusion: la pagina no conoce los campos legacy directamente, pero propaga datos ya derivados desde el hook.

## Componentes React afectados

### `FilterBar.jsx`

No accede a campos legacy directamente. Depende del shape preparado por el hook:

- `options.companies`
- `options.businessCenters`
- `options.workerTypes`
- `options.contracts`
- `filters.company`
- `filters.businessCenter`
- `filters.workerType`
- `filters.contract`

Impacto de migracion: si el adapter mantiene las mismas opciones y valores, el componente no requiere cambios.

### `Header.jsx`

No accede a campos legacy de registros. Depende de:

- `stats.workers`
- `stats.companies`
- `metadata.period`
- `metadata.sheet`
- `metadata.workerCount`

Impacto de migracion: el adapter debe generar metadata compatible o el header mostrara datos vacios/incorrectos.

### `KpiGrid.jsx`

No accede a registros legacy. Depende de:

- `stats.totalCost`
- `stats.workers`
- `stats.companies`
- `stats.averageCost`
- `stats.maxCost`

Impacto de migracion: depende de que `getDashboardStats` reciba registros ya adaptados.

### `RankingBars.jsx`

No accede a campos legacy. Espera items agregados:

- `name`
- `value`
- `percent`

Impacto de migracion: estable si `useCostDashboard` sigue entregando los mismos agregados.

### `CompanyDonut.jsx`

No accede a campos legacy. Espera items agregados:

- `name`
- `value`
- `percent`

Usa `shortName(item.name)` para abreviar nombres de empresa.

Impacto de migracion: si DW V2 entrega codigos de sociedad en lugar de nombres largos, la visualizacion perdera nombres corporativos legibles.

### `CostBreakdown.jsx`

No accede a registros legacy. Espera items ya derivados:

- `key`
- `name`
- `value`
- `percent`

Impacto de migracion: depende de que `costBreakdown` pueda calcular los componentes monetarios requeridos.

### `WorkerTable.jsx`

Es el componente con mayor dependencia directa al registro legacy. Usa:

- `row.RUT_Trabajador` como key y subtitulo.
- `row.Nombre_Trabajador`.
- `row.Nombre_Sociedad`.
- `row.Cargo`.
- `row.Tipo_Trabajador`.
- `row.Contrato_Trabajador`.
- `row.Total_Haberes`.
- `row.Total_Costo`.

Ademas, `StatusBadge` y `ContractBadge` contienen reglas visuales sobre valores legacy:

- `Tipo_Trabajador` se compara con `"activo"`.
- `Contrato_Trabajador` se compara con `"fijo"`.

Impacto de migracion: si el adapter no normaliza capitalizacion y textos esperados, los badges pueden perder semantica visual.

## Mapa de flujo actual de datos

```text
frontend/src/data/legacy/maintenanceCostData.json
  -> frontend/src/services/legacy/maintenanceCostService.js
      getMaintenanceCostDataset()
        -> frontend/src/hooks/useCostDashboard.js
            - valida fallback defensivo
            - genera opciones de filtros
            - filtra records
            - calcula analytics
            - ordena tableRows por Total_Costo
              -> frontend/src/pages/ExecutiveDashboard.jsx
                  -> Header
                  -> FilterBar
                  -> KpiGrid
                  -> RankingBars
                  -> CompanyDonut
                  -> CostBreakdown
                  -> WorkerTable
```

## Campos legacy requeridos por el dashboard

### Campos requeridos por filtros

| Campo legacy | Uso |
| --- | --- |
| `Nombre_Sociedad` | Opciones y filtro de empresa |
| `Centro_de_Negocio` | Opciones y filtro de centro de negocio |
| `Tipo_Trabajador` | Opciones y filtro de tipo trabajador |
| `Contrato_Trabajador` | Opciones y filtro de contrato |

### Campos requeridos por KPIs

| Campo legacy | Uso |
| --- | --- |
| `Total_Costo` | Costo total, costo promedio, costo maximo |
| `RUT_Trabajador` | Conteo unico de trabajadores |
| `Nombre_Sociedad` | Conteo unico de empresas |

### Campos requeridos por graficos

| Campo legacy | Uso |
| --- | --- |
| `Nombre_Sociedad` | Ranking y donut por empresa |
| `Centro_de_Negocio` | Top 10 centros de negocio por costo |
| `Contrato_Trabajador` | Agregacion `contractCosts`, actualmente calculada pero no renderizada |
| `Total_Costo` | Base de todos los rankings y porcentajes |

### Campos requeridos por desglose de costos

| Campo legacy | Uso |
| --- | --- |
| `Total_Haberes` | Item del desglose |
| `AFC_Empresa` | Item del desglose |
| `Mutual` | Item del desglose |
| `SIS` | Item del desglose |
| `Seguro_Social` | Item del desglose |
| `Expectativa_de_Vida` | Item del desglose |
| `Asignación_Familiar` | Item del desglose |
| `Total_Costo` | Denominador del porcentaje |

### Campos requeridos por tabla

| Campo legacy | Uso |
| --- | --- |
| `RUT_Trabajador` | Key de fila e identificador visual |
| `Nombre_Trabajador` | Nombre principal de trabajador |
| `Nombre_Sociedad` | Empresa abreviada con `shortName` |
| `Cargo` | Columna cargo |
| `Tipo_Trabajador` | Badge de estado |
| `Contrato_Trabajador` | Badge de contrato |
| `Total_Haberes` | Columna monetaria |
| `Total_Costo` | Columna monetaria y ordenamiento |

### Campos presentes en JSON pero no usados directamente por UI actual

| Campo legacy | Observacion |
| --- | --- |
| `RUT_Sociedad` | Presente en records y metadata.columns, no referenciado por componentes auditados |
| `Haberes_Imponibles` | Presente en records y metadata.columns, no usado en `costBreakdown` actual |
| `Empresa_Corta` | Presente en records, pero la UI usa `shortName(Nombre_Sociedad)` en vez de este campo |

## Calculos derivados en frontend

Los calculos principales ocurren en `frontend/src/hooks/useCostDashboard.js` y `frontend/src/utils/analytics.js`.

Filtros:

- Empresa por igualdad exacta de `Nombre_Sociedad`.
- Centro de negocio por igualdad exacta de `Centro_de_Negocio`.
- Tipo trabajador por igualdad exacta de `Tipo_Trabajador`.
- Contrato por igualdad exacta de `Contrato_Trabajador`.

Opciones:

- Se calculan con valores unicos y ordenados alfabeticamente por `localeCompare("es")`.

KPIs:

- `totalCost`: suma numerica de `Total_Costo`.
- `workers`: conteo de valores unicos de `RUT_Trabajador`.
- `companies`: conteo de valores unicos de `Nombre_Sociedad`.
- `averageCost`: `totalCost / workers`.
- `maxCost`: maximo de `Total_Costo`.

Graficos:

- `companyCosts`: suma de `Total_Costo` agrupada por `Nombre_Sociedad`.
- `businessCenterCosts`: suma de `Total_Costo` agrupada por `Centro_de_Negocio`, limitada a top 10.
- `contractCosts`: suma de `Total_Costo` agrupada por `Contrato_Trabajador`; se calcula pero no se renderiza actualmente.
- `breakdown`: suma de campos monetarios definidos en `moneyFields` y porcentaje contra `Total_Costo`.

Tabla:

- `tableRows`: copia de `filteredRecords` ordenada descendente por `Total_Costo`.
- `WorkerTable` renderiza solo los primeros 15 registros.

## Riesgos de migracion

### Riesgo alto: nombres de campos incompatibles

DW V2 usa nombres normalizados snake_case, por ejemplo:

- `total_haberes`
- `total_costo`
- `rut`
- `sociedad`
- `trabajador_id`
- `sociedad_id`
- `centro_negocio_id`

El frontend actual espera nombres legacy con mayusculas y guiones bajos especificos. Consumir DW V2 directo romperia filtros, KPIs, rankings y tabla.

### Riesgo alto: DW V2 separa facts y dimensiones

El JSON legacy entrega filas denormalizadas listas para UI. DW V2 separa:

- `fact_remuneraciones_mensual.csv`
- `fact_dotacion_mensual.csv`
- `dim_trabajador.csv`
- `dim_sociedad.csv`
- `dim_centro_negocio.csv`
- `dim_cargo.csv`
- `dim_contrato.csv`
- `dim_estado_laboral.csv`

El dashboard actual no tiene capa para resolver joins ni historicos.

### Riesgo alto: costo por cargo/contrato/tipo requiere cruce oficial

La documentacion DW V2 indica que `fact_remuneraciones_mensual` no contiene `cargo_id`, `contrato_id` ni `estado_laboral_id`; esos atributos provienen de dotacion. Por tanto, mantener `Cargo`, `Contrato_Trabajador` y `Tipo_Trabajador` junto a costos requiere cruzar remuneraciones con dotacion.

Esto debe resolverse con una regla oficial de join, al menos por:

```text
trabajador_id + periodo_id + sociedad_id
```

Y probablemente tambien `centro_negocio_id` si se quiere evitar ambiguedad.

### Riesgo medio: nombres de sociedad incompletos en DW V2

`dim_sociedad.csv` contiene codigos como `LCM` y `LTDA`, mientras el legacy usa nombres largos como `Empresa de Transportes Pullman San Luis LTDA`.

Si no existe homologacion de sociedad, la UI mostrara codigos en rankings, donut, filtros y tabla.

### Riesgo medio: normalizacion de texto y capitalizacion

Los badges actuales comparan strings en minuscula:

- `"activo"`
- `"fijo"`

DW V2 contiene valores en mayuscula como `ACTIVO`, `FIJO`, `INDEFINIDO`. El componente aplica `toLowerCase()`, por lo que estos casos especificos funcionan, pero otros valores deben revisarse para no perder clasificacion visual.

### Riesgo medio: metadata requerida por header

El header espera:

- `metadata.period`
- `metadata.sheet`
- `metadata.workerCount`

El servicio solo valida que `metadata` sea objeto, no valida campos internos. Si el adapter omite estas claves, el dashboard puede renderizar valores vacios sin error claro.

### Riesgo medio: campo con tilde en `Asignación_Familiar`

El desglose usa el nombre exacto `Asignación_Familiar`. Un adapter debe emitir esa clave exacta o modificar `moneyFields`. Como no se busca tocar frontend en una primera migracion, el adapter debe preservar el nombre legacy.

### Riesgo bajo: `Empresa_Corta` no se usa directamente

Aunque el campo aparece en el JSON y fue solicitado en la busqueda, la UI actual no lo referencia directamente. Aun asi, conviene preservarlo en el adapter para compatibilidad con futuros componentes o auditorias.

## Recomendacion tecnica: adapter DW V2 a contrato legacy

Se recomienda crear una capa adapter que lea DW V2 y genere un artefacto compatible con el contrato actual del dashboard, sin cambiar componentes React en una primera etapa.

Contrato de salida recomendado:

```js
{
  metadata: {
    sourceFile,
    sheet,
    period,
    workerCount,
    companyCount,
    totalCost,
    columns,
    generatedAt,
    schemaVersion,
    sourceSheet,
    recordCount
  },
  records: [
    {
      RUT_Sociedad,
      Nombre_Sociedad,
      RUT_Trabajador,
      Nombre_Trabajador,
      Centro_de_Negocio,
      Cargo,
      Tipo_Trabajador,
      Contrato_Trabajador,
      Total_Haberes,
      Haberes_Imponibles,
      AFC_Empresa,
      Mutual,
      SIS,
      Seguro_Social,
      Expectativa_de_Vida,
      "Asignación_Familiar",
      Total_Costo,
      Empresa_Corta
    }
  ]
}
```

Mapeo inicial sugerido:

| Contrato legacy | Fuente DW V2 sugerida | Nota |
| --- | --- | --- |
| `RUT_Trabajador` | `fact_remuneraciones_mensual.rut` o `dim_trabajador.rut` | Mantener formato esperado por UI |
| `Nombre_Trabajador` | `dim_trabajador.nombre + apellidos` | Requiere recomposicion |
| `Nombre_Sociedad` | Homologacion de `sociedad_id`/`sociedad` | DW V2 hoy trae codigo, falta nombre largo |
| `Centro_de_Negocio` | `dim_centro_negocio.centro_negocio` | Join por `centro_negocio_id` |
| `Cargo` | `dim_cargo.cargo` | Join desde dotacion |
| `Tipo_Trabajador` | `dim_estado_laboral.tipo_trabajador` | Join desde dotacion |
| `Contrato_Trabajador` | `dim_contrato.tipo_contratacion` | Join desde dotacion |
| `Total_Haberes` | `fact_remuneraciones_mensual.total_haberes` | Convertir a numero |
| `Haberes_Imponibles` | `fact_remuneraciones_mensual.haberes_imponibles` | Preservar aunque UI no lo use |
| `AFC_Empresa` | `fact_remuneraciones_mensual.afc_empresa` | Convertir a numero |
| `Mutual` | `fact_remuneraciones_mensual.mutual` | Convertir a numero |
| `SIS` | `fact_remuneraciones_mensual.sis` | Convertir a numero |
| `Seguro_Social` | `fact_remuneraciones_mensual.seguro_social` | Convertir a numero |
| `Expectativa_de_Vida` | `fact_remuneraciones_mensual.cotizacion_expectativa_de_vida` | Nombre legacy distinto |
| `Asignación_Familiar` | `fact_remuneraciones_mensual.total_asignacion_familiar` | Mantener tilde exacta en salida |
| `Total_Costo` | `fact_remuneraciones_mensual.total_costo` | Base de KPIs y graficos |
| `Empresa_Corta` | Homologacion desde sociedad | Preservar compatibilidad |

Regla de integracion recomendada:

1. Tomar `fact_remuneraciones_mensual` como base de costos.
2. Enriquecer con `dim_trabajador`, `dim_sociedad` y `dim_centro_negocio`.
3. Cruzar con `fact_dotacion_mensual` para obtener `cargo_id`, `contrato_id` y `estado_laboral_id`.
4. Enriquecer con `dim_cargo`, `dim_contrato` y `dim_estado_laboral`.
5. Emitir registros denormalizados en el contrato legacy.
6. Calcular metadata desde el resultado final, no desde una sola fact aislada.
7. Validar columnas requeridas antes de escribir el JSON.

Ubicacion recomendada:

- Crear un script Python nuevo para adapter DW V2, por ejemplo `backend/scripts/export_maintenance_cost_legacy_from_dw_v2.py`.
- Mantener `frontend/src/services/legacy/maintenanceCostService.js` sin cambios inicialmente.
- Escribir el artefacto de salida en una ruta acordada solo cuando se apruebe la migracion. Si se decide reemplazar el JSON legacy existente, debe hacerse mediante script, nunca manualmente.

## Propuesta de proximos pasos

1. Validar con negocio la regla oficial de cruce entre remuneraciones y dotacion para cargo, contrato y estado laboral.
2. Definir homologacion de sociedades para convertir codigos DW V2 a nombres corporativos legibles y `Empresa_Corta`.
3. Crear una prueba de contrato que compare el JSON adaptado contra los campos requeridos por el dashboard.
4. Implementar el adapter DW V2 -> contrato legacy en Python, sin tocar React.
5. Generar un JSON paralelo de prueba para comparar totales, dotacion, empresas, top centros y tabla.
6. Ejecutar build frontend usando el JSON adaptado cuando la equivalencia este validada.
7. Solo despues de validar paridad, evaluar si conviene desacoplar `useCostDashboard` para consumir un contrato frontend mas estable y no nombres legacy de Excel.

## Resumen ejecutivo

El frontend actual no consume DW V2 directamente. Consume un JSON legacy denormalizado, centralizado por `maintenanceCostService.js` y transformado por `useCostDashboard.js`.

La buena noticia tecnica es que el acceso al JSON esta concentrado en un servicio y el contrato visual de la mayoria de componentes ya recibe datos derivados. La zona mas acoplada al registro legacy es `WorkerTable.jsx`, mientras que los filtros, KPIs y graficos dependen principalmente de `useCostDashboard.js` y `analytics.js`.

La migracion mas segura no es cambiar React de inmediato, sino crear un adapter DW V2 que emita el mismo contrato legacy. Esto reduce riesgo visual y funcional mientras se resuelven temas de negocio como homologacion de sociedades y cruce de remuneraciones con dotacion para cargo, contrato y tipo trabajador.
