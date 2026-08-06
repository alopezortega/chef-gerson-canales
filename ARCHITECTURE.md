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
├── quote-request/
│   ├── models/
│   │   ├── quote-request.model.ts
│   │   └── admin-quote-request.model.ts
│   └── services/
│       ├── quote-request.service.ts
│       ├── quote-request.service.spec.ts
│       ├── admin-quote-request.service.ts
│       └── admin-quote-request.service.spec.ts
└── service-document/
    ├── models/
    │   └── service-document.model.ts
    └── services/
        ├── service-document.service.ts
        └── service-document.service.spec.ts
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
Admin Quote Request Detail
Admin Service Document
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
            ├── Admin Dashboard
            ├── Admin Quote Request Detail
            └── Admin Service Document
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
/admin/login                 → Admin Login
/admin                       → Admin Layout → Admin Dashboard
/admin/quote-requests/:id    → Admin Layout → Admin Quote Request Detail
/admin/service-document      → Admin Layout → Admin Service Document
```

The private Admin route is protected by `authGuard`.

The login route remains public and is a sibling of the protected Admin layout route.

---

## Internationalization

Public and administrative user-facing content supports Spanish and English through `ngx-translate`.

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

The anonymous and authenticated roles can insert quote requests under the configured public submission policy. Supporting `authenticated` insertion is necessary because an Admin user may remain signed in while manually validating the public form.

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

The anonymous and authenticated roles can upload files to this bucket under the configured Storage insertion policy.

The bucket remains private. Public read access is not enabled.

Authenticated Admin users can read objects under a dedicated Storage `SELECT` policy. The application still does not expose permanent public URLs; it creates short-lived signed URLs when an Admin opens an attachment.

---

## Admin Quote Request Management

The public submission flow and the private administrative workflow are treated as separate responsibilities.

```text
QuoteRequestService
→ public creation
→ optional attachment upload
→ Database insertion

AdminQuoteRequestService
→ authenticated list and detail reads
→ status updates
→ local Signal synchronization
→ private attachment signed URLs
```

The administrative service owns mutable state through private Signals and exposes readonly Signals:

```text
requests
selectedRequest
isLoading
hasError
isUpdatingStatus
```

The Admin dashboard loads the complete request list and displays loading, error, empty and success states.

The detail view uses a dedicated mobile-friendly route:

```text
/admin/quote-requests/:id
```

A separate route was preferred over a large modal because it provides:

- More space on small screens.
- Native browser back navigation.
- Direct refresh support.
- Clear separation between list and detail.
- A stable location for status and attachment actions.

### Administrative models

The database response and the Angular model use separate interfaces:

```text
AdminQuoteRequestRow
→ raw Supabase row
→ snake_case

AdminQuoteRequest
→ application model
→ camelCase
```

`AdminQuoteRequestService` maps each database field explicitly:

```text
event_type      → eventType
guest_count     → guestCount
attachment_path → attachmentPath
created_at      → createdAt
```

This prevents routed components from depending directly on the Supabase naming format.

### Request status

PostgreSQL defines the restricted enum:

```text
quote_request_status
→ pending
→ contacted
→ closed
```

The `quote_requests.status` column is:

```text
NOT NULL
DEFAULT 'pending'
```

TypeScript mirrors the same allowed values through:

```ts
export type QuoteRequestStatus = 'pending' | 'contacted' | 'closed';
```

The Admin detail view allows the user to select and save one of these values.

Status update flow:

```text
AdminQuoteRequestDetail
→ selectedStatus Signal
→ AdminQuoteRequestService.updateQuoteRequestStatus(id, status)
→ Supabase UPDATE filtered by id
→ update selectedRequest when it matches
→ update the matching item inside requests
→ reset isUpdatingStatus in finally
```

The component synchronizes `selectedStatus` with the loaded request through an Angular `effect`.

### Private attachment access

The Storage bucket remains private:

```text
quote-request-attachments
```

Admin attachment flow:

```text
authenticated Admin
→ request short-lived signed URL
→ createSignedUrl(path, 60)
→ open URL in a new tab
```

The URL expires after 60 seconds.

The detail component exposes a local readonly `isOpeningAttachment` Signal so the button can be disabled and its copy can change while the signed URL is being created.

Errors are handled without making the bucket public.

### Database and Storage authorization

Database policies and privileges allow:

```text
anon
→ INSERT public quote requests

