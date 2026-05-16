const it = {
  // Common
  common: {
    send: 'Invia',
    save: 'Salva',
    saved: 'Salvato ✅',
    cancel: 'Annulla',
    close: 'Chiudi',
    ok: 'OK',
    create: 'Crea',
    delete: 'Elimina',
    import: 'Importa',
    export: 'Esporta',
    copy: 'Copia',
    copied: 'Copiato ✅',
    run: 'Esegui',
    replace: 'Sostituisci',
    merge: 'Unisci',
    overwrite: 'Sovrascrivi',
    enabled: 'Abilitato',
    disabled: 'Disabilitato',
    warning: 'Attenzione:',
    connect: 'Connetti',
    disconnect: 'Disconnetti',
    beautify: 'Formatta',
    reload: 'Ricarica',
    cut: 'Taglia',
    paste: 'Incolla',
  },

  // Sidebar
  sidebar: {
    collections: 'Raccolte',
    environments: 'Ambienti',
    history: 'Cronologia',
    settings: 'Impostazioni',
    checkForUpdates: 'Verifica aggiornamenti',
    reportFeedback: 'Invia un feedback',
  },

  // Collections Panel
  collections: {
    newFolder: 'Nuova cartella',
    importCollection: 'Importa raccolta',
    exportCollection: 'Esporta raccolta',
    searchCollections: 'Cerca raccolte...',
    noMatchingRequests: 'Nessuna richiesta corrispondente',
    noSavedRequests: 'Nessuna richiesta salvata',
    importFailed: 'Importazione non riuscita: {{error}}',
    exportFailed: 'Esportazione non riuscita: {{error}}',
    importedWithWarnings: 'Importato con {{count}} avviso/i',
    collectionImported: 'Raccolta importata',
    collectionExported: 'Raccolta esportata',
  },

  // Environment
  environment: {
    newEnvironment: 'Nuovo ambiente',
    editEnvironment: 'Modifica ambiente',
    noEnvironmentsCreated: 'Nessun ambiente creato',
    environmentName: 'Nome ambiente',
    environmentNamePlaceholder: 'es. Production, Staging, Local',
    color: 'Colore',
    variables: 'Variabili',
    variableName: 'Nome variabile',
    addVariable: 'Aggiungi variabile',
    value: 'Valore',
    refreshValue: 'Aggiorna valore',
    refreshAll: 'Aggiorna tutto',
    noEnvironment: 'Nessun ambiente',
    selectEnvironment: 'Seleziona ambiente',
    randomEmail: 'Email casuale',
    randomInteger: 'Intero casuale',
    randomString: 'Stringa casuale',
    deleteEnvironmentConfirm: 'Sei sicuro di voler eliminare questo ambiente?',
    deleteEnvironment: 'Elimina ambiente',
    untitled: 'Senza titolo',
  },

  // History
  history: {
    title: 'Cronologia',
    clearAll: 'Cancella tutto',
    searchHistory: 'Cerca nella cronologia...',
    noMatchingHistory: 'Nessuna cronologia corrispondente',
    noHistoryYet: 'Nessuna cronologia ancora',
    today: 'Oggi',
    yesterday: 'Ieri',
  },

  // Request
  request: {
    enterUrl: 'Inserisci URL o incolla testo',
    headers: 'Intestazioni',
    headersPlaceholder: 'Chiave-intestazione: valore',
    body: 'Corpo',
    bodyPlaceholderHttp: 'Inserisci il corpo della richiesta (JSON o Form Data)',
    bodyPlaceholderWss: 'Corpo del messaggio',
    protobufSchema: 'Schema Protobuf e tipo di messaggio',
    protobufDescription: 'Sezione sperimentale e facoltativa. Se utilizzata, entrambi i campi devono essere compilati',
    messageTypePlaceholder: 'Tipo di messaggio (es. mypackage.MyMessage)',
    protoSchemaLoaded: '🟢 Schema proto caricato',
    protoSchemaParseFailed: '🔴 Impossibile analizzare il proto: ',
    wssUrlRequired: '🔴 Utilizza un URL ws:// o wss://',
    modePlaceholder: 'MODALITÀ',
    methodPlaceholder: 'METODO',
  },

  // Response
  response: {
    title: 'Risposta',
    sending: 'Invio in corso...',
    networkError: 'Errore di rete',
  },

  // cURL
  curl: {
    importCurl: 'Importa cURL',
    importCurlPlaceholder: 'Inserisci cURL o incolla testo',
    invalidCurl: 'Il comando cURL fornito sembra non valido. Verificalo e riprova',
    copyCurl: 'Copia cURL',
  },

  // Tests
  tests: {
    generateAndRun: 'Genera ed esegui test',
    runningTests: 'Esecuzione test in corso... ({{current}}/{{total}})',
    selectForCompare: 'Seleziona per confronto',
    compareWithSelected: 'Confronta con la selezione',
    exportFormat: 'Formato',
    exported: 'Esportato ✅',
    generateCertificate: 'Genera certificato',
    certificated: 'Certificato ✅',
    notEligible: 'Non idoneo (sono necessari almeno 70 test)',
    securityTests: 'Test di sicurezza',
    performanceInsights: 'Analisi delle prestazioni',
    dataDrivenTests: 'Test basati sui dati',
    crud: 'CRUD',
    runningSecurityTests: 'Esecuzione test di sicurezza...',
    runningPerformanceInsights: 'Esecuzione analisi delle prestazioni...',
    runningDataDrivenTests: 'Esecuzione test basati sui dati...',
    preparingCrud: 'Preparazione CRUD…',
    crudDescription:
      'I CRUD sono generati in base alla risposta del test di gestione del metodo OPTIONS nei test di sicurezza.',
    crudNote: 'Nota:',
    crudNoteText: 'Se il test di gestione del metodo OPTIONS è disabilitato, i CRUD non verranno generati.',
    copyBugReport: 'Copia segnalazione bug',
    computingDifferences: 'Calcolo delle differenze…',
    bodyParameters: 'Parametri del corpo',
    queryParameters: 'Parametri query',
    formatPlaceholder: 'Formato',
  },

  // Comparison Panel
  comparison: {
    title: 'Confronto dei risultati dei test',
    noTestResults: 'Nessun risultato di test da confrontare',
    potentialBugs: 'Bug potenziali',
    fullBehaviorChanges: 'Modifiche di comportamento complete',
    noPotentialBugs: 'Nessun bug potenziale rilevato ✅',
    showFullBehaviorChanges: 'Mostra modifiche di comportamento complete',
    behaviorChange: 'Modifica del comportamento:',
    showNoise: 'Mostra rumore',
  },

  // Modals
  modals: {
    reload: {
      title: 'Ricarica',
      description: 'Andranno persi solo i risultati dei test correnti',
      confirmText: 'Ricarica',
    },
    sendHttpSuccess: {
      title: 'La richiesta sembra valida!',
      description:
        'Rentgen dispone ora di una richiesta valida con cui lavorare. Prima di generare i test, controlla rapidamente i campi mappati per assicurarti che tutto sia corretto',
      confirmText: 'Verifica e genera test',
      doNotShowAgain: 'Non mostrare più',
    },
    deleteFolder: {
      title: 'Elimina cartella',
      description: 'Questa cartella contiene richieste. Sei sicuro di volerla eliminare?',
    },
    importConflict: {
      title: 'Rilevati conflitti di importazione',
      conflictDescription: 'La raccolta importata "{{name}}" presenta conflitti con la tua raccolta esistente:',
      collectionNamesMatch: 'I nomi delle raccolte coincidono',
      folderConflicts: '{{count}} cartella/e con nomi coincidenti',
      requestConflicts: '{{count}} richiesta/e con URL+Metodo o nome coincidenti',
      importWarnings: 'Avvisi di importazione: {{count}}',
      replaceDescription: "Sostituisci l'intera raccolta esistente ({{folders}} cartelle, {{requests}} richieste)",
      mergeDescription: 'Aggiungi solo gli elementi univoci (ignora i duplicati per URL+Metodo o nome)',
      newFolders: '{{count}} nuova/e cartella/e',
      newRequests: '{{count}} nuova/e richiesta/e',
      noNewItems: 'Nessun nuovo elemento da aggiungere',
      importAsCopy: 'Importa come copia',
      copyDescription:
        'Aggiungi tutte le cartelle con il suffisso "(copia)" ({{folders}} cartelle, {{requests}} richieste)',
    },
    setDynamicVariable: {
      title: 'Imposta come variabile dinamica',
      editTitle: 'Modifica variabile dinamica',
      variableName: 'Nome variabile',
      variableNamePlaceholder: 'nome_variabile',
      preview: 'Anteprima:',
      environment: 'Ambiente',
      allEnvironments: 'Tutti gli ambienti',
      untitledEnvironment: 'Ambiente senza titolo',
      selectEnvironment: 'Seleziona ambiente...',
      linkedRequest: 'Richiesta collegata',
      variableNameRequired: 'Il nome della variabile è obbligatorio',
      selectorRequired: 'Il selettore è obbligatorio',
      selectEnvironmentError: 'Seleziona un ambiente',
      duplicateWarning: 'Esiste già una variabile con questo nome. Verrà sovrascritta.',
      saveVariable: 'Salva variabile',
      updateVariable: 'Aggiorna variabile',
    },
    projectImport: {
      title: 'Importa progetto',
      file: 'File',
      exported: 'Esportato',
      appVersion: "Versione dell'app",
      integrity: 'Integrità',
      integrityWarning:
        'Il controllo di integrità del file non è riuscito. Questo file potrebbe essere stato modificato al di fuori di Rentgen. Procedi con cautela.',
      overwriteWarning: 'Questa operazione sovrascriverà TUTTI i tuoi dati attuali:',
      collectionsCount: 'Raccolte ({{folders}} cartelle, {{requests}} richieste)',
      environmentsCount: 'Ambienti ({{count}} ambienti)',
      dynamicVariablesCount: 'Variabili dinamiche ({{count}} variabili)',
      historyCount: 'Cronologia ({{count}} voci)',
      settingsInfo: 'Impostazioni (tema, motore di test, configurazione cronologia)',
      cannotBeUndone: 'Questa azione non può essere annullata.',
      backupBefore: "Esegui il backup del progetto attuale prima dell'importazione:",
      exportedCheck: 'Esportato ✓',
      exportCurrentProject: 'Esporta progetto attuale',
      importProject: 'Importa progetto',
    },
  },

  // Settings
  settings: {
    testEngine: 'Motore di test',
    general: 'Generale',
    themes: 'Temi',
    language: 'Lingua',
    themesDescription: 'Personalizza la tua esperienza con temi che si adattano al tuo stile.',
    themeLight: 'Chiaro',
    themeDark: 'Scuro',
    cli: {
      name: 'CLI',
      intro:
        'La CLI di Rentgen esegue una cartella di richieste a partire da un export di progetto <c>.rentgen</c>, direttamente dal terminale — pensata per pipeline CI e smoke test scriptati. Legge lo stesso file prodotto da <e>Generale → Esporta progetto</e> e non vi riscrive mai.',
      fullDocumentation: 'Documentazione completa:',
      installInPath: 'Installa nel PATH della shell ({{platform}})',
      checkingStatus: "Verifica dello stato d'installazione…",
      runCli: 'Esegui la CLI',
      runCliDescription:
        "Rentgen espone un unico sottocomando, <c>xray</c> (alias: <c>run</c>). Puntalo a un file di progetto esportato dall'app.",
      exportProject: 'Esporta progetto',
      noProjectFileYet:
        'Non hai ancora un file di progetto? Esportane uno ora — stessa azione di <e>Generale → Esporta progetto</e>.',
      developmentNote:
        'Durante lo sviluppo, invocala direttamente dal repository con <c>npm run dev:cli -- xray …</c>.',
      options: 'Opzioni',
      examples: 'Esempi',
      exampleInteractive: 'Scegli una cartella e un ambiente in modo interattivo:',
      exampleCi: 'Esecuzione CI scriptata con cartella e ambiente espliciti, con arresto immediato:',
      exampleCiJson: 'Output leggibile dalla macchina per pipeline CI (GitHub Actions, Jenkins, notifiche Slack):',
      exampleOverrideVars: 'Sovrascrivi le variabili al punto di chiamata (priorità più alta):',
      integrityCheck: 'Controllo di integrità',
      integrityCheckDescription:
        "Ogni export di progetto contiene un checksum SHA-256 dei suoi dati. Al caricamento, la CLI ricalcola il checksum. Se corrisponde, l'esecuzione prosegue silenziosamente. Se è mancante o manomesso, vedrai un prompt di conferma in un TTY o un errore in CI. <c>--skip-integrity-check</c> aggira il controllo — usalo quando sai che il file è stato modificato a mano di proposito.",
      exitCodesTitle: 'Codici di uscita',
      idempotency: 'Idempotency',
      idempotencyDescription:
        'La CLI non scrive mai sul file di progetto. Le variabili dinamiche estratte dalle risposte vengono mantenute in memoria per la durata di una singola esecuzione, in modo che due invocazioni consecutive su un progetto non modificato producano URL, intestazioni e corpi risolti identici byte per byte.',
      platform: {
        macos: 'macOS',
        windows: 'Windows',
        linux: 'Linux',
      },
      status: {
        binaryUnavailable: 'Binario CLI non disponibile',
        binaryUnavailableReinstall: "Reinstalla l'ultima build di Rentgen per abilitare la CLI.",
        installed: 'Installato',
        managedByPackageManager: ' (gestito dal gestore pacchetti)',
        conflictingPath: '`rentgen` in conflitto nel PATH',
        conflictingPathDescription:
          "<c>{{path}}</c> è nel PATH ma non punta a questa installazione di Rentgen. Rimuovilo, altrimenti l'installazione qui lo nasconderà.",
        notInstalled: 'Non installato',
        notInstalledDescription:
          'Clicca su <e>Installa</e> qui sotto per aggiungere <c>rentgen</c> al PATH della tua shell.',
      },
      action: {
        working: 'In corso…',
        uninstall: 'Disinstalla la CLI',
        reinstall: 'Reinstalla',
        installRentgenInPath: 'Installa il comando rentgen nel PATH',
        packageManagerNote:
          'Il gestore pacchetti Linux gestisce installazione e rimozione. Usa <c>sudo apt remove rentgen</c> / <c>sudo dnf remove rentgen</c> per disinstallare.',
      },
      platformTip: {
        macos:
          "macOS ti chiederà la password per scrivere il symlink in <c>/usr/local/bin/rentgen</c>. Dopo l'installazione, apri una nuova scheda del Terminale per rilevare la modifica.",
        windows:
          "L'installazione su Windows aggiunge la directory delle risorse di Rentgen al tuo PATH <e>utente</e> (non sono richiesti i privilegi di amministratore). Apri una nuova scheda di PowerShell, Prompt dei comandi o Windows Terminal dopo l'installazione — le shell esistenti non vedranno la modifica.",
        linux:
          'Su Linux, lo script postinstall deb/rpm crea automaticamente il link <c>/usr/bin/rentgen</c>. Se invece hai installato tramite un archivio portatile, questo pulsante crea un symlink utente in <c>/usr/local/bin/rentgen</c> (oppure <c>~/.local/bin/rentgen</c> come fallback).',
      },
      flag: {
        collection: 'Cartella da eseguire dal file di progetto. Omettila per scegliere in modo interattivo.',
        env: 'Ambiente da utilizzare. Passa --env=none per eseguire senza alcun ambiente.',
        skipIntegrityCheck: 'Salta il prompt di conferma del checksum.',
        var: "Sovrascrive una variabile. Ripetibile. Priorità più alta rispetto all'ambiente e ai valori dinamici.",
        timeout: 'Timeout per richiesta in millisecondi. Predefinito 30000.',
        failFast: 'Interrompi al primo errore.',
        report: "Output leggibile dalla macchina. Supportati: json (scrive JSON su stdout, sopprime l'output umano).",
        noColor: "Disabilita l'output a colori.",
        verbose: 'Stampa tutti i dettagli di richiesta/risposta e avvisa sulle variabili non risolte.',
      },
      exit: {
        code0: 'Tutte le richieste sono andate a buon fine.',
        code1: 'Esecuzione completata con errori, interrotta al prompt del checksum o interrotta con Ctrl+C.',
        code2:
          'Input non valido: file mancante, JSON errato, struttura sbagliata, --collection / --env ambiguo o sconosciuto, oppure modalità CI senza i flag richiesti.',
      },
    },
    history: {
      title: 'Cronologia',
      description: 'Configura come la cronologia delle richieste viene raccolta e conservata.',
      enableHistory: 'Abilita cronologia',
      maximumSize: 'Dimensione massima',
      retentionPeriod: 'Periodo di conservazione',
      week1: '1 settimana',
      month1: '1 mese',
      months3: '3 mesi',
      months6: '6 mesi',
      year1: '1 anno',
      noRetention: 'Nessuna conservazione',
    },
    project: {
      title: 'Progetto',
      description:
        "Esporta o importa l'intero progetto, comprese raccolte, ambienti, variabili, cronologia e impostazioni.",
      exportProject: 'Esporta progetto',
      importProject: 'Importa progetto',
    },
    configuration: {
      title: 'Configurazione',
      description: 'Configura regole e limiti per la generazione di valori di dati di test casuali.',
      email: 'Email',
      domain: 'Dominio',
      randomEmailLength: 'Lunghezza email casuale',
      enum: 'Enum',
      enumDescription: 'Inserisci tutti i valori validi separati da ","',
      number: 'Numero',
      minimumValue: 'Valore minimo',
      maximumValue: 'Valore massimo',
      string: 'Stringa',
      maximumValueLength: 'Lunghezza massima del valore',
      randomInteger: 'Intero casuale',
      randomString: 'Stringa casuale',
      length: 'Lunghezza',
    },
    securityTests: {
      title: 'Test di sicurezza',
      enabledCount: '{{enabled}}/{{total}} abilitati',
      description: 'Attiva o disattiva i singoli test di sicurezza per personalizzare la tua esperienza di test.',
    },
    languageSection: {
      title: 'Lingua',
      description: "Seleziona la lingua preferita per l'interfaccia dell'applicazione.",
      feedback:
        "Hai trovato un problema di traduzione o vuoi aggiungere un'altra lingua? Apri un ticket con tutti i dettagli e faremo del nostro meglio.",
      feedbackLink: 'Apri una segnalazione su GitHub',
    },
  },

  // Controls
  controls: {
    sizeMB: 'Dimensione (MB)',
    sizeMax: 'Dimensione (max {{max}} MB)',
    threads: 'Thread',
    threadsMax: 'Thread (max 100)',
    requests: 'Richieste',
    requestsMax: 'Totale richieste (max 10 000)',
    mandatoryToggle: 'Abilitato = Obbligatorio → Rentgen genera test in base a questa impostazione',
    enumLabel: 'Inserisci tutti i valori validi separati da ","',
    numberLabel: 'Imposta intervallo Min/Max per il test ai limiti. 0 - intero, 0,00 - decimale',
    stringLabel: 'Lunghezza massima del valore',
    minPlaceholder: 'Min',
    maxPlaceholder: 'Max',
  },

  // Parameter types
  parameterTypes: {
    doNotTest: 'Non testare',
    randomEmail: 'Email casuale',
    randomInteger: 'Intero casuale',
    randomString: 'Stringa casuale',
    boolean: 'Booleano',
    currency: 'Valuta',
    dateYYYYMMDD: 'Data (AAAA-MM-GG)',
    email: 'Email',
    enum: 'Enum',
    number: 'Numero',
    phone: 'Telefono',
    string: 'Stringa',
    url: 'URL',
  },

  // Tables
  tables: {
    parameter: 'Parametro',
    value: 'Valore',
    check: 'Verifica',
    method: 'Metodo',
    expected: 'Atteso',
    actual: 'Effettivo',
    result: 'Risultato',
    name: 'Nome',
    description: 'Descrizione',
    request: 'Richiesta',
  },

  // Context Menu
  contextMenu: {
    setAsVariable: 'Imposta come variabile',
    saveRequestFirst: 'Salva prima la richiesta in una raccolta',
    setAsDynamicVariableTitle: 'Imposta "{{path}}" come variabile dinamica',
  },

  // Badges
  badges: {
    verified: 'Verificato',
    modified: 'Modificato',
    noChecksum: 'Nessun checksum',
  },

  // File input
  fileInput: {
    chooseFile: 'Scegli file',
    noFileChosen: 'Nessun file scelto',
  },

  // Protobuf
  protobuf: {
    decodedProtobuf: 'Protobuf decodificato:',
  },

  // Messages panel
  messages: {
    title: 'Messaggi',
  },

  // Export format labels
  exportFormats: {
    json: 'JSON (.json)',
    markdown: 'Markdown (.md)',
    csv: 'CSV (.csv)',
  },
};

export default it;
