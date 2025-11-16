import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import api from "@/services/api.js";

import { Bar, Pie } from "react-chartjs-2";
import Chart from "chart.js/auto";

export default function StudentRating() {
  const { token } = useAuth();

  const [classes, setClasses] = useState([]);
  const [myRatings, setMyRatings] = useState([]);
  const [form, setForm] = useState({
    classId: "",
    rating: "",
    comment: "",
  });

  const generateColors = (count) =>
    Array.from({ length: count }, (_, i) => `hsl(${(i * 72) % 360}, 70%, 55%)`);

  useEffect(() => {
    const loadClasses = async () => {
      try {
        const res = await api.get("/ratings/available-classes", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClasses(res.data);
      } catch (err) {
        console.error("Failed to fetch eligible classes", err);
      }
    };
    loadClasses();
  }, [token]);

  useEffect(() => {
    const loadRatings = async () => {
      try {
        const res = await api.get("/ratings/my", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMyRatings(res.data);
      } catch (err) {
        console.error("Failed to fetch ratings", err);
      }
    };
    loadRatings();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.classId || form.rating < 1 || form.rating > 5) {
      alert("Please choose a class & enter rating 1–5");
      return;
    }

    try {
      await api.post(
        "/ratings",
        {
          class_id: form.classId,
          rating: Number(form.rating),
          comment: form.comment,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Rating submitted!");
      setForm({ classId: "", rating: "", comment: "" });

      const updated = await api.get("/ratings/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyRatings(updated.data);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit rating");
      console.error(err);
    }
  };

  const ratingClasses = [...new Set(myRatings.map((r) => r.class_name))];
  const colors = generateColors(ratingClasses.length);

  const avgRatingPerClass = ratingClasses.map((cls) => {
    const entries = myRatings.filter((r) => r.class_name === cls);
    const total = entries.reduce((acc, r) => acc + r.rating, 0);
    return (total / entries.length).toFixed(2);
  });

  const ratingCounts = [1, 2, 3, 4, 5].map(
    (n) => myRatings.filter((r) => r.rating === n).length
  );

  const avgChart = {
    labels: ratingClasses,
    datasets: [
      {
        label: "Avg Rating",
        data: avgRatingPerClass,
        backgroundColor: colors,
        borderRadius: 6,
      },
    ],
  };

  const breakdownChart = {
    labels: ["1 ★", "2 ★", "3 ★", "4 ★", "5 ★"],
    datasets: [
      {
        data: ratingCounts,
        backgroundColor: generateColors(5),
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="p-6 space-y-10">
      <h2 className="text-3xl font-bold tracking-tight">Rate Your Lectures</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Average Rating per Class</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <Bar data={avgChart} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rating Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-72 flex items-center justify-center">
            <Pie data={breakdownChart} />
          </CardContent>
        </Card>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Submit a Rating</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select
              value={form.classId}
              onValueChange={(v) => setForm({ ...form, classId: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose Class" />
              </SelectTrigger>
              <SelectContent>
                {classes.length > 0 ? (
                  classes.map((cls) => (
                    <SelectItem
                      key={cls.class_id}
                      value={String(cls.class_id)}
                    >
                      {cls.course_name} – {cls.class_name} ({cls.course_code})
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-sm text-muted-foreground">
                    Nothing to rate yet
                  </div>
                )}
              </SelectContent>
            </Select>

            <Input
              type="number"
              min={1}
              max={5}
              placeholder="Rating (1–5)"
              value={form.rating}
              onChange={(e) =>
                setForm({ ...form, rating: e.target.value })
              }
            />

            <Textarea
              placeholder="Comment (optional)"
              value={form.comment}
              onChange={(e) =>
                setForm({ ...form, comment: e.target.value })
              }
            />

            <Button type="submit" className="w-full">
              Submit Rating
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Previous Ratings</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto border rounded-md max-h-[500px]">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-muted/40 sticky top-0 backdrop-blur-sm">
              <tr>
                <th className="p-2 border">Class</th>
                <th className="p-2 border">Course</th>
                <th className="p-2 border">Lecturer</th>
                <th className="p-2 border">Rating</th>
                <th className="p-2 border">Comment</th>
                <th className="p-2 border">Date</th>
              </tr>
            </thead>

            <tbody>
              {myRatings.map((r) => (
                <tr
                  key={r.id}
                  className="hover:bg-accent/10 transition"
                >
                  <td className="p-2 border">{r.class_name}</td>
                  <td className="p-2 border">{r.course_name}</td>
                  <td className="p-2 border">{r.lecturer_name}</td>
                  <td className="p-2 border font-semibold">
                    {r.rating} ★
                  </td>
                  <td className="p-2 border">{r.comment || "-"}</td>
                  <td className="p-2 border">
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
