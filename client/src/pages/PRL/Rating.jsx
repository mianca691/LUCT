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
import {
  Loader2,
  ChevronDown,
  ChevronRight,
  Star,
  Star as StarOutline,
} from "lucide-react";
import api from "@/services/api.js";

// Render stars for rating
function renderStars(rating) {
  const stars = [];
  const rounded = Math.round(rating);
  for (let i = 1; i <= 5; i++) {
    stars.push(
      i <= rounded ? (
        <Star key={i} className="w-4 h-4 text-yellow-400 inline" />
      ) : (
        <StarOutline key={i} className="w-4 h-4 text-muted-foreground inline" />
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

  // Fetch ratings from API
  const fetchRatings = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/prl/rating");
      const data = res.data;

      // Group by class
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
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={fetchRatings}>Retry</Button>
      </div>
    );
  }

  const groupedEntries = Object.values(groupedRatings);

  if (groupedEntries.length === 0) {
    return (
      <Card className="max-w-3xl mx-auto p-6 text-center text-muted-foreground">
        No ratings available yet.
      </Card>
    );
  }

  return (
    <div className="p-10 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Ratings & Feedback
        </h1>
        <p className="text-muted-foreground mt-1">
          View average and individual ratings by class.
        </p>
      </div>

      {/* Ratings Table */}
      <Card className="bg-card border border-border shadow-sm">
        <CardHeader>
          <CardTitle>Ratings Overview</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="bg-secondary text-secondary-foreground">
                <TableCell className="w-10"></TableCell>
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
                    {/* Class Row */}
                    <TableRow
                      className="cursor-pointer hover:bg-primary/10 transition-all"
                      onClick={() => toggleExpand(group.class_id)}
                    >
                      <TableCell className="text-center">
                        {expanded[group.class_id] ? (
                          <ChevronDown className="w-4 h-4 text-primary mx-auto" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-primary mx-auto" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        {group.class_name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {group.course_name} ({group.course_code})
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {group.lecturer_name || "-"}
                      </TableCell>
                      <TableCell>{renderStars(avgRating)}</TableCell>
                    </TableRow>

                    {/* Expanded Section */}
                    {expanded[group.class_id] && (
                      <>
                        <TableRow className="bg-muted/20 text-sm text-muted-foreground">
                          <TableCell />
                          <TableCell>Student</TableCell>
                          <TableCell>Rating</TableCell>
                          <TableCell colSpan={2}>Comment</TableCell>
                        </TableRow>

                        {group.ratings.map((r) => (
                          <TableRow
                            key={r.id}
                            className="bg-muted/10 text-sm text-foreground hover:bg-muted/30 transition"
                          >
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
