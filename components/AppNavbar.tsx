import {Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button} from "@nextui-org/react";
import { auth, signIn, signOut } from "@/auth";
import IconBrand from "@/components/icons/IconBrand";

export default async function AppNavbar() {
    const session = await auth();

    const drawButton = () => (
        session?.user
            ? (
                <Button type={'submit'}>Sign out</Button>
            )
            : (
                <Button type={'submit'}>Sign in</Button>
            )
    )

    return (
        <Navbar shouldHideOnScroll>
            <NavbarBrand>
                <IconBrand size={50} />
                <h4 className={'ml-2'}>My Fav Mashup</h4>
            </NavbarBrand>
            <NavbarContent justify={'end'}>
                <form
                    className={'contents'}
                    action={async () => {
                        "use server"
                        if (session?.user) {
                            await signOut()
                        } else {
                            await signIn("spotify")
                        }
                    }}
                >
                    { drawButton() }
                </form>
            </NavbarContent>
        </Navbar>
    )
}