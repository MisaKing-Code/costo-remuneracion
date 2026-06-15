# Diseño adapter DW V2 a contrato legacy del dashboard

## Objetivo

Diseñar, sin implementar todavia, un adapter que transforme la estructura dimensional de `data/datawarehouse/v2` al contrato JSON legacy que consume el dashboard actual en `frontend/src/data/legacy/maintenanceCostData.json`.

El objetivo tecnico es permitir que el frontend siga recibiendo el mismo shape:

```text
{
  metadata: { ... },
  records: [ ... ]
}
```

sin cambiar componentes React, imports, hooks ni servicios productivos durante la primera etapa de migracion.

## Alcance

Incluido:

- Inspeccion de fuentes reales en `data/datawarehouse/v2`.
- Inspeccion de fuentes disponibles en `data/processed`.
- Inspeccion del contrato actual en `frontend/src/data/legacy/maintenanceCostData.json`.
- Identificacion de facts, dimensiones, claves y campos equivalentes.
- Diseño del contrato de salida compatible con el dashboard.
- Propuesta de reglas de calculo, fallback y validacion.
- Recomendacion de ubicacion para una implementacion futura.

Fuera de alcance:

- Implementar scripts.
- Regenerar JSON.
- Modificar codigo productivo.
- Cambiar imports del frontend.
- Eliminar o mover archivos.
- Hacer commit.

## Fuentes DW V2

### Facts disponibles

| Archivo | Filas inspeccionadas | Grano observado | Uso en adapter |
| --- | ---: | --- | --- |
| `data/datawarehouse/v2/facts/fact_remuneraciones_mensual.csv` | 1735 | 1 fila por `periodo_id + trabajador_id + sociedad_id + centro_negocio_id` | Base principal de costos |
| `data/datawarehouse/v2/facts/fact_dotacion_mensual.csv` | 1739 | 1 fila por `periodo_id + trabajador_id + sociedad_id + centro_negocio_id` | Enriquecimiento laboral: cargo, contrato, estado |

Columnas principales de `fact_remuneraciones_mensual`:

- `fact_remuneracion_id`
- `periodo_id`
- `trabajador_id`
- `sociedad_id`
- `centro_negocio_id`
- `periodo`
- `rut`
- `sociedad`
- `ano`
- `mes`
- `total_haberes`
- `haberes_imponibles`
- `afc_empresa`
- `mutual`
- `sis`
- `trabajo_pesado`
- `cobertura_suspension`
- `seguro_social`
- `cotizacion_expectativa_de_vida`
- `total_asignacion_familiar`
- `total_costo`
- `source_file`

Columnas principales de `fact_dotacion_mensual`:

- `fact_dotacion_id`
- `periodo_id`
- `trabajador_id`
- `sociedad_id`
- `centro_negocio_id`
- `cargo_id`
- `contrato_id`
- `estado_laboral_id`
- `periodo`
- `rut`
- `sociedad`
- `fecha_inicio_contrato`
- `antiguedad_meses`
- `headcount`
- `source_file`

### Dimensions disponibles

| Archivo | Clave | Atributos | Uso en adapter |
| --- | --- | --- | --- |
| `dimensions/dim_periodo.csv` | `periodo_id` | `periodo`, `ano`, `mes`, `nombre_mes`, `trimestre`, `semestre` | Metadata y seleccion de periodo |
| `dimensions/dim_trabajador.csv` | `trabajador_id` | `rut`, `nombre`, `apellido_paterno`, `apellido_materno` | `RUT_Trabajador`, `Nombre_Trabajador` |
| `dimensions/dim_sociedad.csv` | `sociedad_id` | `sociedad` | Base para sociedad, requiere homologacion |
| `dimensions/dim_centro_negocio.csv` | `centro_negocio_id` | `centro_negocio` | `Centro_de_Negocio` |
| `dimensions/dim_cargo.csv` | `cargo_id` | `cargo` | `Cargo` |
| `dimensions/dim_contrato.csv` | `contrato_id` | `tipo_contratacion` | `Contrato_Trabajador` |
| `dimensions/dim_estado_laboral.csv` | `estado_laboral_id` | `tipo_trabajador` | `Tipo_Trabajador` |

### Metadata disponible

