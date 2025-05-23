'use client'

import CustomersInfinite from '@/components/admin/CustomersInfinite'

export default function CustomersPage() {
  return (
    <div className="p-6 bg-gray-950 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <CustomersInfinite />
      </div>
    </div>
  )
}