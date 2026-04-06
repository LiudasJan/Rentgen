## 🚀 Release v1.20.0

### 🔥 Project Export / Import (Main Feature)

You can now fully export and import your Rentgen projects and share it with a team.

- Export everything:
  - requests
  - collections
  - environment variables (static + dynamic)
  - history

- Import back anytime

No accounts. No cloud. No vendor lock-in. Use whatever you want:

- Dropbox
- GitHub
- local storage, etc

---

### 🔐 New Test: Invalid Authorization Cookie / Token

Automatically triggered if request contains headers:

- Authorization
- X-API-Key
- X-Auth-Token
- Api-Key
- ApiKey

Or uses Bearer token.

What it does:

- Takes existing token
- Modifies it (invalidates)
- Sends request

Expected result: `401 Unauthorized`

---

### ⏱ Response Time Everywhere

Response time is now visible across the entire workflow.

- Each test now shows response time
- Manual requests show response time next to status code

---

### ⚙️ Test Engine Settings (Mapping Control)

New: `Settings → Test Engine`

You can now control how test data is generated.

- Random Email `[length]`
- Random Integer `[min] [max]`
- Random String `[length]`
- Email (custom domain) [domain]` → default: rentgen.io
- Enum `value1,value2,value3`
- Number `[min] [max]`
- String `[max length]`

---

### 🛠 Bug Fixes & Improvements

- Stability improvements across test execution
- Performance optimizations
- General UX improvements
