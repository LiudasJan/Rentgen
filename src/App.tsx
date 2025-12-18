import {Method} from 'axios';
import cn from 'classnames';
import {useCallback, useEffect, useMemo} from 'react';
import ActionsButton from './components/buttons/ActionsButton';
import Button, {ButtonSize, ButtonType} from './components/buttons/Button';
import {CopyButton} from './components/buttons/CopyButton';
import {IconButton} from './components/buttons/IconButton';
import {LargePayloadTestControls} from './components/controls/LargePayloadTestControls';
import {LoadTestControls} from './components/controls/LoadTestControls';
import {TestResultControls} from './components/controls/TestResultControls';
import EnvironmentEditor from './components/environment/EnvironmentEditor';
import EnvironmentSelector from './components/environment/EnvironmentSelector';
import FileInput from './components/inputs/FileInput';
import HighlightedInput from './components/inputs/HighlightedInput';
import HighlightedTextarea from './components/inputs/HighlightedTextarea';
import Select, {SelectOption} from './components/inputs/Select';
import Textarea from './components/inputs/Textarea';
import {GlobalContextMenuProvider} from './components/context-menu';
import {JsonViewer} from './components/JsonViewer';
import Loader from './components/loaders/Loader';
import TestRunningLoader from './components/loaders/TestRunningLoader';
import Modal from './components/modals/Modal';
import SetAsVariableModal from './components/modals/SetAsVariableModal';
import ParametersPanel from './components/panels/ParametersPanel';
import ResponsePanel from './components/panels/ResponsePanel';
import Sidebar from './components/sidebar/Sidebar';
import TestsTable, {ExpandedTestComponent, getTestsTableColumns} from './components/tables/TestsTable';
import {useCtrlS} from './hooks/useCtrlS';
import {useReset} from './hooks/useReset';
import useTests from './hooks/useTests';
import {
  ARRAY_LIST_WITHOUT_PAGINATION_TEST_NAME,
  LARGE_PAYLOAD_TEST_NAME,
  LOAD_TEST_NAME,
  RESPONSE_SIZE_CHECK_TEST_NAME,
} from './tests';
import {Environment, HttpResponse, TestResult, TestStatus} from './types';
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
  substituteRequestVariables,
} from './utils';
import {findRequestById} from './utils/collection';

import {store} from './store';
import {useAppDispatch, useAppSelector} from './store/hooks';
import {
  selectBody,
  selectBodyParameters,
  selectCollectionData,
  selectCollectionRunResults,
  selectCurl,
  selectCurlError,
  selectDeleteFolderModal,
  selectDisabledRunTests,
  selectEditingEnvironmentId,
  selectEnvironments,
  selectEnvironmentToDelete,
  selectExported,
  selectExportFormat,
  selectHeaders,
  selectHttpResponse,
  selectIsEditingEnvironment,
  selectIsRunningTests,
  selectMessageType,
  selectMethod,
  selectMode,
  selectOpenCurlModal,
  selectOpenReloadModal,
  selectProtoFile,
  selectQueryParameters,
  selectRequestTestResults,
  selectSaved,
  selectSelectedEnvironment,
  selectSelectedEnvironmentId,
  selectSelectedFolderId,
  selectSelectedRequestId,
  selectTestOptions,
  selectUrl,
  selectWssConnected,
  selectWssMessages,
} from './store/selectors';
import {collectionRunActions} from './store/slices/collectionRunSlice';
import {collectionActions, loadCollection} from './store/slices/collectionSlice';
import {environmentActions, loadEnvironments} from './store/slices/environmentSlice';
import {requestActions} from './store/slices/requestSlice';
import {responseActions} from './store/slices/responseSlice';
import {testActions} from './store/slices/testSlice';
import {uiActions} from './store/slices/uiSlice';
import {websocketActions} from './store/slices/websocketSlice';

