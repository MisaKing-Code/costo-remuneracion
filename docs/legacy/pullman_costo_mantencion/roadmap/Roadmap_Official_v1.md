# Roadmap Oficial v1 — Pullman Costo Mantención

## 1. Resumen Ejecutivo

Pullman Costo Mantención es un dashboard ejecutivo para visualizar costos del área de mantención de Pullman San Luis. La versión oficial actual vive en `frontend/` y está construida con React, Vite, Tailwind CSS y Recharts. La versión histórica en Streamlit fue retirada formalmente del repositorio principal y se conserva únicamente como respaldo externo.

La Fase 0 ya cerró la estabilización inicial del repositorio: se consolidó React/Vite como versión oficial, se retiraron artefactos generados del índice Git, se creó documentación base y se formalizó la decisión arquitectónica de retirar `app.py`.

El propósito de este roadmap es ordenar la evolución del proyecto desde una base estable hacia una operación documentada, mantenible, segura y preparada para despliegue controlado, evitando rediseños o cambios funcionales sin trazabilidad.

## 2. Principios Rectores

- Estabilidad antes que estética.
- Excel sigue siendo la fuente oficial actual de datos.
- El JSON consumido por React es un artefacto generado desde Python.
- React/Vite dentro de `frontend/` es la versión oficial del sistema.
- No editar manualmente `frontend/src/data/maintenanceCostData.json`.
- No modificar directamente `data/Base_Maestra_Mantencion.xlsx` desde la app.
- Mantener cambios incrementales, revisables y reversibles.
- Mantener enfoque ejecutivo, corporativo y profesional.
- Priorizar una estética SaaS/BI oscura, sobria y no genérica.
- Separar datos, lógica, visualización y documentación operativa.
- Todo cambio importante debe considerar Git, ramas, commits claros y rollback.
- No introducir backend, autenticación real o nuevas funcionalidades sin aprobación explícita.

## 3. Estado Base Posterior a Fase 0

- Repositorio estabilizado después de la auditoría técnica inicial.
- `.gitignore` creado para excluir artefactos generados y archivos locales.
- `frontend/node_modules`, `frontend/dist` y `backend/scripts/__pycache__` removidos del índice Git.
- `app.py` retirado formalmente del repositorio principal.
- Streamlit quedó como antecedente histórico con respaldo externo.
- React/Vite quedó consolidado como versión oficial dentro de `frontend/`.
- Documentación de continuidad actualizada en `handoff.md`.
- ADR inicial creado en `docs/decisions/ADR-001-retirar-streamlit-app.md`.
- Auditoría inicial y plan de estabilización disponibles en `docs/audit/`.
- Rama actual esperada: `master`.
- Estado esperado de tracking: `master...origin/master [ahead 2]`.
- No se ha realizado push de los commits recientes.
- Flujo oficial vigente: Excel → Python → JSON → React.

## 4. Fases del Roadmap

### Fase 1 — Documentación operativa y flujo de datos

**Objetivo**

Consolidar la operación básica del sistema y documentar cómo actualizar datos, ejecutar build y preparar despliegues sin depender de conocimiento tácito.

**Alcance**

Documentación operativa, guías de ejecución y criterios de versionado. No incluye cambios funcionales, visuales ni automatizaciones nuevas.

**Tareas**

- Documentar el flujo Excel → Python → JSON → React.
- Crear o mejorar una guía de actualización de datos.
- Documentar comandos oficiales para Windows/PowerShell.
- Documentar política de archivos versionados y generados.
- Verificar README raíz y README de `frontend/`.
- Crear guía mínima de operación mensual.
- Documentar checklist antes de deploy.
- Aclarar que `maintenanceCostData.json` se regenera, no se edita manualmente.
- Aclarar que el Excel oficial no debe ser modificado por la app.

**Entregables**

- Guía operativa de actualización de datos.
- Checklist mensual de operación.
- Checklist previo a build/deploy.
- README raíz y README frontend revisados o confirmados.

**Riesgos**

- Documentación demasiado extensa o difícil de mantener.
- Instrucciones desalineadas con comandos reales.
- Confusión entre fuente oficial Excel y JSON generado.

**Criterios de término**

- Un operador técnico puede regenerar datos, ejecutar build y preparar despliegue siguiendo documentación.
- La política de archivos versionados queda explícita.
- Los comandos oficiales quedan documentados y probados cuando corresponda.

