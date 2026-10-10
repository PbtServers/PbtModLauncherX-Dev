# Fase 15 — Estabilización y evidencias de PbtModLauncherX 1.0.7

Fecha de comprobación: 2026-10-10. Rama exclusiva `dev/upstream-v1.0.7`.
Base: `d278ed658f0d3e0045d1870cd332a3b3a3f27ba2`.

**Recomendación: BLOQUEADO para release; funciones de integración real aún experimentales. No declarar estable ni publicar.** Las correcciones de esta fase son de validación, portabilidad y cleanup; no se añaden funcionalidades ni se sustituyen mecanismos productivos por mocks.

## Verificación y conservación

Fase 14 confirmada en d278ed65, con README/CHANGELOG renovados y comparativa fija. Árbol e índice inicialmente limpios. Consultados VALIDACION-FINAL, VERSIONADO-AUTOUPDATER, EXPORTACION-SERVIDOR, PBTADMIN-IA-LOCAL, PBTADMIN-LORE y DIFERENCIAS-XMCL-PBTMODLAUNCHERX. Las fases anteriores siguen en el historial. No se cambia versión 1.0.7, master, backup, licencia, identidad, protocolos, datos ni endpoints.

Los comandos documentados se contrastan con package.json/workspace y ejecución actual. Se conservan informes históricos sin sustituir sus resultados por los nuevos.

## Diagnóstico ENOMEM

### Evidencias reproducibles

- Node de sistema: **22.22.3, x64, libuv 1.51.0**. `os.userInfo()` falla con `ERR_SYSTEM_ERROR`, `uv_os_get_passwd returned ENOMEM`, incluso sin importar código del launcher.
- Electron **43.5.0**, ejecutado únicamente con `ELECTRON_RUN_AS_NODE=1` en un proceso hijo: Node **24.19.0, x64, libuv 1.52.1**, mismo fallo. Esto no inicia Electron UI ni valida el launcher; sí demuestra que no es exclusivo de la distribución Node 22.
- Memoria libre observada de aproximadamente 17 GB sobre 34 GB totales durante una sonda: no se demuestra agotamiento de RAM.
- El usuario real es **CodexSandboxOffline**; USERPROFILE/HOMEDRIVE/HOMEPATH y os.homedir apuntan al perfil de PbtinaDev. TEMP/TMP usan la ruta corta del perfil. No se vuelcan todas las variables ni claves.
- Sonda Windows nativa de solo lectura: OpenProcessToken(TOKEN_READ) correcto; GetUserProfileDirectoryW devuelve false, error **122**, tamaño **0**; GetUserNameW resuelve CodexSandboxOffline. El resultado de consulta de perfil es anómalo y consistente con el token/entorno restringido.
- Cambiar TEMP/TMP a ruta larga dentro del workspace no corrige os.userInfo. En Fase 13 se probó también HOME/USERPROFILE por proceso sin éxito. No se modifica perfil real ni se altera seguridad.
- `pnpm.exe --version` falla con `EPERM lstat C:\Users\PBTINA~1` y muestra Node **20.11.1** integrado. El pnpm JS accesible devuelve **11.10.0** bajo Node 22. El adaptador temporal por proceso dirige invocaciones anidadas a este último y permite check/lint sin cambiar políticas del proyecto.
- `tsx@4.21.0` consulta os.userInfo al cargar su módulo de directorio temporal: bloquea compile Electron, build DeskGap, build:all y dev:main antes del build/arranque. `atomically@2.0.3` consulta uid/gid de os.userInfo al importar constantes: bloquea pruebas y seis suites antes de ejecutar su lógica. El CLI DevTools falla durante resolución del perfil.

Clasificación principal: **A/B, entorno Windows/token restringido del sandbox**. No queda comprobado el comportamiento en PowerShell normal desde este proceso. C no explica por sí sola el fallo, dado el segundo runtime. D: dependencias propagan la consulta fallida, no se demuestra corrupción de sus binarios. E: no se identifica código propio como causa de os.userInfo aislado. Tampoco se demuestra intervención del antivirus; no se desactiva ni se cambia ACL.

No se fabrica un resultado os.userInfo, no se carga un perfil artificial, no se cambia Node/Electron ni se modifica configuración compartida para ocultar el bloqueo. La resolución definitiva del perfil del proceso requiere un entorno de ejecución funcional; no hay evidencia de build reparado fuera del sandbox todavía.

Sondas y logs: `temp/phase15-probes.json`, `phase15-native.json`, `phase15-*.log`. Las sondas solo usan datos de entorno acotados, Java/versiones, localhost y dos consultas independientes a proveedores oficiales.

## Correcciones verificadas

