# Audit 004 — Pipeline Hardening Plan

## 1. Objetivo

Planificar la estabilización gradual del pipeline de datos del proyecto Pullman Control Mantención, manteniendo la arquitectura actual:

```text
Excel real -> Python -> JSON generado -> Frontend React
```

La rama futura `fase-2-pipeline-hardening` debe reducir riesgos operativos, prevenir errores silenciosos, mejorar trazabilidad y proteger la estabilidad de producción sin rediseñar el dashboard.

## 2. Contexto

El dashboard ya se encuentra funcional y desplegado. La fuente oficial de datos es:

```text
data/Base_Maestra_Mantención.xlsx
```

El JSON consumido por React debe seguir siendo un artefacto generado:

```text
frontend/src/data/maintenanceCostData.json
```

El pipeline funciona actualmente, pero la auditoría previa clasificó el riesgo general como ALTO debido a supuestos implícitos en la selección del Excel, hoja, columnas, datos críticos y consumo frontend.

## 3. Riesgos heredados desde la auditoría anterior

| Riesgo | Nivel |
|---|---|
| Selección implícita del Excel mediante `glob("*.xlsx")` | ALTO |
| Procesamiento accidental de otro Excel si existen múltiples `.xlsx` | ALTO |
| Fallback silencioso a la primera hoja si no existe `Costo_Mantención` | ALTO |
| Falta de validación estricta de columnas requeridas | ALTO |
| Conversión silenciosa de valores numéricos inválidos a `0` | ALTO |
| Falta de metadata robusta en el JSON generado | MEDIO |
| React consume el JSON asumiendo estructura completa | ALTO |
| RUT y nombres quedan expuestos en JSON estático frontend | CRÍTICO si el sitio es público |

## 4. Alcance de la rama fase-2-pipeline-hardening

La rama debe incluir cambios pequeños, auditables y reversibles orientados a:

- Validar explícitamente la fuente Excel oficial.
- Evitar procesamiento accidental de archivos no oficiales.
- Exigir la hoja oficial.
- Exigir columnas mínimas requeridas.
- Detectar datos críticos nulos o inválidos.
- Evitar conversiones silenciosas peligrosas.
- Mejorar metadata del JSON generado.
- Agregar validación defensiva mínima en frontend.
- Mantener el JSON como archivo generado desde Python.

## 5. Fuera de alcance

Queda fuera de esta rama:

- Rediseñar visualizaciones.
- Cambiar layout o componentes visuales.
- Cambiar la arquitectura a base de datos.
- Implementar autenticación real.
- Eliminar datos personales sin decisión funcional previa.
- Modificar manualmente `maintenanceCostData.json`.
- Modificar manualmente `Base_Maestra_Mantención.xlsx`.
- Crear un backend runtime.
- Automatizar deployment.
- Refactorizar React fuera de lo necesario para validación defensiva.

## 6. Estrategia de implementación por etapas

La implementación debe avanzar por etapas independientes, cada una con commit propio y validación clara.

Orden recomendado:

1. Contrato de fuente Excel.
2. Contrato de hoja.
3. Contrato de columnas.
4. Validación de datos críticos.
5. Metadata y trazabilidad del JSON.
6. Validación defensiva en frontend.

Cada etapa debe preservar compatibilidad con el dataset actual antes de avanzar a la siguiente.

## 7. Etapa 1 — Contrato de fuente Excel

Objetivo:
Garantizar que el script procese únicamente el archivo Excel oficial.

Archivos involucrados:
- `backend/scripts/export_maintenance_cost_data.py`
- `data/Base_Maestra_Mantención.xlsx`

Cambio propuesto:
- Reemplazar la selección implícita `next(DATA_DIR.glob("*.xlsx"))`.
- Definir una ruta esperada explícita.
- Fallar con error claro si el archivo oficial no existe.
- Detectar si existen otros `.xlsx` en `data/` y detener el proceso o advertir de forma bloqueante.

Riesgo:
BAJO. El cambio es acotado y mejora control operativo.

Impacto:
ALTO. Elimina el riesgo de procesar un Excel equivocado.

Validación esperada:
- Con solo el Excel oficial, el script debe exportar correctamente.
- Sin el Excel oficial, debe fallar con mensaje claro.
- Con múltiples `.xlsx`, debe fallar antes de procesar.

Criterio de aceptación:
- El script solo procesa `data/Base_Maestra_Mantención.xlsx`.
- No existe selección implícita por orden de filesystem.
- El error indica ruta esperada y archivos encontrados.

## 8. Etapa 2 — Contrato de hoja

Objetivo:
Evitar que el script procese una hoja incorrecta cuando falta la hoja oficial.

Archivos involucrados:
- `backend/scripts/export_maintenance_cost_data.py`

Cambio propuesto:
- Exigir la hoja `Costo_Mantención`.
- Eliminar fallback a `workbook.sheet_names[0]`.
- Si la hoja no existe, detener el proceso.
- Incluir en el error la lista de hojas disponibles.

Riesgo:
BAJO. Puede bloquear archivos mal formados, que es el comportamiento deseado.

