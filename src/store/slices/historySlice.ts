import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { HistoryEntry } from '../../types/history';

function getRetentionCutoff(retention: string): number | null {
  const now = Date.now();
  const durations: Record<string, number> = {
    '1w': 7 * 24 * 60 * 60 * 1000,
    '1m': 30 * 24 * 60 * 60 * 1000,
    '3m': 90 * 24 * 60 * 60 * 1000,
    '6m': 180 * 24 * 60 * 60 * 1000,
    '1y': 365 * 24 * 60 * 60 * 1000,
  };
  if (retention === 'none' || !durations[retention]) return null;
  return now - durations[retention];
}

interface HistoryState {
  entries: HistoryEntry[];
  loading: boolean;
  error: string | null;
}

const initialState: HistoryState = {
  entries: [],
  loading: false,
  error: null,
};

export const loadHistory = createAsyncThunk('history/load', async () => {
  return await window.electronAPI.loadHistory();
});

export const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    addEntry: (state, action: PayloadAction<HistoryEntry>) => {
      state.entries.unshift(action.payload);
    },
    removeEntry: (state, action: PayloadAction<string>) => {
      state.entries = state.entries.filter((entry) => entry.id !== action.payload);
    },
    clearHistory: (state) => {
      state.entries = [];
    },
    enforceRetention: (state, action: PayloadAction<{ maxSize: number; retention: string }>) => {
      const { maxSize, retention } = action.payload;
      const cutoff = getRetentionCutoff(retention);
      if (cutoff !== null) {
        state.entries = state.entries.filter((entry) => entry.timestamp >= cutoff);
      }
      if (state.entries.length > maxSize) {
        state.entries = state.entries.slice(0, maxSize);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadHistory.fulfilled, (state, action) => {
        state.entries = action.payload;
        state.loading = false;
      })
      .addCase(loadHistory.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to load history';
        state.loading = false;
      });
  },
});

export const historyActions = historySlice.actions;
export default historySlice.reducer;
