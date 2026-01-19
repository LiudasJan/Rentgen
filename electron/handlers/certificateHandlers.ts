import { BrowserWindow, dialog, ipcMain } from 'electron';
import * as fs from 'fs';
import {
  ARRAY_LIST_WITHOUT_PAGINATION_TEST_NAME,
  AUTHORIZATION_TEST_NAME,
  CACHE_CONTROL_PRIVATE_API_TEST_NAME,
  CLICKJACKING_PROTECTION_TEST_NAME,
  HSTS_STRICT_TRANSPORT_SECURITY_TEST_NAME,
  LARGE_PAYLOAD_TEST_NAME,
  LOAD_TEST_NAME,
  MEDIAN_RESPONSE_TIME_TEST_NAME,
  MIME_SNIFFING_PROTECTION_TEST_NAME,
  NO_SENSITIVE_SERVER_HEADERS_TEST_NAME,
  NOT_FOUND_TEST_NAME,
  OPTIONS_METHOD_HANDLING_TEST_NAME,
  PING_LATENCY_TEST_NAME,
  RESPONSE_SIZE_CHECK_TEST_NAME,
  UNSUPPORTED_METHOD_TEST_NAME,
  UPPERCASE_PATH_TEST_NAME,
} from '../../src/tests';
import { ExportResult, TestResults, TestStatus } from '../../src/types';

interface TestPenalty {
  name: string;
  penalties: { status: TestStatus; points: number; count5xx?: boolean }[];
}

const TEST_PENALTIES: TestPenalty[] = [
  {
    name: MIME_SNIFFING_PROTECTION_TEST_NAME,
    penalties: [{ status: TestStatus.Fail, points: 12 }],
  },
  {
    name: OPTIONS_METHOD_HANDLING_TEST_NAME,
    penalties: [
      { status: TestStatus.Fail, points: 12 },
      { status: TestStatus.Bug, points: 0, count5xx: true },
    ],
  },
  {
    name: UNSUPPORTED_METHOD_TEST_NAME,
    penalties: [
      { status: TestStatus.Fail, points: 12 },
      { status: TestStatus.Bug, points: 0, count5xx: true },
    ],
  },
  {
    name: AUTHORIZATION_TEST_NAME,
    penalties: [
      { status: TestStatus.Fail, points: 12 },
      { status: TestStatus.Bug, points: 0, count5xx: true },
    ],
  },
  {
    name: NOT_FOUND_TEST_NAME,
    penalties: [
      { status: TestStatus.Fail, points: 10 },
      { status: TestStatus.Bug, points: 0, count5xx: true },
    ],
  },
  {
    name: UPPERCASE_PATH_TEST_NAME,
    penalties: [
      { status: TestStatus.Fail, points: 10 },
      { status: TestStatus.Bug, points: 0, count5xx: true },
    ],
  },
  {
    name: LARGE_PAYLOAD_TEST_NAME,
    penalties: [
      { status: TestStatus.Fail, points: 6 },
      { status: TestStatus.Bug, points: 0, count5xx: true },
    ],
  },
  {
    name: NO_SENSITIVE_SERVER_HEADERS_TEST_NAME,
    penalties: [{ status: TestStatus.Fail, points: 3 }],
  },
  {
    name: CACHE_CONTROL_PRIVATE_API_TEST_NAME,
    penalties: [{ status: TestStatus.Fail, points: 3 }],
  },
  {
    name: CLICKJACKING_PROTECTION_TEST_NAME,
    penalties: [{ status: TestStatus.Warning, points: 2 }],
  },
  {
    name: HSTS_STRICT_TRANSPORT_SECURITY_TEST_NAME,
    penalties: [{ status: TestStatus.Warning, points: 2 }],
  },
  {
    name: PING_LATENCY_TEST_NAME,
    penalties: [{ status: TestStatus.Fail, points: 12 }],
  },
  {
    name: MEDIAN_RESPONSE_TIME_TEST_NAME,
    penalties: [
      { status: TestStatus.Fail, points: 10 },
      { status: TestStatus.Warning, points: 4 },
    ],
  },
  {
    name: RESPONSE_SIZE_CHECK_TEST_NAME,
    penalties: [
      { status: TestStatus.Fail, points: 6 },
      { status: TestStatus.Warning, points: 6 },
    ],
  },
  {
    name: ARRAY_LIST_WITHOUT_PAGINATION_TEST_NAME,
    penalties: [{ status: TestStatus.Warning, points: 8 }],
  },
  {
    name: LOAD_TEST_NAME,
    penalties: [
      { status: TestStatus.Fail, points: 10 },
      { status: TestStatus.Warning, points: 5 },
      { status: TestStatus.Bug, points: 0, count5xx: true },
    ],
  },
];

