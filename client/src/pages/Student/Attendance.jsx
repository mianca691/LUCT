import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext.jsx";
import api from "@/services/api.js";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function Attendance() {
  const { token } = useAuth();

  const [reports, setReports] = useState([]);
  const [attendanceStatus, setAttendanceStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.get("/student/reports/enrolled", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReports(res.data);

      const statusMap = {};
      res.data.forEach((r) => {
        statusMap[r.id] = r.student_status || null;
      });
      setAttendanceStatus(statusMap);
    } catch (err) {
      console.error("Failed to fetch reports", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [token]);

  const handleMarkAttendance = async (reportId, status) => {
    try {
      await api.post(
        "/student/attendance",
        { report_id: reportId, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAttendanceStatus({ ...attendanceStatus, [reportId]: status });
    } catch (err) {
      console.error(err);
      alert("Failed to update attendance");
    }
  };

  const filteredReports = useMemo(() => {
    if (filter === "today") {
      const today = new Date().toDateString();
      return reports.filter((r) => new Date(r.date).toDateString() === today);
    }
    if (filter === "week") {
      const now = new Date();
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);

      return reports.filter((r) => {
        const rd = new Date(r.date);
        return rd >= weekAgo && rd <= now;
      });
    }
    return reports;
  }, [filter, reports]);

  const stats = useMemo(() => {
    const total = reports.length;
    const pending = Object.values(attendanceStatus).filter((v) => !v).length;
    const markedToday = reports.filter((r) => {
      const status = attendanceStatus[r.id];
      const today = new Date().toDateString();
      return status && new Date(r.date).toDateString() === today;
    }).length;

    return {
      total,
      pending,
      markedToday,
    };
  }, [reports, attendanceStatus]);

  if (loading)
    return <p className="p-8 text-center">Loading attendance...</p>;

  return (
    <div className="p-8 space-y-10">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">
          Attendance Overview
        </h1>
        <p className="text-muted-foreground">
          Review your lectures and update your attendance status.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Lectures</p>
            <p className="text-2xl font-semibold">{stats.total}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Pending Attendance</p>
            <p className="text-2xl font-semibold">{stats.pending}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Marked Today</p>
            <p className="text-2xl font-semibold">{stats.markedToday}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3">
        {["all", "today", "week"].map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            onClick={() => setFilter(f)}
            className="capitalize"
          >
            {f === "all" ? "All Lectures" : f === "today" ? "Today" : "This Week"}
          </Button>
        ))}
      </div>

      <Separator />

      {filteredReports.length === 0 ? (
        <p className="text-muted-foreground">No lecture reports found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredReports.map((r) => {
            const status = attendanceStatus[r.id];

            return (
              <Card
                key={r.id}
                className={`transition-all border-l-4 ${
                  status === "present"
                    ? "border-green-500"
                    : status === "absent"
                    ? "border-red-500"
                    : "border-gray-400"
                }`}
              >
                <CardHeader>
                  <h2 className="text-lg font-semibold">{r.class_name}</h2>
                  <p className="text-sm text-muted-foreground">{r.topic}</p>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                      {new Date(r.date).toLocaleDateString()}
                    </p>

                    <Badge
                      variant={
                        status === "present"
                          ? "success"
                          : status === "absent"
                          ? "destructive"
                          : "outline"
                      }
                      className="capitalize"
                    >
                      {status || "Not Marked"}
                    </Badge>
                  </div>

                  <div className="flex gap-3">
                    {!status ? (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => handleMarkAttendance(r.id, "present")}
                          className="flex-1"
                        >
                          Present
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleMarkAttendance(r.id, "absent")}
                          className="flex-1"
                        >
                          Absent
                        </Button>
                      </>
                    ) : (
                      <Button disabled className="w-full">
                        Attendance Marked
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
