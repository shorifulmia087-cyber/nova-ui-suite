import { Outlet, Link, useRouterState, useNavigate, useRouter } from "@tanstack/react-router";
import { Home, Sprout, Gift, User } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

const tabs = [
  { to: "/", label: "Home", icon: Home },
  { to: "/farm", label: "Farm", icon: Sprout },
  { to: "/refer", label: "Refer", icon: Gift },
  { to: "/profile", label: "Profile", icon: User },
] as const;

const PUBLIC_ROUTES = new Set(["/login", "/signup"]);

export function MobileShell() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const activeIndex = Math.max(
    0,
    tabs.findIndex((t) => t.to === pathname),
  );
  const count = tabs.length;
  const isPublic = PUBLIC_ROUTES.has(pathname);
  const hideNav = isPublic || !user;

  useEffect(() => {
    if (loading) return;
    if (!user && !isPublic) {
      navigate({ to: "/login", replace: true });
    }
  }, [loading, user, isPublic, navigate]);

  if (loading && !isPublic) {
    return <div className="min-h-screen w-full bg-gradient-soft" />;
  }

  if (!user && !isPublic) {
    return <div className="min-h-screen w-full bg-gradient-soft" />;
  }


  return (
    <div className="min-h-screen w-full bg-gradient-soft flex justify-center">
      <div className="relative w-full max-w-md min-h-screen bg-background shadow-navy overflow-hidden flex flex-col">
        <main className={cn("flex-1", hideNav ? "pb-0" : "pb-28")}>
          <Outlet />
        </main>

        {!hideNav && (
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-4 pb-4 pt-2 z-50">
          <div className="relative rounded-full p-1.5 border border-white/20 dark:border-white/10 bg-white/55 dark:bg-white/5 backdrop-blur-2xl backdrop-saturate-150 shadow-[0_8px_30px_rgba(0,0,0,0.12)] overflow-hidden">
            <span className="pointer-events-none absolute inset-x-2 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />

            <span
              aria-hidden
              className="absolute top-1.5 bottom-1.5 rounded-full bg-gradient-brand shadow-glow will-change-transform"
              style={{
                width: `calc((100% - 0.75rem) / ${count})`,
                left: "0.375rem",
                transform: `translateX(calc(${activeIndex} * 100%))`,
                transition:
                  "transform 520ms cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            />

            <div className="relative flex items-center">
              {tabs.map(({ to, label, icon: Icon }, i) => {
                const active = i === activeIndex;
                return (
                  <Link
                    key={to}
                    to={to}
                    className={cn(
                      "relative flex-1 flex flex-col items-center justify-center gap-0.5 py-2 rounded-full select-none",
                      "transition-colors duration-300",
                      active
                        ? "text-primary-foreground"
                        : "text-muted-foreground active:text-foreground",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-[18px] w-[18px] transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
                        active ? "scale-110 -translate-y-0.5" : "scale-100",
                      )}
                      strokeWidth={active ? 2.4 : 2}
                    />
                    <span
                      className={cn(
                        "text-tab text-[14px] font-semibold leading-none transition-all duration-300",
                        active ? "opacity-100" : "opacity-70",
                      )}
                    >
                      {label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
        )}
      </div>
    </div>
  );
}
