import { test } from '@playwright/test';

test('Simple admin page test', async ({ page }) => {
  // Enable console logging
  page.on('console', (msg) => {
    console.log('BROWSER CONSOLE:', msg.type(), msg.text());
  });

  await page.goto('/admin');
  
  // Wait for page to fully load
  await page.waitForLoadState('networkidle');
  
  // Take a screenshot
  await page.screenshot({ path: 'admin-page-debug.png', fullPage: true });
  
  // Log what we see
  const title = await page.title();
  console.log('Page title:', title);
  
  const url = page.url();
  console.log('Current URL:', url);
  
  // Check if we can find any specific admin content
  const hasAdminText = await page.locator('text=Dashboard').isVisible().catch(() => false);
  console.log('Has Dashboard text:', hasAdminText);
  
  const hasQuickStats = await page.locator('text=Quick Stats').isVisible().catch(() => false);
  console.log('Has Quick Stats text:', hasQuickStats);
  
  const hasAdminWorking = await page.locator('text=Admin dashboard is working!').isVisible().catch(() => false);
  console.log('Has Admin working text:', hasAdminWorking);
  
  const hasUnauthorizedText = await page.locator('text=Access Denied').isVisible().catch(() => false);
  console.log('Has Access Denied text:', hasUnauthorizedText);
  
  const hasMainSiteText = await page.locator('text=Ink 37 Tattoos').isVisible().catch(() => false);
  console.log('Has main site text:', hasMainSiteText);
  
  // Get the first few lines of body content
  const bodyText = await page.locator('body').textContent();
  console.log('Body text (first 200 chars):', bodyText?.substring(0, 200));
});