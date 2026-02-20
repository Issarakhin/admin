import React from "react";
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

const SectionWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm">
    {children}
  </div>
);

type SectionRenderer = () => React.ReactNode;

const sectionRenderers: Record<string, SectionRenderer> = {
  overview: () => (
    <SectionWrapper>
      <DashboardOverview />
    </SectionWrapper>
  ),
  "add-course": () => (
    <SectionWrapper>
      <UploadCourseForm />
    </SectionWrapper>
  ),
  "course-list": () => (
    <SectionWrapper>
      <CourseList />
    </SectionWrapper>
  ),
  "add-course-categories": () => (
    <SectionWrapper>
      <UploadCategories />
    </SectionWrapper>
  ),
  "add-trainer": () => (
    <SectionWrapper>
      <UploadTrainer />
    </SectionWrapper>
  ),
  "list-trainers": () => (
    <SectionWrapper>
      <ListTrainer />
    </SectionWrapper>
  ),
  students: () => (
    <SectionWrapper>
      <h2 className="text-xl font-bold">Student Management</h2>
    </SectionWrapper>
  ),
  "list-student": () => (
    <SectionWrapper>
      <ListStudent />
    </SectionWrapper>
  ),
  "student-enroll-recorded": () => (
    <SectionWrapper>
      <ListStudentEnroll />
    </SectionWrapper>
  ),
  "add-blogpost": () => (
    <SectionWrapper>
      <CreateBlogPost />
    </SectionWrapper>
  ),
  "list-blogpost": () => (
    <SectionWrapper>
      <BlogPostsList />
    </SectionWrapper>
  ),
  events: () => (
    <SectionWrapper>
      <h2 className="text-xl font-bold">Events</h2>
    </SectionWrapper>
  ),
  "add-event": () => (
    <SectionWrapper>
      <UploadEvent />
    </SectionWrapper>
  ),
  "list-events": () => (
    <SectionWrapper>
      <ListEvent />
    </SectionWrapper>
  ),
  notifications: () => (
    <SectionWrapper>
      <ListNotification />
    </SectionWrapper>
  ),
  "add-push-notification": () => (
    <SectionWrapper>
      <AddPushNotification />
    </SectionWrapper>
  ),
  "list-notification": () => (
    <SectionWrapper>
      <ListNotification />
    </SectionWrapper>
  ),
  settings: () => (
    <SectionWrapper>
      <h2 className="text-xl font-bold">Settings</h2>
    </SectionWrapper>
  ),
};

export const renderDashboardSection = (section: string) => {
  const renderer = sectionRenderers[section] ?? sectionRenderers.overview;
  return renderer();
};

export const getDashboardPageTitle = (section: string) => {
  return section.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};
