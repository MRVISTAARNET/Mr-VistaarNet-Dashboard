import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./hooks/useAuth";
import Layout from "./components/Layout";
import NotFound from "./pages/NotFound";

// Pages
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminDashboard from "./pages/admin/AdminDashboard";
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import Departments from "./pages/admin/organization/Departments";
import Positions from "./pages/admin/organization/Positions";
import Structure from "./pages/admin/organization/Structure";
import Directory from "./pages/admin/employees/Directory";
import AddEmployee from "./pages/admin/employees/Add";
import EditEmployee from "./pages/admin/employees/Edit";
import AdminLeave from "./pages/admin/Leave";
import AdminAttendance from "./pages/admin/Attendance";
import AdminDocuments from "./pages/admin/Documents";
import EmployeeAttendance from "./pages/employee/Attendance";
import EmployeeLeave from "./pages/employee/Leave";
import EmployeeDocuments from "./pages/employee/Documents";
import AdminTasks from "./pages/admin/Tasks";
import Reports from "./pages/admin/Reports";
import MyTasks from "./pages/employee/MyTasks";
import DailyReport from "./pages/employee/DailyReport";
import AdminWorkReports from "./pages/admin/WorkReports";
import AdminMessages from "./pages/admin/Messages";
import AdminAnnouncements from "./pages/admin/Announcements";
import EmployeeMessages from "./pages/employee/Messages";
import Settings from "./pages/Settings";
import AccordionDemo from "./pages/demos/AccordionDemo";

const queryClient = new QueryClient();

// Protected Route Component
function ProtectedRoute({
  element,
  requiredRole,
}: {
  element: React.ReactNode;
  requiredRole?: "admin" | "employee";
}) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    // Redirect employees trying to access admin pages to their dashboard
    if (user?.role === 'employee' && requiredRole === 'admin') {
      return <Navigate to="/employee/dashboard" replace />;
    }
    // Redirect admins trying to access employee pages (optional, or allow)
    if (user?.role === 'admin' && requiredRole === 'employee') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return <Layout>{element}</Layout>;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute element={<AdminDashboard />} requiredRole="admin" />
        }
      />
      <Route
        path="/admin/organization/departments"
        element={
          <ProtectedRoute element={<Departments />} requiredRole="admin" />
        }
      />
      <Route
        path="/admin/organization/positions"
        element={
          <ProtectedRoute element={<Positions />} requiredRole="admin" />
        }
      />
      <Route
        path="/admin/organization/structure"
        element={
          <ProtectedRoute element={<Structure />} requiredRole="admin" />
        }
      />
      <Route
        path="/admin/employees"
        element={<Navigate to="/admin/employees/directory" replace />}
      />
      <Route
        path="/admin/employees/directory"
        element={
          <ProtectedRoute element={<Directory />} requiredRole="admin" />
        }
      />
      <Route
        path="/admin/employees/add"
        element={
          <ProtectedRoute element={<AddEmployee />} requiredRole="admin" />
        }
      />
      <Route
        path="/admin/employees/edit/:id"
        element={
          <ProtectedRoute element={<EditEmployee />} requiredRole="admin" />
        }
      />
      <Route
        path="/admin/leave"
        element={
          <ProtectedRoute element={<AdminLeave />} requiredRole="admin" />
        }
      />
      <Route
        path="/admin/attendance"
        element={
          <ProtectedRoute element={<AdminAttendance />} requiredRole="admin" />
        }
      />
      <Route
        path="/admin/documents"
        element={
          <ProtectedRoute element={<AdminDocuments />} requiredRole="admin" />
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute element={<Reports />} requiredRole="admin" />
        }
      />
      <Route
        path="/admin/tasks"
        element={
          <ProtectedRoute element={<AdminTasks />} requiredRole="admin" />
        }
      />
      <Route
        path="/admin/work-reports"
        element={
          <ProtectedRoute element={<AdminWorkReports />} requiredRole="admin" />
        }
      />
      <Route
        path="/admin/announcements"
        element={
          <ProtectedRoute element={<AdminAnnouncements />} requiredRole="admin" />
        }
      />
      <Route
        path="/admin/messages"
        element={
          <ProtectedRoute element={<AdminMessages />} requiredRole="admin" />
        }
      />

      {/* Employee Routes */}
      <Route
        path="/employee/dashboard"
        element={
          <ProtectedRoute element={<EmployeeDashboard />} requiredRole="employee" />
        }
      />
      <Route
        path="/employee/daily-reports"
        element={
          <ProtectedRoute element={<DailyReport />} requiredRole="employee" />
        }
      />
      <Route
        path="/employee/tasks"
        element={
          <ProtectedRoute element={<MyTasks />} requiredRole="employee" />
        }
      />
      <Route
        path="/employee/attendance"
        element={
          <ProtectedRoute element={<EmployeeAttendance />} requiredRole="employee" />
        }
      />
      <Route
        path="/employee/leave"
        element={
          <ProtectedRoute element={<EmployeeLeave />} requiredRole="employee" />
        }
      />
      <Route
        path="/employee/documents"
        element={
          <ProtectedRoute element={<EmployeeDocuments />} requiredRole="employee" />
        }
      />
      <Route
        path="/employee/messages"
        element={
          <ProtectedRoute element={<EmployeeMessages />} requiredRole="employee" />
        }
      />

      {/* Shared Routes */}
      <Route
        path="/settings"
        element={
          <ProtectedRoute element={<Settings />} />
        }
      />

      {/* Demos */}
      <Route path="/demo/accordion" element={<AccordionDemo />} />

      {/* Root redirect */}
      <Route path="/" element={<Navigate to={isAuthenticated ? "/admin/dashboard" : "/login"} replace />} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
