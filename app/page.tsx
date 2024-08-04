import { Button, Input } from "@nextui-org/react";
import AppWelcomeForm from "@/components/AppWelcomeForm";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <h1>WELCOME!</h1>
        <AppWelcomeForm />
    </main>
  );
}
