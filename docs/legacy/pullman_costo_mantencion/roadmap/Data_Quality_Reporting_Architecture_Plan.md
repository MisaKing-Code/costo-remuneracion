# Data Quality Reporting Architecture Plan

## Proyecto

**Pullman Control Mantención**

## Documento

Data Quality Reporting Architecture Plan

## Versión

v1.0

## Fecha

2026-05-29

## Estado

Aprobado

---

# Objetivo

Definir la implementación técnica de la Fase 3A.2 — Data Quality Reporting & Monitoring.

Este documento transforma los hallazgos de Audit_009 y Audit_010 en especificaciones concretas para desarrollo.

---

# Antecedentes

Documentación relacionada:

```text
Audit_006_Data_Quality_Review.md

Audit_007_Data_Quality_Foundation_Review.md

Audit_008_Data_Quality_Foundation_Implementation.md

Audit_009_Data_Quality_Reporting_Review.md

Audit_010_Data_Quality_Reporting_Architecture_Review.md

Data_Quality_Framework.md
```

---

# Objetivo de la Implementación

Agregar observabilidad y persistencia a las validaciones existentes sin modificar:

* Frontend.
* JSON principal.
* Flujo de despliegue.
* Arquitectura actual.

---

# Alcance

Archivo principal:

```text
backend/scripts/export_maintenance_cost_data.py
```

---

# Componente 1

## Quality Collector

### Responsabilidad

Capturar todos los resultados generados por las validaciones.

---

### Categorías

#### Critical Errors

Errores que detienen la exportación.

Ejemplos:

* Hoja inexistente.
* Columna obligatoria faltante.
* Columna duplicada.

---

#### Warnings

Advertencias que permiten continuar.

Ejemplos:

* Valores negativos.
* Trabajadores duplicados.

---

#### Informational

Eventos informativos.

Inicialmente:

```text
Sin uso.
```

Preparado para futuras fases.

---

# Componente 2

## Quality Status Engine

### Responsabilidad

Determinar estado final de calidad.

---

### Reglas

#### EXCELLENT

```text
criticalErrors = 0
warnings = 0
```

---

#### ACCEPTABLE

```text
criticalErrors = 0
warnings > 0
```

---

#### REJECTED

```text
criticalErrors > 0
```

---

# Componente 3

## Quality Report Generator

### Responsabilidad

Persistir los resultados.

---

### Archivo

```text
data/data_quality_report.json
```

---

### Esquema

```json
{
  "status": "EXCELLENT",
  "criticalErrors": 0,
  "warnings": 0,
  "informational": 0,
  "sourceFile": "Base_Maestra_Mantención.xlsx",
  "sourceSheet": "Costo_Mantención",
  "recordCount": 31,
  "generatedAt": "2026-05-29T18:00:00",
  "messages": []
}
```

---

# Integración con el Pipeline

## Flujo Actual

```text
Excel
   ↓
Validaciones
   ↓
JSON Principal
```

---

## Flujo Objetivo

```text
Excel
   ↓
Validaciones
   ↓
Quality Collector
   ↓
Quality Report
   ↓
JSON Principal
```

---

# Estrategia de Implementación

## Paso 1

Crear estructura de captura de resultados.

---

## Paso 2

Redirigir warnings actuales al collector.

---

## Paso 3

Capturar errores críticos.

---

## Paso 4

Calcular estado final.

---

## Paso 5

Generar:

```text
data_quality_report.json
```

---

## Paso 6

Validar compatibilidad con exportación actual.

---

# Requisitos

## Obligatorios

* Mantener JSON principal sin cambios.
* Mantener frontend sin cambios.
* Mantener comportamiento fail-safe.
* Mantener compatibilidad con validaciones existentes.

---

## No Permitido

* Modificar React.
* Modificar Vercel.
* Modificar estructura del dataset principal.
* Introducir dependencias externas.

---

# Estrategia de Testing

## Caso 1

Dataset válido.

Resultado esperado:

```text
EXCELLENT
```

---

## Caso 2

Dataset con warning.

Resultado esperado:

```text
ACCEPTABLE
```

---

## Caso 3

Dataset con error crítico.

Resultado esperado:

```text
REJECTED
```

---

# Riesgo

| Área              | Riesgo   |
| ----------------- | -------- |
| Frontend          | Muy Bajo |
| Dataset Principal | Muy Bajo |
| Pipeline          | Bajo     |
| Producción        | Muy Bajo |

---

# Resultado Esperado

Al finalizar la implementación:

```text
El sistema generará evidencia persistente
de la calidad de los datos procesados.
```

Y dispondrá de la primera capa formal de monitoreo de calidad.

---

# Rama Recomendada

```text
fase-3a-reporting-monitoring
```

---

# Criterio de Aprobación

La implementación será considerada exitosa cuando:

* El exportador genere correctamente el JSON principal.
* El exportador genere correctamente el Quality Report.
* El build continúe funcionando.
* No existan regresiones funcionales.

---

# Próximo Paso

Abrir conversación nueva en Codex:

```text
Fase 3A.2 — Data Quality Reporting & Monitoring
```

utilizando este documento como especificación oficial de implementación.

---

# Control de Cambios

| Versión | Fecha      | Descripción                       |
| ------- | ---------- | --------------------------------- |
| 1.0     | 2026-05-29 | Creación inicial del plan técnico |

---

# Estado

```text
APROBADO
```

Documento oficial para implementación de la Fase 3A.2.
