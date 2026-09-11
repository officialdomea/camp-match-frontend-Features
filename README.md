# Camp match frontend

CAMP MATCH — FRONTEND MASTER BUILD PROMPT

Build the frontend for Camp Match, a modern student-housing marketplace for discovering verified accommodation, connecting with trusted House Scouts, and eventually handling bookings and secure transactions.

IMPORTANT DEVELOPMENT RULE

We are starting with the frontend only.

Do NOT build or assume a backend yet.

Use mock JSON data for all dynamic content so the frontend can be developed independently.

The eventual backend will be a Python/FastAPI REST API returning JSON responses, often as arrays of objects.

The frontend architecture MUST therefore make it extremely easy to replace mock data with real API calls later without rewriting UI components.

Do NOT hard-code property information, users, listings, bookings, messages, etc. directly inside UI components.

Instead, separate:

UI components

feature logic

mock data

API/service layer

types/interfaces

The UI should consume data through reusable functions/services/hooks.

For example:

UI Component
↓
Feature Hook / Service
↓
Data Provider
↓
Mock JSON

Later this should become:

UI Component
↓
Feature Hook / Service
↓
API Service
↓
FastAPI

The UI should not need to change when the data source changes.

1. PRODUCT DESIGN DIRECTION

Camp Match should feel like:

Airbnb × modern fintech × student lifestyle platform

but adapted specifically for students in Nigeria.

The product should feel:

Modern

Trustworthy

Premium

Youthful

Clean

Simple

Safe

Mobile-first

Avoid making it look like an old-fashioned Nigerian real-estate website.

Avoid excessive gradients, excessive glassmorphism, cluttered dashboards, or overly corporate visuals.

The primary feeling should be:

"I can trust this platform to help me find a place near my school."

2. VISUAL STYLE

Use a warm, premium visual system.

Suggested palette:

Primary

Deep green / emerald tones representing:

Trust

Growth

Safety

Stability

Background

Warm off-white / very light neutral.

Text

Dark charcoal rather than pure black.

Accent

A subtle warm gold/orange accent for important highlights.

Supporting colors

Use restrained:

Success green

Warning amber

Error red

Neutral gray

Do not use too many colors.

The interface should remain visually calm.

3. TYPOGRAPHY

Use a modern highly readable sans-serif font.

Prefer:

Inter

or another clean modern UI font if Inter is unavailable.

Typography hierarchy should be obvious:

Large page headings

Medium section headings

Comfortable body text

Small metadata

Strong price typography

Example:

Find a place
that feels like home.

Discover verified student
housing near your campus.

4. RESPONSIVE DESIGN

The application must be mobile-first.

Camp Match is primarily intended for students using smartphones.

Design for:

Small mobile

Large mobile

Tablet

Desktop

Large desktop

Do not simply shrink the desktop design onto mobile.

The mobile experience should be intentionally designed.

5. MOBILE NAVIGATION

Use a bottom navigation on mobile.

Home
Discover
Saved
Messages
Profile

Use appropriate icons with labels.

The active navigation item should be visually obvious.

Desktop should use a sidebar or responsive navigation depending on screen width.

6. DESKTOP LAYOUT

Desktop should use a clean application shell.

Example:

┌──────────────────────────────────────────────────────┐
│ CAMP MATCH Search... 🔔 Avatar │
├──────────────┬───────────────────────────────────────┤
│ │ │
│ Home │ │
│ Discover │ MAIN CONTENT │
│ Saved │ │
│ Messages │ │
│ Bookings │ │
│ Profile │ │
│ │ │
└──────────────┴───────────────────────────────────────┘

Do not make the sidebar unnecessarily large.

7. CORE UX PRINCIPLE

Design the application around the student's journey, not around backend modules.

The main experience should be:

Landing
↓
Register / Login
↓
Onboarding
↓
Home
↓
Discover
↓
Search / Filter
↓
Property Details
↓
Save / Contact Scout
↓
Booking
↓
Payment
↓
Confirmation

Backend architecture should not determine frontend navigation.

8. DEVELOPMENT APPROACH

Build the frontend bit by bit.

Do NOT attempt to generate every screen and feature at once.

Start with:

Phase 1

Build only:

Design system

Application shell

Home

Discover

Property Card

Property Details

Make these polished and production-quality before moving forward.

After those are complete, continue to:

Phase 2

Authentication:

Login

Register

Onboarding

Phase 3

Student functionality:

Saved listings

Bookings

Payment UI

Phase 4

Communication:

Messages

Notifications

Phase 5

Trust:

Identity verification

Property verification

Scout verification

Phase 6

House Scout experience:

Scout dashboard

My listings

Add property

Manage listings

Phase 7

Admin interface.

Do not build Phase 2–7 until Phase 1 has a strong visual foundation.

