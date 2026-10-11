# PbtAdmin — IA local de PbtModLauncherX, Fase 10.A

Fecha: 2026-10-10. Rama: `dev/upstream-v1.0.7`.
Base confirmada: `b4a2c98755f0887ab7095939d0f908425ceace7a`.
Versión oficial conservada: **1.0.6**.

## Resultado y alcance

Se reutilizan el chat, streaming, cancelación, agentes, historial, almacén seguro, herramientas y arquitectura de la Fase 10. No se crea otro asistente paralelo ni se activan cuentas, suscripciones o servicios de IA de XMCL.

El proveedor inicial es Ollama en `127.0.0.1:11434` cuando no hay un endpoint configurado. Las configuraciones de proveedores existentes se conservan. Hay que seleccionar un modelo instalado y compatible: no se inventa un modelo instalado ni se descarga uno al iniciar el launcher.

La implementación está validada mediante tests y servidores HTTP temporales con respuestas controladas. **No hay inferencia con Ollama real ni validación visual completa certificadas en este entorno.**

## Ollama y modelos

- Detección de ejecutable en PATH y ubicaciones habituales mediante lectura de archivos; nunca se ejecuta un comando para detectarlo. Un resultado desconocido por permisos no se presenta como ausencia confirmada.
- `GET /api/tags` comprueba que el servidor responde y lista modelos; `POST /api/show` verifica capacidades y contexto. Consultas locales con timeout de 3 segundos, sin arrancar modelos ni descargar recursos. Se inspeccionan hasta 32 entradas; la exploración ocurre al abrir los ajustes de IA o pulsar detección, sin bloquear la inicialización del launcher.
- Solo se ofrecen modelos con capacidades `completion` y `tools`, tamaño local positivo y sin metadatos de modelo remoto. Se excluyen modelos cloud, metadatos ilegibles y modelos solo de texto sin herramientas. La resolución vuelve a verificar el modelo elegido antes de usarlo.
- Recomendación heurística basada en RAM total y disponible. Se muestra el número real de CPU lógicas. No se inventan GPU, VRAM ni resultados de rendimiento.

| Modelo ofrecido para descarga | Estimación de descarga utilizada | RAM total mínima de la recomendación |
| --- | --- | --- |
| `qwen3:4b` | 2.600.000.000 bytes, aproximadamente 2,4 GiB | 8 GiB |
| `qwen3:8b` | 5.200.000.000 bytes, aproximadamente 4,8 GiB | 16 GiB |

Además se exige RAM libre de al menos 1,5 veces la estimación. Son orientaciones, no garantías: Minecraft, el contexto y otras aplicaciones también consumen memoria. La biblioteca oficial consultada publica aproximadamente 2,5 GB para 4b y 5,2 GB para 8b; la estimación 4b deja un pequeño margen. Las etiquetas pueden actualizarse y el progreso usa los tamaños recibidos de Ollama.

El selector admite otros modelos locales ya instalados si sus metadatos son compatibles. El asistente de descarga limita sus propuestas a los dos modelos revisados. No instala modelos cloud ni activa autenticación de Ollama cloud.

### Instalación y consentimiento

En Ajustes → IA local, el asistente guía al usuario a la página oficial de Ollama para instalar e iniciar el motor por su cuenta. Abrir el enlace requiere pulsar el botón. No se lanza un instalador, se ejecuta un shell ni se modifica el sistema automáticamente.

Para descargar un modelo, muestra nombre y tamaño estimado, exige marcar el consentimiento y pulsar «Descargar el modelo autorizado». La vista previa genera una autorización de un solo uso, ligada al modelo, con caducidad de cinco minutos. Cambiar modelo o reabrir el diálogo limpia el consentimiento. La API de descarga no se expone como herramienta del modelo.

`POST /api/pull` ejecuta la descarga solo tras esa aprobación. El progreso NDJSON se procesa de forma incremental; puede cancelarse. El lector tiene un timeout de inactividad de 60 segundos y la operación un límite de 30 minutos. Errores o fin incompleto no se presentan como éxito. Los reintentos requieren nueva aprobación y Ollama administra las capas parciales, sin borrarlas desde el launcher.

Tras instalar motor y modelo, el chat local solo necesita localhost. Ni el descubrimiento ni la inferencia local hacen consultas a XMCL. Sin el motor o con un modelo incompatible, se ofrece configuración, no una respuesta inventada.

