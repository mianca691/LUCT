import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Loader2, Trash2, Edit2 } from "lucide-react";
import api from "@/services/api.js";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

export default function Classes() {
  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  const [newClass, setNewClass] = useState({ class_name: "", course_id: "", scheduled_time: "", venue: "" });
  const [editClass, setEditClass] = useState({ id: null, class_name: "", course_id: "", scheduled_time: "", venue: "", lecturer_id: null });

  const fetchClasses = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/pl/classes");
      setClasses(res.data);
    } catch (err) {
      console.error("Error fetching classes:", err);
      setError("Failed to load classes.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await api.get("/pl/courses");
      setCourses(res.data);
    } catch (err) {
      console.error("Error fetching courses:", err);
    }
  };

  const fetchLecturers = async () => {
    try {
      const res = await api.get("/pl/lecturers");
      setLecturers(res.data);
    } catch (err) {
      console.error("Error fetching lecturers:", err);
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchCourses();
    fetchLecturers();
  }, []);

  const handleCreateClass = async () => {
    if (!newClass.class_name || !newClass.course_id) {
      alert("Class name and course are required");
      return;
    }
    try {
      await api.post("/pl/classes", newClass);
      setNewClass({ class_name: "", course_id: "", scheduled_time: "", venue: "" });
      setOpenCreate(false);
      fetchClasses();
    } catch (err) {
      console.error(err);
      alert("Failed to create class");
    }
  };

  const handleUpdateClass = async () => {
    if (!editClass.class_name) {
      alert("Class name is required");
      return;
    }
    try {
      await api.put(`/pl/classes/${editClass.id}`, editClass);
      setOpenEdit(false);
      fetchClasses();
    } catch (err) {
      console.error(err);
      alert("Failed to update class");
    }
  };

  const handleDeleteClass = async (id) => {
    if (!confirm("Are you sure you want to delete this class?")) return;
    try {
      await api.delete(`/pl/classes/${id}`);
      fetchClasses();
    } catch (err) {
      console.error(err);
      alert("Failed to delete class");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );

  if (error)
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchClasses}>Retry</Button>
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Classes</h1>
        <Button onClick={() => setOpenCreate(true)}>Create New Class</Button>
      </div>

      {classes.length === 0 ? (
        <Card className="max-w-3xl mx-auto p-6 text-center text-gray-500">
          No classes available.
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>Class Name</TableCell>
                <TableCell>Course</TableCell>
                <TableCell>Lecturer</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Venue</TableCell>
                <TableCell>Students</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.map((cls) => (
                <TableRow key={cls.id}>
                  <TableCell>{cls.class_name}</TableCell>
                  <TableCell>{cls.course_name} ({cls.course_code})</TableCell>
                  <TableCell>{cls.lecturer_name || "-"}</TableCell>
                  <TableCell>{cls.scheduled_time || "-"}</TableCell>
                  <TableCell>{cls.venue || "-"}</TableCell>
                  <TableCell>{cls.total_registered_students}</TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setEditClass({
                          id: cls.id,
                          class_name: cls.class_name,
                          course_id: cls.course_id,
                          scheduled_time: cls.scheduled_time || "",
                          venue: cls.venue || "",
                          lecturer_id: cls.lecturer_id || null,
                        });
                        setOpenEdit(true);
                      }}
                    >
                      <Edit2 className="w-4 h-4 mr-1 inline" /> Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteClass(cls.id)}>
                      <Trash2 className="w-4 h-4 mr-1 inline" /> Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Class</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Class Name"
              value={newClass.class_name}
              onChange={(e) => setNewClass({ ...newClass, class_name: e.target.value })}
            />
            <Select value={newClass.course_id} onValueChange={(val) => setNewClass({ ...newClass, course_id: val })}>
              <SelectTrigger>
                <SelectValue placeholder="Select Course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.course_id} value={course.course_id}>
                    {course.course_code} – {course.course_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="time"
              value={newClass.scheduled_time}
              onChange={(e) => setNewClass({ ...newClass, scheduled_time: e.target.value })}
            />
            <Input
              placeholder="Venue"
              value={newClass.venue}
              onChange={(e) => setNewClass({ ...newClass, venue: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button onClick={handleCreateClass}>Create</Button>
            <Button variant="secondary" onClick={() => setOpenCreate(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Class</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Class Name"
              value={editClass.class_name}
              onChange={(e) => setEditClass({ ...editClass, class_name: e.target.value })}
            />
            <Select value={editClass.course_id} onValueChange={(val) => setEditClass({ ...editClass, course_id: val })}>
              <SelectTrigger>
                <SelectValue placeholder="Select Course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.course_id} value={course.course_id}>
                    {course.course_code} – {course.course_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="time"
              value={editClass.scheduled_time || ""}
              onChange={(e) => setEditClass({ ...editClass, scheduled_time: e.target.value })}
            />
            <Input
              placeholder="Venue"
              value={editClass.venue || ""}
              onChange={(e) => setEditClass({ ...editClass, venue: e.target.value })}
            />
            <Select value={editClass.lecturer_id || ""} onValueChange={(val) => setEditClass({ ...editClass, lecturer_id: val })}>
              <SelectTrigger>
                <SelectValue placeholder="Assign Lecturer" />
              </SelectTrigger>
              <SelectContent>
                {lecturers.map((lect) => (
                  <SelectItem key={lect.id} value={lect.id}>
                    {lect.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdateClass}>Update</Button>
            <Button variant="secondary" onClick={() => setOpenEdit(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
