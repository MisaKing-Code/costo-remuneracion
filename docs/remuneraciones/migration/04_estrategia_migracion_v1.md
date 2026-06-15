# ESTRATEGIA DE MIGRACIÓN V1

## Proyecto: Costo Remuneraciones Corporativo

**Versión:** 1.0
**Estado:** Aprobado
**Fecha:** Junio 2026

**Documentos Relacionados:**

* 00_PROJECT_CHARTER_V1.md
* 01_AUDITORIA_ARQUITECTURA_V1.md
* 02_MODELO_DATOS_CORPORATIVO_V1.md
* 03_ARQUITECTURA_ETL_V1.md

---

# 1. Objetivo

Definir la estrategia oficial de transición desde el proyecto Pullman Control Mantención hacia la nueva plataforma Costo Remuneraciones Corporativo.

El propósito de esta migración es aprovechar la experiencia, componentes y conocimiento acumulado, evitando reconstrucciones innecesarias y reduciendo riesgos técnicos.

La migración debe realizarse de forma controlada, documentada y reversible.

---

# 2. Contexto

Pullman Control Mantención fue desarrollado como una plataforma de Business Intelligence enfocada en indicadores operacionales de mantenimiento.

Durante su construcción se validaron exitosamente:

* Arquitectura React.
* Flujo de despliegue.
* Diseño de dashboards.
* Componentes reutilizables.
* Estructura documental.
* Integración con archivos Excel.
* Metodología de trabajo.

El proyecto actual amplía ese alcance hacia una plataforma corporativa de análisis de costos laborales.

Por lo tanto:

```text
No se reemplaza el proyecto anterior.

Se evoluciona sobre una base ya validada.
```

---

# 3. Principios de Migración

Toda decisión deberá respetar los siguientes principios.

---

## PM-001

### Preservación Histórica

La documentación y artefactos del proyecto anterior no deben eliminarse.

---

## PM-002

### Reutilización Responsable

Solo se reutilizarán componentes que aporten valor al nuevo dominio.

---

## PM-003

### Separación de Dominios

Mantención y Remuneraciones deben mantenerse conceptualmente separados.

---

## PM-004

### Trazabilidad

Toda modificación relevante deberá quedar documentada.

---

## PM-005

### Evolución Incremental

La migración se realizará por etapas.

---

# 4. Inventario Legacy

## Proyecto de origen

```text
Pullman Control Mantención
```

---

## Estado

Congelado

---

## Ubicación documental

```text
docs/
└── legacy/
    └── pullman_costo_mantencion/
```

---

## Propósito

Mantener respaldo histórico y referencia arquitectónica.

---

# 5. Activos Reutilizables

Los siguientes elementos podrán reutilizarse total o parcialmente.

---

## Infraestructura

Estado:

Reutilizable

Incluye:

* GitHub Repository
* Git History
* Branch Strategy
* Configuración Vercel

---

## Frontend

Estado:

Parcialmente reutilizable

Incluye:

* Layout principal
* Sidebar
* Navbar
* Componentes base
* Cards KPI
* Tablas
* Filtros

---

## Diseño Visual

Estado:

Reutilizable

Incluye:

* Sistema visual
* Paleta corporativa
* Estructura dashboard
* Componentes gráficos

---

## Arquitectura del Proyecto

Estado:

Parcialmente reutilizable

Incluye:

* Organización React
* Convenciones
* Configuración Vite

---

## Documentación

Estado:

Conservar como referencia

Incluye:

* Roadmaps
* Auditorías
* Decisiones técnicas

---

# 6. Componentes a Refactorizar

Existen componentes que podrán mantenerse, pero requieren adaptación.

---

## Navegación

Motivo:

El dominio funcional cambia completamente.

---

## Menús

Motivo:

Se reemplazan módulos de mantención por módulos de remuneraciones.

---

## KPIs

Motivo:

Los indicadores actuales no representan costos laborales.

---

## Gráficos

Motivo:

Las visualizaciones cambian de contexto.

---

## Filtros

Motivo:

Nuevas dimensiones:

* Sociedad
* Centro de costo
* Contrato
* Cargo
* Período

---

# 7. Componentes a Reemplazar

Los siguientes elementos deberán reconstruirse.

