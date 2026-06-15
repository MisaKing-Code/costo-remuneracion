# Data Update Guide - Pullman Control Mantencion

## 1. Proposito

Esta guia documenta el procedimiento mensual para actualizar los datos del dashboard Pullman Control Mantencion a partir del Excel corporativo oficial.

El objetivo es que una persona distinta al autor original pueda ejecutar el proceso con seguridad, trazabilidad y criterios claros de validacion.

## 2. Alcance

Este procedimiento cubre:

- Preparacion previa.
- Validacion del Excel.
- Ejecucion del script Python.
- Generacion del JSON.
- Validacion local del dashboard.
- Revision Git.
- Recuperacion ante fallos.

Este procedimiento no cubre:

- Modificacion manual del Excel.
- Edicion manual del JSON.
- Cambios de codigo.
- Cambios visuales del dashboard.
- Deployment automatico sin aprobacion.

## 3. Archivos Involucrados

| Archivo | Rol | Politica |
|---|---|---|
| `data/Base_Maestra_Mantención.xlsx` | Fuente oficial | No modificar desde la app |
| `backend/scripts/export_maintenance_cost_data.py` | Script de exportacion | No cambiar durante una actualizacion mensual normal |
| `frontend/src/data/maintenanceCostData.json` | JSON generado | No editar manualmente |

## 4. Preparacion Previa

Antes de ejecutar la actualizacion:

1. Confirmar que se esta trabajando en la copia correcta del repositorio.
2. Confirmar que el Excel actualizado fue recibido desde la fuente corporativa autorizada.
3. Confirmar que el archivo conserva el nombre esperado:

```text
Base_Maestra_Mantención.xlsx
```

4. Confirmar que el archivo se encuentra en:

```text
data/Base_Maestra_Mantención.xlsx
```

5. Confirmar que la hoja esperada existe:

```text
Costo_Mantención
```

6. Revisar estado de Git:

```bash
git status --short --branch
```

## 5. Procedimiento Mensual

### Paso 1 - Revisar Estado Inicial

Ejecutar:

```bash
git status --short --branch
```

Resultado esperado:

- No debe haber cambios inesperados.
- Si existen cambios previos, deben identificarse antes de continuar.

### Paso 2 - Validar Ubicacion Del Excel

Confirmar que el archivo existe:

```text
data/Base_Maestra_Mantención.xlsx
```

No renombrar carpetas ni mover el archivo a otra ruta sin aprobacion tecnica.

### Paso 3 - Ejecutar Script De Exportacion

Desde la raiz del proyecto:

```bash
python backend/scripts/export_maintenance_cost_data.py
```

Resultado esperado:

- El script finaliza sin errores.
- Se actualiza el archivo:

```text
frontend/src/data/maintenanceCostData.json
```

### Paso 4 - Revisar Cambios En Git

Ejecutar:

```bash
git status --short
```

Resultado esperado:

- Debe aparecer modificado el JSON si hubo cambios de datos.
- No deben aparecer cambios inesperados en codigo, assets o scripts.

Durante una actualizacion mensual normal no deberian cambiar archivos de codigo bajo `frontend/src/`.

```text
frontend/src/
frontend/public/
backend/scripts/
docs/
```

Excepcion permitida: `frontend/src/data/maintenanceCostData.json` puede cambiar porque es el artefacto generado por el script Python.

### Paso 5 - Revisar Diff Del JSON

Ejecutar:

```bash
git diff -- frontend/src/data/maintenanceCostData.json
```

Validar:

- Que el archivo siga siendo JSON valido.
- Que los cambios tengan relacion con la actualizacion mensual.
- Que no existan campos corruptos, vacios inesperados o texto roto.

### Paso 6 - Ejecutar Frontend En Desarrollo

Entrar a la carpeta frontend:

```bash
cd frontend
npm.cmd run dev
```

Abrir la URL local indicada por Vite.

Validar visualmente:

- Login carga correctamente.
- Dashboard carga despues del acceso.
- KPIs muestran valores razonables.
- Filtros funcionan.
- Graficos renderizan.
- Tabla muestra registros.
- No hay errores visibles en pantalla.

### Paso 7 - Ejecutar Build De Produccion

Desde `frontend/`:

```bash
npm.cmd run build
```

Resultado esperado:

- Build exitoso.
- Puede aparecer warning de tamano de chunk; actualmente no bloquea por si solo.

### Paso 8 - Revision Final Antes De Commit O Deploy

Volver a raiz del proyecto y ejecutar:

```bash
git status --short --branch
```

Validar:

