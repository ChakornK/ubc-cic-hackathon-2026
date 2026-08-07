# Design Document: Auth Pages

## Overview

Extract the authentication form from the landing page into dedicated `/login` and `/signup` routes. The existing `SignInButton` component is refactored into a reusable `AuthForm` that accepts a `mode` prop. The landing page replaces inline forms with link CTAs. The `RequireAuth` guard redirects to `/login` instead of `/`.

## Architecture

```mermaid
graph TD
    A[/ landing] -->|CTA links| B[/login]
    A -->|CTA links| C[/signup]
    B -->|success| D[/chat]
    C -->|success| D
    B <-->|toggle link| C
    E[RequireAuth] -->|unauthenticated| B
    D -->|signOut| B
```

## Components and Interfaces

### Component 1: AuthForm (refactored from SignInButton)

**Purpose**: Shared form component for both login and signup pages.

**Interface**:

```tsx
interface AuthFormProps {
  mode: "login" | "signup";
  wide?: boolean;
}
```

**Responsibilities**:

- Renders username/password form
- Calls `auth.signIn()` or `auth.register()` based on mode
- Shows inline errors
- Redirects to `/chat` on success (or to `?redirect=` param if present)
- Links to the opposite page ("/login" ↔ "/signup")

### Component 2: app/login/page.tsx

**Purpose**: Login route page.

**Responsibilities**:

- Renders AuthForm with mode="login"
- Redirects to /chat if already authenticated
- Centered card layout with branding

### Component 3: app/signup/page.tsx

**Purpose**: Signup route page.

**Responsibilities**:

- Renders AuthForm with mode="signup"
- Redirects to /chat if already authenticated
- Centered card layout with branding

### Component 4: Landing page (modified)

**Purpose**: Product marketing page without inline auth.

**Responsibilities**:

- Remove SignInButton imports/usage
- Replace with Link CTAs to /login and /signup
- Keep auto-redirect for signed-in users

### Component 5: RequireAuth (modified)

**Purpose**: Client-side auth guard.

**Change**: Redirect destination from `/` to `/login`.

## Data Models

No new data models. Existing auth API and localStorage token management unchanged.

## Error Handling

### Error Scenario 1: Login failure

**Condition**: Invalid credentials
**Response**: Inline error "Login failed. Check your username and password."
**Recovery**: User corrects input and retries

### Error Scenario 2: Registration failure

**Condition**: Username taken or validation fails
**Response**: Inline error from API (or fallback "Registration failed. The username may already be taken.")
**Recovery**: User picks different username

### Error Scenario 3: Already authenticated

**Condition**: Signed-in user visits /login or /signup
**Response**: Immediate redirect to /chat
**Recovery**: N/A — user lands where they need to be

## Testing Strategy

### Verification

- `npm run build` passes with new routes
- Both `/login` and `/signup` render correctly
- Auth flow works end-to-end (form → API → redirect)
- RequireAuth redirects to `/login`
- Landing page has no auth forms, only CTA links

## Performance Considerations

- Login/signup pages are lightweight (no heavy components)
- Static generation for the shell, client-side auth check for redirect

## Dependencies

- No new dependencies
- Reuses existing `useAppAuth()` context
- Reuses existing API routes (`/api/auth/login`, `/api/auth/register`)