---

## Modelo de Datos

Motivo:

Cambio completo de dominio.

---

## ETL

Motivo:

Nueva fuente de información.

---

## Indicadores

Motivo:

Nuevo objetivo de negocio.

---

## Métricas

Motivo:

Cambio funcional completo.

---

## Dataset Operacional

Motivo:

Se reemplaza por remuneraciones y dotación.

---

# 8. Componentes a Eliminar

No deben migrarse:

---

## Métricas de Mantención

* Costos de mantención.
* Indicadores de flota.
* Indicadores mecánicos.
* Indicadores operacionales específicos.

---

## Tablas Exclusivas de Mantención

Todas las relacionadas únicamente con mantenimiento.

---

## Lógica de Negocio Específica

Toda regla que no tenga aplicación en remuneraciones.

---

# 9. Estrategia de Ejecución

La migración se realizará en cinco etapas.

---

# ETAPA 1

## Congelamiento

Objetivo:

Proteger estado actual.

Actividades:

* Respaldar documentación.
* Mover documentos legacy.
* Mantener historial Git.

Resultado:

Repositorio protegido.

---

# ETAPA 2

## Arquitectura

Objetivo:

Definir diseño objetivo.

Actividades:

* Project Charter.
* Auditoría.
* Modelo de Datos.
* ETL.
* Roadmap.

Resultado:

Arquitectura aprobada.

---

# ETAPA 3

## Datos

Objetivo:

Preparar datasets corporativos.

Actividades:

* Estructura raw.
* Estructura staging.
* Estructura processed.
* Validaciones.

Resultado:

Modelo de datos operativo.

---

# ETAPA 4

## Dashboard V1

Objetivo:

Construir primera versión funcional.

Actividades:

* Dashboard ejecutivo.
* Costos laborales.
* Dotación.
* Remuneraciones.

Resultado:

Versión funcional.

---

# ETAPA 5

## Consolidación

Objetivo:

Cerrar migración.

Actividades:

* Validación usuarios.
* Corrección hallazgos.
* Documentación final.

Resultado:

Costo Remuneraciones Corporativo V1.

---

# 10. Riesgos de Migración

---

## RM-001

### Dependencias Ocultas

Riesgo:

Código heredado que aún depende de estructuras antiguas.

Mitigación:

Auditoría funcional previa.

---

## RM-002

### Datos Incompatibles

Riesgo:

Estructuras Excel distintas.

Mitigación:

Proceso ETL normalizado.

---

## RM-003

### Reutilización Excesiva

Riesgo:

Intentar adaptar componentes que deberían reconstruirse.

Mitigación:

Evaluación individual.

---

## RM-004

### Deuda Técnica Heredada

Riesgo:

Arrastrar decisiones del proyecto anterior.

Mitigación:

Refactorización controlada.

---

# 11. Criterios de Éxito

La migración será considerada exitosa cuando:

* El proyecto opere completamente sobre el nuevo modelo de datos.
* No existan dependencias funcionales de mantención.
* El dashboard refleje únicamente información de remuneraciones.
* Los procesos ETL funcionen correctamente.
* La documentación esté actualizada.
* La plataforma pueda crecer sin rediseños.

---

# 12. Estado de Migración

Estado Actual:

```text
Fase 2
Arquitectura y Diseño
```

Avance estimado:

```text
Arquitectura: 80%

Implementación: 0%

Migración Técnica: 0%
```

---

# 13. Decisión Arquitectónica Final

Se aprueba oficialmente la evolución del proyecto Pullman Control Mantención hacia Costo Remuneraciones Corporativo.

La estrategia seleccionada corresponde a una migración evolutiva controlada, reutilizando infraestructura y componentes de valor, mientras se reemplazan completamente las estructuras funcionales asociadas al dominio de mantenimiento.

Esta decisión minimiza riesgos, protege el conocimiento adquirido y permite acelerar significativamente la construcción de la nueva plataforma.

---

# 14. Próximo Paso

Finalizar la planificación estratégica mediante:

```text
05_ROADMAP_BACKLOG_V1.md
```

Una vez aprobado dicho documento, podrá iniciarse la fase de organización técnica del repositorio y posterior implementación controlada.
