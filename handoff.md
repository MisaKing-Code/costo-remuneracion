# Handoff del Proyecto: Dashboard Ejecutivo de Costo de Mantencion

## Resumen Ejecutivo

Este proyecto construye un dashboard ejecutivo para visualizar costos del area de mantencion de Pullman San Luis.

La version oficial actual es la app React/Vite ubicada en `frontend/`, orientada a una experiencia SaaS / BI corporativa premium. La version antigua en Streamlit fue retirada del repositorio principal por decision del dueno del proyecto; existe respaldo externo, pero ya no forma parte del arbol principal.

La app React cuenta con login visual basico, dashboard protegido por `localStorage`, KPIs, filtros, rankings, grafico donut, desglose de costos y tabla principal. Los datos vienen de un Excel maestro, se exportan a JSON y se consumen estaticamente desde el frontend.

## Objetivo General

Crear una plataforma ejecutiva profesional para analizar costos de mantencion, con estetica corporativa moderna, orientada a gerencia y presentacion interna.

El producto debe transmitir:

- Nivel ejecutivo.
- Sistema corporativo/financiero.
- Dashboard moderno tipo SaaS / BI.
- Lectura rapida de costos, dotacion y composicion por empresa/cargo.

No debe parecer:

- Una planilla.
- Un prototipo academico.
- Un dashboard basico de Streamlit.
- Una plantilla generica.

## Estado Actual

### Version Oficial React / Frontend Moderno

- Carpeta principal: `frontend/`.
- Stack: React, Vite, Tailwind CSS, Recharts, Lucide React.
- Login visual basico implementado.
- Logout implementado en el header del dashboard.
- Datos consumidos desde `frontend/src/data/maintenanceCostData.json`.
- Build de produccion validado previamente con `npm.cmd run build`.

### Version Streamlit Historica

- `app.py` fue retirado del repositorio principal.
- La retirada fue una decision intencional para reducir ruido tecnico y evitar confusion sobre la version oficial.
- Existe respaldo externo de la version Streamlit.
- Si fuera necesario recuperarla, debe restaurarse desde respaldo externo o desde historial Git anterior.

### Datos

- Excel fuente: `data/Base_Maestra_Mantencion.xlsx`.
- Hoja usada: `Costo_Mantencion`.
- JSON exportado: `frontend/src/data/maintenanceCostData.json`.
- Script de exportacion: `backend/scripts/export_maintenance_cost_data.py`.
- El Excel original no debe modificarse.

## Decisiones Arquitectonicas

### Consolidar React como version oficial

Se consolido el proyecto alrededor de `frontend/` y se retiro `app.py` del repositorio principal. Esto permite:

- Evitar confusion sobre cual aplicacion es la vigente.
- Mantener un arbol principal mas limpio y profesional.
- Reducir ruido tecnico asociado a la version historica.
- Enfocar futuras mejoras en la experiencia React/Vite.

La decision queda formalizada en `docs/decisions/ADR-001-retirar-streamlit-app.md`.

### Datos Estaticos en JSON

La app React no lee Excel directamente. Usa un JSON generado desde Python:

```text
Excel -> backend/scripts/export_maintenance_cost_data.py -> frontend/src/data/maintenanceCostData.json -> React
```

Razones:

- Mejor performance en frontend.
- Menos dependencias runtime.
- Despliegue estatico posible.
- Separacion clara entre procesamiento de datos y visualizacion.

### Autenticacion Visual Basica

Se implemento login temporal con credenciales hardcodeadas:

```text
Usuario: Admin
Contrasena: SanLuis2026
```

La sesion se guarda en `localStorage` bajo una clave interna. Esto es solo proteccion visual para presentacion interna; no es seguridad real.

### Componentizacion

La UI se dividio en componentes reutilizables:

- `Login.jsx`
- `Header.jsx`
- `FilterBar.jsx`
- `KpiGrid.jsx`
- `RankingBars.jsx`
- `CompanyDonut.jsx`
- `CostBreakdown.jsx`
- `WorkerTable.jsx`
- `SectionCard.jsx`

