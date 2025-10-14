import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import api from "@/services/api.js";

export default function PRLClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchClasses = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/prl/classes");
      setClasses(res.data);
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

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );

  if (error)
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchClasses}>Retry</Button>
      </div>
    );

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Classes</h1>
      </div>

      {classes.length === 0 ? (
        <Card className="max-w-3xl mx-auto p-6 text-center text-gray-500">
          No classes available yet.
        </Card>
      ) : (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Class Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableCell>Class Name</TableCell>
                    <TableCell>Course</TableCell>
                    <TableCell>Lecturer</TableCell>
                    <TableCell>Students</TableCell>
                    <TableCell>Avg Attendance</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classes.map((cls) => (
                    <TableRow key={cls.class_id}>
                      <TableCell>{cls.class_name}</TableCell>
                      <TableCell>{cls.course_name} ({cls.course_code})</TableCell>
                      <TableCell>{cls.lecturer_name || "-"}</TableCell>
                      <TableCell>{cls.total_students}</TableCell>
                      <TableCell>
                        <div className="w-full bg-gray-200 rounded h-4 relative">
                          <div
                            className="bg-primary h-4 rounded"
                            style={{ width: `${cls.avg_attendance ?? 0}%` }}
                          />
                          <span className="absolute inset-0 text-xs font-medium text-black flex items-center justify-center">
                            {Math.round(cls.avg_attendance ?? 0)}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
