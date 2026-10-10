# Exportador nativo de servidores — Fase 11

Fecha: 2026-10-10. Rama: `dev/upstream-v1.0.7`. Base: `edd3736ffa25e8b0864a6607ecef61c4c40cf50e`. Versión oficial conservada: **1.0.6**.

## Prerrequisitos y alcance

Árbol inicialmente limpio. Confirmadas las fases 10 (`b4a2c987`), 10.A (`a5f53da0`) y 10.B (`edd3736f`); consultados sus informes técnicos. No se sustituyen proveedores, herramientas, identidad, lore ni sistemas locales existentes. `master` y `backup/pre-upstream-v1.0.7` permanecen en `c4b77e666f0b132e05e3ffff71d2728132a46a44`.

Se añade **Exportar servidor** al menú de las instancias Java registradas. El resultado es un paquete ZIP de **instalación pendiente**, no un servidor cuyo arranque se haya acreditado. No se modifica la instancia ni se redistribuye el binario de Minecraft. Exportar no requiere cuentas XMCL, suscripciones ni Ollama.

## Arquitectura

- `InstanceIOService` expone `analyzeServerExport`, `exportServerZip` y `cancelServerExport` mediante la comunicación existente de Electron/DeskGap con el renderer. El exportador previo a carpeta/SSH sigue disponible y no se reemplaza.
- `ServerExportController` conserva planes opacos y copias de su análisis en el runtime, con caducidad de diez minutos y máximo de ocho planes. El cliente no puede sustituir las rutas, hashes o recetas del plan por datos propios. Se comprueban nuevamente runtime y hashes antes de exportar.
- Se reutilizan `VersionMetadataService`, ResourceManager, el parser de recursos existente, los clientes oficiales de Modrinth/CurseForge y `writeZipFile`/yazl. Los rangos Fabric y Maven emplean los parsers existentes mediante un adaptador local; no se cambian compilador, workspace, dependencias ni lockfile.
- El análisis lee JAR locales, comprueba su estructura y analiza una copia temporal de los mismos bytes revisados. La correspondencia con metadatos remotos exige coincidencia de SHA-1, no únicamente un identificador en caché.
- La interfaz carga el asistente de exportación de forma diferida. Ofrece nombre, destino, versiones detectadas, mundo opcional, configuraciones, datapacks, memoria editable, decisión individual de mods desconocidos, vista previa, advertencias y confirmación.

## Formato del ZIP

Contenido seleccionado: `mods/`, `config/`, `defaultconfigs/`, `kubejs/`, `scripts/`, `world/`, `world/datapacks/` y atribuciones de la instancia. Configuraciones y mundo están desactivados por defecto. Los datapacks raíz se trasladan a `world/datapacks`; colisiones con los de un mundo se bloquean.

Archivos generados: `server-manifest.json`, `server-install.json`, `install.py`, `start.bat`, `start.sh`, `README.md`, `README-es-ES.md`, `README-ca.md`, `README-en.md`, `ATTRIBUTIONS.md`, `eula.txt` y `user_jvm_args.txt`.

El manifest registra versiones exactas, Java, memoria elegida, hashes SHA-256 y tamaño de los archivos, identidades/evidencias/dependencias de mods incluidos, exclusiones y advertencias. Su estado es `installation-required-not-runtime-verified` y `eulaAccepted` es falso. Los nombres de archivos excluidos por privacidad, secretos o rutas absolutas tampoco se revelan en el manifest publicado. Las licencias contenidas en JAR se conservan; las atribuciones no acreditan por sí mismas permiso de redistribución.

El instalador usa Python 3 y biblioteca estándar. Muestra origen oficial/hash y requiere escribir **INSTALL** antes de acceder a la red o ejecutar Java. Verifica el SHA-1 obtenido de metadatos oficiales, limita descargas a 512 MiB, rechaza sobrescrituras y solo admite argumentos de instalación predefinidos, sin shell arbitraria. Los scripts no aceptan la EULA. El administrador debe leerla y aceptarla personalmente. Windows y POSIX usan la carpeta del script; el script POSIX admite EULA con saltos CRLF.

## Loaders y versiones

