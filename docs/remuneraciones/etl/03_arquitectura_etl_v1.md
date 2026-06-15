# ARQUITECTURA ETL V1

## Proyecto: Costo Remuneraciones Corporativo

**Versión:** 1.0
**Estado:** Aprobado
**Fecha:** Junio 2026

**Documento Relacionado:**

* 00_PROJECT_CHARTER_V1.md
* 01_AUDITORIA_ARQUITECTURA_V1.md
* 02_MODELO_DATOS_CORPORATIVO_V1.md

---

# 1. Objetivo

Definir la arquitectura ETL (Extract, Transform, Load) que permitirá transformar información proveniente de múltiples archivos fuente en una estructura corporativa confiable, trazable y reutilizable.

La arquitectura ETL constituye el núcleo operativo del proyecto.

Su responsabilidad será:

* Extraer datos.
* Validar información.
* Detectar errores.
* Homologar estructuras.
* Consolidar información.
* Generar datasets analíticos.
* Alimentar dashboards corporativos.

---

# 2. Principios de Diseño

La arquitectura ETL deberá cumplir los siguientes principios:

## Trazabilidad

Todo dato debe poder rastrearse hasta su archivo de origen.

---

## Repetibilidad

Una carga debe producir siempre el mismo resultado.

---

## Escalabilidad

Debe soportar crecimiento de:

* Sociedades.
* Períodos.
* Archivos.
* Indicadores.

---

## Auditoría

Toda ejecución debe generar evidencia.

---

## Calidad

La validación debe formar parte del flujo.

---

# 3. Arquitectura General

```text
ARCHIVOS FUENTE
        │
        ▼

RAW
        │
        ▼

STAGING
        │
        ▼

VALIDACIÓN
        │
        ▼

PROCESSED
        │
        ▼

KPIs
        │
        ▼

DASHBOARD
```

---

# 4. Capas ETL

La solución se divide en cuatro capas principales.

## Capa RAW

Responsabilidad:

Conservar los archivos originales.

Regla:

Los archivos no deben modificarse.

---

Ubicación:

```text
data/raw/
```

Ejemplo:

```text
data/raw/

├── remuneraciones/
│   ├── 2026_01.xlsx
│   ├── 2026_02.xlsx
│   └── 2026_03.xlsx
│
└── dotacion/
    ├── 2026_01.xlsx
    ├── 2026_02.xlsx
    └── 2026_03.xlsx
```

---

Objetivo:

Mantener evidencia histórica.

---

# 5. Capa STAGING

Responsabilidad:

Normalizar la información.

Ubicación:

```text
data/staging/
```

---

Procesos:

### Limpieza de RUT

Ejemplo:

```text
12.345.678-9
12345678-9
```

↓

```text
12345678-9
```

---

### Limpieza de nombres

Eliminar:

* espacios dobles
* caracteres extraños
* inconsistencias

---

### Normalización de fechas

Convertir:

```text
01/01/2026
01-01-2026
2026/01/01
```

↓

```text
2026-01-01
```

---

### Homologación de sociedades

Ejemplo:

```text
Pullman Bus
PULLMAN BUS
Pullman BUS
```

↓

```text
PULLMAN BUS
```

---

### Homologación de centros de costo

Aplicar catálogo maestro.

---

### Homologación de cargos

Aplicar catálogo corporativo.

---

# 6. Capa VALIDACIÓN

Responsabilidad:

Detectar errores antes de consolidar datos.

---

Ubicación lógica:

```text
etl/validate/
```

---

# 7. Reglas de Validación

## RV-001

RUT obligatorio.

---

## RV-002

Nombre obligatorio.

---

## RV-003

Sociedad obligatoria.

---

## RV-004

Centro de costo obligatorio.

---

## RV-005

Fecha ingreso válida.

---

## RV-006

Período obligatorio.

---

## RV-007

Sin duplicados.

Clave:

```text
Periodo + Rut + Sociedad
```

---

## RV-008

Montos válidos.

---

## RV-009

Totales conciliados.

---

## RV-010

Campos críticos completos.

---

