const ptBR = {
  // Common
  common: {
    send: 'Enviar',
    save: 'Salvar',
    saved: 'Salvo ✅',
    cancel: 'Cancelar',
    close: 'Fechar',
    ok: 'OK',
    create: 'Criar',
    delete: 'Excluir',
    import: 'Importar',
    export: 'Exportar',
    copy: 'Copiar',
    copied: 'Copiado ✅',
    run: 'Executar',
    replace: 'Substituir',
    merge: 'Mesclar',
    overwrite: 'Sobrescrever',
    enabled: 'Ativado',
    disabled: 'Desativado',
    warning: 'Aviso:',
    connect: 'Conectar',
    disconnect: 'Desconectar',
    beautify: 'Formatar',
    reload: 'Recarregar',
    cut: 'Recortar',
    paste: 'Colar',
  },

  // Sidebar
  sidebar: {
    collections: 'Coleções',
    environments: 'Ambientes',
    history: 'Histórico',
    settings: 'Configurações',
    checkForUpdates: 'Verificar atualizações',
    reportFeedback: 'Enviar feedback',
  },

  // Collections Panel
  collections: {
    newFolder: 'Nova pasta',
    importCollection: 'Importar coleção',
    exportCollection: 'Exportar coleção',
    searchCollections: 'Buscar coleções...',
    noMatchingRequests: 'Nenhuma requisição correspondente',
    noSavedRequests: 'Nenhuma requisição salva',
    importFailed: 'Falha na importação: {{error}}',
    exportFailed: 'Falha na exportação: {{error}}',
    importedWithWarnings: 'Importado com {{count}} aviso(s)',
    collectionImported: 'Coleção importada',
    collectionExported: 'Coleção exportada',
  },

  // Environment
  environment: {
    newEnvironment: 'Novo ambiente',
    editEnvironment: 'Editar ambiente',
    noEnvironmentsCreated: 'Nenhum ambiente criado',
    environmentName: 'Nome do ambiente',
    environmentNamePlaceholder: 'ex.: Produção, Staging, Local',
    color: 'Cor',
    variables: 'Variáveis',
    variableName: 'Nome da variável',
    addVariable: 'Adicionar variável',
    value: 'Valor',
    refreshValue: 'Atualizar valor',
    refreshAll: 'Atualizar tudo',
    noEnvironment: 'Sem ambiente',
    selectEnvironment: 'Selecionar ambiente',
    randomEmail: 'Email aleatório',
    randomInteger: 'Inteiro aleatório',
    randomString: 'String aleatória',
    deleteEnvironmentConfirm: 'Tem certeza de que deseja excluir este ambiente?',
    deleteEnvironment: 'Excluir ambiente',
    untitled: 'Sem título',
  },

  // History
  history: {
    title: 'Histórico',
    clearAll: 'Limpar tudo',
    searchHistory: 'Buscar no histórico...',
    noMatchingHistory: 'Nenhum histórico correspondente',
    noHistoryYet: 'Ainda não há histórico',
    today: 'Hoje',
    yesterday: 'Ontem',
  },

  // Request
  request: {
    enterUrl: 'Digite a URL ou cole o texto',
    headers: 'Cabeçalhos',
    headersPlaceholder: 'Header-Key: valor',
    body: 'Corpo',
    bodyPlaceholderHttp: 'Digite o corpo da requisição (JSON ou Form Data)',
    bodyPlaceholderWss: 'Corpo da mensagem',
    protobufSchema: 'Esquema Protobuf e tipo de mensagem',
    protobufDescription: 'Seção experimental e opcional. Se usada, ambos os campos devem ser preenchidos',
    messageTypePlaceholder: 'Tipo de mensagem (ex. mypackage.MyMessage)',
    protoSchemaLoaded: '🟢 Esquema proto carregado',
    protoSchemaParseFailed: '🔴 Falha ao analisar o proto: ',
    wssUrlRequired: '🔴 Por favor, use uma URL ws:// ou wss://',
    modePlaceholder: 'MODO',
    methodPlaceholder: 'MÉTODO',
  },

  // Response
  response: {
    title: 'Resposta',
    sending: 'Enviando...',
    networkError: 'Erro de rede',
  },

  // cURL
  curl: {
    importCurl: 'Importar cURL',
    importCurlPlaceholder: 'Digite o cURL ou cole o texto',
    invalidCurl: 'O comando cURL fornecido parece ser inválido. Verifique e tente novamente',
    copyCurl: 'Copiar cURL',
  },

  // Tests
  tests: {
    generateAndRun: 'Gerar e executar testes',
    runningTests: 'Executando testes... ({{current}}/{{total}})',
    selectForCompare: 'Selecionar para comparar',
    compareWithSelected: 'Comparar com selecionado',
    exportFormat: 'Formato',
    exported: 'Exportado ✅',
    generateCertificate: 'Gerar certificado',
    certificated: 'Certificado ✅',
    notEligible: 'Não elegível (necessário pelo menos 70 testes)',
    securityTests: 'Testes de segurança',
    performanceInsights: 'Insights de desempenho',
    dataDrivenTests: 'Testes orientados a dados',
    crud: 'CRUD',
    runningSecurityTests: 'Executando testes de segurança...',
    runningPerformanceInsights: 'Executando insights de desempenho...',
    runningDataDrivenTests: 'Executando testes orientados a dados...',
    preparingCrud: 'Preparando CRUD…',
    crudDescription:
      'O CRUD é gerado a partir da resposta do teste de tratamento do método OPTIONS nos testes de segurança.',
    crudNote: 'Observação:',
    crudNoteText: 'Se o teste de tratamento do método OPTIONS estiver desativado, o CRUD não será gerado.',
    copyBugReport: 'Copiar relatório de bug',
    computingDifferences: 'Calculando diferenças…',
    bodyParameters: 'Parâmetros do corpo',
    queryParameters: 'Parâmetros de consulta',
    formatPlaceholder: 'Formato',
  },

  // Comparison Panel
  comparison: {
    title: 'Comparação de resultados de testes',
    noTestResults: 'Nenhum resultado de teste para comparar',
    potentialBugs: 'Possíveis bugs',
    fullBehaviorChanges: 'Mudanças completas de comportamento',
    noPotentialBugs: 'Nenhum bug potencial detectado ✅',
    showFullBehaviorChanges: 'Mostrar mudanças completas de comportamento',
    behaviorChange: 'Mudança de comportamento:',
    showNoise: 'Mostrar ruído',
  },

  // Modals
  modals: {
    reload: {
      title: 'Recarregar',
      description: 'Apenas os resultados dos testes atuais serão perdidos',
      confirmText: 'Recarregar',
    },
    sendHttpSuccess: {
      title: 'A requisição parece estar boa!',
      description:
        'O Rentgen agora tem uma requisição válida para trabalhar. Antes de gerar os testes, revise rapidamente os campos mapeados para garantir que tudo esteja correto',
      confirmText: 'Revisar e gerar testes',
      doNotShowAgain: 'Não mostrar novamente',
    },
    deleteFolder: {
      title: 'Excluir pasta',
      description: 'Esta pasta contém requisições. Tem certeza de que deseja excluí-la?',
    },
    importConflict: {
      title: 'Conflitos de importação detectados',
      conflictDescription: 'A coleção importada "{{name}}" tem conflitos com sua coleção existente:',
      collectionNamesMatch: 'Os nomes das coleções coincidem',
      folderConflicts: '{{count}} pasta(s) com nomes correspondentes',
      requestConflicts: '{{count}} requisição(ões) com URL+Método ou nome correspondentes',
      importWarnings: 'Avisos de importação: {{count}}',
      replaceDescription: 'Substituir toda a coleção existente ({{folders}} pastas, {{requests}} requisições)',
      mergeDescription: 'Adicionar somente itens únicos (ignora duplicatas por URL+Método ou nome)',
      newFolders: '{{count}} pasta(s) nova(s)',
      newRequests: '{{count}} requisição(ões) nova(s)',
      noNewItems: 'Nenhum item novo para adicionar',
      importAsCopy: 'Importar como cópia',
      copyDescription:
        'Adicionar todas as pastas com o sufixo "(cópia)" ({{folders}} pastas, {{requests}} requisições)',
    },
    setDynamicVariable: {
      title: 'Definir como variável dinâmica',
      editTitle: 'Editar variável dinâmica',
      variableName: 'Nome da variável',
      variableNamePlaceholder: 'nome_da_variavel',
      preview: 'Pré-visualização:',
      environment: 'Ambiente',
      allEnvironments: 'Todos os ambientes',
      untitledEnvironment: 'Ambiente sem título',
      selectEnvironment: 'Selecionar ambiente...',
      linkedRequest: 'Requisição vinculada',
      variableNameRequired: 'O nome da variável é obrigatório',
      selectorRequired: 'O seletor é obrigatório',
      selectEnvironmentError: 'Por favor, selecione um ambiente',
      duplicateWarning: 'Já existe uma variável com este nome. Ela será sobrescrita.',
      saveVariable: 'Salvar variável',
      updateVariable: 'Atualizar variável',
    },
    projectImport: {
      title: 'Importar projeto',
      file: 'Arquivo',
      exported: 'Exportado',
      appVersion: 'Versão do aplicativo',
      integrity: 'Integridade',
      integrityWarning:
        'A verificação de integridade do arquivo falhou. Este arquivo pode ter sido modificado fora do Rentgen. Prossiga com cautela.',
      overwriteWarning: 'Isso sobrescreverá TODOS os seus dados atuais:',
      collectionsCount: 'Coleções ({{folders}} pastas, {{requests}} requisições)',
      environmentsCount: 'Ambientes ({{count}} ambientes)',
      dynamicVariablesCount: 'Variáveis dinâmicas ({{count}} variáveis)',
      historyCount: 'Histórico ({{count}} entradas)',
      settingsInfo: 'Configurações (tema, motor de testes, configuração do histórico)',
      cannotBeUndone: 'Esta ação não pode ser desfeita.',
      backupBefore: 'Faça backup do seu projeto atual antes de importar:',
      exportedCheck: 'Exportado ✓',
      exportCurrentProject: 'Exportar projeto atual',
      importProject: 'Importar projeto',
    },
  },

  // Settings
  settings: {
    testEngine: 'Motor de testes',
    general: 'Geral',
    themes: 'Temas',
    language: 'Idioma',
    themesDescription: 'Personalize sua experiência com temas que combinam com seu estilo.',
    themeLight: 'Claro',
    themeDark: 'Escuro',
    cli: {
      name: 'CLI',
      intro:
        'O CLI do Rentgen executa uma pasta de requisições a partir de uma exportação de projeto <c>.rentgen</c>, direto do terminal — feito para pipelines de CI e testes de fumaça via script. Ele lê o mesmo arquivo produzido por <e>Geral → Exportar Projeto</e> e nunca grava nele.',
      fullDocumentation: 'Documentação completa:',
      installInPath: 'Instalar no PATH do shell ({{platform}})',
      checkingStatus: 'Verificando status da instalação…',
      runCli: 'Executar o CLI',
      runCliDescription:
        'O Rentgen expõe um único subcomando, <c>xray</c> (alias: <c>run</c>). Aponte-o para um arquivo de projeto exportado do aplicativo.',
      exportProject: 'Exportar projeto',
      noProjectFileYet:
        'Ainda não tem um arquivo de projeto? Exporte um agora — mesma ação que <e>Geral → Exportar Projeto</e>.',
      developmentNote:
        'Durante o desenvolvimento, invoque diretamente do repositório com <c>npm run dev:cli -- xray …</c>.',
      options: 'Opções',
      examples: 'Exemplos',
      exampleInteractive: 'Escolha uma pasta e um ambiente de forma interativa:',
      exampleCi: 'Execução de CI por script com pasta e ambiente explícitos, falhando rapidamente:',
      exampleCiJson:
        'Saída legível por máquina para pipelines de CI (GitHub Actions, Jenkins, notificadores do Slack):',
      exampleOverrideVars: 'Sobrescrever variáveis no ponto de chamada (prioridade máxima):',
      integrityCheck: 'Verificação de integridade',
      integrityCheckDescription:
        'Cada exportação de projeto carrega um checksum SHA-256 dos seus dados. Ao carregar, o CLI recalcula o checksum. Se coincidir, a execução prossegue silenciosamente. Se estiver ausente ou adulterado, você verá um prompt de confirmação em um TTY ou um erro em CI. <c>--skip-integrity-check</c> ignora a verificação — use quando souber que o arquivo foi editado manualmente de propósito.',
      exitCodesTitle: 'Códigos de saída',
      idempotency: 'Idempotência',
      idempotencyDescription:
        'O CLI nunca grava no arquivo de projeto. As variáveis dinâmicas extraídas das respostas são mantidas em memória durante uma única execução, então duas invocações consecutivas contra um projeto não modificado produzem URLs, cabeçalhos e corpos resolvidos byte a byte idênticos.',
      platform: {
        macos: 'macOS',
        windows: 'Windows',
        linux: 'Linux',
      },
      status: {
        binaryUnavailable: 'Binário do CLI indisponível',
        binaryUnavailableReinstall: 'Reinstale a versão mais recente do Rentgen para habilitar o CLI.',
        installed: 'Instalado',
        managedByPackageManager: ' (gerenciado pelo gerenciador de pacotes)',
        conflictingPath: '`rentgen` em conflito no PATH',
        conflictingPathDescription:
          '<c>{{path}}</c> está no PATH, mas não aponta para esta instalação do Rentgen. Remova-o ou a instalação aqui irá sobrepô-lo.',
        notInstalled: 'Não instalado',
        notInstalledDescription: 'Clique em <e>Instalar</e> abaixo para adicionar <c>rentgen</c> ao PATH do seu shell.',
      },
      action: {
        working: 'Trabalhando…',
        uninstall: 'Desinstalar CLI',
        reinstall: 'Reinstalar',
        installRentgenInPath: 'Instalar o comando rentgen no PATH',
        packageManagerNote:
          'O gerenciador de pacotes do Linux cuida da instalação e remoção. Use <c>sudo apt remove rentgen</c> / <c>sudo dnf remove rentgen</c> para desinstalar.',
      },
      platformTip: {
        macos:
          'O macOS solicitará sua senha para gravar o symlink em <c>/usr/local/bin/rentgen</c>. Após a instalação, abra uma nova aba do Terminal para aplicar a alteração.',
        windows:
          'A instalação no Windows adiciona o diretório de recursos do Rentgen ao PATH do <e>usuário</e> (sem necessidade de admin). Abra uma nova aba do PowerShell, Prompt de Comando ou Windows Terminal após a instalação — shells existentes não verão a alteração.',
        linux:
          'No Linux, o script de pós-instalação do deb/rpm vincula <c>/usr/bin/rentgen</c> automaticamente. Se você instalou via um arquivo portátil, este botão cria um symlink de usuário em <c>/usr/local/bin/rentgen</c> (ou <c>~/.local/bin/rentgen</c> como alternativa).',
      },
      flag: {
        collection: 'Pasta a executar a partir do arquivo de projeto. Omita para escolher interativamente.',
        env: 'Ambiente a usar. Passe --env=none para executar sem qualquer ambiente.',
        skipIntegrityCheck: 'Pula o prompt de confirmação do checksum.',
        var: 'Sobrescreve uma variável. Repetível. Prioridade máxima sobre o ambiente e valores dinâmicos.',
        timeout: 'Tempo limite por requisição em milissegundos. Padrão 30000.',
        failFast: 'Parar após a primeira falha.',
        report: 'Saída legível por máquina. Suportado: json (escreve JSON em stdout, suprime saída humana).',
        noColor: 'Desativar saída colorida.',
        verbose: 'Imprime detalhes completos de requisição/resposta e avisa sobre variáveis não resolvidas.',
      },
      exit: {
        code0: 'Todas as requisições passaram.',
        code1: 'A execução foi concluída com falhas, abortada no prompt do checksum ou interrompida com Ctrl+C.',
        code2:
          'Entrada inválida: arquivo ausente, JSON inválido, formato incorreto, --collection / --env ambíguo ou desconhecido, ou modo de CI sem as flags necessárias.',
      },
    },
    history: {
      title: 'Histórico',
      description: 'Configure como o histórico de requisições é coletado e retido.',
      enableHistory: 'Ativar histórico',
      maximumSize: 'Tamanho máximo',
      retentionPeriod: 'Período de retenção',
      week1: '1 semana',
      month1: '1 mês',
      months3: '3 meses',
      months6: '6 meses',
      year1: '1 ano',
      noRetention: 'Sem retenção',
    },
    project: {
      title: 'Projeto',
      description:
        'Exporte ou importe seu projeto inteiro, incluindo coleções, ambientes, variáveis, histórico e configurações.',
      exportProject: 'Exportar projeto',
      importProject: 'Importar projeto',
    },
    configuration: {
      title: 'Configuração',
      description: 'Configure regras e limites para gerar valores aleatórios de dados de teste.',
      email: 'Email',
      domain: 'Domínio',
      randomEmailLength: 'Comprimento do email aleatório',
      enum: 'Enum',
      enumDescription: 'Insira todos os valores válidos separados por ","',
      number: 'Número',
      minimumValue: 'Valor mínimo',
      maximumValue: 'Valor máximo',
      string: 'String',
      maximumValueLength: 'Comprimento máximo do valor',
      randomInteger: 'Inteiro aleatório',
      randomString: 'String aleatória',
      length: 'Comprimento',
    },
    securityTests: {
      title: 'Testes de segurança',
      enabledCount: '{{enabled}}/{{total}} ativados',
      description: 'Ative ou desative testes de segurança individuais para personalizar sua experiência de testes.',
    },
    languageSection: {
      title: 'Idioma',
      description: 'Selecione seu idioma preferido para a interface do aplicativo.',
      feedback:
        'Encontrou um problema de tradução ou deseja adicionar outro idioma? Crie um ticket com todos os detalhes e faremos o nosso melhor.',
      feedbackLink: 'Abrir uma issue no GitHub',
    },
  },

  // Controls
  controls: {
    sizeMB: 'Tamanho (MB)',
    sizeMax: 'Tamanho (máx. {{max}} MB)',
    threads: 'Threads',
    threadsMax: 'Threads (máx. 100)',
    requests: 'Requisições',
    requestsMax: 'Total de requisições (máx. 10 000)',
    mandatoryToggle: 'Ativado = Obrigatório → O Rentgen gera testes com base nesta configuração',
    enumLabel: 'Insira todos os valores válidos separados por ","',
    numberLabel: 'Defina o intervalo Mín/Máx para teste de limites. 0 - inteiro, 0.00 - decimal',
    stringLabel: 'Comprimento máximo do valor',
    minPlaceholder: 'Mín',
    maxPlaceholder: 'Máx',
  },

  // Parameter types
  parameterTypes: {
    doNotTest: 'Não testar',
    randomEmail: 'Email aleatório',
    randomInteger: 'Inteiro aleatório',
    randomString: 'String aleatória',
    boolean: 'Boolean',
    currency: 'Moeda',
    dateYYYYMMDD: 'Data (AAAA-MM-DD)',
    email: 'Email',
    enum: 'Enum',
    number: 'Número',
    phone: 'Telefone',
    string: 'String',
    url: 'URL',
  },

  // Tables
  tables: {
    parameter: 'Parâmetro',
    value: 'Valor',
    check: 'Verificação',
    method: 'Método',
    expected: 'Esperado',
    actual: 'Real',
    result: 'Resultado',
    name: 'Nome',
    description: 'Descrição',
    request: 'Requisição',
  },

  // Context Menu
  contextMenu: {
    setAsVariable: 'Definir como variável',
    saveRequestFirst: 'Salve a requisição em uma coleção primeiro',
    setAsDynamicVariableTitle: 'Definir "{{path}}" como variável dinâmica',
  },

  // Badges
  badges: {
    verified: 'Verificado',
    modified: 'Modificado',
    noChecksum: 'Sem checksum',
  },

  // File input
  fileInput: {
    chooseFile: 'Escolher arquivo',
    noFileChosen: 'Nenhum arquivo escolhido',
  },

  // Protobuf
  protobuf: {
    decodedProtobuf: 'Protobuf decodificado:',
  },

  // Messages panel
  messages: {
    title: 'Mensagens',
  },

  // Export format labels
  exportFormats: {
    json: 'JSON (.json)',
    markdown: 'Markdown (.md)',
    csv: 'CSV (.csv)',
  },
};

export default ptBR;
