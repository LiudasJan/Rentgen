# v1.8.0 — RENTGEN

## 🏅 Rentgen Certificate — Proof of API Coverage

Rentgen can now generate a **public certificate** after a test run — a concrete signal of API testing depth.

### Eligibility Rules

A certificate is generated **only if**:

- Generated tests ≥ **70**

If the condition is not met, Rentgen clearly shows:

> Not eligible (need at least 70 tests)

---

## ➕ One-Click Dynamic Variable from Response

Saving response values as dynamic variables is now faster and more visible.

### New UI Action

- A **➕ button** appears next to response values
- Click once → value is saved as a dynamic variable

### Behavior

- Variable updates automatically on each run
- Reused across requests and tests
- No scripts, no hooks, no manual mapping

### Built-in Safety

- If the selected response value is **missing**:
  - The test is marked **yellow**
  - Treated as an **automatic assertion warning**

This makes broken flows visible without failing the entire run.

---

## 🔁 Regression Testing — Noise-Free Comparison

Regression testing now ignores **non-deterministic noise** by default.

### Problem

Previously, regression comparison could report differences caused by:

- timestamps
- request IDs
- dynamic tokens
- security / data-driven test variance

### Solution

Rentgen now automatically detects and excludes noise.

---

## 🐞 Bug Fixes & UX Improvements

- Improved response comparison stability
- Cleaner regression result summaries
- More predictable test reruns
- Minor UI clarity improvements across test execution and results

---

Rentgen continues to focus on **early, behavior-level API signals** —  
before scripts, before CI, before production surprises.
