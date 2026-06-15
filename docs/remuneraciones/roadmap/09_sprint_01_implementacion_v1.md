# SPRINT 01 — IMPLEMENTACIÓN V1

## Proyecto: Costo Remuneraciones Corporativo

**Versión:** 1.0
**Estado:** Listo para Ejecución
**Fecha:** Junio 2026
**Tipo:** Sprint Técnico Inicial

---

# 1. Objetivo del Sprint

Preparar la base técnica del proyecto para iniciar la implementación real de Costo Remuneraciones Corporativo V1.

Este sprint no tiene como objetivo construir el dashboard final, sino dejar el repositorio listo para comenzar el desarrollo del ETL, los datasets procesados y la conexión posterior con el frontend.

---

# 2. Contexto

El proyecto ya completó la fase de arquitectura, auditoría y preparación inicial.

Se encuentran finalizados:

* Project Charter V1.
* Auditoría de Arquitectura V1.
* Modelo de Datos Corporativo V1.
* Arquitectura ETL V1.
* Estrategia de Migración V1.
* Roadmap & Backlog V1.
* Auditoría Funcional de Datos V1.
* Diccionario de Datos Corporativo V1.
* Auditoría Técnica Repositorio V1.

Además, ya se realizó una primera refactorización estructural:

* Se aisló legacy de Mantención.
* Se creó estructura raw corporativa.
* Se preparó carpeta metadata.
* Se reorganizaron archivos fuente por dataset, año y mes.

---

# 3. Alcance del Sprint

## Incluye

* Validar estructura actual del repositorio.
* Crear base ETL V1.
* Crear configuración corporativa inicial.
* Crear catálogos metadata base.
* Crear scripts iniciales de lectura de archivos.
* Preparar procesamiento de remuneraciones.
* Preparar procesamiento de dotación.
* Generar logs básicos de ejecución.

## No Incluye

* Dashboard final.
* Diseño visual nuevo.
* Autenticación avanzada.
* Integración Defontana.
* Automatización programada.
* Base de datos externa.
* Roles y permisos reales.

---

# 4. Estructura Técnica Objetivo

## Backend

```text
backend/
│
├── legacy/
│
├── etl/
│   ├── extract/
│   ├── transform/
│   ├── validate/
│   └── load/
│
├── config/
└── logs/
```

## Data

```text
data/
│
├── raw/
│   ├── remuneraciones/
│   │   └── 2026/
│   │       ├── 01/
│   │       ├── 02/
│   │       ├── 03/
│   │       ├── 04/
│   │       └── 05/
│   │
│   └── dotacion/
│       └── 2026/
│           ├── 01/
│           ├── 02/
│           ├── 03/
│           ├── 04/
│           └── 05/
│
├── staging/
├── processed/
├── quality/
├── archive/
├── metadata/
└── logs/
```

---

# 5. Entregables del Sprint

## E01 — Configuración Corporativa

Crear archivo de configuración central para sociedades, rutas y períodos.

Ubicación sugerida:

```text
backend/config/settings.py
```

Debe incluir:

* Rutas base.
* Sociedades válidas.
* Datasets disponibles.
* Año inicial.
* Meses disponibles.
* Configuración de logs.

---

## E02 — Catálogo de Sociedades

Crear archivo:

```text
data/metadata/sociedades.csv
```

Campos sugeridos:

```text
sociedad_id,nombre_sociedad,nombre_archivo,estado
```

Valores iniciales:

```text
LCM,Luis Marcelino Cordero Martini,LCM,activo
LTDA,Pullman San Luis Limitada,LTDA,activo
SPA,Pullman San Luis SpA,SPA,activo
SPA_CC,Pullman Cargo Control SpA,SPA_CC,activo
SPA_MC,Pullman Minera Cargo SpA,SPA_MC,activo
```

Los nombres formales podrán ajustarse posteriormente.

---

## E03 — Extractor Remuneraciones

Crear script inicial:

```text
backend/etl/extract/extract_remuneraciones.py
```

Responsabilidad:

* Leer archivos Excel desde `data/raw/remuneraciones/`.
* Detectar sociedad desde nombre de archivo.
* Detectar año y mes desde ruta.
* Extraer datos desde la hoja correspondiente.
* Normalizar encabezados.
* Devolver dataframe consolidado.

---

## E04 — Extractor Dotación

Crear script inicial:

```text
backend/etl/extract/extract_dotacion.py
```

Responsabilidad:

* Leer archivos Excel desde `data/raw/dotacion/`.
* Detectar sociedad desde nombre de archivo.
* Detectar año y mes desde ruta.
* Leer hoja `Dotación`.
* Considerar encabezado real en fila 9.
* Normalizar encabezados.
* Devolver dataframe consolidado.

---

## E05 — Transformaciones Base

Crear scripts:

```text
backend/etl/transform/transform_remuneraciones.py
backend/etl/transform/transform_dotacion.py
```

Responsabilidad:

