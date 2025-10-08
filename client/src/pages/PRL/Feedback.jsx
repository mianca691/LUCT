import { useEffect, useState } from "react";
import api from "@/services/api.js";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Feedback() {
  const [reports, setReports] = useState([]);
  const [feedback, setFeedback] = useState({});

  const fetchReports = async () => {
    const res = await api.get("/reports");
    setReports(res.data);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleChange = (reportId, value) => {
    setFeedback({ ...feedback, [reportId]: value });
  };

  const handleSubmit = async (reportId) => {
    try {
      await api.post(`/reports/${reportId}/feedback`, {
        comment: feedback[reportId],
      });
      alert("Feedback submitted!");
    } catch (err) {
      console.error(err);
      alert("Failed to submit feedback");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Provide Feedback</h2>
      {reports.map((r) => (
        <div
          key={r.id}
          className="bg-white p-4 rounded-lg shadow flex flex-col gap-2"
        >
          <p>
            <strong>{r.topic}</strong> - {r.date}
          </p>
          <Input
            placeholder="Write feedback..."
            value={feedback[r.id] || ""}
            onChange={(e) => handleChange(r.id, e.target.value)}
          />
          <Button onClick={() => handleSubmit(r.id)}>Submit Feedback</Button>
        </div>
      ))}
    </div>
  );
}
