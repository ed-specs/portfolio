"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import SignInForm from "../../../components/forms/SignInForm";
import SignInAction from "../../actions/auth";

export default function SignIn() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [serverErrorMsg, setServerErrorMsg] = useState("");

  const handleLogIn = async (formData) => {
    setIsLoading(true);
    setServerErrorMsg("");

    const result = SignInAction(formData);

    if (result.error) {
      setServerErrorMsg(result.error);
      setIsLoading(false);
      return;
    }

    router.push("/dashboard");
  };
  return (
    <div className="min-h-svh md:min-h-screen flex flex-col gap-6  items-center justify-center">
      <SignInForm />
    </div>
  );
}
