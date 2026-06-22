# Antartur Docs - Start Here

Documentacion tecnica canonica del proyecto. Este indice esta orientado a onboarding de nuevos desarrolladores y a mantenimiento operativo.

## Lectura recomendada (primer dia)

1. [`../README.md`](../README.md): instalacion local base y comandos.
2. [`DOCUMENTATION_INDEX.md`](./DOCUMENTATION_INDEX.md): mapa completo de docs vigentes.
3. [`ARCHITECTURE_DIAGRAM.md`](./ARCHITECTURE_DIAGRAM.md): arquitectura actual, rutas y modulos.
4. [`API_REFERENCE.md`](./API_REFERENCE.md): referencia hibrida de API y endpoints activos.
5. [`SETUP_AND_OPERATIONS.md`](./SETUP_AND_OPERATIONS.md): setup, deploy y runbooks.
6. [`ENVIRONMENT_VARIABLES.md`](./ENVIRONMENT_VARIABLES.md): variables por entorno y criterios.
7. [`TRACEABILITY_AND_DOC_REVIEW.md`](./TRACEABILITY_AND_DOC_REVIEW.md): checklist para validar que docs y codigo sigan sincronizados.

## Alcance actual del sistema

- Frontend publico y admin en Next.js App Router (`src/app/**`).
- API interna versionada por carpetas en `src/app/api/**`.
- Dominio principal: tours, disponibilidad, ordenes/reservas, pagos, notificaciones y configuraciones admin.
- Persistencia en PostgreSQL con Prisma (`prisma/schema.prisma`).
- Integraciones activas: PayPal, Payway, email SMTP/Gmail, reCAPTCHA y cronjobs protegidos por secreto.

## Convenciones de documentacion

- La referencia viva de API es Swagger en `/admin-api-docs`.
- El resumen estatico de endpoints en [`API_REFERENCE.md`](./API_REFERENCE.md) debe mantenerse alineado con `src/app/api/**`.
- Documentos historicos o fuera de vigencia se mueven a [`archive/`](./archive/README.md), no se mezclan con el set canonico.

## Estado

- Ultima actualizacion integral: Abril 2026.
- Cobertura: frontend, backend, endpoints, setup y operacion.

