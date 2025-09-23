import { useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import api from "@/lib/api";
import { setAuth } from "@/lib/auth";

export default function Register() {
  const navigate = useNavigate();

  const handleRegister = async (formData) => {
    try {
      // Map frontend fields → backend expectations
      const payload = {
        username: formData.username, // make sure AuthForm uses "username" field
        email: formData.email,
        password: formData.password,
      };

      const res = await api.post("/auth/register", payload);
      const { token, user } = res.data;
      setAuth(token, user);

      // Redirect by role
      if (user.role_name === "student") {
        navigate("/student/monitoring");
      } else if (user.role_name === "lecturer") {
        navigate("/lecturer/reports");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      alert("Registration failed. Please try again.");
    }
  };

  return <AuthForm type="register" onSubmit={handleRegister} />;
}
