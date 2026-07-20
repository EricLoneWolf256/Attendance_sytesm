import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useAuth } from "./contexts/AuthContext";
import { AdminLayout } from "./components/admin/AdminLayout";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/admin/DashboardPage";
import { CampusesPage } from "./pages/admin/CampusesPage";
import { FacultiesPage } from "./pages/admin/FacultiesPage";
import { DepartmentsPage } from "./pages/admin/DepartmentsPage";
import { ProgrammesPage } from "./pages/admin/ProgrammesPage";
import { CoursesPage } from "./pages/admin/CoursesPage";
import { CourseOfferingsPage } from "./pages/admin/CourseOfferingsPage";
import { UsersPage } from "./pages/admin/UsersPage";
import { ClassRepsPage } from "./pages/admin/ClassRepsPage";
import { EnrollmentsPage } from "./pages/admin/EnrollmentsPage";
import { AcademicPage } from "./pages/admin/AcademicPage";
import { ReportsPage } from "./pages/admin/ReportsPage";
import { ImportPage } from "./pages/admin/ImportPage";
import { AuditLogPage } from "./pages/admin/AuditLogPage";
import { PolicyPage } from "./pages/admin/PolicyPage";
import { ProfilePage } from "./pages/student/ProfilePage";
import { EnrollPage } from "./pages/student/EnrollPage";
import { DashboardPage as StudentDashboard } from "./pages/student/DashboardPage";
import { MyAttendancePage } from "./pages/student/MyAttendancePage";
import { CheckInPage } from "./pages/student/CheckInPage";
import { SessionListPage } from "./pages/classrep/SessionListPage";
import { SessionDetailPage } from "./pages/classrep/SessionDetailPage";
import { DashboardPage as LecturerDashboard } from "./pages/lecturer/DashboardPage";
import { LecturerSessionsPage } from "./pages/lecturer/LecturerSessionsPage";
import { LecturerSessionDetailPage } from "./pages/lecturer/LecturerSessionDetailPage";

const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN"];

function RoleRedirect() {
  const { user } = useAuth();
  if (user?.role === "LECTURER") return <Navigate to="/lecturer" replace />;
  if (user?.role === "STUDENT") return <Navigate to="/student/dashboard" replace />;
  return <Navigate to="/admin" replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route
          path="campuses"
          element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
              <CampusesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="faculties"
          element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
              <FacultiesPage />
            </ProtectedRoute>
          }
        />
        <Route path="departments" element={<DepartmentsPage />} />
        <Route path="programmes" element={<ProgrammesPage />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="course-offerings" element={<CourseOfferingsPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="class-reps" element={<ClassRepsPage />} />
        <Route path="enrollments" element={<EnrollmentsPage />} />
        <Route path="academic" element={<AcademicPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="import" element={<ImportPage />} />
        <Route path="audit" element={<AuditLogPage />} />
        <Route path="policies" element={<PolicyPage />} />
      </Route>

      <Route
        path="/student/profile"
        element={
          <ProtectedRoute allowedRoles={["STUDENT"]}>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/enroll"
        element={
          <ProtectedRoute allowedRoles={["STUDENT"]}>
            <EnrollPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute allowedRoles={["STUDENT"]}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/attendance"
        element={
          <ProtectedRoute allowedRoles={["STUDENT"]}>
            <MyAttendancePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/checkin"
        element={
          <ProtectedRoute allowedRoles={["STUDENT"]}>
            <CheckInPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/classrep/sessions"
        element={
          <ProtectedRoute allowedRoles={["STUDENT"]}>
            <SessionListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/classrep/sessions/:id"
        element={
          <ProtectedRoute allowedRoles={["STUDENT"]}>
            <SessionDetailPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/lecturer"
        element={
          <ProtectedRoute allowedRoles={["LECTURER"]}>
            <LecturerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lecturer/sessions"
        element={
          <ProtectedRoute allowedRoles={["LECTURER"]}>
            <LecturerSessionsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lecturer/sessions/:id"
        element={
          <ProtectedRoute allowedRoles={["LECTURER"]}>
            <LecturerSessionDetailPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <RoleRedirect />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
