"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await signIn("credentials", {
      email,
      password,
      callbackUrl: "/dashboard",
    });
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <div className="relative hidden items-center justify-center overflow-hidden lg:flex lg:w-1/2 bg-[hsl(var(--navy))]">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute left-10 top-20 h-64 w-64 rounded-full bg-[hsl(var(--olive))] blur-3xl" />
          <div className="absolute bottom-20 right-10 h-48 w-48 rounded-full bg-primary blur-3xl" />
          <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[hsl(var(--sage))] blur-3xl" />
        </div>
        <div className="relative z-10 max-w-md px-12 text-center">
          <h1 className="font-display text-5xl tracking-wide text-primary-foreground">
            itergo
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-primary-foreground/70">
            From the first "let&apos;s go" to the last photo.
          </p>
          <div className="mt-12 flex items-center justify-center gap-4 text-sm text-primary-foreground/40">
            <span>Dream</span>
            <span>•</span>
            <span>Execute</span>
            <span>•</span>
            <span>Travel</span>
            <span>•</span>
            <span>Momento</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center lg:hidden">
            <h1 className="font-display text-3xl tracking-wide text-foreground">itergo</h1>
            <p className="mt-1 text-sm text-muted-foreground">Plan trips that become stories</p>
          </div>

          <h2 className="font-display text-2xl text-foreground">Welcome back</h2>
          <p className="mb-8 mt-1 text-sm text-muted-foreground">Sign in to continue your journey</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs text-muted-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-11 w-full rounded-lg border border-border bg-card pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs text-muted-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 w-full rounded-lg border border-border bg-card pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input type="checkbox" className="h-4 w-4 rounded border-border accent-primary" />
                Remember me
              </label>
              <button type="button" className="text-xs text-primary hover:underline">
                Forgot password?
              </button>
            </div>

            <Button type="submit" className="h-11 w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-3 text-muted-foreground">or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-11"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            >
              Google
            </Button>
            <Button
              variant="outline"
              className="h-11"
              onClick={() => window.alert("Apple sign in is coming soon.")}
            >
              Apple
            </Button>
          </div>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
