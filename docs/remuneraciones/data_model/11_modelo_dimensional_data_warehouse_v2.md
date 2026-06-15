# MODELO DIMENSIONAL DATA WAREHOUSE V2

## Proyecto: Costo Remuneraciones Corporativo

**Version:** 2.0  
**Estado:** Implementacion paralela Sprint 03  
**Fecha:** Junio 2026  

**Documentos relacionados**

* 02_modelo_datos_corporativo_v1.md
* 03_arquitectura_etl_v1.md
* 07_diccionario_datos_corporativo_v1.md
* 10_auditoria_funcional_data_warehouse_v1.md

---

# 1. Objetivo

Documentar el Data Warehouse Corporativo V2 construido para el proyecto Costo Remuneraciones Corporativo.

El objetivo de V2 es crear una capa dimensional paralela, mas preparada para analisis BI, sin reemplazar el Data Warehouse V1 ni romper el Dashboard Corporativo V1.

DW V2 toma como fuente los archivos CSV aprobados en `data/processed/` y genera facts, dimensiones y metadata en `data/datawarehouse/v2/`.

---

# 2. Alcance del Sprint

El Sprint 03 contempla:

* Crear una estructura dimensional paralela.
* Generar claves deterministicas estables.
* Separar facts y dimensiones.
* Mantener trazabilidad hacia `data/processed/`.
* Calcular metricas disponibles desde las fuentes actuales.
* Documentar limitaciones conocidas para evolucion futura.

Fuera de alcance:

* Modificar frontend.
* Modificar el JSON legacy del dashboard.
* Reemplazar `data/processed/`.
* Inventar campos no disponibles en las fuentes, como horas extra o ausentismo.
* Migrar el Dashboard V1 para consumir DW V2 directamente.

---

# 3. Arquitectura de Capas

La arquitectura vigente queda organizada en tres capas compatibles.

```text
data/raw/
   origen Excel auditado

data/processed/
   DW V1 estable y aprobado

data/datawarehouse/v2/
   DW V2 dimensional paralelo

frontend/src/data/legacy/maintenanceCostData.json
   contrato legacy protegido para Dashboard V1
```

## data/processed como DW V1 estable

`data/processed/` conserva el contrato aprobado del Data Warehouse V1. No debe reemplazarse para implementar V2.

Contiene:

* `fact_remuneraciones.csv`
* `fact_dotacion.csv`
* `dim_trabajador.csv`
* `dim_sociedad.csv`
* `dim_centro_negocio.csv`
* `dim_contrato.csv`
* `dim_periodo.csv`

## data/datawarehouse/v2 como DW V2 paralelo

`data/datawarehouse/v2/` contiene el modelo dimensional nuevo. Se genera desde `data/processed/` mediante script reutilizable.

## Dashboard legacy protegido

El Dashboard Corporativo V1 sigue consumiendo el JSON legacy existente. DW V2 no cambia ese contrato.

---

# 4. Estructura de Carpetas Generada

```text
data/datawarehouse/v2/

├── facts/
│   ├── fact_remuneraciones_mensual.csv
│   └── fact_dotacion_mensual.csv
│
├── dimensions/
│   ├── dim_periodo.csv
│   ├── dim_trabajador.csv
│   ├── dim_sociedad.csv
│   ├── dim_centro_negocio.csv
│   ├── dim_cargo.csv
│   ├── dim_contrato.csv
│   └── dim_estado_laboral.csv
│
└── metadata/
    ├── dw_v2_schema.json
    └── data_lineage.csv
```

---

# 5. Modelo Dimensional V2

DW V2 utiliza una estructura de facts y dimensiones.

```text
                         dim_periodo
                              │
                              │
dim_sociedad ───── fact_remuneraciones_mensual ───── dim_trabajador
                              │
                              │
                      dim_centro_negocio


                         dim_periodo
                              │
                              │
dim_sociedad ───────── fact_dotacion_mensual ──────── dim_trabajador
                              │
                              │
                      dim_centro_negocio
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
      dim_cargo          dim_contrato      dim_estado_laboral
```

El modelo separa entidades organizacionales y laborales para permitir segmentaciones posteriores, manteniendo el grano mensual por trabajador, sociedad y centro de negocio.

---

# 6. Facts