9. COMPONENT-FIRST DEVELOPMENT

Create reusable components instead of duplicating markup.

Create a component system containing reusable primitives such as:

Button
Input
Select
Textarea
SearchInput
Modal
Drawer
Dropdown
Tabs
Badge
Avatar
Toast
Skeleton
EmptyState
ErrorState
LoadingState
Pagination

Then create Camp Match-specific components:

PropertyCard
PropertyGrid
PropertyGallery
PropertyFeatures
PropertyLocation
VerificationBadge
ScoutCard
BookingCard
BookingStatus
MessagePreview
NotificationItem

Do not put everything into one huge component.

Keep components modular and reusable.

10. DATA ARCHITECTURE

This is extremely important.

Create separate mock data files.

Example:

src/
data/
mock/
listings.ts
users.ts
scouts.ts
bookings.ts
messages.ts
notifications.ts
universities.ts

Use arrays of objects.

Example:

export const mockListings = [
{
id: "listing_001",
title: "Modern Self-Contained Apartment",
price: 450000,
pricePeriod: "year",
accommodationType: "self-contained",
images: [...],
location: {
area: "Satellite Town",
city: "Calabar",
distanceFromCampus: 1.2
},
verified: true,
scout: {...},
features: [...]
}
]

The exact fields can evolve, but the important principle is:

Components consume objects from data sources rather than containing hard-coded content.

11. DO NOT HARDCODE UI DATA

Bad:

<h2>Modern Self-Contained Apartment</h2>
<p>₦450,000</p>
<p>Satellite Town</p>

inside a reusable PropertyCard.

Good:

<PropertyCard listing={listing} />

Then:

listing.title
listing.price
listing.location
listing.images

The same component should work for every listing.

12. CREATE A DATA ACCESS LAYER

Even though we're using mock data, don't import mock arrays directly into every component.

Use a service/repository-style abstraction.

For example:

features/
listings/
components/
hooks/
services/
types/

A service might expose:

getListings()
getListingById(id)
searchListings(params)
getSavedListings()

Initially these functions can return mock data.

Later they can call:

GET /api/v1/listings
GET /api/v1/listings/:id

without requiring the PropertyCard or Listing page to change.

13. API-READY ARCHITECTURE

Create an API client abstraction even though the backend is not connected yet.

Conceptually:

Component
↓
Hook
↓
Service
↓
API Client

The API client should eventually handle:

Base URL

HTTP requests

Authentication headers

JSON serialization

Error normalization

Request cancellation

API versioning

For now, use mock implementations.

Do not put:

fetch(...)

directly inside visual components.

14. TYPES

Create TypeScript types/interfaces for the frontend data.

For example:

Listing
User
Scout
Booking
Message
Notification
University
Verification
Payment

Keep frontend types based on the API representation, not database schemas.

The backend will eventually expose JSON DTO-style responses.

The frontend should consume those representations.

15. PROPERTY CARD

Make PropertyCard one of the strongest reusable components in the application.

It should support:

Property image

Favorite button

Property title

Price

Price period

Location

Distance from university

Accommodation type

Verification badge

Scout information where appropriate

Example:

┌───────────────────────────────┐
│ │
│ PROPERTY IMAGE │
│ ♡ │
│ │
├───────────────────────────────┤
│ Self-contained apartment │
│ │
│ ₦450,000 / year │
│ 📍 Satellite Town │
│ 1.2 km from campus │
│ │
│ ✓ Verified │
└───────────────────────────────┘

Make the entire card interactive.

16. HOME PAGE

Create a beautiful student-focused dashboard.

Top:

Good morning 👋

Find your next home.

Search:

🔍 Search by university, area or property

Sections:

Recommended for you

Near your campus

Recently added

Use horizontal scrolling sections on mobile where appropriate.

Do not overload the screen.

17. DISCOVER PAGE

This is the core Camp Match experience.

Include:

Discover

[ Search ]

Filters
Sort

Filters should include:

University

Location

Price range

Accommodation type

Distance

Verified listings

Display listings using reusable PropertyCards.

Use responsive grids.

Mobile:

1 column

Tablet:

2 columns

Desktop:

3–4 columns depending on width

18. PROPERTY DETAILS PAGE

Make this feel premium.

Structure:

← Back

Image gallery

Property title

Price

Location

Verification

Description

Features

Location/map

Scout information

Availability

Booking CTA

Mobile should have a sticky bottom action:

₦450,000/year

[ Request booking ]

Desktop can use a sticky booking card on the right side.

19. TRUST SYSTEM

Verification is a core Camp Match differentiator.

Create reusable:

VerificationBadge
VerificationCard
VerificationStatus

Don't just show:

✓ Verified

Create a useful explanation:

✓ Camp Match Verified

Identity verified
Property information reviewed
Scout verified

