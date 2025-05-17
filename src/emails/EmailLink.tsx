'use client';

import React from 'react';
import { FaEnvelope } from 'react-icons/fa';
import type { EmailLinkProps } from '@/types/ui/component-types';

export default function EmailLink({
  email,
  children,
  className = '',
  showIcon = false,
}: EmailLinkProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.href = `mailto:${email || 'fennyg83@gmail.com'}`;
  };

  return (
    <a href="#" onClick={handleClick} className={className}>
      {showIcon && <FaEnvelope className="inline-block mr-2" />}
      {children}
    </a>
  );
}
