"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SIGN_IN_BG = "/analog/auth/sign-in-bg.png";

export default function LoginPage() {
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
    <div className="auth-notepad">
      {/* Notepad frame image */}
      <img
        src={SIGN_IN_BG}
        alt=""
        className="auth-notepad-img"
        draggable={false}
      />

      {/* Form content — on the lined paper, shifted right */}
      <div className="auth-notepad-form-signin">
        <div className="text-center mb-1">
          <h1
            className="font-handwriting text-3xl leading-tight text-ink-dark md:text-4xl"
            style={{ WebkitTextStroke: "0.7px currentColor" }}
          >
            welcome back!
          </h1>
          <p className="font-handwriting text-lg text-ink-dark/80 md:text-xl"
            style={{ WebkitTextStroke: "0.3px currentColor" }}
          >
            sign in to your journal
          </p>
        </div>

        <Button
          variant="outline"
          className="mx-auto mb-1 h-7 w-fit border-dashed border-paper-kraft bg-transparent text-lg text-ink-dark hover:bg-paper-aged/50"
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        >
          <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </Button>

        <div className="relative my-1 flex items-center">
          <div className="flex-1 border-t border-dashed border-paper-kraft" />
          <span className="px-3 font-handwriting text-lg text-ink-dark/60"
            style={{ WebkitTextStroke: "0.3px currentColor" }}
          >or</span>
          <div className="flex-1 border-t border-dashed border-paper-kraft" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-1">
          <div>
            <Label htmlFor="email" className="font-handwriting text-lg text-ink-dark"
              style={{ WebkitTextStroke: "0.5px currentColor" }}
            >
              email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="h-6 rounded-none border-0 border-b border-paper-kraft/60 bg-transparent px-1 font-handwriting text-lg text-ink-dark placeholder:text-ink-dark/35 focus-visible:border-ink focus-visible:ring-0"
              style={{ WebkitTextStroke: "0.3px currentColor" }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="password" className="font-handwriting text-lg text-ink-dark"
              style={{ WebkitTextStroke: "0.5px currentColor" }}
            >
              password
            </Label>
            <Input
              id="password"
              type="password"
              className="h-6 rounded-none border-0 border-b border-paper-kraft/60 bg-transparent px-1 font-handwriting text-lg text-ink-dark placeholder:text-ink-dark/35 focus-visible:border-ink focus-visible:ring-0"
              style={{ WebkitTextStroke: "0.3px currentColor" }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button
            type="submit"
            className="mt-3 h-8 w-fit px-4 border-none kraft-paper font-handwriting text-lg text-ink-dark block mx-auto"
            style={{ WebkitTextStroke: "0.5px currentColor" }}
            disabled={loading}
          >
            {loading ? "signing in..." : "sign in"}
          </Button>
        </form>

        <p className="text-center font-handwriting text-base text-ink-dark/70 mt-3"
          style={{ WebkitTextStroke: "0.2px currentColor" }}
        >
          don&apos;t have an account?{" "}
          <Link href="/signup" className="text-ink-dark sketch-underline stroke-sketch">
            sign up
          </Link>

        </p>
      </div>
    </div>
  );
}
