import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="flex flex-col items-center gap-6">
        <img src="/logo.jpg" 
        alt="logo" 
        className="w-64" 
        />
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-lg shadow-md w-full max-w-md space-y-4"
        >
          <h2 className="text-2xl font-bold text-center mb-4">Register</h2>
          <label htmlFor="name">Full Name</label>
          <Input
            placeholder="Full Name"
            name="name"
            value={form.name}
            onChange={handleChange}
          />
          <label htmlFor="email">Email</label>
          <Input
            placeholder="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
          />
          <label htmlFor="password">Password</label>
          <Input
            placeholder="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
          />
          <label htmlFor="role">Role</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          >
            <option value="student">Student</option>
            <option value="lecturer">Lecturer</option>
            <option value="prl">PRL</option>
            <option value="pl">PL</option>
          </select>
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
}