# 8. Reporte de Calidad

Cada carga debe generar un reporte.

Ejemplo:

```text
Archivo:
REMUNERACIONES_2026_05.xlsx

Registros:
3.250

Válidos:
3.241

Con Error:
9

Duplicados:
2

RUT Inválido:
4

Centro Costo Vacío:
3
```

---

# 9. Capa PROCESSED

Responsabilidad:

Generar datasets listos para análisis.

---

Ubicación:

```text
data/processed/
```

---

Archivos esperados:

```text
fact_remuneraciones.parquet

fact_dotacion.parquet

dim_trabajador.parquet

dim_sociedad.parquet

dim_centro_costo.parquet

dim_cargo.parquet

dim_contrato.parquet

dim_periodo.parquet
```

---

Objetivo:

Evitar recalcular información en el dashboard.

---

# 10. Flujo de Remuneraciones

```text
Excel Remuneraciones
          │
          ▼

RAW
          │
          ▼

STAGING
          │
          ▼

Validación
          │
          ▼

FACT_REMUNERACIONES
```

---

# 11. Flujo de Dotación

```text
Excel Dotación
       │
       ▼

RAW
       │
       ▼

STAGING
       │
       ▼

Validación
       │
       ▼

FACT_DOTACION
```

---

# 12. Catálogos Maestros

La arquitectura considera catálogos corporativos.

Objetivo:

Eliminar diferencias entre archivos.

---

Catálogos previstos:

```text
dim_sociedad

dim_centro_costo

dim_cargo

dim_contrato
```

---

Beneficio:

Homologación automática.

---

# 13. Auditoría de Cargas

Cada ejecución deberá registrar:

```text
fecha_ejecucion

archivo_procesado

usuario

registros_leidos

registros_validos

registros_error

duracion
```

---

Objetivo:

Trazabilidad completa.

---

# 14. Historial de Cargas

La solución deberá permitir responder:

* ¿Qué archivo se cargó?
* ¿Cuándo?
* ¿Con qué resultado?
* ¿Cuántos errores tuvo?
* ¿Quién realizó la carga?

---

# 15. Estrategia de Actualización

Frecuencia inicial:

Mensual.

---

Proceso esperado:

```text
Recepción Archivo
        │
        ▼

Carga RAW
        │
        ▼

Validación
        │
        ▼

Procesamiento
        │
        ▼

Actualización Dashboard
```

---

# 16. Gestión de Errores

Los errores no deben detener completamente el proceso.

Clasificación:

## Críticos

Impiden carga.

Ejemplos:

* archivo corrupto
* columnas obligatorias faltantes

---

## No Críticos

Permiten continuar.

Ejemplos:

* cargo desconocido
* centro costo no homologado

---

# 17. Arquitectura Física Esperada

```text
data/

├── raw/
│
├── staging/
│
├── processed/
│
└── archive/
```

---

```text
etl/

├── extract/
│
├── transform/
│
├── validate/
│
├── load/
│
└── logs/
```

---

# 18. Evolución Futura

La arquitectura fue diseñada para soportar:

## Nuevas sociedades

Sin cambios estructurales.

---

## Nuevos períodos

Sin cambios estructurales.

---

## Nuevos indicadores

Sin rediseño del ETL.

---

## Integraciones ERP

Defontana.

---

## Automatización

Procesamiento programado.

---

## Data Warehouse

Migración futura hacia bases de datos corporativas.

---

# 19. KPIs de Calidad ETL

La plataforma deberá monitorear:

* % registros válidos.
* % registros rechazados.
* % conciliación de montos.
* % cobertura de datos.
* cantidad de duplicados.
* cantidad de errores por archivo.

---

# 20. Conclusión

La arquitectura ETL V1 establece el flujo oficial de procesamiento de datos para Costo Remuneraciones Corporativo.

Su diseño está orientado a garantizar trazabilidad, calidad, mantenibilidad y escalabilidad, permitiendo que la plataforma evolucione desde un modelo basado en archivos Excel hacia una futura arquitectura corporativa de datos sin requerir rediseños significativos.
