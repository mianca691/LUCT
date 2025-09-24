// hooks/useStudentClassCount.js
import { useState, useEffect } from "react";
import { getStudentClassCount } from "@/lib/endpoints/classes";

export function useStudentClassCount(studentId) {
  const [count, setCount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;

    (async () => {
      try {
        const { data } = await getStudentClassCount(studentId);
        setCount(data.count);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [studentId]);

  return { count, loading };
}
