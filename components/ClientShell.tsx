"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import HashScrollHandler from "./HashScrollHandler";

export default function ClientShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  useEffect(() => {
    if (pathname === "/") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [pathname]);

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <HashScrollHandler />
      <Header />
      <div
        key={pathname}
        className={`client-shell-content flex-1 pt-0 -mt-px scroll-pt-20 animate-[page-fade-in_0.5s_ease-out] ${pathname === "/" ? "pb-0" : "pb-12 md:pb-24"}`}
      >
        {children}
      </div>
      <Footer />
    </>
  );
}
