import { Method } from 'axios';
import cn from 'classnames';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import ActionsButton from './components/buttons/ActionsButton';
import Button, { ButtonSize, ButtonType } from './components/buttons/Button';
import { CopyButton } from './components/buttons/CopyButton';
import { IconButton } from './components/buttons/IconButton';
import { LargePayloadTestControls } from './components/controls/LargePayloadTestControls';
import { LoadTestControls } from './components/controls/LoadTestControls';
import { TestResultControls } from './components/controls/TestResultControls';
import EnvironmentEditor from './components/environment/EnvironmentEditor';
import EnvironmentSelector from './components/environment/EnvironmentSelector';
import FileInput from './components/inputs/FileInput';
import HighlightedInput from './components/inputs/HighlightedInput';
import HighlightedTextarea from './components/inputs/HighlightedTextarea';
import Select, { SelectOption } from './components/inputs/Select';
import Textarea from './components/inputs/Textarea';
import { JsonViewer } from './components/JsonViewer';
import Loader from './components/loaders/Loader';
import TestRunningLoader from './components/loaders/TestRunningLoader';
import ConfirmationModal from './components/modals/ConfirmationModal';
import ImportConflictModal from './components/modals/ImportConflictModal';
import Modal from './components/modals/Modal';
import SetAsDynamicVariableModal from './components/modals/SetAsDynamicVariableModal';
import Panel from './components/panels/Panel';
import ParametersPanel from './components/panels/ParametersPanel';
import TestResultsComparisonPanel from './components/panels/TestResultsComparisonPanel';
import Sidebar from './components/sidebar/Sidebar';
import TestsTable, { ExpandedTestComponent, getTestsTableColumns } from './components/tables/TestsTable';
import { appConfig } from './constants/appConfig';
import { useCtrlS } from './hooks/useCtrlS';
import { useReset } from './hooks/useReset';
import useTests from './hooks/useTests';
import {
  ARRAY_LIST_WITHOUT_PAGINATION_TEST_NAME,
  LARGE_PAYLOAD_TEST_NAME,
  LOAD_TEST_NAME,
  RESPONSE_SIZE_CHECK_TEST_NAME,
} from './tests';
import { Environment, ExportReport, ExtractionFailure, HarFile, HttpResponse, ReportFormat, TestStatus } from './types';
import { extractDynamicVariableFromResponseWithDetails } from './utils/dynamicVariable';
import {
  buildSuite,
  createHttpRequest,
  detectDataType,
  extractBodyFromResponse,
  extractBodyParameters,
  extractCurl,
  extractQueryParameters,
  extractStatusCode,
  formatBody,
  formatReport,
  getInitialParameterValue,
  loadProtoSchema,
  parseBody,
  parseHeaders,
  substituteRequestVariables,
} from './utils';
import { detectImportConflicts, findRequestById, findRequestWithFolder } from './utils/collection';
import { harToRentgen, validateHarFile } from './utils/har-converter';

import { store } from './store';
import { useAppDispatch, useAppSelector } from './store/hooks';
import {
  selectBody,
  selectBodyParameters,
  selectCertificated,
  selectCertificateError,
  selectCollectionData,
  selectCollectionRunResults,
  selectCompareResponse,
  selectCurl,
  selectCurlError,
  selectDeleteFolderModal,
  selectDisabledRunTests,
  selectDynamicVariables,
  selectEditingEnvironmentId,
  selectEnvironments,
  selectEnvironmentToDelete,
  selectExported,
  selectExportFormat,
  selectHarError,
  selectHarInput,
  selectHeaders,
  selectHttpResponse,
  selectIsComparingTestResults,
  selectIsEditingEnvironment,
  selectIsRunningTests,
  selectMessageType,
  selectMethod,
  selectMode,
  selectOpenCurlModal,
  selectOpenHarModal,
  selectOpenReloadModal,
  selectOpenSendHttpSuccessModal,
  selectProtoFile,
  selectQueryParameters,
  selectSaved,
  selectSelectedEnvironment,
  selectSelectedEnvironmentId,
  selectSelectedFolderId,
  selectSelectedRequestId,
  selectTestOptions,
  selectTestResultsToCompare,
  selectUrl,
  selectWssConnected,
  selectWssMessages,
} from './store/selectors';
import { collectionRunActions } from './store/slices/collectionRunSlice';
import { collectionActions, loadCollection } from './store/slices/collectionSlice';
import { environmentActions, loadDynamicVariables, loadEnvironments } from './store/slices/environmentSlice';
import { historyActions, loadHistory } from './store/slices/historySlice';
import { requestActions } from './store/slices/requestSlice';
import { responseActions } from './store/slices/responseSlice';
import { testActions } from './store/slices/testSlice';
import { loadTheme, uiActions } from './store/slices/uiSlice';
import { websocketActions } from './store/slices/websocketSlice';

