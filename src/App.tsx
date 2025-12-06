import { Method } from 'axios';
import cn from 'classnames';
import { useEffect, useMemo, useState } from 'react';
import Button, { ButtonSize, ButtonType } from './components/buttons/Button';
import { CopyButton } from './components/buttons/CopyButton';
import { IconButton } from './components/buttons/IconButton';
import { LargePayloadTestControls } from './components/controls/LargePayloadTestControls';
import { LoadTestControls } from './components/controls/LoadTestControls';
import FileInput from './components/inputs/FileInput';
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
import Sidebar from './components/sidebar/Sidebar';
import TestsTable, { ExpandedTestComponent, getTestsTableColumns } from './components/tables/TestsTable';
import { RESPONSE_STATUS } from './constants/responseStatus';
import useTests from './hooks/useTests';
import { LARGE_PAYLOAD_TEST_NAME, LOAD_TEST_NAME } from './tests';
import { HttpResponse, RequestParameters, TestOptions, TestResult, TestStatus } from './types';
import { PostmanCollection } from './types/postman';
import {
  createHttpRequest,
  detectDataType,
  extractBodyFromResponse,
  extractBodyParameters,
  extractCurl,
  extractQueryParameters,
  extractStatusCode,
  formatBody,
  getInitialParameterValue,
  loadProtoSchema,
  parseBody,
  parseHeaders,
} from './utils';
import {
  addFolderToCollection,
  addRequestToCollection,
  collectionToGroupedSidebarData,
  createEmptyCollection,
  findFolderIdByRequestId,
  findRequestById,
  headersRecordToString,
  moveRequestToFolder,
  postmanHeadersToRecord,
  removeRequestFromCollection,
  removeFolderFromCollection,
  renameFolderInCollection,
  reorderFolderInCollection,
  reorderRequestInCollection,
  updateRequestInCollection,
} from './utils/collection';

import DarkModeIcon from './assets/icons/dark-mode-icon.svg';
import LightModeIcon from './assets/icons/light-mode-icon.svg';
import ReloadIcon from './assets/icons/reload-icon.svg';
import { TestResultControls } from './components/controls/TestResultControls';

type Mode = 'HTTP' | 'WSS';
type ReportFormat = 'json' | 'md' | 'csv';

let savedTimeout: NodeJS.Timeout;
let exportedTimeout: NodeJS.Timeout;

const SENDING = 'Sending...';
const NETWORK_ERROR = 'Network Error';

const modeOptions: SelectOption<Mode>[] = [
  { value: 'HTTP', label: 'HTTP' },
  { value: 'WSS', label: 'WSS' },
];

const exportFormatOptions: SelectOption<ReportFormat>[] = [
  { value: 'json', label: 'JSON (.json)' },
  { value: 'md', label: 'Markdown (.md)' },
  { value: 'csv', label: 'CSV (.csv)' },
];

const methodOptions: SelectOption<Method>[] = [
  { value: 'GET', label: 'GET', className: 'text-method-get! dark:text-dark-method-get!' },
  { value: 'POST', label: 'POST', className: 'text-method-post! dark:text-dark-method-post!' },
  { value: 'PUT', label: 'PUT', className: 'text-method-put! dark:text-dark-method-put!' },
  { value: 'PATCH', label: 'PATCH', className: 'text-method-patch! dark:text-dark-method-patch!' },
  { value: 'DELETE', label: 'DELETE', className: 'text-method-delete! dark:text-dark-method-delete!' },
  { value: 'HEAD', label: 'HEAD', className: 'text-method-head! dark:text-dark-method-head!' },
  { value: 'OPTIONS', label: 'OPTIONS', className: 'text-method-options! dark:text-dark-method-options!' },
];

