const es = {
  // Common
  common: {
    send: 'Enviar',
    save: 'Guardar',
    saved: 'Guardado ✅',
    cancel: 'Cancelar',
    close: 'Cerrar',
    ok: 'OK',
    create: 'Crear',
    delete: 'Eliminar',
    import: 'Importar',
    export: 'Exportar',
    copy: 'Copiar',
    copied: 'Copiado ✅',
    run: 'Ejecutar',
    replace: 'Reemplazar',
    merge: 'Fusionar',
    overwrite: 'Sobrescribir',
    enabled: 'Activado',
    disabled: 'Desactivado',
    warning: 'Advertencia:',
    connect: 'Conectar',
    disconnect: 'Desconectar',
    beautify: 'Formatear',
    reload: 'Recargar',
    cut: 'Cortar',
    paste: 'Pegar',
  },

  // Sidebar
  sidebar: {
    collections: 'Colecciones',
    environments: 'Entornos',
    history: 'Historial',
    settings: 'Ajustes',
    checkForUpdates: 'Buscar actualizaciones',
    reportFeedback: 'Enviar comentarios',
  },

  // Collections Panel
  collections: {
    newFolder: 'Nueva carpeta',
    importCollection: 'Importar colección',
    exportCollection: 'Exportar colección',
    searchCollections: 'Buscar en colecciones...',
    noMatchingRequests: 'No hay solicitudes coincidentes',
    noSavedRequests: 'No hay solicitudes guardadas',
    importFailed: 'Error al importar: {{error}}',
    exportFailed: 'Error al exportar: {{error}}',
    importedWithWarnings: 'Importado con {{count}} advertencia(s)',
    collectionImported: 'Colección importada',
    collectionExported: 'Colección exportada',
  },

  // Environment
  environment: {
    newEnvironment: 'Nuevo entorno',
    editEnvironment: 'Editar entorno',
    noEnvironmentsCreated: 'No se han creado entornos',
    environmentName: 'Nombre del entorno',
    environmentNamePlaceholder: 'ej., Producción, Staging, Local',
    color: 'Color',
    variables: 'Variables',
    variableName: 'Nombre de variable',
    addVariable: 'Añadir variable',
    value: 'Valor',
    refreshValue: 'Actualizar valor',
    refreshAll: 'Actualizar todo',
    noEnvironment: 'Sin entorno',
    selectEnvironment: 'Seleccionar entorno',
    randomEmail: 'Email aleatorio',
    randomInteger: 'Entero aleatorio',
    randomString: 'Cadena aleatoria',
    deleteEnvironmentConfirm: '¿Estás seguro de que deseas eliminar este entorno?',
    deleteEnvironment: 'Eliminar entorno',
    untitled: 'Sin título',
  },

  // History
  history: {
    title: 'Historial',
    clearAll: 'Borrar todo',
    searchHistory: 'Buscar en historial...',
    noMatchingHistory: 'No hay historial coincidente',
    noHistoryYet: 'Aún no hay historial',
    today: 'Hoy',
    yesterday: 'Ayer',
  },

  // Request
  request: {
    enterUrl: 'Introduce una URL o pega texto',
    headers: 'Cabeceras',
    headersPlaceholder: 'Clave-Cabecera: valor',
    body: 'Cuerpo',
    bodyPlaceholderHttp: 'Introduce el cuerpo de la solicitud (JSON o Form Data)',
    bodyPlaceholderWss: 'Cuerpo del mensaje',
    protobufSchema: 'Esquema Protobuf y tipo de mensaje',
    protobufDescription: 'Sección experimental y opcional. Si se usa, ambos campos deben completarse',
    messageTypePlaceholder: 'Tipo de mensaje (ej. mypackage.MyMessage)',
    protoSchemaLoaded: '🟢 Esquema Proto cargado',
    protoSchemaParseFailed: '🔴 Error al analizar proto: ',
    wssUrlRequired: '🔴 Por favor usa una URL con ws:// o wss://',
    modePlaceholder: 'MODO',
    methodPlaceholder: 'MÉTODO',
  },

  // Response
  response: {
    title: 'Respuesta',
    sending: 'Enviando...',
    networkError: 'Error de red',
  },

  // cURL
  curl: {
    importCurl: 'Importar cURL',
    importCurlPlaceholder: 'Introduce cURL o pega texto',
    invalidCurl: 'El comando cURL proporcionado parece ser inválido. Revísalo e inténtalo de nuevo',
    copyCurl: 'Copiar cURL',
  },

  // Tests
  tests: {
    generateAndRun: 'Generar y ejecutar pruebas',
    runningTests: 'Ejecutando pruebas... ({{current}}/{{total}})',
    selectForCompare: 'Seleccionar para comparar',
    compareWithSelected: 'Comparar con seleccionado',
    exportFormat: 'Formato',
    exported: 'Exportado ✅',
    generateCertificate: 'Generar certificado',
    certificated: 'Certificado ✅',
    notEligible: 'No elegible (se necesitan al menos 70 pruebas)',
    securityTests: 'Pruebas de seguridad',
    performanceInsights: 'Análisis de rendimiento',
    dataDrivenTests: 'Pruebas basadas en datos',
    crud: 'CRUD',
    runningSecurityTests: 'Ejecutando pruebas de seguridad...',
    runningPerformanceInsights: 'Ejecutando análisis de rendimiento...',
    runningDataDrivenTests: 'Ejecutando pruebas basadas en datos...',
    preparingCrud: 'Preparando CRUD…',
    crudDescription:
      'CRUD se genera a partir de la respuesta de la prueba de manejo del método OPTIONS en las pruebas de seguridad.',
    crudNote: 'Nota:',
    crudNoteText: 'Si la prueba de manejo del método OPTIONS está desactivada, CRUD no se generará.',
    copyBugReport: 'Copiar informe de error',
    computingDifferences: 'Calculando diferencias…',
    bodyParameters: 'Parámetros del cuerpo',
    queryParameters: 'Parámetros de consulta',
    formatPlaceholder: 'Formato',
  },

  // Comparison Panel
  comparison: {
    title: 'Comparación de resultados de pruebas',
    noTestResults: 'No hay resultados de pruebas para comparar',
    potentialBugs: 'Errores potenciales',
    fullBehaviorChanges: 'Cambios completos de comportamiento',
    noPotentialBugs: 'No se detectaron errores potenciales ✅',
    showFullBehaviorChanges: 'Mostrar cambios completos de comportamiento',
    behaviorChange: 'Cambio de comportamiento:',
    showNoise: 'Mostrar ruido',
  },

  // Modals
  modals: {
    reload: {
      title: 'Recargar',
      description: 'Solo se perderán los resultados de pruebas actuales',
      confirmText: 'Recargar',
    },
    sendHttpSuccess: {
      title: '¡La solicitud se ve bien!',
      description:
        'Rentgen ahora tiene una solicitud válida para trabajar. Antes de generar pruebas, revisa rápidamente los campos mapeados para asegurarte de que todo esté correcto',
      confirmText: 'Revisar y generar pruebas',
      doNotShowAgain: 'No mostrar de nuevo',
    },
    deleteFolder: {
      title: 'Eliminar carpeta',
      description: 'Esta carpeta contiene solicitudes. ¿Estás seguro de que deseas eliminarla?',
    },
    importConflict: {
      title: 'Conflictos de importación detectados',
      conflictDescription: 'La colección importada "{{name}}" tiene conflictos con tu colección existente:',
      collectionNamesMatch: 'Los nombres de colección coinciden',
      folderConflicts: '{{count}} carpeta(s) con nombres coincidentes',
      requestConflicts: '{{count}} solicitud(es) con URL+Método o nombre coincidentes',
      importWarnings: 'Advertencias de importación: {{count}}',
      replaceDescription: 'Reemplazar toda la colección existente ({{folders}} carpetas, {{requests}} solicitudes)',
      mergeDescription: 'Añadir solo elementos únicos (omite duplicados por URL+Método o nombre)',
      newFolders: '{{count}} carpeta(s) nueva(s)',
      newRequests: '{{count}} solicitud(es) nueva(s)',
      noNewItems: 'No hay elementos nuevos para añadir',
      importAsCopy: 'Importar como copia',
      copyDescription:
        'Añadir todas las carpetas con sufijo "(copia)" ({{folders}} carpetas, {{requests}} solicitudes)',
    },
    setDynamicVariable: {
      title: 'Establecer como variable dinámica',
      editTitle: 'Editar variable dinámica',
      variableName: 'Nombre de variable',
      variableNamePlaceholder: 'nombre_variable',
      preview: 'Vista previa:',
      environment: 'Entorno',
      allEnvironments: 'Todos los entornos',
      untitledEnvironment: 'Entorno sin título',
      selectEnvironment: 'Seleccionar entorno...',
      linkedRequest: 'Solicitud vinculada',
      variableNameRequired: 'El nombre de variable es obligatorio',
      selectorRequired: 'El selector es obligatorio',
      selectEnvironmentError: 'Por favor selecciona un entorno',
      duplicateWarning: 'Ya existe una variable con este nombre. Será sobrescrita.',
      saveVariable: 'Guardar variable',
      updateVariable: 'Actualizar variable',
    },
    projectImport: {
      title: 'Importar proyecto',
      file: 'Archivo',
      exported: 'Exportado',
      appVersion: 'Versión de la aplicación',
      integrity: 'Integridad',
      integrityWarning:
        'La verificación de integridad del archivo falló. Este archivo puede haber sido modificado fuera de Rentgen. Procede con precaución.',
      overwriteWarning: 'Esto sobrescribirá TODOS tus datos actuales:',
      collectionsCount: 'Colecciones ({{folders}} carpetas, {{requests}} solicitudes)',
      environmentsCount: 'Entornos ({{count}} entornos)',
      dynamicVariablesCount: 'Variables dinámicas ({{count}} variables)',
      historyCount: 'Historial ({{count}} entradas)',
      settingsInfo: 'Ajustes (tema, motor de pruebas, configuración de historial)',
      cannotBeUndone: 'Esta acción no se puede deshacer.',
      backupBefore: 'Haz una copia de seguridad de tu proyecto actual antes de importar:',
      exportedCheck: 'Exportado ✓',
      exportCurrentProject: 'Exportar proyecto actual',
      importProject: 'Importar proyecto',
    },
  },

  // Settings
  settings: {
    testEngine: 'Motor de pruebas',
    general: 'General',
    themes: 'Temas',
    language: 'Idioma',
    themesDescription: 'Personaliza tu experiencia con temas que se adapten a tu estilo.',
    themeLight: 'Claro',
    themeDark: 'Oscuro',
    cli: {
      name: 'CLI',
      intro:
        'El CLI de Rentgen ejecuta una carpeta de solicitudes desde una exportación de proyecto <c>.rentgen</c>, directamente desde el terminal — construido para pipelines de CI y pruebas de humo en scripts. Lee el mismo archivo producido por <e>General → Exportar proyecto</e> y nunca escribe en él.',
      fullDocumentation: 'Documentación completa:',
      installInPath: 'Instalar en shell PATH ({{platform}})',
      checkingStatus: 'Comprobando estado de instalación…',
      runCli: 'Ejecutar el CLI',
      runCliDescription:
        'Rentgen expone un único subcomando, <c>xray</c> (alias: <c>run</c>). Apúntalo al archivo de proyecto que exportaste desde la aplicación.',
      exportProject: 'Exportar proyecto',
      noProjectFileYet:
        '¿Aún no tienes un archivo de proyecto? Exporta uno ahora — misma acción que <e>General → Exportar proyecto</e>.',
      developmentNote:
        'Durante el desarrollo, invócalo directamente desde el repo con <c>npm run dev:cli -- xray …</c>.',
      options: 'Opciones',
      examples: 'Ejemplos',
      exampleInteractive: 'Elige una carpeta y un entorno de forma interactiva:',
      exampleCi: 'Ejecución scriptada de CI con carpeta y entorno explícitos, fallando rápido:',
      exampleCiJson: 'Salida legible por máquina para pipelines de CI (GitHub Actions, Jenkins, notificadores Slack):',
      exampleOverrideVars: 'Sobrescribe variables en el sitio de llamada (máxima prioridad):',
      integrityCheck: 'Verificación de integridad',
      integrityCheckDescription:
        'Cada exportación de proyecto lleva un checksum SHA-256 de sus datos. Al cargar, el CLI recalcula el checksum. Si coincide, la ejecución continúa silenciosamente. Si falta o ha sido manipulado, verás un aviso de confirmación en TTY o un error en CI. <c>--skip-integrity-check</c> omite el control — úsalo cuando sabes que el archivo se editó manualmente a propósito.',
      exitCodesTitle: 'Códigos de salida',
      idempotency: 'Idempotencia',
      idempotencyDescription:
        'El CLI nunca escribe en el archivo de proyecto. Las variables dinámicas extraídas de las respuestas se mantienen en memoria durante una única ejecución, así que dos invocaciones consecutivas contra un proyecto sin modificar producen URLs, cabeceras y cuerpos resueltos byte por byte idénticos.',
      platform: {
        macos: 'macOS',
        windows: 'Windows',
        linux: 'Linux',
      },
      status: {
        binaryUnavailable: 'Binario CLI no disponible',
        binaryUnavailableReinstall: 'Reinstala la última versión de Rentgen para habilitar el CLI.',
        installed: 'Instalado',
        managedByPackageManager: ' (gestionado por el administrador de paquetes)',
        conflictingPath: '`rentgen` en conflicto en PATH',
        conflictingPathDescription:
          '<c>{{path}}</c> está en PATH pero no apunta a esta instalación de Rentgen. Elimínalo o instalar aquí lo enmascarará.',
        notInstalled: 'No instalado',
        notInstalledDescription: 'Haz clic en <e>Instalar</e> abajo para añadir <c>rentgen</c> a tu shell PATH.',
      },
      action: {
        working: 'Trabajando…',
        uninstall: 'Desinstalar CLI',
        reinstall: 'Reinstalar',
        installRentgenInPath: 'Instalar comando rentgen en PATH',
        packageManagerNote:
          'El administrador de paquetes de Linux gestiona la instalación y la eliminación. Usa <c>sudo apt remove rentgen</c> / <c>sudo dnf remove rentgen</c> para desinstalar.',
      },
      platformTip: {
        macos:
          'macOS te pedirá tu contraseña para escribir el symlink en <c>/usr/local/bin/rentgen</c>. Después de instalar, abre una nueva pestaña de Terminal para aplicar el cambio.',
        windows:
          'La instalación en Windows añade el directorio de recursos de Rentgen al PATH de <e>usuario</e> (no requiere admin). Abre una nueva pestaña de PowerShell, Command Prompt o Windows Terminal después de instalar — las shells existentes no verán el cambio.',
        linux:
          'En Linux, el script postinstalación de deb/rpm enlaza <c>/usr/bin/rentgen</c> automáticamente. Si instalaste mediante un archivo portátil, este botón crea un symlink de usuario en <c>/usr/local/bin/rentgen</c> (o <c>~/.local/bin/rentgen</c> como alternativa).',
      },
      flag: {
        collection: 'Carpeta a ejecutar desde el archivo de proyecto. Omite para elegir interactivamente.',
        env: 'Entorno a usar. Pasa --env=none para ejecutar sin entorno.',
        skipIntegrityCheck: 'Omite el aviso de confirmación del checksum.',
        var: 'Sobrescribe una variable. Repetible. Máxima prioridad sobre el entorno y valores dinámicos.',
        timeout: 'Tiempo de espera por solicitud en milisegundos. Por defecto 30000.',
        failFast: 'Detener tras el primer fallo.',
        report: 'Salida legible por máquina. Compatibles: json (escribe JSON en stdout, suprime salida humana).',
        noColor: 'Desactivar salida coloreada.',
        verbose: 'Imprime detalles completos de solicitud/respuesta y advierte sobre variables sin resolver.',
      },
      exit: {
        code0: 'Todas las solicitudes pasaron.',
        code1: 'La ejecución terminó con fallos, se abortó en el aviso de checksum o se interrumpió con Ctrl+C.',
        code2:
          'Entrada inválida: archivo faltante, JSON erróneo, forma incorrecta, --collection / --env ambiguo o desconocido, o modo CI sin las flags requeridas.',
      },
    },
    history: {
      title: 'Historial',
      description: 'Configura cómo se recopila y retiene el historial de solicitudes.',
      enableHistory: 'Activar historial',
      maximumSize: 'Tamaño máximo',
      retentionPeriod: 'Período de retención',
      week1: '1 semana',
      month1: '1 mes',
      months3: '3 meses',
      months6: '6 meses',
      year1: '1 año',
      noRetention: 'Sin límite',
    },
    project: {
      title: 'Proyecto',
      description:
        'Exporta o importa tu proyecto completo incluyendo colecciones, entornos, variables, historial y ajustes.',
      exportProject: 'Exportar proyecto',
      importProject: 'Importar proyecto',
    },
    configuration: {
      title: 'Configuración',
      description: 'Configura reglas y límites para generar valores de prueba aleatorios.',
      email: 'Email',
      domain: 'Dominio',
      randomEmailLength: 'Longitud de email aleatorio',
      enum: 'Enum',
      enumDescription: 'Introduce todos los valores válidos separados por ","',
      number: 'Número',
      minimumValue: 'Valor mínimo',
      maximumValue: 'Valor máximo',
      string: 'Cadena',
      maximumValueLength: 'Longitud máxima del valor',
      randomInteger: 'Entero aleatorio',
      randomString: 'Cadena aleatoria',
      length: 'Longitud',
    },
    securityTests: {
      title: 'Pruebas de seguridad',
      enabledCount: '{{enabled}}/{{total}} activadas',
      description: 'Activa o desactiva pruebas de seguridad individuales para personalizar tu experiencia de pruebas.',
    },
    languageSection: {
      title: 'Idioma',
      description: 'Selecciona tu idioma preferido para la interfaz de la aplicación.',
      feedback:
        '¿Encontraste un problema de traducción o quieres añadir otro idioma? Crea un ticket con todos los detalles y haremos lo posible.',
      feedbackLink: 'Abrir un ticket en GitHub',
    },
  },

  // Controls
  controls: {
    sizeMB: 'Tamaño (MB)',
    sizeMax: 'Tamaño (máx. {{max}} MB)',
    threads: 'Hilos',
    threadsMax: 'Hilos (máx. 100)',
    requests: 'Solicitudes',
    requestsMax: 'Total de solicitudes (máx. 10 000)',
    mandatoryToggle: 'Activado = Obligatorio → Rentgen genera pruebas basadas en esta configuración',
    enumLabel: 'Introduce todos los valores válidos separados por ","',
    numberLabel: 'Establece el rango Mín/Máx para prueba de límites. 0 - entero, 0.00 - decimal',
    stringLabel: 'Longitud máxima del valor',
    minPlaceholder: 'Mín',
    maxPlaceholder: 'Máx',
  },

  // Parameter types
  parameterTypes: {
    doNotTest: 'No probar',
    randomEmail: 'Email aleatorio',
    randomInteger: 'Entero aleatorio',
    randomString: 'Cadena aleatoria',
    boolean: 'Boolean',
    currency: 'Moneda',
    dateYYYYMMDD: 'Fecha (AAAA-MM-DD)',
    email: 'Email',
    enum: 'Enum',
    number: 'Número',
    phone: 'Teléfono',
    string: 'Cadena',
    url: 'URL',
  },

  // Tables
  tables: {
    parameter: 'Parámetro',
    value: 'Valor',
    check: 'Verificación',
    method: 'Método',
    expected: 'Esperado',
    actual: 'Real',
    result: 'Resultado',
    name: 'Nombre',
    description: 'Descripción',
    request: 'Solicitud',
  },

  // Context Menu
  contextMenu: {
    setAsVariable: 'Establecer como variable',
    saveRequestFirst: 'Primero guarda la solicitud en una colección',
    setAsDynamicVariableTitle: 'Establecer "{{path}}" como variable dinámica',
  },

  // Badges
  badges: {
    verified: 'Verificado',
    modified: 'Modificado',
    noChecksum: 'Sin checksum',
  },

  // File input
  fileInput: {
    chooseFile: 'Elegir archivo',
    noFileChosen: 'Ningún archivo elegido',
  },

  // Protobuf
  protobuf: {
    decodedProtobuf: 'Protobuf decodificado:',
  },

  // Messages panel
  messages: {
    title: 'Mensajes',
  },

  // Export format labels
  exportFormats: {
    json: 'JSON (.json)',
    markdown: 'Markdown (.md)',
    csv: 'CSV (.csv)',
  },
};

export default es;
