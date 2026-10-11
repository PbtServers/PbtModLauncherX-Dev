# Independencia de XMCL ? Fase 10

Fecha: 2026-10-10. Rama: `dev/upstream-v1.0.7`. Base: `851f53b81624890cfe5f5f151b10822e765a22b1`. Versi?n p?blica conservada: 1.0.6.

## Resultado y alcance

Se desacoplan los servicios exclusivos de XMCL del arranque y de las funciones locales. Se mantienen los paquetes open source, contratos internos, licencias y cr?ditos de Voxelum. No se eluden suscripciones ni controles de propiedad de Minecraft. Las funciones comerciales que necesitan servidores ajenos no se presentan como implementaciones propias equivalentes.

## Inventario y consecuencias

El inventario complementario `INDEPENDENCIA-XMCL-REFERENCIAS-v1.0.7.json` registra 573 referencias con ruta, l?nea, URL y categor?a; incluye pruebas, documentaci?n y referencias hist?ricas. Las consultas y fragmentos se omiten para no incluir informaci?n sensible. Las referencias textuales conservadas no implican actividad de red. Esta tabla describe los grupos de dependencias y sus consecuencias:

| Archivos / servicio | Prop?sito anterior | Cambio y consecuencia |
| --- | --- | --- |
| `xmcl-runtime/infra/plugins/flights.ts`, Azure `xmcl-core-api.azurewebsites.net` | Configuraci?n remota y experimentos, informaci?n del cliente | Configuraci?n local fija; no consulta ni utiliza el cach? remoto previo. Archivo de cach? conservado. |
| `xmcl-runtime/infra/plugins/telemetry.ts`, `telemetry_resource.ts`, `xmcl-electron-app/main/pluginMultiplayer.ts` / Azure Monitor | Telemetr?a de sesiones, descargas y multijugador | Exportadores no inicializados, IPC de telemetr?a conserva respuestas sin env?o; telemetr?a multijugador desactivada. Se conservan logs locales. |
| `xmcl-runtime/xmclAccount/XmclAccountService.ts`, `XmclAccountPanel.vue` / cuentas y facturaci?n XMCL | OAuth de XMCL, suscripciones, checkout y restauraci?n de cuenta | No restaura credenciales ni inicia OAuth; panel informa de la pol?tica local. Secretos anteriores conservados sin lectura ni borrado. Servicios y tipos internos conservados por compatibilidad. |
| `xmcl-runtime/agent/AgentService.ts`, `providerProtocol.ts`, UI `composables/agent/local.ts` / `ai.xmcl.app` | Proveedor de IA integrado sujeto a cuenta | Proveedor propio expl?cito; servidor local compatible con OpenAI puede funcionar sin clave. Proveedor remoto sigue necesitando su clave leg?tima guardada en el almac?n existente. Nuevo transporte virtual `agent.runtime` evita confundir IPC con una llamada a XMCL; constantes hist?ricas conservadas. No se instala un modelo local ni se garantiza disponibilidad de un proveedor no configurado. |
| `xmcl-electron-app/main/localMultiplayerPolicy.ts`, `pluginMultiplayer.ts`, vistas Multiplayer | Salas, se?alizaci?n, rel?s y cuota comercial | API local no solicita salas ni credenciales TURN. Acceso al multijugador manual sin cuenta XMCL. Salas comerciales y facturaci?n deshabilitadas. No hay servidor propio de se?alizaci?n/TURN: conectividad entre redes/NAT puede necesitar infraestructura adicional autorizada; no est? verificada. |
| `xmcl-runtime/moddb/databaseDownload.ts` / `api.xmcl.app` | Espejo de bases de datos de metadatos | Retirado el espejo exclusivo; conserva descargas p?blicas open source de GitHub y cach? local. Cada intento tiene timeout de 8 s. Sin red algunas correspondencias entre proveedores pueden faltar, sin sustituir la gesti?n de archivos locales. |
| `xmcl-runtime/elyby/ElyByService.ts` / metadatos v?a XMCL | Actualizaci?n de informaci?n auxiliar de Ely.by | No consulta XMCL; conserva informaci?n local/embebida. No se cambian credenciales ni contratos del proveedor p?blico. |
| `xmcl-keystone-ui/src/composables/launcherNews.ts`, `util/launcherReleaseNews.ts` / noticias XMCL | Noticias con par?metros del equipo | Releases p?blicas de PbtServers en GitHub, sin par?metros del equipo ni token XMCL; petici?n opcional con timeout. Filtra releases ajenas y borradores. |
| `SettingUpdateInfoDialog.vue` / releases upstream | Enlaces p?blicos de actualizaci?n | Apunta a PbtServers. Los feeds de Electron y DeskGap ya eran propios; se mantienen contratos, firmas y verificaciones. La pol?tica rechaza releases del launcher upstream como fuente de actualizaci?n. |
| `user/pluginOfficialUserApi.ts` / callback XMCL | Callback remoto alternativo de Microsoft | Callback localhost existente; elimina alternativa remota inaccesible. OAuth oficial, secretos y comprobaciones de propiedad permanecen. |
| `app/LauncherApp.ts`, `LauncherProtocolHandler.ts`, `network/NetworkAgent.ts`, ElectronLauncherApp/Session y DeskGap launcherApp | Transporte general | Pol?tica central bloquea dominios XMCL exclusivos y releases del launcher upstream. Se aplica a fetch, dispatcher y protocolos renderer; vuelve a comprobar destinos reescritos. No equivale a un cortafuegos del sistema ni certifica m?dulos de terceros fuera de estos transportes. |

