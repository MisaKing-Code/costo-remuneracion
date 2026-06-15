# Audit_007 — Data Quality Foundation Review

## Proyecto

**Pullman Control Mantención**

## Fecha

2026-05-29

## Estado

Finalizado

## Objetivo

Auditar la implementación actual del pipeline de exportación de datos para determinar el nivel real de cumplimiento de la Fase 3A — Calidad de Datos Avanzada.

Esta auditoría tiene como propósito identificar:

* Validaciones ya implementadas.
* Validaciones faltantes.
* Riesgos remanentes.
* Prioridades de desarrollo.
* Estado de madurez de la capa de calidad de datos.

---

# Alcance

Archivo auditado:

```text
export_maintenance_cost_data.py
```

Proceso auditado:

```text
Base_Maestra_Mantención.xlsx
        ↓
Pipeline Python
        ↓
maintenanceCostData.json
        ↓
Frontend React
```

---

# Resumen Ejecutivo

La auditoría revela que una parte significativa de la infraestructura de calidad de datos ya se encuentra implementada dentro del pipeline actual.

Las validaciones incorporadas durante las fases anteriores permiten concluir que el proyecto dispone de una Data Quality Foundation funcional antes incluso de iniciar la implementación formal de la Fase 3A.

El trabajo pendiente corresponde principalmente a ampliar la cobertura de validaciones, generar reportes estructurados y mejorar la observabilidad del proceso.

---

# Arquitectura Actual Detectada

## Fuente Oficial

Archivo esperado:

```text
Base_Maestra_Mantención.xlsx
```

Validación implementada:

* Existencia obligatoria.
* Nombre exacto requerido.
* Rechazo de archivos alternativos.

Resultado:

```text
CUMPLE
```

---

## Hoja Oficial

Hoja requerida:

```text
Costo_Mantención
```

Validación implementada:

* Verificación de existencia.
* Rechazo si la hoja no existe.

Resultado:

```text
CUMPLE
```

---

## Detección Dinámica de Encabezados

El pipeline identifica automáticamente la fila que contiene:

```text
RUT_Sociedad
```

como inicio del esquema de datos.

Beneficios:

* Mayor tolerancia a títulos corporativos.
* Menor dependencia de posiciones fijas.

Resultado:

```text
CUMPLE
```

---

# Revisión de Validaciones

## VR-001 — Hoja Requerida

Estado:

```text
IMPLEMENTADA
```

Resultado:

```text
CUMPLE
```

---

## VR-002 — Columnas Obligatorias

Estado:

```text
IMPLEMENTADA
```

Resultado:

```text
CUMPLE
```

Se valida la presencia de todas las columnas definidas como obligatorias.

---

## VR-003 — Columnas Duplicadas

Estado:

```text
NO IMPLEMENTADA
```

Resultado:

```text
PENDIENTE
```

Recomendación:

Agregar validación explícita de columnas duplicadas.

---

## VR-004 — Exclusión de Registro Total

Estado:

```text
IMPLEMENTADA
```

Resultado:

```text
CUMPLE
```

La fila utilizada para totalización es excluida antes de generar el dataset.

---

## VR-005 — Nombre_Trabajador

Estado:

```text
IMPLEMENTADA
```

Resultado:

```text
CUMPLE
```

---

## VR-006 — RUT_Trabajador

Estado:

```text
IMPLEMENTADA
```

Resultado:

```text
CUMPLE
```

---

## VR-007 — Cargo

Estado:

```text
IMPLEMENTADA
```

Resultado:

```text
CUMPLE
```

---

## VR-008 — Centro_de_Negocio

Estado:

```text
PARCIAL
```

Resultado:

```text
REQUIERE MEJORA
```

Existe presencia estructural de la columna, pero no validación explícita de contenido.

---

## VR-009 a VR-017 — Integridad Numérica

Estado:

```text
PARCIAL
```

Resultado:

```text
REQUIERE MEJORA
```

Actualmente:

* Conversión numérica existe.
* Normalización existe.

Falta:

* Validación individual por campo.
* Reglas específicas.
* Reporte detallado.

---

## VR-018 — Valores Negativos

Estado:

```text
NO IMPLEMENTADA
```

Resultado:

```text
PENDIENTE
```

---

## VR-019 — Total_Costo Mayor a Cero

Estado:

```text
IMPLEMENTADA
```

Resultado:

```text
CUMPLE
```

---

## VR-020 — Registros Duplicados

Estado:

```text
NO IMPLEMENTADA
```

Resultado:

```text
PENDIENTE
```

---

## VR-021 — Campos Obligatorios Vacíos

Estado:

```text
PARCIAL
```

Resultado:

```text
REQUIERE MEJORA
```

Actualmente solo se validan campos críticos definidos por el pipeline.

---

## VR-022 a VR-024 — Gobernanza Avanzada

Estado:

```text
NO IMPLEMENTADA
```

Resultado:

```text
PENDIENTE
```

Incluye:

* Nuevos cargos.
* Nuevos centros de negocio.
* Nuevos tipos de contrato.

---

# Fortalezas Detectadas

## Protección de Fuente Oficial

El pipeline evita procesar archivos no autorizados.

Impacto:

Alta confiabilidad operacional.

---

## Validación Temprana

Los errores son detectados antes de generar el JSON.

Impacto:

Reduce riesgo de contaminación del frontend.

---

## Fallo Seguro

Ante errores críticos:

```text
Proceso cancelado.
```

Impacto:

Protección efectiva de producción.

---

## Consistencia de Datos

Existe normalización de:

* Campos texto.
* Campos numéricos.
* Registros especiales.

Impacto:

Mayor estabilidad del dashboard.

---

# Riesgos Pendientes

## Riesgo 1

Columnas duplicadas no detectadas.

Severidad:

Media

---

## Riesgo 2

Duplicados de trabajadores no detectados.

Severidad:

Media

---

## Riesgo 3

Valores negativos permitidos.

Severidad:

Media

---

## Riesgo 4

Ausencia de reportes formales de calidad.

Severidad:

Baja

---

# Nivel de Madurez

| Área                     | Estado |
| ------------------------ | ------ |
| Validación de estructura | Alto   |
| Validación de fuente     | Alto   |
| Validación crítica       | Alto   |
| Integridad numérica      | Media  |
| Gobernanza de datos      | Media  |
| Observabilidad           | Baja   |
| Reportabilidad           | Baja   |

---

# Evaluación General

Nivel estimado de implementación:

```text
65% - 70%
```

La infraestructura fundamental de calidad de datos ya existe dentro del pipeline actual.

La Fase 3A no requiere reconstrucción del sistema, sino evolución incremental sobre una base sólida.

---

# Recomendaciones

## Prioridad Alta

Implementar:

* VR-003
* VR-018
* VR-020

---

## Prioridad Media

Implementar:

* VR-021 completo
* Reporte de calidad estructurado

---

## Prioridad Baja

Implementar:

* VR-022
* VR-023
* VR-024

---

# Conclusión

La auditoría confirma que Pullman Control Mantención ya dispone de una Data Quality Foundation operativa.

Las fases anteriores incorporaron controles que hoy permiten considerar la calidad de datos como una capacidad integrada del sistema y no como una funcionalidad futura.

La siguiente etapa recomendada consiste en ampliar la cobertura de validaciones y generar mecanismos formales de observabilidad y reporte.

---

# Próxima Acción Recomendada

```text
Fase 3A.1 — Data Quality Foundation Implementation
```

Objetivo:

Completar las validaciones pendientes identificadas en esta auditoría.

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

La infraestructura actual cumple los requisitos fundamentales para continuar la evolución de la Fase 3A.
