import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, UserPlus, Loader2 } from "lucide-react";
import api from "@/services/api.js";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

export default function PLCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [addCourseOpen, setAddCourseOpen] = useState(false);
  const [newCourseName, setNewCourseName] = useState("");
  const [newCourseCode, setNewCourseCode] = useState("");
  const [faculties, setFaculties] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState("");

  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [lecturers, setLecturers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedLecturerId, setSelectedLecturerId] = useState("");

  const fetchCourses = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/pl/courses");
      setCourses(res.data);
    } catch (err) {
      console.error("Error fetching PL courses:", err);
      setError("Failed to load courses.");
    } finally {
      setLoading(false);
    }
  };

  const fetchFaculties = async () => {
    try {
      const res = await api.get("/pl/faculties");
      setFaculties(res.data);
    } catch (err) {
      console.error("Error fetching faculties:", err);
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

  const handleAddCourse = async () => {
    if (!newCourseName || !newCourseCode || !selectedFaculty) return;
    try {
      await api.post("/pl/courses", {
        name: newCourseName,
        code: newCourseCode,
        faculty_id: selectedFaculty,
      });
      setAddCourseOpen(false);
      setNewCourseName("");
      setNewCourseCode("");
      setSelectedFaculty("");
      fetchCourses();
    } catch (err) {
      console.error("Error adding course:", err);
    }
  };

  const handleAssignLecturer = async () => {
    if (!selectedClassId || !selectedLecturerId) return;
    try {
      await api.post("/pl/courses/assign", {
        class_id: selectedClassId,
        lecturer_id: selectedLecturerId,
      });
      setAssignOpen(false);
      setSelectedClassId("");
      setSelectedLecturerId("");
      fetchCourses();
    } catch (err) {
      console.error("Error assigning lecturer:", err);
    }
  };

  const openAssignModal = async (course) => {
    setSelectedCourse(course);
    setAssignOpen(true);
    fetchLecturers();

    try {
      const res = await api.get(`/pl/courses/${course.course_id}/classes`);
      setClasses(res.data);
    } catch (err) {
      console.error("Error fetching classes for course:", err);
      setClasses([]);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchFaculties();
  }, []);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Courses</h1>
          <p className="text-gray-500 text-sm">
            Manage courses and assign lecturers to modules.
          </p>
        </div>
        <Button className="flex items-center gap-2" onClick={() => setAddCourseOpen(true)}>
          <Plus className="w-4 h-4" /> Add Course
        </Button>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {!loading && error && (
        <div className="text-center text-red-500 p-8">
          <p>{error}</p>
          <Button onClick={fetchCourses} variant="outline" className="mt-4">
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && courses.length === 0 && (
        <Card className="max-w-3xl mx-auto p-6 text-center text-gray-500">
          No courses found for your program.
        </Card>
      )}

      {!loading && !error && courses.length > 0 && (
        <Card className="overflow-x-auto shadow-sm border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Course List</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell className="font-semibold">Course Code</TableCell>
                  <TableCell className="font-semibold">Course Name</TableCell>
                  <TableCell className="font-semibold">Lecturer(s)</TableCell>
                  <TableCell className="font-semibold">Classes</TableCell>
                  <TableCell className="text-center font-semibold">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course.course_id}>
                    <TableCell>{course.course_code || "—"}</TableCell>
                    <TableCell>{course.course_name || "—"}</TableCell>
                    <TableCell>
                      {course.lecturers?.length
                        ? course.lecturers.map((l) => l.name).join(", ")
                        : "N/A"}
                    </TableCell>
                    <TableCell>{course.classes_count ?? 0}</TableCell>
                    <TableCell className="text-center">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-2 mx-auto"
                        onClick={() => openAssignModal(course)}
                      >
                        <UserPlus className="w-4 h-4" />
                        Assign Lecturer
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={addCourseOpen} onOpenChange={setAddCourseOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Course</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Course Name"
              value={newCourseName}
              onChange={(e) => setNewCourseName(e.target.value)}
            />
            <Input
              placeholder="Course Code"
              value={newCourseCode}
              onChange={(e) => setNewCourseCode(e.target.value)}
            />
            <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
              <SelectTrigger>
                <SelectValue placeholder="Select Faculty" />
              </SelectTrigger>
              <SelectContent>
                {faculties.map((f) => (
                  <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button onClick={handleAddCourse}>Add Course</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Lecturer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="font-semibold">{selectedCourse?.course_name}</p>
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger>
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedLecturerId} onValueChange={setSelectedLecturerId}>
              <SelectTrigger>
                <SelectValue placeholder="Select Lecturer" />
              </SelectTrigger>
              <SelectContent>
                {lecturers.map((l) => (
                  <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button onClick={handleAssignLecturer}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
