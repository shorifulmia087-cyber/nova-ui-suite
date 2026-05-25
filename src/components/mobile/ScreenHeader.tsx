import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { IconArrowBadgeLeft } from "@tabler/icons-react";
import { Heading } from "@/lib/typography";
import { type ReactNode } from "react";

function prettify(seg: string): string {
  return seg
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function looksLikeParam(seg: string): boolean {
  // numeric id, uuid, or long hex/slug-id
  return (
    /^\d+$/.test(seg) ||
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(seg) ||
    /^[0-9a-f]{16,}$/i.test(seg)
  );
}

function deriveFromPath(pathname: string): { title: string; param?: string } {
  const segments = pathname.split("/").filter(Boolean).map((s) => s.split("?")[0]);
  if (segments.length === 0) return { title: "Home" };

  const last = segments[segments.length - 1];
  // If the last segment looks like a dynamic param value, use the parent as title
  if (segments.length > 1 && looksLikeParam(last)) {
    return { title: prettify(segments[segments.length - 2]), param: last };
  }
  return { title: prettify(last) };
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
  const derived = deriveFromPath(pathname);
  const resolvedTitle = title ?? derived.title;
  const resolvedSubtitle = subtitle ?? derived.param;
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
        {resolvedSubtitle && <p className="text-body-secondary mt-0.5 truncate">{resolvedSubtitle}</p>}
      </div>

      {right}
    </header>
  );
}

export function PageTitle({ children }: { children: ReactNode }) {
  return <Heading variant="sectionTitle" case="sentence" className="mb-3 px-4">{children}</Heading>;
}

export function _Link() { return <Link to="/" />; }
