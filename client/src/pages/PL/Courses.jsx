import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import api from "@/services/api.js";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";


export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);

  const [newCourse, setNewCourse] = useState({ name: "", code: "" });
  const [editCourse, setEditCourse] = useState({ id: null, name: "", code: "" });
  const [assignClass, setAssignClass] = useState({ class_id: null, lecturer_id: null });

  // Fetch courses
  const fetchCourses = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/pl/courses");
      setCourses(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load courses.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch all lecturers for assignment
  const fetchLecturers = async () => {
    try {
      const res = await api.get("/pl/lecturers"); // create endpoint if not exists
      setLecturers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchLecturers();
  }, []);

  // Add course
  const handleAddCourse = async () => {
    if (!newCourse.name || !newCourse.code) return alert("Please fill in all fields");
    try {
      await api.post("/pl/courses", newCourse);
      setNewCourse({ name: "", code: "" });
      setOpenAddDialog(false);
      fetchCourses();
    } catch (err) {
      console.error(err);
      alert("Failed to add course");
    }
  };

  // Edit course
  const handleEditCourse = async () => {
    if (!editCourse.name || !editCourse.code) return alert("Please fill in all fields");
    try {
      await api.put(`/pl/courses/${editCourse.id}`, {
        name: editCourse.name,
        code: editCourse.code,
      });
      setOpenEditDialog(false);
      fetchCourses();
    } catch (err) {
      console.error(err);
      alert("Failed to update course");
    }
  };

  // Assign lecturer
  const handleAssignLecturer = async () => {
    if (!assignClass.class_id || !assignClass.lecturer_id) return alert("Please select class and lecturer");
    try {
      await api.post("/pl/courses/assign", assignClass);
      setOpenAssignDialog(false);
      fetchCourses();
    } catch (err) {
      console.error(err);
      alert("Failed to assign lecturer");
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (error) return <div className="p-8 text-center"><p className="text-red-500 mb-4">{error}</p><Button onClick={fetchCourses}>Retry</Button></div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Courses</h1>
        <Button onClick={() => setOpenAddDialog(true)}>Add New Course</Button>
      </div>

      {courses.length === 0 ? (
        <Card className="max-w-3xl mx-auto p-6 text-center text-gray-500">No courses available.</Card>
      ) : (
        courses.map((course) => (
          <Card key={course.course_id} className="shadow-sm mb-4">
            <CardHeader>
              <CardTitle>{course.course_code} - {course.course_name}</CardTitle>
            </CardHeader>
            <CardContent>
              {course.classes.length === 0 ? (
                <p className="text-gray-500">No classes assigned.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableCell>Class Name</TableCell>
                        <TableCell>Lecturer</TableCell>
                        <TableCell>Time</TableCell>
                        <TableCell>Venue</TableCell>
                        <TableCell>Registered Students</TableCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {course.classes.map((cls) => (
                        <TableRow key={cls.id}>
                          <TableCell>{cls.class_name}</TableCell>
                          <TableCell>{cls.lecturer_name || "-"}</TableCell>
                          <TableCell>{cls.scheduled_time ? new Date(cls.scheduled_time).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) : "-"}</TableCell>
                          <TableCell>{cls.venue || "-"}</TableCell>
                          <TableCell>{cls.total_registered_students}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              <div className="mt-4 flex space-x-2">
                <Button size="sm" onClick={() => { setEditCourse({ id: course.course_id, name: course.course_name, code: course.course_code }); setOpenEditDialog(true); }}>Edit</Button>
                <Button size="sm" variant="secondary" onClick={() => { setAssignClass({ class_id: course.classes[0]?.id || null, lecturer_id: null }); setOpenAssignDialog(true); }}>Assign Lectures</Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      {/* Add Course Dialog */}
      <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New Course</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Course Code" value={newCourse.code} onChange={(e)=>setNewCourse({...newCourse, code:e.target.value})} />
            <Input placeholder="Course Name" value={newCourse.name} onChange={(e)=>setNewCourse({...newCourse, name:e.target.value})} />
          </div>
          <DialogFooter className="flex justify-end space-x-2">
            <Button onClick={handleAddCourse}>Add Course</Button>
            <Button variant="secondary" onClick={()=>setOpenAddDialog(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Course Dialog */}
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Course</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Course Code" value={editCourse.code} onChange={(e)=>setEditCourse({...editCourse, code:e.target.value})} />
            <Input placeholder="Course Name" value={editCourse.name} onChange={(e)=>setEditCourse({...editCourse, name:e.target.value})} />
          </div>
          <DialogFooter className="flex justify-end space-x-2">
            <Button onClick={handleEditCourse}>Update</Button>
            <Button variant="secondary" onClick={()=>setOpenEditDialog(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Lecturer Dialog */}
      <Dialog open={openAssignDialog} onOpenChange={setOpenAssignDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assign Lecturer</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Select value={assignClass.lecturer_id} onValueChange={(val)=>setAssignClass({...assignClass, lecturer_id: val})}>
              <SelectTrigger>
                <SelectValue placeholder="Select Lecturer" />
              </SelectTrigger>
              <SelectContent>
                {lecturers.map((lect) => <SelectItem key={lect.id} value={lect.id}>{lect.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="flex justify-end space-x-2">
            <Button onClick={handleAssignLecturer}>Assign</Button>
            <Button variant="secondary" onClick={()=>setOpenAssignDialog(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
