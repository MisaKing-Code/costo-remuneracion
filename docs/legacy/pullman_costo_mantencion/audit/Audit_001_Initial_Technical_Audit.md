# Auditoría Técnica Inicial — Pullman Costo Mantención

## 1. Resumen Ejecutivo
El proyecto está funcional y la arquitectura React/Vite actual es razonable para una versión ejecutiva estática: datos separados, hook de dashboard, servicios, utilidades y componentes reutilizables. El build de producción del frontend fue validado correctamente fuera del sandbox.

El repositorio, sin embargo, requiere estabilización antes de nuevos cambios técnicos importantes. Los riesgos principales son: `node_modules` versionado, `dist` versionado y actualmente sucio, `__pycache__` versionado, ausencia de `.gitignore`, login solo visual con credenciales en frontend, documentación desalineada y datos personales expuestos en JSON estático.

## 2. Estado Actual del Repositorio
**Frontend:** React + Vite + Tailwind + Recharts + Lucide. Estructura correcta: `components`, `hooks`, `services`, `utils`, `pages`, `layouts`. Build OK con warning de chunk grande: JS `562.65 kB`, gzip `160.51 kB`.

**Backend/scripts:** [export_maintenance_cost_data.py](<C:\Users\Usuario\Desktop\Terminal\2. Proyectos\Costo_Mantención\backend\scripts\export_maintenance_cost_data.py:45>) lee Excel, detecta encabezado, limpia filas vacías/total y genera JSON. No modifica el Excel.

**Datos:** Excel oficial: `data/Base_Maestra_Mantención.xlsx`, hoja `Costo_Mantención`, 34 filas x 20 columnas. JSON generado: 31 registros, 3 empresas, costo total `57.106.410`.

**Git:** rama actual `master`, alineada con `origin/master`, pero working tree sucio por `frontend/dist` y `HANDOFF.md` sin versionar. Ramas: `mejora-ui-premium`, `backup-master-antes-login`, `login-corporativo`, `master`.

**Documentación:** `HANDOFF.md` es el documento más completo. Al cierre de Fase 0 se actualiza la documentacion para reflejar React/Vite como version oficial y Streamlit como antecedente historico retirado del arbol principal.

**Deployment:** no hay `vercel.json`. Vercel puede desplegar si se configura root `frontend`, build `npm run build`, output `dist`. No hay variables de entorno.

## 3. Hallazgos Técnicos

| Área | Hallazgo | Severidad | Evidencia | Riesgo | Recomendación |
|---|---|---:|---|---|---|
| Repo | `frontend/node_modules` está versionado: 9844 archivos | Crítico | `git ls-files frontend/node_modules` | Repo pesado, diffs inmanejables, deploy/merge frágil | Agregar `.gitignore` y remover del índice con commit controlado |
| Repo | `frontend/dist` está versionado y sucio | Alto | `git status`: deletes + nuevos assets | Confusión entre código fuente y build generado | Decidir política; recomendado ignorar `dist` si Vercel construye |
| Repo | No existe `.gitignore` | Alto | búsqueda `.gitignore` vacía | Se seguirán versionando artefactos | Crear `.gitignore` raíz profesional |
| Seguridad | Credenciales hardcodeadas | Alto | [Login.jsx](<C:\Users\Usuario\Desktop\Terminal\2. Proyectos\Costo_Mantención\frontend\src\components\Login.jsx:4>) | Cualquiera puede ver usuario/clave en bundle | Mantener solo como demo; para producción usar auth real |
| Seguridad | Sesión depende de `localStorage` | Alto | [App.jsx](<C:\Users\Usuario\Desktop\Terminal\2. Proyectos\Costo_Mantención\frontend\src\App.jsx:8>) | Bypass trivial desde DevTools | No considerar control de acceso real |
| Datos | JSON estático contiene nombres/RUT | Alto | `maintenanceCostData.json` | Datos personales expuestos si el sitio es público | Definir alcance interno o anonimización/auth real |
| Backend | Selecciona primer `.xlsx` disponible | Medio | [export script](<C:\Users\Usuario\Desktop\Terminal\2. Proyectos\Costo_Mantención\backend\scripts\export_maintenance_cost_data.py:46>) | Si aparece otro Excel, puede exportar fuente incorrecta | Usar nombre explícito y error claro |
| Backend | Si no encuentra hoja esperada usa primera hoja | Medio | [export script](<C:\Users\Usuario\Desktop\Terminal\2. Proyectos\Costo_Mantención\backend\scripts\export_maintenance_cost_data.py:48>) | Puede ocultar error de estructura | Fallar explícitamente si falta la hoja oficial |
| Backend | `to_numeric(errors="coerce").fillna(0)` silencia datos inválidos | Medio | [export script](<C:\Users\Usuario\Desktop\Terminal\2. Proyectos\Costo_Mantención\backend\scripts\export_maintenance_cost_data.py:67>) | Costos erróneos sin alerta | Reportar columnas/filas con coerción |
| Frontend | Separación lógica/visual bien encaminada | Bajo | `services`, `hooks`, `utils`, `components` | Bajo riesgo actual | Mantener patrón actual |
| UI/UX | Login visual atractivo pero no validado responsive en navegador | Medio | layout con imagen + panel | Riesgo de contraste/overflow en mobile | Validación visual desktop/mobile con browser |
| UI/UX | Accesibilidad parcial | Medio | inputs sin `type` usuario explícito, selects sin ids, focus básico | Uso menos robusto con teclado/lectores | Mejorar labels, focus visible, estados AA |
| Build | Chunk JS > 500 kB | Bajo | build Vite warning | No bloquea, pero afecta carga inicial | Code splitting de dashboard/Recharts |
| Docs | README raíz desactualizado | Medio | describia Streamlit como app principal | Onboarding confuso | Reescribir README raiz como indice del proyecto React/Vite |
| Encoding | PowerShell muestra mojibake con acentos | Medio | `Get-Content` muestra `MantenciÃ³n`; `rg/node` lee correcto | Riesgo al editar desde consola | Estándar UTF-8 y validación antes de commits |
| Deployment | No hay configuración Vercel explícita | Medio | sin `vercel.json` | Deploy depende de configuración manual | Documentar o agregar `vercel.json` si se desea reproducibilidad |

