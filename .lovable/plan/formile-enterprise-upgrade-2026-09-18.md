# Formile Enterprise Upgrade

## Product Direction
- Apply the selected **Enterprise campaign dashboard** direction across the signed-in product, adapted to Formile rather than copied from the reference.
- Use the locked system: **Pearl & Signal Red** (`#FCFCFD`, `#F3F4F6`, `#E30613`, `#17181C`), **Sora** headings, **Manrope** body text, and a dense executive-dashboard rhythm.
- Replace the heavy black sidebar with a light pearl navigation rail, precise red active states, crisp borders, restrained depth, and a compact global command header.
- Preserve the official Formile logo, all existing routes, authentication, form behavior, submissions, and stored data.

## 1. Safe Data and Logo Storage
- Add nullable form fields for Redirect URL, Offer ID, Offer Name, Offer Logo URL, and template layout/style metadata so all existing rows remain valid unchanged.
- Add matching offer identity and presentation metadata to user-created templates.
- Create a private, authenticated offer-logo storage area with per-user folders and access rules; forms will use real uploaded logos or explicitly selected existing uploads only.
- Refresh generated database types after the additive migration.

## 2. Form Identity and Submission Behavior
- Add a polished Offer Identity section to form creation and the builder for Offer ID, Offer Name, and logo upload/selection.
- Add optional Redirect URL with URL validation and clear helper text explaining post-submission behavior.
- Save all settings without changing existing field JSON or publication state.
- Show offer logo/name/ID consistently in Manage Forms, builder header, preview, public form, submission report, and conversion report.
- On published forms, redirect only after a successful submission; otherwise keep the existing success message flow.

## 3. Professional Report Export
- Create one reusable export system and an Export menu for both report pages.
- Export the currently filtered rows only in CSV, XLSX, and PDF.
- Include Formile report title, generated timestamp, offer identity, stable column ordering, clean labels, and summary metrics where applicable.
- Keep exports client-generated and downloadable without exposing other users’ data.

## 4. Premium Template Gallery
- Expand templates from field sets into branded presentation presets with layout, hierarchy, CTA style, offer identity, and responsive rendering.
- Provide five built-in starter templates: Premium Lead Capture, Modern Contact Form, Campaign Registration, Product Enquiry, and Application Form.
- Keep built-in starters as curated application definitions rather than fake user records; user-created templates remain stored and editable.
- Add category filtering, rich gallery cards, preview-before-use, and one-click creation from a chosen template.
- Use the supplied screenshot only for structural inspiration: strong campaign identity, clear hierarchy, grouped fields, and decisive CTA treatment. Do not embed or copy the screenshot.

## 5. Cohesive Product Redesign
- Retheme the application shell, header, dashboard, forms, builder, templates, reports, profile, settings, dialogs, cards, tables, controls, loading, empty, and error states.
- Preserve the current navigation hierarchy and accordion behavior exactly.
- Use disciplined 6–8px radii, pearl surfaces, fine borders, modest shadows, compact spacing, and signal-red emphasis rather than generic admin styling or excessive effects.
- Keep public, authentication, and account screens visually consistent with the same system.

## 6. Functional Light and Dark Themes
- Add a global light/dark toggle in the signed-in header.
- Persist the user’s selection locally and apply it before first paint to avoid theme flashing.
- Rework every semantic color token and chart treatment for reliable contrast in both themes.
- Make menus, dialogs, drawers, toasts, forms, and public templates theme-safe.

## 7. Motion System
- Establish restrained 180–300ms motion tokens with reduced-motion support.
- Apply them to navigation accordions, mobile drawer, page entrances, cards, buttons, inputs, dialogs, menus, templates, builder fields, charts, toasts, and theme changes.
- Favor opacity, transform, and elevation transitions; avoid bounce, large movement, and decorative animation.

## 8. Validation
- Verify additive migration, access rules, existing-row compatibility, logo upload/select, and persistence.
- Verify successful public submission with and without Redirect URL.
- Verify CSV/XLSX/PDF output for filtered submissions and conversions.
- Verify all five starter previews and form creation from each.
- Verify light/dark persistence, contrast, and no flash.
- Verify desktop and 393px mobile navigation, forms, gallery, builder, reports, dialogs, and exports.
- Check build, runtime, console, network, and database security signals before completion.

## Technical Notes
- Continue using TanStack Start, the existing component library, Lovable Cloud authentication/database/storage, and existing route structure.
- Use additive database changes only; no destructive migrations or data replacement.
- Use browser-safe export libraries for XLSX and PDF, isolated behind a reusable export module.
- Store template presentation as typed metadata and render through shared offer/header and form-layout components.
