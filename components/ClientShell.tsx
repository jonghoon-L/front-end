"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";

export default function ClientShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <div className="client-shell-content flex-1 pt-0 -mt-px pb-12 md:pb-24 scroll-pt-20">
        {children}
      </div>
      <Footer />
    </>
  );
}
