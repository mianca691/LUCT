import { Routes, Route, Navigate } from "react-router-dom"; 
import { useAuth } from "@/contexts/AuthContext.jsx";
import ProtectedRoute from "@/components/layout/ProtectedRoute.jsx";
import DashboardLayout from "@/components/layout/DashboardLayout.jsx";

import Home from "@/pages/Home.jsx";
import Login from "@/pages/auth/Login.jsx";
import Register from "@/pages/auth/Register.jsx";

// Lecturer Pages
import Classes from "@/pages/Lecturer/Classes.jsx";
import Reports from "@/pages/Lecturer/ReportForm.jsx";
import SubmitReport from "@/pages/Lecturer/SubmitReport.jsx";

// PRL Pages
import PRLReports from "@/pages/PRL/Reports.jsx";
import Feedback from "@/pages/PRL/Feedback.jsx";

// PL Pages
import Courses from "@/pages/PL/Courses.jsx";
import AssignLectures from "@/pages/PL/AssignLectures.jsx";
import PLReports from "@/pages/PL/Reports.jsx";

// Student Pages
import Monitor from "@/pages/Student/Monitor.jsx";
import Rating from "@/pages/Student/Rating.jsx";

// Universal Dashboard Redirect
function DashboardRedirect() {
  const { user, loading } = useAuth();

  if (loading) return null; // wait until auth state is loaded

  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case "lecturer":
      return <Navigate to="/lecturer/classes" replace />;
    case "prl":
      return <Navigate to="/prl/reports" replace />;
    case "pl":
      return <Navigate to="/pl/courses" replace />;
    case "student":
      return <Navigate to="/student/monitor" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}

export default function App() {
  const { loading } = useAuth();

  if (loading) return null; // prevent rendering routes until auth state is ready

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Dashboard Redirect */}
      <Route path="/dashboard" element={<DashboardRedirect />} />

      {/* Lecturer Routes */}
      <Route element={<ProtectedRoute roles={["lecturer"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/lecturer/classes" element={<Classes />} />
          <Route path="/lecturer/reports" element={<Reports />} />
          <Route path="/lecturer/submit-report" element={<SubmitReport />} />
        </Route>
      </Route>

      {/* PRL Routes */}
      <Route element={<ProtectedRoute roles={["prl"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/prl/reports" element={<PRLReports />} />
          <Route path="/prl/feedback" element={<Feedback />} />
        </Route>
      </Route>

      {/* PL Routes */}
      <Route element={<ProtectedRoute roles={["pl"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/pl/courses" element={<Courses />} />
          <Route path="/pl/assign-lectures" element={<AssignLectures />} />
          <Route path="/pl/reports" element={<PLReports />} />
        </Route>
      </Route>

      {/* Student Routes */}
      <Route element={<ProtectedRoute roles={["student"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/student/monitor" element={<Monitor />} />
          <Route path="/student/rating" element={<Rating />} />
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
