const th = {
  // Common
  common: {
    send: 'ส่ง',
    save: 'บันทึก',
    saved: 'บันทึกแล้ว ✅',
    cancel: 'ยกเลิก',
    close: 'ปิด',
    ok: 'ตกลง',
    create: 'สร้าง',
    delete: 'ลบ',
    import: 'นำเข้า',
    export: 'ส่งออก',
    copy: 'คัดลอก',
    copied: 'คัดลอกแล้ว ✅',
    run: 'รัน',
    replace: 'แทนที่',
    merge: 'รวม',
    overwrite: 'เขียนทับ',
    enabled: 'เปิดใช้งาน',
    disabled: 'ปิดใช้งาน',
    warning: 'คำเตือน:',
    connect: 'เชื่อมต่อ',
    disconnect: 'ตัดการเชื่อมต่อ',
    beautify: 'จัดรูปแบบ',
    reload: 'โหลดใหม่',
    cut: 'ตัด',
    paste: 'วาง',
  },

  // Sidebar
  sidebar: {
    collections: 'คอลเลกชัน',
    environments: 'เอนไวรอนเมนต์',
    history: 'ประวัติ',
    settings: 'การตั้งค่า',
    checkForUpdates: 'ตรวจสอบอัปเดต',
    reportFeedback: 'รายงานข้อเสนอแนะ',
  },

  // Collections Panel
  collections: {
    newFolder: 'โฟลเดอร์ใหม่',
    importCollection: 'นำเข้าคอลเลกชัน',
    exportCollection: 'ส่งออกคอลเลกชัน',
    searchCollections: 'ค้นหาคอลเลกชัน...',
    noMatchingRequests: 'ไม่มีคำขอที่ตรงกัน',
    noSavedRequests: 'ยังไม่มีคำขอที่บันทึกไว้',
    importFailed: 'นำเข้าไม่สำเร็จ: {{error}}',
    exportFailed: 'ส่งออกไม่สำเร็จ: {{error}}',
    importedWithWarnings: 'นำเข้าแล้วพร้อมคำเตือน {{count}} รายการ',
    collectionImported: 'นำเข้าคอลเลกชันแล้ว',
    collectionExported: 'ส่งออกคอลเลกชันแล้ว',
  },

  // Environment
  environment: {
    newEnvironment: 'เอนไวรอนเมนต์ใหม่',
    editEnvironment: 'แก้ไขเอนไวรอนเมนต์',
    noEnvironmentsCreated: 'ยังไม่มีการสร้างเอนไวรอนเมนต์',
    environmentName: 'ชื่อเอนไวรอนเมนต์',
    environmentNamePlaceholder: 'เช่น Production, Staging, Local',
    color: 'สี',
    variables: 'ตัวแปร',
    variableName: 'ชื่อตัวแปร',
    addVariable: 'เพิ่มตัวแปร',
    value: 'ค่า',
    refreshValue: 'รีเฟรชค่า',
    refreshAll: 'รีเฟรชทั้งหมด',
    noEnvironment: 'ไม่มีเอนไวรอนเมนต์',
    selectEnvironment: 'เลือกเอนไวรอนเมนต์',
    randomEmail: 'อีเมลสุ่ม',
    randomInteger: 'จำนวนเต็มสุ่ม',
    randomString: 'สตริงสุ่ม',
    deleteEnvironmentConfirm: 'คุณแน่ใจหรือไม่ว่าต้องการลบเอนไวรอนเมนต์นี้?',
    deleteEnvironment: 'ลบเอนไวรอนเมนต์',
    untitled: 'ไม่มีชื่อ',
  },

  // History
  history: {
    title: 'ประวัติ',
    clearAll: 'ล้างทั้งหมด',
    searchHistory: 'ค้นหาประวัติ...',
    noMatchingHistory: 'ไม่มีประวัติที่ตรงกัน',
    noHistoryYet: 'ยังไม่มีประวัติ',
    today: 'วันนี้',
    yesterday: 'เมื่อวาน',
  },

  // Request
  request: {
    enterUrl: 'ป้อน URL หรือวางข้อความ',
    headers: 'เฮดเดอร์',
    headersPlaceholder: 'Header-Key: value',
    body: 'บอดี้',
    bodyPlaceholderHttp: 'ป้อนบอดี้ของคำขอ (JSON หรือ Form Data)',
    bodyPlaceholderWss: 'เนื้อหาข้อความ',
    protobufSchema: 'Protobuf Schema และประเภทข้อความ',
    protobufDescription: 'ส่วนทดลองและเป็นทางเลือก หากใช้งาน จะต้องกรอกข้อมูลทั้งสองช่อง',
    messageTypePlaceholder: 'ประเภทข้อความ (เช่น mypackage.MyMessage)',
    protoSchemaLoaded: '🟢 โหลด Proto schema แล้ว',
    protoSchemaParseFailed: '🔴 แยกวิเคราะห์ Proto ไม่สำเร็จ: ',
    wssUrlRequired: '🔴 กรุณาใช้ URL แบบ ws:// หรือ wss://',
    modePlaceholder: 'MODE',
    methodPlaceholder: 'METHOD',
  },

  // Response
  response: {
    title: 'การตอบกลับ',
    sending: 'กำลังส่ง...',
    networkError: 'ข้อผิดพลาดเครือข่าย',
  },

  // cURL
  curl: {
    importCurl: 'นำเข้า cURL',
    importCurlPlaceholder: 'ป้อน cURL หรือวางข้อความ',
    invalidCurl: 'คำสั่ง cURL ที่คุณป้อนดูเหมือนจะไม่ถูกต้อง กรุณาตรวจสอบและลองอีกครั้ง',
    copyCurl: 'คัดลอก cURL',
  },

  // Tests
  tests: {
    generateAndRun: 'สร้างและรันเทสต์',
    runningTests: 'กำลังรันเทสต์... ({{current}}/{{total}})',
    selectForCompare: 'เลือกเพื่อเปรียบเทียบ',
    compareWithSelected: 'เปรียบเทียบกับที่เลือก',
    exportFormat: 'รูปแบบ',
    exported: 'ส่งออกแล้ว ✅',
    generateCertificate: 'สร้างใบรับรอง',
    certificated: 'รับรองแล้ว ✅',
    notEligible: 'ไม่ผ่านเกณฑ์ (ต้องมีอย่างน้อย 70 เทสต์)',
    securityTests: 'เทสต์ความปลอดภัย',
    performanceInsights: 'ข้อมูลเชิงลึกประสิทธิภาพ',
    dataDrivenTests: 'เทสต์แบบ Data-Driven',
    crud: 'CRUD',
    runningSecurityTests: 'กำลังรันเทสต์ความปลอดภัย...',
    runningPerformanceInsights: 'กำลังรันข้อมูลเชิงลึกประสิทธิภาพ...',
    runningDataDrivenTests: 'กำลังรันเทสต์แบบ Data-Driven...',
    preparingCrud: 'กำลังเตรียม CRUD…',
    crudDescription: 'CRUD ถูกสร้างขึ้นจากการตอบกลับของเทสต์การจัดการเมธอด OPTIONS ในเทสต์ความปลอดภัย',
    crudNote: 'หมายเหตุ:',
    crudNoteText: 'หากปิดใช้งานเทสต์การจัดการเมธอด OPTIONS จะไม่มีการสร้าง CRUD',
    copyBugReport: 'คัดลอกรายงานบั๊ก',
    computingDifferences: 'กำลังคำนวณความแตกต่าง…',
    bodyParameters: 'พารามิเตอร์ของบอดี้',
    queryParameters: 'พารามิเตอร์ของ Query',
    formatPlaceholder: 'รูปแบบ',
  },

  // Comparison Panel
  comparison: {
    title: 'การเปรียบเทียบผลลัพธ์เทสต์',
    noTestResults: 'ไม่มีผลลัพธ์เทสต์ให้เปรียบเทียบ',
    potentialBugs: 'บั๊กที่อาจเกิดขึ้น',
    fullBehaviorChanges: 'การเปลี่ยนแปลงพฤติกรรมทั้งหมด',
    noPotentialBugs: 'ไม่พบบั๊กที่อาจเกิดขึ้น ✅',
    showFullBehaviorChanges: 'แสดงการเปลี่ยนแปลงพฤติกรรมทั้งหมด',
    behaviorChange: 'การเปลี่ยนแปลงพฤติกรรม:',
    showNoise: 'แสดง noise',
  },

  // Modals
  modals: {
    reload: {
      title: 'โหลดใหม่',
      description: 'ผลลัพธ์เทสต์ปัจจุบันเท่านั้นที่จะหายไป',
      confirmText: 'โหลดใหม่',
    },
    sendHttpSuccess: {
      title: 'คำขอดูดีแล้ว!',
      description:
        'ขณะนี้ Rentgen มีคำขอที่ใช้งานได้แล้ว ก่อนสร้างเทสต์ กรุณาตรวจสอบฟิลด์ที่แมปไว้อย่างรวดเร็วเพื่อให้แน่ใจว่าทุกอย่างถูกต้อง',
      confirmText: 'ตรวจสอบและสร้างเทสต์',
      doNotShowAgain: 'ไม่ต้องแสดงอีก',
    },
    deleteFolder: {
      title: 'ลบโฟลเดอร์',
      description: 'โฟลเดอร์นี้มีคำขออยู่ คุณแน่ใจหรือไม่ว่าต้องการลบ?',
    },
    importConflict: {
      title: 'ตรวจพบความขัดแย้งในการนำเข้า',
      conflictDescription: 'คอลเลกชันที่นำเข้า "{{name}}" มีความขัดแย้งกับคอลเลกชันที่มีอยู่ของคุณ:',
      collectionNamesMatch: 'ชื่อคอลเลกชันตรงกัน',
      folderConflicts: 'โฟลเดอร์ {{count}} รายการมีชื่อตรงกัน',
      requestConflicts: 'คำขอ {{count}} รายการมี URL+Method หรือชื่อตรงกัน',
      importWarnings: 'คำเตือนการนำเข้า: {{count}}',
      replaceDescription: 'แทนที่คอลเลกชันที่มีอยู่ทั้งหมด ({{folders}} โฟลเดอร์, {{requests}} คำขอ)',
      mergeDescription: 'เพิ่มเฉพาะรายการที่ไม่ซ้ำ (ข้ามรายการซ้ำตาม URL+Method หรือชื่อ)',
      newFolders: 'โฟลเดอร์ใหม่ {{count}} รายการ',
      newRequests: 'คำขอใหม่ {{count}} รายการ',
      noNewItems: 'ไม่มีรายการใหม่ให้เพิ่ม',
      importAsCopy: 'นำเข้าเป็นสำเนา',
      copyDescription: 'เพิ่มโฟลเดอร์ทั้งหมดด้วยส่วนต่อท้าย "(copy)" ({{folders}} โฟลเดอร์, {{requests}} คำขอ)',
    },
    setDynamicVariable: {
      title: 'ตั้งเป็นตัวแปรไดนามิก',
      editTitle: 'แก้ไขตัวแปรไดนามิก',
      variableName: 'ชื่อตัวแปร',
      variableNamePlaceholder: 'variable_name',
      preview: 'ตัวอย่าง:',
      environment: 'เอนไวรอนเมนต์',
      allEnvironments: 'เอนไวรอนเมนต์ทั้งหมด',
      untitledEnvironment: 'เอนไวรอนเมนต์ที่ไม่มีชื่อ',
      selectEnvironment: 'เลือกเอนไวรอนเมนต์...',
      linkedRequest: 'คำขอที่เชื่อมโยง',
      variableNameRequired: 'จำเป็นต้องระบุชื่อตัวแปร',
      selectorRequired: 'จำเป็นต้องระบุ Selector',
      selectEnvironmentError: 'กรุณาเลือกเอนไวรอนเมนต์',
      duplicateWarning: 'มีตัวแปรชื่อนี้อยู่แล้ว ตัวแปรจะถูกเขียนทับ',
      saveVariable: 'บันทึกตัวแปร',
      updateVariable: 'อัปเดตตัวแปร',
    },
    projectImport: {
      title: 'นำเข้าโปรเจกต์',
      file: 'ไฟล์',
      exported: 'ส่งออกเมื่อ',
      appVersion: 'เวอร์ชันแอป',
      integrity: 'ความสมบูรณ์',
      integrityWarning:
        'การตรวจสอบความสมบูรณ์ของไฟล์ล้มเหลว ไฟล์นี้อาจถูกแก้ไขภายนอก Rentgen ดำเนินการต่อด้วยความระมัดระวัง',
      overwriteWarning: 'การกระทำนี้จะเขียนทับข้อมูลปัจจุบันทั้งหมดของคุณ:',
      collectionsCount: 'คอลเลกชัน ({{folders}} โฟลเดอร์, {{requests}} คำขอ)',
      environmentsCount: 'เอนไวรอนเมนต์ ({{count}} เอนไวรอนเมนต์)',
      dynamicVariablesCount: 'ตัวแปรไดนามิก ({{count}} ตัวแปร)',
      historyCount: 'ประวัติ ({{count}} รายการ)',
      settingsInfo: 'การตั้งค่า (ธีม, เทสต์เอนจิน, การตั้งค่าประวัติ)',
      cannotBeUndone: 'การกระทำนี้ไม่สามารถยกเลิกได้',
      backupBefore: 'สำรองโปรเจกต์ปัจจุบันก่อนนำเข้า:',
      exportedCheck: 'ส่งออกแล้ว ✓',
      exportCurrentProject: 'ส่งออกโปรเจกต์ปัจจุบัน',
      importProject: 'นำเข้าโปรเจกต์',
    },
  },

  // Settings
  settings: {
    testEngine: 'เทสต์เอนจิน',
    general: 'ทั่วไป',
    themes: 'ธีม',
    language: 'ภาษา',
    themesDescription: 'ปรับแต่งประสบการณ์ของคุณด้วยธีมที่ตรงกับสไตล์ของคุณ',
    themeLight: 'สว่าง',
    themeDark: 'มืด',
    cli: {
      name: 'CLI',
      intro:
        'Rentgen CLI รันโฟลเดอร์ของคำขอจากไฟล์ส่งออกโปรเจกต์ <c>.rentgen</c> โดยตรงจากเทอร์มินัล — สร้างขึ้นสำหรับ CI pipeline และ smoke test แบบสคริปต์ มันอ่านไฟล์เดียวกับที่สร้างโดย <e>ทั่วไป → ส่งออกโปรเจกต์</e> และจะไม่เขียนข้อมูลกลับ',
      fullDocumentation: 'เอกสารฉบับเต็ม:',
      installInPath: 'ติดตั้งใน shell PATH ({{platform}})',
      checkingStatus: 'กำลังตรวจสอบสถานะการติดตั้ง…',
      runCli: 'รัน CLI',
      runCliDescription:
        'Rentgen เปิดให้ใช้งานเพียงคำสั่งย่อยเดียวคือ <c>xray</c> (ชื่อแทน: <c>run</c>) ชี้ไปที่ไฟล์โปรเจกต์ที่คุณส่งออกจากแอป',
      exportProject: 'ส่งออกโปรเจกต์',
      noProjectFileYet: 'ยังไม่มีไฟล์โปรเจกต์ใช่ไหม? ส่งออกเลยตอนนี้ — การกระทำเดียวกับ <e>ทั่วไป → ส่งออกโปรเจกต์</e>',
      developmentNote: 'ในช่วงการพัฒนา ให้เรียกใช้งานโดยตรงจาก repo ด้วย <c>npm run dev:cli -- xray …</c>',
      options: 'ตัวเลือก',
      examples: 'ตัวอย่าง',
      exampleInteractive: 'เลือกโฟลเดอร์และเอนไวรอนเมนต์แบบโต้ตอบ:',
      exampleCi: 'การรัน CI แบบสคริปต์โดยระบุโฟลเดอร์และเอนไวรอนเมนต์อย่างชัดเจน หยุดทันทีเมื่อล้มเหลว:',
      exampleCiJson: 'เอาต์พุตแบบ machine-readable สำหรับ CI pipeline (GitHub Actions, Jenkins, Slack notifier):',
      exampleOverrideVars: 'แทนที่ตัวแปร ณ จุดเรียกใช้งาน (ลำดับความสำคัญสูงสุด):',
      integrityCheck: 'การตรวจสอบความสมบูรณ์',
      integrityCheckDescription:
        'การส่งออกโปรเจกต์ทุกครั้งจะมี checksum SHA-256 ของข้อมูลติดมาด้วย เมื่อโหลด CLI จะคำนวณ checksum ใหม่ หากตรงกัน การรันจะดำเนินต่อไปอย่างเงียบ ๆ หากหายไปหรือถูกแก้ไข คุณจะเห็นการยืนยันใน TTY หรือเออร์เรอร์ใน CI <c>--skip-integrity-check</c> จะข้ามการตรวจสอบ — ใช้เมื่อคุณรู้ว่าไฟล์ถูกแก้ไขด้วยมือโดยตั้งใจ',
      exitCodesTitle: 'รหัสออก',
      idempotency: 'Idempotency',
      idempotencyDescription:
        'CLI จะไม่เขียนลงในไฟล์โปรเจกต์ ตัวแปรไดนามิกที่ดึงมาจากการตอบกลับจะถูกเก็บไว้ในหน่วยความจำตลอดระยะเวลาการรันเดียว ดังนั้นการเรียกใช้สองครั้งต่อเนื่องกับโปรเจกต์ที่ไม่ได้แก้ไขจะให้ URL, เฮดเดอร์ และบอดี้ที่ resolve แล้วเหมือนกันทุกไบต์',
      platform: {
        macos: 'macOS',
        windows: 'Windows',
        linux: 'Linux',
      },
      status: {
        binaryUnavailable: 'ไฟล์ binary ของ CLI ไม่พร้อมใช้งาน',
        binaryUnavailableReinstall: 'ติดตั้ง Rentgen เวอร์ชันล่าสุดใหม่เพื่อเปิดใช้งาน CLI',
        installed: 'ติดตั้งแล้ว',
        managedByPackageManager: ' (จัดการโดยตัวจัดการแพ็กเกจ)',
        conflictingPath: 'พบ `rentgen` ที่ขัดแย้งกันบน PATH',
        conflictingPathDescription:
          '<c>{{path}}</c> อยู่บน PATH แต่ไม่ได้ชี้ไปที่ Rentgen ที่ติดตั้งนี้ ลบออกหรือการติดตั้งที่นี่จะบดบังมัน',
        notInstalled: 'ยังไม่ได้ติดตั้ง',
        notInstalledDescription: 'คลิก <e>ติดตั้ง</e> ด้านล่างเพื่อเพิ่ม <c>rentgen</c> ลงใน shell PATH ของคุณ',
      },
      action: {
        working: 'กำลังดำเนินการ…',
        uninstall: 'ถอนการติดตั้ง CLI',
        reinstall: 'ติดตั้งใหม่',
        installRentgenInPath: 'ติดตั้งคำสั่ง rentgen ลงใน PATH',
        packageManagerNote:
          'ตัวจัดการแพ็กเกจของ Linux เป็นผู้จัดการการติดตั้งและถอนการติดตั้ง ใช้ <c>sudo apt remove rentgen</c> / <c>sudo dnf remove rentgen</c> เพื่อถอนการติดตั้ง',
      },
      platformTip: {
        macos:
          'macOS จะขอรหัสผ่านของคุณเพื่อเขียน symlink ไปยัง <c>/usr/local/bin/rentgen</c> หลังการติดตั้ง ให้เปิดแท็บ Terminal ใหม่เพื่อให้การเปลี่ยนแปลงมีผล',
        windows:
          'การติดตั้งบน Windows จะเพิ่มไดเรกทอรี Rentgen resources ลงใน PATH ของ <e>ผู้ใช้</e> ของคุณ (ไม่ต้องใช้สิทธิ์ admin) หลังการติดตั้งให้เปิดแท็บ PowerShell, Command Prompt หรือ Windows Terminal ใหม่ — shell ที่เปิดอยู่จะไม่เห็นการเปลี่ยนแปลง',
        linux:
          'บน Linux สคริปต์ postinstall ของ deb/rpm จะลิงก์ <c>/usr/bin/rentgen</c> ให้โดยอัตโนมัติ หากคุณติดตั้งผ่าน portable archive แทน ปุ่มนี้จะสร้าง user symlink ที่ <c>/usr/local/bin/rentgen</c> (หรือ <c>~/.local/bin/rentgen</c> เป็นทางเลือกสำรอง)',
      },
      flag: {
        collection: 'โฟลเดอร์ที่จะรันจากไฟล์โปรเจกต์ ละไว้เพื่อเลือกแบบโต้ตอบ',
        env: 'เอนไวรอนเมนต์ที่จะใช้ ใส่ --env=none เพื่อรันโดยไม่ใช้เอนไวรอนเมนต์ใด ๆ',
        skipIntegrityCheck: 'ข้ามการยืนยัน checksum',
        var: 'แทนที่ตัวแปร ใช้ซ้ำได้ ลำดับความสำคัญสูงกว่า env และค่าไดนามิก',
        timeout: 'ระยะเวลา timeout ต่อคำขอเป็นมิลลิวินาที ค่าเริ่มต้น 30000',
        failFast: 'หยุดหลังความล้มเหลวครั้งแรก',
        report: 'เอาต์พุตแบบ machine-readable รองรับ: json (เขียน JSON ไปยัง stdout, ระงับเอาต์พุตที่มนุษย์อ่านได้)',
        noColor: 'ปิดใช้งานเอาต์พุตแบบมีสี',
        verbose: 'พิมพ์รายละเอียดคำขอ/การตอบกลับฉบับเต็ม และเตือนเกี่ยวกับตัวแปรที่ยังไม่ได้ resolve',
      },
      exit: {
        code0: 'คำขอทั้งหมดผ่าน',
        code1: 'การรันเสร็จสิ้นโดยมีความล้มเหลว, ถูกยกเลิกที่การยืนยัน checksum, หรือถูกขัดจังหวะด้วย Ctrl+C',
        code2:
          'อินพุตไม่ถูกต้อง: ไฟล์หายไป, JSON ผิดพลาด, รูปแบบไม่ถูกต้อง, --collection / --env กำกวมหรือไม่รู้จัก, หรือโหมด CI โดยไม่มี flag ที่จำเป็น',
      },
    },
    history: {
      title: 'ประวัติ',
      description: 'กำหนดค่าวิธีการรวบรวมและเก็บรักษาประวัติคำขอ',
      enableHistory: 'เปิดใช้งานประวัติ',
      maximumSize: 'ขนาดสูงสุด',
      retentionPeriod: 'ระยะเวลาการเก็บรักษา',
      week1: '1 สัปดาห์',
      month1: '1 เดือน',
      months3: '3 เดือน',
      months6: '6 เดือน',
      year1: '1 ปี',
      noRetention: 'ไม่เก็บรักษา',
    },
    project: {
      title: 'โปรเจกต์',
      description:
        'ส่งออกหรือนำเข้าโปรเจกต์ทั้งหมดของคุณ รวมถึงคอลเลกชัน, เอนไวรอนเมนต์, ตัวแปร, ประวัติ และการตั้งค่า',
      exportProject: 'ส่งออกโปรเจกต์',
      importProject: 'นำเข้าโปรเจกต์',
    },
    configuration: {
      title: 'การกำหนดค่า',
      description: 'กำหนดค่ากฎและขีดจำกัดสำหรับการสร้างค่าข้อมูลเทสต์แบบสุ่ม',
      email: 'อีเมล',
      domain: 'โดเมน',
      randomEmailLength: 'ความยาวอีเมลสุ่ม',
      enum: 'Enum',
      enumDescription: 'ป้อนค่าที่ถูกต้องทั้งหมดโดยคั่นด้วย ","',
      number: 'จำนวน',
      minimumValue: 'ค่าต่ำสุด',
      maximumValue: 'ค่าสูงสุด',
      string: 'สตริง',
      maximumValueLength: 'ความยาวค่าสูงสุด',
      randomInteger: 'จำนวนเต็มสุ่ม',
      randomString: 'สตริงสุ่ม',
      length: 'ความยาว',
    },
    securityTests: {
      title: 'เทสต์ความปลอดภัย',
      enabledCount: 'เปิดใช้งาน {{enabled}}/{{total}}',
      description: 'เปิดหรือปิดเทสต์ความปลอดภัยแต่ละรายการเพื่อปรับแต่งประสบการณ์การทดสอบของคุณ',
    },
    languageSection: {
      title: 'ภาษา',
      description: 'เลือกภาษาที่คุณต้องการสำหรับอินเทอร์เฟซแอปพลิเคชัน',
      feedback:
        'พบปัญหาการแปลหรือต้องการเพิ่มภาษาอื่น? สร้าง ticket พร้อมรายละเอียดทั้งหมด แล้วเราจะพยายามอย่างเต็มที่',
      feedbackLink: 'เปิด GitHub issue',
    },
  },

  // Controls
  controls: {
    sizeMB: 'ขนาด (MB)',
    sizeMax: 'ขนาด (สูงสุด {{max}} MB)',
    threads: 'เธรด',
    threadsMax: 'เธรด (สูงสุด 100)',
    requests: 'คำขอ',
    requestsMax: 'จำนวนคำขอทั้งหมด (สูงสุด 10 000)',
    mandatoryToggle: 'เปิดใช้งาน = บังคับ → Rentgen จะสร้างเทสต์ตามการตั้งค่านี้',
    enumLabel: 'ป้อนค่าที่ถูกต้องทั้งหมดโดยคั่นด้วย ","',
    numberLabel: 'กำหนดช่วง Min/Max สำหรับเทสต์ขอบเขต 0 - จำนวนเต็ม, 0.00 - ทศนิยม',
    stringLabel: 'ความยาวค่าสูงสุด',
    minPlaceholder: 'ต่ำสุด',
    maxPlaceholder: 'สูงสุด',
  },

  // Parameter types
  parameterTypes: {
    doNotTest: 'ไม่ทดสอบ',
    randomEmail: 'อีเมลสุ่ม',
    randomInteger: 'จำนวนเต็มสุ่ม',
    randomString: 'สตริงสุ่ม',
    boolean: 'บูลีน',
    currency: 'สกุลเงิน',
    dateYYYYMMDD: 'วันที่ (YYYY-MM-DD)',
    email: 'อีเมล',
    enum: 'Enum',
    number: 'จำนวน',
    phone: 'โทรศัพท์',
    string: 'สตริง',
    url: 'URL',
  },

  // Tables
  tables: {
    parameter: 'พารามิเตอร์',
    value: 'ค่า',
    check: 'การตรวจสอบ',
    method: 'เมธอด',
    expected: 'คาดหวัง',
    actual: 'จริง',
    result: 'ผลลัพธ์',
    name: 'ชื่อ',
    description: 'คำอธิบาย',
    request: 'คำขอ',
  },

  // Context Menu
  contextMenu: {
    setAsVariable: 'ตั้งเป็นตัวแปร',
    saveRequestFirst: 'กรุณาบันทึกคำขอลงในคอลเลกชันก่อน',
    setAsDynamicVariableTitle: 'ตั้ง "{{path}}" เป็นตัวแปรไดนามิก',
  },

  // Badges
  badges: {
    verified: 'ตรวจสอบแล้ว',
    modified: 'แก้ไขแล้ว',
    noChecksum: 'ไม่มี checksum',
  },

  // File input
  fileInput: {
    chooseFile: 'เลือกไฟล์',
    noFileChosen: 'ยังไม่ได้เลือกไฟล์',
  },

  // Protobuf
  protobuf: {
    decodedProtobuf: 'Protobuf ที่ถอดรหัสแล้ว:',
  },

  // Messages panel
  messages: {
    title: 'ข้อความ',
  },

  // Export format labels
  exportFormats: {
    json: 'JSON (.json)',
    markdown: 'Markdown (.md)',
    csv: 'CSV (.csv)',
  },
};

export default th;
