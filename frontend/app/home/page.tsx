"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { redirect } from "next/navigation";

export default function Home() {
    

    return (
        <div className="h-screen w-full flex items-center justify-center bg-gray-100 text-black ">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
                <div>
                    <h1>Hola</h1>
                </div>
            </div>
        </div>
    );
}