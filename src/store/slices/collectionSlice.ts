import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { PostmanCollection } from '../../types/postman';
import {
  createEmptyCollection,
  addRequestToCollection,
  updateRequestInCollection,
  removeRequestFromCollection,
  reorderRequestInCollection,
  addFolderToCollection,
  renameFolderInCollection,
  removeFolderFromCollection,
  reorderFolderInCollection,
  moveRequestToFolder,
} from '../../utils/collection';

interface CollectionState {
  data: PostmanCollection;
  selectedRequestId: string | null;
  selectedFolderId: string;
  loading: boolean;
  error: string | null;
}

const initialState: CollectionState = {
  data: createEmptyCollection(),
  selectedRequestId: null,
  selectedFolderId: 'default',
  loading: false,
  error: null,
};

export const loadCollection = createAsyncThunk('collection/load', async () => {
  return await window.electronAPI.loadCollection();
});

export const collectionSlice = createSlice({
  name: 'collection',
  initialState,
  reducers: {
    setCollection: (state, action: PayloadAction<PostmanCollection>) => {
      state.data = action.payload;
    },
    selectRequest: (state, action: PayloadAction<string | null>) => {
      state.selectedRequestId = action.payload;
    },
    selectFolder: (state, action: PayloadAction<string>) => {
      state.selectedFolderId = action.payload;
    },
    addRequest: (
      state,
      action: PayloadAction<{
        method: string;
        url: string;
        headers: Record<string, string>;
        body: string | null;
        folderId?: string;
      }>,
    ) => {
      const { method, url, headers, body, folderId } = action.payload;
      const targetFolderId = folderId || state.selectedFolderId;
      state.data = addRequestToCollection(state.data, method, url, headers, body, targetFolderId);

      // Auto-select the newly added request (it's at index 0 due to unshift in addRequestToCollection)
      const folder = state.data.item.find((f) => f.id === targetFolderId);
      if (folder && folder.item.length > 0) {
        state.selectedRequestId = folder.item[0].id;
      }
    },
    updateRequest: (
      state,
      action: PayloadAction<{
        requestId: string;
        method: string;
        url: string;
        headers: Record<string, string>;
        body: string | null;
      }>,
    ) => {
      const { requestId, method, url, headers, body } = action.payload;
      state.data = updateRequestInCollection(state.data, requestId, method, url, headers, body);
    },
    removeRequest: (state, action: PayloadAction<string>) => {
      state.data = removeRequestFromCollection(state.data, action.payload);
      if (state.selectedRequestId === action.payload) {
        state.selectedRequestId = null;
      }
    },
    reorderRequest: (state, action: PayloadAction<{ activeId: string; overId: string }>) => {
      const { activeId, overId } = action.payload;
      state.data = reorderRequestInCollection(state.data, activeId, overId);
    },
    moveRequest: (
      state,
      action: PayloadAction<{
        itemId: string;
        targetFolderId: string;
        targetIndex?: number;
      }>,
    ) => {
      const { itemId, targetFolderId, targetIndex } = action.payload;
      state.data = moveRequestToFolder(state.data, itemId, targetFolderId, targetIndex);
    },
    addFolder: (state, action: PayloadAction<string>) => {
      state.data = addFolderToCollection(state.data, action.payload);
    },
    renameFolder: (state, action: PayloadAction<{ folderId: string; newName: string }>) => {
      const { folderId, newName } = action.payload;
      state.data = renameFolderInCollection(state.data, folderId, newName);
    },
    removeFolder: (state, action: PayloadAction<string>) => {
      state.data = removeFolderFromCollection(state.data, action.payload);
    },
    reorderFolder: (state, action: PayloadAction<{ activeId: string; overId: string }>) => {
      const { activeId, overId } = action.payload;
      state.data = reorderFolderInCollection(state.data, activeId, overId);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadCollection.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadCollection.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
      })
      .addCase(loadCollection.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to load collection';
        state.loading = false;
      });
  },
});

export const collectionActions = collectionSlice.actions;
export default collectionSlice.reducer;
