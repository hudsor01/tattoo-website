'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export function HeaderNav() {
  return (
    <header className="flex justify-between items-center py-6">
      <Link href="/" className="relative z-20">
        <Image
          src="/logo.png"
          alt="Ink 37 Logo"
          width={140}
          height={65}
          className="h-auto"
          priority
        />
      </Link>

      <div className="space-x-4">
        <Button asChild variant="ghost" className="text-white hover:text-white font-medium">
          <Link href="/services">Services</Link>
        </Button>
        <Button asChild variant="ghost" className="text-white hover:text-white font-medium">
          <Link href="/about">About</Link>
        </Button>
        <Button asChild variant="ghost" className="text-white hover:text-white font-medium">
          <Link href="/contact">Contact</Link>
        </Button>
      </div>
    </header>
  );
}

export default HeaderNav;
