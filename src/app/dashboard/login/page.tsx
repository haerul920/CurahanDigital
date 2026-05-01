"use client";

import * as React from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldCheck, Mail, Lock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
// import { toast } from 'sonner';

export default function DashboardLogin() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState(""); // Not using password for email code flow usually, but prompt asked for Email/Pass + OTP.
  // Actually, standard MFA flow is: 1. Login (Email/Pass) 2. MFA Challenge (OTP).
  // Let's implement that flow.

  const [code, setCode] = React.useState("");
  const [verifying, setVerifying] = React.useState(false);
  const [step, setStep] = React.useState<"credentials" | "otp">("credentials");
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-nature-50">
        <Loader2 className="w-8 h-8 animate-spin text-nature-900" />
      </div>
    );
  }

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true);

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "needs_second_factor") {
        setStep("otp");
      } else if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
      } else {
        console.error("Login status:", result.status);
      }
    } catch (err: any) {
      console.error("Error:", err.errors?.[0]?.message);
      alert(err.errors?.[0]?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setVerifying(true);

    try {
      const result = await signIn.attemptSecondFactor({
        strategy: "email_code",
        code,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
      } else {
        console.error(result);
        alert("Verification failed");
      }
    } catch (err: any) {
      console.error("Error:", err.errors?.[0]?.message);
      alert(err.errors?.[0]?.message || "Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex flex-col justify-center items-center bg-nature-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat" />
        <div className="relative z-10 text-center px-12">
          <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <ShieldCheck className="w-10 h-10 text-nature-200" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
            CurahanDigital Admin
          </h1>
          <p className="text-nature-200 text-lg max-w-md mx-auto leading-relaxed">
            Secure access for moderation and platform management. Authorized
            personnel only.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex items-center justify-center p-8 bg-nature-50 dark:bg-black">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold tracking-tight text-nature-900 dark:text-nature-100">
              {step === "credentials"
                ? "Welcome back"
                : "Two-Factor Authentication"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {step === "credentials"
                ? "Enter your credentials to access the dashboard."
                : "We sent a verification code to your email."}
            </p>
          </div>

          {step === "credentials" ? (
            <form onSubmit={handleCredentialsSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@curahandigital.com"
                      className="pl-10 bg-white dark:bg-black/20"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 bg-white dark:bg-black/20"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-nature-900 hover:bg-nature-800"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <div className="relative">
                  <CheckCircle2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="code"
                    type="text"
                    placeholder="123456"
                    className="pl-10 bg-white dark:bg-black/20 tracking-widest"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-nature-900 hover:bg-nature-800"
                disabled={verifying}
              >
                {verifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify Code
              </Button>
              <button
                type="button"
                onClick={() => setStep("credentials")}
                className="w-full text-sm text-nature-600 hover:underline"
              >
                Back to Login
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
