# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [v1.2.1] - 2025-11-19

### Changed

- Build for x64, arm64 arch: mac, win, linux

### Added

- Added Github actions for build and release

### Fixed

- Fixed [#10](https://github.com/LiudasJan/Rentgen/issues/10)

### Note

💻 How to Run on macOS

macOS may block the app (“developer cannot be verified”).
To run it normally:

1. Move Rentgen.app to the Applications folder.
2. Open Terminal and run the following command:

`xattr -d com.apple.quarantine /Applications/Rentgen.app`

After this, you can launch Rentgen from Finder or Spotlight as usual.

[Unreleased]: https://github.com/LiudasJan/Rentgen/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/LiudasJan/Rentgen/releases/tag/v1.2.0