import CloseIcon from './assets/icons/clear-cross-icon.svg';
import DarkModeIcon from './assets/icons/dark-mode-icon.svg';
import LightModeIcon from './assets/icons/light-mode-icon.svg';
import ReloadIcon from './assets/icons/reload-icon.svg';

type Mode = 'HTTP' | 'WSS';

let savedTimeout: NodeJS.Timeout;
let exportedTimeout: NodeJS.Timeout;
let certificateTimeout: NodeJS.Timeout;

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

  // Check if request is saved in a collection (needed for dynamic variable buttons)
  const currentRequestWithFolder = useMemo(() => {
    if (!selectedRequestId) return null;
    return findRequestWithFolder(collection, selectedRequestId);
  }, [collection, selectedRequestId]);

  // Environment state
  const environments = useAppSelector(selectEnvironments);
  const selectedEnvironmentId = useAppSelector(selectSelectedEnvironmentId);
  const selectedEnvironment = useAppSelector(selectSelectedEnvironment);
  const dynamicVariables = useAppSelector(selectDynamicVariables);
  const isEditingEnvironment = useAppSelector(selectIsEditingEnvironment);
  const editingEnvironmentId = useAppSelector(selectEditingEnvironmentId);
  const environmentToDelete = useAppSelector(selectEnvironmentToDelete);

  const variables = useMemo(() => {
    const environmentDynamicVariables =
      dynamicVariables
        .filter(
          (dynamicVariable) =>
            dynamicVariable.environmentId === selectedEnvironment?.id || !dynamicVariable.environmentId,
        )
        .map((dynamicVariable) => dynamicVariable.key) ?? [];
    const environmentVariables = selectedEnvironment?.variables?.map((variable) => variable.key) ?? [];

    return [...environmentVariables, ...environmentDynamicVariables];
  }, [selectedEnvironment, dynamicVariables]);

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
  const compareResponse = useAppSelector(selectCompareResponse);
  const isComparingTestResults = useAppSelector(selectIsComparingTestResults);
  const testResultsToCompare = useAppSelector(selectTestResultsToCompare);

  // UI state
  const openCurlModal = useAppSelector(selectOpenCurlModal);
  const openReloadModal = useAppSelector(selectOpenReloadModal);
  const openSendHttpSuccessModal = useAppSelector(selectOpenSendHttpSuccessModal);
  const deleteFolderModal = useAppSelector(selectDeleteFolderModal);
  const saved = useAppSelector(selectSaved);
  const exported = useAppSelector(selectExported);
  const certificated = useAppSelector(selectCertificated);
  const curl = useAppSelector(selectCurl);
  const curlError = useAppSelector(selectCurlError);
  const openHarModal = useAppSelector(selectOpenHarModal);
  const harInput = useAppSelector(selectHarInput);
  const harError = useAppSelector(selectHarError);
  const exportFormat = useAppSelector(selectExportFormat);
  const certificateError = useAppSelector(selectCertificateError);

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
    testsDomain,
    testsTimestamp,
    executeAllTests,
    executeLoadTest,
    executeLargePayloadTest,
  } = useTests();

  // Reset hook
  const reset = useReset();

  const parametersRef = useRef<HTMLDivElement | null>(null);
  const disabled = useMemo(() => !url || isRunningTests, [url, isRunningTests]);
  const testResults = useMemo(() => {
    if (!testsCount) return null;

    return {
      count: testsCount,
      domain: testsDomain,
      timestamp: testsTimestamp,
      crudTests,
      dataDrivenTests,
      performanceTests,
      securityTests,
    };
  }, [testsCount, testsDomain, testsTimestamp, crudTests, dataDrivenTests, performanceTests, securityTests]);

  // Load initial data
  useEffect(() => {
    dispatch(loadCollection());
  }, [dispatch]);

  useEffect(() => {
    dispatch(loadEnvironments());
    dispatch(loadDynamicVariables());
  }, [dispatch]);

  useEffect(() => {
    dispatch(loadTheme());
  }, [dispatch]);

  useEffect(() => {
    dispatch(loadHistory());
  }, [dispatch]);

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

  // HAR import — browse file
  const handleBrowseHarFile = useCallback(async () => {
    const result = await window.electronAPI.readHarFile();
    if (result.canceled) return;
    if (result.error) {
      dispatch(uiActions.setHarError(result.error));
      return;
    }
    if (result.content) {
      dispatch(uiActions.setHarInput(result.content));
      dispatch(uiActions.setHarError(''));
    }
  }, [dispatch]);

  // HAR import — parse & import
  const importHar = useCallback(() => {
    try {
      if (harInput.length > 10_000_000) {
        dispatch(uiActions.setHarError('File is too large (max 10 MB)'));
        return;
      }

      const parsed = JSON.parse(harInput);
      const validation = validateHarFile(parsed);
      if (!validation.valid && 'error' in validation) {
        dispatch(uiActions.setHarError(validation.error));
        return;
      }

      const { collection: importedCollection, warnings } = harToRentgen(parsed as HarFile);

      if (importedCollection.item.length === 0) {
        dispatch(uiActions.setHarError('No importable requests found (all entries were static assets or preflight)'));
        return;
      }

      const conflictSummary = detectImportConflicts(collection, importedCollection);

      if (conflictSummary.hasConflicts) {
        dispatch(
          uiActions.openImportConflictModal({
            collection: importedCollection,
            conflictSummary,
            warnings,
          }),
        );
      } else {
        dispatch(collectionActions.importCollection({ collection: importedCollection, mode: 'merge' }));
        dispatch(uiActions.setSidebarActiveTab('collections'));
        dispatch(uiActions.setRecentlyImportedFolderNames(importedCollection.item.map((f) => f.name)));
      }

      dispatch(uiActions.closeHarModal());
    } catch (error) {
      if (error instanceof SyntaxError) {
        dispatch(uiActions.setHarError('Invalid JSON — could not parse HAR file'));
      } else {
        dispatch(uiActions.setHarError(String(error)));
      }
    }
  }, [harInput, collection, dispatch]);

  // Send HTTP request
  const sendHttp = useCallback(async () => {
    dispatch(responseActions.setSendingState());
    dispatch(requestActions.setBodyParameters({}));
    dispatch(requestActions.setQueryParameters({}));

    const historyEntry = {
      id: `hist_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      timestamp: Date.now(),
      method,
      url,
      headers,
      body,
    };

    try {
      const {
        url: substitutedUrl,
        headers: substitutedHeaders,
        body: substitutedBody,
        messageType: substitutedMessageType,
      } = substituteRequestVariables(url, headers, body, messageType, selectedEnvironment, dynamicVariables);

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
        dispatch(uiActions.openSendHttpSuccessModal());
      }

      // Extract dynamic variables and track failures
      let warning: string | null = null;
      if (selectedRequestId) {
        const requestDynamicVars = dynamicVariables.filter((dv) => dv.requestId === selectedRequestId);
        const extractionFailures: ExtractionFailure[] = [];

        for (const dvar of requestDynamicVars) {
          const extractionResult = extractDynamicVariableFromResponseWithDetails(dvar, response);

          if (!extractionResult.success) {
            extractionFailures.push({
              variableName: dvar.key,
              selector: dvar.selector,
              source: dvar.source,
              reason: extractionResult.error || 'unknown error',
            });
          }
          // Note: The actual variable update is handled by the electronMiddleware
        }

        // Build warning message if any extractions failed
        if (extractionFailures.length > 0) {
          if (extractionFailures.length === 1) {
            const f = extractionFailures[0];
            warning = `Failed to extract {{${f.variableName}}}: ${f.reason}`;
          } else {
            const details = extractionFailures.map((f) => `{{${f.variableName}}}`).join(', ');
            warning = `Failed to extract: ${details}`;
          }
        }

        dispatch(
          collectionRunActions.addResult({
            requestId: selectedRequestId,
            status,
            response,
            bodyParameters,
            queryParameters,
            error: null,
            warning,
          }),
        );
      }

      dispatch(historyActions.addEntry(historyEntry));
    } catch (error) {
      dispatch(
        responseActions.setResponse({
          status: NETWORK_ERROR,
          body: String(error),
          headers: {},
        }),
      );
      dispatch(historyActions.addEntry(historyEntry));
    }
  }, [
    url,
    headers,
    body,
    messageType,
    selectedEnvironment,
    dynamicVariables,
    selectedRequestId,
    protoFile,
    method,
    dispatch,
  ]);

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

      if (testResults)
        dispatch(
          testActions.addResults({
            requestId,
            results: testResults,
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
    headers,
    httpResponse,
    method,
    queryParameters,
    selectedFolderId,
    selectedRequestId,
    testResults,
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

  // Handler to open the Set as Dynamic Variable modal from JsonViewer
  const handleSetVariable = useCallback(
    (path: string, value: string, source: 'body' | 'header') => {
      if (!currentRequestWithFolder) return;
      const { folder, request } = currentRequestWithFolder;
      dispatch(
        uiActions.openSetAsDynamicVariableModal({
          initialSelector: path,
          initialValue: value,
          collectionId: folder.id,
          requestId: selectedRequestId,
          collectionName: folder.name,
          requestName: request.name,
          editingVariableId: null,
          editingVariableName: null,
          source,
        }),
      );
    },
    [currentRequestWithFolder, selectedRequestId, dispatch],
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
        generatedBy: appConfig.origin,
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

  // Generate certificate
  const generateCertificate = useCallback(async () => {
    try {
      if (!testResults || testResults.count < 70) {
        dispatch(uiActions.setCertificateError('Not eligible (need at least 70 tests)'));
        clearTimeout(certificateTimeout);
        certificateTimeout = setTimeout(() => dispatch(uiActions.setCertificateError('')), 5000);
        return;
      }

      const result = await window.electronAPI.generateCertificate(testResults);

      if (result?.error) throw new Error(result.error);
      if (result?.canceled) return;

      dispatch(uiActions.setCertificated(true));
      clearTimeout(certificateTimeout);
      certificateTimeout = setTimeout(() => dispatch(uiActions.setCertificated(false)), 2000);
    } catch (error) {
      console.error('Failed to generate certificate', error);
    }
  }, [testResults, dispatch]);

  useCtrlS(!disabled && saveRequest);

  return (
    <div className="flex">
      <Sidebar />
      <div className="@container flex-1 min-w-0 flex flex-col gap-4 py-5 px-7 overflow-y-auto">
        {isEditingEnvironment && (
          <EnvironmentEditor
            environment={environments.find((e) => e.id === editingEnvironmentId) || null}
            isNew={editingEnvironmentId === null}
            onSave={handleSaveEnvironment}
          />
        )}
        {!isEditingEnvironment && isComparingTestResults && (
          <div className="relative">
            <TestResultsComparisonPanel
              items={testResultsToCompare}
              response={compareResponse}
              title="Test Results Comparison"
            />
            <IconButton
              className="absolute top-2.5 right-4"
              onClick={() => dispatch(testActions.clearResultsToCompare())}
            >
              <CloseIcon className="h-5 w-5" />
            </IconButton>
          </div>
        )}
        {!isEditingEnvironment && !isComparingTestResults && (
          <>
            <div className="flex flex-col @lg:flex-row @lg:items-center gap-4 @lg:gap-2">
              <div className="flex flex-col @lg:flex-row @lg:items-center gap-2">
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
                      actions={[
                        { label: 'Create', onClick: reset },
                        { label: 'Import HAR', onClick: () => dispatch(uiActions.openHarModal()) },
                      ]}
                      className="[&>*:first-child]:w-full @lg:[&>*:first-child]:w-auto"
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
                    <Modal isOpen={openHarModal} onClose={() => dispatch(uiActions.closeHarModal())}>
                      <div className="flex flex-col gap-4">
                        <h4 className="m-0">Import HAR</h4>
                        <p className="m-0 text-xs text-text-secondary">
                          Requests will be imported as a collection, grouped by domain
                        </p>
                        <Textarea
                          autoFocus={true}
                          className="min-h-40"
                          placeholder="Paste HAR JSON content"
                          value={harInput}
                          onChange={(event) => dispatch(uiActions.setHarInput(event.target.value))}
                        />
                        {harError && <p className="m-0 text-xs text-red-600">{harError}</p>}
                        <div className="flex items-center justify-end gap-4">
                          <Button buttonType={ButtonType.SECONDARY} onClick={handleBrowseHarFile}>
                            Choose .har file
                          </Button>
                          <Button onClick={importHar}>Import</Button>
                          <Button buttonType={ButtonType.SECONDARY} onClick={() => dispatch(uiActions.closeHarModal())}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </Modal>
                  </>
                )}
              </div>
              <div className="flex-auto flex items-center justify-end gap-2">
                <EnvironmentSelector
                  className="flex-auto @lg:flex-none"
                  environments={environments}
                  selectedEnvironmentId={selectedEnvironmentId}
                  onSelect={(id) => dispatch(environmentActions.selectEnvironment(id))}
                />
                <IconButton onClick={() => dispatch(uiActions.toggleTheme())}>
                  <DarkModeIcon className="h-5 w-5 dark:hidden" />
                  <LightModeIcon className="hidden dark:block h-6 w-6" />
                </IconButton>
                <IconButton onClick={() => dispatch(uiActions.openReloadModal())}>
                  <ReloadIcon className="h-5 w-5" />
                </IconButton>
              </div>
            </div>

            <div className="flex flex-col @lg:flex-row @lg:items-center gap-2">
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
                <div className="flex flex-col @lg:flex-row @lg:items-center gap-2">
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
                        dispatch(websocketActions.addMessage({ direction: 'system', data: '🟢 Proto schema loaded' }));
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
              <Panel title="Response">
                <div
                  className={cn(
                    'flex items-center gap-2 p-4 font-bold bg-body dark:bg-dark-body border-t border-border dark:border-dark-body',
                    {
                      'text-green-500': httpResponse.status.startsWith('2') && !runResult?.warning,
                      'text-yellow-500': httpResponse.status.startsWith('2') && runResult?.warning,
                      'text-blue-500': httpResponse.status.startsWith('3'),
                      'text-orange-500': httpResponse.status.startsWith('4'),
                      'text-red-500': httpResponse.status.startsWith('5') || httpResponse.status === NETWORK_ERROR,
                    },
                  )}
                >
                  {httpResponse.status === SENDING && <Loader className="h-5 w-5" />}
                  {httpResponse.status}
                </div>
                {runResult?.warning && (
                  <div className="px-4 py-2 text-xs bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-t border-yellow-200 dark:border-yellow-800">
                    <span className="font-semibold">Warning:</span> {runResult.warning}
                  </div>
                )}
                {httpResponse.status !== SENDING && (
                  <div className="grid grid-cols-2 items-stretch max-h-100 py-4 border-t border-border dark:border-dark-body overflow-hidden">
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
                      <JsonViewer
                        source={httpResponse.headers}
                        responsePanelContext={{ isResponsePanel: true, source: 'header' }}
                        showVariableButtons={!!currentRequestWithFolder}
                        onSetVariable={(path, value) => handleSetVariable(path, value, 'header')}
                      />
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
                      <JsonViewer
                        source={extractBodyFromResponse(httpResponse)}
                        responsePanelContext={{ isResponsePanel: true, source: 'body' }}
                        showVariableButtons={!!currentRequestWithFolder}
                        onSetVariable={(path, value) => handleSetVariable(path, value, 'body')}
                      />
                    </div>
                  </div>
                )}
              </Panel>
            )}

            {messages.length > 0 && (
              <Panel title="Messages">
                <div className="max-h-100 p-4 text-xs border-t border-border dark:border-dark-body overflow-y-auto">
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
              </Panel>
            )}

            {(Object.keys(bodyParameters).length > 0 || Object.keys(queryParameters).length > 0) && (
              <div ref={parametersRef} className="grid lg:grid-cols-2 gap-4 items-stretch">
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
              <>
                <div className="flex flex-col @xl:flex-row @xl:items-center @xl:justify-between gap-4 @xl:gap-2">
                  <div className="flex flex-col @xl:flex-row @xl:items-center gap-4 @xl:gap-2 @xl:min-w-0">
                    <Button
                      className="@xl:shrink-0 @xl:whitespace-nowrap"
                      disabled={disabledRunTests}
                      onClick={() => {
                        dispatch(
                          testActions.setOptions({
                            ...substituteRequestVariables(
                              url,
                              headers,
                              body,
                              messageType,
                              selectedEnvironment,
                              dynamicVariables,
                            ),
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
                    {(testOptions || testResults) && (
                      <Button
                        className="@xl:truncate"
                        buttonType={ButtonType.SECONDARY}
                        disabled={isRunningTests}
                        onClick={() => {
                          dispatch(testActions.addResultToCompare(testResults));
                          if (testResultsToCompare.length < 1) dispatch(testActions.setCompareResponse(httpResponse));
                        }}
                      >
                        {testResultsToCompare.length < 1 ? 'Select for Compare' : 'Compare with Selected'}
                      </Button>
                    )}
                  </div>

                  {(testOptions || testResults) && (
                    <div className="flex flex-col @xl:flex-row @xl:justify-end @xl:items-center gap-4 @xl:gap-2 @xl:min-w-0">
                      <div className="flex flex-col @xl:flex-row @xl:items-center gap-2">
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
                      <Button className="@xl:truncate" disabled={isRunningTests} onClick={generateCertificate}>
                        {certificated ? 'Certificated ✅' : 'Generate Certificate'}
                      </Button>
                    </div>
                  )}
                </div>
                {certificateError && (
                  <p className="m-0 -mt-2 text-xs text-red-600 @xl:text-right">{certificateError}</p>
                )}
              </>
            )}

            {(testOptions || testResults) && (
              <>
                <Panel title="Security Tests">
                  <TestsTable
                    columns={[
                      ...getTestsTableColumns(['Check', 'Expected', 'Actual']),
                      {
                        name: 'Result',
                        selector: (row) => row.status,
                        width: securityTests.find((test) =>
                          [TestStatus.Bug, TestStatus.Fail, TestStatus.Warning].includes(test.status),
                        )
                          ? '270px'
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
                </Panel>

                <Panel title="Performance Insights">
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
                          ? '325px'
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
                </Panel>

                <Panel title="Data-Driven Tests">
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
                </Panel>

                <Panel title="CRUD">
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
                </Panel>
              </>
            )}
          </>
        )}
      </div>
      <ConfirmationModal
        confirmText="Reload"
        description="Only current tests results will be lost"
        title="Reload"
        isOpen={openReloadModal}
        onClose={() => dispatch(uiActions.closeReloadModal())}
        onConfirm={() => window.location.reload()}
      />
      <ConfirmationModal
        cancelText="Close"
        confirmText="Review & Generate Tests"
        confirmType={ButtonType.PRIMARY}
        description="Rentgen now has a valid request to work with. Before generating tests, quickly review the mapped fields to make sure everything looks right"
        title="Request Looks Good!"
        isOpen={openSendHttpSuccessModal}
        onClose={() => dispatch(uiActions.closeSendHttpSuccessModal())}
        onConfirm={() => {
          parametersRef.current?.scrollIntoView({ behavior: 'smooth' });
          dispatch(uiActions.closeSendHttpSuccessModal());
        }}
      >
        <label className="flex items-center gap-1 text-xs">
          <input
            className="m-0"
            type="checkbox"
            onChange={(e) => localStorage.setItem('sendHttpSuccessModalDoNotShowAgain', e.target.checked.toString())}
          />
          Do not show again
        </label>
      </ConfirmationModal>
      <ConfirmationModal
        confirmText="Delete"
        description="Are you sure you want to delete this environment?"
        title="Delete Environment"
        isOpen={!!environmentToDelete}
        onClose={() => dispatch(environmentActions.setEnvironmentToDelete(null))}
        onConfirm={() => {
          if (environmentToDelete) handleDeleteEnvironment(environmentToDelete);

          dispatch(environmentActions.setEnvironmentToDelete(null));
        }}
      />
      <ConfirmationModal
        confirmText="Delete"
        description="This folder contains requests. Are you sure you want to delete it?"
        title="Delete Folder"
        isOpen={deleteFolderModal.isOpen}
        onClose={() => dispatch(uiActions.closeDeleteFolderModal())}
        onConfirm={confirmDeleteFolder}
      />
      <SetAsDynamicVariableModal />
      <ImportConflictModal />
    </div>
  );
}
