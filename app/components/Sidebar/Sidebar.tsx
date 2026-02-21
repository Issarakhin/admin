"use client";

import React, { useState } from "react";
import {
  Bell,
  BookOpen,
  Calendar,
  ChevronDown,
  DollarSign,
  FileText,
  HelpCircle,
  LayoutDashboard,
  Megaphone,
  Pen,
  UserRound,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import DGLOGO from "@/app/assets/png/LOGO-DG-Next-havebackground.png";

interface MenuItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  subItems?: { id: string; label: string }[];
}

interface SidebarProps {
  currentSection: string;
  isCollapsed: boolean;
}

const submenuVariants = {
  hidden: { opacity: 0, height: 0, overflow: "hidden" },
  visible: { opacity: 1, height: "auto", transition: { duration: 0.3 } },
};

const menuItems: MenuItem[] = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", subItems: [{ id: "overview", label: "Overview" }] },
  { id: "courses", icon: BookOpen, label: "Courses", subItems: [{ id: "course-list", label: "Course List" }, { id: "add-course", label: "Upload Course" }, { id: "add-course-categories", label: "Upload Course Categories" }] },
  { id: "trainers", icon: UserRound, label: "Trainers", subItems: [{ id: "list-trainers", label: "List Trainers" }, { id: "add-trainer", label: "Add Trainer" }] },
  { id: "certificates", icon: FileText, label: "Certificates", subItems: [{ id: "list-certificates", label: "List Certificates" }] },
  { id: "students", icon: Users, label: "Students", subItems: [{ id: "list-student", label: "List Students" }, { id: "student-enroll-recorded", label: "Enrollments" }] },
  { id: "blogposts", icon: Pen, label: "Blog Posts", subItems: [{ id: "add-blogpost", label: "Upload Post" }, { id: "list-blogpost", label: "List Posts" }] },
  { id: "events", icon: Calendar, label: "Events", subItems: [{ id: "list-events", label: "List Events" }, { id: "add-event", label: "Add Event" }] },
  { id: "notifications", icon: Bell, label: "Notifications", subItems: [{ id: "list-notification", label: "List Notifications" }, { id: "add-push-notification", label: "Add Push Notification" }] },
  { id: "marketing", icon: Megaphone, label: "Marketing", subItems: [{ id: "discounts", label: "Discounts" }] },
  { id: "payment", icon: DollarSign, label: "Payments", subItems: [{ id: "course-sales", label: "Course Sales" }] },
  { id: "support", icon: HelpCircle, label: "Support", subItems: [{ id: "support-tickets", label: "Tickets" }] },
];

const Sidebar = ({ currentSection, isCollapsed }: SidebarProps) => {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    dashboard: true,
    courses: true,
  });
  const currentYear = new Date().getFullYear();

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <aside className={`h-full bg-white dark:bg-gray-900 shadow-lg transition-all duration-300 ease-in-out ${isCollapsed ? "w-20" : "w-64"} flex flex-col`}>
      <div className="flex items-center justify-between dark:border-gray-800 px-4 bg-[#2c3e50]" style={{ paddingTop: 8, paddingBottom: 8, borderBottomWidth: 1, borderColor: "#34495e" }}>
        <Link href="/dashboard/overview" passHref>
          <div className={`flex items-center space-x-3 ${isCollapsed ? "justify-center w-full" : ""}`}>
            <Image src={DGLOGO} width={40} height={40} alt="DGLOGO" style={{ borderRadius: 5 }} />
            {!isCollapsed && <span className="text-[#2c3e50] dark:text-[#fff]" style={{ fontSize: 16, fontWeight: 600, color: "#fff" }}>Admin Dashboard</span>}
          </div>
        </Link>
      </div>

      <nav className="flex-1 py-0 overflow-y-auto" style={{ backgroundColor: "#2c3e50" }}>
        {menuItems.map((item) => {
          const hasActiveSubItem =
            item.subItems?.some((subItem) => subItem.id === currentSection) ??
            false;

          return (
          <div key={item.id} className="px-3">
            <button
              onClick={() => item.subItems && toggleExpand(item.id)}
              style={{ fontSize: 14, fontWeight: 600, borderRadius: 15, color: "#fff" }}
              className={`w-full flex items-center justify-between px-4 py-2 my-1 transition-all duration-200 ${
                hasActiveSubItem ? "bg-[#F87E38] shadow-lg" : "text-[#2c3e50] dark:text-gray-400 hover:bg-[#F87E38] dark:hover:bg-gray-800"
              } ${isCollapsed ? "justify-center" : ""}`}
            >
              <div className="flex items-center space-x-3">
                <item.icon className="w-5 h-5" />
                {!isCollapsed && <span>{item.label}</span>}
              </div>
              {!isCollapsed && item.subItems && (
                <ChevronDown className={`w-5 h-5 transition-transform ${expandedItems[item.id] ? "rotate-180" : ""}`} />
              )}
            </button>
            <AnimatePresence>
              {!isCollapsed && expandedItems[item.id] && (
                <motion.div
                  variants={submenuVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="pl-8 py-1 space-y-1"
                >
                  {item.subItems?.map((subItem) => (
                    <Link
                      key={subItem.id}
                      href={`/dashboard/${subItem.id}`}
                      style={{ fontSize: 12, fontWeight: 400, color: "#bdbddb" }}
                      className={`w-full text-left px-4 py-2 text-sm rounded-md transition-all duration-200 relative ${
                        currentSection === subItem.id ? "text-[#F87E38]" : "text-[gray-500] dark:text-gray-400 hover:text-[#F87E38] dark:hover:text-[#F87E38]"
                      }`}
                    >
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-full w-1 bg-[#F87E38] rounded-r-full opacity-0 transition-opacity" style={{ opacity: currentSection === subItem.id ? 1 : 0 }} />
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
        <div className="px-4 py-4 bg-[#2c3e50] border-t border-[#34495e]">
          <div className="text-center space-y-1">
            <p className="text-xs text-gray-300" style={{ fontWeight: 400, fontSize: 12 }}>Terms & Conditions</p>
            <p className="text-xs text-gray-300" style={{ fontWeight: 400, fontSize: 12 }}>Version 1.0.0</p>
            <p className="text-xs text-gray-300" style={{ fontWeight: 400, fontSize: 12 }}>© {currentYear} All Rights Reserved by DGNext</p>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
