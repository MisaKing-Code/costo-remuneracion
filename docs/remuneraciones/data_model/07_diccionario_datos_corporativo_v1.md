# DICCIONARIO DE DATOS CORPORATIVO V1

## Proyecto: Costo Remuneraciones Corporativo

**Versión:** 1.0
**Estado:** Aprobado
**Fecha:** Junio 2026

**Documentos Relacionados**

* 02_MODELO_DATOS_CORPORATIVO_V1.md
* 03_ARQUITECTURA_ETL_V1.md
* 06_AUDITORIA_FUNCIONAL_DATOS_V1.md

---

# 1. Objetivo

Definir el catálogo oficial de campos utilizados por Costo Remuneraciones Corporativo.

Este documento establece:

* Definiciones funcionales.
* Significado de cada campo.
* Tipo de dato esperado.
* Reglas de validación.
* Uso dentro del modelo corporativo.

El diccionario constituye la referencia oficial para ETL, análisis y desarrollo.

---

# 2. Fuentes Auditadas

## Dataset Costos Laborales

Archivos auditados:

```text
LCM_costo_012026.xlsx
LTDA_costo_012026.xlsx
SPA_costo_012026.xlsx
SPA_CC_costo_012026.xlsx
SPA_MC_costo_012026.xlsx
```

Resultado:

```text
Estructura Homologada
```

---

## Dataset Dotación

Archivo auditado:

```text
LCM_personal_012026.xlsx
```

Resultado:

```text
Estructura Compatible
```

---

# 3. Convenciones Generales

## Formato de nombres

Todos los campos corporativos deberán utilizar:

```text
snake_case
```

Ejemplo:

```text
total_haberes
fecha_inicio_contrato
centro_negocio
```

---

## Formato de fechas

Formato oficial:

```text
YYYY-MM-DD
```

Ejemplo:

```text
2026-01-31
```

---

## Formato período

Formato oficial:

```text
YYYY-MM
```

Ejemplo:

```text
2026-01
```

---

# 4. Campos Corporativos Remuneraciones

## sociedad

### Descripción

Sociedad a la que pertenece el trabajador.

### Origen

Derivado desde nombre archivo.

Ejemplo:

```text
LTDA_costo_012026.xlsx
```

↓

```text
LTDA
```

### Tipo

Texto

### Obligatorio

Sí

---

## periodo

### Descripción

Período contable de remuneraciones.

### Derivación

Año + Mes

### Tipo

Texto

### Ejemplo

```text
2026-01
```

---

## año

### Descripción

Año del proceso.

### Origen

Columna archivo.

### Tipo

Entero

---

## mes

### Descripción

Mes del proceso.

### Origen

Columna archivo.

### Tipo

Entero

---

## rut

### Descripción

Identificador único del trabajador.

### Tipo

Texto

### Obligatorio

Sí

### Validación

Debe existir.

---

## nombre

### Descripción

Nombre trabajador.

### Tipo

Texto

---

## apellido_paterno

### Descripción

Apellido paterno.

### Tipo

Texto

---

## apellido_materno

### Descripción

Apellido materno.

### Tipo

Texto

---

## centro_negocio

### Descripción

Unidad organizacional reportada por sistema origen.

### Tipo

Texto

### Observación

Pendiente confirmar equivalencia con centro de costo.

---

## total_haberes

### Descripción

Suma total de haberes del trabajador.

### Origen

TOTAL HABERES

### Tipo

Decimal

---

## haberes_imponibles

### Descripción

Haberes imponibles considerados para cálculo previsional.

### Origen

DE ELLOS HABERES IMPONIBLES

### Tipo

Decimal

---

## afc_empresa

### Descripción

Aporte AFC financiado por empresa.

### Tipo

Decimal

---

## mutual

### Descripción

Costo mutualidad.

### Tipo

Decimal

---

## sis

### Descripción

Seguro invalidez y sobrevivencia.

### Tipo

Decimal

---

## trabajo_pesado

### Descripción

