import { cn } from '@/lib/utils'
import { formatDate, formatPrice, formatPhone } from '@/lib/utils/format'
import { validateEmail, validatePhone } from '@/lib/utils/validation'

describe('cn utility', () => {
  it('should merge class names', () => {
    const result = cn('text-white', 'bg-black')
    expect(result).toBe('text-white bg-black')
  })

  it('should handle conditional classes', () => {
    const result = cn('text-white', {
      'bg-black': true,
      'bg-white': false
    })
    expect(result).toBe('text-white bg-black')
  })

  it('should override conflicting classes', () => {
    const result = cn('text-white', 'text-black')
    expect(result).toBe('text-black')
  })

  it('should handle arrays', () => {
    const result = cn(['text-white', 'bg-black'])
    expect(result).toBe('text-white bg-black')
  })

  it('should filter out falsy values', () => {
    const result = cn('text-white', null, undefined, '', 'bg-black')
    expect(result).toBe('text-white bg-black')
  })
})

describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2024-12-25')
    const result = formatDate(date)
    expect(result).toMatch(/Dec(ember)? 25, 2024/)
  })

  it('should handle string dates', () => {
    const result = formatDate('2024-12-25')
    expect(result).toMatch(/Dec(ember)? 25, 2024/)
  })

  it('should handle invalid dates', () => {
    const result = formatDate('invalid')
    expect(result).toBe('Invalid Date')
  })

  it('should format with custom options', () => {
    const date = new Date('2024-12-25')
    const result = formatDate(date, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
    expect(result).toMatch(/Dec 25, 2024/)
  })
})

describe('formatPrice', () => {
  it('should format price correctly', () => {
    const result = formatPrice(99.99)
    expect(result).toBe('$99.99')
  })

  it('should handle whole numbers', () => {
    const result = formatPrice(100)
    expect(result).toBe('$100.00')
  })

  it('should handle large numbers', () => {
    const result = formatPrice(1234567.89)
    expect(result).toBe('$1,234,567.89')
  })

  it('should handle zero', () => {
    const result = formatPrice(0)
    expect(result).toBe('$0.00')
  })

  it('should handle negative numbers', () => {
    const result = formatPrice(-50)
    expect(result).toBe('-$50.00')
  })

  it('should handle custom currency', () => {
    const result = formatPrice(99.99, 'EUR')
    expect(result).toMatch(/€|EUR/)
  })
})

describe('formatPhone', () => {
  it('should format US phone numbers', () => {
    const result = formatPhone('5551234567')
    expect(result).toBe('(555) 123-4567')
  })

  it('should handle phone with dashes', () => {
    const result = formatPhone('555-123-4567')
    expect(result).toBe('(555) 123-4567')
  })

  it('should handle phone with parentheses', () => {
    const result = formatPhone('(555) 123-4567')
    expect(result).toBe('(555) 123-4567')
  })

  it('should handle phone with country code', () => {
    const result = formatPhone('+1-555-123-4567')
    expect(result).toBe('+1 (555) 123-4567')
  })

  it('should handle invalid phone numbers', () => {
    const result = formatPhone('123')
    expect(result).toBe('123')
  })
})

describe('validateEmail', () => {
  it('should validate correct emails', () => {
    const validEmails = [
      'test@example.com',
      'user.name@example.com',
      'user+tag@example.co.uk',
      'user_name@example-domain.com'
    ]

    validEmails.forEach(email => {
      expect(validateEmail(email)).toBe(true)
    })
  })

  it('should reject invalid emails', () => {
    const invalidEmails = [
      'notanemail',
      '@example.com',
      'user@',
      'user..name@example.com',
      'user@.com',
      'user name@example.com'
    ]

    invalidEmails.forEach(email => {
      expect(validateEmail(email)).toBe(false)
    })
  })
})

describe('validatePhone', () => {
  it('should validate correct phone numbers', () => {
    const validPhones = [
      '555-123-4567',
      '(555) 123-4567',
      '5551234567',
      '+1-555-123-4567',
      '1-555-123-4567'
    ]

    validPhones.forEach(phone => {
      expect(validatePhone(phone)).toBe(true)
    })
  })

  it('should reject invalid phone numbers', () => {
    const invalidPhones = [
      '123',
      'abcdefghij',
      '555-555-55555',
      '555',
      '(555) 123-456'
    ]

    invalidPhones.forEach(phone => {
      expect(validatePhone(phone)).toBe(false)
    })
  })
})

// Mock image optimization utilities
describe('Image utilities', () => {
  it('should generate image srcset', () => {
    const srcset = generateSrcSet('/image.jpg', [320, 640, 1280])
    expect(srcset).toContain('/image.jpg?w=320')
    expect(srcset).toContain('/image.jpg?w=640')
    expect(srcset).toContain('/image.jpg?w=1280')
  })

  it('should calculate aspect ratio', () => {
    const ratio = calculateAspectRatio(1920, 1080)
    expect(ratio).toBeCloseTo(1.77, 2)
  })

  it('should get image dimensions from URL', () => {
    const dimensions = getImageDimensions('/image_1920x1080.jpg')
    expect(dimensions).toEqual({ width: 1920, height: 1080 })
  })
})

// Mock animation utilities
describe('Animation utilities', () => {
  it('should generate fade in animation', () => {
    const animation = fadeIn()
    expect(animation).toHaveProperty('initial')
    expect(animation).toHaveProperty('animate')
    expect(animation.initial.opacity).toBe(0)
    expect(animation.animate.opacity).toBe(1)
  })

  it('should generate slide in animation', () => {
    const animation = slideIn('left')
    expect(animation.initial.x).toBeLessThan(0)
    expect(animation.animate.x).toBe(0)
  })

  it('should generate stagger children animation', () => {
    const animation = staggerChildren(0.1)
    expect(animation.animate.transition.staggerChildren).toBe(0.1)
  })
})

// Helper functions (these would be imported from actual utils)
function generateSrcSet(src: string, widths: number[]): string {
  return widths.map(w => `${src}?w=${w} ${w}w`).join(', ')
}

function calculateAspectRatio(width: number, height: number): number {
  return width / height
}

function getImageDimensions(url: string): { width: number; height: number } | null {
  const match = url.match(/_(\d+)x(\d+)/)
  if (match) {
    return { width: parseInt(match[1]), height: parseInt(match[2]) }
  }
  return null
}

function fadeIn(duration = 0.5) {
  return {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration }
  }
}

function slideIn(direction: 'left' | 'right' | 'up' | 'down', distance = 20) {
  const initial: any = {}
  
  switch (direction) {
    case 'left':
      initial.x = -distance
      break
    case 'right':
      initial.x = distance
      break
    case 'up':
      initial.y = -distance
      break
    case 'down':
      initial.y = distance
      break
  }
  
  return {
    initial,
    animate: { x: 0, y: 0 },
    transition: { duration: 0.5 }
  }
}

function staggerChildren(stagger = 0.1) {
  return {
    animate: {
      transition: {
        staggerChildren: stagger
      }
    }
  }
}