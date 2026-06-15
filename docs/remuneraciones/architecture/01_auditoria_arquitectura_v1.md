# AUDITORÍA DE ARQUITECTURA V1

## Proyecto: Costo Remuneraciones Corporativo

**Versión:** 1.0
**Estado:** Aprobada
**Fecha:** Junio 2026
**Tipo:** Auditoría Arquitectónica Inicial
**Documento Relacionado:** 00_PROJECT_CHARTER_V1.md

---

# 1. Resumen Ejecutivo

Durante el proceso de evaluación del proyecto Pullman Control Mantención se identificó la oportunidad de evolucionar la plataforma hacia una solución corporativa enfocada en el análisis de costos laborales y gestión de personas.

La plataforma original cumplió exitosamente su objetivo de validar una arquitectura de Business Intelligence basada en:

* React.
* Vite.
* Dashboards interactivos.
* Procesamiento de datos mediante archivos Excel.
* Despliegue en Vercel.

La experiencia obtenida permitió confirmar la viabilidad técnica de construir soluciones analíticas internas reutilizando una arquitectura moderna, liviana y de bajo costo operacional.

A partir de esta validación surge el proyecto Costo Remuneraciones Corporativo.

Esta auditoría tiene como objetivo documentar el estado actual, identificar riesgos, definir lineamientos arquitectónicos y establecer las bases para la construcción de la nueva plataforma.

---

# 2. Objetivo de la Auditoría

Evaluar el estado actual del repositorio heredado desde Pullman Control Mantención y definir una estrategia de evolución controlada hacia una plataforma corporativa de análisis de remuneraciones.

La auditoría busca:

* Identificar activos reutilizables.
* Detectar riesgos técnicos.
* Definir arquitectura objetivo.
* Establecer criterios de migración.
* Reducir deuda técnica futura.
* Crear una base documental sólida antes del desarrollo.

---

# 3. Contexto del Proyecto

La organización requiere una solución que permita analizar:

* Costos laborales.
* Remuneraciones.
* Dotación.
* Centros de costo.
* Sociedades.
* Áreas organizacionales.
* Horas extraordinarias.
* Ausentismo.
* Indicadores de gestión de personas.

Actualmente la información se encuentra distribuida en múltiples archivos y procesos manuales.

La nueva plataforma busca centralizar y consolidar esta información.

---

# 4. Estado Actual del Repositorio

## Origen

Proyecto heredado:

Pullman Control Mantención

## Estado General

El repositorio se encuentra operativo y funcional como prueba de concepto de Business Intelligence.

La arquitectura existente permitió validar:

* Estructura de frontend.
* Navegación.
* Visualización de indicadores.
* Consumo de datos desde archivos.
* Flujo de despliegue.

## Nivel de Madurez

Nivel estimado:

MVP validado.

No corresponde aún a una plataforma corporativa de remuneraciones.

---

# 5. Inventario de Activos Disponibles

## Infraestructura

Disponible:

* Repositorio GitHub.
* Proyecto React.
* Configuración Vite.
* Configuración Vercel.

Estado:

Reutilizable.

---

## Componentes Visuales

Disponible:

* Layout principal.
* Componentes gráficos.
* Componentes de filtros.
* Tarjetas KPI.
* Navegación.

Estado:

Parcialmente reutilizable.

---

## Experiencia de Desarrollo

Disponible:

* Conocimiento técnico adquirido.
* Estructura de trabajo validada.
* Convenciones del proyecto.
* Flujo de despliegue.

Estado:

Altamente reutilizable.

---

## Documentación

Disponible:

* Arquitectura histórica.
* Roadmaps.
* Decisiones técnicas.
* Auditorías anteriores.

Estado:

Debe preservarse como documentación legacy.

---

# 6. Hallazgos de la Auditoría

## Hallazgo 01

El dominio funcional cambió significativamente.

La solución original estaba orientada a mantenimiento.

La nueva solución estará orientada a gestión de personas y costos laborales.

Impacto:

Alto.

---

## Hallazgo 02

El modelo de datos actual no representa adecuadamente información de remuneraciones.

Impacto:

Crítico.

Acción:

Diseñar nuevo modelo corporativo.

---

## Hallazgo 03

La documentación histórica posee valor y no debe eliminarse.

Impacto:

