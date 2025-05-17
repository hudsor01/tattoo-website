import { test, expect } from '@playwright/test'

test.describe('SEO Tests', () => {
  test('should have proper meta tags on homepage', async ({ page }) => {
    await page.goto('/')
    
    // Title
    await expect(page).toHaveTitle(/Fernando Govea.*Tattoo/i)
    
    // Meta description
    const description = await page.locator('meta[name="description"]').getAttribute('content')
    expect(description).toBeTruthy()
    expect(description!.length).toBeGreaterThan(50)
    expect(description!.length).toBeLessThan(160)
    
    // Keywords
    const keywords = await page.locator('meta[name="keywords"]').getAttribute('content')
    expect(keywords).toContain('tattoo')
    
    // Viewport
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content')
    expect(viewport).toContain('width=device-width')
  })

  test('should have Open Graph tags', async ({ page }) => {
    await page.goto('/')
    
    const ogTags = {
      'og:title': await page.locator('meta[property="og:title"]').getAttribute('content'),
      'og:description': await page.locator('meta[property="og:description"]').getAttribute('content'),
      'og:image': await page.locator('meta[property="og:image"]').getAttribute('content'),
      'og:url': await page.locator('meta[property="og:url"]').getAttribute('content'),
      'og:type': await page.locator('meta[property="og:type"]').getAttribute('content'),
    }
    
    expect(ogTags['og:title']).toBeTruthy()
    expect(ogTags['og:description']).toBeTruthy()
    expect(ogTags['og:image']).toBeTruthy()
    expect(ogTags['og:url']).toBeTruthy()
    expect(ogTags['og:type']).toBe('website')
  })

  test('should have Twitter Card tags', async ({ page }) => {
    await page.goto('/')
    
    const twitterTags = {
      'twitter:card': await page.locator('meta[name="twitter:card"]').getAttribute('content'),
      'twitter:title': await page.locator('meta[name="twitter:title"]').getAttribute('content'),
      'twitter:description': await page.locator('meta[name="twitter:description"]').getAttribute('content'),
      'twitter:image': await page.locator('meta[name="twitter:image"]').getAttribute('content'),
    }
    
    expect(twitterTags['twitter:card']).toBe('summary_large_image')
    expect(twitterTags['twitter:title']).toBeTruthy()
    expect(twitterTags['twitter:description']).toBeTruthy()
    expect(twitterTags['twitter:image']).toBeTruthy()
  })

  test('should have canonical URLs', async ({ page }) => {
    const pages = ['/', '/about', '/services', '/gallery', '/faq', '/contact']
    
    for (const path of pages) {
      await page.goto(path)
      
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href')
      expect(canonical).toBeTruthy()
      expect(canonical).toContain(path === '/' ? '' : path)
    }
  })

  test('should have robots.txt', async ({ page }) => {
    const response = await page.request.get('/robots.txt')
    expect(response.ok()).toBeTruthy()
    
    const text = await response.text()
    expect(text).toContain('User-agent')
    expect(text).toContain('Sitemap')
  })

  test('should have sitemap.xml', async ({ page }) => {
    const response = await page.request.get('/sitemap.xml')
    expect(response.ok()).toBeTruthy()
    
    const text = await response.text()
    expect(text).toContain('<?xml')
    expect(text).toContain('<urlset')
    expect(text).toContain('<url>')
    expect(text).toContain('<loc>')
  })

  test('should have structured data', async ({ page }) => {
    await page.goto('/')
    
    const structuredData = await page.locator('script[type="application/ld+json"]').textContent()
    expect(structuredData).toBeTruthy()
    
    const data = JSON.parse(structuredData!)
    expect(data['@context']).toBe('https://schema.org')
    expect(data['@type']).toContain('LocalBusiness')
    expect(data.name).toBeTruthy()
    expect(data.address).toBeTruthy()
    expect(data.telephone).toBeTruthy()
  })

  test('should have proper heading structure', async ({ page }) => {
    const pages = ['/', '/about', '/services', '/gallery', '/faq', '/contact']
    
    for (const path of pages) {
      await page.goto(path)
      
      // Only one h1
      const h1Count = await page.locator('h1').count()
      expect(h1Count).toBe(1)
      
      // H1 contains relevant keywords
      const h1Text = await page.locator('h1').textContent()
      expect(h1Text).toBeTruthy()
    }
  })

  test('should have alt text for images', async ({ page }) => {
    await page.goto('/gallery')
    
    const images = await page.locator('img').all()
    for (const img of images) {
      const alt = await img.getAttribute('alt')
      expect(alt).toBeTruthy()
      expect(alt!.length).toBeGreaterThan(0)
    }
  })

  test('should have clean URLs', async ({ page }) => {
    const pages = ['/about', '/services', '/gallery', '/faq', '/contact']
    
    for (const path of pages) {
      await page.goto(path)
      
      // Check URL is clean (no params, hash, etc)
      const url = page.url()
      expect(url).not.toContain('?')
      expect(url).not.toContain('#')
      expect(url).not.toContain('.html')
      expect(url).not.toContain('.php')
    }
  })

  test('should have breadcrumbs with structured data', async ({ page }) => {
    await page.goto('/services')
    
    const breadcrumbs = page.locator('[aria-label="breadcrumb"]')
    if (await breadcrumbs.count() > 0) {
      const breadcrumbData = await page.locator('script[type="application/ld+json"]').nth(1).textContent()
      if (breadcrumbData) {
        const data = JSON.parse(breadcrumbData)
        expect(data['@type']).toBe('BreadcrumbList')
        expect(data.itemListElement).toBeTruthy()
      }
    }
  })

  test('should have proper language attributes', async ({ page }) => {
    await page.goto('/')
    
    const htmlLang = await page.locator('html').getAttribute('lang')
    expect(htmlLang).toBe('en')
    
    // Check for hreflang if multiple languages supported
    const hreflang = await page.locator('link[rel="alternate"][hreflang]').count()
    if (hreflang > 0) {
      const href = await page.locator('link[rel="alternate"][hreflang]').first().getAttribute('href')
      expect(href).toBeTruthy()
    }
  })

  test('should have social media meta tags', async ({ page }) => {
    await page.goto('/')
    
    // Facebook specific
    const fbAppId = await page.locator('meta[property="fb:app_id"]').count()
    if (fbAppId > 0) {
      const appId = await page.locator('meta[property="fb:app_id"]').getAttribute('content')
      expect(appId).toBeTruthy()
    }
    
    // Article tags for blog posts
    await page.goto('/about')
    const articleAuthor = await page.locator('meta[property="article:author"]').count()
    if (articleAuthor > 0) {
      const author = await page.locator('meta[property="article:author"]').getAttribute('content')
      expect(author).toBeTruthy()
    }
  })

  test('should have proper 404 page', async ({ page }) => {
    const response = await page.goto('/non-existent-page', { waitUntil: 'networkidle' })
    
    expect(response!.status()).toBe(404)
    
    // Check 404 page has proper SEO
    await expect(page).toHaveTitle(/404|Not Found/i)
    const h1 = await page.locator('h1').textContent()
    expect(h1).toContain('404')
  })
})