authenticated
→ INSERT public quote requests
→ SELECT quote requests
→ UPDATE quote requests
```

PostgreSQL table privileges include:

```sql
grant insert on table public.quote_requests to authenticated;
grant select on table public.quote_requests to authenticated;
grant update on table public.quote_requests to authenticated;
```

Storage policies allow:

```text
anon, authenticated
→ INSERT into quote-request-attachments

authenticated
→ SELECT from quote-request-attachments
```

Authentication and authorization remain separate concerns:

```text
Supabase Auth
→ identifies the signed-in user

GRANT + RLS / Storage policies
→ determine allowed operations and object or row access
```

### Admin internationalization

The Admin login, layout, dashboard and quote-request detail use `ngx-translate`.

The `admin` namespace contains:

```text
login
layout
status
eventTypes
dashboard
quoteRequestDetail
serviceDocument
```

The dashboard and detail templates translate:

- Loading, error and empty states.
- Table headings.
- Event types.
- Request statuses.
- Detail field labels.
- Attachment actions.
- Status-update actions.

Both standalone components import `TranslatePipe`, and their specs provide `TranslateService` through `provideTranslateService`.

---

## Service Document Management

The Service Document feature allows the authenticated Admin user to manage one downloadable PDF for the public Services page.

The feature keeps a single active document and does not maintain document history.

Data flow:

```text
AdminServiceDocument
        ↓
ServiceDocumentService
        ↓
Supabase Storage
        ↓
Supabase Database
        ↓
ServicesComponent
        ↓
short-lived signed download URL
```

### Feature structure

```text
features/service-document/
├── models/
│   └── service-document.model.ts
└── services/
    ├── service-document.service.ts
    └── service-document.service.spec.ts
```

The administrative page is stored in:

```text
pages/admin-service-document/
```

The public consumer remains the existing:

```text
pages/services/
```

### Service state

`ServiceDocumentService` owns the shared state through private writable Signals and exposes readonly Signals:

```text
currentDocument
isLoading
hasError
isUploading
isDeleting
```

The Admin page consumes upload and deletion state.

The public Services page consumes the active document and requests a signed URL only when the visitor selects the download action.

### Database model

Current table:

```text
public.service_documents
```

The table stores metadata for one active PDF:

```text
id
storage_path
original_name
mime_type
size
created_at
updated_at
```

The database row uses `snake_case`.

The Angular application model uses `camelCase`.

The conversion occurs inside `ServiceDocumentService`:

```text
ServiceDocumentRow
→ raw Supabase row

ServiceDocument
→ Angular application model
```

### Storage

Current private bucket:

```text
service-documents
```

The bucket accepts:

```text
application/pdf
```

with a maximum file size of:

```text
10 MB
```

Files receive a unique generated path.

When an Admin replaces the current document:

```text
upload new object
→ update the existing database row
→ synchronize the service Signal
→ delete the previous Storage object
```

If the database operation fails after the new file has been uploaded, the service attempts to remove the newly uploaded object.

When deleting the active document, the database record is removed first so the public page immediately stops exposing the download action. Storage cleanup follows afterwards.

### Authorization

Database privileges and RLS policies allow:

```text
anon
→ SELECT the active document metadata

authenticated
→ SELECT document metadata
→ INSERT document metadata
→ UPDATE document metadata
→ DELETE document metadata
```

Storage policies allow:

```text
authenticated
→ INSERT into service-documents
→ SELECT from service-documents
→ DELETE from service-documents

