"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import SignInForm from "../../../components/forms/SignInForm";
import { SignInAction } from "@/app/actions/auth";

export default function SignIn() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [serverErrorMsg, setServerErrorMsg] = useState("");

  const handleLogIn = async (credentials) => {
    setIsLoading(true);
    setServerErrorMsg("");

    try {
      const result = await SignInAction(credentials);

      if (!result.success) {
        setServerErrorMsg(result.error);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setServerErrorMsg(
        "An unexpected connection error occured. Please try again later.",
      );
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-svh md:min-h-screen flex flex-col gap-6  items-center justify-center">
      <SignInForm
        onSubmit={handleLogIn}
        isLoading={isLoading}
        serverErrorMsg={serverErrorMsg}
      />
    </div>
  );
}
