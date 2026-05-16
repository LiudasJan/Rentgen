const tr = {
  // Common
  common: {
    send: 'Gönder',
    save: 'Kaydet',
    saved: 'Kaydedildi ✅',
    cancel: 'İptal',
    close: 'Kapat',
    ok: 'Tamam',
    create: 'Oluştur',
    delete: 'Sil',
    import: 'İçe Aktar',
    export: 'Dışa Aktar',
    copy: 'Kopyala',
    copied: 'Kopyalandı ✅',
    run: 'Çalıştır',
    replace: 'Değiştir',
    merge: 'Birleştir',
    overwrite: 'Üzerine Yaz',
    enabled: 'Etkin',
    disabled: 'Devre dışı',
    warning: 'Uyarı:',
    connect: 'Bağlan',
    disconnect: 'Bağlantıyı Kes',
    beautify: 'Güzelleştir',
    reload: 'Yeniden Yükle',
    cut: 'Kes',
    paste: 'Yapıştır',
  },

  // Sidebar
  sidebar: {
    collections: 'Koleksiyonlar',
    environments: 'Ortamlar',
    history: 'Geçmiş',
    settings: 'Ayarlar',
    checkForUpdates: 'Güncellemeleri kontrol et',
    reportFeedback: 'Geri bildirim gönder',
  },

  // Collections Panel
  collections: {
    newFolder: 'Yeni Klasör',
    importCollection: 'Koleksiyonu İçe Aktar',
    exportCollection: 'Koleksiyonu Dışa Aktar',
    searchCollections: 'Koleksiyonlarda ara...',
    noMatchingRequests: 'Eşleşen istek yok',
    noSavedRequests: 'Kaydedilmiş istek yok',
    importFailed: 'İçe aktarma başarısız: {{error}}',
    exportFailed: 'Dışa aktarma başarısız: {{error}}',
    importedWithWarnings: '{{count}} uyarı ile içe aktarıldı',
    collectionImported: 'Koleksiyon içe aktarıldı',
    collectionExported: 'Koleksiyon dışa aktarıldı',
  },

  // Environment
  environment: {
    newEnvironment: 'Yeni Ortam',
    editEnvironment: 'Ortamı Düzenle',
    noEnvironmentsCreated: 'Oluşturulmuş ortam yok',
    environmentName: 'Ortam Adı',
    environmentNamePlaceholder: 'örn. Production, Staging, Local',
    color: 'Renk',
    variables: 'Değişkenler',
    variableName: 'Değişken Adı',
    addVariable: 'Değişken ekle',
    value: 'Değer',
    refreshValue: 'Değeri yenile',
    refreshAll: 'Tümünü Yenile',
    noEnvironment: 'Ortam Yok',
    selectEnvironment: 'Ortam Seçin',
    randomEmail: 'Rastgele e-posta',
    randomInteger: 'Rastgele tam sayı',
    randomString: 'Rastgele dize',
    deleteEnvironmentConfirm: 'Bu ortamı silmek istediğinizden emin misiniz?',
    deleteEnvironment: 'Ortamı Sil',
    untitled: 'Adsız',
  },

  // History
  history: {
    title: 'Geçmiş',
    clearAll: 'Tümünü Temizle',
    searchHistory: 'Geçmişte ara...',
    noMatchingHistory: 'Eşleşen geçmiş yok',
    noHistoryYet: 'Henüz geçmiş yok',
    today: 'Bugün',
    yesterday: 'Dün',
  },

  // Request
  request: {
    enterUrl: 'URL girin veya metin yapıştırın',
    headers: 'Başlıklar',
    headersPlaceholder: 'Başlık-Anahtar: değer',
    body: 'Gövde',
    bodyPlaceholderHttp: 'İstek gövdesini girin (JSON veya Form Data)',
    bodyPlaceholderWss: 'Mesaj gövdesi',
    protobufSchema: 'Protobuf Şeması ve Mesaj Türü',
    protobufDescription: 'Deneysel ve isteğe bağlı bölüm. Kullanılırsa her iki alan da doldurulmalıdır',
    messageTypePlaceholder: 'Mesaj türü (örn. mypackage.MyMessage)',
    protoSchemaLoaded: '🟢 Proto şeması yüklendi',
    protoSchemaParseFailed: '🔴 Proto ayrıştırılamadı: ',
    wssUrlRequired: '🔴 Lütfen ws:// veya wss:// URL kullanın',
    modePlaceholder: 'MOD',
    methodPlaceholder: 'METOT',
  },

  // Response
  response: {
    title: 'Yanıt',
    sending: 'Gönderiliyor...',
    networkError: 'Ağ Hatası',
  },

  // cURL
  curl: {
    importCurl: 'cURL İçe Aktar',
    importCurlPlaceholder: 'cURL girin veya metin yapıştırın',
    invalidCurl: 'Sağladığınız cURL komutu geçersiz görünüyor. Lütfen kontrol edip tekrar deneyin',
    copyCurl: 'cURL Kopyala',
  },

  // Tests
  tests: {
    generateAndRun: 'Testleri Oluştur ve Çalıştır',
    runningTests: 'Testler çalıştırılıyor... ({{current}}/{{total}})',
    selectForCompare: 'Karşılaştırmak için seç',
    compareWithSelected: 'Seçilenle Karşılaştır',
    exportFormat: 'Format',
    exported: 'Dışa Aktarıldı ✅',
    generateCertificate: 'Sertifika Oluştur',
    certificated: 'Sertifikalandı ✅',
    notEligible: 'Uygun değil (en az 70 test gerekli)',
    securityTests: 'Güvenlik Testleri',
    performanceInsights: 'Performans Analizleri',
    dataDrivenTests: 'Veri Odaklı Testler',
    crud: 'CRUD',
    runningSecurityTests: 'Güvenlik Testleri çalıştırılıyor...',
    runningPerformanceInsights: 'Performans Analizleri çalıştırılıyor...',
    runningDataDrivenTests: 'Veri Odaklı Testler çalıştırılıyor...',
    preparingCrud: 'CRUD hazırlanıyor…',
    crudDescription: 'CRUD, Güvenlik Testleri içindeki OPTIONS metodu işleme testinin yanıtına göre oluşturulur.',
    crudNote: 'Not:',
    crudNoteText: 'OPTIONS metodu işleme testi devre dışı bırakılırsa, CRUD oluşturulmaz.',
    copyBugReport: 'Hata Raporunu Kopyala',
    computingDifferences: 'Farklar hesaplanıyor…',
    bodyParameters: 'Gövde Parametreleri',
    queryParameters: 'Sorgu Parametreleri',
    formatPlaceholder: 'Format',
  },

  // Comparison Panel
  comparison: {
    title: 'Test Sonuçları Karşılaştırması',
    noTestResults: 'Karşılaştırılacak test sonucu yok',
    potentialBugs: 'Olası Hatalar',
    fullBehaviorChanges: 'Tam Davranış Değişiklikleri',
    noPotentialBugs: 'Olası hata tespit edilmedi ✅',
    showFullBehaviorChanges: 'Tam Davranış Değişikliklerini Göster',
    behaviorChange: 'Davranış Değişikliği:',
    showNoise: 'Gürültüyü göster',
  },

  // Modals
  modals: {
    reload: {
      title: 'Yeniden Yükle',
      description: 'Yalnızca mevcut test sonuçları kaybolacak',
      confirmText: 'Yeniden Yükle',
    },
    sendHttpSuccess: {
      title: 'İstek Sorunsuz Görünüyor!',
      description:
        'Rentgen artık çalışacak geçerli bir isteğe sahip. Testleri oluşturmadan önce, her şeyin doğru göründüğünden emin olmak için eşlenmiş alanları hızlıca gözden geçirin',
      confirmText: 'İncele ve Testleri Oluştur',
      doNotShowAgain: 'Tekrar gösterme',
    },
    deleteFolder: {
      title: 'Klasörü Sil',
      description: 'Bu klasör istekler içeriyor. Silmek istediğinizden emin misiniz?',
    },
    importConflict: {
      title: 'İçe Aktarma Çakışmaları Tespit Edildi',
      conflictDescription: 'İçe aktarılan "{{name}}" koleksiyonu, mevcut koleksiyonunuzla çakışıyor:',
      collectionNamesMatch: 'Koleksiyon adları eşleşiyor',
      folderConflicts: 'Eşleşen adlara sahip {{count}} klasör',
      requestConflicts: 'Eşleşen URL+Metot veya ada sahip {{count}} istek',
      importWarnings: 'İçe aktarma uyarıları: {{count}}',
      replaceDescription: 'Tüm mevcut koleksiyonu değiştir ({{folders}} klasör, {{requests}} istek)',
      mergeDescription: 'Yalnızca benzersiz öğeleri ekle (URL+Metot veya ada göre yinelenenleri atlar)',
      newFolders: '{{count}} yeni klasör',
      newRequests: '{{count}} yeni istek',
      noNewItems: 'Eklenecek yeni öğe yok',
      importAsCopy: 'Kopya Olarak İçe Aktar',
      copyDescription: 'Tüm klasörleri "(kopya)" sonekiyle ekle ({{folders}} klasör, {{requests}} istek)',
    },
    setDynamicVariable: {
      title: 'Dinamik Değişken Olarak Ayarla',
      editTitle: 'Dinamik Değişkeni Düzenle',
      variableName: 'Değişken Adı',
      variableNamePlaceholder: 'degisken_adi',
      preview: 'Önizleme:',
      environment: 'Ortam',
      allEnvironments: 'Tüm Ortamlar',
      untitledEnvironment: 'Adsız Ortam',
      selectEnvironment: 'Ortam seçin...',
      linkedRequest: 'Bağlı İstek',
      variableNameRequired: 'Değişken adı gereklidir',
      selectorRequired: 'Seçici gereklidir',
      selectEnvironmentError: 'Lütfen bir ortam seçin',
      duplicateWarning: 'Bu ada sahip bir değişken zaten var. Üzerine yazılacak.',
      saveVariable: 'Değişkeni Kaydet',
      updateVariable: 'Değişkeni Güncelle',
    },
    projectImport: {
      title: 'Projeyi İçe Aktar',
      file: 'Dosya',
      exported: 'Dışa Aktarıldı',
      appVersion: 'Uygulama Sürümü',
      integrity: 'Bütünlük',
      integrityWarning:
        'Dosya bütünlük kontrolü başarısız oldu. Bu dosya Rentgen dışında değiştirilmiş olabilir. Dikkatli ilerleyin.',
      overwriteWarning: 'Bu, mevcut TÜM verilerinizin üzerine yazacak:',
      collectionsCount: 'Koleksiyonlar ({{folders}} klasör, {{requests}} istek)',
      environmentsCount: 'Ortamlar ({{count}} ortam)',
      dynamicVariablesCount: 'Dinamik Değişkenler ({{count}} değişken)',
      historyCount: 'Geçmiş ({{count}} kayıt)',
      settingsInfo: 'Ayarlar (tema, test motoru, geçmiş yapılandırması)',
      cannotBeUndone: 'Bu işlem geri alınamaz.',
      backupBefore: 'İçe aktarmadan önce mevcut projenizi yedekleyin:',
      exportedCheck: 'Dışa Aktarıldı ✓',
      exportCurrentProject: 'Mevcut Projeyi Dışa Aktar',
      importProject: 'Projeyi İçe Aktar',
    },
  },

  // Settings
  settings: {
    testEngine: 'Test Motoru',
    general: 'Genel',
    themes: 'Temalar',
    language: 'Dil',
    themesDescription: 'Tarzınıza uygun temalarla deneyiminizi kişiselleştirin.',
    themeLight: 'Açık',
    themeDark: 'Koyu',
    cli: {
      name: 'CLI',
      intro:
        "Rentgen CLI, bir <c>.rentgen</c> proje dışa aktarmasından bir klasör dolusu isteği doğrudan terminalden çalıştırır — CI pipeline'ları ve betikli smoke testler için tasarlanmıştır. <e>Genel → Projeyi Dışa Aktar</e> tarafından üretilen dosyayı okur ve asla geri yazmaz.",
      fullDocumentation: 'Tam belgeler:',
      installInPath: "Shell PATH'e kur ({{platform}})",
      checkingStatus: 'Kurulum durumu kontrol ediliyor…',
      runCli: "CLI'yi çalıştır",
      runCliDescription:
        'Rentgen tek bir alt komut sunar: <c>xray</c> (takma ad: <c>run</c>). Bunu uygulamadan dışa aktardığınız bir proje dosyasına yönlendirin.',
      exportProject: 'Projeyi Dışa Aktar',
      noProjectFileYet:
        'Henüz bir proje dosyanız yok mu? Şimdi bir tane dışa aktarın — <e>Genel → Projeyi Dışa Aktar</e> ile aynı işlem.',
      developmentNote: 'Geliştirme sırasında, doğrudan depodan <c>npm run dev:cli -- xray …</c> ile çağırın.',
      options: 'Seçenekler',
      examples: 'Örnekler',
      exampleInteractive: 'Etkileşimli olarak bir klasör ve ortam seçin:',
      exampleCi: 'Açıkça belirtilmiş klasör ve ortamla, hızlı başarısız olan betikli CI çalıştırması:',
      exampleCiJson:
        "CI pipeline'ları için makine tarafından okunabilir çıktı (GitHub Actions, Jenkins, Slack bildiricileri):",
      exampleOverrideVars: 'Değişkenleri çağrı yerinde geçersiz kıl (en yüksek öncelik):',
      integrityCheck: 'Bütünlük kontrolü',
      integrityCheckDescription:
        "Her proje dışa aktarması, verilerinin SHA-256 sağlama toplamını taşır. Yükleme sırasında CLI sağlama toplamını yeniden hesaplar. Eşleşirse, çalıştırma sessizce devam eder. Eksik veya değiştirilmişse, bir TTY'de onay istemi veya CI'da bir hata göreceksiniz. <c>--skip-integrity-check</c> kontrolü atlar — dosyanın bilerek elle düzenlendiğini bildiğinizde kullanın.",
      exitCodesTitle: 'Çıkış kodları',
      idempotency: 'Idempotency',
      idempotencyDescription:
        "CLI proje dosyasına asla yazmaz. Yanıtlardan çıkarılan dinamik değişkenler tek bir çalıştırma süresince bellekte tutulur, böylece değiştirilmemiş bir projeye karşı arka arkaya yapılan iki çağrı bayt düzeyinde aynı çözümlenmiş URL'ler, başlıklar ve gövdeler üretir.",
      platform: {
        macos: 'macOS',
        windows: 'Windows',
        linux: 'Linux',
      },
      status: {
        binaryUnavailable: 'CLI ikilisi kullanılamıyor',
        binaryUnavailableReinstall: "CLI'yi etkinleştirmek için en son Rentgen sürümünü yeniden yükleyin.",
        installed: 'Yüklü',
        managedByPackageManager: ' (paket yöneticisi tarafından yönetilir)',
        conflictingPath: 'PATH üzerinde çakışan `rentgen`',
        conflictingPathDescription:
          "<c>{{path}}</c> PATH'te ama bu Rentgen kurulumunu işaret etmiyor. Onu kaldırın yoksa buraya kurulum onu gölgeleyecek.",
        notInstalled: 'Yüklü değil',
        notInstalledDescription: "Shell PATH'inize <c>rentgen</c> eklemek için aşağıdaki <e>Yükle</e>'ye tıklayın.",
      },
      action: {
        working: 'İşleniyor…',
        uninstall: "CLI'yi Kaldır",
        reinstall: 'Yeniden Yükle',
        installRentgenInPath: "rentgen komutunu PATH'e yükle",
        packageManagerNote:
          'Linux paket yöneticisi kurulum ve kaldırmayı yönetir. Kaldırmak için <c>sudo apt remove rentgen</c> / <c>sudo dnf remove rentgen</c> kullanın.',
      },
      platformTip: {
        macos:
          'macOS, <c>/usr/local/bin/rentgen</c> yoluna symlink yazmak için parolanızı isteyecektir. Kurulumdan sonra, değişikliği almak için yeni bir Terminal sekmesi açın.',
        windows:
          "Windows kurulumu, Rentgen kaynak dizinini <e>kullanıcı</e> PATH'inize ekler (yönetici izni gerekmez). Kurulumdan sonra yeni bir PowerShell, Komut İstemi veya Windows Terminal sekmesi açın — mevcut shell'ler değişikliği görmeyecek.",
        linux:
          "Linux'ta, deb/rpm postinstall betiği <c>/usr/bin/rentgen</c> bağlantısını otomatik olarak oluşturur. Bunun yerine taşınabilir bir arşivle kurduysanız, bu düğme <c>/usr/local/bin/rentgen</c> (veya yedek olarak <c>~/.local/bin/rentgen</c>) konumunda bir kullanıcı symlink'i oluşturur.",
      },
      flag: {
        collection: 'Proje dosyasından çalıştırılacak klasör. Etkileşimli olarak seçmek için atlayın.',
        env: 'Kullanılacak ortam. Hiçbir ortam olmadan çalıştırmak için --env=none geçin.',
        skipIntegrityCheck: 'Sağlama toplamı onay istemini atla.',
        var: 'Bir değişkeni geçersiz kıl. Tekrarlanabilir. Ortam ve dinamik değerlere göre en yüksek öncelik.',
        timeout: 'Milisaniye cinsinden istek başına zaman aşımı. Varsayılan 30000.',
        failFast: 'İlk başarısızlıktan sonra dur.',
        report:
          "Makine tarafından okunabilir çıktı. Desteklenen: json (JSON'u stdout'a yazar, insan çıktısını gizler).",
        noColor: 'Renkli çıktıyı devre dışı bırak.',
        verbose: 'Tüm istek/yanıt ayrıntılarını yazdır ve çözümlenmemiş değişkenler hakkında uyar.',
      },
      exit: {
        code0: 'Tüm istekler başarılı.',
        code1:
          'Çalıştırma başarısızlıklarla tamamlandı, sağlama toplamı isteminde iptal edildi veya Ctrl+C ile kesildi.',
        code2:
          'Geçersiz giriş: eksik dosya, hatalı JSON, yanlış şekil, belirsiz veya bilinmeyen --collection / --env veya gerekli bayraklar olmadan CI modu.',
      },
    },
    history: {
      title: 'Geçmiş',
      description: 'İstek geçmişinin nasıl toplanacağını ve saklanacağını yapılandırın.',
      enableHistory: 'Geçmişi Etkinleştir',
      maximumSize: 'Maksimum Boyut',
      retentionPeriod: 'Saklama Süresi',
      week1: '1 Hafta',
      month1: '1 Ay',
      months3: '3 Ay',
      months6: '6 Ay',
      year1: '1 Yıl',
      noRetention: 'Saklama Yok',
    },
    project: {
      title: 'Proje',
      description:
        'Koleksiyonlar, ortamlar, değişkenler, geçmiş ve ayarlar dahil olmak üzere tüm projenizi dışa veya içe aktarın.',
      exportProject: 'Projeyi Dışa Aktar',
      importProject: 'Projeyi İçe Aktar',
    },
    configuration: {
      title: 'Yapılandırma',
      description: 'Rastgele test verisi değerleri oluşturmak için kuralları ve sınırları yapılandırın.',
      email: 'E-posta',
      domain: 'Alan adı',
      randomEmailLength: 'Rastgele E-posta Uzunluğu',
      enum: 'Enum',
      enumDescription: 'Tüm geçerli değerleri "," ile ayırarak girin',
      number: 'Sayı',
      minimumValue: 'Minimum Değer',
      maximumValue: 'Maksimum Değer',
      string: 'Dize',
      maximumValueLength: 'Maksimum Değer Uzunluğu',
      randomInteger: 'Rastgele Tam Sayı',
      randomString: 'Rastgele Dize',
      length: 'Uzunluk',
    },
    securityTests: {
      title: 'Güvenlik Testleri',
      enabledCount: '{{enabled}}/{{total}} etkin',
      description: 'Test deneyiminizi kişiselleştirmek için bireysel güvenlik testlerini açıp kapatın.',
    },
    languageSection: {
      title: 'Dil',
      description: 'Uygulama arayüzü için tercih ettiğiniz dili seçin.',
      feedback:
        'Bir çeviri sorunu mu buldunuz veya başka bir dil mi eklemek istiyorsunuz? Tüm ayrıntılarla bir bilet oluşturun, elimizden geleni yapacağız.',
      feedbackLink: "GitHub'da konu aç",
    },
  },

  // Controls
  controls: {
    sizeMB: 'Boyut (MB)',
    sizeMax: 'Boyut (en fazla {{max}} MB)',
    threads: 'İş Parçacıkları',
    threadsMax: 'İş Parçacıkları (en fazla 100)',
    requests: 'İstekler',
    requestsMax: 'Toplam istek (en fazla 10 000)',
    mandatoryToggle: 'Etkin = Zorunlu → Rentgen bu ayara göre testler oluşturur',
    enumLabel: 'Tüm geçerli değerleri "," ile ayırarak girin',
    numberLabel: 'Sınır testi için Min/Maks aralığını ayarlayın. 0 - tam sayı, 0.00 - ondalık',
    stringLabel: 'Maksimum değer uzunluğu',
    minPlaceholder: 'Min',
    maxPlaceholder: 'Maks',
  },

  // Parameter types
  parameterTypes: {
    doNotTest: 'Test etme',
    randomEmail: 'Rastgele e-posta',
    randomInteger: 'Rastgele tam sayı',
    randomString: 'Rastgele dize',
    boolean: 'Boolean',
    currency: 'Para birimi',
    dateYYYYMMDD: 'Tarih (YYYY-AA-GG)',
    email: 'E-posta',
    enum: 'Enum',
    number: 'Sayı',
    phone: 'Telefon',
    string: 'Dize',
    url: 'URL',
  },

  // Tables
  tables: {
    parameter: 'Parametre',
    value: 'Değer',
    check: 'Kontrol',
    method: 'Metot',
    expected: 'Beklenen',
    actual: 'Gerçek',
    result: 'Sonuç',
    name: 'Ad',
    description: 'Açıklama',
    request: 'İstek',
  },

  // Context Menu
  contextMenu: {
    setAsVariable: 'Değişken Olarak Ayarla',
    saveRequestFirst: 'Önce isteği koleksiyona kaydedin',
    setAsDynamicVariableTitle: '"{{path}}" değerini dinamik değişken olarak ayarla',
  },

  // Badges
  badges: {
    verified: 'Doğrulandı',
    modified: 'Değiştirildi',
    noChecksum: 'Sağlama toplamı yok',
  },

  // File input
  fileInput: {
    chooseFile: 'Dosya Seç',
    noFileChosen: 'Dosya seçilmedi',
  },

  // Protobuf
  protobuf: {
    decodedProtobuf: 'Çözülmüş Protobuf:',
  },

  // Messages panel
  messages: {
    title: 'Mesajlar',
  },

  // Export format labels
  exportFormats: {
    json: 'JSON (.json)',
    markdown: 'Markdown (.md)',
    csv: 'CSV (.csv)',
  },
};

export default tr;
