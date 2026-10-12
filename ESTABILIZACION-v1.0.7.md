# Estabilización de PbtModLauncherX v1.0.7

Informe de validación del 12 de octubre de 2026. Cambios locales, sin commit, push, modificación de etiquetas ni publicación. La versión permanece en **1.0.7**.

Ampliación de CI y publicación automática: véase [CORE-BUILD-Y-RELEASE-v1.0.7.md](CORE-BUILD-Y-RELEASE-v1.0.7.md). Incluye logs originales, corrección de siete pruebas y tres suites, publicación con omisión exitosa y protección frente a reemplazos. Última cobertura completa tras las pruebas reales de Qwen y LabyMod: **3362 pruebas superadas, cero fallos**, 394 archivos superados y 41 pruebas previamente omitidas. Type-check y lint superados; lint conserva dos advertencias existentes. El tick verde remoto queda pendiente de un push autorizado; no se han modificado releases reales.

## Causas y correcciones

| Área | Causa encontrada | Corrección |
| --- | --- | --- |
| Personaje | Ciclo de renderizado, carga asíncrona y reducción de movimiento podían dejar el visor sin un fotograma útil; los errores de textura no garantizaban un modelo alternativo. | Se conserva el visor WebGL interactivo, se carga Steve como respaldo, se descartan cargas obsoletas y se renderizan cambios de cámara incluso sin animación. Movimiento suave al pasar el ratón, desactivado en modo reducido. |
| Fondo personalizado | La migración omitía imágenes antiguas cuando la carpeta nueva ya contenía otros medios. Se confirmó una imagen existente únicamente en la carpeta anterior. | Copia exclusiva de archivos ausentes, sin borrar originales ni sobrescribir medios. Importación con nombres internos únicos, extensión y nombre original conservados; protección de imágenes compartidas entre temas. |
| Partículas, halo y vídeo | El montaje de fondos dependía de reducción de movimiento; Windows tenía esa preferencia activa. | Los fondos elegidos se montan y funcionan en modo normal. El modo PC del Gobierno de Venezuela conserva un fotograma estático y pausa el trabajo decorativo. También se pausa al ocultar la ventana o jugar. |
| Animaciones y GIF | Reglas globales desactivaban animaciones funcionales; los GIF se congelaban por preferencias ajenas al modo seleccionado. | Excepciones para indicadores esenciales. GIF animado con el modo reducido desactivado y fotograma estático al activarlo. El modo permanece desactivado por defecto. |
| Rendimiento | Fondos dibujados a la frecuencia completa de una pantalla de 144 Hz; comprobaciones de estado de Ollama repetían la validación costosa del bundle. | Dibujo de fondos limitado a 60 Hz usando el ciclo existente, sin temporizador adicional. Estado del runtime verificado reutilizado; validación íntegra conservada antes de iniciar un motor nuevo. |
| LabyMod 1.8.9 | Argumentos singleton heredados duplicados; combinación de bibliotecas LWJGL y JNA antiguas con reemplazos modernos de LabyMod. | Normalización selectiva de argumentos, directorio canónico de la instancia y filtrado de bibliotecas exclusivamente cuando LabyMod aporta el reemplazo. Argumentos repetibles preservados. |
| RAM manual | Un mínimo de memoria superior al máximo produce el error de JVM observado en la reproducción controlada. | Validación de MiB y ajuste del mínimo al máximo elegido. Se conserva el máximo solicitado, sin imponer RAM automática a todas las versiones antiguas. |
| Idioma del juego | Catalán se resolvía como `ca_CA`, no como el identificador Minecraft `ca_ES`. | Mapeo corregido, manteniendo el formato correspondiente a versiones antiguas y modernas. Sincronización comprobada al iniciar LabyMod. |
| Vista de instancias | Estado inicial compacto y contracción ligada a la altura de ventana. | Preferencia persistente completa/reducida, completa por defecto, reutilizando las vistas y controles existentes sin cambiar el tamaño de ventana. |
| Almacenamiento Qwen/Ollama | El almacenamiento administrado dependía de datos del perfil de aplicación. | Directorio predeterminado bajo la raíz de datos real: `PbtAdmin/Ollama/models`. Configuración administrada bajo la misma raíz, runtime ejecutable separado y rutas personalizadas respetadas. |
| Migración de modelos | Era necesario distinguir datos propios de instalaciones externas y conservar los anteriores al cambiar de raíz. | Copia con verificación SHA-256/tamaño, manifiestos al final, comprobación de espacio y permisos, registro de ubicación administrada. No se eliminan las copias anteriores ni se mueven instalaciones independientes. |
| Bloqueos Ollama | Un cierre forzado podía dejar un lease que impedía reiniciar. | Supervisor con propiedad identificada; recuperación sólo si los PID de padre, supervisor y motor atribuidos al lease están muertos. Registro anterior archivado. Los registros incompletos no se borran automáticamente. |
| Aviso de RAM PbtAdmin | Una lista vacía de recomendaciones tras un fallo del runtime se interpretaba como falta de memoria. | Se distinguen fallo del runtime, memoria insuficiente y almacenamiento insuficiente usando datos reales. |
| Amigos | Ausencia de presencia confirmada se mostraba como desconexión. La API nativa consultada publica además la presencia propia. | Estado desconocido cuando falta confirmación, sincronización y reconexión con protección frente a resultados obsoletos. Publicación propia sólo con consentimiento; se respeta privacidad existente. |
| Solicitudes | Había ambigüedad entre permitir recibir y aceptar solicitudes. | Valor permitido por defecto cuando no hay preferencia previa y el proveedor lo admite. Restricciones guardadas respetadas; textos aclaran aceptación manual. |
| Música | Nombres internos UUID, desplazamiento inicial que ocultaba el título y reglas que anulaban el movimiento. | Nombre original persistente, título visible desde el inicio y desplazamiento CSS cuando excede el espacio. Estático en modo reducido. Corregido también el bucle de shuffle con una sola canción. |

