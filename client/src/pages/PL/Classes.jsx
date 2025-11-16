import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react";
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

export default function ClassesPage() {
  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Dialog states
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  // Form states
  const [newClass, setNewClass] = useState({ class_name: "", course_id: "none", scheduled_time: "", venue: "" });
  const [editClass, setEditClass] = useState({ id: null, class_name: "", course_id: "none", scheduled_time: "", venue: "", lecturer_id: "none" });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const classesPerPage = 5;

  const uniqueFaculties = (data) => {
    const seen = new Set();
    return data.filter(f => {
      if (seen.has(f.id)) return false;
      seen.add(f.id);
      return true;
    });
  };

  const fetchFaculties = async () => {
    try {
      const res = await api.get("/pl/faculties");
      setFaculties(uniqueFaculties(res.data));
    } catch (err) {
      console.error("Failed to fetch faculties", err);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await api.get("/pl/courses");
      setCourses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLecturers = async () => {
    try {
      const res = await api.get("/pl/lecturers");
      setLecturers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchClasses = async () => {
    setLoading(true);
    setError("");
    try {
      const params = selectedFaculty === "all" ? {} : { faculty_id: selectedFaculty };
      const res = await api.get("/pl/classes", { params });
      setClasses(res.data);
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
      setError("Failed to load classes.");
    } finally {
      setLoading(false);
    }
  };

  // CRUD handlers
  const handleCreateClass = async () => {
    if (!newClass.class_name || newClass.course_id === "none") return alert("Class name and course are required");
    try {
      const payload = { ...newClass, course_id: newClass.course_id };
      await api.post("/pl/classes", payload);
      setNewClass({ class_name: "", course_id: "none", scheduled_time: "", venue: "" });
      setOpenCreate(false);
      fetchClasses();
    } catch (err) {
      console.error(err);
      alert("Failed to create class");
    }
  };

  const handleUpdateClass = async () => {
    if (!editClass.class_name || editClass.course_id === "none") return alert("Class name and course are required");
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

  // Pagination
  const indexOfLast = currentPage * classesPerPage;
  const indexOfFirst = indexOfLast - classesPerPage;
  const currentClasses = classes.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(classes.length / classesPerPage);

  const changePage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  useEffect(() => {
    fetchCourses();
    fetchLecturers();
    fetchFaculties();
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [selectedFaculty]);

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (error) return (
    <div className="p-8 text-center">
      <p className="text-red-500 mb-4">{error}</p>
      <Button onClick={fetchClasses} variant="outline">Retry</Button>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Classes</h1>
          <Select
            value={selectedFaculty}
            onValueChange={(val) => setSelectedFaculty(val)}
            className="w-60 mt-2"
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by Faculty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Faculties</SelectItem>
              {faculties.map(f => (
                <SelectItem key={f.id} value={f.id.toString()}>{f.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button className="flex items-center gap-2" onClick={() => setOpenCreate(true)}>
          <Plus className="w-4 h-4" /> Create New Class
        </Button>
      </div>

      {/* Table */}
      {currentClasses.length === 0 ? (
        <Card className="max-w-3xl mx-auto p-6 text-center text-gray-500">No classes available.</Card>
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
                <TableCell className="text-center">Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentClasses.map(cls => (
                <TableRow key={cls.id}>
                  <TableCell>{cls.class_name}</TableCell>
                  <TableCell>{cls.course_name} ({cls.course_code})</TableCell>
                  <TableCell>{cls.lecturer_name || "-"}</TableCell>
                  <TableCell>{cls.scheduled_time || "-"}</TableCell>
                  <TableCell>{cls.venue || "-"}</TableCell>
                  <TableCell>{cls.total_registered_students || 0}</TableCell>
                  <TableCell className="space-x-2 text-center">
                    <Button size="sm" onClick={() => { setEditClass({ ...cls, lecturer_id: cls.lecturer_id?.toString() || "none", course_id: cls.course_id?.toString() || "none" }); setOpenEdit(true); }}>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-4">
          <Button onClick={() => changePage(currentPage - 1)} disabled={currentPage === 1}>Prev</Button>
          {[...Array(totalPages)].map((_, i) => (
            <Button key={i} variant={currentPage === i + 1 ? "default" : "outline"} onClick={() => changePage(i + 1)}>
              {i + 1}
            </Button>
          ))}
          <Button onClick={() => changePage(currentPage + 1)} disabled={currentPage === totalPages}>Next</Button>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create New Class</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Class Name" value={newClass.class_name} onChange={e => setNewClass({ ...newClass, class_name: e.target.value })} />
            <Select value={newClass.course_id} onValueChange={val => setNewClass({ ...newClass, course_id: val })}>
              <SelectTrigger><SelectValue placeholder="Select Course" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Select Course</SelectItem>
                {courses.map(c => <SelectItem key={c.course_id} value={c.course_id.toString()}>{c.course_code} – {c.course_name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input type="time" value={newClass.scheduled_time} onChange={e => setNewClass({ ...newClass, scheduled_time: e.target.value })} />
            <Input placeholder="Venue" value={newClass.venue} onChange={e => setNewClass({ ...newClass, venue: e.target.value })} />
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button onClick={handleCreateClass}>Create</Button>
            <Button variant="secondary" onClick={() => setOpenCreate(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Class</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Class Name" value={editClass.class_name} onChange={e => setEditClass({ ...editClass, class_name: e.target.value })} />
            <Select value={editClass.course_id} onValueChange={val => setEditClass({ ...editClass, course_id: val })}>
              <SelectTrigger><SelectValue placeholder="Select Course" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Select Course</SelectItem>
                {courses.map(c => <SelectItem key={c.course_id} value={c.course_id.toString()}>{c.course_code} – {c.course_name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input type="time" value={editClass.scheduled_time || ""} onChange={e => setEditClass({ ...editClass, scheduled_time: e.target.value })} />
            <Input placeholder="Venue" value={editClass.venue || ""} onChange={e => setEditClass({ ...editClass, venue: e.target.value })} />
            <Select value={editClass.lecturer_id} onValueChange={val => setEditClass({ ...editClass, lecturer_id: val })}>
              <SelectTrigger><SelectValue placeholder="Assign Lecturer" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Select Lecturer</SelectItem>
                {lecturers.map(l => <SelectItem key={l.id} value={l.id.toString()}>{l.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button onClick={handleUpdateClass}>Update</Button>
            <Button variant="secondary" onClick={() => setOpenEdit(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
