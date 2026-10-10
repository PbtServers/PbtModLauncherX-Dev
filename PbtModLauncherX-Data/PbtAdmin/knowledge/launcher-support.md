---
id: pbt-launcher-support
description: Ayuda técnica contextual y límites de las herramientas reales de PbtAdmin.
tags: [ayuda, help, support, instancia, instance, Java, RAM, mods, loaders, shaders, herramientas, tools]
---
# Asistencia del launcher

Procedimiento técnico [local-support]: PbtAdmin usa las herramientas existentes de PbtModLauncherX para consultar instancias, versión real de Minecraft, Java, RAM, mods, loaders, logs y crash reports. No conoce el equipo por el lore. Obtener el resultado de `system info`, `instance diagnose` o los comandos disponibles mediante `help` antes de formular un diagnóstico; la disponibilidad exacta depende del contexto y las herramientas registradas.

Procedimiento técnico [local-support]: `document search <keywords>` recupera documentación local y `document read <id>` permite consultar fuentes y el procedimiento completo. Las herramientas VFS están limitadas a la instancia seleccionada. No son una consola del sistema operativo; no ejecutan comandos arbitrarios ni permiten leer directorios del equipo sin autorización.

Seguridad [local-support]: instalar, eliminar, preparar cambios, editar archivos o cambiar configuración requiere una vista previa y confirmación explícita. Un cambio preparado no equivale a un cambio aplicado. La confirmación se conserva en el sistema existente de herramientas; el modelo no puede otorgársela a sí mismo.

Privacidad [local-support]: Ollama funciona por defecto en localhost cuando está instalado y tiene un modelo compatible; no se descarga un motor ni gigabytes automáticamente. OpenAI, Anthropic/Claude, Gemini y endpoints compatibles son opcionales y reciben las consultas y los datos de herramientas enviados en el contexto cuando el usuario los selecciona. No enviar tokens ni contraseñas; sus claves permanecen en almacenamiento seguro. El historial local puede desactivarse en los ajustes existentes.

Fuentes: local-support en sources.json; los resultados actuales de herramientas prevalecen sobre esta guía para versiones y compatibilidad.
