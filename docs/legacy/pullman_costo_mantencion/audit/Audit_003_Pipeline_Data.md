# Auditoría Fase 2 — Pipeline de Datos

## 1. Resumen ejecutivo

El pipeline actual funciona y genera un JSON coherente desde el Excel real. Verifiqué que hoy existe un solo archivo `.xlsx`, que la hoja esperada existe y que el JSON tiene 31 registros válidos sin nulos en los campos usados por React.

Aun así, el pipeline no es suficientemente seguro todavía para considerarlo estable ante cambios operativos. Los principales riesgos son: selección implícita del Excel con `glob("*.xlsx")`, fallback silencioso a la primera hoja, falta de validación estricta de esquema, conversión numérica que puede ocultar errores al convertir valores inválidos a `0`, y exposición de datos personales en un JSON estático desplegado en frontend.

Nivel general: **ALTO**.

## 2. Archivos revisados

- [backend/scripts/export_maintenance_cost_data.py](<C:\Users\Usuario\Desktop\Terminal\2. Proyectos\Costo_Mantención\backend\scripts\export_maintenance_cost_data.py>)
- [data/Base_Maestra_Mantención.xlsx](<C:\Users\Usuario\Desktop\Terminal\2. Proyectos\Costo_Mantención\data\Base_Maestra_Mantención.xlsx>)
- [frontend/src/data/maintenanceCostData.json](<C:\Users\Usuario\Desktop\Terminal\2. Proyectos\Costo_Mantención\frontend\src\data\maintenanceCostData.json>)
- [frontend/src/services/maintenanceCostService.js](<C:\Users\Usuario\Desktop\Terminal\2. Proyectos\Costo_Mantención\frontend\src\services\maintenanceCostService.js>)
- [frontend/src/hooks/useCostDashboard.js](<C:\Users\Usuario\Desktop\Terminal\2. Proyectos\Costo_Mantención\frontend\src\hooks\useCostDashboard.js>)
- [frontend/src/utils/analytics.js](<C:\Users\Usuario\Desktop\Terminal\2. Proyectos\Costo_Mantención\frontend\src\utils\analytics.js>)
- [frontend/src/components/WorkerTable.jsx](<C:\Users\Usuario\Desktop\Terminal\2. Proyectos\Costo_Mantención\frontend\src\components\WorkerTable.jsx>)
- [frontend/src/components/Header.jsx](<C:\Users\Usuario\Desktop\Terminal\2. Proyectos\Costo_Mantención\frontend\src\components\Header.jsx>)
- [frontend/src/components/Login.jsx](<C:\Users\Usuario\Desktop\Terminal\2. Proyectos\Costo_Mantención\frontend\src\components\Login.jsx>)
- [docs/architecture/Data_Flow.md](<C:\Users\Usuario\Desktop\Terminal\2. Proyectos\Costo_Mantención\docs\architecture\Data_Flow.md>)
- [docs/operations/Data_Update_Guide.md](<C:\Users\Usuario\Desktop\Terminal\2. Proyectos\Costo_Mantención\docs\operations\Data_Update_Guide.md>)
- [readme.md](<C:\Users\Usuario\Desktop\Terminal\2. Proyectos\Costo_Mantención\readme.md>)

## 3. Flujo actual detectado

```text
data/Base_Maestra_Mantención.xlsx
→ backend/scripts/export_maintenance_cost_data.py
→ frontend/src/data/maintenanceCostData.json
→ frontend/src/services/maintenanceCostService.js
→ useCostDashboard
→ componentes React / Recharts
```

El frontend no ejecuta Python en runtime. Importa el JSON estáticamente desde React/Vite.

## 4. Fuente Excel detectada

Fuente física actual: `data/Base_Maestra_Mantención.xlsx`.

Estado verificado:

| Elemento | Resultado |
|---|---|
| Excel existe | Sí |
| Único `.xlsx` detectado | Sí |
| Hoja detectada | `Costo_Mantención` |
| Fila de encabezado | índice 1 |
| Filas operativas antes de limpieza | 32 |
| Fila `Total` removida | Sí |
| Registros JSON finales | 31 |
| Centro de negocio actual | `MANTENCION` |

Riesgo: **MEDIO**. La fuente actual es correcta, pero el script no la exige por nombre.

## 5. Riesgos por múltiples archivos Excel

Actualmente solo existe un `.xlsx` en el proyecto. Sin embargo, el script usa:

[export_maintenance_cost_data.py línea 46](<C:\Users\Usuario\Desktop\Terminal\2. Proyectos\Costo_Mantención\backend\scripts\export_maintenance_cost_data.py:46>)

```python
excel_path = next(DATA_DIR.glob("*.xlsx"))
```

Riesgo: **ALTO**.

Si aparece otro Excel en `data/`, el script puede procesar una fuente equivocada sin advertencia. No hay validación explícita de `Base_Maestra_Mantención.xlsx`, ni rechazo cuando hay múltiples archivos.

