# 🔬 Rentgen

**Rentgen** is an API testing tool that works like an X-ray: it **exposes what’s really happening inside your APIs**.

but built for:

- 🚀 **Generate hundreds of tests** - from one simple request
- 🔌 **WebSockets (WSS)** — live bi-directional testing
- 📦 **Protobuf payloads** — load `.proto` schemas, encode requests, decode responses
- 🛠️ **Raw testing freedom** — send malformed or ugly payloads without restrictions
- 🏗️ **Lightweight** and no complex setup

---

## ✨ Why Rentgen?

Fokus on what to test not how to test.

**Rentgen** lets you do all of this in a familiar Postman-like interface.

---

## 🚀 Features

- 🔐 **Security & Headers checks** — built-in automated tests (sensitive headers, OPTIONS, unsupported methods, etc.)
- 📊 **Data Handling & Input Validation testing** — generate multiple tests from one request & dataset
- 🚀 **Performance Insights** — mediana and ping check out of the box
- 🌐 **HTTP/HTTPS support** — all standard methods (GET, POST, PUT, PATCH, DELETE, OPTIONS, etc.)
- 🔄 **WebSocket testing** — connect, send, and inspect messages
- 🐛 **Protobuf integration** — load `.proto` schemas, encode requests, decode responses
- 🧪 **Send malformed payloads** — because this is testing, not production
- 🖥️ **Postman-like UI** — no learning curve, just start testing
- 🔒 **Ignore SSL validation** (for staging/test servers)

---

## 🏗️ Roadmap

- [ ] Extend **security test suite** (more headers, SSL configs, CORS checks)
- [ ] Broader **data handling checks** (trimming, limits, encoding issues)
- [ ] Authentication & authorization scenarios (401 vs 403, token expiry)
- [ ] Response code validation (empty vs not found, list pagination)
- [ ] Performance & abuse prevention (rate limits, stress checks, load test)
- [ ] Tabbed requests / workspaces / save project
- [ ] Custom data-sets, easy import/export
- [ ] Generate full integration CRUD tests
- [ ] Run in CI/CD
- [ ] Export to Playwrigth, Cypress etc.
- [ ] gRPC support
- [ ] Plugins/extensions
- [ ] Fuzzing & SQLi/XSS payload libraries

---

## 🎬 Demo

![Rentgen Demo](./public/demo.gif)

## 🔧 Installation

### Dev mode

```bash
git clone https://github.com/LiudasJan/Rentgen.git
cd rentgen
npm install
npm run electron:dev
---

## 🖥️ Building executables

## You can package Rentgen into a standalone app (.exe for Windows, .dmg for macOS, .AppImage for Linux).

### 1. Create build
npm run build

### 2. Package with Electron
npm run electron:build
```
