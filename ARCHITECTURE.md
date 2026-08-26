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
- Angular HttpClient
- Angular SSR
- `ngx-translate`
- Vitest
- ESLint
- Prettier
- Supabase Database
- Supabase Storage
- Supabase JavaScript client
- Supabase Edge Functions
- Deno
- Resend
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
ScrollToTop
```

The administrative layout contains:

```text
Responsive Admin shell
Mobile header
Mobile bottom navigation
Desktop sidebar navigation
Sign-out control
RouterOutlet
Shared ScrollToTop
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

Current reusable public component:

```text
shared/components/final-cta/
```

`FinalCta` is shared by Home, About and Gallery so the closing conversion block is implemented once and reused across public pages.

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
│       ├── Footer
│       └── ScrollToTop
│
└── Admin route group
    ├── /admin/login
    │   └── Admin Login
    │
    └── protected Admin Layout
        ├── Mobile header and bottom navigation
        ├── Desktop sidebar navigation
        ├── Sign-out control
        ├── shared ScrollToTop
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
Contacto
Sobre el chef
Instagram
```

The visible English navigation labels are:

```text
Private chef & catering
Gallery
Contact
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

RxJS is used for Angular Router event handling and for HTTP request flows behind the application API boundary.

Current HTTP flows compose operators such as:

```text
tap
catchError
finalize
```

Feature services keep Angular Signals as the synchronous UI state while API client services expose cold `Observable<T>` request contracts.

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

The Quote Request page also listens to:

```text
window:beforeunload
```

through Angular `HostListener` so a dirty public form is protected when the visitor reloads or leaves the browser page entirely.

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

The Gallery route is now visually complete and keeps the existing data boundary.

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

Current presentation:

```text
18 gallery images
editorial mobile-first composition
shared responsive container on desktop
panoramic image blocks
shared FinalCta before Footer
```

Two repeated visual assets were replaced without changing the Gallery service boundary or item count:

```text
gallery-03-candlelit-table.png
→ gallery-19-beetroot-salad-candlelight.png

gallery-04-chef-plating.png
→ gallery-20-glazed-duck-plate.png
```

The new items use dedicated translated title and alternative-text keys in both language files.

The Gallery intentionally does not include filters, categories, lightbox behaviour or Admin management in the current MVP.

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
attachmentError
isSubmitting
showLoadingSuccess
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


### Quote Request client validation and leave protection

The public Quote Request page now includes additional client-side validation:

```text
name
→ required
→ rejects numeric characters

email
→ required
→ Angular email validator

phone
→ optional
→ rejects alphabetic characters

eventDate
→ optional
→ must be later than the current day

guestCount
→ required
→ minimum 1

attachment
→ PDF / JPEG / PNG
→ maximum 10 MB
```

The native date input also receives a minimum value equal to tomorrow.

Submission feedback keeps the persisted request as the authoritative result:

```text
submit valid form
→ show full-viewport loading overlay
→ keep loading visible for at least 3.5 seconds
→ show success confirmation while the GIF is still visible
→ hide overlay
→ render the normal success message
→ reset form and attachment
```

Current loading asset:

```text
public/images/quote-request/quote-request-loading-chef-black.gif
```

The page protects unfinished form data through two complementary browser/navigation mechanisms.

Angular navigation:

```text
quoteRequestPendingChangesGuard
→ CanDeactivateFn<QuoteRequestComponent>
→ calls component.canDeactivate()
→ opens a custom native <dialog>
→ resolves Promise<boolean>
```

The protected public route is:

```text
/solicitar-presupuesto
→ canDeactivate: [quoteRequestPendingChangesGuard]
```

The custom dialog is shown only when the form contains pending changes.

Browser-level exit:

```text
beforeunload
→ F5 / reload
→ close tab or window
→ navigate away from the Angular application
```

`beforeunload` uses the browser-native confirmation UI because browsers do not allow custom text or styling for this event.

After a successful submission the form is reset, so subsequent navigation does not trigger the unsaved-changes warning.

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


## Quote Request Email Notification

A successful Quote Request now triggers a backend email notification without exposing email-provider credentials to Angular.

Data flow:

