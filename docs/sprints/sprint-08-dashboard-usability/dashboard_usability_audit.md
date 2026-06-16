# Auditoria de usabilidad - Dashboard Corporativo DW V2

## Objetivo

Auditar la usabilidad actual del Dashboard Corporativo conectado al dataset generado desde DW V2, considerando las mejoras ya incorporadas en Sprint 08: visualizacion del periodo activo, universo filtrado y busqueda simple de trabajador.

Esta auditoria no implementa cambios de codigo. Su objetivo es dejar una lectura clara del estado actual, brechas pendientes, quick wins recomendados y riesgos antes de seguir ampliando la experiencia del dashboard.

## Alcance

Archivos revisados:

- `frontend/src/pages/ExecutiveDashboard.jsx`
- `frontend/src/components/Header.jsx`
- `frontend/src/components/FilterBar.jsx`
- `frontend/src/components/KpiGrid.jsx`
- `frontend/src/components/RankingBars.jsx`
- `frontend/src/components/CompanyDonut.jsx`
- `frontend/src/components/CostBreakdown.jsx`
- `frontend/src/components/WorkerTable.jsx`
- `frontend/src/components/SectionCard.jsx`
- `frontend/src/components/Login.jsx`
- `frontend/src/hooks/useCostDashboard.js`
- `frontend/src/services/legacy/maintenanceCostService.js`
- `frontend/src/utils/analytics.js`
- `frontend/src/utils/formatters.js`
- `frontend/src/styles/index.css`
- `frontend/src/data/generated/maintenanceCostData.dw_v2.json`

Datos observados en el dataset generado:

- Registros acumulados: 1735.
- Periodos disponibles: `2026-01`, `2026-02`, `2026-03`, `2026-04`, `2026-05`.
- Periodo inicial efectivo: `2026-05`.
- Registros del periodo inicial: 343.
- Trabajadores unicos del periodo inicial: 343.
- Empresas del periodo inicial: 5.
- Centros del periodo inicial: 51.
- Centros acumulados: 56.
- Costo total acumulado: 2620369575.
- Costo total del periodo inicial: 522714867.

## Mejora ya implementada: busqueda de trabajador

El dashboard incorpora un nuevo filtro `searchTerm` en `useCostDashboard.js` y un input visible en `FilterBar.jsx` con placeholder `Nombre, RUT o cargo`.

Comportamiento actual:

- Busca sobre `Nombre_Trabajador`, `RUT_Trabajador` y `Cargo`.
- La busqueda es case-insensitive.
- Se combina con los filtros existentes: periodo, empresa, centro de negocio, tipo trabajador y contrato.
- `Restablecer` limpia la busqueda y vuelve al ultimo periodo disponible.
- La tabla, KPIs y graficos consumen el universo ya filtrado, por lo que todos reaccionan al buscador.

Valor de usabilidad:

- Resuelve una brecha importante para ubicar rapidamente trabajadores especificos.
- Reduce dependencia del Top 15 por costo como unico mecanismo de exploracion.
- Permite investigar casos por cargo o RUT sin modificar la tabla.

Limitaciones actuales:

- No normaliza acentos.
- No normaliza formatos de RUT.
- No resalta coincidencias en la tabla.
- No muestra chips de filtros activos ni un resumen textual de la busqueda aplicada.

## Hallazgos principales

### Periodo activo y universo filtrado

La mejora del header resuelve una confusion importante: ahora se muestra `Periodo activo`, `Registros`, `Trabajadores`, `Empresas` y `Centros` del universo filtrado. Tambien separa `Rango disponible` y `Fuente`, evitando mezclar el periodo activo con la metadata global del dataset.

El comportamiento inicial sigue siendo correcto para DW V2: el dashboard no parte en `Todos`, sino en el ultimo periodo disponible (`2026-05`). Esto evita que los KPIs arranquen con el acumulado completo.

