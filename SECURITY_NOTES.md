# Security Notes

## Estado actual

El login actual del frontend es una proteccion visual client-side para demos y presentaciones internas. Las credenciales estan definidas en el bundle JavaScript y la sesion se guarda en `localStorage`, por lo que no debe considerarse autenticacion productiva ni control de acceso real.

El dataset del dashboard se importa como JSON estatico dentro del frontend. Si el sitio se publica en un hosting estatico accesible por terceros, los datos incluidos en el bundle o assets pueden quedar expuestos aunque exista una pantalla de login visual.

## Requisito para datos sensibles

Antes de desplegar con datos sensibles reales en un entorno no estrictamente controlado, se requiere una estrategia de seguridad productiva:

- Autenticacion real mediante backend o proveedor de identidad.
- Control de acceso server-side por usuario, rol o grupo.
- Evitar exponer datasets sensibles completos en el frontend estatico.
- Definir politicas de sesion, expiracion y revocacion.
- Revisar alcance de publicacion en Vercel o en cualquier plataforma equivalente.
