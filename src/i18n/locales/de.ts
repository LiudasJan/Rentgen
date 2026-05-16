const de = {
  // Common
  common: {
    send: 'Senden',
    save: 'Speichern',
    saved: 'Gespeichert ✅',
    cancel: 'Abbrechen',
    close: 'Schließen',
    ok: 'OK',
    create: 'Erstellen',
    delete: 'Löschen',
    import: 'Importieren',
    export: 'Exportieren',
    copy: 'Kopieren',
    copied: 'Kopiert ✅',
    run: 'Ausführen',
    replace: 'Ersetzen',
    merge: 'Zusammenführen',
    overwrite: 'Überschreiben',
    enabled: 'Aktiviert',
    disabled: 'Deaktiviert',
    warning: 'Warnung:',
    connect: 'Verbinden',
    disconnect: 'Trennen',
    beautify: 'Formatieren',
    reload: 'Neu laden',
    cut: 'Ausschneiden',
    paste: 'Einfügen',
  },

  // Sidebar
  sidebar: {
    collections: 'Sammlungen',
    environments: 'Umgebungen',
    history: 'Verlauf',
    settings: 'Einstellungen',
    checkForUpdates: 'Nach Updates suchen',
    reportFeedback: 'Feedback senden',
  },

  // Collections Panel
  collections: {
    newFolder: 'Neuer Ordner',
    importCollection: 'Sammlung importieren',
    exportCollection: 'Sammlung exportieren',
    searchCollections: 'Sammlungen durchsuchen...',
    noMatchingRequests: 'Keine passenden Anfragen',
    noSavedRequests: 'Keine gespeicherten Anfragen',
    importFailed: 'Import fehlgeschlagen: {{error}}',
    exportFailed: 'Export fehlgeschlagen: {{error}}',
    importedWithWarnings: 'Importiert mit {{count}} Warnung(en)',
    collectionImported: 'Sammlung importiert',
    collectionExported: 'Sammlung exportiert',
  },

  // Environment
  environment: {
    newEnvironment: 'Neue Umgebung',
    editEnvironment: 'Umgebung bearbeiten',
    noEnvironmentsCreated: 'Keine Umgebungen erstellt',
    environmentName: 'Umgebungsname',
    environmentNamePlaceholder: 'z. B. Produktion, Staging, Lokal',
    color: 'Farbe',
    variables: 'Variablen',
    variableName: 'Variablenname',
    addVariable: 'Variable hinzufügen',
    value: 'Wert',
    refreshValue: 'Wert aktualisieren',
    refreshAll: 'Alle aktualisieren',
    noEnvironment: 'Keine Umgebung',
    selectEnvironment: 'Umgebung auswählen',
    randomEmail: 'Zufällige E-Mail',
    randomInteger: 'Zufällige Ganzzahl',
    randomString: 'Zufällige Zeichenkette',
    deleteEnvironmentConfirm: 'Möchten Sie diese Umgebung wirklich löschen?',
    deleteEnvironment: 'Umgebung löschen',
    untitled: 'Ohne Titel',
  },

  // History
  history: {
    title: 'Verlauf',
    clearAll: 'Alle löschen',
    searchHistory: 'Verlauf durchsuchen...',
    noMatchingHistory: 'Kein passender Verlauf',
    noHistoryYet: 'Noch kein Verlauf',
    today: 'Heute',
    yesterday: 'Gestern',
  },

  // Request
  request: {
    enterUrl: 'URL eingeben oder Text einfügen',
    headers: 'Header',
    headersPlaceholder: 'Header-Schlüssel: Wert',
    body: 'Body',
    bodyPlaceholderHttp: 'Anfrage-Body eingeben (JSON oder Form Data)',
    bodyPlaceholderWss: 'Nachrichten-Body',
    protobufSchema: 'Protobuf-Schema und Nachrichtentyp',
    protobufDescription: 'Experimenteller und optionaler Bereich. Bei Verwendung müssen beide Felder ausgefüllt werden',
    messageTypePlaceholder: 'Nachrichtentyp (z. B. mypackage.MyMessage)',
    protoSchemaLoaded: '🟢 Proto-Schema geladen',
    protoSchemaParseFailed: '🔴 Proto konnte nicht geparst werden: ',
    wssUrlRequired: '🔴 Bitte verwenden Sie eine ws:// oder wss:// URL',
    modePlaceholder: 'MODUS',
    methodPlaceholder: 'METHODE',
  },

  // Response
  response: {
    title: 'Antwort',
    sending: 'Sende...',
    networkError: 'Netzwerkfehler',
  },

  // cURL
  curl: {
    importCurl: 'cURL importieren',
    importCurlPlaceholder: 'cURL eingeben oder Text einfügen',
    invalidCurl:
      'Der angegebene cURL-Befehl scheint ungültig zu sein. Bitte überprüfen Sie ihn und versuchen Sie es erneut',
    copyCurl: 'cURL kopieren',
  },

  // Tests
  tests: {
    generateAndRun: 'Tests generieren und ausführen',
    runningTests: 'Tests werden ausgeführt... ({{current}}/{{total}})',
    selectForCompare: 'Zum Vergleichen auswählen',
    compareWithSelected: 'Mit Auswahl vergleichen',
    exportFormat: 'Format',
    exported: 'Exportiert ✅',
    generateCertificate: 'Zertifikat generieren',
    certificated: 'Zertifiziert ✅',
    notEligible: 'Nicht berechtigt (mindestens 70 Tests erforderlich)',
    securityTests: 'Sicherheitstests',
    performanceInsights: 'Performance-Analysen',
    dataDrivenTests: 'Datengetriebene Tests',
    crud: 'CRUD',
    runningSecurityTests: 'Sicherheitstests werden ausgeführt...',
    runningPerformanceInsights: 'Performance-Analysen werden ausgeführt...',
    runningDataDrivenTests: 'Datengetriebene Tests werden ausgeführt...',
    preparingCrud: 'CRUD wird vorbereitet…',
    crudDescription: 'CRUD wird auf Basis der Antwort des OPTIONS-Methodentests in den Sicherheitstests generiert.',
    crudNote: 'Hinweis:',
    crudNoteText: 'Wenn der OPTIONS-Methodentest deaktiviert ist, wird CRUD nicht generiert.',
    copyBugReport: 'Fehlerbericht kopieren',
    computingDifferences: 'Unterschiede werden berechnet…',
    bodyParameters: 'Body-Parameter',
    queryParameters: 'Query-Parameter',
    formatPlaceholder: 'Format',
  },

  // Comparison Panel
  comparison: {
    title: 'Vergleich der Testergebnisse',
    noTestResults: 'Keine Testergebnisse zum Vergleichen',
    potentialBugs: 'Potenzielle Fehler',
    fullBehaviorChanges: 'Vollständige Verhaltensänderungen',
    noPotentialBugs: 'Keine potenziellen Fehler erkannt ✅',
    showFullBehaviorChanges: 'Vollständige Verhaltensänderungen anzeigen',
    behaviorChange: 'Verhaltensänderung:',
    showNoise: 'Rauschen anzeigen',
  },

  // Modals
  modals: {
    reload: {
      title: 'Neu laden',
      description: 'Nur die aktuellen Testergebnisse gehen verloren',
      confirmText: 'Neu laden',
    },
    sendHttpSuccess: {
      title: 'Die Anfrage sieht gut aus!',
      description:
        'Rentgen hat nun eine gültige Anfrage zum Arbeiten. Bevor Sie Tests generieren, überprüfen Sie kurz die zugeordneten Felder, um sicherzustellen, dass alles korrekt aussieht',
      confirmText: 'Überprüfen und Tests generieren',
      doNotShowAgain: 'Nicht mehr anzeigen',
    },
    deleteFolder: {
      title: 'Ordner löschen',
      description: 'Dieser Ordner enthält Anfragen. Möchten Sie ihn wirklich löschen?',
    },
    importConflict: {
      title: 'Importkonflikte erkannt',
      conflictDescription: 'Die importierte Sammlung "{{name}}" hat Konflikte mit Ihrer bestehenden Sammlung:',
      collectionNamesMatch: 'Sammlungsnamen stimmen überein',
      folderConflicts: '{{count}} Ordner mit übereinstimmenden Namen',
      requestConflicts: '{{count}} Anfrage(n) mit übereinstimmender URL+Methode oder Namen',
      importWarnings: 'Importwarnungen: {{count}}',
      replaceDescription: 'Gesamte bestehende Sammlung ersetzen ({{folders}} Ordner, {{requests}} Anfragen)',
      mergeDescription: 'Nur eindeutige Elemente hinzufügen (Duplikate nach URL+Methode oder Name werden übersprungen)',
      newFolders: '{{count}} neue(r) Ordner',
      newRequests: '{{count}} neue Anfrage(n)',
      noNewItems: 'Keine neuen Elemente zum Hinzufügen',
      importAsCopy: 'Als Kopie importieren',
      copyDescription: 'Alle Ordner mit Suffix "(Kopie)" hinzufügen ({{folders}} Ordner, {{requests}} Anfragen)',
    },
    setDynamicVariable: {
      title: 'Als dynamische Variable festlegen',
      editTitle: 'Dynamische Variable bearbeiten',
      variableName: 'Variablenname',
      variableNamePlaceholder: 'variablen_name',
      preview: 'Vorschau:',
      environment: 'Umgebung',
      allEnvironments: 'Alle Umgebungen',
      untitledEnvironment: 'Umgebung ohne Titel',
      selectEnvironment: 'Umgebung auswählen...',
      linkedRequest: 'Verknüpfte Anfrage',
      variableNameRequired: 'Variablenname ist erforderlich',
      selectorRequired: 'Selektor ist erforderlich',
      selectEnvironmentError: 'Bitte wählen Sie eine Umgebung aus',
      duplicateWarning: 'Eine Variable mit diesem Namen existiert bereits. Sie wird überschrieben.',
      saveVariable: 'Variable speichern',
      updateVariable: 'Variable aktualisieren',
    },
    projectImport: {
      title: 'Projekt importieren',
      file: 'Datei',
      exported: 'Exportiert',
      appVersion: 'App-Version',
      integrity: 'Integrität',
      integrityWarning:
        'Integritätsprüfung der Datei fehlgeschlagen. Diese Datei wurde möglicherweise außerhalb von Rentgen verändert. Vorsichtig fortfahren.',
      overwriteWarning: 'Dies überschreibt ALLE Ihre aktuellen Daten:',
      collectionsCount: 'Sammlungen ({{folders}} Ordner, {{requests}} Anfragen)',
      environmentsCount: 'Umgebungen ({{count}} Umgebungen)',
      dynamicVariablesCount: 'Dynamische Variablen ({{count}} Variablen)',
      historyCount: 'Verlauf ({{count}} Einträge)',
      settingsInfo: 'Einstellungen (Design, Test-Engine, Verlaufskonfiguration)',
      cannotBeUndone: 'Diese Aktion kann nicht rückgängig gemacht werden.',
      backupBefore: 'Sichern Sie Ihr aktuelles Projekt vor dem Import:',
      exportedCheck: 'Exportiert ✓',
      exportCurrentProject: 'Aktuelles Projekt exportieren',
      importProject: 'Projekt importieren',
    },
  },

  // Settings
  settings: {
    testEngine: 'Test-Engine',
    general: 'Allgemein',
    themes: 'Designs',
    language: 'Sprache',
    themesDescription: 'Personalisieren Sie Ihre Erfahrung mit Designs, die zu Ihrem Stil passen.',
    themeLight: 'Hell',
    themeDark: 'Dunkel',
    cli: {
      name: 'CLI',
      intro:
        'Das Rentgen-CLI führt einen Ordner mit Anfragen aus einem <c>.rentgen</c>-Projektexport direkt vom Terminal aus — entwickelt für CI-Pipelines und skriptgesteuerte Smoke-Tests. Es liest dieselbe Datei, die von <e>Allgemein → Projekt exportieren</e> erzeugt wird, und schreibt nie zurück.',
      fullDocumentation: 'Vollständige Dokumentation:',
      installInPath: 'In Shell-PATH installieren ({{platform}})',
      checkingStatus: 'Installationsstatus wird geprüft…',
      runCli: 'CLI ausführen',
      runCliDescription:
        'Rentgen stellt einen einzigen Unterbefehl bereit, <c>xray</c> (Alias: <c>run</c>). Verweisen Sie ihn auf eine Projektdatei, die Sie aus der App exportiert haben.',
      exportProject: 'Projekt exportieren',
      noProjectFileYet:
        'Sie haben noch keine Projektdatei? Exportieren Sie jetzt eine — dieselbe Aktion wie <e>Allgemein → Projekt exportieren</e>.',
      developmentNote:
        'Während der Entwicklung können Sie es direkt aus dem Repository mit <c>npm run dev:cli -- xray …</c> aufrufen.',
      options: 'Optionen',
      examples: 'Beispiele',
      exampleInteractive: 'Wählen Sie einen Ordner und eine Umgebung interaktiv aus:',
      exampleCi: 'Skriptgesteuerte CI-Ausführung mit explizitem Ordner und Umgebung, mit schnellem Fehlschlag:',
      exampleCiJson: 'Maschinenlesbare Ausgabe für CI-Pipelines (GitHub Actions, Jenkins, Slack-Benachrichtigungen):',
      exampleOverrideVars: 'Variablen am Aufrufort überschreiben (höchste Priorität):',
      integrityCheck: 'Integritätsprüfung',
      integrityCheckDescription:
        'Jeder Projektexport enthält eine SHA-256-Prüfsumme seiner Daten. Beim Laden berechnet das CLI die Prüfsumme neu. Stimmt sie überein, läuft die Ausführung still weiter. Fehlt sie oder wurde sie manipuliert, erscheint eine Bestätigungsaufforderung im TTY oder ein Fehler in CI. <c>--skip-integrity-check</c> umgeht die Prüfung — verwenden Sie es, wenn Sie wissen, dass die Datei absichtlich von Hand bearbeitet wurde.',
      exitCodesTitle: 'Exit-Codes',
      idempotency: 'Idempotenz',
      idempotencyDescription:
        'Das CLI schreibt nie in die Projektdatei. Dynamische Variablen, die aus Antworten extrahiert werden, bleiben für die Dauer eines einzelnen Laufs im Speicher, sodass zwei aufeinanderfolgende Aufrufe gegen ein unverändertes Projekt byte-identische aufgelöste URLs, Header und Bodies erzeugen.',
      platform: {
        macos: 'macOS',
        windows: 'Windows',
        linux: 'Linux',
      },
      status: {
        binaryUnavailable: 'CLI-Binary nicht verfügbar',
        binaryUnavailableReinstall: 'Installieren Sie den neuesten Rentgen-Build neu, um das CLI zu aktivieren.',
        installed: 'Installiert',
        managedByPackageManager: ' (verwaltet vom Paketmanager)',
        conflictingPath: 'Konfliktbehaftetes `rentgen` im PATH',
        conflictingPathDescription:
          '<c>{{path}}</c> ist im PATH, verweist aber nicht auf diese Rentgen-Installation. Entfernen Sie es, sonst wird es durch die hiesige Installation überdeckt.',
        notInstalled: 'Nicht installiert',
        notInstalledDescription:
          'Klicken Sie unten auf <e>Installieren</e>, um <c>rentgen</c> zu Ihrem Shell-PATH hinzuzufügen.',
      },
      action: {
        working: 'Arbeite…',
        uninstall: 'CLI deinstallieren',
        reinstall: 'Neu installieren',
        installRentgenInPath: 'rentgen-Befehl im PATH installieren',
        packageManagerNote:
          'Der Linux-Paketmanager übernimmt Installation und Deinstallation. Verwenden Sie <c>sudo apt remove rentgen</c> / <c>sudo dnf remove rentgen</c> zum Deinstallieren.',
      },
      platformTip: {
        macos:
          'macOS fordert Ihr Passwort an, um den Symlink nach <c>/usr/local/bin/rentgen</c> zu schreiben. Öffnen Sie nach der Installation einen neuen Terminal-Tab, damit die Änderung wirksam wird.',
        windows:
          'Die Installation unter Windows fügt das Rentgen-Ressourcenverzeichnis zu Ihrem <e>Benutzer</e>-PATH hinzu (keine Admin-Rechte erforderlich). Öffnen Sie nach der Installation einen neuen PowerShell-, Eingabeaufforderungs- oder Windows-Terminal-Tab — bestehende Shells erkennen die Änderung nicht.',
        linux:
          'Unter Linux verknüpft das Postinstall-Skript von deb/rpm <c>/usr/bin/rentgen</c> automatisch. Wenn Sie stattdessen über ein portables Archiv installiert haben, erstellt diese Schaltfläche einen Benutzer-Symlink unter <c>/usr/local/bin/rentgen</c> (oder <c>~/.local/bin/rentgen</c> als Fallback).',
      },
      flag: {
        collection: 'Ordner, der aus der Projektdatei ausgeführt werden soll. Auslassen, um interaktiv auszuwählen.',
        env: 'Zu verwendende Umgebung. Übergeben Sie --env=none, um ohne Umgebung auszuführen.',
        skipIntegrityCheck: 'Bestätigungsaufforderung der Prüfsumme überspringen.',
        var: 'Eine Variable überschreiben. Wiederholbar. Höchste Priorität gegenüber Umgebung und dynamischen Werten.',
        timeout: 'Timeout pro Anfrage in Millisekunden. Standard 30000.',
        failFast: 'Nach dem ersten Fehlschlag stoppen.',
        report:
          'Maschinenlesbare Ausgabe. Unterstützt: json (schreibt JSON nach stdout, unterdrückt menschliche Ausgabe).',
        noColor: 'Farbige Ausgabe deaktivieren.',
        verbose: 'Vollständige Anfrage-/Antwortdetails ausgeben und vor nicht aufgelösten Variablen warnen.',
      },
      exit: {
        code0: 'Alle Anfragen erfolgreich.',
        code1: 'Lauf mit Fehlern abgeschlossen, an der Prüfsummenabfrage abgebrochen oder mit Strg+C unterbrochen.',
        code2:
          'Ungültige Eingabe: fehlende Datei, fehlerhaftes JSON, falsches Format, mehrdeutiges oder unbekanntes --collection / --env oder CI-Modus ohne die erforderlichen Flags.',
      },
    },
    history: {
      title: 'Verlauf',
      description: 'Konfigurieren Sie, wie der Anfrageverlauf erfasst und aufbewahrt wird.',
      enableHistory: 'Verlauf aktivieren',
      maximumSize: 'Maximale Größe',
      retentionPeriod: 'Aufbewahrungszeitraum',
      week1: '1 Woche',
      month1: '1 Monat',
      months3: '3 Monate',
      months6: '6 Monate',
      year1: '1 Jahr',
      noRetention: 'Keine Aufbewahrung',
    },
    project: {
      title: 'Projekt',
      description:
        'Exportieren oder importieren Sie Ihr gesamtes Projekt einschließlich Sammlungen, Umgebungen, Variablen, Verlauf und Einstellungen.',
      exportProject: 'Projekt exportieren',
      importProject: 'Projekt importieren',
    },
    configuration: {
      title: 'Konfiguration',
      description: 'Konfigurieren Sie Regeln und Grenzwerte für die Erzeugung zufälliger Testdatenwerte.',
      email: 'E-Mail',
      domain: 'Domain',
      randomEmailLength: 'Länge der zufälligen E-Mail',
      enum: 'Enum',
      enumDescription: 'Geben Sie alle gültigen Werte getrennt durch "," ein',
      number: 'Zahl',
      minimumValue: 'Minimalwert',
      maximumValue: 'Maximalwert',
      string: 'Zeichenkette',
      maximumValueLength: 'Maximale Wertelänge',
      randomInteger: 'Zufällige Ganzzahl',
      randomString: 'Zufällige Zeichenkette',
      length: 'Länge',
    },
    securityTests: {
      title: 'Sicherheitstests',
      enabledCount: '{{enabled}}/{{total}} aktiviert',
      description: 'Schalten Sie einzelne Sicherheitstests ein oder aus, um Ihre Testerfahrung anzupassen.',
    },
    languageSection: {
      title: 'Sprache',
      description: 'Wählen Sie Ihre bevorzugte Sprache für die Anwendungsoberfläche.',
      feedback:
        'Haben Sie ein Übersetzungsproblem gefunden oder möchten Sie eine weitere Sprache hinzufügen? Erstellen Sie ein Ticket mit allen Details und wir werden unser Bestes geben.',
      feedbackLink: 'GitHub-Issue öffnen',
    },
  },

  // Controls
  controls: {
    sizeMB: 'Größe (MB)',
    sizeMax: 'Größe (max. {{max}} MB)',
    threads: 'Threads',
    threadsMax: 'Threads (max. 100)',
    requests: 'Anfragen',
    requestsMax: 'Anfragen insgesamt (max. 10 000)',
    mandatoryToggle: 'Aktiviert = Pflicht → Rentgen generiert Tests basierend auf dieser Einstellung',
    enumLabel: 'Geben Sie alle gültigen Werte getrennt durch "," ein',
    numberLabel: 'Setzen Sie Min/Max-Bereich für Grenzwerttest. 0 - Ganzzahl, 0.00 - Dezimalzahl',
    stringLabel: 'Maximale Wertelänge',
    minPlaceholder: 'Min',
    maxPlaceholder: 'Max',
  },

  // Parameter types
  parameterTypes: {
    doNotTest: 'Nicht testen',
    randomEmail: 'Zufällige E-Mail',
    randomInteger: 'Zufällige Ganzzahl',
    randomString: 'Zufällige Zeichenkette',
    boolean: 'Boolean',
    currency: 'Währung',
    dateYYYYMMDD: 'Datum (JJJJ-MM-TT)',
    email: 'E-Mail',
    enum: 'Enum',
    number: 'Zahl',
    phone: 'Telefon',
    string: 'Zeichenkette',
    url: 'URL',
  },

  // Tables
  tables: {
    parameter: 'Parameter',
    value: 'Wert',
    check: 'Prüfung',
    method: 'Methode',
    expected: 'Erwartet',
    actual: 'Tatsächlich',
    result: 'Ergebnis',
    name: 'Name',
    description: 'Beschreibung',
    request: 'Anfrage',
  },

  // Context Menu
  contextMenu: {
    setAsVariable: 'Als Variable festlegen',
    saveRequestFirst: 'Speichern Sie die Anfrage zuerst in einer Sammlung',
    setAsDynamicVariableTitle: '"{{path}}" als dynamische Variable festlegen',
  },

  // Badges
  badges: {
    verified: 'Verifiziert',
    modified: 'Geändert',
    noChecksum: 'Keine Prüfsumme',
  },

  // File input
  fileInput: {
    chooseFile: 'Datei auswählen',
    noFileChosen: 'Keine Datei ausgewählt',
  },

  // Protobuf
  protobuf: {
    decodedProtobuf: 'Dekodiertes Protobuf:',
  },

  // Messages panel
  messages: {
    title: 'Nachrichten',
  },

  // Export format labels
  exportFormats: {
    json: 'JSON (.json)',
    markdown: 'Markdown (.md)',
    csv: 'CSV (.csv)',
  },
};

export default de;
