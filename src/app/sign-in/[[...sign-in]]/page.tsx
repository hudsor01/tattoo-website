'use client';

import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black px-4 py-8">
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .cl-footerAction,
          .cl-footer,
          .cl-footerActionLink,
          .cl-footerActionText,
          .cl-footerPages {
            display: none !important;
          }
        `,
        }}
      />
      <div className="w-full max-w-md relative">
        <SignIn
          forceRedirectUrl="/admin"
          fallbackRedirectUrl="/admin"
          appearance={{
            variables: {
              colorPrimary: '#dc2626',
              colorBackground: '#0f0f0f',
              colorText: '#ffffff',
              fontSize: '17px',
              fontFamily: 'system-ui, sans-serif',
              borderRadius: '12px',
            },
            elements: {
              card: 'bg-zinc-900/90 backdrop-blur-md border border-zinc-700/50 shadow-2xl rounded-xl p-8',
              headerTitle: 'text-white text-2xl font-bold mb-2',
              headerSubtitle: 'text-zinc-400 text-base font-medium mb-6',
              socialButtonsBlockButton:
                'bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 !text-white font-semibold py-4 px-6 text-lg rounded-xl transition-all duration-200 ease-in-out transform hover:scale-[1.02]',
              socialButtonsBlockButtonText: '!text-white font-semibold text-lg [&>*]:!text-white',
              formFieldInput:
                'bg-zinc-800/70 border-2 border-zinc-600/50 focus:border-red-500 text-white py-4 px-4 text-lg rounded-xl transition-colors duration-200',
              formFieldLabel: 'text-zinc-300 text-lg font-semibold mb-2',
              formButtonPrimary:
                'bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 py-4 px-6 text-lg font-bold rounded-xl transition-all duration-200 ease-in-out transform hover:scale-[1.02] text-white',
              footerActionLink: 'hidden',
              footerAction: 'hidden',
              footer: 'hidden',
              footerActionText: 'hidden',
              footerPages: 'hidden',
              dividerLine: 'bg-zinc-700/50',
              dividerText: 'text-zinc-500 text-base font-medium px-4',
            },
          }}
        />

        {/* Enhanced glow effect */}
        <div className="absolute -inset-4 bg-gradient-to-br from-red-500/20 via-red-500/5 to-orange-500/20 rounded-2xl blur-xl pointer-events-none -z-10" />
        <div className="absolute -inset-2 bg-gradient-to-br from-red-500/10 via-transparent to-orange-500/10 rounded-xl pointer-events-none -z-10" />
      </div>
    </div>
  );
}
