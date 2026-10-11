# Auditoría previa a upstream — PbtModLauncherX v1.0.7

Fecha: 2026-10-10. Fase 1 exclusivamente; análisis estático de árboles e historial Git. No se ha ejecutado merge, rebase, compilación, cambio de versiones, push ni publicación. No se han modificado funcionalidades ni archivos existentes.

## Estado inicial y protección

- Carpeta verificada mediante Get-Location y git rev-parse --show-toplevel: G:\Documentos\Compilar-Libs-Dev\PbtModLauncherX-Dev. Repositorio Git válido.
- Rama inicial: master. Árbol e índice limpios, sin archivos no seguidos en git status --porcelain=v1. No hubo cambios locales que requirieran stash. Hay node_modules y posibles salidas ignoradas: no se borran ni quedan cubiertas por una rama Git.
- HEAD local y master: `c4b77e666f0b132e05e3ffff71d2728132a46a44`, «Actualizar URL del Sitio Web», 2025-07-06. Versión local declarada: 1.0.5.
- Antes del fetch, origin/master coincidía con HEAD. Después: `618d94eb7096599002bab5fd73636c917c0590d1`; master local queda 17 commits detrás. Estos cambios confirmados remotos también son trabajo propio que debe conservarse.
- Origin: https://github.com/PbtServers/PbtModLauncherX-Dev (fetch/push).
- Se añadió upstream: https://github.com/Voxelum/x-minecraft-launcher (fetch/push), y se completaron git fetch origin y git fetch upstream. Tener URL de push configurada no implica haber realizado push.
- Upstream/master descargado: `0379941d1997e92b079fdc21e8692c8e45cd8cd7`, 2026-10-06, «fix(installer): avoid treating processor output directories as files». Su package.json declara 0.71.0.
- Ancestro común único, también para origin/master: `72d8489ca48423d56b49f211c94b33a258564839`, «docs: Update readme». Está inmediatamente después de la release upstream 0.42.0 en el historial inicial.
- HEAD frente a upstream/master: 73 commits exclusivos locales / 1.554 exclusivos upstream. Origin/master frente a upstream/master: 90 / 1.554. Exclusividad de historial no demuestra autoría de cada línea: existen actualizaciones upstream copiadas dentro de commits del fork.
- No existían las ramas solicitadas. Se crearon `backup/pre-upstream-v1.0.7` y `dev/upstream-v1.0.7`, ambas en el HEAD local inicial. La segunda es la rama activa. Master no se movió. La rama backup protege el estado confirmado inicial, no los cambios posteriores de origin/master ni este informe sin confirmar.
- No se encontraron AGENTS.md versionados en HEAD ni origin/master, ni instrucciones locales mediante la búsqueda realizada.
- El sandbox impidió inicialmente escribir .git/config; la configuración, fetch y creación de ramas se realizaron con autorización elevada. No se descartó ningún archivo.

## Método para distinguir personalización y desfase

Se contrastaron tres diferencias: ancestro→HEAD, ancestro→upstream/master y HEAD→origin/master. La primera contiene 1.360 archivos afectados, 144.522 inserciones y 47.638 eliminaciones: no debe interpretarse como 1.360 personalizaciones. El upstream actual respecto al ancestro afecta a 2.339 archivos.

Como referencia auxiliar se comparó el upstream histórico `7d2d8b8e2c1faa6a043051621c8be80e319ad58c` (2025-07-03, sponsor Tencent EdgeOne), cercano al último trabajo local. No es un nuevo ancestro ni una base exacta del fork. En los cuatro módulos principales esta comparación se reduce a 126 archivos, muchos de ellos idiomas retirados, iconos y copias .bak/.old. Por ejemplo, pluginOfflineUser.ts coincide con ese upstream histórico, PresenceService.ts solo cambia el clientId y login.ts solo elimina dos líneas de filtrado. Esto permite identificar intención propia sin congelar el resto del código en una versión antigua.

Las diferencias residuales de red, recursos, esquemas, logs y tipos respecto a esa referencia pueden ser desfase de pocos commits, correcciones propias o código copiado; se deben revisar por fragmento e historial en la integración. No se certifica su autoría solo por el título del commit. Los anexos incluyen inventarios completos y solapamientos de rutas, sin reproducir valores de claves API.

## Personalizaciones y comportamiento que preservar

