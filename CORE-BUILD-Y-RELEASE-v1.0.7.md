# Core Build y publicación automática — PbtModLauncherX v1.0.7

Cambios locales integrados con la estabilización. No se ha hecho commit ni push; no se han creado releases, subido assets reales, modificado etiquetas o cambiado versiones.

## Auditoría de Core Build

Se consultó y conservó el log completo de la [ejecución 38191692373](https://github.com/PbtServers/PbtModLauncherX-Dev/actions/runs/38191692373), job `automation (22)` 114625605513, commit `7c27cafc936a4dc0c8e235919d8a8fba430a2d9b`.

Entorno del log: Ubuntu 24.04.5 y Node 22.23.3. Reproducción local: Windows y Node 22.22.3. WSL no está instalado; no se afirma haber reproducido el sistema operativo de CI ni haber obtenido un tick verde remoto.

El resumen original fue 6 archivos fallidos, 371 superados y 7 omitidos; 7 pruebas fallidas, 3182 superadas y 39 omitidas. Además de las siete assertions fallidas, tres suites no llegaron a ejecutarse.

| Archivo | Fallos originales | Causa y corrección |
| --- | ---: | --- |
| `deskgap-app/releaseWorkflow.test.ts` | 2 | Esperaba una matriz de tres OS y pasos antiguos que editaban notas. Ahora verifica las cinco combinaciones reales y la conservación de notas. La advertencia de instalación manual del EXE sin firma se conserva en `INSTALLATION.txt`, verificado como asset. |
| `xmcl-runtime/instance/InstanceService.icon.test.ts` | 1 | `mkdtemp` recibía un prefijo dentro de `temp`, inexistente en un checkout limpio. El fixture crea su directorio padre; conserva la comprobación de ruta Unicode larga y fuente inalterada. |
| `xmcl-keystone-ui/src/util/date.test.ts` | 4 | El formateador aplicaba la política restringida de idiomas de interfaz y devolvía inglés para en-IN, fr y etiquetas no compatibles. Las fechas ahora usan el locale solicitado si Intl lo admite y español como fallback. Se conservan las assertions originales. |
| `xmcl-keystone-ui/src/composables/minecraft26Catalog.test.ts` | Suite no ejecutada | Importaba indirectamente i18n/YAML, sin plugin YAML en Vitest. Mock específico de la dependencia de i18n; clientes, identificadores, facets y resoluciones reales del código siguen bajo prueba. |
| `xmcl-keystone-ui/src/composables/modpackImportEvents.test.ts` | Suite no ejecutada | Misma dependencia indirecta de YAML. Se aísla i18n conservando las pruebas del registro/desregistro de eventos, paste, drop y autenticación. |
| `xmcl-keystone-ui/scripts/audit-visible-text.test.mjs` | Suite no ejecutada | Registraba pruebas en node:test en lugar de Vitest. Se cambió únicamente el import del runner; se mantienen las tres auditorías y sus assertions. |

La reproducción local confirmó los fallos de DeskGap, fechas y suites; el error de carpeta padre quedó acreditado por el stack trace de CI, ya que `temp` existe en este workspace.

La suite completa detectó otro test obsoleto después del commit `48a51103`, que publicó el snapshot de v1.0.7: `releaseMetadata.test.ts` seguía esperando v1.0.6. Ahora comprueba v1.0.7, flags de publicación, fecha válida y URLs del repositorio. **No se modificó `latest_version.json`.**

Una repetición de cobertura también encontró un residuo intermitente de `.install`. La limpieza abandonaba cualquier ENOTEMPTY, indistinguible de un directorio con otra operación. Se añadió limpieza no recursiva con reintentos Windows acotados a 140 ms de espera total. Los datos de otras operaciones se conservan; un directorio vacío que siga inaccesible causa un error. Cinco pruebas simulan desaparición, bloqueo transitorio, directorio ajeno y errores permanentes. El caso original se ejecutó 30 veces con cobertura sin volver a observar el residuo; esto no prueba por sí solo la causa del fallo aislado.

Se observaron timeouts al ejecutar simultáneamente cobertura, type-check y otras tareas. El test ampliado de recolección iniciaba nueve procesos Node: se conservaron todas sus comprobaciones, manteniendo un smoke del CLI y ejecutando los casos negativos mediante la función exportada. **No se ampliaron los timeouts ni se añadieron retries de tests.** Las comprobaciones finales se ejecutan sin compilaciones pesadas simultáneas.

Core Build mantiene Node 22, lint, cobertura y los cuatro builds; añade `pnpm check`, permisos de lectura y rutas de activación que incluyen todos los componentes comprobados. Ya no omite el job por el prefijo `chore(release)` del commit.

## Publicación normal desde master

`build.yml` conserva Windows x64, Linux x64/ARM64 y macOS x64/ARM64, runtimes Ollama y validaciones de recursos. No añade pesos Qwen.

El job `publish` depende del resultado exitoso de toda la matriz. Sólo permite eventos push a master del repositorio `PbtServers/PbtModLauncherX-Dev`. Los builds mantienen `contents: read`; únicamente los jobs que adjuntan assets usan `contents: write` y GITHUB_TOKEN.

1. Consulta `/releases/latest`, exige release estable publicada y tag igual a la versión del proyecto.
2. Lee todas las páginas de assets. Si encuentra un instalador del launcher, termina con éxito y no escribe en Releases ni en `latest_version.json`.
3. Si hace falta publicar, descarga los artefactos `build-*` de esa misma ejecución, separados por plataforma.
4. El colector exige los cinco receipts, revalida bytes y SHA-256, manifiestos de plataforma/arquitectura y comprobantes Linux de integridad, runtime y conocimientos. Los feeds macOS se reúnen sin duplicar paquetes.
5. El preparador existente genera SHA256SUMS y conserva su mecanismo de partición. El publicador rechaza cualquier archivo que alcance el límite individual de 2 GiB, directorios, symlinks, archivos vacíos o hashes inconsistentes.
6. Inmediatamente antes de la primera subida, vuelve a comprobar release y todos sus assets. No reemplaza nombres existentes.
7. Reserva la publicación creando `pbtmodlauncherx-publication.json`, con archivos previstos, hashes y run ID. Los jobs normal y manual de borrador comparten un grupo de concurrencia y no cancelan la operación activa.
8. Sube los archivos sin clobber y verifica existencia, tamaño, estado y digest remoto. Si GitHub no aporta digest, descarga y calcula SHA-256.
9. Guarda `publication-result.json` como artefacto de Actions. Sólo informa éxito después de verificarlo todo.

La API y la concurrencia siguen los contratos documentados por GitHub: [Releases](https://docs.github.com/en/rest/releases/releases#get-the-latest-release), [assets](https://docs.github.com/en/rest/releases/assets#upload-a-release-asset) y [concurrencia](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency).

Los paquetes reconocidos llevan el prefijo y la nomenclatura real de PbtModLauncherX; ZIP genéricos y archivos de documentación/metadata no cuentan. Se incluyen aliases Linux x86_64, amd64 y aarch64, y las partes de una distribución dividida para impedir una sustitución automática de una subida parcial.

### Fallos y recuperación

- Errores de build, validación, API o subida necesaria mantienen `failure`.
- Una release con instaladores devuelve `success` sin cambios, aunque falten plataformas.
- Si una publicación queda interrumpida antes del primer instalador, su reserva impide una segunda publicación automática. Se requiere revisión y recuperación controlada.
- Si queda al menos un instalador, los siguientes runs omiten la publicación conforme al requisito; no completan ni reemplazan assets parciales. El run que falló conserva su resultado de error y el listado de lo subido.
- No hay DELETE, PATCH de notas, creación de releases, modificación de tags ni commits de metadata en el flujo automático.
- El flujo manual de borradores sigue independiente. El workflow manual de firma preexistente no se ha modificado ni ejecutado.
- No existe un mecanismo de sincronización de latest_version.json usado por este nuevo job; el snapshot local queda intacto y se evitan commits automáticos.

## Pruebas y comprobaciones

Los tests de publicación usan API simulada: release vacía, documentación, todos los formatos solicitados, instalador único y conjunto completo, éxito/omisión, versión incompatible, API fallida, checksum cambiado, paginación, publicación concurrente, fallo parcial, colisiones, bytes del POST y verificación remota.

El colector comprueba además que cualquiera de las cinco builds ausente, un manifiesto incorrecto, un comprobante Linux incompleto o bytes alterados impidan continuar.

Resultados iniciales superados: 90 pruebas de los seis archivos originales; suite completa y cobertura con 3339 pruebas; type-check; lint con dos advertencias anteriores; builds de tipos/CJS/ESM/browser del workspace; renderer de producción. Los resultados definitivos tras las comprobaciones adicionales se registran al final.

Cobertura final tras la corrección de limpieza, optimización del test del colector y pruebas del proceso CLI: **393 archivos superados, 8 omitidos; 3350 pruebas superadas y 41 omitidas**, cero fallos, en 42,86 s. El total de Vitest incluye dos casos pendientes originales. Cobertura: statements 62,01 %, branches 56,26 %, functions 56,73 %, lines 63,68 %. No se modificaron la configuración ni los umbrales de cobertura.

El publicador tiene **59 pruebas**, incluidas tres que inician un proceso Node real con fetch simulado: omisión y publicación verificada salen con código 0; checksum incorrecto sale con código distinto de 0 y receipt de fallo sin assets subidos.

Suite completa final sin cobertura: **393 archivos superados, 8 omitidos; 3350 pruebas superadas y 41 omitidas**, cero fallos, exit 0, en 32,68 s. Se ejecutó después de todos los cambios de implementación y pruebas.

Type-check y lint finales: exit 0. Lint específico de los cuatro scripts de publicación/recolección: cero errores y advertencias. Compilación de producción main/preload de Electron: exit 0, incluyendo el helper de limpieza. Tras ella se fuerza una reconstrucción de desarrollo para no dejar un bundle con HAS_DEV_SERVER desactivado.

Validación real del renderer en `http://localhost:3000/index.html#/`: fecha de prueba en español, catalán, inglés de India, francés y fallback español para lolcat. No se cambiaron preferencias ni cuentas para esta validación.

## Pendiente de comprobar remotamente

Repetición posterior a las pruebas reales de Qwen3 y LabyMod: **3362 pruebas superadas, 41 omitidas; 394 archivos superados, 8 omitidos**, sin fallos. Cobertura exit 0 en 41,56 s: statements 62 %, branches 56,28 %, functions 56,72 %, lines 63,68 %. Suite sin cobertura exit 0 en 31,99 s. Type-check, lint y builds de tipos/CJS/ESM/browser superados nuevamente. Las nuevas pruebas cubren comandos largos de Windows, rutas Unicode y conservación de argumentos; no se alteran umbrales ni se omiten fallos.

No se ha hecho push y, por tanto, **no se afirma que GitHub Actions ya muestre el tick verde**. Falta ejecutar el código nuevo en los runners nativos y comprobar una publicación necesaria real. Las simulaciones no alteraron releases públicas. También siguen las limitaciones funcionales recogidas en `ESTABILIZACION-v1.0.7.md`.

## Archivos de esta fase

- `.github/workflows/core-build.yml`
- `.github/workflows/build.yml`
- `scripts/publish-release.mjs`
- `scripts/publish-release.test.ts`
- `scripts/collect-release-assets.mjs`
- `scripts/collect-release-assets.test.ts`
- `deskgap-app/releaseWorkflow.test.ts`
- `xmcl-electron-app/build/releaseMetadata.test.ts`
- `xmcl-runtime/instance/InstanceService.icon.test.ts`
- `xmcl-runtime/instanceIO/InstanceInstallService.ts`
- `xmcl-runtime/instanceIO/InstanceInstallService.progressive.test.ts`
- `xmcl-runtime/instanceIO/utils/removeEmptyInstallDirectory.ts`
- `xmcl-runtime/instanceIO/utils/removeEmptyInstallDirectory.test.ts`
- `xmcl-keystone-ui/src/util/date.ts`
- `xmcl-keystone-ui/src/composables/minecraft26Catalog.test.ts`
- `xmcl-keystone-ui/src/composables/modpackImportEvents.test.ts`
- `xmcl-keystone-ui/scripts/audit-visible-text.test.mjs`
- Este informe y el informe general de estabilización.
