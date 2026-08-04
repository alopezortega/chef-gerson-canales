# Architecture

## Overview

Chef Gerson Canales is an Angular application for catering, private dining and corporate event services.

The application is designed with:

- Standalone Angular architecture
- Lazy-loaded routes
- Server-Side Rendering support
- Zoneless change detection
- Mobile-first responsive design
- Clear separation of responsibilities
- Accessible navigation
- Internationalized public content
- Scalable styling through design tokens
- Feature-based organization

---

## Tech Stack

- Angular 21
- TypeScript
- SCSS
- Angular Router
- Angular Signals
- RxJS
- Angular SSR
- `ngx-translate`
- Vitest
- ESLint
- Prettier
- Supabase Database
- Supabase Storage
- Supabase JavaScript client
- Netlify
- `@netlify/angular-runtime`

---

## Project Structure

```text
src/
└── app/
    ├── core/
    ├── features/
    ├── layout/
    ├── pages/
    └── shared/
```

### `core`

Contains application-wide infrastructure and singleton responsibilities.

Current examples:

```text
core/config/supabase-client.ts
core/config/supabase-client.token.ts
core/guards/auth.guard.ts
core/models/supported-language.type.ts
core/services/auth.service.ts
core/services/language.service.ts
```

Authentication is centralized in `AuthService`.

The service owns the current Supabase user, initial-session loading state and authenticated state through Angular Signals.

The Supabase client is exposed through an Angular `InjectionToken`.

Production code receives the real client, while tests replace it with a mock through Angular dependency injection.

### `features`

Contains business-specific models, data and services.

Current feature structures:

```text
features/
├── gallery/
│   ├── data/
│   │   └── gallery.mock.ts
│   ├── models/
│   │   └── gallery-item.model.ts
│   └── services/
│       └── gallery.service.ts
└── quote-request/
    ├── models/
    │   └── quote-request.model.ts
    └── services/
        ├── quote-request.service.ts
        └── quote-request.service.spec.ts
```

### `layout`

Contains the route layouts and shared application shells.

```text
layout/
├── public-layout/
└── admin-layout/
```

The public layout contains:

```text
Header
RouterOutlet
Footer
```

The administrative layout contains:

```text
Sign-out control
RouterOutlet
```

The login page is intentionally outside `AdminLayout`, while authenticated Admin pages render inside it.

### `pages`

Contains standalone route-level components.

Current public pages:

```text
Home
Services
Gallery
Quote Request
About
```

Current administrative pages:

```text
Admin Login
Admin Dashboard
```

Pages compose complete routed views.

Business models, data and services remain inside their corresponding feature folders when they do not belong directly to the page.

### `shared`

Contains reusable presentation-focused elements such as:

- UI components
- Pipes
- Directives
- Shared models

Code is moved to `shared` only when a real reuse case exists.

---

## Application Structure

```text
App
│
├── Public route group
│   └── Public Layout
│       ├── Header
│       ├── Router Outlet
│       │   ├── Home
│       │   ├── Services
│       │   ├── Gallery
│       │   ├── Quote Request
│       │   └── About
│       └── Footer
│
└── Admin route group
    ├── /admin/login
    │   └── Admin Login
    │
    └── protected Admin Layout
        ├── Sign-out control
        └── Router Outlet
            └── Admin Dashboard
```

---

## Public Navigation

The visible Spanish navigation labels are:

```text
Chef privado & catering
Galería
Solicitar presupuesto
Sobre el chef
Instagram
```

The visible English navigation labels are:

```text
Private chef & catering
Gallery
Request a quote
About the chef
Instagram
```

The public commercial label changed from:

```text
Servicios
Services
```

to:

```text
Chef privado & catering
Private chef & catering
```

This is a user-facing content change only.

The following technical names remain unchanged:

```text
ServicesComponent
pages/services
/servicios
featuredServices
```

---

## Routing

Public routes:

```text
/                       → Home
/servicios              → Services
/galeria                → Gallery
/solicitar-presupuesto  → Quote Request
/sobre-el-chef          → About
```

The application uses standalone lazy loading.

```ts
loadChildren;
```

is used for route groups and layouts.

```ts
loadComponent;
```

is used for standalone route pages.

Public pages are rendered inside the `PublicLayout` router outlet.

Administrative routes:

```text
/admin/login  → Admin Login
/admin        → Admin Layout → Admin Dashboard
```

The private Admin route is protected by `authGuard`.

The login route remains public and is a sibling of the protected Admin layout route.

