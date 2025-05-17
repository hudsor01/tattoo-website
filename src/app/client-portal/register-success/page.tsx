'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function RegisterSuccessPage() {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <div className="min-h-screen bg-tattoo-black flex flex-col items-center justify-center p-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md"
      >
        <motion.div variants={itemVariants} className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-display tracking-wide text-tattoo-white">INK 37</h1>
            <div className="text-xs text-tattoo-red mt-1">Tattoo Studio</div>
          </Link>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-lg text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              </div>
              <CardTitle>Registration Successful!</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Thank you for creating your client account. Your registration has been received.
              </p>
              <p className="mb-4">
                A confirmation email has been sent to your email address. Please check your inbox
                and confirm your email to fully activate your account.
              </p>
              <p>Once your email is confirmed, you'll have full access to your client portal.</p>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 justify-center pt-6">
              <Button asChild className="w-full bg-tattoo-red hover:bg-tattoo-red/90">
                <Link href="/client/login">Go to Login</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/">Return to Homepage</Link>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
