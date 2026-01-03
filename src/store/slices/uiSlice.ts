import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type ReportFormat = 'json' | 'md' | 'csv';
type SidebarTab = 'collections' | 'environments' | null;

interface SetAsVariableModalState {
  isOpen: boolean;
  initialValue: string;
}

interface SetAsDynamicVariableModalState {
  isOpen: boolean;
  initialSelector: string;
  initialValue: string;
  source: 'body' | 'header';
  collectionId: string;
  requestId: string;
  collectionName: string;
  requestName: string;
  editingVariableId: string | null;
  editingVariableName: string | null;
}

interface UIState {
  // Modal states
  openCurlModal: boolean;
  openReloadModal: boolean;
  deleteFolderModal: {
    isOpen: boolean;
    folderId: string | null;
  };
  setAsVariableModal: SetAsVariableModalState;
  setAsDynamicVariableModal: SetAsDynamicVariableModalState;

  // Feedback states
  saved: boolean;
  exported: boolean;

  // cURL import
  curl: string;
  curlError: string;

  // Export
  exportFormat: ReportFormat;

  // Sidebar
  sidebarActiveTab: SidebarTab;

  // Theme
  theme: 'light' | 'dark';
}

const initialState: UIState = {
  openCurlModal: false,
  openReloadModal: false,
  deleteFolderModal: { isOpen: false, folderId: null },
  setAsVariableModal: { isOpen: false, initialValue: '' },
  setAsDynamicVariableModal: {
    isOpen: false,
    initialSelector: '',
    initialValue: '',
    source: 'body',
    collectionId: '',
    requestId: '',
    collectionName: '',
    requestName: '',
    editingVariableId: null,
    editingVariableName: null,
  },
  saved: false,
  exported: false,
  curl: '',
  curlError: '',
  exportFormat: 'json',
  sidebarActiveTab: null,
  theme: 'light',
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
    openDeleteFolderModal: (state, action: PayloadAction<string>) => {
      state.deleteFolderModal = { isOpen: true, folderId: action.payload };
    },
    closeDeleteFolderModal: (state) => {
      state.deleteFolderModal = { isOpen: false, folderId: null };
    },
    openSetAsVariableModal: (state, action: PayloadAction<string>) => {
      state.setAsVariableModal = { isOpen: true, initialValue: action.payload };
    },
    closeSetAsVariableModal: (state) => {
      state.setAsVariableModal = { isOpen: false, initialValue: '' };
    },
    openSetAsDynamicVariableModal: (state, action: PayloadAction<Omit<SetAsDynamicVariableModalState, 'isOpen'>>) => {
      state.setAsDynamicVariableModal = { ...action.payload, isOpen: true };
    },
    closeSetAsDynamicVariableModal: (state) => {
      state.setAsDynamicVariableModal = {
        isOpen: false,
        initialSelector: '',
        initialValue: '',
        source: 'body',
        collectionId: '',
        requestId: '',
        collectionName: '',
        requestName: '',
        editingVariableId: null,
        editingVariableName: null,
      };
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

    // Export format
    setExportFormat: (state, action: PayloadAction<ReportFormat>) => {
      state.exportFormat = action.payload;
    },

    // Sidebar
    setSidebarActiveTab: (state, action: PayloadAction<SidebarTab>) => {
      state.sidebarActiveTab = action.payload;
    },
    toggleSidebarTab: (state, action: PayloadAction<'collections' | 'environments'>) => {
      state.sidebarActiveTab = state.sidebarActiveTab === action.payload ? null : action.payload;
    },

    // Theme
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
  },
});

export const uiActions = uiSlice.actions;
export default uiSlice.reducer;
