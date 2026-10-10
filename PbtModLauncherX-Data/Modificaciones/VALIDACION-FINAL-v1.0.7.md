# Fase 13 — Validación integral de PbtModLauncherX 1.0.7

Fecha: 2026-10-10. Rama: `dev/upstream-v1.0.7`.
HEAD de partida: `010707b245682d30548b239584cf2ad7d399740f`.

**No se declara estable ni lista para publicar.** Persisten bloqueos de compilación y pruebas reales pendientes. No se publica, hace push, crea tags ni inicia la Fase 14.

## Requisito previo y conservación

Árbol e índice inicialmente limpios. El HEAD confirma la Fase 12 y contiene `db1f5706`, exportación/clasificación de mods; también están confirmadas independencia, IA local, lore, primer inicio e iconos/GIF. Se consultaron AGENTS.md, CONTRIBUTING.md, la guía Chrome DevTools y los informes técnicos anteriores. Esos informes históricos no se reescriben.

`git fsck --no-reflogs` termina con código 0: comunica únicamente el árbol colgante `3f7d17eafd265cb7c1a3add0f593e9d8af66b1d7`, sin objetos corruptos. No se elimina ni se ejecuta garbage collection.

## Diagnóstico reproducible del entorno

- Node `22.22.3`, x64, `C:\Program Files\nodejs\node.exe`, libuv `1.51.0`. Cumple el requisito Node >=22.16.0 del package.json actual; CONTRIBUTING contiene referencias históricas anteriores.
- `node -e "require('node:os').userInfo()"` falla sin importar código del proyecto: `ERR_SYSTEM_ERROR`, `uv_os_get_passwd returned ENOMEM`, errno -4057.
- `os.homedir()` devuelve `C:\Users\PbtinaDev`; `os.tmpdir()` utiliza `C:\Users\PBTINA~1\AppData\Local\Temp`. El proceso real es `PBTSYSTEM-V7-PR\CodexSandboxOffline`, distinto del perfil indicado por las variables de entorno. USERPROFILE existe.
- Memoria observada en una muestra: 34.259.640.320 bytes totales y 19.273.654.272 libres. El texto ENOMEM no demuestra por sí solo agotamiento físico de RAM.
- Sonda nativa de solo lectura, `temp/phase13-native.py`: OpenProcessToken(TOKEN_READ) funciona; GetUserProfileDirectoryW(token, NULL, &size) devuelve false, error **122**, tamaño **0**. GetUserNameW funciona y devuelve CodexSandboxOffline. No se cargan/crean perfiles ni se cambian políticas.
- En el [código oficial libuv 1.51.0](https://github.com/libuv/libuv/blob/v1.51.0/src/win/util.c), uv__getpwuid_r consulta el perfil del token y después reserva el tamaño devuelto. El resultado anómalo de tamaño cero es consistente con el fallo observado de resolución del perfil del usuario del sandbox; no se ha instrumentado internamente Node para atribuir una rama exacta. os.homedir puede resolver USERPROFILE sin esa consulta, por lo que su éxito no valida os.userInfo.
- Pruebas reversibles en procesos hijos: TEMP/TMP largos dentro de `temp/`, y HOME/USERPROFILE explícitos dentro de `temp/`, siguen produciendo ENOMEM. No quedan cambios permanentes de entorno.
- `tsx@4.21.0` llama os.userInfo al importar su módulo de directorio temporal en Windows. Electron compile, DeskGap build y dev:main fallan allí, antes de compilar/iniciar el launcher. `atomically@2.0.3` también consulta os.userInfo durante su importación; explica seis suites que no llegan a cargar y pruebas de procesos hijos. El CLI Chrome DevTools falla en su resolución del directorio de usuario.
- No se parchea os.userInfo ni se falsea una identidad, ni se modifica código productivo para ocultar el bloqueo. Dependencias nativas de la aplicación no llegan a validarse mediante un paquete ejecutable nuevo.

### Alternativa segura que sí funciona para pnpm

Las tareas raíz iniciales fallan al invocar un pnpm anidado que usa Node 20.11.1 y recibe `EPERM: lstat C:\Users\PBTINA~1`. Los checks directos por paquete funcionan con el pnpm JS disponible y Node 22.

`temp/phase13-final-run.py` crea `temp/phase13-bin/pnpm.cmd` apuntando al pnpm JS disponible y antepone **solo en sus procesos hijos** esa carpeta al PATH. De este modo las tareas raíz `check` y `lint` terminan con código **0**. No se cambia packageManager, lockfile, dependencias, configuración compartida ni PATH permanente. Es independiente del bloqueo os.userInfo, que sigue presente.

Los comandos reales y códigos están en `temp/phase13-results.json`, `phase13-probes.json` y `phase13-final-results.json`; los logs correspondientes están en `temp/phase13-*.log`. El prefijo utilizado es:

```powershell
node C:/Users/PbtinaDev/AppData/Local/npm-cache/_npx/52af8750022da9a9/node_modules/pnpm/bin/pnpm.cjs --config.verify-deps-before-run=false
```

Esta opción evita una instalación implícita al ejecutar tareas; no actualiza dependencias.

## Cambios demostrados de esta fase

1. `xmcl-runtime/app/pluginCommonProtocol.test.ts`: la regresión de caché utilizaba api.xmcl.app y esperaba una petición que la independencia XMCL bloquea correctamente. Ahora comprueba el reenvío de caché con un dominio ficticio autorizado por la política local y un fetch simulado. Añade un test independiente: el dominio exclusivo XMCL recibe 503 y nunca llama a fetch. No se restaura ninguna conexión XMCL.
2. `xmcl-electron-app/main/utils/updateDownload.test.ts`: amplía la simulación de reemplazo 1.0.6 → 1.0.7 en ruta Unicode para comprobar conservación byte a byte de instancia, mundo ficticio, icono ficticio, opciones de shaders, proveedor/modelo/historial de PbtAdmin, bóveda opaca ficticia y clasificación de mods. No interpreta credenciales reales ni cambia formatos. Es una prueba de la primitiva de reemplazo, **no un instalador completo, un GIF visual ni una migración de bóveda real**.
3. Este informe. No hay cambios de comportamiento productivo, versiones, endpoints ni migraciones nuevas.

## Batería automatizada y fallos

| Ejecución | Resultado |
|---|---|
| Regresiones seleccionadas de fases previas e instalación/versiones | 595 aprobados, 5 omitidos; 60 archivos aprobados, 1 omitido |
| Batería amplia inicial | 2.930 aprobados, 42 fallidos, 23 omitidos; 335 archivos aprobados, 11 fallidos, 6 omitidos |
| Batería amplia repetida, maxWorkers=4 | 2.930 aprobados, **43 fallidos**, 23 omitidos; 335 archivos aprobados, 11 fallidos, 6 omitidos |
| Repetición aislada de protocolo, instalación progresiva, shaders y versiones | 107 aprobados, 1 omitido, 7 archivos aprobados |
| Tests editados (updateDownload y pluginCommonProtocol) | 15 aprobados, 2 archivos aprobados |
| Repetición aislada de iconos y progresiva, maxWorkers=1 | 52 aprobados, 2 archivos aprobados |

Las ejecuciones se solapan: **no sumar sus conteos** como tests únicos. La ampliación final de conservación se valida con la ejecución estrecha de 15 tests. Los conteos amplios se conservan aunque posteriormente haya resultados aislados correctos.

Se excluye explícitamente `packages/nat-api/index.test.ts`, que consulta un gateway real 192.168.1.1: no se usa la red privada de la usuaria como fixture ni se presenta esa prueba como ejecutada. Playwright/e2e es un proyecto separado y no se ejecuta al fallar el arranque real.

Desglose de los **43 fallos de tests** en la última batería amplia:

- 16: linuxPackageScripts, sin `sh` en este entorno Windows. BLOQUEADA su validación Linux, aunque Vitest devuelve fallos.
- 23: atomicWrite; procesos hijos importan atomically y fallan con ENOMEM.
- 1: SNBT; proceso hijo importa tsx y falla con ENOMEM.
- 2: iconos/duplicación, limpieza de carpetas temporales falla con ENOTEMPTY.
- 1: instalación progresiva, limpieza temporal falla con ENOTEMPTY.

Además, seis suites fallan al cargar por ENOMEM: CollectionService, LaunchHistoryStore, LocalSkinService, MinecraftFriendsService, UserPersistence y UserService.persistence. No se cuentan como tests ejecutados.

Las tres incidencias ENOTEMPTY no se reproducen en la repetición aislada de 52 tests; **su causa no queda confirmada**. El primer barrido tuvo además un timeout progresivo que tampoco reaparece aislado. Debe investigarse la limpieza/concurrencia bajo carga en un entorno funcional antes de aceptar la batería completa. No se incrementan timeouts globales ni se omiten pruebas para presentar un resultado verde.

## Matriz integral

| Área | Clase | Estado | Evidencia y límites |
|---|---|---|---|
| Versiones 1.0.7, metadatos y feeds propios | Automatizada | APROBADA | releaseMetadata/updatePolicy/updater; versiones públicas y técnicas diferenciadas, feed publicado histórico preservado |
| Typecheck API, runtime, Electron main/preload, UI, DeskGap | Automatizada | APROBADA | Códigos 0 por paquete; root check 0 con adaptador temporal |
| Lint packages, API, runtime, Electron, UI | Automatizada | APROBADA | Root lint 0 con adaptador; dos avisos previos InstanceBlueprintsService, cero errores |
| Traducciones es-ES/ca y locales del host | Automatizada | APROBADA | UI 2594/2594, Electron 21/21, componentes 29/29; cero fallos, 54 diagnósticos previos de otros idiomas |
| Batería amplia | Automatizada | FALLIDA | 43 fallos y seis suites no cargadas; desglose anterior |
| Setup/IPC, reintentos, timeouts y persistencia | Automatizada | APROBADA | initialSetup, preferencias y tests existentes; promesas/host simulados y disco temporal, no primer instalador real |
| Instalación limpia, cierre/reapertura, sin Java/offline/lenta | Interfaz real / instalación real | BLOQUEADA | dev:main falla antes de Electron; no se modifican perfiles personales |
| Creación/importación/edición y loaders | Automatizada | APROBADA | Suites de instancias/instalación; metadatos y descargas simulados donde corresponde |
| Lanzamiento Minecraft y descarga de loaders oficiales | Integración real | BLOQUEADA | Node fetch a manifiesto Mojang y metadata Fabric recibe EACCES; no se descargan paquetes masivos |
| Java instalado | Integración | APROBADA | Se localiza Java Zulu 25; no prueba que todas las versiones MC deban usar Java 25 ni sustituye lanzamiento |
| Shaders, 26.x, iconos y GIF/reduced motion | Automatizada | APROBADA | Suites existentes y repetición estrecha; la batería amplia conserva fallos de limpieza de iconos |
| GIF animados y columnas/filtros de mods en pantalla | Interfaz real | BLOQUEADA | No launcher ni endpoint DevTools activo; SSR/composables no se presentan como observación visual |
| Tipo/Servidor, fuentes, exactitud, caché, decisiones/dependencias | Automatizada | APROBADA | serverModClassification/serverModDecisions y UI; fixtures/metadatos simulados |
| ZIP, hashes, scripts, secretos, traversal, symlinks, cancelación | Integración local | APROBADA | serverExport crea y lee ZIP reales con contenido sintético y recetas simuladas; no modpack Create real |
| Paquetes oficiales Vanilla/Fabric/Forge/NeoForge y servidor listo | Servidor real | BLOQUEADA | Falta ejecución real; acceso a proveedores bloqueado. Ningún log de servidor ready validado |
| Quilt, receta/manual e instrucciones | Automatizada | APROBADA | Tests de loader/manual y scripts; instalación manual real pendiente |
| Modpack Create compatible real | Servidor real | NO EJECUTADA | No se dispone de modpack descargado/verificado ni servidor real; fixtures Create no sustituyen esa prueba |
| PbtAdmin, lore, fuentes, femenino, seguridad/herramientas | Automatizada | APROBADA | pbtAdmin/localProviders/tools/documents/agent; proveedores simulados, fuentes locales, distinción canon/ficción |
| Ollama real, streaming/cancelación/herramientas en pantalla | Integración / interfaz real | BLOQUEADA | Sin comando Ollama detectado y /api/tags en 127.0.0.1:11434 rechaza conexión; no se descargan modelos |
| Proveedores externos con mocks | Automatizada | APROBADA | Tests existentes; no se leen ni usan claves personales |
| Rechazo downgrade/manifiesto corrupto/fuente externa/hash/cancelación | Automatizada / integración local | APROBADA | updatePolicy/updateDownload/updater; HTTP loopback de bytes sintéticos, no instaladores ejecutados |
| Conservación de datos durante reemplazo aislado | Integración local | APROBADA | Test ampliado con datos ficticios, ruta Unicode y backup de bytes 1.0.6; alcance limitado a primitiva |
| Actualización completa instalada 1.0.6 → 1.0.7 y recuperación real | Actualización real | NO EJECUTADA | No hay instaladores nuevos ni feed de pruebas autorizado; no se utiliza producción |
| Keystone UI y verify-bundle | Compilación | APROBADA | Build 54,08 s; 106 chunks, cero huérfanos; avisos existentes de chunks/UnoCSS |
| Electron compile y DeskGap build | Compilación | BLOQUEADA | ENOMEM al importar tsx; no resultado productivo nuevo |
| DevTools | Integración / compilación asociada | BLOQUEADA | CLI falla al resolver home; plugin Vue se integra en build Electron, no task independiente de paquete encontrada |
| Instalador Windows | Instalación real / empaquetado | BLOQUEADA | Prerrequisito compilación Electron/DeskGap falla; cero instaladores nuevos generados o inspeccionados |
| Empaquetado Linux/macOS y actualización por plataforma | Instalación real | NO EJECUTADA | No se presupone compilación/ejecución cruzada completa desde Windows; usar runners nativos adecuados |
| Independencia XMCL, herramientas y protección de secretos | Automatizada | APROBADA | Suites existentes y nueva regresión de rechazo; no suscripciones XMCL necesarias para tests locales |
| Licencias y auditoría de vulnerabilidades externas completa | Inspección / auditoría | NO EJECUTADA | LICENSE y licencias por paquetes presentes y conservadas; no se afirma auditoría CVE completa ni certificación legal |

No hay app Electron/Ollama observada al inicio. Los puertos 3000, 9222 y 9300 rechazan conexión. Se intentaron dev:main y el CLI oficial conforme a la guía; fallan antes de crear una página. No se inicia una segunda app ni se terminan procesos ajenos. No se declara ningún flujo UI recorrido.

## Reproducción y cierre de pendientes

1. En un PowerShell normal de desarrollo, verificar `node -p "process.version"` y `node -e "console.log(require('os').userInfo())"`. Comparar con el usuario del sandbox; no modificar ACL ni cargar perfiles artificiales desde Codex.
2. Ejecutar `pnpm check`, `pnpm lint`, `pnpm exec vitest run`. En Windows, documentar por separado la suite Linux y el gateway privado. Investigar ENOTEMPTY bajo carga; conservar logs de fallos.
3. Ejecutar `pnpm build:renderer`, `pnpm --prefix=xmcl-electron-app compile`, `pnpm --prefix=deskgap-app build`; empaquetar Windows solo tras compile correcto. Inspeccionar versión/firma/contenido del instalador realmente generado.
4. Iniciar dev:renderer/dev:main con un perfil de prueba aislado según configuración existente, confirmar localhost:3000 vía CLI y validar setup, instancias, shaders/GIF, mods/exportador y chat a 1200x720/800x400. Tras compile de producción, reconstruir dev:main antes de relanzar.
5. Con proveedores accesibles, exportar instancias reales de versiones compatibles y arrancar servidores temporales con aceptación manual de EULA. Guardar logs de ready y validar un Create real con versiones exactas.
6. Con Ollama/modelo previamente instalado por consentimiento, validar conversación, streaming, cancelación y consultas con fuentes sin credenciales personales externas.
7. Preparar instaladores y feed de pruebas seguro para upgrade completo 1.0.6 → 1.0.7; conservar snapshot/hash de datos ficticios y probar fallo/recuperación. Siguen pendientes firma de confianza/publicadores e instaladores por SO señalados en Fase 12.

## Git y preservación

`git diff --check` pasa. Versión pública 1.0.7 intacta. master/backup no se modifican.

Intento real de `git add -- xmcl-runtime/app/pluginCommonProtocol.test.ts`: `fatal: Unable to create 'G:/Documentos/Compilar-Libs-Dev/PbtModLauncherX-Dev/.git/index.lock': Permission denied`. ACL observada de .git contiene ACE Deny de escritura para SID restringidos junto a permisos Allow; no se alteran. No se elimina ningún lock ni se prepara parcialmente el índice.

Commit pendiente; HEAD sigue en `010707b245682d30548b239584cf2ad7d399740f`. Tres archivos de fase: dos tests y este informe. Preservación en `temp/phase13-preservacion-20261010.zip`, `.manifest.json`, `.patch`: verificación SHA-256 contra originales, ZIP y parche completo incluidos archivos nuevos. Logs diagnósticos y scripts temporales permanecen en temp y no forman parte del commit.

Comando de una sola línea, desde la raíz en PowerShell fuera del sandbox:

```powershell
if ((git branch --show-current) -ne 'dev/upstream-v1.0.7') { throw 'Rama incorrecta' }; $phase13Files = (Get-Content 'temp/phase13-preservacion-20261010.manifest.json' -Raw | ConvertFrom-Json).files.path; git add -- $phase13Files; if ($LASTEXITCODE -eq 0) { git commit -m 'test(validation): audit v1.0.7 regressions and preserve updater user data' }
```

Se detiene la Fase 13 con implementación previa preservada, validaciones automatizadas documentadas y bloqueo crítico de entorno pendiente. No se inicia la Fase 14.
