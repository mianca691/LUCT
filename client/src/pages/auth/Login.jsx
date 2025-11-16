import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      alert(err.message || "Invalid credentials");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { role: "Program Leader", email: "kapela@ac.ls", password: "Y3S$!RSKi" },
    { role: "Principal Lecturer", email: "mpotla@ac.ls", password: "G04t3d" },
    { role: "Lecturer", email: "thokoane@ac.ls", password: "W3b+des!gn" },
    { role: "Student", email: "whizz75@gmail.com", password: "N!GG4-!M-G04T3D" },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
      <img
        src="/logo.jpg"
        alt="LUCT Logo"
        className="w-40 sm:w-52 md:w-64 rounded-md shadow-sm mb-6"
      />

      <Card className="w-full max-w-md shadow-lg border border-border bg-card text-foreground rounded-xl">
        <CardHeader>
          <h2 className="text-2xl font-bold text-center text-primary mb-4">
            Login
          </h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col space-y-1">
              <label htmlFor="email" className="font-medium">
                Email
              </label>
              <Input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                className="border border-muted focus:border-primary focus:ring-primary"
                required
              />
            </div>

            <div className="flex flex-col space-y-1">
              <label htmlFor="password" className="font-medium">
                Password
              </label>
              <Input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                className="border mb-5 border-muted focus:border-primary focus:ring-primary"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground transition"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