| Área | Evidencia y archivos | Clasificación / condición de preservación |
| --- | --- | --- |
| Identidad Pbt | xmcl-electron-app/package.json, xmcl-keystone-ui/package.json, xmcl-runtime/constant.ts, xmcl-runtime/launch/LaunchService.ts; build.ts, build/appinstaller-builder.ts, build/appxmanifest.xml, build/electron-builder.config.ts; main/controllers/notification.ts, main/index.dev.ts; HTML app/browser/index/multiplayer y README.md | Propio confirmado: nombres, autor, descripción, repositorio, launcherName, LAUNCHER_NAME, instaladores y artefactos. Revisar todos los puntos de identidad, no solo package.json. |
| Español | assets/locales.json; xmcl-keystone-ui/locales/es-ES.yaml y en.yaml; src/i18n.ts; Electron main/definedLocales.ts y main/locales/en.yaml, es-ES.yaml | Traducción y selección propias. Localmente i18n inicia es-ES, pero messages usa la clave es: riesgo de registro inconsistente. Hay idiomas upstream retirados; no asumir que toda eliminación es un conflicto que se resuelve restaurando idiomas. |
| Catalán y paridad reciente | origin/master añade xmcl-keystone-ui/locales/ca.yaml y xmcl-electron-app/main/locales/ca.yaml; registra ca en assets/locales.json y definedLocales.ts; actualiza i18n.ts, en.yaml y es-ES.yaml | Propio confirmado en origin, ausente en HEAD inicial. dc50295f añade claves y catalán; 8948608a y 63645b4c corrigen traducciones. Preservar estos commits antes de upstream. La rama de sync no demuestra una integración completa del upstream actual. |
| Iconos y recursos | xmcl-electron-app/icons/*: 38 archivos versionados; modificaciones binarias dark/light, tiles y tray en la comparación histórica. PbtModLauncherX-Data/Website/img/* y fonts/* | Propios confirmados en los iconos modificados. Proteger binarios completos, variantes y recursos web. No todos los recursos Minecraft de UI son propios: muchos vienen del upstream copiado. |
| Discord Rich Presence | xmcl-runtime/presence/PresenceService.ts | clientId propio 1213977247514361856. El servicio, eventos y estructura son mayormente upstream. Conservar ID y recursos asociados al cambiar la implementación. |
| Actualizador y servidores | xmcl-electron-app/main/utils/updater.ts; build/electron-builder.config.ts; latest_version.json; main/pluginAutoUpdate.ts | Propios: descargas GitHub PbtServers, metadata raw master/latest_version.json, web mods.pbtservers.com y publicación al repositorio propio. La mayor parte del motor del updater es upstream histórico. No se identificó un servidor de autenticación Pbt separado en el código revisado. |
| Login | src/composables/login.ts, src/composables/user.ts, src/components/UserLoginForm.vue; runtime/user/* y main/utils/login.ts | Confirmado por b0738d42: se elimina useAllowThirdparty del selector y el filtro de autoridades no Microsoft. Persiste useAllowThirdparty y restricciones por locale en otras capas. Validación de nombre offline frente a email online difiere del upstream histórico; no atribuir automáticamente toda la autenticación a Pbt. |
| Offline | runtime/user/pluginOfflineUser.ts, util/offlineUser.ts, LaunchService.ts, paquetes user y user-offline-uuid dentro de xmcl | Motor heredado: perfiles OFFLINE, UUID, tokens, skins/capes y refresh local; pluginOfflineUser coincide con upstream histórico. Personalización confirmada en la exposición de opciones del selector. Mantener acceso y datos offline al migrar autoridades y perfiles, además del lanzamiento con instalación local. |
| UI y tutoriales | src/composables/tutorial.ts, views/BaseSetting.vue, Home.vue, Me.vue, Mod.vue, StoreEntry.vue, AppSystemBar.vue, Setting.vue; windows/main/App.vue, Context.ts, index.ts; Registro incluye Multiplayer.vue | Propio: funciones tutorial vacías, retirada de inyecciones/pasos y botones tutorial/feedback; SettingAbout eliminado de Setting.vue. La ruta Multiplayer.vue figura en el registro: revisar el historial aunque no aparezca como diferencia neta frente a la referencia auxiliar. |
| Electron y compilación | postinstall.ts, dev.ts, build.ts, electron-builder.config.ts, appxmanifest.xml, packages, pnpm-lock.yaml, pnpm-workspace.yaml, .gitattributes | Branding y cambio de configuración/API de postinstall propios; no copiar ni exponer el valor de la clave en informes. Herramientas y dependencias son mayormente versiones upstream. .gitattributes añade exe/webp binarios. Mantener identidad y adaptar herramientas compatibles. |
| Workflows | .github/workflows/build.yml, deploy-release.yml, deploy-ui.yml, validate.yml y acciones locales | Respecto al ancestro no hay diferencias netas en .github local: es principalmente CI heredada y obsoleta. Respecto a upstream 2025 sí difiere ampliamente. Origin posterior reemplaza build y elimina los tres workflows restantes: cambios propios recientes que no deben revertirse. |
| Documentación y datos | README.md; 62 archivos versionados bajo PbtModLauncherX-Data en HEAD, Website completo, formato-releases.txt, Modificaciones/Registro-Archivos.txt; origin añade release-v1.0.6.md y release-v1.0.6-sha256.txt | Propios. El registro menciona assets/formato-releases.txt, pero la ruta actual es PbtModLauncherX-Data/formato-releases.txt. El registro no es inventario exhaustivo ni está sincronizado con origin v1.0.6. |
| Otros cambios | .gitmodules y documentos CONTRIBUTING/USAGE/README de otros idiomas retirados; xmcl incorporado como árbol; copias .bak y .old versionadas; latest_version.json completo | Conservar evidencia y recursos. xmcl contiene librerías upstream vendorizadas, no una funcionalidad original por ser añadido en commits Pbt. Las copias antiguas no deben convertirse en archivos activos. |

Registro-Archivos.txt se leyó explícitamente con UTF-8 y se contrastó con el árbol y los commits. Sus rutas con marcas Unicode antes de xmcl-runtime se interpretan como las rutas reales sin dichas marcas.

## Trabajo propio posterior disponible en origin

Origin/master incorpora v1.0.6, catalán, claves de traducción, tipos para create-desktop-shortcuts, correcciones de typecheck, asset de locales principal, destinos Linux y pipeline Build & Release. Son 26 archivos, 2.207 inserciones y 537 eliminaciones respecto a HEAD inicial. La auditoría no ha incorporado estos cambios al checkout; el listado exacto de los 17 commits se adjunta.

## Conflictos potenciales y riesgos

1. **Base local atrasada respecto al propio origin.** Partir solo de c4b77e66 perdería funcionalmente catalán y mejoras v1.0.6. La futura rama debe incorporar primero el trabajo remoto confirmado; la copia inicial permanece en backup.
2. **Historia upstream copiada sin ancestría actualizada.** El ancestro real sigue cerca de 0.42.0 aunque muchos archivos locales son casi iguales a upstream 0.51.1. Un merge a tres vías puede tratar cambios heredados como modificaciones propias. No usar resolución global ours/theirs.
3. **Reestructuración de librerías.** Local contiene xmcl como árbol, con historial de sustitución del submódulo; upstream actual usa packages/* en la raíz y añade DeskGap. Prever conflictos archivo/directorio, imports, workspace y lockfile. No conservar un segundo árbol viejo por accidente ni borrar librerías sin trazabilidad.
4. **Toolchain.** Local exige Node >=20 y pnpm 9.3.0; CI local usa Node 16 y pnpm 8.3.0. Origin lo corrige a Node 20/pnpm 9.3.0, pero upstream actual exige Node >=22.16.0 y pnpm 11.10.0. Revalidar dependencias nativas, Electron y empaquetado de las tres plataformas.
5. **Actualización a repositorio incorrecto o rota.** Riesgo de restaurar endpoints Voxelum. La ruta personalizada /PbtServers/PbtModLauncherX-Dev/LatestRelease/... parece no corresponder a una URL normal de assets GitHub; es un hallazgo estático, sin prueba HTTP. Hay URLs duplicadas para GFW y se retiró el control response.ok del endpoint metadata. Revisar contrato de latest_version.json, assets, sha256 y compatibilidad asar/Electron. No se prueba el updater en esta fase.
6. **Offline y login.** Restituir el filtro upstream ocultaría opciones propias. El plugin offline todavía condiciona metadata a allowThirdparty: quitar el filtro UI no garantiza acceso offline en todos los locales. Deben probarse selección, creación, UUID, skins/capes, persistencia y lanzamiento sin red. Validación email también puede afectar Yggdrasil.
7. **Traducciones.** Conservar ambos ca.yaml de origin y registros en UI/Electron. Comparar claves, interpolaciones/plurales, duplicados y fallback con upstream nuevo; preservar intención de restringir idiomas y nombres españoles. El registro manual no cubre ca.
8. **Identidad y datos existentes.** Conservar appId, launcherName, ejecutable, rutas de usuario e instaladores Pbt. Aún hay identidad CI010, publisher y msstoreCliAppId heredados en Electron: revisar certificados y compatibilidad de instalaciones sin cambiar valores en esta fase.
9. **Tutoriales/UI.** Upstream conserva un sistema de tutorial y lo amplía; una resolución puede reintroducir funciones retiradas o dejar imports e inyecciones sin proveedores. Verificar también SettingAbout y botones de feedback.
10. **CI y publicación.** Origin tiene permissions contents:write y acciones de release en Build & Release; no ejecutar ni publicar durante preparación. No restaurar deploy/validate retirados por defecto ni suponer que las validaciones siguen cubiertas.
11. **Cambios de origen incierto.** Diferencias de manejo de errores de red/Microsoft, encoding de logs, esquemas y recursos deben revisarse por fragmento. Preservar comportamiento Pbt conocido; no perpetuar regresiones antiguas solo porque están en un commit exclusivo.
12. **Copias y material ignorado.** .bak/.old están versionados, node_modules está ignorado. Backup de rama protege objetos confirmados; no representa un backup físico de todo el directorio. No se ha eliminado ni reemplazado ninguno.

Los anexos enumeran rutas modificadas por ambas partes desde el ancestro. Son candidatos a conflicto de contenido o intención, no conflictos confirmados: no se realizó un merge de prueba. Los renombrados de upstream también pueden generar conflictos que no aparecen como coincidencia literal de rutas.

## Estrategia recomendada para la siguiente fase

1. Mantener master y backup inicial inmóviles. Confirmar el informe en la rama de trabajo cuando se autorice continuar; fijar/proteger además origin/master actual antes de incorporar cambios.
2. Incorporar los 17 commits propios posteriores de origin/master en la rama de trabajo antes de upstream, verificando ca y cambios v1.0.6. HEAD local es ancestro de origin/master; no hace falta reescribir historia. Esta incorporación NO se ha realizado.
3. Fijar upstream al SHA auditado y preparar un merge revisable en la rama de trabajo, sin push. Si el upstream cambia, actualizar auditoría antes de usar otra base. Evitar cherry-pick indiscriminado de los 73/90 commits, que contienen grandes copias de upstream.
4. Resolver por intención y por módulo: estructura packages/workspace y API actual, seguido de runtime/Electron, login/offline, branding/updater, locales/UI y CI. Usar referencia 2025 solo para explicar intención, no como reemplazo del ancestro real.
5. Revisar todos los archivos de los inventarios y conservar iconos, Website, documentación, traducciones y copias propias. Documentar cada adaptación de las personalizaciones a las nuevas rutas, no reemplazar carpetas enteras.
6. En esa fase, validar tipos, compilación y empaquetado con toolchain nuevo; probar login Microsoft/Yggdrasil/offline, usuarios existentes, lanzamiento sin red, Discord y actualizador con metadata/artefactos Pbt. Revisar CI sin activar publicación.
7. Cambiar versión a 1.0.7 solo después de resolver y validar la integración, bajo instrucciones posteriores. Mantener un listado de regresiones y comparativa de branding, idiomas y recursos antes/después.

## Estado al finalizar esta fase

Rama activa dev/upstream-v1.0.7 en c4b77e66. Backup y master conservan el mismo SHA inicial. Origin/master descargado en 618d94eb; upstream/master en 0379941d. Único cambio previsto en el árbol: este informe nuevo, sin stage ni commit. No se han modificado versiones, launcher ni master; no se ha ejecutado merge/rebase, push o release. La auditoría es estática y no certifica compilación ni funcionamiento. Se detiene el trabajo al terminar la fase 1.

## Anexos generados desde Git

Los listados siguientes fijan los SHA completos de commits y los inventarios de rutas. A/M/D/R representan añadido/modificado/eliminado/renombrado; una diferencia no equivale por sí misma a personalización.

### A. Los 73 commits exclusivos del checkout local

```text
39759bea93130c814e0b6705086fd65876ca9644 Update README.md
27efeaf566250e4faebe3dc39ae2ef8ea44beda9 Delete CODE_OF_CONDUCT.md
734bbda8db43248acc9342502c3e87bce654cefa Update README.md
5b627852ae2c729921a217060d8eec088be78b5f Update README.md
af4402499ffc7926ae5065d2f4b712273ee038b9 Update README.md
75b4e50b7ea844a9efd71f888ce4f4c9973536bb Instrucciones de compilación
68775753aa052fa0a4dd426d720c47f73bfec69e Arreglar texto
1733271dc420137eced4ecb7bf31d91bd56911c8 Eliminar archivos extra
64240e5505c438dacf0ad187592967e6251ca492 Arreglar directorio dist
72994166cd5a8be0f7fc2f729c770f005c11c476 Arreglar otra vez el entorno
995c927f32b9d9e74baf5d5e4c7de20ed3f51611 Empezar con nuevo branding
6b83db9b11f563096174a39cb6d0dd120ecba8d1 Arreglar Traducción
c02170c42bcc8f7f04592bde4859e1861ba3464c Arreglar Menú con nuevos locales
bad0525687a6d1c34e2ad6bb5a3cffaff8bcc4dc Update de Locales y Versión
1881adaefbb22461021d46ffa284e061c57c2442 Arreglar partes del login
244de197bebaf1aeaa6f3a05126d9214e43316a8 Nuevos iconos!
e04d2c47132976a2a19c3ad4ce3f8e9df22a4f0c Arreglar idioma
024403a0ebf8d8307257d969580acd0574b5bd61 Arreglar iconos...
2f5352cdf883ebf4042ab652f6612a6f58575450 Nuevo icono del launcher
132b9f14fc669de71da70bba6930f6968c074c5a Arreglar repos, texto y un icono [v1.0.0] - Release
f2538810f1c8ba865d739cb1c17c65f0ee6bf9e3 Reañadir imagen
bd373fa1e986859a14a5d228ef4b4267f69d05cd Merge branch 'HEAD' of https://github.com/PbtServers/PbtModLauncherX-Dev
d0bf83f26e0efcfb2f883373e26d4bed7761cf0e Arreglar partes del idioma restantes...
7418e528b903cc52a21c0e035074ed225ca9e30d Arreglar locales erroneas
55afdf754d8fc2d5662d5a307c879b580e96aefc Pequeño fondo para varios iconos
e6aeb438563a60ed6084d1df2ced812e04baa281 Nuevos iconos de mejor calidad y formato de releases
c5c427c616cc45f73ae3defd6e4cbf589112ace6 Arreglar iconos y updater (v1.0.2)
1310283c9bf1f423b759b343587fcdc7141ce23f No se puede añadir varios autores.
77124e3e9c99e02fb0fc1b3a83b1ada74475ce35 Actualizar Upstream y Arreglar Bugs (v1.0.3)
d3dbfd4b45dead02fbb8f0c96bc5fb4d570456a8 Volver a agregar la libreria base
cff6746c378e9386110e1e9bf7b63ea3ed7a280b Arreglar compilación
a4250fb1ad450dd2f3789bc30c429be81f5fc4a3 Quitar comando que ya no funciona
542b238cde623bc92d2273524d862d24d90e3062 Arreglar error de renderer
ba8333180d3d241d383a956f704ea465274001a8 Arreglar libreria base del código
b93999f176230a6eb3b19d7de2b2a732f6d11b02 Arreglar traducciones
22708562dc8489dac16868f03eb5c77761010082 Arreglar textos duplicados
a560bafebdf2ce190028e6a15ab451dd9b6d46d4 Arreglar duplicados en locales!
7de79fa98666ef623decb8cc4000f3aa2e894587 Arreglar textos no mostrados y varias funciones.
4b0052b911726bdeb9e0cc353cb9bdb4114a8ba9 Actualizar versión en el archivo del repositorio
76f95bb667ebf4aaf028ab860751800c6a4abe64 Update .gitignore
e7aca8811072ff6d0aee16f2008217f43519b56d Arreglar archivos de github
85dc6b7526182321796394446b897af45953fa88 Arreglar duplicación en locales (otra vez)
92433fa99d2122102072c0a02a1306c79e90902a Actualizar Upstream y Arreglar Bugs (v1.0.4)
3d0d1b90385bd75a50b07353cd3a2ab425b5230d Arreglar .gitignore
e570d6c0b67b78c7e9f6db5718ab8bd766f89c09 Arreglar from faltante en idioma...
5c4be2aafa63a652813212a382e622f4479388de Arreglar TS no admitiendo es-ES.yaml
fb40fed1c9389149d1f97445b8c864bde511f764 Arreglar idioma es-ES duplicados...
d78c8d071fbf6c9a0597c1f1b22189aef8898093 Arreglar dependencia forzada...
dd9ab2a94b53930d1eaa80ebb5ce09e8ee7ee4cc Arreglar identidad de desarrollo...
43ab53cc9d8b80bcc80145c3613b21aab972d7ea Actualizar nueva versión [v1.0.4]
d5d1886de8e389f5e2c288dc3c455daf61792d9b Update AppSystemBar.vue
88f7e1671ec51198559b89c19dfdf3a2c9640846 Update tutorial.ts
78f2b0c95c28cdcd4d61e636fdc9e0e25b2828ef Arreglar Tutorial Eliminado...
7048193955175e038d4fe2f55660ace19dd77962 Actualizar la nueva API Key
8eea164b7b5aaba3ae09583aef1126d1eab59d68 Arreglar branding, otra vez...
4ace32c9f4a9f11b9550db81b5a89c5528f573bb Agregar Registro Manual de Cambios...
a90cbda10ed5ce4f339794ee88c8fdf7120a7d74 Agregar Página Web...
503a1711bc1924c99a7396c584c8cbd2fa3694bd electron-app (ready) (v1.0.5)
0224dcb00e3cc0f6bb7f3bfceb926fd77dd0b7dd Actualizar Readme
2af08d242ccc77b5aabb2b353a2d9a446ef9bf0b Remove old data
a911b381c500124245072cc1c48644777d079145 Comenzar (Keystone-ui) (v1.0.5)
e66dc0efbd620630ced7c32bfe7f4111b02d9b82 keystone-ui (lang es-ES) (v1.0.5)
edb6d1b1fcd16cce96a9ba9fc4ebf4d8d094e1c4 keystone-ui (ready) (v1.0.5)
ad6b389a3f8f0ea8ec14bd82a99d5ad0c56c9b7b runtime (ready) (v1.0.5)
a0f9db61bb42422a660c510a507d5239ab2d647e Nueva actualización ya disponible (v1.0.5)
ca1b47c78df97d1f3e68acacf6c9fb8e5ec97842 Arreglar AutoUpdater (v1.0.5)
87b8c5d4088c6cf47bc34d6fa514c565e5b44b70 Arreglar AutoUpdater NewFix
f63023ace0abfb68c047237a5f297b7953bb80ac Nuevas Dependencias (v1.0.5)
2b8b7e4fc9d0e147e996689c39c94e6d81d89300 Arreglar Dependencias (v1.0.5)
a56758ebe11d0fa9f3719a653d3235f0d8fdbe14 Eliminar Datos de Ajustes
b0738d42ea0c39f09fce195c7d7296dbcd72d267 Arreglar Datos de Login
2b01a3b7c81321e2cdc587078ff7956e13e8c2da Nueva Actualización [v1.0.5]
c4b77e666f0b132e05e3ffff71d2728132a46a44 Actualizar URL del Sitio Web
```

### B. Los 17 commits posteriores de origin/master

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

### C. Archivos cambiados en origin desde el checkout local

```text
M	.github/workflows/build.yml
D	.github/workflows/deploy-release.yml
D	.github/workflows/deploy-ui.yml
D	.github/workflows/validate.yml
M	PbtModLauncherX-Data/Website/index.html
A	PbtModLauncherX-Data/release-v1.0.6-sha256.txt
A	PbtModLauncherX-Data/release-v1.0.6.md
M	README.md
M	assets/locales.json
M	latest_version.json
M	package.json
M	xmcl-electron-app/build.ts
M	xmcl-electron-app/build/electron-builder.config.ts
M	xmcl-electron-app/main/definedLocales.ts
A	xmcl-electron-app/main/locales/ca.yaml
M	xmcl-electron-app/package.json
M	xmcl-electron-app/package.json.bak
A	xmcl-keystone-ui/locales/ca.yaml
M	xmcl-keystone-ui/locales/en.yaml
M	xmcl-keystone-ui/locales/es-ES.yaml
M	xmcl-keystone-ui/package.json
M	xmcl-keystone-ui/src/global.d.ts
M	xmcl-keystone-ui/src/i18n.ts
M	xmcl-keystone-ui/src/views/AppSystemBar.vue
M	xmcl-keystone-ui/src/windows/main/App.vue
M	xmcl-runtime/global.d.ts
```

### D. Diferencias locales frente al upstream histórico de julio de 2025 (referencia auxiliar)

```text
D	.envrc
M	.github/FUNDING.yml
M	.github/actions/generate-release-note/action.yml
M	.github/actions/generate-release-note/index.js
M	.github/actions/generate-release-note/package.json
M	.github/actions/get-build-number/action.yml
M	.github/actions/get-build-number/package.json
D	.github/actions/patch-release-note/action.yml
D	.github/actions/patch-release-note/index.js
D	.github/actions/patch-release-note/package.json
M	.github/workflows/build.yml
M	.github/workflows/deploy-release.yml
M	.github/workflows/deploy-ui.yml
M	.github/workflows/validate.yml
M	.gitignore
D	.gitmodules
D	.vscode/extensions.json
D	.vscode/launch.json
D	.vscode/settings.json
D	.vscode/tasks.json
D	.vscode/vue.code-snippets
D	CHANGELOG.legacy.md
D	CODE_OF_CONDUCT.md
D	CODE_OF_CONDUCT/CODE_OF_CONDUCT.de.md
D	CODE_OF_CONDUCT/CODE_OF_CONDUCT.ru.md
D	CODE_OF_CONDUCT/CODE_OF_CONDUCT.ua.md
D	CONTRIBUTING.i18n.md
D	CONTRIBUTING.md
D	CONTRIBUTING.zh.md
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
M	README.md
D	USAGE.md
D	assets/EdgeOne.png
M	assets/locales.json
D	contributing/CONTRIBUTING.de.md
D	contributing/CONTRIBUTING.pl.md
D	contributing/CONTRIBUTING.ru.md
D	contributing/CONTRIBUTING.ua.md
D	docs/README.de.md
D	docs/README.jp.md
D	docs/README.kz.md
D	docs/README.pl.md
D	docs/README.ru.md
D	docs/README.uk.md
D	docs/README.zh.md
D	flake.nix
A	latest_version.json
M	package.json
M	pnpm-lock.yaml
D	xmcl
D	xmcl-electron-app/CHANGELOG.legacy.md
M	xmcl-electron-app/build.ts
A	xmcl-electron-app/build.ts.bak
M	xmcl-electron-app/build/appinstaller-builder.ts
A	xmcl-electron-app/build/appinstaller-builder.ts.bak
M	xmcl-electron-app/build/appxmanifest.xml
M	xmcl-electron-app/build/electron-builder.config.ts
A	xmcl-electron-app/build/electron-builder.config.ts.bak
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
M	xmcl-electron-app/main/ElectronController.ts
M	xmcl-electron-app/main/ElectronLauncherApp.ts
A	xmcl-electron-app/main/constant.ts.bak
M	xmcl-electron-app/main/controllers/gameLaunch.ts
M	xmcl-electron-app/main/controllers/notification.ts
A	xmcl-electron-app/main/controllers/tray.ts.bak
A	xmcl-electron-app/main/defaultApp.ts.bak
M	xmcl-electron-app/main/definedLocales.ts
M	xmcl-electron-app/main/index.dev.ts
D	xmcl-electron-app/main/locales/de.yaml
M	xmcl-electron-app/main/locales/en.yaml
D	xmcl-electron-app/main/locales/fr.yaml
D	xmcl-electron-app/main/locales/gl.yaml
D	xmcl-electron-app/main/locales/hu.yaml
D	xmcl-electron-app/main/locales/ja-JP.yaml
D	xmcl-electron-app/main/locales/lolcat.yaml
D	xmcl-electron-app/main/locales/nl.yaml
D	xmcl-electron-app/main/locales/pl.yaml
D	xmcl-electron-app/main/locales/pt-BR.yaml
D	xmcl-electron-app/main/locales/ru.yaml
D	xmcl-electron-app/main/locales/uk.yaml
D	xmcl-electron-app/main/locales/zh-CN.yaml
D	xmcl-electron-app/main/locales/zh-TW.yaml
M	xmcl-electron-app/main/utils/updater.ts
A	xmcl-electron-app/main/utils/updater.ts.bak
A	xmcl-electron-app/main/utils/updater.ts.old
M	xmcl-electron-app/package.json
A	xmcl-electron-app/package.json.bak
M	xmcl-electron-app/postinstall.ts
A	xmcl-electron-app/postinstall.ts.bak
D	xmcl-keystone-ui/locales/de.yaml
M	xmcl-keystone-ui/locales/en.yaml
M	xmcl-keystone-ui/locales/es-ES.yaml
D	xmcl-keystone-ui/locales/fr.yaml
D	xmcl-keystone-ui/locales/gl.yaml
D	xmcl-keystone-ui/locales/hu.yaml
D	xmcl-keystone-ui/locales/it-IT.yaml
D	xmcl-keystone-ui/locales/ja-JP.yaml
D	xmcl-keystone-ui/locales/kz.yaml
D	xmcl-keystone-ui/locales/lolcat.yaml
D	xmcl-keystone-ui/locales/pl.yaml
D	xmcl-keystone-ui/locales/pt-BR.yaml
D	xmcl-keystone-ui/locales/ru.yaml
D	xmcl-keystone-ui/locales/uk.yaml
D	xmcl-keystone-ui/locales/zh-CN.yaml
D	xmcl-keystone-ui/locales/zh-TW.yaml
M	xmcl-keystone-ui/package.json
M	xmcl-keystone-ui/src/app.html
M	xmcl-keystone-ui/src/browser.html
M	xmcl-keystone-ui/src/components/UserLoginForm.vue
M	xmcl-keystone-ui/src/composables/login.ts
M	xmcl-keystone-ui/src/composables/tutorial.ts
M	xmcl-keystone-ui/src/composables/user.ts
M	xmcl-keystone-ui/src/i18n.ts
M	xmcl-keystone-ui/src/index.html
M	xmcl-keystone-ui/src/multiplayer.html
M	xmcl-keystone-ui/src/views/AppSystemBar.vue
A	xmcl-keystone-ui/src/views/AppSystemBar.vue.bak
M	xmcl-keystone-ui/src/views/BaseSetting.vue
A	xmcl-keystone-ui/src/views/BaseSetting.vue.bak
M	xmcl-keystone-ui/src/views/Home.vue
M	xmcl-keystone-ui/src/views/Me.vue
A	xmcl-keystone-ui/src/views/Me.vue.bak
M	xmcl-keystone-ui/src/views/Mod.vue
A	xmcl-keystone-ui/src/views/Mod.vue.bak
A	xmcl-keystone-ui/src/views/Multiplayer.vue.bak
M	xmcl-keystone-ui/src/views/Setting.vue
M	xmcl-keystone-ui/src/views/StoreEntry.vue
A	xmcl-keystone-ui/src/views/StoreEntry.vue.bak
M	xmcl-keystone-ui/src/windows/main/App.vue
M	xmcl-keystone-ui/src/windows/main/Context.ts
M	xmcl-keystone-ui/src/windows/main/index.ts
M	xmcl-runtime-api/src/entities/InstanceInstallLockSchema.json
M	xmcl-runtime-api/src/entities/InstanceLockSchema.json
M	xmcl-runtime-api/src/entities/InstanceSchema.json
M	xmcl-runtime-api/src/entities/exception.ts
M	xmcl-runtime-api/src/entities/instance.schema.ts
M	xmcl-runtime/constant.ts
M	xmcl-runtime/global.d.ts
M	xmcl-runtime/install/InstallService.ts
M	xmcl-runtime/instance/InstanceService.ts
M	xmcl-runtime/launch/LaunchService.ts
M	xmcl-runtime/presence/PresenceService.ts
M	xmcl-runtime/resource/core/snapshot.ts
M	xmcl-runtime/resource/core/watchResourcesDirectory.ts
M	xmcl-runtime/resource/pluginResourceWorker.ts
M	xmcl-runtime/resourcePack/AbstractInstanceDoaminService.ts
M	xmcl-runtime/save/InstanceSavesService.ts
M	xmcl-runtime/setup/setupWorkerEntry.ts
M	xmcl-runtime/user/accountSystems/MicrosoftAccountSystem.ts
M	xmcl-runtime/util/fs.ts
A	xmcl/.gitattributes
A	xmcl/.github/actions/prepare-pr/index.ts
A	xmcl/.github/actions/prepare-pr/package.json
A	xmcl/.github/actions/prepare-pr/tsconfig.json
A	xmcl/.github/workflows/build.yml
A	xmcl/.github/workflows/github-pages.yml
A	xmcl/.github/workflows/release.yml
A	xmcl/.github/workflows/validation.yml
A	xmcl/.gitignore
A	xmcl/.npmignore
A	xmcl/.npmrc
A	xmcl/.vscode/settings.json
A	xmcl/.vscode/tasks.json
A	xmcl/mock/modpack.zip
A	xmcl/mock/mods/dummy-mod.jar
A	xmcl/mock/mods/fabric-sample-2.jar
A	xmcl/mock/mods/fabric-sample.jar
A	xmcl/mock/mods/sample-ccc-mod.jar
A	xmcl/mock/mods/sample-mod-1.13-no-deps.jar
A	xmcl/mock/mods/sample-mod-1.13.jar
A	xmcl/mock/mods/sample-mod.jar
A	xmcl/mock/mods/sample-mod.litemod
A	xmcl/mock/mods/sample-nei-mod.jar
A	xmcl/mock/mods/tweak-class.jar
A	xmcl/mock/options.txt
A	xmcl/mock/pack.png
A	xmcl/mock/resourcepacks/1.14.4.zip
A	xmcl/mock/resourcepacks/empty-resourcepack.zip
A	xmcl/mock/resourcepacks/sample-resourcepack.zip
A	xmcl/mock/resourcepacks/sample-resourcepack/pack.mcmeta
A	xmcl/mock/resourcepacks/sample-resourcepack/pack.png
A	xmcl/mock/sample-forge-new.html
A	xmcl/mock/sample-forge.html
A	xmcl/mock/saves/1.12.2/block.txt
A	xmcl/mock/saves/1.12.2/data.txt
A	xmcl/mock/saves/1.12.2/mock.txt
A	xmcl/mock/saves/1.12.2/region/r.0.0.mca
A	xmcl/mock/saves/1.14.4/mock.txt
A	xmcl/mock/saves/1.14.4/region/r.0.0.mca
A	xmcl/mock/saves/1.16.4/mock.txt
A	xmcl/mock/saves/1.16.4/region/r.0.0.mca
A	xmcl/mock/saves/1.16.5/region/r.0.0.mca
A	xmcl/mock/saves/1.19.3/region/r.0.0.mca
A	xmcl/mock/saves/sample-map.zip
A	xmcl/mock/saves/sample-map/icon.png
A	xmcl/mock/saves/sample-map/level.dat
A	xmcl/mock/saves/sample-map/playerdata/abf81fe9-9f0d-4948-a909-7721a8198ac4.dat
A	xmcl/mock/saves/sample-map/region/r.0.0.mca
A	xmcl/mock/servers.dat
A	xmcl/mock/versions/1.14.4-forge-28.0.47/1.14.4-forge-28.0.47.json
A	xmcl/mock/versions/1.14.4/1.14.4.json
A	xmcl/mock/versions/1.17.1-forge-37.0.97/1.17.1-forge-37.0.97.json
A	xmcl/mock/versions/1.17.1/1.17.1.json
A	xmcl/mock/versions/1.7.10-Forge10.13.3.1400-1.7.10/1.7.10-Forge10.13.3.1400-1.7.10.json
A	xmcl/mock/versions/1.7.10/1.7.10.json
A	xmcl/mock/versions/mock/mock.json
A	xmcl/mock/versions/no-assets-json/no-assets-json.json
A	xmcl/mock/versions/no-downloads/no-downloads.json
A	xmcl/mock/versions/no-main-class/no-main-class.json
A	xmcl/oxlintrc.json
A	xmcl/package.json
A	xmcl/packages/asm/.npmignore
A	xmcl/packages/asm/LICENSE
A	xmcl/packages/asm/README.md
A	xmcl/packages/asm/index.ts
A	xmcl/packages/asm/libs/AnnotationVisitor.ts
A	xmcl/packages/asm/libs/AnnotationWriter.ts
A	xmcl/packages/asm/libs/Attribute.ts
A	xmcl/packages/asm/libs/ByteVector.ts
A	xmcl/packages/asm/libs/ClassReader.ts
A	xmcl/packages/asm/libs/ClassReaderConstant.ts
A	xmcl/packages/asm/libs/ClassVisitor.ts
A	xmcl/packages/asm/libs/ClassWriter.ts
A	xmcl/packages/asm/libs/ClassWriterConstant.ts
A	xmcl/packages/asm/libs/Context.ts
A	xmcl/packages/asm/libs/CurrentFrame.ts
A	xmcl/packages/asm/libs/Edge.ts
A	xmcl/packages/asm/libs/FieldVisitor.ts
A	xmcl/packages/asm/libs/FieldWriter.ts
A	xmcl/packages/asm/libs/Frame.ts
A	xmcl/packages/asm/libs/Handle.ts
A	xmcl/packages/asm/libs/Item.ts
A	xmcl/packages/asm/libs/Label.ts
A	xmcl/packages/asm/libs/MethodVisitor.ts
A	xmcl/packages/asm/libs/MethodWriter.ts
A	xmcl/packages/asm/libs/MethodWriterConstant.ts
A	xmcl/packages/asm/libs/Opcodes.ts
A	xmcl/packages/asm/libs/Type.ts
A	xmcl/packages/asm/libs/TypePath.ts
A	xmcl/packages/asm/libs/TypeReference.ts
A	xmcl/packages/asm/libs/bits.ts
A	xmcl/packages/asm/libs/utils.ts
A	xmcl/packages/asm/package.json
A	xmcl/packages/asm/tsconfig.json
A	xmcl/packages/bytebuffer/.npmignore
A	xmcl/packages/bytebuffer/README.md
A	xmcl/packages/bytebuffer/build.ts
A	xmcl/packages/bytebuffer/debug.ts
A	xmcl/packages/bytebuffer/hex.ts
A	xmcl/packages/bytebuffer/index.ts
A	xmcl/packages/bytebuffer/package.json
A	xmcl/packages/bytebuffer/tsconfig.json
A	xmcl/packages/bytebuffer/varint32.ts
A	xmcl/packages/bytebuffer/varint64.ts
A	xmcl/packages/client/.npmignore
A	xmcl/packages/client/README.md
A	xmcl/packages/client/channel.ts
A	xmcl/packages/client/coders.test.ts
A	xmcl/packages/client/coders.ts
A	xmcl/packages/client/index.ts
A	xmcl/packages/client/lan.ts
A	xmcl/packages/client/package.json
A	xmcl/packages/client/packet.ts
A	xmcl/packages/client/status.ts
A	xmcl/packages/client/test.ts
A	xmcl/packages/client/tsconfig.json
A	xmcl/packages/core/.npmignore
A	xmcl/packages/core/README.md
A	xmcl/packages/core/__mocks__/utils.ts
A	xmcl/packages/core/diagnose.test.ts
A	xmcl/packages/core/diagnose.ts
A	xmcl/packages/core/folder.test.ts
A	xmcl/packages/core/folder.ts
A	xmcl/packages/core/index.ts
A	xmcl/packages/core/launch.e2e.test.ts
A	xmcl/packages/core/launch.test.ts
A	xmcl/packages/core/launch.ts
A	xmcl/packages/core/package.json
A	xmcl/packages/core/platform.ts
A	xmcl/packages/core/tsconfig.json
A	xmcl/packages/core/utils.test.ts
A	xmcl/packages/core/utils.ts
A	xmcl/packages/core/version.test.ts
A	xmcl/packages/core/version.ts
A	xmcl/packages/curseforge/.npmignore
A	xmcl/packages/curseforge/README.md
A	xmcl/packages/curseforge/index.test.ts
A	xmcl/packages/curseforge/index.ts
A	xmcl/packages/curseforge/package.json
A	xmcl/packages/curseforge/tsconfig.json
A	xmcl/packages/discord-rpc/.gitignore
A	xmcl/packages/discord-rpc/.npmignore
A	xmcl/packages/discord-rpc/Client.ts
A	xmcl/packages/discord-rpc/LICENSE
A	xmcl/packages/discord-rpc/README.md
A	xmcl/packages/discord-rpc/index.ts
A	xmcl/packages/discord-rpc/package.json
A	xmcl/packages/discord-rpc/structures/Base.ts
A	xmcl/packages/discord-rpc/structures/CertifiedDevice.ts
A	xmcl/packages/discord-rpc/structures/Channel.ts
A	xmcl/packages/discord-rpc/structures/ClientUser.ts
A	xmcl/packages/discord-rpc/structures/Guild.ts
A	xmcl/packages/discord-rpc/structures/Lobby.ts
A	xmcl/packages/discord-rpc/structures/Message.ts
A	xmcl/packages/discord-rpc/structures/Transport.ts
A	xmcl/packages/discord-rpc/structures/User.ts
A	xmcl/packages/discord-rpc/structures/VoiceSettings.ts
A	xmcl/packages/discord-rpc/transport/IPC.ts
A	xmcl/packages/discord-rpc/tsconfig.json
A	xmcl/packages/discord-rpc/utils/RPCError.ts
A	xmcl/packages/discord-rpc/utils/TypedEmitter.ts
A	xmcl/packages/file-transfer/README.md
A	xmcl/packages/file-transfer/agent.ts
A	xmcl/packages/file-transfer/checkpoint.ts
A	xmcl/packages/file-transfer/download.ts
A	xmcl/packages/file-transfer/error.ts
A	xmcl/packages/file-transfer/index.ts
A	xmcl/packages/file-transfer/metadata.ts
A	xmcl/packages/file-transfer/package.json
A	xmcl/packages/file-transfer/progress.ts
A	xmcl/packages/file-transfer/rangePolicy.ts
A	xmcl/packages/file-transfer/retry.ts
A	xmcl/packages/file-transfer/tsconfig.json
A	xmcl/packages/file-transfer/validator.ts
A	xmcl/packages/forge-site-parser/.npmignore
A	xmcl/packages/forge-site-parser/README.md
A	xmcl/packages/forge-site-parser/index.test.ts
A	xmcl/packages/forge-site-parser/index.ts
A	xmcl/packages/forge-site-parser/package.json
A	xmcl/packages/forge-site-parser/tsconfig.json
A	xmcl/packages/game-data/.npmignore
A	xmcl/packages/game-data/README.md
A	xmcl/packages/game-data/index.ts
A	xmcl/packages/game-data/level.test.ts
A	xmcl/packages/game-data/level.ts
A	xmcl/packages/game-data/package.json
A	xmcl/packages/game-data/serverDat.test.ts
A	xmcl/packages/game-data/serverDat.ts
A	xmcl/packages/game-data/tsconfig.json
A	xmcl/packages/gamesetting/.npmignore
A	xmcl/packages/gamesetting/README.md
A	xmcl/packages/gamesetting/index.test.ts
A	xmcl/packages/gamesetting/index.ts
A	xmcl/packages/gamesetting/package.json
A	xmcl/packages/gamesetting/tsconfig.json
A	xmcl/packages/installer/.npmignore
A	xmcl/packages/installer/README.md
A	xmcl/packages/installer/diagnose.ts
A	xmcl/packages/installer/downloadTask.ts
A	xmcl/packages/installer/fabric.ts
A	xmcl/packages/installer/forge.ts
A	xmcl/packages/installer/index.ts
A	xmcl/packages/installer/install.e2e.test.ts
A	xmcl/packages/installer/java-runtime.ts
A	xmcl/packages/installer/java.test.ts
A	xmcl/packages/installer/java.ts
A	xmcl/packages/installer/labymod.ts
A	xmcl/packages/installer/liteloader.ts
A	xmcl/packages/installer/manifest.test.ts
A	xmcl/packages/installer/manifest.ts
A	xmcl/packages/installer/minecraft.ts
A	xmcl/packages/installer/neoForged.ts
A	xmcl/packages/installer/optifine.ts
A	xmcl/packages/installer/package.json
A	xmcl/packages/installer/profile.ts
A	xmcl/packages/installer/quilt.ts
A	xmcl/packages/installer/tsconfig.json
A	xmcl/packages/installer/unzip.ts
A	xmcl/packages/installer/utils.ts
A	xmcl/packages/installer/zipValdiator.ts
A	xmcl/packages/mod-parser/.npmignore
A	xmcl/packages/mod-parser/README.md
A	xmcl/packages/mod-parser/fabric.test.ts
A	xmcl/packages/mod-parser/fabric.ts
A	xmcl/packages/mod-parser/forge.test.ts
A	xmcl/packages/mod-parser/forge.ts
A	xmcl/packages/mod-parser/forgeConfig.ts
A	xmcl/packages/mod-parser/index.ts
A	xmcl/packages/mod-parser/liteloader.test.ts
A	xmcl/packages/mod-parser/liteloader.ts
A	xmcl/packages/mod-parser/package.json
A	xmcl/packages/mod-parser/quilt.ts
A	xmcl/packages/mod-parser/tsconfig.json
A	xmcl/packages/model/.npmignore
A	xmcl/packages/model/README.md
A	xmcl/packages/model/block.ts
A	xmcl/packages/model/index.ts
A	xmcl/packages/model/package.json
A	xmcl/packages/model/player-model.ts
A	xmcl/packages/model/player.ts
A	xmcl/packages/model/tsconfig.json
A	xmcl/packages/modrinth/README.md
A	xmcl/packages/modrinth/index.test.ts
A	xmcl/packages/modrinth/index.ts
A	xmcl/packages/modrinth/package.json
A	xmcl/packages/modrinth/tsconfig.json
A	xmcl/packages/modrinth/types.ts
A	xmcl/packages/nat-api/.npmignore
A	xmcl/packages/nat-api/LICENSE
A	xmcl/packages/nat-api/README.md
A	xmcl/packages/nat-api/index.ts
A	xmcl/packages/nat-api/lib/device.ts
A	xmcl/packages/nat-api/lib/pmp.ts
A	xmcl/packages/nat-api/lib/ssdp.ts
A	xmcl/packages/nat-api/lib/upnp.ts
A	xmcl/packages/nat-api/package.json
A	xmcl/packages/nat-api/tsconfig.json
A	xmcl/packages/nbt/.npmignore
A	xmcl/packages/nbt/README.md
A	xmcl/packages/nbt/index.test.ts
A	xmcl/packages/nbt/index.ts
A	xmcl/packages/nbt/package.json
A	xmcl/packages/nbt/tsconfig.json
A	xmcl/packages/nbt/utils.ts
A	xmcl/packages/nbt/zlib/index.browser.ts
A	xmcl/packages/nbt/zlib/index.ts
A	xmcl/packages/nbt/zlib/package.json
A	xmcl/packages/nbt/zlib/tsconfig.json
A	xmcl/packages/oxlint-config/.gitignore
A	xmcl/packages/oxlint-config/oxlintrc.json
A	xmcl/packages/oxlint-config/package.json
A	xmcl/packages/resourcepack/.npmignore
A	xmcl/packages/resourcepack/README.md
A	xmcl/packages/resourcepack/format.ts
A	xmcl/packages/resourcepack/index.ts
A	xmcl/packages/resourcepack/modelLoader.ts
A	xmcl/packages/resourcepack/package.json
A	xmcl/packages/resourcepack/resourceManager.test.ts
A	xmcl/packages/resourcepack/resourceManager.ts
A	xmcl/packages/resourcepack/resourcePack.test.ts
A	xmcl/packages/resourcepack/resourcePack.ts
A	xmcl/packages/resourcepack/tsconfig.json
A	xmcl/packages/semver/.npmignore
A	xmcl/packages/semver/LICENSE
A	xmcl/packages/semver/README.md
A	xmcl/packages/semver/index.ts
A	xmcl/packages/semver/operators.ts
A	xmcl/packages/semver/package.json
A	xmcl/packages/semver/range.ts
A	xmcl/packages/semver/semver.ts
A	xmcl/packages/semver/tsconfig.json
A	xmcl/packages/system/.npmignore
A	xmcl/packages/system/README.md
A	xmcl/packages/system/index.browser.ts
A	xmcl/packages/system/index.ts
A	xmcl/packages/system/package.json
A	xmcl/packages/system/system.test.ts
A	xmcl/packages/system/system.ts
A	xmcl/packages/system/tsconfig.json
A	xmcl/packages/task/.npmignore
A	xmcl/packages/task/README.md
A	xmcl/packages/task/index.test.ts
A	xmcl/packages/task/index.ts
A	xmcl/packages/task/package.json
A	xmcl/packages/task/tsconfig.json
A	xmcl/packages/text-component/.npmignore
A	xmcl/packages/text-component/README.md
A	xmcl/packages/text-component/index.test.ts
A	xmcl/packages/text-component/index.ts
A	xmcl/packages/text-component/package.json
A	xmcl/packages/text-component/tsconfig.json
A	xmcl/packages/undici-shim/index.ts
A	xmcl/packages/undici-shim/package.json
A	xmcl/packages/undici-shim/tsconfig.json
A	xmcl/packages/unzip/.npmignore
A	xmcl/packages/unzip/README.md
A	xmcl/packages/unzip/index.test.ts
A	xmcl/packages/unzip/index.ts
A	xmcl/packages/unzip/package.json
A	xmcl/packages/unzip/tsconfig.json
A	xmcl/packages/user-offline-uuid/index.browser.ts
A	xmcl/packages/user-offline-uuid/index.ts
A	xmcl/packages/user-offline-uuid/package.json
A	xmcl/packages/user-offline-uuid/tsconfig.json
A	xmcl/packages/user/.npmignore
A	xmcl/packages/user/README.md
A	xmcl/packages/user/gameProfile.ts
A	xmcl/packages/user/index.ts
A	xmcl/packages/user/microsoft.test.ts
A	xmcl/packages/user/microsoft.ts
A	xmcl/packages/user/mojang.test.ts
A	xmcl/packages/user/mojang.ts
A	xmcl/packages/user/offline.test.ts
A	xmcl/packages/user/offline.ts
A	xmcl/packages/user/package.json
A	xmcl/packages/user/tsconfig.json
A	xmcl/packages/user/yggdrasil.test.ts
A	xmcl/packages/user/yggdrasil.ts
A	xmcl/pnpm-lock.yaml
A	xmcl/pnpm-workspace.yaml
A	xmcl/protocol.json
A	xmcl/scripts/docs.ts
A	xmcl/test-setup.ts
A	xmcl/test.d.ts
A	xmcl/tsconfig.json
A	xmcl/vitest.config.ts
```

### E. Inventario completo ancestro a HEAD (incluye código upstream copiado)

```text
D	.eslintrc.json
M	.gitattributes
D	.gitmodules
D	.vscode/extensions.json
D	.vscode/launch.json
D	.vscode/settings.json
D	.vscode/tasks.json
D	.vscode/vue.code-snippets
D	CHANGELOG.legacy.md
D	CODE_OF_CONDUCT.md
D	CONTRIBUTING.i18n.md
D	CONTRIBUTING.md
D	CONTRIBUTING.zh.md
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
M	README.md
D	README.uk.md
D	README.zh.md
D	USAGE.md
M	assets/locales.json
A	latest_version.json
M	package.json
M	pnpm-lock.yaml
D	xmcl
D	xmcl-electron-app/CHANGELOG.legacy.md
M	xmcl-electron-app/build.ts
A	xmcl-electron-app/build.ts.bak
M	xmcl-electron-app/build/appinstaller-builder.ts
A	xmcl-electron-app/build/appinstaller-builder.ts.bak
M	xmcl-electron-app/build/appxmanifest.xml
M	xmcl-electron-app/build/electron-builder.config.ts
A	xmcl-electron-app/build/electron-builder.config.ts.bak
A	xmcl-electron-app/build/elevate.exe
A	xmcl-electron-app/build/entitlements.mac.plist
M	xmcl-electron-app/dev.ts
A	xmcl-electron-app/dev.ts.bak
M	xmcl-electron-app/esbuild.config.ts
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
M	xmcl-electron-app/main/ElectronController.ts
M	xmcl-electron-app/main/ElectronLauncherApp.ts
M	xmcl-electron-app/main/ElectronSecretStorage.ts
A	xmcl-electron-app/main/ElectronSession.ts
D	xmcl-electron-app/main/assets/craftingtable.png
D	xmcl-electron-app/main/assets/fabric.png
D	xmcl-electron-app/main/assets/forge.png
D	xmcl-electron-app/main/assets/iris.webp
M	xmcl-electron-app/main/assets/languages.json
D	xmcl-electron-app/main/assets/minecraft.png
D	xmcl-electron-app/main/assets/minecraft.webp
D	xmcl-electron-app/main/assets/mmc.png
D	xmcl-electron-app/main/assets/neoforged.png
M	xmcl-electron-app/main/constant.ts
A	xmcl-electron-app/main/constant.ts.bak
M	xmcl-electron-app/main/controllers/gameLaunch.ts
M	xmcl-electron-app/main/controllers/i18n.ts
M	xmcl-electron-app/main/controllers/index.ts
M	xmcl-electron-app/main/controllers/notification.ts
A	xmcl-electron-app/main/controllers/optifine.ts
D	xmcl-electron-app/main/controllers/setupWindow.ts
M	xmcl-electron-app/main/controllers/theme.ts
M	xmcl-electron-app/main/controllers/tray.ts
A	xmcl-electron-app/main/controllers/tray.ts.bak
M	xmcl-electron-app/main/controllers/windowController.ts
M	xmcl-electron-app/main/defaultApp.ts
A	xmcl-electron-app/main/defaultApp.ts.bak
M	xmcl-electron-app/main/definedLocales.ts
M	xmcl-electron-app/main/definedPlugins.ts
M	xmcl-electron-app/main/definedServices.ts
M	xmcl-electron-app/main/global.d.ts
M	xmcl-electron-app/main/index.dev.ts
M	xmcl-electron-app/main/index.ts
D	xmcl-electron-app/main/locales/de.yaml
M	xmcl-electron-app/main/locales/en.yaml
D	xmcl-electron-app/main/locales/fr.yaml
D	xmcl-electron-app/main/locales/gl.yaml
D	xmcl-electron-app/main/locales/nl.yaml
D	xmcl-electron-app/main/locales/ru.yaml
D	xmcl-electron-app/main/locales/uk.yaml
D	xmcl-electron-app/main/locales/zh-CN.yaml
D	xmcl-electron-app/main/locales/zh-TW.yaml
M	xmcl-electron-app/main/pluginAutoUpdate.ts
D	xmcl-electron-app/main/pluginCommonProtocol.ts
M	xmcl-electron-app/main/pluginIconProtocol.ts
M	xmcl-electron-app/main/pluginNvdiaGPULinux.ts
M	xmcl-electron-app/main/pluginPowerMonitor.ts
D	xmcl-electron-app/main/pluginSetupWorker.ts
D	xmcl-electron-app/main/setupWorkerEntry.ts
M	xmcl-electron-app/main/utils/elevate.ts
D	xmcl-electron-app/main/utils/fs.ts
A	xmcl-electron-app/main/utils/login.ts
M	xmcl-electron-app/main/utils/updater.ts
A	xmcl-electron-app/main/utils/updater.ts.bak
A	xmcl-electron-app/main/utils/updater.ts.old
M	xmcl-electron-app/main/utils/windowSizeTracker.ts
M	xmcl-electron-app/package.json
A	xmcl-electron-app/package.json.bak
A	xmcl-electron-app/plugins/esbuild.elevate.plugin.ts
M	xmcl-electron-app/plugins/esbuild.native.plugin.ts
M	xmcl-electron-app/plugins/esbuild.node.plugin.ts
M	xmcl-electron-app/plugins/esbuild.preload.plugin.ts
M	xmcl-electron-app/plugins/esbuild.worker.plugin.ts
M	xmcl-electron-app/postinstall.ts
A	xmcl-electron-app/postinstall.ts.bak
A	xmcl-electron-app/postsign.ts
D	xmcl-electron-app/preload/.eslintrc.json
M	xmcl-electron-app/preload/controller.ts
M	xmcl-electron-app/preload/index.ts
A	xmcl-electron-app/preload/migration.ts
A	xmcl-electron-app/preload/multiplayer.ts
A	xmcl-electron-app/preload/optifine.ts
D	xmcl-electron-app/preload/semaphore.ts
M	xmcl-electron-app/preload/service.ts
M	xmcl-electron-app/preload/tsconfig.json
M	xmcl-keystone-ui/.eslintrc-auto-import.json
D	xmcl-keystone-ui/.eslintrc.json
D	xmcl-keystone-ui/locales/de.yaml
M	xmcl-keystone-ui/locales/en.yaml
M	xmcl-keystone-ui/locales/es-ES.yaml
D	xmcl-keystone-ui/locales/fr.yaml
D	xmcl-keystone-ui/locales/gl.yaml
D	xmcl-keystone-ui/locales/ru.yaml
D	xmcl-keystone-ui/locales/uk.yaml
D	xmcl-keystone-ui/locales/zh-CN.yaml
D	xmcl-keystone-ui/locales/zh-TW.yaml
M	xmcl-keystone-ui/package.json
M	xmcl-keystone-ui/src/app.html
M	xmcl-keystone-ui/src/assets/common.css
A	xmcl-keystone-ui/src/assets/craftingtable.webp
A	xmcl-keystone-ui/src/assets/fabric.webp
A	xmcl-keystone-ui/src/assets/forge.webp
M	xmcl-keystone-ui/src/assets/google.font.css
A	xmcl-keystone-ui/src/assets/iris.webp
A	xmcl-keystone-ui/src/assets/kofi.webp
R100	xmcl-electron-app/main/assets/labymod.webp	xmcl-keystone-ui/src/assets/labymod.webp
A	xmcl-keystone-ui/src/assets/material-symbols-outlined.woff2
A	xmcl-keystone-ui/src/assets/minecraft.webp
A	xmcl-keystone-ui/src/assets/mmc.webp
A	xmcl-keystone-ui/src/assets/neoforged.webp
A	xmcl-keystone-ui/src/assets/oculus.webp
R100	xmcl-electron-app/main/assets/optifine.webp	xmcl-keystone-ui/src/assets/optifine.webp
R100	xmcl-electron-app/main/assets/quilt.svg	xmcl-keystone-ui/src/assets/quilt.svg
D	xmcl-keystone-ui/src/assets/unknown_pack.png
D	xmcl-keystone-ui/src/assets/unknown_server.png
A	xmcl-keystone-ui/src/assets/unknown_server.webp
M	xmcl-keystone-ui/src/auto-imports.d.ts
M	xmcl-keystone-ui/src/browser.html
A	xmcl-keystone-ui/src/components/AppAudioPlayer.vue
A	xmcl-keystone-ui/src/components/AppChangeInstanceIconCard.vue
A	xmcl-keystone-ui/src/components/AppCollectionList.vue
M	xmcl-keystone-ui/src/components/AppCopyChip.vue
M	xmcl-keystone-ui/src/components/AppLoadingCircular.vue
M	xmcl-keystone-ui/src/components/AppSharedTooltip.vue
M	xmcl-keystone-ui/src/components/AppSystemBarBadge.vue
M	xmcl-keystone-ui/src/components/AvatarItem.vue
M	xmcl-keystone-ui/src/components/CategoryChip.vue
A	xmcl-keystone-ui/src/components/CurseforgeCategoryChip.vue
M	xmcl-keystone-ui/src/components/CurseforgeIcon.vue
A	xmcl-keystone-ui/src/components/EnvVarAddItem.vue
A	xmcl-keystone-ui/src/components/EnvVarTableItem.vue
M	xmcl-keystone-ui/src/components/FeedbackCard.vue
M	xmcl-keystone-ui/src/components/GalleryGrid.vue
M	xmcl-keystone-ui/src/components/Halo.vue
M	xmcl-keystone-ui/src/components/Hint.vue
M	xmcl-keystone-ui/src/components/HomeCard.vue
M	xmcl-keystone-ui/src/components/InfoHighlight.vue
A	xmcl-keystone-ui/src/components/InstanceItem.vue
A	xmcl-keystone-ui/src/components/InstanceManifestFileItem.vue
M	xmcl-keystone-ui/src/components/InstanceManifestFileTree.vue
M	xmcl-keystone-ui/src/components/InstanceSelectMenu.vue
D	xmcl-keystone-ui/src/components/LocalVersionItem.vue
M	xmcl-keystone-ui/src/components/LogView.vue
M	xmcl-keystone-ui/src/components/MarketBase.vue
M	xmcl-keystone-ui/src/components/MarketItem.vue
M	xmcl-keystone-ui/src/components/MarketProjectDetail.vue
M	xmcl-keystone-ui/src/components/MarketProjectDetailCurseforge.vue
M	xmcl-keystone-ui/src/components/MarketProjectDetailModrinth.vue
M	xmcl-keystone-ui/src/components/MarketProjectDetailVersion.vue
A	xmcl-keystone-ui/src/components/MarketRecommendation.vue
M	xmcl-keystone-ui/src/components/MarketTextField.vue
M	xmcl-keystone-ui/src/components/MarketTextFieldWithMenu.vue
D	xmcl-keystone-ui/src/components/ModpackListItem.vue
A	xmcl-keystone-ui/src/components/ModrinthCategoryChip.vue
M	xmcl-keystone-ui/src/components/PlayerAvatar.vue
M	xmcl-keystone-ui/src/components/SettingHeader.vue
A	xmcl-keystone-ui/src/components/SettingItem.vue
M	xmcl-keystone-ui/src/components/SettingItemCheckbox.vue
M	xmcl-keystone-ui/src/components/SettingItemSelect.vue
R074	xmcl-keystone-ui/src/components/DeleteDialog.vue	xmcl-keystone-ui/src/components/SimpleDialog.vue
M	xmcl-keystone-ui/src/components/SplitPane.vue
M	xmcl-keystone-ui/src/components/StepChoice.vue
M	xmcl-keystone-ui/src/components/StepConfig.vue
M	xmcl-keystone-ui/src/components/StepManualFTB.vue
M	xmcl-keystone-ui/src/components/StepSelect.vue
M	xmcl-keystone-ui/src/components/StepServer.vue
M	xmcl-keystone-ui/src/components/StepTemplate.vue
M	xmcl-keystone-ui/src/components/StepperAdvanceContent.vue
M	xmcl-keystone-ui/src/components/StepperFooter.vue
M	xmcl-keystone-ui/src/components/StoreExploreCard.vue
M	xmcl-keystone-ui/src/components/StoreExploreCategories.vue
M	xmcl-keystone-ui/src/components/StoreProject.vue
M	xmcl-keystone-ui/src/components/StoreProjectExternal.vue
M	xmcl-keystone-ui/src/components/StoreProjectGallery.vue
M	xmcl-keystone-ui/src/components/StoreProjectHeader.vue
M	xmcl-keystone-ui/src/components/StoreProjectInstallVersionDialog.vue
A	xmcl-keystone-ui/src/components/StoreProjectInstallVersionDialogVersion.vue
M	xmcl-keystone-ui/src/components/TaskSpeedMonitor.vue
R070	xmcl-keystone-ui/src/views/UserMenu.vue	xmcl-keystone-ui/src/components/UserCard.vue
R093	xmcl-keystone-ui/src/views/UserMenuMicrosoft.vue	xmcl-keystone-ui/src/components/UserCardMicrosoft.vue
R094	xmcl-keystone-ui/src/views/UserMenuUserItem.vue	xmcl-keystone-ui/src/components/UserCardUserItem.vue
R100	xmcl-keystone-ui/src/views/UserMenuYggdrasil.vue	xmcl-keystone-ui/src/components/UserCardYggdrasil.vue
R100	xmcl-keystone-ui/src/views/AppLoginAuthoritySelect.vue	xmcl-keystone-ui/src/components/UserLoginAuthoritySelect.vue
R076	xmcl-keystone-ui/src/views/AppLoginForm.vue	xmcl-keystone-ui/src/components/UserLoginForm.vue
R098	xmcl-keystone-ui/src/views/UserSkin.vue	xmcl-keystone-ui/src/components/UserSkin.vue
R055	xmcl-keystone-ui/src/views/UserImportSkinUrlForm.vue	xmcl-keystone-ui/src/components/UserSkinImportUrlForm.vue
R100	xmcl-keystone-ui/src/views/UserSkinSpeedDial.vue	xmcl-keystone-ui/src/components/UserSkinSpeedDial.vue
M	xmcl-keystone-ui/src/components/VersionInputFabric.vue
M	xmcl-keystone-ui/src/components/VersionInputForge.vue
M	xmcl-keystone-ui/src/components/VersionInputLabymod.vue
M	xmcl-keystone-ui/src/components/VersionInputLocal.vue
M	xmcl-keystone-ui/src/components/VersionInputMinecraft.vue
M	xmcl-keystone-ui/src/components/VersionInputNeoForged.vue
M	xmcl-keystone-ui/src/components/VersionInputOptifine.vue
M	xmcl-keystone-ui/src/components/VersionInputQuilt.vue
A	xmcl-keystone-ui/src/components/halo.glsl
M	xmcl-keystone-ui/src/components/halo.ts
M	xmcl-keystone-ui/src/composables/appDropHandler.ts
D	xmcl-keystone-ui/src/composables/background.ts
D	xmcl-keystone-ui/src/composables/bootstrap.ts
D	xmcl-keystone-ui/src/composables/broadcastChannel.ts
M	xmcl-keystone-ui/src/composables/cache.ts
D	xmcl-keystone-ui/src/composables/colorTheme.ts
D	xmcl-keystone-ui/src/composables/compatible.ts
M	xmcl-keystone-ui/src/composables/contextMenu.ts
A	xmcl-keystone-ui/src/composables/criticalStatus.ts
M	xmcl-keystone-ui/src/composables/curseforge.ts
M	xmcl-keystone-ui/src/composables/curseforgeChangelog.ts
M	xmcl-keystone-ui/src/composables/curseforgeDependencies.ts
D	xmcl-keystone-ui/src/composables/curseforgeInstall.ts
M	xmcl-keystone-ui/src/composables/curseforgeInstaller.ts
D	xmcl-keystone-ui/src/composables/curseforgeResource.ts
M	xmcl-keystone-ui/src/composables/curseforgeSearch.ts
A	xmcl-keystone-ui/src/composables/dataRootErrors.ts
D	xmcl-keystone-ui/src/composables/databaseStatus.ts
M	xmcl-keystone-ui/src/composables/dialog.ts
D	xmcl-keystone-ui/src/composables/dragDrop.ts
M	xmcl-keystone-ui/src/composables/dropHandler.ts
D	xmcl-keystone-ui/src/composables/dropLink.ts
M	xmcl-keystone-ui/src/composables/environment.ts
M	xmcl-keystone-ui/src/composables/error.ts
M	xmcl-keystone-ui/src/composables/errorHandler.ts
M	xmcl-keystone-ui/src/composables/exception.ts
D	xmcl-keystone-ui/src/composables/extensionStyle.ts
M	xmcl-keystone-ui/src/composables/flights.ts
M	xmcl-keystone-ui/src/composables/ftb.ts
M	xmcl-keystone-ui/src/composables/i18n.ts
A	xmcl-keystone-ui/src/composables/i18nSearch.ts
M	xmcl-keystone-ui/src/composables/index.ts
D	xmcl-keystone-ui/src/composables/installList.ts
M	xmcl-keystone-ui/src/composables/instanceContextMenu.ts
M	xmcl-keystone-ui/src/composables/instanceCreation.ts
M	xmcl-keystone-ui/src/composables/instanceDefaultSource.ts
M	xmcl-keystone-ui/src/composables/instanceEdit.ts
M	xmcl-keystone-ui/src/composables/instanceExport.ts
M	xmcl-keystone-ui/src/composables/instanceFileNodeData.ts
M	xmcl-keystone-ui/src/composables/instanceFiles.ts
M	xmcl-keystone-ui/src/composables/instanceFilesDiagnose.ts
A	xmcl-keystone-ui/src/composables/instanceGroup.ts
M	xmcl-keystone-ui/src/composables/instanceJava.ts
M	xmcl-keystone-ui/src/composables/instanceJavaDiagnose.ts
M	xmcl-keystone-ui/src/composables/instanceLaunch.ts
D	xmcl-keystone-ui/src/composables/instanceModItems.ts
A	xmcl-keystone-ui/src/composables/instanceModLoaderDefault.ts
M	xmcl-keystone-ui/src/composables/instanceMods.ts
M	xmcl-keystone-ui/src/composables/instanceOptions.ts
M	xmcl-keystone-ui/src/composables/instanceResourcePack.ts
D	xmcl-keystone-ui/src/composables/instanceResourcePackItem.ts
A	xmcl-keystone-ui/src/composables/instanceSave.ts
M	xmcl-keystone-ui/src/composables/instanceShaderPack.ts
D	xmcl-keystone-ui/src/composables/instanceSort.ts
M	xmcl-keystone-ui/src/composables/instanceTemplates.ts
M	xmcl-keystone-ui/src/composables/instanceUpdate.ts
M	xmcl-keystone-ui/src/composables/instanceVersion.ts
M	xmcl-keystone-ui/src/composables/instanceVersionDiagnose.ts
M	xmcl-keystone-ui/src/composables/instanceVersionInstall.ts
A	xmcl-keystone-ui/src/composables/instanceVersionServerInstall.ts
M	xmcl-keystone-ui/src/composables/instances.ts
M	xmcl-keystone-ui/src/composables/java.ts
A	xmcl-keystone-ui/src/composables/javaHint.ts
M	xmcl-keystone-ui/src/composables/launch.ts
M	xmcl-keystone-ui/src/composables/launchButton.ts
A	xmcl-keystone-ui/src/composables/launchException.ts
M	xmcl-keystone-ui/src/composables/launchPreview.ts
M	xmcl-keystone-ui/src/composables/launchTask.ts
A	xmcl-keystone-ui/src/composables/launcherNews.ts
A	xmcl-keystone-ui/src/composables/localizedContent.ts
M	xmcl-keystone-ui/src/composables/login.ts
M	xmcl-keystone-ui/src/composables/markdown.ts
A	xmcl-keystone-ui/src/composables/marketCollectionSearch.ts
M	xmcl-keystone-ui/src/composables/marketSort.ts
D	xmcl-keystone-ui/src/composables/modCompatibility.ts
M	xmcl-keystone-ui/src/composables/modCompatibleTooltip.ts
M	xmcl-keystone-ui/src/composables/modContextMenu.ts
D	xmcl-keystone-ui/src/composables/modDelete.ts
A	xmcl-keystone-ui/src/composables/modDependenciesCheck.ts
D	xmcl-keystone-ui/src/composables/modDraggable.ts
D	xmcl-keystone-ui/src/composables/modFilter.ts
A	xmcl-keystone-ui/src/composables/modGroup.ts
A	xmcl-keystone-ui/src/composables/modLibCleaner.ts
M	xmcl-keystone-ui/src/composables/modSearch.ts
D	xmcl-keystone-ui/src/composables/modSelection.ts
M	xmcl-keystone-ui/src/composables/modUpgrade.ts
A	xmcl-keystone-ui/src/composables/modWizard.ts
M	xmcl-keystone-ui/src/composables/modpack.ts
A	xmcl-keystone-ui/src/composables/modpackInstaller.ts
M	xmcl-keystone-ui/src/composables/modrinth.ts
A	xmcl-keystone-ui/src/composables/modrinthAuthenticatedAPI.ts
M	xmcl-keystone-ui/src/composables/modrinthDependencies.ts
D	xmcl-keystone-ui/src/composables/modrinthInstall.ts
M	xmcl-keystone-ui/src/composables/modrinthInstaller.ts
D	xmcl-keystone-ui/src/composables/modrinthInstanceResource.ts
D	xmcl-keystone-ui/src/composables/modrinthLatestVersion.ts
M	xmcl-keystone-ui/src/composables/modrinthProject.ts
M	xmcl-keystone-ui/src/composables/modrinthProjectDetailData.ts
M	xmcl-keystone-ui/src/composables/modrinthSearch.ts
M	xmcl-keystone-ui/src/composables/modrinthVersions.ts
M	xmcl-keystone-ui/src/composables/mojangNews.ts
D	xmcl-keystone-ui/src/composables/nat.ts
M	xmcl-keystone-ui/src/composables/notifier.ts
D	xmcl-keystone-ui/src/composables/operation.ts
D	xmcl-keystone-ui/src/composables/peerGroup.ts
M	xmcl-keystone-ui/src/composables/peers.ts
R077	xmcl-keystone-ui/src/composables/modDetail.ts	xmcl-keystone-ui/src/composables/projectDetail.ts
M	xmcl-keystone-ui/src/composables/projectInstall.ts
M	xmcl-keystone-ui/src/composables/protocol.ts
A	xmcl-keystone-ui/src/composables/query.ts
M	xmcl-keystone-ui/src/composables/refreshable.ts
A	xmcl-keystone-ui/src/composables/resolutionPresets.ts
M	xmcl-keystone-ui/src/composables/resourcePackSearch.ts
D	xmcl-keystone-ui/src/composables/resourcePacks.ts
D	xmcl-keystone-ui/src/composables/resources.ts
D	xmcl-keystone-ui/src/composables/save.ts
A	xmcl-keystone-ui/src/composables/savesSearch.ts
A	xmcl-keystone-ui/src/composables/search.ts
D	xmcl-keystone-ui/src/composables/selectionList.ts
D	xmcl-keystone-ui/src/composables/semaphore.ts
M	xmcl-keystone-ui/src/composables/serverStatus.ts
M	xmcl-keystone-ui/src/composables/setting.ts
M	xmcl-keystone-ui/src/composables/shaderPackSearch.ts
M	xmcl-keystone-ui/src/composables/sharedTooltip.ts
M	xmcl-keystone-ui/src/composables/sortBy.ts
M	xmcl-keystone-ui/src/composables/swrv.ts
M	xmcl-keystone-ui/src/composables/swrvConfig.ts
M	xmcl-keystone-ui/src/composables/syncableState.ts
M	xmcl-keystone-ui/src/composables/task.ts
M	xmcl-keystone-ui/src/composables/taskManager.ts
A	xmcl-keystone-ui/src/composables/telemetryTrack.ts
M	xmcl-keystone-ui/src/composables/textfieldBehavior.ts
M	xmcl-keystone-ui/src/composables/theme.ts
M	xmcl-keystone-ui/src/composables/tutorial.ts
M	xmcl-keystone-ui/src/composables/uiLayout.ts
M	xmcl-keystone-ui/src/composables/useAggregateProjects.ts
M	xmcl-keystone-ui/src/composables/useBlockModelPreview.ts
M	xmcl-keystone-ui/src/composables/useMarketRoute.ts
A	xmcl-keystone-ui/src/composables/useSearchPattern.ts
M	xmcl-keystone-ui/src/composables/user.ts
M	xmcl-keystone-ui/src/composables/userDiagnose.ts
M	xmcl-keystone-ui/src/composables/version.ts
M	xmcl-keystone-ui/src/composables/versionLocal.ts
M	xmcl-keystone-ui/src/composables/vuetify.ts
D	xmcl-keystone-ui/src/composables/vuetifyColorTheme.ts
M	xmcl-keystone-ui/src/composables/windowStyle.ts
M	xmcl-keystone-ui/src/composables/yggrasil.ts
M	xmcl-keystone-ui/src/constant.ts
M	xmcl-keystone-ui/src/directives/sharedTooltip.ts
M	xmcl-keystone-ui/src/entities/task.ts
M	xmcl-keystone-ui/src/i18n.ts
M	xmcl-keystone-ui/src/index.html
A	xmcl-keystone-ui/src/migration.html
A	xmcl-keystone-ui/src/multiplayer.html
M	xmcl-keystone-ui/src/staticLocale.ts
A	xmcl-keystone-ui/src/telemetry.ts
A	xmcl-keystone-ui/src/util/ReactiveResourceState.ts
A	xmcl-keystone-ui/src/util/avatarRenderer.ts
M	xmcl-keystone-ui/src/util/basename.ts
M	xmcl-keystone-ui/src/util/clients.ts
M	xmcl-keystone-ui/src/util/curseforge.ts
M	xmcl-keystone-ui/src/util/curseforgeDependencies.ts
A	xmcl-keystone-ui/src/util/el.ts
A	xmcl-keystone-ui/src/util/error.ts
M	xmcl-keystone-ui/src/util/extensionItems.ts
M	xmcl-keystone-ui/src/util/favicon.ts
A	xmcl-keystone-ui/src/util/forgeWebParser.ts
M	xmcl-keystone-ui/src/util/ftb.ts
M	xmcl-keystone-ui/src/util/ftbClient.ts
D	xmcl-keystone-ui/src/util/instanceModLoaderDefault.ts
M	xmcl-keystone-ui/src/util/mod.ts
M	xmcl-keystone-ui/src/util/modCompatible.ts
M	xmcl-keystone-ui/src/util/modDependencies.ts
M	xmcl-keystone-ui/src/util/modpackFilesResolver.ts
M	xmcl-keystone-ui/src/util/modrinth.ts
M	xmcl-keystone-ui/src/util/search.ts
M	xmcl-keystone-ui/src/util/swrvGet.ts
A	xmcl-keystone-ui/src/util/theme.v0.ts
A	xmcl-keystone-ui/src/util/theme.v1.ts
A	xmcl-keystone-ui/src/util/tree.ts
M	xmcl-keystone-ui/src/views/AppAddInstanceDialog.vue
M	xmcl-keystone-ui/src/views/AppBackground.vue
A	xmcl-keystone-ui/src/views/AppCollectionDialog.vue
M	xmcl-keystone-ui/src/views/AppContextMenu.vue
M	xmcl-keystone-ui/src/views/AppDropDialog.vue
M	xmcl-keystone-ui/src/views/AppDropDialogPreview.vue
M	xmcl-keystone-ui/src/views/AppExportDialog.vue
A	xmcl-keystone-ui/src/views/AppExportServerDialog.vue
M	xmcl-keystone-ui/src/views/AppFeedbackDialog.vue
M	xmcl-keystone-ui/src/views/AppGameExitDialog.vue
A	xmcl-keystone-ui/src/views/AppInstallSkipDialog.vue
M	xmcl-keystone-ui/src/views/AppInstanceDeleteDialog.vue
M	xmcl-keystone-ui/src/views/AppLaunchBlockedDialog.vue
A	xmcl-keystone-ui/src/views/AppLaunchServerDialog.vue
A	xmcl-keystone-ui/src/views/AppMigrateWizardDialog.vue
A	xmcl-keystone-ui/src/views/AppModrinthLoginDialog.vue
M	xmcl-keystone-ui/src/views/AppNotifier.vue
M	xmcl-keystone-ui/src/views/AppShareInstanceDialog.vue
M	xmcl-keystone-ui/src/views/AppSideBar.vue
M	xmcl-keystone-ui/src/views/AppSideBarContentFocus.vue
M	xmcl-keystone-ui/src/views/AppSideBarContentNext.vue
A	xmcl-keystone-ui/src/views/AppSideBarGroupItem.vue
A	xmcl-keystone-ui/src/views/AppSideBarGroupItemIndicator.vue
A	xmcl-keystone-ui/src/views/AppSideBarGroupSettingDialog.vue
M	xmcl-keystone-ui/src/views/AppSideBarInstanceItem.vue
M	xmcl-keystone-ui/src/views/AppSystemBar.vue
A	xmcl-keystone-ui/src/views/AppSystemBar.vue.bak
R081	xmcl-keystone-ui/src/views/AppSystemBarUser.vue	xmcl-keystone-ui/src/views/AppSystemBarUserMenu.vue
M	xmcl-keystone-ui/src/views/AppTaskDialog.vue
M	xmcl-keystone-ui/src/views/AppTaskDialogNodeStatus.vue
M	xmcl-keystone-ui/src/views/AppTaskDialogTaskView.vue
M	xmcl-keystone-ui/src/views/AppTaskDialogTaskViewMessage.ts
M	xmcl-keystone-ui/src/views/BaseSetting.vue
A	xmcl-keystone-ui/src/views/BaseSetting.vue.bak
M	xmcl-keystone-ui/src/views/BaseSettingGeneral.vue
M	xmcl-keystone-ui/src/views/BaseSettingJava.vue
M	xmcl-keystone-ui/src/views/BaseSettingJavaList.vue
M	xmcl-keystone-ui/src/views/BaseSettingLaunch.vue
A	xmcl-keystone-ui/src/views/BaseSettingResolution.vue
M	xmcl-keystone-ui/src/views/BaseSettingSync.vue
A	xmcl-keystone-ui/src/views/BaseSettingVersions.vue
D	xmcl-keystone-ui/src/views/Curseforge.vue
D	xmcl-keystone-ui/src/views/CurseforgeCard.vue
D	xmcl-keystone-ui/src/views/CurseforgeCategories.vue
D	xmcl-keystone-ui/src/views/CurseforgeProject.vue
D	xmcl-keystone-ui/src/views/CurseforgeProjectDescription.vue
D	xmcl-keystone-ui/src/views/CurseforgeProjectFileItem.vue
D	xmcl-keystone-ui/src/views/CurseforgeProjectFiles.vue
D	xmcl-keystone-ui/src/views/CurseforgeProjectHeader.vue
D	xmcl-keystone-ui/src/views/CurseforgeProjectImages.vue
D	xmcl-keystone-ui/src/views/CurseforgeProjectRecentFiles.vue
M	xmcl-keystone-ui/src/views/Home.vue
M	xmcl-keystone-ui/src/views/HomeActions.vue
A	xmcl-keystone-ui/src/views/HomeCriticalError.vue
D	xmcl-keystone-ui/src/views/HomeDatabaseError.vue
A	xmcl-keystone-ui/src/views/HomeDropModpackDialog.vue
M	xmcl-keystone-ui/src/views/HomeExtension.vue
D	xmcl-keystone-ui/src/views/HomeFocus.vue
M	xmcl-keystone-ui/src/views/HomeFocusFooter.vue
R051	xmcl-keystone-ui/src/views/HomeDefault.vue	xmcl-keystone-ui/src/views/HomeGrid.vue
M	xmcl-keystone-ui/src/views/HomeHeader.vue
D	xmcl-keystone-ui/src/views/HomeHeaderInstance.vue
A	xmcl-keystone-ui/src/views/HomeInstanceInstallDialog.vue
D	xmcl-keystone-ui/src/views/HomeInstanceUpdateDialog.vue
D	xmcl-keystone-ui/src/views/HomeJavaIssueDialog.vue
M	xmcl-keystone-ui/src/views/HomeLaunchButton.vue
D	xmcl-keystone-ui/src/views/HomeLaunchButtonMenu.vue
A	xmcl-keystone-ui/src/views/HomeLaunchButtonMenuList.vue
A	xmcl-keystone-ui/src/views/HomeLaunchButtonStatus.vue
A	xmcl-keystone-ui/src/views/HomeLaunchButtonStatusItem.vue
M	xmcl-keystone-ui/src/views/HomeLaunchStatusDialog.vue
M	xmcl-keystone-ui/src/views/HomeLayout.vue
M	xmcl-keystone-ui/src/views/HomeLogDialog.vue
M	xmcl-keystone-ui/src/views/HomeLogDialogTab.vue
M	xmcl-keystone-ui/src/views/HomeModCard.vue
M	xmcl-keystone-ui/src/views/HomeResourcePacksCard.vue
M	xmcl-keystone-ui/src/views/HomeSavesCard.vue
M	xmcl-keystone-ui/src/views/HomeScreenshotCard.vue
M	xmcl-keystone-ui/src/views/HomeServerStatusBar.vue
M	xmcl-keystone-ui/src/views/HomeShaderPackCard.vue
M	xmcl-keystone-ui/src/views/HomeSyncButton.vue
M	xmcl-keystone-ui/src/views/HomeSyncDialogPull.vue
M	xmcl-keystone-ui/src/views/HomeSyncDialogPush.vue
M	xmcl-keystone-ui/src/views/HomeUpstreamBase.vue
M	xmcl-keystone-ui/src/views/HomeUpstreamCurseforge.vue
M	xmcl-keystone-ui/src/views/HomeUpstreamFeedTheBeast.vue
M	xmcl-keystone-ui/src/views/HomeUpstreamHeader.vue
M	xmcl-keystone-ui/src/views/HomeUpstreamModrinth.vue
M	xmcl-keystone-ui/src/views/HomeUpstreamVersion.vue
D	xmcl-keystone-ui/src/views/Instances.vue
M	xmcl-keystone-ui/src/views/InstancesCard.vue
M	xmcl-keystone-ui/src/views/InstancesCards.vue
M	xmcl-keystone-ui/src/views/Me.vue
A	xmcl-keystone-ui/src/views/Me.vue.bak
A	xmcl-keystone-ui/src/views/MeSectionHeader.vue
M	xmcl-keystone-ui/src/views/Mod.vue
A	xmcl-keystone-ui/src/views/Mod.vue.bak
M	xmcl-keystone-ui/src/views/ModActions.vue
M	xmcl-keystone-ui/src/views/ModDeleteView.vue
M	xmcl-keystone-ui/src/views/ModDetailOptifine.vue
M	xmcl-keystone-ui/src/views/ModDetailResource.vue
A	xmcl-keystone-ui/src/views/ModDuplicatedDialog.vue
M	xmcl-keystone-ui/src/views/ModExtension.vue
A	xmcl-keystone-ui/src/views/ModGroupEntryItem.vue
M	xmcl-keystone-ui/src/views/ModHeader.vue
A	xmcl-keystone-ui/src/views/ModIncompatibileDialog.vue
M	xmcl-keystone-ui/src/views/ModItem.vue
M	xmcl-keystone-ui/src/views/ModLabels.vue
A	xmcl-keystone-ui/src/views/ModOptionsPage.vue
D	xmcl-keystone-ui/src/views/Modrinth.vue
D	xmcl-keystone-ui/src/views/ModrinthCategories.vue
D	xmcl-keystone-ui/src/views/ModrinthModCard.vue
D	xmcl-keystone-ui/src/views/ModrinthProject.vue
D	xmcl-keystone-ui/src/views/ModrinthProjectBasicInfo.vue
D	xmcl-keystone-ui/src/views/ModrinthProjectDescription.vue
D	xmcl-keystone-ui/src/views/ModrinthProjectExternal.vue
D	xmcl-keystone-ui/src/views/ModrinthProjectFeaturedVersions.vue
D	xmcl-keystone-ui/src/views/ModrinthProjectGallery.vue
D	xmcl-keystone-ui/src/views/ModrinthProjectHeader.vue
D	xmcl-keystone-ui/src/views/ModrinthProjectMembers.vue
D	xmcl-keystone-ui/src/views/ModrinthProjectTags.vue
D	xmcl-keystone-ui/src/views/ModrinthProjectVersions.vue
D	xmcl-keystone-ui/src/views/ModrinthProjectVersionsTile.vue
M	xmcl-keystone-ui/src/views/Multiplayer.vue
A	xmcl-keystone-ui/src/views/Multiplayer.vue.bak
M	xmcl-keystone-ui/src/views/MultiplayerDialogInitiate.vue
M	xmcl-keystone-ui/src/views/MultiplayerDialogReceive.vue
D	xmcl-keystone-ui/src/views/ResourceManage.vue
M	xmcl-keystone-ui/src/views/ResourceManageModpack.vue
M	xmcl-keystone-ui/src/views/ResourceManageVersions.vue
M	xmcl-keystone-ui/src/views/ResourcePack.vue
M	xmcl-keystone-ui/src/views/ResourcePackActions.vue
M	xmcl-keystone-ui/src/views/ResourcePackDetailResource.vue
M	xmcl-keystone-ui/src/views/ResourcePackExtension.vue
M	xmcl-keystone-ui/src/views/ResourcePackItem.vue
M	xmcl-keystone-ui/src/views/ResourcePackPreview.vue
M	xmcl-keystone-ui/src/views/Save.vue
A	xmcl-keystone-ui/src/views/SaveActions.vue
M	xmcl-keystone-ui/src/views/SaveCard.vue
D	xmcl-keystone-ui/src/views/SaveCopyFromDialog.vue
A	xmcl-keystone-ui/src/views/SaveDetail.vue
M	xmcl-keystone-ui/src/views/SaveExtension.vue
A	xmcl-keystone-ui/src/views/SaveItem.vue
M	xmcl-keystone-ui/src/views/Setting.vue
A	xmcl-keystone-ui/src/views/SettingAbout.vue
M	xmcl-keystone-ui/src/views/SettingAppearance.vue
M	xmcl-keystone-ui/src/views/SettingAppearanceColor.vue
M	xmcl-keystone-ui/src/views/SettingGeneral.vue
M	xmcl-keystone-ui/src/views/SettingGlobal.vue
M	xmcl-keystone-ui/src/views/SettingJavaMemory.vue
M	xmcl-keystone-ui/src/views/SettingMigrationDialog.vue
A	xmcl-keystone-ui/src/views/SettingNetwork.vue
M	xmcl-keystone-ui/src/views/SettingUpdate.vue
M	xmcl-keystone-ui/src/views/SettingUpdateInfoDialog.vue
M	xmcl-keystone-ui/src/views/SettingYggdrasilServices.vue
M	xmcl-keystone-ui/src/views/Setup.vue
A	xmcl-keystone-ui/src/views/SetupAccount.vue
M	xmcl-keystone-ui/src/views/SetupAppearance.vue
M	xmcl-keystone-ui/src/views/SetupDataRoot.vue
M	xmcl-keystone-ui/src/views/SetupFooter.vue
D	xmcl-keystone-ui/src/views/SetupInstance.vue
M	xmcl-keystone-ui/src/views/ShaderPack.vue
M	xmcl-keystone-ui/src/views/ShaderPackActions.vue
M	xmcl-keystone-ui/src/views/ShaderPackDetailResource.vue
M	xmcl-keystone-ui/src/views/ShaderPackExtension.vue
M	xmcl-keystone-ui/src/views/ShaderPackItem.vue
M	xmcl-keystone-ui/src/views/StoreEntry.vue
A	xmcl-keystone-ui/src/views/StoreEntry.vue.bak
M	xmcl-keystone-ui/src/views/StoreProjectCurseforge.vue
M	xmcl-keystone-ui/src/views/StoreProjectFeedTheBeast.vue
M	xmcl-keystone-ui/src/views/StoreProjectModrinth.vue
D	xmcl-keystone-ui/src/views/UserChallengesForm.vue
D	xmcl-keystone-ui/src/views/UserMenuMojang.vue
M	xmcl-keystone-ui/src/vuetify.ts
M	xmcl-keystone-ui/src/windows/app/App.vue
M	xmcl-keystone-ui/src/windows/app/Context.ts
M	xmcl-keystone-ui/src/windows/app/index.ts
D	xmcl-keystone-ui/src/windows/app/router.ts
M	xmcl-keystone-ui/src/windows/browser/index.ts
M	xmcl-keystone-ui/src/windows/logger/App.vue
M	xmcl-keystone-ui/src/windows/logger/index.ts
M	xmcl-keystone-ui/src/windows/main/App.vue
M	xmcl-keystone-ui/src/windows/main/Context.ts
M	xmcl-keystone-ui/src/windows/main/index.ts
M	xmcl-keystone-ui/src/windows/main/router.ts
A	xmcl-keystone-ui/src/windows/migration/App.vue
A	xmcl-keystone-ui/src/windows/migration/index.ts
M	xmcl-keystone-ui/tsconfig.json
A	xmcl-keystone-ui/uno.config.ts
M	xmcl-keystone-ui/vite.config.ts
D	xmcl-keystone-ui/windi.config.ts
M	xmcl-runtime-api/client.d.ts
A	xmcl-runtime-api/docs/GETTING_STARTED_ru.md
A	xmcl-runtime-api/docs/GETTING_STARTED_ua.md
R100	xmcl-runtime-api/docs/GETTING_STARTED_zh.md	xmcl-runtime-api/docs/GETTING_STARTED_zh copy.md
M	xmcl-runtime-api/index.ts
A	xmcl-runtime-api/migration.ts
M	xmcl-runtime-api/package.json
M	xmcl-runtime-api/src/apps.ts
M	xmcl-runtime-api/src/bootstrap.ts
M	xmcl-runtime-api/src/controller.ts
A	xmcl-runtime-api/src/entities/InstanceInstallLockSchema.json
M	xmcl-runtime-api/src/entities/InstanceLockSchema.json
M	xmcl-runtime-api/src/entities/InstanceSchema.json
M	xmcl-runtime-api/src/entities/SettingSchema.json
M	xmcl-runtime-api/src/entities/YggdrasilSchema.json
M	xmcl-runtime-api/src/entities/exception.ts
M	xmcl-runtime-api/src/entities/instance.schema.ts
M	xmcl-runtime-api/src/entities/instance.ts
M	xmcl-runtime-api/src/entities/instanceManifest.schema.ts
A	xmcl-runtime-api/src/entities/market.ts
M	xmcl-runtime-api/src/entities/mod.ts
M	xmcl-runtime-api/src/entities/modpack.ts
M	xmcl-runtime-api/src/entities/modrinth.ts
M	xmcl-runtime-api/src/entities/resource.ts
M	xmcl-runtime-api/src/entities/save.ts
M	xmcl-runtime-api/src/entities/setting.schema.ts
M	xmcl-runtime-api/src/entities/setting.ts
M	xmcl-runtime-api/src/entities/update.ts
M	xmcl-runtime-api/src/entities/user.schema.ts
M	xmcl-runtime-api/src/entities/version.ts
M	xmcl-runtime-api/src/entities/yggdrasil.schema.ts
A	xmcl-runtime-api/src/multiplayer.ts
D	xmcl-runtime-api/src/semaphore.ts
M	xmcl-runtime-api/src/services/BaseService.ts
D	xmcl-runtime-api/src/services/CurseForgeService.ts
M	xmcl-runtime-api/src/services/DiagnoseService.ts
M	xmcl-runtime-api/src/services/ImportService.ts
M	xmcl-runtime-api/src/services/InstallService.ts
M	xmcl-runtime-api/src/services/InstanceIOService.ts
M	xmcl-runtime-api/src/services/InstanceInstallService.ts
M	xmcl-runtime-api/src/services/InstanceManagingService.ts
M	xmcl-runtime-api/src/services/InstanceManifestService.ts
A	xmcl-runtime-api/src/services/InstanceModsGroupService.ts
M	xmcl-runtime-api/src/services/InstanceModsService.ts
M	xmcl-runtime-api/src/services/InstanceOptionsService.ts
M	xmcl-runtime-api/src/services/InstanceResourcePacksService.ts
M	xmcl-runtime-api/src/services/InstanceSavesService.ts
M	xmcl-runtime-api/src/services/InstanceServerInfoService.ts
M	xmcl-runtime-api/src/services/InstanceService.ts
M	xmcl-runtime-api/src/services/InstanceShaderPacksService.ts
D	xmcl-runtime-api/src/services/InstanceUpdateService.ts
M	xmcl-runtime-api/src/services/JavaService.ts
M	xmcl-runtime-api/src/services/LaunchService.ts
A	xmcl-runtime-api/src/services/ModMetadataService.ts
M	xmcl-runtime-api/src/services/ModpackService.ts
D	xmcl-runtime-api/src/services/ModrinthService.ts
D	xmcl-runtime-api/src/services/NatService.ts
D	xmcl-runtime-api/src/services/PeerGroupService.ts
M	xmcl-runtime-api/src/services/PeerService.ts
M	xmcl-runtime-api/src/services/ProjectMappingService.ts
D	xmcl-runtime-api/src/services/ResourceService.ts
A	xmcl-runtime-api/src/services/ThemeService.ts
M	xmcl-runtime-api/src/services/UserService.ts
M	xmcl-runtime-api/src/services/VersionMetadataService.ts
M	xmcl-runtime-api/src/services/VersionService.ts
D	xmcl-runtime-api/src/services/YggdrasilService.ts
M	xmcl-runtime-api/src/state.ts
A	xmcl-runtime-api/src/telemetry.ts
A	xmcl-runtime-api/src/util/LockKey.ts
R053	xmcl-runtime-api/src/util/MutableState.ts	xmcl-runtime-api/src/util/SharedState.ts
A	xmcl-runtime-api/src/util/java.ts
A	xmcl-runtime-api/src/util/launch.ts
D	xmcl-runtime-api/src/util/mutex.ts
M	xmcl-runtime-api/src/util/promiseSignal.ts
D	xmcl-runtime-api/src/util/semaphore.ts
R065	xmcl-runtime/base/BaseService.ts	xmcl-runtime/app/BaseService.ts
M	xmcl-runtime/app/Host.ts
M	xmcl-runtime/app/LauncherApp.ts
M	xmcl-runtime/app/LauncherAppController.ts
M	xmcl-runtime/app/LauncherAppManager.ts
M	xmcl-runtime/app/LauncherProtocolHandler.ts
A	xmcl-runtime/app/MutexManager.ts
D	xmcl-runtime/app/SemaphoreManager.ts
M	xmcl-runtime/app/gameDataPath.ts
M	xmcl-runtime/app/index.ts
A	xmcl-runtime/app/migrate.ts
M	xmcl-runtime/app/objectRegistry.ts
A	xmcl-runtime/app/pluginApiFallback.ts
A	xmcl-runtime/app/pluginCommonProtocol.ts
D	xmcl-runtime/app/pluginGameDataPath.ts
R063	xmcl-runtime/base/pluginMediaProtocol.ts	xmcl-runtime/app/pluginMediaProtocol.ts
M	xmcl-runtime/app/utils.ts
M	xmcl-runtime/app/win32/index.ts
M	xmcl-runtime/authlibInjector/AuthlibInjectorService.ts
D	xmcl-runtime/base/ProjectMappingService.ts
D	xmcl-runtime/base/index.ts
M	xmcl-runtime/constant.ts
D	xmcl-runtime/curseforge/CurseForgeService.ts
D	xmcl-runtime/curseforge/index.ts
D	xmcl-runtime/curseforge/pluginCurseforgeClient.ts
M	xmcl-runtime/elyby/ElyByService.ts
M	xmcl-runtime/elyby/cache.json
M	xmcl-runtime/elyby/elyByPlugin.ts
M	xmcl-runtime/encoding/pluginEncodingWorker.ts
M	xmcl-runtime/flights/index.ts
M	xmcl-runtime/gfw/gfw.ts
M	xmcl-runtime/gfw/pluginGFW.ts
M	xmcl-runtime/global.d.ts
M	xmcl-runtime/imageStore/imageStore.ts
M	xmcl-runtime/imageStore/pluginImageStore.ts
M	xmcl-runtime/import/ImportService.ts
M	xmcl-runtime/import/sourceControlUrlParser.ts
M	xmcl-runtime/install/DiagnoseService.ts
M	xmcl-runtime/install/InstallService.ts
A	xmcl-runtime/install/MultiJarLauncher.class
M	xmcl-runtime/install/VersionMetadataService.ts
A	xmcl-runtime/install/formatMinecraftSrg.ts
D	xmcl-runtime/install/getForgeListFromBMCL.ts
D	xmcl-runtime/install/getJsonWithCache.ts
M	xmcl-runtime/install/index.ts
A	xmcl-runtime/install/optifine.ts
M	xmcl-runtime/instance/InstanceLogService.ts
M	xmcl-runtime/instance/InstanceOptionsService.ts
M	xmcl-runtime/instance/InstanceServerInfoService.ts
M	xmcl-runtime/instance/InstanceService.ts
M	xmcl-runtime/instanceIO/InstanceFileDiscover.ts
A	xmcl-runtime/instanceIO/InstanceFileDownloadTask.ts
M	xmcl-runtime/instanceIO/InstanceFileOperationHandler.ts
A	xmcl-runtime/instanceIO/InstanceFileOperationTask.ts
M	xmcl-runtime/instanceIO/InstanceIOService.ts
M	xmcl-runtime/instanceIO/InstanceInstallService.ts
M	xmcl-runtime/instanceIO/InstanceManifestService.ts
R090	InstanceUpdateDesign.md	xmcl-runtime/instanceIO/InstanceUpdateDesign.md
D	xmcl-runtime/instanceIO/InstanceUpdateService.ts
D	xmcl-runtime/instanceIO/LinkFilesTask.ts
M	xmcl-runtime/instanceIO/ResolveInstanceFileTask.ts
A	xmcl-runtime/instanceIO/SSHInstanceExporter.ts
M	xmcl-runtime/instanceIO/UnzipFileTask.ts
M	xmcl-runtime/instanceIO/XUpdateService.ts
A	xmcl-runtime/instanceIO/computeFileUpdate.ts
A	xmcl-runtime/instanceIO/entities/CurseforgeInstance.ts
A	xmcl-runtime/instanceIO/exportInstanceAsServer.ts
M	xmcl-runtime/instanceIO/index.ts
A	xmcl-runtime/instanceIO/instanceExportServer.ts
A	xmcl-runtime/instanceIO/parseCurseforgeInstance.ts
M	xmcl-runtime/instanceIO/parseModrinthInstance.ts
M	xmcl-runtime/instanceIO/parseMultiMCInstance.ts
M	xmcl-runtime/instanceIO/parseVanillaInstance.ts
M	xmcl-runtime/java/JavaService.ts
M	xmcl-runtime/java/detectJVMArch.ts
A	xmcl-runtime/java/installDefaultJava.ts
M	xmcl-runtime/java/java.ts
A	xmcl-runtime/java/javaPaths.ts
A	xmcl-runtime/java/zulu.json
A	xmcl-runtime/java/zulu.ts
M	xmcl-runtime/launch/LaunchMiddleware.ts
M	xmcl-runtime/launch/LaunchService.ts
A	xmcl-runtime/launch/XMCLaunch.ts
A	xmcl-runtime/launch/pluginDirectLaunch.ts
M	xmcl-runtime/launch/pluginLaunchPrecheck.ts
M	xmcl-runtime/littleSkin/LittleSkinClient.ts
M	xmcl-runtime/littleSkin/LittleSkinUserService.ts
M	xmcl-runtime/logger/logger.ts
M	xmcl-runtime/logger/pluginLogConsumer.ts
A	xmcl-runtime/market/index.ts
A	xmcl-runtime/market/marketProvider.ts
A	xmcl-runtime/market/pluginMarketProvider.ts
A	xmcl-runtime/mod/InstanceModsGroupService.ts
M	xmcl-runtime/mod/InstanceModsService.ts
M	xmcl-runtime/mod/index.ts
A	xmcl-runtime/moddb/ModMetadataService.ts
A	xmcl-runtime/moddb/ProjectMappingService.ts
A	xmcl-runtime/moddb/index.ts
M	xmcl-runtime/modpack/ModpackService.ts
M	xmcl-runtime/modpack/getCurseforgeFiles.ts
M	xmcl-runtime/modpack/pluginCurseforgeModpackHandler.ts
M	xmcl-runtime/modpack/pluginMcbbsModpackHandler.ts
A	xmcl-runtime/modpack/pluginMmcModpackHandler.ts
M	xmcl-runtime/modpack/pluginModrinthModpackHandler.ts
A	xmcl-runtime/modpack/resolveHashes.ts
D	xmcl-runtime/modrinth/index.ts
D	xmcl-runtime/modrinth/service.ts
D	xmcl-runtime/nat/NatService.ts
D	xmcl-runtime/nat/index.ts
D	xmcl-runtime/native.test.ts
M	xmcl-runtime/nativeReplacer/natives.json
M	xmcl-runtime/nativeReplacer/pluginNativeReplacer.ts
M	xmcl-runtime/network/dispatchers/ErrorDecorateHandler.ts
R051	xmcl-runtime/network/dispatchers/proxyDispatcher.ts	xmcl-runtime/network/dispatchers/NetworkAgent.ts
D	xmcl-runtime/network/dispatchers/biDispatcher.ts
D	xmcl-runtime/network/dispatchers/cacheDispatcher.ts
M	xmcl-runtime/network/dispatchers/dispatcher.ts
M	xmcl-runtime/network/dnsServers.ts
M	xmcl-runtime/network/index.ts
M	xmcl-runtime/network/networkInterface.ts
M	xmcl-runtime/network/pluginNetworkInterface.ts
D	xmcl-runtime/network/userAgent.ts
M	xmcl-runtime/package.json
A	xmcl-runtime/peer/ExposeServerHandler.ts
A	xmcl-runtime/peer/NodeDataChannel.ts
A	xmcl-runtime/peer/PeerConnectionFactory.ts
A	xmcl-runtime/peer/PeerContext.ts
D	xmcl-runtime/peer/PeerGroup.ts
D	xmcl-runtime/peer/PeerGroupService.ts
D	xmcl-runtime/peer/PeerGroupUndici.ts
M	xmcl-runtime/peer/PeerHost.ts
M	xmcl-runtime/peer/PeerService.ts
A	xmcl-runtime/peer/PeerServiceFacade.ts
A	xmcl-runtime/peer/PeerSession.ts
A	xmcl-runtime/peer/RTCDuplexChannel.ts
M	xmcl-runtime/peer/connection.ts
A	xmcl-runtime/peer/iceServers.ts
M	xmcl-runtime/peer/index.ts
A	xmcl-runtime/peer/lanDiscover.ts
M	xmcl-runtime/peer/mapAndGetPortCanidate.ts
M	xmcl-runtime/peer/messages/download.ts
M	xmcl-runtime/peer/messages/heartbeat.ts
M	xmcl-runtime/peer/messages/identity.ts
M	xmcl-runtime/peer/messages/lan.ts
A	xmcl-runtime/peer/multiplayerImpl.ts
A	xmcl-runtime/peer/nat.ts
A	xmcl-runtime/peer/peerGorup.ts
A	xmcl-runtime/peer/peerSharing.ts
A	xmcl-runtime/peer/peerUserInfo.ts
A	xmcl-runtime/peer/ssdpClient.ts
D	xmcl-runtime/peer/stun.ts
M	xmcl-runtime/presence/PresenceService.ts
A	xmcl-runtime/resource/ResourceManager.ts
M	xmcl-runtime/resource/core/ResourceContext.ts
A	xmcl-runtime/resource/core/ResourceWorkerQueuePayload.ts
M	xmcl-runtime/resource/core/createResourceContext.ts
A	xmcl-runtime/resource/core/files.ts
M	xmcl-runtime/resource/core/generateResource.ts
D	xmcl-runtime/resource/core/getResourceEntry.ts
M	xmcl-runtime/resource/core/hashResource.ts
D	xmcl-runtime/resource/core/loadResources.ts
D	xmcl-runtime/resource/core/migrateLegacy.ts
M	xmcl-runtime/resource/core/migrateResources.ts
M	xmcl-runtime/resource/core/parseMetadata.ts
M	xmcl-runtime/resource/core/pathUtils.ts
M	xmcl-runtime/resource/core/schema.ts
A	xmcl-runtime/resource/core/snapshot.ts
D	xmcl-runtime/resource/core/tryPersistResource.ts
M	xmcl-runtime/resource/core/upsertMetadata.ts
D	xmcl-runtime/resource/core/watchResources.ts
A	xmcl-runtime/resource/core/watchResourcesDirectory.ts
A	xmcl-runtime/resource/fingerprint.ts
M	xmcl-runtime/resource/index.ts
M	xmcl-runtime/resource/parsers/index.ts
A	xmcl-runtime/resource/parsers/mmcModpack.ts
A	xmcl-runtime/resource/parsers/neoforgeMod.ts
M	xmcl-runtime/resource/pluginResourceWorker.ts
D	xmcl-runtime/resource/resource.ts
R057	xmcl-runtime/resource/resourceWorkerEntry.ts	xmcl-runtime/resource/resource.worker.ts
D	xmcl-runtime/resource/service.ts
M	xmcl-runtime/resource/worker.ts
A	xmcl-runtime/resourcePack/AbstractInstanceDoaminService.ts
M	xmcl-runtime/resourcePack/InstanceResourcePacksService.ts
A	xmcl-runtime/resourcePack/InstanceShaderPacksService.ts
M	xmcl-runtime/resourcePack/ResourcePackPreviewService.ts
M	xmcl-runtime/resourcePack/index.ts
M	xmcl-runtime/resourcePack/pluginResourcePackLink.ts
M	xmcl-runtime/save/InstanceSavesService.ts
M	xmcl-runtime/save/save.ts
M	xmcl-runtime/service/Service.ts
M	xmcl-runtime/service/ServiceStateContainer.ts
M	xmcl-runtime/service/ServiceStateManager.ts
M	xmcl-runtime/service/pluginServicesHandler.ts
M	xmcl-runtime/service/stateUtils.ts
M	xmcl-runtime/settings/pluginSettings.ts
M	xmcl-runtime/settings/settings.ts
A	xmcl-runtime/setup/pluginSetup.ts
R052	xmcl-electron-app/main/setupWorker.ts	xmcl-runtime/setup/setupWorker.ts
A	xmcl-runtime/setup/setupWorkerEntry.ts
D	xmcl-runtime/shaderPack/InstanceShaderPacksService.ts
D	xmcl-runtime/shaderPack/index.ts
A	xmcl-runtime/sql/SqliteWASMDialect.ts
A	xmcl-runtime/sql/SqliteWASMDialectConfig.ts
A	xmcl-runtime/sql/SqliteWASMDriver.ts
A	xmcl-runtime/sql/createDatabase.ts
A	xmcl-runtime/sql/index.ts
R100	xmcl-runtime/resource/core/helper.ts	xmcl-runtime/sql/sqlHelper.ts
A	xmcl-runtime/sql/sqlite.worker.ts
A	xmcl-runtime/sql/type.ts
A	xmcl-runtime/ssh/SSHManager.ts
M	xmcl-runtime/task/pluginTasks.ts
A	xmcl-runtime/telemetry/ErrorDiagnose.ts
A	xmcl-runtime/telemetry/ResourceTelemetryClient.ts
M	xmcl-runtime/telemetry/pluginTelemetry.ts
M	xmcl-runtime/telemetry/telemetry.ts
A	xmcl-runtime/theme/ThemeService.ts
A	xmcl-runtime/theme/index.ts
M	xmcl-runtime/tsconfig.json
M	xmcl-runtime/uncaughtError/decorateError.ts
A	xmcl-runtime/user/NodeSystemOptions.ts
M	xmcl-runtime/user/OfficialUserService.ts
M	xmcl-runtime/user/UserService.ts
A	xmcl-runtime/user/YggdrasilSeriveRegistry.ts
D	xmcl-runtime/user/YggdrasilService.ts
M	xmcl-runtime/user/accountSystems/AccountSystem.ts
M	xmcl-runtime/user/accountSystems/MicrosoftAccountSystem.ts
M	xmcl-runtime/user/accountSystems/MicrosoftOAuthClient.ts
A	xmcl-runtime/user/accountSystems/OAuthNetworkClient.ts
M	xmcl-runtime/user/accountSystems/YggdrasilAccountSystem.ts
A	xmcl-runtime/user/accountSystems/YggdrasilOCIDAuthClient.ts
M	xmcl-runtime/user/index.ts
A	xmcl-runtime/user/loginModrinth.ts
A	xmcl-runtime/user/pluginModrinthAccess.ts
M	xmcl-runtime/user/pluginOfficialUserApi.ts
M	xmcl-runtime/user/pluginOfflineUser.ts
M	xmcl-runtime/user/pluginUserTokenStorage.ts
A	xmcl-runtime/user/pluginYggdrasilApi.ts
M	xmcl-runtime/user/user.ts
D	xmcl-runtime/util/EventSource.ts
A	xmcl-runtime/util/NativeModule.ts
M	xmcl-runtime/util/aggregator.ts
A	xmcl-runtime/util/cfg.ts
A	xmcl-runtime/util/cmd.ts
M	xmcl-runtime/util/curseforge.ts
M	xmcl-runtime/util/error.ts
M	xmcl-runtime/util/fs.ts
M	xmcl-runtime/util/linkResourceFolder.ts
D	xmcl-runtime/util/mutex.ts
M	xmcl-runtime/util/object.ts
M	xmcl-runtime/util/persistance.ts
M	xmcl-runtime/util/serialize.ts
D	xmcl-runtime/util/trafficAgent.ts
M	xmcl-runtime/util/url.ts
M	xmcl-runtime/util/validate.ts
M	xmcl-runtime/version/VersionService.ts
M	xmcl-runtime/worker/helper.ts
M	xmcl-runtime/worker/index.ts
M	xmcl-runtime/yggdrasilServer/pluginYggdrasilHandler.ts
A	xmcl-runtime/zipManager/ZipManager.ts
A	xmcl/.gitattributes
A	xmcl/.github/actions/prepare-pr/index.ts
A	xmcl/.github/actions/prepare-pr/package.json
A	xmcl/.github/actions/prepare-pr/tsconfig.json
A	xmcl/.github/workflows/build.yml
A	xmcl/.github/workflows/github-pages.yml
A	xmcl/.github/workflows/release.yml
A	xmcl/.github/workflows/validation.yml
A	xmcl/.gitignore
A	xmcl/.npmignore
A	xmcl/.npmrc
A	xmcl/.vscode/settings.json
A	xmcl/.vscode/tasks.json
A	xmcl/mock/modpack.zip
A	xmcl/mock/mods/dummy-mod.jar
A	xmcl/mock/mods/fabric-sample-2.jar
A	xmcl/mock/mods/fabric-sample.jar
A	xmcl/mock/mods/sample-ccc-mod.jar
A	xmcl/mock/mods/sample-mod-1.13-no-deps.jar
A	xmcl/mock/mods/sample-mod-1.13.jar
A	xmcl/mock/mods/sample-mod.jar
A	xmcl/mock/mods/sample-mod.litemod
A	xmcl/mock/mods/sample-nei-mod.jar
A	xmcl/mock/mods/tweak-class.jar
A	xmcl/mock/options.txt
A	xmcl/mock/pack.png
A	xmcl/mock/resourcepacks/1.14.4.zip
A	xmcl/mock/resourcepacks/empty-resourcepack.zip
A	xmcl/mock/resourcepacks/sample-resourcepack.zip
A	xmcl/mock/resourcepacks/sample-resourcepack/pack.mcmeta
A	xmcl/mock/resourcepacks/sample-resourcepack/pack.png
A	xmcl/mock/sample-forge-new.html
A	xmcl/mock/sample-forge.html
A	xmcl/mock/saves/1.12.2/block.txt
A	xmcl/mock/saves/1.12.2/data.txt
A	xmcl/mock/saves/1.12.2/mock.txt
A	xmcl/mock/saves/1.12.2/region/r.0.0.mca
A	xmcl/mock/saves/1.14.4/mock.txt
A	xmcl/mock/saves/1.14.4/region/r.0.0.mca
A	xmcl/mock/saves/1.16.4/mock.txt
A	xmcl/mock/saves/1.16.4/region/r.0.0.mca
A	xmcl/mock/saves/1.16.5/region/r.0.0.mca
A	xmcl/mock/saves/1.19.3/region/r.0.0.mca
A	xmcl/mock/saves/sample-map.zip
A	xmcl/mock/saves/sample-map/icon.png
A	xmcl/mock/saves/sample-map/level.dat
A	xmcl/mock/saves/sample-map/playerdata/abf81fe9-9f0d-4948-a909-7721a8198ac4.dat
A	xmcl/mock/saves/sample-map/region/r.0.0.mca
A	xmcl/mock/servers.dat
A	xmcl/mock/versions/1.14.4-forge-28.0.47/1.14.4-forge-28.0.47.json
A	xmcl/mock/versions/1.14.4/1.14.4.json
A	xmcl/mock/versions/1.17.1-forge-37.0.97/1.17.1-forge-37.0.97.json
A	xmcl/mock/versions/1.17.1/1.17.1.json
A	xmcl/mock/versions/1.7.10-Forge10.13.3.1400-1.7.10/1.7.10-Forge10.13.3.1400-1.7.10.json
A	xmcl/mock/versions/1.7.10/1.7.10.json
A	xmcl/mock/versions/mock/mock.json
A	xmcl/mock/versions/no-assets-json/no-assets-json.json
A	xmcl/mock/versions/no-downloads/no-downloads.json
A	xmcl/mock/versions/no-main-class/no-main-class.json
A	xmcl/oxlintrc.json
A	xmcl/package.json
A	xmcl/packages/asm/.npmignore
A	xmcl/packages/asm/LICENSE
A	xmcl/packages/asm/README.md
A	xmcl/packages/asm/index.ts
A	xmcl/packages/asm/libs/AnnotationVisitor.ts
A	xmcl/packages/asm/libs/AnnotationWriter.ts
A	xmcl/packages/asm/libs/Attribute.ts
A	xmcl/packages/asm/libs/ByteVector.ts
A	xmcl/packages/asm/libs/ClassReader.ts
A	xmcl/packages/asm/libs/ClassReaderConstant.ts
A	xmcl/packages/asm/libs/ClassVisitor.ts
A	xmcl/packages/asm/libs/ClassWriter.ts
A	xmcl/packages/asm/libs/ClassWriterConstant.ts
A	xmcl/packages/asm/libs/Context.ts
A	xmcl/packages/asm/libs/CurrentFrame.ts
A	xmcl/packages/asm/libs/Edge.ts
A	xmcl/packages/asm/libs/FieldVisitor.ts
A	xmcl/packages/asm/libs/FieldWriter.ts
A	xmcl/packages/asm/libs/Frame.ts
A	xmcl/packages/asm/libs/Handle.ts
A	xmcl/packages/asm/libs/Item.ts
A	xmcl/packages/asm/libs/Label.ts
A	xmcl/packages/asm/libs/MethodVisitor.ts
A	xmcl/packages/asm/libs/MethodWriter.ts
A	xmcl/packages/asm/libs/MethodWriterConstant.ts
A	xmcl/packages/asm/libs/Opcodes.ts
A	xmcl/packages/asm/libs/Type.ts
A	xmcl/packages/asm/libs/TypePath.ts
A	xmcl/packages/asm/libs/TypeReference.ts
A	xmcl/packages/asm/libs/bits.ts
A	xmcl/packages/asm/libs/utils.ts
A	xmcl/packages/asm/package.json
A	xmcl/packages/asm/tsconfig.json
A	xmcl/packages/bytebuffer/.npmignore
A	xmcl/packages/bytebuffer/README.md
A	xmcl/packages/bytebuffer/build.ts
A	xmcl/packages/bytebuffer/debug.ts
A	xmcl/packages/bytebuffer/hex.ts
A	xmcl/packages/bytebuffer/index.ts
A	xmcl/packages/bytebuffer/package.json
A	xmcl/packages/bytebuffer/tsconfig.json
A	xmcl/packages/bytebuffer/varint32.ts
A	xmcl/packages/bytebuffer/varint64.ts
A	xmcl/packages/client/.npmignore
A	xmcl/packages/client/README.md
A	xmcl/packages/client/channel.ts
A	xmcl/packages/client/coders.test.ts
A	xmcl/packages/client/coders.ts
A	xmcl/packages/client/index.ts
A	xmcl/packages/client/lan.ts
A	xmcl/packages/client/package.json
A	xmcl/packages/client/packet.ts
A	xmcl/packages/client/status.ts
A	xmcl/packages/client/test.ts
A	xmcl/packages/client/tsconfig.json
A	xmcl/packages/core/.npmignore
A	xmcl/packages/core/README.md
A	xmcl/packages/core/__mocks__/utils.ts
A	xmcl/packages/core/diagnose.test.ts
A	xmcl/packages/core/diagnose.ts
A	xmcl/packages/core/folder.test.ts
A	xmcl/packages/core/folder.ts
A	xmcl/packages/core/index.ts
A	xmcl/packages/core/launch.e2e.test.ts
A	xmcl/packages/core/launch.test.ts
A	xmcl/packages/core/launch.ts
A	xmcl/packages/core/package.json
A	xmcl/packages/core/platform.ts
A	xmcl/packages/core/tsconfig.json
A	xmcl/packages/core/utils.test.ts
A	xmcl/packages/core/utils.ts
A	xmcl/packages/core/version.test.ts
A	xmcl/packages/core/version.ts
A	xmcl/packages/curseforge/.npmignore
A	xmcl/packages/curseforge/README.md
A	xmcl/packages/curseforge/index.test.ts
A	xmcl/packages/curseforge/index.ts
A	xmcl/packages/curseforge/package.json
A	xmcl/packages/curseforge/tsconfig.json
A	xmcl/packages/discord-rpc/.gitignore
A	xmcl/packages/discord-rpc/.npmignore
A	xmcl/packages/discord-rpc/Client.ts
A	xmcl/packages/discord-rpc/LICENSE
A	xmcl/packages/discord-rpc/README.md
A	xmcl/packages/discord-rpc/index.ts
A	xmcl/packages/discord-rpc/package.json
A	xmcl/packages/discord-rpc/structures/Base.ts
A	xmcl/packages/discord-rpc/structures/CertifiedDevice.ts
A	xmcl/packages/discord-rpc/structures/Channel.ts
A	xmcl/packages/discord-rpc/structures/ClientUser.ts
A	xmcl/packages/discord-rpc/structures/Guild.ts
A	xmcl/packages/discord-rpc/structures/Lobby.ts
A	xmcl/packages/discord-rpc/structures/Message.ts
A	xmcl/packages/discord-rpc/structures/Transport.ts
A	xmcl/packages/discord-rpc/structures/User.ts
A	xmcl/packages/discord-rpc/structures/VoiceSettings.ts
A	xmcl/packages/discord-rpc/transport/IPC.ts
A	xmcl/packages/discord-rpc/tsconfig.json
A	xmcl/packages/discord-rpc/utils/RPCError.ts
A	xmcl/packages/discord-rpc/utils/TypedEmitter.ts
A	xmcl/packages/file-transfer/README.md
A	xmcl/packages/file-transfer/agent.ts
A	xmcl/packages/file-transfer/checkpoint.ts
A	xmcl/packages/file-transfer/download.ts
A	xmcl/packages/file-transfer/error.ts
A	xmcl/packages/file-transfer/index.ts
A	xmcl/packages/file-transfer/metadata.ts
A	xmcl/packages/file-transfer/package.json
A	xmcl/packages/file-transfer/progress.ts
A	xmcl/packages/file-transfer/rangePolicy.ts
A	xmcl/packages/file-transfer/retry.ts
A	xmcl/packages/file-transfer/tsconfig.json
A	xmcl/packages/file-transfer/validator.ts
A	xmcl/packages/forge-site-parser/.npmignore
A	xmcl/packages/forge-site-parser/README.md
A	xmcl/packages/forge-site-parser/index.test.ts
A	xmcl/packages/forge-site-parser/index.ts
A	xmcl/packages/forge-site-parser/package.json
A	xmcl/packages/forge-site-parser/tsconfig.json
A	xmcl/packages/game-data/.npmignore
A	xmcl/packages/game-data/README.md
A	xmcl/packages/game-data/index.ts
A	xmcl/packages/game-data/level.test.ts
A	xmcl/packages/game-data/level.ts
A	xmcl/packages/game-data/package.json
A	xmcl/packages/game-data/serverDat.test.ts
A	xmcl/packages/game-data/serverDat.ts
A	xmcl/packages/game-data/tsconfig.json
A	xmcl/packages/gamesetting/.npmignore
A	xmcl/packages/gamesetting/README.md
A	xmcl/packages/gamesetting/index.test.ts
A	xmcl/packages/gamesetting/index.ts
A	xmcl/packages/gamesetting/package.json
A	xmcl/packages/gamesetting/tsconfig.json
A	xmcl/packages/installer/.npmignore
A	xmcl/packages/installer/README.md
A	xmcl/packages/installer/diagnose.ts
A	xmcl/packages/installer/downloadTask.ts
A	xmcl/packages/installer/fabric.ts
A	xmcl/packages/installer/forge.ts
A	xmcl/packages/installer/index.ts
A	xmcl/packages/installer/install.e2e.test.ts
A	xmcl/packages/installer/java-runtime.ts
A	xmcl/packages/installer/java.test.ts
A	xmcl/packages/installer/java.ts
A	xmcl/packages/installer/labymod.ts
A	xmcl/packages/installer/liteloader.ts
A	xmcl/packages/installer/manifest.test.ts
A	xmcl/packages/installer/manifest.ts
A	xmcl/packages/installer/minecraft.ts
A	xmcl/packages/installer/neoForged.ts
A	xmcl/packages/installer/optifine.ts
A	xmcl/packages/installer/package.json
A	xmcl/packages/installer/profile.ts
A	xmcl/packages/installer/quilt.ts
A	xmcl/packages/installer/tsconfig.json
A	xmcl/packages/installer/unzip.ts
A	xmcl/packages/installer/utils.ts
A	xmcl/packages/installer/zipValdiator.ts
A	xmcl/packages/mod-parser/.npmignore
A	xmcl/packages/mod-parser/README.md
A	xmcl/packages/mod-parser/fabric.test.ts
A	xmcl/packages/mod-parser/fabric.ts
A	xmcl/packages/mod-parser/forge.test.ts
A	xmcl/packages/mod-parser/forge.ts
A	xmcl/packages/mod-parser/forgeConfig.ts
A	xmcl/packages/mod-parser/index.ts
A	xmcl/packages/mod-parser/liteloader.test.ts
A	xmcl/packages/mod-parser/liteloader.ts
A	xmcl/packages/mod-parser/package.json
A	xmcl/packages/mod-parser/quilt.ts
A	xmcl/packages/mod-parser/tsconfig.json
A	xmcl/packages/model/.npmignore
A	xmcl/packages/model/README.md
A	xmcl/packages/model/block.ts
A	xmcl/packages/model/index.ts
A	xmcl/packages/model/package.json
A	xmcl/packages/model/player-model.ts
A	xmcl/packages/model/player.ts
A	xmcl/packages/model/tsconfig.json
A	xmcl/packages/modrinth/README.md
A	xmcl/packages/modrinth/index.test.ts
A	xmcl/packages/modrinth/index.ts
A	xmcl/packages/modrinth/package.json
A	xmcl/packages/modrinth/tsconfig.json
A	xmcl/packages/modrinth/types.ts
A	xmcl/packages/nat-api/.npmignore
A	xmcl/packages/nat-api/LICENSE
A	xmcl/packages/nat-api/README.md
A	xmcl/packages/nat-api/index.ts
A	xmcl/packages/nat-api/lib/device.ts
A	xmcl/packages/nat-api/lib/pmp.ts
A	xmcl/packages/nat-api/lib/ssdp.ts
A	xmcl/packages/nat-api/lib/upnp.ts
A	xmcl/packages/nat-api/package.json
A	xmcl/packages/nat-api/tsconfig.json
A	xmcl/packages/nbt/.npmignore
A	xmcl/packages/nbt/README.md
A	xmcl/packages/nbt/index.test.ts
A	xmcl/packages/nbt/index.ts
A	xmcl/packages/nbt/package.json
A	xmcl/packages/nbt/tsconfig.json
A	xmcl/packages/nbt/utils.ts
A	xmcl/packages/nbt/zlib/index.browser.ts
A	xmcl/packages/nbt/zlib/index.ts
A	xmcl/packages/nbt/zlib/package.json
A	xmcl/packages/nbt/zlib/tsconfig.json
A	xmcl/packages/oxlint-config/.gitignore
A	xmcl/packages/oxlint-config/oxlintrc.json
A	xmcl/packages/oxlint-config/package.json
A	xmcl/packages/resourcepack/.npmignore
A	xmcl/packages/resourcepack/README.md
A	xmcl/packages/resourcepack/format.ts
A	xmcl/packages/resourcepack/index.ts
A	xmcl/packages/resourcepack/modelLoader.ts
A	xmcl/packages/resourcepack/package.json
A	xmcl/packages/resourcepack/resourceManager.test.ts
A	xmcl/packages/resourcepack/resourceManager.ts
A	xmcl/packages/resourcepack/resourcePack.test.ts
A	xmcl/packages/resourcepack/resourcePack.ts
A	xmcl/packages/resourcepack/tsconfig.json
A	xmcl/packages/semver/.npmignore
A	xmcl/packages/semver/LICENSE
A	xmcl/packages/semver/README.md
A	xmcl/packages/semver/index.ts
A	xmcl/packages/semver/operators.ts
A	xmcl/packages/semver/package.json
A	xmcl/packages/semver/range.ts
A	xmcl/packages/semver/semver.ts
A	xmcl/packages/semver/tsconfig.json
A	xmcl/packages/system/.npmignore
A	xmcl/packages/system/README.md
A	xmcl/packages/system/index.browser.ts
A	xmcl/packages/system/index.ts
A	xmcl/packages/system/package.json
A	xmcl/packages/system/system.test.ts
A	xmcl/packages/system/system.ts
A	xmcl/packages/system/tsconfig.json
A	xmcl/packages/task/.npmignore
A	xmcl/packages/task/README.md
A	xmcl/packages/task/index.test.ts
A	xmcl/packages/task/index.ts
A	xmcl/packages/task/package.json
A	xmcl/packages/task/tsconfig.json
A	xmcl/packages/text-component/.npmignore
A	xmcl/packages/text-component/README.md
A	xmcl/packages/text-component/index.test.ts
A	xmcl/packages/text-component/index.ts
A	xmcl/packages/text-component/package.json
A	xmcl/packages/text-component/tsconfig.json
A	xmcl/packages/undici-shim/index.ts
A	xmcl/packages/undici-shim/package.json
A	xmcl/packages/undici-shim/tsconfig.json
A	xmcl/packages/unzip/.npmignore
A	xmcl/packages/unzip/README.md
A	xmcl/packages/unzip/index.test.ts
A	xmcl/packages/unzip/index.ts
A	xmcl/packages/unzip/package.json
A	xmcl/packages/unzip/tsconfig.json
A	xmcl/packages/user-offline-uuid/index.browser.ts
A	xmcl/packages/user-offline-uuid/index.ts
A	xmcl/packages/user-offline-uuid/package.json
A	xmcl/packages/user-offline-uuid/tsconfig.json
A	xmcl/packages/user/.npmignore
A	xmcl/packages/user/README.md
A	xmcl/packages/user/gameProfile.ts
A	xmcl/packages/user/index.ts
A	xmcl/packages/user/microsoft.test.ts
A	xmcl/packages/user/microsoft.ts
A	xmcl/packages/user/mojang.test.ts
A	xmcl/packages/user/mojang.ts
A	xmcl/packages/user/offline.test.ts
A	xmcl/packages/user/offline.ts
A	xmcl/packages/user/package.json
A	xmcl/packages/user/tsconfig.json
A	xmcl/packages/user/yggdrasil.test.ts
A	xmcl/packages/user/yggdrasil.ts
A	xmcl/pnpm-lock.yaml
A	xmcl/pnpm-workspace.yaml
A	xmcl/protocol.json
A	xmcl/scripts/docs.ts
A	xmcl/test-setup.ts
A	xmcl/test.d.ts
A	xmcl/tsconfig.json
A	xmcl/vitest.config.ts
```

### F. Rutas afectadas en ambos lados desde el ancestro

HEAD/upstream: 859 rutas. Origin/upstream: 864 rutas. Listado ampliado origin/upstream, con renombrados descompuestos para detectar rutas antiguas.

```text
.eslintrc.json
.gitattributes
.github/workflows/build.yml
.github/workflows/deploy-release.yml
.github/workflows/deploy-ui.yml
.github/workflows/validate.yml
.gitmodules
.vscode/extensions.json
.vscode/launch.json
.vscode/settings.json
.vscode/tasks.json
.vscode/vue.code-snippets
CHANGELOG.legacy.md
CODE_OF_CONDUCT.md
CONTRIBUTING.i18n.md
CONTRIBUTING.md
CONTRIBUTING.zh.md
InstanceUpdateDesign.md
README.md
README.uk.md
README.zh.md
USAGE.md
assets/locales.json
package.json
pnpm-lock.yaml
xmcl
xmcl-electron-app/build.ts
xmcl-electron-app/build/appinstaller-builder.ts
xmcl-electron-app/build/electron-builder.config.ts
xmcl-electron-app/build/elevate.exe
xmcl-electron-app/build/entitlements.mac.plist
xmcl-electron-app/dev.ts
xmcl-electron-app/esbuild.config.ts
xmcl-electron-app/main/ElectronController.ts
xmcl-electron-app/main/ElectronLauncherApp.ts
xmcl-electron-app/main/ElectronSecretStorage.ts
xmcl-electron-app/main/ElectronSession.ts
xmcl-electron-app/main/assets/craftingtable.png
xmcl-electron-app/main/assets/fabric.png
xmcl-electron-app/main/assets/forge.png
xmcl-electron-app/main/assets/iris.webp
xmcl-electron-app/main/assets/labymod.webp
xmcl-electron-app/main/assets/languages.json
xmcl-electron-app/main/assets/minecraft.png
xmcl-electron-app/main/assets/minecraft.webp
xmcl-electron-app/main/assets/mmc.png
xmcl-electron-app/main/assets/neoforged.png
xmcl-electron-app/main/assets/optifine.webp
xmcl-electron-app/main/assets/quilt.svg
xmcl-electron-app/main/constant.ts
xmcl-electron-app/main/controllers/gameLaunch.ts
xmcl-electron-app/main/controllers/i18n.ts
xmcl-electron-app/main/controllers/index.ts
xmcl-electron-app/main/controllers/notification.ts
xmcl-electron-app/main/controllers/optifine.ts
xmcl-electron-app/main/controllers/setupWindow.ts
xmcl-electron-app/main/controllers/theme.ts
xmcl-electron-app/main/controllers/tray.ts
xmcl-electron-app/main/controllers/windowController.ts
xmcl-electron-app/main/defaultApp.ts
xmcl-electron-app/main/definedPlugins.ts
xmcl-electron-app/main/definedServices.ts
xmcl-electron-app/main/global.d.ts
xmcl-electron-app/main/index.dev.ts
xmcl-electron-app/main/index.ts
xmcl-electron-app/main/locales/de.yaml
xmcl-electron-app/main/locales/en.yaml
xmcl-electron-app/main/locales/fr.yaml
xmcl-electron-app/main/locales/gl.yaml
xmcl-electron-app/main/locales/nl.yaml
xmcl-electron-app/main/locales/ru.yaml
xmcl-electron-app/main/locales/uk.yaml
xmcl-electron-app/main/locales/zh-CN.yaml
xmcl-electron-app/main/locales/zh-TW.yaml
xmcl-electron-app/main/pluginAutoUpdate.ts
xmcl-electron-app/main/pluginCommonProtocol.ts
xmcl-electron-app/main/pluginIconProtocol.ts
xmcl-electron-app/main/pluginNvdiaGPULinux.ts
xmcl-electron-app/main/pluginPowerMonitor.ts
xmcl-electron-app/main/pluginSetupWorker.ts
xmcl-electron-app/main/setupWorker.ts
xmcl-electron-app/main/setupWorkerEntry.ts
xmcl-electron-app/main/utils/elevate.ts
xmcl-electron-app/main/utils/fs.ts
xmcl-electron-app/main/utils/login.ts
xmcl-electron-app/main/utils/updater.ts
xmcl-electron-app/main/utils/windowSizeTracker.ts
xmcl-electron-app/package.json
xmcl-electron-app/plugins/esbuild.elevate.plugin.ts
xmcl-electron-app/plugins/esbuild.native.plugin.ts
xmcl-electron-app/plugins/esbuild.node.plugin.ts
xmcl-electron-app/plugins/esbuild.preload.plugin.ts
xmcl-electron-app/plugins/esbuild.worker.plugin.ts
xmcl-electron-app/postinstall.ts
xmcl-electron-app/postsign.ts
xmcl-electron-app/preload/.eslintrc.json
xmcl-electron-app/preload/controller.ts
xmcl-electron-app/preload/index.ts
xmcl-electron-app/preload/migration.ts
xmcl-electron-app/preload/optifine.ts
xmcl-electron-app/preload/semaphore.ts
xmcl-electron-app/preload/service.ts
xmcl-electron-app/preload/tsconfig.json
xmcl-keystone-ui/.eslintrc-auto-import.json
xmcl-keystone-ui/.eslintrc.json
xmcl-keystone-ui/locales/de.yaml
xmcl-keystone-ui/locales/en.yaml
xmcl-keystone-ui/locales/es-ES.yaml
xmcl-keystone-ui/locales/fr.yaml
xmcl-keystone-ui/locales/gl.yaml
xmcl-keystone-ui/locales/ru.yaml
xmcl-keystone-ui/locales/uk.yaml
xmcl-keystone-ui/locales/zh-CN.yaml
xmcl-keystone-ui/locales/zh-TW.yaml
xmcl-keystone-ui/package.json
xmcl-keystone-ui/src/app.html
xmcl-keystone-ui/src/assets/common.css
xmcl-keystone-ui/src/assets/craftingtable.webp
xmcl-keystone-ui/src/assets/fabric.webp
xmcl-keystone-ui/src/assets/forge.webp
xmcl-keystone-ui/src/assets/google.font.css
xmcl-keystone-ui/src/assets/iris.webp
xmcl-keystone-ui/src/assets/kofi.webp
xmcl-keystone-ui/src/assets/labymod.webp
xmcl-keystone-ui/src/assets/material-symbols-outlined.woff2
xmcl-keystone-ui/src/assets/minecraft.webp
xmcl-keystone-ui/src/assets/mmc.webp
xmcl-keystone-ui/src/assets/neoforged.webp
xmcl-keystone-ui/src/assets/oculus.webp
xmcl-keystone-ui/src/assets/optifine.webp
xmcl-keystone-ui/src/assets/quilt.svg
xmcl-keystone-ui/src/assets/unknown_pack.png
xmcl-keystone-ui/src/assets/unknown_server.png
xmcl-keystone-ui/src/assets/unknown_server.webp
xmcl-keystone-ui/src/auto-imports.d.ts
xmcl-keystone-ui/src/components/AppAudioPlayer.vue
xmcl-keystone-ui/src/components/AppChangeInstanceIconCard.vue
xmcl-keystone-ui/src/components/AppCollectionList.vue
xmcl-keystone-ui/src/components/AppCopyChip.vue
xmcl-keystone-ui/src/components/AppLoadingCircular.vue
xmcl-keystone-ui/src/components/AppSharedTooltip.vue
xmcl-keystone-ui/src/components/AppSystemBarBadge.vue
xmcl-keystone-ui/src/components/AvatarItem.vue
xmcl-keystone-ui/src/components/CategoryChip.vue
xmcl-keystone-ui/src/components/CurseforgeCategoryChip.vue
xmcl-keystone-ui/src/components/CurseforgeIcon.vue
xmcl-keystone-ui/src/components/DeleteDialog.vue
xmcl-keystone-ui/src/components/EnvVarAddItem.vue
xmcl-keystone-ui/src/components/EnvVarTableItem.vue
xmcl-keystone-ui/src/components/FeedbackCard.vue
xmcl-keystone-ui/src/components/GalleryGrid.vue
xmcl-keystone-ui/src/components/Halo.vue
xmcl-keystone-ui/src/components/Hint.vue
xmcl-keystone-ui/src/components/HomeCard.vue
xmcl-keystone-ui/src/components/InfoHighlight.vue
xmcl-keystone-ui/src/components/InstanceItem.vue
xmcl-keystone-ui/src/components/InstanceManifestFileItem.vue
xmcl-keystone-ui/src/components/InstanceManifestFileTree.vue
xmcl-keystone-ui/src/components/InstanceSelectMenu.vue
xmcl-keystone-ui/src/components/LocalVersionItem.vue
xmcl-keystone-ui/src/components/LogView.vue
xmcl-keystone-ui/src/components/MarketBase.vue
xmcl-keystone-ui/src/components/MarketItem.vue
xmcl-keystone-ui/src/components/MarketProjectDetail.vue
xmcl-keystone-ui/src/components/MarketProjectDetailCurseforge.vue
xmcl-keystone-ui/src/components/MarketProjectDetailModrinth.vue
xmcl-keystone-ui/src/components/MarketProjectDetailVersion.vue
xmcl-keystone-ui/src/components/MarketTextField.vue
xmcl-keystone-ui/src/components/MarketTextFieldWithMenu.vue
xmcl-keystone-ui/src/components/ModpackListItem.vue
xmcl-keystone-ui/src/components/ModrinthCategoryChip.vue
xmcl-keystone-ui/src/components/PlayerAvatar.vue
xmcl-keystone-ui/src/components/SettingHeader.vue
xmcl-keystone-ui/src/components/SettingItem.vue
xmcl-keystone-ui/src/components/SettingItemCheckbox.vue
xmcl-keystone-ui/src/components/SettingItemSelect.vue
xmcl-keystone-ui/src/components/SimpleDialog.vue
xmcl-keystone-ui/src/components/SplitPane.vue
xmcl-keystone-ui/src/components/StepChoice.vue
xmcl-keystone-ui/src/components/StepConfig.vue
xmcl-keystone-ui/src/components/StepManualFTB.vue
xmcl-keystone-ui/src/components/StepSelect.vue
xmcl-keystone-ui/src/components/StepServer.vue
xmcl-keystone-ui/src/components/StepTemplate.vue
xmcl-keystone-ui/src/components/StepperAdvanceContent.vue
xmcl-keystone-ui/src/components/StepperFooter.vue
xmcl-keystone-ui/src/components/StoreExploreCard.vue
xmcl-keystone-ui/src/components/StoreExploreCategories.vue
xmcl-keystone-ui/src/components/StoreProject.vue
xmcl-keystone-ui/src/components/StoreProjectExternal.vue
xmcl-keystone-ui/src/components/StoreProjectGallery.vue
xmcl-keystone-ui/src/components/StoreProjectHeader.vue
xmcl-keystone-ui/src/components/StoreProjectInstallVersionDialog.vue
xmcl-keystone-ui/src/components/StoreProjectInstallVersionDialogVersion.vue
xmcl-keystone-ui/src/components/TaskSpeedMonitor.vue
xmcl-keystone-ui/src/components/UserLoginAuthoritySelect.vue
xmcl-keystone-ui/src/components/UserLoginForm.vue
xmcl-keystone-ui/src/components/UserSkin.vue
xmcl-keystone-ui/src/components/UserSkinImportUrlForm.vue
xmcl-keystone-ui/src/components/UserSkinSpeedDial.vue
xmcl-keystone-ui/src/components/VersionInputFabric.vue
xmcl-keystone-ui/src/components/VersionInputForge.vue
xmcl-keystone-ui/src/components/VersionInputLabymod.vue
xmcl-keystone-ui/src/components/VersionInputLocal.vue
xmcl-keystone-ui/src/components/VersionInputMinecraft.vue
xmcl-keystone-ui/src/components/VersionInputNeoForged.vue
xmcl-keystone-ui/src/components/VersionInputOptifine.vue
xmcl-keystone-ui/src/components/VersionInputQuilt.vue
xmcl-keystone-ui/src/components/halo.glsl
xmcl-keystone-ui/src/components/halo.ts
xmcl-keystone-ui/src/composables/appDropHandler.ts
xmcl-keystone-ui/src/composables/background.ts
xmcl-keystone-ui/src/composables/bootstrap.ts
xmcl-keystone-ui/src/composables/broadcastChannel.ts
xmcl-keystone-ui/src/composables/cache.ts
xmcl-keystone-ui/src/composables/colorTheme.ts
xmcl-keystone-ui/src/composables/compatible.ts
xmcl-keystone-ui/src/composables/contextMenu.ts
xmcl-keystone-ui/src/composables/criticalStatus.ts
xmcl-keystone-ui/src/composables/curseforge.ts
xmcl-keystone-ui/src/composables/curseforgeChangelog.ts
xmcl-keystone-ui/src/composables/curseforgeDependencies.ts
xmcl-keystone-ui/src/composables/curseforgeInstall.ts
xmcl-keystone-ui/src/composables/curseforgeInstaller.ts
xmcl-keystone-ui/src/composables/curseforgeResource.ts
xmcl-keystone-ui/src/composables/curseforgeSearch.ts
xmcl-keystone-ui/src/composables/dataRootErrors.ts
xmcl-keystone-ui/src/composables/databaseStatus.ts
xmcl-keystone-ui/src/composables/dialog.ts
xmcl-keystone-ui/src/composables/dragDrop.ts
xmcl-keystone-ui/src/composables/dropHandler.ts
xmcl-keystone-ui/src/composables/dropLink.ts
xmcl-keystone-ui/src/composables/environment.ts
xmcl-keystone-ui/src/composables/error.ts
xmcl-keystone-ui/src/composables/errorHandler.ts
xmcl-keystone-ui/src/composables/exception.ts
xmcl-keystone-ui/src/composables/extensionStyle.ts
xmcl-keystone-ui/src/composables/flights.ts
xmcl-keystone-ui/src/composables/ftb.ts
xmcl-keystone-ui/src/composables/i18n.ts
xmcl-keystone-ui/src/composables/i18nSearch.ts
xmcl-keystone-ui/src/composables/index.ts
xmcl-keystone-ui/src/composables/installList.ts
xmcl-keystone-ui/src/composables/instanceContextMenu.ts
xmcl-keystone-ui/src/composables/instanceCreation.ts
xmcl-keystone-ui/src/composables/instanceDefaultSource.ts
xmcl-keystone-ui/src/composables/instanceEdit.ts
xmcl-keystone-ui/src/composables/instanceExport.ts
xmcl-keystone-ui/src/composables/instanceFileNodeData.ts
xmcl-keystone-ui/src/composables/instanceFiles.ts
xmcl-keystone-ui/src/composables/instanceFilesDiagnose.ts
xmcl-keystone-ui/src/composables/instanceGroup.ts
xmcl-keystone-ui/src/composables/instanceJava.ts
xmcl-keystone-ui/src/composables/instanceJavaDiagnose.ts
xmcl-keystone-ui/src/composables/instanceLaunch.ts
xmcl-keystone-ui/src/composables/instanceModItems.ts
xmcl-keystone-ui/src/composables/instanceModLoaderDefault.ts
xmcl-keystone-ui/src/composables/instanceMods.ts
xmcl-keystone-ui/src/composables/instanceOptions.ts
xmcl-keystone-ui/src/composables/instanceResourcePack.ts
xmcl-keystone-ui/src/composables/instanceResourcePackItem.ts
xmcl-keystone-ui/src/composables/instanceSave.ts
xmcl-keystone-ui/src/composables/instanceShaderPack.ts
xmcl-keystone-ui/src/composables/instanceSort.ts
xmcl-keystone-ui/src/composables/instanceTemplates.ts
xmcl-keystone-ui/src/composables/instanceUpdate.ts
xmcl-keystone-ui/src/composables/instanceVersion.ts
xmcl-keystone-ui/src/composables/instanceVersionDiagnose.ts
xmcl-keystone-ui/src/composables/instanceVersionInstall.ts
xmcl-keystone-ui/src/composables/instanceVersionServerInstall.ts
xmcl-keystone-ui/src/composables/instances.ts
xmcl-keystone-ui/src/composables/java.ts
xmcl-keystone-ui/src/composables/launch.ts
xmcl-keystone-ui/src/composables/launchButton.ts
xmcl-keystone-ui/src/composables/launchException.ts
xmcl-keystone-ui/src/composables/launchPreview.ts
xmcl-keystone-ui/src/composables/launchTask.ts
xmcl-keystone-ui/src/composables/launcherNews.ts
xmcl-keystone-ui/src/composables/localizedContent.ts
xmcl-keystone-ui/src/composables/login.ts
xmcl-keystone-ui/src/composables/markdown.ts
xmcl-keystone-ui/src/composables/marketCollectionSearch.ts
xmcl-keystone-ui/src/composables/marketSort.ts
xmcl-keystone-ui/src/composables/modCompatibility.ts
xmcl-keystone-ui/src/composables/modCompatibleTooltip.ts
xmcl-keystone-ui/src/composables/modContextMenu.ts
xmcl-keystone-ui/src/composables/modDelete.ts
xmcl-keystone-ui/src/composables/modDependenciesCheck.ts
xmcl-keystone-ui/src/composables/modDetail.ts
xmcl-keystone-ui/src/composables/modDraggable.ts
xmcl-keystone-ui/src/composables/modFilter.ts
xmcl-keystone-ui/src/composables/modGroup.ts
xmcl-keystone-ui/src/composables/modLibCleaner.ts
xmcl-keystone-ui/src/composables/modSearch.ts
xmcl-keystone-ui/src/composables/modSelection.ts
xmcl-keystone-ui/src/composables/modUpgrade.ts
xmcl-keystone-ui/src/composables/modWizard.ts
xmcl-keystone-ui/src/composables/modpack.ts
xmcl-keystone-ui/src/composables/modpackInstaller.ts
xmcl-keystone-ui/src/composables/modrinth.ts
xmcl-keystone-ui/src/composables/modrinthAuthenticatedAPI.ts
xmcl-keystone-ui/src/composables/modrinthDependencies.ts
xmcl-keystone-ui/src/composables/modrinthInstall.ts
xmcl-keystone-ui/src/composables/modrinthInstaller.ts
xmcl-keystone-ui/src/composables/modrinthInstanceResource.ts
xmcl-keystone-ui/src/composables/modrinthLatestVersion.ts
xmcl-keystone-ui/src/composables/modrinthProject.ts
xmcl-keystone-ui/src/composables/modrinthProjectDetailData.ts
xmcl-keystone-ui/src/composables/modrinthSearch.ts
xmcl-keystone-ui/src/composables/modrinthVersions.ts
xmcl-keystone-ui/src/composables/mojangNews.ts
xmcl-keystone-ui/src/composables/nat.ts
xmcl-keystone-ui/src/composables/notifier.ts
xmcl-keystone-ui/src/composables/operation.ts
xmcl-keystone-ui/src/composables/peerGroup.ts
xmcl-keystone-ui/src/composables/peers.ts
xmcl-keystone-ui/src/composables/projectDetail.ts
xmcl-keystone-ui/src/composables/projectInstall.ts
xmcl-keystone-ui/src/composables/protocol.ts
xmcl-keystone-ui/src/composables/query.ts
xmcl-keystone-ui/src/composables/refreshable.ts
xmcl-keystone-ui/src/composables/resolutionPresets.ts
xmcl-keystone-ui/src/composables/resourcePackSearch.ts
xmcl-keystone-ui/src/composables/resourcePacks.ts
xmcl-keystone-ui/src/composables/resources.ts
xmcl-keystone-ui/src/composables/save.ts
xmcl-keystone-ui/src/composables/savesSearch.ts
xmcl-keystone-ui/src/composables/search.ts
xmcl-keystone-ui/src/composables/selectionList.ts
xmcl-keystone-ui/src/composables/semaphore.ts
xmcl-keystone-ui/src/composables/serverStatus.ts
xmcl-keystone-ui/src/composables/setting.ts
xmcl-keystone-ui/src/composables/shaderPackSearch.ts
xmcl-keystone-ui/src/composables/sharedTooltip.ts
xmcl-keystone-ui/src/composables/sortBy.ts
xmcl-keystone-ui/src/composables/swrv.ts
xmcl-keystone-ui/src/composables/swrvConfig.ts
xmcl-keystone-ui/src/composables/syncableState.ts
xmcl-keystone-ui/src/composables/task.ts
xmcl-keystone-ui/src/composables/taskManager.ts
xmcl-keystone-ui/src/composables/telemetryTrack.ts
xmcl-keystone-ui/src/composables/textfieldBehavior.ts
xmcl-keystone-ui/src/composables/theme.ts
xmcl-keystone-ui/src/composables/tutorial.ts
xmcl-keystone-ui/src/composables/uiLayout.ts
xmcl-keystone-ui/src/composables/useAggregateProjects.ts
xmcl-keystone-ui/src/composables/useBlockModelPreview.ts
xmcl-keystone-ui/src/composables/useMarketRoute.ts
xmcl-keystone-ui/src/composables/useSearchPattern.ts
xmcl-keystone-ui/src/composables/user.ts
xmcl-keystone-ui/src/composables/userDiagnose.ts
xmcl-keystone-ui/src/composables/version.ts
xmcl-keystone-ui/src/composables/versionLocal.ts
xmcl-keystone-ui/src/composables/vuetify.ts
xmcl-keystone-ui/src/composables/vuetifyColorTheme.ts
xmcl-keystone-ui/src/composables/windowStyle.ts
xmcl-keystone-ui/src/composables/yggrasil.ts
xmcl-keystone-ui/src/constant.ts
xmcl-keystone-ui/src/directives/sharedTooltip.ts
xmcl-keystone-ui/src/entities/task.ts
xmcl-keystone-ui/src/global.d.ts
xmcl-keystone-ui/src/i18n.ts
xmcl-keystone-ui/src/index.html
xmcl-keystone-ui/src/migration.html
xmcl-keystone-ui/src/staticLocale.ts
xmcl-keystone-ui/src/telemetry.ts
xmcl-keystone-ui/src/util/ReactiveResourceState.ts
xmcl-keystone-ui/src/util/avatarRenderer.ts
xmcl-keystone-ui/src/util/basename.ts
xmcl-keystone-ui/src/util/clients.ts
xmcl-keystone-ui/src/util/curseforge.ts
xmcl-keystone-ui/src/util/curseforgeDependencies.ts
xmcl-keystone-ui/src/util/el.ts
xmcl-keystone-ui/src/util/error.ts
xmcl-keystone-ui/src/util/extensionItems.ts
xmcl-keystone-ui/src/util/favicon.ts
xmcl-keystone-ui/src/util/ftb.ts
xmcl-keystone-ui/src/util/ftbClient.ts
xmcl-keystone-ui/src/util/instanceModLoaderDefault.ts
xmcl-keystone-ui/src/util/mod.ts
xmcl-keystone-ui/src/util/modCompatible.ts
xmcl-keystone-ui/src/util/modDependencies.ts
xmcl-keystone-ui/src/util/modpackFilesResolver.ts
xmcl-keystone-ui/src/util/modrinth.ts
xmcl-keystone-ui/src/util/search.ts
xmcl-keystone-ui/src/util/swrvGet.ts
xmcl-keystone-ui/src/util/theme.v0.ts
xmcl-keystone-ui/src/util/theme.v1.ts
xmcl-keystone-ui/src/util/tree.ts
xmcl-keystone-ui/src/views/AppAddInstanceDialog.vue
xmcl-keystone-ui/src/views/AppBackground.vue
xmcl-keystone-ui/src/views/AppCollectionDialog.vue
xmcl-keystone-ui/src/views/AppContextMenu.vue
xmcl-keystone-ui/src/views/AppDropDialog.vue
xmcl-keystone-ui/src/views/AppDropDialogPreview.vue
xmcl-keystone-ui/src/views/AppExportDialog.vue
xmcl-keystone-ui/src/views/AppFeedbackDialog.vue
xmcl-keystone-ui/src/views/AppGameExitDialog.vue
xmcl-keystone-ui/src/views/AppInstallSkipDialog.vue
xmcl-keystone-ui/src/views/AppInstanceDeleteDialog.vue
xmcl-keystone-ui/src/views/AppLaunchBlockedDialog.vue
xmcl-keystone-ui/src/views/AppLoginAuthoritySelect.vue
xmcl-keystone-ui/src/views/AppLoginForm.vue
xmcl-keystone-ui/src/views/AppMigrateWizardDialog.vue
xmcl-keystone-ui/src/views/AppModrinthLoginDialog.vue
xmcl-keystone-ui/src/views/AppNotifier.vue
xmcl-keystone-ui/src/views/AppShareInstanceDialog.vue
xmcl-keystone-ui/src/views/AppSideBar.vue
xmcl-keystone-ui/src/views/AppSideBarContentFocus.vue
xmcl-keystone-ui/src/views/AppSideBarContentNext.vue
xmcl-keystone-ui/src/views/AppSideBarGroupItem.vue
xmcl-keystone-ui/src/views/AppSideBarGroupItemIndicator.vue
xmcl-keystone-ui/src/views/AppSideBarGroupSettingDialog.vue
xmcl-keystone-ui/src/views/AppSideBarInstanceItem.vue
xmcl-keystone-ui/src/views/AppSystemBar.vue
xmcl-keystone-ui/src/views/AppSystemBarUser.vue
xmcl-keystone-ui/src/views/AppTaskDialog.vue
xmcl-keystone-ui/src/views/AppTaskDialogNodeStatus.vue
xmcl-keystone-ui/src/views/AppTaskDialogTaskView.vue
xmcl-keystone-ui/src/views/AppTaskDialogTaskViewMessage.ts
xmcl-keystone-ui/src/views/BaseSetting.vue
xmcl-keystone-ui/src/views/BaseSettingGeneral.vue
xmcl-keystone-ui/src/views/BaseSettingJava.vue
xmcl-keystone-ui/src/views/BaseSettingJavaList.vue
xmcl-keystone-ui/src/views/BaseSettingLaunch.vue
xmcl-keystone-ui/src/views/BaseSettingResolution.vue
xmcl-keystone-ui/src/views/BaseSettingSync.vue
xmcl-keystone-ui/src/views/BaseSettingVersions.vue
xmcl-keystone-ui/src/views/Curseforge.vue
xmcl-keystone-ui/src/views/CurseforgeCard.vue
xmcl-keystone-ui/src/views/CurseforgeCategories.vue
xmcl-keystone-ui/src/views/CurseforgeProject.vue
xmcl-keystone-ui/src/views/CurseforgeProjectDescription.vue
xmcl-keystone-ui/src/views/CurseforgeProjectFileItem.vue
xmcl-keystone-ui/src/views/CurseforgeProjectFiles.vue
xmcl-keystone-ui/src/views/CurseforgeProjectHeader.vue
xmcl-keystone-ui/src/views/CurseforgeProjectImages.vue
xmcl-keystone-ui/src/views/CurseforgeProjectRecentFiles.vue
xmcl-keystone-ui/src/views/Home.vue
xmcl-keystone-ui/src/views/HomeActions.vue
xmcl-keystone-ui/src/views/HomeCriticalError.vue
xmcl-keystone-ui/src/views/HomeDatabaseError.vue
xmcl-keystone-ui/src/views/HomeDefault.vue
xmcl-keystone-ui/src/views/HomeDropModpackDialog.vue
xmcl-keystone-ui/src/views/HomeExtension.vue
xmcl-keystone-ui/src/views/HomeFocus.vue
xmcl-keystone-ui/src/views/HomeFocusFooter.vue
xmcl-keystone-ui/src/views/HomeGrid.vue
xmcl-keystone-ui/src/views/HomeHeader.vue
xmcl-keystone-ui/src/views/HomeHeaderInstance.vue
xmcl-keystone-ui/src/views/HomeInstanceInstallDialog.vue
xmcl-keystone-ui/src/views/HomeInstanceUpdateDialog.vue
xmcl-keystone-ui/src/views/HomeJavaIssueDialog.vue
xmcl-keystone-ui/src/views/HomeLaunchButton.vue
xmcl-keystone-ui/src/views/HomeLaunchButtonMenu.vue
xmcl-keystone-ui/src/views/HomeLaunchButtonMenuList.vue
xmcl-keystone-ui/src/views/HomeLaunchButtonStatus.vue
xmcl-keystone-ui/src/views/HomeLaunchButtonStatusItem.vue
xmcl-keystone-ui/src/views/HomeLaunchStatusDialog.vue
xmcl-keystone-ui/src/views/HomeLayout.vue
xmcl-keystone-ui/src/views/HomeLogDialog.vue
xmcl-keystone-ui/src/views/HomeLogDialogTab.vue
xmcl-keystone-ui/src/views/HomeModCard.vue
xmcl-keystone-ui/src/views/HomeResourcePacksCard.vue
xmcl-keystone-ui/src/views/HomeSavesCard.vue
xmcl-keystone-ui/src/views/HomeScreenshotCard.vue
xmcl-keystone-ui/src/views/HomeServerStatusBar.vue
xmcl-keystone-ui/src/views/HomeShaderPackCard.vue
xmcl-keystone-ui/src/views/HomeSyncButton.vue
xmcl-keystone-ui/src/views/HomeSyncDialogPull.vue
xmcl-keystone-ui/src/views/HomeSyncDialogPush.vue
xmcl-keystone-ui/src/views/HomeUpstreamBase.vue
xmcl-keystone-ui/src/views/HomeUpstreamCurseforge.vue
xmcl-keystone-ui/src/views/HomeUpstreamFeedTheBeast.vue
xmcl-keystone-ui/src/views/HomeUpstreamHeader.vue
xmcl-keystone-ui/src/views/HomeUpstreamModrinth.vue
xmcl-keystone-ui/src/views/HomeUpstreamVersion.vue
xmcl-keystone-ui/src/views/Instances.vue
xmcl-keystone-ui/src/views/InstancesCard.vue
xmcl-keystone-ui/src/views/InstancesCards.vue
xmcl-keystone-ui/src/views/Me.vue
xmcl-keystone-ui/src/views/Mod.vue
xmcl-keystone-ui/src/views/ModActions.vue
xmcl-keystone-ui/src/views/ModDeleteView.vue
xmcl-keystone-ui/src/views/ModDetailOptifine.vue
xmcl-keystone-ui/src/views/ModDetailResource.vue
xmcl-keystone-ui/src/views/ModDuplicatedDialog.vue
xmcl-keystone-ui/src/views/ModExtension.vue
xmcl-keystone-ui/src/views/ModGroupEntryItem.vue
xmcl-keystone-ui/src/views/ModHeader.vue
xmcl-keystone-ui/src/views/ModIncompatibileDialog.vue
xmcl-keystone-ui/src/views/ModItem.vue
xmcl-keystone-ui/src/views/ModLabels.vue
xmcl-keystone-ui/src/views/ModOptionsPage.vue
xmcl-keystone-ui/src/views/Modrinth.vue
xmcl-keystone-ui/src/views/ModrinthCategories.vue
xmcl-keystone-ui/src/views/ModrinthModCard.vue
xmcl-keystone-ui/src/views/ModrinthProject.vue
xmcl-keystone-ui/src/views/ModrinthProjectBasicInfo.vue
xmcl-keystone-ui/src/views/ModrinthProjectDescription.vue
xmcl-keystone-ui/src/views/ModrinthProjectExternal.vue
xmcl-keystone-ui/src/views/ModrinthProjectFeaturedVersions.vue
xmcl-keystone-ui/src/views/ModrinthProjectGallery.vue
xmcl-keystone-ui/src/views/ModrinthProjectHeader.vue
xmcl-keystone-ui/src/views/ModrinthProjectMembers.vue
xmcl-keystone-ui/src/views/ModrinthProjectTags.vue
xmcl-keystone-ui/src/views/ModrinthProjectVersions.vue
xmcl-keystone-ui/src/views/ModrinthProjectVersionsTile.vue
xmcl-keystone-ui/src/views/Multiplayer.vue
xmcl-keystone-ui/src/views/MultiplayerDialogInitiate.vue
xmcl-keystone-ui/src/views/MultiplayerDialogReceive.vue
xmcl-keystone-ui/src/views/ResourceManage.vue
xmcl-keystone-ui/src/views/ResourceManageModpack.vue
xmcl-keystone-ui/src/views/ResourceManageVersions.vue
xmcl-keystone-ui/src/views/ResourcePack.vue
xmcl-keystone-ui/src/views/ResourcePackActions.vue
xmcl-keystone-ui/src/views/ResourcePackDetailResource.vue
xmcl-keystone-ui/src/views/ResourcePackExtension.vue
xmcl-keystone-ui/src/views/ResourcePackItem.vue
xmcl-keystone-ui/src/views/ResourcePackPreview.vue
xmcl-keystone-ui/src/views/Save.vue
xmcl-keystone-ui/src/views/SaveActions.vue
xmcl-keystone-ui/src/views/SaveCard.vue
xmcl-keystone-ui/src/views/SaveCopyFromDialog.vue
xmcl-keystone-ui/src/views/SaveDetail.vue
xmcl-keystone-ui/src/views/SaveExtension.vue
xmcl-keystone-ui/src/views/SaveItem.vue
xmcl-keystone-ui/src/views/Setting.vue
xmcl-keystone-ui/src/views/SettingAbout.vue
xmcl-keystone-ui/src/views/SettingAppearance.vue
xmcl-keystone-ui/src/views/SettingAppearanceColor.vue
xmcl-keystone-ui/src/views/SettingGeneral.vue
xmcl-keystone-ui/src/views/SettingGlobal.vue
xmcl-keystone-ui/src/views/SettingJavaMemory.vue
xmcl-keystone-ui/src/views/SettingMigrationDialog.vue
xmcl-keystone-ui/src/views/SettingNetwork.vue
xmcl-keystone-ui/src/views/SettingUpdate.vue
xmcl-keystone-ui/src/views/SettingUpdateInfoDialog.vue
xmcl-keystone-ui/src/views/SettingYggdrasilServices.vue
xmcl-keystone-ui/src/views/Setup.vue
xmcl-keystone-ui/src/views/SetupAccount.vue
xmcl-keystone-ui/src/views/SetupAppearance.vue
xmcl-keystone-ui/src/views/SetupDataRoot.vue
xmcl-keystone-ui/src/views/SetupFooter.vue
xmcl-keystone-ui/src/views/SetupInstance.vue
xmcl-keystone-ui/src/views/ShaderPack.vue
xmcl-keystone-ui/src/views/ShaderPackActions.vue
xmcl-keystone-ui/src/views/ShaderPackDetailResource.vue
xmcl-keystone-ui/src/views/ShaderPackExtension.vue
xmcl-keystone-ui/src/views/ShaderPackItem.vue
xmcl-keystone-ui/src/views/StoreEntry.vue
xmcl-keystone-ui/src/views/StoreProjectCurseforge.vue
xmcl-keystone-ui/src/views/StoreProjectFeedTheBeast.vue
xmcl-keystone-ui/src/views/StoreProjectModrinth.vue
xmcl-keystone-ui/src/views/UserChallengesForm.vue
xmcl-keystone-ui/src/views/UserImportSkinUrlForm.vue
xmcl-keystone-ui/src/views/UserMenu.vue
xmcl-keystone-ui/src/views/UserMenuMicrosoft.vue
xmcl-keystone-ui/src/views/UserMenuMojang.vue
xmcl-keystone-ui/src/views/UserMenuUserItem.vue
xmcl-keystone-ui/src/views/UserMenuYggdrasil.vue
xmcl-keystone-ui/src/views/UserSkin.vue
xmcl-keystone-ui/src/views/UserSkinSpeedDial.vue
xmcl-keystone-ui/src/vuetify.ts
xmcl-keystone-ui/src/windows/app/App.vue
xmcl-keystone-ui/src/windows/app/Context.ts
xmcl-keystone-ui/src/windows/app/index.ts
xmcl-keystone-ui/src/windows/app/router.ts
xmcl-keystone-ui/src/windows/browser/index.ts
xmcl-keystone-ui/src/windows/logger/App.vue
xmcl-keystone-ui/src/windows/logger/index.ts
xmcl-keystone-ui/src/windows/main/App.vue
xmcl-keystone-ui/src/windows/main/Context.ts
xmcl-keystone-ui/src/windows/main/index.ts
xmcl-keystone-ui/src/windows/main/router.ts
xmcl-keystone-ui/src/windows/migration/App.vue
xmcl-keystone-ui/src/windows/migration/index.ts
xmcl-keystone-ui/tsconfig.json
xmcl-keystone-ui/uno.config.ts
xmcl-keystone-ui/vite.config.ts
xmcl-keystone-ui/windi.config.ts
xmcl-runtime-api/client.d.ts
xmcl-runtime-api/docs/GETTING_STARTED_zh.md
xmcl-runtime-api/index.ts
xmcl-runtime-api/migration.ts
xmcl-runtime-api/package.json
xmcl-runtime-api/src/apps.ts
xmcl-runtime-api/src/bootstrap.ts
xmcl-runtime-api/src/controller.ts
xmcl-runtime-api/src/entities/InstanceLockSchema.json
xmcl-runtime-api/src/entities/InstanceSchema.json
xmcl-runtime-api/src/entities/SettingSchema.json
xmcl-runtime-api/src/entities/YggdrasilSchema.json
xmcl-runtime-api/src/entities/exception.ts
xmcl-runtime-api/src/entities/instance.schema.ts
xmcl-runtime-api/src/entities/instance.ts
xmcl-runtime-api/src/entities/instanceManifest.schema.ts
xmcl-runtime-api/src/entities/market.ts
xmcl-runtime-api/src/entities/mod.ts
xmcl-runtime-api/src/entities/modpack.ts
xmcl-runtime-api/src/entities/modrinth.ts
xmcl-runtime-api/src/entities/resource.ts
xmcl-runtime-api/src/entities/save.ts
xmcl-runtime-api/src/entities/setting.schema.ts
xmcl-runtime-api/src/entities/setting.ts
xmcl-runtime-api/src/entities/update.ts
xmcl-runtime-api/src/entities/user.schema.ts
xmcl-runtime-api/src/entities/version.ts
xmcl-runtime-api/src/entities/yggdrasil.schema.ts
xmcl-runtime-api/src/multiplayer.ts
xmcl-runtime-api/src/semaphore.ts
xmcl-runtime-api/src/services/BaseService.ts
xmcl-runtime-api/src/services/CurseForgeService.ts
xmcl-runtime-api/src/services/DiagnoseService.ts
xmcl-runtime-api/src/services/ImportService.ts
xmcl-runtime-api/src/services/InstallService.ts
xmcl-runtime-api/src/services/InstanceIOService.ts
xmcl-runtime-api/src/services/InstanceInstallService.ts
xmcl-runtime-api/src/services/InstanceManagingService.ts
xmcl-runtime-api/src/services/InstanceManifestService.ts
xmcl-runtime-api/src/services/InstanceModsGroupService.ts
xmcl-runtime-api/src/services/InstanceModsService.ts
xmcl-runtime-api/src/services/InstanceOptionsService.ts
xmcl-runtime-api/src/services/InstanceResourcePacksService.ts
xmcl-runtime-api/src/services/InstanceSavesService.ts
xmcl-runtime-api/src/services/InstanceServerInfoService.ts
xmcl-runtime-api/src/services/InstanceService.ts
xmcl-runtime-api/src/services/InstanceShaderPacksService.ts
xmcl-runtime-api/src/services/InstanceUpdateService.ts
xmcl-runtime-api/src/services/JavaService.ts
xmcl-runtime-api/src/services/LaunchService.ts
xmcl-runtime-api/src/services/ModMetadataService.ts
xmcl-runtime-api/src/services/ModpackService.ts
xmcl-runtime-api/src/services/ModrinthService.ts
xmcl-runtime-api/src/services/NatService.ts
xmcl-runtime-api/src/services/PeerGroupService.ts
xmcl-runtime-api/src/services/PeerService.ts
xmcl-runtime-api/src/services/ProjectMappingService.ts
xmcl-runtime-api/src/services/ResourceService.ts
xmcl-runtime-api/src/services/ThemeService.ts
xmcl-runtime-api/src/services/UserService.ts
xmcl-runtime-api/src/services/VersionMetadataService.ts
xmcl-runtime-api/src/services/VersionService.ts
xmcl-runtime-api/src/services/YggdrasilService.ts
xmcl-runtime-api/src/state.ts
xmcl-runtime-api/src/telemetry.ts
xmcl-runtime-api/src/util/LockKey.ts
xmcl-runtime-api/src/util/MutableState.ts
xmcl-runtime-api/src/util/SharedState.ts
xmcl-runtime-api/src/util/java.ts
xmcl-runtime-api/src/util/launch.ts
xmcl-runtime-api/src/util/mutex.ts
xmcl-runtime-api/src/util/promiseSignal.ts
xmcl-runtime-api/src/util/semaphore.ts
xmcl-runtime/app/BaseService.ts
xmcl-runtime/app/Host.ts
xmcl-runtime/app/LauncherApp.ts
xmcl-runtime/app/LauncherAppController.ts
xmcl-runtime/app/LauncherAppManager.ts
xmcl-runtime/app/LauncherProtocolHandler.ts
xmcl-runtime/app/MutexManager.ts
xmcl-runtime/app/SemaphoreManager.ts
xmcl-runtime/app/gameDataPath.ts
xmcl-runtime/app/index.ts
xmcl-runtime/app/migrate.ts
xmcl-runtime/app/objectRegistry.ts
xmcl-runtime/app/pluginApiFallback.ts
xmcl-runtime/app/pluginCommonProtocol.ts
xmcl-runtime/app/pluginGameDataPath.ts
xmcl-runtime/app/pluginMediaProtocol.ts
xmcl-runtime/app/utils.ts
xmcl-runtime/app/win32/index.ts
xmcl-runtime/authlibInjector/AuthlibInjectorService.ts
xmcl-runtime/base/BaseService.ts
xmcl-runtime/base/ProjectMappingService.ts
xmcl-runtime/base/index.ts
xmcl-runtime/base/pluginMediaProtocol.ts
xmcl-runtime/constant.ts
xmcl-runtime/curseforge/CurseForgeService.ts
xmcl-runtime/curseforge/index.ts
xmcl-runtime/curseforge/pluginCurseforgeClient.ts
xmcl-runtime/elyby/ElyByService.ts
xmcl-runtime/elyby/cache.json
xmcl-runtime/elyby/elyByPlugin.ts
xmcl-runtime/encoding/pluginEncodingWorker.ts
xmcl-runtime/flights/index.ts
xmcl-runtime/gfw/gfw.ts
xmcl-runtime/gfw/pluginGFW.ts
xmcl-runtime/global.d.ts
xmcl-runtime/imageStore/imageStore.ts
xmcl-runtime/imageStore/pluginImageStore.ts
xmcl-runtime/import/ImportService.ts
xmcl-runtime/import/sourceControlUrlParser.ts
xmcl-runtime/install/DiagnoseService.ts
xmcl-runtime/install/InstallService.ts
xmcl-runtime/install/VersionMetadataService.ts
xmcl-runtime/install/getForgeListFromBMCL.ts
xmcl-runtime/install/getJsonWithCache.ts
xmcl-runtime/install/index.ts
xmcl-runtime/install/optifine.ts
xmcl-runtime/instance/InstanceLogService.ts
xmcl-runtime/instance/InstanceOptionsService.ts
xmcl-runtime/instance/InstanceServerInfoService.ts
xmcl-runtime/instance/InstanceService.ts
xmcl-runtime/instanceIO/InstanceFileDiscover.ts
xmcl-runtime/instanceIO/InstanceFileOperationHandler.ts
xmcl-runtime/instanceIO/InstanceIOService.ts
xmcl-runtime/instanceIO/InstanceInstallService.ts
xmcl-runtime/instanceIO/InstanceManifestService.ts
xmcl-runtime/instanceIO/InstanceUpdateDesign.md
xmcl-runtime/instanceIO/InstanceUpdateService.ts
xmcl-runtime/instanceIO/LinkFilesTask.ts
xmcl-runtime/instanceIO/ResolveInstanceFileTask.ts
xmcl-runtime/instanceIO/UnzipFileTask.ts
xmcl-runtime/instanceIO/XUpdateService.ts
xmcl-runtime/instanceIO/index.ts
xmcl-runtime/instanceIO/parseModrinthInstance.ts
xmcl-runtime/instanceIO/parseMultiMCInstance.ts
xmcl-runtime/instanceIO/parseVanillaInstance.ts
xmcl-runtime/java/JavaService.ts
xmcl-runtime/java/detectJVMArch.ts
xmcl-runtime/java/installDefaultJava.ts
xmcl-runtime/java/java.ts
xmcl-runtime/java/javaPaths.ts
xmcl-runtime/java/zulu.json
xmcl-runtime/java/zulu.ts
xmcl-runtime/launch/LaunchMiddleware.ts
xmcl-runtime/launch/LaunchService.ts
xmcl-runtime/launch/XMCLaunch.ts
xmcl-runtime/launch/pluginLaunchPrecheck.ts
xmcl-runtime/littleSkin/LittleSkinClient.ts
xmcl-runtime/littleSkin/LittleSkinUserService.ts
xmcl-runtime/logger/logger.ts
xmcl-runtime/logger/pluginLogConsumer.ts
xmcl-runtime/market/index.ts
xmcl-runtime/market/marketProvider.ts
xmcl-runtime/market/pluginMarketProvider.ts
xmcl-runtime/mod/InstanceModsService.ts
xmcl-runtime/mod/index.ts
xmcl-runtime/moddb/ModMetadataService.ts
xmcl-runtime/moddb/ProjectMappingService.ts
xmcl-runtime/moddb/index.ts
xmcl-runtime/modpack/ModpackService.ts
xmcl-runtime/modpack/getCurseforgeFiles.ts
xmcl-runtime/modpack/pluginCurseforgeModpackHandler.ts
xmcl-runtime/modpack/pluginMcbbsModpackHandler.ts
xmcl-runtime/modpack/pluginModrinthModpackHandler.ts
xmcl-runtime/modrinth/index.ts
xmcl-runtime/modrinth/service.ts
xmcl-runtime/nat/NatService.ts
xmcl-runtime/nat/index.ts
xmcl-runtime/native.test.ts
xmcl-runtime/nativeReplacer/natives.json
xmcl-runtime/nativeReplacer/pluginNativeReplacer.ts
xmcl-runtime/network/dispatchers/ErrorDecorateHandler.ts
xmcl-runtime/network/dispatchers/biDispatcher.ts
xmcl-runtime/network/dispatchers/cacheDispatcher.ts
xmcl-runtime/network/dispatchers/dispatcher.ts
xmcl-runtime/network/dispatchers/proxyDispatcher.ts
xmcl-runtime/network/dnsServers.ts
xmcl-runtime/network/index.ts
xmcl-runtime/network/networkInterface.ts
xmcl-runtime/network/pluginNetworkInterface.ts
xmcl-runtime/network/userAgent.ts
xmcl-runtime/package.json
xmcl-runtime/peer/PeerGroup.ts
xmcl-runtime/peer/PeerGroupService.ts
xmcl-runtime/peer/PeerGroupUndici.ts
xmcl-runtime/peer/PeerHost.ts
xmcl-runtime/peer/PeerService.ts
xmcl-runtime/peer/PeerServiceFacade.ts
xmcl-runtime/peer/connection.ts
xmcl-runtime/peer/index.ts
xmcl-runtime/peer/mapAndGetPortCanidate.ts
xmcl-runtime/peer/messages/download.ts
xmcl-runtime/peer/messages/heartbeat.ts
xmcl-runtime/peer/messages/identity.ts
xmcl-runtime/peer/messages/lan.ts
xmcl-runtime/peer/stun.ts
xmcl-runtime/presence/PresenceService.ts
xmcl-runtime/resource/core/ResourceContext.ts
xmcl-runtime/resource/core/createResourceContext.ts
xmcl-runtime/resource/core/generateResource.ts
xmcl-runtime/resource/core/getResourceEntry.ts
xmcl-runtime/resource/core/hashResource.ts
xmcl-runtime/resource/core/helper.ts
xmcl-runtime/resource/core/loadResources.ts
xmcl-runtime/resource/core/migrateLegacy.ts
xmcl-runtime/resource/core/migrateResources.ts
xmcl-runtime/resource/core/parseMetadata.ts
xmcl-runtime/resource/core/pathUtils.ts
xmcl-runtime/resource/core/schema.ts
xmcl-runtime/resource/core/tryPersistResource.ts
xmcl-runtime/resource/core/upsertMetadata.ts
xmcl-runtime/resource/core/watchResources.ts
xmcl-runtime/resource/fingerprint.ts
xmcl-runtime/resource/index.ts
xmcl-runtime/resource/parsers/index.ts
xmcl-runtime/resource/pluginResourceWorker.ts
xmcl-runtime/resource/resource.ts
xmcl-runtime/resource/resource.worker.ts
xmcl-runtime/resource/resourceWorkerEntry.ts
xmcl-runtime/resource/service.ts
xmcl-runtime/resource/worker.ts
xmcl-runtime/resourcePack/InstanceResourcePacksService.ts
xmcl-runtime/resourcePack/ResourcePackPreviewService.ts
xmcl-runtime/resourcePack/index.ts
xmcl-runtime/resourcePack/pluginResourcePackLink.ts
xmcl-runtime/save/InstanceSavesService.ts
xmcl-runtime/save/save.ts
xmcl-runtime/service/Service.ts
xmcl-runtime/service/ServiceStateContainer.ts
xmcl-runtime/service/ServiceStateManager.ts
xmcl-runtime/service/pluginServicesHandler.ts
xmcl-runtime/service/stateUtils.ts
xmcl-runtime/settings/pluginSettings.ts
xmcl-runtime/settings/settings.ts
xmcl-runtime/setup/pluginSetup.ts
xmcl-runtime/setup/setupWorker.ts
xmcl-runtime/setup/setupWorkerEntry.ts
xmcl-runtime/shaderPack/InstanceShaderPacksService.ts
xmcl-runtime/shaderPack/index.ts
xmcl-runtime/task/pluginTasks.ts
xmcl-runtime/telemetry/pluginTelemetry.ts
xmcl-runtime/telemetry/telemetry.ts
xmcl-runtime/theme/ThemeService.ts
xmcl-runtime/theme/index.ts
xmcl-runtime/tsconfig.json
xmcl-runtime/uncaughtError/decorateError.ts
xmcl-runtime/user/NodeSystemOptions.ts
xmcl-runtime/user/OfficialUserService.ts
xmcl-runtime/user/UserService.ts
xmcl-runtime/user/YggdrasilSeriveRegistry.ts
xmcl-runtime/user/YggdrasilService.ts
xmcl-runtime/user/accountSystems/AccountSystem.ts
xmcl-runtime/user/accountSystems/MicrosoftAccountSystem.ts
xmcl-runtime/user/accountSystems/MicrosoftOAuthClient.ts
xmcl-runtime/user/accountSystems/OAuthNetworkClient.ts
xmcl-runtime/user/accountSystems/YggdrasilAccountSystem.ts
xmcl-runtime/user/accountSystems/YggdrasilOCIDAuthClient.ts
xmcl-runtime/user/index.ts
xmcl-runtime/user/pluginModrinthAccess.ts
xmcl-runtime/user/pluginOfficialUserApi.ts
xmcl-runtime/user/pluginOfflineUser.ts
xmcl-runtime/user/pluginUserTokenStorage.ts
xmcl-runtime/user/pluginYggdrasilApi.ts
xmcl-runtime/user/user.ts
xmcl-runtime/util/EventSource.ts
xmcl-runtime/util/aggregator.ts
xmcl-runtime/util/curseforge.ts
xmcl-runtime/util/error.ts
xmcl-runtime/util/fs.ts
xmcl-runtime/util/linkResourceFolder.ts
xmcl-runtime/util/mutex.ts
xmcl-runtime/util/object.ts
xmcl-runtime/util/persistance.ts
xmcl-runtime/util/serialize.ts
xmcl-runtime/util/trafficAgent.ts
xmcl-runtime/util/url.ts
xmcl-runtime/util/validate.ts
xmcl-runtime/version/VersionService.ts
xmcl-runtime/worker/helper.ts
xmcl-runtime/worker/index.ts
xmcl-runtime/yggdrasilServer/pluginYggdrasilHandler.ts
```
