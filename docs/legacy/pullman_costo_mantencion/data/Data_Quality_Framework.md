# Data Quality Framework

## Proyecto

**Pullman Control Mantención**

## Documento

Data Quality Framework

## Versión

v1.0

## Fecha

2026-05-29

## Estado

Aprobado

---

# Objetivo

Definir el marco de calidad de datos utilizado por Pullman Control Mantención para validar, clasificar y controlar la información antes de su transformación y publicación.

Este framework establece:

* Flujo de validación.
* Niveles de severidad.
* Reglas de decisión.
* Comportamiento esperado del pipeline.
* Generación de reportes de calidad.

---

# Principios

## Integridad

La información utilizada por el dashboard debe representar fielmente la realidad operacional.

---

## Consistencia

Los datos deben respetar una estructura estable y predecible.

---

## Trazabilidad

Toda validación debe dejar evidencia verificable.

---

## Transparencia

Los errores y advertencias deben ser visibles para los responsables del proceso.

---

## Prevención

Los problemas deben detectarse antes de generar el dataset consumido por el frontend.

---

# Arquitectura de Calidad

## Flujo General

```text
Excel
   ↓
Carga de datos
   ↓
Validación de esquema
   ↓
Validación de registros
   ↓
Validación de reglas de negocio
   ↓
Clasificación de resultados
   ↓
Reporte de calidad
   ↓
Generación JSON
   ↓
Frontend
```

---

# Niveles de Validación

## Nivel 1 — Esquema

Valida la estructura del archivo.

Controles:

* Existencia de hoja.
* Existencia de columnas.
* Columnas duplicadas.
* Encabezados válidos.

Objetivo:

Garantizar compatibilidad con el pipeline.

---

## Nivel 2 — Registros

Valida la calidad individual de cada fila.

Controles:

* Campos obligatorios.
* Valores vacíos.
* Registros especiales.
* Duplicados.

Objetivo:

Garantizar integridad del dataset.

---

## Nivel 3 — Reglas de Negocio

Valida consistencia funcional.

Controles:

* Costos negativos.
* Totales inválidos.
* Valores inesperados.
* Nuevas categorías.

Objetivo:

Garantizar confiabilidad analítica.

---

# Clasificación de Resultados

## Error Crítico

Representa una condición que impide confiar en los datos.

Ejemplos:

* Hoja inexistente.
* Columna obligatoria ausente.
* Campo clave vacío.
* Error de estructura.

Acción:

```text
Detener pipeline.
No generar JSON.
Generar reporte de error.
```

---

## Warning

Representa una anomalía que debe revisarse.

Ejemplos:

* Costos negativos.
* Registros duplicados.
* Valores fuera de rango esperado.

Acción:

```text
Permitir ejecución.
Registrar advertencia.
Generar reporte.
```

---

## Informativo

Representa eventos relevantes para seguimiento.

Ejemplos:

* Nuevo cargo.
* Nuevo centro de negocio.
* Nuevo tipo de contrato.

Acción:

```text
Registrar evento.
Continuar procesamiento.
```

---

# Estados de Calidad

## Estado Verde

Condición:

```text
0 errores críticos
0 warnings
```

Resultado:

```text
Calidad Excelente
```

---

## Estado Amarillo

Condición:

```text
0 errores críticos
1 o más warnings
```

Resultado:

```text
Calidad Aceptable
```

---

## Estado Rojo

Condición:

```text
1 o más errores críticos
```

Resultado:

```text
Calidad Rechazada
```

---

# Reporte de Calidad

Cada ejecución futura del pipeline debería generar un resumen con:

## Información General

* Fecha de ejecución.
* Archivo procesado.
* Total de registros.

---

## Resultado

* Errores críticos.
* Warnings.
* Eventos informativos.

---

## Estado Final

```text
EXCELENTE
ACEPTABLE
RECHAZADA
```

---

# Integración con el Pipeline

El framework se aplicará antes de la generación del JSON.

Secuencia esperada:

```text
Leer Excel
        ↓
Ejecutar validaciones
        ↓
Generar reporte
        ↓
Evaluar estado
        ↓
Permitir o bloquear exportación
        ↓
Generar JSON
```

---

# Dependencias

Este framework depende de:

```text
docs/audits/Audit_006_Data_Quality_Review.md

docs/data/Data_Dictionary.md

docs/data/Validation_Rules_Catalog.md
```

Y servirá como referencia para:

```text
scripts Python

validaciones automáticas

testing de datos

auditorías futuras
```

---

# Roadmap Futuro

## Fase 3A.1

Implementación de validaciones automáticas.

---

## Fase 3A.2

Generación automática de reportes de calidad.

---

## Fase 3A.3

Historial de calidad de datos.

---

## Fase 3A.4

Dashboard interno de calidad.

---

# Control de Cambios

| Versión | Fecha      | Descripción                    |
| ------- | ---------- | ------------------------------ |
| 1.0     | 2026-05-29 | Creación inicial del framework |

---

# Estado

```text
APROBADO
```

Marco oficial de calidad de datos para Pullman Control Mantención.
