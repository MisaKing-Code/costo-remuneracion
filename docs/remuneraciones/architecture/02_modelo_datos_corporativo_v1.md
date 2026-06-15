# MODELO DE DATOS CORPORATIVO V1

## Proyecto: Costo Remuneraciones Corporativo

**Versión:** 1.0
**Estado:** Aprobado
**Fecha:** Junio 2026
**Documento Relacionado:** 00_PROJECT_CHARTER_V1.md
**Documento Relacionado:** 01_AUDITORIA_ARQUITECTURA_V1.md

---

# 1. Objetivo

Definir el modelo de datos corporativo que servirá como base para la consolidación, análisis y visualización de información relacionada con costos laborales y gestión de personas.

Este modelo establece la estructura oficial que deberá utilizarse en:

* ETL.
* Dashboards.
* Indicadores.
* Reportes.
* Auditorías.
* Futuras integraciones.

---

# 2. Principios de Diseño

El modelo ha sido diseñado bajo los siguientes principios:

## Simplicidad

Mantener una estructura comprensible y mantenible.

## Escalabilidad

Permitir incorporación de nuevas sociedades, indicadores y fuentes de información.

## Trazabilidad

Todo dato debe poder rastrearse hasta su origen.

## Reutilización

Evitar duplicación innecesaria de información.

## Calidad de Datos

Facilitar validaciones y controles automáticos.

---

# 3. Modelo Conceptual

La plataforma utilizará una arquitectura analítica basada en:

```text
Dimensiones
     │
     ▼
Tablas de Hechos
     │
     ▼
KPIs
     │
     ▼
Dashboards
```

---

# 4. Grano de Información

## Fact Remuneraciones

Una fila representa:

```text
1 Trabajador
+
1 Sociedad
+
1 Período
```

---

## Fact Dotación

Una fila representa:

```text
1 Trabajador
+
1 Sociedad
+
1 Período
```

---

# 5. Entidades Principales

El modelo corporativo se compone de:

```text
FACT_REMUNERACIONES
FACT_DOTACION

DIM_TRABAJADOR
DIM_SOCIEDAD
DIM_CENTRO_COSTO
DIM_CARGO
DIM_CONTRATO
DIM_PERIODO
```

---

# 6. FACT_REMUNERACIONES

## Descripción

Almacena información económica asociada a remuneraciones.

## Llave lógica

```text
Periodo + Rut + Sociedad
```

---

## Campos

| Campo                  | Tipo    |
| ---------------------- | ------- |
| periodo                | Texto   |
| rut                    | Texto   |
| sociedad_id            | Texto   |
| centro_costo_id        | Texto   |
| cargo_id               | Texto   |
| contrato_id            | Texto   |
| haberes_imponibles     | Decimal |
| haberes_no_imponibles  | Decimal |
| descuentos_legales     | Decimal |
| descuentos_adicionales | Decimal |
| liquido_pago           | Decimal |
| costo_empresa          | Decimal |
| horas_extra            | Decimal |
| dias_trabajados        | Entero  |
| dias_ausencia          | Entero  |

---

## Métricas derivadas

* Costo laboral total.
* Costo promedio trabajador.
* Variación mensual.
* Horas extra promedio.
* Costo por centro de costo.
* Costo por sociedad.

---

# 7. FACT_DOTACION

## Descripción

Almacena información de trabajadores por período.

## Llave lógica

```text
Periodo + Rut + Sociedad
```

---

## Campos

| Campo             | Tipo    |
| ----------------- | ------- |
| periodo           | Texto   |
| rut               | Texto   |
| trabajador_id     | Texto   |
| sociedad_id       | Texto   |
| centro_costo_id   | Texto   |
| cargo_id          | Texto   |
| contrato_id       | Texto   |
| activo_periodo    | Boolean |
| antiguedad_meses  | Entero  |
| fecha_ingreso     | Fecha   |
| fecha_egreso      | Fecha   |
| estado_trabajador | Texto   |

---

## Métricas derivadas

* Dotación total.
* Dotación activa.
* Ingresos.
* Egresos.
* Antigüedad promedio.

---

# 8. DIM_TRABAJADOR

## Descripción

Información maestra del trabajador.

---

## Llave

```text
rut
```

---

## Campos

| Campo           | Tipo  |
| --------------- | ----- |
| rut             | Texto |
| nombre          | Texto |
| fecha_ingreso   | Fecha |
| fecha_egreso    | Fecha |
| estado_actual   | Texto |
| cargo_actual    | Texto |
| sociedad_actual | Texto |

---

## Observaciones

El RUT será el identificador corporativo único.

---

# 9. DIM_SOCIEDAD

## Descripción

Catálogo corporativo de sociedades.

---

## Llave

```text
sociedad_id
```

---

## Campos

