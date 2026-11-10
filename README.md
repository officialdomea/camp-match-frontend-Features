▼
Hooks / Services
│
▼
API Client
│
▼
FastAPI REST API
│
▼
Backend Domain Layer

The frontend remains independent of internal backend implementation
details, allowing frontend and backend development to proceed in
parallel.

---

# Quality Standard

Camp Match should feel like a real production product, not an
AI-generated template.

Priorities:

text
Excellent UX >
Reusable architecture >
Responsive design >
API-ready data architecture >
Trust and clarity >
Feature count
`

The objective is not simply to create more screens.

The objective is to create a **coherent, trustworthy, maintainable
student-housing platform**.

---

# Core Product Principle

> Student --- Find a home.\
> Property Owner --- Own, list, verify, and manage a property.\
> House Scout --- Represent and manage authorized properties.

**One platform. Three distinct roles. One consistent Camp Match
experience.**

---

## Project Status

Camp Match is actively under development with a strong emphasis on:

- Product quality
- UI consistency
- Maintainable architecture
- API readiness
- Responsive design
- Accessibility
- Trust and safety

## Google sign-in

Live Google sign-in uses the Google Identity Services account button. Configure
the public `VITE_GOOGLE_CLIENT_ID` and set `VITE_USE_MOCK_DATA=false` in the
frontend environment. The backend must expose `POST /auth/google`, verify the
submitted Google credential with Google, create or look up the matching Camp
Match profile, and return the standard authentication `Session` response.
Never put a Google client secret in a `VITE_` variable.
