# Fase 1 — Qwen3 4B bajo demanda

Validación local del 11 de octubre de 2026. Sin commit, push, etiquetas, releases ni cambios en workflows de GitHub Actions.

## Implementación

- Electron y DeskGap incluyen el runtime Ollama verificado, sin validar ni copiar el almacén `ollama-model`. Los preparadores y validadores de semillas históricas permanecen disponibles; el arranque del launcher no requiere una semilla.
- Se mantienen las recetas Windows x64, Linux x64/ARM64 y macOS x64/ARM64. El test de CI comprueba las cinco entradas existentes y la selección de arquitectura por trabajo; no modifica la Fase 2 ni el workflow.
- Se restauran los diagnósticos originales del gestor y la detección prioritaria de `pbtadmin-qwen3:4b-q4_K_M`, con fallback al modelo oficial. Las elecciones guardadas se conservan.
- `QwenInstallCard` ofrece identidad, icono existente, tamaño aproximado, RAM recomendada, consentimiento, progreso basado exclusivamente en bytes observados, velocidad cuando hay muestras válidas, cancelación y reintento. Los porcentajes desconocidos se muestran como progreso indeterminado.
- Al terminar se refresca el proveedor y vuelve automáticamente el chat. Durante la instalación se ocultan el campo desactivado y los controles de conversación inactivos. El chat disponible conserva su presentación original. El acceso a ajustes y proveedores externos permanece visible.
- Se usan Vuetify, variables del tema y traducciones es-ES/ca/en. No se añaden bibliotecas visuales ni se alteran configuraciones globales.
- Una descarga cancelada ya no puede sobrescribir el estado de un reintento posterior. Cancelar durante la preparación invalida la operación antes de iniciar el pull.
- Personalidad, lore, conocimientos, herramientas y almacenes de conversaciones no se editan.

## Pruebas

La batería final de Vitest contiene 94 pruebas: **92 aprobadas, 2 omitidas, 0 fallidas**, en 11 archivos:

```powershell
pnpm exec vitest run xmcl-keystone-ui/src/composables/agent/qwenInstaller.test.ts xmcl-runtime/agent/AgentService.test.ts xmcl-runtime/agent/managedOllama.test.ts xmcl-runtime/agent/ollama.test.ts xmcl-runtime/agent/ollamaChat.test.ts xmcl-keystone-ui/src/composables/agent/pbtAdmin.test.ts scripts/ci-ollama.test.ts xmcl-electron-app/build/ollamaPackaging.test.ts deskgap-app/packaging.test.ts scripts/prepare-ollama.test.mjs xmcl-runtime/agent/runtimeBundle.test.ts
```

Las ocho pruebas nuevas del instalador cubren modelo ausente, consentimiento, preparación cancelable, descarga con porcentaje/velocidad reales, completado, activación automática, cancelado, errores/reintento y modelo instalado. Las omisiones corresponden a creación de symlinks sin privilegios y al empaquetado nativo DeskGap sin `DESKGAP_PACKAGING_SOURCE`.

Se corrigió el test antiguo de arquitecturas para la configuración actual por trabajo. Se añadió una comprobación de empaquetado con runtime válido y sin semilla. Se corrigió también un `ENOTEMPTY` intermitente en la limpieza del fixture DeskGap mediante reintentos acotados. La batería posterior pasa completa, con las omisiones indicadas.

| Comprobación | Resultado |
|---|---|
| Crear, leer y eliminar temporales en proyecto, `.git` y `temp` de Vitest | Correcto; `.git` requirió ejecución fuera del sandbox |
| `pnpm check` | Salida 0 |
| `pnpm lint` | Salida 0; dos advertencias previas de `InstanceBlueprintsService` |
| Validador de traducciones | 0 fallos; es-ES/ca completos |
| `pnpm build:renderer` | Salida 0; verificación de bundle correcta |
| `pnpm --prefix=xmcl-electron-app compile` | Salida 0 fuera del sandbox |
| `pnpm build:deskgap` | Salida 0 fuera del sandbox |
| Tests de arquitectura con `PBT_PACKAGE_ARCH=x64` y `arm64` | 5 aprobados en cada ejecución |

