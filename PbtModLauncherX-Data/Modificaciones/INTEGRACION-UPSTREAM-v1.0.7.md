# Integración de origin y upstream — preparación de PbtModLauncherX v1.0.7

Fecha: 2026-10-10. Fase 2 completada en `dev/upstream-v1.0.7`. La versión oficial del launcher sigue siendo **1.0.6**. No se ha hecho push, creado tags, publicado releases ni modificado master o la rama de seguridad.

## Referencias y commits

| Referencia | SHA |
| --- | --- |
| Estado local original, master y backup/pre-upstream-v1.0.7 | `c4b77e666f0b132e05e3ffff71d2728132a46a44` |
| Fork actualizado mediante fast-forward de origin/master | `618d94eb7096599002bab5fd73636c917c0590d1` |
| Auditoría preservada mediante commit en la rama de trabajo | `2b2dcbdae57f3551480f76fa56e11ecfd4534d50` |
| Upstream integrado | `0379941d1997e92b079fdc21e8692c8e45cd8cd7` |
| Commit de integración del fork | `40e727eec66fc1e61cb48cb2265f55945899752e` |
| Ancestro común anterior al merge | `72d8489ca48423d56b49f211c94b33a258564839` |

Las referencias utilizadas son las descargadas y fijadas en la fase 1. No se sustituyó el upstream auditado por otro SHA durante la integración. `origin/master` permanece en 618d94eb y `upstream/master` en 0379941d como referencias locales de seguimiento; no se modificaron los repositorios remotos.

La relación inicial HEAD/origin era 0/17 commits exclusivos, con merge-base igual al HEAD local. Se incorporaron **los 17 commits completos por fast-forward** antes de confirmar el informe de auditoría. Se verificaron el catalán, español, versión 1.0.6, branding, iconos, updater y correcciones recientes de compilación.

Después se ejecutó `git merge --no-commit --no-ff upstream/master` y se resolvieron los conflictos antes de confirmar. El commit 40e727ee tiene dos padres: 2b2dcbda y 0379941d. Incorpora **1.554 commits exclusivos de upstream**, conservando los 90 commits exclusivos anteriores del fork y todo su historial. En el commit de integración, `git rev-list HEAD..origin/master` y `HEAD..upstream/master` devuelven cero commits pendientes. Los anexos fijan el listado completo de commits incorporados.

## Conflictos y método de resolución

Se detectaron y resolvieron **585 rutas en conflicto**. Una ruta puede tener varios bloques o avisos de rename/modify-delete; 585 cuenta archivos/rutas, no marcadores individuales. Al registrar las resoluciones, `git ls-files -u` quedó vacío. No se usaron estrategias globales ours/theirs ni se copiaron archivos antiguos completos sobre implementaciones nuevas.

La referencia auxiliar upstream de julio de 2025 fue `7d2d8b8e2c1faa6a043051621c8be80e319ad58c`, utilizada para clasificar código copiado anteriormente dentro del fork, no para cambiar el ancestro del merge.

| Clasificación inicial | Rutas | Resolución |
| --- | ---: | --- |
| Contenido local idéntico byte a byte al upstream histórico | 494 | Conservar el código y las APIs actuales de upstream; retirar los archivos que upstream trasladó o sustituyó. No contienen diferencias propias respecto a esa referencia. |
| Ruta retirada en el fork o trasladada por upstream | 40 | Recuperar idiomas y documentos upstream, seguir los traslados a packages/infra y conservar la retirada de deploy-release, deploy-ui y validate decidida en origin. |
| Contenido distinto del upstream histórico | 51 | Revisar la intención; adaptar branding, login, updater, locales, UI, configuración y tipos sobre el código nuevo. Diferencias de correcciones antiguas, schemas generados y archivos de APIs retiradas se resuelven con la arquitectura actual. |

También se reconciliaron 52 rutas heredadas que el merge había aceptado automáticamente, evitando mezclar implementaciones antiguas con los servicios actuales. Se retiraron los 346 archivos versionados del snapshot antiguo `xmcl/`, sustituido por `packages/`; siguen recuperables en los padres del merge y en backup. Esto no eliminó iconos, documentación Pbt, traducciones ni copias .bak/.old. Se conservaron los recursos y archivos propios comprobados contra origin.

Soluciones semánticas principales:

- **Arquitectura y servicios:** packages concentra core, user, installer, resource, utils y demás librerías; las APIs de ResourceManager, infra, trackers y servicios siguen upstream actual. Se retiraron schemas generados y módulos de resource/save/peer/task/util que ya no pertenecen a las APIs activas. No se conservaron importaciones hacia los módulos retirados solo para evitar conflictos.
- **Configuración:** dependencias y lockfile actuales, pnpm workspace y políticas allowBuilds/overrides de upstream. Los package.json de la aplicación y UI conservan versión 1.0.6, autor, descripción y repositorio Pbt; mantienen licencia y créditos de ci010. Las librerías conservan sus propias versiones upstream.
- **Branding:** nombres de aplicación, appId, launcherName, LAUNCHER_NAME, instaladores, ejecutable Linux, artefactos, títulos y notificaciones Pbt. El nuevo host DeskGap también usa nombre, artefactos y updater Pbt. El protocolo xmcl y los nombres internos de servicios originales se conservan por compatibilidad.
- **Iconos:** se conservaron los 38 archivos del directorio icons de origin, byte a byte. Se reutilizó el PNG Pbt existente en las nuevas pantallas de carga y fallback del navegador; los iconos upstream permanecen disponibles para servicios originales.
- **Discord:** clientId 1213977247514361856 sobre el PresenceService moderno, incluidos los eventos actuales de lanzamiento y salida del juego.
- **Login/offline:** se mantiene el selector sin el filtro que ocultaba autoridades no Microsoft. La validación Pbt sigue aceptando nombres offline no vacíos y exige email para las autoridades online; el nuevo helper conserva la validación estricta upstream para otros consumidores. Se conserva el plugin offline actual, perfiles, UUID, tokens, skins/capes y persistencia. No se eliminaron los sistemas Microsoft o Yggdrasil.
- **Tutoriales:** se mantienen desactivados mediante exports compatibles que no inician tutoriales. Se retiran el proveedor/inyección del contexto principal, el inicio automático y los botones de tutorial/feedback. Se conserva la nueva UI de upstream. SettingAbout sigue oculto; el nuevo XmclAccountPanel se muestra por separado para conservar esa funcionalidad upstream.
- **Traducciones:** se restauran todos los archivos de idiomas upstream y su registro, añadiendo ca. Se mezclan claves actuales con los valores propios de en/es-ES; se conservan todos los valores catalanes de origin. Se adapta `downloadUpdate` a `downloadUpdate.name` en en/es-ES/ca sin cambiar su texto. El registro Vue 3 usa correctamente 'es-ES' y fallback en.
- **Updater:** endpoints y proveedor GitHub PbtServers, metadata propia master/latest_version.json, fallback GitHub del fork, descarga asar/gz, progreso/cancelación y actualización completa con las APIs nuevas. Las descargas APPX apuntan a assets Pbt. Se elimina la reescritura obsoleta /LatestRelease y el mirror de paquetes XMCL; se mantiene soporte opcional de tarball mediante PBT_ASAR_MIRROR para un mirror del fork. La selección de asar tiene en cuenta arm64/ia32. DeskGap consulta releases del fork y conserva la comprobación de firma que rechaza EXEs sin firmar.
- **Electron/build:** se conserva la configuración propia/API de postinstall sin reproducir la clave en este informe, las variantes de iconos y la ruta de desarrollo dist. El código nuevo determina la ruta macOS a partir del nombre de producto. Scripts Linux de sandbox/AppArmor se adaptan al nombre y ubicación Pbt. Se retiene LICENSES.chromium.html y las licencias externas de DeskGap.
- **CI:** Build & Release mantiene tags y política de publicación del fork, con herramientas, cachés, compilación Electron y packaging DeskGap actuales. Los artefactos se suben también en builds normales, sin depender de un mensaje chore(release). No se incorporan los jobs upstream que crean PRs/tags o publican el sitio Voxelum. Se conserva el workflow manual de firma APPX, parametrizando organización/proyecto SignPath y publisher para el fork; no se ejecuta.
- **Datos/documentación:** los 64 archivos existentes de PbtModLauncherX-Data en origin se verificaron íntegros; Website, release-v1.0.6, formato de releases y Registro-Archivos.txt permanecen. La auditoría se confirmó antes del merge. README añade toolchain actual y atribución upstream, manteniendo su versión y contenido propio.

## Toolchain y estructura resultante

- Node instalado: **22.22.3**; requisito raíz/Electron/UI: **>=22.16.0**.
- pnpm requerido y utilizado: **11.10.0**, ejecutado mediante `npm exec --yes --package=pnpm@11.10.0 -- pnpm ...` porque el ejecutable instalado inicialmente no podía localizar esa versión.
- Instalación con lockfile congelado completada: **46 proyectos de workspace, 1.007 paquetes**. Se mantienen Electron 43.5.0 y las dependencias nativas/versiones de upstream.
- Vue 3 / Vuetify actuales en Keystone UI; paquetes compartidos en packages y xmcl-client-vue; nuevo host deskgap-app. Runtime, API y servicios siguen la organización nueva.
- Los directorios node_modules y salidas dist/build son material local ignorado. Los scripts y logs de trabajo se conservan en temp/, también ignorado; no forman parte del merge.

## Validación y resultados

| Comprobación | Resultado |
| --- | --- |
| git ls-files -u, marcadores de conflicto y estado del índice | Sin conflictos ni marcadores; merge confirmado con ambos padres. |
| master y backup | Ambos siguen en c4b77e66, sin modificaciones. |
| Dependencias: pnpm install --frozen-lockfile | Completado, exit 0; lockfile actual compatible. Avisos de módulos opcionales detallados debajo. |
| pnpm check | Pasa Runtime API, Runtime, Electron y preload, Keystone UI; exit 0. |
| pnpm --prefix=deskgap-app check | Pasa; exit 0. |
| pnpm compile | Pasa; compila el proceso principal/preloads/workers de Electron, incluyendo Runtime y librerías transitivas. No todas las librerías declaran un script compile propio. |
| pnpm build:renderer | Pasa; Vite transforma 2.896 módulos y el verificador confirma cero helpers huérfanos en 103 chunks. |
| pnpm build:deskgap | Pasa; host ASCII, renderer y bridges generados. No se ha empaquetado un runtime distribuible. |
| Pruebas de integración seleccionadas | **10 archivos, 76 tests pasan, 1 omitido** por ausencia de DESKGAP_PACKAGING_SOURCE. Autenticación Microsoft, persistencia, offline, login, feed/updater, packaging y workflows. |
| Comparación de recursos propios con origin | **102 archivos verificados:** 64 de Data y 38 iconos, sin discrepancias. |
| Invariantes de traducciones, branding, updater, tutoriales, workspace y CI | Pasan las 7 comprobaciones; todos los valores propios y claves upstream en/es-ES se conservan, incluida la migración de clave documentada. |
| git diff --check respecto a upstream en código/configuración | Sin errores en TS/Vue/JSON/HTML/YML adaptados. Los valores multilínea de la traducción española conservan espacios finales heredados y generan avisos de whitespace en YAML; no se alteró su texto para ocultarlos. |

Errores encontrados y resueltos durante las comprobaciones:

1. pnpm inicialmente no pudo cargar la versión requerida; se ejecutó la versión exacta mediante npm exec. El primer install se detuvo por no disponer de TTY para reconstruir node_modules; se completó con CI=true, sin tocar archivos de usuario.
2. Typecheck encontró tres archivos resource antiguos sin APIs válidas. Se retiraron snapshot.ts, watchResourcesDirectory.ts y AbstractInstanceDoaminService.ts en sus rutas antiguas; sus implementaciones actuales están en packages/servicios de upstream. También se retiró el schema generado antiguo InstanceInstallLockSchema.json.
3. El build del renderer detectó que multiplayer.html apuntaba a windows/app/index.ts, retirado por upstream. La entrada Pbt se adapta al renderer principal y a la ruta #/multiplayer, como hace ahora el controlador Electron.
4. El primer build DeskGap falló por comentarios Unicode de dependencias en el host. Se activa minifyWhitespace manteniendo legalComments external y el control ASCII; el build posterior pasa y las licencias siguen presentes.
5. Los tests de workflow asumían pwsh.exe. El entorno dispone de Windows PowerShell; el harness usa ese fallback sin omitir las pruebas de firma y scripts. Se adaptaron las expectativas de branding y publicación a la política Pbt. Dos aserciones nuevas de login se corrigieron para distinguir true de mensajes de validación; los tests pasan.

Las pruebas son comprobaciones de código y unidades con fixtures/mocks. No equivalen a login Microsoft real, ejecución de Minecraft, comprobación visual interactiva o aplicación real de una actualización. No se ha ejecutado el launcher ni utilizado cuentas del usuario.

## Problemas pendientes y límites de la fase

1. **Catalán para contenido upstream nuevo:** los 1.050 valores propios existentes siguen presentes, con la clave de actualización migrada. **1.447 claves nuevas** usan fallback inglés; no se inventaron traducciones ni se reemplazó el trabajo catalán existente. Completar esta traducción requiere una fase posterior.
2. **Módulos nativos opcionales:** cpu-features no detectó compilador C++ y ssh2 no encontró Visual Studio para su binding crypto. La instalación final terminó con éxito y los builds pasan; deben validarse los fallbacks o instalar las herramientas C++ antes de certificar todas las funciones nativas y el empaquetado final.
3. **Instaladores y firmas:** no se ejecutó build:all ni se firmaron/distribuyeron instaladores. Las variables CODE_SIGN_PUBLISHER, SIGNPATH_ORGANIZATION_ID y SIGNPATH_PROJECT_SLUG, las credenciales y la identidad del publisher deben configurarse para Pbt. El issuer APPX antiguo permanece como fallback. El workflow manual de firma espera drafts; la publicación por tags mantiene la política heredada del fork. Decidir su coordinación corresponde a la preparación de releases.
4. **DeskGap distribuible:** el test que exige un runtime externo se omite. Sus EXEs son preview de instalación manual mientras no se configure la firma; el updater sigue rechazando EXEs sin firma. No se ha debilitado esa comprobación.
5. **Operación real:** quedan pendientes la prueba visual, login real Microsoft/Yggdrasil, perfiles existentes, skins/capes, lanzamiento offline de una instalación local, Rich Presence y actualización sobre una instalación Pbt previa. Las restricciones de metadata offline por allowThirdparty de la capa de servicios siguen siendo las existentes; no se amplió ese comportamiento silenciosamente.
6. **Avisos de build:** importación repetida de UnoCSS, externalización de node:fs en una dependencia de IA para browser, chunks grandes y avisos npm sobre propiedades pnpm de .npmrc. Los comandos completan con exit 0; no se han silenciado mediante cambios de funcionalidad.
7. **Versionado:** root, aplicación Electron, UI, README y latest_version.json mantienen 1.0.6. Las librerías y runtime conservan sus versiones internas upstream. La futura actualización oficial a 1.0.7 no se ha realizado.
8. **Reparaciones aplazadas:** no se han empezado arreglos propios de LabyMod, NeoForge, shaders, iconos de instancias ni Minecraft 26.x. Los cambios de esos componentes incluidos en el merge proceden del upstream integrado.

No queda un bloqueo de conflictos que impida completar el merge. El resultado no se declara listo para publicar: las limitaciones concretas anteriores permanecen registradas.

## Estado final

La rama de trabajo contiene origin/master completo, la auditoría preservada y el merge 40e727ee. Este informe se registra en un commit de documentación posterior; el SHA de integración anterior identifica el código validado y evita una referencia circular al propio commit del informe. El último SHA de la rama se obtiene con `git rev-parse dev/upstream-v1.0.7`.

Master y backup siguen en c4b77e66. No hay operaciones de merge pendientes. No se realizaron rebase, reset --hard, git clean, push, releases ni creación de tags. Se detiene el trabajo al finalizar la fase 2.

## Anexos de trazabilidad

Los anexos siguientes contienen los 17 commits de origin, los 1.554 commits upstream, las 585 rutas originalmente en conflicto y las diferencias finales del código respecto a upstream. Los valores de claves API no se incluyen.

### A. Los 17 commits incorporados de origin

```text
dc50295ff02d7e295bc2635846cebc602631a8ef feat(i18n): sync upstream keys, añadir catalán y corregir paridad en/es-ES/ca
5545cbbcaacaec3975e06c83c367eae4f79c1836 fix(types): añadir declaración de tipos para create-desktop-shortcuts
8948608a61224c31837057d149b39af6a4e08211 fix(i18n): traducir ca.yaml completament al català (eliminar fallbacks en espanyol)
63645b4cc4e214664f438dcd8fa751208600c1d3 fix(i18n): corregir strings espanyols residuals a ca.yaml (code review pass 2)
1ad935efb3b416ce67e8b1b37f07dae9b2daa128 Merge pull request #1 from PbtServers/copilot/sync-upstream-changes
d780fb6e7bb95b0a083ae97401a42b7ca775aa16 chore: bump launcher version to v1.0.6
33893f282ec7ab4a52a6ffc91a6352a4bdfc38cc fix: unblock keystone typecheck
3c0c3695f5d0bf20aaf797eb246704eb31f3113b fix: stabilize release build pipeline
d72e5ae716f6fd0ac9daa1de82031cc5856767d9 fix: add missing main locale asset
7409418568585a66ec77cc1d1359224a548e510c fix: align linux release targets
6112050a70656b98dc35b5e9b56e1e76c9884ef1 docs: add v1.0.6 release assets
66d72dad0077a2f89726172fccbcab5ed03aa8ce Merge pull request #2 from PbtServers/copilot/update-version-to-v106
a2655610882e4528f8f95821bfffc622778553de Enhance build workflow with release tagging
8458fae5c6dc63922ef333016fb6123474ef6154 Refactor build workflow for UI and Electron apps
2a7e35baca36a971e1b1af84e8ea85705a5b4b77 Delete .github/workflows/deploy-release.yml
95806977b1327bba437813eef5f269c5fd65ee5c Delete .github/workflows/deploy-ui.yml
618d94eb7096599002bab5fd73636c917c0590d1 Delete .github/workflows/validate.yml
```

### B. Los 1.554 commits incorporados de upstream

