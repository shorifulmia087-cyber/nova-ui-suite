// Centralized map of route pathname → header title.
// Add a new entry here whenever a sub-page uses <ScreenHeader />.
// ScreenHeader reads from this map first, then falls back to a
// pathname-derived title.

export const ROUTE_TITLES: Record<string, string> = {
  "/": "Home",
  "/deposit": "Deposit",
  "/withdraw": "Withdraw",
  "/transactions": "Transactions",
  "/notifications": "Notifications",
  "/profile": "Profile",
  "/refer": "Refer & Earn",
  "/tasks": "Tasks",
  "/farm": "Farm",
  "/verify": "Verification",
  "/target-bonus": "Target Bonus",
  "/video-income": "Video Income",
  "/admin/tasks": "Admin · Tasks",
  "/login": "Log In",
  "/signup": "Sign Up",
};

function prettify(seg: string): string {
  return seg
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function getRouteTitle(pathname: string): string {
  if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname];
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return "Home";
  return prettify(segments[segments.length - 1].split("?")[0]);
}
