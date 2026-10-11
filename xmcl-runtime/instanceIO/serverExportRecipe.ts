import type { ServerInstallRecipe } from '@xmcl/runtime-api'

const officialHosts = new Set(['piston-meta.mojang.com', 'launchermeta.mojang.com', 'piston-data.mojang.com', 'launcher.mojang.com', 'maven.minecraftforge.net', 'maven.neoforged.net', 'meta.fabricmc.net', 'maven.fabricmc.net', 'meta.quiltmc.org', 'maven.quiltmc.org'])
export function officialServerUrl(value: string) {
  const url = new URL(value)
  if (url.protocol !== 'https:' || url.username || url.password || url.port || !officialHosts.has(url.hostname)) throw new Error('untrustedSource')
  return url.toString()
}
export function exactServerVersion(value: string) {
  if (!/^[A-Za-z0-9][A-Za-z0-9._+-]{0,95}$/.test(value)) throw new Error('invalidVersion')
  return value
}

export const generatedServerFiles = ['server-manifest.json', 'server-install.json', 'install.py', 'start.bat', 'start.sh', 'README.md', 'README-es-ES.md', 'README-ca.md', 'README-en.md', 'ATTRIBUTIONS.md', 'eula.txt', 'user_jvm_args.txt']

export function serverPackageGeneratedFiles(recipe: ServerInstallRecipe, memoryMiB: number, manifest: unknown, locale: 'es-ES' | 'ca' | 'en' = 'es-ES') {
  const jar = recipe.launchJar ?? ''
  const launchWindows = jar ? `java -Xms512M -Xmx${memoryMiB}M -jar "${jar}" nogui` : 'call run.bat nogui'
  const launchLinux = jar ? `exec java -Xms512M -Xmx${memoryMiB}M -jar '${jar}' nogui` : 'exec sh ./run.sh nogui'
  const eulaMessage = locale === 'ca' ? 'Llegeix README.md i la Minecraft EULA. Accepta-la manualment a eula.txt.' : locale === 'en' ? 'Read README.md and the Minecraft EULA. Accept it manually in eula.txt.' : 'Lee README.md y la EULA de Minecraft. Acéptala manualmente en eula.txt.'
  const installMessage = locale === 'ca' ? 'Executa primer install.py.' : locale === 'en' ? 'Run install.py first.' : 'Ejecuta primero install.py.'
  const files = {
    'server-manifest.json': JSON.stringify(manifest, null, 2) + '\n',
    'server-install.json': JSON.stringify({ ...recipe, locale }, null, 2) + '\n',
    'install.py': installerScript,
    'eula.txt': '# Read https://www.minecraft.net/en-us/eula before changing this file.\neula=false\n',
    'user_jvm_args.txt': `-Xms512M\n-Xmx${memoryMiB}M\n`,
    'start.bat': `@echo off\r\nsetlocal\r\ncd /d "%~dp0"\r\nfindstr /r /c:"^eula=true$" eula.txt >nul 2>&1\r\nif errorlevel 1 (echo ${eulaMessage} & exit /b 1)\r\n${jar ? `if not exist "${jar}" (echo ${installMessage} & exit /b 1)` : `if not exist run.bat (echo ${installMessage} & exit /b 1)`}\r\n${launchWindows}\r\n`,
    'start.sh': `#!/bin/sh\nset -eu\ncd -- "$(dirname -- "$0")"\ntr -d '\\r' < eula.txt | grep -Eq '^eula=true$' || { echo '${eulaMessage}'; exit 1; }\n${jar ? `[ -f '${jar}' ]` : '[ -f run.sh ]'} || { echo '${installMessage}'; exit 1; }\n${launchLinux}\n`,
    'README.md': `# PbtModLauncherX — dedicated server export\n\nMinecraft: ${recipe.minecraft}\nLoader: ${recipe.loader} ${recipe.loaderVersion}\nJava: ${recipe.java} (minimum reported by official Minecraft metadata). RAM: ${memoryMiB} MiB; leave RAM for the OS. Actual requirements depend on world, players and mods.\n\nThis is an installation package, NOT an already tested running server. Review server-manifest.json, excluded files, every unknown mod, dependency version ranges and redistribution licenses before deployment. No Minecraft binary is redistributed. Mod JARs retain their embedded licenses; ATTRIBUTIONS.md lists the analyzed mod identities.\n\n1. Extract to a new, writable directory. Install Java ${recipe.java} or a compatible version required by your loader, and Python 3.\n2. Review server-install.json and install.py. Run python install.py (Windows: py -3 install.py); type INSTALL only after reviewing the official download URL. SHA-1 is checked against metadata recorded at export. Network is needed for this step and loader libraries.\n3. ${recipe.loader === 'quilt' ? `Quilt requires manual installation: run java -jar installer.jar; select Server, EXACT Minecraft ${recipe.minecraft}, loader ${recipe.loaderVersion}, THIS export directory and Download server jar. Do not use a different version. ` : ''}Read https://www.minecraft.net/en-us/eula and accept it yourself in eula.txt if you agree. No script accepts it for you.\n4. Windows: start.bat. Linux/macOS: sh start.sh (or chmod +x start.sh). Forge/NeoForge use the official run scripts and user_jvm_args.txt.\n5. Wait for the server's Done/ready log. This has NOT been verified by export alone. Port 25565 is the normal default; configure network/firewall yourself. Keep online-mode=true and official Minecraft authentication.\n\nWorld export omits playerdata, stats, advancements and session.lock for privacy. Back up before deployment; player inventories/progress may need a separate authorized migration. Root datapacks are exported to world/datapacks. Never run a server on a world currently open in the client. Config/scripts are selected explicitly and scanned for likely secrets/absolute paths; scanning is heuristic, so manually review them. Never distribute private data.\n\nOfficial instructions: ${recipe.instructionsUrl}\n`,
    'ATTRIBUTIONS.md': '# Attributions\n\nPbtModLauncherX by PbtinaDev / PbtServers; derived from Voxelum/x-minecraft-launcher (MIT). Minecraft is a Mojang/Microsoft product; this package is not official or endorsed. Loader and mod copyrights/licenses belong to their authors. Embedded licenses in JARs are preserved. Permission to redistribute must be verified by the exporter; this manifest does not grant permission.\n',
  }
  const spanish = `# PbtModLauncherX — servidor dedicado\n\nMinecraft: ${recipe.minecraft}. Loader: ${recipe.loader} ${recipe.loaderVersion}. Java mínimo según Mojang: ${recipe.java}. Memoria máxima elegida: ${memoryMiB} MiB. La RAM recomendada es una estimación por número de mods; deja memoria para el sistema y comprueba jugadores, mundo y rendimiento.\n\nEste es un paquete de instalación, NO un servidor cuyo arranque se haya verificado. No redistribuye Minecraft. Revisa server-manifest.json, los mods desconocidos, dependencias y rangos de versiones, configuraciones, scripts y permisos de redistribución. Las licencias incluidas en los JAR se conservan; consulta ATTRIBUTIONS.md y a cada autora o autor.\n\n1. Extrae en una carpeta nueva. Instala Java ${recipe.java} o la versión compatible que exija tu loader y Python 3.\n2. Revisa server-install.json e install.py. Ejecuta python install.py o, en Windows, py -3 install.py. Escribe INSTALL solo tras revisar el origen oficial. Se verifica SHA-1 antes de usar el binario; la instalación necesita Internet para el servidor y sus bibliotecas. No se descarga nada al exportar.\n3. ${recipe.loader === 'quilt' ? `Quilt requiere instalación manual: java -jar installer.jar, pestaña Server, Minecraft EXACTAMENTE ${recipe.minecraft}, loader ${recipe.loaderVersion}, ESTA carpeta y Download server jar. ` : ''}Lee https://www.minecraft.net/en-us/eula y, si aceptas, modifica eula.txt tú mismo. Ningún script la acepta automáticamente.\n4. Windows: start.bat. Linux/macOS: sh start.sh. Forge/NeoForge usan sus run.bat/run.sh oficiales y user_jvm_args.txt.\n5. Comprueba que el log llegue al estado listo/Done. No está probado por crear este ZIP. El puerto habitual es 25565; configura red y cortafuegos según tu entorno. Conserva online-mode=true y autenticación oficial.\n\nEl mundo exportado omite playerdata, estadísticas, avances y session.lock por privacidad. Inventarios y progreso pueden necesitar una migración separada autorizada. Haz copia de seguridad y cierra el juego antes de exportar. Los datapacks raíz van a world/datapacks. La detección de secretos y rutas absolutas es heurística: revisa manualmente antes de compartir.\n\nInstrucciones oficiales: ${recipe.instructionsUrl}\n`;
  const catalan = `# PbtModLauncherX — servidor dedicat\n\nMinecraft: ${recipe.minecraft}. Loader: ${recipe.loader} ${recipe.loaderVersion}. Java mínim segons Mojang: ${recipe.java}. Memòria màxima triada: ${memoryMiB} MiB. La RAM recomanada és una estimació pel nombre de mods; deixa memòria per al sistema i comprova jugadors, món i rendiment.\n\nAquest és un paquet d’instal·lació, NO un servidor amb l’arrencada verificada. No redistribueix Minecraft. Revisa server-manifest.json, els mods desconeguts, dependències i rangs de versions, configuracions, scripts i permisos de redistribució. Es conserven les llicències dels JAR; consulta ATTRIBUTIONS.md i cada autora o autor.\n\n1. Extreu en una carpeta nova. Instal·la Java ${recipe.java} o la versió compatible que exigeixi el loader i Python 3.\n2. Revisa server-install.json i install.py. Executa python install.py o, al Windows, py -3 install.py. Escriu INSTALL només després de revisar l’origen oficial. Es verifica SHA-1 abans d’usar el binari; la instal·lació necessita Internet per al servidor i les biblioteques. No es descarrega res en exportar.\n3. ${recipe.loader === 'quilt' ? `Quilt requereix instal·lació manual: java -jar installer.jar, pestanya Server, Minecraft EXACTAMENT ${recipe.minecraft}, loader ${recipe.loaderVersion}, AQUESTA carpeta i Download server jar. ` : ''}Llegeix https://www.minecraft.net/en-us/eula i, si hi estàs d’acord, modifica eula.txt tu mateix. Cap script no l’accepta automàticament.\n4. Windows: start.bat. Linux/macOS: sh start.sh. Forge/NeoForge fan servir els run.bat/run.sh oficials i user_jvm_args.txt.\n5. Comprova que el log arribi a l’estat llest/Done. Crear el ZIP no ho acredita. El port habitual és 25565; configura la xarxa i el tallafoc segons l’entorn. Mantén online-mode=true i l’autenticació oficial.\n\nEl món exportat omet playerdata, estadístiques, avenços i session.lock per privacitat. Els inventaris i el progrés poden requerir una migració separada autoritzada. Fes una còpia de seguretat i tanca el joc abans d’exportar. Els datapacks arrel van a world/datapacks. La detecció de secrets i rutes absolutes és heurística: revisa’ls manualment abans de compartir.\n\nInstruccions oficials: ${recipe.instructionsUrl}\n`;
  return { ...files, 'README-en.md': files['README.md'], 'README-es-ES.md': spanish, 'README-ca.md': catalan, 'README.md': locale === 'en' ? files['README.md'] : locale === 'ca' ? catalan : spanish }
}

