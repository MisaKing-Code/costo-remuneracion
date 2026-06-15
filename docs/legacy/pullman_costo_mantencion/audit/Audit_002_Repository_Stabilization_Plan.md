# Plan de Estabilización del Repositorio

## Diagnóstico

Leí `HANDOFF.md`, `README.md` y `AGENTS.md`. No encontré un archivo independiente llamado “Auditoría Técnica Inicial”; la auditoría parece estar integrada en `HANDOFF.md`, especialmente en los apartados de problemas pendientes, riesgos conocidos y estado Git/build.

Estado actual de Git:

- Rama actual: `master`
- Tracking: `master...origin/master`
- Último commit: `3311529 Correccion nombres dashboard`
- Remoto: `origin https://github.com/MisaKing-Code/dashboard-mantencion.git`
- Ramas locales:
  - `master`
  - `login-corporativo`
  - `backup-master-antes-login`
  - `mejora-ui-premium`
- Ramas remotas:
  - `origin/master`
  - `origin/login-corporativo`

Estado de trabajo actual:

```text
D  frontend/dist/assets/index-DQIYhlL4.css
D  frontend/dist/assets/index-yaydJVdp.js
M  frontend/dist/index.html
?? HANDOFF.md
?? frontend/dist/assets/index-BLbPy6-s.css
?? frontend/dist/assets/index-C5wv5VtY.js
?? frontend/dist/bus-psl.jpg
?? frontend/dist/logo-psl.png
```

Hallazgos principales:

- No existe `.gitignore`.
- El repositorio tiene `9886` archivos versionados.
- `frontend/node_modules` está versionado con `9844` archivos, aproximadamente `99 MB`.
- `frontend/dist` está versionado parcialmente con `4` archivos antiguos, pero el build actual generó nuevos archivos no versionados.
- `backend/scripts/__pycache__` está versionado con `1` archivo `.pyc`.
- `HANDOFF.md` está sin versionar, aunque funciona como documento clave de continuidad técnica.
- Hay mojibake visible en documentos Markdown (`MantenciÃ³n`, `Ã¡rea`, etc.). No propongo corregirlo en Fase 0 si el alcance aprobado es solo estabilización Git/artefactos, porque tocar textos puede generar ruido de diff.

## Cambios Recomendados

1. Crear `.gitignore` raíz.

Riesgo: bajo.  
Impacto: evita que nuevos artefactos entren al repo.  
Beneficio: ordena Python, React, Vite, Windows y VS Code.  
Rollback: eliminar `.gitignore` o revertir el commit.

2. Dejar de versionar `frontend/node_modules`.

Riesgo: bajo a medio.  
Impacto: reduce masivamente el repo; los entornos deberán usar `npm install` o `npm ci`.  
Beneficio: elimina dependencias generadas, binarios, cachés y ruido de cambios.  
Rollback: se puede recuperar desde Git antes del commit o reinstalar con `npm install`.

3. Dejar de versionar `frontend/dist`.

Riesgo: medio si existe un deploy que sirve directamente desde `dist` versionado.  
Impacto: el build queda como artefacto generado local/CI, no como fuente.  
Beneficio: elimina hashes cambiantes y conflictos después de cada `npm run build`.  
Rollback: restaurar `frontend/dist` desde el commit anterior o volver a versionarlo explícitamente.

4. Dejar de versionar `backend/scripts/__pycache__`.

Riesgo: bajo.  
Impacto: ninguno funcional; Python lo regenera.  
Beneficio: elimina bytecode local dependiente de versión/entorno.  
Rollback: restaurar desde Git o dejar que Python regenere.

5. Versionar `HANDOFF.md`.

Riesgo: bajo.  
Impacto: agrega documentación de continuidad.  
Beneficio: deja trazabilidad técnica oficial para próximas fases.  
Rollback: quitarlo del índice o revertir commit.

6. No tocar dashboard, login, datos ni UI. `app.py` quedaba fuera del alcance original de estabilizacion y su retiro se formaliza posteriormente mediante ADR.

Riesgo: nulo.  
Impacto: respeta el alcance de Fase 0.  
Beneficio: estabilización sin regresión funcional.  
Rollback: no aplica.

## .gitignore Propuesto

```gitignore
# Python
__pycache__/
*.py[cod]
*$py.class
.pytest_cache/
.mypy_cache/
.ruff_cache/
.coverage
htmlcov/
.venv/
venv/
env/
ENV/
pip-wheel-metadata/
*.egg-info/

# Streamlit / local runtime
.streamlit/secrets.toml

# Node / React / Vite
node_modules/
frontend/node_modules/
dist/
frontend/dist/
.vite/
frontend/node_modules/.vite/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Build / caches
.cache/
tmp/
temp/
*.tmp
*.temp

# Environment files
.env
.env.*
!.env.example

# Logs
logs/
*.log

# Windows
Thumbs.db
ehthumbs.db
Desktop.ini
$RECYCLE.BIN/

# VS Code
.vscode/*
!.vscode/extensions.json
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json

# OS/editor noise
.DS_Store
.idea/
```

Nota: propongo ignorar `dist/` y `frontend/dist/` para cubrir builds dentro o fuera del frontend. Si en el futuro se decide desplegar desde `dist` versionado, esta regla debe ajustarse.

## Limpieza Git Propuesta

Archivos/carpetas a sacar del índice Git, sin eliminarlos necesariamente del disco de trabajo:

