# Traducciones de PbtModLauncherX v1.0.7 — Fase 4

Fecha: 2026-10-10. La versión oficial continúa en **1.0.6**.

## Estado y referencia

- Rama: `dev/upstream-v1.0.7`. Estado inicial limpio.
- Commit inicial: `ce241b8f2e8fd779642e1117fb539676963b5498`.
- Upstream integrado: `0379941d1997e92b079fdc21e8692c8e45cd8cd7`. No se ha hecho fetch, merge, rebase, push, tag ni publicación durante esta fase.
- master y backup/pre-upstream-v1.0.7: `c4b77e666f0b132e05e3ffff71d2728132a46a44`, `c4b77e666f0b132e05e3ffff71d2728132a46a44`; sin cambios.
- Referencia: catálogo inglés del upstream integrado, más las claves conservadas del fork y 8 etiquetas de interfaz que antes estaban escritas directamente en inglés.
- Inglés inicial del fork: 2.418 claves; inglés final: 2.426. Upstream: 2152. Claves de upstream ausentes del inglés actual: **0**.

## Recuentos exactos

Los recuentos son por catálogo: una clave en Electron y otra en Keystone cuentan por separado. Una cadena plural cuenta como una clave. La cobertura mide presencia, sintaxis e interpolaciones; no constituye una certificación lingüística externa.

| Catálogo | Referencia final | es-ES inicial | es-ES añadidas | es-ES corregidas | ca inicial | ca añadidas | ca corregidas | Cobertura final de ambos |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| Keystone global | 2.426 | 2.192 | 251 | 91 | 1.050 | 1.455 | 48 | 100 % |
| Electron | 21 | 20 | 1 | 2 | 19 | 2 | 2 | 100 % |
| InstanceManifestFileTree embebido | 29 | 0 | 29 | 0 | 0 | 29 | 0 | 100 % |
| Total de claves de referencia | 2.476 | | **281** | **93** | | **1.486** | **50** | **100 %** |

- Catalán: completadas las **1.447** claves globales originalmente ausentes, 8 etiquetas nuevas de interfaz, 2 de Electron y 29 embebidas. Además, 50 traducciones existentes revisadas.
- Español: completadas las **243** claves globales originalmente ausentes, 8 etiquetas nuevas, 1 de Electron y 29 embebidas; 93 traducciones existentes corregidas. Total añadido o corregido: **374**.
- Pendientes de en/es-ES/ca: **0** claves de referencia, **0** interpolaciones incompatibles, **0** mensajes vacíos injustificados y **0** errores de sintaxis.
- No se ha copiado el español al catalán: se han redactado traducciones catalanas independientes.

## Arquitectura y alcance

Keystone utiliza Vue I18n en modo composition, con en/es-ES/ca precargados en src/i18n.ts, fallback es-ES → en y carga dinámica de los 30 YAML mediante import.meta.glob en composables/i18n.ts. La selección usa assets/locales.json y el estado Settings; el idioma se guarda también en localStorage para ventanas que arrancan antes de tener los servicios. La entrega original mantuvo la detección del sistema; el ajuste adicional documentado abajo establece es-ES por defecto y conserva las preferencias guardadas y los identificadores.

Vuetify tenía fallback inglés para los controles españoles y catalanes: ahora se registran sus catálogos oficiales es y ca y se sincronizan es-ES → es y ca → ca. Se conservan los otros catálogos y reglas existentes.

Electron registra en, zh-CN, ru, es-ES y ca en definedLocales.ts. Su utilitario i18n recorre rutas y sustituye todas las apariciones de las variables; usa es-ES como fallback principal y en como último recurso. Se han completado las notificaciones, acciones de bandeja, accesos directos y aviso de cierre automático de los dos idiomas. Se conservan los 18 archivos de locales main.

Se han localizado los bloques i18n embebidos de InstanceManifestFileTree.vue: 29 descripciones por idioma, sin eliminar en/zh-CN/ru. El runtime no tiene un catálogo paralelo; emite claves de tareas/diagnósticos que traduce el renderer. Se amplían sus tests de selección del idioma del sistema y prioridad del idioma guardado. DeskGap reutiliza el renderer compilado.

Se han sustituido etiquetas de accesibilidad inglesas de ventanas, barra lateral, grupos y filtros, y el botón «+N more». No se han cambiado las acciones de esos controles. Los nombres de teclas, especificaciones técnicas (Patch/Minor/Major), formatos, URLs, nombres de proveedores, Minecraft y marcas se mantienen cuando corresponde. El contenido remoto de noticias, descripciones de mods y otras publicaciones no es un catálogo local traducible.

## Correcciones relevantes

- ca y es-ES: modInstall.noVersionSupported usa ahora {supported}, en vez de {compatible}.
- es-ES: multiplayer.otherExposedPortDescription conserva {user}, y sharingNotificationBody conserva {name}; se eliminan las variables traducidas {usuario}/{nombre}.
- es-ES: java.systemMemory vuelve a mostrar {free} y {total}.
- Se traducen los tipos de NAT y fases de despliegue que estaban en inglés, instrucciones HTML de P2P, dependencias, excepciones HTTP, colecciones, publicación en Modrinth, presencia, Bedrock y agent.
- Catalán: se corrigen residuos españoles como «Ajustes/ajustes», se utiliza «llançador» en texto común y se mantiene PbtModLauncherX literalmente.
- Español: «arco de su computadora» se corrige a «arquitectura de tu ordenador», «variables ambientales» a «variables de entorno», y se corrigen tildes, icono, semilla y terminología de planos.
- Se acortan Juego/Joc, Red/Xarxa y el aviso de carpeta no vacía después de comprobar el truncamiento a 1200×720.
- El carácter | en la lista de caracteres no válidos se escapa como literal de Vue I18n para evitar que se interprete como separador de plurales. Se conservan las variables, plurales, saltos de línea existentes y estructura jerárquica.
- Los YAML se serializan coherentemente; parte del diff español corresponde al plegado y entrecomillado, sin cambios de valor.

## Claves antiguas y excepciones documentadas

Siete escalares catalanes antiguos colisionaban con namespaces actuales: checkUpdate, error, forgeConfig, installModpack, installResource, liteloader y update. Se adaptan a las claves actuales de esos namespaces (name, hint, fail/success y goOfficialWebDownload según el contrato inglés). No se eliminan acciones ni funcionalidad; las formas anteriores y sus valores quedan aquí documentadas y en el commit inicial.

| Forma antigua | Valor anterior |
|---|---|
| `checkUpdate` | Comprova Actualitzacions |
| `error` | Error |
| `forgeConfig` | Configuració de Forge |
| `installModpack` | Instal·la Modpack |
| `installResource` | Instal·la Recurs |
| `liteloader` | LiteLoader |
| `update` | Actualitza |

Las demás claves exclusivas de es-ES/ca se conservan y se enumeran abajo. No se consideran errores de paridad porque proceden del fork o de interfaces antiguas y eliminarlas puede romper referencias dinámicas. Hay 451 candidatos a no utilizados en el inglés: el escáner AST distingue claves estáticas, prefijos dinámicos, bloques locales y allow-list, pero «no encontrada» no demuestra obsolescencia de una API externa. No se ejecuta eliminación automática.

Se han revisado las cadenas iguales al inglés: quedan 102 españolas y 122 catalanas globales. Son nombres propios, marcas, URLs, resoluciones, símbolos, enlaces de mensajes y palabras compartidas (General, Color, Error, Normal, Social, Compatible, Port en catalán, etc.). No se cuentan como pendientes. Se conserva XMCL únicamente en servicios externos como XMCL Account, XMCL Together y r/XMCL, manteniendo créditos/licencias y el branding público PbtModLauncherX.

## Validación reproducible

Nuevo script: xmcl-keystone-ui/scripts/validate-translations.mjs. Comando: pnpm --prefix=xmcl-keystone-ui validate:translations; salida completa: añadir --json. Reutiliza flatten, escáner AST y compilador de mensajes del i18n-core existente.

Detecta YAML/JSON inválido, claves duplicadas (incluido JSON anidado, que JSON.parse aceptaría), mensajes vacíos o de tipo incorrecto, claves ausentes, parámetros nombrados/de lista añadidos u omitidos, fallos de compilación Vue I18n, bloques embebidos sin traducción y locales no registrados. Informa de extras, candidatos no utilizados, valores idénticos al inglés y cobertura de los demás idiomas. Las omisiones de parámetros son errores estrictos para es-ES/ca, aunque el lint general las considere avisos. Cualquier fallo de idiomas objetivo o sintaxis termina con código 1.

| Comprobación | Resultado |
|---|---|
| validate:translations | OK; 0 fallos |
| Vitest de i18n/core/catálogos/importación/tareas/Electron/settings/planos/progreso/fechas | 9 archivos; 149 tests aprobados; 0 omitidos |
| pnpm check | Runtime API, runtime, Electron/preload y Keystone: OK |
| pnpm --prefix=deskgap-app check | OK |
| pnpm lint | 0 errores; 2 avisos preexistentes en InstanceBlueprintsService.ts |
| pnpm build:renderer | OK; 2.898 módulos; verify-bundle: 103 chunks, 0 huérfanos |
| pnpm compile | Electron main, preload, workers y renderer copiado: OK |
| pnpm build:deskgap | Host y workers DeskGap más renderer copiado: OK |
| git diff --check | OK |

Tests nuevos: errores de YAML/JSON, duplicados anidados, claves ausentes/extras, vacíos y null, interpolaciones, literales, plurales, enlaces; carga de en/es-ES/ca sin fallback; menús y notificaciones reales de Electron; catálogos de Vuetify. Se verifica idioma de sistema y prioridad del idioma guardado.

Se actualizan expectativas obsoletas de tests de upstream: 29 idiomas → registro real de 30; catalán incluido en locales Electron. Los tests de importación distinguen las tres notificaciones del fork bajo importModpack de las etiquetas realmente usadas por los diálogos. Se mantienen las verificaciones de existencia, variables y compilación de cada idioma, sin desactivar tests. La primera ejecución mostró esas incompatibilidades; la ejecución final es completamente verde.

Validación real mediante la skill local [.github/skills/chrome-devtools-cli/SKILL.md](../../.github/skills/chrome-devtools-cli/SKILL.md), CLI standalone, dev:main + dev:renderer, página PbtModLauncherX en http://localhost:3000, perfil temporal sin cuentas ni instancias reales. Ruta #/setting, controles de General/Apariencia/Juego/Red/Quant a; selección es-ES → ca → en → es-ES → ca; catálogos cargados, textos y accesibilidad actualizados. Se cierra y reabre: ca persiste. Capturas española y catalana revisadas a 1200×720; tras acortar los textos, el menú y el aviso caben. Se cierran Electron, Vite y el daemon de CLI creados para la prueba.

## Pendientes y límites

- es-ES/ca: ninguna clave de referencia pendiente ni fallo de compilación/tests.
- Otros idiomas: 54 diagnósticos de mensajes preexistentes (interpolaciones), enumerados abajo. Se conservan sus traducciones; no se amplía esta fase a una revisión lingüística de esos idiomas. El lint global puede fallar por esos errores aunque la validación dirigida pase; el script los muestra por separado, sin ocultarlos.
- Persisten avisos conocidos de Vite (UnoCSS repetido, node:fs externalizado, tamaño de chunks y tiempos de plugins), npm por opciones propias de pnpm, y los dos avisos de lint citados.
- Consola de desarrollo: sin errores de i18n al cambiar de idioma; existe el aviso de inyección UserContext del perfil sin cuenta. Un fichero yggdrasil.json no existente usa los valores predeterminados. Son ajenos a las traducciones.
- Pendiente revisión visual exhaustiva de todos los diálogos, estados de error, ventanas auxiliares, pantallas de 800×400, otros sistemas operativos y un instalador distribuido. Esta fase valida compilación de DeskGap, no ejecución de su runtime externo ni empaquetado/firma nativa.
- Los artículos de noticias y descripciones remotas pueden venir en inglés: no se alteran contenidos de terceros.
- Sin cambios de versión, servicios/actualizador, Discord, login/offline, protocolos, paquetes internos, recursos, master o backup. No se inician otras reparaciones.

## Ajuste adicional de Fase 4: idioma predeterminado (10/10/2026)

Este ajuste parte del commit local de Fase 4 `2e6a8b1c0d988e275a329ddeb72e18f04647cabb` y se confirma en un commit independiente sobre `dev/upstream-v1.0.7`. Sustituye el comportamiento anterior de detección automática del idioma del sistema. La versión oficial permanece en **1.0.6**.

### Comportamiento y compatibilidad

- Instalación nueva, configuración ausente, idioma vacío o no registrado: **es-ES**, independientemente del sistema operativo. No se consulta el idioma del host para decidir el idioma inicial del launcher.
- Preferencias válidas existentes: se conservan exactamente los 30 códigos registrados, incluidos ca, en, en-IN y los demás idiomas. No se fuerza español sobre una elección válida ni se convierte en-IN en en dentro de Settings.
- Cambios manuales: continúa el guardado habitual en setting.json mediante el estado Settings; localStorage conserva la copia necesaria para ventanas que arrancan antes que los servicios. No se cambian rutas, formatos de preferencias ni contratos IPC.
- Resolución de mensajes: idioma elegido → es-ES → en. Vue I18n conserva su resolución regional y de claves. Electron y DeskGap empiezan con el catálogo español y conservan el inglés como último recurso para claves futuras.
- El preset del asistente devuelve la preferencia guardada o es-ES; deja de devolver el idioma del sistema. Se elimina la normalización indiscriminada de variantes inglesas en Setup.vue.
- La ventana de migración usa la preferencia persistida o es-ES, sin navigator.language. Se corrige su ruta de carga dinámica de YAML para que los otros idiomas puedan cargarse y se sincronizan los controles de Vuetify.
- Vuetify arranca y hace fallback en es; se conserva el mapeo de etiquetas (es-ES → es, en-IN → en, chino, japonés y árabe). Los códigos de idiomas sin catálogo de controles registrado usan el fallback español, conservando el idioma seleccionado para el resto de la interfaz.
- Las fechas visibles siguen la selección del launcher, no navigator.language. Sin preferencia válida, o si Intl no admite el código (por ejemplo lolcat), se formatean en es-ES sin cambiar la preferencia guardada.
- Permanecen los 30 idiomas, los catálogos, el branding y las funcionalidades existentes. Las consultas del idioma real del sistema para información regional o configuración de Minecraft son independientes de la interfaz y se conservan.

### Archivos del ajuste

- Runtime API: index.ts; entities/locale.ts y locale.test.ts; entities/setting.ts y setting.schema.ts. Constante y resolución compartidas para el idioma inicial y preferencias válidas.
- Runtime: settings/pluginSettings.ts y pluginSettings.test.ts; setup/pluginSetup.ts. Inicialización, persistencia y preset del asistente.
- Electron/DeskGap: main/ElectronController.ts; main/utils/i18n.ts e i18n.test.ts; deskgap-app/src/launcherApp.ts. Idioma inicial y fallbacks de menús, diálogos y notificaciones.
- Keystone UI: src/i18n.ts; vuetify.ts; composables/i18n.ts; views/Setup.vue; windows/migration/index.ts; util/locale.ts y locale.test.ts. Inicialización, selección y ventanas auxiliares.
- Fechas de UI: util/date.ts y date.test.ts; composables/date.ts; components/MarketProjectDetailVersion.vue; views/SettingUpdateInfoDialog.vue.
- Este informe. No se modifica ningún catálogo de traducción ni se alteran las cifras de claves traducidas de la entrega original.

### Validación del ajuste

| Comprobación | Resultado |
| --- | --- |
| Pruebas de i18n y selección/persistencia (12 archivos) | **221 aprobadas**, 0 fallos, 0 omitidas |
| Instalación nueva frente a hosts en-US, de, ca, es-ES y zh-CN | Siempre es-ES; no se consulta getLocale para decidirlo |
| Conservación de preferencias | Los 30 códigos registrados se conservan exactamente |
| Cambio manual y lectura del archivo guardado | ca, en, en-IN y fr se guardan y se recuperan |
| Preferencias ausentes, vacías, inválidas y configuración corrupta | es-ES |
| Typecheck general (Runtime API, runtime, Electron/preload, Keystone UI) | Correcto |
| Typecheck DeskGap | Correcto |
| Lint | 0 errores; 2 avisos preexistentes en InstanceBlueprintsService.ts |
| Validación de traducciones | es-ES y ca: 2426/2426 UI, 21/21 Electron, 29/29 embebidas; 0 fallos |
| Compilación Keystone UI | Correcta; 2900 módulos; verify-bundle: 103 chunks, 0 huérfanos |
| Compilación Electron | Correcta: main, preload y workers |
| Compilación DeskGap | Correcta |

Validación real con la CLI standalone de la [skill Chrome DevTools](../../.github/skills/chrome-devtools-cli/SKILL.md), dev:renderer y dev:main, página PbtModLauncherX en localhost:3000, ventana 1200×720 y perfil aislado `temp/default-es-20261010-appdata`, con directorio de juego temporal. Se comprueban las cuatro pantallas del asistente en español y se termina sin cuenta; la pantalla principal y los ajustes muestran textos españoles. Se selecciona ca, se comprueba setting.json, se cierra y se abre: la interfaz mantiene catalán. Se cambia manualmente a en y se repite el reinicio: permanece inglés. La consola durante el cambio ca → en no presenta errores de i18n. Se cierran exclusivamente las instancias de Electron, Vite y la CLI creadas para la validación, sin tocar datos reales.

Los menús y mensajes de notificación se validan contra los catálogos reales con las pruebas de i18n existentes; queda pendiente comprobar visualmente todos los avisos nativos del sistema operativo, las ventanas auxiliares y el runtime externo de DeskGap en cada plataforma. No se publica ni se firma un instalador. Permanecen los avisos de build y los 54 diagnósticos de otros idiomas ya documentados en la Fase 4; no hay errores nuevos de compilación ni claves pendientes en es-ES/ca.

## Archivos modificados

- `PbtModLauncherX-Data/Modificaciones/TRADUCCIONES-v1.0.7.md`
- `xmcl-electron-app/main/locales/ca.yaml`
- `xmcl-electron-app/main/locales/es-ES.yaml`
- `xmcl-keystone-ui/locales/ca.yaml`
- `xmcl-keystone-ui/locales/en.yaml`
- `xmcl-keystone-ui/locales/es-ES.yaml`
- `xmcl-keystone-ui/package.json`
- `xmcl-keystone-ui/scripts/i18n-core.test.mjs`
- `xmcl-keystone-ui/scripts/import-modpack-locales.test.mjs`
- `xmcl-keystone-ui/scripts/validate-translations.mjs`
- `xmcl-keystone-ui/scripts/validate-translations.test.mjs`
- `xmcl-keystone-ui/src/components/FilterCard.vue`
- `xmcl-keystone-ui/src/components/InstanceManifestFileTree.vue`
- `xmcl-keystone-ui/src/components/saveProgressLocale.test.ts`
- `xmcl-keystone-ui/src/composables/i18n.ts`
- `xmcl-keystone-ui/src/util/blueprintLocale.test.ts`
- `xmcl-keystone-ui/src/views/AppSideBarClassic.vue`
- `xmcl-keystone-ui/src/views/AppSideBarGroupItem.vue`
- `xmcl-keystone-ui/src/views/AppSystemBar.vue`
- `xmcl-keystone-ui/src/vuetify.ts`
- `xmcl-runtime/settings/pluginSettings.test.ts`

## Claves propias de la referencia respecto a upstream

- `AppAddInstanceDialog.configTitle`
- `AppAddInstanceDialog.downloadedNotification`
- `AppShareInstanceDialog.cancelShare`
- `AppShareInstanceDialog.downloadToLocal`
- `AppShareInstanceDialog.instanceShare`
- `AppShareInstanceDialog.shareNotifyTitle`
- `HomeJavaIssueDialog.optionSwitch.disabled`
- `HomeJavaIssueDialog.optionSwitch.message`
- `HomeJavaIssueDialog.needDownloadHint`
- `HomeJavaIssueDialog.optionAutoDownload.message`
- `HomeJavaIssueDialog.optionAutoDownload.name`
- `HomeJavaIssueDialog.optionSelectJava.message`
- `HomeJavaIssueDialog.optionSelectJava.name`
- `HomeJavaIssueDialog.recommendedVersionHint`
- `HomeJavaIssueDialog.selectMatchedHint`
- `HomeJavaIssueDialog.selectSecondaryHint`
- `curseforge.authors`
- `curseforge.downloadOnly`
- `curseforge.file.gameVersion`
- `curseforge.file.modLoader`
- `curseforge.install`
- `curseforge.installTo`
- `curseforge.installToStorage`
- `curseforge.project.description`
- `curseforge.project.files`
- `curseforge.project.images`
- `curseforge.recentFiles`
- `curseforge.search`
- `curseforge.totalDownloads`
- `dataMigration.directoryCriteriaHint`
- `dataMigration.migrationDestinationIsFile`
- `dataMigration.migrationDestinationIsNotEmptyDirectory`
- `dataMigration.migrationNoPermission`
- `diagnosis.incompatibleJava.message`
- `diagnosis.invalidJava.message`
- `diagnosis.corruptedVersionJson.message`
- `diagnosis.corruptedVersionJson.name`
- `diagnosis.missingAssets.message`
- `diagnosis.missingAssets.name`
- `diagnosis.missingAssetsIndex.message`
- `diagnosis.missingAssetsIndex.name`
- `diagnosis.missingVersionJar.message`
- `diagnosis.missingVersionJar.name`
- `forgeVersion.common`
- `forgeVersion.name`
- `forgeVersion.showBuggy`
- `forgeVersion.showRecommendedAndLatestOnly`
- `forgeVersion.version`
- `importModpack.failed`
- `importModpack.success`
- `installForge.library`
- `installLabyMod.asset`
- `installLabyMod.json`
- `installOptifine.jar`
- `installOptifine.json`
- `instance.addServer`
- `instance.gameVersion`
- `instance.includeVersion`
- `instance.resolutionEnabled`
- `instance.versionHint`
- `instanceTemplate.curseforge`
- `instanceTemplate.importing`
- `instanceTemplate.mcbbs`
- `instanceTemplate.modpack`
- `instanceTemplate.modrinth`
- `instanceTemplate.title`
- `instances.addManually`
- `instances.addServer`
- `instances.addServerDescription`
- `instances.addTemplate`
- `instances.addTemplateDescription`
- `instances.choose`
- `instances.importFolder`
- `instances.refreshServers`
- `java.browse`
- `java.modifyInstance`
- `launchBlocked.ignore`
- `launchBlocked.launchUserStatusRefreshFailed.description`
- `launchBlocked.launchUserStatusRefreshFailed.title`
- `launchBlocked.userAcquireMicrosoftTokenFailed`
- `launchBlocked.userCheckGameOwnershipFailed`
- `launchBlocked.userExchangeXboxTokenFailed`
- `launchBlocked.userLoginMinecraftByXboxFailed`
- `launcherUpdate.reinstall`
- `localVersion.delete`
- `localVersion.deleteDescription`
- `localVersion.refresh`
- `me.games`
- `me.modpacks`
- `me.versions`
- `minecraftVersion.empty`
- `mod.deletion`
- `mod.deletionHint`
- `mod.deletionRestHint`
- `mod.hideIncompatible`
- `mod.manage`
- `mod.searchOnCurseforge`
- `mod.searchOnModrinth`
- `mod.showInCurseforge`
- `modInstall.checkUpgrade`
- `modInstall.checkedUpgrade`
- `modInstall.display`
- `modInstall.install`
- `modInstall.installed`
- `modInstall.searchHint`
- `modInstall.upgrade`
- `modpack.delete.hint`
- `modpack.delete.title`
- `modpack.emitMcbbs`
- `modpack.general`
- `modpack.includeLibraries`
- `modpack.showFile`
- `modpack.showInCurseforge`
- `modpack.showInFtb`
- `modpack.showInModrinth`
- `modrinth.environments.client`
- `modrinth.environments.server`
- `modrinth.projectType.name`
- `modrinth.projectType.resourcePack`
- `modrinth.perPage`
- `modrinth.quickSearch`
- `modrinth.searchText`
- `modrinthCard.projectHint`
- `multiplayer.allowTurn`
- `multiplayer.allowTurnHint`
- `multiplayer.inviteLink`
- `multiplayer.sharingNotificationBody`
- `multiplayer.sharingNotificationTitle`
- `neoForgedVersion.name`
- `presence.curseforge`
- `presence.curseforgeProject`
- `presence.modrinth`
- `presence.version`
- `resourcepack.available`
- `resourcepack.import`
- `resourcepack.independent`
- `resourcepack.manage`
- `resourcepack.searchOnCurseforge`
- `resourcepack.searchOnModrinth`
- `resourcepack.selectSearchHint`
- `resourcepack.shared`
- `resourcepack.showInCurseforge`
- `save.copy.cancel`
- `save.copy.confirm`
- `save.copy.description`
- `save.copy.title`
- `save.cheat`
- `save.copyFrom.cancel`
- `save.copyFrom.confirm`
- `save.copyFrom.description`
- `save.copyFrom.from`
- `save.copyFrom.fromProfile`
- `save.copyFrom.fromResource`
- `save.copyFrom.title`
- `save.detail`
- `save.import`
- `save.importMessage`
- `save.importTitle`
- `save.manage`
- `screenshots.goto`
- `screenshots.name`
- `server.name`
- `server.recommendedMinecraftVersion`
- `server.status`
- `setting.colorTheme.secondaryColor`
- `setting.allowPrerelease`
- `setting.allowPrereleaseDescription`
- `setting.autoDownload`
- `setting.autoDownloadDescription`
- `setting.autoInstallOnAppQuit`
- `setting.autoInstallOnAppQuitDescription`
- `setting.backgroundImageBlur`
- `setting.backgroundImageBlurDescription`
- `setting.backgroundImageSelect`
- `setting.backgroundVideoSelect`
- `setting.blurAppBar`
- `setting.blurMainBody`
- `setting.blurMainBodyDescription`
- `setting.blurSidebar`
- `setting.hideNewsHeader`
- `setup.game.description`
- `setup.title`
- `shaderPack.deletion`
- `shaderPack.deletionHint`
- `shared.accept`
- `store.explore`
- `store.popular`
- `store.recentUpdated`
- `tag.newTag`
- `universalDrop.enableModsAfterImport`
- `universalDrop.start`
- `universalDrop.title`
- `upstream.missingModpackMetadata`
- `user.birth`
- `user.challenges`
- `user.forgetChallenges`
- `user.info`
- `user.insecureClient`
- `user.refreshAccount`
- `user.refreshSkin`
- `user.submitChallenges`
- `userService.authLibInjector`
- `userService.validateHint`
- `userServices.microsoft.fastLogin`
- `FeedTheBeast.search`
- `FeedTheBeastProject.changelog`
- `FeedTheBeastProject.details`
- `FeedTheBeastProject.install`
- `FeedTheBeastProject.overview`
- `FeedTheBeastProject.versions`
- `HomeSyncDialog.pull`
- `HomeSyncDialog.push`
- `HomeSyncDialogPull.failText`
- `HomeSyncDialogPull.refresh`
- `HomeSyncDialogPull.update`
- `HomeSyncDialogPush.authError`
- `HomeSyncDialogPush.refresh`
- `HomeSyncDialogPush.unknownError`
- `HomeSyncDialogPush.upload`
- `add`
- `author`
- `back`
- `browse`
- `cancel`
- `checkUpdate.name`
- `description`
- `detail`
- `disable`
- `download`
- `edit`
- `enable`
- `error.name`
- `existed`
- `exportModpackTarget.curseforge`
- `exportModpackTarget.github`
- `exportModpackTarget.modrinth`
- `exportModpackTarget.override`
- `filter`
- `finish`
- `forgeConfig.hint`
- `importResource`
- `install`
- `installModpack.deploy`
- `installModpack.download.file`
- `installModpack.download.name`
- `installModpack.name`
- `installModpack.unpack`
- `installResource.fail`
- `installResource.success`
- `liteloader.name`
- `name`
- `next`
- `no`
- `ok`
- `popular`
- `previous`
- `refresh`
- `refreshResource`
- `remove`
- `summery`
- `update.goOfficialWebDownload`
- `yes`
- `modSearchType.all`
- `modSearchType.local`
- `modSearchType.explore`
- `modSearchType.installed`
- `accessibility.window`
- `accessibility.windowControls`
- `accessibility.minimize`
- `accessibility.maximize`
- `accessibility.sidebarNavigation`
- `accessibility.instanceGroup`
- `accessibility.selectedCount`
- `accessibility.moreCount`

## Inventario original de referencia

Las 2.418 claves siguientes corresponden exactamente al inglés del commit inicial; permiten repetir la comparación sin depender de una lista aproximada.

