import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext.jsx";
import ProtectedRoute from "@/components/layout/ProtectedRoute.jsx";
import DashboardLayout from "@/components/layout/DashboardLayout.jsx";

// Public Pages
import Home from "@/pages/Home.jsx";
import Login from "@/pages/auth/Login.jsx";
import Register from "@/pages/auth/Register.jsx";

// Lecturer Pages
import Overview from "@/pages/Lecturer/Overview.jsx";
import Classes from "@/pages/Lecturer/Classes.jsx";
import LectureReport from "@/pages/Lecturer/LectureReport.jsx";
import Reports from "@/pages/Lecturer/Reports.jsx";

// PRL Pages
import PRLReports from "@/pages/PRL/Reports.jsx";
import PRLCourses from "@/pages/PRL/Courses.jsx";
import PRLMonitoring from "@/pages/PRL/Monitoring.jsx";
import PRLRating from "@/pages/PRL/Rating.jsx";
import PRLClasses from "@/pages/PRL/Classes.jsx";

// PL Pages
import Courses from "@/pages/PL/Courses.jsx";
import ClassesPL from "@/pages/PL/Classes.jsx";
import Lectures from "@/pages/PL/Lectures.jsx";
import Monitoring from "@/pages/PL/Monitoring.jsx";
import AssignLectures from "@/pages/PL/Lectures.jsx";
import PLReports from "@/pages/PL/Reports.jsx";
import Rating from "@/pages/PL/Rating.jsx";

// Student Pages
import Monitor from "@/pages/Student/Monitor.jsx";
import RatingStudent from "@/pages/Student/Rating.jsx";
import Enrollments from "@/pages/Student/Enrolments.jsx";
import Attendance from "@/pages/Student/Attendance.jsx";

function DashboardRedirect() {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case "lecturer":
      return <Navigate to="/lecturer/overview" replace />;
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

  if (loading) return null;

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/dashboard" element={<DashboardRedirect />} />

      <Route element={<ProtectedRoute roles={["lecturer"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/lecturer/overview" element={<Overview />} />
          <Route path="/lecturer/classes" element={<Classes />} />
          <Route path="/lecturer/reports" element={<Reports />} />
          <Route path="/lecturer/submit-report" element={<LectureReport />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={["prl"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/prl/reports" element={<PRLReports />} />
          <Route path="/prl/courses" element={<PRLCourses />} />
          <Route path="/prl/monitoring" element={<PRLMonitoring />} />
          <Route path="/prl/rating" element={<PRLRating />} />
          <Route path="/prl/classes" element={<PRLClasses />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={["pl"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/pl/courses" element={<Courses />} />
          <Route path="/pl/classes" element={<ClassesPL />} />
          <Route path="/pl/lectures" element={<Lectures />} />
          <Route path="/pl/monitoring" element={<Monitoring />} />
          <Route path="/pl/assign-lectures" element={<AssignLectures />} />
          <Route path="/pl/reports" element={<PLReports />} />
          <Route path="/pl/rating" element={<Rating />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={["student"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/student/monitor" element={<Monitor />} />
          <Route path="/student/rating" element={<RatingStudent />} />
          <Route path="/student/enrollments" element={<Enrollments />} />
          <Route path="/student/attendance" element={<Attendance />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
