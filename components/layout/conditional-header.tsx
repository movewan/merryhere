"use client";

import { usePathname } from "next/navigation";
import { Header } from "./header-client";

export function ConditionalHeader() {
  const pathname = usePathname();

  // Hide header on auth pages and admin pages
  if (pathname?.startsWith("/auth") || pathname?.startsWith("/admin")) {
    return null;
  }

  return <Header />;
}
