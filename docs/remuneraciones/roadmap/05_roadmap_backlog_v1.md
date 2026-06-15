# ROADMAP & BACKLOG V1

## Proyecto: Costo Remuneraciones Corporativo

**Versión:** 1.0
**Estado:** Aprobado
**Fecha:** Junio 2026

**Documentos Relacionados**

* 00_PROJECT_CHARTER_V1.md
* 01_AUDITORIA_ARQUITECTURA_V1.md
* 02_MODELO_DATOS_CORPORATIVO_V1.md
* 03_ARQUITECTURA_ETL_V1.md
* 04_ESTRATEGIA_MIGRACION_V1.md

---

# 1. Visión del Producto

Costo Remuneraciones Corporativo será la plataforma oficial de análisis de costos laborales de Pullman San Luis.

Su propósito es consolidar información de remuneraciones y dotación para proporcionar una visión corporativa, confiable y trazable de los costos asociados a la gestión de personas.

La solución deberá evolucionar progresivamente desde un dashboard analítico basado en Excel hacia una plataforma corporativa escalable.

---

# 2. Objetivo de la Versión V1

La primera versión tiene como objetivo construir una plataforma mínima funcional que permita:

* Consolidar información de 5 sociedades.
* Analizar remuneraciones.
* Analizar dotación.
* Visualizar costos laborales.
* Controlar calidad de datos.
* Entregar indicadores ejecutivos.

---

# 3. Alcance V1

Incluye:

## Costos Laborales

* Costo total.
* Costo por sociedad.
* Costo por centro de costo.
* Evolución mensual.

---

## Remuneraciones

* Haberes.
* Descuentos.
* Líquido.
* Costo empresa.

---

## Dotación

* Dotación activa.
* Tipo de contrato.
* Tipo de contratación.
* Antigüedad.

---

## Calidad de Datos

* Validaciones.
* Duplicados.
* Inconsistencias.
* Reporte de carga.

---

## Dashboard Ejecutivo

* KPIs corporativos.
* Tendencias.
* Comparativos.

---

# 4. Roadmap General

```text
FASE 0
Arquitectura

FASE 1
Preparación Datos

FASE 2
ETL

FASE 3
Dashboard

FASE 4
Calidad y Auditoría

FASE 5
Producción
```

---

# 5. Estado Actual

Estado:

```text
Arquitectura y Diseño
```

Avance estimado:

| Área                   | Avance |
| ---------------------- | -----: |
| Project Charter        |   100% |
| Auditoría Arquitectura |   100% |
| Modelo Datos           |   100% |
| Arquitectura ETL       |   100% |
| Estrategia Migración   |   100% |
| Implementación         |     0% |
| Dashboard              |     0% |
| Validaciones           |     0% |

---

# 6. FASE 0 — Arquitectura

## Objetivo

Definir los pilares del proyecto antes de escribir código.

## Entregables

* Project Charter.
* Auditoría Arquitectura.
* Modelo de Datos.
* Arquitectura ETL.
* Estrategia Migración.
* Roadmap.

## Estado

Completado.

---

# 7. FASE 1 — Preparación de Datos

## Objetivo

Organizar y comprender completamente las fuentes de información.

---

## Historias de Usuario

### HU-001

Como analista

Quiero identificar todas las columnas disponibles

Para construir el modelo de datos definitivo.

---

### HU-002

Como analista

Quiero homologar nombres de sociedades

Para evitar inconsistencias.

---

### HU-003

Como analista

Quiero homologar centros de costo

Para permitir comparaciones corporativas.

---

### HU-004

Como analista

Quiero homologar cargos

Para generar indicadores consistentes.

---

## Entregables

* Diccionario de datos.
* Catálogo sociedades.
* Catálogo centros costo.
* Catálogo cargos.
* Matriz de homologación.

---

# 8. FASE 2 — ETL

## Objetivo

Construir la primera versión operativa de procesamiento de datos.

---

## Historias de Usuario

### HU-005

Como sistema

Quiero leer archivos de remuneraciones

Para procesarlos automáticamente.

---

### HU-006

Como sistema

Quiero leer archivos de dotación

Para consolidar trabajadores.

---

### HU-007

Como sistema

Quiero validar datos críticos

Para evitar errores de análisis.

---

### HU-008

Como sistema

Quiero generar datasets procesados