---

## Internationalization

Public content supports Spanish and English through `ngx-translate`.

Translation files are stored in:

```text
public/i18n/
├── es.json
└── en.json
```

Both files maintain the same translation-key structure.

Templates use translation keys instead of hard-coded user-facing text:

```html
{{ 'gallery.title' | translate }}
```

Accessibility labels and image alternative text are also translated.

Responsibilities are separated as follows:

```text
TypeScript
→ application logic and state

HTML
→ structure and translation keys

JSON
→ user-facing content
```

---

## Language Management

Language state is centralized in `LanguageService`.

The service is responsible for:

- Storing the active language
- Activating the selected `ngx-translate` language
- Persisting the user preference
- Validating values loaded from browser storage
- Providing SSR-safe access to `localStorage`

The navbar displays the language controls and delegates language changes to the service.

The selected language is persisted in:

```text
localStorage
```

under the key:

```text
preferred-language
```

---

## Authentication and Admin Access

Supabase Auth provides email-and-password authentication for the private Admin area.

`AuthService` is responsible for:

- Recovering the initial Supabase session.
- Listening to authentication-state changes.
- Exposing the current user through a readonly Signal.
- Exposing session-loading state through a readonly Signal.
- Deriving authenticated state through `computed`.
- Signing in with email and password.
- Signing out.
- Propagating Supabase errors to the consuming UI.

State flow:

```text
private writable Signals
→ public readonly Signals
→ computed authenticated state
```

The functional `authGuard` waits until the initial session check finishes before deciding whether to:

```text
return true
or
return a UrlTree to /admin/login
```

The Admin login page uses a typed Reactive Form, translated validation messages, submitting state, authentication-error state and successful navigation to `/admin`.

The Admin layout owns the sign-out interaction and redirects to `/admin/login` after Supabase removes the session.

Admin access is not linked from the public interface.


---

## State Management

Angular Signals are used for synchronous component and service state.

The project follows this pattern:

```text
service owns mutable state
→ service exposes readonly state
→ components consume the state
```

This keeps state ownership clear and prevents presentation components from modifying shared state directly.

RxJS is currently used for Angular Router event handling.

---

## Navigation State

The mobile navigation menu uses an Angular Signal.

State changes are handled through explicit methods:

```ts
protected toggleMenu(): void {
  this.menuOpen.update((isOpen) => !isOpen);
}

protected closeMenu(): void {
  this.menuOpen.set(false);
}
```

The accessible menu label is derived from the current menu state.

The menu closes after successful Angular Router navigation.

The Router event subscription uses:

```text
NavigationEnd
filter
takeUntilDestroyed
```

This ensures that the menu reacts to route changes and the subscription is cleaned up when the component is destroyed.

---

## Browser Event Handling

The mobile navigation menu also closes when the Escape key is pressed.

The global keyboard listener is registered with:

```text
afterNextRender
```

and removed through:

```text
DestroyRef
```

This keeps browser event handling compatible with SSR and prevents abandoned global listeners.

---

## Template Strategy

The application uses Angular's modern template control flow.

Currently used:

```text
@if
@else
@for
@let
track
```

Lists use stable identifiers:

```html
@for (galleryItem of galleryItems(); track galleryItem.id) { }
```

`@let` is used when a template expression needs to be reused or simplified.

---

## Data States

The gallery currently handles:

```text
success
empty
```

The empty state is represented separately from a successful result containing data.

Example:

```html
@if (galleryItems().length > 0) {
<!-- Gallery content -->
} @else {
<p>{{ 'gallery.empty' | translate }}</p>
}
```

---

## Gallery Architecture

The gallery follows this data flow:

```text
Gallery mock
      ↓
GalleryService
      ↓
GalleryComponent
      ↓
Gallery template
```

Responsibilities:

```text
gallery.mock.ts
→ contains the current gallery data

GalleryService
→ owns and exposes gallery state

GalleryComponent
→ consumes gallery state

gallery.html
→ renders the interface
```

The page does not import the mock directly.

This keeps the routed component independent from the concrete data source.

### Gallery model

```ts
export interface GalleryItem {
  id: string;
  imageUrl: string;
  titleKey: string;
  altKey: string;
}
```

The model stores translation keys instead of final translated text.

The `id` is used as the stable tracking value in the template.

---

## Quote Request Persistence

The Quote Request feature uses Supabase for persistence and optional file storage.

Data flow:

