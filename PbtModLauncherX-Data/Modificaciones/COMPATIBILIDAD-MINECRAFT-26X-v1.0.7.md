# Fase 7 — Compatibilidad de identificadores Minecraft 26.x

Fecha: 2026-10-10. Rama exclusiva: `dev/upstream-v1.0.7`.

## Estado inicial

El árbol estaba limpio. La Fase 6 está confirmada por el usuario en `50c6ffc437df02aaea9c55982f57693c65dc4c37`, `fix(shaders): detect compatible local providers and refresh instance selection`. Se leyó el informe de Fase 6 y se conservaron todas las reparaciones anteriores. La versión oficial sigue siendo 1.0.6; master y backup no se modificaron.

## Issue #1365 y reparación ya integrada

El [issue #1365](https://github.com/Voxelum/x-minecraft-launcher/issues/1365), publicado el 25 de marzo de 2026 para upstream 0.54.4 en macOS ARM, informa que los catálogos de mods, recursos y shaders de una instancia 26.1 acababan seleccionando 1.21.11.

La causa histórica era un filtro del selector que descartaba cualquier identificador que no empezara por `1.`. Está corregida en el commit ya integrado `bd52d74f852ad7c1602a584d29f8ad6853a92109`, `fix: Recognize Minecraft 26.1 in market version filters (#1366)`. Se comprobó que es ancestro del HEAD actual. El helper `gameVersion.ts` admite releases numéricas de cualquier major y conserva la release seleccionada aunque falte en un catálogo obsoleto.

La UI se reorganizó posteriormente: el componente antiguo `MarketTextFieldWithMenu.vue` ya no existe; `MarketFilterPanel.vue` utiliza actualmente ese helper. No se restauró el componente antiguo ni se duplicó la reparación upstream. No se encontró una conversión literal 26.1 → 1.21.11 en el código actual revisado.

## Problemas residuales confirmados y correcciones nuevas

### Selector y prereleases

Aunque las releases 26.x ya se reconocían, el helper excluía la versión activa cuando era un snapshot o prerelease, incluso si figuraba en el manifiesto. Ahora el selector conserva la entrada exacta seleccionada que existe en los metadatos, sin sustituirla por una release diferente. La lista por defecto sigue limitada a releases y no incorpora snapshots arbitrarios ni nombres de perfiles no presentes. Se eliminan duplicados sin reordenar el manifiesto.

Cuando un snapshot seleccionado no figure en los metadatos disponibles, este helper no lo inventa: el valor del filtro/persistencia permanece exacto, pero su presencia en el menú no está garantizada hasta disponer de sus metadatos. No se etiqueta un snapshot como release.

### NeoForge 26.x

El filtro existente para `26.1` usaba `26.1.` y mezclaba builds para distintos hotfixes. La [documentación oficial de versionado](https://docs.neoforged.net/docs/gettingstarted/versioning/) y el [anuncio de 26.1](https://neoforged.net/news/26.1release/) establecen cuatro componentes: tres para Minecraft, incluyendo hotfix cero cuando falta, y uno para NeoForge. Minecraft `26.1` corresponde a `26.1.0.*`; `26.1.2` corresponde a `26.1.2.*`.

El helper ahora utiliza ese prefijo exacto. Conserva las asociaciones antiguas `1.21` → `21.0.*`, `1.21.1` → `21.1.*` y el proyecto histórico de 1.20.1. Un identificador snapshot/RC no se convierte en una release para ofrecerle sus builds. No se fabrican versiones ni se añaden entradas al catálogo: se filtran únicamente las devueltas por el proveedor/caché. El esquema del servicio existente aplica el helper también a respuestas de mirrors y a datos cacheados.

Esto corrige la selección de builds, no garantiza por sí solo la ejecución de un mod ni una instalación completa.

## Manifiestos y versiones verificables

Se añadió `xmcl-keystone-ui/src/util/fixtures/minecraft26.json`, un subconjunto literal de once entradas del manifiesto oficial almacenado durante la Fase 5. Incluye identificador, tipo, timestamps y URL oficial del perfil. Su procedencia es `https://launchermeta.mojang.com/mc/game/version_manifest.json`; las URLs de perfiles apuntan a `piston-meta.mojang.com`.

No es una nueva consulta en vivo: se reutiliza la respuesta oficial ya cacheada. La consulta al manifiesto v2 mediante la herramienta web de esta fase devolvió un error interno; no se inventaron metadatos para reemplazarla. El fixture permite verificar posteriormente cada entrada a través de su URL.

| Identificadores del fixture | Tipo oficial |
| --- | --- |
| 1.8, 1.12.2, 1.20.1, 1.21.1, 1.21.11 | release |
| 26.1, 26.1.1, 26.1.2 | release |
| 26.1-rc-3, 26.1.2-rc-1, 26.1-snapshot-1 | snapshot |

Los ejemplos NeoForge 26.1.0.1-beta proceden del anuncio oficial; 26.1.2.76 ya aparece en los fixtures del instalador moderno integrado. Los tests de selección no son una comprobación HTTP de disponibilidad actual del JAR. No se afirma que esos ejemplos sean hoy la última build.

## Catálogos, dependencias y persistencia auditados

- `useSearchModel` alinea el filtro con `runtime.minecraft` y mantiene los overrides explícitos del usuario. No cambia el major ni aplica una equivalencia con 1.21.11.
- `MarketFilterPanel` consume el helper corregido; el chip muestra el identificador original.
- Modrinth construye el facet `versions:<id>` exacto junto a tipo de proyecto y loader. Mods, shaderpacks, resourcepacks y datapacks reutilizan esos caminos; datapacks se consultan bajo `mod` con facet `datapack`.
- CurseForge transmite `gameVersion` sin transformación a la búsqueda y a los métodos de archivos de proyecto. Se probaron las clases mods, resourcepacks, shaderpacks y datapacks mediante mocks del cliente.
- Los métodos de archivos y claves de consulta incluyen los filtros de versión/loader. No se encontró necesidad de cambiar el formato de caché ni de sustituir los proveedores. Los tests de esta fase verifican parámetros de búsqueda; no verifican todos los resultados de archivos en vivo ni toda la invalidación de cachés de mercado.
- `RuntimeVersionsSchema` persiste Minecraft como string. Los tests comprueban parseo y round-trip JSON de los once identificadores sin normalización.
- Las recetas vanilla solicitan el ID exacto al resolutor y conservan la URL de metadatos oficial. No introducen un loader automáticamente.
- Los selectores Fabric/Quilt y sus valores por defecto consultan los catálogos de versiones de juego del proveedor; Forge consulta el catálogo por Minecraft exacto; LabyMod usa la versión canónica reparada en Fase 5. No se inventaron loaders para 26.x.
- El parser de perfiles y el lanzamiento utilizan metadatos e herencia, no una conversión a 1.x. Java se obtiene de `javaVersion` del perfil. La rama ya incluye soporte Java 25 / `java-runtime-epsilon`, requerido por 26.1 según la documentación NeoForged; se conservaron sus implementaciones.
- La ordenación numérica de NeoForge y los tests modernos de perfiles Forge/NeoForge ya estaban integrados. No se sustituyen por comparación lexicográfica ni se reordenan releases a partir de una numeración 1.x supuesta.

No se modificaron funciones ajenas a filtros/selección de versiones, ni branding, español predeterminado, catalán, actualizador, Discord o soporte offline. No se añadieron mensajes nuevos que requieran traducción ni se eliminaron idiomas.

## Pruebas ejecutadas

Primera ejecución final: **104 tests aprobados, 0 fallidos, 8 archivos**:

- `gameVersion.test.ts`: releases antiguas/nuevas, catálogo obsoleto, identificadores exactos, duplicados y conservación de snapshots/RC reales seleccionados.
- `minecraft26Catalog.test.ts`: once round-trips de persistencia; once recetas vanilla con ID y URL exactos; filtros Modrinth para mods/shaders/resourcepacks y datapacks; parámetros CurseForge de cuatro clases.
- `neoForgeMetadata.test.ts`: asociaciones antiguas, separación 26.1/26.1.1/26.1.2 y rechazo de inferencias para snapshots/RC.
- Tests existentes de Forge, profile, recetas compartidas, ordenación NeoForge y detector de shaders.

Segunda ejecución: **48 tests aprobados y 1 omitido, 4 archivos**, de `packages/core/java.test.ts`, `packages/core/version.test.ts`, `xmcl-runtime/java/JavaService.test.ts` y `xmcl-runtime/java/zulu.test.ts`. Se conserva el test omitido existente; no se forzó una ejecución no preparada.

**Total: 152 aprobados, 0 fallidos, 1 omitido.** Los errores iniciales de tipado de mocks de clientes se corrigieron antes del typecheck final.

Las respuestas de catálogos en los tests son simuladas y vacías para inspeccionar sus solicitudes. El fixture Mojang sí procede de una respuesta oficial previa. Las recetas no descargan JARs. Los tests de procesadores/perfiles existentes usan fixtures. No se confunden estas comprobaciones con instalaciones ni lanzamientos reales.

## Compilaciones y comprobaciones

| Comprobación | Resultado |
| --- | --- |
| Typecheck Runtime API, Runtime, Electron main/preload, Keystone UI y DeskGap | Correcto en los cinco paquetes |
| Lint Runtime API, Runtime, Electron y Keystone UI | 0 errores; dos advertencias preexistentes del Runtime |
| Keystone UI | Compilación correcta, 26,87 s; verificador correcto en 103 chunks, 0 orphans |
| Electron compile | Bloqueado en `tsx` antes del build: `uv_os_get_passwd returned ENOMEM` |
| DeskGap build | Mismo bloqueo ambiental antes del build |
| CLI oficial DevTools | Mismo fallo en `os.userInfo()` antes de conectarse |
| Git diff | Sin conflictos ni errores de whitespace |

Las comprobaciones se ejecutaron por paquete con pnpm 11.10.0 ya instalado, evitando el pnpm antiguo encontrado por los scripts anidados del sistema. No se modificó la configuración compartida, dependencias o lockfile. Logs en `temp/phase7-*.log`.

El fallo de identidad ya fue reproducido sin cargar código del launcher en la Fase 5.1. Se documenta como limitación del entorno; no se atribuye a la compatibilidad 26.x. No se cambió el sandbox ni se reiniciaron procesos ajenos.

## Validaciones reales pendientes

No se instaló ni lanzó Minecraft durante esta fase. Quedan pendientes, en un entorno con permisos y conectividad:

1. Consultar de nuevo manifiestos oficiales y catálogos de archivos, comprobar IDs, disponibilidad y filtros de los cuatro tipos de contenido con respuestas actuales.
2. Crear y reiniciar instancias vanilla 26.1/26.1.2; comprobar persistencia, descarga/integridad, Java 25 y parámetros de lanzamiento.
3. Instalar solo builds de Forge/NeoForge/Fabric/Quilt/LabyMod realmente disponibles para el ID exacto. Ejecutar procesadores y revisar sus logs; no reutilizar 1.21.11 como sustituto.
4. Recorrer en la app dev los catálogos de mods/shaders/resourcepacks/datapacks al cambiar entre instancias antiguas, 26.x y prereleases, incluidos los overrides de filtro y cachés desactualizadas.
5. Lanzar el juego y probar contenido y shaders compatibles. La detección de metadatos no garantiza las dependencias o compatibilidad real de cada mod.

No se realizaron descargas masivas ni se modificaron cuentas, instancias o preferencias reales.

## Archivos y Git

Modificados (4):

- `xmcl-keystone-ui/src/util/gameVersion.ts` y `gameVersion.test.ts`.
- `xmcl-runtime/install/neoForgeMetadata.ts` y `neoForgeMetadata.test.ts`.

Nuevos (3):

- `xmcl-keystone-ui/src/composables/minecraft26Catalog.test.ts`.
- `xmcl-keystone-ui/src/util/fixtures/minecraft26.json`.
- Este informe.

El intento de `git add` vuelve a fallar al crear `.git/index.lock`: `Permission denied`. La sesión tiene lectura de `.git`, sin escritura/escalación. No se borraron locks, cambiaron permisos ni descartaron cambios. **Commit pendiente**, HEAD final `50c6ffc437df02aaea9c55982f57693c65dc4c37`.

Se conserva una copia verificada de las siete rutas en `temp/phase7-preservacion-20261010.zip`, con manifiesto de SHA-256/lista exacta y patch de archivos rastreados en el mismo prefijo. Los nuevos archivos se incluyen en el ZIP, no solo en el patch.

Una sola línea PowerShell desde el repositorio, en una sesión normal del usuario propietario:

```powershell
if ((git branch --show-current) -ne 'dev/upstream-v1.0.7') { throw 'Rama incorrecta' }; $phase7Files = (Get-Content 'temp/phase7-preservacion-20261010.manifest.json' -Raw | ConvertFrom-Json).files.path; git add -- $phase7Files; if ($LASTEXITCODE -eq 0) { git commit -m 'fix(versions): preserve Minecraft 26.x filters and match exact NeoForge hotfixes' }
```

Master y backup siguen en `c4b77e666f0b132e05e3ffff71d2728132a46a44`. Sin push, tags ni releases; versión 1.0.6. El trabajo se detiene al finalizar la Fase 7, sin iniciar la Fase 8.
