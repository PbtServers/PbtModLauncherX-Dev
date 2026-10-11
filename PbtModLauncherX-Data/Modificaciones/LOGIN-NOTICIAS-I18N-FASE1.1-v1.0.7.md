# Fase 1.1 — Login, noticias e idiomas

Cambios preparados para revisión el 12 de octubre de 2026. Sin commit, push, cambios de releases, etiquetas ni GitHub Actions. Los cambios de empaquetado que ya estaban pendientes pertenecen a Fase 1; Fase 1.1 no los modifica.

## Cambios

- El modo de retransmisión convertía el usuario en un campo de contraseña. Ahora ese campo es texto; el modo mantiene separado el historial de cuentas y las contraseñas conservan su ocultación. No se cambia la autenticación ni el almacenamiento de sesiones.
- Noticias de Minecraft: fuente oficial existente, texto sin HTML ni scripts, entidades decodificadas, separación de párrafos, imágenes y enlaces originales, orden descendente y deduplicación por artículo sin parámetros de seguimiento.
- Se intenta contenido oficial localizado antes de traducir. Las páginas que mantienen texto inglés bajo una URL española no se aceptan por su atributo `lang` solamente. La comprobación del título es conservadora y puede descartar una traducción oficial cuyo título comparta muchos términos con el original; en ese caso se utiliza el servicio de traducción.
- Traducción mediante la API GET documentada de MyMemory, sin API Key privada. Segmentos de hasta 480 bytes UTF-8, cola de solicitudes, deduplicación, tiempo máximo de espera y pausa tras errores/cuota. Caché persistente por idioma y texto; protección de marcas, términos reconocidos, versiones y nombres de mapas después de los dos puntos. Si falla, se conserva el original y se informa al usuario. No intervienen Qwen3, Ollama ni PbtAdmin.
- Caché persistente del último feed verificado, incluso si caduca la frescura de SWRV. Los fallos de red o respuestas inválidas no sustituyen noticias válidas.
- Noticias propias separadas en otra pestaña. GitHub confirmó `v1.0.7`, `v1.0.6`, `v1.0.5`, `v1.0.4` y `v1.0.3`. El recurso `src/assets/launcherNews.json` contiene textos editoriales en los tres idiomas; solamente la respuesta publicada de GitHub, o su copia previamente guardada, habilita una noticia. Fechas y enlaces proceden de GitHub, sin inventar mejoras o correcciones.
- i18n existente: inglés de respaldo para preferencias distintas de `es-ES`, `ca` y `en`, según la instrucción adicional. Español al primer arranque. Los demás catálogos se conservan sin cambios. Se evita que una carga tardía de catálogo revierta un cambio de idioma más reciente.
- Localización de textos fijos en Acerca de, multijugador, publicación de versiones, actualizaciones y contexto de PbtAdmin. Fechas, tamaños y números siguen el idioma. Se corrige el plural de paquetes de recursos.
- Se restaura la importación ausente de `LocalAiSetup` en Ajustes. El acceso a otros proveedores y sus API Keys funciona sin instalar Qwen3.
- Prompts, personalidad, lore, herramientas y documentos de conocimiento no se modifican.

## Pruebas automatizadas

Resultado final: **217 pruebas de Vitest, 21 archivos, todas aprobadas**, y **3 pruebas de Node**, todas aprobadas.

Archivos ejecutados con `pnpm exec vitest run`:

```text
xmcl-keystone-ui/scripts/validate-translations.test.mjs
xmcl-keystone-ui/src/util/newsTranslation.test.ts
xmcl-keystone-ui/src/util/newsCache.test.ts
xmcl-keystone-ui/src/util/newsText.test.ts
xmcl-keystone-ui/src/util/launcherReleaseNews.test.ts
xmcl-runtime-api/src/entities/locale.test.ts
xmcl-runtime/settings/pluginSettings.test.ts
xmcl-electron-app/main/utils/i18n.test.ts
xmcl-keystone-ui/src/composables/agent/qwenInstaller.test.ts
xmcl-keystone-ui/src/composables/agent/pbtAdmin.test.ts
xmcl-runtime/agent/AgentService.test.ts
xmcl-runtime/agent/ollama.test.ts
xmcl-keystone-ui/src/composables/user.test.ts
xmcl-runtime/user/utils/loginModrinth.test.ts
xmcl-keystone-ui/src/composables/agent/phase151.test.ts
xmcl-runtime/agent/runtimeBundle.test.ts
xmcl-runtime/agent/documents.test.ts
packages/installer/modLoaderRegression.test.ts
packages/installer/labymod.test.ts
packages/installer/neoforge.test.ts
xmcl-runtime/install/neoForgeMetadata.test.ts
```

Los casos de Qwen cubren ausencia, preparación, progreso real, finalización, cancelación, error y modelo ya instalado. Las pruebas de noticias cubren caché persistente, lectura sin conexión, respuestas inválidas, cuotas, términos protegidos, deduplicación, fechas y releases publicadas. Se ajustan las expectativas anteriores de idiomas al nuevo respaldo solicitado a inglés.