**Prioridad**

Alta.

**Dependencias**

- Fase 0 cerrada.
- Confirmación de que React/Vite es la versión oficial.
- Script Python actual disponible.

### Fase 2 — Calidad técnica frontend

**Objetivo**

Mejorar mantenibilidad, estructura, rendimiento y validaciones del frontend sin cambiar el alcance funcional del producto.

**Alcance**

Revisión técnica de componentes, hooks, servicios, utilidades, performance y estados de interfaz. No incluye rediseño visual mayor ni nuevas funcionalidades de negocio.

**Tareas**

- Revisar componentes existentes y detectar duplicación real.
- Revisar hooks, services y utils para asegurar separación de responsabilidades.
- Evaluar tamaño de bundle.
- Revisar warning de Vite por chunk grande.
- Evaluar code splitting, especialmente para dashboard/Recharts.
- Revisar accesibilidad básica: labels, foco, teclado, contraste mínimo.
- Revisar responsive desktop, laptop y mobile.
- Mejorar manejo de estados vacíos, errores o datos no disponibles.
- Validar que los cambios mantengan el comportamiento actual.

**Entregables**

- Informe breve de hallazgos frontend.
- Ajustes técnicos acotados, si se aprueban.
- Build de producción validado.
- Evidencia de revisión responsive cuando aplique.

**Riesgos**

- Refactors innecesarios que aumenten el riesgo sin beneficio claro.
- Cambios visuales accidentales.
- Romper agregaciones o filtros existentes.
- Introducir complejidad prematura.

**Criterios de término**

- Build correcto con `npm.cmd run build`.
- Componentes principales siguen funcionando.
- No se altera el flujo de datos.
- Quedan documentados riesgos técnicos remanentes.

**Prioridad**

Media-alta.

**Dependencias**

- Fase 1 recomendada, especialmente comandos y checklist de build.
- Datos JSON actualizados y consistentes.

### Fase 3 — UI/UX corporativa premium

**Objetivo**

Refinar la experiencia visual manteniendo enfoque BI ejecutivo, corporativo y profesional.

**Alcance**

Pulido visual incremental del login, dashboard, jerarquía de información, tablas, gráficos y responsive. No incluye rediseño masivo sin rama, rollback y aprobación.

**Tareas**

- Pulir login manteniendo identidad Pullman San Luis.
- Pulir dashboard con criterio ejecutivo.
- Revisar jerarquía visual de KPIs, rankings, gráficos y tablas.
- Revisar contraste y legibilidad en tema oscuro.
- Revisar tablas y gráficos para lectura gerencial.
- Validar contra referencias visuales en `references/`.
- Evitar rediseños masivos sin plan de rollback.
- Revisar estados hover, foco, loading y vacío.
- Confirmar que la UI no parezca planilla, demo académica ni plantilla genérica.

**Entregables**

- Ajustes UI/UX incrementales.
- Capturas o validación visual desktop/mobile.
- Checklist de consistencia visual contra referencias.

**Riesgos**

- Priorizar estética sobre estabilidad.
- Desalinearse de la identidad ejecutiva del producto.
- Romper responsive o legibilidad.
- Introducir cambios grandes difíciles de revertir.

**Criterios de término**

- Login y dashboard mantienen apariencia corporativa premium.
- No hay solapamientos visuales relevantes en desktop/laptop/mobile.
- Build validado.
- Cambios revisables por commits pequeños.

**Prioridad**

Media.

**Dependencias**

- Fase 2 recomendada para evitar pulir sobre deuda técnica evitable.
- Referencias visuales disponibles.

### Fase 4 — Seguridad y autenticación

**Objetivo**

Pasar desde login visual a una estrategia de autenticación más segura cuando el proyecto lo requiera.

**Alcance**

Análisis, documentación y eventual diseño de autenticación. La implementación de seguridad real debe tratarse como fase separada y aprobada, porque puede requerir backend, proveedor externo o cambios de despliegue.

**Tareas**

- Documentar limitación actual del login visual.
- Aclarar que `localStorage` y credenciales en frontend no son seguridad real.
- Evaluar alternativas: backend mínimo, proveedor externo, protección de plataforma o red interna.
- Definir uso de variables de entorno.
- Evaluar sesiones con expiración.
- Evaluar riesgos por exposición de nombres/RUT en JSON estático.
- Definir alcance de acceso interno o público.
- Documentar riesgos, supuestos y decisión recomendada.