export default function App() {
  const [collection, setCollection] = useState<PostmanCollection>(createEmptyCollection());
  const [mode, setMode] = useState<Mode>('HTTP');
  const [method, setMethod] = useState<Method>('GET');
  const [openCurlModal, setOpenCurlModal] = useState<boolean>(false);
  const [openReloadModal, setOpenReloadModal] = useState<boolean>(false);
  const [deleteFolderModal, setDeleteFolderModal] = useState<{ isOpen: boolean; folderId: string | null }>({
    isOpen: false,
    folderId: null,
  });
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
  const [bodyParameters, setBodyParameters] = useState<RequestParameters>({});
  const [queryParameters, setQueryParameters] = useState<RequestParameters>({});
  const [testOptions, setTestOptions] = useState<TestOptions | null>(null);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('default');
  const [saved, setSaved] = useState<boolean>(false);
  const [exported, setExported] = useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState<ReportFormat>('json');
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
  const statusCode = useMemo(() => extractStatusCode(httpResponse), [httpResponse]);
  const sidebarFolders = useMemo(() => collectionToGroupedSidebarData(collection), [collection]);

  const isRunningTests = isSecurityRunning || isPerformanceRunning || isDataDrivenRunning;
  const disabledRunTests =
    isRunningTests || !httpResponse || statusCode < RESPONSE_STATUS.OK || statusCode >= RESPONSE_STATUS.BAD_REQUEST;

  useEffect(() => {
    const loadCollection = async () => setCollection(await window.electronAPI.loadCollection());

    loadCollection();
  }, []);

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
    <div className="flex">
      <Sidebar
        folders={sidebarFolders}
        selectedId={selectedRequestId}
        selectedFolderId={selectedFolderId}
        onRemoveItem={onRemoveSidebarItem}
        onReorderItem={onReorderSidebarItem}
        onMoveItem={handleMoveItem}
        onSelectItem={onSelectSidebarItem}
        onSelectFolder={handleSelectFolder}
        onAddFolder={handleAddFolder}
        onRenameFolder={handleRenameFolder}
        onRemoveFolder={handleRemoveFolder}
        onReorderFolder={handleReorderFolder}
      />
      <div className="flex-1 min-w-0 flex flex-col gap-4 py-5 px-7 overflow-y-auto">
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
                    className="min-h-40"
                    placeholder="Enter cURL or paste text"
                    value={curl}
                    onChange={(event) => setCurl(event.target.value)}
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
                <p className="m-0 text-sm dark:text-text-secondary">Only current tests results will be lost</p>
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
            <Modal className="[&>div]:w-[400px]!" isOpen={deleteFolderModal.isOpen} onClose={closeDeleteFolderModal}>
              <div className="flex flex-col gap-4">
                <h4 className="m-0">Delete Folder</h4>
                <p className="m-0 text-sm dark:text-text-secondary">
                  This folder contains requests. Are you sure you want to delete it?
                </p>
                <div className="flex items-center justify-end gap-4">
                  <Button buttonType={ButtonType.DANGER} onClick={confirmDeleteFolder}>
                    Delete
                  </Button>
                  <Button buttonType={ButtonType.SECONDARY} onClick={closeDeleteFolderModal}>
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
                      'min-h-auto! bg-white! border! border-border! rounded-none! rounded-l-md! transition-none! shadow-none!',
                      'dark:bg-dark-input! dark:border-dark-input! dark:border-r-dark-body!',
                    ),
                  input: () => 'm-0! p-0! [&>:first-child]:uppercase text-text! dark:text-dark-text!',
                }}
                isCreatable={true}
                options={methodOptions}
                placeholder="METHOD"
                value={methodOptions.find((option) => option.value == method) || { value: method, label: method }}
                onChange={(option: SelectOption<Method>) => setMethod(option.value)}
              />
            )}
            <Input
              className={cn('flex-auto', { 'border-l-0 rounded-l-none': mode === 'HTTP' })}
              placeholder="Enter URL or paste text"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
            />
          </div>
          {mode === 'HTTP' && (
            <>
              <Button disabled={!url || isRunningTests} onClick={sendHttp}>
                Send
              </Button>
              <Button buttonType={ButtonType.SECONDARY} disabled={!url || isRunningTests} onClick={saveRequest}>
                {saved ? 'Saved ✅' : 'Save'}
              </Button>
            </>
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
          maxRows={10}
          placeholder="Header-Key: value"
          value={headers}
          onChange={(event) => setHeaders(event.target.value)}
        />

        <div className="relative">
          <TextareaAutosize
            maxRows={15}
            placeholder={mode === 'HTTP' ? 'Enter request body (JSON or Form Data)' : 'Message body'}
            value={body}
            onChange={(event) => setBody(event.target.value)}
          />
          <Button
            className="absolute top-3 right-4"
            buttonType={ButtonType.SECONDARY}
            buttonSize={ButtonSize.SMALL}
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
            <div className="flex items-center gap-2">
              <FileInput
                accept=".proto"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;

                  const fileExtension = file.name.split('.').pop()?.toLowerCase();
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
                className="flex-auto"
                placeholder="Message type (e.g. mypackage.MyMessage)"
                value={messageType}
                onChange={(event) => setMessageType(event.target.value)}
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
              {httpResponse.status === SENDING && <Loader className="h-5 w-5" />}
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

        {(Object.keys(bodyParameters).length > 0 || Object.keys(queryParameters).length > 0) && (
          <div className="grid lg:grid-cols-2 gap-4 items-stretch">
            {Object.keys(bodyParameters).length > 0 && (
              <ParametersPanel
                title="Body Parameters"
                parameters={bodyParameters}
                onChange={(parameters) =>
                  setBodyParameters((prevBodyParameters) => ({
                    ...prevBodyParameters,
                    ...parameters,
                  }))
                }
              />
            )}

            {Object.keys(queryParameters).length > 0 && (
              <ParametersPanel
                title="Query Parameters"
                parameters={queryParameters}
                onChange={(parameters) =>
                  setQueryParameters((prevQueryParameters) => ({
                    ...prevQueryParameters,
                    ...parameters,
                  }))
                }
              />
            )}
          </div>
        )}

        {mode === 'HTTP' && (
          <div className="flex justify-between">
            <Button
              disabled={disabledRunTests}
              onClick={() => {
                setTestOptions({
                  body,
                  bodyParameters,
                  headers,
                  method,
                  messageType,
                  protoFile,
                  queryParameters,
                  url,
                });
              }}
            >
              {isRunningTests ? `Running tests... (${currentTest}/${testsCount})` : 'Generate & Run Tests'}
            </Button>

            {testOptions && (
              <div className="flex items-center justify-end gap-2">
                <Select
                  isSearchable={false}
                  options={exportFormatOptions}
                  placeholder="Format"
                  value={exportFormatOptions.find((option) => option.value === exportFormat)}
                  onChange={(option: SelectOption<ReportFormat>) => setExportFormat(option.value)}
                />
                <Button
                  buttonType={ButtonType.SECONDARY}
                  className="min-w-28"
                  disabled={isRunningTests}
                  onClick={exportReport}
                >
                  {exported ? 'Exported ✅' : 'Export'}
                </Button>
              </div>
            )}
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
                    width: securityTests.find((test) =>
                      [TestStatus.Bug, TestStatus.Fail, TestStatus.Warning].includes(test.status),
                    )
                      ? '190px'
                      : '150px',
                    cell: (row, id) => (
                      <TestResultControls
                        className={cn('py-1', { 'items-end': row.name === LARGE_PAYLOAD_TEST_NAME })}
                        data-column-id={id}
                        data-tag="allowRowEvents"
                        testResult={row}
                        testType="security"
                      >
                        {row.name === LARGE_PAYLOAD_TEST_NAME ? (
                          <LargePayloadTestControls
                            isRunning={isLargePayloadTestRunning}
                            executeTest={(size: number) =>
                              executeLargePayloadTest({ ...testOptions, bodyParameters, queryParameters }, size)
                            }
                          />
                        ) : (
                          <p className="m-0 mr-2 whitespace-nowrap" data-column-id={id} data-tag="allowRowEvents">
                            {row.status}
                          </p>
                        )}
                      </TestResultControls>
                    ),
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
                    width: performanceTests.find((test) =>
                      [TestStatus.Bug, TestStatus.Fail, TestStatus.Warning].includes(test.status),
                    )
                      ? '240px'
                      : '220px',
                    cell: (row) => (
                      <TestResultControls
                        className={cn('py-1', { 'items-end': row.name === LOAD_TEST_NAME })}
                        testResult={row}
                        testType="performance"
                      >
                        {row.name === LOAD_TEST_NAME ? (
                          <LoadTestControls
                            isRunning={isLoadTestRunning}
                            executeTest={(threadCount: number, requestCount: number) =>
                              executeLoadTest(
                                { ...testOptions, bodyParameters, queryParameters },
                                threadCount,
                                requestCount,
                              )
                            }
                          />
                        ) : (
                          <p className="m-0 mr-2 whitespace-nowrap">{row.status}</p>
                        )}
                      </TestResultControls>
                    ),
                  },
                ]}
                data={performanceTests}
                progressComponent={<TestRunningLoader text="Running Performance Insights..." />}
                progressPending={isPerformanceRunning}
              />
            </ResponsePanel>

            <ResponsePanel title="Data-Driven Tests">
              <TestsTable
                columns={getTestsTableColumns(['Parameter', 'Value', 'Expected', 'Actual', 'Result'])}
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
    </div>
  );

  function reset(resetTestOptions = true) {
    setMethod('GET');
    setUrl('');
    setWssConnected(false);
    setHeaders('');
    setBody('{}');
    setProtoFile(null);
    setMessageType('');
    setHttpResponse(null);
    setMessages([]);
    setBodyParameters({});
    setQueryParameters({});
    setSelectedRequestId(null);

    if (resetTestOptions) setTestOptions(null);
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

      setSelectedRequestId(null);
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

  async function exportReport() {
    if (!testOptions) return;

    try {
      const report = formatReport(buildReport(), exportFormat);
      const result = await window.electronAPI.saveReport(report);

      if (result?.error) throw new Error(result.error);
      if (result?.canceled) return;

      setExported(true);
      clearTimeout(exportedTimeout);
      exportedTimeout = setTimeout(() => setExported(false), 2000);
    } catch (error) {
      console.error('Failed to export report', error);
    }
  }

  function buildReport(): ExportReport {
    if (!testOptions) throw new Error('No test results to export');

    const suites = [
      buildSuite('Security Tests', securityTests),
      buildSuite('Performance Insights', performanceTests),
      buildSuite('Data-Driven Tests', dataDrivenTests),
      buildSuite('CRUD', crudTests),
    ];

    return {
      generatedAt: new Date().toISOString(),
      target: {
        url: testOptions.url,
        method: testOptions.method,
        headers: parseHeaders(testOptions.headers),
        body: safeParseBody(testOptions.body),
        messageType: testOptions.messageType,
        protoFileName: testOptions.protoFile?.name ?? null,
      },
      lastHttpResponse: httpResponse,
      suites,
    };
  }

  function safeParseBody(rawBody: string | null) {
    if (rawBody === null) return null;
    const trimmed = rawBody.trim();
    if (!trimmed) return '';

    try {
      return JSON.parse(trimmed);
    } catch {
      return rawBody;
    }
  }

  async function sendHttp() {
    setHttpResponse({
      status: SENDING,
      body: '',
      headers: {},
    });
    setBodyParameters({});
    setQueryParameters({});

    try {
      const parsedHeaders = parseHeaders(headers);
      const parsedBody = parseBody(body, parsedHeaders, messageType, protoFile);
      const request = createHttpRequest(parsedBody, parsedHeaders, method, url);
      const response: HttpResponse = await window.electronAPI.sendHttp(request);

      setHttpResponse(response);

      if (!response.status.startsWith('2')) return;

      const bodyParameters = extractBodyParameters(parsedBody, parsedHeaders);
      const queryParameters = Object.fromEntries(
        Object.entries(extractQueryParameters(url)).map(([key, value]) => [
          key,
          getInitialParameterValue(detectDataType(value), value),
        ]),
      );

      setBodyParameters(bodyParameters);
      setQueryParameters(queryParameters);
    } catch (error) {
      setHttpResponse({
        status: NETWORK_ERROR,
        body: String(error),
        headers: {},
      });
    }
  }

  async function saveRequest() {
    const parsedHeaders = parseHeaders(headers);
    const parsedBody = parseBody(body, parsedHeaders, messageType, protoFile);
    const bodyString = typeof parsedBody === 'string' ? parsedBody : JSON.stringify(parsedBody);

    if (selectedRequestId && findRequestById(collection, selectedRequestId)) {
      // Update existing request
      const updatedCollection = updateRequestInCollection(
        collection,
        selectedRequestId,
        method,
        url,
        parsedHeaders,
        bodyString,
      );
      setCollection(updatedCollection);
      await window.electronAPI.saveCollection(updatedCollection);
    } else {
      const updatedCollection = addRequestToCollection(collection, method, url, parsedHeaders, bodyString, selectedFolderId);
      setCollection(updatedCollection);
      await window.electronAPI.saveCollection(updatedCollection);

      // Set the newly created request as selected
      const targetFolder = updatedCollection.item.find((f) => f.id === selectedFolderId);
      const newItem = targetFolder?.item[targetFolder.item.length - 1];
      if (newItem) setSelectedRequestId(newItem.id);
    }

    setSaved(true);
    clearTimeout(savedTimeout);
    savedTimeout = setTimeout(() => setSaved(false), 2000);
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

  async function onRemoveSidebarItem(id: string) {
    const updatedCollection = removeRequestFromCollection(collection, id);
    setCollection(updatedCollection);
    await window.electronAPI.saveCollection(updatedCollection);
  }

  async function onReorderSidebarItem(activeId: string, overId: string) {
    const updatedCollection = reorderRequestInCollection(collection, activeId, overId);
    setCollection(updatedCollection);
    await window.electronAPI.saveCollection(updatedCollection);
  }

  function onSelectSidebarItem(id: string) {
    const item = findRequestById(collection, id);
    if (!item) {
      return;
    }

    reset(false);
    setSelectedRequestId(id);

    // Also select the folder containing this item
    const folderId = findFolderIdByRequestId(collection, id);
    if (folderId) {
      setSelectedFolderId(folderId);
    }

    const { request } = item;
    const isWssUrl = request.url.startsWith('ws://') || request.url.startsWith('wss://');
    setMode(isWssUrl ? 'WSS' : 'HTTP');
    setMethod(request.method as Method);
    setUrl(request.url);
    setHeaders(headersRecordToString(postmanHeadersToRecord(request.header)));
    setBody(request.body?.raw || '{}');
  }

  function handleSelectFolder(folderId: string) {
    setSelectedFolderId(folderId);
  }

  async function handleAddFolder() {
    const updatedCollection = addFolderToCollection(collection, 'New Folder');
    setCollection(updatedCollection);
    await window.electronAPI.saveCollection(updatedCollection);
  }

  async function handleRenameFolder(folderId: string, newName: string) {
    const updatedCollection = renameFolderInCollection(collection, folderId, newName);
    setCollection(updatedCollection);
    await window.electronAPI.saveCollection(updatedCollection);
  }

  async function handleRemoveFolder(folderId: string, itemCount: number) {
    if (itemCount > 0) {
      setDeleteFolderModal({ isOpen: true, folderId });
    } else {
      const updatedCollection = removeFolderFromCollection(collection, folderId);
      setCollection(updatedCollection);
      await window.electronAPI.saveCollection(updatedCollection);
    }
  }

  async function confirmDeleteFolder() {
    if (deleteFolderModal.folderId) {
      const updatedCollection = removeFolderFromCollection(collection, deleteFolderModal.folderId);
      setCollection(updatedCollection);
      await window.electronAPI.saveCollection(updatedCollection);
    }
    setDeleteFolderModal({ isOpen: false, folderId: null });
  }

  function closeDeleteFolderModal() {
    setDeleteFolderModal({ isOpen: false, folderId: null });
  }

  async function handleReorderFolder(activeId: string, overId: string) {
    const updatedCollection = reorderFolderInCollection(collection, activeId, overId);
    setCollection(updatedCollection);
    await window.electronAPI.saveCollection(updatedCollection);
  }

  async function handleMoveItem(itemId: string, targetFolderId: string, targetIndex?: number) {
    const updatedCollection = moveRequestToFolder(collection, itemId, targetFolderId, targetIndex);
    setCollection(updatedCollection);
    await window.electronAPI.saveCollection(updatedCollection);
    setSelectedFolderId(targetFolderId);
  }
}

type ReportSuiteTest = {
  name?: string;
  status: TestResult['status'];
  expected: string;
  actual: string;
  responseTime?: number;
  request?: TestResult['request'];
  response?: TestResult['response'];
  value?: any;
};

type ReportSuite = {
  name: string;
  summary: { total: number; byStatus: Record<string, number> };
  tests: ReportSuiteTest[];
};

type ExportReport = {
  generatedAt: string;
  target: {
    url: string;
    method: Method | string;
    headers: Record<string, string>;
    body: any;
    messageType: string;
    protoFileName: string | null;
  };
  lastHttpResponse: HttpResponse | null;
  suites: ReportSuite[];
};

function buildSuite(name: string, tests: TestResult[]): ReportSuite {
  return {
    name,
    summary: summarizeSuite(tests),
    tests: tests.map((test) => ({
      name: test.name,
      status: test.status,
      expected: test.expected,
      actual: test.actual,
      responseTime: test.responseTime,
      request: test.request,
      response: test.response,
      value: test.value,
    })),
  };
}

function summarizeSuite(tests: TestResult[]) {
  return tests.reduce(
    (acc, test) => {
      acc.total += 1;
      acc.byStatus[test.status] = (acc.byStatus[test.status] ?? 0) + 1;
      return acc;
    },
    { total: 0, byStatus: {} as Record<string, number> },
  );
}

function formatReport(
  report: ExportReport,
  format: ReportFormat,
): { content: string; defaultPath: string; filters: { name: string; extensions: string[] }[] } {
  if (format === 'md') {
    return {
      content: toMarkdown(report),
      defaultPath: 'rentgen-report.md',
      filters: [{ name: 'Markdown', extensions: ['md'] }],
    };
  }

  if (format === 'csv') {
    return {
      content: toCsv(report),
      defaultPath: 'rentgen-report.csv',
      filters: [{ name: 'CSV', extensions: ['csv'] }],
    };
  }

  return {
    content: JSON.stringify(report, null, 2),
    defaultPath: 'rentgen-report.json',
    filters: [{ name: 'JSON', extensions: ['json'] }],
  };
}

function toMarkdown(report: ExportReport) {
  const lines: string[] = [];
  lines.push(`# Rentgen Report`);
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push('');
  lines.push(`## Target`);
  lines.push(`- URL: ${report.target.url}`);
  lines.push(`- Method: ${report.target.method}`);
  lines.push(`- Proto file: ${report.target.protoFileName ?? 'n/a'}`);
  lines.push('');

  for (const suite of report.suites) {
    lines.push(`### ${suite.name}`);
    lines.push(`- Total: ${suite.summary.total}`);
    lines.push(
      `- Statuses: ${Object.entries(suite.summary.byStatus)
        .map(([status, count]) => `${status} (${count})`)
        .join(', ')}`,
    );
    lines.push('');
    lines.push(`| Check | Expected | Actual | Status |`);
    lines.push(`| --- | --- | --- | --- |`);
    for (const test of suite.tests) {
      lines.push(
        `| ${escapeMd(test.name ?? '')} | ${escapeMd(test.expected ?? '')} | ${escapeMd(test.actual ?? '')} | ${escapeMd(test.status)} |`,
      );
    }
    lines.push('');
  }

  return lines.join('\n');
}

function toCsv(report: ExportReport) {
  const rows: string[][] = [['suite', 'check', 'status', 'expected', 'actual', 'responseTimeMs']];

  report.suites.forEach((suite) => {
    suite.tests.forEach((test) => {
      rows.push([
        suite.name,
        test.name ?? '',
        test.status,
        test.expected ?? '',
        test.actual ?? '',
        test.responseTime !== undefined ? String(test.responseTime) : '',
      ]);
    });
  });

  return rows.map((row) => row.map(csvEscape).join(',')).join('\n');
}

function csvEscape(value: string) {
  if (value.includes('"') || value.includes(',') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function escapeMd(value: string) {
  return value.replace(/\|/g, '\\|').replace(/\n/g, ' ');
}