| Archivo | Uso |
| --- | --- |
| `metadata/dw_v2_schema.json` | Conteo de filas, columnas disponibles, version de schema y fecha de generacion |
| `metadata/data_lineage.csv` | Trazabilidad desde `data/processed` hacia archivos DW V2 |

## Fuentes `data/processed`

`data/processed` contiene el DW V1 estable y es la fuente desde la cual se genero DW V2.

Archivos inspeccionados:

- `data/processed/fact_remuneraciones.csv`
- `data/processed/fact_dotacion.csv`
- `data/processed/dim_trabajador.csv`
- `data/processed/dim_sociedad.csv`
- `data/processed/dim_centro_negocio.csv`
- `data/processed/dim_contrato.csv`
- `data/processed/dim_periodo.csv`

Hallazgo relevante: `data/processed/dim_sociedad.csv` tambien contiene codigos de sociedad (`LCM`, `LTDA`, `SPA`, `SPA_CC`, `SPA_MC`), no nombres largos ni RUT sociedad. Por tanto, `Nombre_Sociedad`, `RUT_Sociedad` y `Empresa_Corta` no tienen equivalente completo directo en V1/V2 y requieren homologacion.

## Claves dimensionales

### Clave de integracion principal

La clave recomendada para unir remuneraciones con dotacion es:

```text
periodo_id + trabajador_id + sociedad_id + centro_negocio_id
```

Validacion exploratoria realizada:

- `fact_remuneraciones_mensual`: 1735 filas.
- `fact_dotacion_mensual`: 1739 filas.
- Duplicados en clave compuesta de remuneraciones: 0.
- Duplicados en clave compuesta de dotacion: 0.
- Filas de remuneraciones sin dotacion equivalente: 0.
- Filas de dotacion sin remuneracion equivalente: 4.

Implicacion: el adapter debe partir desde remuneraciones como base del contrato de costos y hacer left join hacia dotacion. Las 4 filas de dotacion sin remuneracion deben reportarse como advertencia, no incorporarse al JSON legacy de costos salvo que negocio defina otra regla.

### Joins propuestos

```text
fact_remuneraciones_mensual r
  left join fact_dotacion_mensual d
    on r.periodo_id = d.periodo_id
   and r.trabajador_id = d.trabajador_id
   and r.sociedad_id = d.sociedad_id
   and r.centro_negocio_id = d.centro_negocio_id

  left join dim_trabajador t
    on r.trabajador_id = t.trabajador_id

  left join dim_sociedad s
    on r.sociedad_id = s.sociedad_id

  left join dim_centro_negocio cn
    on r.centro_negocio_id = cn.centro_negocio_id

  left join dim_cargo c
    on d.cargo_id = c.cargo_id

  left join dim_contrato co
    on d.contrato_id = co.contrato_id

  left join dim_estado_laboral el
    on d.estado_laboral_id = el.estado_laboral_id
```

## Contrato legacy requerido

El dashboard actual espera un JSON con dos claves principales:

```text
metadata
records
```

### `metadata`

Campos requeridos o usados por el frontend:

- `sourceFile`
- `sheet`
- `period`
- `workerCount`
- `companyCount`
- `totalCost`
- `columns`
- `generatedAt`
- `schemaVersion`
- `sourceSheet`
- `recordCount`

### `records`

Campos legacy requeridos por filtros, KPIs, graficos, tabla y desglose:

- `RUT_Sociedad`
- `Nombre_Sociedad`
- `RUT_Trabajador`
- `Nombre_Trabajador`
- `Centro_de_Negocio`
- `Cargo`
- `Tipo_Trabajador`
- `Contrato_Trabajador`
- `Total_Haberes`
- `Haberes_Imponibles`
- `AFC_Empresa`
- `Mutual`
- `SIS`
- `Seguro_Social`
- `Expectativa_de_Vida`
- `Asignación_Familiar`
- `Total_Costo`
- `Empresa_Corta`

## Tabla de mapeo campo legacy a origen DW V2