```text
QuoteRequestComponent
        ↓
QuoteRequestService
        ↓
Supabase Database INSERT
        ↓
returned request id
        ↓
Supabase Edge Function: notify-quote-request
        ↓
load quote request with backend privileges
        ↓
Resend API
        ↓
notification email delivered to Gerson
```

### Angular contract

After the Database insert succeeds, `QuoteRequestService` requests only the generated row id:

```text
insert quote request
→ select id
→ single row
→ invoke notify-quote-request
→ body: { quoteRequestId }
```

The browser therefore receives the generated UUID required to invoke the backend function, but it does not receive backend secrets.

If the notification call fails, the successfully persisted Quote Request remains saved. Email delivery is treated as a secondary notification step and must not invalidate the original customer submission.

### Edge Function

The function is stored under:

```text
supabase/functions/notify-quote-request/
```

It runs with Deno and is deployed to Supabase independently from the Angular application.

Responsibilities:

```text
handle CORS preflight
→ parse quoteRequestId from the request body
→ read backend environment configuration
→ create a Supabase service-role client
→ load the matching quote_requests row
→ send a transactional email through Resend
→ return only { success: true } to the browser
```

The function does not return the full Quote Request payload to the browser after successful processing.

### Secrets

The email provider key and notification recipient are stored as Supabase Edge Function secrets:

```text
RESEND_API_KEY
GERSON_NOTIFICATION_EMAIL
```

Supabase-provided backend variables are read with:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

Security rule:

```text
backend secret
→ Supabase Edge Function environment

never
→ Angular source
→ public environment files
→ translation JSON
→ Git repository
```

### Database authorization

The Edge Function uses the backend `service_role` client to load the newly created request.

The required PostgreSQL table privilege is:

```sql
grant select on table public.quote_requests to service_role;
```

This does not grant public read access to `anon`.

The browser-side anonymous role still cannot list Quote Requests. Administrative reads remain protected through the existing authenticated permissions and RLS policies.

### Resend

The current provider is:

```text
Resend
```

Development validation uses the Resend onboarding sender:

```text
Chef Gerson Canales <onboarding@resend.dev>
```

A verified custom sender/domain should replace the onboarding sender for the final production configuration when available.

The email currently includes the main Quote Request details required for operational follow-up:

```text
name
email
phone
event type
event date
guest count
location
dietary requirements
additional information
```

The Edge Function calls the Resend email API from the backend. Angular never communicates directly with Resend.

### Failure behaviour

```text
Database insert fails
→ throw to Quote Request UI
→ notification is not invoked

Database insert succeeds
but email notification fails
→ keep saved request
→ log notification failure
→ do not report the whole customer submission as lost
```

This preserves the Quote Request as the system of record even when email delivery is temporarily unavailable.

### Manual validation

Completed end-to-end validation:

```text
public form submission
→ attachment upload when present
→ quote_requests row created
→ generated id returned
→ notify-quote-request invoked
→ Edge Function loads the correct row
→ Resend accepts the email
→ email received in Gmail
→ Edge Function response is { success: true }
```

The first delivered test message was initially classified as spam because the development sender uses `onboarding@resend.dev`; it was manually marked as not spam.

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

The Gallery layout uses CSS Grid, media queries, responsive max-width containers and `object-fit` to preserve the editorial composition across mobile and desktop.

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
- Quote Request notification invocation with the generated request id.
- Prevention of notification invocation after a failed Database insert.
- Notification failure does not invalidate an already persisted Quote Request.
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
- Service-document service, Admin page and public download behaviour.

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
23 test files passing
135 tests passing
3 tests skipped
```

Deployment validation:

```text
Angular SSR build completed
5 static routes prerendered
Netlify deployment completed
Supabase Database insert validated
Supabase Storage upload validated
Supabase Edge Function deployment validated
Quote Request notification invocation validated
Resend email delivery validated
Spanish and English submission feedback validated
```

The skipped tests are legacy Quote Request submission tests kept temporarily for later review.

ESLint passes successfully.

The production build completes successfully.

Current non-blocking component-style budget warnings:

```text
src/app/pages/quote-request/quote-request.scss
4.13 kB current size
4.00 kB configured warning budget

