"use client";
import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/Input";
import { Appbar } from "@/components/Appbar";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // New loading state
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard if user is already logged in
    
    if (session && status === "authenticated") {
      console.log("User is already logged in, redirecting to dashboard...");
      router.push("/dashboard");
    }
  }, [session, status, router]);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); // Set loading to true

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setLoading(false); // Set loading to false

    if (result?.error) {
      setError(result.error);
    } else {
      // Immediately redirect to the dashboard
      console.log("Email login successful, redirecting...");
      router.push("/dashboard");
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true); // Set loading to true

    const result = await signIn("google", { redirect: false });

    setLoading(false); // Set loading to false

    if (result?.error) {
      setError(result.error);
    } else {
      // Immediately redirect to the dashboard
      console.log("Google login successful, redirecting...");
      router.push("/dashboard");
    }
  };

  if (loading) {
    return <div>Loading...</div>; // Show loading state
  }

  return (
    <div><Appbar/>
    <div className="flex justify-center">
      <div className="flex pt-8 max-w-4xl">
        <div className="flex-1 pt-20 px-4">
          <div className="font-semibold text-3xl pb-4">
            Join millions worldwide who automate their work using Zapier.
          </div>
          {/* Other marketing content */}
        </div>
        <div className="flex-1 pt-6 pb-6 mt-12 px-4 border rounded">
          <Input
            onChange={(e) => setEmail(e.target.value)}
            label={"Email"}
            type="text"
            placeholder="Your Email"
          />
          <Input
            onChange={(e) => setPassword(e.target.value)}
            label={"Password"}
            type="password"
            placeholder="Password"
          />
          {error && <p className="text-red-500">{error}</p>}
          <div className="pt-4">
            <button onClick={handleEmailSignIn}>Login</button>
          </div>
          <div className="pt-4">
            <span>or</span>
          </div>
          <div className="pt-4">
            <button onClick={handleGoogleSignIn}>Sign in with Google</button>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