Cotización trabajo pesado.

### Tipo

Decimal

---

## cobertura_suspension

### Descripción

Cobertura asociada a suspensión laboral.

### Tipo

Decimal

---

## seguro_social

### Descripción

Costo seguro social.

### Tipo

Decimal

---

## cotizacion_expectativa_vida

### Descripción

Cotización asociada a expectativa de vida.

### Tipo

Decimal

---

## total_asignacion_familiar

### Descripción

Monto asignación familiar.

### Tipo

Decimal

---

## total_costo

### Descripción

Costo total empresa asociado al trabajador.

### Tipo

Decimal

### KPI Principal

Sí

---

# 5. Campos Corporativos Dotación

## rut

### Descripción

Identificador único trabajador.

### Tipo

Texto

---

## nombre

### Descripción

Nombre trabajador.

### Tipo

Texto

---

## apellido_paterno

### Descripción

Apellido paterno.

### Tipo

Texto

---

## apellido_materno

### Descripción

Apellido materno.

### Tipo

Texto

---

## centro_negocio

### Descripción

Centro organizacional asignado.

### Tipo

Texto

---

## cargo

### Descripción

Cargo trabajador.

### Tipo

Texto

---

## tipo_contratacion

### Descripción

Clasificación contractual.

### Tipo

Texto

---

## tipo_trabajador

### Descripción

Estado o categoría laboral.

### Tipo

Texto

### Ejemplo

```text
ACTIVO
```

---

## fecha_inicio_contrato

### Descripción

Fecha inicio relación laboral.

### Tipo

Fecha

---

# 6. Campos Derivados ETL

Los siguientes campos no existen físicamente en archivos fuente.

Serán creados durante procesamiento.

---

## trabajador_id

### Generación

RUT

---

## sociedad_id

### Generación

Sociedad

---

## periodo_id

### Generación

Período

---

## antiguedad_meses

### Generación

Fecha proceso - Fecha ingreso

---

## activo_periodo

### Generación

Boolean

---

## costo_promedio

### Generación

Indicador calculado

---

# 7. Reglas de Validación

## RV-001

RUT obligatorio.

---

## RV-002

Sociedad obligatoria.

---

## RV-003

Período obligatorio.

---

## RV-004

Centro negocio obligatorio.

---

## RV-005

Costo total mayor o igual a cero.

---

## RV-006

No permitir duplicados:

```text
Periodo + Rut + Sociedad
```

---

## RV-007

Fechas válidas.

---

# 8. Catálogos Corporativos

## Catálogo Sociedad

Valores esperados:

```text
LCM
LTDA
SPA
SPA_CC
SPA_MC
```

---

## Catálogo Tipo Trabajador

Valores detectados:

```text
ACTIVO
```

Pendiente ampliar.

---

## Catálogo Tipo Contratación

Pendiente auditoría completa.

---

## Catálogo Centro Negocio

Pendiente consolidación.

---

## Catálogo Cargo

Pendiente consolidación.

---

# 9. KPIs Asociados

## Costos

* Total costo empresa.
* Total haberes.
* Haberes imponibles.
* Costo promedio trabajador.

---

## Dotación

* Dotación activa.
* Dotación por sociedad.
* Dotación por centro negocio.
* Dotación por cargo.

---

## Gestión

* Antigüedad promedio.
* Distribución contratación.
* Distribución trabajadores.

---

# 10. Estado del Diccionario

Estado actual:

```text
Versión Inicial Validada
```

Cobertura actual:

```text
Costos: 100%

Dotación: Parcial
```

Próxima actualización:

```text
Luego de auditar
todos los archivos
de dotación corporativos.
```

---

# 11. Conclusión

El presente diccionario constituye la definición oficial de los datos utilizados por Costo Remuneraciones Corporativo V1.

Toda transformación ETL, modelo analítico, indicador o visualización deberá utilizar las definiciones aquí establecidas para garantizar consistencia, trazabilidad y gobernanza de datos dentro de la plataforma.
