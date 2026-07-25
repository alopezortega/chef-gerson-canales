# Architecture

## Overview

Chef Gerson Canales is an Angular application for a professional chef offering catering and private event services.

The application is designed with:

- Standalone Angular architecture
- Lazy-loaded routes
- Mobile First responsive design
- Clear separation of responsibilities
- Accessible navigation
- Scalable styling through design tokens

---

## Tech Stack

- Angular 21
- TypeScript
- SCSS
- Angular Router
- Angular Signals
- RxJS
- ESLint
- Prettier

---

## Folder Structure

```text
src/
└── app/
    ├── core/
    ├── features/
    ├── layout/
    │   ├── admin-layout/
    │   └── public-layout/
    ├── pages/
    └── shared/
```

### `core`

Contains application-wide infrastructure and singleton responsibilities.

Examples:

- Global services
- Interceptors
- Guards
- Application models
- Authentication infrastructure

### `features`

Contains business-specific functionality.

Examples:

- Quote request
- Gallery management
- Testimonials
- Document management

### `layout`

Contains application shell components and route layouts.

Current layouts:

```text
PublicLayout
AdminLayout
```

The `PublicLayout` contains:

```text
Header
RouterOutlet
Footer
```

### `pages`

Contains route-level components.

Current public pages:

```text
Home
Services
Gallery
Quote Request
About
```

### `shared`

Contains reusable, presentation-focused components, directives, pipes and shared models.

Components are only moved to `shared` when there is a real reuse case.

---

## Application Structure

```text
App
│
├── app.routes.ts
│
└── PublicLayout
    │
    ├── HeaderComponent
    │   ├── brand link
    │   └── HeaderNavbarComponent
    │
    ├── RouterOutlet
    │   ├── HomeComponent
    │   ├── ServicesComponent
    │   ├── GalleryComponent
    │   ├── QuoteRequestComponent
    │   └── AboutComponent
    │
    └── FooterComponent
```

---

## Routing

Public routes:

```text
/                       → HomeComponent
/servicios              → ServicesComponent
/galeria                → GalleryComponent
/solicitar-presupuesto  → QuoteRequestComponent
/sobre-el-chef          → AboutComponent
```

The application uses standalone lazy loading:

```ts
loadChildren;
```

for route groups and layouts.

```ts
loadComponent;
```

for route-level standalone components.

Public pages are rendered inside the `PublicLayout` `RouterOutlet`.

---

## Navigation

Internal and external navigation are represented by separate models.

### Internal navigation

```ts
export interface NavigationItem {
  label: string;
  route: string;
  isCta?: boolean;
}
```

Internal links use:

```html
[routerLink]
```

### External navigation

```ts
export interface SocialLinkItem {
  ariaLabel: string;
  url: string;
  icon?: string;
}
```

External links use:

```html
[href] target="_blank" rel="noopener noreferrer"
```

This separation reflects their different semantics and behaviours.

---

## Header State

The responsive mobile menu uses an Angular signal:

```ts
protected readonly menuOpen = signal(false);
```

State changes are explicit:

```ts
protected toggleMenu(): void {
  this.menuOpen.update((isOpen) => !isOpen);
}

protected closeMenu(): void {
  this.menuOpen.set(false);
}
```

A computed signal derives the accessible button label:

```ts
protected readonly menuButtonLabel = computed(() =>
  this.menuOpen() ? 'Cerrar menú' : 'Abrir menú',
);
```

---

## Router Event Handling

The mobile menu closes after successful Angular Router navigation.

```ts
private readonly router = inject(Router);

constructor() {
  this.router.events
    .pipe(
      filter(
        (event): event is NavigationEnd =>
          event instanceof NavigationEnd,
      ),
      takeUntilDestroyed(),
    )
    .subscribe(() => this.closeMenu());
}
```

This allows the navigation state to react to route changes regardless of which component initiated the navigation.

`takeUntilDestroyed()` automatically completes the subscription when the component is destroyed.

---

## Template Strategy

The application uses modern Angular control flow.

Currently used:

```text
@if
@else
@for
track
```

Planned where appropriate:

```text
@empty
@switch
@defer
@placeholder
@loading
@error
```

Tracked values should be stable identifiers such as:

```text
item.route
socialLink.url
```

---

## Accessibility

The navigation includes accessible names and state information.

Examples:

```html
<nav aria-label="Navegación principal"></nav>
```

```html
<nav aria-label="Redes sociales"></nav>
```

```html
[attr.aria-label]="menuButtonLabel()"
```

```html
[attr.aria-expanded]="menuOpen()"
```

```html
aria-controls="main-navigation social-navigation"
```

Accessibility labels are written in the language presented to the user.

Automated analysis should be combined with manual keyboard and screen-reader-oriented validation.

---

## Styling

Global SCSS entry point:

```text
src/styles.scss
```

Design tokens:

```text
src/styles/_tokens.scss
```

Example:

```scss
:root {
  --color-text-primary: #1f1f1f;
  --color-background-primary: #ffffff;
  --color-accent: #2563eb;
  --color-accent-hover: #1d4ed8;

  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
}
```

Rules:

- Reusable global values are defined as CSS custom properties.
- Component-specific styles remain encapsulated in component SCSS files.
- New tokens are added only when a real reusable need exists.
- Existing tokens should be checked before introducing new ones.

---

## Responsive Design

The project follows a Mobile First strategy.

```text
Base styles
→ mobile

@media (min-width: 768px)
→ tablet and desktop
```

CSS controls responsive presentation.

TypeScript should only inspect screen size when behaviour cannot reasonably be expressed through CSS.

---

## CTA

The quote request route is the primary Call To Action.

It remains a normal Angular route but is visually distinguished through model metadata:

```ts
isCta: true;
```

Template binding:

```html
[class.cta]="item.isCta"
```

This keeps navigation data and presentation intent explicit without hard-coding route labels in CSS.

---

## Naming Conventions

Angular selectors:

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
- Comments
- Commit messages

User-facing content and accessibility labels are written in Spanish.

---

## Architectural Decisions

### Separate public and admin layouts

The public website and administrative area have different navigation, security and presentation responsibilities.

### Lazy-load route-level functionality

Standalone route components are loaded when required.

### Keep internal and external navigation separate

Angular routes and external URLs use distinct models and template mechanisms.

### Avoid premature abstraction

Reusable components are extracted only when reuse or complexity is demonstrated.

### Keep admin access outside the public interface

The public navigation does not expose administrative routes.

Authentication, authorization and guards will provide actual protection.

### Centralize reusable design values

Global visual values are maintained as design tokens instead of being duplicated across component styles.
