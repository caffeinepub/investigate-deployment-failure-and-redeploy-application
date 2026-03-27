# INDIE TAMIL MUSIC PRODUCTION

## Current State
The platform has a `UserRevenuePanel` showing approved/live song revenues set by admin. `AdminRevenueManagement` lets admin set revenue per song. Backend has `setSongRevenue`, `getSongRevenue`, `getAllSongRevenues` in `main.mo` and declared in Candid files. No withdrawal system exists yet.

## Requested Changes (Diff)

### Add
- `WithdrawRequest` type in `main.mo` with fields: id, submitter, fullName, googlePayAccountName, upiId, message, amount, qrCodeBlob, qrCodeFilename, status (pending/approved/rejected), rejectionReason, timestamp
- `WithdrawStatus` variant type: `#pending`, `#approved`, `#rejected`
- Backend functions: `submitWithdrawRequest`, `getMyWithdrawRequests`, `getAllWithdrawRequestsForAdmin`, `approveWithdrawRequest`, `rejectWithdrawRequest`
- `withdrawRequests` stable map in `main.mo`
- On approval: deduct amount from user's available revenue (tracked per principal in a `withdrawnAmounts` map)
- All new types and functions declared in `backend.did.d.ts` and `backend.did.js`
- New `UserWithdrawalPanel` component (user side): Withdraw Revenue button/form under My Revenue section
- New `AdminWithdrawalRequestsManagement` component (admin side): Withdrawal Requests tab
- Wire both components into `UserDashboard.tsx` and `AdminDashboard.tsx`

### Modify
- `UserRevenuePanel.tsx`: Add "Withdraw Revenue" button that opens withdrawal form; show available balance (total revenue minus withdrawn); show past withdrawal requests with status
- `AdminDashboard.tsx`: Add Withdrawal Requests tab with new component
- `UserDashboard.tsx`: Already has revenue tab; the withdrawal section will be embedded within UserRevenuePanel
- `backend.did.d.ts` and `backend.did.js`: Add new types and function declarations
- `backend.ts`: Add new method bindings

### Remove
- Nothing removed

## Implementation Plan
1. Add `WithdrawStatus`, `WithdrawRequest`, `WithdrawRequestInput` types to `main.mo`
2. Add `withdrawRequests` map and `withdrawnAmounts` map (stable) to actor state
3. Add 5 new backend functions to `main.mo`
4. Add types and function declarations to `backend.did.d.ts`
5. Add IDL declarations to `backend.did.js`
6. Add method bindings to `backend.ts`
7. Update `UserRevenuePanel.tsx` with withdrawal form and request history
8. Create `AdminWithdrawalRequestsManagement.tsx`
9. Add Withdrawal Requests tab to `AdminDashboard.tsx`