Todos los textos nuevos usan i18n, con español, catalán e inglés y los mecanismos de fallback existentes.

## Validaciones ejecutadas

- Batería consolidada: **29 archivos, 236 pruebas superadas y 1 omitida**. La omisión pertenece al caso existente Forge/LiteLoader.
- `pnpm check`: superado. `pnpm lint`: superado con dos advertencias anteriores en InstanceBlueprintsService.
- `git diff --check`: superado.
- Builds CJS/ESM de Core y gamesetting, CJS/ESM/browser de user y sus tres builds de declaraciones TypeScript: superados.
- Build de renderer: superado, 3014 módulos; comprobación de bundle sin helpers huérfanos. Hay advertencias de tamaño de chunks y externalización de una dependencia de proveedor.
- `pnpm --prefix=xmcl-electron-app compile`: main y preload superados. Después se reconstruyó y reinició el launcher de desarrollo, con renderer de localhost:3000.
- Visor WebGL: contexto válido, sin pérdida de contexto, en 1200×720 y 800×400. Capturas diferentes con movimiento suave normal e iguales en modo reducido.
- GIF de instancia: capturas de elemento con fotogramas alternos en modo normal; cuatro capturas iguales con modo reducido.
- Fondos: imagen importada con espacios/caracteres especiales en ambos temas y persistencia; recuperación del JPG antiguo confirmada; partículas con 97 elementos y píxeles visibles; halo con avance normal y pausa reducida; vídeo con readyState 4 y tiempo avanzando. Se restauraron las partículas y se retiró únicamente el vídeo temporal de prueba.
- Vista completa/reducida: selección y persistencia comprobadas en ventana mínima, controles manuales conservados.
- LabyMod 1.8.9: instancia temporal basada en un perfil instalado, arranque real con estado ready y Java 21, RAM manual 512/2048 MiB. Directorio aislado. Instancia temporal eliminada, bibliotecas y versiones compartidas preservadas.
- JVM Java 8: `-Xms512M -Xmx512M -version` funciona; el control `-Xms1024M -Xmx512M` reproduce el fallo esperado. No demuestra que cualquier otro fallo de una instancia antigua tenga esta misma causa.
- Idioma: options.txt de la instancia temporal pasó de ca_CA a ca_ES tras inicio con sincronización activada.
- Ollama oficial 0.34.0: arranque y parada reales, ruta temporal con espacios, portable y rechazo rápido de un segundo gestor (aproximadamente 0,48 ms). Recuperación real después de muerte forzada del padre y reinicio posterior, con lease anterior archivado.
- Tras el reinicio final, Ollama activo; RAM total detectada aproximadamente 31,9 GiB. Ruta personalizada de modelos dentro de la raíz de datos conservada y descarga inactiva. Se omite la ruta personal de este informe público.
- Amigos: consulta autenticada de dos contactos; ambos sin registros de presencia confirmada, mostrados como desconocidos. Consentimiento temporal retirado; restricciones anteriores de solicitudes preservadas.
- Música: nombre original cotejado con SHA-256 del archivo aportado, persistencia y movimiento observados; playlist más reciente del usuario conservada.

