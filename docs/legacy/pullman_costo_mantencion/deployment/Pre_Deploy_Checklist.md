# Pre-Deploy Checklist - Pullman Control Mantencion

## 1. Proposito

Este checklist define las verificaciones obligatorias antes de publicar cambios de Pullman Control Mantencion.

Debe ejecutarse antes de cualquier push o despliegue hacia Vercel.

## 2. Informacion Del Deploy

| Campo | Valor |
|---|---|
| Fecha |  |
| Responsable tecnico |  |
| Rama |  |
| Commit candidato |  |
| Commit base |  |
| Rama base |  |
| Tipo de cambio |  |
| Aprobador |  |
| Fecha/hora de inicio |  |

## 3. Validacion De Datos

| Tarea | Responsable | Comando/Evidencia | Resultado observado | Fecha/hora | Estado | Observaciones |
|---|---|---|---|---|---|---|
| Confirmar si el deploy incluye cambios de datos |  | Revision de diff |  |  | Pendiente |  |
| Confirmar que el Excel no fue modificado accidentalmente |  | `git diff -- data/` |  |  | Pendiente |  |
| Confirmar que el JSON fue generado por script Python |  | Registro de ejecucion |  |  | Pendiente |  |
| Revisar diff de `maintenanceCostData.json` |  | `git diff -- frontend/src/data/maintenanceCostData.json` |  |  | Pendiente |  |
| Confirmar que el JSON es valido |  | Revision local/build |  |  | Pendiente |  |
| Revisar posible exposicion de datos sensibles |  | Revision de contenido |  |  | Pendiente |  |
| Confirmar que no se edito manualmente el JSON |  | Trazabilidad de exportacion |  |  | Pendiente |  |
| Confirmar que no hay multiples `.xlsx` en `data/` si hubo exportacion |  | Revision de carpeta `data/` |  |  | Pendiente |  |
| Confirmar dependencias Python instaladas si hubo exportacion |  | `python -c "import pandas, openpyxl"` |  |  | Pendiente |  |

## 4. Validacion Visual

| Tarea | Responsable | Comando/Evidencia | Resultado observado | Fecha/hora | Estado | Observaciones |
|---|---|---|---|---|---|---|
| Validar login en entorno local |  | Revision visual |  |  | Pendiente |  |
| Validar dashboard en entorno local |  | Revision visual |  |  | Pendiente |  |
| Validar que KPIs principales se visualizan correctamente |  | Revision visual |  |  | Pendiente |  |
| Validar que graficos renderizan sin errores |  | Revision visual |  |  | Pendiente |  |
| Validar que la tabla principal muestra registros |  | Revision visual |  |  | Pendiente |  |
| Validar que no hay textos cortados o superpuestos |  | Revision visual |  |  | Pendiente |  |
| Validar que la experiencia mantiene estetica corporativa |  | Revision visual |  |  | Pendiente |  |

## 5. Validacion Funcional

| Tarea | Responsable | Comando/Evidencia | Resultado observado | Fecha/hora | Estado | Observaciones |
|---|---|---|---|---|---|---|
| Validar acceso mediante login visual |  | Revision funcional |  |  | Pendiente |  |
| Validar logout |  | Revision funcional |  |  | Pendiente |  |
| Validar filtros disponibles |  | Revision funcional |  |  | Pendiente |  |
| Validar rankings |  | Revision funcional |  |  | Pendiente |  |
| Validar donut u otros graficos principales |  | Revision funcional |  |  | Pendiente |  |
| Validar navegacion basica del dashboard |  | Revision funcional |  |  | Pendiente |  |
| Confirmar ausencia de errores criticos en consola |  | Consola navegador |  |  | Pendiente |  |

## 6. Validacion De Build

