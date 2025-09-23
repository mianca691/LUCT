import { useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import api from "@/lib/api";
import { setAuth } from "@/lib/auth";

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = async (formData) => {
    try {
      // Map formData to backend expected fields
      const payload = {
        username: formData.username, // changed from email
        password: formData.password,
      };

      const res = await api.post("/auth/login", payload);
      const { token, user } = res.data;
      setAuth(token, user);

      // Redirect by role
      switch (user.role_name) { // changed from user.role
        case "student":
          navigate("/student/monitoring");
          break;
        case "lecturer":
          navigate("/lecturer/reports");
          break;
        case "prl":
          navigate("/prl/courses");
          break;
        case "pl":
          navigate("/pl/courses");
          break;
        default:
          navigate("/");
      }
    } catch (err) {
      console.error(err);
      alert("Login failed. Please check your credentials.");
    }
  };

  return <AuthForm type="login" onSubmit={handleLogin} />;
}
