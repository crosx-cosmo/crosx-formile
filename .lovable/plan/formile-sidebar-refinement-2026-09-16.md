# Formile Sidebar Refinement

## Scope
Refine only the signed-in sidebar and mobile navigation drawer. Keep every existing destination, the Formile identity, and all page content unchanged.

## Implementation
- Reorganize navigation into direct links for Dashboard, Profile, and Settings, plus collapsible parent sections for Forms, Templates, and Reports.
- Keep one expandable section open at a time, automatically opening the section that contains the current page.
- Add smooth height/fade transitions, rotating chevrons, indented child links, and an animated red active indicator.
- Keep an open parent visually highlighted when one of its child pages is active.
- Refine spacing, typography, focus rings, hover states, and restrained interaction motion using existing Formile design tokens.
- Polish the mobile drawer with a blurred overlay, smoother entrance/exit, a clear close control, and reliable close-on-navigation behavior.
- Preserve sign-out behavior and all current links.

## Validation
- Verify desktop active states and one-section-at-a-time accordion behavior.
- Verify mobile drawer opening, backdrop, accordion controls, navigation close behavior, and no overlap at the current phone size.
- Check the project preview for build and runtime errors.