| Loader | Método implementado | Límites |
| --- | --- | --- |
| Vanilla | Metadatos exactos Mojang; descarga posterior de `server.jar` con SHA-1; arranque con Java. | Requiere descarga de servidor y `javaVersion.majorVersion` verificables. |
| Forge | Build exacta de `VersionMetadataService`; instalador Maven oficial y SHA-1; `--installServer`, `run.bat/run.sh`, `user_jvm_args.txt`. | Se admiten recetas modernas con Java ≥16. Forge antiguo no tiene aquí una receta de arranque verificada y se bloquea. |
| NeoForge | Build exacta asociada al Minecraft seleccionado; Maven oficial, proyecto existente según versión, SHA-1, `--installServer` y scripts oficiales. | No se certifica la compatibilidad de mods Forge antiguos con NeoForge; descriptores que no correspondan al loader se excluyen. |
| Fabric | Verificación de pareja exacta Minecraft/loader; instalador oficial fijado con SHA-1; comando oficial con `-mcversion`, `-loader`, `-downloadMinecraft`; `fabric-server-launch.jar`. | La disponibilidad global de un loader no basta: debe existir la pareja. |
| Quilt | Verificación de pareja exacta e instalador oficial fijado con SHA-1; `quilt-server-launch.jar`. | **Instalación manual** siguiendo el README y la GUI oficial con Minecraft, loader y carpeta exactos. No se inventan flags CLI no verificados. |

No se mezclan loaders múltiples ni se genera receta para LabyMod, LiteLoader o un perfil únicamente OptiFine. Una combinación no verificable bloquea la exportación. No se normaliza `26.1` a `1.21.11`; identificadores/hotfixes se conservan completos y se buscan por igualdad exacta. Las pruebas reutilizan los identificadores 26.x del fixture verificable de la Fase 7; no acreditan la existencia de todos los loaders para ellos.

La RAM recomendada (2 GiB vanilla, 4 GiB con mods, 6 GiB con más de cincuenta mods no cliente) es una **heurística**, no una medición del hardware o de rendimiento. Java parte del requisito oficial de Minecraft; mods/loaders pueden exigir otra versión compatible y deben revisarse.

## Clasificación de mods y dependencias

- Fabric: `environment` y descriptores de mods anidados, `depends`, `provides`, versiones. Quilt: `quilt_loader.minecraft.environment`, IDs y dependencias obligatorias simples. No se interpretan nombres de archivo como evidencias.
- Forge/NeoForge: descriptores y anotaciones explícitas `clientSideOnly`/`serverSideOnly`. El campo `side` de una **dependencia** no determina el lado del mod. Sin declaración suficiente, la clasificación es desconocida.
- Modrinth: consulta opcional de referencias conocidas, hash del archivo coincidente, `server_side`/`client_side`, versiones Minecraft/loaders y dependencias obligatorias por proyecto.
- CurseForge: consulta opcional de archivo coincidente por SHA-1, Minecraft exacto, tags explícitos de loader y dependencias obligatorias. No se inventa un indicador de lado que su API no proporcione.
- Metadatos contradictorios se mantienen ambiguos; evidencia explícita de solo cliente excluye el mod. Los mods desconocidos necesitan una decisión individual **incluir/excluir**. Se bloquean dependencias detectadas ausentes y rangos Fabric/Maven demostrablemente incompatibles.
- Rangos complejos Quilt, condiciones alternativas, bibliotecas anidadas, anotaciones antiguas y conflictos avanzados no están exhaustivamente resueltos: se advierte siempre y requieren revisión y arranque real. No se descarga ni añade automáticamente una dependencia faltante.

Las consultas a proveedores se desactivan por defecto, envían IDs conocidos y nunca JAR/configuraciones. Se acotan a 32 mods, ventana de inicio de consultas de 30 segundos y timeout de 8 segundos por proveedor; una consulta ya iniciada puede finalizar después de esa ventana. Si faltan referencias, hashes o conectividad, se conserva la evidencia local. Los metadatos oficiales de instalación tienen timeout de 12 segundos y máximo de 2 MiB por respuesta.

### Create y complementos

