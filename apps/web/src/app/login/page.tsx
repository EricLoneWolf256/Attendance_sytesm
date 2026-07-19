"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const userData = await login(email, password);
      const role = userData?.role;
      if (role === "ADMIN") router.push("/admin/dashboard");
      else if (role === "LECTURER") router.push("/lecturer/dashboard");
      else router.push("/student/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 font-bold text-sm">
              UGM
            </div>
            <span className="text-lg font-semibold">AttendEase</span>
          </div>
          <div>
            <h1 className="text-4xl font-bold leading-tight">
              Smart attendance
              <br />
              for smart universities
            </h1>
            <p className="mt-4 text-slate-400 text-lg max-w-md">
              QR code-based tracking with enrollment verification. Fast, secure, and fraud-proof.
            </p>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              99.9% uptime
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              1,200+ students
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              64 courses
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
            <p className="mt-1 text-sm text-slate-500">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@ugm.ac.ug"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <Button type="submit" className="w-full h-11 bg-slate-900 hover:bg-slate-800" disabled={isLoading}>
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-8 rounded-lg bg-slate-50 border border-slate-200 p-4">
            <p className="text-xs font-medium text-slate-500 mb-2">Demo Credentials</p>
            <div className="space-y-1 text-xs text-slate-600">
              <p><span className="font-medium">Admin:</span> admin@ugm.ac.ug</p>
              <p><span className="font-medium">Lecturer:</span> lecturer@ugm.ac.ug</p>
              <p><span className="font-medium">Student:</span> student1@ugm.ac.ug</p>
              <p className="text-slate-400 mt-1">Password: password123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
