import React, { useEffect, useState, useMemo } from "react";
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
import { Eye, Loader2 } from "lucide-react";
import api from "@/services/api.js";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

export default function Lecturers() {
  const [lecturers, setLecturers] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedLecturer, setSelectedLecturer] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // We store selected value as a faculty NAME (string). 'all' = show all
  const [selectedFacultyName, setSelectedFacultyName] = useState("all");

  // Fetch both lecturers + faculties
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [lecturerRes, facultyRes] = await Promise.all([
        api.get("/pl/lecturer-details"),
        api.get("/pl/faculties"),
      ]);

      setLecturers(lecturerRes.data || []);
      setFaculties(facultyRes.data || []);
    } catch (err) {
      console.error("Error fetching lecturers/faculties:", err);
      setError("Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Build a deduped faculty-name list (preserve sort by name)
  const uniqueFacultyNames = useMemo(() => {
    if (!Array.isArray(faculties)) return [];
    const names = faculties.map((f) => f?.name || "").filter(Boolean);
    // preserve order and remove duplicates
    return Array.from(new Set(names));
  }, [faculties]);

  // Filter lecturers by faculty name. If selectedFacultyName === 'all', show all.
  const filteredLecturers = useMemo(() => {
    if (!Array.isArray(lecturers)) return [];
    if (selectedFacultyName === "all") return lecturers;

    return lecturers.filter((l) => {
      // safety: compare lowercased trimmed names
      const lf = (l?.faculty_name || "").toString().trim().toLowerCase();
      return lf === selectedFacultyName.toString().trim().toLowerCase();
    });
  }, [lecturers, selectedFacultyName]);

  const openDetails = (lecturer) => {
    setSelectedLecturer(lecturer);
    setDetailsOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold">Lecturers</h1>
      </div>

      {/* FILTER BAR */}
      <Card className="p-4">
        <div className="flex items-center gap-6">
          <div className="w-72">
            <label className="text-sm font-medium block mb-1">Filter by Faculty</label>

            <Select value={selectedFacultyName} onValueChange={(v) => setSelectedFacultyName(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Faculty" />
              </SelectTrigger>

              <SelectContent>
                {/* Always a non-empty string value */}
                <SelectItem value="all">All Faculties</SelectItem>

                {uniqueFacultyNames.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* LOADING */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      )}

      {/* ERROR */}
      {!loading && error && (
        <Card className="p-6 text-center border-red-500 text-red-600">
          {error}
        </Card>
      )}

      {/* EMPTY */}
      {!loading && !error && filteredLecturers.length === 0 && (
        <Card className="p-8 text-center text-gray-500">
          No lecturers found for this filter.
        </Card>
      )}

      {/* TABLE */}
      {!loading && !error && filteredLecturers.length > 0 && (
        <Card className="overflow-x-auto shadow-sm border rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Showing {filteredLecturers.length} Lecturer{filteredLecturers.length !== 1 ? "s" : ""}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Faculty</TableCell>
                  <TableCell>Courses</TableCell>
                  <TableCell>Classes</TableCell>
                  <TableCell>Rating</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredLecturers.map((lecturer) => (
                  <TableRow key={lecturer.id}>
                    <TableCell>{lecturer.name}</TableCell>
                    <TableCell>{lecturer.email}</TableCell>
                    <TableCell>{lecturer.faculty_name || "N/A"}</TableCell>
                    <TableCell>{Number(lecturer.courses_count) || 0}</TableCell>
                    <TableCell>{Number(lecturer.classes_count) || 0}</TableCell>
                    <TableCell>{lecturer.rating ?? "Not Yet Rated"}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => openDetails(lecturer)}>
                        <Eye className="w-4 h-4 mr-1" /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* DETAILS MODAL */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Lecturer Details</DialogTitle>
          </DialogHeader>

          {selectedLecturer && (
            <div className="space-y-4 py-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold">Name</p>
                  <p>{selectedLecturer.name}</p>
                </div>

                <div>
                  <p className="font-semibold">Email</p>
                  <p>{selectedLecturer.email}</p>
                </div>

                <div>
                  <p className="font-semibold">Faculty</p>
                  <p>{selectedLecturer.faculty_name || "N/A"}</p>
                </div>

                <div>
                  <p className="font-semibold">Rating</p>
                  <p>{selectedLecturer.rating ?? "Not Yet Rated"}</p>
                </div>

                <div>
                  <p className="font-semibold">Courses Assigned</p>
                  <p>{Number(selectedLecturer.courses_count) || 0}</p>
                </div>

                <div>
                  <p className="font-semibold">Classes Assigned</p>
                  <p>{Number(selectedLecturer.classes_count) || 0}</p>
                </div>
              </div>

              <div>
                <p className="font-semibold mb-1">Courses:</p>
                <ul className="list-disc pl-5 space-y-1">
                  {(selectedLecturer.courses || []).map((c) => (
                    <li key={c.id}>{c.name}</li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="font-semibold mb-1">Classes:</p>
                <ul className="list-disc pl-5 space-y-1">
                  {(selectedLecturer.classes || []).map((cl) => (
                    <li key={cl.id}>{cl.name}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setDetailsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
