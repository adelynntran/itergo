"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Map,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Archive,
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
  const { data: session } = useSession();

  const user = session?.user;
  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() ?? "?";

  return (
    <aside
      className={`flex flex-col border-r border-dashed border-paper-kraft bg-paper transition-all duration-200 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-dashed border-paper-kraft px-4">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-xl">📒</span>
            <span className="font-handwriting text-2xl text-ink">itergo</span>
          </Link>
        )}
        {collapsed && (
          <Link href="/dashboard" className="mx-auto">
            <span className="text-xl">📒</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 text-ink-light hover:bg-paper-aged hover:text-ink ${collapsed ? "hidden" : ""}`}
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

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
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-paper-aged text-ink"
                  : "text-ink-medium hover:bg-paper-aged/50 hover:text-ink"
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
            className="mx-auto flex h-8 w-8 text-ink-light hover:bg-paper-aged"
            onClick={() => setCollapsed(false)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* User menu */}
      <div className="border-t border-dashed border-paper-kraft px-3 py-3">
        <DropdownMenu>
          <DropdownMenuTrigger
            className={`flex w-full items-center gap-3 rounded-lg px-2 py-2 hover:bg-paper-aged/50 ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.image ?? undefined} />
              <AvatarFallback className="bg-tape-peach text-xs text-ink">
                {initials}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 text-left">
                <p className="truncate text-sm font-medium text-ink">
                  {user?.name}
                </p>
                <p className="truncate text-xs text-ink-light">{user?.email}</p>
              </div>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
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
