"use client";

import React from "react";
import { usePathname } from "next/navigation";
import DashboardShell from "@/app/components/DashboardShell";

export default function AppLayoutRouter({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();

  const isPublicRoute =
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/privacy") ||
    pathname.startsWith("/terms");

  if (!isPublicRoute) return <DashboardShell>{children}</DashboardShell>;

  return <>{children}</>;
}
