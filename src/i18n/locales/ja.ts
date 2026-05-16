const ja = {
  // Common
  common: {
    send: '送信',
    save: '保存',
    saved: '保存しました ✅',
    cancel: 'キャンセル',
    close: '閉じる',
    ok: 'OK',
    create: '作成',
    delete: '削除',
    import: 'インポート',
    export: 'エクスポート',
    copy: 'コピー',
    copied: 'コピーしました ✅',
    run: '実行',
    replace: '置き換え',
    merge: 'マージ',
    overwrite: '上書き',
    enabled: '有効',
    disabled: '無効',
    warning: '警告:',
    connect: '接続',
    disconnect: '切断',
    beautify: '整形',
    reload: '再読み込み',
    cut: '切り取り',
    paste: '貼り付け',
  },

  // Sidebar
  sidebar: {
    collections: 'コレクション',
    environments: '環境',
    history: '履歴',
    settings: '設定',
    checkForUpdates: 'アップデートを確認',
    reportFeedback: 'フィードバックを送信',
  },

  // Collections Panel
  collections: {
    newFolder: '新規フォルダ',
    importCollection: 'コレクションをインポート',
    exportCollection: 'コレクションをエクスポート',
    searchCollections: 'コレクションを検索...',
    noMatchingRequests: '一致するリクエストはありません',
    noSavedRequests: '保存されたリクエストはありません',
    importFailed: 'インポートに失敗しました: {{error}}',
    exportFailed: 'エクスポートに失敗しました: {{error}}',
    importedWithWarnings: '{{count}} 件の警告とともにインポートしました',
    collectionImported: 'コレクションをインポートしました',
    collectionExported: 'コレクションをエクスポートしました',
  },

  // Environment
  environment: {
    newEnvironment: '新規環境',
    editEnvironment: '環境を編集',
    noEnvironmentsCreated: '環境が作成されていません',
    environmentName: '環境名',
    environmentNamePlaceholder: '例: Production、Staging、Local',
    color: '色',
    variables: 'バリアブル',
    variableName: 'バリアブル名',
    addVariable: 'バリアブルを追加',
    value: '値',
    refreshValue: '値を更新',
    refreshAll: 'すべて更新',
    noEnvironment: '環境なし',
    selectEnvironment: '環境を選択',
    randomEmail: 'ランダムメールアドレス',
    randomInteger: 'ランダム整数',
    randomString: 'ランダム文字列',
    deleteEnvironmentConfirm: 'この環境を削除してもよろしいですか?',
    deleteEnvironment: '環境を削除',
    untitled: '無題',
  },

  // History
  history: {
    title: '履歴',
    clearAll: 'すべてクリア',
    searchHistory: '履歴を検索...',
    noMatchingHistory: '一致する履歴はありません',
    noHistoryYet: 'まだ履歴がありません',
    today: '今日',
    yesterday: '昨日',
  },

  // Request
  request: {
    enterUrl: 'URL を入力するかテキストを貼り付け',
    headers: 'ヘッダー',
    headersPlaceholder: 'Header-Key: value',
    body: 'ボディ',
    bodyPlaceholderHttp: 'リクエストボディを入力 (JSON または Form Data)',
    bodyPlaceholderWss: 'メッセージボディ',
    protobufSchema: 'Protobuf スキーマとメッセージタイプ',
    protobufDescription: '実験的なオプションのセクションです。使用する場合は両方のフィールドを入力する必要があります',
    messageTypePlaceholder: 'メッセージタイプ (例: mypackage.MyMessage)',
    protoSchemaLoaded: '🟢 Proto スキーマを読み込みました',
    protoSchemaParseFailed: '🔴 Proto の解析に失敗しました: ',
    wssUrlRequired: '🔴 ws:// または wss:// の URL を使用してください',
    modePlaceholder: 'モード',
    methodPlaceholder: 'メソッド',
  },

  // Response
  response: {
    title: 'レスポンス',
    sending: '送信中...',
    networkError: 'ネットワークエラー',
  },

  // cURL
  curl: {
    importCurl: 'cURL をインポート',
    importCurlPlaceholder: 'cURL を入力するかテキストを貼り付け',
    invalidCurl: '入力された cURL コマンドが無効なようです。確認してもう一度お試しください',
    copyCurl: 'cURL をコピー',
  },

  // Tests
  tests: {
    generateAndRun: 'テストを生成して実行',
    runningTests: 'テストを実行中... ({{current}}/{{total}})',
    selectForCompare: '比較対象として選択',
    compareWithSelected: '選択したものと比較',
    exportFormat: 'フォーマット',
    exported: 'エクスポートしました ✅',
    generateCertificate: '証明書を生成',
    certificated: '証明書を発行しました ✅',
    notEligible: '対象外です (少なくとも 70 件のテストが必要です)',
    securityTests: 'セキュリティテスト',
    performanceInsights: 'パフォーマンスインサイト',
    dataDrivenTests: 'データ駆動テスト',
    crud: 'CRUD',
    runningSecurityTests: 'セキュリティテストを実行中...',
    runningPerformanceInsights: 'パフォーマンスインサイトを実行中...',
    runningDataDrivenTests: 'データ駆動テストを実行中...',
    preparingCrud: 'CRUD を準備中…',
    crudDescription: 'CRUD は、セキュリティテストの OPTIONS メソッド処理テストのレスポンスに基づいて生成されます。',
    crudNote: '注意:',
    crudNoteText: 'OPTIONS メソッド処理テストが無効になっている場合、CRUD は生成されません。',
    copyBugReport: 'バグレポートをコピー',
    computingDifferences: '差分を計算中…',
    bodyParameters: 'ボディパラメータ',
    queryParameters: 'クエリパラメータ',
    formatPlaceholder: 'フォーマット',
  },

  // Comparison Panel
  comparison: {
    title: 'テスト結果の比較',
    noTestResults: '比較するテスト結果がありません',
    potentialBugs: '潜在的なバグ',
    fullBehaviorChanges: '完全な動作変更',
    noPotentialBugs: '潜在的なバグは検出されませんでした ✅',
    showFullBehaviorChanges: '完全な動作変更を表示',
    behaviorChange: '動作変更:',
    showNoise: 'ノイズを表示',
  },

  // Modals
  modals: {
    reload: {
      title: '再読み込み',
      description: '現在のテスト結果のみが失われます',
      confirmText: '再読み込み',
    },
    sendHttpSuccess: {
      title: 'リクエストは問題ありません!',
      description:
        'Rentgen は有効なリクエストを取得しました。テストを生成する前に、マッピングされたフィールドをすばやく確認してすべてが正しいことを確認してください',
      confirmText: '確認してテストを生成',
      doNotShowAgain: '次回から表示しない',
    },
    deleteFolder: {
      title: 'フォルダを削除',
      description: 'このフォルダにはリクエストが含まれています。削除してもよろしいですか?',
    },
    importConflict: {
      title: 'インポートの競合が検出されました',
      conflictDescription: 'インポートしたコレクション "{{name}}" は既存のコレクションと競合しています:',
      collectionNamesMatch: 'コレクション名が一致しています',
      folderConflicts: '名前が一致するフォルダが {{count}} 件あります',
      requestConflicts: 'URL+メソッドまたは名前が一致するリクエストが {{count}} 件あります',
      importWarnings: 'インポートの警告: {{count}}',
      replaceDescription: '既存のコレクション全体を置き換える ({{folders}} フォルダ、{{requests}} リクエスト)',
      mergeDescription: 'ユニークな項目のみを追加 (URL+メソッドまたは名前で重複をスキップ)',
      newFolders: '新規フォルダ {{count}} 件',
      newRequests: '新規リクエスト {{count}} 件',
      noNewItems: '追加する新しい項目はありません',
      importAsCopy: 'コピーとしてインポート',
      copyDescription:
        'すべてのフォルダに "(copy)" サフィックスを付けて追加 ({{folders}} フォルダ、{{requests}} リクエスト)',
    },
    setDynamicVariable: {
      title: '動的バリアブルとして設定',
      editTitle: '動的バリアブルを編集',
      variableName: 'バリアブル名',
      variableNamePlaceholder: 'variable_name',
      preview: 'プレビュー:',
      environment: '環境',
      allEnvironments: 'すべての環境',
      untitledEnvironment: '無題の環境',
      selectEnvironment: '環境を選択...',
      linkedRequest: 'リンクされたリクエスト',
      variableNameRequired: 'バリアブル名は必須です',
      selectorRequired: 'セレクタは必須です',
      selectEnvironmentError: '環境を選択してください',
      duplicateWarning: 'この名前のバリアブルはすでに存在します。上書きされます。',
      saveVariable: 'バリアブルを保存',
      updateVariable: 'バリアブルを更新',
    },
    projectImport: {
      title: 'プロジェクトをインポート',
      file: 'ファイル',
      exported: 'エクスポート済み',
      appVersion: 'アプリバージョン',
      integrity: '整合性',
      integrityWarning:
        'ファイルの整合性チェックに失敗しました。このファイルは Rentgen 以外で変更された可能性があります。注意して進めてください。',
      overwriteWarning: '現在のすべてのデータが上書きされます:',
      collectionsCount: 'コレクション ({{folders}} フォルダ、{{requests}} リクエスト)',
      environmentsCount: '環境 ({{count}} 件の環境)',
      dynamicVariablesCount: '動的バリアブル ({{count}} 件のバリアブル)',
      historyCount: '履歴 ({{count}} 件のエントリ)',
      settingsInfo: '設定 (テーマ、テストエンジン、履歴設定)',
      cannotBeUndone: 'この操作は取り消せません。',
      backupBefore: 'インポート前に現在のプロジェクトをバックアップしてください:',
      exportedCheck: 'エクスポート済み ✓',
      exportCurrentProject: '現在のプロジェクトをエクスポート',
      importProject: 'プロジェクトをインポート',
    },
  },

  // Settings
  settings: {
    testEngine: 'テストエンジン',
    general: '一般',
    themes: 'テーマ',
    language: '言語',
    themesDescription: 'スタイルに合ったテーマで体験をパーソナライズしましょう。',
    themeLight: 'ライト',
    themeDark: 'ダーク',
    cli: {
      name: 'CLI',
      intro:
        'Rentgen CLI は <c>.rentgen</c> プロジェクトエクスポートからリクエストのフォルダを実行します。ターミナルから直接実行でき、CI パイプラインやスクリプト化されたスモークテスト向けに設計されています。<e>General → Export Project</e> で生成されるのと同じファイルを読み取り、書き戻すことはありません。',
      fullDocumentation: '完全なドキュメント:',
      installInPath: 'シェルの PATH にインストール ({{platform}})',
      checkingStatus: 'インストール状態を確認中…',
      runCli: 'CLI を実行',
      runCliDescription:
        'Rentgen は <c>xray</c> という単一のサブコマンド (エイリアス: <c>run</c>) を提供しています。アプリからエクスポートしたプロジェクトファイルを指定してください。',
      exportProject: 'プロジェクトをエクスポート',
      noProjectFileYet:
        'まだプロジェクトファイルがありませんか?今すぐエクスポートしてください — <e>General → Export Project</e> と同じ操作です。',
      developmentNote: '開発中はリポジトリから <c>npm run dev:cli -- xray …</c> で直接呼び出してください。',
      options: 'オプション',
      examples: '使用例',
      exampleInteractive: 'フォルダと環境を対話的に選択:',
      exampleCi: 'フォルダと環境を明示してスクリプト化された CI 実行を行い、最初の失敗で停止:',
      exampleCiJson: 'CI パイプライン (GitHub Actions、Jenkins、Slack 通知) 向けの機械可読な出力:',
      exampleOverrideVars: '呼び出し時にバリアブルを上書き (最も優先度が高い):',
      integrityCheck: '整合性チェック',
      integrityCheckDescription:
        'すべてのプロジェクトエクスポートには、データの SHA-256 checksum が含まれます。読み込み時に CLI は checksum を再計算します。一致すれば実行は静かに進みます。欠落または改ざんされている場合、TTY では確認プロンプトが表示され、CI ではエラーになります。<c>--skip-integrity-check</c> はこのゲートをバイパスします。ファイルを意図的に手作業で編集したと分かっている場合に使用してください。',
      exitCodesTitle: '終了コード',
      idempotency: 'Idempotency',
      idempotencyDescription:
        'CLI はプロジェクトファイルに書き込みを行いません。レスポンスから抽出された動的バリアブルは 1 回の実行中のみメモリに保持されます。そのため、未変更のプロジェクトに対して連続で 2 回呼び出した場合、解決後の URL、ヘッダー、ボディはバイト単位で一致します。',
      platform: {
        macos: 'macOS',
        windows: 'Windows',
        linux: 'Linux',
      },
      status: {
        binaryUnavailable: 'CLI バイナリが利用できません',
        binaryUnavailableReinstall: '最新の Rentgen ビルドを再インストールして CLI を有効にしてください。',
        installed: 'インストール済み',
        managedByPackageManager: ' (パッケージマネージャによる管理)',
        conflictingPath: 'PATH に競合する `rentgen` があります',
        conflictingPathDescription:
          '<c>{{path}}</c> は PATH 上にありますが、この Rentgen のインストール先を指していません。削除してください。そうしないと、ここへのインストールがそれを覆い隠します。',
        notInstalled: '未インストール',
        notInstalledDescription:
          '下の <e>Install</e> をクリックして <c>rentgen</c> をシェルの PATH に追加してください。',
      },
      action: {
        working: '処理中…',
        uninstall: 'CLI をアンインストール',
        reinstall: '再インストール',
        installRentgenInPath: 'rentgen コマンドを PATH にインストール',
        packageManagerNote:
          'Linux のパッケージマネージャがインストールと削除を処理します。アンインストールするには <c>sudo apt remove rentgen</c> / <c>sudo dnf remove rentgen</c> を使用してください。',
      },
      platformTip: {
        macos:
          'macOS では <c>/usr/local/bin/rentgen</c> への symlink を書き込むためにパスワードが求められます。インストール後、新しいターミナルタブを開いて変更を反映してください。',
        windows:
          'Windows のインストールでは、Rentgen のリソースディレクトリを <e>user</e> の PATH に追加します (管理者権限は不要)。インストール後に PowerShell、コマンドプロンプト、または Windows Terminal の新しいタブを開いてください。既存のシェルでは変更が反映されません。',
        linux:
          'Linux では deb/rpm のポストインストールスクリプトが <c>/usr/bin/rentgen</c> を自動的にリンクします。代わりにポータブルアーカイブからインストールした場合、このボタンは <c>/usr/local/bin/rentgen</c> (またはフォールバックとして <c>~/.local/bin/rentgen</c>) にユーザー symlink を作成します。',
      },
      flag: {
        collection: 'プロジェクトファイルから実行するフォルダ。省略すると対話的に選択できます。',
        env: '使用する環境。環境なしで実行するには --env=none を渡してください。',
        skipIntegrityCheck: 'checksum の確認プロンプトをスキップします。',
        var: 'バリアブルを上書きします。繰り返し指定可能。環境および動的な値より優先度が高くなります。',
        timeout: 'リクエストごとのタイムアウト (ミリ秒)。デフォルトは 30000。',
        failFast: '最初の失敗で停止します。',
        report: '機械可読な出力。サポート対象: json (JSON を stdout に書き出し、人間向け出力を抑制)。',
        noColor: 'カラー出力を無効にします。',
        verbose: 'リクエスト/レスポンスの詳細をすべて表示し、未解決のバリアブルについて警告します。',
      },
      exit: {
        code0: 'すべてのリクエストが成功しました。',
        code1: '実行は失敗とともに完了したか、checksum プロンプトで中止されたか、Ctrl+C で中断されました。',
        code2:
          '無効な入力: ファイルがない、JSON が不正、形式が誤っている、--collection / --env が曖昧または不明、もしくは必要なフラグなしの CI モードです。',
      },
    },
    history: {
      title: '履歴',
      description: 'リクエスト履歴の収集方法と保持方法を設定します。',
      enableHistory: '履歴を有効にする',
      maximumSize: '最大サイズ',
      retentionPeriod: '保持期間',
      week1: '1 週間',
      month1: '1 ヶ月',
      months3: '3 ヶ月',
      months6: '6 ヶ月',
      year1: '1 年',
      noRetention: '保持しない',
    },
    project: {
      title: 'プロジェクト',
      description:
        'コレクション、環境、バリアブル、履歴、設定を含むプロジェクト全体をエクスポートまたはインポートします。',
      exportProject: 'プロジェクトをエクスポート',
      importProject: 'プロジェクトをインポート',
    },
    configuration: {
      title: '構成',
      description: 'ランダムなテストデータ値を生成するためのルールと制限を設定します。',
      email: 'メールアドレス',
      domain: 'ドメイン',
      randomEmailLength: 'ランダムメールアドレスの長さ',
      enum: 'Enum',
      enumDescription: '有効な値をすべて "," で区切って入力してください',
      number: '数値',
      minimumValue: '最小値',
      maximumValue: '最大値',
      string: '文字列',
      maximumValueLength: '値の最大長',
      randomInteger: 'ランダム整数',
      randomString: 'ランダム文字列',
      length: '長さ',
    },
    securityTests: {
      title: 'セキュリティテスト',
      enabledCount: '{{enabled}}/{{total}} 有効',
      description: '個々のセキュリティテストを有効または無効にして、テスト体験をカスタマイズできます。',
    },
    languageSection: {
      title: '言語',
      description: 'アプリケーションインターフェースで使用する言語を選択してください。',
      feedback:
        '翻訳の問題を見つけた、または別の言語を追加したいですか?詳細を記載してチケットを作成していただければ、できる限り対応します。',
      feedbackLink: 'GitHub Issue を開く',
    },
  },

  // Controls
  controls: {
    sizeMB: 'サイズ (MB)',
    sizeMax: 'サイズ (最大 {{max}} MB)',
    threads: 'スレッド',
    threadsMax: 'スレッド (最大 100)',
    requests: 'リクエスト',
    requestsMax: 'リクエスト総数 (最大 10 000)',
    mandatoryToggle: '有効 = 必須 → Rentgen はこの設定に基づいてテストを生成します',
    enumLabel: '有効な値をすべて "," で区切って入力してください',
    numberLabel: '境界値テスト用の Min/Max 範囲を設定します。0 - 整数、0.00 - 小数',
    stringLabel: '値の最大長',
    minPlaceholder: 'Min',
    maxPlaceholder: 'Max',
  },

  // Parameter types
  parameterTypes: {
    doNotTest: 'テストしない',
    randomEmail: 'ランダムメールアドレス',
    randomInteger: 'ランダム整数',
    randomString: 'ランダム文字列',
    boolean: 'ブール値',
    currency: '通貨',
    dateYYYYMMDD: '日付 (YYYY-MM-DD)',
    email: 'メールアドレス',
    enum: 'Enum',
    number: '数値',
    phone: '電話番号',
    string: '文字列',
    url: 'URL',
  },

  // Tables
  tables: {
    parameter: 'パラメータ',
    value: '値',
    check: 'チェック',
    method: 'メソッド',
    expected: '期待値',
    actual: '実際の値',
    result: '結果',
    name: '名前',
    description: '説明',
    request: 'リクエスト',
  },

  // Context Menu
  contextMenu: {
    setAsVariable: 'バリアブルとして設定',
    saveRequestFirst: '先にリクエストをコレクションに保存してください',
    setAsDynamicVariableTitle: '"{{path}}" を動的バリアブルとして設定',
  },

  // Badges
  badges: {
    verified: '検証済み',
    modified: '変更済み',
    noChecksum: 'checksum なし',
  },

  // File input
  fileInput: {
    chooseFile: 'ファイルを選択',
    noFileChosen: 'ファイルが選択されていません',
  },

  // Protobuf
  protobuf: {
    decodedProtobuf: 'デコードされた Protobuf:',
  },

  // Messages panel
  messages: {
    title: 'メッセージ',
  },

  // Export format labels
  exportFormats: {
    json: 'JSON (.json)',
    markdown: 'Markdown (.md)',
    csv: 'CSV (.csv)',
  },
};

export default ja;