src/app/layout/public-layout/components/header/components/header-navbar/header-navbar.scss
4.61 kB current size
4.00 kB configured warning budget

src/app/pages/home/home.scss
6.60 kB current size
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


### Keep email-provider secrets behind the Edge Function boundary

Resend credentials and notification-recipient configuration are stored as Supabase Edge Function secrets.

Angular receives no email-provider secret and never calls Resend directly.

### Keep Quote Request persistence authoritative when notification fails

The Database insert is the primary operation.

Email delivery is a secondary notification step:

```text
persist request successfully
→ attempt notification
→ preserve request even if notification fails
```

This avoids losing customer submissions because of a temporary email-provider or network failure.

### Pass only the generated request id to the notification backend

Angular invokes:

```text
notify-quote-request
→ { quoteRequestId }
```

The Edge Function loads the authoritative row itself instead of trusting a complete Quote Request payload supplied by the browser.

### Return minimal backend responses to the browser

The production notification response is:

```json
{
  "success": true
}
```

The full Quote Request is used only inside the backend function and is not returned to the browser after processing.

---

## Visual Design System — Public Experience

The current visual-design work is implemented on:

```text
feature/visual-design
```

The public interface follows a Mobile First strategy and uses a shared design system based on:

```text
cream backgrounds
charcoal surfaces and text
olive accents
editorial serif display typography
clean sans-serif body typography
warm gastronomic photography
botanical olive details
```

Reusable visual values remain centralized in:

```text
src/styles/_tokens.scss
```

Global styling remains in:

```text
src/styles.scss
```

Current public visual assets are organized under:

```text
public/images/
├── about/
├── backgrounds/
├── brand/
├── gallery/
├── home/
├── quote-request/
└── ui/
```

### Responsive Header and Navbar

The Header uses a dedicated horizontal brand asset and remains part of the shared `PublicLayout`.

Mobile composition:

```text
brand
language selector
menu toggle
```

Desktop composition:

```text
brand
primary navigation
Instagram
language selector
```

The mobile navigation keeps separate state for functional visibility and exit animation:

```text
menuOpen
menuRendered
menuClosing
```

The menu continues to close through:

```text
NavigationEnd
Escape key
explicit navigation actions
```

Desktop navigation includes:

```text
responsive spacing
active route treatment
hover/focus underline
larger social and language controls
```

The Header establishes the positioning context used by the absolute mobile navigation panel.

### Home Responsive Architecture

The Home keeps one semantic template and changes composition through responsive SCSS.

Mobile structure:

```text
Hero
Cooking with purpose
Featured experiences
About preview
Closing CTA
```

Desktop structure uses the same content with a different layout:

```text
Hero
→ editorial text column
→ large gastronomic image

Cooking with purpose
→ oversized decorative olive asset
→ editorial copy block

Featured experiences
→ three-column card grid

About preview
→ two-column portrait and editorial copy

Closing CTA
→ full-width dark textured block
→ decorative olive assets
→ centered action
```

This avoids duplicating Angular content for different breakpoints.

The current Home assets include:

```text
public/images/home/hero-gastronomy.png
public/images/home/private-dining.png
public/images/home/events-celebrations.png
public/images/home/custom-catering.png
public/images/home/olivo-home.png
public/images/home/olivo1.png
public/images/home/olivo2.png
public/images/home/olivo3.png
```

The closing CTA uses:

```text
public/images/backgrounds/dark-stone-texture.png
```

### Footer Responsive Architecture

The Footer uses different brand assets by breakpoint while preserving one shared component.

Desktop brand asset:

```text
public/images/brand/gerson-canales-footer.png
```

Mobile brand asset:

```text
public/images/brand/gerson-canales-logo.webp
```

Desktop Footer composition:

```text
brand
navigation
Instagram
decorative divider
copyright
```

Mobile keeps a vertical composition with stronger brand presence.

### Scroll-To-Top

The reusable control is shared by both route shells:

```text
PublicLayout
AdminLayout
```

Implementation:

```text
Signal
afterNextRender
fromEvent(window, 'scroll')
takeUntilDestroyed
@if
```

