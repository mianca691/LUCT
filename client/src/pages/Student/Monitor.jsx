import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { Bar, Pie, Line } from "react-chartjs-2";
import Chart from "chart.js/auto";
import api from "@/services/api.js";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function Monitor() {
  const { token } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  const generateColors = (count) => {
    return Array.from({ length: count }, (_, i) => {
      const hue = (i * 60) % 360;
      return `hsl(${hue}, 75%, 55%)`;
    });
  };

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

  const classes = [...new Set(attendance.map((a) => a.class_name))];
  const colors = generateColors(classes.length);

  const classAttendance = classes.map((cls) => {
    const lectures = attendance.filter((a) => a.class_name === cls);
    const attended = lectures.filter((a) => a.student_status === "present").length;
    return Math.round((attended / lectures.length) * 100);
  });

  const summary = classes.map((cls) => {
    const lectures = attendance.filter((a) => a.class_name === cls);
    const attended = lectures.filter((a) => a.student_status === "present").length;
    return { className: cls, attended, total: lectures.length };
  });

  const weeklyMap = {};
  attendance.forEach((a) => {
    const week = new Date(a.date).toLocaleString("en-US", { week: "numeric" });
    if (!weeklyMap[week]) weeklyMap[week] = 0;
    if (a.student_status === "present") weeklyMap[week] += 1;
  });
  const weeklyLabels = Object.keys(weeklyMap);
  const weeklyData = Object.values(weeklyMap);

  const totalLectures = attendance.length;
  const totalPresent = attendance.filter((a) => a.student_status === "present").length;
  const totalAbsent = attendance.filter((a) => a.student_status === "absent").length;

  const breakdownChart = {
    labels: ["Present", "Absent"],
    datasets: [
      {
        data: [totalPresent, totalAbsent],
        backgroundColor: ["hsl(145, 65%, 50%)", "hsl(0, 65%, 55%)"],
        borderWidth: 0,
      },
    ],
  };

  const barChart = {
    labels: classes,
    datasets: [
      {
        label: "% Attendance",
        data: classAttendance,
        backgroundColor: colors,
        borderRadius: 6,
        barPercentage: 0.55,
      },
    ],
  };

  const weeklyChart = {
    labels: weeklyLabels,
    datasets: [
      {
        label: "Weekly Attendance",
        data: weeklyData,
        fill: false,
        tension: 0.35,
        borderWidth: 2,
        pointRadius: 4,
        borderColor: "hsl(220, 75%, 55%)",
        backgroundColor: "hsl(220, 75%, 55%)",
      },
    ],
  };

  return (
    <div className="p-6 space-y-8">
      <h2 className="text-3xl font-bold tracking-tight">Attendance Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Attendance % per Class</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <Bar data={barChart} options={{ responsive: true }} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="h-72 flex items-center justify-center">
            <Pie data={breakdownChart} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Attendance Trend</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <Line data={weeklyChart} options={{ responsive: true }} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lecture Details</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto max-h-96 rounded-md border border-border">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-muted/40 backdrop-blur-sm text-sm">
              <tr>
                <th className="p-2 border-r">Date</th>
                <th className="p-2 border-r">Class</th>
                <th className="p-2 border-r">Topic</th>
                <th className="p-2 border-r">Lecturer</th>
                <th className="p-2 border-r">Attended</th>
                <th className="p-2">Learning Outcomes</th>
              </tr>
            </thead>

            <tbody>
              {attendance.map((a, i) => (
                <tr key={i} className="hover:bg-accent/10 transition text-sm">
                  <td className="p-2">
                    {new Date(a.date).toLocaleDateString()}
                  </td>
                  <td className="p-2 font-medium">{a.class_name}</td>
                  <td className="p-2">{a.topic}</td>
                  <td className="p-2">{a.lecturer_name}</td>
                  <td className="p-2 text-center">
                    {a.student_status === "present" ? (
                      <span className="text-green-600">✔</span>
                    ) : a.student_status === "absent" ? (
                      <span className="text-red-500">✘</span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="p-2">{a.learning_outcomes || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
