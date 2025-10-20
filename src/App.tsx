import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { loadProto, encodeMessage, decodeMessage } from "./protobufHelper";
import { detectFieldType } from "./fieldDetectors";
import { datasets } from "./datasets";
import parseCurl from "parse-curl";
import "./App.css";

export default function App() {
  console.log("✅ App.tsx");
  const [mode, setMode] = useState<"HTTP" | "WSS">("HTTP");
  const [url, setUrl] = useState("");
  const [method, setMethod] = useState("GET");
  const [headers, setHeaders] = useState("");
  const [body, setBody] = useState("{}");

  const [messages, setMessages] = useState<
    {
      direction: "sent" | "received" | "system";
      data: string;
      decoded?: string | null;
    }[]
  >([]);
  const [protoFile, setProtoFile] = useState<File | null>(null);
  const [messageType, setMessageType] = useState("");
  const wsRef = useRef<WebSocket | null>(null);
  const [wsConnected, setWsConnected] = useState(false);

  const [httpResponse, setHttpResponse] = useState<{
    status: string;
    body: any;
    headers: any;
  } | null>(null);

  const [fieldMappings, setFieldMappings] = useState<Record<string, string>>(
    {}
  );
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // --- State ---
  const [currentTest, setCurrentTest] = useState(0);
  const [totalTests, setTotalTests] = useState(0);

  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
  const toggleRow = (idx: number) =>
    setExpandedRows((prev) => ({ ...prev, [idx]: !prev[idx] }));

  const [securityResults, setSecurityResults] = useState<any[]>([]);

  const [expandedSecurityRows, setExpandedSecurityRows] = useState<
    Record<number, boolean>
  >({});
  const toggleSecurityRow = (idx: number) =>
    setExpandedSecurityRows((prev) => ({ ...prev, [idx]: !prev[idx] }));

  const [performanceResults, setPerformanceResults] = useState<any[]>([]);

  const [loadingData, setLoadingData] = useState(false);
  const [loadingSecurity, setLoadingSecurity] = useState(false);
  const [loadingPerf, setLoadingPerf] = useState(false);
  const [testsStarted, setTestsStarted] = useState(false);

  const [showCurlModal, setShowCurlModal] = useState(false);
  const [curlError, setCurlError] = useState(false);
  const [curlInput, setCurlInput] = useState("");

  const [queryMappings, setQueryMappings] = useState<Record<string, string>>(
    {}
  );

  // Load test UI/rezultatai
  const [loadConcurrency, setLoadConcurrency] = useState(10); // threads
  const [loadTotal, setLoadTotal] = useState(100); // total requests
  const [loadRunning, setLoadRunning] = useState(false);

  // 🆕 Progress bar būsena (nebūtina, bet patogu jei norėsi rodyti dar ir kitur)
  const [loadProgressPct, setLoadProgressPct] = useState(0);
  const [loadProgressText, setLoadProgressText] = useState("");

  // 🆕 Tekstinis bar'as: 20 char pločio: █ and ░
  function buildTextBar(pct: number) {
    const width = 20;
    const filled = Math.round((pct / 100) * width);
    return "█".repeat(filled) + "░".repeat(width - filled) + ` ${pct}%`;
  }

  // --- Beautify handler ---
  function beautifyBody() {
    try {
      // jei JSON validus — suformatuojam gražiai
      const parsed = JSON.parse(body);
      const pretty = JSON.stringify(parsed, null, 2);
      setBody(pretty); // perrašom body, redaguojamas toliau
    } catch {
      // jei ne JSON, ignoruojam tyliai
    }
  }

  // --- HTTP SEND ---
  async function sendHttp() {
    setHttpResponse({
      status: "Sending...",
      body: "",
      headers: {},
    });

    try {
      const hdrs = headers
        ? Object.fromEntries(
            headers
              .split("\n")
              .filter((h) => h.trim())
              .map((h) => {
                // jei nėra dvitaškio, tikėtina, kad tai curl -b flagas (cookies)
                if (!h.includes(":")) {
                  if (h.trim().startsWith("-b ")) {
                    return ["Cookie", h.replace("-b", "").trim()];
                  }
                  // fallback – vis tiek įrašom kaip Cookie
                  return ["Cookie", h.trim()];
                }

                const [k, ...rest] = h.split(":");
                return [k.trim(), rest.join(":").trim()];
              })
          )
        : {};

      let dataToSend: any = body; // raw tekstas

      if (protoFile && messageType) {
        try {
          dataToSend = encodeMessage(messageType, JSON.parse(body));
        } catch (err) {
          setHttpResponse({
            status: "Encode error",
            body: String(err),
            headers: {},
          });
          return;
        }
      }

      // 👇 čia vietoje axios kvietimo
      const res = await (window as any).electronAPI.sendHttp({
        url,
        method,
        headers: hdrs,
        body: dataToSend,
      });

      setHttpResponse(res);

      // Testų generavimą remiam į request, o ne response
      let parsedBody: any;
      try {
        parsedBody = JSON.parse(body);
      } catch {
        parsedBody = null;
      }

      if (res.status.startsWith("2") && parsedBody) {
        // Ištraukiam visus laukus (įskaitant nested)
        const extracted = extractFieldsFromJson(parsedBody);
        const mappings: Record<string, string> = {};

        for (const [path, type] of Object.entries(extracted)) {
          if (type === "DO_NOT_TEST") {
            mappings[path] = "do-not-test";
          } else {
            // jeigu ne objektas – aptinkam tipą kaip anksčiau
            // paimame tikrą value iš path
            const segments = path.replace(/\[(\d+)\]/g, ".$1").split(".");
            let val: any = parsedBody;
            for (const s of segments) {
              if (val == null) break;
              val = val[s];
            }
            mappings[path] = detectFieldType(path, val);
          }
        }

        setFieldMappings(mappings);

        // 🆕 Query param mapping
        const queryParams = extractQueryParams(url);
        const queryMappings: Record<string, string> = {};
        for (const [key, val] of Object.entries(queryParams)) {
          queryMappings[key] = detectFieldType(key, val);
        }
        setQueryMappings(queryMappings);
      }
    } catch (err: any) {
      setHttpResponse({
        status: "Network Error",
        body: String(err),
        headers: {},
      });
    }
  }

  // --- WSS CONNECT ---
  async function connectWss() {
    if (!url.startsWith("ws")) {
      setMessages((prev) => [
        { direction: "system", data: "❌ Please use ws:// or wss:// URL" },
        ...prev,
      ]);
      return;
    }

    const hdrs = headers
      ? Object.fromEntries(
          headers.split("\n").map((h) => {
            const [k, ...rest] = h.split(":");
            return [k.trim(), rest.join(":").trim()];
          })
        )
      : {};

    // 👇 vietoj naršyklinio WebSocket – IPC į main
    (window as any).electronAPI.connectWss({ url, headers: hdrs });
  }

  // mount
  useEffect(() => {
    if (!(window as any).electronAPI?.onWssEvent) return; // 👈 skip browser
    const off = (window as any).electronAPI.onWssEvent((ev: any) => {
      if (ev.type === "open") setWsConnected(true);
      if (ev.type === "close") setWsConnected(false);
      if (ev.type === "message") {
        setMessages((prev) => [
          {
            direction: "received",
            data: String(ev.data),
            decoded: ev.decoded ?? null,
          },
          ...prev,
        ]);
      }
      if (ev.type === "error") {
        setMessages((prev) => [
          { direction: "system", data: "❌ " + ev.error },
          ...prev,
        ]);
      }
    });
    return () => off?.(); // unmount
  }, []);

  // --- WSS SEND ---
  function sendWss() {
    setMessages((prev) => [{ direction: "sent", data: body }, ...prev]);
    (window as any).electronAPI.sendWss(body);
  }

  function updateFieldType(field: string, type: string) {
    setFieldMappings((prev) => ({ ...prev, [field]: type }));
  }

  // --- SECURITY TESTS ---
  async function runSecurityTests(): Promise<any[]> {
    const results: any[] = [];

    // paimam user įvestus headerius (tokius pačius kaip sendHttp ir runDataDrivenTests)
    const hdrs = headers
      ? Object.fromEntries(
          headers.split("\n").map((h) => {
            const [k, ...rest] = h.split(":");
            return [k.trim(), rest.join(":").trim()];
          })
        )
      : {};

    let base: any = null;

    try {
      // 1. Sensitive headers
      const base = await (window as any).electronAPI.sendHttp({
        url,
        method,
        headers: hdrs,
        body,
      });

      // Tikrinam Server header
      const serverHeader =
        base.headers?.["server"] || base.headers?.["Server"] || "";
      const hasVersionNumber = /\d/.test(serverHeader);

      results.push({
        name: "No sensitive server headers",
        expected: "Server header should not expose version",
        actual: serverHeader || "No Server header",
        status: hasVersionNumber ? "🔴 Fail" : "✅ Pass",
        request: { url, method: "GET", headers: hdrs },
        response: base,
      });

      // 2. Tikrinam Clickjacking protection
      const xfo =
        base.headers?.["x-frame-options"] || base.headers?.["X-Frame-Options"];
      const csp =
        base.headers?.["content-security-policy"] ||
        base.headers?.["Content-Security-Policy"];

      let clickjackingStatus = "🟠 Warning";
      let actualClickjacking = "Missing";

      if (xfo) {
        const val = xfo.toUpperCase();
        if (val === "DENY" || val === "SAMEORIGIN") {
          clickjackingStatus = "✅ Pass";
        }
        actualClickjacking = `X-Frame-Options: ${val}`;
      } else if (csp && csp.includes("frame-ancestors")) {
        if (/frame-ancestors\s+('none'|'self')/i.test(csp)) {
          clickjackingStatus = "✅ Pass";
        }
        actualClickjacking = `CSP: ${csp}`;
      }

      results.push({
        name: "Clickjacking protection",
        expected: "X-Frame-Options DENY/SAMEORIGIN or CSP frame-ancestors",
        actual: actualClickjacking,
        status: clickjackingStatus,
        request: { url, method, headers: hdrs, body },
        response: base,
      });

      // 3. Tikrinam HSTS
      const hsts =
        base.headers?.["strict-transport-security"] ||
        base.headers?.["Strict-Transport-Security"];

      let hstsStatus = "🟠 Warning";
      let actualHsts = "Missing";

      if (hsts) {
        hstsStatus = "✅ Pass";
        actualHsts = hsts;
      }

      results.push({
        name: "HSTS (Strict-Transport-Security)",
        expected: "Header should be present on HTTPS endpoints",
        actual: actualHsts,
        status: hstsStatus,
        request: { url, method, headers: hdrs, body },
        response: base,
      });

      // 4. Tikrinam MIME sniffing protection
      const xcto =
        base.headers?.["x-content-type-options"] ||
        base.headers?.["X-Content-Type-Options"];

      let xctoStatus = "❌ Fail";
      let actualXcto = "Missing";

      if (xcto) {
        if (xcto.toLowerCase() === "nosniff") {
          xctoStatus = "✅ Pass";
          actualXcto = `X-Content-Type-Options: ${xcto}`;
        } else {
          xctoStatus = "❌ Fail";
          actualXcto = `Unexpected: ${xcto}`;
        }
      }

      results.push({
        name: "MIME sniffing protection",
        expected: "X-Content-Type-Options: nosniff",
        actual: actualXcto,
        status: xctoStatus,
        request: { url, method, headers: hdrs, body },
        response: base,
      });

      // 5. Cache-Control check
      const cacheControl =
        base.headers?.["cache-control"] || base.headers?.["Cache-Control"];

      let cacheStatus = "🟠 Warning";
      let actualCache = "Missing";

      if (cacheControl) {
        if (
          cacheControl.includes("no-store") ||
          cacheControl.includes("private")
        ) {
          cacheStatus = "✅ Pass";
        } else {
          cacheStatus = "❌ X-Fail";
        }
        actualCache = cacheControl;
      } else {
        const m = method.toUpperCase();
        if (m === "GET" || m === "HEAD") {
          cacheStatus = "❌ X-Fail"; // pavojinga
        } else {
          cacheStatus = "🟠 Warning"; // saugu by default, bet geriau nurodyti
        }
      }

      results.push({
        name: "Cache-Control for private API",
        expected: "Cache-Control: no-store/private",
        actual: actualCache,
        status: cacheStatus,
        request: { url, method, headers: hdrs },
        response: base,
      });

      // 6. OPTIONS method
      const opt = await (window as any).electronAPI.sendHttp({
        url,
        method: "OPTIONS",
        headers: hdrs,
        body: null,
      });

      // leidžiam tiek 200, tiek 204, bet reikalaujam Allow header
      const optionCode = opt.status.split(" ")[0];
      const allowHeader =
        opt.headers?.["allow"] ||
        opt.headers?.["Allow"] ||
        opt.headers?.["access-control-allow-methods"] ||
        opt.headers?.["Access-Control-Allow-Methods"];

      const hasAllow = Boolean(allowHeader);
      const okOptions =
        (optionCode === "200" || optionCode === "204") && hasAllow;

      results.push({
        name: "OPTIONS method handling",
        expected: "200 or 204 + Allow header",
        actual: opt.status,
        status: okOptions ? "✅ Pass" : "❌ Fail",
        request: { url, method: "OPTIONS", headers: hdrs },
        response: opt,
      });

      // 7. Unsupported method
      const weird = await (window as any).electronAPI.sendHttp({
        url,
        method: "FOOBAR",
        headers: hdrs, // ✅ originalūs headeriai
        body, // ✅ originalus body
      });
      const code = weird.status.split(" ")[0];
      const okWeird = code === "405" || code === "501";
      results.push({
        name: "Unsupported method handling",
        expected: "405 Method Not Allowed (or 501)",
        actual: weird.status,
        status: okWeird ? "✅ Pass" : "❌ Fail",
        request: { url, method: "FOOBAR", headers: hdrs, body },
        response: weird,
      });
    } catch (err) {
      results.push({
        name: "Security test error",
        expected: "Should respond",
        actual: String(err),
        status: "🔴 Fail",
        request: { url, headers: hdrs, body },
        response: null,
      });

      const corsResult = await runCorsTest();
      results.push(corsResult);
    }

    // 8. Large body / size limit
    const bigBody = "A".repeat(10 * 1024 * 1024); // 10 MB string
    const tooLarge = await (window as any).electronAPI.sendHttp({
      url,
      method: "POST", // dažniausiai POST su body
      headers: { ...hdrs, "Content-Type": "application/json" },
      body: bigBody,
    });

    const codeLarge = tooLarge.status.split(" ")[0];
    const okLarge = codeLarge === "413";
    results.push({
      name: "Request size limit (10 MB)",
      expected: "413 Payload Too Large",
      actual: tooLarge.status,
      status: okLarge ? "✅ Pass" : "❌ Fail",
      request: { url, method: "POST", headers: hdrs, body: "[100MB string]" },
      response: tooLarge,
    });

    // 9. Missing authorization cookie/token
    try {
      const minimalHeaders: Record<string, string> = {};
      for (const [k, v] of Object.entries(hdrs)) {
        const key = k.toLowerCase();
        if (key === "accept" || key === "content-type") {
          minimalHeaders[k] = v;
        }
      }

      const missingAuth = await (window as any).electronAPI.sendHttp({
        url,
        method,
        headers: minimalHeaders,
        body,
      });

      const code = missingAuth.status.split(" ")[0];
      const ok401 = code === "401";

      results.push({
        name: "Missing authorization cookie/token",
        expected: "Should return 401 Unauthorized",
        actual: missingAuth.status,
        status: ok401 ? "✅ Pass" : "❌ Fail",
        request: { url, method, headers: minimalHeaders, body }, // ✅ pridėjau body
        response: missingAuth,
      });
    } catch (err) {
      results.push({
        name: "Missing authorization cookie/token",
        expected: "Should return 401 Unauthorized",
        actual: String(err),
        status: "🔴 Bug",
        request: { url, method, headers: {}, body }, // ✅ pridėjau body ir į klaidos atvejį
        response: null,
      });
    }

    // 10. INFO CORS check
    const corsResult = await runCorsTest();
    results.push(corsResult);

    // 11. 404 Not Found check
    const notFoundTest = await runNotFoundTest(url, method, hdrs, body);
    results.push(notFoundTest);

    // --- Manual checks (pilka spalva) ---
    results.push(
      {
        name: "Invalid authorization cookie/token",
        expected: "Should return 401 Unauthorized",
        actual: "Not available yet",
        status: "⚪ Manual",
        request: null,
        response: null,
      },
      {
        name: "Access other user’s data",
        expected: "Should return 404 or 403",
        actual: "Not available yet",
        status: "⚪ Manual",
        request: null,
        response: null,
      },
      {
        name: "Role-based access control",
        expected: "Restricted per role",
        actual: "Not available yet",
        status: "⚪ Manual",
        request: null,
        response: null,
      }
    );

    return results;
  }

  // --- 404 Not Found test ---
  async function runNotFoundTest(
    url: string,
    method: string,
    headers: any,
    body: any
  ) {
    let testUrl = url;

    try {
      const u = new URL(url);
      // jei turi query, NOT_FOUND pridedam prie pathname
      u.pathname = u.pathname.endsWith("/")
        ? `${u.pathname}NOT_FOUND`
        : `${u.pathname}/NOT_FOUND`;
      testUrl = u.toString();
    } catch {
      // fallback, jei blogas URL
      testUrl = url.endsWith("/") ? `${url}NOT_FOUND` : `${url}/NOT_FOUND`;
    }

    const start = performance.now();
    try {
      const res = await (window as any).electronAPI.sendHttp({
        url: testUrl,
        method,
        headers,
        body,
      });
      const end = performance.now();
      const responseTime = end - start;

      const statusCode = parseInt(res.status?.split(" ")[0] || "0", 10);
      const statusText = res.status?.split(" ").slice(1).join(" ") || "";

      const status =
        statusCode === 404
          ? "✅ Pass"
          : statusCode === 0
            ? "❌ Fail (No response)"
            : "❌ Fail";

      return {
        name: "404 Not Found",
        expected: "404 Not Found",
        actual: `${statusCode} ${statusText}`,
        status,
        responseTime,
        request: { url: testUrl, method, headers, body },
        response: res,
      };
    } catch (err: any) {
      return {
        name: "404 Not Found",
        expected: "404 Not Found",
        actual: "Request failed",
        status: "❌ Fail",
        responseTime: 0,
        request: { url: testUrl, method, headers, body },
        response: { error: String(err) },
      };
    }
  }

  // --- RUN ALL TESTS ---
  async function runAllTests() {
    setTestsStarted(true);

    setLoadingData(true);
    setLoadingSecurity(true);
    setLoadingPerf(true);

    setTestResults([]);
    setSecurityResults([]);
    setPerformanceResults([]);
    setCurrentTest(0);

    // 1. Data-driven
    const dataResults = await runDataDrivenTests();
    setTestResults(dataResults);
    setLoadingData(false);

    // 2. Security
    const secResults = await runSecurityTests();
    setSecurityResults(secResults);
    setLoadingSecurity(false);

    // 3. Performance
    const perfResults = await runPerformanceInsights(dataResults);
    setPerformanceResults(perfResults);
    setLoadingPerf(false);

    setLoading(false);
  }

  // --- DATA HANDLING & INPUT VALIDATION  TESTS ---
  async function runDataDrivenTests(): Promise<any[]> {
    if (!body) return [];
    setLoading(true);
    setTestResults([]);
    setCurrentTest(0);

    let parsedBody: any;
    try {
      parsedBody = JSON.parse(body);
    } catch {
      setLoading(false);
      return [];
    }

    const hdrs = headers
      ? Object.fromEntries(
          headers.split("\n").map((h) => {
            const [k, ...rest] = h.split(":");
            return [k.trim(), rest.join(":").trim()];
          })
        )
      : {};

    // paskaičiuojam kiek testų bus (BODY + QUERY)
    let total = 0;
    for (const [field, type] of Object.entries(fieldMappings)) {
      if (type === "do-not-test" || type === "random32") continue;
      total += (datasets[type] || []).length;
    }
    for (const [param, type] of Object.entries(queryMappings)) {
      if (type === "do-not-test" || type === "random32") continue;
      total += (datasets[type] || []).length;
    }
    setTotalTests(1 + total);

    const results: any[] = [];
    let counter = 0;

    // 🟢 VISADA siunčiam originalų request pirmu numeriu
    try {
      const start = performance.now();
      const res = await (window as any).electronAPI.sendHttp({
        url,
        method,
        headers: hdrs,
        body: parsedBody,
      });
      const end = performance.now();

      results.push({
        field: "(original request)",
        value: parsedBody,
        expected: "2xx",
        actual: res.status,
        status: res.status.startsWith("2") ? "✅ Pass" : "❌ Fail",
        request: { url, method, headers: hdrs, body: parsedBody },
        response:
          typeof res.body === "string"
            ? res.body
            : JSON.stringify(res.body, null, 2),
        responseTime: end - start,
      });
    } catch (err: any) {
      results.push({
        field: "(original request)",
        value: parsedBody,
        expected: "2xx",
        actual: "Error",
        status: "🔴 Bug",
        request: { url, method, headers, body: parsedBody },
        response: String(err),
        responseTime: 0,
      });
    }

    for (const [field, type] of Object.entries(fieldMappings)) {
      if (type === "do-not-test") continue;

      const dataset =
        type === "random32" || type === "randomInt"
          ? [{ dynamic: true, valid: true }]
          : datasets[type] || [];

      for (const d of dataset) {
        counter++;
        setCurrentTest(counter);

        // pradinė body kopija
        const val = (d as any).value;

        // pradinė body kopija (deep clone kad neišdarkytų originalo)
        const newBody = JSON.parse(JSON.stringify(parsedBody));

        const newValue =
          type === "randomInt"
            ? randInt()
            : type === "random32"
              ? rand32()
              : type === "randomEmail"
                ? randEmail()
                : val;

        setDeepValue(newBody, field, newValue);

        // 💡 kiekvienam request’ui perrašom visus random32/randomInt laukus
        for (const [f, t] of Object.entries(fieldMappings)) {
          if (t === "random32") newBody[f] = rand32();
          if (t === "randomInt") newBody[f] = randInt();
          if (t === "randomEmail") newBody[f] = randEmail();
        }

        let dataToSend: any = newBody;
        if (protoFile && messageType) {
          try {
            dataToSend = encodeMessage(messageType, newBody);
          } catch (err) {
            const val = "value" in d ? d.value : null;
            results.push({
              field,
              value: val,
              expected: d.valid ? "2xx" : "4xx",
              actual: "Encode error",
              status: "🔴 Bug",
              request: { url, method, headers: hdrs, body: newBody },
              response: String(err),
              responseTime: 0,
            });
            continue;
          }
        }

        try {
          const start = performance.now();
          const res = await (window as any).electronAPI.sendHttp({
            url,
            method,
            headers: hdrs,
            body: dataToSend,
          });
          const end = performance.now();
          const responseTime = end - start;

          // --- naujas status parsing ---
          let statusCode = 0;
          let statusText = "";
          if (res.status) {
            const parts = res.status.split(" ");
            statusCode = parseInt(parts[0], 10);
            statusText = parts.slice(1).join(" ");
          }

          const ok = statusCode >= 200 && statusCode < 300;

          // response text
          let responseText: string;
          if (typeof res.body === "string") {
            responseText = res.body;
          } else {
            try {
              responseText = JSON.stringify(res.body, null, 2);
            } catch {
              responseText = String(res.body);
            }
          }

          let decoded: string | null = null;
          if (protoFile && messageType) {
            try {
              const { decodeMessage } = require("./protobufHelper");
              const obj = decodeMessage(messageType, new Uint8Array(res.body));
              decoded = JSON.stringify(obj, null, 2);
            } catch {
              decoded = null;
            }
          }

          let status = "";
          if (d.valid) {
            // tikimės 2xx
            if (ok) status = "✅ Pass";
            else status = "❌ Fail";
          } else {
            // tikimės 4xx
            if (statusCode >= 400 && statusCode < 500) status = "✅ Pass";
            else if (ok) status = "❌ Fail";
            else if (statusCode >= 500) status = "🔴 Bug";
            else status = "❌ Fail";
          }

          results.push({
            field,
            value: val,
            expected: d.valid ? "2xx" : "4xx",
            actual: res.status,
            status,
            request: { url, method, headers: hdrs, body: newBody },
            response: responseText,
            decoded,
            responseTime,
          });
        } catch (err: any) {
          results.push({
            field,
            value: val,
            expected: d.valid ? "2xx" : "4xx",
            actual: "Error",
            status: "🔴 Bug",
            request: { url, method, headers: hdrs, body: newBody },
            response: String(err),
            responseTime: 0,
          });
        }
      }
    }

    // 🆕 Query param testai
    for (const [param, type] of Object.entries(queryMappings)) {
      if (type === "do-not-test") continue;
      const dataset = datasets[type] || [];

      for (const d of dataset) {
        counter++;
        setCurrentTest(counter);

        const val = d.value;
        const u = new URL(url);
        u.searchParams.set(param, String(val));

        const start = performance.now();
        const res = await (window as any).electronAPI.sendHttp({
          url: u.toString(),
          method,
          headers: hdrs,
          body: parsedBody,
        });
        const end = performance.now();
        const responseTime = end - start;

        const statusCode = parseInt(res.status?.split(" ")[0] || "0", 10);
        const ok = statusCode >= 200 && statusCode < 300;
        const status =
          (d.valid && ok) || (!d.valid && statusCode >= 400 && statusCode < 500)
            ? "✅ Pass"
            : "❌ Fail";

        results.push({
          field: `query.${param}`,
          value: val,
          expected: d.valid ? "2xx" : "4xx",
          actual: res.status,
          status,
          request: { url: u.toString(), method, headers: hdrs },
          response: res.body,
          responseTime,
        });
      }
    }

    return results;
  }

  // --- PERFORMANCE ---
  async function runPerformanceInsights(dataResults: any[]): Promise<any[]> {
    const results: any[] = [];

    // Response time mediana
    const times = dataResults.map((r) => r.responseTime).filter(Boolean);
    const med = median(times);

    let status = "";
    if (med <= 500) status = "✅ Pass";
    else if (med <= 1000) status = "🟠 Warning";
    else status = "🔴 Fail";

    results.push({
      name: "Median response time",
      expected: "<= 500ms",
      actual: `${med.toFixed(0)} ms`,
      status,
    });

    // Ping
    try {
      const domain = new URL(url).hostname;
      const pings: number[] = [];
      for (let i = 0; i < 5; i++) {
        const t = await (window as any).electronAPI.pingHost(domain);
        pings.push(t);
      }
      const badCount = pings.filter((t) => t > 100).length;
      const avg = pings.reduce((a, b) => a + b, 0) / pings.length;

      let pingStatus = badCount >= 3 ? "🔴 Fail" : "✅ Pass";
      results.push({
        name: "Ping latency",
        expected: "<= 100ms (3/5 rule)",
        actual: `${avg.toFixed(0)} ms (bad ${badCount}/5)`,
        status: pingStatus,
      });
    } catch (err) {
      results.push({
        name: "Ping test error",
        expected: "Ping should succeed",
        actual: String(err),
        status: "🔴 Fail",
      });
    }

    // --- Load test (manual trigger, not auto run) ---
    results.push({
      name: "Load test",
      expected: "10 threads, 100 total req",
      actual: "", // tuščia, nes dar nebuvo paleista
      status: "⚪ Manual", // paliekam pilką
    });

    results.push({
      name: "Rate limiting implementation",
      expected: "429 Too Many Requests",
      actual: "Not available yet",
      status: "⚪ Manual",
    });

    return results;
  }

  // --- RANDOM STRING ---
  function rand32() {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let out = "";
    for (let i = 0; i < 32; i++)
      out += chars[Math.floor(Math.random() * chars.length)];
    return out;
  }

  // --- RANDOM Integer ---
  function randInt() {
    return Math.floor(Math.random() * 10_000_000) + 1;
  }

  // --- RANDOM Email ---
  function randEmail() {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let name = "";
    for (let i = 0; i < 8; i++)
      name += chars[Math.floor(Math.random() * chars.length)];
    return `${name}@qaontime.com`;
  }

  // --- Measure median helper ---
  function median(values: number[]): number {
    if (values.length === 0) return 0;
    values.sort((a, b) => a - b);
    const mid = Math.floor(values.length / 2);
    return values.length % 2 !== 0
      ? values[mid]
      : (values[mid - 1] + values[mid]) / 2;
  }

  // --- Handle Import Curl ---
  function handleImportCurl(raw: string) {
    try {
      if (raw.length > 200_000) throw new Error("cURL too large");

      const cleaned = raw.replace(/\\\n/g, " ").trim();
      const parsed: any = parseCurl(cleaned);

      // BODY fallback'ai (kad suveiktų --data*, net jei parse-curl nepagauna)
      if (!parsed.body) {
        const m =
          cleaned.match(/--data-raw\s+(['"])([\s\S]*?)\1/) ||
          cleaned.match(/--data\s+(['"])([\s\S]*?)\1/) ||
          cleaned.match(/--data-binary\s+(['"])([\s\S]*?)\1/);
        if (m) parsed.body = m[2];
      }

      // METHOD logika: jei yra body arba --data* flagas -> POST
      let method = parsed.method ? String(parsed.method).toUpperCase() : "";
      if (!method || (method === "GET" && parsed.body)) {
        method = /--data-raw|--data\b|--data-binary|(?:\s|^)-d\b/.test(cleaned)
          ? "POST"
          : "GET";
      }

      // HEADERIŲ normalizavimas: visada naudoti "Cookie", niekada "Set-Cookie"
      const headersObj: Record<string, string> = {};

      if (parsed.header) {
        for (const [k, v] of Object.entries(
          parsed.header as Record<string, any>
        )) {
          const key = String(k);
          const val = String(v ?? "");
          if (key.toLowerCase() === "set-cookie") {
            headersObj["Cookie"] = val; // pervadinam
          } else {
            headersObj[key] = val;
          }
        }
      }

      // Paimti ir -b/--cookie flag'ą (jei buvo), jis laimi prieš viską – kaip Postman
      const cookieFlag =
        cleaned.match(/(?:^|\s)(?:-b|--cookie)\s+(['"])([\s\S]*?)\1/) ||
        cleaned.match(/(?:^|\s)(?:-b|--cookie)\s+([^\s'"][^\s]*)/); // be kabučių
      if (cookieFlag) {
        const rawVal = String(cookieFlag[2] ?? cookieFlag[1] ?? "");
        const val = rawVal
          .replace(/^Cookie:\s*/i, "")
          .replace(/^Set-Cookie:\s*/i, "")
          .trim();
        if (val) headersObj["Cookie"] = val;
      }

      // Užpildom UI
      setUrl(parsed.url || "");
      setMethod(method);
      setBody(parsed.body ? parsed.body : "{}");

      const headerStr = Object.entries(headersObj)
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n");
      setHeaders(headerStr);

      setShowCurlModal(false);
      setCurlInput("");
      setCurlError(false);
    } catch (err) {
      console.error("cURL import failed", err);
      setCurlError(true);
    }
  }

  // --- To cURL + copy ---
  function copyAsCurl(req: {
    url: string;
    method: string;
    headers?: any;
    body?: any;
  }) {
    let curl = `curl -X ${req.method || "GET"} '${req.url}'`;

    if (req.headers) {
      for (const [k, v] of Object.entries(req.headers)) {
        curl += ` \\\n  -H '${k}: ${v}'`;
      }
    }

    if (req.body && req.body !== "null" && req.body !== "{}") {
      let bodyStr: string;

      if (typeof req.body === "string") {
        bodyStr = req.body;
      } else {
        bodyStr = JSON.stringify(req.body);
      }

      // 💡 escape single quote, kad curl nebūtų invalid
      bodyStr = bodyStr.replace(/'/g, "'\\''");

      curl += ` \\\n  --data '${bodyStr}'`;
    }

    navigator.clipboard
      .writeText(curl)
      .then(() => {
        console.log("✅ cURL copied to clipboard");
      })
      .catch((err) => {
        console.error("❌ Failed to copy cURL", err);
      });
  }

  function CopyButton({ req }: { req: any }) {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
      copyAsCurl(req);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // po 2s grįžta
    };

    return (
      <button className="copy-btn" onClick={handleCopy}>
        {copied ? "Copied ✅" : "Copy cURL"}
      </button>
    );
  }

  // --- runCorsTest
  async function runCorsTest(): Promise<any> {
    try {
      const hdrs = headers
        ? Object.fromEntries(
            headers.split("\n").map((h) => {
              const [k, ...rest] = h.split(":");
              return [k.trim(), rest.join(":").trim()];
            })
          )
        : {};

      const options: RequestInit = {
        method,
        mode: "cors",
        headers: hdrs,
      };

      if (body && !["GET", "HEAD"].includes(method.toUpperCase())) {
        options.body = body;
      }

      const res = await fetch(url, options);

      return {
        name: "CORS policy check",
        expected: "Detect if API is public or private",
        actual: "No CORS error → API is public (accessible from any domain)",
        status: "🔵 Info",
        request: { url, method, headers: hdrs, body },
        response: { status: res.status },
      };
    } catch (err: any) {
      const msg = String(err?.message || err);
      if (msg.includes("CORS") || msg.includes("Failed to fetch")) {
        return {
          name: "CORS policy check",
          expected: "Detect if API is public or private",
          actual: "CORS error → API is private (restricted by origin)",
          status: "🔵 Info",
          request: { url, method, headers, body },
          response: null,
        };
      }
      return {
        name: "CORS policy check",
        expected: "Detect if API is public or private",
        actual: "Unexpected error: " + msg,
        status: "🔵 Info",
        request: { url, method, headers, body },
        response: null,
      };
    }
  }

  /// --- extractFieldsFromJson ---
  function extractFieldsFromJson(
    obj: any,
    prefix = ""
  ): Record<string, string> {
    const fields: Record<string, string> = {};

    if (obj && typeof obj === "object" && !Array.isArray(obj)) {
      for (const [key, value] of Object.entries(obj)) {
        const path = prefix ? `${prefix}.${key}` : key;

        if (value === null) {
          fields[path] = "null";
        } else if (typeof value === "object") {
          // 👇 Pridedam markerį kad šitas objektas testuojamas nebus
          fields[path] = "DO_NOT_TEST";
          Object.assign(fields, extractFieldsFromJson(value, path));
        } else {
          fields[path] = typeof value;
        }
      }
    } else if (Array.isArray(obj)) {
      obj.forEach((item, i) => {
        const path = `${prefix}[${i}]`;
        if (typeof item === "object") {
          fields[path] = "DO_NOT_TEST";
          Object.assign(fields, extractFieldsFromJson(item, path));
        } else {
          fields[path] = typeof item;
        }
      });
    } else {
      fields[prefix] = typeof obj;
    }

    return fields;
  }

  /// --- extractQueryParams ---
  function extractQueryParams(url: string): Record<string, string> {
    try {
      const u = new URL(url);
      const params: Record<string, string> = {};
      u.searchParams.forEach((v, k) => {
        params[k] = v;
      });
      return params;
    } catch {
      return {};
    }
  }

  /// --- setDeepValue ---
  function setDeepValue(obj: any, path: string, value: any) {
    const parts = path.replace(/\[(\d+)\]/g, ".$1").split(".");
    let current = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      const key = parts[i];
      if (!(key in current)) current[key] = {};
      current = current[key];
    }
    current[parts[parts.length - 1]] = value;
  }

  // deep-clone helper
  function deepClone<T>(x: T): T {
    return JSON.parse(JSON.stringify(x));
  }

  // pritaiko random mapping'ą taip pat, kaip data-driven cikle
  function buildRandomizedBody(baseBody: any) {
    const newBody = deepClone(baseBody);

    // perrašom visus random laukus kiekvienam request'ui
    for (const [f, t] of Object.entries(fieldMappings)) {
      if (t === "random32") setDeepValue(newBody, f, rand32());
      if (t === "randomInt") setDeepValue(newBody, f, randInt());
      if (t === "randomEmail") setDeepValue(newBody, f, randEmail());
    }

    return newBody;
  }

  // status code paėmimas
  function codeOf(res: any): number {
    const s = (res?.status || "").toString();
    const n = parseInt(s.split(" ")[0] || "0", 10);
    return Number.isFinite(n) ? n : 0;
  }

  // percentiliai
  function percentile(values: number[], p: number) {
    if (!values.length) return 0;
    const arr = [...values].sort((a, b) => a - b);
    const idx = Math.min(
      arr.length - 1,
      Math.max(0, Math.floor((p / 100) * arr.length))
    );
    return arr[idx];
  }

  // --- maybeUpdateProgressUI ---
  function maybeUpdateProgressUI(sentCount: number) {
    const pct = Math.floor((sentCount / loadTotal) * 100);
    if (pct !== loadProgressPct) {
      const bar = buildTextBar(pct);
      setLoadProgressPct(pct);
      setLoadProgressText(`${bar} (${sentCount}/${loadTotal})`);

      // atnaujinam Performance lentelės „Load test“ eilutę
      setPerformanceResults((prev) => {
        const other = prev.filter((x) => x.name !== "Load test");
        return [
          ...other,
          {
            name: "Load test",
            expected: `${loadConcurrency} threads, ${loadTotal} total req`,
            actual: `⏳ ${bar} (${sentCount}/${loadTotal})`,
            status: "🔵 Info",
          },
        ];
      });
    }
  }

  // --- RUN LOAD TEST ---
  async function runLoadTest() {
    if (loadRunning) return;
    setLoadRunning(true);

    // Reset progress UI
    setLoadProgressPct(0);
    const initialBar = buildTextBar(0);
    setLoadProgressText(initialBar + " (0/" + loadTotal + ")");

    // 🆕 Iš karto atnaujinam Performance lentelės „Load test“ eilutę, kad matytųsi 0%
    setPerformanceResults((prev) => {
      const other = prev.filter((x) => x.name !== "Load test");
      return [
        ...other,
        {
          name: "Load test",
          expected: `${loadConcurrency} threads, ${loadTotal} total req`,
          actual: `⏳ ${initialBar} (0/${loadTotal})`,
          status: "🔵 Info",
        },
      ];
    });

    // limitai
    const concurrency = Math.max(1, Math.min(100, Math.floor(loadConcurrency)));
    const total = Math.max(1, Math.min(500, Math.floor(loadTotal)));

    // headers
    const hdrs = headers
      ? Object.fromEntries(
          headers.split("\n").map((h) => {
            const [k, ...rest] = h.split(":");
            return [k.trim(), rest.join(":").trim()];
          })
        )
      : {};

    // base body (iš UI)
    let baseBody: any = null;
    try {
      baseBody = body ? JSON.parse(body) : null;
    } catch {
      // jei ne JSON – siunčiam raw (be randomizacijos)
      baseBody = null;
    }

    let sent = 0;
    let failures5xx = 0;
    const times: number[] = [];

    let abort = false;

    async function oneRequest() {
      if (abort) return;

      // kūnas: originalus + random laukai, lygiai kaip data-driven cikle
      let dataToSend: any = baseBody ? buildRandomizedBody(baseBody) : body;

      if (protoFile && messageType && baseBody) {
        try {
          dataToSend = encodeMessage(messageType, dataToSend);
        } catch (e) {
          // jei nepavyko encodinti – skaitom kaip fail'ą
          failures5xx++;
          return;
        }
      }

      const t0 = performance.now();
      const res = await (window as any).electronAPI.sendHttp({
        url,
        method,
        headers: hdrs,
        body: dataToSend,
      });
      const t1 = performance.now();

      const ms = t1 - t0;
      times.push(ms);

      const code = codeOf(res);
      if (code >= 500) failures5xx++;

      // ankstyvas stabdymas: >5 5xx arba mediana > 5000ms
      if (failures5xx >= 5) abort = true;
      if (times.length >= Math.min(10, total)) {
        const med = percentile(times, 50);
        if (med > 5000) abort = true;
      }
    }

    async function worker() {
      while (!abort) {
        const myIdx = sent++;
        if (myIdx >= total) break;
        await oneRequest();

        // 🆕 po kiekvieno request'o — progress
        maybeUpdateProgressUI(myIdx + 1);
      }
    }

    const workers = Array.from(
      { length: Math.min(concurrency, total) },
      worker
    );
    await Promise.all(workers);

    // suformuojam rezultatą Performance lentelei
    const p50 = percentile(times, 50);
    const p90 = percentile(times, 90);
    const p95 = percentile(times, 95);
    const avg = times.length
      ? times.reduce((a, b) => a + b, 0) / times.length
      : 0;

    const status =
      failures5xx >= 5
        ? "🔴 Fail"
        : p50 > 5000
          ? "🔴 Fail"
          : p50 > 1000
            ? "🟠 Warning"
            : "✅ Pass";

    // įrašom/atnaujinam "Load test" eilutę Performance Insights lentelėje
    setPerformanceResults((prev) => {
      const other = prev.filter((x) => x.name !== "Load test");
      return [
        ...other,
        {
          name: "Load test",
          expected: `${concurrency} threads, ${total} total req`,
          actual: `${times.length} req → p50=${p50.toFixed(0)}ms p90=${p90.toFixed(0)}ms p95=${p95.toFixed(0)}ms avg=${avg.toFixed(0)}ms, 5xx=${failures5xx}`,
          status,
        },
      ];
    });

    setLoadRunning(false);
  }

  function truncateValue(value: any, maxLength = 100) {
    if (value === null) return "null";
    if (value === undefined) return "undefined";

    let str: string;

    switch (typeof value) {
      case "string":
        str = `"${value}"`;
        break;
      case "number":
      case "boolean":
        str = String(value);
        break;
      case "object":
        try {
          str = JSON.stringify(value);
        } catch {
          str = "[object]";
        }
        break;
      default:
        str = String(value);
    }

    return str.length > maxLength ? str.slice(0, maxLength) + " ..." : str;
  }

  return (
    <div className="app">
      {/* Mode selector */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "10px",
        }}
      >
        <label>
          Mode:
          <select value={mode} onChange={(e) => setMode(e.target.value as any)}>
            <option>HTTP</option>
            <option>WSS</option>
          </select>
        </label>

        {mode === "HTTP" && (
          <button className="send-btn" onClick={() => setShowCurlModal(true)}>
            Import cURL
          </button>
        )}
      </div>

      {/* URL + Method */}
      <div className="header">
        {mode === "HTTP" && (
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <input
              list="http-methods"
              className={`method-select method-${method}`}
              value={method}
              onChange={(e) => setMethod(e.target.value.toUpperCase())}
              onFocus={(e) => e.target.select()} // ✅ pažymi visą tekstą
              onClick={(e) => ((e.target as HTMLInputElement).value = "")} // ✅ išvalo kad matytųsi visas sąrašas
              placeholder="METHOD"
              style={{ width: "100px", textTransform: "uppercase" }}
            />
            <datalist id="http-methods">
              <option value="GET" />
              <option value="POST" />
              <option value="PUT" />
              <option value="PATCH" />
              <option value="DELETE" />
              <option value="HEAD" />
              <option value="OPTIONS" />
            </datalist>
          </div>
        )}
        <input
          className="url-input"
          placeholder="Enter request URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        {mode === "HTTP" ? (
          <button className="send-btn" onClick={sendHttp}>
            Send
          </button>
        ) : (
          <>
            <button
              className="send-btn"
              onClick={connectWss}
              disabled={wsConnected}
            >
              Connect
            </button>
            <button
              className="send-btn"
              onClick={sendWss}
              disabled={!wsConnected}
            >
              Send
            </button>
          </>
        )}
      </div>

      {/* Request Editors */}
      <textarea
        className="editor editor-headers"
        placeholder="Header-Key: value"
        value={headers}
        onChange={(e) => setHeaders(e.target.value)}
      />

      {/* Body editor + Beautify */}
      <div style={{ position: "relative" }}>
        <textarea
          className="editor editor-body"
          placeholder={mode === "HTTP" ? "Body JSON" : "Message body"}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          style={{ fontFamily: "monospace" }}
        />
        <button
          onClick={beautifyBody}
          style={{
            position: "absolute",
            top: "6px",
            right: "6px",
            background: "#f7f7f7",
            border: "1px solid #ccc",
            borderRadius: "4px",
            cursor: "pointer",
            padding: "2px 8px",
            fontSize: "12px",
          }}
        >
          Beautify
        </button>
      </div>

      {/* showCurlModal */}
      {showCurlModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Import cURL</h3>
            <textarea
              className={`editor ${curlError ? "error" : ""}`}
              placeholder="Paste cURL here..."
              value={curlInput}
              onChange={(e) => setCurlInput(e.target.value)}
              style={{ minHeight: "160px" }}
            />
            <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
              <button
                className="send-btn"
                onClick={() => handleImportCurl(curlInput)}
              >
                Import
              </button>
              <button
                className="send-btn"
                onClick={() => setShowCurlModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Protobuf controls */}
      <div className="protobuf-section" style={{ marginTop: "10px" }}>
        <label
          style={{ display: "block", marginBottom: "6px", fontWeight: "bold" }}
        >
          Protobuf schema & message type (optional):
        </label>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <input
            type="file"
            accept=".proto"
            onChange={async (e) => {
              if (e.target.files?.length) {
                try {
                  const root = await loadProto(e.target.files[0]);
                  setProtoFile(e.target.files[0]);
                  setMessages((prev) => [
                    { direction: "system", data: "📂 Proto schema loaded" },
                    ...prev,
                  ]);
                } catch (err) {
                  setMessages((prev) => [
                    {
                      direction: "system",
                      data: "❌ Failed to parse proto: " + err,
                    },
                    ...prev,
                  ]);
                }
              }
            }}
          />

          <input
            type="text"
            placeholder="MessageType (e.g. mypackage.MyMessage)"
            value={messageType}
            onChange={(e) => setMessageType(e.target.value)}
            style={{ flex: 1, minWidth: "300px" }} // ilgesnis, kad tilptų visas pavadinimas
          />
        </div>
      </div>

      {/* Response panel */}
      {mode === "HTTP" && httpResponse && (
        <div className="response-panel">
          <h3>Response</h3>
          <div className="status-line">{httpResponse.status}</div>

          <h4>Headers</h4>
          <pre className="wrap">
            {JSON.stringify(httpResponse.headers, null, 2)}
          </pre>

          <h4>Body</h4>
          <pre className="wrap">
            {typeof httpResponse.body === "string"
              ? httpResponse.body
              : JSON.stringify(httpResponse.body, null, 2)}
          </pre>
        </div>
      )}

      {/* WSS messages */}
      {mode === "WSS" && (
        <div className="response-panel">
          <h3>Messages</h3>
          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.direction}`}>
              <span className="arrow">
                {m.direction === "sent"
                  ? "➡"
                  : m.direction === "received"
                    ? "⬅"
                    : "⚠"}
              </span>
              <pre>{m.data}</pre>
              {m.decoded && (
                <>
                  <div className="decoded-label">Decoded Protobuf:</div>
                  <pre>{m.decoded}</pre>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mapping-sections">
        {/* Body mapping kairėje */}
        <div className="mapping-column">
          <h3>Body Parameters</h3>
          {Object.entries(fieldMappings).map(([field, type]) => (
            <div key={field} className="mapping-row">
              <span className="mapping-key">{field}</span>
              <select
                value={type}
                onChange={(e) => updateFieldType(field, e.target.value)}
              >
                <option value="do-not-test">Do not test</option>
                <option value="random32">Random string 32</option>
                <option value="randomInt">Random integer</option>
                <option value="randomEmail">Random email</option>
                <option value="string">String</option>
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="url">URL</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
                <option value="currency">Currency</option>
                <option value="date_yyyy_mm_dd">Date (YYYY-MM-DD)</option>
              </select>
            </div>
          ))}
        </div>

        {/* Query mapping dešinėje */}
        {Object.keys(queryMappings).length > 0 && (
          <div className="mapping-column">
            <h3>Query Parameters</h3>
            {Object.entries(queryMappings).map(([param, type]) => (
              <div key={param} className="mapping-row">
                <span className="mapping-key">{param}</span>
                <select
                  value={type}
                  onChange={(e) =>
                    setQueryMappings((prev) => ({
                      ...prev,
                      [param]: e.target.value,
                    }))
                  }
                >
                  <option value="do-not-test">Do not test</option>
                  <option value="random32">Random string 32</option>
                  <option value="randomInt">Random integer</option>
                  <option value="randomEmail">Random email</option>
                  <option value="string">String</option>
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                  <option value="url">URL</option>
                  <option value="number">Number</option>
                  <option value="boolean">Boolean</option>
                  <option value="currency">Currency</option>
                  <option value="date_yyyy_mm_dd">Date (YYYY-MM-DD)</option>
                </select>
              </div>
            ))}
          </div>
        )}
      </div>
      <button className="send-btn" onClick={runAllTests} disabled={loading}>
        {loading
          ? `Running tests... (${currentTest}/${totalTests})`
          : "Generate & Run Tests"}
      </button>

      {/* Security & Headers results */}
      {testsStarted && (
        <div className="response-panel">
          <h3>Security & Headers Tests</h3>
          <table className="results-table">
            <thead>
              <tr>
                <th>Check</th>
                <th>Expected</th>
                <th>Actual</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {loadingSecurity && securityResults.length === 0 ? (
                <tr>
                  <td colSpan={4}>⏳ Running security tests...</td>
                </tr>
              ) : (
                securityResults.map((r, i) => (
                  <React.Fragment key={i}>
                    <tr
                      className={
                        r.status.includes("Pass")
                          ? "pass"
                          : r.status.includes("Fail")
                            ? "fail"
                            : r.status.includes("Warning")
                              ? "warn"
                              : r.status.includes("Manual")
                                ? "manual"
                                : r.status.includes("Info")
                                  ? "info"
                                  : "bug"
                      }
                      onClick={() => toggleSecurityRow(i)}
                      style={{ cursor: "pointer" }}
                    >
                      <td>{r.name}</td>
                      <td>{r.expected}</td>
                      <td>{r.actual}</td>
                      <td>{r.status}</td>
                    </tr>

                    {expandedSecurityRows[i] && (
                      <tr className="details-row">
                        <td colSpan={4}>
                          <div className="details-panel">
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <CopyButton req={r.request} />
                            </div>
                            <div className="details-grid">
                              <div>
                                <div className="details-title">Request</div>
                                <pre className="wrap">
                                  {JSON.stringify(r.request, null, 2)}
                                </pre>
                              </div>
                              <div>
                                <div className="details-title">Response</div>
                                <pre className="wrap">
                                  {typeof r.response === "string"
                                    ? r.response
                                    : JSON.stringify(r.response, null, 2)}
                                </pre>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Performance Insights */}
      {testsStarted && (
        <div className="response-panel">
          <h3>Performance Insights</h3>
          <table className="results-table">
            <thead>
              <tr>
                <th>Check</th>
                <th>Expected</th>
                <th>Actual</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {loadingPerf && performanceResults.length === 0 ? (
                <tr>
                  <td colSpan={4}>⏳ Running Performance Insights...</td>
                </tr>
              ) : (
                performanceResults
                  .sort((a, b) =>
                    a.name === "Rate limiting implementation"
                      ? 1
                      : b.name === "Rate limiting implementation"
                        ? -1
                        : 0
                  )
                  .map((r, i) => {
                    const isLoad = r.name === "Load test";
                    const isManual =
                      r.status === "⚪ Manual" ||
                      r.name === "Rate limiting implementation";

                    // nustatom spalvą
                    // nustatom spalvą
                    let rowClass = "";
                    if (r.name === "Load test" && !r.actual)
                      rowClass = "manual";
                    else if (isManual) rowClass = "manual";
                    else if (r.actual?.includes("⏳")) rowClass = "info";
                    else if (
                      r.actual?.includes("5xx") ||
                      r.actual?.includes("p50")
                    ) {
                      if (/p50=\d+ms/.test(r.actual)) {
                        const p50 = parseInt(
                          r.actual.match(/p50=(\d+)/)?.[1] || "0"
                        );
                        rowClass =
                          p50 < 1000 ? "pass" : p50 < 5000 ? "warn" : "fail";
                      } else rowClass = "fail";
                    }
                    // 🆕 naujas papildymas:
                    else if (r.status.includes("Pass")) rowClass = "pass";
                    else if (r.status.includes("Warning")) rowClass = "warn";
                    else if (r.status.includes("Fail")) rowClass = "fail";
                    else if (r.status.includes("Manual")) rowClass = "manual";
                    else if (r.status.includes("Info")) rowClass = "info";
                    else rowClass = "";

                    return (
                      <tr key={i} className={rowClass}>
                        <td>{r.name}</td>
                        <td>{r.expected}</td>
                        <td>{r.actual}</td>
                        <td style={{ textAlign: "center" }}>
                          {r.name === "Load test" ? (
                            <button
                              onClick={runLoadTest}
                              disabled={loadRunning}
                              style={{
                                background: "#007bff",
                                color: "#fff",
                                border: "none",
                                borderRadius: "4px",
                                padding: "3px 8px",
                                fontSize: "12px",
                                cursor: "pointer",
                              }}
                            >
                              {loadRunning ? "⏳ Running..." : "Run load test"}
                            </button>
                          ) : (
                            r.status // visur kitur rodom statusą (Pass/Fail/Manual)
                          )}
                        </td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Data Handling & Input Validation */}
      {testsStarted && (
        <div className="response-panel">
          <h3>Data Handling & Input Validation</h3>
          <table className="results-table">
            <thead>
              <tr>
                <th>Field</th>
                <th>Value</th>
                <th>Expected</th>
                <th>Actual</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {loadingData && testResults.length === 0 ? (
                <tr>
                  <td colSpan={5}>⏳ Running data-driven tests...</td>
                </tr>
              ) : (
                testResults.map((r, i) => (
                  <React.Fragment key={i}>
                    <tr
                      className={
                        /^5\d\d/.test(r.actual)
                          ? "bug"
                          : r.status.includes("Pass")
                            ? "pass"
                            : r.status.includes("Fail")
                              ? "fail"
                              : "bug"
                      }
                      onClick={() => toggleRow(i)}
                      style={{ cursor: "pointer" }}
                    >
                      <td className="expander">
                        <span className="chevron">
                          {expandedRows[i] ? "▾" : "▸"}
                        </span>
                        {r.field}
                      </td>
                      <td>{truncateValue(r.value)}</td>
                      <td>{r.expected}</td>
                      <td>{r.actual}</td>
                      <td>{r.status}</td>
                    </tr>

                    {expandedRows[i] && (
                      <tr className="details-row">
                        <td colSpan={5}>
                          <div className="details-panel">
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <CopyButton req={r.request} />
                            </div>
                            <div className="details-grid">
                              <div>
                                <div className="details-title">Request</div>
                                <pre className="wrap">
                                  {JSON.stringify(r.request, null, 2)}
                                </pre>
                              </div>
                              <div>
                                <div className="details-title">Response</div>
                                <pre className="wrap">{r.response}</pre>
                                {r.decoded && (
                                  <>
                                    <div className="decoded-label">
                                      Decoded Protobuf:
                                    </div>
                                    <pre>{r.decoded}</pre>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