```text
e8e771f10d060f5412fdddf68190db185e57482c refactor: Added Hungarian language (#592)
e83ab81f111f5d8770015f16ef82afb5a89a0070 refactor: Update network stack
d6b67ea94de99b0243519646bb8f5c47fc872b7f refactor: Improve the modpack store page UX.
c22e545e6233470d43933e74235d63f73c6ce445 fix: Correctly handle some missing forge or missing optifine library issue
ab212731300afec13114c37bc7082376cf0e005b refactor: Try to use autoSelectFamily to improve the ipv6 connectivity
7631080b8a07998337e963440a5fcf5ce46ab7cc chore: fix build due to type check
b260983eefe35e9f9f781224a4506d5581191bf4 chore: fix hungarian locale build
53aeed2e6a8c00e0b76c137a1505695c69dd24ba fix: Fix some UI glich on task and diagnose display
9e15776e5e224f3548e8d4ba6118eaef5a253ef6 fix: Should revalidate the file after download
f5403b9ca8f68d8417c66e744fb6b2a9d29bd9e2 refactor: Adjust download retry policy
10e1a05db490530b9b5e398a392cf60b5ce43e33 fix: The After update to 0.41.2 game started crashing on launch #588
66ab25076f363a707d8bc925d099aa3ad5b18093 chore(release): version 0.42.1
7988e64b857f5de3cd0065febd306eadb933fa76 fix: Some files cannot be downloaded
cadbeebd512d961d18eb607e7bf1ad5eda0cd851 fix: Game version switching not working
681644a2921285ed5bf756374ef10c6d699669b6 chore(release): version 0.42.2
584768706f3a80247324d232a5efca299863abc9 fix: Some curseforge file cannot be downloaded
4e520400090b3e8e3a89dec042cb0bc841ed8525 fix: Some record props is overflowed
4e734a502d19419dd0c0dbe93f2c3946aa7f8eea chore: Adjust the snippets
69573f467a4b476dcc134518a4138f7559aea0e3 fix: Align the windows java path
e92db8a2f2d1a7373350461f8e03bbe4e84e2694 fix: Adjust network retry policy
da767033cd38166b07d40db4c4c56ae7f32ccc92 fix: Should hint user to fix legacy forge
1a07bef33ad1e918c0f5e2f7ca2afff514b5f531 chore(release): version 0.42.3
f5bcf190dff98388e9916e7f6fc15c8ed51549f9 fix: Detect java arch fail causing the adding java failure
a6935c443c70e3023ccbd818f6d5b6dc3d6e0227 fix: Should not destroy the timer multiple times
50ba09ea663bd24e0aa00590b769f284569734c0 fix: Windows zip autoupdate doesn't work if path has space
d3890a0a0641cb50c2508a3c555150ac7d978869 chore(release): version 0.42.4
893653c370737b4145da9cee70797b67e299f0ed refactor: Track failure on browser
5920b1170ecb875af338acd1a4a28461a275331b fix: Respect the disable elyby options
eb5eb6dbe4ac341ae9052b15a0aae843be6ed371 feat: Add an option to switch shared resource pack folder
ac00ab52e785de8dfade6cc7605cea7297cc888b fix: Leverage curseforge hash to make sure the file is correctly downloaded
ea5899857a8f005d4e23d292d014c00b26b36d95 fix: Cannot select optifine when creating instance
73491f4f2c8de048734e3160038b09d07a2f7a2a fix: Improve the libraries download perf by matching host in accure
5b1a83b04bae8e1138c25c89b5aea8ca7eaaf271 fix: Extends connection timeout threshold
2ca93d7980c29438c145c7d77926767564cfec6f refactor: Improve retry policy to improve success rate
f9be5d1c0c79fc1fc4dfed5b1bf46854516b7e78 fix: Cannot install version due to the version list is empty
bf49cfa0147a3b62e1e59f5a25234cea2d8e089f refactor: Make mod loading more progressive
ce83cf03756e22d9ccbd5fb960ad1a08a9c1210a refactor: Remove mojang login
5f150120e855f0f350e82d1adfba07d269a6e866 refactor: Remove select .minecraft and add user login to setup
0aa3a614c39200e72124daa4831fda32b316f534 fix: Adjust the update version display
e884827feb218062c7946ae4f74dd7ac6cdcffff feat: Support to view network connections and kill them
9ae9008739a56a21c846ab794d6d498cce53751a fix: Adjust the instance install hint
525ffcd3d73abc3e894803cf7df6b653f0e1957c fix: Avoid some dead locks during installing instance
5800e6c1ad5a0ab2d12280cf057f554bf51f1a9f fix: Also respect linux and mac java location
4f18024e79694cbc89df29907b4768b7bcb17582 refactor: Fix some ui glitch
cb07ce46e664ad63ada8376c977f2cad3eba032f chore: Fix lints
25b36c99798a14c12dab5eb9f2c6a962b4e8c1e0 chore: Fix jsdetect build
a9a4a97d403df1cf54d1e593e82989ced3ad6e68 chore: Update undici
7ad044f81d252f62d1dfced979fc07daa442c3e6 chore: Adjust minify to pass build
5ad9d0166e8f4eb6243edd646b6bb318bd494e24 chore: Expand node memory to pass build on mac
9eb906f6b33c09731e8a02e30c45dd2357d4b61a chore(release): version 0.43.0
781fa8cf5d695f2674c02c3bee92d978e746db6a docs: correct electron version
9dd7ec365a06b52e3c5380f441f999c681caf1e6 fix: Fail to resolve elyby due to the dup hash digest
450bc38af16aa1dce3617ae01892b2ea5de145a3 refactor: Remove main process http cache and refine the pool gc policy
4beae743fa260d5ad4bc8435e03f5043060bfe14 refactor: Make refresh button force to refresh the user cred
cb889c1b4ade34c821b995a453189e8a014377dd fix: Handle more error cases and remove unused code
0fe59dee930d4fb10eef0126574ded17ad0596a5 chore: Adjust skipFiles
11848c20207f44e68afd35aeebffa007272f2940 chore: Update the node-datachannel dependency
a71b7483df67196d1c0a67b1284fa9f18b99ea22 fix: Revert the uk file
a04c16d4480d53817e322a802ac3f5ed250c133d fix: Prevent engine initialize delay user login feature
2541e88b1ac983a8a61facac7a33f88361319612 fix: Curseforge invalid hash value causing the download failed
e58584072dcad2d3cc809e509b80d336ad4e23cd fix: Empty header causing the request failed
4b2d9b5a2f0a49b822e82504b1e9766875ee16ae fix: Wrong color on skip login button
d88539813b9e4037dbded9e27b87541881c8251b chore(release): version 0.43.1
e52d11df9bea650ef621ba870eaa4f4021ed0a94 fix: Update undici version to avoid the download throw unexpected error
4234c334934a8fd74ed1c7d5df04cbf223b594f6 fix: Some forge libraries are wrongly mapped #612
b8ec69f5abc72bfa34d0e0b4a3ef09078c043d9e fix: Undici parse header issue
78540ac17b2b839c616ed717ce8a9b0fa709987f chore(release): version 0.43.2
76a9ce423c5796eac8080c3339abffb41f2ab815 chore: Update the release note generation
20734a013c92ff22ce7d52b0040b5c2aff90acc6 fix: Undici parse header causing some headers are missing
5ebd0ac8d07707c3f0838e92ec01b1cef3725938 fix: Color picker dialog cannot be shown
634877ca7239a5a864982724bc00de16c7948e82 fix: The modpack page route lost after search
3199d7520d9055aaa7cfbaf0485143fe1f08c260 chore(release): version 0.43.3
ca8d7574d83a9e19e2ed2b26ce7066412dcb6311 feat: Add theme (#614) ---------
bc4f1da7aaaa2527752bd08eab6d181fc9e689eb refactor: Reduce network stat update freq
f2741a8b3f8d6da4169616cc3bbb78b09fbdeb32 refactor: Enhance save page UI
1b4fc31fa409d6305d87ba13e8c943dd22430a26 feat: Add version filter to mod/resourcePack/shaderPack page and remove curseforge and modrinth window
5297d1e984b82f10f78376689c85f81e8716bc85 fix: Some curseforge file cannot be downloaded
f44039eca2e45d921d3dfd3d54b11eaf4c0398a6 refactor: Remove dead code for curseforge and modrinth
0e3c8fdedcab33602c13005cf7ce6c1cbb80146f refactor: Adjust the sidebar group
58d2a7ac224ff054c6e5f57f48b267469f6e31af chore: Update lockfile
d1ad3208b2eb42bc27a716e8d395c5ead09818ce refactor: Optimize the mod/resourcepack/shaderpack/modpack search trigger to use less resources
186516ed879a24f558a07718923dff4649d3aced fix: Render two layers of head
a2138c32cf1df1fc690ac9eb549a2ceed79f49e8 fix: Use curseforge fingerprint to identify curseforge mod metadata
a34b0df3f5c4b05aeab3e723b55d7bfebafa3b93 fix: The curseforge modrinth switching might mismatch sometime
91b087abe4ce7d378a8bd97351f883b93a35c45b chore: Update deps
e77cab5b423818376cf0ae3d1514b8dd779d1552 chore(release): version 0.44.0
a21a8f8936667249e2deff1071d214572093f1fb refactor: Move news to my stuff page with new design. Adjust focus view sidebar buttons integrated with my stuff page.
64a9d15b664fc783a42b85dcf6cdc8b34dd547bf refactor: Load native module dynamically. So the in-compatible electron won't break directly
7b2c5637892e8a68c4d208514b4a033720981a16 fix: Sometime launch status is not mached
6cfcf1ab5467a94e1e99006274a1bfe5d9b4ec73 fix: Drop the stun.qq.com and use stun.l.google.com instead
eec680f98137376519817c1a96a71db06dd74df6 fix: Handle more error cases and remove unused logs
11501e2b032730163895267a5ea2ed7d0ccf488e fix: Store page does not have tutorial
9495fa889135280f633357c7a96e28f9796f2fd1 refactor: Add locale and fix some type & lint issue
6562699ff7316990319fa1b72b773b61c727261b chore(release): version 0.44.1
a182cb7a12af816359d38f495eab5cf854320c70 chore: Fix the wrong release note generation
e3b48e151e71c7b0c9dfec39b51411c369bb61e9 fix: Resource pack and shader pack search does not load more
6a083926c00f3d3192866a93b6d8901d042dbafd fix: Resource pack page switching modrinth/curseforge does not work
5145690a5b7e9383e355df0b0a4b7c0153207c15 chore: Update undici
8bd7b46dd8866fa0bcf5fcf1a70914ac6ca5061c chore: Update electron and native dependencies
bd926f3dab522a792baa2380aaf92546d3a3402b refactor: Sample error to reduce redundent log
ee952a5ca2283bede188cdecb3c5afd14e61aad7 fix: Curseforge install dependencies's versions are wrong
917de15cd8d928d850d152e10f13408e9f934cee fix: Page can be wrongly scroll down
61d5d9fcd3819ab7be0e15187f3771317d47c67a fix: Modrinth categories result is inaccurate
b22263fd45756590df40d401dc13e2fdbfb15e18 docs: Upgrade the contribution doc
f95e00744b6ac720ff983b9ceb64802052483478 refactor: Recommend categories in the market page
f61638dcdb582c96e6fa1948ebc037da297e27d3 refactor: Use dynamic stuns
edba33150fa9085ccdf5b519bdfdccd7212636ce fix: Decorate more error
88be68d729fe71047c7be4781e4252373621a393 chore: Fix macos build
afa2079fe9430e7a5a59eb8d9bd52833619b91ca fix: Fix cross disk causing auto update failed issue
4c890a83f8a0c398850ae8fe82118c22fa0c122e chore(release): version 0.44.2 (#620)
3671647f6e949d2ab09eb1f41a7ee32c08c7f151 chore: Adjust the release note
cf16c543508fd535ec5ef6912b6475602391460d fix: Logger does not show logs
8e74b84f9872de9f143c3b47c4e352e55a0cca65 fix: Launch status some time is not synced
148c1bc88db18dcb9131b1859edafb64429eed8c fix: Bad elyby or little skin server causing login failed
e29ce756daec80dc948bc484b1efe54e6d92425b fix: Should close the delete dialog after delete
064521e6c2c0e29a2c084b5da977782c74259bdd fix: Add fallback stun
e516915b844dae4f4c9d2756ea44f9d7a8ea9434 fix: p2p connection does not work
ff7b7c4907ac628c433b263109e8e7cebb0c85ea fix: Update hu.yaml (#622)
9e75bafb7cdf956cd7e20c74ad95330c1d58c44d chore(release): version 0.44.3
080bdec41e54ad9411a28f86805cdbb405764231 fix: Fix crash if the connection is closed
491204bbaea8cfe8fe17846081331d494c3280ff fix: Try to reduce the chance the setup failed
deb4e39b488c345632220b4faac64b5639928476 fix: Prevent fail due to the file index is empty
2e6a49a7d3de825200b13bcb80ddab4d3786e24a chore(release): version 0.44.4 (#623)
e4b1db688757c1e581a6c6886acbeaadd6444598 Add translation for changelog
d343ad03b52b0b914937b7373a13fe64694cdb79 fix: Don't show abnormal dialog if the game is closed in launcher
4c2bb7a23eb09a981624561863b094924192f325 fix: Should not be able to select labymod with forge
b3f1be41e49ad8acebcc41891072ba0f907866d5 fix: Fix the case that the missing jar causing install failed
3e563eaf23714a11e220a05b3cbfc1c31daab8d7 fix: Change the logic of hint user incompatible java
321bb3114bec2504f4089d149907b8aeaf921613 fix: Fix the case that sometime the launch button is keep loading
e1de789aacd563ab2425593f86ad4e7b60c45d1c fix: Adjust some Chinese locale
3301c4c2b8c979cef97e8e33ebebfee008cc9220 fix: Avoid wrong ely.by library replacement causing game crash
984c20ad05348fde9c0474bab514000124ab4f86 fix: Abort download causing instance always launching
531631919daa8f6cff67a799257079a40fe082d2 fix: Try to avoid some wrong libraries replacement causing game crash on Windows
38a1b532a70528bd14d22daedf097c6d416cb165 chore(release): version 0.44.5 (#629)
707d9af74c00ebe8ba5fc5fbe0f0719f0b5595fd docs: Adding Polish and changing READMY (#638)
e3d815e0fd7bfab5ecea5300ae1c38dae5b1426b fix: Fix the wrong pl locale causing build failed
3d823ca6833d867386f5af51e6a858bf56e974a5 fix: Warn user during the modloader changed in the instance update
9e35c604ac66a92b0ac4a92254cd2e829ed1d534 fix: Fix the modpack install failure due to the bad file names
81c0cc450aa2f512c515bec5a7bb1c7e052ea8bc fix: Should also identify the modpack source during the importing
3e877e1197c79a602c3c5e7a42b02f51eb843906 fix: Should install neoforged modpack
3043402954dbe1f90a78f5ecd259e0058921d303 refactor: Add notifier for some failure and adjust some docs
1382232490d033091c91f2b0c1622f674006e041 refactor: 修改一部分词条 (#640)
95b668c5c160c61e83c1a5ee6bbfcba85bf650e2 refactor: Move multiplayer to a new window.
3fcdab82c92fe790474aacc6a93ad7056b7700f7 fix: Fix some wrong color in light mode
a71d984e0a7640ac43b7815b40fbe5256c2853b6 fix: Add import modpack option in create instance dialog as fallback option
539c92cd5f6f3d1b6190fce5aa3b5bb7b998f516 chore: Fix build
3671a1454ce8474e4f288f6862414a0345aac663 chore: Adjust local and fix build
bc4533a3e49199f812138d512a5c8268f0c733b2 chore: Fix preload script in prod
d62d864f1c11ec1d1f516b5e6bdc7d68026b9d7a chore(release): version 0.44.6
73235d94d200f22baf77e67c3ca88683aa5b265a fix: Avoid undefined error during resource update
c0d3d1ed755eda7644f84c603735c3f5e4a16c0f refactor: Enhance version fetching to avoid the case user cannot get version list
3eae220eb40e9f765d8462d85959545d820f1748 refactor: Update zh-CN.yaml (#647)
eda64befe224eb9417eea829d33cbfefb9c2796b fix: MixinBooter installs incorrectly when it's installed from the Launcher #655
9035f7d4fbf702598e267c9bfba6d2f65bd80f4e fix: App path under opt/ on Linux can be improved #654
38e08bd3124a4b1d01b05feedd3de01412cdeb74 fix: Wrong user window size
2c3c582e1a27af1341627de5863e06b84e059cbc chore: Fix build
a06829cc4570c9673938c7a61372a7c847b30343 chore(release): version 0.44.7 (#653)
63305798e4b20bf7a97968eaec4ca11ab06fd0cf refactor: Update zh-CN.yaml (#656)
49f63892f8d3c6d7dbbb2b4cb1a2a96bc6dfb7c8 Update zh-TW.yaml (#658)
becb94610e0e88bb66b5d5cd984ac16a0f7fda41 fix: Dev login should respect the user input uuid
c6e6938019d8b0c65ef01478a81ac20a392330f8 refactor: Clean up start up code
7edde5604bf896e527cb7a51792cf4e2710d48a2 refactor: Add login success page with auto close hint
414442024135290efaf9e5eaaf265a505150651c fix: Multiplayer window cannot show on mac
e6efaa2ffff4ed3ab8198033302633659f4b385e fix: Linux deb target file path should use xmcl
e46b45598cce7189fc15de568a7d9c13ab3e8191 fix: Mac dock icon click should activate the app
c3291c4d7fca0578cb1de8b27d97291ea78f4821 chore: Update deps
589aa4085bc447fb4ca193044fad29517b09d868 chore: Upgrade the pnpm
8f43512c2b182ff2a0a42cc79caf738642bc278d refactor: Unified the dialog usage and improve the dialog performance
cb55870ef08e1859c0c3d798b99103862b862422 fix: Improve pref by not update the route every text input in Mod page
2a37ae8858f993b7902d9fefb061935d8dfe73ba refactor: Improve perf by preload more items in mod list
7cfb6a1cecdeab61fc9be039d29b524a538cafdc refactor: Improve modpack home page perf by enabling content-visibility
3a67367c6ef45a6d1bbd6e067aed79c4326be0cf fix: Should display mods supported versions if no version is selected
abe987a9970b466bb2fa0105a2e7882d034a91ac fix: Some modrinth project shows empty license
97e33f6ae2dc4d5b5479b52091fc26eb7784081b chore: Update deps
a59a811b162cba8302b4b4b825309284862661e5 refactor: The inter-navigate from the modrinth/curseforge description should be handled inside the launcher
ddb3a8de7f6e24e14386be0d0ceac83a033347ec refactor: The mod updates should popup dialog instead of directly installed
516c96da661f33025e0088291f402248801426e6 fix: Sometime the instance context menu locale is wrong
290434eee999a87aab0a7b573d9670dc95219bca fix: Fix some image dragging issue and launch window detection issue
92d171c1b00dc84b6262406359d0f55b9bd1d5be fix: The task progress color is wrong in light mode
0419a3537d2afe7630e99ad7bbf0da5afe2cd237 chore: Fix lint & type
df4825c981df0de6b3ad974a6eab17e9046cee32 fix: The modrinth modpack export files are missing
a4144edf7c9ba385d78607432282132d348c9c73 fix: Should be able to search neoforge mods
a3dd255d480c6dc575bff1df4792e91232013de0 chore(release): version 0.44.8 (#657)
d8897cd52a7760bf75411b948c1a7b927bebb349 fix: Should be able to display quilt version
39906b48b5862042dfbc443e21749c9f9cd58614 fix: Some unseen peer is matched wrongly
2f30137ec7d9128bbc97e1f685a1e24c6a6e4f5e fix: Share instance should also share runtimes
b829a63669327129f38a27f06cf3e2e65323b3ac refactor: Advanced mod list. Supporting dense view, batch selection, sorting and warning for duplicated mods
0d40516c7042da8c8bd2b8acc610059f9ac3179c fix: Logger window dark mode button is not working
813da97727dda3e3d34d5a172d1ef0a7a393aa00 chore: Fix deb after-install script
917e095943ffde7304867c3f8fa523b918cb7a14 refactor: Optimize the telemetry of page view
35a2824cdea3767fa847d1f50565f3a53fa0b0d9 fix: Should not refresh quilt if the mc version is not presented
8cbfb6b2d778498a16ecf004d79344d12b5d6b7e fix: Shaderpacks folder should also be able to unlink
11b8ec32190f5eb796dc904a3e841a7f67b2a166 chore(release): version 0.44.9 (#664)
9ee3a35b1405d8e869c4d9ef977892e9965eb4ad fix: Add Italian language support (#667)
93194a126002587d9bf58bbb8be70aa572d1857b fix: Linux postinst file does not replace fully
f6f27c79ff2b8fe69e40492465567eaaf0166e43 fix: Some neoforge filter/version is not respected in modpack
8561086e3feb6718fd3101152088fe997916f673 fix: In modrinth, the curseforge link won't correctly handled
ff30155c929b093ed0bef98eb15832965507ed36 fix: Should show loading state for some home buttons when instances are loading
5967c9f6ce5295f9c2063d656ba11456388399e8 refactor: Remove v-flex & v-layout
c68060e27b1d60409a4caefdfb0fbe7025ba4f94 fix: Should pick the turn if it's available
61bd4e4a61526114eb0fa2bab9ba06802f8ddfb5 chore: fix italic build
a2dc7beaac0f79129c555f5e55822ac0d460ceb1 refactor: Add modloaders for mod detail page
a50d83729c2b49871d978f931a1986c732966330 fix: Fix the node-datachannel polyfill bug
95d226e8a5b4d62a517ef5c479443d2109580b33 refactor: Let user to select turn server
e2ba665eff2918ddaeaea49c8dab79a512e839eb fix: Webpage should respect telemetry config
42697bd7e12a64a602ea59d4793a03397965da4e chore: Fix some build issue
4b2df25c1d3a61b5af363968ffea67359557eff4 chore(release): version 0.44.10 (#668)
cafd00ab5465806fe262f2e81a1a849b2b81e3a9 fix: Peer group cannot connect in some corner case
cac29080029a8e394d3ff49d2d574ff2a0b5e3be fix: Wrong url parsing in peer sharing causing files download failed
b9b88b71f743706eaa5f5c9f227d1a242ccc8589 fix: Remove audio player on other page
309e3ca2842fce0c45dd7aab6a7eec3616dd02d9 refactor: Not show ip for server
a0057c5f90deec227d82e30cad0d690d6e7ec85b fix: Track the instance install progress in detail after failure
fb7d5783d8a651c330c0d03e415dc7d9e03cbed4 fix: fix pausing cause install process blocked issue
0509f84cd131566c76d3b0fb1f8c381f8531a540 refactor: Improve peer sharing game config user flow. Make sharing more clear.
b569018272fd1b41cd4d48ef79048cc057678631 refactor: Use wasm sqlite instead of native
5664445bcbee8f2f8eadc4d30a9ce88473172950 fix: Trigger refresh after mod installed to avoid mod status is not update
34fe6325bdb90eb5560ba496eb0369dc1626bd0f chore: Fix the wasm bundling
c74c23a1ec5bde819662100dcb276034dae3a6ff fix: Some large curseforge modpack cannot be installed
1f333b08908be6e1ab9170688a9cf2a219519d09 chore: Show detected view
7a6db15cb6a2af4f401792233a12ecb6ed3b4a52 fix: Fix potential crash causing by wrong access token
7fa1507b097af364bc0b79516cbab9de99343f91 chore(release): version 0.44.11 (#670)
6c9c4b2245dd4d5b7585bb082f50815efa77c015 fix: Handle the database is wrongly locked causing mods cannot show
d24fbf6a8157e8fd6bff4d6d304668e1ce6f794c fix: Tiny fixes for some files (#675)
a59b4672737780a9c599af8b4a748b945470aa86 refactor: Use unocss
204b1a915f17613b4ba57434b1a6ea6c4702c1cb fix: Should not return invalid string if decrypt failed
8d072ecf320b58ce4b5c26eb25c5431e7d1185c5 fix: Sometime the mods info is not up-to-date
e23c17f245a599f21f4ab3a640e5df22e43a31dd fix: Ensure one user is selected
852fc24ecb0bf32f9bee465b40f6553f765ded3a refactor: Use different session for different app
a14e61fe81ddc91d86655392ecfca2989e57d50d chore: Remove debug code
765ca3f6a107d8472650b0cca5b5d1772d39d9ee refactor: Move user agent to app
e647bbd9f260672ce129dda22b2436798f27a35a chore: Update dep
7b10f9364091d3a3e4c6e7ed9c3cf3a058e2bbcc chore: Fix some log issue
65b2d0bf63dadd3f715cdd46b9ac0163d89249d2 fix: The curseforge modpack with no mods sometime will always loading
5ddb4b9b1bb5cef47849a7001f5c31254a9e7cc0 fix: Neoforge modpack is not supported on curseforge
e257c7982d9adcfd8437b4a0fc674c9cc811e767 chore: disable pageview tracking
9f9beda5ac44c3e423065aa107b2480b41519b8e fix: The peer icon should correctly display
0942b56f61eb790c50cad1a166b47322cf3b7a35 chore(release): version 0.44.12 (#674)
e3c210abaffafdf9217fd4efc5747e383cb63833 fix: Small updates for resource pack (#680)
754dab9ec29b8c258b24ffc0cbdec78a136c85b9 fix: Forge installation failed and cannot be fixed
a76f776283ac5a84597269182e03629077b3208a refactor: Hide ip by default in multiplayer view
72265fbe47ba63f74915bd93512d001af91b945b chore(release): version 0.44.13 (#681)
b1c9bba33a9e25a637026f3c0d6e8f308717b3b9 docs: fix incorrect words (#669)
d2193bbf2747a0a280c7056e232505997ad2c468 refactor: Add more p2p turn region
0cbf35d38c0934abc0fb1a079e96d81d7bf1a611 fix: Bad default region causing next button in setup page is disabled
e8acf1a4678af5db7b834e1f0e498e33f49fab0d fix: Should not mark optional dep's dep as required
7e93685146a460b6de43563818aaf9feeb2ffe4a fix: Correctly recover the maximize window size #679
7503bba20e23e884bbcb69cbcc58306b4ba60b8f fix: Fix hardcoded values in `FeedbackCard` (#683)
ef4215c82eaf77248d94038ca303a2b3954c5e8d refactor: Try to avoid the case there is no java to download for current platform
3cc8b6690257f9593fb1cc990ce08b96c7cf9060 fix: Should not call window api after it's closed
11b1390e074792fa96ceeb17c85c18810aa4ba0f fix: Try to use java to auto update the launcher
8d995a94fa44eee40b12ed145960b61df09f3b12 refactor: Update ru.yaml (#688)
5849716f23d59878fc42b6f69e4ba4df9480f0bf fix: Mod revalidate does not work on early stage
8763a665f8f45b251dc36da13c52d93aba5c4bc1 fix: Make add instance dialog persist
4b5bbd6d5cb66161bd5ebeea29ab95f4e4807af3 fix: Use javaw instead of java to launch
5d0a0a49773d2d247a1a5e900e1717c39fa8205f chore: Disable afdian update
ff7da4f46b997ff54799b196358879eb7ddb37cc refactor: Make version loading more lightweight
3fd6e55a06a3eeb1ac5f7692da6b6784e24b64d3 fix: Enforce launcher platform to avoid some corner case
dd92f4743492a8f7d390793165eee84aef6093b5 fix: Use javaw for java updater
c703d3d39c920e824212cc29228c3f60f9b4f956 chore(release): version 0.44.14 (#687)
cc50e432c7a7b6685da7b72aa45835e5d03b0b79 fix: Some tooltip is empty due to \r\n
e250fd05927fa61a8bb1f996f2b97a82f345d47b fix: Should show local mod when user search it
6ec8d362e9871390d7c3b65579ce5c3a50830593 fix: Sometime the checkbox setting cannot be set
6d75718dba566ca0e927ce36750801134096a1fd fix: Should use v2 api to show news
50993dfa7dfbdf6eff4bf60f8f8274e628b34b8a fix: Global setting is not saved after app is restarted
6447153bac8cf15701f1be84acf51d9816f084fd fix: Disable performance counter collection
10a64051b9776d6348cbb67ea0181f20bfe19d96 chore(release): version 0.44.15 (#692)
411dc5dc560fb7e456e6db120f1403ef1300b4c9 chore: Use electron cache & update action version (#695)
d6d9b2f7d0fa39df5abf6336f0416afed5f721e6 fix: Sometime player avatar is not shown
a133e9e6b736a5cd46ae20625bda69c5ce016bd2 refactor: Make saves folder linkable
2f85994fd9282b6bb4f4ae21e6cd94e9796d1707 fix: Cannot import orphan modrinth profile
b5fab44777c410f18c8e92ef061060a68849088e fix: Quilt fabric version cannot be installed
239505ab6b76095da5a835b7274fe6ef235884ca chore(release): version 0.44.16 (#697)
201cba813737390426bdc4054ef6ae5540dca58c fix: Resource pack filter is not matched
c2f29fe88a0927273eda2a34c5fb778676fee7c0 refactor: Make resource and shader pack can switch to dense view
c3e83da0f1475c657a9fdc83d04422a85b322794 fix: Mod files are flashing due to the unnecessary refresh
b902e664f14b96661a0b84a415c916d419b16490 fix: Should show folder resource pack in list
d75121a02458be0b86e49f4e25e8bcbb67baec8d fix: Ensure modrinth pack files are not missing
3c429dcce5cab402b64faeba04c2d7176e086084 fix: Dialog cannot show after the page is switched
8bee2c4beb8bae68cbdd0d2ac44673d14eef5db7 fix: Linux app use electron update first to ensure the deb and rpm update
9b9fc2d0327782e575bfa7bb0232786281ebe7ee fix: Should increase the pack version after export
d2fe5cbc39fd5a34fe70ca2f99702f281b8d1852 refactor: Backup the folder resourcepack or shaderpack before force link folder
733ca3457dbd1eaa345bcb07d4911957fa2d8354 chore: fix a race of avatar loading
6661e09b8135068083b08836f2c9caceea8cdecb chore(release): version 0.44.17
dc89ad1f84cc8eafad3289ca4a553c80faecf015 refactor: Translation update (80% Russian) (#700)
ab79c1293c8b4dafe7564d3c87aa3c31b3577192 fix: Version title in update dialog should not be clickable
71b10a15f83fa6cf1e518984b3f573f31663e009 feat: Support launch server as subinstance
c5652985d15e6c056e29cc9b7edfb9fbbef2509a feat: Support mods dependencies check
14ab6dd5df55b9a49bde9d31945d3b03a92ad89e refactor: Handle lots of race conditions and use fetch instead of undici
6cf51a6c55579c3bb3a99a8fae28c29078e60991 chore: Add i18n
65668cdeec718a647ce8b54ac32969d314123dbb fix: Reset the modpack page number after categories changed
991264ce0e53749af4088bb7c68adf2687b3697c chore: Fix type and lint
f39ef984269b46f768af2840b7cbc0c6edbe7116 fix: Modrinth modpack protocol use sha512 for files, fix #709
f88cf1d2f2748e0dbf5d614b638beae7ddfe5176 fix: Wrong home header layout
07217a30c6fb17ca61f921fdd33e71868f936759 fix: Adjust the game launch window behavior. Fix #708 and #707
1f135ad27de9e994701713f6e33bbefd430bc637 refactor: Improve mods metadata refresh mechanism
0550232a97c20074942bbf08a7b77693c06f738b chore: fix some race condition
27c6804ddc9ccb6b46cd2bc7c429a04e0272fe0b fix: Fix #671
7111a982e99d63c30abe7fa0b33179b0fae83611 chore: fix regression
4a9c3cd188c0ffbce154ec719e65072878f52926 chore(release): version 0.45.0 (#706)
22a45950c04dc39a16db9906096b0049156808d0 fix: The launch button is missing on focus view
a606314e9b6824d5cb14b7d549f7d003e5379bb9 fix: The java issue should be clickable
8236ecbe7d19ef9ae6f6972b5c66ff0350164f18 chore(release): version 0.45.1
70380ab7a78e341d52356402ca2e6dbf658f606e fix: Optifine is not searchable on mods
9589c5735fa30b0c72d77eec519c64c7754ded74 fix: Update ru.yaml (#714)
2810b6ce637ec032a87091f956718723be4f9a0d refactor: clean up unused files
0bc039cb131cda334d0cb7cf533b6e68a9f2b860 fix: The installed modpack version does not matched
6e9b578ba0599487a9acdc087ec2164d086b7cee fix: Forge install failure causing looped install
efc6ec058b1926545cde7fa24f20e4ea86b8cd60 chore(release): version 0.45.2
91518b724488f643201298c1335e79fd2378a30a feat: Support search save and enable disable save between shared folder
8b3eef5df6cddc3b379056a34b8b472075b0b683 fix: Force user login with email using Microsoft account
da0097c3c1a7eb765b0f2a9756932860a9578525 fix: Mod search sometime not identify installed mods
e610df084aa503efd58de6a0682dd76834e106b9 fix: Fix the search panel position
1f52b4ffd9204d4c2b18fb723e36a25fff84c8f4 chore: fix style
489a243924c7f5abed1829af6e892ce957e3c8e8 refactor: Move icon to client and make icon smaller
b7ef02a6dcdfabfaaca42963b564010f31c87652 feat: Support folder on sidebar to group instances
5804219ba6a4e9b99d50cafd629deb1cdc72c842 chore: Fix build
2aeba9d1323cc020a06c6e0626cc728e0a6869bc feat: Support to show the archived status for curseforge/modrinth project
b18b90430b261cef7bd9894def37edad8d83c85a chore: Fix new instance not shown on sidebar
85f93b0a60d7b87cac016de18242c0b601865977 chore: Fix some saves update issue
6090ab20d6931ccc70f69532c12740d75e87a70d refactor: Improve the change icon experience.
c81bdd114f2b5afcf51c9a1cedd93f977107a8fe refactor: Improve the default group background color and save update interval
7b4b7439b282611a72db34074df52e83dca28193 feat: Support prepend command and optimize the auto memory allocation
6535955bc89ff5341a1957f1d725c2b51bb86551 fix: The preview launch command should not tirgger launch status
47660c5fdfc6b8e858728cb4993aa148ff91f089 refactor: Make the java download align with version download process
b85c2556b3c9d31f719fdac706d2402dda4fd522 chore: Adjust the java memor allocation
f8f70578f23118526be7889a6ecd2cad11daace0 fix: Avoid the failure caused by forge post processing downloading Minecraft mapping
20a0ef7dcafd86cd76d104ffe6237a5d4847212f fix: Adjust the store page scrolling behavior
d7c0bcfb8b70391f10183955b1da130c9346408d fix: IT language translation update (#720)
7b7bbc71182907c513032aec06cd44237082c10a chore: Adjust some ui behavior
46b031b3b38e8344c1cd621433478c94fe3f7dd9 fix: Resource lock is wrongly removed
91b6c7fbba73673a3a67ec1778c270601d07f4d9 feat: Support drop to import multimc modpack
0188e8706a1ec590403d04ac22191a88176ada43 fix: Try to mitigate the mods are not removed during mod upgrade
264198e0d08c23a79fac9dd88122ae972da55d7c fix: Some incompatible mods are mixed in dependencies
5fd35bb66a09a85bc67ce2cc427a135a0cdc8e50 fix: The server online mode key is wrong
a11efd83284f19a6bef20154467a61fe391e20d4 fix: Should expose server port after launch
4eb82c25b8d0e1a72400586dcbb596511370f0ee chore: Fix the java issue
fb60fd2c9a27d5f7a19962efe1e801a6f1a2f7fe chore: Fix build
20a174205ff5dfc82451f9a96feec169d4a9cba7 feat: Support expose port manually
4ac57275077fcf0aa6d939794502a2b57d5dd52d chore: Clean some code style and update deps
56a32f6da7d82e90c28fc3f6e655ee683b57721c refactor: Use bat to upgrade windows
1070a9debb7d1b54a270776ccca43414bdbf934d fix: Instance cannot be cloned
024f9f187b6c173d99b3492b340ea2fd73d51cc2 refactor: Adjust some data structure to make migrate easier
051a4949cf1137759e0120dfdf5d1221ca4b2fae refactor: Optimize mods/saves state update perf
46dfdcfb0072fad1d4eb36727bea0dae03bdcceb chore: fix compile
bc8a2b55756020d8a194efb0d388119e875056a6 chore: Disable heartbeat telemetry
a8e941bf8af5385a8963f4a7610468f99f27aadb fix: Ensure user session before launch
068eefa37b6af181e9cb689329be80cbf6268957 fix: Import modpack should correctly create folder and progress
7e7c12fef8742e039ba42ec66a47cad9a7f56fdb fix: Correctly handle curseforge files install location
d5cd0532f105725678db0bf5581b52747539cf91 fix: Sometime shaderpack does not update
4c74ecc3308eda4eca0960d9ea3a1b76c8c7ea93 fix: Should identify the server created save
8e1347e12afb1820118606c358d1cd9c77be4e77 fix: Avoid duplicated java exeuctable file
ab7613d96974d474cd9ba046f50d8898c21790cd fix: Should append the mrpack at export default path
a76ac6972c9afe45e1a18c63997a011be68e0895 chore: Fix build
337510012dd8b9b4b95f0711917903f925b02167 chore(release): version 0.46.0
cd46410555756f8ad9ccce70ff9d936d5ac8a8b1 fix: Offline cannot login
26cdc217804b32773995506890498cc884f20823 fix: The instance install dialog does not closed
5d00cd0cee89dcf94953d52c7e12e9100de63402 chore(release): version 0.46.1
07100c48b9b4b7237328db1efa068abaeb71c95b fix: Should pause video and audio when game launched
67eae0c44dab798ffcbd6babbb340938c88e1b82 fix: Setting background type first time does not work
f828e8d68b9a672a0021405577cdaabe17b2e3a1 refactor: Log the validate user process
8e807a15636e7f71a50204906312956fc997442e fix: Update english translation (#765)
0cb4e12b650f349a3c931afce98486f92dc6355a fix: modpack marketplace search bar color
0871e4f4e8988c168485e134dc0de44ed1df237a feat: Translated to Japanese (#773)
8899bb3a73f3c4cf5b9f592137059b55bb0b6808 fix: Support Signpath code sign (#701)
2e1683e71eff039d1a95067e5aadde3a15adddab docs: REAMDE & CONTRIBUTING update (#775)
05e184c9a956102678e55964d1ebae0cb9a66dd0 refactor: Refactor the resource management and market management
cf44a0533ff9b9a16c7f05566393d2841926799a refactor: New UI design for drop layout
fdc79f4e4aa3975ae959499dcf28f72dedfac397 chore: fix compile
cea640f895783e067672c51ca992bf6bb4475f1f refactor: Adjust the incompatible java hint
3b481196c3e6de33cb28624938d9fea360055b10 feat: Support cancel user fresh and authlib download
cf372c854da16d3e41914f2f2cfc75c6aa8e52db fix: Refresh user init with validate options
57d6e507e65dffa53413c0c92464d77f71904b3b feat: Support to link servers.dat and options.txt
88c7f2af897dc553549fb62db38fcd76a784b548 docs: Add readme
fd341fd4f36e9b789e47b0b4d60f871b4767bfe9 fix: Should memorize the mod sort order
3438ce0d9fdab7f09aeacd14e38db08d2540d7a5 fix: Invalid java if the java file does not existed
7fc48cef3d0469883db428aadf1078a0365c7329 fix: Try to ask microhone access if client need microphone
626058eefd4ff23762ee3d17897e6e2426ffadf3 feat: Rework on the instance import and support instance from curseforge
9003ab3ee3190ff0ed97038f07c8433bf3fc3459 fix: Fix forge file incomplete causing split failed during post processing
c40cac9f77ab790a44510048b3d7513a10f7d090 fix: Should show server launch argument for server previewing
4fe05a3816f509343ff13c2b372f464e1ebd3e94 fix: Should not assign memory for server launch
017b1434b698a8663f46b2ddca7cdf070a19e89a docs: Update README.md (#783)
50daa1ac337606361187752d27b02d0e7a5ad438 docs: A new translation for the readers ! (#784)
0fee227981bea5ced8d240f154e6d9d50200bde9 feat: Support directly enter by project id for mods
964e3d25a28d8f74911eba8536dc8d6ff9d8dcd0 feat: Support display localized mod title
edd28ceae8decd49479316f725fe46d5ab5e0e86 fix: Adjust the modpack create button
863de6dd8cb5f74ae2c0870a4542e573e5312ab9 fix: Launch button should be not clickable when loading
ddc2474e5d2bdfc192418a1cb35821f21d5de6bd refactor: Rework on market install API
1ba9d0a4b60174097fc937c94edebe5cde311d4f fix: Resourcepack/shaderpacks are not linked after launch
1cfb741597e33ab0f383dc1e4519d5e8d2a5d34f fix: New instance memory setting should follow global setting
e8ab847daed766712194c232bb6991992b9dd809 chore: Adjust some error handling
d2425bcfdd0332de78df762a6a8b08d33ab55fff fix: Correctly resolve the mod dependencies
b404460d118ee3c3d1e5509bf0266e71125594a9 fix: Correctly display modrinth/curseforge icon
0289c944e749517533590a626c24c7523f22ae36 fix: Should skip forge download mapping task to speed up install process
40aad79152d1cb16ec72eec7e9392d8554a60497 fix: Use modrinth as default source
f2d268ab0262b926674530d746a03cd3ba84488f chore: Adjust style
6aefbaa11e1ae80b7a1d358c4f30c7eeebe7e643 fix: Should be able to download optifine if BMCL API is not working
23f95fde5eb7c281f29f3f9f75241077ed8fbc96 chore(release): version 0.47.0 (#766)
a49e7d83614f7eb9664834e974251e416ae9fd66 chore: Enable the winget
6c9c0eb9103be17bade0438184ff7a74bea91335 chore: Adjust the appx download link
9c9123937cba229e6df9271eabfdefc3d325e000 fix: appinstaller url is wrong
60acc564df63ef16648da7121a0ffd0b12bcedc4 fix: Cannot access curseforge api
c871ee211d336574f09c01570c95bdc21cd21609 fix: Should ensure java before forge install
d4330b8f64f88f5c519ede07db326128c6abd888 chore(release): version 0.47.1 (#790)
fb75b9388217763a269139f7586bc55d456924f4 refactor: Avoid async in peer connection to prevent potential race condition
6a94b5cf4eae694851f0fcd4169d7cd8a3f7c188 refactor: Use hash as asset index name to prevent asset download dead lock
23fac4295de4f9605f3fcf66c8b82747d6aaa4e0 fix: Should not check folder if the folder is not existed
ed205ecb8e0eeaa4783e239c1f1df2279e0c28c4 fix: Ensure the javaw existed to use javaw
0d2fc01fde40cce5dcf7bc5ab22f86d8fa216a2a fix: The https post not working due to the duplex is missing
ef3dff1e99a1ce6eb977cac1821cad9f9e9c3e54 chore(release): version 0.47.2 (#794)
e972c3c7261b6a834934b820df2957d7a08bce62 fix: Correctly retry after websocket error
d3c6e88349d5b3be5cdd21ba26c708223d58b839 fix: Should not keep sending descriptor if the peer is not responding for 5 mins
4de955d5a14512089988d4bda916ab7da4d83b48 fix: Wrong install asset path
56511a3e1c4642dcb220a3bbc8f2f3b4b3d6edaa chore: Adjust the format
75ab3a3c2f7facea1800e7a7073fb26ea6021041 docs: Add deno deploy
6bf4d119b5ab3be32cec2dd2a5800d86ad9d9bd9 chore(release): version 0.47.3 (#795)
2aa2d0b86deb44d4858eb42c99eac48a960aa582 refactor: Strict the peer reconnect policy
97f691771b8266fe9181debbe2c379823e95f0ac fix: Mitigate assets index missing issue
bd3cb3a90f9c6506c018c87904cec507d3c3ac59 fix: Should use latest minecraft by default to create instance
105ff7132643b916903cd1178747c544500ce986 chore(release): version 0.47.4
b4b60a24cff2090d481850ae7431ba160bad3d3f fix: Some installed mods cannot be installed
2fb234162991fc06004380eb62021692b34911bf chore: fix build
4f790d2284ede2fe56fd2897c29bfbee9e4427e2 fix: Adjust the audio player play/pause behavior
45ffba3a4572a3533711e83f9e50649e114341d1 refactor: Improve perf by virtualized file list for instance files dialog (#798)
381b735f11b2596b0c5d8e8443990cb381bc6630 docs: CODE_OF_CONDUCT (#786)
67272d3781da2590f174255680bd9a071860702e fix: Neoforge version order is reveresed
e787592dd9bcf9d0871215dd80fae571bbd31f07 fix: Audio state does not refresh after launched
d94734990fc835cda8e73ea0d4b43767aeb94418 fix: Add instance image icon failed
2b60e9ffb7141ef4f90b33b67bb3124a7998f6c6 refactor: Disable shaderpack error shown on card
f01c6ec4405a3ed3d9ae735d48bcb93e8ce0caaa chore(release): version 0.47.5 (#799)
653bd2fd1d31394e80b61c1cdc061425325e3f74 fix: Export dialog checkbox cannot be clicked
60b18bfae2fde21e55a7dcc57f5d8f338672e76a refactor: Add wizard to guide user install shader/mod
4a9db84f7b931c9f2e76fcfe75bbcdd7c24e912f refactor: Add preview for modpack store
5d75715736bcb4568c8658408d51fc02b4860a8c fix: Copy to clipboard does not work
a0c51af313dc906f9aa5e4628af4731b67a02622 fix: Support display shader pack from curseforge
e86ea7cb490b44528b825151d99d8b2cc2fd564b refactor: Use 0x CDN for upgrade and db
2dda84c3ad920a698ab5ce813a53ee97bb61040c refactor: Directly display duplicated mods as error
52597af06b8c425893e7fff7c937cd0893a1b18e refactor: Display mod dependencies mismatch with warning
1efc3f02325d3084c947a6bd95abd0540f077bce fix: Sometime modpack does not install files
31a6ed5a525037cb6344f31e0b43cb75c2e1cf8a fix: Mods from modpack does not parsed
b73bdecb3aff685da089bbb21a011e607bd23d94 fix: The neoforge mod cannot be parsed
0fff85a8cdf61bb4e784fb6d514fab04443170e7 fix: Update it-IT.yaml (#806)
43155dfb5e40a87f87d592581b3a41eede303f30 chore: Fix build
ab9a21a13870bbf624d3b227e6749fca6d651443 fix: Cannot launch neoforge server
fb5c9539bb9df9604d0e350c6cd5d8a06ae74c4a fix: Task progress color is wrong on light theme
2975a75f14c0a9f3d2d5f3d7e4fb74896d5d9760 fix: Should also detect zulu jvm path
cb34f74c0e1702f8ffe0401f13839a40e04b2963 fix: Neoforge version is not sorted correctly
da7fd9d436165d25d231d4976f19680a6fcbefa7 chore(release): version 0.47.6 (#808)
b189e8638c9c7bcb025b6a82f4475b7706cbf559 fix: The mod duplicated dialog scrollbar not shown
a4cf155b28b0fa278f15c0ae5cc4a0f78ad74b8c fix: Installed modpack is not linked
cfe6d555ebcd0413d026ee44206c4ddb1393f2a5 fix: Make mod compatible info not warning
b51e40ce0fe5a9451a086caabfb6f3854335a5c6 fix: Some glitch on mod install
487c843afecf7e89b4e65453c8c8ca68bef201fa refactor: Not all instance setting require manual save
ec414cd40d76e2329f8cb80e6056de13732300e5 fix: Resource pack with comma should be parsed
12d80f811414a7501696209af21614f102d44f80 fix: Handle some instance delete glitch
9c389b11e8d729cf8520ae261ad097bbb4f8c9d4 fix: Downloaded mod are identified wrongly
733389e5e11c2503b8984131c45d5343f9059969 chore(release): version 0.47.7
3842e727768317a11306f2e955f47fdd43c14b2d fix: Try to mitigate vue crash causing app freeze
3b5462a37217e2126cec13c85cdf3e9a18f493c9 refactor: Adjust mod duplication ui style
4d853e9f17f2b96e97e67b8b12bd33c6166f6549 fix: Fix some mod install glitch
6260afe129b5951674eee57a8bf83f3230d8d63e refactor: Adjust some telemetry and project mapping config
ef4e3e417155be777bd3f7c2ac1415d7cb3d4f8b chore(release): version 0.47.8
2eff0ef054a36f75d7ac3431c6367a1f7c805b29 fix: Avoid race for checking locale db
f80181117633fd0d56e23480d259136b1b56a80c fix: Should parse the version json with no path in downloads
0a7fde55126e9c3ab59850a5c65e199beaa5c191 fix: The engine ready hook not 100% trigger
26397a29a479ce94e481ec7e687aefe6fb1fa9f3 fix: Reduce mod dialog to mod page to avoid potential key conflict issue
822924b3493b1c84874b9569dab3eaa8b002d15c fix: Fix some ui glitch
aac55b31e1dbf3e51f2615b12a7252ae63617d46 fix: Updating instance mods can create duplicated mods
3bda3b425dcb710c788c0c1b18aa1ec462bc89ee fix: Should not render invalid link in thirdparty markdown
b61c2538793e923e089b749a4b0f038f12cc5be0 chore(release): version 0.47.9
a10600bc1d704319fb54f085d210db28c674b76b fix: The instance update cannot load in some case
641a1c9342a5249f8881fade0e447c26164ba58f chore(release): version 0.47.10
0a169609f77fd6044e197f0687937bcf9960b9f6 refactor: Allow modpack instance to repair current instance
26d815ace0fca6db525c090d52a5b92f8cfa4c2f fix: Correctly show file name in file tree
e6d521e80f7f20862d09fe9f1a6dc7f6abde11c8 refactor: Remove semaphore in client to reduce memory usage
37dfc62df550d62b32a3e2794c5d70f7ea4607e2 fix: Use high-res image for Modrinth
710c7f3d974e1a0b7f08dce31d7cdcd5fa697b6e refactor: Lazy load the locale file to reduce memory usage
63b828ed061839874ae6849c4ba87795de30b39b refactor: Enable the modrinth/curseforge i18n for mods content
8acbcab2b62478b812f7e56c110cf8fdd6fd81ee fix: Should allow user to disable community translated content
bd5bb57f8242677722d05ee10402b8f8a02b0809 docs: Update README.md (#824)
b8a1b02282c7eefefd6cce55913c1018bb11a38f docs: added Kazakhstan language (#823)
44aca86cc058af5c94350d77ef2f3b69b2cd8a51 fix: Should not login failed due to user does not set skin
592611623755e2ee0b0a09bf0bd5593f8f6f1fb6 fix: Fix some type & fs errors
c1c690441d18df148b016f9259cfd470f1478470 refactor: Allow user to select policy to upgrade mods
dcc83c205324fe5634021a828a012fec5fed5647 chore: ArchLinux (pacman) support (#836)
404220da7fb85e1c66e1642509a4c496c5ebf4f5 refactor: Use github release first for non-cn user
a6c853a880b1eafb0b0ce8f3310e10f1a3d99a75 refactor: Adjust some error handling/reporting
6830a6833dc0c3631772fab356d91d33699488d1 chore(release): version 0.47.11 (#827)
c5b7217bafbff116ec4544ee3571246f6ff1e320 patch: new language Kazakhstan (#834)
506a0e2e30dcbb32d0c995215eabd067d6f7d4ad fix: The instance name cannot start and end with space
65adf0d596d59fdf5546d34c0dea0016597c3acb fix: Fix the wrong window position or size due to the window pos is not inside the screen
86c5cc5986025b293ff4c78556299d02792bae6e chore: fix build
ae691742fcebab9478e637c1c009ad824619cf62 fix: Cannot install neoforge for some 1.20.1 version
b98efb99b940b55e34f8086c506472f30e59ede1 fix: Wrong instance name start/end with space
f0ed969be2020d9e0fb139667e5fce19f1bacac2 fix: Java memory is not edited if the global setting is manual
3b90d1f177f265b20af010cd8ba1af80250ddbdc refactor: Allow to change icon on the context menu
1fa406bb6491005e7baec14fa648d54744fabc35 chore(release): version 0.47.12
950914044b3e4a8a78038ba36557c412475d6c12 fix: Project mapping db is not disposed after app closed
a70b6074927918689065922ac347bfd277e610b9 chore: Make build-arch as the release dependencies
801053d94adadce5ceaa7e5e82d0c1a815ef02d7 refactor: Handle app exit service disposition more precisely
0ade14f30aed742bdde4a670f25da3a80f6cba28 chore: Only release dmg for mac
9ea0b70e49b3619be657ea1c7b3ebbd4d272fe4f refactor: Improve perf by marking more immutable object raw
626d304b67586f9fda72e91841b3d56469ebb366 refactor: Make instance setting ui more simple
936c6fc16e6671727216c2d451b8fe3406f0b1d3 fix: Tasks are not clear immediately after clear clicked
204221c539bad7d0853d178b0b5bfd2924c3becb fix: Avoid the null table rows inserted into resource db
07dbc9ea680bec70a1c8609a491098bb018d8e5c fix: Fix some ui glitch
9d5ad544d921ebc508e364a1c93e7627d6f68eff refactor: Make more tooltip to use shared tooltip to reduce memory usage
b962cc2f07d3912171a39051ec9f0d4c004d4a4d refactor: Reduce memroy footprint by using virtual list for modpack upstream display
a9773b67b5779466564e97545c7949e2c03c5255 fix: i18n for curseforge is not triggered
503eaba5f166f1e94d173472bd26e6e527fa70ce chore: Fix build for dmg
82b7b1c4c81c4801733a63dfd1b04ec0e62d78c1 chore(release): version 0.47.13
4ae4a88869bc957993cc5d19b4d86377119ee2a1 fix: Try to dispose worker thread to mitigate electron cannot exit issue
742ce04aade02ba5d3ce3c43585ab2370f1bce05 fix: Fix some optifine and forge installation corner cases
a8db28993a52a8c56f9b1224c89610588d1698ae fix: Fix various corner failures
30566400fde2690246e90f3fda1143f7a2cc5207 chore: Fix build
ee83c8b9fd5bff5a7ca06b34f7c8d6f971cd179b refactor: Align usage of cdn and ship the elevate.exe with code
5887618dd418fe65883084643b45ab3e111d39c6 refactor: Only use cdn when in gfw
3491c05c12de55631fea6a3e4310a208626eaff1 fix: fix #850, optifine mod is not detected as shader mod
ba8758b44f1a841bea47cb9f086490fb7eea27da chore: Adjust cdn url
984f343ed64aa5df85a03877674a76289c714af8 fix: New forge 1.21.1 version cannot be installed due to forge's wrong sha1
c05db3cf8fe5e9ad6760f313304824b8f1ff5c9f chore(release): version 0.47.14
78acdf9cdbf847da8bb89504150cb06bcfe07474 refactor: Adjust more corner error handling
94cc3c8f86602aebf92ea93298ae04f95137cc7b refactor: Allow theme to adjust the font size
db32ad6dce2295656a9a6c72dfda3c90169ce79d chore: Adjust build
7c3206ea0b9e5b6c1b0aaf090cc3bdacd9d7e735 fix: Translation Update for Portuguese (Brazil) (#852)
9b9c7f96d807aafdecaf5140006f3a727e4cb0c2 fix: Force exit launcher after quit called after 10s
2ec212ba7fd6a8227dfc8c6986f244e8c7972372 refactor: Stop telemetry collection after app quit
6262c7322744c41c0419996ac31badd1ecc35f8a refactor: Track cdn download for budget
812d0c148f9ee7173a8a280106f4651e85c7cfcf fix: Handle more fs errors
d6265ad239c1847ac55f4e2e5cceefb29ce43a32 chore: Fix build
5ba89d2a14604ec11a7098ad561179be4cbbb414 chore(release): version 0.47.15 (#853)
9c68c33a120ed2ceccafa1aaa836ab5d66aaa1dd fix: Handle more errors to make it robust
4915ff4606fd49a91c7826c2c1eaf1c247b0d39e refactor: Support for sdkman for Linux (#856)
17f057eb3106e5a61b329bdd26b885cf58cef4b8 refactor: Discard old appInsight client
27caa7ce594ae187468f70528991b8643bfebf2b fix: Fix potential fs failure during hash
139f2ade88eec3629c0f3ec5f8ff66436e1b4c76 fix: Support .email suffix; fix #861
51bcc6f588979fe57b00399cbd824946c90b2bac chore: upgade undici
d2007bbc31dd8341122af6bd53f85accc1d59021 feat: Support multiple prepend command; fix #857
64dbb7910c96f9e67c5bb3b7c0a0f43ad01c168f fix: locale doesn't match the i18n message
011763cac355313d7555e5ec564af547d0c53de8 chore: Add homebrew cask update to automation
40dbe67a63b53c46245272449809d85b6c928c88 fix: Wrongly install forge/neoforge client/server and some error telemetry
4849c467a2af8c2059818108983380f0134e88f6 chore: fix build
1604f8e71b94374f3e61bf41fd4e1b6730873eb0 chore(release): version 0.48.0 (#854)
a0a258548902f734f9d26b4ccbb4042df85fd0d1 chore: fix brew update format
b8f754f43fcfa769588b84a7cc348c0f4e017db5 fix: Downloading does not follow redirect
1277dfb82305b2e694343abe5af2bcd9736ee4d8 chore(release): version 0.48.1
9f5c7e332389bce0ba3f7f6aa32625f6e728f3ba docs: add homebrew (#864)
95bf9cf2fdad0d4f914a54764d1077dd4b7a4e63 refactor: Support to set envirionment variables
29e43ef46aea46b018fc8bb6e0fa44ba19f99e8c refactor: Memorize user bypass java setting
7c2c997376419db7b7a0668ff28235ac88171e78 fix: Ensure version jar is installed for modloader install
39e40affc1c3585bd0e9a2a3da3ed1fe7f085b5a fix: Ensure the searched items won't present in non search cases
683582924281a1f754c21b5b3cd537bca5ff725c refactor: Handle more erros
4e450ee191734773c33988a81551c6a1be340401 refactor: Allow to only filter installed mods
b1ed92b9e42b173d2d8f45a2ebd2a52cbf5ff5f7 fix: Fix glitchs
af380b0ebe327e11484c38329e8df0a86f150aa0 chore: fix build
7b4f93eb61632d9b115450b04592cd7605e33ef7 chore(release): version 0.48.2
59e66fc6f105524cc32dde150d59faef2da482fc fix: Apply the proxy to session
f8626cfb9e554af081db8e561a68acdadd46fe8e refactor: Properly handle the resource parse errro
24e9af7fe038da651cb41abc7d9f59886bc2fb5e refactor: Use chokidar to replace node-watch
39f0f7945bf20c2d616bb73fcce2d90aeb0fd4d7 reafactor: Use fabric original semver parse the mod versions report
d4bd09ac9957375a2efa6601a2fb5547c4662850 fix: The child process should extends parent envvar
9eb8f8ce1b3a48c07a3c53ca9cb3eba7f8b6ec9e refactor: Handle more errors
472282050b449b774906f9d06582c4340164baa9 fix: Fix some glitch on resource pack & save detection
015f1a6890e890f6a98f8f22fce1c377e5d8e5fe chore(release): version 0.48.3
c6c1d25f763c7f7c967785905ecadf60d08a4fe4 fix: Wrongly reset lang after restart
dc2cc06343d6ceddb56a50646dcc9c8b164ec350 fix: Ensure the db table schema by adding fallback recreate table migration
df3a22855d384d96c4fa530b33ebfb9efd41758b fix: Some error cannot display in task view
b7a4b0c9a4a1f212df9979e1190e56863a8cd60c refactor: limit the curseforge connection count
dc3be8ff4307210be8e5a260cf5630b49a924c10 chore(release): version 0.48.4
78d31084170ee04e5c33df511a69414f171fe13a docs: Complete overhaul of used language.
e2ed1e44f2f1be43b6335958827b3ee54feca465 docs: Better wording (#880)
1c2607012c9182b5a887f4f3ff6d4a93b8ca3264 patch: Some translations and LOLCAT ! (#881)
296382dda224ff2661a9fda8c3eb75acc6e7b0bd refactor: Remove eslint and use oxlint
67fd9c304ab3fb82ec811bb3cba9233a38f54800 refactor: Handle more errors
28eb64e7ace656fe8b515742f23ee332c136eb2e refactor: Use trace to log the resource metadata
8239e94e6e6e472f6b316c7b83935f0ddcc3865a fix: Ensure the neoforge db format
ea9f797a083b12d81593c34796de0e9afd183913 refactor: Move fabric semver to a single package
be714552769adda4a4007477d385fd658b89b73d refactor: Use async-mutext to lock
f4ddce0743f01f952be4ae48e2720468228c38b7 fix: Forge cannot install with wrong java version
07391813cdce2705e9e84403975fddef7cfc619f refactor: Handle more errors
a420d9410128041b96cd083d01d3039ac632cd7f chore(release): version 0.48.5
509bdc482164e6874a258d9ef1c5c7991e3799a5 chore(deps-dev): bump vite from 3.2.10 to 3.2.11
c56e81ce25b92af85b56cabe47742bae44376719 refactor: Enhance download retry and handle more errors
44d0e6d4b75bf0dfd1ed72c180b342a07c6c732d refactor: Add dialog to skip unmactched checksum error for modpack install
51a6a1e422e980dbe841f906495ab8397c32a93d refactor: Refine the instance update algorithm
5ae66c42faa13027e40bb179b66189d19d621627 refactor: Make resourcepack/shaderpack not linked by default
f87e8b337ba28cc6057ca8308e14ff8bec276b74 refactor: Allow users filter the files in instance update and export
1a31a9ce7cf3a676ecde89d4ffa3240bf89b997e refactor: Allow user filter the new modified file in mod duplicated dialog
8347ae80c74e67e7c16b3d9ddfa69b69e2de7fc1 chore: Update deps
1f908ee6b800d8f8a49993126b2785900a0e5d12 refactor: Update appinsightkey
422ab7b24add600f1cf476abb055d7f09a02949f chore: Ignore errors
1ea660f0bfe0ef5f388d58425ee769b08e739acc fix: Ely.by service download
50dc604eb014b5a0183adb5d3f5a93a8bc2e2063 refactor: Support OCID login for little skin
2ac22ab84fae82f73fb5f1b8495b4766d0adc051 refactor: Add flights for client id
800ec0f05aa18f8c980f05d1163f4bab35fabc71 fix: Should ensure java install if the version does not existed
b8eea40d3d1eee1e98ae4c56e9bcbe1fd63e0209 fix: Resource pack cannot be drag/drop to sort
abbb884d02bb10d20f2928d49145befdb8213025 fix: Optimize the export dialog files display/selection
7d77b60d258336cb06e20383d23c362b19bbe000 refactor: Make window minHeight shorter
f60664cc2a306297bad641a4d95e70fb83f4f2de fix: Rewrite the native replace logic
52be00210dfedd415e44f4e86dfdc3fbf9f47c6e fix: Update it-IT
7ca6d290907cf0e9d42b12c73518f1284ee2e03e chore: fix build
24a0ddea8e5cc529ba6422ed241a5afbc4d62742 chore(release): version 0.48.6
3c98d0be6e9e28f52e84ed04df8bb82fd0cc5074 fix: Fix the files not updated issue during modpack update
4d5c5814c3187ab992a09b9d07e764c0b9be6ad6 chore(release): version 0.48.7
4d4ac89e9ced6d86f700caca63c4464fceb8e57f fix: Enhance file diff algorithm
7a05db22079c4df9cc79354dea1be6318dc4d470 fix: Fix the race condition in user service load
c3cc7b1234603bdfad8353cbb2a16ca73589f83e chore(release): version 0.48.8
e1d77d328762df8c4f81ca364ff4e6612a14edb4 fix: Resource pack cannot be shown
099a38baee6ef9dffe86e77289fcbbfe6d684796 refactor: Support grouping on mods
f5f030068ec936afbd4f034ab33fdcf045538d8c fix: Fix glitch/misbehavior on backup
f8a1b95beb71d04e703dd588cc46f1fdab75b6aa fix: Some glitch during setup and update
3b5115d7e7656ce6548e5c167abbba6e534627a8 chore(release): version 0.48.9 (#902)
824175bf13e68b73abca5a511a05431d8d063820 fix: Should follow logs
818105f3ad24b78bffcb59d5fe4fa56d40ddb0b6 fix: The optifine cannot show on 1.x.0 mc version
d33117e33092e84544bba00ec325c67db5250b95 fix: Cannot manually import modpack
4a28e0a57499f52f43c36b4d9d6e3f5d54fd61fd chore: Optimize ci build script
e41c3f0c06ae2ee072e9093843634a8316039251 chore(release): version 0.48.10 (#904)
d755714f9809a2ebc8f15c059afa877980a65662 fix: fix 906. The authlib config should not reset if it use global value
de8976e199234f650b2f627544d398eaa371ac67 chore(release): version 0.48.11
86abb743b7b2978f70419e4aced81175eab7d61f feat: Support localized search for mods
db9bceffb3385b6f650027e50db9e5db4ee7beef feat: Support export server to folder or remote folder
68ccea06eb9becfa9ecf8d7c64047ca0a13f99eb fix: The tooltip sometime is not up-to-date
dfb17c50cdf6517c011d562069e567000e5b0737 fix: Sometime user token is not loaded correctly
080bc7c1090e217c596fe082d322b4c28c256be5 fix: Fix some error/glitch and add more log
f3071988155d7dd11e37222149c98b147b2c3a78 fix: Enhance client/server side detection for mods
b30052b7342ac11aa2220cf6087ef5faa6b9b3d8 fix: Should not emit neoforge metadata if it's not a neoforge mod
31f606e1c1b55e53fb9b1d6a4276bebeb4120319 fix: Update elyby authlib url
b65fae805b5412ed0dcbb8e50f1eb245bfc04cab fix: Feedback dialog should be able to scroll
bc1241fa0a15c1496fdb6f8da753da065311272d fix: Adjust some mod ui behavior and fix some glitch
93cf8eb98d37ed6bdd7413a5d12061772ec767c7 refactor: Use chokidar for mods folder
157d2766954a8c57e9590554bc9d46a27e77c7d8 fix: Should use shell mode if prepend argument length > 0
0cccac73260be2e0ba3627dbef522790a0a978e6 fix: Migration might failed if the process is crossing disk
ab667e71157ef7e1c0068b1e6cb26d7b60ddfcdf fix: Prepend command order is reversed
9b310e168a675eb02364517880ff8457c585c8ee fix: Preview launch log should not trigger status
31e6f594cf82477606cfa4debf02e7819755f8ee refactor: Allow user to navigate to mod page in mod dup dialog
9fdd95620c7bc552206c2ac07e2d4b39e9c9254f refactor: Adjust initial look of the home page
21ac782c976d44f3fa31c39115f23fd9b4de4ff9 fix: Handle error during launching server
66d2293b06441f66c53582cbd57a49f7ccd59908 fix: Adjust server mods sorting
a829536cca9e6fd1b677bb00e6b0482f0f45fe41 fix: Bring back the install files selection
4279a96d5591ed1124434daaab4d500aa2798393 chore: fix build
b55bbe4b9d7d865f1c78014a5db78acd5a57deb2 chore: Sync telemetry key
bdf1f8e38e7585c3d6f1db7676f8ea849ca5e1a6 chore(release): version 0.49.0 (#908)
86e7d8d7ff66c5e6ba8e89027a55ce2dd96bba6b fix: Upload ssh mkdir should handle empty space in file path
4c664abb4d2bd8c1378195871605c31ac9fc7bbf fix: SSH upload batch mkdir to avoid too many ssh session
4108e9bc024885c0fd5a9b9f8f68519c6a9037a5 fix: Fix some glitch in install instance dialog and improve perf
0192ff58c7df34aa63664130d307d2a4b55092d8 fix: Ensure the server export correctness
f4801adc9780f8ca21d67a69eb6c6dddeec626ab chore(release): version 0.49.1 (#914)
bbc4263d778ee4ae023b43f60eac3408f0682975 fix: Respect the yosby/yosbr to generate options.txt
06bc9e2f51098eaa41e9926d4330cc5b3023f13e refactor: Allow the show app button on all platform
babb8ea630d78e10bff43dc2ac0aab65afe18d0c fix: Hint user about the disk is full error
3ef54e81f0f12bfd31a55e3d783188fa26166459 fix: Add alt method to detect driver on win32
156be2dcfd47ef43df2a608baf2726521b5cb3b8 fix: Handle resolve wrong version issue & add error log to track
4957392ff4178654513b16539a24ae9195f8fcf7 fix: Load en projectmapping database for empty locale
aff32b14aea03e43a85d763da246c2418519b4d6 fix: Identify the post process failed validation error
de01a6bf36a262a958edc4136bf65114403964e6 fix: Can't change RAM settings #924
3ea104efe396fc3b5c55ebf24f910334e6d2adec fix: Modrinth dependencies detection should follow the selected version's modloader
870faced81b5fec2a520380ad7bae1873db64d8d fix: Fix some export server glitch
2e19a49e66475ca029369cb4a31e60f40b4a942e fix: Fix some error handling for install instances
6b5c81f5dd583c6a8deb7cf5e89e5652d2acffae chore(release): version 0.49.2 (#916)
9a64ae3bc3fbb8f02ef2942eab9fbbb65b46368c fix: Shaderpack files updates are not identified
c2a697be53211c92d8a3b52f214621f6b20a7602 fix: Some mods page switching will crash the page
a2e740f369fc87009f61fbc2476284711543b3e3 fix: Handle more errors
6f5a99f99c193fdc0a4060aa04f9bed3003435cc chore: Pass the build
c6995d63c5556198e4f2169134ed07e7a2285259 refactor: Allow peer user to see the ping of the negotiate server
ddb5b8bbf06b4fa9ffe6d755b9a6a6319b68e549 refactor: Add ping detection for iceservers
1e7321aa8f2c3e7db0807ceea1518839f494e848 refactor: adjust the shader/resourcepack file event handling
4150aed268830fb77e51893e9bbd02bcdc406700 chore: Fix dev:main
d86d2202ffa290a0d783e1c18af96eef0f5f5c4b refactor: Unified instance resource installation
392f89c89a085a26db8a03df3d74b6958a92228b refactor: Aggresively improve the download perf
2b66049998fcc16b99bf50e529696d3fc987726f fix: Fix potential crash
19cdcef0ce5f796a5cb24ec133eb257c9fe51044 chore: Pass build
923d431cb5d0e240a41616ad8f1df7b623bb1e91 refactor: Make instance install status detect more stable and fix some glitch
22b6198f568b299edca7edb20a85002877ed040c chore(release): version 0.49.3 (#926)
57085cb51def2f3e91712e9a19b058991fcf2603 fix: Handle more errors
37a2ec604f2fe0c4d71d8894a7fe17e9729b4607 feat: Support clean the unused libraries mods
1e24c748f3c5daab55a33bcbadbae07e2375e68f refactor: Allow user to disable replacement of the forge download task
22329d3e9b010e1b9853dc672a4ccb16c9bd7e1a fix: Should parse the curseforge modpack with no files
8d53dada02327b6f1a39b2f791a7a3d353e7f581 fix: Hint user to login in official launcher if no user profile
daaedf53dcedf52377535615b51342a093eda919 fix: Handle the srg download correctly
6b75145462f013982e23e52293294a1f871c7e6e fix: Handle more ill formed semver in mods
a5729c7f47d1586e42ef6f387e5067b643c4da12 chore: Update deps
41535ff49e7b127ff67cca27c88631859fa1e72a feat: Support directly launch an instance with shortcut
42a6a13e007f55ea97f057fe501b439cbd6aae6e chore: Adjust project structure
2bc9d82ae89f426f233a1590543dbdb8ee139bea feat: Support follow & favorite projects
a11bcd4ded9222fedf355b2df9017f2c398e5dee fix: Some versions won't show in upstream
9f6c1c0c434a8d09cd387c7b9136dbf5eb85cb64 fix: Support some ill-formed ygg server
7b9f96cd1a3f6f0b5b6fe55baa1f715ab7ebc725 fix: Sometime the log view's logs are missing
6d6c5aba5fb44427886c9c9235c157883a5d2e43 fix: Resource pack cannot be edit in new instance
fefe0a59e03d8b8be2be28b88e16462695b33b4f chore: Adjust logging
3179eafbce04978b45543c62277bdde25435ab8e fix: Support old forge server
ecf5a06e25a388064701c79a4ae1d133337aece9 feat: Support launch as demo mode if user is not login
554f2b7aa6bfe3ba3deb50f2d332ebf6fc2ecbb8 fix: Modpack file name should not block the modpack creation
1ae5c053bdf7591da6aad40502faaedfd4a03fe3 chore: Update xmcl-keystone-ui/locales/en.yaml
5601e3eb01a90cd8b651d67f6de0717a532e30f1 fix: Fix the broken sharing instance feature
aef1870d1f472e7c05cbc1ae6c4841d14aa3d863 chore: adjust modpack name display
d81035e4dc90e1656db46332d66d306dc3236641 fix: Adjust the default height of launcher
370c0c67a4e4a062ebef9cfdfcd8f9129b1d004e chore: fix type
b6c3dde4d5883c3343eac77bcc8c1a952a4a3452 refactor: Log more error on login
d24515387ced212cc628d1b68fdafa428825a18e chore(release): version 0.50.0
ccd37ebf9787c018a26fc720656bdeb294e55d40 fix: Add undici fetch as network request fallback
85e0658c0ea16a7ad6756d919010b6992d1b16a3 chore(release): version 0.50.1
bc90cf5cb7ae4d3fcedd37c7971642014fbd499b refactor: Handle more case during database is not ready
c48b1cc86753993123d7a6bc64e375de2209f048 refactor: Make java download use zulu as fallback
dea01fcdf643151d0fb4d3956f49aa809a358cdd fix: Support webp/gif for background image
b683eae8ad12be140a65716b084fb536bb190291 fix: Allow undici fetch flow for more failed request
47277bfcb94e38db36526e38da0f34f9c4ee9dfd fix: Allow mac arm64 to play old Minecraft
f1f42421d1a8f3f6b3a9a89154afe3f0327c7fbf fix: Fix some ui display and install issue
af7e14dc7625a687f0a9fa0276dcc999f254784b fix: Fix some forge version java detection issue
5eb934a32d60f1248b1bc0d62ad5c91ac5622043 fix: Should not popup modrinth hint each time
4c6a500e8c2788d4a81852ff6449d2acab47871e refactor: Force retry with bmcl api multiple time
598340ab0660fce9e07d190030faa563266f4bf4 refactor: Enhance the setting UI look
6787263753d7e90103d18a05acf1551e8fc4f957 refactor: Use flight to control the force zulu feature
2c96a54e7374dc57321d40220c60f3a892449dca chore: Pass typecheck
55c3d39684ea20254feebdc8aad5138d104f1e14 chore(release): version 0.50.2
2824c08efe22919625931e472f5d23cde3884210 fix: Server properties are reset each server launch
23c04c69461ead4aaca529824c9088cb785921e7 refactor: Upgrade the node-datachannel
cf4e207ff554cf3110ec13b673d01ffbdb7085a2 fix: Handle more error and allow non-empty folder as migration target
0f9a6c8519bd24ab7671a97bd5ffe2e7254eec0c fix: Should not block user download shaderpack if no modloader enabled
7e27f1dbc4c24baf4df4c49e7d443ab81ff88ef5 fix: Some java files does not respect api override
5a5522c3ca56451bb4ef5d81cd78aa3837f03e38 fix: Network should respect system global proxy
f44793ebf38ecff03e320aa04fb5eb92cabba612 merge sahder
c54cab0ff700642d87131a8626f8eb96dd52acde refactor: Improve modpack load optimization
cf29eb54f0764c218b628e8062e734b950547440 fix; Add missed i18n & adjust some ui
2b8251b5e9b946352279357445aab404d29d5495 refactor: Improve mmc directory detection
24dcab1234950e0f418aa70ec42dea813aebeddf fix: Instance duplicate should duplicate mod groups
06fa5e011d5db46e06bb02647b498e2e315f5a44 chore: Pass typecheck
07d53b7a21d5fc88815d5bae49029a12fd7ee766 refactor: Don't persist folder resource anymore
1c1575486d7c6fb925d0b3a9b8761a2f4c898e2b refactor: Improve forge intallation success rate
d5e810d0480f186e47cc5d8e60d15d0d03a9cfc1 chore: Ignore some error and try to auto restart db
012cfa3b2b1989fc56670c85f27b0be9f0fd40a3 chore: fix type
7e86e9a453c152a2e52a91b7d39007a003c7cd19 chore: Update deps
c5edf56d35b5cd2c006b20f762c0ba8eefecd42d chore(release): version 0.50.3
f372e6dcb6996b56952b5a61352a69f3520d114a refactor: Enhance look and feel for the home page
2f2e3bf832c3694b5702a0f785dae370e5adb85a fix: Cannot install forge if the path has special char
40644f16cf2d2c1d0695ec70f46feaf182b80d9d refactor: Add fallback url for critical request
5ae24a760cec82fe9b460eb3a42dfd5bc32bc841 chore(release): version 0.50.4
b594633c308f0cce3a0f06eb4dc3d85ca1b7c7a7 refactor: Prevent special char causing Minecraft launch issue
85fa6ef83201aba997b7b6a4e4c221478a90e9f8 fix: Support svg icon
98d1cb98a9db203e64208d3bb2d4f2ae90dab0d2 refactor: Allow user to store the mod grouping rules
8e41bf21b45782b77ea48f993a02ea7c56f2374d refactor: Allow user to launch same instance with different account
e7c0ed62faedba96aaa3d5463925449b5d5a8db3 refactor: Allow upgrade instance from modpack
f964057dbd96781c2dd2a88a4f047f4b2533a477 refactor: Use github issue for appinstaller
acef8c6259746a91f1ec28690745343654ee44d7 fix: Instance should load prependCommand after restart
45867edec9310d0085629527992f2586a60ea7f6 fix: Should re-login modrinth if cred is invalid
f7c9bf2f0c7339e52a1b572750f046a4f46b0a33 fix: Should fallback to old way to install forge if there is a error
6bca27c79438df3dd4fa79e504af2a72e6966505 update deps
0c0e70dd642102060c32ef3850865d4dd92ba621 chore: Pass test
ab4cdbf1df3204030e5fe1a9756c7b5d4b921bf0 chore: Log more error
714580f220bff7f2174358f4f1fb3e294ff97c75 fix: Try to re-open db after failure
5edd49a0c7df4d2641a6f0b3e3854dae76bbed72 chore(release): version 0.50.5
f48786ec5076c1f969e639d9b587e2367d9c2040 fix: typo
b79fdf9b6584497557794d205fd2fb74bb3175fd fix: Fix migration dialog and cross disk migration glitch
12aa3e5b6ae22e34253f9af7d57d8f23dbc57983 fix: Fix wrong overflow for instance setting
3b8ff42052ad20fe90e9368f3e2b5677a9f1347c refactor: Adjust the mod market entering logic
99423f164341e3b686f05fd95dc9c3eba6654b9d fix: Resource removal update handled incorrectly
a55bcc28619ebbb035ce706a62f4545576c7ae45 fix: Hint user about the file not found error in modpack install
bc337aaca89804fa71faa16c3e14f49ba9557b4c refactor: Temply mute the issue of home char
9aaf9f06c4fdef7243cfdc88a0d14a1b6a6953da refactor: Redesign of the News menu in My Stuff
890c4d09640836146c81de0662cdb1a72ef939a2 docs: add askdavin
c1d7ba401a749a8f085b0f9f113a3234b4b1bffb docs: Update FUNDING.yml
8ffd7d109a4086e2c289f48a094e8d0acd760cc8 feat(i18n): Complete and refine Traditional Chinese (zh-TW) translations
9fed908a130759aeb41049a7e83f252804766f04 refactor: Remove intall_profile.json after forge successfully installed
81804500bab717ec78f91cb466d5469bd562d4f5 feat: Support preExecute command
2ba831f69fce16d6669e9f76b0d657de66da49b7 refactor: Use new api as appx url
e566733a1057b6e63f1865cddcb06817ea355ae1 feat: Add about page
1ea79d897a2c9a97bc102d79a4774528ef820947 fix: fix gpu assignment on windows/linux
6c0482ea684aab16cb884df1c5b048f7fb25d5f9 feat: Support custom resolution
5b8b77a3d25affc35d418c8edcafcae6f723d0b6 fix: Avoid some install failure due to ill-formed version
c7b47d00fa40c33e5e2b4618a6e20d3b503f8f3e feat: New iteration of UI and theme for launcher
ec34a9df3753d42a8f9ee94b9b76011e8ddccb6a refactor: Add fallback api call for core service
0114d307b8adc7b7b9afa158a7620d8fec386574 refactor: Add modpack parsing error telemetry
2af4edd4472380ee73eed28ef58409e69752d845 chore: Fix lint & apply comments
de755a3dabd69d66611aa087d0ac564d5565026c fix: Fix 0xc download link
a1a052bf2caaf99562d82151cc7ca79b0e15afbf fix: Revert the theme color design
fd6a2c5c3b5f206d5e9544e651de8e05253bc9a9 chore(release): version 0.51.0
e58ca3bc939cb29a37599261cf4003387ed6bef0 fix: Cannot save theme json
6f9a8f89617734b32b3764269167aa9efa1b3afd fix: Instance files install should not be blocked to wrong upstream
03a550117aa36de473e38a7ab81f5e3257744689 fix: Launch folder link correctly on EISDIR
2ae64361b1c2e987a7b6e3bf028969faf9fe196d fix: Should correctly handle special version jar install
f729ccf56c3e172bbab1118b158356b9ee8fa458 fix: Improve modpack install ui interaction
853eb8c2883af4a19523d6baadfe414b74ac3a63 fix: Some theme setting cannot be set
c711e280297026df707e9db60814e1e5daacbeb2 fix: Should handle more fs error
51383f94b5bc0a45a5b1d625a75b8d348ad7cd34 fix: Save card enter the shaderpack
3d8a477fb57de730909a3ecff14931ec446162a5 chore(release): version 0.51.1
b6022d42ed05c33fc8a7f28401cc15738f796811 chore: Add Nix flake configuration for development environment
998ec43af701470eff597976e6fbecc0f1eea540 fix: Handle more errors
630fd52361c3ea86b3e83ac0c7d739a6182fa160 refactor: Adjust the login email filtering
50d4cdb30cad6849e4aaa08b73fc01a26b473f71 fix: Translations and adding new elements on translations (RU, LOLCAT, UA, DE, EN, PL, FR, IT, HU, JA, ZH-TW, ZH-CH, ES-ES) (#997)
7d2d8b8e2c1faa6a043051621c8be80e319ad58c docs:  add Tencent EdgeOne as a sponsor
b8011de75952d6ba76175bdc48ded7be47f48920 fix: Add no Cyrillic characters validation for instance name
37b88870bc37291fd1be02f43536edd6e55120a9 fix: Should refresh server setting for each dialog open
c5be75384f5f1a9f5e1863ca4eeff60454d13f2e fix: Ignore .DS_store folder for export
f8d6a7770b526ace2433a68942b17c6918bcbce0 fix: Do not pick openj9 if we have other
1872e65c4b9232cee25a16eb5517c01dbc39f51a fix: Wrong overflow for market page
4972cf7b2654474241c44ba1acdaa21ef17ab5ea fix: Should not popup modrinth login dialog multiple times
1dc89e16c4c14275bd50f65d0df46db60bf143d9 fix: Support --quickPlayMultiplayer option for the instance with server
b844d6e7c13d4b286b43859a0d69cc24b4f199ee fix: Add button to refresh version
5182488c3c757085716833594580214685c69deb fix: Wrong overflow for app
d149815111f2509722e47864465dbbd71d7935e8 fix: Ensure the offical api result has priority to show
9525c34a61a258da2ef61552dd22345310a6cd80 fix: Fix duplicate instance folders when installing modpacks from market (#1025)
459d426e2e2793f19ea5e683fe0afd5f2d4f4cd6 fix: fix creation of shortcuts
61f1a1a96a603e7f1a9352204972a242c86b18bb fix: Drop card should correctl import resources
b8f5975c74e4b04798c4f96872a546c434f6a04b fix: Remove unused cdn
2da046261ef000ee15ec3489fde7638a976d89a8 chore(release): version 0.51.2 (#996)
3a8324bb57b66bee1b347e22c2cf96f4d97617c7 refactor: Remove unused keys
ec8e1c283ca7e7a1b6e80d2c17cd79d2a3aba8b2 refactor: Make mod sorting more stable
728a3cc7ab2d65d513c31452d999e85b34e8c0b9 fix: Add hint for login age issue
fbaf8ed3ced054ed735e33e09a5d3758b01af0ad fix: Should not log error if the app is closed
87e119f0d4c389bed7cf47e6c13d35982ee06590 fix: Handle some error logging isssue
483e233ae63e62394b44c25b8c63f08c3d165ced fix: Fix some native library cannot be diagnose
1df2d589139ae497699d682911dc0b35e7b201b8 fix: Use other user for fallback for direct launch
003e864b9a0a11f83d963896293fbfa1c32f7ea9 chore(release): version 0.51.3 (#1035)
d6bfbe9010d9b97938e2a7d88877226a39c68253 fix: Ensure the resource folder is created
d2c2e95c52c606406f9ab1f2a1ebf5baad194576 fix: Minecraft version should use latest version
ef94ff19f7d6bcf4c063b542a55c97c7551017e1 refactor: Support create desktop shortcut in tray
0a5912608c31d48bc7c9816d63486d757cdcde12 chore(release): version 0.51.4 (#1043)
cab62044da83c53306c663b53fce253dca31940a refactor: Drop the support of soft linking the resource folders
f616627d4bb21a3e3a81e219020a56a367cd80c5 fix: Do not show the i18n icon if the i18n for mods is not ready
86a780b609427bd0bec6fa26d848f8e1231b83ed fix: Ignore optional dependencies's dependencies
67f37f6f04f2cf4d70337eadeeec35e73ac9a426 refactor: Allow new instance auto infer name
38aa40a2aed397b854cae632634c442c8dfae931 fix: Should autofocus the version menu input box
d5cd695b17a8ea471a6acb39f2597397fe884f85 chore(release): version 0.51.5 (#1045)
7ea5fa7be8e2b5863c049a111bcc6c5deb01b3fa fix: Curseforge dependencies check should aware neoforge
988985eafa3f733a69280727cc5ed140151c790f fix: ely authlib should match closest authlib version
9f942743b06fe43b0aadbab2e70fa838252002c3 chore(release): version 0.51.6 (#1047)
776e322196645cb6340f20311ee469b6ae1086de fix: Support illform modrinth modpack
1061d8867f5d7cbc79cddea9c3e9a57f260a05af doc: add Readme.es.md
509dc6709fbbcb19f5cbbef9c28217345d6d100f refactor: Added a Korean translation (#1063)
e85d23260ebeaae0ac2c60de4eb0edbf7628d3d3 fix(ui): prevent launch button badge/icon from being clipped (use overflow-visible)
eed972dbdcf3a4acbc9b54b81fb2d054576f5e23 fix: Some log cannot be parsed
02b4000f2d9680f105ba94ceb1557b21c2f5fd89 refactor: Lock the server version refresh to avoid race
84445628caa04df4088d2c85eb53499698601e5a refactor: Move instance related code to core and do bug fixing
1aaf87f94105a73257e84aa8153d247e21d161b3 refactor: Move the modpack export to independent page
e2d106208036ff7b2b7c0f39ab4e0f6e39a70ddb feat: Guide user to use AI to resolve the crash report
788c94c7112638be21f359158f35f51ba77dffa4 fix: Fix mod grouping: persistent sorting, collapsing, disabled mod handling, and natural sorting #1076
71167087f623bbafa1c0407f505a957b858db512 refactor: Enhance error handling and logging in game exit process
bde7bf04f5d7c9d382c04eb0ce6cb91db10c8cfc refactor: Add logo pulse when app start
332761e8fe5dd87f6b51255a2f79985ceff78b28 refactor: add ai hint to crash report dialog
c8862f9c5c13a9ccd7424136337f43cb50add14a refactor: Simplify toggleValue logic and enhance loading state handling in modpack export
8107488c66b84fe4b40e9586bfe76a5c26580633 refactor: Add window maximize handling and track maximized state in ElectronController
47ea6375ad1670f8922744380e76af7b2a900d22 refactor: Skip some no perm and sqlite error
f4d92b65c1601a9c8ef79f396ef6790eaebe307e chore: Adjust the skipFiles
e1a0a86a81039a3b3378cd9dacc873cb96990587 chore(release): version 0.52.0
b619740b9b4410130841fc4ca4ffd057520f1425 fix: Group cannot show on market
0fcedb56f984894c4d07f866184b8aef731907da fix: Force the loading size
084373c96db0ddd65ca3d8bdbc0752dd637d9adc chore(release): version 0.52.1
ad8ee321fc763995691a1a913d878ac537bd8e66 fix: Fix missing fileSize field in Modrinth modpack export with error handling (#1080)
d82a955855115a3440a977bc773275e45d9d8afa fix: Make upgrade dialog files can be selected
af18a98c06161355bb0d0f807e07e423f84f7e8f fix: Fix createResourceState undefined error with dependency injection and graceful error handling (#1086)
2cb2bf639c3017d5fd639993eb48fccdf6fec8a1 fix: Deprecate instance data modpack version
bc57c605bfcc6e7963a77e86754ae63f16b2532d fix: Some saves are ignored
4ff11a7b0d3ed44a33d505701d12b6a0e3ed5d60 chore: update lock
6f4d93749d1e214569e10fccf610b40b86d37f30 chore(release): version 0.52.2
ff759a92b4de8502785adf166a0bcc19978e34f3 fix: fix ResourceManager and instance runtime regression
0c9596549b5ca2744707cc74c179550c8e903c91 chore(release): version 0.52.3
efa10cf219b9c2d77d2cb68d50cf58b7a0950e2d fix: Fix Modrinth modpack export failing with "File download source is not from allowed sources" (#1093)
15fd396ae7913508cdc80c1b4313cc76f2d62d6f fix: Ensure all files are exported
ce189a03001e72f318473feda664de3ee22cb0d1 fix: Some props cannot be saved
b67dba3a7bbf2b3df4b54ad3c5dfdcc405ffed7e fix: The launch button is clipped
30c437188d9728de248c4d90c8e1f6e03cd8a15e fix: Try best effort on resolve metadata before export
053c9cc106ce5820957d8e0542854551430a81c8 fix(locales): update recommendations for mod exploration in multiple languages
a64cf5811e92a3797573fa2dccbcb00631b30307 refactor: Avoid some memory leak
766e924683eb894f3b9e313a7e95335d4b9318a0 refactor: Lock the server mods list by default
85375579842b12f396c64216e364fad37ca01e55 chore: fix build
a9f4cd9601598b1c6a6905b3373e70739dbebab9 refactor: Refresh all resources before modpack exports
b809198be10e9f2e5f65c9c6a26fe4e9c1246a25 refactor: Make focus mode as default
f6b761f5dc231c612297349af250b5b2e5cec334 chore(release): version 0.52.4 (#1094)
7784b169bae8611585d7e6f071b0d95ab3d58e63 refactor(p2p): Bypass cloudflare and avoid duplicated sdp sent
d28c1af10853ed66b852231533a92394817e5b2e fix: Use global config when instance is created
5a781f40d36f74acfcdb67f4741109d2d8c22225 refactor(version): Move the check integrity to instance setting
271d168b4e395aae60bbb04eb1f23d9445bc9166 fix(i18n) : add Korean translation for askAICrash (#1099)
ad8320ca3241e26cfa909c0b936d25d91b2d98a1 refactor: Use halo background by default if user has gpu
6732893f0df711514ab07e62f3cdc6394a4ee8a3 fix: Fix multiple ui glitch and remove modpack tab for instance creation
c5229532a40c554e2029b99b44799f8ea6698279 fix: Correct load legacy theme
bfd8879f1929e469c2194b38f970bd9d9ee5e976 fix(install): fix some glitch on install/delete mods
8c19d3b8728c449b7e7de341841c3cb35cff244d refactor: Adjust launch button click logic
99d212b76eea30836da152bfb1f0d0bd8ab8139e refactor(modpack): Support modpack i18n display
80f771a8a0a52c9de2d4df5b44b8234d1ef07efd refactor: Adjust launch button hint for install
646a0d4ce5b2f91d51c86497c2861c7ee913de14 fix: Should correctly install optifine on 1.9 and 1.8
ca4d7f519eda8ae19beef4527ca5334b6cecd7f0 fix: Hint users that elyby can  cause launch failure
253bd52aeefd5946342c8272fccbacab667ed1b9 fix: Fix inconsistent AI platform icon sizes and layout overlap in crash dialog (#1104)
495135cb71fb2550f8d017ed97f39416717aedd6 fix: 1.21.9 laby mod cannot install
99a0b8852e43082bc1a526551c5786a3834c601d fix: Fix some glitch on install version
676c606cd2a6f7abfb3e24551648b1f318c17564 chore(release): version 0.52.5 (#1098)
c585fc60d3f1faecfc21ae6ea2d3e00a92b90f39 fix(modpack): Modpack export should respect all metadata and make file tree UI more clear
913bf8d72bcdee9a4dac2d0cfcc8f5a5fb313925 fix: Should allow user login if user profile does not have a charater
ea21b5b75d54680b0e4b492376726fd44699fcef fix: Fix AppImage sandbox permission error on Linux (#1117)
29aa24f35fb74ef8d689d029575152e4263d24f6 refactor: Improve the image display experience
1648326b0ecb50b39f6db43c51eaa3bd0dd21fd1 chore(release): version 0.52.6 (#1114)
24d4a508335056bd631e8007329e6611231dd84b fix: Try fix multiple UI glitchs
d7d621e34dcf64768c8fe2c004446862a635f948 fix: Fix Modrinth mod update check failing with "Failed to fetch" error (#1131)
7f00101082b322b941f18a1d453354b4bd007e2c fix: Instance update does not update the upstream
67c351375a7e5364831ce5be0612ef547888c312 refactor: Add richer hint for mod page
3c030547d9e6e65ca87c164d90940606587188ee chore: adjust telemetry log
09fd501063c8e7d5100d6d253b37f971b9ca2a4b fix: Cursefoge crash report is not shown
73bbd04f11ddd9253e9e440800aa5250ed1cf08d fix: Fix broken modrinth follow function
98eff00029dbdca740600c52eaad59c6f38a38ab chore(release): version 0.52.7 (#1130)
04fe08e058c02e115373a80eeb690f6092543819 chore: Removed flakes, added Zed Editor settings (#1136)
6bbe3e8af9ebc40869b2310c325c6bafcd7cdd46 fix: Enable native Wayland support with UseOzonePlatform and window decorations (#1160)
78c389a368c89905fed119a34c6cfecb129eeb3a fix: Sort by download count ignored when searching in remote view (#1163)
1b5ed16085da4acd2e35e793addefca9910b855f refactor: Add source filter to store explorer (#1167)
6764b1e9df86e8fed40a39224031a5c769a4d0da docs: add Korean translation for README & CONTRIBUTING (#1147)
3a3e4be732ba28e8bc456ea8dc87ed78f8cd464a fix: Add AMD GPU workaround for Sodium rendering issues on Windows (#1158)
6d8ab673bd7b084fd776fd719f6497affc5455ec feat: Add world seed display, editing (#1109)
b2c1116ab7ae6e14f3079958e56299c4846d95f8 fix: Fix some common error
0cf02a020ebd31df1a9ae09d421f19b074f19634 feat: Support modpack export with server/client field
5063bb25f9fc4ba1e471f3203f9f4b09924cd097 fix: Support mualliance-like skin system
a3db3df66dbade45fe25f04e4a35819932fafa99 refactor: Refresh look of focus view footer card
6a98f00cbb63cee90936c7cd9006a68d8fdf1575 feat: Support per-instance theme
ced9d1ab4cb488ad23978efad9b1ec8e257ba28b Feedback (#1175)
48384d36b398f47566070f3a549c70ffb810dcfc chore: fix the build
64d55450f87bb419e5ac4ac6df866e6028848c78 fix: Refresh user should use new user if exists
2bd630e467de1e1ae425ea5c666f870d1a823c9b fix: Fix mod grouping UX issues and add folder management features (#1171)
27636142c5f8442d00d99dcdabc054ff0fc6c1c6 feat: Add Optional Translucent / Acrylic / Mica Window Support (#1180)
7c7c2e32a2158edbb8b98cfe9639c8f1aff6c4a0 chore: fix type
10a7ee8ae2b28cefc8239f40d1a9b4e8e7ac9c58 fix: Fix missing FabricAPI mod when exporting CurseForge modpack (#1184)
c59f23d41165d1fef7422ba036f95a64c8ed39d5 chore: Update deps and remove unused code
8845eb4654a8239813b6a7f7bd4dc35d01117cfb refactor: Disable material background due to the electron issue
a350908f65b3bf87418eaf31e5ef0bece5c59ece fix: Fix Modrinth collections: add delete capability and fix caching (#1186)
50837678081cdb1175783d2bb7126fefde950cc3 chore(release): version 0.53.0 (#1166)
531bd491808b9fcc44398e1a2c1339f233ec2203 fix: Add transition to background image
170b391efd9bd456e695a2606053a3b697dad599 fix: Fix mod market pagination bug by adding loading guard to prevent page skip (#1187)
944729dcb53d9521f40bc0898a0c82ced053a98f refactor: Add one-click mod upgrade dialog when changing Minecraft version (#1188)
ce34eb61818014a2ec53dc828f3e698035ccf257 fix: Remove strikethrough from mod versions in duplicated mods dialog (#1189)
d8d7e774680129c55dd7ba883905a8e679448dd8 fix: Fix dedicated GPU not utilized on Linux for AMD hybrid graphics (#1190)
148591bfeb9ed518112bbc0344d267dc9e659b17 fix: Some oicd like auth provider login issue
25c8fdc25ecbad2a54a3685084155bae93c93199 refactor: Support to display total number of mods
bfc6fdd3c1ed86053ac72a97a9b1f2b0fdb36d11 fix: Fix minimize button crash on Niri Wayland compositor (#1191)
09b2d712a071825554df26f3a4556edaafc62250 refactor: Throttle the launch related telemetry
0becbd4fc5822f556482a8b597787b65f3bd2240 fix: Fix multiple type errors
025678f57449cc09ca0b93c8b3c3be2df85ddf8b fix: Fix global theme background being deleted when setting instance theme background (#1195)
7a8e8557352870b799d2ab8fd85fa238463d4fe8 refactor: Add horizontal grid display for instance folders in Me.vue with view mode toggle (#1197)
96a132ada1451b62ac9bb382fb8997548f7bfea7 refactor: Log view improvement: fuzzy search and duplicate grouping (#1201)
b69f46a000bce48a559a1b20e67e85b09d9e6c94 refactor: Add client/server side mod filtering for Modrinth search (#1199)
8f139793f0227ffd6f056d884125ec7df0e8b077 refactor: Remove redundent code
de359ee72eecccb2facbc632b17115739a42c36a refactor: Move the authority service UI to user menu
53a25bf21bea78fc41c62133e2e140ccbea2d5d9 refactor: Support quick search for specific author
cd5915247082d4d4f131ccdbc6e16a97f012ef9f chore: fix type
22b0f27ebb02a9e50c91d22075287af27fa4bd65 chore(release): version 0.53.1
990bac6c525532261078e5fe2353558aeacc70fb fix: NeoForge shaders mod detection
59c31ab88fcbb95b24015397aec0e3f7381910da fix: Fix save page freeze issue
a2228c6c846cbf5924a627f771e1fce4edbd2c0d fix: Add WAL for sqlite database
9ebb630f651058ecf10ea4e4be12592522b795a8 refactor: Ignore some minor error
fde1a5aca6624bf4d5a453ef5c564e84bbab1ff9 refactor: Try to improve discrete gpu selection
b8900678a9664657e5fa50a44df450e528b77d91 chore(release): version 0.53.2
610d524d1619743f031aef6955b9914ac99a4d89 refactor: Updated hungarian translation #1235
e0a9f5aea63f3b2ef1d03161fe299e7b48683576 fix: Fix multiple crash cases
2016b0d37fbc56719bf7f9bead032e20a6dcfe90 refactor: Add Windows publisher metadata for AMD Software: Adrenalin Edition compatibility (#1218)
6bb1c84fa9b695d3e4c5d4ef694f51f15752b99b fix: Filter directories and non-image files from screenshots folder (#1252)
1ddb36447d5bbb1eba3b90e5d942c042cc27e9c7 chore(release): version 0.53.3 (#1238)
e3e46f90a2f6ad07f3abfbe2c81a609b90ac5bc0 feat: New Modern Designer (#1242)
8f555064b58e3cf867dc7fbaf319d67a031c6707 refactor: update @xmcl core packages with new task pattern and download module
2bcbbec89d050e8944b3d52d977c90d3b2e1ebb7 chore: update dev environment with oxfmt/oxlint/vitest
d1fe6ecebbd85ee42569d05a430a0f8a0ae217ec refactor: switch from ajv to zod for schema validation
6dc67012d33c5a462e6e540e40ea6c85d8474aa5 refactor: migrate sql and worker code to @xmcl packages
fdd82c24f7e581773540805109532926415a99eb refactor: rewrite network interface with new undici API
5ad59cfe1f764f55b4e88467d0069a87b68e9be2 refactor: adopt new task pattern in runtime services
819c58ec84ae3be42e2d03784f2624d8c4c80c21 refactor: rewrite version diagnose and launch flow
38eb0d6a29af4c4493368f64b48d47cf7c3ab767 refactor: rewrite instanceIO with new task pattern
e10e79836a5df0a083393c8a9a47bd7d9104980d refactor: update runtime services for new download/task pattern
e19793d0a7f75dc12c1c81bbbbf4aab5cd36813b chore: cleanup unused i18n keys
78aeaa296b07335bc880b8dbf157d4b555d2849d fix: correct GFW detection logic
f5d7430206348fb8b5b433d5ca55a01e93039879 refactor: update electron app for new task pattern
bca67224046e34e7b1bb55442a2f76fb305ba7d7 refactor: rewrite UI version diagnose and launch button flow
6a6002bde3bb1274c86b3f9f2a2c7af674249648 refactor: rewrite task UI for new task pattern
32fe8e5339808d85d069414fd09c7d855ca02ef0 refactor: update UI composables for new service APIs
666f1563183ab96edb6cf277ffa4f5df075397c8 refactor: update remaining UI views for new service APIs
cc0d591267f7c5b251e9de8053ce04916d161347 chore: update dependencies
de10a719e618fca8792e8d9f9438d89c5e577079 refactor: Adjust the behavior of the notch sidebar
497983cb586c6b85473411f29148577694ece137 fix: Align instance context menu behavior
03f3448c1c4afce7b7fa3648fac8e26d4e266cca chore: Update deps
c7ffe09c541ed33dd1f4feb2bb9f217e5ad4476c chore: Fix some typing isssue
a275df96bc02af21bce2bceb826f40d3bd5989be chore: Fix build
d0d53a443e61b739550a48562a778eb480f9b3c4 fix: Fix some UI glitch
c0225102faa9dba87eaa6a1bbd1260003331e71a refactor: Unified the error telemetry filter
538cb2b6b8133d9f6ca3380780077aa2f290683b fix: Properly parse java config
2c28026ae3f588b4f7e1efde0522d71ec296e38a chore: Update deps to fix type
3d4bffd9b71922c7bce1489f8e1483382cb45670 fix: Instance edit glitch and store display glitch
8ae8a6ecafd75233b17d7403e011b3a215c160bf chore(release): version 0.54.0
e41636accc0c46d79c4c67bcdb511c10b72bf02d fix: Wrong version picking for assets install
87623ba3660d6360475ad5b1c82c672e95420ed2 fix: Fix some curseforge file cannot download
e530e16dd79ef2636767250e3e48d38683307305 fix: User's env should be top priority
115fb54bc9b08a1c9e4e2f209e35ee54775b1eb4 chore(release): version 0.54.1
200fbac95e54aeb6bef5a48e93830a9f8f268d43 fix: Sidebar group color
6a64d921fc2bf7503238b73a7fbe60fba254b4f7 fix: wrong forge diagnose
a76299e093d64beefb49d67a0aba53b9885eede6 fix: Instance grouping behavior and instance rename behavior
0335b823ec75dd82ecf2f9639f8fc9bf7d93d5d5 chore(release): version 0.54.2
570a2a2f2927b803e559ea8a0310117f1efcc4ae Fix Settings item switcher (#1298)
3fe78e53e9b3fdcead060d4dcee6f3acb8fc5b17 chore: Improve dev terminal location
683ec71fe92be948d05cd904c3228a23ef3af33b fix(setting.schema): use .catch() for field-level fallbacks instead of .default()
96f4f2e81ddf1129fc56ea7195462d4233d87a3b fix(user.schema): use .catch() for robust user profile parsing
94708a1e875d769a30d1c467f61e30a7752666b6 refactor(pluginSettings): simplify settings save and improve error handling
d912623258366e71e820cd6087aad96779029c45 test: add comprehensive tests for pluginSettings and user.schema
bc28b9f31a9ca10fdaad52952aa3eafffd3403f6 ci: add test phase to validate workflow
ca7f4363bc402d5f7887cf12f2c0d1d504566ea7 refactor: Add click-to-search for mod dependency chips (#1303)
a373ff76a3525da2e4af8f51d62d2eb8bdf162c4 fix: Fix list of mods cannot display (#1292)
b307f262f4272aff9dd9c7d3aaa45d7879b02f6d fix: Wrong i18n display for last played
732f99f03804d0eb5c12d9e422406230199e006e refactor: Disable Discord presence when Minecraft is launched (#1307)
958375df631b84102cd0c0ffe242d26243f1f6b9 fix: Fix modpack export failure with invalid filename characters (#1306)
7be70b0182790e0c335907081c1919552de9bddd fix: Should not generate options txt if default options existed
1a820a1483c8442b3418c5473f18626afb840d3f refactor: Simplify the theme implementation
0253dc5751c33d3949d31b851d0434fa4e2957af fix: Update style & i18n
840ad784b23bf34db7e3c580ee4b9c5a8d691aa5 chore: localized strings
d6b3e94146b6ef50202ae294ac0e881cd2d0745b fix: Should mask phone number
1430371422027aab0104c664f2b8231de950b04c fix: Dark theme not handle properly
febf31a780d5c2c1399a16d9c76bb0bea88e6cf9 fix: Cannot install legacy forge
3093adb7cba6d513d311557c92f223618ed245f7 chore: fix type
555094c4e623d5e0f27385ab1957c86cd0ae3af0 chore(release): version 0.54.3
4cec66cdd18cb636035e64d604caa0ccf3bb6e8c fix: Fix mod manager bugs and add modloader filter for Sinytra Connector compatibility (#1312)
a38499fd993beb871077b4a551366e83c254d292 fix: Improve java install reliability
051ee14a2b5b18b7a604ed2482fe09688be37b96 fix: Fix the optifine preview download
788f8e4c669c2c41fa9e3201c597bd29fda4eea3 fix: Fix the percentage display
8d1ac23c908986d24da7c848e13a432db23dd496 refactor: Allow Java versions >= required version for Java 21+ only (#1328)
d16a365a025e75e200e68ee99763c4a51a7102f4 refactor: Ignore all sqlite error if disk is full
ac9e1594b971d7e5f21250cdc790c5a63171f87a chore(release): version 0.54.4 (#1305)
2d29451c0f97b7384478abf2e21805acc4e5a76a fix: Reinstall should use strict mode
41243a0d6de96a0413c2153f22f0789d5aa3653a fix: Export as Modpack search clear (X button) soft-locks UI (#1341)
bd52d74f852ad7c1602a584d29f8ad6853a92109 fix: Recognize Minecraft 26.1 in market version filters (#1366)
3d42fa36611e9a7ba7e544c02abcb122e7344d82 fix: 在最新版的`brew`里下载细节有所差异 (#1373)
4ccedab86436476418055c25c31dba40d2db7aba fix: Shader pack Unicode display & disable deleting file (#1371)
b890a888956af4ccec668e4e4fa8684fd1cd858e fix: validate instance name for filesystem safety and fix false duplicate detection (#1383)
74bb6259be19f598dd9eaf60c55ae1d22b165f31 refactor: merge xmcl submodule into monorepo
54b4f27816af459330ad34f2293df11a1b7272bf fix: align pnpm to 10.33.3, fix dangling with: in workflows
883e8705592270d41cb41dfc788b976a553a9d48 fix: allow vue-demi build scripts in pnpm 10, fix worker test
6dff75c1e7532bb16b07f2378520b77f36106656 chore(release): version 0.54.5
0b4edc658d9b8b386660c28b466ce18aa31c0b9f chore: resolve Dependabot security alerts
f0df91a1cc8a056dbd7cb3e0adece6a2c0ea3ff7 chore: update markdown-it to ^14.1.1
20aca14eb501543a8ac1c829714d2817b30be086 refactor: Remove unused files
12139fee658e00b4acfb8148ca94e558a14c6e39 chore: Fix the core build
bcd29ed116a6a0f439c282f3c8b776edee991c35 fix: Try resolve java 25
8007d9d72d9fa94b1990e908942ceb706bb37d9a refactor: Remove some dead code
6b359d3829b790018120d2d75ff1f12ccad666de refactor: Improve the instance install reliability
856eed836c4af825df9931ee66ea49cb377f190b refactor: upgrade to vue 3 and vuetify 4
f22a34c661bab99adf381a16e4a8d8d3f2c36e4f feat(modpack): import MultiMC pre-launch and wrapper commands (#1386)
7002e08a67fc49952168ae7c0a1259fd0a5dabc3 feat(launch): add force-kill button for stuck Minecraft processes (#1395)
14dc3b67efcec45ad5e6e42c6ce0a3eadce1238d feat(ui): auto-scroll instance sidebar while dragging an instance (#1396)
2d79992f2ef507584bbdc32ee33376faf9c333e7 fix(instance): allow clearing optional fields and sanitize edit IPC payload
25561b23e404b641df4e218667751092c85fe013 feat(ui): redesign environment variable list item
4f8d2ecd7e9d23421782a4fd638c38e97e1f55d4 fix(ui): shared tooltip stack leak / sticky tooltip
8ce6bb362561683f94ffcd134e9c330b304806c6 feat(ui): show actual auto-resolved Java in instance Java card
f32bfe5bb97b37b3eaa28cb24a80fd162c3a5f07 i18n(ui): localize hardcoded English strings introduced by Vuetify 4 upgrade
5065695b60d837b672f27c502987b58f559a5a18 feat(ui): redesign launch server dialog
dd582b472565d067c2ff68dfcda3334e0c79f5fa refactor: Improve some ui detail
7eea657a4461c2262beed52812ab5385897e57d8 fix(gamesetting): stop backslash doubling in options.txt array values (#1379)
d87d02313a6c429aa22c3f32f92bb2965c99cb67 feat(ui): set image as launcher / instance background from image dialog (gh #1344)
8018ee01351c0cb362c55b29e590dc2339c70788 feat(launch): allow Esc on crash dialog + persist abnormal-exit dump (#1389)
1971c913d7c1f756d400e38e567fafb933e258a3 chore: Remove yandex
746bd32dd0aa5314ac38100ff98c24dc15cd8806 feat(commands): add hybrid command system primitives
80e6f8a8394fa16650662b8612aa235c311aef9e fix(market): inject TaskManager outside computed dependency map
dfc3c8c2270aebfb08bcf00b9b369d455a3fa854 fix(player-cape): guard image ref before reading naturalWidth
431783b8b69b4e75473f1b976ebb469129a9d977 fix(instance): produce new references on edit and normalize isModified
eaa823086ab03e87b194890a24c68062d632925f feat(add-instance): rounded styling and IPC-safe payload
530b24de61e95d15351b40a39954d07935eb9a09 refactor(login): migrate user login flow to Vuetify 4 patterns and restyle
19a4bfa10b38a3be9bfb3e7701786ea27c7b3c02 fix(ui): Fix multiple ui glitchs
8471eef17c37ef85da4c14bb945cbfd54160f67b fix: Cannot install forge/neoforge in new version
acbfe2c3567528a2cdfb3ec58ca65cc735d2f0fb refactor(wrtc-multiplayer): extract preload runtime into @xmcl/wrtc-multiplayer package
cb2b00e924d96945f4b3229a6c4f3e5eac09e4e4 fix(keystone-ui): vuetify v4 stepper rename and theme.change API
f869f0ac5d3034f151b338f9c4706b2ce05b96f1 fix(keystone-ui): vuetify v4 cleanup for multiplayer view
4007946715a785936fa3cd9de533e6e2d51674b7 fix(ui): unblock keystone-ui build
c2599b943031bab4250da38810ff9164a51ca884 fix(ui): import MaybeRef from vue, not @vueuse/core
e1f9cb64ea1dbfeb8ae84137706b4865ed5eb4e0 ci: bump Node from 20 to 22
b7f39bd431da1e5babe8e2068da9f45638b757f6 fix(keystone-ui): clean up Vue 2/Vuetify v2 leftovers for vue-tsc
44c1c246c634a55bdcc855e317537bb5b531dce9 test(installer): align forge.browser test URLs with implementation
8ed4d46507b0bbea42525d3e69d4db741451535e feat(ui): warn user before launching without an account
b474df7f21dff5d43053e4c9c83e87fd0af190e4 chore: fix vuetify upgrade glitch
b6e0657d7586e662d6fa999344699372e2dbb972 chore: Fix some vue 3 warning
d6df433eb4b490b1a084a1410e5bb5f39f2d667e test: Add e2e test flow
0c34f4b6429389be01d8b6e4611eb67b930293f7 chore: Avoid to trigger the e2e test in normal testing
1528bd36e6dd4743383962306f5f37f88e4d2b76 chore: Update the copilot instruction
df030b56f15e7c88c29d257a7d61b18d21ed1a52 fix: Avoid duplicate click for install mod
4e9989f708cf4ce45d63014694bd95fd1d443753 chore(release): version 0.55.0
405707afeb841722d0408236b2b9fcefb77f9899 fix: Cannot create modpack
ed1edc200517f93e8ecc5d62f41014082ff3b061 fix: Wrong install progress beside the launch button
a752d31322f451b1e405f2463bab7c0a84fa5e78 fix: Migration dialog not work
cec4c878244bbde9a7c9d4cc5fb3526078ea025e feat(ui): add UserProfileDialog account-management UI
fe59ebb968219804c665145e160861b4bddea4c1 feat(user): add MinecraftFriendsService with friends & preferences API
06dced87047758c7c2ef52e80ec027bf92f272d6 feat(ui): add Minecraft friends dialog and composable
36c5b0309cf7c887926a7865cf42fb8206901f9b feat(ui): add Me page profile panel with sidebar avatar navigation
3433ac758fbd948ea027c2fd53cc9e90eb7d2c22 refactor(ui): streamline UserProfileDialog and related components
62b88b31903b0db00c9609c2a4eeed51820f43ba style(ui): apply glassmorphism styling to dialogs
32a8e45facc6cc1d39d83c6eb1e0e1bcd51f8797 feat(i18n): add locale keys for friends and instance update
1c0dd7d1477ad40c104c41fd22a6d8c9d7246f3f refactor: Update style and remove unused components
6c1d8ddbd6a3e8803fce42fcc588344c285b9365 chore(release): version 0.56.0
3e656df286c35eacb6ec08c97a99d3200b616ea8 fix: Fix some ui regression
3104186d908b45fbfbcdf2fc60534c96eed0159e fix: sync market search keyword when clicking author tag
c896ea1df6212a692e05dc69ecf9f23bee9b977e fix: SimpleDialog v-model compatibility with Vuetify 4
dd74190cf110c1fe2f9f9ea22650ffc09408fb27 refactor: modernize setup wizard with mood effects and Vuetify 4 migration
fe6182085a5d94478973bd4077b11bd8ef4cc0ef refactor: extract shared UserAccountSwitcher and modernize profile panel
275d2ae80a64a8c872c27291c1ea9e6128c1fc09 refactor: modernize home grid card hover, resize handle, and drag placeholder
cec76332389afd7e554ea32c6297cae40f909cd4 fix: update modpack metadata emittedFiles when switching mod versions
d749618448d92286f75d1731d8c9266c32d4e78d refactor: modernize MarketProjectDetailModrinth layout
3a2f9299d92ddb655249abe2eee279e217705286 refactor: add launch-as user submenu to launch button menu with i18n
d7118ee2ee0ee48a8ae23c1e899b5c58490aa24c refactor: modernize global menu styles with frosted glass effect
d7b0e3959f4a1b41e70326dc81541bdfb13de764 fix: skip authlib injector download when checksum matches
58beb93d488d25b4193ce2853b8a89ed21f816f4 fix: launch server dialog selecting all mods on single click (Vuetify 4)
5e7910fbd957b52a9d0885e78b1b280122f0c447 chore(release): version 0.56.1
59fd54b9564b731410be7628d2dfdb44e85b89ba fix: fix mod upgrade for disabled mods and auto-disable on version switch
68c3d59bcf57b4005f0c6cfe5d32a5d5ddfc3255 fix: fix v-btn-toggle bindings for Vuetify 4 compatibility
1aba6a52f656aaf5f9cab9eb541c0aacc441c8de style: reorder backdrop-filter CSS properties
4b09db8b993dc3033243e855c7b87f734ea3dd2f fix(keystone-ui): real fixes for #1430 from sourcemap-resolved stacks
b1627dec378bc7bef294cd450f9731b08a53f3d4 fix(telemetry): land locale + route in customDimensions for i18n compile errors (#1427)
bdcab0a3a91b9e534958df50225b90969ec70609 fix(sqlite): stop `Database already closed` error storm (#1429)
24e3ad49096b59463671903cb093b8f47b969ae0 fix(launch): hardlink/copy fallback when symlink+junction both fail (#1428)
5d0436086b96de78ca70aabd0a9d53beb2bf3ec7 refactor(fs): split hardlink/copy fallback into opt-in linkOrCopyDirectory
d34708ef4e08e61717745befcba23dd5b7235b03 revert(launch): keep pluginLaunchPrecheck on plain linkDirectory
4a6ecc69484707f063fd5e774506b6393e1812ed fix(resource): route broken jars to ParseException + notify user (#1431) (#1433)
8dcbac8fbc171573bc9323868d123e0e5f54e1d5 fix: Fix notification icon issue for notch sidebar style (#1440)
f3326b49cc333a34ff42ad59c1f7a1c88a3f4a18 chore: Fix type error
70047d7e1285241dc4b6b0144448edba6025c47d fix: Fix the keyboard layout causing shortcut do not work
a20620e85d7eb8f8977a4c4603b0a49b57374d6f refactor: Align ui feeling in home page
193c119739375422ce465e1541621abcbd27a84f fix(ui): pre-render context menu to fix first-open positioning
be4fd6d5478e4fcce9c22135f9696adf6cf1f19a fix(ui): defer context menu open until items render
3b722d511f914c34f583a8ad0d717772e0e6be7d chore(release): version 0.56.2
e8098589303e8088dfd60919f4bf46618306d8d0 fix(telemetry): batch P2 fixes (CurseForge / Mojang / MS XErr / stream controller / Modrinth deps) (#1447)
e79d824ace41f05158f5e510d166710de87f31b9 fix(resource): skip non-zip files in resourcepacks/shaderpacks (#1448)
2159cb6ddb0df63120dd7a9b51a424d9ab60402c chore: Fix back style
f25058410f59d259607695d3eb6ffa003cc15f3b chore(release): version 0.56.3
6a2a3b1f230dc890a56e9e025b783611f26dc7bc refactor: Improve a11y
51a93f2077e659c1c1126099da98fc6a7792342a fix(instanceIO): skip Windows reserved files and refuse drive-root in migrate wizard
f3905eb4fcf4b500dba081d93bb1e69676388ddf fix(ui): dedupe repeating notifications instead of queueing duplicates
60b852fb840795759d32a49129de3299031592ef fix(telemetry): suppress 4 expected-state errors and harden decorateError
4a8c8ce3f0fc1db4b57f0a33fa9712e4d1c94a7e fix(ui): always notify the user when a Minecraft install instruction fails
8615c47fe68f56a037be5e7569799a848f7ceb49 chore(release): version 0.56.4
d8e22f08ec2ba46a6002b4fd8c4f276533cecddb fix(telemetry): batch 0.56.4 fixes (SQLite corruption recovery + 10 expected-state suppressions + 3 renderer bugs) (#1455)
6dd6e0560733d7edc2b859967e18626824b97622 feat(yauzl): fork yauzl as @xmcl/yauzl with ZIP64 + lenient ZIP/JSON support
0a625646eb8a803fb2b6786a79868ecd0fe4b592 docs: update language flags and links; Remove unnecessary language flags and links (#1465)
c64a50bfaf0ec988122dece4e56fedb24f203cce chore(deps): bump uuid, vitest, vite, file-type (skip electron)
05c221eaa8a7d9dcbf0281faaa39af7b613f0a6b fix(resource): silence dedup'd parse-error log + clear stale parseError cache
d9f3741014c2a17200bbc4e6c25b635b275cab7d build: declare missing stack-chain dep for cls-hooked under pnpm
56f27181060b325a49672a7da2c05dcf993956ef fix: Fix some ui glitch
e70327dcd8d96167de412d359749e0bba1429697 fix(file-transfer): rewind fd when undici range-retry fails
ecc5aecb3a68a868f794070bee5ff2378eb10433 fix(modrinth): filter non-base62 ids in getProjectVersionsById
328c64e93b9f25eeeeb08a63edd01abd349fd582 fix(electron): drop non-Latin1 header values before net.fetch
a4e23a3dad604e3250595e53db11eb3a29abedda fix(instance): drop corrupt modrinth/curseforge refs at the read boundary
6d6c641b297d2d2e9ce3f60d0bc834362053d3d0 fix(resource): validate modrinth/curseforge refs and heal stale ones
c6eca7f1099e6bed35808238e12f90182d0dbb6c fix(ui): avoid steve avatar overwriting loaded player avatar
bb6e595e4cf9ac5bc498f53beb0987baa81ea38b fix: Unified card-like ui looks and feels
751eea8feffeca59743a7fa85c306ef07a5de2cf fix(curseforge): filter non-finite fingerprints before /v1/fingerprints
462a2f693774bcc12160a768a96a9f7016238e8d fix(instance): mark migrate-wizard ENOENT as BadInstance and suppress
c357dccf163fb773d0ea89af9a749b7e573a0331 fix(setup): buffer powershell stdout until end before JSON.parse
a23ee9c1b2f63be71878bf91d124dcdcdbd7d5da fix(options): salvage truncated resourcePacks line and drop telemetry probe
5cde2d5516dfdfb112fd9ec0c0b669f82824bc45 fix(modpack/install): convert raw InvalidZipFile to friendly exceptions
02024640b0946f7d02830afb773badb9c54059f4 chore(release): version 0.56.6
44702fd5a41c966c8f60f5c5aa9777964803adbc fix(ui): disable rolldown minify to restore Vue init helpers
2b663bdae58e05989120ebe12a45747d5d3c9239 test(e2e): add boot smoke spec for new + existing user
e1be2e2261fe29e344960781b44837b9af5de834 test(market): bump downloadStaged 500-retry test timeout to 30s
0f9465e6c23cb536ff14689833b1b9653875dc0b ci: run e2e boot-smoke specs as part of Validate
4d765ff10165cbc6c41e371146dc3eedf2a00757 fix(e2e): wait for actual renderer window, capture launcher stdio + appdata logs
e53af3c531fe940115324c712d24e0eafc639043 chore(release): version 0.56.6
91fde3ee11959f0b3101b7717972097fdb9a76d3 fix(ui): restore multi-window builds white-screened by Vite 8 + rolldown
91902ae405a21e44cba3ff0ea7581f7d86b5be58 fix(ui): migrate ModDuplicatedDialog list item to Vuetify 4 API
1acc9d41f286b3db83408bbe557f58e382dbfe1e fix(launch): always refresh user token before launch, skip joinServer ping on fast launch
ac02be225ff37a42526ba92ee9ee8fcf2ab8fdc4 fix(user): preserve cached MS token on transient refresh failure, dedupe official-user refresh
b5945cf51544e3f16c99c63d48ae7907ead95cde fix(e2e): bump smoke-boot timeouts to clear ~90s cold-boot on Ubuntu CI
e3f3aba52a6b465763804ea11efdc7d8fbe0e325 chore(release): version 0.56.7
dae0e52ec92be23234f1797eb09343e79f469412 chore: Update workflows
3e4a31644180a531b5dcd4f55c82217ced6967bd fix: vue compile error
e83e5a922faab86787b073221508df3a3f7b51bc refactor: Have better support on prism zip
9b6c45ca5433eecfedb225425652219b32ce185e fix: Properly display modpack parse error
4566061e29416217de862e2d394f97764ee4c364 refactor: Refine the java selection
c40c6fbfcce7b341dc74439c52dc0665e8cf1013 fix(telemetry): reactivate renderer suppressions + cover 0.56.7 regressions
98abd7f5e45f2d34d125f5aa0f1915d42d3b1a50 fix: harden zulu cache + UpdateError suppression + snapshots self-heal
4a4c150a49a7bd091641bcaae408b8a6f41d816c fix: tag chokidar watcher errors so .install-profile EPERM is identifiable
9a64ea7a1f6c9d3371557750340e2984a35614c8 fix: untangle three "name=Error" telemetry storms on 0.56.7
0671188522099095e9cb983e735e1351051c6789 test(util/fs): cover copyPassively / linkPassively behaviour change
4f3af4dcb60c83945dfe782a64fedb3b96492343 fix(telemetry): guard long-tail TypeError/SyntaxError throw sites
297b6df1c0bdc1612fdc79c77373bd086c307ec2 fix(e2e): disable Ozone/Wayland switches under XMCL_E2E + harden fixture
19509cdc737cf206f0a2048327536722dc6298dc fix(e2e): drive smoke spec from main process to bypass CDP attach issue
a2a8b4ef680ec2a735786678b55b8afeed36a6f5 test(e2e): fixme seeded-instance smoke (crashes electron on ubuntu+xvfb)
870eaace981b42567456e301c3401c18b7c359b3 fix: prevent dynamic override of macOS dock icon to preserve native squircle
67b5dee88c03ecfb3e7f1df7b62b993916745bf7 feat(ui): add Arabic translation and RTL layout support (#1483)
abccef55dc308fe6217664812fca345ad6bcb7cc refactor: use native inset style for v-switch to match Material 3 guidelines (#1485)
9688c2e4e31adb9a9c7e0ceafe61dd5394806bca fix(user): avoid stale token race in MinecraftFriendsService
b79623c9ca3520e2b74ba6d5c97e5d0e1b3d6c08 refactor: Improve launch rtl display
4d6722d45e619ed53ebfeba503f6229cf1cf204d chore: fix lint issue
4e8cc5c21ba4e2dd3f68cad8645d9e8295065db5 chore(release): version 0.56.8
591a8f0f754cb288ac0f37863d29ddd74b5dbbe7 chore: Fix the issue the publish release workflow didn't run
c2c171c4a848b857f6a304e607be0836ecaa78a6 refactor(version): move version metadata fetching to backend with SWR cache
c9b4ed7707f7278207e0f0132bcf4d2c30e25d90 fix: Glitch during switching setting
99c5a5d30939f693b41d13e33882d67300fd6cf9 fix: New user will lose the background setting
68e8e56a2493dbfec1c7c59dda1a130847e90065 refactor: Loose the java version restriction
455e1147f68a215cf9619a5492d037a83beaf979 feat(ui): add Join Server dialog and server status card
d5c118a47295ca63052b9e30484caf9ae0cc325a fix: misleading green NEW badge shown when no new version available
512e7c4542feafc4f8dfd80010c8024722358bb9 fix: report export may produce a broken zip
5a9d9d76e03d4cd6a79dc5ebe30ee85b45a90534 feat: implement Custom CSS injection and theme customization settings (#1489)
ab1833e075bd616b5ba62efbefed95d6eb782e25 feat(agent): Add ai agent to launcher
608bdaa3c7abc516d9adbf95642810007ca5ee76 fix: Wrong modpack location
21d4e56b92b4f014ad56a3ab676f9241d5346a0f * fix(ui): resolve p2p styling injection and translate command palette keys in uk.yaml
9860bf5cc05f74dcf10652a35709f30039a351de docs: quick markdown fix in packages/installer (#1496)
62af47d8a8e5cbd8b63cd0eff0058daa37488eb6 fix: make data directory migration actually move data
c8490475644c1b94bbf99eddb33aec499f05945d feat(ui): custom CSS theming with editor and CSS assistant
5a13440b95cd9f34cd2b0473261d9dbf37015ac6 fix(ui): keep mod search game version in sync with instance
a352eb372c48f71a78299133ad0903f2732e9332 fix: Fix some ui glitch
d83d0441c9a1a5e881cfb2e4c0ea481e918af6a4 chore(release): version 0.57.0 (#1486)
72ad69ad1ece2f0705de51de6e3e93b6dba75909 refactor: Improve migration ux
458854bc7a4f497efd988c6bfeff282c8a11fafa chore: Update the workflow dependencies
8f68622c180dcf557083bbac6451e19ec5f7cad6 refactor: Enhance agent capability
560b0e3bdef709411e643acc6e45b1038a8a1c63 fix: Abort task cause launch state hang
505b500a4e429ef73809774dd3ac865c315d3e17 fix: Some file are wrongly migrate to new root
56df9c4d99e416efaf9831d5a7815d2f026bdeb3 refactor: Add more tools for ai agent
e0bd4661660ceb493f6c8c3c7d4f517c2072cc98 refactor: Add some corner failure hint
16e829696eab667d9a06328f54a31de5ff3eaa59 refactor: Enhance bmcl download
9fc804d07920b372b398718b2f300e886a16b9a2 fix: The task dialog ui glitch
bb1b2f4fa9dffa16f48dbe637971e6b98b12771a fix: Should resolve some server and parse modern servers.dat
f1a1fc664c0c2c5185300ace6312d9b6bb339e9b fix: New forge server install
5138d1d23523baac33c3f711996bf815ca967579 fix: Fix instance setting ui header
5c9d3eaba8ed8c76e01689885c6e0cab03adeb89 fix: Support light theme for halo background
fb70c9b4776d472ea4bf4ef414591b2845e51786 feat: add server logs tab and fix server crash log display
a401e165c03acd6c7bedb2699b1c68b3e49c8903 fix: Try fix macOS overflow issue
8a78b4fed3d05dae31e52e67e9440d2b1c946962 chore(release): version 0.58.0 (#1500)
cb2e3ebe3cc5c03e3ecc1a55642a5a4816b766ea fix: show and switch between all offline accounts (#1508)
b720d747462273ed735b33c7eba7db8ce380b8b0 fix(instance): persist reset-to-global by using IPC-safe null marker (#1510)
e61f2c2e3f8ce719eb3365cf9278fd08c07ee8ef fix(ui): persist home grid card layout across navigation
2ea77b2da609f51a7b192a2666dea7577d6fd6b6 refactor: resolve unresolved instance files after install
e8725c78d51a61009cb6e12d4759239bebe2da96 fix: should more actively parse mod metadata
314dd7404433daea696798ba3bed546930568405 refactor(ui): rework market search filter menu
5c8de6e8e5e253490243e5070fa9431a56805af3 feat: add quick play to launch directly into worlds and servers
db0f45a694c0e62958dafaf2fa3b3a4f4e558961 refactor: Enhance mod upgrade policy
25c7915fbc9928c4800bf6ccbefa487d9e1e42e1 chore: fix glitch and adjust i18n
6a11c871c792e24d0b4a6133f3af6faadd0377fb chore(release): version 0.59.0 (#1511)
979bd1e8d5d92c74c8c6ea6e258e9660c31bc136 fix: Optifine not showing
a3b5b243a27980ad661188281c71681e0efec3ab chore: Avoid to inpu the sign tag
3fb3b45c7e638db732b94bf89543e1eeab5d0b89 refactor: store instance icon in the instance folder
4815f3bbb212ad1b149ebe1a53c5914024e6b8b6 fix(java): make InstallDefaultJavaError diagnosable (download vs parse)
40f88517180da70aa812e74660c51dc53d02b2dd refactor(ui): add 'All Versions' option to market version filter
89c1f28a263da9783e1e67ca5ea8e4e8023524aa chore(release): version 0.59.1 (#1516)
c601b7dc7132cc6a2dd6cf067e8063376f7bebea refactor(ui): redesign the add instance screen UX for better usability (#1517)
370e11a4fe3f60b013788599daa3c66fde5d2ae9 fix: Fix modrinth login glitch
63b9af8b3a15a9fe87baf71b3e788d8cb4c865d5 refactor: Adjust the topbar color rendering
64e64a44c6fa5514cb04e58d8cff3e22b708dde4 fix: Avoid strange warning on non-zip file
8cc2fa56e23c750bc133501259cea0435d49c618 chore: Stop sending run mods
c172b328f4f008b498474ec1a303c027e304125c refactor: Adjust the add instance modloader logic
02b0c0b3021ce34a9639771dacd6fcd31cbfb848 feat(ui): make border radius a binary appearance toggle
c9e6a9919c96930af337c3d57cff2ecfb2024d3a fix: forge server install and secret storage
6e4918a1949988a7877360483f8fd71e7e763ee5 feat: adjust launcher UI flows
9b0700cb91a6df515e99ed59153aeafab70983eb feat: add Minecraft Bedrock Edition support (#1477)
5a9671a33e0d5f7ab13d357e328b32133cbfcea0 refactor: Improve mod filter panel design
8bf8ec0f11f5cf751100f78c424016fa70a73d28 feat: Support previews on saves and schematics
3e5608ca514476d0c06a5123d9e2217e59615b85 refactor(ui): use VueUse useDebounceFn and useLocalStorage in place of custom helpers
41f8ea0a8c791c30ea689e1d017e0b3788e9beb4 chore: clean up code
1c7f33649fc182194c9aff89f8964bf6fff06a6a chore: Remove unused deps
462d668d8e1f5d60df4a4fe88fe7f0b76eefb75e chore(release): version 0.60.0
21492d271155a46f8015791b7f0ee00bd0bc67ae feat: Support gamepad (#1514)
37b16aa259c9797fa46fe126244bb466c730e576 fix: Try fix race condition of worker queue
c7a79944581b802d6cb8b05cbd5aaaf15bd4b7b6 fix: update microsoft registration URL to signup.live.com (#1534)
96fc2eb9ecf1b899654fbc05ff5bcc337370c310 feat(ui): extract shared ModloaderSelector and use it in version card
b69c3b6ed199bd13a524395ebef2c18816f2a183 feat: support datapacks from CurseForge/Modrinth per save
6425e6655933dc44b81ce17c7f41a4c65d3e07e8 chore: Simplify gamepad code
ed954ef3e126a0c0693c6c01f9f3b68ac09ffdab fix(sqlite): suppress benign rollback + no-such-table telemetry storms
6c24f1f3f5bde7788f54fbe4ee4a444a37484c6d fix: Complete some missing ui in market view
c2681814b5ba36b56174ce4104eefb84f3d07762 feat: auto pick background from OS desktop wallpaper
8fddcaa6b9a9cba842634d6759430046db2e3478 feat: link resourcepack/shaderpack/save folder to global shared folder
ced3983ab53e2367a57f14986eca891b7dea1d46 fix(runtime): classify version metadata fetch failures
70c52fc809898a9056914629a8a164d3392cda7c fix(runtime): recover project mapping sqlite cache
61d5f91f8956822abf8d54cf681de4367bbbc246 fix(telemetry): suppress Vuetify detached overlay errors
971109039a58b535a42f72a1b2ed8d892681281e fix(i18n): avoid Ukrainian duration plural crash
5d089b8fae02fea334141a3fedf7a51d36babc08 fix: convert custom postprocess fallback to telemetry event
d85ca14c3aa1ef689603565bfffea80b0a4c941c chore: Add lint for i18n
c860ada0a214c7cf74a24f94cc5cc76b9e493c11 feat(ui): overhaul settings page with search and better UX (#1524)
22a37c31aca0266fd4e91e22f1540e7c15a2c521 chore(release): version 0.61.0 (#1533)
fa5a656ab141b03ae48c7448dd5ba8c28a75d439 refactor: Reduce 25% bundle size
a330462ef332292867832fcb2bf9a84ba2601ee9 fix: Try fix neoforge install issue
76e6cb2ba90c49c864bf9f032d613d3a81c6d347 refactor: Try use npm to ship asar
4d2d05df21336bb240e550d54e4576b22b358060 fix: open correct screenshot when gallery is in shuffle mode (#1543)
18433f40fbd9dd2a58a5bd4fdb59703a5adb413f fix: restore last-selected instance on restart (#1548)
08122d961c2375f2cfe852977f63663ddc61c715 refactor(i18n): complete and fix Spanish (es-ES) translations (#1545)
43bbfd2503850373fc151cb5eaf980e329a893ed fix: Fix launcher processes remaining active after closing (#1550)
b134e44fc1fc164bbff6cbb634c95ebe72bb66f1 fix(launch): make instance library/version linking idempotent
95930a169b7a58828cafb38e83c6d156ff3f7e75 fix: Regression of perf improvement
ec4bfa1a0b219623b2f6f0710f783b32ad65862c refactor: update deps and fix vulnerabilities (#1531)
ac636c30e2f362a79678b6d0a00ddd290cd955f1 chore: bump version
b8154a27495a39dcbca0c6bead97dcd9b4f13027 fix: skip inaccessible incompatible Modrinth dependencies (#1558)
11c87e5373c644829c173c3642645d5e2eb45d8c fix: Show all applicable CurseForge mod versions (#1557)
51807298fd2383663edacad4141feb65ab7804f7 feat(bedrock): add version manager for multi-version download and switching
57d05b96bce9af09727ae64383719d3715757c7b feat(user): add Windows native broker (WAM) Microsoft sign-in
8d7de45ab4813477cdae715de6bc212fe69b8b25 chore(electron-app): migrate deprecated session and console-message APIs
d35ba89299f91e18152717c7f6ff862cc9416687 fix(theme): guard against themes without an assets map
c66f48e4f4f7021ea0ea6356fb59ba5d08ef0385 feat: Support Prism Launcher / MultiMC instance import with patches/ and mmc-pack.json (#1556)
c84747f68b613aaea60feb22aeb147de25fcdd94 test: Fix the test failure
81121aa5e5d7f5e5d8764f0ed346920157d6dfd8 test(e2e): split into ci/showcase groups and stabilize showcase storylines
22c6f5b89f573a9212e2f6959e93995dd05f38b2 fix(app): increase default window size to 1200x720
4c97d5a98027c62eda0cbc15cd23d9728359e9ed chore: fix build
a9d47961fb762d3f32f6881f68a3aa7d8df9438a refactor: Detect existing instance when importing a modpack instead of always creating a new one (#1542)
44de95fa5697791031a7d549188551d9ff2fed85 fix: filter system/virtual mounts from setup recommended locations on Linux (#1560)
f36515334cdaa12e79d563ee31919bf9b6620256 chore: fix build
1b9d3a65940a192052e370dc264f180042872a6e chore(release): version 0.62.0 (#1541)
86e80efe64387fb5edc1bbeb21d0e63bb7a1f231 fix: Add try to yggdrasil loading
dc14b9f2e69e5740927c2ccefe987086576a8fbd fix(sqlite): recover lowercase database lock errors
50fcb6b6e4e960859e42c4a8c5cbc9a40e146813 chore: fix build
7cb145289a70b48bb127e83a5677a5fa7dc678cb fix(ui): tolerate legacy server status without players
9f858f47e707b414b3002532ba17b582919b6a9f fix(network): fall back after API error responses
c2875c50409e81b2e64f849c9b4436816b842cc8 fix(ui): block instance creation without an effective name
b1068d32652859f70782c2c96b6617b37a9d1795 refactor(sqlite): replace node-sqlite3-wasm with node:sqlite
957c994e228d282146108b92718d8998ac607dcd fix(ui): responsive store layout with pinned search bar on narrow screens
bd153fb847df0887a7d7074343e7e9196ab6f2d6 feat(ui): launcher-owned collections and favorites
32696bc74f8029003a58f5a8a036d1d3c022618b feat: choose shared-folder links when creating an instance
57f148ab8e222f3a54ec469d274d8340535bde6a chore: reduce bundle size and improve memory usage
1fbb9b4e63bf2051ec76cfe698dc8525ac56ed5e chore: add tracing in tray
e9a13fc40a2df421ed5ef25b57b99ba74a94e37a fix: add 9 new locale translations and update tr/ko  (#1566)
3444a44f2e76e49cbdd39b888c1a973c432c26b3 fix(linux): keep discrete GPU launch environment consistent (#1565)
e14d54ee2b0caf2ae18b297f62a5442c7367164f fix: support MultiMC patches in local imports
f415b9cab5bb1260bd89691464685caa096ecf63 chore: fix build
c6141124541ec0318234f6a9390c153714df7e57 feat: default font picker to system font folder
bfe85dca0dda58eb00944bad467865340c313055 fix(ui): hide group-installed button in local mod view and fix active state
a783ceeb4267304c6319bd3efc162124a6b23a52 feat(ui): cascade enable/disable of mod dependencies
f9cc2ee23493be0efd23b9ba546ce7f0e0e02f0f feat: add instance to a group from the sidebar context menu
52cb36c7e85b21bf286cde238ce04a828a736eb6 feat: add a globally preferred Java setting
1048b007d2dbc2668a73033a59e496fa3019c4a1 refactor: group mod loader and Modrinth environment filters in a single row
578c5483e3bc1ac719115eb0e82ecf10b7ae11bb refactor: Allow explicit multi-select
81bc438f6dece42d062fe322fabadd405b7b6f4c feat(ui): group context menu items into sections
810736ec7073d92e6bba0679f18e6265da0df52d refactor(ui): smarter shared mod group rules sync
2b9156932afd189c601898472e7552860f7f55c2 chore(release): version 0.63.0 (#1564)
c81ebe73710ee85108961caceac90243186bc5d3 fix(electron): resolve llhttp-wasm and iconv-lite from parent directories if called from subfolder workers
b94bc9b9378953b399903918fa184ac350fa949b fix: fall back to X11 when Wayland socket is unavailable
3b4e9b811f68ecaf3aa20490c0d27e79403fcb1d docs: Update README with Flathub info and badge links (#1570)
de916c2bf8218012e1af79ca6bb34a7c8bda8ebd refactor: Make install parallel
aa3529ea80df10f3ce2cfcfb3e09512955f8e278 fix: Fix perf issue due to lots of screenshot
5f01b0e4d7e61290ccdc15f3639b9506bca607f5 chore: update e2e test
f38167848d254760fbabe805477b085ca942c1ec fix: avoid DRI_PRIME for NVIDIA offload (#1571)
72798f3179d60d6124907b813d2f0622a1cc9da5 fix: Fix Multiplayer On LAN group creation (#1581)
be3272b5c7c429825b4fabc094815b3bc5fd0881 fix: Fix CurseForge downloads leaving instances incomplete (#1583)
6f41877b223b9263cd07d3e43d4987237744ef8b chore(release): version 0.63.1 (#1580)
63dbe6f808fc28907696bbe57be9ea94000fd8ed fix: sanitize Vue reactive proxies before IPC service calls and dialog postMessage (#1586)
3bc89edcfe768ffcc799a74529dc17eb9e8dd246 fix: Allow user select account for microsoft login
88a6be7ac5e7573f9a153e872bc7d8b7e3e54cda refactor: Make ui size respect the font size
c774aa21df8436b625566f1129a598527497a8e4 fix: background video audio muted regardless of volume setting
3b703f8ad099a43fad7312f7b446a2cd3365405d fix(mods): fix shift-click range selection anchor and ctrl+shift range add
315f97438adcb6f8f9d060dbd5a2725b4d67ed78 fix: fix some ui glich
16587ef075bc9af8d9368ac16df86c8f68d9a6e9 fix: Fix neoforge race condition
f56bde2321e01528fdb3fa27f826d08e5db27044 refactor: add check updates and upgrade support for resource packs and shader packs (#1594)
2541ebaf5732049ebd596dfb3269b950cfc559eb chore(release): version 0.63.2 (#1591)
0e6109378bf05d289eeec622e76b89df7a55909c fix: Fix mac and linux build
596d87e03cd0c9158ca61d54bd3d825e4ba8a934 fix(auth): classify WAM cancellation and suspended accounts
8943b150bca6b090357a6f8ff1c51a7ba3f3615b feat(telemetry): add safe context to download failures
e8d8c89891714281bf1cdccc7e5e0490dee5f276 chore(release): version 0.63.3
2a80556dea63f54b122b18c06f98fc69c31d3560 fix: Make xbox token optional to login
2751ff08757bb5bf6328be7168239719b363dcd4 refactor(ui): add configurable market page size
76dad3dbb12b81ab51a9b24416ac2e6143879d49 ci: merge core release into app release
c9db9667b15adf0b768b39ca326ddb73d24bf60c fix(resource): support nested blueprint files
b82a10cfe37276ae43b1f3576656a261e2ef9142 fix: Wrong multi select for save
cc555d81a86eb9d508acb14b2818e48d33a16656 ci: fix monorepo release versioning
5271f72a05bf4608b2198c66f76268a7fa7fecc6 ci: restore app release changelog
3264de8b8b98c703e700cda92478222ba7d09864 chore(release): version
055ab1f977943b1f03de9dcb1aa8f44bc9c8f44c fix(auth): treat known network and friends failures as exceptions
8e4ae3dbea609c7ab815a96e934dcb0793162c91 fix(java): recover when the official runtime cannot start
fc04a1de7bc44c9eb6d099b9297f720ca3edefa2 feat(telemetry): capture safe Java runtime resolve diagnostics
51a472b109764a27bdf1768c10f2056ac99a16df fix(java): gate x64 runtime fallback on WOW64
9c81689c36f4e26104db835c350ece329051c36b fix(java): add Zulu Java 25 fallback runtimes
b7354d3e69110e699ee566dc990a6f3680fcd312 fix(installer): recover range downloads and diagnose processors
c353022cb57aa80ff109a209f7985d0c176be5dd fix(user): handle expected skin upload failures
6eee5f64a0fadfb952b1517dda9ac64c9195e791 fix(telemetry): track end-to-end install outcomes
19c4e6c789373f9f9f11d22ec72f1f3d47a3d4f0 fix(network): preserve multipart uploads in Electron
6cd28fb6919ea98d92a148aa6bc2b65bfc91840f fix(modpack): skip missing CurseForge files
d6078263b1791c236d69e28e41b3292ecde95566 fix(instance): detect case-colliding modpack paths
34701f9267ba381ecedf10a06634e2723a5da430 fix(modpack): reuse ZipManager inode aliases
67bdfab8b9f4f1b203c8f088facebfede49c15dd fix(watcher): release stale filesystem watchers
5ab494229e22331839d783aa026d615028f16384 fix: Regression of drop file in new electron
d071d3c96a13ec7b458f79a8da5b58a94123bcca fix(runtime): type zip cache correctly
b5f0140f052326394b11462babb49b577ccb0519 chore(release): version
7b6d7992da645e2df21e2c9223881f7bcdf8f168 fix: unblock setup completion
cc3896a6403a5a3be5549336627e1da35f910530 fix(auth): resolve 24-hour Microsoft account reauthentication issue
89fedf11c993b580b0403b730a808216f3e0b984 fix: Accept hyphenated Microsoft email addresses during login (#1610)
04c8c70aedd8ea60a783083855f577c266c9aeb4 fix: select and detect Zulu JRE by host libc (musl vs glibc) (#1617)
f861c1026c410eb2be9f8d7a9cb8f585efe3af56 refactor: add Xbox Live presence status support for friends (#1615)
76f6403e256cc2e190dd6b6ac38723edf55e6546 refactor: implement gamepad control enhancements, UI toggles, and contextual fixes (#1611)
cdcc6e6be2696995f0fefff7da97efd5b3f4532f fix(runtime): preserve existing Steam shortcuts
98493528b05b4eaa8f37f7be377d4870c0c13e42 ci: use trusted publishing for core packages (#1624)
79011ad3b425e93b88107ae9fe7731ebe4b765c6 chore: preserve release changelog commit links (#1623)
62a98bfa35bfe48b20bf7b9a571ed002224288c7 fix: microsoft auth xbox error guide (#1601)
fae8017a94880aaae577d1b26fdcd4111fb397c6 chore(release): version (#1614)
a78996298e1054a00e386917c8e967b0914d1d89 fix: use configured token for core docs deployment
a90b8a00a106d5987e3062d53d0353c2b40dc437 refactor: rework agent workflows and action menu (#1618)
df7e47df6a2770007c25da9253810cc966935af9 feat: add account system (#1619)
cf48e0c235fe80dc3d1ab373b56278b7f2c80722 feat: add host-star multiplayer v2 client (#1627)
1da004ac5d65dc127e8e633cf51f3314162e2a64 refactor(agent): add provider presets with per-provider API keys (#1630)
7714801b11ffd92669e1914b12c9377d3b60bb07 fix(auth): not allowing multiple accounts
ec841f123b40aee4bd51dfb8f1eaeacad1dd88e0 pub
6bf8e0705e9763ba6e8e25da02547ad8730c94c6 fix: Redundent user refresh
1cee82600a6983bdb587d09840d9649e27900695 fix: correct resource pack drag ordering
5ea6d5f2177738d880517efc899a5c823f7a2b79 feat: support fullscreen monitor selection
780dfdf96af415c34e504f63d114dc05197b719c feat(server): add local and remote server runtime
d0a0e3f42325dfb38335c79ff7e9988f763c7502 chore(ui): update server and publishing resources
a08c58ce61e16efd36a7c461226bdda6b462fee1 docs: prefer real app validation
6cb0269df9ddc11869c4504b6056f743954dd4fe fix: correct Microsoft child-account login error UX
8f6ccc3efadca9c2e9dc4a6423171877f76058be fix: store instance theme and icon media locally
78986e33f6eed56601db232e139a6b8253f77cc3 fix: Adjust layout
d44b13559dd7dfe0bd05b56d296d819ce4da49f9 chore: clean up lint warnings
e069a396a39fab21d30119c9093a996c8cedb9c7 fix: prepare MSAL native runtime safely
8303ef5d5a8380aad7b00e24c8b2920280ec327d fix(settings): preserve proxy protocol
3edb6b7290cc2f440656d19bf30a63b6c214c5f7 fix(electron): retry requests with replayable bodies
34e31d8f809f820104a4e4f801f5d0ccb101ec84 feat(mods): stage market installs with dependencies
5e660190178da61a659b6371d063c052d3158b94 feat(launch): retain recent diagnostics history
73e4ce69813af1181b31b9e5b9db8bc109875b7a refactor(friends): remove group-backed presence
7dd0a825054fb4b9d8138e509f46c52345874428 feat(agent): integrate built-in provider and omni workflow
737e14f2646cb18f3f6d34269d13a512aae7ed3c feat(xmclAccount): auto-refresh session tokens and classify API errors
7b42ac3b38e241effa2f85ac31cf5b952768e73e feat: use split XMCL API domains
ec90d0fd7402922d74ee56f384095b3ee3dda172 breaking: use v1 AI and signaling endpoints
bdcb538f83b3fffc9c6ca9d43268b82900fcca56 fix: preserve HTTP cache mode through Electron interception
8a49fc6e23e6b7cf12e224ddc111c504b83056c7 fix: use XMCL auth for RTC requests
24772eaaf01514c48df29cfa5472eaf7e8e1cefe fix(launch): recover Linux display environment
2457da9326dd8af4a1b4182886c2762be00a8baa feat(agent): gate built-in provider behind flight
d29a08aa60573971860867dafec980dd33b03374 feat: centralize XMCL API endpoints
dd60a7d597069732902929bcab3d7d1c341c047f fix(auth): serialize Microsoft native broker initialization
c43748c1096df4ae8f323bb0a003bc112d6a5faf feat(multiplayer): support room master migration and reconnect
6b9b7dc5ccdccea95d9b64f6290c666106dd9577 chore(i18n): normalize locale scalar quotes
eac18b2b3b0ada57b912fcf0a87eacd86ed2a565 fix: Try to improve login experience
1dc8d062a57f4640d15028b9f623a394127d5c2d fix(ci): apply publishConfig overrides when publishing core packages
3df2940f38a34d219759be38d002ca69f19da3e9 fix(mods): clarify filtered mod groups
aff6e1e85723513090b3d6d4cdcbe79930a6a87d fix(modrinth): remove projects from collections
848c045533a25e1b5835754e6c64df776a803c42 fix(agent): stop migrating legacy provider settings
60780290142b60b1f33d6e05349a13f351dc01e7 chore: fix test
05cab6c29e7775c5c2a37477aa5e1e9525761ab0 Support MCAPPX as a Bedrock version metadata source (#1636)
baa8cdea5da59949ccf076dae0bc7b35a384e005 feat: add hide installed mods option to marketplace filter (#1635)
163d47c415361c5031b1933ca537d9ca4229d68e fix: Fix some java glitch
e9a259ed21f221f477aa18cf16543ae6df79b45c chore(release): version (#1629)
b98a0ce3f3550ca8ce2362b8b5f7298324d6cfb5 chore: fix the build
7dfaf0596d8d4e3c4b950f228e67e93237880e7e refactor: add DPoP support to XMCL account auth
ff88eea763df35d28e619bbff598b9d578cb807a fix: sanitize marketplace file paths
25d955cb768d834333fc311cf697f8480ce21a1c fix: improve marketplace installation flow
a19ac5e6b5d0770ec3469eee74b3cfe1d834eaf2 refactor: gate multiplayer behind XMCL account login
eb94ce3cbea55914eec314067ac7396f8c904c39 fix: Should select version when select modloader
c80f0425f5f6b50c3f1082e7ca6220b7fe07858c fix: Avoid bundle redundent file to prod
5d3a93f338fbb779a12e4b8d4a7e6ced0a4d1fa4 fix: Fix p2p connection
b6d371323b4404faeed2407eae8763ec41e613bb style: redesign XMCL account linking buttons with centered brand logos and icons (#1667)
79fe5f4c47456e3ec6a83cf4bfe342c983d291e2 chore: Control the AI telemetry
12ed91f9a2e7ca157e03da3075c658e46df62506 chore: Update release pipeline
5cb7196c5ff0602c571c9649ca1cdcc9c7fa9f1e chore(release): version
17f7a61e4daf4a1531cec81caaa84d3cbfe80801 chore: update action
8c002ee8cf35ca5738d777859a5d8a91cf2d014d fix(import): resolve dropped file paths via preload
bf9bf56da4a6d63cca309370584e98b2f245adbe fix(multiplayer): encode shared file response names
83755e0dea863948803d910692ca26213abe36ed style(auth): refresh login success page
f616c6f7dfe696a8d0fb0125081e597ee4dcfb1d fix(auth): trace Microsoft login and keep silent refresh passive
fd2c0d1f846d1e5f75f438a4e54c5b7e12866ec2 fix(auth): normalize missing Minecraft profile errors
4afbab87ebbdef7d9fbaa13c3790fc9887ec2286 fix(account): authenticate providers from account panel
4a798f45b4e5c4b691f9d97467c3a72a427c1567 fix(account): refresh identities after authentication
5d7c1468432e5b1972cb0483f060900634b2d0dc chore(release): version
546ada4d103e7dd723119f09d504a8063a61ba9c fix(account): bind DPoP key during exchange
4b80842446e5f57d10e6fc5d69051540873c8f25 fix(auth): deduplicate silent Microsoft bootstrap
5b9cb5111d72afb6a1ff2dc56a2bcba56c15aca5 refactor: make XMCL the primary brand
ab2df499fc1fe658572e34e916bf4c8d51b1a5f3 fix: Try improve forge install success rate
bc077167c14392b19db8bba27d51e4a704355e96 fix(ui): show active state on collection bookmark button (#1689)
a0f6c7548570c3adc8e95be340227a32301dd4d9 fix(modrinth): use remove_projects to remove project from collection (#1688)
fbbf06d4a389e8f307186952fa3215304b80cf06 fix(mod): align CurseForge upgrade plan key with item.id (#1692)
4bff0597776368843eec3782ec19b258cd0fac60 fix(ui): scroll agent chat to bottom after conversation loads on open
b0cf753c0c03db5f8f16141952aeebc35af76b84 refactor(ui): add Reddit channel to Feedback dialog (#1684)
08bb95095d52bdff7f29746a57b742587d04aa67 chore: Fix some build pipeline
1a79eb044da83e8d41d280a74c35baa64144247a fix: Try fix the context menu
f130b2a3966fe2a56ff75e538b9798af7e69a21d fix(java): repair incomplete runtimes
c4f20c1345db5aae7be7cb6ccbcaac05bbadfa1c feat(ui): add instance play button
d7a9f7f3827b93cc31cd1d42688a48c37a661685 BREAKING CHANGE: new installer
8c9f6474612e7eee70813a3afc949367950d94d9 refactor: New install implementation
2726659e25d65c3f1caf51c628e924a04f6364df refactor: Refine login cache
12a103f13f9fbbd16784c8724205b98a5c842439 chore: bump version
e1d318aeddd2772147c52237c81ebc7840c81b31 docs: Remove docs
240504e7fdf6846c24a702179b869b0e4271eb4e refactor: Simplify the state provide/injection
55dc3b2d2340a6659447bd704209a8595995b1c2 feat: Support no instance
97386732fee4f4c43baa06596d5f384a29ca272d fix: Localize the instance sort tabs
d49205d482c48fe0f3c6c1e752d4ceadc6cc411d refactor: Improve the diagnose status & perf
dc76591ac1e9bba1fa31e9c56f75551c87aee308 refactor: Enable AI agent for all users, add subscription hint
0f4e3e21c39569360f13f3a18a5ecb3de1f0ba9d fix: Fix install concurrency
9d96b66505cd84c279bc05385370d4f1495454ab feat: Support show dependent
6086a2d1eb0edb376155de2d47e3afdabeb9ada8 chore: localization and instance item highlight
8a45ee3359bd51286c6c5fd3f160b68728912fb8 refactor: Improve some page perf
b4cfb2c3393a6ecb3f90cca57284b8c1893027dc fix(launch): handle Flatpak display failures
7494c3af970e9876e260e2b270d7b0a563171e6a fix: Should not double disable disabled mods
3b9a82c4980f4e7e1ed57571f6ac4ed881138421 fix: Case-sensitve issue during modpack upgrade
70a067056b64ed0c3b86a25befe3e59f8d0d1aa4 refactor: consolidate XMCL Together multiplayer
a961dddf76a5ee039003a97a65c64f8f828abca8 chore: fix build
76e754ebe0829aa104bc01fd358d0857a34a482c feat: Support double click instance icon to launch
438e18ca061e183b25b731709ec2fbf03ec41be1 feat: allow customizing Quick Action shortcut combination (#1666)
83b3f7f88b50057a3c935c983b67af916ae2bfc3 chore(release): version 0.67.0 (#1690)
926faf0f1e062ebbd20b22683ddbda8db2925290 fix: align multiplayer login provider actions
e4154c1d46f39b28650e0927fd4461549dc8a2b1 fix: support light theme in gamepad views
beb534db7fcbd04635d5d9cb0033e57b90b3463e fix(mod): show Modrinth upgrade in project detail
fc948c9f1ba18c61c6bbd8ca347842f44e5e6b40 fix: disable automatic XMCL account login
170d46cbc931199b3e57ebfb2b3929d631773e1b fix: preserve existing server mods on launch
a38c5d97853a3ac973291dca69fa002180aa46a6 fix: open agent dialog without access delay
33e168f6cfa2894de9989f4264f9223b25a01f6f chore(release): version 0.67.1 (#1717)
2dcc7887bc4a3b8739432d9f24e18a6835d2c9c4 refactor: Try improve the resource manage
58fc2c16bb716fd099220493945a6eac7c98411b fix(instance): stabilize peer manifest identity
87c911f67949222143a3f783f7d5abef976f9a4e fix(multiplayer): synchronize LAN sharing state
4ef149440a1a8449df030e55288ec84ce49b043f fix(launch): handle process lifecycle races
81a66ec135acba60910ba5c9ec016ea19cb646df fix(multiplayer): handle shared Together instance joining
ef0e8195f2e1a94c9bb81f61398a015508fe287c chore(release): version 0.67.2 (#1719)
4904f4d8015986e64d7ed0216b1dbc9669b19ede refactor: add skin library and improve skin/cape management for Microsoft accounts (#1712)
3fbc263dae8a9f1df08c1c08095b70996f9264f7 fix: Try fix race of user loading
70839efdee364784410e3c1771d36ffeda4fcbab fix(resource): prevent freezes with large blueprint libraries
2af775e709afb7f606e5ed265b36c02e68e2fb42 fix: Should download resource concurrently
7f1e767840e1a19d036cac1a8a349fa17d70c35c refactor(multiplayer): add billing and support links
c323d5090e2e0b872039589d1fa027549e774513 chore: Fix ui glitch
1027d5f7a804ff34d2a9270e24010d2fb47a0178 feat(telemetry): record terminal multiplayer attempts
21b5dceff7a96416dd7a3b971bbf8c72e5d635b5 chore(release): version 0.67.3
4461f519cb004a16ebf0ae723eca37ae901584cb fix: Fix market link routing and mod dependent detection (#1725)
16b00583fb051ea309a9ec00c5ec84a661990f7f fix: Ensure UserService loads during startup (#1726)
87e2828f19754d9da9f21f1b905bc7090b817901 refactor: Add clear search button (#1727)
b44d689d5cd9b729326aeaf36b2d89afeb830ffc chore(release): version 0.68.0 (#1720)
272af41955370bf36410f1303fa1bcbe613fc593 fix(moddb): download databases from GitHub releases
1b6e3a6b4f410419f54355cbd9cb4a9c6ff5389e refactor: Reduce the resource telemetry
cc8cfa3068c4f707c9a698c1750c1ef536a48476 refactor: Enter mod multi-selection with modifier clicks
03cab6ac01175783e59a542aa4257a47f5c1e4bc fix: Restore mod navigation after collapsing group
79afa235ab83359e6e402be7c6e71f68daa0810c fix: Scope launch readiness to selected instance
923b478f8be2e4e5e9d11f6d44a3d87c5fca9115 fix: P2P should also listen ipv6
c690f4ab7097a4c7da4a5b637ae8fc1e17fdb975 fix: filter non-blueprint files from parsing
4f54edbacc0e29de92ebd170a5fb8bff174feeb1 chore(release): version 0.68.1 (#1733)
a2d9806032dc4f4ad5f566917b9525973e4b8b58 chore: Remove unused keys
60af87f2a85db4160a03e159001e41cce875e7c4 fix: fix the blueprint loading blocking other process
1cdbf880089a72306bed0d20c756062062daee73 fix: recover DPoP authentication from clock skew
4b0a80c6252da833660ace1a3e7f37ecaff07278 feat: correlate runtime telemetry
c4821c82d66886e6e54e1982b022ece516212a75 fix: restore world previews
328f6e0f0cd3e92d6aeff4d6a3931799800bce1a fix: restore navigation for omitted market item
30b9f92441064ef972ff8798a4d157170515f149 feat: support grouping resource and shader packs
24f2d7ed6056e8843c53a5d328902c5572c74992 fix: recover Forge installs from stale outputs
b4ccd5d6a2ca21debbbbbe6dc3b3169d842dd929 fix: stabilize core tests on Node 22
d2fa856efc3de3a0096671a27e5e45ae8116b0ff Save uncommitted changes
06df494e6264ef29168f5769971e05117380f2d3 feat: allow customizing, hiding, restoring and reordering cards in focus mode (#1745)
df78c00fc8569012695e285c46569e68bd76b109 fix(instance): make installation progressive and resumable
f4bad38f6e8f153e131c75541a0ab7625b183518 Merge remote-tracking branch 'origin/master' into master
2b250206dc2ffb6bb326aa636f1e0f100d4d0e87 chore(release): version 0.69.0 (#1735)
ea06ca1de6ba41e0d8bfc94fb623ac274dd726e3 test(e2e): retain packaged boot diagnostics
4d5edd7457dc17f8d760d595a4d80e690aaa0599 test(e2e): trace packaged renderer attachment
33bcfe9e2016ed9201a7fcf3ba05dc62fc00357a fix(e2e): install recorder before launching Electron
368afcb84e17e4b8a5ca38b423b5295f189ae4ae feat(ui): enhance help walkthroughs with driver.js and add full multi-language translations (#1751)
d20b01f68ebf6ad6b778220d5025354a70df166e fix: handle EXDEV in installer and atomic persistence (#1754)
acc105b0f30bdf4a35e2b995536d8175749230be chore(deps): consolidate dependency upgrades
049f78ecfa5c51338ff7e252d0bb10c791c538e4 fix: attempt to preserve GTNH Prism Java compatibility (#1759)
62d2296bd8f5bc81e433f28583c98af3426b991e feat(deskgap): add Windows host and single-EXE preview releases (#1758)
1ecf5b26bb3c24bcd9e58c10baa125f5520cd667 feat: improve Agent observability
9b20a5b8161c6cfd0be857200c5941fec04f015e fix: correct modpack store sorting and localize popularity
9f1354bd6dc74e76ef9eebcb6a424f48bf3ca064 chore(release): version 0.70.0
d16ecd38e09fc0d317e37ef8b874b99999c8e759 fix(ui): correct misspelled word (#1762)
32580ef7b50c83baaf238bd412b687b545921165 feat: sync launcher language to minecraft game settings (#1757)
74e2dc900806052ec413b101797f34b230d97c62 feat(ui): redesign P2P multiplayer login dialog with modern glassmorphism and brand provider styles (#1768)
28eb066f349802814d48474ec33d2b66b8ac8885 fix: fix blueprint selection error and improve 3D preview and textures (#1770)
10cae66869efeaefddf306d621ad6a67c7568aff feat: add import modpack via URL. (Source: ALL ) (#1686)
938d90df04edfe7ca7c9ab7e3cf3d3c6d2061957 feat(tasks): add item icons and detailed progress reporting
01784071376452904890ef361310b4447ed320d5 fix(market): keep installed resource versions in sync
b2f0461833138b2f5cd9bd7aec67250054682728 fix(saves): persist data pack origins and refresh save state
3b5a04618a06e24837112e47e8cb5236102aeb06 feat(instances): improve deletion confirmation and feedback
5c9bfcbb689bf2d151e59e82a43bf097008a4670 feat(saves): add progress, advancements, and quest viewers
b0ead0103652f67481571dc45e73faf9325e55ff chore(deps): update smol-toml to 1.7.1
65132847738d7e3069c5e1298111e0d2e92cf53e chore(deps): update markdown-it to 14.3.1
c8cf7c9d214f92db1baaad7d8e5cfb298434ff9c chore(deps-dev): update Electron to 43.5.0
894a6e64fb4f537deca6c38f3d6bf13d0e78b5cc fix: resolve Windows server service paths and await elevation
cfba8b4dbb790bc825735d693b3da1f8affb454e fix: detect Adoptium Java and expose manual imports
a0c8c5fc565250682c3e2395bde1b19b9e3efc2e test: cover animated GIF instance icons (#1781)
49c43133cc1e3d481dd2655425b9af7e0274c139 fix: honor disabled range splitting for database downloads
57b8316596489dbd5e5a68cfc20162b88b3607da chore: merge origin/master into master
4e712f90cb485a79e7c12ec73f88673e9be330ef fix: declare macOS local network usage
a5a8fa82fb3aa42ae4542ad612e920ab6dc117fe fix: bound auth retries and telemetry overhead (#1780)
bd872b19125803b4399933095fe2a51417b56699 fix: keep save progress regex ASCII for DeskGap packaging
280206053e9644d2089ec92a89fb44b6cf6db6ab chore(release): version 0.71.0
5450e271c08159ada3e4f0699a4a592e258038e6 fix: configure Linux sandbox during package installation
064ee9d64c1893bf5e117fc5c5fdf8408d1700cd fix: lower Unicode property regex for DeskGap runtime
c723e1e3c9c25f363ec9188f47182d7b457df3d9 fix: use thumbnails for CurseForge modpack icons
0379941d1997e92b079fdc21e8692c8e45cd8cd7 fix(installer): avoid treating processor output directories as files
```

