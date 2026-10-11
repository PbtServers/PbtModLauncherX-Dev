# Recuperaci?n tras corte el?ctrico ? Fase 9

Fecha: 2026-10-10. Repositorio: G:/Documentos/Compilar-Libs-Dev/PbtModLauncherX-Dev.
Rama: dev/upstream-v1.0.7. HEAD: 9c59e43f029bd29ed0da262c6f3e632f2149f2ff.

## Estado de recuperaci?n

G: accesible. Estado inicial: siete archivos modificados y cinco nuevos, exactamente los doce de la Fase 9. No faltan archivos ni aparecen cambios posteriores ajenos a esta fase. No se restaur? ni sobrescribi? ning?n archivo. El informe REPARACION-PRIMER-INICIO-v1.0.7.md se conserva como registro de la sesi?n anterior; este documento actualiza su estado de recuperaci?n.

Se verificaron los doce archivos del manifiesto original mediante tama?o y SHA-256, tanto en el directorio de trabajo como en las entradas del ZIP. Todos coinciden. El ZIP tiene doce entradas y su SHA-256 coincide con el manifiesto:
E3C45F9752742B43F768B53C2B51FC78B24D566765257BC32430B516A7630855.

El parche original tambi?n est? presente: git apply --reverse --check termina correctamente. Solo se comprob?; no se aplic?. Los tres artefactos originales temp/phase9-preservacion-20261010.{zip,patch,manifest.json} permanecen intactos.

## Integridad Git

Git status, branch y log son coherentes con el ?ltimo estado comunicado. git fsck --full termin? con c?digo 0, sin objetos corruptos/faltantes. ?nico aviso: dangling tree 3f7d17eafd265cb7c1a3add0f593e9d8af66b1d7. Un objeto sin referencia no demuestra corrupci?n; se conserva, sin prune ni limpieza.

No existe .git/index.lock. Get-Process git no encontr? procesos Git activos en la comprobaci?n. No se elimin? ning?n lock.

master y backup/pre-upstream-v1.0.7 conservan c4b77e666f0b132e05e3ffff71d2728132a46a44. La versi?n p?blica contin?a en 1.0.6. No se hizo push, tags, releases ni modificaciones de funcionalidades durante la recuperaci?n.

## Correcciones conservadas

Se revis? el flujo LauncherApp y Setup.vue: bootstrap se registra antes de mostrar el asistente y espera preparaci?n de directorios, persistencia y publicaci?n de rutas; createInitialSetup conserva concurrencia/idempotencia y reintentos tras fallo. El renderer conserva plazos de preset/validaci?n de 10 segundos, finalizaci?n de 30 segundos y entorno opcional de 5 segundos. La revisi?n de validaci?n impide aplicar respuestas obsoletas. Las regresiones y los mensajes es-ES/ca/en permanecen ?ntegros.

## Validaciones repetidas

- 59 tests aprobados, 0 fallidos, seis archivos: initialSetup, migrate, locale de runtime-api, setting, locale UI y setupRequest.
- Typecheck correcto en runtime-api, runtime, Electron main/preload y Keystone UI, mediante sus tareas por paquete con Node 22 y pnpm compatible. No se modific? configuraci?n compartida.
- Lint correcto en packages, runtime-api, runtime, Electron y Keystone UI: cero errores. Runtime conserva dos advertencias anteriores.
- Keystone UI: build correcto, 103 chunks, cero helpers hu?rfanos.
- Electron compile y DeskGap build: intentados, bloqueados por uv_os_get_passwd returned ENOMEM. El fallo se reproduce con node:os.userInfo sin importar el launcher.
- La CLI oficial chrome-devtools se intent? y fall? con el mismo ENOMEM antes de conectarse. No se verific? una primera instalaci?n real ni una ejecuci?n visual del asistente; permanecen las comprobaciones manuales online/offline/sin Java/reintento descritas en el informe original.
- git diff --check correcto.

Logs locales: temp/recovery9-tests.log, recovery9-check-*.log, recovery9-lint-*.log, recovery9-build-*.log, recovery9-devtools.log y recovery9-userinfo.log.

## Commit y permisos efectivos

Se intent? git add -- xmcl-runtime/app/initialSetup.ts. Error exacto:

```
fatal: Unable to create 'G:/Documentos/Compilar-Libs-Dev/PbtModLauncherX-Dev/.git/index.lock': Permission denied
```

El ?ndice permanece sin cambios preparados y no se cre? commit. La pol?tica declarada de esta sesi?n permite escribir .git, por lo que ya no es correcto atribuirlo simplemente a una ra?z de solo lectura como en la sesi?n anterior. El proceso se ejecuta como PBTSYSTEM-V7-PR\CodexSandboxOffline, miembro de CodexSandboxUsers. Get-Acl/icacls muestran permisos heredados Modify para ese grupo y Usuarios autentificados, junto con denegaciones expl?citas W/D/Rc/DC para otros SID. Esos SID no aparecen en whoami /groups; estas comprobaciones no permiten demostrar que dichas denegaciones correspondan al token restringido del proceso ni aislar el mecanismo exacto de bloqueo. El permiso efectivo observable para Git es lectura pero creaci?n de index.lock denegada dentro del entorno Codex. No se ha demostrado un bloqueo por antivirus. No se modificaron ACL, permisos globales, locks ni configuraci?n del sandbox.

Se conserva una segunda copia verificada con este informe adicional, sin sustituir la anterior: temp/phase9-recuperacion-20261010.{zip,patch,manifest.json}. Incluye trece archivos; el script comprueba tama?o y SHA-256 de cada entrada y guarda SHA-256 del ZIP.

Comando manual PowerShell desde la ra?z, en una sesi?n del usuario con acceso normal a Git:

```powershell
if ((git branch --show-current) -ne 'dev/upstream-v1.0.7') { throw 'Rama incorrecta' }; $recovery9Files = (Get-Content 'temp/phase9-recuperacion-20261010.manifest.json' -Raw | ConvertFrom-Json).files.path; git add -- $recovery9Files; if ($LASTEXITCODE -eq 0) { git commit -m 'fix(startup): complete initial setup before acknowledging IPC' }
```

Recuperaci?n completada sin p?rdida de archivos. Commit y primera ejecuci?n real pendientes por restricciones ambientales. No se inicia la Fase 10.
