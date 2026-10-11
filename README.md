<div align="center">
  <img src="xmcl-electron-app/icons/dark@256x256.png" width="112" height="112" alt="Icono oficial de PbtModLauncherX" />
  <img src="xmcl-electron-app/icons/dark@Square44x44Logo.targetsize-256.png" width="112" height="112" alt="Icono oficial alternativo de PbtModLauncherX" />
  <h1>PbtModLauncherX</h1>
  <p><strong>El launcher de Minecraft de PbtServers.</strong></p>
  <p>
    <img src="https://img.shields.io/badge/Windows-plataforma_objetivo-0078D4" alt="Windows: plataforma objetivo" />
    <img src="https://img.shields.io/badge/Linux-plataforma_objetivo-FCC624" alt="Linux: plataforma objetivo" />
    <img src="https://img.shields.io/badge/macOS-plataforma_objetivo-555555" alt="macOS: plataforma objetivo" />
    <img src="https://img.shields.io/badge/versi%C3%B3n-1.0.7-5865F2" alt="Versión en código: 1.0.7" />
    <a href="LICENSE"><img src="https://img.shields.io/badge/licencia-MIT-green" alt="Licencia MIT" /></a>
    <img src="https://img.shields.io/badge/estado-en_validaci%C3%B3n-orange" alt="En validación" />
    <a href="https://github.com/PbtServers/PbtModLauncherX-Dev">GitHub · PbtServers</a>
  </p>
</div>

PbtModLauncherX es una adaptación y evolución de **X Minecraft Launcher**, personalizada y desarrollada para **PbtServers por PbtinaDev**, con herramientas de gestión de Minecraft, integración comunitaria, funcionalidades independientes de XMCL y asistencia mediante PbtAdmin.