Los intentos de ejecutar `tsx` y DevTools dentro del sandbox fallaron con `uv_os_get_passwd / ENOMEM`. Se repitieron fuera, con autorización. No se modificaron dependencias ni configuración para sortearlo.

## Aplicación real

Se usaron `dev:renderer`, `dev:main` y el CLI oficial indicado por AGENTS.md. `/json/list` confirmó `http://localhost:3000`, no el renderer de producción. Tras el smoke de producción se reconstruyó y reabrió mediante `dev:main`.

El checkout no tenía runtime local. Se preparó Ollama v0.34.0 Windows x64 con el script existente; SHA-256 del archivo oficial: `a7dd1b174f39d3d1b8a25d4cbc86045d0e190b17187bfdcbe2f2ee3b5a11470e`. Antes del consentimiento, el almacén temporal carecía de modelos; no hubo descarga automática de pesos.

Se ejercitaron primer inicio sin cuenta, apertura de PbtAdmin, oferta de instalación, consentimiento desmarcado con descarga deshabilitada, posponer, descarga autorizada, progreso y finalización. La primera interfaz mostró 0,8 / 2,4 GiB durante la descarga. La segunda instalación, con la tarjeta nueva y un almacén vacío, mostró el progreso de descarga y activó el chat automáticamente en el mismo proceso de Electron, sin reinicio. Reabrir con el modelo instalado no mostró la tarjeta.

En esa ejecución: Electron PID 24376; supervisor PID 17656; Ollama PID 24560; endpoint `127.0.0.1:58798`. El proveedor confirmó `qwen3:4b-q4_K_M`, `configured=true`, herramientas disponibles y contexto 8192. Una cancelación adicional a través del IPC real devolvió `state=cancelled` y conservó el modelo disponible. Los estados de error y las carreras de cancelación/reintento se verifican mediante las pruebas deterministas; no se presenta una captura tardía de una descarga ya finalizada como cancelación de red exitosa.

La tarjeta y su consentimiento se comprobaron en la ventana real de 800×400; una captura está en `temp/qwen-card-800.png`. Se corrigió un recorte observado, y el botón principal quedó dentro del área visible. El comando de tamaño del CLI no funciona con este Electron; se utilizó Windows para ajustar únicamente la ventana de pruebas. El tema claro se comprobó en el launcher y el oscuro en la tarjeta; los estilos del instalador consumen las variables comunes del tema. No se afirma haber capturado la tarjeta ausente en ambos temas.

El modelo instalado abrió el saludo original de PbtAdmin y el chat disponible. No se realizó una conversación nueva de inferencia ni un benchmark de CPU/RAM.

## Conservación y límites

Se utilizó exclusivamente el perfil `temp/qwen-demand-appdata` y el directorio de juego `temp/qwen-demand-game`, sin cuentas personales, instancias ni credenciales. El modelo de la primera prueba se conservó temporalmente en una carpeta del mismo perfil para repetir desde un almacén vacío. La reapertura confirmó la ausencia de modelos antes de instalar de nuevo. Al terminar se cerró el launcher, se confirmó que los PIDs propios de Electron/supervisor/Ollama habían desaparecido y se retiraron ambos directorios de prueba. Los logs se conservaron en `temp/qwen-demand-native-agent.log` y `temp/qwen-demand-native-main.log`. El runtime verificado y su caché de descarga se mantienen para posteriores builds.

No se han generado instaladores nuevos para los cinco destinos ni ejecutado Linux/macOS nativos. La conservación de las recetas y los tests de arquitectura no equivale a validar esos artefactos en sus sistemas operativos.
