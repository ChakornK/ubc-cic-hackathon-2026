# Implementation Plan: Auth Pages

## Overview

Move auth forms to dedicated routes, refactor the sign-in component, update landing page CTAs, and change the RequireAuth redirect target.

## Tasks

- [ ] 1. Create AuthForm component
  - Refactor `src/components/landing/sign-in-button.tsx` into `src/components/auth/auth-form.tsx`
  - Accept `mode: "login" | "signup"` prop instead of internal toggle
  - Remove mode toggle button; each page is its own mode
  - Add link to opposite page ("Don't have an account? Sign up" / "Already have an account? Sign in")
  - Support `?redirect=` search param for post-auth navigation
  - _Requirements: 1, 2_

- [ ] 2. Create /login page
  - Create `app/login/page.tsx`
  - Centered layout: logo + AuthForm mode="login"
  - Redirect to /chat if already authenticated (client-side, via useAppAuth)
  - _Requirements: 1_

- [ ] 3. Create /signup page
  - Create `app/signup/page.tsx`
  - Centered layout: logo + AuthForm mode="signup"
  - Redirect to /chat if already authenticated
  - _Requirements: 2_

- [ ] 4. Update landing page
  - Remove SignInButton import and usage from `src/components/landing/landing.tsx`
  - Replace hero CTA with Link buttons to /signup (primary) and /login (secondary)
  - Replace bottom CTA section with Link buttons
  - Update copy ("Free to use · Create an account to start" → link-based CTAs)
  - _Requirements: 3_

- [ ] 5. Update RequireAuth redirect
  - In `src/components/shell/app-shell.tsx`, change `router.replace("/")` to `router.replace("/login")`
  - _Requirements: 4_

- [ ] 6. Clean up old sign-in-button
  - Delete `src/components/landing/sign-in-button.tsx` if no longer used
  - Remove any dead imports
  - _Requirements: 3_

- [ ] 7. Verify build passes
  - Run `npm run build`
  - Confirm /login and /signup routes appear in output
  - Confirm no broken imports
  - _Requirements: all_

## Notes

- No API changes needed — existing /api/auth/login and /api/auth/register remain as-is
- The auth context (AppAuthProvider) is already at the root layout level, so new pages have access
- Landing page keeps its auto-redirect for signed-in users (checking auth.status)