| Campo             | Tipo  |
| ----------------- | ----- |
| sociedad_id       | Texto |
| nombre_sociedad   | Texto |
| rut_sociedad      | Texto |
| grupo_empresarial | Texto |
| estado            | Texto |

---

## Situación Actual

Versión V1 contempla:

```text
5 Sociedades
```

La arquitectura deberá permitir incorporar nuevas sociedades sin rediseños.

---

# 10. DIM_CENTRO_COSTO

## Descripción

Catálogo corporativo de centros de costo.

---

## Llave

```text
centro_costo_id
```

---

## Campos

| Campo           | Tipo  |
| --------------- | ----- |
| centro_costo_id | Texto |
| centro_costo    | Texto |
| area            | Texto |
| gerencia        | Texto |
| unidad_negocio  | Texto |
| estado          | Texto |

---

## Objetivo

Permitir análisis organizacional y financiero.

---

# 11. DIM_CARGO

## Descripción

Catálogo de cargos.

---

## Llave

```text
cargo_id
```

---

## Campos

| Campo         | Tipo  |
| ------------- | ----- |
| cargo_id      | Texto |
| cargo         | Texto |
| familia_cargo | Texto |
| nivel_cargo   | Texto |
| estado        | Texto |

---

## Objetivo

Homologar cargos entre sociedades.

---

# 12. DIM_CONTRATO

## Descripción

Información contractual.

---

## Llave

```text
contrato_id
```

---

## Campos

| Campo             | Tipo  |
| ----------------- | ----- |
| contrato_id       | Texto |
| tipo_contrato     | Texto |
| tipo_contratacion | Texto |
| jornada           | Texto |
| modalidad         | Texto |

---

## Objetivo

Permitir segmentaciones laborales.

---

# 13. DIM_PERIODO

## Descripción

Dimensión temporal corporativa.

---

## Llave

```text
periodo
```

---

## Campos

| Campo      | Tipo   |
| ---------- | ------ |
| periodo    | Texto  |
| año        | Entero |
| mes        | Entero |
| nombre_mes | Texto  |
| trimestre  | Entero |
| semestre   | Entero |

---

## Ejemplo

| periodo |
| ------- |
| 2026-01 |
| 2026-02 |
| 2026-03 |

---

# 14. Relaciones

```text
DIM_TRABAJADOR
       │
       ▼
FACT_DOTACION
       ▲
       │
FACT_REMUNERACIONES
       │
       ▼

DIM_SOCIEDAD
DIM_CARGO
DIM_CONTRATO
DIM_CENTRO_COSTO
DIM_PERIODO
```

---

# 15. KPIs Corporativos

## Costos

* Costo laboral total.
* Costo empresa total.
* Costo promedio trabajador.
* Variación mensual.

---

## Dotación

* Dotación total.
* Dotación activa.
* Dotación por sociedad.
* Dotación por centro de costo.

---

## Contratos

* Distribución por contrato.
* Distribución por contratación.

---

## Gestión

* Antigüedad promedio.
* Horas extraordinarias.
* Ausentismo.

---

# 16. Reglas de Negocio

## RN-001

Un trabajador puede existir en múltiples períodos.

---

## RN-002

Un trabajador debe poseer RUT válido.

---

## RN-003

Toda remuneración debe pertenecer a una sociedad.

---

## RN-004

Todo trabajador debe asociarse a un centro de costo.

---

## RN-005

Los períodos son mensuales.

---

## RN-006

No pueden existir duplicados de:

```text
Periodo + Rut + Sociedad
```

---

# 17. Futuras Extensiones

El modelo ha sido diseñado para permitir incorporar:

## Gestión de Ausentismo

* Licencias médicas.
* Permisos.
* Vacaciones.

---

## Gestión de Horas

* Horas ordinarias.
* Horas extraordinarias.
* Jornadas especiales.

---

## Estructura Organizacional

* Gerencias.
* Subgerencias.
* Supervisiones.

---

## Indicadores Avanzados

* Rotación.
* Retención.
* Productividad.
* Costos proyectados.

---

# 18. Arquitectura Objetivo del Modelo

```text
                     DIM_PERIODO
                           │
                           │
                           ▼

DIM_SOCIEDAD ───────── FACT_REMUNERACIONES ───────── DIM_TRABAJADOR
                           │
                           │
                           ▼

                    FACT_DOTACION

                           ▲
                           │

DIM_CARGO ───────── DIM_CONTRATO ───────── DIM_CENTRO_COSTO
```

---

# 19. Conclusión

El presente modelo de datos constituye la estructura oficial de información para Costo Remuneraciones Corporativo V1.

Toda implementación futura deberá respetar este diseño para garantizar consistencia, trazabilidad y escalabilidad.

Las modificaciones estructurales posteriores deberán documentarse mediante control de versiones y decisiones arquitectónicas formales.
