import { Method } from 'axios';
import cn from 'classnames';
import { useEffect, useState } from 'react';
import Button, { ButtonType } from './components/buttons/Button';
import { CopyButton } from './components/buttons/CopyButton';
import { IconButton } from './components/buttons/IconButton';
import { LargePayloadTestControls } from './components/controls/LargePayloadTestControls';
import { LoadTestControls } from './components/controls/LoadTestControls';
import Input from './components/inputs/Input';
import Select, { SelectOption } from './components/inputs/Select';
import Textarea from './components/inputs/Textarea';
import TextareaAutosize from './components/inputs/TextareaAutosize';
import { JsonViewer } from './components/JsonViewer';
import Loader from './components/loaders/Loader';
import TestRunningLoader from './components/loaders/TestRunningLoader';
import Modal from './components/modals/Modal';
import ParametersPanel from './components/panels/ParametersPanel';
import ResponsePanel from './components/panels/ResponsePanel';
import TestsTable, { ExpandedTestComponent, getTestsTableColumns } from './components/tables/TestsTable';
import { RESPONSE_STATUS } from './constants/responseStatus';
import useTests from './hooks/useTests';
import { LARGE_PAYLOAD_TEST_NAME, LOAD_TEST_NAME } from './tests';
import { FieldType, HttpResponse, TestOptions } from './types';
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

import DarkModeIcon from './assets/icons/dark-mode-icon.svg';
import LightModeIcon from './assets/icons/light-mode-icon.svg';
import ReloadIcon from './assets/icons/reload-icon.svg';

type Mode = 'HTTP' | 'WSS';

