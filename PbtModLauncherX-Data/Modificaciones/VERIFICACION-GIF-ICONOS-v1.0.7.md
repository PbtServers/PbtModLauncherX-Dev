# Comprobación adicional de GIF en iconos de instancias

Fecha: 2026-10-10. Rama: `dev/upstream-v1.0.7`. Versión: **1.0.6**.
Estado inicial limpio; la Fase 8 está confirmada en `10733ca6390daa6e2c6cab756c7a35eec7467f4f`.

## Alcance de la evidencia

**No se ha verificado visualmente la reproducción en una interfaz real.** La CLI oficial de chrome-devtools falla con `uv_os_get_passwd returned ENOMEM` antes de conectar al launcher. No se inicia una segunda aplicación ni se utilizan perfiles del usuario. Las afirmaciones siguientes distinguen revisión del código, pruebas automatizadas y reproducción visual pendiente.

El fixture GIF se ha decodificado además con `System.Drawing` de Windows: **2 fotogramas**, con píxeles diferentes (`-14388020` y `-1662404` en la posición 0,0). Esto confirma que el recurso de prueba tiene contenido animado, pero no prueba su reproducción en Chromium o DeskGap.

## Componentes y comportamiento previsto

| Lugar | Componentes revisados | Sin movimiento reducido | Con movimiento reducido | Verificación visual |
| --- | --- | --- | --- | --- |
| Lista de instancias y barra lateral | `AppSideBarInstanceItem.vue` | URL GIF original en `v-img` mediante `InstanceIcon` | Captura estática de visualización | Pendiente |
| Selector/búsqueda de instancias | `AppCommandPalette.vue`, dos listas | Mismo recurso original, sin conversión | Captura estática | Pendiente |
| Grupos de instancias | `AppSideBarGroupItem.vue` | GIF original | Captura estática | Pendiente |
| Barra lateral compacta, instancia y grupos | `AppSideBarNotchItem.vue`, `AppSideBarNotchItemInstance.vue`, `AppSideBarNotchItemGroup.vue` | `img` nativo o `InstanceIcon`, sin eliminar fotogramas | Captura estática | Pendiente |
| Pantalla principal | Barra lateral anterior; `HomeHeader.vue` | El encabezado central muestra nombre/versión, no un icono propio de instancia | Según componente lateral | Pendiente |
| Configuración de instancia | `BaseSettingGeneral.vue`, `AppChangeInstanceIconCard.vue` | GIF original en icono y vista previa | Captura estática | Pendiente |
| Lista de instancias en Me | `Me.vue` | GIF original | Captura estática | Pendiente |
| Lista del asistente de migración | `InstanceItem.vue` | GIF original | Captura estática | Pendiente |
| Imagen temporal de arrastre | `AppSideBarInstanceItem.vue`, `setDragImage` | Imagen transferida a la API de arrastre del navegador; no se garantiza reproducción animada | Sin cambios en esa API temporal | Pendiente |
| Acceso directo del sistema operativo | `LaunchService.createLaunchShortcut` | Recurso separado para el SO; no se considera un reproductor GIF de la interfaz | No aplica | Pendiente; no se ha cambiado esa función |

Los componentes de interfaz no rasterizan el GIF cuando la preferencia es `no-preference`: entregan la misma URL al decodificador nativo. Es un comportamiento esperado por el código, **no una declaración de que se haya observado la animación**. La imagen nativa y `v-img` pueden depender de la versión del navegador, visibilidad y suspensión de ventanas.

## Cambios implementados

- `InstanceIcon.vue` y `useInstanceIconSource` comparten la política de visualización en los lugares anteriores. Se mantienen atributos, tamaños y slots de los iconos existentes; no se sustituyen imágenes de noticias, proyectos o fondos.
- Con `prefers-reduced-motion: reduce`, los GIF identificables por `.gif`, ruta de media o MIME de una data URL se capturan en un canvas de **hasta 128×128**, únicamente para la visualización. El GIF del disco y sus metadatos no cambian.
- Si la captura falla (incluido CORS), se muestra el icono estático predeterminado de Minecraft, sin volver automáticamente al GIF animado. Cambios de preferencia restauran la URL original. Se cancelan cargas al cambiar de icono/instancia o desmontar el componente; límite de espera de 5 segundos.
- Las referencias antiguas a imágenes compartidas sin extensión ni MIME visible no permiten identificar un GIF sin otra consulta. Para esas referencias, la reducción de movimiento no queda garantizada. Los GIF guardados por la Fase 8 sí tienen extensión reconocible.
- Nuevo validador de bloques GIF: tablas de colores, extensiones de control, descriptores, límites de fotogramas, cabecera LZW, subbloques, terminación y ausencia de datos posteriores. Rechaza estructuras truncadas o inconsistentes y GIF sin fotogramas.
- Límites: 8 MiB del almacenamiento existente, **256 fotogramas** y **8.388.608 píxeles de lienzo acumulados entre fotogramas**. No se reescriben los retardos, la paleta ni los bloques; los GIF seguros aceptados se conservan byte por byte.
- El validador estructural no implementa un decodificador completo de LZW. La validación nativa del renderer antes de seleccionar la imagen complementa esta comprobación. No se garantiza detectar mediante los tests de bloques toda posible corrupción de datos comprimidos.
- Se conserva el almacenamiento por SHA256 de la Fase 8. Cambiar bytes cambia la URL, y duplicar instancia produce una ruta independiente. Las revisiones del selector permiten volver a cargar el mismo archivo fuente. No se introduce una caché global de capturas que pueda mezclar instancias.
- PNG, JPEG, WebP, BMP y SVG mantienen sus rutas y validaciones. No se añaden dependencias ni cambios de compilación, idioma, branding, versiones o configuración global.