Medio.

Acción:

Mover documentación a estructura Legacy.

---

## Hallazgo 04

La arquitectura frontend puede reutilizarse parcialmente.

Impacto:

Alto.

Acción:

Evaluar componente por componente.

---

## Hallazgo 05

No existe actualmente una arquitectura formal ETL.

Impacto:

Alto.

Acción:

Diseñar proceso ETL corporativo.

---

# 7. Riesgos Detectados

## Riesgo 01

### Dependencia de Excel

Descripción:

Los datos iniciales provienen de archivos manuales.

Probabilidad:

Alta.

Impacto:

Alto.

Mitigación:

Implementar validaciones automáticas.

---

## Riesgo 02

### Homologación de Datos

Descripción:

Posibles diferencias en:

* Sociedades.
* Cargos.
* Centros de costo.
* Contratos.

Probabilidad:

Alta.

Impacto:

Alto.

Mitigación:

Crear catálogos maestros.

---

## Riesgo 03

### Crecimiento del Alcance

Descripción:

Incorporación futura de nuevas fuentes y requerimientos.

Probabilidad:

Alta.

Impacto:

Medio.

Mitigación:

Diseño modular y escalable.

---

## Riesgo 04

### Migración Incompleta

Descripción:

Mantener dependencias ocultas del proyecto anterior.

Probabilidad:

Media.

Impacto:

Alto.

Mitigación:

Inventario y migración controlada.

---

# 8. Decisiones Arquitectónicas

## DA-001

Se mantiene el repositorio actual.

Justificación:

Preservar historial y continuidad del proyecto.

Estado:

Aprobada.

---

## DA-002

Pullman Control Mantención pasa a estado Legacy.

Justificación:

La nueva solución posee objetivos distintos.

Estado:

Aprobada.

---

## DA-003

Se crea una estructura documental independiente para Remuneraciones.

Justificación:

Separar claramente pasado y futuro del producto.

Estado:

Aprobada.

---

## DA-004

Se adopta arquitectura basada en capas.

Capas:

* Raw.
* Staging.
* Processed.
* Dashboard.

Estado:

Aprobada.

---

## DA-005

Se adopta modelo corporativo de datos basado en hechos y dimensiones.

Estado:

Aprobada.

---

# 9. Arquitectura Objetivo

La arquitectura objetivo del proyecto será:

```text
Fuentes Excel
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
DASHBOARD CORPORATIVO
```

Principios:

* Escalabilidad.
* Trazabilidad.
* Calidad de datos.
* Mantenibilidad.
* Simplicidad.

---

# 10. Estado de la Migración

Estado actual:

Diseño.

Fases completadas:

* Definición de visión.
* Definición de alcance.
* Organización documental.
* Creación de estructura legacy.

Fases pendientes:

* Modelo de datos.
* Arquitectura ETL.
* Dashboard V1.
* Implementación.
* Validación funcional.

---

# 11. Recomendaciones

## Prioridad Alta

* Definir modelo de datos corporativo.
* Diseñar arquitectura ETL.
* Crear diccionario de datos.
* Definir KPIs oficiales.

## Prioridad Media

* Inventariar componentes reutilizables.
* Diseñar navegación definitiva.
* Definir roles y permisos.

## Prioridad Baja

* Automatizaciones avanzadas.
* Integraciones externas.
* Funcionalidades futuras.

---

# 12. Próximos Pasos

1. Crear Modelo de Datos Corporativo V1.
2. Diseñar Arquitectura ETL V1.
3. Definir Estrategia de Migración.
4. Construir Roadmap V1.
5. Preparar backlog funcional.
6. Iniciar implementación controlada.

---

# 13. Conclusión

La auditoría concluye que la decisión de evolucionar Pullman Control Mantención hacia Costo Remuneraciones Corporativo es técnicamente viable, estratégicamente conveniente y alineada con las necesidades actuales de la organización.

Se recomienda mantener el repositorio existente como base tecnológica, preservar toda la documentación histórica bajo una estructura Legacy y construir la nueva solución sobre una arquitectura corporativa orientada a costos laborales, calidad de datos y escalabilidad futura.

La implementación no debe comenzar hasta completar la definición del modelo de datos y la arquitectura ETL, los cuales constituyen los pilares fundamentales de la plataforma.
