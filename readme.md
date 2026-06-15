# Pullman Costo Remuneraciones Corporativo

Plataforma corporativa de Business Intelligence y analítica de personas para Pullman San Luis.

Este proyecto corresponde a la evolución del sistema **Pullman Control Mantención**, ampliando su alcance hacia una plataforma integral de análisis de costos laborales y gestión de personas.

La solución busca convertirse en la **fuente oficial de información corporativa** para supervisores, jefaturas, gerencia y dirección.

---

# Objetivos del Sistema

La plataforma permite analizar:

* Costos laborales
* Remuneraciones
* Dotación
* Horas extras
* Ausentismo
* Centros de costo
* Centros de negocio
* Empresas del grupo
* Indicadores de gestión de personas

---

# Estado del Proyecto

## Fase Actual

✅ Migración desde Pullman Control Mantención
✅ Arquitectura corporativa definida
✅ Dashboard Ejecutivo React V1
✅ Data Warehouse inicial
✅ Auditoría de arquitectura V1
🚧 ETL Corporativo V1
🚧 Gobierno y calidad de datos
🚧 Indicadores de personas

---

# Arquitectura Tecnológica

## Frontend

* React
* Vite
* Tailwind CSS
* Recharts

## Backend y Procesamiento

* Python
* pandas
* openpyxl

## Versionamiento y Deployment

* Git
* GitHub
* Vercel

---

# Flujo de Datos

```text
Archivos Excel (Defontana)
            ↓
      ETL Python
            ↓
      Data Warehouse
            ↓
       JSON / API
            ↓
     Dashboard React
            ↓
   Usuarios de Negocio
```

---

# Principios del Proyecto

* Escalabilidad
* Simplicidad
* Reutilización
* Calidad de datos
* Automatización
* Auditoría
* Trazabilidad completa

---

# Estructura del Proyecto

```text
Costo_Remuneraciones_Corporativo/
│
├── backend/
│   ├── scripts/
│   ├── logs/
│   └── services/
│
├── data/
│   ├── raw/
│   ├── processed/
│   ├── quality/
│   └── warehouse/
│
├── docs/
│   ├── architecture/
│   ├── decisions/
│   ├── roadmap/
│   ├── audit/
│   └── deployment/
│
├── frontend/
│   ├── public/
│   └── src/
│
├── references/
│
├── requirements.txt
├── README.md
└── .gitignore
```

---

# Ejecución Local

## Instalar dependencias Frontend

```bash
cd frontend
npm install
```

## Ejecutar aplicación en desarrollo

```bash
npm run dev
```

## Generar build de producción

```bash
npm run build
```

---

# Procesamiento de Datos

## Construcción del Data Warehouse

```bash
python -m backend.scripts.build_datawarehouse
```

## Auditoría de Calidad

```bash
python -m backend.scripts.audit_datawarehouse
```

---

# Calidad de Datos

El proyecto considera controles automáticos para:

* Validación de columnas obligatorias
* Detección de valores nulos
* Validación de tipos de datos
* Consistencia de RUT
* Auditoría de cargas
* Historial de procesamiento
* Trazabilidad ETL

---

# Roadmap

## Sprint 01 — ETL Corporativo V1

* [x] Diseño inicial
* [x] Arquitectura base
* [x] Auditoría V1
* [x] Data Warehouse inicial

## Sprint 02 — Dashboard Ejecutivo V1

* [x] KPIs corporativos
* [x] Dashboard React
* [x] Filtros organizacionales
* [x] Visualización ejecutiva

## Sprint 03 — People Analytics V1

* [ ] Ausentismo
* [ ] Horas extras
* [ ] Rotación
* [ ] Antigüedad laboral

## Sprint 04 — Gobierno de Datos

* [ ] Validaciones automáticas
* [ ] Historial de cargas
* [ ] Auditoría ETL
* [ ] Monitoreo de calidad

---

# Estrategia de Desarrollo

## ChatGPT

Utilizado para:

* Arquitectura
* Diseño funcional
* Diseño técnico
* Documentación
* Roadmaps
* Auditorías funcionales
* Auditorías de arquitectura
* Definición de KPIs

## Codex

Utilizado únicamente para:

* Implementación
* Refactorización
* Corrección de bugs
* Cambios estructurales
* Auditorías complejas de código

---

# Licencia

Proyecto interno de Pullman San Luis.

Uso corporativo exclusivo.
