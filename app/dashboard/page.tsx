"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import AdminDashboard from "@/app/components/Dashboard/AdminDashboard";
import { auth } from "@/app/lib/config/firebase";

export default function DashboardPage() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

  if (!isReady || !isAuthenticated) {
    return null;
  }

  return <AdminDashboard onSignOut={() => signOut(auth)} />;
}
