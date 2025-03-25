import { useState } from 'react';

export default function useLogin() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
            });

            if (!response.ok) {
                throw new Error("Login failed");
            }

            const data = await response.json();
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