Una regresión sintética representa Create, Copycats+, Crafts & Additions, Diesel Generators, The Factory Must Grow, Valkyrien Skies, trenes, carreteras y una biblioteca compartida. Comprueba conservación por identidad/dependencias y rechazo al retirar la biblioteca. **No utiliza JAR reales de esos proyectos ni demuestra que existan para una combinación específica**. En un paquete real, la decisión depende de los descriptores, la versión exacta y metadatos de cada archivo. No se incluye o elimina un mod por pertenecer nominalmente a esta lista.

## Seguridad y privacidad

- Solo rutas revisadas dentro de la instancia; no rutas absolutas o traversal en ZIP. Se rechazan enlaces simbólicos/junctions, nombres reservados Windows, duplicados por mayúsculas/minúsculas y rutas no portátiles.
- ZIP/JAR se inspeccionan por entradas peligrosas, symlinks, archivos privados y configuraciones con posibles secretos. Límites: 20.000 entradas, 512 MiB descomprimidos por archivo inspeccionado, JAR de 256 MiB, anidamiento acotado; máximo 8 GiB de contenido seleccionado por paquete. Las comprobaciones son preventivas, no una garantía de ausencia de secretos.
- No se exportan automáticamente cuentas, tokens, sesiones, logs, crash reports, caches, shaders o resource packs. Se omiten `.env`, claves, archivos con nombres privados y textos con credenciales/rutas absolutas probables. Solo tipos de contenido permitidos; no ejecutables arbitrarios de configuración.
- Mundo opcional: omite `playerdata`, `stats`, `advancements`, `session.lock`; inventarios/progreso necesitan una migración autorizada aparte. NBT/archivos binarios y contenido personal del mundo no se pueden auditar semánticamente por completo: revisión manual obligatoria.
- Lectura segura de fuentes, hashes nuevamente comprobados y staging propio fuera de la instancia. La publicación utiliza enlace duro exclusivo y atómico; nunca sobrescribe un ZIP existente. Sistemas de archivos sin soporte fallan en vez de usar publicación incompleta. Cancelación/fallo elimina únicamente el staging creado para esa exportación. Se comprueba de nuevo el destino antes de publicar.
- No hay instaladores ejecutados por el launcher al exportar, EULA automática, cambios de autenticación oficial, descargas XMCL ni instrucciones del modelo ejecutadas como comandos.

## PbtAdmin

Reutiliza `useLocalAgent`: mismos proveedores local/remotos, identidad de PbtAdmin, streaming, cancelación e historial opcional. La conversación tiene scope propio por plan, sin contexto de cuentas/instancia activa, herramientas de lectura, logs ni eventos pasivos. Solo se envían las identidades/versiones/evidencias sanitizadas del análisis, Java, estimación RAM y advertencias **tras marcar consentimiento y pulsar Consultar**. Se muestra previamente el JSON que recibirá el proveedor. Ollama no es requisito para crear el ZIP.

PbtAdmin puede explicar exclusiones, dependencias, requisitos y pasos de instalación usando esos resultados reales; no ejecuta cambios. Las herramientas generales existentes de 10.A siguen disponibles en su chat habitual. Esta vista no captura ni envía automáticamente errores de arranque/logs privados; su diagnóstico posterior exige aportarlos o autorizar las herramientas correspondientes. Inferencia con un modelo real y calidad de esas explicaciones no se han verificado en esta fase.

## Traducciones

Se añaden 69 claves del exportador en español, catalán e inglés, incluyendo revisión, permisos, cancelación, incertidumbre, consentimiento y fallos. Se mantiene español predeterminado y los demás idiomas. Los paquetes contienen tres README; README principal y mensajes del instalador/scripts corresponden a es-ES, ca o en (otros locales usan es-ES).

Validación: UI es-ES y ca **2545/2545**, Electron **21/21**, componentes **29/29**; cero claves faltantes, errores de sintaxis o interpolaciones incompatibles. Se conservan 54 diagnósticos preexistentes de otros idiomas.

## Pruebas y compilaciones

**316 tests aprobados en 31 archivos, cero fallidos**: 47 nuevos de esta fase (38 exportación, 8 metadatos/rangos, 1 aislamiento PbtAdmin) y 269 regresiones existentes de agentes, configuración y exportación de archivos de modpacks.

