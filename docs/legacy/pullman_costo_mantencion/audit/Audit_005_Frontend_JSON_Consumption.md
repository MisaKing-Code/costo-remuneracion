# Audit 005 — Frontend JSON Consumption

## 1. Objetivo

Documentar la auditoría técnica del consumo de `frontend/src/data/maintenanceCostData.json` en el frontend React del proyecto Pullman Control Mantención.

El objetivo es identificar riesgos antes de implementar una capa defensiva en React, especialmente frente a datasets incompletos, metadata ausente, registros inválidos o estructuras inesperadas.

Esta auditoría no implementa cambios. Sirve como base para una futura:

```text
Fase 2.2 — Frontend Defensive Layer
```

## 2. Alcance

La revisión se concentró en los puntos donde el frontend importa, transforma, agrega o renderiza datos provenientes del JSON generado por el pipeline Excel -> Python -> JSON.

Alcance revisado:

- `frontend/src/services/`
- `frontend/src/hooks/`
- `frontend/src/utils/`
- `frontend/src/components/`
- `frontend/src/pages/ExecutiveDashboard.jsx`

Queda fuera de alcance en esta auditoría:

- Modificar React.
- Modificar el JSON.
- Cambiar visualizaciones.
- Implementar validaciones.
- Cambiar el pipeline Python.

## 3. Archivos revisados

- `frontend/src/services/maintenanceCostService.js`
- `frontend/src/hooks/useCostDashboard.js`
- `frontend/src/utils/analytics.js`
- `frontend/src/utils/formatters.js`
- `frontend/src/pages/ExecutiveDashboard.jsx`
- `frontend/src/components/Header.jsx`
- `frontend/src/components/FilterBar.jsx`
- `frontend/src/components/KpiGrid.jsx`
- `frontend/src/components/RankingBars.jsx`
- `frontend/src/components/CompanyDonut.jsx`
- `frontend/src/components/CostBreakdown.jsx`
- `frontend/src/components/WorkerTable.jsx`

## 4. Flujo de consumo detectado

El flujo actual detectado es:

```text
maintenanceCostData.json
-> maintenanceCostService.getMaintenanceCostDataset()
-> useCostDashboard()
-> ExecutiveDashboard
-> Header / FilterBar / KpiGrid / RankingBars / CompanyDonut / CostBreakdown / WorkerTable
```

El JSON se importa directamente desde `frontend/src/services/maintenanceCostService.js`:

```text
frontend/src/data/maintenanceCostData.json
```

Actualmente no existe una validación previa del contrato del dataset antes de entregarlo al hook principal del dashboard.

## 5. Supuestos fuertes detectados

El frontend asume actualmente que:

- `dataset` siempre existe.
- `dataset.records` siempre existe.
- `dataset.records` siempre es un array.
- `dataset.metadata` siempre existe.
- `metadata.period`, `metadata.sheet` y `metadata.workerCount` siempre existen.
- Cada registro contiene los campos necesarios para filtros, KPIs, rankings, gráficos y tabla.

Campos asumidos por React:

- `RUT_Trabajador`
- `Nombre_Trabajador`
- `Nombre_Sociedad`
- `Cargo`
- `Tipo_Trabajador`
- `Contrato_Trabajador`
- `Total_Haberes`
- `Total_Costo`

También se asume que `Total_Costo` y los campos monetarios usados por analytics son numéricos o convertibles a número.

## 6. Riesgos runtime

Riesgos detectados:

- Si `records` no existe, fallan operaciones como `.map`, `.filter` y `.reduce`.
- Si `records` no es array, el dashboard puede romper durante el render.
- Si `metadata` no existe, `Header` puede fallar al acceder a `metadata.period`, `metadata.sheet` o `metadata.workerCount`.
- Si `options` no contiene arrays válidos, `FilterSelect` puede fallar al ejecutar `options.map`.
- Si `rows` no es array, `WorkerTable` puede fallar con `rows.length` o `rows.slice`.
- Si `data` no es array, componentes como `RankingBars`, `CompanyDonut` o `CostBreakdown` pueden fallar con `.map`.

Estos errores pueden provocar pantalla en blanco si no existe una capa defensiva o error boundary.

## 7. Riesgos de datos

Riesgos detectados:

