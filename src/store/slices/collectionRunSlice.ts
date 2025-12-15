import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { HttpResponse } from '../../types';

export interface CollectionRunResult {
  requestId: string;
  success: boolean;
  response: HttpResponse | null;
  error: string | null;
}

interface CollectionRunState {
  runningFolderId: string | null;
  currentRequestIndex: number;
  totalRequests: number;
  results: Record<string, CollectionRunResult>;
}

const initialState: CollectionRunState = {
  runningFolderId: null,
  currentRequestIndex: 0,
  totalRequests: 0,
  results: {},
};

export const collectionRunSlice = createSlice({
  name: 'collectionRun',
  initialState,
  reducers: {
    startRun: (state, action: PayloadAction<{ folderId: string; totalRequests: number }>) => {
      state.runningFolderId = action.payload.folderId;
      state.totalRequests = action.payload.totalRequests;
      state.currentRequestIndex = 0;
    },
    setProgress: (state, action: PayloadAction<number>) => {
      state.currentRequestIndex = action.payload;
    },
    addResult: (state, action: PayloadAction<CollectionRunResult>) => {
      state.results[action.payload.requestId] = action.payload;
    },
    finishRun: (state) => {
      state.runningFolderId = null;
      state.currentRequestIndex = 0;
      state.totalRequests = 0;
    },
    cancelRun: (state) => {
      state.runningFolderId = null;
      state.currentRequestIndex = 0;
      state.totalRequests = 0;
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
