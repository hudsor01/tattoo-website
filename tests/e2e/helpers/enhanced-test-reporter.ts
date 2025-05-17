import * as fs from 'fs';
import * as path from 'path';
import { FullConfig, Reporter, Suite, TestCase, TestResult } from '@playwright/test/reporter';

/**
 * Enhanced test reporter for E2E tests
 * Generates detailed HTML reports with test results, timing, and screenshots
 */
export class EnhancedTestReporter implements Reporter {
  private results: Map<string, TestResultData> = new Map();
  private startTime: number = Date.now();
  private config: FullConfig | undefined;
  private reportDir: string;

  constructor() {
    // Create unique report directory with timestamp
    const timestamp = new Date().toISOString().replace(/[:]/g, '-').split('.')[0];
    this.reportDir = path.join(process.cwd(), 'test-results', `report-${timestamp}`);

    // Create report directory structure
    this.ensureDirectoryExists(this.reportDir);
    this.ensureDirectoryExists(path.join(this.reportDir, 'screenshots'));
    this.ensureDirectoryExists(path.join(this.reportDir, 'traces'));
    this.ensureDirectoryExists(path.join(this.reportDir, 'videos'));
  }

  onBegin(config: FullConfig, suite: Suite): void {
    this.config = config;
    this.startTime = Date.now();

    // Log test run start
    this.logMessage(`Test run started with ${suite.allTests().length} tests`);

    // Write summary info
    const summaryData = {
      startTime: new Date().toISOString(),
      totalTests: suite.allTests().length,
      browserName: config.projects[0]?.name || 'unknown',
      timestamp: Date.now(),
    };

    fs.writeFileSync(
      path.join(this.reportDir, 'summary.json'),
      JSON.stringify(summaryData, null, 2),
    );
  }

  onTestBegin(test: TestCase): void {
    const testResultData: TestResultData = {
      title: test.title,
      file: test.location.file,
      line: test.location.line,
      column: test.location.column,
      status: 'running',
      duration: 0,
      startTime: Date.now(),
      endTime: 0,
      error: null,
      attachments: [],
      steps: [],
    };

    this.results.set(this.getTestId(test), testResultData);
    this.logMessage(`Test started: ${test.title}`);
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    const testId = this.getTestId(test);
    const testData = this.results.get(testId);

    if (testData) {
      // Update test data
      testData.status = result.status;
      testData.duration = result.duration;
      testData.endTime = Date.now();

      if (result.error) {
        testData.error = {
          message: result.error.message,
          stack: result.error.stack,
        };
      }

      // Process attachments (screenshots, videos, traces)
      if (result.attachments) {
        for (const attachment of result.attachments) {
          if (attachment.path) {
            const filename = path.basename(attachment.path);
            const destPath = path.join(
              this.reportDir,
              attachment.name === 'screenshot'
                ? 'screenshots'
                : attachment.name === 'video'
                  ? 'videos'
                  : attachment.name === 'trace'
                    ? 'traces'
                    : 'attachments',
              `${testId}-${filename}`,
            );

            try {
              // Copy attachment to report directory
              fs.copyFileSync(attachment.path, destPath);

              testData.attachments.push({
                name: attachment.name,
                contentType: attachment.contentType,
                path: path.relative(this.reportDir, destPath),
              });
            } catch (error) {
              this.logMessage(`Failed to copy attachment: ${error}`);
            }
          }
        }
      }

      this.results.set(testId, testData);
      this.logMessage(`Test ended: ${test.title} (${result.status})`);
    }
  }

  onStepBegin(test: TestCase, result: TestResult, step: unknown): void {
    const testId = this.getTestId(test);
    const testData = this.results.get(testId);

    if (testData) {
      testData.steps.push({
        title: step.title,
        status: 'running',
      });
    }
  }

  onStepEnd(test: TestCase, result: TestResult, step: unknown): void {
    const testId = this.getTestId(test);
    const testData = this.results.get(testId);

    if (testData) {
      const stepIndex = testData.steps.findIndex(
        s => s.title === step.title && s.status === 'running',
      );
      if (stepIndex >= 0) {
        testData.steps[stepIndex].status = step.error ? 'failed' : 'passed';
      }
    }
  }

  onEnd(result: { status: 'passed' | 'failed' | 'timedout' }): void {
    const endTime = Date.now();
    const totalDuration = endTime - this.startTime;

    // Generate stats
    const stats = this.generateStats();

    // Generate HTML report
    this.generateHTMLReport(stats, totalDuration);

    // Generate JSON report
    this.generateJSONReport(stats, totalDuration);

    this.logMessage(`Test run completed in ${Math.round(totalDuration / 1000)}s`);
    this.logMessage(`Passed: ${stats.passed}, Failed: ${stats.failed}, Skipped: ${stats.skipped}`);
    this.logMessage(`Report generated at: ${this.reportDir}`);
  }

