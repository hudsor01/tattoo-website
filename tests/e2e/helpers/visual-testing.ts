import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

/**
 * Visual testing helper for E2E tests
 * Captures and compares screenshots to detect visual regressions
 */
export class VisualTesting {
  private baselineDir: string;
  private actualDir: string;
  private diffDir: string;
  private page: Page;
  private testName: string;
  
  /**
   * Create a new visual testing helper
   * @param page Playwright page object
   * @param testName Name of the test for screenshot naming
   * @param browserName Browser name for directory organization
   */
  constructor(page: Page, testName: string, browserName: string = 'chromium') {
    this.page = page;
    this.testName = testName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    
    // Define directories
    const rootDir = path.join(process.cwd(), 'test-results', 'visual');
    this.baselineDir = path.join(rootDir, 'baseline', browserName);
    this.actualDir = path.join(rootDir, 'actual', browserName, this.testName);
    this.diffDir = path.join(rootDir, 'diff', browserName, this.testName);
    
    // Create directories if they don't exist
    this.ensureDirectoryExists(this.baselineDir);
    this.ensureDirectoryExists(this.actualDir);
    this.ensureDirectoryExists(this.diffDir);
  }
  
  /**
   * Capture a screenshot for visual comparison
   * @param name Name of the screenshot (used in filename)
   * @param selector Optional selector to screenshot only a part of the page
   * @param options Additional screenshot options
   */
  async captureScreenshot(
    name: string,
    selector?: string,
    options: { fullPage?: boolean; timeout?: number } = {}
  ): Promise<string> {
    // Normalize screenshot name
    name = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    
    // Default options
    const fullPage = options.fullPage || false;
    const timeout = options.timeout || 5000;
    
    // Wait for any animations to complete
    await this.page.waitForTimeout(500);
    
    // Define screenshot path
    const screenshotName = `${this.testName}_${name}.png`;
    const screenshotPath = path.join(this.actualDir, screenshotName);
    
    try {
      // Take the screenshot
      if (selector) {
        // Screenshot specific element
        const element = this.page.locator(selector);
        await element.waitFor({ state: 'visible', timeout });
        await element.screenshot({ path: screenshotPath });
      } else {
        // Screenshot whole page
        await this.page.screenshot({
          path: screenshotPath,
          fullPage,
        });
      }
      
      return screenshotPath;
    } catch (error) {
      console.error(`Failed to capture screenshot "${name}":`, error);
      throw error;
    }
  }
  
  /**
   * Compare a screenshot to its baseline
   * @param name Name of the screenshot to compare
   * @param options Comparison options
   */
  async compareScreenshot(
    name: string,
    options: {
      threshold?: number;
      createMissingBaseline?: boolean;
    } = {}
  ): Promise<ComparisonResult> {
    // Normalize screenshot name
    name = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    
    // Default options
    const threshold = options.threshold || 0.1;
    const createMissingBaseline = options.createMissingBaseline !== false;
    
    // Define paths
    const screenshotName = `${this.testName}_${name}.png`;
    const actualPath = path.join(this.actualDir, screenshotName);
    const baselinePath = path.join(this.baselineDir, screenshotName);
    const diffPath = path.join(this.diffDir, screenshotName);
    
    // Check if actual screenshot exists
    if (!fs.existsSync(actualPath)) {
      throw new Error(`Actual screenshot ${actualPath} not found`);
    }
    
    // Check if baseline exists
    if (!fs.existsSync(baselinePath)) {
      if (createMissingBaseline) {
        // Create the baseline directory if it doesn't exist
        this.ensureDirectoryExists(path.dirname(baselinePath));
        
        // Copy actual to baseline
        fs.copyFileSync(actualPath, baselinePath);
        
        return {
          matches: true,
          diffPercentage: 0,
          diffPath: null,
          baselineCreated: true,
        };
      } else {
        throw new Error(`Baseline screenshot ${baselinePath} not found and createMissingBaseline is false`);
      }
    }
    
    // Read images
    const actualImg = PNG.sync.read(fs.readFileSync(actualPath));
    const baselineImg = PNG.sync.read(fs.readFileSync(baselinePath));
    
    // Check if dimensions match
    if (actualImg.width !== baselineImg.width || actualImg.height !== baselineImg.height) {
      // Create a transparent diff image to visualize the difference
      const maxWidth = Math.max(actualImg.width, baselineImg.width);
      const maxHeight = Math.max(actualImg.height, baselineImg.height);
      
      const diff = new PNG({ width: maxWidth, height: maxHeight });
      
      // Fill with transparent red to indicate dimension mismatch
      for (let y = 0; y < maxHeight; y++) {
        for (let x = 0; x < maxWidth; x++) {
          const idx = (y * maxWidth + x) * 4;
          diff.data[idx] = 255; // R
          diff.data[idx + 1] = 0; // G
          diff.data[idx + 2] = 0; // B
          diff.data[idx + 3] = 64; // A (semi-transparent)
        }
      }
      
      // Save diff image
      this.ensureDirectoryExists(path.dirname(diffPath));
      fs.writeFileSync(diffPath, PNG.sync.write(diff));
      
      return {
        matches: false,
        diffPercentage: 100, // Different dimensions = 100% different
        diffPath,
        dimensionMismatch: {
          actual: { width: actualImg.width, height: actualImg.height },
          baseline: { width: baselineImg.width, height: baselineImg.height },
        },
      };
    }
    
    // Same dimensions, compare pixels
    const { width, height } = baselineImg;
    const diff = new PNG({ width, height });
    
    // Compare images
    const numDiffPixels = pixelmatch(
      actualImg.data,
      baselineImg.data,
      diff.data,
      width,
      height,
      { threshold }
    );
    
    // Calculate diff percentage
    const totalPixels = width * height;
    const diffPercentage = (numDiffPixels / totalPixels) * 100;
    
    // Save diff image if there are differences
    if (numDiffPixels > 0) {
      this.ensureDirectoryExists(path.dirname(diffPath));
      fs.writeFileSync(diffPath, PNG.sync.write(diff));
    }
    
    return {
      matches: diffPercentage === 0,
      diffPercentage,
      diffPath: numDiffPixels > 0 ? diffPath : null,
    };
  }
  
