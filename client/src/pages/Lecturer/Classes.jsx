import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext.jsx";
import api from "@/services/api.js";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function Classes() {
  const { token } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        <Button onClick={fetchClasses}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Your Classes</h1>
        <p className="text-gray-500">
          Here are the classes currently assigned to you.
        </p>
      </div>

      {classes.length === 0 ? (
        <Card className="max-w-2xl mx-auto p-6 text-center text-gray-500">
          No classes assigned yet.
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <Card
              key={cls.id}
              className="shadow-sm border hover:shadow-md transition"
            >
              <CardHeader>
                <CardTitle>{cls.class_name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Course:</span>{" "}
                  {cls.course_name} ({cls.course_code})
                </p>
                <p>
                  <span className="font-medium">Venue:</span> {cls.venue}
                </p>
                <p>
                  <span className="font-medium">Schedule:</span>{" "}
                  {cls.scheduled_time
                    ? new Date(cls.scheduled_time).toLocaleString()
                    : "Not scheduled"}
                </p>
                <p>
                  <span className="font-medium">Total Students:</span>{" "}
                  {cls.total_students}
                </p>

                <div className="pt-3">
                  <Link to={`/lecturer/report?class=${cls.id}`}>
                    <Button className="w-full" size="sm">
                      Submit Report
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
