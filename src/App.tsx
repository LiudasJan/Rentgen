import { Method } from 'axios';
import cn from 'classnames';
import { useEffect, useState } from 'react';
import Button, { ButtonType } from './components/buttons/Button';
import Input from './components/inputs/Input';
import Select, { SelectOption } from './components/inputs/Select';
import SimpleSelect from './components/inputs/SimpleSelect';
import Textarea from './components/inputs/Textarea';
import TestRunningLoader from './components/loaders/TestRunningLoader';
import { LoadTestControls } from './components/LoadTestControls';
import Modal from './components/modals/Modal';
import ResponsePanel from './components/panels/ResponsePanel';
import TestsTable, { ExpandedTestComponent, getTestsTableColumns } from './components/tables/TestsTable';
import useTests from './hooks/useTests';
import {
  convertFormEntriesToUrlEncoded,
  detectFieldType,
  encodeMessage,
  extractCurl,
  extractFieldsFromJson,
  extractQueryParams,
  formatRequestBody,
  getHeaderValue,
  loadProtoSchema,
  parseFormData,
  parseHeaders,
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
    isLoadTestRunning,
    isSecurityRunning,
    isPerformanceRunning,
    performanceTests,
    securityTests,
    testCount,
    executeAllTests,
    executeLoadTest,
  } = useTests(method, url, parseHeaders(headers), body, fieldMappings, queryMappings, messageType, protoFile);

  const isRunningTests = isSecurityRunning || isPerformanceRunning || isDataDrivenRunning;
  const disabledRunTests = isRunningTests || !httpResponse || !httpResponse.status.includes('200');

  useEffect(() => {
    if (!window.electronAPI?.onWssEvent) return;

    const messagesListener = (event: any) => {
      if (event.type === 'open') setWssConnected(true);
      if (event.type === 'close') setWssConnected(false);
      if (event.type === 'message') {
        setMessages((prevMessages) => [
          {
            direction: 'received',
            data: String(event.data),
            decoded: event.decoded ?? null,
          },
          ...prevMessages,
        ]);
      }

      if (event.type === 'error') setMessages((prev) => [{ direction: 'system', data: '❌ ' + event.error }, ...prev]);
    };

    const ipcRenderer = window.electronAPI.onWssEvent(messagesListener);

    return () => {
      ipcRenderer?.off('wss-event', messagesListener);
    };
  }, []);

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
          className="absolute top-3 right-4 min-w-auto! py-0.5! px-2! rounded-sm"
          buttonType={ButtonType.SECONDARY}
          onClick={() => setBody((prevBody) => formatRequestBody(prevBody, parseHeaders(headers)))}
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
          <div className="p-4 font-bold bg-body border-y border-border">{httpResponse.status}</div>
          <div className="max-h-[400px] p-4 overflow-y-auto">
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
          <div className="max-h-[400px] p-4 border-t border-border overflow-y-auto">
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
                <div key={field} className="pb-4 first-of-type:pt-4 px-4 flex items-center justify-between gap-4">
                  <span className="flex-1 font-monospace text-ellipsis text-nowrap overflow-hidden">{field}</span>
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
                <div key={param} className="pb-4 first-of-type:pt-4 px-4 flex items-center justify-between gap-4">
                  <span className="flex-1 font-monospace text-ellipsis text-nowrap overflow-hidden">{param}</span>
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
        <Button disabled={disabledRunTests} onClick={disabledRunTests ? undefined : runAllTests}>
          {isRunningTests ? `Running tests... (${currentTest}/${testCount})` : 'Generate & Run Tests'}
        </Button>
      </div>

      {testsRun && (
        <>
          <ResponsePanel title="Security & Headers Tests">
            <TestsTable
              columns={getTestsTableColumns(['Check', 'Expected', 'Actual', 'Result'])}
              expandableRows
              expandableRowsComponent={ExpandedTestComponent}
              expandOnRowClicked
              data={securityTests}
              progressComponent={<TestRunningLoader text="Running security tests..." />}
              progressPending={isSecurityRunning}
            />
          </ResponsePanel>

          <ResponsePanel title="Performance Insights">
            <TestsTable
              columns={[
                {
                  name: 'Check',
                  selector: (row) => row.name,
                },
                {
                  name: 'Expected',
                  selector: (row) => row.expected,
                },
                {
                  name: 'Actual',
                  selector: (row) => row.actual,
                },
                {
                  name: 'Result',
                  selector: (row) => row.status,
                  width: '220px',
                  cell: (row) => {
                    if (row.name === 'Load test')
                      return <LoadTestControls isRunning={isLoadTestRunning} executeTest={executeLoadTest} />;

                    return row.status;
                  },
                },
              ]}
              data={performanceTests}
              progressComponent={<TestRunningLoader text="Running performance insights..." />}
              progressPending={isPerformanceRunning}
            />
          </ResponsePanel>

          <ResponsePanel title="Data Handling & Input Validation">
            <TestsTable
              columns={getTestsTableColumns(['Field', 'Value', 'Expected', 'Actual', 'Result'])}
              expandableRows
              expandableRowsComponent={ExpandedTestComponent}
              expandOnRowClicked
              data={dataDrivenTests}
              progressComponent={<TestRunningLoader text="Running data-driven tests..." />}
              progressPending={isDataDrivenRunning}
            />
          </ResponsePanel>

          <ResponsePanel title="CRUD">
            <TestsTable
              columns={getTestsTableColumns(['Method', 'Expected', 'Actual', 'Result'])}
              expandableRows
              expandableRowsComponent={ExpandedTestComponent}
              expandOnRowClicked
              data={crudTests}
              progressComponent={<TestRunningLoader text="Preparing CRUD…" />}
              progressPending={crudTests.length === 0}
            />
          </ResponsePanel>
        </>
      )}
    </div>
  );

  async function runAllTests() {
    setTestsRun(true);

    await executeAllTests();
  }

  function importCurl() {
    try {
      if (curl.length > 200_000) throw new Error('cURL too large');

      const { body, decodedLines, headers, method, url } = extractCurl(curl);

      setUrl(url);
      setMethod(method as Method);

      if (decodedLines.length > 0) {
        setBody(decodedLines.join('\n'));

        const formMappings: Record<string, string> = {};
        decodedLines.forEach((decodedLine) => {
          const [key] = decodedLine.split('=');
          if (key) formMappings[`form.${key.trim()}`] = 'string';
        });

        setFieldMappings(formMappings);
      } else {
        const trimmedBody = body ? String(body).trim() : '';
        setBody(trimmedBody !== '' ? trimmedBody : '{}');
      }

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
      const parsedHeaders = parseHeaders(headers);
      const contentType = getHeaderValue(parsedHeaders, 'content-type');
      const isForm = /application\/x-www-form-urlencoded/i.test(contentType);

      let data: string | Uint8Array | undefined = body;
      if (protoFile && messageType) data = encodeMessage(messageType, JSON.parse(body));
      else if (isForm) data = convertFormEntriesToUrlEncoded(parseFormData(String(body)));

      // Ensure proper Content-Type header for form data
      if (isForm && !getHeaderValue(parsedHeaders, 'content-type'))
        parsedHeaders['Content-Type'] = 'application/x-www-form-urlencoded';

      const response = await window.electronAPI.sendHttp({
        url,
        method,
        headers: parsedHeaders,
        body: data,
      });

      setHttpResponse(response);

      // Generate test mappings based on request body (not response)
      let parsedBody;
      try {
        parsedBody = JSON.parse(body);
      } catch {
        return;
      }

      if (response.status.startsWith('2')) {
        if (parsedBody) {
          // Extract all fields from request body (including nested)
          const extractedFields = extractFieldsFromJson(parsedBody);
          const bodyMappings: Record<string, string> = {};

          for (const [fieldPath, fieldType] of Object.entries(extractedFields)) {
            if (fieldType === 'DO_NOT_TEST') bodyMappings[fieldPath] = 'do-not-test';
            else {
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
        }

        if (isForm) {
          const formEntries = parseFormData(String(body));
          const formMappings: Record<string, string> = {};

          for (const [key, value] of formEntries) formMappings[`form.${key}`] = detectFieldType(value);

          setFieldMappings((prevFieldMappings) => ({
            ...(prevFieldMappings || {}),
            ...formMappings,
          }));
        }

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
