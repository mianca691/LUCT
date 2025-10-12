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
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-50 p-6">
      <img src="/logo.jpg" alt="logo" className="w-64 mb-6" />

      <Card className="w-[400px] shadow-lg border border-gray-200">
        <CardHeader>
          <h2 className="text-xl font-semibold text-center text-gray-700">
            Login
          </h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <Input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <Input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Demo Credentials Section */}
          <div className="mt-6 border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-700 text-center mb-2">
              Demo Credentials
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
              {demoAccounts.map((acc) => (
                <div
                  key={acc.role}
                  className="p-2 border rounded-lg bg-gray-50 hover:bg-gray-100 transition"
                >
                  <p className="font-semibold">{acc.role}</p>
                  <p>Email: <span className="font-mono">{acc.email}</span></p>
                  <p>Password: <span className="font-mono">{acc.password}</span></p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
