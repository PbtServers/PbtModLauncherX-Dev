# Rebranding de PbtModLauncherX — preparación v1.0.7

Fecha: 2026-10-10. Fase 3 completada en `dev/upstream-v1.0.7`.
La versión oficial se mantiene en **1.0.6**.

## Estado inicial y alcance

- HEAD inicial: `e5c1709d9b6d68f23068be05c07533c9438b7358`; árbol limpio.
- Upstream integrado: `0379941d1997e92b079fdc21e8692c8e45cd8cd7`.
- origin/master: `618d94eb7096599002bab5fd73636c917c0590d1`.
- master y backup/pre-upstream-v1.0.7: `c4b77e666f0b132e05e3ffff71d2728132a46a44`, sin modificaciones.
- No se ha hecho push, creado tags, publicado releases ni ejecutado ningún workflow remoto.
- No se han cambiado dependencias, arquitectura, importaciones, versiones ni configuraciones globales del compilador.

## Auditoría completa de referencias

Se examinó el contenido textual de todos los archivos versionados, incluidos
lockfile, documentación, workflows, recursos textuales, copias .bak/.old y registros
históricos. Se excluyen .git, dependencias instaladas y bundles generados/ignorados,
que no forman parte del código versionado. Los recursos binarios de identidad se
revisaron visualmente y por comparación de hashes.

Se encontraron **8.094 coincidencias** de las cinco variantes solicitadas y
**16 nombres comerciales localizados adicionales**: **8.110 referencias** clasificadas.
Se corrigieron **376 referencias de branding** de categoría A.
El recuento corresponde a apariciones, no a líneas o claves: una frase puede contener
el nombre dos veces. No incluye el nuevo aviso de atribución ni ajustes a metadata
que ya usaba PbtModLauncherX, como retirar el sufijo Beta o DeskGap.
Todas las referencias A del inventario inicial están resueltas. Las restantes
son contratos técnicos, servicios/dependencias originales, créditos o historia.

| Categoría | Significado | Referencias iniciales |
|---|---|---:|
| A | Branding público, distribución y documentación de uso del fork | 376 |
| B | Identificadores, imports, rutas, pruebas y compatibilidad interna | 3312 |
| C | Servicios, comunidades o paquetes externos originales | 355 |
| D | Créditos, licencias, bibliotecas y documentación del proyecto original | 671 |
| E | Registros históricos y copias conservadas | 3396 |

El anexo registra todas las rutas y líneas del estado inicial por categoría,
sin reproducir credenciales o contenido privado. Se incluye también el recuento
de correcciones por archivo. Las referencias nuevas a Voxelum/XMCL son atribuciones,
condiciones de workflows exclusivos de upstream, fixtures de rechazo de origen
ajeno o copias de los instaladores originales claramente identificadas.

## Identidad y metadatos

| Elemento | Resultado |
|---|---|
| Nombre/productName público de Electron y DeskGap | PbtModLauncherX |
| Ejecutable Windows / macOS bundle | PbtModLauncherX.exe / PbtModLauncherX.app |
| Ejecutable Linux | pbtmodlauncherx, conservado |
| Ventanas principal, navegador y migración | PbtModLauncherX; se conserva el contexto de ruta de la UI |
| HTML login Microsoft local | PbtModLauncherX |
| Acceso directo nuevo en Windows / Steam | PbtModLauncherX.lnk / PbtModLauncherX |
| AppX displayName / publisherDisplayName | PbtModLauncherX / PbtServers |
| Recursos Windows de versión generados | 1.0.6.0 |
| Archivos de distribución | pbtmodlauncherx-${version}-${platform}-${arch}.${ext}, con variantes Linux/macOS existentes |
| Artefacto DeskGap | pbtmodlauncherx-deskgap-${version}-win32-x64.exe, contrato conservado |
| Repositorio de actualización/distribución | PbtServers/PbtModLauncherX-Dev |

Se corrigieron títulos y textos del asistente, prompts de análisis de crashes,
mensajes de servicios gestionados, diálogos, nombres traducidos, Acerca de y enlaces
de descarga del generador de notas. Acerca de usa el PNG propio y añade atribución
explícita a Voxelum/ci010 bajo MIT; conserva colaboradores, sponsors y avisos legales.
Se conserva su visibilidad/configuración anterior, sin reactivar funcionalidades
ocultas por el fork. Los títulos de las 48 traducciones disponibles y sus valores
existentes se revisaron, incluidos los nombres localizados en árabe, bengalí,
Tamil, sánscrito, turco y LOLCAT.

La plantilla AppX antigua conserva su Identity Name/Application Id y publisher:
solo cambian DisplayName, Description e iconos inexistentes `256x256.png` por el
recurso propio existente. La configuración activa usa los IDs en minúsculas de
Fase 2; la plantilla histórica y el builder no se han unificado por cambiar contratos.

## Compatibilidad e identificadores conservados

- `xmcl-runtime`, `xmcl-core`, `xmcl-keystone-ui`, `xmcl-electron-app`, `packages/`,
  namespaces/imports `@xmcl/*` y APIs de runtime: permanecen intactos.
- `xmcl://`, `xmcl.runtime`, protocolos DeskGap `xmcl-deskgap` / `xmcl-resource`,
  sesiones de red, claves IPC, flights, IDs de iconos `xmcl:*`, variables `XMCL_*`,
  claves de traducción y formatos de manifiestos: mantienen compatibilidad.
- appId Electron `PbtModLauncherX`; AppX identity/applicationId `pbtmodlauncherx`;
  AUMID Electron `PbtModLauncherX` y DeskGap `PbtModLauncherX.deskgap.local`: conservados.
- Directorio persistente `pbtmodlauncherx` (LAUNCHER_NAME), almacenamiento de
  credenciales, cachés y directorios de updates: no se renombran. No se necesita
  migración de datos para este rebranding.
- DeskGap conserva el nombre técnico staged `pbtmodlauncherx-deskgap`, el cache
  de updates y los identificadores de credenciales. `LauncherApp` calcula su raíz
  con appData/LAUNCHER_NAME, independientemente del productName visible.
  origin/master no contiene DeskGap: esta arquitectura llegó en Fase 2 y no se
  ha publicado una release del fork con el anterior sufijo de producto DeskGap.
  Se retira ese sufijo visible sin cambiar la identidad técnica del paquete.
- StartupWMClass Linux `xmcl`: conservado; ver limitación de asociación de ventanas.
- Steam reconoce el nombre nuevo y el histórico XMCL, sin duplicar entradas
  ni reescribir otras entradas VDF. Se prueba ese reconocimiento con ambos nombres.
- Los prompts guardados con el antiguo nombre y herramienta bash siguen siendo
  reconocidos al migrar a vfs_shell; se prueba también con el nuevo prompt.
- IDs estables de servicios locales/remotos y marcadores de parsing/heredoc
  (`__XMCL_SEP__`, `XMCL_UNIT_EOF`) se conservan; solo cambia su descripción visible.
- Servicios externos `XMCL Account`, `XMCL Together`, suscripción de IA y comunidad
  r/XMCL mantienen su nombre real. No son una cuenta, producto de pago o proveedor
  PbtServers. Endpoints de estos servicios y sus logos no se presentan como propios.
- `@xmcl/app-*` y otras dependencias publicadas por upstream permanecen identificadas
  correctamente. No se publica ni renombra el namespace npm de terceros.
- Los workflows de publicación de bibliotecas npm y documentación de upstream
  ahora comprueban `github.repository == 'Voxelum/x-minecraft-launcher'`, evitando
  publicar desde este fork bajo el namespace original o notificar al sitio de upstream.
  El workflow propio de distribución y sus contratos de firma se mantienen.
- Certificado/publisher AppX, signtool publisherName CI010 y lista de confianza
  Authenticode DeskGap SignPath Foundation: conservados como contratos de firma,
  no sustituidos por una marca visible. No se deshabilitan verificaciones.

## Instalación portable

Los scripts superiores de `installer/` instalan los ZIP/tar.xz/ZIP macOS/DMG
oficiales de PbtServers con sus hashes SHA-256. Rechazan un destino existente y
no cambian datos del launcher. Conservan binarios, iconos, metadata y firmas tal
como están publicados: no descargan XMCL y lo hacen pasar por PbtModLauncherX.
Se admiten artefactos publicados en 1.0.6 y los nombres nuevos de macOS de Fase 2.
Windows ARM64 no se ofrece como ZIP nativo propio: el script lo rechaza explícitamente.

Los dos scripts originales de reconstrucción desde npm/npmmirror se guardan
**byte por byte** en `installer/upstream/`, documentados como instaladores de XMCL.
Conservan su funcionalidad de mirror y sus parámetros originales; no son las
entradas de instalación de PbtModLauncherX. La compatibilidad de directorios de
datos existentes no cambia; los nuevos destinos portables no sobrescriben los
directorios XMCL originales. `XMCL_INSTALL_DIR` continúa aceptado como alias
explícito del nuevo instalador shell.

## Iconos y recursos

Se compararon 38 archivos de iconos: **36 idénticos** al estado inicial.
Los dos ICNS aún representaban el logo de Voxelum y se regeneraron a partir de
`dark@256x256.png` y `light@256x256.png` propios, sin recursos nuevos de Voxelum.
El builder Linux usa ahora directamente el PNG propio. Ejecutable/instalador,
ventanas, dock, bandeja, accesos directos, notificaciones y AppX reutilizan los
recursos Pbt existentes. El logo de Acerca de usa `src/assets/pbtmodlauncherx.png`.
La generación ICNS es conversión de formato del recurso existente; las resoluciones
mayores se reescalan desde el PNG de 256 px. Los recursos de instancias no se tocan.

## Discord y AutoUpdater

- Discord Application ID: **1213977247514361856**, sin cambios.
- Clave de asset Rich Presence `dark_512`, estados/presence traducidos y manejo
  del ciclo de juegos: conservados. No se requiere cambio de API de Discord.
- `latest_version.json` y los módulos de actualizador Electron/DeskGap son
  idénticos al commit inicial: endpoints PbtServers, nombres de assets, hashes,
  contratos AppInstaller/ASAR y confianza de firmas mantienen compatibilidad.
- No se cambia la versión a 1.0.7 ni se prueban instalaciones automáticas reales
  que puedan sobrescribir el launcher instalado del usuario.

## Validación

| Comprobación | Resultado |
|---|---|
| `pnpm check` (Runtime API, Runtime, Electron/preload, Keystone UI) | OK |
| `pnpm --prefix=deskgap-app check` | OK |
| `pnpm lint` | OK: 0 errores, 2 warnings previos en InstanceBlueprintsService |
| Lint adicional del test de instaladores | OK: 0 warnings, 0 errores |
| Batería final de 19 archivos Vitest | **215 tests aprobados, 2 omitidos** |
| `pnpm compile` | OK: bundle Electron/main/preload/workers y recursos nativos |
| `pnpm build:renderer` | OK: 2.896 módulos, 103 chunks; verify-bundle 0 huérfanos |
| `pnpm build:deskgap` | OK: host ASCII, workers y copia del renderer final |
| Metadatos electron-builder AppInfo y LinuxTargetHelper | OK: Windows, macOS y .desktop Linux |
| AppInstaller XML generado / package.json DeskGap staged | OK: identidad y versión 1.0.6 |
| 48 archivos de traducción comparados con HEAD inicial | OK: mismas claves; **274 valores** cambian solo por branding |
| Constantes persistentes, Discord y actualizadores comparados con HEAD inicial | OK, sin diferencias |
| PowerShell parser y `sh -n installer/install.sh` | OK |
| `git diff --check` | OK |

Los dos tests omitidos son el empaquetado real con runtime externo DeskGap y
una comprobación Linux condicionada por plataforma. Se ejecutaron todas las
pruebas de confianza, rechazo de EXEs no firmados, updater, comandos/prompts,
crash prompts, offline, persistencia de usuarios, Microsoft OAuth, servicios
Windows, Steam, AppArmor y empaquetado disponibles.

Los siete tests de instaladores usan descargas simuladas: instalación con hash
válido, rechazo de hash inválido, rechazo de origen ajeno (Windows) y preservación
de destinos existentes. Extraen ZIP/tar.xz reales de prueba sin lanzar su ejecutable.
Se corrigió el harness de Windows para usar bsdtar con soporte xz integrado y
localizar el shell de Git, sin depender de un PATH particular. Las pruebas Linux
existentes fallaron inicialmente por `sh` fuera de PATH y pasaron después con
el shell de Git; no se ocultan esos intentos fallidos.

Los bundles finales se generaron con el renderer acabado y copiaron ese mismo
renderer a Electron y DeskGap. No quedan watchers ni procesos Electron temporales.
Logs y metadatos de evidencia quedan en `temp/rebrand-*` (ignorados por Git).

### Comprobación visual en la aplicación real

Se aplicó la guía `.github/skills/chrome-devtools-cli/SKILL.md` según `AGENTS.md`.
No había un launcher/dev server existente. Se iniciaron dev:renderer/dev:main y
se confirmó el target `http://localhost:3000/index.html`, no xmcl.runtime.
Se aisló appData y game data en `temp/rebrand-visual-appdata` y
`temp/rebrand-visual-game`, sin cuentas, instancias ni credenciales reales.

- Electron PID inicial 15892; reinicio 6316; viewport real 1200×720.
- Bienvenida: idioma, apariencia, ubicación de datos temporal y paso de cuenta;
  se saltó la cuenta sin añadir usuarios ni instalar Minecraft.
- Principal `/me`: título PbtModLauncherX y botón Agente PbtModLauncherX.
- `/setting`: ajustes generales, Discord y updater visibles; XMCL Account conserva
  su identidad de servicio externo, sin iniciar sesión.
- Diálogo del agente: nombre PbtModLauncherX y estado desactivado por falta de API;
  no se envió ninguna petición de chat ni se modificaron credenciales.
- Se cerró y reabrió el launcher: mantuvo la identidad, 0 usuarios y 0 instancias;
  la bienvenida ya no se repetía en el perfil temporal.
- Se cerraron el launcher, el daemon CLI y únicamente el servidor Vite iniciado
  para esta validación (PID 26008 verificado por ruta del repositorio).
- Consola/red: noticias Mojang 200; servicio externo api.xmcl.app/news respondió 404;
  avisos WebGL de shader y warnings de DB inicial/default yggdrasil documentados abajo.

## Riesgos y comprobaciones pendientes

1. No se han construido instaladores/EXEs firmados, AppX real ni paquetes nativos
   macOS/Linux en este host. La compilación de código y la generación de metadata
   pasan; la distribución final requiere toolchains/plataformas y certificados
   correspondientes. DeskGap no dispone del runtime externo para el test real de
   empaquetado. No se ha probado Discord conectado a una sesión real.
2. La lista Authenticode DeskGap y publisher CI010 son contratos de seguridad
   heredados. Una futura identidad de firma PbtServers exige configuración real
   y revisión de confianza/compatibilidad; no se altera aquí.
3. LinuxTargetHelper advierte que falta desktopName para asociación de ventanas.
   StartupWMClass=xmcl se conserva expresamente; debe verificarse en Linux antes
   de considerar un cambio de ID o integración con el escritorio.
4. El CLI no soporta `Browser.getWindowForTarget` en este Electron: no permitió
   redimensionar a 800×400. Se validó a 1200×720; los límites 800×400 del manifiesto
   permanecen intactos. La UI de Acerca de oculta se comprobó en fuente/build,
   sin reactivarla para la prueba.
5. La versión visible en desarrollo usa la versión del host Electron (43.5.0).
   Los package.json y los metadatos de distribución generados conservan 1.0.6.
   El comportamiento del entorno dev se deja fuera del rebranding funcional.
6. Se observó 404 en noticias de api.xmcl.app, warnings THREE/WebGL y warnings
   de migración DB al crear el perfil vacío. No se han corregido shaders ni primer
   inicio, conforme al alcance. No aparecieron errores de compilación pendientes.
7. Persisten los avisos de Vite/UnoCSS, externalización browser de node:fs y tamaño
   de chunks, más dos warnings de lint anteriores. No se cambian reglas ni bundler
   para ocultarlos. npm advierte de dos opciones .npmrc propias de pnpm.
8. Las 1.447 claves catalanas pendientes siguen usando fallback. No se ha hecho
   traducción completa ni se han eliminado idiomas; queda para Fase 4.
9. Los instaladores superiores ahora requieren GitHub y artefactos con SHA-256;
   la reconstrucción por npm/npmmirror sigue disponible como herramienta upstream
   en installer/upstream, sin instalar el fork por error. La instalación nativa
   macOS deberá probarse en macOS; Windows/Linux se probaron con payloads simulados.

## Archivos modificados/añadidos (87)

- `.github/actions/patch-release-note/index.js`
- `.github/skills/chrome-devtools-cli/SKILL.md`
- `.github/workflows/core-github-pages.yml`
- `.github/workflows/core-release.yml`
- `.vscode/launch.json`
- `.zed/tasks.json`
- `AGENTS.md`
- `PbtModLauncherX-Data/Modificaciones/REBRANDING-v1.0.7.md`
- `deskgap-app/package.json`
- `deskgap-app/packaging.ts`
- `deskgap-app/src/browser.ts`
- `deskgap-app/src/migration.ts`
- `installer/README.md`
- `installer/install.ps1`
- `installer/install.sh`
- `installer/install.test.ts`
- `installer/upstream/install.ps1`
- `installer/upstream/install.sh`
- `scripts/build-tutorial.ts`
- `xmcl-electron-app/build/appxmanifest.xml`
- `xmcl-electron-app/build/electron-builder.config.test.ts`
- `xmcl-electron-app/build/electron-builder.config.ts`
- `xmcl-electron-app/build/linuxPackageScripts.test.ts`
- `xmcl-electron-app/icons/dark.icns`
- `xmcl-electron-app/icons/light.icns`
- `xmcl-electron-app/main/ElectronController.ts`
- `xmcl-electron-app/main/ServerService.ts`
- `xmcl-electron-app/main/locales/de.yaml`
- `xmcl-electron-app/main/locales/es-ES.yaml`
- `xmcl-electron-app/main/locales/fr.yaml`
- `xmcl-electron-app/main/locales/hu.yaml`
- `xmcl-electron-app/main/locales/ja-JP.yaml`
- `xmcl-electron-app/main/locales/ko.yaml`
- `xmcl-electron-app/main/locales/lolcat.yaml`
- `xmcl-electron-app/main/locales/nl.yaml`
- `xmcl-electron-app/main/locales/pl.yaml`
- `xmcl-electron-app/main/locales/pt-BR.yaml`
- `xmcl-electron-app/main/locales/ru.yaml`
- `xmcl-electron-app/main/locales/tr.yaml`
- `xmcl-electron-app/main/locales/uk.yaml`
- `xmcl-electron-app/main/locales/zh-CN.yaml`
- `xmcl-electron-app/main/locales/zh-TW.yaml`
- `xmcl-electron-app/main/utils/login.ts`
- `xmcl-keystone-ui/locales/ar-EG.yaml`
- `xmcl-keystone-ui/locales/ar.yaml`
- `xmcl-keystone-ui/locales/bn.yaml`
- `xmcl-keystone-ui/locales/ca.yaml`
- `xmcl-keystone-ui/locales/de.yaml`
- `xmcl-keystone-ui/locales/en-IN.yaml`
- `xmcl-keystone-ui/locales/en.yaml`
- `xmcl-keystone-ui/locales/es-ES.yaml`
- `xmcl-keystone-ui/locales/fr.yaml`
- `xmcl-keystone-ui/locales/gl.yaml`
- `xmcl-keystone-ui/locales/hi.yaml`
- `xmcl-keystone-ui/locales/hu.yaml`
- `xmcl-keystone-ui/locales/id.yaml`
- `xmcl-keystone-ui/locales/it-IT.yaml`
- `xmcl-keystone-ui/locales/ja-JP.yaml`
- `xmcl-keystone-ui/locales/ko.yaml`
- `xmcl-keystone-ui/locales/kz.yaml`
- `xmcl-keystone-ui/locales/lolcat.yaml`
- `xmcl-keystone-ui/locales/nl.yaml`
- `xmcl-keystone-ui/locales/pl.yaml`
- `xmcl-keystone-ui/locales/pt-BR.yaml`
- `xmcl-keystone-ui/locales/ru.yaml`
- `xmcl-keystone-ui/locales/sa.yaml`
- `xmcl-keystone-ui/locales/ta.yaml`
- `xmcl-keystone-ui/locales/tr.yaml`
- `xmcl-keystone-ui/locales/uk.yaml`
- `xmcl-keystone-ui/locales/vi.yaml`
- `xmcl-keystone-ui/locales/zh-CN.yaml`
- `xmcl-keystone-ui/locales/zh-HK.yaml`
- `xmcl-keystone-ui/locales/zh-TW.yaml`
- `xmcl-keystone-ui/src/composables/agent/commands.ts`
- `xmcl-keystone-ui/src/composables/agent/context.test.ts`
- `xmcl-keystone-ui/src/composables/agent/context.ts`
- `xmcl-keystone-ui/src/composables/agent/prompt.ts`
- `xmcl-keystone-ui/src/composables/agent/tools.ts`
- `xmcl-keystone-ui/src/migration.html`
- `xmcl-keystone-ui/src/util/crashPrompt.ts`
- `xmcl-keystone-ui/src/views/BaseSettingServerRun.vue`
- `xmcl-keystone-ui/src/views/HomeLayout.vue`
- `xmcl-keystone-ui/src/views/SettingAbout.vue`
- `xmcl-runtime/app/BaseService.ts`
- `xmcl-runtime/app/steamShortcut.test.ts`
- `xmcl-runtime/app/steamShortcut.ts`
- `xmcl-runtime/remoteServer/RemoteServerService.ts`

## Correcciones de branding por archivo

