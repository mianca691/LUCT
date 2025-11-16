import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext.jsx";
import api from "@/services/api.js";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function Reports() {
  const { token } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReports = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/lecturer/reports", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReports(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [token]);

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
        <Button onClick={fetchReports}>Retry</Button>
      </div>
    );
  }

  const getAttendanceColor = (percentage) => {
    if (percentage === null || percentage === undefined) return "text-muted-foreground";
    if (percentage >= 90) return "text-emerald-500 font-semibold";
    if (percentage >= 60) return "text-yellow-500 font-semibold";
    return "text-destructive font-semibold";
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Your Submitted Reports</h1>
        <p className="text-muted-foreground">
          View all the reports you've submitted.
        </p>
      </div>

      {/* Empty State */}
      {reports.length === 0 ? (
        <Card className="max-w-2xl mx-auto p-6 text-center text-muted-foreground">
          No reports submitted yet.
        </Card>
      ) : (
        <Card className="shadow-sm border border-border rounded-xl">
          <CardHeader>
            <CardTitle>Report History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-card-foreground/10 text-muted-foreground text-sm uppercase sticky top-0 z-10">
                  <tr>
                    <th className="p-2 border">Date</th>
                    <th className="p-2 border">Class</th>
                    <th className="p-2 border">Course</th>
                    <th className="p-2 border">Topic</th>
                    <th className="p-2 border text-center">Attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r, idx) => (
                    <tr
                      key={r.id}
                      className={`transition cursor-default hover:bg-accent/10 ${
                        idx % 2 === 0 ? "bg-background" : "bg-muted/5"
                      }`}
                    >
                      <td className="p-2 border text-foreground">
                        {new Date(r.date).toLocaleDateString()}
                      </td>
                      <td className="p-2 border text-foreground">{r.class_name}</td>
                      <td className="p-2 border text-foreground">{r.course_name}</td>
                      <td className="p-2 border text-foreground">{r.topic}</td>
                      <td className={`p-2 border text-center ${getAttendanceColor(r.attendance_percentage)}`}>
                        {r.attendance_percentage ?? "—"}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
