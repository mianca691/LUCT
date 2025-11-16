import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";
import api from "@/services/api.js";

export default function PRLCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal state
  const [viewOpen, setViewOpen] = useState(false);
  const [viewClass, setViewClass] = useState(null);

  const fetchCourses = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/prl/courses");
      setCourses(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load courses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const formatTime = (timeStr) => {
    if (!timeStr) return "-";
    const [hours, minutes] = timeStr.split(":");
    return `${hours}:${minutes}`;
  };

  // Flatten all classes
  const allClasses = courses.flatMap((course) =>
    course.classes.map((cls) => ({
      ...cls,
      course_code: course.course_code,
      course_name: course.course_name,
    }))
  );

  const totalClasses = allClasses.length;
  const totalStudents = allClasses.reduce(
    (sum, cls) => sum + cls.total_registered_students,
    0
  );

  // Modal handlers
  const openView = (cls) => {
    setViewClass(cls);
    setViewOpen(true);
  };

  const closeView = () => {
    setViewClass(null);
    setViewOpen(false);
  };

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
        <Button onClick={fetchCourses}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="p-10 space-y-8 bg-background min-h-screen text-foreground">
      {/* Page Title */}
      <h1 className="text-3xl font-semibold tracking-tight">
        Courses Overview
      </h1>
      <p className="text-muted-foreground mt-1">
        Overview of all courses and classes
      </p>

      {/* Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-6">
        <Card className="bg-card border border-border p-4 text-center">
          <CardTitle>Total Courses</CardTitle>
          <p className="text-xl font-bold">{courses.length}</p>
        </Card>
        <Card className="bg-card border border-border p-4 text-center">
          <CardTitle>Total Classes</CardTitle>
          <p className="text-xl font-bold">{totalClasses}</p>
        </Card>
        <Card className="bg-card border border-border p-4 text-center">
          <CardTitle>Registered Students</CardTitle>
          <p className="text-xl font-bold">{totalStudents}</p>
        </Card>
      </div>

      {/* Unified Classes Table */}
      {allClasses.length === 0 ? (
        <Card className="bg-card border border-border p-6 text-center text-muted-foreground">
          No classes available for your courses.
        </Card>
      ) : (
        <Card className="bg-card border border-border shadow-sm mt-4">
          <CardHeader>
            <CardTitle>All Classes</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-muted text-muted-foreground uppercase text-xs">
                  <TableCell>Course</TableCell>
                  <TableCell>Class Name</TableCell>
                  <TableCell>Lecturer</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Venue</TableCell>
                  <TableCell className="text-center">Registered Students</TableCell>
                  <TableCell className="text-center">Status</TableCell>
                  <TableCell className="text-center">Action</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allClasses.map((cls) => {
                  const isFull = cls.total_registered_students >= cls.capacity;
                  return (
                    <TableRow
                      key={cls.id}
                      className="hover:bg-muted/20 transition cursor-default"
                    >
                      <TableCell className="font-semibold text-primary">
                        {cls.course_code} - {cls.course_name}
                      </TableCell>
                      <TableCell>{cls.class_name}</TableCell>
                      <TableCell>{cls.lecturer_name}</TableCell>
                      <TableCell>{formatTime(cls.scheduled_time)}</TableCell>
                      <TableCell>{cls.venue || "-"}</TableCell>
                      <TableCell className="text-center">{cls.total_registered_students}</TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            isFull
                              ? "bg-destructive text-destructive-foreground"
                              : "bg-accent text-accent-foreground"
                          }`}
                        >
                          {isFull ? "Full" : "Available"}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button size="sm" onClick={() => openView(cls)}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* View Modal */}
      {viewOpen && viewClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card w-full max-w-lg rounded shadow-lg p-6 relative">
            <button
              className="absolute top-3 right-3"
              onClick={closeView}
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
            <h2 className="text-xl font-semibold mb-4">
              {viewClass.course_code} - {viewClass.course_name} <br />
              {viewClass.class_name}
            </h2>
            <p><strong>Lecturer:</strong> {viewClass.lecturer_name}</p>
            <p><strong>Time:</strong> {formatTime(viewClass.scheduled_time)}</p>
            <p><strong>Venue:</strong> {viewClass.venue || "-"}</p>
            <p><strong>Registered Students:</strong> {viewClass.total_registered_students}</p>
            <p><strong>Status:</strong> {viewClass.total_registered_students >= viewClass.capacity ? "Full" : "Available"}</p>
            <div className="flex justify-end mt-4">
              <Button variant="secondary" onClick={closeView}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
