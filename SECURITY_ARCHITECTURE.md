# VaptVaga Beta - Zero-Trust Architecture & Security Guidelines

This document outlines the foundational security constraints for the VaptVaga Beta MVP. As a platform handling PII (Personally Identifiable Information) from businesses and freelancers, along with subscription paywalls, the entire codebase strictly adheres to a **Zero-Trust Frontend Architecture**.

## 1. Absolute DevTools (F12) Protection & State Security

### 1.1 No Data Leaks
- **Rule**: Absolutely no sensitive user data (e.g., phone numbers, precise locations, locked candidate profiles), confidential system data (API secrets, admin configurations), or business logic rules should ever be exposed to the client-side.
- **Enforcement**:
  - The backend is the sole gatekeeper of data. Data must be sanitized and filtered *before* being serialized into JSON responses sent to the client.
  - Sensitive entity properties must never be returned from API endpoints unless the requesting identity has explicit, verified authorization to access them.

### 1.2 Backend Enforced Paywalls
- **Rule**: Do not rely on CSS (`display: none`, `filter: blur`) or simple frontend state variables (e.g., `isPremium = false`) to hide premium content.
- **Enforcement**:
  - If a user is on a "Free" plan, the API/data fetching layer must return `null`, empty arrays, or masked strings (e.g., `***`) for restricted fields.
  - A user inspecting the DOM, Network tab, or React DevTools must find no underlying data of value for premium features. The data simply must not be there.

## 2. Payment & Stripe Integrity (Anti-Tampering)

### 2.1 Visual Prices Only
- **Rule**: Any prices or subscription limits displayed on the frontend (e.g., R$ 39.90) are strictly for visual UI presentation. We assume the UI is instantly compromisable.

### 2.2 Server-Side Truth
- **Rule**: The actual transaction amounts, subscription tier validations, and feature limits must be completely decoupled from the frontend DOM.
- **Enforcement**:
  - A user maliciously altering HTML text values, local storage, or React state variables via F12 must NEVER be able to change a Stripe checkout price, bypass a paywall, or spoof a "Premium" status.
  - All checkout sessions and payment intents must be constructed server-side based on secure, backend-calculated prices and tiers.
  - Webhooks from the payment processor (Stripe) are the *only* source of truth for updating user subscription state in our database.

## 3. Strict State Separation

### 3.1 Role-Based Routing & Component Isolation
- **Rule**: Switching between "Company" and "Freelancer" roles must be governed by a hard separation of state and routing infrastructure.
- **Enforcement**:
  - A user manipulating client-side routing must not be able to access administrative views, dashboards, or profile scopes belonging to the other user type.
  - Role verification must happen on the backend for every API request via secure JWT tokens or session cookies. If a Freelancer attempts to call a Company API route, it must return a 403 Forbidden, regardless of what the frontend UI shows.
  - Frontend routers must lazily load or entirely block restricted route trees based on the verified server-authenticated role.

---
*These constraints are mandatory. Any pull requests or code generation that violates these principles will be rejected.*