Visibility rule:

```text
window.scrollY > 400
→ show control
```

Interaction:

```text
click
→ smooth scroll to document top
```

### Responsive Strategy

The public site does not maintain separate mobile and desktop Angular templates.

Responsive behaviour is implemented primarily through:

```text
CSS Grid
Flexbox
media queries
clamp()
aspect-ratio
object-fit
responsive max-width containers
```

The desktop Home has been recomposed specifically for wider screens rather than simply scaling the mobile layout.

## Latest Quality Baseline — 2026-08-20

Current validation status:

```text
Test files
→ 23 passed

Tests
→ 135 passed
→ 3 skipped

Lint
→ all files pass
```

The `FinalCta` standalone component has focused component coverage.

The known Quote Request notification-failure test still writes its expected diagnostic error to stderr while the test itself passes.

---

## About Responsive Architecture

The About route remains a presentation-focused standalone page:

```text
AboutComponent
→ translated editorial content
→ responsive SCSS
→ shared FinalCta
```

No About-specific service, model or mock is required because the page contains no dynamic business state.

Current About composition:

```text
Hero
Origins
Journey
Editorial story
Final CTA
```

The editorial story contains four alternating image/text rows:

```text
Craft
Pastry
Teaching
Around a table
```

All visible copy, accessible section labels and image alternative text are stored in:

```text
public/i18n/es.json
public/i18n/en.json
```

The journey collection continues to use Angular modern template control flow:

```text
@let
@if
@for
track
```

The page reuses:

```text
shared/components/final-cta/
```

rather than maintaining a duplicate closing CTA in Home and About.

### Responsive layout

The approved mobile composition remains the baseline.

Larger viewports progressively recompose the same semantic markup through component SCSS:

```text
mobile base styles
→ tablet breakpoint
→ desktop breakpoint
```

Desktop About uses:

```text
large image-led Hero
two-column Origins composition
three-column Journey grid
50 / 50 alternating editorial rows
desktop-specific image cropping and sizing
```

The portrait-oriented teaching image receives a desktop-only height adjustment while preserving the shared 50 / 50 editorial axis.

No separate desktop Angular template is maintained.

### Final CTA reuse

`FinalCta` is a standalone shared component.

It owns the reusable closing CTA presentation and route link used by:

```text
Home
About
Gallery
```

The component imports:

```text
RouterLink
TranslatePipe
```

and routes to:

```text
/solicitar-presupuesto
```

This extraction is based on an existing reuse case rather than speculative abstraction.

---

## Current Visual Design Status — 2026-08-20

Completed public visual work:

```text
shared design tokens
responsive Header and Navbar
responsive Home
responsive Footer
global ScrollToTop
responsive About
responsive Gallery
About editorial image system
Gallery editorial image system
shared FinalCta
Spanish and English public content
```

Home and About now share the established public design language:

```text
cream
charcoal
olive
editorial serif typography
clean sans-serif body typography
warm gastronomic photography
botanical details
```

Gallery visual design is complete for the current MVP.

The existing Gallery architecture remains valid:

```text
gallery.mock.ts
→ GalleryService
→ GalleryComponent
→ gallery.html
```

The current implementation keeps presentation separate from the gallery data source and reuses the shared `FinalCta` before the Footer.

## Latest Public MVP Checkpoint — 2026-08-21

The following public visual routes are now complete for the current MVP:

```text
Home
About
Gallery
Quote Request / Contact
```

The Quote Request route now combines:

```text
final responsive mobile and desktop visual design
Reactive Forms validation
attachment MIME and size validation
future-date validation
animated submission feedback
success and error states
CanDeactivate unsaved-changes protection
beforeunload browser protection
custom accessible leave dialog
Supabase persistence
optional private attachment upload
Edge Function email notification
```

The Quote Request design remains Mobile First.

Desktop reuses the same semantic Angular template and recomposes the page through responsive SCSS. No duplicate mobile/desktop Angular templates are maintained.

The decorative GC watermark was intentionally removed from the final Quote Request composition because it competed visually with the form.

The Gallery remains at:

```text
18 images
```

with the two repeated images replaced by new food photography.

### Latest quality baseline

