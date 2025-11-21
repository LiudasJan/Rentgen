import { Method } from 'axios';
import cn from 'classnames';
import { useEffect, useState } from 'react';
import Button, { ButtonType } from './components/buttons/Button';
import { CopyButton } from './components/buttons/CopyButton';
import Input from './components/inputs/Input';
import Select, { SelectOption } from './components/inputs/Select';
import Textarea from './components/inputs/Textarea';
import TextareaAutosize from './components/inputs/TextareaAutosize';
import { JsonViewer } from './components/JsonViewer';
import TestRunningLoader from './components/loaders/TestRunningLoader';
import { LoadTestControls } from './components/LoadTestControls';
import Modal from './components/modals/Modal';
import ParametersPanel from './components/panels/ParametersPanel';
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
  extractBodyFromResponse,
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

export default function App() {
  const [mode, setMode] = useState<Mode>('HTTP');
  const [method, setMethod] = useState<Method>('GET');
  const [openCurlModal, setOpenCurlModal] = useState<boolean>(false);
  const [openReloadModal, setOpenReloadModal] = useState<boolean>(false);
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
    isRunningTests || !httpResponse || statusCode < RESPONSE_STATUS.OK || statusCode >= RESPONSE_STATUS.BAD_REQUEST;

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
            <Modal isOpen={openCurlModal} onClose={closeCurlModal}>
              <div className="flex flex-col gap-4">
                <h4 className="m-0">Import cURL</h4>
                <Textarea
                  autoFocus={true}
                  className="min-h-40 font-monospace"
                  placeholder="Enter cURL or paste text"
                  value={curl}
                  onChange={(e) => setCurl(e.target.value)}
                />
                {curlError && <p className="m-0 text-xs text-red-600">{curlError}</p>}
                <div className="flex items-center justify-end gap-4">
                  <Button onClick={importCurl}>Import</Button>
                  <Button buttonType={ButtonType.SECONDARY} onClick={closeCurlModal}>
                    Cancel
                  </Button>
                </div>
              </div>
            </Modal>
          </>
        )}
        <div className="flex-auto flex items-center justify-end">
          <Button className="min-w-auto!" buttonType={ButtonType.SECONDARY} onClick={() => setOpenReloadModal(true)}>
            <span className="flex items-center gap-1">
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.502 16.6663V13.3333C3.502 12.9661 3.79977 12.6683 4.16704 12.6683H7.50004L7.63383 12.682C7.93691 12.7439 8.16508 13.0119 8.16508 13.3333C8.16508 13.6547 7.93691 13.9227 7.63383 13.9847L7.50004 13.9984H5.47465C6.58682 15.2249 8.21842 16.0013 10 16.0013C13.06 16.0012 15.5859 13.711 15.9551 10.7513L15.9854 10.6195C16.0845 10.3266 16.3785 10.1334 16.6973 10.1732C17.0617 10.2186 17.3198 10.551 17.2745 10.9154L17.2247 11.2523C16.6301 14.7051 13.6224 17.3313 10 17.3314C8.01103 17.3314 6.17188 16.5383 4.83208 15.2474V16.6663C4.83208 17.0335 4.53411 17.3311 4.16704 17.3314C3.79977 17.3314 3.502 17.0336 3.502 16.6663ZM4.04497 9.24935C3.99936 9.61353 3.66701 9.87178 3.30278 9.8265C2.93833 9.78105 2.67921 9.44876 2.72465 9.08431L4.04497 9.24935ZM10 2.66829C11.9939 2.66833 13.8372 3.46551 15.1778 4.76204V3.33333C15.1778 2.96616 15.4757 2.66844 15.8428 2.66829C16.2101 2.66829 16.5079 2.96606 16.5079 3.33333V6.66634C16.5079 7.03361 16.2101 7.33138 15.8428 7.33138H12.5098C12.1425 7.33138 11.8448 7.03361 11.8448 6.66634C11.8449 6.29922 12.1426 6.0013 12.5098 6.0013H14.5254C13.4133 4.77488 11.7816 3.99841 10 3.99837C6.93998 3.99837 4.41406 6.28947 4.04497 9.24935L3.38481 9.16634L2.72465 9.08431C3.17574 5.46702 6.26076 2.66829 10 2.66829Z"></path>
              </svg>
              Reload
            </span>
          </Button>
          <Modal className="[&>div]:w-[400px]!" isOpen={openReloadModal} onClose={closeReloadModal}>
            <div className="flex flex-col gap-4">
              <h4 className="m-0">Reload</h4>
              <p className="m-0 text-sm">All current data will be lost</p>
              <div className="flex items-center justify-end gap-4">
                <Button
                  buttonType={ButtonType.DANGER}
                  onClick={() => {
                    setMode('HTTP');
                    reset();
                    closeReloadModal();
                  }}
                >
                  Reload
                </Button>
                <Button buttonType={ButtonType.SECONDARY} onClick={closeReloadModal}>
                  Cancel
                </Button>
              </div>
            </div>
          </Modal>
        </div>
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
          <label className="block mb-1 font-bold text-sm">Protobuf Schema & Message Type</label>
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
            <div className="grid grid-cols-2 items-stretch max-h-[450px] py-4 border-t border-border overflow-y-auto">
              <div className="relative flex-1 px-4">
                <h4 className="m-0 mb-4">Headers</h4>
                {httpResponse.headers && (
                  <CopyButton
                    className="absolute top-0 right-4"
                    textToCopy={JSON.stringify(httpResponse.headers, null, 2)}
                  >
                    Copy
                  </CopyButton>
                )}
                <JsonViewer source={httpResponse.headers} />
              </div>
              <div className="relative flex-1 px-4 border-l border-border">
                <h4 className="m-0 mb-4">Body</h4>
                {httpResponse.body && (
                  <CopyButton
                    className="absolute top-0 right-4"
                    textToCopy={
                      typeof httpResponse.body === 'string'
                        ? httpResponse.body
                        : JSON.stringify(httpResponse.body, null, 2)
                    }
                  >
                    Copy
                  </CopyButton>
                )}
                <JsonViewer source={extractBodyFromResponse(httpResponse)} />
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
            <ParametersPanel
              title="Body Parameters"
              mappings={bodyMappings}
              onFieldTypeChange={(key, value) =>
                setBodyMappings((prevBodyMappings) => ({
                  ...prevBodyMappings,
                  [key]: value,
                }))
              }
              onRemoveClick={(key) =>
                setBodyMappings((prevBodyMappings) => ({
                  ...prevBodyMappings,
                  [key]: 'do-not-test',
                }))
              }
            />
          )}

          {Object.keys(queryMappings).length > 0 && (
            <ParametersPanel
              title="Query Parameters"
              mappings={queryMappings}
              onFieldTypeChange={(key, value) =>
                setQueryMappings((prevQueryMappings) => ({
                  ...prevQueryMappings,
                  [key]: value,
                }))
              }
              onRemoveClick={(key) =>
                setQueryMappings((prevQueryMappings) => ({
                  ...prevQueryMappings,
                  [key]: 'do-not-test',
                }))
              }
            />
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
          <ResponsePanel title="Security Tests">
            <TestsTable
              columns={getTestsTableColumns(['Check', 'Expected', 'Actual', 'Result'])}
              expandableRows
              expandableRowsComponent={ExpandedTestComponent}
              expandableRowsComponentProps={{ headers: parseHeaders(headers), protoFile, messageType }}
              expandOnRowClicked
              data={securityTests}
              progressComponent={<TestRunningLoader text="Running Security Tests..." />}
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
              progressComponent={<TestRunningLoader text="Running Performance Insights..." />}
              progressPending={isPerformanceRunning}
            />
          </ResponsePanel>

          <ResponsePanel title="Data-Driven Tests">
            <TestsTable
              columns={getTestsTableColumns(['Field', 'Value', 'Expected', 'Actual', 'Result'])}
              expandableRows
              expandableRowsComponent={ExpandedTestComponent}
              expandableRowsComponentProps={{ headers: parseHeaders(headers), protoFile, messageType }}
              expandOnRowClicked
              data={dataDrivenTests}
              progressComponent={<TestRunningLoader text="Running Data-Driven Tests..." />}
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

      closeCurlModal();
    } catch (error) {
      console.error('cURL import failed', error);
      setCurlError('The cURL command you provided appears to be invalid. Please check it and try again');
    }
  }

  function closeCurlModal() {
    setOpenCurlModal(false);
    setCurl('');
    setCurlError('');
  }

  function closeReloadModal() {
    setOpenReloadModal(false);
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

      if (!response.status.startsWith('2')) return;

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
