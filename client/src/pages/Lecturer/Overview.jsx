import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext.jsx";
import api from "@/services/api.js";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Bar, Doughnut } from "react-chartjs-2";
import Chart from "chart.js/auto";
import { Separator } from "@/components/ui/separator";

export default function LecturerOverview() {
  const { token } = useAuth();

  const [stats, setStats] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOverview = async () => {
    setLoading(true);
    setError("");
    try {
      const [statsRes, reportsRes] = await Promise.all([
        api.get("/lecturer/overview/stats", { headers: { Authorization: `Bearer ${token}` } }),
        api.get("/lecturer/overview/recent-reports", { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      setStats(statsRes.data);
      setRecentReports(reportsRes.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, [token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin w-10 h-10 text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button className="btn" onClick={fetchOverview}>Retry</button>
      </div>
    );
  }

  // ---------------------------
  // Charts Data
  // ---------------------------
  const attendanceData = {
    labels: ["Excellent (≥90%)", "Good (70–89%)", "Low (<70%)"],
    datasets: [
      {
        data: [
          recentReports.filter(r => r.attendance_percentage >= 90).length,
          recentReports.filter(r => r.attendance_percentage >= 70 && r.attendance_percentage < 90).length,
          recentReports.filter(r => r.attendance_percentage < 70).length
        ],
        backgroundColor: ["#10b981", "#facc15", "#ef4444"], // green, yellow, red
        borderColor: "#ffffff",
        borderWidth: 2,
      },
    ],
  };

  const weeklyTrendData = {
    labels: recentReports.map(r => new Date(r.date).toLocaleDateString()),
    datasets: [
      {
        label: "Attendance %",
        data: recentReports.map(r => r.attendance_percentage ?? 0),
        backgroundColor: recentReports.map(r =>
          r.attendance_percentage >= 90
            ? "#10b981"
            : r.attendance_percentage >= 70
            ? "#facc15"
            : "#ef4444"
        ),
        borderColor: "#000000",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="p-8 space-y-10">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Lecturer Overview</h1>
        <p className="text-gray-400">A quick snapshot of your teaching activity.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card style={{ borderLeft: "4px solid #3b82f6" }}>
          <CardHeader>
            <CardTitle>Total Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{stats?.totalClasses ?? 0}</p>
          </CardContent>
        </Card>

        <Card style={{ borderLeft: "4px solid #f97316" }}>
          <CardHeader>
            <CardTitle>Total Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{stats?.totalReports ?? 0}</p>
          </CardContent>
        </Card>

        <Card style={{ borderLeft: "4px solid #6b7280" }}>
          <CardHeader>
            <CardTitle>Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{stats?.totalStudents ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card style={{ borderLeft: "4px solid #10b981" }}>
          <CardHeader>
            <CardTitle>Attendance Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <Doughnut
              data={attendanceData}
              options={{
                plugins: { 
                  legend: { labels: { color: "#ffffff" } } 
                },
                responsive: true,
              }}
            />
          </CardContent>
        </Card>

        <Card style={{ borderLeft: "4px solid #facc15" }}>
          <CardHeader>
            <CardTitle>Weekly Attendance Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <Bar
              data={weeklyTrendData}
              options={{
                responsive: true,
                plugins: {
                  legend: { labels: { color: "#ffffff" } },
                  tooltip: {
                    backgroundColor: "#1f2937",
                    titleColor: "#ffffff",
                    bodyColor: "#ffffff",
                  },
                },
                scales: {
                  x: { ticks: { color: "#ffffff" }, grid: { color: "#374151" } },
                  y: { ticks: { color: "#ffffff" }, grid: { color: "#374151" } },
                },
              }}
            />
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Recent Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recentReports.length === 0 ? (
          <p className="text-gray-400">No recent reports submitted.</p>
        ) : (
          recentReports.map(r => {
            let borderColor = r.attendance_percentage >= 90
              ? "#10b981"
              : r.attendance_percentage >= 70
              ? "#facc15"
              : "#ef4444";

            let badgeColor = r.attendance_percentage >= 90
              ? "success"
              : r.attendance_percentage >= 70
              ? "warning"
              : "destructive";

            return (
              <Card
                key={r.id}
                className="transition-all hover:shadow-lg"
                style={{ borderLeft: `4px solid ${borderColor}` }}
              >
                <CardHeader>
                  <h2 className="text-lg font-semibold">{r.class_name}</h2>
                  <p className="text-sm text-gray-400">{r.topic}</p>
                </CardHeader>
                <CardContent className="flex justify-between items-center">
                  <p className="text-sm text-gray-400">{new Date(r.date).toLocaleDateString()}</p>
                  <Badge variant={badgeColor}>{r.attendance_percentage ?? "—"}%</Badge>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
