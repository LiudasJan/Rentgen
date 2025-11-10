import { Method } from 'axios';
import cn from 'classnames';
import React, { useEffect, useState } from 'react';
import Button, { ButtonType } from './components/buttons/Button';
import Input from './components/inputs/Input';
import Select, { SelectOption } from './components/inputs/Select';
import SimpleSelect from './components/inputs/SimpleSelect';
import Textarea from './components/inputs/Textarea';
import Modal from './components/modals/Modal';
import ResponsePanel from './components/panels/ResponsePanel';
import useTests from './hooks/useTests';
import { TestStatus } from './types';
import {
  detectFieldType,
  encodeMessage,
  extractCurl,
  extractFieldsFromJson,
  extractQueryParams,
  generateRandomEmail,
  generateRandomInteger,
  generateRandomString,
  loadProtoSchema,
  parseHeaders,
  setDeepObjectProperty,
  truncateValue,
} from './utils';

type Mode = 'HTTP' | 'WSS';

const modeOptions: SelectOption<Mode>[] = [
  { value: 'HTTP', label: 'HTTP' },
  { value: 'WSS', label: 'WSS' },
];

const methodOptions: SelectOption<Method>[] = [
  { value: 'GET', label: 'GET', className: 'text-method-get!' },
  { value: 'POST', label: 'POST', className: 'text-method-post!' },
  { value: 'PUT', label: 'PUT', className: 'text-method-put!' },
  { value: 'PATCH', label: 'PATCH', className: 'text-method-patch!' },
  { value: 'DELETE', label: 'DELETE', className: 'text-method-delete!' },
  { value: 'HEAD', label: 'HEAD', className: 'text-method-head!' },
  { value: 'OPTIONS', label: 'OPTIONS', className: 'text-method-options!' },
];

const parameterOptions: SelectOption<string>[] = [
  { value: 'do-not-test', label: 'Do not test' },
  { value: 'random32', label: 'Random string 32' },
  { value: 'randomInt', label: 'Random integer' },
  { value: 'randomEmail', label: 'Random email' },
  { value: 'string', label: 'String' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'url', label: 'URL' },
  { value: 'number', label: 'Number' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'currency', label: 'Currency' },
  { value: 'date_yyyy_mm_dd', label: 'Date (YYYY-MM-DD)' },
];

