// hooks/useCurrentUser.js
import { useState, useEffect } from "react";
import { getCurrentUser } from "@/lib/endpoints/users";

export function useCurrentUser() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getCurrentUser();
        setUser(data);
      } catch (err) {
        console.error("Failed to fetch user info:", err);
      }
    })();
  }, []);

  return { user };
}