**Entregables**

- Documento de estrategia de autenticación.
- Matriz simple de alternativas, costos y riesgos.
- Recomendación técnica para producción.
- Checklist mínimo antes de exposición pública.

**Riesgos**

- Publicar datos sensibles con protección solo visual.
- Sobrediseñar seguridad antes de confirmar necesidad real.
- Elegir proveedor sin considerar operación interna.
- Romper despliegue estático si se introduce backend sin planificación.

**Criterios de término**

- Limitaciones actuales quedan documentadas.
- Existe decisión explícita sobre alcance interno, público o demo.
- Hay camino aprobado antes de implementar autenticación real.

**Prioridad**

Alta si el sistema será publicado fuera de un entorno controlado. Media si sigue siendo demo interna.

**Dependencias**

- Definición de ambiente de uso.
- Política de privacidad y exposición de datos.
- Fase 6 para despliegue productivo.

### Fase 5 — Automatización de datos

**Objetivo**

Reducir intervención manual en la actualización del JSON y aumentar confiabilidad del proceso de datos.

**Alcance**

Automatización del proceso Excel → Python → JSON, validaciones de estructura y reportes de calidad. No incluye reemplazar Excel por base de datos.

**Tareas**

- Automatizar ejecución del script Python.
- Validar columnas esperadas.
- Validar hoja oficial esperada.
- Validar errores de Excel y datos no numéricos.
- Generar reportes de calidad de datos.
- Evaluar script npm o PowerShell para operación mensual.
- Crear checklist mensual de actualización.
- Evaluar metadata de generación: fecha, fuente y conteo de registros.
- Definir comportamiento ante errores: fallar claro antes de generar JSON inválido.

**Entregables**

- Proceso semiautomatizado o automatizado de generación.
- Validaciones documentadas.
- Reporte de calidad de datos.
- Checklist mensual actualizado.

**Riesgos**

- Sobrescribir JSON con datos incompletos.
- Silenciar errores de Excel.
- Depender de rutas locales frágiles.
- Automatizar sin trazabilidad suficiente.

**Criterios de término**

- El proceso falla con mensajes claros ante estructura inválida.
- La generación del JSON es reproducible.
- El operador puede ejecutar el proceso mensual con baja intervención.
- Se mantiene intacto el Excel fuente.

**Prioridad**

Media.

**Dependencias**

- Fase 1 para documentación operativa.
- Confirmación de columnas oficiales del Excel.
- Política definida sobre versionado del JSON generado.

### Fase 6 — Deployment y operación

**Objetivo**

Formalizar despliegue, rollback y control de producción.

**Alcance**

Definición de entorno de despliegue, comandos, ramas, releases, rollback y control de publicación. No incluye cambios de producto salvo los necesarios para operar.

**Tareas**

- Documentar despliegue en Vercel.
- Definir build command.
- Definir output directory.
- Documentar variables de entorno si existieran.
- Definir push controlado.
- Definir ramas de trabajo y rama estable.
- Evaluar tags o releases por versión.
- Documentar rollback.
- Definir checklist antes y después de deploy.
- Confirmar si el repositorio contiene datos sensibles antes de publicar.

**Entregables**

- Guía de deployment.
- Política de releases/tags.
- Procedimiento de rollback.
- Checklist de publicación.

**Riesgos**

- Desplegar datos sensibles sin autenticación real.
- Usar configuración manual no reproducible.
- Perder trazabilidad entre commit y versión publicada.
- Hacer push de cambios no revisados.

**Criterios de término**

- Hay procedimiento claro para build, deploy y rollback.
- Existe política de ramas y publicación.
- Se puede identificar qué commit está en producción.
- No se hace push sin revisión de estado y diff.

**Prioridad**

Alta antes de producción formal. Media si el proyecto sigue local.

**Dependencias**

- Fase 1 para comandos oficiales.
- Fase 4 si el despliegue expone datos fuera de entorno controlado.

### Fase 7 — Escalabilidad futura

**Objetivo**

Definir evolución posible hacia una plataforma interna más robusta sin comprometer la estabilidad actual.

**Alcance**

Diseño conceptual y evaluación técnica futura. No implica implementación inmediata ni ampliación de alcance sin autorización explícita.