### Inferencia y contexto

El renderer conserva el transporte virtual `agent.runtime`. El runtime traduce las peticiones del chat a la API nativa `POST /api/chat`, incluidas llamadas y resultados de herramientas, y convierte el NDJSON en SSE compatible con el chat existente. Se conserva Unicode entre fragmentos de IPC.

La API nativa establece `num_ctx` por petición, con un máximo de 8192 tokens y respetando un `num_ctx` explícito más pequeño del modelo. El límite de salida es acotado. No modifica Modelfiles ni copia modelos. Se desactiva el modo thinking para este flujo y no se guarda razonamiento privado adicional.

Se corrige la suposición heredada de contexto fijo de 256K: compactación y envío respetan el presupuesto elegido. Los resultados excesivos se limitan con un aviso; se pueden consultar rangos menores mediante herramientas. Si hace falta, se omiten turnos antiguos completos del contexto enviado, conservando el historial almacenado y avisando al modelo de que no debe inventar su contenido. Si las herramientas y el turno actual no caben, se informa del límite. No se promete que cualquier modelo pequeño admita todas las conversaciones o herramientas.

La cancelación del chat propaga la señal hasta la petición HTTP local. La inferencia tiene un límite total de diez minutos; no es una tarea necesaria para el inicio del launcher.

## Proveedores opcionales

| Proveedor | Transporte | Credenciales |
| --- | --- | --- |
| Ollama local | API nativa localhost, adaptada al chat existente | Sin clave ni cuenta XMCL |
| OpenAI | `https://api.openai.com/v1/chat/completions` | API Key personal |
| Anthropic | API nativa Messages, `https://api.anthropic.com/v1/messages`; adaptador SDK ya instalado | API Key personal en `x-api-key`, versión de API explícita |
| Gemini | Endpoint oficial compatible con OpenAI de `generativelanguage.googleapis.com` | API Key personal |
| Endpoint compatible con OpenAI | Endpoint introducido por el usuario, con streaming y herramientas | Clave propia para remoto; servidor loopback puede no necesitarla |

El usuario introduce un identificador de modelo disponible en su proveedor; no se inventan catálogos ni se ofrece acceso gratuito a servicios de pago. Las claves se guardan con `AgentApiKeyStore` y el almacén seguro existente del sistema, por proveedor/host. No se incluyen en settings JSON, logs o este informe ni se devuelven al renderer. El interceptor elimina las credenciales ficticias del transporte virtual y coloca la clave real únicamente para el proveedor seleccionado. Los endpoints nuevos rechazan credenciales en URL, consultas, fragmentos y HTTP remoto.

El cambio de endpoint limpia la entrada de clave y cancela escrituras pendientes del proveedor anterior. Los errores de guardado ya no inutilizan la cola de reintentos. Para un proveedor remoto, la interfaz advierte que el chat y los resultados de herramientas salen del equipo; se aplican sus tarifas y condiciones.

## Herramientas y seguridad

Se aprovechan herramientas reales conectadas a los servicios y al contexto de la instancia seleccionada:

- Instancias y runtime: listado, versiones de Minecraft/loaders, estado del manifiesto, diagnóstico de instalación y archivos pendientes.
- Equipo y Java: `system info`, Java local validado, memoria y diagnósticos de Java. Los datos proceden de servicios reales; no son valores generados por el modelo.
- Mods y recursos: listado local, dependencias, duplicados, compatibilidad, actualizaciones y shaderpacks/configuración de shaders.
- Evidencias: registros de ejecución, logs, crash reports y lecturas por rangos del VFS restringido.
- Documentación y UI: búsqueda de documentación incorporada y navegación/inspección permitidas, sin evaluar JavaScript arbitrario.
- Operaciones de gestión existentes: instalación, reparación, manifiestos, cambios de preferencias, mundos y recursos, tras confirmar una vista previa.

Se han cerrado rutas que antes modificaban datos sin confirmación: edición de instancia/CSS, staging, selección de Java/cuenta, creación de instancia, exportación/copia/enlace de mundos, activación de recursos y lanzamiento/parada del juego. Cada operación requiere una aceptación nueva; «permitir todo» deja de conceder permisos para cambios posteriores.

La IA no puede configurar `preExecuteCommand`, `prependCommand`, variables de entorno ni argumentos de ejecución/JVM, ni elegir un ejecutable Java arbitrario por `edit_instance`. Java se selecciona mediante el comando que valida la lista local del launcher. `vfs_shell` sigue siendo un parser de comandos virtuales permitidos, no un shell del sistema; no se añade `exec`, PowerShell ni ejecución de texto del modelo.

