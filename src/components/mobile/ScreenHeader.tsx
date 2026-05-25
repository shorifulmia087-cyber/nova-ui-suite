import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { Heading } from "@/lib/typography";
import { type ReactNode } from "react";
import { getRouteTitle } from "@/lib/route-titles";

export function ScreenHeader({
  title,
  back = true,
  right,
}: {
  title?: string;
  back?: boolean;
  right?: ReactNode;
}) {
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const resolvedTitle = title ?? getRouteTitle(pathname);

  return (
    <header className="bg-card px-4 pt-3 pb-3 flex items-center gap-3">
      {back && (
        <button
          onClick={() => router.history.back()}
          className="h-9 w-9 rounded-pill bg-background flex items-center justify-center text-foreground hover:opacity-80 transition shrink-0"
          aria-label="Back"
        >
          <ChevronLeft className="h-6 w-6" strokeWidth={2} />
        </button>
      )}
      <div className="flex-1 min-w-0">
        <Heading variant="sectionTitle" case="sentence" className="truncate">{resolvedTitle}</Heading>
      </div>

      {right}
    </header>
  );
}

export function PageTitle({ children }: { children: ReactNode }) {
  return <Heading variant="sectionTitle" case="sentence" className="mb-3 px-4">{children}</Heading>;
}

export function _Link() { return <Link to="/" />; }