import DarkModeIcon from './assets/icons/dark-mode-icon.svg';
import LightModeIcon from './assets/icons/light-mode-icon.svg';
import ReloadIcon from './assets/icons/reload-icon.svg';

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
  const dispatch = useAppDispatch();

  // Collection state
  const collection = useAppSelector(selectCollectionData);
  const collectionRunResults = useAppSelector(selectCollectionRunResults);
  const selectedFolderId = useAppSelector(selectSelectedFolderId);
  const selectedRequestId = useAppSelector(selectSelectedRequestId);

  const runResult = useMemo(
    () => collectionRunResults[selectedRequestId] || null,
    [collectionRunResults, selectedRequestId],
  );

  // Environment state
  const environments = useAppSelector(selectEnvironments);
  const selectedEnvironmentId = useAppSelector(selectSelectedEnvironmentId);
  const selectedEnvironment = useAppSelector(selectSelectedEnvironment);
  const isEditingEnvironment = useAppSelector(selectIsEditingEnvironment);
  const editingEnvironmentId = useAppSelector(selectEditingEnvironmentId);
  const environmentToDelete = useAppSelector(selectEnvironmentToDelete);

  const variables = useMemo(
    () => selectedEnvironment?.variables?.map((variable) => variable.key) || [],
    [selectedEnvironment],
  );

  // Request state
  const mode = useAppSelector(selectMode);
  const method = useAppSelector(selectMethod);
  const url = useAppSelector(selectUrl);
  const headers = useAppSelector(selectHeaders);
  const body = useAppSelector(selectBody);
  const bodyParameters = useAppSelector(selectBodyParameters);
  const queryParameters = useAppSelector(selectQueryParameters);
  const protoFile = useAppSelector(selectProtoFile);
  const messageType = useAppSelector(selectMessageType);

  // Response state
  const httpResponse = useAppSelector(selectHttpResponse);

  // WebSocket state
  const wssConnected = useAppSelector(selectWssConnected);
  const messages = useAppSelector(selectWssMessages);

  // Test state
  const testOptions = useAppSelector(selectTestOptions);
  const isRunningTests = useAppSelector(selectIsRunningTests);
  const disabledRunTests = useAppSelector(selectDisabledRunTests);
  const requestTestResults = useAppSelector(selectRequestTestResults(selectedRequestId));

  // UI state
  const openCurlModal = useAppSelector(selectOpenCurlModal);
  const openReloadModal = useAppSelector(selectOpenReloadModal);
  const deleteFolderModal = useAppSelector(selectDeleteFolderModal);
  const saved = useAppSelector(selectSaved);
  const exported = useAppSelector(selectExported);
  const curl = useAppSelector(selectCurl);
  const curlError = useAppSelector(selectCurlError);
  const exportFormat = useAppSelector(selectExportFormat);

  // Tests hook
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
  } = useTests();

  // Reset hook
  const reset = useReset();

  const disabled = useMemo(() => !url || isRunningTests, [url, isRunningTests]);

  // Load initial data
  useEffect(() => {
    dispatch(loadCollection());
  }, [dispatch]);

  useEffect(() => {
    dispatch(loadEnvironments());
  }, [dispatch]);

  useEffect(() => {
    const setTheme = async () => {
      const theme = await window.themeAPI.getTheme();
      if (theme === 'dark') document.documentElement.classList.add('dark');
    };
    setTheme();
  }, []);

  // WebSocket event listener
  useEffect(() => {
    if (!window.electronAPI.onWssEvent) return;

    const messagesListener = (event: any) => {
      if (event.type === 'open') {
        dispatch(websocketActions.handleWssOpen(event.data));
      } else if (event.type === 'close') {
        dispatch(websocketActions.handleWssClose(event.data));
      } else if (event.type === 'message') {
        dispatch(websocketActions.handleWssMessage({ data: String(event.data), decoded: event.decoded }));
      } else if (event.type === 'error') {
        dispatch(websocketActions.handleWssError(event.error));
      }
    };

    return window.electronAPI.onWssEvent(messagesListener);
  }, [dispatch]);

  // Execute tests when testOptions changes
  useEffect(() => {
    if (testOptions) executeAllTests();
  }, [testOptions]);

  // Populate request/response state when runResult changes
  useEffect(() => {
    if (runResult?.response) {
      dispatch(responseActions.setResponse(runResult.response));
      dispatch(requestActions.setBodyParameters(runResult.bodyParameters || {}));
      dispatch(requestActions.setQueryParameters(runResult.queryParameters || {}));
    }
  }, [runResult, dispatch]);

  // cURL import
  const importCurl = useCallback(() => {
    try {
      if (curl.length > 200_000) throw new Error('cURL too large');

      const {
        body: curlBody,
        decodedLines,
        headers: curlHeaders,
        method: curlMethod,
        url: curlUrl,
      } = extractCurl(curl);

      reset();
      dispatch(requestActions.setUrl(curlUrl));
      dispatch(requestActions.setMethod(curlMethod as Method));
      dispatch(
        requestActions.setHeaders(
          Object.entries(curlHeaders)
            .map(([k, v]) => `${k}: ${v}`)
            .join('\n'),
        ),
      );

      if (decodedLines.length > 0) {
        dispatch(requestActions.setBody(decodedLines.join('\n')));
      } else {
        const trimmedBody = curlBody ? String(curlBody).trim() : '';
        dispatch(requestActions.setBody(trimmedBody !== '' ? trimmedBody : '{}'));
      }

      dispatch(uiActions.closeCurlModal());
    } catch (error) {
      console.error('cURL import failed', error);
      dispatch(
        uiActions.setCurlError('The cURL command you provided appears to be invalid. Please check it and try again'),
      );
    }
  }, [curl, dispatch]);

  // Send HTTP request
  const sendHttp = useCallback(async () => {
    dispatch(responseActions.setSendingState());
    dispatch(requestActions.setBodyParameters({}));
    dispatch(requestActions.setQueryParameters({}));

    try {
      const {
        url: substitutedUrl,
        headers: substitutedHeaders,
        body: substitutedBody,
        messageType: substitutedMessageType,
      } = substituteRequestVariables(url, headers, body, messageType, selectedEnvironment);

      const parsedHeaders = parseHeaders(substitutedHeaders);
      const parsedBody = parseBody(substitutedBody, parsedHeaders, substitutedMessageType, protoFile);
      const request = createHttpRequest(parsedBody, parsedHeaders, method, substitutedUrl);
      const response: HttpResponse = await window.electronAPI.sendHttp(request);
      const status = extractStatusCode(response);

      dispatch(responseActions.setResponse(response));

      let bodyParameters = {};
      let queryParameters = {};

      if (status >= 200 && status < 300) {
        bodyParameters = extractBodyParameters(parsedBody, parsedHeaders);
        queryParameters = Object.fromEntries(
          Object.entries(extractQueryParameters(url)).map(([key, value]) => [
            key,
            getInitialParameterValue(detectDataType(value), value),
          ]),
        );

        dispatch(requestActions.setBodyParameters(bodyParameters));
        dispatch(requestActions.setQueryParameters(queryParameters));
      }

      if (selectedRequestId)
        dispatch(
          collectionRunActions.addResult({
            requestId: selectedRequestId,
            status,
            response,
            bodyParameters,
            queryParameters,
            error: null,
          }),
        );
    } catch (error) {
      dispatch(
        responseActions.setResponse({
          status: NETWORK_ERROR,
          body: String(error),
          headers: {},
        }),
      );
    }
  }, [url, headers, body, messageType, selectedEnvironment, selectedRequestId, protoFile, method, dispatch]);

  // Save request
  const saveRequest = useCallback(async () => {
    const parsedHeaders = parseHeaders(headers);

    if (selectedRequestId && findRequestById(collection, selectedRequestId)) {
      dispatch(
        collectionActions.updateRequest({
          requestId: selectedRequestId,
          method,
          url,
          headers: parsedHeaders,
          body,
        }),
      );
    } else {
      dispatch(
        collectionActions.addRequest({
          method,
          url,
          headers: parsedHeaders,
          body,
          folderId: selectedFolderId,
        }),
      );

      const requestId = store.getState().collection.selectedRequestId;
      if (httpResponse)
        dispatch(
          collectionRunActions.addResult({
            requestId,
            status: extractStatusCode(httpResponse),
            response: httpResponse,
            bodyParameters,
            queryParameters,
            error: null,
          }),
        );

      if (crudTests.length > 0 && dataDrivenTests.length > 0 && performanceTests.length > 0 && securityTests.length > 0)
        dispatch(
          testActions.addResults({
            requestId,
            results: {
              crudTests,
              dataDrivenTests,
              performanceTests,
              securityTests,
            },
          }),
        );
    }

    dispatch(uiActions.setSaved(true));
    clearTimeout(savedTimeout);
    savedTimeout = setTimeout(() => dispatch(uiActions.setSaved(false)), 2000);
  }, [
    body,
    bodyParameters,
    collection,
    crudTests,
    dataDrivenTests,
    headers,
    httpResponse,
    method,
    performanceTests,
    queryParameters,
    securityTests,
    selectedFolderId,
    selectedRequestId,
    url,
    dispatch,
  ]);

  const autoSaveRequest = useCallback(() => {
    if (disabled || !selectedRequestId) return;

    saveRequest();
  }, [disabled, selectedRequestId, saveRequest]);

  // WebSocket functions
  const connectWss = useCallback(() => {
    if (!url.startsWith('ws')) {
      dispatch(websocketActions.addMessage({ direction: 'system', data: '🔴 Please use ws:// or wss:// URL' }));
      return;
    }
    window.electronAPI.connectWss({ url, headers: parseHeaders(headers) });
  }, [url, headers, dispatch]);

  const sendWss = useCallback(() => {
    dispatch(websocketActions.handleWssSent({ data: body }));
    window.electronAPI.sendWss(body);
  }, [body, dispatch]);

  const confirmDeleteFolder = useCallback(() => {
    if (deleteFolderModal.folderId) {
      dispatch(collectionActions.removeFolder(deleteFolderModal.folderId));
    }
    dispatch(uiActions.closeDeleteFolderModal());
  }, [deleteFolderModal.folderId, dispatch]);

  // Environment handlers
  const handleSaveEnvironment = useCallback(
    (environment: Environment) => {
      dispatch(environmentActions.updateEnvironment(environment));
    },
    [dispatch],
  );

  const handleDeleteEnvironment = useCallback(
    (id: string) => {
      dispatch(environmentActions.deleteEnvironment(id));
    },
    [dispatch],
  );

  // Export report
  const exportReport = useCallback(async () => {
    if (!testOptions) return;

    try {
      const report = formatReport(buildReport(), exportFormat);
      const result = await window.electronAPI.saveReport(report);

      if (result?.error) throw new Error(result.error);
      if (result?.canceled) return;

      dispatch(uiActions.setExported(true));
      clearTimeout(exportedTimeout);
      exportedTimeout = setTimeout(() => dispatch(uiActions.setExported(false)), 2000);
    } catch (error) {
      console.error('Failed to export report', error);
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
  }, [testOptions, exportFormat, securityTests, performanceTests, dataDrivenTests, crudTests, httpResponse, dispatch]);

  useCtrlS(!disabled && saveRequest);

  return (
    <GlobalContextMenuProvider>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 min-w-0 flex flex-col gap-4 py-5 px-7 overflow-y-auto">
          {isEditingEnvironment ? (
            <EnvironmentEditor
              environment={environments.find((e) => e.id === editingEnvironmentId) || null}
              isNew={editingEnvironmentId === null}
              onSave={handleSaveEnvironment}
            />
          ) : (
            <>
              <div className="flex items-center gap-2">
                <Select
                  className="font-bold"
                  isSearchable={false}
                  options={modeOptions}
                  placeholder="MODE"
                  value={modeOptions.find((option) => option.value == mode)}
                  onChange={(option: SelectOption<Mode>) => {
                    dispatch(requestActions.setMode(option.value));
                    reset();
                  }}
                />
                {mode === 'HTTP' && (
                  <>
                    <ActionsButton
                      actions={[{ label: 'Create', onClick: reset }]}
                      onClick={() => dispatch(uiActions.openCurlModal())}
                    >
                      Import cURL
                    </ActionsButton>
                    <Modal isOpen={openCurlModal} onClose={() => dispatch(uiActions.closeCurlModal())}>
                      <div className="flex flex-col gap-4">
                        <h4 className="m-0">Import cURL</h4>
                        <Textarea
                          autoFocus={true}
                          className="min-h-40"
                          placeholder="Enter cURL or paste text"
                          value={curl}
                          onChange={(event) => dispatch(uiActions.setCurl(event.target.value))}
                        />
                        {curlError && <p className="m-0 text-xs text-red-600">{curlError}</p>}
                        <div className="flex items-center justify-end gap-4">
                          <Button onClick={importCurl}>Import</Button>
                          <Button
                            buttonType={ButtonType.SECONDARY}
                            onClick={() => dispatch(uiActions.closeCurlModal())}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </Modal>
                  </>
                )}
                <div className="flex-auto flex items-center justify-end gap-2">
                  <EnvironmentSelector
                    environments={environments}
                    selectedEnvironmentId={selectedEnvironmentId}
                    onSelect={(id) => dispatch(environmentActions.selectEnvironment(id))}
                  />
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
                  <IconButton onClick={() => dispatch(uiActions.openReloadModal())}>
                    <ReloadIcon className="h-5 w-5" />
                  </IconButton>
                  <Modal
                    className="[&>div]:w-[400px]!"
                    isOpen={openReloadModal}
                    onClose={() => dispatch(uiActions.closeReloadModal())}
                  >
                    <div className="flex flex-col gap-4">
                      <h4 className="m-0">Reload</h4>
                      <p className="m-0 text-sm dark:text-text-secondary">Only current tests results will be lost</p>
                      <div className="flex items-center justify-end gap-4">
                        <Button buttonType={ButtonType.DANGER} onClick={() => window.location.reload()}>
                          Reload
                        </Button>
                        <Button
                          buttonType={ButtonType.SECONDARY}
                          onClick={() => dispatch(uiActions.closeReloadModal())}
                        >
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
                            'dark:bg-dark-input! dark:border-dark-border! dark:border-r-dark-body!',
                          ),
                        input: () => 'm-0! p-0! [&>:first-child]:uppercase text-text! dark:text-dark-text!',
                      }}
                      isCreatable={true}
                      options={methodOptions}
                      placeholder="METHOD"
                      value={methodOptions.find((option) => option.value == method) || { value: method, label: method }}
                      onChange={(option: SelectOption<Method>) => dispatch(requestActions.setMethod(option.value))}
                    />
                  )}
                  <HighlightedInput
                    className={cn('flex-auto', { 'border-l-0 rounded-l-none': mode === 'HTTP' })}
                    highlightColor={selectedEnvironment?.color}
                    placeholder="Enter URL or paste text"
                    value={url}
                    variables={variables}
                    onBlur={autoSaveRequest}
                    onChange={(event) => dispatch(requestActions.setUrl(event.target.value))}
                  />
                </div>
                {mode === 'HTTP' && (
                  <>
                    <Button disabled={disabled} onClick={sendHttp}>
                      Send
                    </Button>
                    <Button buttonType={ButtonType.SECONDARY} disabled={disabled} onClick={saveRequest}>
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

              <HighlightedTextarea
                highlightColor={selectedEnvironment?.color}
                maxRows={10}
                placeholder="Header-Key: value"
                value={headers}
                variables={variables}
                onBlur={autoSaveRequest}
                onChange={(event) => dispatch(requestActions.setHeaders(event.target.value))}
              />

              <div className="relative">
                <HighlightedTextarea
                  highlightColor={selectedEnvironment?.color}
                  maxRows={15}
                  placeholder={mode === 'HTTP' ? 'Enter request body (JSON or Form Data)' : 'Message body'}
                  value={body}
                  variables={variables}
                  onBlur={autoSaveRequest}
                  onChange={(event) => dispatch(requestActions.setBody(event.target.value))}
                />
                <Button
                  className="absolute top-3 right-4 z-10"
                  buttonSize={ButtonSize.SMALL}
                  buttonType={ButtonType.SECONDARY}
                  onClick={() => dispatch(requestActions.setBody(formatBody(body, parseHeaders(headers))))}
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
                          dispatch(requestActions.setProtoFile(file));
                          dispatch(
                            websocketActions.addMessage({ direction: 'system', data: '🟢 Proto schema loaded' }),
                          );
                        } catch (error) {
                          dispatch(
                            websocketActions.addMessage({
                              direction: 'system',
                              data: '🔴 Failed to parse proto: ' + error,
                            }),
                          );
                        }
                      }}
                    />

                    <HighlightedInput
                      className="flex-auto"
                      highlightColor={selectedEnvironment?.color}
                      placeholder="Message type (e.g. mypackage.MyMessage)"
                      value={messageType}
                      variables={variables}
                      onChange={(event) => dispatch(requestActions.setMessageType(event.target.value))}
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
                    <div className="grid grid-cols-2 items-stretch max-h-100 py-4 border-t border-border dark:border-dark-body overflow-y-auto">
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
                      onChange={(parameters) => dispatch(requestActions.mergeBodyParameters(parameters))}
                    />
                  )}

                  {Object.keys(queryParameters).length > 0 && (
                    <ParametersPanel
                      title="Query Parameters"
                      parameters={queryParameters}
                      onChange={(parameters) => dispatch(requestActions.mergeQueryParameters(parameters))}
                    />
                  )}
                </div>
              )}

              {mode === 'HTTP' && (
                <div className="flex justify-between">
                  <Button
                    disabled={disabledRunTests}
                    onClick={() => {
                      dispatch(
                        testActions.setTestOptions({
                          ...substituteRequestVariables(url, headers, body, messageType, selectedEnvironment),
                          bodyParameters,
                          method,
                          protoFile,
                          queryParameters,
                        }),
                      );
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
                        onChange={(option: SelectOption<ReportFormat>) =>
                          dispatch(uiActions.setExportFormat(option.value))
                        }
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

              {(testOptions || requestTestResults) && (
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
                      expandableRows
                      expandableRowsComponent={ExpandedTestComponent}
                      expandableRowsComponentProps={{ headers: parseHeaders(headers), protoFile, messageType }}
                      expandableRowDisabled={(row) =>
                        (row.name !== RESPONSE_SIZE_CHECK_TEST_NAME &&
                          row.name !== ARRAY_LIST_WITHOUT_PAGINATION_TEST_NAME) ||
                        !row.response
                      }
                      expandOnRowClicked
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
            </>
          )}
        </div>
        <Modal
          className="[&>div]:w-[400px]!"
          isOpen={!!environmentToDelete}
          onClose={() => dispatch(environmentActions.setEnvironmentToDelete(null))}
        >
          <div className="flex flex-col gap-4">
            <h4 className="m-0">Delete Environment</h4>
            <p className="m-0 text-sm dark:text-text-secondary">Are you sure you want to delete this environment?</p>
            <div className="flex items-center justify-end gap-4">
              <Button
                buttonType={ButtonType.DANGER}
                onClick={() => {
                  if (environmentToDelete) {
                    handleDeleteEnvironment(environmentToDelete);
                  }
                  dispatch(environmentActions.setEnvironmentToDelete(null));
                }}
              >
                Delete
              </Button>
              <Button
                buttonType={ButtonType.SECONDARY}
                onClick={() => dispatch(environmentActions.setEnvironmentToDelete(null))}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
        <Modal
          className="[&>div]:w-[400px]!"
          isOpen={deleteFolderModal.isOpen}
          onClose={() => dispatch(uiActions.closeDeleteFolderModal())}
        >
          <div className="flex flex-col gap-4">
            <h4 className="m-0">Delete Folder</h4>
            <p className="m-0 text-sm dark:text-text-secondary">
              This folder contains requests. Are you sure you want to delete it?
            </p>
            <div className="flex items-center justify-end gap-4">
              <Button buttonType={ButtonType.DANGER} onClick={confirmDeleteFolder}>
                Delete
              </Button>
              <Button buttonType={ButtonType.SECONDARY} onClick={() => dispatch(uiActions.closeDeleteFolderModal())}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
        <SetAsVariableModal />
      </div>
    </GlobalContextMenuProvider>
  );
}

// Report types and helper functions
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
