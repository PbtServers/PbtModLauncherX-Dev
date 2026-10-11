# Fase 12 — Versionado y actualizador de PbtServers

Fecha: 2026-10-10. Rama exclusiva: `dev/upstream-v1.0.7`.
Versión configurada: **1.0.7**, preparada localmente, **sin publicar**.
HEAD inicial: `db1f57065c8daacea269535a6867fb18bc090231`; árbol inicialmente limpio.

## Conservación y auditoría

Se comprobaron la rama, el historial y la presencia de Fases 9, 10, 10.A, 10.B y 11 en los commits anteriores. Se consultaron los informes de integración, rebranding, traducciones, primer inicio, independencia, IA local, lore, exportación y reparaciones previas. No se reescriben esos informes históricos.

`VERSIONADO-REFERENCIAS-v1.0.7.json` inventaría **9.653 referencias** textuales del HEAD inicial a 1.0.6/1.0.7 y XMCL/xmcl/X Minecraft Launcher, con archivo y línea, sin copiar líneas de código ni secretos. Sus categorías automáticas son un inventario para revisión, no una afirmación de clasificación semántica perfecta. La revisión manual distingue el producto, paquetes técnicos, dependencias, Minecraft, protocolos, créditos e historia.

Cambios públicos: `package.json`, `xmcl-electron-app/package.json` y `xmcl-keystone-ui/package.json`: **1.0.6 → 1.0.7**. La plantilla `build/appxmanifest.xml`, anteriormente 0.14.0.0, queda en **1.0.7.0**. AppInstaller y artefactos de electron-builder se generan desde la versión del paquete Electron. DeskGap toma la versión pública del package.json raíz al empaquetar; su versión técnica **0.66.2** permanece. Runtime **0.66.0**, runtime API **0.51.0**, paquetes @xmcl, dependencias y lockfile permanecen iguales.

`latest_version.json` sigue describiendo **v1.0.6**, última publicación histórica del archivo. Cambiarlo a una release inexistente anunciaría falsamente una actualización. Sus metadatos antiguos de API/uploader de Voxelum no se usan para descargar: se acepta exclusivamente `browser_download_url` de assets del repositorio propio y del tag exacto. Se mantienen créditos, licencias, documentación y copias .bak/.old.

El build conserva productName/appId, identidades AppX, publisher configurado, protocolos `xmcl`, executableName, iconos y nombres de paquetes propios. Se actualiza el ejemplo de tag del workflow; no se ejecuta ni se cambia su destino de publicación.

## Orígenes reales y circuito de actualización

| Componente | Origen existente | Tratamiento |
|---|---|---|
| Electron, manifiesto propio | `https://raw.githubusercontent.com/PbtServers/PbtModLauncherX-Dev/master/latest_version.json` | HTTPS, límite de 2 MiB, JSON y esquema verificados, timeout de 30 s por petición |
| Electron, release propia | `https://api.github.com/repos/PbtServers/PbtModLauncherX-Dev/releases/latest` | Se consulta también para que el manifiesto raw obsoleto no oculte una release más reciente |
| Assets propios | `https://github.com/PbtServers/PbtModLauncherX-Dev/releases/download/v<versión>/<archivo>` | Repo/tag/nombre exactos, arquitectura, hash y tamaño según mecanismo |
| Electron AppImage | proveedor GitHub de electron-updater, owner PbtServers/repo PbtModLauncherX-Dev | Feed propio, AppImage exacto para versión/arquitectura, SHA-512; no otro proveedor |
| DeskGap | API GitHub del mismo repo, lista paginada de releases | Repo restringido al fork, no redirecciones del feed, timeout, semver/canal/EXE x64 |
| Instalación completa manual | `https://mods.pbtservers.com` | Enlace ya existente; no descarga ni ejecución automática |

