import React, { useState, useRef } from "react";
import axios from "axios";
import { loadProto, encodeMessage, decodeMessage } from "./protobufHelper";
import { detectFieldType } from "./fieldDetectors";
import { datasets } from "./datasets";
import "./App.css";

export default function App() {
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

      const res = await axios({
        url,
        method: method as any,
        headers: hdrs,
        data: dataToSend,
        responseType: "arraybuffer",
        validateStatus: () => true,
      });

      // Raw response kaip tekstas
      let decoded = "";
      try {
        decoded = new TextDecoder().decode(res.data);
      } catch {
        decoded = "[Binary data: " + res.data.byteLength + " bytes]";
      }

      setHttpResponse({
        status: `${res.status} ${res.statusText}`,
        body: decoded,
        headers: res.headers,
      });

      // ---- ČIA ESAMAS FIX ----
      // Testų generavimą remiam į request, o ne response
      let parsedBody: any;
      try {
        parsedBody = JSON.parse(body);
      } catch {
        parsedBody = null;
      }

      if (res.status >= 200 && res.status < 300 && parsedBody) {
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

    try {
      wsRef.current = new WebSocket(url);
      wsRef.current.binaryType = "arraybuffer";

      wsRef.current.onopen = () => {
        setWsConnected(true);
        setMessages((prev) => [
          { direction: "system", data: "✅ Connected" },
          ...prev,
        ]);
      };

      wsRef.current.onerror = (err) => {
        console.error("WebSocket error:", err);
        setMessages((prev) => [
          { direction: "system", data: "❌ Error (check console)" },
          ...prev,
        ]);
      };

      wsRef.current.onclose = () => {
        setWsConnected(false);
        setMessages((prev) => [
          { direction: "system", data: "🔌 Closed" },
          ...prev,
        ]);
      };

      wsRef.current.onmessage = (event) => {
        let raw: string | Uint8Array;
        let decoded: any = null;

        if (event.data instanceof ArrayBuffer) {
          raw = new Uint8Array(event.data);
          // Jei turim proto – bandome dekoduoti
          if (protoFile && messageType) {
            try {
              decoded = decodeMessage(messageType, raw); // 👈 jau importuotas
            } catch (err) {
              decoded = "❌ Failed to decode proto: " + err;
            }
          }
        } else {
          raw = event.data; // tekstas
        }

        setMessages((prev) => [
          {
            direction: "received",
            data:
              typeof raw === "string"
                ? raw // tekstas kaip yra
                : "[Binary data: " +
                  raw.length +
                  " bytes]\n" +
                  Array.from(raw)
                    .slice(0, 50)
                    .map((b) => b.toString(16).padStart(2, "0"))
                    .join(" ") +
                  (raw.length > 50 ? " ..." : ""), // hexdump preview
            decoded: decoded ? JSON.stringify(decoded, null, 2) : null,
          },
          ...prev,
        ]);
      };


    } catch (err) {
      console.error("WS connect exception:", err);
      setMessages((prev) => [
        { direction: "system", data: "❌ Failed: " + err },
        ...prev,
      ]);
    }
  }

  // --- WSS SEND ---
  async function sendWss() {
    if (!wsRef.current) return;
    let data: any = body;

    if (protoFile && messageType) {
      try {
        data = encodeMessage(messageType, JSON.parse(body));
      } catch {
        data = body;
      }
    }

    wsRef.current.send(data);
    setMessages((prev) => [
      {
        direction: "sent",
        data: typeof data === "string" ? data : JSON.stringify(data),
      },
      ...prev,
    ]);
  }

  function updateFieldType(field: string, type: string) {
    setFieldMappings((prev) => ({ ...prev, [field]: type }));
  }

  // --- RUN TESTS ---
  async function runTests() {
    if (!body) return;
    setLoading(true);
    setTestResults([]);
    setCurrentTest(0);

    let parsedBody: any;
    try {
      parsedBody = JSON.parse(body);
    } catch {
      setLoading(false);
      return;
    }

    const hdrs = headers
      ? Object.fromEntries(
          headers.split("\n").map((h) => h.split(":").map((s) => s.trim()))
        )
      : {};

    // paskaičiuojam kiek testų bus
    let total = 0;
    for (const [field, type] of Object.entries(fieldMappings)) {
      if (type === "do-not-test") continue;
      total += (datasets[type] || []).length;
    }
    setTotalTests(total);

    const results: any[] = [];
    let counter = 0;

    for (const [field, type] of Object.entries(fieldMappings)) {
      if (type === "do-not-test") continue;

      const dataset = datasets[type] || [];
      for (const d of dataset) {
        counter++;
        setCurrentTest(counter); // update progress

        const newBody = { ...parsedBody, [field]: d.value };

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
          const res = await axios({
            url,
            method: method as any,
            headers: hdrs,
            data: dataToSend,
            responseType: "arraybuffer", // visada raw
            validateStatus: () => true,
          });

          let responseText: string;
          let decoded: string | null = null;

          try {
            responseText = new TextDecoder().decode(res.data);
          } catch {
            responseText = "[Binary data: " + res.data.byteLength + " bytes]";
          }

          // jei turim proto ir bandom dekoduoti
          if (protoFile && messageType) {
            try {
              const { decodeMessage } = require("./protobufHelper");
              const obj = decodeMessage(messageType, new Uint8Array(res.data));
              decoded = JSON.stringify(obj, null, 2);
            } catch {
              decoded = null;
            }
          }

          const ok = res.status >= 200 && res.status < 300;
          let status = "";
          if (d.valid && ok) status = "✅ Pass";
          else if (!d.valid && ok) status = "❌ Fail";
          else if (res.status >= 500) status = "🔴 Bug";
          else status = "✅ Pass";

          results.push({
            field,
            value: d.value,
            expected: d.valid ? "2xx" : "4xx",
            actual: `${res.status} ${res.statusText}`,
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

    setTestResults(results);
    setLoading(false);
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
            <option value="OPTION">OPTION</option>
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
          <pre>{JSON.stringify(httpResponse.body, null, 2)}</pre>
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
                <option value="string">String</option>
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="url">URL</option>
                <option value="number">Number</option>
                <option value="ftp_url">FTP URL</option>
              </select>
            </div>
          ))}
          <button className="send-btn" onClick={runTests} disabled={loading}>
            {loading
              ? `Running tests... (${currentTest}/${totalTests})`
              : "Generate & Run Tests"}
          </button>
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
                <tr
                  key={i}
                  className={
                    r.status.includes("Pass")
                      ? "pass"
                      : r.status.includes("Fail")
                      ? "fail"
                      : "bug"
                  }
                >
                  <td>{r.field}</td>
                  <td>{JSON.stringify(r.value)}</td>
                  <td>{r.expected}</td>
                  <td>{r.actual}</td>
                  <td>{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {testResults.map((r, i) => (
            <details key={i} style={{ marginTop: "5px" }}>
              <summary>
                Request/Response for {r.field}={JSON.stringify(r.value)}
              </summary>
              <pre>Request: {JSON.stringify(r.request, null, 2)}</pre>
              <pre>Response: {r.response}</pre>
              {r.decoded && (
                <>
                  <div className="decoded-label">Decoded Protobuf:</div>
                  <pre>{r.decoded}</pre>
                </>
              )}
            </details>
          ))}

        </div>
      )}
    </div>
  );
}