Casos: cinco loaders, identificadores exactos antiguos/26.x, pareja inexistente, Forge antiguo bloqueado, origen/hash inválido, lados cliente/servidor/ambos/desconocido, dependencias ausentes y rangos incompatibles, ecosistema Create sintético, ZIP real y bytes/hashes, licencias, mundo y privacidad, traversal, junction real a directorio externo, cambios de fuente/runtime, destino dentro de instancia, no sobrescritura, permisos simulados EACCES, cancelación/limpieza, scripts Windows/POSIX y contexto PbtAdmin sin datos privados.

Se ejecuta realmente Python generado: rechazo de consentimiento sin descargar/usar Java y simulación de descarga con bytes/hash controlados y llamada Java allowlist. **Red y JVM de instalación simuladas**, no instalación oficial real. Los tests de recetas usan fixtures con formatos oficiales; hashes de payloads sintéticos no se presentan como hashes oficiales comprobados por descarga.

Typecheck de runtime-api, runtime, Keystone UI, Electron main/preload y DeskGap: correcto mediante tareas por paquete. Lint de packages, runtime-api, runtime, Keystone UI y Electron: cero errores, dos avisos preexistentes de `InstanceBlueprintsService.ts`. DeskGap no define una tarea lint. La tarea raíz lint no completa la cadena por `EPERM: lstat C:\Users\PBTINA~1` del pnpm global anidado; sus comprobaciones se ejecutan directamente con el pnpm accesible, sin cambiar política ni configuraciones.

Keystone UI: compilación Vite y `verify-bundle` correctos; avisos de tamaño de chunks, importación múltiple UnoCSS y externalización `node:fs` preexistente de proveedor. Electron y DeskGap: **bloqueadas** por `uv_os_get_passwd returned ENOMEM` al cargar tsx. Reproducido con `node -e "require('node:os').userInfo()"` sin código del launcher: limitación ambiental, no fallo demostrado del exportador.

No se certifica validación visual. Se leyó y se intentó usar el CLI oficial Chrome DevTools indicado por AGENTS.md; su arranque queda bloqueado por el mismo problema de usuario del entorno. No se escribió un scratch E2E para sustituir esa comprobación.

## Fuentes oficiales y ejecuciones reales pendientes

