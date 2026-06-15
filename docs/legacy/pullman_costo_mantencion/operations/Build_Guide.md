# Build Guide - Pullman Control Mantencion

## 1. Proposito

Esta guia documenta como preparar el entorno local, ejecutar el frontend, generar datos y construir la version de produccion del sistema Pullman Control Mantencion.

## 2. Requisitos Previos

Dependencias esperadas:

| Herramienta | Uso |
|---|---|
| Node.js | Ejecutar frontend React/Vite |
| npm | Instalar dependencias frontend |
| Python | Ejecutar script de exportacion |
| Pandas | Procesamiento de datos |
| Openpyxl | Lectura de Excel |
| Git | Control de versiones |

## 3. Instalacion De Dependencias Python

Desde la raiz del proyecto, se recomienda trabajar con un entorno virtual cuando el equipo lo considere necesario:

```bash
python -m venv .venv
```

Activacion en PowerShell:

```bash
.venv\Scripts\Activate.ps1
```

El repositorio contiene `requirements.txt`. Para instalar las dependencias Python declaradas:

```bash
pip install -r requirements.txt
```

Si `requirements.txt` no estuviera disponible en una copia futura del proyecto, instalar manualmente las dependencias minimas requeridas para la exportacion:

```bash
pip install pandas openpyxl
```

Validar que Python y las librerias principales estan disponibles:

```bash
python --version
python -c "import pandas, openpyxl; print('Python dependencies OK')"
```

Riesgos:

- Si Pandas u Openpyxl no estan instalados, el script de exportacion fallara.
- En Windows, rutas y nombres con acentos pueden mostrar mojibake en algunas terminales o editores. Confirmar siempre los nombres reales del archivo y la hoja.

## 4. Instalacion Local Del Frontend

Desde la raiz del proyecto:

```bash
cd frontend
npm install
```

Esto instala las dependencias declaradas en:

```text
frontend/package.json
frontend/package-lock.json
```

Regla operativa:

- `frontend/node_modules/` no debe versionarse.
- Si falta `node_modules`, se reconstruye con `npm install`.

## 5. Ejecucion Del Frontend En Desarrollo

Desde `frontend/`:

```bash
npm.cmd run dev
```

Vite mostrara una URL local, normalmente:

```text
http://localhost:5173/
```

Validar:

- La app carga.
- El login aparece.
- El dashboard carga despues del acceso.
- No hay errores visibles.

## 6. Ejecucion Del Script Python

Desde la raiz del proyecto:

```bash
python backend/scripts/export_maintenance_cost_data.py
```

Este comando regenera:

```text
frontend/src/data/maintenanceCostData.json
```

Reglas:

- No ejecutar el script si no se conoce el estado del Excel.
- No editar manualmente el JSON generado.
- Revisar `git diff` despues de generar datos.

## 7. Generacion Del JSON

Flujo:

```text
data/Base_Maestra_Mantención.xlsx
    -> backend/scripts/export_maintenance_cost_data.py
    -> frontend/src/data/maintenanceCostData.json
```

Validar despues de ejecutar:

```bash
git diff -- frontend/src/data/maintenanceCostData.json
```

El JSON debe:

- Ser valido.
- Contener datos esperados.
- Mantener estructura compatible con React.
- No contener cambios manuales no trazables.

## 8. Build De Produccion

Desde `frontend/`:

```bash
npm.cmd run build
```

Resultado esperado:

- Vite genera build exitoso.
- Se crea o actualiza `frontend/dist/`.

Regla operativa:

- `frontend/dist/` es un artefacto generado.
- No debe versionarse salvo decision explicita futura.
- Vercel debe construir desde codigo fuente.

## 9. Validacion Local Post-Build

El `package.json` actual incluye script de preview. Despues de un build exitoso, se puede validar localmente el resultado compilado:

```bash
npm.cmd run preview
```

Supuesto: este comando aplica mientras el script `preview` exista en `frontend/package.json`.

## 10. Validaciones Antes De Commit

Desde la raiz del proyecto:

```bash
git status --short --branch
```

Revisar:

- Que solo existan cambios esperados.
- Que no se haya modificado Excel accidentalmente.
- Que no se haya editado codigo si la tarea era solo datos o documentacion.
- Que no se haya agregado `dist/` o `node_modules/`.

## 11. Troubleshooting

| Problema | Causa probable | Accion |
|---|---|---|
| `npm` no reconocido | Node.js no instalado o PATH incorrecto | Instalar Node.js y reiniciar terminal |
| `npm install` falla | Problema de red o lockfile inconsistente | Revisar error, reintentar, no borrar lockfile sin aprobacion |
| `npm.cmd run dev` falla | Dependencias faltantes | Ejecutar `npm install` |
| Puerto ocupado | Otro proceso usa el puerto de Vite | Usar URL alternativa indicada por Vite o cerrar proceso |
| Build falla | Error de codigo o import | Revisar salida del build |
| Warning de chunk grande | Bundle supera umbral recomendado | Registrar; no bloquea automaticamente |
| Python no reconocido | Python no instalado o PATH incorrecto | Instalar/configurar Python |
| `ModuleNotFoundError: pandas` | Dependencias Python no instaladas | Ejecutar `pip install -r requirements.txt` |
| `ModuleNotFoundError: openpyxl` | Dependencias Python no instaladas | Ejecutar `pip install -r requirements.txt` |
| Error leyendo Excel | Archivo ausente, corrupto o bloqueado | Verificar ubicacion y cerrar Excel |
| Se procesa Excel equivocado | Hay multiples `.xlsx` en `data/` | Mantener solo el Excel oficial durante la exportacion |
| Nombres con caracteres raros | Mojibake por encoding en Windows/PowerShell/editor | Verificar nombres reales con editor UTF-8 o explorador |
| JSON incorrecto | Fuente o transformacion no esperada | Revertir JSON y revisar Excel/script |

## 12. Comandos Oficiales

Instalar frontend:

```bash
cd frontend
npm install
```

Ejecutar frontend:

```bash
cd frontend
npm.cmd run dev
```

Build:

```bash
cd frontend
npm.cmd run build
```

Preview post-build:

```bash
cd frontend
npm.cmd run preview
```

Regenerar datos:

```bash
python backend/scripts/export_maintenance_cost_data.py
```

Revisar Git:

```bash
git status --short --branch
```

## 13. Criterio De Build Exitoso

Un build se considera valido cuando:

- `npm.cmd run build` finaliza sin error.
- El dashboard puede ejecutarse localmente.
- El build puede revisarse con `npm.cmd run preview` cuando el script este disponible.
- No se generaron cambios inesperados en Git.
- El JSON, si cambio, fue generado desde Python.
- No se versionaron artefactos generados como `dist/` o `node_modules/`.
