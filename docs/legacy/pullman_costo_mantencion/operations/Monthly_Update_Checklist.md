# Monthly Update Checklist - Pullman Control Mantencion

## Periodo De Actualizacion

Mes:

Responsable principal:

Fecha de ejecucion:

Version o commit base:

Rama base:

Fecha/hora de inicio:

## Checklist Ejecutivo

| Tarea | Responsable | Comando/Evidencia | Resultado observado | Fecha/hora | Estado | Observaciones |
|---|---|---|---|---|---|---|
| Confirmar recepcion del Excel mensual actualizado |  | Archivo recibido |  |  | Pendiente |  |
| Confirmar que el Excel proviene de fuente autorizada |  | Registro de origen |  |  | Pendiente |  |
| Confirmar nombre del archivo `Base_Maestra_Mantención.xlsx` |  | Revision en `data/` |  |  | Pendiente |  |
| Confirmar ubicacion en `data/` |  | `data/Base_Maestra_Mantención.xlsx` |  |  | Pendiente |  |
| Confirmar que no hay multiples `.xlsx` en `data/` |  | Revision de carpeta `data/` |  |  | Pendiente |  |
| Confirmar existencia de hoja `Costo_Mantención` |  | Revision de workbook |  |  | Pendiente |  |
| Confirmar dependencias Python disponibles |  | `python -c "import pandas, openpyxl"` |  |  | Pendiente |  |
| Revisar estado inicial de Git |  | `git status --short --branch` |  |  | Pendiente |  |
| Ejecutar script Python de exportacion |  | `python backend/scripts/export_maintenance_cost_data.py` |  |  | Pendiente |  |
| Confirmar generacion de `maintenanceCostData.json` |  | Revision de archivo |  |  | Pendiente |  |
| Revisar diff del JSON generado |  | `git diff -- frontend/src/data/maintenanceCostData.json` |  |  | Pendiente |  |
| Validar que no se editaron archivos de codigo fuera de alcance |  | `git status --short` |  |  | Pendiente |  |
| Ejecutar frontend local con `npm.cmd run dev` |  | Comando ejecutado |  |  | Pendiente |  |
| Validar carga del login |  | Revision visual |  |  | Pendiente |  |
| Validar carga del dashboard |  | Revision visual |  |  | Pendiente |  |
| Validar KPIs principales |  | Revision visual |  |  | Pendiente |  |
| Validar filtros principales |  | Revision visual |  |  | Pendiente |  |
| Validar graficos |  | Revision visual |  |  | Pendiente |  |
| Validar tabla de datos |  | Revision visual |  |  | Pendiente |  |
| Ejecutar build con `npm.cmd run build` |  | Comando ejecutado |  |  | Pendiente |  |
| Validar preview post-build si aplica |  | `npm.cmd run preview` |  |  | Pendiente |  |
| Revisar estado final de Git |  | `git status --short --branch` |  |  | Pendiente |  |
| Registrar riesgos o anomalias detectadas |  | Registro operativo |  |  | Pendiente |  |
| Solicitar aprobacion para commit |  | Registro de aprobacion |  |  | Pendiente |  |
| Solicitar aprobacion para push/deploy si corresponde |  | Registro de aprobacion |  |  | Pendiente |  |
| Verificar deploy publicado si corresponde |  | URL de Vercel |  |  | Pendiente |  |
| Registrar commit o deployment final |  | SHA/URL |  |  | Pendiente |  |

## Resultado De La Actualizacion

| Campo | Valor |
|---|---|
| Actualizacion completada |  |
| Build validado |  |
| Deploy realizado |  |
| Rollback requerido |  |
| Responsable de aprobacion |  |
| Observaciones finales |  |
| Fecha/hora de cierre |  |