| Campo legacy | Origen DW V2 propuesto | Regla |
| --- | --- | --- |
| `RUT_Sociedad` | Sin equivalente directo en DW V2 | Homologacion por codigo de sociedad; fallback `"Sin dato"` |
| `Nombre_Sociedad` | `dim_sociedad.sociedad` + homologacion | Convertir codigo (`LCM`, `LTDA`, etc.) a nombre corporativo largo |
| `RUT_Trabajador` | `dim_trabajador.rut` o `fact_remuneraciones_mensual.rut` | Preferir dimension; fallback a fact |
| `Nombre_Trabajador` | `dim_trabajador.nombre`, `apellido_paterno`, `apellido_materno` | Concatenar y normalizar capitalizacion |
| `Centro_de_Negocio` | `dim_centro_negocio.centro_negocio` | Fallback a `fact_remuneraciones_mensual.centro_negocio_id` si falla join |
| `Cargo` | `dim_cargo.cargo` via dotacion | Requiere join con dotacion; fallback `"Sin dato"` |
| `Tipo_Trabajador` | `dim_estado_laboral.tipo_trabajador` via dotacion | Requiere join con dotacion; normalizar capitalizacion |
| `Contrato_Trabajador` | `dim_contrato.tipo_contratacion` via dotacion | Requiere join con dotacion; normalizar capitalizacion |
| `Total_Haberes` | `fact_remuneraciones_mensual.total_haberes` | Numero entero |
| `Haberes_Imponibles` | `fact_remuneraciones_mensual.haberes_imponibles` | Numero entero |
| `AFC_Empresa` | `fact_remuneraciones_mensual.afc_empresa` | Numero entero |
| `Mutual` | `fact_remuneraciones_mensual.mutual` | Numero entero |
| `SIS` | `fact_remuneraciones_mensual.sis` | Numero entero |
| `Seguro_Social` | `fact_remuneraciones_mensual.seguro_social` | Numero entero |
| `Expectativa_de_Vida` | `fact_remuneraciones_mensual.cotizacion_expectativa_de_vida` | Numero entero |
| `Asignación_Familiar` | `fact_remuneraciones_mensual.total_asignacion_familiar` | Numero entero; mantener nombre legacy con tilde |
| `Total_Costo` | `fact_remuneraciones_mensual.total_costo` | Numero entero |
| `Empresa_Corta` | Homologacion por sociedad | Fallback derivado desde `Nombre_Sociedad` o codigo |

## Campos calculados

### `Nombre_Trabajador`

Regla propuesta:

```text
trim(nombre + " " + apellido_paterno + " " + apellido_materno)
```

Consideracion: DW V2 almacena nombres en mayuscula. El adapter puede mantener mayusculas para trazabilidad o aplicar title case para aproximarse al legacy visual. Para minima transformacion, se recomienda mantener el texto fuente y dejar una mejora visual para otra etapa.

### `Empresa_Corta`

Regla propuesta:

1. Usar tabla de homologacion si existe.
2. Si no existe, derivar desde `Nombre_Sociedad`.
3. Si solo existe codigo de sociedad, usar el codigo como fallback explicito.

Ejemplo de estructura futura de homologacion:

| sociedad | RUT_Sociedad | Nombre_Sociedad | Empresa_Corta |
| --- | --- | --- | --- |
| `LCM` | Pendiente | Pendiente | `LCM` |
| `LTDA` | Pendiente | Pendiente | `LTDA` |
| `SPA` | Pendiente | Pendiente | `SPA` |
| `SPA_CC` | Pendiente | Pendiente | `SPA CC` |
| `SPA_MC` | Pendiente | Pendiente | `SPA MC` |

### Metadata

Reglas propuestas:

| Campo metadata | Regla |
| --- | --- |
| `sourceFile` | Valor descriptivo, por ejemplo `"data/datawarehouse/v2"` |
| `sheet` | Valor compatible, por ejemplo `"DW_V2"` |
| `period` | Si se exporta un periodo: `YYYY-MM`; si son varios: rango `YYYY-MM a YYYY-MM` |
| `workerCount` | Conteo unico de `RUT_Trabajador` en records exportados |
| `companyCount` | Conteo unico de `Nombre_Sociedad` o codigo homologado |
| `totalCost` | Suma de `Total_Costo` |
| `columns` | Lista exacta de columnas legacy emitidas |
| `generatedAt` | Timestamp de ejecucion del adapter |
| `schemaVersion` | Version del contrato adapter, por ejemplo `"legacy-from-dw-v2.1"` |
| `sourceSheet` | Valor compatible, por ejemplo `"fact_remuneraciones_mensual"` |
| `recordCount` | Largo de `records` |

