# Fase 15.2 — Auditoría de Ollama integrado y ediciones portables

Fecha: 2026-10-10. Rama: dev/upstream-v1.0.7. Base confirmada: fd417abd. Versión conservada: 1.0.7. Árbol inicialmente limpio; Fase 15.1 confirmada. Este documento no anuncia soporte implementado ni una release.

**Estado: BLOQUEADO. El requisito obligatorio de incluir un motor local en todas las ediciones todavía NO se cumple.** No se han añadido binarios ficticios, instaladores globales, servicios, cambios de PATH/registro/ACL ni descargas de modelos. No se considera terminada la implementación de esta fase.

## Hallazgos del código actual

- xmcl-runtime/agent/ollama.ts busca ollama.exe/ollama en PATH y ubicaciones globales habituales. No busca recursos integrados del paquete. ORIGIN está fijado a http://127.0.0.1:11434.
- xmcl-runtime/agent/ollamaChat.ts también llama directamente al puerto 11434. La detección, descarga, resolución de modelos y chat deberán compartir el origen resuelto por un mismo gestor de motor.
- AgentService ya admite Ollama sin API key y LocalAiSetup permite seleccionar modelos y autorizar una descarga. Esto no inicia ni incluye un motor y no constituye una integración portable.
- No hay gestor de procesos Ollama propios, elección de puerto dinámico, configuración portable del almacén de modelos ni consentimiento específico para reutilizar un servicio externo.
- electron-builder.config.ts incluye documentación/conocimiento en extraResources, pero ningún ejecutable o biblioteca de Ollama.
- DeskGap package.ts prepara su runtime y aplicación sin Ollama. No se ha verificado un paquete DeskGap con motor integrado.

## Plataformas y ediciones declaradas

| Edición/configuración actual | Auditoría | Motor integrado | Paquete ejecutado |
| --- | --- | --- | --- |
| Windows zip x64 | Configuración presente | NO | NO EJECUTADO |
| Windows zip ia32 | Configuración presente; runtime oficial ia32 compatible no verificado | BLOQUEADO | NO EJECUTADO |
| Windows AppX | Configuración presente; falta analizar límites de proceso/datos del paquete | NO | NO EJECUTADO |
| Linux AppImage x64/arm64 | Configuración presente | NO | NO EJECUTADO |
| Linux tar.xz x64/arm64 | Configuración presente | NO | NO EJECUTADO |
| Linux deb/rpm/pacman x64/arm64 | Configuración presente | NO | NO EJECUTADO |
| macOS dmg x64/arm64 | Configuración presente; DMG no demuestra portabilidad de los datos del .app | NO | NO EJECUTADO |
| DeskGap | Script de empaquetado presente | NO | NO EJECUTADO |

No se declara soporte completo de ninguna edición autocontenida. La licencia permite integración del código de Ollama, pero no demuestra compatibilidad de cada arquitectura ni sustituye la revisión de bibliotecas GPU y licencias de modelos.

## Procedencia, licencias y requisitos

Fuentes oficiales consultadas:

- [Distribución Windows y CLI independiente](https://github.com/ollama/ollama/blob/main/docs/windows.mdx): archivo ollama-windows-amd64.zip con CLI y bibliotecas; admite embedding en aplicaciones. No es necesario usar OllamaSetup.exe para un paquete integrado. La documentación actual indica Windows 10 22H2 o posterior y requisitos específicos de drivers; deberán fijarse a la versión del runtime escogida.
- [Instalación manual Linux](https://github.com/ollama/ollama/blob/main/docs/linux.mdx): binarios y bibliotecas de la distribución deben conservarse juntos. No se debe ejecutar el instalador global ni crear un servicio root como requisito del portable.
- [Releases oficiales](https://github.com/ollama/ollama/releases) y [API de releases](https://api.github.com/repos/ollama/ollama/releases/latest): deben seleccionarse versión exacta, archivo y arquitectura, y registrar tamaño/digest antes de incorporarlos. No se fija aquí una versión o SHA inventados.
- [Licencia MIT de Ollama](https://github.com/ollama/ollama/blob/main/LICENSE): conservar copyright/licencia. Revisar por separado licencias de bibliotecas incluidas y modelos.

No se ha descargado un runtime: **tamaño real del paquete integrado pendiente**. La documentación Windows indica al menos 4 GB para la instalación binaria; no se utiliza esa cifra como tamaño exacto de una release portable. Los modelos existentes siguen mostrando estimaciones y consentimiento en el asistente; todavía falta integrar espacio libre real, ubicación configurable y prevención de duplicados entre almacenes para esta fase.

## Bloqueos reproducidos

1. `node -e "fetch('https://api.github.com/repos/ollama/ollama/releases/latest').then(r=>console.log(r.status)).catch(e=>console.error(e.cause?.code,e.message))"` devuelve EACCES/fetch failed desde este entorno. La navegación documental funciona, pero no entrega binarios verificados dentro del workspace.
2. No se encuentran archivos Ollama locales mediante el inventario del repositorio. No existe un manifiesto de procedencia/hashes de motor integrado.
3. `node -e "require('os').userInfo()"` vuelve a fallar con uv_os_get_passwd returned ENOMEM fuera del launcher. Sigue siendo una limitación de entorno; no se modifica código correcto para ocultarla.
4. No hay entornos Linux/macOS nativos disponibles para generar y arrancar sus distribuciones ni infraestructura de firma/notarización validada en esta sesión.

No se desactiva sandbox/Gatekeeper/antivirus ni se cambian permisos. No se transforma un fixture en un supuesto motor real.

## Diseño pendiente obligatorio antes de distribuir

Esta sección es un diseño, **no código implementado**:

1. Staging por plataforma/arquitectura con manifiesto de versión exacta, procedencia oficial, hashes de todos los archivos, licencias y dependencias. El empaquetado debe rechazar la ausencia de ese staging o una arquitectura no compatible, antes de producir un portable que prometa IA integrada.
2. Resolver recursos por edición: recursos empaquetados para Electron, recursos propios DeskGap. Prioridad motor integrado; después ejecutable externo configurado explícitamente; finalmente servicio local existente autorizado. No usar el PATH global como sustituto silencioso del motor faltante.
3. Gestor singleton del proceso hijo con spawn sin shell y argumentos fijos `serve`. Directorio de trabajo propio; OLLAMA_HOST limitado a 127.0.0.1, OLLAMA_MODELS y demás variables solo del hijo. Nunca aceptar comandos arbitrarios del modelo.
4. Puerto libre reservado y conexión de salud con deadline; resolver carreras de bind sin conectarse a un servicio ajeno accidentalmente. Compartir origen entre tags/show/pull/chat. No asumir 11434 libre, ni detener procesos ajenos por nombre/puerto.
5. Exclusión y coordinación por almacén/edición para múltiples instancias, cierre de solo el proceso propio, supervisión de descendientes y protección contra huérfanos. Verificar específicamente Windows y Linux/macOS, no inferirlo de mocks.
6. Modelos y configuración portable fuera de directorios temporales y montajes AppImage. Resolver rutas relativas respecto a la ubicación real del portable; no respecto a su extracción temporal. En Windows los zip y los portables autoextraíbles tienen mecanismos distintos y deben probarse por separado.
7. Ubicación alternativa explícita y validada cuando el medio sea de solo lectura. Conservar los modelos/configuración/historial al actualizar o mover el paquete. Compartir almacén externo solo con autorización; no borrar modelos en uninstall/update.
8. Mostrar tamaño estimado y espacio disponible antes de descarga, con consentimiento; reutilizar almacén elegido sin copiar gigabytes automáticamente. Mantener configuración por edición y evitar escrituras de claves/modelos en el paquete firmado o su imagen montada.
9. macOS: conservar firmas de dependencias, firmar el bundle completo correctamente y notarizar cuando corresponda. No desactivar Gatekeeper ni considerar un DMG generado como aplicación ejecutada o validada.

## Matriz de pruebas actual

| Comprobación | Estado |
| --- | --- |
| Rama, commit anterior y árbol limpio al inicio | APROBADO |
| Auditoría de endpoints, detección y scripts de empaquetado | APROBADO como inspección, no ejecución |
| Acceso de Node a procedencia oficial para adquirir runtime | BLOQUEADO por EACCES |
| userInfo independiente del proyecto | FALLIDO por ENOMEM ambiental |
| Instalable/portable sin Ollama previo | NO EJECUTADO |
| Unidad externa, movimiento, Unicode y permisos sin administrador | NO EJECUTADO |
| Directorio alternativo de modelos, descarga/persistencia, reinicio | NO EJECUTADO |
| Motor externo autorizado y puerto ocupado | NO EJECUTADO |
| Gestión de procesos propios/huérfanos/concurrencia | NO EJECUTADO |
| Medio de solo lectura, Linux/macOS nativos | NO EJECUTADO |
| Chat real offline con modelo instalado | NO EJECUTADO |
| Tests de integración portable específicos | NO EJECUTADO; no hay implementación que puedan validar |

Los tests aprobados de la Fase 15.1 no prueban motores integrados y no se reutiliza su cifra como validación de este requisito. No se generan ni publican instaladores en esta fase.

## Continuación necesaria

En un entorno que permita adquirir archivos oficiales, seleccionar una release exacta, revisar los activos y licencias y preparar staging verificado sin instalar globalmente. Después implementar el gestor y la configuración con los requisitos anteriores y ejecutar sus pruebas de regresión y los paquetes reales. La ausencia de motor no debe comunicarse como «instala Ollama globalmente» en un producto anunciado como autocontenido. Hasta completar estos pasos, el requisito portable permanece bloqueado y no se debe anunciar cumplimiento.

## Git

Únicamente se añade este informe; no se cambian funcionalidades, endpoints, master, backup ni versión. Si .git continúa denegando index.lock, se conserva el informe en ZIP verificado, manifiesto SHA-256 y parche en temp/phase152-preservacion-20261010.*. No hay push, tags, releases ni merge a master.
