import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import api from "@/services/api.js";
import { Star, StarHalf, Star as StarOutline } from "lucide-react";

function renderStars(rating) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) stars.push(<Star key={i} className="w-4 h-4 text-yellow-400 inline" />);
    else stars.push(<StarOutline key={i} className="w-4 h-4 text-gray-300 inline" />);
  }
  return stars;
}

export default function PRLRating() {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRatings = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/prl/rating");
      setRatings(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load ratings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRatings();
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
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchRatings} >
          Retry
        </Button>
      </div>
    );
  }

  if (ratings.length === 0) {
    return (
      <Card className="max-w-3xl mx-auto p-6 text-center text-gray-500">
        No ratings available yet.
      </Card>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Ratings & Feedback</h1>
        <p className="text-gray-500">
          View student ratings and feedback for all classes under your stream.
        </p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Ratings Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Class</TableCell>
                  <TableCell>Course</TableCell>
                  <TableCell>Lecturer</TableCell>
                  <TableCell>Student</TableCell>
                  <TableCell>Rating</TableCell>
                  <TableCell>Comment</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ratings.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.class_name}</TableCell>
                    <TableCell>
                      {r.course_name} ({r.course_code})
                    </TableCell>
                    <TableCell>{r.lecturer_name || "-"}</TableCell>
                    <TableCell>{r.student_name || "-"}</TableCell>
                    <TableCell>{renderStars(r.rating)}</TableCell>
                    <TableCell>{r.comment || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
