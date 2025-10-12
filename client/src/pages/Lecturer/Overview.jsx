import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext.jsx";
import api from "@/services/api.js";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
        api.get("/lecturer/overview/stats", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get("/lecturer/overview/recent-reports", {
          headers: { Authorization: `Bearer ${token}` },
        }),
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
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchOverview}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Lecturer Overview</h1>
        <p className="text-gray-500">A quick summary of your teaching activity.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Total Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{stats?.totalClasses ?? 0}</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Total Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{stats?.totalReports ?? 0}</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{stats?.totalStudents ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reports */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          {recentReports.length === 0 ? (
            <p className="text-gray-500 text-sm">No recent reports submitted.</p>
          ) : (
            <table className="w-full text-sm border">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-2 border">Date</th>
                  <th className="text-left p-2 border">Class</th>
                  <th className="text-left p-2 border">Topic</th>
                  <th className="text-left p-2 border">Attendance</th>
                </tr>
              </thead>
              <tbody>
                {recentReports.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="p-2 border">{new Date(r.date).toLocaleDateString()}</td>
                    <td className="p-2 border">{r.class_name}</td>
                    <td className="p-2 border">{r.topic}</td>
                    <td className="p-2 border">{r.attendance_percentage ?? "—"}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
