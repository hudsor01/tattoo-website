import 'server-only';

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "./db/prisma";

export const auth = betterAuth({
appName: "Ink 37 Tattoos",
secret: process.env['BETTER_AUTH_SECRET'] ?? (() => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('BETTER_AUTH_SECRET environment variable is required in production');
  }
  return process.env['DEV_BETTER_AUTH_SECRET'] ?? '';
})(),

database: prismaAdapter(prisma, {
provider: "postgresql"
}),

plugins: [
admin({
defaultRole: "user",
adminRoles: ["admin"],
}),
nextCookies() // Must be last plugin as per Better Auth docs
],

// Auto-assign admin role to specific emails using Better Auth hooks
hooks: {
  after: async (ctx: any) => {
    if (ctx.user?.email) {
      const adminEmails = ['fennyg83@gmail.com', 'ink37tattoos@gmail.com'];
      if (adminEmails.includes(ctx.user.email) && ctx.user.role !== 'admin') {
        // Update user role to admin
        await prisma.user.update({
          where: { id: ctx.user.id },
          data: { role: 'admin' },
        });
      }
    }
  },
},
  
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    requireEmailVerification: false,
  },
  
  socialProviders: {
    google: {
      clientId: process.env['GOOGLE_CLIENT_ID'] as string,
      clientSecret: process.env['GOOGLE_CLIENT_SECRET'] as string,
      scope: ["openid", "email", "profile"],
    },
  },
  
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60 // Cache for 5 minutes
    }
  },
  
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
        required: false,
      },
      phone: {
        type: "string",
        required: false,
      },
    },
  },
  
  trustedOrigins: [
    "http://localhost:3000",
    "https://ink37tattoos.com", 
    "https://www.ink37tattoos.com",
  ],
  
  baseURL: process.env.NODE_ENV === "production" 
    ? "https://ink37tattoos.com" 
    : "http://localhost:3000",
    
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    cookies: {
      session_token: {
        attributes: {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax"
        }
      }
    }
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
