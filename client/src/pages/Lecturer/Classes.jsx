import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext.jsx";
import api from "@/services/api.js";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function Classes() {
  const { token } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch classes from API
  const fetchClasses = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/lecturer/classes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClasses(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load your classes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [token]);

  // Format schedule time
  const formatTime = (timeStr) => {
    if (!timeStr) return "Not scheduled";
    const [hours, minutes] = timeStr.split(":");
    return `${hours}:${minutes}`;
  };

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
        <Button onClick={fetchClasses}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Your Classes</h1>
        <p className="text-muted-foreground">
          Here are the classes currently assigned to you.
        </p>
      </div>

      {/* Empty State */}
      {classes.length === 0 ? (
        <Card className="max-w-2xl mx-auto p-6 text-center text-muted-foreground">
          No classes assigned yet.
        </Card>
      ) : (
        <Card className="overflow-x-auto shadow-sm border border-border rounded-xl">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-card-foreground/10 text-muted-foreground text-sm uppercase sticky top-0 z-10">
              <tr>
                <th className="p-3">Class Name</th>
                <th className="p-3">Course</th>
                <th className="p-3">Venue</th>
                <th className="p-3">Schedule</th>
                <th className="p-3 text-center">Students</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((cls, idx) => (
                <tr
                  key={cls.id}
                  className={`border-t border-border transition hover:bg-accent/10 ${
                    idx % 2 === 0 ? "bg-background" : "bg-muted/5"
                  }`}
                >
                  <td className="p-3 font-medium text-foreground">{cls.class_name}</td>
                  <td className="p-3 text-foreground">
                    {cls.course_name} ({cls.course_code})
                  </td>
                  <td className="p-3 text-foreground">{cls.venue || "-"}</td>
                  <td className="p-3 text-foreground">{formatTime(cls.scheduled_time)}</td>
                  <td className="p-3 text-center text-foreground">{cls.total_students ?? 0}</td>
                  <td className="p-3 text-center">
                    <Button className="w-full" size="sm" variant="secondary">
                      <Link to={`/lecturer/submit-report`} className="w-full block">
                        Submit Report
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
