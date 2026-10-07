import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FileText,
  Plus,
  LayoutTemplate,
  BarChart3,
  User,
  Settings,
  Menu,
  LogOut,
  Inbox,
  TrendingUp,
  ChevronDown,
  Moon,
  Sun,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/backend/client";
import { FormileMark } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";

type NavItem = { label: string; to: string; icon: typeof FileText; exact?: boolean };
type ExpandableSection = {
  id: "forms" | "templates" | "reports";
  label: string;
  icon: typeof FileText;
  pathPrefix: string;
  items: NavItem[];
};

const sections: ExpandableSection[] = [
  {
    id: "forms",
    label: "Forms",
    icon: FileText,
    pathPrefix: "/forms",
    items: [
      { label: "Create", to: "/forms/new", icon: Plus },
      { label: "Manage", to: "/forms", icon: FileText, exact: true },
    ],
  },
  {
    id: "templates",
    label: "Templates",
    icon: LayoutTemplate,
    pathPrefix: "/templates",
    items: [
      { label: "Create", to: "/templates/new", icon: Plus },
      { label: "All Templates", to: "/templates", icon: LayoutTemplate, exact: true },
    ],
  },
  {
    id: "reports",
    label: "Reports",
    icon: BarChart3,
    pathPrefix: "/reports",
    items: [
      { label: "Submissions", to: "/reports/submissions", icon: Inbox },
      { label: "Conversions", to: "/reports/conversions", icon: TrendingUp },
    ],
  },
];

function isPathActive(pathname: string, item: NavItem) {
  return item.exact
    ? pathname === item.to
    : pathname === item.to || pathname.startsWith(`${item.to}/`);
}

