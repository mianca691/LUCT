import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import api from "@/services/api.js";

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

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Monitoring</h1>
        <p className="text-gray-500">
          Overview of student progress for all classes under your stream.
        </p>
      </div>

      {monitoring.length === 0 ? (
        <Card className="max-w-3xl mx-auto p-6 text-center text-gray-500">
          No monitoring data available yet.
        </Card>
      ) : (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Classes Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableCell>Class Name</TableCell>
                    <TableCell>Course</TableCell>
                    <TableCell>Lecturer</TableCell>
                    <TableCell>Attendance %</TableCell>
                    <TableCell>Reports Submitted</TableCell>
                    <TableCell>Total Students</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monitoring.map((cls) => (
                    <TableRow key={cls.class_id}>
                      <TableCell>{cls.class_name}</TableCell>
                      <TableCell>
                        {cls.course_name} ({cls.course_code})
                      </TableCell>
                      <TableCell>{cls.lecturer_name || "-"}</TableCell>

                      <TableCell>
                        <div className="w-full bg-gray-200 rounded h-4 relative">
                          <div
                            className="bg-primary h-4 rounded"
                            style={{ width: `${cls.attendance_percentage ?? 0}%` }}
                          />
                          <span className="absolute inset-0 text-xs font-medium text-black flex items-center justify-center">
                            {cls.attendance_percentage ?? 0}%
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        {cls.reports_submitted} report{cls.reports_submitted !== 1 ? "s" : ""}
                      </TableCell>

                      <TableCell>{cls.total_students}</TableCell>
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
