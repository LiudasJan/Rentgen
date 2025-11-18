import { Method } from 'axios';
import cn from 'classnames';
import { useEffect, useState } from 'react';
import Button, { ButtonType } from './components/buttons/Button';
import Input from './components/inputs/Input';
import Select, { SelectOption } from './components/inputs/Select';
import SimpleSelect from './components/inputs/SimpleSelect';
import Textarea from './components/inputs/Textarea';
import TextareaAutosize from './components/inputs/TextareaAutosize';
import TestRunningLoader from './components/loaders/TestRunningLoader';
import { LoadTestControls } from './components/LoadTestControls';
import Modal from './components/modals/Modal';
import ResponsePanel from './components/panels/ResponsePanel';
import TestsTable, { ExpandedTestComponent, getTestsTableColumns } from './components/tables/TestsTable';
import { RESPONSE_STATUS } from './constants/responseStatus';
import useTests from './hooks/useTests';
import { LOAD_TEST_NAME } from './tests';
import { FieldType, HttpResponse } from './types';
import {
  createHttpRequest,
  detectFieldType,
  extractBodyFieldMappings,
  extractCurl,
  extractQueryParameters,
  extractStatusCode,
  formatBody,
  loadProtoSchema,
  parseBody,
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

const parameterOptions: SelectOption<FieldType>[] = [
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
  const [openCurlModal, setOpenCurlModal] = useState<boolean>(false);
  const [curl, setCurl] = useState<string>('');
  const [curlError, setCurlError] = useState<string>('');
  const [url, setUrl] = useState<string>('');
  const [body, setBody] = useState<string>('{}');
  const [headers, setHeaders] = useState<string>('');
  const [wssConnected, setWssConnected] = useState<boolean>(false);
  const [protoFile, setProtoFile] = useState<File | null>(null);
  const [messageType, setMessageType] = useState<string>('');
  const [httpResponse, setHttpResponse] = useState<HttpResponse | null>(null);
  const [messages, setMessages] = useState<
    {
      direction: 'sent' | 'received' | 'system';
      data: string;
      decoded?: string | null;
    }[]
  >([]);
  const [bodyMappings, setBodyMappings] = useState<Record<string, FieldType>>({});
  const [queryMappings, setQueryMappings] = useState<Record<string, FieldType>>({});
  const [testsRun, setTestsRun] = useState<boolean>(false);
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
    testsCount,
    executeAllTests,
    executeLoadTest,
  } = useTests({ body, headers, method, bodyMappings, queryMappings, messageType, protoFile, url });

  const isRunningTests = isSecurityRunning || isPerformanceRunning || isDataDrivenRunning;
  const statusCode = extractStatusCode(httpResponse);
  const disabledRunTests =
    isRunningTests || !httpResponse || statusCode < RESPONSE_STATUS.OK || statusCode >= RESPONSE_STATUS.CLIENT_ERROR;

  useEffect(() => {
    if (!window.electronAPI?.onWssEvent) return;

    const messagesListener = (event: any) => {
      if (event.type === 'open') setWssConnected(true);
      if (event.type === 'close') setWssConnected(false);
      if (event.type === 'message') {
        setMessages((prevMessages) => [
          { direction: 'received', data: String(event.data), decoded: event.decoded ?? null },
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
          onChange={(option: SelectOption<Mode>) => {
            setMode(option.value);
            reset();
          }}
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
        <div className="flex-auto flex items-center">
          {mode === 'HTTP' && (
            <Select
              className="font-bold uppercase"
              classNames={{
                control: () => 'min-h-auto! border! border-border! rounded-none! rounded-l-md! shadow-none!',
                input: () => 'm-0! p-0! [&>:first-child]:uppercase',
              }}
              isCreatable={true}
              options={methodOptions}
              placeholder="METHOD"
              value={methodOptions.find((option) => option.value == method)}
              onChange={(option: SelectOption<Method>) => setMethod(option.value)}
            />
          )}
          <Input
            className={cn('flex-auto font-monospace', { 'border-l-0! rounded-l-none!': mode === 'HTTP' })}
            placeholder="Enter URL or paste text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
        {mode === 'HTTP' && (
          <Button disabled={!url || isRunningTests} onClick={sendHttp}>
            Send
          </Button>
        )}
        {mode === 'WSS' && (
          <>
            <Button disabled={wssConnected || !url} onClick={connectWss}>
              Connect
            </Button>
            <Button buttonType={ButtonType.SECONDARY} disabled={!wssConnected} onClick={sendWss}>
              Send
            </Button>
          </>
        )}
      </div>

      <TextareaAutosize
        className="font-monospace"
        maxRows={10}
        placeholder="Header-Key: value"
        value={headers}
        onChange={(e) => setHeaders(e.target.value)}
      />

      <div className="relative">
        <TextareaAutosize
          className="font-monospace"
          maxRows={15}
          placeholder={mode === 'HTTP' ? 'Enter request body (JSON or Form Data)' : 'Message body'}
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <Button
          className="absolute top-3 right-4 min-w-auto! py-0.5! px-2! rounded-sm"
          buttonType={ButtonType.SECONDARY}
          onClick={() => setBody((prevBody) => formatBody(prevBody, parseHeaders(headers)))}
        >
          Beautify
        </Button>
      </div>

      {mode === 'HTTP' && (
        <div>
          <label className="block mb-1 font-bold text-sm">Protobuf schema & message type</label>
          <div className="mb-3 text-xs text-gray-500/80">
            Experimental and optional section. If used, both fields must be completed
          </div>
          <div className="flex items-center">
            <Input
              accept=".proto"
              className="font-monospace rounded-r-none!"
              type="file"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                const fileExtension = file.name.split('.').pop().toLowerCase();
                if (fileExtension !== 'proto') return;

                try {
                  await loadProtoSchema(file);

                  setProtoFile(file);
                  setMessages((prevMessages) => [
                    { direction: 'system', data: '📂 Proto schema loaded' },
                    ...prevMessages,
                  ]);
                } catch (error) {
                  setMessages((prevMessages) => [
                    { direction: 'system', data: '❌ Failed to parse proto: ' + error },
                    ...prevMessages,
                  ]);
                }
              }}
            />

            <Input
              className="flex-auto font-monospace border-l-0! rounded-l-none!"
              placeholder="Message type (e.g. mypackage.MyMessage)"
              value={messageType}
              onChange={(e) => setMessageType(e.target.value)}
            />
          </div>
        </div>
      )}

      {mode === 'HTTP' && httpResponse && (
        <ResponsePanel title="Response">
          <div className="p-4 font-bold bg-body border-t border-border">{httpResponse.status}</div>
          {httpResponse.status !== 'Sending...' && (
            <div className="grid grid-cols-2 items-stretch max-h-[450px] p-4 border-t border-border overflow-y-auto">
              <div className="flex-1 pr-4">
                <h4 className="m-0">Headers</h4>
                <pre className="m-0! mt-4! whitespace-pre-wrap break-all">
                  {JSON.stringify(httpResponse.headers, null, 2)}
                </pre>
              </div>
              <div className="flex-1 pl-4 border-l border-border">
                <h4 className="m-0">Body</h4>
                <pre className="m-0! mt-4! whitespace-pre-wrap break-all">
                  {typeof httpResponse.body === 'string'
                    ? httpResponse.body
                    : JSON.stringify(httpResponse.body, null, 2)}
                </pre>
              </div>
            </div>
          )}
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
                <pre className="mt-0 ml-4 whitespace-pre-wrap break-all">{message.data}</pre>
                {message.decoded && (
                  <>
                    <div className="font-monospace font-bold text-sm">Decoded Protobuf:</div>
                    <pre className="whitespace-pre-wrap break-all">{message.decoded}</pre>
                  </>
                )}
              </div>
            ))}
          </div>
        </ResponsePanel>
      )}

      {(Object.keys(bodyMappings).length > 0 || Object.keys(queryMappings).length > 0) && (
        <div className="grid grid-cols-2 gap-4 items-stretch">
          {Object.keys(bodyMappings).length > 0 && (
            <ResponsePanel title="Body Parameters">
              {Object.entries(bodyMappings).map(([key, type]) => (
                <div key={key} className="pb-4 first-of-type:pt-4 px-4 flex items-center justify-between gap-4">
                  <span className="flex-1 font-monospace text-ellipsis text-nowrap overflow-hidden">{key}</span>
                  <SimpleSelect
                    className="rounded-none! p-1! outline-none"
                    options={parameterOptions}
                    value={type}
                    onChange={(e) =>
                      setBodyMappings((prevBodyMappings) => ({
                        ...prevBodyMappings,
                        [key]: e.target.value as FieldType,
                      }))
                    }
                  />
                </div>
              ))}
            </ResponsePanel>
          )}

          {Object.keys(queryMappings).length > 0 && (
            <ResponsePanel title="Query Parameters">
              {Object.entries(queryMappings).map(([key, type]) => (
                <div key={key} className="pb-4 first-of-type:pt-4 px-4 flex items-center justify-between gap-4">
                  <span className="flex-1 font-monospace text-ellipsis text-nowrap overflow-hidden">{key}</span>
                  <SimpleSelect
                    className="rounded-none! p-1! outline-none"
                    options={parameterOptions}
                    value={type}
                    onChange={(e) =>
                      setQueryMappings((prevQueryMappings) => ({
                        ...prevQueryMappings,
                        [key]: e.target.value as FieldType,
                      }))
                    }
                  />
                </div>
              ))}
            </ResponsePanel>
          )}
        </div>
      )}

      {mode === 'HTTP' && (
        <div>
          <Button disabled={disabledRunTests} onClick={disabledRunTests ? undefined : runAllTests}>
            {isRunningTests ? `Running tests... (${currentTest}/${testsCount})` : 'Generate & Run Tests'}
          </Button>
        </div>
      )}

      {testsRun && (
        <>
          <ResponsePanel title="Security & Headers Tests">
            <TestsTable
              columns={getTestsTableColumns(['Check', 'Expected', 'Actual', 'Result'])}
              expandableRows
              expandableRowsComponent={ExpandedTestComponent}
              expandableRowsComponentProps={{ headers: parseHeaders(headers), protoFile, messageType }}
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
                  cell: (row) => <div className="py-2">{row.expected}</div>,
                },
                {
                  name: 'Actual',
                  selector: (row) => row.actual,
                  cell: (row) => <div className="py-2">{row.actual}</div>,
                },
                {
                  name: 'Result',
                  selector: (row) => row.status,
                  width: '220px',
                  cell: (row) => {
                    if (row.name === LOAD_TEST_NAME)
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
              expandableRowsComponentProps={{ headers: parseHeaders(headers), protoFile, messageType }}
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
              expandableRowsComponentProps={{ headers: parseHeaders(headers), protoFile, messageType }}
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

  function reset() {
    setMethod('GET');
    setUrl('');
    setWssConnected(false);
    setHeaders('');
    setBody('{}');
    setProtoFile(null);
    setMessageType('');
    setHttpResponse(null);
    setMessages([]);
    setBodyMappings({});
    setQueryMappings({});
    setTestsRun(false);
  }

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
      setHeaders(
        Object.entries(headers)
          .map(([k, v]) => `${k}: ${v}`)
          .join('\n'),
      );

      if (decodedLines.length > 0) setBody(decodedLines.join('\n'));
      else {
        const trimmedBody = body ? String(body).trim() : '';
        setBody(trimmedBody !== '' ? trimmedBody : '{}');
      }

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
    setBodyMappings({});
    setQueryMappings({});

    try {
      const parsedHeaders = parseHeaders(headers);
      const parsedBody = parseBody(body, parsedHeaders, messageType, protoFile);
      const request = createHttpRequest(parsedBody, parsedHeaders, method, url);
      const response = await window.electronAPI.sendHttp(request);

      setHttpResponse(response);

      if (!response.status.startsWith('2') || !parsedBody) return;

      const bodyMappings = extractBodyFieldMappings(parsedBody, parsedHeaders);
      const queryMappings = Object.fromEntries(
        Object.entries(extractQueryParameters(url)).map(([key, value]) => [key, detectFieldType(value)]),
      );

      setBodyMappings(bodyMappings);
      setQueryMappings(queryMappings);
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
