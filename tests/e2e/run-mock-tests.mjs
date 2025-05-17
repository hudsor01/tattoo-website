/**
 * Standalone test runner for mock performance tests
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate mock performance data
 */
function generateMockPerformanceData(pageName) {
  // Generate somewhat realistic but random performance metrics
  const navigationTime = Math.floor(Math.random() * 500) + 500; // 500-1000ms
  const loadTime = navigationTime + Math.floor(Math.random() * 300) + 200; // nav time + 200-500ms
  const domContentLoaded = Math.floor(navigationTime * 0.8); // 80% of nav time
  
  return {
    pageName,
    navigationTime,
    loadTime,
    domContentLoaded,
    largestContentfulPaint: loadTime + Math.floor(Math.random() * 200), // load time + 0-200ms
    cumulativeLayoutShift: Math.random() * 0.1, // 0-0.1
    firstInputDelay: Math.floor(Math.random() * 20) + 5, // 5-25ms
    resources: {
      totalResources: Math.floor(Math.random() * 30) + 20, // 20-50 resources
      totalTransferSize: Math.floor(Math.random() * 1000000) + 500000, // 500KB-1.5MB
      resourcesByType: {
        script: Math.floor(Math.random() * 10) + 5, // 5-15 scripts
        link: Math.floor(Math.random() * 5) + 3, // 3-8 links
        img: Math.floor(Math.random() * 15) + 5, // 5-20 images
        fetch: Math.floor(Math.random() * 5) + 1, // 1-6 fetch requests
        other: Math.floor(Math.random() * 5) + 1, // 1-6 other resources
      }
    }
  };
}

/**
 * Save performance data to a report file
 */
function savePerformanceData(data, reportFile) {
  // Ensure directory exists
  const dir = path.dirname(reportFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Calculate summary statistics
  const summary = {
    timestamp: new Date().toISOString(),
    pages: data.reduce((acc, page) => {
      acc[page.pageName] = page;
      return acc;
    }, {}),
    averages: {
      navigationTime: Math.round(data.reduce((sum, page) => sum + page.navigationTime, 0) / data.length),
      loadTime: Math.round(data.reduce((sum, page) => sum + page.loadTime, 0) / data.length),
      domContentLoaded: Math.round(data.reduce((sum, page) => sum + page.domContentLoaded, 0) / data.length),
      largestContentfulPaint: Math.round(data.reduce((sum, page) => sum + page.largestContentfulPaint, 0) / data.length),
      cumulativeLayoutShift: Number((data.reduce((sum, page) => sum + page.cumulativeLayoutShift, 0) / data.length).toFixed(3)),
      firstInputDelay: Number((data.reduce((sum, page) => sum + page.firstInputDelay, 0) / data.length).toFixed(1)),
    },
    slowestPages: [...data].sort((a, b) => b.navigationTime - a.navigationTime).slice(0, 5).map(page => ({
      name: page.pageName,
      navigationTime: page.navigationTime,
    })),
    fastestPages: [...data].sort((a, b) => a.navigationTime - b.navigationTime).slice(0, 5).map(page => ({
      name: page.pageName,
      navigationTime: page.navigationTime,
    })),
  };
  
  // Write to file
  fs.writeFileSync(reportFile, JSON.stringify(summary, null, 2));
  console.log(`Performance data saved to ${reportFile}`);
  
  return summary;
}

/**
 * Generate HTML report from performance data
 */
function generateHtmlReport(summary, reportFile) {
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
          ${summary.slowestPages.map(page => `
            <tr>
              <td>${page.name}</td>
              <td class="${getPerformanceClass(page.navigationTime, 600, 800)}">${page.navigationTime}</td>
            </tr>
          `).join('')}
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
          ${summary.fastestPages.map(page => `
            <tr>
              <td>${page.name}</td>
              <td class="${getPerformanceClass(page.navigationTime, 600, 800)}">${page.navigationTime}</td>
            </tr>
          `).join('')}
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
          ${Object.entries(summary.pages).map(([name, data]) => `
            <tr>
              <td>${name}</td>
              <td class="${getPerformanceClass(data.navigationTime, 600, 800)}">${data.navigationTime}</td>
              <td class="${getPerformanceClass(data.loadTime, 800, 1200)}">${data.loadTime}</td>
              <td class="${getPerformanceClass(data.domContentLoaded, 500, 700)}">${data.domContentLoaded}</td>
              <td class="${getPerformanceClass(data.largestContentfulPaint, 1000, 1500)}">${data.largestContentfulPaint}</td>
              <td class="${getCLSClass(data.cumulativeLayoutShift)}">${data.cumulativeLayoutShift.toFixed(3)}</td>
            </tr>
          `).join('')}
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
          ${Object.entries(summary.pages).map(([name, data]) => {
            const totalSize = Math.round(data.resources.totalTransferSize / 1024);
            const resourceBreakdown = Object.entries(data.resources.resourcesByType)
              .map(([type, count]) => `${type}: ${count}`)
              .join(', ');
            
            return `
              <tr>
                <td>${name}</td>
                <td>${data.resources.totalResources}</td>
                <td>${totalSize}</td>
                <td>${resourceBreakdown}</td>
              </tr>
            `;
          }).join('')}
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
  </script>
</body>
</html>
  `;
  
  // Write to file
  fs.writeFileSync(reportFile, html);
  console.log(`HTML report saved to ${reportFile}`);
}

/**
 * Helper function for HTML report
 */
function getPerformanceClass(value, fastThreshold, slowThreshold) {
  if (value <= fastThreshold) return 'fast';
  if (value >= slowThreshold) return 'slow';
  return 'medium';
}

/**
 * Helper function for HTML report
 */
function getCLSClass(value) {
  if (value <= 0.1) return 'fast';
  if (value >= 0.25) return 'slow';
  return 'medium';
}

// Run mock tests for different pages
console.log('Running mock performance tests...');

// Store all test data
const allPageData = [];

// Define pages to test
const pagesToTest = [
  'Home Page Initial Load',
  'Services Page Initial Load',
  'Gallery Page Initial Load',
  'Booking Page Initial Load',
  'Contact Page Initial Load',
  'Admin Dashboard Initial Load',
  'Mobile Home Page Load',
  'FAQ Page Initial Load'
];

// Run tests for each page
pagesToTest.forEach(pageName => {
  console.log(`Testing ${pageName}...`);
  const mockData = generateMockPerformanceData(pageName);
  allPageData.push(mockData);
  
  // Log results
  console.log(`Performance metrics for ${pageName}:`);
  console.log(`- Navigation Time: ${mockData.navigationTime}ms`);
  console.log(`- Load Time: ${mockData.loadTime}ms`);
  console.log(`- DOM Content Loaded: ${mockData.domContentLoaded}ms`);
  console.log(`- Largest Contentful Paint: ${mockData.largestContentfulPaint}ms`);
  console.log(`- Cumulative Layout Shift: ${mockData.cumulativeLayoutShift.toFixed(3)}`);
  console.log(`- First Input Delay: ${mockData.firstInputDelay}ms`);
  console.log('');
});

// Save results to JSON file
const jsonReportPath = path.join(process.cwd(), 'test-results', 'mock-performance-summary.json');
const summary = savePerformanceData(allPageData, jsonReportPath);

// Generate HTML report
const htmlReportPath = path.join(process.cwd(), 'test-results', 'mock-performance-report.html');
generateHtmlReport(summary, htmlReportPath);

console.log('All tests completed successfully!');
console.log(`JSON Report: ${jsonReportPath}`);
console.log(`HTML Report: ${htmlReportPath}`);
