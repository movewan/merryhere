"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

function UnauthorizedToastContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const error = searchParams.get("error");

    if (error === "unauthorized") {
      toast({
        title: "접근 권한 없음",
        description: "관리자 페이지에 접근할 권한이 없습니다.",
        variant: "destructive",
      });

      // Remove error parameter from URL without page reload
      const url = new URL(window.location.href);
      url.searchParams.delete("error");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams, toast]);

  return null;
}

export function UnauthorizedToast() {
  return (
    <Suspense fallback={null}>
      <UnauthorizedToastContent />
    </Suspense>
  );
}
