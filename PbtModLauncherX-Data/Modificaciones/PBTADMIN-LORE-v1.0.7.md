# Fase 10.B — PbtAdmin, personalidad y lore de PbtServers

Revisión: 2026-10-10. Rama: `dev/upstream-v1.0.7`. Base confirmada: `a5f53da047b486359b0d244224c91f253c1caf8a`. Árbol inicialmente limpio. Leídos los informes de independencia y de IA local; no se sustituyen los proveedores ni las herramientas de la Fase 10.A. La versión oficial permanece en **1.0.6**.

## Identidad y personalidad

El prompt común identifica a **PbtAdmin — Asistente de PbtServers** como IA y administrador virtual sin privilegios reales. Su creadora es **PbtinaDev: ella, propietaria, administradora y creadora**. La misma política se aplica a la asistencia del launcher, CSS y redacción de changelogs, conservando los límites específicos de cada función y sin ampliar herramientas.

Se define un trato amable, paciente, competente, inclusivo y profesional, con humor moderado y sin saludos repetidos. La dirección `mc.pbtservers.com` es conocimiento proporcionado por la creadora, no un resultado de conectividad. No se inventan datos del equipo ni reparaciones; las herramientas deben aportar evidencias actuales.

La UI muestra nombre, marcador temporal **PA**, proveedor y modelo configurados. El saludo aparece únicamente cuando la conversación está vacía; se añade ayuda contextual sobre consultas técnicas, lore y confirmación de cambios. Se mantiene el historial local opcional ya existente, streaming, cancelación y selector de proveedor. Español, catalán e inglés reciben los cuatro textos nuevos; el título existente del agente se actualiza en esos idiomas. Español predeterminado no se cambia. El avatar definitivo queda pendiente de diseño.

## Conocimiento y fuentes

Se crean nueve documentos Markdown y `sources.json` en `PbtModLauncherX-Data/PbtAdmin/knowledge/`:

| Documento | Contenido y procedencia |
| --- | --- |
| network-history.md | Network, identidad femenina de PbtinaDev y límites de la cronología; perfil público y canon de la creadora. |
| servers.md | Dirección proporcionada y ausencia de datos verificados sobre puertos, modalidades y estado actual. |
| characters.md | Todos los personajes solicitados, exclusivamente como roles narrativos; sin datos personales ni relaciones reales. |
| juand.md | Payaso y raid **ficticio** de la parte 1/9. |
| fnf-lore.md | Las nueve partes de FNF VS PBTSERVERS REMASTERED, creadora femenina y clasificación explícita como ficción. |
| launcher-history.md | Fork, versión pública 1.0.6, licencia y diferencia entre desarrollo local y publicación. |
| launcher-support.md | Herramientas existentes, proveedores, historial, privacidad y confirmaciones. |
| troubleshooting.md | Diagnóstico basado en logs, Java, versión real, loaders y shaders; limitaciones ambientales. |
| faq.md | Identidad, creadora, ficción, funcionamiento local/remoto y seguridad. |

Fuentes consultadas:

