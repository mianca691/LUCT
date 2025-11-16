import React, { useEffect, useState } from "react";
import api from "@/services/api.js";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, X, Users, FileText, CalendarCheck, BarChart2 } from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function PLReports() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reports, setReports] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [selectedReport, setSelectedReport] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch metrics
  const fetchMetrics = async () => {
    try {
      const res = await api.get("/pl/reports/metrics");
      setMetrics(res.data);
    } catch (err) {
      console.error("Error fetching metrics:", err);
      setError("Failed to load metrics.");
    }
  };

  // Fetch reports
  const fetchReports = async () => {
    try {
      const res = await api.get("/pl/reports");
      setReports(res.data);
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError("Failed to load reports.");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchMetrics(), fetchReports()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Modal handlers
  const openReportModal = (report) => setSelectedReport(report);
  const closeReportModal = () => setSelectedReport(null);

  // Filter reports based on search
  const filteredReports = reports.filter(
    (r) =>
      r.class_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.course_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.prl_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.lecturer_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );

  if (error)
    return (
      <div className="p-8 text-center text-red-500 space-y-4">
        <p>{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );

  // Helper for coloring attendance %
  const attendanceColor = (value) => {
    if (!value && value !== 0) return "text-muted-foreground";
    if (value >= 75) return "text-green-500";
    if (value >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="p-6 space-y-8">
      {/* Title */}
      <h1 className="text-3xl font-extrabold text-primary">Reports Dashboard</h1>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-primary/10 hover:scale-105 transition-transform">
          <CardContent className="flex flex-col items-center justify-center space-y-2">
            <FileText className="w-6 h-6 text-primary" />
            <CardTitle className="text-sm uppercase text-muted-foreground">Total Reports</CardTitle>
            <p className="text-2xl font-bold">{metrics.total_reports ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-accent/10 hover:scale-105 transition-transform">
          <CardContent className="flex flex-col items-center justify-center space-y-2">
            <CalendarCheck className="w-6 h-6 text-accent" />
            <CardTitle className="text-sm uppercase text-muted-foreground">Avg Attendance</CardTitle>
            <p className={`text-2xl font-bold ${attendanceColor(metrics.avg_attendance)}`}>
              {metrics.avg_attendance ?? "—"}%
            </p>
          </CardContent>
        </Card>
        <Card className="bg-secondary/10 hover:scale-105 transition-transform">
          <CardContent className="flex flex-col items-center justify-center space-y-2">
            <Users className="w-6 h-6 text-secondary" />
            <CardTitle className="text-sm uppercase text-muted-foreground">Avg Lecturer Rating</CardTitle>
            <p className="text-2xl font-bold">{metrics.avg_rating ?? "—"}</p>
          </CardContent>
        </Card>
        <Card className="bg-primary/10 hover:scale-105 transition-transform">
          <CardContent className="flex flex-col items-center justify-center space-y-2">
            <Users className="w-6 h-6 text-primary" />
            <CardTitle className="text-sm uppercase text-muted-foreground">Total Lecturers</CardTitle>
            <p className="text-2xl font-bold">{metrics.total_lecturers ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-accent/10 hover:scale-105 transition-transform">
          <CardContent className="flex flex-col items-center justify-center space-y-2">
            <BarChart2 className="w-6 h-6 text-accent" />
            <CardTitle className="text-sm uppercase text-muted-foreground">Total Classes</CardTitle>
            <p className="text-2xl font-bold">{metrics.total_classes ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search Input */}
      <div className="max-w-md">
        <Input
          placeholder="Search by Class, Course, PRL, Lecturer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="rounded-lg shadow-sm"
        />
      </div>

      {/* Reports Table */}
      <Card className="overflow-x-auto shadow-lg border border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Reports List</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm table-auto border-collapse">
            <thead>
              <tr className="bg-muted/20 text-left">
                {["PRL","Lecturer","Class","Course","Week","Date","Topic","Attendance","Action"].map((h) => (
                  <th key={h} className="p-2 border-b border-muted/30">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((r) => (
                <tr
                  key={r.id}
                  className="hover:bg-muted/10 transition cursor-pointer"
                  onClick={() => openReportModal(r)}
                >
                  <td className="p-2 border-b">{r.prl_name}</td>
                  <td className="p-2 border-b">{r.lecturer_name}</td>
                  <td className="p-2 border-b">{r.class_name}</td>
                  <td className="p-2 border-b">{r.course_name}</td>
                  <td className="p-2 border-b">{r.week ?? "—"}</td>
                  <td className="p-2 border-b">{r.date ? new Date(r.date).toLocaleDateString() : "—"}</td>
                  <td className="p-2 border-b">{r.topic?.slice(0,30) ?? "—"}</td>
                  <td className={`p-2 border-b font-bold ${attendanceColor(r.attendance_percentage)}`}>
                    {r.attendance_percentage ?? "—"}%
                  </td>
                  <td className="p-2 border-b text-center">
                    <Button size="sm" variant="outline">View</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-4">
          <CardTitle className="text-lg font-semibold mb-2">Reports per PRL</CardTitle>
          <CardContent style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reports}>
                <XAxis dataKey="prl_name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="id" name="Reports Count" fill="var(--color-primary)" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="p-4">
          <CardTitle className="text-lg font-semibold mb-2">Average Attendance by Class</CardTitle>
          <CardContent style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={reports.map(r => ({
                class_name: r.class_name,
                attendance_percentage: Number(r.attendance_percentage) || 0
              }))}>
                <XAxis dataKey="class_name" />
                <YAxis />
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="attendance_percentage"
                  stroke="var(--color-accent)"
                  strokeWidth={3}
                  dot={{ r: 5, fill: "var(--color-accent)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Report Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadeIn">
          <div className="bg-background dark:bg-card w-full max-w-2xl rounded-xl shadow-lg p-6 relative border border-border">
            <button className="absolute top-3 right-3" onClick={closeReportModal}>
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
            <h2 className="text-2xl font-bold mb-4">{selectedReport.class_name} - {selectedReport.lecturer_name}</h2>
            <div className="space-y-2">
              <p><strong>PRL:</strong> {selectedReport.prl_name}</p>
              <p><strong>Course:</strong> {selectedReport.course_name}</p>
              <p><strong>Week:</strong> {selectedReport.week ?? "—"}</p>
              <p><strong>Date:</strong> {selectedReport.date ? new Date(selectedReport.date).toLocaleDateString() : "—"}</p>
              <p><strong>Topic:</strong> {selectedReport.topic ?? "—"}</p>
              <p><strong>Learning Outcomes:</strong> {selectedReport.learning_outcomes ?? "—"}</p>
              <p><strong>Recommendations:</strong> {selectedReport.recommendations ?? "—"}</p>
              <p className={`font-bold ${attendanceColor(selectedReport.attendance_percentage)}`}>
                <strong>Attendance:</strong> {selectedReport.attendance_percentage ?? 0}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
