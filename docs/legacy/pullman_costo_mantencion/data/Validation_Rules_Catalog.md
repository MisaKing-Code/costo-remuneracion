# Validation Rules Catalog

## Proyecto

**Pullman Control Mantención**

## Documento

Validation Rules Catalog

## Versión

v1.0

## Fecha

2026-05-29

## Estado

Aprobado

---

# Objetivo

Definir formalmente las reglas de validación de datos que deben aplicarse sobre la fuente oficial del sistema antes de la generación del dataset consumido por el dashboard.

Estas reglas tienen como finalidad:

* Detectar errores de calidad.
* Evitar datos inconsistentes.
* Proteger el pipeline.
* Garantizar confiabilidad analítica.
* Facilitar auditorías futuras.

---

# Clasificación de Severidad

## Error Crítico

Impide continuar el procesamiento.

Consecuencias:

* Detener generación de JSON.
* Generar mensaje de error.
* Requerir corrección de la fuente.

---

## Warning

Permite continuar.

Consecuencias:

* Registrar advertencia.
* Informar al usuario.
* Mantener trazabilidad.

---

## Informativo

No afecta el procesamiento.

Consecuencias:

* Registrar evento.
* Mantener historial de calidad.

---

# Reglas de Esquema

---

## VR-001 — Hoja Requerida

### Regla

Debe existir la hoja:

```text
Costo_Mantención
```

### Severidad

Error Crítico

---

## VR-002 — Columnas Obligatorias

### Regla

Deben existir todas las columnas definidas en el Data Dictionary.

### Severidad

Error Crítico

### Columnas requeridas

* RUT_Sociedad
* Nombre_Sociedad
* RUT_Trabajador
* Nombre_Trabajador
* Centro_de_Negocio
* Cargo
* Tipo_Trabajador
* Contrato_Trabajador
* Total_Haberes
* Haberes_Imponibles
* AFC_Empresa
* Mutual
* SIS
* Seguro_Social
* Expectativa_de_Vida
* Asignación_Familiar
* Total_Costo

---

## VR-003 — Columnas Duplicadas

### Regla

No deben existir columnas duplicadas.

### Severidad

Error Crítico

---

# Reglas de Registros

---

## VR-004 — Exclusión de Registro Total

### Regla

Los registros utilizados como resumen o totalización no deben incorporarse al dataset analítico.

### Ejemplo

```text
RUT_Trabajador = Total
```

### Severidad

Error Crítico

### Acción

Excluir automáticamente.

---

## VR-005 — Nombre del Trabajador

### Regla

Nombre_Trabajador no puede estar vacío.

### Severidad

Error Crítico

---

## VR-006 — RUT del Trabajador

### Regla

RUT_Trabajador no puede estar vacío.

### Severidad

Error Crítico

---

## VR-007 — Cargo

### Regla

Cargo no puede estar vacío.

### Severidad

Warning

---

## VR-008 — Centro de Negocio

### Regla

Centro_de_Negocio no puede estar vacío.

### Severidad

Error Crítico

---

# Reglas Numéricas

---

## VR-009 — Total_Haberes

### Regla

Debe ser numérico.

### Severidad

Error Crítico

---

## VR-010 — Haberes_Imponibles

### Regla

Debe ser numérico.

### Severidad

Error Crítico

---

## VR-011 — AFC_Empresa

### Regla

Debe ser numérico.

### Severidad

Error Crítico

---

## VR-012 — Mutual

### Regla

Debe ser numérico.

### Severidad

Error Crítico

---

## VR-013 — SIS

### Regla

Debe ser numérico.

### Severidad

Error Crítico

---

## VR-014 — Seguro_Social

### Regla

Debe ser numérico.

### Severidad

Error Crítico

---

## VR-015 — Expectativa_de_Vida

### Regla

Debe ser numérico.

### Severidad

Error Crítico

---

## VR-016 — Asignación_Familiar

### Regla

Debe ser numérico.

### Severidad

Error Crítico

---

## VR-017 — Total_Costo

### Regla

Debe ser numérico.

### Severidad

Error Crítico

---

## VR-018 — Valores Negativos

### Regla

Los costos no deben ser negativos.

Campos afectados:

* Total_Haberes
* Haberes_Imponibles
* AFC_Empresa
* Mutual
* SIS
* Seguro_Social
* Expectativa_de_Vida
* Asignación_Familiar
* Total_Costo

### Severidad

Warning

---

# Reglas de Consistencia

---

## VR-019 — Total_Costo

### Regla

Total_Costo debe ser mayor que cero.

### Severidad

Warning

---

## VR-020 — Registros Duplicados

### Regla

No deberían existir trabajadores duplicados dentro del mismo período analizado.

### Severidad

Warning

### Acción

Generar reporte de revisión.

---

## VR-021 — Valores Vacíos

### Regla

No deberían existir campos vacíos en columnas obligatorias.

### Severidad

Error Crítico

---

# Reglas Informativas

---

## VR-022 — Nuevos Centros de Negocio

### Regla

Detectar centros de negocio no observados anteriormente.

### Severidad

Informativo

---

## VR-023 — Nuevos Cargos

### Regla

Detectar cargos nuevos.

### Severidad

Informativo

---

## VR-024 — Nuevos Tipos de Contrato

### Regla

Detectar nuevas categorías de contrato.

### Severidad

Informativo

---

# Resultado Esperado

Toda ejecución del pipeline deberá producir:

* Validaciones ejecutadas.
* Errores detectados.
* Warnings detectados.
* Eventos informativos.
* Estado final de calidad.

---

# Dependencias

Este catálogo se encuentra directamente relacionado con:

```text
docs/data/Data_Dictionary.md
docs/architecture/Data_Quality_Framework.md
docs/audits/Audit_006_Data_Quality_Review.md
```

---

# Control de Cambios

| Versión | Fecha      | Descripción                                   |
| ------- | ---------- | --------------------------------------------- |
| 1.0     | 2026-05-29 | Creación inicial del catálogo de validaciones |

---

# Estado

```text
APROBADO
```

Documento oficial de validaciones para la Fase 3A — Calidad de Datos Avanzada.
