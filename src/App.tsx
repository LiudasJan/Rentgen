import cn from 'classnames';
import React, { useEffect, useState } from 'react';
import Button, { ButtonType } from './components/buttons/Button';
import Input from './components/inputs/Input';
import Select, { SelectOption } from './components/inputs/Select';
import SimpleSelect from './components/inputs/SimpleSelect';
import Textarea from './components/inputs/Textarea';
import Modal from './components/modals/Modal';
import ResponsePanel from './components/panels/ResponsePanel';
import { datasets } from './constants/datasets';
import {
  decodeMessage,
  detectFieldType,
  encodeMessage,
  extractCurl,
  extractFieldsFromJson,
  extractQueryParams,
  loadProtoSchema,
  parseHeaders,
} from './utils';

type Mode = 'HTTP' | 'WSS';
type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

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

  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // --- State ---
  const [currentTest, setCurrentTest] = useState(0);
  const [totalTests, setTotalTests] = useState(0);

  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
  const toggleRow = (idx: number) => setExpandedRows((prev) => ({ ...prev, [idx]: !prev[idx] }));

  const [securityResults, setSecurityResults] = useState<any[]>([]);

  const [expandedSecurityRows, setExpandedSecurityRows] = useState<Record<number, boolean>>({});
  const toggleSecurityRow = (idx: number) => setExpandedSecurityRows((prev) => ({ ...prev, [idx]: !prev[idx] }));
  const [expandedCrudRows, setExpandedCrudRows] = useState<Record<number, boolean>>({});

  const [performanceResults, setPerformanceResults] = useState<any[]>([]);

  const [loadingData, setLoadingData] = useState(false);
  const [loadingSecurity, setLoadingSecurity] = useState(false);
  const [loadingPerf, setLoadingPerf] = useState(false);
  const [testsStarted, setTestsStarted] = useState(false);

  // Load test UI/rezultatai
  const [loadConcurrency, setLoadConcurrency] = useState(10); // threads
  const [loadTotal, setLoadTotal] = useState(100); // total requests
  const [loadRunning, setLoadRunning] = useState(false);

  // 🆕 Progress bar būsena (nebūtina, bet patogu jei norėsi rodyti dar ir kitur)
  const [loadProgressPct, setLoadProgressPct] = useState(0);
  const [loadProgressText, setLoadProgressText] = useState('');

  const [crudResults, setCrudResults] = useState<any[]>([]);
  const [responseBody, setResponseBody] = useState<any>(null);
  const [responseHeaders, setResponseHeaders] = useState<any>(null);

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

  // --- SECURITY TESTS ---
  async function runSecurityTests(): Promise<any[]> {
    const results: any[] = [];

    // paimam user įvestus headerius (tokius pačius kaip sendHttp ir runDataDrivenTests)
    const hdrs = parseHeaders(headers);

    try {
      // 1. Sensitive headers
      const base = await window.electronAPI.sendHttp({
        url,
        method,
        headers: hdrs,
        body,
      });

      setResponseBody(base.body);
      setResponseHeaders(base.headers);

      // Tikrinam Server header
      const serverHeader = base.headers?.['server'] || base.headers?.['Server'] || '';
      const hasVersionNumber = /\d/.test(serverHeader);

      results.push({
        name: 'No sensitive server headers',
        expected: 'Server header should not expose version',
        actual: serverHeader || 'No Server header',
        status: hasVersionNumber ? '🔴 Fail' : '✅ Pass',
        request: { url, method: 'GET', headers: hdrs },
        response: base,
      });

      // 2. Tikrinam Clickjacking protection
      const xfo = base.headers?.['x-frame-options'] || base.headers?.['X-Frame-Options'];
      const csp = base.headers?.['content-security-policy'] || base.headers?.['Content-Security-Policy'];

      let clickjackingStatus = '🟠 Warning';
      let actualClickjacking = 'Missing';

      if (xfo) {
        const val = xfo.toUpperCase();
        if (val === 'DENY' || val === 'SAMEORIGIN') {
          clickjackingStatus = '✅ Pass';
        }
        actualClickjacking = `X-Frame-Options: ${val}`;
      } else if (csp && csp.includes('frame-ancestors')) {
        if (/frame-ancestors\s+('none'|'self')/i.test(csp)) {
          clickjackingStatus = '✅ Pass';
        }
        actualClickjacking = `CSP: ${csp}`;
      }

      results.push({
        name: 'Clickjacking protection',
        expected: 'X-Frame-Options DENY/SAMEORIGIN or CSP frame-ancestors',
        actual: actualClickjacking,
        status: clickjackingStatus,
        request: { url, method, headers: hdrs, body },
        response: base,
      });

      // 3. Tikrinam HSTS
      const hsts = base.headers?.['strict-transport-security'] || base.headers?.['Strict-Transport-Security'];

      let hstsStatus = '🟠 Warning';
      let actualHsts = 'Missing';

      if (hsts) {
        hstsStatus = '✅ Pass';
        actualHsts = hsts;
      }

      results.push({
        name: 'HSTS (Strict-Transport-Security)',
        expected: 'Header should be present on HTTPS endpoints',
        actual: actualHsts,
        status: hstsStatus,
        request: { url, method, headers: hdrs, body },
        response: base,
      });

      // 4. Tikrinam MIME sniffing protection
      const xcto = base.headers?.['x-content-type-options'] || base.headers?.['X-Content-Type-Options'];

      let xctoStatus = '❌ Fail';
      let actualXcto = 'Missing';

      if (xcto) {
        if (xcto.toLowerCase() === 'nosniff') {
          xctoStatus = '✅ Pass';
          actualXcto = `X-Content-Type-Options: ${xcto}`;
        } else {
          xctoStatus = '❌ Fail';
          actualXcto = `Unexpected: ${xcto}`;
        }
      }

      results.push({
        name: 'MIME sniffing protection',
        expected: 'X-Content-Type-Options: nosniff',
        actual: actualXcto,
        status: xctoStatus,
        request: { url, method, headers: hdrs, body },
        response: base,
      });

      // 5. Cache-Control check
      const cacheControl = base.headers?.['cache-control'] || base.headers?.['Cache-Control'];

      let cacheStatus = '🟠 Warning';
      let actualCache = 'Missing';

      if (cacheControl) {
        if (cacheControl.includes('no-store') || cacheControl.includes('private')) {
          cacheStatus = '✅ Pass';
        } else {
          cacheStatus = '❌ X-Fail';
        }
        actualCache = cacheControl;
      } else {
        const m = method.toUpperCase();
        if (m === 'GET' || m === 'HEAD') {
          cacheStatus = '❌ X-Fail'; // pavojinga
        } else {
          cacheStatus = '🟠 Warning'; // saugu by default, bet geriau nurodyti
        }
      }

      results.push({
        name: 'Cache-Control for private API',
        expected: 'Cache-Control: no-store/private',
        actual: actualCache,
        status: cacheStatus,
        request: { url, method, headers: hdrs },
        response: base,
      });

      // 6. OPTIONS method
      const opt = await window.electronAPI.sendHttp({
        url,
        method: 'OPTIONS',
        headers: hdrs,
        body: null,
      });

      // leidžiam tiek 200, tiek 204, bet reikalaujam Allow header
      const optionCode = opt.status.split(' ')[0];
      const allowHeader =
        opt.headers?.['allow'] ||
        opt.headers?.['Allow'] ||
        opt.headers?.['access-control-allow-methods'] ||
        opt.headers?.['Access-Control-Allow-Methods'];

      const hasAllow = Boolean(allowHeader);
      const okOptions = (optionCode === '200' || optionCode === '204') && hasAllow;

      results.push({
        name: 'OPTIONS method handling',
        expected: '200 or 204 + Allow header',
        actual: opt.status,
        status: okOptions ? '✅ Pass' : '❌ Fail',
        request: { url, method: 'OPTIONS', headers: hdrs },
        response: opt,
      });

      await buildCrudRowsFromOptions(allowHeader, url, hdrs, base, okOptions);

      // 7. Unsupported method
      const weird = await window.electronAPI.sendHttp({
        url,
        method: 'FOOBAR',
        headers: hdrs, // ✅ originalūs headeriai
        body, // ✅ originalus body
      });
      const code = weird.status.split(' ')[0];
      const okWeird = code === '405' || code === '501';
      results.push({
        name: 'Unsupported method handling',
        expected: '405 Method Not Allowed (or 501)',
        actual: weird.status,
        status: okWeird ? '✅ Pass' : '❌ Fail',
        request: { url, method: 'FOOBAR', headers: hdrs, body },
        response: weird,
      });
    } catch (err) {
      results.push({
        name: 'Security test error',
        expected: 'Should respond',
        actual: String(err),
        status: '🔴 Fail',
        request: { url, headers: hdrs, body },
        response: null,
      });

      const corsResult = await runCorsTest();
      results.push(corsResult);
    }

    // 8. Large body / size limit
    const bigBody = 'A'.repeat(10 * 1024 * 1024); // 10 MB string
    const tooLarge = await window.electronAPI.sendHttp({
      url,
      method: 'POST', // dažniausiai POST su body
      headers: { ...hdrs, 'Content-Type': 'application/json' },
      body: bigBody,
    });

    const codeLarge = tooLarge.status.split(' ')[0];
    const okLarge = codeLarge === '413';
    results.push({
      name: 'Request size limit (10 MB)',
      expected: '413 Payload Too Large',
      actual: tooLarge.status,
      status: okLarge ? '✅ Pass' : '❌ Fail',
      request: { url, method: 'POST', headers: hdrs, body: '[10MB string]' },
      response: tooLarge,
    });

    // 9. Missing authorization cookie/token
    try {
      const minimalHeaders: Record<string, string> = {};
      for (const [k, v] of Object.entries(hdrs)) {
        const key = k.toLowerCase();
        if (key === 'accept' || key === 'content-type') {
          minimalHeaders[k] = v;
        }
      }

      const missingAuth = await window.electronAPI.sendHttp({
        url,
        method,
        headers: minimalHeaders,
        body,
      });

      const code = missingAuth.status.split(' ')[0];
      const ok401 = code === '401';

      results.push({
        name: 'Missing authorization cookie/token',
        expected: 'Should return 401 Unauthorized',
        actual: missingAuth.status,
        status: ok401 ? '✅ Pass' : '❌ Fail',
        request: { url, method, headers: minimalHeaders, body }, // ✅ pridėjau body
        response: missingAuth,
      });
    } catch (err) {
      results.push({
        name: 'Missing authorization cookie/token',
        expected: 'Should return 401 Unauthorized',
        actual: String(err),
        status: '🔴 Bug',
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
        name: 'Invalid authorization cookie/token',
        expected: 'Should return 401 Unauthorized',
        actual: 'Not available yet',
        status: '⚪ Manual',
        request: null,
        response: null,
      },
      {
        name: 'Access other user’s data',
        expected: 'Should return 404 or 403',
        actual: 'Not available yet',
        status: '⚪ Manual',
        request: null,
        response: null,
      },
      {
        name: 'Role-based access control',
        expected: 'Restricted per role',
        actual: 'Not available yet',
        status: '⚪ Manual',
        request: null,
        response: null,
      },
    );

    return results;
  }

  // --- buildCrudRowsFromOptions ---
  async function buildCrudRowsFromOptions(allowHeader: string, url: string, hdrs: any, base: any, okOptions: any) {
    try {
      // 1️⃣ Jei OPTIONS failino – viena raudona eilutė
      if (!okOptions) {
        setCrudResults([
          {
            method: 'CRUD',
            expected: 'Discover via OPTIONS',
            actual: 'CRUD not available — OPTIONS test failed',
            status: '❌ Fail',
            request: null,
            response: null,
          },
        ]);
        return;
      }

      // 2️⃣ OPTIONS OK – parse metodus
      const allow = String(allowHeader || '')
        .split(',')
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean);

      // 3️⃣ Bandome gauti pavyzdinį body iš originalaus RESPONSE
      let sampleBody: any = {};
      try {
        if (typeof base?.body === 'string') {
          sampleBody = JSON.parse(base.body);
        } else if (base?.body && typeof base.body === 'object') {
          sampleBody = base.body;
        } else {
          sampleBody = {};
        }
      } catch {
        sampleBody = {};
      }

      // 4️⃣ Aprašymai
      const desc: Record<string, string> = {
        GET: 'Fetch data',
        POST: 'Create resource',
        PUT: 'Update resource',
        PATCH: 'Update resource fields',
        DELETE: 'Remove resource',
        HEAD: 'Headers only',
        OPTIONS: 'Discovery',
      };

      // 5️⃣ Surenkam CRUD eilutes
      const rows = allow.map((m) => {
        const req: any = { url, method: m, headers: hdrs as any };

        if (!['GET', 'HEAD'].includes(m)) {
          req.body = sampleBody && Object.keys(sampleBody).length ? sampleBody : {};
        }

        return {
          method: m,
          expected: desc[m] || 'Custom method',
          actual: 'Not available yet',
          status: '⚪ Manual',
          request: req,
          response: null,
        };
      });

      setCrudResults(rows);
    } catch {
      // Fallback
      setCrudResults([
        {
          method: 'CRUD',
          expected: 'Discover via OPTIONS',
          actual: 'Not available',
          status: '⚪ Manual',
          request: null,
          response: null,
        },
      ]);
    }
  }

  // --- 404 Not Found test ---
  async function runNotFoundTest(url: string, method: string, headers: any, body: any) {
    let testUrl = url;

    try {
      const u = new URL(url);
      // jei turi query, NOT_FOUND pridedam prie pathname
      u.pathname = u.pathname.endsWith('/') ? `${u.pathname}NOT_FOUND` : `${u.pathname}/NOT_FOUND`;
      testUrl = u.toString();
    } catch {
      // fallback, jei blogas URL
      testUrl = url.endsWith('/') ? `${url}NOT_FOUND` : `${url}/NOT_FOUND`;
    }

    const start = performance.now();
    try {
      const res = await window.electronAPI.sendHttp({
        url: testUrl,
        method,
        headers,
        body,
      });
      const end = performance.now();
      const responseTime = end - start;

      const statusCode = parseInt(res.status?.split(' ')[0] || '0', 10);
      const statusText = res.status?.split(' ').slice(1).join(' ') || '';

      const status = statusCode === 404 ? '✅ Pass' : statusCode === 0 ? '❌ Fail (No response)' : '❌ Fail';

      return {
        name: '404 Not Found',
        expected: '404 Not Found',
        actual: `${statusCode} ${statusText}`,
        status,
        responseTime,
        request: { url: testUrl, method, headers, body },
        response: res,
      };
    } catch (err: any) {
      return {
        name: '404 Not Found',
        expected: '404 Not Found',
        actual: 'Request failed',
        status: '❌ Fail',
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

    // 🔁 Resetinam visus rezultatus prieš naują paleidimą
    setTestResults([]);
    setSecurityResults([]);
    setPerformanceResults([]);
    setCrudResults([]);
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

    const hdrs = parseHeaders(headers);

    // paskaičiuojam kiek testų bus (BODY + QUERY)
    let total = 0;
    for (const [field, type] of Object.entries(fieldMappings)) {
      if (type === 'do-not-test' || type === 'random32') continue;
      total += (datasets[type] || []).length;
    }
    for (const [param, type] of Object.entries(queryMappings)) {
      if (type === 'do-not-test' || type === 'random32') continue;
      total += (datasets[type] || []).length;
    }
    setTotalTests(1 + total);

    const results: any[] = [];
    let counter = 0;

    // 🟢 VISADA siunčiam originalų request pirmu numeriu
    try {
      const start = performance.now();
      const res = await window.electronAPI.sendHttp({
        url,
        method,
        headers: hdrs,
        body: parsedBody,
      });
      const end = performance.now();

      results.push({
        field: '(original request)',
        value: parsedBody,
        expected: '2xx',
        actual: res.status,
        status: res.status.startsWith('2') ? '✅ Pass' : '❌ Fail',
        request: { url, method, headers: hdrs, body: parsedBody },
        response: typeof res.body === 'string' ? res.body : JSON.stringify(res.body, null, 2),
        responseTime: end - start,
      });
    } catch (err: any) {
      results.push({
        field: '(original request)',
        value: parsedBody,
        expected: '2xx',
        actual: 'Error',
        status: '🔴 Bug',
        request: { url, method, headers, body: parsedBody },
        response: String(err),
        responseTime: 0,
      });
    }

    for (const [field, type] of Object.entries(fieldMappings)) {
      if (type === 'do-not-test') continue;

      const dataset =
        type === 'random32' || type === 'randomInt' ? [{ dynamic: true, valid: true }] : datasets[type] || [];

      for (const d of dataset) {
        counter++;
        setCurrentTest(counter);

        // pradinė body kopija
        const val = (d as any).value;

        // pradinė body kopija (deep clone kad neišdarkytų originalo)
        const newBody = JSON.parse(JSON.stringify(parsedBody));

        const newValue =
          type === 'randomInt'
            ? randInt()
            : type === 'random32'
              ? rand32()
              : type === 'randomEmail'
                ? randEmail()
                : val;

        setDeepValue(newBody, field, newValue);

        // 💡 kiekvienam request’ui perrašom visus random32/randomInt laukus
        for (const [f, t] of Object.entries(fieldMappings)) {
          if (t === 'random32') newBody[f] = rand32();
          if (t === 'randomInt') newBody[f] = randInt();
          if (t === 'randomEmail') newBody[f] = randEmail();
        }

        let dataToSend: any = newBody;
        if (protoFile && messageType) {
          try {
            dataToSend = encodeMessage(messageType, newBody);
          } catch (err) {
            const val = 'value' in d ? d.value : null;
            results.push({
              field,
              value: val,
              expected: d.valid ? '2xx' : '4xx',
              actual: 'Encode error',
              status: '🔴 Bug',
              request: { url, method, headers: hdrs, body: newBody },
              response: String(err),
              responseTime: 0,
            });
            continue;
          }
        }

        try {
          const start = performance.now();
          const res = await window.electronAPI.sendHttp({
            url,
            method,
            headers: hdrs,
            body: dataToSend,
          });
          const end = performance.now();
          const responseTime = end - start;

          // --- naujas status parsing ---
          let statusCode = 0;
          let statusText = '';
          if (res.status) {
            const parts = res.status.split(' ');
            statusCode = parseInt(parts[0], 10);
            statusText = parts.slice(1).join(' ');
          }

          const ok = statusCode >= 200 && statusCode < 300;

          // response text
          let responseText: string;
          if (typeof res.body === 'string') {
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
              const obj = decodeMessage(messageType, new Uint8Array(res.body));
              decoded = JSON.stringify(obj, null, 2);
            } catch {
              decoded = null;
            }
          }

          let status = '';
          if (d.valid) {
            // tikimės 2xx
            if (ok) status = '✅ Pass';
            else status = '❌ Fail';
          } else {
            // tikimės 4xx
            if (statusCode >= 400 && statusCode < 500) status = '✅ Pass';
            else if (ok) status = '❌ Fail';
            else if (statusCode >= 500) status = '🔴 Bug';
            else status = '❌ Fail';
          }

          results.push({
            field,
            value: val,
            expected: d.valid ? '2xx' : '4xx',
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
            expected: d.valid ? '2xx' : '4xx',
            actual: 'Error',
            status: '🔴 Bug',
            request: { url, method, headers: hdrs, body: newBody },
            response: String(err),
            responseTime: 0,
          });
        }
      }
    }

    // 🆕 Query param testai
    for (const [param, type] of Object.entries(queryMappings)) {
      if (type === 'do-not-test') continue;
      const dataset = datasets[type] || [];

      for (const d of dataset) {
        counter++;
        setCurrentTest(counter);

        const val = d.value;
        const u = new URL(url);
        u.searchParams.set(param, String(val));

        const start = performance.now();
        const res = await window.electronAPI.sendHttp({
          url: u.toString(),
          method,
          headers: hdrs,
          body: parsedBody,
        });
        const end = performance.now();
        const responseTime = end - start;

        const statusCode = parseInt(res.status?.split(' ')[0] || '0', 10);
        const ok = statusCode >= 200 && statusCode < 300;
        const status = (d.valid && ok) || (!d.valid && statusCode >= 400 && statusCode < 500) ? '✅ Pass' : '❌ Fail';

        results.push({
          field: `query.${param}`,
          value: val,
          expected: d.valid ? '2xx' : '4xx',
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

    let status = '';
    if (med <= 500) status = '✅ Pass';
    else if (med <= 1000) status = '🟠 Warning';
    else status = '🔴 Fail';

    results.push({
      name: 'Median response time',
      expected: '<= 500ms',
      actual: `${med.toFixed(0)} ms`,
      status,
    });

    // Ping
    try {
      const domain = new URL(url).hostname;
      const pings: number[] = [];
      for (let i = 0; i < 5; i++) {
        const t = await window.electronAPI.pingHost(domain);
        pings.push(t);
      }
      const badCount = pings.filter((t) => t > 100).length;
      const avg = pings.reduce((a, b) => a + b, 0) / pings.length;
      const pingStatus = badCount >= 3 ? '🔴 Fail' : '✅ Pass';

      results.push({
        name: 'Ping latency',
        expected: '<= 100ms (3/5 rule)',
        actual: `${avg.toFixed(0)} ms (bad ${badCount}/5)`,
        status: pingStatus,
      });
    } catch (err) {
      results.push({
        name: 'Ping test error',
        expected: 'Ping should succeed',
        actual: String(err),
        status: '🔴 Fail',
      });
    }

    // --- Load test (manual trigger, not auto run) ---
    results.push({
      name: 'Load test',
      expected: 'Median <500 ms (Pass), <1000 ms (Warning), ≥1000 ms (Fail)',
      actual: '', // tuščia, nes dar nebuvo paleista
      status: '⚪ Manual', // paliekam pilką
    });

    results.push({
      name: 'Rate limiting implementation',
      expected: '429 Too Many Requests',
      actual: 'Not available yet',
      status: '⚪ Manual',
    });

    return results;
  }

  // --- RANDOM STRING ---
  function rand32() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let out = '';
    for (let i = 0; i < 32; i++) out += chars[Math.floor(Math.random() * chars.length)];
    return out;
  }

  // --- RANDOM Integer ---
  function randInt() {
    return Math.floor(Math.random() * 10_000_000) + 1;
  }

  // --- RANDOM Email ---
  function randEmail() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let name = '';
    for (let i = 0; i < 8; i++) name += chars[Math.floor(Math.random() * chars.length)];
    return `${name}@qaontime.com`;
  }

  // --- Measure median helper ---
  function median(values: number[]): number {
    if (values.length === 0) return 0;
    values.sort((a, b) => a - b);
    const mid = Math.floor(values.length / 2);
    return values.length % 2 !== 0 ? values[mid] : (values[mid - 1] + values[mid]) / 2;
  }

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

  // --- runCorsTest
  async function runCorsTest(): Promise<any> {
    try {
      const hdrs = parseHeaders(headers);

      const options: RequestInit = {
        method,
        mode: 'cors',
        headers: hdrs,
      };

      if (body && !['GET', 'HEAD'].includes(method.toUpperCase())) {
        options.body = body;
      }

      const res = await fetch(url, options);

      return {
        name: 'CORS policy check',
        expected: 'Detect if API is public or private',
        actual: 'No CORS error → API is public (accessible from any domain)',
        status: '🔵 Info',
        request: { url, method, headers: hdrs, body },
        response: { status: res.status },
      };
    } catch (err: any) {
      const msg = String(err?.message || err);
      if (msg.includes('CORS') || msg.includes('Failed to fetch')) {
        return {
          name: 'CORS policy check',
          expected: 'Detect if API is public or private',
          actual: 'CORS error → API is private (restricted by origin)',
          status: '🔵 Info',
          request: { url, method, headers, body },
          response: null,
        };
      }
      return {
        name: 'CORS policy check',
        expected: 'Detect if API is public or private',
        actual: 'Unexpected error: ' + msg,
        status: '🔵 Info',
        request: { url, method, headers, body },
        response: null,
      };
    }
  }

  /// --- setDeepValue ---
  function setDeepValue(obj: any, path: string, value: any) {
    const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.');
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
      if (t === 'random32') setDeepValue(newBody, f, rand32());
      if (t === 'randomInt') setDeepValue(newBody, f, randInt());
      if (t === 'randomEmail') setDeepValue(newBody, f, randEmail());
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
      setLoadProgressText(`${bar} (${sentCount}/${loadTotal})`);

      // atnaujinam Performance lentelės „Load test“ eilutę
      setPerformanceResults((prev) => {
        const other = prev.filter((x) => x.name !== 'Load test');
        return [
          ...other,
          {
            name: 'Load test',
            expected: 'Median <500 ms (Pass), <1000 ms (Warning), ≥1000 ms (Fail)',
            actual: `⏳ ${bar} (${sentCount}/${loadTotal})`,
            status: '🔵 Info',
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
    setLoadProgressText(initialBar + ' (0/' + loadTotal + ')');

    // 🆕 Iš karto atnaujinam Performance lentelės „Load test“ eilutę, kad matytųsi 0%
    setPerformanceResults((prev) => {
      const other = prev.filter((x) => x.name !== 'Load test');
      return [
        ...other,
        {
          name: 'Load test',
          expected: 'Median <500 ms (Pass), <1000 ms (Warning), ≥1000 ms (Fail)',
          actual: `⏳ ${initialBar} (0/${loadTotal})`,
          status: '🔵 Info',
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

    const status = failures5xx >= 5 ? '🔴 Fail' : p50 < 500 ? '✅ Pass' : p50 < 1000 ? '🟠 Warning' : '🔴 Fail';

    // įrašom/atnaujinam "Load test" eilutę Performance Insights lentelėje
    setPerformanceResults((prev) => {
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

  function truncateValue(value: any, maxLength = 100) {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';

    let str: string;

    switch (typeof value) {
      case 'string':
        str = `"${value}"`;
        break;
      case 'number':
      case 'boolean':
        str = String(value);
        break;
      case 'object':
        try {
          str = JSON.stringify(value);
        } catch {
          str = '[object]';
        }
        break;
      default:
        str = String(value);
    }

    return str.length > maxLength ? str.slice(0, maxLength) + ' ...' : str;
  }

  return (
    <div className="py-5 px-7">
      <div className="flex items-center gap-2 mb-4">
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

      <div className="flex items-center gap-2 mb-4">
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
        className="mb-4 font-monospace"
        placeholder="Header-Key: value"
        value={headers}
        onChange={(e) => setHeaders(e.target.value)}
      />

      <div className="relative mb-4">
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
            try {
              setBody(JSON.stringify(JSON.parse(body), null, 2));
            } catch {
              // Silently ignore JSON parse errors
            }
          }}
        >
          Beautify
        </Button>
      </div>

      <div className="mb-4">
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
        <ResponsePanel className="mb-4" title="Response">
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
        <ResponsePanel className="mb-4" title="Messages">
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
        <div className="mb-4 grid grid-cols-2 gap-4 items-stretch">
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

      <Button disabled={loading} onClick={runAllTests}>
        {loading ? `Running tests... (${currentTest}/${totalTests})` : 'Generate & Run Tests'}
      </Button>

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
                    a.name === 'Rate limiting implementation' ? 1 : b.name === 'Rate limiting implementation' ? -1 : 0,
                  )
                  .map((r, i) => {
                    const isLoad = r.name === 'Load test';
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
                                    onChange={(e) => setLoadTotal(Math.min(10000, Math.max(1, Number(e.target.value))))}
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
        </div>
      )}

      {/* CRUD */}
      {testsStarted && (
        <div className="response-panel">
          <h3>CRUD</h3>
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
              {crudResults.length === 0 ? (
                <tr>
                  <td colSpan={4}>⏳ Preparing CRUD…</td>
                </tr>
              ) : (
                crudResults.map((r, i) => {
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
        </div>
      )}
    </div>
  );

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
