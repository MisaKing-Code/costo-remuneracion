# PROJECT CHARTER V1

## Proyecto: Costo Remuneraciones Corporativo

**Versión:** 1.0
**Estado:** En Diseño
**Fecha:** Junio 2026
**Propietario del Proyecto:** Pullman San Luis
**Responsable Funcional:** Área de Remuneraciones / Gestión de Personas
**Responsable Técnico:** Proyecto Costo Remuneraciones Corporativo

---

# 1. Resumen Ejecutivo

Costo Remuneraciones Corporativo es una plataforma de análisis y gestión de costos laborales diseñada para consolidar, analizar y visualizar información relacionada con remuneraciones, dotación, estructuras organizacionales y costos asociados a las distintas sociedades del grupo Pullman.

El proyecto nace como evolución natural de Pullman Control Mantención, iniciativa que permitió validar la capacidad de construir soluciones de Business Intelligence internas basadas en datos operacionales y dashboards ejecutivos.

La nueva plataforma amplía ese enfoque hacia la gestión de personas, transformándose en una herramienta corporativa para la toma de decisiones relacionadas con:

* Costos laborales.
* Remuneraciones.
* Dotación.
* Centros de costo.
* Sociedades.
* Áreas organizacionales.
* Horas extraordinarias.
* Ausentismo.
* Indicadores de gestión de personas.

La solución busca convertirse en la fuente oficial de información para análisis de costos laborales dentro de Pullman San Luis.

---

# 2. Propósito del Proyecto

Diseñar y construir una plataforma corporativa que permita visualizar, analizar y controlar el comportamiento de los costos laborales de forma consolidada, confiable y trazable.

La plataforma deberá entregar información oportuna para apoyar la toma de decisiones operativas, tácticas y estratégicas.

---

# 3. Problema de Negocio

Actualmente gran parte de la información relacionada con remuneraciones y dotación se encuentra distribuida en archivos Excel, reportes operacionales y procesos manuales.

Esto genera dificultades para:

* Consolidar información entre sociedades.
* Analizar tendencias históricas.
* Comparar centros de costo.
* Detectar desviaciones de gasto.
* Validar calidad de datos.
* Generar indicadores ejecutivos oportunamente.
* Mantener trazabilidad de la información.

La ausencia de una fuente centralizada dificulta la gestión eficiente de los costos laborales.

---

# 4. Objetivos Estratégicos

## Objetivo General

Construir una plataforma corporativa de análisis de costos laborales que permita consolidar y visualizar información de remuneraciones y dotación para apoyar la toma de decisiones.

## Objetivos Específicos

* Consolidar información de múltiples sociedades.
* Centralizar información histórica.
* Disminuir trabajo manual de análisis.
* Estandarizar indicadores corporativos.
* Mejorar la trazabilidad de la información.
* Implementar controles de calidad de datos.
* Facilitar análisis ejecutivos y operacionales.
* Crear una base escalable para futuras iniciativas analíticas.

---

# 5. Alcance V1

La primera versión del proyecto contempla:

## Incluye

### Remuneraciones

* Haberes imponibles.
* Haberes no imponibles.
* Descuentos legales.
* Descuentos adicionales.
* Líquido a pago.
* Costo empresa.

### Dotación

* Trabajadores activos.
* Tipo de contrato.
* Tipo de contratación.
* Fecha de ingreso.
* Cargo.
* Centro de costo.
* Sociedad.

### Indicadores

* Dotación total.
* Costo laboral total.
* Costo promedio por trabajador.
* Variación mensual.
* Dotación por sociedad.
* Dotación por centro de costo.
* Costo por sociedad.
* Costo por centro de costo.

### Calidad de Datos

* Validaciones automáticas.
* Registros inválidos.
* Duplicidades.
* Campos faltantes.
* Auditoría de carga.

---

# 6. Fuera de Alcance V1

Las siguientes funcionalidades no forman parte de la primera versión:

* Gestión de vacaciones.
* Gestión de licencias médicas.
* Reclutamiento y selección.
* Evaluación de desempeño.
* Portal de colaboradores.
* Integraciones en línea con ERP.
* Gestión documental de contratos.
* Automatización avanzada mediante IA.

Estas funcionalidades podrán evaluarse en versiones posteriores.

---

# 7. Usuarios Objetivo

