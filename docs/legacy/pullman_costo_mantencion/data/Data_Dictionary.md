# Data Dictionary

## Proyecto

**Pullman Control Mantención**

## Documento

Data Dictionary

## Versión

v1.0

## Fecha

2026-05-29

## Estado

Aprobado

---

# Objetivo

Definir formalmente la estructura de datos utilizada por Pullman Control Mantención.

Este documento establece:

* Campos oficiales.
* Tipos de datos esperados.
* Obligatoriedad.
* Descripción funcional.
* Uso dentro del sistema.

Toda modificación futura de la estructura de datos deberá reflejarse en este documento.

---

# Fuente Oficial

Archivo:

```text
Base_Maestra_Mantención.xlsx
```

Hoja:

```text
Costo_Mantención
```

---

# Diccionario de Datos

| Campo               | Tipo   | Obligatorio | Descripción                                                  |
| ------------------- | ------ | ----------- | ------------------------------------------------------------ |
| RUT_Sociedad        | Texto  | Sí          | RUT de la sociedad empleadora                                |
| Nombre_Sociedad     | Texto  | Sí          | Nombre de la sociedad empleadora                             |
| RUT_Trabajador      | Texto  | Sí          | Identificador único del trabajador                           |
| Nombre_Trabajador   | Texto  | Sí          | Nombre completo del trabajador                               |
| Centro_de_Negocio   | Texto  | Sí          | Centro de negocio asociado al trabajador                     |
| Cargo               | Texto  | Sí          | Cargo desempeñado por el trabajador                          |
| Tipo_Trabajador     | Texto  | Sí          | Clasificación del trabajador                                 |
| Contrato_Trabajador | Texto  | Sí          | Tipo de contrato laboral                                     |
| Total_Haberes       | Número | Sí          | Total de haberes del trabajador                              |
| Haberes_Imponibles  | Número | Sí          | Total imponible utilizado para cálculo previsional           |
| AFC_Empresa         | Número | Sí          | Aporte AFC de cargo de la empresa                            |
| Mutual              | Número | Sí          | Costo asociado a mutualidad                                  |
| SIS                 | Número | Sí          | Seguro de Invalidez y Sobrevivencia                          |
| Seguro_Social       | Número | Sí          | Aporte correspondiente a seguro social                       |
| Expectativa_de_Vida | Número | Sí          | Costo asociado a expectativa de vida según normativa vigente |
| Asignación_Familiar | Número | Sí          | Asignación familiar pagada al trabajador                     |
| Total_Costo         | Número | Sí          | Costo total empresarial asociado al trabajador               |

---

# Reglas Generales

## Tipos Texto

Los campos de texto:

* No deben contener valores nulos.
* Deben conservar formato original.
* No deben ser utilizados para cálculos numéricos.

Campos afectados:

* RUT_Sociedad
* Nombre_Sociedad
* RUT_Trabajador
* Nombre_Trabajador
* Centro_de_Negocio
* Cargo
* Tipo_Trabajador
* Contrato_Trabajador

---

## Tipos Numéricos

Los campos numéricos:

* Deben ser convertibles a número.
* No deben contener texto libre.
* Deben permitir cálculos agregados.

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

---

# Registros Especiales

## Registro de Totales

La hoja puede contener una fila de resumen utilizada únicamente para presentación.

Ejemplo:

```text
RUT_Trabajador = Total
```

Este registro:

* No representa un trabajador real.
* No debe incorporarse al dataset analítico.
* Debe excluirse durante la generación del JSON.

---

# Dependencias del Sistema

Los siguientes componentes dependen directamente de este esquema:

* Pipeline de transformación Excel → JSON
* Validaciones de calidad de datos
* Dashboard React
* KPIs corporativos
* Reportes futuros

Cualquier cambio en nombres de columnas deberá ser evaluado previamente antes de ser implementado.

---

# Control de Cambios

| Versión | Fecha      | Descripción                          |
| ------- | ---------- | ------------------------------------ |
| 1.0     | 2026-05-29 | Creación inicial del Data Dictionary |

---

# Estado

```text
APROBADO
```

Documento base para la Fase 3A — Calidad de Datos Avanzada.
