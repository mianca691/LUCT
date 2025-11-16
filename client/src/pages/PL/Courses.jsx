import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-8">
        <p>{error}</p>
        <Button onClick={fetchCourses} variant="outline" className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Courses Management</h1>
          <p className="text-gray-400 text-sm mt-1">
            Add courses, assign lecturers, and view course overview.
          </p>
        </div>
        <Button
          className="flex items-center gap-2"
          onClick={() => setAddCourseOpen(true)}
        >
          <Plus className="w-4 h-4" /> Add Course
        </Button>
      </div>

      {/* Courses Grid */}
      {courses.length === 0 ? (
        <Card className="max-w-3xl mx-auto p-6 text-center text-gray-500">
          No courses found for your program.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card
              key={course.course_id}
              className="bg-card text-card-foreground shadow hover:shadow-lg transition"
            >
              <CardHeader className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-bold">{course.course_code}</h2>
                  <p className="text-sm text-gray-400">{course.course_name}</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">
                  <span className="font-semibold">Lecturer(s): </span>
                  {course.lecturers?.length
                    ? course.lecturers.map((l) => l.name).join(", ")
                    : "N/A"}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Classes: </span>
                  {course.classes_count ?? 0}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Total Students: </span>
                  {course.total_students ?? 0}
                </p>
                <div className="w-full mt-2">
                  <span className="font-semibold text-sm">Average Attendance:</span>
                  <div className="w-full bg-gray-700 rounded h-4 relative mt-1">
                    <div
                      className="bg-primary h-4 rounded"
                      style={{
                        width: `${course.avg_attendance ?? 0}%`,
                        transition: "width 0.3s",
                      }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                      {Math.round(course.avg_attendance ?? 0)}%
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardContent className="flex justify-end gap-2 pt-0">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => openAssignModal(course)}
                >
                  <UserPlus className="w-4 h-4" />
                  Assign Lecturer
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Course Modal */}
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
                  <SelectItem key={f.id} value={f.id}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button onClick={handleAddCourse}>Add Course</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Lecturer Modal */}
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
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedLecturerId} onValueChange={setSelectedLecturerId}>
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
          </div>
          <DialogFooter>
            <Button onClick={handleAssignLecturer}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
