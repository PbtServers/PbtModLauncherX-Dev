# PbtModLauncherX portable installation

`install.ps1` (Windows) and `install.sh` (Linux/macOS) download portable releases
from **PbtServers/PbtModLauncherX-Dev** and require their SHA-256 files.
They preserve the packaged executables, icons, signatures and metadata.
Existing destinations are refused; launcher user-data directories are untouched.

```powershell
.\install.ps1 -Version 1.0.6 -InstallDir D:\Apps\PbtModLauncherX
```

```sh
sh ./install.sh --version 1.0.6 --install-dir "$HOME/Apps/PbtModLauncherX"
```

Omit the version to select the latest GitHub release. Add `-Launch` / `--launch`
to start after installation. Windows uses x64/ia32 ZIPs; Linux uses x64/arm64
tar.xz; macOS uses per-architecture ZIPs or DMGs. Linux requires curl, tar/xz
and sha256sum or shasum. macOS also uses its built-in ditto/hdiutil tools.

## Original upstream tools

`upstream/install.ps1` and `upstream/install.sh` are unchanged tools from
[Voxelum/X Minecraft Launcher](https://github.com/Voxelum/x-minecraft-launcher)
(MIT). They reconstruct **XMCL**, not PbtModLauncherX, from third-party
`@xmcl/app-*` payloads and retain the original npm mirror parameters.
They preserve that upstream functionality and attribution; use the scripts
at the top level to install PbtModLauncherX.
