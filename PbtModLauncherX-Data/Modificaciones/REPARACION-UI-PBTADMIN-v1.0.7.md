# Fase 15.1 — Interfaz, catalán y Ollama

Fecha: 2026-10-10. Versión conservada: **1.0.7**. Rama: `dev/upstream-v1.0.7`.
Base confirmada de Fase 15: `8670baf52abf055bd82d48d7150768319048276a`. Árbol inicialmente limpio. Consultados ESTABILIZACION, PBTADMIN-IA-LOCAL, PBTADMIN-LORE y EXPORTACION-SERVIDOR. No se cambia master, backup, versiones, canales, credenciales ni datos personales. No se publica nada.

## Causas y correcciones

### Lista de mods

`ModItem.vue` insertaba ModServerClassification en el slot title-chip de MarketItem; `Mod.vue` añadía los filtros y consultas exclusivos de clasificación a la lista normal. Se retiran ese slot, sus props/evento y filtros exclusivos. Se conservan ModLabels, dependencias, gestión de selección, instalación, habilitación/deshabilitación y filtros originales.

No se borra ModServerColumns, ModServerClassification ni los composables, servicios, caché, fuentes, confianza, decisiones persistentes, herramientas y revisión del exportador. Las regresiones de clasificación, persistencia de decisiones y exportación siguen pasando. Ausencia de superposición visual: pendiente de ejecución real.

### Catalán

Los signos `?` eran caracteres literales ya presentes en los valores del catálogo, no un resultado de renderizado o de una fuente. Se reparan ocho valores dañados: localServices, requestFailed de configuración inicial y seis mensajes pbtadmin de confirmación/contexto/error. Se preservan las preguntas legítimas. Se escriben los catálogos como UTF-8, sin reemplazo global ni cambios a la selección de idioma. Se mantienen es-ES por defecto y preferencias existentes.

Validación de YAML: ca y es-ES tienen 2598/2598 claves UI, 21/21 Electron y 29/29 componentes, sin claves faltantes ni interpolaciones incompatibles. Se comprueban instàncies, col·leccions y proveïdor, además de los nuevos mensajes de estado en ca/es-ES/en. Las advertencias de otros idiomas (54 diagnósticos) no se alteran en esta fase.

### Ollama y mensajes de API key

El runtime ya admitía Ollama sin API key. La incoherencia provenía de mensajes genéricos de interfaz (`statusDisabled` decía «falta la clave API» para cualquier proveedor), el formulario que presentaba claves también para Ollama, el estado vacío fijo «no hay modelos compatibles con herramientas» y resolveModel, que descartaba modelos de conversación sin herramientas. Había además una condición heredada subscriptionActive en los ajustes del renderer.

Se sustituye el mensaje usado por la interfaz por estados derivados de evidencia local y selección del proveedor. Se oculta el campo API key para Ollama, sin borrar claves externas, y se elimina la condición de suscripción del renderer. Se conservan el guardado por proveedor y el mecanismo de cambio/persistencia; las respuestas actuales actualizan modo, contexto y capacidad de herramientas.

`chatCompatible` se verifica mediante `/api/show`: completion, tamaño positivo y ausencia de remote_host, remote_model y sufijo :cloud. `compatible` sigue significando completion + tools locales verificados. Los modelos de solo chat son seleccionables y muestran una limitación explícita; el agente no crea sus herramientas. El puente runtime rechaza solicitudes con herramientas o historial de resultados de herramientas para esos modelos antes de contactar Ollama. Si se cambia a solo chat desde una conversación con herramientas, se debe iniciar un chat nuevo; no se elimina el historial existente. No se permiten comandos arbitrarios ni se elimina ninguna confirmación de modificación.

Estados cubiertos: Ollama no encontrado, instalado pero sin respuesta, conectado sin modelos, selección pendiente, modelo no verificable, modelo de solo chat, modelo con herramientas, error de conexión local, proveedor externo por configurar y proveedor externo configurado. Los errores EACCES/timeout y respuestas inválidas se distinguen de ECONNREFUSED. La ausencia del ejecutable en ubicaciones habituales no demuestra que no exista una instalación en una ubicación personalizada; el mensaje mantiene esa precisión.

El asistente existente sigue accesible desde ajustes, permite actualizar detección y seleccionar modelos; las descargas requieren el consentimiento existente. No se instala Ollama, descarga un modelo ni se cambia a un proveedor de pago automáticamente. Nombre, personalidad, fuentes/lore y referencias femeninas a PbtinaDev permanecen intactos.

### Layout y superficies

AppAgentChat utiliza fondo opaco `rgb(var(--v-theme-surface))` y borde redondeado, sin opacity en el contenedor. El encabezado tiene flex:1, min-width:0 y overflow-wrap:anywhere. Selector con ancho máximo, contenido elíptico, título accesible e iconos que no se encogen. El estado truncado tiene title. La barra superior permite envolver controles. AppCommandPalette usa una superficie opaca del tema, min-width:0 y ajuste de palabras. Se preservan transiciones y navegación existentes.