```text
Test files
→ 23 passed

Tests
→ 146 passed

Lint
→ all files pass

Production build
→ completed successfully
→ 5 public routes prerendered
```

The previous Services component-style budget blocker was resolved before the Admin visual-cleanup branch was closed.

The expected Quote Request notification-failure test may write a diagnostic error to stderr while the test itself passes.

### Remaining visual MVP work

```text
Public routes
→ complete for the current MVP

/admin/**
→ responsive visual cleanup complete
```

The public Services route remains technically:

```text
ServicesComponent
pages/services
/servicios
```

while the visible commercial label remains:

```text
Chef privado & catering
Private chef & catering
```


## Services Visual Design Closure — 2026-08-23

The public Services route is visually complete for the current MVP while keeping its existing technical and service-document boundaries.

Current route and technical naming remain:

```text
/servicios
ServicesComponent
pages/services
```

Visible commercial labels remain:

```text
Chef privado & catering
Private chef & catering
```

### Responsive composition

The page follows the established Mobile First public design system and uses responsive SCSS to recompose the same feature content for larger screens.

Current composition:

```text
Hero
→ large gastronomic image
→ service label, title and supporting copy

Experience introduction
→ editorial heading and copy
→ three service cards

Catering sample
→ active service-document download action
→ decorative sample cover
→ three example items

Process
→ four visual steps
→ dedicated numbered assets on desktop

Final CTA
→ shared public closing action

Footer
→ inherited from PublicLayout
```

Mobile and desktop intentionally use different compositions through CSS while preserving the same route and business workflow.

### Services visual assets

Current Services assets include dedicated imagery for:

```text
hero plate
private dining
celebrations
custom catering
service icons
catering sample items
process icons
process numbered ornaments
decorative olive branches
```

The catering sample cover now uses:

```text
public/images/services/services-catering-sample-salmorejo-tuna.png
```

The numbered process ornaments are stored individually as:

```text
services-process-number-01.png
services-process-number-02.png
services-process-number-03.png
services-process-number-04.png
```

### Service-document workflow preserved

The redesign does not change the existing `ServiceDocumentService` responsibility or signed-URL flow.

```text
active service document metadata
→ ServicesComponent
→ visitor selects download icon
→ create 60-second signed URL
→ PDF opens in a safe new tab
```

The desktop download control is intentionally icon-only and retains a translated accessible name.

### Responsive validation

Manually reviewed on:

```text
mobile viewport
laptop display
large LG / ultrawide display
```

The ultrawide layout keeps a controlled max-width rather than stretching cards and typography across the complete viewport. Further ultrawide polish is deferred until the deployed Netlify URL can be tested on real devices and browsers.

### Quality status

```text
23 test files passed
146 tests passed
lint passes
```

No additional Services-specific tests are required for the visual-only changes because the existing behavioural coverage still validates:

```text
active document loading
download no-op without a document
duplicate-download prevention
signed URL request
safe window.open arguments
download error handling
pending-state reset
```

The component-style budget was adjusted deliberately after the responsive Services redesign. The production build is now green and continues to prerender the five public routes successfully.

## Admin Visual Cleanup Closure — 2026-08-23

The protected Admin area is visually complete for the current MVP.

The cleanup intentionally preserves the existing Auth, routing, Supabase and service boundaries. No new Admin business functionality was introduced during the visual pass.

Current protected routes remain:

```text
/admin
→ Admin Dashboard

/admin/quote-requests/:id
→ Admin Quote Request Detail

/admin/service-document
→ Admin Service Document
```

`/admin/login` remains a public sibling route outside `AdminLayout`.

### Responsive Admin shell

`AdminLayout` now provides a responsive shell around all protected Admin pages.

Mobile composition:

```text
brand header
→ sign-out control

RouterOutlet
→ active Admin page

fixed bottom navigation
→ Requests
→ Service document
→ Sign out

shared ScrollToTop
```

Desktop composition:

```text
sticky sidebar
→ Gerson Canales brand
→ Requests navigation
→ Service document navigation
→ Sign out

main content area
→ RouterOutlet

shared ScrollToTop
```

The responsive shell is implemented with one Angular template and CSS-driven recomposition.