No se inventan feeds, dominios ni claves. No se cambia ningún endpoint productivo. Las rutas de releases oficiales XMCL dejan de poder aceptarse incluso como configuración alternativa de DeskGap. Los recursos públicos open source de Voxelum ajenos al updater, créditos y dependencias técnicas se conservan.

Los canales mantienen la preferencia `allowPrerelease`. Una versión igual/anterior o un draft no constituye actualización. Se vuelve a comprobar el canal antes de descargar e instalar. El endpoint GitHub `/latest` no descubre todas las prereleases: no se incorpora un feed de desarrollo nuevo. El manifiesto propio puede describir una prerelease explícita, sujeta a la preferencia existente.

## Causas corregidas

- Comparar por diferencia de strings permitía ofrecer downgrades; ahora se utiliza semver estricto y `gt`.
- Un raw feed válido pero antiguo ocultaba releases nuevas. Se revisan ambos orígenes existentes y se selecciona la mayor versión permitida.
- La descarga incremental podía terminar sin comprobar SHA-256, aceptar mirrors arbitrarios y tragarse una cancelación. Se exige referencia válida, descarga completa, tamaño/hash correctos y publicación temporal atómica. Ya no se utiliza `PBT_ASAR_MIRROR` como ruta de ejecución automática sin una política de confianza.
- El instalador ASAR de Windows generaba un BAT que terminaba procesos por nombre y copiaba directamente sobre app.asar. Se elimina esa vía insegura: Windows y macOS requieren el paquete completo. No se generan comandos con rutas o argumentos del usuario.
- Cambiar solo app.asar podía conservar un Electron o binarios nativos incompatibles. La ruta incremental restante para Linux exige plataforma, arquitectura, versión exacta de Electron y huella SHA-256 del lockfile con saltos LF en `pbt_runtime`. Si falta esa prueba se ofrece el paquete completo.
- Un cliente 1.0.6 ya instalado no recibe retroactivamente estos controles. **Desde 1.0.7 el build no emite assets ASAR independientes**, para que su updater antiguo no aplique código de la nueva arquitectura sobre un runtime anterior. El app.asar interno del paquete completo se conserva. La política también bloquea versiones posteriores hasta establecer una migración segura de clientes antiguos.
- La configuración inicial del updater desactivaba descargas implícitas, pero `pluginAutoUpdate` podía reactivarlas. Ahora las preferencias se conservan y las descargas automáticas pasan por BaseService y por la aprobación/verificación del host. Un resultado manual nunca abre repetidamente la web en segundo plano.
- Abrir la web de descarga manual se marcaba como `ready`. Ahora permanece `pending`; no se ofrece instalación de un archivo inexistente.
- Se exige una aprobación inmutable de la sesión; modificar metadata compartida invalida la operación. Los reintentos se serializan antes de esperar ajustes.
- AppImage vuelve a verificar SHA-512 contra el feed tras descargar y antes de instalar. La instalación al salir utiliza un `before-quit` propio, con revisión de hash limitada a cinco segundos; ante fallo se permite cerrar sin instalar ni eliminar la aplicación funcional. No se utiliza el quit handler implícito sin este control.
- Se retiran listeners de progreso/cancelación al finalizar. Las cancelaciones y errores no dejan un recibo de descarga listo.
- BaseService propaga errores de instalación y conserva un estado listo para reintentar. La traza de éxito se cierra solo después de entregar la operación al host, como `handoff`; no registra una instalación completada antes de llamar al instalador.
- AppInstaller valida los componentes numéricos 0–65535 y escapa atributos XML del publisher.
- La UI muestra versión instalada/disponible, paquete completo cuando corresponde y errores localizados de consulta, descarga/verificación e instalación. Una versión igual/anterior no muestra el botón de instalar.

## Integridad, firma y recuperación