## 4. Riesgos Principales
1. Repositorio contaminado por `node_modules`, `dist` y `__pycache__`.
2. Seguridad aparente: login visual no protege datos.
3. Exposición de datos personales en un frontend estático.
4. Flujo de datos sin validaciones fuertes ni trazabilidad de generación.
5. Documentación incompleta para operación real.
6. Encoding/rutas con acentos en Windows pueden inducir errores de tooling.

## 5. Roadmap Oficial Propuesto

### Fase 0 — Estabilización del repositorio
Objetivo: limpiar control de versiones sin romper producción.  
Tareas: crear `.gitignore`, remover `node_modules`, `dist` y `__pycache__` del índice; decidir si `dist` queda fuera del repo; commit de estabilización.  
Prioridad: crítica. Riesgo: bajo si se hace con `git rm --cached`. Criterio de término: `git status` limpio y build reproducible desde `frontend`.

### Fase 1 — Documentación y flujo de datos
Objetivo: dejar operación clara.  
Tareas: actualizar README raíz, documentar Excel → Python → JSON → frontend, comandos Windows (`npm.cmd`), política de no edición manual del JSON.  
Prioridad: alta. Riesgo: bajo. Criterio: cualquier dev puede regenerar datos y desplegar.

### Fase 2 — Calidad frontend y UI/UX
Objetivo: mejorar sin reescribir.  
Tareas: validar responsive, focus, contraste, labels; revisar login mobile; lazy load de dashboard/Recharts.  
Prioridad: media. Riesgo: medio. Criterio: build OK y revisión visual desktop/mobile.

### Fase 3 — Seguridad y autenticación
Objetivo: decidir si la app será pública, interna o solo demo.  
Tareas: eliminar expectativa de seguridad si sigue estática; si requiere seguridad, diseñar auth real antes de publicar datos.  
Prioridad: alta si va a internet. Riesgo: alto. Criterio: modelo de acceso aprobado.

### Fase 4 — Automatización de datos
Objetivo: hacer confiable la actualización mensual.  
Tareas: script npm o Makefile, validaciones de schema, reporte de filas inválidas, metadata `generatedAt`/hash.  
Prioridad: media. Riesgo: medio. Criterio: export falla con errores útiles y no toca Excel.

### Fase 5 — Escalabilidad futura
Objetivo: preparar crecimiento sin sobrediseñar.  
Tareas: tests unitarios para `analytics`, posible API o storage si hay múltiples fuentes, CI build.  
Prioridad: baja/media. Riesgo: medio. Criterio: pipeline reproducible y modular.

## 6. Recomendaciones Git
Usar `master` solo como rama estable. Crear ramas cortas tipo `codex/estabilizacion-repo`, `codex/docs-flujo-datos`, `codex/ui-quality-pass`.

Política recomendada: no versionar `frontend/node_modules`, `frontend/dist`, `backend/scripts/__pycache__`, `.env`, caches ni logs. Versionar `package-lock.json`, código fuente, assets públicos y JSON generado solo si se acepta que es artefacto oficial del frontend.

Rollback: taggear un punto estable antes de limpiar, por ejemplo `pre-repo-stabilization-2026-05-29`; commits pequeños y reversibles.

## 7. Próximas Acciones Concretas
1. Crear `.gitignore` y limpiar del índice `node_modules`, `dist`, `__pycache__`.
2. Decidir formalmente si `frontend/dist` se versiona; recomendado: no.
3. Actualizar README raiz para reflejar React como version oficial y Streamlit como respaldo historico externo.
4. Fortalecer `export_maintenance_cost_data.py` con fuente/hoja explícitas y validaciones.
5. Revisar política de publicación por contener RUT/nombres y login no seguro.

El proyecto está listo para cambios técnicos pequeños y controlados, pero antes de avanzar en features o estética necesita estabilización del repositorio. Esa es la primera jugada sana.
