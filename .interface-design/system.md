# Interface System - Serum Box

## Direction and Feel
- Clinical operations interface with low noise and high clarity.
- Calm, precise, and task-focused for laboratory workflows.
- Visual language prioritizes traceability, control, and fast comprehension.

## Color Direction
- Keep base pattern: neutral whites/grays + teal brand accent.
- Teal is the primary functional accent (focus, active, key actions).
- Semantic colors (warning/error/success) are reserved for state meaning only.
- Avoid decorative multi-accent usage in dashboards and auth.

## Depth Strategy
- Primary hierarchy through subtle borders.
- Soft shadow only for elevated containers (header shells/cards).
- Inputs are slightly inset relative to parent surfaces.
- Do not mix heavy shadows with strong contrasting borders.

## Spacing System
- Base unit: 4px grid.
- Common rhythm: 8 / 12 / 16 / 24 / 32.
- Section spacing is consistent across dashboard pages.

## Typography and Hierarchy
- Strong, concise page titles.
- Section headings with subdued subtitles for context.
- Metadata and helper copy in muted tones.

## Reusable Patterns
- `AuthSplitLayout` for contextual auth pages.
- `AuthCard` with logo, badge, and structured form hierarchy.
- "Paso del protocolo" strip in auth flows for continuity.
- Dashboard shell with contextual top header and active user signal.
- `DashboardSection` as the standard content container.
- Stat cards + quick-action cards with consistent border and spacing.
- Form controls: neutral field background, soft border, teal focus.

## Localization Rule
- Authentication and user access flows are written in Spanish (Argentina).
- Use voseo consistently in CTA and helper copy (e.g., "Iniciá", "Creá", "Revisá").

## Avoid
- Harsh borders or dramatic surface jumps.
- Competing accent colors for equivalent actions.
- Inconsistent spacing or ad-hoc component paddings.
- Generic unlabeled sections without operational context.
