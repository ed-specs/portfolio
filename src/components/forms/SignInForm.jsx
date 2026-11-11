"use client";
import { useState, useEffect } from "react";

import Button from "../ui/Button";
import Input from "../ui/Input";

export default function SignInForm({ onSubmit, isLoading = false, onError }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email.trim()) {
      onError("Email is required.");
      return;
    }

    if (!email.includes("@")) {
      onError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      onError("Password is required.");
      return;
    }

    onSubmit({ email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
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
      </div>
    </form>
  );
}
