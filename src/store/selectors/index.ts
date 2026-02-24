import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { collectionToGroupedSidebarData } from '../../utils/collection';
import { extractStatusCode } from '../../utils';
import { RESPONSE_STATUS } from '../../constants/responseStatus';

// Collection selectors
export const selectCollectionData = (state: RootState) => state.collection.data;
export const selectSelectedRequestId = (state: RootState) => state.collection.selectedRequestId;
export const selectSelectedFolderId = (state: RootState) => state.collection.selectedFolderId;

export const selectSidebarFolders = createSelector([selectCollectionData], (collection) =>
  collectionToGroupedSidebarData(collection),
);

// Environment selectors
export const selectEnvironments = (state: RootState) => state.environment.environments;
export const selectSelectedEnvironmentId = (state: RootState) => state.environment.selectedEnvironmentId;
export const selectIsEditingEnvironment = (state: RootState) => state.environment.isEditing;
export const selectEditingEnvironmentId = (state: RootState) => state.environment.editingEnvironmentId;
export const selectEnvironmentToDelete = (state: RootState) => state.environment.environmentToDelete;

export const selectSelectedEnvironment = createSelector(
  [selectEnvironments, selectSelectedEnvironmentId],
  (environments, selectedId) => environments.find((env) => env.id === selectedId) || null,
);

// Dynamic variables selectors
export const selectDynamicVariables = (state: RootState) => state.environment.dynamicVariables;

export const selectDynamicVariablesForEnvironment = createSelector(
  [selectDynamicVariables, (_: RootState, envId: string | null) => envId],
  (dynamicVariables, envId) => dynamicVariables.filter((dv) => dv.environmentId === null || dv.environmentId === envId),
);

export const selectDynamicVariablesByRequest = createSelector(
  [selectDynamicVariables, (_: RootState, requestId: string) => requestId],
  (dynamicVariables, requestId) => dynamicVariables.filter((dv) => dv.requestId === requestId),
);

export const selectVariableNameExists = createSelector(
  [
    selectEnvironments,
    selectDynamicVariables,
    (_: RootState, name: string) => name,
    (_: RootState, _name: string, envId: string | null) => envId,
  ],
  (environments, dynamicVariables, name, envId) => {
    // Check static variables
    const staticExists = environments.some((env) => {
      if (envId !== null && env.id !== envId) return false;
      return env.variables.some((v) => v.key === name);
    });

    // Check dynamic variables
    const dynamicExists = dynamicVariables.some((dv) => {
      if (envId !== null && dv.environmentId !== null && dv.environmentId !== envId) return false;
      return dv.key === name;
    });

    return staticExists || dynamicExists;
  },
);

// Request selectors
export const selectMode = (state: RootState) => state.request.mode;
export const selectMethod = (state: RootState) => state.request.method;
export const selectUrl = (state: RootState) => state.request.url;
export const selectHeaders = (state: RootState) => state.request.headers;
export const selectBody = (state: RootState) => state.request.body;
export const selectBodyParameters = (state: RootState) => state.request.bodyParameters;
export const selectQueryParameters = (state: RootState) => state.request.queryParameters;
export const selectProtoFile = (state: RootState) => state.request.protoFile;
export const selectMessageType = (state: RootState) => state.request.messageType;

// Response selectors
export const selectHttpResponse = (state: RootState) => state.response.httpResponse;

export const selectStatusCode = createSelector([selectHttpResponse], (response) => extractStatusCode(response));

// WebSocket selectors
export const selectWssConnected = (state: RootState) => state.websocket.connected;
export const selectWssMessages = (state: RootState) => state.websocket.messages;

// Test selectors
export const selectTestOptions = (state: RootState) => state.tests.testOptions;
export const selectCrudTests = (state: RootState) => state.tests.crudTests;
export const selectDataDrivenTests = (state: RootState) => state.tests.dataDrivenTests;
export const selectPerformanceTests = (state: RootState) => state.tests.performanceTests;
export const selectSecurityTests = (state: RootState) => state.tests.securityTests;
export const selectCurrentTest = (state: RootState) => state.tests.currentTest;
export const selectTestsCount = (state: RootState) => state.tests.count;
export const selectTestsDomain = (state: RootState) => state.tests.domain;
export const selectTestsTimestamp = (state: RootState) => state.tests.timestamp;

export const selectIsSecurityRunning = (state: RootState) => state.tests.isSecurityRunning;
export const selectIsPerformanceRunning = (state: RootState) => state.tests.isPerformanceRunning;
export const selectIsDataDrivenRunning = (state: RootState) => state.tests.isDataDrivenRunning;
export const selectIsLoadTestRunning = (state: RootState) => state.tests.isLoadTestRunning;
export const selectIsLargePayloadTestRunning = (state: RootState) => state.tests.isLargePayloadTestRunning;

export const selectIsRunningTests = createSelector(
  [selectIsSecurityRunning, selectIsPerformanceRunning, selectIsDataDrivenRunning],
  (isSecurityRunning, isPerformanceRunning, isDataDrivenRunning) =>
    isSecurityRunning || isPerformanceRunning || isDataDrivenRunning,
);

export const selectDisabledRunTests = createSelector(
  [selectIsRunningTests, selectHttpResponse, selectStatusCode],
  (isRunning, response, statusCode) =>
    isRunning || !response || statusCode < RESPONSE_STATUS.OK || statusCode >= RESPONSE_STATUS.BAD_REQUEST,
);

export const selectAllTestResults = (state: RootState) => state.tests.results;
export const selectRequestTestResults = (requestId: string) =>
  createSelector([selectAllTestResults], (results) => results[requestId] || null);

export const selectCompareResponse = (state: RootState) => state.tests.compareResponse;
export const selectIsComparingTestResults = (state: RootState) => state.tests.isComparing;
export const selectTestResultsToCompare = (state: RootState) => state.tests.resultsToCompare;

// UI selectors
export const selectOpenCurlModal = (state: RootState) => state.ui.openCurlModal;
export const selectOpenReloadModal = (state: RootState) => state.ui.openReloadModal;
export const selectOpenSendHttpSuccessModal = (state: RootState) => state.ui.openSendHttpSuccessModal;
export const selectOpenSettingsModal = (state: RootState) => state.ui.openSettingsModal;
export const selectDeleteFolderModal = (state: RootState) => state.ui.deleteFolderModal;
export const selectSaved = (state: RootState) => state.ui.saved;
export const selectExported = (state: RootState) => state.ui.exported;
export const selectCertificated = (state: RootState) => state.ui.certificated;
export const selectCurl = (state: RootState) => state.ui.curl;
export const selectCurlError = (state: RootState) => state.ui.curlError;
export const selectExportFormat = (state: RootState) => state.ui.exportFormat;
export const selectSidebarActiveTab = (state: RootState) => state.ui.sidebarActiveTab;
export const selectCertificateError = (state: RootState) => state.ui.certificateError;

// History selectors
export const selectHistoryEntries = (state: RootState) => state.history.entries;

// Collection Run selectors
export const selectRunningFolderId = (state: RootState) => state.collectionRun.runningFolderId;
export const selectRunningRequestId = (state: RootState) => state.collectionRun.runningRequestId;
export const selectCollectionRunResults = (state: RootState) => state.collectionRun.results;
export const selectImportConflictModal = (state: RootState) => state.ui.importConflictModal;
export const selectSetAsDynamicVariableModal = (state: RootState) => state.ui.setAsDynamicVariableModal;

// Settings selectors
export const selectDisabledSecurityTests = (state: RootState) => state.settings.general.securityTests;
export const selectTheme = (state: RootState) => state.settings.theme;
