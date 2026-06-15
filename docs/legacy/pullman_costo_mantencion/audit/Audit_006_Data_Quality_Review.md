# Audit_006 — Data Quality Review

## Proyecto

**Pullman Control Mantención**

## Fecha

2026-05-29

## Estado

Finalizado

## Objetivo

Realizar una auditoría inicial de calidad de datos sobre la fuente oficial del sistema:

```text
Base_Maestra_Mantención.xlsx
```

El propósito de esta auditoría es identificar riesgos, dependencias, oportunidades de mejora y requisitos necesarios para implementar la Fase 3A — Calidad de Datos Avanzada.

---

# Resumen Ejecutivo

Se realizó una revisión estructural de la fuente maestra utilizada por el sistema Pullman Control Mantención.

La base presenta una estructura ordenada y consistente, con un nivel de calidad superior al habitual para sistemas originados desde Excel.

No se detectaron problemas graves de integridad de datos.

Sin embargo, se identificaron riesgos operativos asociados a la ausencia de reglas formales de validación, dependencia de nombres de columnas y presencia de registros especiales utilizados para presentación de información.

La principal conclusión de esta auditoría es que el riesgo actual no proviene de datos incorrectos, sino de la falta de mecanismos formales para garantizar que la calidad actual se mantenga en el tiempo.

---

# Alcance

Fuente auditada:

```text
Base_Maestra_Mantención.xlsx
```

Hoja auditada:

```text
Costo_Mantención
```

La auditoría se enfocó en:

* Estructura de la fuente.
* Encabezados.
* Registros.
* Consistencia general.
* Riesgos para el pipeline.
* Riesgos para el dashboard.
* Preparación para futuras validaciones automáticas.

---

# Estructura Detectada

## Hojas

Se identificó una hoja principal:

```text
Costo_Mantención
```

## Columnas Detectadas

| Campo               |
| ------------------- |
| RUT_Sociedad        |
| Nombre_Sociedad     |
| RUT_Trabajador      |
| Nombre_Trabajador   |
| Centro_de_Negocio   |
| Cargo               |
| Tipo_Trabajador     |
| Contrato_Trabajador |
| Total_Haberes       |
| Haberes_Imponibles  |
| AFC_Empresa         |
| Mutual              |
| SIS                 |
| Seguro_Social       |
| Expectativa_de_Vida |
| Asignación_Familiar |
| Total_Costo         |

---

# Hallazgos

## Hallazgo 001 — Fila de Título Superior

### Descripción

Se detectó una fila de presentación ubicada antes del encabezado real de datos.

Ejemplo:

```text
📊 COSTO DEL ÁREA DE MANTENCIÓN — IQUIQUE/ANTOFAGASTA
```

### Riesgo

Si se agregan filas adicionales antes del encabezado, el pipeline podría interpretar incorrectamente la estructura del archivo.

### Severidad

Media

### Recomendación

Validar explícitamente la ubicación esperada del encabezado y generar error controlado si la estructura cambia.

---

## Hallazgo 002 — Registro de Totales

### Descripción

Se detectó una fila final utilizada para mostrar totales generales.

Ejemplo:

```text
RUT_Trabajador = Total
```

### Riesgo

Si el pipeline interpreta este registro como un trabajador válido, podrían alterarse:

* Totales.
* Promedios.
* Rankings.
* Indicadores.

### Severidad

Alta

### Recomendación

Excluir explícitamente registros de totales durante la transformación de datos.

---

## Hallazgo 003 — Dependencia de Nombres Exactos de Columnas

### Descripción

La estructura actual depende de nombres de columnas específicos.

Ejemplos:

```text
Haberes_Imponibles
Expectativa_de_Vida
Centro_de_Negocio
```

### Riesgo

Cambios menores realizados por usuarios de Excel podrían provocar fallos en el pipeline.

Ejemplo:

```text
Haberes_Imponibles
```

convertido en:

```text
Haberes Imponibles
```

### Severidad

Alta

### Recomendación

Implementar validación automática de esquema antes de generar archivos JSON.

---

## Hallazgo 004 — Ausencia de Reglas Formales de Calidad

### Descripción

No existe documentación formal de reglas de negocio para los campos de la base.

### Riesgo

Las validaciones dependen del conocimiento implícito del desarrollador.

### Severidad

Alta

### Recomendación

Crear:

* Data Dictionary.
* Validation Rules Catalog.
* Data Quality Framework.

---

## Hallazgo 005 — Campos Monetarios sin Reglas Documentadas

### Descripción

Se detectaron múltiples campos monetarios relevantes:

* Total_Haberes
* Haberes_Imponibles
* AFC_Empresa
* Mutual
* SIS
* Seguro_Social
* Expectativa_de_Vida
* Asignación_Familiar
* Total_Costo

### Riesgo

No existe una definición formal de rangos válidos o restricciones esperadas.

### Severidad

Media

### Recomendación

Definir reglas mínimas para todos los campos numéricos críticos.

---

# Evaluación General

| Área Evaluada            | Resultado |
| ------------------------ | --------- |
| Estructura de la Fuente  | Buena     |
| Consistencia General     | Buena     |
| Integridad Aparente      | Buena     |
| Riesgo Operativo         | Medio     |
| Gobernanza de Datos      | Media     |
| Validaciones Formales    | Pendiente |
| Escalabilidad del Modelo | Buena     |

---

# Conclusiones

La fuente de datos presenta una estructura estable y ordenada.

No se detectaron problemas significativos de calidad de información durante la revisión inicial.

Los principales riesgos identificados corresponden a:

* Dependencia de estructura manual.
* Dependencia de nombres de columnas.
* Ausencia de validaciones formales.
* Falta de documentación de reglas de negocio.

La información disponible permite avanzar hacia la siguiente etapa de madurez del proyecto sin necesidad de cambios arquitectónicos mayores.

---

# Recomendaciones

## Prioridad Alta

1. Crear Data Dictionary oficial.
2. Crear Validation Rules Catalog.
3. Definir esquema esperado de columnas.
4. Formalizar reglas para registros especiales (totales).

## Prioridad Media

1. Diseñar Data Quality Framework.
2. Incorporar validaciones automáticas al pipeline.
3. Generar reportes de calidad de datos.

## Prioridad Baja

1. Implementar métricas históricas de calidad.
2. Incorporar monitoreo de anomalías.
3. Diseñar score de calidad de datos.

---

# Próximos Entregables

La presente auditoría habilita la ejecución de los siguientes documentos:

```text
docs/data/Data_Dictionary.md
docs/data/Validation_Rules_Catalog.md
docs/architecture/Data_Quality_Framework.md
```

Estos documentos constituyen la base documental de la Fase 3A — Calidad de Datos Avanzada.

---

# Resultado Final

Estado de la auditoría:

```text
APROBADA
```

La calidad actual de la fuente permite continuar con la evolución del sistema, recomendándose formalizar las reglas de datos antes de incorporar nuevas funcionalidades o automatizaciones.
