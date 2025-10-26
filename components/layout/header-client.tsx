"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { UserNav } from "./user-nav";
import { User } from "@supabase/supabase-js";
import { Profile } from "@/lib/supabase/database.types";

export function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUser(user);

        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        setProfile(data);
      }
    };

    fetchUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchUser();
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    // Listen for profile updates (custom event)
    const handleProfileUpdate = () => {
      fetchUser();
    };
    window.addEventListener('profile-updated', handleProfileUpdate);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('profile-updated', handleProfileUpdate);
    };
  }, []);

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
