# Data Quality Foundation Implementation Plan

## Proyecto

**Pullman Control Mantención**

## Documento

Data Quality Foundation Implementation Plan

## Versión

v1.0

## Fecha

2026-05-29

## Estado

Aprobado

---

# Objetivo

Definir el plan técnico de implementación para completar la Data Quality Foundation identificada durante la Fase 3A.

Este documento traduce los hallazgos de Audit_007 en tareas concretas de desarrollo, manteniendo la estabilidad del sistema y minimizando riesgos operacionales.

---

# Antecedentes

Documentación relacionada:

```text
docs/audits/Audit_006_Data_Quality_Review.md

docs/data/Data_Dictionary.md

docs/data/Validation_Rules_Catalog.md

docs/architecture/Data_Quality_Framework.md

docs/roadmaps/Data_Quality_Implementation_Roadmap.md

docs/audits/Audit_007_Data_Quality_Foundation_Review.md
```

---

# Situación Actual

La auditoría técnica confirmó que el pipeline actual ya implementa gran parte de las validaciones fundamentales.

Nivel estimado de madurez:

```text
65% - 70%
```

La siguiente etapa consiste en cerrar brechas específicas sin modificar la arquitectura existente.

---

# Objetivos de Implementación

## Objetivo Principal

Completar las validaciones pendientes identificadas en Audit_007.

## Objetivos Secundarios

* Incrementar la cobertura de validación.
* Mejorar la observabilidad del pipeline.
* Generar evidencia de calidad.
* Reducir riesgo de errores silenciosos.
* Preparar futuras fases de gobernanza de datos.

---

# Alcance

La implementación se realizará exclusivamente sobre el pipeline de exportación de datos.

Archivo principal:

```text
backend/scripts/export_maintenance_cost_data.py
```

---

# Funcionalidades Incluidas

---

# Implementación 001

## VR-003 — Detección de Columnas Duplicadas

### Problema

Actualmente no existe una validación explícita para columnas duplicadas.

### Riesgo

Un encabezado duplicado podría provocar:

* sobrescritura de datos;
* comportamiento inesperado;
* errores analíticos.

### Acción

Agregar validación:

```text
Verificar unicidad de nombres de columnas.
```

### Resultado Esperado

```text
Error crítico si existen columnas duplicadas.
```

---

# Implementación 002

## VR-018 — Detección de Valores Negativos

### Problema

Los campos monetarios aceptan valores negativos.

### Riesgo

Costos negativos podrían distorsionar indicadores.

### Acción

Validar:

* Total_Haberes
* Haberes_Imponibles
* AFC_Empresa
* Mutual
* SIS
* Seguro_Social
* Expectativa_de_Vida
* Asignación_Familiar
* Total_Costo

### Resultado Esperado

```text
Generar Warning cuando existan valores negativos.
```

---

# Implementación 003

## VR-020 — Detección de Registros Duplicados

### Problema

No existe control de duplicidad.

### Riesgo

Un trabajador podría contabilizarse múltiples veces.

### Acción

Detectar duplicados utilizando:

```text
RUT_Trabajador
```

### Resultado Esperado

```text
Generar Warning de duplicidad.
```

---

# Implementación 004

## VR-021 — Validación Completa de Campos Obligatorios

### Problema

Actualmente solo se validan campos críticos.

### Acción

Extender validación a todos los campos obligatorios definidos en:

```text
Data_Dictionary.md
```

### Resultado Esperado

```text
Cobertura completa de obligatoriedad.
```

---

# Implementación 005

## Quality Report v1

### Objetivo

Generar un resumen estructurado de calidad.

### Información mínima

* Fecha de ejecución.
* Archivo procesado.
* Total registros.
* Errores críticos.
* Warnings.
* Estado final.

### Resultado Esperado

Ejemplo:

```text
Estado: ACEPTABLE

Errores críticos: 0
Warnings: 2

- 1 valor negativo detectado
- 1 trabajador duplicado detectado
```

---

# Fuera de Alcance

No forma parte de esta implementación:

* Dashboard de calidad.
* Historial persistente de validaciones.
* Alertas automáticas.
* Catálogos maestros.
* Integración con base de datos.
* Gobernanza avanzada.
* Machine Learning.
* Monitoreo continuo.

Estas iniciativas serán abordadas en fases posteriores.

---

# Estrategia de Desarrollo

## Rama Recomendada

```text
fase-3a-data-quality-foundation
```

---

## Secuencia Recomendada

### Paso 1

Implementar VR-003.

### Paso 2

Implementar VR-018.

### Paso 3

Implementar VR-020.

### Paso 4

Implementar VR-021.

### Paso 5

Implementar Quality Report v1.

### Paso 6

Ejecutar pruebas manuales.

### Paso 7

Build de validación.

### Paso 8

Merge controlado.

---

# Estrategia de Testing

Se deberán probar los siguientes escenarios:

## Escenario 1

Columna obligatoria faltante.

Resultado esperado:

```text
Proceso detenido.
```

---

## Escenario 2

Columna duplicada.

Resultado esperado:

```text
Proceso detenido.
```

---

## Escenario 3

Valor negativo.

Resultado esperado:

```text
Warning.
```

---

## Escenario 4

Trabajador duplicado.

Resultado esperado:

```text
Warning.
```

---

## Escenario 5

Archivo válido.

Resultado esperado:

```text
Exportación exitosa.
```

---

# Riesgo de Implementación

| Área       | Riesgo   |
| ---------- | -------- |
| Frontend   | Muy Bajo |
| JSON       | Bajo     |
| Pipeline   | Bajo     |
| Producción | Muy Bajo |
| Deployment | Muy Bajo |

---

# Resultado Esperado

Al finalizar esta implementación:

```text
Data Quality Foundation
≈ 85% - 90% completada
```

Beneficios:

* Mayor confiabilidad.
* Mayor trazabilidad.
* Mejor control operativo.
* Menor riesgo de errores silenciosos.

---

# Próxima Fase

Una vez completada esta implementación:

```text
Fase 3A.2 — Data Quality Reporting & Monitoring
```

---

# Control de Cambios

| Versión | Fecha      | Descripción                                 |
| ------- | ---------- | ------------------------------------------- |
| 1.0     | 2026-05-29 | Creación inicial del plan de implementación |

---

# Estado

```text
APROBADO
```

Plan oficial de implementación para la Data Quality Foundation de Pullman Control Mantención.
