import { useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { selectCollectionData, selectDynamicVariables, selectSelectedEnvironment } from '../store/selectors';
import { collectionRunActions } from '../store/slices/collectionRunSlice';
import { environmentActions } from '../store/slices/environmentSlice';
import { DynamicVariable, HttpResponse, PostmanItem } from '../types';
import {
  createHttpRequest,
  detectDataType,
  extractBodyParameters,
  extractQueryParameters,
  extractStatusCode,
  getInitialParameterValue,
  parseBody,
  parseHeaders,
  substituteRequestVariables,
} from '../utils';
import { findRequestById, headersRecordToString, postmanHeadersToRecord } from '../utils/collection';
import { extractDynamicVariableFromResponse } from '../utils/dynamicVariable';

export function useCollectionRunner() {
  const dispatch = useAppDispatch();
  const collection = useAppSelector(selectCollectionData);
  const selectedEnvironment = useAppSelector(selectSelectedEnvironment);
  const dynamicVariables = useAppSelector(selectDynamicVariables);
  const dynamicVariablesRef = useRef<DynamicVariable[]>(dynamicVariables);
  dynamicVariablesRef.current = dynamicVariables;
  const cancelRef = useRef(false);

  const runFolder = useCallback(
    async (folderId: string) => {
      const folder = collection.item.find((f) => f.id === folderId);
      if (!folder || folder.item.length === 0) return;

      cancelRef.current = false;

      // Clear previous results for this folder's requests
      const requestIds = folder.item.map((item) => item.id);
      dispatch(collectionRunActions.clearFolderResults(requestIds));

      // Start the run
      dispatch(
        collectionRunActions.startRun({
          folderId,
          totalRequests: folder.item.length,
        }),
      );

      // Execute requests sequentially
      for (let i = 0; i < folder.item.length; i++) {
        if (cancelRef.current) break;

        await executeRequest(folder.item[i]);
      }

      dispatch(collectionRunActions.finishRun());
    },
    [collection, selectedEnvironment, dispatch],
  );

  const runRequest = useCallback(
    async (requestId: string) => {
      const item = findRequestById(collection, requestId);
      if (!item) return;

      dispatch(collectionRunActions.clearFolderResults([item.id]));
      await executeRequest(item);
      dispatch(collectionRunActions.finishRequestRun());
    },
    [collection],
  );

  const executeRequest = useCallback(
    async (item: PostmanItem) => {
      dispatch(collectionRunActions.startRequestRun(item.id));

      try {
        const { request } = item;
        const headers = postmanHeadersToRecord(request.header);
        const headersString = headersRecordToString(headers);
        const body = request.body?.raw || '';

        // Apply environment variable substitution (including dynamic variables)
        const substituted = substituteRequestVariables(
          request.url,
          headersString,
          body,
          '', // messageType - not stored in collection
          selectedEnvironment,
          dynamicVariablesRef.current,
        );

        const parsedHeaders = parseHeaders(substituted.headers);
        const parsedBody = parseBody(substituted.body, parsedHeaders, '', null);
        const httpRequest = createHttpRequest(parsedBody, parsedHeaders, request.method, substituted.url);
        const response: HttpResponse = await window.electronAPI.sendHttp(httpRequest);
        const status = extractStatusCode(response);

        let bodyParameters = {};
        let queryParameters = {};

        if (status >= 200 && status < 300) {
          bodyParameters = extractBodyParameters(parsedBody, parsedHeaders);
          queryParameters = Object.fromEntries(
            Object.entries(extractQueryParameters(request.url)).map(([key, value]) => [
              key,
              getInitialParameterValue(detectDataType(value), value),
            ]),
          );
        }

        dispatch(
          collectionRunActions.addResult({
            requestId: item.id,
            status,
            response,
            bodyParameters,
            queryParameters,
            error: null,
          }),
        );

        // Extract and update dynamic variables for this request
        const requestDynamicVars = dynamicVariablesRef.current.filter((dv) => dv.requestId === item.id);

        for (const dvar of requestDynamicVars) {
          const extractedValue = extractDynamicVariableFromResponse(dvar, response);

          if (extractedValue !== null) {
            dispatch(
              environmentActions.updateDynamicVariableValue({
                id: dvar.id,
                value: extractedValue,
              }),
            );
          }
        }
      } catch (error) {
        dispatch(
          collectionRunActions.addResult({
            requestId: item.id,
            status: null,
            response: null,
            bodyParameters: {},
            queryParameters: {},
            error: String(error),
          }),
        );
      }
    },
    [selectedEnvironment, dispatch],
  );

  const cancelRun = useCallback(() => {
    cancelRef.current = true;
    dispatch(collectionRunActions.cancelRun());
  }, [dispatch]);

  return { runFolder, runRequest, cancelRun };
}
