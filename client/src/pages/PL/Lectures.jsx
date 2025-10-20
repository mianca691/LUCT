import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Loader2 } from "lucide-react";
import api from "@/services/api.js";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function Lecturers() {
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedLecturer, setSelectedLecturer] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const fetchLecturers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/pl/lecturer-details");
      setLecturers(res.data);
    } catch (err) {
      console.error("Error fetching lecturers:", err);
      setError("Failed to load lecturers.");
    } finally {
      setLoading(false);
    }
  };

  const openDetails = (lecturer) => {
    setSelectedLecturer(lecturer);
    setDetailsOpen(true);
  };

  useEffect(() => {
    fetchLecturers();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Lecturers</h1>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {!loading && error && (
        <div className="text-center text-red-500 p-8">{error}</div>
      )}

      {!loading && !error && lecturers.length === 0 && (
        <Card className="p-6 text-center text-gray-500">
          No lecturers found.
        </Card>
      )}

      {!loading && !error && lecturers.length > 0 && (
        <Card className="overflow-x-auto shadow-sm border">
          <CardHeader>
            <CardTitle>All Lecturers</CardTitle>
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
                {lecturers.map((lecturer) => (
                  <TableRow key={lecturer.id}>
                    <TableCell>{lecturer.name}</TableCell>
                    <TableCell>{lecturer.email}</TableCell>
                    <TableCell>{lecturer.faculty_name || "N/A"}</TableCell>
                    <TableCell>{lecturer.courses_count ?? 0}</TableCell>
                    <TableCell>{lecturer.classes_count ?? 0}</TableCell>
                    <TableCell>{lecturer.rating ?? "Not Yet Rated"}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => openDetails(lecturer)}>
                        <Eye className="w-4 h-4" /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lecturer Details</DialogTitle>
          </DialogHeader>
          <CardContent className="space-y-4">
            {selectedLecturer && (
              <>
                <p><strong>Name:</strong> {selectedLecturer.name}</p>
                <p><strong>Email:</strong> {selectedLecturer.email}</p>
                <p><strong>Faculty:</strong> {selectedLecturer.faculty_name || "N/A"}</p>
                <p><strong>Courses Assigned:</strong> {selectedLecturer.courses_count ?? 0}</p>
                <p><strong>Classes Assigned:</strong> {selectedLecturer.classes_count ?? 0}</p>
                <p><strong>Average Rating:</strong> {selectedLecturer.rating ?? "Not Yet Rated"}</p>

                <div className="space-y-2">
                  <p className="font-semibold">Courses:</p>
                  <ul className="list-disc list-inside">
                    {selectedLecturer.courses?.map(c => (
                      <li key={c.id}>{c.name}</li>
                    )) || <li>—</li>}
                  </ul>
                </div>

                <div className="space-y-2">
                  <p className="font-semibold">Classes:</p>
                  <ul className="list-disc list-inside">
                    {selectedLecturer.classes?.map(cl => (
                      <li key={cl.id}>{cl.name}</li>
                    )) || <li>—</li>}
                  </ul>
                </div>
              </>
            )}
          </CardContent>
          <DialogFooter>
            <Button onClick={() => setDetailsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
