"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, Sparkles, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function FloatingButtons() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 md:bottom-8 md:right-8">
      {/* 서브 버튼들 */}
      <div
        className={cn(
          "mb-4 flex flex-col gap-3 transition-all duration-300",
          isOpen
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0"
        )}
      >
        {/* 프로그램 예약 */}
        <Button
          asChild
          size="lg"
          className="h-14 w-14 rounded-full bg-teal shadow-lg hover:bg-teal-600 hover:shadow-xl md:h-auto md:w-auto md:rounded-full md:px-6"
          title="프로그램 예약"
        >
          <Link href="/programs">
            <Sparkles className="h-5 w-5 md:mr-2" />
            <span className="hidden md:inline">프로그램 예약</span>
          </Link>
        </Button>

        {/* 회의실 예약 */}
        <Button
          asChild
          size="lg"
          className="h-14 w-14 rounded-full bg-teal shadow-lg hover:bg-teal-600 hover:shadow-xl md:h-auto md:w-auto md:rounded-full md:px-6"
          title="회의실 예약"
        >
          <Link href="/rooms">
            <Calendar className="h-5 w-5 md:mr-2" />
            <span className="hidden md:inline">회의실 예약</span>
          </Link>
        </Button>
      </div>

      {/* 메인 버튼 */}
      <Button
        size="lg"
        onClick={toggleMenu}
        className={cn(
          "h-16 w-16 rounded-full bg-teal shadow-lg transition-all hover:bg-teal-600 hover:shadow-xl",
          isOpen && "rotate-45"
        )}
        title={isOpen ? "닫기" : "빠른 예약"}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Plus className="h-6 w-6" />
        )}
      </Button>
    </div>
  );
}
