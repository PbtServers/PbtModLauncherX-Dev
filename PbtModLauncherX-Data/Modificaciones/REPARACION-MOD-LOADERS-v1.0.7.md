# Fase 5 — Reparación de cargadores de mods

Fecha de cierre de esta sesión: 2026-10-10.

## Estado y alcance

- Rama de trabajo: `dev/upstream-v1.0.7`.
- HEAD inicial y final: `b5ffa3527596b1fdd3071ecd819f0c25c87f2be5`.
- Upstream integrado previamente: `0379941d1997e92b079fdc21e8692c8e45cd8cd7`.
- `master` y `backup/pre-upstream-v1.0.7` permanecen en `c4b77e666f0b132e05e3ffff71d2728132a46a44`.
- Versión pública conservada: **1.0.6**. El nombre de este informe identifica la preparación de 1.0.7, no una actualización de versión.
- Se retomaron y conservaron los cambios pendientes de esta fase. No se realizó merge, rebase, push, publicación, tag ni descarte de archivos.
- Las correcciones y comprobaciones locales quedan preparadas, pero **la fase no puede considerarse completamente validada ni confirmada**: hay bloqueos del entorno para instalaciones reales, compilación de los hosts y escritura en Git.

## LabyMod — causa raíz y corrección

El manifiesto oficial de producción consultado durante esta fase identifica LabyMod `4.6.27`, revisión `16d92a4d`. Su entrada de familia antigua contiene `tag: 1.8` y **`version: 1.8.9`**. El perfil descargado confirma `_minecraftVersion: 1.8.9`. Minecraft 1.8 y 1.8.9 no son versiones intercambiables.

El selector y los resolutores buscaban `tag`, aunque recibían una versión real de Minecraft. Esto ofrecía LabyMod para 1.8 y no lo asociaba correctamente con 1.8.9. Además, el perfil generado escribía `inheritFrom`; el parser del launcher reconoce **`inheritsFrom`**. El workflow tampoco aplicaba el mismo filtrado de bibliotecas que el resolutor directo.

Correcciones:

- Helper compartido `getLabyModMinecraftVersion`: compara la versión exacta con `minecraftVersions[].version`.
- Selector de UI y ambos caminos de instalación utilizan el mismo criterio.
- Una receta nueva para Minecraft 1.8 con el manifiesto actual se rechaza explícitamente; no se convierte silenciosamente a 1.8.9.
- Minecraft 1.8.9 selecciona la entrada oficial de familia 1.8 y su URL específica de perfil.
- Se escribe `inheritsFrom` y se comprueba que el padre declarado coincida con Minecraft seleccionado.
- Se incluyen bibliotecas `all`, de la familia del proveedor o de la versión exacta; se excluyen las de otros Minecraft.
- Se conservan identificadores, hashes, tamaños, recursos y endpoints del proveedor. No se migra ni se elimina ningún perfil existente.
- La UI importa el helper desde `@xmcl/installer/labymod.browser`; importar el barrel completo introducía código incompatible con el bundle del navegador. El import específico fue corregido durante la fase.
- No hay un caso especial que fuerce 1.8.9: otras versiones canónicas y una hipotética entrada futura de soporte real para 1.8 se resuelven con sus propios metadatos.

Pruebas: cinco regresiones específicas, más la receta compartida y los tests existentes del proveedor. Una prueba ejecuta la materialización del perfil en el directorio temporal de tests; **no descarga LabyMod ni equivale a una instalación completa**.

