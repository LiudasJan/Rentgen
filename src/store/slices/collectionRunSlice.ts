import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { HttpResponse, RequestParameters } from '../../types';

export interface CollectionRunResult {
  requestId: string;
  status: number;
  response: HttpResponse | null;
  bodyParameters: RequestParameters | null;
  queryParameters: RequestParameters | null;
  error: string | null;
}

interface CollectionRunState {
  runningFolderId: string | null;
  runningRequestId: string;
  results: Record<string, CollectionRunResult>;
}

const initialState: CollectionRunState = {
  runningFolderId: null,
  runningRequestId: null,
  results: {},
};

export const collectionRunSlice = createSlice({
  name: 'collectionRun',
  initialState,
  reducers: {
    startRun: (state, action: PayloadAction<{ folderId: string; totalRequests: number }>) => {
      state.runningFolderId = action.payload.folderId;
    },
    startRequestRun: (state, action: PayloadAction<string>) => {
      state.runningRequestId = action.payload;
    },
    addResult: (state, action: PayloadAction<CollectionRunResult>) => {
      state.results[action.payload.requestId] = action.payload;
    },
    finishRun: (state) => {
      state.runningFolderId = null;
      state.runningRequestId = null;
    },
    finishRequestRun: (state) => {
      state.runningRequestId = null;
    },
    cancelRun: (state) => {
      state.runningFolderId = null;
      state.runningRequestId = null;
    },
    clearFolderResults: (state, action: PayloadAction<string[]>) => {
      // action.payload is array of requestIds to clear
      action.payload.forEach((requestId) => {
        delete state.results[requestId];
      });
    },
    clearAllResults: (state) => {
      state.results = {};
    },
  },
});

export const collectionRunActions = collectionRunSlice.actions;
export default collectionRunSlice.reducer;
