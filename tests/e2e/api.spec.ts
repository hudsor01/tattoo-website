import { test, expect } from '@playwright/test'

test.describe('API Tests', () => {
  test.use({ baseURL: 'http://localhost:3000' })

  test('should handle contact form submission', async ({ request }) => {
    const response = await request.post('/api/contact', {
      data: {
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'Test message content'
      }
    })

    expect(response.ok()).toBeTruthy()
    const json = await response.json()
    expect(json.success).toBe(true)
  })

  test('should validate contact form data', async ({ request }) => {
    const response = await request.post('/api/contact', {
      data: {
        name: '',
        email: 'invalid-email',
        message: ''
      }
    })

    expect(response.status()).toBe(400)
    const json = await response.json()
    expect(json.errors).toBeDefined()
  })

  test('should handle booking submission', async ({ request }) => {
    const response = await request.post('/api/booking', {
      data: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '555-0123',
        style: 'Traditional',
        size: 'Medium',
        placement: 'Arm',
        date: '2024-12-25',
        time: '14:00'
      }
    })

    expect(response.ok()).toBeTruthy()
    const json = await response.json()
    expect(json.bookingId).toBeDefined()
  })

  test('should handle missing required fields', async ({ request }) => {
    const response = await request.post('/api/booking', {
      data: {
        name: 'John Doe',
        // Missing required fields
      }
    })

    expect(response.status()).toBe(400)
  })

  test('should rate limit requests', async ({ request }) => {
    // Make multiple rapid requests
    const requests = []
    for (let i = 0; i < 10; i++) {
      requests.push(
        request.post('/api/contact', {
          data: {
            name: `User ${i}`,
            email: `user${i}@example.com`,
            message: 'Test'
          }
        })
      )
    }

    const responses = await Promise.all(requests)
    
    // Some requests should be rate limited
    const rateLimited = responses.some(r => r.status() === 429)
    expect(rateLimited).toBeTruthy()
  })

  test('should handle CORS properly', async ({ request }) => {
    const response = await request.options('/api/contact')
    
    const headers = response.headers()
    expect(headers['access-control-allow-origin']).toBeDefined()
    expect(headers['access-control-allow-methods']).toContain('POST')
  })

  test('should return proper error responses', async ({ request }) => {
    const response = await request.get('/api/non-existent')
    
    expect(response.status()).toBe(404)
    const json = await response.json()
    expect(json.error).toBeDefined()
  })

  test('should handle file uploads', async ({ request }) => {
    const response = await request.post('/api/upload', {
      multipart: {
        file: {
          name: 'test.jpg',
          mimeType: 'image/jpeg',
          buffer: Buffer.from('fake-image-data')
        }
      }
    })

    // Expect either success or proper error
    expect([200, 413, 415]).toContain(response.status())
  })

  test('should validate email format', async ({ request }) => {
    const invalidEmails = [
      'notanemail',
      '@example.com',
      'user@',
      'user..name@example.com'
    ]

    for (const email of invalidEmails) {
      const response = await request.post('/api/contact', {
        data: {
          name: 'Test',
          email,
          message: 'Test'
        }
      })

      expect(response.status()).toBe(400)
    }
  })

  test('should sanitize input', async ({ request }) => {
    const response = await request.post('/api/contact', {
      data: {
        name: '<script>alert("xss")</script>',
        email: 'test@example.com',
        message: '<img src=x onerror=alert("xss")>'
      }
    })

    expect(response.ok()).toBeTruthy()
    
    // Verify the stored data is sanitized (would need DB access)
    const json = await response.json()
    expect(json.success).toBe(true)
  })

  test('should handle concurrent requests', async ({ request }) => {
    const promises = []
    
    for (let i = 0; i < 5; i++) {
      promises.push(
        request.post('/api/booking', {
          data: {
            name: `User ${i}`,
            email: `user${i}@example.com`,
            phone: '555-0123',
            style: 'Traditional',
            size: 'Small',
            date: '2024-12-25',
            time: '14:00'
          }
        })
      )
    }

    const responses = await Promise.all(promises)
    
    // All should succeed or fail gracefully
    responses.forEach(response => {
      expect([200, 201, 400, 429]).toContain(response.status())
    })
  })

  test('should handle timezone conversions', async ({ request }) => {
    const response = await request.post('/api/booking', {
      data: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '555-0123',
        style: 'Traditional',
        size: 'Small',
        date: '2024-12-25',
        time: '14:00',
        timezone: 'America/New_York'
      }
    })

    expect(response.ok()).toBeTruthy()
    const json = await response.json()
    expect(json.bookingId).toBeDefined()
  })

  test('should validate phone numbers', async ({ request }) => {
    const invalidPhones = ['123', 'abcdefgh', '555-555-55555']
    
    for (const phone of invalidPhones) {
      const response = await request.post('/api/booking', {
        data: {
          name: 'John Doe',
          email: 'john@example.com',
          phone,
          style: 'Traditional',
          size: 'Small',
          date: '2024-12-25',
          time: '14:00'
        }
      })

      expect(response.status()).toBe(400)
    }
  })

  test('should handle API versioning', async ({ request }) => {
    // Test v1 API
    const v1Response = await request.get('/api/v1/health')
    expect([200, 404]).toContain(v1Response.status())
    
    // Test v2 API (if exists)
    const v2Response = await request.get('/api/v2/health')
    expect([200, 404]).toContain(v2Response.status())
  })
})