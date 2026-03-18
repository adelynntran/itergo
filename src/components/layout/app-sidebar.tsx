"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Cloud,
  Map,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Compass,
  Archive,
  Plane,
} from "lucide-react";

const navItems = [
  {
    label: "My Plans",
    href: "/dashboard",
    icon: Map,
  },
  {
    label: "Shared With Me",
    href: "/dashboard?filter=shared",
    icon: Users,
  },
  {
    label: "Locations Bin",
    href: "/locations-bin",
    icon: Archive,
  },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const currentMode = searchParams.get("mode") ?? "dream";

  const user = session?.user;
  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() ?? "?";

  const goToMode = (mode: "dream" | "execution" | "travel" | "momento") => {
    router.push(`/dashboard?mode=${mode}`);
  };

  return (
    <aside
      className={`paper-texture relative flex flex-col border-r border-border/80 bg-card/90 backdrop-blur transition-all duration-200 ${
        collapsed ? "w-16" : "w-72"
      }`}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-border/70 px-4">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15">
              <Compass className="h-5 w-5 text-primary" />
            </span>
            <div>
              <span className="font-display text-2xl leading-none text-foreground">itergo</span>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                journey weave
              </p>
            </div>
          </Link>
        )}
        {collapsed && (
          <Link href="/dashboard" className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-primary/15">
            <Compass className="h-5 w-5 text-primary" />
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 rounded-full text-muted-foreground hover:bg-accent ${collapsed ? "hidden" : ""}`}
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* Mode Toggle */}
      {!collapsed && (
        <div className="border-b border-border/70 px-3 py-3">
          <div className="rounded-2xl border border-border bg-background/75 p-2">
            <p className="mb-2 px-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Board Mode
            </p>
            <button
              onClick={() => goToMode("dream")}
              className={`flex w-full items-center justify-start rounded-xl px-3 py-2 text-sm font-medium ${
                currentMode === "dream"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground transition-colors hover:bg-accent/80 hover:text-foreground"
              }`}
            >
              <Cloud className="mr-1.5 inline h-3.5 w-3.5" />
              Dream
            </button>
            <button
              onClick={() => goToMode("execution")}
              className={`mt-1 flex w-full items-center justify-start rounded-xl px-3 py-2 text-sm font-medium ${
                currentMode === "execution"
                  ? "bg-[hsl(var(--slate))]/15 text-[hsl(var(--slate))]"
                  : "text-muted-foreground transition-colors hover:bg-accent/80 hover:text-foreground"
              }`}
            >
              <Sparkles className="mr-1.5 inline h-3.5 w-3.5" />
              Execution
            </button>
            <button
              onClick={() => goToMode("travel")}
              className={`mt-1 flex w-full items-center justify-start rounded-xl px-3 py-2 text-sm font-medium ${
                currentMode === "travel"
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground transition-colors hover:bg-accent/80 hover:text-foreground"
              }`}
            >
              <Plane className="mr-1.5 inline h-3.5 w-3.5" />
              Travel
            </button>
            <button
              onClick={() => goToMode("momento")}
              className={`mt-1 flex w-full items-center justify-start rounded-xl px-3 py-2 text-sm font-medium ${
                currentMode === "momento"
                  ? "bg-[hsl(var(--plum))]/15 text-[hsl(var(--plum))]"
                  : "text-muted-foreground transition-colors hover:bg-accent/80 hover:text-foreground"
              }`}
            >
              <Compass className="mr-1.5 inline h-3.5 w-3.5" />
              Momento
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-3">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href === "/dashboard" && pathname === "/dashboard") ||
            (item.href === "/locations-bin" && pathname === "/locations-bin");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/12 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              } ${collapsed ? "justify-center" : ""}`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Expand button when collapsed */}
      {collapsed && (
        <div className="px-2 py-2">
          <Button
            variant="ghost"
            size="icon"
            className="mx-auto flex h-8 w-8 rounded-full text-muted-foreground hover:bg-accent"
            onClick={() => setCollapsed(false)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* User menu */}
      <div className="border-t border-border/70 px-3 py-3">
        <DropdownMenu>
          <DropdownMenuTrigger
            className={`flex w-full items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-accent ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.image ?? undefined} />
              <AvatarFallback className="bg-primary/15 text-xs text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 text-left">
                <p className="truncate text-sm font-medium text-foreground">
                  {user?.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
              </div>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 border-border bg-popover">
            <DropdownMenuItem onClick={() => (window.location.href = "/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