* Convertir nombres de columnas a `snake_case`.
* Crear campo `periodo`.
* Crear campo `sociedad`.
* Normalizar RUT.
* Normalizar textos.
* Convertir montos a numérico.
* Convertir fechas a formato estándar.

---

## E06 — Validaciones Base

Crear scripts:

```text
backend/etl/validate/validate_remuneraciones.py
backend/etl/validate/validate_dotacion.py
```

Validaciones mínimas:

* RUT obligatorio.
* Sociedad obligatoria.
* Período obligatorio.
* Centro de negocio obligatorio.
* Duplicados por `periodo + rut + sociedad`.
* Monto total costo mayor o igual a cero.
* Fecha inicio contrato válida.

---

## E07 — Loader Processed

Crear script:

```text
backend/etl/load/load_processed.py
```

Responsabilidad:

* Exportar datasets procesados.
* Guardar archivos en `data/processed/`.
* Generar archivos CSV iniciales.

Archivos esperados:

```text
fact_remuneraciones.csv
fact_dotacion.csv
dim_trabajador.csv
dim_sociedad.csv
dim_centro_negocio.csv
dim_contrato.csv
dim_periodo.csv
```

---

## E08 — Pipeline Principal

Crear script:

```text
backend/etl/run_pipeline.py
```

Responsabilidad:

* Ejecutar flujo completo.
* Procesar remuneraciones.
* Procesar dotación.
* Ejecutar validaciones.
* Exportar processed.
* Generar reporte de calidad.

---

# 6. Criterios de Aceptación

El Sprint 01 será considerado completo cuando:

* El proyecto mantenga la estructura definida.
* Los archivos raw puedan ser leídos automáticamente.
* Se consoliden remuneraciones enero-mayo 2026.
* Se consolide dotación enero-mayo 2026.
* Se generen datasets processed en CSV.
* Se generen reportes básicos de calidad.
* No existan dependencias activas del dataset de Mantención.
* El código legacy permanezca aislado.

---

# 7. Riesgos

## R01 — Encabezados Excel variables

Mitigación:

Configurar lectura por dataset.

---

## R02 — Nombres de sociedades inconsistentes

Mitigación:

Derivar sociedad desde archivo y validar contra catálogo.

---

## R03 — Fechas con formatos mixtos

Mitigación:

Transformación robusta con manejo de errores.

---

## R04 — Campos faltantes

Mitigación:

Validación previa antes de procesar.

---

# 8. Orden de Ejecución Recomendado

```text
1. Crear configuración base.
2. Crear catálogo sociedades.
3. Crear extractor remuneraciones.
4. Crear extractor dotación.
5. Crear transformaciones.
6. Crear validaciones.
7. Crear loader processed.
8. Crear run_pipeline.py.
9. Ejecutar prueba enero 2026.
10. Ejecutar prueba enero-mayo 2026.
```

---

# 9. Prompt Base para Codex

```text
Actúa como desarrollador senior Python y arquitecto ETL del proyecto Costo Remuneraciones Corporativo.

Contexto:
El proyecto ya cuenta con documentación de arquitectura, modelo de datos, ETL, migración y auditorías. No rediseñes la arquitectura. Implementa únicamente el Sprint 01.

Objetivo:
Crear la base ETL V1 para procesar archivos Excel de remuneraciones y dotación desde data/raw hacia data/processed.

Instrucciones:
1. Respeta la estructura existente del repositorio.
2. No elimines documentación.
3. No elimines legacy.
4. No modifiques frontend salvo que sea estrictamente necesario.
5. Crea configuración en backend/config.
6. Crea extractores en backend/etl/extract.
7. Crea transformaciones en backend/etl/transform.
8. Crea validaciones en backend/etl/validate.
9. Crea loader en backend/etl/load.
10. Crea pipeline principal en backend/etl/run_pipeline.py.
11. Usa pandas y openpyxl.
12. Genera archivos CSV en data/processed.
13. Genera reportes de calidad en data/quality.
14. Asegura manejo de errores claro.
15. Documenta brevemente funciones principales.

Datasets:
- Remuneraciones: data/raw/remuneraciones/{año}/{mes}/
- Dotación: data/raw/dotacion/{año}/{mes}/

Sociedad:
Debe derivarse desde el nombre del archivo:
LCM, LTDA, SPA, SPA_CC, SPA_MC.

Archivos esperados de salida:
- fact_remuneraciones.csv
- fact_dotacion.csv
- dim_trabajador.csv
- dim_sociedad.csv
- dim_centro_negocio.csv
- dim_contrato.csv
- dim_periodo.csv

Criterio final:
El pipeline debe poder ejecutarse y generar datasets processed consolidados para enero-mayo 2026.
```

---

# 10. Conclusión

Sprint 01 marca el inicio formal de la implementación técnica de Costo Remuneraciones Corporativo V1.

Su objetivo es construir la primera base operativa del ETL corporativo, manteniendo la arquitectura definida y preparando los datasets que alimentarán posteriormente el dashboard ejecutivo.
