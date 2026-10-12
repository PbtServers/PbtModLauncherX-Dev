# Fase 2: resultados y revisión pendiente

Los cambios se preparan en la rama de revisión `phase2/packaging-validation`.
No se modifican releases públicas, etiquetas ni notas de release. Esta fase
todavía requiere builds actuales en GitHub Actions y pruebas nativas en Linux
y macOS; esta sección se actualizará con sus resultados reales.

## Validaciones locales

- Batería del workflow: **28 archivos, 263 pruebas superadas**, ninguna omitida.
- Type-check del paquete Electron: correcto después de la deduplicación Linux.
- `pnpm check`: correcto, incluida la última modificación del build de Electron.
- `pnpm lint`: correcto; dos advertencias preexistentes en `InstanceBlueprintsService.ts`.
- Windows x64: build completa ejecutada localmente, con Ollama v0.34.0 validado.
  Se verificaron arquitectura, documentos de PbtAdmin, ausencia de pesos GGUF,
  tamaños y checksums. APPX generado para Store, sin instalación lateral probada.

| Paquete Windows local | Bytes | SHA-256 |
|---|---:|---|
| ZIP | 1613812648 | `56d894117abda470c08665c51ffca9eafea8ec72d598e6d863ee2a90aaeb6506` |
| APPX | 1647252648 | `a0f9d1bcd6666f74276a5d508b008296152f7d1ccba24f68efcf685384155e55` |

Los paquetes están en `xmcl-electron-app/build/output/`. Ambos paquetes de la tabla
superaron también la comprobación completa CRC con 7-Zip: ZIP con 134 archivos y
10 carpetas; APPX con 171 archivos. La última build incluye el filtro de borradores
y prereleases del actualizador.

## Aplicación real

Se utilizó primero el launcher de desarrollo en `localhost:3000` y después el
ejecutable empaquetado de Windows, mediante el CLI oficial de Chrome DevTools.
Los perfiles y directorios de prueba estuvieron aislados de los datos del usuario.

- PbtAdmin arrancó con Ollama integrado y sin modelos instalados; mostró la
  instalación bajo demanda y permitió acceder a proveedores externos.
- Login offline con nombre visible y cuenta `PbtPhase2Test`; instancia temporal
  `Pbt Phase2 Test`. Cuenta, instancia e idioma se conservaron tras reiniciar.
- Cambio español → catalán → inglés mediante los controles reales, sin reinicio
  para actualizar los textos. Catalán también persistió tras reiniciar.
- Noticias oficiales de Minecraft cargadas. Traducciones disponibles y fallback
  original observados cuando el servicio externo limitó las solicitudes.
- Comprobación IPC del actualizador: versión 1.0.7 reconocida, sin sustituirla por
  el JSON histórico 1.0.6. Windows conserva la actualización manual del paquete.
- Modo portable real: modelos bajo el directorio portable elegido, Ollama operativo.
- Un archivo centinela confirmó conservación del directorio de modelos; no equivale
  a probar inferencia o actualización con pesos Qwen3 reales.
- Los recursos temporales se eliminaron y se reabrió un perfil limpio para comprobar
  ausencia de cuentas e instancias de prueba. No se tocaron datos personales.

Estos flujos completos se probaron con la penúltima build Windows. El filtro final
de prereleases tiene pruebas automatizadas y está compilado en la última build.
Logs conservados localmente: `temp/phase2-dev-main.log`,
`temp/phase2-packaged-main.log` y `temp/phase2-portable-main.log`.

## GitHub Actions auditado: no corresponde al diff pendiente

