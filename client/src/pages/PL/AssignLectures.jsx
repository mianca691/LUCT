import { useEffect, useState } from "react";
import api from "@/services/api.js";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function AssignLectures() {
  const [courses, setCourses] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [form, setForm] = useState({ courseId: "", lecturerId: "" });

  useEffect(() => {
    api.get("/courses").then((res) => setCourses(res.data));
    api.get("/users?role=lecturer").then((res) => setLecturers(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/classes", form);
      alert("Lecturer assigned successfully!");
      setForm({ courseId: "", lecturerId: "" });
    } catch (err) {
      console.error(err);
      alert("Failed to assign lecturer");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Assign Lecturer to Course</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          onValueChange={(value) => setForm({ ...form, courseId: value })}
          value={form.courseId}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Course" />
          </SelectTrigger>
          <SelectContent>
            {courses.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name} ({c.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          onValueChange={(value) => setForm({ ...form, lecturerId: value })}
          value={form.lecturerId}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Lecturer" />
          </SelectTrigger>
          <SelectContent>
            {lecturers.map((l) => (
              <SelectItem key={l.id} value={l.id}>
                {l.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button type="submit" className="w-full mt-4">
          Assign
        </Button>
      </form>
    </div>
  );
}
