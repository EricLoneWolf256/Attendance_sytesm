import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PageLoader } from "@/components/PageLoader";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";
import { ROUTES } from "@/lib/routes";

const LoginPage = lazy(() =>
  import("./pages/LoginPage").then((m) => ({ default: m.LoginPage }))
);

// Student pages
const StudentDashboard = lazy(() =>
  import("./pages/student/Dashboard").then((m) => ({ default: m.StudentDashboard }))
);
const StudentCheckIn = lazy(() =>
  import("./pages/student/CheckIn").then((m) => ({ default: m.StudentCheckIn }))
);
const StudentHistory = lazy(() =>
  import("./pages/student/History").then((m) => ({ default: m.StudentHistory }))
);

// ClassRep pages
const ClassRepDashboard = lazy(() =>
  import("./pages/classrep/Dashboard").then((m) => ({ default: m.Dashboard }))
);
const ClassRepSessions = lazy(() =>
  import("./pages/classrep/Sessions").then((m) => ({ default: m.Sessions }))
);
const ClassRepSessionDetail = lazy(() =>
  import("./pages/classrep/SessionDetail").then((m) => ({ default: m.SessionDetail }))
);

// Lecturer pages
const LecturerDashboard = lazy(() =>
  import("./pages/lecturer/Dashboard").then((m) => ({ default: m.Dashboard }))
);
const LecturerSessions = lazy(() =>
  import("./pages/lecturer/Sessions").then((m) => ({ default: m.Sessions }))
);
const LecturerSessionDetail = lazy(() =>
  import("./pages/lecturer/SessionDetail").then((m) => ({ default: m.SessionDetail }))
);

// Faculty Admin pages
const FacultyDashboard = lazy(() =>
  import("./pages/faculty-admin/Dashboard").then((m) => ({ default: m.FacultyDashboard }))
);
const FacultyReports = lazy(() =>
  import("./pages/faculty-admin/Reports").then((m) => ({ default: m.FacultyReports }))
);

// Super Admin pages
const SuperAdminDashboard = lazy(() =>
  import("./pages/super-admin/Dashboard").then((m) => ({ default: m.SuperAdminDashboard }))
);
const UserManagement = lazy(() =>
  import("./pages/super-admin/Users").then((m) => ({ default: m.UserManagement }))
);
const FacultyManagement = lazy(() =>
  import("./pages/super-admin/Faculties").then((m) => ({ default: m.FacultyManagement }))
);
const CourseManagement = lazy(() =>
  import("./pages/super-admin/Courses").then((m) => ({ default: m.CourseManagement }))
);
const SystemSettings = lazy(() =>
  import("./pages/super-admin/Settings").then((m) => ({ default: m.SystemSettings }))
);

const NotFoundPage = lazy(() =>
  import("./pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage }))
);

function RoleRedirect() {
  return <Navigate to={ROUTES.login} replace />;
}

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Student routes */}
          <Route
            path="/student"
            element={
              <ErrorBoundary>
                <ProtectedRoute allowedRoles={["STUDENT"]}>
                  <AppLayout />
                </ProtectedRoute>
              </ErrorBoundary>
            }
          >
            <Route index element={<Navigate to={ROUTES.student.dashboard} replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="checkin" element={<StudentCheckIn />} />
            <Route path="history" element={<StudentHistory />} />
          </Route>

          {/* ClassRep routes (uses STUDENT role) */}
          <Route
            path="/classrep"
            element={
              <ErrorBoundary>
                <ProtectedRoute allowedRoles={["STUDENT"]}>
                  <AppLayout />
                </ProtectedRoute>
              </ErrorBoundary>
            }
          >
            <Route index element={<Navigate to={ROUTES.classrep.dashboard} replace />} />
            <Route path="dashboard" element={<ClassRepDashboard />} />
            <Route path="sessions" element={<ClassRepSessions />} />
            <Route path="sessions/:id" element={<ClassRepSessionDetail />} />
          </Route>

          {/* Lecturer routes */}
          <Route
            path="/lecturer"
            element={
              <ErrorBoundary>
                <ProtectedRoute allowedRoles={["LECTURER"]}>
                  <AppLayout />
                </ProtectedRoute>
              </ErrorBoundary>
            }
          >
            <Route index element={<Navigate to={ROUTES.lecturer.dashboard} replace />} />
            <Route path="dashboard" element={<LecturerDashboard />} />
            <Route path="sessions" element={<LecturerSessions />} />
            <Route path="sessions/:id" element={<LecturerSessionDetail />} />
          </Route>

          {/* Faculty Admin routes */}
          <Route
            path="/faculty-admin"
            element={
              <ErrorBoundary>
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AppLayout />
                </ProtectedRoute>
              </ErrorBoundary>
            }
          >
            <Route index element={<Navigate to={ROUTES.facultyAdmin.dashboard} replace />} />
            <Route path="dashboard" element={<FacultyDashboard />} />
            <Route path="reports" element={<FacultyReports />} />
          </Route>

          {/* Super Admin routes */}
          <Route
            path="/admin"
            element={
              <ErrorBoundary>
                <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
                  <AppLayout />
                </ProtectedRoute>
              </ErrorBoundary>
            }
          >
            <Route index element={<Navigate to={ROUTES.superAdmin.dashboard} replace />} />
            <Route path="dashboard" element={<SuperAdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="faculties" element={<FacultyManagement />} />
            <Route path="courses" element={<CourseManagement />} />
            <Route path="settings" element={<SystemSettings />} />
          </Route>

          <Route path="/" element={<RoleRedirect />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
