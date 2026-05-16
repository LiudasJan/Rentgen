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
    untitled: 'Bez nazwy',
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
    modePlaceholder: 'TRYB',
    methodPlaceholder: 'METODA',
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
    formatPlaceholder: 'Format',
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
    themesDescription: 'Spersonalizuj swoje doświadczenie motywami pasującymi do Twojego stylu.',
    themeLight: 'Jasny',
    themeDark: 'Ciemny',
    cli: {
      name: 'CLI',
      intro:
        'Rentgen CLI uruchamia folder zapytań z eksportu projektu <c>.rentgen</c>, bezpośrednio z terminala — stworzony dla potoków CI i skryptowych testów dymnych. Czyta ten sam plik, który tworzy <e>Ogólne → Eksportuj projekt</e>, i nigdy do niego nie zapisuje.',
      fullDocumentation: 'Pełna dokumentacja:',
      installInPath: 'Zainstaluj w shell PATH ({{platform}})',
      checkingStatus: 'Sprawdzanie statusu instalacji…',
      runCli: 'Uruchom CLI',
      runCliDescription:
        'Rentgen udostępnia jedną subkomendę, <c>xray</c> (alias: <c>run</c>). Wskaż ją na plik projektu wyeksportowany z aplikacji.',
      exportProject: 'Eksportuj projekt',
      noProjectFileYet:
        'Nie masz jeszcze pliku projektu? Wyeksportuj go teraz — to ta sama akcja co <e>Ogólne → Eksportuj projekt</e>.',
      developmentNote: 'Podczas developmentu wywołuj bezpośrednio z repo używając <c>npm run dev:cli -- xray …</c>.',
      options: 'Opcje',
      examples: 'Przykłady',
      exampleInteractive: 'Wybierz folder i środowisko interaktywnie:',
      exampleCi: 'Skryptowe uruchomienie CI z jawnym folderem i środowiskiem, z szybkim zatrzymaniem przy błędzie:',
      exampleCiJson: 'Wyjście czytelne maszynowo dla potoków CI (GitHub Actions, Jenkins, powiadomienia Slack):',
      exampleOverrideVars: 'Nadpisz zmienne w miejscu wywołania (najwyższy priorytet):',
      integrityCheck: 'Sprawdzenie integralności',
      integrityCheckDescription:
        'Każdy eksport projektu zawiera sumę kontrolną SHA-256 swoich danych. Przy ładowaniu CLI ponownie oblicza sumę. Jeśli się zgadza, uruchomienie kontynuuje cicho. Jeśli jej brakuje lub została zmanipulowana, zobaczysz monit potwierdzenia w TTY lub błąd w CI. <c>--skip-integrity-check</c> omija bramę — użyj jej, gdy wiesz, że plik został celowo zmodyfikowany ręcznie.',
      exitCodesTitle: 'Kody wyjścia',
      idempotency: 'Idempotencja',
      idempotencyDescription:
        'CLI nigdy nie zapisuje do pliku projektu. Zmienne dynamiczne wyodrębnione z odpowiedzi są przechowywane w pamięci na czas pojedynczego uruchomienia, więc dwa wywołania jedno po drugim wobec niezmodyfikowanego projektu dają identyczne co do bajtu rozwiązane URL, nagłówki i treści.',
      platform: {
        macos: 'macOS',
        windows: 'Windows',
        linux: 'Linux',
      },
      status: {
        binaryUnavailable: 'Plik binarny CLI niedostępny',
        binaryUnavailableReinstall: 'Zainstaluj ponownie najnowszą wersję Rentgen, aby włączyć CLI.',
        installed: 'Zainstalowano',
        managedByPackageManager: ' (zarządzane przez menedżera pakietów)',
        conflictingPath: 'Konflikt `rentgen` w PATH',
        conflictingPathDescription:
          '<c>{{path}}</c> jest w PATH, ale nie wskazuje na tę instalację Rentgen. Usuń go, w przeciwnym razie instalacja tutaj go przesłoni.',
        notInstalled: 'Nie zainstalowano',
        notInstalledDescription: 'Kliknij <e>Zainstaluj</e> poniżej, aby dodać <c>rentgen</c> do shell PATH.',
      },
      action: {
        working: 'Trwa…',
        uninstall: 'Odinstaluj CLI',
        reinstall: 'Zainstaluj ponownie',
        installRentgenInPath: 'Zainstaluj polecenie rentgen w PATH',
        packageManagerNote:
          'Menedżer pakietów Linux obsługuje instalację i usuwanie. Aby odinstalować, użyj <c>sudo apt remove rentgen</c> / <c>sudo dnf remove rentgen</c>.',
      },
      platformTip: {
        macos:
          'macOS poprosi o hasło, aby utworzyć symboliczne łącze do <c>/usr/local/bin/rentgen</c>. Po instalacji otwórz nową kartę Terminala, aby zastosować zmianę.',
        windows:
          'Instalacja na Windows dodaje katalog zasobów Rentgen do PATH <e>użytkownika</e> (uprawnienia administratora niewymagane). Po instalacji otwórz nową kartę PowerShell, Command Prompt lub Windows Terminal — istniejące powłoki nie zobaczą zmiany.',
        linux:
          'W systemie Linux skrypt poinstalacyjny deb/rpm automatycznie tworzy łącze <c>/usr/bin/rentgen</c>. Jeśli zainstalowano z przenośnego archiwum, ten przycisk tworzy symboliczne łącze użytkownika w <c>/usr/local/bin/rentgen</c> (lub <c>~/.local/bin/rentgen</c> jako alternatywa).',
      },
      flag: {
        collection: 'Folder do uruchomienia z pliku projektu. Pomiń, aby wybrać interaktywnie.',
        env: 'Środowisko do użycia. Przekaż --env=none, aby uruchomić bez środowiska.',
        skipIntegrityCheck: 'Pomiń monit potwierdzenia sumy kontrolnej.',
        var: 'Nadpisz zmienną. Można powtarzać. Najwyższy priorytet nad środowiskiem i wartościami dynamicznymi.',
        timeout: 'Limit czasu na zapytanie w milisekundach. Domyślnie 30000.',
        failFast: 'Zatrzymaj po pierwszej awarii.',
        report: 'Wyjście czytelne maszynowo. Obsługiwane: json (zapisuje JSON do stdout, tłumi wyjście dla ludzi).',
        noColor: 'Wyłącz kolorowe wyjście.',
        verbose: 'Drukuj pełne szczegóły zapytania/odpowiedzi i ostrzegaj o nierozwiązanych zmiennych.',
      },
      exit: {
        code0: 'Wszystkie zapytania przeszły pomyślnie.',
        code1: 'Uruchomienie zakończone awariami, przerwane na monicie o sumę kontrolną lub przerwane Ctrl+C.',
        code2:
          'Nieprawidłowe wejście: brakujący plik, błędny JSON, niewłaściwy kształt, niejednoznaczny lub nieznany --collection / --env, lub tryb CI bez wymaganych flag.',
      },
    },
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
    minPlaceholder: 'Min',
    maxPlaceholder: 'Maks',
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
    setAsDynamicVariableTitle: 'Ustaw "{{path}}" jako zmienną dynamiczną',
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
