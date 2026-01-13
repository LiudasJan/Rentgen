import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { HttpResponse } from '../../types';

interface ResponseState {
  httpResponse: HttpResponse | null;
}

const initialState: ResponseState = {
  httpResponse: null,
};

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
});

export const responseActions = responseSlice.actions;
export default responseSlice.reducer;
