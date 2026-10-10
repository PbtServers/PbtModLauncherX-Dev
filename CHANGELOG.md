# Historial de cambios de PbtModLauncherX

Este historial resume cambios del fork; no sustituye el historial Git ni atribuye a PbtServers el código heredado de XMCL. No se inventan fechas de lanzamiento.

## 1.0.7 — En preparación, sin publicar

Versión configurada: 1.0.7. Referencia previa a la documentación: `7e6ce52b0b018e660fa4f589cb7f969febc828b2`. No se declara estable: compilación del host y pruebas reales pendientes.

### Integración y personalización

- Integración de upstream `0379941d1997e92b079fdc21e8692c8e45cd8cd7`, conservando historial y arquitectura reorganizada en packages.
- Rebranding visible PbtModLauncherX/PbtServers, iconos oficiales y Discord personalizado; créditos e identificadores técnicos necesarios conservados.
- Revisión de español/catalán y nuevas claves; es-ES predeterminado sin sobrescribir preferencias existentes ni eliminar otros idiomas.

### Reparaciones y funciones

- Correcciones de metadatos/selección de LabyMod, NeoForge, Forge, Fabric, Quilt y OptiFine con regresiones; no se asume equivalencia 1.8/1.8.9.
- Detección compatible de shaders Iris/Oculus/OptiFine, cambios de mods/instancia y estado de interfaz.
- Filtrado y reconocimiento de Minecraft 26.x sin normalizar artificialmente a 1.21.11.
- Iconos de instancia con validación de contenido, persistencia y actualización de URLs; GIF conservados y movimiento reducido contemplado.
- Inicialización, IPC, reintentos y límites de espera para primer inicio; verificación de instalación real pendiente.
- Independencia de cuentas/suscripciones y servicios exclusivos XMCL, alternativas locales y proveedores oficiales conservados.
- Ollama local predeterminado con configuración consentida, proveedores personales opcionales, almacenamiento seguro y herramientas de diagnóstico.
- PbtAdmin: identidad de asistente, PbtinaDev siempre en femenino, conocimiento local con fuentes y distinción entre hechos y parodia.
- Exportación de servidores, recetas Vanilla/Forge/NeoForge/Fabric e instalación manual Quilt; seguridad ZIP y scripts Windows/Linux.
- Clasificación visual Tipo y Servidor, evidencias, dependencias, caché offline y decisiones por instancia.
- Versionado 1.0.7 y actualizador PbtServers: rechazo de fuentes/versiones incorrectas, integridad, cancelación, estado de instalación y protección de clientes antiguos mediante paquete completo.

### Validación y documentación

- Fase 13: typechecks/lint y UI build correctos con alternativa temporal de pnpm. Batería amplia: 2930 tests aprobados, 43 fallidos y 23 omitidos; bloqueos ambientales y limpieza temporal documentados.
- Corrección del test de caché que esperaba conexión XMCL y ampliación de conservación de datos ficticios durante reemplazo de aplicación.
- Fase 14: README renovado, historial y comparativa técnica con referencias Git fijas; comandos auditados sin anunciar instaladores inexistentes.
- Pendiente: host compilado/ejecutado, primera instalación, servidores/Create reales, Ollama real y upgrade completo instalado 1.0.6 → 1.0.7. Ver [matriz de validación](PbtModLauncherX-Data/Modificaciones/VALIDACION-FINAL-v1.0.7.md).

## 1.0.6 — Referencia histórica de publicación

`latest_version.json` conserva el tag `v1.0.6`, última publicación descrita por ese manifiesto. No se asigna aquí una fecha ni se certifica la disponibilidad actual de sus instaladores. Las fases de preparación conservaron esta versión hasta el versionado de Fase 12.

## Versiones anteriores

No se reconstruyen lanzamientos sin evidencias verificadas. Consulta el historial Git y los [informes históricos del proyecto](PbtModLauncherX-Data/Modificaciones/).