| Archivo | Referencias corregidas |
|---|---:|
| `.github/actions/patch-release-note/index.js` | 22 |
| `.github/skills/chrome-devtools-cli/SKILL.md` | 5 |
| `.vscode/launch.json` | 4 |
| `.zed/tasks.json` | 4 |
| `deskgap-app/package.json` | 1 |
| `deskgap-app/packaging.ts` | 2 |
| `deskgap-app/src/browser.ts` | 3 |
| `deskgap-app/src/migration.ts` | 1 |
| `installer/install.ps1` | 8 |
| `installer/install.sh` | 10 |
| `scripts/build-tutorial.ts` | 1 |
| `xmcl-electron-app/main/ElectronController.ts` | 2 |
| `xmcl-electron-app/main/ServerService.ts` | 2 |
| `xmcl-electron-app/main/locales/de.yaml` | 1 |
| `xmcl-electron-app/main/locales/es-ES.yaml` | 1 |
| `xmcl-electron-app/main/locales/fr.yaml` | 1 |
| `xmcl-electron-app/main/locales/hu.yaml` | 1 |
| `xmcl-electron-app/main/locales/ja-JP.yaml` | 1 |
| `xmcl-electron-app/main/locales/ko.yaml` | 1 |
| `xmcl-electron-app/main/locales/lolcat.yaml` | 1 |
| `xmcl-electron-app/main/locales/nl.yaml` | 1 |
| `xmcl-electron-app/main/locales/pl.yaml` | 1 |
| `xmcl-electron-app/main/locales/pt-BR.yaml` | 1 |
| `xmcl-electron-app/main/locales/ru.yaml` | 1 |
| `xmcl-electron-app/main/locales/tr.yaml` | 1 |
| `xmcl-electron-app/main/locales/uk.yaml` | 1 |
| `xmcl-electron-app/main/locales/zh-CN.yaml` | 1 |
| `xmcl-electron-app/main/locales/zh-TW.yaml` | 1 |
| `xmcl-electron-app/main/utils/login.ts` | 1 |
| `xmcl-keystone-ui/locales/ar-EG.yaml` | 10 |
| `xmcl-keystone-ui/locales/ar.yaml` | 8 |
| `xmcl-keystone-ui/locales/bn.yaml` | 9 |
| `xmcl-keystone-ui/locales/ca.yaml` | 1 |
| `xmcl-keystone-ui/locales/de.yaml` | 8 |
| `xmcl-keystone-ui/locales/en-IN.yaml` | 10 |
| `xmcl-keystone-ui/locales/en.yaml` | 17 |
| `xmcl-keystone-ui/locales/es-ES.yaml` | 6 |
| `xmcl-keystone-ui/locales/fr.yaml` | 7 |
| `xmcl-keystone-ui/locales/gl.yaml` | 8 |
| `xmcl-keystone-ui/locales/hi.yaml` | 9 |
| `xmcl-keystone-ui/locales/hu.yaml` | 8 |
| `xmcl-keystone-ui/locales/id.yaml` | 10 |
| `xmcl-keystone-ui/locales/it-IT.yaml` | 8 |
| `xmcl-keystone-ui/locales/ja-JP.yaml` | 9 |
| `xmcl-keystone-ui/locales/ko.yaml` | 9 |
| `xmcl-keystone-ui/locales/kz.yaml` | 7 |
| `xmcl-keystone-ui/locales/lolcat.yaml` | 8 |
| `xmcl-keystone-ui/locales/nl.yaml` | 7 |
| `xmcl-keystone-ui/locales/pl.yaml` | 7 |
| `xmcl-keystone-ui/locales/pt-BR.yaml` | 8 |
| `xmcl-keystone-ui/locales/ru.yaml` | 9 |
| `xmcl-keystone-ui/locales/sa.yaml` | 7 |
| `xmcl-keystone-ui/locales/ta.yaml` | 10 |
| `xmcl-keystone-ui/locales/tr.yaml` | 10 |
| `xmcl-keystone-ui/locales/uk.yaml` | 9 |
| `xmcl-keystone-ui/locales/vi.yaml` | 10 |
| `xmcl-keystone-ui/locales/zh-CN.yaml` | 16 |
| `xmcl-keystone-ui/locales/zh-HK.yaml` | 11 |
| `xmcl-keystone-ui/locales/zh-TW.yaml` | 9 |
| `xmcl-keystone-ui/src/composables/agent/commands.ts` | 2 |
| `xmcl-keystone-ui/src/composables/agent/prompt.ts` | 7 |
| `xmcl-keystone-ui/src/composables/agent/tools.ts` | 4 |
| `xmcl-keystone-ui/src/migration.html` | 1 |
| `xmcl-keystone-ui/src/util/crashPrompt.ts` | 7 |
| `xmcl-keystone-ui/src/views/BaseSettingServerRun.vue` | 1 |
| `xmcl-keystone-ui/src/views/HomeLayout.vue` | 1 |
| `xmcl-keystone-ui/src/views/SettingAbout.vue` | 4 |
| `xmcl-runtime/app/BaseService.ts` | 1 |
| `xmcl-runtime/app/steamShortcut.ts` | 1 |
| `xmcl-runtime/remoteServer/RemoteServerService.ts` | 1 |

## Inventario inicial completo por ruta y categoría

Las líneas corresponden al commit inicial e5c1709d. Cada aparición se cuenta,
aunque varias compartan línea. Las listas de líneas únicas facilitan localizarlas.

