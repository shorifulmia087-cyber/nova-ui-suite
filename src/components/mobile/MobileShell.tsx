import { Outlet, Link, useRouterState, useNavigate, useRouter } from "@tanstack/react-router";
import { IconHome, IconPlant2, IconGift, IconUser } from "@tabler/icons-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

const tabs = [
  { to: "/", label: "Home", icon: IconHome },
  { to: "/farm", label: "Farm", icon: IconPlant2 },
  { to: "/refer", label: "Refer", icon: IconGift },
  { to: "/profile", label: "Profile", icon: IconUser },
] as const;

const PUBLIC_ROUTES = new Set(["/login", "/signup"]);

export function MobileShell() {
  const navigate = useNavigate();
  const router = useRouter();
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

  // Preload all main route chunks in the background once authenticated.
  // This avoids a blank flash and browser progress bar when tapping tabs,
  // since the JS chunks are already in memory before navigation.
  useEffect(() => {
    if (!user) return;
    const idle = (cb: () => void) =>
      typeof window !== "undefined" && "requestIdleCallback" in window
        ? (window as any).requestIdleCallback(cb)
        : setTimeout(cb, 200);
    idle(() => {
      ["/", "/farm", "/refer", "/profile", "/tasks", "/withdraw", "/deposit", "/notifications", "/verify", "/transactions"].forEach((to) => {
        router.preloadRoute({ to }).catch(() => {});
      });
    });
  }, [user, router]);


  if (loading && !isPublic) {
    return <div className="min-h-screen w-full bg-gradient-soft" />;
  }

  if (!user && !isPublic) {
    return <div className="min-h-screen w-full bg-gradient-soft" />;
  }


  return (
    <div className="min-h-screen w-full flex justify-center" style={{ backgroundColor: "#f8f8f8" }}>
      <div className="relative w-full max-w-md min-h-screen overflow-hidden flex flex-col" style={{ backgroundColor: "#f8f8f8" }}>

        <main className={cn("flex-1", hideNav ? "pb-0" : "pb-28")}>
          <Outlet />
        </main>

        {!hideNav && (
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-4 pb-4 pt-2 z-50">
          <div className="relative rounded-full p-1.5 border border-white/30 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-2xl backdrop-saturate-150 shadow-[0_10px_36px_-10px_rgba(15,23,42,0.25)] overflow-hidden">
            <span className="pointer-events-none absolute inset-x-2 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />

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
                      "relative flex-1 flex flex-col items-center justify-center gap-1 py-2.5 rounded-full select-none",
                      "transition-colors duration-300",
                      active
                        ? "text-primary-foreground"
                        : "text-muted-foreground active:text-foreground",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-[20px] w-[20px] transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
                        active ? "scale-110 -translate-y-0.5" : "scale-100",
                      )}
                      stroke={active ? 2.2 : 1.75}
                    />
                    <span
                      className={cn(
                        "text-tab leading-none transition-all duration-300",
                        active ? "opacity-100" : "opacity-80",
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