Logs, crash reports, resultados de herramientas y documentos externos se tratan como datos no confiables. El prompt exige evidencia real y descarta instrucciones incrustadas; las restricciones y confirmaciones se aplican en código. Los prompts antiguos guardados se actualizan para incluir las nuevas reglas. Estas medidas no garantizan que un modelo nunca se equivoque: el usuario debe revisar diagnósticos y cambios propuestos.

## Chat, historial e idiomas

Se conservan streaming, cancelación, conversación contextual y agentes de launcher/CSS/modpack. Se elimina el botón que todavía dirigía a la suscripción XMCL. «Abrir ajustes» lleva al panel local.

`agentHistoryEnabled` permite dejar de cargar/escribir nuevas conversaciones y artifacts de historial. El historial previo se conserva, sin borrado automático. Desactivarlo no impide las escrituras que el usuario autorice explícitamente como operaciones de gestión; las preferencias del proveedor siguen guardándose. El historial puede contener información del equipo aportada al chat: es local y no se promete cifrado adicional para esos archivos.

Se añaden 42 claves de interfaz en español de España, catalán e inglés, con paridad e interpolaciones verificadas. Español predeterminado, branding y demás idiomas permanecen.

## Validación y límites de las pruebas

- **252 tests aprobados, 0 fallidos, 25 archivos**: suites de agentes de runtime/UI y persistencia de configuración. Se prueban secretos por proveedor, historial opcional, consentimiento de un solo uso/caducidad, detección sin descarga, metadata incompatible/cloud, progreso corrupto, cancelación, contexto acotado, confirmaciones y rechazo de comandos.
- Integración HTTP real con servidor temporal aislado: endpoints de descubrimiento y progreso de descarga usan fixtures, sin motor Ollama ni descarga de pesos.
- Integración de SDK con servidor HTTP temporal: flujo completo renderer/SDK → interceptor runtime → Ollama nativo simulado o Messages de Anthropic simulado → streaming de texto y llamadas a herramientas. Comprueba cabeceras y ausencia de autorización XMCL. Son fixtures verificables del formato, no llamadas a cuentas reales.
- Typecheck de runtime API, runtime, Electron/preload, Keystone UI y DeskGap: correcto.
- Lint: sin errores; runtime conserva dos avisos previos de InstanceBlueprint, UI sin avisos nuevos.
- Validador de traducciones: es-ES y ca 2472/2472; sin errores de sintaxis, claves ausentes o interpolaciones. Otros idiomas conservados con 54 diagnósticos anteriores.
- Keystone UI: compilación correcta y bundle sin helpers huérfanos, 105 chunks.
- Electron, DeskGap y CLI oficial DevTools: bloqueados por `uv_os_get_passwd returned ENOMEM`, reproducible sin cargar el launcher. No se atribuye al código de IA.
- Ollama real: localhost no responde; no se encontró un comando/proceso accesible. No se certifica su ausencia en todo el sistema debido a las restricciones de acceso del entorno. **Cero modelos reales ejecutados o descargados en esta fase.**
- OpenAI, Anthropic y Gemini reales: no se han utilizado claves ni cuentas; inferencia y facturación reales pendientes. Gemini/OpenAI reutilizan el transporte compatible existente; no hay un test contra sus servidores.
- Interfaz real: la CLI falla antes de conectar. Quedan pendientes selector, asistente, aprobación/cancelación de descarga, chat, reanudación del historial y herramientas sobre una instancia temporal en la aplicación de desarrollo, a 1200×720 y 800×400 según AGENTS.md.
- Pendiente medir latencia, RAM/VRAM y calidad de diagnóstico con modelos reales. No se ha iniciado la siguiente fase ni la exportación de modpacks de servidor.

Los fallos iniciales de tests fueron expectativas antiguas de settings sin el nuevo campo; se actualizaron manteniendo las comprobaciones de persistencia. Los errores de tipos iniciales de fixtures y sus imports entre paquetes se corrigieron sin cambiar configuración compartida ni dependencias. Logs de validación: `temp/phase10a-*.log`.

## Referencias primarias consultadas