export default function App() {
  const [mode, setMode] = useState<Mode>('HTTP');
  const [method, setMethod] = useState<Method>('GET');
  const [url, setUrl] = useState<string>('');
  const [wssConnected, setWssConnected] = useState<boolean>(false);
  const [openCurlModal, setOpenCurlModal] = useState<boolean>(false);
  const [curlError, setCurlError] = useState<string>('');
  const [curl, setCurl] = useState<string>('');
  const [headers, setHeaders] = useState<string>('');
  const [body, setBody] = useState<string>('{}');
  const [protoFile, setProtoFile] = useState<File | null>(null);
  const [messageType, setMessageType] = useState<string>('');
  const [httpResponse, setHttpResponse] = useState<{
    status: string;
    body: any;
    headers: any;
  } | null>(null);
  const [messages, setMessages] = useState<
    {
      direction: 'sent' | 'received' | 'system';
      data: string;
      decoded?: string | null;
    }[]
  >([]);
  const [fieldMappings, setFieldMappings] = useState<Record<string, string>>({});
  const [queryMappings, setQueryMappings] = useState<Record<string, string>>({});
  const [testsRun, setTestsRun] = useState(false);
  const {
    crudTests,
    currentTest,
    dataDrivenTests,
    isDataDrivenRunning,
    isSecurityRunning,
    isPerformanceRunning,
    performanceTests,
    securityTests,
    testCount,
    executeAllTests,
    setPerformanceTests,
  } = useTests(method, url, parseHeaders(headers), body, fieldMappings, queryMappings, messageType, protoFile);

  // --- State ---
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
  const toggleRow = (idx: number) => setExpandedRows((prev) => ({ ...prev, [idx]: !prev[idx] }));

  const [expandedSecurityRows, setExpandedSecurityRows] = useState<Record<number, boolean>>({});
  const toggleSecurityRow = (idx: number) => setExpandedSecurityRows((prev) => ({ ...prev, [idx]: !prev[idx] }));
  const [expandedCrudRows, setExpandedCrudRows] = useState<Record<number, boolean>>({});

  // Load test UI/rezultatai
  const [loadConcurrency, setLoadConcurrency] = useState(10); // threads
  const [loadTotal, setLoadTotal] = useState(100); // total requests
  const [loadRunning, setLoadRunning] = useState(false);

  // Progress bar state for load testing
  const [loadProgressPct, setLoadProgressPct] = useState(0);

  // 🆕 Tekstinis bar'as: 20 char pločio: █ and ░
  function buildTextBar(pct: number) {
    const width = 20;
    const filled = Math.round((pct / 100) * width);
    return '█'.repeat(filled) + '░'.repeat(width - filled) + ` ${pct}%`;
  }

  // mount
  useEffect(() => {
    if (!window.electronAPI?.onWssEvent) return; // 👈 skip browser
    const off = window.electronAPI.onWssEvent((ev: any) => {
      if (ev.type === 'open') setWssConnected(true);
      if (ev.type === 'close') setWssConnected(false);
      if (ev.type === 'message') {
        setMessages((prev) => [
          {
            direction: 'received',
            data: String(ev.data),
            decoded: ev.decoded ?? null,
          },
          ...prev,
        ]);
      }
      if (ev.type === 'error') {
        setMessages((prev) => [{ direction: 'system', data: '❌ ' + ev.error }, ...prev]);
      }
    });
    return () => off?.(); // unmount
  }, []);

  // --- To cURL + copy ---
  function copyAsCurl(req: { url: string; method: string; headers?: any; body?: any }) {
    let curl = `curl -X ${req.method || 'GET'} '${req.url}'`;

    if (req.headers) {
      for (const [k, v] of Object.entries(req.headers)) {
        curl += ` \\\n  -H '${k}: ${v}'`;
      }
    }

    if (req.body && req.body !== 'null' && req.body !== '{}') {
      let bodyStr: string;

      if (typeof req.body === 'string') {
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
        console.log('✅ cURL copied to clipboard');
      })
      .catch((err) => {
        console.error('❌ Failed to copy cURL', err);
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
        {copied ? 'Copied ✅' : 'Copy cURL'}
      </button>
    );
  }

  // pritaiko random mapping'ą taip pat, kaip data-driven cikle
  function buildRandomizedBody(baseBody: any) {
    const newBody = JSON.parse(JSON.stringify(baseBody));

    // perrašom visus random laukus kiekvienam request'ui
    for (const [f, t] of Object.entries(fieldMappings)) {
      if (t === 'random32') setDeepObjectProperty(newBody, f, generateRandomString());
      if (t === 'randomInt') setDeepObjectProperty(newBody, f, generateRandomInteger());
      if (t === 'randomEmail') setDeepObjectProperty(newBody, f, generateRandomEmail());
    }

    return newBody;
  }

  // status code paėmimas
  function codeOf(res: any): number {
    const s = (res?.status || '').toString();
    const n = parseInt(s.split(' ')[0] || '0', 10);
    return Number.isFinite(n) ? n : 0;
  }

  // percentiliai
  function percentile(values: number[], p: number) {
    if (!values.length) return 0;
    const arr = [...values].sort((a, b) => a - b);
    const idx = Math.min(arr.length - 1, Math.max(0, Math.floor((p / 100) * arr.length)));
    return arr[idx];
  }

  // --- maybeUpdateProgressUI ---
  function maybeUpdateProgressUI(sentCount: number) {
    const pct = Math.floor((sentCount / loadTotal) * 100);
    if (pct !== loadProgressPct) {
      const bar = buildTextBar(pct);
      setLoadProgressPct(pct);

      // atnaujinam Performance lentelės „Load test“ eilutę
      setPerformanceTests((prev) => {
        const other = prev.filter((x) => x.name !== 'Load test');
        return [
          ...other,
          {
            name: 'Load test',
            expected: 'Median <500 ms (Pass), <1000 ms (Warning), ≥1000 ms (Fail)',
            actual: `⏳ ${bar} (${sentCount}/${loadTotal})`,
            status: TestStatus.Info,
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

    // 🆕 Iš karto atnaujinam Performance lentelės „Load test“ eilutę, kad matytųsi 0%
    setPerformanceTests((prev) => {
      const other = prev.filter((x) => x.name !== 'Load test');
      return [
        ...other,
        {
          name: 'Load test',
          expected: 'Median <500 ms (Pass), <1000 ms (Warning), ≥1000 ms (Fail)',
          actual: `⏳ ${initialBar} (0/${loadTotal})`,
          status: TestStatus.Info,
        },
      ];
    });

    // limitai
    const concurrency = Math.max(1, Math.min(100, Math.floor(loadConcurrency)));
    const total = Math.max(1, Math.min(10000, Math.floor(loadTotal)));

    // headers
    const hdrs = parseHeaders(headers);

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
    let failures4xx = 0;
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
      const res = await window.electronAPI.sendHttp({
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
      if (code >= 400 && code < 500) failures4xx++;

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

    const workers = Array.from({ length: Math.min(concurrency, total) }, worker);
    await Promise.all(workers);

    // suformuojam rezultatą Performance lentelei
    const p50 = percentile(times, 50);
    const p90 = percentile(times, 90);
    const p95 = percentile(times, 95);
    const avg = times.length ? times.reduce((a, b) => a + b, 0) / times.length : 0;

    const status =
      failures5xx >= 5
        ? TestStatus.Fail
        : p50 < 500
          ? TestStatus.Pass
          : p50 < 1000
            ? TestStatus.Warning
            : TestStatus.Fail;

    // įrašom/atnaujinam "Load test" eilutę Performance Insights lentelėje
    setPerformanceTests((prev) => {
      const other = prev.filter((x) => x.name !== 'Load test');
      return [
        ...other,
        {
          name: `Load test`,
          expected: 'Median <500 ms (Pass), <1000 ms (Warning), ≥1000 ms (Fail)',
          actual: `${concurrency} threads, ${total} total req. Executed: ${times.length} req → p50=${p50.toFixed(0)}ms p90=${p90.toFixed(0)}ms p95=${p95.toFixed(0)}ms avg=${avg.toFixed(0)}ms, 4xx=${failures4xx}, 5xx=${failures5xx}`,
          status,
        },
      ];
    });

    setLoadRunning(false);
  }

  return (
    <div className="flex flex-col gap-4 py-5 px-7">
      <div className="flex items-center gap-2">
        <Select
          className="font-bold"
          isSearchable={false}
          options={modeOptions}
          placeholder="MODE"
          value={modeOptions.find((option) => option.value == mode)}
          onChange={(option: SelectOption<Mode>) => setMode(option.value)}
        />
        {mode === 'HTTP' && (
          <>
            <Button onClick={() => setOpenCurlModal(true)}>Import cURL</Button>
            <Modal isOpen={openCurlModal} onClose={() => setOpenCurlModal(false)}>
              <div className="flex flex-col gap-4">
                <h3 className="m-0">Import cURL</h3>
                <Textarea
                  className="min-h-40 font-monospace"
                  placeholder="Enter cURL or paste text"
                  value={curl}
                  onChange={(e) => setCurl(e.target.value)}
                />
                {curlError && <div className="text-xs text-red-600">{curlError}</div>}
                <div className="flex items-center justify-end gap-4">
                  <Button onClick={importCurl}>Import</Button>
                  <Button buttonType={ButtonType.SECONDARY} onClick={() => setOpenCurlModal(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </Modal>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        {mode === 'HTTP' && (
          <Select
            className="font-bold uppercase"
            classNames={{ input: () => 'm-0! p-0! [&>:first-child]:uppercase' }}
            isCreatable={true}
            options={methodOptions}
            placeholder="METHOD"
            value={methodOptions.find((option) => option.value == method)}
            onChange={(option: SelectOption<Method>) => setMethod(option.value)}
          />
        )}
        <Input
          className="flex-auto font-monospace"
          placeholder="Enter URL or paste text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        {mode === 'HTTP' && <Button onClick={sendHttp}>Send</Button>}
        {mode === 'WSS' && (
          <>
            <Button disabled={wssConnected} onClick={connectWss}>
              Connect
            </Button>
            <Button buttonType={ButtonType.SECONDARY} disabled={!wssConnected} onClick={sendWss}>
              Send
            </Button>
          </>
        )}
      </div>

      <Textarea
        className="font-monospace"
        placeholder="Header-Key: value"
        value={headers}
        onChange={(e) => setHeaders(e.target.value)}
      />

      <div className="relative">
        <Textarea
          className="min-h-36 font-monospace"
          placeholder={mode === 'HTTP' ? 'Body JSON' : 'Message body'}
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <Button
          className="absolute top-1.5 right-1.5 min-w-auto! py-0.5! px-2! rounded-sm"
          buttonType={ButtonType.SECONDARY}
          onClick={() => {
            const parsedHeaders = parseHeaders(headers);
            const contentType = (parsedHeaders['Content-Type'] || parsedHeaders['content-type'] || '').toString();

            if (/application\/x-www-form-urlencoded/i.test(contentType))
              setBody((prevBody) =>
                prevBody
                  .split(/\r?\n/)
                  .map((l) => l.trim())
                  .filter(Boolean)
                  .sort()
                  .join('\n'),
              );
            else {
              try {
                setBody((prevBody) => JSON.stringify(JSON.parse(prevBody), null, 2));
              } catch {
                // Silently ignore JSON parse errors
              }
            }
          }}
        >
          Beautify
        </Button>
      </div>

      <div>
        <label className="block mb-2 font-bold text-sm">
          Protobuf schema & message type <span className="font-normal text-gray-500/80">(optional)</span>:
        </label>
        <div className="flex items-center gap-2">
          <Input
            accept=".proto"
            className="font-monospace"
            type="file"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              try {
                await loadProtoSchema(file);

                setProtoFile(file);
                setMessages((prevMessages) => [
                  { direction: 'system', data: '📂 Proto schema loaded' },
                  ...prevMessages,
                ]);
              } catch (error) {
                setMessages((prevMessages) => [
                  {
                    direction: 'system',
                    data: '❌ Failed to parse proto: ' + error,
                  },
                  ...prevMessages,
                ]);
              }
            }}
          />

          <Input
            className="flex-auto font-monospace"
            placeholder="Message type (e.g. mypackage.MyMessage)"
            value={messageType}
            onChange={(e) => setMessageType(e.target.value)}
          />
        </div>
      </div>

      {mode === 'HTTP' && httpResponse && (
        <ResponsePanel title="Response">
          <div className="py-2 px-3 font-bold bg-body border-y border-border">{httpResponse.status}</div>
          <div className="max-h-[400px] py-2 px-3 overflow-y-auto">
            <h4 className="m-0">Headers</h4>
            <pre className="my-4 whitespace-pre-wrap">{JSON.stringify(httpResponse.headers, null, 2)}</pre>
            <h4 className="m-0 pt-2 border-t border-border">Body</h4>
            <pre className="my-4 whitespace-pre-wrap">
              {typeof httpResponse.body === 'string' ? httpResponse.body : JSON.stringify(httpResponse.body, null, 2)}
            </pre>
          </div>
        </ResponsePanel>
      )}

      {mode === 'WSS' && messages.length > 0 && (
        <ResponsePanel title="Messages">
          <div className="max-h-[400px] py-2 px-3 border-t border-border overflow-y-auto">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn('pt-2 nth-[2n]:border-b last:border-none border-border', {
                  'nth-[1n]:border-b': message.direction !== 'sent' && message.direction !== 'received',
                })}
              >
                <span
                  className={cn('font-bold', {
                    'text-blue-500': message.direction === 'sent',
                    'text-green-500': message.direction === 'received',
                  })}
                >
                  {message.direction === 'sent' ? '➡' : message.direction === 'received' ? '⬅' : '⚠'}
                </span>
                <pre className="mt-0 ml-4">{message.data}</pre>
                {message.decoded && (
                  <>
                    <div className="font-monospace font-bold text-sm">Decoded Protobuf:</div>
                    <pre>{message.decoded}</pre>
                  </>
                )}
              </div>
            ))}
          </div>
        </ResponsePanel>
      )}

      {(Object.keys(fieldMappings).length > 0 || Object.keys(queryMappings).length > 0) && (
        <div className="grid grid-cols-2 gap-4 items-stretch">
          {Object.keys(fieldMappings).length > 0 && (
            <ResponsePanel title="Body Parameters">
              {Object.entries(fieldMappings).map(([field, type]) => (
                <div key={field} className="pb-3 first-of-type:pt-3 px-3 flex items-center justify-between">
                  <span className="font-monospace text-ellipsis text-nowrap overflow-hidden">{field}</span>
                  <SimpleSelect
                    className="rounded-none! p-1! outline-none"
                    options={parameterOptions}
                    value={type}
                    onChange={(e) =>
                      setFieldMappings((prevFieldMappings) => ({ ...prevFieldMappings, [field]: e.target.value }))
                    }
                  />
                </div>
              ))}
            </ResponsePanel>
          )}

          {Object.keys(queryMappings).length > 0 && (
            <ResponsePanel title="Query Parameters">
              {Object.entries(queryMappings).map(([param, type]) => (
                <div key={param} className="pb-3 first-of-type:pt-3 px-3 flex items-center justify-between">
                  <span className="font-monospace text-ellipsis text-nowrap overflow-hidden">{param}</span>
                  <SimpleSelect
                    className="rounded-none! p-1! outline-none"
                    options={parameterOptions}
                    value={type}
                    onChange={(e) =>
                      setQueryMappings((prevQueryMappings) => ({ ...prevQueryMappings, [param]: e.target.value }))
                    }
                  />
                </div>
              ))}
            </ResponsePanel>
          )}
        </div>
      )}

      <div>
        <Button disabled={isRunningTests()} onClick={runAllTests}>
          {isRunningTests() ? `Running tests... (${currentTest}/${testCount})` : 'Generate & Run Tests'}
        </Button>
      </div>

      {testsRun && (
        <>
          <ResponsePanel title="Security & Headers Tests">
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
                {isSecurityRunning && securityTests.length === 0 ? (
                  <tr>
                    <td colSpan={4}>⏳ Running security tests...</td>
                  </tr>
                ) : (
                  securityTests.map((r, i) => (
                    <React.Fragment key={i}>
                      <tr
                        className={
                          r.status.includes('Pass')
                            ? 'pass'
                            : r.status.includes('Fail')
                              ? 'fail'
                              : r.status.includes('Warning')
                                ? 'warn'
                                : r.status.includes('Manual')
                                  ? 'manual'
                                  : r.status.includes('Info')
                                    ? 'info'
                                    : 'bug'
                        }
                        onClick={() => toggleSecurityRow(i)}
                        style={{ cursor: 'pointer' }}
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
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                }}
                              >
                                <CopyButton req={r.request} />
                              </div>
                              <div className="details-grid">
                                <div>
                                  <div className="details-title">Request</div>
                                  <pre className="wrap">{JSON.stringify(r.request, null, 2)}</pre>
                                </div>
                                <div>
                                  <div className="details-title">Response</div>
                                  <pre className="wrap">
                                    {typeof r.response === 'string' ? r.response : JSON.stringify(r.response, null, 2)}
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
          </ResponsePanel>

          <ResponsePanel title="Performance Insights">
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
                {isPerformanceRunning && performanceTests.length === 0 ? (
                  <tr>
                    <td colSpan={4}>⏳ Running Performance Insights...</td>
                  </tr>
                ) : (
                  performanceTests
                    .sort((a, b) =>
                      a.name === 'Rate limiting implementation'
                        ? 1
                        : b.name === 'Rate limiting implementation'
                          ? -1
                          : 0,
                    )
                    .map((r, i) => {
                      const isManual = r.status === '⚪ Manual' || r.name === 'Rate limiting implementation';

                      // nustatom spalvą
                      // nustatom spalvą
                      let rowClass = '';
                      if (r.name === 'Load test' && !r.actual) rowClass = 'manual';
                      else if (isManual) rowClass = 'manual';
                      else if (r.actual?.includes('⏳')) rowClass = 'info';
                      else if (r.actual?.includes('5xx') || r.actual?.includes('p50')) {
                        if (/p50=\d+ms/.test(r.actual)) {
                          const p50 = parseInt(r.actual.match(/p50=(\d+)/)?.[1] || '0');
                          rowClass = p50 < 500 ? 'pass' : p50 < 1000 ? 'warn' : 'fail';
                        } else if (r.status.includes('Fail')) rowClass = 'fail';
                        else if (r.status.includes('Warning')) rowClass = 'warn';
                        else if (r.status.includes('Pass')) rowClass = 'pass';
                        else rowClass = '';
                      }

                      // 🆕 naujas papildymas:
                      else if (r.status.includes('Pass')) rowClass = 'pass';
                      else if (r.status.includes('Warning')) rowClass = 'warn';
                      else if (r.status.includes('Fail')) rowClass = 'fail';
                      else if (r.status.includes('Manual')) rowClass = 'manual';
                      else if (r.status.includes('Info')) rowClass = 'info';
                      else rowClass = '';

                      return (
                        <tr key={i} className={rowClass}>
                          <td>{r.name}</td>
                          <td>{r.expected}</td>
                          <td>{r.actual}</td>
                          <td style={{ textAlign: 'center' }}>
                            {r.name === 'Load test' ? (
                              <div
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  gap: '2px',
                                  justifyContent: 'center',
                                }}
                              >
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                  }}
                                >
                                  <div
                                    style={{
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'center',
                                    }}
                                  >
                                    <label style={{ fontSize: '10px', color: '#666' }}>Threads</label>
                                    <input
                                      type="number"
                                      min={1}
                                      max={100}
                                      value={loadConcurrency}
                                      onChange={(e) =>
                                        setLoadConcurrency(Math.min(100, Math.max(1, Number(e.target.value))))
                                      }
                                      style={{
                                        width: '50px',
                                        fontSize: '12px',
                                        padding: '2px',
                                        textAlign: 'center',
                                      }}
                                      title="Threads (max 100)"
                                    />
                                  </div>

                                  <div
                                    style={{
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'center',
                                    }}
                                  >
                                    <label style={{ fontSize: '10px', color: '#666' }}>Requests</label>
                                    <input
                                      type="number"
                                      min={1}
                                      max={10000}
                                      value={loadTotal}
                                      onChange={(e) =>
                                        setLoadTotal(Math.min(10000, Math.max(1, Number(e.target.value))))
                                      }
                                      style={{
                                        width: '70px',
                                        fontSize: '12px',
                                        padding: '2px',
                                        textAlign: 'center',
                                      }}
                                      title="Total requests (max 10 000)"
                                    />
                                  </div>

                                  <button
                                    onClick={runLoadTest}
                                    disabled={loadRunning}
                                    style={{
                                      background: '#007bff',
                                      color: '#fff',
                                      border: 'none',
                                      borderRadius: '4px',
                                      padding: '3px 8px',
                                      fontSize: '12px',
                                      cursor: 'pointer',
                                      marginTop: '12px',
                                    }}
                                  >
                                    {loadRunning ? '⏳' : 'Run'}
                                  </button>
                                </div>
                              </div>
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
          </ResponsePanel>

          <ResponsePanel title="Data Handling & Input Validation">
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
                {isDataDrivenRunning && dataDrivenTests.length === 0 ? (
                  <tr>
                    <td colSpan={5}>⏳ Running data-driven tests...</td>
                  </tr>
                ) : (
                  dataDrivenTests.map((r, i) => (
                    <React.Fragment key={i}>
                      <tr
                        className={
                          /^5\d\d/.test(r.actual)
                            ? 'bug'
                            : r.status.includes('Pass')
                              ? 'pass'
                              : r.status.includes('Fail')
                                ? 'fail'
                                : 'bug'
                        }
                        onClick={() => toggleRow(i)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td className="expander">
                          <span className="chevron">{expandedRows[i] ? '▾' : '▸'}</span>
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
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                }}
                              >
                                <CopyButton req={r.request} />
                              </div>
                              <div className="details-grid">
                                <div>
                                  <div className="details-title">Request</div>
                                  <pre className="wrap">{JSON.stringify(r.request, null, 2)}</pre>
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
                  ))
                )}
              </tbody>
            </table>
          </ResponsePanel>

          <ResponsePanel title="CRUD">
            <table className="results-table">
              <thead>
                <tr>
                  <th>Method</th>
                  <th>Expected</th>
                  <th>Actual</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {crudTests.length === 0 ? (
                  <tr>
                    <td colSpan={4}>⏳ Preparing CRUD…</td>
                  </tr>
                ) : (
                  crudTests.map((r, i) => {
                    const rowClass = r.status.includes('Pass')
                      ? 'pass'
                      : r.status.includes('Fail')
                        ? 'fail'
                        : r.status.includes('Warning')
                          ? 'warn'
                          : r.status.includes('Manual')
                            ? 'manual'
                            : r.status.includes('Info')
                              ? 'info'
                              : 'bug';

                    const isExpanded = expandedCrudRows[i];
                    const toggleExpand = () => {
                      setExpandedCrudRows((prev) => ({
                        ...prev,
                        [i]: !prev[i],
                      }));
                    };

                    return (
                      <React.Fragment key={i}>
                        <tr
                          className={rowClass}
                          onClick={toggleExpand}
                          style={{ cursor: r.request ? 'pointer' : 'default' }}
                        >
                          <td className="expander">
                            <span className="chevron">{isExpanded ? '▾' : '▸'}</span>
                            {r.method}
                          </td>
                          <td>{r.expected}</td>
                          <td>{r.actual || 'Not available yet'}</td>
                          <td>{r.status}</td>
                        </tr>

                        {isExpanded && (
                          <tr className="details-row">
                            <td colSpan={4}>
                              <div className="details-panel">
                                <div
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                  }}
                                >
                                  <CopyButton req={r.request} />
                                </div>
                                <div className="details-grid">
                                  <div>
                                    <div className="details-title">Request</div>
                                    <pre className="wrap">{JSON.stringify(r.request, null, 2)}</pre>
                                  </div>
                                  <div>
                                    <div className="details-title">Response</div>
                                    <pre className="wrap">
                                      {r.response ? JSON.stringify(r.response, null, 2) : 'null'}
                                    </pre>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </ResponsePanel>
        </>
      )}
    </div>
  );

  async function runAllTests() {
    setTestsRun(true);

    await executeAllTests();
  }

  function isRunningTests() {
    return isSecurityRunning || isPerformanceRunning || isDataDrivenRunning;
  }

  function importCurl() {
    try {
      if (curl.length > 200_000) throw new Error('cURL too large');

      const { url, method, headers, body } = extractCurl(curl);

      setUrl(url);
      setMethod(method as Method);
      setBody(body ? body : '{}');
      setHeaders(
        Object.entries(headers)
          .map(([k, v]) => `${k}: ${v}`)
          .join('\n'),
      );

      setOpenCurlModal(false);
      setCurl('');
      setCurlError('');
    } catch (error) {
      console.error('cURL import failed', error);
      setCurlError('The cURL command you provided appears to be invalid. Please check it and try again.');
    }
  }

  async function sendHttp() {
    setHttpResponse({
      status: 'Sending...',
      body: '',
      headers: {},
    });

    try {
      const response = await window.electronAPI.sendHttp({
        url,
        method,
        headers: parseHeaders(headers),
        body: protoFile && messageType ? encodeMessage(messageType, JSON.parse(body)) : body,
      });

      setHttpResponse(response);

      // Generate test mappings based on request body (not response)
      let parsedBody;
      try {
        parsedBody = JSON.parse(body);
      } catch {
        return;
      }

      if (response.status.startsWith('2') && parsedBody) {
        // Extract all fields from request body (including nested)
        const extractedFields = extractFieldsFromJson(parsedBody);
        const bodyMappings: Record<string, string> = {};

        for (const [fieldPath, fieldType] of Object.entries(extractedFields)) {
          if (fieldType === 'DO_NOT_TEST') bodyMappings[fieldPath] = 'do-not-test';
          else {
            // For non-object fields - detect the actual type from the value
            // Get the actual value from the path
            const pathSegments = fieldPath.replace(/\[(\d+)\]/g, '.$1').split('.');
            let fieldValue = parsedBody;
            for (const segment of pathSegments) {
              if (fieldValue == null) break;
              fieldValue = fieldValue[segment];
            }
            bodyMappings[fieldPath] = detectFieldType(fieldValue);
          }
        }

        setFieldMappings(bodyMappings);

        // Generate query parameter mappings
        const queryParams = extractQueryParams(url);
        const queryParamMappings: Record<string, string> = {};

        for (const [key, value] of Object.entries(queryParams)) queryParamMappings[key] = detectFieldType(value);

        setQueryMappings(queryParamMappings);
      }
    } catch (error) {
      setHttpResponse({
        status: 'Network Error',
        body: String(error),
        headers: {},
      });
    }
  }

  function connectWss() {
    if (!url.startsWith('ws')) {
      setMessages((prevMessages) => [
        { direction: 'system', data: '❌ Please use ws:// or wss:// URL' },
        ...prevMessages,
      ]);
      return;
    }

    window.electronAPI.connectWss({ url, headers: parseHeaders(headers) });
  }

  function sendWss() {
    setMessages((prevMessages) => [{ direction: 'sent', data: body }, ...prevMessages]);
    window.electronAPI.sendWss(body);
  }
}
