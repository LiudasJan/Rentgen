const vi = {
  // Common
  common: {
    send: 'Gửi',
    save: 'Lưu',
    saved: 'Đã lưu ✅',
    cancel: 'Hủy',
    close: 'Đóng',
    ok: 'OK',
    create: 'Tạo',
    delete: 'Xóa',
    import: 'Nhập',
    export: 'Xuất',
    copy: 'Sao chép',
    copied: 'Đã sao chép ✅',
    run: 'Chạy',
    replace: 'Thay thế',
    merge: 'Hợp nhất',
    overwrite: 'Ghi đè',
    enabled: 'Đã bật',
    disabled: 'Đã tắt',
    warning: 'Cảnh báo:',
    connect: 'Kết nối',
    disconnect: 'Ngắt kết nối',
    beautify: 'Định dạng đẹp',
    reload: 'Tải lại',
    cut: 'Cắt',
    paste: 'Dán',
  },

  // Sidebar
  sidebar: {
    collections: 'Bộ sưu tập',
    environments: 'Môi trường',
    history: 'Lịch sử',
    settings: 'Cài đặt',
    checkForUpdates: 'Kiểm tra cập nhật',
    reportFeedback: 'Gửi phản hồi',
  },

  // Collections Panel
  collections: {
    newFolder: 'Thư mục mới',
    importCollection: 'Nhập bộ sưu tập',
    exportCollection: 'Xuất bộ sưu tập',
    searchCollections: 'Tìm kiếm bộ sưu tập...',
    noMatchingRequests: 'Không có yêu cầu phù hợp',
    noSavedRequests: 'Không có yêu cầu nào được lưu',
    importFailed: 'Nhập thất bại: {{error}}',
    exportFailed: 'Xuất thất bại: {{error}}',
    importedWithWarnings: 'Đã nhập với {{count}} cảnh báo',
    collectionImported: 'Đã nhập bộ sưu tập',
    collectionExported: 'Đã xuất bộ sưu tập',
  },

  // Environment
  environment: {
    newEnvironment: 'Môi trường mới',
    editEnvironment: 'Chỉnh sửa môi trường',
    noEnvironmentsCreated: 'Chưa tạo môi trường nào',
    environmentName: 'Tên môi trường',
    environmentNamePlaceholder: 'ví dụ: Production, Staging, Local',
    color: 'Màu sắc',
    variables: 'Biến',
    variableName: 'Tên biến',
    addVariable: 'Thêm biến',
    value: 'Giá trị',
    refreshValue: 'Làm mới giá trị',
    refreshAll: 'Làm mới tất cả',
    noEnvironment: 'Không có môi trường',
    selectEnvironment: 'Chọn môi trường',
    randomEmail: 'Email ngẫu nhiên',
    randomInteger: 'Số nguyên ngẫu nhiên',
    randomString: 'Chuỗi ngẫu nhiên',
    deleteEnvironmentConfirm: 'Bạn có chắc chắn muốn xóa môi trường này?',
    deleteEnvironment: 'Xóa môi trường',
    untitled: 'Không có tiêu đề',
  },

  // History
  history: {
    title: 'Lịch sử',
    clearAll: 'Xóa tất cả',
    searchHistory: 'Tìm kiếm lịch sử...',
    noMatchingHistory: 'Không có lịch sử phù hợp',
    noHistoryYet: 'Chưa có lịch sử',
    today: 'Hôm nay',
    yesterday: 'Hôm qua',
  },

  // Request
  request: {
    enterUrl: 'Nhập URL hoặc dán văn bản',
    headers: 'Tiêu đề',
    headersPlaceholder: 'Khóa-tiêu-đề: giá trị',
    body: 'Nội dung',
    bodyPlaceholderHttp: 'Nhập nội dung yêu cầu (JSON hoặc Form Data)',
    bodyPlaceholderWss: 'Nội dung tin nhắn',
    protobufSchema: 'Lược đồ Protobuf và loại tin nhắn',
    protobufDescription: 'Phần thử nghiệm và tùy chọn. Nếu sử dụng, cả hai trường đều phải được điền',
    messageTypePlaceholder: 'Loại tin nhắn (ví dụ mypackage.MyMessage)',
    protoSchemaLoaded: '🟢 Đã tải lược đồ proto',
    protoSchemaParseFailed: '🔴 Phân tích proto thất bại: ',
    wssUrlRequired: '🔴 Vui lòng sử dụng URL ws:// hoặc wss://',
    modePlaceholder: 'CHẾ ĐỘ',
    methodPlaceholder: 'PHƯƠNG THỨC',
  },

  // Response
  response: {
    title: 'Phản hồi',
    sending: 'Đang gửi...',
    networkError: 'Lỗi mạng',
  },

  // cURL
  curl: {
    importCurl: 'Nhập cURL',
    importCurlPlaceholder: 'Nhập cURL hoặc dán văn bản',
    invalidCurl: 'Lệnh cURL bạn cung cấp có vẻ không hợp lệ. Vui lòng kiểm tra lại và thử lần nữa',
    copyCurl: 'Sao chép cURL',
  },

  // Tests
  tests: {
    generateAndRun: 'Tạo và chạy kiểm thử',
    runningTests: 'Đang chạy kiểm thử... ({{current}}/{{total}})',
    selectForCompare: 'Chọn để so sánh',
    compareWithSelected: 'So sánh với mục đã chọn',
    exportFormat: 'Định dạng',
    exported: 'Đã xuất ✅',
    generateCertificate: 'Tạo chứng chỉ',
    certificated: 'Đã chứng nhận ✅',
    notEligible: 'Không đủ điều kiện (cần ít nhất 70 kiểm thử)',
    securityTests: 'Kiểm thử bảo mật',
    performanceInsights: 'Thông tin chi tiết về hiệu suất',
    dataDrivenTests: 'Kiểm thử theo dữ liệu',
    crud: 'CRUD',
    runningSecurityTests: 'Đang chạy kiểm thử bảo mật...',
    runningPerformanceInsights: 'Đang chạy phân tích hiệu suất...',
    runningDataDrivenTests: 'Đang chạy kiểm thử theo dữ liệu...',
    preparingCrud: 'Đang chuẩn bị CRUD…',
    crudDescription: 'CRUD được tạo dựa trên phản hồi kiểm thử xử lý phương thức OPTIONS trong Kiểm thử bảo mật.',
    crudNote: 'Lưu ý:',
    crudNoteText: 'Nếu kiểm thử xử lý phương thức OPTIONS bị tắt, CRUD sẽ không được tạo.',
    copyBugReport: 'Sao chép báo cáo lỗi',
    computingDifferences: 'Đang tính toán khác biệt…',
    bodyParameters: 'Tham số nội dung',
    queryParameters: 'Tham số truy vấn',
    formatPlaceholder: 'Định dạng',
  },

  // Comparison Panel
  comparison: {
    title: 'So sánh kết quả kiểm thử',
    noTestResults: 'Không có kết quả kiểm thử nào để so sánh',
    potentialBugs: 'Lỗi tiềm ẩn',
    fullBehaviorChanges: 'Toàn bộ thay đổi hành vi',
    noPotentialBugs: 'Không phát hiện lỗi tiềm ẩn ✅',
    showFullBehaviorChanges: 'Hiển thị toàn bộ thay đổi hành vi',
    behaviorChange: 'Thay đổi hành vi:',
    showNoise: 'Hiển thị nhiễu',
  },

  // Modals
  modals: {
    reload: {
      title: 'Tải lại',
      description: 'Chỉ kết quả kiểm thử hiện tại sẽ bị mất',
      confirmText: 'Tải lại',
    },
    sendHttpSuccess: {
      title: 'Yêu cầu trông ổn!',
      description:
        'Rentgen hiện có một yêu cầu hợp lệ để làm việc. Trước khi tạo kiểm thử, hãy nhanh chóng xem lại các trường được ánh xạ để đảm bảo mọi thứ đều chính xác',
      confirmText: 'Xem lại và tạo kiểm thử',
      doNotShowAgain: 'Không hiển thị lại',
    },
    deleteFolder: {
      title: 'Xóa thư mục',
      description: 'Thư mục này chứa các yêu cầu. Bạn có chắc chắn muốn xóa nó không?',
    },
    importConflict: {
      title: 'Đã phát hiện xung đột khi nhập',
      conflictDescription: 'Bộ sưu tập đã nhập "{{name}}" có xung đột với bộ sưu tập hiện có của bạn:',
      collectionNamesMatch: 'Tên bộ sưu tập trùng khớp',
      folderConflicts: '{{count}} thư mục có tên trùng khớp',
      requestConflicts: '{{count}} yêu cầu có URL+Phương thức hoặc tên trùng khớp',
      importWarnings: 'Cảnh báo khi nhập: {{count}}',
      replaceDescription: 'Thay thế toàn bộ bộ sưu tập hiện có ({{folders}} thư mục, {{requests}} yêu cầu)',
      mergeDescription: 'Chỉ thêm các mục duy nhất (bỏ qua các mục trùng lặp theo URL+Phương thức hoặc tên)',
      newFolders: '{{count}} thư mục mới',
      newRequests: '{{count}} yêu cầu mới',
      noNewItems: 'Không có mục mới nào để thêm',
      importAsCopy: 'Nhập dưới dạng bản sao',
      copyDescription: 'Thêm tất cả thư mục với hậu tố "(bản sao)" ({{folders}} thư mục, {{requests}} yêu cầu)',
    },
    setDynamicVariable: {
      title: 'Đặt làm biến động',
      editTitle: 'Chỉnh sửa biến động',
      variableName: 'Tên biến',
      variableNamePlaceholder: 'tên_biến',
      preview: 'Xem trước:',
      environment: 'Môi trường',
      allEnvironments: 'Tất cả môi trường',
      untitledEnvironment: 'Môi trường không có tiêu đề',
      selectEnvironment: 'Chọn môi trường...',
      linkedRequest: 'Yêu cầu liên kết',
      variableNameRequired: 'Bắt buộc phải có tên biến',
      selectorRequired: 'Bắt buộc phải có bộ chọn',
      selectEnvironmentError: 'Vui lòng chọn một môi trường',
      duplicateWarning: 'Một biến với tên này đã tồn tại. Nó sẽ bị ghi đè.',
      saveVariable: 'Lưu biến',
      updateVariable: 'Cập nhật biến',
    },
    projectImport: {
      title: 'Nhập dự án',
      file: 'Tệp',
      exported: 'Đã xuất',
      appVersion: 'Phiên bản ứng dụng',
      integrity: 'Tính toàn vẹn',
      integrityWarning:
        'Kiểm tra tính toàn vẹn của tệp thất bại. Tệp này có thể đã bị sửa đổi bên ngoài Rentgen. Hãy thận trọng khi tiếp tục.',
      overwriteWarning: 'Thao tác này sẽ ghi đè TẤT CẢ dữ liệu hiện tại của bạn:',
      collectionsCount: 'Bộ sưu tập ({{folders}} thư mục, {{requests}} yêu cầu)',
      environmentsCount: 'Môi trường ({{count}} môi trường)',
      dynamicVariablesCount: 'Biến động ({{count}} biến)',
      historyCount: 'Lịch sử ({{count}} mục)',
      settingsInfo: 'Cài đặt (giao diện, công cụ kiểm thử, cấu hình lịch sử)',
      cannotBeUndone: 'Không thể hoàn tác hành động này.',
      backupBefore: 'Sao lưu dự án hiện tại của bạn trước khi nhập:',
      exportedCheck: 'Đã xuất ✓',
      exportCurrentProject: 'Xuất dự án hiện tại',
      importProject: 'Nhập dự án',
    },
  },

  // Settings
  settings: {
    testEngine: 'Công cụ kiểm thử',
    general: 'Chung',
    themes: 'Giao diện',
    language: 'Ngôn ngữ',
    themesDescription: 'Cá nhân hóa trải nghiệm của bạn với các giao diện phù hợp với phong cách của bạn.',
    themeLight: 'Sáng',
    themeDark: 'Tối',
    cli: {
      name: 'CLI',
      intro:
        'Rentgen CLI chạy một thư mục yêu cầu từ tệp xuất dự án <c>.rentgen</c>, trực tiếp từ terminal — được thiết kế cho các pipeline CI và các bài kiểm thử smoke theo kịch bản. Nó đọc cùng tệp được tạo bởi <e>Chung → Xuất dự án</e> và không bao giờ ghi lại vào tệp đó.',
      fullDocumentation: 'Tài liệu đầy đủ:',
      installInPath: 'Cài đặt vào PATH của shell ({{platform}})',
      checkingStatus: 'Đang kiểm tra trạng thái cài đặt…',
      runCli: 'Chạy CLI',
      runCliDescription:
        'Rentgen cung cấp một lệnh con duy nhất, <c>xray</c> (bí danh: <c>run</c>). Trỏ nó vào tệp dự án bạn đã xuất từ ứng dụng.',
      exportProject: 'Xuất dự án',
      noProjectFileYet:
        'Chưa có tệp dự án? Hãy xuất một tệp ngay bây giờ — hành động tương tự như <e>Chung → Xuất dự án</e>.',
      developmentNote: 'Trong quá trình phát triển, gọi trực tiếp từ kho mã với <c>npm run dev:cli -- xray …</c>.',
      options: 'Tùy chọn',
      examples: 'Ví dụ',
      exampleInteractive: 'Chọn một thư mục và môi trường một cách tương tác:',
      exampleCi: 'Chạy CI theo kịch bản với thư mục và môi trường rõ ràng, dừng ngay khi thất bại:',
      exampleCiJson: 'Đầu ra máy có thể đọc cho các pipeline CI (GitHub Actions, Jenkins, Slack notifiers):',
      exampleOverrideVars: 'Ghi đè biến tại nơi gọi (mức ưu tiên cao nhất):',
      integrityCheck: 'Kiểm tra tính toàn vẹn',
      integrityCheckDescription:
        'Mỗi tệp xuất dự án mang theo một checksum SHA-256 của dữ liệu. Khi tải, CLI tính lại checksum. Nếu khớp, quá trình chạy tiếp tục im lặng. Nếu thiếu hoặc bị giả mạo, bạn sẽ thấy lời nhắc xác nhận trong TTY hoặc lỗi trong CI. <c>--skip-integrity-check</c> bỏ qua bước kiểm tra — sử dụng khi bạn biết tệp đã được chỉnh sửa thủ công có chủ đích.',
      exitCodesTitle: 'Mã thoát',
      idempotency: 'Idempotency',
      idempotencyDescription:
        'CLI không bao giờ ghi vào tệp dự án. Các biến động được trích xuất từ phản hồi được giữ trong bộ nhớ trong suốt một lần chạy duy nhất, do đó hai lần gọi liên tiếp trên một dự án không bị sửa đổi sẽ tạo ra các URL, tiêu đề và nội dung đã giải quyết giống hệt nhau ở cấp byte.',
      platform: {
        macos: 'macOS',
        windows: 'Windows',
        linux: 'Linux',
      },
      status: {
        binaryUnavailable: 'Tệp nhị phân CLI không khả dụng',
        binaryUnavailableReinstall: 'Cài đặt lại bản dựng Rentgen mới nhất để kích hoạt CLI.',
        installed: 'Đã cài đặt',
        managedByPackageManager: ' (do trình quản lý gói quản lý)',
        conflictingPath: '`rentgen` xung đột trên PATH',
        conflictingPathDescription:
          '<c>{{path}}</c> nằm trên PATH nhưng không trỏ đến bản cài đặt Rentgen này. Hãy xóa nó hoặc việc cài đặt ở đây sẽ che khuất nó.',
        notInstalled: 'Chưa cài đặt',
        notInstalledDescription: 'Nhấp vào <e>Cài đặt</e> bên dưới để thêm <c>rentgen</c> vào PATH của shell.',
      },
      action: {
        working: 'Đang xử lý…',
        uninstall: 'Gỡ cài đặt CLI',
        reinstall: 'Cài đặt lại',
        installRentgenInPath: 'Cài đặt lệnh rentgen vào PATH',
        packageManagerNote:
          'Trình quản lý gói Linux xử lý việc cài đặt và gỡ cài đặt. Sử dụng <c>sudo apt remove rentgen</c> / <c>sudo dnf remove rentgen</c> để gỡ cài đặt.',
      },
      platformTip: {
        macos:
          'macOS sẽ yêu cầu mật khẩu của bạn để ghi symlink vào <c>/usr/local/bin/rentgen</c>. Sau khi cài đặt, mở một tab Terminal mới để nhận thay đổi.',
        windows:
          'Cài đặt trên Windows thêm thư mục tài nguyên Rentgen vào PATH <e>người dùng</e> của bạn (không cần quyền quản trị). Mở một tab PowerShell, Command Prompt hoặc Windows Terminal mới sau khi cài đặt — các shell hiện có sẽ không thấy thay đổi.',
        linux:
          'Trên Linux, script hậu cài đặt deb/rpm sẽ liên kết <c>/usr/bin/rentgen</c> tự động. Nếu bạn đã cài đặt qua một kho lưu trữ di động, nút này sẽ tạo một symlink người dùng tại <c>/usr/local/bin/rentgen</c> (hoặc <c>~/.local/bin/rentgen</c> làm phương án dự phòng).',
      },
      flag: {
        collection: 'Thư mục cần chạy từ tệp dự án. Bỏ qua để chọn tương tác.',
        env: 'Môi trường cần sử dụng. Truyền --env=none để chạy mà không có môi trường nào.',
        skipIntegrityCheck: 'Bỏ qua lời nhắc xác nhận checksum.',
        var: 'Ghi đè một biến. Có thể lặp lại. Ưu tiên cao nhất so với môi trường và giá trị động.',
        timeout: 'Thời gian chờ mỗi yêu cầu tính bằng mili giây. Mặc định 30000.',
        failFast: 'Dừng sau lần thất bại đầu tiên.',
        report: 'Đầu ra máy có thể đọc. Hỗ trợ: json (ghi JSON ra stdout, ẩn đầu ra cho con người).',
        noColor: 'Tắt đầu ra có màu.',
        verbose: 'In đầy đủ chi tiết yêu cầu/phản hồi và cảnh báo về các biến chưa được giải quyết.',
      },
      exit: {
        code0: 'Tất cả yêu cầu đã thành công.',
        code1: 'Quá trình chạy đã hoàn tất với thất bại, bị hủy bỏ tại lời nhắc checksum, hoặc bị ngắt bằng Ctrl+C.',
        code2:
          'Đầu vào không hợp lệ: thiếu tệp, JSON sai, định dạng sai, --collection / --env mơ hồ hoặc không xác định, hoặc chế độ CI thiếu các cờ bắt buộc.',
      },
    },
    history: {
      title: 'Lịch sử',
      description: 'Cấu hình cách thu thập và lưu giữ lịch sử yêu cầu.',
      enableHistory: 'Bật lịch sử',
      maximumSize: 'Kích thước tối đa',
      retentionPeriod: 'Thời gian lưu giữ',
      week1: '1 tuần',
      month1: '1 tháng',
      months3: '3 tháng',
      months6: '6 tháng',
      year1: '1 năm',
      noRetention: 'Không lưu giữ',
    },
    project: {
      title: 'Dự án',
      description: 'Xuất hoặc nhập toàn bộ dự án của bạn bao gồm bộ sưu tập, môi trường, biến, lịch sử và cài đặt.',
      exportProject: 'Xuất dự án',
      importProject: 'Nhập dự án',
    },
    configuration: {
      title: 'Cấu hình',
      description: 'Cấu hình các quy tắc và giới hạn để tạo các giá trị dữ liệu kiểm thử ngẫu nhiên.',
      email: 'Email',
      domain: 'Miền',
      randomEmailLength: 'Độ dài email ngẫu nhiên',
      enum: 'Enum',
      enumDescription: 'Nhập tất cả các giá trị hợp lệ, phân cách bằng ","',
      number: 'Số',
      minimumValue: 'Giá trị tối thiểu',
      maximumValue: 'Giá trị tối đa',
      string: 'Chuỗi',
      maximumValueLength: 'Độ dài giá trị tối đa',
      randomInteger: 'Số nguyên ngẫu nhiên',
      randomString: 'Chuỗi ngẫu nhiên',
      length: 'Độ dài',
    },
    securityTests: {
      title: 'Kiểm thử bảo mật',
      enabledCount: '{{enabled}}/{{total}} đã bật',
      description: 'Bật hoặc tắt từng kiểm thử bảo mật để tùy chỉnh trải nghiệm kiểm thử của bạn.',
    },
    languageSection: {
      title: 'Ngôn ngữ',
      description: 'Chọn ngôn ngữ ưa thích cho giao diện ứng dụng.',
      feedback:
        'Tìm thấy vấn đề về bản dịch hoặc muốn thêm ngôn ngữ khác? Hãy tạo một ticket với tất cả chi tiết và chúng tôi sẽ cố gắng hết sức.',
      feedbackLink: 'Mở một issue trên GitHub',
    },
  },

  // Controls
  controls: {
    sizeMB: 'Kích thước (MB)',
    sizeMax: 'Kích thước (tối đa {{max}} MB)',
    threads: 'Luồng',
    threadsMax: 'Luồng (tối đa 100)',
    requests: 'Yêu cầu',
    requestsMax: 'Tổng số yêu cầu (tối đa 10 000)',
    mandatoryToggle: 'Đã bật = Bắt buộc → Rentgen tạo kiểm thử dựa trên cài đặt này',
    enumLabel: 'Nhập tất cả các giá trị hợp lệ, phân cách bằng ","',
    numberLabel: 'Đặt phạm vi Min/Max cho kiểm thử biên. 0 - số nguyên, 0.00 - số thập phân',
    stringLabel: 'Độ dài giá trị tối đa',
    minPlaceholder: 'Tối thiểu',
    maxPlaceholder: 'Tối đa',
  },

  // Parameter types
  parameterTypes: {
    doNotTest: 'Không kiểm thử',
    randomEmail: 'Email ngẫu nhiên',
    randomInteger: 'Số nguyên ngẫu nhiên',
    randomString: 'Chuỗi ngẫu nhiên',
    boolean: 'Boolean',
    currency: 'Tiền tệ',
    dateYYYYMMDD: 'Ngày (YYYY-MM-DD)',
    email: 'Email',
    enum: 'Enum',
    number: 'Số',
    phone: 'Điện thoại',
    string: 'Chuỗi',
    url: 'URL',
  },

  // Tables
  tables: {
    parameter: 'Tham số',
    value: 'Giá trị',
    check: 'Kiểm tra',
    method: 'Phương thức',
    expected: 'Mong đợi',
    actual: 'Thực tế',
    result: 'Kết quả',
    name: 'Tên',
    description: 'Mô tả',
    request: 'Yêu cầu',
  },

  // Context Menu
  contextMenu: {
    setAsVariable: 'Đặt làm biến',
    saveRequestFirst: 'Hãy lưu yêu cầu vào bộ sưu tập trước',
    setAsDynamicVariableTitle: 'Đặt "{{path}}" làm biến động',
  },

  // Badges
  badges: {
    verified: 'Đã xác minh',
    modified: 'Đã sửa đổi',
    noChecksum: 'Không có checksum',
  },

  // File input
  fileInput: {
    chooseFile: 'Chọn tệp',
    noFileChosen: 'Chưa chọn tệp nào',
  },

  // Protobuf
  protobuf: {
    decodedProtobuf: 'Protobuf đã giải mã:',
  },

  // Messages panel
  messages: {
    title: 'Tin nhắn',
  },

  // Export format labels
  exportFormats: {
    json: 'JSON (.json)',
    markdown: 'Markdown (.md)',
    csv: 'CSV (.csv)',
  },
};

export default vi;
