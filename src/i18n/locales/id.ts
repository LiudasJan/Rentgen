const id = {
  // Common
  common: {
    send: 'Kirim',
    save: 'Simpan',
    saved: 'Tersimpan ✅',
    cancel: 'Batal',
    close: 'Tutup',
    ok: 'OK',
    create: 'Buat',
    delete: 'Hapus',
    import: 'Impor',
    export: 'Ekspor',
    copy: 'Salin',
    copied: 'Tersalin ✅',
    run: 'Jalankan',
    replace: 'Ganti',
    merge: 'Gabungkan',
    overwrite: 'Timpa',
    enabled: 'Aktif',
    disabled: 'Nonaktif',
    warning: 'Peringatan:',
    connect: 'Hubungkan',
    disconnect: 'Putuskan',
    beautify: 'Rapikan',
    reload: 'Muat ulang',
    cut: 'Potong',
    paste: 'Tempel',
  },

  // Sidebar
  sidebar: {
    collections: 'Koleksi',
    environments: 'Lingkungan',
    history: 'Riwayat',
    settings: 'Pengaturan',
    checkForUpdates: 'Periksa pembaruan',
    reportFeedback: 'Laporkan masukan',
  },

  // Collections Panel
  collections: {
    newFolder: 'Folder Baru',
    importCollection: 'Impor Koleksi',
    exportCollection: 'Ekspor Koleksi',
    searchCollections: 'Cari koleksi...',
    noMatchingRequests: 'Tidak ada permintaan yang cocok',
    noSavedRequests: 'Tidak ada permintaan tersimpan',
    importFailed: 'Impor gagal: {{error}}',
    exportFailed: 'Ekspor gagal: {{error}}',
    importedWithWarnings: 'Diimpor dengan {{count}} peringatan',
    collectionImported: 'Koleksi diimpor',
    collectionExported: 'Koleksi diekspor',
  },

  // Environment
  environment: {
    newEnvironment: 'Lingkungan Baru',
    editEnvironment: 'Edit Lingkungan',
    noEnvironmentsCreated: 'Belum ada lingkungan dibuat',
    environmentName: 'Nama Lingkungan',
    environmentNamePlaceholder: 'mis. Production, Staging, Local',
    color: 'Warna',
    variables: 'Variabel',
    variableName: 'Nama Variabel',
    addVariable: 'Tambah variabel',
    value: 'Nilai',
    refreshValue: 'Segarkan nilai',
    refreshAll: 'Segarkan Semua',
    noEnvironment: 'Tanpa Lingkungan',
    selectEnvironment: 'Pilih Lingkungan',
    randomEmail: 'Email acak',
    randomInteger: 'Bilangan bulat acak',
    randomString: 'String acak',
    deleteEnvironmentConfirm: 'Yakin ingin menghapus lingkungan ini?',
    deleteEnvironment: 'Hapus Lingkungan',
    untitled: 'Tanpa Judul',
  },

  // History
  history: {
    title: 'Riwayat',
    clearAll: 'Hapus Semua',
    searchHistory: 'Cari riwayat...',
    noMatchingHistory: 'Tidak ada riwayat yang cocok',
    noHistoryYet: 'Belum ada riwayat',
    today: 'Hari ini',
    yesterday: 'Kemarin',
  },

  // Request
  request: {
    enterUrl: 'Masukkan URL atau tempel teks',
    headers: 'Headers',
    headersPlaceholder: 'Header-Key: value',
    body: 'Body',
    bodyPlaceholderHttp: 'Masukkan body permintaan (JSON atau Form Data)',
    bodyPlaceholderWss: 'Body pesan',
    protobufSchema: 'Skema Protobuf & Tipe Pesan',
    protobufDescription: 'Bagian eksperimental dan opsional. Jika digunakan, kedua kolom harus diisi',
    messageTypePlaceholder: 'Tipe pesan (mis. mypackage.MyMessage)',
    protoSchemaLoaded: '🟢 Skema proto dimuat',
    protoSchemaParseFailed: '🔴 Gagal memproses proto: ',
    wssUrlRequired: '🔴 Mohon gunakan URL ws:// atau wss://',
    modePlaceholder: 'MODE',
    methodPlaceholder: 'METODE',
  },

  // Response
  response: {
    title: 'Respons',
    sending: 'Mengirim...',
    networkError: 'Galat Jaringan',
  },

  // cURL
  curl: {
    importCurl: 'Impor cURL',
    importCurlPlaceholder: 'Masukkan cURL atau tempel teks',
    invalidCurl: 'Perintah cURL yang Anda berikan tampaknya tidak valid. Mohon periksa dan coba lagi',
    copyCurl: 'Salin cURL',
  },

  // Tests
  tests: {
    generateAndRun: 'Hasilkan & Jalankan Tes',
    runningTests: 'Menjalankan tes... ({{current}}/{{total}})',
    selectForCompare: 'Pilih untuk Bandingkan',
    compareWithSelected: 'Bandingkan dengan Pilihan',
    exportFormat: 'Format',
    exported: 'Terekspor ✅',
    generateCertificate: 'Hasilkan Sertifikat',
    certificated: 'Tersertifikasi ✅',
    notEligible: 'Tidak memenuhi syarat (minimal 70 tes diperlukan)',
    securityTests: 'Tes Keamanan',
    performanceInsights: 'Wawasan Performa',
    dataDrivenTests: 'Tes Berbasis Data',
    crud: 'CRUD',
    runningSecurityTests: 'Menjalankan Tes Keamanan...',
    runningPerformanceInsights: 'Menjalankan Wawasan Performa...',
    runningDataDrivenTests: 'Menjalankan Tes Berbasis Data...',
    preparingCrud: 'Menyiapkan CRUD…',
    crudDescription: 'CRUD dihasilkan berdasarkan respons tes penanganan metode OPTIONS pada Tes Keamanan.',
    crudNote: 'Catatan:',
    crudNoteText: 'Jika tes penanganan metode OPTIONS dinonaktifkan, CRUD tidak akan dihasilkan.',
    copyBugReport: 'Salin Laporan Bug',
    computingDifferences: 'Menghitung perbedaan…',
    bodyParameters: 'Parameter Body',
    queryParameters: 'Parameter Query',
    formatPlaceholder: 'Format',
  },

  // Comparison Panel
  comparison: {
    title: 'Perbandingan Hasil Tes',
    noTestResults: 'Tidak ada hasil tes untuk dibandingkan',
    potentialBugs: 'Potensi Bug',
    fullBehaviorChanges: 'Perubahan Perilaku Penuh',
    noPotentialBugs: 'Tidak ada potensi bug terdeteksi ✅',
    showFullBehaviorChanges: 'Tampilkan Perubahan Perilaku Penuh',
    behaviorChange: 'Perubahan Perilaku:',
    showNoise: 'Tampilkan noise',
  },

  // Modals
  modals: {
    reload: {
      title: 'Muat Ulang',
      description: 'Hanya hasil tes saat ini yang akan hilang',
      confirmText: 'Muat Ulang',
    },
    sendHttpSuccess: {
      title: 'Permintaan Terlihat Bagus!',
      description:
        'Rentgen sekarang memiliki permintaan yang valid untuk digunakan. Sebelum menghasilkan tes, periksa secara singkat kolom yang dipetakan untuk memastikan semuanya terlihat benar',
      confirmText: 'Periksa & Hasilkan Tes',
      doNotShowAgain: 'Jangan tampilkan lagi',
    },
    deleteFolder: {
      title: 'Hapus Folder',
      description: 'Folder ini berisi permintaan. Yakin ingin menghapusnya?',
    },
    importConflict: {
      title: 'Konflik Impor Terdeteksi',
      conflictDescription: 'Koleksi yang diimpor "{{name}}" memiliki konflik dengan koleksi Anda yang ada:',
      collectionNamesMatch: 'Nama koleksi cocok',
      folderConflicts: '{{count}} folder dengan nama yang cocok',
      requestConflicts: '{{count}} permintaan dengan URL+Metode atau nama yang cocok',
      importWarnings: 'Peringatan impor: {{count}}',
      replaceDescription: 'Ganti seluruh koleksi yang ada ({{folders}} folder, {{requests}} permintaan)',
      mergeDescription: 'Tambahkan hanya item unik (lewati duplikat berdasarkan URL+Metode atau nama)',
      newFolders: '{{count}} folder baru',
      newRequests: '{{count}} permintaan baru',
      noNewItems: 'Tidak ada item baru untuk ditambahkan',
      importAsCopy: 'Impor sebagai Salinan',
      copyDescription: 'Tambahkan semua folder dengan sufiks "(copy)" ({{folders}} folder, {{requests}} permintaan)',
    },
    setDynamicVariable: {
      title: 'Tetapkan sebagai Variabel Dinamis',
      editTitle: 'Edit Variabel Dinamis',
      variableName: 'Nama Variabel',
      variableNamePlaceholder: 'nama_variabel',
      preview: 'Pratinjau:',
      environment: 'Lingkungan',
      allEnvironments: 'Semua Lingkungan',
      untitledEnvironment: 'Lingkungan Tanpa Judul',
      selectEnvironment: 'Pilih lingkungan...',
      linkedRequest: 'Permintaan Tertaut',
      variableNameRequired: 'Nama variabel wajib diisi',
      selectorRequired: 'Selektor wajib diisi',
      selectEnvironmentError: 'Mohon pilih lingkungan',
      duplicateWarning: 'Variabel dengan nama ini sudah ada. Akan ditimpa.',
      saveVariable: 'Simpan Variabel',
      updateVariable: 'Perbarui Variabel',
    },
    projectImport: {
      title: 'Impor Proyek',
      file: 'File',
      exported: 'Diekspor',
      appVersion: 'Versi Aplikasi',
      integrity: 'Integritas',
      integrityWarning:
        'Pemeriksaan integritas file gagal. File ini mungkin telah dimodifikasi di luar Rentgen. Lanjutkan dengan hati-hati.',
      overwriteWarning: 'Ini akan menimpa SEMUA data Anda saat ini:',
      collectionsCount: 'Koleksi ({{folders}} folder, {{requests}} permintaan)',
      environmentsCount: 'Lingkungan ({{count}} lingkungan)',
      dynamicVariablesCount: 'Variabel Dinamis ({{count}} variabel)',
      historyCount: 'Riwayat ({{count}} entri)',
      settingsInfo: 'Pengaturan (tema, mesin tes, konfigurasi riwayat)',
      cannotBeUndone: 'Tindakan ini tidak dapat dibatalkan.',
      backupBefore: 'Cadangkan proyek Anda saat ini sebelum mengimpor:',
      exportedCheck: 'Diekspor ✓',
      exportCurrentProject: 'Ekspor Proyek Saat Ini',
      importProject: 'Impor Proyek',
    },
  },

  // Settings
  settings: {
    testEngine: 'Mesin Tes',
    general: 'Umum',
    themes: 'Tema',
    language: 'Bahasa',
    themesDescription: 'Personalisasi pengalaman Anda dengan tema yang sesuai dengan gaya Anda.',
    themeLight: 'Terang',
    themeDark: 'Gelap',
    cli: {
      name: 'CLI',
      intro:
        'CLI Rentgen menjalankan folder permintaan dari ekspor proyek <c>.rentgen</c>, langsung dari terminal — dibuat untuk pipeline CI dan tes smoke berbasis skrip. Ia membaca file yang sama yang dihasilkan oleh <e>Umum → Ekspor Proyek</e> dan tidak pernah menulis kembali ke dalamnya.',
      fullDocumentation: 'Dokumentasi lengkap:',
      installInPath: 'Pasang di PATH shell ({{platform}})',
      checkingStatus: 'Memeriksa status pemasangan…',
      runCli: 'Jalankan CLI',
      runCliDescription:
        'Rentgen menyediakan satu subperintah, <c>xray</c> (alias: <c>run</c>). Arahkan ke file proyek yang Anda ekspor dari aplikasi.',
      exportProject: 'Ekspor Proyek',
      noProjectFileYet: 'Belum punya file proyek? Ekspor sekarang — sama dengan tindakan <e>Umum → Ekspor Proyek</e>.',
      developmentNote: 'Selama pengembangan, panggil langsung dari repo dengan <c>npm run dev:cli -- xray …</c>.',
      options: 'Opsi',
      examples: 'Contoh',
      exampleInteractive: 'Pilih folder dan lingkungan secara interaktif:',
      exampleCi: 'Eksekusi CI berbasis skrip dengan folder dan lingkungan eksplisit, berhenti cepat:',
      exampleCiJson: 'Output yang dapat dibaca mesin untuk pipeline CI (GitHub Actions, Jenkins, notifier Slack):',
      exampleOverrideVars: 'Timpa variabel di titik panggilan (prioritas tertinggi):',
      integrityCheck: 'Pemeriksaan integritas',
      integrityCheckDescription:
        'Setiap ekspor proyek membawa checksum SHA-256 dari datanya. Saat dimuat, CLI menghitung ulang checksum. Jika cocok, eksekusi berlanjut secara diam. Jika hilang atau dimodifikasi, Anda akan melihat prompt konfirmasi di TTY atau galat di CI. <c>--skip-integrity-check</c> melewati pemeriksaan — gunakan saat Anda tahu file diedit manual dengan sengaja.',
      exitCodesTitle: 'Kode keluar',
      idempotency: 'Idempotency',
      idempotencyDescription:
        'CLI tidak pernah menulis ke file proyek. Variabel dinamis yang diekstrak dari respons disimpan di memori selama satu eksekusi, sehingga dua pemanggilan berurutan terhadap proyek yang tidak diubah menghasilkan URL, header, dan body yang identik secara byte.',
      platform: {
        macos: 'macOS',
        windows: 'Windows',
        linux: 'Linux',
      },
      status: {
        binaryUnavailable: 'Binari CLI tidak tersedia',
        binaryUnavailableReinstall: 'Pasang ulang versi Rentgen terbaru untuk mengaktifkan CLI.',
        installed: 'Terpasang',
        managedByPackageManager: ' (dikelola oleh manajer paket)',
        conflictingPath: '`rentgen` berkonflik di PATH',
        conflictingPathDescription:
          '<c>{{path}}</c> ada di PATH tetapi tidak menunjuk ke pemasangan Rentgen ini. Hapus, atau pemasangan di sini akan menutupinya.',
        notInstalled: 'Tidak terpasang',
        notInstalledDescription: 'Klik <e>Pasang</e> di bawah untuk menambahkan <c>rentgen</c> ke PATH shell Anda.',
      },
      action: {
        working: 'Memproses…',
        uninstall: 'Hapus CLI',
        reinstall: 'Pasang Ulang',
        installRentgenInPath: 'Pasang perintah rentgen di PATH',
        packageManagerNote:
          'Manajer paket Linux menangani pemasangan dan penghapusan. Gunakan <c>sudo apt remove rentgen</c> / <c>sudo dnf remove rentgen</c> untuk menghapus.',
      },
      platformTip: {
        macos:
          'macOS akan meminta kata sandi Anda untuk menulis symlink ke <c>/usr/local/bin/rentgen</c>. Setelah pemasangan, buka tab Terminal baru untuk menerapkan perubahan.',
        windows:
          'Pemasangan Windows menambahkan direktori sumber daya Rentgen ke PATH <e>pengguna</e> Anda (tidak perlu admin). Buka tab PowerShell, Command Prompt, atau Windows Terminal baru setelah pemasangan — shell yang sudah ada tidak akan melihat perubahan.',
        linux:
          'Di Linux, skrip postinstall deb/rpm secara otomatis menautkan <c>/usr/bin/rentgen</c>. Jika Anda memasang via arsip portabel, tombol ini membuat symlink pengguna di <c>/usr/local/bin/rentgen</c> (atau <c>~/.local/bin/rentgen</c> sebagai cadangan).',
      },
      flag: {
        collection: 'Folder yang akan dijalankan dari file proyek. Kosongkan untuk memilih secara interaktif.',
        env: 'Lingkungan yang digunakan. Berikan --env=none untuk menjalankan tanpa lingkungan apa pun.',
        skipIntegrityCheck: 'Lewati prompt konfirmasi checksum.',
        var: 'Timpa variabel. Dapat diulang. Prioritas tertinggi di atas lingkungan dan nilai dinamis.',
        timeout: 'Timeout per permintaan dalam milidetik. Default 30000.',
        failFast: 'Berhenti setelah kegagalan pertama.',
        report: 'Output yang dapat dibaca mesin. Didukung: json (menulis JSON ke stdout, menekan output manusia).',
        noColor: 'Nonaktifkan output berwarna.',
        verbose: 'Cetak detail lengkap permintaan/respons dan peringatkan tentang variabel yang tidak terselesaikan.',
      },
      exit: {
        code0: 'Semua permintaan berhasil.',
        code1: 'Eksekusi selesai dengan kegagalan, dibatalkan pada prompt checksum, atau diinterupsi dengan Ctrl+C.',
        code2:
          'Input tidak valid: file hilang, JSON buruk, bentuk salah, --collection / --env ambigu atau tidak dikenal, atau mode CI tanpa flag yang diperlukan.',
      },
    },
    history: {
      title: 'Riwayat',
      description: 'Konfigurasikan bagaimana riwayat permintaan dikumpulkan dan disimpan.',
      enableHistory: 'Aktifkan Riwayat',
      maximumSize: 'Ukuran Maksimum',
      retentionPeriod: 'Periode Retensi',
      week1: '1 Minggu',
      month1: '1 Bulan',
      months3: '3 Bulan',
      months6: '6 Bulan',
      year1: '1 Tahun',
      noRetention: 'Tanpa Retensi',
    },
    project: {
      title: 'Proyek',
      description:
        'Ekspor atau impor seluruh proyek Anda termasuk koleksi, lingkungan, variabel, riwayat, dan pengaturan.',
      exportProject: 'Ekspor Proyek',
      importProject: 'Impor Proyek',
    },
    configuration: {
      title: 'Konfigurasi',
      description: 'Konfigurasikan aturan dan batasan untuk menghasilkan nilai data tes acak.',
      email: 'Email',
      domain: 'Domain',
      randomEmailLength: 'Panjang Email Acak',
      enum: 'Enum',
      enumDescription: 'Masukkan semua nilai valid dipisahkan dengan ","',
      number: 'Angka',
      minimumValue: 'Nilai Minimum',
      maximumValue: 'Nilai Maksimum',
      string: 'String',
      maximumValueLength: 'Panjang Nilai Maksimum',
      randomInteger: 'Bilangan Bulat Acak',
      randomString: 'String Acak',
      length: 'Panjang',
    },
    securityTests: {
      title: 'Tes Keamanan',
      enabledCount: '{{enabled}}/{{total}} aktif',
      description: 'Aktifkan atau nonaktifkan tes keamanan individual untuk mengustomisasi pengalaman tes Anda.',
    },
    languageSection: {
      title: 'Bahasa',
      description: 'Pilih bahasa pilihan Anda untuk antarmuka aplikasi.',
      feedback:
        'Menemukan masalah terjemahan atau ingin menambahkan bahasa lain? Buat tiket dengan semua detailnya dan kami akan melakukan yang terbaik.',
      feedbackLink: 'Buka isu GitHub',
    },
  },

  // Controls
  controls: {
    sizeMB: 'Ukuran (MB)',
    sizeMax: 'Ukuran (maks {{max}} MB)',
    threads: 'Threads',
    threadsMax: 'Threads (maks 100)',
    requests: 'Permintaan',
    requestsMax: 'Total permintaan (maks 10 000)',
    mandatoryToggle: 'Aktif = Wajib → Rentgen menghasilkan tes berdasarkan pengaturan ini',
    enumLabel: 'Masukkan semua nilai valid dipisahkan dengan ","',
    numberLabel: 'Atur rentang Min/Maks untuk tes batas. 0 - bilangan bulat, 0.00 - desimal',
    stringLabel: 'Panjang maksimum nilai',
    minPlaceholder: 'Min',
    maxPlaceholder: 'Maks',
  },

  // Parameter types
  parameterTypes: {
    doNotTest: 'Jangan tes',
    randomEmail: 'Email acak',
    randomInteger: 'Bilangan bulat acak',
    randomString: 'String acak',
    boolean: 'Boolean',
    currency: 'Mata uang',
    dateYYYYMMDD: 'Tanggal (YYYY-MM-DD)',
    email: 'Email',
    enum: 'Enum',
    number: 'Angka',
    phone: 'Telepon',
    string: 'String',
    url: 'URL',
  },

  // Tables
  tables: {
    parameter: 'Parameter',
    value: 'Nilai',
    check: 'Pemeriksaan',
    method: 'Metode',
    expected: 'Diharapkan',
    actual: 'Aktual',
    result: 'Hasil',
    name: 'Nama',
    description: 'Deskripsi',
    request: 'Permintaan',
  },

  // Context Menu
  contextMenu: {
    setAsVariable: 'Tetapkan sebagai Variabel',
    saveRequestFirst: 'Simpan permintaan ke koleksi terlebih dahulu',
    setAsDynamicVariableTitle: 'Tetapkan "{{path}}" sebagai variabel dinamis',
  },

  // Badges
  badges: {
    verified: 'Terverifikasi',
    modified: 'Dimodifikasi',
    noChecksum: 'Tanpa checksum',
  },

  // File input
  fileInput: {
    chooseFile: 'Pilih File',
    noFileChosen: 'Tidak ada file dipilih',
  },

  // Protobuf
  protobuf: {
    decodedProtobuf: 'Protobuf terdekode:',
  },

  // Messages panel
  messages: {
    title: 'Pesan',
  },

  // Export format labels
  exportFormats: {
    json: 'JSON (.json)',
    markdown: 'Markdown (.md)',
    csv: 'CSV (.csv)',
  },
};

export default id;
