---
applyTo: '**'
---
Coding standards, domain knowledge, and preferences that AI should follow.

# Copilot Instructions

This project is a web application that allows a business owner to showcase his business on the internet and manage his business through an admin dashboard. The application is built using Next.js and it uses Supabase as the database with Better Auth as the authentication.

## Coding Standards

- No commit allowed if there are ESLint errors or warnings.
- Use single quotes for strings.
- Use async/await for asynchronous code.
- Use const for constants and let for variables that will be reassigned.
- Use destructuring for objects and arrays.
- Use template literals for strings that contain variables.
- Use zod schemas for every API payload.
- Define request/response schemas with Zod then infer TypeScript types.
- Strip out any extra properties (.strict()), and transform/normalize fields as needed (e.g., trim strings).

# Security & Secrets
- Never hardcode secrets or credentials.
- Use environment variables
- Sensitive outputs should be marked with `sensitive = true`.
- Never check in any .env file containing secrets.
- Use environment variables only: define in Vercel dashboard or a secure vault.
- Implement rate limiting on critical API endpoints (e.g., login, password reset) using Vercel Edge functions or Supabase Edge functions.
- Always wrap any async operation (await supabase.from(...).select(), fetch calls, etc.) in a try/catch.
- On the client, use an ErrorBoundary to catch render errors; for unhandled promise rejections, register a global listener.

## Error Handling
- Use try/catch blocks for async operations
- Implement proper error boundaries in React components
- Always log errors with contextual information

## TypeScript Guidelines
- No Implicit or Broad Types. Never use any | unknown | never. All function parameters, returns, and variables must reference a named type from /types directory.
- Every variable, function parameter, and return value must have an explicit, accurate type drawn from /types or an existing module. If no existing type applies, add a new interface or type definition the types directory and import into the source file.
- Use TypeScript for all new code
- Follow functional programming principles where possible
- Use interfaces for data structures and type definitions
- Prefer immutable data (const, readonly)
- Use optional chaining (?.) and nullish coalescing (??) operators.
- Prefer pure functions: no side effects, return new objects instead of mutating.

## React Guidelines
- Use template literals for any string interpolation.
- 
- Destructure objects/arrays at the top of a function or component.
- Maximize performance with SSG/ISR by default. SSR only when necessary (dynamic, per-request data that cannot be cached). All components should be typed and isolated.
- Use functional components with hooks
- Follow the React hooks rules (no conditional hooks)
- Use React.FC type for components with children
- Keep components small and focused
- Use Tailwindcss v4 conventions, methods, features and functionalities for component styling

## Next.js Specific Guidelines
- Leverage Next.js 15’s App Router and React 19 features for high performance, SSG/ISR by default, with only necessary SSR.
- SSG + ISR for all public or shared pages (e.g., marketing, static dashboard sections).
- Use export const dynamic = 'force-static'; or absent fetchCache settings to generate at build time.
- SSR Only If:
	- Page requires per-request, user-specific data (e.g., /dashboard/settings).
	- Use export const dynamic = 'force-dynamic'; and fetch inside the component or Server Component.
- Default: Make a component a Server Component (no "use client") when it:
	- Reads from the database via Prisma/Supabase.
	- Renders static data or ISR/SSG.
	- Only add "use client" at file top when you need React 19 hooks (useState, useEffect, event handlers).
- Integrate Vercel Analytics for Core Web Vitals on the front end.

## Tailwindcss v4 Styling & Design System Guidelines
- Use @import 'tailwindcss'; directive at the entry css file, globals.css
- Prefer built-in Tailwind v4 utilities over custom CSS classes.
- Maintain a consistent design system with utility-first styling. Enforce patterns to avoid “utility soup” and keep bundle size small.

## Database && Authentication Guidelines
- Centralize auth logic; ensure secure session handling and seamless integration with Supabase and Prisma.
- Use Supabase only for realtime features (e.g., subscriptions, storage).
- All core CRUD (reads/writes) go through Prisma to maintain type safety and versioned migrations.
- Use Prisma as primary ORM for type-safe data access; leverage Supabase for storage, edge functions, and realtime events.
- In each route.ts, parse and validate req.json() before any database logic.
- Never interpolate raw user-submitted HTML into React components.
- Use next/image for all images to avoid open redirects or XSS vectors in src.

## Documentation
- Maintain concise Markdown documentation.