La ejecución [38182198686](https://github.com/PbtServers/PbtModLauncherX-Dev/actions/runs/38182198686)
del commit `c653fcb1` terminó sus cinco builds. No contiene los cambios actuales.
El éxito del workflow anterior no demuestra cumplimiento del límite de tamaño.

| Variante | Tamaños individuales observados (MiB) | Artefacto de esa ejecución |
|---|---|---|
| Windows x64 | ZIP 1539.05; APPX 1570.94 | [Windows](https://github.com/PbtServers/PbtModLauncherX-Dev/actions/runs/38182198686/artifacts/11717899765) |
| Linux x64 | AppImage 1740.45; TAR.XZ **2150.03**; DEB **2313.39**; RPM **2157.72**; Pacman **2249.88** | [Linux x64](https://github.com/PbtServers/PbtModLauncherX-Dev/actions/runs/38182198686/artifacts/11719169193) |
| Linux ARM64 | AppImage 1832.51; TAR.XZ **2361.33**; DEB **2537.02**; RPM **2379.14**; Pacman **2474.57** | [Linux ARM64](https://github.com/PbtServers/PbtModLauncherX-Dev/actions/runs/38182198686/artifacts/11718969319) |
| macOS Intel | DMG 291.55 | [macOS Intel](https://github.com/PbtServers/PbtModLauncherX-Dev/actions/runs/38182198686/artifacts/11718353773) |
| macOS Apple Silicon | DMG 288.05 | [macOS ARM64](https://github.com/PbtServers/PbtModLauncherX-Dev/actions/runs/38182198686/artifacts/11718487970) |

Ocho paquetes Linux superaban 2048 MiB. El nuevo validador rechaza esos tamaños.
El análisis del archivo oficial `ollama-linux-amd64.tar.zst` de v0.34.0 verificó
su SHA-256 `cf95886728959aa09910bb34de5cca1cc5a8f68003b5597197d3f2c2d57c0804`.
Sus 65 entradas incluyen 17 alias simbólicos; materializarlos como copias añade
**1.487.906.728 bytes** a los **2.262.670.241 bytes** de archivos originales.
El informe detallado está en `temp/phase2-linux-aliases.json`. Esto confirma la
duplicación de payload x64, pero no sustituye la medición del paquete comprimido
final ni constituye una comprobación equivalente de ARM64.
La build anterior ARM64 se ejecutaba en host x64; el diff cambia a runner ARM64
para ejecutar la validación nativa. macOS indicó ausencia de identidad Developer
ID Application: firma y notarización reales siguen pendientes.

## Correcciones preparadas

- Validación de todos los formatos, tamaños, SHA-256 y feeds SHA-512, además de
  arquitectura del ejecutable y recursos realmente copiados al paquete.
- Conservación de documentos y conocimientos por comparación de bytes; rechazo
  explícito de pesos y carpetas de modelos empaquetados.
- Deduplicación Linux mediante enlaces duros de bibliotecas idénticas ya validadas:
  conserva nombres, permisos y bytes. Prueba con el mismo node-tar del builder
  confirma almacenamiento y extracción de los alias. Falta medir builds Linux reales.
- Nombres correctos de paquetes Linux y selección del AppImage de su arquitectura;
  descarga completa, comprobaciones de integridad y enlace manual oficial.
- Borradores/prereleases excluidos cuando corresponde y selección de versión más
  reciente entre el JSON histórico y GitHub.
- Manifiestos separados por arquitectura y reunión explícita de ambos feeds macOS.
- Preparación exclusiva de borradores, con comprobación de cinco builds, sin publicar,
  sin sobrescribir archivos ni borrar notas. Push normal solo genera artefactos.
- Exclusión de firma de Ollama corregida para la ruta real `Contents/Resources`.

## Pendiente antes de declarar terminada la fase

1. Ejecutar las cinco builds actuales en la rama de revisión, sin fusionar ni publicar.
2. Confirmar tamaños Linux después de deduplicar; si algún paquete sigue por encima
   del límite, corregirlo sin retirar dependencias necesarias.
3. Instalación y arranque nativos Linux/macOS, firma y canal APPX correspondiente.
4. Actualización real desde 1.0.6 y ciclo AppImage descarga/instalación/reinicio.
   Se auditó el código del tag 1.0.6 y se probaron rutas de recuperación con fixtures;
   no se ejecutó una migración real de una instalación antigua.
5. Instalación posterior de Qwen3 e inferencia sobre los nuevos paquetes.

La actualización automática multiparte no está implementada. El script existente
se mantiene como respaldo para reconstrucción manual. ZIP, APPX y DMG conservan
actualización manual segura; no se presentan como formatos compatibles con NSIS
o Squirrel.Mac. Véase `PHASE2-DISTRIBUTION.md` para procedimientos y límites.
