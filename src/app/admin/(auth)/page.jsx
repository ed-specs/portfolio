"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import SignInForm from "../../../components/forms/SignInForm";
import { SignInAction } from "@/app/actions/auth";

export default function SignIn() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [serverErrorMsg, setServerErrorMsg] = useState("");

  const handleLogIn = async (formData) => {
    setIsLoading(true);
    setServerErrorMsg("");

    try {
      console.log("submitting credentials:", formData);
      const result = await SignInAction(formData);

      if (!result.success) {
        console.log(result.error);
        setServerErrorMsg(
          "An unexpected connection error occured. Please try again later.",
        );
        return;
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch (err) {
      console.log(err);
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
