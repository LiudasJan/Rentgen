## v1.9.0 Potential Bugs Identification+ History + Security Test Controls

### Potential Identification (Regression Compare)

Regression compare now has a dedicated **Potential Bugs** identification to surface the changes that most likely indicate real breakage.

- Compare screen now has two tabs:
  - **Potential Bugs** (default)
  - **Full behaviour changes**
- If no potential bugs are detected, Rentgen shows:
  **"No potential bugs detected ✅"** with an option to open the full diff.

### Security Tests: Configure what to run

You can now choose which **Security Tests** are enabled.

- Settings are available via a **gear icon** (next to "Check for updates")
- By default all security tests are enabled
- Disabled tests are skipped and won't appear in the Security Tests list
- Settings persist via local storage across app restarts

### Request History (with retention controls)

Rentgen now keeps a **Request History** so you can return to previously used requests and save them into a Collection when needed.
History size / retention is configurable in settings to keep performance predictable.

### Environment Variables: Random value dropdown

When adding an environment variable, you can now select a generated value from a dropdown (no scripts):

- Random Email
- Random Integer
- Random String (32)

### Bug Fixes & Performance Improvements

- Multiple stability improvements across compare and execution workflows
- General performance and UX refinements
