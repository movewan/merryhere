import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { UserNav } from "./user-nav";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 md:px-6 flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-teal">MERRY HERE</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link
            href="/spaces"
            className="transition-colors hover:text-teal text-foreground/60"
          >
            공간소개
          </Link>
          <Link
            href="/rooms"
            className="transition-colors hover:text-teal text-foreground/60"
          >
            회의실 예약
          </Link>
          <Link
            href="/programs"
            className="transition-colors hover:text-teal text-foreground/60"
          >
            프로그램
          </Link>
          {user && (
            <Link
              href="/my"
              className="transition-colors hover:text-teal text-foreground/60"
            >
              MY PAGE
            </Link>
          )}
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center gap-4">
          {user && profile ? (
            <UserNav user={user} profile={profile} />
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href="/auth/login">로그인</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/signup">회원가입</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