## fact_remuneraciones_mensual

Almacena costos mensuales por trabajador, sociedad y centro de negocio.

Campos principales:

* `fact_remuneracion_id`
* `periodo_id`
* `trabajador_id`
* `sociedad_id`
* `centro_negocio_id`
* `periodo`
* `rut`
* `sociedad`
* `ano`
* `mes`
* `total_haberes`
* `haberes_imponibles`
* `afc_empresa`
* `mutual`
* `sis`
* `trabajo_pesado`
* `cobertura_suspension`
* `seguro_social`
* `cotizacion_expectativa_de_vida`
* `total_asignacion_familiar`
* `total_costo`
* `source_file`

## fact_dotacion_mensual

Almacena snapshot mensual de dotacion por trabajador, sociedad y centro de negocio.

Campos principales:

* `fact_dotacion_id`
* `periodo_id`
* `trabajador_id`
* `sociedad_id`
* `centro_negocio_id`
* `cargo_id`
* `contrato_id`
* `estado_laboral_id`
* `periodo`
* `rut`
* `sociedad`
* `fecha_inicio_contrato`
* `antiguedad_meses`
* `headcount`
* `source_file`

---

# 7. Dimensiones

## dim_periodo

Dimension temporal mensual.

Campos:

* `periodo_id`
* `periodo`
* `ano`
* `mes`
* `nombre_mes`
* `trimestre`
* `semestre`

## dim_trabajador

Dimension maestra basica de trabajador.

Campos:

* `trabajador_id`
* `rut`
* `nombre`
* `apellido_paterno`
* `apellido_materno`

## dim_sociedad

Dimension basica de sociedad.

Campos:

* `sociedad_id`
* `sociedad`

Observacion: en V2 inicial solo contiene el codigo de sociedad disponible en DW V1.

## dim_centro_negocio

Dimension de centros de negocio detectados.

Campos:

* `centro_negocio_id`
* `centro_negocio`

## dim_cargo

Dimension de cargos detectados en dotacion.

Campos:

* `cargo_id`
* `cargo`

## dim_contrato

Dimension de tipo de contratacion.

Campos:

* `contrato_id`
* `tipo_contratacion`

## dim_estado_laboral

Dimension de tipo o estado laboral del trabajador.

Campos:

* `estado_laboral_id`
* `tipo_trabajador`

---

# 8. Grano de Facts

## fact_remuneraciones_mensual

Grano esperado:

```text
1 fila por trabajador_id + periodo_id + sociedad_id + centro_negocio_id
```

Representa el costo laboral mensual del trabajador en una sociedad y centro de negocio.

## fact_dotacion_mensual

Grano esperado:

```text
1 fila por trabajador_id + periodo_id + sociedad_id + centro_negocio_id
```

Representa la presencia del trabajador en la dotacion mensual de una sociedad y centro de negocio.

---

# 9. Claves Deterministicas

DW V2 no usa indices volatiles.

Las claves se generan de forma deterministica desde valores naturales normalizados.

Ejemplos:

```text
trabajador_id       = TRAB_<rut_normalizado>
sociedad_id         = SOC_<sociedad>
periodo_id          = PER_<yyyymm>
centro_negocio_id   = CEN_<slug>_<hash>
cargo_id            = CAR_<slug>_<hash>
contrato_id         = CON_<slug>_<hash>
estado_laboral_id   = EST_<slug>_<hash>
```

El hash corto se utiliza para reducir riesgo de colision entre textos similares.

---

# 10. Reglas de Calculo

## headcount

En `fact_dotacion_mensual`:

```text
headcount = 1
```

Cada fila representa un trabajador presente en la dotacion mensual.

## antiguedad_meses

Se calcula desde:

```text
fecha_inicio_contrato
periodo
```

La referencia mensual es el primer dia del periodo.

Formula conceptual:

```text
(ano_periodo - ano_inicio) * 12 + (mes_periodo - mes_inicio)
```

Los valores negativos se ajustan a cero.

## total_costo

Proviene desde `data/processed/fact_remuneraciones.csv`.

No se recalcula en DW V2.

## total_haberes

Proviene desde `data/processed/fact_remuneraciones.csv`.

No se recalcula en DW V2.

---

# 11. Lineage