Impacto:
ALTO. Previene generación de JSON semánticamente incorrecto.

Validación esperada:
- Con hoja oficial, exportación exitosa.
- Con hoja renombrada o ausente, error claro.
- No debe generarse JSON si la hoja oficial falta.

Criterio de aceptación:
- No existe fallback silencioso.
- El script falla antes de leer datos si la hoja oficial no está presente.

## 9. Etapa 3 — Contrato de columnas

Objetivo:
Asegurar que el Excel contenga las columnas mínimas necesarias para exportar y consumir datos correctamente.

Archivos involucrados:
- `backend/scripts/export_maintenance_cost_data.py`
- `frontend/src/utils/analytics.js`
- `frontend/src/hooks/useCostDashboard.js`
- `frontend/src/components/WorkerTable.jsx`

Cambio propuesto:
- Definir lista de columnas requeridas.
- Separar columnas de texto, columnas monetarias y columnas críticas.
- Validar columnas después de detectar encabezados.
- Fallar si falta cualquier columna crítica.
- Reportar columnas faltantes y columnas adicionales.

Riesgo:
MEDIO. Puede revelar dependencias no documentadas del Excel.

Impacto:
ALTO. Reduce quiebres por cambios estructurales del archivo fuente.

Validación esperada:
- El Excel actual debe pasar validación.
- Si falta `Total_Costo`, `RUT_Trabajador`, `Nombre_Sociedad` o campos usados por React, el script debe fallar.
- El error debe listar exactamente las columnas faltantes.

Criterio de aceptación:
- Existe contrato explícito de columnas.
- El script no llega a generar JSON si falta una columna crítica.

## 10. Etapa 4 — Validación de datos críticos

Objetivo:
Detectar datos nulos, vacíos, duplicados o montos inválidos antes de exportar.

Archivos involucrados:
- `backend/scripts/export_maintenance_cost_data.py`

Cambio propuesto:
- Validar nulos en campos críticos:
  - `RUT_Trabajador`
  - `Nombre_Trabajador`
  - `Nombre_Sociedad`
  - `Cargo`
  - `Tipo_Trabajador`
  - `Contrato_Trabajador`
  - `Total_Costo`
- Detectar valores monetarios no convertibles antes de aplicar `fillna(0)`.
- Evitar que valores inválidos se transformen silenciosamente en cero.
- Reportar filas descartadas, fila `Total` removida y conteos finales.
- Evaluar advertencias no bloqueantes para montos cero cuando sean permitidos.

Riesgo:
MEDIO. Podría bloquear una actualización mensual si el Excel viene con problemas reales.

Impacto:
ALTO. Mejora confiabilidad de KPIs, rankings y tabla.

Validación esperada:
- El Excel actual debe pasar.
- Valores monetarios corruptos deben producir error o advertencia bloqueante según criticidad.
- Filas descartadas deben quedar reportadas en consola.

Criterio de aceptación:
- No hay conversión silenciosa de datos inválidos a cero en campos críticos.
- La salida del script entrega resumen claro de validación.

## 11. Etapa 5 — Metadata y trazabilidad del JSON

Objetivo:
Mejorar la capacidad de auditar qué fuente generó el JSON y cuándo.

Archivos involucrados:
- `backend/scripts/export_maintenance_cost_data.py`
- `frontend/src/data/maintenanceCostData.json`
- `frontend/src/components/Header.jsx`

Cambio propuesto:
Agregar metadata al JSON generado, manteniendo compatibilidad con los campos actuales:

```json
{
  "metadata": {
    "sourceFile": "...",
    "sheet": "...",
    "period": "...",
    "workerCount": 31,
    "companyCount": 3,
    "totalCost": 57106410,
    "columns": [],
    "generatedAt": "...",
    "schemaVersion": "1.0.0",
    "sourceHash": "...",
    "rowCountRaw": 32,
    "rowCountExported": 31,
    "rowsDropped": 1
  }
}
```

Riesgo:
BAJO. Se agregan campos sin remover los existentes.

Impacto:
MEDIO/ALTO. Mejora trazabilidad operativa y auditoría mensual.

Validación esperada:
- React debe seguir funcionando aunque ignore campos nuevos.
- JSON debe seguir siendo válido.
- Metadata debe reflejar fuente, hoja, fecha y conteos reales.

Criterio de aceptación:
- El JSON mantiene estructura `metadata` + `records`.
- Los campos actuales no se rompen.
- La metadata permite rastrear generación y fuente.

## 12. Etapa 6 — Validación defensiva en frontend

Objetivo:
Evitar fallas opacas en React si el JSON llega incompleto o con estructura inesperada.

Archivos involucrados:
- `frontend/src/services/maintenanceCostService.js`
- `frontend/src/hooks/useCostDashboard.js`
- Posiblemente `frontend/src/pages/ExecutiveDashboard.jsx`

Cambio propuesto:
- Validar que `dataset.records` sea array.
- Validar que `dataset.metadata` exista.
- Proveer fallback controlado para metadata no crítica.
- Evitar errores runtime por `undefined`.
- Mostrar estado controlado o error técnico si el dataset es inválido.

