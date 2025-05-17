// Example of using MCP Playwright server to run a simple test

async function runPlaywrightTest() {
  // Navigate to homepage
  await mcp__playwright__playwright_navigate({ url: 'http://localhost:3000' })
  
  // Take a screenshot
  await mcp__playwright__playwright_screenshot({ 
    name: 'homepage',
    fullPage: true 
  })
  
  // Click on Gallery link
  await mcp__playwright__playwright_click({ selector: 'nav >> text=Gallery' })
  
  // Wait for navigation
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Take gallery screenshot
  await mcp__playwright__playwright_screenshot({ 
    name: 'gallery-page',
    fullPage: true 
  })
  
  // Fill search/filter
  await mcp__playwright__playwright_fill({ 
    selector: 'input[placeholder*="Search"]',
    value: 'Japanese' 
  })
  
  // Click filter button
  await mcp__playwright__playwright_click({ selector: 'button:has-text("Japanese")' })
  
  // Get visible text
  const visibleText = await mcp__playwright__playwright_get_visible_text({})
  console.log('Page content:', visibleText)
  
  // Navigate to contact
  await mcp__playwright__playwright_navigate({ url: 'http://localhost:3000/contact' })
  
  // Fill contact form
  await mcp__playwright__playwright_fill({ 
    selector: 'input[name="name"]',
    value: 'Test User' 
  })
  
  await mcp__playwright__playwright_fill({ 
    selector: 'input[name="email"]',
    value: 'test@example.com' 
  })
  
  await mcp__playwright__playwright_fill({ 
    selector: 'textarea[name="message"]',
    value: 'This is a test message' 
  })
  
  // Submit form
  await mcp__playwright__playwright_click({ 
    selector: 'button:has-text("Send Message")' 
  })
  
  // Close browser
  await mcp__playwright__playwright_close({})
}

// Example of using Playwright for responsive testing
async function testResponsive() {
  // Test on mobile
  await mcp__playwright__playwright_navigate({ 
    url: 'http://localhost:3000',
    width: 375,
    height: 667
  })
  
  await mcp__playwright__playwright_screenshot({ 
    name: 'homepage-mobile',
    fullPage: true 
  })
  
  // Test on tablet
  await mcp__playwright__playwright_navigate({ 
    url: 'http://localhost:3000',
    width: 768,
    height: 1024
  })
  
  await mcp__playwright__playwright_screenshot({ 
    name: 'homepage-tablet',
    fullPage: true 
  })
  
  // Test on desktop
  await mcp__playwright__playwright_navigate({ 
    url: 'http://localhost:3000',
    width: 1920,
    height: 1080
  })
  
  await mcp__playwright__playwright_screenshot({ 
    name: 'homepage-desktop',
    fullPage: true 
  })
}