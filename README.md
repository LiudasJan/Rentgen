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

## 🧠 Real-world API test example and results

I tested **ChatGPT’s backend API** using RENTGEN — the exact same endpoint used by the web app:

**Endpoint:** `https://chatgpt.com/backend-api/f/conversation/prepare`

In less than a minute, RENTGEN automatically generated and executed 200+ API tests, including security, headers, and input validation checks.

Here’s what was found:

1️⃣ **CORS policy wide open** – API accepts requests from any domain (no CORS restriction).  
2️⃣ **Missing security headers** – no `X-Frame-Options` or `Cache-Control`.  
3️⃣ **OPTIONS method not supported** – violates API interoperability rules.  
4️⃣ **Body size handling broken** – server returns 500 instead of 413 Payload Too Large.  
5️⃣ **Authorization handling inconsistent** – returns 403 instead of expected 401.  
6️⃣ **Input validation missing** – incorrect field types still return 200 OK.  
7️⃣ **404 handling correct** – works as expected.  
8️⃣ **Performance solid** – median 184 ms response time.

📖 **Read the full case study here:**  
👉 [I tested ChatGPT’s backend API using RENTGEN, and found more issues than expected](https://www.linkedin.com/pulse/i-tested-chatgpts-backend-api-using-rentgen-found-more-jankauskas-ixsnf/)

## 🔧 Installation

### Dev mode

```bash
git clone https://github.com/LiudasJan/Rentgen.git
cd rentgen
npm install
npm run electron:dev

```

### 🖥️ Building executables

**You can package Rentgen into a standalone app (.exe for Windows, .dmg for macOS, .AppImage for Linux)**
[Issue exists](https://github.com/LiudasJan/Rentgen/issues/3) **Please keep using Dev mode for now.**

```bash
### 1. Create build
npm run build

### 2. Package with Electron
npm run electron:build
```
