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
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchReports}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Your Submitted Reports</h1>
        <p className="text-gray-500">View all the reports you've submitted.</p>
      </div>

      {reports.length === 0 ? (
        <Card className="max-w-2xl mx-auto p-6 text-center text-gray-500">
          No reports submitted yet.
        </Card>
      ) : (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Report History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="p-2 border">Date</th>
                    <th className="p-2 border">Class</th>
                    <th className="p-2 border">Course</th>
                    <th className="p-2 border">Topic</th>
                    <th className="p-2 border text-center">Attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr
                      key={r.id}
                      className="hover:bg-gray-50 transition cursor-default"
                    >
                      <td className="p-2 border">
                        {new Date(r.date).toLocaleDateString()}
                      </td>
                      <td className="p-2 border">{r.class_name}</td>
                      <td className="p-2 border">{r.course_name}</td>
                      <td className="p-2 border">{r.topic}</td>
                      <td className="p-2 border text-center">
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
