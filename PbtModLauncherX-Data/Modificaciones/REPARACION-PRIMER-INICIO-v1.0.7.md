# Fase 9 ? Reparaci?n del primer inicio

Fecha: 2026-10-10. Rama: `dev/upstream-v1.0.7`.
HEAD inicial/final pendiente de commit: `9c59e43f029bd29ed0da262c6f3e632f2149f2ff`.
Versi?n p?blica conservada: **1.0.6**.

## Auditor?a y diagn?stico

El ?rbol inicial estaba limpio. La Fase 8 est? confirmada en `10733ca6` y la mejora GIF en `9c59e43f`. Se ley? INTEGRACION-UPSTREAM-v1.0.7.md y se revisaron los flujos de LauncherApp, ElectronController, preload bootstrap, DeskGap, Setup.vue, pluginSetup, pluginSettings, ObjectFactory, BaseService y servicios.

Defectos confirmados por lectura y regresiones del c?digo, sin afirmar que sean la ?nica causa del incidente observado en el instalador:

- El IPC bootstrap respond?a antes de crear los directorios, guardar root y registrar las rutas del runtime. El renderer emit?a ready mientras esa preparaci?n segu?a pendiente.
- El manejador admit?a una ?nica llamada. Un fallo posterior no permit?a repetir la configuraci?n de forma segura; adem?s el archivo root se guardaba antes de comprobar los directorios necesarios.
- preset y validaci?n de carpeta no ten?an manejo de rechazo ni plazo de espera en el renderer: pod?an dejar la pantalla inicial o los botones ocupados indefinidamente.
- Las respuestas de validaciones anteriores pod?an sobrescribir el estado de una selecci?n de carpeta posterior.
- La expresi?n regular de carpetas rechazaba acentos y otras letras Unicode.

No se confirm? un deadlock de kSettings: el registro de ajustes no depende de la ruta de juego. La detecci?n de unidades ya tiene un l?mite de cuatro segundos. No se ha cambiado el orden global de plugins ni eliminado servicios, Java, autenticaci?n, actualizador o tareas necesarias.

## Correcciones

- Registro del manejador bootstrap antes de revelar el asistente. El acuse de recibo espera la preparaci?n de carpetas, escritura at?mica de root y publicaci?n de las rutas del runtime.
- Manejador persistente e idempotente: llamadas concurrentes a la misma ruta comparten la operaci?n; otra ruta durante/despu?s de completar se rechaza; tras un fallo se permite un nuevo intento.
- Preparaci?n de la carpeta temporal antes de publicar rutas. Los errores de diagn?stico opcional de carpeta se capturan sin bloquear el inicio.
- L?mites del renderer: preset/validaci?n 10 segundos, finalizaci?n 30 segundos, entorno opcional 5 segundos. Ofrecen recuperaci?n y mensajes localizados; no abortan a ciegas operaciones de disco ni reinician el launcher. Una operaci?n que termine despu?s del plazo puede recuperarse repitiendo la misma ruta.
- La validaci?n ignora respuestas antiguas, bloquea finalizar con una carpeta inv?lida y ofrece reintento. La finalizaci?n emite la ruta realmente aceptada.
- La detecci?n opcional de entorno deja de impedir la persistencia del tema tras su plazo.
- Nombres de carpeta con letras Unicode y acentos admitidos conservando la lista de caracteres y comprobaciones de permisos/directorios protegidos existentes.
- Logs de fases de inicio, host/activaci?n del renderer, configuraci?n y comienzo/final/error de servicios. Los mensajes a?adidos no contienen credenciales, tokens, rutas ni argumentos IPC. Los mensajes de error de la interfaz est?n en en, es-ES y ca.

Los ajustes existentes, ra?z de datos, protocolos, namespaces, branding, espa?ol predeterminado, iconos/GIF, actualizador y Discord no se migran ni reemplazan. El flujo de una ra?z ya configurada sigue usando el mecanismo existente.

## Relaci?n con upstream

Upstream integrado: `0379941d1997e92b079fdc21e8692c8e45cd8cd7`.
El commit `7b6d7992da645e2df21e2c9223881f7bcdf8f168` (fix: unblock setup completion) ya separaba la detecci?n de entorno del cierre del asistente y permit?a omitir cuenta. Se conserva. `99c5a5d3` correg?a la persistencia del fondo inicial; ahora tambi?n se limita la espera opcional de entorno. Las reparaciones aqu? a?aden garant?as del IPC/runtime y recuperaci?n del renderer que faltaban en el c?digo integrado.

## Archivos

- xmcl-runtime/app/LauncherApp.ts
- xmcl-runtime/app/initialSetup.ts (nuevo)
- xmcl-runtime/app/initialSetup.test.ts (nuevo)
- xmcl-runtime/service/Service.ts
- xmcl-runtime/util/validate.ts
- xmcl-keystone-ui/src/views/Setup.vue
- xmcl-keystone-ui/src/util/setupRequest.ts (nuevo)
- xmcl-keystone-ui/src/util/setupRequest.test.ts (nuevo)
- xmcl-keystone-ui/locales/en.yaml
- xmcl-keystone-ui/locales/es-ES.yaml
- xmcl-keystone-ui/locales/ca.yaml
- Este informe.

## Validaci?n