### C. Archivos resultantes distintos de upstream (personalizaciones, datos y documentación)

```text
M	.github/signpath/deskgap-exe.xml
M	.github/workflows/build.yml
D	.github/workflows/deploy-release.yml
D	.github/workflows/deploy-ui.yml
M	.github/workflows/sign-release.yml
D	.github/workflows/validate.yml
A	PbtModLauncherX-Data/Modificaciones/AUDITORIA-v1.0.7.md
A	PbtModLauncherX-Data/Modificaciones/Registro-Archivos.txt
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
M	deskgap-app/packaging.test.ts
M	deskgap-app/packaging.ts
M	deskgap-app/releaseWorkflow.test.ts
M	deskgap-app/src/controller.ts
M	deskgap-app/src/launcherApp.ts
M	deskgap-app/src/main.ts
M	deskgap-app/src/updateFeed.test.ts
M	deskgap-app/src/updateFeed.ts
M	deskgap-app/src/updater.test.ts
M	deskgap-app/src/updaterHost.ts
A	latest_version.json
M	package.json
D	xmcl-electron-app/CHANGELOG.legacy.md
M	xmcl-electron-app/build.ts
A	xmcl-electron-app/build.ts.bak
M	xmcl-electron-app/build/appinstaller-builder.ts
A	xmcl-electron-app/build/appinstaller-builder.ts.bak
M	xmcl-electron-app/build/appxmanifest.xml
M	xmcl-electron-app/build/electron-builder.config.ts
A	xmcl-electron-app/build/electron-builder.config.ts.bak
M	xmcl-electron-app/build/linux/after-install.tpl
M	xmcl-electron-app/build/linux/after-remove.tpl
M	xmcl-electron-app/build/linux/apparmor-profile.tpl
M	xmcl-electron-app/dev.ts
A	xmcl-electron-app/dev.ts.bak
A	xmcl-electron-app/esbuild.config.ts.bak
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
A	xmcl-electron-app/main/constant.ts.bak
M	xmcl-electron-app/main/controllers/notification.ts
A	xmcl-electron-app/main/controllers/tray.ts.bak
M	xmcl-electron-app/main/defaultApp.ts
A	xmcl-electron-app/main/defaultApp.ts.bak
M	xmcl-electron-app/main/definedLocales.ts
M	xmcl-electron-app/main/index.dev.ts
A	xmcl-electron-app/main/locales/ca.yaml
M	xmcl-electron-app/main/locales/en.yaml
M	xmcl-electron-app/main/utils/updater.ts
A	xmcl-electron-app/main/utils/updater.ts.bak
A	xmcl-electron-app/main/utils/updater.ts.old
M	xmcl-electron-app/package.json
A	xmcl-electron-app/package.json.bak
M	xmcl-electron-app/postinstall.ts
A	xmcl-electron-app/postinstall.ts.bak
A	xmcl-keystone-ui/locales/ca.yaml
M	xmcl-keystone-ui/locales/en.yaml
M	xmcl-keystone-ui/locales/es-ES.yaml
M	xmcl-keystone-ui/package.json
A	xmcl-keystone-ui/src/assets/pbtmodlauncherx.png
M	xmcl-keystone-ui/src/browser.html
M	xmcl-keystone-ui/src/components/UserLoginForm.vue
M	xmcl-keystone-ui/src/composables/login.ts
M	xmcl-keystone-ui/src/composables/tutorial.ts
M	xmcl-keystone-ui/src/composables/user.test.ts
M	xmcl-keystone-ui/src/composables/user.ts
M	xmcl-keystone-ui/src/global.d.ts
M	xmcl-keystone-ui/src/i18n.ts
M	xmcl-keystone-ui/src/index.html
A	xmcl-keystone-ui/src/multiplayer.html
M	xmcl-keystone-ui/src/views/AppSystemBar.vue
A	xmcl-keystone-ui/src/views/AppSystemBar.vue.bak
A	xmcl-keystone-ui/src/views/BaseSetting.vue.bak
A	xmcl-keystone-ui/src/views/Me.vue.bak
A	xmcl-keystone-ui/src/views/Mod.vue.bak
A	xmcl-keystone-ui/src/views/Multiplayer.vue.bak
M	xmcl-keystone-ui/src/views/Setting.vue
A	xmcl-keystone-ui/src/views/StoreEntry.vue.bak
M	xmcl-keystone-ui/src/windows/browser/AppCard.vue
M	xmcl-keystone-ui/src/windows/main/App.vue
M	xmcl-keystone-ui/src/windows/main/Context.ts
A	xmcl-runtime-api/docs/GETTING_STARTED_ru.md
A	xmcl-runtime-api/docs/GETTING_STARTED_ua.md
M	xmcl-runtime/constant.ts
M	xmcl-runtime/global.d.ts
M	xmcl-runtime/launch/LaunchService.ts
M	xmcl-runtime/presence/PresenceService.ts
```