- [Ollama: listado de modelos](https://docs.ollama.com/api/tags), [chat nativo](https://docs.ollama.com/api/chat), [descarga](https://docs.ollama.com/api/pull) y [compatibilidad OpenAI/contexto](https://docs.ollama.com/api/openai-compatibility).
- [Qwen3 4b](https://ollama.com/library/qwen3:4b) y [Qwen3 8b](https://ollama.com/library/qwen3:8b): etiquetas existentes, herramientas y tamaños publicados.
- [Gemini: compatibilidad oficial con OpenAI](https://ai.google.dev/gemini-api/docs/openai).
- [Anthropic: Messages API](https://platform.claude.com/docs/en/api/typescript/messages/create); adaptador y SDK presentes en las dependencias existentes.

## Git y preservación

Commit local pendiente: Git rechaza crear `.git/index.lock` con `Permission denied`. No se han eliminado locks ni cambiado permisos, antivirus o ACL. La denegación efectiva del sandbox no se resuelve por declarar `.git` como ruta permitida.

Se conserva un ZIP verificado, manifiesto SHA-256 y parche en `temp/phase10a-preservacion-20261010.*`. El ZIP incluye nuevos y modificados; se comprueban tamaño y SHA-256 de cada entrada contra el original. El manifiesto enumera todas las rutas y el HEAD base. El parche contiene los archivos seguidos; los nuevos también se conservan en ZIP. No hace falta restaurar archivos para confirmar el árbol actual desde PowerShell normal.

Comando manual de una línea, desde el repositorio:

```powershell
if ((git branch --show-current) -ne 'dev/upstream-v1.0.7') { throw 'Rama incorrecta' }; $phase10aFiles = (Get-Content 'temp/phase10a-preservacion-20261010.manifest.json' -Raw | ConvertFrom-Json).files.path; git add -- $phase10aFiles; if ($LASTEXITCODE -eq 0) { git commit -m 'feat(ai): add consent-based local Ollama setup and independent providers' }
```

Master y backup conservan `c4b77e666f0b132e05e3ffff71d2728132a46a44`. Sin push, releases, tags o cambio de versión.

## Archivos de esta parte

- `PbtModLauncherX-Data/Modificaciones/PBTADMIN-IA-LOCAL-v1.0.7.md`
- `xmcl-keystone-ui/locales/ca.yaml`
- `xmcl-keystone-ui/locales/en.yaml`
- `xmcl-keystone-ui/locales/es-ES.yaml`
- `xmcl-keystone-ui/src/components/LocalAiSetup.vue`
- `xmcl-keystone-ui/src/composables/agent/compaction.test.ts`
- `xmcl-keystone-ui/src/composables/agent/compaction.ts`
- `xmcl-keystone-ui/src/composables/agent/confirm.test.ts`
- `xmcl-keystone-ui/src/composables/agent/confirm.ts`
- `xmcl-keystone-ui/src/composables/agent/local.ts`
- `xmcl-keystone-ui/src/composables/agent/localProviders.test.ts`
- `xmcl-keystone-ui/src/composables/agent/prompt.ts`
- `xmcl-keystone-ui/src/composables/agent/protocol.ts`
- `xmcl-keystone-ui/src/composables/agent/settings.ts`
- `xmcl-keystone-ui/src/composables/agent/toolPolicy.ts`
- `xmcl-keystone-ui/src/composables/agent/tools.ts`
- `xmcl-keystone-ui/src/views/AppAgentChat.vue`
- `xmcl-keystone-ui/src/views/SettingGeneral.vue`
- `xmcl-runtime-api/index.ts`
- `xmcl-runtime-api/src/entities/localAi.ts`
- `xmcl-runtime-api/src/entities/setting.schema.ts`
- `xmcl-runtime-api/src/entities/setting.ts`
- `xmcl-runtime-api/src/services/AgentService.ts`
- `xmcl-runtime/agent/AgentService.test.ts`
- `xmcl-runtime/agent/AgentService.ts`
- `xmcl-runtime/agent/ollama.test.ts`
- `xmcl-runtime/agent/ollama.ts`
- `xmcl-runtime/agent/ollamaChat.test.ts`
- `xmcl-runtime/agent/ollamaChat.ts`
- `xmcl-runtime/agent/pi-ai-subpaths.d.ts`
- `xmcl-runtime/agent/pluginAgentProtocol.ts`
- `xmcl-runtime/agent/providerProtocol.ts`
- `xmcl-runtime/settings/pluginSettings.test.ts`
