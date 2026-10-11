# Fase 6 — Detección y activación de shaders

Fecha: 2026-10-10. Rama: `dev/upstream-v1.0.7`.

## Estado inicial y conservación

HEAD comprobado, sin asumir el SHA: `d6458904063d5afdf60a9851bf382dd7ba85a8e7`, `fix(mod-loaders): correct LabyMod NeoForge and installer metadata`. El usuario confirmó localmente la Fase 5. El árbol estaba limpio al iniciar esta fase y se leyó `REPARACION-MOD-LOADERS-v1.0.7.md`. No se modificaron archivos de la reparación anterior, ni master ni backup. La versión pública permanece 1.0.6.

## Causas raíz confirmadas en código y regresiones

1. `instanceShaderPack.ts` buscaba metadatos con una cadena `if/else if`: la presencia de Forge podía ocultar una entrada válida de NeoForge o Fabric en el mismo JAR. La normalización posterior repetía ese orden y podía devolver un proveedor diferente del detectado.
2. En una lista Fabric, la búsqueda reconocía Iris en cualquier posición, pero la normalización devolvía siempre el primer elemento. Un contenedor antes de Iris producía un identificador incorrecto y no cargaba `iris.properties`.
3. Quilt no tenía un camino de detección para sus metadatos propios. Tampoco se inspeccionaban los hijos del contenedor NeoForge.
4. OptiFabric por sí solo se interpretaba como OptiFine. Es un puente, no prueba de la presencia del motor de shaders.
5. No se comprobaban los requisitos declarados de Minecraft/loader. Un JAR desactivado se filtraba, pero un JAR de un loader diferente podía habilitar opciones indebidamente.
6. La lectura de opciones no observaba `instancePath` ni se ejecutaba inmediatamente al arrancar. Podía mantener el shaderpack anterior al cambiar entre dos instancias que compartían el mismo objeto de proveedor.
7. Las respuestas tardías no tenían un identificador de revisión: una lectura anterior de la misma instancia podía sobrescribir la nueva. El cambio de instancia también podía limpiar un resultado nuevo al terminar la petición antigua.
8. Sin proveedor, el setter escribía las opciones de los tres motores. Se evita esa escritura indiscriminada para preservar preferencias existentes.

Estas causas se han reproducido mediante fixtures y tests de lógica/reactividad. No se afirma que todas hayan sido observadas en el launcher real ni que describan el JAR concreto del usuario, que no se proporcionó.

## Correcciones

- Nuevo detector `detectShaderProvider`, compartido y comprobable: identifica `iris`, `oculus` y `optifine` mediante metadatos locales normalizados y el runtime de la instancia.
- Inspecciona la entrada Fabric coincidente, los hijos NeoForge y los metadatos Quilt; selecciona el formato pertinente al loader activo sin permitir que otro formato lo oculte.
- Respeta `enabled`, exige una versión Minecraft de instancia y comprueba que la ruta del mod pertenezca a su carpeta `mods`. Maneja separadores y mayúsculas de rutas Windows; descarta snapshots de otra instancia durante la transición.
- Comprueba requisitos declarados de Minecraft y versiones conocidas de loaders. Para rangos Maven se usa la pertenencia estricta al rango, evitando la clasificación heurística `maybe` de otras pantallas. Las restricciones semánticas usan las herramientas ya existentes.
- OptiFine del perfil se conserva para vanilla/Forge; en Fabric/Quilt exige un puente local activo. OptiFabric aislado no habilita shaders. El JAR OptiFine local se reconoce mediante los metadatos extraídos por el parser de clases existente, no por su nombre de archivo. No se considera un perfil OptiFine como soporte NeoForge.
- Nuevo `useShaderPackStatus`: carga preferencias al iniciar, observa proveedor, ruta y opciones vanilla, limpia el estado visible al cambiar y utiliza una revisión para ignorar respuestas obsoletas. Los fallos de lectura se exponen en `optionsError`.
- El setter utiliza exclusivamente el proveedor actual. La desaparición/desactivación del mod limpia el estado en memoria, sin borrar shaderpacks ni preferencias en disco.
- `ShaderPack.vue` utiliza el mismo detector para decidir si hace falta el asistente; la importación por arrastrar archivos pasa por esa comprobación de activación.
- Cuatro textos existentes de shaders corregidos en español y catalán: estado activado y explicación de ausencia de un sistema compatible activo. El mensaje menciona Iris, Oculus y OptiFine, no exige Iris cuando otro proveedor es válido. Se conservan todos los idiomas y claves.

La gestión de shaderpacks continúa disponible mediante los componentes existentes. El proveedor correcto permite leer/escribir su configuración; no se instala ni activa un motor por una coincidencia de nombre del JAR o un proyecto de mercado almacenado.

