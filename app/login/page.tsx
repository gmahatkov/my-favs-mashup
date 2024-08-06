import { Button } from "@nextui-org/react";
import { signIn, auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
    const session = await auth();
    if (session?.user) {
        return redirect("/dashboard");
    }
    return (
        <section className={'p-24'}>
            <h1 className={'text-2xl text-center mb-4'}>Sign in</h1>
            <p className={'text-center'}>Before using the application you need to sign in with your Spotify account.</p>
            <form
                action={async () => {
                    "use server"
                    await signIn("spotify")
                }}
                className={'my-10 flex'}
            >
                <Button type="submit" className={'m-auto'}>Sign in with Spotify</Button>
            </form>
        </section>
    )
}