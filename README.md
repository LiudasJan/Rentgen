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

## 🚀 Key Features

- 🧪 **Data-Driven Testing** — generate dozens of tests from a single request using smart datasets and field type detection - (`string`, `number`, `email`, etc.)
- 🔒 **Security & Headers Audit** — built-in OWASP checks for headers, methods, CORS, and authorization handling
- ⚡ **Performance Insights** — median response time, ping latency, and load test with live `p50/p90/p95` metrics
- 📬 **HTTP & WebSocket Support** — send requests or connect to WSS endpoints, both JSON and Protobuf
- 🐛 **Protobuf Integration** — import `.proto` schemas to encode requests and decode binary responses
- 🧷 **Randomized Payloads** — `randomInt`, `random32`, and `randomEmail` for unique data in each request
- 🔁 **Load & Stress Testing** — multi-threaded (up to 100 concurrent) requests with automatic abort on slowdowns
- 🧩 **Automatic Field Mapping** — detects all body and query params with editable type selection
- 🖥️ **Postman-like UI** — instant usability, “Import cURL” support, and “Copy as cURL” for reproducibility
- 🌐 **CORS & SSL Controls** — detect public vs private APIs, and optionally bypass SSL for staging servers

…and more.  
Built for **QA engineers** who need _real testing_, not just “sending requests.”

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
npm start

```

### 🖥️ Building executables

**You can package Rentgen into a standalone app (.exe for Windows, .dmg for macOS, .AppImage for Linux)**

```bash
### If you want to package the app (bundle it for distribution)
npm run package

### If you want a ready-to-distribute installer
npm run make
```

## 🚀 Creating a Release

Releases are automatically built and published when you create and push a Git tag. The GitHub Actions workflow will:

1. **Build** the application for all platforms (Windows, macOS, Linux)
2. **Generate release notes** from git commits since the last tag
3. **Create a GitHub release** with all build artifacts attached

### Steps to create a release:

1. **Update the version** in `package.json` (if needed):

   ```bash
   # Edit package.json and update the version field
   ```

2. **Update CHANGELOG.md** with the changes for this release:

   ```bash
   # Edit CHANGELOG.md and move items from [Unreleased] to a new version section
   ```

3. **Commit your changes**:

   ```bash
   git add package.json CHANGELOG.md
   git commit -m "chore: bump version to X.Y.Z"
   ```

4. **Create and push a tag**:

   ```bash
   # Create an annotated tag (recommended)
   git tag -a v1.2.0 -m "Release version 1.2.0"

   # Or create a lightweight tag
   git tag v1.2.0

   # Push the tag to trigger the release workflow
   git push origin v1.2.0
   ```

### Tag naming convention

Use semantic versioning format: `vMAJOR.MINOR.PATCH` (e.g., `v1.2.0`, `v2.0.0`, `v1.2.1`)

### Release notes

Release notes are automatically generated from git commits between the previous tag and the current tag. The workflow will:

- List all commits (excluding merge commits)
- Include commit messages and short hashes
- Add a link to the full changelog comparison

You can also manually edit the release notes on GitHub after the release is created.
