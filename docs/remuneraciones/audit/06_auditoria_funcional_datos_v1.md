# AUDITORÍA FUNCIONAL DE DATOS V1

## Proyecto: Costo Remuneraciones Corporativo

**Versión:** 1.0
**Estado:** Pendiente de Ejecución
**Fecha:** Junio 2026

**Documentos Relacionados**

* 00_PROJECT_CHARTER_V1.md
* 01_AUDITORIA_ARQUITECTURA_V1.md
* 02_MODELO_DATOS_CORPORATIVO_V1.md
* 03_ARQUITECTURA_ETL_V1.md
* 04_ESTRATEGIA_MIGRACION_V1.md
* 05_ROADMAP_BACKLOG_V1.md

---

# 1. Objetivo

Validar la estructura real de los archivos fuente que alimentarán el proyecto Costo Remuneraciones Corporativo.

Esta auditoría tiene como propósito verificar que las fuentes de datos disponibles sean compatibles con el modelo corporativo definido durante la fase de arquitectura.

Los resultados de esta auditoría determinarán si es necesario ajustar:

* Modelo de datos.
* Arquitectura ETL.
* KPIs.
* Catálogos corporativos.
* Reglas de validación.

---

# 2. Alcance

La auditoría considera inicialmente:

## Dataset Remuneraciones

Información histórica disponible para análisis de remuneraciones.

---

## Dataset Dotación

Información histórica de trabajadores y estructura organizacional.

---

## Período Inicial

```text
Enero 2026
Febrero 2026
Marzo 2026
Abril 2026
Mayo 2026
```

---

## Sociedades

```text
5 sociedades
```

La auditoría deberá validar que la información exista para todas ellas.

---

# 3. Objetivos Específicos

## OE-001

Identificar todas las columnas disponibles.

---

## OE-002

Detectar diferencias entre archivos.

---

## OE-003

Validar granularidad de los datos.

---

## OE-004

Validar calidad de información.

---

## OE-005

Confirmar compatibilidad con el modelo corporativo.

---

## OE-006

Detectar campos adicionales de valor analítico.

---

# 4. Inventario de Fuentes

Durante la auditoría deberá completarse la siguiente matriz.

| Dataset        | Estado    | Observaciones |
| -------------- | --------- | ------------- |
| Remuneraciones | Pendiente |               |
| Dotación       | Pendiente |               |

---

# 5. Auditoría Dataset Remuneraciones

## Información General

### Nombre Archivo

Pendiente.

---

### Cantidad Registros

Pendiente.

---

### Períodos Disponibles

Pendiente.

---

### Sociedades Disponibles

Pendiente.

---

# 6. Estructura de Columnas

Completar durante la auditoría.

| Campo | Tipo | Observaciones |
| ----- | ---- | ------------- |
|       |      |               |
|       |      |               |
|       |      |               |

---

# 7. Validación Funcional Remuneraciones

## Identificación Trabajador

Validar existencia de:

* RUT
* Nombre

Resultado:

Pendiente.

---

## Información Organizacional

Validar existencia de:

* Sociedad
* Centro de costo
* Cargo

Resultado:

Pendiente.

---

## Información Económica

Validar existencia de:

* Haberes imponibles
* Haberes no imponibles
* Descuentos
* Líquido
* Costo empresa

Resultado:

Pendiente.

---

## Información Temporal

Validar existencia de:

* Período
* Fecha proceso

Resultado:

Pendiente.

---

# 8. Auditoría Dataset Dotación

## Información General

### Nombre Archivo

Pendiente.

---

### Cantidad Registros

Pendiente.

---

### Períodos Disponibles

Pendiente.

---

### Sociedades Disponibles

Pendiente.

---

# 9. Estructura de Columnas Dotación

Completar durante la auditoría.

| Campo | Tipo | Observaciones |
| ----- | ---- | ------------- |
|       |      |               |
|       |      |               |
|       |      |               |

---

# 10. Validación Funcional Dotación

## Identificación

Validar existencia de:

* RUT
* Nombre

Resultado:

Pendiente.

---

## Información Laboral

Validar existencia de:

* Cargo
* Tipo contrato
* Tipo contratación

Resultado:

Pendiente.

---

## Información Temporal

Validar existencia de:

* Fecha ingreso
* Fecha egreso

Resultado:

Pendiente.

---

## Información Organizacional

Validar existencia de:

* Sociedad
* Centro costo

Resultado:

Pendiente.

---

# 11. Validación de Granularidad

La auditoría deberá responder:

---

## Pregunta 1

¿Cuál es el grano real del archivo de remuneraciones?

Ejemplo:

```text
1 trabajador por período
```

o

```text
1 trabajador por concepto de pago
```

Resultado:

Pendiente.

---

## Pregunta 2

¿Cuál es el grano real del archivo de dotación?

Resultado:

Pendiente.

---

# 12. Evaluación del Modelo de Datos

Comparar resultados contra:

```text
02_MODELO_DATOS_CORPORATIVO_V1.md
```

---

## Compatibilidad Fact Remuneraciones

Estado:

Pendiente.

---

## Compatibilidad Fact Dotación

Estado:

Pendiente.

---

## Compatibilidad Dimensiones

Estado:

Pendiente.

---

# 13. Auditoría de Calidad de Datos

Evaluar:

---

## Duplicados

Estado:

Pendiente.

---

## Nulos

Estado:

Pendiente.

---

## Inconsistencias

Estado:

Pendiente.

---

## Sociedades

Estado:

Pendiente.

---

## Centros de Costo

Estado:

Pendiente.

---

## Cargos

Estado:

Pendiente.

---

# 14. Hallazgos

Registrar todos los hallazgos relevantes.

| ID | Hallazgo | Impacto |
| -- | -------- | ------- |
|    |          |         |
|    |          |         |
|    |          |         |

---

# 15. Riesgos Detectados

Registrar riesgos asociados a calidad y estructura de datos.

| ID | Riesgo | Severidad |
| -- | ------ | --------- |
|    |        |           |
|    |        |           |
|    |        |           |

---

# 16. Recomendaciones

Documentar acciones recomendadas antes de iniciar desarrollo.

Ejemplos:

* Ajustar modelo de datos.
* Crear catálogos.
* Corregir inconsistencias.
* Agregar validaciones.

---

# 17. Resultado de Auditoría

## Estado General

```text
Pendiente
```

---

## Compatibilidad Modelo Corporativo

```text
Pendiente
```

---

## Apto para Implementación

```text
Pendiente
```

---

# 18. Criterio de Cierre

La auditoría se considerará finalizada cuando:

* Se hayan revisado todos los datasets.
* Se hayan identificado todas las columnas.
* Se haya validado la granularidad.
* Se hayan documentado hallazgos.
* Se hayan definido acciones correctivas.
* Se confirme compatibilidad con la arquitectura diseñada.

---

# 19. Próximo Paso

Una vez aprobada esta auditoría podrá iniciarse:

```text
FASE DE IMPLEMENTACIÓN V1
```

incluyendo:

* Organización técnica del repositorio.
* Construcción ETL.
* Construcción Dashboard.
* Construcción KPIs.
* Construcción Validaciones.

---

# 20. Conclusión

La Auditoría Funcional de Datos V1 constituye el último control de calidad previo al inicio del desarrollo técnico.

Su objetivo es asegurar que la arquitectura diseñada refleje correctamente la realidad de los datos disponibles, reduciendo riesgos y evitando retrabajos durante la implementación.
