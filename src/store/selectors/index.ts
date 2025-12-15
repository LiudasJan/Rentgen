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
export const selectTestsCount = (state: RootState) => state.tests.testsCount;

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

// UI selectors
export const selectOpenCurlModal = (state: RootState) => state.ui.openCurlModal;
export const selectOpenReloadModal = (state: RootState) => state.ui.openReloadModal;
export const selectDeleteFolderModal = (state: RootState) => state.ui.deleteFolderModal;
export const selectSaved = (state: RootState) => state.ui.saved;
export const selectExported = (state: RootState) => state.ui.exported;
export const selectCurl = (state: RootState) => state.ui.curl;
export const selectCurlError = (state: RootState) => state.ui.curlError;
export const selectExportFormat = (state: RootState) => state.ui.exportFormat;
export const selectSidebarActiveTab = (state: RootState) => state.ui.sidebarActiveTab;

// Collection Run selectors
export const selectRunningFolderId = (state: RootState) => state.collectionRun.runningFolderId;
export const selectCollectionRunResults = (state: RootState) => state.collectionRun.results;
