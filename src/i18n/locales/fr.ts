const fr = {
  // Common
  common: {
    send: 'Envoyer',
    save: 'Enregistrer',
    saved: 'Enregistré ✅',
    cancel: 'Annuler',
    close: 'Fermer',
    ok: 'OK',
    create: 'Créer',
    delete: 'Supprimer',
    import: 'Importer',
    export: 'Exporter',
    copy: 'Copier',
    copied: 'Copié ✅',
    run: 'Exécuter',
    replace: 'Remplacer',
    merge: 'Fusionner',
    overwrite: 'Écraser',
    enabled: 'Activé',
    disabled: 'Désactivé',
    warning: 'Avertissement :',
    connect: 'Connecter',
    disconnect: 'Déconnecter',
    beautify: 'Embellir',
    reload: 'Recharger',
    cut: 'Couper',
    paste: 'Coller',
  },

  // Sidebar
  sidebar: {
    collections: 'Collections',
    environments: 'Environnements',
    history: 'Historique',
    settings: 'Paramètres',
    checkForUpdates: 'Vérifier les mises à jour',
    reportFeedback: 'Signaler un retour',
  },

  // Collections Panel
  collections: {
    newFolder: 'Nouveau dossier',
    importCollection: 'Importer une collection',
    exportCollection: 'Exporter la collection',
    searchCollections: 'Rechercher des collections...',
    noMatchingRequests: 'Aucune requête correspondante',
    noSavedRequests: 'Aucune requête enregistrée',
    importFailed: "Échec de l'import : {{error}}",
    exportFailed: "Échec de l'export : {{error}}",
    importedWithWarnings: 'Importé avec {{count}} avertissement(s)',
    collectionImported: 'Collection importée',
    collectionExported: 'Collection exportée',
  },

  // Environment
  environment: {
    newEnvironment: 'Nouvel environnement',
    editEnvironment: "Modifier l'environnement",
    noEnvironmentsCreated: 'Aucun environnement créé',
    environmentName: "Nom de l'environnement",
    environmentNamePlaceholder: 'p. ex. Production, Staging, Local',
    color: 'Couleur',
    variables: 'Variables',
    variableName: 'Nom de la variable',
    addVariable: 'Ajouter une variable',
    value: 'Valeur',
    refreshValue: 'Actualiser la valeur',
    refreshAll: 'Tout actualiser',
    noEnvironment: 'Aucun environnement',
    selectEnvironment: 'Sélectionner un environnement',
    randomEmail: 'E-mail aléatoire',
    randomInteger: 'Entier aléatoire',
    randomString: 'Chaîne aléatoire',
    deleteEnvironmentConfirm: 'Êtes-vous sûr de vouloir supprimer cet environnement ?',
    deleteEnvironment: "Supprimer l'environnement",
    untitled: 'Sans titre',
  },

  // History
  history: {
    title: 'Historique',
    clearAll: 'Tout effacer',
    searchHistory: "Rechercher dans l'historique...",
    noMatchingHistory: 'Aucun historique correspondant',
    noHistoryYet: "Pas encore d'historique",
    today: "Aujourd'hui",
    yesterday: 'Hier',
  },

  // Request
  request: {
    enterUrl: "Saisir l'URL ou coller le texte",
    headers: 'En-têtes',
    headersPlaceholder: 'Clé-en-tête : valeur',
    body: 'Corps',
    bodyPlaceholderHttp: 'Saisir le corps de la requête (JSON ou Form Data)',
    bodyPlaceholderWss: 'Corps du message',
    protobufSchema: 'Schéma Protobuf et type de message',
    protobufDescription:
      "Section expérimentale et facultative. En cas d'utilisation, les deux champs doivent être renseignés",
    messageTypePlaceholder: 'Type de message (p. ex. mypackage.MyMessage)',
    protoSchemaLoaded: '🟢 Schéma proto chargé',
    protoSchemaParseFailed: "🔴 Échec de l'analyse du proto : ",
    wssUrlRequired: '🔴 Veuillez utiliser une URL ws:// ou wss://',
    modePlaceholder: 'MODE',
    methodPlaceholder: 'MÉTHODE',
  },

  // Response
  response: {
    title: 'Réponse',
    sending: 'Envoi en cours...',
    networkError: 'Erreur réseau',
  },

  // cURL
  curl: {
    importCurl: 'Importer cURL',
    importCurlPlaceholder: 'Saisir cURL ou coller le texte',
    invalidCurl: 'La commande cURL fournie semble invalide. Veuillez la vérifier et réessayer',
    copyCurl: 'Copier cURL',
  },

  // Tests
  tests: {
    generateAndRun: 'Générer et exécuter les tests',
    runningTests: 'Exécution des tests... ({{current}}/{{total}})',
    selectForCompare: 'Sélectionner pour comparer',
    compareWithSelected: 'Comparer avec la sélection',
    exportFormat: 'Format',
    exported: 'Exporté ✅',
    generateCertificate: 'Générer un certificat',
    certificated: 'Certifié ✅',
    notEligible: 'Non éligible (au moins 70 tests requis)',
    securityTests: 'Tests de sécurité',
    performanceInsights: 'Analyses de performance',
    dataDrivenTests: 'Tests pilotés par les données',
    crud: 'CRUD',
    runningSecurityTests: 'Exécution des tests de sécurité...',
    runningPerformanceInsights: 'Exécution des analyses de performance...',
    runningDataDrivenTests: 'Exécution des tests pilotés par les données...',
    preparingCrud: 'Préparation du CRUD…',
    crudDescription:
      'Le CRUD est généré à partir de la réponse du test de gestion de la méthode OPTIONS dans les tests de sécurité.',
    crudNote: 'Remarque :',
    crudNoteText: 'Si le test de gestion de la méthode OPTIONS est désactivé, le CRUD ne sera pas généré.',
    copyBugReport: 'Copier le rapport de bug',
    computingDifferences: 'Calcul des différences…',
    bodyParameters: 'Paramètres du corps',
    queryParameters: 'Paramètres de requête',
    formatPlaceholder: 'Format',
  },

  // Comparison Panel
  comparison: {
    title: 'Comparaison des résultats de test',
    noTestResults: 'Aucun résultat de test à comparer',
    potentialBugs: 'Bugs potentiels',
    fullBehaviorChanges: 'Changements de comportement complets',
    noPotentialBugs: 'Aucun bug potentiel détecté ✅',
    showFullBehaviorChanges: 'Afficher les changements de comportement complets',
    behaviorChange: 'Changement de comportement :',
    showNoise: 'Afficher le bruit',
  },

  // Modals
  modals: {
    reload: {
      title: 'Recharger',
      description: 'Seuls les résultats des tests en cours seront perdus',
      confirmText: 'Recharger',
    },
    sendHttpSuccess: {
      title: 'La requête semble correcte !',
      description:
        "Rentgen dispose désormais d'une requête valide à utiliser. Avant de générer les tests, vérifiez rapidement les champs mappés pour vous assurer que tout est correct",
      confirmText: 'Vérifier et générer les tests',
      doNotShowAgain: 'Ne plus afficher',
    },
    deleteFolder: {
      title: 'Supprimer le dossier',
      description: 'Ce dossier contient des requêtes. Êtes-vous sûr de vouloir le supprimer ?',
    },
    importConflict: {
      title: "Conflits d'import détectés",
      conflictDescription: 'La collection importée "{{name}}" présente des conflits avec votre collection existante :',
      collectionNamesMatch: 'Les noms de collection correspondent',
      folderConflicts: '{{count}} dossier(s) avec des noms correspondants',
      requestConflicts: '{{count}} requête(s) avec URL+Méthode ou nom correspondants',
      importWarnings: "Avertissements d'import : {{count}}",
      replaceDescription: 'Remplacer toute la collection existante ({{folders}} dossiers, {{requests}} requêtes)',
      mergeDescription: 'Ajouter uniquement les éléments uniques (ignore les doublons par URL+Méthode ou nom)',
      newFolders: '{{count}} nouveau(x) dossier(s)',
      newRequests: '{{count}} nouvelle(s) requête(s)',
      noNewItems: 'Aucun nouvel élément à ajouter',
      importAsCopy: 'Importer en tant que copie',
      copyDescription:
        'Ajouter tous les dossiers avec le suffixe "(copie)" ({{folders}} dossiers, {{requests}} requêtes)',
    },
    setDynamicVariable: {
      title: 'Définir comme variable dynamique',
      editTitle: 'Modifier la variable dynamique',
      variableName: 'Nom de la variable',
      variableNamePlaceholder: 'nom_variable',
      preview: 'Aperçu :',
      environment: 'Environnement',
      allEnvironments: 'Tous les environnements',
      untitledEnvironment: 'Environnement sans titre',
      selectEnvironment: 'Sélectionner un environnement...',
      linkedRequest: 'Requête liée',
      variableNameRequired: 'Le nom de la variable est requis',
      selectorRequired: 'Le sélecteur est requis',
      selectEnvironmentError: 'Veuillez sélectionner un environnement',
      duplicateWarning: 'Une variable portant ce nom existe déjà. Elle sera écrasée.',
      saveVariable: 'Enregistrer la variable',
      updateVariable: 'Mettre à jour la variable',
    },
    projectImport: {
      title: 'Importer le projet',
      file: 'Fichier',
      exported: 'Exporté',
      appVersion: "Version de l'application",
      integrity: 'Intégrité',
      integrityWarning:
        "La vérification d'intégrité du fichier a échoué. Ce fichier a peut-être été modifié en dehors de Rentgen. Procédez avec prudence.",
      overwriteWarning: 'Cela écrasera TOUTES vos données actuelles :',
      collectionsCount: 'Collections ({{folders}} dossiers, {{requests}} requêtes)',
      environmentsCount: 'Environnements ({{count}} environnements)',
      dynamicVariablesCount: 'Variables dynamiques ({{count}} variables)',
      historyCount: 'Historique ({{count}} entrées)',
      settingsInfo: "Paramètres (thème, moteur de test, configuration de l'historique)",
      cannotBeUndone: 'Cette action ne peut pas être annulée.',
      backupBefore: "Sauvegardez votre projet actuel avant d'importer :",
      exportedCheck: 'Exporté ✓',
      exportCurrentProject: 'Exporter le projet actuel',
      importProject: 'Importer le projet',
    },
  },

  // Settings
  settings: {
    testEngine: 'Moteur de test',
    general: 'Général',
    themes: 'Thèmes',
    language: 'Langue',
    themesDescription: 'Personnalisez votre expérience avec des thèmes qui correspondent à votre style.',
    themeLight: 'Clair',
    themeDark: 'Sombre',
    cli: {
      name: 'CLI',
      intro:
        "Le CLI Rentgen exécute un dossier de requêtes à partir d'un export de projet <c>.rentgen</c>, directement depuis le terminal — conçu pour les pipelines CI et les tests de fumée scriptés. Il lit le même fichier produit par <e>Général → Exporter le projet</e> et ne réécrit jamais dedans.",
      fullDocumentation: 'Documentation complète :',
      installInPath: 'Installer dans le PATH du shell ({{platform}})',
      checkingStatus: "Vérification du statut d'installation…",
      runCli: 'Exécuter le CLI',
      runCliDescription:
        "Rentgen expose une seule sous-commande, <c>xray</c> (alias : <c>run</c>). Pointez-la vers un fichier de projet que vous avez exporté depuis l'application.",
      exportProject: 'Exporter le projet',
      noProjectFileYet:
        "Vous n'avez pas encore de fichier de projet ? Exportez-en un maintenant — même action que <e>Général → Exporter le projet</e>.",
      developmentNote:
        'Pendant le développement, invoquez-le directement depuis le dépôt avec <c>npm run dev:cli -- xray …</c>.',
      options: 'Options',
      examples: 'Exemples',
      exampleInteractive: 'Choisissez un dossier et un environnement de manière interactive :',
      exampleCi:
        "Exécution CI scriptée avec un dossier et un environnement explicites, avec arrêt immédiat en cas d'échec :",
      exampleCiJson:
        'Sortie lisible par machine pour les pipelines CI (GitHub Actions, Jenkins, notifications Slack) :',
      exampleOverrideVars: "Remplacer les variables au site d'appel (priorité la plus élevée) :",
      integrityCheck: "Vérification d'intégrité",
      integrityCheckDescription:
        "Chaque export de projet contient une somme de contrôle SHA-256 de ses données. Au chargement, le CLI recalcule la somme de contrôle. Si elle correspond, l'exécution se poursuit silencieusement. Si elle est manquante ou altérée, vous verrez une invite de confirmation dans un TTY ou une erreur en CI. <c>--skip-integrity-check</c> contourne la vérification — utilisez-la lorsque vous savez que le fichier a été modifié à la main intentionnellement.",
      exitCodesTitle: 'Codes de sortie',
      idempotency: 'Idempotence',
      idempotencyDescription:
        "Le CLI n'écrit jamais dans le fichier de projet. Les variables dynamiques extraites des réponses sont conservées en mémoire pendant la durée d'une seule exécution, de sorte que deux invocations consécutives sur un projet non modifié produisent des URLs, en-têtes et corps résolus identiques au niveau de l'octet.",
      platform: {
        macos: 'macOS',
        windows: 'Windows',
        linux: 'Linux',
      },
      status: {
        binaryUnavailable: 'Binaire CLI indisponible',
        binaryUnavailableReinstall: 'Réinstallez la dernière version de Rentgen pour activer le CLI.',
        installed: 'Installé',
        managedByPackageManager: ' (géré par le gestionnaire de paquets)',
        conflictingPath: '`rentgen` en conflit dans le PATH',
        conflictingPathDescription:
          "<c>{{path}}</c> est dans le PATH mais ne pointe pas vers cette installation de Rentgen. Supprimez-le, sinon l'installation ici le masquera.",
        notInstalled: 'Non installé',
        notInstalledDescription:
          'Cliquez sur <e>Installer</e> ci-dessous pour ajouter <c>rentgen</c> au PATH de votre shell.',
      },
      action: {
        working: 'En cours…',
        uninstall: 'Désinstaller le CLI',
        reinstall: 'Réinstaller',
        installRentgenInPath: 'Installer la commande rentgen dans le PATH',
        packageManagerNote:
          "Le gestionnaire de paquets Linux gère l'installation et la suppression. Utilisez <c>sudo apt remove rentgen</c> / <c>sudo dnf remove rentgen</c> pour désinstaller.",
      },
      platformTip: {
        macos:
          "macOS vous demandera votre mot de passe pour écrire le lien symbolique vers <c>/usr/local/bin/rentgen</c>. Après l'installation, ouvrez un nouvel onglet Terminal pour prendre en compte le changement.",
        windows:
          "L'installation sous Windows ajoute le répertoire des ressources Rentgen au PATH de votre <e>utilisateur</e> (aucun droit administrateur requis). Ouvrez un nouvel onglet PowerShell, Invite de commandes ou Windows Terminal après l'installation — les shells existants ne verront pas le changement.",
        linux:
          'Sous Linux, le script de post-installation deb/rpm crée automatiquement le lien <c>/usr/bin/rentgen</c>. Si vous avez installé via une archive portable à la place, ce bouton crée un lien symbolique utilisateur à <c>/usr/local/bin/rentgen</c> (ou <c>~/.local/bin/rentgen</c> en repli).',
      },
      flag: {
        collection: 'Dossier à exécuter à partir du fichier de projet. Omettez pour choisir de manière interactive.',
        env: 'Environnement à utiliser. Passez --env=none pour exécuter sans aucun environnement.',
        skipIntegrityCheck: "Ignorer l'invite de confirmation de la somme de contrôle.",
        var: "Remplacer une variable. Répétable. Priorité la plus élevée sur l'environnement et les valeurs dynamiques.",
        timeout: "Délai d'attente par requête en millisecondes. Par défaut 30000.",
        failFast: 'Arrêter après le premier échec.',
        report:
          'Sortie lisible par machine. Pris en charge : json (écrit le JSON sur stdout, supprime la sortie humaine).',
        noColor: 'Désactiver la sortie en couleur.',
        verbose: 'Afficher tous les détails de la requête/réponse et avertir des variables non résolues.',
      },
      exit: {
        code0: 'Toutes les requêtes ont réussi.',
        code1:
          "Exécution terminée avec des échecs, abandonnée à l'invite de la somme de contrôle ou interrompue avec Ctrl+C.",
        code2:
          'Entrée invalide : fichier manquant, JSON incorrect, format erroné, --collection / --env ambigu ou inconnu, ou mode CI sans les drapeaux requis.',
      },
    },
    history: {
      title: 'Historique',
      description: "Configurez la manière dont l'historique des requêtes est collecté et conservé.",
      enableHistory: "Activer l'historique",
      maximumSize: 'Taille maximale',
      retentionPeriod: 'Période de conservation',
      week1: '1 semaine',
      month1: '1 mois',
      months3: '3 mois',
      months6: '6 mois',
      year1: '1 an',
      noRetention: 'Aucune conservation',
    },
    project: {
      title: 'Projet',
      description:
        "Exportez ou importez l'intégralité de votre projet, y compris les collections, environnements, variables, historique et paramètres.",
      exportProject: 'Exporter le projet',
      importProject: 'Importer le projet',
    },
    configuration: {
      title: 'Configuration',
      description: 'Configurez les règles et limites pour générer des valeurs de données de test aléatoires.',
      email: 'E-mail',
      domain: 'Domaine',
      randomEmailLength: "Longueur de l'e-mail aléatoire",
      enum: 'Enum',
      enumDescription: 'Saisissez toutes les valeurs valides séparées par ","',
      number: 'Nombre',
      minimumValue: 'Valeur minimale',
      maximumValue: 'Valeur maximale',
      string: 'Chaîne',
      maximumValueLength: 'Longueur maximale de la valeur',
      randomInteger: 'Entier aléatoire',
      randomString: 'Chaîne aléatoire',
      length: 'Longueur',
    },
    securityTests: {
      title: 'Tests de sécurité',
      enabledCount: '{{enabled}}/{{total}} activés',
      description:
        'Activez ou désactivez les tests de sécurité individuels pour personnaliser votre expérience de test.',
    },
    languageSection: {
      title: 'Langue',
      description: "Sélectionnez votre langue préférée pour l'interface de l'application.",
      feedback:
        'Vous avez trouvé un problème de traduction ou souhaitez ajouter une autre langue ? Créez un ticket avec tous les détails et nous ferons de notre mieux.',
      feedbackLink: 'Ouvrir un ticket GitHub',
    },
  },

  // Controls
  controls: {
    sizeMB: 'Taille (Mo)',
    sizeMax: 'Taille (max. {{max}} Mo)',
    threads: 'Threads',
    threadsMax: 'Threads (max. 100)',
    requests: 'Requêtes',
    requestsMax: 'Total des requêtes (max. 10 000)',
    mandatoryToggle: 'Activé = Obligatoire → Rentgen génère des tests basés sur ce paramètre',
    enumLabel: 'Saisissez toutes les valeurs valides séparées par ","',
    numberLabel: 'Définir la plage Min/Max pour le test aux limites. 0 - entier, 0.00 - décimal',
    stringLabel: 'Longueur maximale de la valeur',
    minPlaceholder: 'Min',
    maxPlaceholder: 'Max',
  },

  // Parameter types
  parameterTypes: {
    doNotTest: 'Ne pas tester',
    randomEmail: 'E-mail aléatoire',
    randomInteger: 'Entier aléatoire',
    randomString: 'Chaîne aléatoire',
    boolean: 'Booléen',
    currency: 'Devise',
    dateYYYYMMDD: 'Date (AAAA-MM-JJ)',
    email: 'E-mail',
    enum: 'Enum',
    number: 'Nombre',
    phone: 'Téléphone',
    string: 'Chaîne',
    url: 'URL',
  },

  // Tables
  tables: {
    parameter: 'Paramètre',
    value: 'Valeur',
    check: 'Vérification',
    method: 'Méthode',
    expected: 'Attendu',
    actual: 'Réel',
    result: 'Résultat',
    name: 'Nom',
    description: 'Description',
    request: 'Requête',
  },

  // Context Menu
  contextMenu: {
    setAsVariable: 'Définir comme variable',
    saveRequestFirst: "Enregistrez d'abord la requête dans une collection",
    setAsDynamicVariableTitle: 'Définir "{{path}}" comme variable dynamique',
  },

  // Badges
  badges: {
    verified: 'Vérifié',
    modified: 'Modifié',
    noChecksum: 'Aucune somme de contrôle',
  },

  // File input
  fileInput: {
    chooseFile: 'Choisir un fichier',
    noFileChosen: 'Aucun fichier choisi',
  },

  // Protobuf
  protobuf: {
    decodedProtobuf: 'Protobuf décodé :',
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

export default fr;
