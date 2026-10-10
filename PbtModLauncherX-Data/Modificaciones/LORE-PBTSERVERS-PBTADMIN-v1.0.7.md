# Fase 15.7 — Lore local de PbtServers en PbtAdmin

Revisión: 11 de octubre de 2026. Versión 1.0.7 en desarrollo, no publicada.
Rama: `dev/upstream-v1.0.7`. HEAD inicial: `c99d1516`.

## Estado inicial y fuentes

La corrección automática de PbtAdmin estaba confirmada y no había cambios de código pendientes. Sí había un archivo aportado por la usuaria, todavía sin seguimiento: `PbtModLauncherX-Data/Lore/Fuentes/LA_HISTORIA_DE_JUAND.rtf`.

El RTF está presente y se extrajo mediante `System.Windows.Forms.RichTextBox.LoadFile`, sin subirlo a proveedores ni ejecutar instrucciones del documento. Su SHA-256 es `c032e2a977ecb0121957d51811a218186bc3e81d45ac58f7e1bb98770d408ae9`. El original se conserva sin modificaciones. Contiene narración subjetiva, citas y referencias privadas: **no se incorpora a Git, al índice de PbtAdmin ni a la distribución**. `.gitignore` excluye los RTF de esa carpeta. Solo se distribuyen resúmenes revisados; el texto intermedio de extracción se elimina al terminar la revisión.

Fuentes registradas en `PbtModLauncherX-Data/PbtAdmin/knowledge/sources.json`:

- `maintainer-157`: información y límites proporcionados por la creadora en esta fase. No es corroboración pública independiente.
- `juand-rtf`: narración comunitaria local, identificada por hash. Autoría no inequívocamente acreditada; queda pendiente. No se atribuye a PbtinaDev por suposición.
- `gamejolt-reference`: https://gamejolt.com/games/1091802/1091802 . La consulta web no consiguió acceder a la página; no se presenta como verificación de sus contenidos. Las nueve partes FNF proceden de las directrices de la creadora.
- Se conservan las fuentes anteriores, sus atribuciones y limitaciones.

## Contenido incorporado

La base pasa de 9 a **24 documentos Markdown** con frontmatter, identificadores estables y referencias de procedencia.

Perfiles independientes: PbtinaDev / Pbt / Alicia BT, 0ftome101 / 0ftome / Oftome, JuanD, Thiamar22OMG / Thiamar, ItsBatsy / Batsy, Caus, ORmc12, MrBruno, Lozeer_55, Akuma, ElGordas, PbtGamer, Potato4K, Iván y Héctor.

Se distinguen los roles comunitarios aportados por la creadora de las representaciones de FNF. 0ftome y Thiamar figuran como builders; la incapacidad humorística de dejar de construir corresponde a la parodia. Caus/Engineer, ElGordas/policía y PbtGamer/hacker no se convierten en profesiones ni acusaciones reales. Los campos sin fuentes quedan pendientes. PbtinaDev se describe en femenino y PbtAdmin nunca se confunde con ella.

`juand-history.md` recoge únicamente la cronología depurada atribuida al RTF:

| Fecha narrada | Contenido conservado |
| --- | --- |
| Inicio sin fecha precisa | Testigos de Jennos y Sage, reencuentro en Sixcraft, conversaciones y memes comunitarios. |
| 2020-08-04 | Imagen del circo en Sixcraft, contextualizada como meme. |
| 2020-08-16 | Salida narrada de JuanD de Sixcraft. |
| 2020-08-18 | Interacción en el servidor de seguidores con intermediación atribuida a Batsy. |
| 2020-09-06 | Breve interacción narrada en voz en Team Crystal. |
| 2020-09-14 | Among Us con Pbt, Batsy, Thiamar y JuanD; el narrador declara no haber estado presente. |
| Final de 2020–2021 | Se reconoce la continuación del relato; se excluyen investigaciones de identidades y datos privados. |

No se han corroborado independientemente estas fechas. No se incorporan edades, colegios, ubicaciones personales, parentescos especulados, enlaces a cuentas privadas ni insultos discriminatorios. Las sospechas sobre cuentas alternativas se describen solo como hipótesis no demostradas, sin conservar asociaciones identificativas. La autoría y los detalles posteriores seguros requieren fuentes adicionales.

## Arquitectura y recuperación

Se reutilizan `AgentDocumentStore`, `AgentService.searchDocuments`, las herramientas de documentos y la inyección de evidencia de `local.ts`. No se crea otro sistema de memoria ni un índice dependiente de red.

La estructura se mantiene plana bajo `PbtModLauncherX-Data/PbtAdmin/knowledge/`, porque el lector y el empaquetado existentes ya incluyen sus Markdown. Los perfiles utilizan `character-*.md`, identificadores `pbt-character-*` y alias en tags; JuanD conserva `pbt-juand`. La cronología utiliza `pbt-juand-history`. El índice general y el documento de FNF conservan sus identificadores anteriores.

