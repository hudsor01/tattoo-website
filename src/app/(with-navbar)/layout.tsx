import type { ReactNode } from 'react';
import Navbar from '@/components/layouts/Navbar';

interface WithNavbarLayoutProps {
  children: ReactNode;
}

export default function WithNavbarLayout({ children }: WithNavbarLayoutProps) {
  return (
    <>
      <Navbar />
      <div className="pt-20">
        {children}
      </div>
    </>
  );
}