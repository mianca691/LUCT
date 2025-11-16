import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext.jsx";
import api from "@/services/api.js";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, X, MessageSquare } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function PRLReports() {
  const { token } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackReport, setFeedbackReport] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState("all");

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

  const filteredReports = reports.filter((r) => {
    if (filter === "pending") return !r.existing_feedback;
    if (filter === "completed") return !!r.existing_feedback;
    return true;
  });

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

  const summary = {
    total: reports.length,
    pending: reports.filter((r) => !r.existing_feedback).length,
    completed: reports.filter((r) => !!r.existing_feedback).length,
  };

  return (
    <div className="p-10 space-y-8 bg-background min-h-screen text-foreground">
      {/* Page Title */}
      <h1 className="text-3xl font-semibold tracking-tight">
        Lecturer Reports Overview
      </h1>

      {/* Summary Row */}
      <div className="grid grid-cols-3 gap-6">
        <Card className="bg-card border border-border p-4 text-center">
          <CardTitle>Total Reports</CardTitle>
          <p className="text-xl font-bold">{summary.total}</p>
        </Card>
        <Card className="bg-card border border-border p-4 text-center">
          <CardTitle>Pending Feedback</CardTitle>
          <p className="text-xl font-bold">{summary.pending}</p>
        </Card>
        <Card className="bg-card border border-border p-4 text-center">
          <CardTitle>Completed</CardTitle>
          <p className="text-xl font-bold">{summary.completed}</p>
        </Card>
      </div>

      {/* Segmented Control */}
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="w-max bg-muted rounded-full p-1 mb-6">
          <TabsTrigger value="all" className="px-4 rounded-full">
            All Reports
          </TabsTrigger>
          <TabsTrigger value="pending" className="px-4 rounded-full">
            Pending Feedback
          </TabsTrigger>
          <TabsTrigger value="completed" className="px-4 rounded-full">
            Completed
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Reports Table */}
      {filteredReports.length === 0 ? (
        <Card className="bg-card border border-border p-6 text-center text-muted-foreground">
          No reports available.
        </Card>
      ) : (
        <Card className="bg-card border border-border shadow-sm">
          <CardHeader>
            <CardTitle>Reports List</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-muted text-muted-foreground uppercase text-xs">
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Lecturer</th>
                  <th className="p-3 text-left">Course</th>
                  <th className="p-3 text-left">Class</th>
                  <th className="p-3 text-left">Topic</th>
                  <th className="p-3 text-center">Attendance</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-muted/20 transition cursor-default"
                  >
                    <td className="p-3">{new Date(r.date).toLocaleDateString()}</td>
                    <td className="p-3">{r.lecturer_name}</td>
                    <td className="p-3">{r.course_name}</td>
                    <td className="p-3">{r.class_name}</td>
                    <td className="p-3">{r.topic}</td>
                    <td className="p-3 text-center">
                      {r.attendance_percentage ?? "—"}%
                    </td>
                    <td className="p-3 text-center">
                      {r.existing_feedback ? (
                        <span className="px-2 py-1 rounded-full bg-accent text-accent-foreground text-xs">
                          Completed
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full bg-secondary text-secondary-foreground text-xs">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <Button
                        size="sm"
                        variant={r.existing_feedback ? "secondary" : "default"}
                        onClick={() => openFeedback(r)}
                        disabled={!!r.existing_feedback}
                        className="flex items-center gap-2 justify-center"
                      >
                        <MessageSquare className="w-4 h-4" />
                        {r.existing_feedback ? "Sent" : "Add Feedback"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Feedback Slide-out */}
      {feedbackOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50">
          <div className="bg-card w-full max-w-md h-full shadow-lg p-6 relative flex flex-col">
            <button
              className="absolute top-4 right-4"
              onClick={closeFeedback}
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
            <h2 className="text-xl font-semibold mb-4">
              Feedback for {feedbackReport.class_name} - {feedbackReport.lecturer_name}
            </h2>
            <p className="text-sm text-muted-foreground mb-3">
              {feedbackReport.course_name} | {feedbackReport.topic}
            </p>
            <textarea
              className="w-full bg-input text-foreground border border-border rounded-lg p-3 flex-1 resize-none mb-4"
              rows={8}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Write your feedback..."
            />
            <div className="flex justify-end gap-3">
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
