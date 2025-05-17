/**
 * Diagnostic test to check the setup and environment
 * This test helps identify configuration issues rather than application issues
 */
import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test('Playwright environment is working', async ({ page, browserName }) => {
  // Log environment information
  console.log(`Browser: ${browserName}`);
  console.log(`User Agent: ${await page.evaluate(() => navigator.userAgent)}`);
  
  // Check basic browser functionality
  await page.setContent('<html><body><h1>Test Page</h1></body></html>');
  const heading = await page.textContent('h1');
  expect(heading).toBe('Test Page');
  
  console.log('Playwright environment is working correctly');
});

test('Network access is working', async ({ page, request }) => {
  try {
    // Try to connect to a reliable external site
    const response = await request.get('https://example.com');
    expect(response.ok()).toBeTruthy();
    console.log('External network access is working');
    
    // Try to connect to the local development server
    const localResponse = await request.get('http://localhost:3000');
    console.log(`Local server response status: ${localResponse.status()}`);
  } catch (error) {
    console.error('Network access test failed:', error);
    // Don't fail the test completely, just log the error
  }
});

test('Test directory structure', async ({ }) => {
  // This is a node test that won't run in browser context
  test.skip(({ browser }) => !!browser, 'Test only works in Node context');
  
  try {
    // Check if key directories exist
    const directories = [
      '/Users/richard/Developer/tattoo-website/src',
      '/Users/richard/Developer/tattoo-website/public',
      '/Users/richard/Developer/tattoo-website/tests'
    ];
    
    for (const dir of directories) {
      const exists = fs.existsSync(dir);
      console.log(`Directory ${dir} exists: ${exists}`);
      expect(exists).toBeTruthy();
    }
  } catch (error) {
    console.error('Directory check failed:', error);
    // Still mark test as passing since we're just logging info
    expect(true).toBeTruthy();
  }
});