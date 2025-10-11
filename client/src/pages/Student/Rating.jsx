import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import api from "@/services/api.js";

export default function StudentRating() {
  const { token } = useAuth();

  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [form, setForm] = useState({
    courseId: "",
    classId: "",
    rating: "",
    comment: "",
  });

  const [myRatings, setMyRatings] = useState([]);

  // Fetch all courses on mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get("/courses", { headers: { Authorization: `Bearer ${token}` } });
        setCourses(res.data);
      } catch (err) {
        console.error("Failed to fetch courses", err);
      }
    };
    fetchCourses();
  }, [token]);

  // Fetch classes whenever courseId changes
  useEffect(() => {
    if (!form.courseId) return;
    const fetchClasses = async () => {
      try {
        const res = await api.get("/ratings/classes", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClasses(res.data);
      } catch (err) {
        console.error("Failed to fetch classes", err);
      }
    };
  }, [form.courseId, token]);

  // Fetch student's previous ratings
  useEffect(() => {
    const fetchMyRatings = async () => {
      try {
        const res = await api.get("/ratings/my", { headers: { Authorization: `Bearer ${token}` } });
        setMyRatings(res.data);
      } catch (err) {
        console.error("Failed to fetch ratings", err);
      }
    };
    fetchMyRatings();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.classId || form.rating < 1 || form.rating > 5) {
      alert("Please select a class and provide a rating between 1 and 5");
      return;
    }

    try {
      await api.post(
        "/ratings",
        {
          class_id: form.classId,
          rating: Number(form.rating),
          comment: form.comment,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Rating submitted successfully!");
      setForm({ ...form, classId: "", rating: "", comment: "" });
      // Refresh previous ratings
      const res = await api.get("/ratings/my", { headers: { Authorization: `Bearer ${token}` } });
      setMyRatings(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to submit rating");
    }
  };

  return (
    <div className="p-8 space-y-6">
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <h2 className="text-xl font-semibold text-center">Rate a Lecture</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select onValueChange={(val) => setForm({ ...form, courseId: val })} value={form.courseId}>
              <SelectTrigger>
                <SelectValue placeholder="Select Course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.name} ({course.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select onValueChange={(val) => setForm({ ...form, classId: val })} value={form.classId}>
              <SelectTrigger>
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.venue} — {new Date(cls.scheduled_time).toLocaleString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="number"
              placeholder="Rating (1–5)"
              value={form.rating}
              onChange={(e) => setForm({ ...form, rating: e.target.value })}
              min={1}
              max={5}
            />

            <Textarea
              placeholder="Comment (optional)"
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
            />

            <Button type="submit" className="w-full mt-2">
              Submit Rating
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Your Previous Ratings</h3>
        </CardHeader>
        <CardContent>
          <table className="w-full border text-sm">
            <thead>
              <tr>
                <th className="border p-2">Course</th>
                <th className="border p-2">Lecturer</th>
                <th className="border p-2">Rating</th>
                <th className="border p-2">Comment</th>
                <th className="border p-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {myRatings.map((r) => (
                <tr key={r.id}>
                  <td className="border p-2">{r.course_name}</td>
                  <td className="border p-2">{r.lecturer_name}</td>
                  <td className="border p-2">{r.rating}</td>
                  <td className="border p-2">{r.comment || "-"}</td>
                  <td className="border p-2">{new Date(r.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
