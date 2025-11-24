## [v1.3.0]

### 🚀 New Features

- **Reload button** added to fully clear and reset the application state.

#### 🔍 New Test Cases

- **TEST: Domain Case Test**
  - Converts the domain to UPPERCASE (e.g., `API.RENTGEN.IO`)

- **TEST: Path Case Test**
  - Converts the last path segment to UPPERCASE (e.g., `/CUSTOMERS`)
  - Example: `/v1/customers` → `/v1/CUSTOMERS`

- **TEST: Reflected Payload Safety**
  - Detects whether the API reflects user input back in responses (potential security risk).

- **TEST: Trimming Test**
  - Automatically checks whether provided values are normalized (trimmed) before processing.

### 🎨 UI & UX Improvements

- Polished request/response styling for better readability.
- Animated UI transitions for cleaner user experience.
- General UI improvements and visual refinement.

### 🐞 Bug Fixes

- Fixed an issue where importing a cURL command could add an extra header:
  - `Content-Type: application/x-www-form-urlencoded`
  - Header is now included **only if explicitly provided by the user**.

### 🔧 Other Improvements

- Internal optimizations and stability updates.

# 💻 How to Run on macOS

macOS may block the app (“developer cannot be verified”).
To run it normally:

Move Rentgen.app to the Applications folder.
Open Terminal and run the following command:

```
xattr -d com.apple.quarantine /Applications/Rentgen.app
```

After this, you can launch Rentgen from Finder or Spotlight as usual.