Estas comprobaciones son estructurales y de compilación: no demuestran ausencia de superposiciones ni contraste en una ventana real.

## Validación y evidencias

| Comprobación | Estado | Evidencia |
| --- | --- | --- |
| Tests afectados y baterías de agente/runtime, clasificación, decisiones y exportación | APROBADO | **316 aprobados, 0 fallidos, 0 omitidos**; temp/phase151-tests-final.json |
| Typecheck completo | APROBADO | pnpm check, código 0; temp/phase151-check.log |
| Lint completo | APROBADO | pnpm lint, sin errores; advertencias existentes; temp/phase151-lint.log |
| Traducciones | APROBADO | validate-translations.mjs, failures=0, syntax=0; temp/phase151-i18n.log |
| Keystone UI | APROBADO | pnpm build:renderer, código 0; verify-bundle 106 chunks, 0 huérfanos; temp/phase151-ui-build.log |
| Electron production smoke | BLOQUEADO | pnpm --prefix=xmcl-electron-app compile: uv_os_get_passwd ENOMEM; temp/phase151-electron.log |
| DeskGap | BLOQUEADO | pnpm --prefix=deskgap-app build: mismo ENOMEM; temp/phase151-deskgap.log |
| Arranque dev real | BLOQUEADO | pnpm dev:main: ENOMEM; temp/phase151-dev-main.log |
| CLI Chrome DevTools oficial | BLOQUEADO | list_pages falla en os.userInfo/getRuntimeHome con ENOMEM antes de conectar |
| Ollama real | BLOQUEADO | GET http://127.0.0.1:11434/api/tags: ECONNREFUSED; no conversación ni streaming real ejecutados |
| Git diff --check | APROBADO | sin errores de whitespace |

Los comandos pnpm se ejecutan con el adaptador ya existente temp/phase13-bin en PATH del proceso, que usa el Node/caché pnpm disponible y evita instalaciones automáticas. No se modifica configuración global o del workspace. Node os.userInfo() reproduce ENOMEM sin importar el proyecto: no se atribuye este bloqueo al launcher ni se sustituye esa función en producción.

Tests nuevos: providerStatus.test.ts (evidencia de estados y cambio de proveedor), phase151.test.ts (catálogos UTF-8, estructura de filas y superficies, SFC parseado), regresiones de resolución de modelos de solo chat, errores de conexión y rechazo de herramientas en ollamaChat.test.ts. Se actualizan expectativas exactas de AgentService para la nueva capacidad. Los tests con mocks no constituyen una prueba de Ollama real; parsear SFC no constituye una prueba visual.

## Archivos afectados

- xmcl-keystone-ui/locales/{ca,es-ES,en}.yaml.
- xmcl-keystone-ui/src/components/LocalAiSetup.vue.
- xmcl-keystone-ui/src/composables/agent/{index,local,settings,providerStatus,providerStatus.test,phase151.test}.ts.
- xmcl-keystone-ui/src/views/{Mod,ModItem,AppAgentChat,AppOmniDialog,AppCommandPalette,SettingGeneral}.vue.
- xmcl-runtime-api/src/entities/localAi.ts y src/services/AgentService.ts.
- xmcl-runtime/agent/{AgentService,AgentService.test,ollama,ollama.test,ollamaChat,ollamaChat.test}.ts.
- Este informe.

## Pendientes manuales

En PowerShell normal, iniciar las tareas dev:renderer/dev:main según README, con un perfil de prueba aislado. Confirmar que el CLI ve una página localhost:3000. Revisar una lista con muchos mods, nombres/descripciones largos, dependencias y habilitados/deshabilitados a 800x400 y 1200x720. Revisar chat/selector/órdenes/ajustes en temas claro y oscuro, es-ES/ca/en, zoom 100/125/150 y nombres de modelos largos. Confirmar fondo y controles legibles, y la revisión Exportar servidor.

Con Ollama instalado por la usuaria: actualizar detección, elegir un modelo instalado, enviar consulta real, comprobar streaming/cancelación, modo solo chat y herramientas en un modelo que /api/show anuncie como compatible. Reiniciar y verificar preferencias, historial y decisiones de clasificación. No usar claves personales para pruebas ni descargar modelos sin autorización.

## Git y conservación

git add falla exactamente con `Unable to create .../.git/index.lock: Permission denied`. No se borra ningún lock ni se cambian ACL/protecciones. HEAD sigue en 8670baf52abf055bd82d48d7150768319048276a, rama requerida. Cambios sin confirmar conservados mediante `temp/phase15-1-preservacion-20261010.zip`, `.manifest.json` (SHA-256 de archivos/ZIP/parche) y `.patch` completo con archivos nuevos. El ZIP se verifica contra todos los bytes originales antes de entregar. La fase queda implementada con validación real pendiente, sin declarar estable la versión.

