# Distribución y actualizaciones de PbtModLauncherX

## Compilación y revisión

El workflow `Build & Release` conserva cinco variantes: Windows x64, Linux x64,
Linux ARM64, macOS Intel y macOS Apple Silicon. Linux ARM64 usa un runner ARM64
para ejecutar y verificar sus binarios nativos. Ollama permanece fijado a
`v0.34.0`; sus archivos oficiales, manifiesto, procedencia y hashes se verifican
antes y después de copiarse al paquete. También se comprueba la arquitectura
del ejecutable del launcher y la igualdad de los documentos de PbtAdmin.
Los pesos GGUF y las carpetas de modelos de fábrica se rechazan al empaquetar.

Los formatos obligatorios son ZIP/APPX en Windows, AppImage/DEB/RPM/TAR.XZ/Pacman
en cada Linux y un DMG por arquitectura en macOS. DeskGap se conserva como
artefacto adicional de Windows. Cada instalador debe estar completo, no vacío y
ocupar menos de 2 GiB. `packages-<sistema>-<arquitectura>.json` registra tamaños y
SHA-256 reales; `SHA256SUMS-<sistema>-<arquitectura>.txt` permite verificarlos.
Los metadatos YAML se contrastan con los paquetes disponibles y su SHA-512.
En Linux, después de validar el runtime copiado, las bibliotecas con idéntico
hash, tamaño y permisos se reúnen mediante enlaces duros. Todos sus nombres y
bytes se conservan como archivos regulares, sin introducir enlaces simbólicos.
Así tar y los formatos del gestor de paquetes pueden almacenar una sola copia
del contenido repetido. El archivo oficial x64 confirmó 17 alias que antes
añadían 1.487.906.728 bytes como copias; los tamaños finales todavía deben
comprobarse ejecutando las nuevas builds Linux. El validador impide publicar
paquetes que continúen por encima del límite.
Los enlaces duros se crean únicamente dentro del runtime copiado al paquete,
nunca hacia las fuentes, otro runtime o los datos del usuario. Una escritura
directa sobre un alias modificaría los otros nombres del mismo inode; por eso
se limita esta optimización a recursos distribuidos inmutables. Modelos y
actualizaciones utilizan sus directorios y mecanismos independientes. Si falla
la creación del enlace, la build falla; no retira bibliotecas silenciosamente.
Se verifica el manifiesto de nuevo después de optimizar y se extraen los cinco
formatos Linux en CI para comparar todas las bibliotecas con sus SHA-256 y
ejecutar el Ollama extraído en el runner de la arquitectura correspondiente.
La exclusión de firma de Ollama reconoce `Contents/Resources` con la capitalización
real de macOS, conservando los bytes firmados oficialmente del runtime. La firma
del resto de la aplicación mantiene su configuración existente. Los logs de la
build auditada indican que falta una identidad Developer ID Application; la firma
y notarización efectivas requieren validar ese canal con sus credenciales de
distribución, que no se incluyen en el cliente ni se generan en este trabajo.

Los nombres de arquitectura son los que genera electron-builder: por ejemplo,
`x86_64.AppImage`, `amd64.deb`, `x86_64.rpm` y `aarch64.rpm`. No se renombran los
instaladores para ajustarlos a nombres supuestos por el actualizador.

Un push o una ejecución manual normal solo compila y exporta artefactos de
Actions. No adjunta archivos a una release pública. Para preparar una release:

1. Revisar los cambios y ejecutar las cinco builds del commit aprobado.
2. Crear mediante GitHub un borrador con el tag de la versión del código.
3. Ejecutar el workflow manualmente con ese `tag` y `prepare_draft: true`.
4. El trabajo de preparación exige que la release siga siendo un borrador,
   verifica las cinco variantes y vuelve a calcular sus hashes.
5. Revisar los archivos, firmas y pruebas de instalación antes de publicar
   manualmente. El workflow nunca publica el borrador ni modifica sus notas.

La preparación descarga cada artefacto en su propio directorio. Los manifiestos
tienen nombres por plataforma/arquitectura y los dos `latest-mac.yml` se reúnen
explícitamente, sin perder ninguno de los DMG. Cualquier otra colisión de nombres
detiene la preparación. Las subidas no usan `--clobber`; si un borrador ya tiene
un archivo con el mismo nombre, la subida falla y requiere revisión.

## Actualizador desde 1.0.7

* AppImage: consulta el proveedor GitHub del proyecto, selecciona exclusivamente
  el AppImage de su arquitectura entre los formatos del feed y descarga el
  paquete completo. Verifica SHA-512 y vuelve a verificarlo antes de instalar o
  entregar la instalación al cierre. La descarga se puede cancelar y reintentar.
