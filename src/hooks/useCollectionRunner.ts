import { useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { collectionRunActions } from '../store/slices/collectionRunSlice';
import { selectCollectionData, selectSelectedEnvironment } from '../store/selectors';
import { createHttpRequest, parseHeaders, parseBody, substituteRequestVariables } from '../utils';
import { postmanHeadersToRecord, headersRecordToString } from '../utils/collection';
import { HttpResponse } from '../types';

export function useCollectionRunner() {
  const dispatch = useAppDispatch();
  const collection = useAppSelector(selectCollectionData);
  const selectedEnvironment = useAppSelector(selectSelectedEnvironment);
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

        const item = folder.item[i];
        dispatch(collectionRunActions.setProgress(i + 1));

        try {
          // Get request data from PostmanItem
          const { request } = item;
          const headers = postmanHeadersToRecord(request.header);
          const headersString = headersRecordToString(headers);
          const body = request.body?.raw || '';

          // Apply environment variable substitution
          const substituted = substituteRequestVariables(
            request.url,
            headersString,
            body,
            '', // messageType - not stored in collection
            selectedEnvironment,
          );

          const parsedHeaders = parseHeaders(substituted.headers);
          const parsedBody = parseBody(substituted.body, parsedHeaders, '', null);
          const httpRequest = createHttpRequest(parsedBody, parsedHeaders, request.method, substituted.url);

          // Execute request
          const response: HttpResponse = await window.electronAPI.sendHttp(httpRequest);

          // Determine success (2xx status)
          const statusCode = parseInt(response.status.split(' ')[0] || '0', 10);
          const success = statusCode >= 200 && statusCode < 300;

          dispatch(
            collectionRunActions.addResult({
              requestId: item.id,
              success,
              response,
              error: null,
            }),
          );
        } catch (error) {
          dispatch(
            collectionRunActions.addResult({
              requestId: item.id,
              success: false,
              response: null,
              error: String(error),
            }),
          );
        }
      }

      dispatch(collectionRunActions.finishRun());
    },
    [collection, selectedEnvironment, dispatch],
  );

  const cancelRun = useCallback(() => {
    cancelRef.current = true;
    dispatch(collectionRunActions.cancelRun());
  }, [dispatch]);

  return { runFolder, cancelRun };
}