PbtinaDev es la creadora, propietaria y administradora del proyecto. PbtServers es su network y comunidad; su servidor documentado es `mc.pbtservers.com`. La arquitectura y numerosos servicios proceden de [X Minecraft Launcher (XMCL), de Voxelum](https://github.com/Voxelum/x-minecraft-launcher): no es un launcher desarrollado desde cero.

## Contenido

- [Funciones y estado](#funciones-y-estado)
- [Plataformas](#plataformas)
- [Desarrollo](#desarrollo)
- [Compilación y validación](#compilación-y-validación)
- [PbtAdmin](#pbtadmin)
- [Mods y exportación de servidores](#mods-y-exportación-de-servidores)
- [¿Qué cambia respecto al X Minecraft Launcher original?](#qué-cambia-respecto-al-x-minecraft-launcher-original)
- [Estructura](#estructura)
- [Solución de problemas](#solución-de-problemas)
- [Créditos y licencias](#créditos-y-licencias)

## Funciones y estado

**IMPLEMENTADO:** existe código integrado. **VALIDADO:** comprobación ejecutada con alcance indicado. **EXPERIMENTAL:** necesita integración real adicional. **PENDIENTE:** no se presenta como terminado.

| Funcionalidad | Estado y alcance |
|---|---|
| Instancias, versiones, mods y modpacks | IMPLEMENTADO sobre servicios heredados; tests locales. Lanzamiento real pendiente |
| Vanilla, Forge, NeoForge, Fabric, Quilt, LabyMod y OptiFine | IMPLEMENTADO; selección/metadatos con regresiones. Soporte depende de versión exacta/proveedor, no todos soportan cada Minecraft |
| Minecraft 26.x | IMPLEMENTADO y VALIDADO con filtros/identificadores; no convierte 26.1 a 1.21.11. Instalación real pendiente |
| Shaders Iris, Oculus y OptiFine | IMPLEMENTADO y VALIDADO con detección/compatibilidad; requiere loader compatible. UI real pendiente |
| Iconos PNG, JPG/JPEG, WebP, GIF, BMP y SVG | IMPLEMENTADO; persistencia, contenido, GIF y movimiento reducido con tests. Reproducción visual pendiente |
| Español, catalán e inglés | IMPLEMENTADO; es-ES predeterminado en nuevas instalaciones, preferencias existentes respetadas; paridad es-ES/ca VALIDADA, otros idiomas conservados |
| Primer inicio | Correcciones IPC/estado/reintentos IMPLEMENTADAS, tests aprobados. Instalación limpia real PENDIENTE |
| PbtServers y Discord Rich Presence | Branding, recursos y presencia personalizados IMPLEMENTADOS; conexión en vivo no verificada aquí |
| Independencia de XMCL | IMPLEMENTADO; funciones locales y sustituciones propias sin cuentas/suscripciones exclusivas. No elude autenticación legítima de Minecraft |
| Actualizador PbtServers | IMPLEMENTADO y VALIDADO con fixtures/HTTP local; actualización instalada completa PENDIENTE |
| PbtAdmin/Ollama/proveedores personales | IMPLEMENTADO; herramientas/proveedores con mocks VALIDADOS. Integración real EXPERIMENTAL |
| Exportación y clasificación de mods | IMPLEMENTADO; ZIP de datos sintéticos y clasificación VALIDADOS. Servidores/Create reales PENDIENTES |

## Plataformas

Electron es el host principal. DeskGap tiene empaquetado actualmente limitado a Windows x64.

| Plataforma objetivo | Configuración declarada | Requisitos y estado real de 1.0.7 |
|---|---|---|
| Windows | Electron ZIP/AppX, objetivos x64/ia32; DeskGap x64 | Node/pnpm y toolchain nativo cuando falte un prebuild; AppX necesita identidad/firma. UI build/tests ejecutados desde Windows, main bloqueado. Ningún instalador nuevo generado/validado |
| Linux | Electron deb/rpm/AppImage/tar.xz/pacman, x64/arm64 declarados | Compilar en Linux; Python/make/C++ y dependencias gráficas según sistema. Sin ejecución ni instaladores propios 1.0.7 verificados |
| macOS | Electron DMG, x64/arm64 declarados | Compilar en macOS; Python/Command Line Tools para módulos nativos, firma/notarización según distribución. Sin ejecución ni DMG 1.0.7 verificado |

La compatibilidad heredada no sustituye pruebas propias. Las arquitecturas declaradas no son arquitecturas comprobadas. No se promete compilación cruzada ni disponibilidad pública de instaladores 1.0.7.

## Desarrollo

### Obtener el código

Se conserva el comando histórico:

```powershell
git clone --recurse-submodules https://github.com/PbtServers/PbtModLauncherX-Dev
cd PbtModLauncherX-Dev
```

El checkout auditado no contiene `.gitmodules` ni entradas Git de submódulos: la opción sigue siendo válida, pero no necesaria. Alternativa: `git clone https://github.com/PbtServers/PbtModLauncherX-Dev`. Las bibliotecas están en `packages/`. Esta preparación se realiza en `dev/upstream-v1.0.7`; la rama/commits locales pueden no estar publicados y no debe suponerse que un clon de master contiene estas fases.

### Requisitos reales

- **Node.js >=22.16.0** según engines; validaciones locales con 22.22.3 x64.
- **pnpm 11.10.0** según packageManager y `pnpm-lock.yaml`.
- **Electron 43.5.0** fijado por el proyecto, sin necesidad de instalación global.
- **Python y C/C++** cuando se reconstruyen módulos nativos; electron-rebuild interviene en empaquetado. No hay un mínimo global de Python fijado por el launcher: debe ser compatible con node-gyp. Python 3.13.13 detectado localmente no certifica todas las reconstrucciones.

Consulta las [instrucciones oficiales de node-gyp](https://github.com/nodejs/node-gyp#installation). No hace falta instalar node-gyp globalmente para comenzar.

**Windows:** instala Python y Visual Studio Build Tools con C++/Windows SDK solo si faltan. El antiguo `choco install python visualstudio2022-workload-vctools -y` es una opción de aprovisionamiento, no una dependencia por sesión; Chocolatey suele requerir terminal elevada. El desarrollo normal con pnpm no debe ejecutarse como administradora por defecto. El antiguo `pip install setuptools` no es un paso global obligatorio: los workflows añaden packaging/setuptools para casos concretos; utiliza un entorno Python dedicado si la reconstrucción los necesita.

**Linux:** Python, make y GCC/Clang para node-gyp si se compila código nativo. Los workflows instalan `libarchive-tools` con apt en runners Ubuntu; no es una receta validada para todas las distribuciones. No se ha ejecutado aquí una instalación Linux completa.

**macOS:** Python y Xcode Command Line Tools para reconstrucciones nativas. La orden oficial `xcode-select --install` corresponde a macOS si faltan; no se ha probado en este entorno Windows. Firma y notarización son requisitos separados.

### Instalar dependencias

Desde la raíz:

```powershell
node --version
pnpm --version
pnpm install --frozen-lockfile
```

`pnpm install` sigue siendo válido; `--frozen-lockfile` reproduce el checkout. No borres el lockfile para resolver un error. `pnpm-workspace.yaml` contiene los paquetes y permisos de scripts nativos; no habilites todos indiscriminadamente. La instalación ejecuta postinstall y prepara recursos/configuración local: no subas `.env` ni claves. No se ha repetido una instalación limpia en esta fase; se usan dependencias existentes.

E2E es optativo y está fuera del workspace; consulta [e2e/README.md](e2e/README.md). No hace falta para Vitest ni hay un bootstrap adicional universal documentado.

### Arrancar en desarrollo

Primera terminal, raíz del repositorio:

```powershell
pnpm dev:renderer
```

Espera a Vite en `http://localhost:3000`. Segunda terminal, misma raíz:

```powershell
pnpm dev:main
```

Renderer sirve la UI; main compila y arranca Electron. Los históricos `npm run dev:renderer` y `npm run dev:main` siguen apuntando a scripts existentes que invocan pnpm; se recomienda pnpm directamente. Detén las tareas con Ctrl+C y reutiliza las que ya estén funcionando. No cierres otros Electron.

Renderer normalmente recarga en caliente; cambios de main/runtime requieren reconstrucción y reinicio de esa app. VS Code puede ser quien arranque Electron mediante su debugger. La [guía Chrome DevTools CLI](.github/skills/chrome-devtools-cli/SKILL.md) describe la validación real en 1200×720/800×400.

## Compilación y validación

```powershell
pnpm check
pnpm lint
pnpm exec vitest run
pnpm build:renderer
pnpm --prefix=xmcl-electron-app compile
```

`build:renderer` genera `xmcl-keystone-ui/dist/` y verifica el bundle; repetir tras cambios de interfaz/traducciones y antes de copiarlo a Electron. `compile` del paquete Electron genera main/preload y copia renderer a `xmcl-electron-app/dist/`; **no produce un instalador**. `pnpm compile` raíz recorre paquetes con ese script y tampoco equivale a empaquetar.

Orden histórico de producción vigente, en Windows/Linux/macOS **desde su sistema anfitrión correspondiente**:

```powershell
pnpm build:renderer
pnpm build:all
```

`pnpm build` ejecuta Electron en modo directorio si no hay BUILD_TARGET/RELEASE. `build:all` activa empaquetado con targets configurados del host; no compila automáticamente los tres SO. Los scripts locales usan `publish: 'never'`. Artefactos: `xmcl-electron-app/build/output/`. Se requieren binarios nativos, herramientas y firma apropiados; no distribuyas salidas antiguas como nuevas. Desde 1.0.7 no se generan ASAR independientes para proteger actualizaciones de clientes antiguos.

DeskGap: `pnpm build:deskgap` genera `deskgap-app/dist/`, no un instalador. Su empaquetado Windows x64 exige fuente fijada, runtime y bootstrap: `pnpm --prefix=deskgap-app package <fuente-DeskGap> <runtime> <bootstrap.exe>`; sustituye los marcadores por rutas reales. No hay empaquetado DeskGap Linux/macOS validado.

Después de compile de producción, reconstruye dev:main antes de relanzar desarrollo: HAS_DEV_SERVER=false puede cargar la UI construida en `xmcl.runtime`, no localhost:3000.

| Comando/comprobación | Estado documentado |
|---|---|
| Instalación limpia de dependencias | NO EJECUTADO; dependencias existentes |
| `pnpm check`, `pnpm lint` | VERIFICADO con Node 22/pnpm JS y adaptador temporal de invocaciones anidadas; sin cambiar configuración del proyecto |
| Tests focalizados de metadatos, protocolo y actualización | VERIFICADO; batería amplia Fase 13 FALLIDA: 2930 aprobados, 43 fallidos, 23 omitidos |
| `pnpm build:renderer` | VERIFICADO |
| Electron compile, build:all, DeskGap build, dev:main | BLOQUEADO POR ENTORNO: os.userInfo/ENOMEM al cargar tsx |
| `pnpm dev:renderer` | NO EJECUTADO en Fase 14; script auditado, arranque main bloqueado |
| CLI DevTools | BLOQUEADO POR ENTORNO; no tarea build independiente encontrada |
| Instaladores, ejecución y actualización reales | NO EJECUTADO tras bloqueo de compilación; ningún artefacto nuevo validado |

## PbtAdmin

**PbtAdmin — Asistente de PbtServers**, creado por PbtinaDev, es una IA y administrador virtual, no una persona ni un administrador con privilegios reales.

Chat con streaming/cancelación, historial local opcional y herramientas de diagnóstico: instancias, Minecraft, Java/RAM, mods/loaders, logs, crash reports, shaders e instalación. Debe explicar resultados reales y límites. Modificar archivos requiere autorización y vista previa; el texto de un modelo no autoriza comandos arbitrarios.

**Ollama en `127.0.0.1:11434` es el proveedor predeterminado**, pero no hay modelo instalado de fábrica. Se detectan motor/modelos y se ofrece instalación/descarga consentida según recursos. Tras instalar ambos puede funcionar offline. Consulta [Ollama oficial](https://ollama.com/download); el entorno validado no dispone de motor operativo y no se descargaron modelos.

API keys personales opcionales: OpenAI, Anthropic, Gemini y endpoints compatibles con OpenAI. Pueden tener costes propios, sin suscripción XMCL. Las claves usan almacenamiento seguro; no las incluyas en logs/repositorios. Revisa el contexto autorizado antes de enviarlo a un proveedor externo.

La [base local de conocimiento](PbtModLauncherX-Data/PbtAdmin/knowledge/) recupera fragmentos y fuentes sobre soporte, network y personajes. Distingue hechos, canon proporcionado por la creadora y parodia: JuanD, 0ftome101, Thiamar22OMG, Caus y otros personajes no se confunden con datos personales reales. Informes: [IA local](PbtModLauncherX-Data/Modificaciones/PBTADMIN-IA-LOCAL-v1.0.7.md) y [lore](PbtModLauncherX-Data/Modificaciones/PBTADMIN-LORE-v1.0.7.md).

## Mods y exportación de servidores

**Exportar servidor** está integrado en el menú de acciones de instancia. El asistente revisa versión/loader exactos, destino, mundo/configuración/datapacks opcionales, RAM, mods y vista previa sin alterar la instancia original.

| Columna | Valores | Significado |
|---|---|---|
| Tipo | Cliente / Servidor / Ambos / Desconocido | Dónde puede ejecutarse según evidencias |
| Servidor | Obligatorio / Recomendado / No / Desconocido | Necesidad para el funcionamiento previsto del paquete |

Compatible con ambos lados no significa obligatorio en ambos. Se evalúan metadatos locales/proveedores, versión, loader y dependencias; se conservan explicación, fuente y confianza. Hay filtros, caché offline y ajustes manuales por instancia identificados como decisión de la usuaria, sin alterar metadatos originales. No se elimina un mod solo por su nombre.

Obligatorios: incluidos por defecto, advertencia de dependencias ausentes. Recomendados: inclusión por defecto con exclusión posible. No: excluidos con evidencias. Desconocidos: revisión explícita. PbtAdmin puede explicar el análisis real; Ollama no es requisito de exportación.

El ZIP incluye archivos revisados de mods/config/defaultconfigs/kubejs/scripts/datapacks, mundo opcional, manifest, atribuciones, README y scripts `start.bat`/`start.sh`. Excluye credenciales, secretos detectados, logs privados, cachés e incompatibles; revisa la vista previa, pues no se garantiza reconocer todo secreto arbitrario. Se protegen rutas, symlinks, cancelación y publicación temporal.

Vanilla, Forge, NeoForge y Fabric tienen recetas; Quilt conserva instalación manual documentada. No todos los builds antiguos admiten el mismo método. El instalador reproducible utiliza fuentes oficiales y hashes disponibles sin redistribuir binarios indiscriminadamente. Sigue el README del ZIP, selecciona Java compatible y lee/acepta la EULA personalmente: no se acepta automáticamente. **Servidores listos y modpack Create real siguen pendientes**, aunque los ZIP de fixtures se prueban. [Informe de exportación](PbtModLauncherX-Data/Modificaciones/EXPORTACION-SERVIDOR-v1.0.7.md).

## ¿Qué cambia respecto al X Minecraft Launcher original?

Referencias fijas: upstream [`0379941d1997e92b079fdc21e8692c8e45cd8cd7`](https://github.com/Voxelum/x-minecraft-launcher/commit/0379941d1997e92b079fdc21e8692c8e45cd8cd7) y fork local **`7e6ce52b0b018e660fa4f589cb7f969febc828b2`**, previo a esta documentación. El commit local puede no estar publicado en GitHub. No se compara contra master cambiante.

| Área | Original en la referencia | Adaptación PbtModLauncherX |
|---|---|---|
| Arquitectura/instancias/modpacks | Packages, servicios, Electron/DeskGap y UI | Conservados; no se atribuye su creación al fork |
| Branding | Identidad XMCL/Voxelum | PbtServers/PbtinaDev, iconos y Discord propios |
| Localización | Infraestructura i18n heredada | es-ES/ca revisados, español predeterminado sin borrar preferencias |
| Servicios/actualizador | Servicios y distribución XMCL | Alternativas locales/PbtServers, fuentes propias y controles; upgrade real pendiente |
| Loaders/shaders/26.x | Base heredada de instalación | Regresiones y correcciones específicas de asociación, filtrado y detección |
| Iconos/primer inicio | Servicios existentes | Persistencia/GIF/movimiento reducido y correcciones IPC/reintentos |
| IA | Infraestructura de agentes existente | Ollama/proveedores personales, identidad PbtAdmin y lore local con fuentes |
| Exportación/mods | Exportadores de modpacks heredados | Paquetes de servidor dedicado y columnas Tipo/Servidor |
| Privacidad/offline | Funciones locales y servicios existentes | Menos conexiones exclusivas, datos conservados; no elude propiedad Minecraft |

[Informe técnico completo de diferencias](PbtModLauncherX-Data/Modificaciones/DIFERENCIAS-XMCL-PBTMODLAUNCHERX-v1.0.7.md): metodología, inventario, evidencias y límites.

## Estructura

| Ruta | Contenido |
|---|---|
| `xmcl-keystone-ui/` | Interfaz Vue 3, traducciones y renderer |
| `xmcl-runtime/`, `xmcl-runtime-api/` | Servicios y contratos compartidos |
| `xmcl-electron-app/`, `deskgap-app/` | Hosts, recursos y empaquetado |
| `packages/`, `xmcl-client-vue/` | Bibliotecas y cliente de servicios |
| `scripts/`, `.github/` | Herramientas, workflows y guías |
| `PbtModLauncherX-Data/` | Recursos propios, conocimiento e informes |
| `i18n/`, READMEs por paquete | Documentación/material heredado; revisar actualidad |
| `e2e/`, archivos `*.test.ts` | Playwright optativo y Vitest junto al código |

## Solución de problemas

- **Node/pnpm:** comprueba versiones y no borres lockfiles/perfiles. El pnpm anidado del entorno usaba otro Node; un adaptador temporal por proceso permitió check/lint.
- **ENOMEM:** reproducido con `node -e "console.log(require('os').userInfo())"` sin launcher, dentro del sandbox. Prueba esa llamada en tu entorno normal. Cambiar HOME/TEMP no lo resolvió; no demuestra agotamiento de RAM ni justifica cambiar ACL o código correcto.
- **Nativos:** revisa Python/C++, arquitectura y Electron fijado; no copies binarios de versiones incompatibles ni reinstales globalmente herramientas disponibles.
- **Electron/UI:** reconstruye renderer y, tras compile, dev:main; verifica localhost:3000. No cierres procesos ajenos.
- **Primer inicio:** recuperación implementada con tests, instalación real aún pendiente. Conserva datos y recoge logs sin tokens; reset/clean no son soluciones.
- **Ollama:** comprueba motor y modelos disponibles; descarga con consentimiento. El updater no reinstala Ollama ni descarga modelos automáticamente.
- **Java:** utiliza la versión requerida por Minecraft/loader exactos; Java 25 detectado no es recomendación universal. Se conservan ajustes de Java/RAM.
- **Tests:** la batería completa tiene fallos Linux/entorno y limpieza bajo carga documentados; no se ocultan ni todos se atribuyen al producto.

El [informe del actualizador](PbtModLauncherX-Data/Modificaciones/VERSIONADO-AUTOUPDATER-v1.0.7.md) detalla endpoints existentes y límites. Abrir descarga manual no significa actualización instalada. No uses instalaciones personales para pruebas sin copia y autorización.

## Créditos y licencias

**PbtModLauncherX:** PbtinaDev / PbtServers. **Proyecto original:** [X Minecraft Launcher (XMCL) — Voxelum](https://github.com/Voxelum/x-minecraft-launcher), ci010 y sus colaboradores.

[LICENSE](LICENSE) contiene **MIT** y conserva el copyright original de ci010. Dependencias, Minecraft, mods y recursos mantienen licencias/condiciones propias. La adaptación no reclama autoría del código heredado ni modifica condiciones de Microsoft/Mojang o de otros proveedores.