Cambios en recuperación:

- Normalización de alias 0ftome/Oftome, Thiamar y Batsy antes de consultar.
- Normalización de fechas solicitadas en agosto/septiembre de 2020–2021, en español, catalán e inglés, y fechas numéricas día/mes/año.
- Prioridad de párrafos con la fecha exacta. Cuando existe una coincidencia de fecha, no se añade otra fecha distinta al fragmento.
- Hasta dos párrafos pertinentes por documento, manteniendo el máximo de 1.200 caracteres; la evidencia sigue limitada a tres documentos.
- Contenido identificado como datos no confiables, nunca instrucciones ni resultados de herramientas. No se carga toda la historia en cada conversación.
- Política de identidad v2: mantiene la identidad y los límites de permisos, prohíbe presentarse como testigo presencial y distingue narración subjetiva de verificación independiente. Los historiales existentes no se borran.

La recuperación se realiza antes de la petición del agente principal y también sirve para chat sin herramientas. Los proveedores externos mantienen su arquitectura; únicamente recibirían los fragmentos revisados enviados como contexto, nunca el RTF original. Ollama no necesita Internet para consultar esta base o inferir con un modelo ya disponible.

El empaquetado existente copia estos archivos a `resources/pbtadmin-knowledge`, separado de los pesos y del perfil. No requiere cambiar configuraciones globales de compilación. No se alteran runtime, modelos, selección del usuario, credenciales ni almacenamiento portable.

## Validaciones

| Comprobación | Estado | Evidencia |
| --- | --- | --- |
| Regresiones de documentos, alias, fechas, identidad, privacidad, AgentService, motor y sincronización | APROBADA | 69 tests, 0 fallidos; `temp/phase157-tests.log`. |
| Typecheck completo `pnpm check` | APROBADA | `temp/phase157-check.log`; salida 0. |
| Lint completo `pnpm lint` | APROBADA | Salida 0; dos advertencias preexistentes en InstanceBlueprintsService; `temp/phase157-lint.log`. |
| Keystone UI `pnpm build:renderer` | APROBADA | Recompilada después de la corrección semántica, 110 chunks sin helpers huérfanos; `temp/phase157-renderer.log`. |
| Recuperación local usando las funciones productivas y documentos reales | APROBADA | `node scripts/validate-pbtadmin-lore.mjs --retrieval-only`; comprobadas preguntas de 0ftome, fecha 2020-09-14 y creadora; JSON UTF-8 en `temp/phase157-lore-*.result.json`. No es inferencia. |
| Arranque de desarrollo con perfil aislado | BLOQUEADA | `temp/phase157-dev-main.log`: ENOMEM en `os.userInfo()` de tsx antes de iniciar Electron. |
| Reconstrucción portable Electron | BLOQUEADA | `temp/phase157-electron.log`: mismo ENOMEM; no se ha generado un portable actualizado en esta fase. |
| Inferencia real con lore fuente nuevo y runtime empaquetado existente | FALLIDA en revisión semántica / BLOQUEADA en cierre | Qwen3 respondió auténticamente sobre 0ftome con 284 chunks, puerto 60465. Reconoció builder, alias y diferencia con JuanD, pero concluyó incorrectamente que el miembro era totalmente ficticio. Se corrigió la política y el fragmento; la nueva inferencia está pendiente. El cierre devolvió `ollama_cleanup_unconfirmed`, no éxito. |
| Chat e interfaz real del launcher con este lore | NO EJECUTADA | El arranque del entorno está bloqueado. Una prueba por script no sustituye esta comprobación. |
| Linux/macOS nativos y persistencia portable tras mover carpeta | NO EJECUTADA | No hay entornos nativos ni paquete reconstruido validado en esta fase. |

El error ENOMEM también se reprodujo con `node -e "console.log(require('os').userInfo())"`, fuera del launcher. No se modifica código correcto para ocultarlo.

### Resultado auténtico y límites del ensayo

Evidencia: `temp/phase157-lore-30952836-d4f8-4511-a9ef-4dbb4636c81e.result.json`. Modelo `pbtadmin-qwen3:4b-q4_K_M`, familia qwen3, 4.0B, Q4_K_M; endpoint `http://127.0.0.1:60465`; conocimiento procedente de los archivos fuente, **no de un paquete reconstruido**. La respuesta utilizó información de los fragmentos, pero no satisfizo completamente la distinción de rol comunitario y parodia ni la obligación de citas. La política ahora exige presentar primero el rol comunitario atribuido, separar después la representación humorística y no deducir que el miembro es imaginario. El perfil de 0ftome hace explícita esa diferencia y la recuperación incluye su parte FNF. No se presenta esa corrección como validada por otra inferencia.

