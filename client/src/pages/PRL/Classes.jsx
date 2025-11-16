import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronDown, ChevronRight } from "lucide-react";
import api from "@/services/api.js";

// Helper: color-coded attendance
function attendanceColor(value) {
  if (value >= 75) return "bg-green-500";
  if (value >= 50) return "bg-yellow-400";
  return "bg-destructive";
}

export default function PRLClasses() {
  const [classes, setClasses] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchClasses = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/prl/classes");
      setClasses(res.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load classes data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const toggleExpand = (classId) => {
    setExpanded((prev) => ({ ...prev, [classId]: !prev[classId] }));
  };

  // ✅ Correct summary calculations
  const totalClasses = classes.length;
  const totalStudents = classes.reduce(
    (sum, cls) => sum + Number(cls.total_students || 0),
    0
  );
  const avgAttendance =
    classes.length > 0
      ? Math.round(
          classes.reduce((sum, cls) => sum + Number(cls.avg_attendance || 0), 0) /
            classes.length
        )
      : 0;

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
        <Button onClick={fetchClasses}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="p-10 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-semibold text-foreground tracking-tight">
          Classes Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Overview of your classes, students, and average attendance.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="bg-card border border-border shadow-sm p-4">
          <CardTitle className="text-lg font-medium text-foreground">Total Classes</CardTitle>
          <CardContent className="text-2xl font-bold text-primary mt-2">
            {totalClasses}
          </CardContent>
        </Card>
        <Card className="bg-card border border-border shadow-sm p-4">
          <CardTitle className="text-lg font-medium text-foreground">Total Students</CardTitle>
          <CardContent className="text-2xl font-bold text-accent mt-2">
            {totalStudents}
          </CardContent>
        </Card>
        <Card className="bg-card border border-border shadow-sm p-4">
          <CardTitle className="text-lg font-medium text-foreground">Average Attendance</CardTitle>
          <CardContent className="text-2xl font-bold text-secondary mt-2">
            {avgAttendance}%
          </CardContent>
        </Card>
      </div>

      {/* Classes Table */}
      {classes.length === 0 ? (
        <Card className="max-w-3xl mx-auto p-6 text-center text-muted-foreground">
          No classes available yet.
        </Card>
      ) : (
        <Card className="bg-card border border-border shadow-sm">
          <CardHeader>
            <CardTitle>Class Overview</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow className="bg-secondary text-secondary-foreground">
                  <TableCell />
                  <TableCell>Class Name</TableCell>
                  <TableCell>Course</TableCell>
                  <TableCell>Lecturer</TableCell>
                  <TableCell>Students</TableCell>
                  <TableCell>Avg Attendance</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.map((cls) => (
                  <React.Fragment key={cls.class_id}>
                    <TableRow
                      className="hover:bg-primary/10 transition-all cursor-pointer"
                      onClick={() => toggleExpand(cls.class_id)}
                    >
                      <TableCell className="w-8 text-center">
                        {expanded[cls.class_id] ? (
                          <ChevronDown className="w-4 h-4 text-foreground" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-foreground" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-foreground">{cls.class_name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {cls.course_name} ({cls.course_code})
                      </TableCell>
                      <TableCell className="text-muted-foreground">{cls.lecturer_name || "-"}</TableCell>
                      <TableCell className="text-foreground">{cls.total_students}</TableCell>
                      <TableCell className="w-40">
                        <div className="relative w-full h-4 bg-muted rounded">
                          <div
                            className={`h-4 rounded ${attendanceColor(cls.avg_attendance ?? 0)}`}
                            style={{ width: `${cls.avg_attendance ?? 0}%`, transition: "width 0.5s" }}
                          />
                          <span className="absolute inset-0 text-xs font-medium text-foreground flex items-center justify-center">
                            {Math.round(cls.avg_attendance ?? 0)}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Expandable Details Placeholder */}
                    {expanded[cls.class_id] && (
                      <TableRow className="bg-muted/20 text-sm text-muted-foreground">
                        <TableCell />
                        <TableCell colSpan={5} className="p-4">
                          {/* Future: detailed student stats, attendance chart, etc. */}
                          Detailed stats will appear here…
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