| Archivo | Categoría | Apariciones | Líneas iniciales |
|---|---|---:|---|
| `.github/ISSUE_TEMPLATE/bug_report.yaml` | C | 1 | 9 |
| `.github/ISSUE_TEMPLATE/bug_report_zh.yaml` | C | 1 | 9 |
| `.github/actions/generate-release-note/index.js` | B | 3 | 72, 73, 75 |
| `.github/actions/patch-release-note/index.js` | A | 22 | 10, 11, 12, 13, 14, 15, 16, 17, 20, 23, 24 |
| `.github/actions/prepare-pr/index.ts` | B | 4 | 36, 198 |
| `.github/actions/prepare-pr/index.ts` | D | 2 | 211, 248 |
| `.github/copilot-instructions.md` | B | 2 | 18, 42 |
| `.github/skills/chrome-devtools-cli/SKILL.md` | A | 5 | 3, 8, 19, 40 |
| `.github/skills/chrome-devtools-cli/SKILL.md` | B | 2 | 41, 71 |
| `.github/workflows/build.yml` | B | 18 | 9, 10, 11, 12, 19, 63, 64, 74, 75, 140, 147, 148, 154, 161, 168, 175, 182, 189 |
| `.github/workflows/core-github-pages.yml` | B | 1 | 45 |
| `.github/workflows/core-github-pages.yml` | D | 1 | 49 |
| `.github/workflows/core-release.yml` | B | 1 | 73 |
| `.github/workflows/e2e.yml` | B | 17 | 6, 10, 11, 12, 13, 18, 19, 20, 21, 76, 92, 115, 173, 178, 211, 228, 242 |
| `.gitignore` | B | 1 | 15 |
| `.vscode/launch.json` | A | 4 | 73, 77, 81 |
| `.vscode/launch.json` | B | 17 | 12, 21, 25, 27, 31, 32, 33, 35, 55, 59, 64, 65, 66, 68, 73, 77, 81 |
| `.vscode/settings.json` | B | 5 | 12, 16, 27, 47, 54 |
| `.vscode/tasks.json` | B | 1 | 66 |
| `.vscode/vue.code-snippets` | B | 1 | 57 |
| `.zed/settings.json` | B | 1 | 40 |
| `.zed/tasks.json` | A | 4 | 69, 84, 99 |
| `.zed/tasks.json` | B | 9 | 53, 55, 60, 69, 75, 84, 90, 99, 105 |
| `AGENTS.md` | B | 11 | 4, 24, 35, 39, 42, 43, 49, 53, 58, 139, 140 |
| `CONTRIBUTING.md` | D | 38 | 36, 39, 41, 42, 43, 46, 48, 49, 62, 69, 73, 74, 75, 76, 89, 127, 178, 192, 194, 195, 198, 210, 211, 218, 233, 253, 267, 271, 295, 308, 317, 320, 338, 426 |
| `ModrinthPublish.md` | B | 20 | 1, 5, 7, 11, 27, 32, 33, 34, 35, 39, 41, 68, 75, 76, 77, 97, 100, 108, 122, 138 |
| `PbtModLauncherX-Data/Modificaciones/AUDITORIA-v1.0.7.md` | E | 2646 | 12, 32, 33, 34, 35, 36, 37, 39, 44, 46, 56, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 331, 332, 333, 334, 335, 336, 337, 338, 339, 340, 341, 342, 343, 344, 345, 346, 347, 348, 349, 350, 351, 352, 353, 354, 355, 356, 357, 358, 359, 360, 361, 362, 363, 364, 365, 366, 367, 368, 369, 370, 371, 372, 373, 374, 375, 376, 377, 378, 379, 380, 381, 382, 383, 384, 385, 386, 387, 388, 389, 390, 391, 392, 393, 394, 395, 396, 397, 398, 399, 400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 418, 419, 420, 421, 422, 423, 424, 425, 426, 427, 428, 429, 430, 431, 432, 433, 434, 435, 436, 437, 438, 439, 440, 441, 442, 443, 444, 445, 446, 447, 448, 449, 450, 451, 452, 453, 454, 455, 456, 457, 458, 459, 460, 461, 462, 463, 464, 465, 466, 467, 468, 469, 470, 471, 472, 473, 474, 475, 476, 477, 478, 479, 480, 481, 482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 492, 493, 494, 495, 496, 497, 498, 499, 500, 501, 502, 503, 504, 505, 506, 507, 508, 509, 510, 511, 512, 513, 514, 515, 516, 517, 518, 519, 520, 521, 522, 523, 524, 525, 526, 527, 528, 529, 530, 531, 532, 533, 534, 535, 536, 537, 538, 539, 540, 541, 542, 543, 544, 545, 546, 547, 548, 549, 550, 551, 552, 553, 554, 555, 556, 557, 558, 559, 560, 561, 562, 563, 564, 565, 566, 567, 568, 569, 570, 571, 572, 573, 574, 575, 576, 577, 578, 579, 580, 581, 582, 583, 584, 585, 586, 587, 588, 589, 590, 591, 592, 593, 594, 595, 596, 597, 598, 599, 600, 601, 602, 603, 604, 605, 606, 607, 608, 609, 610, 611, 612, 613, 614, 615, 616, 617, 618, 619, 620, 621, 622, 623, 624, 625, 626, 627, 628, 629, 630, 631, 632, 633, 634, 635, 636, 637, 638, 639, 640, 641, 642, 643, 644, 645, 646, 647, 648, 649, 650, 651, 652, 653, 654, 655, 656, 657, 658, 659, 660, 661, 662, 663, 664, 665, 666, 667, 668, 669, 670, 671, 672, 673, 674, 675, 676, 677, 678, 679, 680, 681, 682, 683, 684, 685, 686, 687, 688, 689, 690, 691, 692, 693, 694, 695, 696, 697, 698, 699, 700, 701, 702, 703, 704, 705, 706, 707, 708, 709, 710, 711, 712, 713, 714, 715, 716, 717, 718, 719, 720, 721, 722, 723, 724, 725, 726, 727, 728, 729, 730, 731, 732, 733, 734, 735, 736, 737, 738, 739, 740, 741, 742, 743, 744, 745, 746, 747, 748, 749, 750, 751, 752, 753, 754, 755, 756, 757, 758, 759, 760, 761, 762, 763, 764, 765, 766, 767, 768, 769, 770, 771, 772, 773, 774, 775, 776, 777, 778, 779, 780, 781, 782, 783, 784, 785, 786, 787, 788, 789, 790, 791, 792, 793, 794, 795, 796, 797, 798, 799, 800, 801, 802, 803, 892, 893, 894, 895, 896, 897, 898, 899, 900, 901, 902, 903, 904, 905, 906, 907, 908, 909, 910, 911, 912, 913, 914, 915, 916, 917, 918, 919, 920, 921, 922, 923, 924, 925, 926, 927, 928, 929, 930, 931, 932, 933, 934, 935, 936, 937, 938, 939, 940, 941, 942, 943, 944, 945, 946, 947, 948, 949, 950, 951, 952, 953, 954, 955, 956, 957, 958, 959, 960, 961, 962, 963, 964, 965, 966, 967, 968, 969, 970, 971, 972, 973, 974, 975, 976, 977, 978, 979, 980, 981, 982, 983, 984, 985, 986, 987, 988, 989, 990, 991, 992, 993, 994, 995, 996, 997, 998, 999, 1000, 1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1010, 1011, 1012, 1013, 1014, 1015, 1016, 1017, 1018, 1019, 1020, 1021, 1022, 1023, 1024, 1025, 1026, 1027, 1028, 1029, 1030, 1031, 1032, 1033, 1034, 1035, 1036, 1037, 1038, 1039, 1040, 1041, 1042, 1043, 1044, 1045, 1046, 1047, 1048, 1049, 1050, 1051, 1052, 1053, 1054, 1055, 1056, 1057, 1058, 1059, 1060, 1061, 1062, 1063, 1064, 1065, 1066, 1067, 1068, 1069, 1070, 1071, 1072, 1073, 1074, 1075, 1076, 1077, 1078, 1079, 1080, 1081, 1082, 1083, 1084, 1085, 1086, 1087, 1088, 1089, 1090, 1091, 1092, 1093, 1094, 1095, 1096, 1097, 1098, 1099, 1100, 1101, 1102, 1103, 1104, 1105, 1106, 1107, 1108, 1109, 1110, 1111, 1112, 1113, 1114, 1115, 1116, 1117, 1118, 1119, 1120, 1121, 1122, 1123, 1124, 1125, 1126, 1127, 1128, 1129, 1130, 1131, 1132, 1133, 1134, 1135, 1136, 1137, 1138, 1139, 1140, 1141, 1142, 1143, 1144, 1145, 1146, 1147, 1148, 1149, 1150, 1151, 1152, 1153, 1154, 1155, 1156, 1157, 1158, 1159, 1160, 1161, 1162, 1163, 1164, 1165, 1166, 1167, 1168, 1169, 1170, 1171, 1172, 1173, 1174, 1175, 1176, 1177, 1178, 1179, 1180, 1181, 1182, 1183, 1184, 1185, 1186, 1187, 1188, 1189, 1190, 1191, 1192, 1193, 1194, 1195, 1196, 1197, 1198, 1199, 1200, 1201, 1202, 1203, 1204, 1205, 1206, 1207, 1208, 1209, 1210, 1211, 1212, 1213, 1214, 1215, 1216, 1217, 1218, 1219, 1220, 1221, 1222, 1223, 1224, 1225, 1226, 1227, 1228, 1229, 1230, 1231, 1232, 1233, 1234, 1235, 1236, 1237, 1238, 1239, 1240, 1241, 1242, 1243, 1244, 1245, 1246, 1247, 1248, 1249, 1250, 1251, 1252, 1253, 1254, 1255, 1256, 1257, 1258, 1259, 1260, 1261, 1262, 1263, 1264, 1265, 1266, 1267, 1268, 1269, 1270, 1271, 1272, 1273, 1274, 1275, 1276, 1277, 1278, 1279, 1280, 1281, 1282, 1283, 1284, 1285, 1286, 1287, 1288, 1289, 1290, 1291, 1292, 1293, 1294, 1295, 1296, 1297, 1298, 1299, 1300, 1301, 1302, 1303, 1304, 1305, 1306, 1307, 1308, 1309, 1310, 1311, 1312, 1313, 1314, 1315, 1316, 1317, 1318, 1319, 1320, 1321, 1322, 1323, 1324, 1325, 1326, 1327, 1328, 1329, 1330, 1331, 1332, 1333, 1334, 1335, 1336, 1337, 1338, 1339, 1340, 1341, 1342, 1343, 1344, 1345, 1346, 1347, 1348, 1349, 1350, 1351, 1352, 1353, 1354, 1355, 1356, 1357, 1358, 1359, 1360, 1361, 1362, 1363, 1364, 1365, 1366, 1367, 1368, 1369, 1370, 1371, 1372, 1373, 1374, 1375, 1376, 1377, 1378, 1379, 1380, 1381, 1382, 1383, 1384, 1385, 1386, 1387, 1388, 1389, 1390, 1391, 1392, 1393, 1394, 1395, 1396, 1397, 1398, 1399, 1400, 1401, 1402, 1403, 1404, 1405, 1406, 1407, 1408, 1409, 1410, 1411, 1412, 1413, 1414, 1415, 1416, 1417, 1418, 1419, 1420, 1421, 1422, 1423, 1424, 1425, 1426, 1427, 1428, 1429, 1430, 1431, 1432, 1433, 1434, 1435, 1436, 1437, 1438, 1439, 1440, 1441, 1442, 1443, 1444, 1445, 1446, 1447, 1448, 1449, 1450, 1451, 1452, 1453, 1454, 1455, 1456, 1457, 1458, 1459, 1460, 1461, 1462, 1463, 1464, 1465, 1466, 1467, 1468, 1469, 1470, 1471, 1472, 1473, 1474, 1475, 1476, 1477, 1478, 1479, 1480, 1481, 1482, 1483, 1484, 1485, 1486, 1487, 1488, 1489, 1490, 1491, 1492, 1493, 1494, 1495, 1496, 1497, 1498, 1499, 1500, 1501, 1502, 1503, 1504, 1505, 1506, 1507, 1508, 1509, 1510, 1511, 1512, 1513, 1514, 1515, 1516, 1517, 1518, 1519, 1520, 1521, 1522, 1523, 1524, 1525, 1526, 1527, 1528, 1529, 1530, 1531, 1532, 1533, 1534, 1535, 1536, 1537, 1538, 1539, 1540, 1541, 1542, 1543, 1544, 1545, 1546, 1547, 1548, 1549, 1550, 1551, 1552, 1553, 1554, 1555, 1556, 1557, 1558, 1559, 1560, 1561, 1562, 1563, 1564, 1565, 1566, 1567, 1568, 1569, 1570, 1571, 1572, 1573, 1574, 1575, 1576, 1577, 1578, 1579, 1580, 1581, 1582, 1583, 1584, 1585, 1586, 1587, 1588, 1589, 1590, 1591, 1592, 1593, 1594, 1595, 1596, 1597, 1598, 1599, 1600, 1601, 1602, 1603, 1604, 1605, 1606, 1607, 1608, 1609, 1610, 1611, 1612, 1613, 1614, 1615, 1616, 1617, 1618, 1619, 1620, 1621, 1622, 1623, 1624, 1625, 1626, 1627, 1628, 1629, 1630, 1631, 1632, 1633, 1634, 1635, 1636, 1637, 1638, 1639, 1640, 1641, 1642, 1643, 1644, 1645, 1646, 1647, 1648, 1649, 1650, 1651, 1652, 1653, 1654, 1655, 1656, 1657, 1658, 1659, 1660, 1661, 1662, 1663, 1664, 1665, 1666, 1667, 1668, 1669, 1670, 1671, 1672, 1673, 1674, 1675, 1676, 1677, 1678, 1679, 1680, 1681, 1682, 1683, 1684, 1685, 1686, 1687, 1688, 1689, 1690, 1691, 1692, 1693, 1694, 1695, 1696, 1697, 1698, 1699, 1700, 1701, 1702, 1703, 1704, 1705, 1706, 1707, 1708, 1709, 1710, 1711, 1712, 1713, 1714, 1715, 1716, 1717, 1718, 1719, 1720, 1721, 1722, 1723, 1724, 1725, 1726, 1727, 1728, 1729, 1730, 1731, 1732, 1733, 1734, 1735, 1736, 1737, 1738, 1739, 1740, 1741, 1742, 1743, 1744, 1745, 1746, 1747, 1748, 1749, 1750, 1751, 1752, 1753, 1754, 1755, 1756, 1757, 1758, 1759, 1760, 1761, 1762, 1763, 1764, 1765, 1766, 1767, 1768, 1769, 1770, 1771, 1772, 1773, 1774, 1775, 1776, 1777, 1778, 1779, 1780, 1781, 1782, 1783, 1784, 1785, 1786, 1787, 1788, 1789, 1790, 1791, 1792, 1793, 1794, 1795, 1796, 1797, 1798, 1799, 1800, 1801, 1802, 1803, 1804, 1805, 1806, 1807, 1808, 1809, 1810, 1811, 1812, 1813, 1814, 1815, 1816, 1817, 1818, 1819, 1820, 1821, 1822, 1823, 1824, 1825, 1826, 1827, 1828, 1829, 1830, 1831, 1832, 1833, 1834, 1835, 1836, 1837, 1838, 1839, 1840, 1841, 1842, 1843, 1844, 1845, 1846, 1847, 1848, 1849, 1850, 1851, 1852, 1853, 1854, 1855, 1856, 1857, 1858, 1859, 1860, 1861, 1862, 1863, 1864, 1865, 1866, 1867, 1868, 1869, 1870, 1871, 1872, 1873, 1874, 1875, 1876, 1877, 1878, 1879, 1880, 1881, 1882, 1883, 1884, 1885, 1886, 1887, 1888, 1889, 1890, 1891, 1892, 1893, 1894, 1895, 1896, 1897, 1898, 1899, 1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908, 1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917, 1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926, 1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935, 1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944, 1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953, 1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962, 1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971, 1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980, 1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989, 1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035, 2036, 2037, 2038, 2039, 2040, 2041, 2042, 2043, 2044, 2045, 2046, 2047, 2048, 2049, 2050, 2051, 2052, 2053, 2054, 2055, 2056, 2057, 2058, 2059, 2060, 2061, 2062, 2063, 2064, 2065, 2066, 2067, 2068, 2069, 2070, 2071, 2072, 2073, 2074, 2075, 2076, 2077, 2078, 2079, 2080, 2081, 2082, 2083, 2084, 2085, 2086, 2087, 2088, 2089, 2090, 2091, 2092, 2093, 2094, 2095, 2096, 2097, 2098, 2099, 2100, 2101, 2102, 2103, 2104, 2105, 2106, 2107, 2108, 2109, 2110, 2111, 2112, 2113, 2114, 2115, 2116, 2117, 2118, 2119, 2120, 2121, 2122, 2123, 2124, 2125, 2126, 2127, 2128, 2129, 2130, 2131, 2132, 2133, 2134, 2135, 2136, 2137, 2138, 2139, 2140, 2141, 2142, 2143, 2144, 2145, 2146, 2147, 2148, 2149, 2150, 2151, 2152, 2153, 2154, 2155, 2156, 2157, 2158, 2159, 2160, 2161, 2162, 2163, 2164, 2165, 2166, 2167, 2168, 2201, 2202, 2203, 2204, 2205, 2206, 2207, 2208, 2209, 2210, 2211, 2212, 2213, 2214, 2215, 2216, 2217, 2218, 2219, 2220, 2221, 2222, 2223, 2224, 2225, 2226, 2227, 2228, 2229, 2230, 2231, 2232, 2233, 2234, 2235, 2236, 2237, 2238, 2239, 2240, 2241, 2242, 2243, 2244, 2245, 2246, 2247, 2248, 2249, 2250, 2251, 2252, 2253, 2254, 2255, 2256, 2257, 2258, 2259, 2260, 2261, 2262, 2263, 2264, 2265, 2266, 2267, 2268, 2269, 2270, 2271, 2272, 2273, 2274, 2275, 2276, 2277, 2278, 2279, 2280, 2281, 2282, 2283, 2284, 2285, 2286, 2287, 2288, 2289, 2290, 2291, 2292, 2293, 2294, 2295, 2296, 2297, 2298, 2299, 2300, 2301, 2302, 2303, 2304, 2305, 2306, 2307, 2308, 2309, 2310, 2311, 2312, 2313, 2314, 2315, 2316, 2317, 2318, 2319, 2320, 2321, 2322, 2323, 2324, 2325, 2326, 2327, 2328, 2329, 2330, 2331, 2332, 2333, 2334, 2335, 2336, 2337, 2338, 2339, 2340, 2341, 2342, 2343, 2344, 2345, 2346, 2347, 2348, 2349, 2350, 2351, 2352, 2353, 2354, 2355, 2356, 2357, 2358, 2359, 2360, 2361, 2362, 2363, 2364, 2365, 2366, 2367, 2368, 2369, 2370, 2371, 2372, 2373, 2374, 2375, 2376, 2377, 2378, 2379, 2380, 2381, 2382, 2383, 2384, 2385, 2386, 2387, 2388, 2389, 2390, 2391, 2392, 2393, 2394, 2395, 2396, 2397, 2398, 2399, 2400, 2401, 2402, 2403, 2404, 2405, 2406, 2407, 2408, 2409, 2410, 2411, 2412, 2413, 2414, 2415, 2416, 2417, 2418, 2419, 2420, 2421, 2422, 2423, 2424, 2425, 2426, 2427, 2428, 2429, 2430, 2431, 2432, 2433, 2434, 2435, 2436, 2437, 2438, 2439, 2440, 2441, 2442, 2443, 2444, 2445, 2446, 2447, 2448, 2449, 2450, 2451, 2452, 2453, 2454, 2455, 2456, 2457, 2458, 2459, 2460, 2461, 2462, 2463, 2464, 2465, 2466, 2467, 2468, 2469, 2470, 2471, 2472, 2473, 2474, 2475, 2476, 2477, 2478, 2479, 2480, 2481, 2482, 2483, 2484, 2485, 2486, 2487, 2488, 2489, 2490, 2491, 2492, 2493, 2494, 2495, 2496, 2497, 2498, 2499, 2500, 2501, 2502, 2503, 2504, 2505, 2506, 2507, 2508, 2509, 2510, 2511, 2512, 2513, 2514, 2515, 2516, 2517, 2518, 2519, 2520, 2521, 2522, 2523, 2524, 2525, 2526, 2527, 2528, 2529, 2530, 2531, 2532, 2533, 2534, 2535, 2536, 2537, 2538, 2539, 2540, 2541, 2542, 2543, 2544, 2545, 2546, 2547, 2548, 2549, 2550, 2551, 2552, 2553, 2554, 2555, 2556, 2557, 2558, 2559, 2560, 2561, 2562, 2563, 2564, 2565, 2566, 2567, 2568, 2569, 2570, 2571, 2572, 2573, 2574, 2575, 2576, 2577, 2578, 2579, 2580, 2581, 2582, 2583, 2584, 2585, 2586, 2587, 2588, 2589, 2590, 2591, 2592, 2593, 2594, 2595, 2596, 2597, 2598, 2599, 2600, 2601, 2602, 2603, 2604, 2605, 2606, 2607, 2608, 2609, 2610, 2611, 2612, 2613, 2614, 2615, 2616, 2617, 2618, 2619, 2620, 2621, 2622, 2623, 2624, 2625, 2626, 2627, 2628, 2629, 2630, 2631, 2632, 2633, 2634, 2635, 2636, 2637, 2638, 2639, 2640, 2641, 2642, 2643, 2644, 2645, 2646, 2647, 2648, 2649, 2650, 2651, 2652, 2653, 2654, 2655, 2656, 2657, 2658, 2659, 2660, 2661, 2662, 2663, 2664, 2665, 2666, 2667, 2668, 2669, 2670, 2671, 2672, 2673, 2674, 2675, 2676, 2677, 2678, 2679, 2680, 2681, 2682, 2683, 2684, 2685, 2686, 2687, 2688, 2689, 2690, 2691, 2692, 2693, 2694, 2695, 2696, 2697, 2698, 2699, 2700, 2701, 2702, 2703, 2704, 2705, 2706, 2707, 2708, 2709, 2710, 2711, 2712, 2713, 2714, 2715, 2716, 2717, 2718, 2719, 2720, 2721, 2722, 2723, 2724, 2725, 2726, 2727, 2728, 2729, 2730, 2731, 2732, 2733, 2734, 2735, 2736, 2737, 2738, 2739, 2740, 2741, 2742, 2743, 2744, 2745, 2746, 2747, 2748, 2749, 2750, 2751, 2752, 2753, 2754, 2755, 2756, 2757, 2758, 2759, 2760, 2761, 2762, 2763, 2764, 2765, 2766, 2767, 2768, 2769, 2770, 2771, 2772, 2773, 2774, 2775, 2776, 2777, 2778, 2779, 2780, 2781, 2782, 2783, 2784, 2785, 2786, 2787, 2788, 2789, 2790, 2791, 2792, 2793, 2794, 2795, 2796, 2797, 2798, 2799, 2800, 2801, 2802, 2803, 2804, 2805, 2806, 2807, 2808, 2809, 2810, 2811, 2812, 2813, 2814, 2815, 2816, 2817, 2818, 2819, 2820, 2821, 2822, 2823, 2824, 2825, 2826, 2827, 2828, 2829, 2830, 2831, 2832, 2833, 2834, 2835, 2836, 2837, 2838, 2839, 2840, 2841, 2842, 2843, 2844, 2845, 2846, 2847, 2848, 2849, 2850, 2851, 2852, 2853, 2854, 2855, 2856, 2857, 2858, 2859, 2860, 2861, 2862, 2863, 2864, 2865, 2866, 2867, 2868, 2869, 2870, 2871, 2872, 2873, 2874, 2875, 2876, 2877, 2878, 2879, 2880, 2881, 2882, 2883, 2884, 2885, 2886, 2887, 2888, 2889, 2890, 2891, 2892, 2893, 2894, 2895, 2896, 2897, 2898, 2899, 2900, 2901, 2902, 2903, 2904, 2905, 2906, 2907, 2908, 2909, 2910, 2911, 2912, 2913, 2914, 2915, 2916, 2917, 2918, 2919, 2920, 2921, 2922, 2923, 2924, 2925, 2926, 2927, 2928, 2929, 2930, 2931, 2932, 2933, 2934, 2935, 2936, 2937, 2938, 2939, 2940, 2941, 2942, 2943, 2944, 2945, 2946, 2947, 2948, 2949, 2950, 2951, 2952, 2953, 2954, 2955, 2956, 2957, 2958, 2959, 2960, 2961, 2962, 2963, 2964, 2965, 2966, 2967, 2968, 2969, 2970, 2971, 2972, 2973, 2974, 2975, 2976, 2977, 2978, 2979, 2980, 2981, 2982, 2983, 2984, 2985, 2986, 2987, 2988, 2989, 2990, 2991, 2992, 2993, 2994, 2995, 2996, 2997, 2998, 2999, 3000, 3001, 3002, 3003, 3004, 3005, 3006, 3007, 3008, 3009, 3010, 3011, 3012, 3013, 3014, 3015, 3016, 3017, 3018, 3019, 3020, 3021, 3022, 3023, 3024, 3025, 3026, 3027, 3028, 3029, 3030, 3031, 3032, 3033, 3034, 3035, 3036, 3037, 3038, 3039 |
| `PbtModLauncherX-Data/Modificaciones/INTEGRACION-UPSTREAM-v1.0.7.md` | E | 693 | 34, 40, 46, 56, 297, 825, 1084, 1087, 1154, 1188, 1257, 1299, 1527, 1528, 1531, 1534, 1549, 1552, 1556, 1571, 1599, 1607, 1779, 1780, 1781, 1782, 1783, 1784, 1785, 1786, 1787, 1788, 1789, 1790, 1791, 1792, 1793, 1794, 1795, 1796, 1797, 1798, 1799, 1800, 1801, 1802, 1803, 1804, 1805, 1806, 1807, 1808, 1809, 1810, 1811, 1812, 1813, 1814, 1815, 1816, 1817, 1818, 1819, 1820, 1821, 1822, 1823, 1824, 1825, 1826, 1827, 1828, 1829, 1830, 1831, 1832, 1833, 1834, 1835, 1836, 1837, 1838, 1839, 1840, 1841, 1842, 1843, 1844, 1845, 1846, 1847, 1848, 1849, 1850, 1851, 1852, 1853, 1854, 1855, 1856, 1857, 1858, 1859, 1860, 1861, 1862, 1863, 1864, 1897, 1898, 1899, 1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908, 1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917, 1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926, 1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935, 1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944, 1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953, 1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962, 1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971, 1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980, 1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989, 1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035, 2036, 2037, 2038, 2039, 2040, 2041, 2042, 2043, 2044, 2045, 2046, 2047, 2048, 2049, 2050, 2051, 2052, 2053, 2054, 2055, 2056, 2057, 2058, 2059, 2060, 2061, 2062, 2063, 2064, 2065, 2066, 2067, 2068, 2069, 2070, 2071, 2072, 2073, 2074, 2075, 2076, 2077, 2078, 2079, 2080, 2081, 2082, 2083, 2084, 2085, 2086, 2087, 2088, 2089, 2090, 2091, 2092, 2093, 2094, 2095, 2096, 2097, 2098, 2099, 2100, 2101, 2102, 2103, 2104, 2105, 2106, 2107, 2108, 2109, 2110, 2111, 2112, 2113, 2114, 2115, 2116, 2117, 2118, 2119, 2120, 2121, 2122, 2123, 2124, 2125, 2126, 2127, 2128, 2129, 2130, 2131, 2132, 2133, 2134, 2135, 2136, 2137, 2138, 2139, 2140, 2141, 2142, 2143, 2144, 2145, 2146, 2147, 2148, 2149, 2150, 2151, 2152, 2153, 2154, 2155, 2156, 2157, 2158, 2159, 2160, 2161, 2162, 2163, 2164, 2165, 2166, 2167, 2168, 2169, 2170, 2171, 2172, 2173, 2174, 2175, 2176, 2177, 2178, 2179, 2180, 2181, 2182, 2183, 2184, 2185, 2186, 2187, 2188, 2189, 2190, 2191, 2192, 2193, 2194, 2195, 2196, 2197, 2198, 2199, 2200, 2201, 2202, 2203, 2204, 2205, 2206, 2207, 2208, 2209, 2210, 2211, 2212, 2213, 2214, 2215, 2216, 2217, 2218, 2219, 2220, 2221, 2222, 2223, 2224, 2225, 2226, 2227, 2228, 2229, 2230, 2231, 2232, 2233, 2234, 2235, 2236, 2237, 2238, 2239, 2240, 2241, 2242, 2243, 2244, 2245, 2246, 2247, 2248, 2249, 2250, 2251, 2252, 2253, 2254, 2255, 2256, 2257, 2258, 2259, 2260, 2261, 2262, 2263, 2264, 2265, 2266, 2267, 2268, 2269, 2270, 2271, 2272, 2273, 2274, 2275, 2276, 2277, 2278, 2279, 2280, 2281, 2282, 2283, 2284, 2285, 2286, 2287, 2288, 2289, 2290, 2291, 2292, 2293, 2294, 2295, 2296, 2297, 2298, 2299, 2300, 2301, 2302, 2303, 2304, 2305, 2306, 2307, 2308, 2309, 2310, 2311, 2312, 2313, 2314, 2315, 2316, 2317, 2318, 2319, 2320, 2321, 2322, 2323, 2324, 2325, 2326, 2327, 2328, 2329, 2330, 2331, 2332, 2333, 2334, 2335, 2336, 2337, 2338, 2339, 2340, 2341, 2342, 2343, 2344, 2345, 2346, 2347, 2348, 2349, 2350, 2351, 2352, 2353, 2354, 2355, 2356, 2357, 2358, 2359, 2360, 2361, 2362, 2363, 2364, 2365, 2366, 2367, 2368, 2369, 2370, 2371, 2372, 2373, 2374, 2375, 2376, 2377, 2378, 2379, 2380, 2381, 2382, 2383, 2384, 2385, 2386, 2387, 2388, 2389, 2390, 2391, 2392, 2393, 2394, 2395, 2396, 2397, 2398, 2399, 2400, 2401, 2402, 2403, 2404, 2405, 2406, 2407, 2408, 2409, 2410, 2411, 2412, 2413, 2414, 2415, 2416, 2417, 2418, 2419, 2420, 2421, 2422, 2423, 2424, 2425, 2426, 2427, 2428, 2429, 2430, 2431, 2432, 2433, 2434, 2435, 2436, 2437, 2438, 2439, 2440, 2441, 2442, 2443, 2444, 2445, 2446, 2447, 2448, 2449, 2450, 2451, 2452, 2453, 2454, 2455, 2456, 2457, 2760, 2761, 2762, 2763, 2764, 2765, 2766, 2767, 2768, 2769, 2770, 2771, 2772, 2773, 2774, 2775, 2776, 2777, 2778, 2779, 2780, 2781, 2782, 2783 |
| `PbtModLauncherX-Data/Modificaciones/Registro-Archivos.txt` | E | 14 | 11, 20, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46 |
| `PbtModLauncherX-Data/Website/index.html` | B | 1 | 72 |
| `PbtModLauncherX-Data/release-v1.0.6.md` | B | 1 | 5 |
| `README.md` | D | 5 | 5, 11, 12, 28 |
| `assets/diagram.drawio` | D | 5 | 7, 16, 25, 34, 37 |
| `assets/diagram.svg` | D | 10 | 1 |
| `assets/third-party.drawio` | D | 2 | 28, 43 |
| `deskgap-app/build.ts` | B | 3 | 6, 11, 22 |
| `deskgap-app/package.json` | A | 1 | 5 |
| `deskgap-app/package.json` | B | 7 | 2, 13, 21, 22, 23, 24, 25 |
| `deskgap-app/packaging.test.ts` | B | 1 | 54 |
| `deskgap-app/packaging.ts` | A | 2 | 103, 110 |
| `deskgap-app/releaseWorkflow.test.ts` | B | 9 | 10, 57, 60, 100, 117, 120, 121, 140, 141 |
| `deskgap-app/src/browser.ts` | A | 3 | 176, 179, 454 |
| `deskgap-app/src/browser.ts` | B | 12 | 9, 10, 11, 16, 25, 26, 29, 32, 48, 49, 50, 51 |
| `deskgap-app/src/controller.ts` | B | 5 | 1, 2, 3, 500, 504 |
| `deskgap-app/src/launcherApp.ts` | B | 19 | 1, 2, 3, 4, 9, 10, 11, 12, 13, 14, 15, 16, 26, 99, 105, 106, 107, 123, 233 |
| `deskgap-app/src/migration.ts` | A | 1 | 81 |
| `deskgap-app/src/migration.ts` | B | 2 | 1, 3 |
| `deskgap-app/src/pluginGameLaunch.ts` | B | 2 | 1, 2 |
| `deskgap-app/src/pluginOptifine.test.ts` | B | 3 | 1, 2, 3 |
| `deskgap-app/src/pluginOptifine.ts` | B | 6 | 1, 2, 3, 4, 5, 6 |
| `deskgap-app/src/plugins.ts` | B | 29 | 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38 |
| `deskgap-app/src/serviceBridge.test.ts` | B | 1 | 1 |
| `deskgap-app/src/serviceBridge.ts` | B | 1 | 1 |
| `deskgap-app/src/services.ts` | B | 25 | 1, 2, 3, 4, 5, 6, 7, 8, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37 |
| `deskgap-app/src/transport.test.ts` | B | 2 | 7, 13 |
| `deskgap-app/src/transport.ts` | B | 10 | 4, 19, 20, 21, 22, 27, 28, 32, 35, 38 |
| `deskgap-app/src/updateFeed.test.ts` | B | 2 | 4, 23 |
| `deskgap-app/src/updater.test.ts` | B | 3 | 1, 21, 36 |
| `deskgap-app/src/updater.ts` | B | 3 | 1, 2, 3 |
| `deskgap-app/src/updaterHost.ts` | B | 5 | 1, 2, 3, 4, 11 |
| `deskgap-app/tsconfig.json` | B | 5 | 8, 9, 10, 20, 21 |
| `deskgap-app/unicodeRegex.test.ts` | B | 2 | 13, 80 |
| `e2e/README.md` | B | 11 | 1, 15, 87, 89, 141, 142, 143, 146, 160, 180, 192 |
| `e2e/TESTIDS.md` | B | 604 | 5, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276, 277, 278, 279, 280, 281 |
| `e2e/fixtures/launcher.ts` | B | 20 | 6, 8, 9, 31, 56, 58, 59, 181, 187, 188, 192, 193, 194, 205, 209, 210, 213, 214, 215 |
| `e2e/fixtures/packaged.ts` | B | 18 | 5, 7, 29, 38, 52, 88, 114, 119, 122, 133, 136, 142, 143, 144, 145, 146, 162 |
| `e2e/helpers/auth-mock.ts` | B | 1 | 9 |
| `e2e/helpers/network.ts` | B | 1 | 11 |
| `e2e/package.json` | B | 2 | 2, 5 |
| `e2e/playwright.config.ts` | B | 5 | 8, 9, 32, 34, 44 |
| `e2e/specs/ci/00-smoke-boot.spec.ts` | B | 1 | 9 |
| `e2e/specs/release/00-packaged-boot.spec.ts` | B | 8 | 16, 17, 77, 85, 87, 94 |
| `e2e/specs/showcase/04-import-modpack.spec.ts` | B | 1 | 38 |
| `i18n/CONTRIBUTING.de.md` | D | 19 | 28, 31, 33, 34, 35, 38, 40, 41, 53, 60, 64, 65, 66, 67, 80, 112, 218 |
| `i18n/CONTRIBUTING.i18n.md` | D | 4 | 20, 27, 43, 44 |
| `i18n/CONTRIBUTING.ko.md` | D | 19 | 28, 31, 33, 34, 35, 38, 40, 41, 54, 61, 65, 66, 67, 68, 81, 114, 221 |
| `i18n/CONTRIBUTING.pl.md` | D | 19 | 28, 31, 33, 34, 35, 38, 40, 41, 53, 60, 64, 65, 66, 67, 80, 112, 218 |
| `i18n/CONTRIBUTING.ru.md` | D | 19 | 29, 32, 34, 35, 36, 39, 41, 42, 55, 62, 66, 67, 68, 69, 82, 114, 221 |
| `i18n/CONTRIBUTING.ua.md` | D | 19 | 29, 32, 34, 35, 36, 39, 41, 42, 55, 62, 66, 67, 68, 69, 82, 114, 221 |
| `i18n/CONTRIBUTING.zh.md` | D | 19 | 29, 32, 34, 35, 36, 39, 41, 42, 54, 61, 65, 66, 67, 68, 81, 112, 220 |
| `i18n/README.de.md` | D | 15 | 2, 3, 8, 9, 11, 12, 22, 25, 27, 28, 32, 34, 36, 59 |
| `i18n/README.es.md` | D | 18 | 2, 3, 8, 9, 11, 12, 22, 25, 27, 28, 32, 34, 45, 46, 64, 68, 78 |
| `i18n/README.hu.md` | D | 18 | 2, 3, 8, 9, 11, 12, 22, 25, 27, 28, 32, 34, 45, 46, 65, 69, 79 |
| `i18n/README.jp.md` | D | 14 | 2, 3, 8, 9, 11, 12, 22, 25, 27, 28, 32, 34, 60 |
| `i18n/README.ko.md` | D | 19 | 2, 3, 8, 9, 11, 12, 22, 25, 27, 28, 32, 34, 45, 46, 65, 69, 79 |
| `i18n/README.kz.md` | D | 15 | 2, 3, 8, 9, 11, 12, 22, 25, 27, 28, 32, 34, 60, 70 |
| `i18n/README.pl.md` | D | 14 | 2, 3, 8, 9, 11, 12, 22, 25, 27, 28, 32, 34, 59 |
| `i18n/README.ru.md` | D | 14 | 2, 3, 8, 9, 11, 12, 22, 25, 27, 28, 32, 34, 59 |
| `i18n/README.uk.md` | D | 14 | 2, 3, 8, 9, 11, 12, 22, 25, 27, 28, 32, 34, 59 |
| `i18n/README.zh.md` | D | 15 | 2, 3, 8, 9, 11, 12, 22, 25, 27, 28, 33, 35, 54 |
| `installer/install.ps1` | A | 8 | 3, 9, 15, 34, 38, 49, 126 |
| `installer/install.ps1` | B | 1 | 75 |
| `installer/install.ps1` | C | 4 | 8, 31, 63, 91 |
| `installer/install.sh` | A | 10 | 2, 8, 15, 18, 19, 20, 23 |
| `installer/install.sh` | B | 7 | 77, 136, 165, 166, 177, 178, 179 |
| `installer/install.sh` | C | 4 | 7, 11, 12, 74 |
| `latest_version.json` | D | 68 | 35, 69, 103, 137, 171, 205, 239, 273, 307, 341, 375, 409, 443, 477, 511, 545, 579, 613, 647, 681, 715, 749, 783, 817, 851, 885, 919, 953, 987, 1021, 1055, 1089, 1123, 1157, 1191, 1225, 1259, 1293, 1327, 1361, 1395, 1429, 1463, 1497, 1531, 1565, 1599, 1633, 1667, 1670, 1691, 1701, 1703, 1704, 1705 |
| `package.json` | B | 24 | 12, 13, 14, 16, 18, 19, 20, 22, 23, 24, 25, 26, 27, 28, 29 |
| `packages/asm/README.md` | D | 8 | 3, 4, 5, 6, 18 |
| `packages/asm/index.ts` | B | 1 | 30 |
| `packages/asm/package.json` | B | 2 | 2, 36 |
| `packages/asm/package.json` | D | 1 | 21 |
| `packages/bore/package.json` | B | 2 | 2, 36 |
| `packages/bore/package.json` | D | 1 | 21 |
| `packages/bytebuffer/README.md` | D | 10 | 3, 4, 5, 6, 28, 36, 37 |
| `packages/bytebuffer/index.ts` | B | 1 | 22 |
| `packages/bytebuffer/package.json` | B | 2 | 2, 59 |
| `packages/bytebuffer/package.json` | D | 1 | 43 |
| `packages/client/README.md` | D | 9 | 3, 4, 5, 6, 18, 39 |
| `packages/client/channel.ts` | B | 1 | 1 |
| `packages/client/coders.test.ts` | B | 1 | 20 |
| `packages/client/coders.ts` | B | 4 | 1, 2, 3, 4 |
| `packages/client/index.ts` | B | 1 | 7 |
| `packages/client/package.json` | B | 7 | 2, 16, 17, 20, 21, 22, 43 |
| `packages/client/package.json` | D | 1 | 26 |
| `packages/client/status.ts` | B | 1 | 2 |
| `packages/core/README.md` | D | 10 | 3, 4, 5, 6, 18, 30, 48 |
| `packages/core/index.ts` | B | 1 | 7 |
| `packages/core/launch.ts` | B | 1 | 1 |
| `packages/core/package.json` | B | 5 | 2, 12, 13, 21, 43 |
| `packages/core/package.json` | D | 1 | 25 |
| `packages/curseforge/README.md` | D | 9 | 3, 4, 5, 6, 20, 39 |
| `packages/curseforge/index.ts` | B | 1 | 3 |
| `packages/curseforge/package.json` | B | 1 | 2 |
| `packages/curseforge/package.json` | D | 1 | 25 |
| `packages/discord-rpc/package.json` | B | 2 | 2, 43 |
| `packages/discord-rpc/package.json` | D | 1 | 29 |
| `packages/file-transfer/README.md` | D | 15 | 3, 4, 5, 6, 22, 30, 37, 59, 74, 94, 117, 143 |
| `packages/file-transfer/download.test.ts` | B | 4 | 44, 47, 357, 822 |
| `packages/file-transfer/index.ts` | B | 1 | 2 |
| `packages/file-transfer/package.json` | B | 2 | 2, 42 |
| `packages/file-transfer/package.json` | D | 1 | 24 |
| `packages/forge-site-parser/README.md` | D | 7 | 3, 4, 5, 6 |
| `packages/forge-site-parser/index.ts` | B | 1 | 2 |
| `packages/forge-site-parser/package.json` | B | 2 | 2, 45 |
| `packages/forge-site-parser/package.json` | D | 1 | 24 |
| `packages/game-data/README.md` | D | 10 | 3, 4, 5, 6, 18, 27, 60 |
| `packages/game-data/index.ts` | B | 1 | 2 |
| `packages/game-data/level.ts` | B | 3 | 2, 4, 5 |
| `packages/game-data/package.json` | B | 6 | 2, 11, 12, 20, 21, 44 |
| `packages/game-data/package.json` | D | 1 | 25 |
| `packages/game-data/serverDat.test.ts` | B | 1 | 3 |
| `packages/game-data/serverDat.ts` | B | 1 | 1 |
| `packages/gamesetting/README.md` | D | 8 | 3, 4, 5, 6, 18 |
| `packages/gamesetting/index.ts` | B | 1 | 5 |
| `packages/gamesetting/package.json` | B | 2 | 2, 38 |
| `packages/gamesetting/package.json` | D | 1 | 21 |
| `packages/installer/README.md` | D | 6 | 3, 16, 21, 50, 86, 92 |
| `packages/installer/assets.ts` | B | 2 | 1, 2 |
| `packages/installer/diagnose.test.ts` | B | 1 | 2 |
| `packages/installer/error.ts` | B | 1 | 1 |
| `packages/installer/fabric.ts` | B | 2 | 1, 2 |
| `packages/installer/forge.browser.test.ts` | B | 1 | 10 |
| `packages/installer/forge.browser.ts` | B | 1 | 1 |
| `packages/installer/forge.test.ts` | B | 2 | 1, 2 |
| `packages/installer/forge.ts` | B | 3 | 1, 2, 4 |
| `packages/installer/forgeWorkflow.ts` | B | 2 | 1, 2 |
| `packages/installer/index.ts` | B | 1 | 4 |
| `packages/installer/installManifest.default.test.ts` | B | 1 | 24 |
| `packages/installer/installManifest.default.ts` | B | 1 | 7 |
| `packages/installer/installManifest.exdev.test.ts` | B | 1 | 20 |
| `packages/installer/installManifest.test.ts` | B | 2 | 393, 422 |
| `packages/installer/installManifest.ts` | B | 1 | 1 |
| `packages/installer/installer.test.ts` | B | 2 | 1, 15 |
| `packages/installer/installer.ts` | B | 1 | 7 |
| `packages/installer/java-runtime.browser.test.ts` | B | 3 | 2, 17, 18 |
| `packages/installer/java-runtime.browser.ts` | B | 1 | 1 |
| `packages/installer/javaInstallManifest.test.ts` | B | 1 | 1 |
| `packages/installer/javaInstallManifest.ts` | B | 1 | 1 |
| `packages/installer/javaWorkflow.test.ts` | B | 1 | 20 |
| `packages/installer/labymod.ts` | B | 1 | 2 |
| `packages/installer/libraries.ts` | B | 3 | 2, 3, 4 |
| `packages/installer/minecraft.test.ts` | B | 1 | 1 |
| `packages/installer/minecraft.ts` | B | 1 | 11 |
| `packages/installer/neoforge.test.ts` | B | 1 | 1 |
| `packages/installer/neoforge.ts` | B | 1 | 1 |
| `packages/installer/optifine.ts` | B | 3 | 1, 2, 3 |
| `packages/installer/package.json` | B | 10 | 2, 12, 13, 21, 22, 23, 24, 25, 26, 53 |
| `packages/installer/package.json` | D | 1 | 33 |
| `packages/installer/profile.test.ts` | B | 1 | 7 |
| `packages/installer/profile.ts` | B | 3 | 8, 9, 12 |
| `packages/installer/quilt.ts` | B | 1 | 1 |
| `packages/installer/recovery.test.ts` | B | 2 | 1, 18 |
| `packages/installer/utils.ts` | B | 1 | 6 |
| `packages/installer/versionInstallManifest.ts` | B | 1 | 1 |
| `packages/instance/README.md` | D | 6 | 1, 17, 25, 44, 74, 88 |
| `packages/instance/duplicate.test.ts` | B | 2 | 16, 45 |
| `packages/instance/files_handler.test.ts` | B | 1 | 37 |
| `packages/instance/instance.ts` | B | 1 | 81 |
| `packages/instance/launcher_parser.ts` | B | 1 | 1 |
| `packages/instance/manifest_generation.test.ts` | B | 1 | 57 |
| `packages/instance/modpack.ts` | B | 5 | 1, 2, 150, 390, 413 |
| `packages/instance/package.json` | B | 4 | 2, 22, 23, 24 |
| `packages/instance/parsers/multimc_parser.ts` | B | 1 | 36 |
| `packages/instance/server_config.test.ts` | B | 2 | 25, 43 |
| `packages/instance/server_exporter.test.ts` | B | 1 | 4 |
| `packages/instance/server_exporter.ts` | B | 1 | 1 |
| `packages/instance/server_exporter_ssh.ts` | B | 1 | 1 |
| `packages/mod-parser/README.md` | D | 13 | 3, 4, 5, 6, 14, 27, 36, 37, 56, 67 |
| `packages/mod-parser/fabric.test.ts` | B | 1 | 4 |
| `packages/mod-parser/fabric.ts` | B | 1 | 1 |
| `packages/mod-parser/forge.test.ts` | B | 1 | 5 |
| `packages/mod-parser/forge.ts` | B | 2 | 1, 3 |
| `packages/mod-parser/index.ts` | B | 1 | 2 |
| `packages/mod-parser/liteloader.ts` | B | 1 | 1 |
| `packages/mod-parser/package.json` | B | 6 | 2, 11, 12, 20, 21, 49 |
| `packages/mod-parser/package.json` | D | 1 | 26 |
| `packages/mod-parser/quilt.ts` | B | 1 | 1 |
| `packages/model/README.md` | D | 9 | 3, 4, 5, 6, 21, 34 |
| `packages/model/block.ts` | B | 1 | 1 |
| `packages/model/index.ts` | B | 1 | 2 |
| `packages/model/package.json` | B | 4 | 2, 11, 19, 42 |
| `packages/model/package.json` | D | 1 | 24 |
| `packages/modrinth/README.md` | D | 9 | 3, 4, 5, 6, 20, 37 |
| `packages/modrinth/index.ts` | B | 1 | 3 |
| `packages/modrinth/package.json` | B | 1 | 2 |
| `packages/modrinth/package.json` | D | 1 | 25 |
| `packages/multiplayer-core/lib/codec.test.ts` | B | 1 | 1 |
| `packages/multiplayer-core/lib/codec.ts` | B | 1 | 1 |
| `packages/multiplayer-core/lib/multiplayer.test.ts` | B | 1 | 1 |
| `packages/multiplayer-core/lib/multiplayer.ts` | B | 1 | 15 |
| `packages/multiplayer-core/lib/peer.test.ts` | B | 1 | 1 |
| `packages/multiplayer-core/lib/peer.ts` | B | 1 | 8 |
| `packages/multiplayer-core/lib/room.test.ts` | B | 1 | 1 |
| `packages/multiplayer-core/lib/room.ts` | B | 1 | 10 |
| `packages/multiplayer-core/lib/selectedCandidate.ts` | B | 1 | 1 |
| `packages/multiplayer-core/package.json` | B | 4 | 3, 5, 63, 66 |
| `packages/nat-api/README.md` | D | 2 | 19, 31 |
| `packages/nat-api/index.ts` | B | 1 | 2 |
| `packages/nat-api/package.json` | B | 1 | 3 |
| `packages/nat-api/package.json` | D | 1 | 45 |
| `packages/nbt/README.md` | D | 9 | 3, 4, 5, 6, 18, 34 |
| `packages/nbt/index.ts` | B | 2 | 5, 8 |
| `packages/nbt/package.json` | B | 4 | 2, 14, 36, 46 |
| `packages/nbt/package.json` | D | 1 | 23 |
| `packages/nbt/utils.ts` | B | 1 | 1 |
| `packages/oxlint-config/oxlintrc.json` | B | 4 | 41, 47, 53, 59 |
| `packages/oxlint-config/package.json` | B | 2 | 2, 6 |
| `packages/resource/Resource.ts` | B | 2 | 1, 2 |
| `packages/resource/ResourceManager.ts` | B | 1 | 17 |
| `packages/resource/ResourceMetadata.ts` | B | 3 | 1, 2, 3 |
| `packages/resource/core/getFile.test.ts` | B | 1 | 16 |
| `packages/resource/core/migrate.ts` | B | 2 | 229, 243 |
| `packages/resource/core/shouldIgnoreFile.test.ts` | B | 1 | 1 |
| `packages/resource/core/shouldIgnoreFile.ts` | B | 1 | 1 |
| `packages/resource/core/watchResourcesDirectory.ts` | B | 1 | 1 |
| `packages/resource/mod.ts` | B | 1 | 1 |
| `packages/resource/package.json` | B | 8 | 2, 27, 28, 29, 30, 31, 32, 33 |
| `packages/resource/parsers/fabric_mod.ts` | B | 1 | 1 |
| `packages/resource/parsers/forge_mod.ts` | B | 1 | 1 |
| `packages/resource/parsers/index.ts` | B | 2 | 1, 2 |
| `packages/resource/parsers/liteloader_mod.ts` | B | 1 | 1 |
| `packages/resource/parsers/neoforge_mod.ts` | B | 1 | 1 |
| `packages/resource/parsers/quilt_mod.ts` | B | 1 | 1 |
| `packages/resource/parsers/resource_pack.ts` | B | 1 | 1 |
| `packages/resourcepack/README.md` | D | 15 | 3, 4, 5, 6, 18, 34, 42, 59, 82, 83, 107, 108 |
| `packages/resourcepack/index.ts` | B | 2 | 9, 12 |
| `packages/resourcepack/package.json` | B | 4 | 2, 11, 12, 20 |
| `packages/resourcepack/package.json` | D | 1 | 24 |
| `packages/resourcepack/resourcePack.test.ts` | B | 1 | 75 |
| `packages/resourcepack/resourcePack.ts` | B | 1 | 11 |
| `packages/schematic/formats/litematica.ts` | B | 2 | 1, 196 |
| `packages/schematic/formats/sponge.ts` | B | 2 | 1, 108 |
| `packages/schematic/formats/structure.ts` | B | 1 | 1 |
| `packages/schematic/nbtSchema.ts` | B | 3 | 1, 2, 5 |
| `packages/schematic/nbtUtil.ts` | B | 3 | 1, 2, 13 |
| `packages/schematic/package.json` | B | 5 | 2, 11, 12, 20, 43 |
| `packages/schematic/package.json` | D | 1 | 24 |
| `packages/semver/README.md` | D | 8 | 3, 4, 5, 6, 12 |
| `packages/semver/index.ts` | B | 1 | 2 |
| `packages/semver/package.json` | B | 2 | 2, 26 |
| `packages/semver/package.json` | D | 1 | 22 |
| `packages/sqlite/NodeSqliteDriver.ts` | B | 1 | 29 |
| `packages/sqlite/package.json` | B | 2 | 2, 28 |
| `packages/sqlite/package.json` | D | 1 | 23 |
| `packages/system/README.md` | D | 8 | 3, 4, 5, 6, 16 |
| `packages/system/index.ts` | B | 3 | 2, 4, 15 |
| `packages/system/package.json` | B | 9 | 2, 12, 13, 14, 23, 24, 42 |
| `packages/system/package.json` | D | 1 | 29 |
| `packages/text-component/README.md` | D | 10 | 3, 4, 5, 6, 18, 26, 49 |
| `packages/text-component/index.ts` | B | 1 | 2 |
| `packages/text-component/package.json` | B | 2 | 2, 40 |
| `packages/text-component/package.json` | D | 1 | 21 |
| `packages/unzip/README.md` | D | 7 | 3, 4, 5, 6 |
| `packages/unzip/index.test.ts` | B | 2 | 3, 5 |
| `packages/unzip/index.ts` | B | 3 | 2, 6, 90 |
| `packages/unzip/package.json` | B | 6 | 2, 11, 12, 20, 23, 45 |
| `packages/unzip/package.json` | D | 1 | 27 |
| `packages/user/README.md` | D | 17 | 3, 4, 5, 6, 7, 8, 32, 37, 71, 94, 121 |
| `packages/user/index.ts` | B | 1 | 2 |
| `packages/user/microsoft.ts` | B | 1 | 146 |
| `packages/user/package.json` | B | 1 | 2 |
| `packages/user/package.json` | D | 1 | 28 |
| `packages/utils/package.json` | B | 2 | 2, 5 |
| `packages/worker/package.json` | B | 2 | 2, 5 |
| `packages/wrtc-multiplayer/lib/NodeDataChannel.ts` | B | 2 | 1, 2 |
| `packages/wrtc-multiplayer/package.json` | B | 5 | 3, 5, 16, 17, 22 |
| `packages/yauzl/README.md` | D | 2 | 1, 3 |
| `packages/yauzl/index.d.ts` | B | 1 | 1 |
| `packages/yauzl/index.js` | B | 1 | 477 |
| `packages/yauzl/index.test.ts` | B | 3 | 49, 149, 166 |
| `packages/yauzl/package.json` | B | 2 | 2, 46 |
| `packages/yauzl/package.json` | D | 3 | 22, 37, 39 |
| `pnpm-lock.yaml` | B | 156 | 120, 123, 126, 128, 129, 131, 132, 175, 196, 217, 238, 241, 244, 251, 272, 279, 323, 345, 367, 385, 388, 395, 419, 437, 440, 443, 446, 449, 452, 474, 495, 498, 501, 526, 529, 539, 560, 570, 601, 603, 605, 642, 655, 698, 701, 704, 707, 710, 713, 716, 740, 756, 763, 784, 802, 820, 823, 833, 854, 874, 881, 982, 985, 995, 1017, 1027, 1066, 1069, 1072, 1075, 1078, 1081, 1084, 1087, 1090, 1092, 1093, 1095, 1096, 1099, 1102, 1105, 1202, 1216, 1219, 1222, 1225, 1228, 1231, 1234, 1237, 1240, 1243, 1246, 1249, 1251, 1252, 1255, 1258, 1343, 1386, 1427, 1430, 1433, 1436, 1439, 1442, 1445, 1448, 1451, 1454, 1457, 1460, 1463, 1466, 1469, 1472, 1475, 1478, 1481, 1483, 1484, 1487, 1490, 1493, 1496, 1499, 1502, 1505, 1508, 1626, 1648, 1650, 1653, 1656, 1659, 1662, 1665, 1668, 1671, 1674, 1677, 1680, 1683, 1686, 1689, 1692, 1695, 1698, 1701, 1704, 1714, 3743, 3746, 8706, 8708 |
| `pnpm-workspace.yaml` | B | 5 | 4, 5, 6, 7, 8 |
| `scripts/build-tutorial.ts` | A | 1 | 88 |
| `scripts/docs.ts` | B | 2 | 56, 327 |
| `scripts/docs.ts` | D | 1 | 6 |
| `scripts/gen-testids.ts` | B | 3 | 2, 21, 76 |
| `tsconfig.json` | B | 3 | 20, 21, 22 |
| `vitest.config.mts` | B | 4 | 4, 6, 8, 9 |
| `xmcl-asar/README.md` | D | 10 | 1, 3, 14, 15, 16, 37 |
| `xmcl-asar/package.json` | C | 6 | 2, 4, 9, 10, 12 |
| `xmcl-electron-app/build.ts` | B | 2 | 74, 170 |
| `xmcl-electron-app/build.ts.bak` | E | 1 | 46 |
| `xmcl-electron-app/build/appinstaller-builder.ts.bak` | E | 4 | 8, 14 |
| `xmcl-electron-app/build/electron-builder.config.test.ts` | B | 6 | 7, 9, 15, 32 |
| `xmcl-electron-app/build/electron-builder.config.ts` | B | 3 | 25, 114, 115 |
| `xmcl-electron-app/build/electron-builder.config.ts.bak` | E | 5 | 16, 17, 94, 95, 99 |
| `xmcl-electron-app/build/electron-builder.ts` | B | 1 | 26 |
| `xmcl-electron-app/build/linuxPackageScripts.test.ts` | B | 33 | 23, 27, 33, 36, 37, 39, 44, 45, 52, 53, 54, 57, 59, 60, 74, 81, 100, 104, 106, 112, 118, 119, 120, 145, 154, 167, 171, 191, 198 |
| `xmcl-electron-app/main/BrowserRtcController.ts` | B | 2 | 5, 9 |
| `xmcl-electron-app/main/ElectronController.ts` | A | 2 | 230, 275 |
| `xmcl-electron-app/main/ElectronController.ts` | B | 5 | 10, 11, 12, 13, 535 |
| `xmcl-electron-app/main/ElectronLauncherApp.ts` | B | 12 | 1, 2, 3, 4, 5, 157, 159, 161, 163, 164, 195, 331 |
| `xmcl-electron-app/main/ElectronSecretStorage.ts` | B | 2 | 1, 40 |
| `xmcl-electron-app/main/ServerService.test.ts` | B | 14 | 1, 2, 3, 4, 53, 57, 58, 59, 68, 108, 189, 225, 237, 272 |
| `xmcl-electron-app/main/ServerService.ts` | A | 2 | 217, 218 |
| `xmcl-electron-app/main/ServerService.ts` | B | 5 | 13, 14, 15, 16, 17 |
| `xmcl-electron-app/main/agentDocuments.test.ts` | B | 1 | 1 |
| `xmcl-electron-app/main/constant.ts` | B | 1 | 3 |
| `xmcl-electron-app/main/constant.ts.bak` | E | 2 | 3, 4 |
| `xmcl-electron-app/main/controllers/gameLaunch.ts` | B | 1 | 3 |
| `xmcl-electron-app/main/controllers/i18n.ts` | B | 1 | 2 |
| `xmcl-electron-app/main/controllers/optifine.ts` | B | 3 | 3, 4, 17 |
| `xmcl-electron-app/main/controllers/optifineSource.ts` | B | 1 | 1 |
| `xmcl-electron-app/main/controllers/taskProgress.ts` | B | 1 | 3 |
| `xmcl-electron-app/main/controllers/theme.ts` | B | 1 | 4 |
| `xmcl-electron-app/main/controllers/tray.ts` | B | 2 | 3, 7 |
| `xmcl-electron-app/main/controllers/tray.ts.bak` | E | 2 | 3, 6 |
| `xmcl-electron-app/main/defaultApp.ts` | B | 1 | 2 |
| `xmcl-electron-app/main/defaultApp.ts.bak` | E | 1 | 2 |
| `xmcl-electron-app/main/definedPlugins.ts` | B | 28 | 9, 10, 11, 12, 13, 14, 15, 16, 17, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45 |
| `xmcl-electron-app/main/definedServices.ts` | B | 25 | 1, 2, 3, 4, 5, 6, 7, 8, 9, 23, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41 |
| `xmcl-electron-app/main/index.ts` | B | 3 | 22, 23, 24 |
| `xmcl-electron-app/main/linuxDisplay.test.ts` | B | 1 | 65 |
| `xmcl-electron-app/main/locales/de.yaml` | A | 1 | 20 |
| `xmcl-electron-app/main/locales/es-ES.yaml` | A | 1 | 20 |
| `xmcl-electron-app/main/locales/fr.yaml` | A | 1 | 20 |
| `xmcl-electron-app/main/locales/hu.yaml` | A | 1 | 20 |
| `xmcl-electron-app/main/locales/ja-JP.yaml` | A | 1 | 20 |
| `xmcl-electron-app/main/locales/ko.yaml` | A | 1 | 20 |
| `xmcl-electron-app/main/locales/lolcat.yaml` | A | 1 | 19 |
| `xmcl-electron-app/main/locales/nl.yaml` | A | 1 | 18 |
| `xmcl-electron-app/main/locales/pl.yaml` | A | 1 | 20 |
| `xmcl-electron-app/main/locales/pt-BR.yaml` | A | 1 | 20 |
| `xmcl-electron-app/main/locales/ru.yaml` | A | 1 | 20 |
| `xmcl-electron-app/main/locales/tr.yaml` | A | 1 | 20 |
| `xmcl-electron-app/main/locales/uk.yaml` | A | 1 | 20 |
| `xmcl-electron-app/main/locales/zh-CN.yaml` | A | 1 | 18 |
| `xmcl-electron-app/main/locales/zh-TW.yaml` | A | 1 | 16 |
| `xmcl-electron-app/main/mainMultiplayerAdapters.test.ts` | B | 2 | 18, 107 |
| `xmcl-electron-app/main/mainMultiplayerAdapters.ts` | B | 3 | 1, 2, 9 |
| `xmcl-electron-app/main/multiplayerTelemetry.test.ts` | B | 1 | 1 |
| `xmcl-electron-app/main/multiplayerTelemetry.ts` | B | 1 | 1 |
| `xmcl-electron-app/main/networkDiagnostics.test.ts` | B | 2 | 8, 13 |
| `xmcl-electron-app/main/networkDiagnostics.ts` | B | 3 | 1, 2, 3 |
| `xmcl-electron-app/main/pluginAgentDocuments.ts` | B | 2 | 1, 2 |
| `xmcl-electron-app/main/pluginAutoUpdate.ts` | B | 2 | 1, 8 |
| `xmcl-electron-app/main/pluginIconProtocol.ts` | B | 1 | 2 |
| `xmcl-electron-app/main/pluginLinuxDisplay.ts` | B | 1 | 1 |
| `xmcl-electron-app/main/pluginMultiplayer.ts` | B | 6 | 1, 5, 6, 7, 20, 47 |
| `xmcl-electron-app/main/pluginPowerMonitor.ts` | B | 3 | 1, 2, 7 |
| `xmcl-electron-app/main/utils/gameWindow/x11.ts` | B | 12 | 6, 7, 20, 21, 22, 23, 24, 25, 27, 28, 29 |
| `xmcl-electron-app/main/utils/login.ts` | A | 1 | 201 |
| `xmcl-electron-app/main/utils/updater.ts` | B | 6 | 7, 8, 13, 14, 15, 79 |
| `xmcl-electron-app/main/utils/updater.ts.bak` | E | 4 | 2, 3, 4, 5 |
| `xmcl-electron-app/main/utils/updater.ts.old` | E | 6 | 2, 3, 4, 5, 6, 119 |
| `xmcl-electron-app/main/utils/windowSizeTracker.ts` | B | 1 | 1 |
| `xmcl-electron-app/main/utils/windowsUtils.ts` | B | 3 | 2, 7, 9 |
| `xmcl-electron-app/package.json` | B | 15 | 26, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54 |
| `xmcl-electron-app/package.json` | D | 1 | 91 |
| `xmcl-electron-app/package.json.bak` | E | 10 | 25, 41, 42, 43, 44, 45, 46, 47, 48, 49 |
| `xmcl-electron-app/plugins/esbuild.native.plugin.ts` | B | 2 | 82, 222 |
| `xmcl-electron-app/plugins/esbuild.renderer.plugin.ts` | B | 1 | 9 |
| `xmcl-electron-app/postinstall.ts` | B | 2 | 25, 28 |
| `xmcl-electron-app/postinstall.ts.bak` | E | 3 | 26, 29, 32 |
| `xmcl-electron-app/preload/apps.ts` | B | 1 | 1 |
| `xmcl-electron-app/preload/bootstrap.ts` | B | 1 | 2 |
| `xmcl-electron-app/preload/controller.ts` | B | 1 | 1 |
| `xmcl-electron-app/preload/migration.ts` | B | 1 | 1 |
| `xmcl-electron-app/preload/monitor.ts` | B | 2 | 1, 2 |
| `xmcl-electron-app/preload/multiplayerNetworkDiagnostics.ts` | B | 1 | 1 |
| `xmcl-electron-app/preload/multiplayerRtc.ts` | B | 2 | 1, 2 |
| `xmcl-electron-app/preload/service.ts` | B | 3 | 3, 8, 12 |
| `xmcl-electron-app/preload/task.ts` | B | 1 | 3 |
| `xmcl-electron-app/preload/telemetry.ts` | B | 1 | 1 |
| `xmcl-electron-app/preload/tsconfig.json` | B | 2 | 22, 31 |
| `xmcl-electron-app/tsconfig.json` | B | 4 | 19, 29, 30, 42 |
| `xmcl-keystone-ui/locales/ar-EG.yaml` | A | 10 | 53, 376, 540, 1030, 1517, 1600, 1740, 1871, 1872, 2151 |
| `xmcl-keystone-ui/locales/ar-EG.yaml` | C | 8 | 35, 36, 1040, 1047, 1049, 1057, 1067 |
| `xmcl-keystone-ui/locales/ar.yaml` | A | 8 | 346, 518, 1024, 1449, 1530, 1660, 1794, 1795 |
| `xmcl-keystone-ui/locales/ar.yaml` | C | 8 | 1034, 1041, 1043, 1051, 1061, 1437, 1438 |
| `xmcl-keystone-ui/locales/bn.yaml` | A | 9 | 53, 376, 540, 1030, 1519, 1602, 1742, 1872, 1873 |
| `xmcl-keystone-ui/locales/bn.yaml` | C | 8 | 35, 36, 1040, 1047, 1049, 1057, 1067 |
| `xmcl-keystone-ui/locales/ca.yaml` | A | 1 | 1149 |
| `xmcl-keystone-ui/locales/de.yaml` | A | 8 | 354, 534, 1044, 1487, 1554, 1700, 1853, 1854 |
| `xmcl-keystone-ui/locales/de.yaml` | C | 8 | 1054, 1061, 1063, 1071, 1081, 1463, 1464 |
| `xmcl-keystone-ui/locales/en-IN.yaml` | A | 10 | 67, 445, 628, 1197, 1731, 1821, 1978, 2128, 2129, 2418 |
| `xmcl-keystone-ui/locales/en-IN.yaml` | C | 8 | 41, 42, 1207, 1214, 1216, 1224, 1234 |
| `xmcl-keystone-ui/locales/en.yaml` | A | 17 | 93, 493, 679, 755, 756, 757, 1355, 1919, 2011, 2166, 2186, 2307, 2308, 2615 |
| `xmcl-keystone-ui/locales/en.yaml` | B | 1 | 886 |
| `xmcl-keystone-ui/locales/en.yaml` | C | 16 | 54, 69, 459, 890, 892, 894, 897, 899, 911, 1357, 1368, 1405, 1413, 1454, 1455 |
| `xmcl-keystone-ui/locales/es-ES.yaml` | A | 6 | 86, 449, 1180, 1677, 2054, 2433 |
| `xmcl-keystone-ui/locales/es-ES.yaml` | C | 8 | 68, 69, 1190, 1197, 1199, 1207, 1217 |
| `xmcl-keystone-ui/locales/fr.yaml` | A | 7 | 327, 1006, 1424, 1490, 1626, 1766, 1767 |
| `xmcl-keystone-ui/locales/fr.yaml` | C | 8 | 1016, 1023, 1025, 1033, 1043, 1399, 1400 |
| `xmcl-keystone-ui/locales/gl.yaml` | A | 8 | 331, 494, 982, 1410, 1472, 1606, 1739, 1740 |
| `xmcl-keystone-ui/locales/gl.yaml` | C | 8 | 992, 999, 1001, 1009, 1019, 1386, 1387 |
| `xmcl-keystone-ui/locales/hi.yaml` | A | 9 | 53, 376, 540, 1030, 1519, 1602, 1742, 1873, 1874 |
| `xmcl-keystone-ui/locales/hi.yaml` | C | 8 | 35, 36, 1040, 1047, 1049, 1057, 1067 |
| `xmcl-keystone-ui/locales/hu.yaml` | A | 8 | 336, 513, 1015, 1448, 1512, 1650, 1786, 1787 |
| `xmcl-keystone-ui/locales/hu.yaml` | C | 8 | 1025, 1032, 1034, 1042, 1052, 1423, 1424 |
| `xmcl-keystone-ui/locales/id.yaml` | A | 10 | 53, 376, 540, 1030, 1519, 1602, 1742, 1873, 1874, 2153 |
| `xmcl-keystone-ui/locales/id.yaml` | C | 8 | 35, 36, 1040, 1047, 1049, 1057, 1067 |
| `xmcl-keystone-ui/locales/it-IT.yaml` | A | 8 | 306, 481, 982, 1400, 1463, 1602, 1738, 1739 |
| `xmcl-keystone-ui/locales/it-IT.yaml` | C | 8 | 992, 999, 1001, 1009, 1019, 1375, 1376 |
| `xmcl-keystone-ui/locales/ja-JP.yaml` | A | 9 | 316, 480, 955, 1444, 1505, 1509, 1638, 1768, 1769 |
| `xmcl-keystone-ui/locales/ja-JP.yaml` | C | 8 | 965, 972, 974, 982, 992, 1421, 1422 |
| `xmcl-keystone-ui/locales/ko.yaml` | A | 9 | 344, 499, 971, 1407, 1468, 1622, 1753, 1754, 2035 |
| `xmcl-keystone-ui/locales/ko.yaml` | C | 8 | 981, 988, 990, 998, 1008, 2017, 2018 |
| `xmcl-keystone-ui/locales/kz.yaml` | A | 7 | 331, 493, 976, 1404, 1466, 1601, 1733 |
| `xmcl-keystone-ui/locales/kz.yaml` | C | 8 | 986, 993, 995, 1003, 1013, 1380, 1381 |
| `xmcl-keystone-ui/locales/lolcat.yaml` | A | 8 | 328, 488, 966, 1389, 1451, 1584, 1716, 1717 |
| `xmcl-keystone-ui/locales/lolcat.yaml` | C | 8 | 976, 983, 985, 993, 1003, 1365, 1366 |
| `xmcl-keystone-ui/locales/nl.yaml` | A | 7 | 332, 498, 987, 1414, 1477, 1610, 1742 |
| `xmcl-keystone-ui/locales/nl.yaml` | C | 8 | 997, 1004, 1006, 1014, 1024, 1390, 1391 |
| `xmcl-keystone-ui/locales/pl.yaml` | A | 7 | 297, 475, 971, 1450, 1591, 1725, 1726 |
| `xmcl-keystone-ui/locales/pl.yaml` | C | 8 | 981, 988, 990, 998, 1008, 1372, 1373 |
| `xmcl-keystone-ui/locales/pt-BR.yaml` | A | 8 | 332, 503, 994, 1408, 1471, 1610, 1746, 1747 |
| `xmcl-keystone-ui/locales/pt-BR.yaml` | C | 8 | 1004, 1011, 1013, 1021, 1031, 1384, 1385 |
| `xmcl-keystone-ui/locales/ru.yaml` | A | 9 | 42, 355, 527, 1028, 1322, 1395, 1535, 1668, 1669 |
| `xmcl-keystone-ui/locales/ru.yaml` | C | 8 | 40, 41, 1038, 1045, 1047, 1055, 1065 |
| `xmcl-keystone-ui/locales/sa.yaml` | A | 7 | 53, 376, 1030, 1517, 1600, 1871, 1872 |
| `xmcl-keystone-ui/locales/sa.yaml` | C | 8 | 35, 36, 1040, 1047, 1049, 1057, 1067 |
| `xmcl-keystone-ui/locales/ta.yaml` | A | 10 | 53, 376, 540, 1030, 1519, 1602, 1742, 1873, 1874, 2153 |
| `xmcl-keystone-ui/locales/ta.yaml` | C | 8 | 35, 36, 1040, 1047, 1049, 1057, 1067 |
| `xmcl-keystone-ui/locales/tr.yaml` | A | 10 | 349, 508, 983, 1473, 1587, 1630, 1761, 1762, 2039, 2163 |
| `xmcl-keystone-ui/locales/tr.yaml` | C | 8 | 993, 1000, 1002, 1010, 1020, 2021, 2022 |
| `xmcl-keystone-ui/locales/uk.yaml` | A | 9 | 40, 377, 536, 1030, 1517, 1655, 1787, 1788, 2118 |
| `xmcl-keystone-ui/locales/uk.yaml` | C | 9 | 38, 39, 348, 1040, 1047, 1049, 1057, 1067 |
| `xmcl-keystone-ui/locales/vi.yaml` | A | 10 | 53, 376, 540, 1030, 1519, 1602, 1742, 1873, 1874, 2153 |
| `xmcl-keystone-ui/locales/vi.yaml` | C | 8 | 35, 36, 1040, 1047, 1049, 1057, 1067 |
| `xmcl-keystone-ui/locales/zh-CN.yaml` | A | 16 | 42, 410, 595, 676, 677, 678, 1180, 1714, 1810, 1814, 1939, 2083, 2084 |
| `xmcl-keystone-ui/locales/zh-CN.yaml` | B | 1 | 2346 |
| `xmcl-keystone-ui/locales/zh-CN.yaml` | C | 15 | 40, 51, 1182, 1193, 1195, 1233, 1257, 1262, 2350, 2352, 2354, 2357, 2359, 2371 |
| `xmcl-keystone-ui/locales/zh-HK.yaml` | A | 11 | 58, 387, 572, 1076, 1571, 1654, 1658, 1797, 1937, 1938, 2232 |
| `xmcl-keystone-ui/locales/zh-HK.yaml` | C | 8 | 40, 41, 1086, 1093, 1095, 1103, 1113 |
| `xmcl-keystone-ui/locales/zh-TW.yaml` | A | 9 | 324, 494, 967, 1465, 1538, 1542, 1669, 1809, 1810 |
| `xmcl-keystone-ui/locales/zh-TW.yaml` | C | 8 | 977, 984, 986, 994, 1004, 1442, 1443 |
| `xmcl-keystone-ui/package.json` | B | 18 | 2, 22, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 79 |
| `xmcl-keystone-ui/package.json` | D | 1 | 95 |
| `xmcl-keystone-ui/scripts/i18n-core.mjs` | B | 1 | 28 |
| `xmcl-keystone-ui/scripts/i18n.mjs` | B | 3 | 39, 40, 41 |
| `xmcl-keystone-ui/src/assets/driver.css` | B | 1 | 1 |
| `xmcl-keystone-ui/src/components/AgentMarketList.vue` | B | 4 | 78, 79, 156 |
| `xmcl-keystone-ui/src/components/AppCollectionInstallAll.vue` | B | 2 | 26, 27 |
| `xmcl-keystone-ui/src/components/AppCollectionList.vue` | B | 1 | 8 |
| `xmcl-keystone-ui/src/components/AppImageControls.vue` | B | 1 | 26 |
| `xmcl-keystone-ui/src/components/AppImageDialog.vue` | B | 1 | 69 |
| `xmcl-keystone-ui/src/components/AppLocalCollectionList.vue` | B | 1 | 111 |
| `xmcl-keystone-ui/src/components/AppearanceItems.vue` | B | 1 | 467 |
| `xmcl-keystone-ui/src/components/BaseSettingModrinthProjectCard.vue` | B | 2 | 5, 56 |
| `xmcl-keystone-ui/src/components/CurseforgeCategoryChip.vue` | B | 1 | 19 |
| `xmcl-keystone-ui/src/components/FeedbackCard.vue` | B | 1 | 54 |
| `xmcl-keystone-ui/src/components/InstanceItem.vue` | B | 1 | 2 |
| `xmcl-keystone-ui/src/components/InstanceManifestFileItem.vue` | B | 3 | 65, 71, 100 |
| `xmcl-keystone-ui/src/components/InstanceServerCard.vue` | B | 1 | 79 |
| `xmcl-keystone-ui/src/components/LinkSharedFolderSetting.vue` | B | 1 | 29 |
| `xmcl-keystone-ui/src/components/MarketFilterPanel.vue` | B | 1 | 334 |
| `xmcl-keystone-ui/src/components/MarketItem.vue` | B | 5 | 178, 310, 313, 341, 346 |
| `xmcl-keystone-ui/src/components/MarketProjectDetail.vue` | B | 11 | 78, 546, 555, 704, 1059, 1060, 1061, 1062, 1063, 1064, 1065 |
| `xmcl-keystone-ui/src/components/MarketProjectDetailContentSave.vue` | B | 1 | 94 |
| `xmcl-keystone-ui/src/components/MarketProjectDetailCurseforge.vue` | B | 3 | 45, 46, 60 |
| `xmcl-keystone-ui/src/components/MarketProjectDetailModrinth.vue` | B | 4 | 22, 23, 40, 306 |
| `xmcl-keystone-ui/src/components/MarketProjectDetailVersion.vue` | B | 7 | 147, 148, 149, 150, 151, 152, 153 |
| `xmcl-keystone-ui/src/components/MarketUpgradePanel.vue` | B | 6 | 27, 28, 37, 38, 48, 58 |
| `xmcl-keystone-ui/src/components/MinecraftFriendRow.vue` | B | 1 | 57 |
| `xmcl-keystone-ui/src/components/ModloaderSelector.vue` | B | 2 | 109, 110 |
| `xmcl-keystone-ui/src/components/ModrinthCategoryChip.vue` | B | 1 | 17 |
| `xmcl-keystone-ui/src/components/SaveProgress.vue` | B | 1 | 64 |
| `xmcl-keystone-ui/src/components/SaveProgressCanvas.vue` | B | 1 | 283 |
| `xmcl-keystone-ui/src/components/SaveWorldMap.vue` | B | 1 | 179 |
| `xmcl-keystone-ui/src/components/ServerDeploymentFileSelector.vue` | B | 1 | 14 |
| `xmcl-keystone-ui/src/components/StepSelect.vue` | B | 5 | 57, 62, 68, 74, 80 |
| `xmcl-keystone-ui/src/components/StepServer.vue` | B | 1 | 119 |
| `xmcl-keystone-ui/src/components/StoreExploreCardModern.vue` | B | 2 | 140, 142 |
| `xmcl-keystone-ui/src/components/StoreGallery.vue` | B | 2 | 24 |
| `xmcl-keystone-ui/src/components/TextComponent.ts` | B | 1 | 1 |
| `xmcl-keystone-ui/src/components/UserAccountSwitcher.vue` | B | 2 | 137, 138 |
| `xmcl-keystone-ui/src/components/UserCardAddYggdrasilService.vue` | B | 1 | 238 |
| `xmcl-keystone-ui/src/components/UserLoginAuthoritySelect.vue` | B | 1 | 55 |
| `xmcl-keystone-ui/src/components/UserLoginForm.vue` | B | 3 | 200, 257, 586 |
| `xmcl-keystone-ui/src/components/UserLoginForm.vue` | C | 2 | 189, 581 |
| `xmcl-keystone-ui/src/components/UserProfileDialog.vue` | B | 1 | 49 |
| `xmcl-keystone-ui/src/components/UserSkin.vue` | B | 1 | 105 |
| `xmcl-keystone-ui/src/components/UserSkinLibraryDialog.vue` | B | 1 | 388 |
| `xmcl-keystone-ui/src/components/VersionInputForge.vue` | B | 1 | 3 |
| `xmcl-keystone-ui/src/components/VersionInputLocal.vue` | B | 1 | 2 |
| `xmcl-keystone-ui/src/components/XmclAccountPanel.vue` | B | 45 | 3, 4, 5, 11, 13, 16, 22, 27, 31, 37, 39, 45, 50, 58, 65, 70, 74, 78, 81, 85, 92, 96, 102, 107, 116, 122, 125, 134, 140, 147, 158, 172, 183, 197, 208, 222, 230, 236, 239, 280, 308, 312, 370 |
| `xmcl-keystone-ui/src/composables/agent/access.test.ts` | B | 1 | 11 |
| `xmcl-keystone-ui/src/composables/agent/access.ts` | B | 1 | 1 |
| `xmcl-keystone-ui/src/composables/agent/capabilityContext.ts` | B | 2 | 3, 16 |
| `xmcl-keystone-ui/src/composables/agent/commands.ts` | A | 2 | 156, 591 |
| `xmcl-keystone-ui/src/composables/agent/compaction.test.ts` | B | 4 | 1, 7, 8, 69 |
| `xmcl-keystone-ui/src/composables/agent/compaction.ts` | B | 1 | 2 |
| `xmcl-keystone-ui/src/composables/agent/confirm.ts` | B | 1 | 1 |
| `xmcl-keystone-ui/src/composables/agent/context.test.ts` | B | 2 | 22, 23 |
| `xmcl-keystone-ui/src/composables/agent/context.ts` | B | 3 | 1, 51 |
| `xmcl-keystone-ui/src/composables/agent/cssAgent.ts` | B | 1 | 1 |
| `xmcl-keystone-ui/src/composables/agent/index.ts` | B | 3 | 1, 140, 141 |
| `xmcl-keystone-ui/src/composables/agent/local.ts` | B | 2 | 5, 21 |
| `xmcl-keystone-ui/src/composables/agent/marketFilters.ts` | B | 1 | 1 |
| `xmcl-keystone-ui/src/composables/agent/migration.ts` | B | 1 | 1 |
| `xmcl-keystone-ui/src/composables/agent/modDiagnosis.ts` | B | 1 | 3 |
| `xmcl-keystone-ui/src/composables/agent/passiveEvents.ts` | B | 1 | 1 |
| `xmcl-keystone-ui/src/composables/agent/projection.ts` | B | 1 | 7 |
| `xmcl-keystone-ui/src/composables/agent/prompt.ts` | A | 7 | 66, 92, 121, 122, 123 |
| `xmcl-keystone-ui/src/composables/agent/prompt.ts` | B | 2 | 1, 60 |
| `xmcl-keystone-ui/src/composables/agent/protocol.ts` | B | 3 | 7, 92 |
| `xmcl-keystone-ui/src/composables/agent/settings.ts` | B | 4 | 8, 14, 44, 63 |
| `xmcl-keystone-ui/src/composables/agent/telemetry.ts` | B | 1 | 5 |
| `xmcl-keystone-ui/src/composables/agent/toolSupport.ts` | B | 1 | 3 |
| `xmcl-keystone-ui/src/composables/agent/tools.test.ts` | B | 8 | 248, 249, 252, 262, 287, 289, 310 |
| `xmcl-keystone-ui/src/composables/agent/tools.ts` | A | 4 | 1793, 1804, 1805, 1863 |
| `xmcl-keystone-ui/src/composables/agent/tools.ts` | B | 4 | 8, 9, 10, 33 |
| `xmcl-keystone-ui/src/composables/agent/ui.ts` | B | 1 | 1 |
| `xmcl-keystone-ui/src/composables/agent/vfs.ts` | B | 1 | 1 |
| `xmcl-keystone-ui/src/composables/appDropHandler.ts` | B | 11 | 3, 84, 86, 87, 88, 89, 142, 145, 148, 151, 154 |
| `xmcl-keystone-ui/src/composables/authProfileImport.ts` | B | 1 | 2 |
| `xmcl-keystone-ui/src/composables/collectionInstall.test.ts` | B | 2 | 2, 3 |
| `xmcl-keystone-ui/src/composables/collectionInstall.ts` | B | 4 | 1, 2, 3, 4 |
| `xmcl-keystone-ui/src/composables/collectionResolver.test.ts` | B | 1 | 2 |
| `xmcl-keystone-ui/src/composables/collectionResolver.ts` | B | 3 | 1, 2, 3 |
| `xmcl-keystone-ui/src/composables/commandHost.ts` | B | 5 | 21, 22, 23, 31, 221 |
| `xmcl-keystone-ui/src/composables/criticalStatus.ts` | B | 1 | 1 |
| `xmcl-keystone-ui/src/composables/curseforge.ts` | B | 1 | 5 |
| `xmcl-keystone-ui/src/composables/curseforgeDependencies.ts` | B | 2 | 4, 5 |
| `xmcl-keystone-ui/src/composables/curseforgeInstaller.ts` | B | 3 | 5, 6, 7 |
| `xmcl-keystone-ui/src/composables/curseforgeSearch.ts` | B | 1 | 3 |
| `xmcl-keystone-ui/src/composables/customCss.ts` | B | 2 | 1, 68 |
| `xmcl-keystone-ui/src/composables/dataRootErrors.ts` | B | 1 | 1 |
| `xmcl-keystone-ui/src/composables/environment.ts` | B | 1 | 1 |
| `xmcl-keystone-ui/src/composables/error.ts` | B | 1 | 1 |
| `xmcl-keystone-ui/src/composables/errorHandler.ts` | B | 1 | 1 |
| `xmcl-keystone-ui/src/composables/exception.ts` | B | 1 | 7 |
| `xmcl-keystone-ui/src/composables/extensionItems.ts` | B | 2 | 4, 5 |
| `xmcl-keystone-ui/src/composables/ftb.ts` | B | 1 | 5 |
| `xmcl-keystone-ui/src/composables/homeCards.ts` | B | 1 | 8 |
| `xmcl-keystone-ui/src/composables/i18n.ts` | B | 2 | 1, 80 |
| `xmcl-keystone-ui/src/composables/i18nSearch.ts` | B | 3 | 4, 5, 6 |
| `xmcl-keystone-ui/src/composables/instance.ts` | B | 1 | 1 |
| `xmcl-keystone-ui/src/composables/instanceBlueprints.ts` | B | 1 | 1 |
| `xmcl-keystone-ui/src/composables/instanceContextMenu.ts` | B | 2 | 1, 8 |
| `xmcl-keystone-ui/src/composables/instanceCreation.test.ts` | B | 1 | 3 |
| `xmcl-keystone-ui/src/composables/instanceCreation.ts` | B | 3 | 17, 18, 23 |
| `xmcl-keystone-ui/src/composables/instanceEdit.ts` | B | 2 | 1, 3 |
| `xmcl-keystone-ui/src/composables/instanceFileNodeData.ts` | B | 1 | 5 |
| `xmcl-keystone-ui/src/composables/instanceFiles.ts` | B | 2 | 1, 6 |
| `xmcl-keystone-ui/src/composables/instanceGroup.ts` | B | 1 | 3 |
| `xmcl-keystone-ui/src/composables/instanceInstallOperation.ts` | B | 2 | 1, 2 |
| `xmcl-keystone-ui/src/composables/instanceJava.ts` | B | 2 | 1, 6 |
| `xmcl-keystone-ui/src/composables/instanceLaunch.ts` | B | 2 | 3, 13 |
| `xmcl-keystone-ui/src/composables/instanceLaunchCoordinator.test.ts` | B | 1 | 1 |
| `xmcl-keystone-ui/src/composables/instanceLaunchCoordinator.ts` | B | 2 | 1, 2 |
| `xmcl-keystone-ui/src/composables/instanceLaunchMenuItems.test.ts` | B | 1 | 1 |
| `xmcl-keystone-ui/src/composables/instanceLaunchMenuItems.ts` | B | 1 | 3 |
| `xmcl-keystone-ui/src/composables/instanceModLoaderDefault.ts` | B | 2 | 3, 4 |
| `xmcl-keystone-ui/src/composables/instanceModpackMetadata.ts` | B | 1 | 3 |
| `xmcl-keystone-ui/src/composables/instanceMods.ts` | B | 3 | 6, 12, 13 |
| `xmcl-keystone-ui/src/composables/instanceOptions.ts` | B | 1 | 1 |
| `xmcl-keystone-ui/src/composables/instanceResourcePack.ts` | B | 3 | 4, 10, 15 |
| `xmcl-keystone-ui/src/composables/instanceSave.ts` | B | 1 | 2 |
| `xmcl-keystone-ui/src/composables/instanceSaveDatapack.ts` | B | 2 | 2, 3 |
| `xmcl-keystone-ui/src/composables/instanceSaveProgress.test.ts` | B | 1 | 1 |
| `xmcl-keystone-ui/src/composables/instanceSaveProgress.ts` | B | 1 | 2 |
| `xmcl-keystone-ui/src/composables/instanceServerInfo.ts` | B | 1 | 2 |
| `xmcl-keystone-ui/src/composables/instanceShaderPack.ts` | B | 3 | 4, 5, 13 |
| `xmcl-keystone-ui/src/composables/instanceSharing.test.ts` | B | 1 | 1 |
| `xmcl-keystone-ui/src/composables/instanceSharing.ts` | B | 1 | 1 |
| `xmcl-keystone-ui/src/composables/instanceTemplates.ts` | B | 3 | 3, 4, 5 |
| `xmcl-keystone-ui/src/composables/instanceTheme.ts` | B | 1 | 2 |
| `xmcl-keystone-ui/src/composables/instanceUpdate.ts` | B | 1 | 2 |
| `xmcl-keystone-ui/src/composables/instanceUpdate.ts` | D | 1 | 1 |
| `xmcl-keystone-ui/src/composables/instanceVersion.ts` | B | 3 | 1, 2, 3 |
| `xmcl-keystone-ui/src/composables/instanceVersionInstall.test.ts` | B | 2 | 1, 2 |
| `xmcl-keystone-ui/src/composables/instanceVersionInstall.ts` | B | 4 | 4, 5, 6, 12 |
| `xmcl-keystone-ui/src/composables/instances.ts` | B | 2 | 2, 3 |
| `xmcl-keystone-ui/src/composables/java.ts` | B | 1 | 3 |
| `xmcl-keystone-ui/src/composables/javaImport.ts` | B | 1 | 1 |
| `xmcl-keystone-ui/src/composables/launchButton.ts` | B | 2 | 2, 16 |
| `xmcl-keystone-ui/src/composables/launchException.ts` | B | 1 | 2 |
| `xmcl-keystone-ui/src/composables/launchPreview.ts` | B | 1 | 3 |
| `xmcl-keystone-ui/src/composables/launchTask.ts` | B | 1 | 3 |
| `xmcl-keystone-ui/src/composables/launcherNews.ts` | C | 1 | 24 |
| `xmcl-keystone-ui/src/composables/localCollections.ts` | B | 1 | 1 |
| `xmcl-keystone-ui/src/composables/login.ts` | B | 1 | 7 |
| `xmcl-keystone-ui/src/composables/marketCollectionSearch.ts` | B | 3 | 2, 3, 4 |
| `xmcl-keystone-ui/src/composables/marketInstall.test.ts` | B | 1 | 1 |
| `xmcl-keystone-ui/src/composables/marketInstall.ts` | B | 2 | 1, 2 |
| `xmcl-keystone-ui/src/composables/marketSort.test.ts` | B | 1 | 1 |
| `xmcl-keystone-ui/src/composables/marketSort.ts` | B | 1 | 1 |
| `xmcl-keystone-ui/src/composables/minecraftFriends.ts` | B | 1 | 8 |
| `xmcl-keystone-ui/src/composables/minecraftLicense.ts` | B | 1 | 2 |
| `xmcl-keystone-ui/src/composables/modContextMenu.ts` | B | 1 | 2 |
| `xmcl-keystone-ui/src/composables/modDependenciesCheck.ts` | B | 2 | 7, 8 |
| `xmcl-keystone-ui/src/composables/modDependencyInstall.test.ts` | B | 1 | 2 |
| `xmcl-keystone-ui/src/composables/modDependencyInstall.ts` | B | 2 | 1, 3 |
| `xmcl-keystone-ui/src/composables/modGroup.ts` | B | 1 | 10 |
| `xmcl-keystone-ui/src/composables/modInstall.test.ts` | B | 1 | 1 |
| `xmcl-keystone-ui/src/composables/modInstall.ts` | B | 3 | 1, 2, 3 |
| `xmcl-keystone-ui/src/composables/modLibCleaner.ts` | B | 1 | 7 |
| `xmcl-keystone-ui/src/composables/modSearch.ts` | B | 3 | 8, 19, 20 |
| `xmcl-keystone-ui/src/composables/modUpgrade.ts` | B | 3 | 9, 10, 11 |
| `xmcl-keystone-ui/src/composables/modUpgradeManifest.ts` | B | 4 | 1, 2, 3, 4 |
| `xmcl-keystone-ui/src/composables/modWizard.ts` | B | 2 | 2, 11 |
| `xmcl-keystone-ui/src/composables/modpack.ts` | B | 2 | 1, 2 |
| `xmcl-keystone-ui/src/composables/modpackInstaller.ts` | B | 2 | 2, 3 |
| `xmcl-keystone-ui/src/composables/modpackMetadataUpdater.ts` | B | 1 | 2 |
| `xmcl-keystone-ui/src/composables/modpackUrlInput.test.ts` | B | 2 | 34, 67 |
| `xmcl-keystone-ui/src/composables/modpackUrlInput.ts` | B | 1 | 16 |
| `xmcl-keystone-ui/src/composables/modrinth.ts` | B | 1 | 1 |
| `xmcl-keystone-ui/src/composables/modrinthAuthenticatedAPI.ts` | B | 2 | 5, 6 |
| `xmcl-keystone-ui/src/composables/modrinthDependencies.test.ts` | B | 1 | 3 |
| `xmcl-keystone-ui/src/composables/modrinthDependencies.ts` | B | 1 | 6 |
| `xmcl-keystone-ui/src/composables/modrinthInstaller.ts` | B | 3 | 5, 6, 7 |
| `xmcl-keystone-ui/src/composables/modrinthProjectBinding.ts` | B | 2 | 1, 2 |
| `xmcl-keystone-ui/src/composables/modrinthProjectDetailData.test.ts` | B | 1 | 1 |
| `xmcl-keystone-ui/src/composables/modrinthProjectDetailData.ts` | B | 2 | 9, 10 |
| `xmcl-keystone-ui/src/composables/modrinthProjectVersions.ts` | B | 1 | 1 |
| `xmcl-keystone-ui/src/composables/modrinthVersions.ts` | B | 2 | 5, 6 |
| `xmcl-keystone-ui/src/composables/monitor.ts` | B | 1 | 1 |
| `xmcl-keystone-ui/src/composables/multiplayerEntry.test.ts` | B | 2 | 6, 29 |
| `xmcl-keystone-ui/src/composables/multiplayerEntry.ts` | B | 7 | 1, 85, 89, 99, 100, 101, 103 |
| `xmcl-keystone-ui/src/composables/peers.ts` | B | 1 | 2 |
| `xmcl-keystone-ui/src/composables/presence.ts` | B | 1 | 1 |
| `xmcl-keystone-ui/src/composables/projectInstall.ts` | B | 1 | 15 |
| `xmcl-keystone-ui/src/composables/protocol.ts` | B | 1 | 1 |
| `xmcl-keystone-ui/src/composables/remoteServer.ts` | B | 2 | 2, 11 |
| `xmcl-keystone-ui/src/composables/resourcePackSearch.ts` | B | 1 | 3 |
| `xmcl-keystone-ui/src/composables/resourceParseError.ts` | B | 2 | 1, 2 |
| `xmcl-keystone-ui/src/composables/savesChunkClipboard.ts` | B | 1 | 2 |
| `xmcl-keystone-ui/src/composables/screenshot.ts` | B | 2 | 1, 4 |
| `xmcl-keystone-ui/src/composables/search.ts` | B | 1 | 6 |
| `xmcl-keystone-ui/src/composables/serverStatus.ts` | B | 2 | 1, 8 |
| `xmcl-keystone-ui/src/composables/serverUpstream.ts` | B | 1 | 7 |
| `xmcl-keystone-ui/src/composables/service.test.ts` | B | 1 | 1 |
| `xmcl-keystone-ui/src/composables/service.ts` | B | 1 | 1 |
| `xmcl-keystone-ui/src/composables/setting.ts` | B | 1 | 3 |
| `xmcl-keystone-ui/src/composables/syncableState.test.ts` | B | 1 | 3 |
| `xmcl-keystone-ui/src/composables/syncableState.ts` | B | 2 | 1, 31 |
| `xmcl-keystone-ui/src/composables/task.ts` | B | 1 | 2 |
| `xmcl-keystone-ui/src/composables/taskCompletion.test.ts` | B | 1 | 1 |
| `xmcl-keystone-ui/src/composables/taskCompletion.ts` | B | 1 | 1 |
| `xmcl-keystone-ui/src/composables/taskIcon.ts` | B | 3 | 4, 82, 88 |
| `xmcl-keystone-ui/src/composables/taskManager.ts` | B | 1 | 2 |
| `xmcl-keystone-ui/src/composables/telemetryTrack.ts` | B | 1 | 2 |
| `xmcl-keystone-ui/src/composables/theme.ts` | B | 1 | 5 |
| `xmcl-keystone-ui/src/composables/unresolvedFiles.ts` | B | 3 | 5, 6, 7 |
| `xmcl-keystone-ui/src/composables/useBlockModelPreview.ts` | B | 1 | 2 |
| `xmcl-keystone-ui/src/composables/useNetworkStatus.ts` | B | 1 | 1 |
| `xmcl-keystone-ui/src/composables/usePopularItems.ts` | B | 3 | 10, 11, 12 |
| `xmcl-keystone-ui/src/composables/useRecentMinecraftItems.ts` | B | 2 | 7, 8 |
| `xmcl-keystone-ui/src/composables/useSearchedItems.ts` | B | 1 | 13 |
| `xmcl-keystone-ui/src/composables/user.ts` | B | 2 | 2, 7 |
| `xmcl-keystone-ui/src/composables/userSkin.ts` | B | 1 | 2 |
| `xmcl-keystone-ui/src/composables/userSkinLibrary.ts` | B | 1 | 3 |
| `xmcl-keystone-ui/src/composables/version.ts` | B | 2 | 3, 4 |
| `xmcl-keystone-ui/src/composables/versionLocal.ts` | B | 2 | 2, 8 |
| `xmcl-keystone-ui/src/composables/xmclAccount.ts` | B | 1 | 5 |
| `xmcl-keystone-ui/src/composables/yggrasil.ts` | B | 1 | 1 |
| `xmcl-keystone-ui/src/global.d.ts` | B | 1 | 47 |
| `xmcl-keystone-ui/src/migration.html` | A | 1 | 7 |
| `xmcl-keystone-ui/src/rendererAction.ts` | B | 1 | 6 |
| `xmcl-keystone-ui/src/telemetry.test.ts` | B | 1 | 1 |
| `xmcl-keystone-ui/src/util/ReactiveResourceState.ts` | B | 2 | 1, 2 |
| `xmcl-keystone-ui/src/util/clients.ts` | B | 2 | 1, 2 |
| `xmcl-keystone-ui/src/util/crashPrompt.ts` | A | 7 | 29, 47, 89, 104, 116 |
| `xmcl-keystone-ui/src/util/curseforge.ts` | B | 3 | 1, 4, 5 |
| `xmcl-keystone-ui/src/util/extensionItems.ts` | B | 1 | 2 |
| `xmcl-keystone-ui/src/util/favicon.ts` | B | 2 | 1, 3 |
| `xmcl-keystone-ui/src/util/ftb.ts` | B | 2 | 1, 2 |
| `xmcl-keystone-ui/src/util/ftbClient.ts` | B | 1 | 1 |
| `xmcl-keystone-ui/src/util/instanceFileChecksumOverride.ts` | B | 1 | 1 |
| `xmcl-keystone-ui/src/util/instanceName.test.ts` | B | 1 | 3 |
| `xmcl-keystone-ui/src/util/instanceName.ts` | B | 1 | 1 |
| `xmcl-keystone-ui/src/util/isNoModloader.ts` | B | 1 | 1 |
| `xmcl-keystone-ui/src/util/javaPin.test.ts` | B | 1 | 2 |
| `xmcl-keystone-ui/src/util/javaPin.ts` | B | 1 | 1 |
| `xmcl-keystone-ui/src/util/javaState.test.ts` | B | 1 | 2 |
| `xmcl-keystone-ui/src/util/javaState.ts` | B | 2 | 1, 8 |
| `xmcl-keystone-ui/src/util/mod.ts` | B | 4 | 2, 3, 4, 5 |
| `xmcl-keystone-ui/src/util/modCompatible.ts` | B | 2 | 1, 2 |
| `xmcl-keystone-ui/src/util/modDependencies.ts` | B | 3 | 1, 2, 3 |
| `xmcl-keystone-ui/src/util/modSides.ts` | B | 1 | 1 |
| `xmcl-keystone-ui/src/util/modrinth.ts` | B | 3 | 2, 3, 5 |
| `xmcl-keystone-ui/src/util/multiplayerTogether.ts` | B | 2 | 1, 2 |
| `xmcl-keystone-ui/src/util/search.ts` | B | 4 | 1, 2, 3, 4 |
| `xmcl-keystone-ui/src/util/theme.v0.ts` | B | 1 | 1 |
| `xmcl-keystone-ui/src/util/theme.v1.ts` | B | 1 | 2 |
| `xmcl-keystone-ui/src/views/AppAddInstanceDialog.vue` | B | 3 | 218, 227, 244 |
| `xmcl-keystone-ui/src/views/AppAgentChat.vue` | B | 1 | 262 |
| `xmcl-keystone-ui/src/views/AppCommandPalette.vue` | B | 3 | 401, 402, 403 |
| `xmcl-keystone-ui/src/views/AppContextMenu.vue` | B | 3 | 39, 67, 88 |
| `xmcl-keystone-ui/src/views/AppFeedbackDialog.vue` | B | 2 | 112, 139 |
| `xmcl-keystone-ui/src/views/AppFeedbackDialog.vue` | C | 1 | 114 |
| `xmcl-keystone-ui/src/views/AppFeedbackDialog.vue` | D | 1 | 105 |
| `xmcl-keystone-ui/src/views/AppGameExitDialog.vue` | B | 1 | 83 |
| `xmcl-keystone-ui/src/views/AppGamepadModDialog.vue` | B | 1 | 121 |
| `xmcl-keystone-ui/src/views/AppGamepadSteamDeckDialog.vue` | B | 1 | 61 |
| `xmcl-keystone-ui/src/views/AppImportUrlDialog.test.ts` | B | 3 | 6, 51, 281 |
| `xmcl-keystone-ui/src/views/AppImportUrlDialog.vue` | B | 6 | 150, 155, 236, 237, 240, 241 |
| `xmcl-keystone-ui/src/views/AppJoinServerDialog.vue` | B | 1 | 163 |
| `xmcl-keystone-ui/src/views/AppLaunchBlockedDialog.vue` | B | 1 | 54 |
| `xmcl-keystone-ui/src/views/AppMigrateWizardDialog.vue` | B | 1 | 115 |
| `xmcl-keystone-ui/src/views/AppMinecraftFriendsDialog.vue` | B | 1 | 276 |
| `xmcl-keystone-ui/src/views/AppModrinthLoginDialog.vue` | B | 1 | 5 |
| `xmcl-keystone-ui/src/views/AppModrinthProjectBindDialog.vue` | B | 3 | 53, 54, 68 |
| `xmcl-keystone-ui/src/views/AppModrinthProjectCreateDialog.vue` | B | 3 | 5, 39, 40 |
| `xmcl-keystone-ui/src/views/AppModrinthVersionPublishDialog.vue` | B | 2 | 67, 69 |
| `xmcl-keystone-ui/src/views/AppMultiplayerLoginDialog.vue` | B | 8 | 54, 76, 99, 122, 145, 156, 167, 169 |
| `xmcl-keystone-ui/src/views/AppShareInstanceDialog.vue` | B | 1 | 155 |
| `xmcl-keystone-ui/src/views/AppSideBarGroupItem.vue` | B | 1 | 88 |
| `xmcl-keystone-ui/src/views/AppSideBarNotchItemGroup.vue` | B | 1 | 48 |
| `xmcl-keystone-ui/src/views/AppTaskDialogTaskItem.vue` | B | 1 | 163 |
| `xmcl-keystone-ui/src/views/AppTaskDialogTaskView.vue` | B | 1 | 276 |
| `xmcl-keystone-ui/src/views/AppTaskDialogTaskViewMessage.ts` | B | 1 | 2 |
| `xmcl-keystone-ui/src/views/AppUnauthenticatedWarningDialog.vue` | D | 1 | 148 |
| `xmcl-keystone-ui/src/views/BaseSetting.vue` | B | 2 | 150, 238 |
| `xmcl-keystone-ui/src/views/BaseSettingActions.vue` | B | 2 | 62, 64 |
| `xmcl-keystone-ui/src/views/BaseSettingAppearance.vue` | B | 1 | 39 |
| `xmcl-keystone-ui/src/views/BaseSettingBedrockVersions.vue` | B | 1 | 148 |
| `xmcl-keystone-ui/src/views/BaseSettingExtension.vue` | B | 1 | 124 |
| `xmcl-keystone-ui/src/views/BaseSettingGeneral.vue` | B | 1 | 124 |
| `xmcl-keystone-ui/src/views/BaseSettingJava.vue` | B | 1 | 232 |
| `xmcl-keystone-ui/src/views/BaseSettingJavaList.vue` | B | 1 | 94 |
| `xmcl-keystone-ui/src/views/BaseSettingLaunch.vue` | B | 1 | 226 |
| `xmcl-keystone-ui/src/views/BaseSettingModpackFiles.vue` | B | 5 | 28, 48, 229, 230, 241 |
| `xmcl-keystone-ui/src/views/BaseSettingModrinthProject.vue` | B | 3 | 10, 187, 188 |
| `xmcl-keystone-ui/src/views/BaseSettingServer.vue` | B | 1 | 152 |
| `xmcl-keystone-ui/src/views/BaseSettingServerItem.vue` | B | 1 | 112 |
| `xmcl-keystone-ui/src/views/BaseSettingServerRemote.vue` | B | 2 | 335, 336 |
| `xmcl-keystone-ui/src/views/BaseSettingServerRun.vue` | A | 1 | 429 |
| `xmcl-keystone-ui/src/views/BaseSettingServerRun.vue` | B | 4 | 324, 325, 326, 773 |
| `xmcl-keystone-ui/src/views/BaseSettingServerService.vue` | B | 3 | 86, 87, 114 |
| `xmcl-keystone-ui/src/views/BaseSettingSync.vue` | C | 1 | 51 |
| `xmcl-keystone-ui/src/views/BaseSettingVersions.vue` | B | 1 | 45 |
| `xmcl-keystone-ui/src/views/Blueprint.vue` | B | 1 | 484 |
| `xmcl-keystone-ui/src/views/BlueprintActions.vue` | B | 1 | 57 |
| `xmcl-keystone-ui/src/views/BlueprintPreview.vue` | B | 1 | 39 |
| `xmcl-keystone-ui/src/views/Home.vue` | B | 1 | 60 |
| `xmcl-keystone-ui/src/views/HomeActions.vue` | B | 2 | 63, 64 |
| `xmcl-keystone-ui/src/views/HomeBedrock.vue` | B | 1 | 101 |
| `xmcl-keystone-ui/src/views/HomeFooterCard.vue` | B | 2 | 204, 361 |
| `xmcl-keystone-ui/src/views/HomeInstanceInstallDialog.vue` | B | 2 | 299, 307 |
| `xmcl-keystone-ui/src/views/HomeLaunchButton.vue` | B | 1 | 127 |
| `xmcl-keystone-ui/src/views/HomeLaunchButtonMenuList.vue` | B | 2 | 279, 280 |
| `xmcl-keystone-ui/src/views/HomeLaunchButtonStatus.vue` | B | 1 | 72 |
| `xmcl-keystone-ui/src/views/HomeLaunchStatusDialog.vue` | B | 1 | 157 |
| `xmcl-keystone-ui/src/views/HomeLayout.vue` | A | 1 | 68 |
| `xmcl-keystone-ui/src/views/HomeLogDialog.vue` | B | 1 | 90 |
| `xmcl-keystone-ui/src/views/HomeModCard.vue` | B | 1 | 32 |
| `xmcl-keystone-ui/src/views/HomeResourcePacksCard.vue` | B | 1 | 33 |
| `xmcl-keystone-ui/src/views/HomeSavesCard.vue` | B | 1 | 28 |
| `xmcl-keystone-ui/src/views/HomeScreenshotCard.vue` | B | 1 | 139 |
| `xmcl-keystone-ui/src/views/HomeServerCard.vue` | B | 1 | 97 |
| `xmcl-keystone-ui/src/views/HomeShaderPackCard.vue` | B | 1 | 30 |
| `xmcl-keystone-ui/src/views/HomeUnresolvedFilesDialog.vue` | B | 2 | 177, 178 |
| `xmcl-keystone-ui/src/views/HomeUpstreamCurseforge.vue` | B | 1 | 15 |
| `xmcl-keystone-ui/src/views/HomeUpstreamCurseforge.vue` | D | 1 | 18 |
| `xmcl-keystone-ui/src/views/HomeUpstreamFeedTheBeast.vue` | B | 1 | 14 |
| `xmcl-keystone-ui/src/views/HomeUpstreamFeedTheBeast.vue` | D | 1 | 20 |
| `xmcl-keystone-ui/src/views/HomeUpstreamHeader.vue` | B | 2 | 145, 146 |
| `xmcl-keystone-ui/src/views/HomeUpstreamModrinth.vue` | B | 1 | 15 |
| `xmcl-keystone-ui/src/views/HomeUpstreamModrinth.vue` | D | 1 | 18 |
| `xmcl-keystone-ui/src/views/HomeUpstreamVersion.vue` | B | 4 | 155, 156, 157, 158 |
| `xmcl-keystone-ui/src/views/Me.vue` | B | 1 | 24 |
| `xmcl-keystone-ui/src/views/MeProfilePanel.vue` | B | 2 | 311, 312 |
| `xmcl-keystone-ui/src/views/Mod.vue` | B | 5 | 347, 494, 498, 502, 506 |
| `xmcl-keystone-ui/src/views/Mod.vue.bak` | E | 1 | 259 |
| `xmcl-keystone-ui/src/views/ModActions.vue` | B | 1 | 39 |
| `xmcl-keystone-ui/src/views/ModDetailOptifine.vue` | B | 2 | 13, 14 |
| `xmcl-keystone-ui/src/views/ModDetailResource.vue` | B | 2 | 14, 15 |
| `xmcl-keystone-ui/src/views/ModDuplicatedDialog.vue` | B | 1 | 9 |
| `xmcl-keystone-ui/src/views/ModGroupSelectDialog.vue` | B | 1 | 135 |
| `xmcl-keystone-ui/src/views/ModItem.vue` | B | 1 | 41 |
| `xmcl-keystone-ui/src/views/ModLabels.vue` | B | 1 | 39 |
| `xmcl-keystone-ui/src/views/Multiplayer.vue` | B | 3 | 639, 648, 980 |
| `xmcl-keystone-ui/src/views/Multiplayer.vue.bak` | E | 2 | 582, 732 |
| `xmcl-keystone-ui/src/views/MultiplayerBilling.vue` | B | 1 | 147 |
| `xmcl-keystone-ui/src/views/MultiplayerBilling.vue` | C | 1 | 7 |
| `xmcl-keystone-ui/src/views/MultiplayerDesktop.vue` | B | 3 | 94, 479, 766 |
| `xmcl-keystone-ui/src/views/MultiplayerDialogInitiate.vue` | B | 1 | 161 |
| `xmcl-keystone-ui/src/views/MultiplayerDialogReceive.vue` | B | 1 | 130 |
| `xmcl-keystone-ui/src/views/ResourcePack.vue` | B | 1 | 208 |
| `xmcl-keystone-ui/src/views/ResourcePackActions.vue` | B | 1 | 39 |
| `xmcl-keystone-ui/src/views/ResourcePackDetailResource.vue` | B | 2 | 12, 13 |
| `xmcl-keystone-ui/src/views/ResourcePackItem.vue` | B | 5 | 63, 77, 160, 178 |
| `xmcl-keystone-ui/src/views/Save.vue` | B | 1 | 240 |
| `xmcl-keystone-ui/src/views/SaveActions.vue` | B | 1 | 26 |
| `xmcl-keystone-ui/src/views/SaveItem.vue` | B | 1 | 55 |
| `xmcl-keystone-ui/src/views/SettingAbout.vue` | A | 4 | 10, 18, 20, 22 |
| `xmcl-keystone-ui/src/views/SettingAbout.vue` | D | 1 | 239 |
| `xmcl-keystone-ui/src/views/SettingAdvanced.vue` | B | 6 | 75, 121, 157, 169, 175 |
| `xmcl-keystone-ui/src/views/SettingGlobal.vue` | B | 1 | 178 |
| `xmcl-keystone-ui/src/views/SettingJavaMemory.vue` | B | 1 | 135 |
| `xmcl-keystone-ui/src/views/SettingMigrationDialog.vue` | B | 1 | 76 |
| `xmcl-keystone-ui/src/views/SettingUpdateInfoDialog.vue` | C | 1 | 143 |
| `xmcl-keystone-ui/src/views/SettingUpdateInfoDialog.vue` | D | 2 | 95, 146 |
| `xmcl-keystone-ui/src/views/Setup.vue` | B | 1 | 149 |
| `xmcl-keystone-ui/src/views/SetupDataRoot.vue` | B | 1 | 76 |
| `xmcl-keystone-ui/src/views/ShaderPack.vue` | B | 1 | 330 |
| `xmcl-keystone-ui/src/views/ShaderPackActions.vue` | B | 1 | 39 |
| `xmcl-keystone-ui/src/views/ShaderPackDetailResource.vue` | B | 2 | 12, 13 |
| `xmcl-keystone-ui/src/views/ShaderPackItem.vue` | B | 2 | 26, 79 |
| `xmcl-keystone-ui/src/views/StoreEntry.vue` | B | 1 | 196 |
| `xmcl-keystone-ui/src/views/StoreEntry.vue.bak` | E | 2 | 176, 177 |
| `xmcl-keystone-ui/src/views/StoreProjectCurseforge.vue` | B | 2 | 17, 18 |
| `xmcl-keystone-ui/src/views/StoreProjectFeedTheBeast.vue` | B | 1 | 13 |
| `xmcl-keystone-ui/src/views/StoreProjectModrinth.vue` | B | 1 | 17 |
| `xmcl-keystone-ui/src/vuetify.test.ts` | B | 3 | 9, 20, 25 |
| `xmcl-keystone-ui/src/vuetify.ts` | B | 2 | 22, 64 |
| `xmcl-keystone-ui/src/windows/browser/AppCard.vue` | B | 1 | 77 |
| `xmcl-keystone-ui/src/windows/browser/Browse.vue` | B | 1 | 71 |
| `xmcl-keystone-ui/src/windows/browser/index.ts` | B | 1 | 6 |
| `xmcl-keystone-ui/src/windows/logger/baseService.ts` | B | 1 | 1 |
| `xmcl-keystone-ui/src/windows/logger/index.ts` | B | 1 | 10 |
| `xmcl-keystone-ui/src/windows/logger/logger.d.ts` | B | 1 | 1 |
| `xmcl-keystone-ui/src/windows/main/App.vue` | B | 1 | 132 |
| `xmcl-keystone-ui/src/windows/main/Context.ts` | B | 1 | 2 |
| `xmcl-keystone-ui/src/windows/main/multiplayerTogether.ts` | B | 1 | 7 |
| `xmcl-keystone-ui/src/windows/migration/App.vue` | B | 1 | 142 |
| `xmcl-keystone-ui/tsconfig.json` | B | 4 | 25, 26, 35, 36 |
| `xmcl-keystone-ui/vite.config.ts` | B | 4 | 11, 94, 124 |
| `xmcl-runtime-api/client.d.ts` | B | 1 | 3 |
| `xmcl-runtime-api/docs/GETTING_STARTED_ru.md` | B | 4 | 50, 51, 219, 230 |
| `xmcl-runtime-api/docs/GETTING_STARTED_ru.md` | C | 2 | 106 |
| `xmcl-runtime-api/docs/GETTING_STARTED_ru.md` | D | 1 | 7 |
| `xmcl-runtime-api/docs/GETTING_STARTED_ua.md` | B | 4 | 50, 51, 219, 230 |
| `xmcl-runtime-api/docs/GETTING_STARTED_ua.md` | C | 2 | 106 |
| `xmcl-runtime-api/docs/GETTING_STARTED_ua.md` | D | 1 | 7 |
| `xmcl-runtime-api/index.ts` | B | 1 | 2 |
| `xmcl-runtime-api/monitorClient.d.ts` | B | 1 | 3 |
| `xmcl-runtime-api/package.json` | B | 22 | 2, 23, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 51 |
| `xmcl-runtime-api/package.json` | D | 1 | 15 |
| `xmcl-runtime-api/src/commands/cli.test.ts` | B | 6 | 82, 83, 97, 173, 174, 181 |
| `xmcl-runtime-api/src/commands/cli.ts` | B | 2 | 241, 276 |
| `xmcl-runtime-api/src/commands/types.ts` | B | 1 | 2 |
| `xmcl-runtime-api/src/entities/component.ts` | B | 2 | 1, 2 |
| `xmcl-runtime-api/src/entities/curseforge.ts` | B | 1 | 1 |
| `xmcl-runtime-api/src/entities/instance.ts` | D | 1 | 1 |
| `xmcl-runtime-api/src/entities/instanceManifest.schema.ts` | B | 2 | 1, 4 |
| `xmcl-runtime-api/src/entities/mod.ts` | B | 1 | 1 |
| `xmcl-runtime-api/src/entities/modrinth.ts` | B | 1 | 1 |
| `xmcl-runtime-api/src/entities/resource.ts` | B | 2 | 1, 21 |
| `xmcl-runtime-api/src/entities/save.ts` | B | 1 | 1 |
| `xmcl-runtime-api/src/entities/serverStatus.ts` | B | 1 | 1 |
| `xmcl-runtime-api/src/entities/shaderpack.ts` | B | 1 | 1 |
| `xmcl-runtime-api/src/entities/version.ts` | B | 3 | 1, 2, 421 |
| `xmcl-runtime-api/src/entities/xmclAccount.test.ts` | B | 1 | 2 |
| `xmcl-runtime-api/src/multiplayer.ts` | B | 1 | 1 |
| `xmcl-runtime-api/src/services/AgentService.test.ts` | B | 4 | 15, 18, 29, 30 |
| `xmcl-runtime-api/src/services/AgentService.ts` | B | 5 | 5, 6, 7, 8, 9 |
| `xmcl-runtime-api/src/services/AgentService.ts` | C | 1 | 4 |
| `xmcl-runtime-api/src/services/AuthlibInjectorService.ts` | B | 1 | 1 |
| `xmcl-runtime-api/src/services/BaseService.ts` | B | 1 | 118 |
| `xmcl-runtime-api/src/services/InstallService.ts` | B | 5 | 1, 11, 18, 337, 340 |
| `xmcl-runtime-api/src/services/InstanceIOService.ts` | B | 1 | 4 |
| `xmcl-runtime-api/src/services/InstanceInstallService.ts` | B | 1 | 2 |
| `xmcl-runtime-api/src/services/InstanceInstallService.ts` | D | 1 | 1 |
| `xmcl-runtime-api/src/services/InstanceManifestService.ts` | B | 1 | 1 |
| `xmcl-runtime-api/src/services/InstanceModsGroupService.ts` | B | 1 | 1 |
| `xmcl-runtime-api/src/services/InstanceModsService.ts` | B | 1 | 1 |
| `xmcl-runtime-api/src/services/InstanceOptionsService.ts` | B | 1 | 1 |
| `xmcl-runtime-api/src/services/InstanceResourcesService.ts` | B | 3 | 1, 2, 57 |
| `xmcl-runtime-api/src/services/InstanceServerInfoService.ts` | B | 1 | 1 |
| `xmcl-runtime-api/src/services/InstanceService.ts` | B | 1 | 7 |
| `xmcl-runtime-api/src/services/MarketService.ts` | B | 1 | 1 |
| `xmcl-runtime-api/src/services/ModMetadataService.ts` | B | 2 | 1, 2 |
| `xmcl-runtime-api/src/services/ModpackService.ts` | B | 4 | 1, 2, 9, 10 |
| `xmcl-runtime-api/src/services/OfficialUserService.ts` | B | 1 | 1 |
| `xmcl-runtime-api/src/services/PeerService.ts` | B | 2 | 306, 307 |
| `xmcl-runtime-api/src/services/RemoteServerService.ts` | B | 1 | 1 |
| `xmcl-runtime-api/src/services/ResourcePackPreviewService.ts` | B | 1 | 1 |
| `xmcl-runtime-api/src/services/ServerStatusService.ts` | B | 1 | 1 |
| `xmcl-runtime-api/src/services/UserService.ts` | B | 1 | 1 |
| `xmcl-runtime-api/src/services/VersionMetadataService.ts` | B | 1 | 1 |
| `xmcl-runtime-api/src/services/VersionService.ts` | B | 1 | 1 |
| `xmcl-runtime-api/src/services/XUpdateService.ts` | B | 1 | 1 |
| `xmcl-runtime-api/src/services/XmclAccountService.ts` | B | 2 | 2, 17 |
| `xmcl-runtime-api/src/services/XmclApiEndpoints.ts` | B | 3 | 25, 26, 27 |
| `xmcl-runtime-api/src/services/XmclApiEndpoints.ts` | C | 6 | 1, 2, 3 |
| `xmcl-runtime-api/src/task.ts` | B | 1 | 1 |
| `xmcl-runtime-api/src/util/java.ts` | B | 2 | 3, 4 |
| `xmcl-runtime-api/src/util/launch.ts` | B | 1 | 1 |
| `xmcl-runtime-api/src/util/marketInstanceFile.ts` | B | 3 | 1, 2, 3 |
| `xmcl-runtime-api/src/util/sdp.ts` | B | 2 | 2, 6 |
| `xmcl-runtime-api/src/util/sdp.ts` | C | 2 | 10, 14 |
| `xmcl-runtime/agent/AgentService.test.ts` | B | 2 | 1, 18 |
| `xmcl-runtime/agent/AgentService.ts` | B | 2 | 13, 22 |
| `xmcl-runtime/agent/apiKey.ts` | B | 2 | 1, 4 |
| `xmcl-runtime/agent/artifacts.test.ts` | B | 1 | 10 |
| `xmcl-runtime/agent/artifacts.ts` | B | 1 | 1 |
| `xmcl-runtime/agent/documents.test.ts` | B | 1 | 19 |
| `xmcl-runtime/agent/documents.ts` | B | 1 | 1 |
| `xmcl-runtime/agent/history.test.ts` | B | 1 | 10 |
| `xmcl-runtime/agent/history.ts` | B | 1 | 1 |
| `xmcl-runtime/agent/pluginAgentProtocol.test.ts` | B | 16 | 1, 28, 32, 42, 45, 51, 53, 54, 61, 76, 79, 81, 85, 99, 101, 121 |
| `xmcl-runtime/agent/pluginAgentProtocol.ts` | B | 1 | 2 |
| `xmcl-runtime/agent/providerProtocol.ts` | B | 4 | 1, 39, 83, 90 |
| `xmcl-runtime/agent/providerProtocol.ts` | C | 1 | 6 |
| `xmcl-runtime/app/BaseService.ts` | A | 1 | 112 |
| `xmcl-runtime/app/BaseService.ts` | B | 1 | 14 |
| `xmcl-runtime/app/BaseService.update.test.ts` | B | 1 | 1 |
| `xmcl-runtime/app/LauncherApp.ts` | B | 14 | 1, 2, 3, 13, 106, 153, 319, 334, 335, 336, 338, 340, 409, 416 |
| `xmcl-runtime/app/LauncherApp.ts` | C | 1 | 138 |
| `xmcl-runtime/app/LauncherAppController.ts` | B | 1 | 1 |
| `xmcl-runtime/app/LauncherAppManager.ts` | B | 7 | 1, 8, 31, 90, 104, 109, 158 |
| `xmcl-runtime/app/LauncherAppPlugin.ts` | B | 1 | 1 |
| `xmcl-runtime/app/LauncherAppUpdater.ts` | B | 3 | 1, 2, 10 |
| `xmcl-runtime/app/LauncherProtocolHandler.test.ts` | B | 3 | 21, 41, 61 |
| `xmcl-runtime/app/LauncherProtocolHandler.ts` | B | 2 | 54, 94 |
| `xmcl-runtime/app/migrate.test.ts` | B | 1 | 19 |
| `xmcl-runtime/app/migrate.ts` | B | 3 | 18, 19, 42 |
| `xmcl-runtime/app/objectRegistry.ts` | B | 2 | 1, 2 |
| `xmcl-runtime/app/pluginApiFallback.test.ts` | B | 10 | 10, 45, 54, 61, 74, 88, 89, 95, 99, 108 |
| `xmcl-runtime/app/pluginApiFallback.ts` | B | 6 | 2, 5, 28, 44, 48, 53 |
| `xmcl-runtime/app/pluginCommonProtocol.test.ts` | B | 2 | 30, 34 |
| `xmcl-runtime/app/steamShortcut.test.ts` | B | 4 | 27, 29, 42, 46 |
| `xmcl-runtime/app/steamShortcut.ts` | A | 1 | 173 |
| `xmcl-runtime/app/steamShortcut.ts` | B | 2 | 199 |
| `xmcl-runtime/app/win32/index.ts` | B | 2 | 1, 17 |
| `xmcl-runtime/app/xmclApiBaseUrl.test.ts` | B | 13 | 3, 4, 5, 8, 18, 20, 25, 29, 34, 35, 36 |
| `xmcl-runtime/app/xmclApiBaseUrl.ts` | B | 11 | 3, 4, 5, 7, 9, 16, 21, 22, 23 |
| `xmcl-runtime/authlibInjector/AuthlibInjectorService.ts` | B | 5 | 1, 2, 9, 16, 19 |
| `xmcl-runtime/bedrock/BedrockService.ts` | B | 3 | 14, 15, 16 |
| `xmcl-runtime/bedrock/appx.ts` | B | 5 | 7, 95, 97, 100, 108 |
| `xmcl-runtime/bedrock/versionList.ts` | B | 1 | 1 |
| `xmcl-runtime/collection/CollectionService.test.ts` | B | 3 | 1, 7, 81 |
| `xmcl-runtime/collection/CollectionService.ts` | B | 2 | 14, 15 |
| `xmcl-runtime/commands/BackendCommandHost.ts` | B | 6 | 1, 14, 15, 16, 158, 167 |
| `xmcl-runtime/commands/cliDriver.test.ts` | B | 11 | 3, 62, 69, 76, 83, 91, 100, 111, 118, 125, 134 |
| `xmcl-runtime/commands/cliDriver.ts` | B | 3 | 8, 28, 48 |
| `xmcl-runtime/commands/pluginCommandHost.ts` | B | 2 | 1, 18 |
| `xmcl-runtime/credential/ExternalCredentialService.test.ts` | B | 2 | 48, 65 |
| `xmcl-runtime/credential/ExternalCredentialService.ts` | B | 1 | 7 |
| `xmcl-runtime/credential/pluginExternalCredentialLifecycle.test.ts` | B | 1 | 1 |
| `xmcl-runtime/credential/pluginExternalCredentialLifecycle.ts` | B | 1 | 1 |
| `xmcl-runtime/elyby/ElyByService.ts` | B | 4 | 1, 2, 3, 10 |
| `xmcl-runtime/elyby/ElyByService.ts` | C | 1 | 28 |
| `xmcl-runtime/encoding/encodingWorkerEntry.ts` | B | 1 | 2 |
| `xmcl-runtime/encoding/pluginEncodingWorker.ts` | B | 2 | 2, 6 |
| `xmcl-runtime/infra/errors/ErrorDiagnose.ts` | B | 1 | 3 |
| `xmcl-runtime/infra/errors/error_decorate.ts` | B | 1 | 1 |
| `xmcl-runtime/infra/errors/error_normalize.ts` | B | 4 | 1, 2, 4, 5 |
| `xmcl-runtime/infra/errors/error_serialize.ts` | B | 2 | 1, 2 |
| `xmcl-runtime/infra/plugins/flights.test.ts` | B | 21 | 5, 11, 16, 17, 23, 26, 34, 38, 39, 44, 54 |
| `xmcl-runtime/infra/plugins/flights.ts` | B | 7 | 18, 32, 33, 35, 53 |
| `xmcl-runtime/infra/plugins/flights.ts` | C | 3 | 11, 48 |
| `xmcl-runtime/infra/plugins/log_consumer.ts` | B | 2 | 1, 2 |
| `xmcl-runtime/infra/plugins/task.ts` | B | 1 | 1 |
| `xmcl-runtime/infra/plugins/telemetry.ts` | B | 6 | 1, 11, 45, 79, 129, 130 |
| `xmcl-runtime/infra/resourceTelemetryBatch.test.ts` | B | 2 | 1, 2 |
| `xmcl-runtime/infra/resourceTelemetryBatch.ts` | B | 2 | 1, 2 |
| `xmcl-runtime/infra/ssh.ts` | B | 1 | 1 |
| `xmcl-runtime/infra/task.ts` | B | 1 | 1 |
| `xmcl-runtime/infra/telemetry_context.test.ts` | B | 7 | 76, 97, 98, 154, 155, 220, 267 |
| `xmcl-runtime/infra/telemetry_context.ts` | B | 14 | 20, 25, 26, 32, 33, 149, 216, 217, 255, 345, 396, 506, 507, 508 |
| `xmcl-runtime/infra/telemetry_context.ts` | C | 2 | 318 |
| `xmcl-runtime/infra/telemetry_resource.ts` | B | 4 | 7, 9, 40, 56 |
| `xmcl-runtime/infra/telemetry_sampling.ts` | B | 1 | 35 |
| `xmcl-runtime/infra/zip_manager.test.ts` | B | 1 | 10 |
| `xmcl-runtime/infra/zip_manager.ts` | B | 2 | 1, 3 |
| `xmcl-runtime/install/InstallCoordinator.test.ts` | B | 1 | 2 |
| `xmcl-runtime/install/InstallCoordinator.ts` | B | 4 | 1, 49, 80, 81 |
| `xmcl-runtime/install/InstallManifestService.ts` | B | 2 | 7, 12 |
| `xmcl-runtime/install/InstallMatrix.e2e.test.ts` | B | 6 | 1, 2, 33, 38, 41, 265 |
| `xmcl-runtime/install/InstallService.ts` | B | 3 | 6, 22, 26 |
| `xmcl-runtime/install/VersionMetadataService.ts` | B | 3 | 1, 2, 11 |
| `xmcl-runtime/install/optifine.ts` | B | 1 | 1 |
| `xmcl-runtime/install/postprocessTelemetry.test.ts` | B | 1 | 1 |
| `xmcl-runtime/install/postprocessTelemetry.ts` | B | 1 | 1 |
| `xmcl-runtime/install/versionMetadataCache.test.ts` | B | 2 | 6, 13 |
| `xmcl-runtime/install/versionMetadataCache.ts` | B | 1 | 1 |
| `xmcl-runtime/install/versionSelection.test.ts` | B | 3 | 1, 2, 3 |
| `xmcl-runtime/install/versionSelection.ts` | B | 2 | 1, 2 |
| `xmcl-runtime/instance/AbstractInstanceDomainService.ts` | B | 6 | 1, 2, 8, 11, 14, 15 |
| `xmcl-runtime/instance/InstanceBlueprintsService.ts` | B | 4 | 1, 12, 13, 20 |
| `xmcl-runtime/instance/InstanceLogService.ts` | B | 2 | 1, 9 |
| `xmcl-runtime/instance/InstanceModsGroupService.ts` | B | 2 | 1, 7 |
| `xmcl-runtime/instance/InstanceModsService.ts` | B | 2 | 1, 2 |
| `xmcl-runtime/instance/InstanceOptionsService.ts` | B | 3 | 1, 11, 18 |
| `xmcl-runtime/instance/InstanceResourcePacksService.ts` | B | 2 | 1, 6 |
| `xmcl-runtime/instance/InstanceSavesService.ts` | B | 5 | 1, 23, 24, 25, 26 |
| `xmcl-runtime/instance/InstanceScreenshotService.ts` | B | 1 | 4 |
| `xmcl-runtime/instance/InstanceServerInfoService.ts` | B | 2 | 1, 2 |
| `xmcl-runtime/instance/InstanceService.delete.test.ts` | B | 3 | 1, 2, 36 |
| `xmcl-runtime/instance/InstanceService.icon.test.ts` | B | 3 | 1, 2, 63 |
| `xmcl-runtime/instance/InstanceService.ts` | B | 3 | 10, 20, 21 |
| `xmcl-runtime/instance/InstanceShaderPacksService.ts` | B | 2 | 1, 6 |
| `xmcl-runtime/instance/InstanceThemeService.test.ts` | B | 2 | 1, 33 |
| `xmcl-runtime/instance/InstanceThemeService.ts` | B | 1 | 1 |
| `xmcl-runtime/instance/utils/readLinkSafe.ts` | B | 1 | 1 |
| `xmcl-runtime/instanceIO/InstanceIOService.ts` | B | 3 | 7, 14, 15 |
| `xmcl-runtime/instanceIO/InstanceInstallService.concurrent.test.ts` | B | 3 | 1, 2, 54 |
| `xmcl-runtime/instanceIO/InstanceInstallService.progressive.test.ts` | B | 2 | 1, 2 |
| `xmcl-runtime/instanceIO/InstanceInstallService.ts` | B | 7 | 1, 11, 12, 20, 35, 36, 37 |
| `xmcl-runtime/instanceIO/InstanceManifestService.ts` | B | 4 | 1, 2, 3, 4 |
| `xmcl-runtime/instanceIO/InstanceUpdateDesign.md` | B | 1 | 7 |
| `xmcl-runtime/instanceIO/XUpdateService.ts` | B | 3 | 1, 2, 3 |
| `xmcl-runtime/instanceIO/utils/downloadInstanceFiles.test.ts` | B | 8 | 39, 62, 107, 126, 168, 209, 248, 286 |
| `xmcl-runtime/instanceIO/utils/downloadInstanceFiles.ts` | B | 4 | 1, 2, 3, 4 |
| `xmcl-runtime/instanceIO/utils/importLauncherInstance.test.ts` | B | 2 | 1, 20 |
| `xmcl-runtime/instanceIO/utils/importLauncherInstance.ts` | B | 1 | 7 |
| `xmcl-runtime/instanceIO/utils/installPlan.test.ts` | B | 1 | 1 |
| `xmcl-runtime/instanceIO/utils/installPlan.ts` | B | 1 | 1 |
| `xmcl-runtime/instanceIO/utils/installPlan.ts` | D | 1 | 2 |
| `xmcl-runtime/instanceIO/utils/linkInstanceFiles.test.ts` | B | 5 | 3, 17, 53, 80, 110 |
| `xmcl-runtime/instanceIO/utils/linkInstanceFiles.ts` | B | 5 | 1, 2, 3, 4, 8 |
| `xmcl-runtime/instanceIO/utils/pendingInstall.ts` | B | 2 | 1, 2 |
| `xmcl-runtime/instanceIO/utils/resolveInstanceFiles.ts` | B | 3 | 1, 2, 3 |
| `xmcl-runtime/instanceIO/utils/unzipInstanceFiles.test.ts` | B | 3 | 1, 11, 21 |
| `xmcl-runtime/instanceIO/utils/unzipInstanceFiles.ts` | B | 6 | 1, 2, 3, 4, 9, 11 |
| `xmcl-runtime/instanceIO/utils/uploadSSH.ts` | B | 2 | 1, 2 |
| `xmcl-runtime/instanceIO/utils/verifyInstanceFile.ts` | B | 1 | 1 |
| `xmcl-runtime/java/JavaInstall.ts` | B | 4 | 1, 17, 18, 19 |
| `xmcl-runtime/java/JavaService.test.ts` | B | 4 | 1, 2, 22, 70 |
| `xmcl-runtime/java/JavaService.ts` | B | 2 | 6, 16 |
| `xmcl-runtime/java/installDefaultJava.ts` | B | 2 | 1, 2 |
| `xmcl-runtime/java/java.test.ts` | B | 1 | 97 |
| `xmcl-runtime/java/java.ts` | B | 2 | 4, 7 |
| `xmcl-runtime/java/zulu.test.ts` | B | 1 | 10 |
| `xmcl-runtime/java/zulu.ts` | B | 2 | 1, 9 |
| `xmcl-runtime/java/zulu.ts` | D | 1 | 91 |
| `xmcl-runtime/launch/LaunchHistoryStore.test.ts` | B | 1 | 13 |
| `xmcl-runtime/launch/LaunchHistoryStore.ts` | B | 1 | 1 |
| `xmcl-runtime/launch/LaunchMiddleware.ts` | B | 2 | 1, 2 |
| `xmcl-runtime/launch/LaunchService.ts` | B | 8 | 1, 2, 3, 22, 27, 366, 370, 375 |
| `xmcl-runtime/launch/VersionService.ts` | B | 2 | 6, 19 |
| `xmcl-runtime/launch/XMCLaunch.ts` | B | 1 | 1 |
| `xmcl-runtime/launch/pluginLaunchPrecheck.ts` | B | 4 | 1, 8, 9, 12 |
| `xmcl-runtime/littleSkin/LittleSkinClient.ts` | B | 1 | 1 |
| `xmcl-runtime/littleSkin/LittleSkinUserService.ts` | B | 1 | 2 |
| `xmcl-runtime/market/BlueprintMarketService.ts` | B | 1 | 9 |
| `xmcl-runtime/market/downloadStaged.test.ts` | B | 1 | 42 |
| `xmcl-runtime/market/downloadStaged.ts` | B | 3 | 1, 8, 17 |
| `xmcl-runtime/market/marketProvider.ts` | B | 3 | 1, 2, 3 |
| `xmcl-runtime/market/pluginMarketProvider.ts` | B | 8 | 1, 7, 8, 9, 10, 11, 12, 21 |
| `xmcl-runtime/moddb/ModMetadataService.ts` | B | 6 | 1, 2, 3, 4, 6, 16 |
| `xmcl-runtime/moddb/ProjectMappingService.ts` | B | 3 | 1, 2, 14 |
| `xmcl-runtime/moddb/databaseDownload.test.ts` | B | 10 | 1, 18, 21, 24, 25, 36, 45, 53, 65, 95 |
| `xmcl-runtime/moddb/databaseDownload.ts` | B | 1 | 1 |
| `xmcl-runtime/moddb/databaseDownload.ts` | C | 1 | 4 |
| `xmcl-runtime/moddb/databaseDownload.ts` | D | 1 | 19 |
| `xmcl-runtime/modpack/ModpackService.ts` | B | 27 | 1, 14, 15, 22, 45, 46, 47, 51, 100, 270, 593, 640, 641, 642, 643, 1463, 1464, 1466, 1467, 1489 |
| `xmcl-runtime/modpack/downloadModpackUrl.test.ts` | B | 1 | 17 |
| `xmcl-runtime/modpack/downloadModpackUrl.ts` | B | 1 | 1 |
| `xmcl-runtime/modpack/exportArchiveFiles.test.ts` | B | 2 | 1, 32 |
| `xmcl-runtime/modpack/exportArchiveFiles.ts` | B | 1 | 1 |
| `xmcl-runtime/modpack/utils/archiveFiles.ts` | B | 2 | 1, 2 |
| `xmcl-runtime/modpack/utils/curseforgeHandler.ts` | B | 5 | 1, 2, 3, 4, 6 |
| `xmcl-runtime/modpack/utils/exportOffline.ts` | B | 1 | 1 |
| `xmcl-runtime/modpack/utils/getCurseforgeFiles.ts` | B | 1 | 1 |
| `xmcl-runtime/modpack/utils/mcbbsHandler.ts` | B | 5 | 1, 2, 3, 4, 6 |
| `xmcl-runtime/modpack/utils/mmcHandler.test.ts` | B | 2 | 1, 2 |
| `xmcl-runtime/modpack/utils/mmcHandler.ts` | B | 3 | 1, 2, 3 |
| `xmcl-runtime/modpack/utils/modrinthHandler.ts` | B | 4 | 1, 2, 3, 4 |
| `xmcl-runtime/modpack/utils/remapZipDownloads.test.ts` | B | 1 | 1 |
| `xmcl-runtime/modpack/utils/remapZipDownloads.ts` | B | 1 | 1 |
| `xmcl-runtime/modpack/utils/resolveHashes.ts` | B | 1 | 1 |
| `xmcl-runtime/modpack/utils/technicHandler.test.ts` | B | 1 | 1 |
| `xmcl-runtime/modpack/utils/technicHandler.ts` | B | 3 | 1, 2, 3 |
| `xmcl-runtime/nativeReplacer/pluginNativeReplacer.ts` | B | 1 | 1 |
| `xmcl-runtime/network/BmclDownload.e2e.test.ts` | B | 4 | 5, 13, 23, 70 |
| `xmcl-runtime/network/BmclDownloadController.test.ts` | B | 2 | 6, 108 |
| `xmcl-runtime/network/BmclDownloadController.ts` | B | 1 | 1 |
| `xmcl-runtime/network/FileTransferInstallDownloader.integration.test.ts` | B | 3 | 7, 8, 59 |
| `xmcl-runtime/network/FileTransferInstallDownloader.test.ts` | B | 3 | 1, 5, 6 |
| `xmcl-runtime/network/FileTransferInstallDownloader.ts` | B | 1 | 5 |
| `xmcl-runtime/network/networkInterface.ts` | B | 2 | 1, 2 |
| `xmcl-runtime/network/pluginNetworkInterface.ts` | B | 2 | 1, 2 |
| `xmcl-runtime/package.json` | B | 31 | 2, 19, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 104 |
| `xmcl-runtime/package.json` | D | 1 | 14 |
| `xmcl-runtime/peer/BrowserRtcProvider.ts` | B | 1 | 1 |
| `xmcl-runtime/peer/MultiplayerHost.ts` | B | 2 | 8, 14 |
| `xmcl-runtime/peer/PeerService.test.ts` | B | 1 | 20 |
| `xmcl-runtime/peer/PeerService.ts` | B | 6 | 12, 17, 19, 187, 190 |
| `xmcl-runtime/peer/PeerServiceFacade.ts` | B | 1 | 1 |
| `xmcl-runtime/playTime/pluginUserPlaytime.ts` | B | 1 | 4 |
| `xmcl-runtime/presence/PresenceService.ts` | B | 2 | 1, 2 |
| `xmcl-runtime/remoteServer/RemoteServerService.ts` | A | 1 | 68 |
| `xmcl-runtime/remoteServer/RemoteServerService.ts` | B | 18 | 1, 15, 16, 33, 34, 116, 164, 165, 220, 265, 269, 361, 362, 422, 432, 454, 551 |
| `xmcl-runtime/remoteServer/deploymentPlan.ts` | B | 2 | 1, 2 |
| `xmcl-runtime/resource/index.ts` | B | 1 | 6 |
| `xmcl-runtime/resource/pluginResourceWorker.ts` | B | 5 | 8, 16, 21, 22, 23 |
| `xmcl-runtime/resource/resource.worker.ts` | B | 3 | 1, 4, 5 |
| `xmcl-runtime/resource/worker.ts` | B | 1 | 2 |
| `xmcl-runtime/resourcePack/ResourcePackPreviewService.ts` | B | 2 | 1, 2 |
| `xmcl-runtime/resourcePack/pluginResourcePackLink.ts` | B | 1 | 7 |
| `xmcl-runtime/save/advancements.test.ts` | B | 2 | 12, 19 |
| `xmcl-runtime/save/advancements.ts` | B | 2 | 1, 2 |
| `xmcl-runtime/save/pluginSaveWorker.ts` | B | 2 | 1, 2 |
| `xmcl-runtime/save/progress.test.ts` | B | 6 | 15, 73, 113, 136, 170, 237 |
| `xmcl-runtime/save/progress.ts` | B | 2 | 8, 9 |
| `xmcl-runtime/save/region.test.ts` | B | 3 | 21, 67, 110 |
| `xmcl-runtime/save/save.ts` | B | 4 | 1, 2, 3, 4 |
| `xmcl-runtime/save/saveWorkerEntry.ts` | B | 1 | 1 |
| `xmcl-runtime/serverStatus/ServerStatusService.ts` | B | 3 | 1, 2, 3 |
| `xmcl-runtime/service/Service.ts` | B | 2 | 1, 6 |
| `xmcl-runtime/service/ServiceStateContainer.ts` | B | 2 | 2, 5 |
| `xmcl-runtime/service/ServiceStateManager.ts` | B | 2 | 1, 4 |
| `xmcl-runtime/service/pluginServicesHandler.ts` | B | 2 | 1, 7 |
| `xmcl-runtime/service/stateUtils.ts` | B | 1 | 1 |
| `xmcl-runtime/settings/pluginSettings.test.ts` | B | 1 | 2 |
| `xmcl-runtime/settings/pluginSettings.ts` | B | 2 | 1, 2 |
| `xmcl-runtime/settings/settings.ts` | B | 1 | 1 |
| `xmcl-runtime/setup/pluginSetup.ts` | B | 3 | 6, 10, 90 |
| `xmcl-runtime/setup/setupWorkerEntry.ts` | B | 1 | 2 |
| `xmcl-runtime/theme/ThemeService.ts` | B | 2 | 1, 2 |
| `xmcl-runtime/user/LocalSkinService.test.ts` | B | 2 | 1, 23 |
| `xmcl-runtime/user/LocalSkinService.ts` | B | 1 | 1 |
| `xmcl-runtime/user/MinecraftFriendsErrors.test.ts` | B | 2 | 2, 3 |
| `xmcl-runtime/user/MinecraftFriendsErrors.ts` | B | 2 | 1, 2 |
| `xmcl-runtime/user/MinecraftFriendsService.test.ts` | B | 2 | 2, 3 |
| `xmcl-runtime/user/MinecraftFriendsService.ts` | B | 3 | 9, 10, 11 |
| `xmcl-runtime/user/OfficialUserService.ts` | B | 3 | 1, 2, 3 |
| `xmcl-runtime/user/UserPersistence.ts` | B | 1 | 1 |
| `xmcl-runtime/user/UserService.persistence.test.ts` | B | 1 | 4 |
| `xmcl-runtime/user/UserService.ts` | B | 3 | 2, 17, 18 |
| `xmcl-runtime/user/YggdrasilSeriveRegistry.ts` | B | 1 | 1 |
| `xmcl-runtime/user/accountSystems/AccountSystem.ts` | B | 1 | 1 |
| `xmcl-runtime/user/accountSystems/MicrosoftAccountSystem.test.ts` | B | 1 | 2 |
| `xmcl-runtime/user/accountSystems/MicrosoftAccountSystem.ts` | B | 3 | 1, 2, 254 |
| `xmcl-runtime/user/accountSystems/MicrosoftAuthErrors.ts` | B | 1 | 1 |
| `xmcl-runtime/user/accountSystems/MicrosoftOAuthClient.test.ts` | B | 5 | 366, 371, 376, 391 |
| `xmcl-runtime/user/accountSystems/MicrosoftOAuthClient.ts` | B | 4 | 3, 139, 144, 160 |
| `xmcl-runtime/user/accountSystems/SkinUploadErrors.ts` | B | 2 | 1, 2 |
| `xmcl-runtime/user/accountSystems/YggdrasilAccountSystem.ts` | B | 3 | 1, 2, 5 |
| `xmcl-runtime/user/accountSystems/YggdrasilOCIDAuthClient.ts` | B | 2 | 5, 29 |
| `xmcl-runtime/user/credentialPlugin.ts` | B | 2 | 9, 12 |
| `xmcl-runtime/user/pluginModrinthAccess.test.ts` | B | 2 | 66, 68 |
| `xmcl-runtime/user/pluginModrinthAccess.ts` | B | 1 | 9 |
| `xmcl-runtime/user/pluginOfficialUserApi.test.ts` | B | 2 | 1, 6 |
| `xmcl-runtime/user/pluginOfficialUserApi.ts` | B | 6 | 1, 2, 5, 13, 14, 98 |
| `xmcl-runtime/user/pluginOfficialUserApi.ts` | C | 1 | 84 |
| `xmcl-runtime/user/pluginOfflineUser.ts` | B | 2 | 1, 2 |
| `xmcl-runtime/user/pluginUserTokenStorage.ts` | B | 6 | 1, 20, 21, 24, 26, 32 |
| `xmcl-runtime/user/pluginYggdrasilApi.ts` | B | 1 | 32 |
| `xmcl-runtime/user/user.ts` | B | 2 | 3, 4 |
| `xmcl-runtime/user/userTokenStore.ts` | B | 1 | 1 |
| `xmcl-runtime/user/utils/loginModrinth.test.ts` | B | 2 | 33, 65 |
| `xmcl-runtime/user/utils/loginModrinth.ts` | B | 3 | 2, 5, 85 |
| `xmcl-runtime/user/utils/userData.ts` | B | 2 | 1, 2 |
| `xmcl-runtime/user/utils/withRetry.ts` | B | 1 | 10 |
| `xmcl-runtime/util/atomicWrite.test.ts` | B | 1 | 114 |
| `xmcl-runtime/util/deduplicateInstanceFiles.test.ts` | B | 1 | 3 |
| `xmcl-runtime/util/deduplicateInstanceFiles.ts` | B | 1 | 1 |
| `xmcl-runtime/util/fs.test.ts` | B | 1 | 34 |
| `xmcl-runtime/util/fs.ts` | B | 4 | 1, 2, 3, 4 |
| `xmcl-runtime/util/minecraftLang.ts` | B | 1 | 1 |
| `xmcl-runtime/util/mmcStandaloneVersion.ts` | B | 2 | 1, 2 |
| `xmcl-runtime/util/object.ts` | B | 1 | 20 |
| `xmcl-runtime/util/taskHelper.ts` | B | 2 | 1, 2 |
| `xmcl-runtime/util/validate.ts` | B | 4 | 1, 2, 7, 78 |
| `xmcl-runtime/util/zip.ts` | B | 1 | 9 |
| `xmcl-runtime/xmclAccount/ProviderCredentialExchangeCache.ts` | C | 1 | 2 |
| `xmcl-runtime/xmclAccount/XmclAccountApi.test.ts` | B | 10 | 8, 21, 315, 379, 393, 395, 396, 402, 405, 406 |
| `xmcl-runtime/xmclAccount/XmclAccountApi.ts` | C | 27 | 17, 26, 79, 94, 112, 168, 223, 313, 336, 359, 366, 382, 389, 415, 464, 476, 533, 535, 537, 538, 562, 580, 619, 627, 764, 773, 797 |
| `xmcl-runtime/xmclAccount/XmclAccountService.test.ts` | B | 17 | 87, 145, 197, 317, 439, 478, 513, 588, 656, 678, 698, 773, 820 |
| `xmcl-runtime/xmclAccount/XmclAccountService.ts` | C | 33 | 8, 11, 37, 39, 82, 114, 117, 123, 127, 133, 284, 307, 319, 338, 405, 438, 450, 476, 480, 495, 515, 609, 656, 686, 692, 708, 729, 732, 770 |
| `xmcl-runtime/yggdrasilServer/pluginYggdrasilHandler.test.ts` | B | 4 | 1, 46, 68, 85 |
| `xmcl-runtime/yggdrasilServer/pluginYggdrasilHandler.ts` | B | 5 | 1, 2, 80, 88, 90 |

