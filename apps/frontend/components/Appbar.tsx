"use client";
import { useRouter } from "next/navigation";
import { LinkButton } from "./buttons/LinkButton";
import { PrimaryButton } from "./buttons/PrimaryButton";
import { signOut, useSession } from "next-auth/react";

export const Appbar = () => {
    const router = useRouter();
    const { data: session, status } = useSession();

    const handleSignOut = async () => {
        await signOut({ redirect: false }); // Call signOut without redirecting immediately
        router.push("/login"); // Redirect to the login page after signing out
    };

    return (
        <div className="flex border-b justify-between p-4">
            <div className="flex flex-col justify-center text-2xl font-extrabold">
                Zapier
            </div>
            <div className="flex">
                <div className="pr-4">
                    <LinkButton onClick={() => {}}>Contact Sales</LinkButton>
                </div>

                {status === "authenticated" ? (
                    // Show Sign Out button if authenticated
                    <button
                        className="py-2 px-10 cursor-pointer hover:shadow-md bg-amber-700 text-white rounded-full text-center flex justify-center flex-col"
                        onClick={handleSignOut}
                    >
                        Sign Out
                    </button>
                ) : (
                    // Show Login and Signup buttons if not authenticated
                    <>
                        <div className="pr-4">
                            <LinkButton onClick={() => router.push("/login")}>
                                Login
                            </LinkButton>
                        </div>
                        <PrimaryButton onClick={() => router.push("/signup")}>
                            Signup
                        </PrimaryButton>
                    </>
                )}
            </div>
        </div>
    );
};
