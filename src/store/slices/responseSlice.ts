import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { HttpRequest, HttpResponse } from '../../types';

interface ResponseState {
  httpResponse: HttpResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: ResponseState = {
  httpResponse: null,
  loading: false,
  error: null,
};

export const sendHttpRequest = createAsyncThunk(
  'response/sendHttp',
  async (request: HttpRequest, { rejectWithValue }) => {
    try {
      const response = await window.electronAPI.sendHttp(request);
      return response;
    } catch (error) {
      return rejectWithValue(String(error));
    }
  },
);

export const responseSlice = createSlice({
  name: 'response',
  initialState,
  reducers: {
    clearResponse: (state) => {
      state.httpResponse = null;
      state.error = null;
    },
    setResponse: (state, action: PayloadAction<HttpResponse>) => {
      state.httpResponse = action.payload;
      state.loading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setSendingState: (state) => {
      state.loading = true;
      state.httpResponse = {
        status: 'Sending...',
        body: '',
        headers: {},
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendHttpRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.httpResponse = {
          status: 'Sending...',
          body: '',
          headers: {},
        };
      })
      .addCase(sendHttpRequest.fulfilled, (state, action) => {
        state.httpResponse = action.payload;
        state.loading = false;
      })
      .addCase(sendHttpRequest.rejected, (state, action) => {
        state.httpResponse = {
          status: 'Network Error',
          body: String(action.payload || action.error.message),
          headers: {},
        };
        state.loading = false;
        state.error = String(action.payload || action.error.message);
      });
  },
});

export const responseActions = responseSlice.actions;
export default responseSlice.reducer;