## Recursos de iconos verificados

| Recurso | Comparación inicial | SHA-256 final |
|---|---|---|
| `xmcl-electron-app/icons/dark.icns` | ICNS regenerado desde PNG propio | `03fa9c7cd84949cb99141be042436662365756e8259b8134b186769344550259` |
| `xmcl-electron-app/icons/dark.ico` | Idéntico | `e7641b794ff6027acd40e33ece709f3ad2865865a29ac037665c76b70217c2f7` |
| `xmcl-electron-app/icons/dark@256x256.png` | Idéntico | `f3ae174f3e32557694025fe3e18c64e82cea32a538c79179dc098d7995b72f7d` |
| `xmcl-electron-app/icons/dark@SmallTile.png` | Idéntico | `e49787f5d3ae4499e9972379d640c5c35902acc7ac3cecb20bd479d5b1fef123` |
| `xmcl-electron-app/icons/dark@SmallTile.scale-400.png` | Idéntico | `6eaa4f9e63d097ee28901fde088a964fc4f3d9f317889843452196441ad484c8` |
| `xmcl-electron-app/icons/dark@Square150x150Logo.png` | Idéntico | `d19cdda3429b705e1605d94afe0f4490a4f47e8a84f3ea7c290a440dbe815b4a` |
| `xmcl-electron-app/icons/dark@Square150x150Logo.scale-400.png` | Idéntico | `3a98633ac4f4390aedc9a8d4608dea729443a9f419b2d5cb091d81289a1a7505` |
| `xmcl-electron-app/icons/dark@Square44x44Logo.png` | Idéntico | `87b129bfd016fecb65ec35e4a446c1bf243bae6f6a668b55da381c066d1e99f0` |
| `xmcl-electron-app/icons/dark@Square44x44Logo.targetsize-256.png` | Idéntico | `25ae6fb0e758be38d294e65ccc1a56fdd42e56719b3dd0ea75328983bbcb87be` |
| `xmcl-electron-app/icons/dark@Square44x44Logo.targetsize-256_altform-unplated.png` | Idéntico | `25ae6fb0e758be38d294e65ccc1a56fdd42e56719b3dd0ea75328983bbcb87be` |
| `xmcl-electron-app/icons/dark@StoreLogo.png` | Idéntico | `25ae6fb0e758be38d294e65ccc1a56fdd42e56719b3dd0ea75328983bbcb87be` |
| `xmcl-electron-app/icons/dark@StoreLogo.scale-400.png` | Idéntico | `210135aada8b536a79b9ee1df8664ace196dda0775055c1e1a0db6f5440f139a` |
| `xmcl-electron-app/icons/dark@tray.png` | Idéntico | `c1485c00fbe67d9eb9c0ba6a088fb05ba65bd7d76c4374011e0e09379f8202e0` |
| `xmcl-electron-app/icons/large-dark@LargeTile.png` | Idéntico | `701eb4aca97dcc399c55c7e4ca6017b507eb21ffb582213129b98efe4cd8e88b` |
| `xmcl-electron-app/icons/large-dark@LargeTile.scale-200.png` | Idéntico | `586da9944b7b5c5a5da3278e1815df7afbebccb9a62facd56c556091dfe18eb7` |
| `xmcl-electron-app/icons/large-light@LargeTile.scale-200_theme-light.png` | Idéntico | `e3f690636c5852668c51b480c1f4a049aa0dcf71255a0458896ab400a063a6f2` |
| `xmcl-electron-app/icons/large-light@LargeTile.theme-light.png` | Idéntico | `67fd13aa3cf2581e693d84ed43dec16a3fc939334ba40c4011781525bff669a4` |
| `xmcl-electron-app/icons/light.icns` | ICNS regenerado desde PNG propio | `03fa9c7cd84949cb99141be042436662365756e8259b8134b186769344550259` |
| `xmcl-electron-app/icons/light.ico` | Idéntico | `e7641b794ff6027acd40e33ece709f3ad2865865a29ac037665c76b70217c2f7` |
| `xmcl-electron-app/icons/light@256x256.png` | Idéntico | `f3ae174f3e32557694025fe3e18c64e82cea32a538c79179dc098d7995b72f7d` |
| `xmcl-electron-app/icons/light@SmallTile.scale-400_theme-light.png` | Idéntico | `6eaa4f9e63d097ee28901fde088a964fc4f3d9f317889843452196441ad484c8` |
| `xmcl-electron-app/icons/light@SmallTile.theme-light.png` | Idéntico | `e49787f5d3ae4499e9972379d640c5c35902acc7ac3cecb20bd479d5b1fef123` |
| `xmcl-electron-app/icons/light@Square150x150Logo.scale-400_theme-light.png` | Idéntico | `3a98633ac4f4390aedc9a8d4608dea729443a9f419b2d5cb091d81289a1a7505` |
| `xmcl-electron-app/icons/light@Square150x150Logo.theme-light.png` | Idéntico | `d19cdda3429b705e1605d94afe0f4490a4f47e8a84f3ea7c290a440dbe815b4a` |
| `xmcl-electron-app/icons/light@Square44x44Logo.targetsize-256_altform-lightunplated.png` | Idéntico | `25ae6fb0e758be38d294e65ccc1a56fdd42e56719b3dd0ea75328983bbcb87be` |
| `xmcl-electron-app/icons/light@Square44x44Logo.targetsize-256_theme-light.png` | Idéntico | `25ae6fb0e758be38d294e65ccc1a56fdd42e56719b3dd0ea75328983bbcb87be` |
| `xmcl-electron-app/icons/light@Square44x44Logo.theme-light.png` | Idéntico | `87b129bfd016fecb65ec35e4a446c1bf243bae6f6a668b55da381c066d1e99f0` |
| `xmcl-electron-app/icons/light@StoreLogo.scale-400_theme-light.png` | Idéntico | `210135aada8b536a79b9ee1df8664ace196dda0775055c1e1a0db6f5440f139a` |
| `xmcl-electron-app/icons/light@StoreLogo.theme-light.png` | Idéntico | `25ae6fb0e758be38d294e65ccc1a56fdd42e56719b3dd0ea75328983bbcb87be` |
| `xmcl-electron-app/icons/light@tray.png` | Idéntico | `c1485c00fbe67d9eb9c0ba6a088fb05ba65bd7d76c4374011e0e09379f8202e0` |
| `xmcl-electron-app/icons/wide-dark@Wide310x150Logo.png` | Idéntico | `ffb204beed814af7aadf5468334a5f153dbf765cc8add0da8fee3f0e176d2a51` |
| `xmcl-electron-app/icons/wide-dark@Wide310x150Logo.scale-150.png` | Idéntico | `6be795f2d89809f0b64f50e5a678d6b70226b12fc29d02c47c100cb0b356ce06` |
| `xmcl-electron-app/icons/wide-dark@Wide310x150Logo.scale-200.png` | Idéntico | `94228827da92ff40322431920e505cb257fc73fe15b78199280c30dbe05e4b71` |
| `xmcl-electron-app/icons/wide-dark@Wide310x150Logo.scale-400.png` | Idéntico | `d77aaff585319bd04855a9373977394f8c5a3a9af911e96134f215fbc4a05c15` |
| `xmcl-electron-app/icons/wide-light@Wide310x150Logo.scale-200_theme-light.png` | Idéntico | `b36e39aa683996f7e13cde32ca54339b7ce765f607e7fbd2f149b4c678dbea82` |
| `xmcl-electron-app/icons/wide-light@Wide310x150Logo.scale-400_theme-light.png` | Idéntico | `e8ab12191250f3f77d198de6305e19e33452fa1160b419c8cefdf1f435e09ca7` |
| `xmcl-electron-app/icons/wide-light@Wide310x150Logo.theme-light.png` | Idéntico | `629c344da0ccbfb1097b543c337650e5050b066f492e3b7f83f745eea799180f` |
| `xmcl-electron-app/icons/wide-light@Wie310x150Logo.scale-150_theme-light.png` | Idéntico | `f3c99bd6991c4d24e9e61448351a9d5b36f4d14018a0266a2d2e3a41327d9608` |
