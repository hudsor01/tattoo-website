import { Shield } from 'lucide-react'
import Image from 'next/image'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-linear-to-br from-black via-gray-900 to-black overflow-hidden">
      <header className="relative z-10 p-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-linear-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-white">
              Ink 37 Admin
            </span>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex items-center justify-center px-6 py-12 min-h-[calc(100vh-120px)]">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="relative h-20 w-20 mx-auto mb-4">
              <Image
                src="/logo.png"
                alt="Ink 37 Tattoos Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="text-2xl text-red-500 mb-2">
              Ink 37 Tattoos
            </div>
          </div>

          <div className="bg-black/40 border border-white/20 rounded-2xl shadow-2xl p-8 text-center">
            <div className="text-center mb-8">
              <div className="h-16 w-16 bg-linear-to-r from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Loading Admin Panel
              </h1>
              <p className="text-white/70">
                Please wait while we set up your dashboard
              </p>
            </div>

            <LoadingSpinner className="my-8" />
          </div>
        </div>
      </main>
    </div>
  )
}