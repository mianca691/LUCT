import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import api from "../../services/api";

export default function ReportForm() {
  const [form, setForm] = useState({
    class_id: "",
    week: "",
    date: "",
    actual_students_present: "",
    topic: "",
    learning_outcomes: "",
    recommendations: ""
  });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    await api.post("/reports", form);
    alert("Report submitted successfully");
    setForm({});
  };

  return (
    <div className="max-w-2xl mx-auto mt-6 p-6 bg-white shadow rounded-2xl">
      <h2 className="text-xl font-semibold mb-4">Submit Lecture Report</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input name="class_id" placeholder="Class ID" onChange={handleChange} />
        <Input name="week" placeholder="Week Number" onChange={handleChange} />
        <Input name="date" type="date" onChange={handleChange} />
        <Input name="actual_students_present" placeholder="Students Present" onChange={handleChange} />
        <Textarea name="topic" placeholder="Topic Taught" onChange={handleChange} />
        <Textarea name="learning_outcomes" placeholder="Learning Outcomes" onChange={handleChange} />
        <Textarea name="recommendations" placeholder="Recommendations" onChange={handleChange} />
        <Button type="submit" className="w-full">Submit Report</Button>
      </form>
    </div>
  );
}
