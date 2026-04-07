const uk = {
  // Common
  common: {
    send: 'Надіслати',
    save: 'Зберегти',
    saved: 'Збережено ✅',
    cancel: 'Скасувати',
    close: 'Закрити',
    ok: 'OK',
    create: 'Створити',
    delete: 'Видалити',
    import: 'Імпортувати',
    export: 'Експортувати',
    copy: 'Копіювати',
    copied: 'Скопійовано ✅',
    run: 'Запустити',
    replace: 'Замінити',
    merge: "Об'єднати",
    overwrite: 'Перезаписати',
    enabled: 'Увімкнено',
    disabled: 'Вимкнено',
    warning: 'Попередження:',
    connect: "З'єднати",
    disconnect: "Від'єднати",
    beautify: 'Форматувати',
    reload: 'Перезавантажити',
    cut: 'Вирізати',
    paste: 'Вставити',
  },

  // Sidebar
  sidebar: {
    collections: 'Колекції',
    environments: 'Середовища',
    history: 'Історія',
    settings: 'Налаштування',
    checkForUpdates: 'Перевірити оновлення',
    reportFeedback: 'Надіслати відгук',
  },

  // Collections Panel
  collections: {
    newFolder: 'Нова тека',
    importCollection: 'Імпортувати колекцію',
    exportCollection: 'Експортувати колекцію',
    searchCollections: 'Пошук у колекціях...',
    noMatchingRequests: 'Немає відповідних запитів',
    noSavedRequests: 'Немає збережених запитів',
    importFailed: 'Імпорт не вдався: {{error}}',
    exportFailed: 'Експорт не вдався: {{error}}',
    importedWithWarnings: 'Імпортовано з {{count}} попередженням(-ями)',
    collectionImported: 'Колекцію імпортовано',
    collectionExported: 'Колекцію експортовано',
  },

  // Environment
  environment: {
    newEnvironment: 'Нове середовище',
    editEnvironment: 'Редагувати середовище',
    noEnvironmentsCreated: 'Середовища не створено',
    environmentName: 'Назва середовища',
    environmentNamePlaceholder: 'напр., Продакшн, Стейджинг, Локальне',
    color: 'Колір',
    variables: 'Змінні',
    variableName: 'Назва змінної',
    addVariable: 'Додати змінну',
    value: 'Значення',
    refreshValue: 'Оновити значення',
    refreshAll: 'Оновити все',
    noEnvironment: 'Без середовища',
    selectEnvironment: 'Обрати середовище',
    randomEmail: 'Випадковий email',
    randomInteger: 'Випадкове ціле число',
    randomString: 'Випадковий рядок',
    deleteEnvironmentConfirm: 'Ви впевнені, що хочете видалити це середовище?',
    deleteEnvironment: 'Видалити середовище',
  },

  // History
  history: {
    title: 'Історія',
    clearAll: 'Очистити все',
    searchHistory: 'Пошук в історії...',
    noMatchingHistory: 'Немає відповідної історії',
    noHistoryYet: 'Історія порожня',
    today: 'Сьогодні',
    yesterday: 'Вчора',
  },

  // Request
  request: {
    enterUrl: 'Введіть URL або вставте текст',
    headers: 'Заголовки',
    headersPlaceholder: 'Ключ-Заголовка: значення',
    body: 'Тіло',
    bodyPlaceholderHttp: 'Введіть тіло запиту (JSON або Form Data)',
    bodyPlaceholderWss: 'Тіло повідомлення',
    protobufSchema: 'Схема Protobuf та тип повідомлення',
    protobufDescription:
      'Експериментальний та необовʼязковий розділ. При використанні обидва поля мають бути заповнені',
    messageTypePlaceholder: 'Тип повідомлення (напр. mypackage.MyMessage)',
    protoSchemaLoaded: '🟢 Схему Proto завантажено',
    protoSchemaParseFailed: '🔴 Не вдалося розібрати proto: ',
    wssUrlRequired: '🔴 Використовуйте URL з ws:// або wss://',
  },

  // Response
  response: {
    title: 'Відповідь',
    sending: 'Надсилання...',
    networkError: 'Помилка мережі',
  },

  // cURL
  curl: {
    importCurl: 'Імпортувати cURL',
    importCurlPlaceholder: 'Введіть cURL або вставте текст',
    invalidCurl: 'Введена команда cURL виглядає некоректною. Перевірте її та спробуйте ще раз',
    copyCurl: 'Копіювати cURL',
  },

  // Tests
  tests: {
    generateAndRun: 'Згенерувати та запустити тести',
    runningTests: 'Виконання тестів... ({{current}}/{{total}})',
    selectForCompare: 'Обрати для порівняння',
    compareWithSelected: 'Порівняти з обраним',
    exportFormat: 'Формат',
    exported: 'Експортовано ✅',
    generateCertificate: 'Згенерувати сертифікат',
    certificated: 'Сертифіковано ✅',
    notEligible: 'Не підходить (потрібно щонайменше 70 тестів)',
    securityTests: 'Тести безпеки',
    performanceInsights: 'Аналіз продуктивності',
    dataDrivenTests: 'Тести на основі даних',
    crud: 'CRUD',
    runningSecurityTests: 'Запуск тестів безпеки...',
    runningPerformanceInsights: 'Запуск аналізу продуктивності...',
    runningDataDrivenTests: 'Запуск тестів на основі даних...',
    preparingCrud: 'Підготовка CRUD…',
    crudDescription: 'CRUD генерується на основі відповіді тесту обробки методу OPTIONS у тестах безпеки.',
    crudNote: 'Примітка:',
    crudNoteText: 'Якщо тест обробки методу OPTIONS вимкнено, CRUD не буде згенеровано.',
    copyBugReport: 'Копіювати звіт про помилку',
    computingDifferences: 'Обчислення відмінностей…',
    bodyParameters: 'Параметри тіла',
    queryParameters: 'Параметри запиту',
  },

  // Comparison Panel
  comparison: {
    title: 'Порівняння результатів тестів',
    noTestResults: 'Немає результатів тестів для порівняння',
    potentialBugs: 'Потенційні помилки',
    fullBehaviorChanges: 'Повні зміни поведінки',
    noPotentialBugs: 'Потенційних помилок не виявлено ✅',
    showFullBehaviorChanges: 'Показати повні зміни поведінки',
    behaviorChange: 'Зміна поведінки:',
    showNoise: 'Показати шум',
  },

  // Modals
  modals: {
    reload: {
      title: 'Перезавантажити',
      description: 'Тільки поточні результати тестів будуть втрачені',
      confirmText: 'Перезавантажити',
    },
    sendHttpSuccess: {
      title: 'Запит виглядає добре!',
      description:
        'Rentgen тепер має коректний запит для роботи. Перед генерацією тестів швидко перевірте зіставлені поля, щоб переконатися, що все вірно',
      confirmText: 'Переглянути та згенерувати тести',
      doNotShowAgain: 'Більше не показувати',
    },
    deleteFolder: {
      title: 'Видалити теку',
      description: 'Ця тека містить запити. Ви впевнені, що хочете її видалити?',
    },
    importConflict: {
      title: 'Виявлено конфлікти імпорту',
      conflictDescription: 'Імпортована колекція "{{name}}" має конфлікти з наявною колекцією:',
      collectionNamesMatch: 'Назви колекцій збігаються',
      folderConflicts: '{{count}} тека(-ок) з однаковими назвами',
      requestConflicts: '{{count}} запит(-ів) з однаковим URL+Методом або назвою',
      importWarnings: 'Попередження імпорту: {{count}}',
      replaceDescription: 'Замінити всю наявну колекцію ({{folders}} тек, {{requests}} запитів)',
      mergeDescription: 'Додати лише унікальні елементи (пропускає дублікати за URL+Методом або назвою)',
      newFolders: '{{count}} нова(-их) тека(-ок)',
      newRequests: '{{count}} новий(-их) запит(-ів)',
      noNewItems: 'Немає нових елементів для додавання',
      importAsCopy: 'Імпортувати як копію',
      copyDescription: 'Додати всі теки з суфіксом "(копія)" ({{folders}} тек, {{requests}} запитів)',
    },
    setDynamicVariable: {
      title: 'Встановити як динамічну змінну',
      editTitle: 'Редагувати динамічну змінну',
      variableName: 'Назва змінної',
      variableNamePlaceholder: 'назва_змінної',
      preview: 'Попередній перегляд:',
      environment: 'Середовище',
      allEnvironments: 'Усі середовища',
      untitledEnvironment: 'Середовище без назви',
      selectEnvironment: 'Оберіть середовище...',
      linkedRequest: "Пов'язаний запит",
      variableNameRequired: 'Назва змінної є обовʼязковою',
      selectorRequired: 'Селектор є обовʼязковим',
      selectEnvironmentError: 'Будь ласка, оберіть середовище',
      duplicateWarning: 'Змінна з такою назвою вже існує. Її буде перезаписано.',
      saveVariable: 'Зберегти змінну',
      updateVariable: 'Оновити змінну',
    },
    projectImport: {
      title: 'Імпортувати проєкт',
      file: 'Файл',
      exported: 'Експортовано',
      appVersion: 'Версія застосунку',
      integrity: 'Цілісність',
      integrityWarning:
        'Перевірка цілісності файлу не пройдена. Цей файл міг бути змінений поза Rentgen. Будьте обережні.',
      overwriteWarning: 'Це перезапише ВСІ ваші поточні дані:',
      collectionsCount: 'Колекції ({{folders}} тек, {{requests}} запитів)',
      environmentsCount: 'Середовища ({{count}} середовищ)',
      dynamicVariablesCount: 'Динамічні змінні ({{count}} змінних)',
      historyCount: 'Історія ({{count}} записів)',
      settingsInfo: 'Налаштування (тема, рушій тестів, конфігурація історії)',
      cannotBeUndone: 'Цю дію неможливо скасувати.',
      backupBefore: 'Створіть резервну копію поточного проєкту перед імпортом:',
      exportedCheck: 'Експортовано ✓',
      exportCurrentProject: 'Експортувати поточний проєкт',
      importProject: 'Імпортувати проєкт',
    },
  },

  // Settings
  settings: {
    testEngine: 'Рушій тестів',
    general: 'Загальні',
    themes: 'Теми',
    language: 'Мова',
    cli: 'CLI',
    themesDescription: 'Персоналізуйте свій досвід темами, що відповідають вашому стилю.',
    themeLight: 'Світла',
    themeDark: 'Темна',
    cliDescription: 'Rentgen CLI зараз в активній розробці.',
    cliBody:
      'Rentgen CLI забезпечить готове до автоматизації виконання для команд, що інтегрують структурне тестування в робочі процеси CI/CD.',
    history: {
      title: 'Історія',
      description: 'Налаштуйте спосіб збору та зберігання історії запитів.',
      enableHistory: 'Увімкнути історію',
      maximumSize: 'Максимальний розмір',
      retentionPeriod: 'Період зберігання',
      week1: '1 тиждень',
      month1: '1 місяць',
      months3: '3 місяці',
      months6: '6 місяців',
      year1: '1 рік',
      noRetention: 'Без обмежень',
    },
    project: {
      title: 'Проєкт',
      description:
        'Експортуйте або імпортуйте весь проєкт, включаючи колекції, середовища, змінні, історію та налаштування.',
      exportProject: 'Експортувати проєкт',
      importProject: 'Імпортувати проєкт',
    },
    configuration: {
      title: 'Конфігурація',
      description: 'Налаштуйте правила та обмеження для генерації випадкових тестових значень.',
      email: 'Email',
      domain: 'Домен',
      randomEmailLength: 'Довжина випадкового email',
      enum: 'Enum',
      enumDescription: 'Введіть усі допустимі значення, розділені ","',
      number: 'Число',
      minimumValue: 'Мінімальне значення',
      maximumValue: 'Максимальне значення',
      string: 'Рядок',
      maximumValueLength: 'Максимальна довжина значення',
      randomInteger: 'Випадкове ціле число',
      randomString: 'Випадковий рядок',
      length: 'Довжина',
    },
    securityTests: {
      title: 'Тести безпеки',
      enabledCount: '{{enabled}}/{{total}} увімкнено',
      description: 'Вмикайте або вимикайте окремі тести безпеки для налаштування тестування.',
    },
    languageSection: {
      title: 'Мова',
      description: 'Оберіть бажану мову інтерфейсу застосунку.',
      feedback:
        'Знайшли проблему з перекладом або хочете додати іншу мову? Створіть тікет з усіма деталями, і ми зробимо все можливе.',
      feedbackLink: 'Відкрити тікет на GitHub',
    },
  },

  // Controls
  controls: {
    sizeMB: 'Розмір (МБ)',
    sizeMax: 'Розмір (макс. {{max}} МБ)',
    threads: 'Потоки',
    threadsMax: 'Потоки (макс. 100)',
    requests: 'Запити',
    requestsMax: 'Загальна кількість запитів (макс. 10 000)',
    mandatoryToggle: "Увімкнено = Обов'язково → Rentgen генерує тести на основі цього налаштування",
    enumLabel: 'Введіть усі допустимі значення, розділені ","',
    numberLabel: 'Встановіть діапазон Мін/Макс для граничного тесту. 0 - ціле, 0.00 - десяткове',
    stringLabel: 'Максимальна довжина значення',
  },

  // Parameter types
  parameterTypes: {
    doNotTest: 'Не тестувати',
    randomEmail: 'Випадковий email',
    randomInteger: 'Випадкове ціле число',
    randomString: 'Випадковий рядок',
    boolean: 'Boolean',
    currency: 'Валюта',
    dateYYYYMMDD: 'Дата (РРРР-ММ-ДД)',
    email: 'Email',
    enum: 'Enum',
    number: 'Число',
    phone: 'Телефон',
    string: 'Рядок',
    url: 'URL',
  },

  // Tables
  tables: {
    parameter: 'Параметр',
    value: 'Значення',
    check: 'Перевірка',
    method: 'Метод',
    expected: 'Очікуваний',
    actual: 'Фактичний',
    result: 'Результат',
    name: 'Назва',
    description: 'Опис',
    request: 'Запит',
  },

  // Context Menu
  contextMenu: {
    setAsVariable: 'Встановити як змінну',
    saveRequestFirst: 'Спочатку збережіть запит до колекції',
  },

  // Badges
  badges: {
    verified: 'Перевірено',
    modified: 'Змінено',
    noChecksum: 'Немає контрольної суми',
  },

  // File input
  fileInput: {
    chooseFile: 'Обрати файл',
    noFileChosen: 'Файл не обрано',
  },

  // Protobuf
  protobuf: {
    decodedProtobuf: 'Декодований Protobuf:',
  },

  // Messages panel
  messages: {
    title: 'Повідомлення',
  },

  // Export format labels
  exportFormats: {
    json: 'JSON (.json)',
    markdown: 'Markdown (.md)',
    csv: 'CSV (.csv)',
  },
};

export default uk;
