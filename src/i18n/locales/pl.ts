const pl = {
  // Common
  common: {
    send: 'Wyślij',
    save: 'Zapisz',
    saved: 'Zapisano ✅',
    cancel: 'Anuluj',
    close: 'Zamknij',
    ok: 'OK',
    create: 'Utwórz',
    delete: 'Usuń',
    import: 'Importuj',
    export: 'Eksportuj',
    copy: 'Kopiuj',
    copied: 'Skopiowano ✅',
    run: 'Uruchom',
    replace: 'Zamień',
    merge: 'Scal',
    overwrite: 'Nadpisz',
    enabled: 'Włączone',
    disabled: 'Wyłączone',
    warning: 'Ostrzeżenie:',
    connect: 'Połącz',
    disconnect: 'Rozłącz',
    beautify: 'Formatuj',
    reload: 'Odśwież',
    cut: 'Wytnij',
    paste: 'Wklej',
  },

  // Sidebar
  sidebar: {
    collections: 'Kolekcje',
    environments: 'Środowiska',
    history: 'Historia',
    settings: 'Ustawienia',
    checkForUpdates: 'Sprawdź aktualizacje',
    reportFeedback: 'Zgłoś opinię',
  },

  // Collections Panel
  collections: {
    newFolder: 'Nowy folder',
    importCollection: 'Importuj kolekcję',
    exportCollection: 'Eksportuj kolekcję',
    searchCollections: 'Szukaj w kolekcjach...',
    noMatchingRequests: 'Brak pasujących zapytań',
    noSavedRequests: 'Brak zapisanych zapytań',
    importFailed: 'Import nie powiódł się: {{error}}',
    exportFailed: 'Eksport nie powiódł się: {{error}}',
    importedWithWarnings: 'Zaimportowano z {{count}} ostrzeżeniem(-ami)',
    collectionImported: 'Kolekcja zaimportowana',
    collectionExported: 'Kolekcja wyeksportowana',
  },

  // Environment
  environment: {
    newEnvironment: 'Nowe środowisko',
    editEnvironment: 'Edytuj środowisko',
    noEnvironmentsCreated: 'Nie utworzono żadnych środowisk',
    environmentName: 'Nazwa środowiska',
    environmentNamePlaceholder: 'np. Produkcja, Staging, Lokalne',
    color: 'Kolor',
    variables: 'Zmienne',
    variableName: 'Nazwa zmiennej',
    addVariable: 'Dodaj zmienną',
    value: 'Wartość',
    refreshValue: 'Odśwież wartość',
    refreshAll: 'Odśwież wszystko',
    noEnvironment: 'Brak środowiska',
    selectEnvironment: 'Wybierz środowisko',
    randomEmail: 'Losowy e-mail',
    randomInteger: 'Losowa liczba całkowita',
    randomString: 'Losowy ciąg znaków',
    deleteEnvironmentConfirm: 'Czy na pewno chcesz usunąć to środowisko?',
    deleteEnvironment: 'Usuń środowisko',
  },

  // History
  history: {
    title: 'Historia',
    clearAll: 'Wyczyść wszystko',
    searchHistory: 'Szukaj w historii...',
    noMatchingHistory: 'Brak pasującej historii',
    noHistoryYet: 'Brak historii',
    today: 'Dzisiaj',
    yesterday: 'Wczoraj',
  },

  // Request
  request: {
    enterUrl: 'Wpisz URL lub wklej tekst',
    headers: 'Nagłówki',
    headersPlaceholder: 'Klucz-Nagłówka: wartość',
    body: 'Treść',
    bodyPlaceholderHttp: 'Wpisz treść zapytania (JSON lub Form Data)',
    bodyPlaceholderWss: 'Treść wiadomości',
    protobufSchema: 'Schemat Protobuf i typ wiadomości',
    protobufDescription: 'Sekcja eksperymentalna i opcjonalna. Jeśli używana, oba pola muszą być wypełnione',
    messageTypePlaceholder: 'Typ wiadomości (np. mypackage.MyMessage)',
    protoSchemaLoaded: '🟢 Schemat Proto załadowany',
    protoSchemaParseFailed: '🔴 Nie udało się sparsować proto: ',
    wssUrlRequired: '🔴 Proszę użyć adresu URL ws:// lub wss://',
  },

  // Response
  response: {
    title: 'Odpowiedź',
    sending: 'Wysyłanie...',
    networkError: 'Błąd sieci',
  },

  // cURL
  curl: {
    importCurl: 'Importuj cURL',
    importCurlPlaceholder: 'Wpisz cURL lub wklej tekst',
    invalidCurl: 'Podana komenda cURL wydaje się nieprawidłowa. Sprawdź ją i spróbuj ponownie',
    copyCurl: 'Kopiuj cURL',
  },

  // Tests
  tests: {
    generateAndRun: 'Generuj i uruchom testy',
    runningTests: 'Uruchamianie testów... ({{current}}/{{total}})',
    selectForCompare: 'Wybierz do porównania',
    compareWithSelected: 'Porównaj z wybranym',
    exportFormat: 'Format',
    exported: 'Wyeksportowano ✅',
    generateCertificate: 'Generuj certyfikat',
    certificated: 'Certyfikowano ✅',
    notEligible: 'Nie kwalifikuje się (wymagane min. 70 testów)',
    securityTests: 'Testy bezpieczeństwa',
    performanceInsights: 'Analiza wydajności',
    dataDrivenTests: 'Testy oparte na danych',
    crud: 'CRUD',
    runningSecurityTests: 'Uruchamianie testów bezpieczeństwa...',
    runningPerformanceInsights: 'Uruchamianie analizy wydajności...',
    runningDataDrivenTests: 'Uruchamianie testów opartych na danych...',
    preparingCrud: 'Przygotowywanie CRUD…',
    crudDescription:
      'CRUD jest generowany na podstawie odpowiedzi testu obsługi metody OPTIONS w testach bezpieczeństwa.',
    crudNote: 'Uwaga:',
    crudNoteText: 'Jeśli test obsługi metody OPTIONS jest wyłączony, CRUD nie zostanie wygenerowany.',
    copyBugReport: 'Kopiuj raport błędu',
    computingDifferences: 'Obliczanie różnic…',
    bodyParameters: 'Parametry treści',
    queryParameters: 'Parametry zapytania',
  },

  // Comparison Panel
  comparison: {
    title: 'Porównanie wyników testów',
    noTestResults: 'Brak wyników testów do porównania',
    potentialBugs: 'Potencjalne błędy',
    fullBehaviorChanges: 'Pełne zmiany zachowania',
    noPotentialBugs: 'Nie wykryto potencjalnych błędów ✅',
    showFullBehaviorChanges: 'Pokaż pełne zmiany zachowania',
    behaviorChange: 'Zmiana zachowania:',
    showNoise: 'Pokaż szum',
  },

  // Modals
  modals: {
    reload: {
      title: 'Odśwież',
      description: 'Tylko bieżące wyniki testów zostaną utracone',
      confirmText: 'Odśwież',
    },
    sendHttpSuccess: {
      title: 'Zapytanie wygląda dobrze!',
      description:
        'Rentgen ma teraz prawidłowe zapytanie do pracy. Przed wygenerowaniem testów szybko sprawdź zmapowane pola, aby upewnić się, że wszystko wygląda poprawnie',
      confirmText: 'Sprawdź i generuj testy',
      doNotShowAgain: 'Nie pokazuj ponownie',
    },
    deleteFolder: {
      title: 'Usuń folder',
      description: 'Ten folder zawiera zapytania. Czy na pewno chcesz go usunąć?',
    },
    importConflict: {
      title: 'Wykryto konflikty importu',
      conflictDescription: 'Importowana kolekcja "{{name}}" ma konflikty z istniejącą kolekcją:',
      collectionNamesMatch: 'Nazwy kolekcji się pokrywają',
      folderConflicts: '{{count}} folder(-ów) o pasujących nazwach',
      requestConflicts: '{{count}} zapytanie(-ań) o pasującym URL+Metodzie lub nazwie',
      importWarnings: 'Ostrzeżenia importu: {{count}}',
      replaceDescription: 'Zamień całą istniejącą kolekcję ({{folders}} folderów, {{requests}} zapytań)',
      mergeDescription: 'Dodaj tylko unikalne elementy (pomija duplikaty po URL+Metodzie lub nazwie)',
      newFolders: '{{count}} nowy(-ch) folder(-ów)',
      newRequests: '{{count}} nowe(-ych) zapytanie(-ań)',
      noNewItems: 'Brak nowych elementów do dodania',
      importAsCopy: 'Importuj jako kopię',
      copyDescription: 'Dodaj wszystkie foldery z sufiksem "(kopia)" ({{folders}} folderów, {{requests}} zapytań)',
    },
    setDynamicVariable: {
      title: 'Ustaw jako zmienną dynamiczną',
      editTitle: 'Edytuj zmienną dynamiczną',
      variableName: 'Nazwa zmiennej',
      variableNamePlaceholder: 'nazwa_zmiennej',
      preview: 'Podgląd:',
      environment: 'Środowisko',
      allEnvironments: 'Wszystkie środowiska',
      untitledEnvironment: 'Środowisko bez nazwy',
      selectEnvironment: 'Wybierz środowisko...',
      linkedRequest: 'Powiązane zapytanie',
      variableNameRequired: 'Nazwa zmiennej jest wymagana',
      selectorRequired: 'Selektor jest wymagany',
      selectEnvironmentError: 'Proszę wybrać środowisko',
      duplicateWarning: 'Zmienna o tej nazwie już istnieje. Zostanie nadpisana.',
      saveVariable: 'Zapisz zmienną',
      updateVariable: 'Zaktualizuj zmienną',
    },
    projectImport: {
      title: 'Importuj projekt',
      file: 'Plik',
      exported: 'Wyeksportowano',
      appVersion: 'Wersja aplikacji',
      integrity: 'Integralność',
      integrityWarning:
        'Sprawdzenie integralności pliku nie powiodło się. Ten plik mógł zostać zmodyfikowany poza Rentgen. Postępuj ostrożnie.',
      overwriteWarning: 'To nadpisze WSZYSTKIE Twoje obecne dane:',
      collectionsCount: 'Kolekcje ({{folders}} folderów, {{requests}} zapytań)',
      environmentsCount: 'Środowiska ({{count}} środowisk)',
      dynamicVariablesCount: 'Zmienne dynamiczne ({{count}} zmiennych)',
      historyCount: 'Historia ({{count}} wpisów)',
      settingsInfo: 'Ustawienia (motyw, silnik testów, konfiguracja historii)',
      cannotBeUndone: 'Tej akcji nie można cofnąć.',
      backupBefore: 'Wykonaj kopię zapasową obecnego projektu przed importem:',
      exportedCheck: 'Wyeksportowano ✓',
      exportCurrentProject: 'Eksportuj obecny projekt',
      importProject: 'Importuj projekt',
    },
  },

  // Settings
  settings: {
    testEngine: 'Silnik testów',
    general: 'Ogólne',
    themes: 'Motywy',
    language: 'Język',
    cli: 'CLI',
    themesDescription: 'Spersonalizuj swoje doświadczenie motywami pasującymi do Twojego stylu.',
    themeLight: 'Jasny',
    themeDark: 'Ciemny',
    cliDescription: 'Rentgen CLI jest obecnie w aktywnym rozwoju.',
    cliBody:
      'Rentgen CLI zapewni gotową do automatyzacji realizację dla zespołów integrujących testy strukturalne w przepływach CI/CD.',
    history: {
      title: 'Historia',
      description: 'Skonfiguruj sposób zbierania i przechowywania historii zapytań.',
      enableHistory: 'Włącz historię',
      maximumSize: 'Maksymalny rozmiar',
      retentionPeriod: 'Okres przechowywania',
      week1: '1 tydzień',
      month1: '1 miesiąc',
      months3: '3 miesiące',
      months6: '6 miesięcy',
      year1: '1 rok',
      noRetention: 'Bez limitu',
    },
    project: {
      title: 'Projekt',
      description: 'Eksportuj lub importuj cały projekt, w tym kolekcje, środowiska, zmienne, historię i ustawienia.',
      exportProject: 'Eksportuj projekt',
      importProject: 'Importuj projekt',
    },
    configuration: {
      title: 'Konfiguracja',
      description: 'Skonfiguruj reguły i limity generowania losowych wartości testowych.',
      email: 'E-mail',
      domain: 'Domena',
      randomEmailLength: 'Długość losowego e-maila',
      enum: 'Enum',
      enumDescription: 'Wpisz wszystkie prawidłowe wartości oddzielone ","',
      number: 'Liczba',
      minimumValue: 'Wartość minimalna',
      maximumValue: 'Wartość maksymalna',
      string: 'Ciąg znaków',
      maximumValueLength: 'Maksymalna długość wartości',
      randomInteger: 'Losowa liczba całkowita',
      randomString: 'Losowy ciąg znaków',
      length: 'Długość',
    },
    securityTests: {
      title: 'Testy bezpieczeństwa',
      enabledCount: '{{enabled}}/{{total}} włączonych',
      description: 'Włączaj lub wyłączaj poszczególne testy bezpieczeństwa, aby dostosować testowanie.',
    },
    languageSection: {
      title: 'Język',
      description: 'Wybierz preferowany język interfejsu aplikacji.',
      feedback:
        'Znalazłeś problem z tłumaczeniem lub chcesz dodać inny język? Utwórz zgłoszenie ze wszystkimi szczegółami, a zrobimy co w naszej mocy.',
      feedbackLink: 'Otwórz zgłoszenie na GitHub',
    },
  },

  // Controls
  controls: {
    sizeMB: 'Rozmiar (MB)',
    sizeMax: 'Rozmiar (maks. {{max}} MB)',
    threads: 'Wątki',
    threadsMax: 'Wątki (maks. 100)',
    requests: 'Zapytania',
    requestsMax: 'Łączna liczba zapytań (maks. 10 000)',
    mandatoryToggle: 'Włączone = Obowiązkowe → Rentgen generuje testy na podstawie tego ustawienia',
    enumLabel: 'Wpisz wszystkie prawidłowe wartości oddzielone ","',
    numberLabel: 'Ustaw zakres Min/Maks dla testu granicy. 0 - całkowita, 0.00 - dziesiętna',
    stringLabel: 'Maksymalna długość wartości',
  },

  // Parameter types
  parameterTypes: {
    doNotTest: 'Nie testuj',
    randomEmail: 'Losowy e-mail',
    randomInteger: 'Losowa liczba całkowita',
    randomString: 'Losowy ciąg znaków',
    boolean: 'Boolean',
    currency: 'Waluta',
    dateYYYYMMDD: 'Data (RRRR-MM-DD)',
    email: 'E-mail',
    enum: 'Enum',
    number: 'Liczba',
    phone: 'Telefon',
    string: 'Ciąg znaków',
    url: 'URL',
  },

  // Tables
  tables: {
    parameter: 'Parametr',
    value: 'Wartość',
    check: 'Sprawdzenie',
    method: 'Metoda',
    expected: 'Oczekiwany',
    actual: 'Rzeczywisty',
    result: 'Wynik',
    name: 'Nazwa',
    description: 'Opis',
    request: 'Zapytanie',
  },

  // Context Menu
  contextMenu: {
    setAsVariable: 'Ustaw jako zmienną',
    saveRequestFirst: 'Najpierw zapisz zapytanie do kolekcji',
  },

  // Badges
  badges: {
    verified: 'Zweryfikowany',
    modified: 'Zmodyfikowany',
    noChecksum: 'Brak sumy kontrolnej',
  },

  // File input
  fileInput: {
    chooseFile: 'Wybierz plik',
    noFileChosen: 'Nie wybrano pliku',
  },

  // Protobuf
  protobuf: {
    decodedProtobuf: 'Zdekodowany Protobuf:',
  },

  // Messages panel
  messages: {
    title: 'Wiadomości',
  },

  // Export format labels
  exportFormats: {
    json: 'JSON (.json)',
    markdown: 'Markdown (.md)',
    csv: 'CSV (.csv)',
  },
};

export default pl;
