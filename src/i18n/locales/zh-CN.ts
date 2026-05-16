const zhCN = {
  // Common
  common: {
    send: '发送',
    save: '保存',
    saved: '已保存 ✅',
    cancel: '取消',
    close: '关闭',
    ok: '确定',
    create: '创建',
    delete: '删除',
    import: '导入',
    export: '导出',
    copy: '复制',
    copied: '已复制 ✅',
    run: '运行',
    replace: '替换',
    merge: '合并',
    overwrite: '覆盖',
    enabled: '已启用',
    disabled: '已禁用',
    warning: '警告：',
    connect: '连接',
    disconnect: '断开',
    beautify: '格式化',
    reload: '重新加载',
    cut: '剪切',
    paste: '粘贴',
  },

  // Sidebar
  sidebar: {
    collections: '集合',
    environments: '环境',
    history: '历史',
    settings: '设置',
    checkForUpdates: '检查更新',
    reportFeedback: '反馈问题',
  },

  // Collections Panel
  collections: {
    newFolder: '新建文件夹',
    importCollection: '导入集合',
    exportCollection: '导出集合',
    searchCollections: '搜索集合...',
    noMatchingRequests: '没有匹配的请求',
    noSavedRequests: '没有已保存的请求',
    importFailed: '导入失败：{{error}}',
    exportFailed: '导出失败：{{error}}',
    importedWithWarnings: '已导入，包含 {{count}} 个警告',
    collectionImported: '集合已导入',
    collectionExported: '集合已导出',
  },

  // Environment
  environment: {
    newEnvironment: '新建环境',
    editEnvironment: '编辑环境',
    noEnvironmentsCreated: '尚未创建任何环境',
    environmentName: '环境名称',
    environmentNamePlaceholder: '例如：生产、预发布、本地',
    color: '颜色',
    variables: '变量',
    variableName: '变量名',
    addVariable: '添加变量',
    value: '值',
    refreshValue: '刷新值',
    refreshAll: '全部刷新',
    noEnvironment: '无环境',
    selectEnvironment: '选择环境',
    randomEmail: '随机邮箱',
    randomInteger: '随机整数',
    randomString: '随机字符串',
    deleteEnvironmentConfirm: '确定要删除此环境吗？',
    deleteEnvironment: '删除环境',
    untitled: '未命名',
  },

  // History
  history: {
    title: '历史',
    clearAll: '全部清除',
    searchHistory: '搜索历史...',
    noMatchingHistory: '没有匹配的历史记录',
    noHistoryYet: '暂无历史记录',
    today: '今天',
    yesterday: '昨天',
  },

  // Request
  request: {
    enterUrl: '输入 URL 或粘贴文本',
    headers: '请求头',
    headersPlaceholder: 'Header-Key: value',
    body: '请求体',
    bodyPlaceholderHttp: '输入请求体 (JSON 或表单数据)',
    bodyPlaceholderWss: '消息内容',
    protobufSchema: 'Protobuf 模式与消息类型',
    protobufDescription: '实验性可选部分。如使用，两个字段都必须填写',
    messageTypePlaceholder: '消息类型 (例如 mypackage.MyMessage)',
    protoSchemaLoaded: '🟢 Proto 模式已加载',
    protoSchemaParseFailed: '🔴 Proto 解析失败：',
    wssUrlRequired: '🔴 请使用 ws:// 或 wss:// URL',
    modePlaceholder: '模式',
    methodPlaceholder: '方法',
  },

  // Response
  response: {
    title: '响应',
    sending: '发送中...',
    networkError: '网络错误',
  },

  // cURL
  curl: {
    importCurl: '导入 cURL',
    importCurlPlaceholder: '输入 cURL 或粘贴文本',
    invalidCurl: '你提供的 cURL 命令似乎无效。请检查后重试',
    copyCurl: '复制 cURL',
  },

  // Tests
  tests: {
    generateAndRun: '生成并运行测试',
    runningTests: '正在运行测试... ({{current}}/{{total}})',
    selectForCompare: '选择以进行比较',
    compareWithSelected: '与所选项比较',
    exportFormat: '格式',
    exported: '已导出 ✅',
    generateCertificate: '生成证书',
    certificated: '已生成证书 ✅',
    notEligible: '不符合条件（至少需要 70 个测试）',
    securityTests: '安全测试',
    performanceInsights: '性能洞察',
    dataDrivenTests: '数据驱动测试',
    crud: 'CRUD',
    runningSecurityTests: '正在运行安全测试...',
    runningPerformanceInsights: '正在运行性能洞察...',
    runningDataDrivenTests: '正在运行数据驱动测试...',
    preparingCrud: '正在准备 CRUD…',
    crudDescription: 'CRUD 根据安全测试中 OPTIONS 方法处理测试的响应生成。',
    crudNote: '注意：',
    crudNoteText: '如果禁用了 OPTIONS 方法处理测试，将不会生成 CRUD。',
    copyBugReport: '复制缺陷报告',
    computingDifferences: '正在计算差异…',
    bodyParameters: '请求体参数',
    queryParameters: '查询参数',
    formatPlaceholder: '格式',
  },

  // Comparison Panel
  comparison: {
    title: '测试结果比较',
    noTestResults: '没有可比较的测试结果',
    potentialBugs: '潜在缺陷',
    fullBehaviorChanges: '完整行为变更',
    noPotentialBugs: '未检测到潜在缺陷 ✅',
    showFullBehaviorChanges: '显示完整行为变更',
    behaviorChange: '行为变更：',
    showNoise: '显示噪声',
  },

  // Modals
  modals: {
    reload: {
      title: '重新加载',
      description: '仅当前测试结果将丢失',
      confirmText: '重新加载',
    },
    sendHttpSuccess: {
      title: '请求看起来不错！',
      description: 'Rentgen 现在有一个有效的请求可以使用。在生成测试之前，请快速查看映射的字段以确保一切正确',
      confirmText: '查看并生成测试',
      doNotShowAgain: '不再显示',
    },
    deleteFolder: {
      title: '删除文件夹',
      description: '此文件夹包含请求。确定要删除吗？',
    },
    importConflict: {
      title: '检测到导入冲突',
      conflictDescription: '导入的集合「{{name}}」与你现有的集合存在冲突：',
      collectionNamesMatch: '集合名称相同',
      folderConflicts: '{{count}} 个名称相同的文件夹',
      requestConflicts: '{{count}} 个 URL+方法或名称相同的请求',
      importWarnings: '导入警告：{{count}}',
      replaceDescription: '替换整个现有集合（{{folders}} 个文件夹，{{requests}} 个请求）',
      mergeDescription: '仅添加唯一项（按 URL+方法或名称跳过重复项）',
      newFolders: '{{count}} 个新文件夹',
      newRequests: '{{count}} 个新请求',
      noNewItems: '没有可添加的新项目',
      importAsCopy: '作为副本导入',
      copyDescription: '添加所有带「(copy)」后缀的文件夹（{{folders}} 个文件夹，{{requests}} 个请求）',
    },
    setDynamicVariable: {
      title: '设为动态变量',
      editTitle: '编辑动态变量',
      variableName: '变量名',
      variableNamePlaceholder: 'variable_name',
      preview: '预览：',
      environment: '环境',
      allEnvironments: '所有环境',
      untitledEnvironment: '未命名环境',
      selectEnvironment: '选择环境...',
      linkedRequest: '关联的请求',
      variableNameRequired: '变量名为必填项',
      selectorRequired: '选择器为必填项',
      selectEnvironmentError: '请选择一个环境',
      duplicateWarning: '已存在同名变量。它将被覆盖。',
      saveVariable: '保存变量',
      updateVariable: '更新变量',
    },
    projectImport: {
      title: '导入项目',
      file: '文件',
      exported: '导出时间',
      appVersion: '应用版本',
      integrity: '完整性',
      integrityWarning: '文件完整性校验失败。此文件可能已在 Rentgen 外部被修改。请谨慎操作。',
      overwriteWarning: '此操作将覆盖你当前的所有数据：',
      collectionsCount: '集合（{{folders}} 个文件夹，{{requests}} 个请求）',
      environmentsCount: '环境（{{count}} 个环境）',
      dynamicVariablesCount: '动态变量（{{count}} 个变量）',
      historyCount: '历史（{{count}} 条记录）',
      settingsInfo: '设置（主题、测试引擎、历史配置）',
      cannotBeUndone: '此操作无法撤销。',
      backupBefore: '导入前请先备份你当前的项目：',
      exportedCheck: '已导出 ✓',
      exportCurrentProject: '导出当前项目',
      importProject: '导入项目',
    },
  },

  // Settings
  settings: {
    testEngine: '测试引擎',
    general: '通用',
    themes: '主题',
    language: '语言',
    themesDescription: '使用契合你风格的主题来个性化你的体验。',
    themeLight: '浅色',
    themeDark: '深色',
    cli: {
      name: 'CLI',
      intro:
        'Rentgen CLI 直接从终端运行 <c>.rentgen</c> 项目导出文件中的一个请求文件夹 —— 专为 CI 流水线和脚本化冒烟测试而生。它读取的正是 <e>通用 → 导出项目</e> 生成的文件，且永远不会回写。',
      fullDocumentation: '完整文档：',
      installInPath: '安装到 shell PATH（{{platform}}）',
      checkingStatus: '正在检查安装状态…',
      runCli: '运行 CLI',
      runCliDescription: 'Rentgen 仅提供一个子命令 <c>xray</c>（别名：<c>run</c>）。将其指向你从应用中导出的项目文件。',
      exportProject: '导出项目',
      noProjectFileYet: '还没有项目文件？现在就导出一个 —— 与 <e>通用 → 导出项目</e> 操作相同。',
      developmentNote: '在开发期间，可在仓库中直接使用 <c>npm run dev:cli -- xray …</c> 调用。',
      options: '选项',
      examples: '示例',
      exampleInteractive: '交互式选择一个文件夹和环境：',
      exampleCi: '使用明确的文件夹和环境进行脚本化 CI 运行，快速失败：',
      exampleCiJson: '面向 CI 流水线（GitHub Actions、Jenkins、Slack 通知器）的机器可读输出：',
      exampleOverrideVars: '在调用处覆盖变量（最高优先级）：',
      integrityCheck: '完整性校验',
      integrityCheckDescription:
        '每个项目导出文件都带有其数据的 SHA-256 校验和。加载时，CLI 会重新计算校验和。如果匹配，运行将静默继续。如果缺失或被篡改，你将在 TTY 中看到确认提示，或在 CI 中看到错误。<c>--skip-integrity-check</c> 会跳过该校验 —— 当你明确知道该文件是有意手动编辑时使用。',
      exitCodesTitle: '退出码',
      idempotency: '幂等性',
      idempotencyDescription:
        'CLI 永远不会写入项目文件。从响应中提取的动态变量仅在单次运行期间保存在内存中，因此针对未修改项目的两次连续调用会产生字节完全相同的已解析 URL、请求头和请求体。',
      platform: {
        macos: 'macOS',
        windows: 'Windows',
        linux: 'Linux',
      },
      status: {
        binaryUnavailable: 'CLI 二进制文件不可用',
        binaryUnavailableReinstall: '请重新安装最新的 Rentgen 构建版本以启用 CLI。',
        installed: '已安装',
        managedByPackageManager: '（由包管理器管理）',
        conflictingPath: 'PATH 上存在冲突的 `rentgen`',
        conflictingPathDescription:
          '<c>{{path}}</c> 在 PATH 上，但并未指向此 Rentgen 安装。请将其移除，否则在此处安装将会将其遮蔽。',
        notInstalled: '未安装',
        notInstalledDescription: '点击下方的 <e>安装</e> 将 <c>rentgen</c> 添加到你的 shell PATH。',
      },
      action: {
        working: '处理中…',
        uninstall: '卸载 CLI',
        reinstall: '重新安装',
        installRentgenInPath: '将 rentgen 命令安装到 PATH',
        packageManagerNote:
          'Linux 包管理器负责安装与卸载。请使用 <c>sudo apt remove rentgen</c> / <c>sudo dnf remove rentgen</c> 来卸载。',
      },
      platformTip: {
        macos:
          'macOS 将提示你输入密码以将符号链接写入 <c>/usr/local/bin/rentgen</c>。安装后，请打开一个新的终端标签页以应用更改。',
        windows:
          'Windows 安装会将 Rentgen 资源目录添加到你的 <e>用户</e> PATH（无需管理员权限）。安装后请打开一个新的 PowerShell、命令提示符或 Windows 终端标签页 —— 现有的 shell 将看不到更改。',
        linux:
          '在 Linux 上，deb/rpm 安装后脚本会自动链接 <c>/usr/bin/rentgen</c>。如果你是通过便携归档安装的，此按钮会在 <c>/usr/local/bin/rentgen</c> 创建用户级符号链接（或回退到 <c>~/.local/bin/rentgen</c>）。',
      },
      flag: {
        collection: '要从项目文件中运行的文件夹。省略以交互式选择。',
        env: '要使用的环境。传入 --env=none 以在不使用任何环境的情况下运行。',
        skipIntegrityCheck: '跳过校验和确认提示。',
        var: '覆盖一个变量。可重复使用。优先级高于 env 和动态值。',
        timeout: '单个请求的超时时间（毫秒）。默认 30000。',
        failFast: '在首次失败后停止。',
        report: '机器可读输出。支持：json（将 JSON 写入 stdout，并禁止人类可读输出）。',
        noColor: '禁用彩色输出。',
        verbose: '打印完整的请求/响应详情，并对未解析的变量发出警告。',
      },
      exit: {
        code0: '所有请求均已通过。',
        code1: '运行完成时存在失败、在校验和提示处被中止，或被 Ctrl+C 中断。',
        code2:
          '输入无效：文件缺失、JSON 错误、格式不正确、--collection / --env 不明确或未知，或 CI 模式下缺少必需的标志。',
      },
    },
    history: {
      title: '历史',
      description: '配置请求历史的收集和保留方式。',
      enableHistory: '启用历史',
      maximumSize: '最大条数',
      retentionPeriod: '保留期限',
      week1: '1 周',
      month1: '1 个月',
      months3: '3 个月',
      months6: '6 个月',
      year1: '1 年',
      noRetention: '不保留',
    },
    project: {
      title: '项目',
      description: '导出或导入你的整个项目，包括集合、环境、变量、历史和设置。',
      exportProject: '导出项目',
      importProject: '导入项目',
    },
    configuration: {
      title: '配置',
      description: '为生成随机测试数据值配置规则和限制。',
      email: '邮箱',
      domain: '域名',
      randomEmailLength: '随机邮箱长度',
      enum: '枚举',
      enumDescription: '输入所有有效值，以「,」分隔',
      number: '数字',
      minimumValue: '最小值',
      maximumValue: '最大值',
      string: '字符串',
      maximumValueLength: '最大值长度',
      randomInteger: '随机整数',
      randomString: '随机字符串',
      length: '长度',
    },
    securityTests: {
      title: '安全测试',
      enabledCount: '已启用 {{enabled}}/{{total}}',
      description: '逐项开启或关闭安全测试，以定制你的测试体验。',
    },
    languageSection: {
      title: '语言',
      description: '为应用界面选择你偏好的语言。',
      feedback: '发现翻译问题或想添加另一种语言？请创建一个工单，附上所有详情，我们将尽力处理。',
      feedbackLink: '提交 GitHub issue',
    },
  },

  // Controls
  controls: {
    sizeMB: '大小 (MB)',
    sizeMax: '大小（最大 {{max}} MB）',
    threads: '线程数',
    threadsMax: '线程数（最大 100）',
    requests: '请求数',
    requestsMax: '请求总数（最大 10 000）',
    mandatoryToggle: '启用 = 必填 → Rentgen 将根据此设置生成测试',
    enumLabel: '输入所有有效值，以「,」分隔',
    numberLabel: '设置边界测试的最小/最大范围。0 - 整数，0.00 - 小数',
    stringLabel: '值的最大长度',
    minPlaceholder: '最小',
    maxPlaceholder: '最大',
  },

  // Parameter types
  parameterTypes: {
    doNotTest: '不测试',
    randomEmail: '随机邮箱',
    randomInteger: '随机整数',
    randomString: '随机字符串',
    boolean: '布尔值',
    currency: '货币',
    dateYYYYMMDD: '日期 (YYYY-MM-DD)',
    email: '邮箱',
    enum: '枚举',
    number: '数字',
    phone: '电话',
    string: '字符串',
    url: 'URL',
  },

  // Tables
  tables: {
    parameter: '参数',
    value: '值',
    check: '检查',
    method: '方法',
    expected: '预期',
    actual: '实际',
    result: '结果',
    name: '名称',
    description: '描述',
    request: '请求',
  },

  // Context Menu
  contextMenu: {
    setAsVariable: '设为变量',
    saveRequestFirst: '请先将请求保存到集合中',
    setAsDynamicVariableTitle: '将「{{path}}」设为动态变量',
  },

  // Badges
  badges: {
    verified: '已验证',
    modified: '已修改',
    noChecksum: '无校验和',
  },

  // File input
  fileInput: {
    chooseFile: '选择文件',
    noFileChosen: '未选择文件',
  },

  // Protobuf
  protobuf: {
    decodedProtobuf: '已解码的 Protobuf：',
  },

  // Messages panel
  messages: {
    title: '消息',
  },

  // Export format labels
  exportFormats: {
    json: 'JSON (.json)',
    markdown: 'Markdown (.md)',
    csv: 'CSV (.csv)',
  },
};

export default zhCN;