Para alimentar el dashboard.

---

## Entregables

* Estructura raw.
* Estructura staging.
* Estructura processed.
* Validaciones.
* Logs de carga.

---

# 9. FASE 3 — Dashboard

## Objetivo

Construir la primera versión visual de la plataforma.

---

## Módulos

### Inicio Ejecutivo

KPIs corporativos.

---

### Costos Laborales

Análisis económico.

---

### Remuneraciones

Detalle de pagos.

---

### Dotación

Composición organizacional.

---

### Sociedades

Comparativo corporativo.

---

### Centros de Costo

Análisis organizacional.

---

## Entregables

* Layout corporativo.
* Navegación.
* Filtros globales.
* KPIs.
* Visualizaciones.

---

# 10. FASE 4 — Calidad y Auditoría

## Objetivo

Incorporar control de calidad sobre los datos.

---

## Historias de Usuario

### HU-009

Como analista

Quiero visualizar errores de carga

Para corregir información.

---

### HU-010

Como analista

Quiero monitorear calidad

Para asegurar confiabilidad.

---

### HU-011

Como administrador

Quiero mantener historial de cargas

Para garantizar trazabilidad.

---

## Entregables

* Dashboard calidad.
* Dashboard auditoría.
* Registro cargas.
* Reportes inconsistencias.

---

# 11. FASE 5 — Producción

## Objetivo

Liberar la versión estable.

---

## Actividades

* Pruebas funcionales.
* Validación usuarios.
* Corrección hallazgos.
* Optimización.
* Despliegue final.

---

## Resultado

Costo Remuneraciones Corporativo V1.

---

# 12. Backlog Priorizado

## PRIORIDAD CRÍTICA

### BL-001

Crear diccionario de datos.

---

### BL-002

Auditar estructura de archivos Excel.

---

### BL-003

Definir catálogos maestros.

---

### BL-004

Diseñar estructura física de datos.

---

### BL-005

Preparar arquitectura del repositorio.

---

# PRIORIDAD ALTA

### BL-006

Construir ETL Remuneraciones.

---

### BL-007

Construir ETL Dotación.

---

### BL-008

Construir validaciones.

---

### BL-009

Construir datasets procesados.

---

### BL-010

Diseñar dashboard ejecutivo.

---

# PRIORIDAD MEDIA

### BL-011

Dashboard de calidad.

---

### BL-012

Dashboard auditoría.

---

### BL-013

Roles y permisos.

---

### BL-014

Documentación operativa.

---

# PRIORIDAD FUTURA

### BL-015

Integración Defontana.

---

### BL-016

Automatización cargas.

---

### BL-017

Proyecciones de costos.

---

### BL-018

Indicadores avanzados RRHH.

---

# 13. Métricas de Éxito

La versión V1 será considerada exitosa cuando:

## Datos

* 100% de sociedades incorporadas.
* Datos consolidados correctamente.

---

## Calidad

* Menos de 1% de errores críticos.

---

## Dashboard

* KPIs consistentes.
* Navegación estable.

---

## Negocio

* Reducción significativa de análisis manual.
* Disponibilidad de indicadores corporativos.

---

# 14. Riesgos del Roadmap

## Riesgo 1

Calidad insuficiente de archivos fuente.

---

## Riesgo 2

Inconsistencias entre sociedades.

---

## Riesgo 3

Cambios de alcance durante implementación.

---

## Riesgo 4

Subestimación del esfuerzo ETL.

---

# 15. Próxima Actividad Oficial

Antes de escribir código deberá completarse:

```text
AUDITORÍA FUNCIONAL DE DATOS V1
```

Objetivo:

* Revisar estructura real de los archivos.
* Confirmar columnas.
* Confirmar granularidad.
* Validar compatibilidad con el modelo de datos.

Esta auditoría será la última actividad de análisis antes de iniciar la implementación técnica.

---

# 16. Conclusión

Con la aprobación de este Roadmap queda formalmente cerrada la fase de definición estratégica y arquitectura del proyecto.

A partir de este punto, toda implementación deberá alinearse con los principios, estructuras y decisiones documentadas en los documentos fundacionales del proyecto.

La siguiente etapa corresponde a la Auditoría Funcional de Datos V1, la cual validará las fuentes reales y permitirá iniciar la construcción controlada de la plataforma.