function NavLinks({ onNavigate }: { onNavigate?: (() => void) | undefined }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const routeSection = sections.find((section) => pathname.startsWith(section.pathPrefix))?.id;
  const [openSection, setOpenSection] = useState<ExpandableSection["id"] | null>(
    routeSection ?? null,
  );

  useEffect(() => {
    if (routeSection) setOpenSection(routeSection);
  }, [routeSection]);

  return (
    <nav aria-label="Main navigation" className="flex flex-col px-3 py-5">
      <p className="px-3 pb-2 text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-sidebar-foreground/40">
        Workspace
      </p>

      <Link
        to="/dashboard"
        onClick={onNavigate}
        className={cn(
          "group flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-semibold outline-none transition-[color,background-color,transform] duration-200 ease-out focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar active:scale-[0.985]",
          pathname === "/dashboard"
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/55 hover:text-sidebar-accent-foreground",
        )}
      >
        <LayoutDashboard
          className={cn(
            "h-4 w-4 shrink-0 transition-colors duration-200",
            pathname === "/dashboard"
              ? "text-sidebar-primary"
              : "text-sidebar-foreground/45 group-hover:text-sidebar-foreground/75",
          )}
        />
        <span>Dashboard</span>
      </Link>

      <div className="mt-1 space-y-1">
        {sections.map((section) => {
          const expanded = openSection === section.id;
          const sectionActive = pathname.startsWith(section.pathPrefix);
          const contentId = `sidebar-${section.id}`;

          return (
            <div key={section.id}>
              <Button
                type="button"
                variant="ghost"
                aria-expanded={expanded}
                aria-controls={contentId}
                onClick={() => setOpenSection(expanded ? null : section.id)}
                className={cn(
                  "group h-11 w-full justify-start rounded-md px-3 text-sm font-semibold text-sidebar-foreground/70 transition-[color,background-color,transform] duration-200 ease-out hover:bg-sidebar-accent/55 hover:text-sidebar-accent-foreground focus-visible:ring-sidebar-ring focus-visible:ring-offset-sidebar active:scale-[0.985]",
                  (expanded || sectionActive) &&
                    "bg-sidebar-accent/75 text-sidebar-accent-foreground hover:bg-sidebar-accent",
                )}
              >
                <section.icon
                  className={cn(
                    "mr-3 h-4 w-4 shrink-0 transition-colors duration-200",
                    sectionActive || expanded
                      ? "text-sidebar-primary"
                      : "text-sidebar-foreground/45 group-hover:text-sidebar-foreground/75",
                  )}
                />
                <span className="flex-1 text-left">{section.label}</span>
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 text-sidebar-foreground/40 transition-transform duration-300 ease-out",
                    expanded && "rotate-180 text-sidebar-foreground/75",
                  )}
                />
              </Button>

              <div
                id={contentId}
                className={cn(
                  "grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none",
                  expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                )}
              >
                <div className="overflow-hidden">
                  <div className="relative ml-5 mt-1 flex flex-col gap-0.5 border-l border-sidebar-border/80 pb-1 pl-3">
                    {section.items.map((item) => {
                      const active = isPathActive(pathname, item);
                      return (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={onNavigate}
                          tabIndex={expanded ? 0 : -1}
                          className={cn(
                            "group relative flex min-h-9 items-center gap-2.5 rounded-md px-3 text-[0.8125rem] font-medium outline-none transition-[color,background-color,transform] duration-200 ease-out focus-visible:ring-2 focus-visible:ring-sidebar-ring active:scale-[0.985]",
                            active
                              ? "bg-sidebar-accent/55 text-sidebar-accent-foreground"
                              : "text-sidebar-foreground/55 hover:bg-sidebar-accent/40 hover:text-sidebar-accent-foreground",
                          )}
                        >
                          <span
                            className={cn(
                              "absolute -left-[0.8125rem] h-4 w-0.5 rounded-full bg-sidebar-primary transition-[opacity,transform] duration-300 ease-out",
                              active ? "scale-y-100 opacity-100" : "scale-y-50 opacity-0",
                            )}
                          />
                          <item.icon
                            className={cn(
                              "h-3.5 w-3.5 shrink-0 transition-colors duration-200",
                              active
                                ? "text-sidebar-primary"
                                : "text-sidebar-foreground/35 group-hover:text-sidebar-foreground/65",
                            )}
                          />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-6 px-3 pb-2 text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-sidebar-foreground/40">
        Account
      </p>
      {[
        { label: "Profile", to: "/profile", icon: User },
        { label: "Settings", to: "/settings", icon: Settings },
      ].map((item) => {
        const active = pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "group flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-semibold outline-none transition-[color,background-color,transform] duration-200 ease-out focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar active:scale-[0.985]",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/55 hover:text-sidebar-accent-foreground",
            )}
          >
            <item.icon
              className={cn(
                "h-4 w-4 shrink-0 transition-colors duration-200",
                active
                  ? "text-sidebar-primary"
                  : "text-sidebar-foreground/45 group-hover:text-sidebar-foreground/75",
              )}
            />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarBody({ onNavigate }: { onNavigate?: (() => void) | undefined }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="flex h-full flex-col bg-sidebar">
      <div className="flex min-h-[4.5rem] items-center gap-3 border-b border-sidebar-border px-5 py-4">
        <FormileMark />
        <div className="min-w-0">
          <p className="font-display text-base font-bold leading-none text-sidebar-accent-foreground">
            Formile
          </p>
          <p className="mt-1 truncate text-[0.65rem] uppercase tracking-[0.16em] text-sidebar-foreground/45">
            Form Intelligence
          </p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <NavLinks onNavigate={onNavigate} />
      </div>
      <div className="border-t border-sidebar-border p-3">
        <Button
          type="button"
          variant="ghost"
          onClick={signOut}
          className="h-11 w-full justify-start rounded-md px-3 text-sm font-semibold text-sidebar-foreground/65 transition-[color,background-color,transform] duration-200 hover:bg-sidebar-accent/55 hover:text-sidebar-accent-foreground focus-visible:ring-sidebar-ring focus-visible:ring-offset-sidebar active:scale-[0.985]"
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sign out
        </Button>
      </div>
    </div>
  );
}

export function AppShell({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-screen lg:block">
        <SidebarBody />
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur-xl">
          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto]">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                overlayClassName="bg-ink/55 backdrop-blur-sm data-[state=open]:duration-300 data-[state=closed]:duration-200"
                className="w-[min(19rem,88vw)] border-sidebar-border bg-sidebar p-0 text-sidebar-foreground shadow-2xl data-[state=open]:duration-500 data-[state=closed]:duration-300 [&>button]:right-5 [&>button]:top-6 [&>button]:z-10 [&>button]:grid [&>button]:h-8 [&>button]:w-8 [&>button]:place-items-center [&>button]:rounded-md [&>button]:text-sidebar-foreground/55 [&>button]:ring-offset-sidebar [&>button]:transition-colors [&>button]:hover:bg-sidebar-accent [&>button]:hover:text-sidebar-accent-foreground"
              >
                <SheetTitle className="sr-only">Formile navigation</SheetTitle>
                <SidebarBody onNavigate={() => setOpen(false)} />
              </SheetContent>
            </Sheet>

            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold sm:text-xl">{title}</h1>
              {description ? (
                <p className="truncate text-xs text-muted-foreground sm:text-sm">{description}</p>
              ) : null}
            </div>

            {actions ? (
              <div className="col-span-3 flex flex-wrap items-center justify-end gap-2 lg:col-span-1">
                {actions}
                <Button variant="outline" size="icon" aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} onClick={toggleTheme}>
                  {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="icon" aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} onClick={toggleTheme}>
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </header>

        <main className="flex-1 px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
          <div className="page-enter mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: typeof FileText;
}) {
  return (
    <div className="surface-card group p-4 sm:p-5 hover:-translate-y-0.5 hover:shadow-lift">
      <div className="flex items-start justify-between gap-3">
        <p className="eyebrow">{label}</p>
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 font-display text-2xl font-bold sm:text-3xl">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="surface-card flex flex-col items-center gap-3 px-6 py-14 text-center">
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-accent-foreground">
        <FileText className="h-5 w-5" />
      </span>
      <h3 className="font-display text-base font-semibold">{title}</h3>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      {action}
    </div>
  );
}
