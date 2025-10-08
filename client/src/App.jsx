import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext.jsx";
import ProtectedRoute from "@/components/layout/ProtectedRoute.jsx";
import DashboardLayout from "@/components/layout/DashboardLayout.jsx";

import Home from "@/pages/Home.jsx";
import Login from "@/pages/Login.jsx";
import Register from "@/pages/Register.jsx";

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

// Universal Dashboard Redirect based on role
function DashboardRedirect() {
  const { user } = useAuth();

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
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Universal dashboard route */}
          <Route path="/dashboard" element={<DashboardRedirect />} />

          {/* Lecturer Routes */}
          <Route
            path="/lecturer/*"
            element={
              <ProtectedRoute roles={["lecturer"]}>
                <DashboardLayout>
                  <Routes>
                    <Route path="classes" element={<Classes />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="submit-report" element={<SubmitReport />} />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* PRL Routes */}
          <Route
            path="/prl/*"
            element={
              <ProtectedRoute roles={["prl"]}>
                <DashboardLayout>
                  <Routes>
                    <Route path="reports" element={<PRLReports />} />
                    <Route path="feedback" element={<Feedback />} />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* PL Routes */}
          <Route
            path="/pl/*"
            element={
              <ProtectedRoute roles={["pl"]}>
                <DashboardLayout>
                  <Routes>
                    <Route path="courses" element={<Courses />} />
                    <Route path="assign-lectures" element={<AssignLectures />} />
                    <Route path="reports" element={<PLReports />} />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Student Routes */}
          <Route
            path="/student/*"
            element={
              <ProtectedRoute roles={["student"]}>
                <DashboardLayout>
                  <Routes>
                    <Route path="monitor" element={<Monitor />} />
                    <Route path="rating" element={<Rating />} />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Catch all unmatched routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
