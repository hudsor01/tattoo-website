/**
 * Production Performance Optimization Utilities
 * Provides comprehensive performance monitoring and optimization tools
 */

import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// Performance Configuration
export interface PerformanceConfig {
  enableCompression: boolean
  enableCaching: boolean
  enableImageOptimization: boolean
  enableLazyLoading: boolean
  maxCacheAge: number
  compressionLevel: number
}

const defaultPerformanceConfig: PerformanceConfig = {
  enableCompression: true,
  enableCaching: true,
  enableImageOptimization: true,
  enableLazyLoading: true,
  maxCacheAge: 31536000, // 1 year
  compressionLevel: 6,
}

// Cache Control Utilities
export class CacheManager {
  static setPublicCache(response: NextResponse, maxAge: number = 3600): NextResponse {
    response.headers.set('Cache-Control', `public, max-age=${maxAge}, s-maxage=${maxAge}`)
    response.headers.set('CDN-Cache-Control', `public, max-age=${maxAge}`)
    response.headers.set('Vercel-CDN-Cache-Control', `public, max-age=${maxAge}`)
    return response
  }

  static setPrivateCache(response: NextResponse, maxAge: number = 300): NextResponse {
    response.headers.set('Cache-Control', `private, max-age=${maxAge}`)
    return response
  }

  static setNoCache(response: NextResponse): NextResponse {
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    return response
  }

  static setStaleWhileRevalidate(response: NextResponse, maxAge: number = 3600, staleTime: number = 86400): NextResponse {
    response.headers.set('Cache-Control', `public, max-age=${maxAge}, stale-while-revalidate=${staleTime}`)
    return response
  }

  static generateETag(content: string): string {
    // Simple ETag generation - in production use a proper hash function
    const hash = Buffer.from(content).toString('base64').slice(0, 16)
    return `"${hash}"`
  }

  static handleConditionalRequest(request: NextRequest, etag: string): NextResponse | null {
    const ifNoneMatch = request.headers.get('if-none-match')
    
    if (ifNoneMatch === etag) {
      const response = new NextResponse(null, { status: 304 })
      response.headers.set('ETag', etag)
      return response
    }
    
    return null
  }
}

// Compression Utilities
export class CompressionManager {
  static shouldCompress(contentType: string, size: number): boolean {
    const compressibleTypes = [
      'text/html',
      'text/css',
      'text/javascript',
      'application/javascript',
      'application/json',
      'text/xml',
      'application/xml',
      'text/plain',
      'image/svg+xml',
    ]
    
    return compressibleTypes.some(type => contentType.includes(type)) && size > 1024 // Only compress files > 1KB
  }

  static async compressResponse(content: string, encoding?: string): Promise<Buffer> {
    // In a real implementation, you would use compression libraries like pako or zlib
    // This is a placeholder for the actual compression logic
    if (encoding === 'gzip' || encoding === 'br') {
      return Buffer.from(content, 'utf-8')
    }
    return Buffer.from(content, 'utf-8')
  }

  static getSupportedEncoding(request: NextRequest): string | null {
    const acceptEncoding = request.headers.get('accept-encoding') || ''
    
    if (acceptEncoding.includes('br')) {
      return 'br' // Brotli
    } else if (acceptEncoding.includes('gzip')) {
      return 'gzip'
    } else if (acceptEncoding.includes('deflate')) {
      return 'deflate'
    }
    
    return null
  }
}

// Image Optimization
export class ImageOptimizer {
  static getOptimizedImageUrl(
    src: string,
    options: {
      width?: number
      height?: number
      quality?: number
      format?: 'webp' | 'avif' | 'png' | 'jpg'
    } = {}
  ): string {
    const { width, height, quality = 75, format } = options
    
    // For Supabase storage
    if (src.includes('supabase.co')) {
      const url = new URL(src)
      if (width) url.searchParams.set('width', width.toString())
      if (height) url.searchParams.set('height', height.toString())
      if (quality) url.searchParams.set('quality', quality.toString())
      if (format) url.searchParams.set('format', format)
      return url.toString()
    }
    
    // For other CDNs, implement according to their API
    return src
  }

  static generateSrcSet(
    src: string,
    sizes: number[] = [320, 640, 768, 1024, 1280, 1920]
  ): string {
    return sizes
      .map(size => `${this.getOptimizedImageUrl(src, { width: size })} ${size}w`)
      .join(', ')
  }

  static getResponsiveSizes(breakpoints: Record<string, number> = {}): string {
    const defaultBreakpoints = {
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      ...breakpoints,
    }
    
    const queries = Object.entries(defaultBreakpoints)
      .sort(([, a], [, b]) => a - b)
      .map(([name, width], index, array) => {
        if (index === array.length - 1) {
          return `${width}px`
        }
        return `(max-width: ${array[index + 1]![1]}px) ${width}px`
      })
    
    return queries.join(', ')
  }
}

// Bundle Analysis and Optimization
export class BundleOptimizer {
  static async analyzeBundleSize(): Promise<{
    totalSize: number
    gzippedSize: number
    chunks: Array<{ name: string; size: number }>
  }> {
    // In a real implementation, this would analyze the Next.js build output
    // This is a placeholder for bundle analysis
    return {
      totalSize: 0,
      gzippedSize: 0,
      chunks: [],
    }
  }