- **59 tests aprobados, 0 fallidos**, seis archivos: initialSetup, migrate, locale de runtime-api, setting, locale UI y setupRequest. Siete regresiones nuevas: preparaci?n lenta/acuse y duplicados, recuperaci?n EACCES, configuraci?n vac?a, persistencia y lectura posterior en carpeta Unicode, conservaci?n de root ante fallo de directorio, ?xito/rechazo IPC y timeout/reintento.
- Dos pruebas realizan operaciones reales de disco en subdirectorios ?nicos de temp/phase9-test-* y los limpian. Inyectan el escritor de fs para no depender de atomically, cuyo import ejecuta userInfo bloqueado en este entorno. Por tanto NO verifican aqu? la implementaci?n de escritura at?mica de esa dependencia ni constituyen ejecuciones reales del launcher.
- Typecheck aprobado: runtime-api, runtime, Electron main/preload y Keystone UI.
- Lint aprobado: packages, runtime-api, runtime, Electron y UI. Runtime conserva dos advertencias anteriores en InstanceBlueprintsService.ts; cero errores.
- Keystone UI: compilaci?n aprobada, 103 chunks, cero helpers hu?rfanos.
- Traducciones: UI es-ES y ca 2429/2429, Electron 21/21 y componentes 29/29; cero faltantes/errores/placeholders incompatibles en los locales objetivo. 54 diagn?sticos de otros idiomas ya existentes.
- git diff --check aprobado.
- Electron y DeskGap: compilaciones intentadas, bloqueadas por `uv_os_get_passwd returned ENOMEM`. Reproducido tambi?n mediante `node -e "require('node:os').userInfo()"` sin cargar el launcher.
- Los comandos globales pnpm check/lint fueron intentados y fallaron porque sus llamadas pnpm anidadas resuelven el ejecutable antiguo Node 20 con EPERM. Se ejecutaron sus pasos por paquete y packages directamente con el pnpm compatible y Node 22, sin modificar configuraci?n.
- Una pasada ampliada de tests app obtuvo 74 tests aprobados y dos suites bloqueadas por el import de atomically/ENOMEM. La suite nueva se aisl? mediante inyecci?n del escritor y pasa en la selecci?n final; BaseService.update sigue pendiente de volver a ejecutar en un entorno con userInfo funcional. No se suman ambas pasadas como tests distintos.

Logs locales: temp/phase9-tests-final.log, phase9-check-*.log, phase9-lint-*.log, phase9-ui-build.log, phase9-compile-xmcl-electron-app.log, phase9-build-deskgap-app.log y phase9-translations.log.

## Limitaciones y comprobaci?n real pendiente

La CLI oficial chrome-devtools fue intentada antes de validar la interfaz y fall? con ENOMEM antes de conectarse. No se ha declarado probada una instalaci?n limpia, el flujo inmediatamente despu?s del instalador, el primer inicio sin Internet/con conexi?n lenta/sin Java, un reinicio del launcher, una actualizaci?n real desde 1.0.6 ni la interfaz del error/reintento. No se inici? otra aplicaci?n ni se alteraron datos de usuario.

Las pruebas de disco verifican persistencia/lectura posterior y fallos locales, no una segunda ejecuci?n de Electron. Los escenarios de red/IPC lentos se simulan con promesas, no con instalaciones ni conexiones reales. Rutas Unicode y espacios se prueban en G:; unidades adicionales y ACL reales quedan pendientes. Los l?mites IPC no cancelan una llamada de sistema bloqueada: la interfaz se recupera y el reintento idempotente conserva seguridad, pero ese caso necesita diagn?stico del disco/entorno. Tampoco se ha medido visualmente la pantalla de error a 800x400/1200x720.

Para cerrar la validaci?n: usar dev:main/dev:renderer con perfil temporal aislado, confirmar localhost:3000 en DevTools, completar el asistente online/offline/sin Java, provocar error de permisos y reintentar, cerrar/abrir y comprobar root/locale/tema, y repetir con configuraci?n existente. Recoger logs de fases y limpiar ?nicamente recursos temporales. Tras una compilaci?n de producci?n, reconstruir dev:main antes de relanzar para restaurar HAS_DEV_SERVER=true.

## Conservaci?n y Git

No se puede crear el commit desde este entorno: git add devuelve Permission denied al crear .git/index.lock; .git es de solo lectura por la pol?tica del entorno. No se borr? ning?n lock ni se cambiaron permisos. master y backup conservan `c4b77e666f0b132e05e3ffff71d2728132a46a44`. No se hizo push ni se cambi? versi?n.

Se genera copia ZIP, parche y manifiesto de los doce archivos en temp/phase9-preservacion-20261010.{zip,patch,manifest.json}. El script verifica cada entrada del ZIP mediante tama?o y SHA-256 y guarda el hash del ZIP en el manifiesto. Estos artefactos est?n fuera del commit (temp est? ignorado).

Comando manual PowerShell, desde la ra?z:

```powershell
if ((git branch --show-current) -ne 'dev/upstream-v1.0.7') { throw 'Rama incorrecta' }; $phase9Files = (Get-Content 'temp/phase9-preservacion-20261010.manifest.json' -Raw | ConvertFrom-Json).files.path; git add -- $phase9Files; if ($LASTEXITCODE -eq 0) { git commit -m 'fix(startup): complete initial setup before acknowledging IPC' }
```

Implementaci?n de Fase 9 terminada, commit manual y validaciones reales indicadas pendientes. No se inicia la Fase 10.
