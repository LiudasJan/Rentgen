#!/bin/sh
# Symlink the bundled Rentgen CLI into /usr/bin so users can run `rentgen` from any shell.
# Runs as root via apt/dnf after package install. The Electron installer drops the binary
# into one of several possible locations depending on installer version, so probe both.
set -e

for candidate in \
    /opt/Rentgen/resources/rentgen \
    /opt/rentgen/resources/rentgen \
    /usr/lib/rentgen/resources/rentgen \
    /usr/lib/Rentgen/resources/rentgen; do
  if [ -f "$candidate" ]; then
    chmod +x "$candidate"
    ln -sf "$candidate" /usr/bin/rentgen
    exit 0
  fi
done

echo "Rentgen postinst: CLI binary not found in expected locations; you can run it from inside the app." >&2
exit 0