## Campos con fallback

| Campo | Fallback recomendado | Severidad |
| --- | --- | --- |
| `RUT_Sociedad` | `"Sin dato"` si no existe homologacion | Advertencia alta |
| `Nombre_Sociedad` | Codigo `dim_sociedad.sociedad` | Advertencia media |
| `Empresa_Corta` | Codigo `dim_sociedad.sociedad` | Advertencia media |
| `Nombre_Trabajador` | `fact_remuneraciones_mensual.rut` si no hay dimension | Error si queda vacio |
| `Centro_de_Negocio` | `centro_negocio_id` | Advertencia media |
| `Cargo` | `"Sin dato"` | Advertencia media |
| `Tipo_Trabajador` | `"Sin dato"` | Advertencia media |
| `Contrato_Trabajador` | `"Sin dato"` | Advertencia media |
| Campos monetarios | `0` solo si el campo existe pero viene vacio | Error si falta columna completa |

## Campos legacy sin equivalente directo

| Campo legacy | Motivo |
| --- | --- |
| `RUT_Sociedad` | DW V2 y `data/processed` solo exponen codigo de sociedad, no RUT |
| `Nombre_Sociedad` | DW V2 expone codigos de sociedad, no nombres legales largos |
| `Empresa_Corta` | No existe como atributo en DW V2 |

Estos campos requieren una tabla de homologacion corporativa o una regla temporal aprobada.

## Reglas de calculo necesarias

1. Usar `fact_remuneraciones_mensual` como dataset base.
2. Cruzar con dotacion por `periodo_id + trabajador_id + sociedad_id + centro_negocio_id`.
3. Enriquecer trabajador, centro, cargo, contrato y estado laboral desde dimensiones.
4. Convertir campos monetarios a numeros enteros.
5. Emitir nombres de columnas legacy exactos, incluyendo `Asignación_Familiar`.
6. Calcular metadata desde el resultado final.
7. Ordenar records de forma estable, sugerido por `periodo`, `Nombre_Sociedad`, `Centro_de_Negocio`, `Nombre_Trabajador`.
8. Si el dashboard debe seguir representando solo mantencion, aplicar filtro de centro de negocio segun regla oficial. El JSON legacy actual contiene 31 records de `MANTENCION`; DW V2 contiene multiples centros y 1735 filas de costos.

## Riesgos tecnicos

### Riesgo alto: alcance funcional distinto

El JSON legacy actual esta reducido a 31 registros de mantencion, mientras DW V2 contiene 1735 filas de remuneraciones mensuales de multiples centros y sociedades. Sin una regla de filtro, el dashboard dejara de representar el mismo universo.

### Riesgo alto: sociedad no homologada

El dashboard actual presenta nombres legales largos. DW V2 solo entrega codigos (`LCM`, `LTDA`, `SPA`, `SPA_CC`, `SPA_MC`). Esto afecta filtros, ranking por empresa, donut, tabla y `companyCount`.

### Riesgo alto: RUT sociedad ausente

No se encontro `RUT_Sociedad` en DW V2 ni en `data/processed`. Si el contrato lo debe preservar, se requiere fuente maestra externa o tabla de homologacion versionada.

### Riesgo medio: atributos laborales vienen desde dotacion

`Cargo`, `Contrato_Trabajador` y `Tipo_Trabajador` no vienen desde la fact de remuneraciones. Dependen del join con dotacion. La validacion inicial es positiva para remuneraciones, pero debe quedar automatizada.

### Riesgo medio: capitalizacion y textos

DW V2 usa valores mayormente en mayuscula; el legacy visible tiene capitalizacion tipo titulo. Esto puede afectar percepcion visual, aunque no necesariamente rompe logica.

### Riesgo medio: periodos multiples

DW V2 contiene enero a mayo 2026. El contrato legacy actual dice `"Periodo vigente"` y no modela historico en la UI. El adapter debe decidir si exporta un periodo especifico, ultimo periodo disponible o rango acumulado.

### Riesgo bajo: filas de dotacion sin remuneracion

Hay 4 filas de dotacion sin remuneracion para la misma clave compuesta. Como el contrato legacy es de costos, no deberian entrar a `records`, pero conviene reportarlas.

