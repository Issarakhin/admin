"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "@/app/lib/config/firebase";
import Sidebar from "@/app/components/Sidebar/Sidebar";
import AdminHeader from "@/app/components/Header/AdminHeader";

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (!user) {
        setIsAuthenticated(false);
        setIsReady(true);
        router.replace("/login");
        return;
      }

      setIsAuthenticated(true);
      setIsReady(true);
    });

    return () => unsubscribe();
  }, [router]);

  const currentSection = useMemo(() => {
    return pathname.split("/")[2] ?? "overview";
  }, [pathname]);
  const pageTitle = useMemo(() => {
    return currentSection
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  }, [currentSection]);

  if (!isReady || !isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-black">
      <div
        className={`fixed inset-y-0 left-0 z-50 md:relative md:z-auto transform ${
          isCollapsed ? "-translate-x-full" : "translate-x-0"
        } md:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
        <Sidebar currentSection={currentSection} isCollapsed={isCollapsed} />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader
          toggleSidebar={() => setIsCollapsed((prev) => !prev)}
          isCollapsed={isCollapsed}
          onSignOut={() => signOut(auth)}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 lg:p-8">
          <div className="container mx-auto">
            <div className="mb-8">
              <h1 style={{ fontSize: 25, fontWeight: 800, color: "#2c3e50" }}>
                {pageTitle}
              </h1>
              <p
                style={{ fontSize: 16, fontWeight: 400, color: "#bdbdbd" }}
              >
                Welcome to your admin dashboard.
              </p>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