- Solo hay cambios esperados.
- El JSON fue generado por script.
- No se editaron manualmente datos sensibles.
- No se tocaron archivos fuera del alcance.

## 6. Validaciones Posteriores

| Validacion | Resultado esperado |
|---|---|
| Script Python | Finaliza sin errores |
| JSON | Existe y es legible |
| Dashboard local | Carga sin errores |
| KPIs | Valores consistentes con la actualizacion |
| Filtros | Funcionan correctamente |
| Build | `npm.cmd run build` exitoso |
| Git | Solo cambios esperados |

## 7. Errores Comunes

| Error | Posible causa | Accion recomendada |
|---|---|---|
| No se encuentra el Excel | Archivo movido, renombrado o ausente | Restaurar ubicacion esperada |
| Error leyendo Excel | Archivo corrupto o abierto con bloqueo | Cerrar Excel y reintentar |
| Hoja no encontrada | Hoja renombrada o eliminada | Confirmar hoja `Costo_Mantención` |
| Se procesa un Excel equivocado | Hay mas de un archivo `.xlsx` en `data/` | Dejar solo el Excel oficial durante la exportacion |
| Se procesa una hoja equivocada | No existe la hoja esperada y el script usa una hoja alternativa | Validar nombre exacto `Costo_Mantención` antes de publicar |
| Python no encuentra Pandas u Openpyxl | Dependencias Python no instaladas | Instalar dependencias desde `requirements.txt` |
| JSON no cambia | Excel no tenia cambios o script no proceso fuente esperada | Revisar archivo fuente y salida del script |
| Dashboard sin datos | JSON vacio o estructura incorrecta | Revisar diff y regenerar |
| Build falla | Error de dependencias o codigo existente | Revisar salida del build |
| Caracteres raros | Problema de encoding o mojibake en Windows/PowerShell/editor | Verificar archivo con editor UTF-8 y confirmar nombres reales con el explorador o terminal |

## 8. Recuperacion Ante Fallos

### Caso 1 - El Script Falla

1. No hacer commit.
2. Revisar mensaje de error.
3. Confirmar nombre y ubicacion del Excel.
4. Confirmar que la hoja esperada existe.
5. Reintentar solo si el problema fue corregido.

### Caso 2 - El JSON Queda Incorrecto

Revertir cambios del JSON:

```bash
git restore frontend/src/data/maintenanceCostData.json
```

Luego corregir la causa y volver a ejecutar:

```bash
python backend/scripts/export_maintenance_cost_data.py
```

### Caso 3 - El Dashboard No Carga

1. Confirmar que el JSON es valido.
2. Confirmar que el build o dev server no reporta errores.
3. Revisar si el problema aparecio despues de la actualizacion de datos.
4. Si es necesario, restaurar el JSON anterior con Git.

### Caso 4 - Se Modificaron Archivos Fuera Del Alcance

No continuar hasta identificar la causa.

Si los cambios fueron accidentales y no deben conservarse:

```bash
git restore <archivo>
```

No usar comandos destructivos masivos sin aprobacion.

## 9. Checklist Operativo

| Tarea | Comando/Evidencia | Resultado observado | Fecha/hora | Estado | Observaciones |
|---|---|---|---|---|---|
| Confirmar Excel actualizado | Archivo recibido |  |  | Pendiente |  |
| Confirmar ubicacion del Excel | `data/Base_Maestra_Mantención.xlsx` |  |  | Pendiente |  |
| Revisar estado Git inicial | `git status --short --branch` |  |  | Pendiente |  |
| Ejecutar script Python | `python backend/scripts/export_maintenance_cost_data.py` |  |  | Pendiente |  |
| Revisar JSON generado | `git diff -- frontend/src/data/maintenanceCostData.json` |  |  | Pendiente |  |
| Ejecutar dashboard local | `npm.cmd run dev` |  |  | Pendiente |  |
| Validar KPIs y filtros | Revision visual |  |  | Pendiente |  |
| Ejecutar build | `npm.cmd run build` |  |  | Pendiente |  |
| Revisar estado Git final | `git status --short --branch` |  |  | Pendiente |  |
| Solicitar aprobacion para commit/deploy | Registro de aprobacion |  |  | Pendiente |  |

## 10. Criterio De Exito

La actualizacion mensual se considera correcta cuando:

- El Excel oficial fue procesado sin errores.
- El JSON fue regenerado por el script Python.
- El dashboard local muestra datos consistentes.
- El build de produccion finaliza correctamente.
- Git muestra solo cambios esperados.
- Existe aprobacion antes de commit, push o deploy.
