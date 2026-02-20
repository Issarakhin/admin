"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import UploadCourseForm from "../Course/Uploadcourse";
import DashboardOverview from "./DashboardOverview";
import UploadCategories from "../Categories/UploadCategories";
import CourseList from "../Course/CourseList";
import AddPushNotification from "../Notification/AddPushNotification";
import ListNotification from "../Notification/ListNotification";
import UploadEvent from "../Event/UploadEvent";
import ListEvent from "../Event/ListEvent";
import ListStudent from "../Student/ListStudent";
import ListStudentEnroll from "../Student/ListStudentEnroll";
import CreateBlogPost from "../BlogPost/UploadBlogPost";
import BlogPostsList from "../BlogPost/ListBlogPost";
import UploadTrainer from "../Trainer/UploadTrainer";
import ListTrainer from "../Trainer/TrainerList";
import Sidebar from "../Sidebar/Sidebar";
import AdminHeader from "../Header/AdminHeader";

const SectionWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm">
    {children}
  </div>
);

const DashboardOverviews = () => <SectionWrapper><DashboardOverview /></SectionWrapper>;
const AddCategories = () => <SectionWrapper><UploadCategories /></SectionWrapper>;
const AddPushNotifications = () => <SectionWrapper><AddPushNotification /></SectionWrapper>;
const CourseLists = () => <SectionWrapper><CourseList /></SectionWrapper>;
const ListNotifications = () => <SectionWrapper><ListNotification /></SectionWrapper>;
const StudentSection = () => <SectionWrapper><h2 className="text-xl font-bold">Student Management</h2></SectionWrapper>;
const EventSection = () => <SectionWrapper><h2 className="text-xl font-bold">Events</h2></SectionWrapper>;
const SettingsSection = () => <SectionWrapper><h2 className="text-xl font-bold">Settings</h2></SectionWrapper>;

interface AdminDashboardProps {
  onSignOut: () => void;
}

const AdminDashboard = ({ onSignOut }: AdminDashboardProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const renderContent = () => {
    switch (activeSection) {
      case "overview": return <DashboardOverviews />;
      case "add-course": return <SectionWrapper><UploadCourseForm /></SectionWrapper>;
      case "course-list": return <CourseLists />;
      case "add-course-categories": return <AddCategories />;
      case "add-trainer": return <SectionWrapper><UploadTrainer /></SectionWrapper>;
      case "list-trainers": return <SectionWrapper><ListTrainer /></SectionWrapper>;
      case "students": return <StudentSection />;
      case "list-student": return <SectionWrapper><ListStudent /></SectionWrapper>;
      case "student-enroll-recorded": return <SectionWrapper><ListStudentEnroll /></SectionWrapper>;
      case "add-blogpost": return <SectionWrapper><CreateBlogPost /></SectionWrapper>;
      case "list-blogpost": return <SectionWrapper><BlogPostsList /></SectionWrapper>;
      case "events": return <EventSection />;
      case "add-event": return <SectionWrapper><UploadEvent /></SectionWrapper>;
      case "list-events": return <SectionWrapper><ListEvent /></SectionWrapper>;
      case "notifications": return <ListNotifications />;
      case "add-push-notification": return <AddPushNotifications />;
      case "list-notification": return <ListNotifications />;
      case "settings": return <SettingsSection />;
      default: return <DashboardOverviews />;
    }
  };

  const getPageTitle = (section: string) => {
    return section.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

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
                {getPageTitle(activeSection)}
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
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
