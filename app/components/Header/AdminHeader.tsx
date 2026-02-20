"use client";

import React, { useEffect, useState } from "react";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Search,
  Settings,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { doc, getDoc, updateDoc, DocumentData } from "@firebase/firestore";
import { auth, db } from "@/app/lib/config/firebase";
import SignOutModal from "@/app/components/ui/signoutmodal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import ProfileAdminModal from "@/app/components/Dashboard/ProfileAdminModal";
import DashboardAlertModal from "@/app/components/Dashboard/DashboardAlertModal";
import { AdminData } from "@/app/components/Dashboard/types";

interface AdminHeaderProps {
  toggleSidebar: () => void;
  isCollapsed: boolean;
  onSignOut: () => void;
}

const AdminHeader = ({ toggleSidebar, isCollapsed, onSignOut }: AdminHeaderProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  useEffect(() => {
    const fetchAdminProfile = async () => {
      if (!auth.currentUser) return;
      try {
        const adminDocRef = doc(db, "adminInfo", auth.currentUser.uid);
        const adminDocSnap = await getDoc(adminDocRef);
        if (adminDocSnap.exists()) {
          setAdminData(adminDocSnap.data() as AdminData);
        }
      } catch (error) {
        console.error("Error fetching admin profile:", error);
      }
    };
    fetchAdminProfile();
  }, []);

  const saveAdminProfile = async (data: AdminData) => {
    if (!auth.currentUser) return;
    try {
      const adminDocRef = doc(db, "adminInfo", auth.currentUser.uid);
      await updateDoc(adminDocRef, data as Partial<AdminData> & DocumentData);
      setAdminData(data);
      setAlertMessage("Profile updated successfully!");
      setIsSuccess(true);
    } catch (error) {
      console.error("Error updating admin profile:", error);
      setAlertMessage("Failed to update profile.");
      setIsSuccess(false);
    }
    setIsAlertModalOpen(true);
    setIsProfileModalOpen(false);
  };

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await onSignOut();
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsLoading(false);
      setIsSignOutModalOpen(false);
    }
  };

  return (
    <header style={{ paddingLeft: 20, paddingRight: 20 }} className="flex justify-between items-center p-2 bg-white dark:bg-gray-900 text-black dark:text-white border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
      <div className="flex items-center space-x-4">
        <button onClick={toggleSidebar} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors md:hidden">
          {isCollapsed ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
        </button>
        <div className="relative hidden md:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            style={{ fontSize: 15, borderRadius: 15 }}
            className="pl-10 pr-4 py-2 w-72 bg-gray-100 dark:bg-gray-800 border-transparent focus:outline-none focus:ring-2 focus:ring-[#2c3e50] transition"
          />
        </div>
      </div>
      <div className="flex items-center space-x-4 sm:space-x-6">
        <button className="hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-full transition-colors relative">
          <Bell className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          <span className="absolute w-6 h-6 bg-red-500 rounded-full border-2 border-white dark:border-gray-900" style={{ marginTop: -33, fontSize: 14, color: "#fff", textAlign: "center", alignItems: "center" }}>0</span>
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none rounded-full">
            <div className="flex items-center space-x-3 cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                {adminData?.profileImage ? (
                  <Image src={adminData.profileImage} alt="Admin" width={40} height={40} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                )}
              </div>
              <div className="hidden md:block">
                <p className="font-semibold text-sm">{adminData?.username || "Admin"}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{adminData?.role || "Administrator"}</p>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 mt-2" style={{ borderRadius: 15 }}>
            <DropdownMenuItem className="cursor-pointer hover:bg-[#F87E38] hover:text-[#fff]" onClick={() => setIsProfileModalOpen(true)} style={{ paddingLeft: 15, paddingRight: 15, borderRadius: 12 }}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer hover:bg-[#F87E38] hover:text-[#fff]" style={{ paddingLeft: 15, paddingRight: 15, borderRadius: 12 }}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
            <DropdownMenuItem className="cursor-pointer text-[#FB4455] focus:text-[#FB4455] hover:bg-[#FB4455] hover:text-[#fff]" onClick={() => setIsSignOutModalOpen(true)} style={{ paddingLeft: 15, paddingRight: 15, borderRadius: 12 }}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>{isLoading ? "Signing out..." : "Sign out"}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ProfileAdminModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        adminData={adminData}
        onSave={saveAdminProfile}
      />
      <DashboardAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        message={alertMessage}
        isSuccess={isSuccess}
      />
      <SignOutModal
        isOpen={isSignOutModalOpen}
        onClose={() => setIsSignOutModalOpen(false)}
        onConfirm={handleSignOut}
      />
    </header>
  );
};

export default AdminHeader;
