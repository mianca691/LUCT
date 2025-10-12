import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext.jsx";
import api from "@/services/api.js";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export default function Enrolments() {
  const { token } = useAuth();

  const [availableClasses, setAvailableClasses] = useState([]);
  const [enrolledClasses, setEnrolledClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [loadingEnrolled, setLoadingEnrolled] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await api.get("/classes", { headers: { Authorization: `Bearer ${token}` } });
        setAvailableClasses(res.data);
      } catch (err) {
        console.error("Failed to fetch available classes", err);
      }
    };
    fetchClasses();
  }, [token]);

  const fetchEnrolledClasses = async () => {
    setLoadingEnrolled(true);
    try {
      const res = await api.get("/student/enrolments", { headers: { Authorization: `Bearer ${token}` } });
      setEnrolledClasses(res.data);
    } catch (err) {
      console.error("Failed to fetch enrolled classes", err);
    } finally {
      setLoadingEnrolled(false);
    }
  };

  useEffect(() => {
    fetchEnrolledClasses();
  }, [token]);

  const handleEnroll = async () => {
    if (!selectedClass) return alert("Please select a class to enroll");

    try {
      await api.post(
        "/student/enrolments",
        { class_id: selectedClass },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Enrolled successfully!");
      setSelectedClass("");
      fetchEnrolledClasses();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to enroll");
    }
  };

  return (
    <div className="p-8 space-y-6">
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <h2 className="text-xl font-semibold text-center">Enroll in a Class</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger>
              <SelectValue placeholder="Select Class" />
            </SelectTrigger>
            <SelectContent>
              {availableClasses.map((cls) => (
                <SelectItem key={cls.id} value={String(cls.id)}>
                  {cls.class_name} — {cls.venue} ({cls.course_name})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={handleEnroll} className="w-full">
            Enroll
          </Button>
        </CardContent>
      </Card>

      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <h3 className="text-lg font-semibold">Your Enrolled Classes</h3>
        </CardHeader>
        <CardContent>
          {loadingEnrolled ? (
            <p>Loading enrolled classes...</p>
          ) : enrolledClasses.length === 0 ? (
            <p>You are not enrolled in any classes yet.</p>
          ) : (
            <ul className="space-y-2">
              {enrolledClasses.map((cls) => (
                <li key={cls.enrolment_id} className="p-2 border rounded">
                  {cls.class_name} — {cls.venue} ({cls.course_name})
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
