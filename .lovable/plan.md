Add `techmobius.com` to the allowed email domains list for the email gate popup.

## Change
**`src/lib/email-gate.ts`** — Update `ALLOWED_EMAIL_DOMAINS`:
```ts
export const ALLOWED_EMAIL_DOMAINS = ["mobiusservices.com", "mobius365.com", "techmobius.com"];
```

That's the only change needed. The `EmailGate.tsx` popup and `validateEmail()` already read from this array, so the new domain will be accepted automatically.