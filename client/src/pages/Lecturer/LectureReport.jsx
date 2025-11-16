import { useEffect, useState, useRef } from "react";
import api from "@/services/api.js";
import { useAuth } from "@/contexts/AuthContext.jsx";
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
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

/*
  Premium LectureReport:
  - Auto-fetch assigned courses (on mount)
  - Fetch classes when course selected
  - Fetch class details (total_students) when class selected
  - Inline validation & helpful messages
  - Auto-save draft to localStorage
  - Preview card before final submit (confirm)
  - "Copy last report" quick-fill
  - File attachment support (optional)
  - Simple toast notifications (in-component)
*/

const DRAFT_KEY = "lecture_report_draft_v1";

export default function LectureReport() {
  const { user, token } = useAuth();

  // form state
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [classDetails, setClassDetails] = useState(null); // { total_students, ... }
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingClassDetails, setLoadingClassDetails] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    courseId: "",
    class_id: "",
    week: "",
    date: "",
    actual_students_present: "",
    topic: "",
    learning_outcomes: "",
    recommendations: "",
    attachment: null,
  });

  // Load draft from localStorage
  useEffect(() => {
    const draftRaw = localStorage.getItem(DRAFT_KEY);
    if (draftRaw) {
      try {
        const parsed = JSON.parse(draftRaw);
        setForm((f) => ({ ...f, ...parsed }));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  // Auto-save draft on change (debounced)
  useEffect(() => {
    const id = setTimeout(() => {
      const draft = { ...form };
      // do not store file in localStorage
      delete draft.attachment;
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    }, 700);
    return () => clearTimeout(id);
  }, [form]);

  // Toast helper
  const showToast = (message, type = "info", ms = 3000) => {
    clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast(null), ms);
  };

  // Fetch courses assigned to lecturer
  useEffect(() => {
    const fetchCourses = async () => {
      if (!user?.id) return;
      setLoadingCourses(true);
      try {
        const res = await api.get(`/lecturer/${user.id}/assigned-courses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourses(res.data || []);
      } catch (err) {
        console.error("Failed to fetch lecturer courses", err);
        showToast("Failed loading courses", "error");
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, [user, token]);

  // Fetch classes for selected course
  const fetchClasses = async (courseId) => {
    if (!user?.id || !courseId) return;
    setLoadingClasses(true);
    setClasses([]);
    try {
      const res = await api.get(`/lecturer/${user.id}/classes?course=${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClasses(res.data || []);
    } catch (err) {
      console.error("Failed to fetch classes", err);
      showToast("Failed loading classes", "error");
    } finally {
      setLoadingClasses(false);
    }
  };

  // Fetch class details for validation (total_students)
  const fetchClassDetails = async (classId) => {
    if (!classId) {
      setClassDetails(null);
      return;
    }
    setLoadingClassDetails(true);
    try {
      // endpoint assumed; change if necessary
      const res = await api.get(`/lecturer/classes/${classId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClassDetails(res.data || null);
    } catch (err) {
      console.error("Failed to fetch class details", err);
      showToast("Failed to load class details", "error");
      setClassDetails(null);
    } finally {
      setLoadingClassDetails(false);
    }
  };

  // handle selects / inputs
  const handleCourseSelect = (courseId) => {
    setForm((s) => ({ ...s, courseId, class_id: "" }));
    setClassDetails(null);
    fetchClasses(courseId);
  };

  const handleClassSelect = (classId) => {
    setForm((s) => ({ ...s, class_id: classId }));
    fetchClassDetails(classId);
    // prefetch last report for this class (for copy)
    // not automatic fill, user clicks copy last report button
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "attachment") {
      setForm((f) => ({ ...f, attachment: files?.[0] ?? null }));
      return;
    }
    setForm((f) => ({ ...f, [name]: value }));
    // clear specific field error on change
    setErrors((err) => {
      const copy = { ...err };
      delete copy[name];
      return copy;
    });
  };

  // Copy last report for selected class
  const copyLastReport = async () => {
    if (!form.class_id) {
      showToast("Select a class first", "warning");
      return;
    }
    try {
      const res = await api.get(`/lecturer/reports/last?class_id=${form.class_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const last = res.data;
      if (!last) {
        showToast("No previous report found for this class", "info");
        return;
      }
      // map fields from last report
      setForm((f) => ({
        ...f,
        week: last.week ?? f.week,
        date: last.date ?? f.date,
        actual_students_present: last.actual_students_present ?? f.actual_students_present,
        topic: last.topic ?? f.topic,
        learning_outcomes: last.learning_outcomes ?? f.learning_outcomes,
        recommendations: last.recommendations ?? f.recommendations,
      }));
      showToast("Copied last report (you can edit before submitting)", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to copy last report", "error");
    }
  };

  // Validation
  const validate = () => {
    const e = {};
    if (!form.courseId) e.courseId = "Course is required";
    if (!form.class_id) e.class_id = "Class is required";
    if (!form.week || Number(form.week) <= 0) e.week = "Enter a valid week number";
    if (!form.date) e.date = "Date is required";
    else {
      const selected = new Date(form.date);
      const today = new Date();
      if (selected > today) e.date = "You cannot select a future date";
    }
    if (form.actual_students_present === "" || Number(form.actual_students_present) < 0) {
      e.actual_students_present = "Enter number of students present";
    } else if (classDetails?.total_students && Number(form.actual_students_present) > classDetails.total_students) {
      e.actual_students_present = `Cannot exceed total students (${classDetails.total_students})`;
    }
    if (!form.topic?.trim()) e.topic = "Topic is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Preview toggle -> opens preview card if valid
  const handlePreview = () => {
    if (!validate()) {
      showToast("Fix validation issues before preview", "error");
      return;
    }
    setPreviewOpen(true);
  };

  // Submit final report (uses FormData if attachment exists)
  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (!validate()) {
      showToast("Fix validation before submitting", "error");
      return;
    }
    setSubmitting(true);
    try {
      let res;
      if (form.attachment) {
        const fd = new FormData();
        fd.append("class_id", form.class_id);
        fd.append("week", form.week);
        fd.append("date", form.date);
        fd.append("actual_students_present", form.actual_students_present);
        fd.append("topic", form.topic);
        fd.append("learning_outcomes", form.learning_outcomes);
        fd.append("recommendations", form.recommendations);
        fd.append("attachment", form.attachment);
        res = await api.post("/reports", fd, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        });
      } else {
        const payload = {
          class_id: form.class_id,
          week: form.week,
          date: form.date,
          actual_students_present: form.actual_students_present,
          topic: form.topic,
          learning_outcomes: form.learning_outcomes,
          recommendations: form.recommendations,
        };
        res = await api.post("/reports", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      // success
      showToast("Report submitted successfully", "success");
      localStorage.removeItem(DRAFT_KEY);
      setForm({
        courseId: "",
        class_id: "",
        week: "",
        date: "",
        actual_students_present: "",
        topic: "",
        learning_outcomes: "",
        recommendations: "",
        attachment: null,
      });
      setClasses([]);
      setClassDetails(null);
      setPreviewOpen(false);
    } catch (err) {
      console.error(err);
      showToast(err?.response?.data?.message || "Failed to submit report", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Clear draft
  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setForm({
      courseId: "",
      class_id: "",
      week: "",
      date: "",
      actual_students_present: "",
      topic: "",
      learning_outcomes: "",
      recommendations: "",
      attachment: null,
    });
    setClasses([]);
    setClassDetails(null);
    showToast("Draft cleared", "info");
  };

  // formatting helpers
  const maxDate = new Date().toISOString().split("T")[0];

  return (
    <div className="p-6">
      {/* TOAST */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-4 py-2 rounded-md shadow-md ${
            toast.type === "success"
              ? "bg-emerald-600 text-white"
              : toast.type === "error"
              ? "bg-destructive text-white"
              : toast.type === "warning"
              ? "bg-yellow-500 text-black"
              : "bg-slate-800 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Submit Lecture Report</CardTitle>
        </CardHeader>

        <CardContent>
          {/* header meta */}
          <div className="flex gap-3 items-center justify-between mb-4">
            <p className="text-muted-foreground">
              Fill in the report details. You can preview before submitting.
            </p>

            <div className="flex gap-2">
              <Button variant="outline" onClick={copyLastReport} disabled={!form.class_id || loadingClasses}>
                Copy Last Report
              </Button>
              <Button variant="ghost" onClick={clearDraft}>
                Clear Draft
              </Button>
            </div>
          </div>

          {/* form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Course */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Course</label>
              <Select value={form.courseId} onValueChange={handleCourseSelect}>
                <SelectTrigger className="w-full" aria-label="Select course">
                  <SelectValue placeholder={loadingCourses ? "Loading courses..." : "Select Course"} />
                </SelectTrigger>

                <SelectContent>
                  {loadingCourses ? (
                    <div className="p-2 text-sm text-muted-foreground">Loading courses...</div>
                  ) : courses.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">No assigned courses found</div>
                  ) : (
                    courses.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name} ({c.code})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.courseId && <p className="text-destructive text-sm mt-1">{errors.courseId}</p>}
            </div>

            {/* Class */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Class</label>
              <Select value={form.class_id} onValueChange={handleClassSelect} disabled={!form.courseId || loadingClasses}>
                <SelectTrigger className="w-full" aria-label="Select class">
                  <SelectValue placeholder={loadingClasses ? "Loading classes..." : "Select Class"} />
                </SelectTrigger>

                <SelectContent>
                  {loadingClasses ? (
                    <div className="p-2 text-sm text-muted-foreground">Loading classes...</div>
                  ) : classes.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">No classes found</div>
                  ) : (
                    classes.map((cls) => (
                      <SelectItem key={cls.id} value={String(cls.id)}>
                        {cls.class_name} {cls.venue ? `— ${cls.venue}` : ""}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.class_id && <p className="text-destructive text-sm mt-1">{errors.class_id}</p>}

              {/* class details (total students) */}
              <div className="mt-2 text-sm text-muted-foreground">
                {loadingClassDetails ? (
                  <span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin text-primary" /> Loading class details...</span>
                ) : classDetails ? (
                  <span>Total students in class: <strong className="text-foreground">{classDetails.total_students}</strong></span>
                ) : (
                  <span>Class details unavailable</span>
                )}
              </div>
            </div>

            {/* row: week & date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Week</label>
                <Input name="week" type="number" min={1} value={form.week} onChange={handleChange} placeholder="Week of reporting" />
                {errors.week && <p className="text-destructive text-sm mt-1">{errors.week}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Date</label>
                <Input name="date" type="date" value={form.date} onChange={handleChange} max={maxDate} />
                {errors.date && <p className="text-destructive text-sm mt-1">{errors.date}</p>}
              </div>
            </div>

            {/* row: students present & topic */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Students Present</label>
                <Input
                  name="actual_students_present"
                  type="number"
                  min={0}
                  value={form.actual_students_present}
                  onChange={handleChange}
                  placeholder="Number of students present"
                />
                {errors.actual_students_present && <p className="text-destructive text-sm mt-1">{errors.actual_students_present}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Topic</label>
                <Input name="topic" value={form.topic} onChange={handleChange} placeholder="Topic taught" />
                {errors.topic && <p className="text-destructive text-sm mt-1">{errors.topic}</p>}
              </div>
            </div>

            {/* learning outcomes */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Learning Outcomes</label>
              <Textarea name="learning_outcomes" rows={4} value={form.learning_outcomes} onChange={handleChange} placeholder="What should students be able to do after this lecture?" />
            </div>

            {/* recommendations */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Recommendations (optional)</label>
              <Textarea name="recommendations" rows={3} value={form.recommendations} onChange={handleChange} placeholder="Recommendations for future teaching / next steps" />
            </div>

            {/* attachments */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Attachment (slides) — optional</label>
              <input name="attachment" type="file" accept=".pdf,.ppt,.pptx,.zip" onChange={handleChange} />
              {form.attachment && <p className="text-sm text-muted-foreground mt-2">Selected: {form.attachment.name} ({Math.round(form.attachment.size / 1024)} KB)</p>}
            </div>

            {/* actions */}
            <div className="flex gap-3 items-center">
              <Button type="button" variant="outline" onClick={handlePreview}>Preview</Button>

              <Button type="submit" disabled={submitting}>
                {submitting ? <span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</span> : "Submit Report"}
              </Button>

              <Button type="button" variant="ghost" onClick={() => { setPreviewOpen(false); setErrors({}); }}>
                Cancel
              </Button>
            </div>
          </form>

          {/* Preview card */}
          {previewOpen && (
            <div className="mt-6">
              <Card className="border border-border">
                <CardHeader>
                  <CardTitle>Preview Report</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p><strong>Course:</strong> {courses.find(c => String(c.id) === String(form.courseId))?.name ?? "-"}</p>
                    <p><strong>Class:</strong> {classes.find(c => String(c.id) === String(form.class_id))?.class_name ?? "-"}</p>
                    <p><strong>Week:</strong> {form.week}</p>
                    <p><strong>Date:</strong> {form.date}</p>
                    <p><strong>Students Present:</strong> {form.actual_students_present} {classDetails?.total_students ? ` / ${classDetails.total_students}` : ""}</p>
                    <p><strong>Topic:</strong> {form.topic}</p>
                    <div>
                      <strong>Learning Outcomes:</strong>
                      <div className="mt-1 p-3 bg-card rounded-md text-sm">{form.learning_outcomes || "—"}</div>
                    </div>
                    <div>
                      <strong>Recommendations:</strong>
                      <div className="mt-1 p-3 bg-card rounded-md text-sm">{form.recommendations || "—"}</div>
                    </div>
                    {form.attachment && <p><strong>Attachment:</strong> {form.attachment.name}</p>}
                  </div>

                  <div className="mt-4 flex gap-3">
                    <Button onClick={handleSubmit} disabled={submitting}>
                      {submitting ? <span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</span> : "Confirm & Submit"}
                    </Button>
                    <Button variant="outline" onClick={() => setPreviewOpen(false)}>Edit</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
