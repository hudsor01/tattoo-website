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

          /* AGGRESSIVE LOGO SIZING - Multiple selectors for all scenarios */
          .cl-logoImage,
          .cl-logoImg,
          .cl-headerLogo img,
          .cl-headerLogo,
          .cl-header img,
          .cl-card .cl-header img,
          .cl-main .cl-header img,
          .cl-signUp-start .cl-header img,
          .cl-signIn-start .cl-header img,
          [data-localization-key="logoImageAltText"],
          .cl-header .cl-logoImage,
          .cl-header .cl-logoImg,
          .cl-header [data-localization-key="logoImageAltText"],
          .cl-card .cl-logoImage,
          .cl-card .cl-logoImg,
          .cl-main .cl-logoImage,
          .cl-main .cl-logoImg,
          .cl-signUp .cl-logoImage,
          .cl-signUp .cl-logoImg,
          .cl-signIn .cl-logoImage,
          .cl-signIn .cl-logoImg {
            width: 300px !important;
            height: auto !important;
            max-width: none !important;
            max-height: none !important;
            min-width: 300px !important;
            transform: scale(1) !important;
            object-fit: contain !important;
          }

          /* Logo container styling */
          .cl-logoBox,
          .cl-headerLogo,
          .cl-header .cl-logoBox,
          .cl-header .cl-headerLogo,
          .cl-card .cl-logoBox,
          .cl-card .cl-headerLogo {
            height: auto !important;
            width: 100% !important;
            margin-bottom: 32px !important;
            text-align: center !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
          }

          /* Force all img tags inside Clerk components to be large, EXCLUDING social provider icons */
          .cl-rootBox img:not(.cl-socialButtonsProviderIcon__google):not(.cl-providerIcon),
          .cl-card img:not(.cl-socialButtonsProviderIcon__google):not(.cl-providerIcon),
          .cl-main img:not(.cl-socialButtonsProviderIcon__google):not(.cl-providerIcon),
          .cl-header img:not(.cl-socialButtonsProviderIcon__google):not(.cl-providerIcon),
          .cl-signUp img:not(.cl-socialButtonsProviderIcon__google):not(.cl-providerIcon),
          .cl-signIn img:not(.cl-socialButtonsProviderIcon__google):not(.cl-providerIcon),
          img[alt*="logo"]:not(.cl-socialButtonsProviderIcon__google):not(.cl-providerIcon),
          img[src*="logo"]:not(.cl-socialButtonsProviderIcon__google):not(.cl-providerIcon),
          img[src="/logo.png"] {
            min-width: 300px !important;
            width: 300px !important;
            height: auto !important;
            max-width: none !important;
            transform: scale(1.5) !important;
          }

          /* Style for social provider icons (e.g., Google icon) */
          .cl-socialButtonsProviderIcon__google,
          .cl-providerIcon {
            width: 24px !important; /* Or your desired size */
            height: 24px !important; /* Or your desired size */
            min-width: unset !important;
            transform: scale(1) !important; /* Reset scaling */
            margin-right: 8px !important; /* Optional: add some space next to text */
          }

          /* Nuclear option - force ALL images in auth to be huge, EXCLUDING social provider icons */
          div[data-clerk-theme] img:not(.cl-socialButtonsProviderIcon__google):not(.cl-providerIcon),
          [data-clerk-appearance] img:not(.cl-socialButtonsProviderIcon__google):not(.cl-providerIcon),
          .cl-component img:not(.cl-socialButtonsProviderIcon__google):not(.cl-providerIcon) {
            width: 300px !important;
            min-width: 300px !important;
            height: auto !important;
            max-width: 300px !important;
            transform: scale(1.5) !important;
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
            layout: {
              logoPlacement: 'none',
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
              logoBox: 'flex justify-center items-center w-full mb-8',
              logoImage: 'w-[250px] h-auto',
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
