# Fase 8 — Iconos de instancias

Fecha: 2026-10-10. Rama: `dev/upstream-v1.0.7`. Versión pública conservada: **1.0.6**.

## Estado inicial y upstream

- Árbol inicialmente limpio; la Fase 7 está confirmada en `5d6c7f7382daf8bae4c25a8a6c49bfbc26c1e437` (`fix(versions): preserve Minecraft 26.x filters and match exact NeoForge hotfixes`). La Fase 6 figura en su historial como `50c6ffc4`.
- Se mantiene la arquitectura integrada de upstream: servicio de instancias en `xmcl-runtime/instance`, estado compartido mediante IPC y editor Vue de Keystone UI.
- Upstream ya incorporaba almacenamiento de iconos dentro de la instancia y referencias relativas portátiles: `3fb3b45c` y `8f6ccc3e`. También preservaba GIF animados, cubiertos por `a0c8c5fc` (#1781). Se amplían estas implementaciones; no se restauran archivos antiguos.
- Sin modificaciones de master, backup, versiones, dependencias ni configuración global. Sin push, tags o releases.

## Causas raíz confirmadas en el código

1. El selector excluía WebP y el arrastre consultaba `File.path`, mientras que el preload actual ofrece `windowController.getPathForFile`.
2. Las URL de vista previa concatenaban rutas sin codificar. Caracteres como `&`, `#`, `+` y `%` podían alterar la consulta o su interpretación. El protocolo `/media` decodificaba de nuevo el resultado de `URLSearchParams`, corrompiendo nombres literales con `%20` o lanzando errores ante `%`.
3. El servicio reutilizaba `icon.<ext>`, manteniendo la misma URL después de cambiar los bytes. Además, podía eliminar el destino antes de copiar y utilizar enlaces físicos: riesgo de caché obsoleta y de perder el icono anterior ante un fallo.
4. La rama de copia local confiaba en la extensión cuando no obtenía metadatos. Las referencias locales interiores, relativas y algunos archivos inexistentes eludían la validación. Las rutas absolutas de Windows podían confundirse con esquemas URL.
5. El callback de edición capturaba errores y devolvía una cadena vacía, convirtiendo un fallo en un borrado de la referencia anterior.
6. Los metadatos se escribían directamente y su persistencia no se esperaba antes de comunicar el nuevo icono. Dos solicitudes simultáneas podían terminar en orden inverso.

## Correcciones

- Selector PNG, JPG/JPEG, WebP, GIF, BMP y SVG; arrastre mediante la API compartida actual de Electron/DeskGap.
- Codificación de rutas y revisión de la vista previa para seleccionar repetidamente el mismo archivo. Extracción de la ruta sin confundir la revisión con el nombre. Compatibilidad con referencias antiguas sin codificar.
- Decodificación de la imagen en el renderer antes de aceptar la selección; comprobación de dimensiones y tiempo límite de 10 segundos. Los resultados de selecciones antiguas o componentes desmontados se ignoran. El editor se identifica por la ruta de la instancia.
- Lecturas locales y descargas limitadas a **8 MiB**, incluso si el archivo cambia durante la lectura o el servidor omite `content-length`. Dimensiones raster limitadas a **16.777.216 píxeles**.
- Validación del contenido: formato reconocido, estructura y dimensiones; PNG también verifica CRC de bloques y datos descomprimidos. JPEG comprueba segmentos y terminación, WebP su contenedor/cabecera, GIF su terminación y BMP su tamaño/cabecera. SVG sencillo se conserva, rechazando referencias activas o externas, scripts, entidades y contenido incrustado peligroso.
- Los JPEG/WebP/GIF se preservan en su formato original, incluido GIF animado. La validación estructural del backend **no equivale a una decodificación completa de todos los códecs**; la comprobación nativa del renderer complementa esa validación.
- Archivos propios `icon-<SHA256>.<ext>`: URL diferente cuando cambia el contenido y ubicación distinta por instancia. Escritura temporal exclusiva y publicación mediante rename. No se eliminan iconos anteriores, fuentes ni recursos compartidos.
- Persistencia relativa portable y escrituras de `instance.json` mediante temporales, ordenadas por instancia. La edición del icono espera la persistencia antes de modificar el estado compartido. Si falla, se conservan el estado y los metadatos anteriores.
- Protección frente a traversal en referencias relativas importadas y editadas. Los archivos absolutos seleccionados se leen y copian; no se modifican.
- Una edición antigua no puede reemplazar la selección nueva. Restaurar el predeterminado persiste una referencia vacía y conserva los archivos anteriores.
- Errores de lectura/decodificación o guardado del icono muestran `instance.iconError`, añadido a inglés, español y catalán. Se conserva `es-ES` como predeterminado y todos los demás idiomas.

## Archivos de esta fase

11 modificados:

- `xmcl-keystone-ui/locales/en.yaml`
- `xmcl-keystone-ui/locales/es-ES.yaml`
- `xmcl-keystone-ui/locales/ca.yaml`
- `xmcl-keystone-ui/src/components/AppChangeInstanceIconCard.vue`
- `xmcl-keystone-ui/src/composables/instanceEdit.ts`
- `xmcl-keystone-ui/src/views/BaseSettingGeneral.vue`
- `xmcl-runtime/app/pluginMediaProtocol.ts`
- `xmcl-runtime/instance/InstanceService.ts`
- `xmcl-runtime/instance/InstanceService.icon.test.ts`
- `xmcl-runtime/instance/instanceIcon.ts`
- `xmcl-runtime/instance/instanceIcon.test.ts`

6 nuevos, incluido este informe:

- `xmcl-keystone-ui/src/util/instanceIconImage.ts`
- `xmcl-keystone-ui/src/util/instanceIconImage.test.ts`
- `xmcl-runtime/app/pluginMediaProtocol.test.ts`
- `xmcl-runtime/instance/instanceIconValidation.ts`
- `xmcl-runtime/instance/instanceIconValidation.test.ts`
- `PbtModLauncherX-Data/Modificaciones/REPARACION-ICONOS-INSTANCIAS-v1.0.7.md`

## Pruebas y compilaciones

**272 pruebas aprobadas, 0 fallidas**, en 24 archivos: todas las pruebas de `packages/instance` y las cinco suites de iconos/protocolo/decodificación. Las suites directamente afectadas reúnen 60 casos; 45 añadidos respecto a las 15 regresiones de iconos originales.

Se comprueban PNG/JPEG/WebP con extensión engañosa, GIF animado, BMP y SVG; cambios consecutivos; restauración; recarga mediante un servicio nuevo; importación relativa; duplicación real de directorios mediante `duplicateInstance`; renombrado y recarga; separación de dos instancias; rutas con espacios, acentos y caracteres reservados; una ruta larga en la unidad del repositorio (G:); archivos inexistentes, truncados, corruptos, grandes, traversal y fallos EACCES simulados. También se prueba la carrera entre descargas y el protocolo local leyendo los bytes exactos del archivo.

Los tests de reinicio y duplicación utilizan servicios y archivos temporales reales, **no un reinicio visual de Electron**. La prueba de renombrado prepara el nombre persistido porque el fixture no dispone de la suscripción de estado real. Las pruebas de decodificación del renderer simulan `Image`; no acreditan ejecución visual en Chromium. Los fixtures PNG/JPEG se han abierto además con el decodificador de Windows (`System.Drawing`); el JPEG de regresión se genera con ese códec.

| Comprobación | Resultado |
| --- | --- |
| Typecheck Runtime API, Runtime, Electron/main/preload, Keystone UI y DeskGap | Correcto |
| Lint packages, Runtime API, Runtime, Electron y Keystone UI | 0 errores; 2 avisos preexistentes en `InstanceBlueprintsService.ts:287/297` |
| Validación de traducciones | 0 errores de sintaxis, claves o interpolaciones; es-ES y ca: UI 2427/2427, Electron 21/21, componentes 29/29 |
| Keystone UI | Correcto; compilación final 27,04 s, 103 chunks, 0 helpers huérfanos |
| Electron compile | Bloqueado por `uv_os_get_passwd returned ENOMEM` al cargar el entorno de herramientas |
| DeskGap build | Mismo bloqueo ambiental |
| CLI oficial chrome-devtools | Mismo bloqueo antes de conectar al launcher |
| `git diff --check` | Sin errores de whitespace |

Se usó Node 22.22.3 y el pnpm compatible ya presente en la caché, sin cambiar dependencias o políticas del workspace. Los checks/lints de los paquetes se ejecutaron por separado para evitar el ejecutable global de pnpm antiguo. Los logs quedan en `temp/phase8-*.log` (ignorados por Git). El aviso `DEP0180` procede de tests existentes que construyen `fs.Stats`; no provoca fallos. El validador señala 54 diagnósticos en otros idiomas, que no se modifican en esta fase.

## Limitaciones y comprobaciones manuales pendientes

- `require('node:os').userInfo()` reproduce ENOMEM sin importar el launcher. No se atribuye el fallo al código ni se afirma que Electron/DeskGap hayan compilado o ejecutado correctamente en este entorno.
- Pendiente recorrer el flujo visual real en el dev launcher (`localhost:3000`, CLI oficial): seleccionar/arrastrar PNG, JPEG y WebP, guardar, cambiar varias veces, restaurar, alternar instancias, copiar/renombrar y reiniciar. Comprobar mensajes es-ES/ca, consola, IPC, barra lateral y persistencia. No se han tocado perfiles o instancias del usuario.
- Pendiente validar con sistemas de archivos/permisos reales de Linux y macOS y carpetas protegidas de Windows; EACCES está cubierto mediante simulación. WebP tiene regresiones estructurales y de guardado, pero queda pendiente su visualización real en el launcher.
- Los iconos anteriores se conservan deliberadamente; no hay una limpieza automática de archivos históricos que pueda eliminar recursos compartidos.
- SVG activo o con referencias externas se rechaza para nuevos cambios. Las referencias existentes no se eliminan ni se migran automáticamente.

## Git y conservación

El intento de `git add -- xmcl-runtime/instance/instanceIcon.ts` falla con:

```text
fatal: Unable to create 'G:/Documentos/Compilar-Libs-Dev/PbtModLauncherX-Dev/.git/index.lock': Permission denied
```

No existe un lock que borrar y no se detectaron procesos Git activos. La política del entorno permite leer `.git`, pero bloquea escribir en él; no se cambian permisos ni se elimina ningún lock. **Commit pendiente**; HEAD permanece en `5d6c7f7382daf8bae4c25a8a6c49bfbc26c1e437`.

Se conserva una copia ZIP verificable, un manifiesto de rutas/tamaños/SHA256 y un parche de los archivos rastreados en `temp/phase8-preservacion-20261010.*`. El ZIP incluye también los archivos nuevos; se verifica cada entrada frente al original. Esta copia está en la misma unidad, no sustituye una copia externa.

Desde PowerShell del usuario, situado en el directorio del repositorio, confirmar únicamente las rutas del manifiesto:

```powershell
if ((git branch --show-current) -ne 'dev/upstream-v1.0.7') { throw 'Rama incorrecta' }; $phase8Files = (Get-Content 'temp/phase8-preservacion-20261010.manifest.json' -Raw | ConvertFrom-Json).files.path; git add -- $phase8Files; if ($LASTEXITCODE -eq 0) { git commit -m 'fix(instance-icons): validate images and persist isolated cache-safe icons' }
```

La Fase 8 termina aquí, con las limitaciones anteriores documentadas. No se inicia la siguiente fase.