- Si `Total_Costo` falta, los KPIs y rankings pueden mostrar `0` silenciosamente.
- Si `RUT_Trabajador` falta, el conteo de trabajadores puede ser incorrecto.
- Si `RUT_Trabajador` falta, las keys de tabla pueden quedar duplicadas o `undefined`.
- Si `Nombre_Sociedad` falta, las empresas pueden agruparse como `undefined` o `"Sin dato"`.
- Si `Cargo` falta, rankings y filtros pueden degradarse silenciosamente.
- Si valores monetarios vienen como texto no numérico, `Number(value || 0)` puede producir `NaN`.
- Si aparece `NaN`, puede contaminar KPIs, rankings, porcentajes y gráficos.
- Si `metadata.workerCount` difiere de `records.length` o `metadata.recordCount`, hoy no existe alerta.
- Si hay nulos en campos visuales, algunas áreas pueden renderizar valores vacíos sin aviso operativo.

## 8. Validaciones defensivas recomendadas

Se recomienda implementar una validación centralizada en:

```text
frontend/src/services/maintenanceCostService.js
```

Validaciones recomendadas:

- Validar que `dataset` exista.
- Validar que `dataset.records` sea array.
- Validar que `dataset.metadata` sea objeto.
- Validar campos mínimos de metadata.
- Validar campos mínimos por registro.
- Normalizar fallbacks seguros solo para visualización.
- Evitar que `analytics.js` reciba `undefined` o estructuras inválidas.
- Retornar un estado controlado con información de validez del dataset.
- Mostrar un mensaje técnico controlado si el dataset es inválido.
- Evitar que errores de contrato terminen en pantalla en blanco.

La validación debe detectar contratos rotos sin ocultar errores críticos.

## 9. Prioridad Alta

- Validar `dataset.records` como array.
- Validar `dataset.metadata` como objeto.
- Proteger `Header` contra `metadata` inexistente.
- Proteger `useCostDashboard` para no ejecutar `.map`, `.filter` o `.reduce` sobre valores inválidos.
- Definir campos mínimos requeridos para frontend:
  - `RUT_Trabajador`
  - `Nombre_Trabajador`
  - `Nombre_Sociedad`
  - `Cargo`
  - `Tipo_Trabajador`
  - `Contrato_Trabajador`
  - `Total_Haberes`
  - `Total_Costo`

## 10. Prioridad Media

- Validar que `Total_Costo` sea numérico.
- Validar que `records.length` coincida con `metadata.recordCount` si existe.
- Agregar fallback visual para metadata no crítica:
  - periodo: `"Sin periodo"`
  - hoja: `"Sin hoja"`
  - registros: `records.length`
- Evitar `NaN` en analytics con conversión numérica controlada.
- Registrar advertencias claras para inconsistencias no bloqueantes.

## 11. Prioridad Baja

- Validar campos opcionales de desglose monetario.
- Registrar advertencias para columnas adicionales no usadas por la UI.
- Mostrar metadata técnica futura como `generatedAt` o `schemaVersion`.
- Crear tests unitarios para utilidades de analytics.

## 12. Nivel de riesgo general

Nivel de riesgo general:

```text
ALTO
```

Justificación:

El pipeline backend ya valida archivo, hoja, columnas y datos críticos. Sin embargo, el frontend aún consume el JSON confiando en que el contrato siempre será correcto. Si el JSON llega incompleto, corrupto o con forma inesperada, pueden producirse errores runtime, pantallas en blanco o métricas silenciosamente incorrectas.

## 13. Próximo cambio recomendado

El próximo cambio recomendado es implementar una capa defensiva centralizada en:

```text
frontend/src/services/maintenanceCostService.js
```

Esta capa debería validar el contrato mínimo del dataset antes de que `useCostDashboard` lo consuma.

La implementación recomendada para la futura Fase 2.2 es:

1. Crear una función interna de validación del dataset.
2. Confirmar `metadata` y `records`.
3. Confirmar campos mínimos por registro.
4. Entregar datos seguros al hook.
5. Exponer un estado de error controlado si el dataset es inválido.

## 14. Conclusión

El consumo actual del JSON funciona con el dataset generado vigente, pero mantiene un acoplamiento fuerte con la forma ideal del archivo. La ausencia de validación en el frontend representa un riesgo operativo relevante, especialmente ante corrupción accidental del JSON, cambios de estructura o fallas de generación no detectadas.

Esta auditoría formaliza la necesidad de una futura:

```text
Fase 2.2 — Frontend Defensive Layer
```

No se implementaron cambios en código durante esta auditoría.
