# Auditoria de usabilidad - Dashboard Corporativo DW V2

## Objetivo

Auditar la usabilidad actual del Dashboard Corporativo conectado al dataset generado desde DW V2, identificando problemas de claridad, alcance de datos, filtros, visualizacion ejecutiva, tabla de trabajadores, estados vacios, comportamiento responsive y percepcion de performance.

Esta auditoria no implementa cambios y se limita a documentar hallazgos y recomendaciones para priorizacion del Sprint 08.

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

Datos observados en el dataset DW V2 generado:

- Registros acumulados: 1735.
- Periodos disponibles: `2026-01`, `2026-02`, `2026-03`, `2026-04`, `2026-05`.
- Periodo inicial efectivo: `2026-05`.
- Registros del periodo inicial: 343.
- Trabajadores del periodo inicial: 343.
- Empresas: 5.
- Centros de negocio: 56.
- Costo total acumulado: 2620369575.
- Costo total del periodo inicial: 522714867.

## Hallazgos

### Alcance inicial de datos

El hook `useCostDashboard.js` ya selecciona automaticamente el ultimo periodo disponible como filtro inicial. Esto evita cargar el acumulado completo por defecto y reduce el universo inicial desde 1735 registros a 343 registros para `2026-05`.

Sin embargo, la interfaz no comunica con suficiente fuerza que los KPIs, graficos y tabla corresponden al periodo filtrado. El header muestra `metadata.period` como rango acumulado `2026-01 a 2026-05`, mientras que los calculos visibles pueden estar filtrados por `2026-05`. Esto puede generar interpretaciones contradictorias.

### Claridad de filtros

El filtro de `Periodo` existe, aparece primero y permite `Todos`. Los filtros actuales son:

- Periodo.
- Empresa.
- Centro de Negocio.
- Tipo trabajador.
- Tipo Contrato.

No existe busqueda por trabajador, cargo o RUT. Para un dashboard con 343 registros en el periodo inicial y 1735 acumulados, la tabla de trabajadores queda limitada a top 15 y no permite encontrar rapidamente un trabajador especifico.

El boton `Reset` vuelve al ultimo periodo disponible, no al universo completo. Este comportamiento es correcto para evitar acumulado por defecto, pero el texto `Reset` no explica que vuelve al periodo mas reciente.

### Visualizacion del periodo activo

El periodo activo se ve solo en el select de filtros. El header muestra el rango de metadata, no el filtro activo. Los KPIs no incluyen subtitulo contextual como "Periodo 2026-05" o "Todos los periodos".

Esto es critico porque el usuario ejecutivo puede leer `2026-01 a 2026-05` en el encabezado y asumir que el costo total visible es acumulado, cuando en realidad el estado inicial muestra el ultimo periodo.

### Claridad del universo de datos

El header muestra trabajadores, empresas y metadata de registros, pero mezcla datos filtrados y metadata global:

- `stats.workers` y `stats.companies` responden al filtro activo.
- `metadata.workerCount` y `metadata.period` corresponden al dataset global.
- `metadata.sheet` expone `DW_V2`, que es util tecnicamente pero poco accionable para negocio.

La interfaz no muestra explicitamente "343 de 1735 registros" ni "5 empresas / 56 centros disponibles". Falta una lectura clara de alcance activo versus universo disponible.

### KPIs

Los KPIs son visualmente consistentes y de lectura rapida, pero tienen debilidades de interpretacion:

- El indicador visual tipo barra usa porcentajes fijos, no derivados de los datos.
- `Costo Promedio por Trabajador` depende del conteo de RUT unicos del filtro, lo cual es correcto, pero no se explica.
- `Costo Maximo Individual` puede destacar outliers sin contexto, ranking ni comparacion contra promedio.
- No hay variacion versus periodo anterior, presupuesto ni tendencia.

### Graficos

Los graficos actuales cubren:

- Costo total por empresa.
- Distribucion de empresas.
- Top 10 centros de negocio por costo.
- Desglose de costos.

Problemas detectados:

- No hay estado vacio cuando un filtro deja los graficos sin datos.
- La dona de empresas puede perder utilidad si hay pocos segmentos o nombres corporativos aun no homologados.
- El desglose de costos usa nombres derivados del campo legacy reemplazando `_` por espacios; puede mantener etiquetas tecnicas como `AFC Empresa`, `Seguro Social` o `Expectativa de Vida` sin explicacion.
- No se visualiza tendencia mensual, pese a que el dataset ya contiene `Periodo`.

### Tabla de trabajadores

La tabla muestra top 15 por costo y ordena por `Total_Costo`, lo que sirve para identificar casos de mayor impacto.

Problemas:

- No hay busqueda por trabajador, RUT o cargo.
- No hay paginacion ni control para cambiar el limite de 15.
- El `key` de fila usa solo `RUT_Trabajador`; como el dataset tiene multiples periodos, esto puede generar claves repetidas cuando se selecciona `Todos`.
- En mobile, la tabla depende de scroll horizontal con `min-w-[980px]`, lo que es funcional pero pesado para uso ejecutivo.
- No muestra `Periodo`, por lo que al seleccionar `Todos` no queda claro a que mes corresponde cada fila.

### Textos legacy y copy

Persisten textos asociados a Mantencion en `Login.jsx`, por ejemplo "costos de mantencion" y "Dashboard Ejecutivo de Mantencion". En el dashboard principal el titulo ya dice "Dashboard Corporativo de Remuneraciones", pero la experiencia de entrada sigue anclada al dominio anterior.

Tambien se observan caracteres con codificacion rota en algunos textos renderizados desde codigo o dataset, como `invÃ¡lido`, `informaciÃ³n`, `DotaciÃ³n`, `DistribuciÃ³n`, `MÃ¡ximo`, `AsignaciÃ³n_Familiar` y nombres de trabajadores con acentos. Esto afecta confianza y calidad percibida.

### Estados vacios y errores

Existe estado de error para dataset invalido en `ExecutiveDashboard.jsx`, pero faltan estados vacios por combinaciones de filtros sin resultados. Si un usuario filtra una combinacion inexistente, los componentes quedan con listas vacias o totales en cero sin explicacion ni sugerencia de accion.

### Responsive y mobile

La grilla de filtros se adapta razonablemente con `sm:grid-cols-2` y `xl:grid-cols-5`. Los KPIs pasan de 1 a 2 y luego 5 columnas. La tabla usa scroll horizontal.

Riesgos mobile:

- El header acumula varias capsulas, metadata y boton de cierre en poco espacio.
- La tabla no esta optimizada para lectura vertical.
- Los selects pueden ser largos por centros de negocio y empresas.
- No hay resumen compacto del contexto activo antes de los graficos.

### Performance percibida

El dataset se importa como JSON estatico en el bundle de frontend y los calculos se realizan en cliente con `useMemo`. Para 1735 registros no hay riesgo funcional alto, pero si el DW V2 crece, pueden aparecer problemas:

- Bundle inicial mas pesado por incluir datos.
- Recalculo de rankings y tabla al cambiar filtros.
- Render de tabla con scroll y top 15 controlado en cliente.
- Sin loading state ni skeleton, porque los datos llegan embebidos.

## Problemas criticos

1. El header muestra rango acumulado `metadata.period`, mientras que los KPIs iniciales corresponden al ultimo periodo filtrado. Riesgo alto de lectura equivocada del costo total.
2. Falta un indicador visible del universo activo: periodo seleccionado, registros filtrados, trabajadores, empresas y centros dentro del filtro.
3. Persisten problemas de codificacion de caracteres en textos de UI y datos, afectando profesionalismo y confianza.
4. La tabla de trabajadores no tiene busqueda, paginacion ni periodo visible, limitando la investigacion operativa.
5. No hay estados vacios por filtro, lo que deja pantallas ambiguas cuando no existen resultados.

## Problemas menores