- [NeoForge: instalación y scripts de servidor](https://docs.neoforged.net/user/docs/server/).
- [Fabric: instalación del servidor](https://fabricmc.net/use/server/), [metadatos de instaladores](https://meta.fabricmc.net/v2/versions/installer).
- [Quilt: instalación manual de servidor](https://quiltmc.org/en/install/server/), [metadatos de instaladores](https://meta.quiltmc.org/v3/versions/installer).
- [Modrinth: campos de compatibilidad de proyecto](https://docs.modrinth.com/api/operations/getproject/).
- [Minecraft EULA](https://www.minecraft.net/en-us/eula).

Las solicitudes Node directas a Mojang y Fabric devuelven **EACCES** en este entorno. Hay Java local, pero no se han descargado/instalado servidores oficiales ni aceptado EULA; ningún servidor exportado ha llegado realmente a Done/ready en esta fase.

Pendiente: flujo visual completo en launcher dev a 1200×720 y mínimo 800×400, límites IPC reales, proveedores en vivo, exportación de instancias reales, cinco instalaciones oficiales y arranque dedicado (Windows y Linux/macOS), paquetes Create reales, validación de licencias individuales, RAM/Java efectiva según mods y comportamientos de sistemas de archivos sin hardlinks. No se certifica compatibilidad exhaustiva a partir de tests unitarios.

## Archivos afectados y preservación Git

19 rutas: los tres locales; `instanceContextMenu.ts`, `windows/main/App.vue`, `AppServerExportDialog.vue`, `serverExportAssistant.test.ts`; `xmcl-runtime-api/index.ts`, `src/entities/serverExport.ts`, `src/services/InstanceIOService.ts`; `xmcl-runtime/instanceIO/InstanceIOService.ts`, `serverExport.ts`, `serverExportAnalysis.ts`, `serverExportFiles.ts`, `serverExportMetadata.ts`, `serverExportRecipe.ts`, `serverExport.test.ts`, `serverExportMetadata.test.ts`; este informe.

Git no puede crear `.git/index.lock`: **Permission denied**. No existe un lock que se haya eliminado; no se alteran ACL, antivirus ni configuración de seguridad. Commit local pendiente. Preservación en `temp/phase11-preservacion-20261010.zip`, `.manifest.json` y `.patch`: ZIP y hashes SHA-256 verificados contra todos los archivos; parche binario completo con archivos nuevos. El manifiesto registra rama, commit base, rutas, tamaños y hashes, hash ZIP y hash del parche.

Comando de una línea, desde este repositorio en PowerShell fuera del sandbox:

```powershell
if ((git branch --show-current) -ne 'dev/upstream-v1.0.7') { throw 'Rama incorrecta' }; $phase11Files = (Get-Content 'temp/phase11-preservacion-20261010.manifest.json' -Raw | ConvertFrom-Json).files.path; git add -- $phase11Files; if ($LASTEXITCODE -eq 0) { git commit -m 'feat(server-export): add reviewed native dedicated server packages' }
```

Sin push, tags ni releases. No se inicia la Fase 12.

## Ampliación: Tipo y necesidad en servidor

Esta sección describe el estado ampliado y sustituye cualquier interpretación anterior que equipare compatibilidad con obligatoriedad. Los cambios originales de Fase 11 seguían sin confirmar por el bloqueo de `.git`; se conservan y se amplían, sin descartarlos. HEAD continúa en `edd3736ffa25e8b0864a6607ecef61c4c40cf50e`.

### Dos ejes independientes

En la lista local de mods se muestran dos columnas con texto, también en vista densa:

| Eje | Valores | Significado |
| --- | --- | --- |
| Tipo | Cliente, Servidor, Ambos, Desconocido | Dónde puede ejecutarse el mod según las evidencias disponibles. |
| Servidor | Obligatorio, Recomendado, No, Desconocido | Necesidad para las funcionalidades previstas del paquete y sus dependencias. |

Un descriptor Fabric con `environment=*` acredita Ambos, pero **no acredita Obligatorio ni Recomendado**: la necesidad permanece desconocida hasta obtener otra evidencia o una decisión explícita. Lo mismo ocurre con un descriptor que solo indique capacidad de servidor. No hay reglas estáticas por los nombres Sodium, Iris, Create o Lithium.

Modrinth aporta campos de entorno/requisitos únicamente después de verificar que el archivo consultado tiene el SHA-1 local y admite el Minecraft y loader exactos. Se interpretan los nuevos entornos si aparecen en la API estable utilizada, sin abrir una integración experimental nueva: `client_and_server` y `server_only_client_optional` declaran necesidad en servidor; los entornos compatibles opcionales permiten Recomendado; `client_only` y `singleplayer_only` excluyen servidor dedicado. Ser exclusivamente de servidor no demuestra, por sí solo, la necesidad dentro del modpack. Un entorno nuevo desconocido no hereda silenciosamente campos antiguos.

Si no se recibe el campo moderno, se conservan los campos legacy del cliente v2 existente: `server_side=required`, `optional`, `unsupported`, `unknown`. Se señala esa procedencia, con confianza media por ser información de proyecto y no una prueba de ejecución del archivo. La documentación oficial advierte de ambigüedades históricas; no se certifica el comportamiento de una versión únicamente por una etiqueta de proyecto. [Entornos oficiales de Modrinth](https://modrinth.com/news/article/new-environments/).

Fabric, Quilt, Forge y NeoForge siguen usando descriptores/anotaciones locales del archivo concreto. La obligatoriedad de una dependencia CLIENT no implica obligatoriedad en servidor. CurseForge conserva hashes, versiones, tags de loader y dependencias; no inventa un campo de necesidad o de entorno que no proporcione. [Descriptor Fabric y dependencias](https://docs.fabricmc.net/develop/loader/fabric-mod-json), [API de proyectos Modrinth](https://docs.modrinth.com/api/operations/getproject/).

Cada eje conserva valor, fuentes, explicación y confianza cualitativa (alta/media/baja/decisión del usuario). La confianza describe la evidencia, **no una garantía ni una probabilidad calibrada de funcionamiento**. Conflictos, ausencia de información, builds duplicadas o resultados pendientes muestran Desconocido. Una declaración física explícita de solo cliente sigue impidiendo exportarlo aunque otra fuente general discrepe.

### Dependencias y decisiones manuales

El grafo promociona a Obligatorio las bibliotecas requeridas por mods activos, compatibles y pertinentes para servidor. Una optimización recomendada puede necesitar una biblioteca obligatoria cuando se incluye. Se comprueban identidades, versiones y rangos mediante los parsers existentes; continúan las limitaciones documentadas para dependencias complejas.

El cálculo conserva primero la clasificación automática, aplica las decisiones del usuario y recalcula el grafo. Una decisión que convierte un padre en cliente elimina los requisitos de servidor derivados exclusivamente de ese padre. Una dependencia realmente activa puede volver a exigir una biblioteca aunque se haya etiquetado como recomendada. Una decisión explícita No se conserva; si se incluye un dependiente que la necesita, la exportación se bloquea por dependencia faltante.

El detalle de cada fila permite ver fuentes, motivos, confianza, originales y dependencias, elegir valores manuales para ambos ejes, guardar y restaurar la clasificación automática. Las decisiones no alteran el JAR ni sus metadatos y se identifican como del usuario. No pueden forzar la inclusión de un archivo excluido por seguridad, solo cliente probado o incompatibilidad. El diálogo se cierra al cambiar la instancia o el archivo para impedir aplicar una edición a otra fila.

### Persistencia y funcionamiento offline

`server-mod-classification/` bajo el directorio de datos del launcher conserva un JSON por instancia, cuyo nombre es un hash de su ruta. Las claves incluyen **Minecraft, loader, versión/hotfix del loader y SHA-256 del JAR**. No se reutiliza una decisión o un resultado de proveedor para otra instancia, versión o contenido. Las copias con otra ruta no heredan automáticamente decisiones; el usuario debe revisarlas. No se escribe caché ni decisiones en la instancia original durante la exportación.

Las escrituras son temporales y atómicas, serializadas por archivo para que una actualización de proveedor no borre ajustes manuales. Se limita tamaño y número de entradas, se valida el JSON y se rechazan symlinks/junctions; un archivo corrupto se informa, sin eliminarlo ni reiniciar preferencias silenciosamente. Restaurar automático vacía solo el override de esa entrada, conservando evidencia del proveedor.

El análisis de la lista **no solicita metadatos de instalación ni una receta de servidor**: utiliza archivos locales y caché exacta, con Java desconocido en ese análisis local. Las consultas a Modrinth/CurseForge solo ocurren al pulsar Consultar proveedores; ese botón informa de los IDs enviados. El análisis se actualiza al cambiar instancia/runtime, hash o estado de un mod. Las respuestas tardías de una instancia anterior se descartan. Los mods desactivados conservan su tipo, pero no originan requisitos automáticos de servidor y no se exportan.

### Filtros, exportador y PbtAdmin

Los filtros Tipo y Servidor son independientes y se combinan con los filtros/grupos locales existentes. Los resultados se asocian por hash del archivo; una build nueva no recibe la etiqueta de otra. Las filas con múltiples builds mantienen Desconocido hasta revisar esa ambigüedad.

Política de exportación ampliada:

- Obligatorio: seleccionado por defecto si es apto. Excluir un raíz obligatorio muestra advertencia y queda registrado en el manifest; quitar una dependencia de un mod incluido bloquea la exportación.
- Recomendado: seleccionado por defecto si es apto, con posibilidad de excluirlo.
- No: no se selecciona y el backend rechaza su inclusión.
- Desconocido: decisión individual explícita incluir/excluir. También se requiere revisión si el tipo es desconocido, aunque exista evidencia de necesidad.

La vista previa muestra ambos ejes y sus motivos. El manifest incluye clasificación, originales, procedencia y decisiones, además de las advertencias por raíces obligatorios excluidos. No se eliminan archivos del usuario.

PbtAdmin recibe ambos ejes, fuentes/confianza, dependencias y la selección real; se conservan la vista previa de datos, consentimiento y ausencia de herramientas privadas en esta conversación. Cambiar la selección revoca el consentimiento de envío para que el usuario revise el contexto actualizado. No se afirma que un modelo real haya explicado o reparado una instancia: las pruebas verifican el contexto enviado y su aislamiento.

### Validación de la ampliación

**353 tests aprobados en 35 archivos, cero fallidos**: 37 regresiones añadidas desde el resultado inicial de 316. En total hay 84 tests específicos de Fase 11 y ampliación, más 269 regresiones anteriores. Casos adicionales: ejes independientes, todos los entornos documentados, información moderna desconocida, clientes/ambos/servidor, fuentes contradictorias, requisitos de cliente, dependencias de mods opcionales, cambios manuales y recálculo, ausencia de metadatos, versiones/hotfixes/hash, caché offline después de reiniciar el servicio, exclusión de mods desactivados, persistencia/reinicio/reset, instancias aisladas, escritura concurrente, JSON corrupto, junction real, decisiones del exportador, manifest y contexto PbtAdmin.

Las columnas Vue reales se compilan y renderizan mediante SSR en es-ES, ca e inglés, comprobando texto, dos columnas y nombre accesible. Los filtros y actualizaciones reactivas se prueban con lógica real y servicio simulado. **SSR no es una comprobación visual ni una prueba de IPC en Electron.**

Typecheck por paquetes: API, runtime, Keystone UI, Electron main/preload y DeskGap correctos. Lint de packages, API, runtime y Keystone UI sin errores, con dos avisos preexistentes de runtime. Las tareas raíz `check` y `lint` se intentan, pero pnpm anidado falla con `EPERM: lstat C:\Users\PBTINA~1`; las verificaciones se ejecutan directamente mediante el pnpm accesible, sin cambiar configuración global.

Keystone UI y `verify-bundle`: correctos. Electron/DeskGap y la tarea dev Electron vuelven a fallar al cargar tsx con `uv_os_get_passwd returned ENOMEM`. El CLI oficial Chrome DevTools también devuelve ese error en `getRuntimeHome`, antes de conectarse a una página. No se consiguió iniciar ni recorrer la interfaz real; quedan pendientes el flujo completo, geometría a 1200×720 y 800×400, selección manual y persistencia visual después de reiniciar Electron, conexiones a proveedores en vivo y servidores dedicados reales.

Traducciones: **43 claves adicionales por idioma**; paridad UI es-ES/ca **2588/2588**, Electron 21/21 y componentes 29/29. Cero errores de sintaxis, claves faltantes o interpolaciones; 54 diagnósticos previos de otros idiomas. Español predeterminado y versión 1.0.6 conservados.

### Archivos y preservación ampliada

Además de las rutas de la Fase 11 original, se modifican `views/Mod.vue` y `views/ModItem.vue`. Se añaden:

- UI: `components/ModServerColumns.vue`, `components/ModServerClassification.vue`, `composables/serverModClassification.ts` y su test, `util/serverModClassification.ts` y su test.
- Runtime: `instanceIO/serverModClassification.ts` y su test, `instanceIO/serverModDecisions.ts` y su test.

Estado conjunto: **31 rutas pendientes, 10 modificadas y 21 nuevas**. El ZIP original de Fase 11 se conserva. El estado completo ampliado se preserva aparte en `temp/phase11-ampliacion-preservacion-20261010.zip`, `.manifest.json` y `.patch`, verificados por SHA-256 contra los 31 archivos; el parche incluye los nuevos.

Git continúa devolviendo `Unable to create .git/index.lock: Permission denied`. No se borra ningún lock ni se alteran ACL. Commit conjunto pendiente. Comando actualizado, desde PowerShell fuera del sandbox:

```powershell
if ((git branch --show-current) -ne 'dev/upstream-v1.0.7') { throw 'Rama incorrecta' }; $phase11Files = (Get-Content 'temp/phase11-ampliacion-preservacion-20261010.manifest.json' -Raw | ConvertFrom-Json).files.path; git add -- $phase11Files; if ($LASTEXITCODE -eq 0) { git commit -m 'feat(server-export): add native packages and evidence-based mod classifications' }
```

No se hace push ni se modifican master/backup. No se inicia la Fase 12.
