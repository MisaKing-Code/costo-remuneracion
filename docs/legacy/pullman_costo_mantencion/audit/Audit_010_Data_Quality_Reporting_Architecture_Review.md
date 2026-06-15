# Audit_010 — Data Quality Reporting Architecture Review

## Proyecto

**Pullman Control Mantención**

## Fecha

2026-05-29

## Estado

Finalizado

## Objetivo

Auditar la arquitectura actual del pipeline de exportación para definir la estrategia técnica de implementación de la Fase 3A.2 — Data Quality Reporting & Monitoring.

Esta auditoría busca determinar la forma más adecuada de generar, almacenar y gestionar información de calidad de datos sin afectar la estabilidad del sistema.

---

# Alcance

Componente auditado:

```text
backend/scripts/export_maintenance_cost_data.py
```

Proceso evaluado:

```text
Excel
    ↓
Validaciones
    ↓
Exportación JSON
    ↓
Frontend
```

---

# Situación Actual

El pipeline actual ya incorpora múltiples controles de calidad.

Validaciones presentes:

* Validación de archivo oficial.
* Validación de hoja oficial.
* Validación de columnas obligatorias.
* Validación de campos críticos.
* Exclusión de registros Total.
* Detección de columnas duplicadas.
* Detección de valores negativos.
* Detección de trabajadores duplicados.

---

# Hallazgo Principal

Actualmente el pipeline ejecuta validaciones pero no conserva sus resultados.

Arquitectura actual:

```text
Validación
      ↓
Mensaje en consola
      ↓
Fin
```

Consecuencia:

```text
No existe persistencia
de la información de calidad.
```

---

# Necesidad Detectada

La siguiente etapa de madurez requiere:

```text
Validación
      ↓
Resultado estructurado
      ↓
Persistencia
      ↓
Auditoría
```

---

# Alternativas Evaluadas

## Alternativa A

### Generación Directa

Arquitectura:

```text
Validación
      ↓
Generación inmediata de reporte
```

### Ventajas

* Implementación rápida.
* Menor cantidad de código.

### Desventajas

* Escasa escalabilidad.
* Mayor acoplamiento.
* Difícil crecimiento futuro.

### Evaluación

```text
NO RECOMENDADA
```

---

## Alternativa B

### Acumulación de Resultados

Arquitectura:

```text
Validaciones
      ↓
Quality Collector
      ↓
Quality Report
```

### Ventajas

* Escalable.
* Ordenada.
* Compatible con futuras fases.
* Facilita monitoreo.

### Desventajas

* Levemente más compleja.

### Evaluación

```text
RECOMENDADA
```

---

# Arquitectura Objetivo

## Diseño Propuesto

```text
Excel
    ↓
Validation Engine
    ↓
Quality Collector
    ↓
Quality Report Generator
    ↓
JSON Principal
```

---

# Componentes

## Validation Engine

Responsabilidad:

```text
Ejecutar reglas de calidad.
```

Incluye:

* VR-001 a VR-024.

---

## Quality Collector

Responsabilidad:

```text
Acumular resultados.
```

Tipos:

* Critical Errors
* Warnings
* Informational

---

## Quality Report Generator

Responsabilidad:

```text
Persistir resultados.
```

Salida:

```text
data_quality_report.json
```

---

# Ubicación Recomendada

Archivo:

```text
data/data_quality_report.json
```

Justificación:

* Cercanía a la fuente.
* Independencia del frontend.
* Facilita auditorías futuras.

---

# Estructura Recomendada

## Metadata

* generatedAt
* sourceFile
* sourceSheet
* recordCount

---

## Estado

* EXCELLENT
* ACCEPTABLE
* REJECTED

---

## Resultados

* criticalErrors
* warnings
* informational

---

## Detalles

Lista de mensajes generados durante la ejecución.

---

# Compatibilidad

## Frontend

Impacto esperado:

```text
Ninguno
```

---

## Dataset Principal

Impacto esperado:

```text
Ninguno
```

---

## Producción

Impacto esperado:

```text
Muy Bajo
```

---

# Riesgos Identificados

## Riesgo 001

Duplicación de lógica de validación.

Mitigación:

```text
Centralizar captura de resultados.
```

---

## Riesgo 002

Acoplamiento entre reporte y exportación.

Mitigación:

```text
Mantener componentes separados.
```

---

## Riesgo 003

Generación de reportes inconsistentes.

Mitigación:

```text
Definir esquema único.
```

---

# Beneficios Esperados

* Evidencia persistente.
* Mejor trazabilidad.
* Auditorías simplificadas.
* Preparación para monitoreo.
* Base para Quality History.
* Base para Dashboard de Calidad.

---

# Nivel de Madurez Esperado

## Situación Actual

```text
85% - 90%
```

---

## Después de Fase 3A.2

```text
90% - 95%
```

---

# Conclusión

La arquitectura actual permite incorporar reportabilidad de calidad sin cambios significativos en la estructura del sistema.

La estrategia recomendada consiste en implementar un mecanismo de recolección de resultados y generación de reportes desacoplado del dataset principal.

Esta aproximación maximiza la escalabilidad y minimiza el riesgo operacional.

---

# Recomendación

Aprobar implementación de:

```text
Quality Collector
+
Quality Report v1
```

como primera iteración de observabilidad de calidad de datos.

---

# Próximo Entregable

```text
docs/roadmap/Data_Quality_Reporting_Architecture_Plan.md
```

Documento técnico que definirá la implementación exacta para la rama:

```text
fase-3a-reporting-monitoring
```

---

# Control de Cambios

| Versión | Fecha      | Descripción                      |
| ------- | ---------- | -------------------------------- |
| 1.0     | 2026-05-29 | Creación inicial de la auditoría |

---

# Estado

```text
APROBADA
```

La arquitectura propuesta se considera adecuada para iniciar la implementación de la Fase 3A.2.