## Pruebas

**289 aprobadas, 0 fallidas**, en 26 archivos. Incluye las 272 regresiones de Fase 8 y **17 casos adicionales**:

- GIF estático y animado (conteo de 1 y 2 fotogramas), corrupción de descriptores/subbloques, terminador ausente y exceso de fotogramas.
- Guardado y duplicación del GIF con igualdad exacta de bytes y conservación de ambos fotogramas.
- Cambio desde GIF animado a estático utilizando el mismo nombre fuente: URL actualizada y copia anterior independiente.
- Preferencia normal/reducida, cambio de preferencia y resultados asíncronos obsoletos tras cambiar de instancia.
- Compatibilidad de las fuentes PNG, JPEG, WebP, BMP y SVG con movimiento reducido.
- Captura estática limitada, liberación de la imagen temporal, cancelación y fallo de captura sin volver a animación.

Los tests de política/canvas **simulan Image y canvas**, por lo que no sustituyen una comprobación visual ni prueban CORS real. Los tests del servicio escriben y duplican archivos temporales; no son un flujo de usuario en Electron. Se conservan los avisos DEP0180 existentes en los tests de instancias.

## Validación y pendientes

- Typecheck Runtime y Keystone UI correcto.
- Lint sin errores; Runtime mantiene dos avisos anteriores en `InstanceBlueprintsService.ts:287/297`.
- Keystone UI compila y verifica el bundle (103 chunks, 0 helpers huérfanos).
- Electron y DeskGap vuelven a fallar con el bloqueo ambiental ENOMEM al cargar sus herramientas. DevTools falla antes de conectar; no se afirma ejecución real ni compilación correcta de esos dos targets.
- `git diff --check` sin errores.
- Pendiente: observar avance real de fotogramas en cada fila de la tabla, alternar instancias, guardar/copiar/reiniciar, cambiar las preferencias del sistema y comprobar las capturas/fallbacks y disposición del modo compacto en `1200×720` y `800×400`. Verificar también ventanas ocultas y consumo con varias instancias.
- Pendiente: comportamiento de CORS de los protocolos locales al capturar un GIF. Si impide la captura, el fallback estático previsto evita la animación, pero todavía no se ha observado visualmente.

## Archivos y Git

Los cambios afectan a 12 archivos existentes (9 componentes/vistas, validación y tests del servicio, e informe de Fase 8) y añaden 6: `InstanceIcon.vue`, `instanceIconSource.ts` y su test, `instanceGif.ts` y su test, y este informe. El manifiesto detalla todas las rutas.

Git bloquea el staging con `Unable to create .../.git/index.lock: Permission denied`. No se modifican permisos ni se borra ningún lock. HEAD permanece en `10733ca6390daa6e2c6cab756c7a35eec7467f4f`; commit adicional pendiente.

Copia y manifiesto verificados: `temp/gif-preservacion-20261010.zip`, `.manifest.json` y `.patch`. Desde PowerShell en el repositorio:

```powershell
if ((git branch --show-current) -ne 'dev/upstream-v1.0.7') { throw 'Rama incorrecta' }; $gifFiles = (Get-Content 'temp/gif-preservacion-20261010.manifest.json' -Raw | ConvertFrom-Json).files.path; git add -- $gifFiles; if ($LASTEXITCODE -eq 0) { git commit -m 'fix(instance-icons): preserve GIF frames and respect reduced motion' }
```

Master y backup permanecen intactas. No hay push, tags ni releases. Se detiene esta comprobación sin iniciar la Fase 9.
