"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  FileText,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Pen,
  Search,
  Settings,
  User,
  UserRound,
  Users,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { doc, getDoc, updateDoc, DocumentData } from "@firebase/firestore";
import { db } from "@/lib/config/firebase";
import DGLOGO from "@/app/assets/png/LOGO-DG-Next-havebackground.png";
import SignOutModal from "@/components/ui/signoutmodal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ProfileAdminModal from "@/components/ProfileAdminModal";
import DashboardAlertModal from "@/components/DashboardAlertModal";
import { AdminData } from "@/components/dashboard-types";

interface MenuItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path?: string;
  subItems?: { id: string; label: string; path?: string }[];
}

interface SidebarProps {
  currentSection: string;
  isCollapsed: boolean;
}

interface AdminHeaderProps {
  toggleSidebar: () => void;
  isCollapsed: boolean;
  onSignOut: () => Promise<void>;
}

const ADMIN_PROFILE_DOC_ID = process.env.NEXT_PUBLIC_ADMIN_PROFILE_DOC_ID || "default-admin";

const submenuVariants = {
  hidden: { opacity: 0, height: 0, overflow: "hidden" },
  visible: { opacity: 1, height: "auto", transition: { duration: 0.3 } },
};

const menuItems: MenuItem[] = [
  { id: "overview", icon: LayoutDashboard, label: "Overview", path: "/overview" },
  {
    id: "courses",
    icon: BookOpen,
    label: "Courses",
    subItems: [
      { id: "course-list", label: "Course List", path: "/course/course-list" },
      { id: "add-course", label: "Upload Course", path: "/course/add-course" },
      { id: "add-course-categories", label: "Upload Course Categories", path: "/course/add-course-categories" },
    ],
  },
  { id: "trainers", icon: UserRound, label: "Trainers", subItems: [{ id: "list-trainers", label: "List Trainers", path: "/trainers/list-trainers" }, { id: "add-trainer", label: "Add Trainer", path: "/trainers/add-trainer" }] },
  { id: "list-certificates", icon: FileText, label: "Certificates", path: "/certificates/list-certificates" },
  { id: "students", icon: Users, label: "Students", subItems: [{ id: "list-student", label: "List Students", path: "/students/list-student" }, { id: "student-enroll-recorded", label: "Enrollments", path: "/students/student-enroll-recorded" }] },
  { id: "blogposts", icon: Pen, label: "Blog Posts", subItems: [{ id: "add-blogpost", label: "Upload Post", path: "/blogposts/add-blogpost" }, { id: "list-blogpost", label: "List Posts", path: "/blogposts/list-blogpost" }] },
  { id: "events", icon: Calendar, label: "Events", subItems: [{ id: "list-events", label: "List Events", path: "/events/list-events" }, { id: "add-event", label: "Add Event", path: "/events/add-event" }] },
  { id: "notifications", icon: Bell, label: "Notifications", subItems: [{ id: "list-notification", label: "List Notifications", path: "/notifications/list-notification" }, { id: "add-push-notification", label: "Add Push Notification", path: "/notifications/add-push-notification" }] },
  { id: "discounts", icon: Megaphone, label: "Marketing", path: "/marketing/discounts" },
  { id: "course-sales", icon: DollarSign, label: "Payments", path: "/payment/course-sales" },
  { id: "support-tickets", icon: HelpCircle, label: "Support", path: "/support/support-tickets" },
];

