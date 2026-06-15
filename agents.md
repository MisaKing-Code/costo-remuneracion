# AGENTS.md

## Proyecto

Objetivo:
Construir un dashboard ejecutivo profesional para visualizar costos del area de mantencion.

## Tecnologias preferidas

- React
- Vite
- Tailwind CSS
- Recharts
- Python para procesamiento
- Diseno responsive

## Reglas de trabajo

- Priorizar estetica SaaS moderna.
- Tema oscuro ejecutivo.
- No usar disenos genericos.
- Mantener componentes reutilizables.
- Separar logica, visualizacion y datos.
- Mantener codigo limpio y escalable.

## Inspiracion visual

Usar imagenes dentro de `/references` como guia principal de diseno.

## Importante

- La version oficial vive en `/frontend`.
- La version Streamlit antigua fue retirada del repositorio principal.
- Existe respaldo externo de la version Streamlit historica.
- No modificar `data/Base_Maestra_Mantencion.xlsx` directamente.
- No editar manualmente `frontend/src/data/maintenanceCostData.json`; regenerarlo con el script Python cuando corresponda.

## Comandos utiles

```bash
cd frontend
npm install
npm.cmd run dev
```

```bash
cd frontend
npm.cmd run build
```

```bash
python backend/scripts/export_maintenance_cost_data.py
```
