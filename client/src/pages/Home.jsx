import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const features = [
  {
    title: "Submit Reports",
    description: "Capture lecture details easily and keep records automatically.",
    icon: "📝",
    color: "bg-gradient-to-r from-indigo-500 to-purple-500"
  },
  {
    title: "Track Students",
    description: "Monitor attendance, participation, and performance in real-time.",
    icon: "👩‍🎓",
    color: "bg-gradient-to-r from-green-400 to-teal-500"
  },
  {
    title: "Feedback & Rating",
    description: "Receive PRL feedback and rate lectures for continuous improvement.",
    icon: "⭐",
    color: "bg-gradient-to-r from-yellow-400 to-orange-500"
  },
  {
    title: "Manage Courses",
    description: "Program Leaders can assign, manage, and oversee all courses effortlessly.",
    icon: "📚",
    color: "bg-gradient-to-r from-pink-500 to-red-500"
  },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900 flex flex-col">
      
      <section className="relative flex flex-col md:flex-row items-center justify-between px-6 md:px-24 py-24">
        <motion.div
          initial={{ x: -120, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="md:w-1/2 space-y-6"
        >
          <img 
            src="/logo.jpg"
            alt="LUCT Logo"
            className="w-40 md:w-60 rounded-lg shadow-lg"
          />
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            LUCT Faculty Portal
          </h1>
          <p className="text-lg md:text-xl text-slate-700">
            Empowering lecturers and students with intuitive reporting, monitoring, and feedback tools. Experience the future of education management.
          </p>
          <div className="flex gap-4 mt-6">
            <Button
              onClick={() => navigate("/login")}
              className="bg-indigo-600 text-white hover:bg-indigo-700 px-6 py-3 rounded-lg shadow-lg"
            >
              Login
            </Button>
            <Button
              onClick={() => navigate("/register")}
              className="bg-white text-indigo-600 border border-indigo-600 hover:bg-indigo-50 px-6 py-3 rounded-lg shadow-lg"
            >
              Register
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ x: 120, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="md:w-1/2 mt-12 md:mt-0 flex justify-center"
        >
          <img
            src="/campus.png"
            alt="Illustration"
            className="w-80 md:w-full rounded-xl shadow-xl"
          />
        </motion.div>
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-gradient-to-r from-indigo-300 via-purple-400 to-pink-400 rounded-full opacity-30 animate-pulse-slow"></div>
        <div className="absolute -bottom-32 -right-24 w-96 h-96 bg-gradient-to-r from-green-300 via-teal-400 to-blue-400 rounded-full opacity-20 animate-pulse-slow"></div>
      </section>

      <section className="px-6 md:px-24 py-24 bg-slate-50">
        <h2 className="text-4xl font-extrabold text-center text-slate-900 mb-16">
          Key Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ type: "spring", stiffness: 200 }}
              className={`${feature.color} text-white p-8 rounded-3xl shadow-2xl flex flex-col items-center text-center`}
            >
              <div className="text-6xl mb-6">{feature.icon}</div>
              <h3 className="text-2xl font-bold mb-2">{feature.title}</h3>
              <p className="text-white/90 text-base">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="px-6 md:px-24 py-24 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-6xl text-center text-white">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
          Ready to Transform Your Faculty Experience?
        </h2>
        <p className="text-lg md:text-xl mb-8">
          Join LUCT Faculty Portal today and make lecture reporting, monitoring, and feedback effortless.
        </p>
        <Button
          onClick={() => navigate("/register")}
          className="bg-white text-indigo-700 hover:bg-white/90 px-10 py-4 rounded-xl text-lg font-semibold shadow-lg"
        >
          Get Started
        </Button>
      </section>

      <footer className="mt-auto py-8 bg-slate-100 text-center text-slate-700 font-medium">
        &copy; {new Date().getFullYear()} Limkokwing University of Creative Technology. All Rights Reserved.
      </footer>
    </div>
  );
}