  static getRecommendations(): string[] {
    return [
      'Enable code splitting for large components',
      'Use dynamic imports for non-critical code',
      'Optimize images and use next/image',
      'Remove unused dependencies',
      'Enable tree shaking',
      'Use production builds for deployment',
      'Consider using a CDN for static assets',
      'Implement lazy loading for below-the-fold content',
    ]
  }
}

// Performance Monitoring
export class PerformanceProfiler {
  private static metrics: Map<string, number> = new Map()

  static startTimer(name: string): void {
    this.metrics.set(name, Date.now())
  }

  static endTimer(name: string): number {
    const start = this.metrics.get(name)
    if (!start) {
      console.warn(`Timer '${name}' was not started`)
      return 0
    }
    
    const duration = Date.now() - start
    this.metrics.delete(name)
    return duration
  }

  static async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.startTimer(name)
    try {
      const result = await fn()
      const duration = this.endTimer(name)
      console.log(`[Performance] ${name}: ${duration}ms`)
      return result
    } catch (error) {
      this.endTimer(name)
      throw error
    }
  }

  static measure<T>(name: string, fn: () => T): T {
    this.startTimer(name)
    try {
      const result = fn()
      const duration = this.endTimer(name)
      console.log(`[Performance] ${name}: ${duration}ms`)
      return result
    } catch (error) {
      this.endTimer(name)
      throw error
    }
  }

  static getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics)
  }

  static clearMetrics(): void {
    this.metrics.clear()
  }
}

// Database Query Optimization
export class DatabaseOptimizer {
  private static queryCache: Map<string, { result: unknown; timestamp: number }> = new Map()
  private static readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  static async withCache<T>(
    key: string,
    queryFn: () => Promise<T>,
    ttl: number = this.CACHE_TTL
  ): Promise<T> {
    const cached = this.queryCache.get(key)
    
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.result as T
    }
    
    const result = await queryFn()
    this.queryCache.set(key, { result, timestamp: Date.now() })
    
    return result
  }

  static clearCache(pattern?: string): void {
    if (pattern) {
      for (const key of this.queryCache.keys()) {
        if (key.includes(pattern)) {
          this.queryCache.delete(key)
        }
      }
    } else {
      this.queryCache.clear()
    }
  }

  static getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.queryCache.size,
      keys: Array.from(this.queryCache.keys()),
    }
  }
}

// API Response Optimization
export class APIOptimizer {
  static optimizeResponse(data: unknown): unknown {
    // Remove null values and empty objects/arrays
    if (Array.isArray(data)) {
      return data
        .filter(item => item !== null && item !== undefined)
        .map(item => this.optimizeResponse(item))
    }
    
    if (data && typeof data === 'object') {
      const optimized: Record<string, unknown> = {}
      
      for (const [key, value] of Object.entries(data)) {
        if (value !== null && value !== undefined) {
          if (Array.isArray(value) && value.length === 0) {
            continue // Skip empty arrays
          }
          if (typeof value === 'object' && Object.keys(value as object).length === 0) {
            continue // Skip empty objects
          }
          optimized[key] = this.optimizeResponse(value)
        }
      }
      
      return optimized
    }
    
    return data
  }

  static async compressResponse(response: NextResponse): Promise<NextResponse> {
    const request = new Request(response.url)
    const encoding = CompressionManager.getSupportedEncoding(request as NextRequest)
    
    if (encoding && response.body) {
      const content = await response.text()
      const contentType = response.headers.get('content-type') || ''
      
      if (CompressionManager.shouldCompress(contentType, content.length)) {
        const compressed = await CompressionManager.compressResponse(content, encoding)
        const newResponse = new NextResponse(compressed, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        })
        
        newResponse.headers.set('Content-Encoding', encoding)
        newResponse.headers.set('Content-Length', compressed.length.toString())
        
        return newResponse
      }
    }
    
    return response
  }
}

// Preloading and Prefetching
export class PreloadManager {
  static preloadResource(href: string, as: 'script' | 'style' | 'image' | 'font'): void {
    if (typeof document !== 'undefined') {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = href
      link.as = as
      
      if (as === 'font') {
        link.crossOrigin = 'anonymous'
      }
      
      document.head.appendChild(link)
    }
  }

  static prefetchPage(href: string): void {
    if (typeof document !== 'undefined') {
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.href = href
      document.head.appendChild(link)
    }
  }

  static preconnectToDomain(domain: string): void {
    if (typeof document !== 'undefined') {
      const link = document.createElement('link')
      link.rel = 'preconnect'
      link.href = domain
      link.crossOrigin = 'anonymous'
      document.head.appendChild(link)
    }
  }
}

// Export all optimization utilities
export const optimization = {
  cache: CacheManager,
  compression: CompressionManager,
  image: ImageOptimizer,
  bundle: BundleOptimizer,
  profiler: PerformanceProfiler,
  database: DatabaseOptimizer,
  api: APIOptimizer,
  preload: PreloadManager,
}