const Sidebar = ({ currentSection, isCollapsed }: SidebarProps) => {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    courses: true,
  });
  const currentYear = new Date().getFullYear();

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <aside
      className={`relative h-full border-r border-[#0f2740] shadow-[0_20px_45px_rgba(8,22,38,0.35)] transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-20" : "w-72"
      } flex flex-col overflow-hidden bg-gradient-to-b from-[#0f2438] via-[#14314a] to-[#0f2438]`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-50">
        <div className="absolute -left-16 top-20 h-44 w-44 rounded-full bg-[#2eaadc]/20 blur-3xl" />
        <div className="absolute -right-16 bottom-14 h-52 w-52 rounded-full bg-[#f78c45]/15 blur-3xl" />
      </div>

      <div
        className="relative z-10 flex items-center justify-between px-5"
        style={{ paddingTop: 14, paddingBottom: 14, borderBottomWidth: 1, borderColor: "#2c4863" }}
      >
        <Link href="/overview" passHref>
          <div className={`flex items-center space-x-3 ${isCollapsed ? "justify-center w-full" : ""}`}>
            <Image src={DGLOGO} width={40} height={40} alt="DGLOGO" style={{ borderRadius: 10 }} />
            {!isCollapsed && (
              <span className="text-[#fff]" style={{ fontSize: 16, fontWeight: 700, color: "#fff", letterSpacing: 0.4 }}>
                Admin Dashboard
              </span>
            )}
          </div>
        </Link>
      </div>

      <nav className="sidebar-scroll relative z-10 flex-1 py-4 overflow-y-auto">
        {!isCollapsed && (
          <p className="px-5 pb-2 text-[11px] uppercase tracking-[0.18em] text-[#9bb4cc]">
            Navigation
          </p>
        )}
        {menuItems.map((item) => {
          const hasActiveSubItem =
            item.subItems?.some((subItem) => subItem.id === currentSection) ??
            false;
          const isActiveItem = item.id === currentSection || hasActiveSubItem;

          return (
            <div key={item.id} className="px-3">
              {item.subItems ? (
                <button
                  onClick={() => toggleExpand(item.id)}
                  style={{ fontSize: 14, fontWeight: 600, borderRadius: 12, color: "#fff" }}
                  className={`w-full border flex items-center justify-between px-4 py-2.5 my-1.5 transition-all duration-200 ${
                    isActiveItem
                      ? "bg-gradient-to-r from-[#ff9d58] to-[#f87e38] border-[#ffb07a] shadow-md shadow-orange-400/25 text-white"
                      : "border-transparent text-[#e6edf5] hover:bg-white/10 hover:border-[#ffffff1f] hover:text-white"
                  } ${isCollapsed ? "justify-center" : ""}`}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="w-5 h-5" />
                    {!isCollapsed && <span>{item.label}</span>}
                  </div>
                  {!isCollapsed && (
                    <ChevronDown className={`w-5 h-5 transition-transform ${expandedItems[item.id] ? "rotate-180" : ""}`} />
                  )}
                </button>
              ) : (
                <Link
                  href={item.path ?? `/${item.id}`}
                  style={{ fontSize: 14, fontWeight: 600, borderRadius: 12, color: "#fff" }}
                  className={`w-full border flex items-center px-4 py-2.5 my-1.5 transition-all duration-200 ${
                    isActiveItem
                      ? "bg-gradient-to-r from-[#ff9d58] to-[#f87e38] border-[#ffb07a] shadow-md shadow-orange-400/25 text-white"
                      : "border-transparent text-[#e6edf5] hover:bg-white/10 hover:border-[#ffffff1f] hover:text-white"
                  } ${isCollapsed ? "justify-center" : ""}`}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="w-5 h-5" />
                    {!isCollapsed && <span>{item.label}</span>}
                  </div>
                </Link>
              )}
              <AnimatePresence>
                {!isCollapsed && item.subItems && expandedItems[item.id] && (
                  <motion.div
                    variants={submenuVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="pl-7 py-1 space-y-1"
                  >
                    {item.subItems?.map((subItem) => (
                      <Link
                        key={subItem.id}
                        href={subItem.path ?? `/${subItem.id}`}
                        style={{ fontSize: 12, fontWeight: 500 }}
                        className={`block w-full text-left px-4 py-2 text-sm rounded-lg transition-all duration-200 relative ${
                          currentSection === subItem.id
                            ? "text-[#ffd0a8] bg-white/10"
                            : "text-[#bed0e2] hover:text-[#ffd0a8] hover:bg-white/5"
                        }`}
                      >
                        <span className="absolute left-1 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-[#ffb680] opacity-0 transition-opacity" style={{ opacity: currentSection === subItem.id ? 1 : 0 }} />
                        {subItem.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      {!isCollapsed && (
        <div className="relative z-10 px-4 py-4 border-t border-[#2c4863] bg-[#10263b]/65 backdrop-blur">
          <div className="text-center space-y-1">
            <p className="text-xs text-[#bfd0e1]" style={{ fontWeight: 500, fontSize: 12 }}>Terms & Conditions</p>
            <p className="text-xs text-[#9eb6cc]" style={{ fontWeight: 400, fontSize: 12 }}>Version 1.0.0</p>
            <p className="text-xs text-[#9eb6cc]" style={{ fontWeight: 400, fontSize: 12 }}>© {currentYear} All Rights Reserved by DGNext</p>
          </div>
        </div>
      )}
    </aside>
  );
};

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
      try {
        const adminDocRef = doc(db, "adminInfo", ADMIN_PROFILE_DOC_ID);
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
    try {
      const adminDocRef = doc(db, "adminInfo", ADMIN_PROFILE_DOC_ID);
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
    <header style={{ paddingLeft: 20, paddingRight: 20 }} className="flex justify-between items-center p-2 bg-white text-black border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center space-x-4">
        <button onClick={toggleSidebar} className="p-2 rounded-full hover:bg-gray-100 transition-colors md:hidden">
          {isCollapsed ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
        </button>
        <div className="relative hidden md:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            style={{ fontSize: 15, borderRadius: 15 }}
            className="pl-10 pr-4 py-2 w-72 bg-gray-100 border-transparent focus:outline-none focus:ring-2 focus:ring-[#2c3e50] transition"
          />
        </div>
      </div>
      <div className="flex items-center space-x-4 sm:space-x-6">
        <button className="hover:bg-gray-100 p-2 rounded-full transition-colors relative">
          <Bell className="w-6 h-6 text-gray-600" />
          <span className="absolute w-6 h-6 bg-red-500 rounded-full border-2 border-white" style={{ marginTop: -33, fontSize: 14, color: "#fff", textAlign: "center", alignItems: "center" }}>0</span>
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none rounded-full">
            <div className="flex items-center space-x-3 cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {adminData?.profileImage ? (
                  <Image src={adminData.profileImage} alt="Admin" width={40} height={40} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-6 h-6 text-gray-600" />
                )}
              </div>
              <div className="hidden md:block">
                <p className="font-semibold text-sm">{adminData?.username || "Admin"}</p>
                <p className="text-xs text-gray-500">{adminData?.role || "Administrator"}</p>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-white border-gray-200 mt-2" style={{ borderRadius: 15 }}>
            <DropdownMenuItem className="cursor-pointer hover:bg-[#F87E38] hover:text-[#fff]" onClick={() => setIsProfileModalOpen(true)} style={{ paddingLeft: 15, paddingRight: 15, borderRadius: 12 }}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer hover:bg-[#F87E38] hover:text-[#fff]" style={{ paddingLeft: 15, paddingRight: 15, borderRadius: 12 }}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-200" />
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

export default function DashboardShell({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const currentSection = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    return segments.length <= 1 ? "overview" : segments[segments.length - 1];
  }, [pathname]);

  const pageTitle = useMemo(() => {
    return currentSection
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  }, [currentSection]);

  return (
    <div className="flex h-screen bg-gray-50">
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
          onSignOut={async () => {
            await fetch("/api/admin/logout", { method: "POST" });
          }}
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
