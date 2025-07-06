# PbtModLauncherX (v1.0.5)

La versión del launcher X de PbtServers adaptada para su uso mejorado y offline [🚀]

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