**Tareas**

- Evaluar base de datos futura.
- Evaluar backend real.
- Definir posible modelo de usuarios y roles.
- Evaluar historial de cargas.
- Evaluar auditoría de datos.
- Evaluar APIs internas.
- Definir trazabilidad de generación y cambios.
- Considerar dashboard multiárea solo si se autoriza explícitamente.
- Separar claramente mejoras futuras de necesidades actuales.

**Entregables**

- Documento de visión técnica futura.
- Opciones de arquitectura evolutiva.
- Lista priorizada de capacidades futuras.
- Riesgos y costos preliminares.

**Riesgos**

- Sobrediseñar antes de validar necesidad.
- Convertir un dashboard ejecutivo en plataforma compleja sin sponsor.
- Aumentar costos operativos.
- Desviar foco de la necesidad principal de mantención.

**Criterios de término**

- Hay una visión futura documentada, no implementada por defecto.
- Las capacidades futuras quedan sujetas a autorización explícita.
- Se mantiene el alcance actual estable.

**Prioridad**

Baja-media.

**Dependencias**

- Madurez operativa de fases 1 a 6.
- Decisión de negocio sobre crecimiento del sistema.
- Necesidad real de multiusuario, historial o integración.

## 5. Orden recomendado de ejecución

1. Cerrar y respaldar el estado posterior a Fase 0 con push controlado cuando el dueño lo autorice.
2. Ejecutar Fase 1 para dejar operación y flujo de datos completamente documentados.
3. Ejecutar Fase 2 para mejorar calidad técnica sin alterar alcance funcional.
4. Ejecutar Fase 3 para pulir UI/UX con estabilidad y rollback.
5. Ejecutar Fase 6 si se necesita despliegue formal o publicación controlada.
6. Ejecutar Fase 4 antes de cualquier exposición pública o acceso no controlado a datos.
7. Ejecutar Fase 5 para reducir intervención manual en la actualización mensual.
8. Evaluar Fase 7 solo cuando el producto esté operativamente estable y exista autorización de expansión.

## 6. Política de ramas y commits

- Mantener `master` como rama estable.
- Evitar trabajar directo en `master`, salvo documentación menor y de bajo riesgo.
- Crear ramas por fase, por ejemplo:
  - `codex/fase-1-documentacion-operativa`
  - `codex/fase-2-calidad-frontend`
  - `codex/fase-3-ui-ux-premium`
  - `codex/fase-4-seguridad-auth`
  - `codex/fase-5-automatizacion-datos`
  - `codex/fase-6-deployment-operacion`
  - `codex/fase-7-escalabilidad-futura`
- Usar commits pequeños, descriptivos y reversibles.
- Separar commits de documentación, código, datos generados y configuración.
- No mezclar refactors con cambios visuales o funcionales.
- Antes de cada commit revisar `git status --short` y `git diff`.
- Antes de cambios de mayor riesgo, considerar tag o rama de respaldo.
- Usar `git revert` como estrategia preferente de rollback después de commits publicados.
- Hacer push solo cuando:
  - el working tree esté limpio,
  - el diff haya sido revisado,
  - el build o validación relevante haya pasado,
  - el dueño del proyecto autorice publicar commits locales.

## 7. Definición de “Listo”

Una fase se considera terminada cuando cumple estos criterios generales:

- El alcance acordado fue completado sin cambios colaterales innecesarios.
- La documentación relevante fue creada o actualizada.
- Los comandos aplicables fueron ejecutados o se documentó por qué no aplicaban.
- El build fue validado cuando hubo cambios frontend.
- No se modificó Excel, JSON generado o scripts sin instrucción explícita.
- El estado de Git fue revisado antes del commit.
- Los commits son pequeños, claros y reversibles.
- Los riesgos restantes quedaron documentados.
- Existe un criterio de rollback o recuperación.
- El resultado puede ser retomado por otra persona usando `handoff.md`, README y documentos de `docs/`.

## 8. Próximo paso recomendado

El próximo paso recomendado después de crear este roadmap es revisar y confirmar el documento con el dueño del proyecto. Luego, antes de iniciar nuevas fases, conviene hacer un push controlado de los commits pendientes de Fase 0 y del roadmap oficial, siempre que el estado final del repositorio esté limpio y el dueño autorice publicar a `origin/master`.
