import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { Bar } from "react-chartjs-2";
import Chart from "chart.js/auto";

export default function Rating() {
  const { token } = useAuth();
  const [summary, setSummary] = useState([]);
  const [details, setDetails] = useState([]);

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/lecturer/ratings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch ratings");
        const data = await res.json();
        setSummary(data.summary);
        setDetails(data.details);
      } catch (err) {
        console.error(err);
      }
    };

    fetchRatings();
  }, [token]);

  const chartData = {
    labels: summary.map(s => s.course_name),
    datasets: [
      {
        label: "Average Rating",
        data: summary.map(s => s.avg_rating),
        backgroundColor: "rgba(255, 99, 132, 0.6)",
      },
    ],
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Lecturer Rating Overview</h2>
      <div className="bg-white shadow rounded p-4 mb-6">
        <Bar data={chartData} />
      </div>

      <h3 className="text-xl font-semibold mb-2">Student Feedback</h3>
      <table className="w-full border-collapse border text-sm">
        <thead>
          <tr>
            <th className="border p-2">Course</th>
            <th className="border p-2">Rating</th>
            <th className="border p-2">Comment</th>
            <th className="border p-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {details.map((d, i) => (
            <tr key={i}>
              <td className="border p-2">{d.course_name}</td>
              <td className="border p-2">{d.rating}</td>
              <td className="border p-2">{d.comment || "-"}</td>
              <td className="border p-2">{new Date(d.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
