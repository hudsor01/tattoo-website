#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the JSON report
const reportPath = path.join(__dirname, 'test-report.json');
if (!fs.existsSync(reportPath)) {
  console.error('❌ Test report not found. Run tests first.');
  process.exit(1);
}

const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
const screenshotsDir = path.join(__dirname, 'screenshots');

// Create HTML report
const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tattoo Website Test Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      text-align: center;
      margin-bottom: 30px;
      color: #2d3748;
    }
    .summary {
      background-color: #f7fafc;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 30px;
      display: flex;
      justify-content: space-around;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    .summary-item {
      text-align: center;
    }
    .summary-item .value {
      font-size: 2.5em;
      font-weight: bold;
    }
    .summary-item.passed .value {
      color: #38a169;
    }
    .summary-item.failed .value {
      color: #e53e3e;
    }
    .summary-item.total .value {
      color: #3182ce;
    }
    .summary-item.rate .value {
      color: #805ad5;
    }
    .summary-item .label {
      font-size: 0.9em;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #718096;
    }
    .test-list {
      list-style: none;
      padding: 0;
    }
    .test-item {
      background-color: white;
      border-radius: 8px;
      padding: 15px 20px;
      margin-bottom: 15px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.05);
      border-left: 5px solid;
    }
    .test-item.passed {
      border-left-color: #38a169;
    }
    .test-item.failed {
      border-left-color: #e53e3e;
    }
    .test-name {
      font-weight: bold;
      font-size: 1.1em;
      margin-bottom: 5px;
      display: flex;
      align-items: center;
    }
    .test-name::before {
      content: '';
      display: inline-block;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      margin-right: 10px;
    }
    .test-item.passed .test-name::before {
      background-color: #38a169;
    }
    .test-item.failed .test-name::before {
      background-color: #e53e3e;
    }
    .test-details {
      font-size: 0.95em;
      color: #4a5568;
      margin-left: 26px;
    }
    .screenshots {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      margin-top: 40px;
    }
    .screenshot {
      background-color: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    .screenshot img {
      width: 100%;
      height: auto;
      display: block;
    }
    .screenshot-title {
      padding: 10px;
      text-align: center;
      background-color: #f7fafc;
      font-weight: bold;
      color: #4a5568;
    }
    .timestamp {
      text-align: center;
      font-size: 0.9em;
      color: #718096;
      margin-bottom: 30px;
    }
  </style>
</head>
<body>
  <h1>Tattoo Website Test Report</h1>
  
  <div class="timestamp">
    Generated on: ${new Date(report.timestamp).toLocaleString()}
  </div>
  
  <div class="summary">
    <div class="summary-item total">
      <div class="value">${report.summary.total}</div>
      <div class="label">Total Tests</div>
    </div>
    <div class="summary-item passed">
      <div class="value">${report.summary.passed}</div>
      <div class="label">Passed</div>
    </div>
    <div class="summary-item failed">
      <div class="value">${report.summary.failed}</div>
      <div class="label">Failed</div>
    </div>
    <div class="summary-item rate">
      <div class="value">${report.summary.passRate || '0%'}</div>
      <div class="label">Pass Rate</div>
    </div>
  </div>
  
  <h2>Test Results</h2>
  <ul class="test-list">
    ${report.tests.map(test => `
      <li class="test-item ${test.status}">
        <div class="test-name">${test.name}</div>
        <div class="test-details">${test.details}</div>
      </li>
    `).join('')}
  </ul>
  
  <h2>Screenshots</h2>
  <div class="screenshots">
    ${fs.existsSync(screenshotsDir) ? 
      fs.readdirSync(screenshotsDir)
        .filter(file => file.endsWith('.png'))
        .map(file => {
          const filename = file.replace('.png', '').split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ');
          
          return `
            <div class="screenshot">
              <div class="screenshot-title">${filename}</div>
              <img src="screenshots/${file}" alt="${filename}" />
            </div>
          `;
        }).join('') : 
      '<p>No screenshots available</p>'
    }
  </div>
</body>
</html>
`;

// Write HTML report
const htmlReportPath = path.join(__dirname, 'test-report.html');
fs.writeFileSync(htmlReportPath, html);

console.log(`✅ HTML report generated: ${htmlReportPath}`);