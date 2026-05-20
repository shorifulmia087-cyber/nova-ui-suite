import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { MobileShell } from "@/components/mobile/MobileShell";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-display">404</h1>
        <p className="text-body-secondary mt-2">This page doesn't exist.</p>
        <Link
          to="/"
          className="text-button mt-6 inline-flex items-center justify-center rounded-md bg-gradient-brand px-5 py-3 text-primary-foreground shadow-glow"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-section-title">Something went wrong</h1>
        <p className="text-body-secondary mt-2">{error.message}</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="text-button mt-6 rounded-md bg-gradient-brand px-5 py-3 text-primary-foreground shadow-glow"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "Ness — Premium Earning App" },
      { name: "description", content: "Ness is a premium fintech earning app. Grow your money with farms, tasks, and rewards." },
      { name: "theme-color", content: "#FFFFFF" },
      { property: "og:title", content: "Ness — Premium Earning App" },
      { property: "og:description", content: "Grow your money with farms, tasks, and rewards." },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <MobileShell />
    </QueryClientProvider>
  );
}
