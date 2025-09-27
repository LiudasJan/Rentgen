import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { loadProto, encodeMessage, decodeMessage } from "./protobufHelper";
import { detectFieldType } from "./fieldDetectors";
import { datasets } from "./datasets";
import "./App.css";

export default function App() {

  console.log("✅ App.tsx");
  const [mode, setMode] = useState<"HTTP" | "WSS">("HTTP");
  const [url, setUrl] = useState("");
  const [method, setMethod] = useState("GET");
  const [headers, setHeaders] = useState("");
  const [body, setBody] = useState("{}");

  const [messages, setMessages] = useState<
    { direction: "sent" | "received" | "system"; data: string; decoded?: string | null }[]
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

  const [fieldMappings, setFieldMappings] = useState<Record<string, string>>({});
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // --- State ---
  const [currentTest, setCurrentTest] = useState(0);
  const [totalTests, setTotalTests] = useState(0);

  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
  const toggleRow = (idx: number) => setExpandedRows((prev) => ({ ...prev, [idx]: !prev[idx] }));

  const [securityResults, setSecurityResults] = useState<any[]>([]);

  const [expandedSecurityRows, setExpandedSecurityRows] = useState<Record<number, boolean>>({});
  const toggleSecurityRow = (idx: number) =>
  setExpandedSecurityRows(prev => ({ ...prev, [idx]: !prev[idx] }));

  // --- HTTP SEND ---
  async function sendHttp() {
    setHttpResponse({
      status: "Sending...",
      body: "",
      headers: {}
    });

    try {
      const hdrs = headers
        ? Object.fromEntries(
            headers.split("\n").map((h) => h.split(":").map((s) => s.trim()))
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
        const mappings: Record<string, string> = {};
        Object.entries(parsedBody).forEach(([k, v]) => {
          mappings[k] = detectFieldType(k, v);
        });
        setFieldMappings(mappings);
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
          { direction: "received", data: String(ev.data), decoded: ev.decoded ?? null },
          ...prev,
        ]);
      }
      if (ev.type === "error") {
        setMessages((prev) => [{ direction: "system", data: "❌ " + ev.error }, ...prev]);
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

    try {
      // 1. Sensitive headers
      const base = await (window as any).electronAPI.sendHttp({
        url,
        method: "GET",
        headers: hdrs,
        body: null
      });
      const headerStr = JSON.stringify(base.headers || {}).toLowerCase();
      const bad = /(apache|nginx|iis|express|php|jetty|tomcat|caddy)/i.test(headerStr);
      results.push({
        name: "No sensitive server headers",
        expected: "No Server version info",
        actual: bad ? JSON.stringify(base.headers) : "Headers safe",
        status: bad ? "🔴 Fail" : "✅ Pass",
        request: { url, method: "GET", headers: hdrs },
        response: base
      });

      // 2. OPTIONS method
      const opt = await (window as any).electronAPI.sendHttp({
        url,
        method: "OPTIONS",
        headers: hdrs,
        body: null
      });
      const okOptions = opt.status.startsWith("204") && ("allow" in (opt.headers || {}));
      results.push({
        name: "OPTIONS method handling",
        expected: "204 No Content + Allow header",
        actual: opt.status,
        status: okOptions ? "✅ Pass" : "❌ Fail",
        request: { url, method: "OPTIONS", headers: hdrs },
        response: opt
      });

      // 3. Unsupported method
      const weird = await (window as any).electronAPI.sendHttp({
        url,
        method: "FOOBAR",
        headers: hdrs,
        body: null
      });
      const code = weird.status.split(" ")[0];
      const okWeird = code === "405" || code === "501";
      results.push({
        name: "Unsupported method handling",
        expected: "405 Method Not Allowed (or 501)",
        actual: weird.status,
        status: okWeird ? "✅ Pass" : "❌ Fail",
        request: { url, method: "FOOBAR", headers: hdrs },
        response: weird
      });

    } catch (err) {
      results.push({
        name: "Security test error",
        expected: "Should respond",
        actual: String(err),
        status: "🔴 Fail",
        request: { url, headers: hdrs },
        response: null
      });
    }

    // --- Manual checks (pilka spalva) ---
    results.push(
      {
        name: "Invalid authorization cookie/token",
        expected: "Should return 401 Unauthorized",
        actual: "Not run",
        status: "⚪ Manual",
        request: null,
        response: null
      },
      {
        name: "Missing authorization cookie/token",
        expected: "Should return 401 Unauthorized",
        actual: "Not run",
        status: "⚪ Manual",
        request: null,
        response: null
      },
      {
        name: "Access other user’s data",
        expected: "Should return 404 or 403",
        actual: "Not run",
        status: "⚪ Manual",
        request: null,
        response: null
      },
      {
        name: "Role-based access control",
        expected: "Restricted per role",
        actual: "Not run",
        status: "⚪ Manual",
        request: null,
        response: null
      }
    );

    return results;
  }

// --- RUN ALL TESTS ---
async function runAllTests() {
  setLoading(true);
  setTestResults([]);
  setSecurityResults([]);
  setCurrentTest(0);

  // 1. Data-driven (panaudojam seną runTests logiką kaip helperį)
  const dataResults = await runDataDrivenTests();
  setTestResults(dataResults);

  // 2. Security
  const secResults = await runSecurityTests();
  setSecurityResults(secResults);

  setLoading(false);
}

// refactorinta tavo runTests -> return results
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
          headers.split("\n").map((h) => h.split(":").map((s) => s.trim()))
        )
      : {};

    // paskaičiuojam kiek testų bus
    let total = 0;
    for (const [field, type] of Object.entries(fieldMappings)) {
      if (type === "do-not-test" || type === "random32") continue;
      total += (datasets[type] || []).length;
    }
    setTotalTests(total);

    const results: any[] = [];
    let counter = 0;

    for (const [field, type] of Object.entries(fieldMappings)) {
      if (type === "do-not-test") continue;

      const dataset =
        type === "random32"
          ? [{ value: rand32(), valid: true }]
          : datasets[type] || [];

      for (const d of dataset) {
        counter++;
        setCurrentTest(counter);

        // pradinė body kopija
        const newBody: any = { ...parsedBody, [field]: d.value };

        // 💡 kiekvienam request’ui perrašom visus random32 laukus
        for (const [f, t] of Object.entries(fieldMappings)) {
          if (t === "random32") {
            newBody[f] = rand32();
          }
        }

        let dataToSend: any = newBody;
        if (protoFile && messageType) {
          try {
            dataToSend = encodeMessage(messageType, newBody);
          } catch (err) {
            results.push({
              field,
              value: d.value,
              expected: d.valid ? "2xx" : "4xx",
              actual: "Encode error",
              status: "🔴 Bug",
              request: newBody,
              response: String(err),
            });
            continue;
          }
        }

        try {
          const res = await (window as any).electronAPI.sendHttp({
            url,
            method,
            headers: hdrs,
            body: dataToSend,
          });

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
              const obj = decodeMessage(
                messageType,
                new Uint8Array(res.body)
              );
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
            value: d.value,
            expected: d.valid ? "2xx" : "4xx",
            actual: res.status,
            status,
            request: newBody,
            response: responseText,
            decoded,
          });
        } catch (err: any) {
          results.push({
            field,
            value: d.value,
            expected: d.valid ? "2xx" : "4xx",
            actual: "Error",
            status: "🔴 Bug",
            request: newBody,
            response: String(err),
          });
        }
      }
    }

    return results;
}

