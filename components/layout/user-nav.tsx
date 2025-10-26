"use client";

import Link from "next/link";
import { User } from "@supabase/supabase-js";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/app/auth/actions";
import { Profile } from "@/lib/supabase/database.types";

interface UserNavProps {
  user: User;
  profile: Profile;
}

export function UserNav({ user, profile }: UserNavProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar>
            <AvatarImage
              src={profile.profile_image_url || undefined}
              alt={profile.full_name}
            />
            <AvatarFallback className="bg-teal text-white">
              {getInitials(profile.full_name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {profile.full_name}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/my">MY PAGE</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/my/bookings">나의 예약</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/rooms">회의실 예약</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/programs">프로그램</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <form action={logout}>
          <button
            type="submit"
            className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent focus:bg-accent focus:text-accent-foreground text-red-600"
          >
            로그아웃
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
