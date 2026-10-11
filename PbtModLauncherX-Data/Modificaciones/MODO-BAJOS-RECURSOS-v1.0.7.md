# Modo de bajos recursos — PbtModLauncherX 1.0.7

## Alcance y configuración

Implementación en `dev/upstream-v1.0.7`, partiendo de `ad8f32ee` con árbol limpio. Versión 1.0.7 sin publicar. En **Ajustes → Rendimiento**, el interruptor español se denomina exactamente **PC del Gobierno de Venezuela**. Desactivado por defecto.

`Settings.lowResourceMode` y su esquema Zod conservan la preferencia mediante el guardado y la sincronización de configuración existentes. Las instalaciones antiguas y los valores inválidos usan `false`. Cambiar el interruptor actualiza la interfaz reactivamente sin reiniciar. No modifica opciones gráficas, RAM o Java de Minecraft, idiomas, modelos ni preferencias visuales guardadas.

## Renderizado y efectos

- `useLowResourceMode` combina el modo con `prefers-reduced-motion`. Las clases del documento afectan también a diálogos teletransportados.
- CSS elimina animaciones y transiciones decorativas, desplazamiento suave, filtros, desenfoques y sombras; aplica fondos sólidos según el tema a tarjetas y paneles.
- `AppBackground` desmonta vídeos, partículas y Halo cuando se reduce el movimiento. Desactivar la preferencia restaura el fondo configurado.
- Los componentes de partículas y Halo se cargan de forma diferida, únicamente cuando su fondo llega a mostrarse.
- Partículas cancelan sus frames y eliminan sus listeners propios al desmontarse, sin destruir otras instancias. Halo destruye su efecto y libera sus buffers WebGL.
- La vista 3D de pieles utiliza la pausa existente. Los GIF de instancia usan una instantánea solo en pantalla; el archivo original permanece intacto.
- Descargas, instalaciones, integridad, notificaciones, escritura de configuración y valores de progreso siguen funcionando. Los indicadores indeterminados pierden su animación; no se eliminan sus controles o textos de operación.

Se conservaron la virtualización existente de búsquedas (`MarketBase`) y logs, y la carga diferida de diálogos. No se reestructuraron listas de mods/instancias, biblioteca o historial sin perfilado. No se han añadido límites artificiales ni omitido elementos de listas largas. No se han cambiado las tareas de red necesarias ni sus comprobaciones de seguridad.

## PbtAdmin y Ollama

Las consultas pasivas de proveedor y estado no descubren modelos ni arrancan el motor cuando el modo está activo y no existe una solicitud manual. PbtAdmin muestra el estado de pausa y ofrece **Iniciar PbtAdmin**, con un aviso de memoria de Qwen3 4B y la posibilidad de elegir un modelo ligero en los ajustes existentes.

La acción explícita inicia el gestor existente, resuelve el endpoint dinámico y conserva la selección del usuario o la selección automática del modelo de fábrica ya implementada. Ollama no necesita API key. Los proveedores externos conservan sus claves y configuración independientes.

Al cerrar el chat, o activar el modo con el chat cerrado, se solicita liberar el motor propio. Se comprueba que no haya ejecuciones de agentes, streams locales ni descargas de modelos activos. El contador de streams libera su reserva al finalizar, cerrarse o fallar. El gestor existente detiene únicamente sus procesos propios; no se envía una orden de parada a un Ollama externo. No se eliminan modelos, historial ni configuración. Las operaciones activas no se cancelan para ahorrar recursos.

## Validación

| Comprobación | Estado | Evidencia |
|---|---|---|
| Preferencia nueva, configuración antigua, valor inválido y persistencia | APROBADO | Tests de esquema y round-trip; tests de guardado existentes actualizados para el nuevo campo |
| Activación/desactivación reactiva y preferencia del sistema | APROBADO | `lowResource.test.ts` |
| GIF estático en pantalla y formatos existentes | APROBADO | Regresiones existentes de `instanceIconSource` |
| Arranque manual, pausa inicial y selección existente | APROBADO | Tests de `AgentService` |
| Protección de descarga y stream activos, cierre ocioso | APROBADO | Tests de `AgentService` y puente de chat |
| Proveedor externo independiente | APROBADO | Test con credencial ficticia; no llamada externa real |
| Batería pertinente | APROBADO | 72 aprobados, 0 fallidos, 0 omitidos; `temp/low-resource-tests.log` |
| Traducciones es-ES, ca y en | APROBADO | Validador: 0 errores de sintaxis, claves y placeholders; 2612/2612 claves UI en es-ES y ca |
| Lint | APROBADO | 0 errores; dos advertencias preexistentes en `InstanceBlueprintsService` |
| Typecheck | APROBADO | `pnpm check`, salida 0 |
| Keystone UI | APROBADO | `pnpm build:renderer`, verificación de bundle y salida 0 |
| Aplicación real de desarrollo | BLOQUEADO | `pnpm dev:main` falla antes de iniciar con `uv_os_get_passwd returned ENOMEM`; reproducido también mediante `os.userInfo()` |
| Comparación CPU/RAM/GPU | NO EJECUTADO | No se anuncian porcentajes ni mejoras medidas |
| Listas largas, temas, progreso visible y disposición real | NO EJECUTADO | Pendiente de GUI real; tests unitarios no equivalen a validación visual |
| Motor real, cierre del chat y uso offline con el modo | NO EJECUTADO | No se ha ejecutado inferencia nativa nueva en esta fase |
| Windows/Linux/macOS, instalables y portables | NO EJECUTADO | Implementación compartida sin cambios globales del SO; falta validación nativa de distribuciones |

La compilación UI y los tests no demuestran un ahorro de recursos cuantificado. Tampoco validan automáticamente ausencia de superposición o contraste en una ventana real.

## Procedimiento manual pendiente

Desde PowerShell normal, con un perfil temporal independiente, ejecutar las tareas documentadas `pnpm dev:renderer` y `pnpm dev:main`. Conectar el CLI oficial descrito en `.github/skills/chrome-devtools-cli/SKILL.md` y confirmar que la página carga `http://localhost:3000`. Probar a 1200×720 y 800×400, ambos temas y los tres idiomas.

Comparar el mismo perfil y la misma lista de mods en ambos modos; registrar CPU, memoria y GPU sin descargas concurrentes. Alternar el modo con fondos de vídeo, partículas, Halo y GIF; verificar recuperación al desactivarlo y persistencia después de reabrir. Iniciar una descarga controlada y comprobar texto/progreso. Abrir PbtAdmin sin arrancarlo, iniciarlo explícitamente, conversar con Qwen3 real, cerrar durante una respuesta y confirmar que no se interrumpe; cerrar después y comprobar que desaparecen únicamente los procesos propios. Validar que un Ollama externo permanezca activo.

## Archivos y Git

Cambios en entidades/esquema/API de ajustes y agente; servicio y puente de Ollama; composables de preferencia, agente e iconos; ajustes de rendimiento, chat, fondo y raíz de la UI; CSS local; recursos de partículas/Halo; traducciones es-ES/ca/en; regresiones y este informe. No se modificaron configuración global de compilación, dependencias, endpoints productivos ni binarios/modelos.

La escritura de `.git/index.lock` ha estado restringida en este entorno. En caso de bloqueo, los cambios se conservan en ZIP verificado, manifiesto SHA-256 y parche completo bajo `temp/low-resource-preservacion-20261011.*`. No hay push, merge, tags ni publicación.
