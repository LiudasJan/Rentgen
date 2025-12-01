## [v1.4.0]

### 🔍 New Test Cases:

- **TEST: Boundary value analysis out of the box**  
  Automatically detects integer/float and generates valid range tests (min → max) and out-of-range tests.

- **TEST: ENUM field type support**  
  Detects enum-like values from the original cURL request.  
  Allows entering all valid ENUM options.  
  Valid ENUM → expect **2xx**, invalid ENUM → expect **4xx**.

- **TEST: String Max Length Test**  
  New `max length` control.  
  Up to max → **2xx**.  
  `max + 1` → **4xx**.

### 🌙 Dark Mode Arrives

Rentgen now has **full Dark Mode** — clean, minimal and perfect for late-night API debugging.  
Instant theme switching, no reloads, no tracking.

### 🐞 Bug Fixes

- Other minor parsing and UI fixes.

### 💻 How to Run on macOS

macOS may block the app (“developer cannot be verified”).  
To run it normally:

Move `Rentgen.app` to the Applications folder.  
Open Terminal and run:

```
xattr -d com.apple.quarantine /Applications/Rentgen.app
```

Then launch Rentgen as usual.
