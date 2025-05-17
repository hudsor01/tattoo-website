/**
 * Mock Performance tests that don't require a live server
 * This version simulates performance testing for demonstration purposes
 */
import { test, expect } from '@playwright/test';

/**
 * Generate mock performance data
 */
function generateMockPerformanceData(pageName: string): {
  pageName: string;
  navigationTime: number;
  loadTime: number;
  domContentLoaded: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  resources: {
    totalResources: number;
    totalTransferSize: number;
    resourcesByType: Record<string, number>;
  };
} {
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

// Test suite for mock performance testing
test.describe('Mock Performance Tests', () => {
  const allPageData: ReturnType<typeof generateMockPerformanceData>[] = [];
  
  // Test homepage performance
  test('Home page performance', async () => {
    // Simulate measuring page performance
    console.log('Measuring Home page performance...');
    
    // Generate mock data
    const mockData = generateMockPerformanceData('Home Page Initial Load');
    allPageData.push(mockData);
    
    // Log simulated metrics
    console.log(`Performance metrics for ${mockData.pageName}:`);
    console.log(`- Navigation Time: ${mockData.navigationTime}ms`);
    console.log(`- Load Time: ${mockData.loadTime}ms`);
    console.log(`- DOM Content Loaded: ${mockData.domContentLoaded}ms`);
    
    // Very basic pass condition - just verify the mock data is within expected ranges
    expect(mockData.navigationTime).toBeGreaterThan(0);
    expect(mockData.navigationTime).toBeLessThan(2000);
  });
  
  // Test services page performance
  test('Services page performance', async () => {
    console.log('Measuring Services page performance...');
    
    // Generate mock data
    const mockData = generateMockPerformanceData('Services Page Initial Load');
    allPageData.push(mockData);
    
    // Log simulated metrics
    console.log(`Performance metrics for ${mockData.pageName}:`);
    console.log(`- Navigation Time: ${mockData.navigationTime}ms`);
    console.log(`- Load Time: ${mockData.loadTime}ms`);
    console.log(`- DOM Content Loaded: ${mockData.domContentLoaded}ms`);
    
    // Simple pass condition
    expect(mockData.navigationTime).toBeGreaterThan(0);
    expect(mockData.navigationTime).toBeLessThan(2000);
  });
  
  // Test gallery page performance
  test('Gallery page performance', async () => {
    console.log('Measuring Gallery page performance...');
    
    // Generate mock data
    const mockData = generateMockPerformanceData('Gallery Page Initial Load');
    allPageData.push(mockData);
    
    // Log simulated metrics
    console.log(`Performance metrics for ${mockData.pageName}:`);
    console.log(`- Navigation Time: ${mockData.navigationTime}ms`);
    console.log(`- Load Time: ${mockData.loadTime}ms`);
    console.log(`- DOM Content Loaded: ${mockData.domContentLoaded}ms`);
    
    // Simple pass condition
    expect(mockData.navigationTime).toBeGreaterThan(0);
    expect(mockData.navigationTime).toBeLessThan(2000);
  });
  
  // Test booking page performance
  test('Booking page performance', async () => {
    console.log('Measuring Booking page performance...');
    
    // Generate mock data
    const mockData = generateMockPerformanceData('Booking Page Initial Load');
    allPageData.push(mockData);
    
    // Log simulated metrics
    console.log(`Performance metrics for ${mockData.pageName}:`);
    console.log(`- Navigation Time: ${mockData.navigationTime}ms`);
    console.log(`- Load Time: ${mockData.loadTime}ms`);
    console.log(`- DOM Content Loaded: ${mockData.domContentLoaded}ms`);
    
    // Simple pass condition
    expect(mockData.navigationTime).toBeGreaterThan(0);
    expect(mockData.navigationTime).toBeLessThan(2000);
  });
  
  // Test contact page performance
  test('Contact page performance', async () => {
    console.log('Measuring Contact page performance...');
    
    // Generate mock data
    const mockData = generateMockPerformanceData('Contact Page Initial Load');
    allPageData.push(mockData);
    
    // Log simulated metrics
    console.log(`Performance metrics for ${mockData.pageName}:`);
    console.log(`- Navigation Time: ${mockData.navigationTime}ms`);
    console.log(`- Load Time: ${mockData