const SENDING = 'Sending...';
const NETWORK_ERROR = 'Network Error';

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
  const [testOptions, setTestOptions] = useState<TestOptions | null>(null);
  const {
    crudTests,
    currentTest,
    dataDrivenTests,
    isDataDrivenRunning,
    isLargePayloadTestRunning,
    isLoadTestRunning,
    isSecurityRunning,
    isPerformanceRunning,
    performanceTests,
    securityTests,
    testsCount,
    executeAllTests,
    executeLoadTest,
    executeLargePayloadTest,
  } = useTests(testOptions);

  const isRunningTests = isSecurityRunning || isPerformanceRunning || isDataDrivenRunning;
  const statusCode = extractStatusCode(httpResponse);
  const disabledRunTests =
    isRunningTests || !httpResponse || statusCode < RESPONSE_STATUS.OK || statusCode >= RESPONSE_STATUS.BAD_REQUEST;

  useEffect(() => {
    const setTheme = async () => {
      const theme = await window.themeAPI.getTheme();
      if (theme === 'dark') document.documentElement.classList.add('dark');
    };

    setTheme();
  }, []);

  useEffect(() => {
    if (!window.electronAPI.onWssEvent) return;

    const messagesListener = (event: any) => {
      if (event.type === 'open') {
        setMessages([{ direction: 'system', data: `🟢 Connected to ${event.data}` }]);
        setWssConnected(true);
      } else if (event.type === 'close') {
        setMessages((prevMessages) => [
          { direction: 'system', data: `🔵 Disconnected from ${event.data}` },
          ...prevMessages,
        ]);
        setWssConnected(false);
      } else if (event.type === 'message') {
        setMessages((prevMessages) => [
          { direction: 'received', data: String(event.data), decoded: event.decoded ?? null },
          ...prevMessages,
        ]);
      } else if (event.type === 'error')
        setMessages((prevMessages) => [{ direction: 'system', data: `🔴 ${event.error}` }, ...prevMessages]);
    };

    const ipcRenderer = window.electronAPI.onWssEvent(messagesListener);

    return () => {
      ipcRenderer?.off('wss-event', messagesListener);
    };
  }, []);

  useEffect(() => {
    if (testOptions) executeAllTests();
  }, [testOptions]);

  return (
    <div className="flex flex-col gap-4 py-5 px-7">
      <div className="flex items-center gap-2">
        <Select
          className="font-bold"
          isDisabled={isRunningTests}
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
        <div className="flex-auto flex items-center justify-end gap-2">
          <IconButton
            onClick={async () => {
              const theme = await window.themeAPI.getTheme();
              if (theme === 'dark') {
                document.documentElement.classList.remove('dark');
                window.themeAPI.setTheme('light');
              } else {
                document.documentElement.classList.add('dark');
                window.themeAPI.setTheme('dark');
              }
            }}
          >
            <DarkModeIcon className="h-5 w-5 dark:hidden" />
            <LightModeIcon className="hidden dark:block h-6 w-6" />
          </IconButton>
          <IconButton onClick={() => setOpenReloadModal(true)}>
            <ReloadIcon className="h-5 w-5" />
          </IconButton>
          <Modal className="[&>div]:w-[400px]!" isOpen={openReloadModal} onClose={closeReloadModal}>
            <div className="flex flex-col gap-4">
              <h4 className="m-0">Reload</h4>
              <p className="m-0 text-sm dark:text-text-secondary">All current data will be lost</p>
              <div className="flex items-center justify-end gap-4">
                <Button buttonType={ButtonType.DANGER} onClick={() => window.location.reload()}>
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
                control: () =>
                  cn(
                    'min-h-auto! bg-white! border! border-border! rounded-none! rounded-l-md! shadow-none!',
                    'dark:bg-dark-input! dark:border-dark-input! dark:border-r-dark-body!',
                  ),
                input: () => 'm-0! p-0! [&>:first-child]:uppercase text-text! dark:text-dark-text!',
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
            <Button
              buttonType={wssConnected ? ButtonType.SECONDARY : ButtonType.PRIMARY}
              disabled={!wssConnected && !url}
              onClick={wssConnected ? window.electronAPI.disconnectWss : connectWss}
            >
              {wssConnected ? 'Disconnect' : 'Connect'}
            </Button>
            <Button disabled={!wssConnected} onClick={sendWss}>
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
          <div className="mb-3 text-xs text-text-secondary">
            Experimental and optional section. If used, both fields must be completed
          </div>
          <div className="flex items-center">
            <Input
              accept=".proto"
              className="font-monospace rounded-r-none! dark:border-r-dark-body!"
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
                    { direction: 'system', data: '🟢 Proto schema loaded' },
                    ...prevMessages,
                  ]);
                } catch (error) {
                  setMessages((prevMessages) => [
                    { direction: 'system', data: '🔴 Failed to parse proto: ' + error },
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
          <div
            className={cn(
              'flex items-center gap-2 p-4 font-bold bg-body dark:bg-dark-body border-t border-border dark:border-dark-body',
              {
                'text-green-500': httpResponse.status.startsWith('2'),
                'text-blue-500': httpResponse.status.startsWith('3'),
                'text-orange-500': httpResponse.status.startsWith('4'),
                'text-red-500': httpResponse.status.startsWith('5') || httpResponse.status === NETWORK_ERROR,
              },
            )}
          >
            {httpResponse.status === SENDING && <Loader className="h-5! w-5!" />}
            {httpResponse.status}
          </div>
          {httpResponse.status !== SENDING && (
            <div className="grid grid-cols-2 items-stretch max-h-[450px] py-4 border-t border-border dark:border-dark-body overflow-y-auto">
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
              <div className="relative flex-1 px-4 border-l border-border dark:border-dark-body">
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

      {messages.length > 0 && (
        <ResponsePanel title="Messages">
          <div className="max-h-[400px] p-4 text-xs border-t border-border dark:border-dark-body overflow-y-auto">
            {messages.map(({ data, decoded, direction }, index) => (
              <div
                key={index}
                className="not-first:pt-3 not-last:pb-3 border-b last:border-none border-border dark:border-dark-body"
              >
                <div className="flex items-center gap-4">
                  {direction !== 'system' && (
                    <span
                      className={cn('w-5 h-5 font-bold rounded-xs text-center leading-normal rotate-90', {
                        'text-method-post bg-method-post/10': direction === 'sent',
                        'text-method-put bg-method-put/10': direction === 'received',
                      })}
                    >
                      {direction === 'sent' ? '⬅' : direction === 'received' ? '➡' : ''}
                    </span>
                  )}
                  <div>
                    <pre className="my-0 whitespace-pre-wrap break-all">{data}</pre>
                    {decoded && (
                      <>
                        <div className="mt-2 font-monospace font-bold">Decoded Protobuf:</div>
                        <pre className="my-0 whitespace-pre-wrap break-all">dfd</pre>
                      </>
                    )}
                  </div>
                </div>
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
          <Button
            disabled={disabledRunTests}
            onClick={() =>
              setTestOptions({ body, headers, method, bodyMappings, queryMappings, messageType, protoFile, url })
            }
          >
            {isRunningTests ? `Running tests... (${currentTest}/${testsCount})` : 'Generate & Run Tests'}
          </Button>
        </div>
      )}

      {testOptions && (
        <>
          <ResponsePanel title="Security Tests">
            <TestsTable
              columns={[
                ...getTestsTableColumns(['Check', 'Expected', 'Actual']),
                {
                  name: 'Result',
                  selector: (row) => row.status,
                  width: '150px',
                  cell: (row) => {
                    if (row.name === LARGE_PAYLOAD_TEST_NAME)
                      return (
                        <LargePayloadTestControls
                          isRunning={isLargePayloadTestRunning}
                          executeTest={(size: number) =>
                            executeLargePayloadTest({ ...testOptions, bodyMappings, queryMappings }, size)
                          }
                        />
                      );

                    return row.status;
                  },
                },
              ]}
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
                ...getTestsTableColumns(['Check', 'Expected']),
                {
                  name: 'Actual',
                  selector: (row) => row.actual,
                  cell: (row) => <div className="py-1">{row.actual}</div>,
                },
                {
                  name: 'Result',
                  selector: (row) => row.status,
                  width: '220px',
                  cell: (row) => {
                    if (row.name === LOAD_TEST_NAME)
                      return (
                        <LoadTestControls
                          isRunning={isLoadTestRunning}
                          executeTest={(threadCount: number, requestCount: number) =>
                            executeLoadTest({ ...testOptions, bodyMappings, queryMappings }, threadCount, requestCount)
                          }
                        />
                      );

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
              fixedHeader={true}
              fixedHeaderScrollHeight="720px"
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
    setTestOptions(null);
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
      status: SENDING,
      body: '',
      headers: {},
    });
    setBodyMappings({});
    setQueryMappings({});

    try {
      const parsedHeaders = parseHeaders(headers);
      const parsedBody = parseBody(body, parsedHeaders, messageType, protoFile);
      const request = createHttpRequest(parsedBody, parsedHeaders, method, url);
      const response: HttpResponse = await window.electronAPI.sendHttp(request);

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
        status: NETWORK_ERROR,
        body: String(error),
        headers: {},
      });
    }
  }

  function connectWss() {
    if (!url.startsWith('ws')) {
      setMessages((prevMessages) => [
        { direction: 'system', data: '🔴 Please use ws:// or wss:// URL' },
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