## Mediciones de rendimiento

Muestras de procesos del launcher de desarrollo, no un benchmark generalizable:

| Partículas normales, 15 s | Antes del límite | Después del límite |
| --- | ---: | ---: |
| CPU renderer, equivalente a un núcleo | 28,01 % | 16,35 % |
| CPU GPU process, equivalente a un núcleo | 31,03 % | 16,03 % |
| CPU main, equivalente a un núcleo | 0,73 % | 0,31 % |

Memoria después: renderer aproximadamente 542 MiB, GPU 200 MiB y main 391 MiB. Incluye costes propios del entorno de desarrollo y herramientas conectadas.

Muestra normal de 40 s: intervalo RAF p95 7 ms, máximo 7,2 ms, cero intervalos superiores a 50 ms y cero long tasks. Muestra reducida de 15 s: p95 7 ms, máximo 7,1 ms, cero long tasks, partículas estáticas. Se restauró el modo reducido desactivado. Estas muestras no garantizan ausencia de tirones en sesiones largas; no se obtuvo una reproducción completa del problema periódico previo.

## Pendientes y límites

- Qwen se descargó y ejecutó realmente durante la reanudación descrita abajo. Su funcionamiento técnico no garantiza respuestas correctas: una prueba aritmética respondió 407 a 17×23, cuyo resultado es 391.
- Falta transición online/offline real confirmada entre dos cuentas. La privacidad y clientes que no publican presencia pueden impedir obtener ese dato; no se inventan estados.
- La reanudación completó la descarga nueva de LabyMod y sus bibliotecas desde red, y su arranque real. Queda pendiente la conexión a servicios online de LabyMod, que devuelve `InvalidPermissions: Not authenticated or invalid scope`. No se lanzaron todos los demás cargadores; sus rutas se conservan y existen pruebas de resolución.
- No se cambió la skin remota de la cuenta para probar una subida real.
- Faltan pruebas nativas en Linux/macOS e instaladores finales. No se ha publicado ni sobrescrito una release.
- Registros de propiedad incompletos o bloqueos de recuperación interrumpida se conservan para revisión; no se eliminan archivos cuya propiedad no pueda demostrarse.
- La preferencia de accesibilidad de Windows sigue reduciendo otras animaciones decorativas conforme a sus reglas; indicadores funcionales y fondos explícitamente seleccionados reciben tratamiento específico.

## Reanudación: descarga e integración reales