Make verification feel trustworthy but not overwhelming.

20. STATE DESIGN

Every API-driven feature must intentionally support:

Loading
Success
Empty
Error

Also support relevant transitional states.

Examples:

Payment processing
Verification pending
Booking pending
Booking confirmed
Booking cancelled

Use skeleton loaders rather than blank screens.

Create reusable:

Skeleton
LoadingState
EmptyState
ErrorState

21. MOCK DATA MUST LOOK REALISTIC

Don't use:

Property 1
Property 2
Property 3

Use realistic Nigerian student-housing examples.

Use realistic:

Property names

Nigerian locations

Naira pricing

Universities

Areas

Distances

Scout profiles

Property images

But keep the data clearly mock/demo data.

The mock structure should closely resemble what a real FastAPI JSON response would look like.

22. ROUTING

Use frontend routes based on user experiences:

/
/login
/register
/onboarding
/home
/discover
/listings/:id
/saved
/messages
/messages/:id
/bookings
/bookings/:id
/payments
/profile

Later:

/scout
/scout/listings
/scout/listings/new
/scout/bookings

Do not create routes based on backend modules such as:

/housing-module
/payment-module
/identity-module

23. ACCESSIBILITY

Build accessible UI from the beginning.

Include:

Keyboard navigation

Proper labels

Semantic HTML

Accessible buttons

Focus states

Appropriate contrast

Alt text

Screen-reader-friendly states

Do not sacrifice accessibility for visual design.

24. ANIMATION

Use subtle animations.

Good:

Card hover

Button feedback

Page transitions

Modal transitions

Skeleton shimmer

Favorite interaction

Navigation transitions

Avoid excessive animation.

The interface should feel smooth, not flashy.

25. MOBILE UX

Pay special attention to:

Thumb-friendly buttons

Bottom navigation

Sticky CTAs

Horizontal scrolling

Bottom sheets for filters

Large touch targets

Readable typography

Fast-loading cards

Image optimization

The mobile experience should feel like a real mobile application even though this is a web frontend.

26. BACKEND INTEGRATION LATER

When the FastAPI backend becomes available, the replacement should look approximately like:

Current:

Component
↓
Hook
↓
ListingService
↓
MockProvider

Later:

Component
↓
Hook
↓
ListingService
↓
API Client
↓
FastAPI

The UI components should remain unchanged.

Do not design the application in a way where replacing mock data requires rewriting pages.

27. ENVIRONMENT CONFIGURATION

Do not hard-code API URLs.

Prepare for:

Development
Staging
Production

Use environment variables for the API base URL.

Example concept:

VITE_API_BASE_URL

Do not put secrets in frontend environment variables.

Remember that frontend environment variables are public.

28. CODE QUALITY

Keep the code:

Modular

Typed

Reusable

Readable

Maintainable

Avoid:

Giant components

Repeated UI

Hard-coded data

Inline API calls

Duplicate business logic

Unnecessary global state

Keep server state and UI state conceptually separate.

29. IMPORTANT BACKEND BOUNDARY

The frontend should NEVER assume:

Database structure

Database IDs beyond documented API identifiers

Repository behavior

Backend implementation

Internal Python classes

Internal services

Storage providers

Undocumented API fields

The frontend depends only on the eventual API contract.

30. FIRST BUILD — DO THIS NOW

For the first implementation, build ONLY:

Design system

Colors

Typography

Spacing

Buttons

Inputs

Cards

Badges

Navigation

Skeletons

Empty states

Error states

Application shell

Desktop sidebar

Mobile bottom navigation

Header

Student Home

Discover

PropertyCard

Property Details

Use mock JSON data.

Do NOT build:

Payments

Admin

Scout dashboard

Messaging

Verification workflows

Complex authentication

yet.

Those come later.

31. BUILD IN SMALL ITERATIONS

After completing the first build, STOP.

Do not automatically generate the rest of the application.

I want to review the first experience and then continue feature-by-feature.

The development sequence should be:

STEP 1
Design system

↓

STEP 2
App shell

↓

STEP 3
Home

↓

STEP 4
Discover

↓

STEP 5
Property Card

↓

STEP 6
Property Details

↓

STOP FOR REVIEW

Only after review should we continue.

32. FINAL GOAL

The final Camp Match frontend should feel like a real production SaaS/mobile marketplace, not an AI-generated template.

Prioritize:

Excellent UX > number of screens

Reusable architecture > quick hacks

Responsive design > desktop-only design

API-ready data architecture > hard-coded mockups

Trust and clarity > visual complexity

Build the foundation carefully so that when the FastAPI backend is connected, the frontend can transition from mock data to real JSON API responses with minimal changes.

Start now with Phase 1 only.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b1fba615-b86b-46fc-b9b7-8db291949137).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