- `AppAddInstanceDialog.choiceTitle`
- `AppAddInstanceDialog.createTitle`
- `AppAddInstanceDialog.serverTitle`
- `AppAddInstanceDialog.configTitle`
- `AppAddInstanceDialog.downloadedNotification`
- `AppShareInstanceDialog.alterDownloadDescription`
- `AppShareInstanceDialog.baseInfo`
- `AppShareInstanceDialog.description`
- `AppShareInstanceDialog.editScopeDescription`
- `AppShareInstanceDialog.editScopeTitle`
- `AppShareInstanceDialog.downloadDescription`
- `AppShareInstanceDialog.downloadNotifyTitle`
- `AppShareInstanceDialog.downloadTitle`
- `AppShareInstanceDialog.filesToDownload`
- `AppShareInstanceDialog.filesToShare`
- `AppShareInstanceDialog.instanceToShare`
- `AppShareInstanceDialog.share`
- `AppShareInstanceDialog.shareTitle`
- `AppShareInstanceDialog.cancelShare`
- `AppShareInstanceDialog.downloadToLocal`
- `AppShareInstanceDialog.instanceShare`
- `AppShareInstanceDialog.shareNotifyTitle`
- `BaseSettingGeneral.title`
- `HomeJavaIssueDialog.incompatibleJava`
- `HomeJavaIssueDialog.incompatibleJavaHint`
- `HomeJavaIssueDialog.missingJava`
- `HomeJavaIssueDialog.missingJavaHint`
- `HomeJavaIssueDialog.optionSwitch.name`
- `HomeJavaIssueDialog.optionSwitch.disabled`
- `HomeJavaIssueDialog.optionSwitch.message`
- `HomeJavaIssueDialog.needDownloadHint`
- `HomeJavaIssueDialog.optionAutoDownload.message`
- `HomeJavaIssueDialog.optionAutoDownload.name`
- `HomeJavaIssueDialog.optionSelectJava.message`
- `HomeJavaIssueDialog.optionSelectJava.name`
- `HomeJavaIssueDialog.recommendedVersionHint`
- `HomeJavaIssueDialog.selectMatchedHint`
- `HomeJavaIssueDialog.selectSecondaryHint`
- `HomeLaunchMultiInstanceDialog.confirm`
- `HomeLaunchMultiInstanceDialog.description`
- `HomeLaunchMultiInstanceDialog.title`
- `SettingMigrationDialog.selectRootDirectory`
- `agent.accessRequiredHint`
- `agent.abort`
- `agent.callingTool`
- `agent.confirmAccept`
- `agent.confirmAllowAll`
- `agent.confirmCancel`
- `agent.confirmPending`
- `agent.confirmTitle`
- `agent.disabledPlaceholder`
- `agent.emptyHint`
- `agent.errorTitle`
- `agent.inputPlaceholder`
- `agent.notConfiguredHint`
- `agent.notConfiguredTitle`
- `agent.openSettings`
- `agent.subscribeXmcl`
- `agent.passiveGameCrashed`
- `agent.passiveGameExitCode`
- `agent.passiveGameExited`
- `agent.passiveGameExitSignal`
- `agent.passiveGameExitSummary`
- `agent.passiveGameExitUnknown`
- `agent.reasoning`
- `agent.passiveGameStarted`
- `agent.passiveGameStartedSummary`
- `agent.passiveModDiagnosis`
- `agent.passiveModDiagnosisError`
- `agent.passiveModDiagnosisSummary`
- `agent.passiveModDuplicate`
- `agent.passiveModInstalled`
- `agent.reset`
- `agent.setupGuide`
- `agent.statusDisabled`
- `agent.statusReady`
- `agent.statusWorking`
- `agent.suggestion1`
- `agent.suggestion2`
- `agent.suggestion3`
- `agent.thinking`
- `agent.title`
- `agent.toolArguments`
- `agent.toolResult`
- `agent.toolRunning`
- `agent.toggleHint`
- `agent.marketConfirmMessage`
- `agent.marketConfirmTarget`
- `agent.marketConfirmTitle`
- `agent.marketInstall`
- `agent.marketInstalled`
- `agent.marketInstallFailed`
- `agent.marketType.datapack`
- `agent.marketType.mod`
- `agent.marketType.modpack`
- `agent.marketType.resourcepack`
- `agent.marketType.shader`
- `agent.marketResultCount`
- `ago.day`
- `ago.hour`
- `ago.minute`
- `ago.second`
- `askAICrash.agentNotConfigured`
- `askAICrash.askAgent`
- `askAICrash.copyPrompt`
- `askAICrash.description`
- `askAICrash.orExternal`
- `askAICrash.selectPlatform`
- `askAICrash.setupAgent`
- `authProfileAddedNotification`
- `bedrock.description`
- `bedrock.install`
- `bedrock.installFailed`
- `bedrock.installed`
- `bedrock.launchHint`
- `bedrock.installBedrockVersion`
- `bedrock.licenseRequired`
- `bedrock.refresh`
- `bedrock.versionsTitle`
- `bedrock.versionsHint`
- `bedrock.versionsError`
- `bedrock.channel`
- `bedrock.channelRelease`
- `bedrock.channelBeta`
- `bedrock.channelPreview`
- `bedrock.active`
- `bedrock.play`
- `bedrock.download`
- `bedrock.installedTag`
- `bedrock.developerModeRequired`
- `bedrock.enableDeveloperMode`
- `bedrock.enableDeveloperModeFailed`
- `bedrock.downloadFailed`
- `bedrock.launchFailed`
- `bedrock.removeFailed`
- `baseSetting.info.address`
- `baseSetting.info.changes`
- `baseSetting.info.custom`
- `baseSetting.info.disabled`
- `baseSetting.info.enabled`
- `baseSetting.info.exportFormats`
- `baseSetting.info.inherited`
- `baseSetting.info.modLoader`
- `baseSetting.info.notConfigured`
- `baseSetting.info.notSet`
- `baseSetting.info.offline`
- `baseSetting.info.projectId`
- `baseSetting.info.running`
- `baseSetting.info.saved`
- `baseSetting.info.status`
- `baseSetting.info.stopped`
- `baseSetting.info.vanilla`
- `baseSetting.title`
- `browseApp.createShortcut`
- `browseApp.default`
- `browseApp.delete`
- `browseApp.launch`
- `browseApps`
- `color`
- `confirm`
- `copyClipboard.success`
- `create`
- `curseforge.category`
- `curseforge.createdDate`
- `curseforge.lastUpdate`
- `curseforge.releasedDate`
- `curseforge.authors`
- `curseforge.downloadOnly`
- `curseforge.file.gameVersion`
- `curseforge.file.modLoader`
- `curseforge.install`
- `curseforge.installTo`
- `curseforge.installToStorage`
- `curseforge.project.description`
- `curseforge.project.files`
- `curseforge.project.images`
- `curseforge.recentFiles`
- `curseforge.search`
- `curseforge.totalDownloads`
- `curseforgeCategory.API and Library`
- `curseforgeCategory.Addons`
- `curseforgeCategory.Adventure`
- `curseforgeCategory.Adventure and RPG`
- `curseforgeCategory.Animated`
- `curseforgeCategory.Armor, Tools, and Weapons`
- `curseforgeCategory.Combat / PvP`
- `curseforgeCategory.Cosmetic`
- `curseforgeCategory.Creation`
- `curseforgeCategory.Data Packs`
- `curseforgeCategory.Education`
- `curseforgeCategory.Exploration`
- `curseforgeCategory.Extra Large`
- `curseforgeCategory.FTB Official Pack`
- `curseforgeCategory.Fabric`
- `curseforgeCategory.FancyMenu`
- `curseforgeCategory.Font Packs`
- `curseforgeCategory.Food`
- `curseforgeCategory.Game Map`
- `curseforgeCategory.Hardcore`
- `curseforgeCategory.MCreator`
- `curseforgeCategory.Magic`
- `curseforgeCategory.Map Based`
- `curseforgeCategory.Map and Information`
- `curseforgeCategory.Medieval`
- `curseforgeCategory.Mini Game`
- `curseforgeCategory.Miscellaneous`
- `curseforgeCategory.Mod Support`
- `curseforgeCategory.Modded World`
- `curseforgeCategory.Modern`
- `curseforgeCategory.Multiplayer`
- `curseforgeCategory.Parkour`
- `curseforgeCategory.Photo Realistic`
- `curseforgeCategory.Puzzle`
- `curseforgeCategory.QoL`
- `curseforgeCategory.Quests`
- `curseforgeCategory.Redstone`
- `curseforgeCategory.Sci-Fi`
- `curseforgeCategory.Server Utility`
- `curseforgeCategory.Skyblock`
- `curseforgeCategory.Small / Light`
- `curseforgeCategory.Steampunk`
- `curseforgeCategory.Storage`
- `curseforgeCategory.Survival`
- `curseforgeCategory.Tech`
- `curseforgeCategory.Technology`
- `curseforgeCategory.Traditional`
- `curseforgeCategory.Twitch Integration`
- `curseforgeCategory.Utility & QoL`
- `curseforgeCategory.Vanilla+`
- `curseforgeCategory.World Gen`
- `dataMigration.apply`
- `dataMigration.placeholder`
- `dataMigration.setRootCause`
- `dataMigration.setRootDescription`
- `dataMigration.setRootTitle`
- `dataMigration.unknownError`
- `dataMigration.waitReload`
- `dataMigration.directoryCriteriaHint`
- `dataMigration.migrationDestinationIsFile`
- `dataMigration.migrationDestinationIsNotEmptyDirectory`
- `dataMigration.migrationNoPermission`
- `delete.name`
- `delete.no`
- `delete.yes`
- `dependencies.dependents`
- `dependencies.embedded`
- `dependencies.incompatible`
- `dependencies.name`
- `dependencies.optional`
- `dependencies.required`
- `diagnosis.badInstall.message`
- `diagnosis.badInstall.name`
- `diagnosis.corruptedAssets.message`
- `diagnosis.corruptedAssets.name`
- `diagnosis.corruptedAssetsIndex.message`
- `diagnosis.corruptedAssetsIndex.name`
- `diagnosis.corruptedLibraries.message`
- `diagnosis.corruptedLibraries.name`
- `diagnosis.corruptedVersionJar.message`
- `diagnosis.corruptedVersionJar.name`
- `diagnosis.incompatibleJava.name`
- `diagnosis.incompatibleJava.message`
- `diagnosis.instanceFiles.description`
- `diagnosis.instanceFiles.title`
- `diagnosis.invalidJava.name`
- `diagnosis.invalidJava.message`
- `diagnosis.missingJava.message`
- `diagnosis.missingJava.name`
- `diagnosis.missingLibraries.message`
- `diagnosis.missingLibraries.name`
- `diagnosis.missingVersion.message`
- `diagnosis.missingVersion.name`
- `diagnosis.unresolvedFiles.description`
- `diagnosis.unresolvedFiles.title`
- `diagnosis.unzipFileNotFound.description`
- `diagnosis.unzipFileNotFound.title`
- `diagnosis.corruptedVersionJson.message`
- `diagnosis.corruptedVersionJson.name`
- `diagnosis.missingAssets.message`
- `diagnosis.missingAssets.name`
- `diagnosis.missingAssetsIndex.message`
- `diagnosis.missingAssetsIndex.name`
- `diagnosis.missingVersionJar.message`
- `diagnosis.missingVersionJar.name`
- `difficulty.easy`
- `difficulty.hard`
- `difficulty.normal`
- `difficulty.peaceful`
- `disk.available`
- `disk.used`
- `downloadCount`
- `downloadModMetadataDb.name`
- `downloadUpdate.name`
- `duplicateInstance.name`
- `duration.day`
- `duration.hour`
- `duration.minute`
- `duration.second`
- `env.select.all`
- `env.select.fit`
- `env.select.none`
- `errors.bedrockUnsupportedPlatform`
- `errors.bedrockNotInstalled`
- `errors.bedrockLaunchFailed`
- `errors.bedrockInstallFailed`
- `errors.bedrockDownloadUrlUnavailable`
- `errors.bedrockDeveloperModeRequired`
- `errors.bedrockRegisterFailed`
- `errors.bedrockVersionNotFound`
- `errors.BadForgeInstallerJarError`
- `errors.BadInstanceType`
- `errors.BodyTimeoutError`
- `errors.ChecksumNotMatchError`
- `errors.ConnectTimeoutError`
- `errors.CorruptedResourceMetadata`
- `errors.DNSNotFoundError`
- `errors.DatabaseNotOpened`
- `errors.DiskIsFull`
- `errors.DownloadAggregateError`
- `errors.DownloadFileSystemError`
- `errors.HeadersTimeoutError`
- `errors.InstallBackendUnresponsive.body`
- `errors.InstallBackendUnresponsive.title`
- `errors.InstallInstructionFailed.body`
- `errors.InstallInstructionFailed.title`
- `errors.InstallNetworkError.body`
- `errors.InstallNetworkError.title`
- `errors.InstallPermissionDenied.body`
- `errors.InstallPermissionDenied.title`
- `errors.NotFoundError`
- `errors.SocketError`
- `eula.body`
- `exception.http`
- `exportModpack.name`
- `extensions.mrpack`
- `extensions.zip`
- `fabricVersion.disable`
- `fabricVersion.empty`
- `fabricVersion.showSnapshot`
- `fabricVersion.stable`
- `fabricVersion.unstable`
- `command.instance.launch.title`
- `command.instance.launch.description`
- `command.instance.create.title`
- `command.instance.create.description`
- `command.instance.delete.title`
- `command.instance.delete.description`
- `command.user.login.title`
- `command.user.login.description`
- `command.user.refresh.title`
- `command.user.refresh.description`
- `commandPalette.placeholder`
- `commandPalette.commands`
- `commandPalette.instances`
- `commandPalette.modrinth`
- `commandPalette.recent`
- `commandPalette.open`
- `commandPalette.openHint`
- `commandPalette.empty`
- `commandPalette.noResults`
- `commandPalette.searching`
- `commandPalette.hintNavigate`
- `commandPalette.hintInvoke`
- `commandPalette.hintEnter`
- `commandPalette.hintBack`
- `commandPalette.hintClose`
- `commandPalette.hintAskAgent`
- `feedback.channel`
- `feedback.description`
- `feedback.discord`
- `feedback.discordDescription`
- `feedback.discordJoin`
- `feedback.generateReport`
- `feedback.generateSaveAs`
- `feedback.github`
- `feedback.githubDescription`
- `feedback.githubOpenIssue`
- `feedback.hint`
- `feedback.kook`
- `feedback.kookDescription`
- `feedback.name`
- `feedback.qq`
- `feedback.qqDescription`
- `feedback.qqEnterGroup`
- `feedback.reddit`
- `feedback.redditDescription`
- `fileDetail.fileSize`
- `fileDetail.filesize`
- `fileDetail.hash`
- `filterLocalOnly`
- `forgeVersion.disable`
- `forgeVersion.empty`
- `forgeVersion.latest`
- `forgeVersion.recommended`
- `forgeVersion.common`
- `forgeVersion.name`
- `forgeVersion.showBuggy`
- `forgeVersion.showRecommendedAndLatestOnly`
- `forgeVersion.version`
- `gameType.adventure`
- `gameType.creative`
- `gameType.spectator`
- `gameType.survival`
- `help`
- `home`
- `importModpack.name`
- `importModpack.fromFileSubtitle`
- `importModpack.fromUrl`
- `importModpack.fromUrlSubtitle`
- `importModpack.fromUrlDescription`
- `importModpack.invalidUrl`
- `importModpack.selectVersion`
- `importModpack.selectVersionDescription`
- `importModpack.pmcProtected`
- `importModpack.netdiskTitle`
- `importModpack.netdiskDescription`
- `importModpack.openNetdisk`
- `importModpack.netdiskOpened`
- `importModpack.noReleasesFound`
- `importModpack.failed`
- `importModpack.success`
- `installAssets.asset`
- `installAssets.assetIndex`
- `installAssets.name`
- `installAuthlibInjector`
- `installCurseforgeFile`
- `installFabric.name`
- `installForge.downloadInstaller`
- `installForge.name`
- `installForge.postProcessing`
- `installForge.library`
- `installInstance.file`
- `installInstance.link`
- `installInstance.name`
- `installInstance.resolve`
- `installInstance.unzip`
- `installJre.decompress`
- `installJre.download`
- `installJre.name`
- `installLabyMod.name`
- `installLabyMod.asset`
- `installLabyMod.json`
- `installLibraries.library`
- `installLibraries.name`
- `installModrinthFile.name`
- `installOptifine.download`
- `installOptifine.name`
- `installOptifine.jar`
- `installOptifine.json`
- `installProfile.name`
- `installQuilt.name`
- `installVersion.jar`
- `installVersion.json`
- `installVersion.name`
- `instance.changeIcon`
- `instance.contents`
- `instance.current`
- `instance.delete`
- `instance.deleteFailed`
- `instance.deleteFailedPermission`
- `instance.deleteFile`
- `instance.deleteHint`
- `instance.deleteHintBedrock`
- `instance.duplicate`
- `instance.duplicatedName`
- `instance.envVarKey`
- `instance.envVarKeyPlaceholder`
- `instance.envVarValue`
- `instance.envVarValuePlaceholder`
- `instance.fileApi`
- `instance.fileApiHint`
- `instance.fileApiPlaceholder`
- `instance.fullscreen`
- `instance.height`
- `instance.monitor`
- `instance.monitorDefault`
- `instance.monitorNumber`
- `instance.monitorPrimary`
- `instance.hideCard`
- `instance.moveToTop`
- `instance.icon`
- `instance.iconHint`
- `instance.iconUrl`
- `instance.installModpack`
- `instance.lastPlayed`
- `instance.launchArguments`
- `instance.launchServer`
- `instance.linkFileDesc`
- `instance.linkFileTitle`
- `instance.mcOptions`
- `instance.mcOptionsHint`
- `instance.name`
- `instance.nameHint`
- `instance.nameInvalidChars`
- `instance.nameNoCyrillic`
- `instance.namePathTraversal`
- `instance.nameReservedName`
- `instance.nameTrailingDotOrSpace`
- `instance.nameWhitespaceOnly`
- `instance.neverPlayed`
- `instance.openCrashReportFolder`
- `instance.openLogFolder`
- `instance.playtime`
- `instance.preExecCommand`
- `instance.preExecCommandHint`
- `instance.prependCommand`
- `instance.prependCommandHint`
- `instance.requireName`
- `instance.resolution`
- `instance.resolutionPreset`
- `instance.showHiddenCards`
- `instance.showInstance`
- `instance.updates`
- `instance.useSharedOptions`
- `instance.useSharedOptionsDesc`
- `instance.useSharedServersList`
- `instance.useSharedServersListDesc`
- `instance.vmOptions`
- `instance.vmOptionsHint`
- `instance.vmVar`
- `instance.vmVarHint`
- `instance.width`
- `instance.addServer`
- `instance.gameVersion`
- `instance.includeVersion`
- `instance.resolutionEnabled`
- `instance.versionHint`
- `instanceAge.older`
- `instanceAge.threeDay`
- `instanceAge.today`
- `instanceDiscover.gameFolder`
- `instanceDiscover.instanceFolder`
- `instanceFileOperation.add`
- `instanceFileOperation.backup-add`
- `instanceFileOperation.backup-remove`
- `instanceFileOperation.keep`
- `instanceFileOperation.remove`
- `instanceInstallSkip.ignore`
- `instanceInstallSkip.skip`
- `instanceInstallSkip.title`
- `instanceInstallSkip.warning`
- `instanceLauncher.search`
- `instanceLauncher.showAll`
- `instanceLauncher.title`
- `instanceSetting.disableAuthlibInjector`
- `instanceSetting.disableAuthlibInjectorDescription`
- `instanceSetting.disableElyByAuthlib`
- `instanceSetting.disableElyByAuthlibDescription`
- `instanceSetting.fastLaunch`
- `instanceSetting.fastLaunchHint`
- `instanceSetting.hideLauncher`
- `instanceSetting.icon`
- `instanceSetting.showLog`
- `instanceSetting.showLogHint`
- `instanceSetting.syncGameLanguage`
- `instanceSetting.syncGameLanguageDescription`
- `instanceTemplate.ftb`
- `instanceTemplate.preview`
- `instanceTemplate.curseforge`
- `instanceTemplate.importing`
- `instanceTemplate.mcbbs`
- `instanceTemplate.modpack`
- `instanceTemplate.modrinth`
- `instanceTemplate.title`
- `instanceUpdate.basic`
- `instanceUpdate.files`
- `instanceUpdate.loaderChanged`
- `instanceUpdate.noFiles`
- `instanceUpdate.summary`
- `instanceUpdate.title`
- `instanceUpdate.update`
- `instances.add`
- `instances.instanceCount`
- `instances.addCurseForgeDescription`
- `instances.addDescription`
- `instances.addMMCDescription`
- `instances.addModrinthDescription`
- `instances.addPrismDescription`
- `instances.addVanilla`
- `instances.addVanillaDescription`
- `instances.edition`
- `instances.editionJava`
- `instances.editionBedrock`
- `instances.editionBedrockHint`
- `instances.editionBedrockWindowsOnly`
- `instances.fix`
- `instances.folder`
- `instances.folderSetting`
- `instances.importFolderDescription`
- `instances.loadingFiles`
- `instances.linkSharedFolders`
- `instances.linkSharedFoldersHint`
- `instances.linkFailed`
- `instances.addManually`
- `instances.addServer`
- `instances.addServerDescription`
- `instances.addTemplate`
- `instances.addTemplateDescription`
- `instances.choose`
- `instances.importFolder`
- `instances.refreshServers`
- `items.count`
- `items.total`
- `java.allocatedLong`
- `java.allocatedShort`
- `java.allocation`
- `java.autoHint`
- `java.change`
- `java.importFromFile`
- `java.invalid`
- `java.location`
- `java.locationHint`
- `java.maxMemory`
- `java.memory`
- `java.memoryAuto`
- `java.memoryManual`
- `java.memoryUnassigned`
- `java.minMemory`
- `java.name`
- `java.noMemory`
- `java.openFolder`
- `java.presets`
- `java.refresh`
- `java.systemMemory`
- `java.browse`
- `java.modifyInstance`
- `labyMod.disable`
- `labyMod.empty`
- `launch.cancel`
- `launch.createShortcut`
- `launch.forceKill`
- `launch.kill`
- `launch.killServer`
- `launch.launch`
- `launch.launchAnyway`
- `launch.launchAs`
- `launch.launchTo`
- `launchBlocked.launchBadVersion.description`
- `launchBlocked.launchBadVersion.title`
- `launchBlocked.launchGeneralException.description`
- `launchBlocked.launchGeneralException.title`
- `launchBlocked.launchInvalidJavaPath.description`
- `launchBlocked.launchInvalidJavaPath.title`
- `launchBlocked.launchJavaNoPermission.description`
- `launchBlocked.launchJavaNoPermission.title`
- `launchBlocked.launchLinuxDisplayUnavailable.environmentMissing`
- `launchBlocked.launchLinuxDisplayUnavailable.noGraphicalSession`
- `launchBlocked.launchLinuxDisplayUnavailable.sandboxDenied`
- `launchBlocked.launchLinuxDisplayUnavailable.title`
- `launchBlocked.launchLinuxDisplayUnavailable.xwaylandMissing`
- `launchBlocked.launchLinuxDisplayUnavailable.xwaylandNotRunning`
- `launchBlocked.launchNoProperJava.description`
- `launchBlocked.launchNoProperJava.title`
- `launchBlocked.launchNoVersionInstalled.description`
- `launchBlocked.launchNoVersionInstalled.title`
- `launchBlocked.launchSpawnProcessFailed.description`
- `launchBlocked.launchSpawnProcessFailed.title`
- `launchBlocked.unexpectedText`
- `launchBlocked.ignore`
- `launchBlocked.launchUserStatusRefreshFailed.description`
- `launchBlocked.launchUserStatusRefreshFailed.title`
- `launchBlocked.userAcquireMicrosoftTokenFailed`
- `launchBlocked.userCheckGameOwnershipFailed`
- `launchBlocked.userExchangeXboxTokenFailed`
- `launchBlocked.userLoginMinecraftByXboxFailed`
- `launchFailed.crash`
- `launchFailed.description`
- `launchFailed.elyByAuthlib.description`
- `launchFailed.elyByAuthlib.suggestion`
- `launchFailed.elyByAuthlib.title`
- `launchFailed.failedToLaunch`
- `launchFailed.latestLog`
- `launchFailed.title`
- `launchPreExecuteCommandFailed.description`
- `launchPreExecuteCommandFailed.title`
- `launchStatus.assigningMemory`
- `launchStatus.elyByWarning`
- `launchStatus.exit`
- `launchStatus.injectingAuthLib`
- `launchStatus.launching`
- `launchStatus.launchingSlow`
- `launchStatus.refreshingUser`
- `launchStatus.spawningProcess`
- `launcherUpdate.alreadyLatest`
- `launcherUpdate.installAndQuit`
- `launcherUpdate.noUpdateAvailable`
- `launcherUpdate.updateToThisVersion`
- `launcherUpdate.reinstall`
- `localVersion.auto`
- `localVersion.empty`
- `localVersion.hint`
- `localVersion.reinstallDescription`
- `localVersion.reinstallTitle`
- `localVersion.title`
- `localVersion.delete`
- `localVersion.deleteDescription`
- `localVersion.refresh`
- `logLevel.error`
- `logLevel.info`
- `logLevel.success`
- `logLevel.warning`
- `logView.searchPlaceholder`
- `login.dropHint`
- `login.forgetPassword`
- `login.login`
- `login.manualLoginUrl`
- `login.signup`
- `login.signupDescription`
- `login.userRelogin`
- `loginError.acquireMicrosoftTokenFailed`
- `loginError.loginCanceled`
- `loginError.badNetworkOrServer`
- `loginError.checkOwnershipFailed`
- `loginError.connectionReset`
- `loginError.cyrillicNotAllowed`
- `loginError.fetchMinecraftProfileFailed`
- `loginError.illegalEmail`
- `loginError.illegalOfflineUsername`
- `loginError.invalidCredentials`
- `loginError.loginMinecraftByXboxFailed`
- `loginError.loginMinecraftByXboxRateLimited`
- `loginError.loginMinecraftByXboxRateLimitedWithRetry`
- `loginError.loginMinecraftByXboxServerError`
- `loginError.loginMinecraftByXboxStatus`
- `loginError.loginXboxAdultVerification`
- `loginError.loginXboxAgeRestricted`
- `loginError.loginXboxBadXsts`
- `loginError.loginXboxBanned`
- `loginError.loginXboxChildAccount`
- `loginError.loginXboxFailed`
- `loginError.loginXboxFailedWithCode`
- `loginError.loginXboxNoXboxProfile`
- `loginError.loginXboxRegionLocked`
- `loginError.noProfileForNewUser`
- `loginError.requestFailed`
- `loginError.xboxErrorGuideHint`
- `loginError.openLoginGuide`
- `loginError.openDiscordSupport`
- `loginError.requireEmail`
- `loginError.requirePassword`
- `loginError.requireUsername`
- `loginError.timeout`
- `logsCrashes.crashes`
- `logsCrashes.failures`
- `logsCrashes.logs`
- `logsCrashes.placeholder`
- `logsCrashes.serverLogs`
- `logsCrashes.showFile`
- `logsCrashes.title`
- `me.groupByDate`
- `me.groupByFolder`
- `me.instanceViewMode`
- `me.listView`
- `me.news`
- `me.recentPlay`
- `me.games`
- `me.modpacks`
- `me.versions`
- `migrateMinecraft.name`
- `xmclAccount.accountSummary`
- `xmclAccount.confirmMerge`
- `xmclAccount.createdAt`
- `xmclAccount.description`
- `xmclAccount.expiresAt`
- `xmclAccount.gameAccountsSeparate`
- `xmclAccount.guest`
- `xmclAccount.identityConflict`
- `xmclAccount.linkAccountWith`
- `xmclAccount.mergePreview`
- `xmclAccount.mergeNeedsSession`
- `xmclAccount.mergeQueued`
- `xmclAccount.requestFailed`
- `xmclAccount.reviewMerge`
- `xmclAccount.session`
- `xmclAccount.sessionActive`
- `xmclAccount.sessionExpired`
- `xmclAccount.signOutAll`
- `xmclAccount.signOutDevice`
- `xmclAccount.status.active`
- `xmclAccount.status.deleted`
- `xmclAccount.status.deletion_pending`
- `xmclAccount.status.merged`
- `xmclAccount.title`
- `minecraftFriends.accept`
- `minecraftFriends.add`
- `minecraftFriends.addPlaceholder`
- `minecraftFriends.addedRelative`
- `minecraftFriends.errors.cannotAddSelf`
- `minecraftFriends.errors.duplicate`
- `minecraftFriends.errors.friendsDisabled`
- `minecraftFriends.errors.generic`
- `minecraftFriends.errors.invalidName`
- `minecraftFriends.errors.inviteRejected`
- `minecraftFriends.errors.tokenExpired`
- `minecraftFriends.errors.unknownProfile`
- `minecraftFriends.expiresRelative`
- `minecraftFriends.friends`
- `minecraftFriends.heroEmptyHint`
- `minecraftFriends.heroEmptyTitle`
- `minecraftFriends.incoming`
- `minecraftFriends.incomingHint`
- `minecraftFriends.notifyAdded`
- `minecraftFriends.outgoing`
- `minecraftFriends.privacy.acceptInvites`
- `minecraftFriends.privacy.acceptInvitesHint`
- `minecraftFriends.privacy.friendsEnabled`
- `minecraftFriends.reconnectAction`
- `minecraftFriends.requiresMicrosoft`
- `minecraftFriends.scopedTo`
- `minecraftFriends.send`
- `minecraftFriends.title`
- `minecraftFriends.unsupported`
- `migrationWindow.title`
- `migrationWindow.preparing`
- `migrationWindow.scanning`
- `migrationWindow.migrating`
- `migrationWindow.done`
- `migrationWindow.files`
- `migrationWindow.warning`
- `migrationWindow.error`
- `minecraftVersion.name`
- `minecraftVersion.all`
- `minecraftVersion.release`
- `minecraftVersion.showAlpha`
- `minecraftVersion.snapshot`
- `minecraftVersion.empty`
- `mod.acceptVersion`
- `mod.applyGroupRules`
- `mod.compatible`
- `mod.createGroup`
- `mod.currentVersion`
- `mod.denseView`
- `mod.description`
- `mod.disableAll`
- `mod.dropHint`
- `mod.duplicatedDetected`
- `mod.duplicatedDetectedDescription`
- `mod.enableAll`
- `mod.enabled`
- `mod.filter`
- `mod.group`
- `mod.groupInstalled`
- `mod.hideInstalled`
- `mod.installedFilterOff`
- `mod.groupName`
- `mod.groupNameRequired`
- `mod.hasUpdate`
- `mod.incompatible`
- `mod.incompatibleHint`
- `mod.incompatibleHintDescription`
- `mod.maybeCompatible`
- `mod.modloaderSelectHint`
- `mod.modloaderSelectNotSupported`
- `mod.mods`
- `mod.name`
- `mod.newFolder`
- `mod.noGroupsFound`
- `mod.noGroupsYet`
- `mod.noModLoaderHint`
- `mod.openLink`
- `mod.search`
- `mod.searchGroups`
- `mod.searchOnMcWiki`
- `mod.selectOrCreateGroup`
- `mod.showDirectory`
- `mod.showFile`
- `mod.showInModrinth`
- `mod.switchDefaultSource`
- `mod.syncGroupRules`
- `mod.toUpdate`
- `mod.ungroup`
- `mod.deletion`
- `mod.deletionHint`
- `mod.deletionRestHint`
- `mod.hideIncompatible`
- `mod.manage`
- `mod.searchOnCurseforge`
- `mod.searchOnModrinth`
- `mod.showInCurseforge`
- `modFilter.clear`
- `modFilter.dependenciesInstallOnly`
- `modFilter.disabledOnly`
- `modFilter.hasUpdateOnly`
- `modFilter.incompatibleOnly`
- `modFilter.unusedOnly`
- `modInstall.archived`
- `modInstall.autoUpgrade.description`
- `modInstall.autoUpgrade.no`
- `modInstall.autoUpgrade.title`
- `modInstall.autoUpgrade.yes`
- `modInstall.checkDependencies`
- `modInstall.checkedDependencies`
- `modInstall.currentVersion`
- `modInstall.dependencyHint`
- `modInstall.releaseOnly`
- `modInstall.installDependencies`
- `modInstall.installHint`
- `modInstall.noVersionSupported`
- `modInstall.recommendation`
- `modInstall.removeUnusedLibraries`
- `modInstall.scanUnusedLibraries`
- `modInstall.search`
- `modInstall.skipVersion`
- `modInstall.source`
- `modInstall.switch`
- `modInstall.checkUpgrade`
- `modInstall.checkedUpgrade`
- `modInstall.display`
- `modInstall.install`
- `modInstall.installed`
- `modInstall.searchHint`
- `modInstall.upgrade`
- `modSearch.noLocalModsFound`
- `modSearch.noModsFound`
- `modSearch.noModsInstalled`
- `modSearch.searchInMarket`
- `modUpgradePolicy.curseforge`
- `modUpgradePolicy.curseforgeOnly`
- `modUpgradePolicy.modrinth`
- `modUpgradePolicy.modrinthOnly`
- `modUpgradePolicy.name`
- `modified.reset`
- `modified.save`
- `modified.unsaved`
- `modpack.author`
- `modpack.authorHint`
- `modpack.description`
- `modpack.descriptionHint`
- `modpack.dropHint`
- `modpack.emitCurseforge`
- `modpack.emitModrinth`
- `modpack.emitModrinthStrict`
- `modpack.emitModrinthStrictDescription`
- `modpack.export`
- `modpack.exportDirectory`
- `modpack.exportDirectoryDescription`
- `modpack.includeAssets`
- `modpack.includes`
- `modpack.modpackVersion`
- `modpack.modrinthProject`
- `modpack.name`
- `modpack.overrides`
- `modpack.selectDefaultFiles`
- `modpack.bindProject`
- `modpack.bindProjectHint`
- `modpack.bindProjectTypeImmutableHint`
- `modpack.bindProjectNoProjects`
- `modpack.unbindProject`
- `modpack.unbindProjectConfirmTitle`
- `modpack.unbindProjectConfirmMessage`
- `modpack.editProject`
- `modpack.projectDiscovery`
- `modpack.projectGallery`
- `modpack.projectGalleryAdd`
- `modpack.projectGalleryEmpty`
- `modpack.projectGalleryFeatured`
- `modpack.projectGalleryFromScreenshots`
- `modpack.projectGalleryHint`
- `modpack.projectGallerySelectScreenshot`
- `modpack.projectIdentity`
- `modpack.projectLinks`
- `modpack.projectLoadFailed`
- `modpack.projectNoChanges`
- `modpack.projectNotBound`
- `modpack.projectNotBoundHint`
- `modpack.projectUnsavedChanges`
- `modpack.projectLatestDraft`
- `modpack.projectVersions`
- `modpack.publish`
- `modpack.publishCategories`
- `modpack.publishChannel`
- `modpack.publishChangelog`
- `modpack.publishChangelogGenerate`
- `modpack.publishConfirmProjectChanges`
- `modpack.publishCreateProject`
- `modpack.publishCreateDraft`
- `modpack.publishCustomVersion`
- `modpack.publishDescription`
- `modpack.publishDiscordUrl`
- `modpack.publishDraftCreated`
- `modpack.publishSubmitted`
- `modpack.publishExistingProject`
- `modpack.publishIcon`
- `modpack.publishIconHint`
- `modpack.publishIconKeep`
- `modpack.publishIconUseInstance`
- `modpack.publishIssuesUrl`
- `modpack.publishLicense`
- `modpack.publishLogin`
- `modpack.publishFiles`
- `modpack.publishLinkageSummary`
- `modpack.publishLinkageEmbeddedSummary`
- `modpack.publishLinkageShowFiles`
- `modpack.publishLinkageReason.missing-file`
- `modpack.publishLinkageReason.not-linked-to-modrinth`
- `modpack.publishLinkageReason.no-downloadable-url`
- `modpack.publishModrinth`
- `modpack.publishNewProject`
- `modpack.publishOpenProject`
- `modpack.publishOpenVersion`
- `modpack.publishProfile`
- `modpack.publishProfileClient`
- `modpack.publishProfileServer`
- `modpack.publishProfileSplit`
- `modpack.publishProfileUniversal`
- `modpack.publishProject`
- `modpack.publishProjectDetailsTab`
- `modpack.publishProjectName`
- `modpack.publishProjectRequired`
- `modpack.publishProjectSlug`
- `modpack.publishProjectUrl`
- `modpack.publishProjectUrlHint`
- `modpack.publishProjectSaved`
- `modpack.publishSourceUrl`
- `modpack.publishSubmit`
- `modpack.publishSummary`
- `modpack.publishSummaryMinWords`
- `modpack.publishVersionTitle`
- `modpack.publishVersionTab`
- `modpack.publishVersion`
- `modpack.publishVisibility`
- `modpack.publishWikiUrl`
- `modpack.visibilityPrivate`
- `modpack.visibilityPublic`
- `modpack.visibilityUnlisted`
- `modpack.url`
- `modpack.urlHint`
- `modpack.delete.hint`
- `modpack.delete.title`
- `modpack.emitMcbbs`
- `modpack.general`
- `modpack.includeLibraries`
- `modpack.showFile`
- `modpack.showInCurseforge`
- `modpack.showInFtb`
- `modpack.showInModrinth`
- `modpackImportConfirm.description`
- `modpackImportConfirm.title`
- `modpackUpdateOrCreate.createNew`
- `modpackUpdateOrCreate.description`
- `modpackUpdateOrCreate.title`
- `modpackUpdateOrCreate.update`
- `modrinth.browseUrl`
- `modrinth.categories.128x`
- `modrinth.categories.16x`
- `modrinth.categories.256x`
- `modrinth.categories.32x`
- `modrinth.categories.48x`
- `modrinth.categories.512x+`
- `modrinth.categories.64x`
- `modrinth.categories.8x-`
- `modrinth.categories.adventure`
- `modrinth.categories.atmosphere`
- `modrinth.categories.audio`
- `modrinth.categories.blocks`
- `modrinth.categories.bloom`
- `modrinth.categories.bukkit`
- `modrinth.categories.bungeecord`
- `modrinth.categories.canvas`
- `modrinth.categories.cartoon`
- `modrinth.categories.categories`
- `modrinth.categories.challenging`
- `modrinth.categories.colored-lighting`
- `modrinth.categories.combat`
- `modrinth.categories.core-shaders`
- `modrinth.categories.cursed`
- `modrinth.categories.datapack`
- `modrinth.categories.decoration`
- `modrinth.categories.economy`
- `modrinth.categories.entities`
- `modrinth.categories.environment`
- `modrinth.categories.equipment`
- `modrinth.categories.fabric`
- `modrinth.categories.fantasy`
- `modrinth.categories.features`
- `modrinth.categories.folia`
- `modrinth.categories.foliage`
- `modrinth.categories.fonts`
- `modrinth.categories.food`
- `modrinth.categories.forge`
- `modrinth.categories.game-mechanics`
- `modrinth.categories.gui`
- `modrinth.categories.high`
- `modrinth.categories.iris`
- `modrinth.categories.items`
- `modrinth.categories.kitchen-sink`
- `modrinth.categories.library`
- `modrinth.categories.lightweight`
- `modrinth.categories.liteloader`
- `modrinth.categories.locale`
- `modrinth.categories.low`
- `modrinth.categories.magic`
- `modrinth.categories.management`
- `modrinth.categories.medium`
- `modrinth.categories.minecraft`
- `modrinth.categories.minigame`
- `modrinth.categories.misc`
- `modrinth.categories.mobs`
- `modrinth.categories.modded`
- `modrinth.categories.models`
- `modrinth.categories.modloader`
- `modrinth.categories.multiplayer`
- `modrinth.categories.name`
- `modrinth.categories.neoforge`
- `modrinth.categories.optifine`
- `modrinth.categories.optimization`
- `modrinth.categories.paper`
- `modrinth.categories.path-tracing`
- `modrinth.categories.pbr`
- `modrinth.categories.performance impact`
- `modrinth.categories.potato`
- `modrinth.categories.purpur`
- `modrinth.categories.quests`
- `modrinth.categories.quilt`
- `modrinth.categories.realistic`
- `modrinth.categories.reflections`
- `modrinth.categories.resolutions`
- `modrinth.categories.rift`
- `modrinth.categories.screenshot`
- `modrinth.categories.semi-realistic`
- `modrinth.categories.shadows`
- `modrinth.categories.simplistic`
- `modrinth.categories.social`
- `modrinth.categories.spigot`
- `modrinth.categories.sponge`
- `modrinth.categories.storage`
- `modrinth.categories.technology`
- `modrinth.categories.themed`
- `modrinth.categories.transportation`
- `modrinth.categories.tweaks`
- `modrinth.categories.utility`
- `modrinth.categories.vanilla`
- `modrinth.categories.vanilla-like`
- `modrinth.categories.velocity`
- `modrinth.categories.waterfall`
- `modrinth.categories.worldgen`
- `modrinth.clientSide`
- `modrinth.copyTitle`
- `modrinth.createAt`
- `modrinth.createCollection`
- `modrinth.description`
- `modrinth.downloads`
- `modrinth.environments.all`
- `modrinth.environments.default`
- `modrinth.environments.name`
- `modrinth.environments.optional`
- `modrinth.environments.required`
- `modrinth.environments.unsupported`
- `modrinth.environments.client`
- `modrinth.environments.server`
- `modrinth.externalResources`
- `modrinth.featuredVersions`
- `modrinth.followedProjects`
- `modrinth.followers`
- `modrinth.gallery`
- `modrinth.gameVersions.name`
- `modrinth.headers.status`
- `modrinth.headers.support`
- `modrinth.headers.version`
- `modrinth.issueUrl`
- `modrinth.license`
- `modrinth.licenses.name`
- `modrinth.loginHint`
- `modrinth.loginTitle`
- `modrinth.modLoaders.name`
- `modrinth.modpackSource.source`
- `modrinth.projectId`
- `modrinth.projectMembers`
- `modrinth.projectType.datapack`
- `modrinth.projectType.mod`
- `modrinth.projectType.modpack`
- `modrinth.projectType.plugin`
- `modrinth.projectType.resourcepack`
- `modrinth.projectType.shader`
- `modrinth.projectType.name`
- `modrinth.projectType.resourcePack`
- `modrinth.projects`
- `modrinth.serverSide`
- `modrinth.sort.downloads`
- `modrinth.sort.follows`
- `modrinth.sort.newest`
- `modrinth.sort.relevance`
- `modrinth.sort.title`
- `modrinth.sort.updated`
- `modrinth.sourceUrl`
- `modrinth.technicalInformation`
- `modrinth.updateAt`
- `modrinth.versions`
- `modrinth.wikiUrl`
- `modrinth.perPage`
- `modrinth.quickSearch`
- `modrinth.searchText`
- `modrinthCard.currentVersion`
- `modrinthCard.projectHint`
- `multiplayer.addFunds`
- `multiplayer.autoShareAmbiguous`
- `multiplayer.availableBalance`
- `multiplayer.balanceHint`
- `multiplayer.billing`
- `multiplayer.billingDescription`
- `multiplayer.billingError`
- `multiplayer.buyTogether`
- `multiplayer.cancelTogether`
- `multiplayer.checkout`
- `multiplayer.complete`
- `multiplayer.confirm`
- `multiplayer.connectionError`
- `multiplayer.connectionFailedHint`
- `multiplayer.connectionTogetherWarning`
- `multiplayer.connectedToMaster`
- `multiplayer.connections`
- `multiplayer.copied`
- `multiplayer.copy`
- `multiplayer.copyGroupToFriendHint`
- `multiplayer.directConnection`
- `multiplayer.copyLocalHint`
- `multiplayer.createLocalToken`
- `multiplayer.currentIpTitle`
- `multiplayer.currentNatTitle`
- `multiplayer.difficultyLevelHint`
- `multiplayer.disconnect`
- `multiplayer.disconnectDescription`
- `multiplayer.disconnected`
- `multiplayer.enterRemoteToken`
- `multiplayer.enterRemoteTokenHint`
- `multiplayer.exposedPortDescription`
- `multiplayer.exposedPorts`
- `multiplayer.gatheringIce`
- `multiplayer.gameAvailable`
- `multiplayer.groupId`
- `multiplayer.master`
- `multiplayer.masterHostsGameHint`
- `multiplayer.masterPurchaseHint`
- `multiplayer.member`
- `multiplayer.illegalTokenDescription`
- `multiplayer.initiateConnection`
- `multiplayer.joinConnection`
- `multiplayer.joinDiscord`
- `multiplayer.joinGame`
- `multiplayer.joinManual`
- `multiplayer.joinOrCreateGroup`
- `multiplayer.joinOrCreateGroupHint`
- `multiplayer.joinCreatesMissingRoomHint`
- `multiplayer.loginRequiredDescription`
- `multiplayer.loginRequiredTitle`
- `multiplayer.kernel`
- `multiplayer.kernelDescription`
- `multiplayer.leaveGroup`
- `multiplayer.localToken`
- `multiplayer.manualConnect`
- `multiplayer.name`
- `multiplayer.natTogetherWarning`
- `multiplayer.openConsumerPortal`
- `multiplayer.refundHint`
- `multiplayer.networkInfo`
- `multiplayer.next`
- `multiplayer.otherExposedPortDescription`
- `multiplayer.placeholder`
- `multiplayer.previous`
- `multiplayer.receiveHint`
- `multiplayer.receiveRemoteTokenHint`
- `multiplayer.remoteToken`
- `multiplayer.relayConnection`
- `multiplayer.routerInfo`
- `multiplayer.sendTokenToRemote`
- `multiplayer.editSharingScope`
- `multiplayer.noRunningInstanceToShare`
- `multiplayer.share`
- `multiplayer.sharing`
- `multiplayer.start`
- `multiplayer.startNewP2PConnection`
- `multiplayer.subscription.active`
- `multiplayer.subscription.cancelled`
- `multiplayer.subscription.payment_due`
- `multiplayer.togetherName`
- `multiplayer.togetherSupportHint`
- `multiplayer.trial.active`
- `multiplayer.trial.available`
- `multiplayer.trial.expired`
- `multiplayer.trial.unavailable`
- `multiplayer.trialDescription`
- `multiplayer.trialTitle`
- `multiplayer.tryTogether`
- `multiplayer.updateSharedInstanceConfirm`
- `multiplayer.updateSharedInstanceDescription`
- `multiplayer.updateSharedInstanceTitle`
- `multiplayer.month`
- `multiplayer.orderStatus`
- `multiplayer.planDescription`
- `multiplayer.relayAllowanceSummary`
- `multiplayer.relayServiceAvailable`
- `multiplayer.waffoHint`
- `multiplayer.waitingForMaster`
- `multiplayer.allowTurn`
- `multiplayer.allowTurnHint`
- `multiplayer.inviteLink`
- `multiplayer.sharingNotificationBody`
- `multiplayer.sharingNotificationTitle`
- `myStuff`
- `natType.blocked`
- `natType.fullCone`
- `natType.openInternet`
- `natType.restrictNat`
- `natType.restrictPortNat`
- `natType.symmetricNat`
- `natType.symmetricUDPFirewall`
- `natType.unknown`
- `neoForgedVersion.disable`
- `neoForgedVersion.empty`
- `neoForgedVersion.name`
- `news.name`
- `news.readMore`
- `optifineVersion.disable`
- `optifineVersion.empty`
- `optional`
- `peerConnectionState.closed`
- `peerConnectionState.connected`
- `peerConnectionState.connecting`
- `peerConnectionState.disconnected`
- `peerConnectionState.failed`
- `peerConnectionState.name`
- `peerConnectionState.new`
- `peerGroupState.closed`
- `peerGroupState.closing`
- `peerGroupState.connected`
- `peerGroupState.connecting`
- `peerIceGatheringState.gathering`
- `peerSignalingState.have-local-offer`
- `presence.away`
- `presence.instance`
- `presence.instanceSetting`
- `presence.mod`
- `presence.modrinthProject`
- `presence.offline`
- `presence.online`
- `presence.playing`
- `presence.playingGeneric`
- `presence.resourcePack`
- `presence.save`
- `presence.setting`
- `presence.shaderPack`
- `presence.curseforge`
- `presence.curseforgeProject`
- `presence.modrinth`
- `presence.version`
- `proxy.host`
- `proxy.port`
- `quiltVersion.disable`
- `quiltVersion.empty`
- `reinstall.name`
- `relative.daysAgo`
- `relative.hoursAgo`
- `relative.justNow`
- `relative.minutesAgo`
- `relative.secondsAgo`
- `resourceError.body`
- `resourceError.title`
- `blueprint.name`
- `blueprint.count`
- `blueprint.searchLocal`
- `blueprint.searchOnline`
- `blueprint.market`
- `blueprint.local`
- `blueprint.provider`
- `blueprint.import`
- `blueprint.openFolder`
- `blueprint.refresh`
- `blueprint.empty`
- `blueprint.dropHint`
- `blueprint.selectHint`
- `blueprint.blocks`
- `blueprint.materials`
- `blueprint.allNamespaces`
- `blueprint.findMod`
- `blueprint.compatible`
- `blueprint.incompatible`
- `blueprint.missingNamespaces`
- `blueprint.delete`
- `blueprint.cancel`
- `blueprint.install`
- `blueprint.goTo`
- `blueprint.byAuthor`
- `blueprint.noDescription`
- `blueprint.loadMore`
- `blueprint.cmsBrowseOnly`
- `blueprint.mixedSources`
- `blueprint.formats.structure`
- `blueprint.preview.title`
- `blueprint.preview.loading`
- `blueprint.preview.empty`
- `blueprint.preview.hint`
- `blueprint.preview.controls`
- `blueprint.convert.title`
- `blueprint.convert.hint`
- `blueprint.convert.target`
- `blueprint.convert.action`
- `blueprint.replace.title`
- `blueprint.replace.simple`
- `blueprint.replace.precise`
- `blueprint.replace.simpleHint`
- `blueprint.replace.preciseHint`
- `blueprint.replace.from`
- `blueprint.replace.to`
- `blueprint.replace.addRule`
- `blueprint.replace.newFile`
- `blueprint.replace.action`
- `resourcepack.compatible`
- `resourcepack.defaultDescription`
- `resourcepack.delete.content`
- `resourcepack.delete.title`
- `resourcepack.dropHint`
- `resourcepack.enable`
- `resourcepack.incompatible`
- `resourcepack.name`
- `resourcepack.linkShared`
- `resourcepack.linkSharedHint`
- `resourcepack.noLocalPacksFound`
- `resourcepack.noPacks`
- `resourcepack.noPacksInstalled`
- `resourcepack.search`
- `resourcepack.searchHint`
- `resourcepack.selected`
- `resourcepack.showDirectory`
- `resourcepack.showFile`
- `resourcepack.unselected`
- `resourcepack.available`
- `resourcepack.import`
- `resourcepack.independent`
- `resourcepack.manage`
- `resourcepack.searchOnCurseforge`
- `resourcepack.searchOnModrinth`
- `resourcepack.selectSearchHint`
- `resourcepack.shared`
- `resourcepack.showInCurseforge`
- `save.allowCheats`
- `save.copy.name`
- `save.copy.cancel`
- `save.copy.confirm`
- `save.copy.description`
- `save.copy.title`
- `save.createNew`
- `save.createdWorlds`
- `save.deleteHint`
- `save.deleteTitle`
- `save.difficulty`
- `save.dropHint`
- `save.datapack.name`
- `save.datapack.noSaveHint`
- `save.datapack.packFormat`
- `save.datapack.imported`
- `save.duplicate`
- `save.export`
- `save.exportMessage`
- `save.exportTitle`
- `save.gameMode`
- `save.independent`
- `save.linkShared`
- `save.linkSharedHint`
- `save.levelName`
- `save.loadMap`
- `save.map.tabTitle`
- `save.progress.zoomIn`
- `save.progress.zoomOut`
- `save.progress.loading`
- `save.progress.noData`
- `save.progress.noDataHint`
- `save.progress.quests`
- `save.progress.advancements`
- `save.progress.done`
- `save.progress.inProgress`
- `save.progress.all`
- `save.progress.treeView`
- `save.progress.filterPlaceholder`
- `save.progress.root`
- `save.progress.exitFullscreen`
- `save.progress.locked`
- `save.mapError`
- `save.mapInfo`
- `save.mapLoaded`
- `save.mapPreview`
- `save.chunkSelectMode`
- `save.panMode`
- `save.chunkSelected`
- `save.mapHintPan`
- `save.mapHintSelect`
- `save.mapHintDeselect`
- `save.toggleGrid`
- `save.heightTop`
- `save.resetView`
- `save.clearSelection`
- `save.copyChunks`
- `save.pasteChunks`
- `save.pasteChunksPlaceHint`
- `save.pasteChunksCancel`
- `save.deleteChunks`
- `save.deleteChunksTitle`
- `save.deleteChunksHint`
- `save.mapLoading`
- `save.noRegions`
- `save.dimOverworld`
- `save.dimNether`
- `save.dimEnd`
- `save.name`
- `save.noLocalSavesFound`
- `save.noSavesFound`
- `save.noSavesInstalled`
- `save.openFolder`
- `save.properties`
- `save.search`
- `save.searchHint`
- `save.searchSaves`
- `save.seed`
- `save.selected`
- `save.shared`
- `save.showDirectory`
- `save.unselected`
- `save.useCurrent`
- `save.useMouseRotate`
- `save.useScrollZoom`
- `save.world`
- `save.cheat`
- `save.copyFrom.cancel`
- `save.copyFrom.confirm`
- `save.copyFrom.description`
- `save.copyFrom.from`
- `save.copyFrom.fromProfile`
- `save.copyFrom.fromResource`
- `save.copyFrom.title`
- `save.detail`
- `save.import`
- `save.importMessage`
- `save.importTitle`
- `save.manage`
- `screenshots.empty`
- `screenshots.gallery`
- `screenshots.hint`
- `screenshots.openFolder`
- `screenshots.playRandom`
- `screenshots.playSequence`
- `screenshots.goto`
- `screenshots.name`
- `search.favorate`
- `search.local`
- `search.market`
- `search.emptyInstalled`
- `search.browseMarket`
- `search.noResults`
- `search.pageSize`
- `localCollection.title`
- `localCollection.newCollection`
- `localCollection.namePlaceholder`
- `localCollection.addToCollection`
- `localCollection.empty`
- `localCollection.corrupted`
- `localCollection.modrinthSection`
- `localCollection.installAll`
- `localCollection.incompatibleAlert`
- `localCollection.projects`
- `server.launch`
- `server.stop`
- `server.acceptingMinecraftVersion`
- `server.addServer`
- `server.address`
- `server.addressHint`
- `server.bindUpstream`
- `server.boundUpstream`
- `server.boundUpstreamHint`
- `server.creationHint`
- `server.editServer`
- `server.emptyHint`
- `server.entryCount`
- `server.expectedVersions`
- `server.export`
- `server.exportNoFilesHint`
- `server.exportOption`
- `server.exportSSHAuthenticationFailed`
- `server.exportSSHOptions`
- `server.exportSSHPrivateKeyPath`
- `server.exportSSHRemotePath`
- `server.exportToFolder`
- `server.filterVersion`
- `server.host`
- `server.hostHint`
- `server.hostRequired`
- `server.ipAddress`
- `server.launchClient`
- `server.launchPinned`
- `server.launchTargetHint`
- `server.maxPlayers`
- `server.motd`
- `server.nameHint`
- `server.nogui`
- `server.onlineMode`
- `server.pin`
- `server.pinAfterSave`
- `server.ping`
- `server.pings`
- `server.pinnedHeader`
- `server.players`
- `server.port`
- `server.clearLog`
- `server.log`
- `server.logWaiting`
- `server.remoteActionSuccess`
- `server.remoteAdmin`
- `server.remoteAuthMethod`
- `server.remoteAuthPassword`
- `server.remoteAuthPrivateKey`
- `server.remoteBuildOfflinePackage`
- `server.remoteConnected`
- `server.remoteConnection`
- `server.remoteDeployment`
- `server.remoteDeploy`
- `server.remoteDisk`
- `server.remoteConfigFiles`
- `server.remoteExtraFiles`
- `server.remoteForgetCredentials`
- `server.remoteInstallService`
- `server.remoteLoad`
- `server.remoteLog`
- `server.remoteMemory`
- `server.remoteMods`
- `server.remoteNoWorldSelected`
- `server.remoteJavaRequired`
- `server.remoteLinuxRequired`
- `server.remoteNotConfiguredHint`
- `server.remotePathNotWritable`
- `server.remotePathWritable`
- `server.remotePolicyInitialize`
- `server.remotePolicyMirror`
- `server.remotePolicyOverlay`
- `server.remotePolicyPreserve`
- `server.remotePreview`
- `server.remotePhase.connect`
- `server.remotePhase.error`
- `server.remotePhase.idle`
- `server.remotePhase.inspect`
- `server.remotePhase.install`
- `server.remotePhase.logs`
- `server.remotePhase.ready`
- `server.remotePhase.service`
- `server.remotePhase.start`
- `server.remotePhase.sync`
- `server.remotePhase.world`
- `server.remoteRememberCredentials`
- `server.remoteReconcileReady`
- `server.remoteRestartService`
- `server.remoteSavedCredentialsHint`
- `server.remoteService`
- `server.remoteServiceActive`
- `server.remoteServerInstalled`
- `server.remoteServiceName`
- `server.remoteServiceNameHint`
- `server.remoteSelectedFiles`
- `server.remoteSelectFiles`
- `server.remoteStartCommand`
- `server.remoteStartCommandHint`
- `server.remoteStartService`
- `server.remoteStatus`
- `server.remoteSystemdRequired`
- `server.remoteTargetName`
- `server.remoteStopService`
- `server.remoteStopWatchLog`
- `server.remoteTestConnection`
- `server.remoteTestConnectionSuccess`
- `server.remoteUninstallConfirmMessage`
- `server.remoteUninstallService`
- `server.remoteRunInstall`
- `server.remoteWatchLog`
- `server.remoteWorldAlways`
- `server.remoteWorldDeployment`
- `server.remoteWorldDeploymentHint`
- `server.remoteWorldFirstInstall`
- `server.remoteWorldNever`
- `server.remoteWorldPresent`
- `server.remoteWorld`
- `server.remoteWorldWillDeploy`
- `server.serverName`
- `server.serviceInstall`
- `server.serviceManagedLaunch`
- `server.serviceManager`
- `server.serviceName`
- `server.serviceNameHint`
- `server.serviceNotInstalled`
- `server.serviceStartCommand`
- `server.serviceSystemd`
- `server.serviceWindows`
- `server.serviceWindowsCommandHint`
- `server.serversListTitle`
- `server.target`
- `server.targetLocal`
- `server.targetLocalHint`
- `server.targetRemote`
- `server.targetRemoteHint`
- `server.unbindUpstream`
- `server.unknown`
- `server.unknownDescription`
- `server.unpin`
- `server.upload`
- `server.upstreamUpToDate`
- `server.upstreamUpToDateHint`
- `server.upstreamUpdateAvailable`
- `server.upstreamUpdateHint`
- `server.useAsUpstreamHint`
- `server.version`
- `server.versionHint`
- `server.worldPreserve`
- `server.name`
- `server.recommendedMinecraftVersion`
- `server.status`
- `serverStatus.nohost`
- `serverStatus.ping`
- `serverStatus.refuse`
- `serverStatus.timeout`
- `setting.multiplayerTransport`
- `setting.multiplayerTransportDescription`
- `setting.about`
- `setting.aboutBmclDescription`
- `setting.aboutContributors`
- `setting.aboutDenoDescription`
- `setting.aboutLicense`
- `setting.aboutLicenseInfo`
- `setting.aboutSponsors`
- `setting.advancedJavaOptions`
- `setting.advancedSettings`
- `setting.advancedSettingsHint`
- `setting.aiAgentApiKey`
- `setting.aiAgentApiKeyClear`
- `setting.aiAgentApiKeyDescription`
- `setting.aiAgentApiKeyEmpty`
- `setting.aiAgentApiKeyNotNeeded`
- `setting.aiAgentApiKeyNotNeededHint`
- `setting.aiAgentApiKeySaved`
- `setting.aiAgentApiKeyStored`
- `setting.aiAgentApiKeyPlaceholder`
- `setting.aiAgentBuiltin`
- `setting.aiAgentCustom`
- `setting.aiAgentEndpoint`
- `setting.aiAgentEndpointDescription`
- `setting.aiAgentEndpointPlaceholder`
- `setting.aiAgentModelPlaceholder`
- `setting.aiAgentModel`
- `setting.aiAgentModelDescription`
- `setting.apiSets.auto`
- `setting.apiSets.official`
- `setting.appearance`
- `setting.appearanceDescription`
- `setting.appxUpdateHint`
- `setting.authenticationSettings`
- `setting.backdropBlur`
- `setting.backgroundColorAbove`
- `setting.backgroundColorAboveDescription`
- `setting.backgroundImage`
- `setting.backgroundImageClear`
- `setting.backgroundImageDescription`
- `setting.useDesktopBackground`
- `setting.backgroundImageFit.contain`
- `setting.backgroundImageFit.cover`
- `setting.backgroundImageFit.name`
- `setting.backgroundImageUrl`
- `setting.backgroundImageUrlPlaceholder`
- `setting.backgroundMusic`
- `setting.backgroundMusicUrl`
- `setting.backgroundMusicUrlPlaceholder`
- `setting.backgroundType`
- `setting.backgroundTypeDescription`
- `setting.backgroundTypes.halo`
- `setting.backgroundTypes.image`
- `setting.backgroundTypes.none`
- `setting.backgroundTypes.particle`
- `setting.backgroundTypes.video`
- `setting.backgroundVideo`
- `setting.backgroundVideoDescription`
- `setting.backgroundVideoUrl`
- `setting.backgroundVideoUrlPlaceholder`
- `setting.backgroundVideoVolume`
- `setting.backgroundVideoVolumeDescription`
- `setting.browseRoot`
- `setting.checkUpdate`
- `setting.colorTheme.appBarColor`
- `setting.colorTheme.backgroundColor`
- `setting.colorTheme.cardColor`
- `setting.colorTheme.description`
- `setting.colorTheme.errorColor`
- `setting.colorTheme.name`
- `setting.colorTheme.primaryColor`
- `setting.colorTheme.sideBarColor`
- `setting.colorTheme.warningColor`
- `setting.colorTheme.secondaryColor`
- `setting.customCss.advancedDescription`
- `setting.customCss.assistantHint`
- `setting.customCss.assistantSuggestion1`
- `setting.customCss.assistantSuggestion2`
- `setting.customCss.assistantTitle`
- `setting.customCss.dropHint`
- `setting.customCss.editorPlaceholder`
- `setting.customCss.globalToggle`
- `setting.customCss.openInDialog`
- `setting.customCss.title`
- `setting.customCss.warning`
- `setting.darkTheme`
- `setting.darkThemeDescription`
- `setting.devModeLabel`
- `setting.developerMode`
- `setting.developerModeDescription`
- `setting.disableTelemetry`
- `setting.disableTelemetryDescription`
- `setting.enableDedicatedGPUOptimization`
- `setting.enableDedicatedGPUOptimizationDescription`
- `setting.enableDiscord`
- `setting.enableDiscordDescription`
- `setting.enterUrl`
- `setting.exportSettings`
- `setting.exportSettingsHint`
- `setting.general`
- `setting.githubRelease`
- `setting.globalJava`
- `setting.globalJavaHint`
- `setting.globalSetting`
- `setting.globalSettingHint`
- `setting.importSettings`
- `setting.importSettingsHint`
- `setting.instanceTheme.activeDescription`
- `setting.instanceTheme.description`
- `setting.instanceTheme.name`
- `setting.language`
- `setting.languageDescription`
- `setting.latestVersion`
- `setting.layout.default`
- `setting.layout.focus`
- `setting.layoutDescription`
- `setting.layoutTitle`
- `setting.linuxEnableDedicatedGPUOptimization`
- `setting.linuxEnableDedicatedGPUOptimizationDescription`
- `setting.linuxTitlebar`
- `setting.linuxTitlebarDescription`
- `setting.livePreview`
- `setting.location`
- `setting.manualUpdateHint`
- `setting.maunalUpdateHint`
- `setting.maxSockets`
- `setting.maxSocketsDescription`
- `setting.maxSocketsTitle`
- `setting.memoryAssignment`
- `setting.migrateFromOther`
- `setting.minecraftOptions`
- `setting.name`
- `setting.network`
- `setting.newsPosition`
- `setting.officialWebsite`
- `setting.particleMode.bubble`
- `setting.particleMode.name`
- `setting.particleMode.push`
- `setting.particleMode.remove`
- `setting.particleMode.repulse`
- `setting.particleModeDescription`
- `setting.quickLaunchSettings`
- `setting.replaceNative`
- `setting.replaceNativeDescription`
- `setting.replaceNatives.all`
- `setting.replaceNatives.legacy`
- `setting.resetAllSettings`
- `setting.resetAllSettingsConfirmMessage`
- `setting.resetAllSettingsConfirmTitle`
- `setting.resetAllSettingsHint`
- `setting.resetAllSettingsSuccess`
- `setting.resetSettingsError`
- `setting.resetToDefault`
- `setting.select`
- `setting.setAsBackground.failed`
- `setting.setAsBackground.global`
- `setting.setAsBackground.instance`
- `setting.setAsBackground.successGlobal`
- `setting.setAsBackground.successInstance`
- `setting.settingsExported`
- `setting.settingsImportError`
- `setting.settingsImported`
- `setting.settingsReloadHint`
- `setting.showNewsHeader`
- `setting.showRoot`
- `setting.sidebarAlign`
- `setting.sidebarAutoHide`
- `setting.sidebarAutoHideHint`
- `setting.sidebarClassic`
- `setting.sidebarNotch`
- `setting.sidebarPosition`
- `setting.sidebarScale`
- `setting.sidebarShowOnlyPinned`
- `setting.sidebarShowOnlyPinnedHint`
- `setting.sidebarStyle`
- `setting.sidebarStyleHint`
- `setting.streamerMode`
- `setting.streamerModeDescription`
- `setting.theme.dark`
- `setting.theme.light`
- `setting.theme.system`
- `setting.themeExport`
- `setting.themeBorderRadius`
- `setting.themeBorderRadiusDescription`
- `setting.themeFont`
- `setting.themeFontDescription`
- `setting.themeFontUrl`
- `setting.themeFontUrlPlaceholder`
- `setting.themeImport`
- `setting.themeResetFont`
- `setting.themeSelectFont`
- `setting.themeSettings`
- `setting.themeShare`
- `setting.themeShareDescription`
- `setting.themeStore.description`
- `setting.themeStore.loadConfirmMessage`
- `setting.themeStore.loadConfirmTitle`
- `setting.themeStore.loadTheme`
- `setting.themeStore.name`
- `setting.themeStore.noSavedThemes`
- `setting.themeStore.saveDialogTitle`
- `setting.themeStore.saveToStore`
- `setting.themeStore.savedThemes`
- `setting.themeStore.themeName`
- `setting.themeStore.themeNameHint`
- `setting.update`
- `setting.useBmclAPI`
- `setting.useBmclAPIDescription`
- `setting.useProxy`
- `setting.useProxyDescription`
- `setting.viewBackgroundMusic`
- `setting.allowPrerelease`
- `setting.allowPrereleaseDescription`
- `setting.autoDownload`
- `setting.autoDownloadDescription`
- `setting.autoInstallOnAppQuit`
- `setting.autoInstallOnAppQuitDescription`
- `setting.backgroundImageBlur`
- `setting.backgroundImageBlurDescription`
- `setting.backgroundImageSelect`
- `setting.backgroundVideoSelect`
- `setting.blurAppBar`
- `setting.blurMainBody`
- `setting.blurMainBodyDescription`
- `setting.blurSidebar`
- `setting.hideNewsHeader`
- `settingLabel.global`
- `settingLabel.globalHint`
- `settingLabel.local`
- `settingLabel.localHint`
- `setup.account.description`
- `setup.account.name`
- `setup.account.skip`
- `setup.appearance.name`
- `setup.dataRoot.description`
- `setup.dataRoot.drives`
- `setup.dataRoot.name`
- `setup.defaultLayoutDescription`
- `setup.defaultPath`
- `setup.error.badDataRoot`
- `setup.error.exists`
- `setup.error.invalidChar`
- `setup.error.noPermission`
- `setup.error.nonDictionary`
- `setup.focusLayoutDescription`
- `setup.game.name`
- `setup.game.description`
- `setup.locale.description`
- `setup.locale.language`
- `setup.locale.name`
- `setup.path`
- `setup.title`
- `shaderPack.disabled`
- `shaderPack.dropHint`
- `shaderPack.empty`
- `shaderPack.enable`
- `shaderPack.enabled`
- `shaderPack.manage`
- `shaderPack.market`
- `shaderPack.name`
- `shaderPack.linkShared`
- `shaderPack.linkSharedHint`
- `shaderPack.noLocalPacksFound`
- `shaderPack.noPacks`
- `shaderPack.noPacksInstalled`
- `shaderPack.noShaderMod`
- `shaderPack.noShaderModHint`
- `shaderPack.noShaderModInstallHint`
- `shaderPack.search`
- `shaderPack.searchHint`
- `shaderPack.selectSearchHint`
- `shaderPack.showDirectory`
- `shaderPack.showFile`
- `shaderPack.deletion`
- `shaderPack.deletionHint`
- `shared.pressKeyCombination`
- `shared.add`
- `shared.author`
- `shared.back`
- `shared.browse`
- `shared.cancel`
- `shared.checkUpgrade`
- `shared.client`
- `shared.copied`
- `shared.copy`
- `shared.close`
- `shared.copyFailed`
- `shared.copyFailedHint`
- `shared.description`
- `shared.disable`
- `shared.download`
- `shared.edit`
- `shared.enable`
- `shared.failed`
- `shared.filter`
- `shared.install`
- `shared.installed`
- `shared.keepSelected`
- `shared.manage`
- `shared.name`
- `shared.next`
- `shared.no`
- `shared.ok`
- `shared.previous`
- `shared.refresh`
- `shared.remove`
- `shared.save`
- `shared.search`
- `shared.server`
- `shared.skipForNow`
- `shared.upgrade`
- `shared.yes`
- `shared.delete`
- `shared.accept`
- `sidebar.pin`
- `sidebar.unpin`
- `sortBy.alphabetAsc`
- `sortBy.alphabetDesc`
- `sortBy.name`
- `sortBy.timeAsc`
- `sortBy.timeDesc`
- `store.discover`
- `store.empty`
- `store.emptyHint`
- `store.latestMinecraft`
- `store.name`
- `store.popularity`
- `store.searchHint`
- `store.searchResult`
- `store.trending`
- `store.explore`
- `store.popular`
- `store.recentUpdated`
- `tag.create`
- `tag.createSelected`
- `tag.newTag`
- `task.cancelled`
- `task.clear`
- `task.connection.connected`
- `task.connection.free`
- `task.connection.pending`
- `task.connection.queued`
- `task.connection.running`
- `task.connection.size`
- `task.connections`
- `task.empty`
- `task.failed`
- `task.manager`
- `task.nTaskRunning`
- `task.name`
- `task.pause`
- `task.running`
- `task.succeed`
- `task.eta`
- `task.remaining`
- `task.totalRemaining`
- `task.op.update`
- `task.op.export`
- `task.op.duplicate`
- `theme.selectImage`
- `theme.selectMusic`
- `theme.selectVideo`
- `theme.title`
- `title`
- `transportType.host`
- `transportType.prflx`
- `transportType.relay`
- `transportType.srflx`
- `turnRegion.fr`
- `turnRegion.guangzhou`
- `turnRegion.hk`
- `turnRegion.liaoning`
- `turnRegion.po`
- `tutorial.blueprint.detailDescription`
- `tutorial.blueprint.detailTitle`
- `tutorial.blueprint.listDescription`
- `tutorial.blueprint.listTitle`
- `tutorial.blueprint.searchDescription`
- `tutorial.blueprint.searchTitle`
- `tutorial.done`
- `tutorial.helpDescription`
- `tutorial.me.instancesDescription`
- `tutorial.me.instancesTitle`
- `tutorial.me.profileDescription`
- `tutorial.me.profileTitle`
- `tutorial.me.skinDescription`
- `tutorial.me.skinTitle`
- `tutorial.multiplayer.contentDescription`
- `tutorial.multiplayer.contentTitle`
- `tutorial.multiplayer.groupDescription`
- `tutorial.multiplayer.groupTitle`
- `tutorial.multiplayer.joinDescription`
- `tutorial.multiplayer.manualDescription`
- `tutorial.multiplayer.railDescription`
- `tutorial.multiplayer.railTitle`
- `tutorial.resourcepack.detailDescription`
- `tutorial.resourcepack.detailTitle`
- `tutorial.resourcepack.listDescription`
- `tutorial.resourcepack.listTitle`
- `tutorial.resourcepack.searchDescription`
- `tutorial.resourcepack.searchTitle`
- `tutorial.save.detailDescription`
- `tutorial.save.detailTitle`
- `tutorial.save.listDescription`
- `tutorial.save.listTitle`
- `tutorial.save.searchDescription`
- `tutorial.save.searchTitle`
- `tutorial.settings.appearanceDescription`
- `tutorial.settings.generalDescription`
- `tutorial.settings.globalDescription`
- `tutorial.settings.navDescription`
- `tutorial.settings.networkDescription`
- `tutorial.shaderpack.detailDescription`
- `tutorial.shaderpack.detailTitle`
- `tutorial.shaderpack.listDescription`
- `tutorial.shaderpack.listTitle`
- `tutorial.shaderpack.searchDescription`
- `tutorial.shaderpack.searchTitle`
- `tutorial.tooltip`
- `tutorial.feedbackDescription`
- `tutorial.hideNewsHeaderDescription`
- `tutorial.instance.appearanceThemeDescription`
- `tutorial.instance.appearanceThemeTitle`
- `tutorial.instance.iconDescription`
- `tutorial.instance.iconTitle`
- `tutorial.instance.javaDescription`
- `tutorial.instance.javaImportDescription`
- `tutorial.instance.javaImportTitle`
- `tutorial.instance.javaTitle`
- `tutorial.instance.modpackExportDescription`
- `tutorial.instance.modpackExportTitle`
- `tutorial.instance.modpackFilesDescription`
- `tutorial.instance.modpackFilesTitle`
- `tutorial.instance.modpackMetaDescription`
- `tutorial.instance.modpackMetaTitle`
- `tutorial.instance.modpackOptionsDescription`
- `tutorial.instance.modpackOptionsTitle`
- `tutorial.instance.serverLaunchDescription`
- `tutorial.instance.serverLaunchTitle`
- `tutorial.instance.serverPropertiesDescription`
- `tutorial.instance.serverPropertiesTitle`
- `tutorial.instance.serverServiceDescription`
- `tutorial.instance.serverServiceTitle`
- `tutorial.instance.serverTargetDescription`
- `tutorial.instance.serverTargetTitle`
- `tutorial.instance.versionDescription`
- `tutorial.instance.versionTitle`
- `tutorial.instanceAddDescription`
- `tutorial.instanceSelectDescription`
- `tutorial.launchDescription`
- `tutorial.mod.defaultSourceDescription`
- `tutorial.mod.defaultSourceTitle`
- `tutorial.mod.detailDescription`
- `tutorial.mod.detailTitle`
- `tutorial.mod.listDescription`
- `tutorial.mod.listTitle`
- `tutorial.mod.searchDescription`
- `tutorial.mod.searchTitle`
- `tutorial.recentPlayDescription`
- `tutorial.storePoupularModpackDescription`
- `tutorial.storeSearchCategoryDescription`
- `tutorial.storeSearchDescription`
- `tutorial.storeSearchResultDescription`
- `tutorial.userAccountDescription`
- `unauthenticatedWarning.cancel`
- `unauthenticatedWarning.description`
- `unauthenticatedWarning.login`
- `unauthenticatedWarning.playAnyway`
- `unauthenticatedWarning.title`
- `universalDrop.unknownResource`
- `universalDrop.enableModsAfterImport`
- `universalDrop.start`
- `universalDrop.title`
- `unresolvedFiles.description`
- `unresolvedFiles.empty`
- `unresolvedFiles.ignoreSelected`
- `unresolvedFiles.install`
- `unresolvedFiles.matched`
- `unresolvedFiles.noMatch`
- `unresolvedFiles.search`
- `unresolvedFiles.source.curseforge-name`
- `unresolvedFiles.source.dependency`
- `unresolvedFiles.source.modrinth-hash`
- `unresolvedFiles.source.modrinth-name`
- `unresolvedFiles.title`
- `unresolvedFiles.via`
- `upstream.downgrade`
- `upstream.onlyShowCurrentVersion`
- `upstream.update`
- `upstream.missingModpackMetadata`
- `user.accessToken`
- `user.authMode`
- `user.authService`
- `user.email`
- `user.id`
- `user.name`
- `user.nameHint`
- `user.profile`
- `user.tokenExpired`
- `user.tokenValidUntil`
- `user.birth`
- `user.challenges`
- `user.forgetChallenges`
- `user.info`
- `user.insecureClient`
- `user.refreshAccount`
- `user.refreshSkin`
- `user.submitChallenges`
- `userAccount.add`
- `userAccount.removeDescription`
- `userAccount.removeTitle`
- `userCape.changeTitle`
- `userCape.description`
- `userCape.noCape`
- `userService.add`
- `userService.authlibInjectorMetadata`
- `userService.baseUrlHint`
- `userService.homepage`
- `userService.implementation`
- `userService.manageServices`
- `userService.register`
- `userService.server`
- `userService.skinDomains`
- `userService.title`
- `userService.version`
- `userService.authLibInjector`
- `userService.validateHint`
- `userServices.microsoft.account`
- `userServices.microsoft.deviceCode`
- `userServices.microsoft.deviceCodeHint`
- `userServices.microsoft.name`
- `userServices.microsoft.password`
- `userServices.microsoft.useDeviceCode`
- `userServices.microsoft.fastLogin`
- `userServices.mojang.account`
- `userServices.mojang.name`
- `userServices.mojang.password`
- `userServices.offline.account`
- `userServices.offline.name`
- `userServices.offline.password`
- `userServices.offline.uuid`
- `userSkin.classic`
- `userSkin.import`
- `userSkin.importFile`
- `userSkin.importLink`
- `userSkin.invalidImage`
- `userSkin.invalidImageTitle`
- `userSkin.placeUrlHere`
- `userSkin.reset`
- `userSkin.save`
- `userSkin.saveTitle`
- `userSkin.saveSuccess`
- `userSkin.saveFailed`
- `userSkin.skinType`
- `userSkin.slim`
- `userSkin.upload`
- `userSkin.uploadFailed`
- `userSkin.uploadRejected`
- `userSkin.urlNotEmpty`
- `userSkin.urlNotValid`
- `userSkin.useSlim`
- `userSkin.libraryTitle`
- `userSkin.librarySubtitle`
- `userSkin.manage`
- `userSkin.all`
- `userSkin.currentSkin`
- `userSkin.savedCount`
- `userSkin.newSkin`
- `userSkin.addNewSkin`
- `userSkin.editSkin`
- `userSkin.skinName`
- `userSkin.skinNamePlaceholder`
- `userSkin.localFile`
- `userSkin.urlOrPlayer`
- `userSkin.urlOrPlayerPlaceholder`
- `userSkin.urlOrPlayerHint`
- `userSkin.dropFileHere`
- `userSkin.supportedFormats`
- `userSkin.preview`
- `userSkin.previewPlaceholder`
- `userSkin.saveToLibrary`
- `userSkin.saveAndEquip`
- `userSkin.equip`
- `userSkin.equipToAccount`
- `userSkin.equipped`
- `userSkin.noSkinSelected`
- `userSkin.saveCurrent`
- `userSkin.officialPreset`
- `userSkin.mySkins`
- `userSkin.presets`
- `userSkin.noSkinsFound`
- `userSkin.tryAddingOne`
- `userSkin.skinUpdated`
- `userSkin.skinDeleteFailed`
- `userSkin.edit`
- `userSkin.fetch`
- `version.checkIntegrity`
- `version.name`
- `version.notInstalled`
- `versionType.alpha`
- `versionType.beta`
- `versionType.name`
- `versionType.release`
- `gamepad.detectedTitle`
- `gamepad.connected`
- `gamepad.guideTitle`
- `gamepad.enableSwitchLabel`
- `gamepad.enabledState`
- `gamepad.disabledState`
- `gamepad.toggle`
- `gamepad.disabledNotify`
- `gamepad.enabledNotify`
- `gamepad.guide.confirm`
- `gamepad.guide.navigate`
- `gamepad.guide.tabs`
- `gamepad.guide.sections`
- `gamepad.guide.launch`
- `gamepad.guide.instanceSettings`
- `gamepad.modSuggestTitle`
- `gamepad.modSuggestBody`
- `gamepad.modInstall`
- `gamepad.modSkip`
- `gamepad.modDone`
- `gamepad.modInstalled`
- `gamepad.modInstalledNotify`
- `gamepad.modNotFound`
- `gamepad.autoEnableLabel`
- `gamepad.autoEnableHint`
- `gamepad.autoOpenKeyboardLabel`
- `gamepad.autoOpenKeyboardHint`
- `gamepad.focusTooltipsLabel`
- `gamepad.focusTooltipsHint`
- `gamepad.disableModPromptLabel`
- `gamepad.disableModPromptHint`
- `gamepad.settingSteamTitle`
- `gamepad.steamAddedNotify`
- `gamepad.steamAlreadyAddedNotify`
- `gamepad.steamDeckTitle`
- `gamepad.steamDeckDesc`
- `gamepad.steamDeckAddBtn`
- `gamepad.steamDeckCancelBtn`
- `FeedTheBeast.search`
- `FeedTheBeastProject.changelog`
- `FeedTheBeastProject.details`
- `FeedTheBeastProject.install`
- `FeedTheBeastProject.overview`
- `FeedTheBeastProject.versions`
- `HomeSyncDialog.pull`
- `HomeSyncDialog.push`
- `HomeSyncDialogPull.failText`
- `HomeSyncDialogPull.refresh`
- `HomeSyncDialogPull.update`
- `HomeSyncDialogPush.authError`
- `HomeSyncDialogPush.refresh`
- `HomeSyncDialogPush.unknownError`
- `HomeSyncDialogPush.upload`
- `add`
- `author`
- `back`
- `browse`
- `cancel`
- `checkUpdate.name`
- `description`
- `detail`
- `disable`
- `download`
- `edit`
- `enable`
- `error.name`
- `existed`
- `exportModpackTarget.curseforge`
- `exportModpackTarget.github`
- `exportModpackTarget.modrinth`
- `exportModpackTarget.override`
- `filter`
- `finish`
- `forgeConfig.hint`
- `importResource`
- `install`
- `installModpack.deploy`
- `installModpack.download.file`
- `installModpack.download.name`
- `installModpack.name`
- `installModpack.unpack`
- `installResource.fail`
- `installResource.success`
- `liteloader.name`
- `name`
- `next`
- `no`
- `ok`
- `popular`
- `previous`
- `refresh`
- `refreshResource`
- `remove`
- `summery`
- `update.goOfficialWebDownload`
- `yes`
- `modSearchType.all`
- `modSearchType.local`
- `modSearchType.explore`
- `modSearchType.installed`

