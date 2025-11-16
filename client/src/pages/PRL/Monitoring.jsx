import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import api from "@/services/api.js";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

export default function PRLMonitoring() {
  const [monitoring, setMonitoring] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMonitoring = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/prl/monitoring");
      setMonitoring(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load monitoring data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitoring();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={fetchMonitoring}>Retry</Button>
      </div>
    );
  }

  if (!monitoring || monitoring.length === 0) {
    return (
      <div className="p-8 text-center">
        <Card className="max-w-3xl mx-auto p-6 text-muted-foreground">
          No monitoring data available yet.
        </Card>
      </div>
    );
  }

  // --- Summary stats with proper numeric conversion ---
  const totalClasses = monitoring.length;
  const totalStudents = monitoring.reduce(
    (sum, cls) => sum + Number(cls.total_students ?? 0),
    0
  );
  const totalReports = monitoring.reduce(
    (sum, cls) => sum + Number(cls.reports_submitted ?? 0),
    0
  );
  const avgAttendance =
    monitoring.reduce(
      (sum, cls) => sum + Number(cls.attendance_percentage ?? 0),
      0
    ) / totalClasses;

  const nf = new Intl.NumberFormat(); // for thousands separators

  // --- Chart data ---
  const attendanceData = monitoring.map((cls) => ({
    name: cls.class_name,
    Attendance: Number(cls.attendance_percentage ?? 0),
  }));

  const reportsData = monitoring.map((cls) => ({
    name: cls.class_name,
    "Reports Submitted": Number(cls.reports_submitted ?? 0),
    "Total Students": Number(cls.total_students ?? 0),
  }));

  return (
    <div className="p-10 space-y-8 bg-background min-h-screen text-foreground">
      {/* Page Header */}
      <h1 className="text-3xl font-semibold tracking-tight">
        Monitoring Dashboard
      </h1>
      <p className="text-muted-foreground mt-1">
        Overview of attendance and report submissions
      </p>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
        <Card className="bg-card border border-border p-4 text-center shadow-sm">
          <CardTitle>Total Classes</CardTitle>
          <p className="text-xl font-bold">{nf.format(totalClasses)}</p>
        </Card>
        <Card className="bg-card border border-border p-4 text-center shadow-sm">
          <CardTitle>Total Students</CardTitle>
          <p className="text-xl font-bold">{nf.format(totalStudents)}</p>
        </Card>
        <Card className="bg-card border border-border p-4 text-center shadow-sm">
          <CardTitle>Reports Submitted</CardTitle>
          <p className="text-xl font-bold">{nf.format(totalReports)}</p>
        </Card>
        <Card className="bg-card border border-border p-4 text-center shadow-sm">
          <CardTitle>Average Attendance</CardTitle>
          <p className="text-xl font-bold">{avgAttendance.toFixed(1)}%</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Chart */}
        <Card className="bg-card border border-border shadow-sm h-80">
          <CardHeader>
            <CardTitle>Attendance % per Class</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={attendanceData}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--muted)" />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" />
                <YAxis unit="%" stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    color: "var(--foreground)",
                  }}
                />
                <Legend wrapperStyle={{ color: "var(--muted-foreground)" }} />
                <Bar dataKey="Attendance" fill="var(--primary)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Reports Chart */}
        <Card className="bg-card border border-border shadow-sm h-80">
          <CardHeader>
            <CardTitle>Reports Submitted vs Total Students</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={reportsData}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--muted)" />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    color: "var(--foreground)",
                  }}
                />
                <Legend wrapperStyle={{ color: "var(--muted-foreground)" }} />
                <Bar dataKey="Reports Submitted" fill="var(--accent)" />
                <Bar dataKey="Total Students" fill="var(--secondary)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
