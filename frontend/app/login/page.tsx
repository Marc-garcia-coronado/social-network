"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import useLogin from "@/hooks/useLogin";
import { redirect } from "next/navigation";

export default function Login() {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const { login, error, loading } = useLogin();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const result = await login({ email: formData.email, password: formData.password });
        if (result) {
          redirect("/")
        }
    };

    return (
        <div className="h-screen w-full flex items-center justify-center bg-gray-100 text-black ">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <Label htmlFor="email" className="dark:text-black">Email</Label>
                        <Input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <Label htmlFor="password" className="dark:text-black">Password</Label>
                        <Input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>
                    {error && <p className="text-red-500">{error}</p>}
                    <Button type="submit" disabled={loading}>
                        {loading ? "Loading..." : "Login"}
                    </Button>
                </form>
            </div>
        </div>
    );
}