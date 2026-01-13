## v1.7.0 RENTGEN

### 🔁 Regression Testing — Out of the Box (No regression tests? no problem!)

- TEST: Result Comparison / Regression Detection  
  Rentgen now supports native regression testing without scripts.

  Workflow:
  - Run tests against one environment (e.g. production)
  - Press `Select for compare` button
  - Switch environment (e.g. test or staging)
  - Run again and click `Compare with selected`

  Rentgen highlights all behavior differences between runs:
  - status code changes
  - response body changes
  - performance shifts
  - unexpected regressions

  No snapshots. No assertions. No manual diffing.  
  Just clear signals when behavior changes.

---

### 💣 Environment Variables Without Scripts (Core Feature)

- Save Any Response Value to Environment  
  From any response:
  - right-click on any value
  - choose Save to Environment
  - done

- Automatic reuse  
  The value is:
  - stored persistently
  - reused across requests
  - automatically updated on each run

  No scripts. No pre-request hooks. No post-request hacks.

  This makes realistic API flows possible without pretending scripting is normal.

---

### 🔄 Team Workflow: Import & Export Collections

- Import / Export Collections  
  You can now share your work across team members by exporting and importing collections.

- Rentgen supports Postman Collection schema, making it easy to:
  - reuse existing API definitions
  - move between tools
  - collaborate without lock-in

  Collections stay simple, readable, and runnable — without ceremony.

---

### 🌱 First-Run Experience & Onboarding Improvements

We listened to feedback.

- Clear first-run guidance  
  After sending the first request, Rentgen now explains what to do next instead of leaving users guessing.

- Auto-scroll to Field Mapping  
  When it matters, Rentgen automatically scrolls to the relevant configuration, making the next step obvious.

  Less confusion. Faster `aha` moment.

---

### 🐞 Bug Reporting — Visible and Usable

- Bug Report is now clearly visible  
  When a test fails, Rentgen surfaces the bug report immediately.

- Jira-ready output  
  The report can be copied and pasted directly into Jira — out of the box.

  No hunting for logs. No rebuilding context.

---

### 🛠 Stability & Internal Improvements

- Multiple internal improvements across:
  - request execution
  - environment handling
  - regression comparison
  - UI clarity

- Overall smoother workflows when switching environments and rerunning tests.
