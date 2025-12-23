## v1.6.0

### ⚡ Performance & API Health Insights

- **TEST: Network Latency vs API Latency**
  Rentgen now detects whether slowness is caused by **network latency** or by **API processing time**.
  You get a clear signal:
- network is slow → not your API
- API is slow → real backend problem

No guessing. No finger-pointing.

- **TEST: Response Size Check**
  If any request returns a response larger than recommended limits, Rentgen raises a warning and explains:
- why large payloads are dangerous,
- how they impact performance and memory,
- and what to fix.

- **TEST: Array List Without Pagination**
  If Rentgen detects an array response without pagination or limits, it raises a warning explaining:
- why unbounded lists are risky,
- how they hurt scalability,
- and why pagination or limits are required.

### 🚀 Workflow Improvements

- Requests are now **auto-saved into Collections** together with generated assertions.
- Requests can be grouped into folders inside a Collection.
- You can run requests directly from a Collection using a simple **Play** button — no test runner ceremony.

- **Generate & Run Tests** now stores full execution results,
  allowing comparison between different request versions.

- **Auto Save**: forgot to save request changes?
  Rentgen now saves automatically — no lost work.

- **Create Request**: besides importing cURL, you can now create requests manually for fast experiments.

### 🛠 Performance & Stability

- Optimized handling of very large JSON responses.
  Performance issues reported by Tomasevicius are now fixed.

- Multiple internal improvements and bug fixes across request execution, collections, and test generation.
