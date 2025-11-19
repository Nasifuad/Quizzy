# Frontend Feature Tickets

Each ticket is a short title with concise acceptance criteria.

## 🚀 Frontend Core

- Routing — AC: Routes set up for all main pages; navigation works without full page reloads.
- State — AC: Centralized state (context or store) holds auth and current exam state.
- API — AC: API client module handles auth header, refresh flow, and error handling.
- UI — AC: Shared UI primitives exist and are used across pages.
- Auth — AC: Login/Register flows work; auth token stored and used for protected API calls.
- Theme — AC: Light/dark toggle persists preference in storage.
- Navigation — AC: Navbar renders links and shows user state (logged in/out).
- Caching — AC: API responses cached where appropriate (exams list) with invalidation.

## 📄 Pages

- Home — AC: Landing page with high-level links and CTA to start exam.
- Login — AC: Form validates input and logs user in, stores token.
- Register — AC: New users can register; shows validation errors.
- Profile — AC: Displays user info; allows editing name/email.
- Exams — AC: Lists available exams with metadata and start action.
- Details — AC: Exam detail page shows questions count & duration.
- Start — AC: Initializes attempt and navigates to exam UI.
- Result — AC: Shows score, correct/incorrect counts and percent.
- Review — AC: Student can review each question with selected vs correct answer.
- Leaderboard — AC: Shows top scores for the exam (if available).
- Admin — AC: Admin pages to manage questions/exams and view attempts.

## 🧩 Components

- Navbar — AC: Responsive navbar with links and auth actions.
- Footer — AC: Simple footer present on pages.
- Question — AC: Renders question text and options, exposes selection callback.
- Options — AC: Options component supports keyboard + ARIA roles.
- Timer — AC: Timer shows remaining time and triggers auto-submit when 0.
- Progress — AC: Shows question progress and allows navigation.
- Modal — AC: Reusable modal component for confirmations.
- Cards — AC: Reusable card layout for lists.
- Loader — AC: Global loader for async actions.
- Button — AC: Reusable button with variants.
- Input — AC: Reusable input with validation states.
- Chart — AC: Small chart component for analytics (e.g., score distribution).

## ⚙️ Utilities

- Validation — AC: Centralized form validation utilities (or schema integration).
- Formatter — AC: Date/number formatter utilities.
- Storage — AC: Wrapper over localStorage/sessionStorage with TTL option.
- Guard — AC: Route guards for authenticated and role-based routes.

## 🎨 Style

- Layout — AC: Page layout component used site-wide.
- Spacing — AC: Spacing scale available in CSS variables.
- Typography — AC: Typography scale and accessible sizes.
- Colors — AC: Design tokens for colors with accessible contrasts.
- Responsive — AC: Components adapt across common breakpoints.

## 🧪 Extras

- Search — AC: Search bar filters exams/questions client-side or via API.
- Filter — AC: Filter controls for exam lists (category, duration).
- Pagination — AC: Paginated lists for large collections.
- Toast — AC: Toast system for success/error messages.
- Skeleton — AC: Skeleton loaders for list placeholders.