- **Qwen3:** instalación mediante el diálogo real de PbtAdmin de `qwen3:4b-q4_K_M`, 2620788260 bytes, en una carpeta personalizada dentro de la raíz de datos. Se conserva la elección previa del usuario, cuya ruta se omite de este informe público. El valor predeterminado para configuraciones sin elección propia sigue siendo `PbtAdmin/Ollama/models`. Verificados los cinco blobs del manifiesto por tamaño y SHA-256. Reconocido después de reiniciar, sin segunda descarga. Inferencia real mediante la UI y el protocolo local del launcher; respuesta en catalán comprobada sin guardar mensajes de prueba en la conversación del usuario.
- **Personalidad:** la primera respuesta confundía el papel de PbtAdmin con la propiedad de PbtServers. Se aclaró el prompt existente: PbtAdmin es el asistente virtual y PbtinaDev es la creadora, propietaria y administradora. El lore se conserva. La repetición real respondió correctamente a ambas identidades. El error aritmético anterior se mantiene documentado, sin maquillar la salida del modelo.
- **LabyMod nuevo:** manifiesto oficial 4.6.27, commit `16d92a4d`, Minecraft 1.8.9; siete archivos de instalación y 130 bibliotecas descargadas en directorio aislado, sin reutilizar esas descargas. Bibliotecas copiadas a un namespace exclusivo y versión registrada con identificador único para no reemplazar perfiles del usuario. Arranque final desde el botón Inicia: PID 20036, estado ready, ventana nativa `Minecraft 1.8.9 | LabyMod 4.6.27`, RAM 512/2048 MiB y un único gameDir con espacios. Se cerró únicamente ese proceso de prueba mediante el servicio del launcher.
- **Comando Windows:** se reprodujo `spawn ENAMETOOLONG` con la duplicación legítima del classpath de LabyMod entre `-DlegacyClassPath` y `-cp`. Se conserva el primero y se transmite el classpath calculado mediante el entorno Unicode CLASSPATH cuando cabe en su límite; no se eliminan argumentos necesarios. Para classpaths ASCII mayores, Java 9+ usa un archivo de argumentos que contiene sólo el classpath, con limpieza al terminar. Prueba real Java 21: comando de 60064 caracteres reducido a 30088; carga de clases y directorio con `á`, `#` y espacios verificados semánticamente. Los classpaths individuales Unicode superiores a 30000 caracteres y Java 8 con classpaths individuales excesivos mantienen la limitación previa; no se afirma soporte universal para esas rutas extremas.
- **Minecraft antiguo:** Minecraft 1.8.9 abrió realmente con Java 8, PID 18744, ventana nativa `Minecraft 1.8.9`. Configuración manual mínimo 1024/máximo 512 generó efectivamente `-Xms512M -Xmx512M`; el máximo elegido se conserva. Sincronización real de `options.txt` a `ca_ES`.
- **Fondos:** después del cierre final de LabyMod se observaron 97 partículas, 62258 píxeles visibles y coordenadas cambiantes en 400 ms. Durante el juego permanecían dibujadas pero detenidas, según la pausa prevista. No se cambió a un fondo brillante.
- **Amigos:** dos consultas autenticadas a los dos contactos existentes. Restricción de solicitudes y publicación de presencia desactivada conservadas antes/después. Los dos estados permanecen UNKNOWN porque no hay confirmación del servicio; no se presentaron como offline. La transición entre cuentas sigue pendiente.
- **Conservación:** el usuario empezó a utilizar la conversación de la instancia nueva durante la validación. Por eso se conservan esa instancia, sus bibliotecas y sus conversaciones; no se aplica una limpieza que pueda borrar datos que ya está usando. El modelo descargado también permanece instalado.
- **Cierre de compilaciones:** nuevamente superados `pnpm check`, `pnpm lint`, `pnpm --parallel build:type`, `build:cjs`, `build:esm`, `build:browser`, `pnpm build:renderer` y `pnpm --prefix=xmcl-electron-app compile`. Suite completa 3362 pruebas en 31,99 s y cobertura 3362 en 41,56 s. `git diff --check` sin incidencias. Versiones y metadatos de actualización no modificados.

