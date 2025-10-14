import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
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
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchMonitoring}>Retry</Button>
      </div>
    );
  }

  if (monitoring.length === 0) {
    return (
      <div className="p-8 text-center">
        <Card className="max-w-3xl mx-auto p-6 text-gray-500">
          No monitoring data available yet.
        </Card>
      </div>
    );
  }

  const attendanceData = monitoring.map((cls) => ({
    name: cls.class_name,
    Attendance: cls.attendance_percentage ?? 0,
  }));

  const reportsData = monitoring.map((cls) => ({
    name: cls.class_name,
    "Reports Submitted": cls.reports_submitted ?? 0,
    "Total Students": cls.total_students ?? 0,
  }));

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Monitoring Dashboard</h1>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Attendance % per Class</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={attendanceData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis unit="%" />
              <Tooltip />
              <Legend />
              <Bar dataKey="Attendance" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Reports Submitted vs Total Students</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={reportsData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Reports Submitted" fill="#10b981" />
              <Bar dataKey="Total Students" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
