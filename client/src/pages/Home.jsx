import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const features = [
  {
    title: "Submit Reports",
    description: "Easily submit lecture reports with all details captured automatically.",
    icon: "📝",
  },
  {
    title: "Track Students",
    description: "Monitor student attendance and participation across classes.",
    icon: "👩‍🎓",
  },
  {
    title: "Feedback & Rating",
    description: "Receive feedback from Principal Lecturers and rate lectures for improvement.",
    icon: "⭐",
  },
  {
    title: "Manage Courses",
    description: "Program Leaders can assign lectures and manage all courses seamlessly.",
    icon: "📚",
  },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-400 text-slate-900 flex flex-col">
      <section className="flex flex-col md:flex-row items-center justify-between px-6 md:px-24 py-20">
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="md:w-1/2 space-y-6"
        >
          <img 
          src="/logo.jpg"
          alt="logo" 
          className="w-120"
          />
          <h1 className="text-5xl font-extrabold tracking-tight">
            LUCT Faculty Portal
          </h1>
          <p className="text-slate-900 text-lg">
            Simplify lecture reporting, student monitoring, and feedback management.
          </p>
          <div className="flex gap-4 mt-6">
            <Button
              onClick={() => navigate("/login")}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Login
            </Button>
            <Button
              onClick={() => navigate("/register")}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Register
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="md:w-1/2 mt-12 md:mt-0 flex justify-center"
        >
          <img
            src="/Paduka.png"
            alt="Illustration"
            className="w-80 md:w-full"
          />
        </motion.div>
      </section>

      <section className="px-6 md:px-24 py-16 bg-neutral-100 text-slate-900 rounded-t-3xl">
        <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="bg-slate-600 text-white p-6 rounded-xl shadow-lg flex flex-col items-center text-center transition-all duration-300"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-200">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="mt-auto py-6 text-center text-slate-900">
        &copy; {new Date().getFullYear()} LUCT Faculty Portal. All rights reserved.
      </footer>
    </div>
  );
}
