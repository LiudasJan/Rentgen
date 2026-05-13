# syntax=docker/dockerfile:1.7

FROM node:22-slim

LABEL org.opencontainers.image.source="https://github.com/Rentgen-io/Rentgen"
LABEL org.opencontainers.image.description="Rentgen CLI — run .rentgen project exports in CI"
LABEL org.opencontainers.image.licenses="RSAL-1.0"

WORKDIR /work

COPY dist/cli-bundle/index.js /app/cli.js

# Wrapper on PATH so `script: rentgen inspect ...` works in CI runners
# (GitLab/Jenkins/Bitbucket) that override the container's ENTRYPOINT
# with a shell.
RUN printf '#!/bin/sh\nexec node /app/cli.js "$@"\n' > /usr/local/bin/rentgen \
 && chmod +x /usr/local/bin/rentgen

ENTRYPOINT ["rentgen"]
