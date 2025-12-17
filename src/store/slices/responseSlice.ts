import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { HttpRequest, HttpResponse } from '../../types';

interface ResponseState {
  httpResponse: HttpResponse | null;
}

const initialState: ResponseState = {
  httpResponse: null,
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
    },
    setResponse: (state, action: PayloadAction<HttpResponse>) => {
      state.httpResponse = action.payload;
    },
    setSendingState: (state) => {
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
        state.httpResponse = {
          status: 'Sending...',
          body: '',
          headers: {},
        };
      })
      .addCase(sendHttpRequest.fulfilled, (state, action) => {
        state.httpResponse = action.payload;
      })
      .addCase(sendHttpRequest.rejected, (state, action) => {
        state.httpResponse = {
          status: 'Network Error',
          body: String(action.payload || action.error.message),
          headers: {},
        };
      });
  },
});

export const responseActions = responseSlice.actions;
export default responseSlice.reducer;
