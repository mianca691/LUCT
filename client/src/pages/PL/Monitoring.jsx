import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import api from "@/services/api.js";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

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

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );

  if (error)
    return (
      <div className="text-center text-destructive p-8 font-medium">{error}</div>
    );

  // Process chart data
  const classesPerCourse = classes.reduce((acc, cl) => {
    const course = acc.find((c) => c.course_name === cl.course_name);
    if (course) course.count += 1;
    else acc.push({ course_name: cl.course_name, count: 1 });
    return acc;
  }, []);

  const lecturerWorkload = lecturers.map((l, idx) => ({
    name: l.name,
    value: l.classes_count ?? 0,
    color: `var(--chart-${(idx % 5) + 1})`,
  }));

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold text-primary mb-4">
        Monitoring Dashboard
      </h1>

      {/* Metrics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Grouping metrics: Courses & Classes */}
        <Card className="p-5 text-center bg-card rounded-lg shadow-md">
          <CardTitle className="capitalize text-secondary-foreground text-sm">
            Total Courses
          </CardTitle>
          <CardContent className="text-3xl font-bold text-primary">
            {metrics.totalCourses ?? "—"}
          </CardContent>
        </Card>

        <Card className="p-5 text-center bg-card rounded-lg shadow-md">
          <CardTitle className="capitalize text-secondary-foreground text-sm">
            Total Classes
          </CardTitle>
          <CardContent className="text-3xl font-bold text-primary">
            {metrics.totalClasses ?? "—"}
          </CardContent>
        </Card>

        {/* Grouping metrics: Lecturers & Ratings */}
        <Card className="p-5 text-center bg-card rounded-lg shadow-md">
          <CardTitle className="capitalize text-secondary-foreground text-sm">
            Total Lecturers
          </CardTitle>
          <CardContent className="text-3xl font-bold text-primary">
            {metrics.totalLecturers ?? "—"}
          </CardContent>
        </Card>

        <Card className="p-5 text-center bg-card rounded-lg shadow-md">
          <CardTitle className="capitalize text-secondary-foreground text-sm">
            Avg Rating
          </CardTitle>
          <CardContent className="text-3xl font-bold text-accent">
            {metrics.avgRating ?? "—"}
          </CardContent>
        </Card>

        <Card className="p-5 text-center bg-card rounded-lg shadow-md">
          <CardTitle className="capitalize text-secondary-foreground text-sm">
            Avg Attendance
          </CardTitle>
          <CardContent className="text-3xl font-bold text-accent">
            {metrics.avgAttendance ?? "—"}%
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lecturer Workload Pie Chart */}
        <Card className="p-4 bg-card rounded-lg shadow-md">
          <CardHeader>
            <CardTitle>Lecturer Workload</CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={lecturerWorkload}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={90}
                  label
                >
                  {lecturerWorkload.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Classes Per Course Bar Chart */}
        <Card className="p-4 bg-card rounded-lg shadow-md">
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
                <Bar dataKey="count" fill="var(--chart-1)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tables Section */}
      <div className="space-y-6">
        {/* Lecturer Performance First */}
        <Card className="overflow-x-auto shadow-sm border rounded-lg">
          <CardHeader>
            <CardTitle>Lecturer Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/20">
                  <TableCell>Name</TableCell>
                  <TableCell>Courses Assigned</TableCell>
                  <TableCell>Classes Assigned</TableCell>
                  <TableCell>Average Rating</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lecturers.map((l) => (
                  <TableRow key={l.id} className="hover:bg-muted/10">
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

        {/* Classes Overview Second */}
        <Card className="overflow-x-auto shadow-sm border rounded-lg">
          <CardHeader>
            <CardTitle>Classes Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/20">
                  <TableCell>Class Name</TableCell>
                  <TableCell>Course</TableCell>
                  <TableCell>Lecturer</TableCell>
                  <TableCell>Scheduled Time</TableCell>
                  <TableCell>Total Students</TableCell>
                  <TableCell>Avg Attendance</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.map((cl) => (
                  <TableRow key={cl.id} className="hover:bg-muted/10">
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
      </div>
    </div>
  );
}
