import type { Metadata } from 'next'

export function generateMetadata(): Metadata {
  return {
    title: 'Admin Access | Dashboard',
    description: 'Secure administrator authentication portal',
    robots: 'noindex, nofollow',
  }
}

export default function AdminLayoutServer({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
    </>
  )
}