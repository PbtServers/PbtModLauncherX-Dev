# Fase 2: resultados y revisión pendiente

Los cambios se preparan en la rama de revisión `phase2/packaging-validation`.
No se modifican releases públicas, etiquetas ni notas de release. Esta fase
todavía requiere builds actuales en GitHub Actions y pruebas nativas en Linux
y macOS; esta sección se actualizará con sus resultados reales.

## Estado al integrar la Fase 2 en master

Por autorización expresa del mantenedor, se integra el historial de la rama sin
esperar a las compilaciones remotas. **Las cinco builds finales siguen pendientes
de confirmación y no se consideran validadas.** Un push normal solo compila:
el trabajo de release exige `workflow_dispatch`, `prepare_draft: true`, un tag
explícito y una release que siga siendo borrador. No se publican ni modifican
automáticamente la release v1.0.7, sus archivos, notas o etiquetas.

Comprobaciones locales esenciales superadas: 264 pruebas en 28 archivos,
`pnpm check`, `pnpm lint` y carga del verificador mediante `tsx`. El último
adaptador solo corrige la interoperabilidad CommonJS/ESM del script de CI;
su comprobación previa también se ejecutará en los runners Node 24.

La ejecución [38187710243](https://github.com/PbtServers/PbtModLauncherX-Dev/actions/runs/38187710243)
pasó Windows y macOS Apple Silicon. macOS Intel agotó el heap de `vue-tsc`,
corregido con 4 GiB únicamente en el paso de type-check/lint. Los dos Linux
compilaron los cinco formatos y comprobaron tamaños/checksums, pero fallaron
al cargar el script de extracción por interoperabilidad de módulos. Ese error
está corregido y se añade una comprobación de imports antes del empaquetado.

Los tamaños Linux medidos en esa ejecución, en bytes, son:

| Arquitectura | AppImage | DEB | RPM | TAR.XZ | Pacman |
|---|---:|---:|---:|---:|---:|
| x64 | 1824990801 | 1546139376 | 1481413725 | 1477112980 | 1506366696 |
| ARM64 | 1921314433 | 1658187956 | 1595110945 | 1597224080 | 1620163100 |

Todos están por debajo de 2 GiB. Se conservaron 17 alias en cada arquitectura:
1.487.906.728 bytes duplicados en x64 y 1.550.231.408 en ARM64. Estos resultados
no sustituyen la extracción y validación final de bibliotecas, que sigue pendiente.

La ejecución de revisión [38191562193](https://github.com/PbtServers/PbtModLauncherX-Dev/actions/runs/38191562193)
corresponde a `db8ad242`, con el adaptador corregido. Las ejecuciones anteriores
en cola que fueron sustituidas o canceladas no cuentan como validación.
El push a master iniciará otra ejecución sobre el commit integrado.

No se conoce un fallo crítico reproducible que impida usar el launcher Windows
comprobado. Siguen sin probarse las instalaciones completas Linux/macOS, la firma
y notarización macOS, el canal firmado de APPX y la actualización real desde
1.0.6/ciclo AppImage. Las actualizaciones ZIP/APPX/DMG siguen siendo manuales.
No se declara completada toda la Fase 2 ni se presentan esas pruebas como superadas.

## Validaciones locales

- Batería local actual: **28 archivos, 264 pruebas superadas**, ninguna omitida.
  Las ejecuciones anteriores de Actions contenían 263; se añadió una prueba del feed.
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
- Comprobación posterior real de Qwen3 en Windows: consentimiento explícito en la
  interfaz, descarga de `qwen3:4b-q4_K_M` y progreso de 1.489.174.419 sobre
  2.620.774.592 bytes. El chat se activó automáticamente sin reiniciar y produjo
  respuestas en español identificando PbtAdmin y PbtinaDev.
- Tras reiniciar, los seis archivos de pesos/manifiesto conservaron sus SHA-256
  (2.620.789.119 bytes). El bloqueo de proceso `.pbtadmin-engine.lock` se excluyó
  de la comparación porque contiene el PID de cada arranque. El chat reconoció
  el modelo instalado sin pedir otra descarga.
- Se creó y seleccionó `Pbt Phase2 Model Test`, una instancia vacía sin descargar
  Minecraft. Su conversación real se restauró en la interfaz tras reiniciar.
  En el perfil sin instancia, la conversación se conservó en el backend, aunque
  no apareció inicialmente en el chat; no se declara validada su recarga visual.
- La descarga acabó antes de pulsar cancelar: cancelación/reintento están cubiertos
  automáticamente, pero esta comprobación manual no los ejerció.
- Los recursos temporales se eliminaron y se reabrió un perfil limpio para comprobar
  ausencia de cuentas e instancias de prueba. No se tocaron datos personales.

Estos flujos completos se probaron con la penúltima build Windows. El filtro final
de prereleases tiene pruebas automatizadas y está compilado en la última build.
La instalación e inferencia reales de Qwen3 se probaron con esa última build local
Windows. Los commits posteriores solo modifican un fixture y la memoria de CI;
los prompts, el lore, el instalador del modelo y el sistema de noticias de la
Fase 1 no se alteraron durante estas pruebas.
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
  confirma almacenamiento y extracción de los alias. Los tamaños Linux ya medidos
  están bajo el límite; falta completar la validación de extracción en los runners.
- Nombres correctos de paquetes Linux y selección del AppImage de su arquitectura;
  descarga completa, comprobaciones de integridad y enlace manual oficial.
- Borradores/prereleases excluidos cuando corresponde y selección de versión más
  reciente entre el JSON histórico y GitHub.
- Los tamaños declarados por los feeds y sus campos legacy `path`/`sha512` se
  contrastan con los archivos y entradas `files`; una prueba confirmó que el
  verificador anterior aceptaba un tamaño incorrecto y ahora lo rechaza.
- La prueba portable usa rutas absolutas en todos los sistemas. macOS Intel
  agotó el heap predeterminado de Node en `vue-tsc`; el paso de type-check/lint
  dispone ahora de 4 GiB sin cambiar opciones del compilador ni del empaquetado.
- Manifiestos separados por arquitectura y reunión explícita de ambos feeds macOS.
- Preparación exclusiva de borradores, con comprobación de cinco builds, sin publicar,
  sin sobrescribir archivos ni borrar notas. Push normal solo genera artefactos.
- Exclusión de firma de Ollama corregida para la ruta real `Contents/Resources`.

## Pendiente antes de declarar terminada la fase

1. Confirmar las cinco builds finales del commit integrado en master, sin publicar.
2. Confirmar tamaños Linux después de deduplicar; si algún paquete sigue por encima
   del límite, corregirlo sin retirar dependencias necesarias.
3. Instalación y arranque nativos Linux/macOS, firma y canal APPX correspondiente.
4. Actualización real desde 1.0.6 y ciclo AppImage descarga/instalación/reinicio.
   Se auditó el código del tag 1.0.6 y se probaron rutas de recuperación con fixtures;
   no se ejecutó una migración real de una instalación antigua.
5. Instalación posterior de Qwen3 e inferencia en Linux/macOS; Windows local sí se
   ejerció realmente, sin presentar ese resultado como una instalación desde el
   artefacto descargado de Actions.

La actualización automática multiparte no está implementada. El script existente
se mantiene como respaldo para reconstrucción manual. ZIP, APPX y DMG conservan
actualización manual segura; no se presentan como formatos compatibles con NSIS
o Squirrel.Mac. Véase `PHASE2-DISTRIBUTION.md` para procedimientos y límites.
