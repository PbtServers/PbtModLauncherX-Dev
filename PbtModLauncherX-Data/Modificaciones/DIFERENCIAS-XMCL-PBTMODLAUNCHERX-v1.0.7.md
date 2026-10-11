# Diferencias XMCL / PbtModLauncherX 1.0.7 y documentación de Fase 14

Fecha de auditoría: 2026-10-10. No es fecha de lanzamiento.

## Referencias y método

- Original: https://github.com/Voxelum/x-minecraft-launcher
- Original fijo: `0379941d1997e92b079fdc21e8692c8e45cd8cd7`.
- Derivado: https://github.com/PbtServers/PbtModLauncherX-Dev
- Derivado fijo previo a documentación: `7e6ce52b0b018e660fa4f589cb7f969febc828b2`, rama `dev/upstream-v1.0.7`.
- Fases 11, 12 y 13 confirmadas: db1f5706, 010707b2 y 7e6ce52b, respectivamente. Árbol inicialmente limpio.

Se compara el árbol final con ese upstream mediante `git diff --name-status <upstream> <fork>` y `git diff --stat`; se comprueba que upstream es ancestro del fork y se consultan informes de fases y código representativo. No se equipara diferencia textual con autoría ni se comparan ramas master cambiantes. El inventario final reproduce todas las rutas diferentes entre esos dos commits, incluidas documentación histórica, recursos y pruebas; no incluye los tres entregables nuevos de esta fase. El gran volumen de líneas incluye inventarios/documentos generados y no es una medida de funcionalidades nuevas.

El diff de árboles contiene 468 rutas, 128060 inserciones y 5871 eliminaciones. `git rev-list --count <upstream>..<fork>` devuelve 108 commits exclusivos de la referencia comparada: incluye historia propia y merges; no significa 108 correcciones implementadas en estas fases.

## Código heredado e integración

Instancias, versiones, instalación Minecraft/loaders, gestión de recursos/modpacks, IPC, UI Vue, contratos API, bibliotecas packages, Electron y host DeskGap son bases del upstream. También existe infraestructura de agentes, conversaciones y documentos en el upstream fijo (`xmcl-runtime/agent/AgentService.ts`, `xmcl-keystone-ui/src/composables/agent/prompt.ts`): PbtAdmin adapta esa base, no crea desde cero todos esos sistemas.

La integración conserva arquitectura moderna e historial. No se renombra globalmente @xmcl, imports, APIs, protocolos ni namespaces persistentes. El detalle del merge y conflictos históricos se encuentra en [INTEGRACION-UPSTREAM-v1.0.7.md](INTEGRACION-UPSTREAM-v1.0.7.md), no se atribuye al fork todo cambio que upstream ya había realizado.

## Diferencias propias y evidencias

| Área | Adaptación / archivos representativos | Alcance y límite |
|---|---|---|
| Branding y comunidad | Electron metadata/icons, locales, Discord Application ID propio 1213977247514361856 | PbtModLauncherX/PbtServers, PbtinaDev; no modifica iconos en Fase 14 ni elimina licencias |
| Idiomas | locales es-ES/ca, entidades locale, composables de idioma | Español predeterminado, preferencias existentes conservadas, paridad automatizada; otros idiomas upstream permanecen |
| Loaders | runtime/install, packages/installer y tests de metadatos/selección | Correcciones específicas, no reimplementación de todos los instaladores; descarga/lanzamiento real pendiente |
| 26.x | versionSelection y minecraft26Catalog, filtros proveedores | Versiones exactas y NeoForge; no mapea 26.1 a 1.21.11 |
| Shaders | composables shaderSupport/shaderPackStatus, metadatos locales | Iris/Oculus/OptiFine según loader compatible; integración visual pendiente |
| Iconos/GIF | runtime/instance/instanceIcon, instanceGif, UI instanceIconImage | Validación, persistencia, URLs y movimiento reducido; no se afirma animación visual observada |
| Primer inicio | runtime/app/initialSetup y host IPC | Guardado/confirmación, reintento y esperas limitadas; primera instalación real pendiente |
| Independencia | LauncherProtocolHandler, XmclAccountService, telemetry/flights/network | Bloquea servicios exclusivos y sustituye capacidades locales/propias; no elude propiedad Minecraft |
| IA independiente | AgentService, agent localProviders/tools y settings | Ollama predeterminado, proveedores personales, consentimiento y almacenamiento seguro; pruebas mayormente mocks |
| PbtAdmin | agent prompt/documents y Data/PbtAdmin/knowledge | Identidad, creadora en femenino, búsqueda local/fuentes y ficción diferenciada |
| Servidores | runtime/instanceIO/serverExport*, AppServerExportDialog | ZIP dedicado, recetas oficiales y scripts, Quilt manual; servidores reales pendientes |
| Clasificación | serverModClassification/serverModDecisions, ModServerColumns | Tipo/Servidor independientes, versiones/evidencias/dependencias, overrides sin cambiar metadatos; SSR no es validación visual |
| Updater/versionado | Electron updatePolicy/updateDownload/updater, DeskGap updateFeed, build/releasePolicy | Feeds propios, hashes, control de plataforma/canal, paquete completo, datos preservados; firma/upgrade real pendientes |
| Build/workflows | electron-builder config, workflows y paquetes | Metadatos propios/plataformas declaradas, sin inferir releases ni builds ejecutados |

## Servicios, privacidad y límites legales

Fuentes de actualización existentes: raw.githubusercontent.com/PbtServers/PbtModLauncherX-Dev/master/latest_version.json, API GitHub de releases del mismo repositorio, assets propios y enlace manual https://mods.pbtservers.com. No se añade endpoint ni se usa release XMCL para instalar este fork. `latest_version.json` sigue describiendo v1.0.6: no se anuncia una release 1.0.7 inexistente.

