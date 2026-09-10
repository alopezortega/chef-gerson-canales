# Chef Gerson Canales

Bilingual Angular website for a private chef and catering service, including a public portfolio, quote-request workflow and protected Admin area.

## Stack

- Angular 21
- TypeScript
- SCSS
- Angular Signals
- RxJS
- Angular HttpClient
- Reactive Forms
- Angular SSR
- `ngx-translate`
- Supabase
- Vitest
- Netlify

## Main Features

- Responsive public website
- Spanish / English content
- Private-chef and catering presentation
- Editorial gallery
- Quote Request form with optional attachment
- Protected Admin area
- Quote Request management
- Bilingual downloadable service documents
- Email notifications through backend infrastructure
- Responsive and optimized local image delivery

## Architecture

The frontend is decoupled from the current Supabase implementation through an HTTP API boundary, so backend infrastructure can evolve without coupling feature components to a specific persistence SDK.

```text
Angular Component
      ↓
Feature Service
      ↓
API Client
      ↓
Angular HttpClient
      ↓
Supabase Edge Functions
      ↓
Database / Storage / Auth
```

Angular Signals handle synchronous application state and RxJS is used for asynchronous request flows.

More detail is available in [ARCHITECTURE.md](./ARCHITECTURE.md).

## Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm start
```

## Quality Checks

Run the test suite:

```bash
npm test -- --run
```

Run ESLint:

```bash
npm run lint
```

Create a production build:

```bash
npm run build
```

Current local validation:

```text
32 test files passed
206 tests passed
lint passed
production build passed
```

## Deployment

The project is configured for Netlify with Angular SSR / prerendering support.