| Archivo | Cambio y motivo |
|---|---|
| xmcl-electron-app/build/linuxPackageScripts.test.ts | Suite limitada explícitamente a Linux: valida ownership, SUID y AppArmor con scripts Linux. Un sh de Windows no validaría esos contratos. Los 17 tests se contabilizan omitidos en Windows, no aprobados |
| xmcl-runtime/save/snbt.test.ts | El proceso hijo carga el parser standalone con `--experimental-strip-types` de Node, sin importar tsx. Ejecuta el mismo código real y casos malformados, conservando timeout de OS; sin cambios del parser ni producción |
| xmcl-runtime/instance/InstanceService.icon.test.ts | Cleanup de raíz propia con fs.rm maxRetries=3/retryDelay=100 tras operaciones esperadas |
| xmcl-runtime/instanceIO/InstanceInstallService.progressive.test.ts | Mismo cleanup acotado tras disponer watchers; directorios únicos mkdtemp, sin sleeps generales |
| packages/installer/installManifest.test.ts | Nueva reproducción ENOTEMPTY en cleanup del test de preservar siblings: mismo presupuesto fs.rm limitado a esa raíz temporal |
| Este informe | Diagnóstico, matriz nominal de los 43 fallos, validación actual y procedimientos pendientes |

La [documentación Node 22.16 de TypeScript](https://nodejs.org/download/release/v22.16.0/docs/api/typescript.html) confirma la opción utilizada para sintaxis de tipos borrables. Solo se aplica al parser autocontenido del test; no se propone sustituir tsx para el build completo con aliases/configuración más complejos.

[fs.rm](https://nodejs.org/download/release/v22.22.3/docs/api/fs.html#fspromisesrmpath-options) reintenta errores específicos en modo recursivo, incluidos ENOTEMPTY/EBUSY/EPERM, con presupuesto acotado. No es un sleep indiscriminado ni convierte un error permanente en éxito. Los tests esperaban las operaciones y cerraban/disponían recursos; no se ha identificado un writer productivo que siguiera escribiendo. La causa concreta del handle transitorio no queda atribuida al antivirus ni a una condición de carrera productiva. Los fallos persistentes de cleanup seguirían haciendo fallar las pruebas.

## Matriz nominal de los 43 fallos de Fase 13

Fuente original: `temp/phase13-full-tests-final.log`. Las 43 entradas de tests se distinguen de seis errores de carga de suites. El anexo generado al final incluye nombre, archivo, error, clasificación, reproducción y resultado actual por entrada.

Comandos de referencia:

- **T13**: pnpm JS/Node 22, `exec vitest run --maxWorkers=4 --exclude packages/nat-api/index.test.ts`; 2930 aprobados/43 fallidos/23 omitidos según log histórico. No se cambian esas cifras.
- **I15**: `exec vitest run xmcl-electron-app/build/linuxPackageScripts.test.ts xmcl-runtime/save/snbt.test.ts xmcl-runtime/util/atomicWrite.test.ts xmcl-runtime/instance/InstanceService.icon.test.ts xmcl-runtime/instanceIO/InstanceInstallService.progressive.test.ts --maxWorkers=1`, con JSON en temp/phase15-isolated.json.
- **C15**: repetición estrecha de packages/installer/installManifest.test.ts, InstanceService.icon.test.ts e InstanceInstallService.progressive.test.ts, maxWorkers=1; **72 aprobados**.
- **F15**: `exec vitest run --maxWorkers=4 --reporter=default --reporter=json --outputFile=temp/phase15-final-tests.json`, batería completa del proyecto Vitest.

No hay exclusión adicional de archivos en F15. La prueba NAT privada ya era test.skip en el código original y permanece omitida; no se ejecuta mapeo de puertos de la usuaria. Playwright/e2e es un proyecto separado y permanece pendiente al no arrancar el host.

Las 23 pruebas atomicWrite se mantienen y fallan tanto aisladas como en batería por importar os.userInfo, antes de sus aserciones de filesystem. No se omiten ni se mockea la biblioteca para mejorar artificialmente el resultado. Las seis suites sin carga son CollectionService, LaunchHistoryStore, LocalSkinService, MinecraftFriendsService, UserPersistence y UserService.persistence: BLOQUEADO, no tests aprobados.

## Compilaciones y artefactos

| Comprobación | Estado | Evidencia |
|---|---|---|
| Check API/runtime/Electron main-preload/UI | APROBADO | Root check código 0 con pnpm JS y adaptador temporal |
| Lint packages/runtime/API/UI/Electron | APROBADO | Código 0, dos avisos preexistentes InstanceBlueprintsService |
| Keystone UI + verify-bundle | APROBADO | Bundle dist generado; detalle de chunks/tiempo en log, cero huérfanos |
| Runtime | APROBADO en typecheck/tests que cargan | No se confunde con ejecución del host o empaquetado |
| Electron compile | BLOQUEADO | tsx/os.userInfo; no bundle productivo nuevo validado |
| DeskGap build | BLOQUEADO | Misma causa, no instalador |
| build:all | BLOQUEADO | Antes de empaquetar; script publish never, no publicación |
| DevTools/main dev | BLOQUEADO | CLI/tarea fallan antes de página; 9222/9300/3000 sin app |
| Instaladores Windows, recursos y ejecución | NO EJECUTADO | Cero instaladores nuevos; no se inspeccionan salidas históricas como si fueran actuales |
| Compilación/instalación Linux y macOS | NO EJECUTADO | Configuración inspeccionada, no entorno nativo disponible |

Se usa el pnpm JS de `C:/Users/PbtinaDev/AppData/Local/npm-cache/_npx/52af8750022da9a9/node_modules/pnpm/bin/pnpm.cjs` con `--config.verify-deps-before-run=false`. El PATH del adaptador se modifica solo en procesos hijos. Comandos/códigos completos: phase15-results.json y phase15-final-results.json. No se ha ejecutado instalación limpia/reconstrucción global de dependencias ni cambiado sus versiones.

## Pruebas reales frente a simuladas

| Área | Automatizada/integración local | Real requerido |
|---|---|---|
| Primer inicio IPC/directorio/estado/reintento | Suites existentes ejecutadas | BLOQUEADO: host no arranca. No perfil personal tocado ni instalación limpia acreditada |
| Instancias/loaders/versiones/hotfixes/26.x | Tests de lógica/fixtures ejecutados | BLOQUEADO: manifiesto Mojang y metadata Fabric reciben EACCES en Node independiente del launcher |
| Java/RAM | Java Zulu 25.0.4.1 ejecuta `java -version`, código 0; RAM leída | APROBADO para estas consultas únicamente. No servidor ni Minecraft lanzado; Java 25 no es universal para todo loader |
| Mods/shaders/clasificación/overrides | Suites de metadatos/dependencias/reactividad y persistencia ejecutadas | BLOQUEADO: no UI real, filtros/etiquetas no observados visualmente |
| PbtAdmin/Ollama | Tests con proveedores simulados, identidad/femenino, lore y herramientas | BLOQUEADO: Ollama no detectado en PATH, /api/tags localhost rechaza conexión. Sin modelos descargados ni chat real |
| Proveedores externos | Mocks existentes, herramientas/permisos | NO EJECUTADO con claves reales; no se utilizan claves personales |
| Exportación | ZIP reales con archivos sintéticos, hashes, rutas, scripts, EULA manual, cancelación y secretos mediante tests | BLOQUEADO: servidor Vanilla/Fabric/Forge/NeoForge real no arrancado. Quilt manual no instalado. Create real NO EJECUTADO |
| Actualizador | Política/hash/redirect/cancelación y reemplazo con datos ficticios, HTTP loopback | NO EJECUTADO: actualización instalada completa 1.0.6 → 1.0.7, sin instaladores/feed de prueba legítimo |

Un ZIP físico de fixtures no es un modpack Create real ni un servidor listo. Un mock de streaming no es Ollama real. Un reemplazo de bytes ficticios no es validación completa del instalador ni del almacén de credenciales del SO. Ningún caso se marca APROBADO en la columna real cuando falta esa ejecución.

## Seguridad y privacidad

Se ejecutan las regresiones existentes de provider/tool confirmation, rechazo de ejecución arbitraria, fuentes updater, versiones, hashes, redirecciones, traversal, symlinks, ZIP/secretos y conservación de configuración. No se amplían herramientas ni privilegios de PbtAdmin. PbtinaDev sigue siendo ella, creadora/propietaria/administradora. Se conserva lore con fuentes y separación ficción/hechos.

No se añaden dependencias comerciales XMCL, ni se cambian APIs oficiales, actualizador PbtServers o datos. Las claves personales no se leen ni se usan. No se declara auditoría CVE completa, revisión exhaustiva de toda deserialización ni ausencia universal de secretos en configuraciones.

Riesgos previos pendientes: no hay infraestructura independiente de firma de manifiestos verificada; hashes obtenidos por TLS no sustituyen una firma independiente. Se requiere definir publicadores legítimos, custodia/rotación de claves y verificación cliente antes de producción; no se generan certificados/claves falsos. `xmcl-electron-app/postinstall.ts` contiene un valor literal de configuración CURSEFORGE_API_KEY heredado, cuya legitimidad/alcance necesita revisarse antes de distribuir; no se reproduce su valor aquí ni se cambia una integración sin comprobar su contrato.

## Validación fuera del sandbox: comandos exactos y captura

Ejecutar en PowerShell normal, sin elevación innecesaria, desde el directorio indicado. Este procedimiento **no se ha ejecutado fuera del sandbox** y no demuestra aún builds correctos. Crea únicamente logs en un directorio nuevo del workspace; no instala ni publica.

```powershell
Set-Location 'G:\Documentos\Compilar-Libs-Dev\PbtModLauncherX-Dev'
if ((git branch --show-current) -ne 'dev/upstream-v1.0.7') { throw 'Rama incorrecta' }
$phase15Run = Join-Path (Get-Location) ('temp/phase15-normal-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $phase15Run | Out-Null
whoami | Out-File (Join-Path $phase15Run 'identity.txt') -Encoding utf8
Get-Command node,pnpm -All | Select-Object Name,Source | Out-File (Join-Path $phase15Run 'tools.txt') -Encoding utf8
node -e "console.log(JSON.stringify({node:process.version,arch:process.arch,uv:process.versions.uv,user:require('os').userInfo()}))" *> (Join-Path $phase15Run 'userinfo.log')
if ($LASTEXITCODE -ne 0) { throw 'Consulta del perfil fallida; revisar userinfo.log antes de compilar' }
pnpm --version *> (Join-Path $phase15Run 'pnpm-version.log')
if ($LASTEXITCODE -ne 0) { throw 'pnpm no funciona en este entorno' }
$phase15Codes = [ordered]@{}
pnpm check *> (Join-Path $phase15Run 'check.log'); $phase15Codes['check'] = $LASTEXITCODE
pnpm lint *> (Join-Path $phase15Run 'lint.log'); $phase15Codes['lint'] = $LASTEXITCODE
pnpm exec vitest run --maxWorkers=4 *> (Join-Path $phase15Run 'tests.log'); $phase15Codes['tests'] = $LASTEXITCODE
pnpm build:renderer *> (Join-Path $phase15Run 'renderer.log'); $phase15Codes['renderer'] = $LASTEXITCODE
if ($phase15Codes['renderer'] -eq 0) {
  pnpm --prefix=xmcl-electron-app compile *> (Join-Path $phase15Run 'electron.log'); $phase15Codes['electron'] = $LASTEXITCODE
}
pnpm build:deskgap *> (Join-Path $phase15Run 'deskgap.log'); $phase15Codes['deskgap'] = $LASTEXITCODE
$phase15Codes | ConvertTo-Json | Set-Content (Join-Path $phase15Run 'codes.json') -Encoding utf8
Write-Output $phase15Run
```

Confirmar Node >=22.16 y pnpm 11.10.0. No corregir el perfil mediante ACL globales ni ejecutar instalaciones con privilegios innecesarios. Los logs de identidad son para diagnóstico local: revisarlos antes de compartirlos. Tras build real correcto, empaquetar con `pnpm build:all` y capturar log/código, inspeccionar contenido/versión/firma y ejecutar en perfil temporal; no basta con el exit code. No instalar sobre datos personales.

Para primer inicio usar las tareas existentes `pnpm dev:renderer` y `pnpm dev:main`, perfil aislado según el harness/configuración del repositorio y la guía CLI; verificar localhost:3000 y tamaños 1200x720/800x400, directory setup Unicode, cerrar/reabrir y persistencia. No inventar una variable de aislamiento ni usar el perfil por defecto accidentalmente. Si se acaba de compilar producción, reconstruir main dev antes del relanzamiento.

Ollama, si ya está instalado con un modelo consentido: `ollama list` y `Invoke-RestMethod http://127.0.0.1:11434/api/tags`; después validar chat/stream/cancel en el launcher aislado y preguntas JuanD/Thiamar22OMG/0ftome101/Caus con fuentes/femenino. No descargar modelos ni usar APIs personales para completar una prueba automáticamente.

Servidores: desde instancia de prueba compatible, Exportar servidor, revisar ZIP/mods/dependencias/config y README/scripts, ejecutar instalador oficial conforme al paquete, aceptar EULA personalmente, arrancar y conservar log de listo. Quilt sigue procedimiento manual. Create requiere un modpack real con versiones/loader comprobados. Nada de esto se acredita con fixtures.

Linux/macOS: ejecutar los mismos checks/builds en runners nativos, además de scripts Linux o DMG/firma cuando corresponda; documentar arquitectura realmente ejecutada. Actualización real: preparar instaladores legítimos de ambas versiones/feed aislado autorizado, snapshot de datos ficticios y casos de fallo/recuperación; no usar feeds productivos para experimentar.

## Git y preservación

Las cinco modificaciones de tests y este informe se mantienen en la rama de trabajo. No se descarta trabajo ni se hace push/tag/release. El intento real de git add devuelve `fatal: Unable to create 'G:/Documentos/Compilar-Libs-Dev/PbtModLauncherX-Dev/.git/index.lock': Permission denied`. El índice sigue sin cambios y HEAD permanece `d278ed658f0d3e0045d1870cd332a3b3a3f27ba2`. La ACL de .git mantiene ACE Deny de escritura para SID restringidos; no se altera ni se borra ningún lock. Se conservan seis archivos en temp/phase15-preservacion-20261010.zip, .manifest.json y .patch, con SHA-256 y comprobación byte a byte del ZIP; parche incluye este archivo nuevo.

Comando de una sola línea, desde PowerShell normal en la raíz:

```powershell
if ((git branch --show-current) -ne 'dev/upstream-v1.0.7') { throw 'Rama incorrecta' }; $phase15Files = (Get-Content 'temp/phase15-preservacion-20261010.manifest.json' -Raw | ConvertFrom-Json).files.path; git add -- $phase15Files; if ($LASTEXITCODE -eq 0) { git commit -m 'fix(stability): validate PbtModLauncherX v1.0.7 and resolve verified regressions' }
```

## Resultados finales y anexo nominal

Los resultados y la tabla siguiente se generan desde los logs/JSON de las ejecuciones reales, sin sumar baterías solapadas ni convertir omisiones en aprobaciones.

Batería completa final **F15**: **2934 APROBADOS / 23 FALLIDOS / 40 OMITIDOS**, 338 archivos aprobados, 7 fallidos y 8 omitidos. Los seis errores de carga están incluidos en los 7 archivos fallidos y no se cuentan como tests aprobados. Los 23 tests fallidos son exclusivamente atomicWrite/ENOMEM. Ningún fallo de cleanup ni SNBT reaparece en F15; esto acredita esta ejecución, no ausencia universal de flakiness.

Primera batería F15: 2933 aprobados / 24 fallidos / 40 omitidos, con un nuevo ENOTEMPTY en installManifest. Tras corrección, C15 tiene 72 aprobados y F15 el resultado anterior. I15: 58 aprobados / 23 fallidos / 17 omitidos. No sumar baterías solapadas. La inclusión del NAT previamente omitido y los guards Linux cambia las omisiones frente a T13, sin convertirlas en éxitos.

UI: **48,71 s**, 106 chunks, cero huérfanos. Root check/lint código 0; warnings de runtime previos. No instaladores generados, aplicaciones arrancadas, servidores listos, chat Ollama real ni actualización completa. Recomendación final **BLOQUEADO para release**, funciones reales aún experimentales.

Todos los tests de T13 fallaron en aquella batería; errores abreviados abajo, trazas completas archivadas en el log fuente. I15/F15 indican reproducción posterior con corrección y el mismo cuerpo de pruebas; los tests Linux no se pueden reproducir aislados como ejecución Linux aquí.

| ID | Archivo | Nombre exacto de T13 | Error original | Clasificación | Reproducción aislada I15 | Batería final F15 | Corrección |
|---|---|---|---|---|---|---|---|
| F13-001 | xmcl-electron-app/build/linuxPackageScripts.test.ts | Linux package scripts → configures SUID even when a root namespace probe would succeed | AssertionError: expected Error: spawnSync sh ENOENT { …(5) } to be undefined | Incompatibilidad de plataforma Linux/Windows | NO EJECUTADO (omitido) | NO EJECUTADO (omitido) | Guard Linux; no aprobado en Windows |
| F13-002 | xmcl-electron-app/build/linuxPackageScripts.test.ts | Linux package scripts → fails installation when chown fails | AssertionError: the given combination of arguments (undefined and string) is invalid for this assertion. You can use an array, a map, an object, a set, a string, or a weakset instead of a string | Incompatibilidad de plataforma Linux/Windows | NO EJECUTADO (omitido) | NO EJECUTADO (omitido) | Guard Linux; no aprobado en Windows |
| F13-003 | xmcl-electron-app/build/linuxPackageScripts.test.ts | Linux package scripts → fails installation when chmod fails | AssertionError: the given combination of arguments (undefined and string) is invalid for this assertion. You can use an array, a map, an object, a set, a string, or a weakset instead of a string | Incompatibilidad de plataforma Linux/Windows | NO EJECUTADO (omitido) | NO EJECUTADO (omitido) | Guard Linux; no aprobado en Windows |
| F13-004 | xmcl-electron-app/build/linuxPackageScripts.test.ts | Linux package scripts → verifies actual helper ownership and mode after configuring them | AssertionError: the given combination of arguments (undefined and string) is invalid for this assertion. You can use an array, a map, an object, a set, a string, or a weakset instead of a string | Incompatibilidad de plataforma Linux/Windows | NO EJECUTADO (omitido) | NO EJECUTADO (omitido) | Guard Linux; no aprobado en Windows |
| F13-005 | xmcl-electron-app/build/linuxPackageScripts.test.ts | Linux package scripts → rejects unsafe installation directories ({"XMCL_DIRECTORY_OWNER":"1000"}) | AssertionError: the given combination of arguments (undefined and string) is invalid for this assertion. You can use an array, a map, an object, a set, a string, or a weakset instead of a string | Incompatibilidad de plataforma Linux/Windows | NO EJECUTADO (omitido) | NO EJECUTADO (omitido) | Guard Linux; no aprobado en Windows |
| F13-006 | xmcl-electron-app/build/linuxPackageScripts.test.ts | Linux package scripts → rejects unsafe installation directories ({"XMCL_DIRECTORY_MODE":"775"}) | AssertionError: the given combination of arguments (undefined and string) is invalid for this assertion. You can use an array, a map, an object, a set, a string, or a weakset instead of a string | Incompatibilidad de plataforma Linux/Windows | NO EJECUTADO (omitido) | NO EJECUTADO (omitido) | Guard Linux; no aprobado en Windows |
| F13-007 | xmcl-electron-app/build/linuxPackageScripts.test.ts | Linux package scripts → rejects unsafe installation directories ({"XMCL_DIRECTORY_MODE":"757"}) | AssertionError: the given combination of arguments (undefined and string) is invalid for this assertion. You can use an array, a map, an object, a set, a string, or a weakset instead of a string | Incompatibilidad de plataforma Linux/Windows | NO EJECUTADO (omitido) | NO EJECUTADO (omitido) | Guard Linux; no aprobado en Windows |
| F13-008 | xmcl-electron-app/build/linuxPackageScripts.test.ts | Linux package scripts → fails explicitly when the helper is missing | AssertionError: the given combination of arguments (undefined and string) is invalid for this assertion. You can use an array, a map, an object, a set, a string, or a weakset instead of a string | Incompatibilidad de plataforma Linux/Windows | NO EJECUTADO (omitido) | NO EJECUTADO (omitido) | Guard Linux; no aprobado en Windows |
| F13-009 | xmcl-electron-app/build/linuxPackageScripts.test.ts | Linux package scripts → retains SUID support with older AppArmor versions | AssertionError: expected null to be +0 // Object.is equality | Incompatibilidad de plataforma Linux/Windows | NO EJECUTADO (omitido) | NO EJECUTADO (omitido) | Guard Linux; no aprobado en Windows |
| F13-010 | xmcl-electron-app/build/linuxPackageScripts.test.ts | Linux package scripts → configures SUID on systems without active AppArmor | AssertionError: expected null to be +0 // Object.is equality | Incompatibilidad de plataforma Linux/Windows | NO EJECUTADO (omitido) | NO EJECUTADO (omitido) | Guard Linux; no aprobado en Windows |
| F13-011 | xmcl-electron-app/build/linuxPackageScripts.test.ts | Linux package scripts → reports an AppArmor reload failure | AssertionError: the given combination of arguments (undefined and string) is invalid for this assertion. You can use an array, a map, an object, a set, a string, or a weakset instead of a string | Incompatibilidad de plataforma Linux/Windows | NO EJECUTADO (omitido) | NO EJECUTADO (omitido) | Guard Linux; no aprobado en Windows |
| F13-012 | xmcl-electron-app/build/linuxPackageScripts.test.ts | Linux package scripts → installs the profile without loading it inside a chroot | AssertionError: expected null to be +0 // Object.is equality | Incompatibilidad de plataforma Linux/Windows | NO EJECUTADO (omitido) | NO EJECUTADO (omitido) | Guard Linux; no aprobado en Windows |
| F13-013 | xmcl-electron-app/build/linuxPackageScripts.test.ts | Linux package scripts → does not undo the new installation during an upgrade (1) | AssertionError: expected null to be +0 // Object.is equality | Incompatibilidad de plataforma Linux/Windows | NO EJECUTADO (omitido) | NO EJECUTADO (omitido) | Guard Linux; no aprobado en Windows |
| F13-014 | xmcl-electron-app/build/linuxPackageScripts.test.ts | Linux package scripts → does not undo the new installation during an upgrade (upgrade) | AssertionError: expected null to be +0 // Object.is equality | Incompatibilidad de plataforma Linux/Windows | NO EJECUTADO (omitido) | NO EJECUTADO (omitido) | Guard Linux; no aprobado en Windows |
| F13-015 | xmcl-electron-app/build/linuxPackageScripts.test.ts | Linux package scripts → unregisters the installed path and unloads the profile on removal | AssertionError: expected null to be +0 // Object.is equality | Incompatibilidad de plataforma Linux/Windows | NO EJECUTADO (omitido) | NO EJECUTADO (omitido) | Guard Linux; no aprobado en Windows |
| F13-016 | xmcl-electron-app/build/linuxPackageScripts.test.ts | Linux package scripts → does not delete the profile when unloading it fails | AssertionError: expected null to be +0 // Object.is equality | Incompatibilidad de plataforma Linux/Windows | NO EJECUTADO (omitido) | NO EJECUTADO (omitido) | Guard Linux; no aprobado en Windows |
| F13-017 | xmcl-runtime/instance/InstanceService.icon.test.ts | InstanceService icon storage → preserves the icon through the real directory duplication service | Error: ENOTEMPTY: directory not empty, rmdir 'C:\Users\PBTINA~1\AppData\Local\Temp\xmcl-instance-icon-GgmVTn\instances\Original1' | Flaky de cleanup; origen concreto del handle no determinado | APROBADO | APROBADO | fs.rm retries acotados tras esperar operaciones/disponer watchers |
| F13-018 | xmcl-runtime/instance/InstanceService.icon.test.ts | InstanceService icon storage → preserves both GIF frames during duplication and updates URLs when switching to a static GIF | Error: ENOTEMPTY: directory not empty, rmdir 'C:\Users\PBTINA~1\AppData\Local\Temp\xmcl-instance-icon-p1Mksv\instances\Animated' | Flaky de cleanup; origen concreto del handle no determinado | APROBADO | APROBADO | fs.rm retries acotados tras esperar operaciones/disponer watchers |
| F13-019 | xmcl-runtime/instanceIO/InstanceInstallService.progressive.test.ts | InstanceInstallService progressive installation → persists legacy baseline removals across failure and a fresh-service resume | Error: ENOTEMPTY: directory not empty, rmdir 'G:\Documentos\Compilar-Libs-Dev\PbtModLauncherX-Dev\.progressive-install-test-yQidJx\instance' | Flaky de cleanup; origen concreto del handle no determinado | APROBADO | APROBADO | fs.rm retries acotados tras esperar operaciones/disponer watchers |
| F13-020 | xmcl-runtime/save/snbt.test.ts | parseSnbt → rejects malformed and truncated input in a bounded child process | Error: Command failed: C:\Program Files\nodejs\node.exe --import tsx -e | Dependencia del harness al perfil; parser no alcanzado en T13 | APROBADO | APROBADO | Carga Node nativa, timeout conservado |
| F13-021 | xmcl-runtime/util/atomicWrite.test.ts | atomically EXDEV dependency patch → sync=false → uses rename without copying when it succeeds | Error: Command failed: C:\Program Files\nodejs\node.exe --input-type=module -e | Restricción ambiental; lógica de escritura no alcanzada | BLOQUEADO (Vitest: failed) | BLOQUEADO (Vitest: failed) | Ninguna simulación productiva ni skip |
| F13-022 | xmcl-runtime/util/atomicWrite.test.ts | atomically EXDEV dependency patch → sync=false → copies and syncs the destination on EXDEV (existing=false) | Error: Command failed: C:\Program Files\nodejs\node.exe --input-type=module -e | Restricción ambiental; lógica de escritura no alcanzada | BLOQUEADO (Vitest: failed) | BLOQUEADO (Vitest: failed) | Ninguna simulación productiva ni skip |
| F13-023 | xmcl-runtime/util/atomicWrite.test.ts | atomically EXDEV dependency patch → sync=false → copies and syncs the destination on EXDEV (existing=true) | Error: Command failed: C:\Program Files\nodejs\node.exe --input-type=module -e | Restricción ambiental; lógica de escritura no alcanzada | BLOQUEADO (Vitest: failed) | BLOQUEADO (Vitest: failed) | Ninguna simulación productiva ni skip |
| F13-024 | xmcl-runtime/util/atomicWrite.test.ts | atomically EXDEV dependency patch → sync=false → honors disabled fsync in the copy fallback | Error: Command failed: C:\Program Files\nodejs\node.exe --input-type=module -e | Restricción ambiental; lógica de escritura no alcanzada | BLOQUEADO (Vitest: failed) | BLOQUEADO (Vitest: failed) | Ninguna simulación productiva ni skip |
| F13-025 | xmcl-runtime/util/atomicWrite.test.ts | atomically EXDEV dependency patch → sync=false → propagates unrelated rename errors without copying | Error: Command failed: C:\Program Files\nodejs\node.exe --input-type=module -e | Restricción ambiental; lógica de escritura no alcanzada | BLOQUEADO (Vitest: failed) | BLOQUEADO (Vitest: failed) | Ninguna simulación productiva ni skip |
| F13-026 | xmcl-runtime/util/atomicWrite.test.ts | atomically EXDEV dependency patch → sync=false → propagates copy failures and cleans the temporary file | Error: Command failed: C:\Program Files\nodejs\node.exe --input-type=module -e | Restricción ambiental; lógica de escritura no alcanzada | BLOQUEADO (Vitest: failed) | BLOQUEADO (Vitest: failed) | Ninguna simulación productiva ni skip |
| F13-027 | xmcl-runtime/util/atomicWrite.test.ts | atomically EXDEV dependency patch → sync=false → recovers after a copy partially overwrites the destination (existing=false) | Error: Command failed: C:\Program Files\nodejs\node.exe --input-type=module -e | Restricción ambiental; lógica de escritura no alcanzada | BLOQUEADO (Vitest: failed) | BLOQUEADO (Vitest: failed) | Ninguna simulación productiva ni skip |
| F13-028 | xmcl-runtime/util/atomicWrite.test.ts | atomically EXDEV dependency patch → sync=false → recovers after a copy partially overwrites the destination (existing=true) | Error: Command failed: C:\Program Files\nodejs\node.exe --input-type=module -e | Restricción ambiental; lógica de escritura no alcanzada | BLOQUEADO (Vitest: failed) | BLOQUEADO (Vitest: failed) | Ninguna simulación productiva ni skip |
| F13-029 | xmcl-runtime/util/atomicWrite.test.ts | atomically EXDEV dependency patch → sync=false → does not overwrite the original when preparing its backup fails | Error: Command failed: C:\Program Files\nodejs\node.exe --input-type=module -e | Restricción ambiental; lógica de escritura no alcanzada | BLOQUEADO (Vitest: failed) | BLOQUEADO (Vitest: failed) | Ninguna simulación productiva ni skip |
| F13-030 | xmcl-runtime/util/atomicWrite.test.ts | atomically EXDEV dependency patch → sync=false → restores the original when syncing the new destination fails | Error: Command failed: C:\Program Files\nodejs\node.exe --input-type=module -e | Restricción ambiental; lógica de escritura no alcanzada | BLOQUEADO (Vitest: failed) | BLOQUEADO (Vitest: failed) | Ninguna simulación productiva ni skip |
| F13-031 | xmcl-runtime/util/atomicWrite.test.ts | atomically EXDEV dependency patch → sync=false → retains both complete recovery files if restoration also fails | Error: Command failed: C:\Program Files\nodejs\node.exe --input-type=module -e | Restricción ambiental; lógica de escritura no alcanzada | BLOQUEADO (Vitest: failed) | BLOQUEADO (Vitest: failed) | Ninguna simulación productiva ni skip |
| F13-032 | xmcl-runtime/util/atomicWrite.test.ts | atomically EXDEV dependency patch → sync=true → uses rename without copying when it succeeds | Error: Command failed: C:\Program Files\nodejs\node.exe --input-type=module -e | Restricción ambiental; lógica de escritura no alcanzada | BLOQUEADO (Vitest: failed) | BLOQUEADO (Vitest: failed) | Ninguna simulación productiva ni skip |
| F13-033 | xmcl-runtime/util/atomicWrite.test.ts | atomically EXDEV dependency patch → sync=true → copies and syncs the destination on EXDEV (existing=false) | Error: Command failed: C:\Program Files\nodejs\node.exe --input-type=module -e | Restricción ambiental; lógica de escritura no alcanzada | BLOQUEADO (Vitest: failed) | BLOQUEADO (Vitest: failed) | Ninguna simulación productiva ni skip |
| F13-034 | xmcl-runtime/util/atomicWrite.test.ts | atomically EXDEV dependency patch → sync=true → copies and syncs the destination on EXDEV (existing=true) | Error: Command failed: C:\Program Files\nodejs\node.exe --input-type=module -e | Restricción ambiental; lógica de escritura no alcanzada | BLOQUEADO (Vitest: failed) | BLOQUEADO (Vitest: failed) | Ninguna simulación productiva ni skip |
| F13-035 | xmcl-runtime/util/atomicWrite.test.ts | atomically EXDEV dependency patch → sync=true → honors disabled fsync in the copy fallback | Error: Command failed: C:\Program Files\nodejs\node.exe --input-type=module -e | Restricción ambiental; lógica de escritura no alcanzada | BLOQUEADO (Vitest: failed) | BLOQUEADO (Vitest: failed) | Ninguna simulación productiva ni skip |
| F13-036 | xmcl-runtime/util/atomicWrite.test.ts | atomically EXDEV dependency patch → sync=true → propagates unrelated rename errors without copying | Error: Command failed: C:\Program Files\nodejs\node.exe --input-type=module -e | Restricción ambiental; lógica de escritura no alcanzada | BLOQUEADO (Vitest: failed) | BLOQUEADO (Vitest: failed) | Ninguna simulación productiva ni skip |
| F13-037 | xmcl-runtime/util/atomicWrite.test.ts | atomically EXDEV dependency patch → sync=true → propagates copy failures and cleans the temporary file | Error: Command failed: C:\Program Files\nodejs\node.exe --input-type=module -e | Restricción ambiental; lógica de escritura no alcanzada | BLOQUEADO (Vitest: failed) | BLOQUEADO (Vitest: failed) | Ninguna simulación productiva ni skip |
| F13-038 | xmcl-runtime/util/atomicWrite.test.ts | atomically EXDEV dependency patch → sync=true → recovers after a copy partially overwrites the destination (existing=false) | Error: Command failed: C:\Program Files\nodejs\node.exe --input-type=module -e | Restricción ambiental; lógica de escritura no alcanzada | BLOQUEADO (Vitest: failed) | BLOQUEADO (Vitest: failed) | Ninguna simulación productiva ni skip |
| F13-039 | xmcl-runtime/util/atomicWrite.test.ts | atomically EXDEV dependency patch → sync=true → recovers after a copy partially overwrites the destination (existing=true) | Error: Command failed: C:\Program Files\nodejs\node.exe --input-type=module -e | Restricción ambiental; lógica de escritura no alcanzada | BLOQUEADO (Vitest: failed) | BLOQUEADO (Vitest: failed) | Ninguna simulación productiva ni skip |
| F13-040 | xmcl-runtime/util/atomicWrite.test.ts | atomically EXDEV dependency patch → sync=true → does not overwrite the original when preparing its backup fails | Error: Command failed: C:\Program Files\nodejs\node.exe --input-type=module -e | Restricción ambiental; lógica de escritura no alcanzada | BLOQUEADO (Vitest: failed) | BLOQUEADO (Vitest: failed) | Ninguna simulación productiva ni skip |
| F13-041 | xmcl-runtime/util/atomicWrite.test.ts | atomically EXDEV dependency patch → sync=true → restores the original when syncing the new destination fails | Error: Command failed: C:\Program Files\nodejs\node.exe --input-type=module -e | Restricción ambiental; lógica de escritura no alcanzada | BLOQUEADO (Vitest: failed) | BLOQUEADO (Vitest: failed) | Ninguna simulación productiva ni skip |
| F13-042 | xmcl-runtime/util/atomicWrite.test.ts | atomically EXDEV dependency patch → sync=true → retains both complete recovery files if restoration also fails | Error: Command failed: C:\Program Files\nodejs\node.exe --input-type=module -e | Restricción ambiental; lógica de escritura no alcanzada | BLOQUEADO (Vitest: failed) | BLOQUEADO (Vitest: failed) | Ninguna simulación productiva ni skip |
| F13-043 | xmcl-runtime/util/atomicWrite.test.ts | atomically EXDEV dependency patch → keeps concurrent writes serialized through the complete fallback | Error: Command failed: C:\Program Files\nodejs\node.exe --input-type=module -e | Restricción ambiental; lógica de escritura no alcanzada | BLOQUEADO (Vitest: failed) | BLOQUEADO (Vitest: failed) | Ninguna simulación productiva ni skip |

Los nombres de jerarquías usan flechas en lugar de separadores `>` para legibilidad, sin cambiar casos/parametrizaciones. Cada fila utiliza T13/I15/F15 definidos arriba. El detalle JSON temporal conserva los nombres originales y sus estados.