Se conservan Microsoft/Minecraft/Mojang, Modrinth, CurseForge, Forge/NeoForge/Fabric/Quilt y PbtServers cuando corresponde. Ollama localhost no exige suscripción XMCL; proveedores externos son opcionales y pueden cobrar por sus APIs. Offline local no equivale a omitir autenticación legítima ni garantiza descargas sin conexión. Menos conexiones XMCL no significa que toda función carezca de tráfico externo.

Logs y documentos son datos no confiables; modelos no autorizan ejecución arbitraria. Modificaciones requieren aprobación/vista previa. La clasificación conserva evidencias y overrides. ZIP rechaza traversal/symlinks y secretos detectados, pero requiere revisión humana de configuraciones arbitrarias.

LICENSE es MIT, conserva copyright de ci010. Se mantienen atribuciones Voxelum y licencias por paquetes, mods/Minecraft y terceros; no se reclama autoría del código heredado. EULA de Minecraft se acepta manualmente, no mediante exportador. No se certifican licencias de cualquier modpack ni se inventan certificados productivos.

## Auditoría de instrucciones históricas

- Dos iconos comprobados en disco, rutas relativas usadas y dimensiones de cabecera equilibradas; no se modifican bytes.
- Sin .gitmodules ni gitlinks en el HEAD: clone --recurse-submodules se conserva y se explica la alternativa sin la opción.
- Node >=22.16.0, pnpm 11.10.0, Electron 43.5.0 según package.json. Python 3.13.13 detectado; mínimo no fijado globalmente. electron-rebuild/nativos no implican instalar todo globalmente.
- La [documentación oficial node-gyp](https://github.com/nodejs/node-gyp#installation) confirma toolchains por SO; se retira Chocolatey/setuptools como pasos universales obligatorios. No se instalan herramientas del sistema en Fase 14.
- dev:renderer/dev:main existen. npm run sigue resolviendo scripts, pero estos invocan pnpm: README recomienda pnpm y dos terminales, sin asumir arranque real.
- build:renderer genera UI dist; compile Electron genera dist con renderer copiado. build:all activa targets del host, no los tres SO a la vez. build sin variables especiales usa modo directorio. Salida Electron build/output; DeskGap dist y package con tres entradas fijadas, solo Windows x64.
- Linux libarchive-tools está en workflow Ubuntu; no se presenta como receta universal probada. macOS Command Line Tools es requisito documentado de node-gyp, no comprobación realizada aquí.
- Postinstall puede generar configuración local y preparar/ajustar herramientas de empaquetado. No se copian valores de claves al informe ni se ejecuta una instalación limpia para esta modificación documental.

## Validaciones de Fase 14

Se vuelven a ejecutar tareas con pnpm JS disponible y Node 22. Para tareas raíz, se usa únicamente el adaptador temporal por proceso validado en Fase 13 que evita un pnpm anidado/Node 20 con EPERM en perfil 8.3. No se modifica política, packageManager, lockfile ni configuración compartida.

| Comando | Clasificación |
|---|---|
| pnpm install --frozen-lockfile | NO EJECUTADO: checkout ya tiene dependencias; no se valida bootstrap limpio |
| pnpm check / pnpm lint | VERIFICADO con adaptador temporal; cero errores, dos avisos previos de runtime |
| pnpm build:renderer | VERIFICADO, verify-bundle sin huérfanos |
| Tests releaseMetadata/pluginCommonProtocol/updateDownload | VERIFICADO, resultados registrados al final |
| Electron compile / pnpm build:all / DeskGap build / dev:main | BLOQUEADO POR ENTORNO, ENOMEM en importación tsx |
| os.userInfo aislado y CLI DevTools | BLOQUEADO POR ENTORNO; error reproducido sin cargar launcher |
| dev:renderer | NO EJECUTADO; script comprobado, no se inicia servidor duplicado/innecesario mientras main falla |
| Paquete/instalador Windows y validación visual | NO EJECUTADO después del bloqueo; ningún instalador nuevo inspeccionado |
| Build/ejecución Linux y macOS | NO EJECUTADO, no se simula un host nativo desde Windows |

Los resultados de Fase 13 se conservan: batería amplia FALLIDA con 2930 aprobados, 43 fallidos y 23 omitidos, además de seis suites sin carga; repeticiones aisladas pasan, pero no sustituyen una batería completa limpia. UI build y typechecks no prueban primer inicio, streaming Ollama real, servidores listos, GIF visual ni actualización instalada completa. Ollama no estaba disponible; Mojang/Fabric recibían EACCES. La versión no se presenta como estable.

Logs actuales: temp/phase14-*.log y phase14-results.json. No se usan credenciales personales ni se publican capturas, releases o paquetes. Las fuentes públicas consultadas incluyen repositorios oficiales del fork/upstream, node-gyp y la página de descarga Ollama; su acceso no verifica instaladores/producto. Enlaces Git locales nuevos pueden no estar publicados.

## Conocimientos y pruebas pendientes

Primera instalación/reinicio/offline/sin Java reales, compilación host e instaladores, interfaces en ventana real, upgrade 1.0.6 → 1.0.7, servidores/loader/Create reales, Ollama/modelo real y arquitectura/SO de distribución. Pendientes también confianza de firma/publicadores, auditoría CVE completa y reproducción de limpieza bajo carga. No se inventan fechas históricas de personajes/network ni fechas de lanzamiento.

## Entregables y Git

Únicamente README.md, CHANGELOG.md y este informe. Versiones, funcionalidad, iconos, licencia, master y backup permanecen sin cambios. Se comprueban enlaces locales, anclas, badges y referencias en femenino. No se hace push ni se crea release/tag.

Si el intento Git devuelve Permission denied al crear .git/index.lock, se preservan estos tres archivos en temp/phase14-preservacion-20261010.{zip,manifest.json,patch}, con SHA-256 y verificación del ZIP; el parche incluye nuevos. No se alteran ACL ni se borran locks. El comando manual, desde la raíz:

```powershell
if ((git branch --show-current) -ne 'dev/upstream-v1.0.7') { throw 'Rama incorrecta' }; $phase14Files = (Get-Content 'temp/phase14-preservacion-20261010.manifest.json' -Raw | ConvertFrom-Json).files.path; git add -- $phase14Files; if ($LASTEXITCODE -eq 0) { git commit -m 'docs: renew PbtModLauncherX README changelog and pinned XMCL comparison' }
```

## Inventario completo de diferencias de los árboles fijados

La lista siguiente se genera exclusivamente con git diff --name-status entre los dos SHA declarados. M = modificado, A = añadido, D = eliminado. Describe el estado comparado, no acciones de eliminación de esta fase.

```text
M	.github/actions/patch-release-note/index.js
M	.github/signpath/deskgap-exe.xml
M	.github/skills/chrome-devtools-cli/SKILL.md
M	.github/workflows/build.yml
M	.github/workflows/core-github-pages.yml
M	.github/workflows/core-release.yml
D	.github/workflows/deploy-release.yml
D	.github/workflows/deploy-ui.yml
M	.github/workflows/sign-release.yml
D	.github/workflows/validate.yml
M	.vscode/launch.json
M	.zed/tasks.json
M	AGENTS.md
A	PbtModLauncherX-Data/Modificaciones/AUDITORIA-v1.0.7.md
A	PbtModLauncherX-Data/Modificaciones/COMPATIBILIDAD-MINECRAFT-26X-v1.0.7.md
A	PbtModLauncherX-Data/Modificaciones/EXPORTACION-SERVIDOR-v1.0.7.md
A	PbtModLauncherX-Data/Modificaciones/INDEPENDENCIA-XMCL-REFERENCIAS-v1.0.7.json
A	PbtModLauncherX-Data/Modificaciones/INDEPENDENCIA-XMCL-v1.0.7.md
A	PbtModLauncherX-Data/Modificaciones/INTEGRACION-UPSTREAM-v1.0.7.md
A	PbtModLauncherX-Data/Modificaciones/PBTADMIN-IA-LOCAL-v1.0.7.md
A	PbtModLauncherX-Data/Modificaciones/PBTADMIN-LORE-v1.0.7.md
A	PbtModLauncherX-Data/Modificaciones/REBRANDING-v1.0.7.md
A	PbtModLauncherX-Data/Modificaciones/RECUPERACION-FASE9-v1.0.7.md
A	PbtModLauncherX-Data/Modificaciones/REPARACION-ICONOS-INSTANCIAS-v1.0.7.md
A	PbtModLauncherX-Data/Modificaciones/REPARACION-MOD-LOADERS-v1.0.7.md
A	PbtModLauncherX-Data/Modificaciones/REPARACION-PRIMER-INICIO-v1.0.7.md
A	PbtModLauncherX-Data/Modificaciones/REPARACION-SHADERS-v1.0.7.md
A	PbtModLauncherX-Data/Modificaciones/Registro-Archivos.txt
A	PbtModLauncherX-Data/Modificaciones/TRADUCCIONES-v1.0.7.md
A	PbtModLauncherX-Data/Modificaciones/VALIDACION-FINAL-v1.0.7.md
A	PbtModLauncherX-Data/Modificaciones/VERIFICACION-GIF-ICONOS-v1.0.7.md
A	PbtModLauncherX-Data/Modificaciones/VERSIONADO-AUTOUPDATER-v1.0.7.md
A	PbtModLauncherX-Data/Modificaciones/VERSIONADO-REFERENCIAS-v1.0.7.json
A	PbtModLauncherX-Data/PbtAdmin/knowledge/characters.md
A	PbtModLauncherX-Data/PbtAdmin/knowledge/faq.md
A	PbtModLauncherX-Data/PbtAdmin/knowledge/fnf-lore.md
A	PbtModLauncherX-Data/PbtAdmin/knowledge/juand.md
A	PbtModLauncherX-Data/PbtAdmin/knowledge/launcher-history.md
A	PbtModLauncherX-Data/PbtAdmin/knowledge/launcher-support.md
A	PbtModLauncherX-Data/PbtAdmin/knowledge/network-history.md
A	PbtModLauncherX-Data/PbtAdmin/knowledge/servers.md
A	PbtModLauncherX-Data/PbtAdmin/knowledge/sources.json
A	PbtModLauncherX-Data/PbtAdmin/knowledge/troubleshooting.md
A	PbtModLauncherX-Data/Website/css/theme.css
A	PbtModLauncherX-Data/Website/css/theme.min.css
A	PbtModLauncherX-Data/Website/fonts/inter-v12-latin-300.woff
A	PbtModLauncherX-Data/Website/fonts/inter-v12-latin-300.woff2
A	PbtModLauncherX-Data/Website/fonts/inter-v12-latin-500.woff
A	PbtModLauncherX-Data/Website/fonts/inter-v12-latin-500.woff2
A	PbtModLauncherX-Data/Website/fonts/inter-v12-latin-700.woff
A	PbtModLauncherX-Data/Website/fonts/inter-v12-latin-700.woff2
A	PbtModLauncherX-Data/Website/fonts/inter-v12-latin-regular.woff
A	PbtModLauncherX-Data/Website/fonts/inter-v12-latin-regular.woff2
A	PbtModLauncherX-Data/Website/img/abstract12.jpg
A	PbtModLauncherX-Data/Website/img/abstract17.jpg
A	PbtModLauncherX-Data/Website/img/abstract18.jpg
A	PbtModLauncherX-Data/Website/img/abstract2.jpg
A	PbtModLauncherX-Data/Website/img/abstract3.jpg
A	PbtModLauncherX-Data/Website/img/abstract4.jpg
A	PbtModLauncherX-Data/Website/img/abstract6.jpg
A	PbtModLauncherX-Data/Website/img/abstract9.jpg
A	PbtModLauncherX-Data/Website/img/favicon-16x16.png
A	PbtModLauncherX-Data/Website/img/favicon-32x32.png
A	PbtModLauncherX-Data/Website/img/person10.jpg
A	PbtModLauncherX-Data/Website/img/person103.jpg
A	PbtModLauncherX-Data/Website/img/person11.jpg
A	PbtModLauncherX-Data/Website/img/person13.jpg
A	PbtModLauncherX-Data/Website/img/person14.jpg
A	PbtModLauncherX-Data/Website/img/person16.jpg
A	PbtModLauncherX-Data/Website/img/person9.jpg
A	PbtModLauncherX-Data/Website/img/webp/abstract12.webp
A	PbtModLauncherX-Data/Website/img/webp/abstract17.webp
A	PbtModLauncherX-Data/Website/img/webp/abstract18.webp
A	PbtModLauncherX-Data/Website/img/webp/abstract2.webp
A	PbtModLauncherX-Data/Website/img/webp/abstract3.webp
A	PbtModLauncherX-Data/Website/img/webp/abstract4.webp
A	PbtModLauncherX-Data/Website/img/webp/abstract6.webp
A	PbtModLauncherX-Data/Website/img/webp/abstract9.webp
A	PbtModLauncherX-Data/Website/img/webp/favicon-16x16.webp
A	PbtModLauncherX-Data/Website/img/webp/favicon-32x32.webp
A	PbtModLauncherX-Data/Website/img/webp/person10.webp
A	PbtModLauncherX-Data/Website/img/webp/person103.webp
A	PbtModLauncherX-Data/Website/img/webp/person11.webp
A	PbtModLauncherX-Data/Website/img/webp/person13.webp
A	PbtModLauncherX-Data/Website/img/webp/person14.webp
A	PbtModLauncherX-Data/Website/img/webp/person16.webp
A	PbtModLauncherX-Data/Website/img/webp/person9.webp
A	PbtModLauncherX-Data/Website/index.html
A	PbtModLauncherX-Data/Website/js/aos.cjs.js
A	PbtModLauncherX-Data/Website/js/aos.esm.js
A	PbtModLauncherX-Data/Website/js/aos.js
A	PbtModLauncherX-Data/Website/js/bootstrap.bundle.js
A	PbtModLauncherX-Data/Website/js/bootstrap.bundle.js.map
A	PbtModLauncherX-Data/Website/js/bootstrap.bundle.min.js
A	PbtModLauncherX-Data/Website/js/bootstrap.bundle.min.js.map
A	PbtModLauncherX-Data/Website/js/bootstrap.esm.js
A	PbtModLauncherX-Data/Website/js/bootstrap.esm.js.map
A	PbtModLauncherX-Data/Website/js/bootstrap.esm.min.js
A	PbtModLauncherX-Data/Website/js/bootstrap.esm.min.js.map
A	PbtModLauncherX-Data/Website/js/bootstrap.js
A	PbtModLauncherX-Data/Website/js/bootstrap.js.map
A	PbtModLauncherX-Data/Website/js/bootstrap.min.js
A	PbtModLauncherX-Data/Website/js/bootstrap.min.js.map
A	PbtModLauncherX-Data/formato-releases.txt
A	PbtModLauncherX-Data/release-v1.0.6-sha256.txt
A	PbtModLauncherX-Data/release-v1.0.6.md
M	README.md
M	assets/locales.json
M	deskgap-app/build.ts
M	deskgap-app/package.json
M	deskgap-app/packaging.test.ts
M	deskgap-app/packaging.ts
M	deskgap-app/releaseWorkflow.test.ts
M	deskgap-app/src/browser.ts
M	deskgap-app/src/controller.ts
M	deskgap-app/src/launcherApp.ts
M	deskgap-app/src/main.ts
M	deskgap-app/src/migration.ts
M	deskgap-app/src/plugins.ts
M	deskgap-app/src/updateFeed.test.ts
M	deskgap-app/src/updateFeed.ts
M	deskgap-app/src/updater.test.ts
M	deskgap-app/src/updaterHost.ts
A	installer/README.md
M	installer/install.ps1
M	installer/install.sh
A	installer/install.test.ts
A	installer/upstream/install.ps1
A	installer/upstream/install.sh
A	latest_version.json
M	package.json
M	packages/installer/labymod.browser.ts
A	packages/installer/labymod.test.ts
M	packages/installer/labymod.ts
A	packages/installer/modLoaderRegression.test.ts
A	packages/installer/shaderMetadata.test.ts
M	packages/installer/versionInstallManifest.test.ts
M	packages/installer/versionInstallManifest.ts
M	scripts/build-tutorial.ts
D	xmcl-electron-app/CHANGELOG.legacy.md
M	xmcl-electron-app/build.ts
A	xmcl-electron-app/build.ts.bak
M	xmcl-electron-app/build/appinstaller-builder.ts
A	xmcl-electron-app/build/appinstaller-builder.ts.bak
M	xmcl-electron-app/build/appxmanifest.xml
M	xmcl-electron-app/build/electron-builder.config.test.ts
M	xmcl-electron-app/build/electron-builder.config.ts
A	xmcl-electron-app/build/electron-builder.config.ts.bak
M	xmcl-electron-app/build/linux/after-install.tpl
M	xmcl-electron-app/build/linux/after-remove.tpl
M	xmcl-electron-app/build/linux/apparmor-profile.tpl
M	xmcl-electron-app/build/linuxPackageScripts.test.ts
A	xmcl-electron-app/build/releaseMetadata.test.ts
A	xmcl-electron-app/build/releasePolicy.ts
M	xmcl-electron-app/dev.ts
A	xmcl-electron-app/dev.ts.bak
A	xmcl-electron-app/esbuild.config.ts.bak
M	xmcl-electron-app/icons/dark.icns
M	xmcl-electron-app/icons/dark.ico
M	xmcl-electron-app/icons/dark@256x256.png
M	xmcl-electron-app/icons/dark@SmallTile.png
M	xmcl-electron-app/icons/dark@SmallTile.scale-400.png
M	xmcl-electron-app/icons/dark@Square150x150Logo.png
M	xmcl-electron-app/icons/dark@Square150x150Logo.scale-400.png
M	xmcl-electron-app/icons/dark@Square44x44Logo.png
M	xmcl-electron-app/icons/dark@Square44x44Logo.targetsize-256.png
M	xmcl-electron-app/icons/dark@Square44x44Logo.targetsize-256_altform-unplated.png
M	xmcl-electron-app/icons/dark@StoreLogo.png
M	xmcl-electron-app/icons/dark@StoreLogo.scale-400.png
M	xmcl-electron-app/icons/dark@tray.png
M	xmcl-electron-app/icons/light.icns
M	xmcl-electron-app/icons/light.ico
M	xmcl-electron-app/icons/light@256x256.png
M	xmcl-electron-app/icons/light@SmallTile.scale-400_theme-light.png
M	xmcl-electron-app/icons/light@SmallTile.theme-light.png
M	xmcl-electron-app/icons/light@Square150x150Logo.scale-400_theme-light.png
M	xmcl-electron-app/icons/light@Square150x150Logo.theme-light.png
M	xmcl-electron-app/icons/light@Square44x44Logo.targetsize-256_altform-lightunplated.png
M	xmcl-electron-app/icons/light@Square44x44Logo.targetsize-256_theme-light.png
M	xmcl-electron-app/icons/light@Square44x44Logo.theme-light.png
M	xmcl-electron-app/icons/light@StoreLogo.scale-400_theme-light.png
M	xmcl-electron-app/icons/light@StoreLogo.theme-light.png
M	xmcl-electron-app/icons/light@tray.png
M	xmcl-electron-app/main/ElectronController.ts
M	xmcl-electron-app/main/ElectronLauncherApp.ts
M	xmcl-electron-app/main/ElectronSession.ts
M	xmcl-electron-app/main/ServerService.ts
M	xmcl-electron-app/main/agentDocuments.test.ts
A	xmcl-electron-app/main/constant.ts.bak
M	xmcl-electron-app/main/controllers/notification.ts
M	xmcl-electron-app/main/controllers/optifine.ts
M	xmcl-electron-app/main/controllers/optifineSource.test.ts
M	xmcl-electron-app/main/controllers/optifineSource.ts
A	xmcl-electron-app/main/controllers/tray.ts.bak
M	xmcl-electron-app/main/defaultApp.ts
A	xmcl-electron-app/main/defaultApp.ts.bak
M	xmcl-electron-app/main/definedLocales.ts
M	xmcl-electron-app/main/index.dev.ts
A	xmcl-electron-app/main/localMultiplayerPolicy.test.ts
A	xmcl-electron-app/main/localMultiplayerPolicy.ts
A	xmcl-electron-app/main/locales/ca.yaml
M	xmcl-electron-app/main/locales/de.yaml
M	xmcl-electron-app/main/locales/en.yaml
M	xmcl-electron-app/main/locales/es-ES.yaml
M	xmcl-electron-app/main/locales/fr.yaml
M	xmcl-electron-app/main/locales/hu.yaml
M	xmcl-electron-app/main/locales/ja-JP.yaml
M	xmcl-electron-app/main/locales/ko.yaml
M	xmcl-electron-app/main/locales/lolcat.yaml
M	xmcl-electron-app/main/locales/nl.yaml
M	xmcl-electron-app/main/locales/pl.yaml
M	xmcl-electron-app/main/locales/pt-BR.yaml
M	xmcl-electron-app/main/locales/ru.yaml
M	xmcl-electron-app/main/locales/tr.yaml
M	xmcl-electron-app/main/locales/uk.yaml
M	xmcl-electron-app/main/locales/zh-CN.yaml
M	xmcl-electron-app/main/locales/zh-TW.yaml
M	xmcl-electron-app/main/pluginAgentDocuments.ts
A	xmcl-electron-app/main/pluginAutoUpdate.test.ts
M	xmcl-electron-app/main/pluginAutoUpdate.ts
M	xmcl-electron-app/main/pluginMultiplayer.ts
M	xmcl-electron-app/main/utils/i18n.test.ts
M	xmcl-electron-app/main/utils/i18n.ts
M	xmcl-electron-app/main/utils/login.ts
A	xmcl-electron-app/main/utils/releaseMetadata.ts
A	xmcl-electron-app/main/utils/updateDownload.test.ts
A	xmcl-electron-app/main/utils/updateDownload.ts
A	xmcl-electron-app/main/utils/updatePolicy.test.ts
A	xmcl-electron-app/main/utils/updatePolicy.ts
A	xmcl-electron-app/main/utils/updater.test.ts
M	xmcl-electron-app/main/utils/updater.ts
A	xmcl-electron-app/main/utils/updater.ts.bak
A	xmcl-electron-app/main/utils/updater.ts.old
M	xmcl-electron-app/package.json
A	xmcl-electron-app/package.json.bak
M	xmcl-electron-app/postinstall.ts
A	xmcl-electron-app/postinstall.ts.bak
M	xmcl-electron-app/preload/optifine.ts
M	xmcl-keystone-ui/locales/ar-EG.yaml
M	xmcl-keystone-ui/locales/ar.yaml
M	xmcl-keystone-ui/locales/bn.yaml
A	xmcl-keystone-ui/locales/ca.yaml
M	xmcl-keystone-ui/locales/de.yaml
M	xmcl-keystone-ui/locales/en-IN.yaml
M	xmcl-keystone-ui/locales/en.yaml
M	xmcl-keystone-ui/locales/es-ES.yaml
M	xmcl-keystone-ui/locales/fr.yaml
M	xmcl-keystone-ui/locales/gl.yaml
M	xmcl-keystone-ui/locales/hi.yaml
M	xmcl-keystone-ui/locales/hu.yaml
M	xmcl-keystone-ui/locales/id.yaml
M	xmcl-keystone-ui/locales/it-IT.yaml
M	xmcl-keystone-ui/locales/ja-JP.yaml
M	xmcl-keystone-ui/locales/ko.yaml
M	xmcl-keystone-ui/locales/kz.yaml
M	xmcl-keystone-ui/locales/lolcat.yaml
M	xmcl-keystone-ui/locales/nl.yaml
M	xmcl-keystone-ui/locales/pl.yaml
M	xmcl-keystone-ui/locales/pt-BR.yaml
M	xmcl-keystone-ui/locales/ru.yaml
M	xmcl-keystone-ui/locales/sa.yaml
M	xmcl-keystone-ui/locales/ta.yaml
M	xmcl-keystone-ui/locales/tr.yaml
M	xmcl-keystone-ui/locales/uk.yaml
M	xmcl-keystone-ui/locales/vi.yaml
M	xmcl-keystone-ui/locales/zh-CN.yaml
M	xmcl-keystone-ui/locales/zh-HK.yaml
M	xmcl-keystone-ui/locales/zh-TW.yaml
M	xmcl-keystone-ui/package.json
M	xmcl-keystone-ui/scripts/i18n-core.test.mjs
M	xmcl-keystone-ui/scripts/import-modpack-locales.test.mjs
A	xmcl-keystone-ui/scripts/validate-translations.mjs
A	xmcl-keystone-ui/scripts/validate-translations.test.mjs
A	xmcl-keystone-ui/src/assets/pbtmodlauncherx.png
M	xmcl-keystone-ui/src/browser.html
M	xmcl-keystone-ui/src/components/AppChangeInstanceIconCard.vue
M	xmcl-keystone-ui/src/components/FilterCard.vue
A	xmcl-keystone-ui/src/components/InstanceIcon.vue
M	xmcl-keystone-ui/src/components/InstanceItem.vue
M	xmcl-keystone-ui/src/components/InstanceManifestFileTree.vue
A	xmcl-keystone-ui/src/components/LocalAiSetup.vue
M	xmcl-keystone-ui/src/components/MarketProjectDetailVersion.vue
A	xmcl-keystone-ui/src/components/ModServerClassification.vue
A	xmcl-keystone-ui/src/components/ModServerColumns.vue
M	xmcl-keystone-ui/src/components/UserLoginForm.vue
M	xmcl-keystone-ui/src/components/VersionInputLabymod.vue
M	xmcl-keystone-ui/src/components/XmclAccountPanel.vue
M	xmcl-keystone-ui/src/components/saveProgressLocale.test.ts
M	xmcl-keystone-ui/src/composables/agent/commands.ts
M	xmcl-keystone-ui/src/composables/agent/compaction.test.ts
M	xmcl-keystone-ui/src/composables/agent/compaction.ts
M	xmcl-keystone-ui/src/composables/agent/confirm.test.ts
M	xmcl-keystone-ui/src/composables/agent/confirm.ts
M	xmcl-keystone-ui/src/composables/agent/context.test.ts
M	xmcl-keystone-ui/src/composables/agent/context.ts
A	xmcl-keystone-ui/src/composables/agent/knowledge.ts
M	xmcl-keystone-ui/src/composables/agent/local.ts
A	xmcl-keystone-ui/src/composables/agent/localProviders.test.ts
A	xmcl-keystone-ui/src/composables/agent/pbtAdmin.test.ts
M	xmcl-keystone-ui/src/composables/agent/prompt.ts
M	xmcl-keystone-ui/src/composables/agent/protocol.ts
M	xmcl-keystone-ui/src/composables/agent/settings.ts
M	xmcl-keystone-ui/src/composables/agent/toolPolicy.ts
M	xmcl-keystone-ui/src/composables/agent/tools.test.ts
M	xmcl-keystone-ui/src/composables/agent/tools.ts
M	xmcl-keystone-ui/src/composables/date.ts
M	xmcl-keystone-ui/src/composables/i18n.ts
M	xmcl-keystone-ui/src/composables/instanceContextMenu.ts
M	xmcl-keystone-ui/src/composables/instanceEdit.ts
A	xmcl-keystone-ui/src/composables/instanceIconSource.test.ts
A	xmcl-keystone-ui/src/composables/instanceIconSource.ts
M	xmcl-keystone-ui/src/composables/instanceShaderPack.ts
M	xmcl-keystone-ui/src/composables/launcherNews.ts
M	xmcl-keystone-ui/src/composables/login.ts
A	xmcl-keystone-ui/src/composables/minecraft26Catalog.test.ts
M	xmcl-keystone-ui/src/composables/multiplayerEntry.test.ts
M	xmcl-keystone-ui/src/composables/multiplayerEntry.ts
A	xmcl-keystone-ui/src/composables/serverExportAssistant.test.ts
A	xmcl-keystone-ui/src/composables/serverModClassification.test.ts
A	xmcl-keystone-ui/src/composables/serverModClassification.ts
M	xmcl-keystone-ui/src/composables/setting.ts
A	xmcl-keystone-ui/src/composables/shaderPackStatus.test.ts
A	xmcl-keystone-ui/src/composables/shaderPackStatus.ts
A	xmcl-keystone-ui/src/composables/shaderSupport.test.ts
A	xmcl-keystone-ui/src/composables/shaderSupport.ts
M	xmcl-keystone-ui/src/composables/tutorial.ts
M	xmcl-keystone-ui/src/composables/user.test.ts
M	xmcl-keystone-ui/src/composables/user.ts
M	xmcl-keystone-ui/src/global.d.ts
M	xmcl-keystone-ui/src/i18n.ts
M	xmcl-keystone-ui/src/index.html
M	xmcl-keystone-ui/src/migration.html
A	xmcl-keystone-ui/src/multiplayer.html
M	xmcl-keystone-ui/src/util/blueprintLocale.test.ts
M	xmcl-keystone-ui/src/util/crashPrompt.ts
A	xmcl-keystone-ui/src/util/date.test.ts
M	xmcl-keystone-ui/src/util/date.ts
A	xmcl-keystone-ui/src/util/fixtures/minecraft26.json
M	xmcl-keystone-ui/src/util/gameVersion.test.ts
M	xmcl-keystone-ui/src/util/gameVersion.ts
A	xmcl-keystone-ui/src/util/instanceIconImage.test.ts
A	xmcl-keystone-ui/src/util/instanceIconImage.ts
A	xmcl-keystone-ui/src/util/launcherReleaseNews.test.ts
A	xmcl-keystone-ui/src/util/launcherReleaseNews.ts
A	xmcl-keystone-ui/src/util/locale.test.ts
A	xmcl-keystone-ui/src/util/locale.ts
A	xmcl-keystone-ui/src/util/serverModClassification.test.ts
A	xmcl-keystone-ui/src/util/serverModClassification.ts
A	xmcl-keystone-ui/src/util/setupRequest.test.ts
A	xmcl-keystone-ui/src/util/setupRequest.ts
M	xmcl-keystone-ui/src/views/AppAgentChat.vue
M	xmcl-keystone-ui/src/views/AppCommandPalette.vue
A	xmcl-keystone-ui/src/views/AppServerExportDialog.vue
M	xmcl-keystone-ui/src/views/AppSideBarClassic.vue
M	xmcl-keystone-ui/src/views/AppSideBarGroupItem.vue
M	xmcl-keystone-ui/src/views/AppSideBarInstanceItem.vue
M	xmcl-keystone-ui/src/views/AppSideBarNotchItem.vue
M	xmcl-keystone-ui/src/views/AppSideBarNotchItemGroup.vue
M	xmcl-keystone-ui/src/views/AppSystemBar.vue
A	xmcl-keystone-ui/src/views/AppSystemBar.vue.bak
A	xmcl-keystone-ui/src/views/BaseSetting.vue.bak
M	xmcl-keystone-ui/src/views/BaseSettingGeneral.vue
M	xmcl-keystone-ui/src/views/BaseSettingServerRun.vue
M	xmcl-keystone-ui/src/views/HomeLayout.vue
M	xmcl-keystone-ui/src/views/Me.vue
A	xmcl-keystone-ui/src/views/Me.vue.bak
M	xmcl-keystone-ui/src/views/Mod.vue
A	xmcl-keystone-ui/src/views/Mod.vue.bak
M	xmcl-keystone-ui/src/views/ModItem.vue
M	xmcl-keystone-ui/src/views/Multiplayer.vue
A	xmcl-keystone-ui/src/views/Multiplayer.vue.bak
M	xmcl-keystone-ui/src/views/MultiplayerDesktop.vue
M	xmcl-keystone-ui/src/views/Setting.vue
M	xmcl-keystone-ui/src/views/SettingAbout.vue
M	xmcl-keystone-ui/src/views/SettingGeneral.vue
M	xmcl-keystone-ui/src/views/SettingUpdateInfoDialog.vue
M	xmcl-keystone-ui/src/views/Setup.vue
M	xmcl-keystone-ui/src/views/ShaderPack.vue
A	xmcl-keystone-ui/src/views/StoreEntry.vue.bak
M	xmcl-keystone-ui/src/vuetify.ts
M	xmcl-keystone-ui/src/windows/browser/AppCard.vue
M	xmcl-keystone-ui/src/windows/main/App.vue
M	xmcl-keystone-ui/src/windows/main/Context.ts
M	xmcl-keystone-ui/src/windows/migration/index.ts
A	xmcl-runtime-api/docs/GETTING_STARTED_ru.md
A	xmcl-runtime-api/docs/GETTING_STARTED_ua.md
M	xmcl-runtime-api/index.ts
A	xmcl-runtime-api/src/entities/localAi.ts
A	xmcl-runtime-api/src/entities/locale.test.ts
A	xmcl-runtime-api/src/entities/locale.ts
A	xmcl-runtime-api/src/entities/serverExport.ts
A	xmcl-runtime-api/src/entities/servicePolicy.test.ts
A	xmcl-runtime-api/src/entities/servicePolicy.ts
M	xmcl-runtime-api/src/entities/setting.schema.ts
M	xmcl-runtime-api/src/entities/setting.ts
M	xmcl-runtime-api/src/services/AgentService.ts
M	xmcl-runtime-api/src/services/InstanceIOService.ts
M	xmcl-runtime/agent/AgentService.test.ts
M	xmcl-runtime/agent/AgentService.ts
M	xmcl-runtime/agent/documents.test.ts
M	xmcl-runtime/agent/documents.ts
A	xmcl-runtime/agent/ollama.test.ts
A	xmcl-runtime/agent/ollama.ts
A	xmcl-runtime/agent/ollamaChat.test.ts
A	xmcl-runtime/agent/ollamaChat.ts
M	xmcl-runtime/agent/pi-ai-subpaths.d.ts
M	xmcl-runtime/agent/pluginAgentProtocol.test.ts
M	xmcl-runtime/agent/pluginAgentProtocol.ts
M	xmcl-runtime/agent/providerProtocol.ts
M	xmcl-runtime/app/BaseService.ts
M	xmcl-runtime/app/BaseService.update.test.ts
M	xmcl-runtime/app/LauncherApp.ts
M	xmcl-runtime/app/LauncherProtocolHandler.test.ts
M	xmcl-runtime/app/LauncherProtocolHandler.ts
A	xmcl-runtime/app/initialSetup.test.ts
A	xmcl-runtime/app/initialSetup.ts
M	xmcl-runtime/app/pluginCommonProtocol.test.ts
A	xmcl-runtime/app/pluginMediaProtocol.test.ts
M	xmcl-runtime/app/pluginMediaProtocol.ts
M	xmcl-runtime/app/steamShortcut.test.ts
M	xmcl-runtime/app/steamShortcut.ts
M	xmcl-runtime/constant.ts
M	xmcl-runtime/elyby/ElyByService.ts
M	xmcl-runtime/global.d.ts
A	xmcl-runtime/infra/plugins/flights.independence.test.ts
M	xmcl-runtime/infra/plugins/flights.ts
M	xmcl-runtime/infra/plugins/telemetry.ts
M	xmcl-runtime/install/VersionMetadataService.ts
A	xmcl-runtime/install/neoForgeMetadata.test.ts
A	xmcl-runtime/install/neoForgeMetadata.ts
A	xmcl-runtime/install/optifine.test.ts
M	xmcl-runtime/install/optifine.ts
M	xmcl-runtime/install/versionMetadataCache.test.ts
M	xmcl-runtime/install/versionMetadataCache.ts
M	xmcl-runtime/instance/InstanceService.icon.test.ts
M	xmcl-runtime/instance/InstanceService.ts
A	xmcl-runtime/instance/instanceGif.test.ts
A	xmcl-runtime/instance/instanceGif.ts
M	xmcl-runtime/instance/instanceIcon.test.ts
M	xmcl-runtime/instance/instanceIcon.ts
A	xmcl-runtime/instance/instanceIconValidation.test.ts
A	xmcl-runtime/instance/instanceIconValidation.ts
M	xmcl-runtime/instanceIO/InstanceIOService.ts
A	xmcl-runtime/instanceIO/serverExport.test.ts
A	xmcl-runtime/instanceIO/serverExport.ts
A	xmcl-runtime/instanceIO/serverExportAnalysis.ts
A	xmcl-runtime/instanceIO/serverExportFiles.ts
A	xmcl-runtime/instanceIO/serverExportMetadata.test.ts
A	xmcl-runtime/instanceIO/serverExportMetadata.ts
A	xmcl-runtime/instanceIO/serverExportRecipe.ts
A	xmcl-runtime/instanceIO/serverModClassification.test.ts
A	xmcl-runtime/instanceIO/serverModClassification.ts
A	xmcl-runtime/instanceIO/serverModDecisions.test.ts
A	xmcl-runtime/instanceIO/serverModDecisions.ts
M	xmcl-runtime/launch/LaunchService.ts
M	xmcl-runtime/moddb/databaseDownload.test.ts
M	xmcl-runtime/moddb/databaseDownload.ts
M	xmcl-runtime/network/NetworkAgent.ts
M	xmcl-runtime/presence/PresenceService.ts
M	xmcl-runtime/remoteServer/RemoteServerService.ts
M	xmcl-runtime/service/Service.ts
M	xmcl-runtime/settings/pluginSettings.test.ts
M	xmcl-runtime/settings/pluginSettings.ts
M	xmcl-runtime/setup/pluginSetup.ts
M	xmcl-runtime/user/pluginOfficialUserApi.ts
M	xmcl-runtime/util/validate.ts
M	xmcl-runtime/xmclAccount/XmclAccountService.test.ts
M	xmcl-runtime/xmclAccount/XmclAccountService.ts
```

## Resultados registrados de Fase 14

Tests focalizados: **28 aprobados en 3 archivos**, cero fallidos/omitidos. UI build: **30,25 s**, 106 chunks y cero huérfanos. Check/lint: código 0; bloqueos de host/DevTools: código 1 con ENOMEM.

Revisión automática: 27 enlaces locales/anclas correctos, dos iconos PNG intactos y tres badges de plataforma presentes. Se comprobaron los enlaces públicos principales mediante consulta web a los repositorios oficiales, node-gyp y Ollama. No se afirma que todos los enlaces externos de datos históricos ni el renderizado remoto de Shields estén disponibles; el enlace al commit upstream identifica la referencia, no certifica builds. No se incluyen credenciales ni se copian valores de configuración sensible.

El intento de git add de los tres entregables devuelve exactamente `fatal: Unable to create 'G:/Documentos/Compilar-Libs-Dev/PbtModLauncherX-Dev/.git/index.lock': Permission denied`. Commit pendiente; HEAD permanece en `7e6ce52b0b018e660fa4f589cb7f969febc828b2`. No se modifica el índice ni se cambia seguridad. Los artefactos de preservación indicados se verifican contra los tres archivos finales.

Iconos originales verificados por firma PNG, dimensiones y comparación byte a byte con el HEAD inicial:

- `xmcl-electron-app/icons/dark@256x256.png`: 256×256, SHA-256 `f3ae174f3e32557694025fe3e18c64e82cea32a538c79179dc098d7995b72f7d`.
- `xmcl-electron-app/icons/dark@Square44x44Logo.targetsize-256.png`: 259×259, SHA-256 `25ae6fb0e758be38d294e65ccc1a56fdd42e56719b3dd0ea75328983bbcb87be`.