## Indexación, caché, eventos e IPC

Se reutiliza `InstanceModsService` y `AbstractInstanceDomainService.watch`, que entregan recursos de la carpeta `mods` de la instancia a través de `ResourceManager.watch`. `watchResourcesDirectory` ya procesa altas/cambios/eliminaciones y revalida snapshots por mtime; el worker extrae metadatos de JARs locales. El servicio habilita/deshabilita mediante renombrado `.disabled`, que produce los mismos eventos.

En renderer, `useState` reenvía las mutaciones IPC y dispara el shallow ref; `ReactiveResourceState.filesUpdates` crea una lista nueva y `useInstanceMods` vuelve a construir los ModFile. El detector computado consume esa lista, sin caché propia ni requisito de consultar Modrinth/CurseForge. La actualización puede esperar los agregadores/throttle existentes (aproximadamente 500 ms en cada capa); no se requiere reiniciar.

No se alteró el formato de caché de recursos ni el protocolo Electron/DeskGap. La invalidez reparada aquí es la selección derivada y las opciones por instancia, no una corrupción comprobada de la base de datos de recursos. Si un fichero reemplazado preserva artificialmente mtime/ino, la revalidación existente puede no detectar sus bytes; ese caso no se ha reparado ni verificado. No se añaden solicitudes de red para detectar proveedores locales; las consultas de mercado ya existentes del catálogo no forman parte de esta detección.

## Relación con upstream

La rama ya incorpora `990bac6c525532261078e5fe2353558aeacc70fb`, `fix: NeoForge shaders mod detection`, confirmado como ancestro de upstream/master. Añadía el reconocimiento de Iris/Oculus en NeoForge, pero conservaba los problemas de precedencia y normalización anteriores. Esta fase conserva ese soporte y lo amplía sin restaurar mecanismos antiguos.

Se conservaron el watcher moderno y la sincronización reactiva actual, incluidas las correcciones previas de liberación de watchers y parsing de JARs. No se realizó fetch, merge, sustitución de archivos por upstream ni actualización de dependencias.

## Pruebas y resultados

Ejecución final: **46 tests aprobados, 0 fallidos, 8 archivos**.

- 13 tests del detector: Iris sin metadatos de mercado; Iris después de un contenedor Fabric; metadatos Forge que no ocultan NeoForge; Oculus Forge/NeoForge; hijo NeoForge; Quilt con requisito Minecraft; OptiFine perfil/JAR; OptiFabric solo; ausencia/desactivación/loader erróneo; versiones Minecraft/loader incompatibles; incorporación/reemplazo/eliminación/cambio de instancia/perfil reactivos; rutas Windows.
- 6 tests de selección de opciones: carga inicial, cambio de ruta sin cambio de proveedor, sustitución/eliminación, respuestas desordenadas de la misma instancia, respuesta posterior a desactivación, opciones OptiFine y error de lectura observable.
- 1 test de integración local de parser: crea un JAR ZIP sintético con `fabric.mod.json`, lo coloca en una carpeta `mods` temporal, lo lee con `readFabricMod`, reemplaza el contenido y verifica la versión detectada nueva. Se limpia exclusivamente el directorio único creado por el test. No contiene el binario real de Iris ni valida su ejecución.
- 26 tests existentes de parsers, sincronización de estado y snapshot de mods, sin cambios en sus implementaciones.

Durante el desarrollo se corrigieron una advertencia de tipo por un rango potencialmente indefinido y la ubicación/imports del test ZIP, para aprovechar `yazl` ya declarado por el paquete installer sin añadir dependencias. Los errores iniciales de compilación del test se resolvieron; la ejecución final no tiene fallos.

| Validación | Resultado |
| --- | --- |
| Typecheck Runtime API, Runtime, Electron main/preload, Keystone UI y DeskGap | Correcto en los cinco paquetes, ejecutado por paquete con pnpm 11.10.0 |
| Lint packages, Runtime API, Runtime, Electron y Keystone UI | 0 errores; dos advertencias previas en `InstanceBlueprintsService.ts` |
| Validación de traducciones | es-ES y ca: 2426/2426 UI, 21/21 Electron y 29/29 component; 0 faltantes, placeholders inválidos o errores de sintaxis |
| Keystone UI | Compila en 27,46 s; `verify-bundle` correcto, 103 chunks y 0 orphans |
| Electron `compile` | Bloqueado antes del build: `tsx` / `uv_os_get_passwd returned ENOMEM` |
| DeskGap `build` | Mismo bloqueo ambiental antes del build |
| CLI oficial DevTools `list_pages` | Mismo fallo en `os.userInfo()` antes de conectarse |
| Git diff | Sin conflictos ni errores de whitespace; avisos de normalización CRLF/LF en YAML |