anon
→ SELECT from service-documents
```

Anonymous Storage `SELECT` permission is required for Supabase to create a signed URL from the public Services page.

The bucket remains private. The application does not expose a permanent public URL.

### Public download

Public flow:

```text
ServicesComponent
→ load active document metadata
→ render the download section only when a document exists
→ request createSignedUrl(storagePath, 60)
→ open the temporary URL in a new browser tab
```

The signed URL expires after 60 seconds.

The new tab is opened with:

```text
noopener
noreferrer
```

to prevent the opened document from controlling the originating page and to avoid sending referrer information.

The public page handles:

```text
loading
document available
no document available
downloading
download error
```

The downloadable-document copy is internationalized under:

```text
services.document
```

The Admin management copy is internationalized under:

```text
admin.serviceDocument
```

### Administrative workflow

The protected route is:

```text
/admin/service-document
```

The Admin user can:

```text
upload the first PDF
replace the current PDF
delete the current PDF
```

The file input is reset after successful upload, replacement or deletion by querying the native input with Angular `viewChild`.

Only PDF files are accepted by both the browser input and the component validation.

Manual validation completed for:

```text
first upload
replacement
deletion
native file-input reset
public document detection
signed URL creation
PDF opening in a new tab
```

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
- Public submission while authenticated as an Admin user.
- Admin request listing and detail navigation.
- Admin status changes.
- Private attachment opening through a signed URL.
- Spanish and English Admin copy.
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
- Admin quote-request list and detail loading.
- Snake-case to camel-case mapping.
- Status updates and local list/detail synchronization.
- Signed attachment URL success and failure.
- Attachment opening, pending state and error handling.
- Language preference recovery, validation and persistence.
- Service-document test files have been created for the feature service and Admin page; their final coverage is completed before the feature commit.

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
19 test files passing
103 tests passing
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

Authenticated Admin users receive read permission through a Storage policy, while the UI opens files through short-lived signed URLs instead of permanent public access.

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

### Separate public submission from private administration

`QuoteRequestService` remains focused on public submission and persistence.

`AdminQuoteRequestService` owns authenticated reading and management state.

This prevents one service from mixing two workflows with different reasons to change.

### Map database rows at the service boundary

Supabase rows remain represented in `snake_case` through `AdminQuoteRequestRow`.

Angular components consume `AdminQuoteRequest` in `camelCase`.

The conversion occurs only inside `AdminQuoteRequestService`.

### Use a routed Admin detail view

The request detail uses:

```text
/admin/quote-requests/:id
```

instead of a large modal.

This is the preferred mobile-first navigation model and provides direct URL, refresh and back-navigation support.

### Combine table privileges with RLS

RLS policies do not replace PostgreSQL table privileges.

Authenticated Admin reads and updates require both:

```text
GRANT
+
RLS policy
```

### Synchronize Admin state after successful mutations

After a successful status update, `AdminQuoteRequestService` updates both:

```text
selectedRequest
requests
```

This keeps the detail view and dashboard list consistent without an immediate full reload.

### Use short-lived signed URLs for private attachments

Private attachments are opened through:

```text
createSignedUrl(path, 60)
```

The bucket remains private and the generated URL expires after 60 seconds.

### Keep Admin user-facing copy internationalized

Admin Dashboard and Admin Quote Request Detail use the same Spanish/English translation architecture as the public site.

Component tests provide `TranslateService` explicitly when templates depend on `TranslatePipe`.

### Keep one active service document

The Service Document feature intentionally stores one active PDF rather than document history.

Replacement updates the existing metadata row and removes the previous Storage object after the new document has been persisted successfully.

### Keep the service document bucket private

The public Services page never uses a permanent public Storage URL.

It requests a short-lived signed URL only when a visitor selects the download action.

### Share service-owned document state

`ServiceDocumentService` owns the active-document state.

The Admin management page and the public Services page consume the same readonly Signal instead of implementing separate persistence logic.

### Separate document metadata from file storage

The database stores the active document metadata.

Supabase Storage stores the PDF object.

This allows the application to query document availability without embedding file contents or permanent URLs in the database.