  /**
   * Capture and compare a screenshot in one step
   * @param name Name of the screenshot
   * @param selector Optional selector to screenshot only a part of the page
   * @param options Additional options
   */
  async captureAndCompare(
    name: string,
    selector?: string,
    options: {
      fullPage?: boolean;
      timeout?: number;
      threshold?: number;
      createMissingBaseline?: boolean;
    } = {}
  ): Promise<ComparisonResult> {
    // Capture screenshot
    await this.captureScreenshot(name, selector, {
      fullPage: options.fullPage,
      timeout: options.timeout,
    });
    
    // Compare with baseline
    return this.compareScreenshot(name, {
      threshold: options.threshold,
      createMissingBaseline: options.createMissingBaseline,
    });
  }
  
  /**
   * Update the baseline image with the current screenshot
   * @param name Name of the screenshot
   */
  async updateBaseline(name: string): Promise<void> {
    // Normalize screenshot name
    name = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    
    // Define paths
    const screenshotName = `${this.testName}_${name}.png`;
    const actualPath = path.join(this.actualDir, screenshotName);
    const baselinePath = path.join(this.baselineDir, screenshotName);
    
    // Check if actual screenshot exists
    if (!fs.existsSync(actualPath)) {
      throw new Error(`Cannot update baseline: Actual screenshot ${actualPath} not found`);
    }
    
    // Create the baseline directory if it doesn't exist
    this.ensureDirectoryExists(path.dirname(baselinePath));
    
    // Copy actual to baseline
    fs.copyFileSync(actualPath, baselinePath);
    console.log(`Updated baseline for ${name} at ${baselinePath}`);
  }
  
  /**
   * Record multiple screenshots of a multi-step flow
   * @param flowName Base name for the flow screenshots
   * @param steps Array of step descriptions for naming
   */
  async recordFlow(
    flowName: string,
    steps: string[] = []
  ): Promise<ComparisonResult[]> {
    const results: ComparisonResult[] = [];
    
    if (steps.length === 0) {
      // Just take a single screenshot
      const result = await this.captureAndCompare(flowName);
      results.push(result);
    } else {
      // Take screenshots for each step
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const name = `${flowName}_${i + 1}_${step.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`;
        
        const result = await this.captureAndCompare(name);
        results.push(result);
      }
    }
    
    return results;
  }
  
  /**
   * Ensure a directory exists, creating it if necessary
   */
  private ensureDirectoryExists(dir: string): void {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

// Types
export interface ComparisonResult {
  matches: boolean;
  diffPercentage: number;
  diffPath: string | null;
  baselineCreated?: boolean;
  dimensionMismatch?: {
    actual: { width: number; height: number };
    baseline: { width: number; height: number };
  };
}
