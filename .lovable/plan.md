## Two changes

### 1. Allow `mobius635.com` in the email gate

Update `src/lib/email-gate.ts` so `ALLOWED_EMAIL_DOMAINS = ["mobiusservices.com", "mobius365.com"]`. The error message will mention both. Trivial, no backend change.

