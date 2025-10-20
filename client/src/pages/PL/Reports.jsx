import React, { useEffect, useState } from "react";
import api from "@/services/api.js";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, X } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function PLReports() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reports, setReports] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [selectedReport, setSelectedReport] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchMetrics = async () => {
    try {
      const res = await api.get("/pl/reports/metrics");
      setMetrics(res.data);
    } catch (err) {
      console.error("Error fetching metrics:", err);
      setError("Failed to load metrics.");
    }
  };

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

  const openReportModal = (report) => {
    setSelectedReport(report);
  };

  const closeReportModal = () => {
    setSelectedReport(null);
  };

  const filteredReports = reports.filter(
    (r) =>
      r.class_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.prl_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.lecturer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        <p>{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Reports Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4 text-center">
          <CardTitle>Total Reports</CardTitle>
          <CardContent className="text-2xl font-bold">{metrics.total_reports ?? 0}</CardContent>
        </Card>
        <Card className="p-4 text-center">
          <CardTitle>Avg Attendance (%)</CardTitle>
          <CardContent className="text-2xl font-bold">{metrics.avg_attendance ?? "—"}</CardContent>
        </Card>
        <Card className="p-4 text-center">
          <CardTitle>Avg Lecturer Rating</CardTitle>
          <CardContent className="text-2xl font-bold">{metrics.avg_rating ?? "—"}</CardContent>
        </Card>
        <Card className="p-4 text-center">
          <CardTitle>Total Lecturers</CardTitle>
          <CardContent className="text-2xl font-bold">{metrics.total_lecturers ?? 0}</CardContent>
        </Card>
        <Card className="p-4 text-center">
          <CardTitle>Total Classes</CardTitle>
          <CardContent className="text-2xl font-bold">{metrics.total_classes ?? 0}</CardContent>
        </Card>
      </div>

      <Input
        placeholder="Search by Class, Course, PRL, Lecturer..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-md"
      />

      <Card className="overflow-x-auto shadow-sm border">
        <CardHeader>
          <CardTitle>Reports List</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm border">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="p-2 border">PRL</th>
                <th className="p-2 border">Lecturer</th>
                <th className="p-2 border">Class</th>
                <th className="p-2 border">Course</th>
                <th className="p-2 border">Week</th>
                <th className="p-2 border">Date</th>
                <th className="p-2 border">Topic</th>
                <th className="p-2 border">Attendance</th>
                <th className="p-2 border text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 transition cursor-pointer" onClick={() => openReportModal(r)}>
                  <td className="p-2 border">{r.prl_name}</td>
                  <td className="p-2 border">{r.lecturer_name}</td>
                  <td className="p-2 border">{r.class_name}</td>
                  <td className="p-2 border">{r.course_name}</td>
                  <td className="p-2 border">{r.week ?? "—"}</td>
                  <td className="p-2 border">{new Date(r.date).toLocaleDateString()}</td>
                  <td className="p-2 border">{r.topic?.slice(0, 30) ?? "—"}</td>
                  <td className="p-2 border">{r.attendance_percentage ?? "—"}%</td>
                  <td className="p-2 border text-center">
                    <Button size="sm">View</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-4">
          <CardTitle>Reports per PRL</CardTitle>
          <CardContent style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reports}>
                <XAxis dataKey="prl_name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="id" name="Reports Count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="p-4">
          <CardTitle>Average Attendance by Class</CardTitle>
          <CardContent style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={reports}>
                <XAxis dataKey="class_name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="attendance_percentage" stroke="#10b981" name="Avg Attendance" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-2xl rounded shadow-lg p-6 relative">
            <button className="absolute top-3 right-3" onClick={closeReportModal}>
              <X className="w-5 h-5 text-gray-600" />
            </button>
            <h2 className="text-xl font-semibold mb-4">
              {selectedReport.class_name} - {selectedReport.lecturer_name}
            </h2>
            <p><strong>PRL:</strong> {selectedReport.prl_name}</p>
            <p><strong>Course:</strong> {selectedReport.course_name}</p>
            <p><strong>Week:</strong> {selectedReport.week}</p>
            <p><strong>Date:</strong> {new Date(selectedReport.date).toLocaleDateString()}</p>
            <p><strong>Topic:</strong> {selectedReport.topic}</p>
            <p><strong>Learning Outcomes:</strong> {selectedReport.learning_outcomes ?? "—"}</p>
            <p><strong>Recommendations:</strong> {selectedReport.recommendations ?? "—"}</p>
            <p><strong>Attendance:</strong> {selectedReport.attendance_percentage ?? "—"}%</p>
          </div>
        </div>
      )}
    </div>
  );
}
