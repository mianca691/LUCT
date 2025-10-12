import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext.jsx";
import api from "@/services/api.js";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Attendance() {
  const { token } = useAuth();

  const [reports, setReports] = useState([]);
  const [attendanceStatus, setAttendanceStatus] = useState({});
  const [loading, setLoading] = useState(true);

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

  if (loading) return <p className="p-8 text-center">Loading reports...</p>;

  return (
    <div className="p-8 space-y-6">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <h2 className="text-xl font-semibold text-center">Mark Your Attendance</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          {reports.length === 0 ? (
            <p>No lecture reports available for your classes.</p>
          ) : (
            <table className="w-full border text-sm">
              <thead>
                <tr>
                  <th className="border p-2">Class</th>
                  <th className="border p-2">Topic</th>
                  <th className="border p-2">Date</th>
                  <th className="border p-2">Status</th>
                  <th className="border p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id}>
                    <td className="border p-2">{r.class_name}</td>
                    <td className="border p-2">{r.topic}</td>
                    <td className="border p-2">{new Date(r.date).toLocaleDateString()}</td>
                    <td className="border p-2 capitalize">
                      {attendanceStatus[r.id] || "Not marked"}
                    </td>
                    <td className="border p-2 space-x-2">
                      {!attendanceStatus[r.id] && (
                        <>
                          <Button
                            variant="outline"
                            onClick={() => handleMarkAttendance(r.id, "present")}
                          >
                            Present
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleMarkAttendance(r.id, "absent")}
                          >
                            Absent
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
