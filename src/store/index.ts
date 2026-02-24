import { configureStore } from '@reduxjs/toolkit';
import collectionReducer from './slices/collectionSlice';
import collectionRunReducer from './slices/collectionRunSlice';
import historyReducer from './slices/historySlice';
import requestReducer from './slices/requestSlice';
import responseReducer from './slices/responseSlice';
import environmentReducer from './slices/environmentSlice';
import websocketReducer from './slices/websocketSlice';
import testReducer from './slices/testSlice';
import uiReducer from './slices/uiSlice';
import settingsReducer from './slices/settingsSlice';
import { electronMiddleware } from './middleware/electronMiddleware';

export const store = configureStore({
  reducer: {
    collection: collectionReducer,
    collectionRun: collectionRunReducer,
    environment: environmentReducer,
    history: historyReducer,
    request: requestReducer,
    response: responseReducer,
    settings: settingsReducer,
    tests: testReducer,
    websocket: websocketReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore File objects in protoFile
        ignoredActions: ['request/setProtoFile'],
        ignoredPaths: ['request.protoFile'],
      },
    }).concat(electronMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