## Verificaciones externas que necesita completar el usuario

1. Con una segunda cuenta Microsoft con Minecraft Java y un contacto participante, consentir voluntariamente la publicación de presencia en ambos launchers. Comprobar conectado/desconectado y reconexión después de una interrupción de Internet. Restaurar las preferencias de privacidad previas después de probar. Con una cuenta nueva, comprobar la recepción permitida por defecto según soporte del proveedor, sin aceptar automáticamente solicitudes. No se han cambiado remotamente las restricciones existentes.
2. En la instancia nueva de LabyMod, resolver su sesión o permisos online y comprobar acceso a sus servicios y a un servidor. El proceso, la ventana y la carga de Minecraft ya están comprobados; la respuesta de autenticación del proveedor no está resuelta por el arranque.
3. Probar una subida real de skin y una capa disponible con la cuenta del usuario; comprobar actualización del visor. La validación local no sustituyó archivos de skin remotos.
4. Tras revisar y autorizar posteriormente commit/push, ejecutar Core Build y Build & Release en master. Verificar el resultado real de los cinco runners, paquetes nativos y comportamiento de publicación/omisión. Hasta esa autorización no hay tick verde remoto nuevo ni modificación de Releases.
5. Instalar y abrir los paquetes finales en Windows x64, Linux x64/ARM64 y macOS x64/ARM64; comprobar portable donde corresponda, almacenamiento, permisos y fondos/renderizado en esos entornos. El launcher real de desarrollo de Windows no equivale a probar todos los instaladores.
6. Completar una sesión prolongada de uso para evaluar el tirón periódico original, que no se reprodujo íntegramente en las muestras controladas. Las mediciones disponibles y la reducción de trabajo gráfico no prueban su ausencia universal.

El trabajo no se considera validado al 100 % mientras estas comprobaciones obligatorias sigan pendientes. No se requiere descargar de nuevo Qwen3 ni borrar la instancia que ya contiene conversación del usuario.

## Inventario de archivos

