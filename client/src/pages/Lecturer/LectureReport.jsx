import { useState, useEffect } from "react";
import api from "@/services/api.js";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

export default function LectureReport() {
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [form, setForm] = useState({
    courseId: "",
    class_id: "",
    week: "",
    date: "",
    actual_students_present: "",
    topic: "",
    learning_outcomes: "",
    recommendations: "",
  });

  const fetchCourses = async () => {
    try {
      const res = await api.get("/courses");
      setCourses(res.data);
    } catch (err) {
      console.error("Failed to fetch courses", err);
    }
  };

  const fetchClasses = async (courseId) => {
    try {
      const res = await api.get(`/classes?course=${courseId}`);
      setClasses(res.data);
    } catch (err) {
      console.error("Failed to fetch classes", err);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleCourseSelect = (courseId) => {
    setForm({ ...form, courseId, class_id: "" });
    fetchClasses(courseId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        class_id: form.class_id,
        week: form.week,
        date: form.date,
        actual_students_present: form.actual_students_present,
        topic: form.topic,
        learning_outcomes: form.learning_outcomes,
        recommendations: form.recommendations,
      };
      await api.post("/reports", payload);
      alert("Report submitted successfully!");
      setForm({
        courseId: "",
        class_id: "",
        week: "",
        date: "",
        actual_students_present: "",
        topic: "",
        learning_outcomes: "",
        recommendations: "",
      });
      setClasses([]);
    } catch (err) {
      console.error(err);
      alert("Failed to submit report");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Submit Lecture Report</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          value={form.courseId}
          onValueChange={(value) => handleCourseSelect(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Course" />
          </SelectTrigger>
          <SelectContent>
            {courses.map((course) => (
              <SelectItem key={course.id} value={String(course.id)}>
                {course.name} ({course.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={form.class_id}
          onValueChange={(value) => setForm({ ...form, class_id: value })}
          disabled={!form.courseId}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Class" />
          </SelectTrigger>
          <SelectContent>
            {classes.map((cls) => (
              <SelectItem key={cls.id} value={String(cls.id)}>
                {cls.class_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="number"
          placeholder="Week of Reporting"
          name="week"
          value={form.week}
          onChange={handleChange}
        />
        <Input
          type="date"
          placeholder="Date of Lecture"
          name="date"
          value={form.date}
          onChange={handleChange}
        />
        <Input
          type="number"
          placeholder="Actual Number of Students Present"
          name="actual_students_present"
          value={form.actual_students_present}
          onChange={handleChange}
        />
        <Input
          placeholder="Topic Taught"
          name="topic"
          value={form.topic}
          onChange={handleChange}
        />

        <Textarea
          placeholder="Learning Outcomes"
          name="learning_outcomes"
          value={form.learning_outcomes}
          onChange={handleChange}
          className="w-full"
          rows={3}
        />
        <Textarea
          placeholder="Lecturer Recommendations"
          name="recommendations"
          value={form.recommendations}
          onChange={handleChange}
          className="w-full"
          rows={3}
        />

        <Button type="submit" className="mt-4 w-full">
          Submit Report
        </Button>
      </form>
    </div>
  );
}