- Boton `Reset` no comunica que vuelve al ultimo periodo disponible.
- `metadata.sheet = DW_V2` es lenguaje tecnico para usuario de negocio.
- Los indicadores visuales de los KPIs parecen data-driven, pero usan valores fijos.
- Labels como "Tipo trabajador" y "Tipo Contrato" pueden normalizar capitalizacion.
- `Top 10 Centros de Negocio por Costo` puede truncar informacion relevante sin acceso al resto.
- `Distribucion Empresas` deberia decir "Distribucion por empresa" o "Participacion por empresa".
- `Desglose de Costos` muestra campos legacy con etiquetas poco explicativas.
- Login conserva narrativa de Mantencion, distinta del dashboard corporativo de remuneraciones.

## Quick wins

- Mostrar una banda de contexto activo bajo filtros: periodo, registros filtrados, trabajadores, empresas, centros y costo total.
- Cambiar `Reset` por "Restablecer periodo actual" o agregar tooltip/label que indique que vuelve al ultimo periodo.
- En Header, separar "Periodo activo" de "Rango disponible".
- Renombrar `Hoja`/`DW_V2` a "Fuente" o moverlo a metadata tecnica menos prominente.
- Agregar estados vacios en rankings, dona, desglose y tabla.
- Corregir codificacion de textos UI y validar generacion del JSON con UTF-8.
- Agregar columna `Periodo` en la tabla cuando el filtro sea `Todos`.
- Cambiar textos legacy de Mantencion en Login para alinearlos con remuneraciones corporativas.

## Mejoras recomendadas

### Corto plazo

- Crear un componente de resumen de alcance activo.
- Mejorar copy de filtros y KPIs para distinguir filtro activo de metadata global.
- Agregar busqueda simple por trabajador, RUT y cargo.
- Agregar estado vacio reutilizable para componentes de visualizacion.
- Revisar codificacion UTF-8 en fuente, scripts de generacion y archivos JSX.

### Mediano plazo

- Agregar comparacion contra periodo anterior para KPIs principales.
- Incorporar tendencia mensual de costo total y dotacion.
- Mejorar tabla con paginacion, busqueda, ordenamiento por columnas y opcion de descarga.
- Agregar drill-down por empresa -> centro -> trabajador.
- Normalizar etiquetas de conceptos de costo en una capa semantica, evitando exponer nombres legacy directamente.

### Largo plazo

- Evaluar carga asincrona del dataset o API si el volumen DW V2 crece.
- Separar metadata tecnica de informacion ejecutiva.
- Incorporar permisos o scopes por empresa/sociedad si el dashboard sera usado por distintos perfiles.
- Definir un design system de estados: loading, empty, error, partial data y stale data.

## Propuesta de priorizacion

### P0 - Antes de ampliar uso ejecutivo

- Clarificar periodo activo versus rango disponible.
- Mostrar universo activo de datos.
- Corregir codificacion de caracteres.
- Agregar estados vacios por filtros.

### P1 - Sprint 08 recomendado

- Agregar busqueda de trabajador/RUT/cargo.
- Mejorar tabla con periodo visible en modo `Todos`.
- Ajustar copy legacy de Mantencion.
- Revisar labels de graficos y desglose de costos.

### P2 - Sprint posterior

- Tendencias mensuales.
- Comparacion contra periodo anterior.
- Paginacion/ordenamiento avanzado.
- Optimizacion de carga si el JSON crece.

## Riesgos

- Si no se aclara el periodo activo, el usuario puede tomar decisiones creyendo que ve el acumulado completo cuando ve solo el ultimo periodo.
- Si se mantiene metadata tecnica visible, se diluye la confianza ejecutiva del dashboard.
- Si el dataset crece, el import estatico de JSON puede afectar build, bundle y tiempo de carga.
- Si no se corrige la codificacion, nombres y etiquetas pueden verse defectuosos en presentaciones o revisiones de negocio.
- Si no hay busqueda ni paginacion, la tabla queda como ranking limitado y no como herramienta de analisis.
- Si se implementan mejoras sin mantener el contrato legacy, se puede romper la compatibilidad lograda con el adapter DW V2.