## Funciones locales y APIs conservadas

La gesti?n de instancias, configuraci?n persistente, perfiles, recursos, colecciones, cach?s SQLite, historial local de IA JSONL y exportaci?n/importaci?n local de partidas ya eran locales. Se conservan y no se crean sistemas paralelos de sincronizaci?n. No se implementa sincronizaci?n cloud propia ni copias programadas nuevas.

Permanecen Microsoft/Minecraft/Mojang y las verificaciones leg?timas de propiedad; Modrinth, CurseForge, Forge, NeoForge, Fabric, Quilt, OptiFine y LabyMod conservan sus proveedores autorizados. Permanecen los endpoints de PbtServers. Se conservan datos p?blicos open source de GitHub: bases de datos Voxelum, metadatos Java de `xmcl-static-resource` y cr?ditos de contribuidores. Estos recursos p?blicos no requieren una cuenta XMCL y algunos metadatos auxiliares todav?a dependen de GitHub. Los enlaces documentales y avisos legales no se convierten en llamadas autom?ticas ni se eliminan cr?ditos.

Los identificadores de paquetes, protocolos hist?ricos, directorios y claves del almac?n de secretos se conservan. Las preferencias existentes no se sobrescriben. Branding, Discord, updater propio, espa?ol predeterminado, catal?n y reparaciones de las fases 1?9 permanecen.

## Pruebas y compilaci?n

- 178 tests aprobados, 0 fallidos, 17 archivos de tests. Incluyen bloqueo de nube antes de autorizaci?n y despu?s de reescritura, flights sin red, credenciales antiguas inactivas, proveedor IA local sin clave, transporte virtual completo, configuraci?n persistente, historial local, iconos de instancias, setup, API multijugador local, noticias propias y feeds de actualizaci?n de DeskGap.
- Dos pruebas de descarga de metadatos usan un servidor HTTP temporal local con contenido gzip: son pruebas reales de transporte local, no instalaciones desde proveedores externos.
- Typecheck de runtime API, runtime, Electron/preload, Keystone UI y DeskGap: correctos.
- Lint de runtime API, runtime, Electron, Keystone UI y packages: sin errores. Runtime conserva dos avisos previos de InstanceBlueprint; no se alteran reglas compartidas.
- Validador i18n: espa?ol y catal?n 2430/2430 claves; sin claves ausentes ni errores de sintaxis/interpolaci?n en estos idiomas. Otros idiomas se conservan con 54 diagn?sticos preexistentes.
- Keystone UI: build correcto, comprobaci?n de bundle sin hu?rfanos en 103 chunks.
- Electron y DeskGap: compilaci?n intentada, bloqueada por `uv_os_get_passwd returned ENOMEM` al cargar herramientas. Error ambiental reproducible con `node:os.userInfo()` sin cargar el launcher. No se afirma que estos bundles hayan compilado.
- La suite adicional CollectionService no pudo cargarse por el mismo error ambiental de `atomically`; no est? incluida en los 178 tests aprobados.
- CLI oficial de DevTools bloqueado por ENOMEM antes de conectar. No se ha validado visualmente el flujo completo en la aplicaci?n de desarrollo, ni un arranque instalado real sin XMCL, ni conectividad LAN/NAT real, ni descargas/instalaciones reales desde todos los proveedores. Son validaciones pendientes; los mocks no sustituyen esas pruebas.
- Logs de ejecuci?n: `temp/phase10-final-*.log`, `phase10-final-lint-*.log`, `phase10-extra-*.log`, `phase10-build-*.log` y `phase10-devtools.log`.