```text
QuoteRequestComponent
        ↓
QuoteRequestService
        ↓
Supabase Storage (optional attachment)
        ↓
Supabase Database (quote_requests row)
```

The component owns UI state through Angular Signals:

```text
attachment
isSubmitting
submissionSuccess
submissionError
```

The service is responsible for:

- Uploading the optional attachment.
- Sanitizing the original filename.
- Generating a unique storage path.
- Mapping the Angular form model from camelCase to the database snake_case structure.
- Inserting the request into the `quote_requests` table.
- Throwing Storage or Database errors to the component.

### Supabase client injection

The real client is created in:

```text
src/app/core/config/supabase-client.ts
```

The dependency-injection token is defined in:

```text
src/app/core/config/supabase-client.token.ts
```

The service consumes:

```ts
private readonly supabaseClient = inject(SUPABASE_CLIENT);
```

This keeps production configuration separate from test doubles.

### Database

Current table:

```text
public.quote_requests
```

Stored attachment metadata:

```text
attachment_path
attachment_name
attachment_type
attachment_size
```

Row Level Security is enabled.

The anonymous role can insert quote requests only under the configured public submission policy.

### Storage

Current private bucket:

```text
quote-request-attachments
```

Current accepted client file types:

```text
PDF
JPEG
PNG
```

The public anonymous role can upload files only to this bucket under the configured Storage policy.

The bucket remains private. Public read access is not enabled.

---

## Rendering Strategy

Public routes remain prerendered for fast delivery and crawlable public content.

The Admin route group uses client-side rendering:

```text
admin/** → RenderMode.Client
**       → RenderMode.Prerender
```

This is required because the current Supabase browser session is persisted in `localStorage`.

Rendering `/admin/**` in the browser allows `AuthService` to recover the saved session before `authGuard` decides whether access is allowed.

A cookie-based Supabase SSR authentication architecture is not part of the current MVP.

---

## Deployment

The application is deployed through Netlify and connected to the GitHub repository:

```text
alopezortega/chef-gerson-canales
```

Netlify uses continuous deployment from Git.

Current deployment configuration:

```text
Build command:
npm run build

Publish directory:
dist/chef-gerson-canales/browser
```

The application uses Angular SSR and Netlify's Angular Runtime:

```text
@netlify/angular-runtime
```

The runtime is installed as a project development dependency so Netlify can build and deploy the Angular SSR output correctly.

The Angular production build generates:

```text
dist/
└── chef-gerson-canales/
    ├── browser/
    └── server/
```

Netlify publishes the `browser` output and deploys the SSR integration through its Angular Runtime.

Current prerendered public routes:

```text
/
/servicios
/galeria
/solicitar-presupuesto
/sobre-el-chef
```

The deployment has been validated with:

- Direct navigation to public routes.
- Browser refresh on routed URLs.
- Spanish and English content.
- Supabase Database insertion.
- Optional PDF upload to Supabase Storage.
- Translated success feedback after submission.
- No browser console errors during the validated flow.

During deployment validation, Netlify temporarily uses:

```text
feature/netlify-deployment
```

as the production branch.

The stable branch strategy remains:

```text
feature/*
→ implementation and validation

develop
→ integrated development version

main
→ stable public production version
```

Once the MVP is approved as stable, Netlify production must point to:

```text
main
```

The current Netlify site remains private during validation and should be made public only when the MVP is ready to share.

---

## Accessibility

Accessibility is part of the component implementation.

Current practices include:

- Semantic HTML
- Labelled navigation regions
- Translated accessible names
- `aria-expanded` for the mobile menu
- `aria-controls` relationships
- Keyboard support
- Meaningful translated image alternative text
- Labelled page sections

Automated analysis is complemented with manual browser and keyboard validation.

---

## Styling

Global styles are defined in:

```text
src/styles.scss
```

Reusable visual values are maintained through design tokens:

```text
src/styles/_tokens.scss
```

Rules:

- Shared visual values use CSS custom properties
- Component-specific styles remain encapsulated
- Existing tokens are checked before introducing new ones
- New abstractions require a real reuse case

---

## Responsive Design

Responsive presentation is controlled through CSS.

The gallery layout uses CSS Grid, media queries and consistent image proportions.

Images use:

```scss
aspect-ratio: 4 / 3;
object-fit: cover;
```

This keeps image cards visually consistent without distorting the source images.

---

## Testing Strategy

The project uses Vitest through Angular's testing configuration.

Current coverage includes:

