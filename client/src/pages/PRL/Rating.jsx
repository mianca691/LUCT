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
import { Loader2, ChevronDown, ChevronRight, Star, Star as StarOutline } from "lucide-react";
import api from "@/services/api.js";

function renderStars(rating) {
  const stars = [];
  const rounded = Math.round(rating);
  for (let i = 1; i <= 5; i++) {
    stars.push(
      i <= rounded ? (
        <Star key={i} className="w-4 h-4 text-yellow-400 inline" />
      ) : (
        <StarOutline key={i} className="w-4 h-4 text-gray-300 inline" />
      )
    );
  }
  return <div className="inline-flex">{stars}</div>;
}

export default function PRLRating() {
  const [ratings, setRatings] = useState([]);
  const [groupedRatings, setGroupedRatings] = useState({});
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRatings = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/prl/rating");
      const data = res.data;

      const grouped = data.reduce((acc, r) => {
        if (!acc[r.class_id]) {
          acc[r.class_id] = {
            class_id: r.class_id,
            class_name: r.class_name,
            course_name: r.course_name,
            course_code: r.course_code,
            lecturer_name: r.lecturer_name,
            ratings: [],
          };
        }
        acc[r.class_id].ratings.push(r);
        return acc;
      }, {});

      setRatings(data);
      setGroupedRatings(grouped);
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

  const toggleExpand = (classId) => {
    setExpanded((prev) => ({ ...prev, [classId]: !prev[classId] }));
  };

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
        <Button onClick={fetchRatings}>Retry</Button>
      </div>
    );
  }

  const groupedEntries = Object.values(groupedRatings);

  if (groupedEntries.length === 0) {
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
        <p className="text-gray-500">View average and individual ratings by class.</p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Ratings Overview</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell />
                <TableCell>Class</TableCell>
                <TableCell>Course</TableCell>
                <TableCell>Lecturer</TableCell>
                <TableCell>Average Rating</TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {groupedEntries.map((group) => {
                const avgRating =
                  group.ratings.reduce((sum, r) => sum + Number(r.rating), 0) /
                  group.ratings.length;

                return (
                  <React.Fragment key={group.class_id}>
                    <TableRow
                      className="cursor-pointer hover:bg-gray-50 transition"
                      onClick={() => toggleExpand(group.class_id)}
                    >
                      <TableCell className="w-8 text-center">
                        {expanded[group.class_id] ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {group.class_name}
                      </TableCell>
                      <TableCell>
                        {group.course_name} ({group.course_code})
                      </TableCell>
                      <TableCell>{group.lecturer_name || "-"}</TableCell>
                      <TableCell>{renderStars(avgRating)}</TableCell>
                    </TableRow>
                    {expanded[group.class_id] && (
                      <>
                        <TableRow className="bg-gray-100 text-gray-700 text-sm">
                          <TableCell />
                          <TableCell>Student</TableCell>
                          <TableCell colSpan={1}>Rating</TableCell>
                          <TableCell colSpan={2}>Comment</TableCell>
                        </TableRow>
                        {group.ratings.map((r) => (
                          <TableRow key={r.id} className="text-sm">
                            <TableCell />
                            <TableCell>{r.student_name || "-"}</TableCell>
                            <TableCell>{renderStars(r.rating)}</TableCell>
                            <TableCell colSpan={2}>
                              {r.comment || "-"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