### D. Las 585 rutas en conflicto y su resolución final

Histórico idéntico = contenido local igual al upstream auxiliar 7d2d8b8e. Diferente = revisión semántica descrita en el cuerpo del informe. Retirado/trasladado = discrepancia de presencia o ubicación.

| Ruta | Clasificación inicial | Resultado confirmado |
| --- | --- | --- |
| `.github/workflows/build.yml` | Diferente | Adaptación Pbt sobre arquitectura actual / documentación propia |
| `.github/workflows/deploy-release.yml` | Retirado/trasladado | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `.github/workflows/deploy-ui.yml` | Retirado/trasladado | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `.github/workflows/validate.yml` | Retirado/trasladado | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `.vscode/extensions.json` | Retirado/trasladado | Implementación upstream actual |
| `.vscode/launch.json` | Retirado/trasladado | Implementación upstream actual |
| `.vscode/settings.json` | Retirado/trasladado | Implementación upstream actual |
| `.vscode/tasks.json` | Retirado/trasladado | Implementación upstream actual |
| `.vscode/vue.code-snippets` | Retirado/trasladado | Implementación upstream actual |
| `CODE_OF_CONDUCT.md` | Retirado/trasladado | Implementación upstream actual |
| `CONTRIBUTING.md` | Retirado/trasladado | Implementación upstream actual |
| `README.md` | Diferente | Adaptación Pbt sobre arquitectura actual / documentación propia |
| `assets/locales.json` | Diferente | Adaptación Pbt sobre arquitectura actual / documentación propia |
| `i18n/CONTRIBUTING.i18n.md` | Retirado/trasladado | Implementación upstream actual |
| `i18n/CONTRIBUTING.zh.md` | Retirado/trasladado | Implementación upstream actual |
| `i18n/README.uk.md` | Retirado/trasladado | Implementación upstream actual |
| `i18n/README.zh.md` | Retirado/trasladado | Implementación upstream actual |
| `package.json` | Diferente | Adaptación Pbt sobre arquitectura actual / documentación propia |
| `packages/resource/core/sqlHelper.ts` | Retirado/trasladado | Implementación upstream actual |
| `packages/resource/parsers/mmcModpack.ts` | Retirado/trasladado | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `packages/resource/parsers/neoforgeMod.ts` | Retirado/trasladado | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `packages/resource/schema.ts` | Retirado/trasladado | Implementación upstream actual |
| `packages/utils/AggregatorExecutor.ts` | Retirado/trasladado | Implementación upstream actual |
| `pnpm-lock.yaml` | Diferente | Implementación upstream actual |
| `xmcl-electron-app/build.ts` | Diferente | Adaptación Pbt sobre arquitectura actual / documentación propia |
| `xmcl-electron-app/build/appinstaller-builder.ts` | Diferente | Adaptación Pbt sobre arquitectura actual / documentación propia |
| `xmcl-electron-app/build/electron-builder.config.ts` | Diferente | Adaptación Pbt sobre arquitectura actual / documentación propia |
| `xmcl-electron-app/esbuild.config.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-electron-app/main/ElectronController.ts` | Diferente | Implementación upstream actual |
| `xmcl-electron-app/main/ElectronLauncherApp.ts` | Diferente | Implementación upstream actual |
| `xmcl-electron-app/main/ElectronSecretStorage.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-electron-app/main/ElectronSession.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-electron-app/main/controllers/gameLaunch.ts` | Diferente | Implementación upstream actual |
| `xmcl-electron-app/main/controllers/notification.ts` | Diferente | Adaptación Pbt sobre arquitectura actual / documentación propia |
| `xmcl-electron-app/main/controllers/optifine.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-electron-app/main/controllers/tray.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-electron-app/main/controllers/windowController.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-electron-app/main/defaultApp.ts` | Histórico idéntico | Adaptación Pbt sobre arquitectura actual / documentación propia |
| `xmcl-electron-app/main/definedPlugins.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-electron-app/main/definedServices.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-electron-app/main/index.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-electron-app/main/locales/de.yaml` | Retirado/trasladado | Implementación upstream actual |
| `xmcl-electron-app/main/locales/en.yaml` | Diferente | Adaptación Pbt sobre arquitectura actual / documentación propia |
| `xmcl-electron-app/main/locales/fr.yaml` | Retirado/trasladado | Implementación upstream actual |
| `xmcl-electron-app/main/locales/gl.yaml` | Retirado/trasladado | Implementación upstream actual |
| `xmcl-electron-app/main/locales/nl.yaml` | Retirado/trasladado | Implementación upstream actual |
| `xmcl-electron-app/main/locales/ru.yaml` | Retirado/trasladado | Implementación upstream actual |
| `xmcl-electron-app/main/locales/uk.yaml` | Retirado/trasladado | Implementación upstream actual |
| `xmcl-electron-app/main/locales/zh-CN.yaml` | Retirado/trasladado | Implementación upstream actual |
| `xmcl-electron-app/main/locales/zh-TW.yaml` | Retirado/trasladado | Implementación upstream actual |
| `xmcl-electron-app/main/pluginAutoUpdate.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-electron-app/main/pluginNvdiaGPULinux.ts` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-electron-app/main/utils/login.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-electron-app/main/utils/updater.ts` | Diferente | Adaptación Pbt sobre arquitectura actual / documentación propia |
| `xmcl-electron-app/main/utils/windowSizeTracker.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-electron-app/package.json` | Diferente | Adaptación Pbt sobre arquitectura actual / documentación propia |
| `xmcl-electron-app/plugins/esbuild.elevate.plugin.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-electron-app/plugins/esbuild.native.plugin.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-electron-app/plugins/esbuild.node.plugin.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-electron-app/plugins/esbuild.worker.plugin.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-electron-app/postinstall.ts` | Diferente | Adaptación Pbt sobre arquitectura actual / documentación propia |
| `xmcl-electron-app/preload/controller.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-electron-app/preload/migration.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-electron-app/preload/optifine.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-electron-app/preload/service.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/.eslintrc-auto-import.json` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/locales/de.yaml` | Retirado/trasladado | Implementación upstream actual |
| `xmcl-keystone-ui/locales/en.yaml` | Diferente | Adaptación Pbt sobre arquitectura actual / documentación propia |
| `xmcl-keystone-ui/locales/es-ES.yaml` | Diferente | Adaptación Pbt sobre arquitectura actual / documentación propia |
| `xmcl-keystone-ui/locales/fr.yaml` | Retirado/trasladado | Implementación upstream actual |
| `xmcl-keystone-ui/locales/gl.yaml` | Retirado/trasladado | Implementación upstream actual |
| `xmcl-keystone-ui/locales/ru.yaml` | Retirado/trasladado | Implementación upstream actual |
| `xmcl-keystone-ui/locales/uk.yaml` | Retirado/trasladado | Implementación upstream actual |
| `xmcl-keystone-ui/locales/zh-CN.yaml` | Retirado/trasladado | Implementación upstream actual |
| `xmcl-keystone-ui/locales/zh-TW.yaml` | Retirado/trasladado | Implementación upstream actual |
| `xmcl-keystone-ui/package.json` | Diferente | Adaptación Pbt sobre arquitectura actual / documentación propia |
| `xmcl-keystone-ui/src/app.html` | Diferente | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-keystone-ui/src/assets/common.css` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/assets/google.font.css` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/auto-imports.d.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/components/AppAudioPlayer.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/components/AppChangeInstanceIconCard.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/components/AppCollectionList.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/components/AppCopyChip.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/components/AppSharedTooltip.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/components/AppSystemBarBadge.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/components/AvatarItem.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/components/CurseforgeCategoryChip.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/components/EnvVarAddItem.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/components/EnvVarTableItem.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/components/FeedbackCard.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/components/GalleryGrid.vue` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-keystone-ui/src/components/Hint.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/components/HomeCard.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/components/InstanceItem.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/components/InstanceManifestFileItem.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/components/InstanceManifestFileTree.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/components/InstanceSelectMenu.vue` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-keystone-ui/src/components/LogView.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/components/MarketBase.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/components/MarketItem.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/components/MarketProjectDetail.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/components/MarketProjectDetailCurseforge.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/components/MarketProjectDetailModrinth.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/components/MarketProjectDetailVersion.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/components/MarketTextField.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/components/MarketTextFieldWithMenu.vue` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-keystone-ui/src/components/ModrinthCategoryChip.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/components/PlayerAvatar.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/components/SettingHeader.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/components/SettingItem.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/components/SettingItemCheckbox.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/components/SettingItemSelect.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/components/SimpleDialog.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/components/StepChoice.vue` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-keystone-ui/src/components/StepConfig.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/components/StepManualFTB.vue` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-keystone-ui/src/components/StepSelect.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/components/StepServer.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/components/StepTemplate.vue` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-keystone-ui/src/components/StepperAdvanceContent.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/components/StoreExploreCard.vue` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-keystone-ui/src/components/StoreExploreCategories.vue` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-keystone-ui/src/components/StoreProjectExternal.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/components/StoreProjectGallery.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/components/StoreProjectHeader.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/components/StoreProjectInstallVersionDialog.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/components/StoreProjectInstallVersionDialogVersion.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/components/TaskSpeedMonitor.vue` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-keystone-ui/src/components/UserCard.vue` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-keystone-ui/src/components/UserCardMicrosoft.vue` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-keystone-ui/src/components/UserCardUserItem.vue` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-keystone-ui/src/components/UserCardYggdrasil.vue` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-keystone-ui/src/components/UserLoginAuthoritySelect.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/components/UserLoginForm.vue` | Diferente | Adaptación Pbt sobre arquitectura actual / documentación propia |
| `xmcl-keystone-ui/src/components/UserSkin.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/components/UserSkinImportUrlForm.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/components/halo.glsl` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/appDropHandler.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/cache.ts` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-keystone-ui/src/composables/contextMenu.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/criticalStatus.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/curseforge.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/curseforgeChangelog.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/curseforgeDependencies.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/curseforgeInstaller.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/curseforgeSearch.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/dialog.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/dropHandler.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/error.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/errorHandler.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/exception.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/ftb.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/i18n.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/i18nSearch.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/index.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/instanceContextMenu.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/instanceCreation.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/instanceDefaultSource.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/instanceEdit.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/instanceExport.ts` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-keystone-ui/src/composables/instanceFileNodeData.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/instanceFiles.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/instanceFilesDiagnose.ts` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-keystone-ui/src/composables/instanceGroup.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/instanceJava.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/instanceJavaDiagnose.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/instanceLaunch.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/instanceModLoaderDefault.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/instanceMods.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/instanceResourcePack.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/instanceSave.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/instanceShaderPack.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/instanceTemplates.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/instanceUpdate.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/instanceVersion.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/instanceVersionDiagnose.ts` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-keystone-ui/src/composables/instanceVersionInstall.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/instanceVersionServerInstall.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/instances.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/java.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/launch.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/launchButton.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/launchException.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/launchTask.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/login.ts` | Diferente | Adaptación Pbt sobre arquitectura actual / documentación propia |
| `xmcl-keystone-ui/src/composables/marketCollectionSearch.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/marketSort.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/modContextMenu.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/modDependenciesCheck.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/modGroup.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/modLibCleaner.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/modSearch.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/modUpgrade.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/modWizard.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/modpack.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/modpackInstaller.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/modrinth.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/modrinthAuthenticatedAPI.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/modrinthDependencies.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/modrinthInstaller.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/modrinthProjectDetailData.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/modrinthSearch.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/modrinthVersions.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/peers.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/projectDetail.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/projectInstall.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/protocol.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/query.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/resourcePackSearch.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/savesSearch.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/search.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/serverStatus.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/setting.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/shaderPackSearch.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/sharedTooltip.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/sortBy.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/syncableState.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/task.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/taskManager.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/telemetryTrack.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/textfieldBehavior.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/theme.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/tutorial.ts` | Diferente | Adaptación Pbt sobre arquitectura actual / documentación propia |
| `xmcl-keystone-ui/src/composables/uiLayout.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/useAggregateProjects.ts` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-keystone-ui/src/composables/useSearchPattern.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/user.ts` | Diferente | Adaptación Pbt sobre arquitectura actual / documentación propia |
| `xmcl-keystone-ui/src/composables/userDiagnose.ts` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-keystone-ui/src/composables/version.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/versionLocal.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/composables/vuetify.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/constant.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/directives/sharedTooltip.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/entities/task.ts` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-keystone-ui/src/i18n.ts` | Diferente | Adaptación Pbt sobre arquitectura actual / documentación propia |
| `xmcl-keystone-ui/src/index.html` | Diferente | Adaptación Pbt sobre arquitectura actual / documentación propia |
| `xmcl-keystone-ui/src/staticLocale.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/telemetry.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/util/ReactiveResourceState.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/util/clients.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/util/curseforge.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/util/curseforgeDependencies.ts` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-keystone-ui/src/util/error.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/util/extensionItems.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/util/favicon.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/util/mod.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/util/modCompatible.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/util/modDependencies.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/util/modpackFilesResolver.ts` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-keystone-ui/src/util/modrinth.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/util/search.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/util/swrvGet.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/util/theme.v0.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/util/theme.v1.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/AppAddInstanceDialog.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/AppBackground.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/AppCollectionDialog.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/AppContextMenu.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/AppDropDialog.vue` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-keystone-ui/src/views/AppDropDialogPreview.vue` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-keystone-ui/src/views/AppExportDialog.vue` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-keystone-ui/src/views/AppFeedbackDialog.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/AppGameExitDialog.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/AppInstallSkipDialog.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/AppInstanceDeleteDialog.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/AppLaunchBlockedDialog.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/AppMigrateWizardDialog.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/AppModrinthLoginDialog.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/AppNotifier.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/AppShareInstanceDialog.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/AppSideBar.vue` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-keystone-ui/src/views/AppSideBarContentFocus.vue` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-keystone-ui/src/views/AppSideBarContentNext.vue` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-keystone-ui/src/views/AppSideBarGroupItem.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/AppSideBarGroupItemIndicator.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/AppSideBarGroupSettingDialog.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/AppSideBarInstanceItem.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/AppSystemBar.vue` | Diferente | Adaptación Pbt sobre arquitectura actual / documentación propia |
| `xmcl-keystone-ui/src/views/AppSystemBarUserMenu.vue` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-keystone-ui/src/views/AppTaskDialog.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/AppTaskDialogNodeStatus.vue` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-keystone-ui/src/views/AppTaskDialogTaskView.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/BaseSetting.vue` | Diferente | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/BaseSettingGeneral.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/BaseSettingJava.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/BaseSettingJavaList.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/BaseSettingLaunch.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/BaseSettingResolution.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/BaseSettingVersions.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/Home.vue` | Diferente | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/HomeActions.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/HomeCriticalError.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/HomeDropModpackDialog.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/HomeExtension.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/HomeFocusFooter.vue` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-keystone-ui/src/views/HomeGrid.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/HomeHeader.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/HomeInstanceInstallDialog.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/HomeLaunchButton.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/HomeLaunchButtonMenuList.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/HomeLaunchButtonStatus.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/HomeLaunchButtonStatusItem.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/HomeLaunchStatusDialog.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/HomeLayout.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/HomeLogDialog.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/HomeLogDialogTab.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/HomeModCard.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/HomeResourcePacksCard.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/HomeSavesCard.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/HomeScreenshotCard.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/HomeServerStatusBar.vue` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-keystone-ui/src/views/HomeShaderPackCard.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/HomeSyncButton.vue` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-keystone-ui/src/views/HomeSyncDialogPull.vue` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-keystone-ui/src/views/HomeSyncDialogPush.vue` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-keystone-ui/src/views/HomeUpstreamBase.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/HomeUpstreamCurseforge.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/HomeUpstreamHeader.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/HomeUpstreamModrinth.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/HomeUpstreamVersion.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/InstancesCard.vue` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-keystone-ui/src/views/InstancesCards.vue` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-keystone-ui/src/views/Me.vue` | Diferente | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/Mod.vue` | Diferente | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/ModActions.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/ModDeleteView.vue` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-keystone-ui/src/views/ModDetailOptifine.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/ModDetailResource.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/ModDuplicatedDialog.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/ModExtension.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/ModGroupEntryItem.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/ModHeader.vue` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-keystone-ui/src/views/ModIncompatibileDialog.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/ModItem.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/ModLabels.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/ModOptionsPage.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/Multiplayer.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/MultiplayerDialogInitiate.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/MultiplayerDialogReceive.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/ResourceManageModpack.vue` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-keystone-ui/src/views/ResourceManageVersions.vue` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-keystone-ui/src/views/ResourcePack.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/ResourcePackActions.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/ResourcePackDetailResource.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/ResourcePackExtension.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/ResourcePackItem.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/ResourcePackPreview.vue` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-keystone-ui/src/views/Save.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/SaveActions.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/SaveCard.vue` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-keystone-ui/src/views/SaveDetail.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/SaveExtension.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/SaveItem.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/Setting.vue` | Diferente | Adaptación Pbt sobre arquitectura actual / documentación propia |
| `xmcl-keystone-ui/src/views/SettingAbout.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/SettingAppearance.vue` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-keystone-ui/src/views/SettingAppearanceColor.vue` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-keystone-ui/src/views/SettingGeneral.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/SettingGlobal.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/SettingJavaMemory.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/SettingMigrationDialog.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/SettingNetwork.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/SettingUpdate.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/SettingUpdateInfoDialog.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/SettingYggdrasilServices.vue` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-keystone-ui/src/views/Setup.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/SetupAccount.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/SetupAppearance.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/SetupDataRoot.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/SetupFooter.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/ShaderPack.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/ShaderPackActions.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/ShaderPackDetailResource.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/ShaderPackExtension.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/ShaderPackItem.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/StoreEntry.vue` | Diferente | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/StoreProjectCurseforge.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/views/StoreProjectModrinth.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/vuetify.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/windows/app/App.vue` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-keystone-ui/src/windows/app/Context.ts` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-keystone-ui/src/windows/app/index.ts` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-keystone-ui/src/windows/browser/index.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/windows/logger/App.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/windows/logger/index.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/windows/main/App.vue` | Diferente | Adaptación Pbt sobre arquitectura actual / documentación propia |
| `xmcl-keystone-ui/src/windows/main/Context.ts` | Diferente | Adaptación Pbt sobre arquitectura actual / documentación propia |
| `xmcl-keystone-ui/src/windows/main/index.ts` | Diferente | Implementación upstream actual |
| `xmcl-keystone-ui/src/windows/main/router.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/windows/migration/App.vue` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/src/windows/migration/index.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/uno.config.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-keystone-ui/vite.config.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime-api/docs/GETTING_STARTED_zh copy.md` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-runtime-api/index.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime-api/migration.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime-api/package.json` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime-api/src/controller.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime-api/src/entities/InstanceLockSchema.json` | Diferente | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-runtime-api/src/entities/InstanceSchema.json` | Diferente | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-runtime-api/src/entities/SettingSchema.json` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-runtime-api/src/entities/YggdrasilSchema.json` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-runtime-api/src/entities/exception.ts` | Diferente | Implementación upstream actual |
| `xmcl-runtime-api/src/entities/instance.schema.ts` | Diferente | Implementación upstream actual |
| `xmcl-runtime-api/src/entities/instance.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime-api/src/entities/instanceManifest.schema.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime-api/src/entities/modpack.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime-api/src/entities/resource.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime-api/src/entities/setting.schema.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime-api/src/entities/setting.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime-api/src/entities/user.schema.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime-api/src/entities/version.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime-api/src/entities/yggdrasil.schema.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime-api/src/multiplayer.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime-api/src/services/BaseService.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime-api/src/services/DiagnoseService.ts` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-runtime-api/src/services/ImportService.ts` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-runtime-api/src/services/InstallService.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime-api/src/services/InstanceIOService.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime-api/src/services/InstanceInstallService.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime-api/src/services/InstanceManifestService.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime-api/src/services/InstanceModsGroupService.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime-api/src/services/InstanceModsService.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime-api/src/services/InstanceOptionsService.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime-api/src/services/InstanceResourcePacksService.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime-api/src/services/InstanceSavesService.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime-api/src/services/InstanceServerInfoService.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime-api/src/services/InstanceService.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime-api/src/services/InstanceShaderPacksService.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime-api/src/services/JavaService.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime-api/src/services/LaunchService.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime-api/src/services/ModMetadataService.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime-api/src/services/ModpackService.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime-api/src/services/PeerService.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime-api/src/services/ThemeService.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime-api/src/services/UserService.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime-api/src/services/VersionMetadataService.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime-api/src/services/VersionService.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime-api/src/state.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime-api/src/telemetry.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime-api/src/util/LockKey.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime-api/src/util/SharedState.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime-api/src/util/java.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime-api/src/util/launch.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/app/BaseService.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/app/Host.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/app/LauncherApp.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/app/LauncherAppController.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/app/LauncherAppManager.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/app/migrate.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/app/pluginApiFallback.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/app/pluginCommonProtocol.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/app/pluginMediaProtocol.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/authlibInjector/AuthlibInjectorService.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/constant.ts` | Diferente | Adaptación Pbt sobre arquitectura actual / documentación propia |
| `xmcl-runtime/elyby/ElyByService.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/elyby/elyByPlugin.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/encoding/pluginEncodingWorker.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/flights/index.ts` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-runtime/gfw/gfw.ts` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-runtime/gfw/pluginGFW.ts` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-runtime/global.d.ts` | Diferente | Adaptación Pbt sobre arquitectura actual / documentación propia |
| `xmcl-runtime/import/ImportService.ts` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-runtime/import/sourceControlUrlParser.ts` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-runtime/infra/errors/ErrorDiagnose.ts` | Retirado/trasladado | Implementación upstream actual |
| `xmcl-runtime/infra/errors/ResourceTelemetryClient.ts` | Retirado/trasladado | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-runtime/infra/plugins/image_store.ts` | Retirado/trasladado | Implementación upstream actual |
| `xmcl-runtime/infra/plugins/log_consumer.ts` | Retirado/trasladado | Implementación upstream actual |
| `xmcl-runtime/install/DiagnoseService.ts` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-runtime/install/InstallService.ts` | Diferente | Implementación upstream actual |
| `xmcl-runtime/install/VersionMetadataService.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/install/index.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/instance/InstanceLogService.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/instance/InstanceOptionsService.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/instance/InstanceServerInfoService.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/instance/InstanceService.ts` | Diferente | Implementación upstream actual |
| `xmcl-runtime/instanceIO/InstanceFileDiscover.ts` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-runtime/instanceIO/InstanceFileOperationHandler.ts` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-runtime/instanceIO/InstanceIOService.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/instanceIO/InstanceInstallService.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/instanceIO/InstanceManifestService.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/instanceIO/InstanceUpdateDesign.md` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/instanceIO/ResolveInstanceFileTask.ts` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-runtime/instanceIO/UnzipFileTask.ts` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-runtime/instanceIO/XUpdateService.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/instanceIO/parseModrinthInstance.ts` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-runtime/instanceIO/parseMultiMCInstance.ts` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-runtime/instanceIO/parseVanillaInstance.ts` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-runtime/java/JavaService.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/java/detectJVMArch.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/java/installDefaultJava.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/java/java.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/java/javaPaths.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/java/zulu.json` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/java/zulu.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/launch/LaunchMiddleware.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/launch/LaunchService.ts` | Diferente | Adaptación Pbt sobre arquitectura actual / documentación propia |
| `xmcl-runtime/launch/pluginLaunchPrecheck.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/logger/logger.ts` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-runtime/market/index.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/market/marketProvider.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/market/pluginMarketProvider.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/mod/InstanceModsService.ts` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-runtime/mod/index.ts` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-runtime/moddb/ModMetadataService.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/moddb/ProjectMappingService.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/modpack/ModpackService.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/modpack/pluginCurseforgeModpackHandler.ts` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-runtime/modpack/pluginModrinthModpackHandler.ts` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-runtime/modpack/utils/mcbbsHandler.ts` | Retirado/trasladado | Implementación upstream actual |
| `xmcl-runtime/nativeReplacer/pluginNativeReplacer.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/network/dispatchers/ErrorDecorateHandler.ts` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-runtime/network/dispatchers/NetworkAgent.ts` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-runtime/network/dispatchers/dispatcher.ts` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-runtime/network/dnsServers.ts` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-runtime/network/index.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/network/networkInterface.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/network/pluginNetworkInterface.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/package.json` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/peer/PeerHost.ts` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-runtime/peer/PeerService.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/peer/connection.ts` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-runtime/peer/mapAndGetPortCanidate.ts` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-runtime/peer/messages/download.ts` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-runtime/peer/messages/heartbeat.ts` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-runtime/peer/messages/identity.ts` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-runtime/peer/messages/lan.ts` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-runtime/presence/PresenceService.ts` | Diferente | Adaptación Pbt sobre arquitectura actual / documentación propia |
| `xmcl-runtime/resource/core/ResourceContext.ts` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-runtime/resource/core/createResourceContext.ts` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-runtime/resource/core/generateResource.ts` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-runtime/resource/core/hashResource.ts` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-runtime/resource/core/helper.ts` | Retirado/trasladado | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-runtime/resource/core/migrateResources.ts` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-runtime/resource/core/parseMetadata.ts` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-runtime/resource/core/pathUtils.ts` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-runtime/resource/core/upsertMetadata.ts` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-runtime/resource/index.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/resource/parsers/index.ts` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-runtime/resource/pluginResourceWorker.ts` | Diferente | Implementación upstream actual |
| `xmcl-runtime/resource/resource.worker.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/resource/worker.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/resourcePack/InstanceResourcePacksService.ts` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-runtime/resourcePack/ResourcePackPreviewService.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/resourcePack/index.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/resourcePack/pluginResourcePackLink.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/save/InstanceSavesService.ts` | Diferente | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-runtime/save/save.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/service/Service.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/service/ServiceStateContainer.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/service/ServiceStateManager.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/service/pluginServicesHandler.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/settings/pluginSettings.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/setup/pluginSetup.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/setup/setupWorkerEntry.ts` | Diferente | Implementación upstream actual |
| `xmcl-runtime/sql/sqlHelper.ts` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-runtime/task/pluginTasks.ts` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-runtime/telemetry/pluginTelemetry.ts` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-runtime/theme/ThemeService.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/uncaughtError/decorateError.ts` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-runtime/user/NodeSystemOptions.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/user/OfficialUserService.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/user/UserService.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/user/YggdrasilSeriveRegistry.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/user/accountSystems/MicrosoftAccountSystem.ts` | Diferente | Implementación upstream actual |
| `xmcl-runtime/user/accountSystems/MicrosoftOAuthClient.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/user/accountSystems/YggdrasilAccountSystem.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/user/accountSystems/YggdrasilOCIDAuthClient.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/user/index.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/user/pluginModrinthAccess.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/user/pluginOfficialUserApi.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/user/pluginYggdrasilApi.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/user/user.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/util/curseforge.ts` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-runtime/util/error.ts` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-runtime/util/fs.ts` | Diferente | Implementación upstream actual |
| `xmcl-runtime/util/linkResourceFolder.ts` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-runtime/util/object.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/util/persistance.ts` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-runtime/util/serialize.ts` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-runtime/util/validate.ts` | Histórico idéntico | Implementación upstream actual |
| `xmcl-runtime/version/VersionService.ts` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-runtime/worker/helper.ts` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |
| `xmcl-runtime/worker/index.ts` | Histórico idéntico | Retirada/traslado conforme a arquitectura actual o política CI Pbt |

