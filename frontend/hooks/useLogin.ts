import { useState } from 'react';
import { useUserContext } from '@/contexts/UserContext';
import { log } from 'console';

export default function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setUser } = useUserContext();

  const login = async ({ email, password }: { email: string; password: string }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = await response.json();
      setUser({
        id: data.user.id,
        user_name: data.user.user_name,
        full_name: data.user.full_name,
        email: data.user.email,
        user_since: data.user.user_since,
        is_active: data.user.is_active,
        role: data.user.role,
      });
      return data;
      
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { login, error, loading };
}