## Claves añadidas: ca global

| Clave | Valor actual |
|---|---|
| `AppShareInstanceDialog.editScopeDescription` | Selecciona els fitxers que els altres jugadors poden descarregar quan detectin aquest joc en execució a la xarxa local. |
| `AppShareInstanceDialog.editScopeTitle` | Edita què es comparteix |
| `AppShareInstanceDialog.instanceToShare` | Joc en execució |
| `HomeJavaIssueDialog.optionSwitch.name` | Canvia a {version} |
| `HomeJavaIssueDialog.optionSwitch.disabled` | No s'ha trobat cap Java {version} a la base de dades. |
| `HomeJavaIssueDialog.optionSwitch.message` | Utilitza el Java {version} que ja tens a l'ordinador |
| `HomeJavaIssueDialog.optionSelectJava.message` | Pot ser que el llançador no hagi trobat el teu Java. Indica on és. |
| `HomeJavaIssueDialog.optionSelectJava.name` | Selecciona el Java de l'ordinador |
| `HomeJavaIssueDialog.recommendedVersionHint` | Per a {version} es recomana una versió de Java dins de l'interval {range}. |
| `HomeJavaIssueDialog.selectMatchedHint` | S'han trobat versions locals de Java adequades. Pots seleccionar-ne una. |
| `HomeJavaIssueDialog.selectSecondaryHint` | S'han trobat versions locals de Java, però pot ser que no compleixin els requisits. Les pots utilitzar per iniciar el joc, tot i que aquest avís continuarà apareixent. |
| `HomeSyncDialog.pull` | Descarrega els canvis |
| `HomeSyncDialog.push` | Puja els canvis |
| `HomeSyncDialogPull.failText` | No s'ha pogut obtenir l'actualització. {url} |
| `HomeSyncDialogPull.refresh` | Actualitza |
| `HomeSyncDialogPull.update` | Actualitza |
| `HomeSyncDialogPush.authError` | L'autenticació de l'usuari no és vàlida. Comprova que tinguis permís per pujar fitxers al servidor. |
| `HomeSyncDialogPush.refresh` | Actualitza |
| `HomeSyncDialogPush.unknownError` | Error desconegut del servidor. Torna-ho a provar. |
| `HomeSyncDialogPush.upload` | Puja la instància |
| `baseSetting.info.address` | Adreça |
| `baseSetting.info.changes` | Canvis |
| `baseSetting.info.custom` | Personalitzat |
| `baseSetting.info.disabled` | Desactivat |
| `baseSetting.info.enabled` | Activat |
| `baseSetting.info.exportFormats` | Formats d'exportació |
| `baseSetting.info.inherited` | Heretat |
| `baseSetting.info.modLoader` | Carregador de mods |
| `baseSetting.info.notConfigured` | Sense configurar |
| `baseSetting.info.notSet` | Sense especificar |
| `baseSetting.info.offline` | Arxiu sense connexió |
| `baseSetting.info.projectId` | ID del projecte |
| `baseSetting.info.running` | En execució |
| `baseSetting.info.saved` | Desat |
| `baseSetting.info.status` | Estat |
| `baseSetting.info.stopped` | Aturat |
| `baseSetting.info.vanilla` | Vanilla |
| `checkUpdate.name` | Cerca actualitzacions |
| `curseforge.category` | Categoria |
| `curseforge.createdDate` | Data de creació |
| `curseforge.lastUpdate` | Darrera actualització |
| `curseforge.releasedDate` | Data de publicació |
| `curseforge.authors` | Autors |
| `curseforge.downloadOnly` | Descarrega |
| `curseforge.file.gameVersion` | Versió del joc |
| `curseforge.file.modLoader` | Carregador de mods |
| `curseforge.installTo` | Instal·la a {path} |
| `curseforge.installToStorage` | Instal·la a l'emmagatzematge |
| `curseforge.project.description` | Descripció |
| `curseforge.project.files` | Fitxers |
| `curseforge.project.images` | Imatges |
| `curseforge.recentFiles` | Fitxers recents |
| `curseforge.totalDownloads` | Descàrregues totals |
| `dependencies.dependents` | Mods que depenen d'aquest mod |
| `diagnosis.unresolvedFiles.description` | No s'ha pogut resoldre {count} fitxer durant la instal·lació \| No s'han pogut resoldre {count} fitxers durant la instal·lació |
| `diagnosis.unresolvedFiles.title` | Fitxers sense resoldre |
| `diagnosis.unzipFileNotFound.description` | No s'ha trobat {file} |
| `diagnosis.unzipFileNotFound.title` | No s'ha trobat el fitxer del modpack |
| `diagnosis.missingVersionJar.message` | Fes clic per instal·lar aquesta versió |
| `diagnosis.missingVersionJar.name` | Falta el JAR de Minecraft %{version} |
| `error.name` | Error \| Errors |
| `errors.bedrockUnsupportedPlatform` | Minecraft Bedrock Edition només és compatible amb la versió per al Windows. |
| `errors.bedrockNotInstalled` | Minecraft Bedrock Edition no està instal·lat. |
| `errors.bedrockLaunchFailed` | No s'ha pogut iniciar Minecraft Bedrock Edition. |
| `errors.bedrockInstallFailed` | No s'ha pogut instal·lar Minecraft Bedrock Edition. |
| `errors.bedrockDownloadUrlUnavailable` | Aquesta versió de Bedrock no està disponible per al compte de Microsoft actual. Les versions Beta i Preview requereixen un compte inscrit al programa beta de Minecraft. |
| `errors.bedrockDeveloperModeRequired` | Cal activar el mode de desenvolupador del Windows per registrar aquesta versió de Bedrock. |
| `errors.bedrockRegisterFailed` | No s'ha pogut registrar aquesta versió de Bedrock al Windows. |
| `errors.bedrockVersionNotFound` | Aquesta versió de Bedrock no està instal·lada localment. |
| `errors.BadForgeInstallerJarError` | No s'ha pogut llegir el JAR de l'instal·lador de Forge. Pot ser que el format hagi canviat. Si el problema persisteix, contacta amb els desenvolupadors. |
| `errors.BadInstanceType` | El tipus d'instància no és vàlid: {type} |
| `errors.BodyTimeoutError` | S'ha esgotat el temps d'espera del cos HTTP |
| `errors.ChecksumNotMatchError` | La suma de verificació no coincideix. Valor esperat: {expect}. Valor obtingut: {actual}. |
| `errors.ConnectTimeoutError` | S'ha esgotat el temps d'espera de connexió amb el servidor. |
| `errors.CorruptedResourceMetadata` | S'han detectat i eliminat metadades malmeses de {count} recursos. Els fitxers continuen funcionant, però se n'ha perdut l'atribució a Modrinth o CurseForge, que es tornarà a detectar automàticament. |
| `errors.DNSNotFoundError` | Error de resolució DNS |
| `errors.DownloadAggregateError` | No s'ha pogut descarregar el fitxer. |
| `errors.DownloadFileSystemError` | No s'ha pogut accedir a la ruta de descàrrega. Comprova que el llançador hi tingui permís d'escriptura. |
| `errors.HeadersTimeoutError` | S'ha esgotat el temps d'espera de les capçaleres HTTP |
| `errors.InstallBackendUnresponsive.body` | El procés en segon pla del llançador ha deixat de respondre i la instal·lació no s'ha pogut completar. Tanca completament el llançador, torna'l a obrir i torna-ho a provar. |
| `errors.InstallBackendUnresponsive.title` | El llançador no respon |
| `errors.InstallInstructionFailed.body` | {name}: {message} |
| `errors.InstallInstructionFailed.title` | No s'han pogut instal·lar els fitxers de Minecraft |
| `errors.InstallNetworkError.body` | Un problema de xarxa ha interromput la instal·lació. Comprova la connexió a Internet o el servidor intermediari i torna-ho a provar. |
| `errors.InstallNetworkError.title` | No es poden descarregar els fitxers de Minecraft |
| `errors.InstallPermissionDenied.body` | L'antivirus o els permisos de la carpeta han bloquejat la instal·lació. Afegeix el llançador a les exclusions de l'antivirus o selecciona una altra carpeta de dades a la configuració. |
| `errors.InstallPermissionDenied.title` | No es pot escriure a la carpeta del llançador |
| `errors.SocketError` | Error del sòcol del servidor |
| `exportModpackTarget.github` | Fitxer de GitHub |
| `exportModpackTarget.override` | Fitxer de substitució (sense processar) |
| `feedback.generateReport` | Genera un informe |
| `feedback.generateSaveAs` | Desa l'informe a |
| `feedback.hint` | Prem el botó per crear un informe i contacta amb l'equip de desenvolupament. L'informe inclourà informació del dispositiu, com ara el tipus i la versió del sistema operatiu i el nom d'usuari del sistema. |
| `feedback.reddit` | Reddit |
| `feedback.redditDescription` | Uneix-te a la comunitat de Reddit r/XMCL |
| `fileDetail.filesize` | Mida del fitxer |
| `forgeConfig.hint` | Inicia el joc almenys una vegada amb aquest mod per poder detectar-ne el fitxer de configuració. |
| `importModpack.fromFileSubtitle` | Tria un fitxer .zip o .mrpack |
| `importModpack.fromUrl` | Des d'un enllaç o URL… |
| `importModpack.fromUrlSubtitle` | Instal·la des de l'URL d'un modpack |
| `importModpack.fromUrlDescription` | Introdueix o enganxa l'URL del modpack: |
| `importModpack.invalidUrl` | Introdueix un URL vàlid (http:// o https://) |
| `importModpack.selectVersion` | Selecciona la versió del modpack |
| `importModpack.selectVersionDescription` | Tria la versió de {name} que vols instal·lar: |
| `importModpack.pmcProtected` | Planet Minecraft està protegit per Cloudflare. Copia l'enllaç de descàrrega directa o el d'un servidor alternatiu de la pàgina. |
| `importModpack.netdiskTitle` | Descàrrega des del núvol |
| `importModpack.netdiskDescription` | Aquesta versió del modpack està allotjada en un servei d'emmagatzematge al núvol extern. Prem el botó de sota per obrir la pàgina de descàrrega al navegador i arrossega el fitxer .zip o .mrpack descarregat a PbtModLauncherX. |
| `importModpack.openNetdisk` | Obre el servei d'emmagatzematge al núvol |
| `importModpack.netdiskOpened` | S'ha obert l'enllaç al navegador i s'ha copiat al porta-retalls. |
| `importModpack.noReleasesFound` | No s'ha trobat cap versió de modpack .mrpack o .zip en aquest repositori. |
| `installModpack.deploy` | Desplega |
| `installModpack.download.file` | Descarrega el fitxer |
| `installModpack.download.name` | Descarrega |
| `installModpack.name` | Instal·la el modpack |
| `installModpack.unpack` | Descomprimeix el modpack |
| `installResource.fail` | No s'ha pogut instal·lar {file} |
| `installResource.success` | S'ha instal·lat el recurs {file} correctament |
| `instance.contents` | Contingut |
| `instance.deleteFile` | Elimina els fitxers de la instància |
| `instance.deleteHintBedrock` | Minecraft Bedrock Edition i totes les seves dades s'eliminaran completament de l'ordinador. N'estàs segur? |
| `instance.envVarKey` | Clau |
| `instance.envVarKeyPlaceholder` | MY_VAR |
| `instance.envVarValue` | Valor |
| `instance.envVarValuePlaceholder` | valor |
| `instance.fileApiPlaceholder` | Introdueix l'URL de sincronització remota per mantenir els recursos sincronitzats |
| `instance.monitor` | Monitor per a la pantalla completa |
| `instance.monitorDefault` | Per defecte (monitor principal) |
| `instance.monitorNumber` | Monitor {number} |
| `instance.monitorPrimary` | Principal |
| `instance.hideCard` | Amaga aquesta targeta |
| `instance.moveToTop` | Mou al principi |
| `instance.nameInvalidChars` | El nom no pot contenir aquests caràcters: < > : " / \\ {'\|'} ? * |
| `instance.nameNoCyrillic` | El nom no pot contenir caràcters ciríl·lics |
| `instance.namePathTraversal` | El nom no pot contenir segments de ruta pare ("..") |
| `instance.nameReservedName` | El sistema reserva aquest nom i no es pot utilitzar |
| `instance.nameTrailingDotOrSpace` | El nom no pot acabar amb un punt o un espai |
| `instance.nameWhitespaceOnly` | El nom no pot contenir només espais o punts |
| `instance.preExecCommand` | Ordre prèvia a l'inici |
| `instance.preExecCommandHint` | Ordre que s'executa abans d'iniciar Minecraft |
| `instance.showHiddenCards` | Mostra les targetes amagades |
| `instance.updates` | Actualitzacions |
| `instance.resolutionEnabled` | Activa la resolució personalitzada |
| `instanceSetting.disableAuthlibInjector` | Desactiva authlib-injector |
| `instanceSetting.disableAuthlibInjectorDescription` | Si utilitzes un sistema d'aparences de tercers, authlib-injector et pot ajudar a mostrar-les al joc. |
| `instanceSetting.disableElyByAuthlib` | Desactiva la substitució d'authlib d'ely.by |
| `instanceSetting.disableElyByAuthlibDescription` | Ely.by ofereix una substitució d'authlib que permet mostrar les aparences a qualsevol servidor. |
| `instanceSetting.fastLaunch` | Inici ràpid |
| `instanceSetting.fastLaunchHint` | Ignora l'estat de l'usuari i els problemes pendents |
| `instanceSetting.hideLauncher` | Amaga el llançador en iniciar el joc |
| `instanceSetting.icon` | Tria una imatge |
| `instanceSetting.showLog` | Mostra el registre de Minecraft |
| `instanceSetting.showLogHint` | Obre una finestra amb el registre de Minecraft en temps real després d'iniciar el joc |
| `instanceSetting.syncGameLanguage` | Sincronitza l'idioma del joc |
| `instanceSetting.syncGameLanguageDescription` | Sincronitza automàticament l'idioma de Minecraft amb el del llançador en iniciar el joc |
| `instanceUpdate.noFiles` | No hi ha canvis als fitxers |
| `instances.instanceCount` | {count} instàncies |
| `instances.addCurseForgeDescription` | Importa des de la carpeta de dades de CurseForge. Selecciona'n la carpeta arrel. |
| `instances.addPrismDescription` | Importa una instància existent de PrismLauncher. |
| `instances.edition` | Edició |
| `instances.editionJava` | Java Edition |
| `instances.editionBedrock` | Bedrock Edition |
| `instances.editionBedrockHint` | Bedrock Edition s'inicia mitjançant Microsoft Store i requereix una llicència de Bedrock. Els mods, els paquets de recursos i altres funcions exclusives de Java no estan disponibles. |
| `instances.editionBedrockWindowsOnly` | Bedrock Edition només és compatible amb la versió per al Windows. |
| `instances.folder` | Carpeta |
| `instances.linkSharedFolders` | Comparteix carpetes entre instàncies |
| `instances.linkSharedFoldersHint` | Crea aquestes carpetes com a enllaços a les carpetes compartides del llançador. Així, aquesta instància compartirà el contingut amb totes les altres instàncies enllaçades. No és una còpia: els canvis fets en una instància apareixen en totes. Les carpetes no seleccionades continuen sent privades. |
| `instances.linkFailed` | No s'ha pogut enllaçar la carpeta {folder} amb la carpeta compartida |
| `java.allocatedLong` | Utilitza el Java per defecte del sistema |
| `java.allocatedShort` | Assignació automàtica |
| `java.allocation` | Assignada |
| `java.autoHint` | El mínim augmenta amb el nombre de mods instal·lats; el màxim depèn de la memòria disponible del sistema. |
| `java.change` | Canvia |
| `java.importFromFile` | Importa Java des d'un fitxer |
| `java.invalid` | La ubicació de Java no és vàlida |
| `java.location` | Ubicació de Java |
| `java.locationHint` | No s'ha seleccionat cap Java; s'utilitza el del sistema |
| `java.memory` | Memòria de Java |
| `java.memoryAuto` | Automàtica |
| `java.memoryManual` | Manual |
| `java.memoryUnassigned` | Sense assignar |
| `java.name` | Java |
| `java.noMemory` | No limitis l'ús de memòria |
| `java.openFolder` | Obre la carpeta de Java |
| `java.presets` | Valors predefinits |
| `java.refresh` | Actualitza els Java locals |
| `java.systemMemory` | Memòria lliure del sistema: {free} / {total} |
| `java.browse` | Selecciona l'executable de Java |
| `java.modifyInstance` | Modifica la ruta de Java |
| `launch.forceKill` | Força el tancament |
| `launch.launchAs` | Inicia com a |
| `launch.launchTo` | Inicia a |
| `launchBlocked.launchLinuxDisplayUnavailable.environmentMissing` | PbtModLauncherX no ha pogut recuperar la informació de la pantalla X11 de la sessió d'escriptori. Reinicia PbtModLauncherX des d'un terminal de la sessió actual o tanca la sessió i torna a entrar-hi. |
| `launchBlocked.launchLinuxDisplayUnavailable.noGraphicalSession` | PbtModLauncherX no s'està executant en una sessió d'escriptori gràfica. Inicia'l des de l'escriptori abans d'iniciar Minecraft. |
| `launchBlocked.launchLinuxDisplayUnavailable.sandboxDenied` | L'entorn aïllat de l'aplicació no té accés a X11. Dona a PbtModLauncherX accés al sòcol X11 als permisos de Flatpak i reinicia'l. |
| `launchBlocked.launchLinuxDisplayUnavailable.title` | La pantalla X11 no està disponible |
| `launchBlocked.launchLinuxDisplayUnavailable.xwaylandMissing` | Minecraft necessita XWayland en aquesta sessió de Wayland. Instal·la el paquet XWayland de la teva distribució de Linux, tanca la sessió i torna a entrar-hi. |
| `launchBlocked.launchLinuxDisplayUnavailable.xwaylandNotRunning` | XWayland està instal·lat, però no hi ha cap pantalla X11 en execució. Activa XWayland a la configuració del compositor, tanca la sessió i torna a entrar-hi. |
| `launchFailed.elyByAuthlib.description` | S'ha utilitzat la substitució d'authlib d'Ely.by per a Minecraft {version}, però pot ser que aquesta versió no sigui plenament compatible. |
| `launchFailed.elyByAuthlib.suggestion` | Pots desactivar la substitució d'authlib d'Ely.by a la configuració de la instància per evitar aquest problema. |
| `launchFailed.elyByAuthlib.title` | Problema de compatibilitat amb l'authlib d'Ely.by |
| `launchStatus.elyByWarning` | La substitució d'authlib d'Ely.by està activada. Algunes versions de Minecraft poden ser incompatibles i fallar. Si tens problemes, desactiva-la a la configuració de la instància. |
| `launcherUpdate.updateToThisVersion` | Descarrega i instal·la |
| `liteloader.name` | LiteLoader |
| `localVersion.auto` | Càlcul automàtic |
| `localVersion.empty` | No hi ha cap versió instal·lada |
| `localVersion.hint` | Inicia directament una versió local concreta |
| `localVersion.reinstallDescription` | Si creus que la instal·lació d'aquesta versió té problemes, pots provar de reinstal·lar-la. |
| `localVersion.reinstallTitle` | Reinstal·la {version} |
| `localVersion.delete` | Elimina la versió local |
| `localVersion.deleteDescription` | Aquesta operació elimina els fitxers JSON i JAR de la versió local. Caldrà tornar-los a descarregar per utilitzar-la. |
| `localVersion.refresh` | Actualitza les versions |
| `login.dropHint` | Arrossega aquí l'enllaç amb el codi d'autorització per iniciar la sessió manualment |
| `login.forgetPassword` | Has oblidat la contrasenya? |
| `login.login` | Inicia la sessió |
| `login.manualLoginUrl` | Si el navegador no s'obre, prem aquest enllaç per autoritzar l'accés. |
| `login.signup` | Registra't |
| `login.signupDescription` | Encara no tens un compte? |
| `login.userRelogin` | El testimoni d'accés ha caducat. Torna a iniciar la sessió. |
| `loginError.loginCanceled` | S'ha cancel·lat l'inici de sessió de Microsoft. |
| `loginError.cyrillicNotAllowed` | No es permeten caràcters ciríl·lics |
| `loginError.illegalOfflineUsername` | El nom d'usuari ha de tenir entre 3 i 16 caràcters i només pot contenir lletres angleses, números i guions baixos |
| `loginError.loginMinecraftByXboxRateLimited` | El servei d'autenticació de Minecraft de Microsoft està limitant les peticions (HTTP 429). Espera una estona i torna-ho a provar. |
| `loginError.loginMinecraftByXboxRateLimitedWithRetry` | El servei d'autenticació de Minecraft de Microsoft està limitant les peticions (HTTP 429). Espera uns {seconds} segons i torna-ho a provar. |
| `loginError.loginMinecraftByXboxServerError` | El servei d'autenticació de Minecraft de Microsoft ha retornat un error del servidor (HTTP {status}). És un problema del servei. Torna-ho a provar d'aquí a uns minuts. |
| `loginError.loginMinecraftByXboxStatus` | No s'ha pogut obtenir el testimoni de Minecraft amb el d'Xbox (HTTP {status}). Comprova que tinguis Minecraft a Xbox o torna-ho a provar. |
| `loginError.loginXboxAdultVerification` | El compte de Microsoft requereix una verificació d'edat per iniciar la sessió a Xbox. Obre {url} al navegador, completa la verificació i torna-ho a provar. |
| `loginError.loginXboxAgeRestricted` | No s'ha pogut iniciar la sessió a Xbox per una restricció d'edat. Comprova que el compte de Microsoft tingui l'edat configurada i que sigui superior a 18 anys. |
| `loginError.loginXboxBadXsts` | Microsoft ha retornat una resposta XSTS sense les dades d'usuari esperades. Sol ser temporal; torna-ho a provar d'aquí a uns minuts. |
| `loginError.loginXboxBanned` | Microsoft ha suspès o bloquejat aquest compte de Microsoft o Xbox i no pot iniciar la sessió a Minecraft. Contacta amb l'assistència de Microsoft o Xbox. |
| `loginError.loginXboxChildAccount` | El compte de Microsoft és infantil i cal afegir-lo a una família de Microsoft per iniciar la sessió a Xbox o Minecraft. Obre {url} al navegador per solucionar-ho i torna-ho a provar. |
| `loginError.loginXboxFailedWithCode` | No s'ha pogut iniciar la sessió a Xbox amb el testimoni de Microsoft (XErr {code}). Cerca aquest codi per obtenir ajuda o torna-ho a provar més tard. |
| `loginError.loginXboxNoXboxProfile` | Aquest compte de Microsoft encara no té un perfil d'Xbox. Obre {url} al navegador per crear-ne un i torna-ho a provar. |
| `loginError.loginXboxRegionLocked` | Xbox Live no està disponible a la regió del compte. Canvia el país o la regió a la configuració del compte de Microsoft i torna-ho a provar. |
| `loginError.noProfileForNewUser` | No s'ha trobat cap perfil de joc. Si ets un usuari nou de Minecraft, inicia la sessió almenys una vegada al llançador oficial. |
| `loginError.xboxErrorGuideHint` | Tens problemes per iniciar la sessió? Consulta com resoldre els problemes d'inici de sessió de Microsoft i Xbox. |
| `loginError.openLoginGuide` | Com es pot resoldre aquest problema |
| `loginError.openDiscordSupport` | Encara necessites ajuda? Uneix-te al nostre Discord |
| `logsCrashes.failures` | Errors d'inici |
| `logsCrashes.serverLogs` | Registres del servidor |
| `logsCrashes.showFile` | Mostra a la carpeta |
| `me.groupByDate` | Agrupa per data |
| `me.groupByFolder` | Agrupa per carpeta |
| `me.instanceViewMode` | Mode de visualització de les instàncies |
| `me.listView` | Vista de llista |
| `minecraftVersion.all` | Totes les versions |
| `mod.createGroup` | Crea un grup |
| `mod.description` | Descripció |
| `mod.disableAll` | Desactiva'ls tots |
| `mod.enableAll` | Activa'ls tots |
| `mod.group` | Agrupa |
| `mod.hideInstalled` | Amaga els mods instal·lats |
| `mod.installedFilterOff` | Mostra tots els mods |
| `mod.groupName` | Nom del grup |
| `mod.groupNameRequired` | Cal indicar un nom per al grup |
| `mod.newFolder` | Carpeta nova |
| `mod.noGroupsFound` | No s'ha trobat cap grup |
| `mod.noGroupsYet` | Encara no hi ha cap grup. Crea'n un! |
| `mod.searchGroups` | Cerca grups… |
| `mod.searchOnMcWiki` | Cerca {name} a l'enciclopèdia de Minecraft. |
| `mod.selectOrCreateGroup` | Selecciona o crea un grup |
| `modInstall.autoUpgrade.description` | Has canviat la versió de Minecraft. Vols actualitzar automàticament els mods compatibles a versions adequades per a Minecraft {version}? |
| `modInstall.autoUpgrade.no` | Omet |
| `modInstall.autoUpgrade.title` | Vols actualitzar els mods? |
| `modInstall.autoUpgrade.yes` | Actualitza els mods |
| `modInstall.releaseOnly` | Ignora les versions alfa i beta en actualitzar |
| `modInstall.scanUnusedLibraries` | Cerca biblioteques no utilitzades |
| `modUpgradePolicy.curseforge` | Prioritza CurseForge |
| `modUpgradePolicy.curseforgeOnly` | Només CurseForge |
| `modUpgradePolicy.modrinth` | Prioritza Modrinth |
| `modUpgradePolicy.modrinthOnly` | Només Modrinth |
| `modUpgradePolicy.name` | Política d'actualització |
| `modpack.exportDirectory` | Carpeta d'exportació |
| `modpack.exportDirectoryDescription` | El modpack s'exportarà per defecte a la carpeta de baixades |
| `modpack.modrinthProject` | Projecte de Modrinth |
| `modpack.selectDefaultFiles` | Selecciona els fitxers per defecte |
| `modpack.bindProject` | Vincula un projecte |
| `modpack.bindProjectHint` | Selecciona un projecte de modpack de Modrinth gestionat pel compte actual. |
| `modpack.bindProjectTypeImmutableHint` | Modrinth fixa el tipus de projecte quan s'hi puja la primera versió i després no es pot canviar. Es poden vincular esborranys sense versions, però un projecte publicat com a mod, paquet de recursos o similar no es pot convertir en modpack. Utilitza «Crea un projecte nou». |
| `modpack.bindProjectNoProjects` | No s'ha trobat cap projecte de Modrinth al teu compte. |
| `modpack.unbindProject` | Desvincula el projecte |
| `modpack.unbindProjectConfirmTitle` | Vols desvincular el projecte de Modrinth? |
| `modpack.unbindProjectConfirmMessage` | Només s'elimina l'associació local entre aquesta instància i el projecte de Modrinth. El projecte i les seves versions a Modrinth no es modifiquen. |
| `modpack.editProject` | Edita el projecte |
| `modpack.projectDiscovery` | Descoberta i compatibilitat |
| `modpack.projectGallery` | Galeria |
| `modpack.projectGalleryAdd` | Afegeix una imatge |
| `modpack.projectGalleryEmpty` | Encara no hi ha imatges a la galeria. |
| `modpack.projectGalleryFeatured` | Destacada |
| `modpack.projectGalleryFromScreenshots` | Tria una captura de pantalla |
| `modpack.projectGalleryHint` | Afegeix imatges de fins a 5 MiB i tria la imatge destacada del projecte. |
| `modpack.projectGallerySelectScreenshot` | Selecciona una captura de pantalla de la instància |
| `modpack.projectIdentity` | Identitat i descripció |
| `modpack.projectLinks` | Enllaços del projecte |
| `modpack.projectLoadFailed` | No s'ha pogut carregar el projecte de Modrinth vinculat. |
| `modpack.projectNoChanges` | No hi ha canvis del projecte pendents de desar. |
| `modpack.projectNotBound` | No hi ha cap projecte de Modrinth vinculat |
| `modpack.projectNotBoundHint` | Vincula un projecte existent o crea'n un de nou a Modrinth. |
| `modpack.projectUnsavedChanges` | {count} camps del projecte modificats |
| `modpack.projectLatestDraft` | Esborrany |
| `modpack.projectVersions` | versions |
| `modpack.publish` | Publica |
| `modpack.publishCategories` | Categories (separades per comes) |
| `modpack.publishChannel` | Canal de publicació |
| `modpack.publishChangelog` | Registre de canvis |
| `modpack.publishChangelogGenerate` | Genera amb IA |
| `modpack.publishConfirmProjectChanges` | Confirma els canvis del projecte |
| `modpack.publishCreateProject` | Crea un projecte |
| `modpack.publishCreateDraft` | Genera i crea un esborrany |
| `modpack.publishCustomVersion` | Personalitzada |
| `modpack.publishDescription` | Descripció del projecte |
| `modpack.publishDiscordUrl` | URL de Discord |
| `modpack.publishDraftCreated` | S'ha pujat l'esborrany de la versió. |
| `modpack.publishSubmitted` | S'ha enviat la versió a revisió. |
| `modpack.publishExistingProject` | Projecte existent |
| `modpack.publishIcon` | Icona del projecte |
| `modpack.publishIconHint` | PNG, JPEG o WebP |
| `modpack.publishIconKeep` | Es conserva si no se selecciona una imatge nova |
| `modpack.publishIconUseInstance` | Utilitza la icona de la instància |
| `modpack.publishIssuesUrl` | URL d'incidències |
| `modpack.publishLicense` | ID de la llicència |
| `modpack.publishLogin` | Inicia la sessió a Modrinth |
| `modpack.publishFiles` | fitxers seleccionats |
| `modpack.publishLinkageSummary` | {linked} de {total} mods, paquets de recursos o paquets de shaders s'enllaçaran directament a la descàrrega de Modrinth en lloc de pujar-se. |
| `modpack.publishLinkageEmbeddedSummary` | {count} fitxers no es poden enllaçar i es pujaran integrats en aquesta versió. |
| `modpack.publishLinkageShowFiles` | Mostra els fitxers que cal pujar |
| `modpack.publishLinkageReason.missing-file` | No s'ha trobat el fitxer al disc |
| `modpack.publishLinkageReason.not-linked-to-modrinth` | No s'ha reconegut com a recurs de Modrinth |
| `modpack.publishLinkageReason.no-downloadable-url` | No s'ha trobat cap URL de descàrrega que permeti redistribuir-lo |
| `modpack.publishModrinth` | Publica a Modrinth |
| `modpack.publishNewProject` | Projecte nou |
| `modpack.publishOpenProject` | Obre el projecte |
| `modpack.publishOpenVersion` | Obre la versió |
| `modpack.publishProfile` | Perfil MRPack |
| `modpack.publishProfileClient` | Només client |
| `modpack.publishProfileServer` | Només servidor |
| `modpack.publishProfileSplit` | Universal amb fitxers separats de client i servidor |
| `modpack.publishProfileUniversal` | Universal |
| `modpack.publishProject` | Projecte |
| `modpack.publishProjectDetailsTab` | Detalls del projecte |
| `modpack.publishProjectName` | Nom del projecte |
| `modpack.publishProjectRequired` | Selecciona un projecte abans de publicar. |
| `modpack.publishProjectSlug` | Identificador llegible del projecte |
| `modpack.publishProjectUrl` | URL del projecte (opcional) |
| `modpack.publishProjectUrlHint` | Deixa-ho en blanc per utilitzar {slug}. |
| `modpack.publishProjectSaved` | S'han actualitzat els detalls del projecte. |
| `modpack.publishSourceUrl` | URL del codi font |
| `modpack.publishSubmit` | Envia l'esborrany a revisió |
| `modpack.publishSummary` | Resum breu |
| `modpack.publishSummaryMinWords` | El resum ha de contenir almenys 3 paraules. |
| `modpack.publishVersionTitle` | Títol de la versió |
| `modpack.publishVersionTab` | Publica la versió |
| `modpack.publishVersion` | Publica la versió |
| `modpack.publishVisibility` | Visibilitat |
| `modpack.publishWikiUrl` | URL de la wiki |
| `modpack.visibilityPrivate` | Privada |
| `modpack.visibilityPublic` | Pública |
| `modpack.visibilityUnlisted` | No llistada |
| `modrinth.browseUrl` | Obre al navegador {url} |
| `modrinth.categories.128x` | 128x |
| `modrinth.categories.16x` | 16x |
| `modrinth.categories.256x` | 256x |
| `modrinth.categories.32x` | 32x |
| `modrinth.categories.48x` | 48x |
| `modrinth.categories.512x+` | 512x+ |
| `modrinth.categories.64x` | 64x |
| `modrinth.categories.8x-` | 8x- |
| `modrinth.categories.adventure` | Aventura |
| `modrinth.categories.atmosphere` | Atmosfera |
| `modrinth.categories.audio` | Àudio |
| `modrinth.categories.blocks` | Blocs |
| `modrinth.categories.bloom` | Resplendor |
| `modrinth.categories.bukkit` | Bukkit |
| `modrinth.categories.bungeecord` | Bungeecord |
| `modrinth.categories.canvas` | Canvas |
| `modrinth.categories.cartoon` | Dibuixos animats |
| `modrinth.categories.categories` | Categories |
| `modrinth.categories.challenging` | Desafiant |
| `modrinth.categories.colored-lighting` | Il·luminació de colors |
| `modrinth.categories.combat` | Combat |
| `modrinth.categories.core-shaders` | Shaders del joc base |
| `modrinth.categories.cursed` | Insòlit |
| `modrinth.categories.datapack` | Paquet de dades |
| `modrinth.categories.decoration` | Decoració |
| `modrinth.categories.economy` | Economia |
| `modrinth.categories.entities` | Entitats |
| `modrinth.categories.environment` | Entorn |
| `modrinth.categories.equipment` | Equipament |
| `modrinth.categories.fabric` | Fabric |
| `modrinth.categories.fantasy` | Fantasia |
| `modrinth.categories.features` | Funcions |
| `modrinth.categories.folia` | Folia |
| `modrinth.categories.foliage` | Vegetació |
| `modrinth.categories.fonts` | Tipus de lletra |
| `modrinth.categories.food` | Menjar |
| `modrinth.categories.forge` | Forge |
| `modrinth.categories.game-mechanics` | Mecàniques de joc |
| `modrinth.categories.gui` | Interfície gràfica |
| `modrinth.categories.high` | Alt |
| `modrinth.categories.iris` | Iris |
| `modrinth.categories.items` | Objectes |
| `modrinth.categories.kitchen-sink` | De tot una mica |
| `modrinth.categories.library` | Biblioteca |
| `modrinth.categories.lightweight` | Lleuger |
| `modrinth.categories.liteloader` | LiteLoader |
| `modrinth.categories.locale` | Idioma |
| `modrinth.categories.low` | Baix |
| `modrinth.categories.magic` | Màgia |
| `modrinth.categories.management` | Gestió |
| `modrinth.categories.medium` | Mitjà |
| `modrinth.categories.minecraft` | Minecraft |
| `modrinth.categories.minigame` | Minijocs |
| `modrinth.categories.misc` | Diversos |
| `modrinth.categories.mobs` | Criatures |
| `modrinth.categories.modded` | Amb mods |
| `modrinth.categories.models` | Models |
| `modrinth.categories.modloader` | Carregador de mods |
| `modrinth.categories.multiplayer` | Multijugador |
| `modrinth.categories.name` | Categories |
| `modrinth.categories.neoforge` | NeoForge |
| `modrinth.categories.optifine` | OptiFine |
| `modrinth.categories.optimization` | Optimització |
| `modrinth.categories.paper` | Paper |
| `modrinth.categories.path-tracing` | Traçat de camins |
| `modrinth.categories.pbr` | PBR |
| `modrinth.categories.performance impact` | Impacte en el rendiment |
| `modrinth.categories.potato` | Equips modestos |
| `modrinth.categories.purpur` | Purpur |
| `modrinth.categories.quests` | Missions |
| `modrinth.categories.quilt` | Quilt |
| `modrinth.categories.realistic` | Realista |
| `modrinth.categories.reflections` | Reflexos |
| `modrinth.categories.resolutions` | Resolucions |
| `modrinth.categories.rift` | Rift |
| `modrinth.categories.screenshot` | Captures de pantalla |
| `modrinth.categories.semi-realistic` | Semirealista |
| `modrinth.categories.shadows` | Ombres |
| `modrinth.categories.simplistic` | Senzill |
| `modrinth.categories.social` | Social |
| `modrinth.categories.spigot` | Spigot |
| `modrinth.categories.sponge` | Sponge |
| `modrinth.categories.storage` | Emmagatzematge |
| `modrinth.categories.technology` | Tecnologia |
| `modrinth.categories.themed` | Temàtic |
| `modrinth.categories.transportation` | Transport |
| `modrinth.categories.tweaks` | Ajustos |
| `modrinth.categories.utility` | Utilitats |
| `modrinth.categories.vanilla` | Vanilla |
| `modrinth.categories.vanilla-like` | Similar a Vanilla |
| `modrinth.categories.velocity` | Velocity |
| `modrinth.categories.waterfall` | Waterfall |
| `modrinth.categories.worldgen` | Generació del món |
| `modrinth.clientSide` | Costat del client |
| `modrinth.copyTitle` | Copia el text {title} al porta-retalls |
| `modrinth.createAt` | Creat |
| `modrinth.createCollection` | Crea una col·lecció |
| `modrinth.description` | Descripció |
| `modrinth.downloads` | Descàrregues |
| `modrinth.environments.all` | Tots |
| `modrinth.environments.default` | Per defecte |
| `modrinth.environments.name` | Entorn |
| `modrinth.environments.optional` | Opcional |
| `modrinth.environments.required` | Obligatori |
| `modrinth.environments.unsupported` | No compatible |
| `modrinth.environments.client` | Client |
| `modrinth.environments.server` | Servidor |
| `modrinth.externalResources` | Recursos externs |
| `modrinth.featuredVersions` | Versions destacades |
| `modrinth.followedProjects` | Projectes seguits |
| `modrinth.followers` | Seguidors |
| `modrinth.gallery` | Galeria |
| `modrinth.gameVersions.name` | Versions del joc |
| `modrinth.headers.status` | Estadístiques |
| `modrinth.headers.support` | Compatibilitat |
| `modrinth.headers.version` | Versió |
| `modrinth.issueUrl` | Incidències |
| `modrinth.license` | Llicència |
| `modrinth.licenses.name` | Llicències |
| `modrinth.loginHint` | Aquesta operació requereix iniciar la sessió a Modrinth. El llançador obrirà una finestra del navegador per fer-ho. |
| `modrinth.loginTitle` | Inicia la sessió a Modrinth |
| `modrinth.modLoaders.name` | Carregadors de mods |
| `modrinth.modpackSource.source` | Origen |
| `modrinth.projectId` | ID del projecte |
| `modrinth.projectMembers` | Membres del projecte |
| `modrinth.projectType.datapack` | Paquet de dades |
| `modrinth.projectType.mod` | Mod |
| `modrinth.projectType.modpack` | Modpack |
| `modrinth.projectType.plugin` | Complement |
| `modrinth.projectType.resourcepack` | Paquet de recursos |
| `modrinth.projectType.shader` | Shader |
| `modrinth.projectType.name` | Tipus de projecte |
| `modrinth.projectType.resourcePack` | Paquet de recursos |
| `modrinth.projects` | {count} projectes |
| `modrinth.serverSide` | Costat del servidor |
| `modrinth.sort.downloads` | Nombre de descàrregues |
| `modrinth.sort.follows` | Nombre de seguidors |
| `modrinth.sort.newest` | Creació recent |
| `modrinth.sort.relevance` | Rellevància |
| `modrinth.sort.title` | Ordena per |
| `modrinth.sort.updated` | Actualització recent |
| `modrinth.sourceUrl` | Codi font |
| `modrinth.technicalInformation` | Informació tècnica |
| `modrinth.updateAt` | Actualitzat |
| `modrinth.versions` | Versions |
| `modrinth.wikiUrl` | Wiki |
| `modrinth.perPage` | Per pàgina |
| `modrinth.quickSearch` | Cerca {title} |
| `modrinth.searchText` | Cerca |
| `multiplayer.addFunds` | Afegeix saldo |
| `multiplayer.autoShareAmbiguous` | Hi ha diversos jocs en execució. Selecciona la instància que allotja el món en xarxa local perquè PbtModLauncherX el pugui compartir. |
| `multiplayer.availableBalance` | Saldo disponible |
| `multiplayer.balanceHint` | Disponible per als serveis de XMCL Together |
| `multiplayer.billing` | Facturació |
| `multiplayer.billingDescription` | Gestiona l'accés als repetidors, el pla Together Home i els pagaments. |
| `multiplayer.billingError` | No s'ha pogut carregar la facturació de Together. Torna-ho a provar d'aquí a una estona. |
| `multiplayer.buyTogether` | Compra Together |
| `multiplayer.cancelTogether` | Cancel·la el pla |
| `multiplayer.checkout` | Obre el pagament de Waffo |
| `multiplayer.complete` | Completa |
| `multiplayer.confirm` | Confirma |
| `multiplayer.connectionError` | Error de connexió |
| `multiplayer.connectionFailedHint` | No s'ha pogut establir la connexió. Comprova que els dos participants tinguin tipus de NAT compatibles. |
| `multiplayer.connectionTogetherWarning` | Un membre de la sala fa estona que no es pot connectar amb tu. Prova XMCL Together per millorar la connectivitat de tota la sala. Només cal que l'amfitrió tingui Together. |
| `multiplayer.connectedToMaster` | Connectat amb l'amfitrió de la sala |
| `multiplayer.connections` | Connexions |
| `multiplayer.copied` | Copiat! |
| `multiplayer.copy` | Copia |
| `multiplayer.copyGroupToFriendHint` | Els teus amics poden unir-se al grup amb aquest identificador |
| `multiplayer.directConnection` | Directa |
| `multiplayer.copyLocalHint` | Copia el text SDP local i envia'l a l'altre jugador perquè l'introdueixi a «Uneix-te a una connexió». <span>Un testimoni només es pot utilitzar amb <span style="color: red; font-weight: bold;">un jugador</span>. No l'enviïs a diversos jugadors!</span><br><span class="hint-text" style="font-style: italic;">Per connectar amb diversos jugadors, crea <span style="font-weight: bold; color: rgba(245, 158, 11)">diverses</span> connexions.</span><br> |
| `multiplayer.createLocalToken` | Crea un testimoni local |
| `multiplayer.currentIpTitle` | IP pública detectada |
| `multiplayer.currentNatTitle` | Xarxa actual (NAT): |
| `multiplayer.difficultyLevelHint` | Dificultat per establir una connexió |
| `multiplayer.disconnect` | Desconnecta |
| `multiplayer.disconnectDescription` | Vols desconnectar de l'usuari {user} ({id})? |
| `multiplayer.disconnected` | desconnectat |
| `multiplayer.enterRemoteToken` | Introdueix el testimoni remot |
| `multiplayer.enterRemoteTokenHint` | Quan l'altre jugador introdueixi el teu testimoni, introdueix el seu al camp de sota. Prem Confirma per connectar-vos. |
| `multiplayer.exposedPortDescription` | Port que has exposat als altres jugadors |
| `multiplayer.exposedPorts` | Ports redirigits |
| `multiplayer.gatheringIce` | Espera que el servidor ICE reculli prou informació de la xarxa. Pots enviar el SDP actual si ja hi ha prou informació i prémer Següent. Envia el <span class="v-chip v-chip--label v-size--small" style="text-font: bold">Testimoni local</span> a l'altre jugador perquè l'introdueixi a <span class="v-chip v-chip--label v-size--small" style="text-font: bold">Uneix-te a una connexió</span>.<br>El servidor ICE pot trigar a generar el <span class="v-chip v-chip--label v-size--small" style="text-font: bold">Testimoni local</span>.<br>No cal esperar que acabi: si el testimoni de sota ja no canvia, el pots copiar i enviar.<br> |
| `multiplayer.gameAvailable` | Partida disponible a la xarxa local |
| `multiplayer.groupId` | ID del grup |
| `multiplayer.master` | Amfitrió |
| `multiplayer.masterHostsGameHint` | L'amfitrió de la sala és el centre de connexió i hauria d'allotjar el món de Minecraft en xarxa local. Transfereix aquest rol abans de canviar d'amfitrió. |
| `multiplayer.masterPurchaseHint` | Només cal que l'amfitrió de la sala tingui Together Home per millorar la connectivitat de tots els participants. |
| `multiplayer.member` | Membre |
| `multiplayer.illegalTokenDescription` | El testimoni no és vàlid. Comprova que el testimoni de l'altre jugador sigui correcte. |
| `multiplayer.initiateConnection` | Inicia una connexió |
| `multiplayer.joinConnection` | Si l'altre jugador ja ha iniciat una connexió, selecciona «Uneix-te a una connexió». |
| `multiplayer.joinDiscord` | Uneix-te a Discord |
| `multiplayer.joinGame` | Uneix-te al joc |
| `multiplayer.joinManual` | Uneix-t'hi |
| `multiplayer.joinOrCreateGroup` | Uneix-te a un grup o crea'n un |
| `multiplayer.joinOrCreateGroupHint` | Obtén l'ID del grup dels teus amics o crea un grup |
| `multiplayer.joinCreatesMissingRoomHint` | Si la sala no existeix, la crearàs i en seràs l'amfitrió. |
| `multiplayer.loginRequiredDescription` | El multijugador P2P utilitza els serveis en línia de XMCL. Inicia la sessió amb un XMCL Account per continuar. |
| `multiplayer.loginRequiredTitle` | Inicia la sessió per al multijugador P2P |
| `multiplayer.kernel` | Motor P2P |
| `multiplayer.kernelDescription` | Utilitza WebRTC natiu o node-datachannel. Canvia aquesta opció només si les connexions P2P fan fallar la finestra del llançador. |
| `multiplayer.leaveGroup` | Surt del grup |
| `multiplayer.localToken` | Testimoni local |
| `multiplayer.manualConnect` | Connecta manualment |
| `multiplayer.name` | Multijugador en xarxa local |
| `multiplayer.natTogetherWarning` | Pot ser que l'encaminador tingui problemes per connectar amb l'amfitrió de la sala. Si la connexió falla, prova XMCL Together per millorar la connectivitat amb els teus amics. |
| `multiplayer.openConsumerPortal` | Obre el portal del consumidor |
| `multiplayer.refundHint` | Necessites un reemborsament? Visita el portal del consumidor de Waffo per gestionar les comandes i les subscripcions. Només cal que l'amfitrió compri Together per a la sala. |
| `multiplayer.networkInfo` | Informació de xarxa |
| `multiplayer.next` | Següent |
| `multiplayer.otherExposedPortDescription` | Port redirigit per {user} |
| `multiplayer.placeholder` | Connecta amb altres usuaris per jugar a Minecraft en xarxa local! |
| `multiplayer.previous` | Anterior |
| `multiplayer.receiveHint` | La connexió es crearà automàticament quan l'altre jugador introdueixi el teu testimoni. Ja pots tancar el diàleg. |
| `multiplayer.receiveRemoteTokenHint` | Introdueix aquí el testimoni de l'altre jugador. |
| `multiplayer.remoteToken` | Testimoni remot |
| `multiplayer.relayConnection` | Repetidor |
| `multiplayer.routerInfo` | Informació de l'encaminador |
| `multiplayer.sendTokenToRemote` | Envia el testimoni a l'altre jugador |
| `multiplayer.editSharingScope` | Edita què es comparteix |
| `multiplayer.noRunningInstanceToShare` | Inicia un joc abans d'editar què es comparteix |
| `multiplayer.share` | Comparteix la configuració de la instància |
| `multiplayer.sharing` | S'estan compartint els fitxers… |
| `multiplayer.start` | Inicia |
| `multiplayer.startNewP2PConnection` | Prem Inicia per crear una connexió nova amb un altre jugador |
| `multiplayer.subscription.active` | Activa |
| `multiplayer.subscription.cancelled` | Cancel·lada |
| `multiplayer.subscription.payment_due` | Pagament pendent |
| `multiplayer.togetherName` | Minecraft Together |
| `multiplayer.togetherSupportHint` | Si el multijugador no funciona, uneix-te al nostre Discord i contacta amb l'equip de desenvolupament. T'ajudarem a resoldre el problema. |
| `multiplayer.trial.active` | Prova activa |
| `multiplayer.trial.available` | Prova gratuïta disponible |
| `multiplayer.trial.expired` | Prova ja utilitzada |
| `multiplayer.trial.unavailable` | Prova no disponible |
| `multiplayer.trialDescription` | Una prova de 7 dies amb 1 GB de trànsit de repetidor. |
| `multiplayer.trialTitle` | Prova de connectivitat |
| `multiplayer.tryTogether` | Prova Together |
| `multiplayer.updateSharedInstanceConfirm` | Actualitza i inicia |
| `multiplayer.updateSharedInstanceDescription` | Els mods compartits són diferents dels de {instance}. Vols actualitzar aquesta instància perquè coincideixi amb la de l'amfitrió abans d'iniciar-la? Es farà una còpia de seguretat dels fitxers modificats. |
| `multiplayer.updateSharedInstanceTitle` | Vols actualitzar la instància compartida? |
| `multiplayer.month` | mes |
| `multiplayer.orderStatus` | Comanda de Waffo: {status} |
| `multiplayer.planDescription` | 20 GB mensuals de trànsit de repetidor gestionat i assistència amb IA per resoldre problemes del modpack. |
| `multiplayer.relayAllowanceSummary` | Queden {remaining} de {total} en aquest període |
| `multiplayer.relayServiceAvailable` | Servei de repetidor de XMCL Together disponible |
| `multiplayer.waffoHint` | Els pagaments es completen de manera segura a Waffo Pancake. XMCL no rep mai el número de la teva targeta. |
| `multiplayer.waitingForMaster` | S'espera que l'amfitrió de la sala es torni a connectar |
| `multiplayer.allowTurn` | Activa el servidor repetidor |
| `multiplayer.allowTurnHint` | Permet un servidor repetidor si no et pots connectar amb el teu amic. Pot alentir la connexió; utilitza'l amb precaució. |
| `multiplayer.inviteLink` | Enllaç d'invitació |
| `multiplayer.sharingNotificationBody` | Pots descarregar o crear una instància a partir de la configuració compartida de {name}. |
| `multiplayer.sharingNotificationTitle` | Un jugador comparteix la configuració del joc |
| `presence.away` | Absent |
| `presence.offline` | Sense connexió |
| `presence.online` | En línia |
| `presence.playing` | Jugant a {game} |
| `presence.playingGeneric` | Jugant |
| `resourcepack.linkShared` | Comparteix paquets de recursos entre instàncies |
| `resourcepack.linkSharedHint` | Enllaça la carpeta resourcepacks d'aquesta instància amb la carpeta compartida global perquè totes les instàncies vegin els mateixos paquets de recursos. Els paquets existents es fusionaran a la carpeta compartida. |
| `resourcepack.noLocalPacksFound` | No s'ha trobat cap paquet de recursos local que coincideixi amb la cerca. |
| `resourcepack.noPacks` | No s'ha trobat cap paquet de recursos |
| `resourcepack.noPacksInstalled` | No tens cap paquet de recursos instal·lat. |
| `resourcepack.search` | Cerca paquets de recursos… |
| `resourcepack.showDirectory` | Mostra la carpeta de paquets de recursos |
| `save.allowCheats` | Permet ordres |
| `save.difficulty` | Dificultat |
| `save.datapack.name` | Paquet de dades \| Paquets de dades |
| `save.datapack.noSaveHint` | Crea o selecciona un món abans d'instal·lar aquest paquet de dades |
| `save.datapack.packFormat` | Format del paquet: {format} |
| `save.datapack.imported` | S'ha importat el paquet de dades a {save} |
| `save.duplicate` | Duplica la partida |
| `save.linkShared` | Comparteix partides entre instàncies |
| `save.linkSharedHint` | Enllaça la carpeta saves d'aquesta instància amb la carpeta compartida global perquè totes les instàncies comparteixin els mateixos mons. Els mons existents es fusionaran a la carpeta compartida. |
| `save.loadMap` | Carrega el mapa |
| `save.map.tabTitle` | Mapa del món |
| `save.progress.zoomIn` | Apropa |
| `save.progress.zoomOut` | Allunya |
| `save.progress.loading` | S'està carregant el progrés… |
| `save.progress.noData` | No s'ha trobat cap progrés |
| `save.progress.noDataHint` | Juga en aquest món per generar avenços, estadístiques i progrés de missions. |
| `save.progress.quests` | Missions |
| `save.progress.advancements` | Avenços |
| `save.progress.done` | Completat |
| `save.progress.inProgress` | En curs |
| `save.progress.all` | Tot |
| `save.progress.treeView` | Vista d'arbre |
| `save.progress.filterPlaceholder` | Filtra per nom… |
| `save.progress.root` | Arrel |
| `save.progress.exitFullscreen` | Surt de la pantalla completa |
| `save.progress.locked` | Bloquejat |
| `save.mapError` | Error del mapa |
| `save.mapInfo` | Previsualització interactiva del món en 3D: |
| `save.mapLoaded` | Mapa carregat |
| `save.mapPreview` | Previsualització del mapa |
| `save.chunkSelectMode` | Selecciona chunks |
| `save.panMode` | Desplaça |
| `save.chunkSelected` | {count} chunks seleccionats |
| `save.mapHintPan` | Arrossega per desplaçar |
| `save.mapHintSelect` | Selecciona |
| `save.mapHintDeselect` | Desselecciona |
| `save.toggleGrid` | Mostra o amaga la quadrícula de regions |
| `save.heightTop` | Superior |
| `save.resetView` | Restableix la vista |
| `save.clearSelection` | Neteja la selecció |
| `save.copyChunks` | Copia chunks |
| `save.pasteChunks` | Enganxa {count} chunks |
| `save.pasteChunksPlaceHint` | Mou el ratolí per col·locar {count} chunks i fes clic per enganxar-los. Se sobreescriuran els chunks de destinació. Prem Esc per cancel·lar. |
| `save.pasteChunksCancel` | Cancel·la |
| `save.deleteChunks` | Elimina chunks |
| `save.deleteChunksTitle` | Elimina els chunks seleccionats |
| `save.deleteChunksHint` | Vols eliminar els {count} chunks seleccionats? Aquesta acció no es pot desfer. Es regeneraran la pròxima vegada que el joc carregui la zona. |
| `save.mapLoading` | S'està carregant el mapa… |
| `save.noRegions` | Aquest món no té regions generades per previsualitzar. |
| `save.dimOverworld` | Overworld |
| `save.dimNether` | Nether |
| `save.dimEnd` | End |
| `save.noLocalSavesFound` | No s'ha trobat cap partida local que coincideixi amb la cerca. |
| `save.noSavesFound` | No s'ha trobat cap partida |
| `save.noSavesInstalled` | No tens cap partida. |
| `save.openFolder` | Obre la carpeta de partides |
| `save.properties` | Propietats del món |
| `save.searchHint` | Cerca mons a CurseForge |
| `save.searchSaves` | Cerca partides |
| `save.seed` | Llavor |
| `save.useMouseRotate` | Utilitza el ratolí per girar la vista |
| `save.useScrollZoom` | Utilitza la roda per ampliar o reduir |
| `save.world` | Món |
| `screenshots.gallery` | Galeria de captures de pantalla |
| `screenshots.hint` | Prem F2 al joc per fer captures de pantalla |
| `screenshots.openFolder` | Obre la carpeta de captures de pantalla |
| `search.local` | Instal·lats |
| `search.market` | Catàleg de mods |
| `search.emptyInstalled` | Encara no hi ha res instal·lat |
| `search.browseMarket` | Explora el catàleg |
| `search.noResults` | No s'ha trobat cap resultat |
| `search.pageSize` | Resultats per pàgina |
| `server.launch` | Inicia el servidor |
| `server.stop` | Atura el servidor |
| `server.addServer` | Afegeix un servidor |
| `server.address` | Adreça del servidor |
| `server.addressHint` | P. ex., mc.hypixel.net |
| `server.bindUpstream` | Vincula com a servidor de referència |
| `server.boundUpstream` | Servidor de referència vinculat |
| `server.boundUpstreamHint` | Aquesta instància segueix la versió de Minecraft del servidor vinculat. |
| `server.editServer` | Edita el servidor |
| `server.emptyHint` | El fitxer servers.dat d'aquesta instància encara no conté servidors. Afegeix-ne un per començar. |
| `server.entryCount` | {count} servidor \| {count} servidors |
| `server.launchClient` | Inicia el client |
| `server.launchPinned` | Fixat |
| `server.launchTargetHint` | Aquesta instància inicia directament el servidor fixat. Vols tornar al client? |
| `server.nameHint` | Nom que es mostra a la llista multijugador |
| `server.pin` | Fixa el servidor |
| `server.pinAfterSave` | Fixa com a destinació d'inici per defecte en desar |
| `server.pinnedHeader` | fixat: {name} |
| `server.clearLog` | Neteja el registre |
| `server.log` | Registre del servidor |
| `server.logWaiting` | La sortida del servidor apareixerà aquí després d'iniciar-lo. |
| `server.remoteActionSuccess` | Fet. |
| `server.remoteAdmin` | Administració del servidor remot |
| `server.remoteAuthMethod` | Autenticació |
| `server.remoteAuthPassword` | Contrasenya |
| `server.remoteAuthPrivateKey` | Clau privada |
| `server.remoteBuildOfflinePackage` | Genera un paquet sense connexió |
| `server.remoteConnected` | Connectat |
| `server.remoteConnection` | Connexió |
| `server.remoteDeployment` | Desplegament |
| `server.remoteDeploy` | Desplega |
| `server.remoteDisk` | Disc |
| `server.remoteConfigFiles` | Fitxers de configuració |
| `server.remoteExtraFiles` | Fitxers addicionals |
| `server.remoteForgetCredentials` | Oblida les credencials desades |
| `server.remoteInstallService` | Instal·la el servei |
| `server.remoteLoad` | Càrrega mitjana |
| `server.remoteLog` | Registre remot |
| `server.remoteMemory` | Memòria |
| `server.remoteMods` | Mods |
| `server.remoteNoWorldSelected` | No s'ha seleccionat cap món de la instància |
| `server.remoteJavaRequired` | Java no està disponible a l'equip Linux remot. |
| `server.remoteLinuxRequired` | Només s'admeten destinacions SSH amb Linux. |
| `server.remoteNotConfiguredHint` | Emplena i desa les dades de connexió per consultar l'estat, controlar el servei i seguir el registre en temps real. |
| `server.remotePathNotWritable` | No es pot escriure a la carpeta del servidor remot. |
| `server.remotePathWritable` | Carpeta amb permís d'escriptura |
| `server.remotePolicyInitialize` | Inicialitza una vegada |
| `server.remotePolicyMirror` | Replica |
| `server.remotePolicyOverlay` | Superposa |
| `server.remotePolicyPreserve` | Conserva |
| `server.remotePreview` | Previsualitza els canvis |
| `server.remotePhase.connect` | S'està connectant |
| `server.remotePhase.error` | Ha fallat l'aplicació de l'estat desitjat |
| `server.remotePhase.idle` | Preparat per aplicar l'estat desitjat |
| `server.remotePhase.inspect` | S'està inspeccionant la destinació |
| `server.remotePhase.install` | S'està instal·lant el servidor |
| `server.remotePhase.logs` | S'està connectant la consola |
| `server.remotePhase.ready` | S'ha aplicat l'estat desitjat |
| `server.remotePhase.service` | S'està comprovant el servei systemd |
| `server.remotePhase.start` | S'està iniciant el servidor |
| `server.remotePhase.sync` | S'està sincronitzant l'estat desitjat |
| `server.remotePhase.world` | S'està aplicant la política del món |
| `server.remoteRememberCredentials` | Recorda les credencials al clauer del sistema |
| `server.remoteReconcileReady` | La destinació coincideix amb aquesta instància i la consola està connectada. |
| `server.remoteRestartService` | Reinicia |
| `server.remoteSavedCredentialsHint` | S'utilitzen les credencials desades. Deixa-ho en blanc per conservar-les o escriu-ne unes altres per substituir-les. |
| `server.remoteService` | Servei systemd |
| `server.remoteServiceActive` | En execució |
| `server.remoteServerInstalled` | Fitxers del servidor instal·lats |
| `server.remoteServiceName` | Nom del servei |
| `server.remoteServiceNameHint` | Nom de la unitat systemd --user; p. ex., mc-server |
| `server.remoteSelectedFiles` | {count} fitxers del servidor seleccionats |
| `server.remoteSelectFiles` | Selecciona els fitxers |
| `server.remoteStartCommand` | Ordre d'inici |
| `server.remoteStartCommandHint` | P. ex., java -jar server.jar nogui |
| `server.remoteStartService` | Inicia |
| `server.remoteStatus` | Estat |
| `server.remoteSystemdRequired` | Els serveis d'usuari de systemd no estan disponibles a l'equip Linux remot. |
| `server.remoteTargetName` | Nom de la destinació |
| `server.remoteStopService` | Atura |
| `server.remoteStopWatchLog` | Atura el seguiment |
| `server.remoteTestConnection` | Prova la connexió |
| `server.remoteTestConnectionSuccess` | Connexió correcta. |
| `server.remoteUninstallConfirmMessage` | Aquesta acció desactiva i elimina la unitat systemd de l'equip remot. No modifica els fitxers del servidor. |
| `server.remoteUninstallService` | Desinstal·la el servei |
| `server.remoteRunInstall` | Instal·la o repara |
| `server.remoteWatchLog` | Segueix el registre en directe |
| `server.remoteWorldAlways` | Substitueix cada vegada que s'apliqui l'estat desitjat |
| `server.remoteWorldDeployment` | Desplegament del món de la instància |
| `server.remoteWorldDeploymentHint` | La sincronització habitual mai no puja dades del món tret que aquesta política ho permeti explícitament. |
| `server.remoteWorldFirstInstall` | Inicialitza només si la destinació no té cap món |
| `server.remoteWorldNever` | No pugis mai cap món |
| `server.remoteWorldPresent` | Món de destinació |
| `server.remoteWorld` | Món |
| `server.remoteWorldWillDeploy` | S'aplicarà l'estat desitjat i es pujarà el món seleccionat de la instància. |
| `server.serverName` | Nom del servidor |
| `server.serviceInstall` | Instal·la el servei |
| `server.serviceManagedLaunch` | Utilitza el servei del sistema per iniciar i aturar |
| `server.serviceManager` | Servei del sistema |
| `server.serviceName` | Nom del servei |
| `server.serviceNameHint` | Identificador estable amb lletres, números, punts, guions baixos o guions |
| `server.serviceNotInstalled` | No instal·lat |
| `server.serviceStartCommand` | Ordre d'inici |
| `server.serviceSystemd` | systemd --user |
| `server.serviceWindows` | Servei del Windows |
| `server.serviceWindowsCommandHint` | L'ordre de Java es genera a partir d'aquesta instància quan s'instal·la el servei. |
| `server.serversListTitle` | Llista de servidors |
| `server.target` | Destinació del servidor |
| `server.targetLocal` | localhost |
| `server.targetLocalHint` | Instal·la i executa el servidor en aquest ordinador. |
| `server.targetRemote` | Destinació SSH |
| `server.targetRemoteHint` | Connecta, instal·la, inicia i supervisa un servidor mitjançant SSH. |
| `server.unbindUpstream` | Desvincula |
| `server.unpin` | Desfixa |
| `server.upstreamUpToDate` | La instància coincideix amb el servidor ({version}). |
| `server.upstreamUpToDateHint` | No cal actualitzar. Fes clic per tornar a consultar el servidor. |
| `server.upstreamUpdateAvailable` | El servidor utilitza ara Minecraft {version}. Fes clic per aplicar-la. |
| `server.upstreamUpdateHint` | Aplica la versió suggerida de Minecraft a aquesta instància. |
| `server.useAsUpstreamHint` | La instància seguirà la versió de Minecraft que indiqui el servidor. |
| `server.worldPreserve` | Conserva el món de destinació |
| `setting.multiplayerTransport` | Transport de Together |
| `setting.multiplayerTransportDescription` | Tria la implementació de WebRTC que utilitza Together. Canviar el transport desconnecta els participants actius. |
| `setting.about` | Quant a |
| `setting.aboutBmclDescription` | BMCL API facilita les descàrregues als usuaris de la Xina continental |
| `setting.aboutContributors` | 🧑‍💻 Col·laboradors 🧑‍💻 |
| `setting.aboutDenoDescription` | PbtModLauncherX utilitza Deno Deploy, una plataforma senzilla per a aplicacions JavaScript sense servidor |
| `setting.aboutLicense` | LLICÈNCIA MIT |
| `setting.aboutLicenseInfo` | SignPath.io proporciona la signatura gratuïta del codi per al Windows, amb un certificat de SignPath Foundation |
| `setting.aboutSponsors` | 😇 Patrocinadors 😇 |
| `setting.advancedJavaOptions` | Opcions avançades de Java |
| `setting.advancedSettings` | Configuració avançada |
| `setting.advancedSettingsHint` | Zona de risc: restableix o gestiona les dades del llançador |
| `setting.aiAgentApiKey` | Clau d'API de l'agent d'IA |
| `setting.aiAgentApiKeyClear` | Esborra la clau |
| `setting.aiAgentApiKeyDescription` | Introdueix la clau del servei configurat compatible amb OpenAI. Les claus es desen localment per a cada servidor. |
| `setting.aiAgentApiKeyEmpty` | Enganxa la clau d'API |
| `setting.aiAgentApiKeyNotNeeded` | No necessària |
| `setting.aiAgentApiKeyNotNeededHint` | Aquest proveïdor s'executa localment i no necessita cap clau d'API |
| `setting.aiAgentApiKeySaved` | Desada |
| `setting.aiAgentApiKeyStored` | Clau desada; escriu-ne una altra per substituir-la |
| `setting.aiAgentApiKeyPlaceholder` | Clau d'API del proveïdor OpenAI o Claude |
| `setting.aiAgentBuiltin` | Integrat |
| `setting.aiAgentCustom` | Personalitzat |
| `setting.aiAgentEndpoint` | Punt d'accés de l'agent d'IA |
| `setting.aiAgentEndpointDescription` | URL del punt d'accés per completar converses. |
| `setting.aiAgentEndpointPlaceholder` | https://api.openai.com/v1/chat/completions |
| `setting.aiAgentModelPlaceholder` | gpt-5.6 o claude-sonnet-4-5 |
| `setting.aiAgentModel` | Model de l'agent d'IA |
| `setting.aiAgentModelDescription` | Nom del model que s'envia a les peticions de conversa. |
| `setting.apiSets.auto` | Automàtic (segons la xarxa) |
| `setting.apiSets.official` | Oficial (Mojang) |
| `setting.appearance` | Aparença |
| `setting.appearanceDescription` | Personalitza l'aparença del llançador |
| `setting.appxUpdateHint` | El llançador descarregarà i executarà l'instal·lador. Si no s'obre, executa'l manualment. |
| `setting.authenticationSettings` | Autenticació |
| `setting.backdropBlur` | Desenfocament del fons |
| `setting.backgroundColorAbove` | Mostra el color de fons com a capa superior |
| `setting.backgroundColorAboveDescription` | El color de fons es mostrarà per sobre de la imatge o el vídeo. |
| `setting.backgroundImage` | Imatge de fons |
| `setting.backgroundImageClear` | esborra |
| `setting.backgroundImageDescription` | Selecciona una imatge de fons o elimina-la |
| `setting.useDesktopBackground` | Utilitza el fons d'escriptori actual |
| `setting.backgroundImageFit.contain` | Enquadra |
| `setting.backgroundImageFit.cover` | Cobreix |
| `setting.backgroundImageFit.name` | Ajust de la imatge |
| `setting.backgroundImageUrl` | URL de la imatge |
| `setting.backgroundImageUrlPlaceholder` | Introdueix un URL HTTP/HTTPS per a la imatge |
| `setting.backgroundMusic` | Música de fons del tema |
| `setting.backgroundMusicUrl` | URL de la música |
| `setting.backgroundMusicUrlPlaceholder` | Introdueix un URL HTTP/HTTPS per a la música |
| `setting.backgroundType` | Tipus de fons |
| `setting.backgroundTypeDescription` | Mostra un efecte especial al fons (pot afectar el rendiment) |
| `setting.backgroundTypes.halo` | Halo |
| `setting.backgroundTypes.image` | Imatge |
| `setting.backgroundTypes.none` | Cap |
| `setting.backgroundTypes.particle` | Partícules |
| `setting.backgroundTypes.video` | Vídeo |
| `setting.backgroundVideo` | Vídeo de fons |
| `setting.backgroundVideoDescription` | Selecciona un vídeo o elimina'l |
| `setting.backgroundVideoUrl` | URL del vídeo |
| `setting.backgroundVideoUrlPlaceholder` | Introdueix un URL HTTP/HTTPS per al vídeo |
| `setting.backgroundVideoVolume` | Volum |
| `setting.backgroundVideoVolumeDescription` | Arrossega per ajustar el volum |
| `setting.browseRoot` | Explora |
| `setting.checkUpdate` | Cerca actualitzacions |
| `setting.colorTheme.appBarColor` | Barra de l'aplicació |
| `setting.colorTheme.backgroundColor` | Color de fons |
| `setting.colorTheme.cardColor` | Color de les targetes |
| `setting.colorTheme.description` | Canvia els colors del tema |
| `setting.colorTheme.errorColor` | Color d'error |
| `setting.colorTheme.name` | Colors i desenfocament del tema |
| `setting.colorTheme.primaryColor` | Color principal |
| `setting.colorTheme.sideBarColor` | Barra lateral |
| `setting.colorTheme.warningColor` | Color d'avís |
| `setting.colorTheme.secondaryColor` | Color secundari |
| `setting.customCss.advancedDescription` | Substitueix l'estil actual del llançador amb el teu CSS. |
| `setting.customCss.assistantHint` | Descriu l'aparença que vols i escriuré el CSS per a tu. |
| `setting.customCss.assistantSuggestion1` | Fes que la barra lateral sigui translúcida |
| `setting.customCss.assistantSuggestion2` | Afegeix un degradat subtil al fons de les targetes |
| `setting.customCss.assistantTitle` | Assistent de CSS |
| `setting.customCss.dropHint` | Arrossega un fitxer .css per carregar-lo |
| `setting.customCss.editorPlaceholder` | /* Escriu aquí el teu CSS personalitzat */ |
| `setting.customCss.globalToggle` | Activa o desactiva el CSS personalitzat |
| `setting.customCss.openInDialog` | Obre al diàleg de l'agent |
| `setting.customCss.title` | CSS personalitzat |
| `setting.customCss.warning` | El CSS personalitzat permet modificar qualsevol aspecte del llançador. Ves amb compte amb el CSS d'orígens no fiables, ja que pot alterar la distribució de la interfície. |
| `setting.darkTheme` | Tema |
| `setting.darkThemeDescription` | Tria el tema clar o el fosc |
| `setting.devModeLabel` | DEV |
| `setting.developerMode` | Mode de desenvolupador |
| `setting.developerModeDescription` | El mode de desenvolupador permet provar els teus mods |
| `setting.disableTelemetry` | Desactiva la telemetria |
| `setting.disableTelemetryDescription` | PbtModLauncherX recull els esdeveniments d'inici del joc i d'inici de sessió. |
| `setting.enableDedicatedGPUOptimization` | Assigna la GPU dedicada |
| `setting.enableDedicatedGPUOptimizationDescription` | Aquesta opció assigna la GPU dedicada al procés de Minecraft. |
| `setting.enableDiscord` | Activa la presència a Discord |
| `setting.enableDiscordDescription` | Actualitza l'estat de Discord amb l'activitat del llançador |
| `setting.enterUrl` | Introdueix l'URL |
| `setting.exportSettings` | Exporta la configuració |
| `setting.exportSettingsHint` | Desa la configuració actual en un fitxer |
| `setting.githubRelease` | Versió de GitHub |
| `setting.globalJava` | Java preferit |
| `setting.globalJavaHint` | En mode automàtic es prova primer aquest Java. Només s'utilitza la detecció automàtica si no és compatible amb la versió del joc. |
| `setting.globalSetting` | Joc |
| `setting.globalSettingHint` | Les instàncies utilitzaran aquesta configuració per defecte. |
| `setting.importSettings` | Importa la configuració |
| `setting.importSettingsHint` | Carrega la configuració d'un fitxer exportat prèviament |
| `setting.instanceTheme.activeDescription` | Aquesta instància utilitza un tema personalitzat. El pots eliminar per utilitzar el tema global. |
| `setting.instanceTheme.description` | Activa un tema personalitzat per a aquesta instància. Es crearà una còpia del tema global actual. |
| `setting.instanceTheme.name` | Tema de la instància |
| `setting.language` | Idioma |
| `setting.languageDescription` | Idioma de la interfície |
| `setting.latestVersion` | Darrera versió |
| `setting.layout.default` | Distribució per defecte |
| `setting.layout.focus` | Distribució centrada |
| `setting.layoutDescription` | Distribució de la interfície del llançador |
| `setting.layoutTitle` | Distribució |
| `setting.linuxEnableDedicatedGPUOptimization` | Assigna un processador gràfic dedicat |
| `setting.linuxEnableDedicatedGPUOptimizationDescription` | Aquesta opció assigna una GPU dedicada al procés de Minecraft. |
| `setting.linuxTitlebar` | Barra de títol nativa |
| `setting.linuxTitlebarDescription` | Utilitza la barra de títol nativa de Linux per al llançador |
| `setting.livePreview` | Previsualització en directe |
| `setting.location` | Ubicació de les dades |
| `setting.manualUpdateHint` | Aquesta versió no es pot actualitzar automàticament. Torna a descarregar el llançador des del lloc web oficial. |
| `setting.maunalUpdateHint` | Aquesta versió no es pot actualitzar automàticament. Torna a descarregar el llançador des del lloc web. |
| `setting.maxSockets` | Per servidor |
| `setting.maxSocketsDescription` | Limita el nombre màxim de sòcols per servidor o en total. El valor 0 indica que no hi ha límit. |
| `setting.maxSocketsTitle` | Nombre màxim de sòcols HTTP |
| `setting.memoryAssignment` | Assignació de memòria |
| `setting.migrateFromOther` | Importa d'un altre llançador |
| `setting.minecraftOptions` | Opcions de Minecraft |
| `setting.name` | Configuració global \| Configuracions globals |
| `setting.network` | Xarxa |
| `setting.newsPosition` | Mou la secció de notícies |
| `setting.officialWebsite` | Lloc web oficial |
| `setting.particleMode.bubble` | Bombolla |
| `setting.particleMode.name` | Mode de partícules |
| `setting.particleMode.push` | Afegeix |
| `setting.particleMode.remove` | Elimina |
| `setting.particleMode.repulse` | Repel·leix |
| `setting.particleModeDescription` | Selecciona què fan les partícules en fer-hi clic |
| `setting.quickLaunchSettings` | Inici ràpid |
| `setting.replaceNative` | Substitueix les biblioteques natives |
| `setting.replaceNativeDescription` | Substitueix les biblioteques natives segons l'arquitectura de l'ordinador. |
| `setting.replaceNatives.all` | Totes |
| `setting.replaceNatives.legacy` | Només versions antigues |
| `setting.resetAllSettings` | Restableix tota la configuració |
| `setting.resetAllSettingsConfirmMessage` | S'eliminaran permanentment la configuració, els comptes, les instàncies, els grups i les dades de memòria cau. Aquesta acció no es pot desfer. N'estàs segur? |
| `setting.resetAllSettingsConfirmTitle` | Vols restablir tota la configuració? |
| `setting.resetAllSettingsHint` | Restableix el llançador als valors de fàbrica (s'elimina tot) |
| `setting.resetAllSettingsSuccess` | S'ha restablert tota la configuració. El llançador es reiniciarà. |
| `setting.resetSettingsError` | Error en restablir la configuració: {error} |
| `setting.resetToDefault` | Restableix els valors per defecte |
| `setting.select` | Selecciona |
| `setting.setAsBackground.failed` | No s'ha pogut establir la imatge de fons |
| `setting.setAsBackground.global` | Estableix com a fons del llançador |
| `setting.setAsBackground.instance` | Estableix com a fons de la instància |
| `setting.setAsBackground.successGlobal` | S'ha actualitzat la imatge de fons. |
| `setting.setAsBackground.successInstance` | S'ha actualitzat la imatge de fons de la instància. |
| `setting.settingsExported` | S'ha exportat la configuració correctament |
| `setting.settingsImportError` | No s'ha pogut importar la configuració. Comprova el format del fitxer. |
| `setting.settingsImported` | S'ha importat la configuració correctament |
| `setting.settingsReloadHint` | El llançador es reiniciarà per aplicar tota la configuració. |
| `setting.showNewsHeader` | Mostra la secció de notícies |
| `setting.showRoot` | Mostra |
| `setting.sidebarAlign` | Alineació de la barra lateral |
| `setting.sidebarAutoHide` | Amaga automàticament la barra lateral |
| `setting.sidebarAutoHideHint` | Amaga la barra lateral i mostra-la en passar-hi el cursor |
| `setting.sidebarClassic` | Clàssica |
| `setting.sidebarNotch` | Amb osca |
| `setting.sidebarPosition` | Posició de la barra lateral |
| `setting.sidebarScale` | Escala de la barra lateral |
| `setting.sidebarShowOnlyPinned` | Mostra només les instàncies fixades |
| `setting.sidebarShowOnlyPinnedHint` | Mostra només les instàncies fixades a la barra lateral |
| `setting.sidebarStyle` | Estil de la barra lateral |
| `setting.sidebarStyleHint` | Tria el disseny clàssic o el modern amb osca |
| `setting.streamerMode` | Mode de retransmissió |
| `setting.streamerModeDescription` | Amaga informació privada del llançador, com ara l'adreça electrònica. |
| `setting.theme.dark` | Tema fosc |
| `setting.theme.light` | Tema clar |
| `setting.theme.system` | Utilitza el tema del sistema |
| `setting.themeExport` | Exporta el tema |
| `setting.themeBorderRadius` | Cantonades arrodonides |
| `setting.themeBorderRadiusDescription` | Activa o desactiva les cantonades arrodonides de targetes, diàlegs, menús i plafons. |
| `setting.themeFont` | Tipus de lletra |
| `setting.themeFontDescription` | Canvia el tipus de lletra del llançador. |
| `setting.themeFontUrl` | URL del tipus de lletra |
| `setting.themeFontUrlPlaceholder` | Introdueix un URL HTTP/HTTPS per al tipus de lletra |
| `setting.themeImport` | Importa el tema |
| `setting.themeResetFont` | Restableix el tipus de lletra |
| `setting.themeSelectFont` | Selecciona un tipus de lletra |
| `setting.themeSettings` | Configuració del tema |
| `setting.themeShare` | Comparteix el tema |
| `setting.themeShareDescription` | Pots compartir el tema amb els teus amics. |
| `setting.themeStore.description` | Desa i gestiona els temes globals |
| `setting.themeStore.loadConfirmMessage` | Carregar un tema desat substituirà el tema actual. Fes-ne una còpia de seguretat si cal. |
| `setting.themeStore.loadConfirmTitle` | Vols substituir el tema actual? |
| `setting.themeStore.loadTheme` | Carrega el tema |
| `setting.themeStore.name` | Biblioteca de temes |
| `setting.themeStore.noSavedThemes` | Encara no hi ha temes desats |
| `setting.themeStore.saveDialogTitle` | Desa el tema |
| `setting.themeStore.saveToStore` | Desa a la biblioteca |
| `setting.themeStore.savedThemes` | Temes desats |
| `setting.themeStore.themeName` | Nom del tema |
| `setting.themeStore.themeNameHint` | Nom amb què es desarà aquest tema |
| `setting.update` | Actualitza |
| `setting.useBmclAPI` | Utilitza BMCL API |
| `setting.useBmclAPIDescription` | Utilitza BMCLAPI per descarregar Minecraft a la Xina continental. No t'afecta si ets fora d'aquesta regió. |
| `setting.useProxy` | Servidor intermediari HTTP |
| `setting.useProxyDescription` | Adreça del servidor intermediari per a les peticions HTTP |
| `setting.viewBackgroundMusic` | Mostra la música |
| `setting.allowPrerelease` | Descarrega versions preliminars |
| `setting.allowPrereleaseDescription` | Les versions preliminars poden ser inestables |
| `setting.autoDownload` | Descàrrega automàtica |
| `setting.autoDownloadDescription` | Descarrega les actualitzacions automàticament quan estiguin disponibles |
| `setting.autoInstallOnAppQuit` | Instal·lació automàtica |
| `setting.autoInstallOnAppQuitDescription` | Instal·la l'actualització automàticament en tancar l'aplicació |
| `setting.backgroundImageBlur` | Desenfocament de la imatge |
| `setting.backgroundImageBlurDescription` | Arrossega per ajustar el desenfocament |
| `setting.backgroundImageSelect` | Selecciona |
| `setting.backgroundVideoSelect` | Selecciona |
| `setting.blurAppBar` | Desenfoca la barra de l'aplicació |
| `setting.blurMainBody` | Desenfoca el plafó principal |
| `setting.blurMainBodyDescription` | Desenfoca el plafó dret del llançador |
| `setting.blurSidebar` | Desenfoca la barra lateral |
| `setting.hideNewsHeader` | Amaga la secció de notícies |
| `setup.dataRoot.drives` | Ubicacions recomanades |
| `setup.error.invalidChar` | La ruta conté caràcters no vàlids que poden impedir que Minecraft s'iniciï. Utilitza només caràcters i símbols anglesos. |
| `setup.account.description` | Inicia la sessió amb el compte de joc. Si no en tens cap, pots ometre aquest pas. |
| `setup.account.name` | Afegeix un compte de joc |
| `setup.account.skip` | Omet per ara |
| `shaderPack.market` | Catàleg de shaders |
| `shaderPack.linkShared` | Comparteix paquets de shaders entre instàncies |
| `shaderPack.linkSharedHint` | Enllaça la carpeta shaderpacks d'aquesta instància amb la carpeta compartida global perquè totes les instàncies vegin els mateixos paquets. Els paquets existents es fusionaran a la carpeta compartida. |
| `shaderPack.noLocalPacksFound` | No s'ha trobat cap paquet de shaders local que coincideixi amb la cerca. |
| `shaderPack.noPacks` | No hi ha paquets de shaders instal·lats |
| `shaderPack.noPacksInstalled` | No tens cap paquet de shaders instal·lat. |
| `shaderPack.search` | Cerca paquets de shaders… |
| `shared.pressKeyCombination` | Prem una combinació de tecles… |
| `shared.add` | Afegeix |
| `shared.author` | Autor |
| `shared.back` | Enrere |
| `shared.browse` | Explora |
| `shared.cancel` | Cancel·la |
| `shared.checkUpgrade` | Cerca actualitzacions |
| `shared.client` | Client |
| `shared.copied` | Copiat |
| `shared.copy` | Copia |
| `shared.close` | Tanca |
| `shared.copyFailed` | No s'ha pogut copiar |
| `shared.copyFailedHint` | No s'ha pogut copiar al porta-retalls |
| `shared.description` | Descripció |
| `shared.disable` | Desactiva |
| `shared.download` | Descarrega |
| `shared.edit` | Edita |
| `shared.enable` | Activa |
| `shared.failed` | Ha fallat |
| `shared.filter` | Filtra |
| `shared.install` | Instal·la |
| `shared.installed` | Instal·lat |
| `shared.manage` | Gestiona |
| `shared.name` | Nom |
| `shared.next` | Següent |
| `shared.no` | No |
| `shared.ok` | D'acord |
| `shared.previous` | Anterior |
| `shared.refresh` | Actualitza |
| `shared.remove` | Elimina |
| `shared.save` | Desa |
| `shared.search` | Cerca |
| `shared.server` | Servidor |
| `shared.upgrade` | Actualitza |
| `shared.yes` | Sí |
| `shared.delete` | Elimina |
| `sortBy.name` | Ordena per |
| `store.discover` | Descobreix |
| `store.empty` | No s'ha trobat cap modpack |
| `store.emptyHint` | Prova de canviar els filtres o la cerca. |
| `store.popularity` | Popularitat / seguidors |
| `store.searchHint` | Cerca mods, modpacks, paquets de recursos… |
| `store.searchResult` | Resultat de la cerca |
| `store.trending` | Tendències |
| `task.running` | En execució… |
| `task.succeed` | Completat |
| `task.eta` | Queden ~{time} |
| `task.remaining` | Queden {size} |
| `task.totalRemaining` | {size} pendents |
| `task.op.update` | Actualitza |
| `task.op.export` | Exporta |
| `task.op.duplicate` | Duplica |
| `theme.title` | PbtModLauncherX |
| `turnRegion.guangzhou` | Guangzhou, Xina |
| `turnRegion.hk` | Hong Kong |
| `turnRegion.liaoning` | Liaoning, Xina |
| `tutorial.blueprint.detailDescription` | Inspecciona el contingut del plànol i els mods que inclou, i crea'n instàncies noves. |
| `tutorial.blueprint.detailTitle` | Detalls del plànol |
| `tutorial.blueprint.listDescription` | Consulta i gestiona tots els plànols i les plantilles d'instàncies desats. |
| `tutorial.blueprint.listTitle` | Llista de plànols |
| `tutorial.blueprint.searchDescription` | Cerca plànols locals i de la comunitat per nom o etiqueta. |
| `tutorial.blueprint.searchTitle` | Cerca plànols |
| `tutorial.done` | Entesos! |
| `tutorial.helpDescription` | Guia interactiva del llançador i de la pàgina actual. |
| `tutorial.me.instancesDescription` | Consulta les instàncies instal·lades, agrupa-les per carpeta o data, filtra-les i inicia-les. |
| `tutorial.me.instancesTitle` | Gestió d'instàncies |
| `tutorial.me.profileDescription` | Canvia de compte i gestiona les credencials d'inici de sessió. |
| `tutorial.me.profileTitle` | Compte i perfil |
| `tutorial.me.skinDescription` | Previsualitza el personatge en 3D, canvia'n l'aparença i equipa-hi capes. |
| `tutorial.me.skinTitle` | Personalització d'aparences i capes |
| `tutorial.multiplayer.contentDescription` | Aquí es mostraran les connexions amb els altres jugadors. |
| `tutorial.multiplayer.contentTitle` | @:multiplayer.connections |
| `tutorial.multiplayer.groupDescription` | Pots crear un grup o unir-te a un grup d'altres jugadors. El llançador intentarà establir connexions P2P entre els membres. Introdueix el nom que t'han donat els teus amics o crea'n un d'únic. |
| `tutorial.multiplayer.groupTitle` | Uneix-te a un grup |
| `tutorial.multiplayer.joinDescription` | Després d'introduir el nom del grup, prem aquest botó per unir-t'hi o crear-lo. Si el deixes en blanc, el llançador generarà un nom. |
| `tutorial.multiplayer.manualDescription` | Si tu o el teu amic no us podeu connectar al grup, proveu d'intercanviar els testimonis amb «Connecta manualment». Si tampoc funciona, pot ser un problema de connexió a Internet. |
| `tutorial.multiplayer.railDescription` | Comprova el tipus de NAT i l'estat de la xarxa, i accedeix a les connexions, la configuració i la facturació. |
| `tutorial.multiplayer.railTitle` | Xarxa i navegació |
| `tutorial.resourcepack.detailDescription` | Consulta les captures, la descripció, les versions compatibles de Minecraft i els detalls dels fitxers. |
| `tutorial.resourcepack.detailTitle` | Detalls del paquet de recursos |
| `tutorial.resourcepack.listDescription` | Explora els paquets de recursos instal·lats, activa'ls o desactiva'ls i ordena'n la prioritat. |
| `tutorial.resourcepack.listTitle` | Llista de paquets de recursos |
| `tutorial.resourcepack.searchDescription` | Cerca paquets de recursos a Modrinth, CurseForge o als fitxers locals. |
| `tutorial.resourcepack.searchTitle` | Cerca paquets de recursos |
| `tutorial.save.detailDescription` | Fes còpies de seguretat, exporta, inspecciona level.dat o gestiona la configuració del món. |
| `tutorial.save.detailTitle` | Detalls i accions del món |
| `tutorial.save.listDescription` | Consulta els mons desats amb el mode de joc, la darrera partida i la mida del fitxer. |
| `tutorial.save.listTitle` | Llista de mons |
| `tutorial.save.searchDescription` | Filtra i cerca els mons de la instància actual per nom. |
| `tutorial.save.searchTitle` | Cerca partides i mons |
| `tutorial.settings.appearanceDescription` | Personalitza el tema, els fons, els colors de ressaltat i l'estil de distribució. |
| `tutorial.settings.generalDescription` | Configura l'idioma del llançador, la carpeta de dades, els canals d'actualització i les opcions d'inici. |
| `tutorial.settings.globalDescription` | Configura el Java per defecte, l'assignació de memòria i els arguments d'inici de la JVM. |
| `tutorial.settings.navDescription` | Canvia entre General, Aparença, Configuració global del joc i Xarxa. |
| `tutorial.settings.networkDescription` | Configura els servidors de descàrrega alternatius, el servidor intermediari i els límits de tasques simultànies. |
| `tutorial.shaderpack.detailDescription` | Consulta l'autor, els requisits de resolució, els perfils predefinits i les opcions dels shaders. |
| `tutorial.shaderpack.detailTitle` | Detalls del paquet de shaders |
| `tutorial.shaderpack.listDescription` | Explora els shaders instal·lats i canvia entre ells ràpidament. |
| `tutorial.shaderpack.listTitle` | Llista de paquets de shaders |
| `tutorial.shaderpack.searchDescription` | Cerca paquets de shaders a Modrinth, CurseForge o a la memòria cau local. |
| `tutorial.shaderpack.searchTitle` | Cerca paquets de shaders |
| `tutorial.tooltip` | Ajuda i guia interactiva |
| `tutorial.feedbackDescription` | Si tens algun problema, prem aquest botó per enviar comentaris. |
| `tutorial.instance.appearanceThemeDescription` | Personalitza el fons, els colors i l'estil visual d'aquesta instància. |
| `tutorial.instance.appearanceThemeTitle` | Aparença de la instància |
| `tutorial.instance.iconDescription` | Fes clic per canviar la icona. |
| `tutorial.instance.iconTitle` | Icona de la instància |
| `tutorial.instance.javaDescription` | Tria o canvia la versió de Java. |
| `tutorial.instance.javaImportDescription` | Importa Java des de l'emmagatzematge local. |
| `tutorial.instance.javaImportTitle` | Importa Java |
| `tutorial.instance.javaTitle` | Llista de Java |
| `tutorial.instance.modpackExportDescription` | Genera i empaqueta la instància configurada en un modpack a punt per compartir. |
| `tutorial.instance.modpackExportTitle` | Exporta el modpack |
| `tutorial.instance.modpackFilesDescription` | Selecciona els fitxers de configuració, els mods i els recursos que s'inclouran al modpack exportat per al client i el servidor. |
| `tutorial.instance.modpackFilesTitle` | Fitxers inclosos |
| `tutorial.instance.modpackMetaDescription` | Especifica la versió, l'autor, la descripció i el lloc web del modpack. |
| `tutorial.instance.modpackMetaTitle` | Detalls del modpack |
| `tutorial.instance.modpackOptionsDescription` | Tria la carpeta de destinació i els formats d'exportació, com ara els modpacks de Modrinth o CurseForge. |
| `tutorial.instance.modpackOptionsTitle` | Opcions d'exportació |
| `tutorial.instance.serverLaunchDescription` | Inicia o atura el servidor dedicat d'aquesta instància des de la capçalera. |
| `tutorial.instance.serverLaunchTitle` | Inicia o atura el servidor |
| `tutorial.instance.serverPropertiesDescription` | Configura les propietats del servidor: port, dificultat, MOTD, límit de jugadors i regles del joc. |
| `tutorial.instance.serverPropertiesTitle` | Configuració del servidor |
| `tutorial.instance.serverServiceDescription` | Gestiona el servidor com a servei en segon pla del sistema (systemd o servei del Windows) perquè es mantingui actiu automàticament. |
| `tutorial.instance.serverServiceTitle` | Servei del sistema |
| `tutorial.instance.serverTargetDescription` | Tria entre executar el servidor al teu ordinador o gestionar un servidor Linux remot mitjançant SSH. |
| `tutorial.instance.serverTargetTitle` | Destinació del servidor |
| `tutorial.instance.versionDescription` | Selecciona la versió de Minecraft i els carregadors Forge, Fabric, Quilt o NeoForge. |
| `tutorial.instance.versionTitle` | Versió de Minecraft i del carregador |
| `tutorial.instanceAddDescription` | Prem aquest botó per importar una instància existent de Minecraft o crear-ne una de nova des de zero o a partir d'un modpack. |
| `tutorial.launchDescription` | Prem aquest botó per instal·lar o iniciar el joc. |
| `tutorial.mod.defaultSourceDescription` | Tria l'origen dels detalls dels mods. Alguns es publiquen tant a Modrinth com a CurseForge. Canvia aquesta opció per alternar entre els dos proveïdors. |
| `tutorial.mod.defaultSourceTitle` | Selecciona l'origen del contingut dels mods |
| `tutorial.mod.detailDescription` | Selecciona un element de l'esquerra per veure els detalls del mod. El contingut pot provenir de Modrinth, CurseForge o de l'anàlisi del mod. |
| `tutorial.mod.detailTitle` | Detalls del mod |
| `tutorial.mod.listDescription` | Sense cap cerca es mostren els mods instal·lats. Quan introdueixis una paraula clau o seleccionis una categoria, es mostraran els resultats de la cerca. |
| `tutorial.mod.listTitle` | Mods instal·lats o resultats de cerca |
| `tutorial.mod.searchDescription` | Utilitza aquest camp per cercar mods a Modrinth, CurseForge o a la memòria cau local. |
| `tutorial.mod.searchTitle` | Cerca mods |
| `tutorial.userAccountDescription` | Prem aquesta icona per afegir o gestionar el compte de Minecraft. |
| `update.goOfficialWebDownload` | Torna a descarregar des del lloc web oficial |
| `userService.add` | Afegeix més serveis |
| `userService.authlibInjectorMetadata` | Metadades d'authlib-injector |
| `userService.baseUrlHint` | URL base del teu servei personalitzat |
| `userService.homepage` | Pàgina principal |
| `userService.implementation` | Implementació |
| `userService.manageServices` | Gestiona els serveis d'autenticació |
| `userService.register` | Registra't |
| `userService.server` | Servidor |
| `userService.skinDomains` | Dominis d'aparences |
| `userService.version` | Versió |
| `userService.authLibInjector` | Segueix el suggeriment d'authlib-injector |
| `userService.validateHint` | S'utilitza per comprovar si el testimoni de l'usuari encara és vàlid |
| `userServices.microsoft.account` | Compte de Microsoft |
| `userServices.microsoft.deviceCode` | Codi de dispositiu |
| `userServices.microsoft.deviceCodeHint` | El codi de dispositiu es generarà quan premis Inicia la sessió |
| `userServices.microsoft.password` | Introdueix la contrasenya al navegador |
| `userServices.microsoft.useDeviceCode` | Inicia la sessió amb un codi de dispositiu |
| `userServices.microsoft.fastLogin` | Inici de sessió ràpid |
| `userSkin.classic` | Clàssica |
| `userSkin.invalidImage` | Tria una imatge d'aparença de Minecraft vàlida. |
| `userSkin.invalidImageTitle` | Imatge d'aparença no vàlida |
| `userSkin.saveSuccess` | S'ha desat l'aparença al disc! |
| `userSkin.saveFailed` | No s'ha pogut desar l'aparença al disc |
| `userSkin.slim` | Prima |
| `userSkin.uploadFailed` | No s'ha pogut pujar l'aparença |
| `userSkin.uploadRejected` | Minecraft ha rebutjat l'aparença. Torna-ho a provar més tard. |
| `userSkin.libraryTitle` | Armari local |
| `userSkin.librarySubtitle` | Tria, gestiona i desa les aparences localment |
| `userSkin.manage` | Gestiona |
| `userSkin.all` | Totes |
| `userSkin.currentSkin` | Aparença actual |
| `userSkin.savedCount` | aparences desades |
| `userSkin.newSkin` | Aparença nova |
| `userSkin.addNewSkin` | Afegeix una aparença nova |
| `userSkin.editSkin` | Edita l'aparença |
| `userSkin.skinName` | Nom de l'aparença |
| `userSkin.skinNamePlaceholder` | P. ex., La meva aparença preferida |
| `userSkin.localFile` | Fitxer local |
| `userSkin.urlOrPlayer` | URL / nom del jugador |
| `userSkin.urlOrPlayerPlaceholder` | Introdueix l'URL de la imatge d'aparença o un nom d'usuari de Minecraft |
| `userSkin.urlOrPlayerHint` | Introdueix un URL directe a una imatge .png o el nom d'un jugador per obtenir-ne l'aparença de Mojang |
| `userSkin.dropFileHere` | Arrossega aquí un fitxer .PNG d'aparença o fes clic per seleccionar-lo |
| `userSkin.supportedFormats` | Format admès: imatge PNG de 64x64 o 64x32 |
| `userSkin.preview` | Previsualització de l'aparença |
| `userSkin.previewPlaceholder` | No hi ha cap previsualització disponible |
| `userSkin.saveToLibrary` | Desa a l'armari |
| `userSkin.saveAndEquip` | Desa i equipa |
| `userSkin.equip` | Equipa |
| `userSkin.equipToAccount` | Equipa al compte de Minecraft |
| `userSkin.equipped` | Equipada |
| `userSkin.noSkinSelected` | No s'ha seleccionat cap aparença |
| `userSkin.saveCurrent` | Desa l'actual |
| `userSkin.officialPreset` | Aparença oficial predefinida |
| `userSkin.mySkins` | Les meves aparences |
| `userSkin.presets` | Predefinides |
| `userSkin.noSkinsFound` | No s'ha trobat cap aparença |
| `userSkin.tryAddingOne` | Afegeix una aparença nova amb el botó de dalt. |
| `userSkin.skinUpdated` | S'ha actualitzat l'aparença! |
| `userSkin.skinDeleteFailed` | No s'ha pogut eliminar l'aparença de l'armari |
| `userSkin.edit` | Edita |
| `userSkin.fetch` | Carrega |
| `version.checkIntegrity` | Comprova la integritat |
| `agent.accessRequiredHint` | Subscriu-te a XMCL per utilitzar l'agent integrat o configura el teu proveïdor d'IA a la configuració. |
| `agent.abort` | Atura la generació |
| `agent.confirmAccept` | Continua |
| `agent.confirmAllowAll` | Permet-ho tot |
| `agent.confirmCancel` | Cancel·la |
| `agent.confirmPending` | S'espera la confirmació |
| `agent.confirmTitle` | Confirma l'acció de l'agent |
| `agent.errorTitle` | S'ha produït un error a l'agent |
| `agent.subscribeXmcl` | Subscriu-te a XMCL |
| `agent.passiveGameCrashed` | El joc ha fallat |
| `agent.passiveGameExitCode` | Codi de sortida {code} |
| `agent.passiveGameExited` | El joc s'ha tancat |
| `agent.passiveGameExitSignal` | Senyal {signal} |
| `agent.passiveGameExitSummary` | {duration} · {result} |
| `agent.passiveGameExitUnknown` | Estat de sortida desconegut |
| `agent.reasoning` | Raonament |
| `agent.passiveGameStarted` | El joc s'ha iniciat |
| `agent.passiveGameStartedSummary` | Minecraft {minecraft} · {version} · PID {pid} |
| `agent.passiveModDiagnosis` | Informe de compatibilitat dels mods |
| `agent.passiveModDiagnosisError` | El diagnòstic de compatibilitat ha fallat |
| `agent.passiveModDiagnosisSummary` | {checked} mods comprovats · {incompatibilities} incompatibilitats · {duplicates} duplicats |
| `agent.passiveModDuplicate` | Mod duplicat {mod}: {files} |
| `agent.passiveModInstalled` | versió instal·lada: {version} |
| `agent.toolArguments` | Arguments |
| `agent.toolResult` | Resultat |
| `agent.toolRunning` | S'espera el resultat… |
| `agent.marketConfirmMessage` | Vols instal·lar {name} a la instància actual? |
| `agent.marketConfirmTarget` | Destinació: {instance} |
| `agent.marketConfirmTitle` | Instal·la {type} |
| `agent.marketInstall` | Instal·la |
| `agent.marketInstalled` | Instal·lat |
| `agent.marketInstallFailed` | No s'ha pogut instal·lar {type} |
| `agent.marketType.datapack` | paquet de dades |
| `agent.marketType.mod` | mod |
| `agent.marketType.modpack` | modpack |
| `agent.marketType.resourcepack` | paquet de recursos |
| `agent.marketType.shader` | paquet de shaders |
| `agent.marketResultCount` | {count} resultats |
| `commandPalette.hintAskAgent` | pregunta a l'agent |
| `minecraftFriends.errors.friendsDisabled` | El compte de Minecraft té els amics desactivats o no pot utilitzar aquesta funció. Activa-la a la configuració del compte i torna-ho a provar. |
| `minecraftFriends.errors.invalidName` | Els noms d'usuari de Minecraft han de tenir entre 3 i 16 caràcters. |
| `bedrock.description` | Minecraft Bedrock Edition s'instal·la i s'inicia mitjançant Microsoft Store. Cal que el teu compte de Microsoft tingui una llicència de Bedrock. |
| `bedrock.install` | Obtén-lo a Microsoft Store |
| `bedrock.installFailed` | No s'ha pogut obrir Microsoft Store |
| `bedrock.installed` | Instal·lat: {version} |
| `bedrock.launchHint` | Prem el botó Juga per iniciar Bedrock Edition. |
| `bedrock.installBedrockVersion` | S'està descarregant Bedrock {version} |
| `bedrock.licenseRequired` | Inicia la sessió amb un compte de Microsoft que tingui Minecraft per instal·lar Bedrock Edition i jugar-hi. |
| `bedrock.refresh` | Actualitza |
| `bedrock.versionsTitle` | Gestor de versions |
| `bedrock.versionsHint` | Descarrega diverses versions de Bedrock dels servidors de Microsoft i canvia entre elles. Només es pot registrar una versió al Windows alhora; en iniciar-ne una, es torna a registrar. |
| `bedrock.versionsError` | No s'ha pogut carregar la llista de versions. Comprova la connexió i torna-ho a provar. |
| `bedrock.channel` | Canal |
| `bedrock.channelRelease` | Estable |
| `bedrock.channelBeta` | Beta |
| `bedrock.channelPreview` | Preview |
| `bedrock.active` | Activa |
| `bedrock.play` | Juga |
| `bedrock.download` | Descarrega |
| `bedrock.installedTag` | Instal·lat |
| `bedrock.developerModeRequired` | Per registrar una versió descarregada cal activar el mode de desenvolupador del Windows. Per activar-lo es demana permís d'administrador. |
| `bedrock.enableDeveloperMode` | Activa el mode de desenvolupador |
| `bedrock.enableDeveloperModeFailed` | No s'ha pogut activar el mode de desenvolupador |
| `bedrock.downloadFailed` | No s'ha pogut descarregar Bedrock {version} |
| `bedrock.launchFailed` | No s'ha pogut iniciar aquesta versió de Bedrock |
| `bedrock.removeFailed` | No s'ha pogut eliminar Bedrock {version} |
| `xmclAccount.accountSummary` | Compte |
| `xmclAccount.confirmMerge` | Confirma la fusió de comptes |
| `xmclAccount.createdAt` | Creat el {date} |
| `xmclAccount.description` | La teva identitat XMCL sense contrasenya, independent dels comptes de joc de Minecraft. |
| `xmclAccount.expiresAt` | Caduca el {date} |
| `xmclAccount.gameAccountsSeparate` | Eliminar un compte de joc no desenllaça cap mètode d'inici de sessió de XMCL. |
| `xmclAccount.guest` | Convidat |
| `xmclAccount.identityConflict` | Aquest inici de sessió de {provider} pertany a un altre XMCL Account. Els comptes mai no es fusionen automàticament. |
| `xmclAccount.linkAccountWith` | Enllaça el compte amb |
| `xmclAccount.mergePreview` | Revisa els recursos que es transferiran abans de confirmar. |
| `xmclAccount.mergeNeedsSession` | Inicia la sessió a l'XMCL Account que vols conservar abans de revisar la fusió. |
| `xmclAccount.mergeQueued` | La fusió de comptes està en curs. |
| `xmclAccount.requestFailed` | El servei XMCL Account no ha pogut completar la petició. El compte de joc no ha canviat. |
| `xmclAccount.reviewMerge` | Revisa la fusió |
| `xmclAccount.session` | Sessió |
| `xmclAccount.sessionActive` | Activa |
| `xmclAccount.sessionExpired` | Caducada |
| `xmclAccount.signOutAll` | Tanca la sessió a tots els dispositius |
| `xmclAccount.signOutDevice` | Tanca la sessió en aquest dispositiu |
| `xmclAccount.status.active` | Actiu |
| `xmclAccount.status.deleted` | Eliminat |
| `xmclAccount.status.deletion_pending` | Eliminació pendent |
| `xmclAccount.status.merged` | Fusionat |
| `xmclAccount.title` | XMCL Account |
| `modpackUpdateOrCreate.createNew` | Crea'n una de nova |
| `modpackUpdateOrCreate.description` | Ja hi ha una instància «{name}» per a aquest modpack. Vols actualitzar-la o crear-ne una de nova? |
| `modpackUpdateOrCreate.title` | La instància ja existeix |
| `modpackUpdateOrCreate.update` | Actualitza l'existent |
| `blueprint.name` | Plànol \| Plànols |
| `blueprint.count` | {count} plànols |
| `blueprint.searchLocal` | Cerca plànols… |
| `blueprint.searchOnline` | Cerca en línia… |
| `blueprint.market` | Catàleg |
| `blueprint.local` | Local |
| `blueprint.provider` | Proveïdor |
| `blueprint.import` | Importa |
| `blueprint.openFolder` | Obre la carpeta |
| `blueprint.refresh` | Actualitza |
| `blueprint.empty` | No s'ha trobat cap plànol. Importa un fitxer .litematic, .schem o .nbt, o explora el catàleg. |
| `blueprint.dropHint` | Arrossega aquí fitxers de plànols (.litematic, .schem o .nbt) per importar-los. |
| `blueprint.selectHint` | Selecciona un plànol per previsualitzar-lo. |
| `blueprint.blocks` | {count} blocs |
| `blueprint.materials` | Materials |
| `blueprint.allNamespaces` | Tots |
| `blueprint.findMod` | Cerca el mod d'aquest espai de noms |
| `blueprint.compatible` | Compatible |
| `blueprint.incompatible` | Falten mods |
| `blueprint.missingNamespaces` | Falten mods per a: {namespaces} |
| `blueprint.delete` | Elimina |
| `blueprint.cancel` | Cancel·la |
| `blueprint.install` | Instal·la |
| `blueprint.goTo` | Lloc web |
| `blueprint.byAuthor` | de {author} |
| `blueprint.noDescription` | No s'ha proporcionat cap descripció. |
| `blueprint.loadMore` | Carrega'n més |
| `blueprint.cmsBrowseOnly` | Aquest origen només permet explorar; obre el lloc web per descarregar. |
| `blueprint.mixedSources` | Els resultats combinen tots els orígens. Alguns només permeten explorar; obre'n el lloc web per descarregar. |
| `blueprint.formats.structure` | Estructura de Vanilla |
| `blueprint.preview.title` | Previsualització 3D |
| `blueprint.preview.loading` | S'està carregant la previsualització… |
| `blueprint.preview.empty` | Aquest plànol no conté blocs per mostrar. |
| `blueprint.preview.hint` | {count} blocs · {x}×{y}×{z} |
| `blueprint.preview.controls` | WASD: mou-te · Espai/Maj: puja/baixa · Arrossega: mira · Roda: amplia |
| `blueprint.convert.title` | Converteix el format |
| `blueprint.convert.hint` | Converteix aquest plànol a un altre format. Es crearà un fitxer nou. |
| `blueprint.convert.target` | Format de destinació |
| `blueprint.convert.action` | Converteix |
| `blueprint.replace.title` | Substitueix blocs |
| `blueprint.replace.simple` | Simple |
| `blueprint.replace.precise` | Precís |
| `blueprint.replace.simpleHint` | Compara només l'ID del bloc i conserva les propietats d'estat existents. |
| `blueprint.replace.preciseHint` | Compara l'estat complet del bloc (ID i propietats) i substitueix-lo completament. |
| `blueprint.replace.from` | Origen |
| `blueprint.replace.to` | Destinació |
| `blueprint.replace.addRule` | Afegeix una regla |
| `blueprint.replace.newFile` | Desa en un fitxer nou |
| `blueprint.replace.action` | Substitueix |
| `localCollection.title` | Col·leccions del llançador |
| `localCollection.newCollection` | Col·lecció nova |
| `localCollection.namePlaceholder` | Nom de la col·lecció |
| `localCollection.addToCollection` | Afegeix a una col·lecció |
| `localCollection.empty` | Encara no hi ha col·leccions al llançador |
| `localCollection.corrupted` | No s'han pogut llegir les col·leccions desades i s'han restablert. Se n'ha conservat una còpia de seguretat al costat del fitxer de dades. |
| `localCollection.modrinthSection` | Compte de Modrinth |
| `localCollection.installAll` | Instal·la-ho tot |
| `localCollection.incompatibleAlert` | S'ha omès 1 projecte perquè no és compatible amb la instància actual: \| S'han omès {count} projectes perquè no són compatibles amb la instància actual: |
| `localCollection.projects` | Cap projecte \| {count} projecte \| {count} projectes |
| `gamepad.detectedTitle` | S'ha detectat un comandament |
| `gamepad.connected` | Comandament connectat |
| `gamepad.guideTitle` | Controls del comandament |
| `gamepad.enableSwitchLabel` | Controls del comandament |
| `gamepad.enabledState` | Activats |
| `gamepad.disabledState` | Desactivats |
| `gamepad.toggle` | Activa o desactiva |
| `gamepad.disabledNotify` | S'han desactivat els controls del comandament. |
| `gamepad.enabledNotify` | S'han activat els controls del comandament! Utilitza la creueta o la palanca esquerra per navegar, {btnA} per seleccionar i {btnB} per tornar enrere. |
| `gamepad.guide.confirm` | Selecciona |
| `gamepad.guide.navigate` | Navega |
| `gamepad.guide.tabs` | Canvia de pestanya |
| `gamepad.guide.sections` | Canvia de secció |
| `gamepad.guide.launch` | Inicia el joc |
| `gamepad.guide.instanceSettings` | Configuració de la instància |
| `gamepad.modSuggestTitle` | Mod per a comandaments |
| `gamepad.modSuggestBody` | Per utilitzar el comandament a Minecraft es recomana un mod de compatibilitat. Vols instal·lar el mod adequat per al teu carregador? |
| `gamepad.modInstall` | Instal·la el mod |
| `gamepad.modSkip` | Omet |
| `gamepad.modDone` | Fet |
| `gamepad.modInstalled` | S'ha instal·lat el mod per a comandaments. Estarà actiu la pròxima vegada que iniciïs Minecraft. |
| `gamepad.modInstalledNotify` | S'ha instal·lat {name} per permetre l'ús del comandament al joc. |
| `gamepad.modNotFound` | No s'ha trobat cap versió compatible amb {loader} per a Minecraft {version}. |
| `gamepad.autoEnableLabel` | Activa els controls automàticament |
| `gamepad.autoEnableHint` | Activa la navegació amb comandament quan se'n detecti un. |
| `gamepad.autoOpenKeyboardLabel` | Obre automàticament el teclat de Steam |
| `gamepad.autoOpenKeyboardHint` | Obre el teclat en pantalla de Steam en seleccionar camps de text. |
| `gamepad.focusTooltipsLabel` | Mostra consells als elements seleccionats |
| `gamepad.focusTooltipsHint` | Mostra els consells emergents en navegar pels elements amb el comandament. |
| `gamepad.disableModPromptLabel` | Desactiva els suggeriments de mods per a comandaments |
| `gamepad.disableModPromptHint` | No proposis instal·lar mods per a comandaments en iniciar el joc amb un comandament. |
| `gamepad.settingSteamTitle` | Afegeix el llançador a Steam |
| `gamepad.steamAddedNotify` | S'ha afegit el llançador a la biblioteca de Steam. Reinicia Steam per veure'l. |
| `gamepad.steamAlreadyAddedNotify` | El llançador ja és a la biblioteca de Steam. |
| `gamepad.steamDeckTitle` | S'ha detectat una Steam Deck |
| `gamepad.steamDeckDesc` | S'ha detectat que utilitzes una Steam Deck. Vols afegir PbtModLauncherX a la biblioteca de Steam com a joc extern per integrar la interfície superposada i el comandament al mode de joc? |
| `gamepad.steamDeckAddBtn` | Afegeix a Steam ({btn}) |
| `gamepad.steamDeckCancelBtn` | Cancel·la ({btn}) |
| `accessibility.window` | Finestra |
| `accessibility.windowControls` | Controls de la finestra |
| `accessibility.minimize` | Minimitza |
| `accessibility.maximize` | Maximitza |
| `accessibility.sidebarNavigation` | Navegació de la barra lateral |
| `accessibility.instanceGroup` | Grup d'instàncies |
| `accessibility.selectedCount` | {count} seleccionats |
| `accessibility.moreCount` | +{count} més |

## Claves corregidas: ca global

| Clave | Valor actual |
|---|---|
| `HomeJavaIssueDialog.missingJavaHint` | El llançador no pot detectar cap Java al teu ordinador. Pots: |
| `HomeJavaIssueDialog.optionAutoDownload.message` | El llançador descarregarà i instal·larà Java des de la font de Mojang. |
| `curseforgeCategory.Addons` | Complements |
| `curseforgeCategory.Quests` | Missions |
| `dataMigration.migrationNoPermission` | No hi ha permís per canviar el nom del directori antic al nou!<br>Assegura't que el llançador tingui accés a ambdós llocs! |
| `dataMigration.setRootCause` | Perdràs les teves dades (Mapes, Paquets de Recursos, Mods) si tanques el Llançador durant aquest procés! |
| `dataMigration.setRootDescription` | Això canviarà la carpeta de dades arrel d'aquest llançador i Minecraft. |
| `dataMigration.waitReload` | Migrant dades. Si us plau, no tanquis el Llançador o perdràs les teves dades. |
| `diagnosis.corruptedAssets.message` | El llançador instal·larà els assets per tu |
| `diagnosis.corruptedAssetsIndex.message` | El llançador descarregarà l'índex d'assets per tu |
| `diagnosis.corruptedLibraries.message` | El llançador instal·larà les biblioteques per tu |
| `diagnosis.incompatibleJava.message` | Demana al llançador que ho descarregui per tu. |
| `diagnosis.missingAssets.message` | El llançador instal·larà els assets per tu |
| `diagnosis.missingAssetsIndex.message` | El llançador descarregarà l'índex d'assets per tu |
| `errors.DatabaseNotOpened` | La base de dades no està oberta!<br>El llançador no funcionarà correctament!<br>Selecciona un directori de dades al qual pugui accedir el llançador.<br>Pots intentar restablir l'arrel de dades a la pàgina de configuració. |
| `eula.DatabaseNotOpened` | Base de dades no oberta! El llançador no funcionarà correctament! Si us plau, estableix un directori de dades. Pots intentar restablir les dades principals a la pàgina d'ajustes. |
| `eula.DownloadFileSystemError` | Error en accedir al directori de descàrrega. Si us plau, assegura't que el llançador té permís d'escriptura. |
| `exception.http` | La petició HTTP a {url} ha fallat. Codi d'estat: {statusCode}. {code}. Torna-ho a provar o comprova la xarxa. Si el problema persisteix, envia un informe a l'equip de desenvolupament. |
| `feedback.githubOpenIssue` | GitHub |
| `instances.addVanillaDescription` | Importa des de la teva instància .minecraft; això duplicarà el teu joc original en aquest llançador. |
| `instances.importFolderDescription` | Importa Minecraft al Llançador |
| `launchBlocked.launchJavaNoPermission.description` | El llançador no té permís per executar Java <span class="highlight"> {javaPath} </span>. Pots canviar el permís del fitxer de Java però també pots donar permisos al llançador. |
| `launchBlocked.launchSpawnProcessFailed.description` | Verifica el teu Java o concedeix més permisos al llançador i torna a intentar-ho.<br>Si això encara no funciona, contacta amb els desenvolupadors. |
| `launchBlocked.unexpectedText` | Això no hauria d'ocórrer. Prova a reiniciar el llançador. Contacta amb els desenvolupadors si torna a ocórrer. |
| `launcherUpdate.title` | Actualització del Llançador |
| `modInstall.noVersionSupported` | El mod només és compatible amb Minecraft {supported}. |
| `modpackImportConfirm.description` | He detectat que has deixat caure un fitxer al llançador.<br>Estàs intentant importar un Modpack? |
| `natType.blocked` | Bloquejat |
| `natType.fullCone` | NAT de con complet |
| `natType.openInternet` | Accés directe a Internet |
| `natType.restrictNat` | NAT restringit |
| `natType.restrictPortNat` | NAT restringit per port |
| `natType.symmetricNat` | NAT simètric |
| `natType.symmetricUDPFirewall` | Tallafoc UDP simètric |
| `neoForgedVersion.name` | NeoForge |
| `presence.instance` | Llançador Inactiu a la Instància {instance} |
| `setup.dataRoot.description` | El directori de dades no és un directori .minecraft comú. Com que l'estructura de directoris de dades del llançador és diferent de la versió original, no recomanem usar el directori .minecraft comú com a directori de dades. |
| `setup.error.badDataRoot` | Directori no vàlid per a les dades del llançador! Si us plau, usa'n un altre! |
| `setup.error.exists` | La carpeta no és buida. Fes-ne una còpia de seguretat. |
| `setup.error.noPermission` | El llançador no té permís per accedir! Si us plau, prova un altre directori. |
| `setup.focusLayoutDescription` | El look focus és la interfície normal del llançador de Minecraft. Està dissenyat per usar-se amb una instància o poques. |
| `agent.inputPlaceholder` | Pregunta a l'agent… (Retorn per enviar, Maj+Retorn per crear una línia nova) |
| `agent.notConfiguredHint` | Configura la clau d'API, el model i el punt d'accés a Configuració → General → Agent d'IA per activar l'agent. |
| `agent.openSettings` | Obre la configuració |
| `askAICrash.agentNotConfigured` | Afegeix un proveïdor d'IA i una clau d'API a la configuració perquè l'agent integrat del llançador pugui diagnosticar i resoldre el problema. |
| `browseApps` | Veient la interfície del llançador |
| `migrationWindow.warning` | Mantén el llançador obert fins que acabi, o podries perdre les dades. |
| `modSearchType.explore` | Modpacks |

## Electron: ca

| Clave | Valor actual |
|---|---|
| `showLauncher` | Mostra el llançador |
| `makeDesktopShortcut` | Crea una drecera a l'escriptori |
| `task.fail` | Ha fallat una tasca |
| `task.success` | S'ha completat una tasca |

## Extras conservados: ca

- `HomeJavaIssueDialog.optionGoToDownloadPage.message`
- `HomeJavaIssueDialog.optionGoToDownloadPage.name`
- `HomeJavaIssueDialog.optionLocalJava.message`
- `HomeJavaIssueDialog.optionLocalJava.name`
- `HomeSyncButton.sync`
- `HomeSyncDialog.description`
- `HomeSyncDialog.sync`
- `HomeSyncDialog.title`
- `HomeSyncDialogPull.description`
- `HomeSyncDialogPull.pull`
- `HomeSyncDialogPull.title`
- `HomeSyncDialogPush.description`
- `HomeSyncDialogPush.push`
- `HomeSyncDialogPush.title`
- `curseforge.download`
- `curseforge.title`
- `curseforge.view`
- `env.missingVersion.message`
- `env.missingVersion.name`
- `env.missingVersionJar.message`
- `env.missingVersionJar.name`
- `eula.BadForgeInstallerJarError`
- `eula.BadInstanceType`
- `eula.BodyTimeoutError`
- `eula.ChecksumNotMatchError`
- `eula.ConnectTimeoutError`
- `eula.DNSNotFoundError`
- `eula.DatabaseNotOpened`
- `eula.DownloadAggregateError`
- `eula.DownloadFileSystemError`
- `eula.HeadersTimeoutError`
- `eula.SocketError`
- `exportModpackTarget.title`
- `gameSetting.title`
- `instanceSetting.title`
- `java.allocatedMemory`
- `java.autoMemory`
- `java.currentRuntime`
- `java.description`
- `java.environmentJava`
- `java.javaPath`
- `java.noJavaFound`
- `java.optionalJvmFlags`
- `java.recommendedMemory`
- `java.title`
- `launcherUpdate.title`
- `launcherUpdate.tooltip`
- `localVersion.fabricInstaller`
- `localVersion.forgeInstaller`
- `login.cookiesHeader`
- `login.description`
- `login.microsoft`
- `login.microsoftHint`
- `login.mojang`
- `login.mojangHint`
- `login.offline`
- `login.offlineHint`
- `login.title`
- `modUpgradePolicy.active`
- `modUpgradePolicy.passive`
- `modUpgradePolicy.title`
- `modrinth.download`
- `modrinth.install`
- `modrinth.search`
- `modrinth.title`
- `modrinth.view`
- `multiplayer.inviteAFriend`
- `multiplayer.title`
- `saves`
- `setting.instance`
- `setting.title`
- `userService.description`

## Valores literales revisados: ca

- `BaseSettingGeneral.title`
- `FeedTheBeastProject.versions`
- `baseSetting.info.vanilla`
- `color`
- `curseforgeCategory.Fabric`
- `curseforgeCategory.FancyMenu`
- `curseforgeCategory.MCreator`
- `curseforgeCategory.Modern`
- `curseforgeCategory.Parkour`
- `curseforgeCategory.QoL`
- `curseforgeCategory.Redstone`
- `curseforgeCategory.Skyblock`
- `curseforgeCategory.Steampunk`
- `curseforgeCategory.Vanilla+`
- `delete.no`
- `dependencies.incompatible`
- `error.name`
- `errors.InstallInstructionFailed.body`
- `feedback.discord`
- `feedback.kook`
- `feedback.reddit`
- `fileDetail.hash`
- `forgeVersion.name`
- `instance.envVarKeyPlaceholder`
- `instance.monitorNumber`
- `instances.editionJava`
- `instances.editionBedrock`
- `items.total`
- `java.memoryManual`
- `java.name`
- `liteloader.name`
- `logLevel.error`
- `logLevel.info`
- `mod.name`
- `modpack.name`
- `modpack.url`
- `modpack.projectVersions`
- `modpack.publishProfileUniversal`
- `modrinth.categories.128x`
- `modrinth.categories.16x`
- `modrinth.categories.256x`
- `modrinth.categories.32x`
- `modrinth.categories.48x`
- `modrinth.categories.512x+`
- `modrinth.categories.64x`
- `modrinth.categories.8x-`
- `modrinth.categories.bukkit`
- `modrinth.categories.bungeecord`
- `modrinth.categories.canvas`
- `modrinth.categories.categories`
- `modrinth.categories.combat`
- `modrinth.categories.fabric`
- `modrinth.categories.folia`
- `modrinth.categories.forge`
- `modrinth.categories.iris`
- `modrinth.categories.liteloader`
- `modrinth.categories.minecraft`
- `modrinth.categories.models`
- `modrinth.categories.name`
- `modrinth.categories.neoforge`
- `modrinth.categories.paper`
- `modrinth.categories.pbr`
- `modrinth.categories.purpur`
- `modrinth.categories.quilt`
- `modrinth.categories.rift`
- `modrinth.categories.social`
- `modrinth.categories.spigot`
- `modrinth.categories.sponge`
- `modrinth.categories.vanilla`
- `modrinth.categories.velocity`
- `modrinth.categories.waterfall`
- `modrinth.environments.client`
- `modrinth.projectType.mod`
- `modrinth.projectType.modpack`
- `modrinth.projectType.shader`
- `modrinth.versions`
- `modrinth.wikiUrl`
- `multiplayer.togetherName`
- `no`
- `proxy.port`
- `resourcepack.searchOnModrinth`
- `save.dimOverworld`
- `server.ping`
- `server.pings`
- `server.port`
- `server.remoteMods`
- `server.serviceSystemd`
- `server.targetLocal`
- `setting.general`
- `setting.aiAgentEndpointPlaceholder`
- `setting.backgroundTypes.halo`
- `setting.devModeLabel`
- `settingLabel.global`
- `settingLabel.local`
- `setup.appearance.name`
- `shared.client`
- `shared.no`
- `theme.title`
- `title`
- `turnRegion.hk`
- `tutorial.multiplayer.contentTitle`
- `userServices.microsoft.name`
- `userServices.mojang.name`
- `versionType.beta`
- `agent.passiveGameExitSummary`
- `agent.passiveGameStartedSummary`
- `agent.toolArguments`
- `agent.marketType.mod`
- `agent.marketType.modpack`
- `commandPalette.modrinth`
- `commandPalette.recent`
- `difficulty.normal`
- `unresolvedFiles.source.curseforge-name`
- `unresolvedFiles.source.modrinth-name`
- `unresolvedFiles.via`
- `bedrock.channelBeta`
- `bedrock.channelPreview`
- `xmclAccount.title`
- `blueprint.local`
- `blueprint.materials`
- `blueprint.compatible`
- `blueprint.replace.simple`

## Claves añadidas: es-ES global

| Clave | Valor actual |
|---|---|
| `agent.abort` | Detener generación |
| `agent.confirmAccept` | Continuar |
| `agent.confirmAllowAll` | Permitir todo |
| `agent.confirmCancel` | Cancelar |
| `agent.confirmPending` | Esperando confirmación |
| `agent.confirmTitle` | Confirmar acción del agente |
| `agent.errorTitle` | Se ha producido un error en el agente |
| `agent.passiveGameCrashed` | El juego ha fallado |
| `agent.passiveGameExitCode` | Código de salida {code} |
| `agent.passiveGameExited` | El juego se ha cerrado |
| `agent.passiveGameExitSignal` | Señal {signal} |
| `agent.passiveGameExitSummary` | {duration} · {result} |
| `agent.passiveGameExitUnknown` | Estado de salida desconocido |
| `agent.reasoning` | Razonamiento |
| `agent.passiveGameStarted` | El juego se ha iniciado |
| `agent.passiveGameStartedSummary` | Minecraft {minecraft} · {version} · PID {pid} |
| `agent.passiveModDiagnosis` | Informe de compatibilidad de mods |
| `agent.passiveModDiagnosisError` | El diagnóstico de compatibilidad ha fallado |
| `agent.passiveModDiagnosisSummary` | {checked} mods comprobados · {incompatibilities} incompatibilidades · {duplicates} duplicados |
| `agent.passiveModDuplicate` | Mod duplicado {mod}: {files} |
| `agent.passiveModInstalled` | versión instalada: {version} |
| `agent.toolArguments` | Argumentos |
| `agent.toolResult` | Resultado |
| `agent.toolRunning` | Esperando resultado… |
| `agent.marketConfirmMessage` | ¿Quieres instalar {name} en la instancia actual? |
| `agent.marketConfirmTarget` | Destino: {instance} |
| `agent.marketConfirmTitle` | Instalar {type} |
| `agent.marketInstall` | Instalar |
| `agent.marketInstalled` | Instalado |
| `agent.marketInstallFailed` | No se ha podido instalar {type} |
| `agent.marketType.datapack` | paquete de datos |
| `agent.marketType.mod` | mod |
| `agent.marketType.modpack` | modpack |
| `agent.marketType.resourcepack` | paquete de recursos |
| `agent.marketType.shader` | paquete de shaders |
| `agent.marketResultCount` | {count} resultados |
| `baseSetting.info.address` | Dirección |
| `baseSetting.info.changes` | Cambios |
| `baseSetting.info.custom` | Personalizado |
| `baseSetting.info.disabled` | Desactivado |
| `baseSetting.info.enabled` | Activado |
| `baseSetting.info.exportFormats` | Formatos de exportación |
| `baseSetting.info.inherited` | Heredado |
| `baseSetting.info.modLoader` | Cargador de mods |
| `baseSetting.info.notConfigured` | Sin configurar |
| `baseSetting.info.notSet` | Sin especificar |
| `baseSetting.info.offline` | Archivo sin conexión |
| `baseSetting.info.projectId` | ID del proyecto |
| `baseSetting.info.running` | En ejecución |
| `baseSetting.info.saved` | Guardado |
| `baseSetting.info.status` | Estado |
| `baseSetting.info.stopped` | Detenido |
| `baseSetting.info.vanilla` | Vanilla |
| `diagnosis.missingVersionJar.message` | Haz clic para instalar esta versión |
| `diagnosis.missingVersionJar.name` | Falta el JAR de Minecraft %{version} |
| `errors.bedrockUnsupportedPlatform` | Minecraft Bedrock Edition solo es compatible con la versión para Windows. |
| `errors.bedrockNotInstalled` | Minecraft Bedrock Edition no está instalado. |
| `errors.bedrockLaunchFailed` | No se ha podido iniciar Minecraft Bedrock Edition. |
| `errors.bedrockInstallFailed` | No se ha podido instalar Minecraft Bedrock Edition. |
| `errors.bedrockDownloadUrlUnavailable` | Esta versión de Bedrock no está disponible para la cuenta de Microsoft actual. Las versiones Beta y Preview requieren una cuenta inscrita en el programa beta de Minecraft. |
| `errors.bedrockDeveloperModeRequired` | Debes activar el modo de desarrollador de Windows para registrar esta versión de Bedrock. |
| `errors.bedrockRegisterFailed` | No se ha podido registrar esta versión de Bedrock en Windows. |
| `errors.bedrockVersionNotFound` | Esta versión de Bedrock no está instalada localmente. |
| `commandPalette.hintAskAgent` | preguntar al agente |
| `feedback.reddit` | Reddit |
| `feedback.redditDescription` | Únete a la comunidad de Reddit r/XMCL |
| `instance.monitor` | Monitor para pantalla completa |
| `instance.monitorDefault` | Predeterminado (monitor principal) |
| `instance.monitorNumber` | Monitor {number} |
| `instance.monitorPrimary` | Principal |
| `instance.resolutionEnabled` | Activar resolución personalizada |
| `instances.instanceCount` | {count} instancias |
| `launchBlocked.launchLinuxDisplayUnavailable.environmentMissing` | PbtModLauncherX no ha podido recuperar la información de la pantalla X11 de tu sesión de escritorio. Reinícialo desde un terminal de la sesión actual o cierra la sesión y vuelve a entrar. |
| `launchBlocked.launchLinuxDisplayUnavailable.noGraphicalSession` | PbtModLauncherX no se está ejecutando en una sesión de escritorio gráfica. Inícialo desde el escritorio antes de iniciar Minecraft. |
| `launchBlocked.launchLinuxDisplayUnavailable.sandboxDenied` | El entorno aislado de la aplicación no tiene acceso a X11. Permite a PbtModLauncherX acceder al socket X11 en los permisos de Flatpak y reinícialo. |
| `launchBlocked.launchLinuxDisplayUnavailable.title` | La pantalla X11 no está disponible |
| `launchBlocked.launchLinuxDisplayUnavailable.xwaylandMissing` | Minecraft necesita XWayland en esta sesión de Wayland. Instala el paquete XWayland de tu distribución de Linux, cierra la sesión y vuelve a entrar. |
| `launchBlocked.launchLinuxDisplayUnavailable.xwaylandNotRunning` | XWayland está instalado, pero no hay ninguna pantalla X11 en ejecución. Actívalo en la configuración del compositor, cierra la sesión y vuelve a entrar. |
| `loginError.loginCanceled` | Se ha cancelado el inicio de sesión de Microsoft. |
| `loginError.xboxErrorGuideHint` | ¿Tienes problemas para iniciar sesión? Consulta cómo resolver los problemas de inicio de sesión de Microsoft y Xbox. |
| `loginError.openLoginGuide` | Cómo resolver este problema |
| `loginError.openDiscordSupport` | ¿Sigues necesitando ayuda? Únete a nuestro Discord |
| `modInstall.scanUnusedLibraries` | Buscar bibliotecas sin utilizar |
| `modpack.modrinthProject` | Proyecto de Modrinth |
| `modpack.selectDefaultFiles` | Seleccionar archivos predeterminados |
| `modpack.bindProject` | Vincular proyecto |
| `modpack.bindProjectHint` | Selecciona un proyecto de modpack de Modrinth gestionado por la cuenta actual. |
| `modpack.bindProjectTypeImmutableHint` | Modrinth fija el tipo de proyecto al subir la primera versión y después no permite cambiarlo. Puedes vincular borradores sin versiones, pero un proyecto publicado como mod, paquete de recursos o similar no se puede convertir en modpack. Utiliza «Crear proyecto nuevo». |
| `modpack.bindProjectNoProjects` | No se han encontrado proyectos de Modrinth en tu cuenta. |
| `modpack.unbindProject` | Desvincular proyecto |
| `modpack.unbindProjectConfirmTitle` | ¿Quieres desvincular el proyecto de Modrinth? |
| `modpack.unbindProjectConfirmMessage` | Solo se elimina la asociación local entre esta instancia y el proyecto de Modrinth. El proyecto y sus versiones en Modrinth no se modifican. |
| `modpack.editProject` | Editar proyecto |
| `modpack.projectDiscovery` | Descubrimiento y compatibilidad |
| `modpack.projectGallery` | Galería |
| `modpack.projectGalleryAdd` | Añadir imagen |
| `modpack.projectGalleryEmpty` | Todavía no hay imágenes en la galería. |
| `modpack.projectGalleryFeatured` | Destacada |
| `modpack.projectGalleryFromScreenshots` | Elegir captura de pantalla |
| `modpack.projectGalleryHint` | Añade imágenes de hasta 5 MiB y elige la imagen destacada del proyecto. |
| `modpack.projectGallerySelectScreenshot` | Seleccionar captura de pantalla de la instancia |
| `modpack.projectIdentity` | Identidad y descripción |
| `modpack.projectLinks` | Enlaces del proyecto |
| `modpack.projectLoadFailed` | No se ha podido cargar el proyecto de Modrinth vinculado. |
| `modpack.projectNoChanges` | No hay cambios del proyecto pendientes de guardar. |
| `modpack.projectNotBound` | No hay ningún proyecto de Modrinth vinculado |
| `modpack.projectNotBoundHint` | Vincula un proyecto existente o crea uno nuevo en Modrinth. |
| `modpack.projectUnsavedChanges` | {count} campos del proyecto modificados |
| `modpack.projectLatestDraft` | Borrador |
| `modpack.projectVersions` | versiones |
| `modpack.publish` | Publicar |
| `modpack.publishCategories` | Categorías (separadas por comas) |
| `modpack.publishChannel` | Canal de publicación |
| `modpack.publishChangelog` | Registro de cambios |
| `modpack.publishChangelogGenerate` | Generar con IA |
| `modpack.publishConfirmProjectChanges` | Confirmar cambios del proyecto |
| `modpack.publishCreateProject` | Crear proyecto |
| `modpack.publishCreateDraft` | Generar y crear borrador |
| `modpack.publishCustomVersion` | Personalizada |
| `modpack.publishDescription` | Descripción del proyecto |
| `modpack.publishDiscordUrl` | URL de Discord |
| `modpack.publishDraftCreated` | Se ha subido el borrador de la versión. |
| `modpack.publishSubmitted` | Se ha enviado la versión a revisión. |
| `modpack.publishExistingProject` | Proyecto existente |
| `modpack.publishIcon` | Icono del proyecto |
| `modpack.publishIconHint` | PNG, JPEG o WebP |
| `modpack.publishIconKeep` | Se conserva si no seleccionas una imagen nueva |
| `modpack.publishIconUseInstance` | Utilizar icono de la instancia |
| `modpack.publishIssuesUrl` | URL de incidencias |
| `modpack.publishLicense` | ID de la licencia |
| `modpack.publishLogin` | Iniciar sesión en Modrinth |
| `modpack.publishFiles` | archivos seleccionados |
| `modpack.publishLinkageSummary` | {linked} de {total} mods, paquetes de recursos o paquetes de shaders se enlazarán directamente a su descarga de Modrinth en lugar de subirse. |
| `modpack.publishLinkageEmbeddedSummary` | {count} archivos no se pueden enlazar y se subirán integrados en esta versión. |
| `modpack.publishLinkageShowFiles` | Mostrar archivos que deben subirse |
| `modpack.publishLinkageReason.missing-file` | No se ha encontrado el archivo en el disco |
| `modpack.publishLinkageReason.not-linked-to-modrinth` | No se reconoce como recurso de Modrinth |
| `modpack.publishLinkageReason.no-downloadable-url` | No se ha encontrado una URL de descarga que permita redistribuirlo |
| `modpack.publishModrinth` | Publicar en Modrinth |
| `modpack.publishNewProject` | Proyecto nuevo |
| `modpack.publishOpenProject` | Abrir proyecto |
| `modpack.publishOpenVersion` | Abrir versión |
| `modpack.publishProfile` | Perfil MRPack |
| `modpack.publishProfileClient` | Solo cliente |
| `modpack.publishProfileServer` | Solo servidor |
| `modpack.publishProfileSplit` | Universal con archivos separados de cliente y servidor |
| `modpack.publishProfileUniversal` | Universal |
| `modpack.publishProject` | Proyecto |
| `modpack.publishProjectDetailsTab` | Detalles del proyecto |
| `modpack.publishProjectName` | Nombre del proyecto |
| `modpack.publishProjectRequired` | Selecciona un proyecto antes de publicar. |
| `modpack.publishProjectSlug` | Identificador legible del proyecto |
| `modpack.publishProjectUrl` | URL del proyecto (opcional) |
| `modpack.publishProjectUrlHint` | Déjalo en blanco para utilizar {slug}. |
| `modpack.publishProjectSaved` | Se han actualizado los detalles del proyecto. |
| `modpack.publishSourceUrl` | URL del código fuente |
| `modpack.publishSubmit` | Enviar borrador a revisión |
| `modpack.publishSummary` | Resumen breve |
| `modpack.publishSummaryMinWords` | El resumen debe contener al menos 3 palabras. |
| `modpack.publishVersionTitle` | Título de la versión |
| `modpack.publishVersionTab` | Publicar versión |
| `modpack.publishVersion` | Publicar versión |
| `modpack.publishVisibility` | Visibilidad |
| `modpack.publishWikiUrl` | URL de la wiki |
| `modpack.visibilityPrivate` | Privada |
| `modpack.visibilityPublic` | Pública |
| `modpack.visibilityUnlisted` | No listada |
| `multiplayer.connectedToMaster` | Conectado con el anfitrión de la sala |
| `multiplayer.directConnection` | Directa |
| `multiplayer.master` | Anfitrión |
| `multiplayer.masterHostsGameHint` | El anfitrión de la sala es el centro de conexión y debería alojar el mundo de Minecraft en red local. Transfiere este rol antes de cambiar de anfitrión. |
| `multiplayer.member` | Miembro |
| `multiplayer.joinCreatesMissingRoomHint` | Si la sala no existe, la crearás y serás su anfitrión. |
| `multiplayer.relayConnection` | Retransmisor |
| `multiplayer.relayAllowanceSummary` | Quedan {remaining} de {total} en este periodo |
| `multiplayer.relayServiceAvailable` | Servicio de retransmisión de XMCL Together disponible |
| `multiplayer.waitingForMaster` | Esperando a que el anfitrión de la sala se vuelva a conectar |
| `presence.away` | Ausente |
| `presence.offline` | Sin conexión |
| `presence.online` | En línea |
| `presence.playing` | Jugando a {game} |
| `presence.playingGeneric` | Jugando |
| `setting.multiplayerTransport` | Transporte de Together |
| `setting.multiplayerTransportDescription` | Elige la implementación de WebRTC que utiliza Together. Cambiar el transporte desconecta a los participantes activos. |
| `setting.aiAgentApiKeyClear` | Borrar clave |
| `setting.aiAgentApiKeyEmpty` | Pega tu clave de API |
| `setting.aiAgentApiKeyNotNeeded` | No necesaria |
| `setting.aiAgentApiKeyNotNeededHint` | Este proveedor se ejecuta localmente y no necesita ninguna clave de API |
| `setting.aiAgentApiKeySaved` | Guardada |
| `setting.aiAgentApiKeyStored` | Clave guardada; escribe otra para sustituirla |
| `setting.aiAgentBuiltin` | Integrado |
| `setting.aiAgentCustom` | Personalizado |
| `setting.useDesktopBackground` | Utilizar fondo de escritorio actual |
| `shared.failed` | Ha fallado |
| `turnRegion.guangzhou` | Guangzhou, China |
| `turnRegion.liaoning` | Liaoning, China |
| `userSkin.invalidImage` | Elige una imagen de apariencia de Minecraft válida. |
| `userSkin.invalidImageTitle` | Imagen de apariencia no válida |
| `userSkin.uploadRejected` | Minecraft ha rechazado esta apariencia. Vuelve a intentarlo más tarde. |
| `minecraftFriends.errors.friendsDisabled` | Tu cuenta de Minecraft tiene desactivada la función de amigos o no puede utilizarla. Actívala en la configuración de la cuenta y vuelve a intentarlo. |
| `minecraftFriends.errors.invalidName` | Los nombres de usuario de Minecraft deben tener entre 3 y 16 caracteres. |
| `gamepad.autoEnableLabel` | Activar controles automáticamente |
| `gamepad.autoEnableHint` | Activa la navegación con mando cuando se detecte uno. |
| `gamepad.autoOpenKeyboardLabel` | Abrir automáticamente el teclado de Steam |
| `gamepad.autoOpenKeyboardHint` | Abre el teclado en pantalla de Steam al seleccionar campos de texto. |
| `gamepad.focusTooltipsLabel` | Mostrar consejos en los elementos seleccionados |
| `gamepad.focusTooltipsHint` | Muestra los consejos emergentes al navegar por los elementos con el mando. |
| `gamepad.disableModPromptLabel` | Desactivar sugerencias de mods para mandos |
| `gamepad.disableModPromptHint` | No propongas instalar mods para mandos al iniciar el juego con un mando. |
| `xmclAccount.accountSummary` | Cuenta |
| `xmclAccount.confirmMerge` | Confirmar fusión de cuentas |
| `xmclAccount.createdAt` | Creada el {date} |
| `xmclAccount.description` | Tu identidad XMCL sin contraseña, independiente de las cuentas de juego de Minecraft. |
| `xmclAccount.expiresAt` | Caduca el {date} |
| `xmclAccount.gameAccountsSeparate` | Eliminar una cuenta de juego no desvincula ningún método de inicio de sesión de XMCL. |
| `xmclAccount.guest` | Invitado |
| `xmclAccount.identityConflict` | Este inicio de sesión de {provider} pertenece a otro XMCL Account. Las cuentas nunca se fusionan automáticamente. |
| `xmclAccount.linkAccountWith` | Vincular cuenta con |
| `xmclAccount.mergePreview` | Revisa los recursos que se transferirán antes de confirmar. |
| `xmclAccount.mergeNeedsSession` | Inicia sesión en el XMCL Account que quieres conservar antes de revisar la fusión. |
| `xmclAccount.mergeQueued` | La fusión de cuentas está en curso. |
| `xmclAccount.requestFailed` | El servicio XMCL Account no ha podido completar la petición. Tu cuenta de juego no ha cambiado. |
| `xmclAccount.reviewMerge` | Revisar fusión |
| `xmclAccount.session` | Sesión |
| `xmclAccount.sessionActive` | Activa |
| `xmclAccount.sessionExpired` | Caducada |
| `xmclAccount.signOutAll` | Cerrar sesión en todos los dispositivos |
| `xmclAccount.signOutDevice` | Cerrar sesión en este dispositivo |
| `xmclAccount.status.active` | Activa |
| `xmclAccount.status.deleted` | Eliminada |
| `xmclAccount.status.deletion_pending` | Eliminación pendiente |
| `xmclAccount.status.merged` | Fusionada |
| `xmclAccount.title` | XMCL Account |
| `localCollection.title` | Colecciones del lanzador |
| `localCollection.newCollection` | Colección nueva |
| `localCollection.namePlaceholder` | Nombre de la colección |
| `localCollection.addToCollection` | Añadir a una colección |
| `localCollection.empty` | Todavía no hay colecciones en el lanzador |
| `localCollection.corrupted` | No se han podido leer las colecciones guardadas y se han restablecido. Se conserva una copia de seguridad junto al archivo de datos. |
| `localCollection.modrinthSection` | Cuenta de Modrinth |
| `localCollection.installAll` | Instalar todo |
| `localCollection.incompatibleAlert` | Se ha omitido 1 proyecto porque no es compatible con la instancia actual: \| Se han omitido {count} proyectos porque no son compatibles con la instancia actual: |
| `localCollection.projects` | Ningún proyecto \| {count} proyecto \| {count} proyectos |
| `accessibility.window` | Ventana |
| `accessibility.windowControls` | Controles de ventana |
| `accessibility.minimize` | Minimizar |
| `accessibility.maximize` | Maximizar |
| `accessibility.sidebarNavigation` | Navegación de la barra lateral |
| `accessibility.instanceGroup` | Grupo de instancias |
| `accessibility.selectedCount` | {count} seleccionados |
| `accessibility.moreCount` | +{count} más |

## Claves corregidas: es-ES global

| Clave | Valor actual |
|---|---|
| `agent.inputPlaceholder` | Pregunta al agente… (Intro para enviar, Mayús+Intro para crear una línea nueva) |
| `agent.notConfiguredHint` | Configura la clave de API, el modelo y el punto de acceso en Configuración → General → Agente de IA para activar el agente. |
| `dependencies.embedded` | Integrada |
| `dependencies.name` | Dependencias |
| `dependencies.optional` | Opcional |
| `dependencies.required` | Obligatoria |
| `diagnosis.missingJava.message` | Haz clic para resolver el problema |
| `diagnosis.missingVersion.message` | Haz clic para instalar esta versión |
| `env.missingVersion.message` | Haz clic para instalar esta versión |
| `env.missingVersionJar.message` | Haz clic para instalar esta versión |
| `exception.http` | La petición HTTP a {url} ha fallado. Código de estado: {statusCode}. {code}. Vuelve a intentarlo o comprueba la red. Si el problema persiste, envía un informe al equipo de desarrollo. |
| `feedback.githubOpenIssue` | GitHub |
| `instance.changeIcon` | Cambiar icono |
| `instance.nameInvalidChars` | El nombre no puede contener estos caracteres: < > : " / \\ {'\|'} ? * |
| `instance.vmVarHint` | Haz clic en el botón para añadir variables de entorno |
| `instanceSetting.disableElyByAuthlib` | Desactivar sustitución de authlib de ely.by |
| `instanceSetting.syncGameLanguageDescription` | Sincroniza automáticamente el idioma de Minecraft con el del lanzador al iniciar el juego |
| `java.importFromFile` | Importar Java desde un archivo |
| `java.refresh` | Actualizar instalaciones locales de Java |
| `java.systemMemory` | Memoria libre del sistema: {free} / {total} |
| `login.manualLoginUrl` | Si el navegador no se abre, pulsa este enlace para autorizar el acceso. |
| `modInstall.noVersionSupported` | El mod solo es compatible con Minecraft {supported}. |
| `modrinth.categories.bloom` | Resplandor |
| `modrinth.categories.kitchen-sink` | De todo un poco |
| `modrinth.categories.mobs` | Criaturas |
| `modrinth.categories.optifine` | OptiFine |
| `modrinth.projectType.plugin` | Complemento |
| `multiplayer.copyLocalHint` | Copia el texto SDP local y envíalo al otro jugador para que lo introduzca en «Unirse a una conexión». <span>Un token solo se puede utilizar con <span style="color: red; font-weight: bold;">un jugador</span>. ¡No lo envíes a varios jugadores!</span><br><span class="hint-text" style="font-style: italic;">Para conectar con varios jugadores, crea <span style="font-weight: bold; color: rgba(245, 158, 11)">varias</span> conexiones.</span><br> |
| `multiplayer.gatheringIce` | Espera a que el servidor ICE recopile suficiente información de la red. Puedes enviar el SDP actual si ya hay suficientes datos y pulsar Siguiente. Envía el <span class="v-chip v-chip--label v-size--small" style="text-font: bold">Token local</span> al otro jugador para que lo introduzca en <span class="v-chip v-chip--label v-size--small" style="text-font: bold">Unirse a una conexión</span>.<br>El servidor ICE puede tardar en generar el <span class="v-chip v-chip--label v-size--small" style="text-font: bold">Token local</span>.<br>No tienes que esperar a que termine: si el token de abajo ya no cambia, puedes copiarlo y enviarlo.<br> |
| `multiplayer.otherExposedPortDescription` | Puerto redirigido por {user} |
| `multiplayer.routerInfo` | Información del router |
| `multiplayer.startNewP2PConnection` | Pulsa Iniciar para crear una conexión con otro jugador |
| `multiplayer.sharingNotificationBody` | Puedes descargar o crear una instancia a partir de la configuración compartida de {name}. |
| `natType.blocked` | Bloqueado |
| `natType.fullCone` | NAT de cono completo |
| `natType.openInternet` | Acceso directo a Internet |
| `natType.restrictNat` | NAT restringido |
| `natType.restrictPortNat` | NAT restringido por puerto |
| `natType.symmetricNat` | NAT simétrico |
| `natType.symmetricUDPFirewall` | Cortafuegos UDP simétrico |
| `neoForgedVersion.name` | NeoForge |
| `save.seed` | Semilla |
| `server.bindUpstream` | Vincular como servidor de referencia |
| `server.boundUpstream` | Servidor de referencia vinculado |
| `server.exportSSHPrivateKeyPath` | Ruta de la clave privada SSH |
| `server.hostRequired` | Introduce la dirección IP del servidor |
| `server.launchClient` | Iniciar el cliente |
| `server.remoteActionSuccess` | Hecho. |
| `server.remotePhase.connect` | Conectando |
| `server.remotePhase.error` | No se ha podido aplicar el estado deseado |
| `server.remotePhase.idle` | Preparado para aplicar el estado deseado |
| `server.remotePhase.inspect` | Inspeccionando destino |
| `server.remotePhase.install` | Instalando servidor |
| `server.remotePhase.logs` | Conectando consola |
| `server.remotePhase.ready` | Estado deseado aplicado |
| `server.remotePhase.service` | Comprobando servicio systemd |
| `server.remotePhase.start` | Iniciando servidor |
| `server.remotePhase.sync` | Sincronizando estado deseado |
| `server.remotePhase.world` | Aplicando política del mundo |
| `server.remoteTestConnectionSuccess` | Conexión correcta. |
| `server.serviceNameHint` | Identificador estable con letras, números, puntos, guiones bajos o guiones |
| `server.upload` | Subir servidor |
| `setting.aboutLicense` | LICENCIA MIT |
| `setting.aiAgentApiKey` | Clave de API del agente de IA |
| `setting.aiAgentEndpoint` | Punto de acceso del agente de IA |
| `setting.aiAgentEndpointDescription` | URL del punto de acceso para completar conversaciones. |
| `setting.aiAgentModel` | Modelo del agente de IA |
| `setting.aiAgentModelDescription` | Nombre del modelo que se envía en las peticiones de conversación. |
| `setting.disableTelemetryDescription` | PbtModLauncherX recopila eventos de inicio del juego y de inicio de sesión. |
| `setting.enableDiscordDescription` | Actualiza tu estado de Discord con la actividad del lanzador |
| `setting.globalSetting` | Juego |
| `setting.maxSockets` | Por servidor |
| `setting.maxSocketsDescription` | Limita el número máximo de sockets por servidor o en total. El valor 0 indica que no hay límite. |
| `setting.network` | Red |
| `setting.replaceNativeDescription` | Sustituye las bibliotecas nativas según la arquitectura de tu ordenador. |
| `setting.streamerModeDescription` | Oculta información privada del lanzador, como tu dirección de correo electrónico. |
| `setup.error.exists` | La carpeta no está vacía. Haz una copia de seguridad. |
| `userSkin.reset` | Restablecer |
| `userSkin.urlNotEmpty` | La URL de la apariencia no puede estar vacía |
| `blueprint.name` | Plano \| Planos |
| `blueprint.count` | {count} planos |
| `blueprint.searchLocal` | Buscar planos… |
| `blueprint.empty` | No se ha encontrado ningún plano. Importa un archivo .litematic, .schem o .nbt, o explora el catálogo. |
| `blueprint.dropHint` | Arrastra aquí archivos de planos (.litematic, .schem o .nbt) para importarlos. |
| `blueprint.selectHint` | Selecciona un plano para previsualizarlo. |
| `blueprint.findMod` | Buscar el mod de este espacio de nombres |
| `blueprint.preview.empty` | Este plano no contiene bloques que mostrar. |
| `blueprint.preview.controls` | WASD: moverse · Espacio/Mayús: subir/bajar · Arrastrar: mirar · Rueda: ampliar |
| `blueprint.convert.hint` | Convierte este plano a otro formato. Se creará un archivo nuevo. |
| `existed` | Existente |
| `modSearchType.explore` | Modpacks |

## Electron: es-ES

| Clave | Valor actual |
|---|---|
| `autoCloseHint` | Esta ventana se cerrará en {time} segundos |
| `relaunch` | Reiniciar |
| `task.fail` | Una tarea ha fallado |

## Extras conservados: es-ES

- `env.missingVersion.message`
- `env.missingVersion.name`
- `env.missingVersionJar.message`
- `env.missingVersionJar.name`
- `eula.BadForgeInstallerJarError`
- `eula.BadInstanceType`
- `eula.BodyTimeoutError`
- `eula.ChecksumNotMatchError`
- `eula.ConnectTimeoutError`
- `eula.DNSNotFoundError`
- `eula.DatabaseNotOpened`
- `eula.DownloadAggregateError`
- `eula.DownloadFileSystemError`
- `eula.HeadersTimeoutError`
- `eula.SocketError`
- `setting.hideNews`
- `setting.hideNewsDescription`

## Valores literales revisados: es-ES

- `BaseSettingGeneral.title`
- `agent.passiveGameExitSummary`
- `agent.passiveGameStartedSummary`
- `agent.marketType.mod`
- `agent.marketType.modpack`
- `baseSetting.info.vanilla`
- `bedrock.channelBeta`
- `color`
- `curseforgeCategory.Fabric`
- `curseforgeCategory.FancyMenu`
- `curseforgeCategory.MCreator`
- `curseforgeCategory.Parkour`
- `curseforgeCategory.Puzzle`
- `curseforgeCategory.QoL`
- `curseforgeCategory.Redstone`
- `curseforgeCategory.Skyblock`
- `curseforgeCategory.Steampunk`
- `curseforgeCategory.Vanilla+`
- `dependencies.incompatible`
- `delete.no`
- `difficulty.normal`
- `errors.InstallInstructionFailed.body`
- `commandPalette.modrinth`
- `feedback.discord`
- `feedback.kook`
- `feedback.reddit`
- `fileDetail.hash`
- `forgeVersion.name`
- `instance.envVarKeyPlaceholder`
- `instance.monitorNumber`
- `items.total`
- `java.memoryManual`
- `java.name`
- `logLevel.error`
- `logLevel.info`
- `mod.name`
- `modpack.name`
- `modpack.url`
- `modpack.publishProfileUniversal`
- `modrinth.categories.128x`
- `modrinth.categories.16x`
- `modrinth.categories.256x`
- `modrinth.categories.32x`
- `modrinth.categories.48x`
- `modrinth.categories.512x+`
- `modrinth.categories.64x`
- `modrinth.categories.8x-`
- `modrinth.categories.audio`
- `modrinth.categories.bukkit`
- `modrinth.categories.bungeecord`
- `modrinth.categories.canvas`
- `modrinth.categories.fabric`
- `modrinth.categories.folia`
- `modrinth.categories.forge`
- `modrinth.categories.iris`
- `modrinth.categories.minecraft`
- `modrinth.categories.neoforge`
- `modrinth.categories.paper`
- `modrinth.categories.pbr`
- `modrinth.categories.purpur`
- `modrinth.categories.quilt`
- `modrinth.categories.rift`
- `modrinth.categories.social`
- `modrinth.categories.spigot`
- `modrinth.categories.sponge`
- `modrinth.categories.vanilla`
- `modrinth.categories.velocity`
- `modrinth.projectType.mod`
- `modrinth.projectType.modpack`
- `modrinth.projectType.shader`
- `modrinth.wikiUrl`
- `multiplayer.togetherName`
- `resourcepack.searchOnModrinth`
- `server.ping`
- `server.pings`
- `server.remoteMods`
- `server.serviceSystemd`
- `server.targetLocal`
- `setting.aiAgentEndpointPlaceholder`
- `setting.backgroundTypes.halo`
- `setting.devModeLabel`
- `setting.general`
- `settingLabel.global`
- `settingLabel.local`
- `setup.appearance.name`
- `shared.no`
- `theme.title`
- `title`
- `turnRegion.hk`
- `turnRegion.guangzhou`
- `turnRegion.liaoning`
- `unresolvedFiles.source.curseforge-name`
- `unresolvedFiles.source.modrinth-name`
- `userServices.microsoft.name`
- `userServices.mojang.name`
- `versionType.beta`
- `blueprint.local`
- `blueprint.compatible`
- `blueprint.replace.simple`
- `liteloader.name`
- `no`
- `xmclAccount.title`

## Candidatos a claves no utilizadas

- `AppAddInstanceDialog.choiceTitle`
- `AppAddInstanceDialog.configTitle`
- `AppAddInstanceDialog.createTitle`
- `AppAddInstanceDialog.downloadedNotification`
- `AppShareInstanceDialog.cancelShare`
- `AppShareInstanceDialog.description`
- `AppShareInstanceDialog.downloadToLocal`
- `AppShareInstanceDialog.instanceShare`
- `AppShareInstanceDialog.share`
- `AppShareInstanceDialog.shareNotifyTitle`
- `AppShareInstanceDialog.shareTitle`
- `FeedTheBeast.search`
- `FeedTheBeastProject.changelog`
- `FeedTheBeastProject.details`
- `FeedTheBeastProject.install`
- `FeedTheBeastProject.overview`
- `FeedTheBeastProject.versions`
- `HomeJavaIssueDialog.incompatibleJavaHint`
- `HomeJavaIssueDialog.needDownloadHint`
- `HomeJavaIssueDialog.optionAutoDownload.message`
- `HomeJavaIssueDialog.optionAutoDownload.name`
- `HomeJavaIssueDialog.optionSelectJava.message`
- `HomeJavaIssueDialog.optionSelectJava.name`
- `HomeJavaIssueDialog.optionSwitch.disabled`
- `HomeJavaIssueDialog.optionSwitch.message`
- `HomeJavaIssueDialog.recommendedVersionHint`
- `HomeJavaIssueDialog.selectMatchedHint`
- `HomeJavaIssueDialog.selectSecondaryHint`
- `HomeSyncDialog.pull`
- `HomeSyncDialog.push`
- `HomeSyncDialogPull.failText`
- `HomeSyncDialogPull.refresh`
- `HomeSyncDialogPull.update`
- `HomeSyncDialogPush.authError`
- `HomeSyncDialogPush.refresh`
- `HomeSyncDialogPush.unknownError`
- `HomeSyncDialogPush.upload`
- `add`
- `agent.notConfiguredHint`
- `agent.setupGuide`
- `agent.statusReady`
- `agent.statusWorking`
- `agent.toggleHint`
- `author`
- `back`
- `baseSetting.info.offline`
- `blueprint.allNamespaces`
- `blueprint.cancel`
- `blueprint.cmsBrowseOnly`
- `blueprint.delete`
- `blueprint.loadMore`
- `blueprint.local`
- `blueprint.preview.title`
- `browse`
- `browseApps`
- `cancel`
- `checkUpdate.name`
- `commandPalette.searching`
- `curseforge.authors`
- `curseforge.downloadOnly`
- `curseforge.file.gameVersion`
- `curseforge.file.modLoader`
- `curseforge.install`
- `curseforge.installTo`
- `curseforge.installToStorage`
- `curseforge.project.description`
- `curseforge.project.files`
- `curseforge.project.images`
- `curseforge.recentFiles`
- `curseforge.search`
- `curseforge.totalDownloads`
- `dataMigration.directoryCriteriaHint`
- `dataMigration.migrationDestinationIsFile`
- `dataMigration.migrationDestinationIsNotEmptyDirectory`
- `dataMigration.migrationNoPermission`
- `description`
- `detail`
- `diagnosis.corruptedVersionJson.message`
- `diagnosis.corruptedVersionJson.name`
- `diagnosis.incompatibleJava.message`
- `diagnosis.invalidJava.message`
- `diagnosis.missingAssets.message`
- `diagnosis.missingAssets.name`
- `diagnosis.missingAssetsIndex.message`
- `diagnosis.missingAssetsIndex.name`
- `diagnosis.missingVersionJar.message`
- `diagnosis.missingVersionJar.name`
- `disable`
- `download`
- `edit`
- `enable`
- `error.name`
- `exception.http`
- `existed`
- `exportModpackTarget.curseforge`
- `exportModpackTarget.github`
- `exportModpackTarget.modrinth`
- `exportModpackTarget.override`
- `fileDetail.filesize`
- `filter`
- `filterLocalOnly`
- `finish`
- `forgeConfig.hint`
- `forgeVersion.common`
- `forgeVersion.name`
- `forgeVersion.showBuggy`
- `forgeVersion.showRecommendedAndLatestOnly`
- `forgeVersion.version`
- `gamepad.autoEnableHint`
- `gamepad.autoOpenKeyboardHint`
- `gamepad.disableModPromptHint`
- `gamepad.disabledState`
- `gamepad.enableSwitchLabel`
- `gamepad.enabledState`
- `gamepad.focusTooltipsHint`
- `help`
- `home`
- `importModpack.failed`
- `importModpack.success`
- `importResource`
- `install`
- `installForge.library`
- `installLabyMod.asset`
- `installLabyMod.json`
- `installModpack.deploy`
- `installModpack.download.file`
- `installModpack.download.name`
- `installModpack.name`
- `installModpack.unpack`
- `installOptifine.jar`
- `installOptifine.json`
- `installResource.fail`
- `installResource.success`
- `instance.addServer`
- `instance.gameVersion`
- `instance.includeVersion`
- `instance.launchServer`
- `instance.resolutionEnabled`
- `instance.versionHint`
- `instanceLauncher.search`
- `instanceLauncher.showAll`
- `instanceLauncher.title`
- `instanceTemplate.curseforge`
- `instanceTemplate.importing`
- `instanceTemplate.mcbbs`
- `instanceTemplate.modpack`
- `instanceTemplate.modrinth`
- `instanceTemplate.title`
- `instances.addManually`
- `instances.addServer`
- `instances.addServerDescription`
- `instances.addTemplate`
- `instances.addTemplateDescription`
- `instances.choose`
- `instances.edition`
- `instances.importFolder`
- `instances.importFolderDescription`
- `instances.loadingFiles`
- `instances.refreshServers`
- `items.count`
- `java.browse`
- `java.modifyInstance`
- `java.noMemory`
- `launch.killServer`
- `launchBlocked.ignore`
- `launchBlocked.launchUserStatusRefreshFailed.description`
- `launchBlocked.launchUserStatusRefreshFailed.title`
- `launchBlocked.userAcquireMicrosoftTokenFailed`
- `launchBlocked.userCheckGameOwnershipFailed`
- `launchBlocked.userExchangeXboxTokenFailed`
- `launchBlocked.userLoginMinecraftByXboxFailed`
- `launchPreExecuteCommandFailed.description`
- `launchPreExecuteCommandFailed.title`
- `launcherUpdate.reinstall`
- `liteloader.name`
- `localVersion.delete`
- `localVersion.deleteDescription`
- `localVersion.refresh`
- `logLevel.success`
- `login.userRelogin`
- `logsCrashes.failures`
- `me.games`
- `me.modpacks`
- `me.news`
- `me.recentPlay`
- `me.versions`
- `minecraftVersion.empty`
- `minecraftVersion.showAlpha`
- `mod.deletion`
- `mod.deletionHint`
- `mod.deletionRestHint`
- `mod.description`
- `mod.hideIncompatible`
- `mod.manage`
- `mod.searchOnCurseforge`
- `mod.searchOnModrinth`
- `mod.showInCurseforge`
- `mod.showInModrinth`
- `mod.switchDefaultSource`
- `mod.toUpdate`
- `modFilter.clear`
- `modInstall.checkUpgrade`
- `modInstall.checkedUpgrade`
- `modInstall.display`
- `modInstall.install`
- `modInstall.installed`
- `modInstall.recommendation`
- `modInstall.searchHint`
- `modInstall.upgrade`
- `modSearch.noLocalModsFound`
- `modSearch.noModsFound`
- `modSearch.noModsInstalled`
- `modSearchType.all`
- `modSearchType.explore`
- `modSearchType.installed`
- `modSearchType.local`
- `modpack.delete.hint`
- `modpack.delete.title`
- `modpack.emitMcbbs`
- `modpack.general`
- `modpack.includeAssets`
- `modpack.includeLibraries`
- `modpack.overrides`
- `modpack.projectNoChanges`
- `modpack.projectUnsavedChanges`
- `modpack.publish`
- `modpack.publishExistingProject`
- `modpack.publishIconHint`
- `modpack.publishLogin`
- `modpack.publishModrinth`
- `modpack.publishProjectDetailsTab`
- `modpack.publishProjectRequired`
- `modpack.publishVersionTab`
- `modpack.showFile`
- `modpack.showInCurseforge`
- `modpack.showInFtb`
- `modpack.showInModrinth`
- `modrinth.browseUrl`
- `modrinth.copyTitle`
- `modrinth.environments.client`
- `modrinth.environments.default`
- `modrinth.environments.server`
- `modrinth.headers.status`
- `modrinth.headers.support`
- `modrinth.headers.version`
- `modrinth.licenses.name`
- `modrinth.perPage`
- `modrinth.quickSearch`
- `modrinth.searchText`
- `modrinthCard.projectHint`
- `multiplayer.allowTurn`
- `multiplayer.allowTurnHint`
- `multiplayer.inviteLink`
- `multiplayer.name`
- `multiplayer.sharingNotificationBody`
- `multiplayer.sharingNotificationTitle`
- `name`
- `neoForgedVersion.name`
- `next`
- `no`
- `ok`
- `popular`
- `presence.curseforge`
- `presence.curseforgeProject`
- `presence.modrinth`
- `presence.version`
- `previous`
- `refresh`
- `refreshResource`
- `remove`
- `resourcepack.available`
- `resourcepack.import`
- `resourcepack.independent`
- `resourcepack.manage`
- `resourcepack.noLocalPacksFound`
- `resourcepack.noPacks`
- `resourcepack.noPacksInstalled`
- `resourcepack.search`
- `resourcepack.searchOnCurseforge`
- `resourcepack.searchOnModrinth`
- `resourcepack.selectSearchHint`
- `resourcepack.shared`
- `resourcepack.showInCurseforge`
- `save.cheat`
- `save.chunkSelectMode`
- `save.copy.cancel`
- `save.copy.confirm`
- `save.copy.description`
- `save.copy.name`
- `save.copy.title`
- `save.copyFrom.cancel`
- `save.copyFrom.confirm`
- `save.copyFrom.description`
- `save.copyFrom.from`
- `save.copyFrom.fromProfile`
- `save.copyFrom.fromResource`
- `save.copyFrom.title`
- `save.datapack.imported`
- `save.detail`
- `save.import`
- `save.importMessage`
- `save.importTitle`
- `save.loadMap`
- `save.manage`
- `save.mapError`
- `save.mapInfo`
- `save.mapLoaded`
- `save.mapPreview`
- `save.noLocalSavesFound`
- `save.noSavesFound`
- `save.openFolder`
- `save.panMode`
- `save.searchHint`
- `save.searchSaves`
- `save.useMouseRotate`
- `save.useScrollZoom`
- `screenshots.goto`
- `screenshots.name`
- `screenshots.openFolder`
- `server.acceptingMinecraftVersion`
- `server.boundUpstream`
- `server.expectedVersions`
- `server.exportOption`
- `server.exportSSHAuthenticationFailed`
- `server.exportSSHOptions`
- `server.filterVersion`
- `server.hostRequired`
- `server.ipAddress`
- `server.name`
- `server.pings`
- `server.recommendedMinecraftVersion`
- `server.remoteAdmin`
- `server.remoteLog`
- `server.remoteRunInstall`
- `server.remoteService`
- `server.remoteServiceName`
- `server.remoteServiceNameHint`
- `server.remoteStartCommand`
- `server.remoteStopWatchLog`
- `server.remoteUninstallConfirmMessage`
- `server.remoteWatchLog`
- `server.remoteWorldAlways`
- `server.remoteWorldDeployment`
- `server.remoteWorldDeploymentHint`
- `server.remoteWorldFirstInstall`
- `server.remoteWorldNever`
- `server.remoteWorldWillDeploy`
- `server.status`
- `server.versionHint`
- `setting.aiAgentApiKeyNotNeeded`
- `setting.aiAgentApiKeyNotNeededHint`
- `setting.aiAgentApiKeyPlaceholder`
- `setting.aiAgentCustom`
- `setting.allowPrerelease`
- `setting.allowPrereleaseDescription`
- `setting.autoDownload`
- `setting.autoDownloadDescription`
- `setting.autoInstallOnAppQuit`
- `setting.autoInstallOnAppQuitDescription`
- `setting.backgroundImageBlur`
- `setting.backgroundImageBlurDescription`
- `setting.backgroundImageSelect`
- `setting.backgroundVideoSelect`
- `setting.blurAppBar`
- `setting.blurMainBody`
- `setting.blurMainBodyDescription`
- `setting.blurSidebar`
- `setting.colorTheme.secondaryColor`
- `setting.customCss.globalToggle`
- `setting.hideNewsHeader`
- `setting.importSettingsHint`
- `setting.layoutDescription`
- `setting.layoutTitle`
- `setting.linuxEnableDedicatedGPUOptimization`
- `setting.linuxEnableDedicatedGPUOptimizationDescription`
- `setting.manualUpdateHint`
- `setting.newsPosition`
- `setting.resetAllSettingsSuccess`
- `setting.resetSettingsError`
- `setting.settingsExported`
- `setting.settingsImportError`
- `setting.settingsImported`
- `setting.settingsReloadHint`
- `setting.showNewsHeader`
- `setup.defaultLayoutDescription`
- `setup.focusLayoutDescription`
- `setup.game.description`
- `setup.game.name`
- `setup.title`
- `shaderPack.deletion`
- `shaderPack.deletionHint`
- `shaderPack.manage`
- `shaderPack.market`
- `shaderPack.noLocalPacksFound`
- `shaderPack.noPacks`
- `shaderPack.noPacksInstalled`
- `shaderPack.search`
- `shaderPack.selectSearchHint`
- `shared.accept`
- `sortBy.name`
- `store.explore`
- `store.popular`
- `store.recentUpdated`
- `summery`
- `tag.create`
- `tag.createSelected`
- `tag.newTag`
- `theme.title`
- `tutorial.done`
- `tutorial.helpDescription`
- `tutorial.hideNewsHeaderDescription`
- `tutorial.instanceSelectDescription`
- `tutorial.mod.defaultSourceDescription`
- `tutorial.mod.defaultSourceTitle`
- `tutorial.recentPlayDescription`
- `tutorial.storeSearchResultDescription`
- `tutorial.tooltip`
- `universalDrop.enableModsAfterImport`
- `universalDrop.start`
- `universalDrop.title`
- `update.goOfficialWebDownload`
- `upstream.missingModpackMetadata`
- `user.accessToken`
- `user.authService`
- `user.birth`
- `user.challenges`
- `user.email`
- `user.forgetChallenges`
- `user.id`
- `user.info`
- `user.insecureClient`
- `user.nameHint`
- `user.profile`
- `user.refreshAccount`
- `user.refreshSkin`
- `user.submitChallenges`
- `userCape.description`
- `userService.authLibInjector`
- `userService.validateHint`
- `userServices.microsoft.fastLogin`
- `userSkin.all`
- `userSkin.currentSkin`
- `userSkin.manage`
- `userSkin.mySkins`
- `userSkin.officialPreset`
- `userSkin.presets`
- `userSkin.save`
- `userSkin.skinType`
- `userSkin.urlOrPlayerHint`
- `userSkin.useSlim`
- `yes`

## Diagnósticos preexistentes de otros idiomas

| Idioma | Clave | Diagnóstico |
|---|---|---|
| ar | `downloadUpdate.name` | placeholders: Placeholder mismatch (extra: version) |
| ar-EG | `downloadUpdate.name` | placeholders: Placeholder mismatch (extra: version) |
| bn | `downloadUpdate.name` | placeholders: Placeholder mismatch (extra: version) |
| de | `downloadUpdate.name` | placeholders: Placeholder mismatch (extra: version) |
| en-IN | `downloadUpdate.name` | placeholders: Placeholder mismatch (extra: version) |
| fr | `downloadUpdate.name` | placeholders: Placeholder mismatch (extra: version) |
| gl | `downloadUpdate.name` | placeholders: Placeholder mismatch (extra: version) |
| hi | `downloadUpdate.name` | placeholders: Placeholder mismatch (extra: version) |
| hu | `downloadUpdate.name` | placeholders: Placeholder mismatch (extra: version) |
| id | `downloadUpdate.name` | placeholders: Placeholder mismatch (extra: version) |
| it-IT | `downloadUpdate.name` | placeholders: Placeholder mismatch (extra: version) |
| ja-JP | `downloadUpdate.name` | placeholders: Placeholder mismatch (extra: version) |
| ko | `downloadUpdate.name` | placeholders: Placeholder mismatch (extra: version) |
| kz | `downloadUpdate.name` | placeholders: Placeholder mismatch (extra: version) |
| lolcat | `downloadUpdate.name` | placeholders: Placeholder mismatch (extra: version) |
| nl | `downloadUpdate.name` | placeholders: Placeholder mismatch (extra: version) |
| pl | `downloadUpdate.name` | placeholders: Placeholder mismatch (extra: version) |
| pt-BR | `downloadUpdate.name` | placeholders: Placeholder mismatch (extra: version) |
| ru | `downloadUpdate.name` | placeholders: Placeholder mismatch (extra: version) |
| sa | `downloadUpdate.name` | placeholders: Placeholder mismatch (extra: version) |
| ta | `downloadUpdate.name` | placeholders: Placeholder mismatch (extra: version) |
| tr | `downloadUpdate.name` | placeholders: Placeholder mismatch (extra: version) |
| uk | `downloadUpdate.name` | placeholders: Placeholder mismatch (extra: version) |
| vi | `downloadUpdate.name` | placeholders: Placeholder mismatch (extra: version) |
| zh-CN | `downloadUpdate.name` | placeholders: Placeholder mismatch (extra: version) |
| zh-HK | `downloadUpdate.name` | placeholders: Placeholder mismatch (extra: version) |
| zh-TW | `downloadUpdate.name` | placeholders: Placeholder mismatch (extra: version) |
| ar | `modInstall.recommendation` | placeholders-missing: Translation omits placeholders: second |
| ar-EG | `modInstall.recommendation` | placeholders-missing: Translation omits placeholders: second |
| bn | `modInstall.recommendation` | placeholders-missing: Translation omits placeholders: second |
| de | `modInstall.recommendation` | placeholders-missing: Translation omits placeholders: second |
| en-IN | `modInstall.recommendation` | placeholders-missing: Translation omits placeholders: second |
| fr | `modInstall.recommendation` | placeholders-missing: Translation omits placeholders: second |
| gl | `modInstall.recommendation` | placeholders-missing: Translation omits placeholders: second |
| hi | `modInstall.recommendation` | placeholders-missing: Translation omits placeholders: second |
| hu | `modInstall.recommendation` | placeholders-missing: Translation omits placeholders: second |
| id | `modInstall.recommendation` | placeholders-missing: Translation omits placeholders: second |
| it-IT | `modInstall.recommendation` | placeholders-missing: Translation omits placeholders: second |
| ja-JP | `modInstall.recommendation` | placeholders-missing: Translation omits placeholders: second |
| ko | `modInstall.recommendation` | placeholders-missing: Translation omits placeholders: second |
| kz | `modInstall.recommendation` | placeholders-missing: Translation omits placeholders: second |
| lolcat | `modInstall.recommendation` | placeholders-missing: Translation omits placeholders: second |
| nl | `modInstall.recommendation` | placeholders-missing: Translation omits placeholders: second |
| pl | `modInstall.recommendation` | placeholders-missing: Translation omits placeholders: second |
| pt-BR | `modInstall.recommendation` | placeholders-missing: Translation omits placeholders: second |
| ru | `modInstall.recommendation` | placeholders-missing: Translation omits placeholders: second |
| sa | `modInstall.recommendation` | placeholders-missing: Translation omits placeholders: second |
| ta | `modInstall.recommendation` | placeholders-missing: Translation omits placeholders: second |
| tr | `modInstall.recommendation` | placeholders-missing: Translation omits placeholders: second |
| uk | `modInstall.recommendation` | placeholders-missing: Translation omits placeholders: second |
| vi | `modInstall.recommendation` | placeholders-missing: Translation omits placeholders: second |
| zh-CN | `modInstall.recommendation` | placeholders-missing: Translation omits placeholders: second |
| zh-HK | `modInstall.recommendation` | placeholders-missing: Translation omits placeholders: second |
| zh-TW | `modInstall.recommendation` | placeholders-missing: Translation omits placeholders: second |
