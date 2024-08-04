"use client";

import { Button, Input } from "@nextui-org/react";
import {useState} from "react";

export default function AppWelcomeForm() {
    const [message, setMessage] = useState<string>("");
    const [value, setValue] = useState<string>("");

    async function welcomeAPI() {
        const response = await fetch("/api/hello", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ message: value }),
        });
        const data = await response.json();
        console.log(data);
        setMessage(data?.message ?? "---");
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <Input placeholder="Type something..."
                   value={value}
                   onValueChange={(v) => setValue(v)}
            />
            <Button onClick={welcomeAPI}>CLICK ME!</Button>
            <h2>{message}</h2>
        </main>
    );
}