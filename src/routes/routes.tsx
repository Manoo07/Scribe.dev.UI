import React from "react";
import OverviewPage from "../pages/Dashboard";
import AssignmentsPage from "../pages/Assignment";
import MyClassroomsPage from "../pages/Classrooms";
import ClassroomDetailPage from "../pages/ClassroomDetailPage";
import Announcements from "../pages/Announcements";
import AttendanceDashboard from "../components/attendance/AttendanceDashboard";
import ThreadsTab from "../components/threads/ThreadsTab";

export type AppChildRoute = {
  path: string;
  element: JSX.Element;
};

// Centralized list of dashboard child routes (protected)
export const dashboardChildren: AppChildRoute[] = [
  { path: "overview", element: <OverviewPage /> },
  { path: "assignments", element: <AssignmentsPage /> },
  { path: "classrooms", element: <MyClassroomsPage /> },
  { path: "classrooms/:id", element: <ClassroomDetailPage /> },
  { path: "announcements", element: <Announcements /> },
  { path: "attendance", element: <AttendanceDashboard /> },
  { path: "threads", element: <ThreadsTab classroomId={""} units={[]} /> },
];

export default dashboardChildren;