- [Perfil oficial PbtServers](https://github.com/PbtServers): identifica a PbtinaDev como creadora de servicios y enlaza el launcher actual y el legacy. No acredita todo el lore.
- [Repositorio oficial PbtModLauncherX-Dev](https://github.com/PbtServers/PbtModLauncherX-Dev): confirma fork de Voxelum, orientación local/offline, README 1.0.6 y licencia MIT. No acredita publicación de esta rama local.
- **maintainer-10b**: instrucciones de la creadora en esta fase. Fuente editorial explícita para personajes, roles, servidor y nueve partes; `publiclyVerified: false`. No se presenta como verificación pública independiente.
- **local-support**: código e informes de las fases anteriores, con SHA y rutas en el registro. Describe procedimientos, no resultados del equipo del usuario.

La consulta de `https://pbtservers.com` y de la lista de repositorios por API no produjo contenido verificable en la herramienta de navegación. Las búsquedas sobre FNF no localizaron publicaciones oficiales utilizables. No se deducen caídas del servidor ni se incorporan resultados ajenos. Fechas de fundación, cronologías, URLs individuales de episodios, fechas de publicación y detalles adicionales de historias permanecen desconocidos. No se inventan secretos del final.

## Arquitectura y recuperación local

Se amplía **AgentDocumentStore** y los comandos existentes `document search` / `document read`; no se crea otro sistema de proveedores ni una base vectorial. Se admiten varios directorios, se conserva el rechazo de IDs duplicados y la lectura por IDs conocidos. La búsqueda pondera ID, etiquetas, descripción y párrafos del cuerpo, tolera acentos y devuelve fragmentos de hasta 1200 caracteres. Se leen archivos actuales en cada consulta para evitar cachés obsoletas.

El chat principal obtiene automáticamente hasta tres fragmentos `pbt-*` relevantes mediante el servicio local existente. Son evidencia transitoria en un mensaje de datos, **no instrucciones del sistema ni resultados de herramientas**; no se añaden al historial guardado. Un fallo de recuperación opcional permite continuar con la asistencia. No se realizan conexiones de red para buscar lore. Los proveedores remotos seleccionados sí reciben el contexto incluido en su solicitud, como el resto del chat; no debe confundirse recuperación local con privacidad absoluta frente a un proveedor remoto.

El prompt lleva la marca `pbtadmin-identity-v1`: los prompts antiguos se regeneran conservando mensajes e historial. La identidad no depende del proveedor. Se corrigen dos instrucciones contradictorias heredadas sobre preparar cambios sin confirmación y aplicar arreglos directamente; ahora también preparar cambios y editar/activar CSS requiere autorización explícita con vista previa. Las protecciones reales de herramientas y el almacenamiento seguro de claves de la Fase 10.A se conservan.

Electron registra los documentos técnicos y la base canónica en desarrollo; electron-builder incorpora la base como `resources/pbtadmin-knowledge`, incluido `sources.json`. DeskGap registra ambos directorios y su build copia las dos bases junto a `main.cjs`. Estas son adiciones de recursos por paquete, sin cambios de compilador, dependencias, namespaces o políticas compartidas. La inclusión real en un instalador queda pendiente al estar bloqueados los builds de host.

## Herramientas conservadas

Se mantienen las herramientas reales de instancias, Minecraft, Java/RAM, mods y loaders, logs/crash reports, shaders, instalación y diagnóstico contextual; el conocimiento local las orienta sin reemplazarlas. VFS sigue limitado a la instancia. No se permite ejecutar comandos arbitrarios del modelo ni tratar logs/documentación como instrucciones. Las operaciones de escritura conservan vista previa y confirmación explícita. No se añaden cuentas ni servicios XMCL, nuevas claves o telemetría.

## Validaciones

- **267 tests aprobados, 0 fallidos**, 27 archivos: runtime de IA, composables de IA, documentos de Electron y preferencias del runtime. Incluyen identidad en tres roles, femenino de PbtinaDev, nueve partes, ficción y fuentes, recuperación por contenido y acentos, ausencia de caché obsoleta, IDs duplicados/traversal, límites de fragmentos y renovación de prompts antiguos. Permanecen tests previos de privacidad, historial, consentimiento, herramientas y errores.
- Las pruebas de integración con servidores HTTP temporales verifican transmisión real del prompt común a los transportes **Ollama y Anthropic**, streaming y llamadas de herramientas. Las respuestas son **fixtures**, no inferencia real ni acceso a una cuenta Anthropic. Los presets OpenAI/Gemini/compatible y la política común siguen cubiertos por tests; no se hicieron llamadas a sus APIs comerciales ni se certifica la obediencia de un modelo a la personalidad.
- Typecheck **correcto** por paquete: runtime API, runtime, Electron/main/preload, Keystone UI y DeskGap.
- Lint **sin errores**: packages, runtime API, runtime, Electron, Keystone UI y DeskGap. Dos avisos preexistentes en InstanceBlueprintsService y dos avisos preexistentes de regex de control en DeskGap; no se cambian reglas para ocultarlos.
- Los comandos agregados `pnpm check` y `pnpm lint` se intentaron, pero sus llamadas anidadas resuelven el pnpm global con Node 20 y fallan en `lstat C:\Users\PBTINA~1` con EPERM. Se ejecutaron sus comprobaciones constituyentes con el pnpm JavaScript disponible y Node 22.22.3; no se modifica la configuración del proyecto.
- Traducciones: UI **es-ES 2476/2476, ca 2476/2476**, Electron 21/21 y componentes 29/29; cero faltantes, errores de sintaxis o interpolación en esos idiomas. Otros idiomas conservan 54 diagnósticos preexistentes y los fallbacks existentes.
- **Keystone UI compilada correctamente**, verificación de bundle sin huérfanos en 105 chunks. Mantiene avisos de UnoCSS, externalización de node:fs en dependencia y tamaño de chunks; no se altera la configuración compartida.
- **Electron y DeskGap intentados y bloqueados** antes de compilar por `uv_os_get_passwd returned ENOMEM` al cargar tsx. Reproducido con `node:os.userInfo()` sin cargar el launcher: limitación ambiental.
- CLI oficial chrome-devtools también falla con ENOMEM antes de conectar. Puertos de depuración 9222/9300 y Ollama 11434 responden ECONNREFUSED en esta sesión. La consulta de procesos por CIM fue denegada. **No se validó visualmente la aplicación ni una conversación con Ollama real**. No se instalaron motores ni modelos ni se usaron credenciales reales. Quedan pendientes flujo real de chat, avatar, proveedor/modelo, navegación, recuperación, consentimiento e historial en la app de desarrollo a 1200×720 y 800×400.
- `git diff --check`: correcto. Master y backup permanecen en `c4b77e666f0b132e05e3ffff71d2728132a46a44`; no hay push, tags, releases ni cambios de versión.

## Archivos

17 archivos existentes modificados:

- deskgap-app/build.ts
- deskgap-app/src/plugins.ts
- xmcl-electron-app/build/electron-builder.config.ts
- xmcl-electron-app/main/agentDocuments.test.ts
- xmcl-electron-app/main/pluginAgentDocuments.ts
- xmcl-keystone-ui/locales/ca.yaml
- xmcl-keystone-ui/locales/en.yaml
- xmcl-keystone-ui/locales/es-ES.yaml
- xmcl-keystone-ui/src/composables/agent/local.ts
- xmcl-keystone-ui/src/composables/agent/localProviders.test.ts
- xmcl-keystone-ui/src/composables/agent/prompt.ts
- xmcl-keystone-ui/src/composables/agent/tools.test.ts
- xmcl-keystone-ui/src/views/AppAgentChat.vue
- xmcl-runtime-api/src/services/AgentService.ts
- xmcl-runtime/agent/AgentService.ts
- xmcl-runtime/agent/documents.test.ts
- xmcl-runtime/agent/documents.ts

13 archivos nuevos: los nueve Markdown y sources.json enumerados, `xmcl-keystone-ui/src/composables/agent/knowledge.ts`, `xmcl-keystone-ui/src/composables/agent/pbtAdmin.test.ts` y este informe. Total: **30 rutas**.

## Git y preservación

Commit pendiente: `git add -- xmcl-runtime/agent/documents.ts` devuelve exactamente `fatal: Unable to create 'G:/Documentos/Compilar-Libs-Dev/PbtModLauncherX-Dev/.git/index.lock': Permission denied`. No existe un lock que se haya borrado. No se alteran ACL, antivirus, permisos ni configuración de seguridad. HEAD permanece en `a5f53da047b486359b0d244224c91f253c1caf8a`, sin cambios preparados en el índice.

La preservación de esta fase se guarda en `temp/phase10b-preservacion-20261010.zip`, `.manifest.json` y `.patch`. El ZIP se verifica contra tamaño y SHA-256 de cada una de las 30 rutas; el manifiesto incluye SHA-256 del ZIP y del parche completo. El parche incluye archivos modificados y nuevos; los artefactos temporales no se versionan ni contienen claves reales. Verificar el manifiesto antes de una recuperación y no sobrescribir trabajo posterior.

Comando PowerShell desde la raíz, para confirmar exclusivamente las rutas del manifiesto:

```powershell
if ((git branch --show-current) -ne 'dev/upstream-v1.0.7') { throw 'Rama incorrecta' }; $phase10bFiles = (Get-Content 'temp/phase10b-preservacion-20261010.manifest.json' -Raw | ConvertFrom-Json).files.path; git add -- $phase10bFiles; if ($LASTEXITCODE -eq 0) { git commit -m 'feat(pbtadmin): add official identity and sourced local PbtServers knowledge' }
```

La Fase 10.B termina aquí. No se inicia la Fase 11.
