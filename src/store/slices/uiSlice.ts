import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PostmanCollection } from '../../types';

type ReportFormat = 'json' | 'md' | 'csv';
type SidebarTab = 'collections' | 'environments' | 'history' | null;

export interface ImportConflict {
  type: 'collection' | 'folder' | 'request';
  existingName: string;
  importedName: string;
  folderId?: string;
  folderName?: string;
  requestMethod?: string;
  requestUrl?: string;
}

export interface ImportConflictSummary {
  hasConflicts: boolean;
  collectionNameMatch: boolean;
  folderConflicts: ImportConflict[];
  requestConflicts: ImportConflict[];
}

interface ImportConflictModalState {
  isOpen: boolean;
  importedCollection: PostmanCollection | null;
  conflictSummary: ImportConflictSummary | null;
  warnings: string[];
}

interface SetAsDynamicVariableModalState {
  isOpen: boolean;
  initialSelector: string;
  initialValue: string;
  collectionId: string;
  requestId: string;
  collectionName: string;
  requestName: string;
  editingVariableId: string | null;
  editingVariableName: string | null;
  source: 'body' | 'header';
}

interface UIState {
  // Modal states
  openCurlModal: boolean;
  openReloadModal: boolean;
  openSendHttpSuccessModal: boolean;
  openSettingsModal: boolean;
  deleteFolderModal: {
    isOpen: boolean;
    folderId: string | null;
  };
  importConflictModal: ImportConflictModalState;
  setAsDynamicVariableModal: SetAsDynamicVariableModalState;

  // Feedback states
  saved: boolean;
  exported: boolean;

  // Certificate
  certificated: boolean;
  certificateError: string;

  // cURL import
  curl: string;
  curlError: string;

  // Export
  exportFormat: ReportFormat;

  // Sidebar
  sidebarActiveTab: SidebarTab;
}

const initialState: UIState = {
  openCurlModal: false,
  openReloadModal: false,
  openSendHttpSuccessModal: false,
  deleteFolderModal: { isOpen: false, folderId: null },
  importConflictModal: {
    isOpen: false,
    importedCollection: null,
    conflictSummary: null,
    warnings: [],
  },
  setAsDynamicVariableModal: {
    isOpen: false,
    initialSelector: '',
    initialValue: '',
    collectionId: '',
    requestId: '',
    collectionName: '',
    requestName: '',
    editingVariableId: null,
    editingVariableName: null,
    source: 'body',
  },
  openSettingsModal: false,
  saved: false,
  exported: false,
  certificated: false,
  certificateError: '',
  curl: '',
  curlError: '',
  exportFormat: 'json',
  sidebarActiveTab: null,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Modals
    openCurlModal: (state) => {
      state.openCurlModal = true;
    },
    closeCurlModal: (state) => {
      state.openCurlModal = false;
      state.curl = '';
      state.curlError = '';
    },
    openReloadModal: (state) => {
      state.openReloadModal = true;
    },
    closeReloadModal: (state) => {
      state.openReloadModal = false;
    },
    openSendHttpSuccessModal: (state) => {
      const stored = localStorage.getItem('sendHttpSuccessModalDoNotShowAgain');
      state.openSendHttpSuccessModal = stored === null ? true : stored !== 'true';
    },
    closeSendHttpSuccessModal: (state) => {
      state.openSendHttpSuccessModal = false;
    },
    openDeleteFolderModal: (state, action: PayloadAction<string>) => {
      state.deleteFolderModal = { isOpen: true, folderId: action.payload };
    },
    closeDeleteFolderModal: (state) => {
      state.deleteFolderModal = { isOpen: false, folderId: null };
    },
    openImportConflictModal: (
      state,
      action: PayloadAction<{
        collection: PostmanCollection;
        conflictSummary: ImportConflictSummary;
        warnings: string[];
      }>,
    ) => {
      state.importConflictModal = {
        isOpen: true,
        importedCollection: action.payload.collection,
        conflictSummary: action.payload.conflictSummary,
        warnings: action.payload.warnings,
      };
    },
    closeImportConflictModal: (state) => {
      state.importConflictModal = {
        isOpen: false,
        importedCollection: null,
        conflictSummary: null,
        warnings: [],
      };
    },
    openSetAsDynamicVariableModal: (state, action: PayloadAction<Omit<SetAsDynamicVariableModalState, 'isOpen'>>) => {
      state.setAsDynamicVariableModal = { ...action.payload, isOpen: true };
    },
    closeSetAsDynamicVariableModal: (state) => {
      state.setAsDynamicVariableModal = {
        isOpen: false,
        initialSelector: '',
        initialValue: '',
        collectionId: '',
        requestId: '',
        collectionName: '',
        requestName: '',
        editingVariableId: null,
        editingVariableName: null,
        source: 'body',
      };
    },
    openSettingsModal: (state) => {
      state.openSettingsModal = true;
    },
    closeSettingsModal: (state) => {
      state.openSettingsModal = false;
    },

    // cURL
    setCurl: (state, action: PayloadAction<string>) => {
      state.curl = action.payload;
    },
    setCurlError: (state, action: PayloadAction<string>) => {
      state.curlError = action.payload;
    },

    // Feedback
    setSaved: (state, action: PayloadAction<boolean>) => {
      state.saved = action.payload;
    },
    setExported: (state, action: PayloadAction<boolean>) => {
      state.exported = action.payload;
    },

    // Certificate
    setCertificated: (state, action: PayloadAction<boolean>) => {
      state.certificated = action.payload;
    },
    setCertificateError: (state, action: PayloadAction<string>) => {
      state.certificateError = action.payload;
    },

    // Export format
    setExportFormat: (state, action: PayloadAction<ReportFormat>) => {
      state.exportFormat = action.payload;
    },

    // Sidebar
    setSidebarActiveTab: (state, action: PayloadAction<SidebarTab>) => {
      state.sidebarActiveTab = action.payload;
    },
    toggleSidebarTab: (state, action: PayloadAction<'collections' | 'environments' | 'history'>) => {
      state.sidebarActiveTab = state.sidebarActiveTab === action.payload ? null : action.payload;
    },
  },
});

export const uiActions = uiSlice.actions;
export default uiSlice.reducer;