// --- RANDOM STRING ---
function rand32() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < 32; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

  return (
    <div className="app">

      {/* Mode selector */}
      <div>
        <label>
          Mode:
          <select value={mode} onChange={(e) => setMode(e.target.value as any)}>
            <option>HTTP</option>
            <option>WSS</option>
          </select>
        </label>
      </div>

      {/* URL + Method */}
      <div className="header">
        {mode === "HTTP" && (
          <select
            className={`method-select method-${method}`}
            value={method}
            onChange={(e) => setMethod(e.target.value)}
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="PATCH">PATCH</option>
            <option value="DELETE">DELETE</option>
            <option value="HEAD">HEAD</option>
            <option value="OPTIONS">OPTIONS</option>
          </select>
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

        <textarea
          className="editor editor-body"
          placeholder={mode === "HTTP" ? "Body JSON" : "Message body"}
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />

        {/* Protobuf controls */}
        <div className="protobuf-section" style={{ marginTop: "10px" }}>
          <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold" }}>
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
                      { direction: "system", data: "❌ Failed to parse proto: " + err },
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
              style={{ flex: 1, minWidth: "300px" }}   // ilgesnis, kad tilptų visas pavadinimas
            />
          </div>
        </div>



      {/* Response panel */}
      {mode === "HTTP" && httpResponse && (
        <div className="response-panel">
          <h3>Response</h3>
          <div className="status-line">{httpResponse.status}</div>

          <h4>Headers</h4>
          <pre>{JSON.stringify(httpResponse.headers, null, 2)}</pre>

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

      {/* Field Mapping + Auto Tests */}
      {httpResponse && Object.keys(fieldMappings).length > 0 && (
        <div>
          <h3>Field Mapping</h3>
          {Object.entries(fieldMappings).map(([field, type]) => (
            <div key={field}>
              {field}:{" "}
              <select
                value={type}
                onChange={(e) => updateFieldType(field, e.target.value)}
              >
                <option value="do-not-test">Do not test</option>
                <option value="random32">Random 32 (unique each request)</option>
                <option value="string">String</option>
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="url">URL</option>
                <option value="number">Number</option>
                <option value="ftp_url">FTP URL</option>
              </select>
            </div>
          ))}
          <button className="send-btn" onClick={runAllTests} disabled={loading}>
            {loading
              ? `Running tests... (${currentTest}/${totalTests})`
              : "Generate & Run Tests"}
          </button>
        </div>
      )}

    {/* Security & Headers results */}
    {securityResults.length > 0 && (
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
            {securityResults.map((r, i) => (
              <React.Fragment key={i}>
                <tr
                  className={
                    r.status.includes("Pass")
                      ? "pass"
                      : r.status.includes("Fail")
                      ? "fail"
                      : r.status.includes("Manual")
                      ? "manual"
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
                        <div className="details-grid">
                          <div>
                            <div className="details-title">Request</div>
                            <pre>{JSON.stringify(r.request, null, 2)}</pre>
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
            ))}
          </tbody>
        </table>
      </div>
    )}

    {/* Test Results */}
    {testResults.length > 0 && (
      <div className="response-panel">
        <h3>Test Results</h3>
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
            {testResults.map((r, i) => (
              <React.Fragment key={i}>
                <tr
                  className={`${
                    r.status.includes("Pass")
                      ? "pass"
                      : r.status.includes("Fail")
                      ? "fail"
                      : "bug"
                  } clickable`}
                  onClick={() => toggleRow(i)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleRow(i);
                    }
                  }}
                  aria-expanded={!!expandedRows[i]}
                  title="Click to expand"
                >
                  <td className="expander">
                    <span className="chevron">{expandedRows[i] ? "▾" : "▸"}</span>
                    {r.field}
                  </td>
                  <td>{JSON.stringify(r.value)}</td>
                  <td>{r.expected}</td>
                  <td>{r.actual}</td>
                  <td>{r.status}</td>
                </tr>

                {expandedRows[i] && (
                  <tr className="details-row">
                    <td colSpan={5}>
                      <div className="details-panel">
                        <div className="details-grid">
                          <div>
                            <div className="details-title">Request</div>
                            <pre>{JSON.stringify(r.request, null, 2)}</pre>
                          </div>
                          <div>
                            <div className="details-title">Response</div>
                            <pre className="wrap">{r.response}</pre>
                            {r.decoded && (
                              <>
                                <div className="decoded-label">Decoded Protobuf:</div>
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
            ))}
          </tbody>
        </table>
      </div>
    )}

    </div>
  );
}
