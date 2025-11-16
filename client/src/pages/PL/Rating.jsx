import React, { useEffect, useState } from "react";
import api from "@/services/api.js";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, X, Users, Star } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function Rating() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ratings, setRatings] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRating, setSelectedRating] = useState(null);

  // Fetch metrics
  const fetchMetrics = async () => {
    try {
      const res = await api.get("/pl/metrics");
      setMetrics(res.data);
    } catch {
      setError("Failed to load metrics");
    }
  };

  // Fetch ratings
  const fetchRatings = async () => {
    try {
      const res = await api.get("/pl");
      setRatings(res.data);
    } catch {
      setError("Failed to load ratings");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchMetrics(), fetchRatings()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filteredRatings = ratings.filter(r =>
    r.class_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.course_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.lecturer_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openRatingModal = (r) => setSelectedRating(r);
  const closeRatingModal = () => setSelectedRating(null);

  // Chart data
  const ratingsPerClass = ratings.reduce((acc, r) => {
    const found = acc.find(c => c.class_name === r.class_name);
    if (found) { found.total += r.rating ?? 0; found.count += 1; } 
    else { acc.push({ class_name: r.class_name, total: r.rating ?? 0, count: 1 }); }
    return acc;
  }, []).map(c => ({ ...c, avg: c.total / c.count }));

  const ratingsPerLecturer = ratings.reduce((acc, r) => {
    const found = acc.find(l => l.lecturer_name === r.lecturer_name);
    if (found) { found.total += r.rating ?? 0; found.count += 1; } 
    else { acc.push({ lecturer_name: r.lecturer_name, total: r.rating ?? 0, count: 1 }); }
    return acc;
  }, []).map(l => ({ ...l, avg: l.total / l.count }));

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(<Star key={i} className={`w-4 h-4 inline ${i <= rating ? "text-yellow-400" : "text-gray-300"}`} />);
    }
    return stars;
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );

  if (error)
    return (
      <div className="p-8 text-center text-red-500 space-y-4">
        <p>{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );

  return (
    <div className="p-6 space-y-8">
      {/* Title */}
      <h1 className="text-3xl font-extrabold text-primary">Rating Dashboard</h1>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-primary/10 hover:scale-105 transition-transform">
          <CardContent className="flex flex-col items-center justify-center space-y-2">
            <Star className="w-6 h-6 text-yellow-400" />
            <CardTitle className="text-sm uppercase text-muted-foreground">Total Ratings</CardTitle>
            <p className="text-2xl font-bold">{metrics.total_ratings ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-accent/10 hover:scale-105 transition-transform">
          <CardContent className="flex flex-col items-center justify-center space-y-2">
            <Star className="w-6 h-6 text-accent" />
            <CardTitle className="text-sm uppercase text-muted-foreground">Average Rating</CardTitle>
            <p className="text-2xl font-bold">{parseFloat(metrics.avg_rating ?? 0).toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="bg-secondary/10 hover:scale-105 transition-transform">
          <CardContent className="flex flex-col items-center justify-center space-y-2">
            <Users className="w-6 h-6 text-secondary" />
            <CardTitle className="text-sm uppercase text-muted-foreground">Total Lecturers</CardTitle>
            <p className="text-2xl font-bold">{metrics.total_lecturers ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-accent/10 hover:scale-105 transition-transform">
          <CardContent className="flex flex-col items-center justify-center space-y-2">
            <Users className="w-6 h-6 text-accent" />
            <CardTitle className="text-sm uppercase text-muted-foreground">Total Classes</CardTitle>
            <p className="text-2xl font-bold">{metrics.total_classes ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search Input */}
      <div className="max-w-md">
        <Input
          placeholder="Search by Class, Course, Lecturer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="rounded-lg shadow-sm"
        />
      </div>

      {/* Ratings Table */}
      <Card className="overflow-x-auto shadow-lg border border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Ratings List</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm table-auto border-collapse">
            <thead>
              <tr className="bg-muted/20 text-left">
                {["Class","Course","Lecturer","Rating","Comment","Action"].map((h) => (
                  <th key={h} className="p-2 border-b border-muted/30">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRatings.map((r) => (
                <tr
                  key={r.id}
                  className="hover:bg-muted/10 transition cursor-pointer"
                  onClick={() => openRatingModal(r)}
                >
                  <td className="p-2 border-b">{r.class_name}</td>
                  <td className="p-2 border-b">{r.course_name}</td>
                  <td className="p-2 border-b">{r.lecturer_name}</td>
                  <td className="p-2 border-b">{renderStars(r.rating ?? 0)}</td>
                  <td className="p-2 border-b" title={r.comment ?? "—"}>{r.comment?.slice(0,30) ?? "—"}</td>
                  <td className="p-2 border-b text-center">
                    <Button size="sm" variant="outline">View</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-4">
          <CardTitle className="text-lg font-semibold mb-2">Average Rating per Class</CardTitle>
          <CardContent style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ratingsPerClass}>
                <XAxis dataKey="class_name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="avg" name="Average Rating" fill="var(--color-primary)" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="p-4">
          <CardTitle className="text-lg font-semibold mb-2">Average Rating per Lecturer</CardTitle>
          <CardContent style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ratingsPerLecturer}>
                <XAxis dataKey="lecturer_name" />
                <YAxis />
                <Tooltip formatter={(value) => value.toFixed(2)} />
                <Legend />
                <Line type="monotone" dataKey="avg" stroke="var(--color-accent)" strokeWidth={3} dot={{ r: 5, fill: "var(--color-accent)" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Rating Modal */}
      {selectedRating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadeIn">
          <div className="bg-background w-full max-w-2xl rounded-xl shadow-lg p-6 relative border border-border">
            <button className="absolute top-3 right-3" onClick={closeRatingModal}>
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
            <h2 className="text-2xl font-bold mb-4">{selectedRating.class_name} - {selectedRating.lecturer_name}</h2>
            <div className="space-y-2">
              <p><strong>Course:</strong> {selectedRating.course_name}</p>
              <p><strong>Rating:</strong> {renderStars(selectedRating.rating ?? 0)}</p>
              <p><strong>Comment:</strong> {selectedRating.comment ?? "—"}</p>
              <p><strong>Date:</strong> {selectedRating.created_at ? new Date(selectedRating.created_at).toLocaleDateString() : "—"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