## 6. Revisión de scripts Python

El script es corto, entendible y cumple el flujo básico. Sus responsabilidades actuales son: detectar Excel, seleccionar hoja, encontrar encabezados, limpiar fila total, normalizar columnas, convertir montos y exportar JSON.

Riesgos detectados:

| Riesgo | Nivel |
|---|---|
| No valida nombre oficial del Excel | ALTO |
| No maneja ausencia de `.xlsx`; fallaría con `StopIteration` poco claro | MEDIO |
| No valida columnas requeridas antes de usarlas | ALTO |
| Detecta encabezado solo buscando `RUT_Sociedad` | MEDIO |
| Convierte numéricos inválidos a `0` con `errors="coerce").fillna(0)` | ALTO |
| No genera reporte de filas descartadas o valores corregidos | MEDIO |
| Metadata `period` queda fija como `Período vigente` | MEDIO |
| No valida que `Total_Costo` cuadre contra componentes | MEDIO |
| No valida duplicados de `RUT_Trabajador` | MEDIO |
| No hay pruebas automatizadas del exportador | MEDIO |

## 7. Revisión de selección de hoja y fallback

La selección actual está en:

[export_maintenance_cost_data.py línea 48](<C:\Users\Usuario\Desktop\Terminal\2. Proyectos\Costo_Mantención\backend\scripts\export_maintenance_cost_data.py:48>)

```python
sheet_name = "Costo_Mantención" if "Costo_Mantención" in workbook.sheet_names else workbook.sheet_names[0]
```

Riesgo: **ALTO**.

La hoja oficial existe hoy, por lo que el resultado actual es correcto. Pero si la hoja se renombra, elimina o llega con un espacio extra, el script no falla: procesa la primera hoja disponible. Ese comportamiento puede generar JSON formalmente válido pero semánticamente incorrecto.

## 8. Revisión del JSON generado

Ubicación:

`frontend/src/data/maintenanceCostData.json`

Estructura actual:

```text
metadata
  sourceFile
  sheet
  period
  workerCount
  companyCount
  totalCost
  columns

records[]
  RUT_Sociedad
  Nombre_Sociedad
  RUT_Trabajador
  Nombre_Trabajador
  Centro_de_Negocio
  Cargo
  Tipo_Trabajador
  Contrato_Trabajador
  Total_Haberes
  Haberes_Imponibles
  AFC_Empresa
  Mutual
  SIS
  Seguro_Social
  Expectativa_de_Vida
  Asignación_Familiar
  Total_Costo
  Empresa_Corta
```

Estado actual del JSON: válido, 31 registros, sin nulos en columnas declaradas, totales numéricos presentes.

Riesgo: **MEDIO**. La estructura es limpia, pero no incluye `generatedAt`, hash/firma de fuente, versión de esquema, conteo de filas descartadas ni advertencias de calidad.

## 9. Revisión del consumo en React

El consumo está centralizado en [maintenanceCostService.js](<C:\Users\Usuario\Desktop\Terminal\2. Proyectos\Costo_Mantención\frontend\src\services\maintenanceCostService.js:1>), lo cual es positivo.

Supuestos fuertes del frontend:

| Campo | Uso |
|---|---|
| `records` | Se asume array existente |
| `metadata` | Se asume objeto existente |
| `Nombre_Sociedad` | filtros, ranking, empresas |
| `Cargo` | filtros y ranking |
| `Tipo_Trabajador` | filtros y badge |
| `Contrato_Trabajador` | filtros y badge |
| `RUT_Trabajador` | conteo único y key de tabla |
| `Nombre_Trabajador` | tabla |
| `Total_Haberes` | tabla |
| `Total_Costo` | KPIs, ranking, ordenamiento |
| campos de costo | desglose en `analytics.js` |

Riesgo: **ALTO**. Si falta `records`, `metadata`, `Total_Costo`, `RUT_Trabajador` o cambian nombres de columnas, la app puede fallar o mostrar métricas erróneas sin un mensaje claro.

## 10. Riesgos técnicos encontrados

| Riesgo | Nivel |
|---|---|
| Selección no determinística/implícita de Excel | ALTO |
| Fallback silencioso de hoja | ALTO |
| Falta de contrato de esquema versionado | ALTO |
| Falta de validación previa al export | ALTO |
| Conversión silenciosa de montos inválidos a cero | ALTO |
| Dependencias Python no fijadas por versión | MEDIO |
| `requirements.txt` conserva `streamlit` y `plotly` aunque la versión Streamlit fue retirada | BAJO |
| README menciona `Base_Maestra_Mantencion.xlsx` sin acento, distinto al archivo real | MEDIO |
| No hay test automatizado que compare Excel → JSON esperado | MEDIO |
| Login frontend con credenciales hardcodeadas no protege realmente el JSON estático | CRÍTICO si el sitio/dataset es público |

