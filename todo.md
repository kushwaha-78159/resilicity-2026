
# Project TODO

- [x] Build elegant responsive dashboard shell with sidebar navigation and premium visual system
- [x] Add KPI cards for crowd density, heat index, traffic congestion, and overall risk
- [x] Add protected scenario creation flow with attendance, start time, and weather inputs
- [x] Implement database-backed scenario persistence, listing, timestamps, outcomes, and comparison
- [x] Implement Google Maps NRG Stadium map with traffic hotspots, heat zones, and crowd flow overlays
- [x] Implement strict green/yellow/red risk alert panel for heat, traffic, and crowd safety
- [x] Implement recommendation engine based on simulation outcomes
- [x] Add Recharts historical trends for temperature, attendance, and congestion
- [x] Add protected routes and authenticated create/save scenario behavior
- [x] Add Vitest coverage for simulation and scenario persistence contracts
- [x] Run typecheck, tests, and responsive visual verification

## History

- [x] User requested refined interactive match-day risk management dashboard centered around NRG Stadium with Google Maps, Recharts, protected scenario saving, and strict green/yellow/red risk colors.

## Completed

- [x] Initialized the full-stack TypeScript project with React, Express/tRPC, Drizzle database, and Manus authentication foundations

- [x] Build and wire a scenario comparison UI that calls scenarios.compare and displays differences across saved runs
- [x] Fix Google Maps loading reliability and add a visible error state/fallback when the script cannot load
- [x] Add the attendance series to the Recharts visualization
- [x] Create actual protected routes/pages for scenario lab/history or clearly gate those routes behind auth
- [x] Add Vitest coverage for scenario persistence/list/compare contracts, including auth protection
- [x] Capture and review mobile screenshots to verify responsive behavior