Tras el cierre fallido se observó `llama-server.exe`, PID 7312, iniciado a las 01:21:13, en los recursos del paquete. El puerto 60465 ya no aparecía escuchando, pero esto no acredita limpieza de todo el árbol. `Get-CimInstance Win32_Process` devolvió acceso denegado al intentar comprobar su línea de comandos. No se termina un proceso sin confirmar su pertenencia a la prueba ni se vuelve a iniciar otro modelo. La inspección y limpieza deben completarse fuera del sandbox: verificar que la línea de comandos contiene el perfil `phase157-lore-30952836-d4f8-4511-a9ef-4dbb4636c81e`, la ruta del binario y la fecha de inicio antes de detenerlo. No se alteraron procesos de instalaciones externas. El validador registra ahora eventos del gestor y PIDs para futuras pruebas.

## Validación reproducible fuera del sandbox

`scripts/validate-pbtadmin-lore.mjs` utiliza las funciones productivas de búsqueda, evidencia, prompt y puente de chat Ollama. Por defecto exige que los documentos del paquete coincidan por SHA-256 con los actuales: rechaza un portable antiguo. No descarga modelos ni utiliza perfiles personales. La inferencia usa el modelo de fábrica realmente registrado y el endpoint dinámico del gestor; las respuestas auténticas y el cierre se guardan en JSON UTF-8 para revisión semántica.

Comandos desde PowerShell normal, en la raíz:

```powershell
node scripts/validate-pbtadmin-lore.mjs --retrieval-only
node scripts/validate-pbtadmin-lore.mjs
```

La segunda orden requiere reconstruir antes el paquete actual con el procedimiento existente. `--source-knowledge` permite probar la base fuente con el runtime empaquetado, pero registra expresamente que el conocimiento no procede de un paquete nuevo y no valida la distribución. `--question=...` limita la prueba a una pregunta. No se deben interpretar respuestas generadas como aprobadas semánticamente sin revisarlas.

Helper preparado para esta fase, con sintaxis PowerShell validada:

```powershell
Set-Location 'G:\Documentos\Compilar-Libs-Dev\PbtModLauncherX-Dev'; & './temp/phase157-validacion-externa.ps1'
```

Primero inspecciona el posible PID residual 7312 y solo lo detiene si el ejecutable y la línea de comandos identifican el perfil exacto de esta prueba; si no coincide, se detiene sin matar procesos ajenos. Después reconstruye UI/Electron, ejecuta las tres preguntas por el puente productivo contra los recursos recién empaquetados y abre/reabre un perfil visual aislado. Conserva y restaura las variables de entorno de la sesión. No descarga pesos ni publica paquetes. El helper requiere cerrar previamente cualquier launcher abierto.

Preguntar visualmente por 0ftome, JuanD, la fecha de Among Us, Batsy y la creadora; comprobar atribuciones, ausencia de datos privados y respuestas recibidas. Cerrar y reabrir para verificar historial según su configuración. No reutilizar perfiles personales. Devolver `temp/phase157-inferencia-externa.log`, los JSON UTF-8 indicados en la salida y el resultado visual; no compartir el RTF original ni datos del perfil personal.

## Ampliación: ergonomía del chat

La revisión encontró dos causas en la disposición real: `AppOmniDialog.vue` aplica un `translateY(clamp(24px, 5vh, 48px))` al contenedor de 85vh y coloca el compositor compartido antes del contenido. El desplazamiento empuja el conjunto hacia el borde inferior. No se cambia el tamaño de fuente como sustituto de corregir la estructura.

Cambios implementados:

- `AppOmniDialog.vue`: conversación antes del compositor en el DOM del agente. La búsqueda de órdenes mantiene visualmente su entrada arriba mediante una regla específica de ese modo. El destino Teleport del selector y las acciones se conserva, sin duplicar inputs.
- Panel de chat de hasta 900 px, con columna de lectura de 760 px, centrado por el diálogo de Vuetify. Altura `min(78dvh, 760px)` y márgenes/padding fluidos; desaparece el desplazamiento fijo únicamente en modo agente. Por debajo de 560 px de altura se aprovecha más espacio, con padding reducido. No se cambian las dimensiones mínimas de la ventana del launcher.
- Compositor estable debajo de la conversación, con hasta cuatro líneas de crecimiento y controles visibles. Enviar tiene nombre accesible localizado en es-ES, ca y en; Detener conserva su acción y etiqueta.
- Estado vacío: saludo y sugerencias centrados en el espacio restante; si no caben, permanecen desplazables y se abre al principio del contenido. Con pocos mensajes se utiliza alineación normal arriba, sin rellenos que los empujen al fondo. Una conversación larga se desplaza verticalmente; bloques de código y tablas conservan su desplazamiento horizontal propio.
- Seguimiento del transcript únicamente mientras el lector está al final. Se conserva su decisión de leer mensajes anteriores durante streaming. `isTranscriptNearEnd` centraliza el umbral de 32 px. Un ResizeObserver sigue cambios de tamaño solo cuando corresponde, y VueUse lo libera al desmontar el componente. No se añade desplazamiento suave ni animaciones por token.
- Transcript con rol `log`, etiqueta, foco visible y estado ocupado durante generación; selección y copia no se interceptan. Se conserva Enter/Shift+Enter, Escape, IME, confirmaciones y acciones existentes.
- Fondo del panel opaco con colores del tema. El modo de bajos recursos y `prefers-reduced-motion` desactivan además la transición del diálogo; las reglas existentes eliminan sombras y efectos en modo reducido. No se modifican Ollama, Qwen3, modelos, proveedores ni sus preferencias.

