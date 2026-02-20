"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../Sidebar/Sidebar";
import AdminHeader from "../Header/AdminHeader";
import {
  getDashboardPageTitle,
  renderDashboardSection,
} from "./dashboardSections";

interface AdminDashboardProps {
  onSignOut: () => void;
}

const AdminDashboard = ({ onSignOut }: AdminDashboardProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-black">
      <div className={`fixed inset-y-0 left-0 z-50 md:relative md:z-auto transform ${isCollapsed ? "-translate-x-full" : "translate-x-0"} md:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <Sidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          isCollapsed={isCollapsed}
        />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader toggleSidebar={toggleSidebar} isCollapsed={isCollapsed} onSignOut={onSignOut} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 lg:p-8">
          <div className="container mx-auto">
            <div className="mb-8">
              <h1 style={{ fontSize: 25, fontWeight: 800, color: "#2c3e50" }}>
                {getDashboardPageTitle(activeSection)}
              </h1>
              <p style={{ fontSize: 16, fontWeight: 400, color: "#bdbdbd" }} className="hover:text-">
                Welcome to your admin dashboard.
              </p>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderDashboardSection(activeSection)}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
