#!/bin/sh
# Remove the /usr/bin/rentgen symlink before the package itself is removed.
# Only delete it if it is actually a symlink we created — never touch a real file.
set -e

if [ -L /usr/bin/rentgen ]; then
  rm -f /usr/bin/rentgen
fi

exit 0
