import React, { useState, useRef } from "react";
import axios from "axios";
import { loadProto, encodeMessage, decodeMessage } from "./protobufHelper";
import "./App.css";

export default function App() {
  const [mode, setMode] = useState<"HTTP" | "WSS">("HTTP");
  const [url, setUrl] = useState("");
  const [method, setMethod] = useState("GET");
  const [headers, setHeaders] = useState("");
  const [body, setBody] = useState("{}");

  const [messages, setMessages] = useState<
  { direction: "sent" | "received" | "system"; data: string }[]>([]);


  const [activeTab, setActiveTab] = useState<"body" | "headers">("body");

  const [protoFile, setProtoFile] = useState<File | null>(null);
  const [messageType, setMessageType] = useState("");
  const wsRef = useRef<WebSocket | null>(null);
  const [wsConnected, setWsConnected] = useState(false);


  // HTTP response
  const [httpResponse, setHttpResponse] = useState<{
    status: string;
    body: any;
    headers: any;
  } | null>(null);


  async function sendHttp() {
    try {
      const hdrs = headers
        ? Object.fromEntries(headers.split("\n").map(h => h.split(":").map(s => s.trim())))
        : {};
      const res = await axios({
        url,
        method: method as any,
        headers: hdrs,
        data: JSON.parse(body)
      });

      setHttpResponse({
        status: `${res.status} ${res.statusText}`,
        body: res.data,
        headers: res.headers
      });
    } catch (err: any) {
      if (err.response) {
        setHttpResponse({
          status: `${err.response.status} ${err.response.statusText}`,
          body: err.response.data,
          headers: err.response.headers
        });
      } else {
        setHttpResponse({
          status: "Error",
          body: err.toString(),
          headers: {}
        });
      }
    }
  }


  async function connectWss() {
    wsRef.current = new WebSocket(url);
    wsRef.current.binaryType = "arraybuffer";

    wsRef.current.onopen = () => {
      setWsConnected(true);
      setMessages(prev => [{ direction: "system", data: "Connected" }, ...prev]);
    };

    wsRef.current.onerror = (e) => {
      setMessages(prev => [{ direction: "system", data: "Error: " + e }, ...prev]);
    };

    wsRef.current.onclose = () => {
      setWsConnected(false);
      setMessages(prev => [{ direction: "system", data: "Closed" }, ...prev]);
    };

    wsRef.current.onmessage = (event) => {
      const msg = event.data instanceof ArrayBuffer
        ? new TextDecoder().decode(event.data)
        : event.data;

      setMessages(prev => [{ direction: "received", data: msg }, ...prev]);
    };
  }

  async function sendWss() {
    if (!wsRef.current) return;

    let data: any = body;
    // nesi-parsinam JSON specialiai, leidžiam siųsti "brudą"
    if (protoFile && messageType) {
      try {
        data = encodeMessage(messageType, JSON.parse(body));
      } catch {
        data = body; // jei neteisingas JSON, siunčiam raw
      }
    }

    wsRef.current.send(data);
    setMessages(prev => [{ direction: "sent", data: typeof data === "string" ? data : JSON.stringify(data) }, ...prev]);

  }

if (wsRef.current) {
  wsRef.current.onmessage = (event) => {
    const msg = event.data instanceof ArrayBuffer
      ? new TextDecoder().decode(event.data)
      : event.data;

     setMessages(prev => [{ direction: "received", data: msg }, ...prev]);
  };
}



  async function onProtoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setProtoFile(e.target.files[0]);
      await loadProto(e.target.files[0]);
    }
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
      <option className="method-GET">GET</option>
      <option className="method-POST">POST</option>
      <option className="method-PUT">PUT</option>
      <option className="method-PATCH">PATCH</option>
      <option className="method-DELETE">DELETE</option>
      <option className="method-HEAD">HEAD</option>
      <option className="method-OPTIONS">OPTIONS</option>
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
        <button className="send-btn" onClick={connectWss} disabled={wsConnected}>
          Connect
        </button>
        <button className="send-btn" onClick={sendWss} disabled={!wsConnected}>
          Send
        </button>
      </>
    )}


  </div>


      {/* Headers */}
      <div>
        <textarea
          className="editor"
          placeholder="Headers (key: value)"
          value={headers}
          onChange={(e) => setHeaders(e.target.value)}
        />

      </div>

      {/* Body */}
      <div>
        <textarea
          className="editor editor-body"
          placeholder="Body JSON"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />

      </div>

      {/* Proto upload */}
      <div>
        <label className="file-label">
          Load .proto file: 
          <input type="file" accept=".proto" onChange={onProtoUpload} />
        </label>
        <input
          className="url-input"
          placeholder="Message Type (e.g. mypackage.MyMessage)"
          value={messageType}
          onChange={(e) => setMessageType(e.target.value)}
        />
      </div>

      {/* Response */}
      <h3>Response</h3>
      {/* HTTP response */}
      {mode === "HTTP" && httpResponse && (
        <div className="response-panel">
          <h3>Response</h3>
          <div className="status-line">{httpResponse.status}</div>

          <div className="tabs">
            <div
              className={`tab ${activeTab === "body" ? "active" : ""}`}
              onClick={() => setActiveTab("body")}
            >
              Body
            </div>
            <div
              className={`tab ${activeTab === "headers" ? "active" : ""}`}
              onClick={() => setActiveTab("headers")}
            >
              Headers
            </div>
          </div>

          <pre className="response">
            {activeTab === "body"
              ? JSON.stringify(httpResponse.body, null, 2)
              : JSON.stringify(httpResponse.headers, null, 2)}
          </pre>
        </div>
      )}

      {/* WSS messages */}
      {mode === "WSS" && (
        <div className="response-panel">
          <h3>Messages</h3>
          {messages.length === 0 && <div>No messages yet</div>}
          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.direction}`}>
              <span className="arrow">{m.direction === "sent" ? "↑" : "↓"}</span>
              <pre>{m.data}</pre>
            </div>
          ))}
        </div>
      )}


    </div>
  );
}