```text
frontend/node_modules/
frontend/dist/
backend/scripts/__pycache__/
```

Archivos a agregar al índice:

```text
.gitignore
HANDOFF.md
```

No propongo limpiar físicamente todavía. Primero conviene hacer `git rm --cached` para que Git deje de rastrear artefactos, y recién después decidir si se borran carpetas locales como `node_modules` o `dist`.

## Política Oficial de Versionado

| Elemento | Política | Motivo |
|---|---|---|
| `frontend/dist` | No versionar | Artefacto de build con hashes cambiantes. Debe generarse con `npm.cmd run build`. |
| `frontend/node_modules` | No versionar | Dependencias instaladas. Se reconstruye desde `package-lock.json`. |
| `backend/scripts/__pycache__` | No versionar | Bytecode generado por Python, dependiente del entorno. |
| `frontend/package-lock.json` | Sí versionar | Bloquea versiones reproducibles para `npm ci`/deploy. |
| `frontend/src/data/maintenanceCostData.json` | Sí versionar por ahora | La app React lo consume estáticamente. Debe regenerarse con script, no editarse manualmente. |
| `data/Base_Maestra_Mantención.xlsx` | Sí versionar si es fuente oficial interna aceptada | Es la fuente de verdad actual. Revisar privacidad si el repo se comparte. |
| `frontend/public/bus-psl.jpg` | Sí versionar | Asset público real requerido por login/build. |
| `frontend/public/logo-psl.png` | Sí versionar | Asset público real requerido por login/build. |
| `references/*` | Sí versionar | Referencias visuales oficiales del proyecto. |
| `.env` | No versionar | Puede contener secretos o config local. |
| `.env.example` | Sí versionar | Documenta variables sin secretos. |
| `HANDOFF.md` | Sí versionar | Documento técnico de continuidad. |
| `app.py` | Retirado del arbol principal | La version Streamlit historica se conserva en respaldo externo; React/Vite es la version oficial. |

## Secuencia Exacta de Ejecución

1. Confirmar estado limpio esperado y guardar evidencia:

```bash
git status --short --branch
git branch --all --verbose
```

2. Crear rama de trabajo para Fase 0:

```bash
git switch -c codex/fase-0-estabilizacion
```

3. Crear `.gitignore` raíz con el contenido propuesto.

4. Sacar artefactos generados del índice Git, manteniéndolos en disco local:

```bash
git rm -r --cached frontend/node_modules
git rm -r --cached frontend/dist
git rm -r --cached backend/scripts/__pycache__
```

5. Agregar documentación y reglas de ignore:

```bash
git add .gitignore HANDOFF.md
```

6. Revisar el diff antes de commit:

```bash
git status --short
git diff --cached --stat
git diff --cached -- .gitignore HANDOFF.md
```

7. Validar que no se tocaron archivos prohibidos:

```bash
git diff --cached --name-only
```

Debe no incluir:

```text
frontend/src/
frontend/public/
data/Base_Maestra_Mantención.xlsx
```

8. Commit solo después de aprobación explícita:

```bash
git commit -m "Estabilizar repositorio e ignorar artefactos generados"
```

## Comandos Git Recomendados

Diagnóstico:

```bash
git status --short --branch
git branch --all --verbose
git remote -v
git ls-files | wc -l
git ls-files frontend/node_modules | wc -l
git ls-files frontend/dist
git ls-files backend/scripts/__pycache__
```

Limpieza propuesta:

```bash
git switch -c codex/fase-0-estabilizacion
git rm -r --cached frontend/node_modules
git rm -r --cached frontend/dist
git rm -r --cached backend/scripts/__pycache__
git add .gitignore HANDOFF.md
git status --short
git diff --cached --stat
git commit -m "Estabilizar repositorio e ignorar artefactos generados"
```

En PowerShell, para contar archivos:

```powershell
git ls-files | Measure-Object
git ls-files frontend/node_modules | Measure-Object
git ls-files frontend/dist | Measure-Object
```

## Estrategia de Rollback

Antes del commit:

```bash
git restore --staged .
git restore .gitignore
```

Si se aplicó `git rm --cached` y se quiere cancelar antes del commit:

```bash
git restore --staged frontend/node_modules frontend/dist backend/scripts/__pycache__
git restore frontend/dist
```

Después del commit, rollback completo del commit de estabilización:

```bash
git revert <sha-del-commit-fase-0>
```

Rollback selectivo de `dist` si se descubre que el deploy depende de `frontend/dist` versionado:

```bash
git checkout <commit-anterior> -- frontend/dist
git add frontend/dist
git commit -m "Restaurar dist versionado para despliegue"
```

Rollback selectivo de `node_modules` no recomendado, pero posible:

```bash
git checkout <commit-anterior> -- frontend/node_modules
git add frontend/node_modules
git commit -m "Restaurar node_modules versionado"
```

Mi recomendación técnica original fue aprobar una Fase 0 acotada a `.gitignore` + `git rm --cached` de `node_modules`, `dist` y `__pycache__`, más versionar `HANDOFF.md`.

## Actualizacion posterior de cierre

Despues del commit `7983344`, el dueno del proyecto confirmo que la eliminacion de `app.py` fue intencional. La version Streamlit se retiro del repositorio principal, existe respaldo externo y la version oficial queda consolidada en React/Vite dentro de `frontend/`. La decision formal queda registrada en `docs/decisions/ADR-001-retirar-streamlit-app.md`.
