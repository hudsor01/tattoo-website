/**
 * Image utility functions for optimized loading
 */

/**
 * Generates a tiny, blurred placeholder image as a data URL
 * @param color Hex color code for the placeholder
 * @returns Base64 encoded data URL of a 10x10 SVG
 */
export function getColorPlaceholder(color: string = '#000000'): string {
  // Create a simple SVG with the given color
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10" width="10" height="10">
      <rect width="10" height="10" fill="${color}" />
    </svg>
  `.trim();

  // Convert to base64
  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Generates a gradient placeholder as a data URL
 * @param color1 First color in the gradient
 * @param color2 Second color in the gradient
 * @returns Base64 encoded data URL of a 10x10 gradient SVG
 */
export function getGradientPlaceholder(
  color1: string = '#000000',
  color2: string = '#222222'
): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10" width="10" height="10">
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop stop-color="${color1}" offset="0%"/>
        <stop stop-color="${color2}" offset="100%"/>
      </linearGradient>
      <rect width="10" height="10" fill="url(#g)" />
    </svg>
  `.trim();

  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

// Common placeholders for tattoo-themed images
export const DARK_PLACEHOLDER = getColorPlaceholder('#121212');
export const TATTOO_RED_PLACEHOLDER = getGradientPlaceholder('#4A0404', '#121212');
export const TATTOO_BLUE_PLACEHOLDER = getGradientPlaceholder('#0A1A2A', '#121212');

/**
 * Generates image size attribute based on layout type
 * @param type The type of layout the image is in
 * @returns Appropriate sizes attribute value for responsive loading
 */
export function getImageSizes(
  type: 'gallery' | 'hero' | 'card' | 'full' | 'thumbnail' = 'card'
): string {
  switch (type) {
    case 'gallery':
      return '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw';
    case 'hero':
      return '100vw';
    case 'card':
      return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
    case 'thumbnail':
      return '(max-width: 640px) 80px, 120px';
    case 'full':
    default:
      return '100vw';
  }
}
