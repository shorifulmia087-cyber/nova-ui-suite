import { Link, useRouter } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
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
    <header className="px-4 pt-6 pb-4 flex items-start gap-3">
      {back && (
        <button
          onClick={() => router.history.back()}
          className="h-10 w-10 rounded-full bg-card border border-border shadow-card flex items-center justify-center text-foreground hover:bg-muted transition"
          aria-label="Back"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}
      <div className="flex-1 min-w-0">
        <Heading variant="screenTitle" case="sentence" className="truncate">{title}</Heading>
        {subtitle && <p className="text-body-secondary mt-1">{subtitle}</p>}
      </div>

      {right}
    </header>
  );
}

export function PageTitle({ children }: { children: ReactNode }) {
  return <Heading variant="sectionTitle" case="sentence" className="mb-3 px-4">{children}</Heading>;
}

export function _Link() { return <Link to="/" />; }
