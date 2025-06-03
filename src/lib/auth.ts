import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
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
adminRoles: ["admin", "superadmin"],
})
],

// Auto-assign admin role to specific emails
hooks: {
user: {
created: async ({ user }) => {
const adminEmails = [
"ink37tattoos@gmail.com",
"fennyg83@gmail.com"
];

if (user.email && adminEmails.includes(user.email.toLowerCase())) {
await prisma.user.update({
where: { id: user.id },
data: { role: "admin" }
});
}
},
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
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
