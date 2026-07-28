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
core/models/supported-language.type.ts
core/services/language.service.ts
```

### `features`

Contains business-specific models, data and services.

Current gallery structure:

```text
features/gallery/
├── data/
│   └── gallery.mock.ts
├── models/
│   └── gallery-item.model.ts
└── services/
    └── gallery.service.ts
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
├── App Routes
│
└── Public Layout
    │
    ├── Header
    │   ├── Brand
    │   ├── Navigation
    │   └── Language selector
    │
    ├── Router Outlet
    │   ├── Home
    │   ├── Services
    │   ├── Gallery
    │   ├── Quote Request
    │   └── About
    │
    └── Footer
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

The project currently uses minimum meaningful component tests.

Tests verify:

- Component creation
- Required translation providers
- Expected rendered elements
- Gallery item rendering

The gallery test confirms that the three current mock items are rendered.

Current test status:

```text
10 test files passing
15 tests passing
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
