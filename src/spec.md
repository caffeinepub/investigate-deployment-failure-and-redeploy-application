# Specification

## Summary
**Goal:** Add an admin-controlled “Verified Artist (Pro)” status with 30-day expiry, verification application/renewal workflow, UI differentiation (blue badge), and backend-enforced podcast gating.

**Planned changes:**
- Add backend storage and APIs for Verified Artist activation, 30-day expiry with auto-expiration, and admin-controlled expiry extension.
- Add backend APIs for users to apply/renew verification and for admins to list/manage verification requests (including applicant full name).
- Enforce backend restriction so only active (non-expired) Verified Artist users can create podcast shows and episodes.
- Prioritize Verified Artist users’ song submissions first in the admin submissions list while keeping existing ordering stable within each group.
- Add user dashboard UI: show “Verified Artist benefits” (₹200 informational, English benefits list) + Apply button for non-verified users; show Renew message + Renew button when status is expired.
- Add admin dashboard “Verification List” panel/tab with in-dashboard pending-request notification and actions to approve/activate (and optionally reject).
- Update verified badge UI from green to blue and label verified users as Pro on surfaces where the badge appears.
- Add React Query hooks/mutations and query invalidation wiring for verified status and verification request workflows (user + admin).

**User-visible outcome:** Non-verified users can view Pro benefits and apply; expired users can renew (request admin review). Admins can see a verification request list with applicant names, get in-dashboard pending alerts, activate/extend Pro status, and Pro users show a blue verified badge and gain podcast submission access (until expiry).
