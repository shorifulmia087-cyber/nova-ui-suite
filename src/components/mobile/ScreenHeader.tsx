import { Link, useRouter } from "@tanstack/react-router";
import { IconArrowBadgeLeft } from "@tabler/icons-react";
import { Heading } from "@/lib/typography";
import { type ReactNode } from "react";

export function ScreenHeader({
  title,
  subtitle,
  back = true,
  right,
}: {
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: ReactNode;
}) {
  const router = useRouter();
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
        <Heading variant="sectionTitle" case="sentence" className="truncate">{title}</Heading>
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
