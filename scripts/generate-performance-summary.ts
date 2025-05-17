/**
 * Generate performance summary report from test results
 * This script processes the performance test results and generates a summary report
 */

import * as fs from 'fs';
import * as path from 'path';

// Define report output locations
const OUTPUT_DIR = path.join(process.cwd(), 'test-results', 'performance');
const SUMMARY_FILE = path.join(OUTPUT_DIR, 'performance-summary.json');
const HTML_REPORT_FILE = path.join(OUTPUT_DIR, 'performance-report.html');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Parse test results to extract performance metrics
async function parseTestResults() {
  try {
    // Get all test result files
    const testResultsDir = path.join(process.cwd(), 'test-results');
    const files = fs.readdirSync(testResultsDir).filter(file => file.endsWith('.log'));

    // Extract performance metrics from test logs
    const performanceData: Record<string, unknown> = {};

    for (const file of files) {
      const filePath = path.join(testResultsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');

      // Extract performance metrics using regex
      const metricsMatches = content.match(
        /Performance metrics for ([^:]+):\s*- Navigation Time: (\d+)ms\s*- Load Time: (\d+)ms\s*- DOM Content Loaded: (\d+)ms\s*- Largest Contentful Paint: ([0-9.]+)ms\s*- Cumulative Layout Shift: ([0-9.]+)\s*- First Input Delay: ([0-9.]+)ms/g,
      );

      if (metricsMatches) {
        for (const match of metricsMatches) {
          const singleMatch = match.match(
            /Performance metrics for ([^:]+):\s*- Navigation Time: (\d+)ms\s*- Load Time: (\d+)ms\s*- DOM Content Loaded: (\d+)ms\s*- Largest Contentful Paint: ([0-9.]+)ms\s*- Cumulative Layout Shift: ([0-9.]+)\s*- First Input Delay: ([0-9.]+)ms/,
          );

          if (singleMatch) {
            const testName = singleMatch[1].trim();
            performanceData[testName] = {
              navigationTime: parseInt(singleMatch[2], 10),
              loadTime: parseInt(singleMatch[3], 10),
              domContentLoaded: parseInt(singleMatch[4], 10),
              largestContentfulPaint: parseFloat(singleMatch[5]),
              cumulativeLayoutShift: parseFloat(singleMatch[6]),
              firstInputDelay: parseFloat(singleMatch[7]),
              timestamp: new Date().toISOString(),
              file,
            };
          }
        }
      }

      // Extract resource statistics
      const resourceMatches = content.match(/(?:page|resource) resource stats: ({[^}]+})/g);

      if (resourceMatches) {
        for (const match of resourceMatches) {
          try {
            const pageMatch = match.match(/(.+) resource stats: ({[^}]+})/);
            if (pageMatch) {
              const pageName = pageMatch[1].trim();
              const stats = JSON.parse(pageMatch[2].replace(/'/g, '"'));

              if (performanceData[pageName]) {
                performanceData[pageName].resources = stats;
              } else {
                // The resource stats might be for a page we don't have navigationTime data for
                performanceData[`${pageName} Resources`] = {
                  resources: stats,
                  timestamp: new Date().toISOString(),
                  file,
                };
              }
            }
          } catch (error) {
            console.error('Error parsing resource stats:', error);
          }
        }
      }
    }

    return performanceData;
  } catch (error) {
    console.error('Error parsing test results:', error);
    return {};
  }
}

// Generate performance summary
async function generateSummary() {
  console.log('Generating performance summary...');

  // Parse test results
  const performanceData = await parseTestResults();

  // Calculate summary statistics
  const summary = {
    timestamp: new Date().toISOString(),
    pages: performanceData,
    averages: {
      navigationTime: 0,
      loadTime: 0,
      domContentLoaded: 0,
      largestContentfulPaint: 0,
      cumulativeLayoutShift: 0,
      firstInputDelay: 0,
    },
    slowestPages: [] as Array<{ name: string; navigationTime: number }>,
    fastestPages: [] as Array<{ name: string; navigationTime: number }>,
  };

  // Calculate averages
  let pageCount = 0;
  for (const [pageName, data] of Object.entries(performanceData)) {
    if (data.navigationTime !== undefined) {
      pageCount++;
      summary.averages.navigationTime += data.navigationTime;
      summary.averages.loadTime += data.loadTime || 0;
      summary.averages.domContentLoaded += data.domContentLoaded || 0;
      summary.averages.largestContentfulPaint += data.largestContentfulPaint || 0;
      summary.averages.cumulativeLayoutShift += data.cumulativeLayoutShift || 0;
      summary.averages.firstInputDelay += data.firstInputDelay || 0;
    }
  }

  if (pageCount > 0) {
    summary.averages.navigationTime = Math.round(summary.averages.navigationTime / pageCount);
    summary.averages.loadTime = Math.round(summary.averages.loadTime / pageCount);
    summary.averages.domContentLoaded = Math.round(summary.averages.domContentLoaded / pageCount);
    summary.averages.largestContentfulPaint = Number(
      (summary.averages.largestContentfulPaint / pageCount).toFixed(2),
    );
    summary.averages.cumulativeLayoutShift = Number(
      (summary.averages.cumulativeLayoutShift / pageCount).toFixed(3),
    );
    summary.averages.firstInputDelay = Number(
      (summary.averages.firstInputDelay / pageCount).toFixed(2),
    );
  }

  // Identify slowest and fastest pages
  const pagesWithNavigation = Object.entries(performanceData)
    .filter(([_, data]) => data.navigationTime !== undefined)
    .map(([name, data]) => ({
      name,
      navigationTime: data.navigationTime,
    }))
    .sort((a, b) => b.navigationTime - a.navigationTime);

  summary.slowestPages = pagesWithNavigation.slice(0, 5);
  summary.fastestPages = [...pagesWithNavigation]
    .sort((a, b) => a.navigationTime - b.navigationTime)
    .slice(0, 5);

  // Save summary as JSON
  fs.writeFileSync(SUMMARY_FILE, JSON.stringify(summary, null, 2));
  console.log(`Summary saved to ${SUMMARY_FILE}`);

  // Generate HTML report
  generateHtmlReport(summary);

  return summary;
}

// Generate HTML report
function generateHtmlReport(summary: unknown) {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Performance Test Results</title>
  <style>
    :root {
      --primary-color: #2c3e50;
      --secondary-color: #3498db;
      --accent-color: #e74c3c;
      --gray-color: #95a5a6;
      --light-color: #ecf0f1;
      --success-color: #2ecc71;
      --warning-color: #f39c12;
      --danger-color: #e74c3c;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: var(--primary-color);
      background-color: #f9f9f9;
      margin: 0;
      padding: 20px;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      padding: 20px;
    }
    
    h1, h2, h3 {
      color: var(--primary-color);
    }
    
    h1 {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 15px;
      border-bottom: 2px solid var(--light-color);
    }
    
    .summary-card {
      background-color: var(--light-color);
      border-radius: 6px;
      padding: 20px;
      margin-bottom: 20px;
    }
    
    .metric-card {
      background-color: white;
      border-radius: 6px;
      padding: 15px;
      margin-bottom: 15px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
      display: inline-block;
      width: calc(33.333% - 20px);
      margin-right: 20px;
      vertical-align: top;
    }
    
    .metric-card:nth-child(3n) {
      margin-right: 0;
    }
    
    .metric-title {
      font-size: 14px;
      color: var(--gray-color);
      margin-bottom: 5px;
    }
    
    .metric-value {
      font-size: 24px;
      font-weight: bold;
      color: var(--secondary-color);
    }
    
    .metric-unit {
      font-size: 14px;
      color: var(--gray-color);
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    
    th, td {
      padding: 12px 15px;
      text-align: left;
      border-bottom: 1px solid var(--light-color);
    }
    
    th {
      background-color: var(--light-color);
      font-weight: 600;
    }
    
    tr:hover {
      background-color: #f5f9fc;
    }
    
    .slow {
      color: var(--danger-color);
    }
    
    .medium {
      color: var(--warning-color);
    }
    
    .fast {
      color: var(--success-color);
    }
    
    .chart-container {
      margin: 30px 0;
    }
    
    .timestamp {
      text-align: center;
      color: var(--gray-color);
      font-size: 14px;
      margin-top: 30px;
    }
    
    .tabs {
      display: flex;
      margin-bottom: 20px;
    }
    
    .tab {
      padding: 10px 20px;
      background-color: var(--light-color);
      border-radius: 6px 6px 0 0;
      cursor: pointer;
      margin-right: 5px;
    }
    
    .tab.active {
      background-color: white;
      border-top: 3px solid var(--secondary-color);
      font-weight: bold;
    }
    
    .tab-content {
      display: none;
    }
    
    .tab-content.active {
      display: block;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Performance Test Results</h1>
    
    <div class="tabs">
      <div class="tab active" data-tab="summary">Summary</div>
      <div class="tab" data-tab="details">Page Details</div>
      <div class="tab" data-tab="resources">Resources</div>
    </div>
    
    <div class="tab-content active" id="summary">
      <div class="summary-card">
        <h2>Average Performance Metrics</h2>
        <div class="metric-card">
          <div class="metric-title">Navigation Time</div>
          <div class="metric-value">${summary.averages.navigationTime} <span class="metric-unit">ms</span></div>
        </div>
        <div class="metric-card">
          <div class="metric-title">Load Time</div>
          <div class="metric-value">${summary.averages.loadTime} <span class="metric-unit">ms</span></div>
        </div>
        <div class="metric-card">
          <div class="metric-title">DOM Content Loaded</div>
          <div class="metric-value">${summary.averages.domContentLoaded} <span class="metric-unit">ms</span></div>
        </div>
        <div class="metric-card">
          <div class="metric-title">Largest Contentful Paint</div>
          <div class="metric-value">${summary.averages.largestContentfulPaint} <span class="metric-unit">ms</span></div>
        </div>
        <div class="metric-card">
          <div class="metric-title">Cumulative Layout Shift</div>
          <div class="metric-value">${summary.averages.cumulativeLayoutShift}</div>
        </div>
        <div class="metric-card">
          <div class="metric-title">First Input Delay</div>
          <div class="metric-value">${summary.averages.firstInputDelay} <span class="metric-unit">ms</span></div>
        </div>
      </div>
      
      <h2>Slowest Pages</h2>
      <table>
        <thead>
          <tr>
            <th>Page</th>
            <th>Navigation Time (ms)</th>
          </tr>
        </thead>
        <tbody>
          ${summary.slowestPages
            .map(
              page => `
            <tr>
              <td>${page.name}</td>
              <td class="slow">${page.navigationTime}</td>
            </tr>
          `,
            )
            .join('')}
        </tbody>
      </table>
      
      <h2>Fastest Pages</h2>
      <table>
        <thead>
          <tr>
            <th>Page</th>
            <th>Navigation Time (ms)</th>
          </tr>
        </thead>
        <tbody>
          ${summary.fastestPages
            .map(
              page => `
            <tr>
              <td>${page.name}</td>
              <td class="fast">${page.navigationTime}</td>
            </tr>
          `,
            )
            .join('')}
        </tbody>
      </table>
    </div>
    
    <div class="tab-content" id="details">
      <h2>Page Performance Details</h2>
      <table>
        <thead>
          <tr>
            <th>Page</th>
            <th>Navigation Time (ms)</th>
            <th>Load Time (ms)</th>
            <th>DOM Content Loaded (ms)</th>
            <th>LCP (ms)</th>
            <th>CLS</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(summary.pages)
            .filter(([_, data]) => (data as any).navigationTime !== undefined)
            .map(([name, data]) => {
              const pageData = data as any;
              return `
                <tr>
                  <td>${name}</td>
                  <td class="${getPerformanceClass(pageData.navigationTime, 1000, 3000)}">${pageData.navigationTime}</td>
                  <td class="${getPerformanceClass(pageData.loadTime, 1500, 4000)}">${pageData.loadTime}</td>
                  <td class="${getPerformanceClass(pageData.domContentLoaded, 800, 2500)}">${pageData.domContentLoaded}</td>
                  <td class="${getPerformanceClass(pageData.largestContentfulPaint, 1800, 4000)}">${pageData.largestContentfulPaint}</td>
                  <td class="${getCLSClass(pageData.cumulativeLayoutShift)}">${pageData.cumulativeLayoutShift}</td>
                </tr>
              `;
            })
            .join('')}
        </tbody>
      </table>
    </div>
    
    <div class="tab-content" id="resources">
      <h2>Resource Statistics</h2>
      <table>
        <thead>
          <tr>
            <th>Page</th>
            <th>Total Resources</th>
            <th>Total Size (KB)</th>
            <th>Resource Breakdown</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(summary.pages)
            .filter(([_, data]) => (data as any).resources !== undefined)
            .map(([name, data]) => {
              const resourceData = (data as any).resources;
              const totalSize = resourceData.totalTransferSize
                ? Math.round(resourceData.totalTransferSize / 1024)
                : 'N/A';
              const resourceBreakdown = resourceData.resourcesByType
                ? Object.entries(resourceData.resourcesByType)
                    .map(([type, count]) => `${type}: ${count}`)
                    .join(', ')
                : 'N/A';

              return `
                <tr>
                  <td>${name}</td>
                  <td>${resourceData.totalResources || 'N/A'}</td>
                  <td>${totalSize}</td>
                  <td>${resourceBreakdown}</td>
                </tr>
              `;
            })
            .join('')}
        </tbody>
      </table>
      
      <h2>Largest Resources</h2>
      <table>
        <thead>
          <tr>
            <th>Page</th>
            <th>Resource Name</th>
            <th>Type</th>
            <th>Size (KB)</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(summary.pages)
            .filter(([_, data]) => (data as any).resources?.largestResources !== undefined)
            .flatMap(([name, data]) => {
              const largestResources = (data as any).resources.largestResources || [];
              return largestResources.map((resource: unknown) => {
                const size = Math.round(resource.size / 1024);
                return `
                  <tr>
                    <td>${name}</td>
                    <td>${resource.name}</td>
                    <td>${resource.type}</td>
                    <td class="${getResourceSizeClass(size)}">${size}</td>
                  </tr>
                `;
              });
            })
            .join('')}
        </tbody>
      </table>
    </div>
    
    <div class="timestamp">
      Generated on ${new Date(summary.timestamp).toLocaleString()}
    </div>
  </div>

  <script>
    // Tab switching functionality
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        // Remove active class from all tabs
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        // Add active class to clicked tab and corresponding content
        tab.classList.add('active');
        const tabId = tab.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
      });
    });
    
    // Additional JavaScript could be added here for interactive charts, filtering, etc.
  </script>
</body>
</html>
  `;

  // Save HTML report
  fs.writeFileSync(HTML_REPORT_FILE, html);
  console.log(`HTML report saved to ${HTML_REPORT_FILE}`);
}

// Helper functions for HTML report
function getPerformanceClass(value: number, fastThreshold: number, slowThreshold: number): string {
  if (value <= fastThreshold) return 'fast';
  if (value >= slowThreshold) return 'slow';
  return 'medium';
}

function getCLSClass(value: number): string {
  if (value <= 0.1) return 'fast';
  if (value >= 0.25) return 'slow';
  return 'medium';
}

function getResourceSizeClass(sizeKB: number): string {
  if (sizeKB <= 50) return 'fast';
  if (sizeKB >= 200) return 'slow';
  return 'medium';
}

// Run the script
generateSummary()
  .then(() => {
    console.log('Performance summary generation completed.');
  })
  .catch(error => {
    console.error('Error generating performance summary:', error);
    process.exit(1);
  });
