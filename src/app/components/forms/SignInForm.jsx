"use client";
import { useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import ValidationBanner from "../ui/ValidationBanner";
import Link from "next/link";

export default function SignInForm() {
  return (
    <div className="flex flex-col gap-6 w-full md:max-w-sm p-5">
      {/* validation banner */}
      {/* <ValidationBanner message="Incorrect email or password." /> */}
      {/* logo */}
      <div className="flex flex-col">
        <span className=" text-gray-500">Welcome back,</span>
        <h1 className="text-2xl font-bold tracking-tight">Edward Gatbonton</h1>
      </div>

      <span className="text-gray-500 text-sm">Sign in to your account.</span>

      {/* sign in form */}
      <form action="" className="flex flex-col gap-3">
        <Input
          label="Email"
          placeholder="Enter your email"
          type="email"
          required
        />
        <Input
          label="Password"
          placeholder="Enter your password"
          type="password"
          required
        />
        <div className="flex flex-col gap-2 mt-3 w-full">
          <Button type="submit">Sign In</Button>
          <Link
            href="/forgot-password"
            className="bg-gray-300/90 hover:bg-gray-300/80 transition-colors duration-300 px-3 py-2 md:text-sm rounded-lg flex items-center justify-center gap-3 cursor-pointer disabled:cursor-not-allowed disabled:opacity-80"
          >
            Forgot password
          </Link>
        </div>
      </form>
    </div>
  );
}
