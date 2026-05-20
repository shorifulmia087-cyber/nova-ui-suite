import { Outlet, Link, useRouterState } from "@tanstack/react-router";
import { Home, ListChecks, Sprout, Gift, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/", label: "Home", icon: Home },
  { to: "/tasks", label: "Tasks", icon: ListChecks },
  { to: "/farm", label: "Farm", icon: Sprout },
  { to: "/refer", label: "Refer", icon: Gift },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function MobileShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen w-full bg-gradient-soft flex justify-center">
      <div className="relative w-full max-w-md min-h-screen bg-background shadow-navy overflow-hidden flex flex-col">
        <main className="flex-1 pb-24 animate-fade-in">
          <Outlet />
        </main>

        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-4 pb-4 pt-2 z-50">
          <div className="rounded-full bg-card border border-border shadow-card px-2 py-2 flex items-center justify-between">
            {tabs.map(({ to, label, icon: Icon }) => {
              const active = pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    "relative flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-full transition-all duration-300",
                    active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {active && (
                    <span className="absolute inset-0 rounded-full bg-gradient-brand shadow-glow" />
                  )}
                  <Icon className={cn("relative h-5 w-5", active && "scale-110")} strokeWidth={active ? 2.4 : 2} />
                  <span className={cn("relative text-[10px] font-semibold tracking-wide", !active && "opacity-80")}>
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
