# Architecture

## Overview

Chef Gerson Canales is an Angular 21 application for private-chef and catering services.

The project combines a public bilingual website with a protected Admin area. Angular communicates with the backend through application-level HTTP contracts, while Supabase is the current backend implementation for database, storage and authentication.

## Tech Stack

- Angular 21
- TypeScripts
- SCSS
- Angular Router
- Angular Signals
- RxJS
- Angular HttpClient
- Angular SSR / prerendering
- Reactive Forms
- `ngx-translate`
- Vitest
- ESLint
- Supabase Database
- Supabase Storage
- Supabase Edge Functions
- Resend
- Netlify

## Application Structure

```text
src/app/
├── core/
├── features/
├── layout/
├── pages/
└── shared/
```

### Core

Application-wide infrastructure:

- authentication
- route guards
- HTTP interceptor
- language management
- shared configuration

### Features

Business-specific models, API clients and state services:

```text
features/
├── gallery/
├── quote-request/
└── service-document/
```

### Layout

The application separates public and administrative shells:

```text
layout/
├── public-layout/
└── admin-layout/
```

The public layout owns the Header, Footer and routed public content.

The Admin layout owns protected navigation, logout and routed administrative content.

## Routing

Public routes:

```text
/
├── /servicios
├── /galeria
├── /solicitar-presupuesto
├── /sobre-el-chef
├── /privacidad
├── /aviso-legal
├── /cookies
└── /404
```

Administrative routes:

```text
/admin/login
/admin
/admin/quote-requests/:id
/admin/service-document
```

Public pages are prerendered where appropriate.

The Admin area uses client rendering because authentication state is restored in the browser.

## HTTP API Boundary

Angular does not perform business Database or Storage operations directly.

The main application flow is:

```text
Page / Component
      ↓
Feature service
Signals + RxJS
      ↓
API client
HttpClient + Observable<T>
      ↓
Supabase Edge Function
      ↓
Database / Storage / Auth
```

This keeps Angular dependent on application HTTP contracts instead of persistence details.

## Authentication

Authentication is exposed through an application-level HTTP boundary.

```text
Admin UI / Guard / Interceptor
      ↓
AuthService
      ↓
AuthSessionService
      ↓
AuthApiService
      ↓
HttpClient
      ↓
Supabase Edge Function
      ↓
Supabase Auth
```

The session layer exposes the authenticated user and access token through Signals.

Protected API requests receive the current Bearer token through a functional HTTP interceptor.

Session refresh is coordinated so concurrent refresh requests share the same in-flight operation.

## State Management

Angular Signals are used for synchronous application and UI state.

Feature services own mutable state and expose readonly state to components.

RxJS is used to compose asynchronous HTTP workflows, synchronize request results with Signal-based state, handle errors and pending states, and coordinate authentication refresh flows.

## Quote Request

The public Quote Request feature uses Reactive Forms and supports an optional attachment.

Submission flow:

```text
Reactive Form
      ↓
QuoteRequestService
      ↓
QuoteRequestApiService
      ↓
HttpClient
      ↓
Supabase Edge Function
      ↓
Database / private Storage
      ↓
notification workflow
```

The Admin area supports:

- request listing
- request detail
- status updates
- request deletion
- private attachment access through temporary signed URLs

## Service Documents

The Services page exposes dedicated Spanish and English downloadable PDFs.

The public route selects the document for the active language.

The protected Admin workflow manages the bilingual document set through the existing HTTP / Edge Function boundary.

Files remain in private Supabase Storage and public downloads use short-lived signed URLs.

## Internationalization

Spanish and English content is stored in:

```text
public/i18n/es.json
public/i18n/en.json
```

Templates consume translation keys through `ngx-translate`.

The same approach is used for visible copy, accessible labels and image alternative text.

## Image Delivery

Static assets are served locally from `public/images`.

The current strategy uses:

- WebP for photographic and large decorative assets where appropriate
- reduced intrinsic dimensions for oversized source images
- `NgOptimizedImage` for suitable Angular-managed images
- `priority` for critical above-the-fold / LCP images
- lazy loading for non-critical images
- explicit dimensions or `fill` to preserve layout stability
- responsive `<picture>` sources where a dedicated mobile asset is useful

CSS background assets and animation files are handled separately when `NgOptimizedImage` is not applicable.

The project does not depend on an image CDN.

## Responsive Design

The public website follows a Mobile First approach.

Responsive behaviour is implemented primarily with:

- CSS Grid
- Flexbox
- media queries
- `clamp()`
- responsive max-width containers
- `aspect-ratio`
- `object-fit`

Phone landscape, tablet, desktop and ultrawide layouts have been reviewed as separate presentation cases where required.

## Accessibility

The implementation includes:

- semantic HTML
- keyboard-accessible navigation
- accessible form labels
- translated accessible names
- focus-visible states
- `aria-expanded` and related menu attributes
- meaningful image alternative text
- reduced-motion handling where applicable

Automated checks are complemented by browser and responsive QA.

## Testing and Quality

The project uses Vitest through Angular's testing setup.

Current validation baseline:

```text
32 test files passed
206 tests passed
ESLint passed
production build passed
```

HTTP API clients are tested with Angular HTTP testing utilities.

External services are mocked in unit tests; tests do not depend on live Supabase or Resend requests.

## Deployment

The application is deployed through Netlify and connected to the GitHub repository.

Production build:

```bash
npm run build
```

Validation commands:

```bash
npm test -- --run
npm run lint
npm run build
```

## Main Architectural Decisions

- Standalone Angular architecture
- Feature-based organization
- Separate public and Admin layouts
- Lazy route loading
- Signals for synchronous state
- RxJS for asynchronous workflows
- HttpClient as the frontend API boundary
- Supabase Edge Functions as the backend application boundary
- Private Storage with signed URLs
- Internationalized user-facing content
- SSR-safe browser API usage
- Local optimized image delivery
- No real external calls from unit tests
