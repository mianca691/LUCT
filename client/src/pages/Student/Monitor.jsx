import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { Bar } from "react-chartjs-2";
import Chart from "chart.js/auto";
import api from "@/services/api.js";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function Monitor() {
  const { token } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await api.get("/student/reports/enrolled", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAttendance(res.data);
      } catch (err) {
        console.error("Failed to fetch attendance:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [token]);

  if (loading) return <p className="text-center py-8">Loading...</p>;

  const classes = [...new Set(attendance.map(a => a.class_name))];
  const classAttendance = classes.map(cls => {
    const lectures = attendance.filter(a => a.class_name === cls);
    const attended = lectures.filter(a => a.student_status === "present").length;
    return Math.round((attended / lectures.length) * 100);
  });

  const chartData = {
    labels: classes,
    datasets: [
      {
        label: "% Attendance",
        data: classAttendance,
        backgroundColor: "rgba(59, 130, 246, 0.6)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 1,
      },
    ],
  };

  const summary = classes.map(cls => {
    const lectures = attendance.filter(a => a.class_name === cls);
    const attended = lectures.filter(a => a.student_status === "present").length;
    return { className: cls, attended, total: lectures.length };
  });

  return (
    <div className="p-6 space-y-8">
      <h2 className="text-2xl font-bold mb-4">Your Attendance Overview</h2>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Attendance % per Class</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <Bar data={chartData} />
        </CardContent>
      </Card>

      {/* Attendance Summary */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Attendance Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {summary.map((s, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between">
                <span className="font-medium">{s.className}</span>
                <span>{Math.round((s.attended / s.total) * 100)}%</span>
              </div>
              <Progress value={(s.attended / s.total) * 100} className="h-3 rounded" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Lecture Details */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Lecture Details</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto max-h-96">
          <table className="w-full text-left border-collapse border">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="border p-2">Date</th>
                <th className="border p-2">Class</th>
                <th className="border p-2">Topic</th>
                <th className="border p-2">Lecturer</th>
                <th className="border p-2">Attended</th>
                <th className="border p-2">Learning Outcomes</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((a, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="border p-2">{new Date(a.date).toLocaleDateString()}</td>
                  <td className="border p-2">{a.class_name}</td>
                  <td className="border p-2">{a.topic}</td>
                  <td className="border p-2">{a.lecturer_name}</td>
                  <td className="border p-2 text-center">
                    {a.student_status === "present" ? "✅" : a.student_status === "absent" ? "❌" : "-"}
                  </td>
                  <td className="border p-2">{a.learning_outcomes || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