Las descargas ASAR autorizadas requieren SHA-256 desde el mismo asset HTTPS del fork, tamaño exacto y un temporal único `.partial`; solo se publica `pending_update` al verificar. Se rechazan HTTP fallidos, contenido truncado/excesivo, checksums inválidos, nombres duplicados, traversal, fuentes ajenas y redirects fuera de los CDN HTTPS de GitHub `release-assets.githubusercontent.com`/`objects.githubusercontent.com`. No se reenvían headers ni tokens a los redirects. Las URLs firmadas de esos CDN se utilizan como transporte, sin copiarlas a informes.

La sustitución ASAR Linux se prepara junto al archivo activo, comprueba de nuevo el hash y conserva una copia `.backup` del app.asar funcional. Si la publicación falla tras mover el original, lo restaura. No se borra automáticamente el respaldo tras actualizar. El backup permite recuperación manual; **no hay un mecanismo nuevo que garantice rollback automático si el siguiente proceso no llega a arrancar**. Esta ruta permanece sin assets públicos generados por el build actual.

AppImage mantiene la descarga/verificación de electron-updater y añade recibos de bytes, control de arquitectura/versiones y verificación explícita/al salir. Redirecciones, selección de canal y actualización del archivo AppImage dentro de ese proveedor se delegan a la biblioteca instalada; no se afirma haber ejecutado su instalador Linux real en Windows.

DeskGap ya verificaba tamaño, Authenticode, publisher y SHA-256 de los bytes pasados a su instalador nativo. Se conserva esa protección. Su lista de publishers preexistente exige SignPath Foundation: **no se inventa un certificado de PbtServers ni se acepta un EXE unsigned**. El workflow describe DeskGap como UNSIGNED PREVIEW para instalación manual; su actualización automática sigue bloqueada si no satisface la firma. Hace falta definir y verificar el publisher de producción antes de habilitarla.

SHA-256/SHA-512 desde HTTPS proporcionan integridad respecto al feed autorizado, **no equivalen a una firma independiente del manifiesto**. No se encontró una clave pública de confianza de PbtServers ni una configuración productiva de firma de manifest. La mejora futura requiere una clave de firma gestionada fuera del repositorio, clave pública distribuida por un canal ya confiable, firma del versionado/plataforma/arquitectura/tamaño/hash y política de rotación. Debe verificarse la compatibilidad con electron-updater 6.8.9 instalado; no se asumen capacidades de versiones más nuevas. No se generan claves ni certificados falsos.

