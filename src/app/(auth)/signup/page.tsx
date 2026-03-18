"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        await signIn("credentials", {
          email,
          password,
          callbackUrl: "/dashboard",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <div className="relative hidden items-center justify-center overflow-hidden lg:flex lg:w-1/2 bg-[hsl(var(--navy))]">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute right-20 top-24 h-72 w-72 rounded-full bg-[hsl(var(--sage))] blur-3xl" />
          <div className="absolute bottom-24 left-20 h-56 w-56 rounded-full bg-primary blur-3xl" />
        </div>
        <div className="relative z-10 max-w-md px-12 text-center">
          <h1 className="font-display text-5xl tracking-wide text-primary-foreground">itergo</h1>
          <p className="mt-4 text-lg leading-relaxed text-primary-foreground/70">
            Start with a dream. End with a story.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4 text-left text-sm text-primary-foreground/60">
            <div>☁️ Dream</div>
            <div>🗺️ Execute</div>
            <div>🧭 Travel</div>
            <div>📖 Momento</div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center lg:hidden">
            <h1 className="font-display text-3xl tracking-wide text-foreground">itergo</h1>
            <p className="mt-1 text-sm text-muted-foreground">Plan trips that become stories</p>
          </div>

          <h2 className="font-display text-2xl text-foreground">Create your account</h2>
          <p className="mb-8 mt-1 text-sm text-muted-foreground">Start planning unforgettable trips</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs text-muted-foreground">Display name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="h-11 w-full rounded-lg border border-border bg-card pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>
            </div>

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
                  minLength={8}
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

          <Button type="submit" className="h-11 w-full" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
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
              onClick={() => window.alert("Apple sign up is coming soon.")}
            >
              Apple
            </Button>
          </div>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            By signing up, you agree to our terms.
          </p>
        </div>
      </div>
    </div>
  );
}