- `node --test xmcl-keystone-ui/scripts/audit-visible-text.test.mjs`: 3/3. Auditoría global de textos literales y atributos visibles de las plantillas, con exclusiones explícitas para marcas, iconos e identificadores técnicos. No sustituye la revisión de todas las expresiones dinámicas ni de cada estado visual posible.
- `node xmcl-keystone-ui/scripts/validate-translations.mjs`: cero fallos; español y catalán 2653/2653 claves de UI, 21/21 de Electron y 29/29 de mensajes locales de componentes respecto al inglés. Los 54 diagnósticos de otros idiomas se mantienen; esos archivos no se editan.
- `pnpm check`: aprobado.
- `pnpm lint`: aprobado, con dos avisos previos en `InstanceBlueprintsService.ts` sobre spreads con objetos vacíos.
- `pnpm build:renderer`: aprobado; verificación de 110 chunks sin referencias huérfanas. Se conservan los avisos del build sobre tamaño de chunks, importación de UnoCSS y externalización de `node:fs` de una dependencia.
- `git diff --check`: aprobado.

## Launcher real

Validación mediante el skill local `.github/skills/chrome-devtools-cli/SKILL.md` y su CLI oficial. Renderer de desarrollo en `http://localhost:3000`; datos aislados bajo `temp/phase11-appdata` y `temp/phase11-game`.

- Microsoft, offline, LittleSkin y Ely.by: usuario `text`; contraseña `password` donde existe. Comprobado también con modo de retransmisión activado. Login offline real de `Phase11Test` correcto.
- Noticias reales de Minecraft traducidas en español y catalán, originales inglesas, fechas y controles actualizados al cambiar de idioma. Texto de prueba con HTML, entidades y script: `Hello & friends Second line`, sin script ni etiquetas.
- Releases reales de GitHub en pestaña independiente, con títulos editoriales y fechas oficiales.
- Peticiones de noticias bloqueadas temporalmente en el renderer: ambos feeds conservan artículos y muestran el aviso de caché sin conexión. Se restaura `fetch` al finalizar la comprobación.
- Seleccionar francés en Ajustes activa inglés y muestra English en el selector.
- Instancia vacía `Phase11LocaleTest`, Minecraft 1.21.4, sin instalar el juego: inicio de instancia, mods, recursos y shaders comprobados en español, catalán e inglés. Ajustes globales, navegación y PbtAdmin también comprobados.
- Tarjeta de Qwen3 y consentimiento en los tres idiomas; `2.4` en inglés y `2,4` en español/catalán. Botón de descarga deshabilitado sin consentimiento. Se pospone y se accede a los ajustes de otro proveedor.
- Selección de OpenAI en el perfil temporal: modelo y API Key disponibles sin Qwen3; API Key de tipo contraseña y vacía. No se envían consultas al proveedor.
- Ventanas reales de 800×400 y 1200×720: noticias sin desbordamiento horizontal, enlace visible; temas claro y oscuro comprobados. Tarjeta de instalación sin desbordamiento horizontal.
- Motor Ollama nativo activo, sin modelos. Durante la recarga automática de main quedó un bloqueo del PID de desarrollo 18464, ya inexistente; se retiró exclusivamente ese archivo del perfil aislado. Motor confirmado con PID 16220 y puerto local 49374, y después del reinicio con PID 784 y puerto 62436. Ninguna descarga de pesos en esta fase.
- Reinicio completo de Electron de PID 16368 a 23688: cuenta, instancia e idioma conservados. Se eliminan exclusivamente la cuenta y la instancia de prueba mediante sus servicios. Último reinicio con PID 15124 confirma perfil limpio e idioma inglés. Cierre ordenado de la app y sus procesos de prueba al finalizar.

## Límites de verificación

No se han utilizado credenciales reales de Microsoft, LittleSkin, Ely.by ni API Keys: el éxito del login remoto y las respuestas de proveedores externos no se han verificado en vivo. Sí se prueban sus campos, ocultación y rutas de configuración, además de regresiones automatizadas disponibles. No se instala ni ejecuta una partida real de Minecraft, ni se vuelven a descargar pesos de Qwen3 en esta fase. No se ejecutan físicamente instaladores de Linux o macOS; su empaquetado queda fuera de Fase 1.1.

Se mantienen avisos previos de inicialización de `UserContext` y una transición de grupo de mods con ruta vacía durante la creación de la instancia temporal. La incidencia de resolución de `LocalAiSetup` sí queda corregida. No se afirma que se hayan recorrido todas las pantallas y variantes de cada diálogo del launcher.

Diff específico de esta fase: `temp/phase11-only.diff`, reconstruido respecto al estado pendiente al terminar Fase 1. Diff acumulado respecto a HEAD: `temp/phase11-review.diff`. Ambos incluyen los archivos nuevos para revisión; no se ha modificado el índice de Git.
