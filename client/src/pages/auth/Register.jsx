import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/services/api.js";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSelectChange = (value) => setForm({ ...form, role: value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/register", form);
      alert("Account created successfully!");
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert("Failed to register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="flex flex-col items-center gap-6">
        <img
          src="/logo.jpg"
          alt="LUCT Logo"
          className="w-40 sm:w-52 md:w-64 rounded-md shadow-sm"
        />

        <Card className="w-[400px] max-w-md bg-card text-foreground border border-border rounded-xl shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-primary">Register</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col space-y-1">
                <label htmlFor="name" className="font-medium">Full Name</label>
                <Input
                  placeholder="Full Name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="border border-muted focus:border-primary focus:ring-primary"
                />
              </div>

              <div className="flex flex-col space-y-1">
                <label htmlFor="email" className="font-medium">Email</label>
                <Input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                  className="border border-muted focus:border-primary focus:ring-primary"
                />
              </div>

              <div className="flex flex-col space-y-1">
                <label htmlFor="password" className="font-medium">Password</label>
                <Input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  className="border border-muted focus:border-primary focus:ring-primary"
                />
              </div>

              <div className="flex flex-col space-y-1">
                <label htmlFor="role" className="font-medium">Role</label>
                <Select value={form.role} onValueChange={handleSelectChange}>
                  <SelectTrigger className="w-full border border-muted focus:border-primary focus:ring-primary rounded-md bg-background text-foreground">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="lecturer">Lecturer</SelectItem>
                    <SelectItem value="prl">PRL</SelectItem>
                    <SelectItem value="pl">PL</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground transition"
                disabled={loading}
              >
                {loading ? "Registering..." : "Sign Up"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
