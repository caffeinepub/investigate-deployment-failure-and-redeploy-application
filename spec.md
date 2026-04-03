# INDIE TAMIL MUSIC PRODUCTION — Premium User Role & Extra Song Submission Fields

## Current State

- Backend has `grantPremiumRole` and `revokePremiumRole` functions, but they only flip `isVerified` on ArtistProfile records — there is no dedicated premium users store
- No `isCallerPremium()` or `getAllPremiumUsers()` functions exist
- `SongSubmission` and `SongSubmissionInput` types have no premium-specific fields
- `SongSubmissionAdmin` has no premium-specific fields
- `AdminUsersPanel` already has Grant/Revoke Premium buttons wired to the existing backend functions
- `SongSubmissionForm` has no conditional premium fields
- Admin Song Submission panel does not show premium fields when reviewing a submission

## Requested Changes (Diff)

### Add
- `premiumUsers` stable map in `main.mo` to track premium status separately from `isVerified`
- `isCallerPremium()` query function — returns true if calling user is in premiumUsers map
- `getAllPremiumUsers()` admin-only query — returns all premium user principals
- Optional premium fields to `SongSubmission` type: `customCLine`, `customPLine`, `premiumLabel`, `contentType`, `sunoTrackLink`, `sunoAgreementFile`, `sunoAgreementFilename`, `licenceFile`, `licenceFilename`, `contentId`, `callerTuneStartSecond`
- Same optional fields to `SongSubmissionInput` type
- Same optional fields to `SongSubmissionAdmin` type
- Premium section in `SongSubmissionForm` — shown only when `isCallerPremium` is true
- Content Type conditional sub-fields (Suno Track Link + PDF upload for AI Generated; Licence PDF for Licensed Content)
- Premium fields display in admin Song Submission review panel (show "Not provided" if null)
- `isCallerPremium` and `getAllPremiumUsers` declared in `backend.did.d.ts` and `backend.did.js`
- `isCallerPremium` hook in `useQueries.ts`

### Modify
- `grantPremiumRole` in `main.mo` — also add user to `premiumUsers` map (keep existing isVerified logic)
- `revokePremiumRole` in `main.mo` — also remove user from `premiumUsers` map (keep existing isVerified logic)
- `submitSong` in `main.mo` — pass premium fields from input to stored submission
- `editSongSubmission` in `main.mo` — preserve premium fields on edit
- `adminUpdateSubmission`, `adminSetSubmissionLive`, `adminEditSubmission` — preserve premium fields
- `getAllSubmissionsWithStatsForAdmin` — include premium fields in returned `SongSubmissionAdmin`
- `SongSubmission` and `SongSubmissionInput` types in `backend.did.d.ts` and `backend.did.js` — add premium fields
- `backend.ts` — add `isCallerPremium()` and `getAllPremiumUsers()` methods

### Remove
- Nothing removed

## Implementation Plan

1. Add `premiumUsers` stable map to `main.mo`
2. Add `isCallerPremium()` and `getAllPremiumUsers()` to `main.mo`
3. Update `grantPremiumRole` and `revokePremiumRole` to also write to `premiumUsers`
4. Add optional premium fields to `SongSubmission`, `SongSubmissionInput`, `SongSubmissionAdmin` types in `main.mo`
5. Update `submitSong`, `editSongSubmission`, `adminUpdateSubmission`, `adminSetSubmissionLive`, `adminEditSubmission` to pass through premium fields
6. Update `getAllSubmissionsWithStatsForAdmin` to include premium fields
7. Update `backend.did.d.ts` — add `isCallerPremium`, `getAllPremiumUsers`, premium fields to SongSubmission types
8. Update `backend.did.js` — add IDL declarations for new functions and premium fields
9. Update `backend.ts` — add `isCallerPremium()` and `getAllPremiumUsers()` methods
10. Add `useIsCallerPremium` hook to `useQueries.ts`
11. Update `SongSubmissionForm` to show premium section conditionally
12. Update admin Song Submission review panel to display premium fields
