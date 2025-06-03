'use client'

import React from 'react'

export function AdminHeader() {
  return (
    <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6">
      {/* Left side - could be used for breadcrumbs or page title */}
      <div className="flex items-center">
        {/* This matches the minimal header in the reference image */}
      </div>
      
      {/* Right side - user actions or notifications could go here */}
      <div className="flex items-center gap-3">
        {/* Keep minimal to match the reference design */}
      </div>
    </header>
  )
}
