import { useEffect, useState } from "react"
import api from "@/lib/api"
import MonitoringCard from "../components/MonitoringCard"
import AttendanceAnalytics from "./AttendanceAnalytics"

export default function MonitoringDashboard() {
  const [stats, setStats] = useState({
    totalClasses: 0,
    avgAttendance: 0,
    lowAttendanceCount: 0,
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/monitoring/stats")
        setStats(res.data)
      } catch (err) {
        console.error("Error fetching monitoring stats:", err)
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Monitoring Dashboard</h1>

      <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <MonitoringCard />
            </div>
          </div>
      </div>

      <AttendanceAnalytics />
    </div>
  )
}