## Ampliación: español y auditoría global de Unicode

La revisión adicional confirma ocho cadenas españolas dañadas en el fuente: independence.localServices, requestFailed de configuración inicial y seis mensajes de confirmación/contexto/error de pbtadmin. Se restauran «están», «configuración», «inténtalo», «aplicación», «requerirá», «conversación», «más», «diagnóstico», «petición», «estén» y los signos de apertura ¿. Son signos `?` reales en el archivo, no únicamente una representación defectuosa de PowerShell. No se sustituyen preguntas legítimas ni se convierten acentos a ASCII.

El script temporal histórico temp/phase10a-translations.py ya contiene los valores dañados de confirmación tanto españoles como catalanes. Esto sitúa la pérdida antes de YAML/Vite: esos valores se generaron y guardaron con la corrupción incorporada. No se demuestra qué transformación concreta perdió el carácter en aquel proceso; no se atribuye sin evidencia a una fuente tipográfica o al parser. Los scripts de reparación actuales son archivos UTF-8 explícitos con read_text/write_text(encoding='utf-8'), sin transportar su contenido mediante una tubería nativa de PowerShell. La prevención permanente reside en el validador del repositorio, no en reutilizar aquel script temporal.

Cadena revisada: i18n-core y validate-translations leen UTF-8 y usan js-yaml; vite.config.ts compila los catálogos con @intlify/unplugin-vue-i18n; src/i18n.ts precarga es-ES/ca/en y conserva fallback es-ES/en; composables/i18n.ts carga módulos YAML y llama setLocaleMessage. localStorage guarda el identificador del idioma, no el texto del aviso. La caché de traducción de contenido comunitario es un circuito distinto que no suministra independence.localServices. Los avisos se obtienen mediante t('independence.localServices') en los componentes actuales. No se modifican configuración, historial de chats ni textos privados almacenados anteriormente: esos datos pueden conservar mensajes antiguos y no deben confundirse con el catálogo vigente. Un proceso renderer que todavía use el bundle anterior necesita recargar la nueva compilación; borrar perfiles no es una solución.

Auditoría global: 48 YAML de UI/Electron leídos como UTF-8, sin U+FFFD. El validador revisa todos los idiomas de esos directorios y todos los bloques i18n de componentes, incluyendo en. Detecta U+FFFD, signos `?` entre letras y apertura española dañada, exceptuando query strings de URLs. Es una heurística de pérdida de caracteres, no una prueba de que cualquier texto lingüísticamente incorrecto esté detectado. Ningún otro idioma presenta esas señales tras las reparaciones. Se conservan á, é, í, ó, ú, ü, ñ, ç, à, è, ï, apóstrofos y l·l/col·leccions.

Se amplían scripts/validate-translations.mjs y scripts/validate-translations.test.mjs. Pruebas del Vue i18n real compilan los mensajes y ejercitan t() e interpolación Unicode en es-ES/ca/en; no son una inspección visual de Electron. La batería conjunta actual suma **337 aprobados, 0 fallidos, 0 omitidos** (temp/phase151-unicode-final.json). Validación global: 0 errores; lint correcto. Typecheck de la implementación previa sigue aprobado; la ampliación modifica catálogos y scripts de validación, sin APIs TypeScript productivas.

Build UI repetido y aprobado: 106 chunks, 0 huérfanos. Se inspecciona el JavaScript final dist/assets/VApp-DL5X4l6U.js: contiene «no están disponibles», «instàncies», «col·leccions» y «proveïdor», sin «est?n disponibles». Evidencia con SHA-256 en temp/phase151-unicode-bundle.json; reproducción: python temp/phase151-check-unicode-bundle.py. Esto demuestra preservación en el empaquetado UI, no renderizado visual real, que permanece BLOQUEADO por ENOMEM. La validación pendiente debe abrir los avisos y PbtAdmin en es-ES/ca/en desde el nuevo bundle o renderer de desarrollo, no una copia antigua.

Conservación actualizada: **27 archivos**, incluyendo los dos scripts de validación, en temp/phase15-1-unicode-preservacion-20261010.zip, .manifest.json y .patch. Se mantienen intactas las copias previas. Git sigue denegando index.lock. La versión y rama no cambian.

Confirmación manual de todos los cambios actuales desde la raíz:

```powershell
if ((git branch --show-current) -ne 'dev/upstream-v1.0.7') { throw 'Rama incorrecta' }; $phase151Files = (Get-Content 'temp/phase15-1-unicode-preservacion-20261010.manifest.json' -Raw | ConvertFrom-Json).files.path; git add -- $phase151Files; if ($LASTEXITCODE -eq 0) { git commit -m 'fix(ui): repair mod list layout and PbtAdmin Ollama configuration' }
```
