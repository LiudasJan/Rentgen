const hi = {
  // Common
  common: {
    send: 'भेजें',
    save: 'सहेजें',
    saved: 'सहेजा गया ✅',
    cancel: 'रद्द करें',
    close: 'बंद करें',
    ok: 'ठीक है',
    create: 'बनाएँ',
    delete: 'हटाएँ',
    import: 'आयात करें',
    export: 'निर्यात करें',
    copy: 'कॉपी करें',
    copied: 'कॉपी किया गया ✅',
    run: 'चलाएँ',
    replace: 'बदलें',
    merge: 'मर्ज करें',
    overwrite: 'अधिलेखित करें',
    enabled: 'सक्षम',
    disabled: 'अक्षम',
    warning: 'चेतावनी:',
    connect: 'कनेक्ट करें',
    disconnect: 'डिस्कनेक्ट करें',
    beautify: 'सुंदर बनाएँ',
    reload: 'पुनः लोड करें',
    cut: 'काटें',
    paste: 'पेस्ट करें',
  },

  // Sidebar
  sidebar: {
    collections: 'संग्रह',
    environments: 'एनवायरनमेंट',
    history: 'इतिहास',
    settings: 'सेटिंग्स',
    checkForUpdates: 'अपडेट जाँचें',
    reportFeedback: 'फीडबैक रिपोर्ट करें',
  },

  // Collections Panel
  collections: {
    newFolder: 'नया फ़ोल्डर',
    importCollection: 'संग्रह आयात करें',
    exportCollection: 'संग्रह निर्यात करें',
    searchCollections: 'संग्रह खोजें...',
    noMatchingRequests: 'कोई मेल खाने वाला अनुरोध नहीं',
    noSavedRequests: 'कोई सहेजा गया अनुरोध नहीं',
    importFailed: 'आयात विफल: {{error}}',
    exportFailed: 'निर्यात विफल: {{error}}',
    importedWithWarnings: '{{count}} चेतावनी(यों) के साथ आयात किया गया',
    collectionImported: 'संग्रह आयात किया गया',
    collectionExported: 'संग्रह निर्यात किया गया',
  },

  // Environment
  environment: {
    newEnvironment: 'नया एनवायरनमेंट',
    editEnvironment: 'एनवायरनमेंट संपादित करें',
    noEnvironmentsCreated: 'कोई एनवायरनमेंट नहीं बनाया गया',
    environmentName: 'एनवायरनमेंट का नाम',
    environmentNamePlaceholder: 'उदा. Production, Staging, Local',
    color: 'रंग',
    variables: 'वैरिएबल',
    variableName: 'वैरिएबल का नाम',
    addVariable: 'वैरिएबल जोड़ें',
    value: 'मान',
    refreshValue: 'मान रिफ्रेश करें',
    refreshAll: 'सभी रिफ्रेश करें',
    noEnvironment: 'कोई एनवायरनमेंट नहीं',
    selectEnvironment: 'एनवायरनमेंट चुनें',
    randomEmail: 'रैंडम ईमेल',
    randomInteger: 'रैंडम पूर्णांक',
    randomString: 'रैंडम स्ट्रिंग',
    deleteEnvironmentConfirm: 'क्या आप वाकई इस एनवायरनमेंट को हटाना चाहते हैं?',
    deleteEnvironment: 'एनवायरनमेंट हटाएँ',
    untitled: 'बिना शीर्षक',
  },

  // History
  history: {
    title: 'इतिहास',
    clearAll: 'सभी साफ़ करें',
    searchHistory: 'इतिहास खोजें...',
    noMatchingHistory: 'कोई मेल खाने वाला इतिहास नहीं',
    noHistoryYet: 'अभी तक कोई इतिहास नहीं',
    today: 'आज',
    yesterday: 'कल',
  },

  // Request
  request: {
    enterUrl: 'URL दर्ज करें या टेक्स्ट पेस्ट करें',
    headers: 'हैडर',
    headersPlaceholder: 'Header-Key: value',
    body: 'बॉडी',
    bodyPlaceholderHttp: 'अनुरोध बॉडी दर्ज करें (JSON या Form Data)',
    bodyPlaceholderWss: 'संदेश बॉडी',
    protobufSchema: 'Protobuf स्कीमा और संदेश प्रकार',
    protobufDescription: 'प्रायोगिक और वैकल्पिक अनुभाग। यदि उपयोग करते हैं, तो दोनों फ़ील्ड भरना ज़रूरी है',
    messageTypePlaceholder: 'संदेश प्रकार (उदा. mypackage.MyMessage)',
    protoSchemaLoaded: '🟢 Proto स्कीमा लोड हुआ',
    protoSchemaParseFailed: '🔴 Proto पार्स करने में विफल: ',
    wssUrlRequired: '🔴 कृपया ws:// या wss:// URL का उपयोग करें',
    modePlaceholder: 'MODE',
    methodPlaceholder: 'METHOD',
  },

  // Response
  response: {
    title: 'प्रतिक्रिया',
    sending: 'भेजा जा रहा है...',
    networkError: 'नेटवर्क त्रुटि',
  },

  // cURL
  curl: {
    importCurl: 'cURL आयात करें',
    importCurlPlaceholder: 'cURL दर्ज करें या टेक्स्ट पेस्ट करें',
    invalidCurl: 'आपके द्वारा दिया गया cURL कमांड अमान्य लगता है। कृपया इसे जाँचें और फिर से प्रयास करें',
    copyCurl: 'cURL कॉपी करें',
  },

  // Tests
  tests: {
    generateAndRun: 'टेस्ट जनरेट करें और चलाएँ',
    runningTests: 'टेस्ट चल रहे हैं... ({{current}}/{{total}})',
    selectForCompare: 'तुलना के लिए चुनें',
    compareWithSelected: 'चयनित के साथ तुलना करें',
    exportFormat: 'फ़ॉर्मेट',
    exported: 'निर्यात किया गया ✅',
    generateCertificate: 'सर्टिफिकेट जनरेट करें',
    certificated: 'सर्टिफाइड ✅',
    notEligible: 'पात्र नहीं (कम से कम 70 टेस्ट चाहिए)',
    securityTests: 'सुरक्षा टेस्ट',
    performanceInsights: 'परफ़ॉर्मेंस इनसाइट्स',
    dataDrivenTests: 'डेटा-ड्रिवन टेस्ट',
    crud: 'CRUD',
    runningSecurityTests: 'सुरक्षा टेस्ट चल रहे हैं...',
    runningPerformanceInsights: 'परफ़ॉर्मेंस इनसाइट्स चल रही हैं...',
    runningDataDrivenTests: 'डेटा-ड्रिवन टेस्ट चल रहे हैं...',
    preparingCrud: 'CRUD तैयार किया जा रहा है…',
    crudDescription: 'CRUD सुरक्षा टेस्ट में OPTIONS मेथड हैंडलिंग टेस्ट की प्रतिक्रिया के आधार पर जनरेट किए जाते हैं।',
    crudNote: 'नोट:',
    crudNoteText: 'यदि OPTIONS मेथड हैंडलिंग टेस्ट अक्षम है, तो CRUD जनरेट नहीं होंगे।',
    copyBugReport: 'बग रिपोर्ट कॉपी करें',
    computingDifferences: 'अंतर की गणना हो रही है…',
    bodyParameters: 'बॉडी पैरामीटर',
    queryParameters: 'क्वेरी पैरामीटर',
    formatPlaceholder: 'फ़ॉर्मेट',
  },

  // Comparison Panel
  comparison: {
    title: 'टेस्ट परिणाम तुलना',
    noTestResults: 'तुलना करने के लिए कोई टेस्ट परिणाम नहीं',
    potentialBugs: 'संभावित बग',
    fullBehaviorChanges: 'पूर्ण व्यवहार परिवर्तन',
    noPotentialBugs: 'कोई संभावित बग नहीं मिला ✅',
    showFullBehaviorChanges: 'पूर्ण व्यवहार परिवर्तन दिखाएँ',
    behaviorChange: 'व्यवहार परिवर्तन:',
    showNoise: 'नॉइज़ दिखाएँ',
  },

  // Modals
  modals: {
    reload: {
      title: 'पुनः लोड करें',
      description: 'केवल वर्तमान टेस्ट परिणाम खो जाएँगे',
      confirmText: 'पुनः लोड करें',
    },
    sendHttpSuccess: {
      title: 'अनुरोध सही दिख रहा है!',
      description:
        'Rentgen के पास अब काम करने के लिए एक मान्य अनुरोध है। टेस्ट जनरेट करने से पहले, मैप किए गए फ़ील्ड की जल्दी से समीक्षा करें ताकि सब कुछ सही दिखे',
      confirmText: 'समीक्षा करें और टेस्ट जनरेट करें',
      doNotShowAgain: 'फिर से न दिखाएँ',
    },
    deleteFolder: {
      title: 'फ़ोल्डर हटाएँ',
      description: 'इस फ़ोल्डर में अनुरोध हैं। क्या आप वाकई इसे हटाना चाहते हैं?',
    },
    importConflict: {
      title: 'आयात विरोध मिले',
      conflictDescription: 'आयातित संग्रह "{{name}}" का आपके मौजूदा संग्रह के साथ विरोध है:',
      collectionNamesMatch: 'संग्रह के नाम मेल खाते हैं',
      folderConflicts: 'मेल खाने वाले नामों के साथ {{count}} फ़ोल्डर',
      requestConflicts: 'मेल खाने वाले URL+Method या नाम के साथ {{count}} अनुरोध',
      importWarnings: 'आयात चेतावनियाँ: {{count}}',
      replaceDescription: 'पूरे मौजूदा संग्रह को बदलें ({{folders}} फ़ोल्डर, {{requests}} अनुरोध)',
      mergeDescription: 'केवल अनूठे आइटम जोड़ें (URL+Method या नाम के आधार पर डुप्लिकेट छोड़ता है)',
      newFolders: '{{count}} नया फ़ोल्डर',
      newRequests: '{{count}} नया अनुरोध',
      noNewItems: 'जोड़ने के लिए कोई नया आइटम नहीं',
      importAsCopy: 'कॉपी के रूप में आयात करें',
      copyDescription: 'सभी फ़ोल्डर को "(copy)" प्रत्यय के साथ जोड़ें ({{folders}} फ़ोल्डर, {{requests}} अनुरोध)',
    },
    setDynamicVariable: {
      title: 'डायनामिक वैरिएबल के रूप में सेट करें',
      editTitle: 'डायनामिक वैरिएबल संपादित करें',
      variableName: 'वैरिएबल का नाम',
      variableNamePlaceholder: 'variable_name',
      preview: 'प्रीव्यू:',
      environment: 'एनवायरनमेंट',
      allEnvironments: 'सभी एनवायरनमेंट',
      untitledEnvironment: 'बिना शीर्षक एनवायरनमेंट',
      selectEnvironment: 'एनवायरनमेंट चुनें...',
      linkedRequest: 'लिंक किया गया अनुरोध',
      variableNameRequired: 'वैरिएबल का नाम आवश्यक है',
      selectorRequired: 'सेलेक्टर आवश्यक है',
      selectEnvironmentError: 'कृपया एक एनवायरनमेंट चुनें',
      duplicateWarning: 'इस नाम का वैरिएबल पहले से मौजूद है। इसे अधिलेखित किया जाएगा।',
      saveVariable: 'वैरिएबल सहेजें',
      updateVariable: 'वैरिएबल अपडेट करें',
    },
    projectImport: {
      title: 'प्रोजेक्ट आयात करें',
      file: 'फ़ाइल',
      exported: 'निर्यात किया गया',
      appVersion: 'ऐप संस्करण',
      integrity: 'अखंडता',
      integrityWarning:
        'फ़ाइल अखंडता जाँच विफल। यह फ़ाइल Rentgen के बाहर संशोधित की गई हो सकती है। सावधानी से आगे बढ़ें।',
      overwriteWarning: 'यह आपके सभी मौजूदा डेटा को अधिलेखित कर देगा:',
      collectionsCount: 'संग्रह ({{folders}} फ़ोल्डर, {{requests}} अनुरोध)',
      environmentsCount: 'एनवायरनमेंट ({{count}} एनवायरनमेंट)',
      dynamicVariablesCount: 'डायनामिक वैरिएबल ({{count}} वैरिएबल)',
      historyCount: 'इतिहास ({{count}} प्रविष्टियाँ)',
      settingsInfo: 'सेटिंग्स (थीम, टेस्ट इंजन, इतिहास कॉन्फ़िगरेशन)',
      cannotBeUndone: 'यह क्रिया वापस नहीं की जा सकती।',
      backupBefore: 'आयात करने से पहले अपने मौजूदा प्रोजेक्ट का बैकअप लें:',
      exportedCheck: 'निर्यात किया गया ✓',
      exportCurrentProject: 'मौजूदा प्रोजेक्ट निर्यात करें',
      importProject: 'प्रोजेक्ट आयात करें',
    },
  },

  // Settings
  settings: {
    testEngine: 'टेस्ट इंजन',
    general: 'सामान्य',
    themes: 'थीम',
    language: 'भाषा',
    themesDescription: 'अपनी शैली के अनुरूप थीम के साथ अपने अनुभव को निजीकृत करें।',
    themeLight: 'लाइट',
    themeDark: 'डार्क',
    cli: {
      name: 'CLI',
      intro:
        'Rentgen CLI <c>.rentgen</c> प्रोजेक्ट एक्सपोर्ट से अनुरोधों का एक फ़ोल्डर सीधे टर्मिनल से चलाता है — CI पाइपलाइनों और स्क्रिप्टेड स्मोक टेस्ट के लिए बनाया गया। यह वही फ़ाइल पढ़ता है जो <e>सामान्य → प्रोजेक्ट निर्यात करें</e> से बनाई जाती है और कभी भी उसमें वापस नहीं लिखता।',
      fullDocumentation: 'पूरा दस्तावेज़ीकरण:',
      installInPath: 'शेल PATH में इंस्टॉल करें ({{platform}})',
      checkingStatus: 'इंस्टॉल स्थिति जाँची जा रही है…',
      runCli: 'CLI चलाएँ',
      runCliDescription:
        'Rentgen एक ही सबकमांड प्रदान करता है, <c>xray</c> (उपनाम: <c>run</c>)। इसे ऐप से निर्यात की गई प्रोजेक्ट फ़ाइल पर इंगित करें।',
      exportProject: 'प्रोजेक्ट निर्यात करें',
      noProjectFileYet:
        'अभी तक प्रोजेक्ट फ़ाइल नहीं है? अभी एक निर्यात करें — <e>सामान्य → प्रोजेक्ट निर्यात करें</e> जैसी ही क्रिया।',
      developmentNote: 'विकास के दौरान, रिपो से सीधे <c>npm run dev:cli -- xray …</c> द्वारा आह्वान करें।',
      options: 'विकल्प',
      examples: 'उदाहरण',
      exampleInteractive: 'फ़ोल्डर और एनवायरनमेंट को इंटरैक्टिव रूप से चुनें:',
      exampleCi: 'स्पष्ट फ़ोल्डर और एनवायरनमेंट के साथ स्क्रिप्टेड CI रन, तेज़ी से विफल होते हुए:',
      exampleCiJson: 'CI पाइपलाइनों के लिए मशीन-पठनीय आउटपुट (GitHub Actions, Jenkins, Slack नोटिफ़ायर):',
      exampleOverrideVars: 'कॉल साइट पर वैरिएबल ओवरराइड करें (सर्वोच्च प्राथमिकता):',
      integrityCheck: 'अखंडता जाँच',
      integrityCheckDescription:
        'हर प्रोजेक्ट निर्यात अपने डेटा का SHA-256 चेकसम रखता है। लोड पर, CLI चेकसम की पुनर्गणना करता है। यदि यह मेल खाता है, तो रन चुपचाप जारी रहता है। यदि यह गायब है या उसके साथ छेड़छाड़ की गई है, तो आपको TTY में पुष्टि का प्रॉम्प्ट या CI में त्रुटि दिखेगी। <c>--skip-integrity-check</c> गेट को बायपास करता है — इसका उपयोग तब करें जब आप जानते हों कि फ़ाइल को जानबूझकर हाथ से संपादित किया गया है।',
      exitCodesTitle: 'एग्ज़िट कोड',
      idempotency: 'आइडम्पोटेंसी',
      idempotencyDescription:
        'CLI कभी भी प्रोजेक्ट फ़ाइल में नहीं लिखता। प्रतिक्रियाओं से निकाले गए डायनामिक वैरिएबल एक रन की अवधि के लिए मेमोरी में रखे जाते हैं, इसलिए अपरिवर्तित प्रोजेक्ट के विरुद्ध दो लगातार आह्वान बाइट-समान रिज़ॉल्व्ड URL, हैडर और बॉडी उत्पन्न करते हैं।',
      platform: {
        macos: 'macOS',
        windows: 'Windows',
        linux: 'Linux',
      },
      status: {
        binaryUnavailable: 'CLI बाइनरी उपलब्ध नहीं',
        binaryUnavailableReinstall: 'CLI सक्षम करने के लिए नवीनतम Rentgen बिल्ड पुनः इंस्टॉल करें।',
        installed: 'इंस्टॉल किया गया',
        managedByPackageManager: ' (पैकेज मैनेजर द्वारा प्रबंधित)',
        conflictingPath: 'PATH पर विरोधी `rentgen`',
        conflictingPathDescription:
          '<c>{{path}}</c> PATH पर है लेकिन इस Rentgen इंस्टॉल की ओर इंगित नहीं करता। इसे हटाएँ अन्यथा यहाँ इंस्टॉल करने पर इसकी छाया पड़ेगी।',
        notInstalled: 'इंस्टॉल नहीं है',
        notInstalledDescription: 'अपने शेल PATH में <c>rentgen</c> जोड़ने के लिए नीचे <e>इंस्टॉल</e> पर क्लिक करें।',
      },
      action: {
        working: 'काम कर रहा है…',
        uninstall: 'CLI अनइंस्टॉल करें',
        reinstall: 'पुनः इंस्टॉल करें',
        installRentgenInPath: 'PATH में rentgen कमांड इंस्टॉल करें',
        packageManagerNote:
          'Linux पैकेज मैनेजर इंस्टॉल और निष्कासन संभालता है। अनइंस्टॉल के लिए <c>sudo apt remove rentgen</c> / <c>sudo dnf remove rentgen</c> का उपयोग करें।',
      },
      platformTip: {
        macos:
          'macOS <c>/usr/local/bin/rentgen</c> पर सिमलिंक लिखने के लिए आपका पासवर्ड माँगेगा। इंस्टॉल के बाद, बदलाव लेने के लिए एक नया टर्मिनल टैब खोलें।',
        windows:
          'Windows इंस्टॉल आपके <e>उपयोगकर्ता</e> PATH में Rentgen संसाधन निर्देशिका जोड़ता है (एडमिन की आवश्यकता नहीं)। इंस्टॉल के बाद एक नया PowerShell, Command Prompt, या Windows Terminal टैब खोलें — मौजूदा शेल बदलाव नहीं देखेंगे।',
        linux:
          'Linux पर, deb/rpm पोस्टइंस्टॉल स्क्रिप्ट स्वचालित रूप से <c>/usr/bin/rentgen</c> को लिंक करती है। यदि आपने पोर्टेबल आर्काइव के माध्यम से इंस्टॉल किया है, तो यह बटन <c>/usr/local/bin/rentgen</c> (या फ़ॉलबैक के रूप में <c>~/.local/bin/rentgen</c>) पर उपयोगकर्ता सिमलिंक बनाता है।',
      },
      flag: {
        collection: 'प्रोजेक्ट फ़ाइल से चलाने के लिए फ़ोल्डर। इंटरैक्टिव रूप से चुनने के लिए छोड़ दें।',
        env: 'उपयोग करने के लिए एनवायरनमेंट। किसी भी एनवायरनमेंट के बिना चलाने के लिए --env=none पास करें।',
        skipIntegrityCheck: 'चेकसम पुष्टिकरण प्रॉम्प्ट छोड़ें।',
        var: 'एक वैरिएबल ओवरराइड करें। दोहराने योग्य। env और डायनामिक मानों से सर्वोच्च प्राथमिकता।',
        timeout: 'मिलीसेकंड में प्रति-अनुरोध टाइमआउट। डिफ़ॉल्ट 30000।',
        failFast: 'पहली विफलता के बाद रुकें।',
        report: 'मशीन-पठनीय आउटपुट। समर्थित: json (stdout पर JSON लिखता है, मानव आउटपुट को दबाता है)।',
        noColor: 'रंगीन आउटपुट अक्षम करें।',
        verbose: 'पूर्ण अनुरोध/प्रतिक्रिया विवरण प्रिंट करें और अनसुलझे वैरिएबल के बारे में चेतावनी दें।',
      },
      exit: {
        code0: 'सभी अनुरोध पास हुए।',
        code1: 'रन विफलताओं के साथ पूरा हुआ, चेकसम प्रॉम्प्ट पर रद्द किया गया, या Ctrl+C से बाधित किया गया।',
        code2:
          'अमान्य इनपुट: फ़ाइल गायब, खराब JSON, गलत संरचना, अस्पष्ट या अज्ञात --collection / --env, या आवश्यक फ़्लैग के बिना CI मोड।',
      },
    },
    history: {
      title: 'इतिहास',
      description: 'कॉन्फ़िगर करें कि अनुरोध इतिहास कैसे एकत्र और संरक्षित किया जाता है।',
      enableHistory: 'इतिहास सक्षम करें',
      maximumSize: 'अधिकतम आकार',
      retentionPeriod: 'प्रतिधारण अवधि',
      week1: '1 सप्ताह',
      month1: '1 महीना',
      months3: '3 महीने',
      months6: '6 महीने',
      year1: '1 वर्ष',
      noRetention: 'कोई प्रतिधारण नहीं',
    },
    project: {
      title: 'प्रोजेक्ट',
      description: 'संग्रह, एनवायरनमेंट, वैरिएबल, इतिहास और सेटिंग्स सहित अपने पूरे प्रोजेक्ट को निर्यात या आयात करें।',
      exportProject: 'प्रोजेक्ट निर्यात करें',
      importProject: 'प्रोजेक्ट आयात करें',
    },
    configuration: {
      title: 'कॉन्फ़िगरेशन',
      description: 'रैंडम टेस्ट डेटा मान जनरेट करने के लिए नियम और सीमाएँ कॉन्फ़िगर करें।',
      email: 'ईमेल',
      domain: 'डोमेन',
      randomEmailLength: 'रैंडम ईमेल लंबाई',
      enum: 'Enum',
      enumDescription: '"," से अलग करके सभी मान्य मान दर्ज करें',
      number: 'संख्या',
      minimumValue: 'न्यूनतम मान',
      maximumValue: 'अधिकतम मान',
      string: 'स्ट्रिंग',
      maximumValueLength: 'अधिकतम मान लंबाई',
      randomInteger: 'रैंडम पूर्णांक',
      randomString: 'रैंडम स्ट्रिंग',
      length: 'लंबाई',
    },
    securityTests: {
      title: 'सुरक्षा टेस्ट',
      enabledCount: '{{enabled}}/{{total}} सक्षम',
      description: 'अपने टेस्टिंग अनुभव को अनुकूलित करने के लिए व्यक्तिगत सुरक्षा टेस्ट चालू या बंद करें।',
    },
    languageSection: {
      title: 'भाषा',
      description: 'एप्लिकेशन इंटरफ़ेस के लिए अपनी पसंदीदा भाषा चुनें।',
      feedback:
        'अनुवाद में कोई समस्या मिली या कोई और भाषा जोड़ना चाहते हैं? सभी विवरणों के साथ एक टिकट बनाएँ और हम अपनी पूरी कोशिश करेंगे।',
      feedbackLink: 'GitHub इश्यू खोलें',
    },
  },

  // Controls
  controls: {
    sizeMB: 'आकार (MB)',
    sizeMax: 'आकार (अधिकतम {{max}} MB)',
    threads: 'थ्रेड्स',
    threadsMax: 'थ्रेड्स (अधिकतम 100)',
    requests: 'अनुरोध',
    requestsMax: 'कुल अनुरोध (अधिकतम 10 000)',
    mandatoryToggle: 'सक्षम = अनिवार्य → Rentgen इस सेटिंग के आधार पर टेस्ट जनरेट करता है',
    enumLabel: '"," से अलग करके सभी मान्य मान दर्ज करें',
    numberLabel: 'सीमा परीक्षण के लिए Min/Max श्रेणी सेट करें। 0 - पूर्णांक, 0.00 - दशमलव',
    stringLabel: 'मान की अधिकतम लंबाई',
    minPlaceholder: 'न्यूनतम',
    maxPlaceholder: 'अधिकतम',
  },

  // Parameter types
  parameterTypes: {
    doNotTest: 'टेस्ट न करें',
    randomEmail: 'रैंडम ईमेल',
    randomInteger: 'रैंडम पूर्णांक',
    randomString: 'रैंडम स्ट्रिंग',
    boolean: 'बूलियन',
    currency: 'मुद्रा',
    dateYYYYMMDD: 'तिथि (YYYY-MM-DD)',
    email: 'ईमेल',
    enum: 'Enum',
    number: 'संख्या',
    phone: 'फ़ोन',
    string: 'स्ट्रिंग',
    url: 'URL',
  },

  // Tables
  tables: {
    parameter: 'पैरामीटर',
    value: 'मान',
    check: 'जाँच',
    method: 'मेथड',
    expected: 'अपेक्षित',
    actual: 'वास्तविक',
    result: 'परिणाम',
    name: 'नाम',
    description: 'विवरण',
    request: 'अनुरोध',
  },

  // Context Menu
  contextMenu: {
    setAsVariable: 'वैरिएबल के रूप में सेट करें',
    saveRequestFirst: 'पहले अनुरोध को संग्रह में सहेजें',
    setAsDynamicVariableTitle: '"{{path}}" को डायनामिक वैरिएबल के रूप में सेट करें',
  },

  // Badges
  badges: {
    verified: 'सत्यापित',
    modified: 'संशोधित',
    noChecksum: 'कोई चेकसम नहीं',
  },

  // File input
  fileInput: {
    chooseFile: 'फ़ाइल चुनें',
    noFileChosen: 'कोई फ़ाइल नहीं चुनी गई',
  },

  // Protobuf
  protobuf: {
    decodedProtobuf: 'डिकोडेड Protobuf:',
  },

  // Messages panel
  messages: {
    title: 'संदेश',
  },

  // Export format labels
  exportFormats: {
    json: 'JSON (.json)',
    markdown: 'Markdown (.md)',
    csv: 'CSV (.csv)',
  },
};

export default hi;