* Windows ZIP/APPX y macOS DMG: consulta `latest_version.json` y GitHub Releases;
  la actualización manual abre la página oficial de la versión comprobada.
  Estos formatos no se presentan como instaladores NSIS ni como una actualización
  Squirrel.Mac. Tener un `latest.yml` no convierte un ZIP o DMG en una actualización
  automática compatible.
* Linux instalado mediante DEB/RPM/Pacman/TAR.XZ: se conserva la actualización
  manual del paquete completo. El mecanismo ASAR solo admite Linux con prueba
  exacta de Electron, arquitectura y dependencias; las builds 1.0.7 y siguientes
  no publican ASAR independientes durante esta migración.

Las actualizaciones no cambian el directorio de cuentas, configuraciones,
instancias ni modelos. La verificación de descargas corruptas y la recuperación
de sustituciones ASAR se cubren con pruebas automatizadas; una instalación y
reinicio reales de AppImage deben probarse también en Linux.

## Compatibilidad desde 1.0.6

El código del tag `v1.0.6` muestra que Windows/macOS consultan el JSON histórico
en `master/latest_version.json`. Seleccionan ASAR si existe; APPX tiene una ruta
de AppInstaller. Linux intenta electron-updater y solo recurre al JSON histórico
ante ciertos errores. Las actualizaciones ASAR antiguas no transportan Ollama,
los recursos externos ni una nueva versión de Electron. Por ello no se publica
un ASAR 1.0.7 que pueda producir una instalación parcialmente actualizada.

La migración automática de un AppImage 1.0.6 es compatible en principio con los
metadatos de paquete completo y SHA-512; queda pendiente verificarla con una
instalación real 1.0.6. No se declara probado ese salto para todas las plataformas.
El JSON histórico no se cambia con este trabajo y las releases públicas y sus
tags permanecen intactos.
La versión 1.0.6 usaba Electron 29.3.1 y electron-updater 6.1.7; 1.0.7 usa Electron
43.5.0 y electron-updater 6.8.9. Ese cambio de runtime refuerza la necesidad de
sustituir el paquete completo. Las antiguas instalaciones Windows ia32 no tienen
un paquete 1.0.7 equivalente: esta distribución requiere Windows x64.

Procedimiento manual seguro:

1. Cerrar el launcher y guardar una copia de los directorios de datos y modelos
   que aparecen en sus ajustes. Conservar también los directorios externos de
   instancias y cualquier configuración de modo portable.
2. Descargar el paquete completo de la arquitectura correcta desde la release
   oficial. Comparar su SHA-256 con `SHA256SUMS.txt`.
3. ZIP/portable: extraer en un directorio nuevo, conservar el marcador portable y
   el directorio de datos existentes, y volver a seleccionar las mismas rutas.
   No borrar la instalación antigua antes de comprobar la nueva.
4. DMG: sustituir la aplicación completa en Applications, conservando sus datos.
   Linux instalado: actualizar con el gestor de paquetes correspondiente.
5. APPX: utilizar el mismo identificador y publisher y un paquete correctamente
   firmado/distribuido por el canal admitido. Las builds locales sin firma están
   destinadas al flujo Store; no se garantiza instalación lateral ni actualización
   automática de AppInstaller con un APPX sin firma.
6. Abrir la nueva versión y comprobar cuentas, instancias, ajustes y modelos antes
   de eliminar la copia de la aplicación anterior.

El marcador portable Windows se llama `pbt-portable.json`, junto al ejecutable;
el recurso del repositorio contiene `{"schema":1,"dataDirectory":"data"}`.
Las builds con `PBT_DISTRIBUTION_MODE=portable` lo incluyen. Para una distribución
ZIP normal se mantiene el soporte de ese marcador y de `PBT_PORTABLE_DATA`, sin
cambiar la ubicación de los perfiles de instalaciones normales.

## Paquetes multiparte

`scripts/release-assets.mjs` se mantiene como respaldo: solo divide archivos que
alcanzan el límite individual de GitHub; conserva el hash total y genera hashes
de las partes e instrucciones de reconstrucción manual. Un paquete que cabe
completo no se divide. Si se divide algún paquete, se retiran los metadatos
`latest*.yml` que podrían anunciar un archivo completo ausente.

La descarga/reconstrucción multiparte automática **no está implementada** en el
actualizador y no se anuncia para 1.0.6 ni 1.0.7. La validación normal del workflow
rechaza paquetes de 2 GiB o más; recurrir al respaldo exige una revisión expresa
de esa distribución, sin omitir la comprobación del hash total reconstruido.

## Noticias y PbtAdmin

El JSON remoto `news/pbtmodlauncherx-news.json` y las imágenes siguen obteniéndose
desde GitHub independientemente de la release instalada. Las noticias y los
proveedores externos no requieren instalar Qwen3. El lore, personalidad,
conocimientos, traducciones y funciones de la Fase 1 se conservan.
