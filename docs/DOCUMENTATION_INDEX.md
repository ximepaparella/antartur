# Documentation Index

Indice oficial de documentacion activa del proyecto.

## Canonical docs

- [`README_START_HERE.md`](./README_START_HERE.md): punto de entrada para onboarding tecnico.
- [`ARCHITECTURE_DIAGRAM.md`](./ARCHITECTURE_DIAGRAM.md): arquitectura del sistema, modulos y rutas clave.
- [`API_REFERENCE.md`](./API_REFERENCE.md): referencia hibrida de API (Swagger + resumen estatico por dominio).
- [`SETUP_AND_OPERATIONS.md`](./SETUP_AND_OPERATIONS.md): instalacion, despliegue y runbooks operativos.
- [`ENVIRONMENT_VARIABLES.md`](./ENVIRONMENT_VARIABLES.md): variables por entorno y criterios de seguridad.
- [`DATABASE_SCHEMA.md`](./DATABASE_SCHEMA.md): apoyo funcional sobre modelo de datos (complementa Prisma).
- [`TRACEABILITY_AND_DOC_REVIEW.md`](./TRACEABILITY_AND_DOC_REVIEW.md): proceso de validacion docs vs codigo.

## Supporting docs (vigentes, alcance especifico)

- [`CHECKOUT_SEQUENCE_DIAGRAM.md`](./CHECKOUT_SEQUENCE_DIAGRAM.md): secuencia de checkout.
- [`CHECKOUT_ERROR_PAGE.md`](./CHECKOUT_ERROR_PAGE.md): manejo de errores de checkout en frontend.
- [`CALENDAR_MULTIPLE_TIMESLOTS.md`](./CALENDAR_MULTIPLE_TIMESLOTS.md): comportamiento de horarios multiples.
- [`PRICING_MODEL_MIGRATION.md`](./PRICING_MODEL_MIGRATION.md): contexto de evolucion del modelo de precios.
- [`CRONJOBS_DONWEB.md`](./CRONJOBS_DONWEB.md): guia de cronjobs para infraestructura DonWeb.
- [`VPS_DEPLOY.md`](./VPS_DEPLOY.md), [`VERCEL_SETUP.md`](./VERCEL_SETUP.md), [`DOCKER_SETUP.md`](./DOCKER_SETUP.md): guias de plataforma especifica (referencia operativa).
- [`EMAIL_SETUP.md`](./EMAIL_SETUP.md), [`RECAPTCHA_SETUP.md`](./RECAPTCHA_SETUP.md), [`PGADMIN_SETUP.md`](./PGADMIN_SETUP.md): configuraciones puntuales.
- [`CODE_ANALYSIS_AND_IMPROVEMENTS.md`](./CODE_ANALYSIS_AND_IMPROVEMENTS.md): analisis tecnico y deuda (no canonico de onboarding).
- [`TECHNICAL_DOCUMENTATION.md`](./TECHNICAL_DOCUMENTATION.md), [`PRODUCT_DOCUMENTATION_V2.md`](./PRODUCT_DOCUMENTATION_V2.md): documentacion amplia de contexto.

## Archived docs

Los documentos historicos, duplicados o de decisiones ya superadas se movieron a [`archive/README.md`](./archive/README.md).

## Maintenance rule

Cuando se modifica `src/app/**`, `src/app/api/**`, `src/modules/**`, `src/lib/**`, `.env.example` o `package.json`, se debe revisar y actualizar este indice y los docs canonicos relacionados.