const BADGE_LEVELS = [
  { minScore: 85, name: 'GOLD', rule: 'score ≥ 85' },
  { minScore: 70, name: 'SILVER', rule: 'score 70-84' },
  { minScore: 55, name: 'BRONZE', rule: 'score 55-69' },
];

const CANVAS_WIDTH = 1600;
const CANVAS_HEIGHT = 900;

export function registerCertificateHandlers(): void {
  ipcMain.handle('generate-certificate', async (_, results: TestResults): Promise<ExportResult> => {
    const { dataDrivenTests, domain, count, performanceTests, securityTests, timestamp } = results;
    const appliedPenalties: { title: string; points: number }[] = [];

    let score = 100;
    let tests5xxCount = 0;
    let tests5xxPenalty = 0;

    for (const testPenalty of TEST_PENALTIES) {
      const test = [...securityTests, ...performanceTests].find((testResult) => testResult.name === testPenalty.name);
      if (!test) continue;

      for (const penalty of testPenalty.penalties) {
        if (test.status === penalty.status) {
          score -= penalty.points;

          if (penalty.points > 0) appliedPenalties.push({ title: testPenalty.name, points: penalty.points });
          if (penalty.count5xx) tests5xxCount += 1;
        }
      }
    }

    tests5xxCount += dataDrivenTests.filter((testResult) => testResult.status === TestStatus.Bug).length;
    if (tests5xxCount > 5) tests5xxPenalty = 50;
    else if (tests5xxCount > 2) tests5xxPenalty = 25;
    else if (tests5xxCount > 0) tests5xxPenalty = 15;

    if (tests5xxPenalty > 0) {
      score -= tests5xxPenalty;
      appliedPenalties.push({ title: `5xx Errors`, points: tests5xxPenalty });
    }
    const badge = BADGE_LEVELS.find((badgeLevel) => score >= badgeLevel.minScore) ?? {
      name: 'No Certificate',
      rule: 'score < 55',
    };

    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Rentgen Certificate</title>
        <style>
          :root {
            --bg: #050814;
            --bg-alt: #0b1020;
            --bg-accent: #10172a;
            --fg: #f9fafb;
            --fg-muted: #9ca3af;
            --accent: #ff6a2c;
            --accent-soft: rgba(255, 106, 44, 0.12);
            --border-subtle: rgba(148, 163, 184, 0.3);
            --radius-lg: 18px;
            --radius-xl: 24px;
            --shadow-soft: 0 18px 45px rgba(15, 23, 42, 0.7);
            --font-sans: system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text",
              "Inter", "Segoe UI", sans-serif;
          }

          *,
          *::before,
          *::after { box-sizing: border-box; }

          html, body {
            margin: 0;
            padding: 0;
            height: 100%;
          }

          body {
            font-family: var(--font-sans);
            color: var(--fg);
            -webkit-font-smoothing: antialiased;
            text-rendering: optimizeLegibility;
            background: radial-gradient(circle at top, #111827 0, var(--bg) 55%);
          }

          .canvas {
            width: 1600px;
            height: 900px;
            position: relative;
            overflow: hidden;
            padding: 64px;
          }

          .bg-glow {
            position: absolute;
            inset: -40%;
            background:
              radial-gradient(circle at 25% 20%, rgba(255, 106, 44, 0.22), transparent 45%),
              radial-gradient(circle at 80% 30%, rgba(99, 102, 241, 0.12), transparent 55%),
              radial-gradient(circle at 50% 90%, rgba(56, 189, 248, 0.08), transparent 55%);
            filter: blur(12px);
            pointer-events: none;
          }

          .certificate {
            position: relative;
            height: 100%;
            border-radius: var(--radius-xl);
            border: 1px solid rgba(148, 163, 184, 0.22);
            background: linear-gradient(135deg, rgba(2, 6, 23, 0.92), rgba(17, 24, 39, 0.70));
            box-shadow: var(--shadow-soft);
            backdrop-filter: blur(16px);
            display: flex;
            flex-direction: column;
            padding: 40px;
          }

          .cert-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 24px;
            padding-bottom: 22px;
            border-bottom: 1px solid rgba(148, 163, 184, 0.18);
          }

          .brand {
            display: flex;
            align-items: center;
            gap: 14px;
            min-width: 0;
          }

          .brand-logo {
            width: 44px;
            height: 44px;
            border-radius: 999px;
            flex: 0 0 auto;
            box-shadow: 0 10px 28px rgba(0,0,0,0.35);
          }

          .brand-text { min-width: 0; }
          .brand-title {
            font-weight: 700;
            letter-spacing: 0.08em;
            font-size: 14px;
            text-transform: uppercase;
            color: rgba(249, 250, 251, 0.92);
          }

          .brand-subtitle {
            margin-top: 4px;
            font-size: 14px;
            color: var(--fg-muted);
          }

          .badge-pill {
            border-radius: 999px;
            border: 1px solid rgba(148, 163, 184, 0.25);
            background: rgba(15, 23, 42, 0.55);
            padding: 12px 16px;
            display: inline-flex;
            align-items: baseline;
            gap: 12px;
            text-align: right;
          }

          .badge-label {
            font-weight: 800;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            font-size: 14px;
          }

          .badge-rule {
            font-size: 12px;
            color: rgba(249, 250, 251, 0.72);
            white-space: nowrap;
          }

          .badge-GOLD {
            border-color: rgba(255, 196, 61, 0.40);
            background: linear-gradient(180deg, rgba(255, 196, 61, 0.12), rgba(15, 23, 42, 0.55));
          }

          .badge-GOLD .badge-label { color: rgba(255, 218, 110, 0.95); }

          .badge-SILVER {
            border-color: rgba(203, 213, 225, 0.40);
            background: linear-gradient(180deg, rgba(203, 213, 225, 0.10), rgba(15, 23, 42, 0.55));
          }
          .badge-SILVER .badge-label { color: rgba(226, 232, 240, 0.95); }

          .badge-BRONZE {
            border-color: rgba(251, 146, 60, 0.40);
            background: linear-gradient(180deg, rgba(251, 146, 60, 0.12), rgba(15, 23, 42, 0.55));
          }
          .badge-BRONZE .badge-label { color: rgba(253, 186, 116, 0.95); }

          .cert-body {
            display: grid;
            grid-template-columns: 1.05fr 1fr;
            gap: 28px;
            padding-top: 28px;
            flex: 1;
          }

          .left, .right { min-width: 0; }

          .score-block {
            margin-top: 6px;
          }

          .score-big {
            font-size: 92px;
            font-weight: 800;
            letter-spacing: -0.03em;
            line-height: 1;
          }

          .score-small {
            margin-top: 8px;
            font-size: 14px;
            color: rgba(249, 250, 251, 0.74);
          }

          .meta {
            margin-top: 26px;
            border-radius: var(--radius-lg);
            border: 1px solid rgba(148, 163, 184, 0.18);
            background: rgba(15, 23, 42, 0.42);
            padding: 16px 18px;
          }

          .meta-row {
            display: flex;
            align-items: baseline;
            justify-content: space-between;
            gap: 18px;
            padding: 10px 0;
            border-bottom: 1px solid rgba(148, 163, 184, 0.14);
          }

          .meta-row:last-child { border-bottom: none; }

          .meta-k {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: rgba(249, 250, 251, 0.60);
          }

          .meta-v {
            font-size: 16px;
            font-weight: 650;
            color: rgba(249, 250, 251, 0.92);
            max-width: 62%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            text-align: right;
          }

          .note {
            margin-top: 18px;
            font-size: 13px;
            color: rgba(156, 163, 175, 0.95);
          }

          .findings-card {
            border-radius: var(--radius-xl);
            border: 1px solid rgba(148, 163, 184, 0.18);
            background:
              radial-gradient(circle at 30% 0%, rgba(255, 106, 44, 0.10), transparent 55%),
              rgba(15, 23, 42, 0.42);
            padding: 20px 22px;
          }

          .findings-title {
            font-weight: 750;
            font-size: 16px;
            margin-bottom: 14px;
          }

          .findings {
            margin: 0;
            padding-left: 18px;
            display: grid;
            gap: 12px;
          }

          .findings li {
            display: flex;
            justify-content: space-between;
            gap: 14px;
            line-height: 1.35;
          }

          .f-title {
            font-size: 15px;
            color: rgba(249, 250, 251, 0.92);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            max-width: 78%;
          }

          .f-minus {
            font-size: 14px;
            color: rgba(249, 250, 251, 0.70);
            flex: 0 0 auto;
          }

          .findings-foot {
            margin-top: 16px;
            font-size: 12px;
            color: rgba(156, 163, 175, 0.9);
            line-height: 1.5;
          }

          .cert-id {
            margin-top: 14px;
            font-size: 12px;
            color: rgba(156, 163, 175, 0.9);
          }

          .mono {
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
            color: rgba(249, 250, 251, 0.82);
          }

          .cert-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 18px;
            padding-top: 18px;
            border-top: 1px solid rgba(148, 163, 184, 0.18);
            font-size: 12px;
            color: rgba(156, 163, 175, 0.95);
          }

          .footer-right {
            color: rgba(249, 250, 251, 0.75);
          }
        </style>
      </head>
      <body>
        <div class="canvas">
          <div class="bg-glow"></div>
          <section class="certificate">
            <header class="cert-header">
              <div class="brand">
                <img class="brand-logo" src="https://rentgen.io/assets/rentgen-logo.png" alt="Rentgen logo" />
                <div class="brand-text">
                  <div class="brand-title">RENTGEN CERTIFICATE</div>
                  <div class="brand-subtitle">Local-first API quality signal</div>
                </div>
              </div>
              <div class="badge-pill badge-${badge.name}">
                <span class="badge-label">${badge.name}</span>
                <span class="badge-rule">
                  ${badge.rule}
                </span>
              </div>
            </header>
            <div class="cert-body">
              <div class="left">
                <div class="score-block">
                  <div class="score-big">${score}%</div>
                  <div class="score-small">Score ${score}/100</div>
                </div>
                <div class="meta">
                  <div class="meta-row">
                    <span class="meta-k">API Domain</span>
                    <span class="meta-v">${domain}</span>
                  </div>
                  <div class="meta-row">
                    <span class="meta-k">Tests generated</span>
                    <span class="meta-v">${count}</span>
                  </div>
                  <div class="meta-row">
                    <span class="meta-k">Test date</span>
                    <span class="meta-v">${new Date(timestamp).toLocaleString()}</span>
                  </div>
                </div>
                <div class="note">
                  Secure API testing that never leaves your machine.
                </div>
              </div>
              <div class="right">
                <div class="findings-card">
                  <div class="findings-title">Top findings</div>
                  <ol class="findings">
                    ${appliedPenalties
                      .sort((a, b) => b.points - a.points)
                      .slice(0, 3)
                      .map(
                        ({ title, points }) => `
                      <li>
                        <span class="f-title">${title}</span>
                        <span class="f-minus">(-${points})</span>
                      </li>
                    `,
                      )
                      .join('')}
                  </ol>
                  <div class="findings-foot">
                    Biggest deductions first. Score starts at 100 and only drops on real signals.
                  </div>
                </div>
                <div class="cert-id">
                  Timestamp: <span class="mono">${new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}</span>
                </div>
              </div>
            </div>
            <footer class="cert-footer">
              <div class="footer-left">
                Generated by Rentgen (local-only scan)
              </div>
              <div class="footer-right">
                rentgen.io
              </div>
            </footer>
          </section>
        </div>
      </body>
    </html>
  `;

    const win = new BrowserWindow({
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      show: false,
      webPreferences: { offscreen: true },
    });

    try {
      await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);

      const { canceled, filePath } = await dialog.showSaveDialog({
        defaultPath: `rentgen-certificate-${new Date().toISOString().replace(/\D/g, '').slice(0, 14)}.pdf`,
        filters: [{ name: 'Rentgen Certificate (PDF)', extensions: ['pdf'] }],
      });

      if (canceled || !filePath) return { canceled: true };

      const pdf = await win.webContents.printToPDF({
        pageSize: {
          width: CANVAS_WIDTH / 96, // Convert pixels to inches (96 DPI)
          height: CANVAS_HEIGHT / 96,
        },
        margins: { top: 0, bottom: 0, left: 0, right: 0 },
        printBackground: true,
        preferCSSPageSize: true,
      });

      fs.writeFileSync(filePath, pdf);
      return { success: true, filePath };
    } catch (error) {
      return { error: String(error) };
    } finally {
      win.destroy();
    }
  });
}
