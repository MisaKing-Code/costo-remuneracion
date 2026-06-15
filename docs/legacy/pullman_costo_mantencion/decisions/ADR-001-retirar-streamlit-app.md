# ADR-001 - Retirar app.py Streamlit del repositorio principal

## Estado

Aceptado

## Contexto

El proyecto tenia una version antigua en Streamlit y una version moderna en React/Vite. La version React/Vite vive en `frontend/` y concentra la experiencia oficial del dashboard ejecutivo, con una arquitectura mas adecuada para una interfaz SaaS / BI corporativa.

La version Streamlit cumplio un rol historico como respaldo funcional, pero mantener `app.py` dentro del repositorio principal generaba ambiguedad sobre cual era la aplicacion vigente.

## Decision

Retirar `app.py` del repositorio principal y conservar un respaldo externo de la version Streamlit historica.

La version oficial actual del proyecto queda consolidada en React/Vite dentro de `frontend/`.

## Motivos

- Reducir ruido tecnico.
- Evitar confusion sobre cual es la version oficial.
- Consolidar el proyecto alrededor del frontend React.
- Mantener el repositorio mas limpio y profesional.

## Consecuencias

- El repositorio ya no contiene la app Streamlit.
- La documentacion debe apuntar a React/Vite como version oficial.
- Cualquier recuperacion de Streamlit debe realizarse desde respaldo externo.
- La fuente de datos Excel y el script Python se mantienen.
- El flujo oficial sigue siendo Excel -> Python -> JSON -> React.

## Rollback

`app.py` puede restaurarse desde el respaldo externo del proyecto o desde el historial Git anterior a esta decision si fuera necesario.
