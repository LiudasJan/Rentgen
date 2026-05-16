const ko = {
  // Common
  common: {
    send: '보내기',
    save: '저장',
    saved: '저장됨 ✅',
    cancel: '취소',
    close: '닫기',
    ok: '확인',
    create: '생성',
    delete: '삭제',
    import: '가져오기',
    export: '내보내기',
    copy: '복사',
    copied: '복사됨 ✅',
    run: '실행',
    replace: '바꾸기',
    merge: '병합',
    overwrite: '덮어쓰기',
    enabled: '사용',
    disabled: '사용 안 함',
    warning: '경고:',
    connect: '연결',
    disconnect: '연결 해제',
    beautify: '정리',
    reload: '새로 고침',
    cut: '잘라내기',
    paste: '붙여넣기',
  },

  // Sidebar
  sidebar: {
    collections: '컬렉션',
    environments: '환경',
    history: '기록',
    settings: '설정',
    checkForUpdates: '업데이트 확인',
    reportFeedback: '피드백 보내기',
  },

  // Collections Panel
  collections: {
    newFolder: '새 폴더',
    importCollection: '컬렉션 가져오기',
    exportCollection: '컬렉션 내보내기',
    searchCollections: '컬렉션 검색...',
    noMatchingRequests: '일치하는 요청이 없습니다',
    noSavedRequests: '저장된 요청이 없습니다',
    importFailed: '가져오기 실패: {{error}}',
    exportFailed: '내보내기 실패: {{error}}',
    importedWithWarnings: '경고 {{count}}건과 함께 가져왔습니다',
    collectionImported: '컬렉션을 가져왔습니다',
    collectionExported: '컬렉션을 내보냈습니다',
  },

  // Environment
  environment: {
    newEnvironment: '새 환경',
    editEnvironment: '환경 편집',
    noEnvironmentsCreated: '생성된 환경이 없습니다',
    environmentName: '환경 이름',
    environmentNamePlaceholder: '예: Production, Staging, Local',
    color: '색상',
    variables: '변수',
    variableName: '변수 이름',
    addVariable: '변수 추가',
    value: '값',
    refreshValue: '값 새로 고침',
    refreshAll: '모두 새로 고침',
    noEnvironment: '환경 없음',
    selectEnvironment: '환경 선택',
    randomEmail: '랜덤 이메일',
    randomInteger: '랜덤 정수',
    randomString: '랜덤 문자열',
    deleteEnvironmentConfirm: '이 환경을 정말 삭제하시겠어요?',
    deleteEnvironment: '환경 삭제',
    untitled: '제목 없음',
  },

  // History
  history: {
    title: '기록',
    clearAll: '모두 지우기',
    searchHistory: '기록 검색...',
    noMatchingHistory: '일치하는 기록이 없습니다',
    noHistoryYet: '아직 기록이 없습니다',
    today: '오늘',
    yesterday: '어제',
  },

  // Request
  request: {
    enterUrl: 'URL을 입력하거나 텍스트를 붙여넣으세요',
    headers: '헤더',
    headersPlaceholder: 'Header-Key: value',
    body: '바디',
    bodyPlaceholderHttp: '요청 바디를 입력하세요 (JSON 또는 Form Data)',
    bodyPlaceholderWss: '메시지 바디',
    protobufSchema: 'Protobuf 스키마 및 메시지 타입',
    protobufDescription: '실험적이며 선택적인 항목입니다. 사용한다면 두 필드를 모두 채워야 합니다',
    messageTypePlaceholder: '메시지 타입 (예: mypackage.MyMessage)',
    protoSchemaLoaded: '🟢 Proto 스키마를 불러왔습니다',
    protoSchemaParseFailed: '🔴 Proto 파싱에 실패했습니다: ',
    wssUrlRequired: '🔴 ws:// 또는 wss:// URL을 사용해 주세요',
    modePlaceholder: '모드',
    methodPlaceholder: '메서드',
  },

  // Response
  response: {
    title: '응답',
    sending: '보내는 중...',
    networkError: '네트워크 오류',
  },

  // cURL
  curl: {
    importCurl: 'cURL 가져오기',
    importCurlPlaceholder: 'cURL을 입력하거나 텍스트를 붙여넣으세요',
    invalidCurl: '입력한 cURL 명령이 유효하지 않은 것 같습니다. 확인 후 다시 시도해 주세요',
    copyCurl: 'cURL 복사',
  },

  // Tests
  tests: {
    generateAndRun: '테스트 생성 및 실행',
    runningTests: '테스트 실행 중... ({{current}}/{{total}})',
    selectForCompare: '비교 대상으로 선택',
    compareWithSelected: '선택 항목과 비교',
    exportFormat: '포맷',
    exported: '내보냈습니다 ✅',
    generateCertificate: '인증서 생성',
    certificated: '인증되었습니다 ✅',
    notEligible: '대상 아님 (테스트 70개 이상 필요)',
    securityTests: '보안 테스트',
    performanceInsights: '성능 인사이트',
    dataDrivenTests: '데이터 기반 테스트',
    crud: 'CRUD',
    runningSecurityTests: '보안 테스트 실행 중...',
    runningPerformanceInsights: '성능 인사이트 실행 중...',
    runningDataDrivenTests: '데이터 기반 테스트 실행 중...',
    preparingCrud: 'CRUD 준비 중…',
    crudDescription: 'CRUD는 보안 테스트의 OPTIONS 메서드 처리 테스트 응답을 기반으로 생성됩니다.',
    crudNote: '참고:',
    crudNoteText: 'OPTIONS 메서드 처리 테스트가 비활성화되어 있으면 CRUD는 생성되지 않습니다.',
    copyBugReport: '버그 리포트 복사',
    computingDifferences: '차이점 계산 중…',
    bodyParameters: '바디 파라미터',
    queryParameters: '쿼리 파라미터',
    formatPlaceholder: '포맷',
  },

  // Comparison Panel
  comparison: {
    title: '테스트 결과 비교',
    noTestResults: '비교할 테스트 결과가 없습니다',
    potentialBugs: '잠재적 버그',
    fullBehaviorChanges: '전체 동작 변경',
    noPotentialBugs: '잠재적 버그가 발견되지 않았습니다 ✅',
    showFullBehaviorChanges: '전체 동작 변경 표시',
    behaviorChange: '동작 변경:',
    showNoise: '노이즈 표시',
  },

  // Modals
  modals: {
    reload: {
      title: '새로 고침',
      description: '현재 테스트 결과만 사라집니다',
      confirmText: '새로 고침',
    },
    sendHttpSuccess: {
      title: '요청이 정상입니다!',
      description:
        'Rentgen이 사용할 유효한 요청을 받았습니다. 테스트를 생성하기 전에 매핑된 필드들이 올바른지 빠르게 확인해 주세요',
      confirmText: '검토 후 테스트 생성',
      doNotShowAgain: '다시 표시하지 않기',
    },
    deleteFolder: {
      title: '폴더 삭제',
      description: '이 폴더에는 요청이 포함되어 있습니다. 정말 삭제하시겠어요?',
    },
    importConflict: {
      title: '가져오기 충돌이 감지되었습니다',
      conflictDescription: '가져온 컬렉션 "{{name}}" 항목이 기존 컬렉션과 충돌합니다:',
      collectionNamesMatch: '컬렉션 이름이 일치합니다',
      folderConflicts: '이름이 일치하는 폴더 {{count}}개',
      requestConflicts: 'URL+메서드 또는 이름이 일치하는 요청 {{count}}개',
      importWarnings: '가져오기 경고: {{count}}',
      replaceDescription: '기존 컬렉션 전체 바꾸기 (폴더 {{folders}}개, 요청 {{requests}}개)',
      mergeDescription: '고유 항목만 추가 (URL+메서드 또는 이름 기준 중복은 건너뜀)',
      newFolders: '새 폴더 {{count}}개',
      newRequests: '새 요청 {{count}}개',
      noNewItems: '추가할 새 항목이 없습니다',
      importAsCopy: '복사본으로 가져오기',
      copyDescription: '모든 폴더에 "(copy)" 접미사 붙여 추가 (폴더 {{folders}}개, 요청 {{requests}}개)',
    },
    setDynamicVariable: {
      title: '동적 변수로 설정',
      editTitle: '동적 변수 편집',
      variableName: '변수 이름',
      variableNamePlaceholder: 'variable_name',
      preview: '미리보기:',
      environment: '환경',
      allEnvironments: '모든 환경',
      untitledEnvironment: '제목 없는 환경',
      selectEnvironment: '환경을 선택하세요...',
      linkedRequest: '연결된 요청',
      variableNameRequired: '변수 이름이 필요합니다',
      selectorRequired: '셀렉터가 필요합니다',
      selectEnvironmentError: '환경을 선택해 주세요',
      duplicateWarning: '같은 이름의 변수가 이미 있습니다. 덮어쓰여집니다.',
      saveVariable: '변수 저장',
      updateVariable: '변수 업데이트',
    },
    projectImport: {
      title: '프로젝트 가져오기',
      file: '파일',
      exported: '내보낸 시각',
      appVersion: '앱 버전',
      integrity: '무결성',
      integrityWarning:
        '파일 무결성 검사에 실패했습니다. 이 파일은 Rentgen 외부에서 수정되었을 수 있습니다. 주의해서 진행하세요.',
      overwriteWarning: '현재 데이터 전체가 덮어쓰여집니다:',
      collectionsCount: '컬렉션 (폴더 {{folders}}개, 요청 {{requests}}개)',
      environmentsCount: '환경 (환경 {{count}}개)',
      dynamicVariablesCount: '동적 변수 (변수 {{count}}개)',
      historyCount: '기록 (항목 {{count}}개)',
      settingsInfo: '설정 (테마, 테스트 엔진, 기록 구성)',
      cannotBeUndone: '이 작업은 되돌릴 수 없습니다.',
      backupBefore: '가져오기 전에 현재 프로젝트를 백업하세요:',
      exportedCheck: '내보냈음 ✓',
      exportCurrentProject: '현재 프로젝트 내보내기',
      importProject: '프로젝트 가져오기',
    },
  },

  // Settings
  settings: {
    testEngine: '테스트 엔진',
    general: '일반',
    themes: '테마',
    language: '언어',
    themesDescription: '자신의 스타일에 맞는 테마로 사용 경험을 꾸며 보세요.',
    themeLight: '라이트',
    themeDark: '다크',
    cli: {
      name: 'CLI',
      intro:
        'Rentgen CLI는 <c>.rentgen</c> 프로젝트 내보내기 파일에서 요청 폴더를 곧바로 터미널에서 실행합니다 — CI 파이프라인과 스크립트 기반 스모크 테스트를 위해 만들어졌습니다. <e>일반 → 프로젝트 내보내기</e>로 생성되는 동일한 파일을 읽으며, 이 파일에 다시 쓰지 않습니다.',
      fullDocumentation: '전체 문서:',
      installInPath: '셸 PATH에 설치 ({{platform}})',
      checkingStatus: '설치 상태 확인 중…',
      runCli: 'CLI 실행',
      runCliDescription:
        'Rentgen은 단일 서브커맨드 <c>xray</c>(별칭: <c>run</c>)를 제공합니다. 앱에서 내보낸 프로젝트 파일을 지정해 주세요.',
      exportProject: '프로젝트 내보내기',
      noProjectFileYet:
        '아직 프로젝트 파일이 없나요? 지금 내보내세요 — <e>일반 → 프로젝트 내보내기</e>와 같은 동작입니다.',
      developmentNote: '개발 중에는 저장소에서 <c>npm run dev:cli -- xray …</c>로 직접 호출하세요.',
      options: '옵션',
      examples: '예시',
      exampleInteractive: '폴더와 환경을 대화식으로 선택:',
      exampleCi: '폴더와 환경을 명시하고 즉시 실패 처리하는 스크립트 기반 CI 실행:',
      exampleCiJson: 'CI 파이프라인을 위한 기계 판독 가능 출력 (GitHub Actions, Jenkins, Slack 알림):',
      exampleOverrideVars: '호출 위치에서 변수 재정의 (최고 우선순위):',
      integrityCheck: '무결성 검사',
      integrityCheckDescription:
        '모든 프로젝트 내보내기에는 데이터의 SHA-256 checksum이 포함됩니다. 로드 시 CLI가 checksum을 다시 계산합니다. 일치하면 실행이 조용히 진행됩니다. 누락되거나 변조되었다면 TTY에서는 확인 프롬프트가, CI에서는 오류가 표시됩니다. <c>--skip-integrity-check</c>는 이 검사를 우회합니다 — 파일을 의도적으로 직접 수정한 경우에만 사용하세요.',
      exitCodesTitle: '종료 코드',
      idempotency: 'Idempotency',
      idempotencyDescription:
        'CLI는 프로젝트 파일에 절대 쓰지 않습니다. 응답에서 추출한 동적 변수는 한 번의 실행 동안만 메모리에 보관되므로, 수정되지 않은 프로젝트에 대해 연속으로 두 번 호출하면 해석된 URL, 헤더, 바디가 바이트 단위로 동일하게 생성됩니다.',
      platform: {
        macos: 'macOS',
        windows: 'Windows',
        linux: 'Linux',
      },
      status: {
        binaryUnavailable: 'CLI 바이너리를 사용할 수 없습니다',
        binaryUnavailableReinstall: 'CLI를 활성화하려면 최신 Rentgen 빌드를 다시 설치하세요.',
        installed: '설치됨',
        managedByPackageManager: ' (패키지 관리자에서 관리)',
        conflictingPath: 'PATH에 충돌하는 `rentgen`이 있습니다',
        conflictingPathDescription:
          'PATH에 있는 <c>{{path}}</c> 항목은 현재 Rentgen 설치를 가리키지 않습니다. 제거하지 않으면 여기에 설치하더라도 가려집니다.',
        notInstalled: '설치되지 않음',
        notInstalledDescription: '아래 <e>설치</e>를 눌러 셸 PATH에 <c>rentgen</c>을 추가하세요.',
      },
      action: {
        working: '작업 중…',
        uninstall: 'CLI 제거',
        reinstall: '다시 설치',
        installRentgenInPath: 'PATH에 rentgen 명령 설치',
        packageManagerNote:
          'Linux 패키지 관리자가 설치와 제거를 처리합니다. 제거하려면 <c>sudo apt remove rentgen</c> / <c>sudo dnf remove rentgen</c>을 사용하세요.',
      },
      platformTip: {
        macos:
          'macOS에서는 <c>/usr/local/bin/rentgen</c>에 symlink를 만들기 위해 암호 입력을 요청합니다. 설치 후에는 새 터미널 탭을 열어야 변경 사항이 반영됩니다.',
        windows:
          'Windows 설치 시 Rentgen 리소스 디렉터리가 <e>사용자</e> PATH에 추가됩니다(관리자 권한 불필요). 설치 후 PowerShell, Command Prompt 또는 Windows Terminal 새 탭을 열어야 합니다 — 기존 셸에는 변경 사항이 적용되지 않습니다.',
        linux:
          'Linux에서는 deb/rpm 사후 설치 스크립트가 <c>/usr/bin/rentgen</c> 링크를 자동으로 만듭니다. 휴대용 아카이브로 설치했다면 이 버튼이 사용자 symlink를 <c>/usr/local/bin/rentgen</c>에 만들거나 대체로 <c>~/.local/bin/rentgen</c>에 만듭니다.',
      },
      flag: {
        collection: '프로젝트 파일에서 실행할 폴더. 생략하면 대화식으로 선택합니다.',
        env: '사용할 환경. 환경 없이 실행하려면 --env=none을 전달하세요.',
        skipIntegrityCheck: 'checksum 확인 프롬프트를 건너뜁니다.',
        var: '변수 재정의. 반복 가능합니다. 환경 및 동적 값보다 우선순위가 높습니다.',
        timeout: '요청별 타임아웃(밀리초). 기본값 30000.',
        failFast: '첫 실패 후 중단합니다.',
        report: '기계 판독 가능 출력. 지원: json (stdout으로 JSON을 출력하고 사람용 출력은 숨김).',
        noColor: '컬러 출력을 비활성화합니다.',
        verbose: '요청/응답 세부 정보를 모두 출력하고 해석되지 않은 변수에 대해 경고합니다.',
      },
      exit: {
        code0: '모든 요청이 통과했습니다.',
        code1: '실패가 있는 상태로 실행 완료, checksum 프롬프트에서 중단, 또는 Ctrl+C로 중단되었습니다.',
        code2:
          '잘못된 입력: 파일 누락, 잘못된 JSON, 잘못된 형식, --collection / --env가 모호하거나 알 수 없음, 또는 필수 플래그 없이 CI 모드 실행.',
      },
    },
    history: {
      title: '기록',
      description: '요청 기록의 수집 및 보관 방식을 설정합니다.',
      enableHistory: '기록 사용',
      maximumSize: '최대 크기',
      retentionPeriod: '보관 기간',
      week1: '1주',
      month1: '1개월',
      months3: '3개월',
      months6: '6개월',
      year1: '1년',
      noRetention: '보관 안 함',
    },
    project: {
      title: '프로젝트',
      description: '컬렉션, 환경, 변수, 기록, 설정을 포함한 프로젝트 전체를 내보내거나 가져옵니다.',
      exportProject: '프로젝트 내보내기',
      importProject: '프로젝트 가져오기',
    },
    configuration: {
      title: '구성',
      description: '랜덤 테스트 데이터 값을 생성하는 규칙과 한도를 설정합니다.',
      email: '이메일',
      domain: '도메인',
      randomEmailLength: '랜덤 이메일 길이',
      enum: 'Enum',
      enumDescription: '유효한 값을 모두 ","로 구분해 입력하세요',
      number: '숫자',
      minimumValue: '최솟값',
      maximumValue: '최댓값',
      string: '문자열',
      maximumValueLength: '최대 값 길이',
      randomInteger: '랜덤 정수',
      randomString: '랜덤 문자열',
      length: '길이',
    },
    securityTests: {
      title: '보안 테스트',
      enabledCount: '{{enabled}}/{{total}} 사용 중',
      description: '개별 보안 테스트를 켜거나 꺼서 테스트 경험을 맞춤 설정하세요.',
    },
    languageSection: {
      title: '언어',
      description: '애플리케이션 인터페이스에 사용할 언어를 선택하세요.',
      feedback:
        '번역 문제를 발견하셨거나 다른 언어를 추가하고 싶으신가요? 자세한 내용을 담아 티켓을 만들어 주시면 최선을 다해 반영하겠습니다.',
      feedbackLink: 'GitHub 이슈 열기',
    },
  },

  // Controls
  controls: {
    sizeMB: '크기 (MB)',
    sizeMax: '크기 (최대 {{max}} MB)',
    threads: '스레드',
    threadsMax: '스레드 (최대 100)',
    requests: '요청',
    requestsMax: '총 요청 수 (최대 10 000)',
    mandatoryToggle: '사용 = 필수 → Rentgen이 이 설정을 기반으로 테스트를 생성합니다',
    enumLabel: '유효한 값을 모두 ","로 구분해 입력하세요',
    numberLabel: '경계 테스트를 위한 Min/Max 범위를 설정하세요. 0 - 정수, 0.00 - 소수',
    stringLabel: '값의 최대 길이',
    minPlaceholder: 'Min',
    maxPlaceholder: 'Max',
  },

  // Parameter types
  parameterTypes: {
    doNotTest: '테스트 안 함',
    randomEmail: '랜덤 이메일',
    randomInteger: '랜덤 정수',
    randomString: '랜덤 문자열',
    boolean: 'Boolean',
    currency: '통화',
    dateYYYYMMDD: '날짜 (YYYY-MM-DD)',
    email: '이메일',
    enum: 'Enum',
    number: '숫자',
    phone: '전화번호',
    string: '문자열',
    url: 'URL',
  },

  // Tables
  tables: {
    parameter: '파라미터',
    value: '값',
    check: '검사',
    method: '메서드',
    expected: '예상값',
    actual: '실제값',
    result: '결과',
    name: '이름',
    description: '설명',
    request: '요청',
  },

  // Context Menu
  contextMenu: {
    setAsVariable: '변수로 설정',
    saveRequestFirst: '먼저 요청을 컬렉션에 저장하세요',
    setAsDynamicVariableTitle: '"{{path}}" 경로를 동적 변수로 설정',
  },

  // Badges
  badges: {
    verified: '확인됨',
    modified: '수정됨',
    noChecksum: 'checksum 없음',
  },

  // File input
  fileInput: {
    chooseFile: '파일 선택',
    noFileChosen: '선택된 파일 없음',
  },

  // Protobuf
  protobuf: {
    decodedProtobuf: '디코딩된 Protobuf:',
  },

  // Messages panel
  messages: {
    title: '메시지',
  },

  // Export format labels
  exportFormats: {
    json: 'JSON (.json)',
    markdown: 'Markdown (.md)',
    csv: 'CSV (.csv)',
  },
};

export default ko;
