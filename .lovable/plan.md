## Plan

Add `mobius365.com` as an additional permitted domain for the email gate used when users access solutions or collaterals.

### Change

**File:** `src/lib/email-gate.ts`

Update the `ALLOWED_EMAIL_DOMAINS` array:

```ts
export const ALLOWED_EMAIL_DOMAINS = ["mobiusservices.com", "mobius365.com"];
```

### Effect

- Users with either `@mobiusservices.com` or `@mobius365.com` emails will pass validation in the EmailGate dialog.
- The dialog's placeholder and error message continue to reference the first domain (`mobiusservices.com`) as the primary example, which is the existing behavior. No other changes required.