### Admin Dashboard

The Dashboard keeps the existing `AdminQuoteRequestService` data flow and replaces the provisional wide table with a responsive card-based presentation.

Current UI includes:

```text
page heading
service-document management link
summary cards
→ total
→ pending
→ contacted
→ closed

responsive request cards
→ customer name and email
→ event type
→ event date
→ guest count
→ creation date
→ translated status badge
→ detail route link
```

The Dashboard remains responsible only for presentation and navigation. Shared request state remains owned by `AdminQuoteRequestService`.

### Admin Quote Request Detail

The routed detail view keeps the existing behaviour and presents it through a responsive two-area composition.

Current UI includes:

```text
back navigation
request status badge
request information card
status-management panel
private attachment panel
```

The creation timestamp is formatted for display with Angular `DatePipe` rather than exposing the raw ISO string.

Existing behaviour remains unchanged:

```text
ActivatedRoute id lookup
selected request Signal
effect-based status synchronization
status update
60-second private attachment signed URL
safe window.open with noopener,noreferrer
```

### Admin Service Document

The existing one-document workflow now uses responsive management cards.

Current UI includes:

```text
current document card
→ file name
→ formatted update time
→ delete action

upload / replacement card
→ PDF file selection
→ selected-file feedback
→ replace/upload action

success and error feedback
```

The page continues to use Angular `viewChild` to reset the native file input after successful mutations.

### Admin Login

The existing Admin Login visual treatment was retained because it was already suitable for the MVP.

No authentication behaviour or form architecture changed during the Admin visual cleanup.

### Shared ScrollToTop reuse

`ScrollToTop` now has a real second layout consumer:

```text
PublicLayout
AdminLayout
```

The component keeps its existing browser-safe implementation:

```text
afterNextRender
fromEvent(window, 'scroll')
takeUntilDestroyed
Signal
@if
```

The Admin placement accounts for the fixed mobile bottom navigation and uses a standard bottom-right position on larger screens.

### Post-MVP Admin API extension

The previously deferred Quote Request deletion workflow is now implemented as part of the HTTP/API architecture extension.

The Admin Quote Request feature now uses an Angular API boundary for:

```text
GET request list
GET request detail
PATCH request status
DELETE request
GET private attachment signed URL
```

Deletion is a complete workflow:

```text
confirmation UI
→ Angular HttpClient
→ authenticated Supabase Edge Function
→ Database DELETE authorization
→ private attachment cleanup when present
→ local Signal synchronization
→ tests
```

The remaining API migration continues with the public Quote Request submission flow and Service Document data/storage operations.

### Final MVP quality baseline

Validation after the Admin visual cleanup:

```text
Test files
→ 23 passed

Tests
→ 146 passed

Lint
→ all files pass

Production build
→ completed successfully
→ 5 public routes prerendered
```

Manual visual validation includes:

```text
Admin Dashboard
→ mobile
→ desktop

Admin Quote Request Detail
→ mobile
→ desktop

Admin Service Document
→ mobile
→ desktop

Admin Login
→ desktop presentation retained

Admin navigation
→ protected routing
→ sign out
→ ScrollToTop
```

At this checkpoint the current functional and visual MVP is complete. Remaining work is deployment closure, real-device smoke testing and the optional interview-focused HTTP/API extension.
---

## HTTP API Boundary — 2026-08-26

The post-MVP technical extension is actively moving application data and Storage operations away from direct `supabase-js` calls in Angular.

Current target architecture:

```text
Angular page / component
        ↓
feature state service
Signals + RxJS orchestration
        ↓
API client service
HttpClient + Observable<T>
        ↓
HTTP
        ↓
Supabase Edge Functions
        ↓
PostgreSQL + Supabase Storage
```

This boundary allows Angular to depend on application HTTP contracts instead of the persistence SDK.

Supabase remains the backend platform and persistence implementation.

### HttpClient configuration

Angular registers HttpClient globally with:

```text
provideHttpClient
withFetch
withInterceptors
```

The functional authentication interceptor is stored under:

```text
src/app/core/interceptors/auth.interceptor.ts
```

