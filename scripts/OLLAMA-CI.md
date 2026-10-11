# Bundled AI build and release repair (1.0.7)

`build.yml` prepares official Ollama v0.34.0 before the launcher build. Linux
prepares `linux-x64` and `linux-arm64`, macOS `mac-x64` and `mac-arm64`, and
Windows `win-x64`, matching electron-builder's existing targets. Node 24 runs
the TypeScript-aware preparers through tsx. Linux installs zstd for extraction.

The official GitHub release asset digest and size are checked before extraction.
The MIT license, executable architecture and every bundled file hash are checked.
The verified macOS v0.34.0 archive contains dylib symlink aliases. Internal
regular-file `.dylib`/`.so` aliases are materialized before manifest generation;
external, directory, broken and non-library links remain forbidden.
Native `--version` runs only for the runner's architecture. The opposite
architecture is inspected, not claimed to have passed native execution.

The model preparer first pulls `qwen3:4b-q4_K_M` into a new isolated store.
If this fails, the existing official Qwen GGUF importer verifies the pinned
manufacturer LFS SHA-256 and Apache 2.0 license and publishes the compatible
`pbtadmin-qwen3:4b-q4_K_M` factory alias. Both sources are validated by the
packager's model validator under `build/ollama/ollama-model`. No personal store,
TLS bypass, committed weights, or empty placeholder directory is used.

Preparation checks free space (Linux 40 GiB, Windows 20 GiB, macOS 12 GiB).
Linux removes only unused hosted-runner Android/.NET/GHC toolchains. Successful
runtime archive staging and the GGUF import cache are removed to save space.
Insufficient space, unsupported archives, hash errors or incomplete final seeds
fail the job. Bundled distributions require substantial additional disk space;
the first full hosted run must confirm peak consumption on each runner.

All three jobs must succeed before publication. A tag push or manual dispatch
with `tag=v1.0.7` attaches assets to an **existing** release with the same project
version. A master push only builds. Manual dispatch on master uses the repaired
workflow without moving the published tag. The token must be able to see the
release in this repository; a missing/inaccessible release fails closed.
Notes, title, draft status and unrelated assets are never edited. Same-name
assets are replaced on retry and publication runs are serialized.

GitHub limits each release asset to 2 GiB. Larger distributions are published
as ordered 1 GiB `.partNNN` files with `REASSEMBLE.txt` and `SPLIT-ASSETS.json`.
Reassemble and verify the original SHA-256 before installation. These split
assets require manual installation; they are not direct updater downloads.
When splitting is needed, new `latest*.yml` updater manifests are withheld,
because their whole-file URLs would not point to the uploaded parts. Existing
release metadata/assets are preserved; no automatic AI upgrade is claimed.
`SHA256SUMS.txt` covers actual uploaded files, excluding itself. It covers this
successful build, not unrelated assets retained from older uploads.

Local validation does not replace native package execution on all platforms or
the first Actions build. Do not describe cross-architecture checks as native tests.
