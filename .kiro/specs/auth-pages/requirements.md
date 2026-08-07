# Requirements Document

## Introduction

Move the authentication flow from the landing page into dedicated `/login` and `/signup` routes. The landing page becomes a pure marketing surface; authentication lives on its own pages with proper routing.

## Glossary

- **RequireAuth**: Client-side guard component that redirects unauthenticated users
- **AppAuthProvider**: React context providing signIn/register/signOut/getToken
- **Landing page**: The `/` route — currently contains the sign-in form inline

## Requirements

### Requirement 1: Dedicated login page at /login

**User Story:** As a returning user, I want a focused login page so I can sign in without scrolling through marketing content.

#### Acceptance Criteria

1. WHEN a user navigates to `/login`, THE system SHALL render a login form with username and password fields.
2. WHEN the user submits valid credentials, THE system SHALL authenticate them and redirect to `/chat`.
3. WHEN the user is already authenticated and visits `/login`, THE system SHALL redirect them to `/chat`.
4. THE login page SHALL include a link to `/signup` for users who need to create an account.
5. WHEN login fails, THE system SHALL display the error inline with recovery guidance.

### Requirement 2: Dedicated signup page at /signup

**User Story:** As a new user, I want a focused registration page so I can create an account without distraction.

#### Acceptance Criteria

1. WHEN a user navigates to `/signup`, THE system SHALL render a registration form with username and password fields.
2. WHEN the user submits valid registration data, THE system SHALL create their account, authenticate them, and redirect to `/chat`.
3. WHEN the user is already authenticated and visits `/signup`, THE system SHALL redirect them to `/chat`.
4. THE signup page SHALL include a link to `/login` for users who already have an account.
5. WHEN registration fails, THE system SHALL display the error inline (e.g., "Username already taken").

### Requirement 3: Landing page becomes auth-free

**User Story:** As a visitor, I want the landing page to focus on explaining the product, with clear CTAs that direct me to sign up or log in.

#### Acceptance Criteria

1. THE landing page SHALL NOT contain inline authentication forms.
2. THE landing page SHALL contain CTA buttons/links directing to `/login` or `/signup`.
3. WHEN an authenticated user visits `/`, THE system SHALL redirect them to `/chat` (existing behavior preserved).

### Requirement 4: Route protection redirects to /login

**User Story:** As a developer, I want unauthenticated users to land on the login page so the flow is clear.

#### Acceptance Criteria

1. WHEN an unauthenticated user tries to access `/chat`, THE RequireAuth guard SHALL redirect to `/login` instead of `/`.
2. THE login page SHALL preserve the intended destination and redirect back after successful auth.