DW V2 genera metadata de linaje en:

```text
data/datawarehouse/v2/metadata/data_lineage.csv
```

El archivo documenta:

* dataset generado
* capa fuente
* archivos fuente
* ruta destino
* fecha de generacion

La fuente oficial de V2 es:

```text
data/processed/
```

No se reprocesa `data/raw/` directamente en esta etapa.

---

# 12. Validaciones Aplicadas

Durante la generacion y auditoria de DW V2 se valida:

* Existencia de archivos fuente en `data/processed/`.
* Unicidad de IDs en dimensiones.
* Ausencia de claves nulas en facts.
* Integridad referencial entre facts y dimensiones.
* Grano mensual sin duplicados para ambas facts.
* `total_costo` sin nulos.
* `total_haberes` sin nulos.
* `headcount` siempre igual a 1.
* `antiguedad_meses` sin nulos y no negativa.
* Metadata de schema con todos los datasets generados.
* Lineage con origen y destino de cada dataset principal.

---

# 13. Limitaciones Conocidas

## Remuneraciones sin cargo ni contrato

`fact_remuneraciones_mensual` no contiene `cargo_id`, `contrato_id` ni `estado_laboral_id`, porque la fuente V1 de remuneraciones no trae esos campos directamente.

Los analisis de costo por cargo o contrato requieren una regla oficial de cruce con dotacion.

## dim_sociedad incompleta

`dim_sociedad` contiene codigo de sociedad, pero no incluye aun:

* RUT sociedad
* nombre legal
* grupo empresarial
* estado

## Cargos con variantes o typos

`dim_cargo` refleja los cargos detectados en las fuentes. Aun no existe homologacion corporativa de cargos.

## Sin horas extra ni ausentismo

DW V2 no incluye horas extra ni ausentismo porque no existen fuentes aprobadas para esos dominios en esta etapa.

No se inventan datos.

---

# 14. Riesgos BI

## Costos por cargo

Como remuneraciones no trae `cargo_id`, un KPI de costo por cargo debe cruzar remuneraciones con dotacion por:

```text
trabajador_id + periodo_id + sociedad_id
```

Debe definirse que ocurre si un trabajador cambia de cargo dentro del periodo o si hay diferencias entre dotacion y remuneraciones.

## Costos por contrato

Mismo riesgo que costo por cargo. El contrato proviene de dotacion, no de remuneraciones.

## Historico de trabajador

`dim_trabajador` no es historica. Para analisis longitudinal de cambios de sociedad, cargo o estado laboral, se requerira una dimension historica o snapshot trabajador-periodo.

## Calidad semantica de catalogos

Sin homologacion de cargos y centros de negocio, los rankings BI pueden fragmentarse por diferencias de escritura.

---

# 15. Recomendaciones Futuras

## Adapter DW V2 a Dashboard V1

Crear una capa adapter que transforme DW V2 al contrato JSON que hoy consume el Dashboard V1.

Esto permitiria migrar gradualmente sin romper la UI.

## Homologacion de cargos

Crear catalogo maestro de cargos con:

* `cargo_id`
* `cargo_original`
* `cargo_homologado`
* familia de cargo
* nivel
* estado

## Enriquecimiento de sociedad

Completar `dim_sociedad` con informacion corporativa:

* RUT sociedad
* nombre legal
* nombre corto
* grupo empresarial
* estado

## SCD o snapshot trabajador-periodo

Evaluar una dimension historica o snapshot mensual que permita conservar cambios laborales por periodo.

## Facts futuras

Cuando existan fuentes aprobadas, incorporar:

* fact_ausentismo_mensual
* fact_horas_extra_mensual
* indicadores de licencias, permisos, vacaciones y horas trabajadas

---

# 16. Comando de Generacion

```bash
python -m backend.scripts.build_datawarehouse_v2
```

---

# 17. Conclusion

DW V2 establece una base dimensional paralela, auditable y compatible con el estado actual del proyecto.

Su implementacion mejora la preparacion analitica sin afectar DW V1 ni el Dashboard V1. Las limitaciones actuales son conocidas y se relacionan principalmente con ausencia de fuentes para cargos en remuneraciones, catalogos maestros incompletos y falta de dominios futuros como ausentismo y horas extra.