`AuthService` exposes the current access token through a readonly Signal.

The interceptor reads that abstraction and adds:

```text
Authorization: Bearer <access-token>
```

to authenticated API requests.

Authentication is still provided by Supabase Auth during this phase. A later dedicated phase will decouple Auth itself from direct Supabase usage.

### Admin Quote Request API client

Current API client:

```text
src/app/features/quote-request/api/admin-quote-request-api.service.ts
```

It exposes `Observable<T>` contracts through Angular HttpClient:

```text
getQuoteRequests()
getQuoteRequestById(id)
updateQuoteRequestStatus(id, status)
deleteQuoteRequest(id)
getAttachmentSignedUrl(attachmentPath)
```

Current deployed Edge Functions:

```text
supabase/functions/quote-requests/
supabase/functions/delete-quote-request/
supabase/functions/quote-request-attachments/
```

Current Admin HTTP contracts:

```text
GET    /functions/v1/quote-requests
GET    /functions/v1/quote-requests/:id
PATCH  /functions/v1/quote-requests/:id
DELETE /functions/v1/delete-quote-request/:id
GET    /functions/v1/quote-request-attachments/:attachmentPath
```

### Authentication and authorization

Admin Edge Functions receive the browser JWT and create a Supabase client using the request authorization context.

Security flow:

```text
authenticated Admin session
→ JWT
→ Angular interceptor
→ Authorization header
→ Edge Function
→ Supabase authenticated client
→ PostgreSQL GRANT + RLS
→ Storage policies
```

The Admin data functions intentionally do not use `service_role` simply to bypass authorization.

Current permissions include authenticated DELETE access to `quote_requests` and authenticated deletion of objects from:

```text
quote-request-attachments
```

RLS remains the final row-level authorization boundary.

### RxJS and Signal boundary

API client services return cold HttpClient Observables.

Feature services compose those flows and synchronize application state:

```text
HttpClient Observable
→ pipe(...)
→ tap
→ update/set Signals
→ catchError when feature state must react
→ finalize pending state
→ component subscribes
```

The component is the final consumer for request flows that require execution.

For simple pass-through methods such as signed URL retrieval, the feature service returns the Observable without subscribing.

### Admin Quote Request state

`AdminQuoteRequestService` now owns:

```text
requests
selectedRequest
isLoading
hasError
isUpdatingStatus
isDeleting
```

List, detail and status operations no longer call the Supabase Database SDK directly.

Private attachment signed URL creation no longer calls Supabase Storage directly from Angular.

Successful status mutations synchronize both:

```text
selectedRequest
requests
```

Successful deletion removes the request from the list and clears `selectedRequest` when it matches the deleted id.

### Tests

The HTTP migration includes focused tests for:

```text
AdminQuoteRequestApiService
→ GET list
→ GET detail
→ PATCH status
→ DELETE
→ signed attachment URL

AdminQuoteRequestService
→ Observable request flows
→ Signal synchronization
→ pending state
→ error state
→ deletion
→ signed URL pass-through

AdminDashboard
→ Observable-based loading contract

AdminQuoteRequestDetail
→ Observable-based detail loading
→ status update
→ attachment opening
→ pending/error handling
```

HttpClient API tests use:

```text
HttpTestingController
```

and do not call the remote backend.

### Current validation baseline

Validated on 2026-08-26:

```text
Test files
→ 24 passed

Tests
→ 154 passed

Lint
→ all files pass

Production build
→ completed successfully
→ 5 public routes prerendered
```

Current build also reports a non-blocking initial bundle budget warning:

```text
configured initial warning budget
→ 500.00 kB

current initial bundle
→ 545.16 kB
```

### Current migration status

Completed behind the HTTP API boundary:

```text
Admin Quote Requests
→ list
→ detail
→ status update
→ deletion
→ private attachment signed URL
```

Still pending in the same API-layer branch:

```text
public Quote Request POST
public attachment upload
Service Document metadata / Storage operations
interceptor request scoping
functional resolver for Admin detail
final API tests and cleanup
```

After the data and Storage migration is complete, authentication will be handled as a separate decoupling phase.

The active branch remains:

```text
feature/http-api-layer
```