Riesgo:
MEDIO. Debe implementarse sin cambiar experiencia visual principal.

Impacto:
MEDIO. Mejora resiliencia del frontend ante JSON dañado.

Validación esperada:
- Con JSON actual, no cambia comportamiento visible.
- Con JSON inválido en pruebas locales, la app no debe romper de forma silenciosa.
- La consola debe entregar error claro.

Criterio de aceptación:
- El dashboard sigue funcionando con el JSON actual.
- React no asume ciegamente `records` y `metadata`.
- Errores de contrato son identificables.

## 13. Riesgos de seguridad de datos personales

El JSON actual contiene datos personales, incluyendo nombres y RUT de trabajadores. Al estar dentro de `frontend/src/data`, queda embebido en el build estático y puede ser descargado por cualquier usuario con acceso al sitio.

Riesgo:
CRÍTICO si el dashboard está disponible públicamente o sin autenticación real.

Consideraciones:
- El login actual es visual y no protege el archivo JSON.
- Vercel sirve el frontend como sitio estático.
- Cualquier dato incluido en el bundle debe considerarse expuesto al cliente.

Recomendación futura:
Antes de ampliar distribución del dashboard, tomar una decisión formal:

1. Mantener datos personales aceptando el riesgo en entorno estrictamente privado.
2. Anonimizar RUT y nombres en el JSON.
3. Separar vista ejecutiva agregada de vista nominativa.
4. Implementar backend protegido con autenticación real.
5. Remover datos personales del frontend estático.

Esta decisión no debe implementarse en esta rama sin aprobación funcional y legal/operativa.

## 14. Plan de pruebas manuales

Pruebas mínimas por etapa:

1. Ejecutar exportación con el Excel actual.
2. Confirmar que se genera `frontend/src/data/maintenanceCostData.json`.
3. Confirmar que el JSON es válido.
4. Confirmar que `metadata.sourceFile` es el Excel oficial.
5. Confirmar que `metadata.sheet` es `Costo_Mantención`.
6. Confirmar conteo de registros exportados.
7. Ejecutar `npm.cmd run build` desde `frontend/`.
8. Ejecutar dashboard local.
9. Validar KPIs principales.
10. Validar filtros.
11. Validar rankings.
12. Validar tabla de trabajadores.
13. Revisar `git diff` para confirmar que solo cambiaron archivos esperados.
14. Confirmar que el JSON no fue editado manualmente.

Pruebas negativas recomendadas en entorno local controlado:
- Excel oficial ausente.
- Múltiples `.xlsx` en `data/`.
- Hoja oficial ausente.
- Columna crítica faltante.
- Monto inválido en columna monetaria.
- JSON sin `records`.

## 15. Criterios de aceptación

La rama `fase-2-pipeline-hardening` se considera aceptada si:

- El pipeline sigue generando el dashboard actual sin cambios visuales relevantes.
- El script procesa únicamente el Excel oficial.
- El script falla ante múltiples Excel o fuente ausente.
- El script exige la hoja `Costo_Mantención`.
- El script valida columnas críticas antes de transformar.
- El script no convierte silenciosamente valores críticos inválidos a cero.
- El JSON mantiene compatibilidad con React.
- El JSON contiene metadata adicional de trazabilidad.
- El frontend maneja de forma defensiva datasets incompletos.
- `npm.cmd run build` finaliza correctamente.
- La documentación operativa queda alineada con el comportamiento endurecido.

## 16. Plan de rollback

Rollback por etapa:
- Cada etapa debe ir en commit separado.
- Si una etapa introduce bloqueo no deseado, revertir solo ese commit.
- No revertir commits previos que ya estén validados.
- Mantener copia del JSON anterior mediante Git.
- Si la exportación falla en producción operativa, conservar el último JSON válido hasta corregir el Excel o el script.

Criterio de rollback:
- Build falla.
- Dashboard no carga.
- JSON generado cambia estructura crítica inesperadamente.
- Script bloquea el Excel oficial actual sin causa válida.
- Se detecta impacto visual no previsto.
- Aparecen cambios fuera del alcance.

## 17. Orden recomendado de commits

1. `docs: add pipeline hardening implementation plan`
2. `fix(data): require official Excel source file`
3. `fix(data): enforce maintenance sheet contract`
4. `fix(data): validate required Excel columns`
5. `fix(data): validate critical data before export`
6. `feat(data): add JSON metadata traceability`
7. `fix(frontend): add defensive dataset validation`
8. `docs: update data pipeline operating guide`

## 18. Próximo paso recomendado

El primer cambio real de código en la rama debería ser:

```text
Reemplazar la selección implícita del Excel por una ruta explícita a data/Base_Maestra_Mantención.xlsx y fallar si existen múltiples archivos .xlsx en data/.
```

Ese cambio es pequeño, fácil de revisar, reversible y elimina uno de los riesgos más altos del pipeline sin tocar React, visualizaciones ni estructura del JSON.
