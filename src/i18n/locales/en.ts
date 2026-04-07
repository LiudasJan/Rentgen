const en = {
  // Common
  common: {
    send: 'Send',
    save: 'Save',
    saved: 'Saved ✅',
    cancel: 'Cancel',
    close: 'Close',
    ok: 'OK',
    create: 'Create',
    delete: 'Delete',
    import: 'Import',
    export: 'Export',
    copy: 'Copy',
    copied: 'Copied ✅',
    run: 'Run',
    replace: 'Replace',
    merge: 'Merge',
    overwrite: 'Overwrite',
    enabled: 'Enabled',
    disabled: 'Disabled',
    warning: 'Warning:',
    connect: 'Connect',
    disconnect: 'Disconnect',
    beautify: 'Beautify',
    reload: 'Reload',
    cut: 'Cut',
    paste: 'Paste',
  },

  // Sidebar
  sidebar: {
    collections: 'Collections',
    environments: 'Environments',
    history: 'History',
    settings: 'Settings',
    checkForUpdates: 'Check for updates',
    reportFeedback: 'Report feedback',
  },

  // Collections Panel
  collections: {
    newFolder: 'New Folder',
    importCollection: 'Import Collection',
    exportCollection: 'Export Collection',
    searchCollections: 'Search collections...',
    noMatchingRequests: 'No matching requests',
    noSavedRequests: 'No saved requests',
    importFailed: 'Import failed: {{error}}',
    exportFailed: 'Export failed: {{error}}',
    importedWithWarnings: 'Imported with {{count}} warning(s)',
    collectionImported: 'Collection imported',
    collectionExported: 'Collection exported',
  },

  // Environment
  environment: {
    newEnvironment: 'New Environment',
    editEnvironment: 'Edit Environment',
    noEnvironmentsCreated: 'No environments created',
    environmentName: 'Environment Name',
    environmentNamePlaceholder: 'e.g., Production, Staging, Local',
    color: 'Color',
    variables: 'Variables',
    variableName: 'Variable Name',
    addVariable: 'Add variable',
    value: 'Value',
    refreshValue: 'Refresh value',
    refreshAll: 'Refresh All',
    noEnvironment: 'No Environment',
    selectEnvironment: 'Select Environment',
    randomEmail: 'Random email',
    randomInteger: 'Random integer',
    randomString: 'Random string',
    deleteEnvironmentConfirm: 'Are you sure you want to delete this environment?',
    deleteEnvironment: 'Delete Environment',
  },

  // History
  history: {
    title: 'History',
    clearAll: 'Clear All',
    searchHistory: 'Search history...',
    noMatchingHistory: 'No matching history',
    noHistoryYet: 'No history yet',
    today: 'Today',
    yesterday: 'Yesterday',
  },

  // Request
  request: {
    enterUrl: 'Enter URL or paste text',
    headers: 'Headers',
    headersPlaceholder: 'Header-Key: value',
    body: 'Body',
    bodyPlaceholderHttp: 'Enter request body (JSON or Form Data)',
    bodyPlaceholderWss: 'Message body',
    protobufSchema: 'Protobuf Schema & Message Type',
    protobufDescription: 'Experimental and optional section. If used, both fields must be completed',
    messageTypePlaceholder: 'Message type (e.g. mypackage.MyMessage)',
    protoSchemaLoaded: '🟢 Proto schema loaded',
    protoSchemaParseFailed: '🔴 Failed to parse proto: ',
    wssUrlRequired: '🔴 Please use ws:// or wss:// URL',
  },

  // Response
  response: {
    title: 'Response',
    sending: 'Sending...',
    networkError: 'Network Error',
  },

  // cURL
  curl: {
    importCurl: 'Import cURL',
    importCurlPlaceholder: 'Enter cURL or paste text',
    invalidCurl: 'The cURL command you provided appears to be invalid. Please check it and try again',
    copyCurl: 'Copy cURL',
  },

  // Tests
  tests: {
    generateAndRun: 'Generate & Run Tests',
    runningTests: 'Running tests... ({{current}}/{{total}})',
    selectForCompare: 'Select for Compare',
    compareWithSelected: 'Compare with Selected',
    exportFormat: 'Format',
    exported: 'Exported ✅',
    generateCertificate: 'Generate Certificate',
    certificated: 'Certificated ✅',
    notEligible: 'Not eligible (need at least 70 tests)',
    securityTests: 'Security Tests',
    performanceInsights: 'Performance Insights',
    dataDrivenTests: 'Data-Driven Tests',
    crud: 'CRUD',
    runningSecurityTests: 'Running Security Tests...',
    runningPerformanceInsights: 'Running Performance Insights...',
    runningDataDrivenTests: 'Running Data-Driven Tests...',
    preparingCrud: 'Preparing CRUD…',
    crudDescription: 'CRUD are generated based on the OPTIONS method handling test response in Security Tests.',
    crudNote: 'Note:',
    crudNoteText: 'If the OPTIONS method handling test is disabled, CRUD will not be generated.',
    copyBugReport: 'Copy Bug Report',
    computingDifferences: 'Computing differences…',
    bodyParameters: 'Body Parameters',
    queryParameters: 'Query Parameters',
  },

  // Comparison Panel
  comparison: {
    title: 'Test Results Comparison',
    noTestResults: 'No test results to compare',
    potentialBugs: 'Potential Bugs',
    fullBehaviorChanges: 'Full Behavior Changes',
    noPotentialBugs: 'No potential bugs detected ✅',
    showFullBehaviorChanges: 'Show Full Behavior Changes',
    behaviorChange: 'Behavior Change:',
    showNoise: 'Show noise',
  },

  // Modals
  modals: {
    reload: {
      title: 'Reload',
      description: 'Only current tests results will be lost',
      confirmText: 'Reload',
    },
    sendHttpSuccess: {
      title: 'Request Looks Good!',
      description:
        'Rentgen now has a valid request to work with. Before generating tests, quickly review the mapped fields to make sure everything looks right',
      confirmText: 'Review & Generate Tests',
      doNotShowAgain: 'Do not show again',
    },
    deleteFolder: {
      title: 'Delete Folder',
      description: 'This folder contains requests. Are you sure you want to delete it?',
    },
    importConflict: {
      title: 'Import Conflicts Detected',
      conflictDescription: 'The imported collection "{{name}}" has conflicts with your existing collection:',
      collectionNamesMatch: 'Collection names match',
      folderConflicts: '{{count}} folder(s) with matching names',
      requestConflicts: '{{count}} request(s) with matching URL+Method or name',
      importWarnings: 'Import warnings: {{count}}',
      replaceDescription: 'Replace entire existing collection ({{folders}} folders, {{requests}} requests)',
      mergeDescription: 'Add unique items only (skips duplicates by URL+Method or name)',
      newFolders: '{{count}} new folder(s)',
      newRequests: '{{count}} new request(s)',
      noNewItems: 'No new items to add',
      importAsCopy: 'Import as Copy',
      copyDescription: 'Add all folders with "(copy)" suffix ({{folders}} folders, {{requests}} requests)',
    },
    setDynamicVariable: {
      title: 'Set as Dynamic Variable',
      editTitle: 'Edit Dynamic Variable',
      variableName: 'Variable Name',
      variableNamePlaceholder: 'variable_name',
      preview: 'Preview:',
      environment: 'Environment',
      allEnvironments: 'All Environments',
      untitledEnvironment: 'Untitled Environment',
      selectEnvironment: 'Select environment...',
      linkedRequest: 'Linked Request',
      variableNameRequired: 'Variable name is required',
      selectorRequired: 'Selector is required',
      selectEnvironmentError: 'Please select an environment',
      duplicateWarning: 'A variable with this name already exists. It will be overwritten.',
      saveVariable: 'Save Variable',
      updateVariable: 'Update Variable',
    },
    projectImport: {
      title: 'Import Project',
      file: 'File',
      exported: 'Exported',
      appVersion: 'App Version',
      integrity: 'Integrity',
      integrityWarning:
        'File integrity check failed. This file may have been modified outside of Rentgen. Proceed with caution.',
      overwriteWarning: 'This will overwrite ALL your current data:',
      collectionsCount: 'Collections ({{folders}} folders, {{requests}} requests)',
      environmentsCount: 'Environments ({{count}} environments)',
      dynamicVariablesCount: 'Dynamic Variables ({{count}} variables)',
      historyCount: 'History ({{count}} entries)',
      settingsInfo: 'Settings (theme, test engine, history config)',
      cannotBeUndone: 'This action cannot be undone.',
      backupBefore: 'Back up your current project before importing:',
      exportedCheck: 'Exported ✓',
      exportCurrentProject: 'Export Current Project',
      importProject: 'Import Project',
    },
  },

  // Settings
  settings: {
    testEngine: 'Test Engine',
    general: 'General',
    themes: 'Themes',
    language: 'Language',
    cli: 'CLI',
    themesDescription: 'Personalize your experience with themes that match your style.',
    themeLight: 'Light',
    themeDark: 'Dark',
    cliDescription: 'Rentgen CLI is currently in active development.',
    cliBody:
      'The Rentgen CLI will provide automation-ready execution for teams integrating structural testing into CI/CD workflows.',
    history: {
      title: 'History',
      description: 'Configure how request history is collected and retained.',
      enableHistory: 'Enable History',
      maximumSize: 'Maximum Size',
      retentionPeriod: 'Retention Period',
      week1: '1 Week',
      month1: '1 Month',
      months3: '3 Months',
      months6: '6 Months',
      year1: '1 Year',
      noRetention: 'No Retention',
    },
    project: {
      title: 'Project',
      description:
        'Export or import your entire project including collections, environments, variables, history, and settings.',
      exportProject: 'Export Project',
      importProject: 'Import Project',
    },
    configuration: {
      title: 'Configuration',
      description: 'Configure rules and limits for generating random test data values.',
      email: 'Email',
      domain: 'Domain',
      randomEmailLength: 'Random Email Length',
      enum: 'Enum',
      enumDescription: 'Enter all valid values separated by ","',
      number: 'Number',
      minimumValue: 'Minimum Value',
      maximumValue: 'Maximum Value',
      string: 'String',
      maximumValueLength: 'Maximum Value Length',
      randomInteger: 'Random Integer',
      randomString: 'Random String',
      length: 'Length',
    },
    securityTests: {
      title: 'Security Tests',
      enabledCount: '{{enabled}}/{{total}} enabled',
      description: 'Toggle individual security tests on or off to customize your testing experience.',
    },
    languageSection: {
      title: 'Language',
      description: 'Select your preferred language for the application interface.',
      feedback:
        'Found a translation issue or want to add another language? Create a ticket with all the details and we will do our best.',
      feedbackLink: 'Open a GitHub issue',
    },
  },

  // Controls
  controls: {
    sizeMB: 'Size (MB)',
    sizeMax: 'Size (max {{max}} MB)',
    threads: 'Threads',
    threadsMax: 'Threads (max 100)',
    requests: 'Requests',
    requestsMax: 'Total requests (max 10 000)',
    mandatoryToggle: 'Enabled = Mandatory → Rentgen generates tests based on this setting',
    enumLabel: 'Enter all valid values separated by ","',
    numberLabel: 'Set Min/Max range for boundary test. 0 - integer, 0.00 - decimal',
    stringLabel: 'Value max length',
  },

  // Parameter types
  parameterTypes: {
    doNotTest: 'Do not test',
    randomEmail: 'Random email',
    randomInteger: 'Random integer',
    randomString: 'Random string',
    boolean: 'Boolean',
    currency: 'Currency',
    dateYYYYMMDD: 'Date (YYYY-MM-DD)',
    email: 'Email',
    enum: 'Enum',
    number: 'Number',
    phone: 'Phone',
    string: 'String',
    url: 'Url',
  },

  // Tables
  tables: {
    parameter: 'Parameter',
    value: 'Value',
    check: 'Check',
    method: 'Method',
    expected: 'Expected',
    actual: 'Actual',
    result: 'Result',
    name: 'Name',
    description: 'Description',
    request: 'Request',
  },

  // Context Menu
  contextMenu: {
    setAsVariable: 'Set as Variable',
    saveRequestFirst: 'Save request to collection first',
  },

  // Badges
  badges: {
    verified: 'Verified',
    modified: 'Modified',
    noChecksum: 'No checksum',
  },

  // File input
  fileInput: {
    chooseFile: 'Choose File',
    noFileChosen: 'No file chosen',
  },

  // Protobuf
  protobuf: {
    decodedProtobuf: 'Decoded Protobuf:',
  },

  // Messages panel
  messages: {
    title: 'Messages',
  },

  // Export format labels
  exportFormats: {
    json: 'JSON (.json)',
    markdown: 'Markdown (.md)',
    csv: 'CSV (.csv)',
  },
};

export default en;