## Reglas de validacion

### Validaciones bloqueantes

- Existe `fact_remuneraciones_mensual.csv`.
- Existen dimensiones requeridas.
- Todas las columnas monetarias requeridas existen en remuneraciones.
- No hay duplicados en `fact_remuneraciones_mensual` para la clave compuesta.
- Cada fila de remuneraciones tiene `Total_Costo` numerico.
- Cada fila emitida tiene `RUT_Trabajador`.
- `records.length` coincide con `metadata.recordCount`.
- Suma de `records.Total_Costo` coincide con `metadata.totalCost`.
- `metadata.columns` contiene todas las columnas legacy emitidas.

### Validaciones con advertencia

- Filas de remuneraciones sin match en dotacion.
- Filas de dotacion sin match en remuneraciones.
- Sociedad sin homologacion a nombre largo.
- Sociedad sin RUT sociedad.
- Trabajador sin nombre completo.
- Cargo, contrato o tipo trabajador sin match dimensional.
- Centros de negocio fuera del universo esperado del dashboard.

### Validaciones de paridad recomendadas

Para una migracion controlada, generar un JSON paralelo y comparar contra el dashboard actual:

- Conteo de records.
- Conteo unico de trabajadores.
- Conteo unico de sociedades.
- Suma de `Total_Costo`.
- Suma de `Total_Haberes`.
- Distribucion por empresa.
- Distribucion por centro de negocio.
- Top 15 por `Total_Costo`.
- Desglose monetario.

## Propuesta de implementacion futura

### Fase 1: diseño de contrato y homologaciones

- Aprobar si el adapter exportara ultimo periodo, periodo configurable o acumulado.
- Aprobar si se filtrara `Centro_de_Negocio == MANTENCION` u otra regla equivalente en DW V2.
- Crear tabla de homologacion de sociedades con `sociedad`, `RUT_Sociedad`, `Nombre_Sociedad`, `Empresa_Corta`.

### Fase 2: script adapter offline

- Implementar script Python que lea CSVs de DW V2.
- Validar estructura y claves antes de transformar.
- Generar JSON compatible en una ruta de prueba.
- Emitir reporte de validacion junto al JSON.

### Fase 3: prueba sin tocar React

- Comparar JSON adaptado con JSON legacy.
- Ejecutar build frontend usando el contrato generado solo cuando se apruebe la sustitucion.
- Mantener `maintenanceCostService.js` intacto inicialmente.

### Fase 4: desacoplamiento frontend posterior

- Evaluar mover nombres de campos legacy fuera de componentes y hook.
- Definir un contrato frontend propio, menos dependiente de nombres heredados de Excel.
- Agregar tests de contrato para impedir regresiones silenciosas.

## Recomendacion de ubicacion del adapter

Ubicacion recomendada:

```text
backend/scripts/export_maintenance_cost_legacy_from_dw_v2.py
```

Motivos:

- Mantiene la generacion del contrato como proceso backend/offline.
- Evita incorporar joins CSV en React.
- Respeta la regla de no editar manualmente el JSON frontend.
- Permite validar y reportar errores antes de afectar la UI.

Salida recomendada para pruebas:

```text
frontend/src/data/legacy/maintenanceCostData.dw_v2_preview.json
```

Salida final posible, solo despues de aprobacion:

```text
frontend/src/data/legacy/maintenanceCostData.json
```

La sustitucion final debe hacerse exclusivamente mediante script y revision de diff, nunca por edicion manual.

## Resumen de campos mapeados

Mapeo directo o casi directo desde DW V2:

- `RUT_Trabajador`
- `Nombre_Trabajador`
- `Centro_de_Negocio`
- `Cargo`
- `Tipo_Trabajador`
- `Contrato_Trabajador`
- `Total_Haberes`
- `Haberes_Imponibles`
- `AFC_Empresa`
- `Mutual`
- `SIS`
- `Seguro_Social`
- `Expectativa_de_Vida`
- `Asignación_Familiar`
- `Total_Costo`

Mapeo pendiente de homologacion:

- `RUT_Sociedad`
- `Nombre_Sociedad`
- `Empresa_Corta`

Decision funcional pendiente:

- Periodo a exportar.
- Filtro de universo del dashboard, especialmente mantencion.
- Capitalizacion final de textos.
