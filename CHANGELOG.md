## [v1.5.0]

### 🔍 Smarter Test Generation

- **TEST: Required vs Optional fields**  
  You can now mark any request field as **mandatory** or **optional**.  
  Rentgen automatically generates:
  - **missing-required-field tests** → expect **4xx**
  - **optional-field-omitted tests** → expect **2xx**  
    This gives you instant coverage for “what happens if this field is not sent?” without writing a single script.

### 🐛 One-Click Bug Reports

- **Copy Bug Report**  
  When a test fails, you shouldn’t waste time writing tickets by hand.  
  Each failed test now has a **“Copy Bug Report”** button that:
  - pre-fills the bug title with the test name,
  - includes request, response, expectations and severity,
  - is formatted as clean plaintext ready to paste into Jira, Trello, Linear, or GitHub Issues.

  Fail → click → paste into your tracker → done.

### 📦 Test Export (kudos to Aivaras)

- **Test Export for all generated checks**  
  Huge thanks to **Aivaras St.** – he implemented export of all generated tests and shared the code with us.  
  Now Rentgen can export your tests so you can:
  - review them outside the app,
  - share them with the team,
  - keep a versioned snapshot of your API hygiene checks.

### 🗂 Collections: your work is finally persistent

- **Save all your work into Collections**  
  No more “start from scratch every time.”  
  You can now:
  - add requests into **Collections**,
  - group them by feature / service,
  - reopen Rentgen and continue exactly where you left off.

  Collections are the first building block for bigger test suites and regression packs.

### 🌍 Environment Support (Test / Staging / Prod)

- **Environment profiles** for dev, test, staging, prod (or anything you like).
- Each environment can have its own:
  - base URL,
  - headers / tokens,
  - and **color theme**, so you instantly see where you are running tests.

This also means you can make staging bright and friendly, and keep prod visually “scary” enough to think twice before firing **200 heavy tests** against it.

### 💻 How to Run on macOS

macOS may block the app (“developer cannot be verified”).  
To run it normally:

Move `Rentgen.app` to the Applications folder.  
Open Terminal and run:

```
xattr -d com.apple.quarantine /Applications/Rentgen.app
```

Then launch Rentgen as usual.
