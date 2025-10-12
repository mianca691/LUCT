import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext.jsx";
import api from "@/services/api.js";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";

export default function PRLReports() {
  const { token } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackReport, setFeedbackReport] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/prl/reports", {
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

  const openFeedback = (report) => {
    if (report.existing_feedback) return;
    setFeedbackReport(report);
    setFeedbackText("");
    setFeedbackOpen(true);
  };

  const closeFeedback = () => {
    setFeedbackOpen(false);
    setFeedbackReport(null);
    setFeedbackText("");
  };

  const submitFeedback = async () => {
    if (!feedbackText.trim()) return alert("Feedback cannot be empty");

    setSubmitting(true);
    try {
      await api.post(
        `/prl/reports/${feedbackReport.id}/feedback`,
        { comment: feedbackText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Feedback submitted successfully!");
      fetchReports();
      closeFeedback();
    } catch (err) {
      console.error(err);
      alert("Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

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
        <h1 className="text-2xl font-bold">Lecturer Reports</h1>
        <p className="text-gray-500">
          View all lecturer reports under your stream and provide feedback.
        </p>
      </div>

      {reports.length === 0 ? (
        <Card className="max-w-3xl mx-auto p-6 text-center text-gray-500">
          No reports available yet.
        </Card>
      ) : (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Reports List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="p-2 border">Date</th>
                    <th className="p-2 border">Class</th>
                    <th className="p-2 border">Course</th>
                    <th className="p-2 border">Lecturer</th>
                    <th className="p-2 border">Topic</th>
                    <th className="p-2 border">Attendance</th>
                    <th className="p-2 border text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50 transition cursor-default">
                      <td className="p-2 border">{new Date(r.date).toLocaleDateString()}</td>
                      <td className="p-2 border">{r.class_name}</td>
                      <td className="p-2 border">{r.course_name}</td>
                      <td className="p-2 border">{r.lecturer_name}</td>
                      <td className="p-2 border">{r.topic}</td>
                      <td className="p-2 border text-center">{r.attendance_percentage ?? "—"}%</td>
                      <td className="p-2 border text-center">
                        <Button
                          size="sm"
                          onClick={() => openFeedback(r)}
                          disabled={!!r.existing_feedback}
                        >
                          {r.existing_feedback ? "Feedback Sent" : "Add Feedback"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {feedbackOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-md rounded shadow-lg p-6 relative">
            <button
              className="absolute top-3 right-3"
              onClick={closeFeedback}
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
            <h2 className="text-xl font-semibold mb-4">
              Feedback for {feedbackReport.class_name} - {feedbackReport.lecturer_name}
            </h2>
            <textarea
              className="w-full border rounded p-2 mb-4"
              rows={5}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={closeFeedback}>
                Cancel
              </Button>
              <Button onClick={submitFeedback} disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Feedback"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