## Git, protecci?n y limitaciones

Git no puede crear `.git/index.lock`: `Permission denied`. El sandbox de Windows utiliza un SID restringido que encuentra una ACE DENY de escritura en `.git`; la inclusi?n de esa ruta entre las permitidas no elimina la denegaci?n efectiva. No se eliminan locks ni se modifican ACL, permisos o antivirus. No hay commit nuevo desde Codex. HEAD, master y backup permanecen intactos.

Se prepara `temp/phase10-preservacion-20261010.zip`, manifiesto SHA-256 y parche binario. El ZIP incluye todos los archivos nuevos y modificados; cada entrada se verifica contra tama?o y SHA-256 del original. El parche contiene diferencias de archivos seguidos; los nuevos est?n en ZIP y manifiesto. No se requiere restaurar ni sobrescribir nada para confirmar los archivos presentes desde PowerShell normal.

Comando manual (ejecutar en el repositorio, solo despu?s de revisar los cambios):

```powershell
if ((git branch --show-current) -ne 'dev/upstream-v1.0.7') { throw 'Rama incorrecta' }; $phase10Files = (Get-Content 'temp/phase10-preservacion-20261010.manifest.json' -Raw | ConvertFrom-Json).files.path; git add -- $phase10Files; if ($LASTEXITCODE -eq 0) { git commit -m 'feat(independence): replace XMCL cloud dependencies with local and PbtServers services' }
```

## Archivos de la fase

- `PbtModLauncherX-Data/Modificaciones/INDEPENDENCIA-XMCL-REFERENCIAS-v1.0.7.json`
- `deskgap-app/src/launcherApp.ts`
- `xmcl-electron-app/main/ElectronLauncherApp.ts`
- `xmcl-electron-app/main/ElectronSession.ts`
- `xmcl-electron-app/main/localMultiplayerPolicy.test.ts`
- `xmcl-electron-app/main/localMultiplayerPolicy.ts`
- `xmcl-electron-app/main/pluginMultiplayer.ts`
- `xmcl-keystone-ui/locales/ca.yaml`
- `xmcl-keystone-ui/locales/en.yaml`
- `xmcl-keystone-ui/locales/es-ES.yaml`
- `xmcl-keystone-ui/src/components/XmclAccountPanel.vue`
- `xmcl-keystone-ui/src/composables/agent/local.ts`
- `xmcl-keystone-ui/src/composables/launcherNews.ts`
- `xmcl-keystone-ui/src/composables/multiplayerEntry.test.ts`
- `xmcl-keystone-ui/src/composables/multiplayerEntry.ts`
- `xmcl-keystone-ui/src/util/launcherReleaseNews.test.ts`
- `xmcl-keystone-ui/src/util/launcherReleaseNews.ts`
- `xmcl-keystone-ui/src/views/Multiplayer.vue`
- `xmcl-keystone-ui/src/views/MultiplayerDesktop.vue`
- `xmcl-keystone-ui/src/views/SettingUpdateInfoDialog.vue`
- `xmcl-runtime-api/index.ts`
- `xmcl-runtime-api/src/entities/servicePolicy.test.ts`
- `xmcl-runtime-api/src/entities/servicePolicy.ts`
- `xmcl-runtime-api/src/services/AgentService.ts`
- `xmcl-runtime/agent/AgentService.test.ts`
- `xmcl-runtime/agent/AgentService.ts`
- `xmcl-runtime/agent/pluginAgentProtocol.test.ts`
- `xmcl-runtime/agent/providerProtocol.ts`
- `xmcl-runtime/app/LauncherApp.ts`
- `xmcl-runtime/app/LauncherProtocolHandler.test.ts`
- `xmcl-runtime/app/LauncherProtocolHandler.ts`
- `xmcl-runtime/elyby/ElyByService.ts`
- `xmcl-runtime/infra/plugins/flights.independence.test.ts`
- `xmcl-runtime/infra/plugins/flights.ts`
- `xmcl-runtime/infra/plugins/telemetry.ts`
- `xmcl-runtime/moddb/databaseDownload.test.ts`
- `xmcl-runtime/moddb/databaseDownload.ts`
- `xmcl-runtime/network/NetworkAgent.ts`
- `xmcl-runtime/user/pluginOfficialUserApi.ts`
- `xmcl-runtime/xmclAccount/XmclAccountService.test.ts`
- `xmcl-runtime/xmclAccount/XmclAccountService.ts`
- `PbtModLauncherX-Data/Modificaciones/INDEPENDENCIA-XMCL-v1.0.7.md`