## Dirección

Necesita visualizar indicadores corporativos consolidados.

## Gerencia

Necesita monitorear comportamiento de costos y dotación.

## Jefaturas

Necesitan analizar información de sus áreas y centros de costo.

## Área de Remuneraciones

Necesita validar datos, controlar costos y monitorear desviaciones.

## Recursos Humanos

Necesita analizar estructura organizacional y evolución de dotación.

## Administración del Sistema

Responsable de configuración y mantenimiento.

---

# 8. Alcance Organizacional

Versión inicial considera:

* 5 sociedades.
* Información histórica desde enero 2026.
* Consolidación corporativa.

La plataforma deberá permitir incorporar nuevas sociedades sin rediseñar la arquitectura.

---

# 9. Fuentes de Datos Iniciales

## Dataset Remuneraciones

Información proveniente de procesos de remuneraciones.

Campos principales:

* RUT
* Nombre
* Sociedad
* Centro de costo
* Cargo
* Haberes
* Descuentos
* Líquido
* Costo empresa
* Período

## Dataset Dotación

Información proveniente de registros de personal.

Campos principales:

* RUT
* Nombre
* Cargo
* Tipo contrato
* Tipo contratación
* Fecha ingreso
* Sociedad
* Centro de costo

---

# 10. Principios de Diseño

La solución deberá construirse bajo los siguientes principios:

## Simplicidad

Evitar complejidad innecesaria.

## Escalabilidad

Permitir crecimiento sin rediseños mayores.

## Trazabilidad

Todo dato debe poder rastrearse hasta su origen.

## Calidad de Datos

La validación debe formar parte del proceso.

## Reutilización

Aprovechar componentes existentes cuando sea conveniente.

## Mantenibilidad

Facilitar futuras modificaciones.

---

# 11. Arquitectura Tecnológica Objetivo

## Frontend

* React
* Vite
* Tailwind CSS
* Recharts

## Procesamiento

* Python
* Pandas
* OpenPyXL

## Control de Versiones

* Git
* GitHub

## Despliegue

* Vercel

## Fuente Inicial de Datos

* Excel

---

# 12. KPIs Corporativos Iniciales

## Costos

* Costo laboral total.
* Costo empresa total.
* Costo promedio por trabajador.
* Variación mensual de costos.

## Dotación

* Dotación total.
* Dotación por sociedad.
* Dotación por centro de costo.
* Dotación por tipo de contrato.

## Gestión

* Antigüedad promedio.
* Horas extraordinarias.
* Ausentismo.
* Variación de dotación.

## Calidad

* Registros inválidos.
* Duplicados detectados.
* Cobertura de datos.
* Diferencias de conciliación.

---

# 13. Riesgos Iniciales

## Calidad de Datos

Posibles inconsistencias provenientes de archivos fuente.

## Homologación

Diferencias de nombres entre sociedades, cargos y centros de costo.

## Dependencia de Excel

Errores manuales en archivos de origen.

## Crecimiento del Proyecto

Incorporación de nuevas fuentes de información.

---

# 14. Factores Críticos de Éxito

El proyecto será considerado exitoso cuando:

* Exista una única fuente corporativa de análisis.
* Los indicadores sean confiables.
* Los usuarios adopten la plataforma.
* Se reduzca significativamente el trabajo manual.
* Exista trazabilidad completa de los datos.
* La plataforma soporte crecimiento futuro.

---

# 15. Visión de Largo Plazo

Costo Remuneraciones Corporativo debe transformarse en la plataforma central de análisis de personas dentro de Pullman San Luis.

La visión futura contempla evolucionar desde un dashboard de costos laborales hacia un ecosistema completo de analítica de personas, incorporando progresivamente nuevas fuentes de información, automatización de procesos, indicadores avanzados y capacidades analíticas que apoyen la toma de decisiones estratégicas de la organización.

---

# 16. Estado Actual del Proyecto

Estado: Diseño y Arquitectura

Fase Actual:

* Auditoría Arquitectura V1.
* Definición Modelo de Datos.
* Definición ETL.
* Planificación de Migración.
* Construcción Documental.

No existen desarrollos V1 implementados al momento de la creación de este documento.

Este Project Charter constituye el documento rector del proyecto y servirá como referencia para toda decisión funcional, técnica y organizacional futura.