- Component creation.
- Reactive Forms validation.
- Angular Signal state.
- Rendered DOM outcomes.
- Browser `File` objects.
- Quote Request success, error and submitting states.
- Form and attachment reset behaviour.
- Supabase service integration through mocked dependencies.
- Storage upload success and failure.
- Database insertion success and failure.
- Prevention of database insertion after a failed upload.
- Initial Supabase Auth session recovery.
- Authentication-state changes.
- Sign-in and sign-out success and failure.
- Functional route-guard decisions and loading-state waiting.
- Admin login validation, navigation, error and submitting states.
- Admin logout and navigation.
- Language preference recovery, validation and persistence.

Supabase is not contacted during unit tests.

The real client is replaced in `TestBed`:

```ts
{
  provide: SUPABASE_CLIENT,
  useValue: supabaseClientMock,
}
```

Current validation status:

```text
17 test files passing
77 tests passing
3 tests skipped
```

Deployment validation:

```text
Angular SSR build completed
5 static routes prerendered
Netlify deployment completed
Supabase Database insert validated
Supabase Storage upload validated
Spanish and English submission feedback validated
```

The skipped tests are legacy Quote Request submission tests kept temporarily for later review.

ESLint passes successfully.

The production build completes successfully with one non-blocking component-style budget warning:

```text
src/app/pages/quote-request/quote-request.scss
4.13 kB current size
4.00 kB configured warning budget
```

---

## Naming Conventions

Angular selectors use:

```text
app-
```

for public and general components.

```text
admin-
```

for admin-only components.

Code is written in English:

- Variables
- Methods
- Classes
- Interfaces
- Types
- Comments
- Commit messages

User-facing content is stored in Spanish and English translation files.

---

## Architectural Decisions

### Separate routed pages from feature logic

Pages compose complete routed views.

Feature folders contain their business models, data and services.

### Isolate mock data behind services

The gallery page consumes `GalleryService` instead of importing mock data directly.

### Keep state ownership inside services

Services manage shared state and expose controlled state to components.

### Centralize language state

Language selection and persistence belong to `LanguageService`.

### Preserve SSR compatibility

Browser-only APIs and global event listeners are handled through SSR-compatible Angular mechanisms.

### Store translation keys in models

Feature models contain stable translation keys instead of user-facing text.

### Avoid premature abstraction

Components and models are generalized only when a real reuse case exists.

### Keep public and admin responsibilities separate

Public and administrative areas use separate layouts and navigation responsibilities.

### Inject external clients through Angular dependency injection

External infrastructure clients must not be imported directly into business services when they need to be replaced in tests.

The Supabase client is provided through `SUPABASE_CLIENT`.

### Keep persistence logic inside feature services

The routed Quote Request component controls form and presentation state.

Database mapping, attachment upload and persistence belong to `QuoteRequestService`.

### Keep Storage private by default

Quote Request attachments are uploaded to a private bucket.

Read access will be granted only through authenticated administrative flows or signed URLs when required.

### Do not call real external services in unit tests

Supabase Database and Storage are replaced with mocks through `TestBed`.

Unit tests must remain deterministic and independent from network connectivity, credentials and remote data.

### Centralize authentication state

`AuthService` owns authentication state and exposes readonly Signals to consumers.

Components and guards do not access the Supabase Auth client directly.

### Wait for initial authentication before guarding routes

`authGuard` waits until `AuthService.isLoading` becomes `false`.

This prevents a temporary unauthenticated state from being treated as the final route decision.

### Keep the login route outside the protected Admin layout

`/admin/login` remains public.

Authenticated Admin pages render inside `AdminLayout` and are protected by `authGuard`.

### Render Admin routes on the client

The public site remains prerendered.

`/admin/**` uses `RenderMode.Client` because the current Supabase session is stored in browser `localStorage`.

### Keep public navigation free from Admin access

The Admin URL is not exposed in the public header, footer or navigation.

Route protection is provided by authentication and the guard rather than URL obscurity.

### Deploy Angular SSR through Netlify Runtime

The project uses Netlify for deployment.

Angular SSR support is provided through:

```text
@netlify/angular-runtime
```

The configured publish directory is:

```text
dist/chef-gerson-canales/browser
```

The runtime handles the Angular SSR deployment integration while Netlify publishes the generated browser assets.

### Keep production deployment aligned with Git stability

Feature branches may be used temporarily for deployment validation.

The long-term production source remains:

```text
main
```

`develop` is the integration branch and must not permanently replace `main` as the public production source.
