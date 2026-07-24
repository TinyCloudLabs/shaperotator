# Product

## Register

product

## Users

TinyCloud developers and demo operators who need to transfer one Shape account
record into a user-owned TinyCloud space. They use the app as a short, explicit
handoff workflow rather than as an ongoing dashboard.

## Product Purpose

Shaperotator logs the user into TinyCloud, accepts a Shape account code or URL
and a 9-digit API key, fetches the corresponding account JSON, and writes the
record to TinyCloud KV through one explicit migration action. The demo API
returns deterministic account data seeded by the Shape account ID so
demonstrations and tests are repeatable.

## Brand Personality

Direct, trustworthy, and utilitarian. The interface should feel like a focused
developer utility whose behavior is easy to verify and hand off.

## Anti-references

No marketing landing page, oversized hero, feature grid, decorative dashboard,
or invented product metrics. Avoid visual effects that compete with the import
workflow or imply production readiness for the mocked Shape API.

## Design Principles

- Keep the complete workflow visible and understandable on one screen.
- Make data provenance and the final TinyCloud KV destination explicit.
- Make the required login state and migration result unmistakable.
- Distinguish mocked API behavior from real TinyCloud persistence.
- Prefer standard controls and plain status language over decorative UI.

## Accessibility & Inclusion

Use semantic form controls, visible keyboard focus, descriptive status messages,
readable contrast, and layouts that remain usable on narrow screens. Respect
reduced-motion preferences and do not encode state by color alone.