const installerScript = `#!/usr/bin/env python3
"""Official installer/download only; no EULA acceptance or private launcher data."""
import hashlib, json, os, pathlib, re, subprocess, urllib.request, urllib.parse

LOCALE = "es-ES"
TEXT = {"es-ES": {"Untrusted download URL": "Origen de descarga no autorizado", "Invalid download manifest": "Manifiesto de descarga no válido", "Official source:": "Origen oficial:", "Expected SHA-1:": "SHA-1 esperado:", "Java required:": "Java requerido:", "- Minecraft EULA is NOT accepted automatically.": "- La EULA de Minecraft NO se acepta automáticamente.", "Review README and licenses. Type INSTALL to download and install: ": "Revisa el README y las licencias. Escribe INSTALL para descargar e instalar: ", "Java too old or unrecognized; install the required Java first": "Java antiguo o no reconocido; instala primero el Java requerido", "Refusing overwrite; use a fresh deployment directory": "No se sobrescribe; utiliza una carpeta de despliegue nueva", "Download exceeds limit": "La descarga supera el límite", "SHA-1 mismatch; installer will not run": "SHA-1 incorrecto; no se ejecutará el instalador", "Download verified. Follow the exact manual Quilt installation in README.md.": "Descarga verificada. Sigue la instalación manual exacta de Quilt en README.md.", "Unknown installer command; nothing executed": "Orden de instalación desconocida; no se ha ejecutado nada", "Installation step finished. Review EULA manually and use start.bat / sh start.sh.": "Instalación finalizada. Revisa la EULA manualmente y usa start.bat / sh start.sh."}, "ca": {"Untrusted download URL": "Origen de descàrrega no autoritzat", "Invalid download manifest": "Manifest de descàrrega no vàlid", "Official source:": "Origen oficial:", "Expected SHA-1:": "SHA-1 esperat:", "Java required:": "Java requerit:", "- Minecraft EULA is NOT accepted automatically.": "- L’EULA de Minecraft NO s’accepta automàticament.", "Review README and licenses. Type INSTALL to download and install: ": "Revisa el README i les llicències. Escriu INSTALL per descarregar i instal·lar: ", "Java too old or unrecognized; install the required Java first": "Java antic o no reconegut; instal·la primer el Java requerit", "Refusing overwrite; use a fresh deployment directory": "No se sobreescriu; utilitza una carpeta de desplegament nova", "Download exceeds limit": "La descàrrega supera el límit", "SHA-1 mismatch; installer will not run": "SHA-1 incorrecte; no s’executarà l’instal·lador", "Download verified. Follow the exact manual Quilt installation in README.md.": "Descàrrega verificada. Segueix la instal·lació manual exacta de Quilt a README.md.", "Unknown installer command; nothing executed": "Ordre d’instal·lació desconeguda; no s’ha executat res", "Installation step finished. Review EULA manually and use start.bat / sh start.sh.": "Instal·lació finalitzada. Revisa l’EULA manualment i usa start.bat / sh start.sh."}}

def tr(text):
    return TEXT.get(LOCALE, {}).get(text, text)

ROOT = pathlib.Path(__file__).resolve().parent
ALLOWED = ${JSON.stringify([...officialHosts])}

def checked_url(url):
    p = urllib.parse.urlparse(url)
    if p.scheme != 'https' or p.hostname not in ALLOWED or p.username or p.password or p.port:
        raise RuntimeError(tr('Untrusted download URL'))
    return url

class SafeRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return super().redirect_request(req, fp, code, msg, headers, checked_url(newurl))

def main():
    global LOCALE
    recipe = json.loads((ROOT / 'server-install.json').read_text(encoding='utf-8'))
    LOCALE = recipe.get('locale', 'es-ES')
    download = recipe['download']
    url = checked_url(download['url'])
    if download['name'] not in ['server.jar', 'installer.jar'] or not re.fullmatch('[a-fA-F0-9]{40}', download['sha1']):
        raise RuntimeError(tr('Invalid download manifest'))
    print('Minecraft:', recipe['minecraft'], 'Loader:', recipe['loader'], recipe['loaderVersion'])
    print(tr('Official source:'), url, tr('Expected SHA-1:'), download['sha1'])
    print(tr('Java required:'), recipe['java'], tr('- Minecraft EULA is NOT accepted automatically.'))
    if input(tr('Review README and licenses. Type INSTALL to download and install: ')) != 'INSTALL':
        return
    version = subprocess.run(['java', '-version'], capture_output=True, text=True, check=True)
    match = re.search(r'version "(?:1\\.)?(\\d+)', version.stderr + version.stdout)
    if not match or int(match.group(1)) < recipe['java']:
        raise RuntimeError(tr('Java too old or unrecognized; install the required Java first'))
    target = ROOT / download['name']
    partial = ROOT / (download['name'] + '.download')
    if target.exists() or partial.exists():
        raise RuntimeError(tr('Refusing overwrite; use a fresh deployment directory'))
    digest = hashlib.sha1()
    created = False
    try:
        opener = urllib.request.build_opener(SafeRedirect())
        with opener.open(url, timeout=30) as response, partial.open('xb') as output:
            created = True
            checked_url(response.geturl())
            total = 0
            while True:
                chunk = response.read(1024 * 1024)
                if not chunk: break
                total += len(chunk)
                if total > 512 * 1024 * 1024: raise RuntimeError(tr('Download exceeds limit'))
                digest.update(chunk); output.write(chunk)
        if digest.hexdigest().lower() != download['sha1'].lower():
            raise RuntimeError(tr('SHA-1 mismatch; installer will not run'))
        os.link(partial, target)
    finally:
        if created: partial.unlink(missing_ok=True)
    args = recipe['installArgs']
    loader = recipe['loader']
    if loader in ['forge', 'neoforge'] and args == ['--installServer']:
        subprocess.run(['java', '-jar', 'installer.jar', '--installServer'], cwd=ROOT, check=True)
    elif loader == 'fabric' and args == ['server', '-mcversion', recipe['minecraft'], '-loader', recipe['loaderVersion'], '-downloadMinecraft']:
        subprocess.run(['java', '-jar', 'installer.jar'] + args, cwd=ROOT, check=True)
    elif loader == 'quilt' and args == []:
        print(tr('Download verified. Follow the exact manual Quilt installation in README.md.'))
    elif loader != 'vanilla' or args != []:
        raise RuntimeError(tr('Unknown installer command; nothing executed'))
    print(tr('Installation step finished. Review EULA manually and use start.bat / sh start.sh.'))

if __name__ == '__main__':
    main()
`
