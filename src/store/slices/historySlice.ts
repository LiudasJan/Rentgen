import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { HistoryEntry } from '../../types/history';

const MAX_ENTRIES = 500;

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
      if (state.entries.length > MAX_ENTRIES) {
        state.entries = state.entries.slice(0, MAX_ENTRIES);
      }
    },
    removeEntry: (state, action: PayloadAction<string>) => {
      state.entries = state.entries.filter((entry) => entry.id !== action.payload);
    },
    clearHistory: (state) => {
      state.entries = [];
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
