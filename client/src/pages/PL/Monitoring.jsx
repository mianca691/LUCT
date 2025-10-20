import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import api from "@/services/api.js";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export default function Monitoring() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [metrics, setMetrics] = useState({
    totalCourses: 0,
    totalClasses: 0,
    totalLecturers: 0,
    avgRating: 0,
    avgAttendance: 0,
  });
  const [classes, setClasses] = useState([]);
  const [lecturers, setLecturers] = useState([]);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A569BD"];

  const fetchMetrics = async () => {
    try {
      const res = await api.get("/pl/monitoring/metrics");
      setMetrics(res.data);
    } catch (err) {
      console.error("Error fetching metrics:", err);
      setError("Failed to load metrics.");
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await api.get("/pl/monitoring/classes");
      setClasses(res.data);
    } catch (err) {
      console.error("Error fetching classes:", err);
      setError("Failed to load classes.");
    }
  };

  const fetchLecturers = async () => {
    try {
      const res = await api.get("/pl/monitoring/lecturers");
      setLecturers(res.data);
    } catch (err) {
      console.error("Error fetching lecturers:", err);
      setError("Failed to load lecturers.");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchMetrics(), fetchClasses(), fetchLecturers()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (error) return <div className="text-center text-red-500 p-8">{error}</div>;

  const classesPerCourse = classes.reduce((acc, cl) => {
    const course = acc.find(c => c.course_name === cl.course_name);
    if (course) course.count += 1;
    else acc.push({ course_name: cl.course_name, count: 1 });
    return acc;
  }, []);

  const lecturerWorkload = lecturers.map((l, idx) => ({
    name: l.name,
    value: l.classes_count ?? 0,
    color: COLORS[idx % COLORS.length],
  }));

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Monitoring Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(metrics).map(([key, value]) => (
          <Card key={key} className="p-4 text-center">
            <CardTitle className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</CardTitle>
            <CardContent className="text-2xl font-bold">{value ?? "—"}</CardContent>
          </Card>
        ))}
      </div>

      <Card className="p-4">
        <CardHeader>
          <CardTitle>Classes Per Course</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={classesPerCourse}>
              <XAxis dataKey="course_name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#0088FE" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Lecturer Workload Pie Chart */}
      <Card className="p-4">
        <CardHeader>
          <CardTitle>Lecturer Workload</CardTitle>
        </CardHeader>
        <CardContent className="h-64 flex justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={lecturerWorkload} dataKey="value" nameKey="name" outerRadius={80} label>
                {lecturerWorkload.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="overflow-x-auto shadow-sm border">
        <CardHeader><CardTitle>Classes Overview</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>Class Name</TableCell>
                <TableCell>Course</TableCell>
                <TableCell>Lecturer</TableCell>
                <TableCell>Scheduled Time</TableCell>
                <TableCell>Total Students</TableCell>
                <TableCell>Avg Attendance</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.map(cl => (
                <TableRow key={cl.id}>
                  <TableCell>{cl.class_name}</TableCell>
                  <TableCell>{cl.course_name}</TableCell>
                  <TableCell>{cl.lecturer_name || "N/A"}</TableCell>
                  <TableCell>{cl.scheduled_time || "Not Yet Scheduled"}</TableCell>
                  <TableCell>{cl.total_registered_students ?? 0}</TableCell>
                  <TableCell>{cl.avg_attendance ?? "-"}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="overflow-x-auto shadow-sm border">
        <CardHeader><CardTitle>Lecturer Performance</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Courses Assigned</TableCell>
                <TableCell>Classes Assigned</TableCell>
                <TableCell>Average Rating</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lecturers.map(l => (
                <TableRow key={l.id}>
                  <TableCell>{l.name}</TableCell>
                  <TableCell>{l.courses_count ?? 0}</TableCell>
                  <TableCell>{l.classes_count ?? 0}</TableCell>
                  <TableCell>{l.rating ?? "Not Yet Rated"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
