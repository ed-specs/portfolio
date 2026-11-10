"use client";
import { useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import ValidationBanner from "../ui/ValidationBanner";
import Link from "next/link";

export default function SignInForm({
  onSubmit,
  isLoading = false,
  serverErrorMsg = "",
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [clientErrorMsg, setClientErrorMsg] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setClientErrorMsg("");

    if (!email.trim()) {
      setClientErrorMsg("Email is required.");
      return;
    }

    if (!email.includes("@")) {
      setClientErrorMsg("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setClientErrorMsg("Password is required.");
      return;
    }

    onSubmit({ email, password });
  };

  const activeErrorMsg = clientErrorMsg || serverErrorMsg;

  return (
    <div className="flex flex-col gap-6 w-full md:max-w-sm p-5">
      {/* validation banner */}
      {activeErrorMsg && <ValidationBanner message={activeErrorMsg} />}

      {/* logo */}
      <div className="flex flex-col">
        <span className=" text-gray-500">Welcome back,</span>
        <h1 className="text-2xl font-bold tracking-tight">Edward Gatbonton</h1>
      </div>

      <span className="text-gray-500 text-sm">Sign in to your account.</span>

      {/* sign in form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Input
          id="email"
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          id="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div className="flex flex-col gap-2 mt-3 w-full">
          <Button type="submit" isLoading={isLoading}>
            Sign In
          </Button>
          <Link
            href={isLoading ? "#" : "/forgot-password"}
            className={`bg-gray-300/90 hover:bg-gray-300/80 transition-colors duration-300 px-3 py-2 md:text-sm rounded-lg flex items-center justify-center gap-3 ${
              isLoading
                ? "pointer-events-none opacity-50 cursor-not-allowed"
                : "cursor-pointer"
            }`}
          >
            Forgot password
          </Link>
        </div>
      </form>
    </div>
  );
}