El [issue upstream #1325](https://github.com/Voxelum/x-minecraft-launcher/issues/1325) describe una instalación 1.8 con LabyMod que no carga. Está cerrado y no se encontró un commit de resolución enlazado ni comentarios en la consulta realizada. La causa anterior se confirma con el código y los metadatos; no se atribuye una solución inexistente a ese issue.

Fuente oficial: [manifiesto de producción](https://laby-releases.s3.de.io.cloud.ovh.net/api/v1/manifest/production/latest.json), [perfil consultado de 1.8.9](https://releases.r2.labymod.net/api/v1/download/manifest/labymod4/production/1.8.9/16d92a4d.json), [bibliotecas](https://laby-releases.s3.de.io.cloud.ovh.net/api/v1/libraries/production.json).

## NeoForge — asociación exacta y catálogo histórico

Se confirmaron dos errores en la consulta de metadatos:

1. El prefijo para Minecraft 1.21 era `21.`, que también incluía builds de 1.21.1 y otras versiones. Ahora es `21.0.`; 1.21.1 utiliza exclusivamente `21.1.`.
2. Minecraft 1.20.1 usa el proyecto Maven histórico `net/neoforged/forge` y versiones completas `1.20.1-47.1.*`, no el proyecto moderno `neoforge` con un prefijo `20.1.`.

El nuevo helper filtra tanto respuestas oficiales y de mirror como cachés mediante el esquema del servicio, y elimina duplicados. Se conserva SWR y la política de selección de servidores. La ordenación numérica y selección de la última build ya existentes en la rama se mantienen sin cambios.

La consulta oficial encontró `21.1.257` para 1.21.1. El catálogo histórico incluía `1.20.1-47.1.106`, cuyo instalador respondió HTTP 200 en la comprobación previa. La entrada suelta `47.1.82` carecía de instalador accesible tanto con el nombre suelto como con el prefijo de Minecraft (HTTP 404); no se transforma ni ofrece como un artefacto válido.

Pruebas: cuatro casos de filtrado/proyecto, receta 1.21.1/21.1.257, ordenación existente y tests del resolutor del instalador, que verifican URL, SHA-1 y tamaño con respuestas simuladas. El caso del instalador existente usa su fixture de build; la receta nueva comprueba 21.1.257. **No se ejecutaron los procesadores reales de 21.1.257 ni un lanzamiento.**

Fuentes: [catálogo moderno](https://maven.neoforged.net/api/maven/versions/releases/net/neoforged/neoforge), [catálogo histórico](https://maven.neoforged.net/api/maven/versions/releases/net/neoforged/forge), [documentación para 1.21.1](https://docs.neoforged.net/docs/1.21.1/gettingstarted/).

## OptiFine — descarga y metadatos oficiales

Se confirmó que el controlador podía construir un nombre de archivo oficial, pero rechazaba la instalación si no se utilizaba mirror. El servicio de metadatos tampoco tenía un proveedor oficial activo y podía devolver una lista vacía en una instalación sin caché. El scraper del host existía, pero no estaba conectado a esa consulta del runtime. Las previews se interpretaban como `HD_U`/`J1_pre9`, lo que perdía la distinción requerida para el nombre `preview_OptiFine_...`.

Correcciones:

- Se conecta el scraper de Electron mediante un proveedor inyectado opcional; el runtime no importa Electron.
- El modo oficial consulta `https://optifine.net/downloads` sin habilitar un mirror. En modo mirror se conserva su prioridad y se añade el proveedor oficial como alternativa.
- El resolutor oficial abre la página del archivo y obtiene el enlace de descarga con su token. Solo acepta HTTPS, los hosts oficiales ya contemplados y la ruta `/downloadx.php`.
- Main y preload utilizan `optifine.net`. Se conserva la compatibilidad del validador con el dominio oficial anterior `optifined.net`.
- Las previews se interpretan como `HD_U_J1`/`pre9`; las releases como `HD_U`/`M5`.
- La caché permite un fetch específico del host y mantiene validación de esquema, persistencia, fallback y revalidación existentes.
- Se preservan los límites de tiempo y limpieza de listeners de las ventanas auxiliares. Los hosts sin proveedor oficial conservan sus caminos de mirror/caché; no se añade un scraper nuevo a DeskGap.

Pruebas: resolución oficial y mirror, rechazo de enlaces no válidos, releases/previews, selección de fuentes, materialización de metadatos en caché, receta 1.8.9/HD_U_M5 y generación de puntos de entrada standalone/Forge. **El scraper y la descarga del JAR oficial no pudieron completarse en el launcher real durante esta reanudación.**

Fuente: [descargas oficiales de OptiFine](https://optifine.net/downloads).

## Forge, Fabric y Quilt

No se confirmó un defecto nuevo reproducible que requiriera modificar sus instaladores. Se conservaron los pipelines existentes de upstream, los endpoints legítimos, las comprobaciones de integridad y los mecanismos de recuperación.

| Cargador | Caso de regresión | Comprobaciones aprobadas | Pendiente |
| --- | --- | --- | --- |
| Forge | Minecraft 1.20.1 / 47.3.0 | Receta exacta; tests existentes de metadatos, workflow moderno y legado, procesadores simulados y recuperación | Descarga, procesadores Java y lanzamiento reales de este caso |
| Fabric | Minecraft 1.21.1 / 0.19.5 | Receta exacta, URL `/v2/versions/loader/.../profile/json`, conservación de padre y mainClass | Perfil real del par, descarga de dependencias y lanzamiento |
| Quilt | Minecraft 1.21.1 / 0.27.1 | Receta exacta, URL `/v3/versions/loader/.../profile/json`, conservación de padre y mainClass | Confirmar el par con el proveedor, instalar dependencias y lanzar |

La consulta real previa de Fabric para 1.21.1 devolvió 0.19.5. La de Quilt devolvió una lista cuyo primer elemento era 0.20.0-beta.9; **eso no verifica por sí mismo el perfil 0.27.1 empleado en el test simulado**. No se presenta ese test como prueba de compatibilidad real. Los intentos de descargar los perfiles concretos de ambos proveedores durante esta reanudación fallaron con «No es posible conectar con el servidor remoto».

Fuentes oficiales: [Fabric](https://meta.fabricmc.net/), [Quilt](https://meta.quiltmc.org/), [Maven de Forge](https://maven.minecraftforge.net/).

## Correcciones existentes de upstream revisadas

Estas referencias pertenecen al historial ya integrado; no son commits nuevos de esta fase:

- `8c9f6474612e7eee70813a3afc949367950d94d9`: nueva implementación de instalación, coordinador y pruebas. El camino oficial de OptiFine incompleto se identificó en esta implementación.
- `c2c171c4a848b857f6a304e607be0836ecaa78a6`: metadatos en backend y caché SWR, infraestructura conservada.
- `24f2d7ed6056e8843c53a5d328902c5572c74992`: recuperación de instalaciones Forge con salidas obsoletas, conservada y cubierta por tests del manifest.
- `b7354d3e69110e699ee566dc990a6f3680fcd312`: recuperación de descargas por rangos y diagnóstico de procesadores.
- `16587ef075bc9af8d9368ac16df86c8f68d9a6e9`: corrección histórica de carrera de NeoForge. El servicio antiguo fue reorganizado posteriormente; se conserva el coordinador actual, sin trasplantar el archivo antiguo.
- `a330462ef332292867832fcb2bf9a84ba2601ee9` y `ae691742fcebab9478e637c1c009ad824619cf62`: antecedentes de reparaciones de NeoForge y 1.20.1.
- `cb34f74c0e1702f8ffe0401f13839a40e04b2963`: antecedente de ordenación NeoForge. La rama actual ya contiene el helper numérico y sus tests.
- `495135cb71fb2550f8d017ed97f39416717aedd6`: reparación LabyMod 1.21.9; no resuelve la confusión entre familia 1.8 y Minecraft 1.8.9 aquí identificada.

## Validación ejecutada

Se reutilizaron dependencias instaladas. El pnpm compatible es 11.10.0, ejecutado desde su instalación existente; no se cambiaron configuración compartida, dependencias ni lockfile.

| Comprobación | Resultado |
| --- | --- |
| Tests de `packages/installer`, caché de versiones, NeoForge, fuentes OptiFine y ordenación de UI | **303 aprobados / 31 archivos** |
| Tests de selección/reinstalación, telemetría de procesadores, downloader, política de mirrors y locales | **73 aprobados / 8 archivos** |
| Total de ambas ejecuciones, sin archivos repetidos | **376 aprobados; 0 fallidos** |
| Typecheck Runtime API, Runtime, Electron main/preload, Keystone UI y DeskGap | **Correcto en los cinco paquetes** |
| Lint packages, Runtime API, Runtime, Electron y Keystone UI | **0 errores**; 2 advertencias preexistentes en `InstanceBlueprintsService.ts` |
| Keystone UI | **Compilación correcta**, 26,71 s; `verify-bundle` correcto en 103 chunks, 0 orphans |
| Compilación Electron | **Bloqueada antes de compilar**, `tsx`: `uv_os_get_passwd returned ENOMEM` |
| Compilación DeskGap | **Bloqueada antes de compilar**, mismo error de `tsx` |
| DevTools CLI oficial | **Bloqueado** por el mismo error al consultar `os.userInfo()` |
| Descargas de perfiles Fabric/Quilt | **Bloqueadas por conectividad** |
| `git diff --check` | Correcto |

El comando agregado `pnpm check`/`pnpm lint` encontraba el pnpm antiguo del sistema en sus comandos anidados y fallaba con EPERM. Se ejecutaron las comprobaciones equivalentes por paquete con pnpm 11.10.0; todas pasaron. Electron y DeskGap se intentaron con sus scripts normales y con `node --import tsx build.ts`; ambos caminos fallaron antes del build con el error del entorno descrito. No se alteraron herramientas para ocultar esos fallos.

Vite mantiene advertencias de tamaño de chunks, externalización y tiempos de plugins; su proceso y la verificación final terminaron correctamente. Los detalles y salidas se conservan localmente en `temp/phase5-*.log`, fuera del seguimiento Git.

## App real, instalaciones y límites

Durante el trabajo anterior de esta fase se usaron las tareas de desarrollo, renderer `http://localhost:3000`, página PbtModLauncherX y depuración 9222. Se completó el asistente en español sin cuenta, utilizando exclusivamente:

- `temp/phase5-loaders-appdata/pbtmodlauncherx` como datos de aplicación.
- `temp/phase5-loaders-game` como datos de juego.

La pantalla principal y el diálogo de creación se abrieron después de corregir el import de navegador. **No se completó la verificación visual de selección 1.8/1.8.9 ni una instalación de cargador.** Los logs registran inicialización de servicios y detección de cinco Java, no una instalación exitosa. El registro aislado de instancias permanece vacío; no se creó una cuenta ni se modificó una instalación de usuario.

Los JSON oficiales consultados previamente son pruebas de metadatos reales. Las comprobaciones HTTP de artefactos son pruebas de disponibilidad. Los perfiles materializados por los tests usan fixtures y son pruebas automatizadas locales. **No hay ninguna instalación completa real ni lanzamiento de Minecraft verificado en esta fase.** No se ejecutó la matriz de instalaciones de red ni se realizaron descargas masivas.

Por el bloqueo del CLI y de la consulta de procesos no se pudo reconectar ni confirmar el cierre de las tareas dev anteriores. No se terminaron procesos Electron de identidad desconocida. Los directorios aislados de diagnóstico se conservan en `temp/`; no se eliminaron recursos de usuario.

Pendiente en un entorno con permisos y conectividad adecuados: recorrer el selector completo para los seis cargadores, ejecutar instalaciones aisladas con las versiones indicadas, revisar integridad y logs de procesadores, verificar perfiles con el servicio de versiones y lanzar Minecraft. Para LabyMod 1.8 el resultado esperado es ausencia de una opción incompatible; para 1.8.9, instalación de su perfil exacto. Para NeoForge 1.21.1, solo builds 21.1.*. Para OptiFine, comprobar release/preview en modo oficial y mirror, tokens y JAR.

## Archivos y compatibilidad

Cambios de producción:

- `packages/installer/labymod.browser.ts`, `labymod.ts`, `versionInstallManifest.ts`.
- `xmcl-keystone-ui/src/components/VersionInputLabymod.vue`.
- `xmcl-runtime/install/VersionMetadataService.ts`, `neoForgeMetadata.ts`, `optifine.ts`, `versionMetadataCache.ts`.
- `xmcl-electron-app/main/controllers/optifine.ts`, `optifineSource.ts` y `xmcl-electron-app/preload/optifine.ts`.

Pruebas añadidas o ajustadas:

- `packages/installer/labymod.test.ts`, `modLoaderRegression.test.ts`, `versionInstallManifest.test.ts`.
- `xmcl-runtime/install/neoForgeMetadata.test.ts`, `optifine.test.ts`, `versionMetadataCache.test.ts`.
- `xmcl-electron-app/main/controllers/optifineSource.test.ts`.

No se modifican branding, traducciones, idioma predeterminado, actualizador PbtServers, Discord, funcionalidades offline, namespaces ni arquitectura de paquetes. El Application ID Discord permanece `1213977247514361856`. Las pruebas existentes de locales pasan; el perfil aislado mantiene `es-ES`. No se iniciaron reparaciones ajenas a esta fase.

## Git y confirmación pendiente

La orden `git add` de los archivos de esta fase fue rechazada con:

```text
fatal: Unable to create '.../.git/index.lock': Permission denied
```

El entorno actual no permite escalación de permisos. No se sorteó esta protección ni se solicitó una aprobación que no puede concederse. **No hay commit nuevo**; el SHA final continúa siendo `b5ffa3527596b1fdd3071ecd819f0c25c87f2be5`. Hay 13 archivos rastreados modificados y 6 nuevos sin seguimiento, incluido este informe; los cambios permanecen sin staged. No se cambió master ni backup.

Mensaje propuesto para el commit, después de completar las comprobaciones bloqueadas: `fix(install): preserve exact loader versions and restore official OptiFine resolution`.

Se detiene el trabajo al cierre de esta fase, dejando explícitos los bloqueos y toda la modificación local disponible para revisión.

## Fase 5.1 — Conservación y diagnóstico adicional (2026-10-10)

Se revisaron el diff completo de los 13 archivos rastreados, los cinco archivos nuevos de código/tests y este informe: las 19 rutas corresponden exclusivamente a la Fase 5. No se modificó código de producción durante la Fase 5.1. Se mantienen las 376 pruebas aprobadas y los typechecks de la ejecución anterior; no se repitieron comprobaciones sin cambios de código que lo justificasen. `git diff --check` continúa correcto y el índice no tiene cambios staged.

### Escritura en Git y unidad G:

- `.git/index.lock` **no existe**. No se borró ningún lock.
- `Get-Process git` no devolvió procesos Git. La consulta más detallada de procesos mediante CIM está denegada, por lo que no se afirma una inspección completa de todos los procesos del sistema.
- El repositorio y sus archivos son legibles; se pueden crear logs y copias de seguridad dentro de `temp/` en G:. No hay evidencia de una unidad desconectada. `Get-PSDrive G` no proporciona una cifra fiable de espacio libre en este entorno.
- Las ACL de `.git` y `.git/index` contienen entradas explícitas `Deny` de escritura para identidades usadas por el entorno restringido. El proceso se ejecuta como `CodexSandboxOffline` y pertenece a `CodexSandboxUsers`; además, el perfil de permisos de esta sesión concede solamente lectura de `.git`.
- Un nuevo `git add -- packages/installer/labymod.browser.ts` vuelve a fallar al **crear** `.git/index.lock`, con `Permission denied`. No es un lock obsoleto ni un conflicto de merge.
- La consulta de Defender (`Get-MpComputerStatus`) está denegada. No se puede confirmar ni descartar su intervención; no hay evidencia que permita atribuirle el fallo. No se desactivó el antivirus, no se cambiaron ACL, no se usó otro usuario ni se intentó eludir el sandbox.
- La política actual no permite solicitar escalación. Por tanto no se puede escribir el índice ni crear objetos/refs del commit desde esta sesión, aunque el usuario haya autorizado el commit local.

### `uv_os_get_passwd returned ENOMEM`

Se reprodujo el fallo con un script diagnóstico que solo importa `node:os` y llama a `os.userInfo()`, sin cargar ningún módulo del launcher. Node es `v22.22.3`. En esa comprobación, el sistema reportó 20.940.992.512 bytes libres de 34.259.640.320 y el heap del proceso consumía aproximadamente 3,9 MB.

La reproducción mínima confirma que el fallo ocurre en la consulta de identidad del entorno Node/Windows de esta sesión, antes de ejecutar el código del launcher. La etiqueta ENOMEM no demuestra agotamiento de RAM; las cifras observadas no lo sugieren. Es coherente con las restricciones de la cuenta de ejecución de Codex, pero la llamada interna de Windows que origina el error no pudo inspeccionarse con los permisos disponibles. No se cambió Node, `tsx`, dependencias ni código del launcher para enmascararlo.

Se reintentaron:

| Operación de Fase 5.1 | Resultado |
| --- | --- |
| Electron: script `compile`, con pnpm 11.10.0 | Bloqueado al importar `tsx/dist/temporary-directory-*`, antes del build |
| DeskGap: script `build`, con pnpm 11.10.0 | Mismo bloqueo antes del build |
| CLI oficial DevTools: `list_pages` | Mismo bloqueo en `getRuntimeHome` / `os.userInfo()` |

DevTools es una herramienta CLI ya instalada, no un paquete del launcher que deba recompilarse. Se probó su ejecución; no se instaló una dependencia nueva ni se creó otra sesión Electron. No se pudo reanudar la validación visual ni verificar instalaciones reales. Todas las instalaciones y lanzamientos pendientes de los seis cargadores siguen explícitamente pendientes.

### Copia de seguridad independiente de Git

Se conserva una instantánea en `temp/phase5.1-preservacion-20261010.zip`, con las rutas relativas y el contenido completo de los 19 archivos, incluidos los seis sin seguimiento. Se acompaña de:

- `temp/phase5.1-preservacion-20261010.manifest.json`: rama, SHA base y lista exacta de rutas, tamaños y hashes SHA-256.
- `temp/phase5.1-preservacion-20261010.patch`: diff binario de los 13 archivos rastreados respecto de HEAD. Los archivos nuevos están en el ZIP; un patch de `git diff` por sí solo no los protegería.

La copia se verifica leyendo sus entradas y comparando sus hashes con los originales. No contiene `.git`, cuentas, preferencias personales, cachés de juego ni dependencias. Es una copia en la misma unidad, no una protección frente a pérdida física de G:; se puede copiar el ZIP y su manifiesto a otro soporte. Los artefactos están ignorados por Git y no forman parte del futuro commit.

### Comandos manuales mínimos

Ejecutar desde una PowerShell normal del usuario propietario, fuera del entorno restringido de Codex. No borrar locks ni cambiar permisos. El manifiesto limita el staging a las 19 rutas revisadas:

```powershell
Set-Location 'G:\Documentos\Compilar-Libs-Dev\PbtModLauncherX-Dev'
if ((git branch --show-current) -ne 'dev/upstream-v1.0.7') { throw 'Rama incorrecta' }
$phase5Files = (Get-Content 'temp/phase5.1-preservacion-20261010.manifest.json' -Raw | ConvertFrom-Json).files.path
git add -- $phase5Files
if ($LASTEXITCODE -ne 0) { throw 'git add falló; no continuar' }
git commit -m 'fix(mod-loaders): correct LabyMod NeoForge and installer metadata'
git status --short
git rev-parse HEAD
```

Para reintentar los hosts desde ese mismo entorno con Node y pnpm compatibles:

```powershell
node -p 'require("node:os").userInfo().username'
pnpm --prefix=xmcl-electron-app compile
pnpm --prefix=deskgap-app build
npx -y -p chrome-devtools-mcp@latest chrome-devtools list_pages --output-format=json
```

El último comando requiere que el CLI esté conectado al endpoint de la app dev mediante el procedimiento de `.github/skills/chrome-devtools-cli/SKILL.md`. Una compilación de producción de Electron puede reemplazar el bundle de desarrollo: reconstruir `dev:main` antes de validar la app y confirmar que el renderer usa `localhost:3000`. No iniciar una segunda app si ya existe una tarea dev activa.

Estado final de Fase 5.1: sin commit nuevo por la restricción de escritura de `.git`; HEAD `b5ffa3527596b1fdd3071ecd819f0c25c87f2be5`; rama `dev/upstream-v1.0.7`; 13 modificaciones y 6 archivos nuevos conservados, con copia adicional. Master y backup permanecen en sus SHA originales, sin push, tags ni releases. La versión sigue siendo 1.0.6.
