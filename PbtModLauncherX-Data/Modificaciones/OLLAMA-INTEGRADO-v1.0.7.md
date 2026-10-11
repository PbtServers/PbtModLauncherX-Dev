# Fase 15.2 — Auditoría de Ollama integrado y ediciones portables

Fecha: 2026-10-10. Rama: dev/upstream-v1.0.7. Base confirmada: fd417abd. Versión conservada: 1.0.7. Árbol inicialmente limpio; Fase 15.1 confirmada. Este documento no anuncia soporte implementado ni una release.

**Estado: BLOQUEADO. El requisito obligatorio de incluir un motor local en todas las ediciones todavía NO se cumple.** No se han añadido binarios ficticios, instaladores globales, servicios, cambios de PATH/registro/ACL ni descargas de modelos. No se considera terminada la implementación de esta fase.

## Hallazgos del código actual

- xmcl-runtime/agent/ollama.ts busca ollama.exe/ollama en PATH y ubicaciones globales habituales. No busca recursos integrados del paquete. ORIGIN está fijado a http://127.0.0.1:11434.
- xmcl-runtime/agent/ollamaChat.ts también llama directamente al puerto 11434. La detección, descarga, resolución de modelos y chat deberán compartir el origen resuelto por un mismo gestor de motor.
- AgentService ya admite Ollama sin API key y LocalAiSetup permite seleccionar modelos y autorizar una descarga. Esto no inicia ni incluye un motor y no constituye una integración portable.
- No hay gestor de procesos Ollama propios, elección de puerto dinámico, configuración portable del almacén de modelos ni consentimiento específico para reutilizar un servicio externo.
- electron-builder.config.ts incluye documentación/conocimiento en extraResources, pero ningún ejecutable o biblioteca de Ollama.
- DeskGap package.ts prepara su runtime y aplicación sin Ollama. No se ha verificado un paquete DeskGap con motor integrado.

## Plataformas y ediciones declaradas

| Edición/configuración actual | Auditoría | Motor integrado | Paquete ejecutado |
| --- | --- | --- | --- |
| Windows zip x64 | Configuración presente | NO | NO EJECUTADO |
| Windows zip ia32 | Configuración presente; runtime oficial ia32 compatible no verificado | BLOQUEADO | NO EJECUTADO |
| Windows AppX | Configuración presente; falta analizar límites de proceso/datos del paquete | NO | NO EJECUTADO |
| Linux AppImage x64/arm64 | Configuración presente | NO | NO EJECUTADO |
| Linux tar.xz x64/arm64 | Configuración presente | NO | NO EJECUTADO |
| Linux deb/rpm/pacman x64/arm64 | Configuración presente | NO | NO EJECUTADO |
| macOS dmg x64/arm64 | Configuración presente; DMG no demuestra portabilidad de los datos del .app | NO | NO EJECUTADO |
| DeskGap | Script de empaquetado presente | NO | NO EJECUTADO |

No se declara soporte completo de ninguna edición autocontenida. La licencia permite integración del código de Ollama, pero no demuestra compatibilidad de cada arquitectura ni sustituye la revisión de bibliotecas GPU y licencias de modelos.

## Procedencia, licencias y requisitos

Fuentes oficiales consultadas:

