# PbtModLauncherX (v1.0.6)

La versión del launcher X de PbtServers adaptada para su uso mejorado y offline [🚀]

Basado en [X Minecraft Launcher](https://github.com/Voxelum/x-minecraft-launcher), de ci010 y sus colaboradores, bajo licencia MIT. Se mantienen los créditos, licencias y documentación del proyecto original y de sus dependencias.

Esta rama integra upstream `0379941d` con la arquitectura `packages/`, Vue 3 y los hosts Electron y DeskGap. La versión oficial permanece en **1.0.6** mientras se valida la futura v1.0.7.

La compilación requiere **Node.js >=22.16.0** y **pnpm 11.10.0**. En Windows, los módulos nativos necesitan las herramientas C++ de Visual Studio y Python. Usar `pnpm install --frozen-lockfile`, `pnpm check`, `pnpm build:renderer` y `pnpm compile` para validar el checkout. El empaquetado con `pnpm build:all` requiere además las herramientas y certificados de la plataforma correspondiente.

![pbtmodlauncherx](https://github.com/PbtServers/PbtModLauncherX-Dev/blob/master/xmcl-electron-app/icons/dark@256x256.png?raw=true)
![pbtmodlauncherx](https://github.com/PbtServers/PbtModLauncherX-Dev/blob/master/xmcl-electron-app/icons/dark@Square44x44Logo.targetsize-256.png?raw=true)

Clonar Repositorio -->                                                                                                                                           
`git clone --recurse-submodules https://github.com/PbtServers/PbtModLauncherX-Dev`

Instalar Dependencias y Ejecutar Dev -->                                                                                                                         
(Ejecutar Compilación habitual)

`choco install python visualstudio2022-workload-vctools -y`
`pip install setuptools`

`pnpm install`                                                                                                                                                   
`npm run dev:renderer`                                                                                                                                           
En otra terminal (revisar proceso principal) -> `npm run dev:main`

Compilar Producción -->                                                                                                                                          
`pnpm build:renderer` (si se modifica xmcl-keystone-ui ejecutar otra vez)                                                                                        
`pnpm build:all`