El error ambiental de identidad ya fue reproducido sin cargar el launcher en la Fase 5.1. No se atribuye a esta reparación ni se alteran herramientas para ocultarlo. Los logs completos quedan en `temp/phase6-*.log`, ignorados por Git. Persisten advertencias de tamaño de chunks/externalización de Vite, sin fallo de build.

## Compatibilidad y validación real pendiente

El soporte de Iris, Oculus y OptiFine está validado **en lógica, metadatos simulados y reactividad**, no en ejecución real de Minecraft. Solo el test de JAR sintético ejercita el parser de un archivo físico; no ejecuta el watcher completo con IPC ni una instalación real.

Los metadatos ausentes no permiten demostrar una incompatibilidad de versión, por lo que se mantiene el reconocimiento de proveedores cuyos requisitos no estén declarados. No se construye una tabla de versiones externas ni se garantiza que estén instaladas todas las dependencias de ejecución como Sodium/Embeddium. Quilt puede cargar metadatos Fabric según el soporte existente; su versión no se trata como una versión Fabric Loader y no se verifica un requisito de Fabric Loader desconocido. La compatibilidad efectiva de cada build exige las pruebas de juego pendientes.

Pendiente cuando el entorno permita iniciar/conectar la app dev:

1. Con datos temporales aislados y renderer `localhost:3000`, instalar Iris Fabric/NeoForge, Oculus Forge y OptiFine compatible; comprobar la UI y configuración del motor real.
2. Incorporar manualmente y actualizar JARs reales, observar eventos del watcher/IPC y confirmar que el estado cambia sin reinicio.
3. Desactivar/eliminar el mod, cambiar entre instancias y perfiles, reiniciar y comprobar preferencias conservadas.
4. Repetir con builds incompatibles y comprobar que el asistente ofrece sistemas pertinentes; lanzar Minecraft y activar/desactivar un shaderpack real.
5. Verificar el flujo con bridges Quilt/OptiFabric y dependencias efectivas. Revisar symlinks externos de `mods`, no cubiertos por los tests de rutas actuales.

No se abrió una app duplicada, no se modificaron instancias reales, no se descargaron mods ni shaderpacks y no se borraron configuraciones de usuario.

## Archivos de esta fase

Modificados (4):

- `xmcl-keystone-ui/src/composables/instanceShaderPack.ts`.
- `xmcl-keystone-ui/src/views/ShaderPack.vue`.
- `xmcl-keystone-ui/locales/es-ES.yaml`.
- `xmcl-keystone-ui/locales/ca.yaml`.

Nuevos (6, incluido este informe):

- `xmcl-keystone-ui/src/composables/shaderSupport.ts` y `shaderSupport.test.ts`.
- `xmcl-keystone-ui/src/composables/shaderPackStatus.ts` y `shaderPackStatus.test.ts`.
- `packages/installer/shaderMetadata.test.ts`.
- `PbtModLauncherX-Data/Modificaciones/REPARACION-SHADERS-v1.0.7.md`.

## Git y conservación

`git add` volvió a fallar al crear `.git/index.lock` con `Permission denied`. No se borró ningún lock ni se modificaron permisos. El perfil de esta sesión permite lectura de `.git` pero no escritura ni escalación. No hay commit nuevo; el HEAD final permanece `d6458904063d5afdf60a9851bf382dd7ba85a8e7`. Master y backup permanecen en `c4b77e666f0b132e05e3ffff71d2728132a46a44`.

Se conserva una copia adicional de las diez rutas en `temp/phase6-preservacion-20261010.zip`, con manifiesto de hashes y lista exacta en `temp/phase6-preservacion-20261010.manifest.json` y patch de archivos rastreados en `temp/phase6-preservacion-20261010.patch`. Los originales no se descartan y esos artefactos están ignorados por Git.

Comando PowerShell de una sola línea, desde la carpeta del repositorio y una sesión normal del usuario propietario, para confirmar solamente las rutas de esta fase:

```powershell
if ((git branch --show-current) -ne 'dev/upstream-v1.0.7') { throw 'Rama incorrecta' }; $phase6Files = (Get-Content 'temp/phase6-preservacion-20261010.manifest.json' -Raw | ConvertFrom-Json).files.path; git add -- $phase6Files; if ($LASTEXITCODE -eq 0) { git commit -m 'fix(shaders): detect compatible local providers and refresh instance selection' }
```

Sin push, releases, tags, cambios de master/backup ni actualización de versión. Se detiene el trabajo tras la Fase 6; no se inicia la Fase 7.