La lista siguiente incluye código, traducciones y pruebas locales de esta estabilización; no incluye outputs de compilación ignorados ni fixtures temporales.
- `packages/core/gameDirectory.test.ts`
- `packages/core/gameDirectory.ts`
- `packages/core/labyArguments.test.ts`
- `packages/core/labyArguments.ts`
- `packages/core/labyLibraries.test.ts`
- `packages/core/labyLibraries.ts`
- `packages/core/launch.test.ts`
- `packages/core/launch.ts`
- `packages/core/launchMemory.test.ts`
- `packages/core/launchMemory.ts`
- `packages/core/longClasspath.ts`
- `packages/core/longClasspath.test.ts`
- `packages/core/version.ts`
- `packages/gamesetting/index.test.ts`
- `packages/gamesetting/index.ts`
- `packages/user/mojang.ts`
- `packages/user/mojangPresence.test.ts`
- `xmcl-keystone-ui/locales/ca.yaml`
- `xmcl-keystone-ui/locales/en.yaml`
- `xmcl-keystone-ui/locales/es-ES.yaml`
- `xmcl-keystone-ui/src/assets/lowResources.css`
- `xmcl-keystone-ui/src/components/AppAudioPlayer.vue`
- `xmcl-keystone-ui/src/components/AppearanceItems.vue`
- `xmcl-keystone-ui/src/components/backgroundFrame.test.ts`
- `xmcl-keystone-ui/src/components/backgroundFrame.ts`
- `xmcl-keystone-ui/src/components/halo.ts`
- `xmcl-keystone-ui/src/components/Halo.vue`
- `xmcl-keystone-ui/src/components/LocalAiSetup.vue`
- `xmcl-keystone-ui/src/components/MinecraftFriendRow.vue`
- `xmcl-keystone-ui/src/components/particle.js`
- `xmcl-keystone-ui/src/components/Particles.vue`
- `xmcl-keystone-ui/src/components/SkinView.vue`
- `xmcl-keystone-ui/src/components/UserSkin.vue`
- `xmcl-keystone-ui/src/components/UserSkinLibraryDialog.vue`
- `xmcl-keystone-ui/src/composables/agent/modelResources.test.ts`
- `xmcl-keystone-ui/src/composables/agent/modelResources.ts`
- `xmcl-keystone-ui/src/composables/agent/modelStorageError.test.ts`
- `xmcl-keystone-ui/src/composables/agent/modelStorageError.ts`
- `xmcl-keystone-ui/src/composables/agent/qwenInstaller.ts`
- `xmcl-keystone-ui/src/composables/agent/requestPolicy.ts`
- `xmcl-keystone-ui/src/composables/agent/requestPolicy.test.ts`
- `xmcl-keystone-ui/src/composables/instanceIconSource.test.ts`
- `xmcl-keystone-ui/src/composables/instanceIconSource.ts`
- `xmcl-keystone-ui/src/composables/minecraftFriends.test.ts`
- `xmcl-keystone-ui/src/composables/minecraftFriends.ts`
- `xmcl-keystone-ui/src/composables/minecraftPresence.test.ts`
- `xmcl-keystone-ui/src/composables/minecraftPresence.ts`
- `xmcl-keystone-ui/src/composables/theme.ts`
- `xmcl-keystone-ui/src/composables/userSkin.ts`
- `xmcl-keystone-ui/src/util/mediaTitle.test.ts`
- `xmcl-keystone-ui/src/util/mediaTitle.ts`
- `xmcl-keystone-ui/src/views/AppBackground.vue`
- `xmcl-keystone-ui/src/views/AppMinecraftFriendsDialog.vue`
- `xmcl-keystone-ui/src/views/MeProfilePanel.vue`
- `xmcl-keystone-ui/src/views/SettingGlobalUI.vue`
- `xmcl-keystone-ui/src/windows/main/App.vue`
- `xmcl-runtime/agent/AgentService.test.ts`
- `xmcl-runtime/agent/AgentService.ts`
- `xmcl-runtime/agent/managedOllama.test.ts`
- `xmcl-runtime/agent/managedOllama.ts`
- `xmcl-runtime/agent/modelStorageMigration.test.ts`
- `xmcl-runtime/agent/modelStorageMigration.ts`
- `xmcl-runtime/agent/modelStoreLease.test.ts`
- `xmcl-runtime/agent/modelStoreLease.ts`
- `xmcl-runtime/agent/ollamaSupervisor.test.ts`
- `xmcl-runtime/agent/ollamaSupervisor.ts`
- `xmcl-runtime/instance/InstanceThemeService.test.ts`
- `xmcl-runtime/instance/InstanceThemeService.ts`
- `xmcl-runtime/settings/pluginSettings.test.ts`
- `xmcl-runtime/theme/importMedia.test.ts`
- `xmcl-runtime/theme/importMedia.ts`
- `xmcl-runtime/theme/migrateMedia.test.ts`
- `xmcl-runtime/theme/migrateMedia.ts`
- `xmcl-runtime/theme/ThemeService.ts`
- `xmcl-runtime/user/MinecraftFriendsService.test.ts`
- `xmcl-runtime/user/MinecraftFriendsService.ts`
- `xmcl-runtime-api/src/entities/setting.schema.ts`
- `xmcl-runtime-api/src/entities/setting.ts`
- `xmcl-runtime-api/src/services/AgentService.ts`
- `xmcl-runtime-api/src/services/MinecraftFriendsService.ts`
- `xmcl-runtime-api/src/services/ThemeService.ts`
