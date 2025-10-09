import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { Bar } from "react-chartjs-2";
import Chart from "chart.js/auto";

export default function Monitor() {
  const { token } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/student/attendance`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch attendance");
        const data = await res.json();
        setAttendance(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [token]);

  if (loading) return <p>Loading...</p>;

  // Prepare chart data: % attendance per course
  const courses = [...new Set(attendance.map(a => a.course_name))];
  const courseAttendance = courses.map(course => {
    const lectures = attendance.filter(a => a.course_name === course);
    const attended = lectures.filter(a => a.your_attendance).length;
    return Math.round((attended / lectures.length) * 100);
  });

  const chartData = {
    labels: courses,
    datasets: [
      {
        label: "% Attendance",
        data: courseAttendance,
        backgroundColor: "rgba(54, 162, 235, 0.6)",
      },
    ],
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Your Attendance Overview</h2>
      <Bar data={chartData} />
      <div className="mt-6">
        <h3 className="font-semibold mb-2">Lecture Details</h3>
        <table className="w-full border-collapse border">
          <thead>
            <tr>
              <th className="border p-2">Date</th>
              <th className="border p-2">Course</th>
              <th className="border p-2">Topic</th>
              <th className="border p-2">Learning Outcomes</th>
              <th className="border p-2">Attended</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map((a, idx) => (
              <tr key={idx}>
                <td className="border p-2">{a.date}</td>
                <td className="border p-2">{a.course_name}</td>
                <td className="border p-2">{a.topic}</td>
                <td className="border p-2">{a.learning_outcomes}</td>
                <td className="border p-2">{a.your_attendance ? "✅" : "❌"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