La logica de agregacion vive en hooks/utilidades, no mezclada en los componentes visuales.

## Estructura de Carpetas Actual

```text
Costo_Mantencion/
├── .git/
├── AGENTS.md / agents.md
├── HANDOFF.md / handoff.md
├── README.md / readme.md
├── requirements.txt
├── data/
│   └── Base_Maestra_Mantencion.xlsx
├── references/
│   ├── dashboard_referencia.JPG
│   └── login_reference.jpg
├── backend/
│   └── scripts/
│       └── export_maintenance_cost_data.py
├── docs/
│   ├── audit/
│   ├── decisions/
│   ├── roadmap/
│   ├── architecture/
│   └── deployment/
└── frontend/
    ├── public/
    ├── src/
    ├── index.html
    ├── package.json
    ├── package-lock.json
    ├── postcss.config.js
    ├── README.md
    ├── tailwind.config.js
    └── vite.config.js
```

`frontend/node_modules`, `frontend/dist` y `backend/scripts/__pycache__` no deben versionarse.

## Riesgos Conocidos

- **Seguridad**: login no es seguro; cualquiera puede ver credenciales en el bundle.
- **Fuente de verdad manual**: el Excel sigue siendo insumo manual.
- **Datos estaticos**: si cambia el Excel, hay que regenerar JSON.
- **Datos personales**: el JSON puede contener nombres/RUT; revisar politica de publicacion antes de exponer la app.
- **Encoding Windows/PowerShell**: rutas y textos con acentos pueden mostrar mojibake si se manipulan con codificacion incorrecta.
- **Bundle size**: Vite aviso previamente un chunk JS grande por dependencias de visualizacion.

## Reglas de Trabajo Para Futuras Sesiones

1. No modificar el Excel original.
2. No alterar `maintenanceCostData.json` manualmente si el cambio viene del Excel; usar el script de exportacion.
3. Mantener separacion entre:
   - Datos: `src/data`, `src/services`, `src/hooks`.
   - Visualizacion: `src/components`, `src/pages`, `src/layouts`.
   - Utilidades: `src/utils`.
4. Mantener componentes pequenos y reutilizables.
5. Priorizar estetica corporativa premium, dark SaaS, tipo BI financiero.
6. Evitar diseno generico, academicista o estilo Streamlit.
7. Usar assets reales de `frontend/public`.
8. Validar con `npm.cmd run build` despues de cambios relevantes.
9. Si se modifica login, recordar que sigue siendo proteccion visual basica.
10. Si se toca texto con acentos, verificar que no aparezca mojibake.
11. No introducir backend persistente salvo que el usuario lo pida.

## Comandos Utiles

### Frontend React

```bash
cd frontend
npm install
npm.cmd run dev
```

### Build de frontend

```bash
cd frontend
npm.cmd run build
```

### Regenerar JSON desde Excel

```bash
python backend/scripts/export_maintenance_cost_data.py
```

## Referencias Visuales y Assets

### Referencias

- `references/dashboard_referencia.JPG`: referencia del dashboard.
- `references/login_reference.jpg`: referencia del login.

### Assets Reales

- `frontend/public/bus-psl.jpg`: fondo fotografico del login.
- `frontend/public/logo-psl.png`: logo Pullman San Luis.

## Resumen Para Nueva IA

Estas trabajando en un dashboard de costo de mantencion para Pullman San Luis. La version oficial esta en `frontend/`, hecha con React/Vite/Tailwind/Recharts. La version Streamlit historica fue retirada del repositorio principal y solo existe como respaldo externo o en historial Git anterior.

Los datos vienen de `data/Base_Maestra_Mantencion.xlsx`, se procesan con `backend/scripts/export_maintenance_cost_data.py` y se consumen como JSON desde `frontend/src/data/maintenanceCostData.json`.

Antes de hacer cambios, revisa si el usuario pide UI, datos, autenticacion o build/deploy. Manten los cambios acotados. Despues de cambios frontend, intenta `npm.cmd run build`. No modifiques el Excel ni la logica de datos salvo instruccion clara.
