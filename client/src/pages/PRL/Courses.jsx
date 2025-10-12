import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import api from "@/services/api.js";
import { format } from "date-fns";

export default function PRLCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        <Button onClick={fetchCourses}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Courses</h1>
        <p className="text-gray-500">
          View all courses and associated classes under your stream.
        </p>
      </div>

      {courses.length === 0 ? (
        <Card className="max-w-3xl mx-auto p-6 text-center text-gray-500">
          No courses available for your stream.
        </Card>
      ) : (
        courses.map((course) => (
          <Card key={course.course_id} className="shadow-sm">
            <CardHeader>
              <CardTitle>
                {course.course_code} - {course.course_name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {course.classes.length === 0 ? (
                <p>No classes assigned.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableCell>Class Name</TableCell>
                        <TableCell>Lecturer</TableCell>
                        <TableCell>Time</TableCell>
                        <TableCell>Venue</TableCell>
                        <TableCell>Registered Students</TableCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {course.classes.map((cls) => (
                        <TableRow key={cls.id}>
                          <TableCell>{cls.class_name}</TableCell>
                          <TableCell>{cls.lecturer_name}</TableCell>
                          <TableCell>
                            {cls.scheduled_time
                              ? format(new Date(cls.scheduled_time), "dd MMM yyyy, HH:mm")
                              : "-"}
                          </TableCell>
                          <TableCell>{cls.venue || "-"}</TableCell>
                          <TableCell>{cls.total_registered_students}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
