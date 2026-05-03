import { createContext, useCallback, useContext, useState, ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  ALLOWED_EMAIL_DOMAINS,
  getStoredEmail,
  setStoredEmail,
  validateEmail,
} from "@/lib/email-gate";
import { recordSession } from "@/lib/tracking";
import { Lock, Mail } from "lucide-react";

type GateContextValue = {
  /** Ensures we have a stored email; resolves to the email string. Rejects on cancel. */
  requireEmail: () => Promise<string>;
};

const GateContext = createContext<GateContextValue | null>(null);

export const useEmailGate = () => {
  const ctx = useContext(GateContext);
  if (!ctx) throw new Error("useEmailGate must be used inside <EmailGateProvider>");
  return ctx;
};

export const EmailGateProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [resolver, setResolver] = useState<{
    resolve: (e: string) => void;
    reject: () => void;
  } | null>(null);

  const requireEmail = useCallback(async () => {
    const stored = getStoredEmail();
    if (stored) return stored;
    return new Promise<string>((resolve, reject) => {
      setEmail("");
      setError(null);
      setResolver({ resolve, reject });
      setOpen(true);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateEmail(email);
    if (!result.valid) {
      setError(result.error ?? "Invalid email");
      return;
    }
    const clean = email.trim().toLowerCase();
    setStoredEmail(clean);
    await recordSession(clean);
    resolver?.resolve(clean);
    setResolver(null);
    setOpen(false);
  };

  const handleClose = (next: boolean) => {
    if (!next && resolver) {
      resolver.reject();
      setResolver(null);
    }
    setOpen(next);
  };

  return (
    <GateContext.Provider value={{ requireEmail }}>
      {children}
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-brand shadow-glow">
              <Lock className="h-5 w-5 text-primary-foreground" />
            </div>
            <DialogTitle className="text-center font-display text-2xl">
              Verify your email
            </DialogTitle>
            <DialogDescription className="text-center">
              Enter your official Mobius email to access this resource. We use this only to track
              engagement.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gate-email">Work email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="gate-email"
                  type="email"
                  autoFocus
                  placeholder={`name@${ALLOWED_EMAIL_DOMAINS[0]}`}
                  className="pl-9"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full bg-gradient-brand">
                Continue
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </GateContext.Provider>
  );
};
