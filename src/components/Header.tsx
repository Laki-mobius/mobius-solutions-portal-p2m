import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, Menu, X, LogOut } from "lucide-react";
import { clearStoredEmail, getStoredEmail } from "@/lib/email-gate";
import { toast } from "sonner";

const links = [
  { to: "/", label: "Home" },
  { to: "/solutions", label: "Solutions" },
  { to: "/collaterals", label: "Collaterals" },
];

export const Header = () => {
  const [email, setEmail] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setEmail(getStoredEmail());
    setOpen(false);
  }, [location.pathname]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  const switchEmail = () => {
    clearStoredEmail();
    setEmail(null);
    toast.success("Email cleared. You'll be asked again on the next click.");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between gap-4">
        <div className="shrink-0" />

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <form onSubmit={onSearch} className="hidden md:block">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search…"
                className="h-9 w-56 rounded-lg border border-input bg-secondary/60 pl-9 pr-3 text-sm outline-none ring-ring transition focus:bg-background focus:ring-2"
              />
            </div>
          </form>

          {email && (
            <Button
              size="sm"
              variant="ghost"
              onClick={switchEmail}
              className="hidden md:inline-flex"
              title={email}
            >
              <LogOut className="mr-1.5 h-3.5 w-3.5" />
              <span className="max-w-[140px] truncate">{email}</span>
            </Button>
          )}

          <Button
            size="icon"
            variant="ghost"
            className="md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="container space-y-2 py-4">
            <form onSubmit={onSearch}>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search…"
                  className="h-10 w-full rounded-lg border border-input bg-secondary/60 pl-9 pr-3 text-sm outline-none focus:bg-background"
                />
              </div>
            </form>
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) =>
                  `block rounded-lg px-3 py-2 text-sm font-medium ${
                    isActive ? "bg-secondary" : "text-muted-foreground"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
            {email && (
              <button
                onClick={switchEmail}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground"
              >
                <LogOut className="h-4 w-4" /> Switch email ({email})
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
