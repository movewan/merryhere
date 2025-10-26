"use client";

import { usePathname } from "next/navigation";
import { Header } from "./header-client";

export function ConditionalHeader() {
  const pathname = usePathname();

  // Hide header on auth pages
  if (pathname?.startsWith("/auth")) {
    return null;
  }

  return <Header />;
}
