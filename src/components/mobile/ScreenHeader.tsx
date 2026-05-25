import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { IconArrowBadgeLeft } from "@tabler/icons-react";
import { Heading } from "@/lib/typography";
import { type ReactNode } from "react";

function titleFromPath(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return "Home";
  const last = segments[segments.length - 1].split("?")[0];
  return last
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function ScreenHeader({
  title,
  subtitle,
  back = true,
  right,
}: {
  title?: string;
  subtitle?: string;
  back?: boolean;
  right?: ReactNode;
}) {
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const resolvedTitle = title ?? titleFromPath(pathname);
  return (
    <header className="bg-card px-4 pt-4 pb-4 flex items-center gap-3">
      {back && (
        <button
          onClick={() => router.history.back()}
          className="h-10 w-10 rounded-full bg-background flex items-center justify-center text-foreground hover:opacity-80 transition shrink-0"
          aria-label="Back"
        >
          <IconArrowBadgeLeft size={20} stroke={2} />
        </button>
      )}
      <div className="flex-1 min-w-0">
        <Heading variant="sectionTitle" case="sentence" className="truncate">{resolvedTitle}</Heading>
        {subtitle && <p className="text-body-secondary mt-0.5 truncate">{subtitle}</p>}
      </div>

      {right}
    </header>
  );
}

export function PageTitle({ children }: { children: ReactNode }) {
  return <Heading variant="sectionTitle" case="sentence" className="mb-3 px-4">{children}</Heading>;
}

export function _Link() { return <Link to="/" />; }
