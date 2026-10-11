## **PbtModLauncherX [Versión 1.0.6] -->**

### *Esta versión incluye:*

- Correcciones mínimas de `pnpm check` en `xmcl-keystone-ui` (`i18n.ts`, `AppSystemBar.vue`, `windows/main/App.vue`).
- Ajustes de build/CI para evitar bloqueos de `cpu-features`/`node-gyp` sin cambiar la funcionalidad del launcher.
- Restauración del locale `ca` requerido por el proceso principal para completar el build.
- Naming de artefactos Linux alineado con `pbtmodlauncherx-<version>-<arch>.<ext>` y checksums SHA256 preparados.

### *Aún por añadir:*

- Generar artefactos Windows y macOS desde runners nativos de GitHub Actions antes de publicar la release manual.
