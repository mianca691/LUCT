import { useState, useEffect } from "react";
import api from "@/services/api.js";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

export default function SubmitReport() {
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [form, setForm] = useState({
    classId: "",
    week: "",
    date: "",
    actualStudents: "",
    topic: "",
    learningOutcomes: "",
    recommendations: "",
  });

  const fetchCourses = async () => {
    const res = await api.get("/courses");
    setCourses(res.data);
  };

  const fetchClasses = async (courseId) => {
    const res = await api.get(`/classes?course=${courseId}`);
    setClasses(res.data);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleCourseSelect = (courseId) => {
    fetchClasses(courseId);
    setForm({ ...form, classId: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/reports", form);
      alert("Report submitted successfully!");
      setForm({
        classId: "",
        week: "",
        date: "",
        actualStudents: "",
        topic: "",
        learningOutcomes: "",
        recommendations: "",
      });
    } catch (err) {
      console.error(err);
      alert("Failed to submit report");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Submit Lecture Report</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select onValueChange={handleCourseSelect}>
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

        <Select
          onValueChange={(value) => setForm({ ...form, classId: value })}
          value={form.classId}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Class" />
          </SelectTrigger>
          <SelectContent>
            {classes.map((cls) => (
              <SelectItem key={cls.id} value={cls.id}>
                {cls.venue} - {cls.scheduledTime}
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
          name="actualStudents"
          value={form.actualStudents}
          onChange={handleChange}
        />
        <Input
          placeholder="Topic Taught"
          name="topic"
          value={form.topic}
          onChange={handleChange}
        />
        <Input
          placeholder="Learning Outcomes"
          name="learningOutcomes"
          value={form.learningOutcomes}
          onChange={handleChange}
        />
        <Input
          placeholder="Lecturer Recommendations"
          name="recommendations"
          value={form.recommendations}
          onChange={handleChange}
        />

        <Button type="submit" className="mt-4 w-full">
          Submit Report
        </Button>
      </form>
    </div>
  );
}
