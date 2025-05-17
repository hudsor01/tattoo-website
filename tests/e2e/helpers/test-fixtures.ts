import { test as base, expect as baseExpect } from '@playwright/test';
import { VisualTesting } from './visual-testing';
import { getTestDataFactory } from './test-data-factory';
import { EnhancedTestReporter } from './enhanced-test-reporter';

/**
 * Extended test fixtures for E2E tests
 * Provides access to visual testing, data factory, and enhanced reporting
 */
export const test = base.extend<{
  visualTesting: VisualTesting;
  dataFactory: ReturnType<typeof getTestDataFactory>;
  reporter: EnhancedTestReporter;
}>({
  // Fixture to provide visual testing
  visualTesting: async ({ page, browserName }, use, testInfo) => {
    // Create visual testing helper with test name
    const visualTesting = new VisualTesting(
      page,
      testInfo.title,
      browserName
    );
    
    // Use the fixture
    await use(visualTesting);
  },
  
  // Fixture to provide data factory
  dataFactory: async ({}, use) => {
    // Get data factory singleton
    const dataFactory = getTestDataFactory();
    
    // Use the fixture
    await use(dataFactory);
    
    // Clean up test data after test
    await dataFactory.cleanup();
  },
  
  // Fixture to provide test reporter
  reporter: async ({}, use) => {
    // Create reporter
    const reporter = new EnhancedTestReporter();
    
    // Use the fixture
    await use(reporter);
  },
});

/**
 * Extend base expect with custom matchers
 */
export const expect = baseExpect.extend({
  /**
   * Custom matcher for visual comparison
   */
  async toMatchVisualBaseline(
    received: { visualTesting: VisualTesting },
    name: string,
    options: {
      selector?: string;
      threshold?: number;
      fullPage?: boolean;
    } = {}
  ) {
    // Default options
    const selector = options.selector;
    const threshold = options.threshold || 0.1;
    const fullPage = options.fullPage || false;
    
    if (!received.visualTesting) {
      return {
        message: () => 'Visual testing not available',
        pass: false,
      };
    }
    
    try {
      // Capture and compare screenshot
      const result = await received.visualTesting.captureAndCompare(
        name,
        selector,
        {
          threshold,
          fullPage,
        }
      );
      
      // Check if comparison passed
      if (result.matches || result.baselineCreated) {
        return {
          message: () => 
            result.baselineCreated
              ? `Created new baseline for "${name}"`
              : `Screenshot "${name}" matches baseline`,
          pass: true,
        };
      } else {
        // Comparison failed
        let message = `Screenshot "${name}" does not match baseline. Difference: ${result.diffPercentage.toFixed(2)}%`;
        
        if (result.dimensionMismatch) {
          const { actual, baseline } = result.dimensionMismatch;
          message += `\nDimension mismatch: Actual ${actual.width}x${actual.height}, Baseline ${baseline.width}x${baseline.height}`;
        }
        
        if (result.diffPath) {
          message += `\nDiff image: ${result.diffPath}`;
        }
        
        return {
          message: () => message,
          pass: false,
        };
      }
    } catch (error) {
      // Error during comparison
      return {
        message: () => `Error during visual comparison: ${error}`,
        pass: false,
      };
    }
  },
});

// Export named test and expect for convenience
export { test, expect };