Referencias oficiales consultadas: [electron-builder v26: actualización, targets e integridad](https://www.electron.build/v26/docs/features/auto-update/) y [Electron app: relaunch y rutas persistentes](https://www.electronjs.org/docs/latest/api/app/). También se inspeccionó el código local de electron-updater, incluido su quit handler; el nuevo host evita activarlo directamente.

## Datos y migraciones

**No se necesita ni se implementa una migración de formato en esta fase.** Se inspeccionaron el `root` persistido, `setting.json`/SettingSchema, rutas de LauncherApp, almacén de secretos Electron y AgentApiKeyStore, historial JSONL y cache/decisiones de clasificación. Se conservan:

- `LAUNCHER_NAME = pbtmodlauncherx`, appData, userData, `root` personalizado y directorio de juego.
- Instancias, mundos, mods, shaders, resource packs, capturas, iconos/GIF, Java/RAM y preferencias de idioma.
- Secretos y sus namespaces, cuentas oficiales y proveedores IA; no se reinicializa el almacén ni se reinstala Ollama ni modelos.
- Historial/ajustes de PbtAdmin, identidad, creadora femenina PbtinaDev, lore y herramientas.
- Exportación de servidores y `server-mod-classification/`, cuya clave sigue ligada a instancia/Minecraft/loader/build/hash, sin incluir la versión del launcher.

La migración de API keys previa y los mecanismos upstream existentes se conservan. Las pruebas utilizan datos ficticios y directorios temporales; no se tocaron instalaciones reales de la usuaria. La sustitución de bytes con rutas Unicode/espacios conserva un fichero de preferencias sintético. Esto **no equivale** a haber probado todo el proceso de actualización de un instalador 1.0.6 publicado.

## Compatibilidad por plataforma

| Plataforma | Configuración y política | Resultado real |
|---|---|---|
| Windows Electron x64/ia32 | ZIP; AppX/AppInstaller x64 según configuración actual, identidades/publisher preservados; actualización completa manual | Metadatos y lógica probados; compilación/instalación pendientes |
| Windows DeskGap x64 | Versión pública raíz 1.0.7; firma nativa exigida; preview unsigned solo manual | Tests con interfaz nativa simulada; no EXE firmado ni actualización real |
| Linux x64/arm64 | AppImage completo; deb/rpm/pacman/tar por paquetes completos/manuales. ASAR solo con prueba exacta y sin asset standalone en este build | Transporte sintético/archivos reales en tests; instalación/arranque Linux pendientes |
| macOS x64/arm64 | DMG completo manual; no ASAR que invalide la firma del bundle | Configuración examinada; firma/notarización/instalación pendientes |

No se cambian identificadores que provoquen un perfil nuevo o una instalación paralela. Las propiedades reales de ejecutables 1.0.7 no se pudieron inspeccionar porque no se generó un nuevo instalador.

## Validación

- **552 tests aprobados, 1 omitido, 0 fallidos, 52 archivos.** Incluyen policy/updater, metadatos de release, HTTP loopback real con bytes sintéticos, tamaño/hash/cancelación/interrupción, manipulación posterior, reintentos y exclusión mutua, canal, arquitectura, XML, respaldo, Unicode y preferencias, más regresiones de instancias/iconos/GIF, primer inicio, idiomas, PbtAdmin/proveedores/secretos/historial y exportación/clasificaciones.
- El servidor HTTP local sirve exclusivamente bytes ficticios y su checksum. Los hosts Electron/electron-updater y Authenticode DeskGap están simulados en los tests; **no se ejecutaron instaladores**.
- Las pruebas de estado BaseService sustituyen únicamente `atomically`, usado por persistencia Steam ajena al updater, para evitar su lookup de usuario al importar. No se modifica producción para ocultar ENOMEM. El transporte/archivos/hash del nuevo módulo sí se prueban realmente.
- Typechecks directos por paquetes API, runtime, Electron main/preload, Keystone UI y DeskGap: correctos. Lint API/runtime/Electron/UI: sin errores; dos avisos preexistentes en InstanceBlueprintsService.
- `pnpm check` y `pnpm lint` raíz se intentaron: el pnpm anidado del entorno falla con `EPERM: lstat C:\Users\PBTINA~1`. Las verificaciones equivalentes se ejecutaron directamente por paquetes con el pnpm accesible.
- Traducciones: UI es-ES/ca **2594/2594**, Electron 21/21, componentes 29/29, sin errores de sintaxis/interpolación ni claves faltantes. Se añaden seis claves por idioma en en/es-ES/ca. Otros idiomas permanecen; 54 diagnósticos preexistentes.
- Keystone UI: build y `verify-bundle` correctos, **106 chunks, cero huérfanos**; avisos de tamaño/UnoCSS/dependencias preexistentes, sin modificar reglas compartidas.
- Electron `compile`, DeskGap `build` y dev Electron: bloqueados al cargar herramientas por **`uv_os_get_passwd returned ENOMEM`**. Reproducido con `node -e "require('node:os').userInfo()"` fuera del launcher. No se atribuye al código de la aplicación.
- DevTools: no existe un build independiente del proyecto; el plugin proporciona la extensión al bundle Electron. El CLI oficial requerido por AGENTS.md también falla en `getRuntimeHome` por ENOMEM antes de conectar. **UI real, geometría, IPC y reinicio de una aplicación instalada no validados.**
- Los errores iniciales en fixtures/rutas de tests y la aridad de una llamada de test se corrigieron; no quedan como fallos del resultado final.

Comandos utilizados (pnpm invocado mediante el binario accesible; `--config.verify-deps-before-run=false` evita una reinstalación automática del workspace, sin alterar archivos de configuración):

```text
pnpm check
pnpm lint
pnpm --prefix=xmcl-runtime-api check / lint
pnpm --prefix=xmcl-runtime check / lint
pnpm --prefix=xmcl-electron-app check / lint / compile / dev
pnpm --prefix=xmcl-keystone-ui check / lint / build / validate:translations
pnpm --prefix=deskgap-app check / build
pnpm exec vitest run <selección de 52 archivos de updater y regresiones anteriores>
```

Logs: `temp/phase12-*.log`, `phase12-validation-codes.json` y `phase12-final-codes.json`. Se recogieron los códigos nativos mediante Python porque PowerShell puede representar el banner de pnpm enviado a stderr como NativeCommandError incluso con código nativo cero.

## Pendientes antes de distribuir

1. Compilar/empaquetar/firma en entornos Windows/Linux/macOS funcionales y comprobar versiones reales de ejecutables/instaladores.
2. Validar UI e IPC con el launcher de desarrollo real, según AGENTS.md, incluyendo errores, reintento y cancelación.
3. Ensayar **1.0.6 → 1.0.7 con paquete completo**, instaladores reales y feed de pruebas aprobado: datos/credenciales/preferencias/classificaciones, falta de espacio/permisos, fallo de reinicio y rollback. No hay aquí un feed de pruebas ni instaladores reales verificados.
4. Resolver identidad/firma productiva AppX/DeskGap y diseño de manifiesto firmado, sin cambiar el publisher de una instalación existente arbitrariamente.
5. No publicar ASAR standalone: verificar también que un directorio de distribución reutilizado no arrastre assets antiguos. Los outputs históricos locales no se borraron.
6. Probar AppImage y redirects/differential download reales de electron-updater; la capa de biblioteca se simula en Windows. No se afirma haber probado actualizaciones reales en ninguno de los tres sistemas.

## Git y preservación

Git devuelve literalmente `Unable to create 'G:/Documentos/Compilar-Libs-Dev/PbtModLauncherX-Dev/.git/index.lock': Permission denied`. No había index.lock al comprobarlo. No se eliminan locks, se alteran ACL o se desactiva el sandbox/antivirus. El fallo es consistente con el bloqueo de escritura de .git diagnosticado en fases anteriores; esta fase no reconfigura permisos.

**Commit pendiente**. HEAD permanece `db1f57065c8daacea269535a6867fb18bc090231`; master y backup conservan `c4b77e666f0b132e05e3ffff71d2728132a46a44`. Estado de la fase: **30 rutas, 19 modificadas y 11 nuevas**, listadas en el manifiesto.

Se conserva el estado completo mediante `temp/phase12-preservacion-20261010.zip`, `.manifest.json` y `.patch`. Cada entrada ZIP se compara con el original por bytes/tamaño/SHA-256; el manifiesto incluye los hashes del ZIP y del parche binario completo, **incluidos los archivos nuevos**. No se sobrescriben preservaciones de fases anteriores.

Comando de una línea para PowerShell fuera del sandbox, desde este repositorio:

```powershell
if ((git branch --show-current) -ne 'dev/upstream-v1.0.7') { throw 'Rama incorrecta' }; $phase12Files = (Get-Content 'temp/phase12-preservacion-20261010.manifest.json' -Raw | ConvertFrom-Json).files.path; git add -- $phase12Files; if ($LASTEXITCODE -eq 0) { git commit -m 'chore(release): prepare PbtModLauncherX v1.0.7 and secure PbtServers updater' }
```

No se hace push, ni tags, releases, publicaciones o modificaciones de master/backup. No se inician las Fases 13/14.