Riesgo residual: cuando el usuario cambia a `Todos`, la tabla sigue sin mostrar periodo por fila. En ese modo puede ser dificil distinguir registros mensuales repetidos de un mismo trabajador.

### Claridad del filtro Periodo

El filtro `Periodo` esta bien ubicado al inicio de la barra y tiene opcion `Todos`. El header refuerza el periodo activo, por lo que la lectura ejecutiva mejora.

Pendiente: la opcion `Todos` no advierte que cambia el dashboard a acumulado multi-periodo. Para usuarios no tecnicos, seria util distinguir `Todos los periodos` de una seleccion mensual.

### Claridad del nuevo buscador

El label `Buscar trabajador` y el placeholder `Nombre, RUT o cargo` son claros. La posicion bajo los filtros funciona para escritorio y mobile, y el icono de busqueda ayuda a reconocer la accion.

Pendiente: no hay contador especifico de resultados de busqueda ni indicador de busqueda activa. El usuario ve el impacto por el header, pero no hay un chip como `Busqueda: "ana"` que permita limpiar solo ese criterio.

### Experiencia de filtros combinados

Los filtros combinados funcionan a nivel de hook y recalculan todo el dashboard sobre el mismo universo. Esta consistencia es buena: KPIs, rankings, dona, desglose y tabla quedan alineados.

Pendiente: no existe defensa visual para combinaciones sin resultados. Si el usuario combina periodo, centro, contrato y busqueda de manera muy restrictiva, el dashboard puede quedar en cero o con graficos vacios sin explicacion.

### Tabla de trabajadores

La tabla mejora indirectamente con el buscador, porque ahora puede actuar como resultado de busqueda y no solo como ranking. Sigue mostrando Top 15 por costo y el total de registros filtrados.

Pendientes:

- No hay estado vacio cuando la busqueda no encuentra registros.
- No hay paginacion ni boton para ver mas de 15 registros.
- No hay columna `Periodo` cuando se selecciona `Todos`.
- La key de fila usa solo `RUT_Trabajador`; en modo acumulado puede haber filas mensuales repetidas del mismo RUT.
- No hay resaltado de coincidencia por nombre/RUT/cargo.

### KPIs

Los KPIs se recalculan correctamente sobre el universo filtrado. Con el nuevo header, queda mas claro que corresponden al periodo y filtros activos.

Pendientes:

- Las barras internas de los KPIs usan porcentajes fijos, no derivados de los datos.
- No hay comparacion contra periodo anterior.
- `Costo Maximo Individual` puede ser correcto, pero falta contexto para entender si es outlier, trabajador unico o registro mensual.

### Graficos

Los graficos se alimentan desde `analytics` usando el universo filtrado, por lo que responden tambien al buscador. Esto mantiene consistencia global.

Pendientes:

- No hay estado vacio para ranking, dona o desglose.
- La dona puede verse vacia o poco informativa si una busqueda devuelve un unico trabajador.
- `Desglose de Costos` muestra etiquetas derivadas de campos legacy, lo que mantiene lenguaje tecnico.
- No existe visualizacion temporal, pese a tener `Periodo` disponible.

### Textos legacy o confusos

Persisten textos con codificacion rota en varias superficies visibles:

- `mÃ­nimos`, `informaciÃ³n`, `vÃ¡lida` en error de dataset.
- `sesiÃ³n` en Header.
- `DotaciÃ³n`, `MÃ¡ximo`, `DistribuciÃ³n` en componentes visuales.
- `contraseÃ±a`, `mantenciÃ³n`, `composiciÃ³n` en Login.

Tambien persiste copy legacy de Mantencion en `Login.jsx`, mientras el dashboard principal ya se presenta como corporativo de remuneraciones.

### Responsive

La barra de filtros es responsive y el buscador ocupa una segunda linea razonable. El header usa pills compactas y se adapta por wrapping.

Riesgos:

- La cantidad de pills del header puede ocupar demasiado alto en mobile.
- La tabla sigue dependiendo de scroll horizontal con ancho minimo alto.
- Selects con muchos centros de negocio pueden ser pesados en mobile.

### Performance percibida

Para 1735 registros, el filtrado en cliente es razonable. El buscador recalcula sobre `records` en `useMemo`, sin librerias adicionales.

Riesgos si crece el DW V2:

- El JSON esta importado estaticamente dentro del bundle.
- Cada cambio de busqueda puede recalcular filtros, KPIs, rankings, desglose y tabla.
- No hay debounce; con datasets grandes podria sentirse pesado al tipear.
- El build mantiene advertencia de chunk mayor a 500 kB.

## Problemas criticos

1. No existen estados vacios para busquedas o combinaciones de filtros sin resultados.
2. Persisten textos con codificacion rota en areas visibles, afectando confianza ejecutiva.
3. La tabla no muestra `Periodo` en modo acumulado, lo que puede confundir registros mensuales repetidos.
4. No hay normalizacion de busqueda para acentos o formatos de RUT.
5. El dashboard sigue importando el JSON estaticamente; el crecimiento del DW V2 puede afectar bundle y percepcion de carga.

## Problemas menores

- No hay chips visibles para filtros activos ni para la busqueda aplicada.
- `Restablecer` es mejor que `Reset`, pero podria indicar explicitamente que vuelve al ultimo periodo.
- Las barras visuales de KPIs no representan una metrica real.
- Labels de costo provienen del contrato legacy y no de una capa semantica de negocio.
- La dona de empresas puede tener bajo valor cuando la busqueda devuelve pocos registros.
- Login mantiene narrativa de Mantencion y no de remuneraciones corporativas.
- La tabla no permite ordenar, paginar o expandir resultados.

## Quick wins recomendados

- Agregar estado vacio reutilizable para tabla, rankings, dona y desglose.
- Mostrar chips de filtros activos con opcion de limpiar cada uno.
- Mostrar `Busqueda: "<termino>"` cuando `searchTerm` no este vacio.
- Normalizar busqueda eliminando acentos y caracteres no esenciales del RUT.
- Agregar columna `Periodo` en WorkerTable cuando el filtro de periodo sea `Todos`.
- Corregir codificacion UTF-8 en textos JSX y en datos visibles.
- Actualizar copy de Login para alinearlo con "Dashboard Corporativo de Remuneraciones".
- Cambiar `Todos` por `Todos los periodos` en el filtro de periodo.

## Priorizacion

### P0 - Antes de ampliar uso ejecutivo

- Corregir codificacion de caracteres en UI.
- Agregar estados vacios para combinaciones sin resultados.
- Aclarar modo acumulado cuando `Periodo = Todos`.

### P1 - Sprint 08 recomendado

- Normalizar busqueda por acentos y RUT.
- Agregar chips de filtros activos.
- Mejorar WorkerTable con columna de periodo en modo acumulado.
- Ajustar textos legacy de Login y labels confusos.

### P2 - Sprint posterior

- Agregar paginacion u opcion "ver mas" en tabla.
- Incorporar tendencia mensual y comparacion contra periodo anterior.
- Evaluar debounce de busqueda si aumenta el volumen.
- Separar carga de datos del bundle si el dataset crece.

## Riesgos

- Sin estados vacios, el usuario puede interpretar un resultado en cero como error de datos.
- Sin normalizacion de RUT, una busqueda con puntos, guion o formato distinto puede no encontrar registros esperados.
- Sin correccion UTF-8, la interfaz puede verse poco confiable en presentaciones ejecutivas.
- Sin periodo por fila en modo acumulado, un mismo trabajador puede aparecer repetido sin contexto mensual.
- Si el DW V2 crece, el import estatico del JSON y el filtrado en cliente pueden degradar performance.
- Si se corrigen etiquetas sin respetar el contrato legacy, se puede romper la compatibilidad actual entre adapter, hook y componentes.
