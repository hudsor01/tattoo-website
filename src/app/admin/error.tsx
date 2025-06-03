'use client'

import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function AdminErrorPage({ 
  error, 
  reset,
}: { 
  error: Error & { digest?: string }
  reset: () => void 
}) {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/50 rounded-xl p-8 shadow-2xl">
          <div className="text-red-500 mb-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-red-900/20 flex items-center justify-center">
              <AlertCircle className="h-8 w-8" />
            </div>
          </div>
          
          <h3 className="text-xl font-semibold mb-3 text-white">
            Admin Dashboard Error
          </h3>
          
          <p className="text-slate-400 mb-6 leading-relaxed">
            Something went wrong while loading the admin dashboard. 
            This could be a temporary issue or a configuration problem.
          </p>
          
          {error && (
            <details className="text-left mb-6 bg-slate-800/40 rounded-lg border border-slate-700/50">
              <summary className="cursor-pointer text-sm font-medium text-red-400 p-4 hover:bg-slate-800/60 rounded-lg transition-colors">
                Show Technical Details
              </summary>
              <div className="p-4 pt-0">
                <pre className="text-xs bg-slate-950/50 p-3 rounded border border-slate-700/30 overflow-auto text-slate-300 font-mono">
                  {error.message}
                  {error.digest && `\n\nError ID: ${error.digest}`}
                </pre>
              </div>
            </details>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={reset}
              className="inline-flex items-center px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-red-600/20"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            
            <Button
              asChild
              variant="outline"
              className="inline-flex items-center px-6 py-2 bg-slate-800/60 hover:bg-slate-700 text-white border-slate-600 hover:border-slate-500 font-medium rounded-lg transition-all duration-200 hover:scale-105"
            >
              <Link href="/admin">
                <Home className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
          
          <div className="mt-6 pt-6 border-t border-slate-800/50">
            <p className="text-xs text-slate-500">
              If this problem persists, please contact support with the error details above.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
