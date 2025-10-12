import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { Bar } from "react-chartjs-2";
import Chart from "chart.js/auto";
import api from "@/services/api.js";

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

  if (loading) return <p>Loading...</p>;

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
        backgroundColor: "rgba(54, 162, 235, 0.6)",
      },
    ],
  };

  const summary = classes.map(cls => {
    const lectures = attendance.filter(a => a.class_name === cls);
    const attended = lectures.filter(a => a.student_status === "present").length;
    return { className: cls, attended, total: lectures.length };
  });

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold mb-4">Your Attendance Overview</h2>

      <Bar data={chartData} />

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Attendance Summary</h3>
        <table className="w-full border-collapse border">
          <thead>
            <tr>
              <th className="border p-2">Class</th>
              <th className="border p-2">Lectures Attended</th>
              <th className="border p-2">Total Lectures</th>
              <th className="border p-2">% Attendance</th>
            </tr>
          </thead>
          <tbody>
            {summary.map((s, idx) => (
              <tr key={idx}>
                <td className="border p-2">{s.className}</td>
                <td className="border p-2">{s.attended}</td>
                <td className="border p-2">{s.total}</td>
                <td className="border p-2">{Math.round((s.attended / s.total) * 100)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Lecture Details</h3>
        <table className="w-full border-collapse border">
          <thead>
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
              <tr key={idx}>
                <td className="border p-2">{new Date(a.date).toLocaleDateString()}</td>
                <td className="border p-2">{a.class_name}</td>
                <td className="border p-2">{a.topic}</td>
                <td className="border p-2">{a.lecturer_name}</td>
                <td className="border p-2">
                  {a.student_status === "present"
                    ? "✅"
                    : a.student_status === "absent"
                    ? "❌"
                    : "-"}
                </td>
                <td className="border p-2">{a.learning_outcomes || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