## 11. Riesgos de datos encontrados

| Riesgo | Nivel |
|---|---|
| JSON contiene RUT y nombres de trabajadores | CRÍTICO |
| Datos personales quedan embebidos en bundle/frontend | CRÍTICO |
| No hay anonimización, minimización ni separación de dataset público/privado | ALTO |
| Nulos numéricos se convierten a cero sin trazabilidad | ALTO |
| Columnas faltantes pueden romper exportación o UI | ALTO |
| Variaciones de nombres de columnas no se normalizan robustamente | MEDIO |
| Fila total solo se elimina si `RUT_Trabajador == "total"` | MEDIO |
| No se valida que todas las filas pertenezcan a mantención | MEDIO |
| No se valida formato de RUT | MEDIO |
| No se valida rango razonable de montos | MEDIO |

## 12. Recomendaciones de mejora sin aplicar cambios

| Recomendación | Impacto | Riesgo | Prioridad | Archivos involucrados |
|---|---|---|---|---|
| Exigir explícitamente `data/Base_Maestra_Mantención.xlsx` | Evita procesar fuente equivocada | Bajo | Alta | `backend/scripts/export_maintenance_cost_data.py` |
| Fallar si hay múltiples `.xlsx` en `data/` | Mejora control operativo | Bajo | Alta | `backend/scripts/export_maintenance_cost_data.py` |
| Eliminar fallback automático de hoja | Evita JSON de hoja incorrecta | Medio | Alta | `backend/scripts/export_maintenance_cost_data.py` |
| Validar columnas requeridas antes de transformar | Evita errores tardíos o datos incompletos | Medio | Alta | `backend/scripts/export_maintenance_cost_data.py` |
| Reportar valores numéricos inválidos antes de convertirlos | Evita ocultar errores como ceros | Medio | Alta | `backend/scripts/export_maintenance_cost_data.py` |
| Agregar metadata `generatedAt`, `schemaVersion`, `sourceHash`, `rowCounts` | Mejora trazabilidad | Bajo | Media | script y JSON generado |
| Crear prueba automatizada del contrato JSON | Reduce regresiones | Medio | Media | `backend/tests` o equivalente |
| Documentar diccionario de datos | Mejora mantenibilidad | Bajo | Media | `docs/architecture` |
| Evaluar anonimización o backend protegido para RUT/nombres | Reduce exposición de datos personales | Alto | Alta | arquitectura general |
| Corregir inconsistencias documentales de nombre con/sin acento | Evita errores operativos | Bajo | Media | `readme.md`, docs |

## 13. Cambios sugeridos para una futura rama

Para una rama futura de estabilización, sugeriría agrupar los cambios así:

1. **Contrato de fuente**
   - Definir constante `EXPECTED_EXCEL = DATA_DIR / "Base_Maestra_Mantención.xlsx"`.
   - Fallar si no existe.
   - Fallar si hay otros `.xlsx` en `data/`, o al menos advertir explícitamente.

2. **Contrato de hoja**
   - Exigir `Costo_Mantención`.
   - Eliminar fallback a `workbook.sheet_names[0]`.
   - Mostrar hojas disponibles en el error.

3. **Contrato de esquema**
   - Definir columnas requeridas.
   - Separar columnas monetarias, texto y opcionales.
   - Fallar con mensaje claro si faltan columnas críticas.

4. **Validación de calidad**
   - Detectar nulos en campos críticos.
   - Detectar montos no numéricos antes de convertir.
   - Reportar filas descartadas.
   - Validar duplicados y totales razonables.

5. **Trazabilidad**
   - Agregar `generatedAt`, `sourceFile`, `sourceSheet`, `sourceHash`, `schemaVersion`.
   - Registrar resumen de exportación en consola.

6. **Seguridad de datos**
   - Decidir si el dashboard puede incluir RUT/nombres en frontend estático.
   - Si no, anonimizar o mover datos sensibles detrás de autenticación real.

## 14. Nivel de riesgo general

**ALTO**.

Motivo: el pipeline funciona con el estado exacto actual del repositorio, pero depende de supuestos no endurecidos. Un cambio común en operación mensual, como dejar otro Excel en `data/`, renombrar la hoja, cambiar una columna o introducir montos con formato distinto, puede producir errores o datos incorrectos. Además, la exposición de RUT/nombres en JSON frontend es el riesgo más sensible si el despliegue es accesible fuera de un entorno controlado.

## 15. Próximo paso recomendado

Crear una futura rama de estabilización enfocada solo en controles del pipeline, sin rediseñar frontend ni cambiar visualizaciones. El primer entregable debería ser un validador del Excel antes de exportar JSON, con errores explícitos para archivo incorrecto, hoja ausente, columnas faltantes, múltiples `.xlsx`, datos críticos nulos y montos inválidos.