#!/bin/sh
# PbtModLauncherX portable installer for macOS and Linux (MIT).
# Original XMCL npm reconstruction is preserved in upstream/install.sh.
# Downloads only PbtServers artifacts and verifies their SHA-256.
set -eu
VERSION=latest
INSTALL_DIR="${PBTMODLAUNCHERX_INSTALL_DIR:-${XMCL_INSTALL_DIR:-}}"
LAUNCH=0
while [ "$#" -gt 0 ]; do
  case "$1" in
    --version) VERSION="$2"; shift 2 ;;
    --install-dir) INSTALL_DIR="$2"; shift 2 ;;
    --launch) LAUNCH=1; shift ;;
    *) echo "PbtModLauncherX: unknown option $1" >&2; exit 1 ;;
  esac
done
die() { echo "PbtModLauncherX: $*" >&2; exit 1; }
command -v curl >/dev/null 2>&1 || die 'curl is required'
command -v tar >/dev/null 2>&1 || die 'tar is required'
base=https://github.com/PbtServers/PbtModLauncherX-Dev/releases
if [ "$VERSION" = latest ]; then
  resolved=$(curl -fsSL -o /dev/null -w '%{url_effective}' "$base/latest")
  VERSION=${resolved##*/}
fi
VERSION=${VERSION#v}
case "$VERSION" in ''|*[!0-9A-Za-z.+-]*) die 'invalid release version' ;; esac
case "$VERSION" in [0-9]*) ;; *) die 'invalid release version' ;; esac
case "$(uname -m)" in x86_64|amd64) arch=x64 ;; arm64|aarch64) arch=arm64 ;; *) die 'unsupported architecture' ;; esac
case "$(uname -s)" in
  Linux)
    os=linux
    [ -n "$INSTALL_DIR" ] || INSTALL_DIR="$HOME/.local/share/pbtmodlauncherx"
    destination=$INSTALL_DIR
    artifact="pbtmodlauncherx-$VERSION-$arch.tar.xz"
    ;;
  Darwin)
    os=mac
    [ -n "$INSTALL_DIR" ] || INSTALL_DIR="$HOME/Applications"
    destination="$INSTALL_DIR/PbtModLauncherX.app"
    artifact="pbtmodlauncherx-$VERSION-darwin-$arch.zip"
    if ! curl -fsSI "$base/download/v$VERSION/$artifact" >/dev/null 2>&1; then artifact="pbtmodlauncherx-$VERSION-$arch.dmg"; fi
    ;;
  *) die 'only macOS and Linux are supported' ;;
esac
[ ! -e "$destination" ] && [ ! -L "$destination" ] || die "destination already exists: $destination"
temporary=$(mktemp -d "${TMPDIR:-/tmp}/pbtmodlauncherx-install.XXXXXXXX")
mountpoint=
cleanup() {
  if [ -n "$mountpoint" ]; then hdiutil detach "$mountpoint" >/dev/null 2>&1 || true; fi
  case "$temporary" in "${TMPDIR:-/tmp}"/pbtmodlauncherx-install.*) rm -rf -- "$temporary" ;; esac
}
trap cleanup EXIT
trap 'exit 1' INT TERM
archive="$temporary/$artifact"
echo "Installing PbtModLauncherX $VERSION ($arch)"
curl -fsSL "$base/download/v$VERSION/$artifact" -o "$archive"
curl -fsSL "$base/download/v$VERSION/$artifact.sha256" -o "$archive.sha256"
expected=$(awk 'NR == 1 {print $1}' "$archive.sha256" | tr 'A-F' 'a-f')
[ "${#expected}" -eq 64 ] || die 'invalid SHA-256'
case "$expected" in *[!0-9a-f]*) die 'invalid SHA-256' ;; esac
if command -v sha256sum >/dev/null 2>&1; then actual=$(sha256sum "$archive" | awk '{print $1}')
elif command -v shasum >/dev/null 2>&1; then actual=$(shasum -a 256 "$archive" | awk '{print $1}')
else die 'sha256sum or shasum is required'; fi
[ "$expected" = "$actual" ] || die 'portable archive SHA-256 mismatch'
mkdir "$temporary/application"
if [ "$os" = linux ]; then
  tar -xJf "$archive" -C "$temporary/application"
  [ -f "$temporary/application/pbtmodlauncherx" ] || die 'archive has no pbtmodlauncherx executable'
  [ ! -e "$destination" ] && [ ! -L "$destination" ] || die 'destination now exists'
  mkdir -p "$(dirname "$destination")"
  mv "$temporary/application" "$destination"
  echo "PbtModLauncherX installed at $destination"
  if [ "$LAUNCH" -eq 1 ]; then "$destination/pbtmodlauncherx" >/dev/null 2>&1 & fi
else
  case "$artifact" in
    *.zip) ditto -x -k "$archive" "$temporary/application"; source="$temporary/application/PbtModLauncherX.app" ;;
    *.dmg)
      mountpoint="$temporary/mount"
      mkdir "$mountpoint"
      hdiutil attach "$archive" -mountpoint "$mountpoint" -nobrowse -readonly >/dev/null
      source="$mountpoint/PbtModLauncherX.app"
      ;;
  esac
  [ -d "$source" ] || die 'archive has no PbtModLauncherX.app'
  [ ! -e "$destination" ] && [ ! -L "$destination" ] || die 'destination now exists'
  mkdir -p "$INSTALL_DIR"
  ditto "$source" "$destination"
  echo "PbtModLauncherX installed at $destination"
  if [ "$LAUNCH" -eq 1 ]; then open "$destination"; fi
fi