- [Distribución Windows y CLI independiente](https://github.com/ollama/ollama/blob/main/docs/windows.mdx): archivo ollama-windows-amd64.zip con CLI y bibliotecas; admite embedding en aplicaciones. No es necesario usar OllamaSetup.exe para un paquete integrado. La documentación actual indica Windows 10 22H2 o posterior y requisitos específicos de drivers; deberán fijarse a la versión del runtime escogida.
- [Instalación manual Linux](https://github.com/ollama/ollama/blob/main/docs/linux.mdx): binarios y bibliotecas de la distribución deben conservarse juntos. No se debe ejecutar el instalador global ni crear un servicio root como requisito del portable.
- [Releases oficiales](https://github.com/ollama/ollama/releases) y [API de releases](https://api.github.com/repos/ollama/ollama/releases/latest): deben seleccionarse versión exacta, archivo y arquitectura, y registrar tamaño/digest antes de incorporarlos. No se fija aquí una versión o SHA inventados.
- [Licencia MIT de Ollama](https://github.com/ollama/ollama/blob/main/LICENSE): conservar copyright/licencia. Revisar por separado licencias de bibliotecas incluidas y modelos.

No se ha descargado un runtime: **tamaño real del paquete integrado pendiente**. La documentación Windows indica al menos 4 GB para la instalación binaria; no se utiliza esa cifra como tamaño exacto de una release portable. Los modelos existentes siguen mostrando estimaciones y consentimiento en el asistente; todavía falta integrar espacio libre real, ubicación configurable y prevención de duplicados entre almacenes para esta fase.

## Bloqueos reproducidos

1. `node -e "fetch('https://api.github.com/repos/ollama/ollama/releases/latest').then(r=>console.log(r.status)).catch(e=>console.error(e.cause?.code,e.message))"` devuelve EACCES/fetch failed desde este entorno. La navegación documental funciona, pero no entrega binarios verificados dentro del workspace.
2. No se encuentran archivos Ollama locales mediante el inventario del repositorio. No existe un manifiesto de procedencia/hashes de motor integrado.
3. `node -e "require('os').userInfo()"` vuelve a fallar con uv_os_get_passwd returned ENOMEM fuera del launcher. Sigue siendo una limitación de entorno; no se modifica código correcto para ocultarla.
4. No hay entornos Linux/macOS nativos disponibles para generar y arrancar sus distribuciones ni infraestructura de firma/notarización validada en esta sesión.

No se desactiva sandbox/Gatekeeper/antivirus ni se cambian permisos. No se transforma un fixture en un supuesto motor real.

## Diseño pendiente obligatorio antes de distribuir

Esta sección es un diseño, **no código implementado**:

1. Staging por plataforma/arquitectura con manifiesto de versión exacta, procedencia oficial, hashes de todos los archivos, licencias y dependencias. El empaquetado debe rechazar la ausencia de ese staging o una arquitectura no compatible, antes de producir un portable que prometa IA integrada.
2. Resolver recursos por edición: recursos empaquetados para Electron, recursos propios DeskGap. Prioridad motor integrado; después ejecutable externo configurado explícitamente; finalmente servicio local existente autorizado. No usar el PATH global como sustituto silencioso del motor faltante.
3. Gestor singleton del proceso hijo con spawn sin shell y argumentos fijos `serve`. Directorio de trabajo propio; OLLAMA_HOST limitado a 127.0.0.1, OLLAMA_MODELS y demás variables solo del hijo. Nunca aceptar comandos arbitrarios del modelo.
4. Puerto libre reservado y conexión de salud con deadline; resolver carreras de bind sin conectarse a un servicio ajeno accidentalmente. Compartir origen entre tags/show/pull/chat. No asumir 11434 libre, ni detener procesos ajenos por nombre/puerto.
5. Exclusión y coordinación por almacén/edición para múltiples instancias, cierre de solo el proceso propio, supervisión de descendientes y protección contra huérfanos. Verificar específicamente Windows y Linux/macOS, no inferirlo de mocks.
6. Modelos y configuración portable fuera de directorios temporales y montajes AppImage. Resolver rutas relativas respecto a la ubicación real del portable; no respecto a su extracción temporal. En Windows los zip y los portables autoextraíbles tienen mecanismos distintos y deben probarse por separado.
7. Ubicación alternativa explícita y validada cuando el medio sea de solo lectura. Conservar los modelos/configuración/historial al actualizar o mover el paquete. Compartir almacén externo solo con autorización; no borrar modelos en uninstall/update.
8. Mostrar tamaño estimado y espacio disponible antes de descarga, con consentimiento; reutilizar almacén elegido sin copiar gigabytes automáticamente. Mantener configuración por edición y evitar escrituras de claves/modelos en el paquete firmado o su imagen montada.
9. macOS: conservar firmas de dependencias, firmar el bundle completo correctamente y notarizar cuando corresponda. No desactivar Gatekeeper ni considerar un DMG generado como aplicación ejecutada o validada.

## Matriz de pruebas actual

| Comprobación | Estado |
| --- | --- |
| Rama, commit anterior y árbol limpio al inicio | APROBADO |
| Auditoría de endpoints, detección y scripts de empaquetado | APROBADO como inspección, no ejecución |
| Acceso de Node a procedencia oficial para adquirir runtime | BLOQUEADO por EACCES |
| userInfo independiente del proyecto | FALLIDO por ENOMEM ambiental |
| Instalable/portable sin Ollama previo | NO EJECUTADO |
| Unidad externa, movimiento, Unicode y permisos sin administrador | NO EJECUTADO |
| Directorio alternativo de modelos, descarga/persistencia, reinicio | NO EJECUTADO |
| Motor externo autorizado y puerto ocupado | NO EJECUTADO |
| Gestión de procesos propios/huérfanos/concurrencia | NO EJECUTADO |
| Medio de solo lectura, Linux/macOS nativos | NO EJECUTADO |
| Chat real offline con modelo instalado | NO EJECUTADO |
| Tests de integración portable específicos | NO EJECUTADO; no hay implementación que puedan validar |

Los tests aprobados de la Fase 15.1 no prueban motores integrados y no se reutiliza su cifra como validación de este requisito. No se generan ni publican instaladores en esta fase.

## Continuación necesaria

En un entorno que permita adquirir archivos oficiales, seleccionar una release exacta, revisar los activos y licencias y preparar staging verificado sin instalar globalmente. Después implementar el gestor y la configuración con los requisitos anteriores y ejecutar sus pruebas de regresión y los paquetes reales. La ausencia de motor no debe comunicarse como «instala Ollama globalmente» en un producto anunciado como autocontenido. Hasta completar estos pasos, el requisito portable permanece bloqueado y no se debe anunciar cumplimiento.

## Git

Únicamente se añade este informe; no se cambian funcionalidades, endpoints, master, backup ni versión. Si .git continúa denegando index.lock, se conserva el informe en ZIP verificado, manifiesto SHA-256 y parche en temp/phase152-preservacion-20261010.*. No hay push, tags, releases ni merge a master.
# Fase 15.3 — implementación productiva y estado de validación

Esta sección registra la implementación posterior a la auditoría de la Fase 15.2; el contenido histórico anterior se conserva. Rama `dev/upstream-v1.0.7`, base `53e6593dfea4ce6971cad0837ad087d1712eab59`, producto 1.0.7 en desarrollo, sin publicación.

**Estado de cierre: integración implementada, distribución real BLOQUEADA.** No se ha obtenido ningún binario oficial, generado un paquete con Ollama ni ejecutado inferencia real. Las pruebas con procesos Node no certifican una edición portable. No se declara terminada la integración portable.

## Arquitectura implementada

- `xmcl-runtime/agent/runtimeBundle.ts`: manifiesto por versión/plataforma/arquitectura; verifica SHA-256 de cada archivo, recursos no declarados, licencia MIT, rutas, symlinks y cabecera PE/ELF/Mach-O. El ejecutable permanece fuera de ASAR.
- `managedOllama.ts`: configuración local, almacenamiento de modelos, espacio disponible, exclusión mutua del almacén, arranque bajo demanda, puerto aleatorio loopback, readiness acotado a 20 segundos, cancelación y cierre de procesos propios.
- `ollamaSupervisor.ts`: programa fijo del launcher, sin shell ni instrucciones del modelo. La pérdida del pipe del padre dispara limpieza del árbol propio: taskkill por PID en Windows y grupo privado en Unix. No busca ni termina procesos Ollama ajenos por nombre.
- `ollamaPortOwner.ts`: atribuye el listener al PID del motor antes de aceptar readiness, utilizando netstat, /proc o lsof según el sistema. Esto evita aceptar accidentalmente otro servicio que ocupe el puerto tras la reserva.
- `AgentService`, `OllamaController` y puente de streaming: utilizan el origen dinámico del motor integrado para descubrir modelos, inspeccionar capacidades, descargar con consentimiento y conversar. No requieren API key. El motor no bloquea el inicio normal de Minecraft.
- `LocalAiSetup.vue`: estado del runtime, carpeta de modelos, espacio libre y asistente de modelo con RAM requerida, consentimiento, progreso y cancelación. Las API externas, personalidad, lore, herramientas, permisos e historial existentes se conservan.

Las variables OLLAMA_HOST, OLLAMA_MODELS, OLLAMA_ORIGINS, OLLAMA_NO_CLOUD, OLLAMA_NOPRUNE, HOME y directorios temporales se configuran únicamente en el proceso hijo. No hay instalación global, servicio permanente, edición de PATH, registro ni elevación.

## Confianza y preparación de binarios

El preparador `scripts/prepare-ollama.mjs` utiliza el tag oficial exacto y su API de GitHub. Exige `asset.digest` SHA-256 y tamaño de referencia publicados por esa API, valida el archivo antes de extraerlo y genera hashes individuales solo después de validar el archivo oficial. Si falta el digest de referencia, bloquea la preparación. No acepta como prueba de procedencia el hash calculado exclusivamente sobre un archivo recibido.

Fuentes oficiales consultadas:

- [Release v0.34.0](https://github.com/ollama/ollama/releases/tag/v0.34.0).
- [API de referencia del tag](https://api.github.com/repos/ollama/ollama/releases/tags/v0.34.0).
- [Distribución Windows](https://github.com/ollama/ollama/blob/main/docs/windows.mdx).
- [Distribución Linux](https://github.com/ollama/ollama/blob/main/docs/linux.mdx).
- [Licencia MIT](https://github.com/ollama/ollama/blob/main/LICENSE).
- [Variables y orígenes](https://github.com/ollama/ollama/blob/main/envconfig/config.go).

La preparación incorpora LICENSE del tag y metadatos oficiales. Los hashes concretos y el tamaño quedan registrados en el `bundle.json` generado al obtener la referencia oficial. **No existe todavía un bundle.json oficial preparado en este entorno ni se inventa un SHA Windows.** Una copia JSON proporcionada mediante `--metadata` es una entrada de confianza explícita: debe descargarse del endpoint oficial, no fabricarse a partir del ZIP. El manifiesto local presupone recursos de distribución confiables; no constituye una firma independiente frente a quien pueda modificar simultáneamente binarios y manifiesto de un paquete sin firmar.

En PowerShell normal, desde la raíz, con Node >=22.16.0:

```powershell
node --experimental-strip-types scripts/prepare-ollama.mjs --version v0.34.0 --platform win32 --arch x64
if ($LASTEXITCODE -ne 0) { throw 'No se ha preparado un runtime verificado' }
```

Produce `xmcl-electron-app/build/ollama/win-x64/`, ignorado por Git. No sobrescribe un staging existente. Para una copia oficial descargada previamente:

```powershell
Invoke-WebRequest 'https://api.github.com/repos/ollama/ollama/releases/tags/v0.34.0' -OutFile 'temp/ollama-release-v0.34.0.json'
node --experimental-strip-types scripts/prepare-ollama.mjs --version v0.34.0 --platform win32 --arch x64 --archive 'G:\Descargas\ollama-windows-amd64.zip' --metadata 'temp/ollama-release-v0.34.0.json'
```

La segunda modalidad todavía consulta la licencia oficial; no es un preparador completamente offline. Preparar el staging completo fuera del sandbox es la alternativa reproducible. Windows utiliza `extract-ollama.ps1` con comprobaciones de rutas ZIP; Linux/macOS requieren tar compatible con el formato oficial. Las URLs y redirecciones HTTPS están restringidas a GitHub y sus hosts oficiales de descarga.

## Ediciones instalables y portables

Electron `extraResources` copia el staging a `resources/ollama` (en macOS, Contents/Resources/ollama). `beforePack` valida el staging para la arquitectura objetivo y falla si falta o está alterado. Windows x64 es el destino prioritario; ia32 se ha retirado del target ZIP de esta distribución y no está soportado por el motor integrado.

Para una edición portable se establece `PBT_DISTRIBUTION_MODE=portable` durante el empaquetado. El marcador `pbt-portable.json` activa:

```text
PbtModLauncherX/
  PbtModLauncherX.exe
  pbt-portable.json
  resources/ollama/        # ejecutable, librerías, LICENSE, bundle.json
  data/<launcher>/ai/     # configuración del motor, modelos, home y tmp privados
```

El resto del perfil del launcher, incluidas preferencias e historial existentes, se redirige al directorio de datos portable antes de inicializar servicios. El nombre persistente interno del launcher se conserva. Las rutas de modelos dentro de la carpeta portable se guardan relativas; no se copian ni eliminan modelos al cambiar la ruta. Para datos externos o medios de solo lectura se admite `PBT_PORTABLE_DATA` solo para ese proceso. Si no puede escribirse, el inicio falla conservando datos; **la selección gráfica de una carpeta alternativa antes de arrancar aún queda pendiente**.

En instalables sin marcador se conservan los directorios existentes. Modelos y configuración quedan fuera de recursos reemplazables. No se modifica ningún procedimiento para borrar modelos durante desinstalación/actualización. La preservación en una actualización real sigue pendiente.

Preparación de prueba Windows, fuera del sandbox y sin publicar:

```powershell
pnpm install --frozen-lockfile
pnpm build:renderer
if ($LASTEXITCODE -ne 0) { throw 'Falló renderer' }
$env:PBT_DISTRIBUTION_MODE = 'portable'
Remove-Item Env:BUILD_TARGET -ErrorAction SilentlyContinue
Remove-Item Env:RELEASE -ErrorAction SilentlyContinue
pnpm build
if ($LASTEXITCODE -ne 0) { throw 'Falló empaquetado' }
```

El build por defecto genera directorio desempaquetado de prueba, no equivale a un instalador validado. Ejecutar únicamente ese directorio temporal; no reemplazar la instalación personal. Comprobar marcador, recursos y manifiesto antes de mover la carpeta y probar persistencia. Estas variables son del PowerShell actual, no del sistema. No utilizar build:all para esta prueba ni activar RELEASE.

DeskGap incorpora el mismo runtime validado y marcador opcional en su empaquetado Windows x64. Sigue requiriendo sus entradas oficiales de runtime/bootstrap existentes; no se ha generado un paquete DeskGap.

Linux x64/arm64 tienen receta de archivo oficial y resolución de datos fuera del montaje AppImage. macOS x64/arm64 tienen receta de archivo oficial, inspección Mach-O y verificación codesign durante preparación. El empaquetado evita volver a firmar los recursos Ollama para no invalidar sus hashes; **firma del contenedor, notarización, librerías, GPU y ejecución nativa no verificadas**. No se desactiva Gatekeeper. No se declara soporte real completo de estas plataformas ni Windows ARM64.

## Modelos, consentimiento y servicio externo

qwen3:4b y qwen3:8b son opciones del asistente existente, condicionadas por RAM y espacio disponibles; tamaño estimado y requisitos se muestran antes de autorizar. La capacidad de herramientas se consulta mediante `/api/show`, no se deduce del nombre. Los modelos sin herramientas pueden usar chat de texto sin registrar herramientas falsas. No se ha descargado ni comprobado realmente ninguno durante esta fase.

El origen integrado tiene prioridad. Solo si falta el bundle se permite un servicio externo previamente autorizado y guardado, con URL literal `http://127.0.0.1:<puerto>`. No hay fallback silencioso al puerto 11434, al PATH ni a proveedores de pago. Ese servicio no es propiedad del launcher y no se detiene. La selección de un ejecutable externo arbitrario no está implementada.

## Seguridad y límites operativos

- Puerto exclusivamente 127.0.0.1; argumentos fijos, shell desactivado, lista reducida de variables heredadas y sin logs de prompts/tokens.
- OLLAMA_ORIGINS no elimina los orígenes localhost y protocolos locales que Ollama añade internamente. No es autenticación frente a otras aplicaciones del mismo equipo; páginas remotas arbitrarias no están autorizadas por la configuración normal de CORS. Auditar la implementación efectiva del runtime preparado antes de distribución.
- El lock de modelos evita motores duplicados y no se borra un lock ajeno. Un corte eléctrico puede dejar un lock obsoleto: requiere comprobación manual del PID antes de recuperación. No se presume recuperación automática segura.
- La limpieza del árbol propio está implementada y comprobada con un proceso Node, no con Ollama/GPU. Muerte forzada, descendientes nativos, firma/quarentena y permisos de medios externos necesitan pruebas reales.
- Un fallo de limpieza se comunica; no se considera cierre verificado ni se mata un servicio externo para resolverlo.

## Evidencias de validación

| Comprobación | Estado | Evidencia |
|---|---|---|
| Regresiones de agentes, streaming, modelos, permisos, rutas, exportación, clasificación y empaquetado | APROBADO | 359 aprobados, 0 fallidos, 1 omitido; `temp/phase153-final.json` |
| Supervisor: argumentos fijos, PID propio y fallo de limpieza | APROBADO | 2 tests con adaptadores simulados; `temp/phase153-supervisor-tests.log` |
| Typecheck de runtime/API/Electron/UI | APROBADO | `pnpm check`, logs phase153-check-* |
| Lint | APROBADO | 0 errores, 2 advertencias preexistentes; `temp/phase153-lint-last.log` |
| Traducciones es-ES/ca/en | APROBADO | validador sin errores; `temp/phase153-i18n.log` |
| Keystone UI | APROBADO | build y verify-bundle; `temp/phase153-ui-build.log` |
| Propiedad real de un listener Windows | APROBADO | proceso Node PID24632, puerto50377, owned=true; `temp/phase153-native-port.log` |
| Preparación del runtime oficial v0.34.0 Windows x64 | BLOQUEADO | EACCES fetch failed; `temp/phase153-official-probe.log` |
| Electron compile / DeskGap build | BLOQUEADO | uv_os_get_passwd ENOMEM en tsx con Node22.22.3; logs phase153-*-build |
| DevTools y GUI real | BLOQUEADO | sin launcher de desarrollo en 3000/9222/9300; no existe tarea build:devtools |
| Cierre nativo del árbol Windows en sandbox | BLOQUEADO | taskkill devuelve Acceso denegado para un hijo propio; el gestor informa cleanup_unconfirmed y retiene el lock |
| Runtime nativo, modelos e inferencia real | NO EJECUTADO | ningún binario/modelo obtenido |
| Instalador o portable con Ollama incluido | BLOQUEADO | sin runtime y compilación main bloqueada |
| Linux/macOS nativos y actualización real | NO EJECUTADO | requiere entornos/artefactos reales |

Total automatizado final sin solapamiento: **361 aprobados, 0 fallidos, 1 omitido**. No es la batería completa del repositorio. Los tests de procesos utilizan una API simulada servida por Node y un supervisor de prueba sin descendientes; los de cabeceras emplean bytes sintéticos, no ejecutables oficiales.

Al exigir comprobación del resultado de taskkill se reprodujeron 3 fallos en la ejecución nativa preliminar (`temp/phase153-lifecycle-final.log`): la restricción del sandbox impide terminar árboles mediante taskkill. El supervisor productivo hace un intento de cerrar únicamente su motor y comunica fallo, sin afirmar eliminación de descendientes ni desbloquear el almacén. Las regresiones finales de lógica se aislaron con un supervisor de prueba explícito; **no sustituyen esa validación nativa bloqueada**. Las pruebas del programa supervisor comprueban que no disimula el error. Se debe repetir el cierre nativo con runtime oficial fuera del sandbox antes de distribuir.

## Comprobación real pendiente obligatoria

Preparar staging oficial, generar edición Windows x64, arrancar con perfil temporal sin Ollama global, verificar PID y origen propios, autorizar descarga o reutilización explícita de un modelo, conversar/stream/cancelar, cerrar y comprobar ausencia de procesos propios, mover carpeta Unicode entre unidades y repetir con modelos conservados. Comprobar puerto11434 ocupado por servicio ajeno sin tocarlo. Verificar instalable, actualización y almacén de solo lectura por separado. No usar perfiles Minecraft ni claves personales para esta prueba.

## Git y preservación de esta fase

Cambios limitados al motor, puentes existentes, asistente localizado, rutas portables, empaquetado y sus regresiones. Informes anteriores y funcionalidades de exportación/PbtAdmin se conservan. Git add ha fallado con código 128: `fatal: Unable to create .../.git/index.lock: Permission denied`; no existía index.lock previo. Se generan `temp/phase153-preservacion-20261010.zip`, `.manifest.json` y `.patch` con todos los archivos afectados y verificación SHA-256. El SHA base sigue siendo el de arriba hasta confirmar el commit local. No se publica ni se fusiona ninguna rama.

---

## Fase 15.4 — staging oficial disponible; empaquetado pendiente

La usuaria confirmó la Fase 15.3 en `5837f99b2fa43e7bdd836c3e41f82cc3c8129681`. Al reanudar, la rama era `dev/upstream-v1.0.7` y el árbol estaba limpio. La preparación ejecutada por ella en PowerShell normal terminó con código 0 para Ollama v0.34.0 Windows x64.

Origen: `https://github.com/ollama/ollama/releases/download/v0.34.0/ollama-windows-amd64.zip`. SHA-256 de referencia del archivo oficial: `a7dd1b174f39d3d1b8a25d4cbc86045d0e190b17187bfdcbe2f2ee3b5a11470e`. Metadatos de referencia: `https://api.github.com/repos/ollama/ollama/releases/tags/v0.34.0`.

Se ha ejecutado de nuevo `validateOllamaBundle` desde Codex contra `xmcl-electron-app/build/ollama/win-x64`: código 0, 84 archivos verificados, licencia y cabecera PE x64 correctas. Evidencia: `temp/phase154-staging-validation.log`. Esto valida el staging; no demuestra ejecución nativa ni inclusión en una distribución.

El intento de `pnpm build` con `PBT_DISTRIBUTION_MODE=portable` ha fallado con código 1 por `uv_os_get_passwd returned ENOMEM`, antes de generar un portable. Evidencia: `temp/phase154-portable-build.log`. La llamada aislada `node -e` a `os.userInfo()` también reproduce el fallo, fuera del código del launcher. No se ha alterado el proyecto para ocultarlo.

Pendiente de acción externa: ejecutar build de renderer y empaquetado Windows x64 en PowerShell normal, devolver logs y listado de artefactos. Después se inspeccionará el runtime realmente empaquetado y se validarán arranque, modelo autorizado, conversación, cierre y traslado. No se ha descargado un modelo ni se ha certificado una conversación o un instalador. Taskkill es un bloqueo separado que aún requiere comprobación real; Linux/macOS nativos continúan pendientes. No se han vuelto a ejecutar tests/typecheck/lint en este punto: se espera el artefacto de empaquetado para continuar la validación, sin presentar resultados de Fase 15.3 como nuevos.

### Continuación: portable desempaquetado generado y motor real iniciado

La usuaria ejecutó build de renderer y `pnpm build` fuera del sandbox: ambos terminaron correctamente; el empaquetado x64 generó `xmcl-electron-app/build/output/win-unpacked` a las 23:12:52 según su salida. Los ZIP/AppX y la carpeta ia32 listados con horas anteriores no pertenecen a esta prueba ni se consideran distribución IA integrada válida.

Comprobaciones ejecutadas desde Codex sobre el artefacto nuevo:

- Marcador `win-unpacked/pbt-portable.json` presente y `resources/ollama/bundle.json` presente.
- `validateOllamaBundle` contra los recursos empaquetados: código 0, 84 archivos, v0.34.0 Windows x64. Los pasos de firma mostrados en el log no han alterado los hashes verificados. Evidencia: `temp/phase154-packaged-validation.log`.
- Ejecutable empaquetado `ollama.exe --version`: código 0, cliente 0.34.0. Aviso de ausencia de servicio ya iniciado; no demuestra conversación. Evidencia: `temp/phase154-native-version.log`.
- Gestor productivo compilado a un adaptador temporal con esbuild, sin cambiar configuración ni reemplazar funciones: inició **Ollama oficial real** con datos aislados en `temp/phase154-native-7428`. Readiness y atribución de puerto correctos; `/api/tags` respondió HTTP200 en `http://127.0.0.1:62708`, `models: []`. No hubo descargas de modelos ni inferencia. Evidencia: `temp/phase154-native-manager.log`.
- Cierre: `ollama_cleanup_unconfirmed` por la restricción nativa de taskkill ya reproducida. El gestor no declaró cierre de árbol correcto; retuvo su lock. Tras el intento de cierre, una petición al puerto devolvió ECONNREFUSED. Esto confirma ausencia de listener en ese puerto, no ausencia comprobada de todos los descendientes. No se modifican ACL ni se borra el lock.
- Regresiones específicas nuevas: **42 aprobadas, 0 fallidas, 0 omitidas**, `temp/phase154-tests.json`. Lint código0, `temp/phase154-lint.log`; typecheck completo código0, `temp/phase154-check.log`. Las pruebas automatizadas de procesos siguen siendo simuladas y no sustituyen la evidencia nativa indicada arriba.

El empaquetado real funciona fuera del sandbox; dentro sigue fallando ENOMEM en os.userInfo/tsx. El arranque del motor real sí funciona dentro, mientras que el cierre de árbol es un bloqueo distinto. Falta repetir el diagnóstico nativo en PowerShell normal, iniciar la interfaz portable con perfil aislado, autorizar un modelo, comprobar respuesta real de PbtAdmin, cierre completo y traslado de carpeta. Linux/macOS, instalador real y chat continúan sin validación. No se declara concluida la Fase 15.4 ni se publica nada.

### Modelo de fábrica solicitado y preservación urgente

La usuaria ha autorizado incorporar Qwen3 1.7B cuantizado de fábrica. Se ha implementado `qwen3:1.7b-q4_K_M`, variante oficial de aproximadamente 1,4 GB y licencia Apache 2.0: https://ollama.com/library/qwen3%3A1.7b-q4_K_M y https://huggingface.co/Qwen/Qwen3-1.7B. **No se ha descargado ningún modelo ni obtenido una respuesta auténtica.** La preparación se pospone por petición urgente de preservar el trabajo.

Código nuevo: `xmcl-runtime/agent/modelBundle.ts` verifica manifiesto oficial, hashes SHA-256 de blobs, licencia, cabecera GGUF, familia y cuantización; rechaza rutas/symlinks y recursos no declarados. Instala la semilla offline bajo el lock del gestor, conserva tags/modelos existentes y reutiliza blobs idénticos. Publica el manifiesto después de copiar los blobs. La copia utiliza archivos temporales y hardlinks para publicación exclusiva: **falta comprobar o adaptar volúmenes sin soporte de hardlinks (por ejemplo exFAT)**; no se declara portabilidad completa en esos medios.

`scripts/prepare-ollama-model.mjs` obtiene primero la referencia desde el registro oficial por HTTPS, descarga mediante el runtime integrado con datos aislados, verifica los blobs contra esa referencia y prepara `xmcl-electron-app/build/ollama/ollama-model`. No utiliza modelos personales ni Ollama global. Electron y DeskGap incluyen este recurso y bloquean el empaquetado si falta o no pasa la validación. Los cambios nuevos requieren volver a empaquetar: el portable generado anteriormente todavía no incluye la semilla.

AgentService selecciona la semilla solo si no hay modelo local configurado y sus metadatos reales permiten chat; conserva proveedores externos y selecciones anteriores. Se añade la variante ligera al catálogo. `scripts/validate-bundled-ollama.mjs` permite comprobar inferencia auténtica y streaming con el prompt productivo de PbtAdmin y el puente real, usando exclusivamente datos temporales, sin descargar modelos ni ejecutar comandos del modelo. La semántica de la respuesta y el femenino de PbtinaDev requieren revisar la salida auténtica; no están certificados por tests simulados.

Se ha recuperado `temp/phase154-motor-externo.log`: HTTP200, modelos vacíos, origen127.0.0.1:62731 y `Managed cleanup confirmed`, datos en `temp/phase154-native-13356`. Este número corresponde al diagnóstico Node, no al PID de la interfaz. Perfil portable de prueba localizado: `win-unpacked/data-phase154-a49d691618774018b2e8de2a32effae5`. No se ha encontrado un PID de interfaz registrado y no se inventa.

Verificaciones: regresiones automatizadas de agentes, rutas, preparación, empaquetado y modelo; resultados en `temp/phase154-factory-regressions.json`. Lint código0, `temp/phase154-factory-lint.log`; typecheck en `temp/phase154-factory-check.log`. Syntax check de ambos scripts y bundling de prompt/puente correctos. Las pruebas de semilla usan bytes sintéticos, no pesos reales. No se ejecutan más pruebas largas tras la petición urgente.

Continuación exacta: revisar soporte de publicación en exFAT; ejecutar `node scripts/prepare-ollama-model.mjs` en PowerShell normal; comprobar pesos/licencia/configuración reales (la validación debe detenerse si el formato oficial difiere); reconstruir renderer y portable con PBT_DISTRIBUTION_MODE=portable; verificar recursos empaquetados; ejecutar `node scripts/validate-bundled-ollama.mjs`; revisar respuesta, streaming y cierre; comprobar PbtAdmin visualmente con perfil temporal y traslado de carpeta. Instaladores, Linux/macOS y conservación en actualización real siguen pendientes.

Base Git: `5837f99b2fa43e7bdd836c3e41f82cc3c8129681`, rama dev/upstream-v1.0.7, versión1.0.7 sin publicar. Se preservan todos los cambios fuente pendientes, incluidos archivos nuevos, en `temp/phase154-preservacion-20261010.zip`, `.manifest.json` y `.patch`; se excluyen recursos binarios, modelos y temporales ignorados por Git. No hay push, merge, tags ni release.
### Continuación de Fase 15.5: portabilidad y bloqueo de preparación

Estado comprobado: rama `dev/upstream-v1.0.7`, HEAD `5837f99b2fa43e7bdd836c3e41f82cc3c8129681`. Los 13 archivos pendientes de la sesión anterior coincidían con su manifiesto SHA-256 antes de editar; no estaban confirmados. Se conservan sus implementaciones.

La publicación de la semilla incorpora copia convencional exclusiva cuando el sistema de archivos no admite hardlinks. Verifica SHA-256, sincroniza la copia y no sobrescribe archivos existentes. Los blobs se publican antes que el manifiesto. La alternativa no garantiza atomicidad ante un apagón: una copia interrumpida se rechaza por integridad, sin declarar el modelo válido. En Linux se comprueba el límite FAT de 4 GiB; en otros sistemas se comunica EFBIG. No se han probado unidades exFAT/FAT32 reales; para archivos o ZIP superiores a 4 GiB, FAT32 no es adecuado.

Regresiones específicas: **38 aprobadas, 0 fallidas, 0 omitidas**, `temp/phase155-tests.json`. Typecheck de runtime: código 0 (`temp/phase155-runtime-check.log`). Lint de runtime: código 0, dos advertencias y ningún error (`temp/phase155-runtime-lint.log`). Incluyen copia sin hardlinks y rechazo de errores de permisos; son pruebas automatizadas, no validación de un portable real.

Intento real: `node scripts/prepare-ollama-model.mjs`, código 1, **EACCES fetch failed** (`temp/phase155-model-preparation.log`). El bloqueo aparece al obtener la referencia oficial, antes de descargar pesos. No hay modelo preparado, nueva distribución con Qwen3 ni inferencia auténtica. El runtime Windows x64 preparado anteriormente permanece disponible; el portable anterior no contiene la semilla. No se repiten intentos bloqueados.

Acción siguiente fuera del sandbox: confirmar los 13 archivos fuente y ejecutar la preparación oficial con el script existente. Después: inspeccionar semilla, reconstruir renderer y portable x64, verificar recursos, ejecutar `scripts/validate-bundled-ollama.mjs`, revisar respuesta real sobre PbtinaDev, cierre de procesos y prueba visual con perfil aislado, persistencia y traslado. Instaladores y pruebas nativas Linux/macOS siguen pendientes. No se ha cambiado la versión ni publicado nada.

Preservación actualizada: `temp/phase155-preservacion-20261010.zip`, `.manifest.json` y `.patch`, con archivos nuevos incluidos y sin binarios, modelos ni temporales ignorados por Git.
### Cambio de requisito en Fase 15.5: Qwen3 4B de fábrica

#### Fuente alternativa oficial Hugging Face e importación local

### Fase 15.6 — reconstrucción y validación final (parcial, bloqueada para GUI)

Base inicial confirmada: `02cad9690b7e6d5777cc07f7d383a6651487eae6`, commit `fix(ai): synchronize automatic PbtAdmin model and managed endpoint`, rama dev/upstream-v1.0.7. Árbol inicialmente limpio y versión 1.0.7. No se repiten implementaciones ni descargas. Scripts reutilizados: prepare-ollama.mjs, prepare-ollama-model.mjs con fuente huggingface, validate-bundled-ollama.mjs y build Electron existente.

| Comprobación de esta fase | Estado | Evidencia |
| --- | --- | --- |
| Commit de configuración automática | APROBADO | HEAD indicado arriba, Git inicialmente limpio |
| Regresiones runtime/agente/modelo/endpoint/historial/portable/preparadores | APROBADO | 65 aprobadas, 0 fallidas, 0 omitidas; temp/phase156-tests.json |
| Typecheck completo | APROBADO | Código 0, temp/phase156-check.log |
| Lint completo | APROBADO | Código 0, temp/phase156-lint.log |
| Build Keystone UI | APROBADO | Código 0 y verify-bundle correcto; temp/phase156-renderer.log |
| Build Electron portable dentro de Codex | BLOQUEADO | Código 1, uv_os_get_passwd/ENOMEM, temp/phase156-electron.log |
| Recursos del portable ya existente | APROBADO | Inspección SHA-256 de runtime84 archivos y modelo5 archivos; temp/phase156-existing-package.log |
| Nuevo portable construido por Codex en esta fase | BLOQUEADO | El fallo de build impide certificar uno nuevo |
| Chat real nuevo, pregunta completa | NO EJECUTADO | Se solicita ejecución externa del validador actualizado |
| Interfaz, campos readonly, selector, estados y tema | BLOQUEADO | Sin launcher activo ni listener9222/9300; no hay resultado visual nuevo |
| Reapertura, traslado, otra unidad y offline explícito | NO EJECUTADO | Requieren portable y perfil aislado reales |
| Instaladores Windows, Linux/macOS nativos | NO EJECUTADO | No hay nuevas distribuciones ni entornos nativos disponibles |

El recurso existente contiene `pbtadmin-qwen3:4b-q4_K_M`, 2497291968 bytes en blobs, Qwen3 4B Q4_K_M y licencia verificada; runtime oficial Ollama v0.34.0 Windows x64 íntegro. SHA-256 del GGUF: 7485fe6f11af29433bc51cab58009521f205840f5b4ae3a32fa7f92e8534fdf5. La presencia de texto detectedEndpoint en app.asar no sustituye la prueba de ejecución de la configuración automática ni permite certificar el build nuevo. La inferencia anterior con puerto63409, 245 fragmentos y cierre confirmado sigue siendo evidencia histórica; no se vuelve a presentar como prueba de esta fase ni de su nueva interfaz.

El validador ahora pregunta «¿Quién eres, quién es tu creadora y qué sabes de PbtServers?», usa perfiles `temp/phase156-factory-chat-<uuid>` y conserva un `.result.json` UTF-8 con modelo, origen dinámico, metadatos, respuesta auténtica, fragmentos y cierre. Su lector de streaming conserva Unicode entre fragmentos. No descarga modelos ni consulta perfiles personales. Syntax check aprobado. La respuesta, el femenino y las afirmaciones sobre la network requieren revisar la evidencia real, no una respuesta simulada. Este script no sustituye el chat en GUI.

Procedimiento externo pendiente: rebuild renderer y Electron con PBT_DISTRIBUTION_MODE=portable, BUILD_TARGET ausente y RELEASE=false (el build mantiene publish=never); ejecutar validate-bundled-ollama.mjs y devolver el JSON UTF-8/log. Después abrir únicamente el portable de prueba con PBT_PORTABLE_DATA relativo y único, conservar esa misma ruta para reapertura, registrar PID y puerto; comprobar Ajustes, modelo importado automático, endpoint distinto del selector lógico11434, readonly y ausencia de API key; enviar la pregunta completa en el chat; revisar español/catalán/inglés y tamaños1200x720/800x400; cerrar la ventana propia y comprobar limpieza. Tras cerrar, comprobar traslado sin tocar instalaciones personales. No se declaran esos pasos aprobados antes de ejecutarlos.

Preservación de los cambios de validación y documentación: temp/phase156-preservacion-20261011.zip, .manifest.json y .patch; sin binarios, GGUF ni perfiles temporales. No hay push, merge, tag, release ni modificación de master/backup.

Corrección posterior de configuración automática: campos identificados en `xmcl-keystone-ui/src/views/SettingGeneral.vue`, alimentados por `composables/agent/settings.ts` y `AgentService.getProviderSettings()`. El endpoint guardado 127.0.0.1:11434 es el identificador lógico histórico del proveedor Ollama, no el transporte del motor integrado; `OllamaController` y el puente de chat ya reciben el origen dinámico del gestor. Se conserva ese identificador para reconocer perfiles antiguos, sin persistir puertos efímeros. Se añade `detectedEndpoint` separado a la respuesta del servicio para mostrar la URL real, calculada desde localOrigin y renovada al consultar tras un reinicio.

El servicio devolvía el modelo del snapshot de configuración incluso después de descubrir y seleccionar la semilla. Ahora devuelve directamente el modelo resuelto, espera la persistencia y vuelve a comprobar preferencias antes de escribir: una elección manual concurrente prevalece. El composable actualiza el modelo vacío a partir de la respuesta del servicio durante refresh; no sobrescribe selecciones existentes ni proveedores externos. Ajustes muestra modelo y endpoint detectados en solo lectura para Ollama, o estados localizados de ausencia/detención. Los campos manuales siguen disponibles para proveedores externos; el panel PbtAdmin conserva detección, selección de modelos instalados y asistente. No se pide API key a Ollama ni se inventa un modelo configurado si los metadatos no lo validan.

Pruebas nuevas: respuesta inmediata con nombre real de la semilla importada, puerto dinámico que cambia tras reiniciar, ausencia de consulta de API key y preservación de elección durante discovery. Batería específica servicio/puente: **18 aprobadas, 0 fallidas**, `temp/phase155-auto-tests.log`; typecheck completo código 0, runtime final código 0 tras la última regresión, lint código 0 y build renderer código 0. Logs `temp/phase155-auto-check.log`, `temp/phase155-auto-runtime-final.log`, `temp/phase155-auto-lint.log`, `temp/phase155-auto-renderer.log`. El primer typecheck detectó un error de tipado del fixture nuevo, corregido antes de obtener esos resultados finales.

Validación real de esta corrección UI pendiente: consulta de procesos denegada, DevTools 9222/9300 sin listener (ECONNREFUSED), build Electron en sandbox limitado por el ENOMEM reproducido. La inferencia real anterior sigue siendo evidencia de recursos empaquetados y puente, pero no valida esta nueva UI ni el main actualizado. No se ha descargado GGUF otra vez ni alterado el runtime. Se requiere reconstruir Electron fuera del sandbox y abrir un perfil portable temporal para verificar campos, detección, chat y reapertura. Las recetas instalables/Linux/macOS se conservan, sin prueba nativa nueva. Preservación: `temp/phase155-auto-preservacion-20261011.*`.

Validación real de distribución (11/10/2026): la usuaria completó build renderer (29,73 s, verify-bundle correcto) y Electron x64 (18,64 s) en PowerShell normal. Se generó `xmcl-electron-app/build/output/win-unpacked`, con marcador portable y ejecutable nuevo. Inspección independiente desde Codex mediante los validadores productivos: código 0, runtime Ollama v0.34.0 con 84 archivos íntegros; semilla `pbtadmin-qwen3:4b-q4_K_M` con 5 archivos instalables y 2497291968 bytes en blobs, pesos SHA-256 oficial y licencia válidos (`temp/phase155-inspect-package.log`). Esta es una distribución portable en carpeta; no se ha generado ni validado un ZIP nuevo o instalador en esta prueba.

Inferencia real externa desde esos recursos: perfil aislado `temp/phase154-factory-chat-287e7413-5320-438c-997c-e540050b096c`, servicio loopback `http://127.0.0.1:63409`. Metadatos reales: qwen3, 4.0B, Q4_K_M, tools/thinking/completion. Pregunta de identidad enviada mediante prompt productivo y puente Ollama: 245 fragmentos, respuesta auténtica que se identifica como PbtAdmin y describe a PbtinaDev como creadora, propietaria y administradora en femenino. `Managed cleanup confirmed`, `Inference exit: 0`; log `temp/phase155-inferencia-externa.log`. No se descargó un modelo durante esa inferencia. Esta prueba demuestra uso local de pesos empaquetados, pero no sustituye un ensayo con la red físicamente desconectada.

Limitaciones de la respuesta: incluye una afirmación genérica sobre no acceder a sistemas reales, pese a que el launcher dispone de herramientas; esa petición de identidad no ejecutaba herramientas y no valida diagnóstico contextual. El log PowerShell UTF-16 contiene caracteres de mojibake sin U+FFFD; no está determinado si se introdujeron al decodificar stdout o antes. No se afirma correcta la representación Unicode en GUI sin observarla. Pendientes: chat en interfaz portable con perfil aislado, primera ejecución, cierre y reapertura, traslado de carpeta, prueba offline explícita y llamadas de herramientas. Instaladores y pruebas nativas Linux/macOS permanecen pendientes. No hay publicación ni declaración global de estabilidad.

Preservación actualizada de fuentes: `temp/phase155-inferencia-preservacion-20261011.*`; incluye código y documentación pendientes, sin pesos ni binarios.

Preparación externa completada (salida aportada por la usuaria): código 0, modelo local `pbtadmin-qwen3:4b-q4_K_M`, familia qwen3, parameter_size 4.0B, Q4_K_M, capacidades tools/thinking/completion. Almacén preparado en `build/ollama/ollama-model`, 2497291968 bytes en blobs. Se reutilizó el GGUF original y su SHA-256 oficial. Validación independiente desde Codex: ejecutar nuevamente el preparador con fuente huggingface terminó con código 0 y `Verified imported staging reused`; verificó manifiesto, hashes de todos los blobs, pesos y licencia, sin descargar ni importar otra vez (`temp/phase155-staging-verificado.log`). No hubo inferencia en esa comprobación.

Intento posterior de portable dentro de Codex: `PBT_DISTRIBUTION_MODE=portable pnpm --prefix=xmcl-electron-app build`, código 1 por uv_os_get_passwd/ENOMEM (`temp/phase155-portable-build.log`). Una llamada independiente a os.userInfo reproduce ERR_SYSTEM_ERROR/ENOMEM con Node22.22.3; se trata del bloqueo ambiental ya observado. No se generó un portable nuevo con 4B en este intento. Acción externa pendiente: build renderer, build Electron en modo portable y `node scripts/validate-bundled-ollama.mjs` sobre win-unpacked. Se requiere respuesta auténtica, revisión de identidad/PbtinaDev y cierre confirmado; todavía no se declara chat, portable completo ni instalación real validados. Git permanece en 5837f99b, con fuentes pendientes conservadas; no hay publicación.

Corrección de licencia: el error HTTP404 externo se debía a usar la revisión de pesos `a9a60d0...`, que todavía no contenía LICENSE. El historial oficial muestra su incorporación en el commit posterior `34778e26c8fa5e8bc0daa2389a9f958cffb1aedd` (https://huggingface.co/Qwen/Qwen3-4B-GGUF/commit/34778e26c8fa5e8bc0daa2389a9f958cffb1aedd). Se ha comprobado mediante lectura web la respuesta con el texto completo de https://huggingface.co/Qwen/Qwen3-4B-GGUF/raw/main/LICENSE: Apache 2.0 y copyright 2025 Alibaba Cloud. Los accesos web a URLs con la revisión completa no pudieron verificarse, por lo que no se anuncian como respuestas HTTP válidas. El script usa la URL oficial raw/main comprobada para la licencia; los pesos mantienen revisión y SHA-256 fijos. Guarda LICENSE completo y license-source.json (URL y hash de auditoría, no firma independiente) en la caché; la licencia también se incorpora al Modelfile y al almacén empaquetado. El hash de auditoría de licencia no se presenta como una referencia independiente de confianza.

Se distinguen HTTP404 de archivo/URL inexistente, otros estados HTTP, errores de red/TLS y respuestas incompletas o incorrectas. No se omite la licencia ni se relaja TLS. Ejecución real local: `Verified GGUF reused`, después `Official license network error (EACCES); TLS verification remains enabled` (`temp/phase155-license-preparation.log`). Esto verifica nuevamente los 2497280256 bytes y el SHA-256 esperado del GGUF existente, sin peticiones de descarga de pesos. La obtención local de LICENSE y la importación siguen bloqueadas; leer el texto mediante web no equivale a haberlo guardado dentro del paquete.

Validación de esta corrección: 29 tests aprobados, 0 fallidos y 0 omitidos (`temp/phase155-license-tests.json`), syntax check correcto. Pendiente: ejecutar preparación externa corregida, comprobar importación y semilla, reconstruir portable, verificar inferencia auténtica y cierre. Cambios preservados en `temp/phase155-license-preservacion-20261010.*`, sin GGUF, binarios ni cachés en el commit.

El error externo confirmado es `tls: failed to verify certificate: x509: certificate signed by unknown authority` en la descarga del motor Ollama. No se desactiva TLS ni se cambian certificados. Se añade `node scripts/prepare-ollama-model.mjs --source huggingface`; `--download-only` descarga y verifica sin iniciar el motor. La fuente Ollama anterior sigue disponible sin la opción. El helper es `scripts/prepare-ollama-hf.mjs`.

Referencia del fabricante: https://huggingface.co/Qwen/Qwen3-4B-GGUF/commit/a9a60d009fa7ff9606305047c2bf77ac25dbec49. Su puntero Git LFS declara `Qwen3-4B-Q4_K_M.gguf`, **2497280256 bytes**, SHA-256 **7485fe6f11af29433bc51cab58009521f205840f5b4ae3a32fa7f92e8534fdf5**. Se descarga desde esa revisión fija, no desde un main mutable. El hash Xet no se confunde con SHA-256. Se conserva Apache 2.0 y el copyright de Alibaba Cloud del LICENSE oficial en la misma revisión. El hash esperado procede de la publicación oficial, no del archivo descargado.

Descarga: caché aislada en `xmcl-electron-app/build/ollama/hf-qwen3-4b`, archivo `.partial`, Range y Content-Range estrictos, reinicio si el servidor ignora Range, progreso, comprobación de espacio y verificación de tamaño/SHA-256/GGUF antes de publicar el archivo. Un GGUF completo válido se reutiliza sin redescargarlo. Archivos corruptos se conservan y se rechazan. Un lock de preparación impide dos operaciones concurrentes; se libera en el cierre normal. Un apagón puede dejar ese lock y exige diagnosticarlo antes de retirarlo. Los redirects solo admiten HTTPS y hosts de Hugging Face/hf.co sin credenciales ni puertos ajenos. No se envían tokens. Las interrupciones normales conservan la descarga para reanudarla en la siguiente ejecución.

Importación: Modelfile con `FROM ./Qwen3-4B-Q4_K_M.gguf`, LICENSE oficial y contexto 4096; se ejecuta `ollama create` con argumentos separados, sin shell, usando únicamente el binario integrado verificado y el puerto loopback del gestor. Método oficial: https://docs.ollama.com/import. El almacén es `ollama-model.hf-preparing/models`, nunca un perfil personal. El CLI puede necesitar una segunda copia local al importar: se comprueba espacio, no se descarga otra vez. No se sobrescriben semillas existentes de otra fuente ni modelos personales.

Identidad importada: **`pbtadmin-qwen3:4b-q4_K_M`**; no se presenta como el tag oficial **`qwen3:4b-q4_K_M`**. AgentService busca ambas semillas solo cuando no hay selección guardada, priorizando la importada, sin cambiar selecciones previas. El validador de empaquetado acepta el manifiesto local importado solo con origen fijo y pesos coincidentes con SHA-256/tamaño oficiales; mantiene verificaciones de todos los blobs, familia, cuantización, licencia, rutas y symlinks. `official-manifest.json` en esta variante contiene el manifiesto generado localmente por Ollama: no es un manifiesto firmado por Qwen ni una firma de producción. La referencia independiente de confianza de los pesos es el puntero del fabricante fijado en el código. Electron/DeskGap reutilizan la validación existente y el recurso `ollama-model`; no se duplica la arquitectura de empaquetado.

Validación específica: **40 tests aprobados, 0 fallidos, 0 omitidos**, `temp/phase155-hf-tests.json`; typecheck completo y lint código 0, logs `temp/phase155-hf-check.log` y `temp/phase155-hf-lint.log`. Los fixtures pequeños prueban protocolo de descarga e integridad; no son pesos reales. Intento de descarga real desde Codex: código 1, `EACCES fetch failed`, `temp/phase155-hf-download.log`. No se obtuvieron pesos, no se importó un modelo real y no se generó un nuevo portable ni inferencia. La usuaria debe ejecutar el comando externo indicado y devolver la salida; después se comprobarán licencia/configuración reales, paquete y conversación. Linux/macOS nativos siguen pendientes.

Preservación de todos los cambios fuente pendientes: `temp/phase155-hf-preservacion-20261010.*` (ZIP verificado, manifiesto SHA-256 y parche, incluidos archivos nuevos). Los pesos, cachés y binarios permanecen en build/ollama ignorado por Git. No hay push, merge, tags ni publicación.

Diagnóstico posterior de preparación externa: la usuaria obtiene el manifiesto y llega a `pulling 163553aea1b1`, pero Ollama devuelve un evento de error. La causa de descarga aún no está determinada: `NODE_OPTIONS=--use-system-ca` afecta Node, no configura la confianza TLS del ejecutable Ollama. No se desactiva TLS ni se atribuye el fallo a certificados sin evidencia. El script ocultaba el detalle bajo un mensaje genérico; ahora comunica el error del motor con URLs y credenciales redactadas, mantiene UTF-8 entre fragmentos y procesa el último evento sin salto de línea. Dos regresiones de diagnóstico y redacción aprobadas; syntax check correcto. Se conservan ambas carpetas `.preparing-23464` y `.preparing-25084`, sin borrarlas ni publicar pesos parciales. La siguiente ejecución externa debe devolver el mensaje detallado; los logs NODE_DEBUG no identifican la causa del motor y pueden contener información sensible, por lo que no se solicita su volcado completo.

Validaciones finales de este cambio: **40 tests aprobados, 0 fallidos, 0 omitidos** (`temp/phase155-4b-tests.json`); `pnpm check`, `pnpm lint` y `pnpm build:renderer`: código 0. Logs: `temp/phase155-4b-check.log`, `temp/phase155-4b-lint.log`, `temp/phase155-4b-renderer.log`. No equivalen a una prueba visual ni a inferencia real. Preservación completa de fuentes pendientes en `temp/phase155-4b-preservacion-20261010.*`; incluye las modificaciones anteriores y excluye modelos y binarios ignorados por Git.

La semilla predeterminada pasa a **`qwen3:4b-q4_K_M`**, identificador verificado en https://ollama.com/library/qwen3:4b-q4_K_M. La ficha oficial publica Q4_K_M, aproximadamente 2,6 GB y Apache 2.0. No se inventa un SHA-256 completo: el preparador obtiene el manifiesto desde `https://registry.ollama.ai/v2/library/qwen3/manifests/4b-q4_K_M` y verifica todos los blobs contra sus descriptores oficiales.

FACTORY_MODEL, ruta del manifiesto y origen cambian conjuntamente. Preparación, validación de inferencia, Electron y DeskGap consumen esas constantes o la semilla validada; se mantiene una única carpeta `ollama-model`. El empaquetado rechaza semillas antiguas de 1.7B en vez de incorporarlas como si fueran 4B. No se borran datos ni se sustituye automáticamente un staging existente. Qwen3 1.7B Q4_K_M permanece en el catálogo opcional, sin una segunda semilla en el paquete.

La detección existente evalúa RAM total, RAM libre, CPU y espacio disponible. El catálogo recomienda 4B a partir de 8 GiB de RAM y margen de memoria libre; son estimaciones, no benchmarks. La configuración muestra una advertencia y permite abrir el asistente con 1.7B si 4B no resulta recomendado. Esta acción no cambia la selección activa ni descarga nada: conserva el consentimiento explícito y la vista previa del asistente. Usuarios con modelos o proveedores configurados conservan su elección. El launcher no queda bloqueado por esta recomendación.

Pruebas añadidas: tag/manifiesto/origen exactos de 4B, recomendación ligera con recursos limitados sin descarga y rechazo sin consentimiento. Se mantiene la regresión que conserva una selección previa de 1.7B. La licencia, hashes, GGUF y cuantización siguen siendo comprobaciones obligatorias del recurso preparado; las capacidades de chat/herramientas se consultan al motor, sin deducirlas del nombre.

Intento de preparación desde Codex: código 1, `EACCES fetch failed`, log `temp/phase155-4b-preparation.log`. No se ha descargado Qwen3 4B ni generado un portable que lo contenga. Quedan bloqueadas la inferencia auténtica, la conversación de PbtAdmin y la validación offline y de traslado. Las recetas multiplataforma se conservan; Linux/macOS no tienen validación nativa nueva. La integración de distribución no se declara terminada.

### Phase 15.6: native streaming validation correction

External execution discovered the packaged Qwen3 4B Q4_K_M model at dynamic loopback port 60303 and confirmed managed process cleanup. Inference validation FAILED with ERR_INVALID_ARG_TYPE: the validation reader passed string chunks from the production chat bridge to TextDecoder, which requires bytes. This is a validation-script defect, not evidence of a model or launcher failure.

The reader now accepts strings and streamed UTF-8 bytes, preserves split Unicode sequences, parses fragmented SSE, and rejects empty or malformed responses. Ten regression tests passed, including the existing production bridge tests. Production inference and visual launcher validation remain pending; rerun only scripts/validate-bundled-ollama.mjs against the existing package. No model download or package rebuild is required for this reader correction. Error code and message are now retained in the UTF-8 result JSON.

### Phase 15.6: successful external native inference evidence

The corrected validator was committed as e16abed1. External execution against win-unpacked used pbtadmin-qwen3:4b-q4_K_M (qwen3, 4.0B, Q4_K_M; tools/thinking/completion) at http://127.0.0.1:51157. The production chat bridge returned 282 content chunks; exitCode=0 and cleanupConfirmed=true were independently read from temp/phase156-factory-chat-0f64ae06-77a0-4def-a069-f3861c31e4b0.result.json. The authentic answer identifies PbtAdmin and PbtinaDev as its female creator, owner and administrator. UTF-8 evidence contains correct accented characters and no U+FFFD replacement characters; the pasted console mojibake is not present in the saved answer.

Status: native packaged-resource inference APPROVED. This is not visual launcher validation, not a ZIP/installer execution test, and not a proof of lore retrieval or diagnostic tool execution (this validator supplies no tools). The model calling itself fictional is imprecise wording and must not be treated as a verified historical fact. GUI automatic settings, model selection, chat, offline restart and portable relocation remain NOT EXECUTED in this run. No downloads or rebuilds were repeated.

### Corrección de detección y estado en la interfaz del portable

Base confirmada: `58f64601`, rama `dev/upstream-v1.0.7`, árbol inicialmente limpio. La usuaria identifica `build/output/win-unpacked` como el paquete abierto. Se inspeccionó `xmcl-electron-app/build/output/win-unpacked/PbtModLauncherX.exe`, modificado el 2026-10-11 a las 00:42:02 +02:00. No se pudo identificar un PID activo ni observar su ventana durante esta comprobación; no se asume que los nuevos cambios estén ya dentro de ese ejecutable.

**Recursos comprobados:** validación criptográfica del paquete existente correcta: Ollama v0.34.0, 84 archivos; modelo `pbtadmin-qwen3:4b-q4_K_M`, 2497291968 bytes en cinco archivos de almacén. Los pesos conservan el SHA-256 oficial documentado anteriormente. No hubo descargas nuevas. Esta inspección no acredita qué almacén estaba usando la ejecución visual de la usuaria.

**Defectos confirmados y correcciones:**

- `resolveModel` convertía un fallo de arranque/conexión en un resultado vacío. El servicio ahora termina la preparación verificada del motor antes de interpretar sus tags; los errores de readiness y recursos se transmiten por separado mediante `runtimeError`.
- El composable podía guardar un proveedor no configurado y luego descubrir modelos sin volver a resolver la selección. `readProviderSnapshot` resincroniza ese caso con un segundo intento acotado. No hay sondeo infinito ni sustitución de selecciones existentes. Una inspección que indique motor detenido invalida el estado listo y su endpoint activo.
- Se evita otra inspección que vuelva a arrancar el motor después de que esa misma consulta haya fallado. Una comprobación explícita posterior permite recuperar el estado. Se mantiene la pausa intencionada del modo de bajos recursos y el arranque manual de PbtAdmin.
- Ajustes colocaba `noModels` y `stopped` dentro de los campos aunque no fueran estados observados. Los inputs ahora muestran únicamente modelo seleccionado y endpoint detectado. El estado y el diagnóstico aparecen debajo, completos, con `role=status`, `aria-live`, ajuste de palabras y un botón de comprobación protegido contra clics concurrentes.
- Se vuelve a comprobar el estado al abrir Ajustes. Las respuestas obsoletas durante cambios de proveedor no reemplazan el diagnóstico vigente. Se informa del trabajo de inicialización y se permite recuperar fallos de IPC.
- Los logs propios de arranque registran ejecutable, arquitectura, recursos, almacén, inicio/final de preparación, PID del supervisor, endpoint, disponibilidad y causa final de readiness (HTTP, conexión, versión o propietario del puerto). No se registran stderr arbitrario del motor, prompts, respuestas, claves ni tokens. La verificación de propiedad del puerto y TLS se mantienen.

No se ha probado que un defecto de spawn, permisos, transporte Electron o un lock explique el fallo original de esa ejecución específica: se necesita su nueva traza real. No se presenta una causa ambiental posible como confirmada.

**Validación de esta corrección:** 46 tests pertinentes aprobados, cero fallidos; typecheck y lint con salida 0; traducciones sin errores de claves, sintaxis o interpolaciones; Keystone UI compilada y bundle verificado. La batería incluye recuperación después de readiness fallido, resincronización posterior, endpoint dinámico, recursos ausentes, proveedores externos y regresiones del gestor. Son pruebas automatizadas, no una conversación visual real.

`pnpm dev:main` con perfil temporal y el build portable Electron siguen BLOQUEADOS por `uv_os_get_passwd returned ENOMEM`. No se generó un nuevo ejecutable o instalador con esta corrección dentro del sandbox. Los logs están en `temp/ollama-sync-*.log`.

**Pendiente obligatorio:** reconstruir fuera del sandbox, abrir exclusivamente el nuevo `win-unpacked/PbtModLauncherX.exe` con `PBT_PORTABLE_DATA` apuntando a un perfil temporal nuevo, comprobar modelo/endpoint visibles, conversar mediante PbtAdmin, cerrar y reabrir el mismo perfil. Revisar únicamente las líneas `[local.runtime]` de sus logs y confirmar el cierre de procesos propios. La inferencia anterior por script sigue siendo evidencia independiente y no sustituye esta prueba. Linux/macOS no se han ejecutado nativamente.

Si `.git/index.lock` impide el commit, esta corrección se preserva mediante ZIP verificado, manifiesto SHA-256 y parche bajo `temp/ollama-sync-preservacion-20261011.*`, sin binarios ni pesos. No hay push, merge, tags ni release.

## Fase 15.8 — contexto de Qwen3 4B (2026-10-11)

Base: `44d9938c`, rama `dev/upstream-v1.0.7`, árbol inicialmente limpio. Versión 1.0.7 sin publicar.

### Causa reproducida y alcance de la evidencia

El importador oficial GGUF genera `PARAMETER num_ctx 4096`; `parseOllamaModel` respeta ese valor y los metadatos del modelo, con un techo conservador de 8192. El puente `/api/chat` transmite el contexto observado y reserva 1024 tokens de respuesta para 4096. No se aumenta el contexto ni se atribuye el error a RAM sin evidencia.

El frontend construía herramientas, instrucciones extensas y el catálogo de documentos incluso para un saludo. `boundAgentProviderContext` podía lanzar `pbtadmin.contextTooSmall` antes de contactar a Ollama: no es necesariamente un error devuelto por el motor. Una regresión reproduce ese fallo con 24 descripciones y un saludo. La estimación anterior incluía metadatos de transporte que no forman parte del prompt. Esto demuestra un mecanismo del defecto; no sustituye la captura de la ejecución visual original.

### Corrección

- Política conservadora por petición: saludos, identidad, lore y explicaciones generales reconocidas utilizan chat sin herramientas. Peticiones ambiguas o diagnósticas conservan el gateway virtual `vfs_shell` y lectura; escritura/eliminación añaden las herramientas directas pertinentes. El gateway mantiene descubrimiento de operaciones mediante `help`; no se modifica su allowlist ni sus confirmaciones. No se introducen comandos de sistema ni reintentos automáticos de acciones.
- Prompt de trabajo pequeño: identidad, creadora en femenino, privacidad, distinción entre miembros reales y parodias, evidencia no confiable y confirmaciones. Se retira el catálogo completo; el lore se recupera localmente por consulta, máximo tres fragmentos de 1200 caracteres. No se introducen historias completas en cada turno.
- El prompt de cada petición refleja sus capacidades actuales; no se reutiliza una copia antigua guardada con herramientas/documentos adicionales. No se cambian selecciones de modelo o proveedor.
- Proyección acotada del historial: conserva turnos recientes y pares de herramientas; omite razonamiento antiguo y llamadas/resultados de herramientas en el modo de conversación. Los resultados extensos se limitan con un aviso. El historial persistido no se reemplaza por resúmenes ni se borra. Un mensaje actual que por sí solo no cabe produce un error explícito.
- Estimación conservadora por caracteres, no un tokenizer exacto: cuenta prompt, contenido y esquemas, excluye coste/usage/timestamps; reserva respuesta más 128 tokens de margen. No se presentan estimaciones como tokens medidos por Qwen.
- Métricas numéricas `[local.context]` en el puente: contexto, reserva, cantidades de mensajes/herramientas y caracteres, sin registrar contenidos. El debug de desarrollo añade cuántos mensajes quedaron fuera. El uso real sigue procediendo de `prompt_eval_count`/`eval_count` y la telemetría existente.
- Errores conocidos de memoria, contexto y timeout se distinguen sin retransmitir cuerpos arbitrarios del proveedor. Nuevos textos en es-ES, ca e inglés, comprobados en UTF-8. La disposición centrada del chat y las preferencias de bajos recursos se conservan.

### Validación y pendientes

| Comprobación | Estado | Evidencia |
| --- | --- | --- |
| Regresiones agente/proveedor/transporte | APROBADO | 253 tests, 24 archivos, cero fallos; `temp/phase158-tests.log` |
| Typecheck completo | APROBADO | `pnpm check`, salida 0; `temp/phase158-check.log` |
| Lint | APROBADO | `pnpm lint`, salida 0; avisos existentes, sin errores |
| Keystone UI | APROBADO | `pnpm build:renderer`, salida 0; bundle verificado, 110 chunks |
| Compilación Electron | BLOQUEADO | `pnpm --prefix=xmcl-electron-app compile`: ENOMEM en `uv_os_get_passwd`, Node 22.22.3 |
| Diagnóstico ambiental mínimo | BLOQUEADO | `node` con `os.userInfo()` reproduce ENOMEM fuera del código del launcher |
| Nuevo portable e inferencia de esta corrección | NO EJECUTADO | No se ha reconstruido Electron en este sandbox |
| Chat visual, diez turnos, diagnóstico, reinicio y bajos recursos | NO EJECUTADO | Requiere prueba externa; no se declara solucionado completamente |
| Linux/macOS nativos | NO EJECUTADO | No hay entorno nativo validado |

No se repiten descargas del GGUF válido ni se incorporan pesos/binarios a Git. La inferencia auténtica de fases anteriores no valida esta nueva ruta de contexto. No se inicia otra inferencia nativa dentro del sandbox mientras el cierre de procesos mediante taskkill siga siendo una limitación conocida; ENOMEM y cleanup son bloqueos distintos.

Validación externa reproducible, desde PowerShell normal en la raíz:

```powershell
& './scripts/validate-pbtadmin-context.ps1'
```

El helper reconstruye UI y portable, verifica primero un saludo y el lore con el puente productivo, y abre dos veces un perfil nuevo `temp/phase158-ui-*`. Restaura las variables del proceso y no detiene aplicaciones ajenas. La inferencia por script sigue siendo distinta de la comprobación visual. Devuelve logs `temp/phase158-*-external.log`, JSON UTF-8 emitidos y resultados visuales: saludo, identidad, 0ftome, JuanD, explicación técnica, diagnóstico real, diez turnos, streaming, modo reducido, persistencia y cierre de procesos propios. No aprobar cambios de archivos durante esta prueba. La falta real de memoria física no se simula con fixtures.

Git no pudo crear `.git/index.lock`: `Permission denied`. Se preservan fuentes/documentación mediante `temp/phase158-preservacion-20261011.{zip,manifest.json,patch}`, incluyendo archivos nuevos y excluyendo modelos, binarios, perfiles y fuentes RTF privadas. No se alteran permisos, master o backups; no hay push, merge, tags ni publicación.
