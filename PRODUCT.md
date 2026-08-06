# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

UBC students planning courses, checking tuition, and navigating campus. Primary context: course registration periods and first weeks of term when campus is unfamiliar.

## Product Purpose

AI assistant that answers university-specific questions (courses, prerequisites, tuition, walking distances) grounded in real UBC data, with a map that visualizes campus routes. Replaces scattered lookups across multiple university systems with a single conversational interface.

## Positioning

Tool-calling agent backed by indexed university datasets—answers are sourced from actual course catalogs, tuition tables, and campus GeoJSON, not general LLM knowledge. The map renders real walking routes, not estimates.

## Operating Context

- Students signed in via Google (UBC accounts use Google)
- Chat sessions persist across visits
- Map shows building locations and walking routes when relevant to the conversation
- Used on laptops and phones between classes

## Capabilities and Constraints

**Capabilities:**
- `search_courses`: keyword + filters (subject, credits, term, no-prereqs)
- `get_course`: full record with prerequisites/corequisites
- `get_tuition`: per-credit rate by program, student type, cohort
- `walking_distance`: meters and minutes between buildings

**Constraints:**
- Non-streaming responses (Bedrock Converse API limitation)
- 8-iteration limit on agent loop
- Data freshness depends on ingestion script runs

## Brand Commitments

- Clean, minimal, sleek aesthetic (user-specified)
- No invented testimonials, pricing claims, or fake student quotes

## Evidence on Hand

- University datasets in S3: courses, sections, programs, tuition, buildings, walking distances
- GeoJSON for building locations and walking routes
- No existing visual assets, logo, or brand guidelines

## Product Principles

1. **Grounded answers**: Every response cites which tool provided the data
2. **Campus-native**: The map is not decoration—it visualizes what the agent just told you
3. **Session continuity**: Conversations persist; students pick up where they left off
4. **Minimal friction**: Google sign-in, no onboarding walls, direct to chat

## Accessibility & Inclusion

WCAG 2.1 AA baseline. Map must have text alternatives for route information. Chat must be keyboard-navigable.
