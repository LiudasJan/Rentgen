const lt = {
  // Common
  common: {
    send: 'Siųsti',
    save: 'Išsaugoti',
    saved: 'Išsaugota ✅',
    cancel: 'Atšaukti',
    close: 'Uždaryti',
    ok: 'Gerai',
    create: 'Sukurti',
    delete: 'Ištrinti',
    import: 'Importuoti',
    export: 'Eksportuoti',
    copy: 'Kopijuoti',
    copied: 'Nukopijuota ✅',
    run: 'Vykdyti',
    replace: 'Pakeisti',
    merge: 'Sujungti',
    overwrite: 'Perrašyti',
    enabled: 'Įjungta',
    disabled: 'Išjungta',
    warning: 'Įspėjimas:',
    connect: 'Prisijungti',
    disconnect: 'Atsijungti',
    beautify: 'Formatuoti',
    reload: 'Perkrauti',
    cut: 'Iškirpti',
    paste: 'Įklijuoti',
  },

  // Sidebar
  sidebar: {
    collections: 'Kolekcijos',
    environments: 'Aplinkos',
    history: 'Istorija',
    settings: 'Nustatymai',
    checkForUpdates: 'Tikrinti atnaujinimus',
    reportFeedback: 'Pranešti apie klaidą',
  },

  // Collections Panel
  collections: {
    newFolder: 'Naujas aplankas',
    importCollection: 'Importuoti kolekciją',
    exportCollection: 'Eksportuoti kolekciją',
    searchCollections: 'Ieškoti kolekcijose...',
    noMatchingRequests: 'Nerasta atitinkančių užklausų',
    noSavedRequests: 'Nėra išsaugotų užklausų',
    importFailed: 'Importavimas nepavyko: {{error}}',
    exportFailed: 'Eksportavimas nepavyko: {{error}}',
    importedWithWarnings: 'Importuota su {{count}} įspėjimu(-ais)',
    collectionImported: 'Kolekcija importuota',
    collectionExported: 'Kolekcija eksportuota',
  },

  // Environment
  environment: {
    newEnvironment: 'Nauja aplinka',
    editEnvironment: 'Redaguoti aplinką',
    noEnvironmentsCreated: 'Aplinkų nesukurta',
    environmentName: 'Aplinkos pavadinimas',
    environmentNamePlaceholder: 'pvz., Produkcija, Testavimas, Lokali',
    color: 'Spalva',
    variables: 'Kintamieji',
    variableName: 'Kintamojo pavadinimas',
    addVariable: 'Pridėti kintamąjį',
    value: 'Reikšmė',
    refreshValue: 'Atnaujinti reikšmę',
    refreshAll: 'Atnaujinti viską',
    noEnvironment: 'Be aplinkos',
    selectEnvironment: 'Pasirinkti aplinką',
    randomEmail: 'Atsitiktinis el. paštas',
    randomInteger: 'Atsitiktinis sveikasis skaičius',
    randomString: 'Atsitiktinė eilutė',
    deleteEnvironmentConfirm: 'Ar tikrai norite ištrinti šią aplinką?',
    deleteEnvironment: 'Ištrinti aplinką',
    untitled: 'Be pavadinimo',
  },

  // History
  history: {
    title: 'Istorija',
    clearAll: 'Išvalyti viską',
    searchHistory: 'Ieškoti istorijoje...',
    noMatchingHistory: 'Nerasta atitinkančios istorijos',
    noHistoryYet: 'Istorijos dar nėra',
    today: 'Šiandien',
    yesterday: 'Vakar',
  },

  // Request
  request: {
    enterUrl: 'Įveskite URL arba įklijuokite tekstą',
    headers: 'Antraštės',
    headersPlaceholder: 'Antraštės-Raktas: reikšmė',
    body: 'Turinys',
    bodyPlaceholderHttp: 'Įveskite užklausos turinį (JSON arba Form Data)',
    bodyPlaceholderWss: 'Žinutės turinys',
    protobufSchema: 'Protobuf schema ir žinutės tipas',
    protobufDescription: 'Eksperimentinė ir neprivaloma sekcija. Jei naudojama, abu laukai turi būti užpildyti',
    messageTypePlaceholder: 'Žinutės tipas (pvz. mypackage.MyMessage)',
    protoSchemaLoaded: '🟢 Proto schema įkelta',
    protoSchemaParseFailed: '🔴 Nepavyko apdoroti proto: ',
    wssUrlRequired: '🔴 Prašome naudoti ws:// arba wss:// URL',
    modePlaceholder: 'REŽIMAS',
    methodPlaceholder: 'METODAS',
  },

  // Response
  response: {
    title: 'Atsakymas',
    sending: 'Siunčiama...',
    networkError: 'Tinklo klaida',
  },

  // cURL
  curl: {
    importCurl: 'Importuoti cURL',
    importCurlPlaceholder: 'Įveskite cURL arba įklijuokite tekstą',
    invalidCurl: 'Jūsų pateikta cURL komanda atrodo netinkama. Patikrinkite ją ir bandykite dar kartą',
    copyCurl: 'Kopijuoti cURL',
  },

  // Tests
  tests: {
    generateAndRun: 'Generuoti ir vykdyti testus',
    runningTests: 'Vykdomi testai... ({{current}}/{{total}})',
    selectForCompare: 'Pasirinkti palyginimui',
    compareWithSelected: 'Palyginti su pasirinktu',
    exportFormat: 'Formatas',
    exported: 'Eksportuota ✅',
    generateCertificate: 'Generuoti sertifikatą',
    certificated: 'Sertifikuota ✅',
    notEligible: 'Netinkama (reikia bent 70 testų)',
    securityTests: 'Saugumo testai',
    performanceInsights: 'Našumo įžvalgos',
    dataDrivenTests: 'Duomenimis paremti testai',
    crud: 'CRUD',
    runningSecurityTests: 'Vykdomi saugumo testai...',
    runningPerformanceInsights: 'Vykdomos našumo įžvalgos...',
    runningDataDrivenTests: 'Vykdomi duomenimis paremti testai...',
    preparingCrud: 'Ruošiamas CRUD…',
    crudDescription: 'CRUD generuojami pagal OPTIONS metodo apdorojimo testo atsakymą saugumo testuose.',
    crudNote: 'Pastaba:',
    crudNoteText: 'Jei OPTIONS metodo apdorojimo testas išjungtas, CRUD nebus generuojami.',
    copyBugReport: 'Kopijuoti klaidos ataskaitą',
    computingDifferences: 'Skaičiuojami skirtumai…',
    bodyParameters: 'Turinio parametrai',
    queryParameters: 'Užklausos parametrai',
    formatPlaceholder: 'Formatas',
  },

  // Comparison Panel
  comparison: {
    title: 'Testų rezultatų palyginimas',
    noTestResults: 'Nėra testų rezultatų palyginimui',
    potentialBugs: 'Galimos klaidos',
    fullBehaviorChanges: 'Visi elgsenos pokyčiai',
    noPotentialBugs: 'Galimų klaidų nerasta ✅',
    showFullBehaviorChanges: 'Rodyti visus elgsenos pokyčius',
    behaviorChange: 'Elgsenos pokytis:',
    showNoise: 'Rodyti triukšmą',
  },

  // Modals
  modals: {
    reload: {
      title: 'Perkrauti',
      description: 'Bus prarasti tik dabartiniai testų rezultatai',
      confirmText: 'Perkrauti',
    },
    sendHttpSuccess: {
      title: 'Užklausa atrodo gerai!',
      description:
        'Rentgen dabar turi tinkamą užklausą. Prieš generuodami testus, greitai peržiūrėkite susietus laukus ir įsitikinkite, kad viskas atrodo teisingai',
      confirmText: 'Peržiūrėti ir generuoti testus',
      doNotShowAgain: 'Daugiau nerodyti',
    },
    deleteFolder: {
      title: 'Ištrinti aplanką',
      description: 'Šiame aplanke yra užklausų. Ar tikrai norite jį ištrinti?',
    },
    importConflict: {
      title: 'Aptikti importavimo konfliktai',
      conflictDescription: 'Importuojama kolekcija „{{name}}" turi konfliktų su jūsų esama kolekcija:',
      collectionNamesMatch: 'Kolekcijų pavadinimai sutampa',
      folderConflicts: '{{count}} aplankas(-ai) su sutampančiais pavadinimais',
      requestConflicts: '{{count}} užklausa(-os) su sutampančiu URL+Metodu arba pavadinimu',
      importWarnings: 'Importavimo įspėjimai: {{count}}',
      replaceDescription: 'Pakeisti visą esamą kolekciją ({{folders}} aplankų, {{requests}} užklausų)',
      mergeDescription: 'Pridėti tik unikalius elementus (praleidžia dublikatus pagal URL+Metodą arba pavadinimą)',
      newFolders: '{{count}} naujas(-i) aplankas(-ai)',
      newRequests: '{{count}} nauja(-os) užklausa(-os)',
      noNewItems: 'Nėra naujų elementų pridėjimui',
      importAsCopy: 'Importuoti kaip kopiją',
      copyDescription: 'Pridėti visus aplankus su „(kopija)" priesaga ({{folders}} aplankų, {{requests}} užklausų)',
    },
    setDynamicVariable: {
      title: 'Nustatyti kaip dinaminį kintamąjį',
      editTitle: 'Redaguoti dinaminį kintamąjį',
      variableName: 'Kintamojo pavadinimas',
      variableNamePlaceholder: 'kintamojo_pavadinimas',
      preview: 'Peržiūra:',
      environment: 'Aplinka',
      allEnvironments: 'Visos aplinkos',
      untitledEnvironment: 'Aplinka be pavadinimo',
      selectEnvironment: 'Pasirinkite aplinką...',
      linkedRequest: 'Susieta užklausa',
      variableNameRequired: 'Kintamojo pavadinimas privalomas',
      selectorRequired: 'Selektorius privalomas',
      selectEnvironmentError: 'Prašome pasirinkti aplinką',
      duplicateWarning: 'Kintamasis su šiuo pavadinimu jau egzistuoja. Jis bus perrašytas.',
      saveVariable: 'Išsaugoti kintamąjį',
      updateVariable: 'Atnaujinti kintamąjį',
    },
    projectImport: {
      title: 'Importuoti projektą',
      file: 'Failas',
      exported: 'Eksportuota',
      appVersion: 'Programos versija',
      integrity: 'Vientisumas',
      integrityWarning:
        'Failo vientisumo patikra nepavyko. Šis failas galėjo būti pakeistas už Rentgen ribų. Tęskite atsargiai.',
      overwriteWarning: 'Tai perrašys VISUS jūsų dabartinius duomenis:',
      collectionsCount: 'Kolekcijos ({{folders}} aplankų, {{requests}} užklausų)',
      environmentsCount: 'Aplinkos ({{count}} aplinkų)',
      dynamicVariablesCount: 'Dinaminiai kintamieji ({{count}} kintamųjų)',
      historyCount: 'Istorija ({{count}} įrašų)',
      settingsInfo: 'Nustatymai (tema, testų variklis, istorijos konfigūracija)',
      cannotBeUndone: 'Šio veiksmo negalima atšaukti.',
      backupBefore: 'Prieš importuodami sukurkite atsarginę kopiją:',
      exportedCheck: 'Eksportuota ✓',
      exportCurrentProject: 'Eksportuoti dabartinį projektą',
      importProject: 'Importuoti projektą',
    },
  },

  // Settings
  settings: {
    testEngine: 'Testų variklis',
    general: 'Bendra',
    themes: 'Temos',
    language: 'Kalba',
    themesDescription: 'Pritaikykite savo patirtį temomis, atitinkančiomis jūsų stilių.',
    themeLight: 'Šviesi',
    themeDark: 'Tamsi',
    cli: {
      name: 'CLI',
      intro:
        'Rentgen CLI vykdo užklausų aplanką iš <c>.rentgen</c> projekto eksporto tiesiogiai iš terminalo — sukurta CI darbo eigoms ir scenarijais valdomiems greitiesiems testams. Skaito tą patį failą, kurį sukuria <e>Bendra → Eksportuoti projektą</e>, ir niekada į jį nerašo.',
      fullDocumentation: 'Pilna dokumentacija:',
      installInPath: 'Įdiegti į shell PATH ({{platform}})',
      checkingStatus: 'Tikrinama įdiegimo būsena…',
      runCli: 'Vykdyti CLI',
      runCliDescription:
        'Rentgen turi vieną subkomandą, <c>xray</c> (alias: <c>run</c>). Nurodykite jai projekto failą, eksportuotą iš programos.',
      exportProject: 'Eksportuoti projektą',
      noProjectFileYet:
        'Dar neturite projekto failo? Eksportuokite dabar — tas pats veiksmas kaip <e>Bendra → Eksportuoti projektą</e>.',
      developmentNote: 'Kūrimo metu kvieskite tiesiogiai iš repo su <c>npm run dev:cli -- xray …</c>.',
      options: 'Parinktys',
      examples: 'Pavyzdžiai',
      exampleInteractive: 'Interaktyviai pasirinkite aplanką ir aplinką:',
      exampleCi: 'Scenarijais valdomas CI vykdymas su aiškiu aplanku ir aplinka, greitai nutraukiamas:',
      exampleCiJson: 'Mašininis išvedimas CI darbo eigoms (GitHub Actions, Jenkins, Slack pranešikliams):',
      exampleOverrideVars: 'Pakeisti kintamuosius iškvietimo metu (aukščiausias prioritetas):',
      integrityCheck: 'Vientisumo patikra',
      integrityCheckDescription:
        'Kiekvienas projekto eksportas turi SHA-256 kontrolinę sumą savo duomenims. Įkeliant CLI perskaičiuoja sumą. Jei sutampa, vykdymas tęsiamas tyliai. Jei jos trūksta arba ji pakeista, TTY matysite patvirtinimo užklausą arba CI klaidą. <c>--skip-integrity-check</c> apeina patikrą — naudokite, kai žinote, kad failas buvo redaguotas rankomis tikslingai.',
      exitCodesTitle: 'Išėjimo kodai',
      idempotency: 'Idempotencija',
      idempotencyDescription:
        'CLI niekada nerašo į projekto failą. Iš atsakymų išgauti dinaminiai kintamieji saugomi atmintyje vieno vykdymo metu, todėl du iš eilės iškvietimai su nepakeistu projektu duoda identiškus baitams URL, antraštes ir turinį.',
      platform: {
        macos: 'macOS',
        windows: 'Windows',
        linux: 'Linux',
      },
      status: {
        binaryUnavailable: 'CLI binarinis failas nepasiekiamas',
        binaryUnavailableReinstall: 'Pakartotinai įdiekite naujausią Rentgen versiją, kad įgalintumėte CLI.',
        installed: 'Įdiegta',
        managedByPackageManager: ' (valdoma paketų tvarkyklės)',
        conflictingPath: 'Konfliktuojantis `rentgen` PATH kelyje',
        conflictingPathDescription:
          '<c>{{path}}</c> yra PATH kelyje, bet nenukreipia į šį Rentgen įdiegimą. Pašalinkite jį arba įdiegus čia jis bus uždengtas.',
        notInstalled: 'Neįdiegta',
        notInstalledDescription:
          'Spustelėkite <e>Įdiegti</e> žemiau, kad pridėtumėte <c>rentgen</c> į savo shell PATH.',
      },
      action: {
        working: 'Vykdoma…',
        uninstall: 'Pašalinti CLI',
        reinstall: 'Pakartotinai įdiegti',
        installRentgenInPath: 'Įdiegti rentgen komandą į PATH',
        packageManagerNote:
          'Linux paketų tvarkyklė valdo įdiegimą ir pašalinimą. Naudokite <c>sudo apt remove rentgen</c> / <c>sudo dnf remove rentgen</c>, kad pašalintumėte.',
      },
      platformTip: {
        macos:
          'macOS paprašys jūsų slaptažodžio, kad sukurtų simbolinę nuorodą į <c>/usr/local/bin/rentgen</c>. Po įdiegimo atidarykite naują Terminal skirtuką, kad pakeitimas įsigaliotų.',
        windows:
          'Windows įdiegimas prideda Rentgen išteklių katalogą į jūsų <e>vartotojo</e> PATH (administratoriaus teisių nereikia). Po įdiegimo atidarykite naują PowerShell, Command Prompt arba Windows Terminal skirtuką — esami apvalkalai pakeitimo nematys.',
        linux:
          'Linux deb/rpm scenarijus po įdiegimo automatiškai sukuria nuorodą <c>/usr/bin/rentgen</c>. Jei įdiegėte iš nešiojamo archyvo, šis mygtukas sukuria vartotojo simbolinę nuorodą į <c>/usr/local/bin/rentgen</c> (arba <c>~/.local/bin/rentgen</c> kaip atsarginį variantą).',
      },
      flag: {
        collection: 'Aplankas, kurį vykdyti iš projekto failo. Praleiskite, kad pasirinktumėte interaktyviai.',
        env: 'Aplinka, kurią naudoti. Perduokite --env=none, kad vykdytumėte be aplinkos.',
        skipIntegrityCheck: 'Praleisti kontrolinės sumos patvirtinimo užklausą.',
        var: 'Pakeisti kintamąjį. Galima kartoti. Aukščiausias prioritetas virš aplinkos ir dinaminių reikšmių.',
        timeout: 'Užklausos laiko limitas milisekundėmis. Numatytasis 30000.',
        failFast: 'Sustabdyti po pirmos nesėkmės.',
        report: 'Mašininis išvedimas. Palaikoma: json (rašo JSON į stdout, slopina žmonėms skirtą išvedimą).',
        noColor: 'Išjungti spalvotą išvedimą.',
        verbose: 'Spausdinti pilną užklausos/atsakymo informaciją ir įspėti apie neišspręstus kintamuosius.',
      },
      exit: {
        code0: 'Visos užklausos sėkmingos.',
        code1: 'Vykdymas baigtas su nesėkmėmis, nutrauktas kontrolinės sumos užklausoje arba pertrauktas Ctrl+C.',
        code2:
          'Neteisingas įvedimas: trūksta failo, blogas JSON, neteisinga struktūra, dviprasmiškas arba nežinomas --collection / --env, arba CI režimas be būtinų vėliavų.',
      },
    },
    history: {
      title: 'Istorija',
      description: 'Konfigūruokite, kaip renkama ir saugoma užklausų istorija.',
      enableHistory: 'Įjungti istoriją',
      maximumSize: 'Maksimalus dydis',
      retentionPeriod: 'Saugojimo laikotarpis',
      week1: '1 savaitė',
      month1: '1 mėnuo',
      months3: '3 mėnesiai',
      months6: '6 mėnesiai',
      year1: '1 metai',
      noRetention: 'Be apribojimo',
    },
    project: {
      title: 'Projektas',
      description:
        'Eksportuokite arba importuokite visą projektą, įskaitant kolekcijas, aplinkas, kintamuosius, istoriją ir nustatymus.',
      exportProject: 'Eksportuoti projektą',
      importProject: 'Importuoti projektą',
    },
    configuration: {
      title: 'Konfigūracija',
      description: 'Konfigūruokite taisykles ir ribas atsitiktinių testų duomenų generavimui.',
      email: 'El. paštas',
      domain: 'Domenas',
      randomEmailLength: 'Atsitiktinio el. pašto ilgis',
      enum: 'Enum',
      enumDescription: 'Įveskite visas galimas reikšmes, atskirtas „,"',
      number: 'Skaičius',
      minimumValue: 'Minimali reikšmė',
      maximumValue: 'Maksimali reikšmė',
      string: 'Eilutė',
      maximumValueLength: 'Maksimalus reikšmės ilgis',
      randomInteger: 'Atsitiktinis sveikasis skaičius',
      randomString: 'Atsitiktinė eilutė',
      length: 'Ilgis',
    },
    securityTests: {
      title: 'Saugumo testai',
      enabledCount: '{{enabled}}/{{total}} įjungta',
      description: 'Įjunkite arba išjunkite atskirus saugumo testus, kad pritaikytumėte savo testavimo patirtį.',
    },
    languageSection: {
      title: 'Kalba',
      description: 'Pasirinkite pageidaujamą programos sąsajos kalbą.',
      feedback:
        'Radote vertimo klaidą arba norite pridėti kitą kalbą? Sukurkite užklausą su visa informacija ir mes padarysime viską, ką galime.',
      feedbackLink: 'Atidaryti GitHub užklausą',
    },
  },

  // Controls
  controls: {
    sizeMB: 'Dydis (MB)',
    sizeMax: 'Dydis (maks. {{max}} MB)',
    threads: 'Gijos',
    threadsMax: 'Gijos (maks. 100)',
    requests: 'Užklausos',
    requestsMax: 'Iš viso užklausų (maks. 10 000)',
    mandatoryToggle: 'Įjungta = Privaloma → Rentgen generuoja testus pagal šį nustatymą',
    enumLabel: 'Įveskite visas galimas reikšmes, atskirtas „,"',
    numberLabel: 'Nustatykite Min/Max intervalą ribiniam testui. 0 - sveikasis, 0.00 - dešimtainis',
    stringLabel: 'Maksimalus reikšmės ilgis',
    minPlaceholder: 'Min',
    maxPlaceholder: 'Maks',
  },

  // Parameter types
  parameterTypes: {
    doNotTest: 'Netestuoti',
    randomEmail: 'Atsitiktinis el. paštas',
    randomInteger: 'Atsitiktinis sveikasis skaičius',
    randomString: 'Atsitiktinė eilutė',
    boolean: 'Boolean',
    currency: 'Valiuta',
    dateYYYYMMDD: 'Data (YYYY-MM-DD)',
    email: 'El. paštas',
    enum: 'Enum',
    number: 'Skaičius',
    phone: 'Telefonas',
    string: 'Eilutė',
    url: 'URL',
  },

  // Tables
  tables: {
    parameter: 'Parametras',
    value: 'Reikšmė',
    check: 'Patikra',
    method: 'Metodas',
    expected: 'Tikėtina',
    actual: 'Gauta',
    result: 'Rezultatas',
    name: 'Pavadinimas',
    description: 'Aprašymas',
    request: 'Užklausa',
  },

  // Context Menu
  contextMenu: {
    setAsVariable: 'Nustatyti kaip kintamąjį',
    saveRequestFirst: 'Pirmiausia išsaugokite užklausą kolekcijoje',
    setAsDynamicVariableTitle: 'Nustatyti „{{path}}" kaip dinaminį kintamąjį',
  },

  // Badges
  badges: {
    verified: 'Patvirtinta',
    modified: 'Pakeista',
    noChecksum: 'Nėra kontrolinės sumos',
  },

  // File input
  fileInput: {
    chooseFile: 'Pasirinkti failą',
    noFileChosen: 'Failas nepasirinktas',
  },

  // Protobuf
  protobuf: {
    decodedProtobuf: 'Dekoduotas Protobuf:',
  },

  // Messages panel
  messages: {
    title: 'Žinutės',
  },

  // Export format labels
  exportFormats: {
    json: 'JSON (.json)',
    markdown: 'Markdown (.md)',
    csv: 'CSV (.csv)',
  },
};

export default lt;