### Validación de la ampliación

| Comprobación | Estado | Evidencia |
| --- | --- | --- |
| Geometría de seguimiento, teclado/IME, estructura Vue, identidad/lore, motor, sincronización y modo reducido | APROBADA | 84 tests, 0 fallidos, 10 archivos; `temp/phase157-chat-tests.log`. Son regresiones automatizadas, no validación visual. |
| Typecheck y lint completos | APROBADA | `temp/phase157-chat-check.log` y `temp/phase157-chat-lint.log`, salida 0; permanecen las advertencias preexistentes. |
| Catálogos es-ES/ca/en | APROBADA | Validador de traducciones: sin errores de sintaxis ni fallos; `temp/phase157-chat-translations.log`. |
| Keystone UI | APROBADA | 30,80 s, 110 chunks sin helpers huérfanos; `temp/phase157-chat-renderer.log`. |
| Launcher real de desarrollo | BLOQUEADA | `temp/phase157-chat-dev-main.log`, ENOMEM antes de iniciar Electron; también reproducido con `os.userInfo()`. |
| Vacío, un mensaje, historial largo, código, streaming y scroll manual en interfaz real | NO EJECUTADA | No se declara ausencia visual de superposición a partir de tests o compilación. |
| Temas claro/oscuro; es-ES/ca/en; pantallas y escalados | NO EJECUTADA | Pendiente comprobar 1200×720, mínimo 800×400, 1366×768, 1920×1080/maximizada y escalado 125 %/150 % en el entorno disponible. No se prueban ventanas por debajo del mínimo soportado. |

Para reconstruir y comprobar solo la interfaz desde PowerShell normal:

```powershell
Set-Location 'G:\Documentos\Compilar-Libs-Dev\PbtModLauncherX-Dev'; & './temp/phase157-validacion-externa.ps1' -ChatLayoutOnly
```

El helper omite la inferencia por script en este modo, conserva la inspección segura del posible proceso residual y abre un perfil aislado tras reconstruir. Comprobar saludo centrado, lectura de uno y muchos mensajes, bloques de código, compositor estable, Enviar/Detener, foco, desplazamiento hacia arriba durante streaming, cambio de tamaño, temas, idiomas, modo reducido y reapertura. No utilizar perfiles personales ni presentar esa prueba como realizada antes de devolver los resultados.

## Archivos y cierre

Cambios: `.gitignore`; los índices, fuentes y perfiles de `knowledge/`; `xmcl-runtime/agent/documents.ts`; `xmcl-keystone-ui/src/composables/agent/knowledge.ts` y `prompt.ts`; regresiones en `agentDocuments.test.ts` y `pbtAdmin.test.ts`; `scripts/validate-pbtadmin-lore.mjs`; este informe.

La ampliación añade cambios en `AppOmniDialog.vue`, `AppAgentChat.vue`, `composables/agent/scroll.ts`, su test y los tres catálogos de idioma. Se conservan íntegros los cambios de lore pendientes anteriores.

Git: se mantiene la rama y versión. `git add` ha fallado con `Unable to create .../.git/index.lock: Permission denied`; no se ha modificado el índice, eliminado locks ni cambiado ACL. Commit pendiente sobre `c99d1516`. Preservación anterior de lore: `temp/phase157-preservacion-20261011.*`. Preservación conjunta actualizada de lore y ergonomía: `temp/phase157-chat-preservacion-20261011.zip`, `.manifest.json` y `.patch`, con archivos nuevos incluidos y verificación SHA-256. Se excluyen pesos, binarios, temporales y el RTF privado, que permanece local e intacto. Sin push, merge, tags ni release. No se declara validado un portable nuevo ni finalizada la comprobación visual hasta ejecutarlos realmente.