| Tarea | Responsable | Comando/Evidencia | Resultado observado | Fecha/hora | Estado | Observaciones |
|---|---|---|---|---|---|---|
| Ejecutar `npm.cmd run build` desde `frontend/` |  | Comando ejecutado |  |  | Pendiente |  |
| Confirmar build exitoso |  | Salida del build |  |  | Pendiente |  |
| Revisar warnings relevantes |  | Salida del build |  |  | Pendiente |  |
| Ejecutar preview post-build si aplica |  | `npm.cmd run preview` |  |  | Pendiente |  |
| Confirmar que `dist/` no sera versionado |  | `git status --short` |  |  | Pendiente |  |
| Confirmar que `node_modules/` no sera versionado |  | `git status --short` |  |  | Pendiente |  |

## 7. Validacion Git

| Tarea | Responsable | Comando/Evidencia | Resultado observado | Fecha/hora | Estado | Observaciones |
|---|---|---|---|---|---|---|
| Ejecutar `git status --short --branch` |  | Comando ejecutado |  |  | Pendiente |  |
| Revisar `git diff` |  | Comando ejecutado |  |  | Pendiente |  |
| Confirmar que solo hay cambios esperados |  | Revision de diff |  |  | Pendiente |  |
| Confirmar que no hay archivos generados no deseados |  | `git status --short` |  |  | Pendiente |  |
| Confirmar rama correcta |  | `git status --short --branch` |  |  | Pendiente |  |
| Confirmar mensaje de commit claro |  | Mensaje propuesto |  |  | Pendiente |  |
| Confirmar aprobacion antes de push |  | Registro de aprobacion |  |  | Pendiente |  |

## 8. Validacion Vercel

| Tarea | Responsable | Comando/Evidencia | Resultado observado | Fecha/hora | Estado | Observaciones |
|---|---|---|---|---|---|---|
| Confirmar proyecto correcto en Vercel |  | Panel de Vercel |  |  | Pendiente |  |
| Confirmar integracion GitHub -> Vercel |  | Panel de Vercel |  |  | Pendiente |  |
| Confirmar si existe `vercel.json` en el repo |  | Revision del repositorio |  |  | Pendiente |  |
| Confirmar root directory `frontend` |  | Panel de Vercel o config versionada |  |  | Pendiente |  |
| Confirmar build command `npm run build` |  | Panel de Vercel o config versionada |  |  | Pendiente |  |
| Confirmar output directory `dist` |  | Panel de Vercel o config versionada |  |  | Pendiente |  |
| Revisar logs de build si aplica |  | Logs de Vercel |  |  | Pendiente |  |
| Confirmar URL final del deployment |  | URL publicada |  |  | Pendiente |  |

## 9. Rollback Readiness

| Tarea | Responsable | Comando/Evidencia | Resultado observado | Fecha/hora | Estado | Observaciones |
|---|---|---|---|---|---|---|
| Identificar ultimo deployment estable |  | Panel de Vercel |  |  | Pendiente |  |
| Identificar commit estable anterior |  | SHA de Git |  |  | Pendiente |  |
| Confirmar posibilidad de rollback en Vercel |  | Panel de Vercel |  |  | Pendiente |  |
| Confirmar posibilidad de `git revert` |  | SHA objetivo |  |  | Pendiente |  |
| Documentar criterio para activar rollback |  | Registro operativo |  |  | Pendiente |  |
| Confirmar responsable de decision de rollback |  | Nombre/aprobacion |  |  | Pendiente |  |

## 10. Decision Final

| Campo | Valor |
|---|---|
| Deploy aprobado |  |
| Aprobador |  |
| Fecha/hora |  |
| Fecha/hora de cierre |  |
| Observaciones |  |

## 11. Criterio Para No Desplegar

No desplegar si ocurre cualquiera de las siguientes condiciones:

- El build falla.
- El dashboard no carga localmente.
- El JSON fue editado manualmente.
- Hay cambios inesperados en Git.
- Hay riesgo no aprobado de exposicion de datos sensibles.
- No existe camino claro de rollback.
- No hay aprobacion del responsable correspondiente.
