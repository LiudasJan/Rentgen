const nl = {
  // Common
  common: {
    send: 'Verzenden',
    save: 'Opslaan',
    saved: 'Opgeslagen ✅',
    cancel: 'Annuleren',
    close: 'Sluiten',
    ok: 'OK',
    create: 'Aanmaken',
    delete: 'Verwijderen',
    import: 'Importeren',
    export: 'Exporteren',
    copy: 'Kopiëren',
    copied: 'Gekopieerd ✅',
    run: 'Uitvoeren',
    replace: 'Vervangen',
    merge: 'Samenvoegen',
    overwrite: 'Overschrijven',
    enabled: 'Ingeschakeld',
    disabled: 'Uitgeschakeld',
    warning: 'Waarschuwing:',
    connect: 'Verbinden',
    disconnect: 'Verbinding verbreken',
    beautify: 'Opmaken',
    reload: 'Opnieuw laden',
    cut: 'Knippen',
    paste: 'Plakken',
  },

  // Sidebar
  sidebar: {
    collections: 'Collecties',
    environments: 'Omgevingen',
    history: 'Geschiedenis',
    settings: 'Instellingen',
    checkForUpdates: 'Controleren op updates',
    reportFeedback: 'Feedback geven',
  },

  // Collections Panel
  collections: {
    newFolder: 'Nieuwe map',
    importCollection: 'Collectie importeren',
    exportCollection: 'Collectie exporteren',
    searchCollections: 'Zoek in collecties...',
    noMatchingRequests: 'Geen overeenkomende verzoeken',
    noSavedRequests: 'Geen opgeslagen verzoeken',
    importFailed: 'Importeren mislukt: {{error}}',
    exportFailed: 'Exporteren mislukt: {{error}}',
    importedWithWarnings: 'Geïmporteerd met {{count}} waarschuwing(en)',
    collectionImported: 'Collectie geïmporteerd',
    collectionExported: 'Collectie geëxporteerd',
  },

  // Environment
  environment: {
    newEnvironment: 'Nieuwe omgeving',
    editEnvironment: 'Omgeving bewerken',
    noEnvironmentsCreated: 'Geen omgevingen aangemaakt',
    environmentName: 'Naam van omgeving',
    environmentNamePlaceholder: 'bijv. Productie, Staging, Lokaal',
    color: 'Kleur',
    variables: 'Variabelen',
    variableName: 'Naam variabele',
    addVariable: 'Variabele toevoegen',
    value: 'Waarde',
    refreshValue: 'Waarde vernieuwen',
    refreshAll: 'Alles vernieuwen',
    noEnvironment: 'Geen omgeving',
    selectEnvironment: 'Selecteer omgeving',
    randomEmail: 'Willekeurig e-mailadres',
    randomInteger: 'Willekeurig geheel getal',
    randomString: 'Willekeurige string',
    deleteEnvironmentConfirm: 'Weet je zeker dat je deze omgeving wilt verwijderen?',
    deleteEnvironment: 'Omgeving verwijderen',
    untitled: 'Naamloos',
  },

  // History
  history: {
    title: 'Geschiedenis',
    clearAll: 'Alles wissen',
    searchHistory: 'Zoek in geschiedenis...',
    noMatchingHistory: 'Geen overeenkomende geschiedenis',
    noHistoryYet: 'Nog geen geschiedenis',
    today: 'Vandaag',
    yesterday: 'Gisteren',
  },

  // Request
  request: {
    enterUrl: 'Voer URL in of plak tekst',
    headers: 'Headers',
    headersPlaceholder: 'Header-Key: waarde',
    body: 'Body',
    bodyPlaceholderHttp: 'Voer body van verzoek in (JSON of Form Data)',
    bodyPlaceholderWss: 'Body van bericht',
    protobufSchema: 'Protobuf-schema & berichttype',
    protobufDescription: 'Experimentele en optionele sectie. Bij gebruik moeten beide velden worden ingevuld',
    messageTypePlaceholder: 'Berichttype (bijv. mypackage.MyMessage)',
    protoSchemaLoaded: '🟢 Proto-schema geladen',
    protoSchemaParseFailed: '🔴 Proto kon niet worden geparseerd: ',
    wssUrlRequired: '🔴 Gebruik een ws:// of wss:// URL',
    modePlaceholder: 'MODUS',
    methodPlaceholder: 'METHODE',
  },

  // Response
  response: {
    title: 'Reactie',
    sending: 'Bezig met verzenden...',
    networkError: 'Netwerkfout',
  },

  // cURL
  curl: {
    importCurl: 'cURL importeren',
    importCurlPlaceholder: 'Voer cURL in of plak tekst',
    invalidCurl: 'Het opgegeven cURL-commando lijkt ongeldig. Controleer het en probeer het opnieuw',
    copyCurl: 'cURL kopiëren',
  },

  // Tests
  tests: {
    generateAndRun: 'Tests genereren en uitvoeren',
    runningTests: 'Tests worden uitgevoerd... ({{current}}/{{total}})',
    selectForCompare: 'Selecteren om te vergelijken',
    compareWithSelected: 'Vergelijken met geselecteerde',
    exportFormat: 'Formaat',
    exported: 'Geëxporteerd ✅',
    generateCertificate: 'Certificaat genereren',
    certificated: 'Gecertificeerd ✅',
    notEligible: 'Niet geschikt (minimaal 70 tests nodig)',
    securityTests: 'Beveiligingstests',
    performanceInsights: 'Prestatie-inzichten',
    dataDrivenTests: 'Datagedreven tests',
    crud: 'CRUD',
    runningSecurityTests: 'Beveiligingstests worden uitgevoerd...',
    runningPerformanceInsights: 'Prestatie-inzichten worden uitgevoerd...',
    runningDataDrivenTests: 'Datagedreven tests worden uitgevoerd...',
    preparingCrud: 'CRUD wordt voorbereid…',
    crudDescription:
      'CRUD wordt gegenereerd op basis van de testreactie voor de OPTIONS-methode in de beveiligingstests.',
    crudNote: 'Let op:',
    crudNoteText: 'Als de test voor de OPTIONS-methode is uitgeschakeld, wordt CRUD niet gegenereerd.',
    copyBugReport: 'Bugrapport kopiëren',
    computingDifferences: 'Verschillen worden berekend…',
    bodyParameters: 'Body-parameters',
    queryParameters: 'Queryparameters',
    formatPlaceholder: 'Formaat',
  },

  // Comparison Panel
  comparison: {
    title: 'Vergelijking van testresultaten',
    noTestResults: 'Geen testresultaten om te vergelijken',
    potentialBugs: 'Mogelijke bugs',
    fullBehaviorChanges: 'Volledige gedragswijzigingen',
    noPotentialBugs: 'Geen mogelijke bugs gedetecteerd ✅',
    showFullBehaviorChanges: 'Toon volledige gedragswijzigingen',
    behaviorChange: 'Gedragswijziging:',
    showNoise: 'Toon ruis',
  },

  // Modals
  modals: {
    reload: {
      title: 'Opnieuw laden',
      description: 'Alleen de huidige testresultaten gaan verloren',
      confirmText: 'Opnieuw laden',
    },
    sendHttpSuccess: {
      title: 'Het verzoek ziet er goed uit!',
      description:
        'Rentgen heeft nu een geldig verzoek om mee te werken. Bekijk vóór het genereren van tests snel de toegewezen velden om te controleren of alles klopt',
      confirmText: 'Bekijken en tests genereren',
      doNotShowAgain: 'Niet meer tonen',
    },
    deleteFolder: {
      title: 'Map verwijderen',
      description: 'Deze map bevat verzoeken. Weet je zeker dat je hem wilt verwijderen?',
    },
    importConflict: {
      title: 'Importconflicten gedetecteerd',
      conflictDescription: 'De geïmporteerde collectie "{{name}}" heeft conflicten met je bestaande collectie:',
      collectionNamesMatch: 'Collectienamen komen overeen',
      folderConflicts: '{{count}} map(pen) met overeenkomende namen',
      requestConflicts: '{{count}} verzoek(en) met overeenkomende URL+methode of naam',
      importWarnings: 'Importwaarschuwingen: {{count}}',
      replaceDescription: 'Bestaande collectie volledig vervangen ({{folders}} mappen, {{requests}} verzoeken)',
      mergeDescription: 'Alleen unieke items toevoegen (slaat duplicaten op basis van URL+methode of naam over)',
      newFolders: '{{count}} nieuwe map(pen)',
      newRequests: '{{count}} nieuw(e) verzoek(en)',
      noNewItems: 'Geen nieuwe items om toe te voegen',
      importAsCopy: 'Importeren als kopie',
      copyDescription: 'Alle mappen toevoegen met achtervoegsel "(kopie)" ({{folders}} mappen, {{requests}} verzoeken)',
    },
    setDynamicVariable: {
      title: 'Instellen als dynamische variabele',
      editTitle: 'Dynamische variabele bewerken',
      variableName: 'Naam variabele',
      variableNamePlaceholder: 'variabele_naam',
      preview: 'Voorbeeld:',
      environment: 'Omgeving',
      allEnvironments: 'Alle omgevingen',
      untitledEnvironment: 'Naamloze omgeving',
      selectEnvironment: 'Selecteer omgeving...',
      linkedRequest: 'Gekoppeld verzoek',
      variableNameRequired: 'Naam van variabele is verplicht',
      selectorRequired: 'Selector is verplicht',
      selectEnvironmentError: 'Selecteer een omgeving',
      duplicateWarning: 'Er bestaat al een variabele met deze naam. Deze wordt overschreven.',
      saveVariable: 'Variabele opslaan',
      updateVariable: 'Variabele bijwerken',
    },
    projectImport: {
      title: 'Project importeren',
      file: 'Bestand',
      exported: 'Geëxporteerd',
      appVersion: 'App-versie',
      integrity: 'Integriteit',
      integrityWarning:
        'Integriteitscontrole van bestand mislukt. Dit bestand is mogelijk buiten Rentgen aangepast. Ga voorzichtig te werk.',
      overwriteWarning: 'Hiermee worden AL je huidige gegevens overschreven:',
      collectionsCount: 'Collecties ({{folders}} mappen, {{requests}} verzoeken)',
      environmentsCount: 'Omgevingen ({{count}} omgevingen)',
      dynamicVariablesCount: 'Dynamische variabelen ({{count}} variabelen)',
      historyCount: 'Geschiedenis ({{count}} items)',
      settingsInfo: 'Instellingen (thema, testengine, geschiedenisconfiguratie)',
      cannotBeUndone: 'Deze actie kan niet ongedaan worden gemaakt.',
      backupBefore: 'Maak een back-up van je huidige project voordat je importeert:',
      exportedCheck: 'Geëxporteerd ✓',
      exportCurrentProject: 'Huidig project exporteren',
      importProject: 'Project importeren',
    },
  },

  // Settings
  settings: {
    testEngine: 'Testengine',
    general: 'Algemeen',
    themes: "Thema's",
    language: 'Taal',
    themesDescription: "Personaliseer je ervaring met thema's die bij jouw stijl passen.",
    themeLight: 'Licht',
    themeDark: 'Donker',
    cli: {
      name: 'CLI',
      intro:
        'De Rentgen CLI voert een map met verzoeken uit een <c>.rentgen</c> projectexport uit, rechtstreeks vanuit de terminal — gebouwd voor CI-pipelines en gescripte smoke tests. Het leest hetzelfde bestand dat wordt aangemaakt door <e>Algemeen → Project exporteren</e> en schrijft er nooit naar terug.',
      fullDocumentation: 'Volledige documentatie:',
      installInPath: 'Installeren in shell-PATH ({{platform}})',
      checkingStatus: 'Installatiestatus controleren…',
      runCli: 'De CLI uitvoeren',
      runCliDescription:
        'Rentgen biedt één subcommando, <c>xray</c> (alias: <c>run</c>). Wijs het naar een projectbestand dat je vanuit de app hebt geëxporteerd.',
      exportProject: 'Project exporteren',
      noProjectFileYet:
        'Heb je nog geen projectbestand? Exporteer er nu een — dezelfde actie als <e>Algemeen → Project exporteren</e>.',
      developmentNote:
        'Roep het tijdens de ontwikkeling rechtstreeks vanuit de repo aan met <c>npm run dev:cli -- xray …</c>.',
      options: 'Opties',
      examples: 'Voorbeelden',
      exampleInteractive: 'Kies interactief een map en omgeving:',
      exampleCi: 'Gescripte CI-uitvoering met expliciete map en omgeving, fail fast:',
      exampleCiJson: 'Machineleesbare uitvoer voor CI-pipelines (GitHub Actions, Jenkins, Slack-notifiers):',
      exampleOverrideVars: 'Overschrijf variabelen op de aanroeplocatie (hoogste prioriteit):',
      integrityCheck: 'Integriteitscontrole',
      integrityCheckDescription:
        'Elke projectexport bevat een SHA-256-checksum van de gegevens. Bij het laden berekent de CLI de checksum opnieuw. Als die overeenkomt, verloopt de uitvoering stil. Als die ontbreekt of is aangepast, krijg je een bevestigingsprompt in een TTY of een foutmelding in CI. <c>--skip-integrity-check</c> omzeilt deze controle — gebruik dit wanneer je weet dat het bestand bewust met de hand is bewerkt.',
      exitCodesTitle: 'Exitcodes',
      idempotency: 'Idempotentie',
      idempotencyDescription:
        'De CLI schrijft nooit naar het projectbestand. Dynamische variabelen die uit reacties worden geëxtraheerd, worden voor de duur van één uitvoering in het geheugen bewaard, zodat twee opeenvolgende aanroepen op een ongewijzigd project byte-identieke opgeloste URL’s, headers en bodies opleveren.',
      platform: {
        macos: 'macOS',
        windows: 'Windows',
        linux: 'Linux',
      },
      status: {
        binaryUnavailable: 'CLI-binary niet beschikbaar',
        binaryUnavailableReinstall: 'Installeer de nieuwste Rentgen-build opnieuw om de CLI in te schakelen.',
        installed: 'Geïnstalleerd',
        managedByPackageManager: ' (beheerd door pakketbeheerder)',
        conflictingPath: 'Conflicterende `rentgen` in PATH',
        conflictingPathDescription:
          '<c>{{path}}</c> staat in PATH maar verwijst niet naar deze Rentgen-installatie. Verwijder het of een installatie hier zal het overschaduwen.',
        notInstalled: 'Niet geïnstalleerd',
        notInstalledDescription:
          'Klik hieronder op <e>Installeren</e> om <c>rentgen</c> aan je shell-PATH toe te voegen.',
      },
      action: {
        working: 'Bezig…',
        uninstall: 'CLI verwijderen',
        reinstall: 'Opnieuw installeren',
        installRentgenInPath: 'Rentgen-commando installeren in PATH',
        packageManagerNote:
          'De Linux-pakketbeheerder regelt installatie en verwijdering. Gebruik <c>sudo apt remove rentgen</c> / <c>sudo dnf remove rentgen</c> om te verwijderen.',
      },
      platformTip: {
        macos:
          'macOS vraagt om je wachtwoord om de symlink naar <c>/usr/local/bin/rentgen</c> te schrijven. Open na de installatie een nieuw Terminal-tabblad om de wijziging op te pikken.',
        windows:
          'Op Windows wordt de Rentgen-resourcemap toegevoegd aan je <e>gebruikers</e>-PATH (geen beheerdersrechten nodig). Open na de installatie een nieuw PowerShell-, Command Prompt- of Windows Terminal-tabblad — bestaande shells zien de wijziging niet.',
        linux:
          'Op Linux maakt het deb/rpm-postinstallatiescript automatisch een link naar <c>/usr/bin/rentgen</c>. Als je in plaats daarvan via een draagbaar archief hebt geïnstalleerd, maakt deze knop een gebruikerssymlink aan op <c>/usr/local/bin/rentgen</c> (of <c>~/.local/bin/rentgen</c> als fallback).',
      },
      flag: {
        collection: 'Uit te voeren map uit het projectbestand. Weglaten om interactief te kiezen.',
        env: 'Te gebruiken omgeving. Geef --env=none door om zonder omgeving uit te voeren.',
        skipIntegrityCheck: 'De checksum-bevestigingsprompt overslaan.',
        var: 'Een variabele overschrijven. Herhaalbaar. Hoogste prioriteit boven env- en dynamische waarden.',
        timeout: 'Time-out per verzoek in milliseconden. Standaard 30000.',
        failFast: 'Stoppen na de eerste fout.',
        report:
          'Machineleesbare uitvoer. Ondersteund: json (schrijft JSON naar stdout, onderdrukt menselijke uitvoer).',
        noColor: 'Gekleurde uitvoer uitschakelen.',
        verbose: 'Volledige details van verzoek/reactie afdrukken en waarschuwen voor onopgeloste variabelen.',
      },
      exit: {
        code0: 'Alle verzoeken geslaagd.',
        code1: 'Uitvoering voltooid met fouten, afgebroken bij de checksum-prompt, of onderbroken met Ctrl+C.',
        code2:
          'Ongeldige invoer: ontbrekend bestand, onjuiste JSON, verkeerde structuur, dubbelzinnige of onbekende --collection / --env, of CI-modus zonder de vereiste vlaggen.',
      },
    },
    history: {
      title: 'Geschiedenis',
      description: 'Configureer hoe verzoekgeschiedenis wordt verzameld en bewaard.',
      enableHistory: 'Geschiedenis inschakelen',
      maximumSize: 'Maximale grootte',
      retentionPeriod: 'Bewaartermijn',
      week1: '1 week',
      month1: '1 maand',
      months3: '3 maanden',
      months6: '6 maanden',
      year1: '1 jaar',
      noRetention: 'Niet bewaren',
    },
    project: {
      title: 'Project',
      description:
        'Exporteer of importeer je volledige project inclusief collecties, omgevingen, variabelen, geschiedenis en instellingen.',
      exportProject: 'Project exporteren',
      importProject: 'Project importeren',
    },
    configuration: {
      title: 'Configuratie',
      description: 'Configureer regels en limieten voor het genereren van willekeurige testgegevenswaarden.',
      email: 'E-mail',
      domain: 'Domein',
      randomEmailLength: 'Lengte van willekeurig e-mailadres',
      enum: 'Enum',
      enumDescription: 'Voer alle geldige waarden in, gescheiden door ","',
      number: 'Getal',
      minimumValue: 'Minimale waarde',
      maximumValue: 'Maximale waarde',
      string: 'String',
      maximumValueLength: 'Maximale waardelengte',
      randomInteger: 'Willekeurig geheel getal',
      randomString: 'Willekeurige string',
      length: 'Lengte',
    },
    securityTests: {
      title: 'Beveiligingstests',
      enabledCount: '{{enabled}}/{{total}} ingeschakeld',
      description: 'Schakel afzonderlijke beveiligingstests in of uit om je testervaring aan te passen.',
    },
    languageSection: {
      title: 'Taal',
      description: 'Selecteer je voorkeurstaal voor de interface van de applicatie.',
      feedback:
        'Een vertaalfout gevonden of wil je een andere taal toevoegen? Maak een ticket aan met alle details en we doen ons best.',
      feedbackLink: 'Open een GitHub-issue',
    },
  },

  // Controls
  controls: {
    sizeMB: 'Grootte (MB)',
    sizeMax: 'Grootte (max {{max}} MB)',
    threads: 'Threads',
    threadsMax: 'Threads (max 100)',
    requests: 'Verzoeken',
    requestsMax: 'Totaal aantal verzoeken (max 10 000)',
    mandatoryToggle: 'Ingeschakeld = Verplicht → Rentgen genereert tests op basis van deze instelling',
    enumLabel: 'Voer alle geldige waarden in, gescheiden door ","',
    numberLabel: 'Stel Min/Max-bereik in voor grenswaardetest. 0 - geheel getal, 0,00 - decimaal',
    stringLabel: 'Maximale waardelengte',
    minPlaceholder: 'Min',
    maxPlaceholder: 'Max',
  },

  // Parameter types
  parameterTypes: {
    doNotTest: 'Niet testen',
    randomEmail: 'Willekeurig e-mailadres',
    randomInteger: 'Willekeurig geheel getal',
    randomString: 'Willekeurige string',
    boolean: 'Boolean',
    currency: 'Valuta',
    dateYYYYMMDD: 'Datum (JJJJ-MM-DD)',
    email: 'E-mail',
    enum: 'Enum',
    number: 'Getal',
    phone: 'Telefoon',
    string: 'String',
    url: 'URL',
  },

  // Tables
  tables: {
    parameter: 'Parameter',
    value: 'Waarde',
    check: 'Controle',
    method: 'Methode',
    expected: 'Verwacht',
    actual: 'Werkelijk',
    result: 'Resultaat',
    name: 'Naam',
    description: 'Beschrijving',
    request: 'Verzoek',
  },

  // Context Menu
  contextMenu: {
    setAsVariable: 'Instellen als variabele',
    saveRequestFirst: 'Sla het verzoek eerst op in een collectie',
    setAsDynamicVariableTitle: '"{{path}}" instellen als dynamische variabele',
  },

  // Badges
  badges: {
    verified: 'Geverifieerd',
    modified: 'Gewijzigd',
    noChecksum: 'Geen checksum',
  },

  // File input
  fileInput: {
    chooseFile: 'Bestand kiezen',
    noFileChosen: 'Geen bestand gekozen',
  },

  // Protobuf
  protobuf: {
    decodedProtobuf: 'Gedecodeerde Protobuf:',
  },

  // Messages panel
  messages: {
    title: 'Berichten',
  },

  // Export format labels
  exportFormats: {
    json: 'JSON (.json)',
    markdown: 'Markdown (.md)',
    csv: 'CSV (.csv)',
  },
};

export default nl;