  private getTestId(test: TestCase): string {
    // Generate a unique ID for the test
    return `${path.basename(test.location.file).replace('.spec.ts', '')}-${test.title.replace(/\s+/g, '-')}`;
  }

  private ensureDirectoryExists(dir: string): void {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private logMessage(message: string): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;

    // Log to console
    console.log(logMessage);

    // Append to log file
    const logFile = path.join(this.reportDir, 'test-run.log');
    fs.appendFileSync(logFile, logMessage + '\n');
  }

  private generateStats(): TestStats {
    let passed = 0;
    let failed = 0;
    let skipped = 0;
    let flaky = 0;

    this.results.forEach(result => {
      if (result.status === 'passed') passed++;
      else if (result.status === 'failed') failed++;
      else if (result.status === 'skipped') skipped++;

      // Detect potential flaky tests (this would need more data over time)
      if (result.status === 'passed' && result.error) {
        flaky++;
      }
    });

    return {
      passed,
      failed,
      skipped,
      flaky,
      total: this.results.size,
    };
  }

  private generateHTMLReport(stats: TestStats, totalDuration: number): void {
    const reportPath = path.join(this.reportDir, 'report.html');

    let html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>E2E Test Report</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; color: #333; }
          h1, h2, h3 { color: #444; }
          .header { background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
          .stats { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px; }
          .stat-card { flex: 1; min-width: 150px; padding: 15px; background-color: #f5f5f5; border-radius: 5px; text-align: center; }
          .passed { color: #388e3c; }
          .failed { color: #d32f2f; }
          .skipped { color: #f57c00; }
          .flaky { color: #7b1fa2; }
          .test-case { margin-bottom: 15px; padding: 15px; border-radius: 5px; border: 1px solid #ddd; }
          .test-case.passed { border-left: 5px solid #388e3c; }
          .test-case.failed { border-left: 5px solid #d32f2f; }
          .test-case.skipped { border-left: 5px solid #f57c00; }
          .test-title { font-weight: bold; margin-bottom: 10px; }
          .test-file { color: #666; margin-bottom: 5px; font-family: monospace; font-size: 0.9em; }
          .test-duration { color: #666; font-size: 0.9em; }
          .test-error { background-color: #ffebee; padding: 10px; border-radius: 3px; margin-top: 10px; white-space: pre-wrap; font-family: monospace; overflow-x: auto; }
          .test-attachments { margin-top: 15px; }
          .attachment { margin-bottom: 10px; }
          .attachment-image { margin-top: 5px; }
          .attachment-image img { max-width: 500px; border: 1px solid #ddd; border-radius: 3px; }
          .filters { margin-bottom: 20px; }
          .filter-button { margin-right: 5px; padding: 5px 10px; border: none; border-radius: 3px; background-color: #f5f5f5; cursor: pointer; }
          .filter-button.active { background-color: #2196f3; color: white; }
          .hidden { display: none; }
          .test-steps { margin-top: 10px; font-size: 0.9em; }
          .test-step { padding: 5px; border-left: 3px solid #ccc; margin-bottom: 2px; }
          .test-step.passed { border-left-color: #388e3c; }
          .test-step.failed { border-left-color: #d32f2f; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>E2E Test Report</h1>
          <p>Run completed at: ${new Date().toISOString()}</p>
          <p>Total duration: ${Math.round(totalDuration / 1000)}s</p>
        </div>
        
        <div class="stats">
          <div class="stat-card">
            <h2>Total</h2>
            <div class="stat-value">${stats.total}</div>
          </div>
          <div class="stat-card">
            <h2>Passed</h2>
            <div class="stat-value passed">${stats.passed}</div>
          </div>
          <div class="stat-card">
            <h2>Failed</h2>
            <div class="stat-value failed">${stats.failed}</div>
          </div>
          <div class="stat-card">
            <h2>Skipped</h2>
            <div class="stat-value skipped">${stats.skipped}</div>
          </div>
          <div class="stat-card">
            <h2>Flaky</h2>
            <div class="stat-value flaky">${stats.flaky}</div>
          </div>
        </div>
        
        <div class="filters">
          <button class="filter-button active" data-filter="all">All</button>
          <button class="filter-button" data-filter="passed">Passed</button>
          <button class="filter-button" data-filter="failed">Failed</button>
          <button class="filter-button" data-filter="skipped">Skipped</button>
        </div>
        
        <h2>Test Results</h2>
    `;

    // Sort tests: failed first, then others
    const sortedResults = Array.from(this.results.entries()).sort(([, a], [, b]) => {
      if (a.status === 'failed' && b.status !== 'failed') return -1;
      if (a.status !== 'failed' && b.status === 'failed') return 1;
      if (a.status === 'passed' && b.status === 'skipped') return -1;
      if (a.status === 'skipped' && b.status === 'passed') return 1;
      return 0;
    });

    // Add test cases to HTML
    for (const [testId, result] of sortedResults) {
      html += `
        <div class="test-case ${result.status}" data-status="${result.status}">
          <div class="test-title">${result.title}</div>
          <div class="test-file">${result.file}:${result.line}:${result.column}</div>
          <div class="test-duration">Duration: ${Math.round(result.duration)}ms</div>
          <div class="test-status">Status: ${result.status}</div>
      `;

      // Add steps
      if (result.steps.length > 0) {
        html += `<div class="test-steps">`;
        for (const step of result.steps) {
          html += `<div class="test-step ${step.status}">${step.title}</div>`;
        }
        html += `</div>`;
      }

      // Add error details if present
      if (result.error) {
        html += `
          <div class="test-error">
            <strong>Error:</strong> ${result.error.message}
            ${result.error.stack ? `<div>${result.error.stack}</div>` : ''}
          </div>
        `;
      }

      // Add attachments
      if (result.attachments.length > 0) {
        html += `<div class="test-attachments">`;

        // Group attachments by type
        const screenshots = result.attachments.filter(a => a.name === 'screenshot');
        const videos = result.attachments.filter(a => a.name === 'video');
        const traces = result.attachments.filter(a => a.name === 'trace');
        const others = result.attachments.filter(
          a => !['screenshot', 'video', 'trace'].includes(a.name),
        );

        // Add screenshots
        if (screenshots.length > 0) {
          html += `<div class="attachment"><strong>Screenshots:</strong>`;
          for (const screenshot of screenshots) {
            html += `
              <div class="attachment-image">
                <img src="${screenshot.path}" alt="Screenshot" />
              </div>
            `;
          }
          html += `</div>`;
        }

        // Add videos
        if (videos.length > 0) {
          html += `<div class="attachment"><strong>Videos:</strong>`;
          for (const video of videos) {
            html += `
              <div>
                <a href="${video.path}" target="_blank">View Video</a>
              </div>
            `;
          }
          html += `</div>`;
        }

        // Add traces
        if (traces.length > 0) {
          html += `<div class="attachment"><strong>Traces:</strong>`;
          for (const trace of traces) {
            html += `
              <div>
                <a href="${trace.path}" target="_blank">View Trace</a>
              </div>
            `;
          }
          html += `</div>`;
        }

        // Add other attachments
        if (others.length > 0) {
          html += `<div class="attachment"><strong>Other Attachments:</strong>`;
          for (const attachment of others) {
            html += `
              <div>
                <a href="${attachment.path}" target="_blank">${attachment.name}</a>
              </div>
            `;
          }
          html += `</div>`;
        }

        html += `</div>`;
      }

      html += `</div>`;
    }

    // Add JavaScript for filtering
    html += `
      <script>
        document.addEventListener('DOMContentLoaded', function() {
          const filterButtons = document.querySelectorAll('.filter-button');
          const testCases = document.querySelectorAll('.test-case');
          
          filterButtons.forEach(button => {
            button.addEventListener('click', function() {
              // Update active state
              filterButtons.forEach(btn => btn.classList.remove('active'));
              this.classList.add('active');
              
              // Apply filter
              const filter = this.getAttribute('data-filter');
              testCases.forEach(testCase => {
                if (filter === 'all' || testCase.getAttribute('data-status') === filter) {
                  testCase.classList.remove('hidden');
                } else {
                  testCase.classList.add('hidden');
                }
              });
            });
          });
        });
      </script>
    `;

    html += `
      </body>
      </html>
    `;

    fs.writeFileSync(reportPath, html);
  }

  private generateJSONReport(stats: TestStats, totalDuration: number): void {
    const reportPath = path.join(this.reportDir, 'report.json');

    const report = {
      stats,
      totalDuration,
      timestamp: new Date().toISOString(),
      results: Object.fromEntries(this.results),
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  }
}

// Types
interface TestResultData {
  title: string;
  file: string;
  line: number;
  column: number;
  status: 'passed' | 'failed' | 'skipped' | 'running';
  duration: number;
  startTime: number;
  endTime: number;
  error: {
    message: string;
    stack?: string;
  } | null;
  attachments: {
    name: string;
    contentType?: string;
    path: string;
  }[];
  steps: {
    title: string;
    status: 'passed' | 'failed' | 'running';
  }[];
}

interface TestStats {
  passed: number;
  failed: number;
  skipped: number;
  flaky: number;
  total: number;
}
