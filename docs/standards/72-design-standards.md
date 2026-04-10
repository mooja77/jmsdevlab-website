# 72 -- Design Standards

> **Last Updated:** 2026-03-25
> **Owner:** John Moore
> **Related docs:** [Coding Standards](71-coding-standards.md) | [App Build Playbook](70-app-build-playbook.md) | [GDPR Compliance](73-gdpr-compliance.md)

---

## Overview

These design standards apply to all JMS Dev Lab applications. Shopify embedded apps use the Polaris design system. Standalone web apps and marketing websites follow the JMS Dev Lab brand guidelines. Every screen in every app must handle loading, empty, and error states.

---

## 1. Responsive Breakpoints

All apps must be fully functional at these viewport widths:

| Breakpoint | Width | Usage |
|-----------|-------|-------|
| Mobile | 375px | Smartphones, Shopify mobile admin |
| Tablet | 768px | Tablets, small laptops |
| Desktop | 1024px+ | Standard desktop, Shopify desktop admin |

### Rules

- **Mobile-first CSS.** Write base styles for mobile, add complexity with `min-width` media queries.
- Touch targets must be at least 44x44px on mobile.
- No horizontal scrolling at any breakpoint.
- Data tables must be scrollable or stack on mobile -- never break the layout.
- Test on real devices when possible (Chrome DevTools responsive mode at minimum).

### Shopify Admin Context

- Shopify embedded apps render inside the admin panel, which has its own chrome (sidebar, top bar).
- Effective content width on desktop is approximately 720px in the main content area.
- Polaris handles most responsive behaviour automatically. Do not fight it with custom breakpoints.

---

## 2. Shopify Polaris Design System

### When to Use

- **Always** for Shopify embedded app UIs (`apps/shopify`).
- **Never** for standalone web apps or marketing websites (use custom design or Tailwind).

### Core Layout Components

| Component | Usage |
|-----------|-------|
| `Page` | Top-level page wrapper with title, primary action, breadcrumbs |
| `Layout` | Two-column layouts (main content + sidebar) |
| `Layout.Section` | Content sections within Layout |
| `Card` | Content grouping with optional header/footer |
| `BlockStack` | Vertical spacing between elements |
| `InlineStack` | Horizontal alignment of elements |

### Data Display

| Component | Usage |
|-----------|-------|
| `IndexTable` | Sortable, selectable data tables with bulk actions |
| `DataTable` | Simple read-only data tables |
| `ResourceList` | List of resources with actions |
| `DescriptionList` | Key-value pairs |
| `Badge` | Status indicators (success, warning, critical, info) |

### Forms

| Component | Usage |
|-----------|-------|
| `TextField` | Text input with label, help text, error |
| `Select` | Dropdown selection |
| `Checkbox` | Boolean toggles |
| `ChoiceList` | Radio buttons or multi-select |
| `FormLayout` | Consistent form spacing and alignment |

### Feedback

| Component | Usage |
|-----------|-------|
| `Banner` | Important messages (info, success, warning, critical) |
| `Toast` | Temporary success/error notifications (via App Bridge) |
| `SkeletonPage` | Loading state placeholder |
| `SkeletonBodyText` | Loading state for text content |
| `EmptyState` | No data state with illustration and CTA |
| `Spinner` | Inline loading indicator |

### Polaris Rules

- Do **not** override Polaris component styles with custom CSS.
- Use Polaris design tokens for spacing, colours, and typography when building custom components.
- Follow Polaris patterns for action placement: primary actions on the right, secondary on the left.
- Use Polaris icons from `@shopify/polaris-icons` -- do not import external icon libraries.

---

## 3. Required Screen States

**Every screen in every app must handle these three states.** No exceptions.

### Loading State

- Use skeleton screens (preferred) or spinner.
- Skeleton screens are better UX -- they show the expected layout shape.
- For Shopify apps: `SkeletonPage`, `SkeletonBodyText`, `SkeletonDisplayText`.
- For web apps: CSS skeleton placeholders or a spinner with descriptive text.
- Never show a blank screen while data loads.

### Empty State

- Show when there is no data to display (first-time user, empty list).
- Include:
  - **Illustration** -- Visual indicator (Polaris `EmptyState` illustration or custom).
  - **Heading** -- What this screen is for.
  - **Description** -- Why it is empty and what to do next.
  - **Call to action** -- Primary button to create the first item.
- Example: "No repairs yet. Create your first repair ticket to get started."

### Error State

- Show when data loading fails or an operation errors.
- Include:
  - **Error message** -- Human-readable, not a stack trace.
  - **Retry button** -- Let the user try again without refreshing.
  - **Support contact** -- Link to john@jmsdevlab.com for persistent errors.
- Never show raw error objects or HTTP status codes to users.
- Log the full error details to the server for debugging.

---

## 4. Onboarding and Guided Tour

### First-Run Experience

Every app must include a guided tour that activates on first use:

1. **Welcome step** -- Brief explanation of the app's purpose.
2. **Feature highlights** -- 3-5 steps pointing to key UI elements.
3. **Settings reminder** -- Direct user to configure essential settings.
4. **Completion** -- Congratulations message with link to support/docs.

### Implementation

- **Primary library:** `react-joyride` (currently used in most apps).
- **Alternative:** `nextstepjs` (considered for newer apps).
- Tour state persisted in the database (per shop for Shopify, per user for web).
- **Restartable from Settings** -- Users must be able to replay the tour at any time.
- **Skip option** -- Experienced users should not be forced through the tour.

### Demo Mode

- Pre-load sample data on first install.
- Clearly label demo data (e.g., banner: "You're viewing demo data. Remove it from Settings.").
- One-click removal from Settings page.
- Demo data is useful for:
  - New users exploring the app.
  - Shopify reviewers testing during app review.
  - Screenshots and screencasts.

---

## 5. JMS Dev Lab Brand

### Colours

| Name | Hex | Usage |
|------|-----|-------|
| Primary Blue | `#2563eb` | Primary buttons, links, accents |
| Primary Blue (hover) | `#1d4ed8` | Button hover states |
| Dark Text | `#1e293b` | Headings, primary text |
| Body Text | `#475569` | Paragraph text, descriptions |
| Light Background | `#f8fafc` | Page backgrounds |
| White | `#ffffff` | Cards, panels |
| Border | `#e2e8f0` | Card borders, dividers |
| Success | `#16a34a` | Positive feedback |
| Warning | `#d97706` | Caution states |
| Error | `#dc2626` | Error states, destructive actions |

### Typography

| Element | Font | Weight | Size |
|---------|------|--------|------|
| Headings | Inter | 600-700 | 24px-36px |
| Body text | Inter | 400 | 16px |
| Code/mono | JetBrains Mono | 400 | 14px |
| Labels | Inter | 500 | 14px |
| Small text | Inter | 400 | 12px |

### Logo and Branding

- App icons: **1200x1200px** PNG, required for Shopify App Store.
- Each app has its own icon (not the JMS Dev Lab logo).
- JMS Dev Lab logo used on marketing websites and footers.

### Footer Requirement

**Every app must include a "Made by JMS Dev Lab" footer.** This applies to:

- Shopify embedded apps (bottom of the main layout).
- Standalone web apps (page footer).
- Marketing websites (site footer with full contact info).

Footer format:
```
Made by JMS Dev Lab
```

Link to `https://jmsdevlab.com` where applicable.

### Exceptions (Shopify Embedded)

- Within Shopify embedded apps, use **Polaris styles** for the app UI, not JMS Dev Lab brand colours.
- The JMS Dev Lab branding appears only in the footer, not in the primary UI.
- App marketing websites (separate from the embedded app) use the full JMS Dev Lab brand.

---

## 6. Navigation Patterns

### Shopify Embedded Apps

- Use Shopify App Bridge for top-level navigation.
- Navigation items in the sidebar (configured in `shopify.app.toml` or via App Bridge).
- Standard navigation structure:
  1. Dashboard / Home
  2. Core feature pages (2-4 items)
  3. Settings
  4. Support / Help

### Standalone Web Apps

- Top navigation bar with logo, nav links, user menu.
- Mobile: Hamburger menu with slide-out drawer.
- Breadcrumbs for nested pages.
- Active state on current nav item.

---

## 7. Forms and Validation

### Inline Validation

- Validate on blur (not on every keystroke).
- Show error messages directly below the field.
- Use red border and error icon for invalid fields.
- Clear error when the user starts correcting the field.

### Form Submission

- Disable submit button while request is in flight.
- Show loading indicator on the button.
- On success: Toast notification (Shopify) or success banner (web).
- On error: Scroll to first error, highlight invalid fields.

### Required Fields

- Mark required fields with an asterisk (*) or use Polaris's `requiredIndicator` prop.
- Never make all fields required -- request minimum necessary data.

---

## 8. Accessibility

### Minimum Standards

- All interactive elements keyboard-accessible.
- Colour contrast ratio minimum 4.5:1 for text, 3:1 for large text.
- Alt text on all images.
- ARIA labels on icon-only buttons.
- Focus indicators visible on all interactive elements.
- Form fields properly labelled (not just placeholder text).

### Polaris Advantage

- Polaris components are built with accessibility in mind. Using them correctly provides a strong accessibility baseline.
- Do not disable focus outlines or override Polaris's built-in accessibility features.

---

## 9. Performance

### Targets

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5s |
| Largest Contentful Paint | < 2.5s |
| Time to Interactive | < 3.0s |
| Bundle size (gzipped) | < 200KB initial |

### Techniques

- Lazy load routes and heavy components.
- Use TanStack Query's caching to avoid redundant API calls.
- Optimise images (WebP format, appropriate sizing).
- Virtualise long lists (react-window or similar).
- Paginate API results (default 20-50 items per page).