### E. Invariantes verificados

- Version oficial 1.0.6; Node >=22.16.0; pnpm 11.10.0.
- Traducciones propias en/es-ES/ca conservadas, con migracion downloadUpdate.name.
- Todos los archivos de idiomas upstream y sus claves en/es-ES estan presentes.
- Branding, Discord, login y tutoriales preservados.
- Updater Pbt sin rutas de actualizacion Voxelum; key de postinstall preservada.
- Workspace packages actual y plugin offline con APIs nuevas.
- Workflow Pbt por tags, nuevas rutas, publicacion dirigida al fork.

### F. Claves catalanas nuevas pendientes

Las claves del upstream nuevo usan fallback inglés hasta su traducción. Se conserva el inventario para preparar esa fase.

```text
AppShareInstanceDialog.editScopeDescription
AppShareInstanceDialog.editScopeTitle
AppShareInstanceDialog.instanceToShare
HomeJavaIssueDialog.optionSwitch.name
HomeJavaIssueDialog.optionSwitch.disabled
HomeJavaIssueDialog.optionSwitch.message
HomeJavaIssueDialog.optionSelectJava.message
HomeJavaIssueDialog.optionSelectJava.name
HomeJavaIssueDialog.recommendedVersionHint
HomeJavaIssueDialog.selectMatchedHint
HomeJavaIssueDialog.selectSecondaryHint
agent.accessRequiredHint
agent.abort
agent.confirmAccept
agent.confirmAllowAll
agent.confirmCancel
agent.confirmPending
agent.confirmTitle
agent.errorTitle
agent.subscribeXmcl
agent.passiveGameCrashed
agent.passiveGameExitCode
agent.passiveGameExited
agent.passiveGameExitSignal
agent.passiveGameExitSummary
agent.passiveGameExitUnknown
agent.reasoning
agent.passiveGameStarted
agent.passiveGameStartedSummary
agent.passiveModDiagnosis
agent.passiveModDiagnosisError
agent.passiveModDiagnosisSummary
agent.passiveModDuplicate
agent.passiveModInstalled
agent.toolArguments
agent.toolResult
agent.toolRunning
agent.marketConfirmMessage
agent.marketConfirmTarget
agent.marketConfirmTitle
agent.marketInstall
agent.marketInstalled
agent.marketInstallFailed
agent.marketType.datapack
agent.marketType.mod
agent.marketType.modpack
agent.marketType.resourcepack
agent.marketType.shader
agent.marketResultCount
bedrock.description
bedrock.install
bedrock.installFailed
bedrock.installed
bedrock.launchHint
bedrock.installBedrockVersion
bedrock.licenseRequired
bedrock.refresh
bedrock.versionsTitle
bedrock.versionsHint
bedrock.versionsError
bedrock.channel
bedrock.channelRelease
bedrock.channelBeta
bedrock.channelPreview
bedrock.active
bedrock.play
bedrock.download
bedrock.installedTag
bedrock.developerModeRequired
bedrock.enableDeveloperMode
bedrock.enableDeveloperModeFailed
bedrock.downloadFailed
bedrock.launchFailed
bedrock.removeFailed
baseSetting.info.address
baseSetting.info.changes
baseSetting.info.custom
baseSetting.info.disabled
baseSetting.info.enabled
baseSetting.info.exportFormats
baseSetting.info.inherited
baseSetting.info.modLoader
baseSetting.info.notConfigured
baseSetting.info.notSet
baseSetting.info.offline
baseSetting.info.projectId
baseSetting.info.running
baseSetting.info.saved
baseSetting.info.status
baseSetting.info.stopped
baseSetting.info.vanilla
curseforge.category
curseforge.createdDate
curseforge.lastUpdate
curseforge.releasedDate
curseforge.authors
curseforge.downloadOnly
curseforge.file.gameVersion
curseforge.file.modLoader
curseforge.installTo
curseforge.installToStorage
curseforge.project.description
curseforge.project.files
curseforge.project.images
curseforge.recentFiles
curseforge.totalDownloads
dependencies.dependents
diagnosis.unresolvedFiles.description
diagnosis.unresolvedFiles.title
diagnosis.unzipFileNotFound.description
diagnosis.unzipFileNotFound.title
diagnosis.missingVersionJar.message
diagnosis.missingVersionJar.name
errors.bedrockUnsupportedPlatform
errors.bedrockNotInstalled
errors.bedrockLaunchFailed
errors.bedrockInstallFailed
errors.bedrockDownloadUrlUnavailable
errors.bedrockDeveloperModeRequired
errors.bedrockRegisterFailed
errors.bedrockVersionNotFound
errors.BadForgeInstallerJarError
errors.BadInstanceType
errors.BodyTimeoutError
errors.ChecksumNotMatchError
errors.ConnectTimeoutError
errors.CorruptedResourceMetadata
errors.DNSNotFoundError
errors.DownloadAggregateError
errors.DownloadFileSystemError
errors.HeadersTimeoutError
errors.InstallBackendUnresponsive.body
errors.InstallBackendUnresponsive.title
errors.InstallInstructionFailed.body
errors.InstallInstructionFailed.title
errors.InstallNetworkError.body
errors.InstallNetworkError.title
errors.InstallPermissionDenied.body
errors.InstallPermissionDenied.title
errors.SocketError
commandPalette.hintAskAgent
feedback.generateReport
feedback.generateSaveAs
feedback.hint
feedback.reddit
feedback.redditDescription
fileDetail.filesize
importModpack.fromFileSubtitle
importModpack.fromUrl
importModpack.fromUrlSubtitle
importModpack.fromUrlDescription
importModpack.invalidUrl
importModpack.selectVersion
importModpack.selectVersionDescription
importModpack.pmcProtected
importModpack.netdiskTitle
importModpack.netdiskDescription
importModpack.openNetdisk
importModpack.netdiskOpened
importModpack.noReleasesFound
instance.contents
instance.deleteFile
instance.deleteHintBedrock
instance.envVarKey
instance.envVarKeyPlaceholder
instance.envVarValue
instance.envVarValuePlaceholder
instance.fileApiPlaceholder
instance.monitor
instance.monitorDefault
instance.monitorNumber
instance.monitorPrimary
instance.hideCard
instance.moveToTop
instance.nameInvalidChars
instance.nameNoCyrillic
instance.namePathTraversal
instance.nameReservedName
instance.nameTrailingDotOrSpace
instance.nameWhitespaceOnly
instance.preExecCommand
instance.preExecCommandHint
instance.showHiddenCards
instance.updates
instance.resolutionEnabled
instanceSetting.disableAuthlibInjector
instanceSetting.disableAuthlibInjectorDescription
instanceSetting.disableElyByAuthlib
instanceSetting.disableElyByAuthlibDescription
instanceSetting.fastLaunch
instanceSetting.fastLaunchHint
instanceSetting.hideLauncher
instanceSetting.icon
instanceSetting.showLog
instanceSetting.showLogHint
instanceSetting.syncGameLanguage
instanceSetting.syncGameLanguageDescription
instanceUpdate.noFiles
instances.instanceCount
instances.addCurseForgeDescription
instances.addPrismDescription
instances.edition
instances.editionJava
instances.editionBedrock
instances.editionBedrockHint
instances.editionBedrockWindowsOnly
instances.folder
instances.linkSharedFolders
instances.linkSharedFoldersHint
instances.linkFailed
java.allocatedLong
java.allocatedShort
java.allocation
java.autoHint
java.change
java.importFromFile
java.invalid
java.location
java.locationHint
java.memory
java.memoryAuto
java.memoryManual
java.memoryUnassigned
java.name
java.noMemory
java.openFolder
java.presets
java.refresh
java.systemMemory
java.browse
java.modifyInstance
launch.forceKill
launch.launchAs
launch.launchTo
launchBlocked.launchLinuxDisplayUnavailable.environmentMissing
launchBlocked.launchLinuxDisplayUnavailable.noGraphicalSession
launchBlocked.launchLinuxDisplayUnavailable.sandboxDenied
launchBlocked.launchLinuxDisplayUnavailable.title
launchBlocked.launchLinuxDisplayUnavailable.xwaylandMissing
launchBlocked.launchLinuxDisplayUnavailable.xwaylandNotRunning
launchFailed.elyByAuthlib.description
launchFailed.elyByAuthlib.suggestion
launchFailed.elyByAuthlib.title
launchStatus.elyByWarning
launcherUpdate.updateToThisVersion
localVersion.auto
localVersion.empty
localVersion.hint
localVersion.reinstallDescription
localVersion.reinstallTitle
localVersion.delete
localVersion.deleteDescription
localVersion.refresh
login.dropHint
login.forgetPassword
login.login
login.manualLoginUrl
login.signup
login.signupDescription
login.userRelogin
loginError.loginCanceled
loginError.cyrillicNotAllowed
loginError.illegalOfflineUsername
loginError.loginMinecraftByXboxRateLimited
loginError.loginMinecraftByXboxRateLimitedWithRetry
loginError.loginMinecraftByXboxServerError
loginError.loginMinecraftByXboxStatus
loginError.loginXboxAdultVerification
loginError.loginXboxAgeRestricted
loginError.loginXboxBadXsts
loginError.loginXboxBanned
loginError.loginXboxChildAccount
loginError.loginXboxFailedWithCode
loginError.loginXboxNoXboxProfile
loginError.loginXboxRegionLocked
loginError.noProfileForNewUser
loginError.xboxErrorGuideHint
loginError.openLoginGuide
loginError.openDiscordSupport
logsCrashes.failures
logsCrashes.serverLogs
logsCrashes.showFile
me.groupByDate
me.groupByFolder
me.instanceViewMode
me.listView
xmclAccount.accountSummary
xmclAccount.confirmMerge
xmclAccount.createdAt
xmclAccount.description
xmclAccount.expiresAt
xmclAccount.gameAccountsSeparate
xmclAccount.guest
xmclAccount.identityConflict
xmclAccount.linkAccountWith
xmclAccount.mergePreview
xmclAccount.mergeNeedsSession
xmclAccount.mergeQueued
xmclAccount.requestFailed
xmclAccount.reviewMerge
xmclAccount.session
xmclAccount.sessionActive
xmclAccount.sessionExpired
xmclAccount.signOutAll
xmclAccount.signOutDevice
xmclAccount.status.active
xmclAccount.status.deleted
xmclAccount.status.deletion_pending
xmclAccount.status.merged
xmclAccount.title
minecraftFriends.errors.friendsDisabled
minecraftFriends.errors.invalidName
minecraftVersion.all
mod.createGroup
mod.description
mod.disableAll
mod.enableAll
mod.group
mod.hideInstalled
mod.installedFilterOff
mod.groupName
mod.groupNameRequired
mod.newFolder
mod.noGroupsFound
mod.noGroupsYet
mod.searchGroups
mod.searchOnMcWiki
mod.selectOrCreateGroup
modInstall.autoUpgrade.description
modInstall.autoUpgrade.no
modInstall.autoUpgrade.title
modInstall.autoUpgrade.yes
modInstall.releaseOnly
modInstall.scanUnusedLibraries
modUpgradePolicy.curseforge
modUpgradePolicy.curseforgeOnly
modUpgradePolicy.modrinth
modUpgradePolicy.modrinthOnly
modUpgradePolicy.name
modpack.exportDirectory
modpack.exportDirectoryDescription
modpack.modrinthProject
modpack.selectDefaultFiles
modpack.bindProject
modpack.bindProjectHint
modpack.bindProjectTypeImmutableHint
modpack.bindProjectNoProjects
modpack.unbindProject
modpack.unbindProjectConfirmTitle
modpack.unbindProjectConfirmMessage
modpack.editProject
modpack.projectDiscovery
modpack.projectGallery
modpack.projectGalleryAdd
modpack.projectGalleryEmpty
modpack.projectGalleryFeatured
modpack.projectGalleryFromScreenshots
modpack.projectGalleryHint
modpack.projectGallerySelectScreenshot
modpack.projectIdentity
modpack.projectLinks
modpack.projectLoadFailed
modpack.projectNoChanges
modpack.projectNotBound
modpack.projectNotBoundHint
modpack.projectUnsavedChanges
modpack.projectLatestDraft
modpack.projectVersions
modpack.publish
modpack.publishCategories
modpack.publishChannel
modpack.publishChangelog
modpack.publishChangelogGenerate
modpack.publishConfirmProjectChanges
modpack.publishCreateProject
modpack.publishCreateDraft
modpack.publishCustomVersion
modpack.publishDescription
modpack.publishDiscordUrl
modpack.publishDraftCreated
modpack.publishSubmitted
modpack.publishExistingProject
modpack.publishIcon
modpack.publishIconHint
modpack.publishIconKeep
modpack.publishIconUseInstance
modpack.publishIssuesUrl
modpack.publishLicense
modpack.publishLogin
modpack.publishFiles
modpack.publishLinkageSummary
modpack.publishLinkageEmbeddedSummary
modpack.publishLinkageShowFiles
modpack.publishLinkageReason.missing-file
modpack.publishLinkageReason.not-linked-to-modrinth
modpack.publishLinkageReason.no-downloadable-url
modpack.publishModrinth
modpack.publishNewProject
modpack.publishOpenProject
modpack.publishOpenVersion
modpack.publishProfile
modpack.publishProfileClient
modpack.publishProfileServer
modpack.publishProfileSplit
modpack.publishProfileUniversal
modpack.publishProject
modpack.publishProjectDetailsTab
modpack.publishProjectName
modpack.publishProjectRequired
modpack.publishProjectSlug
modpack.publishProjectUrl
modpack.publishProjectUrlHint
modpack.publishProjectSaved
modpack.publishSourceUrl
modpack.publishSubmit
modpack.publishSummary
modpack.publishSummaryMinWords
modpack.publishVersionTitle
modpack.publishVersionTab
modpack.publishVersion
modpack.publishVisibility
modpack.publishWikiUrl
modpack.visibilityPrivate
modpack.visibilityPublic
modpack.visibilityUnlisted
modpackUpdateOrCreate.createNew
modpackUpdateOrCreate.description
modpackUpdateOrCreate.title
modpackUpdateOrCreate.update
modrinth.browseUrl
modrinth.categories.128x
modrinth.categories.16x
modrinth.categories.256x
modrinth.categories.32x
modrinth.categories.48x
modrinth.categories.512x+
modrinth.categories.64x
modrinth.categories.8x-
modrinth.categories.adventure
modrinth.categories.atmosphere
modrinth.categories.audio
modrinth.categories.blocks
modrinth.categories.bloom
modrinth.categories.bukkit
modrinth.categories.bungeecord
modrinth.categories.canvas
modrinth.categories.cartoon
modrinth.categories.categories
modrinth.categories.challenging
modrinth.categories.colored-lighting
modrinth.categories.combat
modrinth.categories.core-shaders
modrinth.categories.cursed
modrinth.categories.datapack
modrinth.categories.decoration
modrinth.categories.economy
modrinth.categories.entities
modrinth.categories.environment
modrinth.categories.equipment
modrinth.categories.fabric
modrinth.categories.fantasy
modrinth.categories.features
modrinth.categories.folia
modrinth.categories.foliage
modrinth.categories.fonts
modrinth.categories.food
modrinth.categories.forge
modrinth.categories.game-mechanics
modrinth.categories.gui
modrinth.categories.high
modrinth.categories.iris
modrinth.categories.items
modrinth.categories.kitchen-sink
modrinth.categories.library
modrinth.categories.lightweight
modrinth.categories.liteloader
modrinth.categories.locale
modrinth.categories.low
modrinth.categories.magic
modrinth.categories.management
modrinth.categories.medium
modrinth.categories.minecraft
modrinth.categories.minigame
modrinth.categories.misc
modrinth.categories.mobs
modrinth.categories.modded
modrinth.categories.models
modrinth.categories.modloader
modrinth.categories.multiplayer
modrinth.categories.name
modrinth.categories.neoforge
modrinth.categories.optifine
modrinth.categories.optimization
modrinth.categories.paper
modrinth.categories.path-tracing
modrinth.categories.pbr
modrinth.categories.performance impact
modrinth.categories.potato
modrinth.categories.purpur
modrinth.categories.quests
modrinth.categories.quilt
modrinth.categories.realistic
modrinth.categories.reflections
modrinth.categories.resolutions
modrinth.categories.rift
modrinth.categories.screenshot
modrinth.categories.semi-realistic
modrinth.categories.shadows
modrinth.categories.simplistic
modrinth.categories.social
modrinth.categories.spigot
modrinth.categories.sponge
modrinth.categories.storage
modrinth.categories.technology
modrinth.categories.themed
modrinth.categories.transportation
modrinth.categories.tweaks
modrinth.categories.utility
modrinth.categories.vanilla
modrinth.categories.vanilla-like
modrinth.categories.velocity
modrinth.categories.waterfall
modrinth.categories.worldgen
modrinth.clientSide
modrinth.copyTitle
modrinth.createAt
modrinth.createCollection
modrinth.description
modrinth.downloads
modrinth.environments.all
modrinth.environments.default
modrinth.environments.name
modrinth.environments.optional
modrinth.environments.required
modrinth.environments.unsupported
modrinth.environments.client
modrinth.environments.server
modrinth.externalResources
modrinth.featuredVersions
modrinth.followedProjects
modrinth.followers
modrinth.gallery
modrinth.gameVersions.name
modrinth.headers.status
modrinth.headers.support
modrinth.headers.version
modrinth.issueUrl
modrinth.license
modrinth.licenses.name
modrinth.loginHint
modrinth.loginTitle
modrinth.modLoaders.name
modrinth.modpackSource.source
modrinth.projectId
modrinth.projectMembers
modrinth.projectType.datapack
modrinth.projectType.mod
modrinth.projectType.modpack
modrinth.projectType.plugin
modrinth.projectType.resourcepack
modrinth.projectType.shader
modrinth.projectType.name
modrinth.projectType.resourcePack
modrinth.projects
modrinth.serverSide
modrinth.sort.downloads
modrinth.sort.follows
modrinth.sort.newest
modrinth.sort.relevance
modrinth.sort.title
modrinth.sort.updated
modrinth.sourceUrl
modrinth.technicalInformation
modrinth.updateAt
modrinth.versions
modrinth.wikiUrl
modrinth.perPage
modrinth.quickSearch
modrinth.searchText
multiplayer.addFunds
multiplayer.autoShareAmbiguous
multiplayer.availableBalance
multiplayer.balanceHint
multiplayer.billing
multiplayer.billingDescription
multiplayer.billingError
multiplayer.buyTogether
multiplayer.cancelTogether
multiplayer.checkout
multiplayer.complete
multiplayer.confirm
multiplayer.connectionError
multiplayer.connectionFailedHint
multiplayer.connectionTogetherWarning
multiplayer.connectedToMaster
multiplayer.connections
multiplayer.copied
multiplayer.copy
multiplayer.copyGroupToFriendHint
multiplayer.directConnection
multiplayer.copyLocalHint
multiplayer.createLocalToken
multiplayer.currentIpTitle
multiplayer.currentNatTitle
multiplayer.difficultyLevelHint
multiplayer.disconnect
multiplayer.disconnectDescription
multiplayer.disconnected
multiplayer.enterRemoteToken
multiplayer.enterRemoteTokenHint
multiplayer.exposedPortDescription
multiplayer.exposedPorts
multiplayer.gatheringIce
multiplayer.gameAvailable
multiplayer.groupId
multiplayer.master
multiplayer.masterHostsGameHint
multiplayer.masterPurchaseHint
multiplayer.member
multiplayer.illegalTokenDescription
multiplayer.initiateConnection
multiplayer.joinConnection
multiplayer.joinDiscord
multiplayer.joinGame
multiplayer.joinManual
multiplayer.joinOrCreateGroup
multiplayer.joinOrCreateGroupHint
multiplayer.joinCreatesMissingRoomHint
multiplayer.loginRequiredDescription
multiplayer.loginRequiredTitle
multiplayer.kernel
multiplayer.kernelDescription
multiplayer.leaveGroup
multiplayer.localToken
multiplayer.manualConnect
multiplayer.name
multiplayer.natTogetherWarning
multiplayer.openConsumerPortal
multiplayer.refundHint
multiplayer.networkInfo
multiplayer.next
multiplayer.otherExposedPortDescription
multiplayer.placeholder
multiplayer.previous
multiplayer.receiveHint
multiplayer.receiveRemoteTokenHint
multiplayer.remoteToken
multiplayer.relayConnection
multiplayer.routerInfo
multiplayer.sendTokenToRemote
multiplayer.editSharingScope
multiplayer.noRunningInstanceToShare
multiplayer.share
multiplayer.sharing
multiplayer.start
multiplayer.startNewP2PConnection
multiplayer.subscription.active
multiplayer.subscription.cancelled
multiplayer.subscription.payment_due
multiplayer.togetherName
multiplayer.togetherSupportHint
multiplayer.trial.active
multiplayer.trial.available
multiplayer.trial.expired
multiplayer.trial.unavailable
multiplayer.trialDescription
multiplayer.trialTitle
multiplayer.tryTogether
multiplayer.updateSharedInstanceConfirm
multiplayer.updateSharedInstanceDescription
multiplayer.updateSharedInstanceTitle
multiplayer.month
multiplayer.orderStatus
multiplayer.planDescription
multiplayer.relayAllowanceSummary
multiplayer.relayServiceAvailable
multiplayer.waffoHint
multiplayer.waitingForMaster
multiplayer.allowTurn
multiplayer.allowTurnHint
multiplayer.inviteLink
multiplayer.sharingNotificationBody
multiplayer.sharingNotificationTitle
presence.away
presence.offline
presence.online
presence.playing
presence.playingGeneric
blueprint.name
blueprint.count
blueprint.searchLocal
blueprint.searchOnline
blueprint.market
blueprint.local
blueprint.provider
blueprint.import
blueprint.openFolder
blueprint.refresh
blueprint.empty
blueprint.dropHint
blueprint.selectHint
blueprint.blocks
blueprint.materials
blueprint.allNamespaces
blueprint.findMod
blueprint.compatible
blueprint.incompatible
blueprint.missingNamespaces
blueprint.delete
blueprint.cancel
blueprint.install
blueprint.goTo
blueprint.byAuthor
blueprint.noDescription
blueprint.loadMore
blueprint.cmsBrowseOnly
blueprint.mixedSources
blueprint.formats.structure
blueprint.preview.title
blueprint.preview.loading
blueprint.preview.empty
blueprint.preview.hint
blueprint.preview.controls
blueprint.convert.title
blueprint.convert.hint
blueprint.convert.target
blueprint.convert.action
blueprint.replace.title
blueprint.replace.simple
blueprint.replace.precise
blueprint.replace.simpleHint
blueprint.replace.preciseHint
blueprint.replace.from
blueprint.replace.to
blueprint.replace.addRule
blueprint.replace.newFile
blueprint.replace.action
resourcepack.linkShared
resourcepack.linkSharedHint
resourcepack.noLocalPacksFound
resourcepack.noPacks
resourcepack.noPacksInstalled
resourcepack.search
resourcepack.showDirectory
save.allowCheats
save.difficulty
save.datapack.name
save.datapack.noSaveHint
save.datapack.packFormat
save.datapack.imported
save.duplicate
save.linkShared
save.linkSharedHint
save.loadMap
save.map.tabTitle
save.progress.zoomIn
save.progress.zoomOut
save.progress.loading
save.progress.noData
save.progress.noDataHint
save.progress.quests
save.progress.advancements
save.progress.done
save.progress.inProgress
save.progress.all
save.progress.treeView
save.progress.filterPlaceholder
save.progress.root
save.progress.exitFullscreen
save.progress.locked
save.mapError
save.mapInfo
save.mapLoaded
save.mapPreview
save.chunkSelectMode
save.panMode
save.chunkSelected
save.mapHintPan
save.mapHintSelect
save.mapHintDeselect
save.toggleGrid
save.heightTop
save.resetView
save.clearSelection
save.copyChunks
save.pasteChunks
save.pasteChunksPlaceHint
save.pasteChunksCancel
save.deleteChunks
save.deleteChunksTitle
save.deleteChunksHint
save.mapLoading
save.noRegions
save.dimOverworld
save.dimNether
save.dimEnd
save.noLocalSavesFound
save.noSavesFound
save.noSavesInstalled
save.openFolder
save.properties
save.searchHint
save.searchSaves
save.seed
save.useMouseRotate
save.useScrollZoom
save.world
screenshots.gallery
screenshots.hint
screenshots.openFolder
search.local
search.market
search.emptyInstalled
search.browseMarket
search.noResults
search.pageSize
localCollection.title
localCollection.newCollection
localCollection.namePlaceholder
localCollection.addToCollection
localCollection.empty
localCollection.corrupted
localCollection.modrinthSection
localCollection.installAll
localCollection.incompatibleAlert
localCollection.projects
server.launch
server.stop
server.addServer
server.address
server.addressHint
server.bindUpstream
server.boundUpstream
server.boundUpstreamHint
server.editServer
server.emptyHint
server.entryCount
server.launchClient
server.launchPinned
server.launchTargetHint
server.nameHint
server.pin
server.pinAfterSave
server.pinnedHeader
server.clearLog
server.log
server.logWaiting
server.remoteActionSuccess
server.remoteAdmin
server.remoteAuthMethod
server.remoteAuthPassword
server.remoteAuthPrivateKey
server.remoteBuildOfflinePackage
server.remoteConnected
server.remoteConnection
server.remoteDeployment
server.remoteDeploy
server.remoteDisk
server.remoteConfigFiles
server.remoteExtraFiles
server.remoteForgetCredentials
server.remoteInstallService
server.remoteLoad
server.remoteLog
server.remoteMemory
server.remoteMods
server.remoteNoWorldSelected
server.remoteJavaRequired
server.remoteLinuxRequired
server.remoteNotConfiguredHint
server.remotePathNotWritable
server.remotePathWritable
server.remotePolicyInitialize
server.remotePolicyMirror
server.remotePolicyOverlay
server.remotePolicyPreserve
server.remotePreview
server.remotePhase.connect
server.remotePhase.error
server.remotePhase.idle
server.remotePhase.inspect
server.remotePhase.install
server.remotePhase.logs
server.remotePhase.ready
server.remotePhase.service
server.remotePhase.start
server.remotePhase.sync
server.remotePhase.world
server.remoteRememberCredentials
server.remoteReconcileReady
server.remoteRestartService
server.remoteSavedCredentialsHint
server.remoteService
server.remoteServiceActive
server.remoteServerInstalled
server.remoteServiceName
server.remoteServiceNameHint
server.remoteSelectedFiles
server.remoteSelectFiles
server.remoteStartCommand
server.remoteStartCommandHint
server.remoteStartService
server.remoteStatus
server.remoteSystemdRequired
server.remoteTargetName
server.remoteStopService
server.remoteStopWatchLog
server.remoteTestConnection
server.remoteTestConnectionSuccess
server.remoteUninstallConfirmMessage
server.remoteUninstallService
server.remoteRunInstall
server.remoteWatchLog
server.remoteWorldAlways
server.remoteWorldDeployment
server.remoteWorldDeploymentHint
server.remoteWorldFirstInstall
server.remoteWorldNever
server.remoteWorldPresent
server.remoteWorld
server.remoteWorldWillDeploy
server.serverName
server.serviceInstall
server.serviceManagedLaunch
server.serviceManager
server.serviceName
server.serviceNameHint
server.serviceNotInstalled
server.serviceStartCommand
server.serviceSystemd
server.serviceWindows
server.serviceWindowsCommandHint
server.serversListTitle
server.target
server.targetLocal
server.targetLocalHint
server.targetRemote
server.targetRemoteHint
server.unbindUpstream
server.unpin
server.upstreamUpToDate
server.upstreamUpToDateHint
server.upstreamUpdateAvailable
server.upstreamUpdateHint
server.useAsUpstreamHint
server.worldPreserve
setting.multiplayerTransport
setting.multiplayerTransportDescription
setting.about
setting.aboutBmclDescription
setting.aboutContributors
setting.aboutDenoDescription
setting.aboutLicense
setting.aboutLicenseInfo
setting.aboutSponsors
setting.advancedJavaOptions
setting.advancedSettings
setting.advancedSettingsHint
setting.aiAgentApiKey
setting.aiAgentApiKeyClear
setting.aiAgentApiKeyDescription
setting.aiAgentApiKeyEmpty
setting.aiAgentApiKeyNotNeeded
setting.aiAgentApiKeyNotNeededHint
setting.aiAgentApiKeySaved
setting.aiAgentApiKeyStored
setting.aiAgentApiKeyPlaceholder
setting.aiAgentBuiltin
setting.aiAgentCustom
setting.aiAgentEndpoint
setting.aiAgentEndpointDescription
setting.aiAgentEndpointPlaceholder
setting.aiAgentModelPlaceholder
setting.aiAgentModel
setting.aiAgentModelDescription
setting.apiSets.auto
setting.apiSets.official
setting.appearance
setting.appearanceDescription
setting.appxUpdateHint
setting.authenticationSettings
setting.backdropBlur
setting.backgroundColorAbove
setting.backgroundColorAboveDescription
setting.backgroundImage
setting.backgroundImageClear
setting.backgroundImageDescription
setting.useDesktopBackground
setting.backgroundImageFit.contain
setting.backgroundImageFit.cover
setting.backgroundImageFit.name
setting.backgroundImageUrl
setting.backgroundImageUrlPlaceholder
setting.backgroundMusic
setting.backgroundMusicUrl
setting.backgroundMusicUrlPlaceholder
setting.backgroundType
setting.backgroundTypeDescription
setting.backgroundTypes.halo
setting.backgroundTypes.image
setting.backgroundTypes.none
setting.backgroundTypes.particle
setting.backgroundTypes.video
setting.backgroundVideo
setting.backgroundVideoDescription
setting.backgroundVideoUrl
setting.backgroundVideoUrlPlaceholder
setting.backgroundVideoVolume
setting.backgroundVideoVolumeDescription
setting.browseRoot
setting.checkUpdate
setting.colorTheme.appBarColor
setting.colorTheme.backgroundColor
setting.colorTheme.cardColor
setting.colorTheme.description
setting.colorTheme.errorColor
setting.colorTheme.name
setting.colorTheme.primaryColor
setting.colorTheme.sideBarColor
setting.colorTheme.warningColor
setting.colorTheme.secondaryColor
setting.customCss.advancedDescription
setting.customCss.assistantHint
setting.customCss.assistantSuggestion1
setting.customCss.assistantSuggestion2
setting.customCss.assistantTitle
setting.customCss.dropHint
setting.customCss.editorPlaceholder
setting.customCss.globalToggle
setting.customCss.openInDialog
setting.customCss.title
setting.customCss.warning
setting.darkTheme
setting.darkThemeDescription
setting.devModeLabel
setting.developerMode
setting.developerModeDescription
setting.disableTelemetry
setting.disableTelemetryDescription
setting.enableDedicatedGPUOptimization
setting.enableDedicatedGPUOptimizationDescription
setting.enableDiscord
setting.enableDiscordDescription
setting.enterUrl
setting.exportSettings
setting.exportSettingsHint
setting.githubRelease
setting.globalJava
setting.globalJavaHint
setting.globalSetting
setting.globalSettingHint
setting.importSettings
setting.importSettingsHint
setting.instanceTheme.activeDescription
setting.instanceTheme.description
setting.instanceTheme.name
setting.language
setting.languageDescription
setting.latestVersion
setting.layout.default
setting.layout.focus
setting.layoutDescription
setting.layoutTitle
setting.linuxEnableDedicatedGPUOptimization
setting.linuxEnableDedicatedGPUOptimizationDescription
setting.linuxTitlebar
setting.linuxTitlebarDescription
setting.livePreview
setting.location
setting.manualUpdateHint
setting.maunalUpdateHint
setting.maxSockets
setting.maxSocketsDescription
setting.maxSocketsTitle
setting.memoryAssignment
setting.migrateFromOther
setting.minecraftOptions
setting.name
setting.network
setting.newsPosition
setting.officialWebsite
setting.particleMode.bubble
setting.particleMode.name
setting.particleMode.push
setting.particleMode.remove
setting.particleMode.repulse
setting.particleModeDescription
setting.quickLaunchSettings
setting.replaceNative
setting.replaceNativeDescription
setting.replaceNatives.all
setting.replaceNatives.legacy
setting.resetAllSettings
setting.resetAllSettingsConfirmMessage
setting.resetAllSettingsConfirmTitle
setting.resetAllSettingsHint
setting.resetAllSettingsSuccess
setting.resetSettingsError
setting.resetToDefault
setting.select
setting.setAsBackground.failed
setting.setAsBackground.global
setting.setAsBackground.instance
setting.setAsBackground.successGlobal
setting.setAsBackground.successInstance
setting.settingsExported
setting.settingsImportError
setting.settingsImported
setting.settingsReloadHint
setting.showNewsHeader
setting.showRoot
setting.sidebarAlign
setting.sidebarAutoHide
setting.sidebarAutoHideHint
setting.sidebarClassic
setting.sidebarNotch
setting.sidebarPosition
setting.sidebarScale
setting.sidebarShowOnlyPinned
setting.sidebarShowOnlyPinnedHint
setting.sidebarStyle
setting.sidebarStyleHint
setting.streamerMode
setting.streamerModeDescription
setting.theme.dark
setting.theme.light
setting.theme.system
setting.themeExport
setting.themeBorderRadius
setting.themeBorderRadiusDescription
setting.themeFont
setting.themeFontDescription
setting.themeFontUrl
setting.themeFontUrlPlaceholder
setting.themeImport
setting.themeResetFont
setting.themeSelectFont
setting.themeSettings
setting.themeShare
setting.themeShareDescription
setting.themeStore.description
setting.themeStore.loadConfirmMessage
setting.themeStore.loadConfirmTitle
setting.themeStore.loadTheme
setting.themeStore.name
setting.themeStore.noSavedThemes
setting.themeStore.saveDialogTitle
setting.themeStore.saveToStore
setting.themeStore.savedThemes
setting.themeStore.themeName
setting.themeStore.themeNameHint
setting.update
setting.useBmclAPI
setting.useBmclAPIDescription
setting.useProxy
setting.useProxyDescription
setting.viewBackgroundMusic
setting.allowPrerelease
setting.allowPrereleaseDescription
setting.autoDownload
setting.autoDownloadDescription
setting.autoInstallOnAppQuit
setting.autoInstallOnAppQuitDescription
setting.backgroundImageBlur
setting.backgroundImageBlurDescription
setting.backgroundImageSelect
setting.backgroundVideoSelect
setting.blurAppBar
setting.blurMainBody
setting.blurMainBodyDescription
setting.blurSidebar
setting.hideNewsHeader
setup.account.description
setup.account.name
setup.account.skip
setup.dataRoot.drives
setup.error.invalidChar
shaderPack.market
shaderPack.linkShared
shaderPack.linkSharedHint
shaderPack.noLocalPacksFound
shaderPack.noPacks
shaderPack.noPacksInstalled
shaderPack.search
shared.pressKeyCombination
shared.add
shared.author
shared.back
shared.browse
shared.cancel
shared.checkUpgrade
shared.client
shared.copied
shared.copy
shared.close
shared.copyFailed
shared.copyFailedHint
shared.description
shared.disable
shared.download
shared.edit
shared.enable
shared.failed
shared.filter
shared.install
shared.installed
shared.manage
shared.name
shared.next
shared.no
shared.ok
shared.previous
shared.refresh
shared.remove
shared.save
shared.search
shared.server
shared.upgrade
shared.yes
shared.delete
sortBy.name
store.discover
store.empty
store.emptyHint
store.popularity
store.searchHint
store.searchResult
store.trending
task.running
task.succeed
task.eta
task.remaining
task.totalRemaining
task.op.update
task.op.export
task.op.duplicate
theme.title
turnRegion.guangzhou
turnRegion.hk
turnRegion.liaoning
tutorial.blueprint.detailDescription
tutorial.blueprint.detailTitle
tutorial.blueprint.listDescription
tutorial.blueprint.listTitle
tutorial.blueprint.searchDescription
tutorial.blueprint.searchTitle
tutorial.done
tutorial.helpDescription
tutorial.me.instancesDescription
tutorial.me.instancesTitle
tutorial.me.profileDescription
tutorial.me.profileTitle
tutorial.me.skinDescription
tutorial.me.skinTitle
tutorial.multiplayer.contentDescription
tutorial.multiplayer.contentTitle
tutorial.multiplayer.groupDescription
tutorial.multiplayer.groupTitle
tutorial.multiplayer.joinDescription
tutorial.multiplayer.manualDescription
tutorial.multiplayer.railDescription
tutorial.multiplayer.railTitle
tutorial.resourcepack.detailDescription
tutorial.resourcepack.detailTitle
tutorial.resourcepack.listDescription
tutorial.resourcepack.listTitle
tutorial.resourcepack.searchDescription
tutorial.resourcepack.searchTitle
tutorial.save.detailDescription
tutorial.save.detailTitle
tutorial.save.listDescription
tutorial.save.listTitle
tutorial.save.searchDescription
tutorial.save.searchTitle
tutorial.settings.appearanceDescription
tutorial.settings.generalDescription
tutorial.settings.globalDescription
tutorial.settings.navDescription
tutorial.settings.networkDescription
tutorial.shaderpack.detailDescription
tutorial.shaderpack.detailTitle
tutorial.shaderpack.listDescription
tutorial.shaderpack.listTitle
tutorial.shaderpack.searchDescription
tutorial.shaderpack.searchTitle
tutorial.tooltip
tutorial.feedbackDescription
tutorial.instance.appearanceThemeDescription
tutorial.instance.appearanceThemeTitle
tutorial.instance.iconDescription
tutorial.instance.iconTitle
tutorial.instance.javaDescription
tutorial.instance.javaImportDescription
tutorial.instance.javaImportTitle
tutorial.instance.javaTitle
tutorial.instance.modpackExportDescription
tutorial.instance.modpackExportTitle
tutorial.instance.modpackFilesDescription
tutorial.instance.modpackFilesTitle
tutorial.instance.modpackMetaDescription
tutorial.instance.modpackMetaTitle
tutorial.instance.modpackOptionsDescription
tutorial.instance.modpackOptionsTitle
tutorial.instance.serverLaunchDescription
tutorial.instance.serverLaunchTitle
tutorial.instance.serverPropertiesDescription
tutorial.instance.serverPropertiesTitle
tutorial.instance.serverServiceDescription
tutorial.instance.serverServiceTitle
tutorial.instance.serverTargetDescription
tutorial.instance.serverTargetTitle
tutorial.instance.versionDescription
tutorial.instance.versionTitle
tutorial.instanceAddDescription
tutorial.launchDescription
tutorial.mod.defaultSourceDescription
tutorial.mod.defaultSourceTitle
tutorial.mod.detailDescription
tutorial.mod.detailTitle
tutorial.mod.listDescription
tutorial.mod.listTitle
tutorial.mod.searchDescription
tutorial.mod.searchTitle
tutorial.userAccountDescription
userService.add
userService.authlibInjectorMetadata
userService.baseUrlHint
userService.homepage
userService.implementation
userService.manageServices
userService.register
userService.server
userService.skinDomains
userService.version
userService.authLibInjector
userService.validateHint
userServices.microsoft.account
userServices.microsoft.deviceCode
userServices.microsoft.deviceCodeHint
userServices.microsoft.password
userServices.microsoft.useDeviceCode
userServices.microsoft.fastLogin
userSkin.classic
userSkin.invalidImage
userSkin.invalidImageTitle
userSkin.saveSuccess
userSkin.saveFailed
userSkin.slim
userSkin.uploadFailed
userSkin.uploadRejected
userSkin.libraryTitle
userSkin.librarySubtitle
userSkin.manage
userSkin.all
userSkin.currentSkin
userSkin.savedCount
userSkin.newSkin
userSkin.addNewSkin
userSkin.editSkin
userSkin.skinName
userSkin.skinNamePlaceholder
userSkin.localFile
userSkin.urlOrPlayer
userSkin.urlOrPlayerPlaceholder
userSkin.urlOrPlayerHint
userSkin.dropFileHere
userSkin.supportedFormats
userSkin.preview
userSkin.previewPlaceholder
userSkin.saveToLibrary
userSkin.saveAndEquip
userSkin.equip
userSkin.equipToAccount
userSkin.equipped
userSkin.noSkinSelected
userSkin.saveCurrent
userSkin.officialPreset
userSkin.mySkins
userSkin.presets
userSkin.noSkinsFound
userSkin.tryAddingOne
userSkin.skinUpdated
userSkin.skinDeleteFailed
userSkin.edit
userSkin.fetch
version.checkIntegrity
gamepad.detectedTitle
gamepad.connected
gamepad.guideTitle
gamepad.enableSwitchLabel
gamepad.enabledState
gamepad.disabledState
gamepad.toggle
gamepad.disabledNotify
gamepad.enabledNotify
gamepad.guide.confirm
gamepad.guide.navigate
gamepad.guide.tabs
gamepad.guide.sections
gamepad.guide.launch
gamepad.guide.instanceSettings
gamepad.modSuggestTitle
gamepad.modSuggestBody
gamepad.modInstall
gamepad.modSkip
gamepad.modDone
gamepad.modInstalled
gamepad.modInstalledNotify
gamepad.modNotFound
gamepad.autoEnableLabel
gamepad.autoEnableHint
gamepad.autoOpenKeyboardLabel
gamepad.autoOpenKeyboardHint
gamepad.focusTooltipsLabel
gamepad.focusTooltipsHint
gamepad.disableModPromptLabel
gamepad.disableModPromptHint
gamepad.settingSteamTitle
gamepad.steamAddedNotify
gamepad.steamAlreadyAddedNotify
gamepad.steamDeckTitle
gamepad.steamDeckDesc
gamepad.steamDeckAddBtn
gamepad.steamDeckCancelBtn
HomeSyncDialog.pull
HomeSyncDialog.push
HomeSyncDialogPull.failText
HomeSyncDialogPull.refresh
HomeSyncDialogPull.update
HomeSyncDialogPush.authError
HomeSyncDialogPush.refresh
HomeSyncDialogPush.unknownError
HomeSyncDialogPush.upload
checkUpdate.name
error.name
exportModpackTarget.github
exportModpackTarget.override
forgeConfig.hint
installModpack.deploy
installModpack.download.file
installModpack.download.name
installModpack.name
installModpack.unpack
installResource.fail
installResource.success
liteloader.name
update.goOfficialWebDownload
```
