/**
 * Visual Baseline Tool
 * 
 * A standalone tool for creating visual baselines of UI components 
 * without requiring the actual web application to be running.
 */
import * as fs from 'fs';
import * as path from 'path';
import { PNG } from 'pngjs';

// Create directories for baseline images
const BASELINE_DIR = path.join(process.cwd(), 'test-results', 'visual-baselines');

/**
 * Create placeholder baseline images for essential UI components
 */
function createPlaceholderImage(
  width: number, 
  height: number, 
  filename: string,
  options: {
    label: string;
    backgroundColor?: string;
    textColor?: string;
  }
): void {
  // Ensure directory exists
  if (!fs.existsSync(BASELINE_DIR)) {
    fs.mkdirSync(BASELINE_DIR, { recursive: true });
  }
  
  // Create a new PNG
  const png = new PNG({ width, height });
  
  // Parse color values or use defaults
  const bgColor = parseHexColor(options.backgroundColor || '#f2f2f2');
  const txtColor = parseHexColor(options.textColor || '#333333');
  
  // Fill background
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2;
      png.data[idx] = bgColor.r;     // R
      png.data[idx + 1] = bgColor.g; // G
      png.data[idx + 2] = bgColor.b; // B
      png.data[idx + 3] = 255;       // A
    }
  }
  
  // Draw a border
  drawRectangle(png, 0, 0, width - 1, height - 1, txtColor);
  
  // Draw the label
  drawText(png, options.label, width / 2, height / 2, txtColor);
  
  // Write the PNG to file
  const buffer = PNG.sync.write(png);
  fs.writeFileSync(path.join(BASELINE_DIR, filename), buffer);
  
  console.log(`Created baseline image: ${filename}`);
}

/**
 * Parse hex color to RGB
 */
function parseHexColor(hex: string): { r: number; g: number; b: number } {
  // Remove # if present
  const cleanHex = hex.charAt(0) === '#' ? hex.substring(1) : hex;
  
  // Parse the hex color
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  
  return { r, g, b };
}

/**
 * Draw a simple rectangle
 */
function drawRectangle(
  png: PNG, 
  x1: number, 
  y1: number, 
  x2: number, 
  y2: number, 
  color: { r: number; g: number; b: number }
): void {
  // Top and bottom lines
  for (let x = x1; x <= x2; x++) {
    setPixel(png, x, y1, color);
    setPixel(png, x, y2, color);
  }
  
  // Left and right lines
  for (let y = y1; y <= y2; y++) {
    setPixel(png, x1, y, color);
    setPixel(png, x2, y, color);
  }
}

/**
 * Set a pixel to a color
 */
function setPixel(
  png: PNG, 
  x: number, 
  y: number, 
  color: { r: number; g: number; b: number }
): void {
  if (x < 0 || x >= png.width || y < 0 || y >= png.height) {
    return; // Out of bounds
  }
  
  const idx = (png.width * y + x) << 2;
  png.data[idx] = color.r;     // R
  png.data[idx + 1] = color.g; // G
  png.data[idx + 2] = color.b; // B
  png.data[idx + 3] = 255;     // A
}

/**
 * Draw simple text (very basic implementation)
 */
function drawText(
  png: PNG, 
  text: string, 
  centerX: number, 
  centerY: number, 
  color: { r: number; g: number; b: number }
): void {
  // This is a very simplified implementation that just draws a box
  // with the text inside it
  
  const textWidth = text.length * 8; // Approximate text width
  const textHeight = 16;             // Approximate text height
  
  const x1 = Math.floor(centerX - textWidth / 2);
  const y1 = Math.floor(centerY - textHeight / 2);
  const x2 = Math.floor(centerX + textWidth / 2);
  const y2 = Math.floor(centerY + textHeight / 2);
  
  // Draw a filled rectangle for the text background
  for (let y = y1; y <= y2; y++) {
    for (let x = x1; x <= x2; x++) {
      setPixel(png, x, y, { r: 255, g: 255, b: 255 });
    }
  }
  
  // Draw a border around the text
  drawRectangle(png, x1, y1, x2, y2, color);
  
  // We can't actually draw the text characters, but we've created a placeholder
}

/**
 * Create a visual baseline for a page
 */
function createPageBaseline(
  pageName: string, 
  width: number = 1280, 
  height: number = 800
): void {
  createPlaceholderImage(
    width, 
    height, 
    `${pageName}-baseline.png`,
    { 
      label: `${pageName} Page Baseline`,
      backgroundColor: '#ffffff',
      textColor: '#0066cc'
    }
  );
}

/**
 * Create visual baselines for UI components
 */
function createComponentBaseline(
  componentName: string,
  width: number = 300,
  height: number = 200
): void {
  createPlaceholderImage(
    width,
    height,
    `component-${componentName}-baseline.png`,
    {
      label: `${componentName} Component`,
      backgroundColor: '#f8f9fa',
      textColor: '#212529'
    }
  );
}

/**
 * Create a responsive baseline set
 */
function createResponsiveBaselines(pageName: string): void {
  // Desktop
  createPlaceholderImage(
    1280,
    800,
    `${pageName}-desktop-baseline.png`,
    {
      label: `${pageName} - Desktop`,
      backgroundColor: '#ffffff',
      textColor: '#0066cc'
    }
  );
  
  // Tablet
  createPlaceholderImage(
    768,
    1024,
    `${pageName}-tablet-baseline.png`,
    {
      label: `${pageName} - Tablet`,
      backgroundColor: '#ffffff',
      textColor: '#0066cc'
    }
  );
  
  // Mobile
  createPlaceholderImage(
    375,
    667,
    `${pageName}-mobile-baseline.png`,
    {
      label: `${pageName} - Mobile`,
      backgroundColor: '#ffffff',
      textColor: '#0066cc'
    }
  );
}

// Create page baselines
console.log('Creating page baselines...');
createPageBaseline('home');
createPageBaseline('services');
createPageBaseline('gallery');
createPageBaseline('booking');
createPageBaseline('contact');
createPageBaseline('faq');
createPageBaseline('admin-dashboard');

// Create component baselines
console.log('Creating component baselines...');
createComponentBaseline('header');
createComponentBaseline('footer');
createComponentBaseline('navigation');
createComponentBaseline('hero');
createComponentBaseline('button-primary');
createComponentBaseline('button-secondary');
createComponentBaseline('form-input');
createComponentBaseline('form-select');
createComponentBaseline('form-textarea');
createComponentBaseline('card');
createComponentBaseline('gallery-item');
createComponentBaseline('service-item');
createComponentBaseline('modal');
createComponentBaseline('tooltip');
createComponentBaseline('accordion');
createComponentBaseline('pagination');
createComponentBaseline('alert');
createComponentBaseline('toast');
createComponentBaseline('table');

// Create responsive baselines
console.log('Creating responsive baselines...');
createResponsiveBaselines('home');
createResponsiveBaselines('services');
createResponsiveBaselines('gallery');
createResponsiveBaselines('booking');
createResponsiveBaselines('contact');

console.log('Baseline creation complete!');
console.log(`Baselines saved to: ${BASELINE_DIR}`);
